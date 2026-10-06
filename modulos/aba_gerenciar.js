/* ============================================================
   GESTÃO MAFRA — ABA GERENCIAR
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: gruposDinamicos, salvarUsuariosExtra, loadAcessos, saveCondGeo, saveCondEnderecosOverride, enderecoEfetivo, salvarEnderecoCondo, carregarLeaflet, abrirCalibracaoCondo, _initMapaCal, _setCoordsCal, aplicarColarCoords, atualizarRaioCal, usarPosicaoAtualCal, fecharCalibracao, salvarCalibracaoMapa, editarEnderecoCondo, confirmarEdicaoEndereco, resetarEnderecoCondo, limparCondoGeo, renderGerenciar, loadUltimoBackup, saveUltimoBackup, listarChavesBackup, gerarBackup, importarBackup, gerarBackupSilencioso, limparArea, openUsuario, toggleCondGestor, salvarUsuario, delUsuario, openCondominio, salvarCondominio, delCondominio */

function gruposDinamicos(){
  SINDICOS = Object.keys(USUARIOS).filter(k=>USUARIOS[k].tipo==="sindico");
  BPO = Object.keys(USUARIOS).filter(k=>["camilla","julia","bianca"].includes(k) || USUARIOS[k].grupoBPO);
}

async function salvarUsuariosExtra(){
  const extra={};
  Object.keys(USUARIOS).forEach(k=>{ if(!USUARIOS_BASE[k]) extra[k]=USUARIOS[k]; });
  Object.keys(USUARIOS).forEach(k=>{ if(USUARIOS_BASE[k] && JSON.stringify(USUARIOS_BASE[k])!==JSON.stringify(USUARIOS[k])) extra[k]=USUARIOS[k]; });
  await storeSet("mafra:usuarios_extra", JSON.stringify(extra));
}

async function loadAcessos(){
  try{ const v=await storeGet("mafra:ultimo_acesso"); if(v) return JSON.parse(v); }catch(e){}
  return {};
}

async function saveCondGeo(d){ _storeCacheClear("mafra:cond_geo"); return await storeSet("mafra:cond_geo", JSON.stringify(d)); }

async function saveCondEnderecosOverride(d){
  _storeCacheClear("mafra:cond_enderecos");
  return await storeSet("mafra:cond_enderecos", JSON.stringify(d));
}

async function enderecoEfetivo(chave){
  // chave pode ser nome do condo OU "__escritorio__"
  const ov=await loadCondEnderecosOverride();
  if(ov[chave]!=null && ov[chave]!=="") return ov[chave];
  const lookup = chave==="__escritorio__" ? "Mafra Gestão Integrada" : chave;
  return COND_ENDERECOS[lookup]||"";
}

async function salvarEnderecoCondo(chave, novoEndereco){
  const ov=await loadCondEnderecosOverride();
  if(!novoEndereco || !novoEndereco.trim()) delete ov[chave];
  else ov[chave] = novoEndereco.trim();
  await saveCondEnderecosOverride(ov);
}

function carregarLeaflet(){
  if(_leafletPromise) return _leafletPromise;
  if(typeof L!=="undefined" && L.map){ _leafletPromise=Promise.resolve(L); return _leafletPromise; }
  _leafletPromise=new Promise((resolve,reject)=>{
    const css=document.createElement("link");
    css.rel="stylesheet";
    css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const js=document.createElement("script");
    js.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.onload=()=>resolve(window.L);
    js.onerror=()=>reject(new Error("Falha ao carregar mapa"));
    document.head.appendChild(js);
    setTimeout(()=>{ if(!window.L) reject(new Error("Timeout ao carregar mapa")); }, 8000);
  });
  return _leafletPromise;
}

async function abrirCalibracaoCondo(nome){
  const ehEscritorio = nome === "__escritorio__";
  const tituloDisplay = ehEscritorio ? "Escritório Mafra" : nome;
  const endereco = await enderecoEfetivo(nome);
  const geos=await loadCondGeo();
  const cfg=geos[nome]||{};
  // Centro inicial: calibração existente OU centro de Ribeirão Preto
  const latIni = cfg.lat!=null ? cfg.lat : -21.1775;
  const lngIni = cfg.lng!=null ? cfg.lng : -47.8103;
  const raioIni = cfg.raio || CHECKIN_RAIO_M;
  const jaCal = cfg.lat!=null;
  const mapsUrl = endereco
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`
    : "";

  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)fecharCalibracao()"><div class="modal cal-modal">
    <div class="modal-head"><h3>${ico('local')} Calibrar — ${esc(tituloDisplay)}</h3><button class="x" onclick="fecharCalibracao()">×</button></div>
    <div class="modal-body">
      ${endereco?`<div class="cal-m-end">📮 ${esc(endereco)}${mapsUrl?` <a href="${mapsUrl}" target="_blank" rel="noopener" class="cal-m-maps">abrir no Google Maps ↗</a>`:""}</div>`:""}
      <div class="cal-m-hint">📌 Clique sobre o prédio no mapa abaixo. ${jaCal?"":"O mapa começa centrado em Ribeirão Preto — dê zoom até achar o condomínio."} Você pode arrastar o pino para ajustar.</div>
      <div id="mapaCalibracao" class="cal-m-mapa"></div>
      <div class="cal-m-coords">
        <div class="cal-m-coords-info">
          <div class="cal-m-coords-lbl">Coordenadas marcadas:</div>
          <div class="cal-m-coords-vals"><code id="calLat">${latIni.toFixed(6)}</code>, <code id="calLng">${lngIni.toFixed(6)}</code></div>
        </div>
        <button class="btn-ghost hd-mini" onclick="usarPosicaoAtualCal()" title="Use estando no local">📡 Estou aqui agora</button>
      </div>
      <div class="cal-m-paste">
        <label>Ou cole coords do Maps:</label>
        <input id="calPaste" type="text" placeholder="-21.179726, -47.810352" oninput="aplicarColarCoords()">
      </div>
      <div class="field cal-m-raio"><label>Raio permitido (metros)</label>
        <input id="calRaio" type="number" value="${raioIni}" min="50" max="2000" step="10" oninput="atualizarRaioCal()">
        <div class="cal-m-raio-hint">Padrão 250m. Aumente para condomínios grandes (Kanoah, Reserva da Mata).</div>
      </div>
      <div class="modal-foot">
        <button class="btn-cancel" onclick="fecharCalibracao()">Cancelar</button>
        <button class="btn-primary" style="flex:1" onclick="salvarCalibracaoMapa('${nome.replace(/'/g,"\\'")}')">💾 Salvar calibração</button>
      </div>
    </div></div></div>`;

  // Estado global do modal
  window._calState={ nome, lat:latIni, lng:lngIni, raio:raioIni, map:null, marker:null, circle:null };

  try{
    const L=await carregarLeaflet();
    setTimeout(()=>_initMapaCal(L, latIni, lngIni, raioIni, jaCal?18:13), 80);
  }catch(e){
    const div=document.getElementById("mapaCalibracao");
    if(div) div.innerHTML='<div class="cal-m-fail">⚠ Não consegui carregar o mapa interativo (talvez sem internet). Use o link "abrir no Google Maps" acima e cole as coordenadas no campo abaixo.</div>';
  }
}

