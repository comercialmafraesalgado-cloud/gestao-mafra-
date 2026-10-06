/* ============================================================
   GESTÃO MAFRA — ABA OCORRENCIAS
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: ceoIds, saveOcorrencias, destinatariosOcorrencia, abrirNovaOcorrencia, confirmarOcorrencia, _ocPodeTratar, renderOcorrencias, responderOcorrencia, confirmarRespostaOcorrencia, mudarStatusOcorrencia */

function ceoIds(){ return ["marcia","andre"].filter(k=>USUARIOS[k]); }

async function saveOcorrencias(d){ _storeCacheClear("mafra:ocorrencias"); return await storeSet("mafra:ocorrencias", JSON.stringify(d)); }

async function destinatariosOcorrencia(cond){
  const set=new Set();
  try{ const sid=await sindicoDoCondominio(cond); if(sid){ set.add(sid); Object.keys(USUARIOS).forEach(uid=>{ if(USUARIOS[uid].apoiaSindico===sid) set.add(uid); }); } }catch(e){}
  (BPO||[]).forEach(uid=>set.add(uid));
  ceoIds().forEach(uid=>set.add(uid));
  return [...set];
}

async function abrirNovaOcorrencia(){
  const ehGestor=state.user.tipo==="gestor";
  const conds = ehGestor ? condsDoGestor() : CONDOMINIOS.slice();
  const condOpts = condOptionsAgrupadas(undefined,conds);
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:520px">
    <div class="modal-head"><h3>🚨 Registrar reclamação / ocorrência</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="row2" style="display:flex;gap:10px;flex-wrap:wrap">
        <div class="field" style="flex:1;min-width:180px"><label style="${_ocLbl}">Condomínio</label>
          <select id="ocCond" style="${_ocInp}">${condOpts}</select></div>
        <div class="field" style="flex:1;min-width:140px"><label style="${_ocLbl}">Tipo</label>
          <select id="ocTipo" style="${_ocInp}"><option value="reclamacao">Reclamação</option><option value="ocorrencia">Ocorrência</option></select></div>
      </div>
      <div class="field"><label style="${_ocLbl}">Assunto</label>
        <input id="ocTitulo" type="text" placeholder="Ex.: Barulho excessivo, dano em área comum…" style="${_ocInp}"></div>
      <div class="field"><label style="${_ocLbl}">Descrição</label>
        <textarea id="ocDesc" rows="3" placeholder="Descreva o que aconteceu, quando e onde…" style="${_ocInp};resize:vertical"></textarea></div>
      <div class="field"><label style="${_ocLbl}">Prioridade</label>
        <select id="ocPri" style="${_ocInp}"><option value="alta">🔴 Alta</option><option value="media" selected>🟡 Média</option><option value="baixa">🟢 Baixa</option></select></div>
      <label class="oc-check"><input type="checkbox" id="ocAnon" onchange="document.getElementById('ocIdent').style.display=this.checked?'none':'block'"> Registrar de forma anônima</label>
      <div id="ocIdent">
        <div class="row2" style="display:flex;gap:10px;flex-wrap:wrap">
          <div class="field" style="flex:1;min-width:160px"><label style="${_ocLbl}">Seu nome</label>
            <input id="ocAutor" type="text" value="${esc(state.user.nome||"")}" style="${_ocInp}"></div>
          <div class="field" style="flex:1;min-width:160px"><label style="${_ocLbl}">Seu contato (opcional)</label>
            <input id="ocAutorContato" type="text" placeholder="Telefone / e-mail" style="${_ocInp}"></div>
        </div>
      </div>
      <label class="oc-check"><input type="checkbox" id="ocMorador" onchange="document.getElementById('ocMoradorBox').style.display=this.checked?'block':'none'"> Envolve um morador</label>
      <div id="ocMoradorBox" style="display:none">
        <div class="field"><label style="${_ocLbl}">Nome completo do morador</label>
          <input id="ocMorNome" type="text" style="${_ocInp}"></div>
        <div class="row2" style="display:flex;gap:10px;flex-wrap:wrap">
          <div class="field" style="flex:1;min-width:120px"><label style="${_ocLbl}">Unidade</label>
            <input id="ocMorUnid" type="text" placeholder="Ex.: Torre A — Apto 102" style="${_ocInp}"></div>
          <div class="field" style="flex:1;min-width:160px"><label style="${_ocLbl}">Contato do morador</label>
            <input id="ocMorContato" type="text" placeholder="Telefone / e-mail" style="${_ocInp}"></div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" style="flex:1" onclick="confirmarOcorrencia()">📤 Registrar</button>
      </div>
    </div></div></div>`;
}

async function confirmarOcorrencia(){
  const cond=(document.getElementById("ocCond")||{}).value||"";
  const tipo=(document.getElementById("ocTipo")||{}).value||"reclamacao";
  const titulo=(document.getElementById("ocTitulo").value||"").trim();
  const desc=(document.getElementById("ocDesc").value||"").trim();
  const pri=(document.getElementById("ocPri")||{}).value||"media";
  const anon=document.getElementById("ocAnon").checked;
  const envMor=document.getElementById("ocMorador").checked;
  if(!cond){ alert("Escolha o condomínio."); return; }
  if(!titulo){ alert("Informe o assunto."); return; }
  const reg={
    id:"oc"+Date.now()+Math.random().toString(36).slice(2,5),
    condominio:cond, tipo, titulo, descricao:desc, prioridade:pri,
    criadoPorUid:state.userId, criadoEm:Date.now(), ts:Date.now(),
    anonimo:!!anon,
    autorNome: anon?"":((document.getElementById("ocAutor").value||"").trim()||state.user.nome||""),
    autorContato: anon?"":((document.getElementById("ocAutorContato").value||"").trim()),
    envolveMorador:!!envMor,
    moradorNome: envMor?((document.getElementById("ocMorNome").value||"").trim()):"",
    moradorUnidade: envMor?((document.getElementById("ocMorUnid").value||"").trim()):"",
    moradorContato: envMor?((document.getElementById("ocMorContato").value||"").trim()):"",
    status:"aberto", respostas:[]
  };
  const d=await loadOcorrencias(); d.list=d.list||[]; d.list.unshift(reg); await saveOcorrencias(d);
  const dest=await destinatariosOcorrencia(cond);
  const aviso={ id:"av"+Date.now()+Math.random().toString(36).slice(2,5),
    texto:`🚨 Nova ${tipo==="ocorrencia"?"ocorrência":"reclamação"}: ${titulo}`,
    sub:`${cond} · ${reg.anonimo?"anônima":(reg.autorNome||"")}`, ocorrenciaId:reg.id, ts:Date.now() };
  for(const uid of dest){ if(uid!==state.userId){ try{ await pushAviso(uid, aviso); }catch(e){} } }
  closeModal();
  alert("Ocorrência registrada! O síndico operacional, o BPO e a diretoria (Márcia e André) foram notificados.");
  state.tab="ocorrencias"; render();
}

function _ocPodeTratar(){ const u=state.user||{}; return u.tipo==="master" || u.tipo==="sindico" || (BPO||[]).includes(state.userId); }

async function renderOcorrencias(){
  const view=document.getElementById("view");
  view.innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  const u=state.user;
  const ehMaster=u.tipo==="master", ehGestor=u.tipo==="gestor", ehSindico=u.tipo==="sindico", ehBPO=(BPO||[]).includes(state.userId);
  const podeTratar=_ocPodeTratar();
  const d=await loadOcorrencias();
  let lista=(d.list||[]).slice();
  if(ehGestor){ lista=lista.filter(o=>gestorCobre(o.condominio)); }
  else if(ehSindico){ let meus=[]; try{ meus=await condominiosDoSindico(state.userId); }catch(e){} lista=lista.filter(o=>meus.includes(o.condominio) || o.criadoPorUid===state.userId); }
  else if(!ehMaster && !ehBPO){ lista=lista.filter(o=>o.criadoPorUid===state.userId); }
  const ord={aberto:0, em_tratamento:1, resolvido:2};
  lista.sort((a,b)=>((ord[a.status]??9)-(ord[b.status]??9)) || (b.criadoEm-a.criadoEm));
  const stLbl={aberto:"🆕 Aberta", em_tratamento:"🔧 Em tratamento", resolvido:"✓ Resolvida"};
  const stCls={aberto:"oc-aberto", em_tratamento:"oc-trat", resolvido:"oc-resolv"};
  const priIc={alta:"🔴", media:"🟡", baixa:"🟢"};
  const fmtDH=ts=>ts?new Date(ts).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"";
  let html=`<div class="weeknav">
    <div><h2>🚨 Ocorrências & Reclamações</h2><div class="range">${lista.length} registro(s)</div></div>
    <div class="spacer"></div>
    <button class="btn-gold" onclick="abrirNovaOcorrencia()">＋ Registrar</button>
  </div>`;
  if(!lista.length){ html+=`<div class="atend-hint">Nenhuma ocorrência registrada. Clique em "＋ Registrar" para abrir a primeira.</div>`; }
  else {
    html+=`<div class="oc-lista">`;
    lista.forEach(o=>{
      const tratativas=(o.respostas||[]).map(r=>`<div class="oc-trativa"><b>${esc(USUARIOS[r.uid]?.nome||r.nome||"Equipe")}:</b> ${esc(r.texto)} <span class="oc-trativa-dt">${fmtDH(r.ts)}</span></div>`).join("");
      const morBox = o.envolveMorador ? `<div class="oc-morador">👤 <b>Morador:</b> ${esc(o.moradorNome||"—")}${o.moradorUnidade?` · ${esc(o.moradorUnidade)}`:""}${o.moradorContato?` · ${esc(o.moradorContato)}`:""}</div>` : "";
      let acoes="";
      if(podeTratar && o.status!=="resolvido"){
        acoes=`<button class="btn-primary hd-mini" onclick="responderOcorrencia('${o.id}')">💬 Responder / tratar</button>`;
        if(o.status==="aberto") acoes+=`<button class="btn-ghost hd-mini" onclick="mudarStatusOcorrencia('${o.id}','em_tratamento')">🔧 Em tratamento</button>`;
        acoes+=`<button class="btn-ghost hd-mini" onclick="mudarStatusOcorrencia('${o.id}','resolvido')">✓ Resolver</button>`;
      }
      html+=`<div class="oc-card ${stCls[o.status]||""}">
        <div class="oc-head">
          <span class="oc-pri">${priIc[o.prioridade]||"⚪"}</span>
          <div class="oc-tit">${esc(o.titulo)} <span class="oc-tipo">${o.tipo==="ocorrencia"?"Ocorrência":"Reclamação"}</span></div>
          <span class="oc-status">${stLbl[o.status]||o.status}</span>
        </div>
        <div class="oc-meta">${ico('local')} ${esc(o.condominio)} · 🗣️ ${o.anonimo?"<i>Anônima</i>":esc(o.autorNome||"—")}${o.autorContato?` · ${esc(o.autorContato)}`:""} · 🕒 ${fmtDH(o.criadoEm)}</div>
        ${o.descricao?`<div class="oc-desc">${esc(o.descricao)}</div>`:""}
        ${morBox}
        ${tratativas?`<div class="oc-trativas"><div class="oc-trativas-h">💬 Tratativas</div>${tratativas}</div>`:""}
        ${acoes?`<div class="hd-acoes">${acoes}</div>`:""}
      </div>`;
    });
    html+=`</div>`;
  }
  view.innerHTML=html;
}

async function responderOcorrencia(id){
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:460px">
    <div class="modal-head"><h3>💬 Responder / tratar</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="field"><label style="${_ocLbl}">Tratativa / resposta</label>
        <textarea id="ocResp" rows="4" placeholder="O que foi feito ou orientado…" style="${_ocInp};resize:vertical"></textarea></div>
      <div class="field"><label style="${_ocLbl}">Atualizar situação</label>
        <select id="ocRespStatus" style="${_ocInp}"><option value="em_tratamento">🔧 Em tratamento</option><option value="resolvido">✓ Resolvida</option><option value="">— Manter como está —</option></select></div>
      <div class="modal-foot">
        <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" style="flex:1" onclick="confirmarRespostaOcorrencia('${id}')">Salvar</button>
      </div>
    </div></div></div>`;
}

