/* ══════════════════════════════════════════════════════════════
   PLANTÃO — cartões de emergência em tela cheia, checklists, cronômetros, pediatria e favoritos
   Tela: #screen-p-emerg (rota #/p/emerg, #/p/emerg/<aba>, #/p/emerg/<cartão>)
   ══════════════════════════════════════════════════════════════ */
function em_esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function em_fmt(s) { return em_esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); }
function em_n(x, d) { var v = Math.round(x * Math.pow(10, d || 0)) / Math.pow(10, d || 0); return String(v).replace('.', ','); }
function em_peso() { return (typeof pesoGlobal !== 'undefined' && pesoGlobal > 0) ? pesoGlobal : 0; }

/* ── cartões de emergência ── (doses: função do peso em kg; sem peso mostra a regra) */
var EM_CARTOES = [
  { id: 'pcr', t: 'PCR adulto', ic: '🫀', cor: '#EF4444', sub: 'ACLS · choque, adrenalina, causas',
    agora: ['Gritar por ajuda, trazer desfibrilador e carro de parada; **iniciar RCP** (100–120/min, 5–6 cm, retorno total do tórax); minimizar pausas.',
      'O₂ 100%; via aérea avançada se treinado, com capnografia (PETCO₂ < 10 mmHg após 20 min = mau prognóstico).',
      '**FV/TV sem pulso:** choque (bifásico 120–200 J, ou carga máxima) → RCP 2 min → reavaliar. **AESP/assistolia:** RCP e adrenalina o mais cedo possível.',
      'Adrenalina **1 mg IV/IO a cada 3–5 min**. Amiodarona 300 mg após o 3º choque (2ª dose 150 mg) ou lidocaína.',
      '**No centro cirúrgico:** suspender anestésicos e vasodilatadores, procurar sangramento, anafilaxia, LAST, hipercalemia (cálcio), pneumotórax, tamponamento, embolia e hipóxia; pedir ajuda cirúrgica e ECMO se disponível.'],
    doses: function (p) { return [['Adrenalina', '1 mg IV/IO a cada 3–5 min'], ['Amiodarona', '300 mg bolus, depois 150 mg'], ['Lidocaína (alternativa)', p ? em_n(p, 0) + '–' + em_n(p * 1.5, 0) + ' mg (1–1,5 mg/kg)' : '1–1,5 mg/kg']]; },
    causas: '5H: hipovolemia, hipóxia, H⁺ (acidose), hiper/hipocalemia, hipotermia · 5T: tensão (pneumotórax), tamponamento, tóxicos, trombose pulmonar, trombose coronária.',
    ref: 'AHA ACLS · Resolução CFM 2.174/2017' },
  { id: 'pcrped', t: 'PCR pediátrica', ic: '🧒', cor: '#F97316', sub: 'PALS · doses por kg',
    agora: ['Chamar ajuda; RCP 100–120/min, profundidade ≈ 1/3 do tórax (4 cm lactente, 5 cm criança); **15:2** com 2 socorristas (30:2 se sozinho); O₂ 100%.',
      'Ritmo chocável: **2 J/kg**, depois **4 J/kg** e subsequentes (≥ 4 J/kg, máx 10 J/kg ou dose adulto).',
      'Adrenalina **0,01 mg/kg** (0,1 mL/kg da solução 0,1 mg/mL) IV/IO a cada 3–5 min; amiodarona 5 mg/kg em FV/TV refratária.',
      'Procurar causa reversível: hipóxia, hipovolemia, hipoglicemia, pneumotórax, tamponamento, anafilaxia, LAST, hipercalemia.'],
    doses: function (p) {
      if (!p) return [['Adrenalina', '0,01 mg/kg (0,1 mL/kg da solução 0,1 mg/mL; máx 1 mg)'], ['Choques', '2 J/kg, depois 4 J/kg (máx 10 J/kg)'], ['Amiodarona', '5 mg/kg (máx 300 mg)'], ['Lidocaína', '1 mg/kg']];
      return [['Adrenalina', em_n(p * 0.01, 3) + ' mg = ' + em_n(Math.min(10, p * 0.1), 1) + ' mL da solução 0,1 mg/mL (máx 1 mg)'], ['1º choque', em_n(p * 2, 0) + ' J'], ['2º choque e seguintes', em_n(p * 4, 0) + ' J (≥ 4 J/kg, máx 10 J/kg)'],
        ['Amiodarona', em_n(Math.min(300, p * 5), 0) + ' mg (5 mg/kg)'], ['Lidocaína', em_n(p, 0) + ' mg (1 mg/kg)'], ['Glicose se hipoglicemia', em_n(p * 5, 0) + ' mL de glicose 10% (5 mL/kg = 0,5 g/kg)']];
    },
    causas: 'Em crianças a parada costuma ser asfíctica: priorizar ventilação e oxigenação.', ref: 'AHA PALS' },
  { id: 'hm', t: 'Hipertermia maligna', ic: '🌡️', cor: '#DC2626', sub: 'dantrolene 2,5 mg/kg · parar gatilhos',
    agora: ['**Parar halogenado e succinilcolina**; trocar para TIVA; hiperventilar com O₂ 100% a ≥ 10 L/min; pedir ajuda e o carro/kit de HM; avisar o cirurgião para encerrar ou abreviar.',
      '**Dantrolene 2,5 mg/kg IV em bolus rápido**; repetir até controlar (taquicardia, CO₂, rigidez, temperatura) — pode ultrapassar 10 mg/kg. Cada frasco de 20 mg se dilui em 60 mL de água estéril.',
      'Resfriar ativamente (soro gelado, gelo, manta) até 38 °C; tratar **hipercalemia** (cálcio, bicarbonato, glicose-insulina), acidose e arritmias; não usar bloqueador de canal de cálcio com dantrolene.',
      'Sonda vesical e diurese > 1 mL/kg/h (rabdomiólise); dosar K⁺, gasometria, CK, lactato, coagulação; UTI por 24–48 h; dantrolene 1 mg/kg a cada 4–6 h por 24 h.'],
    doses: function (p) {
      if (!p) return [['Dantrolene', '2,5 mg/kg IV (frascos de 20 mg)'], ['Bicarbonato', '1–2 mEq/kg'], ['Cálcio', 'cloreto de cálcio 10 mg/kg se hipercalemia']];
      return [['Dantrolene (ataque)', em_n(p * 2.5, 0) + ' mg = ' + Math.ceil(p * 2.5 / 20) + ' frasco(s) de 20 mg'], ['Dantrolene (se persistir)', 'repetir ' + em_n(p * 2.5, 0) + ' mg até controle'], ['Manutenção', em_n(p, 0) + ' mg a cada 4–6 h por 24 h (1 mg/kg)'],
        ['Bicarbonato de sódio', em_n(p, 0) + '–' + em_n(p * 2, 0) + ' mEq (1–2 mEq/kg)'], ['Cloreto de cálcio 10%', em_n(p * 0.1, 1) + ' mL (10 mg/kg)']];
    },
    causas: 'Sinais precoces: ↑ETCO₂ inexplicado, taquicardia, rigidez de masseter, ↑temperatura, acidose mista, mioglobinúria.', ref: 'MHAUS · Dantrium IV' },
  { id: 'last', t: 'Toxicidade por anestésico local', ic: '💉', cor: '#7C3AED', sub: 'emulsão lipídica 20% · evitar vasopressina',
    agora: ['**Parar a injeção**; pedir ajuda; O₂ 100% e via aérea; monitorizar; acesso IV.',
      '**Emulsão lipídica 20%:** bolus 1,5 mL/kg em 2–3 min (100 mL se > 70 kg), seguido de infusão 0,25 mL/kg/min (200–250 mL em 15–20 min se > 70 kg). Repetir o bolus 1–2 vezes se instável; manter a infusão ≥ 10 min após estabilizar; máx ≈ 12 mL/kg.',
      'Convulsão: **benzodiazepínico**; evitar doses grandes de propofol se houver instabilidade hemodinâmica.',
      'Parada: RCP; **adrenalina em dose pequena (≤ 1 mcg/kg)**; evitar vasopressina, bloqueadores de canal de cálcio, betabloqueadores e anestésicos locais; amiodarona para arritmia ventricular; considerar circulação extracorpórea.',
      'Notificar; observar ≥ 6 h após sintomas neurológicos isolados e ≥ 12 h após toxicidade cardiovascular.'],
    doses: function (p) {
      if (!p) return [['Bolus', '1,5 mL/kg de emulsão 20% (100 mL se > 70 kg)'], ['Infusão', '0,25 mL/kg/min']];
      return [['Bolus de emulsão 20%', p >= 70 ? '100 mL' : em_n(p * 1.5, 0) + ' mL (1,5 mL/kg)'], ['Infusão', p >= 70 ? '200–250 mL em 15–20 min' : em_n(p * 0.25, 1) + ' mL/min (0,25 mL/kg/min)'], ['Máximo (≈ 12 mL/kg)', em_n(p * 12, 0) + ' mL'],
        ['Adrenalina (se PCR)', '≤ ' + em_n(p, 0) + ' mcg (1 mcg/kg)'], ['Midazolam (convulsão)', em_n(p * 0.05, 1) + ' mg (0,05 mg/kg)']];
    },
    causas: 'Sinais: gosto metálico, zumbido, parestesia perioral, agitação, convulsão, depois arritmia, bloqueio, assistolia. Prevenir: aspirar, injetar fracionado, ultrassom, doses máximas.', ref: 'ASRA 2020 (LAST)' },
  { id: 'anafilaxia', t: 'Anafilaxia perioperatória', ic: '⚠️', cor: '#F59E0B', sub: 'adrenalina · volume · parar o agente',
    agora: ['**Parar o agente suspeito** (antibiótico, bloqueador neuromuscular, látex, clorexidina, corante); chamar ajuda; O₂ 100%; via aérea precoce (edema).',
      '**Adrenalina** em hipotensão ou broncoespasmo: bolus IV 10–50 mcg (repetir a cada 1–2 min) ou **0,5 mg IM na coxa** sem acesso IV; se refratária, infusão 0,05–0,1 mcg/kg/min.',
      '**Volume** rápido (cristaloide 20 mL/kg, até 1–2 L no adulto) e vasopressor; **glucagon** 1–5 mg se uso de betabloqueador; vasopressina 1–2 U em refratária.',
      'Depois: anti-histamínico (difenidramina 25–50 mg), hidrocortisona 200 mg e broncodilatador. Não substituem a adrenalina.',
      '**Triptase sérica** 1–2 h (e 4–6 h) após o evento; encaminhar para investigação alergológica.'],
    doses: function (p) {
      if (!p) return [['Adrenalina IM', '0,01 mg/kg (máx 0,5 mg)'], ['Adrenalina IV', '10–50 mcg (adulto); 1 mcg/kg (criança)'], ['Volume', '20 mL/kg']];
      return [['Adrenalina IM', em_n(Math.min(0.5, p * 0.01), 2) + ' mg (0,01 mg/kg, máx 0,5 mg)'], ['Adrenalina IV em bolus', p < 40 ? em_n(p, 0) + ' mcg (1 mcg/kg)' : '10–50 mcg'], ['Infusão de adrenalina', em_n(p * 0.05, 1) + '–' + em_n(p * 0.1, 1) + ' mcg/min (0,05–0,1 mcg/kg/min)'],
        ['Cristaloide', em_n(p * 20, 0) + ' mL (20 mL/kg), repetir conforme resposta'], ['Hidrocortisona', p < 40 ? em_n(p * 4, 0) + ' mg (4 mg/kg)' : '200 mg']];
    },
    causas: 'Agentes mais comuns: bloqueadores neuromusculares, antibióticos beta-lactâmicos, látex, clorexidina, corantes e coloides.', ref: 'ASA / BSACI / WAO' },
  { id: 'broncoespasmo', t: 'Broncoespasmo', ic: '🫁', cor: '#06B6D4', sub: 'aprofundar · salbutamol · adrenalina',
    agora: ['Confirmar: ↑pressão de pico com platô normal, expiração prolongada, capnograma em "barbatana de tubarão", sibilos; **excluir** tubo dobrado, intubação seletiva, secreção, pneumotórax, aspiração e anafilaxia.',
      'O₂ 100%; **aprofundar a anestesia** (volátil, propofol) e suspender o estímulo; ventilação manual lenta.',
      '**Salbutamol 4–8 jatos** no circuito (repetir); ipratrópio; se grave, **adrenalina 10–50 mcg IV** (ou infusão).',
      'Segunda linha: **cetamina**, sulfato de magnésio 2 g IV em 20 min, hidrocortisona.',
      'Ventilar com VC pequeno, FR baixa e I:E 1:4–1:5; se auto-PEEP, desconectar para esvaziar; hipercapnia permissiva.'],
    doses: function (p) {
      if (!p) return [['Salbutamol', '4–8 jatos de 100 mcg no circuito'], ['Cetamina', '0,5–1 mg/kg IV'], ['Sulfato de magnésio', '2 g IV (criança 40 mg/kg, máx 2 g)']];
      return [['Salbutamol', p < 20 ? '2–4 jatos de 100 mcg' : '4–8 jatos de 100 mcg no circuito'], ['Cetamina', em_n(p * 0.5, 0) + '–' + em_n(p, 0) + ' mg (0,5–1 mg/kg)'], ['Sulfato de magnésio', p < 50 ? em_n(Math.min(2000, p * 40), 0) + ' mg (40 mg/kg)' : '2 g'], ['Adrenalina IV', p < 40 ? em_n(p, 0) + ' mcg (1 mcg/kg)' : '10–50 mcg'], ['Hidrocortisona', p < 40 ? em_n(p * 4, 0) + ' mg (4 mg/kg)' : '100–200 mg']];
    },
    causas: 'Fatores: asma, DPOC, fumante, infecção respiratória, manipulação da via aérea, fármacos liberadores de histamina, aspiração, anafilaxia.', ref: 'Miller\'s Anesthesia · SBA' },
  { id: 'laringoespasmo', t: 'Laringoespasmo', ic: '🔇', cor: '#14B8A6', sub: 'CPAP · Larson · propofol · succinilcolina',
    agora: ['Interromper o estímulo; **O₂ 100% com CPAP** (10–15 cmH₂O) por máscara bem vedada, com elevação da mandíbula.',
      '**Manobra de Larson:** pressão bilateral atrás do ângulo da mandíbula (forame "laryngospasm notch").',
      'Aprofundar: **propofol 0,5–1 mg/kg IV** (ou 1–2 mg/kg conforme o caso).',
      'Se persistir ou houver dessaturação: **succinilcolina** em dose baixa (0,1–0,5 mg/kg) ou completa (1–2 mg/kg IV; 4 mg/kg IM em criança sem acesso) e ventilar/intubar. Atropina se bradicardia.',
      'Vigiar edema pulmonar por pressão negativa após o episódio.'],
    doses: function (p) {
      if (!p) return [['Propofol', '0,5–1 mg/kg IV'], ['Succinilcolina', '0,1–0,5 mg/kg (baixa) · 1–2 mg/kg (completa) · 4 mg/kg IM'], ['Atropina', '0,02 mg/kg (mín 0,1 mg)']];
      return [['Propofol', em_n(p * 0.5, 0) + '–' + em_n(p, 0) + ' mg (0,5–1 mg/kg)'], ['Succinilcolina (baixa)', em_n(p * 0.1, 1) + '–' + em_n(p * 0.5, 1) + ' mg IV'], ['Succinilcolina (completa)', em_n(p, 0) + '–' + em_n(p * 2, 0) + ' mg IV · ' + em_n(p * 4, 0) + ' mg IM em criança sem acesso'], ['Atropina', em_n(Math.max(0.1, p * 0.02), 2) + ' mg (0,02 mg/kg, mín 0,1 mg)']];
    },
    causas: 'Fatores: crianças, IVAS, secreção/sangue, extubação em plano superficial, estímulo cirúrgico.', ref: 'Miller\'s Anesthesia · SBA' },
  { id: 'cico', t: 'Via aérea difícil não antecipada / CICO', ic: '🚨', cor: '#A855F7', sub: 'DAS 2015 · planos A–D · cricotireoidostomia',
    agora: ['**Plano A** intubação (máx. 3 tentativas, melhor posição, videolaringoscópio, bougie). **Plano B** máscara laríngea de 2ª geração (máx. 3 tentativas). **Plano C** ventilação por máscara facial com 2 pessoas, cânula e **bloqueio neuromuscular completo**.',
      '**Falhou:** declarar "CICO" (não consigo intubar nem oxigenar), O₂ 100%, pedir ajuda e o kit de via aérea cirúrgica.',
      '**Plano D:** cricotireoidostomia com bisturi: incisão horizontal na membrana cricotireóidea, girar a lâmina 90°, passar o bougie e o tubo de 6,0 com balonete; confirmar com capnografia.',
      'Se rocurônio foi usado, **sugamadex 16 mg/kg** pode ser dado, mas não deve atrasar o acesso cervical.',
      'Acordar o paciente só se a oxigenação estiver garantida; documentar e informar o paciente.'],
    doses: function (p) {
      if (!p) return [['Rocurônio', '1–1,2 mg/kg'], ['Sugamadex (CICO após rocurônio)', '16 mg/kg']];
      return [['Rocurônio (bloqueio completo)', em_n(p, 0) + '–' + em_n(p * 1.2, 0) + ' mg (1–1,2 mg/kg)'], ['Sugamadex', em_n(p * 16, 0) + ' mg (16 mg/kg) — frascos de 200 mg: ' + Math.ceil(p * 16 / 200)], ['Succinilcolina', em_n(p, 0) + '–' + em_n(p * 1.5, 0) + ' mg (1–1,5 mg/kg)']];
    },
    causas: 'Prevenir: avaliar a via aérea, pré-oxigenar, plano A/B/C/D falado em voz alta antes da indução, material de via aérea difícil na sala.', ref: 'DAS 2015' },
  { id: 'hipotensao', t: 'Hipotensão refratária', ic: '📉', cor: '#3B82F6', sub: 'causas · vasopressor · vasoplegia',
    agora: ['Checar: ritmo e FC, ECG, volume, profundidade anestésica, ventilação (pressão positiva elevada, PEEP), posição e **PA invasiva**.',
      'Causas graves: **sangramento, anafilaxia, pneumotórax hipertensivo, tamponamento, TEP/embolia gasosa, isquemia/IAM, sepse, insuficiência adrenal, reação ao cimento, bloqueio neuroaxial alto, LAST, hipotermia**.',
      'Ecografia à beira do leito (FAST, ECO, pulmão, VCI) enquanto se trata.',
      'Vasopressor: **fenilefrina/efedrina** (episódio breve); **noradrenalina** em infusão; **vasopressina** 0,03–0,04 U/min na vasoplegia; **adrenalina** se disfunção miocárdica.',
      'Vasoplegia refratária: **azul de metileno 1–2 mg/kg**; hidrocortisona 100 mg se suspeita de insuficiência adrenal.'],
    doses: function (p) {
      if (!p) return [['Noradrenalina', '0,05–0,5 mcg/kg/min'], ['Vasopressina', '0,03–0,04 U/min'], ['Adrenalina', '0,02–0,2 mcg/kg/min'], ['Azul de metileno', '1–2 mg/kg em 20–30 min']];
      return [['Noradrenalina', em_n(p * 0.05, 1) + '–' + em_n(p * 0.5, 1) + ' mcg/min (0,05–0,5 mcg/kg/min)'], ['Vasopressina', '0,03–0,04 U/min (fixa)'], ['Adrenalina', em_n(p * 0.02, 1) + '–' + em_n(p * 0.2, 1) + ' mcg/min (0,02–0,2 mcg/kg/min)'], ['Efedrina', '5–10 mg IV'], ['Fenilefrina', '50–100 mcg IV'], ['Azul de metileno', em_n(p, 0) + '–' + em_n(p * 2, 0) + ' mg em 20–30 min']];
    },
    causas: 'Azul de metileno: evitar com ISRS (síndrome serotoninérgica) e na deficiência de G6PD.', ref: 'SSC 2021 · Miller\'s Anesthesia' },
  { id: 'bradicardia', t: 'Bradicardia', ic: '🐢', cor: '#10B981', sub: 'atropina · adrenalina · marca-passo',
    agora: ['Procurar a causa: **estímulo vagal cirúrgico (parar o estímulo)**, hipóxia, bloqueio neuroaxial alto, betabloqueador, succinilcolina (crianças), dexmedetomidina, remifentanil, hipertensão intracraniana, hipotermia.',
      'Instável (hipotensão, isquemia, rebaixamento): **atropina 1 mg IV** (repetir a cada 3–5 min, máx 3 mg).',
      'Se não responder: **adrenalina 2–10 mcg/min** em infusão ou dopamina 5–20 mcg/kg/min; **marca-passo transcutâneo** (ou transvenoso).',
      'Bloqueio AV de alto grau (Mobitz II ou 3º grau): marca-passo precoce; atropina costuma não resolver.',
      'Criança: oxigenar e ventilar primeiro; atropina 0,02 mg/kg; adrenalina 0,01 mg/kg se PCR.'],
    doses: function (p) {
      if (!p) return [['Atropina adulto', '1 mg IV, repetir até 3 mg'], ['Atropina pediátrica', '0,02 mg/kg (mín 0,1 mg, máx 0,5 mg)'], ['Adrenalina em infusão', '2–10 mcg/min'], ['Dopamina', '5–20 mcg/kg/min']];
      return [['Atropina', p < 40 ? em_n(Math.max(0.1, Math.min(0.5, p * 0.02)), 2) + ' mg (0,02 mg/kg)' : '1 mg IV, repetir até 3 mg'], ['Adrenalina em infusão', '2–10 mcg/min'], ['Dopamina', em_n(p * 5, 0) + '–' + em_n(p * 20, 0) + ' mcg/min (5–20 mcg/kg/min)']];
    },
    causas: 'Bradicardia com hipotensão no neuroeixo alto: efedrina/adrenalina, elevar as pernas e volume.', ref: 'AHA ACLS 2020' },
];

