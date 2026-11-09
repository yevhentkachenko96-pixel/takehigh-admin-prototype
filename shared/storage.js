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
  var POLL_MS = CFG.pollMs || 8000;

  var bc = null;
  try { bc = new BroadcastChannel('th-gh-data'); } catch (e) {}

  function StoreError(code, message, detail) { var e = new Error(message); e.code = code; e.detail = detail; return e; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }

  /* ---------- Dropbox ---------- */
  var token = null, tokenExp = 0, tokenWait = null;
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
      .then(function (j) { token = j.access_token; tokenExp = Date.now() + (j.expires_in || 14400) * 1000; tokenWait = null; return token; },
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
      if (r.status === 401) { token = null; throw StoreError('auth', 'Dropbox не прийняв ключі доступу', summary); }
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

  var THStorage = {
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
    rev: function () { return lastRev; }
  };
  window.THStorage = THStorage;
})();
