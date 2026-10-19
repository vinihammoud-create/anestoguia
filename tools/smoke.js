// Teste de fumaça no navegador (Edge headless via CDP). Uso: node tools/serve.js & node tools/smoke.js
// Abre rotas, coleta erros de JS/rede e verifica que a tela/aba certa ficou ativa.
const http = require('http'), cp = require('child_process'), fs = require('fs');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
const BASE = process.env.BASE || 'http://localhost:8080/';
const PORT = 9333;
const ROTAS = [
  { hash: '', ativo: 'screen-launcher' },
  { hash: '#/p', ativo: 'screen-p-home' },
  { hash: '#/p/plantao/inducao', ativo: 'screen-p-plantao', aba: 'p-inducao' },
  { hash: '#/p/especiais/last', ativo: 'screen-p-especiais', aba: 'e-last' },
  { hash: '#/p/calcavancadas', ativo: 'screen-p-calcavancadas' },
  { hash: '#/e', ativo: 'screen-home' },
  { hash: '#/e/preop/jejum', ativo: 'screen-preop', aba: 'preop-jejum' },
  { hash: '#/e/calc-clinica', ativo: 'screen-calc-clinica' },
  { hash: '#/e/cirurgias-esp', ativo: 'screen-cirurgias-esp' },
  { hash: '#/e/etica', ativo: 'screen-etica' },
  { hash: '#/e/aparelho', ativo: 'screen-aparelho' },
  { hash: '#/t', ativo: 'screen-treino', eval: "document.querySelectorAll('#tr-temas-grid .tr-tema-card').length" },
];
const getJson = url => new Promise((ok, no) => http.get(url, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => ok(JSON.parse(d))); }).on('error', no));
const putJson = url => new Promise((ok, no) => { const r = http.request(url, { method: 'PUT' }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => ok(JSON.parse(d))); }); r.on('error', no); r.end(); });
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const prof = require('os').tmpdir() + '/ag-smoke-' + Date.now();
  const edge = cp.spawn(EDGE, ['--headless=new', '--disable-gpu', '--remote-debugging-port=' + PORT, '--user-data-dir=' + prof, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let target;
  for (let i = 0; i < 40 && !target; i++) { await sleep(250); try { target = await putJson('http://127.0.0.1:' + PORT + '/json/new?about:blank'); } catch (e) {} }
  if (!target) { console.log('não conectou ao navegador'); edge.kill(); process.exit(2); }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {}; const errors = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; }
    if (m.method === 'Runtime.exceptionThrown') errors.push('JS: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push('LOG: ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
    if (m.method === 'Network.loadingFailed') errors.push('NET: ' + m.params.errorText);
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) errors.push('HTTP ' + m.params.response.status + ': ' + m.params.response.url);
  };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJs = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.result?.value;
  await send('Runtime.enable'); await send('Log.enable'); await send('Network.enable'); await send('Page.enable');
  let fails = 0;
  for (const r of ROTAS) {
    errors.length = 0;
    await send('Page.navigate', { url: BASE + r.hash });
    await sleep(1200);
    if (r.hash.startsWith('#/e/') || r.hash === '#/t') await sleep(800);
    const ativo = await evalJs("Array.from(document.querySelectorAll('.screen.active')).map(s=>s.id).join(',')");
    const aba = r.aba ? await evalJs(`(document.getElementById('${r.aba}')||{}).className||''`) : '';
    const extra = r.eval ? await evalJs(r.eval) : '';
    const okTela = ativo === r.ativo, okAba = !r.aba || /\bactive\b/.test(aba), okExtra = !r.eval || Number(extra) > 0;
    const ok = okTela && okAba && okExtra && errors.length === 0;
    if (!ok) fails++;
    console.log((ok ? '✔' : '✖') + ' ' + (r.hash || '/').padEnd(26) + ' ativo=' + ativo + (r.aba ? ' aba=' + (okAba ? 'ok' : 'NÃO') : '') + (r.eval ? ' eval=' + extra : '') + (errors.length ? '\n     ' + [...new Set(errors)].join('\n     ') : ''));
  }
  // voltar do navegador: #/e/preop → #/e
  await send('Page.navigate', { url: BASE + '#/e' }); await sleep(600);
  await evalJs("location.hash='#/e/preop'"); await sleep(1500);
  await evalJs('history.back()'); await sleep(800);
  const back = await evalJs("document.querySelector('.screen.active').id");
  console.log((back === 'screen-home' ? '✔' : '✖') + ' history.back() volta para o menu de Estudos (ativo=' + back + ')');
  if (back !== 'screen-home') fails++;
  // persistência do peso
  await send('Page.navigate', { url: BASE + '#/p/plantao' }); await sleep(800);
  await evalJs("setPesoGlobal('82')");
  await send('Page.navigate', { url: BASE + '#/p/calc' }); await send('Page.reload'); await sleep(1200);
  const peso = await evalJs('pesoGlobal');
  console.log((peso == 82 ? '✔' : '✖') + ' peso persiste após recarregar (' + peso + ')');
  if (peso != 82) fails++;
  ws.close(); edge.kill();
  try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {}
  console.log(fails ? `✖ ${fails} falha(s)` : '✔ smoke OK');
  process.exit(fails ? 1 : 0);
})();
