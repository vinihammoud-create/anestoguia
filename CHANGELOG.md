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

## 3.1.0 — 2026-10-18 (fase D3 — Via Aérea Difícil)
- Revisão médica do módulo Via Aérea Difícil pela **DAS 2025** (Ahmad et al., Br J Anaesth 2026;136:283), que substitui a DAS 2015: oxigenação contínua ("peroxigenação"), videolaringoscopia como técnica padrão, 3+1 tentativas, DSG de 2ª geração, Plano C com bloqueio pleno, eFONA bisturi-bougie-tubo (membrana impalpável: incisão vertical 8–10 cm), cânula/jato não recomendados no adulto.
- Intubação acordada pela **DAS ATI 2020** (sTOP, lidocaína ≤9 mg/kg peso magro, remifentanil TCI ou dexmedetomidina, HFNO, 3+1); THRIVE com números de Patel 2015; incidências de VBM difícil (Kheterpal) e CICO (NAP4); citação errada da DAS 2015 corrigida (Frerk, Br J Anaesth 2015).
- Termo CICV substituído por **CICO** (VAD, Crises e cartões do menu); questões com 4 alternativas; Questão 4 reescrita (supraglótico = Plano B, antes de declarar CICO); cartões "Pérolas de prova", "Como é no Brasil" e "Referências".
- Correções de estrutura: no módulo VAD, uma `<div>` sem fechar escondia as abas a partir de "Técnicas"; no módulo Intubação, o cartão "03 Mallampati" estava fundido ao de Cormack-Lehane (restaurado) e as abas ficavam fora da tela do módulo.
- `tools/check.js` agora acusa `<div>` desbalanceadas e abas aninhadas.
- Rodapés de todos os módulos padronizados (autor "Anestesiologista", versão do app no lugar de "R1 · SBA 2025 · ESAIC 2025…"); a versão agora aparece também nos módulos carregados sob demanda.

## 3.1.0 — 2026-10-18 (fase D2 — Farmacologia)
- Revisão médica completa do módulo Farmacologia (167 trechos):
  - **Hipnóticos:** ensaio RSI (NEJM 2025), etomidato × cetamina no crítico; etomidato vem pronto (não "diluído em água destilada"); escetamina S(+) com ~2× a potência (era "levocetamina 2–4×"); propofol pediátrico 2,5–3,5 mg/kg; alergia a ovo não contraindica o propofol; novo cartão de remimazolam.
  - **Inalatórios:** CAM-acordado/CAM-BAR e fatores que alteram a CAM; coeficientes padronizados; efeito de concentração separado do efeito do segundo gás; hipóxia por difusão; N₂O (gás intraocular; deixou de constar como "CI em gestantes"); Composto A pela bula atual; impacto ambiental; HM pelo MHAUS.
  - **Opioides:** fentanil intratecal 10–25 mcg; remifentanil (bolus lento permitido, glicina, espaço morto do equipo); tramadol (FDA 2017); dipirona e gabapentinoides na analgesia multimodal; buprenorfina perioperatória.
  - **BNM e reversão:** diretriz ASA 2023 (monitorização quantitativa; neostigmina só com TOFR ≥0,4); sugamadex com afinidade correta, contraceptivos, anafilaxia e reintubação; número de dibucaína; duração do rocurônio e do cisatracúrio corrigida.
  - **Anestésicos locais:** doses máximas pela bula; vasoconstritor em dedos (WALANT); LAST pelo ASRA 2020.
  - **Vasoativos:** noradrenalina periférica (SSC 2021); vasopressina fora da PCR; atropina 1 mg; anafilaxia pelo NAP6; choque cardiogênico.
  - **Adjuvantes e MPA:** lidocaína IV (consenso Foo 2021, ALLEGRO 2025); dexametasona (PADDI); midazolam no idoso (I-PROMOTE); NVPO pelos consensos 2020/2025; disponibilidade no Brasil.
