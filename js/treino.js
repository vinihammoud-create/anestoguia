/* ══════════════════════════════════════════════════════════════
   TREINO TEA/TSA — banco carregado sob demanda de data/questoes.json
   ══════════════════════════════════════════════════════════════ */
var TR_TEMAS = null;
var tr_temaAtual = null, tr_questoes = [], tr_indiceAtual = 0, tr_acertos = 0, tr_erros = [], tr_respondida = false;
var TR_ALEATORIO_N = 40;

function tr_carregar() {
  if (TR_TEMAS) return Promise.resolve(TR_TEMAS);
  return fetch('data/questoes.json').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (d) { TR_TEMAS = d; return d; });
}

function tr_embaralhar(arr) {
  for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  return arr;
}
function tr_hexToRgb(hex) { return parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16); }
function tr_esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

function tr_mostrarTela(id) {
  var telas = document.querySelectorAll('#screen-treino .tr-tela');
  for (var i = 0; i < telas.length; i++) telas[i].classList.remove('tr-ativa');
  document.getElementById(id).classList.add('tr-ativa');
  window.scrollTo(0, 0);
}
function tr_voltarHome() { tr_mostrarTela('tr-tela-home'); tr_renderHome(); }
function showTreinoHome() {
  var grid = document.getElementById('tr-temas-grid');
  if (!TR_TEMAS) grid.innerHTML = '<div class="tr-loading">Carregando banco de questões…</div>';
  tr_carregar().then(function () { tr_mostrarTela('tr-tela-home'); tr_renderHome(); })
    .catch(function () { grid.innerHTML = '<div class="tr-loading">Não foi possível carregar as questões. Verifique a conexão e tente de novo.</div>'; });
}

/* ── estatísticas persistentes ── */
function tr_stats() { return AG_STORE.get('treinoStats', { temas: {}, erros: {} }); }
function tr_salvarResultado(temaId, acertos, total, erros) {
  var st = tr_stats();
  var t = st.temas[temaId] || { feitas: 0, acertos: 0, sessoes: 0, melhor: 0 };
  t.feitas += total; t.acertos += acertos; t.sessoes++; t.melhor = Math.max(t.melhor, Math.round(acertos / total * 100));
  st.temas[temaId] = t;
  erros.forEach(function (e) { st.erros[e.questao.id] = (st.erros[e.questao.id] || 0) + 1; });
  AG_STORE.set('treinoStats', st);
}

function tr_renderHome() {
  var grid = document.getElementById('tr-temas-grid');
  if (!TR_TEMAS) return;
  var st = tr_stats(), total = 0;
  TR_TEMAS.forEach(function (t) { total += t.questoes.length; });
  var sub = document.querySelector('#screen-treino .tr-home-subtitle');
  if (sub) sub.textContent = total + ' questões comentadas · ' + TR_TEMAS.length + ' temas';
  var nErros = Object.keys(st.erros).length;
  var html = '<div class="tr-tema-card tr-aleatorio" onclick="tr_iniciarAleatorio()">' +
    '<div class="tr-tema-icon" style="background:rgba(56,182,224,.12)">🎲</div>' +
    '<div class="tr-tema-info"><div class="tr-tema-titulo">Modo Aleatório</div>' +
    '<div class="tr-tema-count">' + TR_ALEATORIO_N + ' questões de todos os temas</div></div><div class="tr-tema-arrow">›</div></div>';
  if (nErros) {
    html += '<div class="tr-tema-card tr-aleatorio" onclick="tr_iniciarErros()">' +
      '<div class="tr-tema-icon" style="background:rgba(255,71,87,.12)">🔁</div>' +
      '<div class="tr-tema-info"><div class="tr-tema-titulo">Revisar erros</div>' +
      '<div class="tr-tema-count">' + nErros + (nErros > 1 ? ' questões que você errou' : ' questão que você errou') + '</div></div><div class="tr-tema-arrow">›</div></div>';
  }
  for (var i = 0; i < TR_TEMAS.length; i++) {
    var t = TR_TEMAS[i], rgb = tr_hexToRgb(t.cor), s = st.temas[t.id];
    var extra = s ? ' · melhor ' + s.melhor + '%' : '';
    html += '<div class="tr-tema-card" style="background:linear-gradient(135deg, rgba(' + rgb + ',.14), rgba(' + rgb + ',.04)); border-color:rgba(' + rgb + ',.18);" onclick="tr_iniciarTema(\'' + t.id + '\')">' +
      '<div class="tr-tema-icon" style="background:rgba(' + rgb + ',.15)">' + t.icone + '</div>' +
      '<div class="tr-tema-info"><div class="tr-tema-titulo">' + tr_esc(t.titulo) + '</div>' +
      '<div class="tr-tema-count">' + t.questoes.length + ' questões' + extra + '</div></div><div class="tr-tema-arrow">›</div></div>';
  }
  grid.innerHTML = html;
}

