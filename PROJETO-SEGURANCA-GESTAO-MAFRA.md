# PROJETO DE SEGURANÇA — GESTÃO MAFRA
**Documento oficial · abre toda sessão · versão 1.0 (10/09/2026)**

> Regra do projeto: a partir da Fase 0, **melhoria nova congela**. Tudo que não for fase entra na *Fila do pós-projeto* (seção 6). Uma fase por sessão, sessão limpa, tudo com prova.

---

## 1. PAINEL (estado atual — atualizar a cada sessão)

| Item | Estado |
|---|---|
| Build no ar | **133** (19/09) — site completo confirmado (manifest + ícones); publicação por "browse files to upload" + Ctrl + A |
| Build pronto para publicar | **143** (versão 2026-10-02) — inclui 131 a 142 (celular, ícone, listas por pessoa, etapas, Kanban com Concluídos) + status por ocorrência em tarefas recorrentes |
| Fase atual | **Fase 0 concluída** · builds 125→143 feitos como exceções aprovadas · **Trabalho migra para o Claude Code em 06/10/2026** (kit: CLAUDE.md + PROMPT-INICIAL.md) |
| Próxima fase | Fase 1 — Levantamento |
| Baseline de funções (validar.js) | 122 = 1187 · 123 = 1198 · 126 = 1208 · 127 = 1214 · 129 = 1256 · 130 = **1283** (nada removido) |
| Testes obrigatórios | `validar.js` ✅ · `testar-usuarios.js` ✅ · `testar-subcondominios.js` ✅ (55) · `testar-checkin-auto.js` ✅ (21) · `testar-build127.js` ✅ (44) · `testar-listas.js` ✅ (62) |
| Backup | Dropbox › *Backup Gestao Mafra* › `KIT-DE-RECUPERACAO.txt` + zips de cada build |
| Pendências de emergência (fora do projeto) | reversão de fotos pré-122 · gêmeos Kanoah ago / Varanda Botânico jul · relatório Centro Profissional ago |

### Fases

| Fase | Nome | O que sai dela | Status |
|---|---|---|---|
| 0 | Largada | Build 123 (subcondomínios) + este documento | ✅ concluída |
| 1 | Levantamento | Raio-X do banco, do login atual e das páginas públicas · regras por escrito de **quem vê o quê** (perfil × condomínio) · decisão técnica do cofre · data do Dia D | ⏳ próxima |
| 2 | Backup total e blindagem de contas | Cópia integral do banco fora do Supabase · contas do Netlify/Supabase com 2FA e donos definidos · risco zero | ⏳ |
| 3 | Ambiente de teste | Site de teste + banco de teste 100% separados da produção | ⏳ |
| 4 | Login novo (crachá) | Login por e-mail no ambiente de teste · recuperação de senha testada com prova | ⏳ |
| 5 | O cofre (RLS) | Trancar um grupo de dados por vez · fecha com **invasão simulada: tudo zero** | ⏳ |
| 6 | O que é público | Link de agendamento e demais páginas públicas passam a falar só com a funcionária | ⏳ |
| 7 | Dia D | Virada da produção em dia de baixo movimento · plano B por escrito pronto antes | ⏳ |
| 8 | Estabilização | Remover login antigo · vigiar uma semana · 🎉 destrava a fila de melhorias | ⏳ |

---

## 2. DIÁRIO DE BORDO (mais recente em cima)

### 06/10/2026 — Passagem para o Claude Code
- Kit entregue: pasta `gestao-mafra` com `CLAUDE.md` (regras e contexto), `COMECE-AQUI.md`, `PROMPT-INICIAL.md` (versão A: builds; versão B: Fase 1), módulos do build 143, site-apoio, testes, documento oficial e cronograma.
- Próximo passo: abrir a pasta no Claude Code e colar a Versão B do prompt para a Fase 1 (Levantamento).

### 02/10/2026 — Build 143
- Tarefas recorrentes: status próprio por ocorrência (`recFeitos` por data); projeção da semana seguinte nasce planejada; ✓ conclui só o dia; ↩ reabre. Suíte `testar-recorrencia.js` (9 provas).

