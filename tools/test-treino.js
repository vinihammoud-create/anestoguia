// Teste funcional do Treino no navegador (Edge headless via CDP). Uso: node tools/serve.js & node tools/test-treino.js
// Cobre: abrir tema por rota, resposta certa/errada, repetição espaçada, simulado, exportar/importar e link para o módulo.
const http = require('http'), cp = require('child_process'), fs = require('fs');
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find(fs.existsSync);
const BASE = process.env.BASE || 'http://localhost:8080/', PORT = 9337;
const putJson = url => new Promise((ok, no) => { const r = http.request(url, { method: 'PUT' }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => ok(JSON.parse(d))); }); r.on('error', no); r.end(); });
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const prof = require('os').tmpdir() + '/ag-treino-' + Date.now();
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
  const ev = async (expr, aw) => { const r = (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: !!aw })).result; if (r.exceptionDetails) erros.push('EVAL: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text).split('\n')[0]); return r.result?.value; };
  await send('Runtime.enable'); await send('Page.enable');
  let falhas = 0;
  const ok = (cond, msg) => { if (!cond) falhas++; console.log((cond ? '✔ ' : '✖ ') + msg); };

  await send('Page.navigate', { url: BASE + '#/t' }); await sleep(1500);
  await ev("localStorage.clear()"); await send('Page.navigate', { url: BASE + '#/t' }); await sleep(600); await send('Page.reload'); await sleep(2000);
  const cards = await ev("document.querySelectorAll('#tr-temas-grid .tr-tema-card').length");
  ok(cards >= 28, 'home do Treino lista simulado, aleatório e todos os temas (' + cards + ' cartões)');
  const nTemas = await ev('TR_TEMAS.length'), nQ = await ev('tr_todas().length');
  console.log('  banco: ' + nQ + ' questões em ' + nTemas + ' temas');
  ok(nQ >= 1000, 'banco com 1000 questões ou mais');

  // rota direta para um tema
  await send('Page.navigate', { url: BASE + '#/t/farma' }); await sleep(600); await send('Page.reload'); await sleep(2500);
  ok(await ev("document.getElementById('tr-tela-questao').classList.contains('tr-ativa') && document.getElementById('tr-enunciado').textContent.length > 30"), 'rota #/t/farma abre a primeira questão do tema');

  // resposta errada entra na revisão; certa não
  await ev("(function(){var q=tr_questoes[0];tr_responder(q.resposta==='A'?'B':'A');})()");
  ok(await ev("Object.keys(tr_stats().rev).length === 1 && tr_stats().rev[tr_questoes[0].id].box === 0"), 'erro vai para a caixa 0 da revisão espaçada');
  ok(await ev("!!document.querySelector('#tr-justificativa .tr-modulo-btn')"), 'justificativa traz o atalho para o módulo');
  await ev("tr_proxima()"); await ev("tr_responder(tr_questoes[1].resposta)");
  ok(await ev("Object.keys(tr_stats().rev).length === 1"), 'acerto fora da revisão não cria pendência');

  // revisão: acerto avança a caixa e agenda
  await ev("tr_voltarHome(); tr_iniciarErros()");
  ok(await ev("tr_temaAtual.id === 'erros' && tr_questoes.length === 1"), 'revisão de erros abre as questões vencidas');
  await ev("tr_responder(tr_questoes[0].resposta)");
  const rev = await ev("JSON.stringify(tr_stats().rev[tr_questoes[0].id])");
  ok(/"box":1/.test(rev) && JSON.parse(rev).due > Date.now() + 80000000, 'acerto na revisão sobe para a caixa 1 e agenda para ~1 dia depois (' + rev + ')');
  await ev("tr_voltarHome()");
  ok(/agendadas|nenhuma vence/.test(await ev("document.getElementById('tr-temas-grid').textContent")), 'home mostra revisão agendada');

  // simulado
  await ev("tr_iniciarSimulado(40)");
  ok(await ev("tr_sim.ids.length === 40 && new Set(tr_sim.ids).size === 40"), 'simulado monta 40 questões sem repetição');
  const temasSim = await ev("new Set(tr_sim.ids.map(function(i){return TR_POR_ID[i]._tema})).size");
  ok(temasSim >= 20, 'simulado mistura os temas (' + temasSim + ' temas)');
  await ev("for (var i=0;i<30;i++){tr_sim.idx=i;tr_simEscolher(TR_POR_ID[tr_sim.ids[i]].resposta);} for (var j=30;j<35;j++){tr_sim.idx=j;tr_simEscolher(TR_POR_ID[tr_sim.ids[j]].resposta==='A'?'B':'A');}");
  ok(await ev("document.getElementById('tr-sim-timer').textContent.length > 3"), 'cronômetro exibido');
  await ev("window.confirm=function(){return true}; tr_simFinalizar(false)");
  const res = await ev("document.getElementById('tr-resultado-wrap').textContent");
  ok(/Simulado TEA/.test(res) && /30 \/ 40|30\s*\/\s*40/.test(res), 'resultado do simulado: 30 de 40 acertos');
  ok(await ev("tr_stats().simulados.length === 1 && tr_stats().simulados[0].acertos === 30"), 'simulado salvo no histórico');
  ok(await ev("document.querySelectorAll('#tr-resultado-wrap .tr-sim-tema').length >= 20"), 'resultado por tema listado');
  ok(await ev("document.querySelectorAll('#tr-resultado-wrap details.tr-erro-item').length === 10"), 'erradas e em branco (10) listadas com justificativa');
  ok(await ev("AG_STORE.get('simAtual', null) === null"), 'simulado em andamento limpo ao finalizar');

  // tempo esgotado
  await ev("tr_iniciarSimulado(40); tr_sim.inicio = Date.now() - tr_sim.limite*1000 - 5000; tr_simSalvar(); tr_simTick()");
  await sleep(300);
  ok(await ev("tr_stats().simulados.length === 2 && tr_stats().simulados[0].acertos === 0"), 'tempo esgotado encerra o simulado e grava resultado');

  // retomar simulado
  await ev("tr_voltarHome(); tr_iniciarSimulado(40); tr_sim.idx = 5; tr_simSalvar(); tr_voltarHome()");
  ok(/Continuar simulado/.test(await ev("document.getElementById('tr-temas-grid').textContent")), 'home oferece continuar simulado em andamento');
  await ev("tr_simRetomar()");
  ok(await ev("tr_sim.idx === 5 && document.getElementById('tr-tela-simulado').classList.contains('tr-ativa')"), 'retomar volta à questão em que parou');
  await ev("tr_simParar(); tr_sim = null; AG_STORE.del('simAtual'); tr_voltarHome()");

  // exportar e importar
  const json = await ev("JSON.stringify({app:'anestoguia',dados:{treinoStats:tr_stats()}})");
  const backup = JSON.parse(json); backup.dados.treinoStats.temas.farma = { feitas: 10, acertos: 9, sessoes: 1, melhor: 90 };
  await ev("AG_STORE.set('treinoStats', {temas:{},erros:{},rev:{},simulados:[]}); tr_renderHome()");
  const imp = await ev(`(function(){window.confirm=function(){return true};var dt=new DataTransfer();dt.items.add(new File([${JSON.stringify(JSON.stringify(backup))}],'b.json',{type:'application/json'}));var inp=document.createElement('input');inp.type='file';inp.files=dt.files;tr_importar(inp);return new Promise(function(r){setTimeout(function(){r(tr_stats().temas.farma&&tr_stats().temas.farma.acertos)},400)})})()`, true);
  ok(imp === 9, 'importar restaura o progresso do arquivo');
  await ev(`(function(){window.confirm=function(){return true};var inp=document.createElement('input');inp.type='file';var dt=new DataTransfer();dt.items.add(new File(['nao e json'],'x.json'));inp.files=dt.files;tr_importar(inp);})()`);
  await sleep(400);
  ok(await ev("tr_stats().temas.farma.acertos === 9"), 'arquivo inválido não altera o progresso');
  ok(await ev("typeof tr_exportar === 'function' && (tr_exportar(), true)"), 'exportar executa sem erro');

  // atalho para o módulo
  await ev("tr_iniciarTema('traumaqueim'); tr_responder(tr_questoes[0].resposta); document.querySelector('#tr-justificativa .tr-modulo-btn').click()");
  await sleep(1500);
  ok(await ev("document.querySelector('.screen.active').id") === 'screen-traumaqueim', 'botão da justificativa abre o módulo certo');

  // atalho do módulo para o treino
  await ev("abrirTreinoTema('neuroanestesia')"); await sleep(1500);
  ok(await ev("tr_temaAtual && tr_temaAtual.id === 'neuroanestesia' && document.querySelector('.screen.active').id === 'screen-treino'"), 'atalho do módulo abre o tema no Treino');

  if (erros.length) { falhas++; console.log('✖ erros de JS:\n  ' + [...new Set(erros)].join('\n  ')); }
  console.log(falhas ? `\n${falhas} falha(s)` : '\ntodos os testes do Treino passaram');
  edge.kill(); process.exit(falhas ? 1 : 0);
})();
