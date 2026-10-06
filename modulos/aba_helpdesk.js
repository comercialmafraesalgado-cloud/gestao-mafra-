/* ============================================================
   GESTÃO MAFRA — ABA HELPDESK
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: aceitarChamado, indicarChamado, confirmarIndicacao, atribuirChamado, confirmarAtribuicao, cancelarChamado, finalizarChamado, confirmarFinalizacao, somarHora, renderHelpdesk */

async function aceitarChamado(id){
  const d=await loadChamados(); const ch=(d.list||[]).find(x=>x.id===id);
  if(!ch) return;
  ch.status="aceito"; ch.helpdeskUid=state.userId; ch.aceitoEm=Date.now();
  await saveChamados(d);
  // cria evento no calendário da pessoa do Help Condo
  try{
    const ag=await loadEventos(state.userId);
    if(!ag.events) ag.events=[];
    ag.events.push({
      id:"ev_hd_"+ch.id, gid:"ghd_"+ch.id,
      title:`🛠 ${ch.titulo}`,
      date:ch.data, start:ch.hora, end:somarHora(ch.hora,1),
      tipo:"helpdesk", condominio:ch.condominio,
      teamParts:[state.userId], extParts:[],
      desc:`Chamado de ${ch.solicitanteNome}\n${ch.descricao||""}`,
      cor:USUARIOS[state.userId]?.cor||"#16243D"
    });
    await saveEventos(state.userId, ag);
  }catch(e){ console.warn(e); }
  // notifica o solicitante
  try{ await pushAviso(ch.solicitante,{
    id:"av"+Date.now()+Math.random().toString(36).slice(2,5),
    texto:`✅ Chamado aceito: ${ch.titulo}`,
    sub:`${state.user.nome} cuidará disso · ${ch.data.split("-").reverse().join("/")} às ${ch.hora}`,
    chamadoId:ch.id, ts:Date.now()
  }); }catch(e){}
  render();
}

async function indicarChamado(id){
  const d=await loadChamados(); const ch=(d.list||[]).find(x=>x.id===id);
  if(!ch) return;
  // lista só outros Help Condos (não o próprio usuário atual)
  const outros=listarHelpdesk().filter(uid=>uid!==state.userId);
  if(!outros.length){ alert("Não há outro Help Condo cadastrado para indicar. Peça ao Master para criar um."); return; }
  const opts=outros.map(uid=>`<option value="${uid}">${esc(USUARIOS[uid]?.nome||uid)}</option>`).join("");
  const inp='width:100%;padding:11px 13px;border:1.5px solid var(--line);border-radius:10px;background:#FCFBF8;font-size:16px';
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:420px">
    <div class="modal-head"><h3>👤 Indicar para outro Help Condo</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">Encaminhe este chamado para outra pessoa do Help Condo cuidar.</p>
      <div class="field"><label style="display:block;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px">Indicar para</label>
        <select id="indPara" style="${inp}">${opts}</select></div>
      <div class="field"><label style="display:block;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px">Observação para a pessoa (opcional)</label>
        <textarea id="indObs" rows="2" style="${inp};resize:vertical" placeholder="Ex: melhor profissional para essa situação"></textarea></div>
      <div class="modal-foot">
        <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" style="flex:1" onclick="confirmarIndicacao('${id}')">Indicar</button>
      </div>
    </div></div></div>`;
}

async function confirmarIndicacao(id){
  const para=document.getElementById("indPara").value;
  const obs=(document.getElementById("indObs").value||"").trim();
  const d=await loadChamados(); const ch=(d.list||[]).find(x=>x.id===id);
  if(!ch || !para) return;
  ch.status="indicado"; ch.indicadoUid=para; ch.indicadoPor=state.userId; ch.indicadoEm=Date.now();
  if(obs) ch.obsIndicacao=obs;
  await saveChamados(d);
  // notifica o indicado e o solicitante
  try{ await pushAviso(para,{
    id:"av"+Date.now()+Math.random().toString(36).slice(2,5),
    texto:`🛠 Você foi indicado para: ${ch.titulo}`,
    sub:`${ch.condominio} · ${ch.data.split("-").reverse().join("/")} às ${ch.hora}${obs?" · "+obs:""}`,
    chamadoId:ch.id, ts:Date.now()
  }); }catch(e){}
  try{ await pushAviso(ch.solicitante,{
    id:"av"+Date.now()+Math.random().toString(36).slice(2,5),
    texto:`👤 Chamado encaminhado: ${ch.titulo}`,
    sub:`Foi indicado para ${USUARIOS[para]?.nome||para}`,
    chamadoId:ch.id, ts:Date.now()
  }); }catch(e){}
  closeModal(); render();
}

async function atribuirChamado(id){
  const d=await loadChamados(); const ch=(d.list||[]).find(x=>x.id===id);
  if(!ch) return;
  const hds=listarHelpdesk();
  if(!hds.length){ alert("Não há ninguém do Help Condo cadastrado. Crie um usuário Help Condo em Gerenciar."); return; }
  const opts=hds.map(uid=>`<option value="${uid}" ${ch.atendente===uid?"selected":""}>${esc(USUARIOS[uid]?.nome||uid)}</option>`).join("");
  const inp='width:100%;padding:11px 13px;border:1.5px solid var(--line);border-radius:10px;background:#FCFBF8;font-size:16px';
  const lbl='display:block;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px';
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:420px">
    <div class="modal-head"><h3>👤 Atribuir atendente</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">Escolha quem do Help Condo vai atender este chamado. A pessoa será notificada.</p>
      <div class="field"><label style="${lbl}">Atendente</label>
        <select id="atbPara" style="${inp}">${opts}</select></div>
      <div class="modal-foot">
        <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" style="flex:1" onclick="confirmarAtribuicao('${id}')">Atribuir</button>
      </div>
    </div></div></div>`;
}

