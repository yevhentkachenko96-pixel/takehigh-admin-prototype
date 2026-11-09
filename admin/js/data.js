/* Дані адмінки: завантаження зі сховища, зміни, журнал змін */
(function () {
  'use strict';
  var A = window.A;
  var S = window.THStorage;
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  A.data = null;
  A.rev = null;
  A.stale = false;

  var SEC = { news: 'Новини', tags: 'Теги', events: 'Події', films: 'Фільми', results: 'Результати', members: 'Учасники', partners: 'Партнери', cases: 'Кейси', products: 'Merch', collections: 'Merch', pages: 'Сторінки', legal: 'Юридичні сторінки', settings: 'Загальні налаштування' };
  A.SEC = SEC;

  A.load = function () {
    return S.load().then(function (res) {
      if (res.data) { A.data = res.data; A.rev = res.rev; return { seeded: false }; }
      // Файлу даних ще немає: створюємо його з початкового контенту (тексти вайрфрейму)
      var d = clone(window.TH_DEFAULT);
      return S.save(d, null).then(function (rev) { A.data = d; A.rev = rev; return { seeded: true }; });
    });
  };

  // Нові дані з іншої вкладки чи пристрою
  S.watch(function (data, rev) {
    if (A.busy) return;
    A.data = data; A.rev = rev; A.stale = false;
    if (A.onExternal) A.onExternal();
  });

  function log(D, rec, sec, act, from, to) {
    D.log = D.log || [];
    D.log.unshift({ iso: A.today(), when: A.now(), who: A.user || 'Адміністратор', rec: rec || '—', sec: sec, act: act, from: from || '', to: to || '' });
    if (D.log.length > 500) D.log.length = 500;
  }
  var nameOf = function (r) { return r ? (r.title || r.name || r.id) : '—'; };
  function exclusive(list, rec, key) { if (rec && rec[key]) list.forEach(function (x) { if (x !== rec) x[key] = false; }); }
  function statusAct(from, to) { return to === 'pub' ? 'Опубліковано' : to === 'arch' ? 'Переміщено в архів' : (from === 'pub' ? 'Знято з публікації' : 'Змінено статус'); }

  // Застосувати зміну до копії даних і зберегти. Якщо дані в сховищі вже інші — не перезаписуємо.
  A.commit = function (mutate) {
    if (A.stale) return Promise.reject({ code: 'conflict', message: 'Дані вже змінив хтось інший' });
    var D = clone(A.data);
    var res = mutate(D);
    if (res === false) return Promise.resolve(false);
    A.busy = true;
    return S.save(D, A.rev).then(function (rev) {
      A.busy = false; A.data = D; A.rev = rev; return res;
    }, function (e) {
      A.busy = false;
      if (e && e.code === 'conflict') { A.stale = true; if (A.onStale) A.onStale(); }
      throw e;
    });
  };

  A.ops = {
    // створити або оновити запис
    save: function (entity, id, rec, status, label) {
      return A.commit(function (D) {
        var L = D[entity]; var r = L.find(function (x) { return x.id === id; }); var created = false;
        if (!r) { r = { id: id }; L.unshift(r); created = true; }
        var old = clone(r);
        Object.keys(rec).forEach(function (k) { r[k] = rec[k]; });
        if (status) r.status = status;
        r.changed = A.now();
        if (created) log(D, label || nameOf(r), SEC[entity], r.status === 'pub' ? 'Створено й опубліковано' : 'Створено', '', A.STATUS[r.status]);
        else if (old.status !== r.status) log(D, label || nameOf(r), SEC[entity], statusAct(old.status, r.status), A.STATUS[old.status], A.STATUS[r.status]);
        else log(D, label || nameOf(r), SEC[entity], 'Відредаговано');
        if (entity === 'news') {
          exclusive(L, r, 'featured');
          (r.tags || []).forEach(function (t) { if (!D.tags.some(function (x) { return x.toLowerCase() === t.toLowerCase(); })) D.tags.push(t); });
        }
        return r;
      });
    },
    // статус / «головна» для кількох записів одразу
    patch: function (entity, changes) {
      return A.commit(function (D) {
        var L = D[entity]; var n = 0;
        changes.forEach(function (c) {
          var r = L.find(function (x) { return x.id === c.id; }); if (!r) return;
          if (c.status && c.status !== r.status) {
            log(D, nameOf(r), SEC[entity], statusAct(r.status, c.status), A.STATUS[r.status], A.STATUS[c.status]);
            r.status = c.status; r.changed = A.now(); n++;
            if (c.status !== 'pub' && r.featured) r.featured = false;
          }
          if (typeof c.featured === 'boolean' && c.featured !== !!r.featured) {
            r.featured = c.featured; r.changed = A.now(); n++;
            if (c.featured) { exclusive(L, r, 'featured'); log(D, nameOf(r), SEC[entity], 'Зроблено головною', 'Ні', 'Так'); }
          }
        });
        return n ? n : false;
      });
    },
    // новий тег або перейменування (у всіх новинах)
    tag: function (from, to) {
      return A.commit(function (D) {
        to = String(to || '').trim(); if (!to) return false;
        if (!from) { D.tags.push(to); log(D, to, SEC.tags, 'Створено'); return to; }
        if (from === to) return false;
        var i = D.tags.indexOf(from); if (i >= 0) D.tags[i] = to; else D.tags.push(to);
        D.news.forEach(function (n) { n.tags = (n.tags || []).map(function (t) { return t === from ? to : t; }); });
        log(D, to, SEC.tags, 'Перейменовано', from, to);
        return to;
      });
    },
    // тексти сторінок і блоків сайту
    page: function (page, rec, label) {
      return A.commit(function (D) {
        D.pages = D.pages || {}; var P = D.pages[page] = D.pages[page] || {};
        Object.keys(rec).forEach(function (k) { P[k] = rec[k]; });
        log(D, label || page, 'Сторінки', 'Відредаговано');
        return true;
      });
    },
    resetAll: function () {
      return A.commit(function (D) {
        var fresh = clone(window.TH_DEFAULT);
        Object.keys(D).forEach(function (k) { delete D[k]; });
        Object.keys(fresh).forEach(function (k) { D[k] = fresh[k]; });
        log(D, 'Усі дані', 'Загальні налаштування', 'Скинуто до початкових даних');
        return true;
      });
    }
  };

  /* ---------- перенесення фото вайрфрейму в Dropbox (один раз, при першому вході) ----------
     У стартових даних фото задані ключами (наприклад DSCF7054). Адмінка завантажує ці файли з сайту в Dropbox,
     отримує публічні посилання і записує їх у дані замість ключів. Якщо перервати — наступний вхід продовжить. */
  var PHOTO_FIELD = /(img|image|photo|portrait|logo|poster|frames|guide)/i;
  function walk(o, fn, key) {
    if (Array.isArray(o)) { o.forEach(function (v, i) { if (typeof v === 'string') { var r = fn(v, key); if (r !== undefined) o[i] = r; } else walk(v, fn, key); }); return; }
    if (!o || typeof o !== 'object') return;
    Object.keys(o).forEach(function (k) {
      var v = o[k];
      if (typeof v === 'string') { if (PHOTO_FIELD.test(k) && !/(author|caption|credit)$/i.test(k)) { var r = fn(v, k); if (r !== undefined) o[k] = r; } }
      else walk(v, fn, PHOTO_FIELD.test(k) ? k : key);
    });
  }
  A.photoKeysLeft = function () {
    var M = window.TH_PHOTOS || {}, found = {};
    walk(clone(A.data), function (v) { if (M[v]) found[v] = 1; }, '');
    return Object.keys(found);
  };
  A.migratePhotos = function (progress) {
    if (S.mode !== 'dropbox') return Promise.resolve({ done: 0, failed: [] });
    var M = window.TH_PHOTOS || {}, keys = A.photoKeysLeft(), map = {}, failed = [], i = 0;
    if (!keys.length) return Promise.resolve({ done: 0, failed: [] });
    function next() {
      if (i >= keys.length) return Promise.resolve();
      var k = keys[i++]; if (progress) progress(i, keys.length);
      var file = M[k], ext = file.split('.').pop();
      return fetch('../shared/' + file).then(function (r) { if (!r.ok) throw new Error('файл ' + file + ' не знайдено'); return r.blob(); })
        .then(function (b) { return S.uploadImage(b, 'wf-' + k + '.' + ext, true); })
        .then(function (url) { map[k] = url; }, function (e) { failed.push(k + ': ' + (e.message || e)); })
        .then(next);
    }
    return next().then(function () {
      if (!Object.keys(map).length) return { done: 0, failed: failed };
      return A.commit(function (D) {
        walk(D, function (v) { return map[v]; }, '');
        log(D, 'Фото вайрфрейму', 'Загальні налаштування', 'Перенесено в Dropbox: ' + Object.keys(map).length);
        return true;
      }).then(function () { return { done: Object.keys(map).length, failed: failed }; });
    });
  };

  /* ---------- правки копірайтингу для даних, які вже лежать у Dropbox ----------
     Застосовуються один раз і лише там, де текст ще стартовий: якщо його вже змінили в адмінці, не чіпаємо. */
  var COPY_UPDATES = [
    { entity: 'news', id: 'n3', field: 'deck', from: 'A short checklist from the technical lead on engines, sleds and spare parts.', to: 'Fuel, sleds, rescue gear and engine checks before the next swell.' },
    { entity: 'news', id: 'n4', field: 'deck', from: 'Where the film stands now and how we will share release information.', to: 'Where the film stands now and what the crew is shooting next.' },
    // Zodiak немає у фінальному списку партнерів (правки контенту) — знімаємо з публікації
    { entity: 'partners', id: 'p1', field: 'status', from: 'pub', to: 'draft', act: 'Знято з публікації (правки контенту)' }
  ];
  A.applyCopyUpdates = function () {
    var todo = COPY_UPDATES.filter(function (u) { var r = (A.data[u.entity] || []).find(function (x) { return x.id === u.id; }); return r && r[u.field] === u.from; });
    if (!todo.length) return Promise.resolve(0);
    return A.commit(function (D) {
      todo.forEach(function (u) {
        var r = D[u.entity].find(function (x) { return x.id === u.id; });
        if (r && r[u.field] === u.from) { r[u.field] = u.to; r.changed = A.now(); log(D, r.title || r.name || r.id, SEC[u.entity], u.act || 'Оновлено текст (правки копірайтингу)', u.field === 'status' ? A.STATUS[u.from] : u.from, u.field === 'status' ? A.STATUS[u.to] : u.to); }
      });
      return todo.length;
    });
  };

  // Зменшує великі фото до 1600 px перед завантаженням
  A.shrink = function (file) {
    return new Promise(function (resolve) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { resolve(file); return; }
      var url = URL.createObjectURL(file); var im = new Image();
      im.onload = function () {
        try {
          var k = Math.min(1, 1600 / Math.max(im.naturalWidth, im.naturalHeight));
          if (k >= 1 && file.size < 900000) { URL.revokeObjectURL(url); resolve(file); return; }
          var c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          var png = file.type === 'image/png';
          c.toBlob(function (b) { URL.revokeObjectURL(url); resolve(b || file); }, png ? 'image/png' : 'image/jpeg', 0.82);
        } catch (e) { URL.revokeObjectURL(url); resolve(file); }
      };
      im.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      im.src = url;
    });
  };
})();
