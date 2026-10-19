// Teste de uso offline (Edge headless via CDP). Uso: node tools/serve.js & node tools/test-offline.js
// Instala o service worker, corta a rede e confere se módulos, Treino e Emergência abrem sem conexão.
const http = require('http'), cp = require('child_process'), fs = require('fs');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
const BASE = process.env.BASE || 'http://localhost:8080/', PORT = 9353;
const putJson = url => new Promise((ok, no) => { const r = http.request(url, { method: 'PUT' }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => ok(JSON.parse(d))); }); r.on('error', no); r.end(); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const prof = require('os').tmpdir() + '/ag-off-' + Date.now();
  const edge = cp.spawn(EDGE, ['--headless=new', '--disable-gpu', '--remote-debugging-port=' + PORT, '--user-data-dir=' + prof, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let target; for (let i = 0; i < 40 && !target; i++) { await sleep(250); try { target = await putJson('http://127.0.0.1:' + PORT + '/json/new?about:blank'); } catch (e) {} }
  if (!target) { console.log('não conectou ao navegador'); edge.kill(); process.exit(2); }
  const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {};
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr, aw) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: !!aw })).result?.result?.value;
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  let falhas = 0; const ok = (c, m) => { if (!c) falhas++; console.log((c ? '✔ ' : '✖ ') + m); };
  await send('Page.navigate', { url: BASE }); await sleep(2500);
  let n = 0; for (let i = 0; i < 40 && !n; i++) { n = await ev("caches.keys().then(function(k){return k.length?caches.open(k[0]).then(function(c){return c.keys()}).then(function(r){return r.length}):0})", true); if (!n) await sleep(500); }
  const sw = fs.readFileSync(__dirname + '/../sw.js', 'utf8'), lista = nome => { const i = sw.indexOf('const ' + nome + ' = ['); return sw.slice(i, sw.indexOf('];', i)).match(/'|"/g).length / 2; }, esperado = lista('OFFLINE_EXTRA') + lista('PRECACHE');
  for (let i = 0; i < 40 && n < esperado; i++) { await sleep(500); n = await ev("caches.keys().then(function(k){return caches.open(k[0])}).then(function(c){return c.keys()}).then(function(r){return r.length})", true); }
  ok(n >= esperado, 'cache da instalação completo (' + n + ' de ' + esperado + ' arquivos)');
  await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await send('Page.navigate', { url: BASE + '#/e/farma' }); await sleep(500); await send('Page.reload'); await sleep(2500);
  ok(await ev("document.querySelector('.screen.active') && document.querySelector('.screen.active').textContent.length > 2000"), 'módulo de estudo (farma) abre sem rede');
  await send('Page.navigate', { url: BASE + '#/e/vm/param' }); await sleep(500); await send('Page.reload'); await sleep(2500);
  ok(await ev("caches.match('img/img-cormack-fotos.webp').then(function(r){return !!r})", true) && await ev("caches.match('img/vm_img_volumes.webp').then(function(r){return !!r})", true), 'figuras estão no cache e o módulo abre sem rede');
  await send('Page.navigate', { url: BASE + '#/t/neuroanestesia' }); await sleep(500); await send('Page.reload'); await sleep(2500);
  ok(await ev("document.getElementById('tr-enunciado') && document.getElementById('tr-enunciado').textContent.length > 30"), 'Treino carrega questões sem rede');
  await send('Page.navigate', { url: BASE + '#/p/emerg/pcr' }); await sleep(500); await send('Page.reload'); await sleep(2500);
  ok(await ev("document.getElementById('em-overlay') && document.getElementById('em-overlay').textContent.indexOf('Adrenalina') >= 0"), 'cartão de PCR abre sem rede');
  ws.close(); edge.kill(); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {}
  console.log(falhas ? '\n' + falhas + ' falha(s)' : '\ntudo certo'); process.exit(falhas ? 1 : 0);
})();
