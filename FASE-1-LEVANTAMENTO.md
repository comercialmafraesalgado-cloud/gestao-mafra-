# FASE 1 — LEVANTAMENTO (raio-X de segurança)
**Projeto de Segurança · Gestão Mafra · 06/10/2026**
**Método:** só leitura e análise — NADA foi alterado em produção, NENHUM build novo foi criado (regra da Fase 1).

> Como este raio-X foi feito: o código do build 143 foi varrido por cinco frentes em paralelo (login, banco, páginas públicas, integrações e autorização). Cada risco encontrado passou por uma **verificação adversarial** (um segundo olhar tentando provar que o risco era falso). Resultado: **26 achados; 16 de gravidade alta, todos confirmados (nenhum derrubado na conferência)**. Tudo com a prova no código (arquivo:linha).

---

## RESUMO EM 10 LINHAS (para a Mafra)
1. O Projeto de Segurança está **no começo**: só a Fase 0 (largada) foi concluída. Nenhuma das 9 proteções foi aplicada ainda.
2. O app funciona bem, mas hoje está **de verdade vulnerável** — não é teoria.
3. **Risco-raiz:** o banco está destrancado. A chave que abre tudo está escrita dentro do site público; o navegador fala direto com o banco. Enquanto o "cofre" (RLS, Fase 5) não for ligado, qualquer pessoa com o endereço do app lê, altera e **apaga** os dados de todos os condomínios.
4. **Senhas:** estão escritas por extenso (sem embaralhar) dentro do código; quase todo mundo usa a mesma (`mafra2026`) e a conta mestre usa `master2026`. Quem abre o "ver código-fonte" do site lê usuário e senha de todos, inclusive dos CEOs.
5. **Login:** o "crachá" de sessão pode ser forjado no navegador — dá para **entrar como master sem saber senha nenhuma**. Não há limite de tentativas.
6. **Páginas públicas** (agendar, acompanhamento, vistoria) leem e gravam a produção direto, sem login, e **vazam dados pessoais** (nome, e-mail, telefone de quem agenda) — questão de LGPD.
7. **"Quem vê o quê"** hoje é só enfeite de tela: o gestor de um condomínio já **baixa para o navegador os dados de todos**; o filtro acontece depois, na exibição.
8. **Funções de IA** (gerar-ata, transcrever-áudio) podem ser disparadas por qualquer um com a chave do site — risco de **custo** (estourar a conta). A chave secreta da IA em si NÃO está exposta (fica no servidor, o que é o certo).
9. O **projeto para corrigir tudo isso já está desenhado e correto** (Fases 1→8). Falta **começar a executá-lo**, na ordem.
10. **Próximo passo:** fechar a Fase 1 (faltam poucos itens que só a Mafra vê nos painéis) e já iniciar a **Fase 2 (backup + 2FA)**, que é risco zero e protege o que já existe.

---

## 1. INVENTÁRIO DO BANCO (famílias de chave `mafra:*`)
Tudo mora numa **única tabela** do Supabase chamada **`dados`** (duas colunas: `chave` e `valor` em JSON). Não há separação por condomínio no banco — a separação é só na tela.

