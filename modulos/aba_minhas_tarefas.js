/* ============================================================
   GESTÃO MAFRA — ABA MINHAS TAREFAS
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: _projOcorrencia, finalizarOcorrencia, reabrirOcorrencia, abrirDiaLid, metaPadraoCond, saveCondominios, metaTotalDe, todayDayKey, setLidPeriodo, personalizarLidData, _lpAtalho, aplicarIntervaloLid, _semanaDaData, _diaKeyDeData, _coletarTarefasIntervalo, renderSindico, taskCard, eventoCardSemana, _labelRecorrencia, _labelRecorrenciaCurto, openTask, editTask, saveTask, delTask, finalizarTarefa, _acharTarefaSemana, remanejarTarefa, confirmarRemanejar, renderLideranca, navMesLid, navAnoLid, abrirMesLid, taskLidCard, editTaskLid, openTaskLid, campoRecorrencia, togglePersonalizado, saveTaskLid, lerRecorrencia, _tarefaOcorreEm, openMeusCondominios, pintaMeusCondominios, toggleCond, setImpl, setMeta, salvarMeusCondominios */

function metaPadraoCond(nome){
  return COND_DIA_INTEIRO.includes(nome) ? (META_DIARIA*DIAS_UTEIS) : META_SEMANAL_PADRAO;
}

async function saveCondominios(sindicoId, data){
  await storeSet("mafra:condominios:"+sindicoId, JSON.stringify(data));
  return true;
}

function metaTotalDe(cfg){
  if(!cfg || !cfg.itens || !cfg.itens.length) return META_HORAS;
  return cfg.itens.reduce((s,c)=> s + (parseFloat(c.meta)|| metaPadraoCond(c.nome)), 0);
}

function todayDayKey(){
  if(!isCurrentWeek(state.semana)) return null;
  const dow=new Date().getDay(); const map={1:"seg",2:"ter",3:"qua",4:"qui",5:"sex"};
  return map[dow]||null;
}

function setLidPeriodo(p){
  state.lidPeriodo=p;
  if(p==="hoje"){ state.lidDataRef=ymd(new Date()); state.semana=0; }
  else if(p==="amanha"){ const d=new Date(); d.setDate(d.getDate()+1); state.lidDataRef=ymd(d); }
  else if(p==="semana"){ state.semana=0; state.lidDataRef=null; }
  else if(p==="mes"||p==="ano"){ state.lidDataRef=ymd(new Date()); }
  render();
}

