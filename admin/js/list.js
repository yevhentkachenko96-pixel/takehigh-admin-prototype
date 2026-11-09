/* Список записів: колонки, сортування, вибір, масові дії, меню дій у рядку.
   cfg: { title, addLabel, addHref, note, emptyTitle, emptyText, cols, rows, sort, selectable, actions, onPatch }
   row: { id, href, status, img, tone, featured, c: {...}, s: {...} } */
(function () {
  'use strict';
  var A = window.A, esc = A.esc, icon = A.icon;

  A.list = function (root, cfg) {
    var st = { sort: cfg.sort || null, sel: {}, menuFor: null, confirm: null, busy: false };
    var selectable = cfg.selectable !== false;

    function rows() {
      var R = (typeof cfg.rows === 'function' ? cfg.rows() : cfg.rows).slice();
      if (st.sort) {
        var k = st.sort.key, d = st.sort.dir === 'desc' ? -1 : 1;
        R.sort(function (a, b) {
          var x = (a.s && a.s[k] !== undefined) ? a.s[k] : (k === 'status' ? a.status : a.c[k]);
          var y = (b.s && b.s[k] !== undefined) ? b.s[k] : (k === 'status' ? b.status : b.c[k]);
          if (typeof x === 'number' && typeof y === 'number') return (x - y) * d;
          return String(x == null ? '' : x).localeCompare(String(y == null ? '' : y), 'uk', { numeric: true }) * d;
        });
      }
      return R;
    }

    function cell(col, r) {
      var k = col.kind || 'text';
      var val = col.key === 'status' ? r.status : r.c[col.key];
      var empty = val === undefined || val === null || val === '' || val === false;
      var cls = (k === 'link' ? 'col-title' : (col.nowrap || k === 'muted' || k === 'status' ? (k === 'muted' ? 'muted nowrap' : 'nowrap') : '')) + ' k-' + k;
      var label = (k === 'link' || k === 'thumb') ? '' : (col.label || '');
      var h;
      if (k === 'thumb') {
        var im = r.img ? '<img class="' + (col.logo ? 'thumb-logo-img' : 'thumb thumb-img' + (col.square ? ' thumb-sq' : '')) + '" src="' + esc(r.img) + '" alt="">'
          : '<span class="' + (col.logo ? 'thumb-logo' : 'thumb ' + (col.square ? 'thumb-sq ' : '') + (r.tone || 't1')) + '" aria-hidden="true">' + (col.logo ? 'LOGO' : '') + '</span>';
        var mark = r.featured ? '<span class="thumb-mark" title="' + esc(cfg.markLabel || 'Головна') + '">' + icon('star', '', cfg.markLabel || 'Головна') + '</span>' : '';
        h = '<span class="thumb-wrap">' + im + mark + '</span>';
      } else if (k === 'link') h = '<a class="row-link" href="' + esc(r.href) + '">' + esc(val || '(без назви)') + '</a>';
      else if (k === 'status') h = A.badge(r.status);
      else if (k === 'pill') h = empty ? '<span class="dash" aria-label="немає">—</span>' : '<span class="pill' + ((col.tones || {})[val] ? ' pill-' + col.tones[val] : '') + '">' + esc(val) + '</span>';
      else h = empty ? '<span class="dash" aria-label="немає">—</span>' : esc(val);
      return '<td class="' + cls + '" data-label="' + esc(label) + '">' + h + '</td>';
    }

    function menuFor(r) {
      var m = [];
      (cfg.actions || ['edit']).forEach(function (a) {
        if (a === 'edit') m.push('<a class="menu-item" role="menuitem" href="' + esc(r.href) + '">Редагувати</a>');
        if (a === 'makeMain' && r.status === 'pub' && !r.featured) m.push('<button class="menu-item" role="menuitem" type="button" data-act="main" data-id="' + esc(r.id) + '">Зробити головною</button>');
        if (a === 'unpublish' && r.status === 'pub') m.push('<button class="menu-item" role="menuitem" type="button" data-act="unpub" data-id="' + esc(r.id) + '">Зняти з публікації</button>');
        if (a === 'delete' && cfg.onDelete) m.push('<div class="menu-sep" role="separator"></div><button class="menu-item btn-danger-text" role="menuitem" type="button" data-act="del" data-id="' + esc(r.id) + '">Видалити</button>');
      });
      return m.join('');
    }

    function render() {
      var R = rows();
      var ids = R.map(function (r) { return r.id; });
      Object.keys(st.sel).forEach(function (id) { if (ids.indexOf(id) < 0) delete st.sel[id]; });
      var nSel = Object.keys(st.sel).length;
      var h = '<div style="display:flex;flex-direction:column;gap:20px;width:100%">';
      h += '<header class="page-head"><div class="head-left"><h1>' + esc(cfg.title) + '</h1><span class="meta">Записів: ' + R.length + '</span></div>';
      if (cfg.addHref || cfg.extraHref) {
        h += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
        if (cfg.extraHref) h += '<a class="btn btn-secondary" href="' + esc(cfg.extraHref) + '">' + esc(cfg.extraLabel) + '</a>';
        if (cfg.addHref) h += '<a class="btn btn-primary" href="' + esc(cfg.addHref) + '">' + icon('plus') + esc(cfg.addLabel) + '</a>';
        h += '</div>';
      }
      h += '</header>';
      if (cfg.note) h += '<p class="note" style="margin:0">' + icon('info') + '<span>' + esc(cfg.note) + '</span></p>';
      if (nSel) {
        h += '<div class="bulk" role="region" aria-label="Масові дії"><strong>Обрано: ' + nSel + '</strong>' +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="bulk-unpub">Зняти з публікації</button>' +
          (cfg.onDelete ? '<button class="btn btn-secondary btn-sm btn-danger-text" type="button" data-act="bulk-del">Видалити</button>' : '') +
          '<button class="btn btn-ghost btn-sm" type="button" data-act="bulk-clear">Скасувати вибір</button></div>';
      }
      if (!R.length) {
        h += '<div class="empty"><div class="empty-ico">' + icon('list') + '</div><h2>' + esc(cfg.emptyTitle || 'Записів ще немає') + '</h2><p>' + esc(cfg.emptyText || '') + '</p>' +
          (cfg.addHref ? '<a class="btn btn-primary" href="' + esc(cfg.addHref) + '">' + esc(cfg.addLabel) + '</a>' : '') + '</div>';
      } else {
        var all = nSel === R.length;
        h += '<div class="tbl-wrap"><table class="tbl"><thead><tr>';
        if (selectable) h += '<th class="col-chk"><input class="chk" type="checkbox" aria-label="Обрати всі" data-act="all"' + (all ? ' checked' : '') + '></th>';
        cfg.cols.forEach(function (col) {
          var sorted = st.sort && st.sort.key === col.key;
          var aria = sorted ? (st.sort.dir === 'asc' ? 'ascending' : 'descending') : null;
          h += '<th' + (col.w ? ' style="width:' + col.w + '"' : '') + (aria ? ' aria-sort="' + aria + '"' : '') + '>';
          if (col.sortable) h += '<button class="th-btn' + (sorted ? ' is-sorted' : '') + '" type="button" data-act="sort" data-key="' + esc(col.key) + '" data-first="' + (col.firstDir || 'asc') + '">' + esc(col.label) +
            '<span class="arrow' + (sorted ? '' : ' arrow-idle') + '" aria-hidden="true">' + (sorted ? (st.sort.dir === 'asc' ? '↑' : '↓') : '↕') + '</span></button>';
          else h += esc(col.label);
          h += '</th>';
        });
        h += '<th class="col-act"><span class="sr-only">Дії</span></th></tr></thead><tbody>';
        R.forEach(function (r) {
          var on = !!st.sel[r.id], title = r.c[cfg.titleKey || 'title'] || '';
          h += '<tr class="' + (on ? 'is-selected' : '') + '">';
          if (selectable) h += '<td class="col-chk"><input class="chk lift" type="checkbox" aria-label="Обрати: ' + esc(title) + '" data-act="sel" data-id="' + esc(r.id) + '"' + (on ? ' checked' : '') + '></td>';
          cfg.cols.forEach(function (col) { h += cell(col, r); });
          var open = st.menuFor === r.id;
          h += '<td class="col-act"><div class="menu-anchor lift' + (open ? ' is-open' : '') + '"><button class="icon-btn" type="button" aria-label="Дії: ' + esc(title) + '" aria-haspopup="menu" aria-expanded="' + open + '" data-act="menu" data-id="' + esc(r.id) + '">' + icon('dots') + '</button>' +
            (open ? '<div class="menu" role="menu" aria-label="Дії для запису">' + menuFor(r) + '</div>' : '') + '</div></td></tr>';
        });
        h += '</tbody></table></div>';
      }
      if (st.menuFor) h += '<button class="backdrop" type="button" aria-label="Закрити меню" data-act="close"></button>';
      if (st.confirm) {
        var c = st.confirm, one = c.ids.length === 1;
        h += '<div class="modal-back" data-act="del-cancel"></div><div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="del-t" aria-describedby="del-d">' +
          '<h2 id="del-t">' + (one ? 'Видалити ' + esc(cfg.entityLabel || 'запис') + '?' : 'Видалити ' + c.ids.length + ' ' + esc(plural(c.ids.length)) + '?') + '</h2>' +
          '<p id="del-d">' + (one ? '«' + esc(c.titles[0]) + '» буде видалено остаточно.' : 'Буде видалено остаточно: ' + c.titles.map(function (x) { return '«' + esc(x) + '»'; }).join(', ') + '.') +
          ' На сайті ' + (one ? 'запис зникне' : 'записи зникнуть') + ' за кілька секунд. Скасувати дію не можна.</p>' +
          '<div class="modal-actions"><button class="btn btn-secondary" type="button" data-act="del-cancel">Скасувати</button>' +
          '<button class="btn btn-danger" type="button" data-act="del-ok"' + (st.busy ? ' disabled' : '') + '>' + (st.busy ? 'Видалення…' : 'Видалити') + '</button></div></div>';
      }
      h += '</div>';
      root.innerHTML = h;
      if (st.confirm && !st.busy) { var cb = root.querySelector('.modal [data-act="del-cancel"]'); if (cb) cb.focus(); }
    }

    // 2–4 новини, 5+ новин (cfg.entityForms: [2–4, 5+])
    function plural(n) { var F = cfg.entityForms || ['записи', 'записів'], d = n % 10, h = n % 100; return d >= 2 && d <= 4 && (h < 12 || h > 14) ? F[0] : F[1]; }
    function askDelete(ids) {
      var R = rows().filter(function (r) { return ids.indexOf(r.id) >= 0; });
      if (!R.length) return;
      st.menuFor = null;
      st.confirm = { ids: R.map(function (r) { return r.id; }), titles: R.map(function (r) { return r.c[cfg.titleKey || 'title'] || '(без назви)'; }) };
      render();
    }
    function doDelete() {
      var ids = st.confirm.ids; st.busy = true; render();
      cfg.onDelete(ids).then(function (n) { st.busy = false; st.confirm = null; st.sel = {}; render(); A.toast('Видалено: ' + (n || ids.length)); },
        function (e) { st.busy = false; st.confirm = null; render(); A.saveError(e); });
    }

    function patch(ids, status, okMsg) {
      if (!cfg.onPatch) return;
      var R = rows().filter(function (r) { return ids.indexOf(r.id) >= 0; });
      var ch = R.filter(function (r) { return status === 'draft' ? r.status === 'pub' : r.status !== status; }).map(function (r) { return { id: r.id, status: status }; });
      if (!ch.length) { A.toast('Нічого не змінено'); return; }
      cfg.onPatch(ch).then(function () { st.sel = {}; st.menuFor = null; render(); A.toast(okMsg + ': ' + ch.length); }, A.saveError);
    }

    root.onclick = function (e) {
      var t = e.target.closest('[data-act]'); if (!t || !root.contains(t)) return;
      var act = t.getAttribute('data-act'), id = t.getAttribute('data-id');
      if (act === 'sort') { var k = t.getAttribute('data-key'); st.sort = st.sort && st.sort.key === k ? { key: k, dir: st.sort.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: t.getAttribute('data-first') }; render(); }
      else if (act === 'menu') { st.menuFor = st.menuFor === id ? null : id; render(); var f = root.querySelector('.menu .menu-item'); if (f) f.focus(); }
      else if (act === 'close') { st.menuFor = null; render(); }
      else if (act === 'unpub') patch([id], 'draft', 'Знято з публікації');
      else if (act === 'del') askDelete([id]);
      else if (act === 'del-cancel') { if (!st.busy) { st.confirm = null; render(); } }
      else if (act === 'del-ok') { if (!st.busy) doDelete(); }
      else if (act === 'main') cfg.onPatch([{ id: id, featured: true }]).then(function () { st.menuFor = null; render(); A.toast('Новина тепер головна'); }, A.saveError);
      else if (act === 'bulk-unpub') patch(Object.keys(st.sel), 'draft', 'Знято з публікації');
      else if (act === 'bulk-del') askDelete(Object.keys(st.sel));
      else if (act === 'bulk-clear') { st.sel = {}; render(); }
    };
    root.onchange = function (e) {
      var t = e.target.closest('[data-act]'); if (!t) return;
      var act = t.getAttribute('data-act');
      if (act === 'sel') { var id = t.getAttribute('data-id'); if (t.checked) st.sel[id] = true; else delete st.sel[id]; render(); }
      if (act === 'all') { st.sel = {}; if (t.checked) rows().forEach(function (r) { st.sel[r.id] = true; }); render(); }
    };
    root.onkeydown = function (e) {
      if (e.key === 'Escape' && st.confirm && !st.busy) { st.confirm = null; render(); return; }
      if (e.key === 'Escape' && st.menuFor) { st.menuFor = null; render(); }
      // фокус не виходить з вікна підтвердження
      if (e.key === 'Tab' && st.confirm) {
        var b = root.querySelectorAll('.modal button:not([disabled])'); if (!b.length) return;
        var first = b[0], last = b[b.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    render();
    return { render: render };
  };
})();
