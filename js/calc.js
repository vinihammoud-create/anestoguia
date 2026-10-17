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

  /* Bolus estimado para Ce-alvo 4 mcg/mL (indução) = Cp_alvo × V1 */
  const cpAlvo_ind = 4.0;   // mcg/mL alvo indução
  const cpAlvo_man = 2.5;   // mcg/mL alvo manutenção
  const conc_mg_ml = 10;    // propofol 1% = 10 mg/mL

  const bolus_mg  = (cpAlvo_ind * V1).toFixed(0);                    // mg
  const bolus_ml  = (bolus_mg / conc_mg_ml).toFixed(1);             // mL

  /* Infusão BET (Bolus-Elimination-Transfer) para manutenção
     BET = Cl1 × Cp + k12×V1×Cp + k13×V1×Cp  ≈ Cl1×Cp para t>10 min */
  const inf_manut_mg_min = (Cl1 * cpAlvo_man).toFixed(2);           // mg/min
  const inf_manut_ml_h   = (Cl1 * cpAlvo_man * 60 / conc_mg_ml).toFixed(0); // mL/h (1%)

  /* Taxa de indução (10 min BET simplificado) */
  const inf_ind_ml_h = (Cl1 * cpAlvo_ind * 60 / conc_mg_ml * 1.4).toFixed(0); // +40% BET

  document.getElementById('tci-lbm').textContent      = lbmSafe.toFixed(1) + ' kg';
  document.getElementById('tci-v1').textContent       = V1 + ' L';
  document.getElementById('tci-inducao').textContent  = inf_ind_ml_h + ' mL/h';
  document.getElementById('tci-manut').textContent    = inf_manut_ml_h + ' mL/h';
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
  const cirug = parseFloat(document.getElementById('vol-cirurgia').value) || 0;
  if (!p) { document.getElementById('vol-result').style.display='none'; return; }
  
  // Taxa 4-2-1
  let taxa;
  if (p <= 10) taxa = 4*p;
  else if (p <= 20) taxa = 40 + 2*(p-10);
  else taxa = 60 + (p-20);
  
  const deficit = taxa * hj;
  const perdaCirurg = (cirug || 2) * p; // mL/h estimado
  const hora1 = (taxa + deficit/2 + perdaCirurg).toFixed(0);
  
  document.getElementById('vol-manut').textContent = taxa.toFixed(0) + ' mL/h';
  document.getElementById('vol-deficit').textContent = deficit.toFixed(0) + ' mL';
  document.getElementById('vol-cirurg').textContent = perdaCirurg.toFixed(0) + ' mL/h';
  document.getElementById('vol-hora1').textContent = hora1 + ' mL';
  document.getElementById('vol-protocolo').innerHTML = 
    '<strong style="color:var(--cyan)">Protocolo:</strong><br>' +
    '1ª hora: ' + hora1 + ' mL (déficit/2 + manut + perda)<br>' +
    '2ª hora: ' + (taxa + deficit/4 + perdaCirurg).toFixed(0) + ' mL<br>' +
    '3ª+ hora: ' + (taxa + perdaCirurg).toFixed(0) + ' mL/h';
  document.getElementById('vol-result').style.display = 'block';
}

function calcMABL() {
  const p = parseFloat(document.getElementById('mabl-peso').value);
  const ht = parseFloat(document.getElementById('mabl-ht').value);
  if (!p || !ht) { document.getElementById('mabl-result').style.display='none'; return; }
  const vs = p * 70; // volume sanguíneo adulto
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
  if (!p || !na || !alvo) { document.getElementById('na-result').style.display='none'; return; }
  
  const acdf = 0.6; // fator de distribuição
  const deficit = p * acdf * (alvo - na);
  const vol = (deficit / (conc - na)) * 1000;
  const rate = Math.min(vol / 24, conc === 513 ? 33 : 100);
  
  document.getElementById('na-deficit').textContent = deficit.toFixed(0) + ' mEq';
  document.getElementById('na-vol').textContent = Math.abs(vol).toFixed(0) + ' mL';
  document.getElementById('na-rate').innerHTML = 
    'Taxa sugerida: <strong style="color:var(--cyan)">' + Math.abs(rate).toFixed(0) + ' mL/h</strong> (máx 10 mEq/L em 24h)<br>' +
    'Corrigir em 24-48h · Checar Na⁺ a cada 4-6h';
  document.getElementById('na-result').style.display = 'block';
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
  
  const deficit = (alvo - k) * 70 * 0.4;
  const plan = deficit > 0 ? 
    'Déficit estimado: <strong style="color:var(--cyan)">' + deficit.toFixed(0) + ' mEq</strong><br>' +
    'KCl 19.1% (2.5 mEq/mL):<br>' +
    '→ ' + (deficit/10).toFixed(1) + ' ampolas (20 mEq cada)<br>' +
    '→ Via periférica: 40 mEq em 4h (10 mEq/h)<br>' +
    '→ Via central: 40 mEq em 1-2h (máx 40 mEq/h)' :
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
  
  // Oxigenação
  const pf = po2 / (fio2/100);
  if (po2) {
    if (po2 < 60) lines.push('🚨 <strong style="color:#C0392B">HIPOXEMIA GRAVE</strong> (PaO₂ ' + po2 + ')');
    else if (po2 < 80) lines.push('⚠️ Hipoxemia moderada (PaO₂ ' + po2 + ')');
    if (pf < 200) lines.push('🚨 SARA grave (P/F ' + pf.toFixed(0) + ')');
    else if (pf < 300) lines.push('⚠️ SARA leve/moderada (P/F ' + pf.toFixed(0) + ')');
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
    // [Nome, dose_min, dose_max, unidade, classe]
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
    ['Rocurônio (RSI)', 1.2, 1.6, 'mg/kg', 'bnm'],
    ['Atracúrio', 0.4, 0.5, 'mg/kg', 'bnm'],
    ['Sugamadex (rev. bloq.)', 2, 4, 'mg/kg', 'hipno'],
    ['Neostigmina', 0.04, 0.07, 'mg/kg', 'hipno'],
    ['Adrenalina (PCR)', 0.01, 0.01, 'mg/kg', 'vaso'],
    ['Noradrenalina', 0.05, 0.3, 'mcg/kg/min', 'vaso'],
    ['Fenilefrina', 0.5, 2, 'mcg/kg', 'vaso'],
    ['Efedrina', 0.1, 0.3, 'mg/kg', 'vaso'],
    ['Atropina', 0.01, 0.02, 'mg/kg', 'vaso'],
    ['Dantrolene (HM)', 2.5, 10, 'mg/kg', 'emerg'],
    ['Intralipid 20% (LAST)', 1.5, 1.5, 'mL/kg bolus', 'al'],
  ];
  
  const tbody = document.getElementById('calcc-doses-tbody');
  tbody.innerHTML = drugs.map(([nome, min, max, unit, cls]) => {
    const calcMin = (p * min).toFixed(unit.includes('mcg') ? 0 : 1);
    const calcMax = (p * max).toFixed(unit.includes('mcg') ? 0 : 1);
    const range = min === max ? calcMin : calcMin + '–' + calcMax;
    return `<tr>
      <td style="font-size:11px">${nome}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,.5)">${min===max?min:min+'–'+max}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:var(--cyan)">${range}</td>
      <td style="font-size:10px;color:var(--muted)">${unit}</td>
    </tr>`;
  }).join('');
}