function personalizarLidData(){
  const ini=state.lidIni||ymd(new Date());
  const fim=state.lidFim||ymd(new Date());
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:420px">
    <div class="modal-head"><h3>${ico('calendario')} Período personalizado</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="ata-hint">Escolha o período das tarefas que quer ver — pode ser para trás (tarefas antigas) ou para frente (futuras).</p>
      <div class="row2">
        <div class="field"><label>De</label><input type="date" id="lpIni" value="${ini}"></div>
        <div class="field"><label>Até</label><input type="date" id="lpFim" value="${fim}"></div>
      </div>
      <div class="per-atalhos">
        <button class="per-btn" onclick="_lpAtalho(-7)">Últimos 7 dias</button>
        <button class="per-btn" onclick="_lpAtalho(-30)">Últimos 30 dias</button>
        <button class="per-btn" onclick="_lpAtalho(7)">Próximos 7 dias</button>
        <button class="per-btn" onclick="_lpAtalho(30)">Próximos 30 dias</button>
      </div>
      <div class="modal-foot">
        <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" style="flex:1" onclick="aplicarIntervaloLid()">Ver tarefas</button>
      </div>
    </div></div></div>`;
}

function _lpAtalho(dias){
  const hoje=new Date(); const outra=new Date(); outra.setDate(outra.getDate()+dias);
  const a=dias<0?outra:hoje, b=dias<0?hoje:outra;
  document.getElementById("lpIni").value=ymd(a);
  document.getElementById("lpFim").value=ymd(b);
}

function aplicarIntervaloLid(){
  let ini=document.getElementById("lpIni").value, fim=document.getElementById("lpFim").value;
  if(!ini||!fim){ alert("Escolha a data de início e de fim."); return; }
  if(fim<ini){ const t=ini; ini=fim; fim=t; }   // corrige se inverteu
  state.lidPeriodo="intervalo"; state.lidIni=ini; state.lidFim=fim;
  closeModal(); render();
}

function _semanaDaData(dateStr){
  const [a,m,d]=dateStr.split("-").map(Number);
  const alvo=new Date(a,m-1,d); alvo.setHours(0,0,0,0);
  const seg0=mondayOf(0);
  return Math.floor(Math.round((alvo-seg0)/86400000)/7);
}

function _diaKeyDeData(dt){ const map={1:"seg",2:"ter",3:"qua",4:"qui",5:"sex"}; return map[dt.getDay()]||null; }

async function _coletarTarefasIntervalo(ini, fim){
  const agenda=await loadAgenda(state.userId);
  let evs=[]; try{ const ev=await loadEventos(state.userId); evs=(ev.events||[]).filter(e=>e.tipo!=="bloqueio"&&e.tipo!=="ferias"); }catch(e){}
  const out={tasks:[], evs:[]};
  // todas as tarefas recorrentes (de qualquer semana) para projetar nas datas do intervalo
  const recorrentes=[];
  Object.values(agenda.weeks||{}).forEach(arr=>(arr||[]).forEach(t=>{ if(t.recorrencia) recorrentes.push(t); }));
  const cur=new Date(ini); cur.setHours(0,0,0,0);
  const end=new Date(fim); end.setHours(0,0,0,0);
  while(cur<=end){
    const ds=ymd(cur);
    const dk=_diaKeyDeData(cur);
    if(dk){
      const wk=weekKey(_semanaDaData(ds));
      const semTasks=(agenda.weeks[wk]||[]).filter(t=>t.dia===dk);
      semTasks.forEach(t=>out.tasks.push({...t,_data:ds}));
    }
    // projeta recorrentes que caem nesta data (não duplica a ocorrência-base)
    recorrentes.forEach(t=>{ if(_tarefaOcorreEm(t,ds)){ out.tasks.push(_projOcorrencia(t,ds)); } });
    evs.filter(e=>e.date===ds).forEach(e=>out.evs.push(e));
    cur.setDate(cur.getDate()+1);
  }
  return out;
}

async function renderSindico(){
  const view=document.getElementById("view");
  view.innerHTML = '<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  const data = await loadAgenda(state.userId);
  const cfg = await loadCondominios(state.userId);
  const wk = weekKey(state.semana);
  const tasks = (data.weeks[wk]||[]);
  // reuniões/eventos da semana (vêm do calendário) — para aparecerem junto das tarefas
  let evsSemana=[];
  try{ const evData=await loadEventos(state.userId); evsSemana=(evData.events||[]).filter(e=>e.tipo!=="bloqueio"&&e.tipo!=="ferias"); }catch(e){}
  const totalH = tasks.reduce((s,t)=>s+(parseFloat(t.horas)||0),0);
  const feitas = tasks.filter(t=>t.status==="concluido").length;
  const metaTotal = metaTotalDe(cfg);
  const pct = Math.min(100, Math.round(totalH/metaTotal*100));
  const hit = totalH>=metaTotal;
  const nCond = (cfg.itens||[]).length;

  let html = `
  <div class="weeknav">
    <button class="nav-btn" onclick="changeWeek(-1)">‹</button>
    <button class="nav-btn" onclick="changeWeek(1)">›</button>
    <div class="weeknav-tit" onclick="escolherSemana(this)" title="Escolher uma data">
      <h2>${isCurrentWeek(state.semana)?"Esta semana":"Semana"} <span class="wk-cal">${ico('calendario')}</span></h2>
      <div class="range">${rangeLabel(state.semana)}</div>
    </div>
    ${isCurrentWeek(state.semana)?"":'<button class="today-btn" onclick="goToday()">Hoje</button>'}
    <div class="spacer"></div>
    <button class="btn-ghost" onclick="openMeusCondominios()">${ico('predio')} Meus condomínios</button>
    <button class="btn-gold" onclick="termometro('${state.userId}')">🌡️ Meu termômetro</button>
    <button class="btn-ghost" onclick="window.print()">Imprimir</button>
  </div>`;

  if(nCond===0){
    html += `<div class="com-alert">${ico('predio')} Você ainda não definiu seus condomínios. Clique em <b>"Meus condomínios"</b> para escolher quais você cuida e a meta de horas de cada um.</div>`;
  }

  html += `
  <div class="metabar">
    <div class="meta-item"><span class="lbl">Tarefas</span><span class="val">${tasks.length}</span></div>
    <div class="meta-item"><span class="lbl">Concluídas</span><span class="val">${feitas}<small>/${tasks.length}</small></span></div>
    <div class="meta-item"><span class="lbl">Condomínios</span><span class="val">${nCond}</span></div>
    <div class="meta-item"><span class="lbl">Horas técnicas</span><span class="val">${(totalH%1?totalH.toFixed(1):totalH)}<small>/${metaTotal}h</small></span></div>
    <div class="bar">
      <div class="track"><div class="fill ${hit?'ok':''}" style="width:${pct}%"></div></div>
      <div class="cap"><span>${hit?'✓ Meta semanal atingida':'Meta semanal (soma dos condomínios)'}</span><span>${pct}%</span></div>
    </div>
  </div>`;

  // resumo dos condomínios e suas metas
  if(nCond>0){
    html += `<div class="cond-resumo">`+ (cfg.itens||[]).map(c=>{
      const meta=parseFloat(c.meta)||metaPadraoCond(c.nome);
      const tag = c.implantacao ? `<span class="cond-tag impl">Implantação</span>` : (COND_DIA_INTEIRO.includes(c.nome)?`<span class="cond-tag dia">4h/dia</span>`:``);
      return `<span class="cond-pill">${ico('predio')} ${esc(c.nome)} <b>${meta}h/sem</b>${tag}</span>`;
    }).join("") + `</div>`;
  }

  html += `<div class="grid">`;

  const tDay = todayDayKey();
  // build 129: tarefas de lista (modo Listas) com data nesta semana aparecem no dia, como lembrete
  let liPorDia={}; try{ liPorDia=await listasTarefasPorData(state.userId, new Set(DIAS.map(d=>ymd(dateOfDay(state.semana,d.off))))); }catch(e){ liPorDia={}; }
  DIAS.forEach(dia=>{
    const dt = dateOfDay(state.semana, dia.off);
    const ds = ymd(dt);
    const dayTasks = tasks.filter(t=>t.dia===dia.k);
    const dayEvs = evsSemana.filter(e=>e.date===ds);
    const dayLi = liPorDia[ds]||[];
    html += `<div class="daycol ${tDay===dia.k?'is-today':''}">
      <div class="dayhead"><span class="d">${dia.nome}</span><span class="dt">${fmt(dt)}</span></div>
      <div class="daybody">`;
    if(dayTasks.length===0 && dayEvs.length===0 && dayLi.length===0) html += '<div class="empty-day">Sem tarefas</div>';
    dayEvs.forEach(e=>{ html += eventoCardSemana(e); });
    dayTasks.forEach(t=>{ html += taskCard(t); });
    dayLi.forEach(t=>{ html += _liChipSemana(t); });
    html += `<button class="add-task" onclick="openTask('${dia.k}')">+ Adicionar tarefa</button>
      </div></div>`;
  });
  html += `</div>`;
  try{ html += _liQuadroSemData(await listasTarefasSemData(state.userId)); }catch(e){}
  view.innerHTML = html;
  try{ _liBarraModo("semana"); }catch(e){}
  window.__tasksCache = tasks; // p/ editar
  pintarBadgesComentarios();
}

function taskCard(t){
  const h = (parseFloat(t.horas)||0);
  const tEsc=esc((t.tarefa||'').replace(/'/g,'’'));
  const recChip = t.recorrencia ? `<span class="chip chip-rec" title="${esc(_labelRecorrencia(t.recorrencia))}">🔁 ${esc(_labelRecorrenciaCurto(t.recorrencia))}</span>` : "";
  return `<div class="task ${statusCls(t.status)}" onclick="editTask('${t.id}')" style="cursor:pointer">    <div class="cnd"><span class="pin">${ico('local')}</span>${esc(t.condominio)}</div>
    <div class="ttl">${esc(t.tarefa)}</div>
    ${t.acoes?`<div class="acs">${esc(t.acoes)}</div>`:""}
    <div class="com-preview" id="cp_${t.id}" style="display:none"></div>
    <div class="foot">
      ${h?`<span class="chip h">${h%1?h.toFixed(1):h}h</span>`:""}
      <span class="chip ${statusCls(t.status)}">${statusLabel(t.status)}</span>
      ${recChip}
      <span class="acts">
        ${t.status!=="concluido"?`<button class="icon-btn fin" title="Finalizar tarefa" onclick="event.stopPropagation();finalizarTarefa('${t.id}')">✓</button>`:""}
        <button class="icon-btn com-btn" id="cb_${t.id}" title="Comentários" onclick="event.stopPropagation();abrirComentarios('${t.id}','${tEsc}','${state.userId}')">💬</button>
        <button class="icon-btn" title="Remanejar para outra data" onclick="event.stopPropagation();remanejarTarefa('${t.id}')">${ico('calendario')}</button>
        <button class="icon-btn" title="Editar" onclick="event.stopPropagation();editTask('${t.id}')">✎</button>
        <button class="icon-btn" title="Excluir" onclick="event.stopPropagation();delTask('${t.id}')">🗑</button>
      </span>
    </div>
    ${t.evidencia?`<div class="ev"><b>Evidência:</b> ${esc(t.evidencia)}</div>`:""}
  </div>`;
}

function eventoCardSemana(e){
  const fin=e.finalizado;
  const meta=[(e.start?(e.start+(e.end?"–"+e.end:"")):""), (e.local?(""+ico('local')+" "+esc(e.local)):"")].filter(Boolean).join(" · ");
  const recIco = e.recorrencia ? `<span class="chip" style="background:#FFFBF1;color:var(--gold);border:1px solid #C9A24B33" title="${esc(_labelRecorrencia(e.recorrencia))}">🔁 ${esc(_labelRecorrenciaCurto(e.recorrencia))}</span>` : "";
  return `<div class="task evt-card${fin?' done':''}" onclick="openEvento('${state.userId}','${e.id}')" style="cursor:pointer">
    <div class="cnd"><span class="pin">${e.privado?"🔒":"📅"}</span>${esc(e.title||"Reunião")}</div>
    ${meta?`<div class="acs">${meta}</div>`:""}
    <div class="foot">
      <span class="chip h">${tipoLabel(e.tipo)}</span>
      ${e.privado?`<span class="chip" style="background:#F3EEF8;color:#5B3A8A;border:1px solid #D9C9EC">🔒 Privado</span>`:""}
      ${recIco}
      ${fin?`<span class="chip s-concluido">✓ Realizada</span>`:`<span class="chip s-planejado">Agendada</span>`}
    </div>
  </div>`;
}

function _labelRecorrencia(r){
  return {
    diario:"Repete diariamente",
    semanal:"Repete semanalmente",
    quinzenal:"Repete a cada 2 semanas",
    mensal:"Repete mensalmente",
    trimestral:"Repete a cada 3 meses",
    semestral:"Repete a cada 6 meses",
    anual:"Repete anualmente",
    personalizado:"Repetição personalizada"
  }[r] || "Recorrente";
}

function _labelRecorrenciaCurto(r){
  return {diario:"diário",semanal:"semanal",quinzenal:"quinzenal",mensal:"mensal",trimestral:"trimestral",semestral:"semestral",anual:"anual",personalizado:"personalizado"}[r] || "rec.";
}

function openTask(diaPre, task){
  const editing = !!task;
  const t = task || { id:"", dia:diaPre||"seg", condominio:"", tarefa:"", acoes:"", horas:"", status:"planejado", evidencia:"" };
  const opts = condOptionsAgrupadas(t.condominio);
  const diaBtns = DIAS.map(d=>`<label><input type="radio" name="mDia" value="${d.k}" ${t.dia===d.k?"checked":""}><span>${d.nome.slice(0,3)}</span></label>`).join("");
  const stBtns = [["planejado","Planejado"],["em_andamento","Andamento"],["concluido","Concluído"]]
    .map(([v,l])=>`<label><input type="radio" name="mSt" value="${v}" ${t.status===v?"checked":""}><span>${l}</span></label>`).join("");

  document.getElementById("modalMount").innerHTML = `
  <div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal">
      <div class="modal-head">
        <h3>${editing?"Editar tarefa":"Nova tarefa"}</h3>
        <button class="x" onclick="closeModal()">×</button>
      </div>
      <div class="modal-body">
        <div class="field"><label>Condomínio</label>
          <select id="mCond"><option value="" ${!t.condominio?"selected":""} disabled>Selecione o condomínio…</option>${opts}</select>
        </div>
        <div class="field"><label>Tarefa a executar</label>
          <input id="mTarefa" value="${esc(t.tarefa)}" placeholder="Ex.: Vistoria das áreas comuns">
        </div>
        <div class="field"><label>Ações / detalhes</label>
          <textarea id="mAcoes" placeholder="O que será feito, com quem, pontos a verificar…">${esc(t.acoes)}</textarea>
          <div class="tarefa-tools"><button type="button" class="tarefa-dit" onclick="ditarToggle('mAcoes',this)">🎙️ Ditar por voz</button></div>
        </div>
        <div class="row2">
          <div class="field"><label>Dia da semana</label>
            <div class="seg">${diaBtns}</div>
          </div>
          <div class="field"><label>Horas técnicas</label>
            <input id="mHoras" type="number" step="0.5" min="0" value="${t.horas}" placeholder="ex.: 2">
          </div>
        </div>
        <div class="field"><label>Status</label>
          <div class="seg st">${stBtns}</div>
        </div>
        <div class="field"><label>Evidência / comprovação <span style="font-weight:400;text-transform:none;letter-spacing:0">(ata, fotos, presença)</span></label>
          <input id="mEvid" value="${esc(t.evidencia)}" placeholder="Ex.: Fotos no grupo · Ata nº 12 · Presença registrada">
        </div>
        ${editing?`<div class="field"><button type="button" class="tarefa-remanejar" onclick="remanejarTarefa('${t.id}')">${ico('calendario')} Remanejar para outra data</button><div class="tarefa-remanejar-hint">Não deu pra fazer nesse dia? Jogue a tarefa para outra data — pode ser em outra semana.</div></div>`:""}
        <div class="modal-foot">
          ${editing?`<button class="btn-del" onclick="delTask('${t.id}')">Excluir</button>`:`<button class="btn-cancel" onclick="closeModal()">Cancelar</button>`}
          <button class="btn-primary" style="flex:1" onclick="saveTask('${t.id}')">Salvar</button>
        </div>
      </div>
    </div>
  </div>`;
}

async function editTask(id){
  let t = (window.__tasksCache||[]).find(x=>x.id===id);
  if(!t){ const data=await loadAgenda(state.userId); const f=_acharTarefaSemana(data,id); t=f&&f.t; }
  if(t) openTask(t.dia, t);
  else alert("Não encontrei esta tarefa para editar. Atualize a página e tente de novo.");
}

async function saveTask(id){
  const cond=document.getElementById("mCond").value;
  const tarefa=document.getElementById("mTarefa").value.trim();
  const acoes=document.getElementById("mAcoes").value.trim();
  const horas=document.getElementById("mHoras").value;
  const evid=document.getElementById("mEvid").value.trim();
  const dia=(document.querySelector('input[name="mDia"]:checked')||{}).value||"seg";
  const status=(document.querySelector('input[name="mSt"]:checked')||{}).value||"planejado";
  if(!cond){ alert("Selecione o condomínio."); return; }
  if(!tarefa){ alert("Descreva a tarefa."); return; }

  const data = await loadAgenda(state.userId);
  const wk = weekKey(state.semana);
  if(!data.weeks[wk]) data.weeks[wk]=[];
  if(id){
    const f=_acharTarefaSemana(data,id); const t=f&&f.t;
    if(t) Object.assign(t,{condominio:cond,tarefa,acoes,horas,status,evidencia:evid,dia});
    else alert("Não encontrei esta tarefa para salvar. Atualize a página e tente de novo.");
  } else {
    data.weeks[wk].push({ id:"t"+Date.now()+Math.random().toString(36).slice(2,6),
      condominio:cond,tarefa,acoes,horas,status,evidencia:evid,dia });
  }
  await saveAgenda(state.userId,data);
  closeModal(); render();
}

async function delTask(id){
  if(!confirm("Excluir esta tarefa?")) return;
  const data=await loadAgenda(state.userId);
  const f=_acharTarefaSemana(data,id);
  if(f) data.weeks[f.wk]=(data.weeks[f.wk]||[]).filter(x=>x.id!==id);
  await saveAgenda(state.userId,data);
  closeModal(); render();
}

async function finalizarTarefa(id){
  const data=await loadAgenda(state.userId);
  const f=_acharTarefaSemana(data,id); const t=f&&f.t;
  if(t && t.status!=="concluido"){ t.status="concluido"; await saveAgenda(state.userId,data); }
  closeModal(); render();
}

/* ============================================================
   REMANEJAR TAREFA PARA OUTRA DATA
   Move a tarefa para qualquer data útil (seg–sex), inclusive em
   outra semana. Reaproveitado pelos cards do síndico e da liderança.
   ============================================================ */
// localiza a tarefa e a semana onde ela está fisicamente guardada
function _acharTarefaSemana(data, id){
  const weeks=data.weeks||{};
  // tenta primeiro a semana visível (caso mais comum)
  const wkAtual=weekKey(state.semana);
  if(weeks[wkAtual] && weeks[wkAtual].some(x=>x.id===id)) return {wk:wkAtual, t:weeks[wkAtual].find(x=>x.id===id)};
  for(const wk in weeks){ const arr=weeks[wk]||[]; const t=arr.find(x=>x.id===id); if(t) return {wk, t}; }
  return null;
}
const _DIA_OFF={seg:0,ter:1,qua:2,qui:3,sex:4};
function _ymdLocal(d){ return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2); }
function _proxDiaUtil(d){ const x=new Date(d.getTime()); const g=x.getDay(); if(g===6) x.setDate(x.getDate()+2); else if(g===0) x.setDate(x.getDate()+1); return x; }

async function remanejarTarefa(id){
  const data=await loadAgenda(state.userId);
  const found=_acharTarefaSemana(data, id);
  if(!found){ alert("Não encontrei a tarefa para remanejar."); return; }
  const t=found.t;
  const titulo=esc(t.tarefa||t.titulo||"tarefa");
  // data atual da tarefa (segunda da semana + offset do dia)
  const segAtual=new Date(found.wk+"T00:00:00");
  const dataAtual=new Date(segAtual.getTime()); dataAtual.setDate(dataAtual.getDate()+(_DIA_OFF[t.dia]||0));
  const dataAtualStr=_ymdLocal(dataAtual);
  // sugestões
  const hoje=new Date(); hoje.setHours(0,0,0,0);
  const amanha=_proxDiaUtil(new Date(hoje.getTime()+86400000));
  const semProx=new Date(hoje.getTime()); semProx.setDate(semProx.getDate()+((8-(semProx.getDay()||7))%7||7)); // próxima segunda
  const minStr=_ymdLocal(hoje);
  const chip=(d,lbl)=>`<button type="button" class="remj-chip" onclick="document.getElementById('remjData').value='${_ymdLocal(d)}'">${lbl}<small>${fmt(d)}</small></button>`;
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:430px">
    <div class="modal-head"><h3>${ico('calendario')} Remanejar tarefa</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="remj-tarefa">${titulo}</div>
      <div class="remj-de">Hoje está marcada para <b>${fmt(dataAtual)}</b> (${(DIAS.find(x=>x.k===t.dia)||{}).nome||"—"}).</div>
      <label class="lbl" style="margin-top:6px">Nova data</label>
      <input type="date" id="remjData" class="inp" value="${_ymdLocal(_proxDiaUtil(dataAtual.getTime()>hoje.getTime()?new Date(dataAtual.getTime()+86400000):amanha))}" min="${minStr}">
      <div class="remj-chips">${chip(amanha,"Amanhã")}${chip(semProx,"Próxima segunda")}${chip(_proxDiaUtil(new Date(hoje.getTime()+7*86400000)),"Em 7 dias")}</div>
      <div class="remj-nota">Só dias úteis (segunda a sexta). Tudo da tarefa — ações, horas, status, comentários — vai junto.</div>
      <div class="modal-foot" style="margin-top:16px">
        <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" style="flex:1" onclick="confirmarRemanejar('${id}')">Remanejar</button>
      </div>
    </div></div></div>`;
}

