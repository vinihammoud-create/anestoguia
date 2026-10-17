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
