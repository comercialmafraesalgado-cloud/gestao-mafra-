/* ============================================================
   GESTÃO MAFRA — ABA METRICAS
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: metRange, coletarMetricas, _metStatusRel, _metMesRef, renderMetricas, exportarMetricasPDF */

function metRange(per){
  const now=new Date(); const y=now.getFullYear(), m=now.getMonth();
  let ini;
  if(per==="dia") ini=new Date(y,m,now.getDate());
  else if(per==="semana") ini=mondayOfDate(now);
  else if(per==="trimestre") ini=new Date(y,Math.floor(m/3)*3,1);
  else if(per==="semestre") ini=new Date(y,(m<6?0:6),1);
  else if(per==="ano") ini=new Date(y,0,1);
  else ini=new Date(y,m,1); // mês (padrão)
  ini.setHours(0,0,0,0);
  const fim=new Date(); fim.setHours(23,59,59,999);
  return {ini, fim, iniMs:ini.getTime(), fimMs:fim.getTime()};
}

async function coletarMetricas(per){
  const {ini,fim,iniMs,fimMs}=metRange(per);
  const ehGestor=state.user.tipo==="gestor";
  const gCond=ehGestor?(state.user.condominio||""):"";
  const inRange=ts=>!!ts && ts>=iniMs && ts<=fimMs;
  const dataInRange=dstr=>{ if(!dstr) return false; const t=new Date(dstr+"T12:00:00").getTime(); return t>=iniMs && t<=fimMs; };

  let relatorios=[];
  try{ const d=await loadRelatorios(); (d.list||[]).forEach(r=>{
    const enviado=(r.status==="publicado")||((r.status||"").indexOf("enviado")===0)||(r.status==="em_aprovacao")||(r.status==="aprovado");
    if(!enviado) return;
    const quando=r.publicadoEm||r.enviadoEm;
    if(!inRange(quando)) return;
    if(ehGestor && !gestorCobre(r.condominio)) return;
    relatorios.push({condominio:r.condominio, mesRef:r.mesRef, status:r.status, quando, criadoPor:r.criadoPor});
  }); }catch(e){}

  let visitas=[];
  try{ const d=await loadCheckins(); (d.registros||[]).forEach(r=>{
    if(r.interno) return; // Escritório Mafra / Home Office não contam como visita a condomínio
    if(!inRange(r.checkIn)) return;
    if(ehGestor && !gestorCobre(r.condominio)) return;
    visitas.push({uid:r.uid, condominio:r.condominio, checkIn:r.checkIn, checkOut:r.checkOut, auto24:!!r.checkOutAuto24, resumo:r.resumo||r.obsSaida||r.obs, apoiaSindico:r.apoiaSindico});
  }); }catch(e){}

  let chamados=[];
  try{ const d=await loadChamados(); (d.list||[]).forEach(c=>{
    const quando=c.criadoEm||(c.dataHora?new Date(c.dataHora).getTime():null);
    if(!inRange(quando)) return;
    if(ehGestor && !gestorCobre(c.condominio)) return;
    chamados.push({titulo:c.titulo, condominio:c.condominio, prioridade:c.prioridade, status:c.status, solicitanteNome:c.solicitanteNome, data:c.data, hora:c.hora, quando});
  }); }catch(e){}

  let reunioes=[]; const vistos={};
  for(const uid of Object.keys(USUARIOS)){
    let ev; try{ ev=await loadEventos(uid); }catch(e){ continue; }
    (ev.events||[]).forEach(e=>{
      if(!e.finalizado) return;
      if(e.tipo==="bloqueio"||e.tipo==="ferias") return;
      if(!dataInRange(e.date)) return;
      const key=e.gid||e.id; if(vistos[key]) return; vistos[key]=1;
      const team=(e.participantes||[]).filter(p=>p.tipo==="equipe").map(p=>p.id);
      if(ehGestor){
        const euParticipa=team.includes(state.userId)||e.criadoPor===state.userId;
        const assembCond=e.assembleia && gestorCobre(e.assembleia.condominio);
        if(!euParticipa && !assembCond) return;
      }
      const teamNomes=team.filter(id=>USUARIOS[id]).map(id=>USUARIOS[id].nome);
      reunioes.push({title:e.title, date:e.date, start:e.start, end:e.end, tipo:e.tipo, team, teamNomes, finalizadoEm:e.finalizadoEm, condominioRef:(e.assembleia&&e.assembleia.condominio)||""});
    });
  }
  let ocorrencias=[];
  try{ const d=await loadOcorrencias(); (d.list||[]).forEach(o=>{
    const quando=o.criadoEm||o.ts;
    if(!inRange(quando)) return;
    if(ehGestor && !gestorCobre(o.condominio)) return;
    ocorrencias.push({titulo:o.titulo, condominio:o.condominio, tipo:o.tipo, status:o.status, prioridade:o.prioridade, autor:o.anonimo?"Anônimo":(o.autorNome||""), criadoPorUid:o.criadoPorUid, quando, envolveMorador:o.envolveMorador, moradorNome:o.moradorNome});
  }); }catch(e){}

  const porUsuario={};
  reunioes.forEach(r=>r.team.forEach(id=>{ porUsuario[id]=(porUsuario[id]||0)+1; }));
  return {ini, fim, relatorios, visitas, chamados, reunioes, ocorrencias, porUsuario};
}