### 19/09/2026 — Builds 140 a 142
- 140 toque confiável no iPhone (etapas e bolinhas) · 141 fim do zoom do iPhone (campos 16px no celular) · 142 Kanban: coluna Concluídos, Atrasados só sem finalizar.

### 18–19/09/2026 — Builds 131 a 139 (ajustes de celular, ícone e listas)
- 131 Lívia dentro do menu · 132/133 manifest e ícone embutidos (rede de segurança) · 134 área segura do iPhone · 135 foto de perfil pela galeria · 136 listas: cada um vê só as suas; tarefa atribuída aparece sozinha · 137 lateral vertical no celular · 138 telas separadas no celular (menu → lista → tarefa) · 139 etapas com linha clicável e anotação com modo leitura/edição.
- Publicação: descoberta que o arraste de pasta e o zip não subiam tudo do computador da Mafra; o que funciona é "browse files to upload" + Ctrl + A nos 12 arquivos. Conferência: /manifest.json e /apple-touch-icon.png abrindo.
- Fila do pós-projeto: upload de vídeo direto pelo app (Drive/YouTube não listado).

### 17/09/2026 — Build 130 (Listas: opções rápidas + lembretes; visual)
- Calendário/Semana em grade por horário (`renderCalSemanaGrade`), alternador Cards | Grade; Tarefas/Mês em calendário em grade; período personalizado em cartões por dia; Listas enquadradas no celular; título da aba sem contador "(n)"; sino de conclusão mais alto e com timbre de sino.
- 129 publicado pela Mafra no mesmo dia. Pedido: data e demais informações na hora de criar. 130: ícones 📅 ⏰ 🔁 na barra de adicionar; campo Lembrete (data e hora) com aviso no sino ao abrir o app (`_liChecarLembretes` no login/visibilidade); toque de conclusão (sino) e tique nas etapas com botão 🔔/🔕. Detalhe da tarefa como painel lateral (To Do) no computador, modal no celular; "Adicionar arquivo" (fotos comprimidas; outros até 1,5 MB). Semana ⇄ Listas espelhadas sem cópia: tarefas da agenda semanal aparecem nas Listas (vista "Semana (agenda)", Meu Dia, Planejado, Importante) e concluem nos dois lugares; tarefas de lista aparecem na Semana (no dia, ou no quadro "Das listas · sem data"), com bolinha para concluir. Funções 1256 → 1275; suíte de listas 55 provas.

### 17/09/2026 — Build 129 (exceção aprovada: Tarefas estilo To Do)
- Módulo novo `aba_listas.js`: aba Tarefas com alternador Semana | Listas. Listas por pessoa com compartilhamento, tarefas com etapas (x de y), importante, data, repetição, anotações, atribuição; vistas Meu Dia / Importante / Planejado / Atribuído a mim; Concluída recolhida. Armazenamento próprio (`mafra:listas:index`, `mafra:lista:<id>`); agenda semanal intocada (regra da Mafra: não apagar nada preenchido). Tarefa com data aparece como lembrete na agenda semanal.
- Aba "Agenda" renomeada para "Tarefas" (no 128).
- Suíte `testar-listas.js` (29 provas). Funções 1214 → 1256.

### 17/09/2026 — Builds 127 e 128 (correções pedidas pela Mafra)
- **128:** página de Registros do relatório em grade de 2 colunas com fotos de altura única (230px); antes/depois em linha inteira; foto única divide a linha com o próximo registro; extras como cartões "foto adicional"; empacotamento sem buraco (`_regEmpacotar`). Conferido em screenshot Chromium.
- Relatório Gerencial: "em reforma" não soma mais no total de unidades (rosca = ocupadas × vazias; reforma informativa). Bug relatado no Le Monde Avenue (46 + 1 = 47).
- Calendário: gestores ganharam agenda própria (`agendaOwners()`/`ehAgendavel()` no núcleo). Gestor salva evento sem equipe Mafra; equipe pode convidar gestores (seção "Gestores dos condomínios"). Excluir/finalizar/editar alcança as agendas dos gestores.
- Regra de visão da agenda (`eventoVisivelPara`): gestor vê só o dele, o que foi convidado e assembleias do(s) condomínio(s) dele; equipe Mafra (inclusive master) vê a agenda da Mafra + eventos com alguém da Mafra; evento só de gestor não aparece para a Mafra. Decisão da Mafra: master não quer ver agenda só de gestor.
- Gestores do mesmo grupo (gerente + administrativos do Le Monde/Trio) formam um time na agenda (`gestoresDoMesmoGrupo`): veem a agenda uns dos outros e se convidam ("Sua equipe").
- Suíte `testar-build127.js` (33 provas). Funções 1208 → 1214.
- Publicação: em 16/09 o manifest.json do site estava 404 (deploys subiram só o index) → Android criava atalho "N". Zip do site agora vem com a pasta `SUBIR-ESTA-PASTA-NO-NETLIFY`; publicar por "choose a folder". Conector Netlify religado ao login do André (time comercial-mafraesalgado); deploy pelo Claude bloqueado por rede (403), publicação segue manual.