### 1.1 Dados compartilhados (ficam no Supabase, tabela `dados`)
| Família | Chaves (exemplos) | Onde é lido/gravado |
|---|---|---|
| **Usuários / acessos** | `mafra:usuarios_extra`, `mafra:permissoes`, `mafra:perfil`, `mafra:ultimo_acesso` | `_nucleo.js`, `aba_gerenciar.js` |
| **Condomínios / cadastro** | `mafra:condominios(_extra/_removidos)`, `mafra:cond_enderecos`, `mafra:cond_geo`, `mafra:capas_cond`, `mafra:fichas_cond`, `mafra:escritorio` | `_nucleo.js`, `aba_gerenciar.js` |
| **Agenda / eventos** | `mafra:agenda`, `mafra:eventos:<pessoa>`, `mafra:facultativos`, `mafra:aniversarios` | `_nucleo.js`, `aba_calendario.js` |
| **Check-ins** | `mafra:checkins` | `modulo_checkin.js` |
| **Relatórios** | `mafra:relatorios`, `mafra:relfotos:*`, `mafra:capa` | `_nucleo.js`, `aba_relatorios.js` |
| **Listas / tarefas / notas** | `mafra:listas:index`, `mafra:lista:<id>`, `mafra:notas` | `aba_listas.js`, `aba_notas.js` |
| **Vistorias** | `mafra:vistorias`, `mafra:vistoria:<id>`, `mafra:vistoria_fotos`, `mafra:vis_*` | `aba_vistoria.js` |
| **Comunicados / avisos** | `mafra:comunicados(_manual)`, `mafra:avisos` | `aba_comunicados.js` |
| **Ocorrências / helpdesk** | `mafra:ocorrencias`, `mafra:chamados`, `mafra:atendimentos`, `mafra:hd_bloqueio(s)` | `aba_ocorrencias.js`, `aba_helpdesk.js` |
| **Conteúdo** | `mafra:manual(_padrao)`, `mafra:proc`, `mafra:checklist`, `mafra:videos`, `mafra:gravacoes` | `aba_manual.js`, `aba_procedimentos.js`, `aba_checklist.js`, `aba_gravacoes_ata.js` |
| **Métricas / análise** | `mafra:analises`, `mafra:tcom` | `aba_metricas.js` |
| **Lixeira / backup** | `mafra:lixeira:*`, `mafra:snapshot`, `mafra:ultimo_backup`, `mafra:sentinela` | `_nucleo.js` |

> ⚠️ **Dois registros são "globais únicos"** e por isso vão exigir cuidado no cofre (Fase 5): **`mafra:relatorios`** e **`mafra:chamados`** guardam, num só registro, dados de **todos** os condomínios juntos. Do jeito que estão, é impossível trancar por condomínio no servidor sem um pequeno redesenho (quebrar em um registro por condomínio). Isso precisa entrar no plano do cofre.

### 1.2 Preferências locais (só no navegador — NÃO vão para o banco)
`mafra:sessao` (o "crachá" de login — ver item 2), `mafra:digital` / `mafra:digital_recusou` (a "digital"/WebAuthn), `mafra:calSemanaModo`, `mafra:tarefasModo`, `mafra:somTarefas`, `mafra:notifvistos`, `mafra:notiflog`, `mafra:aviso_*`, `mafra:vfoto`, `mafra:vis_cache`.

### 1.3 Quem deveria poder LER e GRAVAR (proposta — a Mafra valida no item 7)
Hoje, **na prática, não há controle no banco**: qualquer um com a chave lê e grava qualquer família. A tabela de "quem deveria" está no item 7 e vira a base do cofre (Fase 5).

> **Falta confirmar no painel do Supabase** (só a Mafra vê): o **volume** de cada família e, principalmente, **se o RLS está ligado ou desligado hoje** na tabela `dados`.

---

## 2. LOGIN HOJE (como funciona e o que um mal-intencionado faz)
- **Onde mora a senha:** dentro do próprio código, no bloco `USUARIOS_BASE` (`modulos/_nucleo.js:100-112`), **em texto puro**. Exemplos reais: `walace/bianca/marcia/andre → "mafra2026"`, `mafra (master) → "master2026"`. Isso vai inteiro para o `index.html` publicado (`index.html:1689-1700`), que é público.
- **Senhas criadas/trocadas depois:** também gravadas **por extenso** no banco, na chave `mafra:usuarios_extra` (`aba_gerenciar.js:14-19` e `_nucleo.js:1538-1540`). E a tela de criar usuário já vem com `mafra2026` preenchido.
- **Como o login confere:** só compara texto com texto no navegador — `if(acc.senha===p)` (`_nucleo.js:941`). **Não existe nenhum embaralhamento (hash) em lugar nenhum** do código. Sem limite de tentativas (`_nucleo.js:935-948`).
- **Como a sessão (o "crachá") é guardada:** um papelzinho no navegador — `localStorage["mafra:sessao"] = {uid, ts}` (`_nucleo.js:1088-1089`). Ao reabrir, o app confia nesse papel sem nenhuma assinatura; só checa se faz menos de 12h (`_nucleo.js:1098-1111`, `SESSAO_MAX_MS` em `:244`).
- **A "digital" (WebAuthn):** é **só conveniência local** — um atalho para não redigitar a senha naquele aparelho. Ela **não substitui a senha nem autentica no servidor**. Enfeite, não cofre.
- **Onde aparece a chave do Supabase:** `modulos/_pagina_inicio.html:57-58` (URL do banco + `SUPABASE_KEY = "sb_publishable_..."`), escrita no HTML público. O cliente é criado só com ela, sem login (`_nucleo.js:697`).
- **O que uma pessoa mal-intencionada consegue só com o `index.html`:**
  1. Ler **usuário e senha de todos** no "ver código-fonte".
  2. **Forjar o crachá** e entrar como master: escrever `mafra:sessao = {"uid":"marcia","ts":agora}` no navegador e recarregar — entra **sem senha**.
  3. Copiar a chave do banco e, **por fora do app**, ler/gravar/apagar a tabela `dados` inteira.

