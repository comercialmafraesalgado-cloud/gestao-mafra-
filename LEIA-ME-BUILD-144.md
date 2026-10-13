# BUILD 144 — conserto da perda de relatórios do mês vigente
**Data: 2026-10-13 · emergência de dados (exceção aprovada ao congelamento do projeto)**

## O que acontecia
Os relatórios do **mês vigente** sumiam de vez em quando. Causa raiz encontrada no código:
- Quando a leitura do banco **falhava ou voltava vazia** (conexão fraca de celular, ou o RLS recusando o acesso), o app **usava silenciosamente a cópia local daquele aparelho** achando que era a verdade.
- Ao salvar, o "cinto de segurança" do build 122 (mesclar antes de gravar) usava **justamente essa leitura** — então, se ela veio da cópia local velha, a gravação **sobrescrevia a lista boa do servidor**, derrubando os relatórios do mês que só existiam lá.
- Como o mês vigente é onde entram relatórios novos de vários aparelhos, era **ele** que sumia.

## O que o build 144 faz (3 travas novas)
1. **Não grava sem confirmar o servidor.** Agora o app distingue "o servidor respondeu" de "não consegui falar com o servidor". Se **não conseguir confirmar** a lista verdadeira, ele **NÃO grava** — mostra "sem conexão confiável, tente de novo". Melhor não salvar do que apagar. *(`_storeGetNuvem` + `saveRelatorios` em `modulos/_nucleo.js`)*
2. **Trava de encolhimento.** Se a gravação deixaria a lista **menor** que a do servidor sem exclusão pedida, ela é **bloqueada** na hora (o vigia que antes só avisava *depois* agora barra *antes*).
3. **Restauração da fotografia virou ADITIVA.** Ao restaurar uma fotografia de um dia, o app agora **traz de volta só os relatórios que faltam, SEM remover os atuais** (antes ele substituía tudo e podia "mudar o mês"/derrubar o que foi criado depois).

## O que NÃO muda
- Nenhum dado é apagado ou migrado. As fotos continuam em chaves separadas (`mafra:relfotos:<id>`), intocadas.
- Nenhuma mudança visual (não precisa de screenshot).

## Provas (testes)
- `node validar.js` → 1304 funções (build 143 = 1303; nada removido).
- Todas as 7 suítes: **✅ tudo passou**.
- Novas provas específicas em `testar-usuarios.js`:
  - restauração aditiva traz o que falta **e mantém** o relatório atual;
  - servidor não confirmado → `saveRelatorios` retorna false e **a lista fica intacta**;
  - aviso "sem conexão confiável".

## Revisão adversarial (antes de publicar)
Uma segunda verificação confirmou: **nenhuma regressão de perda de dados** nos fluxos reais (Supabase). Dois ajustes extras entraram por segurança:
- A migração automática de fotos (segundo plano, no login) **não abre mais alerta** quando a conexão oscila — ela só pausa e tenta no próximo login (`opts.silencioso`).
- **Arquivar** agora **grava o índice ANTES** de liberar (apagar) as fotos — assim uma falha de gravação nunca deixa o relatório sem fotos e sem arquivar.

## Sobre as FOTOS que não voltaram (importante)
A fotografia diária guarda só a **LISTA (índice)**, não as fotos. Então restaurar a lista **não traz fotos de volta** — e restaurar um dia antigo pode desencontrar a lista das fotos ("mudou o mês"). As fotos em si **não são apagadas** pelo app (regra de ouro do build 122), então em geral **ainda estão no banco**. Para recuperá-las, ver o passo a passo `RECUPERAR-RELATORIOS.md`.
