# PROMPT INICIAL — copie e cole no Claude Code

---------------------------------------------------------------------
## Versão A — continuar os builds (correções / melhorias do app)
---------------------------------------------------------------------

Leia o CLAUDE.md inteiro e o diário de bordo em PROJETO-SEGURANCA-GESTAO-MAFRA.md antes de
qualquer coisa. Depois:

1. Rode `npm install` e confirme que `node modulos/montar.js` gera o index.html e que TODAS as
   suítes passam (validar.js, testar-usuarios.js, testar-subcondominios.js, testar-checkin-auto.js,
   testar-build127.js, testar-listas.js, testar-recorrencia.js). Me mostre a contagem de funções.
2. Me diga em 5 linhas o que você entendeu do sistema e das regras (sem apagar dados, contagem de
   funções nunca cai, screenshots nas mudanças visuais, 4 entregáveis, publicação por "browse files"
   + Ctrl + A).
3. Só então eu passo a alteração. Cada alteração = novo build (incrementar APP_VERSAO), testes,
   screenshot e os 4 arquivos de entrega com LEIA-ME.

---------------------------------------------------------------------
## Versão B — começar a FASE 1 do Projeto de Segurança
---------------------------------------------------------------------

Leia o CLAUDE.md, o CRONOGRAMA-PROJETO-SEGURANCA.md e o PROJETO-SEGURANCA-GESTAO-MAFRA.md.
Estamos na FASE 1 — Levantamento. Regras da fase: NÃO mudar nada em produção, NÃO criar build novo;
é só raio-X e documento. Entregue, nesta ordem, com prova (trechos do código / consultas) e em
linguagem simples:

1. INVENTÁRIO DO BANCO: todas as chaves `mafra:*` usadas no código (arquivo e função que lê/grava),
   agrupadas por família (agenda, eventos, checkins, relatórios, listas, avisos, configurações…).
   Para cada família: quem deveria poder LER e quem deveria poder GRAVAR, por perfil (master, síndico
   operacional, funcionário/BPO, gestor de condomínio, helpdesk) e por condomínio.
2. LOGIN HOJE: onde mora a senha, como a sessão é guardada, o que a "digital" faz, onde a chave do
   Supabase aparece, o que uma pessoa mal-intencionada conseguiria fazer só com o index.html.
3. PÁGINAS PÚBLICAS: `agendar.html`, o link de agendamento e qualquer tela sem login — o que elas
   leem/gravam no banco diretamente.
4. FUNÇÕES E INTEGRAÇÕES: Edge Functions `gerar-ata` e `transcrever-audio` (onde ficam as chaves de
   IA), Netlify, Google (calendário/Drive), YouTube/vídeos.
5. BACKUPS E ACESSOS: o que existe hoje de backup do banco e do código; contas Netlify/Supabase/Google
   e quem tem acesso (eu completo o que você não conseguir ver).
6. DECISÃO TÉCNICA DO COFRE: proposta em 1 página, comparando (a) RLS por etiqueta de chave na tabela
   `dados` e (b) toda leitura/gravação passando por uma "funcionária" (Edge Function com chave-mestra
   no servidor). Prós, contras, risco e esforço de cada uma, e a sua recomendação.
7. REGRAS DE NEGÓCIO "QUEM VÊ O QUÊ": rascunho em tabela para eu validar.
8. PROPOSTA DE DATA DO DIA D (dia de baixo movimento) e lista do que precisa estar pronto antes.

Formato: um arquivo `FASE-1-LEVANTAMENTO.md` na pasta, mais um resumo de 10 linhas no chat.
Ao terminar, atualize o Painel e o Diário de Bordo do PROJETO-SEGURANCA-GESTAO-MAFRA.md
(Fase 1 concluída · próxima: Fase 2 — Backup total e blindagem de contas).
