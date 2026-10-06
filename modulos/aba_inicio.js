/* ============================================================
   GESTÃO MAFRA — ABA INICIO
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: appEhStandalone, ehIOS, ehAndroid, ehCelular, atualizarBotaoInstalar, instalarApp, mostrarInstrucoesIOS, mostrarInstrucoesAndroid, fecharInstrucoesIOS, fraseDoDia, novaFraseIA, fraseHTML, abrirRelatorioDaNotif, renderInicio, renderDashboardRelatorios, abrirListaStatus, loadComManual, comunicadosNoPeriodo, podePreencherAtend, atendPeriodoRange, renderPainelAtend, irParaEditarAtend, listarRegsDoDia, excluirAtend, ligarSparkTooltip, abrirRegistroAtend, salvarAtend, abrirRegistroComManual, salvarComManual, dadosAtendPeriodo, exportarAtendExcel, exportarAtendPDF */

function appEhStandalone(){
  try{
    return window.matchMedia("(display-mode: standalone)").matches
        || window.navigator.standalone === true;
  }catch(e){ return false; }
}

function ehIOS(){
  const ua = navigator.userAgent || "";
  if(/iPhone|iPad|iPod/i.test(ua)) return true;
  // iPad com iPadOS 13+ se identifica como Mac, mas tem toque
  if(/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true;
  return false;
}

function ehAndroid(){ return /Android/i.test(navigator.userAgent||""); }

function ehCelular(){
  return ehIOS() || ehAndroid() || (navigator.maxTouchPoints>1 && /Mobi|Tablet/i.test(navigator.userAgent||""));
}

function atualizarBotaoInstalar(){
  // pode haver mais de um botão (login + dentro do app) — atualiza todos
  const btns = document.querySelectorAll(".js-btn-instalar");
  if(!btns.length) return;
  // já instalado (rodando como app) -> esconde
  const mostrar = !appEhStandalone() && (deferredInstallPrompt || ehCelular());
  btns.forEach(b=>{ b.style.display = mostrar ? "flex" : "none"; });
}

async function instalarApp(){
  if(deferredInstallPrompt){ // Android/Chrome: 1 toque
    deferredInstallPrompt.prompt();
    try{ await deferredInstallPrompt.userChoice; }catch(e){}
    deferredInstallPrompt = null;
    atualizarBotaoInstalar();
    return;
  }
  if(ehIOS()){ mostrarInstrucoesIOS(); return; }        // iPhone/iPad: manual
  if(ehCelular()){ mostrarInstrucoesAndroid(); return; } // Android e outros: manual
  alert("Para instalar: abra o menu do seu navegador e escolha \"Instalar app\" ou \"Adicionar à tela de início\".");
}

function mostrarInstrucoesIOS(){
  if(document.getElementById("iosInstall")) return;
  const ov=document.createElement("div");
  ov.id="iosInstall"; ov.className="ios-overlay";
  ov.onclick=function(e){ if(e.target===ov) fecharInstrucoesIOS(); };
  ov.innerHTML =
    '<div class="ios-card">'
    + '<h3>📲 Instalar no iPhone/iPad</h3>'
    + '<p>Em poucos toques o Gestão Mafra fica com ícone na tela inicial, igual a um aplicativo.</p>'
    + '<ol>'
    + '<li>Toque no botão <span class="ios-share">Compartilhar ⬆️</span> do Safari (a setinha para cima).</li>'
    + '<li>Role e toque em <b>“Adicionar à Tela de Início”</b>.</li>'
    + '<li>Toque em <b>“Adicionar”</b> no canto superior.</li>'
    + '</ol>'
    + '<button class="btn-primary" onclick="fecharInstrucoesIOS()">Entendi</button>'
    + '<div class="ios-seta">⬇️</div>'
    + '</div>';
  document.body.appendChild(ov);
}

function mostrarInstrucoesAndroid(){
  if(document.getElementById("iosInstall")) return;
  const ov=document.createElement("div");
  ov.id="iosInstall"; ov.className="ios-overlay";
  ov.onclick=function(e){ if(e.target===ov) fecharInstrucoesIOS(); };
  ov.innerHTML =
    '<div class="ios-card">'
    + '<h3>📲 Instalar no celular (Android)</h3>'
    + '<p>Em poucos toques o Gestão Mafra fica com ícone na tela inicial, igual a um aplicativo.</p>'
    + '<ol>'
    + '<li>Toque no <b>menu</b> do navegador (os <b>⋮ três pontinhos</b> no canto, no Chrome).</li>'
    + '<li>Toque em <b>“Instalar app”</b> ou <b>“Adicionar à tela inicial”</b>.</li>'
    + '<li>Confirme em <b>“Instalar”</b> / <b>“Adicionar”</b>.</li>'
    + '</ol>'
    + '<p style="font-size:12.5px;color:#7a8190;margin-top:4px">No Samsung Internet, o menu fica embaixo (☰). No Firefox, toque em ⋮ e em “Instalar”.</p>'
    + '<button class="btn-primary" onclick="fecharInstrucoesIOS()">Entendi</button>'
    + '</div>';
  document.body.appendChild(ov);
}

function fecharInstrucoesIOS(){
  const ov=document.getElementById("iosInstall"); if(ov) ov.remove();
}

function fraseDoDia(){
  // índice determinístico pelo dia do ano: mesma frase o dia todo, muda à meia-noite
  const hoje=new Date();
  const inicio=new Date(hoje.getFullYear(),0,0);
  const diaDoAno=Math.floor((hoje-inicio)/86400000);
  return FRASES_INCENTIVO[diaDoAno % FRASES_INCENTIVO.length];
}

async function novaFraseIA(){
  const box=document.getElementById("fraseBox");
  if(box) box.innerHTML=`<div class="frase-loading">✨ Buscando uma frase para você…</div>`;
  try{
    const prompt="Gere UMA frase curta e inspiradora (máximo 18 palavras) de um empresário, líder ou pensador real e conhecido, sobre foco, metas, disciplina, produtividade ou alcançar objetivos. Use apenas frases verdadeiras e atribuição correta. Responda SOMENTE no formato: FRASE | AUTOR — sem aspas, sem markdown, sem texto extra.";
    const resp=await chamarIA(prompt, 120);
    const partes=resp.split("|");
    const t=(partes[0]||"").trim().replace(/^["“]|["”]$/g,"");
    const a=(partes[1]||"Anônimo").trim();
    if(box && t) box.innerHTML=fraseHTML({t,a});
  }catch(err){
    if(box) box.innerHTML=fraseHTML(fraseDoDia());
  }
}

function fraseHTML(f){
  return `<div class="frase-txt">"${esc(f.t)}"</div><div class="frase-aut">— ${esc(f.a)}<button class="frase-nova" onclick="novaFraseIA()" title="Outra frase">✨</button></div>`;
}

async function abrirRelatorioDaNotif(relId){
  state.tab="relatorios";
  render();
  // dá um instante para a aba renderizar e então abre o relatório
  setTimeout(async ()=>{
    try{
      let d=await loadRelatorios(); // cache primeiro
      let r=(d.list||[]).find(x=>x.id===relId);
      if(!r){ d=await loadRelatorios(true); r=(d.list||[]).find(x=>x.id===relId); }
      if(!r){ return; } // se não achar, fica só na aba de relatórios
      // rascunho ou "ajustes necessários" abre para editar; o resto mostra o PDF
      if(r.status==="rascunho"||r.status==="reprovado"){ abrirEditorRelatorio(r.condominio, r.mesRef, r.id); }
      else { visualizarRelatorioPDF(r.id); }
    }catch(e){}
  }, 250);
}

async function renderInicio(){
  const view=document.getElementById("view");
  try{ agendarAutoteste(); }catch(e){} // 🩺 verificação automática diária, em segundo plano
  const hora=new Date().getHours();
  const saud = hora<12?"Bom dia":hora<18?"Boa tarde":"Boa noite";
  const nome=state.user.nome.split(" ")[0];
  const hoje=ymd(new Date());
  const dataLbl=capit(new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"}));
  const ehGestor=state.user.tipo==="gestor";
  const atalhos = ehGestor
    ? `<button class="ia-card" onclick="setTab('gravacoes')"><span>${ico('gravacoes')}</span><b>Gravações & Atas</b><small>Documentos das reuniões</small></button>
       <button class="ia-card" onclick="setTab('helpdesk')"><span>${ico('helpdesk')}</span><b>Help Condo</b><small>Chamados de manutenção</small></button>
       <button class="ia-card" onclick="setTab('calendario')"><span>${ico('calendario')}</span><b>Calendário</b><small>Agenda</small></button>`
    : `<button class="ia-card" onclick="setTab('tarefas')"><span>${ico('tarefas')}</span><b>Minhas tarefas</b><small>Suas tarefas da semana</small></button>
       <button class="ia-card" onclick="setTab('calendario')"><span>${ico('calendario')}</span><b>Calendário</b><small>Agenda da equipe</small></button>
       <button class="ia-card" onclick="setTab('helpdesk')"><span>${ico('helpdesk')}</span><b>Help Condo</b><small>Chamados de manutenção</small></button>`;
  view.innerHTML=`
    <div class="inicio-hero">
      <div class="ih-saud">${saud}, ${esc(nome)}! 👋</div>
      <div class="ih-data">${dataLbl}</div>
      <div class="frase-card" id="fraseBox">${fraseHTML(fraseDoDia())}</div>
    </div>
    <div id="painelLocalizacao"></div>
    <div id="painelHelpdesk"></div>
    <div id="painelAtend"></div>
    <div id="painelRelatorios"></div>
    <div class="inicio-atalhos">${atalhos}</div>
    <button class="btn-instalar js-btn-instalar" onclick="instalarApp()" style="display:none;margin:18px auto 4px;max-width:340px;width:100%">📲 Instalar app no celular</button>`;
  renderPainelLocalizacao();
  renderCardHelpdesk();
  renderPainelAtend(!podePreencherAtend());
  renderDashboardRelatorios();
  atualizarBotaoInstalar();
}

async function renderDashboardRelatorios(){
  const cont=document.getElementById("painelRelatorios");
  if(!cont) return;
  const ehGestor=state.user.tipo==="gestor";
  const condGestor=ehGestor?(state.user.condominio||""):"";
  const d=await loadRelatorios();
  let lista=(d.list||[]).slice();
  if(ehGestor) lista=lista.filter(r=>gestorCobre(r.condominio));

  // condomínios considerados (gestor: só o dele; demais: todos)
  const condsAlvo = ehGestor ? (condsDoGestor()) : CONDOMINIOS.slice();

  // meses disponíveis (dos relatórios existentes) + o mês de referência atual
  const mesesSet=new Set(lista.map(r=>r.mesRef));
  mesesSet.add(mesAnteriorRef());
  const meses=[...mesesSet].sort().reverse();
  if(!state.dashRelMes || !meses.includes(state.dashRelMes)) state.dashRelMes = meses[0]||mesAnteriorRef();
  const mesSel=state.dashRelMes;

  let enviados, emAnalise, rascunho, pendentes, totalC, pctEnv;

  if(ehGestor){
    // PARA O GESTOR: cada card mostra o TOTAL de meses naquele status (somando todos os meses)
    enviados   = lista.filter(r=>_grupoStatusRel(r.status)==="publicado").length;
    emAnalise  = lista.filter(r=>_grupoStatusRel(r.status)==="analise").length;
    rascunho   = lista.filter(r=>_grupoStatusRel(r.status)==="rascunho").length;
    // pendentes do gestor = meses esperados sem nenhum relatório criado
    const mesesComRel = new Set(lista.map(r=>r.mesRef));
    pendentes = meses.filter(m=>!mesesComRel.has(m)).length;
    totalC = 1; pctEnv = 0;
  } else {
    // EQUIPE: cada card mostra a contagem POR CONDOMÍNIO no mês selecionado
    const doMes = lista.filter(r=>r.mesRef===mesSel);
    const statusPorCond = {};
    condsAlvo.forEach(c=>{ const r=doMes.find(x=>x.condominio===c); statusPorCond[c]=r?_grupoStatusRel(r.status):"pendente"; });
    enviados  = Object.values(statusPorCond).filter(s=>s==="publicado").length;
    emAnalise = Object.values(statusPorCond).filter(s=>s==="analise").length;
    rascunho  = Object.values(statusPorCond).filter(s=>s==="rascunho").length;
    pendentes = Object.values(statusPorCond).filter(s=>s==="pendente").length;
    totalC = condsAlvo.length || 1;
    pctEnv = Math.round(enviados/totalC*100);
  }

  let html=`<div class="dash-rel">
    <div class="dash-rel-head">
      <div><h3 style="margin:0">${icoH('relatorios')} Relatórios Gerenciais</h3>
        <div class="atend-range">${ehGestor?esc(condGestor||"Seu condomínio")+" · clique num card para ver os meses":"Clique num card para ver os condomínios"}</div></div>
      <div class="spacer"></div>
      ${ehGestor?"":`<select class="gv-busca" style="font-weight:600;max-width:170px" onchange="state.dashRelMes=this.value;renderDashboardRelatorios()">
        ${meses.map(m=>`<option value="${m}" ${m===mesSel?"selected":""}>${mesRefLabel(m)}</option>`).join("")}
      </select>`}
    </div>`;

  // cards clicáveis (cada um abre modal com a lista do status correspondente)
  html+=`<div class="dash-rel-cards">
    <div class="drc clickable" style="--c:#2F9E44" onclick="abrirListaStatus('publicado')"><div class="drc-v">${enviados}</div><div class="drc-l">Enviados</div></div>
    <div class="drc clickable" style="--c:#E08A1E" onclick="abrirListaStatus('enviado_julia')"><div class="drc-v">${emAnalise}</div><div class="drc-l">Em análise</div></div>
    <div class="drc clickable" style="--c:#8A8F98" onclick="abrirListaStatus('rascunho')"><div class="drc-v">${rascunho}</div><div class="drc-l">Rascunho</div></div>
    <div class="drc clickable" style="--c:#C0392B" onclick="abrirListaStatus('pendente')"><div class="drc-v">${pendentes}</div><div class="drc-l">Pendentes</div></div>
  </div>`;

  // barra de progresso só para a equipe (no mês selecionado)
  if(!ehGestor){
    html+=`<div class="dash-rel-prog"><div class="drp-track"><div class="drp-fill" style="width:${pctEnv}%"></div></div>
      <div class="drp-cap">${enviados} de ${totalC} condomínios enviaram o relatório de ${mesRefLabel(mesSel)} (${pctEnv}%)</div></div>`;
  }

  // atalho para a aba completa
  html+=`<button class="btn-ghost" style="width:100%;margin-top:8px" onclick="setTab('relatorios')">Ver todos os relatórios →</button>`;
  html+=`</div>`;
  cont.innerHTML=html;
}

async function abrirListaStatus(status){
  const ehGestor=state.user.tipo==="gestor";
  const condGestor=ehGestor?(state.user.condominio||""):"";
  const d=await loadRelatorios(); // leitura: usa o cache (abre na hora)
  let lista=(d.list||[]).slice();
  if(ehGestor) lista=lista.filter(r=>gestorCobre(r.condominio));

  const stLbl={publicado:"Enviados",enviado_julia:"Em análise",rascunho:"Rascunho",pendente:"Pendentes"}[status];
  const stCls={publicado:"st-ok",enviado_julia:"st-warn",rascunho:"st-draft",pendente:"st-pend"}[status];
  const stIc={publicado:"✅",enviado_julia:"⏳",rascunho:"📝",pendente:"⚠️"}[status];
  // o card "Em análise" agrupa em aprovação + aprovado; "Rascunho" inclui os devolvidos p/ ajustes
  const grupoAlvo = status==="enviado_julia" ? "analise" : status;
  const casaStatus = r => _grupoStatusRel(r.status)===grupoAlvo;

  let itensHTML="";
  if(ehGestor){
    // gestor: mostra os MESES dele naquele status
    if(status==="pendente"){
      // meses esperados sem relatório
      const mesesSet=new Set(lista.map(r=>r.mesRef));
      mesesSet.add(mesAnteriorRef());
      const meses=[...mesesSet].sort().reverse();
      const mesesComRel=new Set(lista.map(r=>r.mesRef));
      const pendMeses=meses.filter(m=>!mesesComRel.has(m));
      if(!pendMeses.length){
        itensHTML=`<div class="atend-hint" style="margin:0">Nenhum mês pendente. 🎉</div>`;
      } else {
        itensHTML=pendMeses.map(m=>`<div class="dash-rel-row" onclick="closeModal();novoRelatorioGestor()">
          <div class="drr-cond">${mesRefLabel(m)}</div>
          <span class="drr-status ${stCls}">${stLbl}</span>
        </div>`).join("");
      }
    } else {
      const meses=lista.filter(casaStatus).sort((a,b)=>a.mesRef<b.mesRef?1:-1);
      if(!meses.length){
        itensHTML=`<div class="atend-hint" style="margin:0">Nenhum relatório nesse status.</div>`;
      } else {
        itensHTML=meses.map(r=>`<div class="dash-rel-row" onclick="closeModal();abrirRelatorioDaNotif('${r.id}')">
          <div class="drr-cond">${mesRefLabel(r.mesRef)}</div>
          <span class="drr-status ${stCls}">${statusRelLabel(r.status)}</span>
        </div>`).join("");
      }
    }
  } else {
    // equipe: mostra os CONDOMÍNIOS naquele status no mês selecionado
    const mesSel=state.dashRelMes||mesAnteriorRef();
    const doMes=lista.filter(r=>r.mesRef===mesSel);
    if(status==="pendente"){
      // condomínios sem relatório no mês
      const comRel=new Set(doMes.map(r=>r.condominio));
      const condsPend=CONDOMINIOS.filter(c=>!comRel.has(c));
      if(!condsPend.length){
        itensHTML=`<div class="atend-hint" style="margin:0">Nenhum condomínio pendente neste mês. 🎉</div>`;
      } else {
        itensHTML=condsPend.map(c=>`<div class="dash-rel-row">
          <div class="drr-cond">${esc(c)}</div>
          <span class="drr-status ${stCls}">${stLbl}</span>
        </div>`).join("");
      }
    } else {
      const filtrados=doMes.filter(casaStatus).sort((a,b)=>a.condominio.localeCompare(b.condominio));
      if(!filtrados.length){
        itensHTML=`<div class="atend-hint" style="margin:0">Nenhum condomínio nesse status no mês selecionado.</div>`;
      } else {
        itensHTML=filtrados.map(r=>`<div class="dash-rel-row" onclick="closeModal();abrirRelatorioDaNotif('${r.id}')">
          <div class="drr-cond">${esc(r.condominio)}</div>
          <span class="drr-status ${stCls}">${statusRelLabel(r.status)}</span>
        </div>`).join("");
      }
    }
  }
  const mesAtual=state.dashRelMes||mesAnteriorRef();
  const sub=ehGestor?(condGestor||"Seu condomínio")+" · todos os meses":mesRefLabel(mesAtual);
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:480px">
    <div class="modal-head"><h3>${stIc} ${stLbl}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="book-sub" style="margin-top:0">${sub}</div>
      <div class="dash-rel-list" style="margin-top:8px">${itensHTML}</div>
      <div class="modal-foot" style="margin-top:14px"><button class="btn-cancel" style="flex:1" onclick="closeModal()">Fechar</button></div>
    </div></div></div>`;
}

async function loadComManual(){ try{ const v=await storeGet("mafra:comunicados_manual"); if(v)return JSON.parse(v); }catch(e){} return {registros:[]}; }

async function comunicadosNoPeriodo(ini, fim){
  const porCond={}; let total=0;
  // 1) automático: comunicados marcados como enviados no app
  let lista=[];
  try{ const d=await loadComunicados(); lista=d.list||[]; }catch(e){}
  lista.forEach(c=>{
    if(!c.enviadoEm) return;
    const dia=ymd(new Date(c.enviadoEm));
    if(dia<ini || dia>fim) return;
    const cond=c.condominio||"(Geral)";
    porCond[cond]=(porCond[cond]||0)+1; total++;
  });
  // 2) manual: registros que a Julia adiciona (comunicados enviados por fora do app)
  try{
    const m=await loadComManual();
    (m.registros||[]).forEach(r=>{
      if(r.data<ini || r.data>fim) return;
      const cond=r.cond||"(Geral)"; const q=parseInt(r.qtd||0,10)||0;
      porCond[cond]=(porCond[cond]||0)+q; total+=q;
    });
  }catch(e){}
  return {porCond, total};
}

function podePreencherAtend(){ return state.userId==="julia" || state.user.tipo==="master"; }

function atendPeriodoRange(per, refDs){
  if(per==="custom"){ var _ci=(typeof state!=="undefined"&&state.atendIni)||ymd(new Date()), _cf=(typeof state!=="undefined"&&state.atendFim)||ymd(new Date()); if(_cf<_ci){ var _t=_ci; _ci=_cf; _cf=_t; } return {ini:_ci, fim:_cf}; }
  const ref=new Date((refDs||ymd(new Date()))+"T00:00:00");
  let ini=new Date(ref), fim=new Date(ref);
  if(per==="semana"){ ini=mondayOfDate(ref); fim=new Date(ini); fim.setDate(fim.getDate()+6); }
  else if(per==="mes"){ ini=new Date(ref.getFullYear(),ref.getMonth(),1); fim=new Date(ref.getFullYear(),ref.getMonth()+1,0); }
  else if(per==="trimestre"){ const q=Math.floor(ref.getMonth()/3); ini=new Date(ref.getFullYear(),q*3,1); fim=new Date(ref.getFullYear(),q*3+3,0); }
  else if(per==="semestre"){ const h=ref.getMonth()<6?0:6; ini=new Date(ref.getFullYear(),h,1); fim=new Date(ref.getFullYear(),h+6,0); }
  else if(per==="ano"){ ini=new Date(ref.getFullYear(),0,1); fim=new Date(ref.getFullYear(),11,31); }
  return {ini:ymd(ini), fim:ymd(fim)};
}

async function renderPainelAtend(soLeitura){
  const cont=document.getElementById("painelAtend");
  if(!cont) return;
  const podeEditar = !soLeitura && podePreencherAtend();
  if(!state.atendPer) state.atendPer="mes";
  if(!state.atendRef) state.atendRef=ymd(new Date());
  if(!state.atendIni||!state.atendFim){ const _mr=atendPeriodoRange("mes",state.atendRef); if(!state.atendIni) state.atendIni=_mr.ini; if(!state.atendFim) state.atendFim=_mr.fim; }
  if(!state.atendCanal) state.atendCanal=""; // "" = geral (todos os canais)
  const canalSel=state.atendCanal;
  const sl=soLeitura?"true":"false";
  const d=await loadAtend();
  const regs=d.registros||[];
  const {ini,fim}=atendPeriodoRange(state.atendPer, state.atendRef);
  const noPer=regs.filter(r=>r.data>=ini && r.data<=fim);
  const tot={wa:0,em:0,li:0,qr:0};
  noPer.forEach(r=>{ tot.wa+=r.wa||0; tot.em+=r.em||0; tot.li+=r.li||0; tot.qr+=r.qr||0; });
  const totalGeral=tot.wa+tot.em+tot.li+tot.qr;
  const porCond={};
  noPer.forEach(r=>{ if(r.cond){ porCond[r.cond]=(porCond[r.cond]||0)+(r.wa||0)+(r.em||0)+(r.li||0)+(r.qr||0); } });
  const condRank=Object.entries(porCond).sort((a,b)=>b[1]-a[1]);
  const ehGestor=state.user.tipo==="gestor";
  const condGestor=ehGestor?(state.user.condominio||""):"";
  const qtdGestor=condGestor?(porCond[condGestor]||0):0;
  const pctGestor=totalGeral?Math.round(qtdGestor/totalGeral*100):0;
  const perLbl=ATEND_PERIODOS.find(p=>p[0]===state.atendPer)[1];
  const fmtBr=s=>s.split("-").reverse().join("/");
  let html=`<div class="atend-painel">
    <div class="atend-head">
      <div><h3 style="margin:0">${icoH('metricas')} Atendimentos</h3><div class="atend-range">${fmtBr(ini)} a ${fmtBr(fim)}</div></div>
      <div class="spacer"></div>
      <button class="btn-ghost" style="padding:7px 12px;font-size:12.5px" onclick="exportarAtendExcel()" title="Exportar para Excel (CSV)">⬇ Excel</button>
      <button class="btn-ghost" style="padding:7px 12px;font-size:12.5px" onclick="exportarAtendPDF()" title="Exportar relatório em PDF">⬇ PDF</button>
      ${podeEditar?`<button class="btn-ghost" style="padding:7px 12px;font-size:12.5px" onclick="irParaEditarAtend()" title="Editar registros já lançados">✎ Editar</button>`:""}
      ${podeEditar?`<button class="btn-gold" onclick="abrirRegistroAtend()">＋ Registrar atendimento</button>`:""}
    </div>
    <div class="atend-pertabs">
      ${ATEND_PERIODOS.map(p=>`<button class="atend-pertab ${state.atendPer===p[0]?'on':''}" onclick="state.atendPer='${p[0]}';renderPainelAtend(${soLeitura?"true":"false"})">${p[1]}</button>`).join("")}
      <span style="flex:1"></span>
      ${state.atendPer==="custom" ? "" : `<input type="date" class="hoje-date" value="${state.atendRef}" onchange="state.atendRef=this.value;renderPainelAtend(${sl})">`}
    </div>
    ${state.atendPer==="custom" ? `<div class="atend-customrange" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:#f4f6f9;border:1px solid var(--line,#e6eaf0);border-radius:11px;padding:11px 15px;margin:2px 0 16px"><span style="font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--muted)">Período personalizado</span><label style="font-size:12.5px;color:#17253f;font-weight:700;display:inline-flex;align-items:center;gap:7px">Data início<input type="date" class="hoje-date" value="${state.atendIni}" onchange="state.atendIni=this.value;renderPainelAtend(${sl})"></label><span style="color:var(--muted);font-weight:700">→</span><label style="font-size:12.5px;color:#17253f;font-weight:700;display:inline-flex;align-items:center;gap:7px">Data final<input type="date" class="hoje-date" value="${state.atendFim}" onchange="state.atendFim=this.value;renderPainelAtend(${sl})"></label></div>` : ""}
    <div class="atend-cards">
      <div class="atend-card big ${canalSel===''?'sel':''}" onclick="state.atendCanal='';renderPainelAtend(${sl})"><div class="ac-v">${totalGeral}</div><div class="ac-l">Total no ${state.atendPer==="custom"?"período":perLbl.toLowerCase()}</div></div>
      ${CANAIS.map(c=>`<div class="atend-card ${canalSel===c[0]?'sel':''}" style="${canalSel===c[0]?'border-color:'+c[2]:''}" onclick="state.atendCanal='${c[0]}';renderPainelAtend(${sl})"><div class="ac-v" style="color:${c[2]}">${tot[c[0]]}</div><div class="ac-l">${c[1]}</div></div>`).join("")}
    </div>`;
  // título do foco atual
  const canalInfo = canalSel ? CANAIS.find(c=>c[0]===canalSel) : null;
  const focoLbl = canalInfo ? canalInfo[1] : "Todos os canais";
  // função para somar conforme o canal selecionado (ou todos)
  const valDe = r => canalSel ? (r[canalSel]||0) : ((r.wa||0)+(r.em||0)+(r.li||0)+(r.qr||0));
  if(!canalSel){
    // visão GERAL: demanda por canal
    const maxCanal=Math.max(1,...CANAIS.map(c=>tot[c[0]]));
    html+=`<div class="atend-graf">
      <div class="ag-titulo">Demanda por canal</div>
      ${CANAIS.map(c=>{
        const v=tot[c[0]]; const pct=Math.round(v/maxCanal*100);
        const pctTot=totalGeral?Math.round(v/totalGeral*100):0;
        return `<div class="ag-row"><div class="ag-lbl">${c[1]}</div>
          <div class="ag-bar-wrap"><div class="ag-bar" style="width:${pct}%;background:${c[2]}"></div></div>
          <div class="ag-val">${v} <small>(${pctTot}%)</small></div></div>`;
      }).join("")}
    </div>`;
  } else {
    // visão INDIVIDUAL: foco num canal só
    const totalCanal=tot[canalSel];
    html+=`<div class="atend-graf">
      <div class="ag-titulo" style="color:${canalInfo[2]}">📌 Foco: ${focoLbl} <button class="btn-ghost" style="margin-left:auto;padding:4px 12px;font-size:12px" onclick="state.atendCanal='';renderPainelAtend(${sl})">↩ Ver geral</button></div>
      <div class="gestor-comp">
        <div class="gc-card"><div class="gc-v" style="color:${canalInfo[2]}">${totalCanal}</div><div class="gc-l">${focoLbl} no ${perLbl.toLowerCase()}</div></div>
        <div class="gc-card"><div class="gc-v" style="color:${canalInfo[2]}">${totalGeral?Math.round(totalCanal/totalGeral*100):0}%</div><div class="gc-l">do total de atendimentos</div></div>
      </div>
    </div>`;
  }
  if(ehGestor){
    // gestor: vê só o comparativo do PRÓPRIO condomínio (não vê os outros)
    html+=`<div class="atend-graf">
      <div class="ag-titulo">${icoH('predio')} Seu condomínio${condGestor?": "+esc(condGestor):""}</div>
      <div class="gestor-comp">
        <div class="gc-card"><div class="gc-v">${qtdGestor}</div><div class="gc-l">atendimentos no ${perLbl.toLowerCase()}</div></div>
        <div class="gc-card"><div class="gc-v">${pctGestor}%</div><div class="gc-l">do total geral (${totalGeral})</div></div>
      </div>
      <div class="ag-row" style="margin-top:10px"><div class="ag-lbl">Seu condomínio</div>
        <div class="ag-bar-wrap"><div class="ag-bar" style="width:${pctGestor}%;background:var(--gold,#C9A24B)"></div></div>
        <div class="ag-val">${pctGestor}%</div></div>
      ${qtdGestor===0?`<div class="atend-hint" style="margin-top:10px">Ainda não há atendimentos registrados com o seu condomínio neste período.</div>`:""}
    </div>`;
  } else if(condRank.length){
    const maxC=condRank[0][1];
    html+=`<div class="atend-graf">
      <div class="ag-titulo">${icoH('predio')} Condomínios com mais demanda</div>
      ${condRank.slice(0,8).map(([nome,v])=>{
        const pct=Math.round(v/maxC*100);
        return `<div class="ag-row"><div class="ag-lbl">${esc(nome)}</div>
          <div class="ag-bar-wrap"><div class="ag-bar" style="width:${pct}%;background:var(--navy2,#16243D)"></div></div>
          <div class="ag-val">${v}</div></div>`;
      }).join("")}
    </div>`;
  } else {
    html+=`<div class="atend-hint">💡 Dica: ao registrar, escolha o condomínio para ver aqui o ranking de quais têm mais demanda.</div>`;
  }
  // ===== COMUNICADOS ENVIADOS (automático, vem dos comunicados marcados como enviados) =====
  const com=await comunicadosNoPeriodo(ini,fim);
  if(ehGestor){
    const meu=com.porCond[condGestor]||0;
    const pctC=com.total?Math.round(meu/com.total*100):0;
    html+=`<div class="atend-graf">
      <div class="ag-titulo">${icoH('comunicados')} Comunicados enviados${condGestor?" · "+esc(condGestor):""}</div>
      <div class="gestor-comp">
        <div class="gc-card"><div class="gc-v">${meu}</div><div class="gc-l">comunicados no ${perLbl.toLowerCase()}</div></div>
        <div class="gc-card"><div class="gc-v">${pctC}%</div><div class="gc-l">do total geral (${com.total})</div></div>
      </div>
      ${meu===0?`<div class="atend-hint" style="margin-top:10px">Nenhum comunicado enviado para o seu condomínio neste período.</div>`:""}
    </div>`;
  } else {
    const rankCom=Object.entries(com.porCond).sort((a,b)=>b[1]-a[1]);
    if(rankCom.length){
      const maxCom=rankCom[0][1];
      html+=`<div class="atend-graf">
        <div class="ag-titulo" style="display:flex;align-items:center;gap:8px">${icoH('comunicados')} Comunicados enviados por condomínio <small style="font-weight:600;color:var(--muted)">(total: ${com.total})</small>
          ${podeEditar?`<button class="btn-ghost" style="margin-left:auto;padding:5px 12px;font-size:12px" onclick="abrirRegistroComManual()">＋ Registrar manual</button>`:""}</div>
        ${rankCom.slice(0,10).map(([nome,v])=>{
          const pct=Math.round(v/maxCom*100);
          return `<div class="ag-row"><div class="ag-lbl">${esc(nome)}</div>
            <div class="ag-bar-wrap"><div class="ag-bar" style="width:${pct}%;background:#8A5BD6"></div></div>
            <div class="ag-val">${v}</div></div>`;
        }).join("")}
      </div>`;
    } else {
      html+=`<div class="atend-graf"><div class="ag-titulo" style="display:flex;align-items:center;gap:8px">${icoH('comunicados')} Comunicados enviados
        ${podeEditar?`<button class="btn-ghost" style="margin-left:auto;padding:5px 12px;font-size:12px" onclick="abrirRegistroComManual()">＋ Registrar manual</button>`:""}</div>
        <div class="atend-hint">Os comunicados aparecem aqui automaticamente conforme são marcados como "Enviado" — ou registre manualmente os enviados por fora do app.</div></div>`;
    }
  }
  if(noPer.length>1 && state.atendPer!=="dia"){
    const ordenado=[...noPer].sort((a,b)=>a.data<b.data?-1:1);
    const maxDia=Math.max(1,...ordenado.map(valDe));
    const cor=canalInfo?canalInfo[2]:"var(--gold,#C9A24B)";
    html+=`<div class="atend-graf"><div class="ag-titulo">Evolução no período${canalSel?" · "+focoLbl:""}</div>
      <div class="atend-spark" id="atendSpark">${ordenado.map(r=>{
        const v=valDe(r); const h=Math.round(v/maxDia*100);
        const dataFull=new Date(r.data+"T00:00:00").toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"short"});
        return `<div class="sp-col" data-data="${capit(dataFull)}" data-val="${v}"><div class="sp-bar" style="height:${h}%;background:${cor}"></div></div>`;
      }).join("")}<div class="sp-tip" id="spTip"></div></div>
      <div class="atend-spark-lbl"><span>${fmtBr(ordenado[0].data)}</span><span>${fmtBr(ordenado[ordenado.length-1].data)}</span></div>
    </div>`;
  }
  // gráfico de barras por MÊS (respeita o canal selecionado)
  const MESES=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const anoRef=(state.atendRef||ymd(new Date())).slice(0,4);
  const porMes={};
  regs.filter(r=>r.data.slice(0,4)===anoRef).forEach(r=>{
    const mi=parseInt(r.data.slice(5,7),10)-1;
    porMes[mi]=(porMes[mi]||0)+valDe(r);
  });
  const mesesComDado=Object.keys(porMes).length;
  if(mesesComDado>0){
    const maxMes=Math.max(1,...Object.values(porMes));
    html+=`<div class="atend-graf"><div class="ag-titulo">${icoH('metricas')} ${canalSel?focoLbl:"Atendimentos"} por mês · ${anoRef}</div>
      <div class="atend-meses">
        ${MESES.map((nome,i)=>{
          const v=porMes[i]||0; const h=v?Math.max(6,Math.round(v/maxMes*100)):0;
          return `<div class="mes-col" title="${nome}: ${v}">
            <div class="mes-val">${v||""}</div>
            <div class="mes-bar-wrap"><div class="mes-bar" style="height:${h}%${canalInfo?';background:'+canalInfo[2]:''}"></div></div>
            <div class="mes-lbl">${nome}</div></div>`;
        }).join("")}
      </div>
    </div>`;
  }
  html+=`</div>`;
  cont.innerHTML=html;
  ligarSparkTooltip();
}

async function irParaEditarAtend(){
  const d=await loadAtend();
  const regs=(d.registros||[]).slice().sort((a,b)=>a.data<b.data?1:-1);
  if(!regs.length){ alert("Ainda não há atendimentos registrados para editar."); return; }
  const ultimaData=regs[0].data;
  const inp='width:100%;padding:11px 13px;border:1.5px solid var(--line);border-radius:10px;background:#FCFBF8;font-size:16px';
  const lbl='display:block;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px';
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:420px">
    <div class="modal-head"><h3>✎ Editar atendimento</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">Escolha o dia que você quer corrigir:</p>
      <div class="field"><label style="${lbl}">Data do registro</label>
        <input id="edAtData" type="date" value="${ultimaData}" style="${inp}" onchange="listarRegsDoDia(this.value)">
      </div>
      <div id="edAtLista" style="margin-top:10px"></div>
      <div class="modal-foot" style="margin-top:14px"><button class="btn-cancel" style="flex:1" onclick="closeModal()">Fechar</button></div>
    </div></div></div>`;
  listarRegsDoDia(ultimaData);
}

