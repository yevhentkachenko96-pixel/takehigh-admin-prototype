/* Оболонка адмінки: вхід, меню, маршрути */
(function () {
  'use strict';
  var A = window.A, esc = A.esc, icon = A.icon;
  var CFG = window.TH_CONFIG || {};
  var ADMIN = CFG.admin || {};
  var SESSION = 'th-gh-session';
  var root = document.getElementById('root');

  // Розділи меню: [ключ маршруту, назва]. У прототипі лише ті розділи, які реально працюють.
  var GROUPS = [
    ['Контент', [['news', 'Новини'], ['tags', 'Теги']]],
    ['Люди', [['members', 'Учасники']]]
  ];

  A.saveError = function (e) {
    var code = e && e.code;
    var msg = code === 'conflict' ? 'Не збережено: дані змінилися в іншому вікні. Оновіть сторінку'
      : code === 'auth' ? 'Не збережено: Dropbox не прийняв ключі доступу'
      : code === 'network' ? 'Не збережено: немає звʼязку з Dropbox'
      : (e && e.message) || 'Не вдалося зберегти';
    A.toast(msg, true);
    if (e && e.detail) console.warn('[TAKE HIGH]', e.detail);
  };
  A.notFound = function (el, title, href, label) {
    el.innerHTML = '<div class="empty"><h2>' + esc(title) + '</h2><p>Можливо, запис видалили або посилання неточне.</p><a class="btn btn-secondary" href="' + href + '">' + esc(label) + '</a></div>';
  };

  /* ---------- вхід ---------- */
  function sha256(s) {
    if (!(window.crypto && crypto.subtle)) return Promise.reject(new Error('insecure'));
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  function loginNeeded() { return !!(ADMIN.user && ADMIN.passSha256); }
  function loggedIn() { try { return sessionStorage.getItem(SESSION) === ADMIN.passSha256; } catch (e) { return false; } }
  function showLogin(err) {
    root.innerHTML = '<div class="login"><form class="login-card" id="login" novalidate>' +
      '<div class="brand" style="padding:0"><span class="brand-name">TAKE HIGH</span><span class="brand-sub">Адмінка сайту · прототип</span></div>' +
      '<h1>Вхід</h1>' +
      (err ? '<div class="banner banner-err" role="alert">' + icon('err') + '<div>' + esc(err) + '</div></div>' : '') +
      '<div class="field"><label class="label" for="lg-user">Логін</label><input class="input" id="lg-user" autocomplete="username" required></div>' +
      '<div class="field"><label class="label" for="lg-pass">Пароль</label><input class="input" id="lg-pass" type="password" autocomplete="current-password" required></div>' +
      '<button class="btn btn-primary" type="submit">Увійти</button>' +
      '<a class="crumb" href="../site/">' + icon('ext', 'i-sm') + 'Відкрити сайт</a></form></div>';
    var f = document.getElementById('login');
    document.getElementById('lg-user').focus();
    f.onsubmit = function (e) {
      e.preventDefault();
      var u = document.getElementById('lg-user').value.trim(), p = document.getElementById('lg-pass').value;
      sha256(p).then(function (h) {
        if (u !== ADMIN.user || h !== ADMIN.passSha256) { showLogin('Неправильний логін або пароль.'); return; }
        try { sessionStorage.setItem(SESSION, h); } catch (x) {}
        A.user = u; start();
      }, function () { showLogin('Вхід працює лише через https або localhost.'); });
    };
  }

  /* ---------- оболонка ---------- */
  var navOpen = false;
  function sidebar(active) {
    var h = '<nav class="side" aria-label="Розділи адмінки"><div class="brand-row"><div class="brand"><span class="brand-name">TAKE HIGH</span><span class="brand-sub">Адмінка сайту</span></div>' +
      '<button class="btn btn-secondary btn-sm side-toggle" type="button" aria-expanded="' + navOpen + '" aria-controls="side-nav" data-act="nav">' + icon(navOpen ? 'close' : 'menu') + (navOpen ? 'Закрити' : 'Меню') + '</button></div>' +
      '<div class="side-nav' + (navOpen ? ' is-open' : '') + '" id="side-nav">';
    GROUPS.forEach(function (g) {
      h += '<div class="nav-group"><div class="nav-title">' + esc(g[0]) + '</div>';
      g[1].forEach(function (it) {
        var on = it[0] === active;
        h += '<a class="nav-item' + (on ? ' is-active' : '') + '" href="#/' + it[0] + '"' + (on ? ' aria-current="page"' : '') + '>' + esc(it[1]) + '</a>';
      });
      h += '</div>';
    });
    h += '<div class="side-links nav-group"><div class="nav-title">Прототип</div><a class="nav-item" href="../site/" target="_blank" rel="noopener">Відкрити сайт ↗</a>' +
      (loginNeeded() ? '<button class="nav-item" type="button" data-act="logout" style="border:0;background:none;cursor:pointer;font:inherit;text-align:left">Вийти</button>' : '') + '</div>';
    h += '</div><div class="side-foot"><strong>' + esc(A.user || 'Адміністратор') + '</strong><span class="store-line" style="padding:0"><span class="store-dot' + (window.THStorage.mode === 'dropbox' ? '' : ' local') + '"></span>Дані: ' + esc(window.THStorage.label) + '</span></div></nav>';
    return h;
  }

  var current = null;
  A.route = function () {
    if (!A.data) return;
    var hash = location.hash || '#/news';
    var parts = hash.replace(/^#\/?/, '').split('/').map(function (x) { try { return decodeURIComponent(x); } catch (e) { return x; } });
    var sec = parts[0] || 'news', rec = parts[1];
    var all = []; GROUPS.forEach(function (g) { g[1].forEach(function (it) { all.push(it); }); });
    var alias = { 'news-texts': 'news', 'club-texts': 'members' };
    var item = all.find(function (it) { return it[0] === (alias[sec] || sec); });
    // невідомий або прибраний розділ → Новини
    if (!item) { location.replace('#/news'); return; }
    root.innerHTML = '<div class="app">' + sidebar(item[0]) + '<main class="main" id="main"></main></div>';
    var main = document.getElementById('main');
    var s = A.screens;
    if (sec === 'news-texts') { current = s.newsTexts(main); current = { kind: 'form', ctl: current }; document.title = 'Тексти блоків новин · TAKE HIGH · Адмінка'; window.scrollTo(0, 0); return; }
    if (sec === 'club-texts') { current = { kind: 'form', ctl: s.clubTexts(main) }; document.title = 'Тексти сторінки Club · TAKE HIGH · Адмінка'; window.scrollTo(0, 0); return; }
    if (item[0] === 'members') current = rec ? s.memberCard(main, rec) : s.members(main);
    else if (item[0] === 'news') current = rec ? s.newsCard(main, rec) : s.news(main);
    else if (item[0] === 'tags') current = rec ? s.tagCard(main, rec) : s.tags(main);
    current = current ? { kind: rec ? 'form' : 'list', ctl: current } : null;
    document.title = item[1] + ' · TAKE HIGH · Адмінка';
    window.scrollTo(0, 0);
  };

  A.onExternal = function () {
    if (current && current.kind === 'list') { current.ctl.render(); A.toast('Дані оновлено'); }
    else if (current && current.kind === 'form') A.toast('Хтось змінив дані в іншому вікні. Ваші правки в цій картці збережуться поверх лише цього запису');
  };
  A.onStale = function () { if (current && current.ctl && current.ctl.render) current.ctl.render(); };

  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act="nav"],[data-act="logout"]'); if (!t) return;
    if (t.dataset.act === 'nav') { navOpen = !navOpen; var nav = root.querySelector('.side'); if (nav) nav.outerHTML = sidebar((location.hash.replace(/^#\/?/, '').split('/')[0]) || 'news'); }
    else { try { sessionStorage.removeItem(SESSION); } catch (x) {} location.reload(); }
  });
  root.addEventListener('click', function (e) { var a = e.target.closest('.side .nav-item[href^="#/"]'); if (a) navOpen = false; });

  function start() {
    root.innerHTML = '<div class="state-box"><p class="meta">Завантаження даних з: ' + esc(window.THStorage.label) + '…</p></div>';
    A.load().then(function (r) {
      var box = root.querySelector('.state-box');
      return A.migratePhotos(function (i, n) {
        if (box) box.innerHTML = '<h1 style="margin:0;font-size:20px">Переносимо фото в Dropbox</h1><p class="meta" style="margin:0">Перший вхід: фото сайту копіюються у ваш Dropbox. Фото ' + i + ' з ' + n + '. Не закривайте сторінку.</p><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + i + '"><span style="width:' + Math.round(i / n * 100) + '%"></span></div>';
      }).then(function (m) { return A.applyCopyUpdates().then(function (c) { m.copy = c; return A.applyDataFixes(); }).then(function (x) { m.copy = (m.copy || 0) + (x || 0); return m; }); }).then(function (m) {
        window.addEventListener('hashchange', A.route);
        A.route();
        if (m.done) A.toast('Фото перенесено в Dropbox: ' + m.done);
        else if (m.copy) A.toast('Застосовано правки контенту: ' + m.copy);
        else if (r.seeded) A.toast('Створено файл даних із початковим контентом');
        if (m.failed.length) { A.toast('Не всі фото перенеслися (' + m.failed.length + '). Наступний вхід продовжить', true); console.warn('[TAKE HIGH] фото не перенесено:', m.failed); }
      });
    }).catch(function (e) {
      root.innerHTML = '<div class="state-box"><h1 style="margin:0;font-size:20px">Не вдалося завантажити дані</h1><p style="margin:0">' + esc(e.message || 'Невідома помилка') + '</p>' +
        (e.detail ? '<pre>' + esc(String(e.detail).slice(0, 800)) + '</pre>' : '') +
        '<p class="meta" style="margin:0">Перевірте ключі Dropbox у секретах GitHub (див. README) і спробуйте ще раз.</p><div><button class="btn btn-primary" type="button" id="retry">Спробувати ще раз</button></div></div>';
      document.getElementById('retry').onclick = start;
    });
  }

  if (loginNeeded() && !loggedIn()) showLogin();
  else { A.user = loginNeeded() ? ADMIN.user : null; start(); }
})();
