function calcTCI() {
  const p   = parseFloat(document.getElementById('tci-peso').value);
  const h   = parseFloat(document.getElementById('tci-altura').value);
  const age = parseFloat(document.getElementById('tci-idade').value);
  const sex = document.getElementById('tci-sexo').value;
  if (!p || !h || !age) { document.getElementById('tci-result').style.display='none'; return; }

  /* ── MODELO SCHNIDER (Anesthesiology 1998;88:1170) ──
     Parâmetros: peso total, LBM, altura, idade, sexo      */
  const lbm = sex === 'M'
    ? 1.1*p  - 128*(p/h)*(p/h)   // James formula (masc)
    : 1.07*p - 148*(p/h)*(p/h);  // James formula (fem)
  const lbmSafe = Math.max(lbm, 30); // piso de segurança

  /* Volumes e clearances Schnider */
  const V1   = 4.27;                                                  // L (fixo)
  const V2   = 18.9 - 0.391*(age - 53);                              // L
  const V3   = 238;                                                    // L (fixo)
  const Cl1  = 1.89 + 0.0456*(p - 77) - 0.0681*(lbmSafe - 59) + 0.0264*(h - 177); // L/min
  const Cl2  = 1.29 - 0.024*(age - 53);                              // L/min
  const Cl3  = 0.836;                                                  // L/min
  const ke0  = 0.456;                                                  // /min (t½ke0 ≈ 1.5 min)

  /* Taxa de equilíbrio Ce = Cp: t½ke0 = ln2/ke0 */
  const t_half_ke0 = (Math.LN2 / ke0).toFixed(1); // minutos

  const conc_mg_ml = 10;    // propofol 1% = 10 mg/mL

  /* Bolus inicial para atingir Cp-alvo = Cp × V1 */
  const bolus_mg  = (4.0 * V1).toFixed(0);                           // mg (Cp 4 mcg/mL)
  const bolus_ml  = (bolus_mg / conc_mg_ml).toFixed(1);             // mL

  /* Infusão BET (Bolus-Elimination-Transfer, Kruger-Thiemer):
     R(t) = Cp × V1 × (k10 + k12·e^(-k21·t) + k13·e^(-k31·t))  — mg/min para manter Cp constante */
  const k10 = Cl1/V1, k12 = Cl2/V1, k21 = Cl2/V2, k13 = Cl3/V1, k31 = Cl3/V3;
  const bet = (cp, t) => cp * V1 * (k10 + k12*Math.exp(-k21*t) + k13*Math.exp(-k31*t)); // mg/min
  const mlh = (mgmin) => (mgmin * 60 / conc_mg_ml).toFixed(0);       // mL/h (propofol 1%)
  const inf_ind_ml_h   = mlh(bet(4.0, 5));    // Cp 4 mcg/mL, por volta de 5 min
  const inf_manut_ml_h = mlh(bet(2.5, 60));   // Cp 2,5 mcg/mL, por volta de 60 min

  document.getElementById('tci-lbm').textContent      = lbmSafe.toFixed(1) + ' kg';
  document.getElementById('tci-v1').textContent       = V1 + ' L';
  document.getElementById('tci-inducao').textContent  = '~' + inf_ind_ml_h + ' mL/h (Cp 4, ~5 min)';
  document.getElementById('tci-manut').textContent    = '~' + inf_manut_ml_h + ' mL/h (Cp 2,5, ~60 min)';
  document.getElementById('tci-result').style.display = 'block';

  /* Mostrar detalhes extras se os elementos existirem */
  const elBolus = document.getElementById('tci-bolus');
  if (elBolus) elBolus.textContent = bolus_ml + ' mL (' + bolus_mg + ' mg)';
  const elKe0 = document.getElementById('tci-ke0');
  if (elKe0) elKe0.textContent = 't½ke0 ≈ ' + t_half_ke0 + ' min | ke0=' + ke0 + '/min';
}

