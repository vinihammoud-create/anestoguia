/* AnestoGuia — Service Worker
   • HTML/JSON/JS/CSS: network-first (atualiza sempre que houver rede; cache como fallback offline)
   • imagens/fontes: cache-first
   • instalação: baixa também módulos, banco de questões e figuras (lista OFFLINE_EXTRA, regerada pelo tools/bump-sw.js) para funcionar 100% offline
   A versão abaixo é trocada pelo tools/bump-sw.js a cada publicação. */
const VERSION = '3.3.0-202610191732';
const CACHE = 'anestoguia-' + VERSION;
const PRECACHE = ['./', './index.html', './manifest.json', './css/app.css', './js/store.js', './js/calc.js', './js/app.js', './js/router.js', './js/treino.js', './js/plantao.js', './fonts/inter-latin.woff2', './fonts/jetbrains-mono-latin.woff2', './icon-192.png', './icon-512.png'];
const OFFLINE_EXTRA = ["./modulos/analgesia.html","./modulos/anesgeral.html","./modulos/aparelho.html","./modulos/avc.html","./modulos/calc-clinica.html","./modulos/cardiaca.html","./modulos/cirurgias-esp.html","./modulos/crises.html","./modulos/dorcronica.html","./modulos/estatistica.html","./modulos/etica.html","./modulos/farma.html","./modulos/fisiologia.html","./modulos/iot.html","./modulos/monit.html","./modulos/neuroanestesia.html","./modulos/nora.html","./modulos/obstetricia.html","./modulos/ped.html","./modulos/pocus.html","./modulos/preop.html","./modulos/raqui.html","./modulos/srpa.html","./modulos/toracica.html","./modulos/transplantes.html","./modulos/traumaqueim.html","./modulos/vad.html","./modulos/vm.html","./modulos/volemia.html","./data/questoes.json","./img/img-anatomia-cricoidea.webp","./img/img-cormack-classificacao.webp","./img/img-cormack-fotos.webp","./img/img-janelas-eco.webp","./img/img-placa-neuromuscular.webp","./img/img-visao-laringoscopia.webp","./img/vm_img_capnograma.webp","./img/vm_img_modos_vcv_pcv.webp","./img/vm_img_pressoes.webp","./img/vm_img_protetora.webp","./img/vm_img_vili.webp","./img/vm_img_volumes.webp"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE).then(() => Promise.all(OFFLINE_EXTRA.map(u => c.add(u).catch(() => {}))))).then(() => self.skipWaiting()));
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
