# Changelog — AnestoGuia

## 3.0.0 — 2026-10-17
### Estrutura
- App dividido em arquivos (`index.html` + `css/` + `js/` + `data/questoes.json` + `modulos/*.html`), sem etapa de build. Módulos de estudo e banco de questões carregam sob demanda (carga inicial ~200 KB em vez de 3,3 MB).
- Roteador por hash (`#/p/plantao/inducao`, `#/e/preop/jejum`, `#/t`): o botão "voltar" do celular volta de tela, e cada tela/aba tem link próprio.
- Service worker registrado (antes não era): *network-first* com fallback offline e aviso de "nova versão".
- `AG_STORE` passa a persistir em `localStorage` (peso, última tela, estatísticas do treino).
- Verificador estático `tools/check.js` (ids duplicados, handlers sem função, imagens, banco de questões, manifest/sw).
### Correções
- **Treino:** 151 questões marcavam o gabarito errado (campo `resposta` fixo em "D" enquanto o gabarito real estava em `resposta_correta`); 120 questões mostravam "undefined" na justificativa; 3 questões tinham gabarito "E" sem alternativa E (`crises_31`, `crises_39`, `obstetricia_22`).
- Aba LAST do modo Prático (link apontava para tela inexistente).
- Busca global ligada ao DOM (campo no home do Prático) e índice corrigido.
- Removidos script e links da Perplexity.
- Rodapés e badges com versões/diretrizes inconsistentes substituídos pela versão única do app.
### Treino
- Modo "Revisar erros", estatísticas por tema (melhor resultado) persistentes, subtema exibido por questão.
### Arquivo
- `arquivo/anestoguia-v1.zip`: cópia do repositório v1 (`anestoguia`), cujo conteúdo já estava todo incorporado aqui.

### Mobile (fase C, mesma versão)
- Barra inferior fixa (Início · Prático · Estudos · Treino) com área segura do iPhone; alvos de toque ≥ 44 px em abas, accordions, checklists e cartões de droga.
- Tamanho mínimo de fonte 11 px (eram 8–10 px em 145 lugares); inputs com 16 px (sem zoom automático no iOS); `100dvh`, `viewport-fit=cover`.
- Tabelas largas com sombra indicando rolagem lateral; tabelas compactas de 2 colunas passam a quebrar linha em vez de rolar.
- Imagens convertidas para WebP (3,3 MB → 373 KB), com `loading="lazy"` e dimensões fixas.
- Fontes Inter e JetBrains Mono locais (offline), sem dependência do Google Fonts.
- Novos ícones do app (normal e maskable); `role="tablist"/"tab"`, `aria-expanded` nos accordions, foco visível, `prefers-reduced-motion`.
- Launcher sem efeitos só de mouse; badges de diretrizes desatualizadas substituídos pela versão do app.
- `tools/shots.js` (capturas 390×844 + detecção de rolagem horizontal) e `tools/make-icons.js`.

## 3.1.0 — 2026-10-17 (fase D1 — Pré-operatório)
- Revisão médica completa do módulo Pré-operatório: ACC/AHA 2024 (passo a passo, DASI, BNP/troponina, janelas após stent 3/6/12 meses, betabloqueador/AAS/IECA com POISE, POISE-2 e STOP-or-NOT), ESC 2022, ARISCAT corrigido (pontos de idade, incisão e duração), STOP-BANG em 3 faixas, RCRI com validação CCS 2017, MINS pela definição VISION, PAUSE para DOACs, BRIDGE para varfarina, anemia/PBM pela definição da OMS, iSGLT2 3 dias, metimazol no hipertireoidismo, dose de estresse de corticoide atualizada, jejum pediátrico ESAIC 2022, cartão GLP-1 (ASA 2023 vs consenso 2024), US gástrico com graus de Perlas, NVPO pelos consensos 2020/2025 (palonosetrona, aprepitanto, haloperidol), intervalos ASRA 2018/2025 para neuroeixo (rivaroxabana 72 h, não 22–26 h), questões com 4 alternativas e gabaritos revistos, casos corrigidos (ranitidina indisponível, RCRI 0, intervalos).
- Novos cartões em todos os módulos revisados: "Pérolas de prova — TEA/TSA", "Como é no Brasil" e "Referências" com links.
- Repositórios: `anestoguiar1` renomeado para `anestoguia`; v1 arquivado como `anestoguia-v1-arquivado`; endereço antigo mantido com página de redirecionamento.
