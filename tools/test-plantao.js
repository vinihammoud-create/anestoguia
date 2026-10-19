// Teste funcional da tela de Emergência/plantão no navegador (Edge headless via CDP).
// Uso: node tools/serve.js & node tools/test-plantao.js
const http = require('http'), cp = require('child_process'), fs = require('fs');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
const BASE = process.env.BASE || 'http://localhost:8080/', PORT = 9339;
const putJson = url => new Promise((ok, no) => { const r = http.request(url, { method: 'PUT' }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => ok(JSON.parse(d))); }); r.on('error', no); r.end(); });
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const prof = require('os').tmpdir() + '/ag-plantao-' + Date.now();
  const edge = cp.spawn(EDGE, ['--headless=new', '--disable-gpu', '--remote-debugging-port=' + PORT, '--user-data-dir=' + prof, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let target;
  for (let i = 0; i < 40 && !target; i++) { await sleep(250); try { target = await putJson('http://127.0.0.1:' + PORT + '/json/new?about:blank'); } catch (e) {} }
  if (!target) { console.log('não conectou ao navegador'); edge.kill(); process.exit(2); }
  const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {}, erros = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; }
    if (m.method === 'Runtime.exceptionThrown') erros.push('JS: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
  };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async expr => { const r = (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result; if (r.exceptionDetails) erros.push('EVAL: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text).split('\n')[0]); return r.result?.value; };
  await send('Runtime.enable'); await send('Page.enable');
  let falhas = 0;
  const ok = (cond, msg) => { if (!cond) falhas++; console.log((cond ? '✔ ' : '✖ ') + msg); };
  const txt = sel => ev(`(document.querySelector(${JSON.stringify(sel)})||{textContent:''}).textContent`);

  await send('Page.navigate', { url: BASE + '#/p/emerg' }); await sleep(800);
  await ev('localStorage.clear()'); await send('Page.reload'); await sleep(1500);
  ok(await ev("document.querySelector('.screen.active').id") === 'screen-p-emerg', 'rota #/p/emerg abre a tela de emergência');
  ok(await ev("document.querySelectorAll('#em-lista .em-card-btn').length") === 10, 'dez cartões de emergência');
  ok(await ev("document.querySelector('.bottom-nav .nav-emerg').classList.contains('on')"), 'botão URGÊNCIA da barra inferior fica ativo');

  // todos os cartões abrem por rota, com passos e doses
  const ids = await ev("EM_CARTOES.map(function(c){return c.id}).join(',')");
  for (const c of ids.split(',')) {
    await ev(`navigate('p/emerg/${c}')`); await sleep(120);
    const passos = await ev("document.querySelectorAll('#em-overlay .em-passos li').length"), doses = await ev("document.querySelectorAll('#em-overlay .em-dose').length");
    if (!(passos >= 3 && doses >= 2 && await ev("document.getElementById('em-overlay').style.display") === 'block')) { falhas++; console.log('✖ cartão ' + c + ' (passos ' + passos + ', doses ' + doses + ')'); }
  }
  console.log('✔ todos os cartões abrem com passos e doses (' + ids + ')');

  // doses por peso
  await ev("navigate('p/emerg/hm')"); await sleep(150);
  await ev("em_setPeso('70')"); await sleep(100);
  let d = await txt('#em-overlay #em-doses');
  ok(/175 mg = 9 frasco/.test(d), 'HM 70 kg: dantrolene 175 mg = 9 frascos de 20 mg');
  await ev("navigate('p/emerg/last')"); await sleep(150);
  d = await txt('#em-overlay #em-doses');
  ok(/100 mL/.test(d) && /200–250 mL/.test(d), 'LAST ≥ 70 kg: bolus 100 mL e infusão 200–250 mL');
  await ev("em_setPeso('20')"); await sleep(100);
  d = await txt('#em-overlay #em-doses');
  ok(/30 mL/.test(d) && /5 mL\/min/.test(d), 'LAST 20 kg: bolus 30 mL e infusão 5 mL/min');
  await ev("navigate('p/emerg/pcrped')"); await sleep(150);
  d = await txt('#em-overlay #em-doses');
  ok(/0,2 mg = 2 mL/.test(d) && /40 J/.test(d) && /80 J/.test(d), 'PCR pediátrica 20 kg: adrenalina 0,2 mg = 2 mL, choques 40 e 80 J');
  await ev("navigate('p/emerg/anafilaxia')"); await sleep(150);
  ok(/0,2 mg \(0,01 mg\/kg/.test(await txt('#em-overlay #em-doses')), 'anafilaxia 20 kg: adrenalina IM 0,2 mg');
  await ev("em_setPeso('')"); await sleep(100);
  ok(/0,01 mg\/kg \(máx 0,5 mg\)/.test(await txt('#em-overlay #em-doses')), 'sem peso mostra a regra por kg');

  // sair do cartão fecha o overlay
  await ev("navigate('p/emerg/cartoes')"); await sleep(150);
  ok(await ev("document.getElementById('em-overlay').style.display") === 'none' && !(await ev("document.body.classList.contains('em-aberto')")), 'sair do cartão fecha a tela cheia');
  await ev("navigate('p/emerg/hm')"); await sleep(120); await ev("navigate('e')"); await sleep(250);
  ok(await ev("document.getElementById('em-overlay').style.display") === 'none', 'navegar para outra tela fecha o cartão');

  // checklist
  await ev("navigate('p/emerg/checklist')"); await sleep(200);
  await ev("em_toggleCheck('pre',0); em_toggleCheck('pre',3)");
  ok(await ev("document.querySelectorAll('#em-checks .em-check.on').length") === 2, 'checklist marca itens');
  await send('Page.reload'); await sleep(1500);
  ok(await ev("document.querySelectorAll('#em-checks .em-check.on').length") === 2, 'checklist persiste após recarregar');
  await ev("em_limparChecks('pre')");
  ok(await ev("document.querySelectorAll('#em-checks .em-check.on').length") === 0, 'limpar lista');

  // cronômetro de PCR
  await ev("navigate('p/emerg/timers')"); await sleep(300);
  await ev("em_pcrIniciar()"); await sleep(300);
  ok(/0:0\d/.test(await txt('#em-pcr .em-tempo')), 'PCR inicia em 0:0x');
  await ev("var s=em_pcr(); s.t0=Date.now()-130000; AG_STORE.set('emPcr', s); em_pcrRender()");
  ok(/2:1\d|2:0\d/.test(await txt('#em-pcr .em-tempo')) && /ciclo 2/.test(await txt('#em-pcr .em-sub')), 'após ~130 s: tempo 2:1x e ciclo 2');
  await ev("em_pcrEvento('epi'); em_pcrEvento('choque'); em_pcrEvento('choque'); em_pcrEvento('choque')");
  const pcr = await txt('#em-pcr');
  ok(/1 dose/.test(pcr) && /Choque \(3\)/.test(pcr) && /considerar amiodarona/.test(pcr), 'registra adrenalina e 3 choques, e sugere amiodarona');
  await ev("var s=em_pcr(); s.epi=[Date.now()-190000]; s.epiAvisada=1; AG_STORE.set('emPcr', s); em_pcrRender()");
  ok(/pode repetir/.test(await txt('#em-pcr .em-epi')), 'adrenalina há > 3 min: lembrete');
  await ev("s=em_pcr(); s.epi=[Date.now()-310000]; AG_STORE.set('emPcr', s); em_pcrRender()");
  ok(/ATRASADA/.test(await txt('#em-pcr .em-epi')), 'adrenalina há > 5 min: atrasada');
  await send('Page.reload'); await sleep(1500);
  ok(/Choque \(3\)/.test(await txt('#em-pcr')), 'cronômetro de PCR sobrevive ao recarregamento');
  await ev("window.confirm=function(){return true}; em_pcrParar()");
  ok(/INICIAR PCR/.test(await txt('#em-pcr')), 'encerrar o PCR limpa o estado');
  await ev("em_swToggle('po')"); await sleep(1200); await ev("em_swToggle('po')");
  ok(/0:0[1-3]/.test(await txt('#em-sw-po .em-sw-t')), 'cronômetro de apneia conta e para');

  // pediatria
  await ev("pesoGlobal = 0; syncPesoInputs(); navigate('p/emerg/pedi')"); await sleep(200);
  await ev("document.getElementById('em-pedi-anos').value='6'; em_pediRender()");
  const pedi = await txt('#em-pedi-out');
  ok(/25 kg \(estimado/.test(pedi) && /5,5 mm/.test(pedi) && /5 mm/.test(pedi) && /Macintosh 3/.test(pedi), 'pediatria 6 anos: peso estimado 25 kg, tubo 5,5 sem cuff, lâmina Macintosh 3');
  await ev("document.getElementById('em-pedi-peso').value='20'; em_pediRender()");
  ok(/60 mL\/h/.test(await txt('#em-pedi-out')) && /6 mg = 1,2 mL/.test(await txt('#em-pedi-out')), 'pediatria 20 kg: manutenção 60 mL/h (4-2-1) e raqui 0,3 mg/kg');

  // favoritos
  await ev("navigate('e/preop')"); await sleep(1500);
  ok(await ev("!!document.querySelector('#screen-preop .fav-btn')"), 'tela de módulo ganha o botão de favorito');
  await ev("favToggle()");
  ok(await ev("fav_lista().length === 1 && fav_lista()[0].h === '#/e/preop'"), 'favoritar guarda a rota');
  await ev("navigate('')"); await sleep(300);
  ok(/Avalia|Pré|PRÉ|preop/i.test(await txt('#fav-launcher')) && await ev("document.getElementById('fav-launcher').style.display") === 'block', 'favorito aparece no início');
  await ev("navigate('e/preop')"); await sleep(600); await ev("favToggle()");
  ok(await ev("fav_lista().length === 0"), 'desfavoritar remove');

  if (erros.length) { falhas++; console.log('✖ erros de JS:\n  ' + [...new Set(erros)].join('\n  ')); }
  console.log(falhas ? `\n${falhas} falha(s)` : '\ntodos os testes do Plantão passaram');
  edge.kill(); process.exit(falhas ? 1 : 0);
})();
