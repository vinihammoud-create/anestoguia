// ══════════════════════════════════════════════════
// ANESTOGUIA — JS UNIFICADO (Prático + Estudos)
// ══════════════════════════════════════════════════



// (navegação: js/router.js)

// ── ABAS ──

// ── ITENS INTERATIVOS ──
function toggleItem(item) { item.classList.toggle('checked'); }
function toggleAcc(hdr) {
  /* Suporta dois padrões de chamada:
   *   toggleAcc(this)      — this = .acc-hdr element
   *   toggleAcc('my-id')   — 'my-id' = id do .acc-body (padrão do app)
   *
   * Quando string: getElementById retorna o .acc-body
   *   → body = esse elemento
   *   → hdr  = body.previousElementSibling (o .acc-hdr imediatamente antes)
   * Quando elemento: hdr = .acc-hdr
   *   → body = hdr.nextElementSibling
   */
  var body, hdrEl;
  if (typeof hdr === 'string') {
    body  = document.getElementById(hdr);
    if (!body) return;
    hdrEl = body.previousElementSibling;
    /* Pular divs intermediários (overflow-x:auto wrappers) */
    if (!hdrEl || !hdrEl.classList.contains('acc-hdr')) {
      hdrEl = body.parentElement ? body.parentElement.previousElementSibling : null;
    }
  } else {
    hdrEl = hdr;
    body  = hdrEl.nextElementSibling;
    /* Pular div wrapper (overflow-x:auto) se houver */
    if (body && !body.classList.contains('acc-body')) {
      body = body.querySelector('.acc-body') || body.nextElementSibling;
    }
  }
  if (!body) return;
  var isOpen = body.classList.contains('show');
  if (hdrEl) hdrEl.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  if (isOpen) {
    body.classList.remove('show');
    if (hdrEl) hdrEl.classList.remove('open-r','open-o','open-v','open-t','open-g','open-y','open-b','open-p');
  } else {
    body.classList.add('show');
    if (hdrEl) {
      var colors = ['open-r','open-o','open-v','open-t','open-g','open-y','open-b','open-p'];
      hdrEl.classList.add(colors[Math.floor(Math.random() * colors.length)]);
    }
  }
}
function toggleDrug(hdr) {
  /* Aceita string ID do drug-card OU elemento .drug-hdr */
  var card = (typeof hdr === 'string')
    ? document.getElementById(hdr)
    : (hdr.closest ? hdr.closest('.drug-card') : hdr.parentElement);
  if (!card) return;
  var wasOpen = card.classList.contains('open');
  card.classList.toggle('open');
  /* Forçar display via JS para cobrir todos os casos de aninhamento */
  var bodies = card.querySelectorAll('.drug-body');
  bodies.forEach(function(body) {
    body.style.display = wasOpen ? 'none' : 'block';
  });
}
function toggleCaso(hdr) { var open = hdr.parentElement.classList.toggle('open'); hdr.setAttribute('aria-expanded', open ? 'true' : 'false'); }

// ── CALCULADORA PEDIÁTRICA ──
function calcPed() {
  const peso = parseFloat(document.getElementById('ped-peso').value);
  const idade = document.getElementById('ped-idade').value;
  const ctx = document.getElementById('ped-contexto').value;
  if (!peso || peso < 1 || peso > 70) {
    document.getElementById('ped-results').style.display = 'none';
    document.getElementById('ped-info').textContent = 'Peso inválido (1–70 kg)';
    return;
  }
  document.getElementById('ped-info').textContent = peso + ' kg';
  document.getElementById('ped-results').style.display = 'block';

  // TOT
  let tot, totCuff, prof, mla;
  if (idade === 'neonato') { tot = 3.0; totCuff = '3,0 mm DI'; prof = 9; mla = 1; }
  else if (idade === 'lactente') { tot = peso < 5 ? 3.0 : 3.5; totCuff = tot.toFixed(1) + ' mm DI'; prof = Math.round(7 + peso * 0.4); mla = peso < 5 ? 1 : 1.5; }
  else {
    const idadeAnos = peso < 10 ? 1 : peso < 15 ? 3 : peso < 20 ? 5 : peso < 30 ? 8 : 12;
    const totCalc = (idadeAnos / 4) + 4;
    const totCuffCalc = (idadeAnos / 4) + 3.5;
    tot = Math.round(totCalc * 2) / 2;
    totCuff = totCuffCalc.toFixed(1) + ' mm c/cuff (baixa pressão)';
    prof = Math.round(tot * 3);
    mla = peso < 10 ? 1.5 : peso < 20 ? 2 : peso < 30 ? 2.5 : 3;
  }
  document.getElementById('ped-tot').textContent = tot.toFixed(1) + ' mm';
  document.getElementById('ped-tot-detail').textContent = 'Com cuff: ' + totCuff;
  document.getElementById('ped-prof').textContent = prof + ' cm';
  document.getElementById('ped-mla').textContent = 'Nº ' + mla;

  // Doses de drogas
  const prop = ctx === 'rsi' ? peso * 2.5 : peso * 3;
  document.getElementById('ped-prop').textContent = prop.toFixed(0) + ' mg';
  document.getElementById('ped-prop-v').textContent = (prop / 10).toFixed(1) + ' mL (10 mg/mL)';

  const cetaIV = peso * 2, cetaIM = peso * 5;
  document.getElementById('ped-ceta').textContent = cetaIV.toFixed(0) + ' mg IV';
  document.getElementById('ped-ceta-v').textContent = cetaIM.toFixed(0) + ' mg IM (4–6 mg/kg)';

  const etom = peso * 0.3;
  document.getElementById('ped-etom').textContent = etom.toFixed(1) + ' mg';
  document.getElementById('ped-etom-v').textContent = (etom / 2).toFixed(1) + ' mL (2 mg/mL)';

  const midazVO = Math.min(peso * 0.4, 10);
  document.getElementById('ped-midaz').textContent = midazVO.toFixed(1) + ' mg VO';
  document.getElementById('ped-midaz-v').textContent = (midazVO / 2).toFixed(1) + ' mL (2 mg/mL) · 30–60 min antes';

  // BNM
  // 2 mg/kg só em <2 anos (neonato/lactente); acima, 1–1,5 mg/kg
  const suxDose = (idade === 'neonato' || idade === 'lactente') ? peso * 2 : peso * 1.5;
  document.getElementById('ped-sux').textContent = suxDose.toFixed(0) + ' mg IV';
  document.getElementById('ped-sux-v').textContent = (suxDose / 20).toFixed(1) + ' mL (20 mg/mL)';

  const rocDose = ctx === 'rsi' ? peso * 1.2 : peso * 0.6;
  document.getElementById('ped-roc').textContent = rocDose.toFixed(1) + ' mg';
  document.getElementById('ped-roc-v').textContent = (rocDose / 10).toFixed(1) + ' mL (10 mg/mL)';

  // Emergência
  const adrePCR = Math.min(peso * 0.01, 1);
  document.getElementById('ped-adre').textContent = adrePCR.toFixed(2) + ' mg IV/IO';
  document.getElementById('ped-adre-v').textContent = (adrePCR / 0.1).toFixed(1) + ' mL (0,1 mg/mL dil) a cada 3–5 min';

  const atrp = Math.min(peso * 0.02, 0.5); // PALS 2020: sem dose mínima
  document.getElementById('ped-atrp').textContent = atrp.toFixed(2) + ' mg IV';
  document.getElementById('ped-atrp-v').textContent = (atrp / 0.5).toFixed(1) + ' mL (0,5 mg/mL) · máx 0,5 mg/dose';

  const adreIM = Math.min(peso * 0.01, 0.5);
  document.getElementById('ped-adre-im').textContent = adreIM.toFixed(2) + ' mg IM';

  // Fluidos
  const bolus = peso * 20;
  document.getElementById('ped-bolus').textContent = bolus.toFixed(0) + ' mL';
  let manut;
  if (peso <= 10) manut = peso * 4;
  else if (peso <= 20) manut = 40 + (peso - 10) * 2;
  else manut = 60 + (peso - 20) * 1;
  document.getElementById('ped-maint').textContent = manut.toFixed(0) + ' mL/h';
  document.getElementById('ped-maint-detail').textContent = '4-2-1 regra · peso=' + peso + 'kg';

  // VM
  const vc = Math.round(peso * 7);
  const fr = idade === 'neonato' ? '35–40' : idade === 'lactente' ? '25–35' : peso < 20 ? '20–25' : '15–20';
  document.getElementById('ped-vm-text').innerHTML =
    'VC: <strong style="color:var(--cyan)">' + vc + ' mL</strong> (7 mL/kg) &nbsp;|&nbsp; ' +
    'FR: <strong style="color:var(--cyan)">' + fr + ' ipm</strong><br>' +
    'FiO₂: <strong style="color:var(--cyan)">100%</strong> inicialmente &nbsp;|&nbsp; ' +
    'PEEP: <strong style="color:var(--cyan)">4–5 cmH₂O</strong><br>' +
    'I:E ratio: <strong style="color:var(--cyan)">1:2</strong> &nbsp;|&nbsp; ' +
    'Pico: <strong style="color:var(--cyan)">&lt;30 cmH₂O</strong>';

  const obs = {
    neonato: '🚨 <strong>Neonato:</strong> Hipotermia muito rápida · FiO₂ mínima · cuidado com O₂ excessivo · evitar propofol · morfina com cautela.',
    lactente: '⚠ <strong>Lactente:</strong> Maior CAM · IOT com Miller · succinilcolina só em emergência (aviso FDA) · atenção à bradicardia.',
    crianca: '✅ <strong>Criança:</strong> Parâmetros relativamente mais seguros · jejum 1h líquidos claros · MPA midazolam VO.',
    adolescente: '💡 <strong>Adolescente:</strong> Doses próximas ao adulto · atenção ao peso real vs ideal · PONV mais frequente que adulto.'
  };
  document.getElementById('ped-obs').innerHTML = obs[idade] || '';
}

// ── JS APP PRÁTICO ──
"use strict";

/* ══════════════════════════════════════════
   1. VARIÁVEIS GLOBAIS
   ══════════════════════════════════════════ */
let pesoGlobal = 0;
let perfilAtual = 'adulto';
let crisisInterval = null;
let crisisStart = null;
let crisisType = '';
let crisisAudioCtx = null;

/* ══════════════════════════════════════════
   2. NAVEGAÇÃO
   ══════════════════════════════════════════ */






/* ══════════════════════════════════════════
   3. TABS
   ══════════════════════════════════════════ */



/* ══════════════════════════════════════════
   4. ACCORDION / TOGGLE
   ══════════════════════════════════════════ */









function toggleO2(id) {
  const body = document.getElementById(id);
  if (body) body.classList.toggle('show');
}

/* ══════════════════════════════════════════
   5. PESO GLOBAL
   ══════════════════════════════════════════ */
function setPesoGlobal(val) {
  /* Sanitização: coerce para float, range fisiológico 1-300 kg */
  var parsed = parseFloat(val);
  pesoGlobal = (!isNaN(parsed) && parsed > 0 && parsed <= 300) ? parsed : 0;
  syncPesoInputs();
  /* Trigger calculators apenas com peso válido */
  if (pesoGlobal > 0) {
    calcAll();
    updateVMCalc();
    updateRegionalDoses();
    /* Persistir peso na sessão via AG_STORE */
    if (typeof AG_STORE !== 'undefined') AG_STORE.set('peso', pesoGlobal);
  }
  updatePesoInfoDisplays();
  if (pesoGlobal > 0) savePatientHistory();
}

