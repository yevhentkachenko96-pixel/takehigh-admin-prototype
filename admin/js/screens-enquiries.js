/* Звернення: вхідні заявки з форм сайту. Статус, відповідальний, наступна дія, відповідь листом, історія.
   Головне джерело — файли в Dropbox (enquiries/), Google-таблиця отримує копію змін (резерв). */
(function () {
  'use strict';
  var A = window.A, esc = A.esc, icon = A.icon;
  A.screens = A.screens || {};

  var STATUSES = [['New', 'Нове'], ['In progress', 'В роботі'], ['Waiting', 'Чекаємо відповіді'], ['Closed', 'Закрито']];
  var SNAME = {}; STATUSES.forEach(function (s) { SNAME[s[0]] = s[1]; });
  var TYPE = { partnership: 'Partnership', press: 'Press' };
  var cache = null, filter = 'open', query = '';

  var fdt = function (iso) { var d = new Date(iso); if (isNaN(d)) return iso || ''; var z = function (n) { return ('0' + n).slice(-2); }; return z(d.getDate()) + '.' + z(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()); };
  var ago = function (iso) {
    var m = Math.round((Date.now() - new Date(iso)) / 60000); if (isNaN(m)) return '';
    if (m < 1) return 'щойно'; if (m < 60) return m + ' хв тому'; var h = Math.round(m / 60); if (h < 24) return h + ' год тому';
    var d = Math.round(h / 24); return d < 7 ? d + ' дн тому' : fdt(iso).slice(0, 10);
  };
  var owners = function () { return (A.data.members || []).filter(function (m) { return m.status === 'pub'; }); };
  var ownerName = function (id) { var m = (A.data.members || []).concat(A.data.membersDeleted || []).find(function (x) { return x.id === id; }); return m ? m.name : ''; };
  var initials = function (n) { return String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); };
  var statusOf = function (e) { return SNAME[e.status] ? e.status : 'New'; };
  function pill(st) { return '<span class="eq-pill eq-' + st.replace(/\s+/g, '-').toLowerCase() + '">' + esc(SNAME[st] || st) + '</span>'; }

  function load(force) {
    if (cache && !force) return Promise.resolve(cache);
    return window.THStorage.listEnquiries(300).then(function (L) { cache = L.sort(function (a, b) { return a.created < b.created ? 1 : -1; }); return cache; });
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

  function visible(L) {
    var q = query.trim().toLowerCase();
    return L.filter(function (e) {
      var st = statusOf(e);
      if (filter === 'open' && st === 'Closed') return false;
      if (filter !== 'open' && filter !== 'all' && st !== filter) return false;
      return !q || [e.name, e.company, e.email].join(' ').toLowerCase().indexOf(q) >= 0;
    });
  }
  function counts(L) { var c = { all: L.length, open: 0 }; STATUSES.forEach(function (s) { c[s[0]] = 0; }); L.forEach(function (e) { var st = statusOf(e); c[st]++; if (st !== 'Closed') c.open++; }); return c; }

  function listHtml(L, activeId) {
    var c = counts(L), V = visible(L);
    var chips = [['open', 'Відкриті'], ['New', 'Нові'], ['In progress', 'В роботі'], ['Waiting', 'Чекаємо'], ['Closed', 'Закриті'], ['all', 'Усі']];
    var h = '<div class="eq-filters" role="group" aria-label="Фільтр за статусом">' + chips.map(function (ch) {
      return '<button class="eq-chip" type="button" data-eqf="' + ch[0] + '" aria-pressed="' + (filter === ch[0]) + '">' + ch[1] + ' <span>' + c[ch[0]] + '</span></button>';
    }).join('') + '</div>' +
      '<div class="search eq-search"><span class="search-ico" aria-hidden="true">' + icon('search', 'i-sm') + '</span><input class="input" id="eq-q" type="search" placeholder="Імʼя, компанія або email" aria-label="Пошук звернень" value="' + esc(query) + '"></div>';
    if (!V.length) return h + '<div class="eq-empty">' + (L.length ? 'Нічого не знайдено.' : 'Звернень ще немає. Тут зʼявляться заявки з форми Partnership enquiry.') + '</div>';
    return h + '<ul class="eq-list" aria-label="Звернення">' + V.map(function (e) {
      var st = statusOf(e), own = ownerName(e.owner);
      return '<li><a class="eq-item' + (e.id === activeId ? ' is-active' : '') + (st === 'New' ? ' is-new' : '') + '" href="#/enquiries/' + encodeURIComponent(e.id) + '"' + (e.id === activeId ? ' aria-current="true"' : '') + '>' +
        '<span class="eq-top"><b>' + esc(e.name || '—') + '</b><time datetime="' + esc(e.created) + '">' + esc(ago(e.created)) + '</time></span>' +
        '<span class="eq-sub">' + esc([e.company, TYPE[e.type] || e.type, e.direction].filter(Boolean).join(' · ')) + '</span>' +
        '<span class="eq-snip">' + esc(String(e.message || '').slice(0, 120)) + '</span>' +
        '<span class="eq-meta">' + pill(st) + (own ? '<span class="eq-owner" title="Відповідальний: ' + esc(own) + '"><i>' + esc(initials(own)) + '</i>' + esc(own.split(' ')[0]) + '</span>' : '<span class="eq-owner none">Без відповідального</span>') + '</span></a></li>';
    }).join('') + '</ul>';
  }

  function detailHtml(e) {
    if (!e) return '<div class="eq-blank">' + icon('info') + '<p>Оберіть звернення зліва, щоб переглянути його, призначити відповідального і відповісти.</p></div>';
    var st = statusOf(e), src = e.source || {};
    var h = '<article class="eq-detail" aria-labelledby="eq-h">';
    h += '<a class="crumb eq-back" href="#/enquiries">' + icon('back', 'i-sm') + 'Усі звернення</a>';
    h += '<header class="eq-head"><div><h2 id="eq-h">' + esc(e.name) + (e.company ? ' <span>· ' + esc(e.company) + '</span>' : '') + '</h2>' +
      '<p class="meta">' + esc(TYPE[e.type] || e.type) + ' · ' + esc(fdt(e.created)) + (e.direction ? ' · ' + esc(e.direction) : '') + '</p></div>' +
      '<button class="btn btn-primary" type="button" data-eq="reply">' + icon('ext', 'i-sm') + 'Відповісти листом</button></header>';
    // керування: статус, відповідальний, наступна дія
    h += '<div class="eq-ctrl">';
    h += '<div class="eq-field"><span class="label">Статус</span><div class="seg" role="radiogroup" aria-label="Статус">' + STATUSES.map(function (s) {
      return '<button type="button" role="radio" aria-checked="' + (st === s[0]) + '" class="seg-btn' + (st === s[0] ? ' is-on' : '') + '" data-eqs="' + s[0] + '">' + s[1] + '</button>';
    }).join('') + '</div></div>';
    h += '<div class="eq-field"><label class="label" for="eq-owner">Відповідальний</label><select class="select" id="eq-owner"><option value="">Не призначено</option>' +
      owners().map(function (m) { return '<option value="' + esc(m.id) + '"' + (m.id === e.owner ? ' selected' : '') + '>' + esc(m.name) + '</option>'; }).join('') +
      (e.owner && !owners().some(function (m) { return m.id === e.owner; }) ? '<option value="' + esc(e.owner) + '" selected>' + esc(ownerName(e.owner) || e.owner) + '</option>' : '') + '</select></div>';
    h += '<div class="eq-field eq-next"><label class="label" for="eq-next">Наступна дія і строк</label><div class="eq-next-row"><input class="input" id="eq-next" maxlength="200" placeholder="Наприклад: надіслати презентацію до 15.11" value="' + esc(e.next || '') + '"><button class="btn btn-secondary" type="button" data-eq="next">Зберегти</button></div></div>';
    h += '</div>';
    h += '<section class="eq-msg" aria-label="Текст звернення"><span class="label">' + (e.type === 'press' ? 'Message' : 'Objective') + '</span><p>' + esc(e.message || '') + '</p></section>';
    h += '<dl class="eq-kv">' +
      '<div><dt>Email</dt><dd><a href="mailto:' + esc(e.email) + '">' + esc(e.email) + '</a></dd></div>' +
      (e.company ? '<div><dt>Компанія</dt><dd>' + esc(e.company) + '</dd></div>' : '') +
      '<div><dt>Звідки</dt><dd>' + esc([src.page, src.form].filter(Boolean).join(' · ') || '—') + (src.utm ? '<br><span class="meta">' + esc(src.utm) + '</span>' : '') + '</dd></div>' +
      '<div><dt>Згода з Privacy Notice</dt><dd>' + (e.consent ? 'Так · ' + esc(fdt(e.consent.at)) + ' · версія ' + esc(e.consent.version) : 'Ні') + '</dd></div>' +
      (e.lastReply ? '<div><dt>Остання відповідь</dt><dd>' + esc(fdt(e.lastReply)) + '</dd></div>' : '') + '</dl>';
    var hist = [{ at: e.created, who: e.name, act: 'Надіслано з сайту' }].concat(e.history || []).slice().reverse();
    h += '<section class="eq-hist" aria-label="Історія"><span class="label">Історія</span><ol>' + hist.map(function (x) {
      return '<li><span class="dot" aria-hidden="true"></span><div><b>' + esc(x.act) + '</b><span class="meta">' + esc(x.who || '') + ' · ' + esc(fdt(x.at)) + '</span></div></li>';
    }).join('') + '</ol></section>';
    return h + '</article>';
  }

  A.screens.enquiries = function (root, id) {
    var active = id || null, had = !!cache;
    function draw() {
      var L = cache || [], e = active ? L.find(function (x) { return x.id === active; }) : null;
      var ae = document.activeElement, keep = ae && root.contains(ae) ? ae.id : null, cs = null;
      try { if (keep === 'eq-q') cs = ae.selectionStart; } catch (x) {}
      root.innerHTML = '<div class="eq' + (active ? ' has-detail' : '') + '"><header class="page-head"><div class="head-left"><h1>Звернення</h1><span class="meta">Заявки з форм сайту. Копія кожної зміни йде в Google-таблицю</span></div>' +
        '<button class="btn btn-secondary" type="button" data-eq="refresh">Оновити</button></header>' +
        '<div class="eq-grid"><aside class="eq-side">' + listHtml(L, active) + '</aside><div class="eq-main">' + (active && !e ? '<div class="eq-blank"><p>Звернення не знайдено.</p></div>' : detailHtml(e)) + '</div></div></div>';
      if (keep) { var k = document.getElementById(keep); if (k) { k.focus(); try { if (cs != null) k.setSelectionRange(cs, cs); } catch (x) {} } }
    }
    function save(e, patch, act, okMsg) {
      return change(e, patch, act).then(function () { draw(); A.toast(okMsg); }, function (er) { draw(); A.saveError(er); });
    }
    root.onclick = function (ev) {
      var f = ev.target.closest('[data-eqf]'); if (f) { filter = f.getAttribute('data-eqf'); draw(); return; }
      var L = cache || [], e = L.find(function (x) { return x.id === active; });
      var s = ev.target.closest('[data-eqs]');
      if (s && e) { var ns = s.getAttribute('data-eqs'); if (ns !== statusOf(e)) save(e, { status: ns }, 'Статус: ' + SNAME[ns], 'Статус змінено'); return; }
      var b = ev.target.closest('[data-eq]'); if (!b) return;
      var act = b.getAttribute('data-eq');
      if (act === 'refresh') { root.querySelector('.eq-side').innerHTML = '<p class="meta" style="padding:12px">Оновлення…</p>'; load(true).then(draw, function (er) { draw(); A.saveError(er); }); }
      else if (act === 'next' && e) { var v = document.getElementById('eq-next').value.trim(); if (v !== (e.next || '')) save(e, { next: v }, v ? 'Наступна дія: ' + v : 'Наступну дію прибрано', 'Збережено'); }
      else if (act === 'reply' && e) {
        // лист відкривається у вашій пошті; статус стає «Чекаємо відповіді»
        var subj = 'Re: ' + (TYPE[e.type] || 'Enquiry') + ' enquiry' + (e.company ? ' — ' + e.company : '');
        var body = 'Hi ' + String(e.name || '').split(' ')[0] + ',\n\n\n\n—\nTAKE HIGH\n\n> ' + String(e.message || '').slice(0, 1200).replace(/\n/g, '\n> ');
        window.location.href = 'mailto:' + encodeURIComponent(e.email) + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body);
        var patch = { lastReply: new Date().toISOString() }; if (statusOf(e) !== 'Closed') patch.status = 'Waiting';
        save(e, patch, 'Відкрито лист-відповідь у пошті', 'Лист відкрито у вашій пошті. Статус: «Чекаємо відповіді»');
      }
    };
    root.onchange = function (ev) {
      if (ev.target.id !== 'eq-owner') return;
      var e = (cache || []).find(function (x) { return x.id === active; }); if (!e) return;
      var v = ev.target.value, patch = { owner: v };
      if (v && statusOf(e) === 'New') patch.status = 'In progress';
      save(e, patch, v ? 'Відповідальний: ' + ownerName(v) : 'Відповідального знято', v ? 'Призначено: ' + ownerName(v) : 'Відповідального знято');
    };
    root.oninput = function (ev) { if (ev.target.id === 'eq-q') { query = ev.target.value; draw(); } };
    root.onkeydown = function (ev) { if (ev.target.id === 'eq-next' && ev.key === 'Enter') { ev.preventDefault(); var b = root.querySelector('[data-eq="next"]'); if (b) b.click(); } };
    if (cache) draw();
    else {
      root.innerHTML = '<div class="state-box"><p class="meta">Завантаження звернень…</p></div>';
      load().then(draw, function (er) { root.innerHTML = '<div class="state-box"><h1 style="margin:0;font-size:20px">Не вдалося завантажити звернення</h1><p style="margin:0">' + esc(er.message || '') + '</p></div>'; });
    }
    if (had && !id) load(true).then(function () { if (document.contains(root)) draw(); }, function () {});
  };
})();