---

## 3. PÁGINAS PÚBLICAS (sem login)
Todas rodam **antes** de qualquer login e falam direto com o banco pela chave pública:
- **`/#agendar`** (o `agendar.html` só redireciona para cá): ao marcar uma reunião, **baixa a agenda inteira** da pessoa da Mafra e **grava o evento direto na produção** (`_nucleo.js:3770`, `:3996`, `:4037`). Grava dado pessoal de quem marcou — nome, e-mail, telefone (`_nucleo.js:4028/4031`). **LGPD.**
- **`/#ag=CÓDIGO`** (acompanhamento): para achar um código, **varre a agenda de todos**, expondo nome/e-mail/telefone — tudo no navegador anônimo.
- **`/#vistoria`**: mostra a **lista de TODOS os condomínios** (expõe a carteira de clientes), lê o índice de vistorias e deixa **qualquer visitante criar e gravar** vistorias e fotos (`index.html:14011-14106`). O link é universal (não é por condomínio); o próprio código já traz um aviso reconhecendo isso.
- Nenhuma dessas telas tem servidor validando, nem limite — dá para automatizar spam.

---

## 4. FUNÇÕES E INTEGRAÇÕES
- **Edge Functions** `gerar-ata` (usa IA) e `transcrever-audio`: chamadas com a **mesma chave pública** como autorização (`_nucleo.js:789-795`; `aba_gravacoes_ata.js:491-499`). Como a chave está no site, **qualquer um pode disparar** essas funções → **risco de custo** (cada chamada gasta crédito pago). Não há freio no app.
- **Importante (a favor):** a **chave secreta da IA NÃO está no navegador** — ela fica no servidor da função, que é o lugar certo. O problema é só **quem pode acionar** e a **falta de limite**.
- **Código de teste esquecido:** há um trecho que chamaria a API direto do navegador (`_nucleo.js:811-813`). Hoje **não vaza chave**, mas é armadilha futura — limpar (Fase 8).
- **Bucket de arquivos `gravacoes`** (áudios/atas): o código usa `getPublicUrl` (`aba_gravacoes_ata.js:249,1961`), o que sugere **link público**. Confirmar no Storage do Supabase (item 5).

> **Falta confirmar no painel do Supabase:** se `gerar-ata`/`transcrever-audio` exigem usuário logado ou têm limite de uso (o código dessas funções **não está** no repositório); e se o bucket `gravacoes` é público ou privado.

---

## 5. BACKUPS E ACESSOS — o que só a Mafra consegue ver (lacunas do raio-X)
Estes itens **não aparecem no código** — dependem de entrar nos painéis. Completar aqui fecha a Fase 1:
- [ ] **RLS (o cofre):** está ligado ou desligado hoje na tabela `dados`? *(o fato de a tela pública gravar sem login indica que está liberado para anônimo — confirmar)*
- [ ] **2FA (verificação em duas etapas)** ligado em **Netlify, Supabase e Google**?
- [ ] **Backup real** dos dados hoje fora do Supabase — existe? Onde? (Dropbox *Backup Gestao Mafra*?)
- [ ] **Acessos de terceiros** nas plataformas (colaboradores, integrações) — quem tem? Remover os que não precisam.
- [ ] **Bucket `gravacoes`** público ou privado?
- [ ] **E-mails da equipe** já coletados? (pré-requisito do login novo, Fase 4)
- [ ] **Volume** de cada família `mafra:*` no banco.