function _initMapaCal(L, lat, lng, raio, zoom){
  if(!document.getElementById("mapaCalibracao")) return;
  const map=L.map("mapaCalibracao",{ zoomControl:true }).setView([lat,lng], zoom);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"© OpenStreetMap", maxZoom:19
  }).addTo(map);
  const marker=L.marker([lat,lng],{draggable:true}).addTo(map);
  const circle=L.circle([lat,lng],{
    radius:raio, color:"#16243D", fillColor:"#C9A24B",
    fillOpacity:0.18, weight:2
  }).addTo(map);
  map.on("click", e=>{
    marker.setLatLng(e.latlng);
    _setCoordsCal(e.latlng.lat, e.latlng.lng);
  });
  marker.on("dragend", ()=>{
    const p=marker.getLatLng();
    _setCoordsCal(p.lat, p.lng);
  });
  window._calState.map=map;
  window._calState.marker=marker;
  window._calState.circle=circle;
  setTimeout(()=>map.invalidateSize(), 120);
}

function _setCoordsCal(lat, lng){
  if(!window._calState) return;
  window._calState.lat=lat;
  window._calState.lng=lng;
  const elL=document.getElementById("calLat");
  const elG=document.getElementById("calLng");
  if(elL) elL.textContent=lat.toFixed(6);
  if(elG) elG.textContent=lng.toFixed(6);
  if(window._calState.circle) window._calState.circle.setLatLng([lat,lng]);
}

function aplicarColarCoords(){
  const v=(document.getElementById("calPaste")||{}).value||"";
  // aceita "lat, lng" / "lat lng" / "lat;lng"
  const m=v.match(/(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)/);
  if(!m) return;
  const lat=parseFloat(m[1]), lng=parseFloat(m[2]);
  if(isNaN(lat) || isNaN(lng)) return;
  if(Math.abs(lat)>90 || Math.abs(lng)>180) return;
  if(window._calState && window._calState.marker){
    window._calState.marker.setLatLng([lat,lng]);
    window._calState.map.setView([lat,lng], 18);
  }
  _setCoordsCal(lat,lng);
}

function atualizarRaioCal(){
  if(!window._calState) return;
  const r=parseInt((document.getElementById("calRaio")||{}).value||"",10);
  if(!isNaN(r) && r>0){
    window._calState.raio=r;
    if(window._calState.circle) window._calState.circle.setRadius(r);
  }
}

function usarPosicaoAtualCal(){
  if(!navigator.geolocation){ alert("GPS não disponível neste aparelho."); return; }
  navigator.geolocation.getCurrentPosition(p=>{
    const lat=+p.coords.latitude.toFixed(6), lng=+p.coords.longitude.toFixed(6);
    if(window._calState && window._calState.marker){
      window._calState.marker.setLatLng([lat,lng]);
      window._calState.map.setView([lat,lng], 18);
    }
    _setCoordsCal(lat,lng);
  }, e=>{ alert("Não consegui obter sua localização. Verifique se o GPS está liberado."); },
  {enableHighAccuracy:true, timeout:8000, maximumAge:60000});
}

function fecharCalibracao(){
  if(window._calState && window._calState.map){
    try{ window._calState.map.remove(); }catch(e){}
  }
  window._calState=null;
  const mm=document.getElementById("modalMount"); if(mm) mm.innerHTML="";
}

async function salvarCalibracaoMapa(nome){
  if(!window._calState){ fecharCalibracao(); return; }
  const lat=window._calState.lat, lng=window._calState.lng;
  const raio=window._calState.raio || CHECKIN_RAIO_M;
  const geos=await loadCondGeo();
  geos[nome]={
    lat:+(+lat).toFixed(6), lng:+(+lng).toFixed(6),
    raio, calibradoPor:state.userId, calibradoEm:Date.now()
  };
  await saveCondGeo(geos);
  fecharCalibracao();
  render();
}

