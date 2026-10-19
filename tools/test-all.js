// Roda todas as verificações antes de publicar. Uso: node tools/test-all.js
// Sobe o servidor local sozinho (porta 8080) quando os testes de navegador precisam dele.
const cp = require('child_process'), fs = require('fs'), path = require('path'), http = require('http');
const root = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rodar = (arq) => cp.spawnSync(process.execPath, [path.join('tools', arq)], { cwd: root, encoding: 'utf8' });
const resultados = [];
function passo(nome, arq, saidaOk) {
  const r = rodar(arq), ok = r.status === 0 && (!saidaOk || saidaOk.test(r.stdout));
  resultados.push([nome, ok]); console.log((ok ? '✔ ' : '✖ ') + nome);
  if (!ok) console.log((r.stdout + r.stderr).split('\n').filter(l => /✖|ERRO|AVISO|Error/.test(l)).slice(0, 12).map(l => '    ' + l).join('\n'));
}
(async () => {
  // sintaxe dos scripts do app
  for (const f of fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js'))) {
    const r = cp.spawnSync(process.execPath, ['--check', path.join('js', f)], { cwd: root, encoding: 'utf8' });
    resultados.push(['sintaxe js/' + f, r.status === 0]); console.log((r.status === 0 ? '✔ ' : '✖ ') + 'sintaxe js/' + f);
    if (r.status !== 0) console.log(r.stderr);
  }
  passo('verificação estática (tools/check.js)', 'check.js', /sem erros/);
  passo('calculadoras (tools/test-calc.js)', 'test-calc.js', /passaram/);
  passo('bomba de infusão (tools/test-infusao.js)', 'test-infusao.js');
  let srv = null;
  const noAr = await new Promise(r => http.get('http://localhost:8080/', res => { res.resume(); r(true); }).on('error', () => r(false)));
  if (!noAr) { srv = cp.spawn(process.execPath, [path.join('tools', 'serve.js')], { cwd: root, stdio: 'ignore' }); await sleep(1500); }
  passo('fumaça no navegador (tools/smoke.js)', 'smoke.js', /smoke OK/);
  passo('Treino (tools/test-treino.js)', 'test-treino.js', /passaram/);
  passo('Plantão (tools/test-plantao.js)', 'test-plantao.js', /passaram/);
  passo('uso offline (tools/test-offline.js)', 'test-offline.js', /tudo certo/);
  if (srv) srv.kill();
  const falhas = resultados.filter(r => !r[1]).length;
  console.log(falhas ? `\n${falhas} verificação(ões) falharam` : '\ntudo certo: pode publicar (node tools/bump-sw.js, commit e push)');
  process.exit(falhas ? 1 : 0);
})();
