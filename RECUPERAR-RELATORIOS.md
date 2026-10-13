# RECUPERAR RELATÓRIOS E FOTOS — passo a passo (Bianca)
**Situação: a restauração "mudou o mês" e as fotos não vieram todas.**

> Entenda antes: a **fotografia diária** guarda só a **LISTA** de relatórios, **não as fotos**. As fotos ficam em chaves separadas e **o app não as apaga** (regra de ouro do build 122) — então elas quase sempre **ainda estão no banco**; o que faltou foi a lista voltar certa e se reencontrar com elas.

---

## PASSO 0 — Voltar a lista para a mais completa (desfazer o "mudou o mês")
Pelas suas fotografias, a lista mais completa é a de **2026-10-13 (46 relatórios)**.
1. Entrar como **Bianca** → **Gerenciar → 🩺 Saúde do sistema**.
2. Na lista de fotografias, clicar em **↩️ Restaurar** na linha **2026-10-13 · 46 relatório(s)**.
3. Confirmar. Isso traz a lista de volta aos 46 (o estado mais cheio).
   - *(Observação: enquanto o build 144 não estiver publicado, a restauração ainda é do tipo "substituir" — por isso escolhemos a fotografia MAIS completa, 46, que contém tudo.)*

## PASSO 1 — Trazer as FOTOS de volta (resgate pelos aparelhos)
O app guarda, em cada aparelho, uma cópia local das fotos que aquele aparelho já viu. Ao abrir o app atualizado, ele **devolve sozinho** ao servidor as fotos que estiverem faltando (aparece o ♻️).
1. Peça para **cada pessoa que criou/editou os relatórios** (Bianca, Walace, Bruna, Milena…) **abrir o app** no aparelho que ela usa.
2. Deixe o app aberto um ou dois minutos. Ele reenvia as fotos que faltam.
3. Abra alguns relatórios e confira se as fotos voltaram.

## PASSO 2 — Rede de segurança do banco (Supabase)
Se ainda faltar foto:
1. Supabase → **Database → Backups**: veja se há um backup de **antes** da perda e, se o plano permitir, faça a restauração/baixa.
2. (Também vale conferir a "lixeira" do servidor — chaves `mafra:lixeira:relfotos:*` — comigo, se precisar.)

## PASSO 3 — Fotos que não voltarem (🔴)
Para relatórios antigos cujas fotos se perderam de fato (ex.: Centro Profissional Ribeirão Shopping / agosto), o caminho é **re-anexar da galeria** no editor do relatório. Me avise quais ficaram 🔴 que eu te ajudo a organizar.

---

## E para NÃO acontecer de novo
Publicar o **build 144** (conserto). Depois dele:
- O app **não grava mais por cima** quando a conexão não é confiável (não derruba o mês vigente).
- A restauração passa a ser **aditiva** (traz o que falta sem remover os atuais).
