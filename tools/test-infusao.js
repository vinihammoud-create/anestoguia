// Testes das calculadoras de infusão (js/app.js). Uso: node tools/test-infusao.js
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const a = src.indexOf('// --- 14b.'), b = src.indexOf('// --- 14c.');
let pesoGlobal = 70;
eval(src.slice(a, b).replace(/const (INF_UNITS|infDrugs)/g, 'var $1').replace(/^function (\w+)/gm, 'var $1 = function $1') + ';global.infVelocidade=infVelocidade;global.infDose=infDose;global.infDrugs=infDrugs;');
let falhas = 0;
const perto = (x, y, msg) => { const ok = Math.abs(x - y) < 0.05 * Math.abs(y) + 0.01; if (!ok) falhas++; console.log(ok ? '✔' : '✖', msg, x.toFixed(2), '(esperado', y + ')'); };
perto(infVelocidade(infDrugs.nora, 0.1, 16, 70).vel, 26.25, 'Noradrenalina 0,1 mcg/kg/min, 70 kg, 16 mcg/mL = 26,25 mL/h');
perto(infVelocidade(infDrugs.propo, 8, 10000, 70).vel, 56, 'Propofol 8 mg/kg/h, 70 kg, 10 mg/mL = 56 mL/h');
perto(infVelocidade(infDrugs.dexm, 0.5, 4, 70).vel, 8.75, 'Dexmedetomidina 0,5 mcg/kg/h, 70 kg, 4 mcg/mL = 8,75 mL/h');
perto(infVelocidade(infDrugs.remi, 0.2, 50, 70).vel, 16.8, 'Remifentanil 0,2 mcg/kg/min, 70 kg, 50 mcg/mL = 16,8 mL/h');
perto(infVelocidade(infDrugs.keta, 1, 10000, 70).vel, 7, 'Cetamina 1 mg/kg/h, 70 kg, 10 mg/mL = 7 mL/h');
perto(infDose(infDrugs.propo, 56, 10000, 70).dose, 8, 'Inverso: propofol 56 mL/h = 8 mg/kg/h');
perto(infDose(infDrugs.dexm, 8.75, 4, 70).dose, 0.5, 'Inverso: dexmedetomidina 8,75 mL/h = 0,5 mcg/kg/h');
process.exit(falhas ? 1 : 0);
