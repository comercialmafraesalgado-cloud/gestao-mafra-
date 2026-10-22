// build.js — monta o index.html e prepara a pasta dist/ para o Netlify publicar (deploy automático via GitHub)
// Uso: node build.js   → dist/ com index.html + arquivos de apoio (manifest, sw, ícones, capa, agendar, _redirects)
//
// ─────────────────────────────────────────────────────────────────────────────
// SEGURANÇA DO AMBIENTE DE TESTE (Projeto de Segurança · Fase 3)
// ─────────────────────────────────────────────────────────────────────────────
// Regra de ouro: o site de TESTE nunca pode usar o banco de PRODUÇÃO, e a
// produção nunca pode ser repontada por engano. Para isso o código FALHA FECHADO:
//
//   • "É produção?" é um sinal POSITIVO e explícito, nunca um padrão:
//       - fora do Netlify (build local/manual, ex.: Netlify Drop) → é produção
//         (usa o banco fixo do código e IGNORA variáveis de ambiente);
//       - dentro do Netlify → só a branch "main" é produção.
//   • CONTEXT do Netlify NÃO é usado. No Netlify, CONTEXT="production" é POR-SITE
//     (a "branch de produção" do site de teste é a "teste"), então ele apareceria
//     no site de teste e vazaria o banco de produção. Decidir por CONTEXT é inseguro.
//   • Em qualquer build que NÃO seja produção (ex.: site de teste na branch "teste"),
//     o banco próprio (SUPABASE_URL/SUPABASE_KEY) é OBRIGATÓRIO; se faltar, ou se
//     apontar para o mesmo host/chave da produção, o build ABORTA.
//   • Garantia final: depois de trocar, se sobrar QUALQUER resíduo das credenciais
//     de produção no artefato de teste, o build ABORTA. Nada é publicado errado.
//   • A troca acontece só no arquivo que vai para dist/. O index.html do repositório
//     continua com os valores de produção.
const { execSync } = require("child_process");
const fs = require("fs"), path = require("path");

execSync("node modulos/montar.js", { stdio: "inherit" });

// 1) Lê o index.html recém-montado — traz os valores de PRODUÇÃO fixos no código.
let html = fs.readFileSync("index.html", "utf8");
const RX_URL = /const SUPABASE_URL = "[^"]*";/;
const RX_KEY = /const SUPABASE_KEY = "[^"]*";/;
const PROD_URL = (html.match(/const SUPABASE_URL = "([^"]*)";/) || [])[1] || "";
const PROD_KEY = (html.match(/const SUPABASE_KEY = "([^"]*)";/) || [])[1] || "";

// host do projeto Supabase, normalizado (sem caixa / barra final), para comparar "é o mesmo banco?"
function hostDe(u) { try { return new URL(u).host.toLowerCase().replace(/\.$/, ""); } catch (e) { return ""; } }
const PROD_HOST = hostDe(PROD_URL);

// 2) É produção? Sinal POSITIVO (falha fechado). CONTEXT é ignorado de propósito.
const naNetlify = process.env.NETLIFY === "true";
const branch = (process.env.BRANCH || "").trim();
const ehProducao = naNetlify ? (branch === "main") : true;

if (ehProducao) {
  // PRODUÇÃO (ou build local/manual): usa os valores fixos do código.
  console.log(`🔒 Build de PRODUÇÃO (Netlify=${naNetlify}, branch="${branch || "(local)"}") → banco fixo do código. Variáveis de ambiente ignoradas.`);
} else {
  // BUILD DE TESTE (qualquer coisa que não seja produção): exige banco próprio, diferente da produção.
  const envUrl = (process.env.SUPABASE_URL || "").trim();
  const envKey = (process.env.SUPABASE_KEY || "").trim();

  if (!envUrl || !envKey) {
    throw new Error(
      `BUILD ABORTADO — a branch "${branch || "(vazia)"}" não é produção e NÃO tem SUPABASE_URL/SUPABASE_KEY nas variáveis do Netlify.\n` +
      `Configure as variáveis do site de teste apontando para o BANCO DE TESTE antes de publicar.\n` +
      `(Isso impede que o site de teste grave no banco de produção.)`
    );
  }

  // Não pode ser o MESMO banco da produção — compara por HOST (pega barra final, caixa, path) e pela chave.
  const envHost = hostDe(envUrl);
  if (!envHost) {
    throw new Error(`BUILD ABORTADO — SUPABASE_URL de teste inválida: "${envUrl}".`);
  }
  if (envHost === PROD_HOST || envKey === PROD_KEY || (PROD_HOST && envUrl.toLowerCase().includes(PROD_HOST))) {
    throw new Error(
      `BUILD ABORTADO — a branch de TESTE "${branch}" está apontando para o BANCO DE PRODUÇÃO.\n` +
      `Troque SUPABASE_URL/SUPABASE_KEY para o banco de TESTE.`
    );
  }

  // Tem que existir exatamente UMA atribuição de cada (senão o layout mudou e o replace pode trocar a errada).
  const nURL = (html.match(/const SUPABASE_URL = "[^"]*";/g) || []).length;
  const nKEY = (html.match(/const SUPABASE_KEY = "[^"]*";/g) || []).length;
  if (nURL !== 1 || nKEY !== 1) {
    throw new Error(`BUILD ABORTADO — esperava 1 atribuição de SUPABASE_URL e 1 de SUPABASE_KEY; achei ${nURL}/${nKEY}. Produção protegida.`);
  }

  // Troca URL/KEY pelos do banco de teste. Usa callback no replace para NÃO interpretar "$" no valor.
  html = html.replace(RX_URL, () => "const SUPABASE_URL = " + JSON.stringify(envUrl) + ";")
             .replace(RX_KEY, () => "const SUPABASE_KEY = " + JSON.stringify(envKey) + ";");

  // GARANTIA FINAL: nenhum resíduo das credenciais de produção pode sobrar no artefato de teste.
  if (html.includes(PROD_URL) || html.includes(PROD_KEY)) {
    throw new Error(`BUILD ABORTADO — sobrou credencial de PRODUÇÃO no artefato de teste. Nada foi publicado.`);
  }
  // E a troca realmente colocou o banco de teste.
  const novaUrl = (html.match(/const SUPABASE_URL = "([^"]*)";/) || [])[1];
  const novaKey = (html.match(/const SUPABASE_KEY = "([^"]*)";/) || [])[1];
  if (novaUrl !== envUrl || novaKey !== envKey) {
    throw new Error(`BUILD ABORTADO — a troca para o banco de teste não confirmou. Produção protegida.`);
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