- Questões com 4 alternativas. A da raqui hiperbárica dizia que a solução "se acumula na lordose lombar" (corrigido: escorre para T5–T6 e o sacro). A do sugamadex deixou de tratá-lo como resgate de CICO.
- Casos clínicos:
  - Choque: um único indutor em dose reduzida (antes, etomidato e cetamina em dose cheia).
  - Cesárea: "DAS 2022" inexistente trocada pela OAA/DAS 2015, e ~1 CAM até o nascimento (NAP5).
  - LAST: o bloqueio do caso é ilioinguinal, não femoral.
  - Reversão: classificação de profundidade do bloqueio pela ASA 2023.
- Cartões "Pérolas de prova", "Como é no Brasil" e "Referências" (16 fontes).

## 3.1.0 — 2026-10-18 (fase D10 — Crises)
- **Segurança de doses (anafilaxia):** adrenalina IV no grau II era "0,01 mg/kg (máx 0,5 mg)" e no grau III/IV "0,1–1 mg IV bolus"; agora 10–20 mcg (grau II), 50–100 mcg (grau III), 1 mg só na PCR, infusão após ≥3 bolus. O mesmo erro foi corrigido no Prático ("epinefrina 0,1 mg IV") e no broncoespasmo ("adrenalina 0,1–0,3 mg SC/IV" → 5–10 mcg IV titulados).
- **Hipertermia maligna (MHAUS):** dantroleno até controle (não "máx 10 mg/kg"), filtros de carvão ativado em vez de trocar o aparelho, sem bloqueador de canal de cálcio, resfriar até 38 °C, recrudescência ~20% com dantroleno 1 mg/kg a cada 4–6 h, CEDHIMA/UNIFESP.
- **Anafilaxia (NAP6):** agentes mais comuns, cristaloide 20 mL/kg, corticoide como 2ª linha (não previne reação bifásica), resgate com vasopressina/glucagon/ECMO, critério de triptase.
- **LAST (checklist ASRA 2020):** bupivacaína 2,5/3 mg/kg, evitar lidocaína como antiarrítmico, tempos de monitorização, prevenção com ultrassom.
- **VAD emergência (DAS 2025):** plano C correto (máscara com bloqueio pleno), eFONA bisturi-bougie-tubo com giro de 90° e técnica para membrana impalpável, cânula com jato não é 1ª escolha, 3+1 tentativas.
- **PCR (AHA 2025):** 5H/5T, RCP em prona e na gestante, metas de EtCO₂/diastólica, adrenalina após o 2º choque, amiodarona ou lidocaína, desfibrilação sequencial dupla, metas pós-PCR. "AHA 2020" removido de todo o app.
- **Broncoespasmo:** tubo obstruído = pico ↑ com platô normal (tabela dizia platô ↑), salbutamol 8–10 jatos pelo TOT, aminofilina com papel limitado.
- **Prático:** calculadora de emergência sem teto (adrenalina PCR 1,2 mg em 120 kg; atropina 1,6 mg em 80 kg) → adrenalina máx 1 mg, atropina 0,5 mg/dose na criança e 1 mg no adulto; doses pediátricas da aba Pediatria nunca eram calculadas (ids sem código) → agora calculadas; TOT com cuff como padrão; jejum ASA 2023 / ESAIC 2022; neostigmina pela ASA 2023.
- Cartões "Pérolas de prova", "Como é no Brasil" e "Referências" (AHA 2025 partes 9–11, DAS 2025, ASRA, NAP6, MHAUS).

