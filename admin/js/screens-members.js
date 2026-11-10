/* Екрани: Учасники (вкладки за групами, ручний порядок Crew), картка учасника, тексти сторінки Club */
(function () {
  'use strict';
  var A = window.A;
  A.screens = A.screens || {};

  var GROUPS = ['Crew', 'Media', 'Documentary Partner', 'Athlete Development Programme'];
  var isCrew = function (v) { return v.group === 'Crew'; };
  var usedIn = function (id) { return A.data.news.filter(function (x) { return (x.people || []).indexOf(id) >= 0; }).length; };
  var nameKey = function (s) { return String(s || '').trim().toLowerCase(); };

  A.screens.members = function (root) {
    return A.list(root, {
      title: 'Учасники', addLabel: 'Додати учасника', addHref: '#/members/new', extraLabel: 'Тексти сторінки Club', extraHref: '#/club-texts',
      memoryKey: 'members', titleKey: 'name',
      tabs: GROUPS.map(function (g) { return { key: g, label: g }; }),
      manualTab: function (tab) { return tab === 'Crew'; },
      onReorder: function (tab, ids) { return A.ops.reorder(tab, ids, tab); },
      note: function (tab, manual, filtered) {
        if (tab !== 'Crew') return 'Порядок на сайті — за датою створення: нові учасники зʼявляються в кінці групи.';
        return filtered ? 'Щоб змінити порядок Crew, скиньте пошук і фільтри.' : 'Порядок як на сайті. Перетягніть рядок за ручку або натисніть на ручку і змінюйте порядок стрілками ↑↓.';
      },
      emptyTitle: 'У цій групі ще нікого немає', emptyText: 'Додайте учасника і оберіть групу в картці.',
      search: { key: 'name', ph: 'Пошук за імʼям' },
      filters: [{ key: 'status', label: 'Статус', options: ['draft', 'pub'], names: A.STATUS }],
      actions: ['edit', 'unpublish', 'delete'], entityLabel: 'учасника', entityForms: ['учасники', 'учасників'],
      cols: [
        { key: 'photo', label: 'Фото', kind: 'thumb', w: '72px', square: true },
        { key: 'name', label: 'Імʼя', kind: 'link', sortable: true },
        { key: 'role', label: 'Основна роль' },
        { key: 'status', label: 'Статус', kind: 'status', sortable: true },
        { key: 'changed', label: 'Змінено', kind: 'muted', sortable: true, firstDir: 'desc' }
      ],
      rows: function () {
        return A.data.members.map(function (m, i) {
          return { id: m.id, href: '#/members/' + encodeURIComponent(m.id), status: m.status, img: A.img(m.portrait), tone: 't' + ((i % 6) + 1),
            f: { tab: m.group, status: m.status }, c: { name: m.name, role: m.role, changed: m.changed || '' }, s: { changed: A.changedKey(m.changed) } };
        });
      },
      onPatch: function (ch) { return A.ops.patch('members', ch); },
      onDelete: function (ids) { return A.ops.memberDelete(ids); },
      confirmText: function (ids, titles) {
        var n = ids.reduce(function (s, id) { return s + usedIn(id); }, 0), one = ids.length === 1;
        return (one ? '«' + titles[0] + '» зникне' : 'Учасники зникнуть') + ' з адмінки і сторінки Club. ' +
          (n ? 'У новинах, де ' + (one ? 'учасник відмічений' : 'вони відмічені') + ', імʼя залишиться без посилання; додати ' + (one ? 'його' : 'їх') + ' до інших новин буде не можна. ' : '') +
          'Повернути можна, створивши учасника з тим самим імʼям.';
      }
    });
  };

  A.screens.memberCard = function (root, recId) {
    var D = A.data;
    var m = recId === 'new' ? null : D.members.find(function (x) { return x.id === recId; });
    if (recId !== 'new' && !m) { A.notFound(root, 'Учасника не знайдено', '#/members', 'До учасників'); return; }
    var id = m ? m.id : A.newId('m');
    var v = function (k, d) { return m && m[k] != null ? m[k] : d; };
    var startGroup = m ? m.group : ((A.listMemory && A.listMemory.members && A.listMemory.members.tab) || 'Crew');
    return A.form(root, {
      title: m ? m.name : 'Новий учасник', back: { label: 'Учасники', href: '#/members' },
      status: m ? m.status : 'draft', softReq: !!m, meta: m ? 'Змінено ' + (m.changed || '—') : 'Ще не збережено',
      sections: [
        { title: 'Основне', fields: [
          { id: 'name', type: 'text', label: 'Імʼя', req: true, max: 80, hint: 'Як на сайті. Імʼя не повторюється', value: v('name', ''),
            unique: function (x) {
              var k = nameKey(x);
              if (D.members.some(function (o) { return o.id !== id && nameKey(o.name) === k; })) return { msg: 'Учасник з таким імʼям уже є' };
              var del = (D.membersDeleted || []).find(function (o) { return nameKey(o.name) === k; });
              if (del) return { msg: 'Учасника «' + del.name + '» видалено раніше.', action: !m ? { label: 'Відновити учасника', run: function () {
                A.ops.memberRestore(del.id).then(function () { A.toast('Учасника «' + del.name + '» відновлено як чернетку'); location.hash = '#/members/' + encodeURIComponent(del.id); }, A.saveError);
              } } : null };
              return false;
            } },
          { id: 'group', type: 'select', label: 'Група', req: true, half: true, options: GROUPS, value: v('group', startGroup) },
          { id: 'role', type: 'text', label: 'Основна роль', reqIf: isCrew, half: true, max: 80, ph: 'Наприклад: Rescue Operations Lead', value: v('role', '') },
          { id: 'sport', type: 'text', label: 'Спортивна роль', showIf: isCrew, reqIf: isCrew, max: 80, ph: 'Наприклад: Big-Wave Athlete & Jet Ski Pilot', hint: 'Лише для Crew', value: v('sport', '') },
          { id: 'proof', type: 'textarea', label: 'Рядок про досягнення', showIf: isCrew, max: 300, rows: 3, hint: 'Лише для Crew. На сайті — у вікні «Read more»', value: v('proof', '') },
          { id: 'ig', type: 'text', inputType: 'url', label: 'Instagram', ph: 'https://www.instagram.com/…', hint: function (vals) { return isCrew(vals) ? 'На сайті — у вікні «Read more»' : 'На сайті — посилання під імʼям'; }, value: v('ig', '') }
        ] },
        { title: 'Портрет', fields: [
          { id: 'portrait', type: 'photo', label: 'Портрет', req: true, limit: 10,
            ratio: function (vals) { return isCrew(vals) ? [4, 5] : [1, 1, 'round']; },
            hint: function (vals) { return isCrew(vals) ? 'Crew: пропорція 4:5, мінімум 1200×1500 px' : 'Інші групи: 1:1, на сайті — кругле фото, мінімум 400×400 px'; },
            value: v('portrait', null), sub: { author: v('portraitAuthor', '') } }
        ] }
      ],
      onSave: function (val, status) {
        var rec = { name: val.name.trim(), group: val.group, role: val.role, sport: val.sport, proof: val.proof, ig: val.ig.trim(), portrait: val.portrait, portraitAuthor: val.portrait_author };
        return A.ops.save('members', id, rec, status, rec.name);
      },
      afterSave: function () { if (recId === 'new') history.replaceState(null, '', '#/members/' + encodeURIComponent(id)); }
    });
  };

  // Тексти сторінки Club
  A.screens.clubTexts = function (root) {
    var P = (A.data.pages || {}).club || {};
    var v = function (k, d) { return P[k] != null && P[k] !== '' ? P[k] : d; };
    return A.form(root, {
      title: 'Тексти сторінки Club', back: { label: 'Учасники', href: '#/members' }, footer: 'save', liveTitle: false,
      meta: 'Перший екран, заголовок блоку Crew і текст Community', footMeta: 'Зміни зʼявляться на сайті після збереження',
      sections: [
        { title: 'Перший екран', fields: [
          { id: 'title', type: 'text', label: 'Заголовок', req: true, max: 80, value: v('title', 'The people of TAKE HIGH') },
          { id: 'intro', type: 'textarea', label: 'Вступ', req: true, max: 1000, rows: 6, hint: 'Англійською', value: v('intro', '') },
          { id: 'heroImg', type: 'photo', label: 'Фото першого екрана', req: true, limit: 10, value: v('heroImg', null), sub: { author: v('heroAuthor', '') } }
        ] },
        { title: 'Блоки', fields: [
          { id: 'tagline', type: 'text', label: 'Заголовок блоку Crew', max: 60, value: v('tagline', '') },
          { id: 'community', type: 'textarea', label: 'Текст Community', max: 300, rows: 3, hint: 'Якщо порожньо, блок Community на сайті не показується', value: P.community || '' }
        ] }
      ],
      onSave: function (val) {
        return A.ops.page('club', { title: val.title, intro: val.intro, heroImg: val.heroImg, heroAuthor: val.heroImg_author, tagline: val.tagline, community: val.community }, 'Сторінка Club');
      }
    });
  };
})();
