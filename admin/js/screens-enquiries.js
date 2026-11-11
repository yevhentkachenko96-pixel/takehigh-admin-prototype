/* Звернення і Підписки: вхідні з форм сайту.
   Звернення — таблиця як в інших розділах, картка звернення — окрема сторінка (статус і відповідальний — випадні списки).
   Головне джерело — файли в Dropbox (enquiries/, subscribers/), Google-таблиця отримує копію (резерв). */
(function () {
  'use strict';
  var A = window.A, esc = A.esc, icon = A.icon;
  A.screens = A.screens || {};

  var STATUSES = [['New', 'Нове'], ['In progress', 'В роботі'], ['Waiting', 'Чекаємо відповіді'], ['Closed', 'Закрито']];
  var SNAME = {}; STATUSES.forEach(function (s) { SNAME[s[0]] = s[1]; });
  var TONES = { 'Нове': 'new', 'В роботі': 'prog', 'Чекаємо відповіді': 'wait', 'Закрито': 'closed' };
  var TYPE = { partnership: 'Partnership', press: 'Press' };
  var NO_OWNER = 'Не призначено';
  var cache = null;

  var z = function (n) { return ('0' + n).slice(-2); };
  var fdt = function (iso) { var d = new Date(iso); if (isNaN(d)) return iso || ''; return z(d.getDate()) + '.' + z(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()); };
  var owners = function () { return (A.data.members || []).filter(function (m) { return m.status === 'pub'; }); };
  var ownerName = function (id) { var m = (A.data.members || []).concat(A.data.membersDeleted || []).find(function (x) { return x.id === id; }); return m ? m.name : ''; };
  var statusOf = function (e) { return SNAME[e.status] ? e.status : 'New'; };
  var topicOf = function (e) { return e.topic || TYPE[e.type] || e.type || '—'; };
  var lastChange = function (e) { var h = e.history || []; return h.length ? h[h.length - 1].at : e.created; };

  function load(force) {
    if (cache && !force) return Promise.resolve(cache);
    return window.THStorage.listEnquiries(500).then(function (L) { cache = L.sort(function (a, b) { return a.created < b.created ? 1 : -1; }); return cache; });
  }
  // копія змін у Google-таблицю (скрипт знаходить рядок за ID)
  function toSheet(e) {
    var url = (window.TH_CONFIG || {}).sheetsUrl; if (!url) return;
    try { fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ type: 'update', id: e.id, status: statusOf(e), owner: ownerName(e.owner), lastReply: e.lastReply || '', next: e.next || '' }) }).catch(function () {}); } catch (x) {}
  }
  function change(e, patch, act) {
    var old = JSON.parse(JSON.stringify(e));
    Object.keys(patch).forEach(function (k) { e[k] = patch[k]; });
    e.history = (e.history || []).concat([{ at: new Date().toISOString(), who: A.user || 'Адміністратор', act: act }]);
    return window.THStorage.updateEnquiry(e).then(function () { toSheet(e); return e; }, function (er) { Object.keys(e).forEach(function (k) { delete e[k]; }); Object.assign(e, old); throw er; });
  }
  // статус і відповідальний: призначення відповідального переводить нове звернення в «В роботі»
  function statusPatch(e, v) { return { patch: { status: v }, act: 'Статус: ' + SNAME[v] }; }
  function ownerPatch(e, v) {
    var p = { owner: v }; if (v && statusOf(e) === 'New') p.status = 'In progress';
    return { patch: p, act: v ? 'Відповідальний: ' + ownerName(v) : 'Відповідального знято' };
  }

  function reply(e) {
    // лист відкривається у вашій пошті; статус стає «Чекаємо відповіді»
    var subj = 'Re: ' + topicOf(e) + ' enquiry' + (e.company ? ' — ' + e.company : '');
    var body = 'Hi ' + String(e.name || '').split(' ')[0] + ',\n\n\n\n—\nTAKE HIGH\n\n> ' + String(e.message || '').slice(0, 1200).replace(/\n/g, '\n> ');
    window.location.href = 'mailto:' + encodeURIComponent(e.email) + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
    var patch = { lastReply: new Date().toISOString() }; if (statusOf(e) !== 'Closed') patch.status = 'Waiting';
    return change(e, patch, 'Відкрито лист-відповідь у пошті');
  }

  function loading(root, what, again) {
    root.innerHTML = '<div class="state-box"><p class="meta">Завантаження ' + what + '…</p></div>';
    return function (er) { root.innerHTML = '<div class="state-box"><h1 style="margin:0;font-size:20px">Не вдалося завантажити ' + what + '</h1><p style="margin:0">' + esc(er && er.message || '') + '</p><div><button class="btn btn-primary" type="button" id="eq-retry">Спробувати ще раз</button></div></div>'; document.getElementById('eq-retry').onclick = again; };
  }

  /* ---------- список звернень ---------- */
  function listScreen(root) {
    var ctl = A.list(root, {
      title: 'Звернення', memoryKey: 'enquiries', titleKey: 'name', editLabel: 'Відкрити', selectable: false,
      note: 'Заявки з форм сайту: «Get in touch» на Home і Partnership enquiry. Статус і відповідального змінюють у картці звернення. Копія кожної зміни йде в Google-таблицю.',
      emptyTitle: 'Звернень ще немає', emptyText: 'Тут зʼявляться заявки з форм сайту.',
      sort: { key: 'date', dir: 'desc' },
      search: { key: 'q', ph: 'Імʼя, компанія або email' },
      filters: [
        { key: 'status', label: 'Статус', options: STATUSES.map(function (s) { return s[0]; }), names: SNAME },
        { key: 'owner', label: 'Відповідальний', options: [NO_OWNER].concat(owners().map(function (m) { return m.name; })) },
        { key: 'topic', label: 'Тема', options: (function () { var u = []; (cache || []).forEach(function (e) { var t = topicOf(e); if (u.indexOf(t) < 0) u.push(t); }); return u.sort(); })() }
      ],
      headButtons: [{ key: 'refresh', label: 'Оновити', run: function () { load(true).then(function () { ctl.render(); A.toast('Список оновлено'); }, A.saveError); } }],
      actions: ['edit', { key: 'reply', label: 'Відповісти листом', run: function (id) { var e = cache.find(function (x) { return x.id === id; }); if (e) reply(e).then(function () { ctl.render(); A.toast('Лист відкрито у вашій пошті. Статус: «Чекаємо відповіді»'); }, A.saveError); } }],
      entityLabel: 'звернення', entityForms: ['звернення', 'звернень'],
      cols: [
        { key: 'date', label: 'Дата', sortable: true, nowrap: true, firstDir: 'desc' },
        { key: 'name', label: 'Імʼя', kind: 'link', sortable: true },
        { key: 'company', label: 'Компанія', sortable: true },
        { key: 'topic', label: 'Тема', sortable: true },
        { key: 'st', label: 'Статус', kind: 'pill', tones: TONES, sortable: true },
        { key: 'owner', label: 'Відповідальний', sortable: true },
        { key: 'changed', label: 'Змінено', kind: 'muted', sortable: true, firstDir: 'desc' }
      ],
      rows: function () {
        return (cache || []).map(function (e) {
          var own = ownerName(e.owner), st = statusOf(e);
          return { id: e.id, href: '#/enquiries/' + encodeURIComponent(e.id),
            f: { status: st, owner: own || NO_OWNER, topic: topicOf(e) },
            c: { date: fdt(e.created), name: e.name || '—', company: e.company || '', email: e.email, topic: topicOf(e) + (e.group ? ' · ' + e.group : ''), st: SNAME[st], owner: own, changed: fdt(lastChange(e)),
              q: [e.name, e.company, e.email].join(' ') },
            s: { date: e.created, st: STATUSES.map(function (s) { return s[0]; }).indexOf(st), changed: lastChange(e) } };
        });
      }
    });
    return ctl;
  }

  /* ---------- картка звернення ---------- */
  function cardScreen(root, id) {
    var e = (cache || []).find(function (x) { return x.id === id; });
    if (!e) { A.notFound(root, 'Звернення не знайдено', '#/enquiries', 'До звернень'); return; }
    function draw() {
      var st = statusOf(e), src = e.source || {}, msgLabel = e.type === 'press' ? 'Message' : e.type === 'partnership' ? 'Objective' : 'Повідомлення';
      var h = '<div class="form-page"><header class="page-head"><div class="head-left"><a class="crumb" href="#/enquiries">' + icon('back', 'i-sm') + 'Звернення</a>' +
        '<div class="head-row"><h1>' + esc(e.name || '—') + (e.company ? ' · ' + esc(e.company) : '') + '</h1><span class="pill pill-' + TONES[SNAME[st]] + '">' + esc(SNAME[st]) + '</span></div>' +
        '<span class="meta">' + esc(topicOf(e)) + (e.group ? ' · ' + esc(e.group) : '') + (e.direction ? ' · ' + esc(e.direction) : '') + ' · надіслано ' + esc(fdt(e.created)) + '</span></div>' +
        '<button class="btn btn-primary" type="button" data-eq="reply">' + icon('ext', 'i-sm') + 'Відповісти листом</button></header>';
      h += '<div class="eq-card"><div style="display:flex;flex-direction:column;gap:16px;min-width:0">';
      h += '<section class="section"><div class="section-head"><h2>' + msgLabel + '</h2></div><p class="eq-msg">' + (e.message ? esc(e.message) : '<span class="meta">Без повідомлення</span>') + '</p></section>';
      h += '<section class="section"><div class="section-head"><h2>Контакти і джерело</h2></div><dl class="eq-dl">' +
        '<dt>Email</dt><dd><a href="mailto:' + esc(e.email) + '">' + esc(e.email) + '</a></dd>' +
        (e.company ? '<dt>Компанія</dt><dd>' + esc(e.company) + '</dd>' : '') +
        '<dt>Тема</dt><dd>' + esc(topicOf(e)) + (e.direction ? ' · ' + esc(e.direction) : '') + '</dd>' +
        (e.group ? '<dt>Розмір групи</dt><dd>' + esc(e.group) + '</dd>' : '') +
        '<dt>Звідки</dt><dd>' + esc([src.page, src.form].filter(Boolean).join(' · ') || '—') + (src.utm ? '<br><span class="meta">' + esc(src.utm) + '</span>' : '') + '</dd>' +
        '<dt>Згода</dt><dd>' + (e.consent ? 'Так · ' + esc(fdt(e.consent.at)) + ' · версія ' + esc(e.consent.version) : 'Ні') + '</dd>' +
        (e.lastReply ? '<dt>Остання відповідь</dt><dd>' + esc(fdt(e.lastReply)) + '</dd>' : '') + '</dl></section>';
      h += '</div><aside class="eq-side-box"><section class="section" style="gap:14px">' +
        '<div class="field"><label class="label" for="eq-status">Статус</label><select class="select" id="eq-status">' + STATUSES.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === st ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label class="label" for="eq-owner">Відповідальний</label><select class="select" id="eq-owner"><option value="">Не призначено</option>' +
        owners().map(function (m) { return '<option value="' + esc(m.id) + '"' + (m.id === e.owner ? ' selected' : '') + '>' + esc(m.name) + '</option>'; }).join('') +
        (e.owner && !owners().some(function (m) { return m.id === e.owner; }) ? '<option value="' + esc(e.owner) + '" selected>' + esc(ownerName(e.owner) || e.owner) + '</option>' : '') + '</select><div class="below"><span class="hint">Учасники з розділу Учасники. Призначення переводить нове звернення в «В роботі»</span></div></div>' +
        '<div class="field"><label class="label" for="eq-next">Наступна дія і строк</label><input class="input" id="eq-next" maxlength="200" placeholder="Наприклад: надіслати презентацію до 15.11" value="' + esc(e.next || '') + '">' +
        '<div><button class="btn btn-secondary btn-sm" type="button" data-eq="next">Зберегти дію</button></div></div></section>';
      var hist = [{ at: e.created, who: e.name, act: 'Надіслано з сайту' }].concat(e.history || []).slice().reverse();
      h += '<section class="section"><div class="section-head"><h2>Історія</h2></div><ol class="eq-hist2">' + hist.map(function (x) {
        return '<li><b>' + esc(x.act) + '</b><span class="meta">' + esc(x.who || '') + ' · ' + esc(fdt(x.at)) + '</span></li>';
      }).join('') + '</ol></section></aside></div></div>';
      var ae = document.activeElement, keep = ae && root.contains(ae) ? ae.id : null;
      root.innerHTML = h;
      if (keep) { var k = document.getElementById(keep); if (k) k.focus(); }
    }
    function save(p, okMsg) { return change(e, p.patch, p.act).then(function () { draw(); A.toast(okMsg); }, function (er) { draw(); A.saveError(er); }); }
    root.onclick = function (ev) {
      var b = ev.target.closest('[data-eq]'); if (!b) return;
      var act = b.getAttribute('data-eq');
      if (act === 'next') { var v = document.getElementById('eq-next').value.trim(); if (v !== (e.next || '')) save({ patch: { next: v }, act: v ? 'Наступна дія: ' + v : 'Наступну дію прибрано' }, 'Збережено'); else A.toast('Нічого не змінено'); }
      else if (act === 'reply') reply(e).then(function () { draw(); A.toast('Лист відкрито у вашій пошті. Статус: «Чекаємо відповіді»'); }, function (er) { draw(); A.saveError(er); });
    };
    root.onchange = function (ev) {
      if (ev.target.id === 'eq-status' && ev.target.value !== statusOf(e)) save(statusPatch(e, ev.target.value), 'Статус: ' + SNAME[ev.target.value]);
      if (ev.target.id === 'eq-owner') { var v = ev.target.value; save(ownerPatch(e, v), v ? 'Призначено: ' + ownerName(v) : 'Відповідального знято'); }
    };
    root.oninput = null;
    root.onkeydown = function (ev) { if (ev.target.id === 'eq-next' && ev.key === 'Enter') { ev.preventDefault(); root.querySelector('[data-eq="next"]').click(); } };
    draw();
  }

  A.screens.enquiries = function (root, id) {
    function go() { if (id) cardScreen(root, id); else listScreen(root); }
    if (cache) { if (id) { go(); return; } var ctl = listScreen(root); load(true).then(function () { if (document.contains(root)) ctl.render(); }, function () {}); return; }
    var fail = loading(root, 'звернень', function () { A.screens.enquiries(root, id); });
    load().then(go, fail);
  };

  /* ---------- Підписки «Follow the updates» ---------- */
  var subs = null;
  function loadSubs(force) {
    if (subs && !force) return Promise.resolve(subs);
    return window.THStorage.listSubscribers().then(function (L) { subs = L.map(function (s) { if (!s.id) s.id = s.email; return s; }).sort(function (a, b) { return a.created < b.created ? 1 : -1; }); return subs; });
  }
  function csv(rows) {
    var q = function (v) { v = String(v == null ? '' : v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var L = [['Email', 'Дата підписки', 'Звідки', 'Згода: дата', 'Згода: версія']].concat(rows.map(function (s) { var src = s.source || {}; return [s.email, fdt(s.created), [src.page, src.form].filter(Boolean).join(' · '), s.consent ? fdt(s.consent.at) : '', s.consent ? s.consent.version : '']; }));
    var blob = new Blob(['﻿' + L.map(function (r) { return r.map(q).join(','); }).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'takehigh-subscribers-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  A.screens.subscribers = function (root) {
    var ctl;
    function show() {
      ctl = A.list(root, {
        title: 'Підписки', memoryKey: 'subscribers', titleKey: 'email', selectable: true,
        note: 'Email-адреси з блоку «Follow the updates» і теми «Follow the Updates» у формі на Home. Одна адреса — один запис: повторна підписка не створює дубль. Розсилки звідси не надсилаються; для сервісу розсилок — експорт у CSV.',
        emptyTitle: 'Підписок ще немає', emptyText: 'Тут зʼявляться адреси з форми «Follow the updates».',
        sort: { key: 'date', dir: 'desc' }, search: { key: 'email', ph: 'Пошук за email' },
        filters: [{ key: 'form', label: 'Звідки', options: ['Follow the updates', 'Get in touch'] }],
        headButtons: [
          { key: 'refresh', label: 'Оновити', run: function () { loadSubs(true).then(function () { ctl.render(); A.toast('Список оновлено'); }, A.saveError); } },
          { key: 'csv', label: 'Експорт CSV', icon: 'ext', run: function (ids) { var R = subs.filter(function (s) { return ids.indexOf(s.id) >= 0; }); if (!R.length) { A.toast('Немає адрес для експорту', true); return; } csv(R); A.toast('Експортовано адрес: ' + R.length); } }
        ],
        actions: ['delete'], entityLabel: 'підписку', entityForms: ['підписки', 'підписок'],
        confirmText: function (ids, titles) { return (ids.length === 1 ? 'Адресу ' + titles[0] + ' буде видалено зі списку.' : 'Буде видалено адрес: ' + ids.length + '.') + ' Людина зможе підписатися знову. Скасувати дію не можна.'; },
        onDelete: function (ids) { var R = subs.filter(function (s) { return ids.indexOf(s.id) >= 0; }); return window.THStorage.deleteSubscribers(R).then(function () { subs = subs.filter(function (s) { return ids.indexOf(s.id) < 0; }); return R.length; }); },
        cols: [
          { key: 'email', label: 'Email', sortable: true },
          { key: 'date', label: 'Дата підписки', sortable: true, nowrap: true, firstDir: 'desc' },
          { key: 'form', label: 'Звідки', sortable: true }
        ],
        rows: function () {
          return (subs || []).map(function (s) {
            var src = s.source || {};
            return { id: s.id, href: 'mailto:' + s.email, f: { form: src.form || '' }, c: { email: s.email, date: fdt(s.created), form: src.form || '—' }, s: { date: s.created } };
          });
        }
      });
    }
    if (subs) { show(); loadSubs(true).then(function () { if (document.contains(root)) ctl.render(); }, function () {}); return; }
    var fail = loading(root, 'підписок', function () { A.screens.subscribers(root); });
    loadSubs().then(show, fail);
  };
})();