async function editarEnderecoCondo(chave){
  const ehEscritorio = chave === "__escritorio__";
  const tituloDisplay = ehEscritorio ? "Escritório Mafra" : chave;
  const ov = await loadCondEnderecosOverride();
  const lookup = ehEscritorio ? "Mafra Gestão Integrada" : chave;
  const enderecoOriginal = COND_ENDERECOS[lookup] || "";
  const enderecoAtual = ov[chave] != null ? ov[chave] : enderecoOriginal;
  const foiEditado = ov[chave] != null;

  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:560px">
    <div class="modal-head"><h3>📮 Editar endereço — ${esc(tituloDisplay)}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="field"><label>Endereço completo</label>
        <textarea id="endEditTxt" rows="3" placeholder="Ex.: R Aurelio Virgilio Bozzo, 40 - NC Residencial e Empresarial Alphaville - Ribeirão Preto - SP, 14039-040" style="resize:vertical;font-family:inherit;font-size:14px;width:100%;padding:10px;border:1px solid var(--line);border-radius:6px">${esc(enderecoAtual)}</textarea>
        <div style="font-size:11.5px;color:var(--muted);margin-top:6px">Cole o endereço completo. Esta edição NÃO move a calibração no mapa — para isso clique em "✏️ Editar mapa".</div>
      </div>
      ${foiEditado ? `<div style="background:#FFFBF1;border:1px solid #C9A24B33;border-radius:6px;padding:9px 12px;margin-bottom:12px;font-size:12px;color:#5b6373">
        <b style="color:var(--gold)">Endereço original do sistema:</b><br>${esc(enderecoOriginal||"(vazio)")}
      </div>` : ""}
      <div class="modal-foot" style="gap:8px">
        <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        ${foiEditado ? `<button class="btn-ghost" onclick="resetarEnderecoCondo('${chave.replace(/'/g,"\\\\'")}')">↺ Voltar ao original</button>` : ""}
        <button class="btn-primary" style="flex:1" onclick="confirmarEdicaoEndereco('${chave.replace(/'/g,"\\\\'")}')">💾 Salvar endereço</button>
      </div>
    </div>
  </div></div>`;
  setTimeout(()=>{ const el=document.getElementById("endEditTxt"); if(el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 50);
}

async function confirmarEdicaoEndereco(chave){
  const txt = (document.getElementById("endEditTxt")||{}).value || "";
  await salvarEnderecoCondo(chave, txt);
  closeModal();
  render();
}

async function resetarEnderecoCondo(chave){
  if(!confirm("Voltar ao endereço original do sistema?\n\nSua edição manual será descartada.")) return;
  await salvarEnderecoCondo(chave, ""); // string vazia remove o override
  closeModal();
  render();
}

async function limparCondoGeo(nome){
  if(!confirm(`Remover a calibração de "${nome === "__escritorio__" ? "Escritório Mafra" : nome}"?\n\nDepois disso ninguém poderá fazer check-in neste condomínio até calibrar de novo.`)) return;
  const geos=await loadCondGeo();
  delete geos[nome];
  await saveCondGeo(geos);
  render();
}

async function renderGerenciar(){
  const view=document.getElementById("view");
  const usuarios=Object.keys(USUARIOS);
  const acessos=await loadAcessos();
  let html=`<div class="weeknav"><div><h2>Gerenciar</h2><div class="range">Usuários, funções e condomínios · versão ${APP_VERSAO}</div></div></div>`;

  // ---- USUÁRIOS ----
  html+=`<div class="ger-sec"><div class="ger-head"><h3>👥 Usuários e funções</h3><div style="display:flex;gap:8px"><button class="btn-ghost" onclick="abrirPermissoesPerfil('sindico')">🔐 Permissões e acessos</button><button class="btn-gold" onclick="openUsuario(null)">＋ Novo usuário</button></div></div><div class="ger-list">`;
  usuarios.forEach(uid=>{
    const u=USUARIOS[uid];
    const tipoLbl={sindico:"Síndico Operacional",funcionario:"BPO / Administrativo",master:"Master",gestor:"Gestor",helpdesk:"Help Condo"}[u.tipo]||u.tipo;
    const ini=u.nome.split(" ").map(w=>w[0]).slice(0,2).join("");
    const acesso=tempoDesde(acessos[uid]);
    html+=`<div class="ger-row">
      <div class="avatar" style="background:${u.cor||'#16243D'};color:#fff;width:36px;height:36px;font-size:14px">${ini}</div>
      <div class="ger-info"><div class="ger-nome">${esc(u.nome)} <span class="ger-badge">${tipoLbl}</span></div>
        <div class="ger-sub">@${uid} · ${esc(u.cargo||"")}</div>
        <div class="ger-acesso">🕐 Último acesso: ${acesso}</div></div>
      <button class="icon-btn" onclick="openUsuario('${uid}')" title="Editar usuário">✎</button>
      <button class="icon-btn icon-btn-perm" onclick="abrirPermissoesPerfil('${u.tipo}')" title="Permissões do perfil ${esc(tipoLbl)}">🔐</button>
      ${USUARIOS_BASE[uid]?'':`<button class="icon-btn" onclick="delUsuario('${uid}')" title="Excluir usuário">🗑</button>`}
    </div>`;
  });
  html+=`</div></div>`;

  // ---- BACKUP MENSAL (só Bianca pode acessar) ----
  if(state.userId === "bianca"){
    const ultBackup = await loadUltimoBackup();
    const ultBackupTxt = ultBackup ? new Date(ultBackup.ts).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "nunca feito";
    const diasDesde = ultBackup ? Math.floor((Date.now()-ultBackup.ts)/86400000) : 999;
    const statusBackup = !ultBackup ? "danger" : (diasDesde>14 ? "danger" : (diasDesde>7 ? "warn" : "ok"));
    const statusIco = {ok:"✅", warn:"⚠️", danger:"🔴"}[statusBackup];
    const statusMsg = !ultBackup
      ? "Você ainda não fez nenhum backup. Recomendamos fazer agora."
      : (diasDesde>7 ? `Último backup há ${diasDesde} dias — faça um novo agora.` : `Último backup há ${diasDesde} dia${diasDesde!==1?"s":""}.`);
    html+=`<div class="ger-sec"><div class="ger-head"><h3>📦 Backup do sistema</h3></div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:14px">Baixa um arquivo de segurança com TODOS os dados do sistema (tarefas, relatórios, atendimentos, gravações, chamados, check-ins, comunicados, notas, condomínios e usuários). Guarde no Drive da Mafra para emergências. <b>Recomendado fazer toda semana (a cada 7 dias).</b><br><br>📌 <i>O backup é só para sua segurança. Não apaga nem altera nada dos dados que estão no sistema.</i></div>
      <div class="backup-status backup-${statusBackup}">
        <div class="bs-ico">${statusIco}</div>
        <div class="bs-body">
          <div class="bs-titulo">${esc(statusMsg)}</div>
          <div class="bs-sub">Último backup: <b>${ultBackupTxt}</b>${ultBackup?` · por ${esc(USUARIOS[ultBackup.uid]?.nome||ultBackup.uid)}`:""}</div>
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
        <button class="btn-gold" style="flex:1;min-width:160px" onclick="gerarBackup()">📥 Baixar backup</button>
        <label class="btn-ghost" style="flex:1;min-width:160px;text-align:center;cursor:pointer;border:1.5px solid #C0392B;color:#C0392B" title="Restaura os dados a partir de um arquivo de backup">📤 Importar backup<input type="file" accept="application/json,.json" style="display:none" onchange="importarBackup(event)"></label>
      </div>
      <div style="font-size:11.5px;color:#C0392B;margin-top:8px;line-height:1.4">⚠️ <b>Importar</b> substitui os dados atuais pelos do arquivo. Use só em emergência. O sistema baixa um backup de segurança automático antes de importar.</div>
    </div>`;
  }


  // ---- CAPAS RELATÓRIOS — valem p/ relatório gerencial, manual e vistoria (só liderança master e Julia) ----
  if(state.user.tipo==="master" || state.userId==="julia"){
    html+=`<div class="ger-sec"><div class="ger-head"><h3>${ico('imagem')} Capas Relatórios</h3><button class="btn-ghost" onclick="abrirGerenciarCapas()">🗂️ Abrir em janela</button></div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:14px">Capa e contracapa de cada condomínio ficam guardadas aqui e valem para <b>todos os documentos</b>: Relatório Gerencial, Manual de Boas-Vindas e Vistoria. O gestor não precisa fazer nada: ao gerar qualquer um desses PDFs, elas entram <b>automaticamente</b>. Onde não houver imagem personalizada, sai o padrão Mafra. Apenas a liderança e a Julia veem e alteram esta seção.</div>
      <div class="capger-grid" id="capgerGrid"><div class="atend-hint" style="margin:0">Carregando capas…</div></div>
    </div>`;
  }


  // ---- 🩺 SAÚDE DO SISTEMA (exclusivo da Bianca, como o Backup) ----
  if(state.userId === "bianca"){
    html+=`<div class="ger-sec"><div class="ger-head"><h3>🩺 Saúde do sistema</h3><button class="btn-gold" onclick="executarAutotesteUI()">▶ Verificar agora</button></div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:12px">O app se confere sozinho 1x por dia: funções, gravação no servidor, índice dos relatórios, chaves de fotos e queda suspeita nas contagens. <b>Só você vê esta seção e recebe os avisos no sino</b> — ninguém precisa descobrir um problema semanas depois. Também guarda uma fotografia diária da lista de relatórios (7 dias) para restaurar se preciso.</div>
      <div id="saudeBox"><div class="atend-hint" style="margin:0">Carregando última verificação…</div></div>
    </div>`;
  }


  // ---- CONDOMÍNIOS (cadastro + calibração + remoção, tudo junto) ----
  const _geosCond = await loadCondGeo();
  const _endOv = await loadCondEnderecosOverride();
  const _endResolve = (chave)=>{
    if(_endOv[chave]!=null && _endOv[chave]!=="") return _endOv[chave];
    const lookup = chave==="__escritorio__" ? "Mafra Gestão Integrada" : chave;
    return COND_ENDERECOS[lookup]||"";
  };
  html+=`<div class="ger-sec"><div class="ger-head"><h3>${ico('predio')} Condomínios</h3><button class="btn-gold" onclick="openCondominio()">＋ Novo condomínio</button></div>
    <div style="font-size:13px;color:var(--muted);margin-bottom:14px">Lista de todos os condomínios cadastrados. Calibre o endereço de cada um (sem calibração, o check-in fica bloqueado), edite o endereço se precisar, e remova os que não fazem mais sentido.</div>
    <div class="cal-lista">`;
  // Linha especial: Escritório Mafra (endereço da sede)
  {
    const cfg=_geosCond["__escritorio__"];
    const cal=!!(cfg && cfg.lat!=null && cfg.lng!=null);
    const por=cal && cfg.calibradoPor && USUARIOS[cfg.calibradoPor] ? USUARIOS[cfg.calibradoPor].nome.split(" ")[0] : "";
    const quando=cal && cfg.calibradoEm ? new Date(cfg.calibradoEm).toLocaleDateString("pt-BR") : "";
    const endereco=_endResolve("__escritorio__");
    const editado = _endOv["__escritorio__"]!=null;
    html+=`<div class="cal-row ${cal?'cal-ok':'cal-pendente'}" style="border-left-color:${cal?'#2F9E44':'#C9A24B'};background:${cal?'#fff':'#FFFBF1'}">
      <div class="cal-ic">${ico('predio')}</div>
      <div class="cal-body">
        <div class="cal-nm">Escritório Mafra <span style="font-size:11px;color:var(--gold);background:#FFFBF1;padding:2px 7px;border-radius:5px;border:1px solid #C9A24B33;font-weight:600;margin-left:6px">SEDE</span></div>
        ${endereco
          ? `<div class="cal-end">📮 ${esc(endereco)}${editado?` <span style="font-size:10.5px;color:var(--gold);font-weight:600;margin-left:4px">(editado)</span>`:""} <button class="cal-end-edit" onclick="editarEnderecoCondo('__escritorio__')" title="Editar endereço">✏️</button></div>`
          : `<div class="cal-end cal-end-vazio">— endereço não cadastrado — <button class="cal-end-edit" onclick="editarEnderecoCondo('__escritorio__')" title="Adicionar endereço">✏️</button></div>`}
        <div class="cal-sub">${cal ? `Endereço calibrado${por?` por ${esc(por)}`:""}${quando?` · ${quando}`:""} · raio ${cfg.raio||CHECKIN_RAIO_M}m` : "Calibre para registrar a localização da sede"}</div>
      </div>
      <div class="cal-acoes">
        <button class="btn-gold hd-mini" onclick="abrirCalibracaoCondo('__escritorio__')" title="Calibrar endereço do escritório">${cal?'✏️ Editar mapa':'📍 Calibrar'}</button>
        ${cal?`<button class="btn-del hd-mini" onclick="limparCondoGeo('__escritorio__')" title="Remover calibração">🗑️</button>`:""}
      </div>
    </div>`;
  }
  CONDOMINIOS.forEach(c=>{
    const cfg=_geosCond[c];
    const cal=!!(cfg && cfg.lat!=null && cfg.lng!=null);
    const por=cal && cfg.calibradoPor && USUARIOS[cfg.calibradoPor] ? USUARIOS[cfg.calibradoPor].nome.split(" ")[0] : "";
    const quando=cal && cfg.calibradoEm ? new Date(cfg.calibradoEm).toLocaleDateString("pt-BR") : "";
    const nm=String(c).replace(/'/g,"\\'");
    const endereco=_endResolve(c);
    const editado = _endOv[c]!=null;
    html+=`<div class="cal-row ${cal?'cal-ok':'cal-pendente'}">
      <div class="cal-ic">${cal?'✓':'⚠'}</div>
      <div class="cal-body">
        <div class="cal-nm">${esc(c)}</div>
        ${endereco
          ? `<div class="cal-end">📮 ${esc(endereco)}${editado?` <span style="font-size:10.5px;color:var(--gold);font-weight:600;margin-left:4px">(editado)</span>`:""} <button class="cal-end-edit" onclick="editarEnderecoCondo('${nm}')" title="Editar endereço">✏️</button></div>`
          : `<div class="cal-end cal-end-vazio">— endereço não cadastrado — <button class="cal-end-edit" onclick="editarEnderecoCondo('${nm}')" title="Adicionar endereço">✏️</button></div>`}
        <div class="cal-sub">${cal ? `Calibrado${por?` por ${esc(por)}`:""}${quando?` · ${quando}`:""} · raio ${cfg.raio||CHECKIN_RAIO_M}m` : "⚠ Não calibrado — check-ins bloqueados"}</div>
      </div>
      <div class="cal-acoes">
        <button class="btn-gold hd-mini" onclick="abrirCalibracaoCondo('${nm}')" title="Abrir mapa para calibrar/editar">${cal?'✏️ Editar mapa':'📍 Calibrar'}</button>
        <button class="btn-del hd-mini" onclick="delCondominio('${nm}')" title="Remover condomínio do sistema">🗑️ Remover</button>
      </div>
    </div>`;
  });
  html+=`</div></div>`;

  html+=`<div class="ger-sec"><div class="ger-head"><h3>🧹 Apagar registros (limpar testes)</h3></div>
    <div style="font-size:13px;color:var(--muted);margin-bottom:14px">Apague os dados de teste de cada área separadamente. Cada botão limpa só a sua parte — não afeta usuários nem condomínios. Use com cuidado: não dá para desfazer.</div>
    <div class="limpar-grid">
      <button class="btn-limpar" onclick="limparArea('calendario')"><span>${ico('calendario')}</span><div><b>Calendário</b><small>Eventos e reuniões de todos</small></div></button>
      <button class="btn-limpar" onclick="limparArea('relatorios')"><span>📄</span><div><b>Relatórios Gerenciais</b><small>Todos os relatórios enviados</small></div></button>
      <button class="btn-limpar" onclick="limparArea('atendimentos')"><span>📊</span><div><b>Atendimentos</b><small>Registros do painel inicial</small></div></button>
      <button class="btn-limpar" onclick="limparArea('comunicados')"><span>📣</span><div><b>Comunicados</b><small>Comunicados e registros manuais</small></div></button>
      <button class="btn-limpar" onclick="limparArea('gravacoes')"><span>🎙️</span><div><b>Gravações & Atas</b><small>Todas as atas geradas</small></div></button>
      <button class="btn-limpar" onclick="limparArea('notas')"><span>📝</span><div><b>Notas</b><small>Notas de todos os usuários</small></div></button>
    </div>
  </div>`;

  view.innerHTML=html;
  // carrega as miniaturas das capas em segundo plano (imagens pesadas, uma por vez)
  try{ carregarCapasGerenciar(); }catch(e){}
  try{ renderSaudeSistema(); }catch(e){}
}

// painel da última verificação + fotografias disponíveis
async function renderSaudeSistema(){
  const box=document.getElementById("saudeBox");
  if(!box) return;
  let ult=null;
  try{ const v=await storeGet("mafra:autoteste"); if(v) ult=JSON.parse(v); }catch(e){}
  let idx={};
  try{ const v=await storeGet("mafra:snapshot:idx"); if(v) idx=JSON.parse(v)||{}; }catch(e){}
  const fmt=ts=>ts?new Date(ts).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"";
  let html="";
  if(!ult){ html+=`<div class="atend-hint" style="margin:0">Nenhuma verificação feita ainda. Clique em ▶ Verificar agora.</div>`; }
  else{
    const cor=ult.falhas?"#C0392B":"#2F7D4F";
    const ico=ult.falhas?"🔴":"✅";
    html+=`<div style="display:flex;align-items:center;gap:10px;background:${ult.falhas?'#FDF1F0':'#F0F8F2'};border:1.5px solid ${cor}33;border-radius:10px;padding:10px 14px;margin-bottom:10px">
      <div style="font-size:22px">${ico}</div>
      <div style="flex:1"><b style="color:${cor}">${ult.falhas?ult.falhas+" problema(s) encontrado(s)":"Tudo certo na última verificação"}</b>
      <div style="font-size:11.5px;color:var(--muted)">${fmt(ult.ts)} · por ${esc(_nomeUsuarioRel(ult.por))} · ${esc(ult.versao||"")}</div></div></div>`;
    html+=(ult.itens||[]).map(i=>{
      const ic=i.ok?(i.nivel==="aviso"?"⚠️":"✅"):(i.nivel==="aviso"?"⚠️":"❌");
      return `<div style="display:flex;gap:8px;padding:6px 2px;border-bottom:1px solid var(--line);font-size:12.5px"><span>${ic}</span><b style="min-width:0">${esc(i.nome)}</b><span style="flex:1;color:var(--muted);text-align:right;min-width:0;overflow-wrap:anywhere">${esc(i.detalhe||"")}</span></div>`;
    }).join("");
  }
  const dias=Object.keys(idx).sort().reverse();
  if(dias.length){
    html+=`<div style="font-size:11px;font-weight:700;letter-spacing:.5px;color:var(--muted);margin:12px 0 4px">📸 FOTOGRAFIAS DA LISTA DE RELATÓRIOS (restauração)</div>`;
    html+=dias.map(dia=>`<div style="display:flex;align-items:center;gap:8px;padding:5px 2px;font-size:12.5px;border-bottom:1px solid var(--line)">
      <span>${ico('calendario')} ${dia}</span><span style="color:var(--muted)">· ${idx[dia].n} relatório(s)</span><span style="flex:1"></span>
      <button class="btn-ghost hd-mini" onclick="restaurarSnapshotRel('${dia}')">↩️ Restaurar</button>
    </div>`).join("");
  }
  box.innerHTML=html;
}

// botão "Verificar agora"
async function executarAutotesteUI(){
  mostrarCarregandoRel("Verificando o sistema…");
  let res=null;
  try{ res=await executarAutoteste(); } finally { esconderCarregandoRel(); }
  try{ await renderSaudeSistema(); }catch(e){}
  if(res) alert(res.falhas?("🔴 "+res.falhas+" problema(s) encontrado(s). Veja os detalhes no painel — e me mande uma foto dele."):"✅ Tudo certo! Funções, gravação, índice e fotos verificados.");
}

async function loadUltimoBackup(){
  try{ const v=await storeGet("mafra:ultimo_backup"); if(v) return JSON.parse(v); }catch(e){}
  return null;
}

async function saveUltimoBackup(d){ _storeCacheClear("mafra:ultimo_backup"); return await storeSet("mafra:ultimo_backup", JSON.stringify(d)); }

async function listarChavesBackup(){
  const uids = Object.keys(USUARIOS);
  const globais = ["mafra:atendimentos","mafra:aniversarios","mafra:capas_cond","mafra:chamados","mafra:checkins","mafra:comunicados","mafra:comunicados_manual","mafra:cond_enderecos","mafra:cond_geo","mafra:condominios_extra","mafra:condominios_removidos","mafra:escritorio","mafra:facultativos","mafra:fichas_cond","mafra:gravacoes","mafra:hd_bloqueio","mafra:hd_bloqueios","mafra:ocorrencias","mafra:relatorios","mafra:ultimo_acesso","mafra:usuarios_extra"];
  const porUsuario = [];
  const prefixosPorUid = ["mafra:agenda:","mafra:eventos:","mafra:condominios:","mafra:notas:","mafra:avisos:","mafra:notifvistos:","mafra:analises:"];
  uids.forEach(uid=>{ prefixosPorUid.forEach(p=>porUsuario.push(p+uid)); });
  // capas por condomínio (formato novo)
  const capas=[];
  try{ (CONDOMINIOS||[]).forEach(c=>capas.push("mafra:capa:"+c)); }catch(e){}
  // fotos dos relatórios (uma chave por relatório)
  const fotosRel=[];
  try{ const d=await loadRelatorios(); (d.list||[]).forEach(r=>{ if(r&&r.id&&r.fotosSeparadas) fotosRel.push("mafra:relfotos:"+r.id); }); }catch(e){}
  return [...globais, ...porUsuario, ...capas, ...fotosRel];
}

async function gerarBackup(){
  if(state.userId !== "bianca"){
    alert("Apenas a Bianca (coordenadora administrativa) pode fazer o backup do sistema.");
    return;
  }
  const btn = event && event.target;
  const original = btn ? btn.textContent : "";
  if(btn){ btn.disabled=true; btn.textContent="⏳ Gerando backup…"; }
  try{
    const chaves = await listarChavesBackup();
    const dados = {};
    let totalChaves = 0, totalBytes = 0;
    for(const k of chaves){
      try{
        const v = await storeGet(k);
        if(v !== null && v !== undefined && v !== ""){
          dados[k] = v;
          totalChaves++;
          totalBytes += (typeof v==="string" ? v.length : 0);
        }
      }catch(e){ /* segue */ }
    }
    const ts = Date.now();
    const arq = {
      formato: "mafra-backup-v1",
      gerado_em: new Date(ts).toISOString(),
      gerado_por: state.userId,
      gerado_por_nome: state.user.nome,
      total_chaves: totalChaves,
      total_bytes_aprox: totalBytes,
      dados
    };
    const blob = new Blob([JSON.stringify(arq,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dt = new Date(ts);
    const nomeArq = `mafra-backup-${dt.getFullYear()}${("0"+(dt.getMonth()+1)).slice(-2)}${("0"+dt.getDate()).slice(-2)}-${("0"+dt.getHours()).slice(-2)}${("0"+dt.getMinutes()).slice(-2)}.json`;
    a.href = url; a.download = nomeArq;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
    // registra que o backup foi feito
    await saveUltimoBackup({ts, uid:state.userId, totalChaves, totalBytes, nome:nomeArq});
    alert(`✅ Backup gerado!\n\n📄 Arquivo: ${nomeArq}\n📊 ${totalChaves} áreas · ${(totalBytes/1024/1024).toFixed(1)} MB\n\n🗂 GUARDE NO DRIVE DA MAFRA:\nSugestão: Drive/Backups Mafra/${dt.getFullYear()}/${nomeArq}`);
    if(state.tab==="gerenciar") renderGerenciar();
  }catch(err){
    alert("❌ Erro ao gerar o backup: "+(err.message||err));
  }finally{
    if(btn){ btn.disabled=false; btn.textContent=original; }
  }
}

async function importarBackup(ev){
  const f = ev.target.files && ev.target.files[0];
  if(!f) return;
  ev.target.value = ""; // permite reabrir o mesmo arquivo depois
  // trava de segurança: só a Bianca
  if(state.userId !== "bianca"){
    alert("Apenas a Bianca (coordenadora administrativa) pode importar um backup.");
    return;
  }
  try{
    const txt = await f.text();
    const arq = JSON.parse(txt);
    // validação: precisa ser um backup válido da Mafra
    if(!arq || arq.formato!=="mafra-backup-v1" || !arq.dados || typeof arq.dados!=="object"){
      alert("❌ Arquivo inválido.\n\nSelecione um arquivo de backup do sistema Mafra (mafra-backup-AAAAMMDD-HHMM.json).");
      return;
    }
    const dt = new Date(arq.gerado_em);
    const dataFmt = isNaN(dt) ? "data desconhecida" : dt.toLocaleString("pt-BR");
    const qtdChaves = Object.keys(arq.dados).length;
    const tamMB = (arq.total_bytes_aprox/1024/1024).toFixed(1);
    // 1ª confirmação — explica tudo
    const msg1 = `📤 IMPORTAR BACKUP\n\n`
      + `📅 Backup gerado em: ${dataFmt}\n`
      + `👤 Por: ${arq.gerado_por_nome||arq.gerado_por||"?"}\n`
      + `📊 Áreas no arquivo: ${qtdChaves} · ~${tamMB} MB\n\n`
      + `⚠️ ATENÇÃO: isso vai SUBSTITUIR os dados atuais do sistema pelos dados deste arquivo.\n\n`
      + `🛡️ Para sua segurança, ANTES de importar o sistema vai baixar automaticamente um backup do estado ATUAL (caso precise voltar atrás).\n\n`
      + `Deseja continuar?`;
    if(!confirm(msg1)) return;
    // baixa backup de segurança do estado atual ANTES de sobrescrever
    alert("🛡️ Vamos primeiro baixar um backup do estado ATUAL (segurança). Guarde esse arquivo.");
    await gerarBackupSilencioso("ANTES-DE-IMPORTAR");
    // 2ª confirmação — última chance
    const msg2 = `⚠️ ÚLTIMA CONFIRMAÇÃO\n\n`
      + `O backup de segurança do estado atual foi baixado.\n\n`
      + `Agora os dados atuais serão SUBSTITUÍDOS pelos do arquivo de ${dataFmt}.\n\n`
      + `Esta ação NÃO pode ser desfeita (a não ser reimportando o backup de segurança).\n\n`
      + `Confirma a importação?`;
    if(!confirm(msg2)) { alert("Importação cancelada. Nada foi alterado."); return; }
    // restaura cada chave
    let restauradas = 0, falhas = 0;
    for(const k in arq.dados){
      try{ await storeSet(k, arq.dados[k]); restauradas++; }
      catch(e){ falhas++; }
    }
    if(typeof _storeCacheClear==="function") _storeCacheClear();
    alert(`✅ Backup importado!\n\n${restauradas} áreas restauradas${falhas?` · ${falhas} falha(s)`:""}\n\nA tela será recarregada para aplicar tudo.`);
    location.reload();
  }catch(err){
    alert("❌ Erro ao ler o arquivo: "+(err.message||err)+"\n\nSelecione um arquivo de backup válido da Mafra (.json).");
  }
}

async function gerarBackupSilencioso(sufixo){
  try{
    const chaves = await listarChavesBackup();
    const dados = {};
    let totalChaves=0, totalBytes=0;
    for(const k of chaves){
      try{ const v=await storeGet(k); if(v!=null && v!==""){ dados[k]=v; totalChaves++; totalBytes+=(""+v).length; } }catch(e){}
    }
    const ts=Date.now(), dt=new Date(ts);
    const arq={formato:"mafra-backup-v1",gerado_em:new Date(ts).toISOString(),gerado_por:state.userId,gerado_por_nome:state.user.nome,total_chaves:totalChaves,total_bytes_aprox:totalBytes,dados};
    const blob=new Blob([JSON.stringify(arq,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    const nome=`mafra-backup-${sufixo?sufixo+"-":""}${dt.getFullYear()}${("0"+(dt.getMonth()+1)).slice(-2)}${("0"+dt.getDate()).slice(-2)}-${("0"+dt.getHours()).slice(-2)}${("0"+dt.getMinutes()).slice(-2)}.json`;
    a.href=url; a.download=nome;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch(e){ /* segue mesmo se falhar */ }
}

async function limparArea(area){
  const nomes={calendario:"Calendário (eventos e reuniões)",relatorios:"Relatórios Gerenciais",atendimentos:"Atendimentos",comunicados:"Comunicados",gravacoes:"Gravações & Atas",notas:"Notas"};
  if(!confirm(`Apagar TODOS os registros de "${nomes[area]}"? Esta ação não pode ser desfeita.`)) return;
  if(!confirm("Confirmação final: deseja mesmo apagar? Os dados serão perdidos.")) return;
  let qtd=0;
  try{
    if(area==="calendario"){
      for(const uid of PESSOAS_AGENDAVEIS){
        try{ const d=await loadEventos(uid); qtd+=(d.events||[]).length; await saveEventos(uid,{events:[]}); }catch(e){}
      }
    } else if(area==="relatorios"){
      const d=await loadRelatorios(); qtd=(d.list||[]).length;
      for(const r of (d.list||[])){ if(r&&r.id) try{ await _relApagarFotos(r.id); }catch(e){} }
      await saveRelatorios({list:[]}, {substituirTudo:true});
    } else if(area==="atendimentos"){
      const d=await loadAtend(); qtd=(d.registros||[]).length; await saveAtend({registros:[]});
      try{ await saveComManual({registros:[]}); }catch(e){}
    } else if(area==="comunicados"){
      try{ const c=await storeGet("mafra:comunicados"); const arr=c?JSON.parse(c):[]; qtd=arr.length; }catch(e){}
      await storeSet("mafra:comunicados", JSON.stringify([]));
      try{ await saveComManual({registros:[]}); }catch(e){}
    } else if(area==="gravacoes"){
      try{ const g=await storeGet("mafra:gravacoes"); const arr=g?JSON.parse(g):[]; qtd=arr.length; }catch(e){}
      await storeSet("mafra:gravacoes", JSON.stringify([]));
    } else if(area==="notas"){
      for(const uid of Object.keys(USUARIOS)){
        try{ const v=await storeGet("mafra:notas:"+uid); if(v){ qtd+=(JSON.parse(v)||[]).length; await storeSet("mafra:notas:"+uid, JSON.stringify([])); } }catch(e){}
      }
    }
  }catch(e){}
  alert(`"${nomes[area]}" limpo! ${qtd} registro(s) removido(s).`);
  render();
}

function openUsuario(uid){
  const editing=!!uid;
  const u = editing ? USUARIOS[uid] : {nome:"",cargo:"",tipo:"funcionario",cor:"#2D6CDF",senha:"mafra2026"};
  const base = editing && USUARIOS_BASE[uid]; // usuário base não pode trocar o login
  const tipos=[["sindico","Síndico Operacional"],["funcionario","Funcionário(a)"],["gestor","Gestor de Condomínio"],["helpdesk","Help Condo"],["master","Master (vê todos)"]]
    .map(([v,l])=>`<option value="${v}" ${u.tipo===v?"selected":""}>${l}</option>`).join("");
  const grupoAtual=(u.tipo==="gestor" && SUBCONDOMINIOS[u.condominio]) ? u.condominio : "";
  const grupoOpts=`<option value="">— Nenhum (um condomínio só) —</option>`+Object.keys(SUBCONDOMINIOS).map(p=>`<option value="${esc(p)}" ${p===grupoAtual?"selected":""}>⭐ ${esc(p)} — grupo completo (${SUBCONDOMINIOS[p].join(" · ")})</option>`).join("");
  const condOpt=`<option value="">Selecione o condomínio…</option>`+condOptionsAgrupadas(grupoAtual?"":u.condominio);
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>${editing?"Editar usuário":"Novo usuário"}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="field"><label>Nome completo</label><input id="uNome" value="${esc(u.nome)}" placeholder="Ex.: Maria Souza"></div>
      <div class="field"><label>Login (usuário) ${base?'<small style="font-weight:400;text-transform:none">— não editável</small>':''}</label>
        <input id="uLogin" value="${editing?uid:''}" ${editing?'disabled':''} placeholder="ex.: maria (sem espaços, minúsculo)"></div>
      <div class="field"><label>Tipo de acesso</label><select id="uTipo" onchange="toggleCondGestor(this.value)">${tipos}</select></div>
      <div class="field" id="grupoGestorWrap" style="${u.tipo==='gestor'?'':'display:none'}"><label>Acesso a grupo completo</label><select id="uGrupo" onchange="toggleGrupoGestor(this.value)">${grupoOpts}</select><small style="display:block;margin-top:4px;color:#8a93a3;text-transform:none;font-weight:400">⭐ Use para gerente e administrativos do Le Monde / Trio: vêem os 3 subcondomínios como um só.</small></div>
      <div class="field" id="condGestorWrap" style="${(u.tipo==='gestor' && !grupoAtual)?'':'display:none'}"><label>Condomínio do gestor</label><select id="uCondominio">${condOpt}</select></div>
      <div class="field"><label>Função / cargo</label><input id="uCargo" value="${esc(u.cargo||'')}" placeholder="Ex.: Gestor de Condomínio"></div>
      <div class="row2">
        <div class="field"><label>Senha</label><input id="uSenha" value="${esc(u.senha||'')}" placeholder="senha de acesso"></div>
        <div class="field"><label>Cor na agenda</label><input id="uCor" type="color" value="${u.cor||'#2D6CDF'}" style="height:44px;padding:4px"></div>
      </div>
      <div class="modal-foot">
        ${(editing && !base)?`<button class="btn-del" onclick="delUsuario('${uid}')">Excluir</button>`:`<button class="btn-cancel" onclick="closeModal()">Cancelar</button>`}
        <button class="btn-primary" style="flex:1" onclick="salvarUsuario('${editing?uid:''}')">Salvar</button>
      </div>
    </div></div></div>`;
}