async function confirmarAtribuicao(id){
  const para=document.getElementById("atbPara").value;
  const d=await loadChamados(); const ch=(d.list||[]).find(x=>x.id===id);
  if(!ch || !para) return;
  ch.atendente=para; ch.atendenteNome=USUARIOS[para]?.nome||para;
  await saveChamados(d);
  try{ await pushAviso(para,{
    id:"av"+Date.now()+Math.random().toString(36).slice(2,5),
    texto:`🛠 Chamado atribuído a você: ${ch.titulo}`,
    sub:`${ch.condominio}${ch.data?(" · "+ch.data.split("-").reverse().join("/")):""}${ch.hora?(" às "+ch.hora):""}`,
    chamadoId:ch.id, ts:Date.now()
  }); }catch(e){}
  closeModal(); render();
}

async function cancelarChamado(id){
  const motivo=prompt("Por que cancelar este chamado? (motivo opcional)");
  if(motivo===null) return;
  const d=await loadChamados(); const ch=(d.list||[]).find(x=>x.id===id);
  if(!ch) return;
  ch.status="cancelado"; ch.canceladoPor=state.userId; ch.canceladoEm=Date.now();
  if(motivo.trim()) ch.motivoCancelamento=motivo.trim();
  await saveChamados(d);
  try{ await pushAviso(ch.solicitante,{
    id:"av"+Date.now()+Math.random().toString(36).slice(2,5),
    texto:`❌ Chamado cancelado: ${ch.titulo}`,
    sub:motivo.trim()||"Sem motivo informado",
    chamadoId:ch.id, ts:Date.now()
  }); }catch(e){}
  render();
}