function calcVol() {
  const p = parseFloat(document.getElementById('vol-peso').value);
  const hj = parseFloat(document.getElementById('vol-jejum').value) || 0;
  const cirug = parseFloat(document.getElementById('vol-cirurgia').value) || 1;
  if (!p) { document.getElementById('vol-result').style.display='none'; return; }

  // Taxa 4-2-1
  let taxa;
  if (p <= 10) taxa = 4*p;
  else if (p <= 20) taxa = 40 + 2*(p-10);
  else taxa = 60 + (p-20);

  const deficit = taxa * hj;
  const perdaCirurg = cirug * p; // mL/h estimado (mL/kg/h × peso)
  const hora1 = (taxa + deficit/2 + perdaCirurg).toFixed(0);

  document.getElementById('vol-manut').textContent = taxa.toFixed(0) + ' mL/h';
  document.getElementById('vol-deficit').textContent = deficit.toFixed(0) + ' mL';
  document.getElementById('vol-cirurg').textContent = perdaCirurg.toFixed(0) + ' mL/h';
  document.getElementById('vol-hora1').textContent = hora1 + ' mL';
  document.getElementById('vol-protocolo').innerHTML =
    '<strong style="color:var(--cyan)">Esquema clássico (Furman):</strong><br>' +
    '1ª hora: ' + hora1 + ' mL (½ déficit + manutenção + perda)<br>' +
    '2ª hora: ' + (taxa + deficit/4 + perdaCirurg).toFixed(0) + ' mL (¼ do déficit)<br>' +
    '3ª hora: ' + (taxa + deficit/4 + perdaCirurg).toFixed(0) + ' mL (¼ do déficit)<br>' +
    '4ª hora em diante: ' + (taxa + perdaCirurg).toFixed(0) + ' mL/h<br>' +
    '<span style="color:var(--gold)">⚠ Estimativa de referência. Hoje se prefere reposição individualizada: o déficit de jejum não precisa ser reposto por inteiro (jejum curto, carboidrato pré-operatório) e o ritmo é ajustado por PA, diurese, lactato e variáveis dinâmicas (PPV/SVV).</span>';
  document.getElementById('vol-result').style.display = 'block';
}

function calcMABL() {
  const p = parseFloat(document.getElementById('mabl-peso').value);
  const ht = parseFloat(document.getElementById('mabl-ht').value);
  if (!p || !ht) { document.getElementById('mabl-result').style.display='none'; return; }
  const vs = p * 70; // volume sanguíneo adulto (~70 mL/kg homem; ~65 mL/kg mulher)
  const mabl = vs * (ht - 25) / ((ht + 25) / 2);
  document.getElementById('mabl-vsang').textContent = vs.toFixed(0) + ' mL';
  document.getElementById('mabl-val').textContent = Math.max(0, mabl).toFixed(0) + ' mL';
  document.getElementById('mabl-result').style.display = 'block';
}

function calcNa() {
  const p = parseFloat(document.getElementById('na-peso').value);
  const na = parseFloat(document.getElementById('na-atual').value);
  const alvo = parseFloat(document.getElementById('na-alvo').value);
  const conc = parseFloat(document.getElementById('na-sol').value);
  const out = document.getElementById('na-result');
  if (!p || !na || !alvo) { out.style.display='none'; return; }

  /* Adrogué–Madias: ΔNa por litro infundido = (Na solução − Na sérico) / (ACT + 1).
     ACT = 0,5 × peso (mulheres/idosos; estimativa conservadora para homens adultos, 0,6). */
  const act = 0.5 * p;
  out.style.display = 'block';
  if (alvo <= na) {
    document.getElementById('na-deficit').textContent = '—';
    document.getElementById('na-vol').textContent = '—';
    document.getElementById('na-rate').innerHTML = 'Na⁺ alvo menor ou igual ao atual: nada a corrigir.';
    return;
  }
  if (conc <= na) {
    document.getElementById('na-deficit').textContent = '—';
    document.getElementById('na-vol').textContent = '—';
    document.getElementById('na-rate').innerHTML =
      '<strong style="color:var(--red)">Esta solução NÃO eleva o Na⁺:</strong> o sódio da solução (' + conc + ' mEq/L) é ≤ ao do paciente (' + na + ' mEq/L). Escolher solução com Na⁺ maior.';
    return;
  }
  /* meta das primeiras 24 h limitada a +8 mEq/L (conservador; limite máximo 10) */
  const meta24 = Math.min(alvo, na + 8);
  const dNaPorL = (conc - na) / (act + 1);
  const litros = (meta24 - na) / dNaPorL;
  const vol = litros * 1000;
  const rate = vol / 24;
  const deficit = act * (alvo - na);

  document.getElementById('na-deficit').textContent = deficit.toFixed(0) + ' mEq (déficit total até o alvo)';
  document.getElementById('na-vol').textContent = vol.toFixed(0) + ' mL em 24 h';
  let aviso = '';
  if (alvo - na > 8) aviso = '<br><strong style="color:var(--gold)">Meta total (' + alvo + ') maior que +8 mEq/L: o cálculo cobre só as primeiras 24 h (até ' + meta24 + ' mEq/L); a correção continua nas 24 h seguintes.</strong>';
  document.getElementById('na-rate').innerHTML =
    'Taxa sugerida: <strong style="color:var(--cyan)">' + rate.toFixed(0) + ' mL/h</strong> (meta de +' + (meta24 - na).toFixed(0) + ' mEq/L em 24 h; limite 8-10)<br>' +
    'Checar o Na⁺ a cada 2-4 h e ajustar; diurese de água livre pode causar sobrecorreção.<br>' +
    'Estimativa (Adrogué–Madias): não considera perdas e ganhos concomitantes.' + aviso;
}

