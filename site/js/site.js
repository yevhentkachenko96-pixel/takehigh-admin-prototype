/* TAKE HIGH · сайт. Поведінка сторінки з макета Homepage V2 + маршрути, дані з адмінки, внутрішні сторінки. */

/* ---------- поведінка з макета ---------- */

(function(){
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* header turns solid after the first panel */
  var top=document.getElementById("top"),hero=document.querySelector(".hero");
  var lastY=window.scrollY;
  function onS(){
    var y=window.scrollY;
    top.classList.toggle("solid",y>hero.offsetHeight*.6);
    /* hide while scrolling down, return as soon as the visitor scrolls up */
    if(y>lastY+4&&y>200)top.classList.add("hide");
    else if(y<lastY-4||y<=200)top.classList.remove("hide");
    lastY=y;
  }
  window.addEventListener("scroll",onS,{passive:true});onS();

  /* menu */
  var mm=document.getElementById("mmenu"),bg=document.getElementById("burger");
  function openM(){mm.hidden=false;bg.setAttribute("aria-expanded","true");document.body.style.overflow="hidden";document.getElementById("mclose").focus()}
  function closeM(){mm.hidden=true;bg.setAttribute("aria-expanded","false");document.body.style.overflow="";bg.focus()}
  bg.addEventListener("click",openM);document.getElementById("mclose").addEventListener("click",closeM);
  mm.querySelectorAll("nav a").forEach(function(a){a.addEventListener("click",closeM)});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&!mm.hidden)closeM()});

  /* carousels */
  document.querySelectorAll(".rail").forEach(function(r){
    var bs=document.querySelectorAll('.arrowbtn[data-rail="'+r.id+'"]');
    function upd(){bs.forEach(function(b){b.disabled=+b.dataset.dir<0?r.scrollLeft<4:r.scrollLeft+r.clientWidth>=r.scrollWidth-4});if(bs[0])bs[0].parentNode.classList.toggle("is-static",r.scrollWidth<=r.clientWidth+4)}
    r.addEventListener("scroll",upd,{passive:true});addEventListener("resize",upd);upd();
  });
  document.querySelectorAll(".arrowbtn").forEach(function(b){
    b.addEventListener("click",function(){var r=document.getElementById(b.dataset.rail);var c=r.querySelector(".rcard");r.scrollBy({left:(c?c.offsetWidth+24:400)*(+b.dataset.dir),behavior:reduce?"auto":"smooth"})});
  });

  /* preparation: the chapter in the middle of the screen picks the photo */
  var chaps=[].slice.call(document.querySelectorAll(".chap")),pics=[].slice.call(document.querySelectorAll(".prep-media img"));
  function sel(i){chaps.forEach(function(c,k){c.classList.toggle("on",k===i)});pics.forEach(function(p,k){p.classList.toggle("on",k===i)})}
  sel(0);
  if("IntersectionObserver" in window){
    var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)sel(+e.target.dataset.i)})},{rootMargin:matchMedia("(max-width:860px)").matches?"-62% 0px -30% 0px":"-45% 0px -45% 0px"});
    chaps.forEach(function(c){cio.observe(c)});
  }

  /* reveals via IntersectionObserver (works inside a host frame too); content is visible without JS */
  if(reduce||!("IntersectionObserver" in window))return;
  document.documentElement.classList.add("js");
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -10% 0px"});
  document.querySelectorAll(".panel,.half,.rv").forEach(function(el){io.observe(el)});
  /* stagger copy inside each panel */
  document.querySelectorAll(".panel,.half,.rail-sec,.who2,.latest-sec,.stream,.pfull,.prep-intro").forEach(function(p){p.querySelectorAll(".rv").forEach(function(el,k){el.style.transitionDelay=(k*.08)+"s"})});
  setTimeout(function(){document.querySelectorAll(".hero .rv").forEach(function(el){el.classList.add("in")})},100);
})();

