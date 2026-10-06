/* ============================================================
   GESTÃO MAFRA — ABA COMUNICADOS
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: saveComunicados, freqLabel, marcarEnviado, devolverComunicado, comTextoFinal, whatsappLink, renderComunicados, openComunicado, usarTema, limparImg, lerImagem, sugerirTextoCom, corrigirTextoCom, saveComunicado, delComunicado */

async function saveComunicados(d){ const ok=await storeSet("mafra:comunicados",JSON.stringify(d)); if(!ok)alert("Não foi possível salvar o comunicado."); return ok; }

function freqLabel(f){ const x=FREQS.find(a=>a[0]===f); return x?x[1]:"Único"; }

async function marcarEnviado(id){
  const d=await loadComunicados(); const c=(d.list||[]).find(x=>x.id===id); if(!c)return;
  c.estado="enviado"; c.enviado=true; c.enviadoEm=Date.now(); c.enviadoPor=state.userId; c.motivoDevolucao="";
  await saveComunicados(d); render();
}

async function devolverComunicado(id){
  const motivo=prompt("Motivo da devolução (o que a pessoa precisa ajustar?):","Fora do padrão — favor revisar.");
  if(motivo===null) return; // cancelou
  const d=await loadComunicados(); const c=(d.list||[]).find(x=>x.id===id); if(!c)return;
  c.estado="devolvido"; c.enviado=false; c.motivoDevolucao=(motivo||"").trim()||"Favor revisar."; c.devolvidoEm=Date.now();
  await saveComunicados(d); render();
}

function comTextoFinal(c){
  let t="";
  if(c.titulo) t+="*"+c.titulo+"*\n\n";
  t+=(c.texto||"");
  if(c.video) t+="\n\n🎥 Vídeo: "+c.video;
  return t+ASSINATURA;
}

function whatsappLink(c){ return "https://wa.me/?text="+encodeURIComponent(comTextoFinal(c)); }