function syncPesoInputs() {
  document.querySelectorAll('.peso-input').forEach(inp => {
    if (pesoGlobal > 0) {
      inp.value = pesoGlobal;
    }
  });
  // Also sync named peso fields in advanced calcs
  ['pw-real', 'fl-peso', 'cr-peso', 'rq-peso', 'adv-inf-peso'].forEach(id => {
    const el = document.getElementById(id);
    if (el && pesoGlobal > 0) el.value = pesoGlobal;
  });
}

function updatePesoInfoDisplays() {
  const info = pesoGlobal > 0 ? pesoGlobal + ' kg · ' + Math.round(pesoGlobal * 2.205) + ' lbs' : 'Informe o peso';
  ['plantao-peso-info', 'calc-peso-info', 'vm-peso-info'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = info;
  });
}

function clearPeso() {
  pesoGlobal = 0;
  document.querySelectorAll('.peso-input').forEach(inp => { inp.value = ''; });
  updatePesoInfoDisplays();
}

/* ══════════════════════════════════════════
   6. PERFIL (adulto/ped/idoso/obeso)
   ══════════════════════════════════════════ */
function setPerfil(p, btn) {
  perfilAtual = p;
  document.querySelectorAll('.perfil-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const note = document.getElementById('c-perfil-note');
  const notas = {
    adulto: null,
    ped: '👶 Pediátrico: doses ajustadas para criança. Verifique sempre peso real.',
    idoso: '👴 Idoso (≥70a): doses reduzidas 30–50%. Start low, go slow.',
    obeso: '🏋️ Obeso: hipnóticos/opioides pelo peso magro; sugamadex pelo peso real.'
  };
  if (notas[p]) {
    note.style.display = 'block';
    note.textContent = notas[p];
  } else {
    note.style.display = 'none';
  }
  calcAll();
}

/* ══════════════════════════════════════════
   7. FORMATAÇÃO DE DOSES
   ══════════════════════════════════════════ */
function fmt(val, unit, dec) {
  if (!val || isNaN(val) || val <= 0) return '—';
  return (dec ? val.toFixed(dec) : Math.round(val)) + ' ' + unit;
}

function fmtR(low, high, unit, peso) {
  if (!peso) return '—';
  return Math.round(low * peso) + '–' + Math.round(high * peso) + ' ' + unit;
}

function setTxt(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ══════════════════════════════════════════
   8. CALCULADORA PRINCIPAL DE DOSES (calcAll)
   ══════════════════════════════════════════ */
function calcAll() {
  const p = pesoGlobal;
  if (!p || isNaN(p)) return;

  // Indução
  const propF = perfilAtual === 'ped' ? [2.5, 3.5] : perfilAtual === 'idoso' ? [1.0, 1.5] : [1.5, 2.5];
  setTxt('c-prop', fmtR(propF[0], propF[1], 'mg', p));
  setTxt('c-prop-d', propF[0] + '–' + propF[1] + ' mg/kg IV');
  const etomMult = perfilAtual === 'idoso' ? 0.65 : 1.0;
  setTxt('c-etom', fmt(p * 0.3 * etomMult, 'mg'));
  const ketaF = perfilAtual === 'ped' ? [2, 3] : [1, 2];
  setTxt('c-keta-ind', fmtR(ketaF[0], ketaF[1], 'mg', p));
  setTxt('c-keta-ind-d', ketaF[0] + '–' + ketaF[1] + ' mg/kg IV');
  setTxt('c-keta-im', fmtR(4, 6, 'mg', p));
  const midazF = perfilAtual === 'idoso' ? 0.01 : 0.03;
  setTxt('c-midaz', fmt(p * midazF, 'mg', 1));
  setTxt('c-midaz-d', (perfilAtual === 'idoso' ? '0,01' : '0,02–0,05') + ' mg/kg IV');
  setTxt('c-dex-b', fmt(p * 0.75, 'mcg'));
  setTxt('c-prop-inf', fmtR(4, 12, 'mg/h', p));
  setTxt('c-dex-inf', fmtR(0.2, 0.7, 'mcg/h', p));
  setTxt('c-keta-inf', fmtR(0.1, 0.2, 'mg/h', p));

  // BNM
  const suxF = perfilAtual === 'ped' ? 2.0 : 1.5;
  setTxt('c-sux', fmt(p * suxF, 'mg'));
  setTxt('c-sux-d', suxF + ' mg/kg IV');
  setTxt('c-roc', fmtR(0.6, 1.2, 'mg', p));
  setTxt('c-roc-d', '0,6–1,2 mg/kg IV');
  setTxt('c-roc-rsi', fmt(p * 1.2, 'mg'));
  setTxt('c-vec', fmt(p * 0.1, 'mg'));
  setTxt('c-atra', fmt(p * 0.5, 'mg'));
  setTxt('c-cis', fmt(p * 0.15, 'mg'));
  setTxt('c-sug-2', fmt(p * 2, 'mg'));
  setTxt('c-sug-4', fmt(p * 4, 'mg'));
  setTxt('c-sug-16', fmt(p * 16, 'mg'));
  setTxt('c-neo', fmtR(0.04, 0.07, 'mg', p));
  setTxt('c-atro2', fmt(p * 0.02, 'mg', 2));

  // Opioides
  const fentM = perfilAtual === 'idoso' ? 0.5 : 1.0;
  setTxt('c-fent-ind', fmtR(2 * fentM, 5 * fentM, 'mcg', p));
  setTxt('c-suf', fmt(p * 0.4 * fentM, 'mcg', 1));
  setTxt('c-remi', fmtR(0.1, 0.5, 'mcg/h', p));
  setTxt('c-alfa', fmtR(10, 20, 'mcg', p));
  setTxt('c-morf-srpa', fmt(p * 0.05 * fentM, 'mg', 2));
  setTxt('c-tram', fmtR(1, 2, 'mg', p));
  setTxt('c-tram-d', perfilAtual === 'idoso' ? '1 mg/kg IV lento' : '1–2 mg/kg IV lento');
  setTxt('c-peti', fmtR(0.35, 0.5, 'mg', p));
  setTxt('c-nal', fmtR(1, 4, 'mcg', p));

  // Vasopressores
  setTxt('c-efed', fmt(Math.min(10, p * 0.15), 'mg', 1));
  setTxt('c-feni', '50–200 mcg IV bolus');
  setTxt('c-atro3', fmt(Math.max(0.1, p * 0.015), 'mg', 2));
  setTxt('c-nora-inf', fmtR(0.05, 0.3, 'mcg/min', p));
  setTxt('c-epi-inf', fmtR(0.05, 0.3, 'mcg/min', p));
  setTxt('c-dopa', fmtR(2, 20, 'mcg/min', p));
  setTxt('c-dobu', fmtR(2, 20, 'mcg/min', p));
  setTxt('c-amio', '300 mg IV');

  // Analgesia
  setTxt('c-dip', fmt(Math.min(2000, p * 17), 'mg'));
  setTxt('c-para', fmt(Math.min(1000, p * 12), 'mg'));
  setTxt('c-para-d', perfilAtual === 'ped' ? '10–15 mg/kg' : '10–15 mg/kg (máx 1g)');
  setTxt('c-tram2', fmtR(1, 2, 'mg', p));
  setTxt('c-morf2', fmt(p * 0.05, 'mg', 2));
  setTxt('c-fent2', fmtR(0.5, 1, 'mcg', p));
  setTxt('c-keta2', fmtR(0.1, 0.3, 'mg', p));
  setTxt('c-lido-iv', fmt(p * 1.5, 'mg'));
  setTxt('c-mg', fmtR(30, 50, 'mg', p));

  // Emergência
  // PCR: 0,01 mg/kg com teto de 1 mg (adulto = 1 mg); atropina: 0,02 mg/kg até 0,5 mg/dose na criança, 1 mg no adulto
  setTxt('e-epi', fmt(Math.min(1, p * 0.01), 'mg', 2));
  setTxt('e-atro', fmt(p >= 40 ? 1 : Math.min(0.5, p * 0.02), 'mg', 2));

  // Doses pediátricas (aba Especiais › Pediatria)
  setTxt('pd-prop', fmtR(2.5, 3.5, 'mg', p));
  setTxt('pd-fent', fmtR(1, 3, 'mcg', p));
  setTxt('pd-roc', fmt(p * 0.6, 'mg'));
  setTxt('pd-sux', fmt(p * 2, 'mg'));
  setTxt('pd-atro', fmt(Math.min(0.5, p * 0.02), 'mg', 2));
  setTxt('pd-epi', fmt(Math.min(1, p * 0.01), 'mg', 2));
  setTxt('pd-sug', fmtR(2, 4, 'mg', p));
  setTxt('e-dant', fmt(p * 2.5, 'mg'));
  setTxt('e-sux', fmtR(0.1, 0.5, 'mg', p));
  setTxt('e-prop', fmt(p * 0.5, 'mg'));
  setTxt('e-amio', '300 mg IV');
  setTxt('e-nal', fmtR(1, 4, 'mcg', p));
  setTxt('e-flu', fmt(Math.min(1, p * 0.01), 'mg', 2));
  setTxt('e-lipa', fmt(p * 1.5, 'mL', 1));
  setTxt('e-atxa', fmt(p * 15, 'mg'));
  setTxt('e-bic', fmtR(1, 2, 'mEq', p));

  // Anestésicos Locais dose máxima
  setTxt('al-lido1', fmt(p * 4.5, 'mg'));
  setTxt('al-lido2', fmt(p * 7, 'mg'));
  setTxt('al-bupi1', fmt(Math.min(150, p * 2), 'mg'));
  setTxt('al-bupi2', fmt(Math.min(225, p * 3), 'mg'));
  setTxt('al-ropi', fmt(Math.min(300, p * 3), 'mg'));

  // Regional max doses
  setTxt('reg-dose-max', Math.round(p * 3) + ' mg');
  setTxt('reg-bupi-max', fmt(Math.min(150, p * 2), 'mg'));
  setTxt('reg-ropi-max', fmt(Math.min(300, p * 3), 'mg'));
}

/* ══════════════════════════════════════════
   9. VM CALCULADORA
   ══════════════════════════════════════════ */
function updateVMCalc() {
  const p = pesoGlobal;
  if (!p) return;
  const vc = Math.round(p * 7);
  setTxt('vm-vc', vc + ' mL (7 mL/kg)');
}

function updateRegionalDoses() {
  // Triggered on peso change for regional screen
}

/* ══════════════════════════════════════════
   10. GASOMETRIA SIMPLES (Tela VM)
   ══════════════════════════════════════════ */
function interp() {
  const ph = parseFloat(document.getElementById('g-ph').value);
  const co2 = parseFloat(document.getElementById('g-co2').value);
  const hco3 = parseFloat(document.getElementById('g-hco3').value);
  const po2 = parseFloat(document.getElementById('g-po2').value);
  const na = parseFloat(document.getElementById('g-na').value);
  const cl = parseFloat(document.getElementById('g-cl').value);
  const lac = parseFloat(document.getElementById('g-lac').value);
  const fio2 = parseFloat(document.getElementById('g-fio2').value);

  const out = document.getElementById('gaso-output');
  if (!ph || !co2 || !hco3) {
    out.innerHTML = '<div class="alert a-blue">Preencha pH, PaCO₂ e HCO₃⁻ para interpretação.</div>';
    return;
  }

  let disturb = '', color = 'a-green', primary = '';

  // pH
  if (ph < 7.35) { disturb = 'ACIDEMIA'; color = 'a-red'; }
  else if (ph > 7.45) { disturb = 'ALCALEMIA'; color = 'a-orange'; }
  else { disturb = 'pH NORMAL'; color = 'a-green'; }

  // Primary disturbance
  if (ph < 7.35) {
    if (co2 > 45) primary = 'Acidose RESPIRATÓRIA';
    else if (hco3 < 22) primary = 'Acidose METABÓLICA';
    else primary = 'Misto / aguardar mais dados';
  } else if (ph > 7.45) {
    if (co2 < 35) primary = 'Alcalose RESPIRATÓRIA';
    else if (hco3 > 26) primary = 'Alcalose METABÓLICA';
    else primary = 'Misto / aguardar mais dados';
  } else {
    if (co2 > 45 && hco3 > 26) primary = 'Acidose resp. COMPENSADA (crônica)';
    else if (co2 < 35 && hco3 < 22) primary = 'Alcalose resp. COMPENSADA (crônica)';
    else primary = 'Gasometria NORMAL';
  }

  // Anion Gap
  let agText = '';
  if (na && cl) {
    const ag = na - (cl + hco3);
    if (ag > 12) agText = `<div class="alert a-red" style="margin-top:6px"><strong>AG = ${ag.toFixed(0)} mEq/L (ELEVADO >12)</strong> → Ácido acumulado: DKA, uremia, lactato, tóxicos</div>`;
    else agText = `<div class="alert a-green" style="margin-top:6px"><strong>AG = ${ag.toFixed(0)} mEq/L (normal)</strong> → Perda de base: diarreia, NaCl, ATR</div>`;
  }

  // P/F ratio
  let hipoxText = '';
  if (po2 && fio2) {
    const pf = po2 / (fio2 / 100);
    let pfl = '';
    if (pf > 300) pfl = `<span class="tag tg">P/F ${Math.round(pf)} — NORMAL</span>`;
    else if (pf > 200) pfl = `<span class="tag ty">P/F ${Math.round(pf)} — ARDS LEVE</span>`;
    else if (pf > 100) pfl = `<span class="tag tr">P/F ${Math.round(pf)} — ARDS MODERADO</span>`;
    else pfl = `<span class="tag tr">P/F ${Math.round(pf)} — ARDS GRAVE</span>`;
    hipoxText = `<div style="margin-top:6px">Índice P/F: ${pfl}</div>`;
  }

  // Lactate
  let lacText = '';
  if (lac) {
    if (lac > 4) lacText = `<div class="alert a-red" style="margin-top:6px"><strong>Lactato ${lac} mmol/L — ELEVADO GRAVE (>4)</strong> → Hipoperfusão severa / choque</div>`;
    else if (lac > 2) lacText = `<div class="alert a-orange" style="margin-top:6px"><strong>Lactato ${lac} mmol/L — ELEVADO (2–4)</strong> → Hipoperfusão / hipóxia tecidual</div>`;
    else lacText = `<div class="alert a-green" style="margin-top:6px"><strong>Lactato ${lac} mmol/L — Normal</strong></div>`;
  }

  const html = `
    <div class="gaso-result ${color}"><strong>${disturb}</strong> — ${primary}</div>
    <table class="pt" style="margin-top:8px">
      <tr><td>pH</td><td class="${ph < 7.35 ? 'vb' : ph > 7.45 ? 'vb' : 'vg'}">${ph} ${ph < 7.35 ? '↓ ACIDEMIA' : ph > 7.45 ? '↑ ALCALEMIA' : '✓ normal'}</td></tr>
      <tr><td>PaCO₂</td><td class="${co2 > 45 ? 'vb' : co2 < 35 ? 'vb' : 'vg'}">${co2} mmHg ${co2 > 45 ? '↑' : co2 < 35 ? '↓' : '✓'}</td></tr>
      <tr><td>HCO₃⁻</td><td class="${hco3 < 22 ? 'vb' : hco3 > 26 ? 'vb' : 'vg'}">${hco3} mEq/L ${hco3 < 22 ? '↓' : hco3 > 26 ? '↑' : '✓'}</td></tr>
      ${po2 ? `<tr><td>PaO₂</td><td class="${po2 < 60 ? 'vb' : po2 < 80 ? 'vw' : 'vg'}">${po2} mmHg ${po2 < 60 ? '↓ HIPOXEMIA' : '✓'}</td></tr>` : ''}
    </table>
    ${agText}${lacText}${hipoxText}
  `;
  out.innerHTML = html;
}

/* ══════════════════════════════════════════
   11. PATHOLOGY VM
   ══════════════════════════════════════════ */
function showPath(id, btn) {
  document.querySelectorAll('.path-detail').forEach(p => p.classList.remove('show'));
  document.querySelectorAll('.path-chip').forEach(c => c.classList.remove('active'));
  const el = document.getElementById('path-' + id);
  if (el) el.classList.add('show');
  btn.classList.add('active');
}

/* ══════════════════════════════════════════
   12. ESCALAS CLÍNICAS
   ══════════════════════════════════════════ */

// --- GCS ---
const gcsScores = { e: 0, v: 0, m: 0 };
function selectGCS(domain, val, btn) {
  gcsScores[domain] = val;
  // Highlight active button
  const group = btn.closest('.scale-group');
  if (group) group.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Calculate total
  const total = gcsScores.e + gcsScores.v + gcsScores.m;
  const res = document.getElementById('gcs-result');
  const interp = document.getElementById('gcs-interp');
  if (total > 0) {
    res.textContent = 'GCS = ' + total + ' (E' + gcsScores.e + ' V' + gcsScores.v + ' M' + gcsScores.m + ')';
    let desc = '';
    if (total <= 8) desc = '⚠️ GRAVE — considerar IOT protetora';
    else if (total <= 12) desc = '⚡ MODERADO — monitorização contínua';
    else desc = '✅ LEVE — monitorização padrão';
    interp.textContent = desc;
    interp.style.display = 'block';
    res.style.display = 'block';
  }
}

// --- RASS ---
function selectRASS(btn, val) {
  document.querySelectorAll('#sc-neuro .scale-btn[onclick*="selectRASS"]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const res = document.getElementById('rass-result');
  const labels = {
    '-5': 'Irresponsivo',
    '-4': 'Sedação profunda',
    '-3': 'Sedação moderada',
    '-2': 'Sedação leve',
    '-1': 'Sonolento',
    '0': 'Alerta e calmo',
    '1': 'Inquieto',
    '2': 'Agitado',
    '3': 'Muito agitado',
    '4': 'Combativo'
  };
  const label = labels[String(val)] || '';
  let color = val >= 1 ? 'a-orange' : val <= -3 ? 'a-red' : val === 0 ? 'a-green' : 'a-blue';
  res.innerHTML = `<strong>RASS ${val >= 0 ? '+' + val : val}:</strong> ${label}`;
  res.className = 'alert ' + color;
  res.style.display = 'block';
}

// --- RCRI (Escalas Clínicas screen — sc prefix) ---
function scRcriToggle(el) {
  el.classList.toggle('checked');
  const checked = document.querySelectorAll('#sc-rcri-list .ck-item.checked').length;
  const res = document.getElementById('sc-rcri-result');
  const risks = ['0,4%', '0,9%', '6,6%', '11%', '>11%'];
  const labels = [
    'Muito baixo risco',
    'Baixo risco',
    'Risco intermediário — considerar avaliação cardiológica',
    'Alto risco — avaliação cardiológica obrigatória',
    'Alto risco — avaliação cardiológica obrigatória'
  ];
  const colors = ['a-green', 'a-green', 'a-orange', 'a-red', 'a-red'];
  if (checked > 0) {
    const idx = Math.min(checked - 1, 4);
    res.style.display = 'block';
    res.className = 'alert ' + colors[idx];
    res.innerHTML = '<strong>RCRI ' + checked + ':</strong> Risco MACE ' + risks[idx] + ' — ' + labels[idx];
  } else {
    res.style.display = 'none';
  }
}

// --- RCRI (CalcAvançadas tab — ca prefix) ---
function rcriToggle(el) {
  el.classList.toggle('checked');
  const checked = document.querySelectorAll('#rcri-list .ck-item.checked').length;
  const res = document.getElementById('rcri-result');
  const risks = ['0,4%', '0,9%', '6,6%', '11%', '>11%'];
  const labels = [
    'Muito baixo risco',
    'Baixo risco',
    'Risco intermediário — considerar avaliação cardiológica',
    'Alto risco — avaliação cardiológica obrigatória',
    'Alto risco — avaliação cardiológica obrigatória'
  ];
  const colors = ['a-green', 'a-green', 'a-orange', 'a-red', 'a-red'];
  if (checked > 0) {
    const idx = Math.min(checked - 1, 4);
    res.style.display = 'block';
    res.className = 'alert ' + colors[idx];
    res.innerHTML = '<strong>RCRI ' + checked + ':</strong> Risco MACE ' + risks[idx] + ' — ' + labels[idx];
  } else {
    res.style.display = 'none';
  }
}

// --- CAM-ICU ---
function camToggle(el) {
  el.classList.toggle('checked');
  const total = document.querySelectorAll('#cam-list .ck-item.checked').length;
  const res = document.getElementById('cam-result');
  // CAM-ICU: positive if ≥2 features (altered consciousness + inattention + either disorganized thinking or altered LOC)
  if (total >= 2) {
    res.style.display = 'block';
    res.className = 'alert a-red';
    res.innerHTML = '<strong>CAM-ICU POSITIVO (' + total + ' critérios)</strong> — Delirium provável. Investigar causas reversíveis.';
  } else if (total === 1) {
    res.style.display = 'block';
    res.className = 'alert a-orange';
    res.innerHTML = '<strong>CAM-ICU: 1 critério</strong> — Monitorizar. Reavaliar em 8h.';
  } else {
    res.style.display = 'block';
    res.className = 'alert a-green';
    res.innerHTML = '<strong>CAM-ICU NEGATIVO</strong> — Sem delirium atual.';
  }
}

// --- Killip ---
function selectKillip(btn, val) {
  document.querySelectorAll('[onclick*="selectKillip"]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const killipData = {
    1: { desc: 'Sem sinais de IC', mort: '~6%', color: 'a-green' },
    2: { desc: 'Estertores, B3, congestão pulmonar', mort: '~17%', color: 'a-orange' },
    3: { desc: 'Edema agudo de pulmão', mort: '~38%', color: 'a-red' },
    4: { desc: 'Choque cardiogênico', mort: '~81%', color: 'a-red' }
  };
  const k = killipData[val];
  const container = btn.closest('.card-body').querySelector('[id*="killip"]') || btn.closest('.tab-panel').querySelector('.score-display');
  // Try to find a display area nearby
  let res = btn.closest('.card-body').querySelector('.alert');
  if (!res) {
    res = document.createElement('div');
    res.style.marginTop = '8px';
    btn.closest('.card-body').appendChild(res);
  }
  res.className = 'alert ' + k.color;
  res.innerHTML = `<strong>Killip ${val}:</strong> ${k.desc}<br>Mortalidade hospitalar: ${k.mort}`;
  res.style.display = 'block';
}

// --- Aldrete ---
const aldreteScores = { ativ: -1, resp: -1, circ: -1, consc: -1, spo2: -1 };
function selectAldrete(domain, val, btn) {
  aldreteScores[domain] = val;
  const group = btn.closest('.scale-group');
  if (group) group.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Calculate total
  const vals = Object.values(aldreteScores).filter(v => v >= 0);
  const total = vals.reduce((a, b) => a + b, 0);
  const res = document.getElementById('aldrete-result');
  const interp = document.getElementById('aldrete-interp');
  if (vals.length > 0) {
    res.textContent = 'Aldrete = ' + total + '/10';
    res.style.display = 'block';
    if (total >= 9) {
      interp.textContent = '✅ ≥9 — Critério de alta da SRPA atingido';
      interp.className = 'alert a-green';
    } else if (total >= 7) {
      interp.textContent = '⚡ 7-8 — Manter observação. Reavaliar em 15min.';
      interp.className = 'alert a-orange';
    } else {
      interp.textContent = '⚠️ <7 — NÃO liberar. Monitorização intensiva.';
      interp.className = 'alert a-red';
    }
    interp.style.display = 'block';
  }
}

// --- Bromage ---
function selectBromage(btn, val) {
  document.querySelectorAll('[onclick*="selectBromage"]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const res = document.getElementById('bromage-result');
  const data = {
    0: { desc: 'Sem bloqueio motor — movimenta membros livremente', color: 'a-green' },
    1: { desc: 'Bloqueio parcial — flexiona joelho, move pé', color: 'a-blue' },
    2: { desc: 'Bloqueio quase completo — move somente pé', color: 'a-orange' },
    3: { desc: 'Bloqueio completo — sem movimento de MMII', color: 'a-red' }
  };
  const d = data[val];
  res.className = 'alert ' + d.color;
  res.innerHTML = `<strong>Bromage ${val}:</strong> ${d.desc}`;
  res.style.display = 'block';
}

// --- EVA ---
function updateEVA(val) {
  const v = parseInt(val);
  const display = document.getElementById('eva-value');
  const result = document.getElementById('eva-result');
  if (display) display.textContent = v;
  // Update slider color
  const slider = document.getElementById('eva-slider');
  if (slider) {
    const pct = v * 10;
    slider.style.background = `linear-gradient(to right, #1A7A4A ${Math.min(pct,30)}%, #E8A020 ${Math.min(pct,60)}%, #C0392B ${pct}%, #E8ECF2 ${pct}%)`;
  }
  if (result) {
    if (v <= 3) {
      result.className = 'alert a-green';
      result.innerHTML = '<strong>EVA ' + v + '/10 — DOR LEVE</strong><br>Dipirona 1g IV + Paracetamol 1g IV ± AINE';
    } else if (v <= 6) {
      result.className = 'alert a-orange';
      result.innerHTML = '<strong>EVA ' + v + '/10 — DOR MODERADA</strong><br>+ Tramadol 100mg IV ou Codeína VO + Bloqueio regional';
    } else {
      result.className = 'alert a-red';
      result.innerHTML = '<strong>EVA ' + v + '/10 — DOR INTENSA</strong><br>+ Morfina titulação 2-4mg IV q5min até EVA<4; ou Fentanil 25-50mcg IV. Considerar cetamina resgate.';
    }
    result.style.display = 'block';
  }
}

/* ══════════════════════════════════════════
   13. APFEL SCORE
   ══════════════════════════════════════════ */
function apfelToggle(el) {
  el.classList.toggle('checked');
  const checked = document.querySelectorAll('#apfel-list .ck-item.checked').length;
  const res = document.getElementById('apfel-result');
  const risks = ['10%', '21%', '39%', '61%', '79%'];
  const conduta = [
    'Sem profilaxia de rotina',
    'Considerar 1 antiemético (ondansetrona 4mg OU dexametasona 4-8mg)',
    '2 antieméticos de classes diferentes (ondansetrona 4mg + dexametasona 8mg)',
    '2+ antieméticos + considerar TIVA (ondansetrona + dexametasona + droperidol 0,625mg)',
    '2+ antieméticos + TIVA + scopolamina patch'
  ];
  res.style.display = 'block';
  if (checked >= 3) {
    res.className = 'alert a-red';
  } else if (checked === 2) {
    res.className = 'alert a-orange';
  } else {
    res.className = 'alert a-green';
  }
  res.innerHTML = '<strong>Apfel ' + checked + ': Risco PONV ' + risks[checked] + '</strong><br>' + conduta[checked];
}

// ERAS Apfel (duplicate for ERAS screen)
function erApfelToggle(el) {
  el.classList.toggle('checked');
  const checked = document.querySelectorAll('#er-apfel-list .ck-item.checked').length;
  const res = document.getElementById('er-apfel-result');
  const risks = ['10%', '21%', '39%', '61%', '79%'];
  const conduta = [
    'Sem profilaxia de rotina',
    'Considerar 1 antiemético (ondansetrona 4mg OU dexametasona 4-8mg)',
    '2 antieméticos de classes diferentes',
    '2+ antieméticos + considerar TIVA',
    '2+ antieméticos + TIVA + scopolamina patch'
  ];
  res.style.display = 'block';
  if (checked >= 3) res.className = 'alert a-red';
  else if (checked === 2) res.className = 'alert a-orange';
  else res.className = 'alert a-green';
  res.innerHTML = '<strong>Apfel ' + checked + ': Risco PONV ' + risks[checked] + '</strong><br>' + conduta[checked];
}

/* ══════════════════════════════════════════
   14. CALCULADORAS AVANÇADAS
   ══════════════════════════════════════════ */

// --- 14a. Peso Ideal / Ajustado / Magro ---
function calcPesos() {
  const real = parseFloat(document.getElementById('pw-real').value);
  const alt = parseFloat(document.getElementById('pw-alt').value);
  const sex = document.getElementById('pw-sex').value;
  const out = document.getElementById('pw-results');
  const table = document.getElementById('pw-table');

  if (!real || !alt) {
    out.innerHTML = '<div class="alert a-blue">Informe peso real e altura.</div>';
    if (table) table.style.display = 'none';
    return;
  }

  const altM = alt / 100;
  const imc = real / (altM * altM);
  const ibw = sex === 'm' ? 50 + 0.91 * (alt - 152.4) : 45.5 + 0.91 * (alt - 152.4);
  const ibwSafe = Math.max(ibw, 30);
  const pa = ibwSafe + 0.4 * (real - ibwSafe);
  const lbw = sex === 'm'
    ? (9270 * real) / (6680 + 216 * imc)
    : (9270 * real) / (8780 + 244 * imc);

  let imcClass = '';
  if (imc < 18.5) imcClass = 'Baixo peso';
  else if (imc < 25) imcClass = 'Eutrófico';
  else if (imc < 30) imcClass = 'Sobrepeso';
  else if (imc < 35) imcClass = 'Obesidade grau I';
  else if (imc < 40) imcClass = 'Obesidade grau II';
  else imcClass = 'Obesidade grau III (mórbida)';

  const sexLabel = sex === 'm' ? '♂' : '♀';
  const ibwBase = sex === 'm' ? '50' : '45,5';

  out.innerHTML = `
    <div class="formula-box">
      <div class="formula-label">IMC</div>
      <div class="formula-eq">${real} ÷ (${altM.toFixed(2)})² = <strong>${imc.toFixed(1)} kg/m²</strong> — ${imcClass}</div>
    </div>
    <div class="formula-box">
      <div class="formula-label">Peso Ideal (IBW) ${sexLabel}</div>
      <div class="formula-eq">${ibwBase} + 0,91 × (${alt} − 152,4) = <strong>${ibwSafe.toFixed(1)} kg</strong></div>
    </div>
    <div class="formula-box">
      <div class="formula-label">Peso Ajustado (PA)</div>
      <div class="formula-eq">${ibwSafe.toFixed(1)} + 0,4 × (${real} − ${ibwSafe.toFixed(1)}) = <strong>${pa.toFixed(1)} kg</strong></div>
    </div>
    <div class="formula-box">
      <div class="formula-label">Peso Magro (LBW) ${sexLabel}</div>
      <div class="formula-eq">(9270 × ${real}) ÷ (${sex === 'm' ? '6680' : '8780'} + ${sex === 'm' ? '216' : '244'} × ${imc.toFixed(1)}) = <strong>${lbw.toFixed(1)} kg</strong></div>
    </div>
  `;
  out.style.display = 'block';

  // Drug weight table
  if (table) {
    table.innerHTML = `
      <table class="pt">
        <thead><tr><th style="white-space:nowrap">Droga</th><th>Peso a usar</th><th>Valor</th></tr></thead>
        <tbody>
          <tr><td>Propofol indução</td><td>LBW</td><td class="vg">${lbw.toFixed(0)} kg</td></tr>
          <tr><td>Propofol manutenção</td><td>PA</td><td class="vg">${pa.toFixed(0)} kg</td></tr>
          <tr><td>Succinilcolina</td><td>Peso Real</td><td class="vg">${real} kg</td></tr>
          <tr><td>Rocurônio</td><td>IBW</td><td class="vg">${ibwSafe.toFixed(0)} kg</td></tr>
          <tr><td>Opioides</td><td>IBW</td><td class="vg">${ibwSafe.toFixed(0)} kg</td></tr>
          <tr><td>Sugamadex</td><td>Peso Real</td><td class="vg">${real} kg</td></tr>
          <tr><td>BZD</td><td>LBW</td><td class="vg">${lbw.toFixed(0)} kg</td></tr>
          <tr><td>VC (ventilação)</td><td>IBW</td><td class="vg">${ibwSafe.toFixed(0)} kg</td></tr>
          <tr><td>Cetamina TIVA</td><td>LBW</td><td class="vg">${lbw.toFixed(0)} kg</td></tr>
        </tbody>
      </table>
    `;
    table.style.display = 'block';
  }
}

// --- 14b. Infusão em Bomba ---
const infDrugs = {
  nora: { name: 'Noradrenalina', prep: '4mg/250mL ou 8mg/250mL', conc16: 16, conc32: 32, unit: 'mcg/kg/min', range: '0,05–0,5' },
  dopa: { name: 'Dopamina', prep: '250mg/250mL', conc: 1000, unit: 'mcg/kg/min', range: '2–20' },
  dobu: { name: 'Dobutamina', prep: '250mg/250mL', conc: 1000, unit: 'mcg/kg/min', range: '2–20' },
  nitro: { name: 'Nitroglicerina', prep: '50mg/250mL', conc: 200, unit: 'mcg/min', range: '5–200' },
  remi: { name: 'Remifentanil', prep: '2mg/40mL', conc: 50, unit: 'mcg/kg/min', range: '0,05–0,5' },
  prop: { name: 'Propofol 1%', prep: '200mg/20mL', conc: 10000, unit: 'mg/kg/h', range: '4–12' },
  dex: { name: 'Dexmedetomidina', prep: '200mcg/50mL', conc: 4, unit: 'mcg/kg/h', range: '0,2–0,7' }
};

function updateInfDrug() {
  const sel = document.getElementById('inf-droga').value;
  const drug = infDrugs[sel];
  const prep = document.getElementById('inf-prep');
  const info = document.getElementById('inf-formula');
  if (drug && prep) {
    prep.textContent = drug.prep;
    if (info) info.textContent = drug.name + ': ' + drug.range + ' ' + drug.unit;
  }
  calcInfusion();
}

function calcInfusion() {
  const sel = document.getElementById('inf-droga').value;
  const drug = infDrugs[sel];
  if (!drug) return;
  const conc = parseFloat(document.getElementById('inf-conc').value);
  const dose = parseFloat(document.getElementById('inf-dose').value);
  const peso = pesoGlobal || parseFloat(document.getElementById('inf-vel').value) || 0;
  const res = document.getElementById('inf-result');
  const doseRes = document.getElementById('inf-dose-result');

  if (!conc || !dose) {
    if (res) res.innerHTML = '';
    return;
  }

  // Calculate velocity: dose × weight × 60 / concentration
  let vel = 0;
  if (drug.unit.includes('kg')) {
    vel = (dose * (pesoGlobal || 70) * 60) / conc;
  } else {
    vel = (dose * 60) / conc;
  }

  if (res) {
    let formula = '';
    if (drug.unit.includes('kg')) {
      formula = `${dose} ${drug.unit} × ${pesoGlobal || 70} kg × 60 ÷ ${conc} mcg/mL`;
    } else {
      formula = `${dose} ${drug.unit} × 60 ÷ ${conc} mcg/mL`;
    }
    res.innerHTML = `
      <div class="formula-box">
        <div class="formula-label">Velocidade de Infusão</div>
        <div class="formula-eq">${formula} = <strong>${vel.toFixed(1)} mL/h</strong></div>
      </div>
    `;
  }

  var _drugConc = {nora:16,adre:16,dopa:1000,dobu:1000,dexm:4,remi:50,ntg:200,ntp:200};
  var _wrapEl = document.getElementById('inf-mlh-wrap');
  var _mlhEl = document.getElementById('inf-mlh');
  if (_drugConc[drug] && p && !isNaN(dose)) {
    var _mult = (drug === 'dexm') ? 1 : 60;
    var _mlh = (dose * p * _mult) / _drugConc[drug];
    if (_mlhEl) _mlhEl.textContent = _mlh.toFixed(1) + ' ml/h';
    if (_wrapEl) _wrapEl.style.display = 'block';
  } else {
    if (_wrapEl) _wrapEl.style.display = 'none';
  }
}

function calcInfInverse() {
  const sel = document.getElementById('inf-droga').value;
  const drug = infDrugs[sel];
  if (!drug) return;
  const conc = parseFloat(document.getElementById('inf-conc-inv').value);
  const vel = parseFloat(document.getElementById('inf-vel-inv').value);
  const res = document.getElementById('inf-dose-result');

  if (!conc || !vel) { if (res) res.innerHTML = ''; return; }

  let dose = 0;
  if (drug.unit.includes('kg')) {
    dose = (vel * conc) / ((pesoGlobal || 70) * 60);
  } else {
    dose = (vel * conc) / 60;
  }

  if (res) {
    res.innerHTML = `
      <div class="formula-box">
        <div class="formula-label">Dose Atual</div>
        <div class="formula-eq">${vel} mL/h × ${conc} mcg/mL ÷ (${pesoGlobal || 70} kg × 60) = <strong>${dose.toFixed(3)} ${drug.unit}</strong></div>
      </div>
    `;
  }
}

// Advanced infusion calc (calcavancadas tab)
function advInfDrug() {
  const sel = document.getElementById('adv-inf-droga');
  if (!sel) return;
  const drug = infDrugs[sel.value];
  const info = document.getElementById('adv-inf-info');
  if (drug && info) {
    info.textContent = drug.name + ': ' + drug.range + ' ' + drug.unit + ' | Preparo: ' + drug.prep;
  }
  advCalcInf();
}

function advCalcInf() {
  const sel = document.getElementById('adv-inf-droga');
  if (!sel) return;
  const drug = infDrugs[sel.value];
  if (!drug) return;
  const conc = parseFloat(document.getElementById('adv-inf-conc').value);
  const dose = parseFloat(document.getElementById('adv-inf-dose').value);
  const peso = parseFloat(document.getElementById('adv-inf-peso').value) || pesoGlobal || 70;
  const res = document.getElementById('adv-inf-result');
  if (!conc || !dose || !res) return;

  let vel = 0;
  if (drug.unit.includes('kg')) {
    vel = (dose * peso * 60) / conc;
  } else {
    vel = (dose * 60) / conc;
  }
  let formula = drug.unit.includes('kg')
    ? `${dose} × ${peso} kg × 60 ÷ ${conc} mcg/mL`
    : `${dose} × 60 ÷ ${conc} mcg/mL`;

  res.innerHTML = `
    <div class="formula-box">
      <div class="formula-label">Velocidade de Infusão</div>
      <div class="formula-eq">${formula} = <strong>${vel.toFixed(1)} mL/h</strong></div>
    </div>
  `;
}

function advCalcInfInv() {
  const sel = document.getElementById('adv-inf-droga');
  if (!sel) return;
  const drug = infDrugs[sel.value];
  if (!drug) return;
  const conc = parseFloat(document.getElementById('adv-inf-conc').value);
  const vel = parseFloat(document.getElementById('adv-inf-vel').value);
  const peso = parseFloat(document.getElementById('adv-inf-peso').value) || pesoGlobal || 70;
  const res = document.getElementById('adv-inf-inv-result');
  if (!conc || !vel || !res) return;

  let dose = drug.unit.includes('kg')
    ? (vel * conc) / (peso * 60)
    : (vel * conc) / 60;

  res.innerHTML = `
    <div class="formula-box">
      <div class="formula-label">Dose Atual</div>
      <div class="formula-eq">${vel} mL/h × ${conc} ÷ (${peso} × 60) = <strong>${dose.toFixed(3)} ${drug.unit}</strong></div>
    </div>
  `;
}

// --- 14c. Gasometria Avançada ---
function calcGasoAdv() {
  const ph = parseFloat(document.getElementById('ga-ph').value);
  const co2 = parseFloat(document.getElementById('ga-co2').value);
  const hco3 = parseFloat(document.getElementById('ga-hco3').value);
  const po2 = parseFloat(document.getElementById('ga-po2').value);
  const na = parseFloat(document.getElementById('ga-na').value);
  const cl = parseFloat(document.getElementById('ga-cl').value);
  const k = parseFloat(document.getElementById('ga-k').value);
  const lac = parseFloat(document.getElementById('ga-lac').value);
  const fio2 = parseFloat(document.getElementById('ga-fio2').value);
  const alb = parseFloat(document.getElementById('ga-alb').value);
  const res = document.getElementById('ga-results');

  if (!ph || !co2 || !hco3) {
    res.innerHTML = '<div class="alert a-blue">Preencha pH, PaCO₂ e HCO₃⁻.</div>';
    return;
  }

  let html = '';

  // 1. pH Classification
  let disturb = '', color = 'a-green';
  if (ph < 7.35) { disturb = 'ACIDEMIA'; color = 'a-red'; }
  else if (ph > 7.45) { disturb = 'ALCALEMIA'; color = 'a-orange'; }
  else { disturb = 'pH NORMAL'; color = 'a-green'; }

  // 2. Primary disturbance
  let primary = '';
  if (ph < 7.35) {
    if (co2 > 45) primary = 'Acidose RESPIRATÓRIA';
    else if (hco3 < 22) primary = 'Acidose METABÓLICA';
    else primary = 'Distúrbio misto';
  } else if (ph > 7.45) {
    if (co2 < 35) primary = 'Alcalose RESPIRATÓRIA';
    else if (hco3 > 26) primary = 'Alcalose METABÓLICA';
    else primary = 'Distúrbio misto';
  } else {
    if (co2 > 45 && hco3 > 26) primary = 'Acidose resp. compensada';
    else if (co2 < 35 && hco3 < 22) primary = 'Alcalose resp. compensada';
    else primary = 'Gasometria normal';
  }

  html += `<div class="gaso-result ${color}"><strong>${disturb}</strong> — ${primary}</div>`;

  // 3. Values table
  html += `<table class="pt" style="margin-top:8px">
    <tr><td>pH</td><td class="${ph<7.35?'vb':ph>7.45?'vb':'vg'}">${ph}</td></tr>
    <tr><td>PaCO₂</td><td class="${co2>45?'vb':co2<35?'vb':'vg'}">${co2} mmHg</td></tr>
    <tr><td>HCO₃⁻</td><td class="${hco3<22?'vb':hco3>26?'vb':'vg'}">${hco3} mEq/L</td></tr>
    ${po2 ? `<tr><td>PaO₂</td><td class="${po2<60?'vb':'vg'}">${po2} mmHg</td></tr>` : ''}
  </table>`;

  // 4. Anion Gap
  if (na && cl) {
    const ag = na - (cl + hco3);
    const agCorr = alb ? ag + 2.5 * (4 - alb) : ag;
    html += `<div class="formula-box" style="margin-top:8px">
      <div class="formula-label">Ânion Gap</div>
      <div class="formula-eq">AG = ${na} − (${cl} + ${hco3}) = <strong>${ag.toFixed(1)} mEq/L</strong> ${ag > 12 ? '⚠️ ELEVADO' : '✓ normal'}</div>
    </div>`;
    if (alb) {
      html += `<div class="formula-box">
        <div class="formula-label">AG Corrigido (albumina)</div>
        <div class="formula-eq">AG + 2,5 × (4 − ${alb}) = <strong>${agCorr.toFixed(1)} mEq/L</strong></div>
      </div>`;
    }
    // Delta-delta
    if (ag > 12 && hco3 < 24) {
      const dd = (ag - 12) / (24 - hco3);
      let ddInterp = '';
      if (dd < 0.4) ddInterp = 'AG elevado + acidose hiperclorêmica';
      else if (dd <= 1) ddInterp = 'Acidose metabólica AG elevado pura';
      else if (dd <= 2) ddInterp = 'AM AG elevado + possível componente misto';
      else ddInterp = 'AM AG elevado + alcalose metabólica concomitante';
      html += `<div class="formula-box">
        <div class="formula-label">Delta-Delta (ΔΔ)</div>
        <div class="formula-eq">(${ag.toFixed(0)} − 12) ÷ (24 − ${hco3}) = <strong>${dd.toFixed(2)}</strong> → ${ddInterp}</div>
      </div>`;
    }
  }

  // 5. Compensation
  html += '<div class="formula-box" style="margin-top:8px"><div class="formula-label">Compensação Esperada</div>';
  if (ph < 7.35 && hco3 < 22) {
    // Metabolic acidosis — Winter's formula
    const pco2Exp = 1.5 * hco3 + 8;
    const match = Math.abs(co2 - pco2Exp) <= 2;
    html += `<div class="formula-eq">Winter: PCO₂ esp = 1,5 × ${hco3} + 8 = <strong>${pco2Exp.toFixed(0)} ± 2 mmHg</strong><br>PCO₂ atual: ${co2} → ${match ? '✅ Compensação adequada' : '⚠️ Distúrbio misto'}</div>`;
  } else if (ph < 7.35 && co2 > 45) {
    // Respiratory acidosis
    const dCO2 = co2 - 40;
    const acuteHCO3 = 24 + 0.1 * dCO2;
    const chronicHCO3 = 24 + 0.35 * dCO2;
    html += `<div class="formula-eq">Aguda: HCO₃ esp = 24 + 0,1 × (${co2}-40) = <strong>${acuteHCO3.toFixed(1)}</strong><br>Crônica: HCO₃ esp = 24 + 0,35 × (${co2}-40) = <strong>${chronicHCO3.toFixed(1)}</strong><br>HCO₃ atual: ${hco3}</div>`;
  } else if (ph > 7.45 && co2 < 35) {
    const dCO2 = 40 - co2;
    const acuteHCO3 = 24 - 0.2 * dCO2;
    const chronicHCO3 = 24 - 0.5 * dCO2;
    html += `<div class="formula-eq">Aguda: HCO₃ esp = 24 − 0,2 × (40-${co2}) = <strong>${acuteHCO3.toFixed(1)}</strong><br>Crônica: HCO₃ esp = 24 − 0,5 × (40-${co2}) = <strong>${chronicHCO3.toFixed(1)}</strong><br>HCO₃ atual: ${hco3}</div>`;
  } else if (ph > 7.45 && hco3 > 26) {
    const pco2Exp = 0.7 * hco3 + 21;
    const match = Math.abs(co2 - pco2Exp) <= 2;
    html += `<div class="formula-eq">PCO₂ esp = 0,7 × ${hco3} + 21 = <strong>${pco2Exp.toFixed(0)} ± 2</strong><br>PCO₂ atual: ${co2} → ${match ? '✅ Compensação adequada' : '⚠️ Distúrbio misto'}</div>`;
  } else {
    html += '<div class="formula-eq">Gasometria dentro da normalidade</div>';
  }
  html += '</div>';

  // 6. P/F Ratio
  if (po2 && fio2) {
    const pf = po2 / (fio2 / 100);
    let pfClass = pf > 300 ? 'NORMAL' : pf > 200 ? 'ARDS LEVE' : pf > 100 ? 'ARDS MODERADO' : 'ARDS GRAVE';
    let pfColor = pf > 300 ? 'a-green' : pf > 200 ? 'a-orange' : 'a-red';
    html += `<div class="formula-box">
      <div class="formula-label">Relação P/F</div>
      <div class="formula-eq">${po2} ÷ (${fio2}/100) = <strong>${Math.round(pf)}</strong> → <span class="tag ${pf>300?'tg':pf>200?'ty':'tr'}">${pfClass}</span></div>
    </div>`;
  }

  // 7. Lactate
  if (lac) {
    let lacColor = lac > 4 ? 'a-red' : lac > 2 ? 'a-orange' : 'a-green';
    let lacLabel = lac > 4 ? 'GRAVE (>4) — choque/hipoperfusão severa' : lac > 2 ? 'ELEVADO (2-4) — hipoperfusão' : 'Normal';
    html += `<div class="alert ${lacColor}" style="margin-top:6px"><strong>Lactato ${lac} mmol/L — ${lacLabel}</strong></div>`;
  }

  res.innerHTML = html;
}

// --- 14d. Fluidos Intraoperatórios ---
function calcFluidos() {
  const peso = parseFloat(document.getElementById('fl-peso').value) || pesoGlobal || 0;
  const jejum = parseFloat(document.getElementById('fl-jejum').value);
  const tipo = document.getElementById('fl-tipo').value;
  const res = document.getElementById('fl-results');

  if (!peso || !jejum) {
    res.innerHTML = '<div class="alert a-blue">Informe peso e horas de jejum.</div>';
    return;
  }

  // 4-2-1 rule
  let manut = 0;
  if (peso <= 10) manut = peso * 4;
  else if (peso <= 20) manut = 40 + (peso - 10) * 2;
  else manut = 60 + (peso - 20);

  const deficit = manut * jejum;

  // Surgical losses
  const lossRate = parseFloat(tipo) || 3;
  const surgLoss = lossRate * peso;

  // Replacement schedule
  const h1 = Math.round(manut + deficit * 0.5 + surgLoss);
  const h2 = Math.round(manut + deficit * 0.25 + surgLoss);
  const h3 = Math.round(manut + deficit * 0.25 + surgLoss);

  let html = `
    <div class="formula-box">
      <div class="formula-label">Manutenção (Regra 4-2-1)</div>
      <div class="formula-eq">`;
  if (peso <= 10) html += `${peso} × 4 = <strong>${manut.toFixed(0)} mL/h</strong>`;
  else if (peso <= 20) html += `(10×4) + (${(peso-10).toFixed(0)}×2) = <strong>${manut.toFixed(0)} mL/h</strong>`;
  else html += `(10×4) + (10×2) + (${(peso-20).toFixed(0)}×1) = <strong>${manut.toFixed(0)} mL/h</strong>`;
  html += `</div></div>
    <div class="formula-box">
      <div class="formula-label">Déficit de Jejum</div>
      <div class="formula-eq">${manut.toFixed(0)} mL/h × ${jejum}h = <strong>${deficit.toFixed(0)} mL</strong></div>
    </div>
    <div class="formula-box">
      <div class="formula-label">Perdas Cirúrgicas Estimadas</div>
      <div class="formula-eq">${lossRate} mL/kg/h × ${peso} kg = <strong>${surgLoss.toFixed(0)} mL/h</strong></div>
    </div>
    <table class="pt" style="margin-top:8px">
      <thead><tr><th>Hora</th><th>Volume Total</th><th>Componentes</th></tr></thead>
      <tbody>
        <tr><td><strong>1ª hora</strong></td><td class="vg"><strong>${h1} mL</strong></td><td>Manutenção ${manut.toFixed(0)} + 50% déficit ${Math.round(deficit*0.5)} + perdas ${surgLoss.toFixed(0)}</td></tr>
        <tr><td><strong>2ª hora</strong></td><td class="vg"><strong>${h2} mL</strong></td><td>Manutenção ${manut.toFixed(0)} + 25% déficit ${Math.round(deficit*0.25)} + perdas ${surgLoss.toFixed(0)}</td></tr>
        <tr><td><strong>3ª hora</strong></td><td class="vg"><strong>${h3} mL</strong></td><td>Manutenção ${manut.toFixed(0)} + 25% déficit ${Math.round(deficit*0.25)} + perdas ${surgLoss.toFixed(0)}</td></tr>
      </tbody>
    </table>
  `;
  res.innerHTML = html;
}

// --- 14e. Clearance de Creatinina ---
function calcClearance() {
  const idade = parseFloat(document.getElementById('cr-idade').value);
  const peso = parseFloat(document.getElementById('cr-peso').value) || pesoGlobal || 0;
  const cr = parseFloat(document.getElementById('cr-cr').value);
  const sex = document.getElementById('cr-sex').value;
  const res = document.getElementById('cr-results');

  if (!idade || !peso || !cr) {
    res.innerHTML = '<div class="alert a-blue">Preencha idade, peso e creatinina sérica.</div>';
    return;
  }

  const mult = sex === 'f' ? 0.85 : 1.0;
  const crcl = ((140 - idade) * peso) / (72 * cr) * mult;

  let stage = '', color = 'a-green';
  if (crcl >= 90) { stage = 'G1 — Normal ou alto'; color = 'a-green'; }
  else if (crcl >= 60) { stage = 'G2 — Levemente reduzido'; color = 'a-blue'; }
  else if (crcl >= 45) { stage = 'G3a — Moderadamente reduzido'; color = 'a-orange'; }
  else if (crcl >= 30) { stage = 'G3b — Moderada a severamente reduzido'; color = 'a-orange'; }
  else if (crcl >= 15) { stage = 'G4 — Severamente reduzido'; color = 'a-red'; }
  else { stage = 'G5 — Falência renal'; color = 'a-red'; }

  const sexLabel = sex === 'f' ? ' × 0,85 (♀)' : '';

  res.innerHTML = `
    <div class="formula-box">
      <div class="formula-label">Cockcroft-Gault</div>
      <div class="formula-eq">[(140 − ${idade}) × ${peso}] ÷ (72 × ${cr})${sexLabel} = <strong>${crcl.toFixed(1)} mL/min</strong></div>
    </div>
    <div class="alert ${color}" style="margin-top:6px">
      <strong>${stage}</strong><br>
      ${crcl < 60 ? '⚠️ Ajustar doses de drogas de eliminação renal (antibióticos, BNM, opioides)' : '✅ Sem necessidade de ajuste renal de rotina'}
    </div>
  `;
}

// --- 14f. Calculadora Raqui ---
function calcRaqui() {
  const peso = parseFloat(document.getElementById('rq-peso').value) || pesoGlobal || 0;
  const alt = parseFloat(document.getElementById('rq-alt').value);
  const proc = document.getElementById('rq-proc').value;
  const res = document.getElementById('rq-results');

  if (!peso || !proc) {
    res.innerHTML = '<div class="alert a-blue">Selecione o procedimento.</div>';
    return;
  }

  const doses = {
    'abd-inf': { label: 'Cirurgia Abdominal Inferior', bupi: [10, 12.5], nivel: 'T10' },
    'abd-alta': { label: 'Cirurgia Abdominal Alta', bupi: [12.5, 15], nivel: 'T6' },
    'cesarea': { label: 'Cesárea', bupi: [10, 12], nivel: 'T4' },
    'mmii': { label: 'Cirurgia MMII', bupi: [10, 12.5], nivel: 'T12-L1' },
    'perineal': { label: 'Cirurgia Perineal', bupi: [7.5, 10], nivel: 'S1-L5' }
  };

  const d = doses[proc];
  if (!d) { res.innerHTML = ''; return; }

  // Adjust for height
  let altAdj = '';
  if (alt) {
    if (alt < 150) altAdj = ' (paciente baixo — considerar dose inferior)';
    else if (alt > 180) altAdj = ' (paciente alto — considerar dose superior)';
  }

  res.innerHTML = `
    <div class="formula-box">
      <div class="formula-label">${d.label} — Nível alvo: ${d.nivel}</div>
      <div class="formula-eq">Bupivacaína hiperbárica 0,5%: <strong>${d.bupi[0]}–${d.bupi[1]} mg</strong>${altAdj}</div>
    </div>
    <table class="pt" style="margin-top:8px">
      <thead><tr><th>Adjuvante IT</th><th>Dose</th><th>Evidência</th></tr></thead>
      <tbody>
        <tr><td>Morfina IT</td><td class="vg">100–200 mcg</td><td>Padrão-ouro analgesia 24h</td></tr>
        <tr><td>Fentanil IT</td><td class="vg">20–25 mcg</td><td>Melhora qualidade do bloqueio</td></tr>
        <tr><td>Clonidina IT</td><td class="vg">15–45 mcg</td><td>Prolonga analgesia</td></tr>
        <tr><td>Dexametasona IT</td><td class="vg">Não recomendada</td><td>Off-label, sem segurança estabelecida no neuroeixo</td></tr>
      </tbody>
    </table>
    ${proc === 'cesarea' ? '<div class="alert a-blue" style="margin-top:6px"><strong>Obs cesárea:</strong> Hipotensão pós-raqui: fenilefrina 1ª linha (50–100 mcg IV ou infusão 25–50 mcg/min); noradrenalina é alternativa (bolus 4–6 mcg IV ou ~0,05 mcg/kg/min) — Kinsella 2018.</div>' : ''}
  `;
}

// --- 14g. TOF Helper ---
function calcTOF() {
  /* Guard: elementos null + value vazio */
  const inp = document.getElementById('tof-input');
  const res = document.getElementById('tof-result');
  if (!inp || !res) return;
  const val = inp.value;
  if (val === '' || val === null || val === undefined) { res.style.display='none'; return; }
  const p = pesoGlobal || 70;

  const tofData = {
    '0': { desc: '0/4 respostas — Bloqueio profundo', action: 'Sugamadex 16 mg/kg = ' + fmt(p*16,'mg'), color: 'a-red' },
    '1': { desc: '1-2/4 respostas — Bloqueio intenso', action: 'Sugamadex 4 mg/kg = ' + fmt(p*4,'mg'), color: 'a-orange' },
    '2': { desc: '1-2/4 respostas — Bloqueio intenso', action: 'Sugamadex 4 mg/kg = ' + fmt(p*4,'mg'), color: 'a-orange' },
    '3': { desc: '3/4 respostas — Bloqueio moderado', action: 'Sugamadex 2 mg/kg = ' + fmt(p*2,'mg'), color: 'a-orange' },
    '4': { desc: '4/4 sem fade — Recuperação parcial', action: 'Sugamadex 2 mg/kg = ' + fmt(p*2,'mg') + ' OU Neostigmina ' + fmtR(0.04,0.07,'mg',p), color: 'a-blue' },
    'ratio': { desc: 'TOF ratio ≥0,9 — Recuperação adequada', action: '✅ Extubação segura. Sem necessidade de reversão.', color: 'a-green' }
  };

  let data;
  if (val === 'ratio') data = tofData.ratio;
  else data = tofData[val];

  if (data) {
    res.className = 'alert ' + data.color;
    res.innerHTML = `<strong>${data.desc}</strong><br>${data.action}`;
    res.style.display = 'block';
  }
}

/* ══════════════════════════════════════════
   15. CRISIS TIMER
   ══════════════════════════════════════════ */
function startCrisisTimer(type) {
  if (crisisInterval) stopCrisisTimer();
  crisisType = type;
  crisisStart = Date.now();
  const container = document.getElementById('crisis-timer-container');
  const box = document.getElementById('crisis-timer-box');
  const typeEl = document.getElementById('crisis-timer-type');
  if (container) container.style.display = 'block';
  if (box) box.style.display = 'flex';
  if (typeEl) typeEl.textContent = '⏱ CRISE: ' + type;

  crisisInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - crisisStart) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    const display = document.getElementById('crisis-timer-display');
    if (display) display.textContent = String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');

    // Audio alerts
    const alert = document.getElementById('crisis-timer-alert');
    if (type === 'PCR' && elapsed > 0 && elapsed % 180 === 0) {
      // Every 3 min for PCR
      playBeep(3);
      if (alert) {
        alert.textContent = '⚠️ ' + min + ' min — ADRENALINA 1mg IV agora!';
        alert.style.display = 'block';
        setTimeout(() => { if (alert) alert.style.display = 'none'; }, 10000);
      }
    } else if (type === 'HM' && elapsed > 0 && elapsed % 300 === 0) {
      playBeep(2);
      if (alert) {
        alert.textContent = '⚠️ ' + min + ' min — Reavaliar Dantrolene + gasometria';
        alert.style.display = 'block';
        setTimeout(() => { if (alert) alert.style.display = 'none'; }, 10000);
      }
    } else if (type === 'ANAFILAXIA' && elapsed > 0 && elapsed % 300 === 0) {
      playBeep(2);
      if (alert) {
        alert.textContent = '⚠️ ' + min + ' min — Reavaliar adrenalina + volume';
        alert.style.display = 'block';
        setTimeout(() => { if (alert) alert.style.display = 'none'; }, 10000);
      }
    }
  }, 1000);
}

function stopCrisisTimer() {
  if (crisisInterval) {
    clearInterval(crisisInterval);
    crisisInterval = null;
  }
}

function resetCrisisTimer() {
  stopCrisisTimer();
  const container = document.getElementById('crisis-timer-container');
  const box = document.getElementById('crisis-timer-box');
  const display = document.getElementById('crisis-timer-display');
  const alert = document.getElementById('crisis-timer-alert');
  if (box) box.style.display = 'none';
  if (container) container.style.display = 'none';
  if (display) display.textContent = '00:00';
  if (alert) alert.style.display = 'none';
}

function playBeep(count) {
  try {
    if (!crisisAudioCtx) crisisAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const osc = crisisAudioCtx.createOscillator();
        const gain = crisisAudioCtx.createGain();
        osc.connect(gain);
        gain.connect(crisisAudioCtx.destination);
        osc.frequency.value = 880;
        osc.type = 'square';
        gain.gain.value = 0.3;
        osc.start(crisisAudioCtx.currentTime);
        osc.stop(crisisAudioCtx.currentTime + 0.15);
      }, i * 250);
    }
  } catch(e) { /* AudioContext not available */ }
}

