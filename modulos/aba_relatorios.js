/* ============================================================
   GESTÃO MAFRA — ABA RELATORIOS
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: userCobreCond, saveCapas, statusRelLabel, statusRelCls, renderRelatorios, novoRelatorioEscolherCond, enviarRelatorioJulia, publicarRelatorio, arquivarRelatorio, novoCondominioNasCapas, abrirGerenciarCapas, previewCapa, subirCapa, abrirConsolidado, gerarConsolidado */

function userCobreCond(uid, cond){
  const u=USUARIOS[uid]||{};
  if(u.tipo!=="gestor") return false;
  const lista=(Array.isArray(u.condominios)&&u.condominios.length)?u.condominios:(u.condominio?[u.condominio]:[]);
  return lista.indexOf(cond)>=0;
}

async function saveCapas(d){ return await storeSet("mafra:capas_cond",JSON.stringify(d)); }

function statusRelLabel(s){
  if(s==="publicado") return "✓ Enviado";
  if(s==="enviado_julia"||s==="em_aprovacao") return "Em aprovação";
  if(s==="aprovado") return "✅ Aprovado";
  if(s==="reprovado") return "✏️ Ajustes necessários";
  return "Rascunho";
}

function statusRelCls(s){
  if(s==="publicado") return "tt-ok";
  if(s==="enviado_julia"||s==="em_aprovacao") return "tt-warn";
  if(s==="aprovado") return "tt-ok";
  if(s==="reprovado") return "tt-no";
  return "tt-plan";
}

// agrupa os status do fluxo de aprovação para contagens e filtros do painel:
// "publicado" | "analise" (em aprovação / aprovado, aguardando publicação) | "rascunho" (inclui reprovado)
function _grupoStatusRel(s){
  if(s==="publicado") return "publicado";
  if(s==="enviado_julia"||s==="em_aprovacao"||s==="aprovado") return "analise";
  return "rascunho"; // rascunho, reprovado e quaisquer status antigos desconhecidos
}

// nome amigável de um usuário (global — usado no histórico e nas notificações do fluxo de aprovação)
function _nomeUsuarioRel(id){ try{ return (USUARIOS&&USUARIOS[id]&&USUARIOS[id].nome)?USUARIOS[id].nome:(id||"—"); }catch(e){ return id||"—"; } }