## 3.1.0 — 2026-10-18 (fase D12 — Obstetrícia)
- **Ocitocina:** bolus de "5–10 UI IV" (causa hipotensão e isquemia) → bolus de 1 UI lento + infusão titulada na cesárea (consenso internacional 2019); carbetocina como dose única; metilergometrina "nunca IV".
- **Plaquetas e neuraxial:** limiar de 75.000 → ≥70.000 estável sem coagulopatia (consenso SOAP 2021), com conduta para 50.000–70.000; retirada do cateter e reavaliação em 6 h.
- **Pré-eclâmpsia:** critérios pelo ACOG PB 222 (2020), não "ACOG 2023"; nifedipina pode ser usada com sulfato de magnésio; tabela de níveis de magnésio corrigida (8–10 perde reflexo; 12–14 paralisia respiratória; ≥25 PCR); labetalol "1 mg/kg antes da indução" → 10–20 mg titulado + remifentanil/alfentanil/lidocaína; magnésio por 24 h pós-parto (não 24–48 h).
- **Raqui/cesárea:** noradrenalina com dose correta e como alternativa (a citação "SOAP 2023 — noradrenalina 1ª escolha" não existe; removida do módulo e do Prático); morfina intratecal até 150 mcg; CPPD pelo consenso 2023 (blood patch com alívio de ~60–70%, não ">90%"); hematoma epidural com plaquetas <70.000.
- **Peridural:** teste de dose pelos critérios corretos (↑FC ≥10 bpm fora da contração); extensão para cesárea; categoria 1 (≤30 min) × categoria 2 (≤75 min — o caso dizia "categoria 2 em 30 min").
- **HPP, ELA, PCR:** ácido tranexâmico com o efeito do atraso (WOMAN/CRASH-2), fibrinogênio >200, acretismo, PCR na gestante pela AHA 2025 (cesárea perimortem ≤5 min, ECPR).
- **Prático:** dexametasona intratecal deixa de ser listada como "SOAP 2023" (não recomendada); técnica de LOR corrigida.
- Tabela de farmacologia: vasopressina deixa de ser "contraindicada"; neostigmina; cartões "Pérolas de prova", "Como é no Brasil" e "Referências".

## 3.1.0 — 2026-10-18 (fase D11 — Pediatria)
- **Doses e fatos corrigidos:** CAM do sevoflurano com valores consistentes (6–12 meses 2,5%, 1–3 anos 2,6%; a tela dava 2,8% e 2,6% em lugares diferentes); manutenção "sevoflurano 1,5–2,5 CAM" → ~0,8–1,2 CAM; morfina em lactentes (glucuronidação **imatura** — o texto dizia "aumentada"); adrenalina no broncoespasmo pediátrico 0,01 mg/kg → 1 mcg/kg titulada (0,01 mg/kg é dose de PCR); succinilcolina no laringoespasmo 0,5–1 mg/kg (caso clínico usava 1,5 mg/kg).
- **Jejum pediátrico pela ESAIC 2022 (6-4-3-1):** leite materno 3 h (estava 4 h), fórmula 4 h, líquidos claros 1 h — igual ao módulo Pré-operatório.
- **Succinilcolina:** "contraindicada de rotina em <8 anos" era regra inexistente; o aviso da FDA vale para o uso eletivo de rotina em crianças; questão 2 reescrita.
- **Atropina:** sem dose mínima de 0,1 mg (PALS 2020 abandonou; "bradicardia paradoxal" não confirmada), máx 0,5 mg/dose — módulo, calculadora e doses de emergência.
- **Alergia a ovo/soja** deixa de ser contraindicação do propofol; PRIS descrita como "evitar sedação prolongada em UTI".
- **Anatomia:** o "ponto mais estreito = cricoide" é apresentado com a ressalva da RM (Litman 2003); lâmina reta vs curva sem afirmação de superioridade; videolaringoscopia; cuff de baixa pressão apoiado no ensaio de Weiss 2009 (a citação "King 2023" não existia).
- **Hipertermia maligna (MHAUS):** dantroleno até controle, sem água "quente", filtros de carvão em vez de trocar o aparelho, recrudescência ~20% (1 mg/kg a cada 4–6 h por ≥24 h), resfriar até 38 °C, amiodarona em vez de procainamida.
- **IVAS:** conduta coerente (leve → prosseguir; fatores de risco → adiar 2–4 semanas); **endocardite:** profilaxia não indicada para CIV não corrigida; neonato: alvo de SpO₂ e hiperoxia corrigidos; TOT com cuff.
- Questões com 4 alternativas (Cole, succinilcolina, CAM, agitação, SpO₂ do prematuro).
- **Calculadora pediátrica:** succinilcolina 2 mg/kg só em <2 anos; atropina sem mínimo; texto de adrenalina IV/IM; cartões "Pérolas de prova", "Como é no Brasil" e "Referências".

