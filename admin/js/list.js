/* Список записів: колонки, сортування, вибір, масові дії, меню дій у рядку.
   cfg: { title, addLabel, addHref, note, emptyTitle, emptyText, cols, rows, sort, selectable, actions, onPatch }
   row: { id, href, status, img, tone, featured, c: {...}, s: {...} } */
(function () {
  'use strict';
  var A = window.A, esc = A.esc, icon = A.icon;

  A.list = function (root, cfg) {
    var st = { sort: cfg.sort || null, sel: {}, menuFor: null, confirm: null, busy: false, dd: null };
    // пошук і фільтри живуть до оновлення сторінки: повернення з картки запису їх не скидає
    A.listMemory = A.listMemory || {};
    var mem = cfg.memoryKey ? (A.listMemory[cfg.memoryKey] = A.listMemory[cfg.memoryKey] || { q: '', f: {} }) : { q: '', f: {} };
    if (cfg.tabs && !mem.tab) mem.tab = cfg.tabs[0].key;
    // ручний порядок: лише у вкладці, де він увімкнений, і коли немає пошуку чи фільтрів
    function manual() { return !!(cfg.manualTab && cfg.manualTab(mem.tab) && !active()); }
    function active() { return !!(mem.q.trim() || Object.keys(mem.f).some(function (k) { return (mem.f[k] || []).length; })); }
    function passes(r) {
      if (cfg.tabs && (r.f ? r.f.tab : r.tab) !== mem.tab) return false;
      var q = mem.q.trim().toLowerCase();
      if (q && String(r.c[cfg.search && cfg.search.key || 'title'] || '').toLowerCase().indexOf(q) < 0) return false;
      // усередині фільтра — «або», між фільтрами і пошуком — «і»
      return (cfg.filters || []).every(function (fl) { var v = mem.f[fl.key] || []; return !v.length || v.indexOf(r.f ? r.f[fl.key] : r[fl.key]) >= 0; });
    }
    var selectable = cfg.selectable !== false;

    function allRows() { return (typeof cfg.rows === 'function' ? cfg.rows() : cfg.rows).slice(); }
    function rows() {
      var R = allRows().filter(passes);
      if (st.sort && !manual()) {
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
        if (a === 'publish' && r.status !== 'pub') m.push('<button class="menu-item" role="menuitem" type="button" data-act="pub" data-id="' + esc(r.id) + '">Опублікувати</button>');
        if (a === 'unpublish' && r.status === 'pub') m.push('<button class="menu-item" role="menuitem" type="button" data-act="unpub" data-id="' + esc(r.id) + '">Зняти з публікації</button>');
        if (a === 'delete' && cfg.onDelete) m.push('<div class="menu-sep" role="separator"></div><button class="menu-item btn-danger-text" role="menuitem" type="button" data-act="del" data-id="' + esc(r.id) + '">Видалити</button>');
      });
      return m.join('');
    }

    function filterBar(total, shown) {
      if (!cfg.search && !cfg.filters) return '';
      var h = '<div class="filters" role="search">';
      if (cfg.search) h += '<div class="search"><span class="search-ico" aria-hidden="true">' + A.icon('search', 'i-sm') + '</span><input class="input" id="lst-q" type="search" placeholder="' + A.esc(cfg.search.ph || 'Пошук') + '" aria-label="' + A.esc(cfg.search.ph || 'Пошук') + '" value="' + A.esc(mem.q) + '" autocomplete="off"></div>';
      (cfg.filters || []).forEach(function (fl, fi) {
        var v = mem.f[fl.key] || [], open = st.dd === fl.key;
        var label = v.length ? fl.label + ': ' + v.map(function (x) { return fl.names ? fl.names[x] || x : x; }).join(', ') : fl.label + ': усі';
        h += '<div class="fdd' + (v.length ? ' is-on' : '') + (fi % 2 ? ' fdd-r' : '') + '" data-dd="' + fl.key + '"><button class="btn btn-secondary btn-sm fdd-btn" type="button" aria-haspopup="true" aria-expanded="' + open + '" aria-controls="fdd-' + fl.key + '" data-act="dd" data-key="' + fl.key + '"><span class="fdd-txt">' + A.esc(label) + '</span>' + A.icon('down', 'i-sm') + '</button>';
        if (open) h += '<div class="fdd-panel" id="fdd-' + fl.key + '" role="group" aria-label="' + A.esc(fl.label) + '">' + fl.options.map(function (o, i) {
          return '<label class="fdd-opt"><input type="checkbox" class="chk" data-fk="' + fl.key + '" value="' + A.esc(o) + '"' + (v.indexOf(o) >= 0 ? ' checked' : '') + '>' + A.esc(fl.names ? fl.names[o] || o : o) + '</label>';
        }).join('') + (v.length ? '<button class="btn btn-ghost btn-sm" type="button" data-act="dd-clear" data-key="' + fl.key + '">Очистити</button>' : '') + '</div>';
        h += '</div>';
      });
      if (active()) h += '<button class="btn btn-ghost btn-sm" type="button" data-act="reset">Скинути фільтри</button>';
      return h + '</div>';
    }

    function render() {
      var ae = document.activeElement, keepId = ae && root.contains(ae) ? (ae.id || (ae.dataset && ae.dataset.fk ? 'fk:' + ae.dataset.fk + ':' + ae.value : null)) : null, cs = null, ce = null;
      try { if (ae && ae.id === 'lst-q') { cs = ae.selectionStart; ce = ae.selectionEnd; } } catch (x) {}
      var total = cfg.tabs ? allRows().filter(function (r) { return (r.f ? r.f.tab : r.tab) === mem.tab; }).length : allRows().length;
      var R = rows();
      var ids = R.map(function (r) { return r.id; });
      Object.keys(st.sel).forEach(function (id) { if (ids.indexOf(id) < 0) delete st.sel[id]; });
      var nSel = Object.keys(st.sel).length;
      var h = '<div style="display:flex;flex-direction:column;gap:20px;width:100%">';
      h += '<header class="page-head"><div class="head-left"><h1>' + esc(cfg.title) + '</h1><span class="meta" aria-live="polite">Записів: ' + (active() ? R.length + ' з ' + total : R.length) + '</span></div>';
      if (cfg.addHref || cfg.extraHref) {
        h += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
        if (cfg.extraHref) h += '<a class="btn btn-secondary" href="' + esc(cfg.extraHref) + '">' + esc(cfg.extraLabel) + '</a>';
        if (cfg.addHref) h += '<a class="btn btn-primary" href="' + esc(cfg.addHref) + '">' + icon('plus') + esc(cfg.addLabel) + '</a>';
        h += '</div>';
      }
      h += '</header>';
      if (cfg.tabs) {
        var all0 = allRows();
        h += '<div class="tabs" role="tablist" aria-label="Групи">' + cfg.tabs.map(function (tb) {
          var n = all0.filter(function (r) { return (r.f ? r.f.tab : r.tab) === tb.key; }).length, on = tb.key === mem.tab;
          return '<button class="tab' + (on ? ' is-active' : '') + '" role="tab" type="button" aria-selected="' + on + '" data-act="tab" data-key="' + esc(tb.key) + '">' + esc(tb.label) + ' <span class="tab-n">' + n + '</span></button>';
        }).join('') + '</div>';
      }
      var note = typeof cfg.note === 'function' ? cfg.note(mem.tab, manual(), active()) : cfg.note;
      if (note) h += '<p class="note" style="margin:0">' + icon('info') + '<span>' + esc(note) + '</span></p>';
      if (total) h += filterBar(total, R.length);
      if (nSel) {
        h += '<div class="bulk" role="region" aria-label="Масові дії"><strong>Обрано: ' + nSel + '</strong>' +
          ((cfg.actions || []).indexOf('publish') >= 0 ? '<button class="btn btn-secondary btn-sm" type="button" data-act="bulk-pub">Опублікувати</button>' : '') +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="bulk-unpub">Зняти з публікації</button>' +
          (cfg.onDelete ? '<button class="btn btn-secondary btn-sm btn-danger-text" type="button" data-act="bulk-del">Видалити</button>' : '') +
          '<button class="btn btn-ghost btn-sm" type="button" data-act="bulk-clear">Скасувати вибір</button></div>';
      }
      if (!R.length && total) {
        h += '<div class="empty"><div class="empty-ico">' + icon('search') + '</div><h2>Нічого не знайдено</h2><p>Змініть пошук або фільтри.</p><button class="btn btn-secondary" type="button" data-act="reset">Скинути фільтри</button></div>';
      } else if (!R.length) {
        h += '<div class="empty"><div class="empty-ico">' + icon('list') + '</div><h2>' + esc(cfg.emptyTitle || 'Записів ще немає') + '</h2><p>' + esc(cfg.emptyText || '') + '</p>' +
          (cfg.addHref ? '<a class="btn btn-primary" href="' + esc(cfg.addHref) + '">' + esc(cfg.addLabel) + '</a>' : '') + '</div>';
      } else {
        var all = nSel === R.length;
        h += '<div class="tbl-wrap"><table class="tbl"><thead><tr>';
        var man = manual();
        if (man) h += '<th class="col-drag"><span class="sr-only">Порядок</span></th>';
        if (selectable) h += '<th class="col-chk"><input class="chk" type="checkbox" aria-label="Обрати всі" data-act="all"' + (all ? ' checked' : '') + '></th>';
        cfg.cols.forEach(function (col) {
          var sorted = !man && st.sort && st.sort.key === col.key;
          var aria = sorted ? (st.sort.dir === 'asc' ? 'ascending' : 'descending') : null;
          h += '<th' + (col.w ? ' style="width:' + col.w + '"' : '') + (aria ? ' aria-sort="' + aria + '"' : '') + '>';
          if (col.sortable && !man) h += '<button class="th-btn' + (sorted ? ' is-sorted' : '') + '" type="button" data-act="sort" data-key="' + esc(col.key) + '" data-first="' + (col.firstDir || 'asc') + '">' + esc(col.label) +
            '<span class="arrow' + (sorted ? '' : ' arrow-idle') + '" aria-hidden="true">' + (sorted ? (st.sort.dir === 'asc' ? '↑' : '↓') : '↕') + '</span></button>';
          else h += esc(col.label);
          h += '</th>';
        });
        h += '<th class="col-act"><span class="sr-only">Дії</span></th></tr></thead><tbody>';
        R.forEach(function (r) {
          var on = !!st.sel[r.id], title = r.c[cfg.titleKey || 'title'] || '';
          h += '<tr class="' + (on ? 'is-selected' : '') + '" data-row="' + esc(r.id) + '">';
          if (man) {
            var ri = R.indexOf(r);
            h += '<td class="col-drag"><div class="drag-wrap lift"><button class="drag" type="button" data-drag="' + esc(r.id) + '" aria-label="Перемістити: ' + esc(title) + '. Стрілки вгору або вниз змінюють порядок" title="Перетягніть або натисніть і використайте стрілки ↑↓">' + A.icon('grip', 'i-sm') + '</button>' +
              '<span class="move-btns"><button class="icon-btn" type="button" data-act="move" data-id="' + esc(r.id) + '" data-dir="-1" aria-label="Вище: ' + esc(title) + '"' + (ri === 0 ? ' disabled' : '') + '>↑</button><button class="icon-btn" type="button" data-act="move" data-id="' + esc(r.id) + '" data-dir="1" aria-label="Нижче: ' + esc(title) + '"' + (ri === R.length - 1 ? ' disabled' : '') + '>↓</button></span></div></td>';
          }
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
          '<p id="del-d">' + (cfg.confirmText ? esc(cfg.confirmText(c.ids, c.titles)) :
            (one ? '«' + esc(c.titles[0]) + '» буде видалено остаточно.' : 'Буде видалено остаточно: ' + c.titles.map(function (x) { return '«' + esc(x) + '»'; }).join(', ') + '.') +
            ' На сайті ' + (one ? 'запис зникне' : 'записи зникнуть') + ' за кілька секунд. Скасувати дію не можна.') + '</p>' +
          '<div class="modal-actions"><button class="btn btn-secondary" type="button" data-act="del-cancel">Скасувати</button>' +
          '<button class="btn btn-danger" type="button" data-act="del-ok"' + (st.busy ? ' disabled' : '') + '>' + (st.busy ? 'Видалення…' : 'Видалити') + '</button></div></div>';
      }
      h += '</div>';
      root.innerHTML = h;
      if (keepId) {
        var el = keepId.indexOf('fk:') === 0 ? root.querySelector('[data-fk="' + keepId.split(':')[1] + '"][value="' + keepId.split(':').slice(2).join(':').replace(/"/g, '\\"') + '"]') : document.getElementById(keepId);
        if (el) { el.focus(); try { if (cs != null) el.setSelectionRange(cs, ce); } catch (x) {} }
      }
      if (st.confirm && !st.busy) { var cb = root.querySelector('.modal [data-act="del-cancel"]'); if (cb) cb.focus(); }
    }

    // 2–4 новини, 5+ новин (cfg.entityForms: [2–4, 5+])
    function plural(n) { var F = cfg.entityForms || ['записи', 'записів'], d = n % 10, h = n % 100; return d >= 2 && d <= 4 && (h < 12 || h > 14) ? F[0] : F[1]; }
    /* ---------- ручний порядок: перетягування за ручку, стрілки з клавіатури, кнопки ↑↓ на телефоні ---------- */
    function saveOrder(ids, focusSel) {
      if (!cfg.onReorder) return;
      cfg.onReorder(mem.tab, ids).then(function (ch) { render(); if (ch) A.toast('Порядок збережено'); var f = focusSel && root.querySelector(focusSel); if (f) f.focus(); }, function (e) { render(); A.saveError(e); });
    }
    function move(id, dir, focusSel) {
      var ids = rows().map(function (r) { return r.id; }), i = ids.indexOf(id), j = i + dir;
      if (i < 0 || j < 0 || j >= ids.length) return;
      ids.splice(i, 1); ids.splice(j, 0, id); saveOrder(ids, focusSel);
    }
    root.onpointerdown = function (e) {
      var hnd = e.target.closest('[data-drag]'); if (!hnd || e.button > 0) return;
      e.preventDefault();
      var id = hnd.getAttribute('data-drag'), tb = root.querySelector('tbody'), row = hnd.closest('tr');
      var trs = Array.prototype.slice.call(tb.querySelectorAll('tr')), from = trs.indexOf(row), to = from, moved = false, y0 = e.clientY;
      row.classList.add('is-dragging'); try { hnd.setPointerCapture(e.pointerId); } catch (x) {}
      var line = document.createElement('div'); line.className = 'drop-line'; tb.closest('.tbl-wrap').appendChild(line); line.hidden = true;
      function onMove(ev) {
        if (Math.abs(ev.clientY - y0) > 4) moved = true; if (!moved) return;
        to = trs.length; for (var k = 0; k < trs.length; k++) { var b = trs[k].getBoundingClientRect(); if (ev.clientY < b.top + b.height / 2) { to = k; break; } }
        var wrapR = tb.closest('.tbl-wrap').getBoundingClientRect(), ref = to < trs.length ? trs[to].getBoundingClientRect().top : trs[trs.length - 1].getBoundingClientRect().bottom;
        line.hidden = false; line.style.top = (ref - wrapR.top + tb.closest('.tbl-wrap').scrollTop - 1) + 'px';
      }
      function onUp() {
        hnd.removeEventListener('pointermove', onMove); hnd.removeEventListener('pointerup', onUp); hnd.removeEventListener('pointercancel', onUp);
        row.classList.remove('is-dragging'); line.remove();
        if (!moved) { hnd.focus(); return; }
        var ids = trs.map(function (r) { return r.getAttribute('data-row'); }), target = to > from ? to - 1 : to;
        if (target === from) return;
        ids.splice(from, 1); ids.splice(target, 0, id); saveOrder(ids, '[data-drag="' + id + '"]');
      }
      hnd.addEventListener('pointermove', onMove); hnd.addEventListener('pointerup', onUp); hnd.addEventListener('pointercancel', onUp);
    };

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
      // записи, які не можна опублікувати (наприклад, партнер без дозволу на логотип)
      var blocked = [];
      if (status === 'pub' && cfg.cannotPublish) ch = ch.filter(function (c) { var why = cfg.cannotPublish(c.id); if (why) blocked.push(why); return !why; });
      if (!ch.length) { if (blocked.length) A.toast('Не опубліковано: ' + blocked.join('; '), true); else A.toast('Нічого не змінено'); st.menuFor = null; render(); return; }
      // як у картці: публікуємо, але попереджаємо про незаповнені обовʼязкові поля
      var warn = status === 'pub' && cfg.missing ? ch.map(function (c) { return cfg.missing(c.id); }).filter(function (x) { return x && x.length; }) : [];
      cfg.onPatch(ch).then(function () {
        st.sel = {}; st.menuFor = null; render();
        var msg = ch.length === 1 && !(ids.length > 1) ? okMsg : okMsg + ': ' + ch.length;
        if (blocked.length) msg += '. Не опубліковано: ' + blocked.join('; ');
        if (warn.length) msg += ch.length === 1 ? '. Для публікації на робочому сайті потрібно заповнити: ' + warn[0].join(', ') : '. Незаповнені обовʼязкові поля є в ' + warn.length + ' з ' + ch.length + '. Перевірте картки';
        A.toast(msg);
      }, A.saveError);
    }

    root.onclick = function (e) {
      var t = e.target.closest('[data-act]'); if (!t || !root.contains(t)) return;
      var act = t.getAttribute('data-act'), id = t.getAttribute('data-id');
      if (act === 'tab') { mem.tab = t.getAttribute('data-key'); st.sel = {}; st.menuFor = null; render(); var tb = root.querySelector('.tab.is-active'); if (tb) tb.focus(); return; }
      if (act === 'move') { move(id, +t.getAttribute('data-dir'), '[data-act="move"][data-id="' + id + '"][data-dir="' + t.getAttribute('data-dir') + '"]'); return; }
      if (act === 'dd') { var k0 = t.getAttribute('data-key'); st.dd = st.dd === k0 ? null : k0; render(); var c0 = root.querySelector('.fdd-panel input'); if (c0 && st.dd) c0.focus(); return; }
      if (act === 'dd-clear') { delete mem.f[t.getAttribute('data-key')]; render(); return; }
      if (act === 'reset') { mem.q = ''; mem.f = {}; if (A.listMemory && cfg.memoryKey) A.listMemory[cfg.memoryKey] = mem; st.dd = null; render(); var q0 = document.getElementById('lst-q'); if (q0) q0.focus(); return; }
      if (act === 'sort') { var k = t.getAttribute('data-key'); st.sort = st.sort && st.sort.key === k ? { key: k, dir: st.sort.dir === 'asc' ? 'desc' : 'asc' } : { key: k, dir: t.getAttribute('data-first') }; render(); }
      else if (act === 'menu') { st.menuFor = st.menuFor === id ? null : id; render(); var f = root.querySelector('.menu .menu-item'); if (f) f.focus(); }
      else if (act === 'close') { st.menuFor = null; render(); }
      else if (act === 'unpub') patch([id], 'draft', 'Знято з публікації');
      else if (act === 'pub') patch([id], 'pub', 'Опубліковано');
      else if (act === 'del') askDelete([id]);
      else if (act === 'del-cancel') { if (!st.busy) { st.confirm = null; render(); } }
      else if (act === 'del-ok') { if (!st.busy) doDelete(); }
      else if (act === 'main') cfg.onPatch([{ id: id, featured: true }]).then(function () { st.menuFor = null; render(); A.toast('Новина тепер головна'); }, A.saveError);
      else if (act === 'bulk-unpub') patch(Object.keys(st.sel), 'draft', 'Знято з публікації');
      else if (act === 'bulk-pub') patch(Object.keys(st.sel), 'pub', 'Опубліковано');
      else if (act === 'bulk-del') askDelete(Object.keys(st.sel));
      else if (act === 'bulk-clear') { st.sel = {}; render(); }
    };
    root.oninput = function (e) { if (e.target.id === 'lst-q') { mem.q = e.target.value; render(); } };
    root.onchange = function (e) {
      if (e.target.dataset && e.target.dataset.fk) {
        var fk = e.target.dataset.fk, cur = (mem.f[fk] || []).slice(), val = e.target.value;
        if (e.target.checked) { if (cur.indexOf(val) < 0) cur.push(val); } else cur = cur.filter(function (x) { return x !== val; });
        if (cur.length) mem.f[fk] = cur; else delete mem.f[fk];
        render(); return;
      }
      var t = e.target.closest('[data-act]'); if (!t) return;
      var act = t.getAttribute('data-act');
      if (act === 'sel') { var id = t.getAttribute('data-id'); if (t.checked) st.sel[id] = true; else delete st.sel[id]; render(); }
      if (act === 'all') { st.sel = {}; if (t.checked) rows().forEach(function (r) { st.sel[r.id] = true; }); render(); }
    };
    // список фільтра закривається кліком поза ним
    function outside(e) {
      if (!document.contains(root)) { document.removeEventListener('mousedown', outside, true); document.removeEventListener('touchstart', outside, true); return; }
      if (st.dd && !(e.target.closest && e.target.closest('[data-dd="' + st.dd + '"]'))) { st.dd = null; render(); }
    }
    document.addEventListener('mousedown', outside, true);
    document.addEventListener('touchstart', outside, true);
    root.onkeydown = function (e) {
      var dh = e.target.closest && e.target.closest('[data-drag]');
      if (dh && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); var did = dh.getAttribute('data-drag'); move(did, e.key === 'ArrowUp' ? -1 : 1, '[data-drag="' + did + '"]'); return; }
      if (e.key === 'Escape' && st.dd) { var k1 = st.dd; st.dd = null; render(); var b1 = root.querySelector('[data-act="dd"][data-key="' + k1 + '"]'); if (b1) b1.focus(); return; }
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