function calcK() {
  /* Guard: NaN, valores impossíveis (K > 10 mEq/L = incompatível com vida) */
  const k    = parseFloat(document.getElementById('k-atual')?.value);
  const alvo = parseFloat(document.getElementById('k-alvo')?.value);
  const resEl = document.getElementById('k-result');
  if (isNaN(k) || isNaN(alvo) || k <= 0 || alvo <= 0 || k > 10 || alvo > 10) {
    if (resEl) resEl.style.display = 'none';
    return;
  }

  /* Regra prática: 10 mEq de KCl elevam o K⁺ sérico em ~0,1 mEq/L (variável: perdas, pH, insulina) */
  const delta = alvo - k;
  const total = delta * 100;                 // mEq (estimativa)
  const mlTotal = total / 2.5;               // KCl 19,1% = 2,5 mEq/mL
  const plan = delta > 0 ?
    'Estimativa do total: <strong style="color:var(--cyan)">' + total.toFixed(0) + ' mEq</strong> (' + mlTotal.toFixed(0) + ' mL de KCl 19,1% = ' + (total/25).toFixed(1) + ' ampolas de 10 mL)<br>' +
    '→ Dar em <strong>etapas de ~40 mEq</strong> (16 mL de KCl 19,1%) e <strong>rechecar o K⁺</strong> em 4-6 h<br>' +
    '→ Via periférica: máx 10 mEq/h, diluído em ≤40 mEq/L<br>' +
    '→ Via central: 20 mEq/h (até 40 mEq/h em UTI, com ECG contínuo)<br>' +
    (k < 2.5 ? '<strong style="color:var(--red)">K⁺ &lt; 2,5 mEq/L: monitorização contínua (ECG) e acesso central; considerar UTI.</strong><br>' : '') +
    '<span style="color:var(--gold)">Corrigir também o magnésio e a causa da perda.</span>' :
    'K⁺ já no alvo ou acima — verificar valor';

  document.getElementById('k-plan').innerHTML = plan;
  document.getElementById('k-result').style.display = 'block';
}

function calcGas() {
  const ph = parseFloat(document.getElementById('gas-ph').value);
  const pco2 = parseFloat(document.getElementById('gas-pco2').value);
  const hco3 = parseFloat(document.getElementById('gas-hco3').value);
  const po2 = parseFloat(document.getElementById('gas-po2').value);
  const be = parseFloat(document.getElementById('gas-be').value);
  const fio2 = parseFloat(document.getElementById('gas-fio2').value) || 21;

  if (!ph || !pco2 || !hco3) { document.getElementById('gas-result').style.display='none'; return; }

  let lines = [];

  // pH
  if (ph < 7.35) lines.push('🔴 <strong>Acidemia</strong> (pH ' + ph + ')');
  else if (ph > 7.45) lines.push('🔵 <strong>Alcalemia</strong> (pH ' + ph + ')');
  else lines.push('✅ <strong>pH Normal</strong> (' + ph + ')');

  // Distúrbio primário
  if (pco2 > 45 && ph < 7.35) lines.push('→ Acidose Respiratória (PaCO₂ ' + pco2 + ')');
  else if (pco2 < 35 && ph > 7.45) lines.push('→ Alcalose Respiratória (PaCO₂ ' + pco2 + ')');
  if (hco3 < 22 && ph < 7.35) lines.push('→ Acidose Metabólica (HCO₃ ' + hco3 + ')');
  else if (hco3 > 26 && ph > 7.45) lines.push('→ Alcalose Metabólica (HCO₃ ' + hco3 + ')');
  if (ph >= 7.35 && ph <= 7.45 && (pco2 > 45 || pco2 < 35 || hco3 < 22 || hco3 > 26))
    lines.push('⚠ pH normal com PaCO₂/HCO₃⁻ alterados: distúrbio compensado ou misto — ver Gasometria Avançada');

  // Oxigenação
  if (po2) {
    const pf = po2 / (fio2/100);
    if (po2 < 60) lines.push('🚨 <strong style="color:#C0392B">HIPOXEMIA GRAVE</strong> (PaO₂ ' + po2 + ')');
    else if (po2 < 80) lines.push('⚠️ Hipoxemia moderada (PaO₂ ' + po2 + ')');
    /* P/F isolado não define SDRA (Berlin exige início agudo, imagem e PEEP ≥5) */
    if (pf <= 100) lines.push('🚨 P/F ' + pf.toFixed(0) + ' (faixa de SDRA grave, se os demais critérios de Berlin forem atendidos)');
    else if (pf <= 200) lines.push('🚨 P/F ' + pf.toFixed(0) + ' (faixa de SDRA moderada)');
    else if (pf <= 300) lines.push('⚠️ P/F ' + pf.toFixed(0) + ' (faixa de SDRA leve)');
    else lines.push('✅ Índice P/F: ' + pf.toFixed(0) + ' (normal >400)');
  }

  // BE
  if (be < -3) lines.push('⬇ Déficit de base: ' + be + ' mEq/L (acidose metabólica)');
  else if (be > 3) lines.push('⬆ Excesso de base: +' + be + ' mEq/L (alcalose metabólica)');

  document.getElementById('gas-diagnostico').innerHTML = lines.join('<br>');
  document.getElementById('gas-result').style.display = 'block';
}

