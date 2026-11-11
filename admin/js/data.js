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
  // теги завжди в нижньому регістрі й без повторів
  function uniqLower(list) { var out = []; (list || []).forEach(function (t) { t = A.tagKey(t); if (t && out.indexOf(t) < 0) out.push(t); }); return out; }
  function exclusive(list, rec, key) { if (rec && rec[key]) list.forEach(function (x) { if (x !== rec) x[key] = false; }); }
  function statusAct(from, to) { return to === 'pub' ? 'Опубліковано' : to === 'arch' ? 'Переміщено в архів' : (from === 'pub' ? 'Знято з публікації' : 'Змінено статус'); }

  // Застосувати зміну до копії даних і зберегти. Якщо дані в сховищі вже інші — не перезаписуємо.
  // Пакет змін: усі виправлення під час входу застосовуються до однієї копії і зберігаються одним запитом
  var batch = null;
  A.beginBatch = function () { batch = { D: clone(A.data), changed: false }; };
  A.endBatch = function () {
    var b = batch; batch = null;
    if (!b || !b.changed) return Promise.resolve(false);
    return A.commit(function (D) { Object.keys(D).forEach(function (k) { delete D[k]; }); Object.keys(b.D).forEach(function (k) { D[k] = b.D[k]; }); return true; });
  };
  A.commit = function (mutate) {
    if (batch) { var r0 = mutate(batch.D); if (r0 !== false) batch.changed = true; return Promise.resolve(r0); }
    if (A.stale) return Promise.reject({ code: 'conflict', message: 'Дані вже змінив хтось інший' });
    var D = clone(A.data);
    var res = mutate(D);
    if (res === false) return Promise.resolve(false);
    var pend = A.pendingThumbs; if (pend && Object.keys(pend).length) D.thumbs = Object.assign({}, D.thumbs || {}, pend);
    A.busy = true;
    return S.save(D, A.rev).then(function (rev) {
      A.busy = false; A.data = D; A.rev = rev; if (pend) A.pendingThumbs = null; return res;
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
        // нові учасники — в кінець (порядок створення), інші записи — нагору списку
        if (!r) { r = { id: id }; if (['members', 'partners', 'cases'].indexOf(entity) >= 0) L.push(r); else L.unshift(r); created = true; }
        var old = clone(r);
        Object.keys(rec).forEach(function (k) { r[k] = rec[k]; });
        if (status) r.status = status;
        r.changed = A.now();
        if (created) log(D, label || nameOf(r), SEC[entity], r.status === 'pub' ? 'Створено й опубліковано' : 'Створено', '', A.STATUS[r.status]);
        else if (old.status !== r.status) log(D, label || nameOf(r), SEC[entity], statusAct(old.status, r.status), A.STATUS[old.status], A.STATUS[r.status]);
        else log(D, label || nameOf(r), SEC[entity], 'Відредаговано');
        if (entity === 'news') {
          exclusive(L, r, 'featured');
          r.tags = uniqLower(r.tags);
          r.tags.forEach(function (t) { if (D.tags.indexOf(t) < 0 && (D.tagsDeleted || []).indexOf(t) < 0) D.tags.push(t); });
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
        to = A.tagKey(to); if (!to) return false;
        if (!from) { if (D.tags.indexOf(to) < 0) D.tags.push(to); log(D, to, SEC.tags, 'Створено'); return to; }
        if (from === to) return false;
        var i = D.tags.indexOf(from); if (i >= 0) D.tags[i] = to; else D.tags.push(to);
        D.tags = uniqLower(D.tags);
        D.news.forEach(function (n) { n.tags = uniqLower((n.tags || []).map(function (t) { return t === from ? to : t; })); });
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
    // видалення тегів: тег зникає з довідника і з підказок, але лишається в новинах, де вже стоїть.
    // Назву запамʼятовуємо, щоб тег не можна було додати знову (лише відновити в розділі Теги).
    tagDelete: function (names) {
      return A.commit(function (D) {
        D.tagsDeleted = D.tagsDeleted || []; var n = 0;
        names.forEach(function (t) {
          var i = D.tags.indexOf(t); if (i < 0) return;
          D.tags.splice(i, 1); if (D.tagsDeleted.indexOf(t) < 0) D.tagsDeleted.push(t); n++;
          var used = D.news.filter(function (x) { return (x.tags || []).indexOf(t) >= 0; }).length;
          log(D, t, SEC.tags, 'Видалено', '', used ? 'лишився в новинах: ' + used : '');
        });
        return n ? n : false;
      });
    },
    tagRestore: function (name) {
      return A.commit(function (D) {
        name = A.tagKey(name); D.tagsDeleted = (D.tagsDeleted || []).filter(function (t) { return t !== name; });
        if (D.tags.indexOf(name) < 0) D.tags.push(name);
        log(D, name, SEC.tags, 'Відновлено'); return name;
      });
    },
    // ручний порядок учасників однієї групи: ids — новий порядок; інші групи лишаються на своїх місцях
    // entity — members (за групою), partners або cases (увесь список); group = null для всього списку
    reorder: function (group, ids, label, entity) {
      entity = entity || 'members';
      return A.commit(function (D) {
        var slots = [], rec = {}, L = D[entity];
        L.forEach(function (m, i) { if (group == null || m.group === group) { slots.push(i); rec[m.id] = m; } });
        if (ids.length !== slots.length) return false;
        var same = ids.every(function (id, k) { return L[slots[k]].id === id; }); if (same) return false;
        ids.forEach(function (id, k) { L[slots[k]] = rec[id]; });
        log(D, label || group || SEC[entity], SEC[entity], 'Змінено порядок');
        return true;
      });
    },
    // видалення учасників: запис ховається з адмінки і сайту, але імʼя лишається в старих новинах;
    // додати його в нові новини не можна, відновити — створивши учасника з тим самим імʼям
    memberDelete: function (ids) {
      return A.commit(function (D) {
        D.membersDeleted = D.membersDeleted || []; var n = 0;
        D.members = D.members.filter(function (m) {
          if (ids.indexOf(m.id) < 0) return true;
          var used = D.news.filter(function (x) { return (x.people || []).indexOf(m.id) >= 0; }).length;
          D.membersDeleted.push(Object.assign({}, m, { deleted: A.now() }));
          log(D, m.name, SEC.members, 'Видалено', A.STATUS[m.status] || '', used ? 'лишився в новинах: ' + used : ''); n++;
          return false;
        });
        return n ? n : false;
      });
    },
    // партнери: як учасники — назва лишається в старих новинах і кейсах, вибрати в нових не можна
    partnerDelete: function (ids) {
      return A.commit(function (D) {
        D.partnersDeleted = D.partnersDeleted || []; var n = 0;
        D.partners = D.partners.filter(function (p) {
          if (ids.indexOf(p.id) < 0) return true;
          var used = D.news.filter(function (x) { return x.partner === p.id; }).length + D.cases.filter(function (x) { return x.partner === p.id; }).length;
          D.partnersDeleted.push(Object.assign({}, p, { deleted: A.now() }));
          log(D, p.name, SEC.partners, 'Видалено', A.STATUS[p.status] || '', used ? 'лишився в новинах і кейсах: ' + used : ''); n++;
          return false;
        });
        return n ? n : false;
      });
    },
    partnerRestore: function (id) {
      return A.commit(function (D) {
        var L = D.partnersDeleted || [], p = L.find(function (x) { return x.id === id; }); if (!p) return false;
        D.partnersDeleted = L.filter(function (x) { return x !== p; });
        delete p.deleted; p.status = 'draft'; p.changed = A.now(); D.partners.push(p);
        log(D, p.name, SEC.partners, 'Відновлено', '', A.STATUS.draft); return p.id;
      });
    },
    memberRestore: function (id) {
      return A.commit(function (D) {
        var L = D.membersDeleted || [], m = L.find(function (x) { return x.id === id; }); if (!m) return false;
        D.membersDeleted = L.filter(function (x) { return x !== m; });
        delete m.deleted; m.status = 'draft'; m.changed = A.now(); D.members.push(m);
        log(D, m.name, SEC.members, 'Відновлено', '', A.STATUS.draft); return m.id;
      });
    },
    // повне видалення записів (у прототипі; на робочому сайті — мʼяке видалення, див. BRD)
    remove: function (entity, ids) {
      return A.commit(function (D) {
        var L = D[entity], n = 0;
        D[entity] = L.filter(function (r) {
          if (ids.indexOf(r.id) < 0) return true;
          log(D, nameOf(r), SEC[entity], 'Видалено', A.STATUS[r.status] || '', ''); n++;
          return false;
        });
        return n ? n : false;
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

  /* ---------- разові виправлення даних після оновлення адмінки ----------
     Кожне виправлення перевіряє, чи воно ще потрібне, тому повторний вхід нічого не змінює. */
  A.applyDataFixes = function () {
    var D0 = A.data, need = false;
    var lowerOk = function (L) { return (L || []).every(function (t) { return t === A.tagKey(t); }) && uniqLower(L).length === (L || []).length; };
    if (!lowerOk(D0.tags) || (D0.news || []).some(function (n) { return !lowerOk(n.tags); })) need = true;
    Object.keys(D0).forEach(function (k) { if (Array.isArray(D0[k]) && D0[k].some(function (r) { return r && r.status === 'arch'; })) need = true; });
    if ((D0.news || []).some(function (n) { return n.point && !A.isPoint(n.point); })) need = true;
    var P0 = D0.partners || [], isPid = function (v) { return !v || P0.concat(D0.partnersDeleted || []).some(function (p) { return p.id === v; }); };
    if (P0.some(function (p) { return (p.status === 'pub' && p.perm !== true) || !String(p.role || '').trim(); })) need = true;
    if ((D0.news || []).concat(D0.cases || []).some(function (x) { return !isPid(x.partner); })) need = true;
    if (!need) return Promise.resolve(0);
    return A.commit(function (D) {
      var n = 0;
      // 1. теги в нижній регістр, однакові зливаються
      var before = (D.tags || []).join('|');
      D.tags = uniqLower(D.tags);
      D.tagsDeleted = uniqLower(D.tagsDeleted);
      (D.news || []).forEach(function (x) { var b = (x.tags || []).join('|'); x.tags = uniqLower(x.tags); x.tags.forEach(function (t) { if (D.tags.indexOf(t) < 0 && D.tagsDeleted.indexOf(t) < 0) D.tags.push(t); }); if (b !== x.tags.join('|')) n++; });
      if (before !== D.tags.join('|')) { log(D, 'Усі теги', SEC.tags, 'Переведено в нижній регістр', before.split('|').join(', '), D.tags.join(', ')); n++; }
      // 2. архіву більше немає: архівні записи стають чернетками
      Object.keys(D).forEach(function (k) {
        if (!Array.isArray(D[k]) || k === 'log' || k === 'tags') return;
        D[k].forEach(function (r) { if (r && r.status === 'arch') { r.status = 'draft'; r.changed = A.now(); log(D, nameOf(r), SEC[k] || k, 'Архів скасовано: переведено в чернетку', A.STATUS.arch, A.STATUS.draft); n++; } });
      });
      // 4. партнери: дозвіл на логотип для вже опублікованих (вони є на нинішньому сайті), заглушка ролі
      (D.partners || []).forEach(function (p) {
        if (p.status === 'pub' && p.perm !== true) { p.perm = true; log(D, p.name, SEC.partners, 'Позначено дозвіл на логотип (партнер уже на сайті)', 'Ні', 'Так'); n++; }
        else if (p.perm !== true) p.perm = false;
        if (!String(p.role || '').trim()) { p.role = '[Partner role]'; n++; }
      });
      // 5. партнер у новинах і кейсах — посилання на картку партнера, а не текст
      var allP = (D.partners || []).concat(D.partnersDeleted || []);
      (D.news || []).concat(D.cases || []).forEach(function (x) {
        if (!x.partner || allP.some(function (p) { return p.id === x.partner; })) return;
        var hit = allP.find(function (p) { return p.name.toLowerCase() === String(x.partner).trim().toLowerCase(); });
        x.partner = hit ? hit.id : ''; n++;
      });
      // 3. старі точки «на малюнку» не є координатами
      (D.news || []).forEach(function (x) { if (x.point && !A.isPoint(x.point)) { x.point = null; log(D, nameOf(x), SEC.news, 'Скинуто точку на карті (нова карта)'); n++; } });
      return n;
    });
  };

  // Зменшує великі фото до 1600 px перед завантаженням
  // Мініатюра для списків адмінки (480 px). Лише для Dropbox: у локальному режимі фото і так у браузері
  A.thumbFor = function (file, url) {
    if (S.mode !== 'dropbox' || !/^image\/(jpeg|png|webp)$/.test(file.type)) return Promise.resolve(null);
    return A.shrink(file, 480).then(function (b) { return S.uploadImage(b, 'thumb-' + (file.name || 'photo')); }).then(function (t) { A.pendingThumbs = A.pendingThumbs || {}; A.pendingThumbs[url] = t; return t; }, function () { return null; });
  };
  A.shrink = function (file, maxSide) {
    return new Promise(function (resolve) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { resolve(file); return; }
      var url = URL.createObjectURL(file); var im = new Image();
      im.onload = function () {
        try {
          var k = Math.min(1, (maxSide || 1600) / Math.max(im.naturalWidth, im.naturalHeight));
          if (k >= 1 && file.size < (maxSide ? 200000 : 900000)) { URL.revokeObjectURL(url); resolve(file); return; }
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
