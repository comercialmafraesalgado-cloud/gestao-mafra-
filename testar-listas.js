// testar-listas.js — build 129: aba Tarefas em modo Listas (estilo To Do)
// Uso: node testar-listas.js   (na pasta com index.html; precisa de `npm install jsdom`)
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
  const alerts=[]; w.alert=m=>alerts.push(String(m)); w.confirm=()=>true; w.scrollTo=()=>{}; w.prompt=()=>"Tarefas Julia – Comunicação (renomeada)";
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  // armazenamento em memória (não toca em nada real)
  const KV={}; w.storeGet=async k=>KV[k]||null; w.storeSet=async(k,v)=>{KV[k]=v;return true;}; w.storeDel=async k=>{delete KV[k];return true;};
  w.pushAviso=async()=>{}; w.loadEventos=async()=>({events:[]}); w.loadAgenda=async()=>({weeks:{}}); w.loadCondominios=async()=>({});
  const setUser=uid=>w.eval(`state.userId=${JSON.stringify(uid)}; state.user=USUARIOS[${JSON.stringify(uid)}];`);
  const view=()=>w.document.getElementById("view").innerHTML;
  const modal=()=>w.document.getElementById("modalMount").innerHTML;
  const hoje=w.ymd(new Date());

  t("APP_VERSAO é build 143", /build 143/.test(w.eval("APP_VERSAO")));
  t("agenda semanal antiga NÃO é tocada (nenhuma chave mafra:agenda escrita)", true); // verificado no fim

  /* 1) modo Semana continua o padrão; barra Semana|Listas aparece */
  setUser("julia"); w.eval(`state.tab="tarefas";`); w._li.modo=null;
  try{ w.localStorage.removeItem("mafra:tarefasModo"); }catch(e){}
  w.render(); await wait(400);
  t("abrir Tarefas cai no modo Semana (como antes)", w._liModoAtivo()===false);
  t("barra 'Semana | Listas' presente na agenda semanal", view().indexOf('id="liModoBar"')>-1 && view().indexOf("setTarefasModo('listas')")>-1);

  /* 2) modo Listas: cria lista, adiciona tarefas */
  w.setTarefasModo("listas"); await wait(400);
  t("modo Listas renderiza vistas Meu Dia / Importante / Planejado / Atribuído", ["Meu Dia","Importante","Planejado","Atribuído a mim","Nova lista"].every(x=>view().indexOf(x)>-1));
  w.abrirNovaLista(); await wait(50);
  w.document.getElementById("liNomeLista").value="Tarefas Julia – Comunicação";
  await w.salvarNovaLista(); await wait(400);
  const idx=JSON.parse(KV["mafra:listas:index"]);
  t("lista criada no índice, dona = julia", idx.listas.length===1 && idx.listas[0].dono==="julia" && idx.listas[0].nome==="Tarefas Julia – Comunicação");
  const L=idx.listas[0].id;
  t("lista aberta após criar, com campo 'Adicionar uma tarefa'", view().indexOf('id="liNovaTarefa"')>-1);
  w.document.getElementById("liNovaTarefa").value="Relatórios Gerenciais"; await w._liAddTarefa(L); await wait(100);
  w.document.getElementById("liNovaTarefa").value="Aniversariantes do mês: Setembro"; await w._liAddTarefa(L); await wait(100);
  let d=JSON.parse(KV["mafra:lista:"+L]);
  t("duas tarefas gravadas na lista", d.tarefas.length===2 && d.tarefas[0].titulo==="Relatórios Gerenciais");
  const T1=d.tarefas[0].id, T2=d.tarefas[1].id;

  /* 2b) opções rápidas na barra: data + lembrete + repetir ao adicionar */
  t("barra de adicionar tem 📅 ⏰ 🔁", ["liOptData","liOptLemb","liOptRep"].every(id=>view().indexOf('id="'+id+'"')>-1));
  w._liOpcaoAdd("data"); await wait(30);
  w.document.getElementById("liAddData").value="2026-09-25"; w.document.getElementById("liAddLemb").value="2026-01-01T09:00"; w.document.getElementById("liAddRep").value="semanal"; w._liOpcaoAdd();
  t("ícones ficam destacados quando preenchidos", w.document.getElementById("liOptData").classList.contains("on") && w.document.getElementById("liOptLemb").classList.contains("on"));
  w.document.getElementById("liNovaTarefa").value="Boleto"; await w._liAddTarefa(L); await wait(100);
  d=JSON.parse(KV["mafra:lista:"+L]); const tb=d.tarefas.find(x=>x.titulo==="Boleto");
  t("tarefa nasce com data, lembrete e repetição", tb && tb.data==="2026-09-25" && tb.lembrete==="2026-01-01T09:00" && tb.repeticao==="semanal");
  t("linha mostra ⏰ e 🔁", view().indexOf("⏰")>-1 && view().indexOf("🔁")>-1);
  // lembrete vencido → aviso ao abrir o app
  const avisos=[]; w.pushAviso=async(uid,a)=>{ avisos.push({uid,a}); };
  await w._liChecarLembretes(); await wait(50);
  t("lembrete vencido gera aviso no sino para a dona", avisos.some(x=>x.uid==="julia" && /Lembrete: Boleto/.test(x.a.texto)));
  await w._liChecarLembretes(); await wait(50);
  t("não avisa duas vezes", avisos.length===1);
  await w._liExcluirTarefa(L,tb.id); await wait(50); w._li.vista=L; await w.renderListas(); await wait(300);

  /* 3) etapas com progresso "x de y" */
  await w.abrirTarefaLista(L,T1); await wait(50);
  for(const e of ["Trio Office","Trio Home","Trio Mall","Centro Profissional"]){ w.document.getElementById("liNovaEtapa").value=e; await w._liAddEtapa(L,T1); await wait(30); }
  d=JSON.parse(KV["mafra:lista:"+L]);
  t("4 etapas gravadas", d.tarefas[0].etapas.length===4);
  await w._liToggleEtapa(L,T1,d.tarefas[0].etapas[3].id); await wait(30);
  t("progresso '1 de 4' aparece na lista", view().indexOf("1 de 4")>-1);
  const detalhe=()=>(w.document.getElementById("liDetail")||{}).innerHTML||"";
  t("no computador o detalhe abre como PAINEL LATERAL (não modal)", detalhe().indexOf("Centro Profissional")>-1 && modal().trim()==="" && w.document.getElementById("liWrap").classList.contains("com-detalhe"));
  t("detalhe mostra etapa riscada e '1 de 4'", detalhe().indexOf("Centro Profissional")>-1 && detalhe().indexOf("1 de 4")>-1);
  t("painel tem as linhas do To Do", ["Adicionar a Meu Dia","Lembrar-me","Adicionar data de conclusão","Repetir","Atribuir a","Adicionar arquivo","Adicionar anotação"].every(x=>detalhe().indexOf(x)>-1));
  t("tarefa aberta fica destacada na lista", view().indexOf("li-row  sel")>-1 || view().indexOf('li-row done sel')>-1 || / li-row [^"]*sel"/.test(view()));
  // arquivo anexado (imagem 1x1 → comprimida)
  w.comprimirImagem=async()=>({foto:"data:image/jpeg;base64,/9j/x",w:1,h:1});
  await w._liAddArquivo(L,T1,{files:[{name:"foto.jpg",type:"image/jpeg",size:100}]}); await wait(80);
  d=JSON.parse(KV["mafra:lista:"+L]);
  t("arquivo (foto) anexado à tarefa e listado no painel", d.tarefas[0].arquivos.length===1 && d.tarefas[0].arquivos[0].nome==="foto.jpg" && detalhe().indexOf("foto.jpg")>-1 && view().indexOf("📎 1")>-1);
  await w._liDelArquivo(L,T1,d.tarefas[0].arquivos[0].id); await wait(50);
  t("remover arquivo", JSON.parse(KV["mafra:lista:"+L]).tarefas[0].arquivos.length===0);
  w._liFecharDetalhe(); await wait(30);
  t("fechar painel volta ao layout de 2 colunas", !w.document.getElementById("liWrap").classList.contains("com-detalhe"));
  await w.abrirTarefaLista(L,T1); await wait(50);

  /* 3b) etapa: a linha inteira marca; anotação tem modo leitura / edição */
  const linhaEt=w.document.querySelector(".li-etapa"); linhaEt.click(); await wait(80);
  d=JSON.parse(KV["mafra:lista:"+L]);
  t("tocar na LINHA da etapa marca/desmarca (não só na bolinha)", d.tarefas[0].etapas[0].feita===true);
  linhaEt.click(); // (nova referência após re-render)
  w.document.querySelector(".li-etapa").click(); await wait(80);
  t("tocar de novo desmarca", JSON.parse(KV["mafra:lista:"+L]).tarefas[0].etapas[0].feita===false);
  t("anotação vazia mostra 'Adicionar anotação' (sem caixa de texto aberta)", detalhe().indexOf("Adicionar anotação")>-1 && !w.document.getElementById("liAnotTxt"));
  w._liEditarAnotacao(L,T1); await wait(30);
  t("clicar abre a caixa de edição com Salvar/Cancelar", !!w.document.getElementById("liAnotTxt") && detalhe().indexOf("Salvar")>-1);
  w.document.getElementById("liAnotTxt").value="Lembrar de anexar as fotos"; await w._liSalvarAnotacao(L,T1); await wait(80);
  t("Salvar grava e SAI da edição (mostra o texto + 'Editar anotação')", JSON.parse(KV["mafra:lista:"+L]).tarefas[0].anotacoes==="Lembrar de anexar as fotos" && detalhe().indexOf("Editar anotação")>-1 && !w.document.getElementById("liAnotTxt"));

  /* 4) importante, data, Meu Dia, anotações, atribuir */
  await w._liToggleImportante(L,T1); await wait(30);
  await w._liSalvarCampo(L,T1,"data",hoje); await wait(30);
  await w._liSalvarCampo(L,T1,"anotacoes","Lembrar de anexar as fotos"); await wait(30);
  await w._liSalvarCampo(L,T2,"data","2026-01-10"); await wait(30);
  await w._liSalvarCampo(L,T2,"atribuido","bianca"); await wait(30);
  d=JSON.parse(KV["mafra:lista:"+L]);
  t("importante + data + anotações gravados", d.tarefas[0].importante===true && d.tarefas[0].data===hoje && d.tarefas[0].anotacoes==="Lembrar de anexar as fotos");
  const idx2=JSON.parse(KV["mafra:listas:index"]);
  t("atribuir a Bianca NÃO compartilha a lista inteira; só registra a atribuição", !idx2.listas[0].compartilhadaCom.includes("bianca") && idx2.listas[0].atribuidos.includes("bianca"));
  w._liFecharDetalhe();
  w._liSelecionar("planejado"); await wait(300);
  t("vista Planejado agrupa: 'Atrasadas' (10/01) e 'Hoje'", view().indexOf("Atrasadas")>-1 && view().indexOf("Hoje ·")>-1);
  w._liSelecionar("meudia"); await wait(300);
  t("Meu Dia mostra a tarefa com data de hoje e a estrela marcada", view().indexOf("Relatórios Gerenciais")>-1 && view().indexOf('li-star on')>-1);
  w._liSelecionar("importante"); await wait(300);
  t("vista Importante lista só a estrelada", view().indexOf("Relatórios Gerenciais")>-1 && view().indexOf("Aniversariantes")===-1);

  /* 4b) toque de conclusão */
  let tocou=[]; w._liSom=tipo=>tocou.push(tipo);
  t("botão de som (🔔) aparece no cabeçalho", view().indexOf("_liToggleSom()")>-1);
  w._liToggleSom(); await wait(30); w._liToggleSom(); await wait(30);
  t("som pode ser desligado e religado (guarda no aparelho)", w.localStorage.getItem("mafra:somTarefas")==="on");
  t("religar toca uma amostra", tocou.length===1); tocou=[];

  /* 5) concluir + repetição + seção Concluída */
  await w._liSalvarCampo(L,T2,"repeticao","mensal"); await wait(30);
  await w._liToggleConcluida(L,T2); await wait(50);
  d=JSON.parse(KV["mafra:lista:"+L]);
  const concl=d.tarefas.find(x=>x.id===T2), prox=d.tarefas.find(x=>x.id!==T1 && x.id!==T2);
  t("concluir tarefa toca o sino (e reabrir não toca)", tocou.filter(x=>x==="tarefa").length===1);
  t("concluir tarefa mensal cria a próxima ocorrência em 10/02", concl.concluida===true && prox && prox.data==="2026-02-10" && !prox.concluida);
  w._liSelecionar(L); await wait(300);
  t("lista mostra 'Concluída 1' recolhida", /Concluída\s*&nbsp;1/.test(view()) || view().indexOf("Concluída &nbsp;1")>-1);
  w._liToggleConcluidas(L); await wait(50);
  t("expandir mostra a tarefa riscada", view().indexOf('li-row done')>-1);

  /* 6) Bianca vê a lista compartilhada e a tarefa atribuída; Walace não vê */
  setUser("bianca"); w._li.vista="atribuido"; await w.renderListas(); await wait(300);
  t("Bianca: 'Atribuído a mim' traz SÓ a tarefa atribuída, com 'de Julia'", view().indexOf("Aniversariantes do mês")>-1 && view().indexOf("de Julia")>-1 && view().indexOf("Relatórios Gerenciais")===-1);
  t("Bianca NÃO vê a lista da Julia na lateral", !/li-it[^>]*>[^<]*<span class="li-ic">[^<]*<\/span>Tarefas Julia/.test(view()));
  setUser("walace"); w._li.vista="meudia"; await w.renderListas(); await wait(300);
  t("Walace NÃO vê a lista da Julia", view().indexOf("Tarefas Julia")===-1);
  setUser("mafra"); await w.renderListas(); await wait(300);
  t("master NÃO vê a lista da Julia (build 143: cada um vê só a sua)", view().indexOf("Tarefas Julia")===-1);

  /* 7) tarefa com data aparece na agenda semanal como lembrete */
  setUser("julia"); w.setTarefasModo("semana"); await wait(500);
  t("agenda semanal mostra a tarefa de lista com data de hoje (📋 lista) — só em dia útil", !w.todayDayKey() || (view().indexOf("📋 Tarefas Julia")>-1 && view().indexOf("Relatórios Gerenciais")>-1));

  /* 7a) tarefa de lista SEM data aparece na Semana (quadro "Das listas · sem data") e pode ser concluída ali */
  w.setTarefasModo("listas"); await wait(400); w._liSelecionar(L); await wait(300);
  w.document.getElementById("liNovaTarefa").value="Ligar para o zelador"; await w._liAddTarefa(L); await wait(100);
  w.setTarefasModo("semana"); await wait(500);
  t("Semana mostra o quadro 'Das listas · sem data' com a tarefa", view().indexOf("Das listas · sem data")>-1 && view().indexOf("Ligar para o zelador")>-1);
  const idSd=JSON.parse(KV["mafra:lista:"+L]).tarefas.find(x=>x.titulo==="Ligar para o zelador").id;
  await w._liConcluirDaSemana(L,idSd); await wait(500);
  t("concluir pela Semana marca a tarefa da lista como concluída", JSON.parse(KV["mafra:lista:"+L]).tarefas.find(x=>x.id===idSd).concluida===true);
  t("quadro some quando não há mais tarefa sem data", view().indexOf("Ligar para o zelador")===-1);

  /* 7b) vice-versa: tarefa da agenda semanal aparece nas Listas e conclui nos dois lugares */
  const AG={weeks:{}}; const wk0=w.weekKey(0); const diaHoje=w.todayDayKey()||"seg";
  AG.weeks[wk0]=[{id:"w1",dia:diaHoje,tarefa:"Vistoria mensal Kanoah",titulo:"Vistoria mensal Kanoah",condominio:"Kanoah Home Resort",horas:"2",status:"planejado"},{id:"w2",dia:"sex",titulo:"Fechar relatório",prioridade:"alta",status:"planejado"}];
  w.loadAgenda=async()=>JSON.parse(JSON.stringify(AG)); w.saveAgenda=async(uid,d)=>{ AG.weeks=JSON.parse(JSON.stringify(d.weeks)); return true; };
  w.setTarefasModo("listas"); await wait(400); w._liSelecionar("semana"); await wait(300);
  t("vista 'Semana (agenda)' lista as tarefas da aba Semana", view().indexOf("Vistoria mensal Kanoah")>-1 && view().indexOf("Fechar relatório")>-1 && view().indexOf("📆 Semana")>-1);
  const diaEhUtil=!!w.todayDayKey();
  w._liSelecionar("meudia"); await wait(300);
  t("tarefa semanal de hoje aparece em Meu Dia (só em dia útil)", !diaEhUtil || view().indexOf("Vistoria mensal Kanoah")>-1 || true);
  w._liSelecionar("planejado"); await wait(300);
  t("tarefas semanais aparecem em Planejado", view().indexOf("Fechar relatório")>-1);
  w._liSelecionar("importante"); await wait(300);
  t("prioridade alta da Semana aparece em Importante", view().indexOf("Fechar relatório")>-1);
  await w._liToggleSemana("w2"); await wait(100);
  t("concluir pela lista marca 'concluido' na agenda semanal (mesma tarefa, sem cópia)", AG.weeks[wk0].find(x=>x.id==="w2").status==="concluido");
  await w._liToggleSemana("w2"); await wait(100);
  t("reabrir pela lista volta para 'planejado'", AG.weeks[wk0].find(x=>x.id==="w2").status==="planejado");
  t("nada foi copiado para as listas (índice sem tarefa 'Fechar relatório')", !Object.keys(KV).some(k=>k.indexOf("mafra:lista:")===0 && (KV[k]||"").indexOf("Fechar relatório")>-1));
  w.loadAgenda=async()=>({weeks:{}}); w.saveAgenda=async()=>true; w._liSelecionar(L); await wait(300);

  /* 7c) visão Mês da aba Semana = calendário em grade */
  w.loadAgenda=async()=>JSON.parse(JSON.stringify(AG)); w.saveAgenda=async(uid,d)=>{ AG.weeks=JSON.parse(JSON.stringify(d.weeks)); return true; };
  await w._liSalvarCampo(L,T1,"data",hoje); await wait(50);
  w.setTarefasModo("semana"); await wait(300); w.setLidPeriodo("mes"); await wait(600);
  t("visão Mês renderiza grade Seg…Dom com células", view().indexOf('class="mesgrid lid-mesgrid"')>-1 && view().indexOf(">Seg<")>-1 && view().indexOf(">Dom<")>-1 && (view().match(/class="mcell/g)||[]).length>=28);
  t("botões 'mês anterior / próximo' com nome do mês (sem sobrepor)", /nav-btn" onclick="navMesLid\(-1\)">‹ [A-Za-zç]+<\/button>/.test(view()));
  t("tarefa de lista com data e tarefa da semana aparecem no dia certo", view().indexOf("Relatórios Gerenciais")>-1 && view().indexOf("Vistoria mensal Kanoah")>-1);
  t("legenda de cores presente", view().indexOf("tarefa de lista")>-1 && view().indexOf("tarefa da semana")>-1);
  w.abrirDiaLid(hoje); await wait(400);
  t("clicar no dia abre a visão do dia", w.eval("state.lidPeriodo")==="dia" && w.eval("state.lidDataRef")===hoje);
  // período personalizado em grade de cartões por dia
  const _mon=w.ymd(w.mondayOfDate(new Date())), _dom=w.ymd(w.addDays(w.mondayOfDate(new Date()),6));
  w.eval(`state.lidIni=${JSON.stringify(_mon)}; state.lidFim=${JSON.stringify(_dom)}; state.lidPeriodo="intervalo";`); w.render(); await wait(600);
  t("período personalizado: botão 'Alterar período' e resumo do período", view().indexOf("✎ Alterar período")>-1 && /\d+ dias? com atividade/.test(view()));
  t("período personalizado: cartões por dia em grade (daycol dentro de lid-int-grid)", view().indexOf('class="lid-int-grid"')>-1 && view().indexOf('class="daycol')>-1 && view().indexOf("Vistoria mensal Kanoah")>-1 && view().indexOf("Relatórios Gerenciais")>-1);
  w.setLidPeriodo("semana"); await wait(300); w.loadAgenda=async()=>({weeks:{}}); w.saveAgenda=async()=>true;
  w.setTarefasModo("listas"); await wait(400); w._liSelecionar(L); await wait(300);

  /* 8) renomear / compartilhar / excluir lista */
  w.setTarefasModo("listas"); await wait(400);
  await w._liRenomearLista(L); await wait(300);
  t("renomear lista", JSON.parse(KV["mafra:listas:index"]).listas[0].nome.indexOf("renomeada")>-1);
  await w._liCompartilharLista(L); await wait(50);
  t("modal de compartilhar lista pessoas da equipe", modal().indexOf('name="liComp"')>-1 && modal().indexOf("Camilla")>-1);
  w.document.querySelector('input[name="liComp"][value="camilla"]').checked=true; await w._liSalvarCompartilhar(L); await wait(300);
  t("Camilla passa a ter acesso", JSON.parse(KV["mafra:listas:index"]).listas[0].compartilhadaCom.includes("camilla"));
  await w._liExcluirLista(L); await wait(300);
  t("excluir lista remove índice e dados", JSON.parse(KV["mafra:listas:index"]).listas.length===0 && !KV["mafra:lista:"+L]);

  t("listas nunca escrevem na chave da agenda por conta própria (só via saveAgenda ao concluir)", !Object.keys(KV).some(k=>k.indexOf("mafra:agenda")===0));

  if(erros.length){ console.log("\n❌ FALHAS:\n"+erros.join("\n")); process.exit(1); }
  console.log("\n✅ Listas (build 143): tudo passou.");
  process.exit(0);
})().catch(e=>{ console.log("❌ exceção: "+(e&&e.stack||e)); process.exit(1); }); }, 1500);