async function renderComunicados(){
  document.getElementById("view").innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando comunicados…</div>';
  const d=await loadComunicados();
  const visAll=[]; for(const c of (d.list||[])){ if(await podeVer(c)) visAll.push(c); }
  let list=visAll.slice();
  const f=state.comFiltro||{cond:"",status:""};
  if(f.cond) list=list.filter(c=>c.condominio===f.cond);
  if(f.status) list=list.filter(c=>comStatus(c).k===f.status);
  const rank={atrasado:0,hoje:1,agendado:2,rascunho:3,enviado:4};
  list.sort((a,b)=> (rank[comStatus(a).k]-rank[comStatus(b).k]) || ((a.agendaData||"")<(b.agendaData||"")?-1:1));

  const pend=visAll.filter(c=>{const s=comStatus(c).k;return s==="hoje"||s==="atrasado";}).length;
  const condOpt=`<option value="">Todos os condomínios</option>`+condOptionsAgrupadas(f.cond);
  const statusOpt=`<option value="">Todos os status</option>`+[["aguardando","Aguardando Julia"],["devolvido","Devolvidos"],["enviado","Enviados"],["rascunho","Rascunhos"]].map(([v,l])=>`<option value="${v}" ${f.status===v?"selected":""}>${l}</option>`).join("");

  const ehGestor=state.user.tipo==="gestor";
  let html=`<div class="weeknav">
    <div><h2>Comunicados${ehGestor?'':' Educativos'}</h2><div class="range">${visAll.length} comunicado(s)${ehGestor?' · enviados pela Julia':' · responsável: '+USUARIOS[COM_RESPONSAVEL].nome.split(" ")[0]}</div></div>
    <div class="spacer"></div>
    <button class="btn-gold" onclick="openComunicado(null)">＋ Novo comunicado</button>
  </div>`;
  if(ehGestor) html+=`<div class="com-alert" style="background:#EDF1F7;border-color:#C9D2E2;color:var(--navy2)">📣 Crie aqui seu comunicado. Ele vai para a Julia (Comunicação), que envia nos grupos do seu condomínio.</div>`;
  if(pend && !ehGestor) html+=`<div class="com-alert">🔔 ${pend} comunicado(s) aguardando envio pela Julia.</div>`;
  html+=`<div class="gv-filtros">
    <select class="hoje-date" style="min-width:180px" onchange="state.comFiltro={...(state.comFiltro||{}),cond:this.value};render()">${condOpt}</select>
    <select class="hoje-date" onchange="state.comFiltro={...(state.comFiltro||{}),status:this.value};render()">${statusOpt}</select>
    ${(f.cond||f.status)?`<button class="btn-ghost" onclick="state.comFiltro={cond:'',status:''};render()">Limpar</button>`:""}
  </div><div class="lista-wrap">`;
  if(list.length===0) html+=`<div class="dia-empty">Nenhum comunicado. Crie o primeiro!</div>`;
  list.forEach(c=>{
    const s=comStatus(c);
    const quando = c.agendaData ? c.agendaData.split("-").reverse().join("/")+(c.agendaHora?(" "+c.agendaHora):"") : "sem agendamento";
    const podeAprovar = (state.userId==="julia" || state.user.tipo==="master");
    const enviadoInfo = (s.k==="enviado" && c.enviadoEm) ? `<div class="com-enviado">✓ Enviado em ${new Date(c.enviadoEm).toLocaleDateString("pt-BR")} ${("0"+new Date(c.enviadoEm).getHours()).slice(-2)}:${("0"+new Date(c.enviadoEm).getMinutes()).slice(-2)}${c.enviadoPor&&USUARIOS[c.enviadoPor]?(" por "+USUARIOS[c.enviadoPor].nome.split(" ")[0]):""}</div>` : "";
    const devolvidoInfo = (s.k==="devolvido" && c.motivoDevolucao) ? `<div class="com-devolvido">↩️ Devolvido: ${esc(c.motivoDevolucao)}</div>` : "";
    let acoes="";
    if(podeAprovar && s.k!=="enviado"){
      acoes=`<button class="com-act ok" onclick="event.stopPropagation();marcarEnviado('${c.id}')" title="Marcar como enviado">✓ Enviado</button>
             <button class="com-act dev" onclick="event.stopPropagation();devolverComunicado('${c.id}')" title="Devolver para refazer">↩️ Devolver</button>`;
    }
    html+=`<div class="com-card" onclick="openComunicado('${c.id}')">
      ${c.imagem?`<div class="com-thumb" style="background-image:url('${c.imagem}')"></div>`:`<div class="com-thumb noimg">📣</div>`}
      <div class="com-body">
        <div class="com-tit">${esc(c.titulo||"(sem título)")} <span class="com-badge st-${s.k}">${s.l}</span></div>
        <div class="com-meta">${ico('predio')} ${esc(c.condominio||"—")} · 🔁 ${freqLabel(c.freq)} · ${ico('calendario')} ${quando}</div>
        <div class="com-prev">${esc((c.texto||"").slice(0,120))}${(c.texto||"").length>120?"…":""}</div>
        ${enviadoInfo}${devolvidoInfo}
      </div>
      <div class="com-side" onclick="event.stopPropagation()">
        <a class="wa-mini" href="${whatsappLink(c)}" target="_blank" title="Enviar no WhatsApp">🟢</a>
        ${acoes}
      </div>
    </div>`;
  });
  html+=`</div>`;
  document.getElementById("view").innerHTML=html;
}

