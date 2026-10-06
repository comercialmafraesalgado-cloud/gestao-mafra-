/* ============================================================
   GESTÃO MAFRA — MODULO NOTIFICACOES
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: marcarNotifsVistas, marcarAvisosComoLidos, _dataHojeStr, _ehDiaUtil, _temCheckinHoje, _avisoCheckinJaDado, _ehFeriasHoje, verificarCheckinEsquecido, avisarAceite, checkinPendentePorDepto, marcarUmNotifVisto, _loadNotifLog, _pushNotifLog, notifTap, notifHistTap, abrirNotificacoes, limparNotifsVistas, recusarConvite, confirmarReuniao, abrirModalSubstituto, recusarSemSubstituto, indicarSubstituto, abrirModalModalidade, selModalidade, finalizarAceite */

async function marcarNotifsVistas(ids){
  const atual=await notifVistos();
  const novo=Array.from(new Set(atual.concat(ids)));
  await storeSet("mafra:notifvistos:"+state.userId, JSON.stringify(novo));
}

async function marcarAvisosComoLidos(){
  if(!state.userId) return;
  const lista = await loadAvisos(state.userId);
  let mudou = false;
  for(const a of lista){ if(!a.lida){ a.lida = true; mudou = true; } }
  if(mudou){
    await storeSet("mafra:avisos:"+state.userId, JSON.stringify(lista));
    await atualizarBadgeApp();
  }
}

function _dataHojeStr(){
  const d=new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,'0')+"-"+String(d.getDate()).padStart(2,'0');
}

function _ehDiaUtil(){ const d=new Date().getDay(); return d>=1 && d<=5; }

async function _temCheckinHoje(uid){
  try{
    const d = await loadCheckins();
    const hoje = _dataHojeStr();
    return (d.registros||[]).some(r=>{
      if(r.uid !== uid) return false;
      const dt = new Date(r.checkIn);
      const rdata = dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,'0')+"-"+String(dt.getDate()).padStart(2,'0');
      return rdata === hoje;
    });
  }catch(e){ return false; }
}

async function _avisoCheckinJaDado(uid, slot){
  // slot = "9h" ou "14h" ou "biancaalerta"
  try{
    const lista = await loadAvisos(uid);
    const hoje = _dataHojeStr();
    return (lista||[]).some(a => a.tipo==="checkin_lembrete" && a.slot===slot && a.dia===hoje);
  }catch(e){ return false; }
}

async function _ehFeriasHoje(uid){
  try{ const info = await infoFeriasHoje(uid); return !!info; }catch(e){ return false; }
}

