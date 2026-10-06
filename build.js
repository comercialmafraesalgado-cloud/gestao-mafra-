// build.js — monta o index.html e prepara a pasta dist/ para o Netlify publicar (deploy automático via GitHub)
// Uso: node build.js   → dist/ com index.html + arquivos de apoio (manifest, sw, ícones, capa, agendar, _redirects)
const { execSync } = require("child_process");
const fs = require("fs"), path = require("path");
execSync("node modulos/montar.js", { stdio: "inherit" });
fs.rmSync("dist", { recursive: true, force: true }); fs.mkdirSync("dist");
fs.copyFileSync("index.html", path.join("dist", "index.html"));
for (const f of fs.readdirSync("site-apoio")) fs.copyFileSync(path.join("site-apoio", f), path.join("dist", f));
const n = fs.readdirSync("dist").length;
console.log(`✅ dist/ pronta com ${n} arquivos (index.html + apoio). Netlify publica esta pasta.`);