async function openComunicado(id){
  let c=null;
  if(id){ const d=await loadComunicados(); c=(d.list||[]).find(x=>x.id===id); }
  const ehGestor=state.user.tipo==="gestor";
  const condGestor=ehGestor?(state.user.condominio||""):"";
  const e=c||{titulo:"",condominio:condGestor,freq:"unico",texto:"",imagem:"",video:"",agendaData:"",agendaHora:"09:00",enviado:false};
  const condSel=`<option value="" ${!e.condominio?"selected":""} disabled>Selecione…</option>`+CONDOMINIOS.map(x=>`<option ${x===e.condominio?"selected":""}>${x}</option>`).join("");
  const freqBtns=FREQS.map(([v,l])=>`<label><input type="radio" name="cFreq" value="${v}" ${e.freq===v?"checked":""}><span>${l}</span></label>`).join("");
  const temas=TEMAS_SUGERIDOS.map(t=>`<button type="button" class="tema-chip" onclick="usarTema(this)">${t}</button>`).join("");
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>📣 ${id?"Editar comunicado":"Novo comunicado educativo"}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="field"><label>Título do comunicado</label><input id="cTitulo" value="${esc(e.titulo)}" placeholder="Ex.: Convivência: horário de silêncio"></div>
      <div class="field"><label>Sugestões de temas (clique para usar como título)</label><div class="temas-wrap">${temas}</div></div>
      <div class="field"><label>Condomínio</label><select id="cCond">${condSel}</select></div>
      <div class="field"><label>Frequência de envio</label><div class="seg seg-wrap">${freqBtns}</div></div>
      <div class="field"><label>Texto do comunicado</label><textarea id="cTexto" style="min-height:120px" placeholder="Escreva a mensagem educativa…">${esc(e.texto)}</textarea>
        <div class="ia-btns">
          <button type="button" class="ata-trigger" onclick="sugerirTextoCom()">✨ Sugerir texto</button>
          <button type="button" class="ata-trigger corrigir" onclick="corrigirTextoCom()">📝 Corrigir o que escrevi</button>
        </div>
      </div>
      <div class="field"><label>Imagem (opcional)</label>
        <div id="cImgPreview">${e.imagem?`<img class="com-img-prev" src="${e.imagem}"><button type="button" class="btn-ghost" onclick="limparImg()">Remover imagem</button>`:""}</div>
        <input id="cImgFile" type="file" accept="image/*" onchange="lerImagem(this)" ${e.imagem?'style="display:none"':''}>
      </div>
      <div class="field"><label>Vídeo (link YouTube/Drive · opcional)</label><input id="cVideo" value="${esc(e.video)}" placeholder="https://..."></div>
      <div class="row2">
        <div class="field"><label>Agendar para o dia</label><input id="cData" type="date" value="${e.agendaData}"></div>
        <div class="field"><label>Hora (lembrete)</label><input id="cHora" type="time" value="${e.agendaHora||'09:00'}"></div>
      </div>
      ${(c && comStatus(c).k==="devolvido" && c.motivoDevolucao)?`<div class="com-alert" style="background:#FDECEA;border-color:#F0B7AE;color:#B0392B">↩️ <b>Devolvido para refazer:</b> ${esc(c.motivoDevolucao)}<br>Ajuste o texto e salve para reenviar à Julia.</div>`:""}
      ${(c && comStatus(c).k==="enviado")?`<div class="com-alert" style="background:#EAF7EE;border-color:#A9D8BB;color:#2F7D4F">✓ Este comunicado já foi marcado como <b>enviado</b>.</div>`:""}
      <div class="assinatura-box">Assinatura automática:<br><i>Síndico Profissional</i><br><b>Mafra Gestão Integrada</b></div>
      <div class="modal-foot">
        ${id?`<button class="btn-del" onclick="delComunicado('${id}')">Excluir</button>`:`<button class="btn-cancel" onclick="closeModal()">Cancelar</button>`}
        <button class="btn-primary" style="flex:1" onclick="saveComunicado('${id||""}')">Salvar</button>
      </div>
      <a class="wa-btn" href="${whatsappLink(e)}" target="_blank">🟢 Enviar no WhatsApp (texto pronto)</a>
    </div></div></div>`;
  window.__comImg=e.imagem||"";
}

function usarTema(btn){ const t=document.getElementById("cTitulo"); if(t) t.value=btn.textContent; }

function limparImg(){ window.__comImg=""; document.getElementById("cImgPreview").innerHTML=""; const f=document.getElementById("cImgFile"); if(f){f.style.display="";f.value="";} }

function lerImagem(input){
  const file=input.files&&input.files[0]; if(!file) return;
  if(file.size>1.6*1024*1024){ alert("Imagem muito grande (máx ~1,5 MB). Escolha uma menor ou use link de vídeo."); input.value=""; return; }
  const r=new FileReader();
  r.onload=()=>{ window.__comImg=r.result;
    document.getElementById("cImgPreview").innerHTML=`<img class="com-img-prev" src="${r.result}"><button type="button" class="btn-ghost" onclick="limparImg()">Remover imagem</button>`;
    input.style.display="none"; };
  r.readAsDataURL(file);
}

async function sugerirTextoCom(){
  const titulo=document.getElementById("cTitulo").value.trim();
  const cond=document.getElementById("cCond").value;
  if(!titulo){ alert("Escreva ou escolha um título primeiro."); return; }
  const ta=document.getElementById("cTexto"); const btn=event&&event.target;
  if(btn){ btn.disabled=true; btn.textContent="Gerando…"; }
  const prompt=`${PADRAO_MAFRA}

Agora escreva um comunicado sobre "${titulo}"${cond?(' para o condomínio "'+cond+'" (use esse nome na primeira linha em negrito)'):''}, seguindo EXATAMENTE o padrão Mafra acima.
Responda apenas com o texto do comunicado, sem a assinatura.`;
  try{
    const txt=await chamarIA(prompt, 500);
    if(txt) ta.value=txt.trim();
  }catch(err){ alert("Não consegui gerar o texto agora. ("+err.message+")"); }
  if(btn){ btn.disabled=false; btn.textContent="✨ Sugerir texto"; }
}

async function corrigirTextoCom(){
  const ta=document.getElementById("cTexto"); const original=(ta?ta.value:"").trim();
  if(!original){ alert("Escreva o texto primeiro para eu corrigir."); return; }
  const btn=event&&event.target;
  if(btn){ btn.disabled=true; btn.textContent="Corrigindo…"; }
  const prompt=`Corrija APENAS ortografia, gramática, pontuação e clareza do texto abaixo, em português do Brasil.
REGRAS IMPORTANTES:
- NÃO reescreva nem mude o estilo. NÃO deixe mais longo. Mantenha o mesmo tamanho e a mesma estrutura.
- PRESERVE exatamente os *negritos* (asteriscos), os emojis e as quebras de linha do original.
- NÃO adicione saudações, assinatura ou texto novo. Apenas corrija o que já existe.
- Responda somente com o texto corrigido, sem comentários.

Texto:
"""${original}"""`;
  try{
    const txt=await chamarIA(prompt, 800);
    if(txt) ta.value=txt.trim();
  }catch(err){ alert("Não consegui corrigir agora. ("+err.message+")"); }
  if(btn){ btn.disabled=false; btn.textContent="📝 Corrigir o que escrevi"; }
}

async function saveComunicado(id){
  const titulo=document.getElementById("cTitulo").value.trim();
  const condominio=document.getElementById("cCond").value;
  const freq=(document.querySelector('input[name="cFreq"]:checked')||{}).value||"unico";
  const texto=document.getElementById("cTexto").value.trim();
  const video=document.getElementById("cVideo").value.trim();
  const agendaData=document.getElementById("cData").value;
  const agendaHora=document.getElementById("cHora").value;
  const imagem=window.__comImg||"";
  if(!titulo){alert("Dê um título ao comunicado.");return;}
  if(!texto){alert("Escreva o texto do comunicado.");return;}
  const ehAprovador=(state.userId==="julia"||state.user.tipo==="master");
  const d=await loadComunicados(); if(!d.list)d.list=[];
  if(id){
    const c=d.list.find(x=>x.id===id);
    if(c){
      Object.assign(c,{titulo,condominio,freq,texto,video,imagem,agendaData,agendaHora});
      // se estava devolvido e quem edita NÃO é a Julia/master, volta para "aguardando"
      if(c.estado==="devolvido" && !ehAprovador){ c.estado="aguardando"; c.motivoDevolucao=""; }
    }
  }
  else { d.list.push({id:"c"+Date.now()+Math.random().toString(36).slice(2,6),titulo,condominio,freq,texto,video,imagem,agendaData,agendaHora,estado:"aguardando",autor:state.userId,ts:Date.now()}); }
  await saveComunicados(d); closeModal(); render();
}

async function delComunicado(id){
  if(!confirm("Excluir este comunicado?"))return;
  const d=await loadComunicados(); d.list=(d.list||[]).filter(x=>x.id!==id); await saveComunicados(d);
  closeModal(); render();
}


