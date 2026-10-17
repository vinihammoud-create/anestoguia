#!/usr/bin/env node
// A4 — verificação estática do AnestoGuia. Uso: node tools/check.js  (sai com código 1 se houver erro)
const fs = require('fs'), path = require('path'), cp = require('child_process');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const errors = [], warns = [];
const err = m => errors.push(m), warn = m => warns.push(m);

// ── arquivos ──
const index = read('index.html');
const modFiles = fs.readdirSync(path.join(root, 'modulos')).filter(f => f.endsWith('.html')).sort();
const modules = Object.fromEntries(modFiles.map(f => [f.replace('.html', ''), read('modulos/' + f)]));
const jsFiles = fs.readdirSync(path.join(root, 'js')).filter(f => f.endsWith('.js')).map(f => 'js/' + f);
const inlineJs = [...index.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
const js = jsFiles.map(read).join('\n') + '\n' + inlineJs;
const allHtml = index + '\n' + Object.values(modules).join('\n');

// ── sintaxe JS ──
for (const f of [...jsFiles, 'sw.js']) {
  const r = cp.spawnSync(process.execPath, ['--check', path.join(root, f)], { encoding: 'utf8' });
  if (r.status !== 0) err(`sintaxe JS em ${f}: ${r.stderr.split('\n').slice(0, 3).join(' ')}`);
}
// ── lista de módulos no router ──
const routerMods = (js.match(/var MODULOS = \[([^\]]*)\]/) || [, ''])[1].match(/'([^']+)'/g).map(s => s.replace(/'/g, ''));
for (const m of routerMods) if (!modules[m]) err(`router lista módulo sem arquivo: ${m}`);
for (const m of Object.keys(modules)) if (!routerMods.includes(m)) err(`módulo sem entrada no router: ${m}`);
for (const [m, html] of Object.entries(modules)) if (!html.startsWith(`<div class="screen" id="screen-${m}">`) && !html.startsWith(`<div id="screen-${m}" class="screen">`)) err(`modulos/${m}.html não começa com <div class="screen" id="screen-${m}">`);

// ── ids duplicados (index + cada módulo, e entre arquivos) ──
const idOwner = {};
function scanIds(name, html) {
  const seen = {};
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) {
    const id = m[1];
    if (seen[id]) err(`id duplicado em ${name}: ${id}`);
    seen[id] = 1;
    if (idOwner[id] && idOwner[id] !== name) err(`id "${id}" existe em ${idOwner[id]} e ${name}`);
    idOwner[id] = name;
  }
}
scanIds('index.html', index);
for (const [m, html] of Object.entries(modules)) scanIds('modulos/' + m + '.html', html);