/* ══════════════════════════════════════════
   16. GLOBAL SEARCH
   ══════════════════════════════════════════ */
const searchIndex = [
  // Plantão
  {termo:'indução anestésica propofol etomidato',tela:'p-plantao',tab:'p-inducao',tabPrefix:'p',tabId:'inducao',desc:'Indução — Plantão Anestésico'},
  {termo:'pré-anestésico avaliação jejum',tela:'p-plantao',tab:'p-pre',tabPrefix:'p',tabId:'pre',desc:'Pré-anestésico — Plantão'},
  {termo:'preparo sala checklist material',tela:'p-plantao',tab:'p-preparo',tabPrefix:'p',tabId:'preparo',desc:'Preparo de sala — Plantão'},
  {termo:'manutenção anestésica inalatória TIVA',tela:'p-plantao',tab:'p-manut',tabPrefix:'p',tabId:'manut',desc:'Manutenção — Plantão'},
  {termo:'extubação despertar emergência',tela:'p-plantao',tab:'p-extub',tabPrefix:'p',tabId:'extub',desc:'Extubação — Plantão'},
  // Especiais
  {termo:'via aérea difícil VAD DAS 2025 laringoscópio',tela:'p-especiais',tab:'e-vad',tabPrefix:'e',tabId:'vad',desc:'Via Aérea Difícil (VAD)'},
  {termo:'pediatria pediátrico criança neonato',tela:'p-especiais',tab:'e-ped',tabPrefix:'e',tabId:'ped',desc:'Anestesia Pediátrica'},
  {termo:'gestante obstétrica cesárea raqui',tela:'p-especiais',tab:'e-gest',tabPrefix:'e',tabId:'gest',desc:'Anestesia Obstétrica'},
  {termo:'obeso obesidade IMC bariatrica',tela:'p-especiais',tab:'e-obeso',tabPrefix:'e',tabId:'obeso',desc:'Obeso / Bariátrica'},
  {termo:'idoso geriátrico geriatria',tela:'p-especiais',tab:'e-idoso',tabPrefix:'e',tabId:'idoso',desc:'Anestesia no Idoso'},
  {termo:'urgência emergência trauma politrauma',tela:'p-especiais',tab:'e-urg',tabPrefix:'e',tabId:'urg',desc:'Urgência / Trauma'},
  {termo:'LAST intoxicação anestésico local lipídica',tela:'p-especiais',tab:'e-last',tabPrefix:'e',tabId:'last',desc:'LAST — Intox. por AL'},
  // Calc Doses
  {termo:'propofol dose indução bolus',tela:'p-calc',tab:'c-inducao',tabPrefix:'c',tabId:'inducao',desc:'Propofol — Calculadora'},
  {termo:'rocurônio bloqueador neuromuscular BNM',tela:'p-calc',tab:'c-bnm',tabPrefix:'c',tabId:'bnm',desc:'BNM — Calculadora'},
  {termo:'succinilcolina suxametônio despolarizante',tela:'p-calc',tab:'c-bnm',tabPrefix:'c',tabId:'bnm',desc:'Succinilcolina'},
  {termo:'sugamadex reversão reversor',tela:'p-calc',tab:'c-bnm',tabPrefix:'c',tabId:'bnm',desc:'Sugamadex — Reversão BNM'},
  {termo:'fentanil sufentanil alfentanil remifentanil opioide',tela:'p-calc',tab:'c-opio',tabPrefix:'c',tabId:'opio',desc:'Opioides — Calculadora'},
  {termo:'morfina tramadol petidina analgesia',tela:'p-calc',tab:'c-opio',tabPrefix:'c',tabId:'opio',desc:'Opioides Analgesia'},
  {termo:'efedrina fenilefrina noradrenalina vasopressor',tela:'p-calc',tab:'c-vaso',tabPrefix:'c',tabId:'vaso',desc:'Vasopressores'},
  {termo:'dipirona paracetamol AINE cetamina lidocaína',tela:'p-calc',tab:'c-anal',tabPrefix:'c',tabId:'anal',desc:'Analgesia — Calculadora'},
  {termo:'adrenalina atropina amiodarona naloxone emergência',tela:'p-calc',tab:'c-emerg',tabPrefix:'c',tabId:'emerg',desc:'Emergência — Calculadora'},
  {termo:'lidocaína bupivacaína ropivacaína dose máxima AL',tela:'p-calc',tab:'c-al',tabPrefix:'c',tabId:'al',desc:'Anestésicos Locais'},
  {termo:'infusão bomba concentração',tela:'p-calc',tab:'c-infusao',tabPrefix:'c',tabId:'infusao',desc:'Infusão Contínua'},
  // Farmacologia
  {termo:'hipnótico mecanismo farmacologia',tela:'p-farma',tab:'f-hipno',tabPrefix:'f',tabId:'hipno',desc:'Farmacologia — Hipnóticos'},
  {termo:'opioide farmacologia receptor mu',tela:'p-farma',tab:'f-opiof',tabPrefix:'f',tabId:'opiof',desc:'Farmacologia — Opioides'},
  {termo:'halogenado sevoflurano desflurano isoflurano CAM',tela:'p-farma',tab:'f-halo',tabPrefix:'f',tabId:'halo',desc:'Halogenados'},
  {termo:'BNM rocurônio vecurônio atracúrio farmacologia',tela:'p-farma',tab:'f-bnmf',tabPrefix:'f',tabId:'bnmf',desc:'Farmacologia — BNM'},
  {termo:'anestésico local farmacologia amida éster',tela:'p-farma',tab:'f-alf',tabPrefix:'f',tabId:'alf',desc:'Farmacologia — AL'},
  {termo:'vasopressor adrenérgico alfa beta',tela:'p-farma',tab:'f-vasof',tabPrefix:'f',tabId:'vasof',desc:'Farmacologia — Vasopressores'},
  {termo:'adjuvante dexametasona gabapentina ondansetrona',tela:'p-farma',tab:'f-adjf',tabPrefix:'f',tabId:'adjf',desc:'Adjuvantes'},
  {termo:'oxigênio dispositivo cateter máscara',tela:'p-farma',tab:'f-o2',tabPrefix:'f',tabId:'o2',desc:'Dispositivos de O₂'},
  // VM
  {termo:'ventilação mecânica parâmetros VC PEEP',tela:'p-vm',tab:'v-param',tabPrefix:'v',tabId:'param',desc:'VM — Parâmetros'},
  {termo:'VCV PCV PSV modo ventilatório',tela:'p-vm',tab:'v-modos',tabPrefix:'v',tabId:'modos',desc:'VM — Modos'},
  {termo:'ARDS DPOC asma broncoespasmo patologia',tela:'p-vm',tab:'v-patol',tabPrefix:'v',tabId:'patol',desc:'VM — Por Patologia'},
  {termo:'desmame extubação teste respiração espontânea',tela:'p-vm',tab:'v-desmame',tabPrefix:'v',tabId:'desmame',desc:'VM — Desmame'},
  {termo:'gasometria pH PaCO2 HCO3 interpretação',tela:'p-vm',tab:'v-gaso',tabPrefix:'v',tabId:'gaso',desc:'Gasometria'},
  // Regional
  {termo:'raquidiana raqui intratecal subaracnóideo',tela:'p-regional',tab:'r-raqui',tabPrefix:'r',tabId:'raqui',desc:'Raquianestesia'},
  {termo:'peridural epidural cateter lombar',tela:'p-regional',tab:'r-peridural',tabPrefix:'r',tabId:'peridural',desc:'Peridural'},
  {termo:'bloqueio periférico TAP PECS interescalênico femoral ciático',tela:'p-regional',tab:'r-bloqueios',tabPrefix:'r',tabId:'bloqueios',desc:'Bloqueios Periféricos'},
  {termo:'complicação CPPD cefaleia hematoma peridural',tela:'p-regional',tab:'r-rcomp',tabPrefix:'r',tabId:'rcomp',desc:'Complicações Regionais'},
  // Escalas
  {termo:'RCRI Lee risco cardíaco cirúrgico',tela:'p-escalas',tab:'sc-cardio',tabPrefix:'sc',tabId:'cardio',desc:'RCRI (Lee) — Risco Cardíaco'},
  {termo:'Glasgow GCS coma escala',tela:'p-escalas',tab:'sc-neuro',tabPrefix:'sc',tabId:'neuro',desc:'Glasgow (GCS)'},
  {termo:'RASS sedação agitação Richmond',tela:'p-escalas',tab:'sc-neuro',tabPrefix:'sc',tabId:'neuro',desc:'RASS — Sedação'},
  {termo:'CAM-ICU delirium confusão',tela:'p-escalas',tab:'sc-neuro',tabPrefix:'sc',tabId:'neuro',desc:'CAM-ICU — Delirium'},
  {termo:'Aldrete SRPA alta recuperação',tela:'p-escalas',tab:'sc-ciranest',tabPrefix:'sc',tabId:'ciranest',desc:'Aldrete — SRPA'},
  {termo:'Bromage bloqueio motor regional',tela:'p-escalas',tab:'sc-ciranest',tabPrefix:'sc',tabId:'ciranest',desc:'Bromage — Bloqueio Motor'},
  {termo:'EVA NRS dor escala visual analógica',tela:'p-escalas',tab:'sc-ciranest',tabPrefix:'sc',tabId:'ciranest',desc:'EVA / NRS — Dor'},
  {termo:'Killip insuficiência cardíaca IAM',tela:'p-escalas',tab:'sc-cardio',tabPrefix:'sc',tabId:'cardio',desc:'Killip — IC no IAM'},
  // CalcAvançadas
  {termo:'peso ideal ajustado magro IBW LBW',tela:'p-calcavancadas',tab:'ca-pesos',tabPrefix:'ca',tabId:'pesos',desc:'Pesos Calculados (IBW/LBW/PA)'},
  {termo:'bomba infusão velocidade concentração',tela:'p-calcavancadas',tab:'ca-infbomba',tabPrefix:'ca',tabId:'infbomba',desc:'Infusão em Bomba'},
  {termo:'gasometria avançada ânion gap delta',tela:'p-calcavancadas',tab:'ca-gasoadv',tabPrefix:'ca',tabId:'gasoadv',desc:'Gasometria Avançada'},
  {termo:'fluidos intraoperatório 4-2-1 déficit jejum',tela:'p-calcavancadas',tab:'ca-fluidos',tabPrefix:'ca',tabId:'fluidos',desc:'Fluidos Intraoperatórios'},
  {termo:'clearance creatinina Cockcroft renal',tela:'p-calcavancadas',tab:'ca-clearance',tabPrefix:'ca',tabId:'clearance',desc:'Clearance de Creatinina'},
  {termo:'raqui dose bupivacaína adjuvante',tela:'p-calcavancadas',tab:'ca-raquicalc',tabPrefix:'ca',tabId:'raquicalc',desc:'Calculadora Raqui'},
  {termo:'Apfel PONV score náusea vômito',tela:'p-calcavancadas',tab:'ca-apfel',tabPrefix:'ca',tabId:'apfel',desc:'Score de Apfel (PONV)'},
  {termo:'TOF train of four neuromuscular',tela:'p-calcavancadas',tab:'ca-outros',tabPrefix:'ca',tabId:'outros',desc:'TOF Helper'},
  // ERAS
  {termo:'ERAS enhanced recovery protocolo jejum prehab',tela:'p-eras',tab:'er-erasproto',tabPrefix:'er',tabId:'erasproto',desc:'Protocolo ERAS'},
  {termo:'PONV profilaxia antiemético ondansetrona 5th consensus',tela:'p-eras',tab:'er-ponv',tabPrefix:'er',tabId:'ponv',desc:'PONV — Profilaxia e Resgate'},
  {termo:'analgesia multimodal pós-operatório escalonamento',tela:'p-eras',tab:'er-analgesia',tabPrefix:'er',tabId:'analgesia',desc:'Analgesia Multimodal'},
  {termo:'SRPA complicação laringoespasmo broncoespasmo shivering',tela:'p-eras',tab:'er-srpa',tabPrefix:'er',tabId:'srpa',desc:'SRPA — Complicações'},
  // Crisis protocols
  {termo:'PCR parada cardiorrespiratória ACLS adrenalina',tela:'p-plantao',tab:'p-extub',tabPrefix:'p',tabId:'extub',desc:'PCR — Protocolo'},
  {termo:'hipertermia maligna dantrolene',tela:'p-especiais',tab:'e-urg',tabPrefix:'e',tabId:'urg',desc:'Hipertermia Maligna'},
  {termo:'anafilaxia choque alergia',tela:'p-especiais',tab:'e-urg',tabPrefix:'e',tabId:'urg',desc:'Anafilaxia'},
  {termo:'hipotensão intraoperatória choque',tela:'p-especiais',tab:'e-urg',tabPrefix:'e',tabId:'urg',desc:'Hipotensão Intraoperatória'}
];