async function listarRegsDoDia(data){
  const cont=document.getElementById("edAtLista"); if(!cont) return;
  const d=await loadAtend();
  const doDia=(d.registros||[]).filter(r=>r.data===data);
  if(!doDia.length){
    cont.innerHTML=`<div class="atend-hint" style="margin:0">Nenhum registro neste dia. Para incluir, feche e use "＋ Registrar atendimento".</div>`;
    return;
  }
  cont.innerHTML=`<div style="font-size:11.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Registros desse dia:</div>
    <div class="atend-edit-list">${doDia.map(r=>{
      const totR=(r.wa||0)+(r.em||0)+(r.li||0)+(r.qr||0);
      return `<div class="aedit-row" onclick="closeModal();abrirRegistroAtend('${r.id}')">
        <div class="aedit-data">${r.cond?`${ico('predio')} ${esc(r.cond)}`:"Geral (sem condomínio)"}</div>
        <div class="aedit-nums">📱${r.wa||0} · ✉️${r.em||0} · 📞${r.li||0} · 🔳${r.qr||0}</div>
        <div class="aedit-tot">${totR}</div>
        <div class="aedit-acts">
          <button class="icon-btn" title="Editar" onclick="event.stopPropagation();closeModal();abrirRegistroAtend('${r.id}')">✎</button>
          <button class="icon-btn" title="Excluir" onclick="event.stopPropagation();excluirAtend('${r.id}');listarRegsDoDia('${data}')">🗑</button>
        </div>
      </div>`;
    }).join("")}</div>`;
}

