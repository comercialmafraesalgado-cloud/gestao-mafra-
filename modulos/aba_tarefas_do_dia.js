/* ============================================================
   GESTÃO MAFRA — ABA TAREFAS DO DIA
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: renderHoje, hojeNav, hojeHoje, feedbackDoDia, formatFeedbackIA */

async function renderHoje(){
  if(!state.hojeDate) state.hojeDate=ymd(new Date());
  const ds=state.hojeDate; const d=new Date(ds+"T00:00:00");
  document.getElementById("view").innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  const isMaster=state.user.tipo==="master";
  const fp=state.hojeFiltro||"";
  // 1) EVENTOS do dia (reuniões, férias, assembleias) — vêm de mafra:eventos
  const {byDay}=await loadEventosRange(new Set([ds]));
  let eventos=byDay[ds]||[];
  if(!isMaster) eventos=eventos.filter(e=> e.isAniv || (e.teamParts||[]).includes(state.userId));
  else if(fp) eventos=eventos.filter(e=> e.isAniv || (e.teamParts||[]).includes(fp) || e.criadoPor===fp);
  // 2) TAREFAS da agenda semanal — vêm de mafra:agenda (o que a Julia/equipe cadastra)
  const wk=weekKeyOfDate(ds);
  const dow=d.getDay(); // 0=dom ... 6=sab
  const diaInfo=DIAS.find(x=>x.off===(dow===0?6:dow-1)); // mapeia para seg..sex (sab/dom => undefined)
  const diaK=diaInfo?diaInfo.k:null;
  // de quem buscar as tarefas
  let pessoas;
  if(!isMaster) pessoas=[state.userId];
  else if(fp) pessoas=[fp];
  else pessoas=PESSOAS_AGENDAVEIS;
  let tarefas=[];
  if(diaK){
    for(const uid of pessoas){
      try{
        const ag=await loadAgenda(uid);
        const lista=(ag.weeks&&ag.weeks[wk])||[];
        lista.filter(t=>t.dia===diaK).forEach(t=>tarefas.push({...t, _uid:uid}));
      }catch(e){}
    }
  }
  const label=capit(d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}));
  const escopo = isMaster ? (fp&&USUARIOS[fp]?("Agenda de "+USUARIOS[fp].nome.split(" ")[0]):"Equipe toda") : "sua agenda";
  // quem é o foco do feedback: não-master = ele mesmo; master = a pessoa filtrada (se houver)
  const focoFb = !isMaster ? state.userId : (fp||null);
  const lblFb = (focoFb===state.userId) ? "📊 Feedback do meu dia" : (focoFb?("📊 Feedback do dia de "+USUARIOS[focoFb].nome.split(" ")[0]):"");
  let html=`<div class="weeknav">
    <button class="nav-btn" onclick="hojeNav(-1)">‹</button>
    <button class="nav-btn" onclick="hojeNav(1)">›</button>
    <div><h2>Tarefas do dia</h2><div class="range">${label} · ${escopo}</div></div>
    <button class="today-btn" onclick="hojeHoje()">Hoje</button>
    <div class="spacer"></div>
    ${focoFb?`<button class="btn-gold" onclick="feedbackDoDia('${focoFb}','${ds}')">${lblFb}</button>`:""}
    <input type="date" class="hoje-date" value="${ds}" onchange="state.hojeDate=this.value;render()">
  </div>`;
  if(isMaster){
    html+=`<div class="gv-filtros">
      <select class="gv-busca" style="flex:1;font-weight:600" onchange="state.hojeFiltro=this.value;render()">
        <option value="">👥 Agenda de todos</option>
        ${PESSOAS_AGENDAVEIS.map(uid=>`<option value="${uid}" ${fp===uid?"selected":""}>${esc(USUARIOS[uid].nome)}</option>`).join("")}
      </select>
      ${fp?`<button class="btn-ghost" onclick="state.hojeFiltro='';render()">Limpar</button>`:""}
    </div>`;
  }
  html+=`<div class="dia-wrap">`;
  // tarefas (da agenda semanal) — mesmo estilo de card das reuniões (.evrow)
  if(tarefas.length){
    html+=`<div class="notif-sec" style="margin:4px 0 10px">📋 Tarefas planejadas</div>`;
    tarefas.forEach(t=>{
      const dono=USUARIOS[t._uid]?USUARIOS[t._uid].nome.split(" ")[0]:"";
      const cor=USUARIOS[t._uid]?USUARIOS[t._uid].cor:"#888";
      const st=t.status||"planejado";
      const stIcon = st==="concluido"?"✓":(st==="em_andamento"?"◐":"○");
      const stLabel = statusLabel(st);
      const stTag = st==="concluido"?"ok":(st==="em_andamento"?"warn":"plan");
      const titulo = t.tarefa || t.titulo || "Tarefa";
      const meta=[
        t.condominio?(""+ico('local')+" "+esc(t.condominio)):"",
        (isMaster&&!fp)?esc(dono):"",
        t.horas?(esc(t.horas)+"h"):""
      ].filter(Boolean).join(" · ");
      html+=`<div class="evrow" style="--c:${cor}" onclick="setTab('tarefas')">
        <div class="evrow-time"><b>${stIcon}</b></div>
        <div class="evrow-body">
          <div class="evrow-ttl">${esc(titulo)} <span class="evrow-tag tt-${stTag}">${stLabel}</span></div>
          <div class="evrow-meta"><i style="background:${cor}"></i><span>${meta||"Tarefa da semana"}</span></div>
        </div>
      </div>`;
    });
  }
  // eventos (reuniões etc)
  if(eventos.length){
    html+=`<div class="notif-sec" style="margin:14px 0 8px">${ico('calendario')} Compromissos e reuniões</div>`;
    eventos.forEach(e=>{ html+=evRow(e); });
  }
  if(!tarefas.length && !eventos.length){
    html+=`<div class="dia-empty">Nada para este dia${fp&&USUARIOS[fp]?(" para "+esc(USUARIOS[fp].nome.split(" ")[0])):""}.</div>`;
  }
  html+=`</div>`;
  document.getElementById("view").innerHTML=html;
}

