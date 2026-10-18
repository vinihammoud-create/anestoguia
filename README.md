# AnestoGuia

Guia clínico de anestesiologia para uso no celular, com três modos:

- **Prático** — plantão (fases da anestesia), situações especiais, calculadoras de doses e infusão, farmacologia, ventilação mecânica, regional, escalas clínicas, ERAS/PONV e cartões de crise.
- **Estudos** — 19 módulos em profundidade (pré-operatório, farmacologia, via aérea, raqui, obstetrícia, pediatria, crises, POCUS…), cada um com revisão rápida, casos clínicos e questões.
- **Treino** — banco de questões comentadas no estilo TEA/TSA (SBA), por tema, modo aleatório e revisão de erros.

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
js/treino.js        treino de questões
data/questoes.json  banco de questões (temas → questões A–D com gabarito e justificativa)
modulos/<id>.html   um arquivo por módulo de Estudos, carregado sob demanda
sw.js               service worker (network-first, fallback offline)
tools/check.js      verificação estática — rode antes de publicar
tools/bump-sw.js    atualiza a versão do cache do service worker
arquivo/            versões antigas (v1)
```

## Desenvolver

Qualquer servidor estático serve (os módulos são carregados com `fetch`, então abrir o arquivo direto com `file://` não funciona):

```
npx serve .        # ou: python -m http.server 8080
node tools/check.js
```

Antes de publicar: `node tools/check.js` sem erros e `node tools/bump-sw.js` (para os celulares baixarem a versão nova).

## Formato de uma questão

```json
{
  "id": "farma_01",
  "tema": "Farmacologia Anestésica",
  "subtopico": "TCI de propofol",
  "enunciado": "…",
  "alternativas": { "A": "…", "B": "…", "C": "…", "D": "…" },
  "resposta": "D",
  "justificativa": "… (fonte, ano)"
}
```

## Licença

Conteúdo e código © Vinicius Hammoud. Uso pessoal e educacional.