### 16/09/2026 — Build 123 no ar · builds 125 e 126 (exceção aprovada)
- Build 123 confirmado em produção (print do Gerenciar com as opções ⭐).
- Bug: as opções ⭐ dentro do select de condomínio não selecionavam (celular e computador). **Build 125:** campo próprio "Acesso a grupo completo" no cadastro de gestor; gestor de grupo escolhe o subcondomínio ao preencher relatório (regra: relatório é sempre um por sub). O 124 foi substituído pelo 125.
- **Exceção ao congelamento, aprovada pela Mafra:** check-in assistido por GPS. **Build 126:** oferta de check-in ao abrir o app dentro do raio calibrado (Le Monde/Trio → escolhe o sub; sede → Escritório Mafra), lembrete de check-out (em destaque se longe do local), fechamento automático em 24h com marca "auto 24h" nas Métricas. Suíte nova `testar-checkin-auto.js` (21 provas, GPS simulado). Funções 1199 → 1208.
- Público do assistente: síndicos operacionais e BPO. Gestores/helpdesk/master não recebem.
- Cronograma entregue em imagem com previsão de tempo por fase (11 sessões, ~18h, 5–6 semanas).

### 10/09/2026 — Fase 0 (sessão 1)
- Base recebida: `gestao-mafra-modulos.zip` + `gestao-mafra-site.zip` do build 122. `APP_VERSAO` conferido = build 122 (sem alerta).
- **Build 123 montado e provado.** 14 módulos editados: `_nucleo.js`, `aba_gerenciar.js`, `aba_manual.js`, `aba_procedimentos.js`, `aba_checklist.js`, `aba_calendario.js`, `aba_comunicados.js`, `aba_inicio.js`, `aba_minhas_tarefas.js`, `aba_relatorios.js`, `modulo_checkin.js`, `aba_gravacoes_ata.js`, `aba_ocorrencias.js`, `aba_vistoria.js`.
- Helpers novos no núcleo: `condominioPaiDe`, `subRotulo`, `subsCompletos`, `condVisivel`, `condOptionsAgrupadas(sel, lista)`.
- 16 selects de condomínio agrupados em `<optgroup>`; valores gravados continuam os nomes completos — **nada muda no banco**.
- Gerenciar: opção ⭐ *grupo completo* (`__grupo:Le Monde` / `__grupo:Trio`) para os logins do comercial.
- 3 bugs corrigidos: gestor de grupo invisível no Manual/Procedimentos/Checklist (formato `›` × espaço); editar gestor perdia `condominios`; cards duplicados (pai + subs) em Procedimentos e Checklist.
- Suíte nova `testar-subcondominios.js` (51 provas) — todas passaram. `validar.js` e `testar-usuarios.js` seguem ✅.
- Funções: 1187 → 1198 (nada removido).
- Observação: o arquivo **MODELO_PROJETO_SEGURANCA_REPLICAVEL.md não veio anexado** nesta sessão; este documento foi montado com o cronograma já aprovado (9 fases). Anexar o MODELO na próxima sessão para alinhar o formato, se houver diferença.

### 10/09/2026 — Build 122 confirmado em produção
- Print do Gerenciar da Bianca mostrando "versão 2026-09-04 · build 122". Fase 0 liberada.