async function renderRelatorios(){
  const view=document.getElementById("view");
  view.innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  const ehGestor=state.user.tipo==="gestor";
  const ehJulia=state.userId==="julia";
  const ehMaster=state.user.tipo==="master";
  const condGestor=ehGestor?(state.user.condominio||""):"";
  const d=await loadRelatorios(true); // sempre busca a versão mais recente do servidor
  let lista=d.list||[];
  // permissão: gestor vê só o dele; resto vê todos
  if(ehGestor) lista=lista.filter(r=>gestorCobre(r.condominio));
  // filtros
  if(!state.relFiltroMes) state.relFiltroMes="";
  if(!state.relFiltroCond) state.relFiltroCond="";
  const fMes=state.relFiltroMes, fCond=state.relFiltroCond;
  let filtrada=lista.slice();
  if(fMes) filtrada=filtrada.filter(r=>r.mesRef===fMes);
  if(fCond && !ehGestor) filtrada=filtrada.filter(r=>r.condominio===fCond);
  filtrada.sort((a,b)=> (b.mesRef+b.condominio).localeCompare(a.mesRef+a.condominio));

  // meses disponíveis para o filtro
  const meses=[...new Set((d.list||[]).map(r=>r.mesRef))].sort().reverse();

  let html=`<div class="weeknav">
    <div><h2>📄 Relatório Gerencial</h2><div class="range">${ehGestor?esc(condGestor||"Seu condomínio"):"Todos os condomínios"}</div></div>
    <div class="spacer"></div>
    ${ehGestor
      ? `<button class="btn-gold" onclick="novoRelatorioGestor()">＋ Preencher relatório</button>`
      : `<button class="btn-gold" onclick="novoRelatorioEscolherCond()">＋ Preencher relatório</button>`}
    ${ehJulia||ehMaster?`<button class="btn-ghost" onclick="abrirGerenciarCapas()">${ico('imagem')} Capas</button>`:""}
  </div>`;

  // prazo (aviso para gestor)
  if(ehGestor){
    const hojeDia=new Date().getDate();
    const jaFez=(d.list||[]).some(r=>gestorCobre(r.condominio) && r.mesRef===mesAnteriorRef());
    if(!jaFez && hojeDia<=10){
      html+=`<div class="com-alert" style="background:#FBF0DA;border-color:var(--gold2);color:#8a6411">⏰ Você tem até <b>dia 10</b> para enviar o relatório de <b>${mesRefLabel(mesAnteriorRef())}</b>. ${hojeDia>=7?"O prazo está acabando!":""}</div>`;
    }
  }

  // filtros (mês e condomínio) + relatório consolidado
  html+=`<div class="gv-filtros">
    <select class="gv-busca" style="font-weight:600" onchange="state.relFiltroMes=this.value;render()">
      <option value="">📅 Todos os meses</option>
      ${meses.map(m=>`<option value="${m}" ${fMes===m?"selected":""}>${mesRefLabel(m)}</option>`).join("")}
    </select>
    ${!ehGestor?`<select class="gv-busca" style="font-weight:600" onchange="state.relFiltroCond=this.value;render()">
      <option value="">🏢 Todos os condomínios</option>
      ${condOptionsAgrupadas(fCond)}
    </select>`:""}
    ${(fMes||fCond)?`<button class="btn-ghost" onclick="state.relFiltroMes='';state.relFiltroCond='';render()">Limpar</button>`:""}
    <span style="flex:1"></span>
    <button class="btn-ghost" onclick="abrirConsolidado()">📊 Consolidado semestral/anual</button>
  </div>`;

  // lista de relatórios
  if(filtrada.length===0){
    html+=`<div class="dia-empty">Nenhum relatório ${fMes?("de "+mesRefLabel(fMes)):""} encontrado.</div>`;
  } else {
    html+=`<div class="rel-list">`;
    filtrada.forEach(r=>{
      const nFotos=(r.registros||[]).length;
      const nReu=(r.reunioes||[]).length;
      const emAprov = (r.status==="enviado_julia"||r.status==="em_aprovacao");
      // todos podem editar/corrigir enquanto não publicado; Julia e master sempre
      const podeEditarEste = (r.status!=="publicado") || ehJulia || ehMaster;
      // enviar p/ aprovação: rascunho OU reprovado (depois dos ajustes) — qualquer um que não seja a Julia
      const podeEnviar = (r.status==="rascunho"||r.status==="reprovado") && !ehJulia;
      // aprovar/reprovar: Julia ou master, quando o relatório está em aprovação
      const podeAvaliar = (ehJulia||ehMaster) && emAprov;
      // arquivar: master, Julia ou qualquer BPO (apenas para relatórios publicados)
      const podeArquivar = ehMaster || ehJulia || (typeof BPO!=="undefined" && (BPO||[]).indexOf(state.userId)>=0);
      const podeExcluir = ehMaster || (r.criadoPor===state.userId && (r.status==="rascunho"||r.status==="reprovado") && !r.arquivado);
      const motivoHTML = (r.status==="reprovado" && r.motivoReprovacao)
        ? `<div class="rel-card-meta" style="color:#C0392B">✏️ Ajustes pedidos: ${esc(r.motivoReprovacao)}</div>` : "";
      html+=`<div class="rel-card">
        <div class="rel-card-top">
          <div><div class="rel-cond">${esc(r.condominio)}</div><div class="rel-mes">${mesRefLabel(r.mesRef)}</div></div>
          <span class="evrow-tag ${statusRelCls(r.status)}">${statusRelLabel(r.status)}</span>
        </div>
        <div class="rel-card-meta">${r.arquivado?'📦 Arquivado em '+(new Date(r.arquivadoEm).toLocaleDateString("pt-BR"))+' · ':''}${nFotos} registro${nFotos!==1?"s":""}${nReu?` · ${nReu} reuni${nReu!==1?"ões":"ão"}`:""} · ${(r.listaCorretiva||[]).length} corretivas · ${(r.listaPreventiva||[]).length} preventivas${(r.editadoEm||r.criadoEm)?` · última edição ${new Date(r.editadoEm||r.criadoEm).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}`:""}</div>
        ${motivoHTML}
        <div class="rel-card-acoes">
          <button class="btn-ghost" onclick="visualizarRelatorioPDF('${r.id}')">👁️ Ver / PDF</button>
          ${podeEditarEste && !r.arquivado?`<button class="btn-ghost" onclick="abrirEditorRelatorio('${esc(_jsq(r.condominio))}','${r.mesRef}','${r.id}')">✏️ Editar</button>`:""}
          ${podeEnviar?`<button class="btn-gold" onclick="enviarRelatorioJulia('${r.id}')">📨 Enviar para aprovação</button>`:""}
          ${podeAvaliar?`<button class="btn-gold" onclick="aprovarRelatorio('${r.id}')">✅ Aprovar</button>`:""}
          ${podeAvaliar?`<button class="btn-ghost" style="background:#F8E3E0;border-color:#C0392B;color:#C0392B" onclick="reprovarRelatorio('${r.id}')">✏️ Pedir ajustes</button>`:""}
          ${(ehJulia && r.status==="aprovado")?`<button class="btn-gold" onclick="publicarRelatorio('${r.id}')">📢 Enviar no grupo</button>`:""}
          ${(ehJulia && emAprov)?`<button class="btn-ghost" onclick="publicarRelatorio('${r.id}')" title="Aprova e publica de uma vez">📢 Enviar no grupo</button>`:""}
          ${(ehJulia && r.status==="rascunho")?`<button class="btn-gold" onclick="publicarRelatorio('${r.id}')">📢 Enviar no grupo</button>`:""}
          ${(r.status==="publicado" && !r.arquivado && podeArquivar)?`<button class="btn-ghost" style="background:#FFF6E0;border-color:#C9A24B" onclick="arquivarRelatorio('${r.id}')" title="Baixa o PDF completo e libera espaço removendo as fotos do banco">📦 Arquivar (baixar PDF)</button>`:""}
          ${podeExcluir?`<button class="btn-ghost" style="background:#F8E3E0;border-color:#C0392B;color:#C0392B" onclick="excluirRelatorio('${r.id}')" title="Remove o relatório e as fotos definitivamente">${ico('lixeira')} Excluir</button>`:""}
        </div>
      </div>`;
    });
    html+=`</div>`;
  }
  view.innerHTML=html;
  // migra relatórios antigos (fotos embutidas) para o formato leve, em segundo plano
  try{ _relResgateLocal(); }catch(e){}
  try{ _relMigrarFundo(); }catch(e){}
}