async function excluirAtend(id){
  if(!confirm("Excluir este registro de atendimento?")) return;
  const d=await loadAtend(); if(!d.registros) return;
  d.registros=d.registros.filter(r=>r.id!==id);
  await saveAtend(d);
  renderPainelAtend(!podePreencherAtend());
}

function ligarSparkTooltip(){
  const spark=document.getElementById("atendSpark"); const tip=document.getElementById("spTip");
  if(!spark||!tip) return;
  function mostra(col){
    if(!col||!col.classList.contains("sp-col")) return;
    tip.innerHTML=`<b>${col.dataset.data}</b><br>${col.dataset.val} atendimento${col.dataset.val==="1"?"":"s"}`;
    tip.style.display="block";
    // posiciona o tooltip acima da coluna
    const sr=spark.getBoundingClientRect(), cr=col.getBoundingClientRect();
    let left=cr.left-sr.left+cr.width/2;
    tip.style.left=left+"px";
    // ajusta se sair pela borda
    const tw=tip.offsetWidth;
    if(left-tw/2<0) tip.style.transform="translateX(0)";
    else if(left+tw/2>sr.width) tip.style.transform="translateX(-100%)";
    else tip.style.transform="translateX(-50%)";
  }
  function esconde(){ tip.style.display="none"; }
  spark.querySelectorAll(".sp-col").forEach(col=>{
    col.addEventListener("mouseenter",()=>mostra(col));
    col.addEventListener("mouseleave",esconde);
    col.addEventListener("touchstart",(e)=>{ mostra(col); },{passive:true});
  });
  spark.addEventListener("mouseleave",esconde);
}

