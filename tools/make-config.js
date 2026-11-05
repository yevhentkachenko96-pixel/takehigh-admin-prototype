// Створює config.js із секретів GitHub під час публікації. Пароль адмінки зберігається лише як SHA-256.
const fs = require('fs');
const crypto = require('crypto');
const env = process.env;
const need = ['ADMIN_USER', 'ADMIN_PASSWORD'];
const missing = need.filter((k) => !env[k]);
if (missing.length) {
  console.error('Немає секретів: ' + missing.join(', ') + '. Додайте їх у Settings → Secrets and variables → Actions.');
  process.exit(1);
}
if (!env.DROPBOX_APP_KEY || !env.DROPBOX_REFRESH_TOKEN) {
  console.warn('Увага: немає ключів Dropbox. Прототип зберігатиме дані лише в браузері кожного відвідувача.');
}
const cfg = {
  dropbox: {
    appKey: env.DROPBOX_APP_KEY || '',
    appSecret: env.DROPBOX_APP_SECRET || '',
    refreshToken: env.DROPBOX_REFRESH_TOKEN || '',
    dataPath: env.DROPBOX_DATA_PATH || '/take-high-data.json',
    imageDir: '/img'
  },
  admin: {
    user: env.ADMIN_USER,
    passSha256: crypto.createHash('sha256').update(env.ADMIN_PASSWORD, 'utf8').digest('hex')
  }
};
fs.writeFileSync('config.js', '// Створено автоматично під час публікації. Не редагувати.\nwindow.TH_CONFIG = ' + JSON.stringify(cfg, null, 2) + ';\n');
console.log('config.js створено');