---

## 6. DECISÃO TÉCNICA DO COFRE (a escolha nº 1 do projeto)
Como o banco é chave→valor numa tabela única, há dois caminhos:

| | **(A) Trancar por etiqueta na tabela `dados` (RLS por padrão de chave)** | **(B) Passar TODO acesso por uma "funcionária" (Edge Function com chave-mestra no servidor)** |
|---|---|---|
| **Como é** | Políticas no Supabase liberam cada linha conforme a etiqueta (`mafra:...`) e o condomínio do usuário logado | O app nunca fala com o banco direto; pede à função, que confere quem é e devolve só o permitido |
| **Prós** | Menos reescrita; usa o Auth do Supabase; rápido de ligar família por família | Controle total e central; esconde a chave; valida regras complexas (grupos Le Monde/Trio) com folga |
| **Contras** | Chaves "globais únicas" (`mafra:relatorios`, `mafra:chamados`) **não** se separam por condomínio sem redesenho; políticas por padrão de texto ficam difíceis de auditar | Mais trabalho: cada leitura/gravação vira uma chamada de função; precisa reescrever o `storeGet/storeSet` |
| **Risco** | Médio (fácil errar uma política e vazar/zerar) | Baixo depois de pronto (ponto único de controle) |
| **Esforço** | Menor no total, maior nos casos globais | Maior no começo, paga depois |

**Recomendação (a validar na Fase 5):** um **híbrido** — ligar **RLS (A)** como base para a maioria das famílias (dados já naturalmente por pessoa/condomínio, como `mafra:eventos:<pessoa>`), e usar a **"funcionária" (B)** para (1) as páginas **públicas** (agendar/vistoria) e as **funções de IA** (Fase 6) e (2) os registros **globais únicos**, que devem ser quebrados em "um por condomínio" antes de trancar. Antes de qualquer tranca: **banco de teste (Fase 3)** e **login de verdade (Fase 4)** prontos.

---

## 7. REGRAS DE NEGÓCIO "QUEM VÊ O QUÊ" (rascunho — a Mafra valida)
Hoje isto é só enfeite de tela; vira o desenho do cofre. **L** = pode ler · **G** = pode gravar · **—** = não acessa.

| Família de dado | Master (Márcia, André, Bianca) | Síndico operacional (Walace, Bruna, Milena) | Funcionário/BPO (Bianca, Camilla, Julia) | Gestor de condomínio | Helpdesk |
|---|---|---|---|---|---|
| Usuários / permissões | L+G | — | — | — | — |
| Condomínios (cadastro) | L+G | L (os seus) | L (os seus) | L (o seu / seu grupo) | L |
| Agenda / eventos | L+G (Mafra) | L+G (própria + convidados) | L+G (própria) | L+G (só a dele / seu grupo) | — |
| Relatórios | L+G (todos) | L+G (os seus) | L+G (os seus) | L (só o do seu condomínio) | — |
| Check-ins | L (todos) | L+G (o próprio) | L+G (o próprio) | — | — |
| Listas / tarefas / notas | L+G (próprias) | L+G (próprias) | L+G (próprias) | L+G (próprias) | L+G (próprias) |
| Vistorias | L+G (todas) | L+G (as suas) | L+G (as suas) | L (só as do seu condomínio) | — |
| Comunicados / avisos | L+G | L | L | L (os direcionados a ele) | L |
| Ocorrências / helpdesk | L+G | L+G | L+G | L+G (as do seu condomínio) | L+G |
| Métricas | L (todas) | L (próprias) | L (próprias) | — | — |

> Os **grupos Le Monde e Trio** têm regra especial: o gestor vê **as suas sub-unidades e só elas** (a gerente + 2 administrativos formam um time). Isso precisa ser explícito no cofre.
> **Pergunta para a Mafra:** o master quer ver **tudo** (inclusive agenda só de gestor)? Hoje a decisão era "não". Confirmar linha a linha.

---

