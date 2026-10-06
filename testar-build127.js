// testar-build127.js — (1) Ocupação: "em reforma" não soma no total; (2) Calendário: gestor agenda sem equipe Mafra
// Uso: node testar-build127.js   (na pasta com index.html; precisa de `npm install jsdom`)
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
  const alerts=[]; w.alert=m=>alerts.push(String(m)); w.confirm=()=>true; w.scrollTo=()=>{};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const setUser=uid=>w.eval(`state.userId=${JSON.stringify(uid)}; state.user=USUARIOS[${JSON.stringify(uid)}];`);
  t("APP_VERSAO é build 143", /build 143/.test(w.eval("APP_VERSAO")));

  /* ================= 1) OCUPAÇÃO ================= */
  // relatório fictício: 46 ocupadas, 0 vazias, 1 em reforma → total tem que ser 46 e ocupadas 100%
  const rel={id:"relT1",condominio:"Le Monde Avenue",mesRef:"2026-09",status:"rascunho",autor:"lemonde",
    info:{ocupReforma:1,ocupVazia:0,ocupOcupada:46,inauguracao:"30/11/2021",areaConstruida:"52.048,87 m²",areaTerreno:"52.048,87 m²",torres:"2",unidades:"46",vagas:"90"},
    corretivas:{eletrica:0,hidraulica:0,civil:0}, preventivas:{previstas:0,realizadas:0,emAberto:0},
    listaCorretiva:[], listaPreventiva:[], registros:[], reunioes:[], ordenacao:{registros:"personalizada",reunioes:"personalizada"}};
  w.loadRelatorios=async()=>({list:[rel]});
  w.capasResolvidas=async()=>({});
  w.carregarFotosRel=async r=>({r,ok:true});
  // janela "pop-up" simulada que captura o HTML escrito
  let popHtml=""; const pop={document:{write:s=>{popHtml+=s;},open:()=>{popHtml="";},close:()=>{}},focus:()=>{},close:()=>{}};
  w.open=()=>pop;
  setUser("bianca");
  try{ await w.visualizarRelatorioPDF("relT1"); }catch(e){ erros.push("visualizarRelatorioPDF lançou: "+(e&&e.message)); }
  await wait(300);
  t("relatório foi gerado na janela", popHtml.indexOf("OCUPAÇÃO ATUAL")>-1);
  t("total de unidades na rosca = 46 (não 47)", />46<\/text>/.test(popHtml) && !/>47<\/text>/.test(popHtml));
  t("Ocupadas = 100%", /Ocupadas<\/div>[\s\S]{0,200}?ig-leg-pct">100%/.test(popHtml));
  t("Vazias = 0%", /Vazias<\/div>[\s\S]{0,200}?ig-leg-pct">0%/.test(popHtml));
  t("Em reforma aparece como informação à parte (1 unidade · já contadas acima)", popHtml.indexOf("1 unidade(s) · já contadas acima")>-1);
  // caso 2: 10 ocupadas, 10 vazias, 4 em reforma → total 20, 50%/50%, reforma 20% informativo
  rel.info={...rel.info,ocupOcupada:10,ocupVazia:10,ocupReforma:4}; popHtml="";
  try{ await w.visualizarRelatorioPDF("relT1"); }catch(e){} await wait(300);
  t("caso 10/10/4: total 20", />20<\/text>/.test(popHtml));
  t("caso 10/10/4: ocupadas 50% e reforma 20% (informativo)", /Ocupadas<\/div>[\s\S]{0,200}?ig-leg-pct">50%/.test(popHtml) && /Em reforma<\/div>[\s\S]{0,200}?ig-leg-pct">20%/.test(popHtml));
  t("editor do relatório avisa que reforma não soma", (w.eval("typeof abrirEditorRelatorio")==="function") && html.indexOf("(não soma no total)")>-1);

  /* ================= 1b) REGISTROS EM GRADE (build 128) ================= */
  const PX="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  rel.registros=[
    {tipo:"Hidráulica",status:"finalizado",foto:PX,descricao:"Só uma foto A"},
    {tipo:"Hidráulica",status:"finalizado",foto:PX,fotoDepois:PX,descricao:"Antes e depois"},
    {tipo:"Civil",status:"finalizado",foto:PX,descricao:"Só uma foto B"},
    {tipo:"Elétrica",status:"iniciado",foto:PX,fotosExtras:[{foto:PX}],descricao:"Com extra"},
  ];
  popHtml="";
  try{ await w.visualizarRelatorioPDF("relT1"); }catch(e){ erros.push("visualizarRelatorioPDF (registros) lançou: "+(e&&e.message)); }
  await wait(300);
  const grid=popHtml.slice(popHtml.indexOf('class="reg-grid"'));
  t("registros saem em grade de 2 colunas", popHtml.indexOf('class="reg-grid"')>-1);
  const ordem=[...grid.matchAll(/reg-card (reg-c[12])[^>]*>[\s\S]*?(?:reg-desc">([^<]*)|foto adicional)/g)].map(m=>m[1]+":"+(m[2]||"extra"));
  t("antes/depois ocupa a linha inteira (reg-c2)", grid.indexOf('reg-card reg-c2')>-1 && /reg-c2[\s\S]*?Antes e depois/.test(grid));
  // ordem por tipo: Hidráulica A, Hidráulica (par), Elétrica, Civil → a vaga ao lado de A é preenchida pela próxima foto única (Elétrica), e o par vem depois
  const primeiro=grid.indexOf("Só uma foto A"), par=grid.indexOf("Antes e depois"), prox=grid.indexOf("Com extra");
  t("foto única + próxima foto única ficam lado a lado, antes do par (sem buraco)", primeiro>-1 && prox>-1 && par>-1 && primeiro<prox && prox<par);
  t("cada foto única leva a própria descrição", /Só uma foto A/.test(grid) && /Só uma foto B/.test(grid));
  t("foto extra vira cartão próprio com etiqueta 'foto adicional'", grid.indexOf("foto adicional")>-1);
  t("fotos com a mesma altura (230px) em todos os cartões", popHtml.indexOf(".reg-card .reg-foto-wrap{height:230px}")>-1 && popHtml.indexOf(".reg-card .reg-par .reg-foto-wrap{height:230px}")>-1);
  rel.registros=[];

  /* ================= 2) CALENDÁRIO — GESTOR ================= */
  // armazenamento de eventos em memória
  const EV={}; w.loadEventos=async uid=>JSON.parse(JSON.stringify(EV[uid]||{events:[]}));
  w.saveEventos=async(uid,d)=>{ EV[uid]=JSON.parse(JSON.stringify(d)); return true; };
  w.loadAnivs=async()=>({list:[]}); w.loadFeriados=async()=>({}); w.saveEventoModelo=async()=>{};
  w.closeModal=()=>{ w.document.getElementById("modalMount").innerHTML=""; };
  w.render=()=>{}; w.renderCalendario=async()=>{}; w.pushAviso=async()=>{}; w.notificarParticipantes=async()=>{};
  w.eval(`USUARIOS.luciana={senha:"x",nome:"Luciana Calvão",tipo:"gestor",cargo:"Gestora",cor:"#7A3E9D",condominio:"Trio",condominios:["Trio Office","Trio Mall","Trio Home"]};`);
  t("gestor entra na lista de donos de agenda", w.agendaOwners().indexOf("luciana")>-1 && w.ehAgendavel("luciana")===true);
  t("equipe Mafra continua sem os gestores em PESSOAS_AGENDAVEIS", w.eval('PESSOAS_AGENDAVEIS.indexOf("luciana")')===-1);

  setUser("luciana"); w.eval(`state.tab="calendario";`);
  await w.openEvento(null,null,"2026-09-22"); await wait(100);
  const modal=w.document.getElementById("modalMount");
  const chkLu=modal.querySelector('input[name="eTeam"][value="luciana"]');
  t("modal do gestor: ele mesmo aparece na lista e já marcado", chkLu && chkLu.checked);
  t("modal do gestor: equipe Mafra aparece como opcional", modal.innerHTML.indexOf("Equipe Mafra (opcional)")>-1);
  w.document.getElementById("eTitle").value="Reunião com o conselho do Trio";
  w.document.getElementById("eDate").value="2026-09-22";
  w.document.getElementById("eStart").value="09:00"; w.document.getElementById("eEnd").value="10:00";
  const rb=modal.querySelector('input[name="eTipo"][value="reuniao"]'); if(rb) rb.checked=true;
  alerts.length=0;
  try{ await w.saveEvento(""); }catch(e){ erros.push("saveEvento (gestor) lançou: "+(e&&e.message)); }
  await wait(200);
  t("gestor salva sem ninguém da Mafra (sem o alerta antigo)", alerts.length===0);
  const evLu=(EV.luciana&&EV.luciana.events||[])[0];
  t("evento gravado na agenda do gestor", evLu && evLu.title==="Reunião com o conselho do Trio" && evLu.criadoPor==="luciana");
  t("evento NÃO foi parar na agenda de ninguém da Mafra", !Object.keys(EV).some(k=>k!=="luciana" && (EV[k].events||[]).length));

  // aparece na visão do calendário (semana) do próprio gestor
  const rng=await w.loadEventosRange(new Set(["2026-09-22"]));
  t("evento do gestor aparece no calendário", (rng.byDay["2026-09-22"]||[]).some(e=>e.title==="Reunião com o conselho do Trio"));

  /* ---- regra de visão ---- */
  // evento só do gestor: a Mafra NÃO vê (nem a master)
  setUser("mafra"); let rM=await w.loadEventosRange(new Set(["2026-09-22"]));
  t("master NÃO vê evento só do gestor", !(rM.byDay["2026-09-22"]||[]).some(e=>e.title==="Reunião com o conselho do Trio"));
  setUser("bianca"); rM=await w.loadEventosRange(new Set(["2026-09-22"]));
  t("Bianca NÃO vê evento só do gestor", !(rM.byDay["2026-09-22"]||[]).some(e=>e.title==="Reunião com o conselho do Trio"));
  // evento interno da Mafra: gestor NÃO vê
  EV.walace={events:[{id:"eW1",gid:"eW1",criadoPor:"walace",title:"Reunião Kanoah",date:"2026-09-22",start:"11:00",end:"12:00",tipo:"reuniao",participantes:[{tipo:"equipe",id:"walace"}]}]};
  setUser("luciana"); let rG=await w.loadEventosRange(new Set(["2026-09-22"]));
  t("gestor NÃO vê evento interno da Mafra", !(rG.byDay["2026-09-22"]||[]).some(e=>e.title==="Reunião Kanoah"));
  t("gestor continua vendo o próprio evento", (rG.byDay["2026-09-22"]||[]).some(e=>e.title==="Reunião com o conselho do Trio"));
  // assembleia do condomínio do gestor: gestor vê
  EV.bruna={events:[{id:"eA1",gid:"eA1",criadoPor:"bruna",title:"Assembleia Ord. — Trio Mall",date:"2026-09-22",start:"19:00",end:"21:00",tipo:"assembleia",assembleia:{condominio:"Trio Mall"},participantes:[{tipo:"equipe",id:"bruna"}]},
                    {id:"eA2",gid:"eA2",criadoPor:"bruna",title:"Assembleia Ord. — San Diego",date:"2026-09-22",start:"19:00",end:"21:00",tipo:"assembleia",assembleia:{condominio:"San Diego"},participantes:[{tipo:"equipe",id:"bruna"}]}]};
  rG=await w.loadEventosRange(new Set(["2026-09-22"]));
  t("gestor do Trio vê a assembleia do Trio Mall", (rG.byDay["2026-09-22"]||[]).some(e=>e.title==="Assembleia Ord. — Trio Mall"));
  t("gestor do Trio NÃO vê a assembleia do San Diego", !(rG.byDay["2026-09-22"]||[]).some(e=>e.title==="Assembleia Ord. — San Diego"));
  setUser("mafra"); rM=await w.loadEventosRange(new Set(["2026-09-22"]));
  t("master vê os eventos da Mafra (Kanoah + assembleias)", ["Reunião Kanoah","Assembleia Ord. — Trio Mall","Assembleia Ord. — San Diego"].every(x=>(rM.byDay["2026-09-22"]||[]).some(e=>e.title===x)));
  delete EV.walace; delete EV.bruna;
  /* ---- time do grupo: gerente + administrativos do Trio ---- */
  w.eval(`USUARIOS.adm_trio={senha:"x",nome:"Administrativo Trio",tipo:"gestor",cargo:"Administrativo",cor:"#3C7",condominio:"Trio",condominios:["Trio Office","Trio Mall","Trio Home"]};
          USUARIOS.adm_lm={senha:"x",nome:"Administrativo Le Monde",tipo:"gestor",cargo:"Administrativo",cor:"#C73",condominio:"Le Monde",condominios:["Le Monde Marche","Le Monde Avenue","Le Monde Parc"]};`);
  t("gestores do mesmo grupo formam um time (Luciana + adm Trio)", w.gestoresDoMesmoGrupo("luciana").indexOf("adm_trio")>-1 && w.gestoresDoMesmoGrupo("luciana").indexOf("adm_lm")===-1);
  setUser("adm_trio"); rG=await w.loadEventosRange(new Set(["2026-09-22"]));
  t("administrativo do Trio vê o evento da gerente do Trio", (rG.byDay["2026-09-22"]||[]).some(e=>e.title==="Reunião com o conselho do Trio"));
  setUser("adm_lm"); rG=await w.loadEventosRange(new Set(["2026-09-22"]));
  t("administrativo do Le Monde NÃO vê o evento do Trio", !(rG.byDay["2026-09-22"]||[]).some(e=>e.title==="Reunião com o conselho do Trio"));
  setUser("luciana"); await w.openEvento(null,null,"2026-09-24"); await wait(100);
  const m3=w.document.getElementById("modalMount");
  t("modal da gerente lista a equipe do grupo (adm Trio) e não o Le Monde", m3.querySelector('input[name="eTeam"][value="adm_trio"]')!==null && m3.querySelector('input[name="eTeam"][value="adm_lm"]')===null && m3.innerHTML.indexOf("Sua equipe (Trio)")>-1);
  w.closeModal();


  // equipe Mafra pode convidar o gestor
  setUser("bianca");
  await w.openEvento(null,null,"2026-09-23"); await wait(100);
  const m2=w.document.getElementById("modalMount");
  t("modal da equipe: gestores em LISTA SUSPENSA (não em chips), com 'Luciana · Trio'", m2.innerHTML.indexOf("Gestores dos condomínios")>-1 && m2.querySelector('#eGestorSel option[value="luciana"]')!==null && m2.innerHTML.indexOf("· Trio")>-1 && m2.querySelector('input[name="eTeam"][value="luciana"]')===null);
  {
  w.eval(`USUARIOS.zz_ana={senha:"x",nome:"Ana Paula",tipo:"gestor",cor:"#123",condominio:"Le Monde"}; USUARIOS.aa_tomas={senha:"x",nome:"Tomás Reis",tipo:"gestor",cor:"#321",condominio:"Portal do Lago II"};`);
  await w.openEvento(null,null,"2026-09-23"); await wait(100);
  const m2b=w.document.getElementById("modalMount");
  const nomesOrd=[...m2b.querySelectorAll('#eGestorSel option')].slice(1).map(o=>o.textContent.split(" · ")[0]);
  t("lista suspensa de gestores em ordem alfabética pelo nome", nomesOrd.join("|")===nomesOrd.slice().sort((a,b)=>a.localeCompare(b,"pt-BR",{sensitivity:"base"})).join("|") && nomesOrd.indexOf("Ana")<nomesOrd.indexOf("Tomás"));
  w.eval(`delete USUARIOS.zz_ana; delete USUARIOS.aa_tomas;`);
  const selG=m2b.querySelector('#eGestorSel'); selG.value="luciana"; w._evAddGestor(selG);
  const m2=m2b;
  t("escolher na lista cria o chip da gestora (marcado) e a lista volta ao vazio", m2.querySelector('input[name="eTeam"][value="luciana"]')!==null && m2.querySelector('input[name="eTeam"][value="luciana"]').checked && selG.value==="");
  w._evAddGestor(Object.assign(selG,{value:"luciana"}));
  t("não duplica o chip", m2.querySelectorAll('input[name="eTeam"][value="luciana"]').length===1);
  }
  w.document.getElementById("eTitle").value="Alinhamento Trio";
  w.document.getElementById("eDate").value="2026-09-23"; w.document.getElementById("eStart").value="14:00"; w.document.getElementById("eEnd").value="15:00";
  try{ await w.saveEvento(""); }catch(e){ erros.push("saveEvento (bianca) lançou: "+(e&&e.message)); }
  await wait(200);
  setUser("luciana"); rG=await w.loadEventosRange(new Set(["2026-09-23"]));
  t("gestor vê o evento em que a Mafra o convidou", (rG.byDay["2026-09-23"]||[]).some(e=>e.title==="Alinhamento Trio"));
  setUser("mafra"); rM=await w.loadEventosRange(new Set(["2026-09-23"]));
  t("master vê o evento Bianca+gestora (tem gente da Mafra)", (rM.byDay["2026-09-23"]||[]).some(e=>e.title==="Alinhamento Trio"));
  setUser("bianca");
  t("evento da Bianca com a gestora entra nas duas agendas", (EV.bianca.events||[]).some(e=>e.title==="Alinhamento Trio") && (EV.luciana.events||[]).some(e=>e.title==="Alinhamento Trio"));
  // excluir tira das duas
  const gid=(EV.bianca.events.find(e=>e.title==="Alinhamento Trio")||{}).gid;
  try{ await w.delEvento(gid); }catch(e){ erros.push("delEvento lançou: "+(e&&e.message)); }
  await wait(100);
  t("excluir remove também da agenda do gestor", !(EV.luciana.events||[]).some(e=>e.title==="Alinhamento Trio") && !(EV.bianca.events||[]).some(e=>e.title==="Alinhamento Trio"));

  /* ================= 3) CALENDÁRIO — SEMANA EM GRADE (build 143) ================= */
  const lay=w._cgLayoutDia([{start:"09:00",end:"11:00"},{start:"09:00",end:"09:30"},{start:"09:30",end:"10:00"},{start:"14:00",end:"15:00"}]);
  t("layout: 3 reuniões sobrepostas cabem em 2 colunas (9:00–9:30 e 9:30–10:00 reaproveitam a coluna); a das 14h fica sozinha", lay.filter(x=>x.n===2).length===3 && lay.find(x=>x.e.start==="14:00").n===1);
  w.localStorage.removeItem("mafra:calSemanaModo");
  const mon=w.mondayOfDate(new Date()); const dsMon=w.ymd(mon); const dsTue=w.ymd(w.addDays(mon,1));
  EV.bianca={events:[{id:"g1",gid:"g1",criadoPor:"bianca",title:"Reunião Financeiro",date:dsMon,start:"09:30",end:"10:30",tipo:"reuniao",participantes:[{tipo:"equipe",id:"bianca"}]},{id:"g2",gid:"g2",criadoPor:"bianca",title:"Escritório",date:dsTue,start:"09:00",end:"18:00",tipo:"bloqueio",participantes:[{tipo:"equipe",id:"bianca"}]}]};
  setUser("bianca"); w.eval(`state.tab="calendario"; state.calView="semana"; state.calRef=new Date();`);
  await w.renderCalSemana(); await wait(300);
  const vc=w.document.getElementById("view").innerHTML;
  t("semana abre no layout 'Agenda da equipe' (painel, 7 colunas com contador, cards com etiqueta e avatar)", vc.indexOf('class="ag-panel"')>-1 && vc.indexOf("Agenda da equipe")>-1 && vc.indexOf("Novo compromisso")>-1 && (vc.match(/class="ag-day /g)||[]).length===7 && vc.indexOf('ag-ttl">Reunião Financeiro')>-1 && vc.indexOf('ag-tag reuniao">Reunião')>-1 && vc.indexOf('ag-tag bloqueio">Bloqueio')>-1 && vc.indexOf('class="ag-av"')>-1 && vc.indexOf("Nenhum compromisso agendado")>-1);
  w.localStorage.setItem("mafra:calSemanaModo","grade"); await w.renderCalSemana(); await wait(300);
  const vg=w.document.getElementById("view").innerHTML;
  t("Grade fica disponível como opção (cg-wrap, 7 colunas, horas)", vg.indexOf('class="cg-wrap"')>-1 && (vg.match(/class="cg-col/g)||[]).length===7 && vg.indexOf(">08:00<")>-1);
  t("reunião posicionada pela hora (top proporcional) e bloqueio como faixa de fundo", /cg-ev[^"]*" style="top:\d+(\.\d+)?px;height:\d+(\.\d+)?px;left:calc/.test(vg) && vg.indexOf("cg-ev bloq fundo")>-1);
  t("alternador Cards | Grade presente", vg.indexOf("setCalSemanaModo('cards')")>-1);
  w.localStorage.setItem("mafra:calSemanaModo","cards"); await w.renderCalSemana(); await wait(300);
  t("modo Cards continua disponível", w.document.getElementById("view").innerHTML.indexOf('class="ag-panel"')>-1);
  delete EV.bianca; w.localStorage.removeItem("mafra:calSemanaModo");

  /* ================= 4) KANBAN — finalizada não é atrasada (build 143) ================= */
  const ontem=w.ymd(w.addDays(new Date(),-1)), amanha=w.ymd(w.addDays(new Date(),1));
  EV.bruna={events:[{id:"k1",gid:"k1",criadoPor:"bruna",title:"Café com síndico Icon",date:ontem,start:"18:00",end:"20:00",tipo:"reuniao",finalizado:true,participantes:[{tipo:"equipe",id:"bruna"}]},
                    {id:"k2",gid:"k2",criadoPor:"bruna",title:"Visita atrasada",date:ontem,start:"10:00",end:"11:00",tipo:"reuniao",participantes:[{tipo:"equipe",id:"bruna"}]},
                    {id:"k3",gid:"k3",criadoPor:"bruna",title:"Reunião de amanhã",date:amanha,start:"10:00",end:"11:00",tipo:"reuniao",participantes:[{tipo:"equipe",id:"bruna"}]}]};
  setUser("bruna"); w.eval(`state.tab="calendario"; state.calView="kanban";`);
  await w.renderCalKanban(); await wait(300);
  const vk=w.document.getElementById("view").innerHTML;
  const col=(nome)=>{ const i=vk.indexOf(">"+nome+"<"); const j=vk.indexOf('class="kanban-col"',i+1); return vk.slice(i, j>0?j:undefined); };
  t("kanban tem a coluna 'Concluídos'", vk.indexOf(">Concluídos<")>-1);
  t("reunião finalizada vai para Concluídos (com ✓ Realizada), não para Atrasados", col("Concluídos").indexOf("Café com síndico Icon")>-1 && col("Concluídos").indexOf("✓ Realizada")>-1 && col("Atrasados").indexOf("Café com síndico Icon")===-1);
  t("reunião passada NÃO finalizada continua em Atrasados", col("Atrasados").indexOf("Visita atrasada")>-1);
  t("reunião futura fica em Próximos 7 dias", col("Próximos 7 dias").indexOf("Reunião de amanhã")>-1);
  delete EV.bruna;

  if(erros.length){ console.log("\n❌ FALHAS:\n"+erros.join("\n")); process.exit(1); }
  console.log("\n✅ Builds 127/128: tudo passou.");
  process.exit(0);
})().catch(e=>{ console.log("❌ exceção: "+(e&&e.stack||e)); process.exit(1); }); }, 1500);
