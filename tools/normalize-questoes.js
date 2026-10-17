// B1: normaliza o esquema do banco de questões (gabarito verdadeiro, justificativa, 4 alternativas A-D).
const fs = require('fs'), path = require('path');
const file = path.resolve(__dirname, '../data/questoes.json');
const temas = JSON.parse(fs.readFileSync(file, 'utf8'));

// Correção manual das 3 questões cujo gabarito era "E" sem alternativa E.
const FIX = {
  crises_31: { D: 'Embolia de líquido amniótico (síndrome anafilactoide da gravidez); tratamento de suporte imediato: RCP com deslocamento uterino, IOT/ventilação, vasopressores, correção agressiva da coagulopatia (fibrinogênio, PFC, plaquetas) e considerar ECMO', resposta: 'D' },
  crises_39: { D: 'Síndrome neuroléptica maligna por haloperidol; diferencia-se da HM pela ausência de exposição a halogenados/succinilcolina, início em horas-dias e rigidez em cano de chumbo; tratar com suspensão do antipsicótico, bromocriptina, dantrolene e resfriamento', resposta: 'D' },
  obstetricia_22: { D: 'Dose teste positiva para injeção intravascular (↑FC ≥20 bpm em 30–60 s pela adrenalina); não administrar a dose peridural — retirar/reposicionar o cateter e repetir o teste', resposta: 'D' },
};

let n = 0, corrigidas = 0, semJust = 0, dist = {};
for (const t of temas) {
  for (const q of t.questoes) {
    n++;
    const fix = FIX[q.id];
    if (fix) { Object.assign(q.alternativas, { D: fix.D }); q.resposta_correta = fix.resposta; }
    const gab = q.resposta_correta || q.resposta;
    if (gab !== q.resposta) corrigidas++;
    q.resposta = gab;
    if (!q.justificativa && q.explicacao) q.justificativa = q.explicacao;
    if (!q.justificativa) semJust++;
    if (q.justificativa) q.justificativa = q.justificativa.replace(/\bB alternativa ([A-D])\b/g, 'A alternativa $1');
    delete q.resposta_correta; delete q.explicacao;
    // ordem canônica das chaves
    const keys = ['A', 'B', 'C', 'D'];
    const alts = {}; for (const k of keys) alts[k] = q.alternativas[k];
    if (keys.some(k => !alts[k])) throw new Error('alternativa faltando em ' + q.id);
    if (!keys.includes(q.resposta)) throw new Error('gabarito inválido em ' + q.id + ': ' + q.resposta);
    q.alternativas = alts;
    dist[q.resposta] = (dist[q.resposta] || 0) + 1;
    const ordered = { id: q.id, tema: q.tema || t.titulo, subtopico: q.subtopico || '', enunciado: q.enunciado, alternativas: q.alternativas, resposta: q.resposta, justificativa: q.justificativa || '' };
    Object.keys(q).forEach(k => delete q[k]); Object.assign(q, ordered);
  }
}
fs.writeFileSync(file, JSON.stringify(temas, null, 1) + '\n');
console.log({ total: n, gabaritos_corrigidos: corrigidas, sem_justificativa: semJust, distribuicao: dist });