function novoRelatorioEscolherCond(){
  const inp='width:100%;padding:10px 12px;border:1.5px solid var(--line);border-radius:9px;font-size:14px;background:#FCFBF8';
  // últimos 6 meses como opção de referência
  const opts=[];
  const dref=new Date(); dref.setDate(1);
  for(let i=0;i<6;i++){ const m=dref.getFullYear()+"-"+("0"+(dref.getMonth()+1)).slice(-2); opts.push(m); dref.setMonth(dref.getMonth()-1); }
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:440px">
    <div class="modal-head"><h3>＋ Novo relatório</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="field"><label style="display:block;font-size:12px;font-weight:700;margin-bottom:5px">Condomínio</label>
        <select id="novoRelCond" style="${inp}">${condOptionsAgrupadas()}</select></div>
      <div class="field"><label style="display:block;font-size:12px;font-weight:700;margin-bottom:5px">Mês de referência</label>
        <select id="novoRelMes" style="${inp}">${opts.map((m,i)=>`<option value="${m}" ${i===1?"selected":""}>${mesRefLabel(m)}</option>`).join("")}</select></div>
      <div class="modal-foot" style="margin-top:14px"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-primary" style="flex:1" onclick="const c=document.getElementById('novoRelCond').value,m=document.getElementById('novoRelMes').value;closeModal();abrirEditorRelatorio(c,m);">Continuar</button></div>
    </div></div></div>`;
}

async function enviarRelatorioJulia(id){
  const {d, r}=await _relCarregarFresh(id, "Enviando para aprovação…");
  if(!r){ alert("Relatório não encontrado. Atualize a página (F5) e tente de novo."); return; }
  if(!(r.registros||[]).length && !(r.reunioes||[]).length){ if(!confirm("Este relatório não tem fotos. Enviar mesmo assim?")) return; }
  r.status="em_aprovacao"; // novo fluxo: Rascunho → Em aprovação → Aprovado → Publicado (ou → Ajustes necessários)
  r.enviadoEm=Date.now(); r.enviadoPor=state.userId;
  if(!Array.isArray(r.historico)) r.historico=[];
  r.historico.push({acao:"enviado_aprovacao", por:state.userId, ts:Date.now()});
  mostrarCarregandoRel("Gravando e notificando…");
  let ok=false;
  try{ ok=await salvarIndiceRelatorios(d, {ids:[r.id]}); } finally { if(!ok) esconderCarregandoRel(); }
  if(!ok) return; // se não gravou, não notifica ninguém (senão o status fica "Rascunho" com aviso enviado)
  try{
  // notifica a Julia (responsável pela aprovação)
  await pushAviso("julia",{
    id:"rel"+Date.now()+Math.random().toString(36).slice(2,5),
    texto:`Relatório para aprovar: ${r.condominio}`,
    sub:`${mesRefLabel(r.mesRef)} · aguardando sua aprovação`,
    relId:r.id, ts:Date.now()
  });
  // notifica também o gestor do condomínio (para ele saber que está em análise)
  const avGestor={
    id:"rel"+Date.now()+Math.random().toString(36).slice(2,6),
    texto:`Relatório em aprovação: ${r.condominio}`,
    sub:`${mesRefLabel(r.mesRef)} · enviado para a Julia revisar`,
    relId:r.id, ts:Date.now()
  };
  for(const uid of Object.keys(USUARIOS)){
    if(userCobreCond(uid,r.condominio) && uid!==state.userId){
      try{ await pushAviso(uid, avGestor); }catch(e){}
    }
  }
  } finally { esconderCarregandoRel(); }
  alert("Relatório enviado para aprovação! O status agora é \"Em aprovação\" e a Julia foi notificada.");
  render();
}

async function aprovarRelatorio(id){
  const {d, r}=await _relCarregarFresh(id, "Abrindo para aprovar…");
  if(!r){ alert("Relatório não encontrado. Atualize a página (F5) e tente de novo."); return; }
  if(!confirm(`✅ Aprovar o relatório de ${r.condominio} · ${mesRefLabel(r.mesRef)}?\n\nDepois de aprovado, ele fica pronto para ser publicado no grupo.`)) return;
  mostrarCarregandoRel("Gravando aprovação…");
  try{
  r.status="aprovado"; r.aprovadoEm=Date.now(); r.aprovadoPor=state.userId;
  if(!Array.isArray(r.historico)) r.historico=[];
  r.historico.push({acao:"aprovado", por:state.userId, ts:Date.now()});
  const ok=await salvarIndiceRelatorios(d, {ids:[r.id]});
  if(!ok) return;
  // avisa quem criou/enviou e os gestores do condomínio
  const aviso={
    id:"rel"+Date.now()+Math.random().toString(36).slice(2,5),
    texto:`Relatório aprovado: ${r.condominio}`,
    sub:`${mesRefLabel(r.mesRef)} · aprovado por ${_nomeUsuarioRel(state.userId)}`,
    relId:r.id, ts:Date.now()
  };
  const avisados=new Set([state.userId]);
  for(const uid of [r.enviadoPor, r.criadoPor]){
    if(uid && !avisados.has(uid)){ avisados.add(uid); try{ await pushAviso(uid, aviso); }catch(e){} }
  }
  for(const uid of Object.keys(USUARIOS)){
    if(userCobreCond(uid,r.condominio) && !avisados.has(uid)){
      avisados.add(uid);
      try{ await pushAviso(uid, aviso); }catch(e){}
    }
  }
  } finally { esconderCarregandoRel(); }
  alert("Relatório aprovado! Agora é só publicar no grupo quando quiser.");
  render();
}

async function reprovarRelatorio(id){
  const {d, r}=await _relCarregarFresh(id, "Abrindo o relatório…");
  if(!r){ alert("Relatório não encontrado. Atualize a página (F5) e tente de novo."); return; }
  const motivo=prompt(`✏️ O que precisa ser ajustado no relatório de ${r.condominio} · ${mesRefLabel(r.mesRef)}?\n\nEsse motivo aparece para quem vai corrigir.`);
  if(motivo===null) return; // cancelou
  mostrarCarregandoRel("Gravando devolução…");
  try{
  r.status="reprovado"; r.reprovadoEm=Date.now(); r.reprovadoPor=state.userId;
  r.motivoReprovacao=(motivo||"").trim();
  if(!Array.isArray(r.historico)) r.historico=[];
  r.historico.push({acao:"reprovado", por:state.userId, ts:Date.now(), motivo:r.motivoReprovacao});
  const ok=await salvarIndiceRelatorios(d, {ids:[r.id]});
  if(!ok) return;
  const aviso={
    id:"rel"+Date.now()+Math.random().toString(36).slice(2,5),
    texto:`Ajustes necessários: ${r.condominio}`,
    sub:`${mesRefLabel(r.mesRef)}${r.motivoReprovacao?" · "+r.motivoReprovacao.slice(0,80):""}`,
    relId:r.id, ts:Date.now()
  };
  const avisados=new Set([state.userId]);
  for(const uid of [r.enviadoPor, r.criadoPor]){
    if(uid && !avisados.has(uid)){ avisados.add(uid); try{ await pushAviso(uid, aviso); }catch(e){} }
  }
  for(const uid of Object.keys(USUARIOS)){
    if(userCobreCond(uid,r.condominio) && !avisados.has(uid)){
      avisados.add(uid);
      try{ await pushAviso(uid, aviso); }catch(e){}
    }
  }
  } finally { esconderCarregandoRel(); }
  alert("Relatório devolvido para ajustes. Quem criou foi notificado e pode corrigir e reenviar.");
  render();
}

// Histórico de movimentações do relatório (criado → enviado → aprovado/reprovado → publicado → arquivado)
async function verHistoricoRelatorio(id){
  let d=await loadRelatorios(); let r=(d.list||[]).find(x=>x.id===id); // cache primeiro: abre na hora
  if(!r){ const f=await _relCarregarFresh(id, "Carregando histórico…"); d=f.d; r=f.r; }
  if(!r){ alert("Relatório não encontrado. Atualize a página (F5) e tente de novo."); return; }
  const fmtDH=ts=>ts?new Date(ts).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"";
  const LBL={criado:"📝 Criado", enviado_aprovacao:"📨 Enviado para aprovação", aprovado:"✅ Aprovado", reprovado:"✏️ Devolvido para ajustes", publicado:"📢 Publicado no grupo", arquivado:"📦 Arquivado"};
  let eventos=(Array.isArray(r.historico)?r.historico:[]).slice();
  // relatórios antigos (antes do histórico existir): reconstrói pelos carimbos já gravados
  const tem=acao=>eventos.some(e=>e.acao===acao);
  if(r.criadoEm && !tem("criado")) eventos.push({acao:"criado", por:r.criadoPor, ts:r.criadoEm});
  if(r.enviadoEm && !tem("enviado_aprovacao")) eventos.push({acao:"enviado_aprovacao", por:r.enviadoPor, ts:r.enviadoEm});
  if(r.aprovadoEm && !tem("aprovado")) eventos.push({acao:"aprovado", por:r.aprovadoPor, ts:r.aprovadoEm});
  if(r.reprovadoEm && !tem("reprovado")) eventos.push({acao:"reprovado", por:r.reprovadoPor, ts:r.reprovadoEm, motivo:r.motivoReprovacao});
  if(r.publicadoEm && !tem("publicado")) eventos.push({acao:"publicado", por:r.publicadoPor, ts:r.publicadoEm});
  if(r.arquivadoEm && !tem("arquivado")) eventos.push({acao:"arquivado", por:r.arquivadoPor, ts:r.arquivadoEm});
  eventos.sort((a,b)=>(a.ts||0)-(b.ts||0));
  const linhas = eventos.length
    ? eventos.map(e=>`<div style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--line)">
        <div style="font-size:13.5px;font-weight:700;min-width:0;flex:1">${LBL[e.acao]||esc(e.acao||"")}
          ${e.motivo?`<div style="font-size:12px;font-weight:500;color:#C0392B;margin-top:2px">"${esc(e.motivo)}"</div>`:""}
          <div style="font-size:11.5px;font-weight:500;color:var(--muted);margin-top:2px">${e.por?("por "+esc(_nomeUsuarioRel(e.por))+" · "):""}${fmtDH(e.ts)}</div>
        </div>
      </div>`).join("")
    : `<div class="atend-hint" style="margin:0">Sem movimentações registradas ainda.</div>`;
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:480px;max-height:88vh;overflow:auto">
    <div class="modal-head"><h3>🕓 Histórico · ${esc(r.condominio)}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="book-sub" style="margin-top:0">${mesRefLabel(r.mesRef)} · status atual: <b>${statusRelLabel(r.status)}</b></div>
      <div style="margin-top:6px">${linhas}</div>
      <div class="modal-foot" style="margin-top:14px"><button class="btn-cancel" style="flex:1" onclick="closeModal()">Fechar</button></div>
    </div></div></div>`;
}