/* ---------- дані і сторінки ---------- */
(function () {
  'use strict';
  var ARR = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>';
  var BACK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M14 8H3M7 4L3 8l4 4"/></svg>';
  var SECTIONS = ['Performance', 'Club', 'Media', 'Partnerships', 'Access'];
  var D = (window.THStorage && THStorage.cached()) || window.TH_DEFAULT || { news: [], tags: [], members: [], partners: [], pages: {} };

  // тексти блоків, які адмінка може змінити (pages.home / pages.latest); тут — значення за замовчуванням з макета
  function T(page, key, def) { var p = (D.pages || {})[page] || {}; return p[key] != null && String(p[key]).trim() !== '' ? p[key] : def; }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fd(iso) { var m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + '.' + m[2] + '.' + m[1] : '[Date]'; }
  function img(k) {
    if (!k || typeof k !== 'string') return null;
    if (/^(data:|blob:|https?:)/.test(k)) return k;
    var m = window.TH_PHOTOS || {};
    return m[k] ? '../shared/' + m[k] : null;
  }
  function pic(k, alt, extra) { var u = img(k); return u ? '<img src="' + esc(u) + '" alt="' + esc(alt || '') + '" loading="lazy"' + (extra || '') + '>' : '<span class="ph-empty" aria-hidden="true"></span>'; }
  function slugOf(n) { return n.slug || n.id; }
  function href(n) { return '#/news/' + encodeURIComponent(slugOf(n)); }
  function memberName(id) { var m = (D.members || []).find(function (x) { return x.id === id; }); return m ? m.name : id; }

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
  // головна: позначена в адмінці, інакше найновіша
  function featured(L) { return L.find(function (n) { return n.featured; }) || L[0] || null; }

  function bcard(n, cls) {
    return '<a class="bcard' + (cls ? ' ' + cls : '') + '" href="' + href(n) + '">' + pic(n.img, n.title) +
      '<div class="bcap"><span class="meta">' + esc([n.section, n.type, fd(n.date)].filter(Boolean).join(' · ')) + '</span><h3>' + esc(n.title) + '</h3>' +
      (n.deck ? '<p>' + esc(n.deck) + '</p>' : '') + '</div></a>';
  }
  function ncard(n) {
    return '<a class="ncard" href="' + href(n) + '"><div class="ph">' + pic(n.img, n.title) + '</div>' +
      '<span class="meta">' + esc([n.section, n.type, fd(n.date)].filter(Boolean).join(' · ')) + '</span><h3>' + esc(n.title) + '</h3>' +
      (n.deck ? '<p>' + esc(n.deck) + '</p>' : '') + '</a>';
  }
  function bento(L) {
    var f = featured(L); if (!f) return '';
    var rest = L.filter(function (n) { return n !== f; }).slice(0, 3);
    return bcard(f, 'b-feat') + rest.map(function (n, i) { return bcard(n, i === 0 ? 'b-wide' : ''); }).join('');
  }

  /* ---------- Home: блоки з даних ---------- */
  function renderHome() {
    var L = published();
    var el = document.getElementById('home-latest');
    if (el) el.innerHTML = L.length ? bento(L) : '<p class="list-count">Новин поки немає.</p>';
    var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = v; };
    set('hl-label', T('home', 'latestLabel', 'News'));
    set('hl-title', T('home', 'latestTitle', 'Updates from the team'));
    set('hl-cta', T('home', 'latestCta', 'View all updates'));
    set('hm-label', T('home', 'mediaRowLabel', 'More from Media'));
    var m = document.getElementById('home-media');
    if (m) {
      var M = L.filter(function (n) { return n.section === 'Media'; }).slice(0, 3);
      m.innerHTML = M.map(function (n) {
        return '<a class="stile" href="' + href(n) + '"><div class="ph">' + pic(n.img, '') + '</div><div class="stile-cap"><span class="meta">' + esc([n.type, fd(n.date)].filter(Boolean).join(' · ')) + '</span><span class="h3">' + esc(n.title) + '</span></div></a>';
      }).join('') + '<a class="stile all" href="#/news?section=Media"><span class="h3">All Media stories</span>' + ARR + '</a>';
    }
  }

  var LM = { key: null, n: 6 };
  /* ---------- News: усі новини (колишня сторінка Latest) ---------- */
  function renderLatest(q) {
    var all = published();
    var sec = SECTIONS.indexOf(q.section) >= 0 ? q.section : '', tag = String(q.tag || '').toLowerCase(); // теги завжди малими: старі посилання ?tag=Film теж працюють
    var L = all.filter(function (n) { return (!sec || n.section === sec) && (!tag || (n.tags || []).some(function (t) { return String(t).toLowerCase() === tag; })); });
    var used = {}; all.forEach(function (n) { (n.tags || []).forEach(function (t) { used[t] = 1; }); });
    // теги з опублікованих новин; видалений з довідника тег лишається, поки стоїть хоча б на одній новині
    var tags = (D.tags || []).filter(function (t) { return used[t]; }).concat(Object.keys(used).filter(function (t) { return (D.tags || []).indexOf(t) < 0; }).sort());
    var link = function (s, t) { var p = []; if (s) p.push('section=' + encodeURIComponent(s)); if (t) p.push('tag=' + encodeURIComponent(t)); return '#/news' + (p.length ? '?' + p.join('&') : ''); };
    var h = '<section class="page-head"><div class="wrap">' +
      '<nav class="crumbs" aria-label="Breadcrumbs"><a href="#/">Home</a><span aria-hidden="true">/</span><span>News</span></nav>' +
      '<span class="label">' + esc(T('latest', 'label', 'News')) + '</span>' +
      '<h1 class="story-title">' + esc(T('latest', 'title', 'Updates from the team')) + '</h1>' +
      '<p class="body">' + esc(T('latest', 'intro', 'Session reports, team updates and stories from the people behind TAKE HIGH.')) + '</p>' +
      '<div class="filters"><span class="flabel">Section</span><div class="frow2" role="group" aria-label="Section">' +
      '<a class="fchip" href="' + link('', tag) + '" aria-pressed="' + (!sec) + '">All</a>' +
      SECTIONS.map(function (s) { return '<a class="fchip" href="' + link(s, tag) + '" aria-pressed="' + (s === sec) + '">' + esc(s) + '</a>'; }).join('') + '</div>' +
      (tags.length ? '<span class="flabel">Tags</span><div class="frow2" role="group" aria-label="Tags">' + tags.map(function (t) {
        return '<a class="fchip tag" href="' + link(sec, t === tag ? '' : t) + '" aria-pressed="' + (t === tag) + '">#' + esc(t) + '</a>';
      }).join('') + '</div>' : '') + '</div></div></section>';
    h += '<section class="list-sec"><div class="wrap">';
    if (!L.length) {
      h += '<div class="empty-list"><h2>Nothing here yet</h2><p class="list-count" style="margin:0">No updates match these filters.</p><a class="pillbtn outline big" href="#/news">Show all updates</a></div>';
    } else {
      h += '<p class="list-count" aria-live="polite">' + L.length + (L.length === 1 ? ' update' : ' updates') + (sec ? ' · ' + esc(sec) : '') + (tag ? ' · #' + esc(tag) : '') + '</p>';
      var top = !sec && !tag && L.length >= 4;
      if (top) h += '<div class="bento">' + bento(L) + '</div>';
      var shown = top ? (function () { var f = featured(L); var r = L.filter(function (n) { return n !== f; }).slice(0, 3); return [f].concat(r); })() : [];
      var restL = L.filter(function (n) { return shown.indexOf(n) < 0; });
      // «Load more»: спочатку 6 карток (2 ряди), кнопка додає ще 6; при зміні фільтрів — знову 6
      var lmKey = sec + '|' + tag; if (LM.key !== lmKey) { LM.key = lmKey; LM.n = 6; }
      if (restL.length) h += '<div class="ngrid">' + restL.slice(0, LM.n).map(ncard).join('') + '</div>';
      if (restL.length > LM.n) h += '<div class="more-row"><button class="pillbtn outline big" type="button" data-more>Load more</button><span class="list-count" style="margin:0">Showing ' + LM.n + ' of ' + restL.length + '</span></div>';
    }
    h += '</div></section>';
    return { html: h, title: (sec || tag ? [sec, tag && '#' + tag].filter(Boolean).join(' · ') + ' — ' : '') + 'News · TAKE HIGH' };
  }

  /* ---------- сторінка новини ---------- */
  function inline(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])_(.+?)_(?=[\s).,!?]|$)/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  // Текст з адмінки: ## заголовок, - список, > цитата, **жирний**, _курсив_, [посилання](https://…)
  function prose(t) {
    var out = [], list = null;
    String(t || '').replace(/\r/g, '').split(/\n/).forEach(function (line) {
      var l = line.trim();
      if (/^- /.test(l)) { if (!list) { list = []; } list.push('<li>' + inline(l.slice(2)) + '</li>'); return; }
      if (list) { out.push('<ul>' + list.join('') + '</ul>'); list = null; }
      if (!l) { out.push(''); return; }
      if (/^## /.test(l)) out.push('<h2>' + inline(l.slice(3)) + '</h2>');
      else if (/^> /.test(l)) out.push('<blockquote>' + inline(l.slice(2)) + '</blockquote>');
      else out.push('<p>' + inline(l) + '</p>');
    });
    if (list) out.push('<ul>' + list.join('') + '</ul>');
    // сусідні рядки одного абзацу зʼєднуються
    return out.join('\n').replace(/<\/p>\n<p>/g, ' ').replace(/\n+/g, '');
  }
  // Location: назва з адмінки; якщо є точка на карті — посилання на Google Maps (на телефоні відкриває застосунок карт)
  function locationRow(n) {
    var p = n.point, ok = p && typeof p.lat === 'number' && typeof p.lng === 'number';
    var name = String(n.place || '').trim(); if (name === '—') name = '';
    if (!ok) return name ? '<div><dt>Location</dt><dd>' + esc(name) + '</dd></div>' : '';
    var url = 'https://www.google.com/maps/search/?api=1&query=' + p.lat + ',' + p.lng;
    return '<div><dt>Location</dt><dd><a class="ext" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(name || 'View on map') +
      '<span aria-hidden="true"> ↗</span><span class="sr-only"> (Google Maps, opens in a new tab)</span></a></dd></div>';
  }
  function renderNews(slug) {
    var all = published();
    var n = all.find(function (x) { return slugOf(x) === slug || x.id === slug; });
    if (!n) return notFound('This update is not available', 'It may have been unpublished or the link is incomplete.');
    var u = img(n.img), people = (n.people || []).map(memberName).concat(n.others || []);
    var h = '<section class="art-hero">' + (u ? '<div class="ph"><img src="' + esc(u) + '" alt="' + esc(n.imgCaption || n.title) + '"></div>' : '<div class="ph"><span class="ph-empty"></span></div>') +
      '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumbs"><a href="#/">Home</a><span aria-hidden="true">/</span><a href="#/news">News</a>' +
      (n.section ? '<span aria-hidden="true">/</span><a href="#/news?section=' + encodeURIComponent(n.section) + '">' + esc(n.section) + '</a>' : '') + '</nav>' +
      '<span class="label">' + esc([n.type, fd(n.date)].filter(Boolean).join(' · ')) + '</span>' +
      '<h1>' + esc(n.title) + '</h1>' + (n.deck ? '<p class="body">' + esc(n.deck) + '</p>' : '') + '</div>' +
      (n.imgAuthor ? '<span class="credit">Photo: ' + esc(n.imgAuthor) + '</span>' : '') + '</section>';
    h += '<section class="art-sec"><div class="wrap art-grid"><aside class="art-side"><dl>' +
      '<div><dt>Date</dt><dd>' + esc(fd(n.date)) + '</dd></div>' +
      (n.section ? '<div><dt>Section</dt><dd><a href="#/news?section=' + encodeURIComponent(n.section) + '">' + esc(n.section) + '</a></dd></div>' : '') +
      (n.type ? '<div><dt>Type</dt><dd>' + esc(n.type) + '</dd></div>' : '') +
      locationRow(n) +
      (people.length ? '<div><dt>People</dt><dd>' + people.map(function (p, i) { return i < (n.people || []).length ? '<a href="#/home/club">' + esc(p) + '</a>' : esc(p); }).join(', ') + '</dd></div>' : '') +
      (n.partner ? '<div><dt>Partner</dt><dd>' + esc(n.partner) + '</dd></div>' : '') +
      '</dl>' + ((n.tags || []).length ? '<div class="tagrow" aria-label="Tags">' + n.tags.map(function (t) { return '<a href="#/news?tag=' + encodeURIComponent(t) + '">#' + esc(t) + '</a>'; }).join('') + '</div>' : '') +
      '</aside><div class="prose">' + (n.imgCaption ? '<p class="meta" style="margin-top:0">' + esc(n.imgCaption) + '</p>' : '') +
      (n.body && n.body.trim() ? prose(n.body) : '<p class="lead" style="color:rgba(12,12,12,.45)">[Article text]</p>') + '</div></div></section>';
    var more = all.filter(function (x) { return x !== n; }).sort(function (a, b) { return (b.section === n.section) - (a.section === n.section); }).slice(0, 3);
    if (more.length) h += '<section class="more-sec"><div class="wrap"><div class="latest-head"><div><span class="label">Related</span><h2 class="story-title">More updates</h2></div><a class="pillbtn dark" href="#/news">All updates ' + ARR + '</a></div>' +
      '<div class="bento three">' + more.map(function (x) { return bcard(x, ''); }).join('') + '</div></div></section>';
    return { html: h, title: n.title + ' · TAKE HIGH' };
  }
  function notFound(title, text) {
    return { html: '<section class="notfound"><div class="wrap"><span class="label">News</span><h1 class="story-title">' + esc(title) + '</h1><p class="body">' + esc(text) + '</p><a class="pillbtn light big" href="#/news">' + BACK + ' All updates</a></div></section>', title: title + ' · TAKE HIGH' };
  }

  /* ---------- маршрути ---------- */
  var home = document.getElementById('home'), page = document.getElementById('page');
  function parse() {
    var h = location.hash.replace(/^#\/?/, '');
    var qi = h.indexOf('?'), path = qi >= 0 ? h.slice(0, qi) : h, qs = qi >= 0 ? h.slice(qi + 1) : '';
    var q = {}; qs.split('&').forEach(function (p) { if (!p) return; var kv = p.split('='); try { q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ''); } catch (e) {} });
    var parts = path.split('/').map(function (x) { try { return decodeURIComponent(x); } catch (e) { return x; } });
    // старі якорі з макета (#latest, #club…) теж працюють
    if (parts.length === 1 && parts[0] && ['latest', 'news'].indexOf(parts[0]) < 0 && document.getElementById(parts[0]) && home.contains(document.getElementById(parts[0]))) parts = ['home', parts[0]];
    return { parts: parts, q: q };
  }
  var lastKey = null;
  function route(keepScroll) {
    var r = parse(), p = r.parts, view = null;
    if (p[0] === 'latest') { location.replace('#/news' + location.hash.replace(/^#\/?latest/, '')); return; }
    if (p[0] === 'news' && p[1]) view = renderNews(p[1]);
    else if (p[0] === 'news') view = renderLatest(r.q);
    if (view) {
      page.innerHTML = view.html; page.hidden = false; home.hidden = true; document.title = view.title;
    } else {
      page.hidden = true; page.innerHTML = ''; home.hidden = false; document.title = 'TAKE HIGH';
    }
    var key = p.join('/') + JSON.stringify(r.q);
    if (keepScroll && key === lastKey) return;
    lastKey = key;
    if (!view && p[0] === 'home' && p[1]) { var t = document.getElementById(p[1]); if (t) { window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY, behavior: 'instant' }); return; } }
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', function () { route(false); });
  page.addEventListener('click', function (e) {
    if (!e.target.closest('[data-more]')) return;
    var before = page.querySelectorAll('.ngrid > *').length;
    LM.n += 6; route(true);
    // фокус на першу нову картку, щоб з клавіатури продовжити з того ж місця
    var next = page.querySelectorAll('.ngrid > *')[before]; if (next) { var a = next.matches('a') ? next : next.querySelector('a'); if (a) a.focus({ preventScroll: true }); }
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