function _metStatusRel(s){
  if(s==="publicado") return "Publicado no grupo";
  if(s==="aprovado") return "Aprovado";
  if(s==="reprovado") return "Em ajustes";
  return "Enviado p/ análise";
}

function _metMesRef(mr){ try{ return (typeof mesRefLabel==="function" && mr)?mesRefLabel(mr):(mr||""); }catch(e){ return mr||""; } }

async function renderMetricas(){
  const view=document.getElementById("view");
  view.innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  if(!state.metPer) state.metPer="mes";
  const per=state.metPer;
  const m=await coletarMetricas(per);
  const ehGestor=state.user.tipo==="gestor";
  const fmtDH=ts=>ts?new Date(ts).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—";
  const fmtHora=ts=>ts?new Date(ts).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}):"—";
  const fmtBrData=d=>d?d.split("-").reverse().join("/"):"—";
  const perLbl=(MET_PERIODOS.find(p=>p[0]===per)||["","Mês"])[1];
  const rangeLbl=`${m.ini.toLocaleDateString("pt-BR")} – ${m.fim.toLocaleDateString("pt-BR")}`;
  const nomeDe=id=>USUARIOS[id]?USUARIOS[id].nome:(id||"—");
  const respVis=v=>(v.apoiaSindico||v.uid); // visita do João conta para a Milena

  // ---- filtros (condomínio + responsável) ----
  const fc=state.metCond||""; const fr=state.metResp||"";
  const fRel=m.relatorios.filter(r=>(!fc||r.condominio===fc)&&(!fr||r.criadoPor===fr));
  const fVis=m.visitas.filter(v=>(!fc||v.condominio===fc)&&(!fr||respVis(v)===fr));
  const fCha=m.chamados.filter(c=>(!fc||c.condominio===fc)&&(!fr||c.solicitante===fr));
  const fReu=m.reunioes.filter(r=>(!fc||r.condominioRef===fc)&&(!fr||(r.team||[]).includes(fr)));
  const fOcr=(m.ocorrencias||[]).filter(o=>(!fc||o.condominio===fc)&&(!fr||o.criadoPorUid===fr));

  // opções dos selects
  const condsFiltro = ehGestor ? condsDoGestor() : CONDOMINIOS.slice();
  const pessoasFiltro = equipeMafraIds();
  const optCond=`<option value="">Todos os condomínios</option>`+condsFiltro.map(c=>`<option value="${esc(c)}" ${fc===c?"selected":""}>${esc(c)}</option>`).join("");
  const optResp=`<option value="">Toda a equipe</option>`+pessoasFiltro.map(id=>`<option value="${esc(id)}" ${fr===id?"selected":""}>${esc(nomeDe(id))}</option>`).join("");

  let html=`<div class="weeknav">
    <div><h2>📈 Métricas</h2><div class="range">Histórico (${perLbl}) · ${rangeLbl}${ehGestor?` · ${esc(state.user.condominio||"")}`:""}</div></div>
    <div class="spacer"></div>
    <button class="btn-gold" onclick="exportarMetricasPDF()">⬇️ Exportar PDF</button>
  </div>`;
  html+=`<div class="met-pers">`+MET_PERIODOS.map(([k,l])=>`<button class="met-per ${per===k?'on':''}" onclick="state.metPer='${k}';render()">${l}</button>`).join("")+`</div>`;
  // barra de filtros
  html+=`<div class="met-filtros">
    <div class="met-filtro"><label>Condomínio</label><select onchange="state.metCond=this.value;render()">${optCond}</select></div>
    <div class="met-filtro"><label>Responsável / equipe</label><select onchange="state.metResp=this.value;render()">${optResp}</select></div>
    ${(fc||fr)?`<button class="btn-ghost" onclick="state.metCond='';state.metResp='';render()">Limpar filtros</button>`:""}
  </div>`;

  html+=`<div class="metabar" style="grid-template-columns:repeat(5,1fr)">
    <div class="meta-item"><span class="lbl">Relatórios enviados</span><span class="val">${fRel.length}</span></div>
    <div class="meta-item"><span class="lbl">Visitas (check-ins)</span><span class="val">${fVis.length}</span></div>
    <div class="meta-item"><span class="lbl">Chamados Help Condo</span><span class="val">${fCha.length}</span></div>
    <div class="meta-item"><span class="lbl">Reuniões realizadas</span><span class="val">${fReu.length}</span></div>
    <div class="meta-item"><span class="lbl">Ocorrências</span><span class="val">${fOcr.length}</span></div>
  </div>`;
  const tabela=(titulo,head,linhas)=>`<div class="met-sec"><h3>${titulo}</h3>${linhas.length?`<div class="met-table-wrap"><table class="met-table"><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${linhas.join("")}</tbody></table></div>`:`<div class="met-empty">Nada registrado no período.</div>`}</div>`;

  // ---- RESUMOS (soma de cada um) ----
  const bump=(map,key,f)=>{ if(!key) return; (map[key]=map[key]||{rel:0,vis:0,cha:0,reu:0,ocr:0})[f]++; };
  const condMap={}, persMap={};
  fRel.forEach(r=>{ bump(condMap,r.condominio,'rel'); bump(persMap,r.criadoPor,'rel'); });
  fVis.forEach(v=>{ bump(condMap,v.condominio,'vis'); bump(persMap,respVis(v),'vis'); });
  fCha.forEach(c=>{ bump(condMap,c.condominio,'cha'); bump(persMap,c.solicitante,'cha'); });
  fReu.forEach(r=>{ if(r.condominioRef) bump(condMap,r.condominioRef,'reu'); (r.team||[]).forEach(id=>bump(persMap,id,'reu')); });
  fOcr.forEach(o=>{ bump(condMap,o.condominio,'ocr'); bump(persMap,o.criadoPorUid,'ocr'); });
  const totalDe=o=>o.rel+o.vis+o.cha+o.reu+(o.ocr||0);
  const condResumo=Object.entries(condMap).sort((a,b)=>totalDe(b[1])-totalDe(a[1]))
    .map(([c,o])=>`<tr><td>${esc(c)}</td><td>${o.rel}</td><td>${o.vis}</td><td>${o.cha}</td><td>${o.reu}</td><td>${o.ocr||0}</td><td><b>${totalDe(o)}</b></td></tr>`);
  const persResumo=Object.entries(persMap).sort((a,b)=>totalDe(b[1])-totalDe(a[1]))
    .map(([id,o])=>`<tr><td>${esc(nomeDe(id))}</td><td>${o.rel}</td><td>${o.vis}</td><td>${o.cha}</td><td>${o.reu}</td><td>${o.ocr||0}</td><td><b>${totalDe(o)}</b></td></tr>`);
  html+=tabela(""+ico('predio')+" Resumo por condomínio",["Condomínio","Relatórios","Visitas","Chamados","Reuniões","Ocorrências","Total"],condResumo);
  html+=tabela("👥 Resumo por responsável / equipe",["Pessoa","Relatórios","Visitas","Chamados","Reuniões","Ocorrências","Total"],persResumo);

  // ---- DETALHE de cada item ----
  const relRows=fRel.slice().sort((a,b)=>b.quando-a.quando).map(r=>`<tr><td>${esc(r.condominio||"")}</td><td>${esc(nomeDe(r.criadoPor))}</td><td>${esc(_metMesRef(r.mesRef))}</td><td>${_metStatusRel(r.status)}</td><td>${fmtDH(r.quando)}</td></tr>`);
  html+=tabela("📄 Relatórios gerenciais enviados",["Condomínio","Responsável","Mês ref.","Status","Quando"],relRows);

  const visRows=fVis.slice().sort((a,b)=>b.checkIn-a.checkIn).map(v=>{
    let nome=nomeDe(v.uid); if(v.apoiaSindico&&USUARIOS[v.apoiaSindico]) nome=USUARIOS[v.apoiaSindico].nome+" (via "+(USUARIOS[v.uid]?USUARIOS[v.uid].nome.split(" ")[0]:v.uid)+")";
    const dur=v.checkOut?Math.round((v.checkOut-v.checkIn)/60000):null;
    const durTxt=dur!=null?(dur>=60?(Math.floor(dur/60)+"h"+(dur%60?(" "+(dur%60)+"min"):"")):(dur+"min")):"—";
    return `<tr><td>${esc(nome)}</td><td>${esc(v.condominio||"")}</td><td>${fmtDH(v.checkIn)}</td><td>${v.checkOut?fmtHora(v.checkOut)+(v.auto24?' <span title="Fechado automaticamente após 24h sem check-out" style="font-size:10px;color:#B45309;font-weight:700">auto 24h</span>':""):"em aberto"}</td><td>${durTxt}</td></tr>`;
  });
  html+=tabela(""+ico('local')+" Visitas dos síndicos (check-ins)",["Síndico","Condomínio","Entrada","Saída","Duração"],visRows);

  const chRows=fCha.slice().sort((a,b)=>b.quando-a.quando).map(c=>`<tr><td>${esc(c.titulo||"")}</td><td>${esc(c.condominio||"")}</td><td>${esc(c.solicitanteNome||"")}</td><td>${fmtBrData(c.data)}${c.hora?(" "+esc(c.hora)):""}</td><td>${esc((c.status||"").replace(/_/g," "))}</td></tr>`);
  html+=tabela("🛠 Chamados Help Condo",["Assunto","Condomínio","Solicitante","Data/Hora","Status"],chRows);

  const reuRows=fReu.slice().sort((a,b)=>(a.date<b.date?1:-1)).map(r=>`<tr><td>${esc(r.title||"Reunião")}</td><td>${tipoLabel(r.tipo)}</td><td>${fmtBrData(r.date)}</td><td>${esc(r.start||"")}${r.end?("–"+esc(r.end)):""}</td><td>${esc(r.teamNomes.map(n=>n.split(" ")[0]).join(", "))}</td></tr>`);
  html+=tabela(""+ico('calendario')+" Reuniões realizadas",["Reunião","Tipo","Data","Horário","Participantes"],reuRows);

  const ocrRows=fOcr.slice().sort((a,b)=>b.quando-a.quando).map(o=>`<tr><td>${esc(o.titulo||"")}</td><td>${o.tipo==="ocorrencia"?"Ocorrência":"Reclamação"}</td><td>${esc(o.condominio||"")}</td><td>${o.autor?esc(o.autor):"Anônimo"}</td><td>${esc(stStatusLbl(o.status))}</td><td>${fmtDH(o.quando)}</td></tr>`);
  html+=tabela("🚨 Ocorrências & reclamações",["Assunto","Tipo","Condomínio","Autor","Situação","Quando"],ocrRows);

  view.innerHTML=html;
  // guarda o estado filtrado para o PDF
  window.__metFiltrado={fRel,fVis,fCha,fReu,fOcr,condResumo:condMap,persResumo:persMap,fc,fr,perLbl,rangeLbl};
}