async function abrirRegistroAtend(id){
  const hoje=ymd(new Date());
  const inp='width:100%;padding:11px 13px;border:1.5px solid var(--line);border-radius:10px;background:#FCFBF8;font-size:16px';
  const lbl='display:block;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px';
  const condOpts=condOptionsAgrupadas();
  // se veio id, é edição: carrega o registro existente
  let reg=null;
  if(id){ const d=await loadAtend(); reg=(d.registros||[]).find(r=>r.id===id)||null; }
  const v=reg||{data:hoje,wa:0,em:0,li:0,qr:0,cond:""};
  const titulo = reg ? "✎ Editar atendimento" : "＋ Registrar atendimento";
  const aviso = reg ? `<p class="book-sub" style="margin-top:0">Ajuste as quantidades deste registro. Os valores substituem os anteriores.</p>`
                    : `<p class="book-sub" style="margin-top:0">Se já houver registro nesta data e condomínio, as quantidades serão somadas.</p>`;
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:440px">
    <div class="modal-head"><h3>${titulo}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      ${aviso}
      <div class="field"><label style="${lbl}">Data</label><input id="atData" type="date" value="${v.data}" style="${inp}"></div>
      <div class="atend-grid">
        <div class="field"><label style="${lbl}">WhatsApp</label><input id="atWa" type="number" min="0" value="${v.wa||0}" style="${inp}"></div>
        <div class="field"><label style="${lbl}">E-mails</label><input id="atEm" type="number" min="0" value="${v.em||0}" style="${inp}"></div>
        <div class="field"><label style="${lbl}">Ligações</label><input id="atLi" type="number" min="0" value="${v.li||0}" style="${inp}"></div>
        <div class="field"><label style="${lbl}">QRCode</label><input id="atQr" type="number" min="0" value="${v.qr||0}" style="${inp}"></div>
      </div>
      <div class="field"><label style="${lbl}">Condomínio (opcional)</label><select id="atCond" style="${inp}"><option value="">— Geral (sem condomínio) —</option>${condOpts}</select></div>
      <div class="modal-foot"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-primary" style="flex:1" onclick="salvarAtend(${reg?`'${reg.id}'`:''})">${reg?"Salvar alterações":"Salvar"}</button></div>
    </div></div></div>`;
  if(reg) document.getElementById("atCond").value=reg.cond||"";
}

async function salvarAtend(id){
  const data=document.getElementById("atData").value;
  if(!data){ alert("Informe a data."); return; }
  const wa=parseInt(document.getElementById("atWa").value||0,10);
  const em=parseInt(document.getElementById("atEm").value||0,10);
  const li=parseInt(document.getElementById("atLi").value||0,10);
  const qr=parseInt(document.getElementById("atQr").value||0,10);
  const cond=document.getElementById("atCond").value||"";
  if(wa+em+li+qr===0){ alert("Informe ao menos um atendimento."); return; }
  const d=await loadAtend(); if(!d.registros)d.registros=[];
  if(id){
    // EDIÇÃO: substitui as quantidades do registro existente
    const r=d.registros.find(x=>x.id===id);
    if(r){ r.data=data; r.wa=wa; r.em=em; r.li=li; r.qr=qr; r.cond=cond; }
  } else {
    const existente=d.registros.find(r=>r.data===data && (r.cond||"")===cond);
    if(existente){ existente.wa=(existente.wa||0)+wa; existente.em=(existente.em||0)+em; existente.li=(existente.li||0)+li; existente.qr=(existente.qr||0)+qr; }
    else d.registros.push({id:"at"+Date.now()+Math.random().toString(36).slice(2,5),data,wa,em,li,qr,cond});
  }
  await saveAtend(d);
  closeModal(); renderPainelAtend(!podePreencherAtend());
}

function abrirRegistroComManual(){
  const hoje=ymd(new Date());
  const inp='width:100%;padding:11px 13px;border:1.5px solid var(--line);border-radius:10px;background:#FCFBF8;font-size:15px';
  const lbl='display:block;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px';
  const condOpts=condOptionsAgrupadas();
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:420px">
    <div class="modal-head"><h3>📣 Registrar comunicado (manual)</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">Use para comunicados enviados por fora do app. Os enviados pelo app já são contados automaticamente.</p>
      <div class="field"><label style="${lbl}">Data</label><input id="cmData" type="date" value="${hoje}" style="${inp}"></div>
      <div class="field"><label style="${lbl}">Condomínio</label><select id="cmCond" style="${inp}"><option value="">— Geral —</option>${condOpts}</select></div>
      <div class="field"><label style="${lbl}">Quantidade de comunicados</label><input id="cmQtd" type="number" min="1" value="1" style="${inp}"></div>
      <div class="modal-foot"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-primary" style="flex:1" onclick="salvarComManual()">Salvar</button></div>
    </div></div></div>`;
}

