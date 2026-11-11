/* TAKE HIGH · сайт. Поведінка Home — з прототипу «TAKE HIGH Homepage V3»; тексти, фото і списки — з даних адмінки. */

/* ---------- поведінка сторінки (з прототипу V3) ---------- */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TH = window.THSite = {};

  /* header: суцільний після відео, ховається при прокрутці вниз; на внутрішніх сторінках суцільний одразу (CSS body.inner) */
  var top = document.getElementById('top'), hero = document.querySelector('.hero'), home = document.getElementById('home');
  var lastY = window.scrollY;
  function onS() {
    var y = window.scrollY;
    top.classList.toggle('solid', home.hidden || y > hero.offsetHeight - 100);
    if (y > lastY + 4 && y > 200) top.classList.add('hide');
    else if (y < lastY - 4 || y <= 200) top.classList.remove('hide');
    lastY = y;
  }
  addEventListener('scroll', onS, { passive: true }); onS();
  TH.onScroll = onS;

  /* відео: кнопка паузи; без автозапуску, якщо в системі вимкнено анімацію */
  var v = document.getElementById('hv'), vb = document.getElementById('vbtn'), vi = document.getElementById('vicon');
  function setV(play) { if (play) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); vi.setAttribute('d', play ? 'M7 5h4v14H7zM13 5h4v14h-4z' : 'M8 5l12 7-12 7z'); vb.setAttribute('aria-label', play ? 'Pause background video' : 'Play background video'); }
  if (reduce) setV(false);
  vb.addEventListener('click', function () { setV(v.paused); });
  TH.pauseVideo = function (on) { if (on) v.pause(); else if (!reduce && vi.getAttribute('d').charAt(1) === '7') { var p = v.play(); if (p && p.catch) p.catch(function () {}); } };

  /* меню */
  var mm = document.getElementById('mmenu'), bg = document.getElementById('burger');
  function openM() { mm.hidden = false; bg.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; document.getElementById('mclose').focus(); }
  function closeM() { mm.hidden = true; bg.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  bg.addEventListener('click', openM); document.getElementById('mclose').addEventListener('click', function () { closeM(); bg.focus(); });
  mm.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeM); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mm.hidden) { closeM(); bg.focus(); } });

  /* Who we are на телефоні: точки йдуть за свайпом і перемикають картку */
  var wc = document.getElementById('whoCards'), wd = [].slice.call(document.querySelectorAll('#whoDots button'));
  function cur() { var w = wc.querySelector('.wcard').offsetWidth + 12; var i = Math.round(wc.scrollLeft / w); wd.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); }); }
  wc.addEventListener('scroll', cur, { passive: true });
  wd.forEach(function (b, k) { b.addEventListener('click', function () { wc.scrollTo({ left: wc.children[k].offsetLeft - wc.children[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' }); }); });

  /* What we do: вкладки (клік або стрілки) */
  var tabs = [].slice.call(document.querySelectorAll('.wtab'));
  function selTab(t, focus) { tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; }); if (focus) t.focus(); }
  tabs.forEach(function (t, i) { t.addEventListener('click', function () { selTab(t); }); t.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); selTab(tabs[(i + d + tabs.length) % tabs.length], true); } }); });

  /* каруселі зі стрілками (картки підставляються з даних, тому стан стрілок оновлюється після кожного рендеру) */
  function updRail(r) { document.querySelectorAll('.arrowbtn[data-rail="' + r.id + '"]').forEach(function (b) { b.disabled = +b.dataset.dir < 0 ? r.scrollLeft < 4 : r.scrollLeft + r.clientWidth >= r.scrollWidth - 4; }); }
  TH.updRails = function () { document.querySelectorAll('.rail').forEach(updRail); };
  document.querySelectorAll('.rail').forEach(function (r) { r.addEventListener('scroll', function () { updRail(r); }, { passive: true }); });
  addEventListener('resize', TH.updRails);
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.arrowbtn[data-rail]'); if (!b) return;
    var r = document.getElementById(b.dataset.rail), c = r && r.querySelector('.rcard'); if (!c) return;
    r.scrollBy({ left: (c.offsetWidth + 24) * (+b.dataset.dir), behavior: reduce ? 'auto' : 'smooth' });
  });

  /* How we work на телефоні: лінія кроків заповнюється при прокрутці; кнопка «Show all 6 steps» */
  (function () {
    var o = document.getElementById('howSteps'); if (!o) return; var mq = matchMedia('(max-width:760px)');
    function upd() {
      var it = o.children, i; if (!mq.matches) { o.style.removeProperty('--fill'); for (i = 0; i < it.length; i++) it[i].classList.remove('on'); return; }
      var r = o.getBoundingClientRect(), f = Math.max(0, Math.min(r.height, innerHeight * 0.6 - r.top)); o.style.setProperty('--fill', f + 'px');
      for (i = 0; i < it.length; i++) it[i].classList.toggle('on', it[i].offsetHeight > 0 && it[i].offsetTop <= f && f > 0);
    }
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd);
    var b = document.querySelector('.steps-more');
    if (b) b.addEventListener('click', function () { var on = o.classList.toggle('open'); b.setAttribute('aria-expanded', on); b.firstChild.textContent = on ? 'Show fewer steps' : 'Show all 6 steps'; setTimeout(upd, 0); });
    upd();
  })();

  /* стрічка, що повільно їде сама (на телефоні): партнери і ролі. reset() — після нового списку */
  function ticker(sel, speed) {
    var l = document.querySelector(sel); if (!l) return { reset: function () {} };
    var mq = matchMedia('(max-width:760px)'), rm = matchMedia('(prefers-reduced-motion:reduce)'), clones = [], pause = 0, vis = false, pos = 0;
    function setup() {
      if (mq.matches && !rm.matches && !clones.length && l.children.length > 1) { [].slice.call(l.children).forEach(function (c) { var k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.classList.add('pclone'); k.tabIndex = -1; l.appendChild(k); clones.push(k); }); }
      else if ((!mq.matches || rm.matches) && clones.length) { clones.forEach(function (c) { c.remove(); }); clones = []; l.scrollLeft = 0; }
    }
    function hold(ms) { pause = Date.now() + ms; }
    var last = 0;
    function tick(t) { requestAnimationFrame(tick); var dt = Math.min(100, t - (last || t)); last = t; if (!clones.length || !vis) return; if (Date.now() < pause) { pos = l.scrollLeft; return; } var half = clones[0].offsetLeft - l.children[0].offsetLeft; pos += dt * speed; if (pos >= half) pos -= half; l.scrollLeft = pos; }
    ['touchstart', 'touchmove', 'pointerdown', 'wheel'].forEach(function (e) { l.addEventListener(e, function () { hold(60000); }, { passive: true }); });
    ['touchend', 'touchcancel', 'pointerup', 'pointercancel'].forEach(function (e) { l.addEventListener(e, function () { hold(2500); }, { passive: true }); });
    l.addEventListener('wheel', function () { hold(2500); }, { passive: true });
    l.addEventListener('focusin', function () { hold(60000); }); l.addEventListener('focusout', function () { hold(1500); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }).observe(l); else vis = true;
    if (mq.addEventListener) mq.addEventListener('change', setup); addEventListener('resize', setup); setup(); requestAnimationFrame(tick);
    return { reset: function () { clones = []; pos = 0; l.scrollLeft = 0; setup(); } };
  }
  TH.partnersTicker = ticker('.plist', 0.024); ticker('.roles', 0.018);

  /* форма-речення: власні випадні списки поверх прихованих select */
  var form = document.getElementById('applyForm'), dds = [];
  function showFields() {
    var t = form.topic.value, follow = t === 'Follow the Updates', grp = /Experience|Team Building|Corporate/.test(t);
    form.querySelectorAll('[data-for="group"]').forEach(function (f) { f.hidden = !grp; });
    form.querySelector('[data-for="msg"]').hidden = follow;
    var n = form.querySelector('[data-for="name"]'); n.hidden = follow; n.querySelector('input').required = !follow;
    document.getElementById('fsendLabel').textContent = follow ? 'Subscribe' : 'Send request';
    dds.forEach(function (d) { d.sync(); });
  }
  form.querySelectorAll('.sline select').forEach(function (sel) {
    var w = document.createElement('span'); w.className = 'dd';
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'dd-btn'; btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', sel.getAttribute('aria-label'));
    btn.innerHTML = '<span class="dd-val"></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';
    var menu = document.createElement('ul'); menu.className = 'dd-menu'; menu.setAttribute('role', 'listbox');
    var opts = [];
    [].forEach.call(sel.children, function (ch) {
      function addOpt(o) { var li = document.createElement('li'); li.className = 'dd-opt'; li.setAttribute('role', 'option'); li.textContent = o.textContent; li.dataset.v = o.value; menu.appendChild(li); opts.push(li); }
      if (ch.tagName === 'OPTGROUP') { var g = document.createElement('li'); g.className = 'dd-group'; g.setAttribute('role', 'presentation'); g.textContent = ch.label; menu.appendChild(g); [].forEach.call(ch.children, addOpt); } else addOpt(ch);
    });
    sel.parentNode.insertBefore(w, sel); w.appendChild(sel); w.appendChild(btn); w.appendChild(menu);
    var act = 0, api;
    function sync() { btn.querySelector('.dd-val').textContent = sel.options[sel.selectedIndex].textContent; opts.forEach(function (o, i) { var on = o.dataset.v === sel.value; o.setAttribute('aria-selected', on ? 'true' : 'false'); if (on) act = i; }); }
    function mark() { opts.forEach(function (o, i) { o.classList.toggle('active', i === act); }); }
    function open() { dds.forEach(function (d) { if (d !== api) d.close(); }); w.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); mark(); }
    function close() { w.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    function pick(i) { sel.value = opts[i].dataset.v; sel.dispatchEvent(new Event('change', { bubbles: true })); sync(); close(); btn.focus(); }
    btn.addEventListener('click', function () { w.classList.contains('open') ? close() : open(); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!w.classList.contains('open')) open(); else { act = (act + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length; mark(); } }
      else if ((e.key === 'Enter' || e.key === ' ') && w.classList.contains('open')) { e.preventDefault(); pick(act); }
      else if (e.key === 'Escape') close();
    });
    opts.forEach(function (o, i) { o.addEventListener('click', function () { pick(i); }); });
    api = { sync: sync, close: close, w: w }; dds.push(api); sync();
  });
  document.addEventListener('click', function (e) { dds.forEach(function (d) { if (!d.w.contains(e.target)) d.close(); }); });
  form.addEventListener('change', showFields); showFields();
  // будь-яка кнопка з data-topic відкриває форму з уже обраною темою
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-topic]'); if (!a) return;
    var t = a.getAttribute('data-topic');
    if ([].some.call(form.topic.options, function (o) { return o.value === t; })) { form.topic.value = t; showFields(); }
  });
  TH.showFields = showFields;
})();