## 8. PROPOSTA DE DATA DO DIA D + PRÉ-REQUISITOS
- **Dia D (Fase 7):** um dia de **baixo movimento** — proposta: um **sábado de manhã** (ex.: a definir com a Mafra), fora de fechamento de mês e longe de assembleias marcadas.
- **O que precisa estar pronto ANTES do Dia D:**
  - [ ] Backup fresco da véspera (Fase 2 em dia)
  - [ ] Ambiente de teste aprovado com 1 conta de cada perfil (Fase 3+4)
  - [ ] Cofre provado no teste com **invasão simulada = tudo zero** (Fase 5)
  - [ ] Públicos pela funcionária, provados (Fase 6)
  - [ ] **E-mails da equipe** coletados (via WhatsApp)
  - [ ] **Domínio + carteiro** (SMTP/Resend) verificados para o "esqueci a senha"
  - [ ] **Plano B por escrito** pronto antes da virada
  - [ ] Combinado: todo mundo **fecha e reabre** o app depois da virada

---

## ANEXO — os 16 riscos altos confirmados (com a prova)
| # | Risco | Prova (arquivo:linha) | Resolve na |
|---|---|---|---|
| 1 | Banco destrancado: chave pública abre tudo (ler/gravar/**apagar**) | `_pagina_inicio.html:57-58`; `_nucleo.js:697,727,746,766` | Fase 5 |
| 2 | Senhas em texto puro, iguais, dentro do código público | `_nucleo.js:100-112,941`; `index.html:1689-1700` | Fase 4 |
| 3 | Crachá de login forjável → entra como master sem senha | `_nucleo.js:1088-1111,244,935-948` | Fase 4 + 8 |
| 4 | Senhas trocadas gravadas por extenso em `mafra:usuarios_extra` | `aba_gerenciar.js:14-19,695-699`; `_nucleo.js:1538-1540` | Fase 4 |
| 5 | `/#agendar` lê/grava produção direto e vaza dado pessoal (LGPD) | `_nucleo.js:293-294,3770,3996,4028-4037` | Fase 6 + 5 |
| 6 | `/#ag=` varre a agenda de todos (vaza nome/e-mail/telefone) | `_nucleo.js:280-294` | Fase 6 + 5 |
| 7 | `/#vistoria` lista todos os condomínios e deixa qualquer um gravar | `index.html:14011-14106,14164-14165` | Fase 6 + 5 |
| 8 | Gestor baixa para o navegador os dados de TODOS os condomínios | `_nucleo.js:721-738`; `mafra:relatorios` (`:1552`), `mafra:chamados` (`:3094`) | Fase 5 |
| 9 | Registros globais únicos impedem separação por condomínio no servidor | `_nucleo.js:1552,3094` | Fase 5 |
| 10 | Funções de IA disparáveis por qualquer um (custo) | `_nucleo.js:789-795`; `aba_gravacoes_ata.js:491-499` | Fase 6 |
| 11 | Sem limite de tentativas de login | `_nucleo.js:935-948` | Fase 4 |
| 12 | "Digital" não autentica no servidor (só atalho local) | `_nucleo.js:1060-1082` | Fase 4 |
| 13 | Tudo roda em escopo global (dá para operar pelo console) | `montar.js:7-11`; `_pagina_fim.html` | Fase 4/8 |
| 14–16 | Variações confirmadas dos itens acima (banco, senhas, públicos) por frentes independentes | (idem) | 4/5/6 |

> Honestidade do raio-X: 3 pontos só se **confirmam de fato nos painéis** (não no código) — estado do RLS, limites das funções de IA, e se o bucket `gravacoes` é público. Estão no item 5.

---

## PAINEL / PRÓXIMOS PASSOS
- **Fase 1 — Levantamento:** raio-X do **código concluído** (06/10). Falta o **lado das contas** (item 5) e a **validação das regras do item 7** com a Mafra para fechar a fase.
- **Pode começar já, risco zero:** **Fase 2** (backup completo fora do Supabase + ligar **2FA** no Netlify/Supabase/Google + remover acessos antigos).
- **Ordem obrigatória:** Fase 2 → Fase 3 (banco/site de teste) → Fase 4 (login novo) → Fase 5 (cofre) → Fase 6 (públicos) → Fase 7 (Dia D) → Fase 8 (estabilização). O risco-raiz (banco destrancado) só se fecha na Fase 5, que depende das Fases 3 e 4 prontas.
