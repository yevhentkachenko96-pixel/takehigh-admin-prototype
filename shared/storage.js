/* TAKE HIGH · прототип. Сховище даних: Dropbox (через API) або локальне (браузер) для тестів.
   Адмінка і сайт підключають цей файл однаково. Ключі беруться з window.TH_CONFIG (файл config.js,
   який створюється при публікації з секретів GitHub і не лежить у репозиторії). */
(function () {
  'use strict';
  var CFG = window.TH_CONFIG || {};
  var DBX = CFG.dropbox || {};
  var real = function (v) { return typeof v === 'string' && v.trim() !== '' && !/^(test|todo|xxx)$/i.test(v.trim()); };
  var MODE = (real(DBX.appKey) && real(DBX.refreshToken)) ? 'dropbox' : 'local';
  var DATA_PATH = DBX.dataPath || '/take-high-data.json';
  var IMG_DIR = DBX.imageDir || '/img';
  var CACHE_KEY = 'th-gh-cache-v1';
  var LOCAL_KEY = 'th-gh-local-v1';
  var POLL_MS = window.TH_POLL_MS || CFG.pollMs || 8000;

  var bc = null;
  try { bc = new BroadcastChannel('th-gh-data'); } catch (e) {}

  function StoreError(code, message, detail) { var e = new Error(message); e.code = code; e.detail = detail; return e; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

  /* ---------- Dropbox ---------- */
  var token = null, tokenExp = 0, tokenWait = null;
  var TOKEN_KEY = 'th-dbx-token';
  try { var tk = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || 'null'); if (tk && tk.k === DBX.appKey && tk.exp > Date.now() + 60000) { token = tk.t; tokenExp = tk.exp; } } catch (e) {}
  function getToken() {
    if (token && Date.now() < tokenExp - 60000) return Promise.resolve(token);
    if (tokenWait) return tokenWait;
    var body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', DBX.refreshToken);
    body.set('client_id', DBX.appKey);
    if (real(DBX.appSecret)) body.set('client_secret', DBX.appSecret);
    tokenWait = fetch('https://api.dropboxapi.com/oauth2/token', { method: 'POST', body: body })
      .then(function (r) {
        if (!r.ok) return r.text().then(function (t) { throw StoreError('auth', 'Dropbox не прийняв ключі доступу', t); });
        return r.json();
      })
      .then(function (j) {
        token = j.access_token; tokenExp = Date.now() + (j.expires_in || 14400) * 1000; tokenWait = null;
        // токен доступу живе ~4 год: зберігаємо на час вкладки, щоб не просити новий при кожному відкритті сторінки
        try { sessionStorage.setItem(TOKEN_KEY, JSON.stringify({ k: DBX.appKey, t: token, exp: tokenExp })); } catch (e) {}
        return token;
      },
            function (e) { tokenWait = null; throw e.code ? e : StoreError('network', 'Немає звʼязку з Dropbox', String(e)); });
    return tokenWait;
  }
  function dbxErr(r, what) {
    return r.text().then(function (t) {
      var j = null; try { j = JSON.parse(t); } catch (e) {}
      var summary = (j && (j.error_summary || '')) || t;
      if (r.status === 409 && /conflict/.test(summary)) throw StoreError('conflict', 'Дані вже змінив хтось інший', summary);
      if (r.status === 409 && /not_found/.test(summary)) throw StoreError('not_found', 'Файл даних ще не створено', summary);
      if (/missing_scope|required scope/i.test(summary)) {
        var sc = (j && j.error && j.error.required_scope) || (summary.match(/required[_ ]scope\W+([a-z.]+)/i) || [])[1] || '';
        throw StoreError('scope', 'У застосунку Dropbox не ввімкнено дозвіл ' + (sc || '(див. консоль)') + '. Увімкніть його на вкладці Permissions і отримайте refresh token заново', summary);
      }
      if (r.status === 401) { token = null; try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) {} throw StoreError('auth', 'Dropbox не прийняв ключі доступу', summary); }
      if (r.status === 429) throw StoreError('rate', 'Забагато запитів до Dropbox, спробуйте за хвилину', summary);
      throw StoreError('dropbox', what + ': помилка Dropbox ' + r.status, summary);
    });
  }
  function rpc(endpoint, args) {
    return getToken().then(function (t) {
      return fetch('https://api.dropboxapi.com/2/' + endpoint, {
        method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: JSON.stringify(args)
      });
    });
  }
  // Заголовок Dropbox-API-Arg має бути ASCII: не-ASCII символи кодуються як \uXXXX
  function argHeader(o) { return JSON.stringify(o).replace(/[\u007f-￿]/g, function (c) { return '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4); }); }

  function dbxLoad() {
    return getToken().then(function (t) {
      return fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Dropbox-API-Arg': argHeader({ path: DATA_PATH }) }
      });
    }).then(function (r) {
      if (!r.ok) return dbxErr(r, 'Завантаження даних');
      var meta = null; try { meta = JSON.parse(r.headers.get('Dropbox-API-Result') || 'null'); } catch (e) {}
      return r.text().then(function (txt) {
        var data; try { data = JSON.parse(txt); } catch (e) { throw StoreError('broken', 'Файл даних у Dropbox пошкоджений', String(e)); }
        if (meta && meta.rev) return { data: data, rev: meta.rev };
        return dbxRev().then(function (rev) { return { data: data, rev: rev }; });
      });
    }).catch(function (e) {
      if (e.code === 'not_found') return { data: null, rev: null };
      throw e.code ? e : StoreError('network', 'Немає звʼязку з Dropbox', String(e));
    });
  }
  function dbxRev() {
    return rpc('files/get_metadata', { path: DATA_PATH }).then(function (r) {
      if (!r.ok) return dbxErr(r, 'Перевірка версії');
      return r.json().then(function (j) { return j.rev || null; });
    }).catch(function (e) { if (e.code === 'not_found') return null; throw e; });
  }
  function dbxSave(data, rev) {
    var mode = rev ? { '.tag': 'update', update: rev } : { '.tag': 'add' };
    return getToken().then(function (t) {
      return fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': argHeader({ path: DATA_PATH, mode: mode, autorename: false, mute: true, strict_conflict: true }) },
        body: JSON.stringify(data)
      });
    }).then(function (r) {
      if (!r.ok) return dbxErr(r, 'Збереження');
      return r.json().then(function (j) { return j.rev; });
    });
  }
  function rawLink(url) {
    // посилання для перегляду → пряме посилання на файл (для <img>)
    return url.replace(/([?&])dl=0/, '$1raw=1');
  }
  function dbxUpload(blob, name, fixed) {
    // fixed: стала назва файлу (для перенесення фото вайрфрейму; повторний запуск перезаписує той самий файл)
    var path = IMG_DIR + '/' + (fixed ? String(name) : Date.now().toString(36) + '-' + String(name || 'photo').toLowerCase().replace(/[^a-z0-9.]+/g, '-').slice(-60));
    return getToken().then(function (t) {
      return fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': argHeader({ path: path, mode: fixed ? { '.tag': 'overwrite' } : { '.tag': 'add' }, autorename: !fixed, mute: true }) },
        body: blob
      });
    }).then(function (r) {
      if (!r.ok) return dbxErr(r, 'Завантаження фото');
      return r.json();
    }).then(function (meta) {
      return rpc('sharing/create_shared_link_with_settings', { path: meta.path_lower })
        .then(function (r) {
          if (r.ok) return r.json().then(function (j) { return rawLink(j.url); });
          return r.text().then(function (t) {
            var j = null; try { j = JSON.parse(t); } catch (e) {}
            var ex = j && j.error && j.error.shared_link_already_exists && j.error.shared_link_already_exists.metadata;
            if (ex && ex.url) return rawLink(ex.url);
            if (/missing_scope|required scope/i.test(t)) throw StoreError('scope', 'У застосунку Dropbox не ввімкнено дозвіл sharing.write. Увімкніть його на вкладці Permissions і отримайте refresh token заново', t);
            throw StoreError('share', 'Фото завантажено, але Dropbox не дав публічне посилання', t);
          });
        });
    });
  }

  /* ---------- звернення з форм: кожне — окремий файл у папці enquiries/, файл даних не чіпаємо ---------- */
  var ENQ_DIR = DBX.enquiriesDir || '/enquiries';
  var ENQ_LOCAL = 'th-gh-enquiries-v1';
  function dbxEnquirySave(rec) {
    var path = ENQ_DIR + '/' + rec.created.replace(/[:.]/g, '-') + '-' + rec.id + '.json';
    return getToken().then(function (t) {
      return fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': argHeader({ path: path, mode: { '.tag': 'add' }, autorename: true, mute: true }) },
        body: JSON.stringify(rec)
      });
    }).then(function (r) { if (!r.ok) return dbxErr(r, 'Збереження звернення'); return rec; });
  }
  function dbxDownload(path) {
    return getToken().then(function (t) {
      return fetch('https://content.dropboxapi.com/2/files/download', { method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Dropbox-API-Arg': argHeader({ path: path }) } });
    }).then(function (r) { if (!r.ok) return dbxErr(r, 'Читання звернення'); return r.json(); });
  }
  // усі файли .json у папці (найновіші за назвою — першими) з вмістом; _path — шлях файлу для оновлення
  function dbxFolderList(dir, limit, what) {
    function page(res, acc) {
      return res.json().then(function (j) {
        acc = acc.concat(j.entries.filter(function (e) { return e['.tag'] === 'file' && /\.json$/.test(e.name); }));
        if (j.has_more) return rpc('files/list_folder/continue', { cursor: j.cursor }).then(function (r2) { return r2.ok ? page(r2, acc) : acc; });
        return acc;
      });
    }
    return rpc('files/list_folder', { path: dir, limit: 2000 }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { if (/not_found/.test(t)) return []; return dbxErr({ status: r.status, text: function () { return Promise.resolve(t); } }, what); });
      return page(r, []);
    }).then(function (files) {
      files.sort(function (a, b) { return a.name < b.name ? 1 : -1; });
      return Promise.all(files.slice(0, limit || 200).map(function (f) { return dbxDownload(f.path_lower).then(function (r) { r._path = f.path_lower; return r; }).catch(function () { return null; }); }));
    }).then(function (L) { return L.filter(Boolean); });
  }
  function dbxEnquiryList(limit) { return dbxFolderList(ENQ_DIR, limit, 'Список звернень'); }
  // оновлення звернення (статус, відповідальний…): перезаписуємо той самий файл
  function dbxEnquiryUpdate(rec) {
    var path = rec._path, body = Object.assign({}, rec); delete body._path;
    return getToken().then(function (t) {
      return fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': argHeader({ path: path, mode: { '.tag': 'overwrite' }, autorename: false, mute: true }) },
        body: JSON.stringify(body)
      });
    }).then(function (r) { if (!r.ok) return dbxErr(r, 'Збереження звернення'); return rec; });
  }
  /* ---------- підписки «Follow the updates»: файл на кожен email, назва — хеш адреси, тож дубль не створюється ---------- */
  var SUB_DIR = DBX.subscribersDir || '/subscribers';
  var SUB_LOCAL = 'th-gh-subscribers-v1';
  function emailKey(email) {
    var e = String(email || '').trim().toLowerCase();
    if (window.crypto && crypto.subtle && window.TextEncoder) return crypto.subtle.digest('SHA-256', new TextEncoder().encode(e)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('').slice(0, 32);
    });
    return Promise.resolve(e.replace(/[^a-z0-9]/g, '_'));
  }
  function dbxSubscriberSave(rec) {
    return emailKey(rec.email).then(function (k) {
      return getToken().then(function (t) {
        return fetch('https://content.dropboxapi.com/2/files/upload', {
          method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/octet-stream',
            'Dropbox-API-Arg': argHeader({ path: SUB_DIR + '/' + k + '.json', mode: { '.tag': 'add' }, autorename: false, mute: true }) },
          body: JSON.stringify(rec)
        });
      });
    }).then(function (r) {
      if (r.status === 409) return r.text().then(function (t) { if (/conflict/.test(t)) throw StoreError('exists', 'Ця адреса вже підписана', t); throw StoreError('server', 'Підписку не збережено', t); });
      if (!r.ok) return dbxErr(r, 'Збереження підписки');
      return rec;
    });
  }
  function dbxDelete(path) {
    return rpc('files/delete_v2', { path: path }).then(function (r) { if (!r.ok) return dbxErr(r, 'Видалення'); return true; });
  }
  function localSubs() { try { return JSON.parse(lsGet(SUB_LOCAL) || '[]'); } catch (e) { return []; } }
  function localEnquiries() { try { return JSON.parse(lsGet(ENQ_LOCAL) || '[]'); } catch (e) { return []; } }

  /* ---------- локальне сховище (тести і запуск без ключів) ---------- */
  function localRead() { var raw = lsGet(LOCAL_KEY); if (!raw) return { data: null, rev: null }; try { var p = JSON.parse(raw); return { data: p.data, rev: String(p.rev) }; } catch (e) { return { data: null, rev: null }; } }
  function localLoad() { return Promise.resolve(localRead()); }
  function localSave(data, rev) {
    var cur = localRead();
    if ((cur.rev || null) !== (rev || null)) return Promise.reject(StoreError('conflict', 'Дані вже змінив хтось інший', 'local rev ' + cur.rev + ' != ' + rev));
    var next = String((parseInt(cur.rev || '0', 10) || 0) + 1);
    if (!lsSet(LOCAL_KEY, JSON.stringify({ rev: next, data: data }))) return Promise.reject(StoreError('quota', 'Браузеру не вистачає місця для даних (забагато фото)', ''));
    return Promise.resolve(next);
  }
  function localUpload(blob) {
    return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.onerror = function () { rej(StoreError('read', 'Не вдалося прочитати файл', '')); }; fr.readAsDataURL(blob); });
  }

  /* ---------- спільний інтерфейс ---------- */
  var listeners = [], lastRev = null, pollTimer = null;
  function notify(data, rev, from) { lastRev = rev; listeners.forEach(function (cb) { try { cb(data, rev, from); } catch (e) { console.error(e); } }); }
  function remember(data) { lsSet(CACHE_KEY, JSON.stringify(data)); }

  // Фото вайрфрейму, перенесені в Dropbox (wf-<ключ>.<ext>), беремо з копій на сайті — це швидше за посилання Dropbox
  function localPhoto(u) {
    if (!u || typeof u !== 'string') return null;
    var m = u.match(/\/wf-([A-Za-z0-9_\-]+)\.(?:jpe?g|png|svg|webp)(?:[?#]|$)/i), P = window.TH_PHOTOS || {};
    return m && P[m[1]] ? m[1] : null;
  }

  var THStorage = {
    localPhoto: localPhoto,
    mode: MODE,
    label: MODE === 'dropbox' ? 'Dropbox' : 'цей браузер (без Dropbox)',
    load: function () {
      return (MODE === 'dropbox' ? dbxLoad() : localLoad()).then(function (res) { lastRev = res.rev; if (res.data) remember(res.data); return res; });
    },
    save: function (data, rev) {
      return (MODE === 'dropbox' ? dbxSave(data, rev) : localSave(data, rev)).then(function (newRev) {
        lastRev = newRev; remember(data);
        if (bc) { try { bc.postMessage({ rev: newRev, data: data }); } catch (e) {} }
        return newRev;
      });
    },
    uploadImage: function (blob, name, fixed) { return MODE === 'dropbox' ? dbxUpload(blob, name, fixed) : localUpload(blob); },
    cached: function () { var raw = lsGet(CACHE_KEY); if (!raw) return null; try { return JSON.parse(raw); } catch (e) { return null; } },
    // Сповіщає про нові дані: миттєво з інших вкладок цього браузера і раз на кілька секунд з Dropbox
    watch: function (cb) {
      listeners.push(cb);
      if (bc && !bc.onmessage) bc.onmessage = function (e) { if (e.data && e.data.rev !== lastRev) { remember(e.data.data); notify(e.data.data, e.data.rev, 'tab'); } };
      if (!pollTimer) {
        pollTimer = setInterval(function () {
          if (document.hidden) return;
          var check = MODE === 'dropbox' ? dbxRev() : Promise.resolve(localRead().rev);
          check.then(function (rev) {
            if (!rev || rev === lastRev) return;
            THStorage.load().then(function (res) { if (res.data) notify(res.data, res.rev, 'poll'); });
          }).catch(function () {});
        }, POLL_MS);
      }
    },
    rev: function () { return lastRev; },
    saveEnquiry: function (rec) {
      if (MODE === 'dropbox') return dbxEnquirySave(rec);
      var L = localEnquiries(); L.unshift(rec);
      return lsSet(ENQ_LOCAL, JSON.stringify(L)) ? Promise.resolve(rec) : Promise.reject(StoreError('quota', 'Браузеру не вистачає місця', ''));
    },
    updateEnquiry: function (rec) {
      if (MODE === 'dropbox') return rec._path ? dbxEnquiryUpdate(rec) : Promise.reject(StoreError('not_found', 'Файл звернення не знайдено', ''));
      var L = localEnquiries().map(function (x) { return x.id === rec.id ? rec : x; });
      return lsSet(ENQ_LOCAL, JSON.stringify(L)) ? Promise.resolve(rec) : Promise.reject(StoreError('quota', 'Браузеру не вистачає місця', ''));
    },
    listEnquiries: function (limit) {
      if (MODE === 'dropbox') return dbxEnquiryList(limit);
      return Promise.resolve(localEnquiries().slice(0, limit || 200));
    },
    // підписка: { email, source, created, consent }; якщо адреса вже є — помилка з code 'exists'
    saveSubscriber: function (rec) {
      if (MODE === 'dropbox') return dbxSubscriberSave(rec);
      var L = localSubs(), e = String(rec.email).trim().toLowerCase();
      if (L.some(function (x) { return String(x.email).trim().toLowerCase() === e; })) return Promise.reject(StoreError('exists', 'Ця адреса вже підписана', ''));
      L.unshift(rec);
      return lsSet(SUB_LOCAL, JSON.stringify(L)) ? Promise.resolve(rec) : Promise.reject(StoreError('quota', 'Браузеру не вистачає місця', ''));
    },
    listSubscribers: function (limit) {
      if (MODE === 'dropbox') return dbxFolderList(SUB_DIR, limit || 5000, 'Список підписок');
      return Promise.resolve(localSubs());
    },
    deleteSubscribers: function (recs) {
      if (MODE === 'dropbox') return Promise.all(recs.map(function (r) { return r._path ? dbxDelete(r._path) : true; }));
      var ids = recs.map(function (r) { return r.id; });
      return lsSet(SUB_LOCAL, JSON.stringify(localSubs().filter(function (x) { return ids.indexOf(x.id) < 0; }))) ? Promise.resolve(true) : Promise.reject(StoreError('quota', 'Браузеру не вистачає місця', ''));
    }
  };
  window.THStorage = THStorage;
})();
