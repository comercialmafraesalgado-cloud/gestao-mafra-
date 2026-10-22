# FASE 3 — AMBIENTE DE TESTE · passo a passo para a Mafra
**Projeto de Segurança · Gestão Mafra · 22/10/2026**

> **O que é:** um **site de teste** com um **banco de teste**, 100% separados da produção.
> A partir daqui, as mudanças de segurança (login novo, "o cofre") são feitas e provadas **no teste**.
> A **produção continua intocada** — ninguém nota nada.
>
> **Antes de começar:** a Fase 2 (backup externo + 2FA ligado) precisa estar feita.
> **Risco:** ZERO para a produção. Nada aqui encosta no banco de verdade.

---

## ✅ O que eu (Claude) já deixei pronto no código
- O `build.js` agora sabe a diferença entre **produção** e **teste**:
  - **Produção** (branch `main`) → usa **sempre** o banco de verdade, fixo no código. Ignora qualquer variável. **Não dá para repontar a produção por engano.**
  - **Teste** (branch `teste`) → é **obrigado** a usar o banco de teste (pelas variáveis do Netlify). Se faltar a variável, **ou** se apontar para a produção, o build **trava e não publica**. O site de teste **nunca** grava no banco de produção.
- O arquivo **`TESTE-banco-de-dados.sql`** cria a tabela do banco de teste igualzinha à da produção.
- **Provei** que a produção continua idêntica: 7 suítes de teste ✅, 1307 funções (nada removido).

> **Falta uma coisa que eu faço com o seu OK:** criar a branch **`teste`** no GitHub (é ela que o site de teste vai acompanhar). Me dá o sinal verde e eu crio.

---

## 🟦 PARTE A — Criar o BANCO de teste (Supabase)

1. Entre no **Supabase** (mesma conta de hoje) → canto superior → **New project**.
2. Dê o nome **`gestao-mafra-teste`**. Escolha a **mesma região** do projeto de produção (South America / São Paulo). Crie uma senha de banco e **guarde**. Clique **Create new project** e espere ~2 minutos.
3. Quando abrir, no menu da esquerda clique em **SQL Editor** → **New query**.
4. Abra o arquivo **`TESTE-banco-de-dados.sql`** (eu te mando junto), **copie tudo** e **cole** no editor. Clique **Run** (ou Ctrl+Enter).
   - **Deve aparecer**, no final, uma linha com `dados`. Isso é a tabela criada. ✔️
5. Agora pegue os **2 dados** que o site de teste vai precisar:
   - Menu da esquerda → **Project Settings** (engrenagem) → **API**.
   - Copie o **Project URL** (algo como `https://abcdef....supabase.co`).
   - Copie a chave **publishable** (`sb_publishable_...`) — ou, se não aparecer, a **anon public**.
   - **Guarde os dois.** Você vai colar na Parte B. **Não precisa me mandar aqui no chat.**

> ⚠️ **Confira duas vezes:** o endereço no topo da tela do Supabase tem que ser o do **TESTE**. Não pode ser `vycoezpwxawwgqdrtisy` (esse é o de produção).

---

## 🟦 PARTE B — Criar o SITE de teste (Netlify)

6. Me avise que a Parte A está pronta — **eu crio a branch `teste`** no GitHub.
7. No **Netlify**, clique em **Add new site** → **Import an existing project** → **GitHub** → escolha o repositório **gestao-mafra**.
8. Na tela de configuração, procure **Branch to deploy** e troque de `main` para **`teste`**.
   - O **build command** e a **publish directory** já vêm certos do arquivo `netlify.toml` (`node build.js` e `dist`). Não precisa mexer.
9. **ANTES de publicar**, abra **Environment variables** (ainda nessa tela, ou depois em *Site configuration → Environment variables*) e adicione **duas** variáveis:
   - Nome **`SUPABASE_URL`** → valor: o **Project URL** do banco de teste (Parte A, passo 5).
   - Nome **`SUPABASE_KEY`** → valor: a **chave publishable** do banco de teste (Parte A, passo 5).
10. Agora clique em **Deploy**.
    - Se você **esquecer** de pôr as variáveis, o build **vai travar de propósito** com a mensagem *"BUILD ABORTADO… é de TESTE e não tem SUPABASE_URL/SUPABASE_KEY"*. Isso é o **cinto de segurança**: é só voltar, pôr as duas variáveis e publicar de novo.
11. Quando terminar, o Netlify te dá um endereço tipo **`gestao-mafra-teste.netlify.app`**. Esse é o seu ambiente de teste.

---

## 🟩 PARTE C — Conferir (2 minutos)

12. Abra o **site de teste** (`...-teste.netlify.app`). Faça login com um usuário qualquer.
    - **Deve aparecer** o aviso *"AMBIENTE DE TESTE"* (o dado fictício do SQL). Isso prova que ele está lendo o **banco de teste**. ✔️
13. Abra o **site de produção** (`gestao-mafra.netlify.app`). Confira que **está tudo igual** — seus relatórios, agenda, nada mudou. ✔️
14. **Teste da separação (opcional, mas recomendo):** crie um aviso qualquer no site de **teste** e confirme que ele **NÃO aparece** na produção. São dois mundos separados. ✔️

---

## 🔒 Avisos de segurança (importantes)
- **Nunca** use dados reais de condomínio/condômino no ambiente de teste. Só dados fictícios.
- O banco de teste começa com uma política **aberta** (igual à produção hoje) só para funcionar. Na **Fase 5** a gente troca pelas regras de verdade (cada login só vê o que é dele) — e testa a "invasão" lá, sem risco.
- A chave do banco de teste fica **só nas variáveis do Netlify**, nunca no código e nunca no chat.

## Pronto quando
- `gestao-mafra-teste.netlify.app` no ar, lendo o **banco de teste**, com o aviso fictício aparecendo.
- `gestao-mafra.netlify.app` (produção) **sem nenhuma alteração**.
