/* ============================================================
   GESTÃO MAFRA — MODULO CHECKIN
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: ckAssistente, _ckFecharVencidos24h, _ckLocalizarAgora, _ckCandidatosPerto, _ckOferecerCheckin, _ckConfirmarAuto, _ckLembrarCheckout, _ckAdiar, _apoioTxt, mapaLinkCheckin, _atualizarCachesMapa, saveCheckins, distMetros, abrirCheckin, capturarLocalCheckin, confirmarCheckin, abrirCheckout, confirmarCheckout, checkoutForcado, feriasHojeMap, _feriasSubTxt, _painelLocalHTML, _painelHelpCondoHTML, renderPainelLocalizacao */

function _apoioTxt(ck){ return (ck && ck.apoiaSindico && USUARIOS[ck.apoiaSindico]) ? ` · apoiando ${esc(USUARIOS[ck.apoiaSindico].nome.split(" ")[0])}` : ""; }

function mapaLinkCheckin(ck){
  if(!ck) return "";
  // 1) Se tem GPS capturado, usa coordenada direta (mais preciso)
  if(ck.geo && ck.geo.lat!=null) return "https://www.google.com/maps?q="+ck.geo.lat+","+ck.geo.lng;
  // 2) Tratamento por tipo interno
  if(ck.interno==="escritorio"){
    // Tenta usar calibração salva do escritório (se já calibrado)
    try{
      const cfg = (window.__geoCache && window.__geoCache["__escritorio__"]);
      if(cfg && cfg.lat!=null) return "https://www.google.com/maps?q="+cfg.lat+","+cfg.lng;
    }catch(e){}
    // Senão, busca endereço cadastrado (override ou COND_ENDERECOS)
    try{
      const ov = (window.__endOvCache && window.__endOvCache["__escritorio__"]);
      const end = ov || COND_ENDERECOS["Mafra Gestão Integrada"];
      if(end) return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(end);
    }catch(e){}
    return "";
  }
  if(ck.interno==="home"){
    // Home Office: não temos endereço da casa da pessoa — sem link de mapa
    return "";
  }
  if(ck.interno==="externo"){
    // Visita externa: tenta buscar pelo nome no Google Maps direto
    if(ck.condominio) return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(ck.condominio+" Ribeirão Preto");
    return "";
  }
  // 3) Check-in em condomínio normal (sem GPS)
  // Prioridade: override de endereço → endereço base → nome do condomínio
  try{
    const ov = (window.__endOvCache && window.__endOvCache[ck.condominio]);
    if(ov) return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(ov);
  }catch(e){}
  const end = COND_ENDERECOS[ck.condominio];
  if(end) return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(end);
  if(ck.condominio) return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(ck.condominio+" Ribeirão Preto");
  return "";
}

async function _atualizarCachesMapa(){
  try{ window.__geoCache = await loadCondGeo(); }catch(e){ window.__geoCache = {}; }
  try{ window.__endOvCache = await loadCondEnderecosOverride(); }catch(e){ window.__endOvCache = {}; }
}

async function saveCheckins(d){ return await storeSet("mafra:checkins", JSON.stringify(d)); }