function toggleCondGestor(tipo){
  const g=document.getElementById("grupoGestorWrap"); if(g) g.style.display = tipo==="gestor" ? "" : "none";
  const gv=document.getElementById("uGrupo"); const w=document.getElementById("condGestorWrap");
  if(w) w.style.display = (tipo==="gestor" && !(gv&&gv.value)) ? "" : "none";
}
function toggleGrupoGestor(grupo){
  const w=document.getElementById("condGestorWrap"); if(w) w.style.display = grupo ? "none" : "";
}

async function salvarUsuario(uidExist){
  const nome=document.getElementById("uNome").value.trim();
  const cargo=document.getElementById("uCargo").value.trim();
  const tipo=document.getElementById("uTipo").value;
  const senha=document.getElementById("uSenha").value.trim();
  const cor=document.getElementById("uCor").value;
  const grupoEl=document.getElementById("uGrupo");
  const grupoSel=(tipo==="gestor" && grupoEl) ? grupoEl.value : "";
  let condominio=tipo==="gestor" ? (grupoSel || document.getElementById("uCondominio").value) : "";
  let condominiosGrupo=null;
  if(condominio.indexOf("__grupo:")===0) condominio=condominio.slice(8);
  if(tipo==="gestor" && condominio && SUBCONDOMINIOS[condominio]) condominiosGrupo=subsCompletos(condominio);
  let login = uidExist || document.getElementById("uLogin").value.trim().toLowerCase().replace(/[^a-z0-9]/g,"");
  if(!nome){alert("Informe o nome.");return;}
  if(!login){alert("Informe o login (usuário).");return;}
  if(!senha){alert("Informe a senha.");return;}
  if(tipo==="gestor" && !condominio){alert("Selecione o condomínio do gestor.");return;}
  if(!uidExist && USUARIOS[login]){alert("Já existe um usuário com esse login. Escolha outro.");return;}
  const novoU={senha,nome,tipo,cargo:cargo||(tipo==="gestor"?"Gestor de Condomínio":""),cor,condominio};
  if(condominiosGrupo && condominiosGrupo.length) novoU.condominios=condominiosGrupo;
  USUARIOS[login]=novoU;
  gruposDinamicos();
  await salvarUsuariosExtra();
  closeModal(); render();
}

