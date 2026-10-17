// Atualiza a VERSION do sw.js (APP_VERSION + data) para forçar renovação do cache nos clientes.
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const router = fs.readFileSync(path.join(root, 'js/router.js'), 'utf8');
const app = router.match(/APP_VERSION = '([^']+)'/)[1];
const d = new Date(), stamp = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
let sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
sw = sw.replace(/const VERSION = '[^']+'/, "const VERSION = '" + app + '-' + stamp + "'");
fs.writeFileSync(path.join(root, 'sw.js'), sw);
console.log('sw.js VERSION =', app + '-' + stamp);
