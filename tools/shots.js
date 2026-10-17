// Capturas de tela (390×844) + checagem de rolagem horizontal. Uso: node tools/serve.js & node tools/shots.js [rota ...]
const http = require('http'), cp = require('child_process'), fs = require('fs');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
const BASE = process.env.BASE || 'http://localhost:8080/', PORT = 9335;
const ROTAS = process.argv.slice(2).length ? process.argv.slice(2) : ['', '#/p', '#/p/plantao/pre', '#/p/calc', '#/p/escalas', '#/e', '#/e/preop/risco', '#/e/farma', '#/e/vm/param', '#/t'];
const putJson = url => new Promise((ok, no) => { const r = http.request(url, { method: 'PUT' }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => ok(JSON.parse(d))); }); r.on('error', no); r.end(); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync('tools/_shots', { recursive: true });
  const prof = require('os').tmpdir() + '/ag-shots-' + Date.now();
  const edge = cp.spawn(EDGE, ['--headless=new', '--disable-gpu', '--remote-debugging-port=' + PORT, '--user-data-dir=' + prof, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let target; for (let i = 0; i < 40 && !target; i++) { await sleep(250); try { target = await putJson('http://127.0.0.1:' + PORT + '/json/new?about:blank'); } catch (e) {} }
  const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {}; ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJs = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.result?.value;
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });
  for (const r of ROTAS) {
    await send('Page.navigate', { url: BASE + r }); await sleep(1500);
    const over = await evalJs('(function(){var w=window.innerWidth,bad=[];document.querySelectorAll(".screen.active *").forEach(function(e){var b=e.getBoundingClientRect();if(b.right>w+1&&getComputedStyle(e).position!="fixed"){var p=e;while(p&&p!==document.body){var o=getComputedStyle(p).overflowX;if(o=="auto"||o=="scroll")return;p=p.parentElement}bad.push((e.tagName+"."+(e.className||"").toString().split(" ")[0]).toLowerCase())}});return {sw:document.documentElement.scrollWidth,w:w,bad:[...new Set(bad)].slice(0,8)}})()');
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const name = 'tools/_shots/' + (r.replace(/[#\/]+/g, '_') || 'home') + '.png';
    fs.writeFileSync(name, Buffer.from(shot.result.data, 'base64'));
    console.log((over.sw > over.w ? '✖ overflow ' : '✔ ') + (r || '/').padEnd(22) + ' scrollWidth=' + over.sw + '/' + over.w + (over.bad.length ? ' ' + over.bad.join(',') : '') + '  → ' + name);
  }
  ws.close(); edge.kill(); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {}
})();