/* Debounce timer — previne filter O(n) a cada keystroke (UI thread safe) */
var _searchTimer = null;

function searchGlobal(query) {
  /* Agenda execução após 180ms de inatividade do teclado.
   * Elimina thrashing: digitação rápida não dispara filtro em cada tecla. */
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(function() { _execSearch(query); }, 180);
}

function _execSearch(query) {
  const results = document.getElementById('searchResults');
  if (!query || query.length < 2) {
    results.innerHTML = '';
    results.style.display = 'none';
    return;
  }

  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const found = searchIndex.filter(item => {
    const t = item.termo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return q.split(/\s+/).every(word => t.includes(word));
  }).slice(0, 8);

  if (found.length === 0) {
    results.innerHTML = '<div class="search-item" style="color:var(--muted)">Nenhum resultado encontrado</div>';
    results.style.display = 'block';
    return;
  }

  results.innerHTML = found.map(item =>
    `<div class="search-item" onclick="goToResult('${item.tela}','${item.tabPrefix}','${item.tabId}')">`
    + `<span class="search-item-title">${item.desc}</span>`
    + `<span class="search-item-sub">${item.tela}</span>`
    + `</div>`
  ).join('');
  results.style.display = 'block';
}

function goToResult(tela, prefix, tabId) {
  const results = document.getElementById('searchResults');
  const searchInput = document.getElementById('globalSearch');
  results.style.display = 'none';
  if (searchInput) searchInput.value = '';
  goTo(tela);
  // Find the correct tab button and activate
  setTimeout(() => {
    const screen = document.getElementById('screen-' + tela);
    if (screen) {
      const tabBtn = screen.querySelector(`.tab-btn[onclick*="showTab('${prefix}','${tabId}'"]`);
      if (tabBtn) {
        showTab(prefix, tabId, tabBtn);
      } else {
        // Fallback: just show the tab panel
        showTab(prefix, tabId, null);
      }
    }
  }, 50);
}