async function confirmarRespostaOcorrencia(id){
  const texto=(document.getElementById("ocResp").value||"").trim();
  const novoStatus=(document.getElementById("ocRespStatus")||{}).value||"";
  const d=await loadOcorrencias(); const o=(d.list||[]).find(x=>x.id===id);
  if(!o){ return; }
  if(texto){ o.respostas=o.respostas||[]; o.respostas.push({uid:state.userId, nome:state.user.nome, texto, ts:Date.now()}); }
  if(novoStatus){ o.status=novoStatus; if(novoStatus==="resolvido"){ o.resolvidoPor=state.userId; o.resolvidoEm=Date.now(); } }
  await saveOcorrencias(d);
  // avisa quem registrou (se identificado) + os demais destinatários
  const aviso={ id:"av"+Date.now()+Math.random().toString(36).slice(2,5),
    texto:`💬 Atualização: ${o.titulo}`,
    sub:`${o.condominio} · ${stStatusLbl(o.status)}${texto?(" · "+texto.slice(0,60)):""}`, ocorrenciaId:o.id, ts:Date.now() };
  const alvos=new Set(await destinatariosOcorrencia(o.condominio));
  if(!o.anonimo && o.criadoPorUid) alvos.add(o.criadoPorUid);
  for(const uid of alvos){ if(uid!==state.userId){ try{ await pushAviso(uid, aviso); }catch(e){} } }
  closeModal(); render();
}

async function mudarStatusOcorrencia(id, st){
  const d=await loadOcorrencias(); const o=(d.list||[]).find(x=>x.id===id);
  if(!o) return;
  o.status=st; if(st==="resolvido"){ o.resolvidoPor=state.userId; o.resolvidoEm=Date.now(); }
  await saveOcorrencias(d);
  const aviso={ id:"av"+Date.now()+Math.random().toString(36).slice(2,5),
    texto:`💬 Atualização: ${o.titulo}`, sub:`${o.condominio} · ${stStatusLbl(st)}`, ocorrenciaId:o.id, ts:Date.now() };
  const alvos=new Set(await destinatariosOcorrencia(o.condominio));
  if(!o.anonimo && o.criadoPorUid) alvos.add(o.criadoPorUid);
  for(const uid of alvos){ if(uid!==state.userId){ try{ await pushAviso(uid, aviso); }catch(e){} } }
  render();
}