async function confirmarRemanejar(id){
  const val=(document.getElementById("remjData")||{}).value||"";
  if(!val){ alert("Escolha a nova data."); return; }
  const nova=new Date(val+"T00:00:00");
  if(isNaN(nova.getTime())){ alert("Data inválida."); return; }
  const diaKey=_diaKeyDeData(nova);
  if(!diaKey){ alert("Escolha um dia útil (segunda a sexta) — o quadro de tarefas não tem fim de semana."); return; }
  const data=await loadAgenda(state.userId);
  const found=_acharTarefaSemana(data, id);
  if(!found){ alert("Não encontrei a tarefa para remanejar."); return; }
  const t=found.t;
  const wkNovo=weekKey(_semanaDaData(val));
  // atualiza o dia e, se for tarefa recorrente, a data-base da recorrência
  t.dia=diaKey;
  if(t.recBase) t.recBase=val;
  if(found.wk!==wkNovo){
    data.weeks[found.wk]=(data.weeks[found.wk]||[]).filter(x=>x.id!==id);
    if(!data.weeks[wkNovo]) data.weeks[wkNovo]=[];
    data.weeks[wkNovo].push(t);
  }
  const ok=await saveAgenda(state.userId,data);
  if(ok===false){ alert("⚠️ Não consegui salvar o remanejamento. Verifique a internet e tente de novo."); return; }
  closeModal();
  // leva a visualização para a semana de destino, para a pessoa ver a tarefa já no novo lugar
  try{ if(typeof state.semana==="number") state.semana=_semanaDaData(val); }catch(e){}
  render();
}