async function publicarRelatorio(id){
  const {d, r}=await _relCarregarFresh(id, "Publicando no grupo…");
  if(!r){ alert("Relatório não encontrado. Atualize a página (F5) e tente de novo."); return; }
  mostrarCarregandoRel("Gravando e notificando…");
  try{
  r.status="publicado"; r.publicadoEm=Date.now(); r.publicadoPor=state.userId;
  if(!Array.isArray(r.historico)) r.historico=[];
  r.historico.push({acao:"publicado", por:state.userId, ts:Date.now()});
  const ok=await salvarIndiceRelatorios(d, {ids:[r.id]});
  if(!ok) return; // se não gravou, não notifica (senão o status fica errado com aviso enviado)
  // notifica o gestor do condomínio + o síndico operacional dele
  const aviso={
    id:"rel"+Date.now()+Math.random().toString(36).slice(2,5),
    texto:`Relatório enviado: ${r.condominio}`,
    sub:`${mesRefLabel(r.mesRef)} foi enviado no grupo de avisos`,
    relId:r.id, ts:Date.now()
  };
  // acha o gestor do condomínio
  for(const uid of Object.keys(USUARIOS)){
    if(userCobreCond(uid,r.condominio)){
      try{ await pushAviso(uid, aviso); }catch(e){}
    }
  }
  // acha o síndico operacional do condomínio
  try{ const sid=await sindicoDoCondominio(r.condominio); if(sid) await pushAviso(sid, aviso); }catch(e){}
  } finally { esconderCarregandoRel(); }
  alert("Relatório enviado no grupo de avisos! O gestor e o síndico operacional foram notificados.");
  render();
}

