# Gestão Mafra — instruções para o Claude Code

Leia este arquivo inteiro antes de qualquer tarefa. Ele substitui a memória da conversa anterior
(claude.ai, projeto "Gestão Mafra 2026-2027", builds 122 → 143, set/out 2026).

## O que é
PWA de gestão condominial da **Mafra Gestão Integrada** (Ribeirão Preto/SP). Nunca chamar de
"administradora". Dona do produto: **Mafra** (Márcia Regina Mafra, master). Coordenadora
administrativa que publica e opera: **Bianca**. Equipe: síndicos operacionais (Walace, Bruna,
Milena), BPO (Bianca, Camilla, Julia), André (sócio), gestores de condomínio (logins por
condomínio; Le Monde e Trio são GRUPOS com 3 subcondomínios cada e uma gerente + 2 administrativos).

- Site em produção: https://gestao-mafra.netlify.app (Netlify, site id `8b2f6642-3e9d-4edc-8884-be7acd04f184`,
  time "Mafra", slug `comercial-mafraesalgado`, login do André).
- Banco: Supabase, projeto `vycoezpwxawwgqdrtisy`, tabela única `dados` (chave→valor JSON), chaves
  `mafra:*` (agenda, eventos, checkins, relatorios, listas, avisos…). Chave publicável no
  `_pagina_inicio.html` (linhas 57–58). Edge Functions: `gerar-ata`, `transcrever-audio`.
- Login atual: usuário/senha em JS (`USUARIOS` em `_nucleo.js`) + "digital" (WebAuthn). É isso que o
  Projeto de Segurança vai trocar (Fases 1–8).

## Como o código é organizado
- `modulos/_pagina_inicio.html` + `modulos/*.js` (ordem em `modulos/ordem.json`) + `modulos/_pagina_fim.html`
  → `node modulos/montar.js` gera **um único `index.html`** (~4,3 MB). Nunca editar o index gerado.
- `_nucleo.js` = estado, armazenamento (`storeGet/storeSet/storeDel` com cache), usuários, menu,
  relatório gerencial (PDF), helpers. Cada `aba_*.js` é uma aba. Cabeçalho de cada módulo lista as
  funções globais que ele define (`/* Funções desta aba: … */`).
- Versão: `APP_VERSAO = "AAAA-MM-DD · build N"` em `_nucleo.js`. **Todo build incrementa N.**
- `site-apoio/` = arquivos que vão junto com o index no deploy (manifest, sw.js, ícones, capa,
  agendar.html, _redirects). O index tem manifest e ícone **embutidos** como rede de segurança
  (builds 132/133) caso esses arquivos faltem no servidor.

## Regras inegociáveis
1. **Nunca apagar, converter ou migrar dados preenchidos por usuários** sem a Mafra pedir. Mudanças
   são sempre camadas novas (ex.: Listas em `mafra:listas:*` ao lado da agenda `mafra:agenda:*`).
2. **Contagem de funções globais nunca diminui** (`node validar.js` imprime; build 143 = 1303).
3. Toda edição por script (Python `str.replace` com `assert count==1`), depois `node --check` em cada
   módulo, `node modulos/montar.js`, e as suítes JSDOM:
   `node validar.js && node testar-usuarios.js && node testar-subcondominios.js && node testar-checkin-auto.js && node testar-build127.js && node testar-listas.js && node testar-recorrencia.js`
   (precisa de `npm install jsdom`). Tudo tem que terminar em "✅ tudo passou".
4. Mudança visual → **sempre gerar screenshot** (Playwright/Chromium, 390px celular e 1280px
   computador) e mostrar antes de a Mafra publicar.
5. Entregáveis de cada build (três arquivos + leia-me):
   - `gestao-mafra-site.zip` contendo a pasta `SUBIR-ESTA-PASTA-NO-NETLIFY/` com os **12 arquivos**
     (index.html + site-apoio + LEIA-ME-COMO-PUBLICAR.txt);
   - `gestao-mafra-site-ZIP-DIRETO.zip` (mesmos arquivos soltos na raiz) — reserva;
   - `index.html` avulso — backup;
   - `gestao-mafra-modulos.zip` (modulos/, testes, validar.js, package.json, LEIA-MEs).
6. Explicações operacionais para a Mafra: passo a passo numerado, dizendo onde clicar e o que deve
   aparecer. Linguagem simples, sem jargão.

## Publicação automática (GitHub → Netlify) — caminho preferido a partir de 06/10/2026
- `node build.js` monta o `index.html` e preenche `dist/` (index + site-apoio). `netlify.toml` manda o
  Netlify rodar isso e publicar `dist/`. Com o repositório ligado ao site, **cada push na branch `main`
  publica a produção** — fim do upload manual.
- Fluxo de uma entrega: editar módulos → `npm run tudo` (build + todos os testes ✅) → screenshot →
  commit com mensagem "build N: …" → push → conferir `gestao-mafra.netlify.app/manifest.json` e o build
  no login. Só fazer push para `main` com a Mafra de acordo (é produção).
- Branch `teste` (Fase 3 do projeto de segurança) → segundo site do Netlify apontando para o banco
  de teste. Nunca misturar as duas.
- Repositório PRIVADO (o código traz a chave publicável do Supabase e os logins atuais).

## Publicação manual (o que funcionava antes do GitHub)
Netlify → gestao-mafra → **"browse files to upload"** → entrar na pasta
`SUBIR-ESTA-PASTA-NO-NETLIFY` → **Ctrl + A** (12 arquivos) → Abrir. Arrastar a pasta e arrastar o zip
já falharam (subiam só 3 arquivos). Conferência decisiva depois do deploy:
`gestao-mafra.netlify.app/manifest.json` e `/apple-touch-icon.png` têm que abrir; login mostra o build.
O Claude não consegue fazer o deploy (rede bloqueada); quem publica é a Mafra/Bianca.

## Estado em 06/10/2026
- Último build entregue: **143** (02/10) — status próprio por ocorrência em tarefas recorrentes.
- Builds 122→143 em `PROJETO-SEGURANCA-GESTAO-MAFRA.md` (diário de bordo) e nos LEIA-ME.
- Fila do pós-projeto: upload de vídeo direto pelo app (Drive/YouTube não listado); limpeza da
  lixeira; aba Condôminos nativa; sincronização Google Calendar.

## Projeto de Segurança (9 fases) — ver CRONOGRAMA-PROJETO-SEGURANCA.md
Fase 0 concluída (build 123). **Próxima: Fase 1 — Levantamento** (raio-X do banco, do login e das
páginas públicas; regras por escrito de quem vê o quê; decisão técnica do cofre; data do Dia D).
Da Fase 3 em diante tudo acontece num site de teste + banco de teste separados; a produção só muda
no Dia D (Fase 7). Melhorias novas ficam congeladas durante o projeto (vão para a fila), salvo
exceção explícita da Mafra. Uma fase por sessão. Tudo com prova.