async function verificarCheckinEsquecido(){
  if(!state.userId) return;
  if(!_ehDiaUtil()) return;
  const hora = new Date().getHours();
  if(hora < 9 || hora >= 19) return; // fora de horário útil

  // 1) Lembrete para o próprio usuário (se ele faz check-in)
  const eu = state.userId;
  if(ALERTA_CHECKIN_ALVO.includes(eu) && !(await _ehFeriasHoje(eu))){
    const tem = await _temCheckinHoje(eu);
    if(!tem){
      // 9h–11h59: avisa slot "9h" se ainda não avisou
      if(hora>=9 && hora<12 && !(await _avisoCheckinJaDado(eu,"9h"))){
        await pushAviso(eu, {
          id:"chk"+Date.now()+Math.random().toString(36).slice(2,5),
          texto:"⏰ Você ainda não fez check-in hoje",
          sub:"Bata seu check-in para o sistema registrar onde você está trabalhando agora",
          ts: Date.now(),
          tipo:"checkin_lembrete", slot:"9h", dia:_dataHojeStr()
        });
      }
      // 14h–18h59: 2º lembrete só para síndicos (BPO trabalha o dia todo do escritório, não precisa de 2 lembretes)
      const ehSindico = ["walace","bruna","milena"].includes(eu);
      if(ehSindico && hora>=14 && hora<19 && !(await _avisoCheckinJaDado(eu,"14h"))){
        await pushAviso(eu, {
          id:"chk"+Date.now()+Math.random().toString(36).slice(2,5),
          texto:"⏰ Ainda sem check-in hoje",
          sub:"Lembrete da tarde — registre seu check-in para a equipe saber onde você está",
          ts: Date.now(),
          tipo:"checkin_lembrete", slot:"14h", dia:_dataHojeStr()
        });
      }
    }
  }

  // 2) Aviso para a BIANCA, de 1 em 1 hora a partir das 8h: quem (por departamento)
  //    ainda não bateu check-in entre os Síndicos Operacionais e o BPO.
  if(eu==="bianca" && hora>=8 && hora<19){
    const slotHora="ckdepto-"+hora;   // um slot por hora -> dispara no máx. 1×/hora
    if(!(await _avisoCheckinJaDado(eu,slotHora))){
      const partes=[]; let totalFaltam=0;
      for(const dp of DEPTOS_CHECKIN){
        const faltam=[];
        for(const sid of dp.ids){
          if(!USUARIOS[sid]) continue;
          if(sid===eu) continue;                 // não cobra a própria Bianca
          if(await _ehFeriasHoje(sid)) continue;
          if(!(await _temCheckinHoje(sid))){
            faltam.push(USUARIOS[sid].nome.split(" ")[0]);
          }
        }
        if(faltam.length){ partes.push(`${dp.nome}: ${faltam.join(", ")}`); totalFaltam+=faltam.length; }
      }
      if(totalFaltam > 0){
        await pushAviso(eu, {
          id:"chk"+Date.now()+Math.random().toString(36).slice(2,5),
          texto:`⏰ ${totalFaltam} sem check-in até agora`,
          sub:partes.join(" · "),
          ts: Date.now(),
          tipo:"checkin_lembrete", slot:slotHora, dia:_dataHojeStr(),
          goTab:"inicio"
        });
      }
    }
  }

  // atualiza badge
  try{ await atualizarBadgeApp(); }catch(e){}
}

async function avisarAceite(ev, quemId){
  const quem=USUARIOS[quemId]?USUARIOS[quemId].nome.split(" ")[0]:"Alguém";
  const equipe=(ev.participantes||[]).filter(p=>p.tipo==="equipe").map(p=>p.id);
  const dataFmt=(ev.date||"").split("-").reverse().join("/");
  const titulo=(ev.title||"reunião").replace("Reunião — ","");
  const aviso={
    id:"av"+Date.now()+Math.random().toString(36).slice(2,5),
    texto:`${quem} aceitou: ${titulo}`,
    sub:`${dataFmt} · ${ev.start}–${ev.end}`,
    gid:ev.gid||ev.id, ts:Date.now()
  };
  for(const uid of equipe){
    if(uid===quemId) continue;            // não avisa quem aceitou
    try{ await pushAviso(uid, aviso); }catch(e){}
  }
}

async function checkinPendentePorDepto(){
  if(!_ehDiaUtil()) return null;
  const deptos=[];
  for(const dp of DEPTOS_CHECKIN){
    const faltam=[];
    for(const uid of dp.ids){
      if(!USUARIOS[uid]) continue;
      if(await _ehFeriasHoje(uid)) continue;          // de férias não conta
      if(!(await _temCheckinHoje(uid))){
        faltam.push({id:uid, nome:USUARIOS[uid].nome.split(" ")[0]});
      }
    }
    deptos.push({nome:dp.nome, faltam, total:dp.ids.filter(id=>USUARIOS[id]).length});
  }
  return { deptos, hora:new Date().getHours() };
}

async function marcarUmNotifVisto(id){
  if(!id) return;
  await marcarNotifsVistas([id]);
  await abrirNotificacoes();   // re-renderiza a lista já sem o item
  try{ atualizaSino(); }catch(e){}
}

async function _loadNotifLog(){ try{ const v=await storeGet("mafra:notiflog:"+state.userId); if(v) return JSON.parse(v); }catch(e){} return []; }

