/* Екрани: Новини, картка новини, Теги, картка тегу */
(function () {
  'use strict';
  var A = window.A;
  A.screens = A.screens || {};

  // категорії — спільні з сайтом (shared/home-schema.js): фільтр на Home і на сторінці Updates
  var CATS = window.TH_CATEGORIES;
  var TYPES = ['Session Report', 'Team Update', 'Technical', 'Announcement', 'Feature', 'In Pictures', 'Media Release', 'Partner Update'];
  // учасники, зокрема видалені: імʼя видаленого лишається в старих новинах
  var allMembers = function () { return A.data.members.concat(A.data.membersDeleted || []); };
  var memberName = function (id) { var m = allMembers().find(function (x) { return x.id === id; }); return m ? m.name : id; };
  var memberId = function (name) { var m = allMembers().find(function (x) { return x.name === name; }); return m ? m.id : name; };

  A.screens.news = function (root) {
    return A.list(root, {
      title: 'Новини', addLabel: 'Додати новину', addHref: '#/news/new', extraLabel: 'Тексти сторінки Updates', extraHref: '#/news-texts',
      note: 'Зірочка на фото — головна новина. Головною може бути лише одна; зробити головною можна в меню дій рядка. Видалення остаточне.',
      emptyTitle: 'Новин ще немає', emptyText: 'Додайте першу новину. Вона зʼявиться на сайті після публікації.',
      sort: { key: 'date', dir: 'desc' }, markLabel: 'Головна новина', memoryKey: 'news',
      search: { key: 'title', ph: 'Пошук за заголовком' },
      filters: [
        { key: 'cat', label: 'Категорія', options: CATS },
        { key: 'type', label: 'Тип', options: TYPES },
        { key: 'status', label: 'Статус', options: ['draft', 'pub'], names: A.STATUS }
      ],
      actions: ['edit', 'makeMain', 'publish', 'unpublish', 'delete'],
      missing: function (id) {
        var n = A.data.news.find(function (x) { return x.id === id; }); if (!n) return [];
        var F = [['title', 'Заголовок'], ['deck', 'Короткий опис'], ['date', 'Дата'], ['cat', 'Категорія'], ['type', 'Тип'], ['img', 'Головне фото'], ['body', 'Текст'], ['source', 'Джерело']];
        return F.filter(function (f) { var v = n[f[0]]; return v == null || String(v).trim() === ''; }).map(function (f) { return f[1]; });
      }, entityLabel: 'новину', entityForms: ['новини', 'новин'],
      cols: [
        { key: 'photo', label: 'Фото', kind: 'thumb', w: '72px' },
        { key: 'title', label: 'Заголовок', kind: 'link', sortable: true },
        { key: 'cat', label: 'Категорія', sortable: true, nowrap: true },
        { key: 'type', label: 'Тип', sortable: true, nowrap: true },
        { key: 'date', label: 'Дата', sortable: true, nowrap: true, firstDir: 'desc' },
        { key: 'status', label: 'Статус', kind: 'status', sortable: true },
        { key: 'changed', label: 'Змінено', kind: 'muted', sortable: true, firstDir: 'desc' }
      ],
      rows: function () {
        return A.data.news.map(function (n, i) {
          return { id: n.id, href: '#/news/' + encodeURIComponent(n.id), status: n.status, img: A.img(n.img), tone: 't' + ((i % 6) + 1), featured: !!n.featured,
            f: { cat: n.cat, type: n.type, status: n.status },
            c: { title: n.title, cat: n.cat, type: n.type, date: A.fd(n.date) || '[Date]', changed: n.changed || '' },
            s: { date: n.date || '', changed: A.changedKey(n.changed) } };
        });
      },
      onPatch: function (ch) { return A.ops.patch('news', ch); },
      onDelete: function (ids) { return A.ops.remove('news', ids); }
    });
  };

  A.screens.newsCard = function (root, recId) {
    var D = A.data;
    var n = recId === 'new' ? null : D.news.find(function (x) { return x.id === recId; });
    if (recId !== 'new' && !n) { A.notFound(root, 'Новину не знайдено', '#/news', 'До новин'); return; }
    var id = n ? n.id : A.newId('n');
    var v = function (k, d) { return n && n[k] != null ? n[k] : d; };
    return A.form(root, {
      title: n ? n.title : 'Нова новина', back: { label: 'Новини', href: '#/news' },
      status: n ? n.status : 'draft', softReq: !!n, meta: n ? 'Змінено ' + (n.changed || '—') : 'Ще не збережено',
      sections: [
        { title: 'Основне', fields: [
          { id: 'title', type: 'text', label: 'Заголовок', req: true, max: 100, value: v('title', '') },
          { id: 'slug', type: 'text', label: 'Адреса сторінки', prefix: 'takehigh.com/news/', slug: true, slugFrom: 'title', taken: D.news.filter(function (x) { return x.id !== id; }).map(function (x) { return x.slug; }), ph: 'news-session-report', hint: 'Якщо порожньо, створиться із заголовка. Латиниця, цифри і дефіс.', value: v('slug', '') },
          { id: 'deck', type: 'textarea', label: 'Короткий опис', req: true, max: 200, rows: 3, value: v('deck', '') },
          { id: 'date', type: 'date', label: 'Дата', req: true, half: true, value: v('date', '') },
          { id: 'cat', type: 'select', label: 'Категорія', req: true, half: true, options: CATS, hint: 'Фільтр новин на Home і на сторінці Updates', value: v('cat', '') },
          { id: 'type', type: 'select', label: 'Тип', req: true, half: true, options: TYPES, value: v('type', '') },
          { id: 'partner', type: 'select', label: 'Партнер', half: true, selPh: 'Без партнера', options: D.partners.filter(function (p) { return p.status === 'pub'; }).map(function (p) { return p.name; }), hint: 'Лише опубліковані партнери', value: (A.partnerById(v('partner', '')) || {}).name || '' }
        ] },
        { title: 'Теги і люди', fields: [
          { id: 'tags', type: 'multi', label: 'Теги', lower: true, options: D.tags.slice(), blocked: (D.tagsDeleted || []).slice(), blockedText: function (t) { return 'Тег «' + t + '» видалено, додати не можна. Відновити — у розділі Теги'; }, allowNew: true, itemMax: 30, newText: 'Створити тег', ph: 'Почніть вводити або створіть новий тег', hint: 'Теги завжди малими літерами, на сайті: #nazaré. Новий тег додається в довідник', value: v('tags', []).slice() },
          { id: 'people', type: 'multi', label: 'Люди з команди', blocked: (D.membersDeleted || []).map(function (m) { return m.name; }), blockedText: function (t) { return 'Учасника «' + t + '» видалено, додати не можна. Відновити — у розділі Учасники'; }, options: D.members.filter(function (m) { return m.status === 'pub'; }).map(function (m) { return m.name; }), ph: 'Оберіть учасників', noneText: 'Нічого не знайдено серед опублікованих учасників', hint: 'Лише опубліковані учасники. На сайті — посилання на Club', value: v('people', []).map(memberName) },
          { id: 'others', type: 'multi', label: 'Інші люди', allowNew: true, itemMax: 80, newText: 'Додати', ph: 'Введіть імʼя і натисніть Enter', emptyHint: 'Введіть імʼя, щоб додати', hint: 'Для людей, яких немає серед учасників', value: v('others', []).slice() }
        ] },
        { title: 'Локація', fields: [
          { id: 'place', type: 'text', label: 'Назва локації', max: 100, ph: 'Наприклад: Nazaré', hint: 'Якщо на карті є точка, на сайті назва стане посиланням на неї в Google Maps', value: v('place', '') },
          { id: 'point', type: 'map', label: 'Точка на карті', placeField: 'place', value: v('point', null) }
        ] },
        { title: 'Головне фото', fields: [
          { id: 'img', type: 'photo', label: 'Головне фото', req: true, limit: 10, caption: 'Контекст фото', captionMax: 150, value: v('img', null), sub: { author: v('imgAuthor', ''), caption: v('imgCaption', '') } }
        ] },
        { title: 'Текст', fields: [
          { id: 'body', type: 'editor', label: 'Текст новини', req: true, ph: 'Почніть писати текст новини…', hint: 'Шрифт, колір і розмір тексту задає дизайн сайту', value: v('body', '') }
        ] },
        { title: 'Внутрішнє', desc: 'Ці поля бачать лише адміністратори, на сайті вони не показуються.', fields: [
          { id: 'source', type: 'textarea', label: 'Джерело', req: true, rows: 2, ph: 'Посилання або опис, звідки інформація', value: v('source', '') }
        ] }
      ],
      onSave: function (val, status) {
        var rec = { title: val.title, slug: val.slug || A.slugify(val.title), deck: val.deck, date: val.date, cat: val.cat, type: val.type, partner: (D.partners.concat(D.partnersDeleted || []).find(function (p) { return p.name === val.partner; }) || {}).id || '',
          tags: val.tags, people: val.people.map(memberId), others: val.others, place: val.place, point: val.point,
          img: val.img, imgAuthor: val.img_author, imgCaption: val.img_caption, body: val.body, source: val.source };
        return A.ops.save('news', id, rec, status, val.title);
      },
      afterSave: function () { if (recId === 'new') history.replaceState(null, '', '#/news/' + encodeURIComponent(id)); }
    });
  };

  // Тексти сторінки Updates (усі новини). Заголовок блоку новин на Home — у «Тексти Home»
  A.screens.newsTexts = function (root) {
    var L = (A.data.pages || {}).latest || {};
    var v = function (o, k, d) { return o[k] != null && o[k] !== '' ? o[k] : d; };
    return A.form(root, {
      title: 'Тексти сторінки Updates', back: { label: 'Новини', href: '#/news' }, footer: 'save', liveTitle: false,
      meta: 'Сторінка з усіма новинами і фільтрами за категорією і тегом. Заголовок блоку новин на Home — у розділі «Тексти Home»', footMeta: 'Зміни зʼявляться на сайті після збереження',
      sections: [
        { title: 'Шапка сторінки', fields: [
          { id: 'label', type: 'text', label: 'Надпис над заголовком', req: true, max: 40, value: v(L, 'label', 'Updates from the team') },
          { id: 'title', type: 'text', label: 'Заголовок', req: true, max: 80, value: v(L, 'title', 'News from the team') },
          { id: 'intro', type: 'textarea', label: 'Вступ', max: 300, rows: 3, value: v(L, 'intro', 'Session reports, team updates and stories from the people behind TAKE HIGH.') }
        ] }
      ],
      onSave: function (val) { return A.ops.page('latest', { label: val.label, title: val.title, intro: val.intro }, 'Сторінка Updates'); }
    });
  };

  A.screens.tags = function (root) {
    return A.list(root, {
      title: 'Теги', addLabel: 'Додати тег', addHref: '#/tags/new',
      note: 'Теги також створюються з картки новини. Теги завжди малими літерами, на сайті: #тег. Видалений тег лишається в новинах, де вже стоїть, але додати його до інших не можна; відновити — створивши тег з тією ж назвою.',
      emptyTitle: 'Тегів ще немає', emptyText: 'Додайте тег, щоб групувати новини.',
      selectable: false, actions: ['edit', 'delete'], sort: { key: 'title', dir: 'asc' }, entityLabel: 'тег',
      onDelete: function (ids) { return A.ops.tagDelete(ids); },
      confirmText: function (ids) {
        var t = ids[0], n = A.data.news.filter(function (x) { return (x.tags || []).indexOf(t) >= 0; }).length;
        return 'Тег «' + t + '» зникне з довідника і з підказок. ' + (n ? 'У ' + n + ' ' + (n % 10 === 1 && n % 100 !== 11 ? 'новині' : 'новинах') + ' він залишиться, але додати його до інших новин буде не можна.' : 'Зараз він не стоїть у жодній новині.') + ' Повернути тег можна, створивши новий тег з тією ж назвою.';
      },
      cols: [
        { key: 'title', label: 'Назва', kind: 'link', sortable: true },
        { key: 'count', label: 'Кількість новин', sortable: true, w: '200px', firstDir: 'desc' }
      ],
      rows: function () {
        return A.data.tags.map(function (t) {
          var c = A.data.news.filter(function (x) { return (x.tags || []).indexOf(t) >= 0; }).length;
          return { id: t, href: '#/tags/' + encodeURIComponent(t), c: { title: t, count: String(c) }, s: { count: c } };
        });
      }
    });
  };

  A.screens.tagCard = function (root, name) {
    var isNew = name === 'new';
    if (!isNew && A.data.tags.indexOf(name) < 0) { A.notFound(root, 'Тег не знайдено', '#/tags', 'До тегів'); return; }
    var cur = isNew ? '' : name;
    var count = cur ? A.data.news.filter(function (x) { return (x.tags || []).indexOf(cur) >= 0; }).length : 0;
    return A.form(root, {
      title: cur || 'Новий тег', back: { label: 'Теги', href: '#/tags' }, footer: 'save',
      meta: cur ? 'Використано в новинах: ' + count : 'Ще не збережено', footMeta: 'Назва зміниться в усіх новинах з цим тегом',
      sections: [{ title: 'Тег', fields: [
        { id: 'name', type: 'text', label: 'Назва', lower: true, req: true, max: 30, hint: 'Не повторюється. Зберігається малими літерами, на сайті: #назва', value: cur,
          unique: function (x) {
            var k = A.tagKey(x);
            if (A.data.tags.some(function (t) { return t !== cur && t === k; })) return true;
            if ((A.data.tagsDeleted || []).indexOf(k) >= 0) return { msg: 'Тег «' + k + '» видалено раніше.', action: !cur ? { label: 'Відновити тег', run: function () {
              A.ops.tagRestore(k).then(function () { A.toast('Тег «' + k + '» відновлено'); location.hash = '#/tags/' + encodeURIComponent(k); }, A.saveError);
            } } : null };
            return false;
          }, uniqueMsg: 'Такий тег уже є' }
      ] }],
      onSave: function (val) { return A.ops.tag(cur, val.name); },
      afterSave: function (res) { if (res) { cur = res; history.replaceState(null, '', '#/tags/' + encodeURIComponent(res)); } }
    });
  };
})();
