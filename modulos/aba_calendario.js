/* ============================================================
   GESTÃO MAFRA — ABA CALENDARIO
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: _evGestoresDropdown, _evGestorChip, _evAddGestor, _agCSS, _agIniciais, _agCard, renderCalSemanaAgenda, _ev2CSS, _cgCSS, _cgModo, setCalSemanaModo, renderCalSemanaGrade, _cgBloco, _cgLayoutDia, _cgMin, addDays, monthLabel, calViewBtns, calIrDia, calPersonalizar, calToolbar, calFiltroEscolher, toggleFiltroMenu, filtroLabel, legendHTML, calNav, calToday, setCalView, openDia, renderCalendario, renderCalSemana, renderCalMes, renderCalAno, abrirMesCal, renderCalDia, renderCalLista, evHora, evChip, partsTeamOf, partsExtOf, openEvento, togglePrivado, addExterno, atualizarCampoRecAte, expandirRecorrencia, saveEvento, mostrarSucessoEvento, delEvento, finalizarEvento, openFerias, saveFerias, removerFerias, assembleiaInfo, openAssembleia, saveAssembleia, saveFacPrefs, abrirFeriados, setFac */

function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }

function monthLabel(d){ const s=d.toLocaleDateString("pt-BR",{month:"long",year:"numeric"}); return s.charAt(0).toUpperCase()+s.slice(1); }

function calViewBtns(){
  const v=state.calView;
  const hojeDs=ymd(new Date());
  const amanhaDs=ymd(addDays(startOfDay(new Date()),1));
  const refDs=ymd(state.calRef);
  // "Hoje" e "Amanhã" só ficam ativos se a view é "dia" E está na data correspondente
  const ehHoje = v==="dia" && refDs===hojeDs;
  const ehAmanha = v==="dia" && refDs===amanhaDs;
  const ehDiaOutro = v==="dia" && !ehHoje && !ehAmanha;
  const b=(on,l,fn)=>`<button class="per-btn ${on?'on':''}" onclick="${fn}">${l}</button>`;
  const persLabel = ehDiaOutro ? (""+ico('calendario')+" "+refDs.split("-").reverse().join("/")) : ""+ico('calendario')+" Personalizar";
  return `<div class="periodobar">
    ${b(ehHoje,"Hoje","calIrDia('"+hojeDs+"')")}
    ${b(ehAmanha,"Amanhã","calIrDia('"+amanhaDs+"')")}
    ${b(v==="semana","Semana","setCalView('semana')")}
    ${b(v==="mes","Mês","setCalView('mes')")}
    ${b(v==="ano","Ano","setCalView('ano')")}
    ${b(ehDiaOutro,persLabel,"calPersonalizar()")}
    ${b(v==="lista","Lista","setCalView('lista')")}
    ${b(v==="kanban","Kanban","setCalView('kanban')")}
  </div>`;
}

function calIrDia(ds){ state.calRef=new Date(ds+"T00:00:00"); state.calView="dia"; render(); }

function calPersonalizar(){
  const inp=document.createElement("input");
  inp.type="date"; inp.style.position="fixed"; inp.style.left="-9999px";
  inp.value=ymd(state.calRef||new Date());
  document.body.appendChild(inp);
  inp.addEventListener("change",()=>{ const val=inp.value; inp.remove(); if(val) calIrDia(val); });
  inp.addEventListener("blur",()=>{ setTimeout(()=>inp.remove(),300); });
  if(inp.showPicker){ try{ inp.showPicker(); return; }catch(e){} }
  inp.focus(); inp.click();
}

function calToolbar(titulo, sub){
  const d=ymd(state.calRef);
  return `${calViewBtns()}
  <div class="weeknav">
    <button class="nav-btn" onclick="calNav(-1)">‹</button>
    <button class="nav-btn" onclick="calNav(1)">›</button>
    <div><h2>${titulo}</h2><div class="range">${sub}</div></div>
    <button class="today-btn" onclick="calToday()">Hoje</button>
    <div class="spacer"></div>
  </div>
  <div class="quickbar">
    <div class="filtro-wrap">
      <button class="qbtn ${(state.calFiltroPessoas&&state.calFiltroPessoas.length)?'on-filtro':''}" style="font-weight:600" onclick="event.stopPropagation();toggleFiltroMenu()">👥 ${filtroLabel()} ▾</button>
      <div class="filtro-menu ${state.calShowFiltro?'aberto':''}" id="filtroMenu">
        <button class="fm-item ${(!state.calFiltroPessoas||!state.calFiltroPessoas.length)?'sel':''}" onclick="calFiltroEscolher('')">👥 Agenda de todos</button>
        ${PESSOAS_AGENDAVEIS.map(uid=>{
          const us=USUARIOS[uid];
          const on=(state.calFiltroPessoas||[]).includes(uid) && state.calFiltroPessoas.length===1;
          return `<button class="fm-item ${on?'sel':''}" onclick="calFiltroEscolher('${uid}')"><span class="fm-bola" style="background:${us.cor||'#16243D'}"></span>${esc(us.nome.split(" ")[0])}${on?' <span class="fm-check">✓</span>':''}</button>`;
        }).join("")}
      </div>
    </div>
    <button class="qbtn" onclick="openEvento(null,null,'${d}')">＋ Evento</button>
    <button class="qbtn" onclick="openFerias(null,null,'${d}')">🏖️ Férias</button>
    <button class="qbtn" onclick="openAssembleia(null,null,'${d}')">📋 Assembleia</button>
    <button class="qbtn" onclick="abrirAnivs()">🎂 Aniversariantes</button>
    <button class="qbtn" onclick="abrirFeriados()">${ico('calendario')} Feriados</button>
    <button class="qbtn" style="background:#FFF6E0;border-color:#C9A24B;font-weight:700" onclick="abrirLinkAgendamento()">🔗 Link de agendamento</button>
  </div>`;
}