/* ---------- дані і сторінки ---------- */
(function () {
  'use strict';
  var TH = window.THSite;
  var ARR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>';
  var BACK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M14 8H3M7 4L3 8l4 4"/></svg>';
  var XARR = '<svg class="xarr" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12L12 4M6 4h6v6"/></svg>';
  var ERRI = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.8v3.7M8 10.9h.01"/></svg>';
  var CATS = window.TH_CATEGORIES || [], catOf = window.TH_CAT_OF || function () { return ''; };
  var HD = window.TH_HOME_DEFAULTS || {};
  var D = (window.THStorage && THStorage.cached()) || window.TH_DEFAULT || { news: [], tags: [], members: [], partners: [], pages: {} };

  function T(page, key, def) { var p = (D.pages || {})[page] || {}; return p[key] != null && String(p[key]).trim() !== '' ? p[key] : def; }
  function H(k) { return T('home', k, HD[k]); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fd(iso) { var m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '.' + m[2] + '.' + m[1] : '[Date]'; }
  function img(k) {
    if (!k || typeof k !== 'string') return null;
    if (/^v3:/.test(k)) return 'img/v3/' + k.slice(3);
    var lk = window.THStorage && THStorage.localPhoto(k); if (lk) k = lk;
    if (/^(data:|blob:|https?:)/.test(k)) return k;
    var m = window.TH_PHOTOS || {};
    return m[k] ? '../shared/' + m[k] : null;
  }
  function pic(k, alt) { var u = img(k); return u ? '<img src="' + esc(u) + '" alt="' + esc(alt || '') + '" loading="lazy">' : '<span class="ph-empty" aria-hidden="true"></span>'; }
  function slugOf(n) { return n.slug || n.id; }
  function href(n) { return '#/news/' + encodeURIComponent(slugOf(n)); }
  function shownPartners() { return (D.partners || []).filter(function (p) { return p.status === 'pub' && p.perm === true; }); }
  function partnerOf(id) { if (!id) return null; return (D.partners || []).concat(D.partnersDeleted || []).find(function (p) { return p.id === id; }) || null; }
  function member(id) { return (D.members || []).concat(D.membersDeleted || []).find(function (x) { return x.id === id; }) || null; }
  function memberName(id) { var m = member(id); return m ? m.name : id; }
  function memberLink(id) { var m = (D.members || []).find(function (x) { return x.id === id; }); return m && m.status === 'pub' ? '#/club/' + encodeURIComponent(m.id) : null; }
  function paras(t) { return String(t || '').split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) { return '<p>' + esc(x) + '</p>'; }).join(''); }
  function crumbs(items) { return '<nav class="crumbs" aria-label="Breadcrumbs"><a href="#/">Home</a>' + items.map(function (x) { return '<span aria-hidden="true">/</span>' + (x[1] ? '<a href="' + x[1] + '">' + esc(x[0]) + '</a>' : '<span>' + esc(x[0]) + '</span>'); }).join('') + '</nav>'; }

  // опубліковані новини: найновіші за датою; без дати — у порядку з адмінки
  function published() {
    var L = (D.news || []).filter(function (n) { return n.status === 'pub'; });
    return L.map(function (n, i) { return { n: n, i: i }; }).sort(function (a, b) {
      var x = a.n.date || '', y = b.n.date || '';
      if (x && y && x !== y) return x < y ? 1 : -1;
      if (x && !y) return -1; if (!x && y) return 1;
      return a.i - b.i;
    }).map(function (o) { return o.n; });
  }
  function featured(L) { return L.find(function (n) { return n.featured; }) || L[0] || null; }
  function meta(n) { return [catOf(n), fd(n.date)].join(' · '); }
  function bcard(n, cls) { return '<a class="bcard' + (cls ? ' ' + cls : '') + '" href="' + href(n) + '">' + pic(n.img, n.imgCaption || n.title) + '<div class="bcap"><span class="meta">' + esc(meta(n)) + '</span><h3>' + esc(n.title) + '</h3></div></a>'; }
  function ncard(n) { return '<a class="ncard" href="' + href(n) + '"><div class="ph">' + pic(n.img, n.imgCaption || n.title) + '</div><span class="meta">' + esc(meta(n)) + '</span><h3>' + esc(n.title) + '</h3>' + (n.deck ? '<p>' + esc(n.deck) + '</p>' : '') + '</a>'; }
  function top4(L) { var f = featured(L); if (!f) return []; return [f].concat(L.filter(function (n) { return n !== f; }).slice(0, 3)); }
  function bento(L) { return top4(L).map(function (n, i) { return bcard(n, i === 0 ? 'b-feat' : i === 1 ? 'b-wide' : ''); }).join(''); }
  function usedCats(L) { var u = {}; L.forEach(function (n) { u[catOf(n)] = 1; }); return CATS.filter(function (c) { return u[c]; }); }

  /* ---------- Home: тексти і фото з «Тексти Home» ---------- */
  function applyHomeTexts() {
    document.querySelectorAll('#home [data-t]').forEach(function (el) {
      var k = el.getAttribute('data-t'), v = H(k);
      if (el.textContent !== v) el.textContent = v;
      if (k === 'appEmail' && el.tagName === 'A') el.setAttribute('href', 'mailto:' + v);
    });
    document.querySelectorAll('#home [data-img]').forEach(function (el) { var u = img(H(el.getAttribute('data-img'))); if (u && el.getAttribute('src') !== u) el.setAttribute('src', u); });
    var hv = document.getElementById('hv'), pu = img(H('heroPoster')); if (hv && pu && hv.getAttribute('poster') !== pu) hv.setAttribute('poster', pu);
    document.querySelectorAll('#home [data-tl]').forEach(function (ul) {
      var items = String(H(ul.getAttribute('data-tl')) || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      ul.innerHTML = items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    });
    // підписи кнопок-точок Who we are — назви карток
    document.querySelectorAll('#whoDots button').forEach(function (b, i) { b.setAttribute('aria-label', H('who' + (i + 1) + 'Title')); });
  }

  /* ---------- Home: Updates, Real sessions, партнери ---------- */
  var HC = 'All';
  function renderHomeUpdates() {
    var all = published(), cats = usedCats(all);
    if (HC !== 'All' && cats.indexOf(HC) < 0) HC = 'All';
    var ch = document.getElementById('homeChips');
    ch.innerHTML = ['All'].concat(cats).map(function (c) { return '<button class="chip" type="button" data-hcat="' + esc(c) + '" aria-pressed="' + (c === HC) + '">' + esc(c) + '</button>'; }).join('');
    ch.hidden = cats.length < 2;
    var L = HC === 'All' ? all : all.filter(function (n) { return catOf(n) === HC; });
    document.getElementById('homeBento').innerHTML = L.length ? bento(L) : '<p class="empty-note">No updates yet.</p>';
  }
  var PLAY = '<svg viewBox="0 0 10 10"><path d="M1 0l9 5-9 5z"/></svg>';
  function renderHomeSessions() {
    var S = (D.sessions || []).filter(function (s) { return s.status === 'pub'; });
    var sec = document.getElementById('sessions'); sec.hidden = !S.length;
    var news = published();
    document.getElementById('r1').innerHTML = S.map(function (s) {
      var n = s.news ? news.find(function (x) { return x.id === s.news; }) : null;
      var link = s.video ? { h: s.video, ext: true } : n ? { h: href(n) } : null;
      var tag = s.tag === 'Video' ? '<span class="rtag vid">' + PLAY + 'Video</span>' : '<span class="rtag">' + esc(s.tag || 'Photo') + '</span>';
      var inner = '<div class="ph">' + pic(s.img, s.title) + tag + (s.video ? '<span class="rplay" aria-hidden="true"><svg viewBox="0 0 10 10"><path d="M1 0l9 5-9 5z"/></svg></span>' : '') + '</div>' +
        '<span class="meta">' + esc([s.place, s.date ? fd(s.date) : ''].filter(Boolean).join(' · ')) + '</span><h3 class="h3">' + esc(s.title) + '</h3>';
      return link ? '<a class="rcard" href="' + esc(link.h) + '"' + (link.ext ? ' target="_blank" rel="noopener"' : '') + '>' + inner + (link.ext ? '<span class="sr-only"> (video, opens in a new tab)</span>' : '') + '</a>' : '<div class="rcard">' + inner + '</div>';
    }).join('');
    TH.updRails();
  }
  function renderHomePartners() {
    var el = document.getElementById('homePartners'), P = shownPartners();
    el.innerHTML = P.map(function (p) {
      var u = img(p.logo), to = p.site || '#/partnerships';
      return '<a class="prow" href="' + esc(to) + '"' + (p.site ? ' target="_blank" rel="noopener"' : '') + '><span class="plogo">' + (u ? '<img src="' + esc(u) + '" alt="" loading="lazy">' : '') + '</span><span class="pname">' + esc(p.name) + '</span><svg class="parr" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>' + (p.site ? '<span class="sr-only"> (opens in a new tab)</span>' : '') + '</a>';
    }).join('');
    el.hidden = !P.length;
    TH.partnersTicker.reset();
  }
  function renderHome() { applyHomeTexts(); renderHomeUpdates(); renderHomeSessions(); renderHomePartners(); }
  document.getElementById('homeChips').addEventListener('click', function (e) {
    var b = e.target.closest('[data-hcat]'); if (!b) return; HC = b.getAttribute('data-hcat'); renderHomeUpdates();
    var nb = document.querySelector('#homeChips [data-hcat="' + HC.replace(/"/g, '') + '"]'); if (nb) nb.focus();
  });

  /* ---------- форма «Get in touch» → Звернення (і копія в Google-таблицю); тема «Follow the Updates» → Підписки ---------- */
  var form = document.getElementById('applyForm'), aErr = document.getElementById('applyErr'), aDone = document.getElementById('applyDone'), t0 = Date.now(), aBusy = false;
  function sheets(rec) {
    var url = (window.TH_CONFIG || {}).sheetsUrl; if (!url) return;
    try { fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(rec) }).catch(function () {}); } catch (e) {}
  }
  function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function validEmail(v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v || '').trim()); }
  function showErr(el, text, retry) { el.innerHTML = ERRI + '<span>' + esc(text) + (retry ? ' <button type="submit">Try again</button>' : '') + '</span>'; el.hidden = false; }
  function subscribe(email, source) {
    var now = new Date().toISOString();
    var rec = { id: newId(), type: 'subscribe', email: email.trim(), created: now, source: { page: '/', form: source, utm: location.search.replace(/^\?/, '') }, consent: { at: now, version: 'draft-0' } };
    return THStorage.saveSubscriber(rec).then(function () { sheets(rec); return 'ok'; }, function (e) { if (e && e.code === 'exists') return 'exists'; throw e; });
  }
  function setBusy(btn, on, label) { btn.disabled = on; if (on) btn.setAttribute('aria-disabled', 'true'); else btn.removeAttribute('aria-disabled'); var l = btn.querySelector('#fsendLabel') || btn; if (on) { btn.dataset.l = l.textContent; l.textContent = 'Sending...'; } else if (btn.dataset.l) l.textContent = label || btn.dataset.l; }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); if (aBusy) return;
    aErr.hidden = true;
    var follow = form.topic.value === 'Follow the Updates', btn = form.querySelector('.fsend .btn');
    form.querySelectorAll('input').forEach(function (i) { i.removeAttribute('aria-invalid'); });
    if (!follow && !form.name.value.trim()) { form.name.setAttribute('aria-invalid', 'true'); showErr(aErr, 'Enter your name.'); form.name.focus(); return; }
    if (!validEmail(form.email.value)) { form.email.setAttribute('aria-invalid', 'true'); showErr(aErr, 'Enter a valid email address.'); form.email.focus(); return; }
    if (!window.THStorage) { showErr(aErr, 'Sign-up is temporarily unavailable.'); return; }
    // бот: заповнене поле-пастка або відправка швидше ніж за 3 секунди — нічого не зберігаємо
    if (form.website.value || Date.now() - t0 < 3000) { done(follow ? 'ok-sub' : 'ok'); return; }
    aBusy = true; setBusy(btn, true);
    var p;
    if (follow) p = subscribe(form.email.value, 'Get in touch').then(function (r) { return r === 'exists' ? 'exists' : 'ok-sub'; });
    else {
      var now = new Date().toISOString(), topic = form.topic.value, grp = /Experience|Team Building|Corporate/.test(topic);
      var rec = { id: newId(), type: 'contact', topic: topic, created: now, name: form.name.value.trim().slice(0, 80), email: form.email.value.trim(), group: grp ? form.group.value : '',
        message: form.message.value.trim().slice(0, 2000), consent: { at: now, version: 'draft-0' }, source: { page: '/', form: 'Get in touch', utm: location.search.replace(/^\?/, '') }, status: 'New' };
      p = THStorage.saveEnquiry(rec).then(function () { sheets(rec); return 'ok'; });
    }
    p.then(function (r) { aBusy = false; setBusy(btn, false); done(r); }, function (er) {
      console.warn('[TAKE HIGH] форму не збережено:', er && er.message, er && er.detail);
      aBusy = false; setBusy(btn, false); showErr(aErr, 'Something went wrong. Your data was not saved - please try again.', true);
    });
  });
  function done(r) {
    var h = aDone.querySelector('h3'), p = aDone.querySelector('p');
    if (r === 'ok') { h.textContent = H('appDoneTitle'); p.textContent = H('appDoneText'); }
    else if (r === 'ok-sub') { h.textContent = "You're on the list"; p.textContent = "We'll write when something new happens. No spam, unsubscribe any time."; }
    else { h.textContent = "You're already subscribed"; p.textContent = 'This email is already on our list.'; }
    form.hidden = true; aDone.hidden = false; aDone.focus();
  }
  document.getElementById('applyAgain').addEventListener('click', function () {
    form.reset(); TH.showFields(); t0 = Date.now(); aDone.hidden = true; form.hidden = false; aErr.hidden = true;
    var f = form.querySelector('[data-for="name"]:not([hidden]) input') || form.email; f.focus();
  });

  /* ---------- Follow the updates ---------- */
  var sf = document.getElementById('subForm'), sDone = document.getElementById('subDone'), sErr = document.getElementById('subErr'), sBusy = false;
  sf.addEventListener('submit', function (e) {
    e.preventDefault(); if (sBusy) return;
    var inp = document.getElementById('se'), btn = sf.querySelector('.btn'); sErr.hidden = true; inp.removeAttribute('aria-invalid');
    if (!validEmail(inp.value)) { inp.setAttribute('aria-invalid', 'true'); showErr(sErr, 'Enter a valid email address.'); inp.focus(); return; }
    if (!window.THStorage) { showErr(sErr, 'Sign-up is temporarily unavailable.'); return; }
    sBusy = true; setBusy(btn, true);
    subscribe(inp.value, 'Follow the updates').then(function (r) {
      sBusy = false; setBusy(btn, false);
      document.getElementById('subDoneText').textContent = r === 'exists' ? "You're already subscribed." : "You're on the list. Thank you.";
      sDone.classList.toggle('exists', r === 'exists'); sf.hidden = true; sDone.hidden = false;
    }, function (er) {
      console.warn('[TAKE HIGH] підписку не збережено:', er && er.message, er && er.detail);
      sBusy = false; setBusy(btn, false); showErr(sErr, 'Something went wrong. Your email was not saved - please try again.');
    });
  });

  /* ---------- Updates: усі новини ---------- */
  var LM = { key: null, n: 6 };
  function renderLatest(q) {
    var all = published();
    var cat = CATS.indexOf(q.cat) >= 0 ? q.cat : '', tag = String(q.tag || '').toLowerCase();
    var L = all.filter(function (n) { return (!cat || catOf(n) === cat) && (!tag || (n.tags || []).some(function (t) { return String(t).toLowerCase() === tag; })); });
    var used = {}; all.forEach(function (n) { (n.tags || []).forEach(function (t) { used[t] = 1; }); });
    var tags = (D.tags || []).filter(function (t) { return used[t]; }).concat(Object.keys(used).filter(function (t) { return (D.tags || []).indexOf(t) < 0; }).sort());
    var link = function (c, t) { var p = []; if (c) p.push('cat=' + encodeURIComponent(c)); if (t) p.push('tag=' + encodeURIComponent(t)); return '#/news' + (p.length ? '?' + p.join('&') : ''); };
    var cats = usedCats(all);
    var h = '<section class="phead"><div class="wrap">' + crumbs([['Updates']]) +
      '<div class="head"><div><span class="label">' + esc(T('latest', 'label', 'Updates from the team')) + '</span><h1 class="title">' + esc(T('latest', 'title', 'News from the team')) + '</h1></div>' +
      '<p class="lead">' + esc(T('latest', 'intro', 'Session reports, team updates and stories from the people behind TAKE HIGH.')) + '</p></div></div></section>';
    h += '<section class="psec light list-sec"><div class="wrap">';
    h += '<div class="fgroup"><span class="flabel" id="fl-cat">Category</span><div class="chips filters" role="group" aria-labelledby="fl-cat">' +
      '<a class="chip" href="' + link('', tag) + '" aria-pressed="' + (!cat) + '">All</a>' +
      cats.map(function (c) { return '<a class="chip" href="' + link(c, tag) + '" aria-pressed="' + (c === cat) + '">' + esc(c) + '</a>'; }).join('') + '</div></div>';
    if (tags.length) h += '<div class="fgroup"><span class="flabel" id="fl-tag">Tags</span><div class="chips filters" role="group" aria-labelledby="fl-tag">' + tags.map(function (t) {
      return '<a class="chip tagchip" href="' + link(cat, t === tag ? '' : t) + '" aria-pressed="' + (t === tag) + '">#' + esc(t) + '</a>';
    }).join('') + '</div></div>';
    if (!L.length) {
      h += '<div class="empty-box"><h2>Nothing here yet</h2><p class="small">No updates match these filters.</p><a class="btn" href="#/news">Show all updates ' + ARR + '</a></div>';
    } else {
      h += '<div class="list-meta" aria-live="polite"><span>' + L.length + (L.length === 1 ? ' update' : ' updates') + (cat ? ' · ' + esc(cat) : '') + (tag ? ' · #' + esc(tag) : '') + '</span>' + (cat || tag ? '<a class="go" href="#/news">Clear filters</a>' : '') + '</div>';
      var top = !cat && !tag && L.length >= 4, shown = top ? top4(L) : [];
      if (top) h += '<div class="bento">' + bento(L) + '</div>';
      var restL = L.filter(function (n) { return shown.indexOf(n) < 0; });
      var lmKey = cat + '|' + tag; if (LM.key !== lmKey) { LM.key = lmKey; LM.n = 6; }
      if (restL.length) h += '<div class="ngrid">' + restL.slice(0, LM.n).map(ncard).join('') + '</div>';
      if (restL.length > LM.n) h += '<div class="more-row"><button class="btn" type="button" data-more>Load more</button><span class="small">Showing ' + LM.n + ' of ' + restL.length + '</span></div>';
    }
    h += '</div></section>';
    return { html: h, title: (cat || tag ? [cat, tag && '#' + tag].filter(Boolean).join(' · ') + ' — ' : '') + 'Updates · TAKE HIGH', nav: 'news' };
  }

  /* ---------- сторінка новини ---------- */
  function inline(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])_(.+?)_(?=[\s).,!?]|$)/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  function prose(t) {
    var out = [], list = null;
    String(t || '').replace(/\r/g, '').split(/\n/).forEach(function (line) {
      var l = line.trim();
      if (/^- /.test(l)) { if (!list) list = []; list.push('<li>' + inline(l.slice(2)) + '</li>'); return; }
      if (list) { out.push('<ul>' + list.join('') + '</ul>'); list = null; }
      if (!l) { out.push(''); return; }
      if (/^## /.test(l)) out.push('<h2>' + inline(l.slice(3)) + '</h2>');
      else if (/^> /.test(l)) out.push('<blockquote>' + inline(l.slice(2)) + '</blockquote>');
      else out.push('<p>' + inline(l) + '</p>');
    });
    if (list) out.push('<ul>' + list.join('') + '</ul>');
    return out.join('\n').replace(/<\/p>\n<p>/g, ' ').replace(/\n+/g, '');
  }
  // Location: назва з адмінки; якщо є точка на карті — посилання на Google Maps
  function locationRow(n) {
    var p = n.point, ok = p && typeof p.lat === 'number' && typeof p.lng === 'number';
    var name = String(n.place || '').trim(); if (name === '—') name = '';
    if (!ok) return name ? '<div><dt>Location</dt><dd>' + esc(name) + '</dd></div>' : '';
    var url = 'https://www.google.com/maps/search/?api=1&query=' + p.lat + ',' + p.lng;
    return '<div><dt>Location</dt><dd><a class="ext" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(name || 'View on map') + XARR + '<span class="sr-only"> (Google Maps, opens in a new tab)</span></a></dd></div>';
  }
  function renderNews(slug) {
    var all = published();
    var n = all.find(function (x) { return slugOf(x) === slug || x.id === slug; });
    if (!n) return notFound('This update is not available', 'It may have been unpublished or the link is incomplete.');
    var u = img(n.img), c = catOf(n), people = (n.people || []).map(memberName).concat(n.others || []);
    var h = '<section class="phead art-head"><div class="wrap">' + crumbs([['Updates', '#/news'], [c, '#/news?cat=' + encodeURIComponent(c)]]) +
      '<span class="meta-line">' + esc([c, n.type, fd(n.date)].filter(Boolean).join(' · ')) + '</span><h1 class="title">' + esc(n.title) + '</h1></div></section>';
    if (u) h += '<section class="art-photo"><div class="wrap"><figure><div class="ph"><img src="' + esc(u) + '" alt="' + esc(n.imgCaption || n.title) + '"></div>' +
      ((n.imgCaption || n.imgAuthor) ? '<figcaption>' + esc([n.imgCaption, n.imgAuthor ? 'Photo: ' + n.imgAuthor : ''].filter(Boolean).join(' · ')) + '</figcaption>' : '') + '</figure></div></section>';
    h += '<section class="light art-body"><div class="wrap art-grid"><aside class="art-side"><dl>' +
      '<div><dt>Date</dt><dd>' + esc(fd(n.date)) + '</dd></div>' +
      '<div><dt>Category</dt><dd><a href="#/news?cat=' + encodeURIComponent(c) + '">' + esc(c) + '</a></dd></div>' +
      (n.type ? '<div><dt>Type</dt><dd>' + esc(n.type) + '</dd></div>' : '') + locationRow(n) +
      (people.length ? '<div><dt>People</dt><dd>' + people.map(function (p, i) { var l = i < (n.people || []).length ? memberLink(n.people[i]) : null; return l ? '<a href="' + l + '">' + esc(p) + '</a>' : esc(p); }).join(', ') + '</dd></div>' : '') +
      (partnerOf(n.partner) ? '<div><dt>Partner</dt><dd>' + esc(partnerOf(n.partner).name) + '</dd></div>' : '') +
      '</dl>' + ((n.tags || []).length ? '<div class="tagrow" aria-label="Tags">' + n.tags.map(function (t) { return '<a href="#/news?tag=' + encodeURIComponent(t) + '">#' + esc(t) + '</a>'; }).join('') + '</div>' : '') +
      '</aside><div class="prose">' + (n.deck ? '<p class="deck">' + esc(n.deck) + '</p>' : '') +
      (n.body && n.body.trim() ? prose(n.body) : '<p class="placeholder">[Article text]</p>') + '</div></div></section>';
    var more = all.filter(function (x) { return x !== n; }).sort(function (a, b) { return (catOf(b) === c) - (catOf(a) === c); }).slice(0, 3);
    if (more.length) h += '<section class="psec light"><div class="wrap"><div class="head"><div><span class="label">Related</span><h2 class="title">More updates</h2></div><a class="btn solid-green" href="#/news">All updates ' + ARR + '</a></div>' +
      '<div class="ngrid">' + more.map(ncard).join('') + '</div></div></section>';
    return { html: h, title: n.title + ' · TAKE HIGH', nav: 'news' };
  }
  function notFound(title, text) {
    return { html: '<section class="phead notfound"><div class="wrap">' + crumbs([['Updates', '#/news']]) + '<h1 class="title">' + esc(title) + '</h1><p class="lead">' + esc(text) + '</p><div><a class="btn" href="#/news">' + BACK + ' All updates</a></div></div></section>', title: title + ' · TAKE HIGH', nav: 'news' };
  }

  /* ---------- сторінка Club ---------- */
  var GROUP_LABEL = { 'Media': 'Media', 'Documentary Partner': 'Documentary Partner', 'Athlete Development Programme': 'TAKE HIGH Athlete Development Programme' };
  function igLink(m, cls) {
    if (!m.ig) return '';
    var handle = (String(m.ig).match(/instagram\.com\/([^/?#]+)/i) || [])[1];
    return '<a class="' + cls + '" href="' + esc(m.ig) + '" target="_blank" rel="noopener">Instagram' + (handle ? ' @' + esc(handle) : '') + XARR + '<span class="sr-only"> (opens in a new tab)</span></a>';
  }
  function renderClub() {
    var P = (D.pages || {}).club || {}, M = (D.members || []).filter(function (m) { return m.status === 'pub'; });
    var crew = M.filter(function (m) { return m.group === 'Crew'; }), hero = img(P.heroImg);
    var h = '<section class="phead"><div class="wrap">' + crumbs([['Club']]) +
      '<div class="head"><div><span class="label">Club</span><h1 class="title">' + esc(T('club', 'title', 'The people of TAKE HIGH')) + '</h1></div></div>' +
      (P.intro ? '<div class="lead">' + paras(P.intro) + '</div>' : '') +
      (hero ? '<figure class="club-photo" style="margin:0"><div class="ph"><img src="' + esc(hero) + '" alt=""></div>' + (P.heroAuthor ? '<figcaption>Photo: ' + esc(P.heroAuthor) + '</figcaption>' : '') + '</figure>' : '') + '</div></section>';
    if (crew.length) {
      h += '<section class="psec" id="crew" aria-labelledby="crew-t"><div class="wrap"><div class="head"><div><span class="label">Crew</span><h2 class="title" id="crew-t">' + esc(P.tagline || 'Crew') + '</h2></div></div><div class="crew-grid">' +
        crew.map(function (m) {
          var u = img(m.portrait), more = m.proof || m.ig;
          return '<article class="mcard" id="m-' + esc(m.id) + '">' + (u ? '<img src="' + esc(u) + '" alt="' + esc(m.name) + '" loading="lazy">' : '<span class="ph-empty"></span>') +
            (m.portraitAuthor ? '<span class="mcredit">Photo: ' + esc(m.portraitAuthor) + '</span>' : '') +
            '<div class="mcap"><span class="kick">' + esc(m.role || '') + '</span><h3>' + esc(m.name) + '</h3>' + (m.sport ? '<p>' + esc(m.sport) + '</p>' : '') +
            (more ? '<button class="go" type="button" data-member="' + esc(m.id) + '" aria-haspopup="dialog">Read more<span class="sr-only"> about ' + esc(m.name) + '</span> ' + ARR + '</button>' : '') + '</div></article>';
        }).join('') + '</div></div></section>';
    }
    var groups = ['Media', 'Documentary Partner', 'Athlete Development Programme'].map(function (g) { return { g: g, L: M.filter(function (m) { return m.group === g; }) }; }).filter(function (x) { return x.L.length; });
    if (groups.length) {
      h += '<section class="psec light"><div class="wrap ogroups">' + groups.map(function (x) {
        return '<div class="ogroup"><div class="head"><div><span class="label">' + esc(GROUP_LABEL[x.g]) + '</span></div></div><div class="ogrid">' + x.L.map(function (m) {
          var u = img(m.portrait);
          return '<article class="ocard" id="m-' + esc(m.id) + '"><div class="oph">' + (u ? '<img src="' + esc(u) + '" alt="' + esc(m.name) + '" loading="lazy">' : '') + '</div>' +
            '<div><h3>' + esc(m.name) + '</h3><p class="mrole">' + esc(m.role || '') + '</p>' + igLink(m, 'pig') + '</div></article>';
        }).join('') + '</div></div>';
      }).join('') + '</div></section>';
    }
    if (String(P.community || '').trim()) h += '<section class="community on-green"><div class="wrap"><div class="head"><div><span class="label">Community</span><h2 class="title">' + esc(P.community) + '</h2></div><a class="btn" href="#/home/follow">Follow the updates ' + ARR + '</a></div></div></section>';
    h += '<dialog class="mdlg" id="mdlg" aria-labelledby="mdlg-t"></dialog>';
    return { html: h, title: 'Club · TAKE HIGH', nav: 'club' };
  }
  function openMember(id) {
    var m = (D.members || []).find(function (x) { return x.id === id; }), d = document.getElementById('mdlg'); if (!m || !d) return;
    var u = img(m.portrait);
    d.innerHTML = '<div class="mdlg-in">' + (u ? '<img class="mdlg-ph" src="' + esc(u) + '" alt="">' : '<span></span>') + '<div class="mdlg-txt"><span class="label">' + esc(m.sport || 'Crew') + '</span>' +
      '<h2 id="mdlg-t">' + esc(m.name) + '</h2><p class="mrole">' + esc(m.role || '') + '</p>' + (m.proof ? '<p class="mproof">' + esc(m.proof) + '</p>' : '') + igLink(m, 'go') + '</div>' +
      '<button class="mdlg-x" type="button" data-close aria-label="Close"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>';
    d.dataset.from = id;
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  }
  document.addEventListener('close', function (e) {
    if (e.target && e.target.id === 'mdlg') { var b = page.querySelector('[data-member="' + e.target.dataset.from + '"]'); if (b) b.focus(); }
  }, true);
  function closeMember() { var d = document.getElementById('mdlg'); if (!d || !d.open) return; if (d.close) d.close(); else d.removeAttribute('open'); }

  /* ---------- сторінка Partnerships ---------- */
  var DIRS = ['Performance', 'Technology', 'Team', 'Media', 'Project'];
  var CASES = { all: false };
  var ENQ = { v: { name: '', company: '', email: '', direction: '', message: '', consent: false, website: '' }, err: {}, state: 'idle', t0: 0 };
  var ENQ_MAX = { name: 80, company: 100, message: 2000 };
  function enqField(id, label, input, hint) {
    var e = ENQ.err[id];
    return '<div class="ef' + (e ? ' bad' : '') + '"><label for="eq-' + id + '">' + esc(label) + ' <span aria-hidden="true">*</span></label>' + input +
      '<div class="ef-below" id="eq-' + id + '-d">' + (e ? '<span class="ef-err">' + ERRI + esc(e) + '</span>' : '') + (hint || '') + '</div></div>';
  }
  function counter(id) { var n = ENQ.v[id].length, m = ENQ_MAX[id]; return '<span class="ef-count' + (n > m ? ' over' : '') + '" id="eq-' + id + '-c">' + n + ' / ' + m + '</span>'; }
  function enquiryForm() {
    if (!window.THStorage) return '<div class="done"><h3>Sign-up is temporarily unavailable</h3><p class="small"><a class="go" href="https://www.instagram.com/takehighclub" target="_blank" rel="noopener">Follow the ride</a></p></div>';
    if (ENQ.state === 'done') return '<div class="done" role="status" tabindex="-1" id="eq-done"><span class="ok"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><h3>Thank you, we’ll get back to you</h3><p class="small">We have received your enquiry and will reply by email.</p><button class="btn ghost" type="button" data-enq="again">Send another enquiry</button></div>';
    var V = ENQ.v, a = function (id) { return ' id="eq-' + id + '" name="' + id + '" aria-describedby="eq-' + id + '-d"' + (ENQ.err[id] ? ' aria-invalid="true"' : ''); };
    var sending = ENQ.state === 'sending';
    var h = '<form class="enq-form" id="enq-form" novalidate>';
    if (ENQ.state === 'error') h += '<div class="enq-alert" role="alert">' + ERRI + '<div><b>Something went wrong. Your data was not saved - please try again.</b> <button class="linkbtn" type="submit">Try again</button></div></div>';
    h += '<div class="ef-row">' + enqField('name', 'Name', '<input type="text" autocomplete="name"' + a('name') + ' value="' + esc(V.name) + '">', counter('name')) +
      enqField('company', 'Company', '<input type="text" autocomplete="organization"' + a('company') + ' value="' + esc(V.company) + '">', counter('company')) + '</div>';
    h += '<div class="ef-row">' + enqField('email', 'Email', '<input type="email" autocomplete="email"' + a('email') + ' value="' + esc(V.email) + '">') +
      enqField('direction', 'Direction', '<select' + a('direction') + '><option value="">Choose a direction</option>' + DIRS.map(function (d) { return '<option' + (V.direction === d ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select>') + '</div>';
    h += enqField('message', 'Objective', '<textarea rows="6"' + a('message') + ' placeholder="What would you like to achieve together?">' + esc(V.message) + '</textarea>', counter('message'));
    h += '<div class="hp" aria-hidden="true"><label for="eq-website">Website</label><input type="text" id="eq-website" name="website" tabindex="-1" autocomplete="off" value="' + esc(V.website) + '"></div>';
    h += '<div class="ef' + (ENQ.err.consent ? ' bad' : '') + '"><label class="ef-check"><input type="checkbox" id="eq-consent" name="consent" aria-describedby="eq-consent-d"' + (V.consent ? ' checked' : '') + (ENQ.err.consent ? ' aria-invalid="true"' : '') + '><span>I agree to the processing of my data as described in the [Privacy Notice].</span></label>' +
      '<div class="ef-below" id="eq-consent-d">' + (ENQ.err.consent ? '<span class="ef-err">' + ERRI + esc(ENQ.err.consent) + '</span>' : '') + '</div></div>';
    h += '<div><button class="btn" type="submit"' + (sending ? ' disabled aria-disabled="true"' : '') + '>' + (sending ? 'Sending...' : 'Send enquiry ' + ARR) + '</button></div></form>';
    return h;
  }
  function validateEnq() {
    var V = ENQ.v, E = {};
    if (!V.name.trim()) E.name = 'Enter your name'; else if (V.name.length > 80) E.name = 'Use up to 80 characters';
    if (!V.company.trim()) E.company = 'Enter your company'; else if (V.company.length > 100) E.company = 'Use up to 100 characters';
    if (!validEmail(V.email)) E.email = 'Enter a valid email address';
    if (!V.direction) E.direction = 'Choose a direction';
    if (!V.message.trim()) E.message = 'Tell us about your objective'; else if (V.message.length > 2000) E.message = 'Use up to 2000 characters';
    if (!V.consent) E.consent = 'Please confirm to send your enquiry';
    return E;
  }
  function submitEnq() {
    if (ENQ.state === 'sending') return;
    ENQ.err = validateEnq();
    if (Object.keys(ENQ.err).length) { ENQ.state = 'idle'; route(true); var f = page.querySelector('.ef.bad input, .ef.bad select, .ef.bad textarea'); if (f) f.focus(); return; }
    var V = ENQ.v;
    if (V.website || Date.now() - ENQ.t0 < 3000) { ENQ.state = 'done'; route(true); return; }
    var now = new Date().toISOString();
    var rec = { id: newId(), type: 'partnership', topic: 'Partnership', created: now,
      name: V.name.trim(), company: V.company.trim(), email: V.email.trim(), direction: V.direction, message: V.message.trim(),
      consent: { at: now, version: 'draft-0' }, source: { page: '/partnerships', form: 'Partnership enquiry', utm: location.search.replace(/^\?/, '') }, status: 'New' };
    ENQ.state = 'sending'; route(true);
    THStorage.saveEnquiry(rec).then(function () {
      sheets(rec);
      ENQ.state = 'done'; ENQ.v = { name: '', company: '', email: '', direction: '', message: '', consent: false, website: '' }; route(true);
      var d = document.getElementById('eq-done'); if (d) d.focus();
    }, function (e) {
      console.warn('[TAKE HIGH] звернення не збережено:', e && e.message, e && e.detail);
      ENQ.state = 'error'; route(true); var al = page.querySelector('.enq-alert'); if (al) al.scrollIntoView({ block: 'center' });
    });
  }
  function renderPartnerships() {
    var P = (D.pages || {}).partnerships || {};
    if (!ENQ.t0) ENQ.t0 = Date.now();
    var h = '<section class="phead"><div class="wrap">' + crumbs([['Partnerships']]) +
      '<div class="head"><div><span class="label">Partnerships</span><h1 class="title">' + esc(T('partnerships', 'title', 'Partners who strengthen the team')) + '</h1></div>' +
      '<a class="btn" href="#/partnerships/enquiry">Discuss a partnership ' + ARR + '</a></div>' + (P.intro ? '<div class="lead">' + paras(P.intro) + '</div>' : '') + '</div></section>';
    var dirs = (P.dirs || []).filter(function (d) { return String(d.text || '').trim(); });
    if (dirs.length) h += '<section class="psec light"><div class="wrap"><div class="head"><div><span class="label">Directions</span><h2 class="title">Partnership areas</h2></div></div><div class="dir-grid">' +
      dirs.map(function (d, i) { return '<div class="dir-card"><span class="dnum">0' + (i + 1) + '</span><h3>' + esc(d._label) + '</h3><p>' + esc(d.text) + '</p></div>'; }).join('') + '</div></div></section>';
    var steps = (P.steps || []).filter(function (s) { return String(s.title || '').trim(); });
    if (steps.length) h += '<section class="psec"><div class="wrap"><div class="head"><div><span class="label">Approach</span><h2 class="title">How we build a partnership</h2></div></div><ol class="psteps">' +
      steps.map(function (s, i) { return '<li><div class="st"><h3>' + esc(s.title) + '</h3><span class="num">' + (i < 9 ? '0' : '') + (i + 1) + '</span></div><p>' + esc(s.text || '') + '</p></li>'; }).join('') + '</ol></div></section>';
    var PL = shownPartners();
    if (PL.length) h += '<section class="psec on-green" id="partners-list"><div class="wrap"><div class="head"><div><span class="label">Partners</span><h2 class="title">Who works with the team</h2></div></div><div class="pt-grid">' +
      PL.map(function (p) {
        var u = img(p.logo), inner = '<span class="pt-logo">' + (u ? '<img src="' + esc(u) + '" alt="' + esc(p.name) + ' logo">' : '') + '</span><h3>' + esc(p.name) + (p.site ? XARR : '') + '</h3>' + (p.role ? '<p>' + esc(p.role) + '</p>' : '');
        return p.site ? '<a class="pt-card" id="p-' + esc(p.id) + '" href="' + esc(p.site) + '" target="_blank" rel="noopener">' + inner + '<span class="sr-only"> (opens in a new tab)</span></a>' : '<article class="pt-card" id="p-' + esc(p.id) + '">' + inner + '</article>';
      }).join('') + '</div></div></section>';
    var CL = (D.cases || []).filter(function (c) { return c.status === 'pub'; });
    if (CL.length) {
      var showN = CASES.all ? CL.length : 3;
      h += '<section class="psec light" id="cases"><div class="wrap"><div class="head"><div><span class="label">Cases</span><h2 class="title">Partnerships in action</h2></div></div><div class="case-grid">' +
        CL.slice(0, showN).map(function (c) {
          var u = img(c.img), pp = partnerOf(c.partner);
          return '<article class="case-card"><div class="ph">' + (u ? '<img src="' + esc(u) + '" alt="" loading="lazy">' : '<span class="ph-empty"></span>') + (c.imgAuthor ? '<span class="mcredit">Photo: ' + esc(c.imgAuthor) + '</span>' : '') + '</div>' +
            '<span class="meta">' + esc([c.dir, pp && pp.name].filter(Boolean).join(' · ')) + '</span><h3>' + esc(c.title) + '</h3>' + (c.text ? '<p>' + esc(c.text) + '</p>' : '') + '</article>';
        }).join('') + '</div>' + (CL.length > showN ? '<div class="more-row"><button class="btn" type="button" data-cases-more>Show more</button></div>' : '') + '</div></section>';
    }
    var NL = published().filter(function (n) { return catOf(n) === 'Partners'; }).slice(0, 3);
    if (NL.length) h += '<section class="psec light"><div class="wrap"><div class="head"><div><span class="label">Updates</span><h2 class="title">News from Partnerships</h2></div><a class="btn solid-green" href="#/news?cat=Partners">All updates ' + ARR + '</a></div><div class="ngrid">' + NL.map(ncard).join('') + '</div></div></section>';
    h += '<section class="enq on-green" id="enquiry"><div class="wrap enq-grid"><div class="enq-side"><span class="label">Contact</span><h2 class="title">Partnership enquiry</h2><p class="lead">Tell us about your company and what you would like to achieve. We reply by email.</p></div><div class="enq-box">' + enquiryForm() + '</div></div></section>';
    return { html: h, title: 'Partnerships · TAKE HIGH', nav: 'partnerships' };
  }

  /* ---------- маршрути ---------- */
  var home = document.getElementById('home'), page = document.getElementById('page');
  function parse() {
    var h = location.hash.replace(/^#\/?/, '');
    var qi = h.indexOf('?'), path = qi >= 0 ? h.slice(0, qi) : h, qs = qi >= 0 ? h.slice(qi + 1) : '';
    var q = {}; qs.split('&').forEach(function (p) { if (!p) return; var kv = p.split('='); try { q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ''); } catch (e) {} });
    var parts = path.split('/').map(function (x) { try { return decodeURIComponent(x); } catch (e) { return x; } });
    // прості якорі (#what, #apply…) ведуть до блоку Home
    if (parts.length === 1 && parts[0] && ['latest', 'news', 'club', 'partnerships', 'home'].indexOf(parts[0]) < 0 && home.querySelector('[id="' + parts[0].replace(/"/g, '') + '"]')) parts = ['home', parts[0]];
    // старі посилання ?section=… → категорія
    if (parts[0] === 'news' && q.section && !q.cat) q.cat = ({ Media: 'Media', Partnerships: 'Partners' })[q.section] || '';
    return { parts: parts, q: q };
  }
  var lastKey = null, wasHome = null;
  function scrollToEl(el, smooth) { window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: smooth ? 'smooth' : 'instant' }); }
  function route(keepScroll) {
    var r = parse(), p = r.parts, view = null;
    if (p[0] === 'latest') { location.replace('#/news' + location.hash.replace(/^#\/?latest/, '')); return; }
    if (p[0] === 'news' && p[1]) view = renderNews(p[1]);
    else if (p[0] === 'news') view = renderLatest(r.q);
    else if (p[0] === 'club') view = renderClub();
    else if (p[0] === 'partnerships') view = renderPartnerships();
    var onHomeBefore = wasHome;
    if (view) {
      var ae = document.activeElement, fid = ae && page.contains(ae) && ae.id ? ae.id : null, ss = null, se = null;
      try { if (fid && ae.selectionStart != null) { ss = ae.selectionStart; se = ae.selectionEnd; } } catch (x) {}
      page.innerHTML = view.html; page.hidden = false; home.hidden = true; document.title = view.title;
      if (fid && keepScroll) { var fe = document.getElementById(fid); if (fe) { fe.focus({ preventScroll: true }); try { if (ss != null) fe.setSelectionRange(ss, se); } catch (x) {} } }
    } else {
      page.hidden = true; page.innerHTML = ''; home.hidden = false; document.title = 'TAKE HIGH';
    }
    wasHome = !view;
    document.body.classList.toggle('inner', !!view);
    TH.pauseVideo(!!view);
    // активний пункт меню
    var navKey = view ? view.nav : '';
    document.querySelectorAll('.hnav a, .mmenu nav a, .ft-nav a').forEach(function (a) {
      var hh = a.getAttribute('href') || '', on = !!navKey && (hh === '#/' + navKey);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    TH.onScroll();
    var key = p.join('/') + JSON.stringify(r.q);
    if (keepScroll && key === lastKey) return;
    lastKey = key;
    if (p[0] === 'partnerships' && p[1]) { var sec2 = document.getElementById(p[1]); if (sec2) { scrollToEl(sec2); var f1 = sec2.querySelector('input,select,textarea'); if (f1 && p[1] === 'enquiry') f1.focus({ preventScroll: true }); return; } }
    if (p[0] === 'club' && p[1]) {
      var mc = document.getElementById('m-' + p[1]);
      if (mc) { mc.scrollIntoView({ block: 'center', behavior: 'instant' }); mc.classList.add('flash'); setTimeout(function () { mc.classList.remove('flash'); }, 1800); return; }
    }
    if (!view && p[0] === 'home' && p[1]) {
      var t = home.querySelector('[id="' + String(p[1]).replace(/"/g, '') + '"]');
      if (t) { scrollToEl(t, onHomeBefore === true && !keepScroll); if (p[1] === 'apply') { var fi = document.querySelector('#applyForm [data-for="name"]:not([hidden]) input') || document.querySelector('#applyForm input[name=email]'); if (fi && !document.getElementById('applyForm').hidden) setTimeout(function () { fi.focus({ preventScroll: true }); }, 400); } return; }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  window.addEventListener('hashchange', function () { route(false); });
  // посилання на ту саму адресу (#/home/apply, коли вона вже в рядку адреси) теж прокручують до блоку
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    var h = a.getAttribute('href');
    if (h === '#main') { e.preventDefault(); var tgt = home.hidden ? page : document.getElementById('who'); var f = tgt.querySelector('h1,h2'); if (f) { f.setAttribute('tabindex', '-1'); f.focus(); } return; }
    if (h === location.hash || (h === '#/' && (location.hash === '' || location.hash === '#/'))) { e.preventDefault(); lastKey = null; if (h === '#/') window.scrollTo({ top: 0, behavior: 'smooth' }); else route(false); }
  });
  page.addEventListener('input', function (e) {
    var t = e.target; if (!t.form || t.form.id !== 'enq-form') return;
    ENQ.v[t.name] = t.type === 'checkbox' ? t.checked : t.value;
    var c = document.getElementById('eq-' + t.name + '-c'); if (c) { c.textContent = t.value.length + ' / ' + ENQ_MAX[t.name]; c.classList.toggle('over', t.value.length > ENQ_MAX[t.name]); }
  });
  page.addEventListener('change', function (e) {
    var t = e.target; if (!t.form || t.form.id !== 'enq-form') return;
    ENQ.v[t.name] = t.type === 'checkbox' ? t.checked : t.value;
    if (ENQ.err[t.name]) { var E = validateEnq(); if (E[t.name]) ENQ.err[t.name] = E[t.name]; else delete ENQ.err[t.name]; setTimeout(function () { route(true); }, 0); }
  });
  page.addEventListener('submit', function (e) { if (e.target.id === 'enq-form') { e.preventDefault(); submitEnq(); } });
  page.addEventListener('click', function (e) {
    if (e.target.closest('[data-cases-more]')) {
      var before = page.querySelectorAll('.case-card').length; CASES.all = true; route(true);
      var nx = page.querySelectorAll('.case-card')[before]; if (nx) { nx.setAttribute('tabindex', '-1'); nx.focus({ preventScroll: true }); }
      return;
    }
    if (e.target.closest('[data-enq="again"]')) { ENQ.state = 'idle'; ENQ.err = {}; ENQ.t0 = Date.now(); route(true); var n0 = document.getElementById('eq-name'); if (n0) n0.focus(); return; }
    var rm = e.target.closest('[data-member]'); if (rm) { openMember(rm.getAttribute('data-member')); return; }
    if (e.target.closest('[data-close]') || e.target.id === 'mdlg') { closeMember(); return; }
    if (!e.target.closest('[data-more]')) return;
    var before2 = page.querySelectorAll('.ngrid > *').length;
    LM.n += 6; route(true);
    var next = page.querySelectorAll('.ngrid > *')[before2]; if (next) next.focus({ preventScroll: true });
  });

  function apply(data, keepScroll) { if (data) D = data; renderHome(); route(keepScroll); }
  apply(null, false);

  if (window.THStorage) {
    var last = JSON.stringify(D);
    var push = function (d) { var j = JSON.stringify(d); if (j === last) return; last = j; apply(d, true); };
    THStorage.load().then(function (r) { if (r.data) push(r.data); }).catch(function (e) { console.warn('[TAKE HIGH] дані не завантажено:', e.message, e.detail || ''); });
    THStorage.watch(push);
  }
})();
