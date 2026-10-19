/* ══════════════════════════════════════════════════════════════
   TREINO TEA/TSA — banco carregado sob demanda de data/questoes.json
   Modos: tema, aleatório, revisão de erros (repetição espaçada), simulado cronometrado.
   ══════════════════════════════════════════════════════════════ */
var TR_TEMAS = null, TR_POR_ID = null;
var tr_temaAtual = null, tr_questoes = [], tr_indiceAtual = 0, tr_acertos = 0, tr_erros = [], tr_respondida = false;
var TR_ALEATORIO_N = 40;
var TR_INTERVALOS = [1, 3, 7, 14, 30];   // dias até a próxima revisão, por caixa
var TR_SEG_POR_QUESTAO = 150;             // simulado: 2,5 min por questão
var tr_sim = null, tr_simTimer = null;

function tr_carregar() {
  if (TR_TEMAS) return Promise.resolve(TR_TEMAS);
  return fetch('data/questoes.json').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (d) {
      TR_TEMAS = d; TR_POR_ID = {};
      d.forEach(function (t) { t.questoes.forEach(function (q) { TR_POR_ID[q.id] = q; q._tema = t.id; }); });
      return d;
    });
}

function tr_embaralhar(arr) {
  for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  return arr;
}
function tr_hexToRgb(hex) { return parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16); }
function tr_esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function tr_temaPorId(id) { return (TR_TEMAS || []).filter(function (t) { return t.id === id; })[0]; }
function tr_fmtTempo(seg) { seg = Math.max(0, Math.round(seg)); var h = Math.floor(seg / 3600), m = Math.floor(seg % 3600 / 60), s = seg % 60; return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s; }