// ── handlers inline → função existe? ──
const defs = new Set([...js.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]));
[...js.matchAll(/(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function|\(|\w+\s*=>)/g)].forEach(m => defs.add(m[1]));
const builtin = new Set(['if', 'for', 'while', 'switch', 'return', 'alert', 'parseFloat', 'parseInt', 'Number', 'String', 'Math', 'confirm', 'setTimeout', 'document', 'window', 'event', 'console', 'stopPropagation', 'preventDefault', 'querySelector', 'void', 'function', 'getElementById', 'classList', 'toggle', 'add', 'remove', 'focus', 'blur', 'scrollIntoView', 'open', 'print', 'encodeURIComponent', 'location', 'reload', 'navigator', 'clipboard', 'writeText', 'then', 'catch']);
const calls = {};
for (const m of allHtml.matchAll(/\son(?:click|input|change|keyup|keydown|submit|focus|blur)="([^"]*)"/g))
  for (const c of m[1].matchAll(/(?<![\w.$])([A-Za-z_$][\w$]*)\s*\(/g)) if (!builtin.has(c[1])) calls[c[1]] = (calls[c[1]] || 0) + 1;
for (const [fn, n] of Object.entries(calls)) if (!defs.has(fn)) err(`handler chama função inexistente: ${fn}() (${n}×)`);

// ── getElementById / querySelector('#id') órfãos ──
const ids = new Set(Object.keys(idOwner));
const dynamicOk = new Set(['tr-tela-home', 'tr-tela-questao', 'tr-tela-resultado']);
for (const m of js.matchAll(/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)) if (!ids.has(m[1]) && !dynamicOk.has(m[1])) warn(`getElementById('${m[1]}') não existe no HTML`);
for (const m of js.matchAll(/querySelector(?:All)?\(\s*['"]#([A-Za-z0-9_-]+)/g)) if (!ids.has(m[1])) warn(`querySelector('#${m[1]}') não existe no HTML`);

// ── imagens ──
for (const m of allHtml.matchAll(/<img[^>]*src="([^"]+)"/g)) if (!/^(https?:|data:)/.test(m[1]) && !fs.existsSync(path.join(root, m[1]))) err(`imagem não encontrada: ${m[1]}`);

// ── lixo / inconsistências ──
for (const bad of ['perplexity', 'pplx', 'lorem ipsum', 'undefined</', 'TODO:', 'FIXME']) if (allHtml.toLowerCase().includes(bad.toLowerCase())) err(`texto proibido no HTML: "${bad}"`);
if ((allHtml.match(/IBM Plex/g) || []).length) warn(`${(allHtml.match(/IBM Plex/g) || []).length} referências a 'IBM Plex' (fonte não carregada)`);

// ── banco de questões ──
let temas;
try { temas = JSON.parse(read('data/questoes.json')); } catch (e) { err('data/questoes.json inválido: ' + e.message); }
if (temas) {
  const dist = {}, ids = new Set(); let n = 0;
  for (const t of temas) {
    for (const k of ['id', 'titulo', 'cor', 'icone', 'questoes']) if (!(k in t)) err(`tema sem campo ${k}: ${t.id}`);
    for (const q of t.questoes) {
      n++;
      if (ids.has(q.id)) err(`questão com id duplicado: ${q.id}`); ids.add(q.id);
      const alts = Object.keys(q.alternativas || {}).sort().join('');
      if (alts !== 'ABCD') err(`${q.id}: alternativas ${alts} (esperado ABCD)`);
      if (!['A', 'B', 'C', 'D'].includes(q.resposta)) err(`${q.id}: gabarito inválido "${q.resposta}"`);
      if (!q.justificativa || q.justificativa.length < 80) err(`${q.id}: justificativa ausente ou curta`);
      if (!q.enunciado || q.enunciado.length < 30) err(`${q.id}: enunciado curto`);
      for (const k of ['resposta_correta', 'explicacao']) if (k in q) err(`${q.id}: campo legado ${k}`);
      dist[q.resposta] = (dist[q.resposta] || 0) + 1;
    }
  }
  const maxShare = Math.max(...Object.values(dist)) / n;
  if (maxShare > 0.35) warn(`distribuição de gabarito enviesada: ${JSON.stringify(dist)} (${n} questões)`);
  console.log(`questões: ${n} em ${temas.length} temas · gabaritos ${JSON.stringify(dist)}`);
}

// ── manifest / sw ──
try { const mf = JSON.parse(read('manifest.json')); for (const i of mf.icons) if (!fs.existsSync(path.join(root, i.src))) err('ícone do manifest não existe: ' + i.src); } catch (e) { err('manifest.json inválido'); }
const sw = read('sw.js');
for (const m of sw.matchAll(/'\.\/([^']+)'/g)) if (m[1] && !fs.existsSync(path.join(root, m[1]))) err('sw.js pré-cache aponta para arquivo inexistente: ' + m[1]);
if (!index.includes("serviceWorker.register")) err('index.html não registra o service worker');

// ── relatório ──
console.log(`index.html ${(index.length / 1024).toFixed(0)} KB · ${modFiles.length} módulos · ${jsFiles.length} arquivos JS`);
warns.forEach(w => console.log('AVISO  ' + w));
errors.forEach(e => console.log('ERRO   ' + e));
console.log(errors.length ? `✖ ${errors.length} erro(s), ${warns.length} aviso(s)` : `✔ sem erros (${warns.length} aviso(s))`);
process.exit(errors.length ? 1 : 0);
