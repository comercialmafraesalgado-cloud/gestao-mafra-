# 🔐 PROJETO SEGURANÇA — GESTÃO MAFRA
### Cronograma adaptado do modelo replicável (DPSports) · atualizado 16/09/2026
**Sistema:** Gestão Mafra · gestao-mafra.netlify.app · build 123 (Fase 0 entregue)
**Método:** uma fase por sessão · tudo com PROVA · produção só no DIA D

---

## As 3 adaptações ao Gestão Mafra
1. **Sem GitHub:** publicação é por pasta no Netlify (Drop). Ambiente de
   teste = **segundo site** (gestao-mafra-teste) + **banco de teste
   separado**. O build de teste aponta pro banco de teste.
2. **Banco em formato chave→valor (KV):** o cofre (RLS) será desenhado
   no levantamento — trancar pelas etiquetas das chaves (`mafra:...`)
   ou passar todo acesso pela "funcionária" (chave-mestra no servidor).
   Essa é a decisão técnica nº 1 do projeto.
3. **Login hoje é por nome de usuário:** vai virar **por e-mail** (Auth
   profissional). Coleta de e-mails da equipe entra no plano enxuto.

## Princípios herdados (inegociáveis)
Ambiente de teste 100% separado · uma etapa por sessão · nada em
produção sem teste aprovado e OK da Mafra · todo teste só conta com
prova no banco · melhorias novas CONGELADAS durante o projeto (fila do
pós-projeto) · regras de negócio por escrito antes do cofre ·
chave-mestra nunca no navegador · backup antes de tudo.

---

## FASE 0 — Build 123 + fundação do projeto ✅ CONCLUÍDA (10/09/2026)
Único item que entrou antes do congelamento, por ser pré-requisito da
estrutura de acessos:
- **Build 123** entregue (subcondomínios Le Monde e Trio, grupos
  `__grupo:`, telas de sub-navegação, logins da equipe comercial).
  Sobe na produção pelo fluxo normal — não mexe em login nem no banco.
- **DOCUMENTO OFICIAL DO PROJETO** criado
  (`PROJETO-SEGURANCA-GESTAO-MAFRA.md`: painel, diário de bordo,
  checklists) — vai anexado no início de cada sessão.
- A partir daqui: **melhorias congeladas**, tudo novo vai pra FILA.

## FASE 1 — Sessão 0 do modelo: LEVANTAMENTO (1 sessão) ⏳ PRÓXIMA
Raio-X completo, sem mudar nada:
- Inventário do banco KV (etiquetas de chave, volumes, RLS atual).
- Como o login funciona hoje (onde mora a senha; onde aparece a chave).
- Páginas públicas: `/#agendar` (e o que mais existir sem login).
- Funções existentes (gerar-ata / IA) e integrações.
- Backups atuais · acessos e 2FA (Supabase, Netlify, Google).
- **Regras de negócio POR ESCRITO:** perfil por perfil (Master, Síndico
  Operacional, Funcionário/BPO, Gestor, Helpdesk) × 17 condomínios e
  grupos — quem vê o quê.
- **Sai daqui:** a decisão do cofre (adaptação nº 2) e a data-alvo do
  DIA D (dia de baixo movimento).

## FASE 2 — Etapa 0: backup + blindagem de contas (risco zero)
- Backup diário do banco (avaliar plano) + export completo em arquivos,
  auditado, guardado no Drive/Dropbox (pasta Backup Gestao Mafra).
- ZIP do código completo (já é rotina das entregas).
- 2FA nas contas · auditoria e remoção de acessos de terceiros.
- Entender a cobrança do Netlify (agrupar publicações de produção).
**Pronto quando:** cópia completa de banco + código fora das
plataformas, com a Mafra.

## FASE 3 — Etapa 1: ambiente de teste (risco zero)
- Banco de teste separado (grátis serve), mesma região.
- Estrutura recriada + dados fictícios (1 condomínio-modelo + 1 usuário
  de teste POR PERFIL).
- **Site de teste no Netlify** apontando pro banco de teste.
- ⚠️ Lição herdada: banco novo vem com RLS LIGADO (retorna vazio sem
  erro) — desligar no início, religar com políticas na Fase 5.
**Pronto quando:** endereço de teste no ar, 100% separado da produção.
**A partir daqui, toda mudança é feita e provada no teste — a produção
continua no build 123 sem ser tocada até o DIA D.**

## FASE 4 — Etapas 2 e 3: Auth profissional + testes por perfil (só no teste)
- Login por e-mail + senha criptografada + sessão + "Esqueci a senha".
- Vínculo conta↔perfil (email + auth_id) · telas administrativas criando
  usuário pela funcionária · "Minha Conta" trocando senha no Auth.
- Login antigo vira reserva temporária (morre no cofre, sai na Fase 8).
- Bateria por perfil: cada um entra, vê o que deve, NÃO vê o que não
  deve — com prova.
- ⚠️ E-mail nativo do banco é só pra teste → carteiro próprio
  (domínio + Resend) é pré-requisito do DIA D.

## FASE 5 — Etapa 4: o COFRE (RLS) 🔒
- Fundação (funções auxiliares) → trancar um grupo de dados por vez,
  bateria a cada tranca (dono vê ✅ · vizinho não vê ✅).
- Atenção especial aos grupos Le Monde/Trio (gestor vê as suas
  sub-unidades, e só elas) e ao escopo por condomínio.
- **Invasão simulada:** vestir o crachá de um usuário direto no banco e
  tentar ler dados alheios → TUDO ZERO. Script guardado pro DIA D.

## FASE 6 — Etapa 5: públicos pela funcionária
- `/#agendar` (e demais públicos) param de falar direto com o banco:
  cada um ganha funcionária própria com validação no servidor.
- Função de IA (gerar-ata) auditada: chave só no servidor.

## FASE 7 — DIA D: virada da produção (1 dia marcado)
- Plano enxuto de acessos (e-mails coletados antes, via WhatsApp).
- Domínio + carteiro verificados e SMTP configurado (pode ser antes).
- Backup fresco da véspera · scripts na ordem · invasão simulada na
  produção · teste com 1 conta de CADA perfil · todo mundo fecha e
  reabre o app · **Plano B por escrito pronto ANTES**.

## FASE 8 — Estabilização (1 semana leve)
- Acompanhar "sem permissão" e ajustar.
- Remover login antigo + senhas legadas + logins inertes.
- 🎉 Destravar a FILA de melhorias (ciclo teste → aprovar → publicar,
  pra sempre).

---

## Protocolo de cada sessão
1. Conversa NOVA no projeto.
2. Anexar: **gestao-mafra-modulos.zip** mais recente (hoje: build 123)
   + **PROJETO-SEGURANCA-GESTAO-MAFRA.md** (documento oficial)
   + na Fase 1, também o **MODELO_PROJETO_SEGURANCA_REPLICAVEL.md**
   (não veio anexado na Fase 0).
3. Dizer a fase (ex.: "Fase 1").
4. Toda entrega: função nunca diminui (validar.js: 123 = 1198) ·
   validações ✅ · 3 arquivos → computador + pasta Backup Gestao Mafra
   no Dropbox.