function hojeNav(dir){ const d=new Date((state.hojeDate||ymd(new Date()))+"T00:00:00"); d.setDate(d.getDate()+dir); state.hojeDate=ymd(d); render(); }

function hojeHoje(){ state.hojeDate=ymd(new Date()); render(); }

async function feedbackDoDia(uid, ds){
  const acc=USUARIOS[uid]; if(!acc){ alert("Pessoa não encontrada."); return; }
  const ehEu=(uid===state.userId);
  const d=new Date(ds+"T00:00:00");
  const label=capit(d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"}));
  // tarefas do dia
  const wk=weekKeyOfDate(ds); const dow=d.getDay();
  const diaInfo=DIAS.find(x=>x.off===(dow===0?6:dow-1)); const diaK=diaInfo?diaInfo.k:null;
  let tarefas=[];
  if(diaK){ try{ const ag=await loadAgenda(uid); tarefas=((ag.weeks&&ag.weeks[wk])||[]).filter(t=>t.dia===diaK); }catch(e){} }
  // reuniões do dia
  let reunioes=[];
  try{ const {byDay}=await loadEventosRange(new Set([ds])); reunioes=(byDay[ds]||[]).filter(e=>!e.isAniv && !e.isFeriado && (e.teamParts||[]).includes(uid)); }catch(e){}
  const total=tarefas.length, feitas=tarefas.filter(t=>t.status==="concluido").length;
  const pend=total-feitas, horas=tarefas.reduce((a,t)=>a+(parseFloat(t.horas)||0),0);

  // modal
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:480px">
    <div class="modal-head"><h3>📊 ${ehEu?"Feedback do meu dia":"Feedback · "+esc(acc.nome.split(" ")[0])}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">${label}</p>
      <div class="termo-stats">
        <div><b>${total}</b><span>tarefas</span></div>
        <div><b>${feitas}</b><span>concluídas</span></div>
        <div><b>${reunioes.length}</b><span>reuniões</span></div>
        ${horas?`<div><b>${horas%1?horas.toFixed(1):horas}h</b><span>horas</span></div>`:""}
      </div>
      <div id="fbIA" class="termo-ia"><div class="termo-loading">✨ Analisando o seu dia…</div></div>
    </div></div></div>`;

  if(total===0 && reunioes.length===0){
    const el=document.getElementById("fbIA");
    if(el) el.innerHTML=`<div class="termo-sec-b">Não há tarefas nem reuniões registradas para este dia. ${ehEu?"Aproveite para planejar ou descansar! 🌿":""}</div>`;
    return;
  }

  const listaTar=tarefas.map(t=>`- ${t.tarefa||t.titulo||"tarefa"}${t.condominio?" ("+t.condominio+")":""} [${statusLabel(t.status)}]${t.horas?" "+t.horas+"h":""}`).join("\n")||"(nenhuma)";
  const listaReu=reunioes.map(e=>`- ${e.title} ${e.start}-${e.end}`).join("\n")||"(nenhuma)";
  const prompt=`Você é um mentor de produtividade e bem-estar da Mafra Gestão Integrada. Faça uma análise do dia de trabalho ${ehEu?"DESTA PESSOA, falando com ela em segunda pessoa (use 'você')":"de "+acc.nome}. Responda em PT-BR, breve, acolhedor e prático. NÃO use markdown nem asteriscos. Estruture assim:

COMO FOI O DIA: (2-3 frases sobre a produtividade — o que foi concluído, o ritmo, se o dia rendeu)

CARGA: (1-2 frases — avalie se a quantidade de tarefas e reuniões para um único dia foi equilibrada, leve ou excessiva. Se foi demanda demais para um dia só, diga isso claramente e sugira distribuir parte para outros dias)

SUGESTÃO: (1-2 sugestões práticas para o próximo dia — priorização, distribuição, foco)

Dados do dia (${label}):
Tarefas (${total}, ${feitas} concluídas, ${pend} pendentes, ${horas}h):
${listaTar}
Reuniões (${reunioes.length}):
${listaReu}`;

  try{
    const resp=await chamarIA(prompt, 700);
    const el=document.getElementById("fbIA");
    if(el) el.innerHTML=formatFeedbackIA(resp);
  }catch(err){
    const el=document.getElementById("fbIA");
    if(el) el.innerHTML=`<div class="termo-erro">Não consegui gerar a análise agora (${esc(err.message)}). Os números do dia estão acima.</div>`;
  }
}

function formatFeedbackIA(txt){
  const secoes=[
    {k:"COMO FOI O DIA",ic:"📊",cor:"#16243D"},
    {k:"CARGA",ic:"⚖️",cor:"#C9A24B"},
    {k:"SUGESTÃO",ic:"💡",cor:"#2F9E44"}
  ];
  let out="";
  secoes.forEach(s=>{
    const re=new RegExp(s.k+"\\s*:?\\s*([\\s\\S]*?)(?=(COMO FOI O DIA|CARGA|SUGESTÃO)\\s*:|$)","i");
    const m=txt.match(re);
    if(m&&m[1].trim()){
      out+=`<div class="termo-sec"><div class="termo-sec-h" style="color:${s.cor}">${s.ic} ${s.k.charAt(0)+s.k.slice(1).toLowerCase()}</div><div class="termo-sec-b">${esc(m[1].trim()).replace(/\n/g,"<br>")}</div></div>`;
    }
  });
  return out || `<div class="termo-sec-b">${esc(txt).replace(/\n/g,"<br>")}</div>`;
}


