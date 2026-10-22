# BUILD 145 — editar o mês do relatório + limpeza segura do histórico
**Data: 2026-10-22 · a pedido da Mafra**

## O que mudou (2 coisas)

### 1) 🔧 Corrigir o mês de um relatório (no editor, sem comando)
- Novo campo **"Mês de referência"** no topo do editor do relatório.
- É só abrir o relatório → **Editar** → trocar o mês → **Salvar**.
- Resolve de vez o "relatório com mês errado" — vocês mesmos corrigem, sem depender de ninguém.

### 2) 🧹 Limpar histórico antigo (manual e seguro)
- Botão **"Limpar histórico antigo"** na aba Relatórios (só master/Bianca).
- Guarda os relatórios com **mais de 2 anos** (mantém sempre os últimos 24 meses).
- **Como funciona, com MÁXIMA segurança:**
  - Mostra **quantos e quais** vão sair e **pede confirmação**.
  - Os relatórios **NÃO são apagados** nem removidos do banco — apenas **marcados como "histórico"** (somem do dia a dia, mas continuam inteiros, com fotos).
  - Botão **"Ver histórico antigo (N)"** mostra os guardados, com **♻️ Restaurar** em cada um.
  - **Nada automático.** Nada some sozinho. A Bianca recebe um aviso do que foi guardado.

## Por que assim (e não apagando)
Medimos o seu banco: **53 relatórios = 340 MB**, de **8 GB** do plano Pro. Espaço **sobra muito** (2 anos ≈ 1–2,6 GB). Então não há necessidade de apagar nada — a limpeza serve só pra **deixar a tela organizada**, e tudo fica **recuperável**.

## Provas (testes)
- `node validar.js` → **1307 funções** (build 144 = 1304; nada removido).
- Todas as 7 suítes: **✅ tudo passou**.
- Provas novas em `testar-usuarios.js`:
  - editor tem o campo de mês e a troca é respeitada;
  - relatório de +2 anos vai para o histórico, recente não é mexido;
  - restaurar funciona; o histórico fica escondido na lista normal e o botão "Ver histórico antigo" aparece.
- **Screenshots** (celular e computador) anexados.

## Observação
- O botão de editar mês é liberado para quem já pode editar o relatório; a limpeza do histórico é só para **master** (ex.: Bianca).
- A correção de mês que fizemos à mão (Le Monde Parc e Centro Profissional) continua valendo — daqui pra frente dá pra fazer pelo botão.
