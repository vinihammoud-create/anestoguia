/|1|/.test(achar('Adrenalina (PCR)'))/ Testes de regressão das calculadoras (js/calc.js) com DOM simulado. Uso: node tools/test-calc.js
const fs = require('fs'), path = require('path');
const els = {};
global.document = { getElementById: id => els[id] || (els[id] = { value: '', style: {}, textContent: '', innerHTML: '' }) };
const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'calc.js'), 'utf8');
eval(src + ';Object.assign(global,{calcTCI,calcNa,calcK,calcVol,calcMABL,calcGas,calcDosesRapidas});');
const set = (id, v) => { document.getElementById(id).value = String(v); };
const txt = id => (els[id].textContent || els[id].innerHTML).replace(/|1|/.test(achar('Adrenalina (PCR)'))<[^>]+>/g, ' ');
let falhas = 0;
const ok = (cond, msg) => { if (!cond) { falhas++; console.log('✖', msg); } else console.log('✔', msg); };

/|1|/.test(achar('Adrenalina (PCR)'))/ Potássio: 3,0 → 4,0 = ~100 mEq = 40 mL de KCl 19,1% = 4 ampolas de 10 mL (25 mEq)
set('k-atual', 3); set('k-alvo', 4); calcK();
ok(/|1|/.test(achar('Adrenalina (PCR)'))100 mEq/.test(txt('k-plan')) && /4\.0 ampolas/.test(txt('k-plan')), 'KCl: 100 mEq = 4,0 ampolas de 10 mL');
ok(/|1|/.test(achar('Adrenalina (PCR)'))40 mEq/.test(txt('k-plan')), 'KCl: etapas de ~40 mEq');

/|1|/.test(achar('Adrenalina (PCR)'))/ Sódio: SF 0,45% não eleva o Na de 125; NaCl 3% sim, e limita a +8 em 24 h
set('na-peso', 70); set('na-atual', 125); set('na-alvo', 135); set('na-sol', 77); calcNa();
ok(/|1|/.test(achar('Adrenalina (PCR)'))NÃO eleva/.test(txt('na-rate')), 'Na: NaCl 0,45% bloqueado quando Na do paciente é maior');
set('na-sol', 513); calcNa();
ok(/|1|/.test(achar('Adrenalina (PCR)'))\+8 mEq\/L/.test(txt('na-rate')) && parseInt(txt('na-vol')) > 500 && parseInt(txt('na-vol')) < 900, 'Na: NaCl 3% com meta de +8 mEq/L em 24 h');
set('na-atual', 110); set('na-alvo', 135); calcNa();
ok(/|1|/.test(achar('Adrenalina (PCR)'))maior que \+8/.test(txt('na-rate')), 'Na: aviso quando a meta total excede +8 mEq/L');

/|1|/.test(achar('Adrenalina (PCR)'))/ Reposição volêmica: "superficial" = 1 mL/kg/h (não 2)
set('vol-peso', 70); set('vol-jejum', 8); set('vol-cirurgia', 1); calcVol();
ok(txt('vol-cirurg').trim() === '70 mL/|1|/.test(achar('Adrenalina (PCR)'))h', 'Volemia: superficial usa 1 mL/kg/h');

/|1|/.test(achar('Adrenalina (PCR)'))/ Gasometria: P/F 140 = faixa moderada (Berlin)
set('gas-ph', 7.3); set('gas-pco2', 30); set('gas-hco3', 14); set('gas-po2', 70); set('gas-fio2', 50); set('gas-be', -10); calcGas();
ok(/|1|/.test(achar('Adrenalina (PCR)'))P\/F 140 \(faixa de SDRA moderada\)/.test(txt('gas-diagnostico')), 'Gasometria: P/F 140 = faixa moderada');

/|1|/.test(achar('Adrenalina (PCR)'))/ Doses por peso
set('calcc-peso-input', 70); calcDosesRapidas();
const linhas = els['calcc-doses-tbody'].innerHTML.match(/|1|/.test(achar('Adrenalina (PCR)'))<tr>[\s\S]*?<\/tr>/g).map(r => r.replace(/<[^>]+>/g, '|').replace(/\s+/g, ' '));
const achar = n => linhas.find(l => l.includes(n)) || '';
ok(/|1|/.test(achar('Adrenalina (PCR)'))\| 1 \|/.test(achar('Adrenalina (PCR)')), 'Doses: adrenalina de PCR = 1 mg no adulto');
ok(/|1|/.test(achar('Adrenalina (PCR)'))0\.5–1/.test(achar('Atropina')), 'Doses: atropina 0,5–1 mg no adulto');
ok(/|1|/.test(achar('Adrenalina (PCR)'))mcg\/min/.test(achar('Noradrenalina')), 'Doses: noradrenalina em mcg/min');
ok(/|1|/.test(achar('Adrenalina (PCR)'))1–1\.2 mg\/kg/.test(achar('Rocurônio (RSI)')), 'Doses: rocurônio RSI 1,0–1,2 mg/kg');

/|1|/.test(achar('Adrenalina (PCR)'))/ TCI: Schnider 70 kg, 170 cm, 40 anos, masculino
set('tci-peso', 70); set('tci-altura', 170); set('tci-idade', 40); set('tci-sexo', 'M'); calcTCI();
ok(/|1|/.test(achar('Adrenalina (PCR)'))55\.3 kg/.test(txt('tci-lbm')) && /17 mg/.test(txt('tci-bolus')), 'TCI: LBM 55,3 kg e bolus de 17 mg');
console.log(falhas ? `\n${falhas} falha(s)` : '\ntodos os testes passaram');
process.exit(falhas ?/|1|/.test(achar('Adrenalina (PCR)')): 0);