function exportarMetricasPDF(){
  coletarMetricas(state.metPer||"mes").then(m=>{
    const per=state.metPer||"mes";
    const perLbl=(MET_PERIODOS.find(p=>p[0]===per)||["","Mês"])[1];
    const ehGestor=state.user.tipo==="gestor";
    const fmtDH=ts=>ts?new Date(ts).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):"—";
    const fmtHora=ts=>ts?new Date(ts).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}):"—";
    const fmtBrData=d=>d?d.split("-").reverse().join("/"):"—";
    const rangeLbl=`${m.ini.toLocaleDateString("pt-BR")} – ${m.fim.toLocaleDateString("pt-BR")}`;
    const nomeDe=id=>USUARIOS[id]?USUARIOS[id].nome:(id||"—");
    const respVis=v=>(v.apoiaSindico||v.uid);
    // mesmos filtros da tela
    const fc=state.metCond||""; const fr=state.metResp||"";
    const fRel=m.relatorios.filter(r=>(!fc||r.condominio===fc)&&(!fr||r.criadoPor===fr));
    const fVis=m.visitas.filter(v=>(!fc||v.condominio===fc)&&(!fr||respVis(v)===fr));
    const fCha=m.chamados.filter(c=>(!fc||c.condominio===fc)&&(!fr||c.solicitante===fr));
    const fReu=m.reunioes.filter(r=>(!fc||r.condominioRef===fc)&&(!fr||(r.team||[]).includes(fr)));
  const fOcr=(m.ocorrencias||[]).filter(o=>(!fc||o.condominio===fc)&&(!fr||o.criadoPorUid===fr));
    const filtroLbl=[fc?("Condomínio: "+fc):"", fr?("Responsável: "+nomeDe(fr)):""].filter(Boolean).join(" · ");
    // resumos
    const bump=(map,key,f)=>{ if(!key) return; (map[key]=map[key]||{rel:0,vis:0,cha:0,reu:0,ocr:0})[f]++; };
    const condMap={}, persMap={};
    fRel.forEach(r=>{ bump(condMap,r.condominio,'rel'); bump(persMap,r.criadoPor,'rel'); });
    fVis.forEach(v=>{ bump(condMap,v.condominio,'vis'); bump(persMap,respVis(v),'vis'); });
    fCha.forEach(c=>{ bump(condMap,c.condominio,'cha'); bump(persMap,c.solicitante,'cha'); });
    fReu.forEach(r=>{ if(r.condominioRef) bump(condMap,r.condominioRef,'reu'); (r.team||[]).forEach(id=>bump(persMap,id,'reu')); });
  fOcr.forEach(o=>{ bump(condMap,o.condominio,'ocr'); bump(persMap,o.criadoPorUid,'ocr'); });
    const totalDe=o=>o.rel+o.vis+o.cha+o.reu+(o.ocr||0);
    const condResumo=Object.entries(condMap).sort((a,b)=>totalDe(b[1])-totalDe(a[1])).map(([c,o])=>`<tr><td>${esc(c)}</td><td>${o.rel}</td><td>${o.vis}</td><td>${o.cha}</td><td>${o.reu}</td><td>${o.ocr||0}</td><td><b>${totalDe(o)}</b></td></tr>`).join("");
    const persResumo=Object.entries(persMap).sort((a,b)=>totalDe(b[1])-totalDe(a[1])).map(([id,o])=>`<tr><td>${esc(nomeDe(id))}</td><td>${o.rel}</td><td>${o.vis}</td><td>${o.cha}</td><td>${o.reu}</td><td>${o.ocr||0}</td><td><b>${totalDe(o)}</b></td></tr>`).join("");
    // detalhes
    const relRows=fRel.slice().sort((a,b)=>b.quando-a.quando).map(r=>`<tr><td>${esc(r.condominio||"")}</td><td>${esc(nomeDe(r.criadoPor))}</td><td>${esc(_metMesRef(r.mesRef))}</td><td>${_metStatusRel(r.status)}</td><td>${fmtDH(r.quando)}</td></tr>`).join("");
    const visRows=fVis.slice().sort((a,b)=>b.checkIn-a.checkIn).map(v=>{ let nome=nomeDe(v.uid); if(v.apoiaSindico&&USUARIOS[v.apoiaSindico]) nome=USUARIOS[v.apoiaSindico].nome+" (via "+(USUARIOS[v.uid]?USUARIOS[v.uid].nome.split(" ")[0]:v.uid)+")"; const dur=v.checkOut?Math.round((v.checkOut-v.checkIn)/60000):null; const durTxt=dur!=null?(dur>=60?(Math.floor(dur/60)+"h"+(dur%60?(" "+(dur%60)+"min"):"")):(dur+"min")):"—"; return `<tr><td>${esc(nome)}</td><td>${esc(v.condominio||"")}</td><td>${fmtDH(v.checkIn)}</td><td>${v.checkOut?fmtHora(v.checkOut)+(v.auto24?' <span title="Fechado automaticamente após 24h sem check-out" style="font-size:10px;color:#B45309;font-weight:700">auto 24h</span>':""):"em aberto"}</td><td>${durTxt}</td></tr>`; }).join("");
    const chRows=fCha.slice().sort((a,b)=>b.quando-a.quando).map(c=>`<tr><td>${esc(c.titulo||"")}</td><td>${esc(c.condominio||"")}</td><td>${esc(c.solicitanteNome||"")}</td><td>${fmtBrData(c.data)}${c.hora?(" "+esc(c.hora)):""}</td><td>${esc((c.status||"").replace(/_/g," "))}</td></tr>`).join("");
    const reuRows=fReu.slice().sort((a,b)=>(a.date<b.date?1:-1)).map(r=>`<tr><td>${esc(r.title||"Reunião")}</td><td>${tipoLabel(r.tipo)}</td><td>${fmtBrData(r.date)}</td><td>${esc(r.start||"")}${r.end?("–"+esc(r.end)):""}</td><td>${esc(r.teamNomes.map(n=>n.split(" ")[0]).join(", "))}</td></tr>`).join("");
    const ocrRows=fOcr.slice().sort((a,b)=>b.quando-a.quando).map(o=>`<tr><td>${esc(o.titulo||"")}</td><td>${o.tipo==="ocorrencia"?"Ocorrência":"Reclamação"}</td><td>${esc(o.condominio||"")}</td><td>${o.autor?esc(o.autor):"Anônimo"}</td><td>${esc(stStatusLbl(o.status))}</td><td>${fmtDH(o.quando)}</td></tr>`).join("");
    const tb=(titulo,head,linhas)=>`<h2>${titulo}</h2><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${linhas||`<tr><td colspan="${head.length}">Nada no período</td></tr>`}</tbody></table>`;
    const win=window.open("","_blank");
    if(!win){ alert("Permita pop-ups para gerar o PDF."); return; }
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Métricas — Mafra Gestão</title>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important}
        body{font-family:'Montserrat',Arial,sans-serif;color:#16243D;padding:32px;max-width:880px;margin:0 auto}
        h1{font-size:21px;font-weight:800;margin:0 0 4px}
        .sub{color:#666;font-size:13px;margin-bottom:6px}
        .flt{color:#1f3354;font-size:12.5px;font-weight:700;margin-bottom:14px}
        .cards{display:flex;gap:10px;margin:16px 0}
        .card{flex:1;border:1px solid #ddd;border-radius:10px;padding:14px;text-align:center;border-top:3px solid #C9A24B}
        .card .v{font-size:24px;font-weight:800;color:#1f3354}
        .card .l{font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.3px}
        h2{font-size:15px;font-weight:700;margin:24px 0 8px;border-bottom:2px solid #C9A24B;padding-bottom:5px}
        table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:6px}
        th,td{border:1px solid #e3e6ea;padding:6px 8px;text-align:left}
        th{background:#16243D;color:#fff;font-weight:600}
        tr:nth-child(even){background:#f7f8fa}
        @media print{ .noprint{display:none} }
      </style></head><body>
      <h1>📈 Relatório de Métricas</h1>
      <div class="sub">Mafra Gestão Integrada · Período (${perLbl}): ${rangeLbl}${ehGestor?(" · "+esc(state.user.condominio||"")):""}</div>
      ${filtroLbl?`<div class="flt">Filtro aplicado — ${esc(filtroLbl)}</div>`:""}
      <div class="cards">
        <div class="card"><div class="v">${fRel.length}</div><div class="l">Relatórios enviados</div></div>
        <div class="card"><div class="v">${fVis.length}</div><div class="l">Visitas (check-ins)</div></div>
        <div class="card"><div class="v">${fCha.length}</div><div class="l">Chamados Help Condo</div></div>
        <div class="card"><div class="v">${fReu.length}</div><div class="l">Reuniões realizadas</div></div>
        <div class="card"><div class="v">${fOcr.length}</div><div class="l">Ocorrências</div></div>
      </div>
      ${tb(""+ico('predio')+" Resumo por condomínio",["Condomínio","Relatórios","Visitas","Chamados","Reuniões","Ocorrências","Total"],condResumo)}
      ${tb("👥 Resumo por responsável / equipe",["Pessoa","Relatórios","Visitas","Chamados","Reuniões","Ocorrências","Total"],persResumo)}
      ${tb("📄 Relatórios gerenciais enviados",["Condomínio","Responsável","Mês ref.","Status","Quando"],relRows)}
      ${tb(""+ico('local')+" Visitas dos síndicos (check-ins)",["Síndico","Condomínio","Entrada","Saída","Duração"],visRows)}
      ${tb("🛠 Chamados Help Condo",["Assunto","Condomínio","Solicitante","Data/Hora","Status"],chRows)}
      ${tb(""+ico('calendario')+" Reuniões realizadas",["Reunião","Tipo","Data","Horário","Participantes"],reuRows)}
      ${tb("🚨 Ocorrências & reclamações",["Assunto","Tipo","Condomínio","Autor","Situação","Quando"],ocrRows)}
      <p class="noprint" style="margin-top:24px;text-align:center"><button onclick="window.print()" style="padding:10px 20px;font-size:14px;background:#16243D;color:#fff;border:none;border-radius:8px;cursor:pointer">🖨️ Imprimir / Salvar como PDF</button></p>
      </body></html>`);
    win.document.close();
  });
}


