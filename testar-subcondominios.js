// testar-subcondominios.js — build 123 (Fase 0): Le Monde e Trio como grupos
// Uso: node testar-subcondominios.js   (na pasta com index.html; precisa de `npm install jsdom`)
const fs = require("fs");
const { JSDOM, VirtualConsole } = require("jsdom");

const html = fs.readFileSync("index.html", "utf-8");
const erros = [];
const vc = new VirtualConsole();
vc.on("jsdomError", e => { const m=(e&&e.message)||""; if(!/Could not load (script|link)|Not implemented: Window's scrollTo/.test(m)) erros.push("jsdomError: "+m); });

const dom = new JSDOM(html, { runScripts:"dangerously", resources:"usable", url:"https://gestaomafra.netlify.app/", pretendToBeVisual:true, virtualConsole:vc });

setTimeout(() => { (async () => {
  const w = dom.window;
  const t = (nome, cond) => { if(!cond) erros.push("FALHOU: "+nome); else console.log("✓", nome); };
  w.alert = () => {}; w.confirm = () => true; w.prompt = () => "";
  w.scrollTo = () => {};
  const setUser = uid => { w.eval(`state.userId=${JSON.stringify(uid)}; state.user=USUARIOS[${JSON.stringify(uid)}];`); };
  const vista = () => w.document.getElementById("view").innerHTML;

  t("APP_VERSAO é build 143", /build 143/.test(w.eval("APP_VERSAO")));

  /* ===== 1) Helpers de nome ===== */
  t("condominioPaiDe('Le Monde Parc') → Le Monde", w.condominioPaiDe("Le Monde Parc")==="Le Monde");
  t("condominioPaiDe('Le Monde \u203A Parc') → Le Monde (formato do Manual)", w.condominioPaiDe("Le Monde \u203A Parc")==="Le Monde");
  t("condominioPaiDe('Trio') → Trio (o próprio pai)", w.condominioPaiDe("Trio")==="Trio");
  t("condominioPaiDe('San Diego') → null", w.condominioPaiDe("San Diego")===null);
  t("subRotulo('Le Monde Parc') → Parc", w.subRotulo("Le Monde Parc")==="Parc");
  t("subRotulo('Trio \u203A Office') → Office", w.subRotulo("Trio \u203A Office")==="Office");
  t("subRotulo('San Diego') → San Diego", w.subRotulo("San Diego")==="San Diego");
  t("subsCompletos('Trio') tem 3 nomes completos", JSON.stringify(w.subsCompletos("Trio"))===JSON.stringify(["Trio Office","Trio Mall","Trio Home"]));

  /* ===== 2) condVisivel — acesso como um só, em qualquer formato ===== */
  const visGestor = ["Le Monde Marche","Le Monde Avenue","Le Monde Parc"];
  t("gestor c/ os 3 subs vê o pai 'Le Monde'", w.condVisivel(visGestor,"Le Monde")===true);
  t("gestor vê 'Le Monde Parc' (formato espaço)", w.condVisivel(visGestor,"Le Monde Parc")===true);
  t("gestor vê 'Le Monde \u203A Parc' (formato do Manual) — era o bug", w.condVisivel(visGestor,"Le Monde \u203A Parc")===true);
  t("gestor NÃO vê 'Trio'", w.condVisivel(visGestor,"Trio")===false);
  t("gestor NÃO vê 'San Diego'", w.condVisivel(visGestor,"San Diego")===false);
  t("acesso pelo nome do pai libera os subs", w.condVisivel(["Le Monde"],"Le Monde Avenue")===true);
  t("vis=null (master) vê tudo", w.condVisivel(null,"Qualquer")===true);

  /* ===== 3) Select agrupado ===== */
  const opts = w.condOptionsAgrupadas("Trio Mall");
  t("select tem optgroup Le Monde", opts.indexOf('<optgroup label="Le Monde">')>-1);
  t("select tem optgroup Trio", opts.indexOf('<optgroup label="Trio">')>-1);
  t("valor continua o nome completo ('Le Monde Parc')", opts.indexOf('value="Le Monde Parc"')>-1);
  t("rótulo curto dentro do grupo (>Parc<)", opts.indexOf('>Parc</option>')>-1);
  t("selecionado é respeitado (Trio Mall)", /value="Trio Mall" selected/.test(opts));
  t("sub aparece uma única vez (sem duplicar fora do grupo)", (opts.match(/value="Le Monde Marche"/g)||[]).length===1);
  t("condomínio comum segue solto (San Diego)", opts.indexOf('value="San Diego"')>-1);
  const optsLista = w.condOptionsAgrupadas(undefined, ["Trio Mall","San Diego"]);
  t("lista parcial: só o sub informado aparece no grupo", optsLista.indexOf('value="Trio Mall"')>-1 && optsLista.indexOf('value="Trio Home"')===-1);

  /* ===== 4) Gerenciar — criar login do comercial com grupo completo ===== */
  setUser("bianca"); w.eval(`state.tab="gerenciar";`);
  w.openUsuario();
  const modal = w.document.getElementById("modalMount").innerHTML;
  t("modal tem campo próprio 'Acesso a grupo completo' com Le Monde", modal.indexOf('id="uGrupo"')>-1 && /value="Le Monde"[^>]*>⭐ Le Monde/.test(modal));
  t("campo de grupo oferece Trio", /value="Trio"[^>]*>⭐ Trio/.test(modal));
  t("modal de usuário usa optgroup nos condomínios", modal.indexOf('<optgroup label="Trio">')>-1);
  w.document.getElementById("uNome").value="Comercial Le Monde";
  w.document.getElementById("uLogin").value="comleteste";
  w.document.getElementById("uTipo").value="gestor";
  w.document.getElementById("uGrupo").value="Le Monde";
  w.toggleGrupoGestor("Le Monde");
  t("escolher grupo esconde o select de condomínio", w.document.getElementById("condGestorWrap").style.display==="none");
  w.document.getElementById("uSenha").value="teste123";
  try{ await w.salvarUsuario(""); }catch(e){ /* render pós-salvar pode depender de rede; o cadastro já ocorreu */ }
  const nu = JSON.parse(w.eval(`JSON.stringify(USUARIOS.comleteste||null)`));
  t("novo login criado", !!nu);
  t("novo login: condominio = 'Le Monde'", nu && nu.condominio==="Le Monde");
  t("novo login: acesso aos 3 subcondomínios", nu && Array.isArray(nu.condominios) && nu.condominios.length===3 && nu.condominios.indexOf("Le Monde Parc")>-1);

  /* ===== 4b) Editar o gestor base NÃO perde mais o grupo ===== */
  w.openUsuario("lemonde");
  const modal2 = w.document.getElementById("modalMount").innerHTML;
  t("editar 'lemonde' mostra o grupo selecionado no campo próprio", /value="Le Monde" selected/.test(modal2));
  try{ await w.salvarUsuario("lemonde"); }catch(e){}
  const lm = JSON.parse(w.eval(`JSON.stringify(USUARIOS.lemonde)`));
  t("salvar 'lemonde' preserva os 3 subcondomínios (bug antigo corrigido)", Array.isArray(lm.condominios) && lm.condominios.length===3);

  /* ===== 5) Procedimentos — um só card + tela de subs ===== */
  setUser("marcia"); w.eval(`state.tab="procedimentos";`);
  w._procState.cond=null; w._procState.pending=null; w._procState.pai=null;
  await w._procRenderGrid();
  let v = vista();
  t("grid: Le Monde é UM card de grupo", v.indexOf("Grupo \u00b7 3 subcondom\u00ednios")>-1);
  t("grid: sem card solto 'Le Monde Marche'", v.indexOf("Le Monde Marche")===-1);
  t("grid: condomínio comum continua (San Diego)", v.indexOf("San Diego")>-1);
  w._procAbrirGrupo("Le Monde"); await new Promise(r=>setTimeout(r,300));
  v = vista();
  t("tela do grupo: mostra os 3 subs (Parc/Marche/Avenue)", v.indexOf(">Parc<")>-1 && v.indexOf(">Marche<")>-1 && v.indexOf(">Avenue<")>-1);
  t("tela do grupo: tem botão Voltar", v.indexOf("_procVoltarGrupo()")>-1);
  t("tela do grupo: card abre o nome completo", v.indexOf("abrirProcedimento('Le Monde Parc')")>-1);
  w._procVoltarGrupo(); await new Promise(r=>setTimeout(r,300));
  t("Voltar devolve à grade", vista().indexOf("Manual de Procedimentos")>-1 && w._procState.pai===null);

  // gestor do Trio só vê o grupo dele
  setUser("trio"); w._procState.pai=null;
  await w._procRenderGrid(); v = vista();
  t("gestor Trio: vê o card Trio", v.indexOf("Trio")>-1);
  t("gestor Trio: NÃO vê Le Monde", v.indexOf("Le Monde")===-1);
  t("gestor Trio: NÃO vê San Diego", v.indexOf("San Diego")===-1);

  /* ===== 5b) Relatório: gestor de grupo escolhe o sub ===== */
  setUser("trio"); w.novoRelatorioGestor();
  let mrel = w.document.getElementById("modalMount").innerHTML;
  t("gestor Trio: novo relatório oferece os 3 subs", mrel.indexOf('id="novoRelCondG"')>-1 && mrel.indexOf('value="Trio Mall"')>-1 && mrel.indexOf('value="Trio Home"')>-1);
  t("gestor Trio: NÃO oferece Le Monde", mrel.indexOf("Le Monde")===-1);
  w.eval(`USUARIOS.gsd={senha:"x",nome:"G",tipo:"gestor",condominio:"San Diego"};`); setUser("gsd"); w.novoRelatorioGestor();
  mrel = w.document.getElementById("modalMount").innerHTML;
  t("gestor de um condomínio só continua com o campo fixo", mrel.indexOf('id="novoRelCondG"')===-1 && mrel.indexOf("San Diego")>-1);
  w.closeModal();

  /* ===== 6) Checklist — um só card + tela de subs ===== */
  setUser("marcia"); w.eval(`state.tab="checklist";`);
  w._clState.cond=null; w._clState.pai=null;
  await w.renderChecklists(); v = vista();
  t("checklist grid: Trio é UM card de grupo", v.indexOf("Grupo \u00b7 3 subcondom\u00ednios")>-1);
  t("checklist grid: sem card solto 'Trio Mall'", v.indexOf("Trio Mall")===-1);
  w._clAbrirGrupo("Trio"); await new Promise(r=>setTimeout(r,300));
  v = vista();
  t("checklist grupo: mostra Office/Mall/Home", v.indexOf(">Office<")>-1 && v.indexOf(">Mall<")>-1 && v.indexOf(">Home<")>-1);
  t("checklist grupo: card abre o nome completo", v.indexOf("abrirChecklists('Trio Mall')")>-1);
  w._clVoltarGrupo(); await new Promise(r=>setTimeout(r,300));
  t("checklist Voltar devolve à grade", vista().indexOf("Check List")>-1 && w._clState.pai===null);

  /* ===== 7) Manual — gestor enxerga o grupo (formato ›) ===== */
  setUser("lemonde"); w.eval(`window.manPaiAtual=null;`);
  await w.renderManual(); v = vista();
  t("manual: gestor Le Monde vê o card Le Monde (era o bug de formato)", v.indexOf("Le Monde")>-1);
  t("manual: gestor Le Monde NÃO vê Trio", v.indexOf(">Trio<")===-1 && v.indexOf("Trio Mall")===-1);

  /* ===== 8) Selects agrupados espalhados no app ===== */
  const src = html;
  t("aba Relatórios usa select agrupado (4x)", (src.match(/condOptionsAgrupadas\(/g)||[]).length>=15);
  t("nenhum select solto CONDOMINIOS.map(c=>`<option restou", !/CONDOMINIOS\.map\(c=>`<option/.test(src));

  if(erros.length){ console.log("\n❌ FALHAS:\n"+erros.join("\n")); process.exit(1); }
  console.log("\n✅ Subcondomínios (build 128): tudo passou.");
  process.exit(0);
})().catch(e=>{ console.log("❌ exceção: "+(e&&e.stack||e)); process.exit(1); }); }, 1500);
