/* Картка запису: поля, перевірки, збереження.
   cfg: { title, back:{label,href}, status, softReq, meta, footer:'record'|'save', footMeta, sections:[{title,desc,fields}], onSave(vals,status) → Promise }
   Типи полів: text (prefix, slug, inputType), textarea, date, select, multi, map, photo, editor */
(function () {
  'use strict';
  var A = window.A, esc = A.esc, icon = A.icon;

  var TR = { а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'iu', я: 'ia', 'ʼ': '', "'": '' };
  A.slugify = function (s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split('').map(function (c) { return TR[c] !== undefined ? TR[c] : c; }).join('')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  };

  A.form = function (root, cfg) {
    var fields = [];
    cfg.sections.forEach(function (s) { s.fields.forEach(function (f) { fields.push(f); }); });
    var st = { vals: {}, photo: {}, q: {}, act: {}, open: null, tried: false, status: cfg.status || 'draft', title: cfg.title, meta: cfg.meta, warn: [], saving: false };
    fields.forEach(function (f) {
      st.vals[f.id] = f.value !== undefined ? JSON.parse(JSON.stringify(f.value)) : (f.type === 'multi' ? [] : (f.type === 'photo' || f.type === 'map' ? null : ''));
      if (f.type === 'map' && !A.isPoint(st.vals[f.id])) st.vals[f.id] = null;
      if (f.type === 'photo') {
        st.vals[f.id + '_author'] = (f.sub && f.sub.author) || '';
        st.vals[f.id + '_caption'] = (f.sub && f.sub.caption) || '';
        st.photo[f.id] = f.value ? { state: 'done', url: A.img(f.value), name: /^(https?:|data:)/.test(f.value) ? 'Завантажене фото' : f.value + '.jpg' } : { state: 'empty' };
      }
    });
    var byId = function (id) { return fields.find(function (f) { return f.id === id; }); };
    var val = function (f) { return st.vals[f.id]; };
    function isEmpty(f) {
      var x = val(f);
      if (f.type === 'photo') return !x;
      if (Array.isArray(x)) return x.length === 0;
      return x == null || String(x).trim() === '';
    }

    function errorsFor(mode) {
      var E = {}, W = {};
      fields.forEach(function (f) {
        var x = val(f);
        if (f.type === 'photo' && st.photo[f.id].state === 'error') { E[f.id] = st.photo[f.id].msg; return; }
        if (f.type === 'photo' && st.photo[f.id].state === 'up') { E[f.id] = 'Дочекайтеся завантаження фото'; return; }
        if (typeof x === 'string' && f.max && x.length > f.max) { E[f.id] = 'Не більше ' + f.max + ' символів'; return; }
        if (f.slug && x) {
          if (!/^[a-z0-9-]+$/.test(x)) { E[f.id] = 'Лише латиниця в нижньому регістрі, цифри і дефіс'; return; }
          if ((f.taken || []).indexOf(x) >= 0) { E[f.id] = 'Таке посилання вже є'; return; }
        }
        if (f.unique && x && f.unique(x)) { E[f.id] = f.uniqueMsg || 'Таке значення вже є'; return; }
        if (f.inputType === 'url' && x && !/^https?:\/\/\S+\.\S+/.test(x)) { E[f.id] = 'Неправильне посилання. Приклад: https://…'; return; }
        if (f.inputType === 'email' && x && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x)) { E[f.id] = 'Неправильний формат email'; return; }
        if (f.type === 'multi' && f.maxItems && x.length > f.maxItems) { E[f.id] = 'Не більше ' + f.maxItems; return; }
        if (mode !== 'publish') return;
        if (f.req && isEmpty(f)) { if (cfg.softReq) W[f.id] = 1; else E[f.id] = 'Обовʼязкове поле'; }
      });
      return { E: E, W: W };
    }

    function counter(f) {
      var x = val(f); if (!f.max || typeof x !== 'string') return '';
      return '<span class="counter' + (x.length > f.max ? ' over' : '') + '" id="cn-' + f.id + '" aria-live="polite">' + x.length + ' / ' + f.max + '</span>';
    }
    function below(f, err) {
      return '<div class="below" id="d-' + f.id + '">' + (err ? '<span class="err">' + icon('err', 'i-sm') + esc(err) + '</span>' : (f.hint ? '<span class="hint">' + esc(f.hint) + '</span>' : '')) + counter(f) + '</div>';
    }

    function fieldHtml(f, E) {
      var err = E[f.id], x = val(f), inv = err ? ' aria-invalid="true"' : '', dom = 'f-' + f.id, desc = ' aria-describedby="d-' + f.id + '"';
      var cls = 'field' + (f.half ? '' : ' span2') + (err ? ' is-invalid' : '');
      var h = '<div class="' + cls + '" id="fw-' + f.id + '">';
      h += '<label class="label" for="' + dom + '" id="l-' + f.id + '">' + esc(f.label) + (f.req ? '<span class="req" aria-hidden="true">*</span><span class="sr-only">(обовʼязкове)</span>' : '<span class="opt">необовʼязково</span>') + '</label>';
      if (f.type === 'text') {
        var inp = '<input class="input" id="' + dom + '" type="' + (f.inputType || 'text') + '" value="' + esc(x) + '" placeholder="' + esc(f.ph || '') + '"' + inv + desc + ' data-f="' + f.id + '">';
        h += f.prefix ? '<div class="prefix-wrap"><span class="prefix">' + esc(f.prefix) + '</span>' + inp + '</div>' : inp;
      } else if (f.type === 'textarea') {
        h += '<textarea class="textarea" id="' + dom + '" rows="' + (f.rows || 3) + '" placeholder="' + esc(f.ph || '') + '"' + inv + desc + ' data-f="' + f.id + '">' + esc(x) + '</textarea>';
      } else if (f.type === 'date') {
        h += '<input class="input" id="' + dom + '" type="date" value="' + esc(x) + '"' + inv + desc + ' data-f="' + f.id + '" style="max-width:240px">';
      } else if (f.type === 'select') {
        h += '<select class="select" id="' + dom + '"' + inv + desc + ' data-f="' + f.id + '"><option value="">' + esc(f.selPh || 'Оберіть…') + '</option>' +
          (f.options || []).map(function (o) { return '<option value="' + esc(o) + '"' + (o === x ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
      } else if (f.type === 'multi') {
        var q = st.q[f.id] || '', atMax = f.maxItems && x.length >= f.maxItems, open = st.open === f.id && !atMax;
        var items = open ? suggestItems(f) : [], act = Math.min(st.act[f.id] || 0, Math.max(items.length - 1, 0));
        h += '<div class="chips-box" data-box="' + f.id + '">' + x.map(function (c, i) {
          return '<span class="chip">' + esc(c) + '<button type="button" aria-label="Прибрати ' + esc(c) + '" data-act="chip-x" data-f="' + f.id + '" data-i="' + i + '">' + icon('x', 'i-sm') + '</button></span>';
        }).join('') +
          '<input class="chip-input" id="' + dom + '" type="text" value="' + esc(q) + '" placeholder="' + esc(atMax ? 'Досягнуто максимуму' : (f.ph || '')) + '"' + (atMax ? ' disabled' : '') + desc +
          ' autocomplete="off" data-multi="' + f.id + '" role="combobox" aria-autocomplete="list" aria-controls="sg-' + f.id + '" aria-expanded="' + open + '"' + (open && items.length ? ' aria-activedescendant="sg-' + f.id + '-' + act + '"' : '') + '>';
        if (open) {
          h += '<div class="suggest" id="sg-' + f.id + '" role="listbox" aria-label="Варіанти">' + items.map(function (it, i) {
            return '<button class="menu-item' + (it.isNew ? ' suggest-new' : '') + (i === act ? ' is-active' : '') + '" type="button" role="option" id="sg-' + f.id + '-' + i + '" aria-selected="' + (i === act) + '" tabindex="-1" data-act="' + (it.isNew ? 'chip-new' : 'chip-add') + '" data-f="' + f.id + '" data-v="' + esc(it.v) + '">' +
              (it.isNew ? icon('plus', 'i-sm') + esc((f.newText || 'Додати') + ' «' + it.v + '»') : esc(it.v)) + '</button>';
          }).join('') + (items.length ? '' : '<span class="menu-item muted">' + esc(emptyText(f)) + '</span>') + '</div>';
        }
        h += '</div>';
      } else if (f.type === 'map') {
        h += '<div class="map-slot" data-map-slot="' + f.id + '"></div>';
      } else if (f.type === 'photo') {
        var p = st.photo[f.id], acc = f.accept || 'image/jpeg,image/png,image/webp', fmt = f.fmt || 'JPG, PNG або WebP · до ' + (f.limit || 10) + ' МБ';
        var fileIn = function (lab, c) { return '<label class="btn btn-secondary btn-sm' + (c || '') + '">' + lab + '<input class="sr-only" id="' + dom + '" type="file" accept="' + acc + '" data-file="' + f.id + '"></label>'; };
        if (p.state === 'empty') h += '<div class="dz" data-drop="' + f.id + '"><div class="dz-ico">' + icon('up') + '</div><span class="dz-title">Перетягніть файл сюди</span><span class="hint" style="font-size:13px">' + esc(fmt) + '</span>' + fileIn('Обрати файл', ' dz-file') + '</div>';
        else if (p.state === 'up') h += '<div class="upl" aria-live="polite"><span class="thumb t2 upl-prev" aria-hidden="true"></span><div class="upl-body"><span class="upl-name">' + esc(p.name) + '</span><div class="bar" role="progressbar" aria-label="Завантаження файлу"><span style="width:60%"></span></div><span class="hint" style="font-size:12px">Завантаження…</span></div></div>';
        else if (p.state === 'done') h += '<div class="upl">' + (p.url ? '<img class="upl-prev" src="' + esc(p.url) + '" alt="Прев’ю: ' + esc(p.name) + '">' : '<span class="thumb t3 upl-prev" role="img" aria-label="Прев’ю фото"></span>') +
          '<div class="upl-body"><span class="upl-name">' + esc(p.name) + '</span><span class="hint" style="font-size:12px">' + esc(p.meta || 'Фото') + '</span><div class="upl-actions">' + fileIn('Замінити') +
          '<button class="btn btn-ghost btn-sm btn-danger-text" type="button" data-act="photo-x" data-f="' + f.id + '">Видалити</button></div></div></div>';
        else h += '<div class="upl upl-err"><div class="dz-ico" style="background:#fff;color:#B42318">' + icon('err') + '</div><div class="upl-body"><span class="upl-name">' + esc(p.name) + '</span><span class="hint" style="font-size:12px">' + esc(p.meta || '') + ' · не завантажено</span>' + (p.msg ? '<span class="err" role="alert">' + icon('err', 'i-sm') + esc(p.msg) + '</span>' : '') + '</div>' + fileIn('Обрати інший файл') + '</div>';
        h += '<div class="below" id="d-' + f.id + '">' + (err ? '<span class="err">' + icon('err', 'i-sm') + esc(err) + '</span>' : '') + '</div>';
        if (f.author !== false || f.caption) {
          h += '<div class="photo-sub">';
          if (f.author !== false) h += sub(f.id + '_author', 'Автор фото', 'Людина, яка зробила фото', 80);
          if (f.caption) h += sub(f.id + '_caption', f.caption, '', f.captionMax || 150);
          h += '</div>';
        }
        return h + '</div>';
      } else if (f.type === 'editor') {
        var tools = [['h2', 'H2', 'Заголовок'], ['b', 'B', 'Жирний'], ['i', 'I', 'Курсив'], ['ul', '•', 'Список'], ['link', 'URL', 'Посилання'], ['quote', '“ ”', 'Цитата']];
        h += '<div class="editor"><div class="toolbar" role="toolbar" aria-label="Форматування тексту">' + tools.map(function (t) {
          return '<button class="tb" type="button" aria-label="' + t[2] + '" data-act="tool" data-tool="' + t[0] + '" data-f="' + f.id + '"' + (t[0] === 'b' ? ' style="font-weight:700"' : t[0] === 'i' ? ' style="font-style:italic"' : '') + '>' + t[1] + '</button>';
        }).join('') + '</div><textarea id="' + dom + '" placeholder="' + esc(f.ph || '') + '"' + inv + desc + ' data-f="' + f.id + '">' + esc(x) + '</textarea></div>';
      }
      h += below(f, err);
      return h + '</div>';
    }
    function sub(id, label, ph, max) {
      var x = st.vals[id] || '';
      return '<div class="field"><label class="label" for="f-' + id + '" style="font-size:13px">' + esc(label) + '<span class="opt">необовʼязково</span></label>' +
        '<input class="input" id="f-' + id + '" type="text" value="' + esc(x) + '" placeholder="' + esc(ph) + '" data-sub="' + id + '" data-max="' + max + '">' +
        '<div class="below"><span class="counter' + (x.length > max ? ' over' : '') + '" id="cn-' + id + '">' + x.length + ' / ' + max + '</span></div></div>';
    }

    function render() {
      var a = document.activeElement, focusId = a && root.contains(a) ? a.id : null, selS = null, selE = null;
      try { if (focusId && a.selectionStart != null) { selS = a.selectionStart; selE = a.selectionEnd; } } catch (e) {}
      var R = st.tried ? errorsFor(st.tried) : { E: {}, W: {} }, E = R.E;
      var h = '<div style="display:flex;flex-direction:column;gap:20px;width:100%"><header class="page-head"><div class="head-left">';
      if (cfg.back) h += '<a class="crumb" href="' + esc(cfg.back.href) + '">' + icon('back', 'i-sm') + esc(cfg.back.label) + '</a>';
      h += '<div class="head-row"><h1>' + esc(st.title) + '</h1>' + (cfg.footer === 'save' ? '' : A.badge(st.status)) + '</div><span class="meta">' + esc(st.meta || '') + '</span></div></header><div class="form-wrap">';
      var bad = Object.keys(E);
      if (bad.length) h += '<div class="banner banner-err" role="alert">' + icon('err') + '<div><b>' + (st.tried === 'publish' && cfg.footer !== 'save' && st.status !== 'pub' ? 'Не вдалося опублікувати.' : 'Не вдалося зберегти.') + '</b> Перевірте поля: ' + esc(bad.map(function (id) { return byId(id).label; }).join(', ')) + '.</div></div>';
      if (st.warn.length) h += '<div class="banner banner-warn" role="status">' + icon('warn') + '<div><b>Збережено з незаповненими полями.</b> Для публікації на робочому сайті потрібно заповнити: ' + esc(st.warn.join(', ')) + '.</div></div>';
      if (A.stale) h += '<div class="banner banner-err" role="alert">' + icon('err') + '<div><b>Дані змінилися в іншому вікні.</b> Щоб не перезаписати чужі правки, оновіть сторінку. Ваші незбережені зміни в цій картці пропадуть. <button class="btn btn-secondary btn-sm" type="button" data-act="reload">Оновити</button></div></div>';
      h += '<p class="meta" style="margin:0"><span class="req" aria-hidden="true">*</span> — обовʼязкове поле</p>';
      cfg.sections.forEach(function (s) {
        h += '<section class="section" aria-label="' + esc(s.title) + '"><div class="section-head"><h2>' + esc(s.title) + '</h2>' + (s.desc ? '<p>' + esc(s.desc) + '</p>' : '') + '</div><div class="grid2">' +
          s.fields.map(function (f) { return fieldHtml(f, E); }).join('') + '</div></section>';
      });
      h += '<div class="footbar"><span class="meta">' + esc(cfg.footMeta || 'Зміни зʼявляться на сайті після збереження') + '</span>';
      var dis = st.saving ? ' disabled' : '';
      if (cfg.footer === 'save' || st.status === 'pub') h += '<button class="btn btn-primary" type="button" data-act="save"' + dis + '>' + (st.saving ? 'Збереження…' : 'Зберегти зміни') + '</button>';
      else h += '<button class="btn btn-secondary" type="button" data-act="draft"' + dis + '>Зберегти як чернетку</button><button class="btn btn-primary" type="button" data-act="publish"' + dis + '>' + (st.saving ? 'Збереження…' : 'Опублікувати') + '</button>';
      h += '</div></div></div>';
      root.innerHTML = h;
      mountMaps();
      scrollActive();
      if (focusId) { var el = document.getElementById(focusId); if (el) { el.focus(); try { if (selS != null) el.setSelectionRange(selS, selE); } catch (e) {} } }
    }

    function submit(kind) {
      if (st.saving) return;
      var mode = kind === 'draft' ? 'draft' : 'publish';
      var R = errorsFor(mode);
      st.tried = mode;
      if (Object.keys(R.E).length) { render(); A.toast(mode === 'draft' ? 'Не збережено: виправте помилки' : 'Перевірте поля з помилками', true); var fe = root.querySelector('.is-invalid input, .is-invalid textarea, .is-invalid select, .is-invalid button'); if (fe) fe.focus(); return; }
      var status = kind === 'publish' ? 'pub' : (kind === 'draft' ? (st.status === 'pub' ? 'pub' : 'draft') : st.status);
      var warn = Object.keys(R.W).map(function (id) { return byId(id).label; });
      fields.forEach(function (f) { if (f.slug && !st.vals[f.id] && f.slugFrom) st.vals[f.id] = A.slugify(st.vals[f.slugFrom]); });
      st.saving = true; render();
      Promise.resolve(cfg.onSave(JSON.parse(JSON.stringify(st.vals)), status)).then(function (rec) {
        st.saving = false; st.tried = false; st.status = status; st.warn = warn; st.meta = 'Змінено ' + A.now();
        var tf = byId('title') || byId('name'); if (tf && String(st.vals[tf.id] || '').trim() && cfg.liveTitle !== false) st.title = String(st.vals[tf.id]).trim();
        render();
        A.toast(kind === 'publish' ? 'Опубліковано' : 'Збережено');
        if (cfg.afterSave) cfg.afterSave(rec);
      }, function (e) { st.saving = false; render(); A.saveError(e); });
    }

    function setPhotoFile(f, file) {
      var limit = (f.limit || 10) * 1024 * 1024, acc = (f.accept || 'image/jpeg,image/png,image/webp').split(',');
      var size = (file.size / 1048576).toFixed(1).replace('.', ',') + ' МБ', ext = (file.name.split('.').pop() || '').toUpperCase();
      if (acc.indexOf(file.type) < 0) { st.photo[f.id] = { state: 'error', name: file.name, meta: ext + ' · ' + size, msg: 'Формат не підходить: ' + (f.fmt || 'JPG, PNG або WebP') }; render(); return; }
      if (file.size > limit) { st.photo[f.id] = { state: 'error', name: file.name, meta: ext + ' · ' + size, msg: 'Файл більший за ' + (f.limit || 10) + ' МБ' }; render(); return; }
      st.photo[f.id] = { state: 'up', name: file.name }; render();
      A.shrink(file).then(function (blob) { return window.THStorage.uploadImage(blob, file.name); }).then(function (url) {
        st.vals[f.id] = url; st.photo[f.id] = { state: 'done', url: url, name: file.name, meta: ext + ' · ' + size }; render();
      }, function (e) {
        if (e && e.detail) console.warn('[TAKE HIGH] завантаження фото:', e.message, e.detail);
        st.photo[f.id] = { state: 'error', name: file.name, meta: ext + ' · ' + size, msg: (e && e.message) || 'Не вдалося завантажити' }; render();
      });
    }

    /* ---------- карта (OpenStreetMap через Leaflet) ----------
       Блок карти створюється один раз і переноситься в кожну нову розмітку форми, щоб не перезавантажувати карту. */
    var maps = {};
    var PIN = '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" fill="#B42318" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="10" r="2.5" fill="#fff"/></svg>';
    function fmtPoint(p) { return p ? p.lat.toFixed(5) + ', ' + p.lng.toFixed(5) : ''; }
    function mapBlock(f) {
      var m = maps[f.id]; if (m) return m;
      var el = document.createElement('div'); el.className = 'geo';
      el.innerHTML = '<div class="geo-search" role="search"><input class="input" type="search" placeholder="Знайти місце: наприклад, Nazaré" aria-label="Пошук місця на карті" data-geo="q">' +
        '<button class="btn btn-secondary" type="button" data-geo="find">Знайти</button></div>' +
        '<div class="geo-results" data-geo="results" hidden></div>' +
        '<div class="geo-map" id="f-' + f.id + '" role="application" aria-label="Карта. Натисніть, щоб поставити точку; точку можна перетягнути"></div>' +
        '<div class="geo-foot"><span class="meta" data-geo="coords" aria-live="polite"></span><button class="btn btn-ghost btn-sm" type="button" data-geo="clear">Прибрати точку</button></div>';
      m = maps[f.id] = { el: el, map: null, marker: null };
      var q = el.querySelector('[data-geo="q"]'), res = el.querySelector('[data-geo="results"]');
      function setPoint(lat, lng, zoom) {
        if (m.setPoint) { m.setPoint(lat, lng); if (zoom) m.map.setView([lat, lng], zoom); }
      }
      function sync() {
        var p = st.vals[f.id];
        el.querySelector('[data-geo="coords"]').textContent = p ? 'Точка: ' + fmtPoint(p) + ' · її можна перетягнути' : (m.map ? 'Точку не обрано. Натисніть на карту або знайдіть місце' : '');
        el.querySelector('[data-geo="clear"]').hidden = !p;
      }
      m.sync = sync;
      function search() {
        var text = q.value.trim(); if (!text) return;
        res.hidden = false; res.innerHTML = '<span class="meta">Шукаємо…</span>';
        fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=en,uk&q=' + encodeURIComponent(text))
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function (list) {
            if (!list.length) { res.innerHTML = '<span class="meta">Нічого не знайдено. Спробуйте іншу назву або поставте точку на карті вручну.</span>'; return; }
            res.innerHTML = list.map(function (x, i) { return '<button class="menu-item" type="button" data-geo="pick" data-i="' + i + '">' + esc(x.display_name) + '</button>'; }).join('');
            res._list = list;
          }, function () { res.innerHTML = '<span class="meta">Пошук зараз недоступний. Поставте точку на карті вручну.</span>'; });
      }
      el.addEventListener('click', function (e) {
        var b = e.target.closest('[data-geo]'); if (!b) return;
        var g = b.getAttribute('data-geo');
        if (g === 'find') search();
        else if (g === 'clear') { st.vals[f.id] = null; if (m.marker) { m.map.removeLayer(m.marker); m.marker = null; } sync(); }
        else if (g === 'pick') {
          var x = res._list[+b.getAttribute('data-i')]; res.hidden = true;
          setPoint(+x.lat, +x.lon, 11);
          // назва локації заповнюється з пошуку, лише якщо вона порожня
          if (f.placeField && !String(st.vals[f.placeField] || '').trim()) {
            st.vals[f.placeField] = x.name || String(x.display_name).split(',')[0];
            var pi = document.getElementById('f-' + f.placeField); if (pi) pi.value = st.vals[f.placeField];
          }
        }
      });
      q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); search(); } else if (e.key === 'Escape') res.hidden = true; });
      if (!window.L) {
        el.querySelector('.geo-map').innerHTML = '<p class="meta" style="padding:16px;margin:0">Карта не завантажилась (немає звʼязку з OpenStreetMap). Решта картки працює, точку можна додати пізніше.</p>';
        el.querySelector('.geo-search').hidden = true;
      }
      return m;
    }
    function mountMaps() {
      fields.forEach(function (f) {
        if (f.type !== 'map') return;
        var slot = root.querySelector('[data-map-slot="' + f.id + '"]'); if (!slot) return;
        var m = mapBlock(f); slot.appendChild(m.el);
        if (window.L && !m.map) {
          var p = st.vals[f.id];
          m.map = L.map(m.el.querySelector('.geo-map'), { scrollWheelZoom: false }).setView(p ? [p.lat, p.lng] : [39.6, -9.07], p ? 10 : 5);
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(m.map);
          m.map.on('click', function (e) { m.el.querySelector('[data-geo="results"]').hidden = true; m.setPoint(e.latlng.lat, e.latlng.lng); });
          m.setPoint = function (lat, lng) {
            st.vals[f.id] = { lat: Math.round(lat * 1e5) / 1e5, lng: Math.round(lng * 1e5) / 1e5 };
            if (!m.marker) { m.marker = L.marker([lat, lng], { draggable: true, keyboard: false, icon: L.divIcon({ className: 'geo-pin', html: PIN, iconSize: [30, 30], iconAnchor: [15, 30] }) }).addTo(m.map); m.marker.on('dragend', function () { var q2 = m.marker.getLatLng(); m.setPoint(q2.lat, q2.lng); }); }
            else m.marker.setLatLng([lat, lng]);
            m.sync();
          };
          if (p) m.setPoint(p.lat, p.lng);
        }
        if (m.map) m.map.invalidateSize();
        m.sync();
      });
    }

    /* ---------- список варіантів для полів з чипами ----------
       Усі доступні варіанти за алфавітом; під час вводу — лише ті, що містять текст.
       «Створити …» — останнім рядком, коли точного збігу немає (і поле дозволяє нові значення). */
    function suggestItems(f) {
      var x = st.vals[f.id], q = (st.q[f.id] || '').trim(), low = q.toLowerCase();
      var out = (f.options || []).filter(function (o) { return x.indexOf(o) < 0 && (!low || o.toLowerCase().indexOf(low) >= 0); })
        .sort(function (a, b) { return a.localeCompare(b, 'uk'); }).map(function (o) { return { v: o }; });
      var exact = (f.options || []).concat(x).some(function (o) { return o.toLowerCase() === low; });
      if (f.allowNew && low && !exact && q.length <= (f.itemMax || 80)) out.push({ v: f.lower ? low : q, isNew: true });
      return out;
    }
    function emptyText(f) {
      var q = (st.q[f.id] || '').trim();
      if (q && f.itemMax && q.length > f.itemMax) return 'Не більше ' + f.itemMax + ' символів';
      if (!q && f.allowNew && !(f.options || []).length) return f.emptyHint || 'Введіть значення, щоб додати';
      if (!q) return 'Усі варіанти вже обрано';
      return f.noneText || 'Нічого не знайдено';
    }
    function openSuggest(id) {
      st.open = id; st.act[id] = 0; render();
      var el = document.getElementById('f-' + id); if (el && document.activeElement !== el) el.focus();
      // на телефоні піднімаємо поле вгору, щоб список не ховався під клавіатурою і нижньою панеллю
      if (window.matchMedia && matchMedia('(max-width:760px)').matches) { var w = document.getElementById('fw-' + id);
        if (w) { var hd = document.querySelector('.side'), cs = hd && getComputedStyle(hd), off = cs && (cs.position === 'sticky' || cs.position === 'fixed') ? hd.getBoundingClientRect().bottom : 0;
          window.scrollTo(0, window.scrollY + w.getBoundingClientRect().top - Math.max(off, 0) - 12); } }
    }
    function scrollActive() { if (!st.open) return; var a = root.querySelector('#sg-' + st.open + ' .is-active'); if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest' }); }

    function addChip(f, v) {
      v = String(v || '').trim(); if (f.lower) v = v.toLowerCase(); if (!v) return;
      var x = st.vals[f.id];
      if (x.some(function (c) { return c.toLowerCase() === v.toLowerCase(); })) return;
      var ex = (f.options || []).find(function (o) { return o.toLowerCase() === v.toLowerCase(); });
      if (!ex && !f.allowNew) return;
      if (f.itemMax && v.length > f.itemMax) return;
      x.push(ex || v); st.q[f.id] = ''; st.act[f.id] = 0; st.open = f.id; render();
    }

    root.oninput = function (e) {
      var t = e.target;
      if (t.dataset.f) {
        var f = byId(t.dataset.f);
        if (f.lower && t.value !== t.value.toLowerCase()) { var cs = t.selectionStart, ce = t.selectionEnd; t.value = t.value.toLowerCase(); try { t.setSelectionRange(cs, ce); } catch (x) {} }
        st.vals[f.id] = t.value;
        var cn = document.getElementById('cn-' + f.id); if (cn && f.max) { cn.textContent = t.value.length + ' / ' + f.max; cn.classList.toggle('over', t.value.length > f.max); }
      } else if (t.dataset.sub) {
        st.vals[t.dataset.sub] = t.value; var m = +t.dataset.max, c2 = document.getElementById('cn-' + t.dataset.sub);
        if (c2) { c2.textContent = t.value.length + ' / ' + m; c2.classList.toggle('over', t.value.length > m); }
      } else if (t.dataset.multi) { st.q[t.dataset.multi] = t.value; st.open = t.dataset.multi; st.act[t.dataset.multi] = 0; render(); }
    };
    root.onchange = function (e) {
      var t = e.target;
      if (t.dataset.file) { var f = byId(t.dataset.file); if (t.files && t.files[0]) setPhotoFile(f, t.files[0]); return; }
      if (t.dataset.f && (t.tagName === 'SELECT' || t.type === 'date')) { st.vals[t.dataset.f] = t.value; if (st.tried) render(); return; }
      // після переходу фокусу в інше поле: перемальовуємо, коли фокус уже там, щоб його не загубити
      if (st.tried && (t.dataset.f || t.dataset.sub)) setTimeout(render, 0);
    };
    root.onfocusin = function (e) { var t = e.target; if (t.dataset && t.dataset.multi && st.open !== t.dataset.multi) openSuggest(t.dataset.multi); };
    // Список підказок лишається відкритим після вибору (можна обрати кілька підряд).
    // Закривається кліком поза полем, клавішею Esc або переходом Tab до іншого поля.
    function closeSuggest() { if (st.open) { st.open = null; render(); } }
    function outside(e) {
      if (!document.contains(root)) { document.removeEventListener('mousedown', outside, true); document.removeEventListener('touchstart', outside, true); return; }
      if (st.open && !(e.target.closest && e.target.closest('#fw-' + st.open))) closeSuggest();
    }
    document.addEventListener('mousedown', outside, true);
    document.addEventListener('touchstart', outside, true);
    root.onfocusout = function (e) {
      var t = e.target; if (!t.dataset || !t.dataset.multi) return;
      // фокус пішов в інше поле з клавіатури (Tab); клік мишею обробляє outside()
      setTimeout(function () { var a = document.activeElement; if (st.open && a && a !== document.body && root.contains(a) && !a.closest('#fw-' + st.open)) closeSuggest(); }, 0);
    };
    root.onkeydown = function (e) {
      var t = e.target;
      if (t.dataset && t.dataset.multi) {
        var f = byId(t.dataset.multi);
        var items = st.open === f.id ? suggestItems(f) : [], i = Math.min(st.act[f.id] || 0, Math.max(items.length - 1, 0));
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (st.open !== f.id) { openSuggest(f.id); return; }
          if (!items.length) return;
          st.act[f.id] = (i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length; render();
        }
        else if (e.key === 'Enter') {
          e.preventDefault();
          if (st.open !== f.id) { openSuggest(f.id); return; }
          if (items[i]) addChip(f, items[i].v);
        }
        else if (e.key === 'Backspace' && !t.value && st.vals[f.id].length) { st.vals[f.id].pop(); render(); }
        else if (e.key === 'Escape') { if (st.open) { e.stopPropagation(); st.open = null; render(); } }
      }
    };
    root.onmousedown = function (e) {
      // клік по варіанту або по рамці поля не забирає фокус з поля вводу
      if (e.target.closest('[data-act="chip-add"],[data-act="chip-new"]') || (e.target.closest('[data-box]') && !e.target.closest('input,[data-act]'))) e.preventDefault();
    };
    root.onclick = function (e) {
      var box = e.target.closest('[data-box]');
      if (box && !e.target.closest('[data-act]')) { var bid = box.getAttribute('data-box'); if (st.open !== bid) openSuggest(bid); else document.getElementById('f-' + bid).focus(); return; }
      var t = e.target.closest('[data-act]'); if (!t || !root.contains(t)) return;
      var act = t.dataset.act, f = t.dataset.f ? byId(t.dataset.f) : null;
      if (act === 'chip-x') { st.vals[f.id].splice(+t.dataset.i, 1); render(); }
      else if (act === 'chip-add') addChip(f, t.dataset.v);
      else if (act === 'chip-new') addChip(f, t.dataset.v);
      else if (act === 'photo-x') { st.vals[f.id] = null; st.photo[f.id] = { state: 'empty' }; render(); }
      else if (act === 'tool') {
        var ta = document.getElementById('f-' + f.id), s = ta.selectionStart, en = ta.selectionEnd, v = ta.value, sel = v.slice(s, en);
        var w = { h2: ['\n## ', ''], b: ['**', '**'], i: ['_', '_'], ul: ['\n- ', ''], link: ['[', '](https://)'], quote: ['\n> ', ''] }[t.dataset.tool];
        ta.value = v.slice(0, s) + w[0] + (sel || '') + w[1] + v.slice(en); st.vals[f.id] = ta.value; ta.focus();
        var pos = s + w[0].length + sel.length; ta.setSelectionRange(pos, pos);
      }
      else if (act === 'draft') submit('draft');
      else if (act === 'publish') submit('publish');
      else if (act === 'save') submit('save');
      else if (act === 'reload') location.reload();
    };
    root.ondragover = function (e) { if (e.target.closest('[data-drop]')) e.preventDefault(); };
    root.ondrop = function (e) {
      var z = e.target.closest('[data-drop]'); if (!z) return; e.preventDefault();
      var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (file) setPhotoFile(byId(z.dataset.drop), file);
    };

    render();
    return { render: render, state: st };
  };
})();
