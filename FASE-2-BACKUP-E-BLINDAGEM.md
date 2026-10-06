# FASE 2 — BACKUP TOTAL + BLINDAGEM DE CONTAS (passo a passo)
**Projeto de Segurança · Gestão Mafra · risco ZERO (não mexe no app nem no banco)**

> Objetivo: ter uma **cópia completa dos dados e do código fora das plataformas** e **trancar as contas** ANTES de qualquer mudança. Nada aqui altera a produção. Quem clica nos painéis é você (Mafra/Bianca); eu preparo o que dá pelo código.
> Marque ✅ conforme for fazendo. No fim, me avise que eu atualizo o painel do projeto.
>
> **Situação confirmada em 06/10 (por isso esta fase é prioridade):** hoje **não há backup fora do Supabase** e o **2FA está desligado** nas 3 contas. Acessos de terceiros: só a empresa da Mafra (nada a remover — Parte D é só conferir).

---

## PARTE A — Backup do BANCO (Supabase)
Tudo do sistema mora numa única tabela chamada **`dados`**. Fazer backup dela = fazer backup de tudo.

**Caminho mais simples (recomendado) — exportar a tabela em CSV:**
1. Entre em **app.supabase.com** e abra o projeto **`vycoezpwxawwgqdrtisy`** (Gestão Mafra).
2. Menu lateral → **Table Editor**.
3. Clique na tabela **`dados`**.
4. No canto superior direito da tabela, clique nos **três pontinhos "⋯"** (ou no botão **Export**) → **Export data to CSV**.
5. Vai baixar um arquivo (pode ser grande — tem as fotos dentro). Guarde em **Dropbox › Backup Gestao Mafra** com a data no nome, ex.: `dados-backup-2026-10-06.csv`.

**Reforço (se o seu plano permitir) — backup automático do banco:**
6. Menu lateral → **Database** → **Backups**. Veja se há backups automáticos e, se houver opção de **Download**, baixe um e guarde junto. *(No plano grátis esse download pode não existir — aí o CSV do passo 1-5 é o que vale.)*

- [ ] CSV da tabela `dados` baixado e guardado no Dropbox
- [ ] (Opcional) Backup automático conferido/baixado

---

## PARTE B — Backup do CÓDIGO (eu gero, você guarda)
- Eu gerei um **ZIP com todo o código-fonte** (módulos, testes, documentos) e te mandei aqui no chat.
- [ ] Guardar esse ZIP em **Dropbox › Backup Gestao Mafra** (junto com o backup do banco).
- Obs.: o código também já está no **GitHub** (repositório privado) — então agora você tem **duas** cópias fora do seu computador.

---

## PARTE C — Ligar o 2FA (verificação em duas etapas) nas 3 contas
Isso evita que uma senha vazada de uma conda de plataforma entregue tudo.

> ⚠️ Importante: se você **entra no Supabase/Netlify usando o Google** (botão "Continue with Google") ou GitHub, o 2FA que protege essas contas é o **2FA do Google/GitHub**. Ligue o do Google primeiro (passo 1) que já cobre boa parte.

1. **Google** (myaccount.google.com):
   - **Segurança** → **Verificação em duas etapas** → **Ativar** → siga (celular/aplicativo autenticador).
2. **Netlify** (app.netlify.com):
   - Canto superior direito (seu avatar) → **User settings** → **Security** (ou **Password & authentication**) → **Two-factor authentication** → **Enable**.
   - *(Se o login do Netlify é via Google/GitHub, o 2FA fica nessa conta — confira que está ligado lá.)*
3. **Supabase** (app.supabase.com):
   - Avatar/canto → **Account** → **Security** → **Two-Factor Authentication / MFA** → **Enable**.
   - *(Idem: se o login é via Google/GitHub, o 2FA é o daquela conta.)*

- [ ] 2FA ligado no Google
- [ ] 2FA ligado no Netlify (ou na conta Google/GitHub usada para entrar)
- [ ] 2FA ligado no Supabase (ou na conta Google/GitHub usada para entrar)

---

## PARTE D — Auditar e remover acessos de terceiros
Veja quem tem acesso e tire quem não precisa mais.
1. **Netlify** → **Team settings** → **Members**: confira a lista. Remova quem não deveria mais ter acesso.
2. **Supabase** → **Organization** → **Team** (ou **Members**): confira e remova acessos antigos.
3. **Google**: myaccount.google.com → **Segurança** → **Seus dispositivos** e **Apps de terceiros com acesso à conta**: remova o que não reconhece.

- [ ] Netlify: membros conferidos / limpos
- [ ] Supabase: membros conferidos / limpos
- [ ] Google: dispositivos e apps conferidos / limpos

---

## PARTE E — Entender a cobrança do Netlify
1. **Netlify** → **Team settings** → **Billing**: veja o plano atual e se há cobrança por número de publicações/banda.
2. A ideia (quando o GitHub estiver ligado) é **agrupar publicações de produção** para não gerar deploy à toa. Me diga o que aparece lá que eu te oriento.

- [ ] Plano/cobrança do Netlify conferidos

---

## PRONTO QUANDO
- ✅ Cópia completa do **banco** (CSV) + do **código** (ZIP) guardadas fora das plataformas, com você.
- ✅ **2FA** ligado nas contas (ou nas contas Google/GitHub usadas para entrar).
- ✅ Acessos de terceiros revisados.
- ✅ Cobrança do Netlify entendida.

Quando terminar, me avise — eu registro a Fase 2 como concluída no diário/painel e preparo a **Fase 3 (ambiente de teste)**.