function calcDosesRapidas() {
  const p = parseFloat(document.getElementById('calcc-peso-input').value);
  if (!p || p < 1) {
    document.getElementById('calcc-doses-tbody').innerHTML = '';
    document.getElementById('calcc-peso-info').textContent = 'Digite o peso para calcular';
    return;
  }

  document.getElementById('calcc-peso-info').textContent = 'Peso: ' + p + ' kg';

  const drugs = [
    // [Nome, dose_min, dose_max, unidade, classe, opções {adulto: texto fixo a partir de 40 kg, unidadeSaida}]
    ['Propofol (indução)', 1.5, 2.5, 'mg/kg', 'hipno'],
    ['Propofol (sedação)', 0.5, 1.0, 'mg/kg', 'hipno'],
    ['Cetamina (anestesia)', 1, 2, 'mg/kg', 'hipno'],
    ['Cetamina (subanestésica)', 0.3, 0.5, 'mg/kg', 'hipno'],
    ['Etomidato', 0.2, 0.3, 'mg/kg', 'hipno'],
    ['Midazolam (MPA)', 0.02, 0.05, 'mg/kg', 'hipno'],
    ['Fentanil', 1, 2, 'mcg/kg', 'opioide'],
    ['Sufentanil', 0.1, 0.3, 'mcg/kg', 'opioide'],
    ['Morfina', 0.05, 0.1, 'mg/kg', 'opioide'],
    ['Succinilcolina (IOT)', 1, 1.5, 'mg/kg', 'bnm'],
    ['Rocurônio (IOT)', 0.6, 1.2, 'mg/kg', 'bnm'],
    ['Rocurônio (RSI)', 1.0, 1.2, 'mg/kg', 'bnm'],
    ['Atracúrio', 0.4, 0.5, 'mg/kg', 'bnm'],
    ['Sugamadex (rev. bloq.)', 2, 4, 'mg/kg', 'hipno'],
    ['Sugamadex (reversão imediata)', 16, 16, 'mg/kg', 'hipno'],
    ['Neostigmina (máx 5 mg)', 0.04, 0.07, 'mg/kg', 'hipno', { cap: 5 }],
    ['Adrenalina (PCR)', 0.01, 0.01, 'mg/kg', 'vaso', { adulto: '1' }],
    ['Noradrenalina', 0.05, 0.3, 'mcg/kg/min', 'vaso', { unidadeSaida: 'mcg/min' }],
    ['Fenilefrina', 0.5, 2, 'mcg/kg', 'vaso'],
    ['Efedrina', 0.05, 0.15, 'mg/kg', 'vaso'],
    ['Atropina', 0.01, 0.02, 'mg/kg', 'vaso', { adulto: '0.5–1' }],
    ['Dantrolene (HM)', 2.5, 10, 'mg/kg', 'emerg'],
    ['Intralipid 20% (LAST)', 1.5, 1.5, 'mL/kg bolus', 'al'],
  ];

  const tbody = document.getElementById('calcc-doses-tbody');
  tbody.innerHTML = drugs.map(([nome, min, max, unit, cls, o]) => {
    o = o || {};
    const casas = unit.includes('mcg') ? 0 : 1;
    let calcMin = p * min, calcMax = p * max;
    if (o.cap) { calcMin = Math.min(calcMin, o.cap); calcMax = Math.min(calcMax, o.cap); }
    let range = min === max ? calcMin.toFixed(casas) : calcMin.toFixed(casas) + '–' + calcMax.toFixed(casas);
    let unitOut = o.unidadeSaida || unit.split('/')[0];
    if (o.adulto && p >= 40) { range = o.adulto; unitOut = 'mg (dose fixa do adulto)'; }
    const doseTxt = (min === max ? min : min + '–' + max) + ' ' + unit;
    return `<tr>
      <td style="font-size:11px">${nome}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,.5)">${doseTxt}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--cyan)">${range}</td>
      <td style="font-size:10px;color:var(--muted)">${unitOut}</td>
    </tr>`;
  }).join('');
}