// Excluir (remover) o relatório de vez: apaga do índice e as fotos do banco (irreversível)
async function excluirRelatorio(id){
  const {d, r}=await _relCarregarFresh(id, "Abrindo o relatório…");
  if(!r){ alert("Relatório não encontrado. Atualize a página (F5) e tente de novo."); return; }
  const rotulo = `${esc(r.condominio)} · ${mesRefLabel(r.mesRef)}`;
  if(!confirm(`🗑️ EXCLUIR o relatório de ${rotulo}?\n\nIsto REMOVE o relatório e TODAS as fotos dele do sistema, de forma PERMANENTE — não dá para desfazer.\n\nSe quiser apenas liberar espaço mantendo o texto, use "Arquivar" no lugar.\n\nTem certeza?`)) return;
  if(!confirm(`Confirmação final: excluir DEFINITIVAMENTE o relatório de ${rotulo}?`)) return;
  mostrarCarregandoRel("Excluindo o relatório…");
  let ok=false;
  try{
    // 🔒 build 122: exclusão reversível — o relatório e as fotos vão para a
    // LIXEIRA no servidor antes de sair da lista (recuperável se for engano)
    try{ await storeSet("mafra:lixeira:rel:"+id, JSON.stringify({rel:r, excluidoEm:Date.now(), excluidoPor:state.userId})); }catch(e){}
    try{ await _relMoverFotosLixeira(id); }catch(e){}
    const idx=(d.list||[]).findIndex(x=>x.id===id);
    if(idx>=0) d.list.splice(idx,1);
    ok=await salvarIndiceRelatorios(d, {removidos:[id]});
  } finally { esconderCarregandoRel(); }
  if(!ok){ alert("Não foi possível salvar a remoção no servidor. Verifique a internet e tente de novo."); return; }
  if(typeof closeModal==="function") closeModal();
  if(state.tab==="relatorios") render();
}

async function arquivarRelatorio(id){
  const {d, r}=await _relCarregarFresh(id, "Abrindo o relatório…");
  if(!r){ alert("Relatório não encontrado. Atualize a página (F5) e tente de novo."); return; }
  if(r.arquivado){ alert("Este relatório já está arquivado."); return; }
  const temFoto=x=>x && !x.arquivada && (x.foto || x.fid);
  const temDep=x=>x && !x.arquivada && (x.fotoDepois || x.fidDepois);
  const _nEx=(r.registros||[]).reduce(function(a,x){return a+((x&&!x.arquivada&&Array.isArray(x.fotosExtras))?x.fotosExtras.filter(function(e){return e&&(e.foto||e.fid);}).length:0);},0);
  const nFotos=(r.registros||[]).filter(temFoto).length + (r.registros||[]).filter(temDep).length + (r.reunioes||[]).filter(temFoto).length + _nEx;
  const tamEstimado = (nFotos * 0.3).toFixed(1); // ~300 KB por foto
  const msg = `📦 Arquivar relatório de ${esc(r.condominio)} · ${mesRefLabel(r.mesRef)}\n\n`
    + `Vai abrir o PDF para você BAIXAR e salvar no Drive da Mafra.\n`
    + `Depois, ao confirmar, as ${nFotos} foto(s) serão removidas do banco (libera ~${tamEstimado} MB).\n\n`
    + `⚠️ Faça o download do PDF ANTES de confirmar — as fotos não voltam.\n`
    + `O resumo em texto (descrições, manutenções, mês) continua no sistema.\n\n`
    + `Deseja continuar?`;
  if(!confirm(msg)) return;
  // abre o PDF para download
  await visualizarRelatorioPDF(id);
  // segunda confirmação após o download
  await new Promise(res=>setTimeout(res,800));
  if(!confirm("✅ Você já baixou e salvou o PDF no Drive?\n\nAo clicar OK, as fotos serão removidas DO BANCO (irreversível).")) return;
  mostrarCarregandoRel("Arquivando e liberando espaço…");
  try{
  // converte fotos em "removida", mantendo descrição
  if(r.registros) r.registros = r.registros.map(reg=>({
    descricao: reg.descricao||"",
    tipo: reg.tipo||"",
    orient: reg.orient||"h",
    dataAtividade: reg.dataAtividade||"",
    nomeArquivo: reg.nomeArquivo||"",
    ts: reg.ts||0,
    dataFim: reg.dataFim||"",
    prazoEstimado: reg.prazoEstimado||"",
    status: reg.status||"",
    modo: reg.modo||"dupla",
    foto: "", // remove o base64
    fotoDepois: "",
    fotosExtras: (Array.isArray(reg.fotosExtras)?reg.fotosExtras:[]).map(function(){return {foto:"", fid:""};}),
    arquivada: true
  }));
  if(r.reunioes) r.reunioes = r.reunioes.map(reg=>({
    descricao: reg.descricao||"",
    orient: reg.orient||"h",
    dataAtividade: reg.dataAtividade||"",
    nomeArquivo: reg.nomeArquivo||"",
    ts: reg.ts||0,
    foto: "", // remove o base64
    arquivada: true
  }));
  // apaga também a chave de fotos deste relatório (é ela que ocupa o espaço)
  try{ await _relApagarFotos(r.id); }catch(e){}
  delete r.fotosSeparadas; delete r.fotosBytes;
  r.arquivado = true;
  r.arquivadoEm = Date.now();
  r.arquivadoPor = state.userId;
  if(!Array.isArray(r.historico)) r.historico=[];
  r.historico.push({acao:"arquivado", por:state.userId, ts:Date.now()});
  const okArq=await salvarIndiceRelatorios(d, {ids:[r.id]});
  if(!okArq) return;
  } finally { esconderCarregandoRel(); }
  alert("✅ Relatório arquivado. O resumo em texto continua disponível, e o espaço no banco foi liberado.");
  render();
}