function tr_iniciarLista(tema, lista) {
  tr_temaAtual = tema; tr_questoes = lista; tr_indiceAtual = 0; tr_acertos = 0; tr_erros = [];
  tr_mostrarQuestao();
}
function tr_iniciarTema(temaId) {
  var tema = TR_TEMAS.filter(function (t) { return t.id === temaId; })[0];
  if (!tema) return;
  tr_iniciarLista(tema, tr_embaralhar(tema.questoes.slice()));
}
function tr_todas() { var all = []; TR_TEMAS.forEach(function (t) { all = all.concat(t.questoes); }); return all; }
function tr_iniciarAleatorio() {
  tr_iniciarLista({ titulo: 'Modo Aleatório', id: 'aleatorio', cor: '#38B6E0', icone: '🎲' }, tr_embaralhar(tr_todas()).slice(0, TR_ALEATORIO_N));
}
function tr_iniciarErros() {
  var ids = tr_stats().erros;
  var lista = tr_todas().filter(function (q) { return ids[q.id]; });
  if (!lista.length) return;
  tr_iniciarLista({ titulo: 'Revisão de erros', id: 'erros', cor: '#FF4757', icone: '🔁' }, tr_embaralhar(lista));
}

function tr_mostrarQuestao() {
  tr_respondida = false;
  tr_mostrarTela('tr-tela-questao');
  var q = tr_questoes[tr_indiceAtual], total = tr_questoes.length;
  document.getElementById('tr-questao-header-tema').textContent = tr_temaAtual.titulo;
  document.getElementById('tr-questao-header-sub').textContent = 'Questão ' + (tr_indiceAtual + 1) + ' de ' + total;
  document.getElementById('tr-questao-num').textContent = 'Questão ' + (tr_indiceAtual + 1) + ' / ' + total + (q.subtopico ? ' · ' + q.subtopico : '');
  document.getElementById('tr-questao-acertos').textContent = '✓ ' + tr_acertos + ' acerto' + (tr_acertos !== 1 ? 's' : '');
  document.getElementById('tr-progress-fill').style.width = ((tr_indiceAtual / total) * 100) + '%';
  document.getElementById('tr-enunciado').textContent = q.enunciado;
  var html = '';
  ['A', 'B', 'C', 'D'].forEach(function (L) {
    if (!q.alternativas[L]) return;
    html += '<button class="tr-alt-btn" data-letra="' + L + '" onclick="tr_responder(\'' + L + '\')">' +
      '<span class="tr-alt-letra">' + L + '</span><span class="tr-alt-texto">' + tr_esc(q.alternativas[L]) + '</span></button>';
  });
  document.getElementById('tr-alternativas').innerHTML = html;
  var j = document.getElementById('tr-justificativa'); j.style.display = 'none'; j.innerHTML = '';
  document.getElementById('tr-btn-proxima').style.display = 'none';
}

