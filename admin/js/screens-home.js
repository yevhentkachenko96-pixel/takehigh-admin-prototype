/* Екрани: Тексти Home (з прототипу V3, схема — shared/home-schema.js), Сесії (Real sessions на Home) */
(function () {
  'use strict';
  var A = window.A;
  A.screens = A.screens || {};

  /* ---------- Тексти Home ---------- */
  // Зберігаються лише змінені поля: порожнє поле на сайті показує текст чи фото з прототипу
  A.screens.homeTexts = function (root) {
    var S = window.TH_HOME_SCHEMA, DEF = window.TH_HOME_DEFAULTS, P = (A.data.pages || {}).home || {};
    var cur = function (k) { return P[k] != null && String(P[k]).trim() !== '' ? P[k] : DEF[k]; };
    var hi = 0;
    var sections = S.map(function (t) {
      var fields = [];
      t.secs.forEach(function (sec) {
        if (t.secs.length > 1) fields.push({ id: '_h' + (hi++), type: 'heading', label: sec.title, desc: sec.desc });
        sec.fields.forEach(function (f) {
          if (f.type === 'p') fields.push({ id: f.k, type: 'photo', label: f.label, limit: 10, half: false, author: false, hint: 'Якщо прибрати фото, на сайті буде фото з прототипу', value: cur(f.k) });
          else {
            var long = f.type === 'a';
            fields.push({ id: f.k, type: long ? 'textarea' : 'text', label: f.label, max: f.max, rows: long ? (f.max > 250 ? 4 : 3) : undefined, half: !long && f.max <= 40,
              hint: String(cur(f.k)) !== String(f.def) ? 'Змінено. Текст прототипу: «' + String(f.def).slice(0, 90) + (String(f.def).length > 90 ? '…' : '') + '»' : '', value: cur(f.k) });
          }
        });
      });
      return { title: t.title, desc: t.desc, fields: fields };
    });
    return A.form(root, {
      title: 'Тексти Home', footer: 'save', liveTitle: false, tabs: true,
      meta: 'Кожна вкладка — блок головної сторінки, як у прототипі V3. Новини, сесії і партнери в блоках беруться з їхніх розділів',
      footMeta: 'Зберігаються всі вкладки разом. Порожнє поле — на сайті текст з прототипу',
      sections: sections,
      onSave: function (val) {
        var rec = {};
        S.forEach(function (t) { t.secs.forEach(function (sec) { sec.fields.forEach(function (f) {
          var v = val[f.k]; v = v == null ? '' : (typeof v === 'string' ? v.trim() : v);
          rec[f.k] = v === '' || v === f.def ? '' : v; // збігається з прототипом — не зберігаємо
        }); }); });
        return A.ops.page('home', rec, 'Тексти Home');
      }
    });
  };

  /* ---------- Сесії ---------- */
  var TAGS = ['Video', 'Photo', 'Preparation'];
  var isVideo = function (v) { return v.tag === 'Video'; };
  var ytOk = function (u) { return /^https:\/\/(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)[\w-]{6,}/i.test(String(u || '').trim()); };

  A.screens.sessions = function (root) {
    return A.list(root, {
      title: 'Сесії', addLabel: 'Додати сесію', addHref: '#/sessions/new', memoryKey: 'sessions', titleKey: 'title',
      manualTab: function () { return true; },
      onReorder: function (tab, ids) { return A.ops.reorder(null, ids, 'Real sessions', 'sessions'); },
      note: 'Блок Real sessions на Home: опубліковані сесії в цьому порядку. Перетягніть рядок за ручку або натисніть на ручку і змінюйте порядок стрілками ↑↓. Нові сесії зʼявляються першими.',
      emptyTitle: 'Сесій ще немає', emptyText: 'Додайте сесію: фото, тип і підпис. Без опублікованих сесій блок на Home не показується.',
      actions: ['edit', 'publish', 'unpublish', 'delete'], entityLabel: 'сесію', entityForms: ['сесії', 'сесій'],
      missing: function (id) {
        var s = A.data.sessions.find(function (x) { return x.id === id; }); if (!s) return [];
        var F = [['title', 'Назва'], ['img', 'Фото'], ['tag', 'Тип']].concat(s.tag === 'Video' ? [['video', 'Відео']] : []);
        return F.filter(function (f) { var v = s[f[0]]; return v == null || String(v).trim() === ''; }).map(function (f) { return f[1]; });
      },
      cols: [
        { key: 'photo', label: 'Фото', kind: 'thumb', w: '72px', square: true },
        { key: 'title', label: 'Назва', kind: 'link' },
        { key: 'tag', label: 'Тип', kind: 'pill', tones: { Video: 'ok' } },
        { key: 'place', label: 'Локація' },
        { key: 'date', label: 'Дата', nowrap: true },
        { key: 'status', label: 'Статус', kind: 'status' },
        { key: 'changed', label: 'Змінено', kind: 'muted' }
      ],
      rows: function () {
        return (A.data.sessions || []).map(function (s, i) {
          return { id: s.id, href: '#/sessions/' + encodeURIComponent(s.id), status: s.status, img: A.img(s.img), tone: 't' + ((i % 6) + 1),
            c: { title: s.title, tag: s.tag, place: s.place, date: A.fd(s.date) || '', changed: s.changed || '' } };
        });
      },
      onPatch: function (ch) { return A.ops.patch('sessions', ch); },
      onDelete: function (ids) { return A.ops.remove('sessions', ids); }
    });
  };

  A.screens.sessionCard = function (root, recId) {
    var D = A.data; D.sessions = D.sessions || [];
    var s = recId === 'new' ? null : D.sessions.find(function (x) { return x.id === recId; });
    if (recId !== 'new' && !s) { A.notFound(root, 'Сесію не знайдено', '#/sessions', 'До сесій'); return; }
    var id = s ? s.id : A.newId('s');
    var v = function (k, d) { return s && s[k] != null ? s[k] : d; };
    var pubNews = D.news.filter(function (n) { return n.status === 'pub'; });
    var newsTitle = function (nid) { var n = D.news.find(function (x) { return x.id === nid; }); return n ? n.title : ''; };
    return A.form(root, {
      title: s ? s.title : 'Нова сесія', back: { label: 'Сесії', href: '#/sessions' },
      status: s ? s.status : 'draft', softReq: !!s, meta: s ? 'Змінено ' + (s.changed || '—') : 'Ще не збережено',
      sections: [
        { title: 'Картка', desc: 'Картка в блоці Real sessions на Home: фото, тип у куті, локація і дата, назва.', fields: [
          { id: 'title', type: 'text', label: 'Назва', req: true, max: 80, value: v('title', '') },
          { id: 'tag', type: 'select', label: 'Тип', req: true, half: true, options: TAGS, hint: 'Позначка в куті фото', value: v('tag', 'Photo') },
          { id: 'date', type: 'date', label: 'Дата', half: true, value: v('date', '') },
          { id: 'place', type: 'text', label: 'Локація', max: 40, half: true, ph: 'Наприклад: Nazaré', value: v('place', '') },
          { id: 'img', type: 'photo', label: 'Фото', req: true, limit: 10, author: false, ratio: function () { return [4, 5]; }, hint: 'На сайті — вертикальна картка 4:5', value: v('img', null) }
        ] },
        { title: 'Куди веде картка', desc: 'Відео відкривається в новій вкладці. Якщо відео немає — картка веде на повʼязану новину; якщо немає і новини — картка не клікабельна.', fields: [
          { id: 'video', type: 'text', inputType: 'url', label: 'Відео на YouTube', reqIf: isVideo, ph: 'https://www.youtube.com/watch?v=…', hint: 'Обовʼязкове для типу Video',
            unique: function (x) { return ytOk(x) ? false : { msg: 'Потрібне посилання на YouTube: youtube.com/watch?v=… або youtu.be/…' }; }, value: v('video', '') },
          { id: 'news', type: 'select', label: 'Повʼязана новина', selPh: 'Без новини', options: pubNews.map(function (n) { return n.title; }), hint: 'Лише опубліковані новини', value: newsTitle(v('news', '')) }
        ] }
      ],
      onSave: function (val, status) {
        var n = pubNews.find(function (x) { return x.title === val.news; }) || D.news.find(function (x) { return x.title === val.news; });
        var rec = { title: val.title.trim(), tag: val.tag, date: val.date, place: val.place.trim(), img: val.img, video: String(val.video || '').trim(), news: n ? n.id : '' };
        return A.ops.save('sessions', id, rec, status, rec.title);
      },
      afterSave: function () { if (recId === 'new') history.replaceState(null, '', '#/sessions/' + encodeURIComponent(id)); }
    });
  };
})();
