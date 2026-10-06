const fs = require("fs");
const { JSDOM } = require("jsdom");

const html = fs.readFileSync("index.html", "utf-8");

const erros = [];
const vc = new (require("jsdom").VirtualConsole)();
vc.on("jsdomError", e => {
  const m = (e && e.message) || "";
  // recursos externos (CDN do Supabase, Google Fonts) são bloqueados pela sandbox — não é erro do app
  if (/Could not load (script|link)/.test(m)) { console.log("(aviso ambiente) " + m); return; }
  erros.push("jsdomError: " + m);
});
vc.on("error", (...a) => erros.push("console.error: " + a.join(" ")));

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "https://gestaomafra.netlify.app/",
  pretendToBeVisual: true,
  virtualConsole: vc,
});

setTimeout(() => {
  const w = dom.window;

  // funções críticas (existentes + novas desta entrega)
  const fns = [
    // infra de armazenamento
    "storeGet","storeSet","lsGet","lsSet","_storeCacheClear","_storeCacheSet",
    // relatórios — base
    "loadRelatorios","saveRelatorios","loadFichaCond","saveFichaCond",
    "novoRelatorioGestor","novoRelatorioEscolherCond","abrirEditorRelatorio","renderEditorRelatorio",
    "coletarRelEdit","salvarRelatorio","fecharEditorRelatorio","visualizarRelatorioPDF",
    "renderRelatorios","enviarRelatorioJulia","publicarRelatorio","arquivarRelatorio",
    "statusRelLabel","statusRelCls","mesRefLabel","mesAnteriorRef","mesRefAtual",
    "abrirConsolidado","gerarConsolidado","checarEspacoBianca","comprimirImagem",
    // relatórios — novidades (fluxo de aprovação)
    "aprovarRelatorio","reprovarRelatorio","verHistoricoRelatorio","_grupoStatusRel","_nomeUsuarioRel",
    // fotos: reordenação / ordenação / reuniões
    "renderFotosEditor","addFotosRel","removerFotoRel","moverFotoRel","ordenarFotosRel",
    "relFotoDragStart","relFotoDragOver","relFotoDrop","relFotoDragEnd","_relSecArr","_relSecBox","_relRedraw","_relSyncSelect",
    // capas
    "loadCapas","saveCapas","loadCapaDe","migrarCapasLegado","capasResolvidas","verificarImagem",
    "storeDel","_relFid","_fotoEmbutida","_relTemFotoEmbutida","_relColetarFotos","_relGravarFotosDe","_relStripFotos","carregarFotosRel","salvarIndiceRelatorios","_relMigrarFundo","mostrarCarregandoRel","esconderCarregandoRel","_relCarregarFresh","executarAutoteste","agendarAutoteste","restaurarSnapshotRel","renderSaudeSistema","executarAutotesteUI","_autoHoje","abrirLinkAgendamento","copiarLinkAgendamento","compartilharLinkAgendamento","calToolbar",
    "abrirGerenciarCapas","previewCapa","subirCapa","novoCondominioNasCapas",
    // painel + notificações + métricas
    "renderDashboardRelatorios","abrirListaStatus","abrirRelatorioDaNotif",
    "coletarMetricas","_metStatusRel","_metMesRef","renderMetricas",
    // outras abas (amostra para garantir que nada quebrou globalmente)
    "render","setTab","closeModal","pushAviso","loadCheckins","loadComManual",
    "gerarConsolidado","userCobreCond","gestorCobre","sindicoDoCondominio",
  ];
  // _jsq e esc são const (escopo global da página, não do window) — verifica via eval
  try{ if(w.eval("typeof _jsq")!=="function" || w.eval("_jsq(\"a'b\")")!=="a\\'b") erros.push("_jsq ausente ou incorreto"); else console.log("✓ _jsq (escape de aspas) ok"); }catch(e){ erros.push("_jsq: "+e.message); }
  const faltando = fns.filter(f => typeof w[f] !== "function");
  if (faltando.length) erros.push("Funções ausentes: " + faltando.join(", "));

  // contagem total de funções globais (barra de qualidade: >= 565)
  let total = 0;
  for (const k of Object.getOwnPropertyNames(w)) {
    try { if (typeof w[k] === "function" && !/^(HTML|SVG|CSS|DOM|XML|Audio|Image$|Event|Node|Text|File|Blob|URL|Form|Range|Touch|UI|Mutation|Performance|Intersection|Resize|Custom|Error|Promise|Proxy|Reflect|Symbol|Map|Set|WeakMap|WeakSet|Array|Object|Function|Boolean|Number|String|RegExp|Date|JSON|Math|Intl|Worker|Notification|Option|Comment|Document|Window|Screen|History|Location|Navigator|Storage|Crypto|Headers|Request|Response|AbortCont|MessageChannel|MessagePort|BroadcastChannel|TextEncoder|TextDecoder|ReadableStream|WritableStream|TransformStream|StructuredClone|queueMicrotask|structuredClone)/.test(k)) total++; } catch(e){}
  }
  console.log("Funções globais (estimativa, excluindo nativas):", total);

  // testes de comportamento puro
  const t = (nome, cond) => { if (!cond) erros.push("Teste falhou: " + nome); else console.log("✓", nome); };

  t("statusRelLabel(rascunho)", w.statusRelLabel("rascunho") === "Rascunho");
  t("statusRelLabel(em_aprovacao)", w.statusRelLabel("em_aprovacao") === "Em aprovação");
  t("statusRelLabel(enviado_julia legado)", w.statusRelLabel("enviado_julia") === "Em aprovação");
  t("statusRelLabel(aprovado)", /Aprovado/.test(w.statusRelLabel("aprovado")));
  t("statusRelLabel(reprovado)", /Ajustes/.test(w.statusRelLabel("reprovado")));
  t("statusRelLabel(publicado)", /Enviado/.test(w.statusRelLabel("publicado")));
  t("statusRelCls(reprovado)=tt-no", w.statusRelCls("reprovado") === "tt-no");
  t("grupo publicado", w._grupoStatusRel("publicado") === "publicado");
  t("grupo em_aprovacao=analise", w._grupoStatusRel("em_aprovacao") === "analise");
  t("grupo enviado_julia=analise", w._grupoStatusRel("enviado_julia") === "analise");
  t("grupo aprovado=analise", w._grupoStatusRel("aprovado") === "analise");
  t("grupo reprovado=rascunho", w._grupoStatusRel("reprovado") === "rascunho");
  t("grupo rascunho=rascunho", w._grupoStatusRel("rascunho") === "rascunho");
  t("_metStatusRel(aprovado)", w._metStatusRel("aprovado") === "Aprovado");
  t("_metStatusRel(reprovado)", w._metStatusRel("reprovado") === "Em ajustes");

  // ordenação de fotos — exercita o caminho real: abre o editor (cria relEditState)
  (async () => {
    try {
      await w.abrirEditorRelatorio("Teste", "2026-05"); // sem id => cria rascunho novo e renderiza o editor
    } catch (e) { erros.push("abrirEditorRelatorio lançou: " + e.message); }

    const htmlEditor = (w.document.getElementById("modalMount") || {}).innerHTML || "";
    t("editor tem seção Registros", /Registros \(fotos das manutenções\)/.test(htmlEditor));
    t("editor tem seção Reuniões", /Reuniões \(alinhamentos do mês\)/.test(htmlEditor));
    t("editor tem seletor de ordenação", /ordenarFotosRel\('registros'/.test(htmlEditor) && /ordenarFotosRel\('reunioes'/.test(htmlEditor));
    t("editor tem botão de adicionar reunião", /addFotosRel\(this\.files,'reunioes'\)/.test(htmlEditor));

    const arr = w._relSecArr("registros");
    t("_relSecArr devolve array", Array.isArray(arr));
    arr.push(
      { foto:"a", nomeArquivo:"c.jpg", ts:30, dataAtividade:"2026-05-03", orient:"h" },
      { foto:"b", nomeArquivo:"a.jpg", ts:10, dataAtividade:"",            orient:"h" },
      { foto:"c", nomeArquivo:"b.jpg", ts:20, dataAtividade:"2026-05-01", orient:"v" }
    );
    w.ordenarFotosRel("registros","nome");
    t("ordenar por nome", w._relSecArr("registros").map(x=>x.nomeArquivo).join(",")==="a.jpg,b.jpg,c.jpg");
    w.ordenarFotosRel("registros","envio");
    t("ordenar por envio", w._relSecArr("registros").map(x=>x.ts).join(",")==="10,20,30");
    w.ordenarFotosRel("registros","atividade");
    t("ordenar por atividade (sem data no fim)", w._relSecArr("registros").map(x=>x.dataAtividade).join("|")==="2026-05-01|2026-05-03|");
    w.moverFotoRel("registros",2,-1);
    t("mover ▲ trocou posições", w._relSecArr("registros")[1].dataAtividade==="");
    const rColetado = (()=>{ try { return w.coletarRelEdit(); } catch(e){ erros.push("coletarRelEdit lançou: "+e.message); return null; } })();
    t("preferência de ordenação preservada no objeto salvo", !!(rColetado && rColetado.ordenacao && rColetado.ordenacao.registros==="personalizada"));
    t("seção reuniões preservada no objeto salvo", !!(rColetado && Array.isArray(rColetado.reunioes)));
    w.removerFotoRel(0); // formato antigo (1 argumento)
    t("removerFotoRel legado (1 arg)", w._relSecArr("registros").length===2);
    w.removerFotoRel("registros",0);
    t("removerFotoRel novo (2 args)", w._relSecArr("registros").length===1);

    // nova seção de capas na aba Gerenciar
    const fns2=["carregarCapasGerenciar","subirCapaGerenciar","_capgerDesenharCard","_capgerOrigem","_capgerPodeVer","_capgerId"];
    const falt2=fns2.filter(f=>typeof w[f]!=="function");
    if(falt2.length) erros.push("Funções da seção de capas ausentes: "+falt2.join(", "));
    else console.log("✓ funções da seção de capas presentes");
    t("_capgerId normaliza nome", w._capgerId("Trio Mall & Office")==="trio_mall_office");

    if (erros.length) {
      console.error("\n❌ FALHAS:\n" + erros.map(e=>" - "+e).join("\n"));
      process.exit(1);
    }
    console.log("\n✅ Validação jsdom: tudo passou.");
    process.exit(0);
  })();
}, 2500);