async function novoCondominioNasCapas(){
  const nome=prompt("Nome do novo condomínio:");
  if(nome===null) return;
  const n=nome.trim();
  if(!n){ alert("Informe o nome."); return; }
  if(CONDOMINIOS.includes(n)){ alert("Esse condomínio já existe. Selecione-o na lista."); return; }
  CONDOMINIOS.push(n);
  await salvarCondominiosExtra();
  await abrirGerenciarCapas();
  // seleciona o recém-criado
  const sel=document.getElementById("capCond");
  if(sel){ sel.value=n; previewCapa(); }
  alert("Condomínio \""+n+"\" criado! Agora suba a capa e a contracapa dele. Ele também já aparece em todo o app e na criação de usuários.");
}

async function abrirGerenciarCapas(){
  try{ migrarCapasLegado(); }catch(e){} // copia capas antigas p/ o novo formato em segundo plano
  const inp='width:100%;padding:9px 11px;border:1.5px solid var(--line);border-radius:9px;font-size:14px';
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:520px;max-height:90vh;overflow:auto">
    <div class="modal-head"><h3>${ico('imagem')} Capas e contracapas</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">Para condomínios novos, clique em <b>"＋ Novo condomínio"</b>, depois suba a capa e a contracapa. Elas valem para o Relatório Gerencial, o Manual de Boas-Vindas e a Vistoria. Se não houver, sai o padrão Mafra.</p>
      <div class="field"><label style="display:block;font-size:12px;font-weight:700;margin-bottom:5px">Condomínio</label>
        <div style="display:flex;gap:8px">
          <select id="capCond" style="${inp};flex:1" onchange="previewCapa()">
            ${condOptionsAgrupadas()}
          </select>
          <button class="btn-gold" style="white-space:nowrap" onclick="novoCondominioNasCapas()">＋ Novo</button>
        </div></div>
      <div id="capPreview" style="margin-top:14px"></div>
      <div style="display:flex;gap:10px;margin-top:14px">
        <label class="btn-ghost" style="flex:1;text-align:center;cursor:pointer">${ico('camera')} Capa<input type="file" accept="image/*" style="display:none" onchange="subirCapa('capa',this.files[0])"></label>
        <label class="btn-ghost" style="flex:1;text-align:center;cursor:pointer">📄 Contracapa<input type="file" accept="image/*" style="display:none" onchange="subirCapa('contracapa',this.files[0])"></label>
      </div>
      <div class="modal-foot" style="margin-top:16px"><button class="btn-primary" style="flex:1" onclick="closeModal()">Concluir</button></div>
    </div></div></div>`;
  previewCapa();
}

async function previewCapa(){
  const cond=document.getElementById("capCond").value;
  const cap=await loadCapaDe(cond);
  const box=document.getElementById("capPreview");
  box.innerHTML=`<div style="display:flex;gap:10px">
    <div style="flex:1;text-align:center"><div style="font-size:11px;color:#888;margin-bottom:4px">CAPA</div>${cap.capa?`<img src="${cap.capa}" style="width:100%;border-radius:8px;max-height:120px;object-fit:cover">`:`<div style="background:#eee;border-radius:8px;padding:30px;color:#aaa;font-size:12px">Padrão Mafra</div>`}</div>
    <div style="flex:1;text-align:center"><div style="font-size:11px;color:#888;margin-bottom:4px">CONTRACAPA</div>${cap.contracapa?`<img src="${cap.contracapa}" style="width:100%;border-radius:8px;max-height:120px;object-fit:cover">`:`<div style="background:#eee;border-radius:8px;padding:30px;color:#aaa;font-size:12px">Padrão Mafra</div>`}</div>
  </div>`;
}

async function subirCapa(tipo, file){
  if(!file) return;
  try{
    const img=await comprimirImagem(file, 1400, 0.75);
    const cond=document.getElementById("capCond").value;
    // NOVO FORMATO: cada condomínio na sua própria chave (leve e com confirmação de gravação).
    // Antes, todas as capas ficavam num blocão único que crescia demais e a gravação
    // falhava em silêncio — por isso as capas "sumiam".
    const atual=await loadCapaDe(cond);
    const obj={ capa: tipo==="capa" ? img.foto : (atual.capa&&atual.capa.startsWith("data:")?atual.capa:""),
                contracapa: tipo==="contracapa" ? img.foto : (atual.contracapa&&atual.contracapa.startsWith("data:")?atual.contracapa:""),
                mesPos: (typeof atual.mesPos==="number"?atual.mesPos:23) };
    let ok=await storeSet("mafra:capa:"+cond, JSON.stringify(obj));
    if(!ok){
      await new Promise(res=>setTimeout(res,1200));
      ok=await storeSet("mafra:capa:"+cond, JSON.stringify(obj));
    }
    if(!ok){ alert("⚠️ Não foi possível salvar a "+tipo+" no servidor.\n\nVerifique a internet e tente de novo — a imagem NÃO foi gravada."); return; }
    // espelha no formato antigo (melhor esforço — versões antigas do app continuam achando a capa)
    try{
      const salvas=(await (async()=>{ try{const v=await storeGet("mafra:capas_cond"); return v?JSON.parse(v):{};}catch(e){return {};} })());
      if(!salvas[cond])salvas[cond]={};
      salvas[cond][tipo]=img.foto;
      await saveCapas(salvas);
    }catch(e){}
    await checarEspacoBianca();
    previewCapa();
    alert("✅ "+(tipo==="capa"?"Capa":"Contracapa")+" de "+cond+" salva com sucesso!");
  }catch(e){ alert("Não consegui processar a imagem."); }
}

/* ---- Seção "Capas Relatórios" na aba Gerenciar — capa/contracapa valem p/ os 3 documentos (só liderança master e Julia) ---- */
function _capgerPodeVer(){ try{ return !!(state.user && (state.user.tipo==="master" || state.userId==="julia")); }catch(e){ return false; } }

function _capgerId(cond){ return String(cond).toLowerCase().replace(/[^a-z0-9]+/g,"_"); }

// indica se a capa/contracapa do condomínio é personalizada (e não o padrão Mafra)
async function _capgerOrigem(cond){
  let p={capa:false, contracapa:false};
  try{ const v=await storeGet("mafra:capa:"+cond); if(v){ const o=JSON.parse(v)||{}; p.capa=!!o.capa; p.contracapa=!!o.contracapa; } }catch(e){}
  if(!p.capa || !p.contracapa){
    try{ const v=await storeGet("mafra:capas_cond"); if(v){ const all=JSON.parse(v)||{}; const s=all[cond]||{}; p.capa=p.capa||!!s.capa; p.contracapa=p.contracapa||!!s.contracapa; } }catch(e){}
  }
  if(!p.capa && typeof CAPAS_EMBUTIDAS==="object" && CAPAS_EMBUTIDAS[cond]) p.capa=true; // capa que já vem no app conta como definida
  return p;
}

async function carregarCapasGerenciar(){
  const grid=document.getElementById("capgerGrid");
  if(!grid || !_capgerPodeVer()) return;
  grid.innerHTML="";
  const lista=(CONDOMINIOS||[]).slice().sort((a,b)=>String(a).localeCompare(String(b),"pt-BR"));
  if(!lista.length){ grid.innerHTML='<div class="atend-hint" style="margin:0">Nenhum condomínio cadastrado.</div>'; return; }
  for(const cond of lista){
    const div=document.createElement("div");
    div.className="capger-card";
    div.id="capger_"+_capgerId(cond);
    div.innerHTML='<div class="capger-nome">'+esc(cond)+'</div><div class="atend-hint" style="margin:6px 0 0">Carregando…</div>';
    grid.appendChild(div);
  }
  // desenha um por vez (as imagens em base64 são pesadas; assim a tela não trava)
  for(const cond of lista){
    if(!document.getElementById("capger_"+_capgerId(cond))) return; // usuário trocou de aba
    await _capgerDesenharCard(cond);
  }
}

async function _capgerDesenharCard(cond){
  const el=document.getElementById("capger_"+_capgerId(cond));
  if(!el) return;
  const [cap, orig]=await Promise.all([loadCapaDe(cond), _capgerOrigem(cond)]);
  const nm=String(cond).replace(/'/g,"\\'");
  const id=_capgerId(cond);
  const chip=(ok)=> ok
    ? '<span class="capger-ok">✓ definida</span>'
    : '<span class="capger-def">padrão Mafra</span>';
  el.innerHTML=`
    <div class="capger-nome">${esc(cond)}</div>
    <div class="capger-thumbs">
      <div class="capger-col">
        <div class="capger-lbl">CAPA ${chip(orig.capa)}</div>
        <div class="capger-thumb">${cap.capa?`<img src="${cap.capa}" loading="lazy">`:`<div class="capger-vazio">padrão<br>Mafra</div>`}</div>
        <label class="btn-ghost capger-btn">${ico('camera')} ${orig.capa?"Trocar":"Adicionar"} capa<input type="file" accept="image/*" style="display:none" onchange="subirCapaGerenciar('${nm}','capa',this)"></label>
      </div>
      <div class="capger-col">
        <div class="capger-lbl">CONTRACAPA ${chip(orig.contracapa)}</div>
        <div class="capger-thumb">${cap.contracapa?`<img src="${cap.contracapa}" loading="lazy">`:`<div class="capger-vazio">padrão<br>Mafra</div>`}</div>
        <label class="btn-ghost capger-btn">📄 ${orig.contracapa?"Trocar":"Adicionar"} contracapa<input type="file" accept="image/*" style="display:none" onchange="subirCapaGerenciar('${nm}','contracapa',this)"></label>
      </div>
    </div>`;
}

// sobe a capa/contracapa direto da aba Gerenciar (mesma gravação confirmada do gerenciador em janela)
async function subirCapaGerenciar(cond, tipo, input){
  const file=input && input.files && input.files[0];
  if(input) input.value=""; // permite escolher o mesmo arquivo de novo
  if(!file) return;
  if(!_capgerPodeVer()){ alert("Apenas a liderança e a Julia podem alterar as capas."); return; }
  const el=document.getElementById("capger_"+_capgerId(cond));
  if(el) el.style.opacity="0.5";
  try{
    const img=await comprimirImagem(file, 1400, 0.75);
    const atual=await loadCapaDe(cond);
    const obj={ capa: tipo==="capa" ? img.foto : (atual.capa&&atual.capa.startsWith("data:")?atual.capa:""),
                contracapa: tipo==="contracapa" ? img.foto : (atual.contracapa&&atual.contracapa.startsWith("data:")?atual.contracapa:""),
                mesPos: (typeof atual.mesPos==="number"?atual.mesPos:23) };
    let ok=await storeSet("mafra:capa:"+cond, JSON.stringify(obj));
    if(!ok){
      await new Promise(res=>setTimeout(res,1200));
      ok=await storeSet("mafra:capa:"+cond, JSON.stringify(obj));
    }
    if(!ok){ if(el) el.style.opacity=""; alert("⚠️ Não foi possível salvar a "+tipo+" no servidor.\n\nVerifique a internet e tente de novo — a imagem NÃO foi gravada."); return; }
    // espelha no formato antigo (melhor esforço — versões antigas do app continuam achando a capa)
    try{
      const salvas=(await (async()=>{ try{const v=await storeGet("mafra:capas_cond"); return v?JSON.parse(v):{};}catch(e){return {};} })());
      if(!salvas[cond])salvas[cond]={};
      salvas[cond][tipo]=img.foto;
      await saveCapas(salvas);
    }catch(e){}
    await checarEspacoBianca();
    await _capgerDesenharCard(cond);
    const el2=document.getElementById("capger_"+_capgerId(cond));
    if(el2) el2.style.opacity="";
  }catch(e){ if(el) el.style.opacity=""; alert("Não consegui processar a imagem."); }
}

async function abrirConsolidado(){
  const inp='width:100%;padding:9px 11px;border:1.5px solid var(--line);border-radius:9px;font-size:14px';
  const ano=new Date().getFullYear();
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:440px">
    <div class="modal-head"><h3>📊 Relatório consolidado</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">Junta todas as manutenções do período num único relatório.</p>
      <div class="field"><label style="display:block;font-size:12px;font-weight:700;margin-bottom:5px">Período</label>
        <select id="consPer" style="${inp}">
          <option value="sem1">1º Semestre (Jan–Jun) ${ano}</option>
          <option value="sem2">2º Semestre (Jul–Dez) ${ano}</option>
          <option value="ano">Ano inteiro ${ano}</option>
        </select></div>
      ${state.user.tipo!=="gestor"?`<div class="field"><label style="display:block;font-size:12px;font-weight:700;margin-bottom:5px">Condomínio</label>
        <select id="consCond" style="${inp}"><option value="">Todos os condomínios</option>${condOptionsAgrupadas()}</select></div>`:""}
      <div class="modal-foot" style="margin-top:14px"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-primary" style="flex:1" onclick="gerarConsolidado()">Gerar</button></div>
    </div></div></div>`;
}

