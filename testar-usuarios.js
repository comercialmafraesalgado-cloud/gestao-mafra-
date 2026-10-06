const fs = require("fs");
const { JSDOM, VirtualConsole } = require("jsdom");

const html = fs.readFileSync("index.html", "utf-8");
const erros = [];
const vc = new VirtualConsole();
vc.on("jsdomError", e => { const m=(e&&e.message)||""; if(!/Could not load (script|link)/.test(m)) erros.push("jsdomError: "+m); });

const dom = new JSDOM(html, { runScripts:"dangerously", resources:"usable", url:"https://gestaomafra.netlify.app/", pretendToBeVisual:true, virtualConsole:vc });

setTimeout(() => { (async () => {
  const w = dom.window;
  const t = (nome, cond) => { if(!cond) erros.push("FALHOU: "+nome); else console.log("✓", nome); };

  // ---- stubs de navegador ----
  let alerts=[], confirmRet=true, promptRet="ajustar fotos";
  w.alert = m => alerts.push(String(m));
  w.confirm = () => confirmRet;
  w.prompt = () => promptRet;
  const novaJanela = () => { const win={ closed:false, document:{ _buf:"", open(){ this._buf=""; }, write(s){ this._buf+=s; }, close(){} } }; return win; };
  let ultimaJanela=null;
  w.window.open = () => (ultimaJanela=novaJanela());

  // ---- usuário gestor de teste + grupos (state/USUARIOS são let/const do escopo global → via eval) ----
  try{ w.eval(`USUARIOS.gtest={senha:"x",nome:"Gestor Teste",tipo:"gestor",cargo:"Gestor",condominio:"Trio Mall",cor:"#333"}; gruposDinamicos();`); }
  catch(e){ erros.push("injeção do gestor lançou: "+e.message); }

  // ---- dados semente: um relatório em cada status ----
  const foto = { foto:"data:image/jpeg;base64,AAAA", descricao:"Teste", w:100, h:80, orient:"h", ts:1000, nomeArquivo:"a.jpg", dataAtividade:"2026-05-02" };
  const mk = (id, cond, status, extra) => Object.assign({ id, condominio:cond, mesRef:"2026-05", status,
    info:{ocupReforma:0,ocupVazia:1,ocupOcupada:2,inauguracao:"",areaConstruida:"",areaTerreno:"",torres:"1",unidades:"3",vagas:"4"},
    corretivas:{eletrica:1,hidraulica:0,civil:0}, preventivas:{previstas:1,realizadas:1,emAberto:0},
    listaCorretiva:["x"], listaPreventiva:["y"], registros:[Object.assign({},foto)], reunioes:[Object.assign({},foto,{descricao:"Reunião"})],
    criadoPor:"gtest", criadoEm:900, historico:[{acao:"criado",por:"gtest",ts:900}] }, extra||{});
  const seed = { list:[
    mk("R1","Trio Mall","rascunho"),
    mk("R2","Trio Mall","em_aprovacao",{enviadoEm:1100,enviadoPor:"gtest"}),
    mk("R3","Trio Mall","enviado_julia",{enviadoEm:1100}),                  // status legado
    mk("R4","Trio Mall","aprovado",{aprovadoEm:1200,aprovadoPor:"julia"}),
    mk("R5","Trio Mall","reprovado",{reprovadoEm:1300,reprovadoPor:"julia",motivoReprovacao:"Falta foto"}),
    mk("R6","Trio Mall","publicado",{publicadoEm:1400,publicadoPor:"julia"}),
    mk("R7","San Diego","publicado",{publicadoEm:1400,publicadoPor:"julia"}), // p/ arquivar
    mk("R8","San Diego","em_aprovacao",{enviadoEm:1100,enviadoPor:"walace"}),
  ]};
  const gravarSeed = () => { w.localStorage.setItem("mafra:relatorios", JSON.stringify(seed)); w._storeCacheClear(); };
  gravarSeed();

  const setUser = uid => { w.eval(`state.userId=${JSON.stringify(uid)}; state.user=USUARIOS[${JSON.stringify(uid)}]; state.tab="relatorios";`); };
  const lerDados = () => JSON.parse(w.localStorage.getItem("mafra:relatorios"));
  const acharFn = /onclick="\s*([A-Za-z_$][\w$]*)\s*\(/g;

  // =====  1) Para CADA perfil: renderiza a aba e confere se TODO botão chama função existente  =====
  const perfis = [ ["gtest","gestor"], ["julia","BPO/aprovadora"], ["bianca","master"], ["marcia","master"], ["walace","síndico"], ["camilla","BPO"] ];
  const botoesPorPerfil = {};
  for (const [uid, rotulo] of perfis){
    setUser(uid); w._storeCacheClear();
    try{ await w.renderRelatorios(); }catch(e){ erros.push(`renderRelatorios lançou p/ ${uid}: `+e.message); continue; }
    const htmlView = w.document.getElementById("view").innerHTML;
    const fns = new Set(); let m2;
    while((m2=acharFn.exec(htmlView))) fns.add(m2[1]);
    const indef = [...fns].filter(f => typeof w[f] !== "function");
    t(`(${rotulo}) todos os ${fns.size} handlers de botão existem`, indef.length===0);
    if(indef.length) erros.push(`  → indefinidos p/ ${uid}: `+indef.join(", "));
    botoesPorPerfil[uid]=htmlView;
  }

  // =====  2) Botões certos por status/perfil  =====
  const hG=botoesPorPerfil["gtest"]||"", hJ=botoesPorPerfil["julia"]||"", hM=botoesPorPerfil["bianca"]||"", hS=botoesPorPerfil["walace"]||"";
  t("gestor vê 'Enviar para aprovação' no rascunho", /enviarRelatorioJulia\('R1'\)/.test(hG));
  t("gestor vê 'Enviar para aprovação' no reprovado", /enviarRelatorioJulia\('R5'\)/.test(hG));
  t("gestor vê motivo dos ajustes no card", /Falta foto/.test(hG));
  t("gestor NÃO vê Aprovar", !/aprovarRelatorio\(/.test(hG));
  t("gestor NÃO vê relatório de outro condomínio", !/R7/.test(hG) && !/San Diego/.test(hG));
  t("botão Histórico removido do card", !/verHistoricoRelatorio\(/.test(hG));
  t("gestor NÃO vê Arquivar", !/arquivarRelatorio\(/.test(hG));
  t("julia vê Aprovar no em_aprovacao", /aprovarRelatorio\('R2'\)/.test(hJ));
  t("julia vê Aprovar também no status legado", /aprovarRelatorio\('R3'\)/.test(hJ));
  t("julia vê Pedir ajustes", /reprovarRelatorio\('R2'\)/.test(hJ));
  t("julia vê Publicar no aprovado", /publicarRelatorio\('R4'\)/.test(hJ));
  t("julia vê Arquivar no publicado", /arquivarRelatorio\('R6'\)/.test(hJ));
  t("julia NÃO vê 'Enviar para aprovação'", !/enviarRelatorioJulia\(/.test(hJ));
  t("master vê Aprovar e Pedir ajustes", /aprovarRelatorio\('R2'\)/.test(hM) && /reprovarRelatorio\('R2'\)/.test(hM));
  t("master vê botão Capas", /abrirGerenciarCapas\(\)/.test(hM));
  t("síndico vê Enviar p/ aprovação", /enviarRelatorioJulia\('R1'\)/.test(hS));
  t("master vê Excluir em qualquer relatório", /excluirRelatorio\(/.test(hM));
  t("gestor vê Excluir no próprio rascunho", /excluirRelatorio\('R1'\)/.test(hG));
  t("síndico NÃO vê Excluir (não é o criador)", !/excluirRelatorio\(/.test(hS));
  t("síndico NÃO vê Aprovar nem Capas", !/aprovarRelatorio\(/.test(hS) && !/abrirGerenciarCapas/.test(hS));

  // =====  3) Ciclo completo clicando de verdade  =====
  // gestor envia rascunho
  setUser("gtest"); alerts=[];
  await w.enviarRelatorioJulia("R1");
  let dd=lerDados(); let r1=dd.list.find(x=>x.id==="R1");
  t("enviar: status virou em_aprovacao", r1.status==="em_aprovacao");
  t("enviar: histórico registrado", (r1.historico||[]).some(e=>e.acao==="enviado_aprovacao"&&e.por==="gtest"));
  t("enviar: Julia notificada", /Relatório para aprovar/.test(w.localStorage.getItem("mafra:avisos:julia")||""));
  t("enviar: usuário avisado do sucesso", alerts.some(a=>/enviado para aprovação/i.test(a)));

  // julia aprova R2 e publica R4; devolve R8
  setUser("julia"); alerts=[]; confirmRet=true;
  await w.aprovarRelatorio("R2");
  dd=lerDados(); t("aprovar: status aprovado + carimbo", dd.list.find(x=>x.id==="R2").status==="aprovado" && dd.list.find(x=>x.id==="R2").aprovadoPor==="julia");
  await w.publicarRelatorio("R4");
  dd=lerDados(); t("publicar: status publicado + histórico", dd.list.find(x=>x.id==="R4").status==="publicado" && (dd.list.find(x=>x.id==="R4").historico||[]).some(e=>e.acao==="publicado"));
  await w.reprovarRelatorio("R8");
  dd=lerDados(); const r8=dd.list.find(x=>x.id==="R8");
  t("pedir ajustes: status + motivo gravados", r8.status==="reprovado" && r8.motivoReprovacao==="ajustar fotos");
  t("pedir ajustes: quem enviou foi notificado", /Ajustes necessários/.test(w.localStorage.getItem("mafra:avisos:walace")||""));

  // histórico abre com a linha do tempo
  alerts=[]; await w.verHistoricoRelatorio("R8");
  const modal=w.document.getElementById("modalMount").innerHTML;
  t("histórico: modal com eventos e motivo", /Histórico/.test(modal) && /Devolvido para ajustes/.test(modal) && /ajustar fotos/.test(modal));
  w.closeModal&&w.closeModal();

  // PDF: janela abre, conteúdo final tem Registros + Reuniões
  await w.visualizarRelatorioPDF("R6");
  t("PDF: janela recebeu o relatório completo", !!ultimaJanela && /Registros/.test(ultimaJanela.document._buf) && /Reuniões/.test(ultimaJanela.document._buf) && /Manutenções/.test(ultimaJanela.document._buf));
  await w.visualizarRelatorioPDF("NAO_EXISTE");
  t("PDF: id inexistente mostra aviso na própria janela", /não encontrado/i.test(ultimaJanela.document._buf));

  // bianca arquiva R7 (PDF stub + 2 confirmações)
  setUser("bianca"); alerts=[]; confirmRet=true;
  await w.arquivarRelatorio("R7");
  dd=lerDados(); const r7=dd.list.find(x=>x.id==="R7");
  t("arquivar: fotos removidas das duas seções", r7.arquivado===true && r7.registros.every(x=>!x.foto) && r7.reunioes.every(x=>!x.foto));

  // editor abre p/ gestor (novo e existente) com as duas seções
  setUser("gtest");
  await w.abrirEditorRelatorio("Trio Mall","2026-05","R5");
  const ed=w.document.getElementById("modalMount").innerHTML;
  t("editor: abre relatório existente com Registros e Reuniões", /Registros \(fotos/.test(ed) && /Reuniões \(alinhamentos/.test(ed));
  try{ w.eval("relEditState=null;"); }catch(e){} w.closeModal&&w.closeModal();

  // segurança: gestor não consegue subir capa pela função
  alerts=[];
  await w.subirCapaGerenciar("Trio Mall","capa",{files:[{}],value:""});
  t("capas: gestor é barrado com aviso", alerts.some(a=>/Apenas a liderança/.test(a)));

  // painel início: lista de status agrupa em_aprovacao/aprovado
  setUser("marcia"); w._storeCacheClear();
  // os relatórios-semente são de "2026-05"; fixamos o mês do painel nesse mesmo
  // valor para o teste não depender do relógio — mesAnteriorRef() vira de mês e,
  // rodando fora de junho/2026, o painel deixaria de casar com a amostra.
  try{ w.eval('state.dashRelMes="2026-05";'); }catch(e){}
  await w.abrirListaStatus("enviado_julia");
  const lm=w.document.getElementById("modalMount").innerHTML;
  t("painel 'Em análise' agrupa em_aprovacao + aprovado", /Em aprovação/.test(lm) && /Aprovado/.test(lm));


  // =====  4) Novo formato: fotos separadas do índice (migração automática)  =====
  dd=lerDados();
  t("migração: índice ficou sem base64 de fotos", !JSON.stringify(dd).includes("base64,AAAA"));
  t("migração: todos os relatórios marcados como separados", dd.list.every(r=>r.fotosSeparadas===true || r.arquivado));
  t("migração: fid atribuído às fotos antigas", dd.list.every(r=>(r.registros||[]).every(x=>x.arquivada||x.fid)));
  const chavesFotos=Object.keys(w.localStorage).filter(k=>k.startsWith("mafra:relfotos:"));
  t("migração: chaves de fotos criadas (1 por relatório)", chavesFotos.length>=7);
  const _fR2 = await w._relLerFotos("R2", false);
  t("migração: fotos realmente estão nas chaves (pedaços)", !!_fR2 && /base64,AAAA/.test(JSON.stringify(_fR2)));
  t("migração: tamanho registrado p/ o medidor de espaço", dd.list.filter(r=>!r.arquivado).every(r=>(r.fotosBytes||0)>0));

  // PDF rehidrata as fotos da chave separada
  await w.visualizarRelatorioPDF("R6");
  t("PDF pós-migração: fotos voltam para o documento", /base64,AAAA/.test(ultimaJanela.document._buf));

  // editor rehidrata e salvar regrava no formato novo
  setUser("gtest");
  await w.abrirEditorRelatorio("Trio Mall","2026-05","R5");
  const fotoNoEditor = w.eval("(relEditState.registros[0]||{}).foto||''");
  t("editor pós-migração: foto rehidratada para edição", /base64,AAAA/.test(fotoNoEditor));
  w.eval("relEditState.registros[0].descricao='Editado no teste';");
  await w.salvarRelatorio(false);
  dd=lerDados(); const r5=dd.list.find(x=>x.id==="R5");
  t("salvar do editor: descrição gravada no índice", r5.registros[0].descricao==="Editado no teste");
  t("salvar do editor: índice continua leve (sem base64)", !JSON.stringify(r5).includes("base64,AAAA"));
  const _fR5 = await w._relLerFotos("R5", false);
  t("salvar do editor: chave de fotos regravada (pedaços)", !!_fR5 && /base64,AAAA/.test(JSON.stringify(_fR5)));

  // arquivar apaga a chave de fotos
  t("arquivar: chave de fotos do R7 foi apagada", !w.localStorage.getItem("mafra:relfotos:R7"));

  // backup enxerga as novas chaves
  const chavesBk = await w.listarChavesBackup();
  t("backup inclui fotos por relatório", chavesBk.some(k=>k==="mafra:relfotos:R2"));
  t("backup inclui capas por condomínio", chavesBk.some(k=>k==="mafra:capa:Trio Mall"));


  // =====  5) Saúde do sistema: autoteste, sentinela e fotografias  =====
  setUser("bianca"); w._storeCacheClear();
  let res=await w.executarAutoteste();
  t("autoteste: roda e termina sem falhas num sistema saudável", res && res.falhas===0);
  t("autoteste: resultado gravado", !!w.localStorage.getItem("mafra:autoteste"));
  t("autoteste: fotografia do dia criada", Object.keys(w.localStorage).some(k=>k.startsWith("mafra:snapshot:relatorios:")));
  t("autoteste: sentinela registrou as contagens", !!w.localStorage.getItem("mafra:sentinela"));

  // simula um PROBLEMA real: some com a chave de fotos de um relatório recente
  w.localStorage.removeItem("mafra:relfotos:R8"); w._storeCacheClear();
  // sem Supabase no teste, a checagem de chaves vira aviso — então simulo a queda da sentinela:
  const sent=JSON.parse(w.localStorage.getItem("mafra:sentinela"));
  const ontem="2000-01-01"; sent[ontem]={relatorios:50, atendimentos:0, gravacoes:0, chamados:0};
  // remove o registro de hoje para a comparação usar o "ontem" plantado
  Object.keys(sent).forEach(k=>{ if(k!==ontem) delete sent[k]; });
  w.localStorage.setItem("mafra:sentinela", JSON.stringify(sent)); w._storeCacheClear();
  const avisosAntes=(w.localStorage.getItem("mafra:avisos:bianca")||"").length;
  res=await w.executarAutoteste();
  t("sentinela: detecta queda brusca (50 → 7 relatórios)", res.falhas>=1 && res.itens.some(i=>i.nome==="Sentinela de dados" && !i.ok));
  const avisosDepois=(w.localStorage.getItem("mafra:avisos:bianca")||"");
  t("sentinela: Bianca recebe aviso no sino", avisosDepois.length>avisosAntes && /Verificação encontrou/.test(avisosDepois));

  // restauração por fotografia: corrompe a lista e volta
  const hojeSnap=Object.keys(w.localStorage).filter(k=>k.startsWith("mafra:snapshot:relatorios:")).sort().pop().split(":").pop();
  const antesN=JSON.parse(w.localStorage.getItem("mafra:relatorios")).list.length;
  w.localStorage.setItem("mafra:relatorios", JSON.stringify({list:[]})); w._storeCacheClear();
  confirmRet=true;
  await w.restaurarSnapshotRel(hojeSnap);
  const depoisN=JSON.parse(w.localStorage.getItem("mafra:relatorios")).list.length;
  t("fotografia: restauração devolve a lista inteira", depoisN===antesN && depoisN>0);

  // gestor não restaura
  setUser("gtest"); alerts=[];
  await w.restaurarSnapshotRel(hojeSnap);
  t("fotografia: gestor é barrado", alerts.some(a=>/Apenas a Bianca/.test(a)));

  // painel renderiza na aba Gerenciar
  setUser("bianca"); w.eval('state.tab="gerenciar";');
  await w.renderGerenciar();
  await new Promise(r=>setTimeout(r,300));
  const ger=w.document.getElementById("view").innerHTML;
  t("Gerenciar: seção Saúde do sistema presente", /Saúde do sistema/.test(ger) && /executarAutotesteUI/.test(ger));
  const saude=(w.document.getElementById("saudeBox")||{}).innerHTML||"";
  t("Gerenciar: painel mostra resultado e fotografias", /verificação|problema/i.test(saude) && /Restaurar/.test(saude));


  // =====  6) Exclusividade da Bianca: seção, aviso e restauração  =====
  // Julia roda o autoteste com problema → SÓ a Bianca recebe o aviso
  const sent2=JSON.parse(w.localStorage.getItem("mafra:sentinela")||"{}");
  const so={"2000-01-02":{relatorios:80, atendimentos:0, gravacoes:0, chamados:0}};
  w.localStorage.setItem("mafra:sentinela", JSON.stringify(so)); w._storeCacheClear();
  setUser("julia");
  const avJuliaAntes=(w.localStorage.getItem("mafra:avisos:julia")||"").length;
  const avBiAntes=(w.localStorage.getItem("mafra:avisos:bianca")||"").length;
  const resJ=await w.executarAutoteste();
  t("Julia roda e o problema é detectado", resJ.falhas>=1);
  t("aviso vai SÓ para a Bianca (Julia não recebe)", (w.localStorage.getItem("mafra:avisos:julia")||"").length===avJuliaAntes);
  t("Bianca recebe o aviso mesmo sem ter rodado", (w.localStorage.getItem("mafra:avisos:bianca")||"").length>avBiAntes);

  // seção Saúde: aparece só para a Bianca
  for(const [uid, deve] of [["bianca",true],["marcia",false],["julia",false],["gtest",false]]){
    setUser(uid); w.eval('state.tab="gerenciar";');
    if(uid==="gtest"){ /* gestor nem abre gerenciar normalmente, mas conferimos a seção */ }
    await w.renderGerenciar();
    const g=w.document.getElementById("view").innerHTML;
    t(`seção Saúde ${deve?"visível":"oculta"} para ${uid}`, /Saúde do sistema/.test(g)===deve);
  }

  // Julia/master não restauram fotografia
  setUser("julia"); alerts=[];
  const diaSnap=Object.keys(w.localStorage).filter(k=>k.startsWith("mafra:snapshot:relatorios:")).sort().pop().split(":").pop();
  await w.restaurarSnapshotRel(diaSnap);
  t("Julia é barrada na restauração", alerts.some(a=>/Apenas a Bianca/.test(a)));


  // =====  7) Calendário: botão e modal do link de agendamento  =====
  setUser("bianca"); w.eval('state.calRef=new Date(); state.calView="semana"; state.calShowFiltro=false;');
  const barra=w.calToolbar("Semana","teste");
  t("calendário: botão 'Link de agendamento' na barra", /abrirLinkAgendamento\(\)/.test(barra) && /Link de agendamento/.test(barra));
  w.abrirLinkAgendamento();
  const mAg=w.document.getElementById("modalMount").innerHTML;
  t("modal do link: mostra o endereço /#agendar (blindado)", /\/#agendar/.test(mAg));
  t("modal do link: tem Copiar e WhatsApp", /copiarLinkAgendamento/.test(mAg) && /wa\.me\/\?text=/.test(mAg) && /pessoas de fora/i.test(mAg));
  await w.copiarLinkAgendamento(); // sem clipboard no jsdom — não pode lançar erro
  t("copiar: não quebra sem clipboard (mostra instrução)", /Copiado|Selecione/.test((w.document.getElementById("btnCopiarLinkAg")||{}).textContent||""));
  w.closeModal&&w.closeModal();
  // botão aparece para todos os perfis (síndico e gestor também enviam o link)
  for(const uid of ["walace","gtest","julia"]){
    setUser(uid);
    t(`calendário: botão visível para ${uid}`, /abrirLinkAgendamento/.test(w.calToolbar("Semana","t")));
  }


  // =====  7) Botão "Link de agendamento" (Calendário → pessoas externas)  =====
  setUser("bianca");
  let copiado=""; 
  w.eval('navigator.clipboard={writeText:t=>{window.__cop=t;return Promise.resolve();}};');
  w.abrirLinkAgendamento();
  const modalAg=w.document.getElementById("modalMount").innerHTML;
  t("link de agendamento: modal abre com o link", /Link de agendamento/.test(modalAg) && /#agendar/.test(modalAg));
  t("link de agendamento: forma blindada (/#agendar), não a dependente de deploy", !/value="[^"]*\/agendar"/.test(modalAg));
  t("link de agendamento: botão do WhatsApp presente", /wa\.me|api\.whatsapp/.test(modalAg));
  await w.copiarLinkAgendamento();
  copiado=w.eval("window.__cop||''");
  t("link de agendamento: copiar coloca o link certo na área de transferência", /\/#agendar$/.test(copiado));
  const btnCop=w.document.getElementById("btnCopiarLinkAg");
  t("link de agendamento: botão confirma 'Copiado!'", btnCop && /Copiado/.test(btnCop.textContent));
  w.closeModal&&w.closeModal();

  if (erros.length){ console.error("\n❌ FALHAS:\n"+erros.map(e=>" - "+e).join("\n")); process.exit(1); }
  console.log("\n✅ Teste por usuário: tudo passou.");
  process.exit(0);
})().catch(e=>{ console.error("Exceção no teste:", e); process.exit(1); }); }, 2500);
