// build.js — monta o index.html e prepara a pasta dist/ para o Netlify publicar (deploy automático via GitHub)
// Uso: node build.js   → dist/ com index.html + arquivos de apoio (manifest, sw, ícones, capa, agendar, _redirects)
//
// ─────────────────────────────────────────────────────────────────────────────
// SEGURANÇA DO AMBIENTE DE TESTE (Projeto de Segurança · Fase 3)
// ─────────────────────────────────────────────────────────────────────────────
//   • A PRODUÇÃO (branch "main", ou build local/manual) usa SEMPRE o banco que
//     está fixo no código (modulos/_pagina_inicio.html). As variáveis de ambiente
//     são IGNORADAS na produção, para que o banco de produção JAMAIS seja
//     repontado por engano.
//   • QUALQUER outra branch (ex.: "teste") é OBRIGADA a ter o SEU PRÓPRIO banco
//     nas variáveis do Netlify (SUPABASE_URL / SUPABASE_KEY). Se faltarem, ou se
//     apontarem para o banco de PRODUÇÃO, o build É ABORTADO — assim o site de
//     teste NUNCA grava no banco de produção.
//   • A troca do banco acontece só no arquivo que vai para dist/ (o que o Netlify
//     publica). O index.html do repositório continua com os valores de produção.
const { execSync } = require("child_process");
const fs = require("fs"), path = require("path");

execSync("node modulos/montar.js", { stdio: "inherit" });

// 1) Lê o index.html recém-montado — ele traz os valores de PRODUÇÃO fixos no código.
let html = fs.readFileSync("index.html", "utf8");
const RX_URL = /const SUPABASE_URL = "[^"]*";/;
const RX_KEY = /const SUPABASE_KEY = "[^"]*";/;
const PROD_URL = (html.match(/const SUPABASE_URL = "([^"]*)";/) || [])[1] || "";
const PROD_KEY = (html.match(/const SUPABASE_KEY = "([^"]*)";/) || [])[1] || "";

// 2) Descobre em que branch o Netlify está construindo.
//    (O Netlify expõe BRANCH e CONTEXT. Sem eles → build local/manual → tratamos como produção.)
const branch  = process.env.BRANCH  || "";
const context = process.env.CONTEXT || "";
const ehProducao = !branch || branch === "main" || context === "production";

if (ehProducao) {
  // PRODUÇÃO (ou build local/manual): nada a trocar. Usa os valores fixos do código.
  console.log(`🔒 Build de PRODUÇÃO (branch="${branch || "(local)"}", context="${context || "(local)"}") → banco fixo do código. Variáveis de ambiente ignoradas.`);
} else {
  // BRANCH DE TESTE (qualquer coisa diferente de "main"): exige banco próprio, diferente da produção.
  const envUrl = (process.env.SUPABASE_URL || "").trim();
  const envKey = (process.env.SUPABASE_KEY || "").trim();

  if (!envUrl || !envKey) {
    throw new Error(
      `BUILD ABORTADO — a branch "${branch}" é de TESTE e não tem SUPABASE_URL/SUPABASE_KEY nas variáveis do Netlify.\n` +
      `Configure as variáveis do site de teste apontando para o BANCO DE TESTE antes de publicar.\n` +
      `(Isso impede que o site de teste grave no banco de produção.)`
    );
  }
  if (envUrl === PROD_URL || envKey === PROD_KEY) {
    throw new Error(
      `BUILD ABORTADO — a branch de TESTE "${branch}" está apontando para o BANCO DE PRODUÇÃO.\n` +
      `Troque SUPABASE_URL/SUPABASE_KEY para o banco de TESTE.`
    );
  }

  // Troca URL/KEY pelos do banco de teste (só no artefato que vai para dist/).
  html = html.replace(RX_URL, "const SUPABASE_URL = " + JSON.stringify(envUrl) + ";")
             .replace(RX_KEY, "const SUPABASE_KEY = " + JSON.stringify(envKey) + ";");

  // Confirma que a troca REALMENTE aconteceu. Se o padrão de configuração mudar um dia
  // e o replace não casar, o site de teste ficaria com o banco de produção — então abortamos.
  const novaUrl = (html.match(/const SUPABASE_URL = "([^"]*)";/) || [])[1];
  const novaKey = (html.match(/const SUPABASE_KEY = "([^"]*)";/) || [])[1];
  if (novaUrl !== envUrl || novaKey !== envKey) {
    throw new Error(
      `BUILD ABORTADO — não consegui trocar o banco para o de teste (o padrão de configuração mudou?).\n` +
      `Produção protegida: nada foi publicado com os valores errados.`
    );
  }
  console.log(`🧪 Build de TESTE (branch="${branch}") → banco de teste ${novaUrl}. Produção intocada.`);
}

// 3) Monta dist/ (index.html — de produção ou de teste — + arquivos de apoio).
fs.rmSync("dist", { recursive: true, force: true });
fs.mkdirSync("dist");
fs.writeFileSync(path.join("dist", "index.html"), html);
for (const f of fs.readdirSync("site-apoio")) fs.copyFileSync(path.join("site-apoio", f), path.join("dist", f));
const n = fs.readdirSync("dist").length;
console.log(`✅ dist/ pronta com ${n} arquivos (index.html + apoio). Netlify publica esta pasta.`);