async function delUsuario(uid){
  if(USUARIOS_BASE[uid]){ alert("Este é um usuário original do sistema e não pode ser excluído. Você pode editar a função dele."); return; }
  if(!confirm("Excluir o usuário "+(USUARIOS[uid]?USUARIOS[uid].nome:uid)+"?"))return;
  delete USUARIOS[uid];
  gruposDinamicos();
  await salvarUsuariosExtra();
  closeModal(); render();
}

function openCondominio(){
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>${ico('predio')} Novo condomínio</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="field"><label>Nome do condomínio</label><input id="cNome" placeholder="Ex.: Residencial Aurora"></div>
      <div class="modal-foot"><button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="btn-primary" style="flex:1" onclick="salvarCondominio()">Adicionar</button></div>
    </div></div></div>`;
}

async function salvarCondominio(){
  const nome=document.getElementById("cNome").value.trim();
  if(!nome){alert("Informe o nome.");return;}
  if(CONDOMINIOS.includes(nome)){alert("Esse condomínio já existe.");return;}
  CONDOMINIOS.push(nome);
  await salvarCondominiosExtra();
  closeModal(); render();
}

async function delCondominio(nome){
  if(!confirm("Remover o condomínio "+nome+"? (não apaga tarefas já lançadas)\n\nA calibração de endereço deste condomínio também será apagada."))return;
  CONDOMINIOS=CONDOMINIOS.filter(c=>c!==nome);
  await salvarCondominiosExtra();
  // limpa também a calibração geofence
  try{
    const geos=await loadCondGeo();
    if(geos[nome]){ delete geos[nome]; await saveCondGeo(geos); }
  }catch(e){}
  render();
}


