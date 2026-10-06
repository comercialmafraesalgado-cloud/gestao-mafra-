// testar-recorrencia.js — build 143: ocorrência projetada de tarefa recorrente tem status próprio
const fs=require("fs"); const {JSDOM,VirtualConsole}=require("jsdom");
const html=fs.readFileSync("index.html","utf-8"); const erros=[]; const vc=new VirtualConsole();
vc.on("jsdomError",e=>{ const m=(e&&e.message)||""; if(!/Could not load (script|link)|scrollTo/.test(m)) erros.push("jsdomError: "+m); });
const dom=new JSDOM(html,{runScripts:"dangerously",resources:"usable",url:"https://gestaomafra.netlify.app/",pretendToBeVisual:true,virtualConsole:vc});
setTimeout(()=>{(async()=>{
  const w=dom.window; const t=(n,c)=>{ if(!c) erros.push("FALHOU: "+n); else console.log("✓",n); };
  w.alert=()=>{}; w.confirm=()=>true; w.scrollTo=()=>{};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  w.loadEventos=async()=>({events:[]}); w.loadCondominios=async()=>({}); w.loadListasIndex=async()=>({listas:[]});
  const wk0=w.weekKey(0), wk1=w.weekKey(1);
  const mon0=w.ymd(w.mondayOfDate(new Date()));
  let AG={weeks:{}}; AG.weeks[wk0]=[{id:"r1",dia:"seg",titulo:"Alimentar Banco de Dados Financeiros MAFRA",status:"concluido",prioridade:"media",recorrencia:"diario",recBase:mon0}];
  w.loadAgenda=async()=>JSON.parse(JSON.stringify(AG)); w.saveAgenda=async(uid,d)=>{ AG=JSON.parse(JSON.stringify(d)); return true; };
  w.eval(`state.userId="camilla"; state.user=USUARIOS.camilla; state.tab="tarefas"; state.semana=1; state.lidPeriodo="semana";`);
  w._li.modo="semana";
  await w.renderLideranca(); await wait(400);
  let v=w.document.getElementById("view").innerHTML;
  t("APP_VERSAO é build 143", /build 143/.test(w.eval("APP_VERSAO")));
  const cards=[...w.document.querySelectorAll("#view .task")].filter(c=>c.textContent.indexOf("Alimentar Banco")>-1);
  t("semana seguinte mostra as ocorrências projetadas (ter a sex, 4 cards)", cards.length>=4);
  t("ocorrências da semana seguinte NÃO herdam 'Concluído' da base", cards.every(c=>c.textContent.indexOf("Concluído")===-1 && c.textContent.indexOf("Planejado")>-1));
  t("cada ocorrência tem seu botão ✓ de concluir", v.indexOf("finalizarOcorrencia('r1'")>-1);
  const mon1=w.ymd(w.addDays(w.mondayOfDate(new Date()),7)); const ter1=w.ymd(w.addDays(w.mondayOfDate(new Date()),8));
  await w.finalizarOcorrencia("r1", ter1); await wait(400);
  t("concluir a ocorrência de terça grava só aquela data (recFeitos)", AG.weeks[wk0][0].recFeitos && !!AG.weeks[wk0][0].recFeitos[ter1] && !AG.weeks[wk0][0].recFeitos[w.ymd(w.addDays(w.mondayOfDate(new Date()),9))]);
  await w.renderLideranca(); await wait(400);
  const cards2=[...w.document.querySelectorAll("#view .task")].filter(c=>c.textContent.indexOf("Alimentar Banco")>-1);
  const concl=cards2.filter(c=>c.textContent.indexOf("Concluído")>-1).length;
  t("na tela: só a ocorrência de terça aparece Concluída; as outras seguem Planejadas", concl===1 && cards2.length-concl>=3);
  t("ocorrência concluída oferece ↩ reabrir", w.document.getElementById("view").innerHTML.indexOf("reabrirOcorrencia('r1'")>-1);
  await w.reabrirOcorrencia("r1", ter1); await wait(300);
  t("reabrir limpa a data", !AG.weeks[wk0][0].recFeitos[ter1]);
  t("a base (semana atual) continua concluída como estava", AG.weeks[wk0][0].status==="concluido");
  if(erros.length){ console.log("\n❌ FALHAS:\n"+erros.join("\n")); process.exit(1); }
  console.log("\n✅ Recorrência (build 143): tudo passou."); process.exit(0);
})().catch(e=>{ console.log("❌ exceção: "+(e&&e.stack||e)); process.exit(1); }); },1500);