async function gerarConsolidado(){
  const per=document.getElementById("consPer").value;
  const ano=new Date().getFullYear();
  const ehGestor=state.user.tipo==="gestor";
  const cond= ehGestor ? "" : (document.getElementById("consCond")?document.getElementById("consCond").value:"");
  let mIni,mFim,perLbl;
  if(per==="sem1"){ mIni=1;mFim=6;perLbl="1º Semestre "+ano; }
  else if(per==="sem2"){ mIni=7;mFim=12;perLbl="2º Semestre "+ano; }
  else { mIni=1;mFim=12;perLbl="Ano "+ano; }
  const d=await loadRelatorios();
  let rels=(d.list||[]).filter(r=>{
    const [a,m]=r.mesRef.split("-").map(Number);
    return a===ano && m>=mIni && m<=mFim && (!cond || r.condominio===cond) && (!ehGestor || gestorCobre(r.condominio));
  }).sort((a,b)=>a.mesRef.localeCompare(b.mesRef));
  if(!rels.length){ alert("Nenhum relatório encontrado nesse período."); return; }
  const win=window.open("","_blank");
  if(!win){ alert("Permita pop-ups."); return; }
  let corpo="";
  rels.forEach(r=>{
    corpo+=`<h2>${esc(r.condominio)} · ${mesRefLabel(r.mesRef)}</h2>
      <div class="bloco"><b>Corretivas</b> (Elétrica ${r.corretivas.eletrica||0}, Hidráulica ${r.corretivas.hidraulica||0}, Civil ${r.corretivas.civil||0})
      <ul>${(r.listaCorretiva||[]).map(x=>`<li>${esc(x)}</li>`).join("")||"<li>—</li>"}</ul></div>
      <div class="bloco"><b>Preventivas</b> (Previstas ${r.preventivas.previstas||0}, Realizadas ${r.preventivas.realizadas||0}, Em aberto ${r.preventivas.emAberto||0})
      <ul>${(r.listaPreventiva||[]).map(x=>`<li>${esc(x)}</li>`).join("")||"<li>—</li>"}</ul></div>`;
  });
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Consolidado ${perLbl}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>body{font-family:'Montserrat',Arial,sans-serif;color:#16243D;padding:34px;max-width:820px;margin:0 auto;-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important}
  *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important}
  h1{font-size:23px;font-weight:800;border-bottom:3px solid #C9A24B;padding-bottom:10px}
  .sub{color:#666;margin-bottom:22px;font-size:13.5px}
  h2{font-size:15px;font-weight:700;background:#16243D;color:#fff;padding:9px 14px;border-radius:8px;margin-top:24px;letter-spacing:.3px}
  .bloco{margin:12px 0;padding-left:6px}
  .bloco b{font-size:13.5px;color:#1f3354}
  ul{margin:7px 0 7px 24px}
  li{font-size:13.5px;margin-bottom:5px;line-height:1.4}
  li::marker{color:#C9A24B}
  @media print{.noprint{display:none}}
  button{padding:10px 22px;background:#C9A24B;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:700;font-family:'Montserrat',sans-serif}</style></head><body>
  <h1>📊 Relatório Consolidado de Manutenções</h1>
  <div class="sub">${cond?esc(cond):"Todos os condomínios"} · ${perLbl} · ${rels.length} relatório(s)</div>
  ${corpo}
  <p class="noprint" style="margin-top:24px;text-align:center"><button onclick="window.print()">🖨️ Imprimir / Salvar PDF</button></p>
  </body></html>`);
  win.document.close();
}


