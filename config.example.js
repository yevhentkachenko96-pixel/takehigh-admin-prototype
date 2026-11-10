/* Шаблон налаштувань. Для запуску на своєму компʼютері скопіюйте у config.js і впишіть значення.
   config.js є в .gitignore і не потрапляє в репозиторій. На GitHub Pages config.js створюється
   автоматично з секретів репозиторію (див. README і .github/workflows/pages.yml).
   Якщо ключів Dropbox немає, прототип зберігає дані лише в цьому браузері. */
window.TH_CONFIG = {
  dropbox: {
    appKey: 'test',
    appSecret: 'test',
    refreshToken: 'test',
    dataPath: '/take-high-data.json',
    imageDir: '/img'
  },
  // адреса веб-застосунку Google Apps Script для звернень (docs/forms-setup.md); порожньо — без таблиці
  sheetsUrl: '',
  admin: {
    user: 'admin',
    // SHA-256 від пароля. Отримати: echo -n 'ваш-пароль' | sha256sum
    passSha256: ''
  }
};
