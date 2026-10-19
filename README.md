# AnestoGuia

Guia clínico de anestesiologia para uso no celular, com três modos:

- **Prático** — plantão (fases da anestesia), situações especiais, calculadoras de doses e infusão, farmacologia, ventilação mecânica, regional, escalas clínicas, ERAS/PONV e a tela **Emergência**: 10 cartões em tela cheia (PCR, hipertermia maligna, LAST, anafilaxia, broncoespasmo, via aérea difícil…) com doses pelo peso, checklist de cirurgia segura, cronômetros (PCR, apneia, torniquete) e pediatria.
- **Estudos** — 29 módulos em profundidade (pré-operatório, farmacologia, via aérea, raqui, obstetrícia, pediatria, crises, POCUS, cardíaca/CEC, torácica/OLV, neuroanestesia, trauma e queimados, transplantes, dor crônica, aparelho e física, ética/CFM, estatística…), cada um com pérolas de prova, "Como é no Brasil" e referências.
- **Treino** — mais de mil questões comentadas no estilo TEA/TSA (SBA), por tema, modo aleatório, **simulado cronometrado** (40, 60 ou 100 questões), **revisão de erros com repetição espaçada**, estatísticas por tema e exportação do progresso.
- **Favoritos** — o botão ★ fixa qualquer tela, aba ou cartão no início.

Feito por **Vinicius Hammoud** (anestesiologista). Uso educacional: não substitui o julgamento clínico, bulas e protocolos institucionais.

## Usar

Site publicado: https://vinihammoud-create.github.io/anestoguia/

No celular, abra o link e use "Adicionar à tela inicial" (Safari) ou "Instalar app" (Chrome). Funciona offline após a primeira visita.

## Estrutura (sem build)

```
index.html          casca do app: launcher, modo Prático, menu de Estudos, Treino
css/app.css         estilos
js/store.js         AG_STORE (localStorage)
js/calc.js          calculadoras clínicas (TCI, fluidos, MABL, Na, K, gasometria)
js/app.js           funções do app (abas, accordions, calculadoras do Prático, busca, timers)
js/router.js        navegação por hash, histórico, carregamento dos módulos
js/treino.js        treino: temas, simulado, revisão espaçada, exportar/importar progresso
js/plantao.js       tela Emergência (cartões, checklist, cronômetros, pediatria) e favoritos
data/questoes.json  banco de questões (temas → questões A–D com gabarito e justificativa)
modulos/<id>.html   um arquivo por módulo de Estudos, carregado sob demanda
sw.js               service worker (network-first, fallback offline)
tools/check.js      verificação estática — rode antes de publicar
tools/test-all.js   roda todos os testes (estático, calculadoras, navegador)
tools/bump-sw.js    atualiza a versão do cache do service worker
arquivo/            versões antigas (v1)
```

## Desenvolver

Qualquer servidor estático serve (os módulos são carregados com `fetch`, então abrir o arquivo direto com `file://` não funciona):

```
npx serve .        # ou: python -m http.server 8080
node tools/check.js
```

Antes de publicar: `node tools/test-all.js` (precisa do Edge ou Chrome instalado para os testes de navegador) sem falhas e `node tools/bump-sw.js` (para os celulares baixarem a versão nova).

## Formato de uma questão

```json
{
  "id": "farma_01",
  "tema": "Farmacologia Anestésica",
  "subtopico": "TCI de propofol",
  "enunciado": "…",
  "alternativas": { "A": "…", "B": "…", "C": "…", "D": "…" },
  "resposta": "D",
  "justificativa": "… (fonte, ano)",
  "modulo": "farma",
  "tipo": "conceito"
}
```

## Licença

Conteúdo e código © Vinicius Hammoud. Uso pessoal e educacional.
