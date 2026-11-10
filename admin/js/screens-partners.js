/* Екрани: Партнери, Кейси (ручний порядок), тексти сторінки Partnerships, Звернення */
(function () {
  'use strict';
  var A = window.A;
  A.screens = A.screens || {};

  var DIRS = ['Performance', 'Technology', 'Team', 'Media', 'Project'];
  var nameKey = function (s) { return String(s || '').trim().toLowerCase(); };
  var host = function (u) { var m = String(u || '').match(/^https?:\/\/(?:www\.)?([^/?#]+)(\/[^?#]*)?/i); if (!m) return u || ''; return /instagram\.com$/i.test(m[1]) ? 'Instagram' + (m[2] && m[2].length > 1 ? ' ' + m[2].replace(/\/$/, '') : '') : m[1]; };
  // партнер за id, зокрема видалений
  A.partnerById = function (id) { return (A.data.partners || []).concat(A.data.partnersDeleted || []).find(function (p) { return p.id === id; }) || null; };
  var partnerName = function (id) { var p = A.partnerById(id); return p ? p.name : ''; };
  var empty = function (v) { return v == null || String(v).trim() === ''; };

  /* ---------- Партнери ---------- */
  A.screens.partners = function (root) {
    return A.list(root, {
      title: 'Партнери', addLabel: 'Додати партнера', addHref: '#/partners/new', extraLabel: 'Тексти сторінки Partnerships', extraHref: '#/partnerships-texts',
      memoryKey: 'partners', titleKey: 'name',
      manualTab: function () { return true; },
      onReorder: function (tab, ids) { return A.ops.reorder(null, ids, 'Партнери', 'partners'); },
      note: 'Порядок як на сайті. Перетягніть рядок за ручку або натисніть на ручку і змінюйте порядок стрілками ↑↓. На сайті показуються лише опубліковані партнери з дозволом на логотип.',
      emptyTitle: 'Партнерів ще немає', emptyText: 'Додайте першого партнера.',
      actions: ['edit', 'publish', 'unpublish', 'delete'], entityLabel: 'партнера', entityForms: ['партнери', 'партнерів'],
      cols: [
        { key: 'logo', label: 'Логотип', kind: 'thumb', w: '96px', logo: true },
        { key: 'name', label: 'Назва', kind: 'link' },
        { key: 'dir', label: 'Напрям' },
        { key: 'link', label: 'Посилання', kind: 'muted' },
        { key: 'status', label: 'Статус', kind: 'status' },
        { key: 'changed', label: 'Змінено', kind: 'muted' }
      ],
      rows: function () {
        return A.data.partners.map(function (p) {
          return { id: p.id, href: '#/partners/' + encodeURIComponent(p.id), status: p.status, img: A.img(p.logo), c: { name: p.name, dir: p.dir || '', link: host(p.site), changed: p.changed || '' } };
        });
      },
      cannotPublish: function (id) { var p = A.data.partners.find(function (x) { return x.id === id; }); return p && p.perm !== true ? p.name + ' — немає дозволу на логотип' : null; },
      missing: function (id) {
        var p = A.data.partners.find(function (x) { return x.id === id; }); if (!p) return [];
        return [['name', 'Назва'], ['logo', 'Логотип'], ['site', 'Посилання'], ['role', 'Роль партнера']].filter(function (f) { return empty(p[f[0]]); }).map(function (f) { return f[1]; });
      },
      onPatch: function (ch) { return A.ops.patch('partners', ch); },
      onDelete: function (ids) { return A.ops.partnerDelete(ids); },
      confirmText: function (ids, titles) {
        var used = A.data.news.concat(A.data.cases).filter(function (x) { return ids.indexOf(x.partner) >= 0; }).length, one = ids.length === 1;
        return (one ? '«' + titles[0] + '» зникне' : 'Партнери зникнуть') + ' з адмінки і сайту. ' +
          (used ? 'У новинах і кейсах, де ' + (one ? 'він указаний' : 'вони вказані') + ', назва залишиться без посилання; обрати ' + (one ? 'його' : 'їх') + ' в інших не можна буде. ' : '') +
          'Повернути можна, створивши партнера з тією ж назвою.';
      }
    });
  };

  A.screens.partnerCard = function (root, recId) {
    var D = A.data;
    var p = recId === 'new' ? null : D.partners.find(function (x) { return x.id === recId; });
    if (recId !== 'new' && !p) { A.notFound(root, 'Партнера не знайдено', '#/partners', 'До партнерів'); return; }
    var id = p ? p.id : A.newId('p');
    var v = function (k, d) { return p && p[k] != null ? p[k] : d; };
    return A.form(root, {
      title: p ? p.name : 'Новий партнер', back: { label: 'Партнери', href: '#/partners' },
      status: p ? p.status : 'draft', softReq: !!p, meta: p ? 'Змінено ' + (p.changed || '—') : 'Ще не збережено',
      sections: [
        { title: 'Основне', fields: [
          { id: 'name', type: 'text', label: 'Назва', req: true, max: 80, hint: 'Показується під логотипом. Назва не повторюється', value: v('name', ''),
            unique: function (x) {
              var k = nameKey(x);
              if (D.partners.some(function (o) { return o.id !== id && nameKey(o.name) === k; })) return { msg: 'Партнер з такою назвою вже є' };
              var del = (D.partnersDeleted || []).find(function (o) { return nameKey(o.name) === k; });
              if (del) return { msg: 'Партнера «' + del.name + '» видалено раніше.', action: !p ? { label: 'Відновити партнера', run: function () {
                A.ops.partnerRestore(del.id).then(function () { A.toast('Партнера «' + del.name + '» відновлено як чернетку'); location.hash = '#/partners/' + encodeURIComponent(del.id); }, A.saveError);
              } } : null };
              return false;
            } },
          { id: 'site', type: 'text', inputType: 'url', label: 'Посилання', req: true, ph: 'https://… або https://www.instagram.com/…', hint: 'Сайт або Instagram партнера. Логотип на сайті веде сюди', value: v('site', '') },
          { id: 'dir', type: 'select', label: 'Напрям', half: true, selPh: 'Без напряму', options: DIRS, hint: 'Лише для адмінки, на сайті не показується', value: v('dir', '') },
          { id: 'role', type: 'textarea', label: 'Роль партнера', req: true, max: 200, rows: 3, hint: 'Роль у роботі команди. На сторінці Partnerships — під назвою', value: v('role', '') }
        ] },
        { title: 'Логотип', fields: [
          { id: 'logo', type: 'photo', label: 'Логотип', req: true, limit: 2, accept: 'image/svg+xml,image/png', fmt: 'SVG або PNG з прозорим фоном · до 2 МБ', author: false, logo: true, value: v('logo', null) },
          { id: 'perm', type: 'check', label: 'Дозвіл на логотип', text: 'Партнер дозволив показувати свій логотип на сайті', hardReq: true, hardMsg: 'Без дозволу партнера не можна опублікувати', value: v('perm', false) === true }
        ] }
      ],
      onSave: function (val, status) {
        var rec = { name: val.name.trim(), site: val.site.trim(), dir: val.dir, role: val.role, logo: val.logo, perm: val.perm === true };
        return A.ops.save('partners', id, rec, status, rec.name);
      },
      afterSave: function () { if (recId === 'new') history.replaceState(null, '', '#/partners/' + encodeURIComponent(id)); }
    });
  };

  /* ---------- Кейси ---------- */
  A.screens.cases = function (root) {
    return A.list(root, {
      title: 'Кейси', addLabel: 'Додати кейс', addHref: '#/cases/new',
      memoryKey: 'cases', titleKey: 'title',
      manualTab: function () { return true; },
      onReorder: function (tab, ids) { return A.ops.reorder(null, ids, 'Кейси', 'cases'); },
      note: 'Порядок як на сайті: на сторінці Partnerships спочатку показуються перші 3 кейси, решта — за кнопкою «Show more». Перетягніть рядок за ручку або натисніть на ручку і змінюйте порядок стрілками ↑↓.',
      emptyTitle: 'Кейсів ще немає', emptyText: 'Додайте перший кейс. Без опублікованих кейсів блок на сайті не показується.',
      actions: ['edit', 'publish', 'unpublish', 'delete'], entityLabel: 'кейс', entityForms: ['кейси', 'кейсів'],
      cols: [
        { key: 'photo', label: 'Фото', kind: 'thumb', w: '72px' },
        { key: 'title', label: 'Заголовок', kind: 'link' },
        { key: 'partner', label: 'Партнер' },
        { key: 'dir', label: 'Напрям' },
        { key: 'status', label: 'Статус', kind: 'status' },
        { key: 'changed', label: 'Змінено', kind: 'muted' }
      ],
      rows: function () {
        return A.data.cases.map(function (c, i) {
          return { id: c.id, href: '#/cases/' + encodeURIComponent(c.id), status: c.status, img: A.img(c.img), tone: 't' + ((i % 6) + 1), c: { title: c.title, partner: partnerName(c.partner), dir: c.dir || '', changed: c.changed || '' } };
        });
      },
      missing: function (id) {
        var c = A.data.cases.find(function (x) { return x.id === id; }); if (!c) return [];
        return [['title', 'Заголовок'], ['partner', 'Партнер'], ['dir', 'Напрям'], ['img', 'Фото'], ['text', 'Текст']].filter(function (f) { return empty(c[f[0]]); }).map(function (f) { return f[1]; });
      },
      onPatch: function (ch) { return A.ops.patch('cases', ch); },
      onDelete: function (ids) { return A.ops.remove('cases', ids); }
    });
  };

  A.screens.caseCard = function (root, recId) {
    var D = A.data;
    var c = recId === 'new' ? null : D.cases.find(function (x) { return x.id === recId; });
    if (recId !== 'new' && !c) { A.notFound(root, 'Кейс не знайдено', '#/cases', 'До кейсів'); return; }
    var id = c ? c.id : A.newId('c');
    var v = function (k, d) { return c && c[k] != null ? c[k] : d; };
    var pubNames = D.partners.filter(function (p) { return p.status === 'pub'; }).map(function (p) { return p.name; });
    return A.form(root, {
      title: c ? c.title : 'Новий кейс', back: { label: 'Кейси', href: '#/cases' },
      status: c ? c.status : 'draft', softReq: !!c, meta: c ? 'Змінено ' + (c.changed || '—') : 'Ще не збережено',
      sections: [
        { title: 'Основне', fields: [
          { id: 'title', type: 'text', label: 'Заголовок', req: true, max: 100, value: v('title', '') },
          { id: 'partner', type: 'select', label: 'Партнер', req: true, half: true, options: pubNames, hint: 'Лише опубліковані партнери', value: partnerName(v('partner', '')) },
          { id: 'dir', type: 'select', label: 'Напрям', req: true, half: true, options: DIRS, value: v('dir', '') },
          { id: 'text', type: 'textarea', label: 'Текст', req: true, max: 1000, rows: 6, hint: 'Роль партнера: що зробили, які права, як оцінили результат', value: v('text', '') }
        ] },
        { title: 'Фото', fields: [
          { id: 'img', type: 'photo', label: 'Фото', req: true, limit: 10, value: v('img', null), sub: { author: v('imgAuthor', '') } }
        ] }
      ],
      onSave: function (val, status) {
        var pp = D.partners.concat(D.partnersDeleted || []).find(function (p) { return p.name === val.partner; });
        var rec = { title: val.title.trim(), partner: pp ? pp.id : '', dir: val.dir, text: val.text, img: val.img, imgAuthor: val.img_author };
        return A.ops.save('cases', id, rec, status, rec.title);
      },
      afterSave: function () { if (recId === 'new') history.replaceState(null, '', '#/cases/' + encodeURIComponent(id)); }
    });
  };

  /* ---------- Звернення (лише перегляд; статус і подальша робота — у Google-таблиці) ---------- */
  var enq = null;
  function loadEnq() { return window.THStorage.listEnquiries(300).then(function (L) { enq = L; return L; }); }
  var fdt = function (iso) { var d = new Date(iso); if (isNaN(d)) return iso || ''; var z = function (n) { return ('0' + n).slice(-2); }; return z(d.getDate()) + '.' + z(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()); };
  var TYPE = { partnership: 'Partnership', press: 'Press' };
  A.screens.enquiries = function (root) {
    function show() {
      return A.list(root, {
        title: 'Звернення', memoryKey: 'enquiries', selectable: false, actions: [],
        note: 'Звернення з форм сайту. Тут лише перегляд: статус, відповідальний і наступна дія ведуться в Google-таблиці.',
        emptyTitle: 'Звернень ще немає', emptyText: 'Тут зʼявляться заявки з форми Partnership enquiry на сторінці Partnerships.',
        sort: { key: 'date', dir: 'desc' },
        cols: [
          { key: 'date', label: 'Дата', sortable: true, nowrap: true, firstDir: 'desc' },
          { key: 'name', label: 'Імʼя', kind: 'link', sortable: true },
          { key: 'company', label: 'Компанія', sortable: true },
          { key: 'email', label: 'Email' },
          { key: 'type', label: 'Тип', sortable: true },
          { key: 'direction', label: 'Напрям', sortable: true }
        ],
        rows: function () {
          return (enq || []).map(function (e) {
            return { id: e.id, href: '#/enquiries/' + encodeURIComponent(e.id), c: { date: fdt(e.created), name: e.name, company: e.company, email: e.email, type: TYPE[e.type] || e.type, direction: e.direction }, s: { date: e.created } };
          });
        }
      });
    }
    root.innerHTML = '<div class="state-box"><p class="meta">Завантаження звернень…</p></div>';
    loadEnq().then(show, function (e) { root.innerHTML = '<div class="state-box"><h1 style="margin:0;font-size:20px">Не вдалося завантажити звернення</h1><p style="margin:0">' + A.esc(e.message || '') + '</p></div>'; });
  };
  A.screens.enquiry = function (root, id) {
    function show() {
      var e = (enq || []).find(function (x) { return x.id === id; });
      if (!e) { A.notFound(root, 'Звернення не знайдено', '#/enquiries', 'До звернень'); return; }
      var row = function (k, v) { return v ? '<div class="kv"><dt>' + A.esc(k) + '</dt><dd>' + A.esc(v) + '</dd></div>' : ''; };
      root.innerHTML = '<div style="display:flex;flex-direction:column;gap:20px;width:100%"><header class="page-head"><div class="head-left"><a class="crumb" href="#/enquiries">' + A.icon('back', 'i-sm') + 'Звернення</a>' +
        '<div class="head-row"><h1>' + A.esc(e.name) + (e.company ? ' · ' + A.esc(e.company) : '') + '</h1></div><span class="meta">' + A.esc(fdt(e.created)) + ' · ' + A.esc(TYPE[e.type] || e.type) + '</span></div></header>' +
        '<section class="section"><dl class="kv-list">' + row('Email', e.email) + row('Напрям', e.direction) + row('Звідки', [e.source && e.source.page, e.source && e.source.utm].filter(Boolean).join(' · ')) +
        row('Згода з Privacy Notice', e.consent ? 'Так · ' + fdt(e.consent.at) + ' · версія ' + e.consent.version : 'Ні') + row('Статус', e.status) + '</dl>' +
        '<h2 style="font-size:16px;margin:16px 0 8px">' + (e.type === 'press' ? 'Message' : 'Objective') + '</h2><p class="enq-text">' + A.esc(e.message) + '</p>' +
        (e.email ? '<p><a class="btn btn-secondary" href="mailto:' + A.esc(e.email) + '">Написати ' + A.esc(e.email) + '</a></p>' : '') + '</section></div>';
      return { kind: 'view' };
    }
    if (enq) return show();
    root.innerHTML = '<div class="state-box"><p class="meta">Завантаження…</p></div>';
    loadEnq().then(show, function (er) { root.innerHTML = '<div class="state-box"><p>' + A.esc(er.message || '') + '</p></div>'; });
  };

  /* ---------- Тексти сторінки Partnerships ---------- */
  A.screens.partnershipsTexts = function (root) {
    var P = (A.data.pages || {}).partnerships || {};
    var dirs = P.dirs || [];
    var dirText = function (name) { var d = dirs.find(function (x) { return x._label === name; }); return d ? d.text : ''; };
    var dirFields = DIRS.map(function (name, i) { return { id: 'dir' + i, type: 'text', label: name, req: true, max: 100, value: dirText(name) }; });
    return A.form(root, {
      title: 'Тексти сторінки Partnerships', back: { label: 'Партнери', href: '#/partners' }, footer: 'save', liveTitle: false, tabs: true,
      meta: 'Кожна вкладка — блок сторінки /partnerships. Партнери і кейси редагуються у своїх розділах', footMeta: 'Зберігаються всі вкладки разом. Зміни зʼявляться на сайті після збереження',
      sections: [
        { title: 'Вступ', desc: 'Перший екран сторінки: заголовок, текст і кнопка «Discuss a partnership», яка веде до форми.', fields: [
          { id: 'title', type: 'text', label: 'Заголовок сторінки', req: true, max: 80, value: P.title || '' },
          { id: 'intro', type: 'textarea', label: 'Вступ', req: true, max: 800, rows: 8, hint: 'Порожній рядок ділить текст на два абзаци', value: P.intro || '' }
        ] },
        { title: 'Напрями', rows: true, desc: 'Блок під вступом: 5 карток без фото. Назви напрямів задані в коді, тут — короткий опис кожного, до 100 символів.', fields: dirFields },
        { title: 'Як будуємо партнерство', desc: 'Блок після напрямів: від 3 до 6 кроків з номером. Порядок на сайті — як тут, змінюється стрілками ↑ ↓.', fields: [
          { id: 'steps', type: 'rep', label: 'Кроки', req: true, min: 3, max: 6, itemName: 'кроки', itemName1: 'крок', addText: 'Додати крок',
            fields: [{ id: 'title', label: 'Назва', req: true, max: 40, w: 'minmax(0,1fr)' }, { id: 'text', label: 'Текст', req: true, max: 200, type: 'textarea', w: 'minmax(0,2.2fr)' }],
            value: (P.steps || []).map(function (s) { return { title: s.title || '', text: s.text || '' }; }) }
        ] }
      ],
      onSave: function (val) {
        return A.ops.page('partnerships', {
          title: val.title, intro: val.intro,
          dirs: DIRS.map(function (name, i) { return { _label: name, text: val['dir' + i] }; }),
          steps: val.steps.map(function (s) { return { title: s.title.trim(), text: s.text.trim() }; })
        }, 'Сторінка Partnerships');
      }
    });
  };
})();
