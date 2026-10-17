// Gera icon-512.png, icon-192.png e icon-maskable-512.png com Edge headless (precisa do tools/serve.js rodando).
const http = require('http'), cp = require('child_process'), fs = require('fs');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
const BASE = process.env.BASE || 'http://localhost:8080/', PORT = 9334;
const putJson = url => new Promise((ok, no) => { const r = http.request(url, { method: 'PUT' }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => ok(JSON.parse(d))); }); r.on('error', no); r.end(); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const prof = require('os').tmpdir() + '/ag-icons-' + Date.now();
  const edge = cp.spawn(EDGE, ['--headless=new', '--disable-gpu', '--remote-debugging-port=' + PORT, '--user-data-dir=' + prof, '--no-first-run', '--window-size=600,600', 'about:blank'], { stdio: 'ignore' });
  let target; for (let i = 0; i < 40 && !target; i++) { await sleep(250); try { target = await putJson('http://127.0.0.1:' + PORT + '/json/new?about:blank'); } catch (e) {} }
  const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {}; ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  async function shot(variant, size, file) {
    await send('Emulation.setDeviceMetricsOverride', { width: 512, height: 512, deviceScaleFactor: size / 512, mobile: false });
    await send('Page.navigate', { url: BASE + 'tools/icon.html?v=' + variant }); await sleep(900);
    await send('Runtime.evaluate', { expression: `document.getElementById('icon').className='ic ${variant}'; document.fonts.ready.then(()=>1)` }); await sleep(500);
    const r = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 512, height: 512, scale: size / 512 }, captureBeyondViewport: true });
    fs.writeFileSync(file, Buffer.from(r.result.data, 'base64')); console.log(file, fs.statSync(file).size, 'bytes');
  }
  await send('Page.enable');
  await shot('round', 512, 'icon-512.png');
  await shot('round', 192, 'icon-192.png');
  await shot('mask', 512, 'icon-maskable-512.png');
  ws.close(); edge.kill(); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {}
})();
