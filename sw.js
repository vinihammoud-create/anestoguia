/* AnestoGuia — Service Worker
   • HTML/JSON/JS/CSS: network-first (atualiza sempre que houver rede; cache como fallback offline)
   • imagens/fontes: cache-first
   A versão abaixo é trocada pelo tools/bump-sw.js a cada publicação. */
const VERSION = '3.1.0-202610180307';
const CACHE = 'anestoguia-' + VERSION;
const PRECACHE = ['./', './index.html', './manifest.json', './css/app.css', './js/store.js', './js/calc.js', './js/app.js', './js/router.js', './js/treino.js', './fonts/inter-latin.woff2', './fonts/jetbrains-mono-latin.woff2', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const dest = req.destination;
  if (dest === 'image' || dest === 'font') {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })));
    return;
  }
  e.respondWith(
    fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