/* ---- Enviar o link de agendamento para pessoas de fora (clientes, fornecedores) ---- */
function abrirLinkAgendamento(){
  // usa a forma com # porque o próprio app a trata — funciona em QUALQUER versão publicada,
  // mesmo se os arquivos-ponte do /agendar (agendar.html/_redirects) faltarem no deploy
  const link=location.origin+"/#agendar";
  const msg="Olá! 👋 Para agendar uma reunião com a Mafra Gestão Integrada, é só escolher o melhor dia e horário neste link: "+link;
  const temShare=(typeof navigator!=="undefined" && navigator.share);
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:460px">
    <div class="modal-head"><h3>🔗 Link de agendamento</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">Envie este link para <b>pessoas de fora</b> (clientes, condôminos, fornecedores). Elas escolhem o dia e o horário sozinhas, e o evento já cai no calendário da pessoa escolhida — sem revelar os compromissos de ninguém.</p>
      <div style="display:flex;gap:8px;margin-top:10px">
        <input id="linkAgInput" readonly value="${esc(link)}" onclick="this.select()" style="flex:1;padding:10px 12px;border:1.5px solid var(--line);border-radius:9px;font-size:13px;background:#FCFBF8;font-weight:600;min-width:0">
        <button class="btn-gold" id="btnCopiarLinkAg" onclick="copiarLinkAgendamento()" style="white-space:nowrap">📋 Copiar</button>
      </div>
      <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
        <a class="btn-ghost" style="flex:1;min-width:150px;text-align:center;text-decoration:none;background:#E8F8EE;border-color:#2F9E44;color:#1d7a35;font-weight:700" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">📲 Enviar no WhatsApp</a>
        ${temShare?`<button class="btn-ghost" style="flex:1;min-width:150px" onclick="compartilharLinkAgendamento()">📤 Compartilhar…</button>`:""}
      </div>
      <div class="modal-foot" style="margin-top:14px"><button class="btn-cancel" style="flex:1" onclick="closeModal()">Fechar</button></div>
    </div></div></div>`;
}

async function copiarLinkAgendamento(){
  const inp=document.getElementById("linkAgInput");
  const link=inp?inp.value:(location.origin+"/#agendar");
  let ok=false;
  try{ if(navigator.clipboard && navigator.clipboard.writeText){ await navigator.clipboard.writeText(link); ok=true; } }catch(e){}
  if(!ok && inp){ try{ inp.select(); inp.setSelectionRange(0,9999); ok=document.execCommand && document.execCommand("copy"); }catch(e){} }
  const btn=document.getElementById("btnCopiarLinkAg");
  if(btn){ btn.textContent= ok ? "✅ Copiado!" : "Selecione e copie"; setTimeout(()=>{ try{ btn.textContent="📋 Copiar"; }catch(e){} }, 2200); }
  if(!ok && inp){ try{ inp.select(); }catch(e){} }
}

async function compartilharLinkAgendamento(){
  const link=location.origin+"/#agendar";
  try{
    await navigator.share({ title:"Agendar reunião · Mafra Gestão Integrada", text:"Escolha o melhor dia e horário para nossa reunião:", url:link });
  }catch(e){ /* usuário cancelou — sem alarde */ }
}

function calFiltroEscolher(uid){
  state.calFiltroPessoas = uid ? [uid] : [];
  state.calShowFiltro = false;
  render();
}

function toggleFiltroMenu(){
  state.calShowFiltro = !state.calShowFiltro;
  const menu=document.getElementById("filtroMenu");
  if(menu) menu.classList.toggle("aberto", state.calShowFiltro);
  if(state.calShowFiltro){
    // fecha ao clicar fora (apenas remove a classe, sem re-render)
    setTimeout(()=>document.addEventListener("click", fechaFiltroMenuFora, {once:true}), 30);
  }
}

function filtroLabel(){
  const f=state.calFiltroPessoas||[];
  if(!f.length) return "Agenda de todos";
  if(f.length===1) return USUARIOS[f[0]]?USUARIOS[f[0]].nome.split(" ")[0]:"1 pessoa";
  return f.length+" pessoas";
}

function legendHTML(){ return `<div class="legend">`+PESSOAS_AGENDAVEIS.map(uid=>`<span class="lg"><i style="background:${USUARIOS[uid].cor}"></i>${esc(USUARIOS[uid].nome.split(" ")[0])}</span>`).join("")+`</div>`; }

function calNav(dir){
  const r=new Date(state.calRef);
  if(state.calView==="ano") r.setFullYear(r.getFullYear()+dir);
  else if(state.calView==="mes"||state.calView==="lista") r.setMonth(r.getMonth()+dir);
  else if(state.calView==="dia") r.setDate(r.getDate()+dir);
  else r.setDate(r.getDate()+7*dir);
  state.calRef=startOfDay(r); render();
}

function calToday(){ state.calRef=startOfDay(new Date()); render(); }

function setCalView(v){ state.calView=v; render(); }

function openDia(ds){ state.calRef=new Date(ds+"T00:00:00"); state.calView="dia"; render(); }

async function renderCalendario(){
  if(!state.calRef) state.calRef=startOfDay(new Date());
  document.getElementById("view").innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando calendário…</div>';
  if(state.calView==="mes")   return renderCalMes();
  if(state.calView==="ano")   return renderCalAno();
  if(state.calView==="dia")   return renderCalDia();
  if(state.calView==="lista") return renderCalLista();
  if(state.calView==="kanban") return renderCalKanban();
  return renderCalSemana();
}

function _cgModo(){
  try{ const v=localStorage.getItem("mafra:calSemanaModo"); if(v) return v; }catch(e){}
  return "cards";
}
function setCalSemanaModo(m){ try{ localStorage.setItem("mafra:calSemanaModo",m); }catch(e){} renderCalendario(); }
function _cgMin(h){ const p=String(h||"00:00").split(":"); return (parseInt(p[0],10)||0)*60+(parseInt(p[1],10)||0); }
// distribui eventos que se sobrepõem em colunas paralelas (lado a lado)
function _cgLayoutDia(arr){
  const evs=arr.slice().sort((a,b)=>_cgMin(a.start)-_cgMin(b.start)||_cgMin(b.end)-_cgMin(a.end));
  const grupos=[]; let atual=null, fimMax=-1;
  evs.forEach(e=>{ const s=_cgMin(e.start), f=Math.max(_cgMin(e.end),s+15);
    if(!atual||s>=fimMax){ atual={itens:[],cols:[]}; grupos.push(atual); fimMax=f; }
    else fimMax=Math.max(fimMax,f);
    let col=0; while(atual.cols[col]!==undefined && atual.cols[col]>s) col++;
    atual.cols[col]=f; atual.itens.push({e,col,s,f}); });
  const out=[];
  grupos.forEach(g=>{ const n=g.cols.length; g.itens.forEach(it=>out.push({...it,n})); });
  return out;
}
function _cgBloco(it, h0, pxh){
  const e=it.e, top=(it.s-h0*60)/60*pxh, alt=Math.max((it.f-it.s)/60*pxh-2,22);
  if(it.fundo){
    // bloqueio de agenda: faixa hachurada ao fundo, largura toda, sem tomar espaço das reuniões
    return `<div class="cg-ev bloq fundo" style="top:${top}px;height:${alt}px;left:2px;right:2px;--c:${e.cor}" onclick="openEvento('${e.ownerKey}','${e.id}')" title="${esc(e.title)} · ${esc(evHora(e))}"><div class="cg-t">${esc(e.start)}–${esc(e.end)} · Bloqueio</div><div class="cg-n">${esc(e.title)}</div><div class="cg-q"><span>${(e.teamParts&&e.teamParts[0]&&USUARIOS[e.teamParts[0]])?esc(USUARIOS[e.teamParts[0]].nome.split(" ")[0]):""}</span></div></div>`;
  }
  // 1 ou 2 ao mesmo tempo: divide a largura; 3+: escalona (cada um um pouco à direita, por cima do anterior) para o texto continuar legível
  let w, left, z=1;
  if(it.n<=2){ w=100/it.n; left=it.col*w; }
  else { const passo=Math.min(22, 70/(it.n-1)); w=100-(it.n-1)*passo; left=it.col*passo; z=1+it.col; }
  const dots=(e.teamParts||[]).filter(id=>USUARIOS[id]).slice(0,4).map(id=>`<i style="background:${USUARIOS[id].cor}" title="${esc(USUARIOS[id].nome)}"></i>`).join("");
  const quem=(e.teamParts||[]).length>1?`${e.teamParts.length} da equipe`:((e.teamParts&&e.teamParts[0]&&USUARIOS[e.teamParts[0]])?esc(USUARIOS[e.teamParts[0]].nome.split(" ")[0]):"");
  const ext=(e.extParts||[]).length;
  const tipo=e.tipo||"evento";
  const cls=["cg-ev",tipo==="bloqueio"?"bloq":"",tipo==="assembleia"?"assem":"",e.finalizado?"done":"",alt<40?"mini":""].join(" ");
  return `<div class="${cls}" style="top:${top}px;height:${alt}px;left:calc(${left}% + 2px);width:calc(${w}% - 4px);z-index:${z};--c:${e.cor}" onclick="openEvento('${e.ownerKey}','${e.id}')" title="${esc(e.title)} · ${esc(evHora(e))}">
    <div class="cg-t">${esc(e.start)}–${esc(e.end)}${tipo!=="evento"&&tipo!=="reuniao"?" · "+tipoLabel(tipo):""}</div>
    <div class="cg-n">${e.finalizado?"✓ ":""}${esc(e.title)}</div>
    <div class="cg-q">${dots}<span>${quem}${ext?` · 👤 ${ext}`:""}</span></div>
  </div>`;
}
function _cgCSS(){
  if(document.getElementById("cg-css")) return;
  const s=document.createElement("style"); s.id="cg-css";
  s.textContent=`
  .kan-card.done{opacity:.75}
  .kan-card.done .kan-ttl{text-decoration:line-through;color:var(--muted)}
  @media(min-width:1100px){ .kanban-grid{grid-template-columns:repeat(5,1fr)} }
  .cg-modo{display:inline-flex;border:1.5px solid var(--line);border-radius:10px;overflow:hidden;background:#fff;margin-left:auto}
  .cg-modo button{padding:6px 11px;font-size:12px;font-weight:800;color:var(--muted);background:#fff;border:0}
  .cg-modo button.on{background:var(--navy);color:#fff}
  .cg-wrap{background:var(--paper);border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow);overflow:hidden}
  .cg-head{display:grid;grid-template-columns:56px repeat(7,1fr);border-bottom:1px solid var(--line2);background:#FBFAF6}
  .cg-head .cg-d{padding:10px 8px;text-align:center;border-left:1px solid var(--line2)}
  .cg-head .cg-d .n{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);font-weight:800}
  .cg-head .cg-d .dt{font-size:20px;font-weight:800;color:var(--navy);line-height:1.1;margin-top:2px}
  .cg-head .cg-d.today .dt{display:inline-flex;width:34px;height:34px;border-radius:50%;background:var(--gold);color:var(--navy);align-items:center;justify-content:center;font-size:16px}
  .cg-head .cg-d.fds{background:#F7F5EF}
  .cg-allday{display:grid;grid-template-columns:56px repeat(7,1fr);border-bottom:1px solid var(--line2);background:#fff;min-height:0}
  .cg-allday .cg-lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;padding:6px 6px;text-align:right}
  .cg-allday .cg-ad{border-left:1px solid var(--line2);padding:4px;display:flex;flex-direction:column;gap:3px}
  .cg-adev{font-size:10.5px;font-weight:700;color:var(--ink);background:#FCFBF8;border-left:3px solid var(--c,#888);border-radius:5px;padding:3px 6px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cg-body{display:grid;grid-template-columns:56px repeat(7,1fr);position:relative;max-height:calc(100vh - 330px);overflow:auto}
  .cg-hours{position:relative}
  .cg-hours div{height:var(--pxh);font-size:10.5px;color:var(--muted);text-align:right;padding-right:6px;transform:translateY(-6px);font-weight:700}
  .cg-col{position:relative;border-left:1px solid var(--line2);background-image:repeating-linear-gradient(to bottom,transparent 0,transparent calc(var(--pxh) - 1px),var(--line2) calc(var(--pxh) - 1px),var(--line2) var(--pxh))}
  .cg-col.today{background-color:#FFFBF0}
  .cg-col.fds{background-color:#FAF8F3}
  .cg-ev{position:absolute;box-sizing:border-box;border-radius:8px;padding:4px 7px;background:#fff;border:1px solid var(--line2);border-left:4px solid var(--c,#888);box-shadow:0 2px 6px rgba(22,36,61,.10);cursor:pointer;overflow:hidden;transition:.12s;z-index:1}
  .cg-ev:hover{z-index:5;box-shadow:0 6px 16px rgba(22,36,61,.18);transform:translateY(-1px)}
  .cg-ev .cg-t{font-size:10px;font-weight:800;color:var(--navy2,#3a4a68);white-space:nowrap}
  .cg-ev .cg-n{font-size:12px;font-weight:800;color:var(--ink);line-height:1.2;margin-top:1px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .cg-ev .cg-q{font-size:10px;color:var(--muted);display:flex;align-items:center;gap:4px;margin-top:2px;font-weight:600}
  .cg-ev .cg-q i{width:8px;height:8px;border-radius:50%;display:inline-block}
  .cg-ev.mini{padding:2px 6px}
  .cg-ev.mini .cg-n{display:block;white-space:nowrap;text-overflow:ellipsis;font-size:11px}
  .cg-ev.mini .cg-q,.cg-ev.mini .cg-t{display:none}
  .cg-ev.bloq{background:repeating-linear-gradient(135deg,#F3F1EA 0,#F3F1EA 6px,#FAF8F3 6px,#FAF8F3 12px);border-style:dashed}
  .cg-ev.bloq.fundo{z-index:0;box-shadow:none;opacity:.9}
  .cg-ev.bloq.fundo .cg-n{color:var(--muted);font-weight:700}
  .cg-ev.assem{border-color:var(--gold);box-shadow:0 0 0 1px rgba(201,162,75,.35)}
  .cg-ev.done{opacity:.6}
  .cg-ev.done .cg-n{text-decoration:line-through}
  .cg-now{position:absolute;left:0;right:0;height:2px;background:#C0392B;z-index:4;pointer-events:none}
  .cg-now::before{content:"";position:absolute;left:-5px;top:-4px;width:10px;height:10px;border-radius:50%;background:#C0392B}
  .cg-col .cg-add{position:absolute;inset:0;cursor:pointer}
  @media(max-width:760px){ .cg-modo{display:none} }`;
  document.head.appendChild(s);
}
async function renderCalSemanaGrade(){
  _cgCSS();
  const mon=mondayOfDate(state.calRef);
  const nomes=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
  const days=[]; for(let i=0;i<7;i++){ const d=addDays(mon,i); days.push({d,ds:ymd(d),nome:nomes[i],fds:i>=5}); }
  const {byDay}=await loadEventosRange(new Set(days.map(x=>x.ds)));
  const todayDs=ymd(new Date());
  // faixa de horas: do menor início (mín. 7h) ao maior fim (mín. 19h)
  let h0=7, h1=19;
  days.forEach(x=>(byDay[x.ds]||[]).forEach(e=>{ if(e.isAniv||e.isFeriado||e.tipo==="ferias") return; h0=Math.min(h0,Math.floor(_cgMin(e.start)/60)); h1=Math.max(h1,Math.ceil(_cgMin(e.end)/60)); }));
  h0=Math.max(0,h0); h1=Math.min(24,Math.max(h1,h0+8));
  const pxh=56;
  let html=calToolbar("Semana", `${fmt(days[0].d)} a ${fmt(days[6].d)} · ${days[0].d.getFullYear()}`)+legendHTML();
  html+=`<div class="cg-wrap" style="--pxh:${pxh}px"><div class="cg-head"><div></div>${days.map(x=>`<div class="cg-d ${x.ds===todayDs?"today":""} ${x.fds?"fds":""}"><div class="n">${x.nome}</div><div class="dt">${x.d.getDate()}</div></div>`).join("")}</div>`;
  // dia inteiro: férias, feriados, aniversários
  const temAllDay=days.some(x=>(byDay[x.ds]||[]).some(e=>e.isAniv||e.isFeriado||e.tipo==="ferias"));
  if(temAllDay){
    html+=`<div class="cg-allday"><div class="cg-lbl">dia todo</div>${days.map(x=>`<div class="cg-ad ${x.fds?"fds":""}">${(byDay[x.ds]||[]).filter(e=>e.isAniv||e.isFeriado||e.tipo==="ferias").map(e=>e.isFeriado?`<div class="cg-adev" style="--c:${e.cor}" title="${esc(e.title)}">${e.fstatus&&e.fstatus.tipo==="nacional"?"🚫":"🏖️"} ${esc(e.title)}</div>`:(e.isAniv?`<div class="cg-adev" style="--c:#C9A24B" onclick="abrirAnivs()">🎂 ${esc(e.title)}</div>`:`<div class="cg-adev" style="--c:${e.cor}" onclick="openEvento('${e.ownerKey}','${e.id}')">🏝️ ${esc(e.title)}</div>`)).join("")}</div>`).join("")}</div>`;
  }
  html+=`<div class="cg-body" id="cgBody"><div class="cg-hours">${Array.from({length:h1-h0},(_,i)=>`<div>${String(h0+i).padStart(2,"0")}:00</div>`).join("")}</div>`;
  const agora=new Date(); const nowTop=((agora.getHours()*60+agora.getMinutes())-h0*60)/60*pxh;
  days.forEach(x=>{
    const todos=(byDay[x.ds]||[]).filter(e=>!e.isAniv&&!e.isFeriado&&e.tipo!=="ferias");
    const fundos=todos.filter(e=>e.tipo==="bloqueio").map(e=>({e,s:_cgMin(e.start),f:Math.max(_cgMin(e.end),_cgMin(e.start)+15),fundo:true}));
    const lay=fundos.concat(_cgLayoutDia(todos.filter(e=>e.tipo!=="bloqueio")));
    html+=`<div class="cg-col ${x.ds===todayDs?"today":""} ${x.fds?"fds":""}" style="height:${(h1-h0)*pxh}px"><div class="cg-add" onclick="openEvento(null,null,'${x.ds}')" title="Novo evento em ${fmt(x.d)}"></div>${lay.map(it=>_cgBloco(it,h0,pxh)).join("")}${(x.ds===todayDs&&nowTop>=0&&nowTop<=(h1-h0)*pxh)?`<div class="cg-now" style="top:${nowTop}px"></div>`:""}</div>`;
  });
  html+=`</div></div>`;
  document.getElementById("view").innerHTML=html;
  // rola para a primeira hora útil (ou para agora)
  try{ const b=document.getElementById("cgBody"); let prim=8*60; days.forEach(x=>(byDay[x.ds]||[]).forEach(e=>{ if(e.isAniv||e.isFeriado||e.tipo==="ferias"||e.tipo==="bloqueio") return; prim=Math.min(prim,_cgMin(e.start)); })); b.scrollTop=Math.max(0,(prim-h0*60)/60*pxh-16); }catch(e){}
  // alternador Cards | Grade dentro do weeknav
  try{ const wn=document.querySelector("#view .weeknav .spacer"); if(wn){ wn.insertAdjacentHTML("afterend",`<div class="cg-modo"><button onclick="setCalSemanaModo('cards')">Cards</button><button class="on" onclick="setCalSemanaModo('grade')">Grade</button></div>`); } }catch(e){}
}
// build 130: gestores dos condomínios em lista suspensa (em vez de dezenas de chips)
function _evGestoresDropdown(gestoresLista, teamSel){
  // ordem alfabética pelo NOME da pessoa (pedido da Mafra); condomínio aparece ao lado
  const ord=gestoresLista.slice().sort((a,b)=>USUARIOS[a].nome.localeCompare(USUARIOS[b].nome,"pt-BR",{sensitivity:"base"})||String(USUARIOS[a].condominio||"").localeCompare(String(USUARIOS[b].condominio||""),"pt-BR"));
  const sel=ord.filter(u=>teamSel.includes(u));
  const opts=`<option value="">＋ Adicionar gestor de condomínio…</option>`+ord.map(u=>`<option value="${u}">${esc(USUARIOS[u].nome.split(" ")[0])} · ${esc(USUARIOS[u].condominio||"gestor")}</option>`).join("");
  return `<div style="width:100%;font-size:11px;color:#8a93a3;margin:8px 0 4px">Gestores dos condomínios <span style="font-weight:400">(opcional)</span></div>
    <select id="eGestorSel" onchange="_evAddGestor(this)" style="width:100%;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;background:#FCFBF8;font-size:14px;font-family:inherit">${opts}</select>
    <div id="eGestoresSel" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;width:100%">${sel.map(_evGestorChip).join("")}</div>`;
}
function _evGestorChip(u){
  const g=USUARIOS[u]||{};
  return `<label class="chk" style="padding-right:6px"><input type="checkbox" name="eTeam" value="${u}" checked style="display:none"><i style="background:${g.cor||"#888"}"></i>${esc((g.nome||u).split(" ")[0])} <small style="color:#8a93a3">· ${esc(g.condominio||"")}</small><button type="button" onclick="event.preventDefault();this.closest('label').remove()" title="Remover" style="background:none;border:0;color:#8a93a3;font-size:14px;margin-left:4px;line-height:1">×</button></label>`;
}
function _evAddGestor(sel){
  const u=sel.value; sel.value=""; if(!u) return;
  const box=document.getElementById("eGestoresSel"); if(!box) return;
  if(box.querySelector(`input[name="eTeam"][value="${u}"]`)) return;
  box.insertAdjacentHTML("beforeend",_evGestorChip(u));
}
function _agIniciais(nome){ return String(nome||"?").split(" ").filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase(); }
function _agCard(e){
  if(e.isFeriado) return `<div class="ag-card ferias"><div class="ag-top"><span class="ag-time">Dia todo</span><span class="ag-tag">${e.fstatus&&e.fstatus.tipo==="nacional"?"Feriado":"Facultativo"}</span></div><div class="ag-ttl">${esc(e.title)}</div></div>`;
  if(e.isAniv) return `<div class="ag-card aniv" onclick="abrirAnivs()"><div class="ag-top"><span class="ag-time">🎂</span><span class="ag-tag">Aniversário</span></div><div class="ag-ttl">${esc(e.title)}</div></div>`;
  const tipo=e.tipo||"evento";
  const tagTxt={reuniao:"Reunião",bloqueio:"Bloqueio",assembleia:"Assembleia",ferias:"Férias",evento:"Compromisso"}[tipo]||"Compromisso";
  const parts=(e.teamParts||[]).filter(id=>USUARIOS[id]);
  const ext=(e.extParts||[]).length;
  const prim=parts[0]?USUARIOS[parts[0]]:null;
  let quem="";
  if(prim){ const outros=parts.length-1; quem=esc(prim.nome.split(" ")[0]); if(outros===1 && USUARIOS[parts[1]]) quem+=" e "+esc(USUARIOS[parts[1]].nome.split(" ")[0]); else if(outros>1) quem+=" + "+outros+" pessoas"; if(ext) quem+=(outros?" + ":" + ")+ext+" externo"+(ext>1?"s":""); }
  else if(ext) quem=ext+" externo"+(ext>1?"s":"");
  const av=prim?`<span class="ag-av" style="background:${prim.cor||"#16243D"}">${_agIniciais(prim.nome)}</span>`:`<span class="ag-av" style="background:#8a93a3">EQ</span>`;
  const cls=["ag-card",tipo==="bloqueio"?"bloq":"",e.finalizado?"done":"",tipo==="assembleia"?"assem":""].join(" ");
  return `<div class="${cls}" style="--c:${e.cor}" onclick="openEvento('${e.ownerKey}','${e.id}')">
    <div class="ag-top"><span class="ag-time">${esc(e.start)} — ${esc(e.end)}</span><span class="ag-tag ${tipo}">${tagTxt}</span></div>
    <div class="ag-ttl">${esc(e.title)}</div>
    <div class="ag-who">${av}<span>${quem}</span>${e.finalizado?`<span class="ag-ok">✓ Realizada</span>`:""}</div>
  </div>`;
}
function _agCSS(){
  if(document.getElementById("ag-css")) return;
  const s=document.createElement("style"); s.id="ag-css";
  s.textContent=`
  .ag-panel{background:#fff;border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow);overflow:hidden}
  .ag-header{display:flex;align-items:center;gap:14px;padding:16px 20px;border-bottom:1px solid var(--line2)}
  .ag-header .ag-ic{width:42px;height:42px;border-radius:12px;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px}
  .ag-header h2{margin:0;font-size:19px;color:var(--ink);font-weight:800}
  .ag-header .sub{font-size:12.5px;color:var(--muted);margin-top:2px}
  .ag-header .sp{flex:1}
  .ag-new{background:var(--navy);color:#fff;font-weight:800;font-size:13.5px;padding:11px 18px;border-radius:11px;border:0;white-space:nowrap}
  .ag-tools{padding:14px 20px 0}
  .ag-tools .periodobar{background:#F6F4EF;display:inline-flex;padding:5px;border-radius:12px;gap:4px;margin-bottom:12px}
  .ag-tools .per-btn{border-color:transparent;background:transparent;padding:8px 14px}
  .ag-tools .per-btn.on{background:var(--navy);color:#fff}
  .ag-tools .weeknav{margin-bottom:8px}
  .ag-tools .legend{box-shadow:none;margin-bottom:0;border-radius:12px 12px 0 0;border-bottom:0}
  .ag-days{display:grid;grid-template-columns:repeat(7,1fr);border-top:1px solid var(--line2)}
  .ag-day{border-left:1px solid var(--line2);min-height:420px;display:flex;flex-direction:column}
  .ag-day:first-child{border-left:0}
  .ag-day.fds{background:#FBFAF7}
  .ag-dh{padding:14px 14px 12px;border-bottom:1px solid var(--line2);display:flex;align-items:flex-start;justify-content:space-between;gap:6px}
  .ag-dh .dow{font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:var(--muted);font-weight:700}
  .ag-dh .dt{font-size:20px;font-weight:800;color:var(--ink);margin-top:3px;letter-spacing:-.3px}
  .ag-day.today .ag-dh{background:#FFF7E6}
  .ag-day.today .ag-dh .dt{color:var(--navy)}
  .ag-dh .cnt{min-width:24px;height:24px;border-radius:50%;background:#F0EDE4;color:var(--muted);font-size:11.5px;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 6px}
  .ag-day.today .ag-dh .cnt{background:var(--gold);color:var(--navy)}
  .ag-db{padding:10px;display:flex;flex-direction:column;gap:10px;flex:1}
  .ag-empty{font-size:12.5px;color:var(--muted);text-align:center;padding:26px 8px}
  .ag-card{background:#fff;border:1px solid var(--line);border-left:4px solid var(--c,#888);border-radius:12px;padding:11px 12px 10px;box-shadow:0 1px 3px rgba(22,36,61,.06);cursor:pointer;transition:.12s}
  .ag-card:hover{box-shadow:0 6px 16px rgba(22,36,61,.14);transform:translateY(-1px)}
  .ag-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px}
  .ag-time{font-size:12.5px;font-weight:700;color:var(--ink);letter-spacing:.1px}
  .ag-tag{font-size:9.5px;font-weight:800;letter-spacing:.7px;text-transform:uppercase;color:var(--muted);background:#F0EDE4;border-radius:7px;padding:4px 8px}
  .ag-tag.assembleia{background:#FBF1D6;color:#8a6a12}
  .ag-tag.bloqueio{background:#EEE9DC;color:#7a6a3c}
  .ag-ttl{font-size:14.5px;font-weight:800;color:var(--ink);line-height:1.3;letter-spacing:-.1px}
  .ag-who{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:12.5px;color:var(--muted);font-weight:600;flex-wrap:wrap}
  .ag-av{width:24px;height:24px;border-radius:50%;color:#fff;font-size:9.5px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;flex:none;letter-spacing:.3px}
  .ag-ok{margin-left:auto;color:#2F7D5B;font-weight:800;font-size:12px}
  .ag-card.done{background:#F6F5F1;border-left-color:#c9ccd3}
  .ag-card.done .ag-ttl{text-decoration:line-through;color:var(--muted)}
  .ag-card.done .ag-av{background:#b9c0cc!important}
  .ag-card.bloq{background:repeating-linear-gradient(135deg,#F7F5EF 0,#F7F5EF 6px,#FCFBF8 6px,#FCFBF8 12px);border-style:dashed}
  .ag-card.assem{border-left-color:var(--gold)}
  .ag-card.ferias,.ag-card.aniv{padding:8px 10px}
  .ag-addday{margin-top:auto;border:1.5px dashed var(--line);background:transparent;border-radius:10px;padding:8px;font-size:12px;font-weight:700;color:var(--muted)}
  .ag-addday:hover{color:var(--navy);border-color:var(--gold)}
  @media(max-width:760px){
    .ag-days{grid-template-columns:1fr}
    .ag-day{border-left:0;border-top:1px solid var(--line2);min-height:0}
    .ag-header{padding:14px}
    .ag-header h2{font-size:17px}
    .ag-new span{display:none}
    .ag-tools{padding:12px 12px 0}
  }`;
  document.head.appendChild(s);
}
async function renderCalSemanaAgenda(){
  _agCSS();
  const mon=mondayOfDate(state.calRef);
  const nomes=["Segunda","Terça","Quarta","Quinta","Sexta","Sábado","Domingo"];
  const mesesC=["jan.","fev.","mar.","abr.","mai.","jun.","jul.","ago.","set.","out.","nov.","dez."];
  const days=[]; for(let i=0;i<7;i++){ const d=addDays(mon,i); days.push({d,ds:ymd(d),nome:nomes[i],fds:i>=5}); }
  const {byDay}=await loadEventosRange(new Set(days.map(x=>x.ds)));
  const todayDs=ymd(new Date());
  const tools=calToolbar("Semana", `${fmt(days[0].d)} a ${fmt(days[6].d)} · ${days[0].d.getFullYear()}`)+legendHTML();
  let html=`<div class="ag-panel">
    <div class="ag-header"><div class="ag-ic">${ico('calendario')}</div><div><h2>Agenda da equipe</h2><div class="sub">Gestão integrada de compromissos</div></div><div class="sp"></div><button class="ag-new" onclick="openEvento(null,null,'${todayDs}')">+ <span>Novo compromisso</span></button></div>
    <div class="ag-tools">${tools}</div>
    <div class="ag-days">`;
  days.forEach(x=>{
    const arr=(byDay[x.ds]||[]).slice().sort((a,b)=>(a.start||"").localeCompare(b.start||""));
    const n=arr.filter(e=>!e.isFeriado&&!e.isAniv).length;
    html+=`<div class="ag-day ${x.ds===todayDs?"today":""} ${x.fds?"fds":""}"><div class="ag-dh"><div><div class="dow">${x.nome}</div><div class="dt">${x.d.getDate()} ${mesesC[x.d.getMonth()]}</div></div><span class="cnt">${n}</span></div><div class="ag-db">`;
    if(!arr.length) html+=`<div class="ag-empty">Nenhum compromisso agendado</div>`;
    arr.forEach(e=>{ html+=_agCard(e); });
    html+=`<button class="ag-addday" onclick="openEvento(null,null,'${x.ds}')">＋ evento</button></div></div>`;
  });
  html+=`</div></div>`;
  document.getElementById("view").innerHTML=html;
  try{ const wn=document.querySelector("#view .weeknav .spacer"); if(wn){ _cgCSS(); wn.insertAdjacentHTML("afterend",`<div class="cg-modo"><button class="on" onclick="setCalSemanaModo('cards')">Cards</button><button onclick="setCalSemanaModo('grade')">Grade</button></div>`); } }catch(e){}
}
async function renderCalSemana(){
  _ev2CSS();
  if(_cgModo()==="grade") return renderCalSemanaGrade();
  return renderCalSemanaAgenda();
  const mon=mondayOfDate(state.calRef);
  const nomes=["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
  const days=[]; for(let i=0;i<7;i++){ const d=addDays(mon,i); days.push({d,ds:ymd(d),nome:nomes[i]}); }
  const {byDay}=await loadEventosRange(new Set(days.map(x=>x.ds)));
  const todayDs=ymd(new Date());
  let html=calToolbar("Semana", `${fmt(days[0].d)} a ${fmt(days[6].d)} · ${days[0].d.getFullYear()}`)+legendHTML();
  html+=`<div class="calgrid">`;
  days.forEach(x=>{
    html+=`<div class="calcol ${x.ds===todayDs?'is-today':''} ${(x.d.getDay()===0||x.d.getDay()===6)?'fds':''}"><div class="calhead"><span class="d">${x.nome}</span><span class="dt">${fmt(x.d)}</span></div><div class="calbody">`;
    const arr=byDay[x.ds]||[];
    if(arr.length===0) html+='<div class="cal-empty">—</div>';
    arr.forEach(e=>{ html+=evChip(e); });
    html+=`<button class="add-task" style="margin-top:auto" onclick="openEvento(null,null,'${x.ds}')">＋ evento</button></div></div>`;
  });
  html+=`</div>`;
  document.getElementById("view").innerHTML=html;
  try{ _cgCSS(); const wn=document.querySelector("#view .weeknav .spacer"); if(wn){ wn.insertAdjacentHTML("afterend",`<div class="cg-modo"><button class="on" onclick="setCalSemanaModo('cards')">Cards</button><button onclick="setCalSemanaModo('grade')">Grade</button></div>`); } }catch(e){}
}

async function renderCalMes(){
  const ref=state.calRef, y=ref.getFullYear(), m=ref.getMonth();
  const gridStart=mondayOfDate(new Date(y,m,1));
  const last=new Date(y,m+1,0);
  const weeks=Math.ceil((Math.round((startOfDay(last)-gridStart)/86400000)+1)/7);
  const ncells=weeks*7;
  const dsList=[]; for(let i=0;i<ncells;i++) dsList.push(ymd(addDays(gridStart,i)));
  const {byDay}=await loadEventosRange(new Set(dsList));
  const todayDs=ymd(new Date());
  let html=calToolbar("Mês", monthLabel(ref))+legendHTML();
  html+=`<div class="mesgrid"><div class="mes-dows">`+["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(n=>`<span>${n}</span>`).join("")+`</div><div class="mes-cells">`;
  for(let i=0;i<ncells;i++){
    const d=addDays(gridStart,i), ds=ymd(d), inMonth=d.getMonth()===m, arr=byDay[ds]||[];
    html+=`<div class="mcell ${inMonth?'':'out'} ${ds===todayDs?'is-today':''}" onclick="openDia('${ds}')"><div class="mnum">${d.getDate()}</div>`;
    arr.slice(0,3).forEach(e=>{ html+=`<div class="mev" onclick="event.stopPropagation();openEvento('${e.ownerKey}','${e.id}')"><span class="mevdot" style="background:${e.cor}"></span><span class="mevtxt">${e.start} ${esc(e.title)}</span></div>`; });
    if(arr.length>3) html+=`<div class="mmore">+${arr.length-3} mais</div>`;
    html+=`</div>`;
  }
  html+=`</div></div>`;
  document.getElementById("view").innerHTML=html;
}

async function renderCalAno(){
  const ref=state.calRef, y=ref.getFullYear();
  // coleta todos os dias do ano para contar eventos por mês
  const dsList=[]; const d0=new Date(y,0,1), d1=new Date(y,11,31);
  for(let dd=new Date(d0); dd<=d1; dd.setDate(dd.getDate()+1)) dsList.push(ymd(dd));
  const {byDay}=await loadEventosRange(new Set(dsList));
  const todayDs=ymd(new Date());
  const mesesNm=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const dows=["S","T","Q","Q","S","S","D"];
  let html=calToolbar("Ano", String(y))+legendHTML();
  html+=`<div class="anocal-grid">`;
  for(let m=0;m<12;m++){
    const gridStart=mondayOfDate(new Date(y,m,1));
    const last=new Date(y,m+1,0);
    const weeks=Math.ceil((Math.round((startOfDay(last)-gridStart)/86400000)+1)/7);
    // total de eventos do mês
    let totalEv=0; for(let dd=new Date(y,m,1); dd<=last; dd.setDate(dd.getDate()+1)){ totalEv+=(byDay[ymd(dd)]||[]).length; }
    html+=`<div class="anocal-mes" onclick="abrirMesCal(${y},${m})">
      <div class="anocal-tit">${mesesNm[m]} ${totalEv?`<span class="anocal-badge">${totalEv}</span>`:""}</div>
      <div class="anocal-dows">${dows.map(x=>`<span>${x}</span>`).join("")}</div>
      <div class="anocal-cells">`;
    for(let i=0;i<weeks*7;i++){
      const d=addDays(gridStart,i), ds=ymd(d), inMonth=d.getMonth()===m;
      const tem=(byDay[ds]||[]).length>0;
      html+=`<span class="ac-day ${inMonth?'':'out'} ${ds===todayDs?'hoje':''} ${tem&&inMonth?'tem':''}">${inMonth?d.getDate():""}</span>`;
    }
    html+=`</div></div>`;
  }
  html+=`</div>`;
  document.getElementById("view").innerHTML=html;
}

function abrirMesCal(y,m){ state.calRef=startOfDay(new Date(y,m,1)); state.calView="mes"; render(); }

async function renderCalDia(){
  _ev2CSS();
  const d=startOfDay(state.calRef), ds=ymd(d);
  const {byDay}=await loadEventosRange(new Set([ds]));
  const arr=byDay[ds]||[];
  const label=capit(d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}));
  let html=calToolbar("Dia", label)+`<div class="dia-wrap">`;
  if(arr.length===0) html+=`<div class="dia-empty">Nenhum evento neste dia.</div>`;
  arr.forEach(e=>{ html+=evRow(e); });
  html+=`<button class="btn-gold" style="align-self:flex-start;margin-top:6px" onclick="openEvento(null,null,'${ds}')">＋ Novo evento</button></div>`;
  document.getElementById("view").innerHTML=html;
}

async function renderCalLista(){
  const ref=state.calRef, y=ref.getFullYear(), m=ref.getMonth();
  const first=new Date(y,m,1), last=new Date(y,m+1,0);
  const dsList=[]; for(let d=new Date(first); d<=last; d=addDays(d,1)) dsList.push(ymd(d));
  const {all}=await loadEventosRange(new Set(dsList));
  let html=calToolbar("Lista", monthLabel(ref))+`<div class="lista-wrap">`;
  if(all.length===0) html+=`<div class="dia-empty">Nenhum evento em ${monthLabel(ref).toLowerCase()}.</div>`;
  let cur=null;
  all.forEach(e=>{
    if(e.date!==cur){ cur=e.date; const d=new Date(e.date+"T00:00:00");
      html+=`<div class="lista-day">${capit(d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"}))}</div>`; }
    html+=evRow(e);
  });
  html+=`</div>`;
  document.getElementById("view").innerHTML=html;
}

function evHora(e){ return e.tipo==="ferias"?"Dia inteiro":`${e.start}–${e.end}`; }

function evChip(e){
  if(e.isFeriado) return `<div class="ev-chip ev2 ferias" style="--c:${e.cor}"><span class="ev2-time">${e.fstatus.tipo==="nacional"?"🚫 Feriado":"🏖️ Facultativo"}</span><span class="ev2-ttl">${esc(e.title)}</span></div>`;
  if(e.isAniv) return `<div class="ev-chip ev2 aniv" style="--c:#C9A24B" onclick="abrirAnivs()"><span class="ev2-time">🎂 Aniversário</span><span class="ev2-ttl">${esc(e.title)}</span></div>`;
  const tipo=e.tipo||"evento";
  const dots=(e.teamParts||[]).filter(id=>USUARIOS[id]).slice(0,5).map(id=>`<i style="background:${USUARIOS[id].cor}" title="${esc(USUARIOS[id].nome)}"></i>`).join("");
  let quem;
  if((e.teamParts||[]).length>1) quem=`${e.teamParts.length} da equipe`;
  else { const id=e.teamParts&&e.teamParts[0]; quem=(id&&USUARIOS[id])?esc(USUARIOS[id].nome.split(" ")[0]):""; }
  const ext=(e.extParts||[]).length;
  const tag=tipo==="bloqueio"?`<span class="ev2-tag bloq">Bloqueio</span>`:tipo==="assembleia"?`<span class="ev2-tag assem">Assembleia</span>`:tipo==="reuniao"?`<span class="ev2-tag">Reunião</span>`:tipo==="ferias"?`<span class="ev2-tag">Férias</span>`:"";
  return `<div class="ev-chip ev2 ${tipo==="bloqueio"?"bloq":""} ${e.finalizado?"done":""}" style="--c:${e.cor}" onclick="openEvento('${e.ownerKey}','${e.id}')">
    <div class="ev2-top"><span class="ev2-time">${evHora(e)}</span>${tag}${e.finalizado?`<span class="ev2-tag ok">✓ realizada</span>`:""}</div>
    <div class="ev2-ttl">${esc(e.title)}</div>
    <div class="ev2-who"><span class="ev2-dots">${dots}</span><span>${quem}</span>${ext?`<span class="ev2-ext">👤 ${ext} externo${ext>1?"s":""}</span>`:""}</div>
  </div>`;
}
function _ev2CSS(){
  if(document.getElementById("ev2-css")) return;
  const s=document.createElement("style"); s.id="ev2-css";
  s.textContent=`
  .calgrid{gap:12px}
  .calcol{border-radius:14px}
  .calhead{padding:11px 13px}
  .calhead .d{font-size:13.5px;font-weight:800;color:var(--navy)}
  .calhead .dt{font-size:12px;font-weight:700;color:var(--muted)}
  .calcol.is-today .calhead{background:#FFF7E6}
  .calcol.is-today .calhead .dt{background:var(--gold);color:var(--navy);border-radius:10px;padding:1px 8px}
  .calcol.fds{background:#FAF8F3}
  .calbody{padding:9px;gap:8px}
  .ev-chip.ev2{background:#fff;border:1px solid var(--line);border-left:5px solid var(--c,#888);border-radius:11px;padding:9px 11px 8px;box-shadow:0 1px 3px rgba(22,36,61,.06)}
  .ev-chip.ev2:hover{box-shadow:0 6px 16px rgba(22,36,61,.14);transform:translateY(-1px);border-color:#d9d4c7}
  .ev2-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px}
  .ev2-time{font-size:11.5px;font-weight:800;color:var(--navy);letter-spacing:.2px}
  .ev2-tag{font-size:9.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--muted);background:#F0EDE4;border-radius:20px;padding:2px 7px}
  .ev2-tag.bloq{background:#EEE9DC;color:#7a6a3c}
  .ev2-tag.assem{background:#FBF1D6;color:#8a6a12}
  .ev2-tag.ok{background:#E7F3EA;color:#2F7D5B}
  .ev2-ttl{font-size:14px;font-weight:800;color:var(--ink);line-height:1.25;letter-spacing:-.1px}
  .ev2-who{display:flex;align-items:center;gap:6px;margin-top:6px;font-size:11px;font-weight:700;color:var(--muted);flex-wrap:wrap}
  .ev2-dots{display:inline-flex;gap:3px}
  .ev2-dots i{width:9px;height:9px;border-radius:50%;display:inline-block;border:1.5px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.06)}
  .ev2-ext{color:#2F7D5B}
  .ev-chip.ev2.bloq{background:repeating-linear-gradient(135deg,#F7F5EF 0,#F7F5EF 6px,#FCFBF8 6px,#FCFBF8 12px);border-style:dashed}
  .ev-chip.ev2.bloq .ev2-ttl{color:#5c6270;font-weight:700}
  .ev-chip.ev2.done{opacity:.7}
  .ev-chip.ev2.done .ev2-ttl{text-decoration:line-through;color:var(--muted)}
  .ev-chip.ev2.aniv,.ev-chip.ev2.ferias{padding:7px 10px}
  .cal-empty{padding:18px 0;text-align:center;color:#c4c8d0;font-size:12px;font-style:italic}
  @media(max-width:760px){ .ev2-ttl{font-size:13.5px} }`;
  document.head.appendChild(s);
}

/* ===== VISÃO KANBAN: quadro por período (passados/hoje/semana/depois) ===== */
function kanTeamQuem(e){
  const dots=(e.teamParts||[]).filter(id=>USUARIOS[id]).map(id=>`<i style="background:${USUARIOS[id].cor}" title="${esc(USUARIOS[id].nome)}"></i>`).join("");
  let quem;
  if((e.teamParts||[]).length>1) quem=`${dots} ${e.teamParts.length} da equipe`;
  else { const id=e.teamParts&&e.teamParts[0]; quem=`${dots} ${id&&USUARIOS[id]?esc(USUARIOS[id].nome.split(" ")[0]):""}`; }
  return quem;
}
function kanCard(e){
  if(e.isFeriado||e.isAniv){
    const ic=e.isAniv?"🎂":((e.fstatus&&e.fstatus.tipo==="nacional")?"🚫":"🏖️");
    return `<div class="kan-card" style="--c:${e.cor}"><div class="kan-date">${ic} ${e.isAniv?"Aniversário":"Feriado"}</div><div class="kan-ttl">${esc(e.title)}</div></div>`;
  }
  const d=new Date(e.date+"T00:00:00");
  const dLbl=capit(d.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"short"})).replace(/\./g,"");
  const tag=e.tipo&&e.tipo!=="evento"?" · "+tipoLabel(e.tipo):"";
  const quem=kanTeamQuem(e);
  const ext=(e.extParts||[]).length;
  return `<div class="kan-card ${e.finalizado?"done":""}" style="--c:${e.cor}" onclick="openEvento('${e.ownerKey}','${e.id}')">
    <div class="kan-date">${dLbl} · ${evHora(e)}${e.finalizado?` <span style="color:#2F7D5B;font-weight:800">· ✓ Realizada</span>`:""}</div>
    <div class="kan-ttl">${esc(e.title)}${tag}</div>
    <div class="kan-meta">${quem}${ext?` · 👤 ${ext} ext.`:""}</div>
  </div>`;
}
async function renderCalKanban(){
  try{ _cgCSS(); }catch(e){}
  const hoje=startOfDay(new Date()), hojeDs=ymd(hoje);
  const back=parseInt(state.calKanbanBack||30,10);
  const ini=addDays(hoje,-back), fim=addDays(hoje,60);
  const dsList=[]; for(let d=new Date(ini); d<=fim; d=addDays(d,1)) dsList.push(ymd(d));
  const {all}=await loadEventosRange(new Set(dsList));
  const sem7Ds=ymd(addDays(hoje,7));
  // build 142: finalizada não é atrasada. "Atrasados" = passou e NÃO foi finalizada; "Concluídos" = finalizadas (passadas ou não).
  const cols=[
    {lbl:"Atrasados", cor:"#b8402f", evs:[], dica:"passaram e não foram finalizados"},
    {lbl:"Hoje", cor:"#2f7d5b", evs:[]},
    {lbl:"Próximos 7 dias", cor:"#3A557F", evs:[]},
    {lbl:"Depois", cor:"#8A5BD6", evs:[]},
    {lbl:"Concluídos", cor:"#5c6b85", evs:[], dica:"finalizados (realizados)"}
  ];
  (all||[]).forEach(e=>{
    if(e.isFeriado||e.isAniv) return;
    if(e.finalizado){ cols[4].evs.push(e); return; }
    if(e.date<hojeDs) cols[0].evs.push(e);
    else if(e.date===hojeDs) cols[1].evs.push(e);
    else if(e.date<=sem7Ds) cols[2].evs.push(e);
    else cols[3].evs.push(e);
  });
  cols[0].evs.reverse(); cols[4].evs.reverse();
  let html=calToolbar("Kanban", "Quadro por período — arraste o olhar da esquerda (o que passou) para a direita (o que vem)")+legendHTML();
  const opts=[7,30,90];
  html+=`<div class="kan-ctrl"><span class="kan-ctrl-l">Ver o que passou:</span>${opts.map(o=>`<button class="kan-pill ${back===o?'on':''}" onclick="state.calKanbanBack=${o};render()">últimos ${o} dias</button>`).join("")}</div>`;
  html+=`<div class="kanban-grid">`;
  cols.forEach(c=>{
    html+=`<div class="kanban-col"><div class="kanban-colh" style="--kc:${c.cor}"><span>${c.lbl}${c.dica?`<small style="display:block;font-size:10px;font-weight:600;opacity:.85;text-transform:none;letter-spacing:0">${c.dica}</small>`:""}</span><span class="kanban-cnt">${c.evs.length}</span></div><div class="kanban-colb">`;
    if(!c.evs.length) html+=`<div class="kan-empty">Nada por aqui</div>`;
    c.evs.forEach(e=>{ html+=kanCard(e); });
    html+=`</div></div>`;
  });
  html+=`</div>`;
  document.getElementById("view").innerHTML=html;
}

function partsTeamOf(e,fallbackOwner){ return (e&&e.participantes&&e.participantes.length)?e.participantes.filter(p=>p.tipo==="equipe").map(p=>p.id):(fallbackOwner?[fallbackOwner]:[]); }

function partsExtOf(e){ return (e&&e.participantes&&e.participantes.length)?e.participantes.filter(p=>p.tipo==="externo"):(e&&e.guest?[e.guest]:[]); }

async function openEvento(ownerId, evId, dateStr){
  let ev=null;
  if(evId){ const d=await loadEventos(ownerId); ev=(d.events||[]).find(x=>x.id===evId); }
  if(ev && ev.tipo==="ferias")     return openFerias(ownerId, ev);
  if(ev && ev.tipo==="assembleia") return openAssembleia(ownerId, ev);
  const e = ev || { title:"",date:dateStr||ymd(new Date()),start:"09:00",end:"10:00",tipo:"evento",local:"",obs:"" };
  const teamSel = ev? partsTeamOf(ev, ownerId) : (ehAgendavel(state.userId)?[state.userId]:[]);
  const extSel  = ev? partsExtOf(ev) : [];
  const gid = ev? (ev.gid||ev.id) : "";
  const isMaster=state.user.tipo==="master";
  const canEdit = !evId || isMaster || teamSel.includes(state.userId) || e.criadoPor===state.userId;

  if(evId && !canEdit){
    const nomesEq=teamSel.filter(id=>USUARIOS[id]).map(id=>esc(USUARIOS[id].nome)).join(", ");
    const nomesEx=extSel.map(x=>esc(x.nome)+(x.email?` (${esc(x.email)})`:"")).join(", ");
    let modHTML="";
    if(e.modalidade){
      const modTxt = e.modalidade==="presencial" ? "📍 Presencial" : "💻 Online";
      const locLbl = e.modalidade==="presencial" ? "Local" : "Link";
      const locVal = e.localReuniao ? (e.modalidade==="online"
        ? `<a href="${esc(e.localReuniao)}" target="_blank">${esc(e.localReuniao)}</a>`
        : esc(e.localReuniao)) : "";
      modHTML=`<br><b>Modalidade:</b> ${modTxt}${locVal?`<br><b>${locLbl}:</b> ${locVal}`:""}`;
    }
    document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
      <div class="modal-head"><h3>${esc(e.title)}</h3><button class="x" onclick="closeModal()">×</button></div>
      <div class="modal-body">
        <div class="book-info"><b>Equipe:</b> ${nomesEq||"—"}${nomesEx?`<br><b>Externos:</b> ${nomesEx}`:""}<br><b>Data:</b> ${e.date.split("-").reverse().join("/")}<br><b>Horário:</b> ${e.start}–${e.end}${modHTML}${e.local?`<br><b>Local:</b> ${esc(e.local)}`:""}${e.obs?`<br><b>Detalhes:</b> ${esc(e.obs)}`:""}</div>
        <a class="gcal-btn" href="${gcalLink(e)}" target="_blank">${ico('calendario')} Adicionar ao Google Agenda</a>
        ${e.finalizado?`<div class="com-alert" style="background:#E9F7EE;border-color:#bfe3c8;color:#2F7A43;margin-top:12px">✓ Reunião finalizada (realizada).</div>`:`<button class="btn-fin" style="width:100%;margin-top:12px" onclick="finalizarEvento('${gid}')">✓ Finalizar reunião</button>`}
        <div style="margin-top:14px"><button class="btn-cancel" style="width:100%" onclick="closeModal()">Fechar</button></div>
      </div></div></div>`;
    return;
  }
  const _chk=u=>`<label class="chk"><input type="checkbox" name="eTeam" value="${u}" ${teamSel.includes(u)?"checked":""}><i style="background:${USUARIOS[u].cor||"#888"}"></i>${esc(USUARIOS[u].nome.split(" ")[0])}${USUARIOS[u].tipo==="gestor"?` <small style="color:#8a93a3">· ${esc(USUARIOS[u].condominio||"gestor")}</small>`:""}</label>`;
  const souGestor = state.user && state.user.tipo==="gestor";
  // build 127: gestor entra na lista (já marcado) e pode agendar só para si; equipe Mafra também pode convidar gestores
  const gestoresLista = souGestor ? gestoresDoMesmoGrupo(state.userId) : gestoresAgendaveis().filter(u=>USUARIOS[u]&&USUARIOS[u].nome);
  const teamChecks = (souGestor?`<div style="width:100%;font-size:11px;color:#8a93a3;margin:2px 0 4px">${gestoresLista.length>1?"Sua equipe ("+esc(grupoDoGestor(state.userId)||USUARIOS[state.userId].condominio||"")+")":"Você"}</div>`:"")+(souGestor?gestoresLista.map(_chk).join(""):"")
    +(souGestor?`<div style="width:100%;font-size:11px;color:#8a93a3;margin:8px 0 4px">Equipe Mafra (opcional)</div>`:"")+PESSOAS_AGENDAVEIS.map(_chk).join("")
    +(!souGestor&&gestoresLista.length?_evGestoresDropdown(gestoresLista, teamSel):"");
  const tipoBtns=[["evento","Evento"],["reuniao","Reunião"],["bloqueio","Bloqueio"]].map(([v,l])=>`<label><input type="radio" name="eTipo" value="${v}" ${e.tipo===v?"checked":""}><span>${l}</span></label>`).join("");
  // privado: só quem criou consegue ver. Só pode marcar/editar como privado o próprio dono.
  const ehPrivado = !!e.privado;
  const souDono = !evId || e.donoPrivado===state.userId || e.criadoPor===state.userId;
  const podePrivar = ehAgendavel(state.userId) && souDono;

  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>${evId?"Editar evento":"Novo evento"}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="field"><label>Título</label><input id="eTitle" value="${esc(e.title)}" placeholder="Ex.: Reunião de conselho"></div>
      ${podePrivar?`<div class="field" style="margin-bottom:10px">
        <label class="chk-priv"><input type="checkbox" id="ePrivado" ${ehPrivado?"checked":""} onchange="togglePrivado()">
          <span>🔒 Compromisso privado <small>· só você vê (não aparece para mais ninguém, nem para a liderança)</small></span></label>
      </div>`:(ehPrivado?`<div class="com-alert" style="background:#F3EEF8;border-color:#D9C9EC;color:#5B3A8A">🔒 Compromisso privado</div>`:"")}
      <div class="field" id="eTeamField"><label>Participantes da equipe <span style="font-weight:400;text-transform:none;letter-spacing:0">· bloqueia a agenda de cada um</span></label>
        <div class="chkwrap">${teamChecks}</div>
      </div>
      <div class="field" id="extFieldWrap"><label>Convidados externos</label>
        <div id="extList"></div>
        <button type="button" class="btn-add-ext" onclick="addExterno()">＋ Convidado externo</button>
      </div>
      <div class="field"><label>Data</label><input id="eDate" type="date" value="${e.date}"></div>
      <div class="row2">
        <div class="field"><label>Início</label><input id="eStart" type="time" value="${e.start}"></div>
        <div class="field"><label>Término</label><input id="eEnd" type="time" value="${e.end}"></div>
      </div>
      <div class="field"><label>Tipo</label><div class="seg">${tipoBtns}</div></div>
      <div class="field" id="eRecField">
        <label>🔁 Repetir <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--muted);font-size:11px">· cria várias ocorrências automaticamente</span></label>
        <select id="eRec" onchange="atualizarCampoRecAte()" style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:6px;font-size:14px">
          <option value="">Não repete (só nesta data)</option>
          <option value="diario" ${e.recorrencia==='diario'?'selected':''}>Diariamente</option>
          <option value="semanal" ${e.recorrencia==='semanal'?'selected':''}>Semanalmente (toda ${(()=>{ const d=new Date(e.date+'T12:00:00'); return ['domingo','segunda','terça','quarta','quinta','sexta','sábado'][d.getDay()]; })()})</option>
          <option value="quinzenal" ${e.recorrencia==='quinzenal'?'selected':''}>Quinzenalmente (a cada 2 semanas)</option>
          <option value="mensal" ${e.recorrencia==='mensal'?'selected':''}>Mensalmente (mesmo dia do mês)</option>
          <option value="trimestral" ${e.recorrencia==='trimestral'?'selected':''}>Trimestralmente (a cada 3 meses)</option>
          <option value="semestral" ${e.recorrencia==='semestral'?'selected':''}>Semestralmente (a cada 6 meses)</option>
          <option value="anual" ${e.recorrencia==='anual'?'selected':''}>Anualmente</option>
        </select>
        <div id="eRecAteBox" style="margin-top:8px;display:${e.recorrencia?'block':'none'}">
          <label style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">Repetir até</label>
          <input id="eRecAte" type="date" value="${e.recorrenciaAte||''}" style="width:100%;padding:7px 10px;border:1px solid var(--line);border-radius:6px;font-size:13px;margin-top:3px">
          <div style="font-size:11px;color:var(--muted);margin-top:3px">Se deixar em branco, repete por 1 ano a partir da data inicial.</div>
        </div>
      </div>
      ${e.modalidade?`<div class="com-alert" style="background:#EDF1F7;border-color:#C9D2E2;color:var(--navy2,#16243D)">${e.modalidade==="presencial"?"📍 Presencial":"💻 Online"}${e.localReuniao?` · ${e.modalidade==="online"?`<a href="${esc(e.localReuniao)}" target="_blank">${esc(e.localReuniao)}</a>`:esc(e.localReuniao)}`:""}</div>`:""}
      <div class="field"><label>Local</label><input id="eLocal" value="${esc(e.local||"")}" placeholder="Ex.: Salão de festas · Online"></div>
      <div class="field"><label>Detalhes / observações</label><textarea id="eObs" placeholder="Pauta, anotações…">${esc(e.obs||"")}</textarea></div>
      <button type="button" class="ata-trigger" onclick="openAta('eObs')">🎙️ Gravar ata por áudio (IA)</button>
      ${evId?`<a class="gcal-btn" href="${gcalLink(e)}" target="_blank" style="margin-bottom:14px">${ico('calendario')} Adicionar ao Google Agenda</a>`:""}
      ${e.finalizado?`<div class="com-alert" style="background:#E9F7EE;border-color:#bfe3c8;color:#2F7A43">✓ Reunião finalizada (realizada) — registrada em <b>Métricas</b>.</div>`:""}
      <div class="modal-foot">
        ${evId?`<button class="btn-del" onclick="delEvento('${gid}')">Excluir</button>`:`<button class="btn-cancel" onclick="closeModal()">Cancelar</button>`}
        ${(evId && !e.finalizado)?`<button class="btn-fin" onclick="finalizarEvento('${gid}')">✓ Finalizar</button>`:""}
        <button class="btn-primary" style="flex:1" onclick="saveEvento('${gid}')">Salvar</button>
      </div>
    </div></div></div>`;
  extSel.forEach(x=>addExterno(x.nome,x.email));
  togglePrivado();
}

function togglePrivado(){
  const on=(document.getElementById("ePrivado")||{}).checked;
  const tf=document.getElementById("eTeamField");
  const ef=document.getElementById("extFieldWrap");
  // quando privado, o compromisso é só do dono: oculta seleção de equipe e convidados externos
  if(tf) tf.style.display = on ? "none" : "";
  if(ef) ef.style.display = on ? "none" : "";
}

function addExterno(nome,email){
  const c=document.getElementById("extList"); if(!c) return;
  const enc=s=>(s||"").replace(/"/g,"&quot;");
  const row=document.createElement("div"); row.className="ext-row";
  row.innerHTML=`<input class="ext-nome" placeholder="Nome do convidado" value="${enc(nome)}">
    <input class="ext-email" type="email" placeholder="e-mail (opcional)" value="${enc(email)}">
    <button type="button" class="ext-del" title="Remover" onclick="this.parentNode.remove()">×</button>`;
  c.appendChild(row);
}

function atualizarCampoRecAte(){
  const sel=document.getElementById("eRec");
  const box=document.getElementById("eRecAteBox");
  if(!sel||!box) return;
  box.style.display = sel.value ? "block" : "none";
  if(sel.value && !document.getElementById("eRecAte").value){
    // sugere 1 ano a partir da data do evento
    const dt=document.getElementById("eDate").value;
    if(dt){
      const d=new Date(dt+"T12:00:00");
      d.setFullYear(d.getFullYear()+1);
      document.getElementById("eRecAte").value = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
    }
  }
}

function expandirRecorrencia(dataIni, regra, ateStr){
  if(!regra) return [dataIni];
  const datas=[];
  let cursor = new Date(dataIni+"T12:00:00");
  // Limite máximo: data "até" ou 12 meses
  let limite;
  if(ateStr){ limite = new Date(ateStr+"T23:59:59"); }
  else { limite = new Date(cursor); limite.setFullYear(limite.getFullYear()+1); }
  // Cap absoluto de segurança: 366 ocorrências
  const MAX = 366;
  let count=0;
  while(cursor <= limite && count < MAX){
    const ds = cursor.getFullYear()+"-"+String(cursor.getMonth()+1).padStart(2,"0")+"-"+String(cursor.getDate()).padStart(2,"0");
    datas.push(ds);
    count++;
    if(regra==="diario") cursor.setDate(cursor.getDate()+1);
    else if(regra==="semanal") cursor.setDate(cursor.getDate()+7);
    else if(regra==="quinzenal") cursor.setDate(cursor.getDate()+14);
    else if(regra==="mensal") cursor.setMonth(cursor.getMonth()+1);
    else if(regra==="trimestral") cursor.setMonth(cursor.getMonth()+3);
    else if(regra==="semestral") cursor.setMonth(cursor.getMonth()+6);
    else if(regra==="anual") cursor.setFullYear(cursor.getFullYear()+1);
    else break;
  }
  return datas;
}

async function saveEvento(gid){
  const title=document.getElementById("eTitle").value.trim();
  const date=document.getElementById("eDate").value;
  const start=document.getElementById("eStart").value;
  const end=document.getElementById("eEnd").value;
  const tipo=(document.querySelector('input[name="eTipo"]:checked')||{}).value||"evento";
  const local=document.getElementById("eLocal").value.trim();
  const obs=document.getElementById("eObs").value.trim();
  const teamIds=[...document.querySelectorAll('input[name="eTeam"]:checked')].map(c=>c.value);
  const privado=!!((document.getElementById("ePrivado")||{}).checked);
  const externos=[...document.querySelectorAll("#extList .ext-row")].map(r=>({
    nome:r.querySelector(".ext-nome").value.trim(), email:r.querySelector(".ext-email").value.trim()
  })).filter(x=>x.nome);
  if(!title){alert("Dê um título ao evento.");return;}
  if(!date||!start||!end){alert("Defina data e horários.");return;}
  if(toMin(end)<=toMin(start)){alert("O término deve ser depois do início.");return;}
  // Privado: o compromisso é só do dono (a própria pessoa logada). Ignora participantes/externos.
  let teamFinal = teamIds, extFinal = externos;
  if(privado){ teamFinal = [state.userId]; extFinal = []; }
  if(teamFinal.length===0){alert("Selecione ao menos uma pessoa — o evento entra na agenda dela.");return;}
  // Recorrência
  const recorrencia = (document.getElementById("eRec")||{}).value || "";
  const recorrenciaAte = (document.getElementById("eRecAte")||{}).value || "";
  const datas = expandirRecorrencia(date, recorrencia, recorrenciaAte);
  if(datas.length > 100){
    if(!confirm(`Esta recorrência vai criar ${datas.length} ocorrências do evento "${title}".\n\nTem certeza? Pra evitar agenda lotada, considere encurtar o período.`)) return;
  }
  const groupId = gid || ("g"+Date.now()+Math.random().toString(36).slice(2,6));
  const participantes=[...teamFinal.map(id=>({tipo:"equipe",id})), ...extFinal.map(x=>({tipo:"externo",nome:x.nome,email:x.email}))];
  const criadoPor = state.userId;
  const privProps = privado ? { privado:true, donoPrivado:state.userId } : {};
  // preserva o status "finalizado" se a reunião já tinha sido marcada como realizada
  let finProps={};
  if(gid){ for(const uid of agendaOwners()){ const dx=await loadEventos(uid); const ex=(dx.events||[]).find(x=>(x.gid||x.id)===groupId); if(ex&&ex.finalizado){ finProps={finalizado:true,finalizadoEm:ex.finalizadoEm,finalizadoPor:ex.finalizadoPor}; break; } } }
  // Remove TODOS os eventos antigos deste grupo (todas as ocorrências da série, se for edição)
  for(const uid of agendaOwners()){
    const d=await loadEventos(uid); const before=(d.events||[]).length;
    d.events=(d.events||[]).filter(x=>(x.gid||x.id)!==groupId && x.serie!==groupId);
    if((d.events||[]).length!==before) await saveEventos(uid,d);
  }
  // Cria uma ocorrência por data, com gid igual para todas (mas IDs únicos)
  const recProps = recorrencia ? { recorrencia, recorrenciaAte: recorrenciaAte||"", serie: groupId } : {};
  for(const id of teamFinal){
    const d=await loadEventos(id); if(!d.events)d.events=[];
    datas.forEach((ds, idx)=>{
      // gid: na primeira ocorrência usa groupId; nas demais cria gid próprio (para edição/exclusão individual)
      const ehPrimeira = idx === 0;
      d.events.push({
        id:"e"+Date.now()+Math.random().toString(36).slice(2,6)+"_"+idx,
        gid: ehPrimeira ? groupId : (groupId+"_"+idx),
        criadoPor, title, date:ds, start, end, tipo, local, obs, participantes,
        ts:Date.now(),
        ...recProps,
        ...privProps,
        ...finProps
      });
    });
    await saveEventos(id,d);
  }
  // Evento "modelo" para gerar o link do Google Agenda (primeira ocorrência)
  const evParaGcal = {title, date:datas[0], start, end, local, obs, participantes, recorrencia, recorrenciaAte};
  closeModal();
  // Mostra modal de sucesso oferecendo adicionar ao Google Agenda
  mostrarSucessoEvento(evParaGcal, !gid, datas.length);
  render();
}

function mostrarSucessoEvento(ev, ehNovo, totalOcorrencias){
  const link = gcalLink(ev);
  const totalTxt = totalOcorrencias > 1 ? `<div style="font-size:13px;color:var(--muted);margin-top:4px">A série tem ${totalOcorrencias} ocorrências. O Google Agenda só vai receber esta primeira — adicione manualmente outras datas se precisar.</div>` : "";
  const acao = ehNovo ? "criado" : "atualizado";
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:440px">
    <div class="modal-head"><h3>✓ Evento ${acao}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="book-info" style="background:#E9F7EE;border:1px solid #bfe3c8;color:#2F7A43;padding:11px 14px;border-radius:8px;margin-bottom:14px">
        <b>${esc(ev.title)}</b><br>
        ${ev.date.split("-").reverse().join("/")} · ${ev.start}–${ev.end}${ev.local?`<br>${ico('local')} ${esc(ev.local)}`:""}
        ${totalTxt}
      </div>
      <p style="font-size:14px;color:var(--navy);margin:0 0 12px 0">Deseja também adicionar este evento ao seu <b>Google Agenda</b>?</p>
      <a class="gcal-btn" href="${link}" target="_blank" onclick="setTimeout(closeModal,500)" style="display:block;text-align:center;text-decoration:none;background:#1A73E8;color:#fff;padding:12px;border-radius:8px;font-weight:600;margin-bottom:10px">${ico('calendario')} Adicionar ao Google Agenda</a>
      <button class="btn-cancel" onclick="closeModal()" style="width:100%">Fechar (sem adicionar)</button>
    </div>
  </div></div>`;
}

async function delEvento(gid){
  // Verifica se é evento de uma série recorrente
  let serieId = "";
  let totalSerie = 0;
  for(const uid of agendaOwners()){
    const d = await loadEventos(uid);
    const ev = (d.events||[]).find(x => (x.gid||x.id)===gid);
    if(ev && ev.serie){
      serieId = ev.serie;
      totalSerie = (d.events||[]).filter(x => x.serie===ev.serie).length;
      break;
    }
  }
  let apagarSerie = false;
  if(serieId && totalSerie > 1){
    const escolha = confirm(`Este evento faz parte de uma série recorrente com ${totalSerie} ocorrência${totalSerie>1?'s':''}.\n\nOK = apagar TODAS as ocorrências da série\nCancelar = ver outra opção`);
    if(escolha){ apagarSerie = true; }
    else {
      // Pergunta se quer apagar só esta
      if(!confirm("Apagar APENAS esta ocorrência (as outras da série continuam)?")) return;
    }
  } else {
    if(!confirm("Excluir este evento? Ele sai da agenda de todos os participantes.")) return;
  }
  for(const uid of agendaOwners()){
    const d=await loadEventos(uid); const before=(d.events||[]).length;
    if(apagarSerie){
      d.events=(d.events||[]).filter(x => x.serie !== serieId);
    } else {
      d.events=(d.events||[]).filter(x => (x.gid||x.id)!==gid);
    }
    if((d.events||[]).length!==before) await saveEventos(uid,d);
  }
  closeModal(); render();
}

async function finalizarEvento(gid){
  if(!confirm("Marcar esta reunião como FINALIZADA? Ela ficará registrada como realizada em Métricas."))return;
  const quando=Date.now();
  for(const uid of agendaOwners()){
    const d=await loadEventos(uid); let mudou=false;
    (d.events||[]).forEach(e=>{ if((e.gid||e.id)===gid && !e.finalizado){ e.finalizado=true; e.finalizadoEm=quando; e.finalizadoPor=state.userId; mudou=true; } });
    if(mudou) await saveEventos(uid,d);
  }
  closeModal(); render();
}

function openFerias(ownerId, ev, dateStr){
  const editing=!!ev;
  const pessoa = ev? (partsTeamOf(ev,ownerId)[0]||state.userId) : (PESSOAS_AGENDAVEIS.includes(state.userId)?state.userId:PESSOAS_AGENDAVEIS[0]);
  const ini = ev? (ev.feriasIni||ev.date) : (dateStr||ymd(state.calRef||new Date()));
  const dias = ev? (ev.feriasDias||10) : 10;
  const obs = ev? (ev.obs||"") : "";
  const gid = ev? (ev.gid||ev.id) : "";
  const isMaster=state.user.tipo==="master";
  const canEdit = !editing || isMaster || pessoa===state.userId || (ev&&ev.criadoPor===state.userId);
  if(editing && !canEdit){
    document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
      <div class="modal-head"><h3>🏖️ ${esc(ev.title)}</h3><button class="x" onclick="closeModal()">×</button></div>
      <div class="modal-body"><div class="book-info"><b>Período:</b> ${dias} dias a partir de ${ini.split("-").reverse().join("/")}${obs?`<br><b>Obs.:</b> ${esc(obs)}`:""}</div>
      <button class="btn-cancel" style="width:100%" onclick="closeModal()">Fechar</button></div></div></div>`;
    return;
  }
  const pSel=PESSOAS_AGENDAVEIS.map(u=>`<option value="${u}" ${u===pessoa?"selected":""}>${USUARIOS[u].nome}</option>`).join("");
  const diasBtns=[5,10,15,20,30].map(n=>`<label><input type="radio" name="fDias" value="${n}" ${n==dias?"checked":""}><span>${n}</span></label>`).join("");
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>🏖️ ${editing?"Editar férias":"Agendar férias"}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="field"><label>Pessoa</label><select id="fPessoa">${pSel}</select></div>
      <div class="field"><label>Início</label><input id="fIni" type="date" value="${ini}"></div>
      <div class="field"><label>Duração (dias)</label><div class="seg">${diasBtns}</div></div>
      <div class="field"><label>Observações</label><textarea id="fObs" placeholder="Cobertura, substituto…">${esc(obs)}</textarea></div>
      <div class="modal-foot">
        ${editing?`<button class="btn-del" onclick="removerFerias('${gid}')">🗑️ Remover férias</button>`:`<button class="btn-cancel" onclick="closeModal()">Cancelar</button>`}
        <button class="btn-primary" style="flex:1" onclick="saveFerias('${gid}')">Salvar e travar</button>
      </div>
    </div></div></div>`;
}

async function saveFerias(gid){
  const pessoa=document.getElementById("fPessoa").value;
  const ini=document.getElementById("fIni").value;
  const dias=parseInt((document.querySelector('input[name="fDias"]:checked')||{}).value||"10",10);
  const obs=document.getElementById("fObs").value.trim();
  if(!ini){alert("Defina a data de início.");return;}
  const groupId=gid||("g"+Date.now()+Math.random().toString(36).slice(2,6));
  // limpa cache para evitar leitura stale entre filter e novo push
  _storeCacheClear();
  for(const uid of PESSOAS_AGENDAVEIS){
    const d=await loadEventos(uid);
    const b=(d.events||[]).length;
    d.events=(d.events||[]).filter(x=>(x.gid||x.id)!==groupId);
    if((d.events||[]).length!==b) await saveEventos(uid,d);
  }
  _storeCacheClear(); // garante leitura fresca antes de re-adicionar
  const fim=ymd(addDays(new Date(ini+"T00:00:00"),dias-1));
  const d=await loadEventos(pessoa); if(!d.events)d.events=[];
  for(let i=0;i<dias;i++){
    const ds=ymd(addDays(new Date(ini+"T00:00:00"),i));
    d.events.push({id:"e"+Date.now()+i+Math.random().toString(36).slice(2,5),gid:groupId,criadoPor:state.userId,tipo:"ferias",title:"Férias — "+USUARIOS[pessoa].nome.split(" ")[0],date:ds,start:"00:00",end:"23:59",participantes:[{tipo:"equipe",id:pessoa}],feriasIni:ini,feriasFim:fim,feriasDias:dias,obs});
  }
  await saveEventos(pessoa,d);
  _storeCacheClear();
  closeModal(); render();
}

async function removerFerias(gid){
  if(!gid){ closeModal(); return; }
  if(!confirm("Remover este período de férias inteiro do calendário?\n\nTodos os dias serão apagados.")) return;
  _storeCacheClear();
  for(const uid of PESSOAS_AGENDAVEIS){
    const d=await loadEventos(uid);
    const b=(d.events||[]).length;
    d.events=(d.events||[]).filter(x=>(x.gid||x.id)!==gid);
    if((d.events||[]).length!==b) await saveEventos(uid,d);
  }
  _storeCacheClear();
  closeModal(); render();
}

function assembleiaInfo(ev){
  const a=ev.assembleia||{};
  const eq=[a.projetor?"Projetor":"",a.telao?"Telão":"",a.cadeiras?(a.cadeiras+" cadeiras"):""].filter(Boolean).join(", ")||"—";
  return `<div class="book-info">
    <b>Condomínio:</b> ${esc(a.condominio||"—")}<br>
    <b>Síndico:</b> ${esc(USUARIOS[a.sindico]?USUARIOS[a.sindico].nome:"—")} · <b>Zelador:</b> ${esc(a.zelador||"—")}<br>
    <b>Data:</b> ${ev.date.split("-").reverse().join("/")} · ${ev.start}–${ev.end}<br>
    <b>Natureza:</b> ${a.natureza==="extraordinaria"?"Extraordinária":"Ordinária"} · <b>Modalidade:</b> ${esc(capit(a.modalidade||"presencial"))}<br>
    <b>Jurídico:</b> ${a.juridico?"Sim":"Não"} · <b>Gravação:</b> ${a.gravar?"Sim":"Não"}<br>
    <b>Equipamentos:</b> ${eq}${ev.obs?`<br><b>Obs.:</b> ${esc(ev.obs)}`:""}
  </div>`;
}

function openAssembleia(ownerId, ev, dateStr){
  const editing=!!ev;
  const a=(ev&&ev.assembleia)||{};
  const sindico = ev? (partsTeamOf(ev,ownerId).find(id=>SINDICOS.includes(id))||a.sindico||SINDICOS[0]) : SINDICOS[0];
  const date = ev? ev.date : (dateStr||ymd(state.calRef||new Date()));
  const start= ev? ev.start : "19:00";
  const end  = ev? ev.end : "21:00";
  const gid = ev? (ev.gid||ev.id) : "";
  const isMaster=state.user.tipo==="master";
  const canEdit = !editing || isMaster || sindico===state.userId || (ev&&ev.criadoPor===state.userId);
  if(editing && !canEdit){
    document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
      <div class="modal-head"><h3>📋 Assembleia</h3><button class="x" onclick="closeModal()">×</button></div>
      <div class="modal-body">${assembleiaInfo(ev)}<button class="btn-cancel" style="width:100%;margin-top:8px" onclick="closeModal()">Fechar</button></div></div></div>`;
    return;
  }
  const condSel=condOptionsAgrupadas(a.condominio);
  const sindSel=SINDICOS.map(s=>`<option value="${s}" ${s===sindico?"selected":""}>${USUARIOS[s].nome}</option>`).join("");
  const natB=[["ordinaria","Ordinária"],["extraordinaria","Extraordinária"]].map(([v,l])=>`<label><input type="radio" name="aNat" value="${v}" ${(a.natureza||"ordinaria")===v?"checked":""}><span>${l}</span></label>`).join("");
  const modB=[["presencial","Presencial"],["online","Online"],["hibrida","Híbrida"]].map(([v,l])=>`<label><input type="radio" name="aMod" value="${v}" ${(a.modalidade||"presencial")===v?"checked":""}><span>${l}</span></label>`).join("");
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>📋 ${editing?"Editar assembleia":"Nova assembleia"}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="field"><label>Condomínio</label><select id="aCond">${condSel}</select></div>
      <div class="field"><label>Síndico operacional</label><select id="aSind">${sindSel}</select></div>
      <div class="field"><label>Nome do zelador</label><input id="aZel" value="${esc(a.zelador||"")}" placeholder="Zelador responsável"></div>
      <div class="field"><label>Data</label><input id="aDate" type="date" value="${date}"></div>
      <div class="row2"><div class="field"><label>Início</label><input id="aStart" type="time" value="${start}"></div><div class="field"><label>Término</label><input id="aEnd" type="time" value="${end}"></div></div>
      <div class="field"><label>Natureza</label><div class="seg">${natB}</div></div>
      <div class="field"><label>Modalidade</label><div class="seg">${modB}</div></div>
      <div class="field"><label>Recursos</label>
        <div class="chkwrap">
          <label class="chk"><input type="checkbox" id="aJur" ${a.juridico?"checked":""}>⚖️ Jurídico</label>
          <label class="chk"><input type="checkbox" id="aGrav" ${a.gravar?"checked":""}>🔴 Gravar</label>
          <label class="chk"><input type="checkbox" id="aProj" ${a.projetor?"checked":""}>📽️ Projetor</label>
          <label class="chk"><input type="checkbox" id="aTelao" ${a.telao?"checked":""}>🖥️ Telão</label>
        </div>
      </div>
      <div class="field"><label>Cadeiras (quantidade)</label><input id="aCad" type="number" min="0" value="${a.cadeiras||""}" placeholder="ex.: 50"></div>
      <div class="field"><label>Observações</label><textarea id="aObs" placeholder="Pauta, convocação…">${esc((ev&&ev.obs)||"")}</textarea></div>
      <div class="modal-foot">
        ${editing?`<button class="btn-del" onclick="delEvento('${gid}')">Excluir</button>`:`<button class="btn-cancel" onclick="closeModal()">Cancelar</button>`}
        <button class="btn-primary" style="flex:1" onclick="saveAssembleia('${gid}')">Salvar e travar</button>
      </div>
    </div></div></div>`;
}

async function saveAssembleia(gid){
  const condominio=document.getElementById("aCond").value;
  const sindico=document.getElementById("aSind").value;
  const zelador=document.getElementById("aZel").value.trim();
  const date=document.getElementById("aDate").value;
  const start=document.getElementById("aStart").value;
  const end=document.getElementById("aEnd").value;
  const natureza=(document.querySelector('input[name="aNat"]:checked')||{}).value||"ordinaria";
  const modalidade=(document.querySelector('input[name="aMod"]:checked')||{}).value||"presencial";
  const juridico=document.getElementById("aJur").checked;
  const gravar=document.getElementById("aGrav").checked;
  const projetor=document.getElementById("aProj").checked;
  const telao=document.getElementById("aTelao").checked;
  const cadeiras=document.getElementById("aCad").value;
  const obs=document.getElementById("aObs").value.trim();
  if(!date||!start||!end){alert("Defina data e horários.");return;}
  if(toMin(end)<=toMin(start)){alert("O término deve ser depois do início.");return;}
  const groupId=gid||("g"+Date.now()+Math.random().toString(36).slice(2,6));
  for(const uid of agendaOwners()){ const d=await loadEventos(uid); const b=(d.events||[]).length; d.events=(d.events||[]).filter(x=>(x.gid||x.id)!==groupId); if((d.events||[]).length!==b) await saveEventos(uid,d); }
  const assembleia={condominio,sindico,zelador,natureza,modalidade,juridico,gravar,projetor,telao,cadeiras};
  const title="Assembleia "+(natureza==="extraordinaria"?"Extra.":"Ord.")+" — "+condominio;
  const d=await loadEventos(sindico); if(!d.events)d.events=[];
  d.events.push({id:"e"+Date.now()+Math.random().toString(36).slice(2,6),gid:groupId,criadoPor:state.userId,tipo:"assembleia",title,date,start,end,participantes:[{tipo:"equipe",id:sindico}],assembleia,obs});
  await saveEventos(sindico,d);
  closeModal(); render();
}

async function saveFacPrefs(){ await storeSet("mafra:facultativos", JSON.stringify(FAC_PREFS)); }

function abrirFeriados(){
  const ano = (state.calRef||new Date()).getFullYear();
  const lista = feriadosDoAno(ano).slice().sort((a,b)=> a.md<b.md?-1:1);
  const isMaster = state.user.tipo==="master";
  let linhas = lista.map(f=>{
    const ds = ano+"-"+f.md;
    if(f.tipo==="nacional"){
      return `<div class="fer-row"><span class="fer-d">${f.md.split("-").reverse().join("/")}</span><span class="fer-n">${esc(f.nome)} <span class="cond-tag" style="background:#FCE9E6;color:#B0392B">Nacional</span></span><span class="fer-st">Bloqueado</span></div>`;
    }
    const pref = prefFacultativo(ds);
    const sel = isMaster ? `<select onchange="setFac('${ds}',this.value)">
        <option value="folga" ${pref==='folga'?'selected':''}>Não trabalha (bloqueia)</option>
        <option value="meio" ${pref==='meio'?'selected':''}>Meio período (manhã)</option>
        <option value="trabalha" ${pref==='trabalha'?'selected':''}>Trabalha normal</option>
      </select>` : `<span class="fer-st">${pref==='folga'?'Não trabalha':pref==='meio'?'Meio período':'Trabalha'}</span>`;
    return `<div class="fer-row"><span class="fer-d">${f.md.split("-").reverse().join("/")}</span><span class="fer-n">${esc(f.nome)} <span class="cond-tag impl">Facultativo</span></span>${sel}</div>`;
  }).join("");
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>${ico('calendario')} Feriados ${ano}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="ata-hint">Feriados <b>nacionais</b> e o municipal de Ribeirão Preto bloqueiam a agenda automaticamente. Nos <b>facultativos</b>, ${isMaster?"escolha se a equipe trabalha, folga ou faz meio período":"o status é definido pela administração"}.</p>
      <div class="fer-list">${linhas}</div>
      <div class="modal-foot"><button class="btn-primary" style="flex:1" onclick="closeModal();render()">Fechar</button></div>
    </div></div></div>`;
}

async function setFac(ds, val){
  FAC_PREFS[ds]=val;
  await saveFacPrefs();
}


