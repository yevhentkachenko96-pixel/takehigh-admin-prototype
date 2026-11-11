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
    var lk = window.THStorage && THStorage.localPhoto(k); if (lk) k = lk;
    if (/^(data:|blob:|https?:)/.test(k)) return k;
    var m = window.TH_PHOTOS || {};
    return m[k] ? '../shared/' + m[k] : null;
  }
  function pic(k, alt, extra) { var u = img(k); return u ? '<img src="' + esc(u) + '" alt="' + esc(alt || '') + '" loading="lazy"' + (extra || '') + '>' : '<span class="ph-empty" aria-hidden="true"></span>'; }
  function slugOf(n) { return n.slug || n.id; }
  function href(n) { return '#/news/' + encodeURIComponent(slugOf(n)); }
  // партнери: на сайті лише опубліковані з дозволом на логотип, у порядку з адмінки
  function shownPartners() { return (D.partners || []).filter(function (p) { return p.status === 'pub' && p.perm === true; }); }
  function partnerOf(id) { if (!id) return null; return (D.partners || []).concat(D.partnersDeleted || []).find(function (p) { return p.id === id; }) || null; }
  // учасник за id, зокрема видалений (його імʼя лишається в старих новинах, але без посилання)
  function member(id) { return (D.members || []).concat(D.membersDeleted || []).find(function (x) { return x.id === id; }) || null; }
  function memberName(id) { var m = member(id); return m ? m.name : id; }
  function memberLink(id) { var m = (D.members || []).find(function (x) { return x.id === id; }); return m && m.status === 'pub' ? '#/club/' + encodeURIComponent(m.id) : null; }

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
    var hp = document.getElementById('home-partners');
    if (hp) hp.innerHTML = shownPartners().map(function (p) {
      var u = img(p.logo);
      return '<a class="prow" href="' + esc(p.site || '#/partnerships') + '"' + (p.site ? ' target="_blank" rel="noopener"' : '') + '><span class="plogo">' + (u ? '<img src="' + esc(u) + '" alt="" loading="lazy">' : '') + '</span><span class="pname">' + esc(p.name) + '</span><svg class="parr" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>' + (p.site ? '<span class="sr-only"> (opens in a new tab)</span>' : '') + '</a>';
    }).join('');
    set('crew-count', String((D.members || []).filter(function (x) { return x.group === 'Crew' && x.status === 'pub'; }).length));
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
  /* ---------- сторінка Club ---------- */
  var GROUP_LABEL = { 'Media': 'Media', 'Documentary Partner': 'Documentary Partner', 'Athlete Development Programme': 'TAKE HIGH Athlete Development Programme' };
  function paras(t) { return String(t || '').split(/\n\s*\n/).map(function (x) { return x.trim(); }).filter(Boolean).map(function (x) { return '<p>' + esc(x) + '</p>'; }).join(''); }
  function igLink(m, cls) {
    if (!m.ig) return '';
    var handle = (String(m.ig).match(/instagram\.com\/([^/?#]+)/i) || [])[1];
    return '<a class="' + cls + '" href="' + esc(m.ig) + '" target="_blank" rel="noopener">Instagram' + (handle ? ' @' + esc(handle) : '') + '<span aria-hidden="true"> ↗</span><span class="sr-only"> (opens in a new tab)</span></a>';
  }
  function renderClub() {
    var P = (D.pages || {}).club || {}, M = (D.members || []).filter(function (m) { return m.status === 'pub'; });
    var crew = M.filter(function (m) { return m.group === 'Crew'; });
    var hero = img(P.heroImg);
    var h = '<section class="art-hero club-hero">' + (hero ? '<div class="ph"><img src="' + esc(hero) + '" alt=""></div>' : '<div class="ph"><span class="ph-empty"></span></div>') +
      '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumbs"><a href="#/">Home</a><span aria-hidden="true">/</span><span>Club</span></nav>' +
      '<span class="label">Club</span><h1>' + esc(T('club', 'title', 'The people of TAKE HIGH')) + '</h1></div>' +
      (P.heroAuthor ? '<span class="credit">Photo: ' + esc(P.heroAuthor) + '</span>' : '') + '</section>';
    if (P.intro) h += '<section class="club-intro"><div class="wrap"><div class="club-lead">' + paras(P.intro) + '</div></div></section>';
    if (crew.length) {
      h += '<section class="crew-sec" id="crew" aria-labelledby="crew-t"><div class="wrap"><div class="sec-head"><span class="label">Crew</span><h2 class="story-title" id="crew-t">' + esc(P.tagline || 'Crew') + '</h2></div><div class="crew-grid">' +
        crew.map(function (m) {
          var u = img(m.portrait), more = m.proof || m.ig;
          return '<article class="mcard" id="m-' + esc(m.id) + '"><div class="ph">' + (u ? '<img src="' + esc(u) + '" alt="' + esc(m.name) + '" loading="lazy">' : '<span class="ph-empty"></span>') +
            (m.portraitAuthor ? '<span class="mcredit">Photo: ' + esc(m.portraitAuthor) + '</span>' : '') + '</div>' +
            '<h3>' + esc(m.name) + '</h3><p class="mrole">' + esc(m.role || '') + '</p>' + (m.sport ? '<p class="msport">' + esc(m.sport) + '</p>' : '') +
            (more ? '<button class="readmore" type="button" data-member="' + esc(m.id) + '" aria-haspopup="dialog">Read more<span class="sr-only"> about ' + esc(m.name) + '</span></button>' : '') + '</article>';
        }).join('') + '</div></div></section>';
    }
    var groups = ['Media', 'Documentary Partner', 'Athlete Development Programme'].map(function (g) { return { g: g, L: M.filter(function (m) { return m.group === g; }) }; }).filter(function (x) { return x.L.length; });
    if (groups.length) {
      h += '<section class="groups-sec"><div class="wrap">' + groups.map(function (x) {
        return '<div class="ogroup"><h2 class="h3 pg-title">' + esc(GROUP_LABEL[x.g]) + '</h2><div class="ogrid">' + x.L.map(function (m) {
          var u = img(m.portrait);
          return '<article class="ocard" id="m-' + esc(m.id) + '"><div class="oph">' + (u ? '<img src="' + esc(u) + '" alt="' + esc(m.name) + '" loading="lazy">' : '<span class="ph-empty"></span>') + '</div>' +
            '<div><h3>' + esc(m.name) + '</h3><p class="mrole">' + esc(m.role || '') + '</p>' + igLink(m, 'pig') + '</div></article>';
        }).join('') + '</div></div>';
      }).join('') + '</div></section>';
    }
    if (String(P.community || '').trim()) h += '<section class="community-sec"><div class="wrap"><span class="label">Community</span><p class="club-lead">' + esc(P.community) + '</p></div></section>';
    h += '<dialog class="mdlg" id="mdlg" aria-labelledby="mdlg-t"></dialog>';
    return { html: h, title: 'Club · TAKE HIGH' };
  }
  function openMember(id) {
    var m = (D.members || []).find(function (x) { return x.id === id; }), d = document.getElementById('mdlg'); if (!m || !d) return;
    var u = img(m.portrait);
    d.innerHTML = '<div class="mdlg-in">' + (u ? '<img class="mdlg-ph" src="' + esc(u) + '" alt="">' : '') + '<div class="mdlg-txt"><span class="label">' + esc(m.sport || 'Crew') + '</span>' +
      '<h2 id="mdlg-t">' + esc(m.name) + '</h2><p class="mrole">' + esc(m.role || '') + '</p>' + (m.proof ? '<p class="mproof">' + esc(m.proof) + '</p>' : '') + igLink(m, 'pig') + '</div>' +
      '<button class="mdlg-x" type="button" data-close aria-label="Close">×</button></div>';
    d.dataset.from = id;
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
  }
  document.addEventListener('close', function (e) {
    if (e.target && e.target.id === 'mdlg') { var b = page.querySelector('[data-member="' + e.target.dataset.from + '"]'); if (b) b.focus(); }
  }, true);
  function closeMember() {
    var d = document.getElementById('mdlg'); if (!d || !d.open) return;
    if (d.close) d.close(); else d.removeAttribute('open');
  }

  /* ---------- сторінка Partnerships ---------- */
  var DIRS = ['Performance', 'Technology', 'Team', 'Media', 'Project'];
  var CASES = { all: false };
  // форма Partnership enquiry: значення живуть тут, щоб не губитися при оновленні даних
  var ENQ = { v: { name: '', company: '', email: '', direction: '', message: '', consent: false, website: '' }, err: {}, state: 'idle', t0: 0 };
  var ENQ_MAX = { name: 80, company: 100, message: 2000 };
  function enqField(id, label, input, hint) {
    var e = ENQ.err[id];
    return '<div class="ef' + (e ? ' bad' : '') + '"><label for="eq-' + id + '">' + esc(label) + ' <span aria-hidden="true">*</span></label>' + input +
      '<div class="ef-below" id="eq-' + id + '-d">' + (e ? '<span class="ef-err">' + ERRI + esc(e) + '</span>' : (hint || '')) + '</div></div>';
  }
  var ERRI = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.8v3.7M8 10.9h.01"/></svg>';
  function counter(id) { var n = ENQ.v[id].length, m = ENQ_MAX[id]; return '<span class="ef-count' + (n > m ? ' over' : '') + '" id="eq-' + id + '-c">' + n + ' / ' + m + '</span>'; }
  function enquiryForm() {
    if (!window.THStorage) return '<div class="enq-msg"><h3>Sign-up is temporarily unavailable</h3><p><a href="https://www.instagram.com/takehighclub" target="_blank" rel="noopener">Follow the ride</a></p></div>';
    if (ENQ.state === 'done') return '<div class="enq-msg" role="status" tabindex="-1" id="eq-done"><h3>Thank you, we’ll get back to you</h3><p>We have received your enquiry and will reply by email.</p><button class="pillbtn outline big" type="button" data-enq="again">Send another enquiry</button></div>';
    var V = ENQ.v, a = function (id) { return ' id="eq-' + id + '" name="' + id + '" aria-describedby="eq-' + id + '-d"' + (ENQ.err[id] ? ' aria-invalid="true"' : ''); };
    var sending = ENQ.state === 'sending';
    var h = '<form class="enq-form" id="enq-form" novalidate>';
    if (ENQ.state === 'error') h += '<div class="enq-alert" role="alert">' + ERRI + '<div><b>Something went wrong. Your data was not saved - please try again.</b> <button class="linkbtn" type="submit">Try again</button></div></div>';
    h += '<div class="ef-row">' + enqField('name', 'Name', '<input type="text" autocomplete="name"' + a('name') + ' value="' + esc(V.name) + '">', counter('name')) +
      enqField('company', 'Company', '<input type="text" autocomplete="organization"' + a('company') + ' value="' + esc(V.company) + '">', counter('company')) + '</div>';
    h += '<div class="ef-row">' + enqField('email', 'Email', '<input type="email" autocomplete="email"' + a('email') + ' value="' + esc(V.email) + '">') +
      enqField('direction', 'Direction', '<select' + a('direction') + '><option value="">Choose a direction</option>' + DIRS.map(function (d) { return '<option' + (V.direction === d ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select>') + '</div>';
    h += enqField('message', 'Objective', '<textarea rows="6"' + a('message') + ' placeholder="What would you like to achieve together?">' + esc(V.message) + '</textarea>', counter('message'));
    // поле-пастка для ботів: людям не видно, у фокус не потрапляє
    h += '<div class="hp" aria-hidden="true"><label for="eq-website">Website</label><input type="text" id="eq-website" name="website" tabindex="-1" autocomplete="off" value="' + esc(V.website) + '"></div>';
    h += '<div class="ef' + (ENQ.err.consent ? ' bad' : '') + '"><label class="ef-check"><input type="checkbox" id="eq-consent" name="consent" aria-describedby="eq-consent-d"' + (V.consent ? ' checked' : '') + (ENQ.err.consent ? ' aria-invalid="true"' : '') + '><span>I agree to the processing of my data as described in the [Privacy Notice].</span></label>' +
      '<div class="ef-below" id="eq-consent-d">' + (ENQ.err.consent ? '<span class="ef-err">' + ERRI + esc(ENQ.err.consent) + '</span>' : '') + '</div></div>';
    h += '<div><button class="pillbtn dark big" type="submit"' + (sending ? ' disabled aria-disabled="true"' : '') + '>' + (sending ? 'Sending...' : 'Send enquiry') + '</button></div></form>';
    return h;
  }
  function validateEnq() {
    var V = ENQ.v, E = {};
    if (!V.name.trim()) E.name = 'Enter your name'; else if (V.name.length > 80) E.name = 'Use up to 80 characters';
    if (!V.company.trim()) E.company = 'Enter your company'; else if (V.company.length > 100) E.company = 'Use up to 100 characters';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(V.email.trim())) E.email = 'Enter a valid email address';
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
    // бот: заповнене поле-пастка або відправка швидше ніж за 3 секунди — нічого не зберігаємо
    if (V.website || Date.now() - ENQ.t0 < 3000) { ENQ.state = 'done'; route(true); return; }
    var now = new Date().toISOString();
    var rec = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), type: 'partnership', created: now,
      name: V.name.trim(), company: V.company.trim(), email: V.email.trim(), direction: V.direction, message: V.message.trim(),
      consent: { at: now, version: 'draft-0' }, source: { page: '/partnerships', form: 'Partnership enquiry', utm: location.search.replace(/^\?/, '') }, status: 'New' };
    ENQ.state = 'sending'; route(true);
    THStorage.saveEnquiry(rec).then(function () {
      // копія в Google-таблицю (і лист TAKE HIGH) — через скрипт Google; відповідь Google сайт прочитати не може
      var url = (window.TH_CONFIG || {}).sheetsUrl;
      if (url) { try { fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(rec) }).catch(function () {}); } catch (e) {} }
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
    var h = '<section class="page-head"><div class="wrap"><nav class="crumbs" aria-label="Breadcrumbs"><a href="#/">Home</a><span aria-hidden="true">/</span><span>Partnerships</span></nav>' +
      '<span class="label">Partnerships</span><h1 class="story-title">' + esc(T('partnerships', 'title', 'Partners who strengthen the team')) + '</h1>' +
      (P.intro ? '<div class="pi-intro">' + paras(P.intro) + '</div>' : '') +
      '<a class="pillbtn light big" href="#/partnerships/enquiry">Discuss a partnership ' + ARR + '</a></div></section>';
    var dirs = (P.dirs || []).filter(function (d) { return String(d.text || '').trim(); });
    if (dirs.length) h += '<section class="ps-sec"><div class="wrap"><div class="sec-head"><span class="label">Directions</span><h2 class="story-title">Partnership areas</h2></div><div class="dir-grid">' +
      dirs.map(function (d) { return '<div class="dir-card"><h3>' + esc(d._label) + '</h3><p>' + esc(d.text) + '</p></div>'; }).join('') + '</div></div></section>';
    var steps = (P.steps || []).filter(function (s) { return String(s.title || '').trim(); });
    if (steps.length) h += '<section class="ps-sec"><div class="wrap"><div class="sec-head"><span class="label">Approach</span><h2 class="story-title">How we build a partnership</h2></div><ol class="steps">' +
      steps.map(function (s, i) { return '<li><span class="snum">' + (i < 9 ? '0' : '') + (i + 1) + '</span><h3>' + esc(s.title) + '</h3><p>' + esc(s.text || '') + '</p></li>'; }).join('') + '</ol></div></section>';
    var PL = shownPartners();
    if (PL.length) h += '<section class="ps-sec" id="partners-list"><div class="wrap"><div class="sec-head"><span class="label">Partners</span><h2 class="story-title">Who works with the team</h2></div><div class="pt-grid">' +
      PL.map(function (p) {
        var u = img(p.logo), logo = '<span class="pt-logo">' + (u ? '<img src="' + esc(u) + '" alt="' + esc(p.name) + ' logo">' : '') + '</span>';
        return '<article class="pt-card" id="p-' + esc(p.id) + '">' + (p.site ? '<a class="pt-logo-link" href="' + esc(p.site) + '" target="_blank" rel="noopener" aria-label="' + esc(p.name) + ' (opens in a new tab)">' + logo + '</a>' : logo) +
          '<h3>' + esc(p.name) + '</h3>' + (p.role ? '<p>' + esc(p.role) + '</p>' : '') + '</article>';
      }).join('') + '</div></div></section>';
    var CL = (D.cases || []).filter(function (c) { return c.status === 'pub'; });
    if (CL.length) {
      var showN = CASES.all ? CL.length : 3;
      h += '<section class="ps-sec" id="cases"><div class="wrap"><div class="sec-head"><span class="label">Cases</span><h2 class="story-title">Partnerships in action</h2></div><div class="case-grid">' +
        CL.slice(0, showN).map(function (c) {
          var u = img(c.img), pp = partnerOf(c.partner);
          return '<article class="case-card"><div class="ph">' + (u ? '<img src="' + esc(u) + '" alt="" loading="lazy">' : '<span class="ph-empty"></span>') + (c.imgAuthor ? '<span class="mcredit">Photo: ' + esc(c.imgAuthor) + '</span>' : '') + '</div>' +
            '<span class="meta">' + esc([c.dir, pp && pp.name].filter(Boolean).join(' · ')) + '</span><h3>' + esc(c.title) + '</h3>' + (c.text ? '<p>' + esc(c.text) + '</p>' : '') + '</article>';
        }).join('') + '</div>' + (CL.length > showN ? '<div class="more-row"><button class="pillbtn outline big" type="button" data-cases-more>Show more</button></div>' : '') + '</div></section>';
    }
    var NL = published().filter(function (n) { return n.section === 'Partnerships'; }).slice(0, 3);
    if (NL.length) h += '<section class="ps-sec"><div class="wrap"><div class="latest-head"><div><span class="label">Latest</span><h2 class="story-title">News from Partnerships</h2></div><a class="pillbtn dark" href="#/news?section=Partnerships">All updates ' + ARR + '</a></div><div class="ngrid">' + NL.map(ncard).join('') + '</div></div></section>';
    h += '<section class="ps-sec enq-sec" id="enquiry"><div class="wrap enq-wrap"><div class="sec-head"><span class="label">Contact</span><h2 class="story-title">Partnership enquiry</h2><p class="enq-lead">Tell us about your company and what you would like to achieve. We reply by email.</p></div>' + enquiryForm() + '</div></section>';
    return { html: h, title: 'Partnerships · TAKE HIGH' };
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
      (people.length ? '<div><dt>People</dt><dd>' + people.map(function (p, i) { var l = i < (n.people || []).length ? memberLink(n.people[i]) : null; return l ? '<a href="' + l + '">' + esc(p) + '</a>' : esc(p); }).join(', ') + '</dd></div>' : '') +
      (partnerOf(n.partner) ? '<div><dt>Partner</dt><dd>' + esc(partnerOf(n.partner).name) + '</dd></div>' : '') +
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
    if (parts.length === 1 && parts[0] && ['latest', 'news', 'club', 'partnerships'].indexOf(parts[0]) < 0 && document.getElementById(parts[0]) && home.contains(document.getElementById(parts[0]))) parts = ['home', parts[0]];
    return { parts: parts, q: q };
  }
  var lastKey = null;
  function route(keepScroll) {
    var r = parse(), p = r.parts, view = null;
    if (p[0] === 'latest') { location.replace('#/news' + location.hash.replace(/^#\/?latest/, '')); return; }
    if (p[0] === 'news' && p[1]) view = renderNews(p[1]);
    else if (p[0] === 'news') view = renderLatest(r.q);
    else if (p[0] === 'club') view = renderClub();
    else if (p[0] === 'partnerships') view = renderPartnerships();
    if (view) {
      var ae = document.activeElement, fid = ae && page.contains(ae) && ae.id ? ae.id : null, ss = null, se = null;
      try { if (fid && ae.selectionStart != null) { ss = ae.selectionStart; se = ae.selectionEnd; } } catch (x) {}
      page.innerHTML = view.html; page.hidden = false; home.hidden = true; document.title = view.title;
      if (fid && keepScroll) { var fe = document.getElementById(fid); if (fe) { fe.focus({ preventScroll: true }); try { if (ss != null) fe.setSelectionRange(ss, se); } catch (x) {} } }
    } else {
      page.hidden = true; page.innerHTML = ''; home.hidden = false; document.title = 'TAKE HIGH';
    }
    var key = p.join('/') + JSON.stringify(r.q);
    if (keepScroll && key === lastKey) return;
    lastKey = key;
    if (p[0] === 'partnerships' && p[1]) { var sec2 = document.getElementById(p[1]); if (sec2) { window.scrollTo({ top: sec2.getBoundingClientRect().top + window.scrollY - 72, behavior: 'instant' }); var f1 = sec2.querySelector('input,select,textarea'); if (f1 && p[1] === 'enquiry') f1.focus({ preventScroll: true }); return; } }
    if (p[0] === 'club' && p[1]) {
      var mc = document.getElementById('m-' + p[1]);
      if (mc) { mc.scrollIntoView({ block: 'center', behavior: 'instant' }); mc.classList.add('flash'); setTimeout(function () { mc.classList.remove('flash'); }, 1800); return; }
    }
    if (!view && p[0] === 'home' && p[1]) { var t = document.getElementById(p[1]); if (t) { window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY, behavior: 'instant' }); return; } }
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', function () { route(false); });
  // форма: значення в ENQ, перевірка поля — коли з нього виходять
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
