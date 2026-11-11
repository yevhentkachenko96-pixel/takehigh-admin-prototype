/* Спільні дрібниці інтерфейсу адмінки */
(function () {
  'use strict';
  var A = window.A = window.A || {};

  A.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };

  var P = {
    back: '<path d="M15 6l-6 6 6 6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    draft: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    arch: '<path d="M4 7h16v3H4zM6 10v9h12v-9M10 14h4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    err: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>',
    warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
    ok: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    dots: '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    x: '<path d="M7 7l10 10M17 7L7 17"/>',
    up: '<path d="M12 16V5M7.5 9.5L12 5l4.5 4.5M5 19h14"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    list: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    ext: '<path d="M14 5h5v5M19 5l-8 8M10 6H5v13h13v-5"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
    grip: '<circle cx="9" cy="6" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="18" r="1.3"/>',
    down: '<path d="M7 10l5 5 5-5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'
  };
  A.icon = function (name, cls, label) {
    var a = label ? ' role="img" aria-label="' + A.esc(label) + '"' : ' aria-hidden="true"';
    return '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24"' + a + '>' + (P[name] || '') + '</svg>';
  };

  A.badge = function (status) {
    if (status === 'pub') return '<span class="badge b-pub">' + A.icon('check', 'i-sm') + 'Опубліковано</span>';
    if (status === 'arch') return '<span class="badge b-arch">' + A.icon('arch', 'i-sm') + 'Архів</span>';
    return '<span class="badge b-draft">' + A.icon('draft', 'i-sm') + 'Чернетка</span>';
  };
  A.STATUS = { pub: 'Опубліковано', draft: 'Чернетка', arch: 'Архів' }; // «Архів» лишився лише для старих записів журналу
  A.isPoint = function (p) { return !!(p && typeof p.lat === 'number' && typeof p.lng === 'number'); };
  A.tagKey = function (t) { return String(t || '').trim().toLowerCase(); };

  A.pad = function (n) { return (n < 10 ? '0' : '') + n; };
  A.now = function () { var d = new Date(); return A.pad(d.getDate()) + '.' + A.pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + A.pad(d.getHours()) + ':' + A.pad(d.getMinutes()); };
  A.today = function () { var d = new Date(); return d.getFullYear() + '-' + A.pad(d.getMonth() + 1) + '-' + A.pad(d.getDate()); };
  A.fd = function (iso) { if (!iso) return ''; var m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}:\d{2}))?/); return m ? (m[3] + '.' + m[2] + '.' + m[1] + (m[4] ? ' ' + m[4] : '')) : String(iso); };
  // «Змінено» у форматі ДД.ММ.РРРР ГГ:ХХ → ключ для сортування
  A.changedKey = function (s) { var m = String(s || '').match(/(\d{2})\.(\d{2})\.(\d{4})(?: (\d{2}):(\d{2}))?/); return m ? m[3] + m[2] + m[1] + (m[4] || '00') + (m[5] || '00') : ''; };
  A.newId = function (p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); };

  // Адреса фото: ключ з вайрфрейму → мініатюра; завантажене → як є
  // small: мініатюра для списків (менші файли — швидше відкриваються списки)
  A.img = function (k, small) {
    if (!k || typeof k !== 'string') return null;
    var lk = window.THStorage && THStorage.localPhoto(k); if (lk) k = lk;
    if (/^(data:|blob:|https?:)/.test(k)) { var th = small !== false && A.data && A.data.thumbs && A.data.thumbs[k]; return th || k; }
    var t = window.TH_THUMBS || {};
    if (t[k]) return '../shared/' + t[k];
    var p = window.TH_PHOTOS || {};
    return p[k] ? '../shared/' + p[k] : null;
  };

  var toastTimer = null;
  A.toast = function (msg, bad) {
    var el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
    el.className = 'toast' + (bad ? ' toast-err' : '');
    el.setAttribute('role', 'status');
    el.innerHTML = A.icon(bad ? 'err' : 'ok', 'ti') + '<span>' + A.esc(msg) + '</span>';
    el.hidden = false;
    clearTimeout(toastTimer);
    // довгі повідомлення показуються довше, щоб встигнути прочитати
    toastTimer = setTimeout(function () { el.hidden = true; }, Math.min(9000, Math.max(bad ? 5000 : 2600, String(msg).length * 55)));
  };

  A.go = function (hash) { if (location.hash === hash) A.route(); else location.hash = hash; };
})();