async function _pushNotifLog(item){
  try{
    let log=await _loadNotifLog();
    log=log.filter(x=>x.id!==item.id);          // evita duplicar
    log.unshift({...item, vistoEm:Date.now()});
    log=log.slice(0,30);                          // guarda as 30 mais recentes
    await storeSet("mafra:notiflog:"+state.userId, JSON.stringify(log));
  }catch(e){}
}

async function notifTap(id, meta){
  try{
    if(meta) await _pushNotifLog({id, ic:meta.ic||"🔔", texto:meta.texto||"", sub:meta.sub||"", goTab:meta.goTab||"", goDate:meta.goDate||""});
    if(id) await marcarNotifsVistas([id]);
  }catch(e){}
  closeModal();
  try{ atualizaSino(); atualizarBadgeApp(); }catch(e){}
  // navega ao destino
  if(meta && meta.goDate){ state.calRef=new Date(meta.goDate+"T12:00"); state.tab="calendario"; render(); return; }
  if(meta && meta.goComentario){ abrirComentarios(meta.goComentario, meta.goTitulo||"", null); return; }
  if(meta && meta.goTab){ setTab(meta.goTab); return; }
  if(meta && meta.run){ try{ (new Function(meta.run))(); }catch(e){} }
}

function notifHistTap(goTab, goDate){
  closeModal();
  if(goDate){ state.calRef=new Date(goDate+"T12:00"); state.tab="calendario"; render(); return; }
  if(goTab){ setTab(goTab); }
}