function distMetros(lat1,lng1,lat2,lng2){
  const R=6371000, toRad=d=>d*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLng=toRad(lng2-lng1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return 2*R*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function abrirCheckin(){
  window._chGeo=null;
  const condOpts=condOptionsAgrupadas();
  const inp='width:100%;padding:11px 13px;border:1.5px solid var(--line);border-radius:10px;background:#FCFBF8;font-size:16px';
  const lbl='display:block;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px';
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:430px">
    <div class="modal-head"><h3>${ico('local')} Check-in</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">Registre onde você está agora — condomínio, escritório, home office ou visita externa.</p>
      <div class="field"><label style="${lbl}">Onde você está</label>
        <select id="chCond" style="${inp}" onchange="(function(v){var b=document.getElementById('chExternoBox'); if(b) b.style.display=(v==='__externo__'?'block':'none'); if(v==='__externo__') setTimeout(function(){var e=document.getElementById('chExternoLocal'); if(e) e.focus();},50);})(this.value)">
          <option value="">— Escolha —</option>
          <optgroup label="Trabalho fora dos condomínios">
            <option value="__escritorio__">🏢 Escritório Mafra</option>
            <option value="__home__">🏠 Home Office</option>
            <option value="__externo__">🚗 Visita externa</option>
          </optgroup>
          <optgroup label="Condomínios">${condOpts}</optgroup>
        </select></div>
      <div class="field" id="chExternoBox" style="display:none">
        <label style="${lbl}">Onde / o quê</label>
        <input id="chExternoLocal" type="text" placeholder="Ex.: Reunião no cliente XYZ, cartório, banco…" style="${inp}">
      </div>
      <div class="field"><label style="${lbl}">Observação (opcional)</label>
        <input id="chObs" type="text" placeholder="Ex: vistoria, reunião, manutenção…" style="${inp}"></div>
      <div class="field" style="margin-bottom:6px">
        <button type="button" class="btn-ghost" style="width:100%" onclick="capturarLocalCheckin()">📡 Usar minha localização (GPS)</button>
        <div id="chGeoStatus" style="font-size:12px;color:var(--muted);margin-top:7px;text-align:center">A localização do aparelho ajuda a confirmar onde você está.</div>
      </div>
      <div class="modal-foot"><button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" style="flex:1" onclick="confirmarCheckin()">${ico('local')} Fazer check-in</button></div>
    </div></div></div>`;
  // tenta capturar a localização logo ao abrir (o usuário ainda confirma o check-in)
  setTimeout(capturarLocalCheckin, 250);
}

function _chPararWatch(){
  if(window._chWatchId!=null){ try{navigator.geolocation.clearWatch(window._chWatchId);}catch(e){} window._chWatchId=null; }
  if(window._chWatchTimer){ clearTimeout(window._chWatchTimer); window._chWatchTimer=null; }
}

function capturarLocalCheckin(){
  const st=document.getElementById("chGeoStatus"); if(!st) return;
  if(!navigator.geolocation){ st.textContent="GPS não disponível neste aparelho."; return; }
  st.textContent="📡 Obtendo localização…"; st.style.color="var(--muted)";
  _chPararWatch();
  let melhor=null;
  const aplica=(p)=>{
    const g={lat:+p.coords.latitude.toFixed(6),lng:+p.coords.longitude.toFixed(6),acc:Math.round(p.coords.accuracy||0),ts:Date.now()};
    if(!melhor || (g.acc && melhor.acc && g.acc<melhor.acc) || !melhor.acc) melhor=g;
    window._chGeo=melhor;
    const s=document.getElementById("chGeoStatus");
    if(s){ s.innerHTML="✓ Localização capturada"+(melhor.acc?` (±${melhor.acc}m)`:"")+((melhor.acc||0)>40?" · melhorando o sinal…":""); s.style.color="#2F9E44"; }
  };
  const encerra=()=>{
    _chPararWatch();
    const s=document.getElementById("chGeoStatus");
    if(s && melhor) s.innerHTML="✓ Localização capturada"+(melhor.acc?` (±${melhor.acc}m)`:"");
  };
  try{
    // fica ouvindo o GPS por até 12s e guarda a leitura mais precisa
    // (a primeira leitura do aparelho costuma ser a pior — vinda de cache, wi-fi ou torre)
    window._chWatchId=navigator.geolocation.watchPosition(
      p=>{ aplica(p); if(melhor && melhor.acc && melhor.acc<=25) encerra(); },
      e=>{ if(!melhor){ window._chGeo=null; const s=document.getElementById("chGeoStatus");
        if(s){ s.textContent=(e&&e.code===1)?"Permissão de localização negada — libere o GPS para o app nas configurações do aparelho.":"Não foi possível obter a localização. Confira se o GPS está ligado e toque de novo em \"📡 Usar minha localização\"."; s.style.color="#B0392B"; } } },
      {enableHighAccuracy:true,timeout:15000,maximumAge:0}
    );
    window._chWatchTimer=setTimeout(encerra,12000);
  }catch(e){
    navigator.geolocation.getCurrentPosition(p=>aplica(p),()=>{},{enableHighAccuracy:true,timeout:10000,maximumAge:0});
  }
}

// uma leitura nova agora, sem cache — usada como segunda chance na hora de confirmar
function _chPosFresca(timeoutMs){
  return new Promise(res=>{
    if(!navigator.geolocation) return res(null);
    try{
      navigator.geolocation.getCurrentPosition(
        p=>res({lat:+p.coords.latitude.toFixed(6),lng:+p.coords.longitude.toFixed(6),acc:Math.round(p.coords.accuracy||0),ts:Date.now()}),
        ()=>res(null),
        {enableHighAccuracy:true,timeout:timeoutMs||12000,maximumAge:0}
      );
    }catch(e){ res(null); }
  });
}

async function confirmarCheckin(){
  const sel=document.getElementById("chCond").value;
  const obs=(document.getElementById("chObs").value||"").trim();
  // valores especiais: trabalho fora dos condomínios (não passam por geofence)
  let interno=""; let cond="";
  if(sel==="__escritorio__"){ interno="escritorio"; cond="Escritório Mafra"; }
  else if(sel==="__home__"){ interno="home"; cond="Home Office"; }
  else if(sel==="__externo__"){
    interno="externo";
    cond=(document.getElementById("chExternoLocal").value||"").trim();
    if(!cond){ alert("Diga onde é a visita externa (ex.: cliente XYZ, cartório, banco)."); return; }
  }
  else { cond = sel; }
  if(!cond){ alert("Escolha onde você está."); return; }
  // se estiver de férias hoje, avisa (pode estar tentando registrar no dia errado)
  try{ const fer=await infoFeriasHoje(state.userId);
    if(fer && !confirm("Você consta de férias hoje no calendário. Deseja registrar o check-in mesmo assim?")) return;
  }catch(e){}

  // === GEOFENCE: valida se a localização atual bate com o endereço do condomínio ===
  // (só se aplica a check-ins em condomínio — Visita externa ignora)
  if(!interno){
    // 1) GPS obrigatório
    if(!window._chGeo || window._chGeo.lat==null){
      alert("📡 Localização não captada.\n\nPara fazer check-in num condomínio é preciso liberar o GPS. Clique em \"📡 Usar minha localização\" e aguarde \"✓ Localização capturada\" antes de confirmar o check-in.");
      return;
    }
    const geos=await loadCondGeo();
    const cfg=geos[cond];
    // 2) Condomínio sem endereço calibrado → bloqueia (calibração só pelo Master, em Gerenciar)
    if(!cfg || cfg.lat==null || cfg.lng==null){
      alert(`⛔ "${cond}" ainda não tem endereço calibrado no sistema.\n\nO check-in não pode ser feito até que a diretoria (Márcia, André ou Bianca) calibre o endereço deste condomínio em "Gerenciar > Endereços dos condomínios".\n\nPor favor, avise a diretoria.`);
      return;
    }
    // 3) Valida a distância com tolerância pela precisão do GPS e, antes de negar,
    //    recaptura uma posição fresca — GPS de celular oscila e a leitura pode estar velha.
    const raio=cfg.raio||CHECKIN_RAIO_M;
    const avalia=(g)=>{
      const dist=distMetros(g.lat,g.lng,cfg.lat,cfg.lng);
      const margem=Math.min(g.acc||0,120); // desconta a imprecisão informada pelo aparelho (teto de 120 m)
      return {dist, ok: dist<=raio+margem, confiavel:(g.acc||0)<=400};
    };
    let g=window._chGeo, r=avalia(g);
    const posVelha=!g.ts || (Date.now()-g.ts)>45000;
    if(!r.ok || !r.confiavel || posVelha){
      _chPararWatch();
      const st=document.getElementById("chGeoStatus");
      if(st){ st.textContent="📡 Confirmando sua posição…"; st.style.color="var(--muted)"; }
      const g2=await _chPosFresca(12000);
      if(g2){
        const r2=avalia(g2);
        if(r2.ok || r2.dist<r.dist){ g=g2; r=r2; window._chGeo=g2; }
      }
      if(st && window._chGeo){ st.innerHTML="✓ Localização capturada"+(window._chGeo.acc?` (±${window._chGeo.acc}m)`:""); st.style.color="#2F9E44"; }
    }
    if(!r.ok){
      alert(`⛔ Endereço NÃO compatível com a sua localização.\n\nVocê está a ${Math.round(r.dist)} m de "${cond}" (raio permitido: ${raio} m${g.acc?` · precisão do GPS: ±${g.acc} m`:""}).\n\nSe você ESTÁ no local: vá para um ponto mais aberto (perto da portaria ou da rua), espere uns segundos, toque em "📡 Usar minha localização" e confirme de novo.\nSe o compromisso é fora dos condomínios, use a opção 🚗 Visita externa.`);
      return;
    }
  }

  const d=await loadCheckins(); if(!d.registros) d.registros=[];
  // se já tem um ativo, fecha automaticamente
  const ativo=checkinAtivoDe(state.userId, d.registros);
  if(ativo){ ativo.checkOut=Date.now(); ativo.checkOutAuto=true; }
  const reg={id:"ck"+Date.now()+Math.random().toString(36).slice(2,5),uid:state.userId,condominio:cond,checkIn:Date.now(),obs};
  if(interno) reg.interno=interno;
  // GPS faz sentido para condomínio e visita externa (rastrear onde a pessoa estava). Não para escritório/home.
  const captaGps = !interno || interno==="externo";
  if(captaGps && window._chGeo && window._chGeo.lat!=null) reg.geo=window._chGeo;
  const meu=USUARIOS[state.userId]||{};
  if(meu.apoiaSindico && !interno) reg.apoiaSindico=meu.apoiaSindico;
  d.registros.push(reg);
  await saveCheckins(d);
  _chPararWatch();
  window._chGeo=null;
  closeModal();
  renderPainelLocalizacao();
}

async function abrirCheckout(){
  const d=await loadCheckins();
  const ativo=checkinAtivoDe(state.userId, d.registros);
  if(!ativo){ alert("Você não está com check-in ativo."); return; }
  const inp='width:100%;padding:11px 13px;border:1.5px solid var(--line);border-radius:10px;background:#FCFBF8;font-size:16px';
  const lbl='display:block;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px';
  const dt=new Date(ativo.checkIn).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:420px">
    <div class="modal-head"><h3>${ico('local')} Check-out</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">Saindo de <strong>${esc(ativo.condominio)}</strong> · entrada às ${dt}.</p>
      <div class="field"><label style="${lbl}">O que foi feito? (opcional)</label>
        <textarea id="chSaida" rows="3" placeholder="Resumo da visita, problemas resolvidos, etc." style="${inp};resize:vertical"></textarea></div>
      <div class="modal-foot"><button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" style="flex:1" onclick="confirmarCheckout('${ativo.id}')">✓ Fazer check-out</button></div>
    </div></div></div>`;
}

async function confirmarCheckout(id){
  const saida=(document.getElementById("chSaida").value||"").trim();
  const d=await loadCheckins();
  const r=(d.registros||[]).find(x=>x.id===id);
  if(r){ r.checkOut=Date.now(); if(saida) r.resumoSaida=saida; }
  await saveCheckins(d);
  closeModal();
  renderPainelLocalizacao();
}

async function checkoutForcado(uid){
  if(state.userId!=="bianca") return;
  const u=USUARIOS[uid]; const nome=u?u.nome.split(" ")[0]:uid;
  const d=await loadCheckins();
  const ativo=checkinAtivoDe(uid, d.registros||[]);
  if(!ativo){ alert(nome+" não está com check-in aberto."); renderPainelLocalizacao(); return; }
  if(!confirm(`Dar check-out por ${nome}?\n\nIsso encerra o check-in que ${nome} deixou em aberto em "${ativo.condominio||"local não informado"}".`)) return;
  ativo.checkOut=Date.now();
  ativo.checkOutPor="bianca";          // registra que foi a Bianca quem encerrou
  ativo.resumoSaida=(ativo.resumoSaida?ativo.resumoSaida+" · ":"")+"Check-out registrado pela coordenação (esquecimento).";
  await saveCheckins(d);
  renderPainelLocalizacao();
}

async function feriasHojeMap(ids){
  const out={};
  for(const uid of ids){ const info=await infoFeriasHoje(uid); if(info) out[uid]=info; }
  return out;
}

function _feriasSubTxt(info){
  if(!info) return "";
  const fim=info.fim?info.fim.split("-").reverse().join("/"):"";
  return `Férias${fim?` até ${fim}`:""}${info.obs?` · ${esc(info.obs)}`:""}`;
}

function _painelLocalHTML(titulo, ids, regs, feriasMap){
  feriasMap=feriasMap||{};
  const emFerias=ids.filter(uid=>feriasMap[uid]).map(uid=>({uid,info:feriasMap[uid],us:USUARIOS[uid]}));
  const restantes=ids.filter(uid=>!feriasMap[uid]);
  const comCk=restantes.filter(uid=>checkinAtivoDe(uid,regs)).map(uid=>({uid,ck:checkinAtivoDe(uid,regs),us:USUARIOS[uid]}));
  const semCk=restantes.filter(uid=>!checkinAtivoDe(uid,regs)).map(uid=>({uid,us:USUARIOS[uid]}));
  let h=`<div class="loc-painel">
    <div class="loc-painel-h"><h3 style="margin:0">${titulo}</h3>
      <div class="atend-range">${comCk.length} em campo${emFerias.length?` · ${emFerias.length} de férias`:""}</div></div>`;
  if(!ids.length){
    h+=`<div class="atend-hint" style="margin:0">Nenhuma pessoa cadastrada nesta equipe.</div></div>`;
    return h;
  }
  h+=`<div class="loc-lista">`;
  comCk.forEach(({uid,ck,us})=>{
    const ini=(us?.nome||"?").split(" ").map(w=>w[0]).slice(0,2).join("");
    const hora=new Date(ck.checkIn).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
    const mlink=mapaLinkCheckin(ck);
    const ic = ck.interno==="home" ? "🏠" : (ck.interno==="escritorio" ? "🏢" : (ck.interno==="externo" ? "🚗" : "📍"));
    const podeFco = state.userId==="bianca" && uid!=="bianca";
    h+=`<div class="loc-pessoa loc-on">
      <span class="loc-av" style="${_avStyle(uid, us?.cor)}">${_avInner(uid, ini)}<span class="loc-dot" title="Em campo agora"></span></span>
      <div class="loc-pessoa-body">
        <div class="loc-pessoa-nm">${esc(us?.nome||uid)}</div>
        <div class="loc-pessoa-sub">${ic} ${esc(ck.condominio)} · desde ${hora}${ck.geo?" · 📡":""}${_apoioTxt(ck)}${ck.obs?` · ${esc(ck.obs)}`:""}${mlink?` · <a href="${mlink}" target="_blank" class="loc-maplink">ver no mapa</a>`:""}</div>
      </div>
      ${podeFco?`<button class="loc-fco" title="Dar check-out por ${esc((us?.nome||uid).split(' ')[0])}" onclick="checkoutForcado('${uid}')">Check-out</button>`:""}
    </div>`;
  });
  emFerias.forEach(({uid,info,us})=>{
    const ini=(us?.nome||"?").split(" ").map(w=>w[0]).slice(0,2).join("");
    h+=`<div class="loc-pessoa loc-ferias">
      <span class="loc-av loc-av-ferias" style="${_avStyle(uid, us?.cor)}">${_avInner(uid, ini)}</span>
      <div class="loc-pessoa-body">
        <div class="loc-pessoa-nm">${esc(us?.nome||uid)} <span class="ferias-badge">🏖️ Férias</span></div>
        <div class="loc-pessoa-sub">${_feriasSubTxt(info)}</div>
      </div>
    </div>`;
  });
  semCk.forEach(({uid,us})=>{
    const ini=(us?.nome||"?").split(" ").map(w=>w[0]).slice(0,2).join("");
    h+=`<div class="loc-pessoa loc-off">
      <span class="loc-av" style="${_avStyle(uid, us?.cor, 'opacity:.45')}">${_avInner(uid, ini)}</span>
      <div class="loc-pessoa-body">
        <div class="loc-pessoa-nm">${esc(us?.nome||uid)}</div>
        <div class="loc-pessoa-sub">Sem check-in no momento</div>
      </div>
    </div>`;
  });
  h+=`</div></div>`;
  return h;
}

function _painelHelpCondoHTML(estados, ehHD){
  const ativos=estados.filter(p=>p.estado==="atendendo" && !p.ferias).length;
  const emFer=estados.filter(p=>p.ferias).length;
  let h=`<div class="loc-painel">
    <div class="loc-painel-h">
      <h3 style="margin:0">${icoH('local')} Onde a Equipe Help Condo está…</h3>
      <div class="atend-range">${ativos} em campo · ${estados.length} na equipe${emFer?` · ${emFer} de férias`:""}</div>
      <div class="spacer"></div>
      <button class="btn-gold" onclick="abrirNovoChamado()">＋ Chamado</button>
    </div>`;
  if(!estados.length){ h+=`<div class="atend-hint" style="margin:0">Nenhuma pessoa de Help Condo cadastrada.</div></div>`; return h; }
  const ordem={atendendo:0,disponivel:1,travado:2};
  h+=`<div class="loc-lista">`;
  estados.slice().sort((a,b)=>{
    if(a.ferias && !b.ferias) return 1; if(!a.ferias && b.ferias) return -1;
    return (ordem[a.estado]??9)-(ordem[b.estado]??9);
  }).forEach(p=>{
    const us=p.us||{}; const ini=(us.nome||"?").split(" ").map(w=>w[0]).slice(0,2).join("");
    if(p.ferias){
      h+=`<div class="loc-pessoa loc-ferias">
        <span class="loc-av loc-av-ferias" style="${_avStyle(p.uid, us.cor)}">${_avInner(p.uid, ini)}</span>
        <div class="loc-pessoa-body">
          <div class="loc-pessoa-nm">${esc(us.nome||p.uid)} <span class="ferias-badge">🏖️ Férias</span></div>
          <div class="loc-pessoa-sub">${_feriasSubTxt(p.ferias)}</div>
        </div>
      </div>`;
      return;
    }
    let badge, sub, acoes="", off="";
    if(p.estado==="atendendo"){
      const hora=new Date(p.ck.checkIn).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
      const mlink=mapaLinkCheckin(p.ck);
      const ic = p.ck.interno==="home" ? "🏠" : (p.ck.interno==="escritorio" ? "🏢" : (p.ck.interno==="externo" ? "🚗" : "📍"));
      badge=`<span class="hde-badge hde-at">${p.ck.interno==="home"?"🏠 Home office":(p.ck.interno==="escritorio"?"🏢 No escritório":(p.ck.interno==="externo"?"🚗 Visita externa":"📍 Em campo"))}</span>`;
      sub=`${ic} ${esc(p.ck.condominio)} · desde ${hora}${p.ck.geo?" · 📡":""}${p.ck.obs?` · ${esc(p.ck.obs)}`:""}${mlink?` · <a href="${mlink}" target="_blank" class="loc-maplink">ver no mapa</a>`:""}`;
      acoes=`<span class="loc-pulso" title="${p.ck.interno?"Trabalhando":"Em campo"}"></span>`;
    } else if(p.estado==="travado"){
      const lib=p.bloqueio&&p.bloqueio.expiraEm?` · libera às ${new Date(p.bloqueio.expiraEm).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}`:"";
      badge=`<span class="hde-badge hde-tr">🔒 Tarefa interna</span>`;
      sub=`${p.bloqueio&&p.bloqueio.motivo?esc(p.bloqueio.motivo):"Indisponível agora"}${lib}`;
      off="loc-off";
    } else {
      badge=`<span class="hde-badge hde-dp">✅ Disponível</span>`;
      sub="Pronta(o) para receber chamados · sem check-in";
    }
    if(ehHD && p.uid===state.userId){
      acoes = p.estado==="travado"
        ? `<button class="hde-btn-mini" onclick="destravarAgendaHd()" title="Voltar a receber chamados">▶ Voltar</button>`
        : `<button class="hde-btn-mini" onclick="travarAgendaHd()" title="Bloquear sua agenda">🔒 Travar</button>`;
    }
    h+=`<div class="loc-pessoa ${off}">
      <span class="loc-av" style="${_avStyle(p.uid, us.cor)}">${_avInner(p.uid, ini)}</span>
      <div class="loc-pessoa-body">
        <div class="loc-pessoa-nm">${esc(us.nome||p.uid)} ${badge}</div>
        <div class="loc-pessoa-sub">${sub}</div>
      </div>
      ${acoes}
    </div>`;
  });
  h+=`</div></div>`;
  return h;
}

async function renderPainelLocalizacao(){
  const cont=document.getElementById("painelLocalizacao");
  try{ await carregarPerfis(); }catch(e){}
  if(!cont) return;
  const u=state.user; if(!u){ cont.innerHTML=""; return; }
  // Atualiza caches usados por mapaLinkCheckin (calibração + overrides de endereço)
  try{ await _atualizarCachesMapa(); }catch(e){}
  const ehMafra=ehEquipeMafra(state.userId);
  const ehHelp=u.tipo==="helpdesk";
  const ehGestor=u.tipo==="gestor";
  if(!ehMafra && !ehHelp && !ehGestor){ cont.innerHTML=""; return; }
  const d=await loadCheckins();
  const regs=d.registros||[];
  let html="";

  // ----- GESTOR: vê o síndico do condomínio dele + Help Condo (somente leitura, sem check-in próprio) -----
  if(ehGestor){
    const sindBase=[...new Set((await Promise.all(condsDoGestor().map(c=>sindicoDoCondominio(c)))).filter(Boolean))];
    const apoiadores=Object.keys(USUARIOS).filter(uid=>USUARIOS[uid].apoiaSindico && sindBase.includes(USUARIOS[uid].apoiaSindico));
    const sindIds=[...new Set([...sindBase, ...apoiadores])];
    const ferSind=await feriasHojeMap(sindIds);
    if(sindIds.length) html+=_painelLocalHTML(icoH('local')+" Onde o síndico do seu condomínio está…", sindIds, regs, ferSind);
    else html+=`<div class="loc-painel"><div class="loc-painel-h"><h3 style="margin:0">${ico('local')} Síndico do seu condomínio</h3></div><div class="atend-hint" style="margin:0">Ainda não há síndico operacional vinculado ao seu condomínio.</div></div>`;
    const estados=await listarEstadoHelpdesk();
    const ferHD=await feriasHojeMap(estados.map(p=>p.uid));
    estados.forEach(p=>{ if(ferHD[p.uid]) p.ferias=ferHD[p.uid]; });
    html+=_painelHelpCondoHTML(estados, false);
    cont.innerHTML=html; return;
  }

  // (A) card do próprio usuário: férias TEM PRIORIDADE sobre check-in
  const minhaFerias=await infoFeriasHoje(state.userId);
  if(minhaFerias){
    const fimFmt=minhaFerias.fim?minhaFerias.fim.split("-").reverse().join("/"):"";
    html+=`<div class="loc-card loc-card-ferias">
      <div class="loc-ico">🏖️</div>
      <div class="loc-body">
        <div class="loc-tit">Você está de <strong>Férias</strong></div>
        <div class="loc-sub">${fimFmt?`Retorno previsto em ${fimFmt}`:""}${minhaFerias.obs?` · ${esc(minhaFerias.obs)}`:""}</div>
      </div>
    </div>`;
  } else {
    const ativo=checkinAtivoDe(state.userId, regs);
    if(ativo){
      const hora=new Date(ativo.checkIn).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
      const mlink=mapaLinkCheckin(ativo);
      const ic = ativo.interno==="home" ? "🏠" : (ativo.interno==="escritorio" ? "🏢" : (ativo.interno==="externo" ? "🚗" : "📍"));
      html+=`<div class="loc-card loc-ativo">
        <div class="loc-ico">${ic}</div>
        <div class="loc-body">
          <div class="loc-tit">Você está em <strong>${esc(ativo.condominio)}</strong></div>
          <div class="loc-sub">Entrada às ${hora} · ${tempoDesde(ativo.checkIn)}${ativo.geo?" · 📡 GPS":""}${_apoioTxt(ativo)}${ativo.obs?` · ${esc(ativo.obs)}`:""}${mlink?` · <a href="${mlink}" target="_blank" style="color:inherit;text-decoration:underline">ver no mapa</a>`:""}</div>
        </div>
        <button class="btn-primary" onclick="abrirCheckout()">✓ Check-out</button>
      </div>`;
    } else {
      html+=`<div class="loc-card loc-livre">
        <div class="loc-ico">${ico('local')}</div>
        <div class="loc-body">
          <div class="loc-tit">Sem check-in no momento</div>
          <div class="loc-sub">Registre quando chegar em um condomínio, no escritório ou em home office.</div>
        </div>
        <button class="btn-gold" onclick="abrirCheckin()">${ico('local')} Check-in</button>
      </div>`;
    }
  }

  // (B) "Onde a Equipe Mafra está…" — com integração de férias
  if(ehMafra){
    const ids=equipeMafraIds();
    const fer=await feriasHojeMap(ids);
    html+=_painelLocalHTML(icoH('local')+" Onde a Equipe Mafra está…", ids, regs, fer);
  }
  // (C) "Onde a Equipe Help Condo está…" — com integração de férias
  if(ehMafra || ehHelp){
    const estados=await listarEstadoHelpdesk();
    const ferHD=await feriasHojeMap(estados.map(p=>p.uid));
    estados.forEach(p=>{ if(ferHD[p.uid]) p.ferias=ferHD[p.uid]; });
    html+=_painelHelpCondoHTML(estados, ehHelp);
  }

  cont.innerHTML=html;
}




/* ============================================================
   build 126 — CHECK-IN ASSISTIDO (GPS), LEMBRETE DE CHECK-OUT
   E FECHAMENTO AUTOMÁTICO EM 24H
   ------------------------------------------------------------
   • Ao abrir o app: lê o GPS e, se a pessoa está dentro do raio
     calibrado de um condomínio (ou da sede), oferece o check-in
     com um toque. Le Monde / Trio (mesmo endereço) → escolhe o sub.
   • Com check-in aberto: lembra do check-out; se o GPS já mostra
     a pessoa longe do local, o aviso vem em destaque.
   • 24h sem check-out: fecha sozinho com o horário exato de 24h
     após a entrada e marca "checkOutAuto24" (aparece nas Métricas).
   Nada disso muda o check-in manual: ele continua igual.
   ============================================================ */
var CK_AUTO_LIMITE_MS = 24*60*60*1000;   // 24h
var CK_ASSIST_ADIAR_MS = 30*60*1000;     // "agora não" = 30 min sem perguntar de novo
window._ckAssist = window._ckAssist || { adiadoAte:0, rodando:false, ultimoOk:0 };

function _ckAssistenteHabilitado(){
  const u=(state && state.user)||{};
  if(!state.userId) return false;
  // quem faz check-in: síndicos operacionais e funcionários (BPO). Gestor/helpdesk/master não.
  if(u.tipo==="sindico"||u.tipo==="funcionario") return true;
  return (typeof ALERTA_CHECKIN_ALVO!=="undefined") && ALERTA_CHECKIN_ALVO.indexOf(state.userId)>-1 && u.tipo!=="gestor" && u.tipo!=="helpdesk";
}

// Fecha, para TODOS os usuários, check-ins abertos há mais de 24h. Grava só se mudou algo.
async function _ckFecharVencidos24h(d){
  d=d||await loadCheckins(); if(!d.registros) d.registros=[];
  const agora=Date.now(); let mudou=0;
  d.registros.forEach(r=>{
    if(!r.checkOut && r.checkIn && (agora-r.checkIn)>=CK_AUTO_LIMITE_MS){
      r.checkOut=r.checkIn+CK_AUTO_LIMITE_MS;
      r.checkOutAuto24=true;
      r.resumoSaida=(r.resumoSaida?r.resumoSaida+" · ":"")+"Check-out automático: 24h sem check-out.";
      mudou++;
    }
  });
  if(mudou){ try{ await saveCheckins(d); }catch(e){} }
  return {d, fechados:mudou};
}

// Leitura de GPS rápida (até ~8s); null se não conseguir.
function _ckLocalizarAgora(timeoutMs){
  return new Promise(res=>{
    if(!navigator.geolocation) return res(null);
    let feito=false; const fim=v=>{ if(!feito){ feito=true; res(v); } };
    try{
      navigator.geolocation.getCurrentPosition(
        p=>fim({lat:+p.coords.latitude.toFixed(6),lng:+p.coords.longitude.toFixed(6),acc:Math.round(p.coords.accuracy||0),ts:Date.now()}),
        ()=>fim(null),
        {enableHighAccuracy:true,timeout:timeoutMs||8000,maximumAge:60000}
      );
    }catch(e){ fim(null); }
    setTimeout(()=>fim(null),(timeoutMs||8000)+500);
  });
}

// Condomínios calibrados dentro do raio (com tolerância pela precisão do GPS), do mais perto ao mais longe.
function _ckCandidatosPerto(geos, g){
  const out=[];
  if(!g||g.lat==null) return out;
  const margem=Math.min(g.acc||0,150);
  Object.keys(geos||{}).forEach(k=>{
    const cfg=geos[k]; if(!cfg||cfg.lat==null||cfg.lng==null) return;
    const raio=cfg.raio||CHECKIN_RAIO_M;
    const dist=distMetros(g.lat,g.lng,cfg.lat,cfg.lng);
    if(dist<=raio+margem){
      if(k==="__escritorio__") out.push({key:k,nome:"Escritório Mafra",interno:"escritorio",dist});
      else if(typeof CONDOMINIOS!=="undefined" && CONDOMINIOS.indexOf(k)>-1) out.push({key:k,nome:k,interno:"",dist});
    }
  });
  out.sort((a,b)=>a.dist-b.dist);
  return out;
}

// Ponto de entrada: chamado no login e quando o app volta a ficar visível.
async function ckAssistente(origem){
  try{
    if(!_ckAssistenteHabilitado()) return;
    if(window._ckAssist.rodando) return;
    if(Date.now()<window._ckAssist.adiadoAte) return;
    const mm=document.getElementById("modalMount");
    if(mm && mm.innerHTML.trim()) return; // não atropela outro modal aberto
    window._ckAssist.rodando=true;
    const r=await _ckFecharVencidos24h();
    const d=r.d;
    const ativo=checkinAtivoDe(state.userId, d.registros);
    const g=await _ckLocalizarAgora(8000);
    if(ativo){ await _ckLembrarCheckout(ativo, g); }
    else if(g){
      const geos=await loadCondGeo();
      const cands=_ckCandidatosPerto(geos,g);
      if(cands.length) _ckOferecerCheckin(cands, g);
    }
  }catch(e){}
  finally{ window._ckAssist.rodando=false; }
}

function _ckAdiar(){ window._ckAssist.adiadoAte=Date.now()+CK_ASSIST_ADIAR_MS; closeModal(); }

function _ckOferecerCheckin(cands, g){
  // agrupa: se todos os candidatos pertencem ao mesmo pai (Le Monde / Trio), oferece os subs
  const pais={}; cands.forEach(c=>{ const p=c.interno?null:condominioPaiDe(c.nome); if(p) pais[p]=(pais[p]||0)+1; });
  const paisK=Object.keys(pais);
  let titulo, opcoes;
  if(paisK.length===1 && cands.every(c=>!c.interno && condominioPaiDe(c.nome)===paisK[0])){
    titulo=`Você está no <strong>${esc(paisK[0])}</strong> — em qual?`;
    opcoes=cands.map(c=>({rotulo:subRotulo(c.nome), nome:c.nome, interno:""}));
  } else {
    const c=cands[0];
    titulo=`Você está em <strong>${esc(c.nome)}</strong>`;
    opcoes=[{rotulo:"Fazer check-in", nome:c.nome, interno:c.interno}];
    // outros próximos (raro) viram opções secundárias
    cands.slice(1,4).forEach(o=>opcoes.push({rotulo:o.nome, nome:o.nome, interno:o.interno, sec:true}));
  }
  window._ckAssist.opcoes=opcoes; window._ckAssist.geo=g;
  const btns=opcoes.map((o,i)=>`<button class="${o.sec?"btn-ghost":"btn-primary"}" style="width:100%;margin-top:8px" onclick="_ckConfirmarAuto(${i})">${o.sec?"":ico('local')+" "}${esc(o.rotulo)}</button>`).join("");
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)_ckAdiar()"><div class="modal" style="max-width:420px">
    <div class="modal-head"><h3>${ico('local')} Check-in</h3><button class="x" onclick="_ckAdiar()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">${titulo}<br><span style="font-size:12px;color:var(--muted)">Localização do aparelho${g&&g.acc?` (±${g.acc} m)`:""}. Confirme para registrar.</span></p>
      ${btns}
      <div class="modal-foot" style="margin-top:12px"><button class="btn-cancel" style="flex:1" onclick="_ckAdiar()">Agora não</button></div>
    </div></div></div>`;
}

async function _ckConfirmarAuto(i){
  const o=(window._ckAssist.opcoes||[])[i]; if(!o) return;
  try{ const fer=await infoFeriasHoje(state.userId);
    if(fer && !confirm("Você consta de férias hoje no calendário. Deseja registrar o check-in mesmo assim?")) return;
  }catch(e){}
  const d=await loadCheckins(); if(!d.registros) d.registros=[];
  const ativo=checkinAtivoDe(state.userId, d.registros);
  if(ativo){ ativo.checkOut=Date.now(); ativo.checkOutAuto=true; }
  const reg={id:"ck"+Date.now()+Math.random().toString(36).slice(2,5),uid:state.userId,condominio:o.nome,checkIn:Date.now(),obs:"",viaGps:true};
  if(o.interno) reg.interno=o.interno;
  if(!o.interno && window._ckAssist.geo) reg.geo=window._ckAssist.geo;
  const meu=USUARIOS[state.userId]||{};
  if(meu.apoiaSindico && !o.interno) reg.apoiaSindico=meu.apoiaSindico;
  d.registros.push(reg);
  await saveCheckins(d);
  window._ckAssist.ultimoOk=Date.now();
  closeModal();
  try{ if(state.tab==="inicio") render(); }catch(e){}
  try{ renderPainelLocalizacao(); }catch(e){}
}

async function _ckLembrarCheckout(ativo, g){
  const dt=new Date(ativo.checkIn);
  const hoje=ymd(new Date())===ymd(dt);
  const quando=(hoje?"":dt.toLocaleDateString("pt-BR")+" ")+dt.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
  let longe=false, distTxt="";
  if(g && !ativo.interno){
    try{ const geos=await loadCondGeo(); const cfg=geos[ativo.condominio];
      if(cfg&&cfg.lat!=null){ const dist=distMetros(g.lat,g.lng,cfg.lat,cfg.lng); const raio=cfg.raio||CHECKIN_RAIO_M;
        if(dist>raio*2+(g.acc||0)){ longe=true; distTxt=dist>=1000?(dist/1000).toFixed(1)+" km":Math.round(dist)+" m"; } }
    }catch(e){}
  }
  const horas=(Date.now()-ativo.checkIn)/3600000;
  const titulo=longe
    ? `Você já está <strong>longe</strong> de ${esc(ativo.condominio)} (a ${distTxt}) e o check-in continua aberto.`
    : `Você ainda está com check-in em <strong>${esc(ativo.condominio)}</strong> desde ${quando}.`;
  const aviso24=horas>=20?`<div style="font-size:12px;color:#B45309;margin-top:6px">Sem check-out, o sistema fecha sozinho ao completar 24h.</div>`:"";
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)_ckAdiar()"><div class="modal" style="max-width:420px${longe?";border:2px solid #C0392B":""}">
    <div class="modal-head"><h3>${ico('local')} ${longe?"Esqueceu o check-out?":"Check-out"}</h3><button class="x" onclick="_ckAdiar()">×</button></div>
    <div class="modal-body">
      <p class="book-sub" style="margin-top:0">${titulo}</p>${aviso24}
      <button class="btn-primary" style="width:100%;margin-top:10px" onclick="closeModal();abrirCheckout()">✓ Dar check-out</button>
      <div class="modal-foot" style="margin-top:12px"><button class="btn-cancel" style="flex:1" onclick="_ckAdiar()">${longe?"Ainda estou lá":"Continuo aqui"}</button></div>
    </div></div></div>`;
}