## 3.1.0 — 2026-10-18 (fase D7 — Raquianestesia e Peridural)
- **Anticoagulação (ASRA 2018/2025):** o intervalo "HBPM → próxima dose = 4 h" estava errado (a 1ª dose profilática vem ≥12 h após a punção; a terapêutica ≥24 h; 4 h só após retirar o cateter); rivaroxabana/apixabana 48–72 h → 72 h; dabigatrana 72–96 h → 72–120 h; clopidogrel/ticagrelor 5–7 dias; plaquetas ≥70.000 estáveis (SOAP 2021). A explicação da questão 4 repetia o erro da dose seguinte. A "ASRA 2022" citada não existe.
- **Neuroaxe:** bloqueio simpático 2–6 dermátomos acima do sensitivo (era "2"); risco de lesão permanente ~1–2/100.000 (NAP3; o módulo trazia "<4:10.000" e "<1:50.000" em lugares diferentes); lidocaína 5% hiperbárica (TNS e cauda equina); estenose aórtica (técnica titulada/CSE aceita); o ultrassom como alternativa à palpação do espaço.
- **Morfina intratecal:** 50–150 mcg (era "100–200"), sem conservante, vigilância horária por 12 h; "não dar opioide sistêmico" virou cautela com sedativos.
- **CPPD pelo consenso 2023:** blood patch com alívio de ~60–70% (o módulo dizia 70–90%), indicação na cefaleia persistente moderada/grave (idealmente >24 h), alternativas por bloqueio de nervo.
- **Emergências:** naloxona titulada (40–100 mcg, não 100–400 mcg), adrenalina 10–100 mcg no bloqueio total, emulsão lipídica em 2–3 min.
- **Peridural:** teste de dose (↑FC ≥10 bpm), LOR com ar ou soro, plaquetas ≥70.000 na torácica, morfina peridural 1–3 mg.
- Questões com 4 alternativas; correção de erros de digitação ("cesaréa", "painé", "prunído", "orificio", "tracção").
- Cartões "Pérolas de prova", "Como é no Brasil" e "Referências".

## 3.1.0 — 2026-10-19 (fase D8 — Analgesia multimodal)
- **Equianalgesia:** a tabela e a questão 1 davam "tramadol 100–120 mg ≈ morfina IV 10 mg" e um gabarito de 30 mg/dia IV com explicação que calculava 10 mg; agora tramadol VO 300 mg ≈ morfina VO 30 mg ≈ morfina IV ~10 mg (gabarito B, início com 25–50% da dose calculada).
- **Doses de anestésico local:** o protocolo de artroplastia somava bloqueio bilateral (2 × 20 mL de ropivacaína 0,5%) com 200 mL a 0,2% de infiltração (>600 mg). Agora a dose total de AL (bloqueio + infiltração) fica ≤3 mg/kg.
- **Lidocaína IV:** doses de 2–3 mg/kg/h saem; limite 1,5 mg/kg/h (peso ideal), ≤24 h, sem associar bloqueio regional (consenso Foo 2021). O benefício no íleo vem de metanálises antigas; o ensaio ALLEGRO (JAMA 2025) foi negativo — a questão 3 foi reescrita em torno dele.
- **Gabapentinoides:** removidos como parte de rotina (Verret 2020: efeito abaixo do clinicamente relevante, sem redução consistente de dor crônica); o texto dizia "evidência forte/moderada-forte" e o caso de SAOS combinava pregabalina com opioide.
- **AAS e neuroaxe:** o caso de toracotomia dizia "AAS: aguardar 7 dias para epidural"; AAS isolado não contraindica (ASRA). Paravertebral segue as regras do neuroaxe.
- **Dipirona:** risco de agranulocitose apresentado com a variação real das estimativas e a situação regulatória atual (não "decisão política").
- **Opioides:** morfina IT 50–150 mcg, alta sem codeína/tramadol de rotina, hidromorfona (H3G), buprenorfina mantida no perioperatório, cetamina "fortemente recomendada" (não "obrigatória"); paracetamol sem "COX-3"; coxibes e CABG corrigidos; ranitidina retirada.
- **Revisão rápida:** "fentanil 0,01 mg = 1 mcg" (falso) → 0,1 mg = 100 mcg.
- Questões com 4 alternativas; cartões "Pérolas de prova", "Como é no Brasil" e "Referências".