async function abrirNotificacoes(){
  // Marca todos os avisos como lidos (zera badge do ícone do app)
  try{ await marcarAvisosComoLidos(); }catch(e){}
  const cf=await notifsConfirmar();
  const ld=await notifsLideranca();
  const ag=await notifsAgenda();
  const gr=await notifsGravacoes();
  const av=await notifsAvisos();
  const be=await notifsBemEstar();
  // painel de check-in por departamento — só a Bianca, em dia útil — sempre recalculado na hora
  const semCk = (state.userId==="bianca") ? await checkinPendentePorDepto() : null;
  const com = [];  // aba Comunicados removida — sem notificações de comunicados pendentes
  let itens="";
  // ===== Check-in do dia, por departamento (todas as masters) =====
  if(semCk && semCk.deptos.some(d=>d.faltam.length)){
    itens+=`<div class="notif-sec">${ico('local')} Check-in de hoje por departamento</div>`;
    semCk.deptos.forEach(d=>{
      if(!d.total) return;
      const ok = d.total - d.faltam.length;
      if(d.faltam.length===0){
        itens+=`<div class="notif-item" style="cursor:default">
          <div class="notif-ic" style="background:#EAF7EE">✅</div>
          <div class="notif-body"><div class="notif-t">${esc(d.nome)} · todos bateram</div>
          <div class="notif-m">${ok}/${d.total} com check-in hoje</div></div></div>`;
      } else {
        const nomes=d.faltam.map(f=>esc(f.nome)).join(", ");
        itens+=`<div class="notif-item" style="cursor:default;flex-wrap:wrap">
          <div class="notif-ic" style="background:#FBEBEB">⏰</div>
          <div class="notif-body"><div class="notif-t">${esc(d.nome)} · ${d.faltam.length} sem check-in</div>
          <div class="notif-m">Faltam: ${nomes} · ${ok}/${d.total} já bateram</div></div></div>`;
      }
    });
  }
  if(be.length){
    itens+=`<div class="notif-sec">🌿 Cuidando de você</div>`;
    be.forEach(b=>{
      itens+=`<div class="notif-item" style="cursor:default">
        <div class="notif-ic" style="background:#E6F4EA;font-size:18px">${b.ic}</div>
        <div class="notif-body"><div class="notif-t">${esc(b.texto)}</div>
        <div class="notif-m">${esc(b.sub||"")}</div></div>
        <button class="notif-visto" title="Marcar como visto" onclick="event.stopPropagation();marcarUmNotifVisto('${b.id}')">✓</button></div>`;
    });
  }
  if(av.length){
    itens+=`<div class="notif-sec">✅ Confirmações</div>`;
    av.forEach(a=>{
      // destino: relatório -> aba relatórios; menção -> comentário; gid -> calendário; senão a aba do aviso
      const ic = a.goComentario?'💬':(a.relId?'📄':'✅');
      const meta = JSON.stringify({ic, texto:a.texto||"", sub:a.sub||"", goComentario:a.goComentario||"", goTitulo:a.goTitulo||"", goTab:a.relId?"relatorios":(a.goTab||(a.gid?"calendario":""))}).replace(/'/g,"\\'");
      itens+=`<div class="notif-item" onclick='notifTap("${a.id}", ${meta})'>
        <div class="notif-ic" style="background:#EAF7EE">${ic}</div>
        <div class="notif-body"><div class="notif-t">${esc(a.texto)}</div>
        <div class="notif-m">${esc(a.sub||"")}</div></div>
        <button class="notif-visto" title="Marcar como visto" onclick="event.stopPropagation();marcarUmNotifVisto('${a.id}')">✓</button></div>`;
    });
  }
  if(cf.length){
    itens+=`<div class="notif-sec">✋ Reuniões para você confirmar</div>`;
    cf.forEach(e=>{
      const dataFmt=(e.date||"").split("-").reverse().join("/");
      const ehConvite = e.souConvidado && !e.guest;
      const foiIndicado = !!e.indicadoPor;
      const quemIndicou = e.indicadoPor&&USUARIOS[e.indicadoPor]?USUARIOS[e.indicadoPor].nome.split(" ")[0]:"";
      const quemConvidou = e.criadoPor&&USUARIOS[e.criadoPor]?USUARIOS[e.criadoPor].nome.split(" ")[0]:"alguém";
      const titulo = foiIndicado
        ? `${esc(quemIndicou)} indicou você para uma reunião`
        : (ehConvite
            ? `${esc(quemConvidou)} convidou você para uma reunião`
            : `${esc(e.guest?e.guest.nome:"Externo")} quer marcar reunião`);
      const contato = e.guest&&e.guest.fone ? (" · 📱 "+esc(e.guest.fone)) : "";
      const sub = (ehConvite && !foiIndicado)
        ? `${dataFmt} · ${esc(e.start)}–${esc(e.end)}${contato}`
        : `${dataFmt} · ${esc(e.start)}–${esc(e.end)}${contato}${e.guest&&e.guest.email?(" · "+esc(e.guest.email)):""}`;
      const foneDigits = e.guest&&e.guest.fone ? e.guest.fone.replace(/\D/g,"") : "";
      const waContato = foneDigits ? (foneDigits.length>=11 ? "55"+foneDigits : foneDigits) : "";
      // local/modalidade definidos pela pessoa principal (convidado só recebe a informação)
      let localHTML="";
      if(e.modalidade){
        const modTxt = e.modalidade==="presencial" ? "📍 Presencial" : "💻 Online";
        const loc = e.localReuniao ? (e.modalidade==="online"
          ? `<a href="${esc(e.localReuniao)}" target="_blank" style="color:#2F7D4F">${esc(e.localReuniao)}</a>`
          : esc(e.localReuniao)) : "";
        localHTML=`<div class="notif-local">${modTxt}${loc?" · "+loc:""}</div>`;
      }
      itens+=`<div class="notif-item" style="cursor:default;flex-wrap:wrap">
        <div class="notif-ic" style="background:#FBF0DA">${foiIndicado?'↪️':(ehConvite?'👥':'✋')}</div>
        <div class="notif-body"><div class="notif-t">${titulo}</div>
        <div class="notif-m">${sub}${e.participantes&&e.participantes.length>1?(" · 👥 "+esc(listarIntegrantes(e, e.criadoPor).join(", "))):""}</div>
        ${localHTML}</div>
        <div style="display:flex;gap:6px;width:100%;margin-top:8px">
          <button class="com-act ok" style="margin:0;flex:1" onclick="confirmarReuniao('${e.id}',true)">✓ Aceitar</button>
          <button class="com-act dev" style="margin:0;flex:1" onclick="recusarConvite('${e.id}')">✕ Recusar</button>
        </div>
        ${`<button class="com-act" style="margin:6px 0 0;width:100%;background:#EDF1F7;color:var(--navy2,#16243D);border:1px solid #C9D2E2" onclick="abrirModalSubstituto('${e.id}')">↪️ Indicar outro participante</button>`}
        ${waContato?`<a class="com-act" style="margin:6px 0 0;width:100%;background:#EAF7EE;color:#2F7D4F;border:1px solid #A9D8BB;display:block;text-align:center;text-decoration:none" href="https://wa.me/${waContato}" target="_blank">🟢 Falar com ${esc((e.guest&&e.guest.nome||"contato").split(" ")[0])} no WhatsApp</a>`:""}
        </div>`;
    });
  }
  if(ld.length){
    itens+=`<div class="notif-sec">👔 Reuniões da liderança</div>`;
    ld.forEach(e=>{
      const lider=USUARIOS[e._lider]?USUARIOS[e._lider].nome.split(" ")[0]:e._lider;
      const dataFmt=(e.date||"").split("-").reverse().join("/");
      const comQuem=e.guest?e.guest.nome:(e.title||"").replace("Reunião — ","");
      const meta = JSON.stringify({ic:'👔', texto:(lider+" · "+(comQuem||"reunião")), sub:(dataFmt+" · "+e.start+"–"+e.end), goDate:e.date}).replace(/'/g,"\\'");
      itens+=`<div class="notif-item" onclick='notifTap("${e._notifKey}", ${meta})'>
        <div class="notif-ic" style="background:#EDE7F6">👔</div>
        <div class="notif-body"><div class="notif-t">${esc(lider)} · ${esc(comQuem||"reunião")}</div>
        <div class="notif-m">${dataFmt} · ${esc(e.start)}–${esc(e.end)}${e.confirmacao==="pendente"?" · ⏳ pendente":""}</div></div>
        <button class="notif-visto" title="Marcar como visto" onclick="event.stopPropagation();marcarUmNotifVisto('${e._notifKey}')">✓</button></div>`;
    });
  }
  if(ag.length){
    itens+=`<div class="notif-sec">${ico('calendario')} Novos compromissos na sua agenda</div>`;
    ag.forEach(e=>{
      const quem=e.criadoPor&&USUARIOS[e.criadoPor]?USUARIOS[e.criadoPor].nome.split(" ")[0]:"alguém";
      const dataFmt=(e.date||"").split("-").reverse().join("/");
      const meta = JSON.stringify({ic:'📅', texto:(e.title||"Compromisso"), sub:(dataFmt+" às "+e.start+" · por "+quem), goDate:e.date}).replace(/'/g,"\\'");
      itens+=`<div class="notif-item" onclick='notifTap("${e.id}", ${meta})'>
        <div class="notif-ic" style="background:#EDF1F7">${ico('calendario')}</div>
        <div class="notif-body"><div class="notif-t">${esc(e.title||"Compromisso")}</div>
        <div class="notif-m">${dataFmt} às ${esc(e.start)} · marcado por ${esc(quem)}</div></div>
        <button class="notif-visto" title="Marcar como visto" onclick="event.stopPropagation();marcarUmNotifVisto('${e.id}')">✓</button></div>`;
    });
  }
  if(gr.length){
    itens+=`<div class="notif-sec">🎙️ Novas atas e gravações</div>`;
    gr.forEach(g=>{
      const quem=g.autor&&USUARIOS[g.autor]?USUARIOS[g.autor].nome.split(" ")[0]:"alguém";
      const dataFmt=new Date(g.ts).toLocaleDateString("pt-BR");
      const meta = JSON.stringify({ic:'🎙️', texto:(g.titulo||"Ata"), sub:(dataFmt+(g.condominio?(" · "+g.condominio):"")+" · por "+quem), goTab:"gravacoes"}).replace(/'/g,"\\'");
      itens+=`<div class="notif-item" onclick='notifTap("${g.id}", ${meta})'>
        <div class="notif-ic" style="background:#EAF7EE">🎙️</div>
        <div class="notif-body"><div class="notif-t">${esc(g.titulo||"Ata")}</div>
        <div class="notif-m">${dataFmt}${g.condominio?(" · "+ico('predio')+" "+esc(g.condominio)):""} · por ${esc(quem)}</div></div>
        <button class="notif-visto" title="Marcar como visto" onclick="event.stopPropagation();marcarUmNotifVisto('${g.id}')">✓</button></div>`;
    });
  }
  if(com.length){
    itens+=`<div class="notif-sec">📣 Comunicados aguardando você</div>`;
    com.forEach(c=>{
      itens+=`<div class="notif-item" onclick="closeModal();setTab('comunicados')">
        <div class="notif-ic" style="background:#FBF0DA">📣</div>
        <div class="notif-body"><div class="notif-t">${esc(c.titulo||"Comunicado")}</div>
        <div class="notif-m">${ico('predio')} ${esc(c.condominio||"—")} · aguardando envio</div></div></div>`;
    });
  }
  // ===== Recentes (já vistas) — para consultar mesmo depois de visualizadas =====
  const temAtivos = !!itens;
  let hist=[]; try{ hist=await _loadNotifLog(); }catch(e){}
  let histHTML="";
  if(hist.length){
    histHTML+=`<div class="notif-sec" style="opacity:.75;margin-top:6px">🕘 Recentes (já vistas)</div>`;
    hist.slice(0,15).forEach(it=>{
      const meta = JSON.stringify({goTab:it.goTab||"", goDate:it.goDate||""}).replace(/'/g,"\\'");
      const quando = it.vistoEm ? new Date(it.vistoEm).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}) : "";
      histHTML+=`<div class="notif-item notif-hist" onclick='notifHistTap(${meta ? JSON.stringify(it.goTab||"") : "\"\""}, ${JSON.stringify(it.goDate||"")})'>
        <div class="notif-ic" style="background:#EEF0F4">${it.ic||"🔔"}</div>
        <div class="notif-body"><div class="notif-t">${esc(it.texto||"")}</div>
        <div class="notif-m">${esc(it.sub||"")}${quando?` · visto ${quando}`:""}</div></div></div>`;
    });
  }
  if(!itens) itens=`<div class="dia-empty" style="margin:0">Nenhuma notificação nova. 🎉</div>`;
  itens += histHTML;
  const temVistos = temAtivos && (ag.length || gr.length || ld.length || av.length || be.length);
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:440px">
    <div class="modal-head"><h3>🔔 Notificações</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body"><div class="notif-list">${itens}</div>
      ${temVistos?`<div class="modal-foot"><button class="btn-ghost" style="flex:1" onclick="limparNotifsVistas()">✓ Marcar todos como vistos</button></div>`:""}
    </div></div></div>`;
}

async function limparNotifsVistas(){
  const ag=await notifsAgenda();
  const gr=await notifsGravacoes();
  const ld=await notifsLideranca();
  const av=await notifsAvisos();
  const be=await notifsBemEstar();
  await marcarNotifsVistas(ag.map(e=>e.id).concat(gr.map(g=>g.id)).concat(ld.map(e=>e._notifKey)).concat(av.map(a=>a.id)).concat(be.map(b=>b.id)));
  closeModal(); render();
}

async function recusarConvite(evId){
  if(!confirm("Recusar sua participação nesta reunião? Ela continua para os demais participantes.")) return;
  await confirmarReuniao(evId, false);
}

async function confirmarReuniao(evId, aceitar){
  const d=await loadEventos(state.userId); const evs=d.events||[];
  const ev=evs.find(e=>e.id===evId); if(!ev){ alert("Reunião não encontrada."); return; }
  // sou o RESPONSÁVEL (dono) só se a reunião foi marcada comigo (criadoPor) e NÃO sou um convidado
  const souConvidado = !!ev.souConvidado || ev.criadoPor!==state.userId;
  if(!aceitar){
    if(souConvidado){
      // recusa simples do convidado (a indicação de substituto é botão à parte)
      d.events=evs.filter(e=>e.id!==evId);   // libera só a minha agenda
      await saveEventos(state.userId,d);
      closeModal(); render();
      alert("Você recusou a participação. Seu horário foi liberado e a reunião continua para os demais.");
      return;
    }
    if(!confirm("Recusar esta reunião? O horário será liberado e a pessoa verá que não foi confirmada.")) return;
    ev.confirmacao="recusado";
    ev.tipo="recusado"; ev.title="(Recusada) "+(ev.title||"");
    await saveEventos(state.userId,d);
    closeModal(); render();
    alert("Reunião recusada.");
    return;
  }
  // ACEITAR
  if(souConvidado){
    // convidado apenas confirma a própria participação (sem definir modalidade)
    ev.confirmacao="aceito";
    await saveEventos(state.userId,d);
    await avisarAceite(ev, state.userId);   // avisa os demais participantes
    closeModal(); render();
    alert("Participação confirmada! A reunião está na sua agenda.");
    return;
  }
  // dono da reunião: pergunta a modalidade
  abrirModalModalidade(evId);
}

function abrirModalSubstituto(evId){
  // pessoas da Mafra que podem substituir (síndicos, BPO, Márcia, André), menos eu
  const candidatos = PESSOAS_AGENDAVEIS.filter(u=>
    u!==state.userId && (USUARIOS[u].tipo==="sindico" || BPO.includes(u) || u==="marcia" || u==="andre")
  );
  const opts = candidatos.map(u=>{
    const us=USUARIOS[u]; const ini=us.nome.split(" ").map(w=>w[0]).slice(0,2).join("");
    return `<button type="button" class="conv-person" onclick="indicarSubstituto('${evId}','${u}')">
      <span class="cp-av" style="background:${us.cor||'#16243D'}">${ini}</span>
      <span class="cp-nm">${esc(us.nome.split(" ")[0])}</span></button>`;
  }).join("");
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:440px">
    <div class="modal-head"><h3>Você não vai participar?</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">Quer indicar outra pessoa da Mafra para ir no seu lugar? Ela receberá o convite para confirmar.</p>
      <div class="field"><label style="display:block;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:8px">Indicar substituto</label>
        <div class="conv-people">${opts||'<span style="font-size:12px;color:var(--muted)">Ninguém disponível.</span>'}</div>
      </div>
      <div class="modal-foot">
        <button class="btn-cancel" style="flex:1" onclick="recusarSemSubstituto('${evId}')">Só recusar (sem substituto)</button>
      </div>
    </div></div></div>`;
}

async function recusarSemSubstituto(evId){
  const d=await loadEventos(state.userId); const evs=d.events||[];
  d.events=evs.filter(e=>e.id!==evId);   // libera só a minha agenda
  await saveEventos(state.userId,d);
  closeModal(); render();
  alert("Você recusou a participação. Seu horário foi liberado e a reunião continua para os demais.");
}

async function indicarSubstituto(evId, subId){
  // pega a minha cópia do evento
  const meu=await loadEventos(state.userId);
  const ev=(meu.events||[]).find(e=>e.id===evId);
  if(!ev){ alert("Reunião não encontrada."); closeModal(); return; }
  const eu=USUARIOS[state.userId]?USUARIOS[state.userId].nome.split(" ")[0]:"";
  const souDono = ev.guest && !ev.souConvidado; // sou a pessoa principal (com agendamento externo)
  try{
    const dsub=await loadEventos(subId); if(!dsub.events)dsub.events=[];
    if(!dsub.events.some(e=>e.gid===ev.gid)){
      const novo={...ev,
        id:"e"+Date.now()+Math.random().toString(36).slice(2,6),
        confirmacao:"pendente",
        indicadoPor: state.userId,
        obs:(ev.obs||"")+`\nIndicado por ${eu} como substituto.`
      };
      if(souDono){
        // o substituto vira a NOVA pessoa principal da reunião (mantém código e contato do externo)
        novo.donoOriginal = ev.donoOriginal || state.userId;  // guarda quem o externo agendou originalmente
        novo.criadoPor=subId;
        novo.souConvidado=false;   // ele é o novo responsável, não um mero convidado
        // atualiza o participante "equipe" principal para o substituto
        novo.participantes=(ev.participantes||[]).map(p=> (p.tipo==="equipe"&&p.id===state.userId) ? {tipo:"equipe",id:subId} : p);
      } else {
        novo.souConvidado=true;    // continua sendo um convite
      }
      dsub.events.push(novo);
      await saveEventos(subId,dsub);
    }
  }catch(e){ alert("Não consegui indicar agora. Tente novamente."); return; }
  // remove da minha agenda (eu não vou)
  meu.events=(meu.events||[]).filter(e=>e.id!==evId);
  await saveEventos(state.userId,meu);
  closeModal(); render();
  alert("Pronto! "+(USUARIOS[subId]?USUARIOS[subId].nome.split(" ")[0]:"A pessoa")+" recebeu o convite para ir no seu lugar. Se também não puder, a reunião segue com quem confirmou.");
}

function abrirModalModalidade(evId){
  const lbl='display:block;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px';
  const inp='width:100%;padding:11px 13px;border:1.5px solid var(--line);border-radius:10px;background:#FCFBF8';
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:440px">
    <div class="modal-head"><h3>✓ Confirmar reunião</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">Como será esta reunião? A pessoa verá esta informação ao acompanhar o agendamento.</p>
      <div class="field"><label style="${lbl}">Modalidade</label>
        <div class="dur-grid">
          <button type="button" class="dur-btn on" id="modOnline" onclick="selModalidade('online')">💻 Online</button>
          <button type="button" class="dur-btn" id="modPresencial" onclick="selModalidade('presencial')">${ico('local')} Presencial</button>
        </div>
      </div>
      <div class="field" id="modCampoWrap"><label style="${lbl};margin-top:12px" id="modCampoLabel">Link da reunião (Meet, Zoom…)</label>
        <input id="modCampo" style="${inp}" placeholder="https://meet.google.com/..."></div>
      <div class="modal-foot">
        <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" style="flex:1" onclick="finalizarAceite('${evId}')">Confirmar reunião</button>
      </div>
    </div></div></div>`;
  window.__modalidade="online";
}

function selModalidade(m){
  window.__modalidade=m;
  document.getElementById("modOnline").classList.toggle("on",m==="online");
  document.getElementById("modPresencial").classList.toggle("on",m==="presencial");
  document.getElementById("modCampoLabel").textContent = m==="online" ? "Link da reunião (Meet, Zoom…)" : "Endereço do local";
  const c=document.getElementById("modCampo");
  c.placeholder = m==="online" ? "https://meet.google.com/..." : "Ex.: Av. Presidente Vargas, 1234 — sala 5";
  c.value="";
}

async function finalizarAceite(evId){
  const modalidade=window.__modalidade||"online";
  const local=(document.getElementById("modCampo").value||"").trim();
  if(!local){ alert(modalidade==="online"?"Informe o link da reunião.":"Informe o endereço do local."); return; }
  const d=await loadEventos(state.userId); const ev=(d.events||[]).find(e=>e.id===evId);
  if(!ev){ alert("Reunião não encontrada."); return; }
  ev.confirmacao="aceito";
  ev.modalidade=modalidade;
  ev.localReuniao=local;
  await saveEventos(state.userId,d);
  // propaga a modalidade e o local para os convidados (eles recebem o local na notificação)
  const gid=ev.gid;
  const equipeIds=(ev.participantes||[]).filter(p=>p.tipo==="equipe"&&p.id!==state.userId).map(p=>p.id);
  for(const uid of equipeIds){
    try{
      const dd=await loadEventos(uid);
      let mudou=false;
      (dd.events||[]).forEach(x=>{
        if((x.gid&&x.gid===gid)){ x.modalidade=modalidade; x.localReuniao=local; mudou=true; }
      });
      if(mudou) await saveEventos(uid,dd);
    }catch(e){}
  }
  await avisarAceite(ev, state.userId);   // avisa os demais participantes que o responsável confirmou
  closeModal(); render();
  alert("Reunião confirmada! O "+(modalidade==="online"?"link":"endereço")+" foi enviado para os convidados e para quem solicitou.");
}