function tr_mostrarTela(id) {
  var telas = document.querySelectorAll('#screen-treino .tr-tela');
  for (var i = 0; i < telas.length; i++) telas[i].classList.remove('tr-ativa');
  document.getElementById(id).classList.add('tr-ativa');
  window.scrollTo(0, 0);
}
function tr_voltarHome() {
  tr_simParar();
  if (/^#\/t\/./.test(location.hash)) history.replaceState(null, '', '#/t');
  tr_mostrarTela('tr-tela-home'); tr_renderHome();
}
function showTreinoHome(temaId) {
  var grid = document.getElementById('tr-temas-grid');
  if (!TR_TEMAS) grid.innerHTML = '<div class="tr-loading">Carregando banco de questões…</div>';
  tr_carregar().then(function () {
    if (temaId && tr_temaPorId(temaId)) { tr_iniciarTema(temaId); return; }
    tr_mostrarTela('tr-tela-home'); tr_renderHome();
  }).catch(function () { grid.innerHTML = '<div class="tr-loading">Não foi possível carregar as questões. Verifique a conexão e tente de novo.</div>'; });
}
function abrirTreinoTema(id) { navigate('t/' + id); }
function irParaModulo(id) { navigate('e/' + id); }

/* ── estatísticas persistentes ── */
function tr_stats() {
  var st = AG_STORE.get('treinoStats', null) || {};
  st.temas = st.temas || {}; st.erros = st.erros || {}; st.rev = st.rev || {}; st.simulados = st.simulados || [];
  Object.keys(st.erros).forEach(function (id) { if (!st.rev[id]) st.rev[id] = { box: 0, due: 0 }; });   // migra versões antigas
  return st;
}
function tr_salvarStats(st) { AG_STORE.set('treinoStats', st); }
function tr_registrar(st, q, certa, modo) {
  if (!certa) { st.erros[q.id] = (st.erros[q.id] || 0) + 1; st.rev[q.id] = { box: 0, due: Date.now() }; return; }
  if (modo === 'erros' && st.rev[q.id]) {
    var r = st.rev[q.id]; r.box++;
    if (r.box > TR_INTERVALOS.length) { delete st.rev[q.id]; delete st.erros[q.id]; }
    else r.due = Date.now() + TR_INTERVALOS[r.box - 1] * 86400000;
  }
}
function tr_salvarResultado(temaId, acertos, total) {
  var st = tr_stats();
  var t = st.temas[temaId] || { feitas: 0, acertos: 0, sessoes: 0, melhor: 0 };
  t.feitas += total; t.acertos += acertos; t.sessoes++; t.melhor = Math.max(t.melhor, Math.round(acertos / total * 100));
  st.temas[temaId] = t;
  tr_salvarStats(st);
}
function tr_pendentes(st) {
  var agora = Date.now(), vencidas = [], futuras = 0, proxima = Infinity;
  Object.keys(st.rev).forEach(function (id) {
    if (!TR_POR_ID[id]) return;
    if (st.rev[id].due <= agora) vencidas.push(id); else { futuras++; proxima = Math.min(proxima, st.rev[id].due); }
  });
  return { vencidas: vencidas, futuras: futuras, proximaEmDias: proxima === Infinity ? 0 : Math.max(1, Math.ceil((proxima - agora) / 86400000)) };
}

/* ── home ── */
function tr_renderHome() {
  var grid = document.getElementById('tr-temas-grid');
  if (!TR_TEMAS) return;
  var st = tr_stats(), total = 0, feitas = 0, acertos = 0;
  TR_TEMAS.forEach(function (t) { total += t.questoes.length; var s = st.temas[t.id]; if (s) { feitas += s.feitas; acertos += s.acertos; } });
  var sub = document.querySelector('#screen-treino .tr-home-subtitle');
  if (sub) sub.textContent = total + ' questões comentadas · ' + TR_TEMAS.length + ' temas';
  var html = '';
  if (feitas) {
    html += '<div class="tr-resumo"><div><b>' + feitas + '</b><span>respondidas</span></div><div><b>' + Math.round(acertos / feitas * 100) + '%</b><span>de acerto</span></div><div><b>' + st.simulados.length + '</b><span>simulados</span></div></div>';
  }
  var sim = AG_STORE.get('simAtual', null);
  if (sim && sim.ids) {
    var feitasSim = Object.keys(sim.resp).length, resta = sim.limite - (Date.now() - sim.inicio) / 1000;
    html += '<div class="tr-tema-card tr-aleatorio" onclick="tr_simRetomar()"><div class="tr-tema-icon" style="background:rgba(255,184,0,.14)">⏱️</div>' +
      '<div class="tr-tema-info"><div class="tr-tema-titulo">Continuar simulado</div><div class="tr-tema-count">' + feitasSim + '/' + sim.ids.length + ' respondidas · ' + (resta > 0 ? 'restam ' + tr_fmtTempo(resta) : 'tempo esgotado') + '</div></div><div class="tr-tema-arrow">›</div></div>';
  }
  html += '<div class="tr-tema-card tr-aleatorio" onclick="tr_abrirSimuladoConfig()">' +
    '<div class="tr-tema-icon" style="background:rgba(255,184,0,.14)">📝</div>' +
    '<div class="tr-tema-info"><div class="tr-tema-titulo">Simulado TEA</div>' +
    '<div class="tr-tema-count">40, 60 ou 100 questões · cronômetro · nota por tema</div></div><div class="tr-tema-arrow">›</div></div>';
  html += '<div class="tr-tema-card tr-aleatorio" onclick="tr_iniciarAleatorio()">' +
    '<div class="tr-tema-icon" style="background:rgba(56,182,224,.12)">🎲</div>' +
    '<div class="tr-tema-info"><div class="tr-tema-titulo">Modo Aleatório</div>' +
    '<div class="tr-tema-count">' + TR_ALEATORIO_N + ' questões de todos os temas</div></div><div class="tr-tema-arrow">›</div></div>';
  var pend = tr_pendentes(st), nPend = pend.vencidas.length + pend.futuras;
  if (nPend) {
    var linha = pend.vencidas.length ? pend.vencidas.length + (pend.vencidas.length > 1 ? ' questões para revisar hoje' : ' questão para revisar hoje') + (pend.futuras ? ' · ' + pend.futuras + ' agendadas' : '')
      : 'nenhuma vence hoje · próxima em ' + pend.proximaEmDias + (pend.proximaEmDias > 1 ? ' dias' : ' dia') + ' (' + pend.futuras + ' agendadas)';
    html += '<div class="tr-tema-card tr-aleatorio" onclick="tr_iniciarErros()">' +
      '<div class="tr-tema-icon" style="background:rgba(255,71,87,.12)">🔁</div>' +
      '<div class="tr-tema-info"><div class="tr-tema-titulo">Revisar erros</div>' +
      '<div class="tr-tema-count">' + linha + '</div></div><div class="tr-tema-arrow">›</div></div>';
  }
  for (var i = 0; i < TR_TEMAS.length; i++) {
    var t = TR_TEMAS[i], rgb = tr_hexToRgb(t.cor), s = st.temas[t.id];
    var extra = s ? ' · ' + Math.round(s.acertos / s.feitas * 100) + '% de acerto (melhor ' + s.melhor + '%)' : '';
    html += '<div class="tr-tema-card" style="background:linear-gradient(135deg, rgba(' + rgb + ',.14), rgba(' + rgb + ',.04)); border-color:rgba(' + rgb + ',.18);" onclick="tr_iniciarTema(\'' + t.id + '\')">' +
      '<div class="tr-tema-icon" style="background:rgba(' + rgb + ',.15)">' + t.icone + '</div>' +
      '<div class="tr-tema-info"><div class="tr-tema-titulo">' + tr_esc(t.titulo) + '</div>' +
      '<div class="tr-tema-count">' + t.questoes.length + ' questões' + extra + '</div></div><div class="tr-tema-arrow">›</div></div>';
  }
  html += '<div class="tr-backup"><div class="tr-backup-titulo">Progresso</div><div class="tr-backup-txt">Guarde ou leve seu progresso para outro aparelho.</div>' +
    '<div class="tr-backup-btns"><button type="button" onclick="tr_exportar()">⬇ Exportar</button>' +
    '<label class="tr-backup-importar">⬆ Importar<input type="file" accept="application/json,.json" onchange="tr_importar(this)"></label></div></div>';
  grid.innerHTML = html;
}

/* ── exportar / importar progresso ── */
function tr_exportar() {
  var agora = new Date();
  var payload = { app: 'anestoguia', versao: typeof APP_VERSION !== 'undefined' ? APP_VERSION : '', exportadoEm: agora.toISOString(), dados: { treinoStats: tr_stats() } };
  var blob = new Blob([JSON.stringify(payload, null, 1)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'anestoguia-progresso-' + agora.toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
}
function tr_importar(input) {
  var f = input.files && input.files[0]; if (!f) return;
  var rd = new FileReader();
  rd.onload = function () {
    try {
      var p = JSON.parse(rd.result), st = p && p.app === 'anestoguia' && p.dados && p.dados.treinoStats;
      if (!st || typeof st.temas !== 'object' || typeof st.erros !== 'object') throw new Error('formato');
      if (!confirm('Substituir o progresso deste aparelho pelo do arquivo?')) return;
      AG_STORE.set('treinoStats', st); tr_renderHome();
      if (typeof mostrarAviso === 'function') mostrarAviso('Progresso importado.');
    } catch (e) { if (typeof mostrarAviso === 'function') mostrarAviso('Arquivo inválido: não parece um backup do AnestoGuia.'); }
    input.value = '';
  };
  rd.readAsText(f);
}

/* ── modos de estudo ── */
function tr_iniciarLista(tema, lista) {
  tr_temaAtual = tema; tr_questoes = lista; tr_indiceAtual = 0; tr_acertos = 0; tr_erros = [];
  tr_mostrarQuestao();
}
function tr_iniciarTema(temaId) {
  var tema = tr_temaPorId(temaId);
  if (!tema) return;
  tr_iniciarLista(tema, tr_embaralhar(tema.questoes.slice()));
}
function tr_todas() { var all = []; TR_TEMAS.forEach(function (t) { all = all.concat(t.questoes); }); return all; }
function tr_iniciarAleatorio() {
  tr_iniciarLista({ titulo: 'Modo Aleatório', id: 'aleatorio', cor: '#38B6E0', icone: '🎲' }, tr_embaralhar(tr_todas()).slice(0, TR_ALEATORIO_N));
}
function tr_iniciarErros() {
  var st = tr_stats(), p = tr_pendentes(st);
  var ids = p.vencidas.length ? p.vencidas : Object.keys(st.rev).filter(function (id) { return TR_POR_ID[id]; });
  if (!ids.length) return;
  tr_iniciarLista({ titulo: 'Revisão de erros', id: 'erros', cor: '#FF4757', icone: '🔁' }, tr_embaralhar(ids.map(function (id) { return TR_POR_ID[id]; })));
}

function tr_metaQuestao(q) {
  var chips = '';
  if (q.tipo && q.tipo !== 'conceito') chips += '<span class="tr-chip">' + tr_esc(q.tipo) + '</span>';
  var t = tr_temaPorId(q._tema); if (t && tr_temaAtual && tr_temaAtual.id !== t.id) chips += '<span class="tr-chip">' + tr_esc(t.titulo) + '</span>';
  return chips;
}
function tr_mostrarQuestao() {
  tr_respondida = false;
  tr_mostrarTela('tr-tela-questao');
  var q = tr_questoes[tr_indiceAtual], total = tr_questoes.length;
  document.getElementById('tr-questao-header-tema').textContent = tr_temaAtual.titulo;
  document.getElementById('tr-questao-header-sub').textContent = 'Questão ' + (tr_indiceAtual + 1) + ' de ' + total;
  document.getElementById('tr-questao-num').textContent = 'Questão ' + (tr_indiceAtual + 1) + ' / ' + total + (q.subtopico ? ' · ' + q.subtopico : '');
  document.getElementById('tr-questao-meta').innerHTML = tr_metaQuestao(q);
  document.getElementById('tr-questao-acertos').textContent = '✓ ' + tr_acertos + ' acerto' + (tr_acertos !== 1 ? 's' : '');
  document.getElementById('tr-progress-fill').style.width = ((tr_indiceAtual / total) * 100) + '%';
  document.getElementById('tr-enunciado').textContent = q.enunciado;
  document.getElementById('tr-alternativas').innerHTML = tr_htmlAlternativas(q, 'tr_responder');
  var j = document.getElementById('tr-justificativa'); j.style.display = 'none'; j.innerHTML = '';
  document.getElementById('tr-btn-proxima').style.display = 'none';
}
function tr_htmlAlternativas(q, fn, marcada) {
  var html = '';
  ['A', 'B', 'C', 'D'].forEach(function (L) {
    if (!q.alternativas[L]) return;
    html += '<button class="tr-alt-btn' + (marcada === L ? ' tr-sel' : '') + '" data-letra="' + L + '" onclick="' + fn + '(\'' + L + '\')">' +
      '<span class="tr-alt-letra">' + L + '</span><span class="tr-alt-texto">' + tr_esc(q.alternativas[L]) + '</span></button>';
  });
  return html;
}
function tr_linkModulo(q) {
  return q.modulo ? '<button type="button" class="tr-modulo-btn" onclick="irParaModulo(\'' + q.modulo + '\')">📖 Abrir o módulo de estudo</button>' : '';
}

function tr_responder(letra) {
  if (tr_respondida) return;
  tr_respondida = true;
  var q = tr_questoes[tr_indiceAtual], correta = q.resposta;
  document.querySelectorAll('#tr-alternativas .tr-alt-btn').forEach(function (b) {
    b.disabled = true;
    if (b.dataset.letra === correta) b.classList.add('tr-correta');
    else if (b.dataset.letra === letra) b.classList.add('tr-errada');
  });
  if (letra === correta) tr_acertos++; else tr_erros.push({ indice: tr_indiceAtual, respondida: letra, correta: correta, questao: q });
  var st = tr_stats(); tr_registrar(st, q, letra === correta, tr_temaAtual.id); tr_salvarStats(st);
  document.getElementById('tr-questao-acertos').textContent = '✓ ' + tr_acertos + ' acerto' + (tr_acertos !== 1 ? 's' : '');
  var j = document.getElementById('tr-justificativa');
  j.innerHTML = '<div class="tr-justificativa-label">' + (letra === correta ? '✅ Correto' : '❌ Incorreto — gabarito ' + correta) + ' · 💡 Justificativa</div><div>' + tr_esc(q.justificativa) + '</div>' + tr_linkModulo(q);
  j.style.display = 'block';
  var btn = document.getElementById('tr-btn-proxima');
  btn.textContent = (tr_indiceAtual >= tr_questoes.length - 1) ? 'VER RESULTADO →' : 'PRÓXIMA →';
  btn.style.display = 'block';
}

function tr_proxima() {
  tr_indiceAtual++;
  if (tr_indiceAtual >= tr_questoes.length) tr_mostrarResultado(); else tr_mostrarQuestao();
}

function tr_msgResultado(pct) {
  if (pct >= 80) return { cor: 'var(--tr-green)', msg: 'Excelente! Você domina este conteúdo. 🎯', trofeu: '🏆' };
  if (pct >= 60) return { cor: 'var(--tr-yellow)', msg: 'Bom resultado! Revise os pontos fracos e tente novamente. 💪', trofeu: '⭐' };
  return { cor: 'var(--tr-red)', msg: 'Não desanime! Revise as justificativas e refaça o tema. 📚', trofeu: '📖' };
}
function tr_mostrarResultado() {
  tr_mostrarTela('tr-tela-resultado');
  var total = tr_questoes.length, pct = Math.round((tr_acertos / total) * 100);
  if (tr_temaAtual.id !== 'erros') tr_salvarResultado(tr_temaAtual.id, tr_acertos, total);
  var r = tr_msgResultado(pct);
  var html = '<div class="tr-resultado-card tr-fade-in"><div class="tr-resultado-trofeu">' + r.trofeu + '</div>' +
    '<div class="tr-resultado-titulo">Resultado Final</div>' +
    '<div class="tr-resultado-score" style="color:' + r.cor + '">' + tr_acertos + ' <span class="tr-resultado-de">/ ' + total + '</span></div>' +
    '<div class="tr-resultado-pct" style="color:' + r.cor + '">' + pct + '%</div><div class="tr-resultado-msg">' + r.msg + '</div></div>';
  if (tr_erros.length) {
    html += '<div class="tr-erros-section"><div class="tr-erros-titulo">Questões erradas (' + tr_erros.length + ')</div>';
    tr_erros.forEach(function (e) {
      var rr = e.questao.enunciado.length > 90 ? e.questao.enunciado.substring(0, 90) + '…' : e.questao.enunciado;
      html += '<div class="tr-erro-item tr-fade-in"><div class="tr-erro-item-num">Questão ' + (e.indice + 1) + ' · você: ' + e.respondida + '</div>' +
        '<div class="tr-erro-item-text">' + tr_esc(rr) + '</div>' +
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

/* ══════════ SIMULADO TEA ══════════ */
function tr_abrirSimuladoConfig() {
  var total = tr_todas().length;
  var opcoes = [40, 60, 100].filter(function (n) { return n <= total; });
  var html = '<div class="tr-sim-config"><p>As questões vêm de todos os temas, em proporção ao tamanho de cada um. Não há gabarito durante a prova: você pode voltar, trocar respostas e finalizar quando quiser. O cronômetro dá ' + (TR_SEG_POR_QUESTAO / 60).toString().replace('.', ',') + ' min por questão e a prova é encerrada quando o tempo acaba.</p>';
  opcoes.forEach(function (n) {
    html += '<button type="button" class="tr-resultado-btn tr-primary" onclick="tr_iniciarSimulado(' + n + ')">' + n + ' QUESTÕES · ' + tr_fmtTempo(n * TR_SEG_POR_QUESTAO) + '</button>';
  });
  var hist = tr_stats().simulados.slice(0, 5);
  if (hist.length) {
    html += '<div class="tr-erros-titulo" style="margin-top:24px">Últimos simulados</div>';
    hist.forEach(function (h) {
      var d = new Date(h.data);
      html += '<div class="tr-erro-item"><div class="tr-erro-item-num" style="color:var(--tr-cyan)">' + d.toLocaleDateString('pt-BR') + ' · ' + h.n + ' questões · ' + tr_fmtTempo(h.tempo) + '</div>' +
        '<div class="tr-erro-item-text">' + h.acertos + '/' + h.n + ' (' + Math.round(h.acertos / h.n * 100) + '%)</div></div>';
    });
  }
  html += '</div>';
  document.getElementById('tr-sim-config-wrap').innerHTML = html;
  tr_mostrarTela('tr-tela-sim-config');
}

function tr_simMontar(n) {
  var total = tr_todas().length;
  var aloc = TR_TEMAS.map(function (t) { var exato = n * t.questoes.length / total; return { t: t, n: Math.floor(exato), r: exato - Math.floor(exato) }; });
  var falta = n - aloc.reduce(function (s, a) { return s + a.n; }, 0);
  aloc.slice().sort(function (a, b) { return b.r - a.r; }).slice(0, falta).forEach(function (a) { a.n++; });
  var sel = [];
  aloc.forEach(function (a) { sel = sel.concat(tr_embaralhar(a.t.questoes.slice()).slice(0, a.n)); });
  return tr_embaralhar(sel);
}
function tr_iniciarSimulado(n) {
  var qs = tr_simMontar(n);
  tr_sim = { ids: qs.map(function (q) { return q.id; }), resp: {}, idx: 0, inicio: Date.now(), limite: n * TR_SEG_POR_QUESTAO };
  AG_STORE.set('simAtual', tr_sim);
  tr_simMostrar();
}
function tr_simRetomar() {
  var s = AG_STORE.get('simAtual', null);
  if (!s || !s.ids) return;
  tr_sim = s;
  if ((Date.now() - s.inicio) / 1000 >= s.limite) { tr_simFinalizar(true); return; }
  tr_simMostrar();
}
function tr_simSalvar() { AG_STORE.set('simAtual', tr_sim); }
function tr_simParar() { if (tr_simTimer) { clearInterval(tr_simTimer); tr_simTimer = null; } }
function tr_simRestante() { return tr_sim.limite - (Date.now() - tr_sim.inicio) / 1000; }
function tr_simTick() {
  if (!tr_sim) { tr_simParar(); return; }
  var rest = tr_simRestante(), el = document.getElementById('tr-sim-timer');
  if (el) { el.textContent = tr_fmtTempo(rest); el.classList.toggle('tr-sim-urgente', rest < 300); }
  if (rest <= 0) { tr_simParar(); if (typeof mostrarAviso === 'function') mostrarAviso('Tempo esgotado: o simulado foi encerrado.'); tr_simFinalizar(true); }
}
function tr_simMostrar() {
  tr_mostrarTela('tr-tela-simulado');
  tr_simParar(); tr_simTick();
  if (tr_sim) tr_simTimer = setInterval(tr_simTick, 1000);
  if (tr_sim) tr_simRender();
}
function tr_simRender() {
  var q = TR_POR_ID[tr_sim.ids[tr_sim.idx]], n = tr_sim.ids.length, feitas = Object.keys(tr_sim.resp).length;
  document.getElementById('tr-sim-num').textContent = 'Questão ' + (tr_sim.idx + 1) + ' / ' + n + ' · ' + feitas + ' respondidas';
  document.getElementById('tr-sim-fill').style.width = (feitas / n * 100) + '%';
  document.getElementById('tr-sim-enunciado').textContent = q.enunciado;
  document.getElementById('tr-sim-alternativas').innerHTML = tr_htmlAlternativas(q, 'tr_simEscolher', tr_sim.resp[q.id]);
  document.getElementById('tr-sim-anterior').disabled = tr_sim.idx === 0;
  var ult = tr_sim.idx === n - 1, nx = document.getElementById('tr-sim-proxima');
  nx.textContent = ult ? 'FINALIZAR ✓' : 'PRÓXIMA →';
  nx.onclick = ult ? function () { tr_simFinalizar(false); } : function () { tr_simIr(1); };
  var mapa = '';
  for (var i = 0; i < n; i++) mapa += '<button type="button" class="tr-sim-n' + (tr_sim.resp[tr_sim.ids[i]] ? ' tr-feita' : '') + (i === tr_sim.idx ? ' tr-atual' : '') + '" onclick="tr_simIrPara(' + i + ')">' + (i + 1) + '</button>';
  document.getElementById('tr-sim-mapa').innerHTML = mapa;
}
function tr_simEscolher(letra) {
  var id = tr_sim.ids[tr_sim.idx];
  tr_sim.resp[id] = letra; tr_simSalvar(); tr_simRender();
}
function tr_simIr(d) { tr_sim.idx = Math.min(tr_sim.ids.length - 1, Math.max(0, tr_sim.idx + d)); tr_simSalvar(); tr_simRender(); window.scrollTo(0, 0); }
function tr_simIrPara(i) { tr_sim.idx = i; tr_simSalvar(); tr_simRender(); window.scrollTo(0, 0); }
function tr_simMapaAlternar() { var m = document.getElementById('tr-sim-mapa'); m.style.display = m.style.display === 'grid' ? 'none' : 'grid'; }
function tr_simSair() {
  if (!confirm('Sair do simulado? O progresso fica salvo, mas o cronômetro continua correndo.')) return;
  tr_voltarHome();
}
function tr_simFinalizar(auto) {
  if (!tr_sim) return;
  var vazias = tr_sim.ids.filter(function (id) { return !tr_sim.resp[id]; }).length;
  if (!auto && vazias && !confirm(vazias + ' questão(ões) sem resposta. Finalizar mesmo assim?')) return;
  tr_simParar();
  var sim = tr_sim, n = sim.ids.length, tempo = Math.min(sim.limite, Math.round((Date.now() - sim.inicio) / 1000));
  var porTema = {}, erradas = [], acertos = 0, st = tr_stats();
  sim.ids.forEach(function (id, i) {
    var q = TR_POR_ID[id], r = sim.resp[id], ok = r === q.resposta, a = porTema[q._tema] || (porTema[q._tema] = [0, 0]);
    a[1]++; if (ok) { a[0]++; acertos++; } else { erradas.push({ i: i, q: q, r: r }); tr_registrar(st, q, false); }
  });
  st.simulados.unshift({ data: new Date().toISOString(), n: n, acertos: acertos, tempo: tempo, porTema: porTema });
  st.simulados = st.simulados.slice(0, 20);
  tr_salvarStats(st);
  AG_STORE.del('simAtual'); tr_sim = null;
  tr_simMostrarResultado(n, acertos, tempo, porTema, erradas);
}
function tr_simMostrarResultado(n, acertos, tempo, porTema, erradas) {
  tr_mostrarTela('tr-tela-resultado');
  var pct = Math.round(acertos / n * 100), r = tr_msgResultado(pct);
  var html = '<div class="tr-resultado-card tr-fade-in"><div class="tr-resultado-trofeu">' + r.trofeu + '</div><div class="tr-resultado-titulo">Simulado TEA</div>' +
    '<div class="tr-resultado-score" style="color:' + r.cor + '">' + acertos + ' <span class="tr-resultado-de">/ ' + n + '</span></div>' +
    '<div class="tr-resultado-pct" style="color:' + r.cor + '">' + pct + '% · ' + tr_fmtTempo(tempo) + '</div><div class="tr-resultado-msg">' + r.msg + '</div></div>';
  html += '<div class="tr-erros-section"><div class="tr-erros-titulo">Resultado por tema</div>';
  Object.keys(porTema).map(function (id) { return [id, porTema[id]]; }).sort(function (a, b) { return a[1][0] / a[1][1] - b[1][0] / b[1][1]; }).forEach(function (e) {
    var t = tr_temaPorId(e[0]), p = Math.round(e[1][0] / e[1][1] * 100);
    html += '<div class="tr-sim-tema"><span>' + (t ? t.icone + ' ' + tr_esc(t.titulo) : e[0]) + '</span><span class="tr-sim-barra"><i style="width:' + p + '%;background:' + (p >= 70 ? 'var(--tr-green)' : p >= 50 ? 'var(--tr-yellow)' : 'var(--tr-red)') + '"></i></span><b>' + e[1][0] + '/' + e[1][1] + '</b></div>';
  });
  html += '</div>';
  if (erradas.length) {
    html += '<div class="tr-erros-section"><div class="tr-erros-titulo">Questões erradas ou em branco (' + erradas.length + ') — já agendadas para revisão</div>';
    erradas.forEach(function (e) {
      html += '<details class="tr-erro-item"><summary><span class="tr-erro-item-num">Questão ' + (e.i + 1) + ' · você: ' + (e.r || 'em branco') + ' · gabarito ' + e.q.resposta + '</span><br><span class="tr-erro-item-text">' + tr_esc(e.q.enunciado) + '</span></summary>' +
        '<div class="tr-erro-item-resp">' + e.q.resposta + ') ' + tr_esc(e.q.alternativas[e.q.resposta]) + '</div>' +
        '<div class="tr-sim-just">' + tr_esc(e.q.justificativa) + '</div>' + tr_linkModulo(e.q) + '</details>';
    });
    html += '</div>';
  }
  html += '<div class="tr-resultado-btns"><button class="tr-resultado-btn tr-primary" onclick="tr_abrirSimuladoConfig()">📝  Novo simulado</button>' +
    '<button class="tr-resultado-btn tr-secondary" onclick="tr_voltarHome()">🏠  Início do Treino</button></div>';
  document.getElementById('tr-resultado-wrap').innerHTML = html;
}
