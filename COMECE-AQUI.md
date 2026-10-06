# COMECE AQUI — como abrir o Gestão Mafra no Claude Code

## 1. Preparar a pasta (uma vez)
1. Extraia o `KIT-CLAUDE-CODE-GESTAO-MAFRA.zip`. Vai aparecer a pasta **gestao-mafra**.
2. Guarde essa pasta num lugar fixo (ex.: `Documentos\gestao-mafra`). É nela que o Claude Code vai trabalhar.
3. Dentro dela já estão: `CLAUDE.md` (as instruções que o Claude Code lê sozinho), `modulos/` (o código),
   `site-apoio/` (manifest, ícones, sw.js…), os testes (`validar.js`, `testar-*.js`),
   `PROJETO-SEGURANCA-GESTAO-MAFRA.md` (documento oficial) e `CRONOGRAMA-PROJETO-SEGURANCA.md`.

## 2. Abrir o Claude Code nessa pasta
- No app Claude Desktop → aba **Code** → "Abrir pasta" → escolha **gestao-mafra**.
- (Ou no terminal: entrar na pasta e digitar `claude`.)

## 3. Primeira mensagem (copie e cole)
Está no arquivo `PROMPT-INICIAL.md`. Há duas versões: uma para **continuar os builds** (correções e
melhorias) e outra para **começar a Fase 1 do Projeto de Segurança**.

## 4. O que esperar de cada entrega
- Ele deve rodar `node modulos/montar.js` e TODOS os testes, mostrar "✅ tudo passou", gerar o
  screenshot de qualquer mudança visual e entregar os 4 arquivos (site.zip, ZIP-DIRETO, index.html,
  modulos.zip) com o LEIA-ME do build.
- Você publica pelo Netlify: "browse files to upload" → pasta SUBIR-ESTA-PASTA-NO-NETLIFY → Ctrl + A → Abrir.
- Confere `gestao-mafra.netlify.app/manifest.json` abrindo e o "build N" no login.

## 5. Se algo der errado
- "Não acho os módulos": confirme que abriu a pasta **gestao-mafra** (a que tem o CLAUDE.md).
- Testes falhando por data (sábado/domingo): alguns testes dependem de dia útil; rode de novo em dia útil
  ou peça para ele tornar o teste independente do dia.
- Netlify subiu só 3 arquivos: refaça com "browse files to upload" + Ctrl + A (nunca arrastar).