## 3.1.0 — 2026-10-19 (fase D9 — Volemia e Hemoterapia)
- **SMART:** o módulo dava "OR 0,82 para MAKE30"; o OR ajustado foi 0,90 (14,3% × 15,4%); 0,82 é o OR do SALT-ED.
- **Cristaloides:** "adrenalina IV → SF porque o Ca²⁺ do RL precipita adrenalina" era falso (o problema é RL com sangue e ceftriaxona em neonatos); "hipercalemia: evitar RL/Plasmalyte" também (K⁺ de 4–5 mEq/L não piora; o SF causa acidose e piora o K⁺).
- **Transfusão (AABB 2023):** limiar 7 g/dL (7,5 em cirurgia cardíaca; 8 em ortopédica ou cardiopata); a frase "erro médico documentável" saiu.
- **PROPPR:** 1:1:1 não reduziu a mortalidade global (menos morte por exsanguinação), ao contrário do que o módulo dizia.
- **HES:** EMA recomendou a suspensão da comercialização em 2022 (o texto dizia "restringiu em 2018"); removido o "uso aceitável"; a citação "GUY Trial 2022" (inexistente) saiu; albumina na HRS-AKI com a dose atual (1 g/kg D1, depois 20–40 g/dia).
- **Cell saver:** câncer deixou de ser contraindicação absoluta (filtro leucocitário). **Ácido tranexâmico:** convulsão com doses altas em cirurgia cardíaca.
- Questões com 4 alternativas; cartões "Pérolas de prova", "Como é no Brasil" e "Referências".