/* ══════════════════════════════════════════
   17. PATIENT HISTORY (in-memory)
   ══════════════════════════════════════════ */
let patientHistory = [];
function savePatientHistory() {
  try {
    const entry = { peso: pesoGlobal, perfil: perfilAtual, ts: Date.now() };
    patientHistory = patientHistory.filter(h => h.peso !== pesoGlobal);
    patientHistory.unshift(entry);
    patientHistory = patientHistory.slice(0, 3);
  } catch(e) {}
}

function loadLastPatient() {
  if (patientHistory.length > 0 && patientHistory[0].peso) {
    setPesoGlobal(patientHistory[0].peso);
  }
}

/* ══════════════════════════════════════════
   18. INIT
   ══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  /* ── Restaurar peso da sessão anterior ── */
  var _savedPeso = (typeof AG_STORE !== 'undefined') ? AG_STORE.get('peso', null) : null;
  if (_savedPeso && !isNaN(parseFloat(_savedPeso))) {
    pesoGlobal = parseFloat(_savedPeso);
    setPesoGlobal(String(pesoGlobal));
  }
  // NÃO redirecionar — o launcher é a tela inicial

  // Close search on click outside
  document.addEventListener('click', function(e) {
    const results = document.getElementById('searchResults');
    const search = document.getElementById('globalSearch');
    if (results && search && !search.contains(e.target) && !results.contains(e.target)) {
      results.style.display = 'none';
    }
  });

  /* ---- Passive event listeners para scroll/touch (performance mobile) ----
   * Usando {passive:true} elimina o atraso de 300 ms que navegadores adicionam
   * quando não sabem se o handler vai chamar preventDefault().
   * Garante scroll 60 fps em iOS/Android sem jank. */
  var pageWraps = document.querySelectorAll('.page-wrap, .screen');
  pageWraps.forEach(function(el) {
    el.addEventListener('touchstart', function(){}, {passive: true});
    el.addEventListener('touchmove',  function(){}, {passive: true});
    el.addEventListener('wheel',      function(){}, {passive: true});
  });

  /* Passive scroll global para eventos de topbar/tabbar que não precisam
   * de preventDefault — permite scroll nativo sem esperar o JS */
  window.addEventListener('scroll', function(){}, {passive: true});
});