async function renderLideranca(){
  const view=document.getElementById("view");
  view.innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  const per=state.lidPeriodo||"semana";

  // barra de botões de período
  const btns=[["hoje","Hoje"],["amanha","Amanhã"],["semana","Semana"],["mes","Mês"],["ano","Ano"]]
    .map(([v,l])=>`<button class="per-btn ${per===v?'on':''}" onclick="setLidPeriodo('${v}')">${l}</button>`).join("");
  const persLabel = (per==="dia"&&state.lidDataRef) ? (""+ico('calendario')+" "+state.lidDataRef.split("-").reverse().join("/"))
                  : (per==="intervalo"&&state.lidIni) ? (""+ico('calendario')+" "+state.lidIni.split("-").reverse().slice(0,2).join("/")+"–"+state.lidFim.split("-").reverse().slice(0,2).join("/"))
                  : ""+ico('calendario')+" Personalizar";
  const periodoBar=`<div class="periodobar">
    ${btns}
    <button class="per-btn ${(per==='dia'||per==='intervalo')?'on':''}" onclick="personalizarLidData()">${persLabel}</button>
    <div class="spacer"></div>
    <button class="btn-gold" onclick="termometro('${state.userId}')">🌡️ Meu termômetro</button>
    <button class="btn-ghost" onclick="window.print()">Imprimir</button>
  </div>`;

  let corpo="", titulo="", subt="", tarefasCache=[], stats={t:0,a:0,c:0};
  const contar=(arr)=>{ stats.t=arr.length; stats.a=arr.filter(t=>t.status==="em_andamento").length; stats.c=arr.filter(t=>t.status==="concluido").length; };

  if(per==="semana"){
    // ===== visão clássica em colunas seg–sex =====
    const data=await loadAgenda(state.userId);
    const wk=weekKey(state.semana);
    const tasks=(data.weeks[wk]||[]); tarefasCache=tasks; contar(tasks);
    titulo=isCurrentWeek(state.semana)?"Esta semana":"Semana"; subt=rangeLabel(state.semana)+" · "+esc(state.user.cargo);
    // tarefas recorrentes de qualquer semana, para projetar nos dias desta semana
    const recorrentes=[]; Object.values(data.weeks||{}).forEach(arr=>(arr||[]).forEach(t=>{ if(t.recorrencia) recorrentes.push(t); }));
    let evsSemana=[]; try{ const ev=await loadEventos(state.userId); evsSemana=(ev.events||[]).filter(e=>e.tipo!=="bloqueio"&&e.tipo!=="ferias"); }catch(e){}
    corpo=`<div class="weeknav" style="margin-top:4px">
      <button class="nav-btn" onclick="changeWeek(-1)">‹</button>
      <button class="nav-btn" onclick="changeWeek(1)">›</button>
      <div class="weeknav-tit" onclick="escolherSemana(this)" title="Escolher uma data"><h2 style="font-size:17px">${titulo} <span class="wk-cal">${ico('calendario')}</span></h2><div class="range">${rangeLabel(state.semana)}</div></div>
      ${isCurrentWeek(state.semana)?"":'<button class="today-btn" onclick="goToday()">Hoje</button>'}
    </div><div class="grid">`;
    const tDay=todayDayKey();
    let liPorDia={}; try{ liPorDia=await listasTarefasPorData(state.userId, new Set(DIAS.map(d=>ymd(dateOfDay(state.semana,d.off))))); }catch(e){ liPorDia={}; }
    DIAS.forEach(dia=>{
      const dt=dateOfDay(state.semana,dia.off); const ds=ymd(dt);
      const dayTasks=tasks.filter(t=>t.dia===dia.k);
      const projs=recorrentes.filter(t=>_tarefaOcorreEm(t,ds));
      const dayEvs=evsSemana.filter(e=>e.date===ds);
      const dayLi=liPorDia[ds]||[];
      corpo+=`<div class="daycol ${tDay===dia.k?'is-today':''}"><div class="dayhead"><span class="d">${dia.nome}</span><span class="dt">${fmt(dt)}</span></div><div class="daybody">`;
      if(dayTasks.length===0 && dayEvs.length===0 && projs.length===0 && dayLi.length===0) corpo+='<div class="empty-day">Sem tarefas</div>';
      dayEvs.forEach(e=>{ corpo+=eventoCardSemana(e); });
      dayTasks.forEach(t=>{ corpo+=taskLidCard(t); });
      projs.forEach(t=>{ corpo+=taskLidCard(_projOcorrencia(t,ds)); });
      dayLi.forEach(t=>{ corpo+=_liChipSemana(t); });
      corpo+=`<button class="add-task" onclick="openTaskLid('${dia.k}')">+ Adicionar tarefa</button></div></div>`;
    });
    corpo+=`</div>`;
    try{ corpo += _liQuadroSemData(await listasTarefasSemData(state.userId)); }catch(e){}
  }
  else if(per==="hoje"||per==="amanha"||per==="dia"){
    // ===== visão de um único dia (lista) =====
    const ref = state.lidDataRef ? new Date(state.lidDataRef+"T12:00") : new Date();
    const ds=ymd(ref);
    const {tasks,evs}=await _coletarTarefasIntervalo(ref,ref);
    tarefasCache=tasks; contar(tasks);
    const diaNome=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"][ref.getDay()];
    titulo = per==="hoje"?"Hoje":(per==="amanha"?"Amanhã":diaNome);
    subt = diaNome+", "+ds.split("-").reverse().join("/")+" · "+esc(state.user.cargo);
    const dk=_diaKeyDeData(ref);
    corpo=`<div class="lid-lista">`;
    if(!tasks.length && !evs.length){
      corpo+=`<div class="empty-day" style="padding:24px">Sem tarefas ${per==="hoje"?"para hoje":"neste dia"}.</div>`;
    }
    evs.forEach(e=>{ corpo+=eventoCardSemana(e); });
    tasks.forEach(t=>{ corpo+=taskLidCard(t); });
    if(dk) corpo+=`<button class="add-task" onclick="openTaskLid('${dk}')">+ Adicionar tarefa</button>`;
    else corpo+=`<div class="empty-day" style="padding:10px">Fim de semana — tarefas são organizadas de segunda a sexta.</div>`;
    corpo+=`</div>`;
  }
  else if(per==="intervalo"){
    // ===== período personalizado (De ... Até) — cartões por dia em grade, build 130 =====
    const ini=new Date((state.lidIni||ymd(new Date()))+"T12:00");
    const fim=new Date((state.lidFim||ymd(new Date()))+"T12:00");
    const {tasks,evs}=await _coletarTarefasIntervalo(ini,fim);
    tarefasCache=tasks; contar(tasks);
    const fmtBR=(d)=>ymd(d).split("-").reverse().slice(0,2).join("/");
    const nDias=Math.round((startOfDay(fim)-startOfDay(ini))/86400000)+1;
    titulo="Período personalizado"; subt=fmtBR(ini)+" a "+fmtBR(fim)+" · "+nDias+" dia"+(nDias>1?"s":"")+" · "+esc(state.user.cargo);
    // tarefas das listas com data no período (espelho)
    let liPorDia={}; try{ const ds=new Set(); for(let d=new Date(ini); d<=fim; d.setDate(d.getDate()+1)) ds.add(ymd(d)); liPorDia=await listasTarefasPorData(state.userId, ds); }catch(e){ liPorDia={}; }
    const porDia={};
    tasks.forEach(t=>{ (porDia[t._data]=porDia[t._data]||{tasks:[],evs:[],li:[]}).tasks.push(t); });
    evs.forEach(e=>{ (porDia[e.date]=porDia[e.date]||{tasks:[],evs:[],li:[]}).evs.push(e); });
    Object.keys(liPorDia).forEach(ds=>{ (porDia[ds]=porDia[ds]||{tasks:[],evs:[],li:[]}).li=liPorDia[ds]; });
    const datas=Object.keys(porDia).sort();
    const totalItens=datas.reduce((s,ds)=>s+porDia[ds].tasks.length+porDia[ds].evs.length+porDia[ds].li.length,0);
    corpo=`<div class="periodo-nav lid-mnav"><button class="nav-btn" onclick="personalizarLidData()">✎ Alterar período</button><span class="lid-int-res">${datas.length} dia${datas.length===1?"":"s"} com atividade · ${totalItens} ${totalItens===1?"item":"itens"}</span></div>`;
    if(!datas.length) corpo+=`<div class="empty-day" style="padding:24px">Nenhuma tarefa ou reunião neste período.</div>`;
    else {
      const todayDs=ymd(new Date());
      corpo+=`<div class="lid-int-grid">`;
      datas.forEach(ds=>{
        const dt=new Date(ds+"T12:00");
        const dNome=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"][dt.getDay()];
        const n=porDia[ds].tasks.length+porDia[ds].evs.length+porDia[ds].li.length;
        corpo+=`<div class="daycol ${ds===todayDs?'is-today':''}"><div class="dayhead"><span class="d">${dNome}</span><span class="dt">${ds.split("-").reverse().slice(0,2).join("/")}${dt.getFullYear()!==new Date().getFullYear()?"/"+dt.getFullYear():""} · ${n}</span></div><div class="daybody">`;
        porDia[ds].evs.forEach(e=>{ corpo+=eventoCardSemana(e); });
        porDia[ds].tasks.forEach(t=>{ corpo+=taskLidCard(t); });
        porDia[ds].li.forEach(t=>{ corpo+=_liChipSemana(t); });
        corpo+=`</div></div>`;
      });
      corpo+=`</div>`;
    }
  }
  else if(per==="mes"){
    // ===== visão do mês: CALENDÁRIO em grade (semanas × dias), build 130 =====
    const ref=state.lidDataRef?new Date(state.lidDataRef+"T12:00"):new Date();
    const y=ref.getFullYear(), m=ref.getMonth();
    const ini=new Date(y,m,1), fim=new Date(y,m+1,0);
    const {tasks,evs}=await _coletarTarefasIntervalo(ini,fim);
    tarefasCache=tasks; contar(tasks);
    const meses=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    titulo=meses[m]+" "+y; subt="Visão mensal · "+esc(state.user.cargo);
    // tarefas das listas com data no mês (espelho)
    let liPorDia={}; try{ const ds=new Set(); for(let d=new Date(ini); d<=fim; d.setDate(d.getDate()+1)) ds.add(ymd(d)); liPorDia=await listasTarefasPorData(state.userId, ds); }catch(e){ liPorDia={}; }
    const porDia={};
    tasks.forEach(t=>{ (porDia[t._data]=porDia[t._data]||[]).push({k:"t",o:t}); });
    evs.forEach(e=>{ (porDia[e.date]=porDia[e.date]||[]).push({k:"e",o:e}); });
    Object.keys(liPorDia).forEach(ds=>{ liPorDia[ds].forEach(t=>{ (porDia[ds]=porDia[ds]||[]).push({k:"l",o:t}); }); });
    const gridStart=mondayOfDate(new Date(y,m,1));
    const ncells=Math.ceil((Math.round((startOfDay(fim)-gridStart)/86400000)+1)/7)*7;
    const todayDs=ymd(new Date());
    corpo=`<div class="periodo-nav lid-mnav"><button class="nav-btn" onclick="navMesLid(-1)">‹ ${meses[(m+11)%12]}</button><button class="nav-btn" onclick="navMesLid(1)">${meses[(m+1)%12]} ›</button><span class="lid-mnav-leg"><i style="background:#2D6CDF"></i>reunião/evento <i style="background:#C9A24B"></i>tarefa da semana <i style="background:#1D9E75"></i>tarefa de lista</span></div>`;
    corpo+=`<div class="mesgrid lid-mesgrid"><div class="mes-dows">`+["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(n=>`<span>${n}</span>`).join("")+`</div><div class="mes-cells">`;
    for(let i=0;i<ncells;i++){
      const d=addDays(gridStart,i), ds=ymd(d), inMonth=d.getMonth()===m, itens=porDia[ds]||[];
      corpo+=`<div class="mcell ${inMonth?'':'out'} ${ds===todayDs?'is-today':''}" onclick="abrirDiaLid('${ds}')"><div class="mnum">${d.getDate()}</div>`;
      itens.slice(0,4).forEach(it=>{
        if(it.k==="e"){ const e=it.o; corpo+=`<div class="mev" style="--c:#2D6CDF" title="${esc(e.title)}" onclick="event.stopPropagation();openEvento('${state.userId}','${e.id}')"><span class="mevtxt">${e.start?esc(e.start)+" ":""}${esc(e.title)}</span></div>`; }
        else if(it.k==="t"){ const tk=it.o; corpo+=`<div class="mev ${tk.status==="concluido"?"done":""}" style="--c:#C9A24B" title="${esc(tk.titulo||tk.tarefa||"")}" onclick="event.stopPropagation();editTaskLid('${tk.id}')"><span class="mevtxt">${tk.status==="concluido"?"✓ ":""}${esc(tk.titulo||tk.tarefa||"")}</span></div>`; }
        else { const lt=it.o; corpo+=`<div class="mev" style="--c:#1D9E75" title="${esc(lt.titulo)} · ${esc(lt.lista)}" onclick="event.stopPropagation();window._li.modo='listas';window._li.vista='${lt.listaId}';window._li.aberta={listaId:'${lt.listaId}',tid:'${lt.id}'};setTarefasModo('listas')"><span class="mevtxt">${lt.importante?"★ ":""}${esc(lt.titulo)}</span></div>`; }
      });
      if(itens.length>4) corpo+=`<div class="mmore">+${itens.length-4} mais</div>`;
      corpo+=`</div>`;
    }
    corpo+=`</div></div>`;
  }
  else if(per==="ano"){
    // ===== visão do ano: resumo por mês =====
    const ref=state.lidDataRef?new Date(state.lidDataRef+"T12:00"):new Date();
    const ano=ref.getFullYear();
    const ini=new Date(ano,0,1), fim=new Date(ano,11,31);
    const {tasks,evs}=await _coletarTarefasIntervalo(ini,fim);
    tarefasCache=tasks; contar(tasks);
    titulo=String(ano); subt="Visão anual · "+esc(state.user.cargo);
    const meses=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    corpo=`<div class="periodo-nav"><button class="nav-btn" onclick="navAnoLid(-1)">‹ ${ano-1}</button><button class="nav-btn" onclick="navAnoLid(1)">${ano+1} ›</button></div><div class="ano-grid">`;
    for(let m=0;m<12;m++){
      const tm=tasks.filter(t=>new Date(t._data+"T12:00").getMonth()===m);
      const em=evs.filter(e=>new Date(e.date+"T12:00").getMonth()===m);
      const conc=tm.filter(t=>t.status==="concluido").length;
      corpo+=`<div class="ano-mes" onclick="abrirMesLid(${ano},${m})">
        <div class="ano-mes-nm">${meses[m]}</div>
        <div class="ano-mes-st">${tm.length} tarefa${tm.length!==1?'s':''}${em.length?(" · "+em.length+" reunião"+(em.length!==1?'es':'')):""}</div>
        ${tm.length?`<div class="ano-mes-bar"><span style="width:${Math.round(conc/tm.length*100)}%"></span></div><div class="ano-mes-pct">${conc}/${tm.length} concluídas</div>`:`<div class="ano-mes-pct" style="opacity:.5">—</div>`}
      </div>`;
    }
    corpo+=`</div>`;
  }

  let html=`<div class="weeknav" style="margin-bottom:8px"><div><h2>${titulo}</h2><div class="range">${subt}</div></div></div>
  ${periodoBar}
  <div class="metabar">
    <div class="meta-item"><span class="lbl">Tarefas</span><span class="val">${stats.t}</span></div>
    <div class="meta-item"><span class="lbl">Em andamento</span><span class="val">${stats.a}</span></div>
    <div class="meta-item"><span class="lbl">Concluídas</span><span class="val">${stats.c}<small>/${stats.t}</small></span></div>
  </div>
  ${corpo}`;
  view.innerHTML=html;
  try{ _liBarraModo("semana"); }catch(e){}
  window.__lidCache=tarefasCache;
  pintarBadgesComentarios();
}

function navMesLid(delta){ const r=state.lidDataRef?new Date(state.lidDataRef+"T12:00"):new Date(); r.setMonth(r.getMonth()+delta); state.lidDataRef=ymd(r); render(); }

function navAnoLid(delta){ const r=state.lidDataRef?new Date(state.lidDataRef+"T12:00"):new Date(); r.setFullYear(r.getFullYear()+delta); state.lidDataRef=ymd(r); render(); }

function abrirDiaLid(ds){ state.lidPeriodo="dia"; state.lidDataRef=ds; render(); }
function abrirMesLid(ano,mes){ state.lidPeriodo="mes"; state.lidDataRef=ano+"-"+String(mes+1).padStart(2,"0")+"-01"; render(); }

function taskLidCard(t){
  const pr={baixa:["Baixa","p-baixa"],media:["Média","p-media"],alta:["Alta","p-alta"]}[t.prioridade]||["Média","p-media"];
  const tEsc=esc((t.titulo||'').replace(/'/g,'’'));
  const recChip = t.recorrencia ? `<span class="chip chip-rec" title="${esc(_labelRecorrencia(t.recorrencia))}">🔁 ${esc(_labelRecorrenciaCurto(t.recorrencia))}</span>` : "";
  return `<div class="task ${statusCls(t.status)}" onclick="editTaskLid('${t.id}')" style="cursor:pointer">
    <div class="ttl" style="margin-top:0">${esc(t.titulo)}</div>
    ${t.detalhes?`<div class="acs">${esc(t.detalhes)}</div>`:""}
    <div class="com-preview" id="cp_${t.id}" style="display:none"></div>
    <div class="foot">
      <span class="chip ${pr[1]}">${pr[0]}</span>
      <span class="chip ${statusCls(t.status)}">${statusLabel(t.status)}</span>
      ${recChip}
      <span class="acts">
        ${t._proj
          ? (t.status!=="concluido"
              ? `<button class="icon-btn fin" title="Concluir esta ocorrência (${esc(String(t._projData||"").split("-").reverse().join("/"))})" onclick="event.stopPropagation();finalizarOcorrencia('${t.id}','${t._projData}')">✓</button>`
              : `<button class="icon-btn" title="Reabrir esta ocorrência" onclick="event.stopPropagation();reabrirOcorrencia('${t.id}','${t._projData}')">↩</button>`)
          : (t.status!=="concluido"?`<button class="icon-btn fin" title="Finalizar tarefa" onclick="event.stopPropagation();finalizarTarefa('${t.id}')">✓</button>`:"")}
        <button class="icon-btn com-btn" id="cb_${t.id}" title="Comentários" onclick="event.stopPropagation();abrirComentarios('${t.id}','${tEsc}','${state.userId}')">💬</button>
        <button class="icon-btn" title="Remanejar para outra data" onclick="event.stopPropagation();remanejarTarefa('${t.id}')">${ico('calendario')}</button>
        <button class="icon-btn" title="Editar" onclick="event.stopPropagation();editTaskLid('${t.id}')">✎</button>
        <button class="icon-btn" title="Excluir" onclick="event.stopPropagation();delTask('${t.id}')">🗑</button>
      </span>
    </div>
  </div>`;
}

async function editTaskLid(id){
  let t=(window.__lidCache||[]).find(x=>x.id===id);
  if(!t){ const data=await loadAgenda(state.userId); const f=_acharTarefaSemana(data,id); t=f&&f.t; }
  if(t) openTaskLid(t.dia,t);
  else alert("Não encontrei esta tarefa para editar. Atualize a página e tente de novo.");
}

function openTaskLid(diaPre, task){
  const editing=!!task;
  const t=task||{id:"",dia:diaPre||"seg",titulo:"",detalhes:"",prioridade:"media",status:"planejado",recorrencia:""};
  const diaBtns=DIAS.map(d=>`<label><input type="radio" name="lDia" value="${d.k}" ${t.dia===d.k?"checked":""}><span>${d.nome.slice(0,3)}</span></label>`).join("");
  const prBtns=[["baixa","Baixa"],["media","Média"],["alta","Alta"]].map(([v,l])=>`<label><input type="radio" name="lPr" value="${v}" ${t.prioridade===v?"checked":""}><span>${l}</span></label>`).join("");
  const stBtns=[["planejado","Planejado"],["em_andamento","Andamento"],["concluido","Concluído"]].map(([v,l])=>`<label><input type="radio" name="lSt" value="${v}" ${t.status===v?"checked":""}><span>${l}</span></label>`).join("");
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>${editing?"Editar tarefa":"Nova tarefa"}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="field"><label>Tarefa</label><input id="lTitulo" value="${esc(t.titulo)}" placeholder="Ex.: Fechamento financeiro mensal"></div>
      <div class="field"><label>Detalhes</label><textarea id="lDetalhes" placeholder="Contexto, responsáveis, próximos passos…">${esc(t.detalhes)}</textarea>
        <div class="tarefa-tools"><button type="button" class="tarefa-dit" onclick="ditarToggle('lDetalhes',this)">🎙️ Ditar por voz</button></div>
      </div>
      <div class="row2">
        <div class="field"><label>Dia da semana</label><div class="seg">${diaBtns}</div></div>
        <div class="field"><label>Prioridade</label><div class="seg pr">${prBtns}</div></div>
      </div>
      <div class="field"><label>Status</label><div class="seg st">${stBtns}</div></div>
      ${campoRecorrencia(t.recorrencia)}
      ${editing?`<div class="field"><button type="button" class="tarefa-remanejar" onclick="remanejarTarefa('${t.id}')">${ico('calendario')} Remanejar para outra data</button><div class="tarefa-remanejar-hint">Não deu pra fazer nesse dia? Jogue a tarefa para outra data — pode ser em outra semana.</div></div>`:""}
      <div class="modal-foot">
        ${editing?`<button class="btn-del" onclick="delTask('${t.id}')">Excluir</button>`:`<button class="btn-cancel" onclick="closeModal()">Cancelar</button>`}
        <button class="btn-primary" style="flex:1" onclick="saveTaskLid('${t.id}')">Salvar</button>
      </div>
    </div></div></div>`;
}

function campoRecorrencia(valor){
  const ops=[["","Não se repete"],["diario","Diariamente"],["semanal","Semanalmente"],["quinzenal","A cada 15 dias"],["mensal","Mensalmente"],["trimestral","Trimestralmente"],["semestral","Semestralmente"],["anual","Anualmente"],["personalizado","Personalizado…"]];
  const sel=ops.map(([v,l])=>`<option value="${v}" ${valor===v?"selected":""}>${l}</option>`).join("");
  return `<div class="field"><label>🔁 Repetir esta tarefa</label>
    <select id="lRec" onchange="togglePersonalizado()">${sel}</select>
    <div id="lRecPers" style="display:${valor==='personalizado'?'flex':'none'};gap:8px;margin-top:8px;align-items:center">
      <span style="font-size:13px;color:var(--muted);font-weight:600">A cada</span>
      <input id="lRecN" type="number" min="1" value="${(valor==='personalizado'&&window.__recPersN)||2}" style="width:70px">
      <select id="lRecUnid" style="flex:1">
        <option value="dias">dias</option><option value="semanas">semanas</option><option value="meses">meses</option>
      </select>
    </div>
  </div>`;
}

function togglePersonalizado(){
  const v=(document.getElementById("lRec")||{}).value;
  const box=document.getElementById("lRecPers"); if(box) box.style.display = v==="personalizado"?"flex":"none";
}

async function saveTaskLid(id){
  const titulo=document.getElementById("lTitulo").value.trim();
  const detalhes=document.getElementById("lDetalhes").value.trim();
  const dia=(document.querySelector('input[name="lDia"]:checked')||{}).value||"seg";
  const prioridade=(document.querySelector('input[name="lPr"]:checked')||{}).value||"media";
  const status=(document.querySelector('input[name="lSt"]:checked')||{}).value||"planejado";
  const rec=lerRecorrencia();
  if(!titulo){alert("Descreva a tarefa.");return;}
  const data=await loadAgenda(state.userId); const wk=weekKey(state.semana);
  if(!data.weeks[wk]) data.weeks[wk]=[];
  if(id){
    const f=_acharTarefaSemana(data,id); const t=f&&f.t;
    if(t){
      let rb=t.recBase;
      if(!rb){ const seg=new Date(f.wk+"T00:00:00"); seg.setDate(seg.getDate()+({seg:0,ter:1,qua:2,qui:3,sex:4}[dia]||0)); rb=ymd(seg); }
      Object.assign(t,{titulo,detalhes,prioridade,status,dia,recorrencia:rec.tipo,recPers:rec.pers,recBase:rb});
    } else alert("Não encontrei esta tarefa para salvar. Atualize a página e tente de novo.");
  }
  else { data.weeks[wk].push({id:"l"+Date.now()+Math.random().toString(36).slice(2,6),titulo,detalhes,prioridade,status,dia,recorrencia:rec.tipo,recPers:rec.pers,recBase:ymd(dateOfDay(state.semana,({seg:0,ter:1,qua:2,qui:3,sex:4}[dia]||0)))}); }
  await saveAgenda(state.userId,data); closeModal(); render();
}

function lerRecorrencia(){
  const tipo=(document.getElementById("lRec")||{}).value||"";
  if(tipo==="personalizado"){
    const n=parseInt((document.getElementById("lRecN")||{}).value||"2",10)||2;
    const unid=(document.getElementById("lRecUnid")||{}).value||"semanas";
    return {tipo, pers:{n,unid}};
  }
  return {tipo, pers:null};
}

// build 143: cada ocorrência de uma tarefa recorrente tem status próprio (guardado por data em recFeitos);
// a projeção da semana seguinte nasce "planejada", mesmo que a base já esteja concluída.
function _projOcorrencia(t, ds){
  const feito=!!(t.recFeitos && t.recFeitos[ds]);
  return {...t, _proj:true, _projData:ds, _data:ds, status: feito?"concluido":"planejado"};
}
async function finalizarOcorrencia(id, ds){
  const data=await loadAgenda(state.userId);
  const f=_acharTarefaSemana(data,id); const t=f&&f.t; if(!t) return;
  t.recFeitos=t.recFeitos||{}; t.recFeitos[ds]=Date.now();
  await saveAgenda(state.userId,data); try{ closeModal(); }catch(e){} render();
}
async function reabrirOcorrencia(id, ds){
  const data=await loadAgenda(state.userId);
  const f=_acharTarefaSemana(data,id); const t=f&&f.t; if(!t||!t.recFeitos) return;
  delete t.recFeitos[ds];
  await saveAgenda(state.userId,data); try{ closeModal(); }catch(e){} render();
}
function _tarefaOcorreEm(t, alvoStr){
  if(!t.recorrencia) return false;
  const base=t.recBase || alvoStr;
  const b=new Date(base+"T12:00"), a=new Date(alvoStr+"T12:00");
  if(a<b) return false;                       // antes da criação, não repete
  if(alvoStr===base) return false;            // o dia-base já é mostrado normalmente
  const dias=Math.round((a-b)/86400000);
  const mesesDiff=(a.getFullYear()-b.getFullYear())*12+(a.getMonth()-b.getMonth());
  const mesmoDiaDoMes=a.getDate()===b.getDate();
  switch(t.recorrencia){
    case "diario": return true;
    case "semanal": return dias%7===0;
    case "quinzenal": return dias%14===0;
    case "mensal": return mesmoDiaDoMes && mesesDiff>=1;
    case "trimestral": return mesmoDiaDoMes && mesesDiff>=3 && mesesDiff%3===0;
    case "semestral": return mesmoDiaDoMes && mesesDiff>=6 && mesesDiff%6===0;
    case "anual": return mesmoDiaDoMes && a.getMonth()===b.getMonth() && a.getFullYear()>b.getFullYear();
    case "personalizado": {
      const p=t.recPers||{n:2,unid:"semanas"};
      if(p.unid==="dias") return dias%p.n===0;
      if(p.unid==="semanas") return dias%(7*p.n)===0;
      if(p.unid==="meses") return mesmoDiaDoMes && mesesDiff>=p.n && mesesDiff%p.n===0;
      return false;
    }
  }
  return false;
}

async function openMeusCondominios(){
  const cfg = await loadCondominios(state.userId);
  const sel = {}; (cfg.itens||[]).forEach(c=>{ sel[c.nome]={meta:c.meta, implantacao:!!c.implantacao}; });
  window.__condSel = sel;
  pintaMeusCondominios();
}

function pintaMeusCondominios(){
  const sel = window.__condSel||{};
  let total=0;
  const linhas = CONDOMINIOS.map(nome=>{
    const ativo = sel[nome]!==undefined;
    const padrao = metaPadraoCond(nome);
    const meta = ativo ? (sel[nome].meta!==undefined && sel[nome].meta!=="" ? sel[nome].meta : padrao) : padrao;
    const impl = ativo ? sel[nome].implantacao : false;
    if(ativo) total += parseFloat(meta)||padrao;
    const isDiaInteiro = COND_DIA_INTEIRO.includes(nome);
    const nomeEsc = nome.replace(/'/g,"\\'");
    return `<div class="cond-row ${ativo?'on':''}">
      <label class="cond-check">
        <input type="checkbox" ${ativo?'checked':''} onchange="toggleCond('${nomeEsc}',this.checked)">
        <span class="cond-nome">${esc(nome)}${isDiaInteiro?' <small class="cond-hint">(padrão 4h/dia · 20h/sem)</small>':' <small class="cond-hint">(padrão 4h/sem)</small>'}</span>
      </label>
      <div class="cond-config ${ativo?'':'off'}">
        <label class="cond-impl"><input type="checkbox" ${impl?'checked':''} onchange="setImpl('${nomeEsc}',this.checked)"> Implantação</label>
        <div class="cond-meta">
          <input type="number" min="0" step="0.5" value="${meta}" ${impl?'':'disabled'} onchange="setMeta('${nomeEsc}',this.value)">
          <span>h/sem</span>
        </div>
      </div>
    </div>`;
  }).join("");
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>${ico('predio')} Meus condomínios</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="ata-hint">Marque os condomínios que você cuida. A meta de horas é preenchida automaticamente (Novo Mercadão: 4h/dia = 20h/semana; demais: 4h/semana). Marque <b>Implantação</b> para poder editar a meta (geralmente exige mais horas).</p>
      <div class="cond-list">${linhas}</div>
      <div class="cond-total">Meta semanal total: <b>${total%1?total.toFixed(1):total}h</b></div>
      <div class="modal-foot">
        <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" style="flex:1" onclick="salvarMeusCondominios()">Salvar</button>
      </div>
    </div></div></div>`;
}

function toggleCond(nome, on){
  if(on){ window.__condSel[nome]={meta:metaPadraoCond(nome), implantacao:false}; }
  else { delete window.__condSel[nome]; }
  pintaMeusCondominios();
}

function setImpl(nome, on){
  if(!window.__condSel[nome]) return;
  window.__condSel[nome].implantacao=on;
  if(!on) window.__condSel[nome].meta=metaPadraoCond(nome);
  pintaMeusCondominios();
}

function setMeta(nome, val){
  if(!window.__condSel[nome]) return;
  window.__condSel[nome].meta = val;
  pintaMeusCondominios();
}

async function salvarMeusCondominios(){
  const sel=window.__condSel||{};
  const itens=Object.keys(sel).map(nome=>({
    nome,
    meta: (sel[nome].meta!==undefined && sel[nome].meta!=="") ? (parseFloat(sel[nome].meta)||metaPadraoCond(nome)) : metaPadraoCond(nome),
    implantacao: !!sel[nome].implantacao
  }));
  await saveCondominios(state.userId, {itens});
  closeModal(); render();
}