async function finalizarChamado(id){
  const d=await loadChamados(); const ch=(d.list||[]).find(x=>x.id===id);
  if(!ch) return;
  const inp='width:100%;padding:11px 13px;border:1.5px solid var(--line);border-radius:10px;background:#FCFBF8;font-size:16px';
  const lbl='display:block;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px';
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:520px">
    <div class="modal-head"><h3>✓ Finalizar chamado</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">Registre a ata do ocorrido. Ela ficará no chamado e também salva nas Gravações & Atas.</p>
      <div class="field"><label style="${lbl}">${ico('local')} Chamado</label>
        <div style="${inp};background:#f3f4f6;color:#16243D;font-weight:600">${esc(ch.titulo)} · ${esc(ch.condominio)}</div></div>
      <div class="field"><label style="${lbl}">📝 Ata / Resumo do que foi feito</label>
        <textarea id="finAta" rows="6" style="${inp};resize:vertical" placeholder="Descreva o atendimento: o que foi encontrado, o que foi resolvido, próximos passos..."></textarea></div>
      <div class="field"><label style="${lbl}">👥 Participantes (opcional)</label>
        <input id="finPart" type="text" style="${inp}" placeholder="Ex: João (zelador), Maria (síndica do condomínio)"></div>
      <div class="modal-foot">
        <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" style="flex:1" onclick="confirmarFinalizacao('${id}')">✓ Finalizar e registrar ata</button>
      </div>
    </div></div></div>`;
}

async function confirmarFinalizacao(id){
  const ata=(document.getElementById("finAta").value||"").trim();
  const part=(document.getElementById("finPart").value||"").trim();
  if(!ata){ alert("Escreva a ata do atendimento."); return; }
  const d=await loadChamados(); const ch=(d.list||[]).find(x=>x.id===id);
  if(!ch) return;
  ch.status="finalizado"; ch.finalizadoPor=state.userId; ch.finalizadoEm=Date.now();
  ch.ata=ata; if(part) ch.participantes=part;
  await saveChamados(d);
  // grava também em Gravações & Atas para ficar acessível por lá
  try{
    const dG=await loadGravacoes(); if(!dG.list)dG.list=[];
    dG.list.push({
      id:"gr_hd_"+ch.id, ts:Date.now(),
      titulo:`🛠 ${ch.titulo}`,
      ata:ata, resolvidos:[], tarefas:[],
      participantes:part||"",
      condominio:ch.condominio, autor:state.userId,
      origem:"helpdesk", chamadoId:ch.id
    });
    await saveGravacoes(dG);
  }catch(e){ console.warn(e); }
  // notifica solicitante
  try{ await pushAviso(ch.solicitante,{
    id:"av"+Date.now()+Math.random().toString(36).slice(2,5),
    texto:`✓ Atendimento finalizado: ${ch.titulo}`,
    sub:`Veja a ata no chamado ou em Gravações & Atas`,
    chamadoId:ch.id, ts:Date.now()
  }); }catch(e){}
  closeModal(); render();
}

function somarHora(hhmm, horas){
  try{
    const [h,m]=hhmm.split(":").map(Number);
    const total=h*60+m+horas*60;
    const nh=Math.floor(total/60)%24, nm=total%60;
    return ("0"+nh).slice(-2)+":"+("0"+nm).slice(-2);
  }catch(e){ return hhmm; }
}

async function renderHelpdesk(){
  const view=document.getElementById("view");
  const ehHD = state.user.tipo==="helpdesk";
  const ehMaster = state.user.tipo==="master";
  const ehGestor = state.user.tipo==="gestor";
  const d=await loadChamados();
  let lista=(d.list||[]).slice();
  // filtros por perfil
  if(ehGestor){
    lista=lista.filter(c=>gestorCobre(c.condominio));
  } else if(!ehHD && !ehMaster){
    // demais (síndico, funcionário): vê os que solicitou OU foi indicado
    lista=lista.filter(c=>c.solicitante===state.userId || c.indicadoUid===state.userId);
  }
  // ordena: abertos primeiro, depois por data
  const ordemSt={aberto:0, indicado:1, aceito:2, finalizado:3, cancelado:4};
  lista.sort((a,b)=>(ordemSt[a.status]-ordemSt[b.status]) || (b.criadoEm-a.criadoEm));

  let html=`<div class="weeknav">
    <div><h2>🛠 Help Condo</h2><div class="range">${lista.length} chamado(s)${ehHD?" · você é Help Condo":""}</div></div>
    <div class="spacer"></div>
    <button class="btn-gold" onclick="abrirNovoChamado()">＋ Abrir chamado</button>
  </div>`;
  if(!lista.length){
    html+=`<div class="atend-hint">Nenhum chamado registrado ainda. Clique em "＋ Abrir chamado" para solicitar atendimento.</div>`;
  } else {
    html+=`<div class="hd-lista">`;
    lista.forEach(c=>{
      const stLbl={aberto:"🆕 Aberto", aceito:"✅ Aceito", indicado:"👤 Indicado", finalizado:"✓ Finalizado", cancelado:"❌ Cancelado"}[c.status]||c.status;
      const stCls={aberto:"hd-aberto", aceito:"hd-aceito", indicado:"hd-indicado", finalizado:"hd-final", cancelado:"hd-canc"}[c.status]||"";
      const priIc={alta:"🔴", media:"🟡", baixa:"🟢"}[c.prioridade]||"⚪";
      const dataBr=c.data?c.data.split("-").reverse().join("/"):"";
      const responsavel = c.helpdeskUid ? USUARIOS[c.helpdeskUid]?.nome : (c.indicadoUid?USUARIOS[c.indicadoUid]?.nome+" (indicado)":(c.atendente?((USUARIOS[c.atendente]?.nome||c.atendenteNome||"")+" (designado)"):""));
      // ações conforme o status e o perfil — SÓ a pessoa do Help Condo pode aceitar/indicar/cancelar
      let acoes="";
      if(ehHD){
        if(c.status==="aberto"){
          acoes=`<button class="btn-primary hd-mini" onclick="aceitarChamado('${c.id}')">✅ Aceitar</button>
            <button class="btn-ghost hd-mini" onclick="indicarChamado('${c.id}')">👤 Indicar</button>
            <button class="btn-del hd-mini" onclick="cancelarChamado('${c.id}')">❌ Cancelar</button>`;
        } else if(c.status==="aceito" && c.helpdeskUid===state.userId){
          acoes=`<button class="btn-primary hd-mini" onclick="finalizarChamado('${c.id}')">✓ Finalizar</button>
            <button class="btn-ghost hd-mini" onclick="cancelarChamado('${c.id}')">Cancelar</button>`;
        } else if(c.status==="indicado"){
          acoes=`<button class="btn-ghost hd-mini" onclick="cancelarChamado('${c.id}')">Cancelar</button>`;
        }
      }
      // Master pode designar/trocar quem vai atender um chamado aberto
      if(ehMaster && c.status==="aberto"){
        acoes+=`<button class="btn-ghost hd-mini" onclick="atribuirChamado('${c.id}')">👤 ${c.atendente?"Trocar atendente":"Atribuir atendente"}</button>`;
      }
      // o síndico indicado pode finalizar o próprio atendimento
      if(c.status==="indicado" && c.indicadoUid===state.userId){
        acoes=`<button class="btn-primary hd-mini" onclick="finalizarChamado('${c.id}')">✓ Finalizar</button>`;
      }
      html+=`<div class="hd-card ${stCls}">
        <div class="hd-head">
          <span class="hd-pri">${priIc}</span>
          <div class="hd-tit">${esc(c.titulo)}</div>
          <span class="hd-status">${stLbl}</span>
        </div>
        <div class="hd-meta">
          ${ico('local')} ${esc(c.condominio)} · ${ico('calendario')} ${dataBr} às ${esc(c.hora||"")} · 👤 ${esc(c.solicitanteNome||c.solicitante)}
          ${responsavel?` · 🛠 ${esc(responsavel)}`:""}
        </div>
        ${c.descricao?`<div class="hd-desc">${esc(c.descricao)}</div>`:""}
        ${c.ata?`<div class="hd-ata"><b>📝 Ata:</b> ${esc(c.ata)}${c.participantes?`<br><b>👥 Participantes:</b> ${esc(c.participantes)}`:""}</div>`:""}
        ${c.motivoCancelamento?`<div class="hd-desc" style="color:#B0392B"><b>Motivo:</b> ${esc(c.motivoCancelamento)}</div>`:""}
        ${acoes?`<div class="hd-acoes">${acoes}</div>`:""}
      </div>`;
    });
    html+=`</div>`;
  }
  view.innerHTML=html;
}


