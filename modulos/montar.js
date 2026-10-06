// montar.js — recombina os módulos no index.html final (pronto para o Netlify Drop)
// Uso:  node montar.js
const fs = require("fs");
const path = require("path");
const aqui = __dirname;
const ordem = JSON.parse(fs.readFileSync(path.join(aqui, "ordem.json"), "utf-8"));
let saida = fs.readFileSync(path.join(aqui, "_pagina_inicio.html"), "utf-8");
for (const arq of ordem) {
  saida += fs.readFileSync(path.join(aqui, arq), "utf-8");
}
saida += fs.readFileSync(path.join(aqui, "_pagina_fim.html"), "utf-8");
fs.writeFileSync(path.join(aqui, "..", "index.html"), saida);
console.log("✅ index.html montado: " + saida.length.toLocaleString("pt-BR") + " caracteres");
console.log("   Publique a PASTA inteira (index.html + manifest.json + ícones) no Netlify Drop.");