async function salvarComManual(){
  const data=document.getElementById("cmData").value;
  const cond=document.getElementById("cmCond").value||"";
  const qtd=parseInt(document.getElementById("cmQtd").value||0,10);
  if(!data){ alert("Informe a data."); return; }
  if(!(qtd>0)){ alert("Informe a quantidade."); return; }
  const m=await loadComManual(); if(!m.registros)m.registros=[];
  m.registros.push({id:"cm"+Date.now()+Math.random().toString(36).slice(2,5),data,cond,qtd});
  await saveComManual(m);
  closeModal(); renderPainelAtend(!podePreencherAtend());
}

async function dadosAtendPeriodo(){
  const d=await loadAtend();
  const regs=d.registros||[];
  const {ini,fim}=atendPeriodoRange(state.atendPer, state.atendRef);
  const noPer=regs.filter(r=>r.data>=ini && r.data<=fim).sort((a,b)=>a.data<b.data?-1:1);
  const com=await comunicadosNoPeriodo(ini,fim);
  return {ini,fim,noPer,com};
}

function exportarAtendExcel(){
  dadosAtendPeriodo().then(({ini,fim,noPer,com})=>{
    const perLbl=ATEND_PERIODOS.find(p=>p[0]===state.atendPer)[1];
    // CSV com BOM (acentos no Excel) e ; como separador (padrão BR)
    let linhas=[];
    linhas.push(`Relatório de Atendimentos - Mafra Gestão`);
    linhas.push(`Período (${perLbl});${ini.split("-").reverse().join("/")} a ${fim.split("-").reverse().join("/")}`);
    linhas.push("");
    linhas.push(["Data","WhatsApp","E-mails","Ligações","QRCode","Condomínio","Total"].join(";"));
    const tot={wa:0,em:0,li:0,qr:0};
    noPer.forEach(r=>{
      const t=(r.wa||0)+(r.em||0)+(r.li||0)+(r.qr||0);
      tot.wa+=r.wa||0; tot.em+=r.em||0; tot.li+=r.li||0; tot.qr+=r.qr||0;
      linhas.push([r.data.split("-").reverse().join("/"),r.wa||0,r.em||0,r.li||0,r.qr||0,(r.cond||"Geral"),t].join(";"));
    });
    const totalGeral=tot.wa+tot.em+tot.li+tot.qr;
    linhas.push(["TOTAL",tot.wa,tot.em,tot.li,tot.qr,"",totalGeral].join(";"));
    linhas.push("");
    // comunicados por condomínio
    linhas.push("Comunicados enviados por condomínio");
    linhas.push(["Condomínio","Quantidade"].join(";"));
    Object.entries(com.porCond).sort((a,b)=>b[1]-a[1]).forEach(([nome,v])=>linhas.push([nome,v].join(";")));
    linhas.push(["TOTAL",com.total].join(";"));
    const csv="\uFEFF"+linhas.join("\r\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download=`atendimentos_${ini}_a_${fim}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
}

function exportarAtendPDF(){
  dadosAtendPeriodo().then(({ini,fim,noPer,com})=>{
    const perLbl=ATEND_PERIODOS.find(p=>p[0]===state.atendPer)[1];
    const fmtBr=s=>s.split("-").reverse().join("/");
    const tot={wa:0,em:0,li:0,qr:0};
    noPer.forEach(r=>{ tot.wa+=r.wa||0; tot.em+=r.em||0; tot.li+=r.li||0; tot.qr+=r.qr||0; });
    const totalGeral=tot.wa+tot.em+tot.li+tot.qr;
    const linhasTabela=noPer.map(r=>{
      const t=(r.wa||0)+(r.em||0)+(r.li||0)+(r.qr||0);
      return `<tr><td>${fmtBr(r.data)}</td><td>${r.wa||0}</td><td>${r.em||0}</td><td>${r.li||0}</td><td>${r.qr||0}</td><td>${esc(r.cond||"Geral")}</td><td><b>${t}</b></td></tr>`;
    }).join("");
    const rankCom=Object.entries(com.porCond).sort((a,b)=>b[1]-a[1])
      .map(([nome,v])=>`<tr><td>${esc(nome)}</td><td>${v}</td></tr>`).join("");
    const win=window.open("","_blank");
    if(!win){ alert("Permita pop-ups para gerar o PDF, ou use o Excel."); return; }
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Relatório de Atendimentos</title>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important}
        body{font-family:'Montserrat',Arial,sans-serif;color:#16243D;padding:32px;max-width:820px;margin:0 auto}
        h1{font-size:21px;font-weight:800;margin:0 0 4px;color:#16243D}
        .sub{color:#666;font-size:13px;margin-bottom:20px}
        .cards{display:flex;gap:10px;margin:18px 0}
        .card{flex:1;border:1px solid #ddd;border-radius:10px;padding:14px;text-align:center;border-top:3px solid #C9A24B}
        .card .v{font-size:24px;font-weight:800;color:#1f3354}
        .card .l{font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.3px}
        h2{font-size:15px;font-weight:700;margin:24px 0 8px;border-bottom:2px solid #C9A24B;padding-bottom:5px}
        table{width:100%;border-collapse:collapse;font-size:12.5px}
        th,td{border:1px solid #e3e6ea;padding:7px 9px;text-align:center}
        th{background:#16243D;color:#fff;font-weight:600}
        tr:nth-child(even){background:#f7f8fa}
        .total-row{font-weight:bold;background:#FBF0DA!important}
        @media print{ .noprint{display:none} }
      </style></head><body>
      <h1>📊 Relatório de Atendimentos</h1>
      <div class="sub">Mafra Gestão Integrada · Período (${perLbl}): ${fmtBr(ini)} a ${fmtBr(fim)}</div>
      <div class="cards">
        <div class="card"><div class="v">${totalGeral}</div><div class="l">Total</div></div>
        <div class="card"><div class="v">${tot.wa}</div><div class="l">WhatsApp</div></div>
        <div class="card"><div class="v">${tot.em}</div><div class="l">E-mails</div></div>
        <div class="card"><div class="v">${tot.li}</div><div class="l">Ligações</div></div>
        <div class="card"><div class="v">${tot.qr}</div><div class="l">QRCode</div></div>
      </div>
      <h2>Atendimentos por dia</h2>
      <table><thead><tr><th>Data</th><th>WhatsApp</th><th>E-mails</th><th>Ligações</th><th>QRCode</th><th>Condomínio</th><th>Total</th></tr></thead>
        <tbody>${linhasTabela||'<tr><td colspan="7">Sem registros no período</td></tr>'}
        <tr class="total-row"><td>TOTAL</td><td>${tot.wa}</td><td>${tot.em}</td><td>${tot.li}</td><td>${tot.qr}</td><td></td><td>${totalGeral}</td></tr></tbody>
      </table>
      ${rankCom?`<h2>Comunicados enviados por condomínio</h2>
      <table><thead><tr><th>Condomínio</th><th>Quantidade</th></tr></thead><tbody>${rankCom}
        <tr class="total-row"><td>TOTAL</td><td>${com.total}</td></tr></tbody></table>`:""}
      <p class="noprint" style="margin-top:24px;text-align:center"><button onclick="window.print()" style="padding:10px 20px;font-size:14px;background:#16243D;color:#fff;border:none;border-radius:8px;cursor:pointer">🖨️ Imprimir / Salvar como PDF</button></p>
      </body></html>`);
    win.document.close();
  });
}