### 04/09/2026 — Build 122 (emergência)
- Três cadeados: mescla antes de gravar (`_relMesclarListas`), regra de ouro das fotos (`_relGravarFotosDe`), exclusão reversível (lixeira `mafra:lixeira:*`). Resgate automático de fotos (`_relResgateLocal`). Ferramentas `resgate-relatorios.html` e `diagnostico-fotos.html`.
- Subcondomínios renumerados para o build 123.

---

## 3. CHECKLIST — TODA ENTREGA DE BUILD
- [ ] `APP_VERSAO` do arquivo recebido conferido (alerta se for mais velho que o build atual)
- [ ] Edições por script Python: `assert count==1`, aspas triplas, `\uXXXX` para unicode
- [ ] `node --check` em cada módulo editado
- [ ] `APP_VERSAO` incrementado em `_nucleo.js` (`"AAAA-MM-DD · build N"`)
- [ ] `node montar.js`
- [ ] `node validar.js` → "✅ tudo passou"
- [ ] `node testar-usuarios.js` → "✅ tudo passou"
- [ ] `node testar-subcondominios.js` → "✅ tudo passou" (a partir do 123)
- [ ] `node testar-checkin-auto.js` → "✅ tudo passou" (a partir do 126)
- [ ] Contagem de funções ≥ baseline do build anterior (nunca diminui)
- [ ] Provas JSDOM específicas do que mudou
- [ ] 3 entregáveis: `gestao-mafra-site.zip` · `index.html` · `gestao-mafra-modulos.zip`
- [ ] LEIA-ME do build dentro do zip · diário de bordo atualizado

## 4. CHECKLIST — PUBLICAÇÃO (Mafra / Bianca)
- [ ] Zip do build guardado na pasta *Backup Gestao Mafra* (Dropbox) **antes** de publicar
- [ ] Arquivos de apoio (sw.js, manifest, ícones, capa, agendar.html) conferidos com os do site no ar
- [ ] Pasta inteira arrastada no Netlify (site gestao-mafra) → "Published"
- [ ] PWA fechado e reaberto / reinstalado no celular
- [ ] Login mostra a versão nova
- [ ] Bianca abre *Gerenciar → Saúde do sistema*: sem alarme
- [ ] Um teste rápido do que mudou (no 123: abrir Procedimentos → card Le Monde → Parc → Voltar)
- [ ] Deu errado? Netlify → Deploys → deploy anterior → *Publish deploy* (dados não são tocados)

## 5. CHECKLIST — ABERTURA DE SESSÃO
- [ ] Conversa nova no projeto
- [ ] Anexar `gestao-mafra-modulos.zip` do último build entregue (+ site.zip se for publicar)
- [ ] Escrever o nome da fase ("Fase 1")
- [ ] Ler o Painel (seção 1) e o último dia do Diário (seção 2)
- [ ] Nada de melhoria nova: se surgir, vai para a seção 6

---

## 6. FILA DO PÓS-PROJETO (melhorias congeladas)
| # | Pedido | Origem | Data |
|---|---|---|---|
| 1 | Limpeza automática da lixeira (`mafra:lixeira:*`) com prazo de retenção | build 122 | 04/09 |
| 2 | Aba Condôminos nativa (hoje HTML avulso, 3.267 contatos) | memória do projeto | — |
| 3 | Sincronização Google Calendar (conta de serviço, 5 min) | memória do projeto | — |
| 4 | Migração de senhas para Supabase Auth / Edge Function | vira Fase 4–5 do projeto | — |
| 5 | Abrir "Le Monde"/"Trio" como grupo também no Calendário e Relatórios (hoje só selects agrupados) | Fase 0 | 10/09 |

---

## 7. PENDÊNCIAS DE EMERGÊNCIA (correm em paralelo, não travam fases)
- Fotos destruídas antes do 122: abrir o app atualizado em **todos os aparelhos** (♻️ = foto voltando) · conferir *Database → Backups* no Supabase · extrair fotos de PDFs antigos · o que ficar 🔴 no diagnóstico é re-anexar da galeria.
- Relatório Centro Profissional (agosto): resgatar pela ferramenta ou refazer.
- Gêmeos (Kanoah agosto / Varanda Botânico julho): comparar e excluir a versão mais fraca depois que tudo estabilizar.
