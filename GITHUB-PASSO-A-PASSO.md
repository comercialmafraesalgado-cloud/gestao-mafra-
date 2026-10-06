# Colocar o Gestão Mafra no GitHub e ligar ao Netlify (uma vez só)

Resultado: toda versão nova que o Claude Code salvar vai para o ar sozinha, com todos os arquivos.
O endereço gestao-mafra.netlify.app continua o mesmo.

## Parte 1 — Conta e repositório (10 min)
1. Entre em github.com. Se não tiver conta, crie com o e-mail da Mafra (gratuito).
2. Canto superior direito → "+" → **New repository**.
3. Repository name: `gestao-mafra`. Marque **Private** (privado!). Não marque nada mais. Clique **Create repository**.
4. Deixe essa página aberta: ela mostra o endereço do repositório, algo como
   `https://github.com/SEU-USUARIO/gestao-mafra.git`.

## Parte 2 — Mandar o código (o Claude Code faz por você)
Abra a pasta `gestao-mafra` no Claude Code e cole:

> Inicie um repositório git nesta pasta, faça o primeiro commit "build 143: ponto de partida" e envie
> para https://github.com/SEU-USUARIO/gestao-mafra.git na branch main. Se precisar de login no GitHub,
> me diga exatamente o que clicar.

(Se ele pedir, o GitHub vai abrir uma tela para você autorizar com um código — é normal.)

## Parte 3 — Ligar o Netlify ao repositório (5 min)
1. app.netlify.com → Projects → **gestao-mafra**.
2. Menu lateral **Project configuration** → **Build & deploy** → **Continuous deployment**.
3. Clique em **Link repository** (ou "Link to Git provider") → **GitHub** → autorize → escolha
   o repositório `gestao-mafra`.
4. Confira os campos (devem vir preenchidos pelo `netlify.toml`):
   - Branch to deploy: **main**
   - Build command: **node build.js**
   - Publish directory: **dist**
5. Salve. O Netlify faz o primeiro deploy sozinho. Em "Deploys" vai aparecer um deploy
   "from GitHub" com todos os arquivos.
6. Teste: abra gestao-mafra.netlify.app/manifest.json (tem que abrir) e o login mostra o build.

## Daqui em diante
- Você pede a alteração ao Claude Code → ele faz, testa, mostra o screenshot → com o seu "pode
  subir", ele faz o push para `main` → 1 a 2 minutos depois está no ar.
- Nunca mais arrastar pasta ou "browse files". Se um dia precisar voltar uma versão: Netlify →
  Deploys → clicar no deploy anterior → "Publish deploy".