/* ── overlay do cartão ── */
function em_abrirCartao(id) { navigate('p/emerg/' + id); }
function em_fecharCartao() { if (/^#\/p\/emerg\/./.test(location.hash) && !EM_ABAS[location.hash.split('/')[3]]) navigate('p/emerg/cartoes'); }
var EM_ABAS = { cartoes: 1, checklist: 1, timers: 1, pedi: 1 };
function em_cartao(id) { for (var i = 0; i < EM_CARTOES.length; i++) if (EM_CARTOES[i].id === id) return EM_CARTOES[i]; return null; }
function em_desenharCartao() {
  var seg = location.hash.replace(/^#\/?/, '').split('/'), c = seg[0] === 'p' && seg[1] === 'emerg' && seg[2] ? em_cartao(seg[2]) : null;
  var ov = document.getElementById('em-overlay');
  if (!c) { ov.style.display = 'none'; ov.innerHTML = ''; document.body.classList.remove('em-aberto'); return; }
  var p = em_peso(), html = '<div class="em-topo" style="background:' + c.cor + '"><button type="button" class="em-fechar" onclick="em_fecharCartao()" aria-label="Fechar">✕</button><div class="em-titulo">' + c.ic + ' ' + em_esc(c.t) + '</div>' +
    '<button type="button" class="fav-btn em-fav" onclick="favToggle()" aria-label="Fixar nos favoritos">☆</button></div><div class="em-corpo">' +
    '<div class="em-peso"><label for="em-peso-inp">Peso (kg)</label><input id="em-peso-inp" type="number" inputmode="decimal" min="1" max="300" step="0.1" value="' + (p || '') + '" oninput="em_setPeso(this.value)" placeholder="informe para calcular as doses"></div>' +
    '<div class="em-sec-t">AGORA</div><ol class="em-passos">' + c.agora.map(function (s) { return '<li>' + em_fmt(s) + '</li>'; }).join('') + '</ol>' +
    '<div class="em-sec-t">DOSES' + (p ? ' · ' + em_n(p, 1) + ' kg' : '') + '</div><div id="em-doses" class="em-doses">' + em_htmlDoses(c, p) + '</div>' +
    (c.causas ? '<div class="em-sec-t">LEMBRAR</div><div class="em-causas">' + em_fmt(c.causas) + '</div>' : '') +
    (c.id === 'pcr' || c.id === 'pcrped' ? '<button type="button" class="em-btn" onclick="navigate(\'p/emerg/timers\')">⏱ Abrir cronômetro de PCR</button>' : '') +
    '<div class="em-ref">' + em_esc(c.ref) + ' · material educacional: confira o protocolo da sua instituição</div></div>';
  ov.innerHTML = html; ov.style.display = 'block'; ov.scrollTop = 0; document.body.classList.add('em-aberto');
  favAtualizar();
}
function em_htmlDoses(c, p) { return c.doses(p).map(function (d) { return '<div class="em-dose"><span>' + em_fmt(d[0]) + '</span><b>' + em_fmt(d[1]) + '</b></div>'; }).join(''); }
function em_setPeso(v) {
  if (typeof setPesoGlobal === 'function') setPesoGlobal(v);
  var seg = location.hash.replace(/^#\/?/, '').split('/'), c = em_cartao(seg[2]), el = document.querySelector('#em-overlay #em-doses');
  if (c && el) el.innerHTML = em_htmlDoses(c, em_peso());
  em_pediRender();
}

/* ── lista de cartões, checklists, pediatria ── */
var EM_CHECKS = {
  pre: { t: 'Antes da indução (sign in)', itens: ['Identidade, procedimento, lado/sítio e consentimentos (cirúrgico e anestésico) confirmados', 'Jejum e alergias conferidos; avaliação pré-anestésica e exames disponíveis', 'Aparelho checado: rede e cilindro de reserva, circuito, absorvedor, vaporizador, alarmes, analisador de O₂', 'Aspiração, ambu, laringoscópio e videolaringoscópio, tubos e dispositivos supraglóticos testados', 'Monitorização instalada: SpO₂, ECG, PANI, capnografia e temperatura', 'Acesso venoso pérvio; fluidos (aquecidos, se indicado) disponíveis', 'Drogas de indução e de emergência preparadas e rotuladas (vasopressor, atropina, relaxante, hipnótico)', 'Plano de via aérea A/B/C/D falado; risco de aspiração e via aérea difícil avaliados', 'Risco de sangramento > 500 mL (7 mL/kg em crianças): acessos calibrosos e reserva de sangue', 'Antibiótico: dose e horário (até 60 min antes da incisão; cefazolina 2 g, 3 g se ≥ 120 kg)', 'Posição, proteção de olhos e pontos de pressão; aquecimento planejado', 'Profilaxia de náusea e vômito e analgesia multimodal planejadas'] },
  time: { t: 'Antes da incisão (time out)', itens: ['Equipe se apresentou pelo nome e função', 'Paciente, sítio e procedimento confirmados em voz alta', 'Antibiótico administrado nos últimos 60 minutos', 'Eventos críticos previstos: cirurgião (perda de sangue, tempo), anestesia (preocupações do paciente), enfermagem (esterilização, equipamento)', 'Exames de imagem disponíveis, quando relevantes'] },
  out: { t: 'Antes de sair da sala (sign out)', itens: ['Nome do procedimento registrado', 'Contagem de compressas, instrumentais e agulhas conferida', 'Peças cirúrgicas identificadas', 'Problemas com equipamentos relatados', 'Plano de recuperação e analgesia definidos; passagem de caso para a SRPA'] },
};
function em_estadoChecks() { return AG_STORE.get('emChecks', {}); }
function em_renderChecks() {
  var est = em_estadoChecks(), html = '';
  Object.keys(EM_CHECKS).forEach(function (k) {
    var c = EM_CHECKS[k], feitos = c.itens.filter(function (_, i) { return est[k + i]; }).length;
    html += '<div class="card"><div class="card-header ch-cyan"><span class="card-num">' + feitos + '/' + c.itens.length + '</span> ' + em_esc(c.t) + '</div><div class="card-body">';
    c.itens.forEach(function (it, i) {
      html += '<button type="button" class="em-check' + (est[k + i] ? ' on' : '') + '" onclick="em_toggleCheck(\'' + k + '\',' + i + ')"><span class="em-box">' + (est[k + i] ? '✓' : '') + '</span><span>' + em_esc(it) + '</span></button>';
    });
    html += '<button type="button" class="em-limpar" onclick="em_limparChecks(\'' + k + '\')">Limpar lista</button></div></div>';
  });
  document.getElementById('em-checks').innerHTML = html;
}
function em_toggleCheck(k, i) { var est = em_estadoChecks(); if (est[k + i]) delete est[k + i]; else est[k + i] = 1; AG_STORE.set('emChecks', est); em_renderChecks(); }
function em_limparChecks(k) { var est = em_estadoChecks(); Object.keys(est).forEach(function (x) { if (x.indexOf(k) === 0) delete est[x]; }); AG_STORE.set('emChecks', est); em_renderChecks(); }

function em_renderCartoes() {
  document.getElementById('em-lista').innerHTML = EM_CARTOES.map(function (c) {
    return '<button type="button" class="em-card-btn" style="--c:' + c.cor + '" onclick="em_abrirCartao(\'' + c.id + '\')"><span class="em-ic">' + c.ic + '</span><span><b>' + em_esc(c.t) + '</b><small>' + em_esc(c.sub) + '</small></span></button>';
  }).join('');
}

/* pediatria: peso, tubo, lâmina e doses */
function em_pediEstimarPeso(anos, meses) {
  var m = (anos || 0) * 12 + (meses || 0);
  if (m <= 0) return 0;
  if (m < 12) return m / 2 + 4;
  var a = m / 12;
  return a <= 5 ? 2 * a + 8 : 3 * a + 7;
}
function em_pediRender() {
  var el = document.getElementById('em-pedi-out'); if (!el) return;
  var anos = parseFloat(document.getElementById('em-pedi-anos').value) || 0, meses = parseFloat(document.getElementById('em-pedi-meses').value) || 0;
  var pInput = parseFloat(document.getElementById('em-pedi-peso').value) || 0, estimado = false;
  var p = pInput || em_peso();
  if (!p) { p = em_pediEstimarPeso(anos, meses); estimado = p > 0; }
  if (!p) { el.innerHTML = '<div class="alert a-cyan">Informe a idade e/ou o peso.</div>'; return; }
  var idade = anos + meses / 12, linhas = [];
  linhas.push(['Peso', em_n(p, 1) + ' kg' + (estimado ? ' (estimado: use o peso real quando possível)' : '')]);
  if (idade >= 1) {
    var sem = idade / 4 + 4, com = idade / 4 + 3.5;
    linhas.push(['Tubo sem cuff (idade/4 + 4)', em_n(sem, 1) + ' mm'], ['Tubo com cuff (idade/4 + 3,5)', em_n(com, 1) + ' mm'], ['Profundidade oral (idade/2 + 12)', em_n(idade / 2 + 12, 1) + ' cm']);
  } else {
    linhas.push(['Tubo (< 1 ano)', p < 3 ? '3,0 mm sem cuff' : '3,5 mm sem cuff (3,0 com cuff)'], p < 4 ? ['Profundidade oral (peso + 6)', em_n(p + 6, 1) + ' cm'] : ['Profundidade oral (tubo × 3)', '≈ 10,5 cm com tubo de 3,5 mm']);
  }
  linhas.push(['Lâmina', idade < 1 ? 'Miller 0–1' : idade < 2 ? 'Miller 1 / Macintosh 1–1,5' : idade < 6 ? 'Macintosh 2' : 'Macintosh 3']);
  linhas.push(['Máscara laríngea (por peso)', p < 5 ? '1' : p < 10 ? '1,5' : p < 20 ? '2' : p < 30 ? '2,5' : p < 50 ? '3' : p < 70 ? '4' : '5']);
  var man = p <= 10 ? p * 4 : p <= 20 ? 40 + (p - 10) * 2 : 60 + (p - 20);
  linhas.push(['Manutenção (4-2-1)', em_n(man, 0) + ' mL/h'], ['Bolus de cristaloide', em_n(p * 10, 0) + '–' + em_n(p * 20, 0) + ' mL (10–20 mL/kg)'], ['Concentrado de hemácias', em_n(p * 10, 0) + ' mL (10 mL/kg)']);
  linhas.push(['Propofol (indução)', em_n(p * 2, 0) + '–' + em_n(p * 4, 0) + ' mg (2–4 mg/kg; até 5 em lactentes)'], ['Cetamina IV', em_n(p, 0) + '–' + em_n(p * 2, 0) + ' mg (1–2 mg/kg)'], ['Rocurônio', em_n(p * 0.6, 1) + '–' + em_n(p * 1.2, 1) + ' mg (0,6–1,2 mg/kg)'],
    ['Succinilcolina IV', em_n(p * 1, 0) + '–' + em_n(p * 2, 0) + ' mg (1–2 mg/kg; lactentes até 3)'], ['Atropina', em_n(Math.max(0.1, p * 0.02), 2) + ' mg (0,02 mg/kg, mín 0,1)'], ['Fentanil', em_n(p, 0) + '–' + em_n(p * 2, 0) + ' mcg (1–2 mcg/kg)'],
    ['Ondansetrona', em_n(Math.min(4, p * 0.1), 1) + ' mg (0,1 mg/kg, máx 4)'], ['Dexametasona', em_n(Math.min(8, p * 0.15), 1) + ' mg (0,15 mg/kg, máx 8)'], ['Paracetamol', em_n(p * 15, 0) + ' mg (15 mg/kg)'], ['Dipirona', em_n(p * 25, 0) + ' mg (25 mg/kg)'], ['Ibuprofeno', em_n(p * 10, 0) + ' mg (10 mg/kg, > 6 meses)']);
  var spin = p < 5 ? ['1 mg/kg', p * 1] : p <= 15 ? ['0,4 mg/kg', p * 0.4] : ['0,3 mg/kg', p * 0.3];
  linhas.push(['Raqui (bupivacaína 0,5% isobárica)', em_n(spin[1], 1) + ' mg = ' + em_n(spin[1] / 5, 2) + ' mL (' + spin[0] + ')'], ['Caudal (bupivacaína 0,25%)', em_n(p * 0.5, 0) + ' mL lombossacro · ' + em_n(p * 1, 0) + ' mL toracolombar (máx 2,5 mg/kg ≈ 1 mL/kg da solução 0,25%)'],
    ['Choque (PCR)', em_n(p * 2, 0) + ' J, depois ' + em_n(p * 4, 0) + ' J'], ['Adrenalina (PCR)', em_n(p * 0.01, 3) + ' mg (0,1 mL/kg da solução 0,1 mg/mL)']);
  el.innerHTML = linhas.map(function (l) { return '<div class="em-dose"><span>' + em_fmt(l[0]) + '</span><b>' + em_fmt(l[1]) + '</b></div>'; }).join('');
}

/* ── cronômetros ── */
var em_tick = null, em_ctx = null;
function em_beep() {
  try {
    em_ctx = em_ctx || new (window.AudioContext || window.webkitAudioContext)();
    var o = em_ctx.createOscillator(), g = em_ctx.createGain(); o.frequency.value = 880; g.gain.value = 0.15; o.connect(g); g.connect(em_ctx.destination); o.start(); o.stop(em_ctx.currentTime + 0.25);
  } catch (e) {}
  try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {}
}
function em_fmtT(ms) { var s = Math.max(0, Math.floor(ms / 1000)), m = Math.floor(s / 60); return m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); }
function em_pcr() { return AG_STORE.get('emPcr', null); }
function em_pcrIniciar() {
  AG_STORE.set('emPcr', { t0: Date.now(), epi: [], choques: 0, amio: 0, ciclosAvisados: 0, epiAvisada: 0 });
  em_beep();
  try { if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(function () {}); } catch (e) {}
  em_pcrRender();
}
function em_pcrParar() { if (confirm('Encerrar e apagar o cronômetro de PCR?')) { AG_STORE.del('emPcr'); em_pcrRender(); } }
function em_pcrEvento(tipo) {
  var s = em_pcr(); if (!s) return;
  if (tipo === 'epi') { s.epi.push(Date.now()); s.epiAvisada = 0; } else if (tipo === 'choque') { s.choques++; } else if (tipo === 'amio') { s.amio++; }
  AG_STORE.set('emPcr', s); em_pcrRender();
}
function em_pcrRender() {
  var s = em_pcr(), el = document.getElementById('em-pcr'); if (!el) return;
  if (!s) { el.innerHTML = '<button type="button" class="em-btn em-grande" onclick="em_pcrIniciar()">▶ INICIAR PCR</button><p class="em-nota">Marca o tempo total, avisa a cada 2 min (trocar compressor e checar o ritmo) e lembra a adrenalina a cada 3–5 min. Mantém a tela ligada quando o aparelho permite.</p>'; return; }
  var agora = Date.now(), tot = agora - s.t0, ciclo = tot % 120000, nCiclo = Math.floor(tot / 120000) + 1;
  var ultEpi = s.epi.length ? s.epi[s.epi.length - 1] : null, desdeEpi = ultEpi ? agora - ultEpi : null;
  var estadoEpi = !ultEpi ? (tot > 180000 ? 'warn' : 'ok') : desdeEpi >= 300000 ? 'late' : desdeEpi >= 180000 ? 'warn' : 'ok';
  var msgEpi = !ultEpi ? 'Nenhuma adrenalina dada' : 'Última adrenalina há ' + em_fmtT(desdeEpi) + (desdeEpi >= 300000 ? ' — ATRASADA' : desdeEpi >= 180000 ? ' — pode repetir' : '');
  el.innerHTML = '<div class="em-tempo">' + em_fmtT(tot) + '</div><div class="em-sub">tempo total · ciclo ' + nCiclo + '</div>' +
    '<div class="em-ciclo' + (ciclo >= 105000 ? ' alerta' : '') + '"><i style="width:' + (ciclo / 1200) + '%"></i><span>' + (ciclo >= 105000 ? 'TROCAR COMPRESSOR · CHECAR RITMO' : 'próxima checagem em ' + em_fmtT(120000 - ciclo)) + '</span></div>' +
    '<div class="em-epi ' + estadoEpi + '">' + msgEpi + ' · ' + s.epi.length + ' dose(s)</div>' +
    '<div class="em-btns"><button type="button" class="em-btn" onclick="em_pcrEvento(\'epi\')">💉 Adrenalina dada</button><button type="button" class="em-btn" onclick="em_pcrEvento(\'choque\')">⚡ Choque (' + s.choques + ')</button><button type="button" class="em-btn" onclick="em_pcrEvento(\'amio\')">Amiodarona (' + s.amio + ')</button></div>' +
    (s.choques >= 3 && !s.amio ? '<div class="em-epi warn">3 choques: considerar amiodarona 300 mg</div>' : '') +
    '<button type="button" class="em-limpar" onclick="em_pcrParar()">Encerrar</button>';
  var ciclosCompletos = Math.floor(tot / 120000);
  if (ciclosCompletos > s.ciclosAvisados) { s.ciclosAvisados = ciclosCompletos; AG_STORE.set('emPcr', s); em_beep(); }
  if (ultEpi && desdeEpi >= 180000 && !s.epiAvisada) { s.epiAvisada = 1; AG_STORE.set('emPcr', s); em_beep(); }
}
function em_sw(k) { return AG_STORE.get('emSw' + k, null); }
function em_swToggle(k) {
  var s = em_sw(k);
  if (s && s.t0 && !s.parado) AG_STORE.set('emSw' + k, { t0: s.t0, parado: Date.now() });
  else AG_STORE.set('emSw' + k, { t0: Date.now() });
  em_swRender();
}
function em_swZerar(k) { AG_STORE.del('emSw' + k); em_swRender(); }
function em_swRender() {
  [['po', 'Pré-oxigenação / apneia', null], ['tq', 'Torniquete', 5400000]].forEach(function (d) {
    var el = document.getElementById('em-sw-' + d[0]); if (!el) return;
    var s = em_sw(d[0]), rodando = s && s.t0 && !s.parado, ms = s ? (s.parado || Date.now()) - s.t0 : 0;
    var alerta = d[2] && ms >= d[2];
    el.innerHTML = '<div class="em-sw-nome">' + d[1] + '</div><div class="em-sw-t' + (alerta ? ' alerta' : '') + '">' + em_fmtT(ms) + '</div>' +
      (d[0] === 'tq' ? '<div class="em-nota">Alerta aos 90 min; o limite habitual é 120 min (membro superior 60–90 min).</div>' : '<div class="em-nota">Conte o tempo de apneia na laringoscopia; volte a ventilar se SpO₂ cair.</div>') +
      '<div class="em-btns"><button type="button" class="em-btn" onclick="em_swToggle(\'' + d[0] + '\')">' + (rodando ? '⏸ Parar' : s && s.parado ? '▶ Continuar' : '▶ Iniciar') + '</button><button type="button" class="em-btn sec" onclick="em_swZerar(\'' + d[0] + '\')">Zerar</button></div>';
  });
}
function em_loop() {
  var ativa = document.getElementById('screen-p-emerg') && document.getElementById('screen-p-emerg').classList.contains('active');
  if (!ativa) { if (em_tick) { clearInterval(em_tick); em_tick = null; } return; }
  em_pcrRender(); em_swRender();
}
function em_iniciarLoop() { if (!em_tick) em_tick = setInterval(em_loop, 500); em_loop(); }

/* ── início da tela ── */
function em_init() {
  if (!document.getElementById('em-lista')) return;
  em_renderCartoes(); em_renderChecks(); em_pcrRender(); em_swRender();
  var p = em_peso(); if (p && !document.getElementById('em-pedi-peso').value) document.getElementById('em-pedi-peso').value = '';
  em_pediRender();
}
/* chamado pelo roteador depois de ativar a tela */
function em_aoAbrir() { em_init(); em_desenharCartao(); em_iniciarLoop(); }

/* ══════════ FAVORITOS ══════════ */
function fav_lista() { return AG_STORE.get('favoritos', []); }
function fav_titulo() {
  var seg = location.hash.replace(/^#\/?/, '').split('/');
  if (seg[0] === 'p' && seg[1] === 'emerg' && seg[2] && em_cartao(seg[2])) { var c = em_cartao(seg[2]); return { ic: c.ic, t: c.t }; }
  var scr = document.querySelector('.screen.active'); if (!scr) return { ic: '⭐', t: location.hash };
  var el = scr.querySelector('.top-title') || scr.querySelector('.topbar-brand') || scr.querySelector('.tr-header-titulo');
  var t = el ? (el.childNodes[0] && el.childNodes[0].nodeType === 3 ? el.childNodes[0].textContent : el.textContent) : 'Tela';
  t = t.replace(/\s+/g, ' ').trim();
  var ab = scr.querySelector('.tab-bar .tab-btn.active'); if (ab && ab.textContent.trim()) t += ' · ' + ab.textContent.trim().toLowerCase();
  return { ic: '⭐', t: t };
}
function favToggle() {
  var h = location.hash || '#/', lista = fav_lista(), i = -1;
  lista.forEach(function (f, k) { if (f.h === h) i = k; });
  if (i >= 0) lista.splice(i, 1);
  else { var tt = fav_titulo(); lista.unshift({ h: h, t: tt.t, ic: tt.ic }); lista = lista.slice(0, 24); }
  AG_STORE.set('favoritos', lista); favAtualizar();
  if (typeof mostrarAviso === 'function') mostrarAviso(i >= 0 ? 'Removido dos favoritos.' : 'Fixado nos favoritos (início e Prático).', 1800);
}
function favAtualizar() {
  var h = location.hash || '#/', lista = fav_lista(), on = lista.some(function (f) { return f.h === h; });
  document.querySelectorAll('.fav-btn').forEach(function (b) { b.textContent = on ? '★' : '☆'; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  ['fav-launcher', 'fav-pratico'].forEach(function (id) {
    var el = document.getElementById(id); if (!el) return;
    if (!lista.length) { el.innerHTML = ''; el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.innerHTML = '<div class="fav-titulo">⭐ FAVORITOS</div><div class="fav-chips">' + lista.map(function (f) { return '<button type="button" class="fav-chip" onclick="location.hash=\'' + f.h.replace(/'/g, '') + '\'">' + em_esc(f.ic) + ' ' + em_esc(f.t) + '</button>'; }).join('') + '</div>';
  });
}
function favInjetar() {
  var scr = document.querySelector('.screen.active'); if (!scr) return;
  var barra = scr.querySelector('.top-bar') || scr.querySelector('.topbar') || scr.querySelector('.tr-global-header-inner');
  if (barra && !barra.querySelector('.fav-btn') && scr.id !== 'screen-launcher' && !scr.classList.contains('em-sem-fav')) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'fav-btn'; b.setAttribute('aria-label', 'Fixar nos favoritos'); b.textContent = '☆'; b.onclick = favToggle;
    barra.appendChild(b);
  }
  favAtualizar();
}