function tr_responder(letra) {
  if (tr_respondida) return;
  tr_respondida = true;
  var q = tr_questoes[tr_indiceAtual], correta = q.resposta;
  document.querySelectorAll('#screen-treino .tr-alt-btn').forEach(function (b) {
    b.disabled = true;
    if (b.dataset.letra === correta) b.classList.add('tr-correta');
    else if (b.dataset.letra === letra) b.classList.add('tr-errada');
  });
  if (letra === correta) tr_acertos++; else tr_erros.push({ indice: tr_indiceAtual, respondida: letra, correta: correta, questao: q });
  if (letra === correta && tr_temaAtual.id === 'erros') { var st = tr_stats(); delete st.erros[q.id]; AG_STORE.set('treinoStats', st); }
  document.getElementById('tr-questao-acertos').textContent = '✓ ' + tr_acertos + ' acerto' + (tr_acertos !== 1 ? 's' : '');
  var j = document.getElementById('tr-justificativa');
  j.innerHTML = '<div class="tr-justificativa-label">' + (letra === correta ? '✅ Correto' : '❌ Incorreto — gabarito ' + correta) + ' · 💡 Justificativa</div><div>' + tr_esc(q.justificativa) + '</div>';
  j.style.display = 'block';
  var btn = document.getElementById('tr-btn-proxima');
  btn.textContent = (tr_indiceAtual >= tr_questoes.length - 1) ? 'VER RESULTADO →' : 'PRÓXIMA →';
  btn.style.display = 'block';
}

function tr_proxima() {
  tr_indiceAtual++;
  if (tr_indiceAtual >= tr_questoes.length) tr_mostrarResultado(); else tr_mostrarQuestao();
}

function tr_mostrarResultado() {
  tr_mostrarTela('tr-tela-resultado');
  var total = tr_questoes.length, pct = Math.round((tr_acertos / total) * 100);
  if (tr_temaAtual.id !== 'erros') tr_salvarResultado(tr_temaAtual.id, tr_acertos, total, tr_erros);
  else { var st = tr_stats(); tr_erros.forEach(function (e) { st.erros[e.questao.id] = (st.erros[e.questao.id] || 0) + 1; }); AG_STORE.set('treinoStats', st); }
  var corPct, msg, trofeu;
  if (pct >= 80) { corPct = 'var(--tr-green)'; msg = 'Excelente! Você domina este conteúdo. 🎯'; trofeu = '🏆'; }
  else if (pct >= 60) { corPct = 'var(--tr-yellow)'; msg = 'Bom resultado! Revise os pontos fracos e tente novamente. 💪'; trofeu = '⭐'; }
  else { corPct = 'var(--tr-red)'; msg = 'Não desanime! Revise as justificativas e refaça o tema. 📚'; trofeu = '📖'; }
  var html = '<div class="tr-resultado-card tr-fade-in"><div class="tr-resultado-trofeu">' + trofeu + '</div>' +
    '<div class="tr-resultado-titulo">Resultado Final</div>' +
    '<div class="tr-resultado-score" style="color:' + corPct + '">' + tr_acertos + ' <span class="tr-resultado-de">/ ' + total + '</span></div>' +
    '<div class="tr-resultado-pct" style="color:' + corPct + '">' + pct + '%</div><div class="tr-resultado-msg">' + msg + '</div></div>';
  if (tr_erros.length) {
    html += '<div class="tr-erros-section"><div class="tr-erros-titulo">Questões erradas (' + tr_erros.length + ')</div>';
    tr_erros.forEach(function (e) {
      var r = e.questao.enunciado.length > 90 ? e.questao.enunciado.substring(0, 90) + '…' : e.questao.enunciado;
      html += '<div class="tr-erro-item tr-fade-in"><div class="tr-erro-item-num">Questão ' + (e.indice + 1) + ' · você: ' + e.respondida + '</div>' +
        '<div class="tr-erro-item-text">' + tr_esc(r) + '</div>' +
        '<div class="tr-erro-item-resp">Resposta correta: ' + e.correta + ' — ' + tr_esc(e.questao.alternativas[e.correta]) + '</div></div>';
    });
    html += '</div>';
  }
  html += '<div class="tr-resultado-btns"><button class="tr-resultado-btn tr-primary" onclick="tr_refazerTema()">🔄  Refazer</button>' +
    '<button class="tr-resultado-btn tr-secondary" onclick="tr_voltarHome()">🏠  Escolher outro tema</button></div>';
  document.getElementById('tr-resultado-wrap').innerHTML = html;
}
function tr_refazerTema() {
  if (tr_temaAtual.id === 'aleatorio') tr_iniciarAleatorio();
  else if (tr_temaAtual.id === 'erros') tr_iniciarErros();
  else tr_iniciarTema(tr_temaAtual.id);
}
