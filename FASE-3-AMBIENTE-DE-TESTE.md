# FASE 3 — AMBIENTE DE TESTE (plano)
**Projeto de Segurança · Gestão Mafra · risco ZERO (não toca na produção)**

> Objetivo: ter um **site de teste + banco de teste 100% separados** da produção. A partir daqui, toda mudança de segurança (login novo, cofre) é feita e provada **no teste**; a produção continua intocada até o Dia D.
> Só começa depois que a **Fase 2** (backup + 2FA) estiver feita.

---

## Divisão do trabalho

### 🟩 O que EU (Claude) preparo no código — posso fazer sozinho
1. **Branch `teste`** separada da `main`.
2. **Tornar o endereço/chave do Supabase configuráveis**, para o site de teste apontar para o **banco de teste** sem mexer na produção. Hoje estão fixos em `modulos/_pagina_inicio.html:57-58`. Vou fazer o `build.js`/config ler de uma **variável de ambiente do Netlify** (ex.: `SUPABASE_URL` e `SUPABASE_KEY`), caindo para os valores de produção quando a variável não existe. Assim:
   - site de produção (branch `main`) → banco de produção (como hoje, nada muda);
   - site de teste (branch `teste`) → banco de teste (via variáveis do Netlify).
3. Rodar o build + todas as suítes de teste e te mostrar que a produção continua idêntica.
> ⚠️ Esse item 2 é uma **mudança de código** — vou fazê-la só quando começarmos a Fase 3 de fato, e **sem publicar nada na produção** (fica na branch `teste`). Preciso de você: o **endereço** e a **chave publicável** do banco de teste (passo 🟦 abaixo). Não me mande a chave aqui no chat; você coloca ela direto nas variáveis do Netlify do site de teste.

### 🟦 O que VOCÊ faz nos painéis — eu te passo o passo a passo na hora
1. **Criar um projeto de teste no Supabase** (plano grátis serve), **mesma região** do de produção.
2. **Criar a tabela `dados`** nele (mesma estrutura: colunas `chave`, `valor`, `atualizado_em`). Eu te dou o comando SQL pronto para colar.
3. **Pôr dados fictícios**: 1 condomínio-modelo + 1 usuário de teste **por perfil** (master, síndico, BPO, gestor, helpdesk). Eu preparo esses dados de exemplo.
4. **Criar um segundo site no Netlify** (ex.: `gestao-mafra-teste`) ligado à branch **`teste`**, com as variáveis `SUPABASE_URL`/`SUPABASE_KEY` apontando para o **banco de teste**.
5. ⚠️ **Lição herdada:** banco novo vem com **RLS LIGADO e sem políticas** → retorna vazio sem dar erro. No começo do teste a gente **desliga o RLS** (ou cria política aberta) para o app funcionar, e **religa com as regras certas só na Fase 5**.

---

## Pronto quando
- Endereço de teste no ar (ex.: `gestao-mafra-teste.netlify.app`), **100% separado** da produção, funcionando com dados fictícios.
- A produção segue no ar, **sem nenhuma alteração**.

## O que NÃO pode acontecer
- Misturar banco de teste com banco de produção.
- Publicar a branch `teste` na produção.
- Usar dados reais de condôminos no ambiente de teste.