## 3.1.0 — 2026-10-19 (fase D4 — Ventilação mecânica)
- **Peso predito:** a fórmula "altura − 100 (♂) / − 110 (♀)" foi substituída pela do ARDSNet (♂ 50 + 0,91 × (altura − 152,4); ♀ 45,5 + …); o exemplo (175 cm → 70,6 kg, VC 420–565 mL) e a questão 1 (170 cm → 66 kg, 400–530 mL) foram refeitos. Na gestante o VC usa a altura, não o peso.
- **Evidências:** IMPROVE foi publicado no NEJM (não JAMA); Amato 2015 é análise de mediação (não metanálise); a "Neto 2016: OR 1,41" não era confirmável e foi trocada pela descrição verificada; a "NMA 2025 Annals of Medicine, 2263 pacientes" saiu. DESIGNATION (JAMA 2026; [DOI](https://doi.org/10.1001/jama.2025.23373)) corrigido: PEEP **alto** guiado por ΔP + MRA vs PEEP baixo, cirurgia abdominal **aberta**, CPP 19,8% × 17,4% (P=0,23), mais hipotensão e vasopressor, menos dessaturação.
- **ARISCAT:** SpO₂ pré-operatória 91–95% = +8 e ≤90% = +24 (o módulo dava +8 para "<96%").
- **Potência mecânica:** a fórmula estava dimensionalmente errada; agora a de Gattinoni (0,098 × FR × VC × (Ppico − ΔP/2)).
- **Pneumotórax:** descompressão no 5º EIC na linha axilar anterior (ATLS 10) ou 2º EIC; **broncoespasmo:** cetamina 0,5–1 mg/kg e adrenalina 5–20 mcg; **FiO₂ 0,8 e infecção:** OMS 2016 recomendou, mas ensaios posteriores não confirmaram.
- **Questão 6** sobre obesidade fundamentava a resposta em "auto-PEEP frequente em obesa" (sem base); foi reescrita em torno do volume corrente pelo peso predito.
- Cartões "Pérolas de prova", "Como é no Brasil" e "Referências".

## 3.1.0 — 2026-10-19 (fase D5 — Monitorização)
- **Reversão do BNM (ASA 2023):** a tabela dizia "neostigmina com TOF count 4" e "dose máxima 0,07 mg/kg"; agora só com TOF 4/4 e TOFR ≥0,4, 30–50 mcg/kg + antimuscarínico (glicopirrolato não é vendido no Brasil). A questão 3 (cisatracúrio com 2 respostas) concluía "usar neostigmina agora"; foi refeita (sugamadex não reverte cisatracúrio, neostigmina é ineficaz até TOFR ≥0,4).
- **Cálculo:** "16 mg/kg = ~2 ampolas" estava errado (1.120 mg ≈ 5,6 ampolas de 200 mg).
- **Awareness:** incidência com as fontes corretas (~1:1.000 com busca ativa; NAP5 ~1:19.000 espontâneos, 1:8.600 com BNM); BIS e cetamina; BALANCED (Lancet 2019) e BAG-RECALL nas pérolas.
- **VCI:** valores de pressão atrial direita pela ASE 2015 (corte 2,1 cm); **MRA:** a manobra de "40–45 cmH₂O por 30–40 s" foi trocada pelo incremento gradual com platô 30–35 cmH₂O; peso predito (ARDSNet) no lugar do "PIB — peso ideal pelo body surface"; FiO₂ 0,3–0,5.
- **Oximetria:** metaHb tende a ~85% (a revisão rápida dizia "falsamente normal"); hipotensão pela PAM <65 mmHg; GDT sem o "30–50%" não sustentado; Resolução CFM 2.174/2017 sem a "atualização de 2021" não verificável.
- Questões com 4 alternativas; cartões "Pérolas de prova", "Como é no Brasil" e "Referências".

## 3.1.0 — 2026-10-19 (fase D6 — Anestesia geral e sedação)
- **TCI:** a questão 1 afirmava que o Schnider é o "mais preciso em obesos"; a fórmula de James (massa magra) falha em IMC >35. Reescrita em torno do modelo de Eleveld (BJA 2018), e o texto sobre Marsh/Schnider/Eleveld foi corrigido em três pontos.
- **MYRIAD:** o módulo descrevia "10.000+ pacientes em cirurgia oncológica, Lancet 2019"; é o ensaio de Landoni (NEJM 2019), 5.400 pacientes de cirurgia cardíaca, mortalidade em 1 ano 2,8% × 3,0%.
- **Midazolam VO** adulto 7,5 mg (o módulo dava 0,02–0,05 mg/kg com máx 7,5 mg e, na revisão, 7,5–15 mg); gabapentinoides e "ERAS Forte" suavizados (I-PROMOTE, Verret 2020).
- **BIS:** "mandatório na TIVA" e "risco 10× maior" não têm fonte — passam a "fortemente recomendado com BNM" (NAP5); awareness 1:1.000 (busca ativa) e ~1:19.000 (NAP5).
- **Propofol em sedação:** 25–75 mcg/kg/min; cetamina e PIC (só sem ventilação controlada); TIVA em laser de via aérea (não "sem risco de incêndio com halogenados": o risco é O₂/N₂O); pulmão único sem claim de eliminação heterogênea.
- **TOF/reversão (ASA 2023):** neostigmina 30–50 mcg/kg só com TOF 4/4; tabela dos níveis de bloqueio refeita; lidocaína IV ≤1,5 mg/kg/h; CAM do idoso 25–30%; "WFSA/ESA 2022 — 250 km de carro" removido (não verificável); "escopolamina transdérmica" removida do antiemético (não comercializada).
- Questões com 4 alternativas; cartões "Pérolas de prova", "Como é no Brasil" e "Referências".
