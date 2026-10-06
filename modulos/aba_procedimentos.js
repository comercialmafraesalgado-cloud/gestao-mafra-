/* ############################################################################
   ABA: MANUAL DE PROCEDIMENTOS  (build 71)
   Motor por ESQUEMA DE SEÇÕES — 4 tipos (comercial · residencial · misto · loteamento)
   Cada área com "como acionar" (empresa+telefone) + passo a passo padrão.
   Fotos com setas/números (① ② ③). Remover seção/item = "não se aplica" (reversível).
   Isolado sob #procRoot / _proc / pm-. Storage: mafra:proc:<condomínio>
   ############################################################################ */
/* ============================================================================
   MÓDULO: MANUAL DE PROCEDIMENTOS — por condomínio, por TIPO
   Motor por ESQUEMA DE SEÇÕES (comercial · residencial · misto · loteamento).
   Isolado sob #procRoot / prefixo _proc / pm-. Storage: mafra:proc:<condomínio>
   Cada condomínio guarda { nome, subtitulo, tipo, capa, secoes:[...] }.
   ============================================================================ */
var _procState={cond:null,model:null,edit:false,pending:null,pai:null};
var _procBIND=[],_procPBIND=[],_procTABIND=[];
function _procClone(o){return JSON.parse(JSON.stringify(o));}
function _procJsStr(s){return String(s==null?"":s).replace(/\\/g,"\\\\").replace(/'/g,"\\'");}
function _procStatusClass(v){var t=String(v||"").toLowerCase();if(t.indexOf("vál")>-1||t==="ok"||t==="válido")return "pm-s-ok";if(t.indexOf("venc")>-1||t.indexOf("não possui")>-1||t.indexOf("pendente")>-1)return "pm-s-danger";if(t.indexOf("andament")>-1||t.indexOf("verificar")>-1)return "pm-s-warn";return "";}
function _procM(){return _procState.model;}

var _PICONS={printer:'<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  home:'<path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/>',doc:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/>',
  pin:'<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/>',
  calendar:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/>',shield:'<path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6z"/>',
  userCheck:'<circle cx="10" cy="8" r="3.2"/><path d="M4 20c0-3.3 3-5 6-5s6 1.7 6 5"/><path d="M16 11l1.6 1.6L21 9"/>',
  user:'<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/>',
  building:'<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  wrench:'<path d="M15.5 7.5a3.6 3.6 0 0 1-4.6 4.5L5 18l1 1 6-5.9a3.6 3.6 0 0 1 4.5-4.6l-2.2 2.2 1.5 1.5z"/>',
  gavel:'<path d="M14 6l4 4M12 8l4 4"/><path d="M8.5 11.5 3 17l1 1 5.5-5.5"/><path d="M10 4l6 6M20 20h-7"/>',
  grid:'<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  chevron:'<path d="M6 9l6 6 6-6"/>',chevronR:'<path d="M9 6l6 6-6 6"/>',
  moon:'<path d="M20 14a8 8 0 1 1-9-11 6.5 6.5 0 0 0 9 11z"/>',alert:'<path d="M12 4 21 20H3z"/><path d="M12 10v5"/><circle cx="12" cy="17.5" r=".6" fill="currentColor"/>',
  check:'<path d="M5 12l4 4 10-10"/>',list:'<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>',
  drop:'<path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z"/>',flame:'<path d="M12 3c1 3 4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 2-4 .4 1 1 1.6 2 2 0-2 0-4-2-6z"/>',
  camera:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l1.5-3h5L16 7"/><circle cx="12" cy="13.5" r="3.4"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M17 4l2 2M15 6l2 2"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  truck:'<rect x="2" y="7" width="12" height="9" rx="1"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  box:'<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10"/>',monitor:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>',
  users:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.2 2.7-5 6-5s6 1.8 6 5"/><path d="M16 6a3 3 0 0 1 0 6M21 20c0-2.6-1.5-4.2-4-4.7"/>',
  send:'<path d="M22 3 2 11l7 3 3 7z"/><path d="M22 3 12 14"/>',clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
  hash:'<path d="M9 4 7 20M17 4l-2 16M4 9h16M4 15h16"/>',refresh:'<path d="M20 11a8 8 0 0 0-14-5M4 5v4h4"/><path d="M4 13a8 8 0 0 0 14 5M20 19v-4h-4"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',bolt:'<path d="M13 3 4 14h6l-1 7 9-11h-6z"/>',
  activity:'<path d="M3 12h4l2-6 4 12 2-6h4"/>',message:'<path d="M4 5h16v11H9l-4 3v-3H4z"/>',
  clip:'<rect x="7" y="4" width="10" height="16" rx="2"/><path d="M9 4h6v3H9z"/>',phone:'<path d="M4 5c0 8 7 15 15 15l1-3-4-2-2 2c-3-1.5-5-3.5-6-6l2-2-2-4z"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 8l5-5 5 5M12 3v12"/>',trash:'<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13"/>',
  arrow:'<path d="M7 17 17 7M9 7h8v8"/>',road:'<path d="M4 20 8 4M20 20 16 4M12 6v2M12 11v2M12 16v2"/>',
  pool:'<path d="M3 18c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1M6 15V6a2 2 0 0 1 4 0M14 15V6a2 2 0 0 1 4 0M6 9h4M14 9h4"/>',
  door:'<path d="M5 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17M3 21h16M12 12h.01"/>',fuel:'<rect x="4" y="4" width="9" height="16" rx="1"/><path d="M4 10h9M16 8l3 3v6a1.5 1.5 0 0 1-3 0v-4"/>',
  tree:'<path d="M12 22v-6M8 16a4 4 0 0 1-1-7 4 4 0 0 1 7-2 4 4 0 0 1 3 8"/>',snow:'<path d="M12 3v18M5 7l14 10M19 7 5 17M3 12h18"/>',
  cctv:'<path d="M3 7l14-3 1 4-14 3zM4 8l1 4M17 5l2 6 3-1-1-4M8 15v4M6 19h6"/>'
};
function _pico(n,s){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="'+(s||18)+'" height="'+(s||18)+'">'+(_PICONS[n]||_PICONS.check)+'</svg>';}

function _procBind(obj,key,ph){var i=_procBIND.push({obj:obj,key:key})-1;var v=obj[key];if(!_procState.edit)return '<span class="pm-tx">'+(esc(v)||(ph?'<span style="color:var(--pm-mut2)">'+esc(ph)+'</span>':""))+'</span>';return '<span class="pm-tx pm-ed" contenteditable="true" data-b="'+i+'" data-ph="'+esc(ph||"")+'">'+esc(v)+'</span>';}
function _procTA(obj,key,ph){var v=obj[key]||"";if(!_procState.edit)return '<div class="pm-ta-view">'+(esc(v).replace(/\n/g,"<br>")||'<span style="color:var(--pm-mut2)">'+esc(ph||"")+'</span>')+'</div>';var i=_procTABIND.push({obj:obj,key:key})-1;return '<textarea class="pm-ta" data-ta="'+i+'" rows="3" placeholder="'+esc(ph||"")+'">'+esc(v)+'</textarea>';}
function _procRm(x){return _procState.edit?'<button class="pm-rm" data-x="'+x+'" title="Remover">'+_pico("trash",15)+'</button>':"";}
function _procAdd(x,label){return _procState.edit?'<button class="pm-mini pm-add" data-x="'+x+'">＋ '+label+'</button>':"";}
function _procSecRm(i){return _procState.edit?'<button class="pm-secrm" data-x="secrm:'+i+'" title="Remover seção (não se aplica)">'+_pico("trash",14)+' remover seção</button>':"";}
function _procPhoto(obj,imgKey,capKey,ph){var src=obj[imgKey]||"";var media=src?'<div class="pm-ph-img" style="background-image:url(\''+src+'\')"></div>':'<div class="pm-ph-empty">'+_pico("camera",30)+'<span>'+(_procState.edit?"Adicionar foto":"Sem foto")+'</span></div>';var ctr="";if(_procState.edit){var i=_procPBIND.push({obj:obj,key:imgKey})-1;ctr='<div class="pm-ph-ctrls"><button class="pm-mini" data-photo="'+i+'">'+_pico("upload",14)+' Enviar</button>'+(src?'<button class="pm-mini danger" data-rmphoto="'+i+'">'+_pico("trash",14)+'</button>':"")+'</div>';}return '<figure class="pm-photo">'+media+ctr+'<figcaption>'+_procBind(obj,capKey,ph||"Legenda")+'</figcaption></figure>';}

async function loadProc(cond){try{var v=await storeGet("mafra:proc:"+cond);if(v)return JSON.parse(v);}catch(e){}return null;}
async function saveProc(cond,data){try{_storeCacheClear("mafra:proc:"+cond);}catch(e){}return await storeSet("mafra:proc:"+cond,JSON.stringify(data));}
function _procTouch(){var m=_procState.model;if(m){m.atualizadoEm=Date.now();m.atualizadoPor=(typeof state!=="undefined"&&state.userId)||"";}}
async function _procSave(){if(!_procState.cond||!_procState.model)return false;_procTouch();return await saveProc(_procState.cond,_procState.model);}
var _procSaveTimer=null;
function _procSaveDebounced(){if(_procSaveTimer)clearTimeout(_procSaveTimer);_procSaveTimer=setTimeout(function(){_procSave();_procFlash();},600);}
function _procFlash(){var el=document.getElementById("procSaved");if(el){el.style.opacity="1";setTimeout(function(){el.style.opacity="0";},1400);}}
var _procPhotoTarget=null,_procFileInput=null;
function _procEnsureFileInput(){if(_procFileInput)return;_procFileInput=document.createElement("input");_procFileInput.type="file";_procFileInput.accept="image/*";_procFileInput.style.display="none";document.body.appendChild(_procFileInput);_procFileInput.addEventListener("change",function(){var f=_procFileInput.files[0];if(!f||!_procPhotoTarget){return;}comprimirImagem(f,1280,0.8).then(function(r){if(r&&r.foto){_procPhotoTarget.obj[_procPhotoTarget.key]=r.foto;_procSave();_procRenderDetail();}});_procFileInput.value="";});}
function _procOpenPhoto(i){_procEnsureFileInput();_procPhotoTarget=_procPBIND[i];_procFileInput.value="";_procFileInput.click();}
/* ---- blocos por esquema (recebem seção + índice i) ---- */
/* ---- contatos estruturados: empresa · pessoa · departamento · telefone · e-mail ---- */
var _PROC_K_PESSOA=/(subs[íi]ndico|ger[êe]ncia|gerente|zelador|encarregado|coordena|respons[áa]vel|s[íi]ndico morador|contato|suporte|t[ée]cnico)/i;
function _procParseContato(r){
  if(r.empresa!==undefined||r.pessoa!==undefined) return r;      // já estruturado
  var v=String(r.v||""), email="", tel="";
  var mE=v.match(/[\w.+-]+@[\w-]+\.[\w.-]+/); if(mE){ email=mE[0]; v=v.replace(mE[0]," "); }
  var tels=v.match(/(0800[\s\d.-]{7,}|\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4})/g)||[];
  if(tels.length){ tel=tels.map(function(t){return t.trim();}).join(" / "); tels.forEach(function(t){ v=v.replace(t," "); }); }
  v=v.replace(/[·•|;]+/g," ").replace(/\s{2,}/g," ").replace(/^[\s.\-–—]+|[\s.\-–—]+$/g,"").trim();
  var pessoa="", empresa="";
  var mP=v.match(/^(.+?)\s*\((.+?)\)\s*$/);                       // "Ronny (Gatto & Martinussi)"
  if(mP){ pessoa=mP[1].trim(); empresa=mP[2].trim(); }
  else if(v && _PROC_K_PESSOA.test(String(r.k||""))) pessoa=v;    // cargo de pessoa
  else empresa=v;
  r.empresa=empresa; r.pessoa=pessoa; r.departamento=""; r.telefone=tel; r.email=email;
  return r;
}
function _procContatoVal(r){
  if(r.empresa===undefined&&r.pessoa===undefined) return String(r.v||"");
  var emp=r.empresa||"", pes=r.pessoa||"", dep=r.departamento||"";
  var quem = (pes&&emp) ? (pes+" ("+emp+")") : (emp||pes);
  if(dep) quem = quem ? (quem+" \u2014 "+dep) : dep;
  var p=[]; if(quem) p.push(quem);
  if(r.telefone) p.push(r.telefone);
  if(r.email) p.push(r.email);
  return p.join(" \u00B7 ") || String(r.v||"");
}
function _procGrupoContatos(g){ return !!(g && (g.contatos || (g.add && /contato|governan/i.test(String(g.titulo||""))))); }
function _procMigra(m){
  if(!m||!Array.isArray(m.secoes)) return m;
  /* --- upgrades estruturais (build 99): atualiza manuais JÁ SALVOS ao abrir --- */
  m.secoes.forEach(function(sec){
    if(!sec) return;
    // #2: seção de emergência da Mafra -> formato TABELA (Função / Responsável / Telefone)
    var _mafraHdr=["Função / Setor","Responsável","Telefone"];
    var _mafraSub="Quem acionar na Mafra em caso de emergência. Toque em ＋ Linha para adicionar.";
    var _mafraBase=["Central Mafra (plantão)","Mafra Gestão Integrada","(16) 99284-5898"];
    if(sec.tipo==="sistemas" && sec.titulo==="Quem acionar na emergência"){
      var _rows=[_mafraBase.slice()];
      (sec.itens||[]).forEach(function(it){ if(it && /gerador/i.test(String(it.titulo||""))) _rows.push(["Gerador", it.empresa||"", it.telefone||""]); });
      sec.tipo="table"; sec.icon="alert"; sec.titulo="Contatos de Emergência Mafra"; sec.sub=_mafraSub; sec.headers=_mafraHdr.slice(); sec.rows=_rows; try{ delete sec.itens; delete sec.grupos; }catch(e){}
    } else if(sec.tipo==="dl" && sec.titulo==="Contatos de Emergência Mafra"){
      var _rows=[];
      (sec.grupos||[]).forEach(function(g){ (g.rows||[]).forEach(function(r){ try{_procParseContato(r);}catch(e){} var _resp=r.pessoa||r.empresa||""; _rows.push([r.k||"", _resp, r.telefone||""]); }); });
      if(!_rows.length) _rows=[_mafraBase.slice()];
      sec.tipo="table"; sec.icon="alert"; sec.titulo="Contatos de Emergência Mafra"; sec.sub=_mafraSub; sec.headers=_mafraHdr.slice(); sec.rows=_rows; try{ delete sec.grupos; delete sec.itens; }catch(e){}
    }
    // #3a: renomear "Diretório de contatos" -> "Contatos de Emergência Utilidade Pública"
    if(sec.tipo==="table" && sec.titulo==="Diretório de contatos") sec.titulo="Contatos de Emergência Utilidade Pública";
    // #3b: acrescentar Defesa Civil (199) e Violência contra a mulher (180)
    if(sec.tipo==="table" && sec.titulo==="Contatos de Emergência Utilidade Pública" && Array.isArray(sec.rows)){
      if(!sec.rows.some(function(r){return r&&r[0]==="Defesa Civil";})) sec.rows.push(["Defesa Civil","Defesa Civil","199"]);
      if(!sec.rows.some(function(r){return r&&/Viol[e\u00EA]ncia contra a mulher/i.test(String(r[0]||""));})) sec.rows.push(["Violência contra a mulher","Central de Atendimento","180"]);
    }
    // #5: "Rondas do vigia" -> checklist com "Função" como rótulo das colunas
    if(sec.tipo==="checkcols" && /Rondas do vigia/i.test(String(sec.titulo||"")) && !sec.colLabel) sec.colLabel="Função";
    // #6: "Vistorias semanais" (steps) -> "Vistoria técnica" (vistorias: nome/periodicidade/descrição)
    if(sec.tipo==="steps" && /Vistorias semanais/i.test(String(sec.titulo||""))){
      sec.tipo="vistorias"; sec.titulo="Vistoria técnica";
      sec.itens=(sec.itens||[]).map(function(it){ return {nome:it.nome||it.titulo||"", freq:it.freq||"semanal", freqOutra:it.freqOutra||"", desc:it.desc||it.txt||""}; });
    }
    // #7: "Gestão de prestadores" (steps) -> checklist (checkcols)
    if(sec.tipo==="steps" && /Gest[ãa]o de prestadores/i.test(String(sec.titulo||""))){
      var _pit=(sec.itens||[]).map(function(it){ var t=String(it.nome||it.titulo||"").trim(), d=String(it.desc||it.txt||"").trim(); return (d&&d!==t)?(t+" — "+d):t; }).filter(Boolean);
      sec.tipo="checkcols"; if(!sec.colLabel) sec.colLabel="Grupo"; if(!sec.sub) sec.sub="Marque cada item ao acompanhar um prestador.";
      sec.cols=[{icon:"check",titulo:"Ao receber um prestador",itens:_pit.length?_pit:[""]}];
      try{ delete sec.itens; delete sec.stepIcon; }catch(e){}
    }
    // #4: "Contratos e fornecedores" -> coluna Vencimento (data) + coluna calculada "Expira em"
    if(sec.tipo==="table" && sec.titulo==="Contratos e fornecedores" && Array.isArray(sec.headers)){
      if(sec.headers.indexOf("Vencimento")===-1){
        var _at=Math.min(3, sec.headers.length);
        sec.headers.splice(_at,0,"Vencimento");
        (sec.rows||[]).forEach(function(r){ if(Array.isArray(r)) r.splice(_at,0,""); });
      }
      sec.venc=sec.headers.indexOf("Vencimento");
    }
    // #1b: limpar a menção a "registro de ocorrências" no cabeçalho da parte
    if(sec.tipo==="parte" && typeof sec.ptxt==="string" && sec.ptxt.indexOf("registro de ocorrências")>-1){
      sec.ptxt="Prestadores, contratos, laudos, salas e finanças.";
      if(Array.isArray(sec.chips)) sec.chips=sec.chips.filter(function(c){return c!=="Registro";});
    }
  });
  // #1a: remover a seção "Registro de ocorrências"
  m.secoes=m.secoes.filter(function(sec){ return !(sec && sec.titulo==="Registro de ocorrências"); });
  m.secoes.forEach(function(sec){
    if(sec && sec.tipo==="dl" && Array.isArray(sec.grupos)) sec.grupos.forEach(function(g){
      if(_procGrupoContatos(g)){ g.contatos=true; if(g.fixo===undefined) g.fixo=true; (g.rows||[]).forEach(_procParseContato); }
    });
    if(sec && sec.tipo==="sistemas" && Array.isArray(sec.itens)) sec.itens.forEach(function(it){
      if(it && it.marca===undefined) it.marca="";
      if(it && !Array.isArray(it.pessoas)) it.pessoas=[];
      if(it && !Array.isArray(it.fotos)) it.fotos=[];
    });
    if(sec && sec.tipo==="textblocks" && Array.isArray(sec.blocos)) sec.blocos.forEach(function(b){
      if(b && !Array.isArray(b.fotos)) b.fotos=[];
    });
    if(sec && sec.tipo==="stats" && !Array.isArray(sec.colaboradores)) sec.colaboradores=[];
  });
  return m;
}

function _procCalcPessoal(sec){
  var lista=Array.isArray(sec.colaboradores)?sec.colaboradores.filter(function(c){return c&&(c.nome||c.foto);}):[];
  if(!lista.length||!Array.isArray(sec.itens)) return lista;
  var org=0,ter=0;
  lista.forEach(function(c){ if(c.vinculo==="terceirizado") ter++; else org++; });
  sec.itens.forEach(function(it){
    var l=String(it.l||"").toLowerCase();
    if(l.indexOf("org")>-1) it.n=String(org);
    else if(l.indexOf("terceiriz")>-1) it.n=String(ter);
    else it.n=String(lista.length);
  });
  return lista;
}
function _procDataBR(d){ if(!d) return ""; var p=String(d).split("-"); return p.length===3?(p[2]+"/"+p[1]+"/"+p[0]):String(d); }
function _vencDiasTxt(iso){
  if(!iso) return null;
  var d=new Date(String(iso)+"T00:00:00"); if(isNaN(d.getTime())) return null;
  var hoje=new Date(); hoje.setHours(0,0,0,0);
  var dias=Math.round((d.getTime()-hoje.getTime())/86400000);
  if(dias<0) return {cls:"pm-s-danger",txt:"Vencido há "+(-dias)+(-dias===1?" dia":" dias")};
  if(dias===0) return {cls:"pm-s-danger",txt:"Expira hoje"};
  if(dias<=30) return {cls:"pm-s-warn",txt:"Faltam "+dias+(dias===1?" dia":" dias")};
  return {cls:"pm-s-ok",txt:"Faltam "+dias+" dias"};
}
function _vencBadge(iso){
  var r=_vencDiasTxt(iso);
  if(!r) return '<span class="pm-stx" style="background:transparent;color:var(--pm-mut2);padding-left:0">—</span>';
  return '<span class="pm-stx '+r.cls+'">'+r.txt+'</span>';
}
function _vencSituacao(iso){
  if(!iso) return null;
  var d=new Date(String(iso)+"T00:00:00"); if(isNaN(d.getTime())) return null;
  var hoje=new Date(); hoje.setHours(0,0,0,0);
  return (d.getTime()>=hoje.getTime())?{cls:"pm-s-ok",txt:"Válido"}:{cls:"pm-s-danger",txt:"Vencido"};
}
function _vencSituacaoHTML(iso){
  var r=_vencSituacao(iso);
  if(!r) return '<span class="pm-stx" style="background:transparent;color:var(--pm-mut2);padding-left:0">—</span>';
  return '<span class="pm-stx '+r.cls+'">'+r.txt+'</span>';
}
function _procPreenchimento(m){
  if(!m||!Array.isArray(m.secoes)) return {feitos:0,total:0,pct:0};
  var total=0, feitos=0;
  function vazio(v){ var x=String(v==null?"":v).trim().toLowerCase(); return !x||x==="preencher"||x==="—"||x==="dd/mm/aaaa"||x==="a preencher"; }
  function conta(v){ total++; if(!vazio(v)) feitos++; }
  conta(m.capa);
  m.secoes.forEach(function(sec){
    if(!sec) return; var t=sec.tipo;
    if(t==="dl"){ (sec.grupos||[]).forEach(function(g){ (g.rows||[]).forEach(function(r){ if(g.contatos||r.empresa!==undefined||r.pessoa!==undefined){ conta((r.pessoa||"")+(r.empresa||"")+(r.telefone||"")); } else conta(r.v); }); }); }
    else if(t==="sistemas"){ (sec.itens||[]).forEach(function(it){ conta(it.empresa); conta(it.telefone); }); }
    else if(t==="table"){ (sec.rows||[]).forEach(function(row){ if(!Array.isArray(row))return; row.forEach(function(cell,ci){ if(sec.venc!=null&&sec.status&&ci===row.length-1) return; conta(cell); }); }); }
    else if(t==="checkcols"){ (sec.cols||[]).forEach(function(c){ (c.itens||[]).forEach(function(it){ conta(it); }); }); }
    else if(t==="timeline"){ (sec.grupos||[]).forEach(function(g){ (g.rows||[]).forEach(function(r){ conta(r.txt); }); }); }
    else if(t==="steps"){ (sec.itens||[]).forEach(function(it){ conta(it.txt||it.titulo); }); }
    else if(t==="textblocks"){ (sec.blocos||[]).forEach(function(b){ conta(b.txt); }); }
    else if(t==="checklist"){ (sec.itens||[]).forEach(function(it){ conta(it.nome); }); }
    else if(t==="vistorias"){ (sec.itens||[]).forEach(function(it){ conta(it.nome); conta(it.desc); }); }
  });
  var pct= total? Math.round(feitos*100/total) : 0; if(pct>100) pct=100;
  return {feitos:feitos, total:total, pct:pct};
}
function _procPctBadge(m){
  var r=_procPreenchimento(m);
  var cor = r.pct>=100 ? "#2f7d5b" : (r.pct>=60 ? "#b8912f" : "#b8402f");
  return '<span class="pm-pct" title="'+r.feitos+' de '+r.total+' campos preenchidos" style="display:inline-flex;align-items:center;gap:7px;font-size:11.5px;font-weight:800;color:'+cor+';white-space:nowrap">'
    +'<span style="width:56px;height:6px;border-radius:99px;background:#e6eaf0;display:inline-block;overflow:hidden;vertical-align:middle"><span style="display:block;height:100%;width:'+r.pct+'%;background:'+cor+'"></span></span>'
    +r.pct+'%</span>';
}
function _procEdPctUpdate(){ var el=document.getElementById("procEdPct"); var m=_procM(); if(el&&m) el.innerHTML=_procPctBadge(m); }
function _procBlkDL(sec,i){
  var two=sec.grupos.length>1;
  var cards=sec.grupos.map(function(g,gi){
    var _ct=_procGrupoContatos(g);
    var rows=g.rows.map(function(r,j){
      var val=_ct ? '<span class="pm-tx">'+esc(_procContatoVal(r))+'</span>' : _procBind(r,"v","Valor");
      var lbl=_ct ? '<span class="pm-tx">'+esc(r.k||"Contato")+'</span>' : _procBind(r,"k","Rótulo");
      return '<div class="pm-dl-row"><div class="pm-dl-ic">'+_pico(r.icon||"doc",18)+'</div><div><div class="pm-dl-k">'+lbl+'</div><div class="pm-dl-v">'+val+'</div></div></div>';}).join("");
    return '<div class="pm-card"><div class="pm-label">'+_procBind(g,"titulo","Título")+'</div><div class="pm-dl">'+rows+'</div>'+(g.add?_procAdd("dladd:"+i+":"+gi,"Item"):"")+'</div>';
  }).join("");
  return '<div class="'+(two?"pm-grid2":"")+'">'+cards+'</div>';
}
function _procBlkTimeline(sec,i){
  var two=sec.grupos.length>1;
  var cards=sec.grupos.map(function(g,gi){
    var rows=g.rows.map(function(r,j){return '<div class="pm-tl-row"><div class="pm-tl-t">'+_procBind(r,"hora","h")+'</div><div class="pm-tl-x">'+_procBind(r,"txt","Descrição")+_procRm("tlrm:"+i+":"+gi+":"+j)+'</div></div>';}).join("");
    return '<div class="pm-card"><div class="pm-label">'+_procBind(g,"titulo","Título")+'</div><div class="pm-tl">'+rows+'</div>'+_procAdd("tladd:"+i+":"+gi,"Horário")+'</div>';
  }).join("");
  return '<div class="'+(two?"pm-grid2":"")+'">'+cards+'</div>';
}
function _procBlkChecks(sec,i){
  var cols=sec.cols.map(function(c,ci){
    var items=c.itens.map(function(it,j){return '<div class="pm-chk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="3.5"/></svg><span>'+_procBind(c.itens,j,"Item")+_procRm("chkrm:"+i+":"+ci+":"+j)+'</span></div>';}).join("");
    var ich=c.icon?'<span class="pm-ci">'+_pico(c.icon,17)+'</span>':"";
    return '<div class="pm-checkcol"><h5>'+ich+_procBind(c,"titulo","Título")+'</h5>'+items+_procAdd("chkadd:"+i+":"+ci,"Item")+'</div>';
  }).join("");
  return '<div class="pm-checkcols">'+cols+'</div>';
}
function _procBlkSteps(sec,i){
  var rows=sec.itens.map(function(s,j){var icn=sec.stepIcon?'<div class="pm-step-ic">'+_pico(s.icon||"check",22)+'</div>':'<div class="pm-step-n">'+(j+1)+'</div>';
    return '<div class="pm-step'+(sec.gold?" gold":"")+'">'+icn+'<div class="pm-step-c"><h5>'+_procBind(s,"titulo","Título")+_procRm("steprm:"+i+":"+j)+'</h5><p>'+_procBind(s,"txt","Descrição")+'</p></div></div>';}).join("");
  return '<div class="pm-steps">'+rows+'</div>'+_procAdd("stepadd:"+i,"Etapa");
}
function _procFreqLabel(f){ return {semanal:"Semanal",mensal:"Mensal",trimestral:"Trimestral",semestral:"Semestral",anual:"Anual",outra:"Personalizada"}[f]||f; }
function _procUnidLabel(u,q){ q=Number(q)||0; var m={dia:(q===1?"dia":"dias"),semana:(q===1?"semana":"semanas"),mes:(q===1?"mês":"meses"),ano:(q===1?"ano":"anos")}; return m[u]||u; }
function _procVistFreq(v){ if(!v) return ""; if(v.freq==="outra"){ var q=Number(v.freqQtd)||0, u=v.freqUnid||"mes"; if(q>0) return (q===1)?("A cada "+_procUnidLabel(u,1)):("A cada "+q+" "+_procUnidLabel(u,q)); return v.freqOutra||""; } if(v.freq) return _procFreqLabel(v.freq); return v.freqOutra||""; }
function _procBlkVistorias(sec,i){
  var rows=(sec.itens||[]).map(function(v,j){
    var fr=_procVistFreq(v);
    var badge=fr?'<span class="pm-stx pm-s-ok" style="margin-left:8px;vertical-align:middle">'+esc(fr)+'</span>':"";
    return '<div class="pm-step'+(sec.gold?" gold":"")+'"><div class="pm-step-ic">'+_pico("eye",22)+'</div><div class="pm-step-c"><h5>'+_procBind(v,"nome","Nome da vistoria")+badge+_procRm("visrm:"+i+":"+j)+'</h5><p>'+_procBind(v,"desc","Descrição")+'</p></div></div>';
  }).join("");
  return '<div class="pm-steps">'+rows+'</div>'+_procAdd("visadd:"+i,"Vistoria");
}
function _procBlkTable(sec,i){var ED=_procState.edit,st=sec.status;
  var head='<tr>'+(ED?'<th class="pm-trash"></th>':"")+sec.headers.map(function(h,k){var th='<th>'+_procBind(sec.headers,k,"Título")+'</th>';if(sec.venc!=null&&k===sec.venc)th+='<th>Expira em</th>';return th;}).join("")+'</tr>';
  var body=sec.rows.map(function(row,ri){
    var tds=row.map(function(cell,ci){
      if(sec.venc!=null&&ci===sec.venc){var dv=cell?esc(_procDataBR(cell)):'<span style="color:var(--pm-mut2)">—</span>';return '<td><span class="pm-tx">'+dv+'</span></td><td>'+_vencBadge(cell)+'</td>';}
      if(sec.venc!=null&&st&&ci===row.length-1){return '<td>'+_vencSituacaoHTML(row[sec.venc])+'</td>';}
      var last=ci===row.length-1;var cls=(st&&last)?_procStatusClass(cell):"";
      if(st&&last&&!ED)return '<td><span class="pm-stx '+cls+'">'+esc(cell)+'</span></td>';
      return '<td>'+(cls?'<span class="pm-stx '+cls+'">':"")+_procBind(row,ci,"—")+(cls?"</span>":"")+'</td>';}).join("");
    var rm=ED?'<td class="pm-trash"><button class="pm-rm" data-x="rowrm:'+i+':'+ri+'">'+_pico("trash",15)+'</button></td>':"";
    return '<tr>'+rm+tds+'</tr>';
  }).join("");
  var nota=sec.nota?'<div class="pm-hintbox">'+_procBind(sec,"nota","")+'</div>':"";
  return '<div class="pm-tblwrap"><table class="pm-tbl"><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div>'+_procAdd("rowadd:"+i,"Linha")+nota;
}
function _procBlkTextblocks(sec,i){
  var rows=sec.blocos.map(function(b,j){
    var fts=(Array.isArray(b.fotos)?b.fotos:[]).filter(function(f){return f&&f.img;});
    var fh=fts.length?'<div class="pm-photos'+(fts.length===1?" one":"")+'" style="margin-top:10px">'+fts.map(function(f){return '<figure class="pm-photo"><div class="pm-ph-img" style="background-image:url(\''+f.img+'\')"></div><figcaption>'+esc(f.cap||"")+'</figcaption></figure>';}).join("")+'</div>':"";
    return '<div class="pm-card pm-mini-card"><div class="pm-label">'+_procBind(b,"titulo","Título")+_procRm("tbrm:"+i+":"+j)+'</div><div class="pm-ta-view">'+_procBind(b,"txt","Texto")+'</div>'+fh+'</div>';
  }).join("");
  return '<div class="'+(sec.two?"pm-grid2":"")+'">'+rows+'</div>'+_procAdd("tbadd:"+i,"Bloco");
}
function _procBlkChecklist(sec,i){
  var itens=(sec.itens||[]).filter(function(it){return it&&(it.nome||it.qtd);});
  var head='<tr><th>Item</th><th style="width:110px">Qtd. cadastrada</th><th style="width:130px">Situação</th></tr>';
  var body=itens.map(function(it){
    var st=it.status==="nao"?'<span class="pm-stx pm-s-danger">Não conforme</span>':(it.status==="conforme"?'<span class="pm-stx pm-s-ok">Conforme</span>':'<span class="pm-stx">—</span>');
    return '<tr><td>'+esc(it.nome||"")+'</td><td>'+esc(it.qtd||"")+'</td><td>'+st+'</td></tr>';
  }).join("");
  var tab=itens.length?'<div class="pm-tblwrap"><table class="pm-tbl"><thead>'+head+'</thead><tbody>'+body+'</tbody></table></div>':'<div class="pm-hint">Nenhum item cadastrado.</div>';
  var loc=sec.local?'<div class="pm-hintbox" style="margin-bottom:10px;font-style:normal"><b>Ambiente:</b> '+esc(sec.local)+'</div>':"";
  var btn='<button class="pm-mini" style="margin-top:12px" onclick="_procChecklistPDF('+i+')">'+_pico("doc",14)+' Imprimir folha para assinatura</button>';
  return loc+tab+btn;
}
function _procChecklistPDF(i){
  var w=window.open("","_blank");
  var m=_procM(); if(!m||!w) return;
  var sec=(m.secoes||[])[i]; if(!sec) return;
  var itens=(sec.itens||[]).filter(function(it){return it&&it.nome;});
  var linhas=itens.map(function(it){
    return '<tr><td class="it">'+esc(it.nome)+'</td><td class="qt">'+esc(it.qtd||"")+'</td><td class="br"></td><td class="br"></td><td class="br"></td></tr>';
  }).join("");
  var amb=esc(sec.local||sec.titulo||"Área comum");
  var cond=esc(m.nome||"");
  var html='<!doctype html><html><head><meta charset="utf-8"><title>Checklist · '+amb+'</title><style>'
    +'@page{size:A4;margin:14mm}'
    +'*{box-sizing:border-box}body{margin:0;font-family:Georgia,\'Times New Roman\',serif;color:#17253f;font-size:12px}'
    +'.cab{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #17253f;padding-bottom:8px;margin-bottom:12px}'
    +'.cab h1{margin:0;font-size:17px;letter-spacing:.5px}.cab .sub{font-size:11px;color:#6a7688;margin-top:2px}'
    +'.marca{font-size:10px;text-align:right;color:#6a7688;line-height:1.5}.marca b{color:#17253f;display:block;font-size:12px}'
    +'.ident{display:flex;flex-wrap:wrap;gap:10px 18px;margin-bottom:12px}'
    +'.f{flex:1;min-width:150px;font-size:11px}.f span{color:#6a7688;font-size:10px;text-transform:uppercase;letter-spacing:.5px}'
    +'.f .ln{border-bottom:1px solid #17253f;height:20px;margin-top:2px}'
    +'table{width:100%;border-collapse:collapse;margin-top:4px}'
    +'th{background:#17253f;color:#fff;font-size:9.5px;text-transform:uppercase;letter-spacing:.5px;padding:6px 7px;text-align:left;border:1px solid #17253f}'
    +'td{border:1px solid #c9d2de;padding:6px 7px;font-size:11.5px;height:24px}'
    +'td.qt{text-align:center;font-weight:700;width:72px}td.br{width:78px;background:#fcfcfd}'
    +'tbody tr:nth-child(even) td{background:#f7f9fb}tbody tr:nth-child(even) td.br{background:#fcfcfd}'
    +'.nota{font-size:10.5px;color:#6a7688;margin-top:8px;font-style:italic}'
    +'.decl{margin-top:14px;font-size:11px;line-height:1.5}'
    +'.ass{display:flex;gap:30px;margin-top:34px}'
    +'.ass div{flex:1;text-align:center;font-size:10.5px}.ass .ln{border-top:1px solid #17253f;padding-top:4px;color:#6a7688}'
    +'</style></head><body>'
    +'<div class="cab"><div><h1>CHECKLIST DE ENTREGA E DEVOLUÇÃO</h1><div class="sub">'+amb+' &middot; '+cond+'</div></div>'
    +'<div class="marca"><b>Mafra Gestão Integrada</b>(16) 99284-5898</div></div>'
    +'<div class="ident">'
      +'<div class="f"><span>Condômino</span><div class="ln"></div></div>'
      +'<div class="f" style="max-width:110px"><span>Unidade</span><div class="ln"></div></div>'
      +'<div class="f" style="max-width:150px"><span>Telefone</span><div class="ln"></div></div>'
      +'<div class="f" style="max-width:140px"><span>Data do evento</span><div class="ln"></div></div>'
    +'</div>'
    +'<table><thead><tr><th>Item</th><th style="text-align:center">Qtd. cadastrada</th><th>Qtd. na entrega</th><th>Qtd. na devolução</th><th>Observação / avaria</th></tr></thead><tbody>'+linhas+'</tbody></table>'
    +'<div class="nota">Preencher à caneta as colunas de entrega e devolução. Conferir item a item junto ao condômino.</div>'
    +'<div class="decl">Declaro ter recebido os itens acima nas quantidades conferidas e me responsabilizo pela devolução nas mesmas condições. Peças faltantes ou danificadas serão repostas ou cobradas conforme o regimento interno.</div>'
    +'<div class="ass"><div><div class="ln">Assinatura do condômino</div></div><div><div class="ln">Assinatura do zelador / responsável</div></div><div style="max-width:130px"><div class="ln">Data</div></div></div>'
    +'</body></html>';
  w.document.open(); w.document.write(html); w.document.close();
  setTimeout(function(){ try{ w.focus(); w.print(); }catch(e){} }, 400);
}
function _procBlkStats(sec){
  var lista=_procCalcPessoal(sec);
  var cards='<div class="pm-stats">'+sec.itens.map(function(s){return '<div class="pm-stat"><div class="pm-n">'+_procBind(s,"n","0")+'</div><div class="pm-l">'+_procBind(s,"l","Rótulo")+'</div>'+(s.s!==undefined?'<div class="pm-s">'+_procBind(s,"s","")+'</div>':"")+'</div>';}).join("")+'</div>';
  if(!lista||!lista.length) return cards;
  var grid='<div class="pm-colabs">'+lista.map(function(c){
    var ter=(c.vinculo==="terceirizado");
    var ini=String(c.nome||"?").trim().split(/\s+/).map(function(x){return x[0]||"";}).slice(0,2).join("").toUpperCase();
    var foto=c.foto?'<div class="pm-colab-foto" style="background-image:url(\''+c.foto+'\')"></div>':'<div class="pm-colab-foto sem">'+esc(ini)+'</div>';
    var meta=[]; if(c.cpf) meta.push("CPF "+esc(c.cpf)); if(c.nasc) meta.push("Nasc. "+esc(_procDataBR(c.nasc))); if(c.inicio) meta.push("Início "+esc(_procDataBR(c.inicio)));
    return '<div class="pm-colab">'+foto+'<div class="pm-colab-c"><div class="pm-colab-nm">'+esc(c.nome||"")+'</div>'
      +(c.cargo?'<div class="pm-colab-cg">'+esc(c.cargo)+'</div>':"")
      +'<span class="pm-vinc '+(ter?"ter":"org")+'">'+(ter?"Terceirizado":"Orgânico")+'</span>'
      +(meta.length?'<div class="pm-colab-meta">'+meta.join(" · ")+'</div>':"")
      +'</div></div>';
  }).join("")+'</div>';
  return cards+grid;
}
function _procBlkCallout(sec){return '<div class="pm-callout pm-co-'+(sec.tone||"soft")+'"><div class="pm-co-ic">'+_pico(sec.cicon||"alert",19)+'</div><div>'+(sec.ctitulo!==""&&sec.ctitulo!==undefined?'<h5>'+_procBind(sec,"ctitulo","Título")+'</h5>':"")+'<p>'+_procBind(sec,"ctxt","Texto")+'</p></div></div>';}
function _procSisItem(s,i,j){
  var fotos=(s.fotos&&s.fotos.length)?'<div class="pm-photos'+(s.fotos.length===1?" one":"")+'">'+s.fotos.map(function(f){return _procPhoto(f,"img","cap","Legenda");}).join("")+'</div>':"";
  var addFoto=_procState.edit?'<button class="pm-mini pm-add" data-x="fotoadd:'+i+':'+j+'">＋ Foto</button>':"";
  return '<div class="pm-sub"><div class="pm-sub-h">'+_pico(s.icon||"wrench",20)+_procBind(s,"titulo","Sistema / área")+_procRm("sisrm:"+i+":"+j)+'</div>'
    +((s.onde||_procState.edit)?'<div class="pm-row"><div class="pm-desc">Local</div><div>'+_procBind(s,"onde","onde fica")+'</div></div>':"")
    +((s.marca||_procState.edit)?'<div class="pm-row"><div class="pm-desc">Marca</div><div>'+_procBind(s,"marca","marca / modelo")+'</div></div>':"")
    +'<div class="pm-row"><div><div class="pm-desc">Como acionar</div><div class="pm-hint">empresa e telefone</div></div><div>'+_procBind(s,"empresa","empresa responsável")+(s.telefone?' · '+_procBind(s,"telefone","telefone"):"")
      +((Array.isArray(s.pessoas)&&s.pessoas.length)?'<div style="margin-top:5px">'+s.pessoas.filter(function(pe){return pe&&(pe.nome||pe.telefone||pe.email);}).map(function(pe){
          var t=[]; if(pe.nome) t.push(esc(pe.nome)+(pe.depto?" ("+esc(pe.depto)+")":""));
          else if(pe.depto) t.push(esc(pe.depto));
          if(pe.telefone) t.push(esc(pe.telefone)); if(pe.email) t.push(esc(pe.email));
          return '<div style="font-size:12.5px;color:var(--pm-mut)">'+t.join(" · ")+'</div>';
        }).join("")+'</div>':"")
      +'</div></div>'
    +'<div class="pm-row"><div class="pm-desc">Passo a passo <span class="pm-tag">padrão</span></div><div>'+_procTA(s,"passos","o que fazer / como acionar")+'</div></div>'
    +fotos+'<div class="pm-fotohint">'+_pico("arrow",13)+' Numere os pontos ① ② ③ na foto, como no modelo.</div>'+addFoto+'</div>';
}
function _procBlkSistemas(sec,i){
  var nota='<div class="pm-note"><div>'+_pico("arrow",17)+'</div><div><b>Fotos com setas/números.</b> Ao enviar a foto de cada equipamento, numere os pontos (① ② ③) como o Centro Profissional fez — o texto já cita esses números.</div></div>';
  var itens=sec.itens.map(function(s,j){return _procSisItem(s,i,j);}).join("");
  return nota+itens+_procAdd("sisadd:"+i,"Sistema / área");
}
/* ---- montagem por esquema ---- */
function _procSecWrap(sec,i,inner){
  return '<section class="pm-section" id="pm-sec-'+i+'"><div class="pm-sec-head"><div class="pm-sec-top"><div class="pm-eyebrow">'+_pico(sec.icon||"doc",16)+esc(sec.eyebrow||"")+'</div>'+_procSecRm(i)+'</div><h2 class="pm-sec-title">'+_procBind(sec,"titulo","Seção")+'</h2>'+(sec.sub!==undefined?'<div class="pm-sec-sub">'+_procBind(sec,"sub","")+'</div>':"")+'</div>'+inner+'</section>';
}
function _procParte(sec,i){
  var chips=(sec.chips||[]).map(function(c){return '<span class="pm-chip">'+esc(c)+'</span>';}).join("");
  return '<div class="pm-part" id="pm-sec-'+i+'"><div class="pm-secrm-top">'+_procSecRm(i)+'</div><div class="pm-num">'+(sec.num||"")+'</div><div class="pm-plbl">Parte</div><h2>'+_procBind(sec,"ptitulo","Título da parte")+'</h2><div class="pm-chips">'+chips+'</div></div>';
}
function _procPadrao(sec,i){
  var pil=(sec.pilares||[]).map(function(x){return '<div class="pm-pillar"><div class="pm-pi">'+_pico(x.icon||"check",22)+'</div><div><h5>'+_procBind(x,"titulo","Pilar")+'</h5><p>'+_procBind(x,"txt","Descrição")+'</p></div></div>';}).join("");
  return '<div class="pm-part" id="pm-sec-'+i+'"><div class="pm-secrm-top">'+_procSecRm(i)+'</div><div class="pm-plbl">Padrão Mafra</div><h2 style="margin-bottom:18px">'+_procBind(sec,"titulo","Pilares")+'</h2><div class="pm-pillars">'+pil+'</div><div class="pm-sign"><div class="pm-m"><i></i></div><b>'+_procBind(sec,"assinatura","Assinatura")+'</b></div></div>';
}
function _procSecao(sec,i){
  if(sec.tipo==="parte")return _procParte(sec,i);
  if(sec.tipo==="padrao")return _procPadrao(sec,i);
  var inner="";
  if(sec.tipo==="dl")inner=_procBlkDL(sec,i);
  else if(sec.tipo==="timeline")inner=_procBlkTimeline(sec,i);
  else if(sec.tipo==="checkcols")inner=_procBlkChecks(sec,i);
  else if(sec.tipo==="steps")inner=_procBlkSteps(sec,i);
  else if(sec.tipo==="table")inner=_procBlkTable(sec,i);
  else if(sec.tipo==="textblocks")inner=_procBlkTextblocks(sec,i);
  else if(sec.tipo==="stats")inner=_procBlkStats(sec,i);
  else if(sec.tipo==="callout")inner=_procBlkCallout(sec,i);
  else if(sec.tipo==="sistemas")inner=_procBlkSistemas(sec,i);
  else if(sec.tipo==="checklist")inner=_procBlkChecklist(sec,i);
  else if(sec.tipo==="vistorias")inner=_procBlkVistorias(sec,i);
  else inner='<div class="pm-hint">seção desconhecida</div>';
  return _procSecWrap(sec,i,inner);
}
function _procCover(){var m=_procM();
  var tipoLbl={comercial:"Comercial",residencial:"Residencial",misto:"Misto",loteamento:"Loteamento"}[m.tipo]||"";
  var cap=(m.capa||_procState.edit)?'<div class="pm-cover-photo">'+_procPhoto(m,"capa","_capaLegenda","").replace("<figcaption>","<figcaption style=\"display:none\">")+'</div>':"";
  return '<div class="pm-cover"><span class="pm-usebadge">Uso interno · '+esc(tipoLbl)+'</span><div class="pm-eyebrow">Manual Operacional</div><h1 class="pm-title-xl">'+_procBind(m,"nome","Nome do condomínio")+'</h1><div class="pm-lead">'+_procBind(m,"subtitulo","Subtítulo")+'</div>'+cap+'<div class="pm-brandline"><span><b>Mafra Gestão Integrada</b></span><span>atendimento@mafragestaointegrada.com.br</span><span>(16) 99284-5898</span></div></div>';
}
function _procRenderDetail(){
  _procInjectCSS();_procBIND=[];_procPBIND=[];_procTABIND=[];
  var m=_procM();if(!m)return _procRenderGrid();
  var ED=false; _procState.edit=false;
  var back='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M15 6l-6 6 6 6"/></svg>';
  var bar='<div class="pm-bar"><button class="pm-btn" onclick="voltarProcedimentos()">'+back+' Voltar</button><div class="pm-bar-title">'+esc(m.nome||"")+'</div>'+_procPctBadge(m)+'<span id="procSaved" class="pm-saved">'+_pico("check",13)+' salvo</span><button class="pm-btn on" onclick="abrirEditorProc()">'+_pico("clip",15)+' Preencher / Editar</button><button class="pm-btn" onclick="_procImprimirManual()">'+_pico("printer",15)+' Imprimir</button><button class="pm-btn" onclick="_procBaixar()">'+_pico("upload",15)+' Baixar</button></div>';
  var editbar=ED?'<div class="pm-editbar">Modo de edição — clique nos textos, preencha “como acionar”, envie fotos (numere ① ② ③) e use “remover seção” no que não se aplica. Tudo salva sozinho.</div>':"";
  var secoes=(m.secoes||[]).map(function(sec,i){return _procSecao(sec,i);}).join("");
  var addSec=ED?'<div style="padding:16px 46px 40px"><button class="pm-mini pm-add" data-x="secadd">＋ Adicionar seção livre</button></div>':"";
  var view=document.getElementById("view");
  view.innerHTML='<div id="procRoot" class="'+(ED?"editing":"")+'">'+bar+editbar+'<div class="pm-sheet">'+_procCover()+secoes+addSec+'</div></div>';
  _procBindAll();_procEnsureDelegate();
}
function _procBindAll(){
  var root=document.getElementById("procRoot");if(!root)return;
  root.querySelectorAll("[data-b]").forEach(function(n){n.addEventListener("input",function(){var b=_procBIND[+n.dataset.b];b.obj[b.key]=n.innerText;_procSaveDebounced();});});
  root.querySelectorAll("[data-ta]").forEach(function(n){n.addEventListener("input",function(){var b=_procTABIND[+n.dataset.ta];b.obj[b.key]=n.value;_procSaveDebounced();});});
  root.querySelectorAll("[data-photo]").forEach(function(b){b.onclick=function(){_procOpenPhoto(+b.dataset.photo);};});
  root.querySelectorAll("[data-rmphoto]").forEach(function(b){b.onclick=function(){var t=_procPBIND[+b.dataset.rmphoto];t.obj[t.key]="";_procSave();_procRenderDetail();};});
}
function _procEnsureDelegate(){if(window._procDeleg)return;var view=document.getElementById("view");if(!view)return;view.addEventListener("click",_procStructural);window._procDeleg=true;}
function _procStructural(e){
  var t=e.target.closest("[data-x]");if(!t||!_procState.model)return;
  var parts=t.getAttribute("data-x").split(":"),act=parts[0],m=_procM(),S=m.secoes,i=+parts[1];
  function rr(){_procSave();_procRenderDetail();}
  if(act==="secadd"){S.push({tipo:"textblocks",eyebrow:"Extra",icon:"doc",titulo:"Nova seção",two:false,blocos:[{titulo:"",txt:""}]});return rr();}
  if(act==="secrm"){if(confirm("Remover esta seção do manual deste condomínio? (só afeta este condomínio)")){S.splice(i,1);}return rr();}
  if(act==="dladd"){S[i].grupos[+parts[2]].rows.push({icon:"user",k:"",v:""});return rr();}
  if(act==="dlrm"){S[i].grupos[+parts[2]].rows.splice(+parts[3],1);return rr();}
  if(act==="tladd"){S[i].grupos[+parts[2]].rows.push({hora:"",txt:""});return rr();}
  if(act==="tlrm"){S[i].grupos[+parts[2]].rows.splice(+parts[3],1);return rr();}
  if(act==="chkadd"){S[i].cols[+parts[2]].itens.push("");return rr();}
  if(act==="chkrm"){S[i].cols[+parts[2]].itens.splice(+parts[3],1);return rr();}
  if(act==="stepadd"){S[i].itens.push({icon:"check",titulo:"",txt:""});return rr();}
  if(act==="steprm"){S[i].itens.splice(+parts[2],1);return rr();}
  if(act==="rowadd"){S[i].rows.push(S[i].headers.map(function(){return "";}));return rr();}
  if(act==="rowrm"){S[i].rows.splice(+parts[2],1);return rr();}
  if(act==="tbadd"){S[i].blocos.push({titulo:"",txt:""});return rr();}
  if(act==="tbrm"){S[i].blocos.splice(+parts[2],1);return rr();}
  if(act==="sisadd"){S[i].itens.push({icon:"wrench",titulo:"",onde:"",empresa:"",telefone:"",passos:"",fotos:[]});return rr();}
  if(act==="sisrm"){S[i].itens.splice(+parts[2],1);return rr();}
  if(act==="fotoadd"){S[i].itens[+parts[2]].fotos.push({img:"",cap:""});return rr();}
}
/* ---- ações / seletor de tipo ---- */
function abrirProcedimento(cond){
  _procInjectCSS();var view=document.getElementById("view");if(view)view.innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  loadProc(cond).then(function(saved){
    if(saved){_procMigra(saved);_procState.cond=cond;_procState.pending=null;_procState.model=saved;_procState.edit=false;abrirEditorProc();try{window.scrollTo(0,0);}catch(e){}}
    else{_procState.pending=cond;_procState.cond=null;_procState.model=null;_procRenderChooser(cond);try{window.scrollTo(0,0);}catch(e){}}
  });
}
function _procRenderChooser(cond){
  _procInjectCSS();
  var tipos=[["comercial","building","Comercial","salas/lojas · sistemas, catracas, incêndio"],["residencial","home","Residencial","prédio de apartamentos · zelador, áreas comuns"],["misto","layers","Misto","comercial + residencial (torres/uso misto)"],["loteamento","road","Loteamento","condomínio de casas · guarita, vias, obras"]];
  var cards=tipos.map(function(t){return '<button class="pm-typecard" onclick="_procCriar(\''+_procJsStr(cond)+'\',\''+t[0]+'\')"><div class="pm-tc-ic">'+_pico(t[1],26)+'</div><div class="pm-tc-nm">'+esc(t[2])+'</div><div class="pm-tc-ds">'+esc(t[3])+'</div></button>';}).join("");
  var back='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M15 6l-6 6 6 6"/></svg>';
  document.getElementById("view").innerHTML='<div id="procRoot"><div class="pm-bar"><button class="pm-btn" onclick="voltarProcedimentos()">'+back+' Voltar</button><div class="pm-bar-title">Novo manual · '+esc(cond)+'</div></div><div class="pm-sheet" style="padding:34px 40px"><div class="pm-eyebrow">'+_pico("category",16)+'Escolha o tipo do condomínio</div><h2 class="pm-sec-title" style="margin:2px 0 6px">Qual é o tipo de '+esc(cond)+'?</h2><div class="pm-sec-sub" style="margin-bottom:20px">O tipo define o modelo-base do manual. Depois é tudo editável e dá pra remover o que não se aplica.</div><div class="pm-typegrid">'+cards+'</div></div></div>';
  _procInjectCSS();
}
function _procCriar(cond,tipo){
  var base=(typeof PROC_MODELS!=="undefined"&&PROC_MODELS[tipo])?PROC_MODELS[tipo]:PROC_MODELS.comercial;
  var model=_procMigra(_procClone(base));model.nome=cond;model.tipo=tipo;model.atualizadoEm=Date.now();model.atualizadoPor=(typeof state!=="undefined"&&state.userId)||"";
  _procState.cond=cond;_procState.pending=null;_procState.model=model;_procState.edit=false;
  saveProc(cond,model);_procRenderDetail();try{window.scrollTo(0,0);}catch(e){}
  if(typeof abrirEditorProc==="function") abrirEditorProc();
}
function voltarProcedimentos(){_procState.cond=null;_procState.pending=null;_procState.model=null;_procState.edit=false;renderProcedimentos();}
function _procToggleEdit(){_procState.edit=!_procState.edit;_procRenderDetail();}
function _procBaixar(){var m=_procM();if(!m)return;try{var blob=new Blob([JSON.stringify(m,null,2)],{type:"application/json"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="manual-procedimentos-"+String(_procState.cond||"condominio").replace(/[^\w\-]+/g,"-")+".json";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);}catch(e){}}
/* ---- grade ---- */
function _procIniciais(nome){
  var skip={de:1,da:1,do:1,das:1,dos:1,e:1};
  var w=String(nome||"").trim().split(/\s+/).filter(function(x){return x && !skip[x.toLowerCase()];});
  if(!w.length) return "?";
  var a=(w[0].charAt(0)||"").toUpperCase();
  var b=(w.length>1?(w[1].charAt(0)||""):"").toUpperCase();
  return b?(a+"<b>"+b+"</b>"):a;
}
async function _procRenderGrid(){
  _procInjectCSS();var view=document.getElementById("view");view.innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  var u=(typeof state!=="undefined"&&state.user)||{},uid=(typeof state!=="undefined"&&state.userId)||"",vis=null;
  try{if(u.tipo==="master"||["bianca","camilla","julia"].indexOf(uid)>-1)vis=null;else if(u.tipo==="sindico")vis=await condominiosDoSindico(uid);else if(u.tipo==="gestor")vis=condsDoGestor();}catch(e){vis=null;}
  var SUB=(typeof SUBCONDOMINIOS==="object"&&SUBCONDOMINIOS)?SUBCONDOMINIOS:{},pais=Object.keys(SUB),base=(typeof CONDOMINIOS!=="undefined"?CONDOMINIOS:[]).slice(),todos=[];
  // build 123: subcondomínios entram como UM card de grupo (Le Monde / Trio) — sem cards soltos duplicados
  base.filter(function(c){return !condominioPaiDe(c);}).concat(pais).forEach(function(c){if(todos.indexOf(c)<0)todos.push(c);});todos.sort(function(a,b){return a.localeCompare(b,"pt-BR");});
  if(vis!==null){todos=todos.filter(function(c){return condVisivel(vis,c);});}
  var cards=[];for(var k=0;k<todos.length;k++){var c=todos[k];
    if(SUB[c]){var subsV=subsCompletos(c).filter(function(s){return condVisivel(vis,s);}),feitos=0;for(var j=0;j<subsV.length;j++){if(await loadProc(subsV[j]))feitos++;}cards.push({cond:c,m:null,grupo:true,subs:subsV.length,feitos:feitos});}
    else{var m=await loadProc(c);cards.push({cond:c,m:m});}}
  var escopo=u.tipo==="sindico"?("Mostrando os "+(vis?vis.length:0)+" condomínio"+((vis&&vis.length===1)?"":"s")+" que você cuida"):(u.tipo==="gestor"?"Mostrando o(s) condomínio(s) que você administra":"Crie e edite o manual operacional de cada condomínio, por tipo");
  var tlbl={comercial:"Comercial",residencial:"Residencial",misto:"Misto",loteamento:"Loteamento"};
  var html='<div class="weeknav"><div><h2>'+icoH("procedimentos")+' Manual de Procedimentos</h2><div class="range">'+esc(escopo)+'</div></div><div class="spacer"></div></div><div class="man-grid">';
  cards.forEach(function(o){
    if(o.grupo){html+='<div class="man-card" onclick="_procAbrirGrupo(\''+_procJsStr(o.cond)+'\')"><div class="man-card-capa man-card-sem"><span class="man-mono">'+_procIniciais(o.cond)+'</span></div><div class="man-card-body"><div class="man-card-nm">'+esc(o.cond)+'</div><div class="man-card-st '+(o.feitos?"man-st-ok":"man-st-novo")+'">Grupo · '+o.subs+' subcondomínio'+(o.subs===1?"":"s")+'</div><div class="man-card-meta">'+o.feitos+' de '+o.subs+' com manual · clique para abrir</div></div></div>';return;}
    var m=o.m,criado=!!m;var st=criado?"✓ Criado":"＋ Não criado",stCls=criado?"man-st-ok":"man-st-novo";
    var capa=(m&&m.capa)?'<div class="man-card-capa" style="background-image:url(\''+m.capa+'\')"></div>':'<div class="man-card-capa man-card-sem"><span class="man-mono">'+_procIniciais(o.cond)+'</span></div>';
    var quando=(m&&m.atualizadoEm)?new Date(m.atualizadoEm).toLocaleDateString("pt-BR"):"",quem=(m&&m.atualizadoPor&&typeof USUARIOS!=="undefined"&&USUARIOS[m.atualizadoPor])?USUARIOS[m.atualizadoPor].nome.split(" ")[0]:"";
    var tp=(m&&m.tipo&&tlbl[m.tipo])?(" · "+tlbl[m.tipo]):"";
    var meta=criado?("Última edição: "+quando+(quem?(" · "+esc(quem)):"")+tp):"Clique para criar (escolhe o tipo)";
    html+='<div class="man-card" onclick="abrirProcedimento(\''+_procJsStr(o.cond)+'\')">'+capa+'<div class="man-card-body"><div class="man-card-nm">'+esc(o.cond)+'</div><div class="man-card-st '+stCls+'">'+st+'</div>'+(criado?'<div style="margin:7px 0 3px">'+_procPctBadge(m)+'</div>':'')+'<div class="man-card-meta">'+meta+'</div></div></div>';
  });
  html+='</div>';view.innerHTML=html;
}
async function renderProcedimentos(){_procInjectCSS();if(_procState.pending)return _procRenderChooser(_procState.pending);if(_procState.cond)return _procRenderDetail();if(_procState.pai)return _procRenderSubs(_procState.pai);return _procRenderGrid();}
/* ---- tela de subcondomínios (build 123) ---- */
function _procAbrirGrupo(pai){_procState.pai=pai;_procState.cond=null;_procState.pending=null;_procState.model=null;_procState.edit=false;_procRenderSubs(pai);try{window.scrollTo(0,0);}catch(e){}}
function _procVoltarGrupo(){_procState.pai=null;_procState.cond=null;_procState.pending=null;_procState.model=null;_procState.edit=false;renderProcedimentos();}
async function _procRenderSubs(pai){
  _procInjectCSS();var view=document.getElementById("view");view.innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  var u=(typeof state!=="undefined"&&state.user)||{},uid=(typeof state!=="undefined"&&state.userId)||"",vis=null;
  try{if(u.tipo==="master"||["bianca","camilla","julia"].indexOf(uid)>-1)vis=null;else if(u.tipo==="sindico")vis=await condominiosDoSindico(uid);else if(u.tipo==="gestor")vis=condsDoGestor();}catch(e){vis=null;}
  var subs=subsCompletos(pai).filter(function(s){return condVisivel(vis,s);});
  var tlbl={comercial:"Comercial",residencial:"Residencial",misto:"Misto",loteamento:"Loteamento"};
  var html='<div class="weeknav"><button class="nav-btn" onclick="_procVoltarGrupo()" title="Voltar">‹</button><div><h2>'+icoH("procedimentos")+' '+esc(pai)+'</h2><div class="range">Subcondomínios · cada um tem manual de procedimentos próprio</div></div><div class="spacer"></div></div><div class="man-grid">';
  for(var k=0;k<subs.length;k++){var c=subs[k],m=await loadProc(c),criado=!!m;var st=criado?"✓ Criado":"＋ Não criado",stCls=criado?"man-st-ok":"man-st-novo";
    var capa=(m&&m.capa)?'<div class="man-card-capa" style="background-image:url(\''+m.capa+'\')"></div>':'<div class="man-card-capa man-card-sem"><span class="man-mono">'+_procIniciais(subRotulo(c))+'</span></div>';
    var quando=(m&&m.atualizadoEm)?new Date(m.atualizadoEm).toLocaleDateString("pt-BR"):"",quem=(m&&m.atualizadoPor&&typeof USUARIOS!=="undefined"&&USUARIOS[m.atualizadoPor])?USUARIOS[m.atualizadoPor].nome.split(" ")[0]:"";
    var tp=(m&&m.tipo&&tlbl[m.tipo])?(" · "+tlbl[m.tipo]):"";
    var meta=criado?("Última edição: "+quando+(quem?(" · "+esc(quem)):"")+tp):"Clique para criar (escolhe o tipo)";
    html+='<div class="man-card" onclick="abrirProcedimento(\''+_procJsStr(c)+'\')">'+capa+'<div class="man-card-body"><div class="man-card-nm">'+esc(subRotulo(c))+'</div><div class="man-card-st '+stCls+'">'+st+'</div><div class="man-card-meta">'+meta+'</div></div></div>';}
  if(!subs.length)html+='<div style="padding:30px;color:#9aa">Nenhum subcondomínio visível para o seu perfil.</div>';
  html+='</div>';view.innerHTML=html;
}
function _procInjectCSS(){
  if(document.getElementById("procCSS"))return;
  var css=`
#procRoot{--pm-navy:#17253f;--pm-navy2:#132038;--pm-gold:#b8912f;--pm-gold2:#c9a750;--pm-ink:#212a38;--pm-mut:#6a7688;--pm-mut2:#94a0b1;--pm-line:#e6eaf0;--pm-line2:#eef2f7;--pm-card:#f4f6f9;--pm-cardln:#e9edf3;--pm-ok:#2f7d5b;--pm-okbg:#e7f3ec;--pm-dg:#b8402f;--pm-dgbg:#fbece9;--pm-wn:#a9791c;--pm-wnbg:#f7efdd;--pm-serif:'Playfair Display',Georgia,'Times New Roman',serif;max-width:1060px;margin:0 auto;color:var(--pm-ink)}
#procRoot *{box-sizing:border-box}
#procRoot .pm-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 4px 6px}
#procRoot .pm-bar-title{font-family:var(--pm-serif);font-weight:700;font-size:18px;color:var(--pm-navy);margin-right:auto;padding-left:4px}
#procRoot .pm-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--pm-line);background:#fff;color:var(--pm-navy);padding:8px 13px;border-radius:9px;font-size:12.5px;font-weight:600;cursor:pointer}
#procRoot .pm-btn:hover{background:var(--pm-card)}#procRoot .pm-btn.on{background:var(--pm-navy);border-color:var(--pm-navy);color:#fff}#procRoot .pm-btn svg{width:15px;height:15px}
#procRoot .pm-saved{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;color:var(--pm-ok);opacity:0;transition:opacity .3s;margin-right:4px}
#procRoot .pm-editbar{background:var(--pm-gold);color:#231a05;font-size:12.5px;font-weight:600;border-radius:10px;padding:9px 14px;margin:4px 4px 0}
#procRoot .pm-sheet{background:#fff;border:1px solid var(--pm-line);border-radius:16px;box-shadow:0 1px 2px rgba(20,33,56,.05),0 10px 26px rgba(20,33,56,.06);overflow:hidden;margin-top:14px}
#procRoot .pm-cover{padding:44px 46px 38px;border-bottom:1px solid var(--pm-line2);position:relative}
#procRoot .pm-usebadge{position:absolute;top:22px;right:24px;font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--pm-mut2);border:1px solid var(--pm-line);padding:5px 10px;border-radius:999px}
#procRoot .pm-eyebrow{color:var(--pm-gold);font-size:10.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;display:flex;align-items:center;gap:8px}
#procRoot .pm-eyebrow svg{width:16px;height:16px}
#procRoot .pm-title-xl{font-family:var(--pm-serif);font-weight:800;font-size:clamp(26px,4.4vw,40px);line-height:1.07;margin:6px 0 8px;color:var(--pm-navy)}
#procRoot .pm-lead{color:var(--pm-mut);font-size:14.5px;max-width:640px}
#procRoot .pm-brandline{margin-top:20px;padding-top:16px;border-top:1px solid var(--pm-line2);display:flex;flex-wrap:wrap;gap:5px 18px;font-size:12px;color:var(--pm-mut2)}
#procRoot .pm-brandline b{color:var(--pm-navy)}
#procRoot .pm-cover-photo{margin-top:22px;border-radius:12px;overflow:hidden;border:1px solid var(--pm-cardln)}
#procRoot .pm-cover-photo .pm-ph-img,#procRoot .pm-cover-photo .pm-ph-empty{height:220px}
#procRoot .pm-section{padding:34px 46px;border-bottom:1px solid var(--pm-line2)}
#procRoot .pm-sec-head{margin-bottom:22px}
#procRoot .pm-sec-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
#procRoot .pm-sec-title{font-family:var(--pm-serif);font-weight:700;font-size:clamp(21px,3vw,28px);color:var(--pm-navy);margin:6px 0 0;line-height:1.12}
#procRoot .pm-sec-sub{color:var(--pm-mut);font-size:13.5px;margin-top:7px;max-width:760px;font-style:italic}
#procRoot .pm-secrm{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:var(--pm-dg);background:#fff;border:1px solid #f0d4cf;border-radius:8px;padding:4px 9px;cursor:pointer}
#procRoot .pm-secrm svg{width:14px;height:14px}
#procRoot .pm-secrm-top{display:flex;justify-content:flex-end;margin-bottom:6px}
#procRoot .pm-part{padding:36px 46px;background:linear-gradient(135deg,var(--pm-navy),var(--pm-navy2));color:#fff}
#procRoot .pm-part.pm-inline{border-radius:16px;padding:24px 26px}
#procRoot .pm-num{font-family:var(--pm-serif);font-size:54px;font-weight:800;color:var(--pm-gold);line-height:.9}
#procRoot .pm-plbl{font-size:10.5px;letter-spacing:.3em;text-transform:uppercase;color:var(--pm-gold2);margin:8px 0 4px}
#procRoot .pm-part h2{font-family:var(--pm-serif);font-size:clamp(23px,3.6vw,34px);font-weight:800;margin:6px 0 12px}
#procRoot .pm-part p{color:rgba(255,255,255,.72);font-size:14px;max-width:640px;margin:0 0 16px}
#procRoot .pm-chips{display:flex;flex-wrap:wrap;gap:7px}
#procRoot .pm-chip{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.66);border:1px solid rgba(255,255,255,.16);padding:5px 9px;border-radius:999px}
#procRoot .pm-card{background:var(--pm-card);border:1px solid var(--pm-cardln);border-radius:14px;padding:20px 22px}
#procRoot .pm-card+.pm-card{margin-top:14px}
#procRoot .pm-mini-card{padding:14px 16px}
#procRoot .pm-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
#procRoot .pm-label{font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--pm-gold);margin:0 0 10px}
#procRoot .pm-hint{font-size:12px;color:var(--pm-mut2)}
#procRoot .pm-hintbox{font-size:12.5px;color:var(--pm-mut);font-style:italic;margin-top:10px}
#procRoot .pm-tag{display:inline-block;font-size:10px;font-weight:700;color:#7a5f14;background:#f4ead2;border-radius:20px;padding:1px 8px;margin-left:4px;vertical-align:middle}
#procRoot .pm-row{display:grid;grid-template-columns:150px 1fr;gap:10px;align-items:start;padding:6px 0}
#procRoot .pm-desc{font-size:13.5px;color:var(--pm-ink)}
#procRoot .pm-dl-row{display:flex;gap:12px;padding:10px 0;border-bottom:1px dashed var(--pm-line)}
#procRoot .pm-dl-row:last-child{border-bottom:none}
#procRoot .pm-dl-ic{width:33px;height:33px;border-radius:9px;background:#fff;border:1px solid var(--pm-cardln);display:grid;place-items:center;flex:none;color:var(--pm-navy)}
#procRoot .pm-dl-ic svg{width:18px;height:18px}
#procRoot .pm-dl-k{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--pm-gold);margin-bottom:2px}
#procRoot .pm-dl-v{font-size:13.5px;color:var(--pm-ink)}
#procRoot .pm-tl{display:grid;gap:10px}
#procRoot .pm-tl-row{display:flex;gap:13px;align-items:flex-start}
#procRoot .pm-tl-t{flex:none;min-width:66px;text-align:center;background:var(--pm-navy);color:#fff;font-weight:700;font-size:12.5px;padding:9px 8px;border-radius:9px}
#procRoot .pm-tl-x{padding-top:8px;font-size:13.5px;color:var(--pm-ink)}
#procRoot .pm-steps{display:grid;gap:11px}
#procRoot .pm-step{display:flex;gap:15px;align-items:flex-start;background:var(--pm-card);border:1px solid var(--pm-cardln);border-radius:13px;padding:15px 17px}
#procRoot .pm-step-n{flex:none;width:31px;height:31px;border-radius:50%;background:var(--pm-navy);color:#fff;font-weight:700;font-size:14px;display:grid;place-items:center}
#procRoot .pm-step.gold .pm-step-n{background:var(--pm-gold);color:#231a05}
#procRoot .pm-step-ic{flex:none;width:42px;height:42px;border-radius:11px;background:#fff;border:1px solid var(--pm-cardln);display:grid;place-items:center;color:var(--pm-navy)}
#procRoot .pm-step-ic svg{width:22px;height:22px}
#procRoot .pm-step-c h5{margin:0 0 3px;font-size:14.5px;font-weight:700;color:var(--pm-navy)}
#procRoot .pm-step-c p{margin:0;font-size:13px;color:var(--pm-mut)}
#procRoot .pm-checkcols{display:grid;grid-template-columns:1fr 1fr;gap:14px}
#procRoot .pm-checkcol{background:var(--pm-card);border:1px solid var(--pm-cardln);border-radius:13px;padding:17px 19px}
#procRoot .pm-checkcol h5{margin:0 0 11px;font-family:var(--pm-serif);font-size:15.5px;color:var(--pm-navy);display:flex;align-items:center;gap:10px}
#procRoot .pm-ci{width:31px;height:31px;border-radius:9px;background:#fff;border:1px solid var(--pm-cardln);display:grid;place-items:center;color:var(--pm-navy);flex:none}
#procRoot .pm-ci svg{width:17px;height:17px}
#procRoot .pm-chk{display:flex;align-items:flex-start;gap:9px;padding:5px 0;font-size:13.5px;color:var(--pm-ink)}
#procRoot .pm-chk svg{width:16px;height:16px;color:var(--pm-gold);flex:none;margin-top:2px}
#procRoot .pm-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
#procRoot .pm-stat{background:linear-gradient(160deg,var(--pm-navy),var(--pm-navy2));color:#fff;border-radius:15px;padding:22px 16px;text-align:center}
#procRoot .pm-n{font-family:var(--pm-serif);font-size:40px;font-weight:800;color:var(--pm-gold);line-height:1}
#procRoot .pm-l{font-family:var(--pm-serif);font-size:16px;margin-top:6px}
#procRoot .pm-s{font-size:11.5px;color:rgba(255,255,255,.6);margin-top:2px}
#procRoot .pm-callout{border-radius:15px;padding:19px 21px;display:flex;gap:13px;align-items:flex-start}
#procRoot .pm-co-ic{flex:none;width:33px;height:33px;border-radius:9px;display:grid;place-items:center}
#procRoot .pm-co-ic svg{width:19px;height:19px}
#procRoot .pm-callout h5{margin:0 0 4px;font-family:var(--pm-serif);font-size:16.5px}
#procRoot .pm-callout p{margin:0;font-size:13.5px;line-height:1.5}
#procRoot .pm-co-navy{background:var(--pm-navy);color:#fff}#procRoot .pm-co-navy .pm-co-ic{background:rgba(255,255,255,.12);color:var(--pm-gold2)}#procRoot .pm-co-navy p{color:rgba(255,255,255,.78)}
#procRoot .pm-co-soft{background:var(--pm-card);border:1px solid var(--pm-cardln)}#procRoot .pm-co-soft .pm-co-ic{background:#fff;border:1px solid var(--pm-cardln);color:var(--pm-navy)}#procRoot .pm-co-soft h5{color:var(--pm-navy)}#procRoot .pm-co-soft p{color:var(--pm-mut)}
#procRoot .pm-co-warn{background:var(--pm-wnbg);color:#5a4410}#procRoot .pm-co-warn .pm-co-ic{background:#fff;color:var(--pm-wn)}#procRoot .pm-co-warn h5{color:#5a4410}
#procRoot .pm-co-danger{background:var(--pm-dgbg);color:#6b2418}#procRoot .pm-co-danger .pm-co-ic{background:#fff;color:var(--pm-dg)}#procRoot .pm-co-danger h5{color:#6b2418}
#procRoot .pm-sub{background:var(--pm-card);border:1px solid var(--pm-cardln);border-radius:12px;padding:14px 16px;margin-bottom:11px}
#procRoot .pm-sub-h{font-family:var(--pm-serif);font-size:16px;font-weight:700;color:var(--pm-navy);display:flex;align-items:center;gap:9px;margin-bottom:6px}
#procRoot .pm-sub-h svg{width:20px;height:20px;color:var(--pm-navy)}
#procRoot .pm-ta{width:100%;font-family:inherit;font-size:13px;color:var(--pm-ink);border:1px solid var(--pm-cardln);border-radius:8px;padding:8px 10px;background:#fff;resize:vertical;line-height:1.5}
#procRoot .pm-ta:focus{outline:none;border-color:var(--pm-gold)}
#procRoot .pm-ta-view{font-size:13.5px;color:var(--pm-ink);line-height:1.55}
#procRoot .pm-note{display:flex;gap:9px;background:var(--pm-wnbg);border-left:3px solid var(--pm-gold);border-radius:0;padding:10px 12px;margin-bottom:14px;font-size:13px;color:var(--pm-ink)}
#procRoot .pm-note svg{width:17px;height:17px;color:#7a5f14;flex:none}
#procRoot .pm-note b{font-weight:700}
#procRoot .pm-fotohint{font-size:11.5px;color:var(--pm-mut2);display:flex;align-items:center;gap:5px;margin-top:6px}
#procRoot .pm-fotohint svg{width:13px;height:13px}
#procRoot .pm-photos{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-top:8px}
#procRoot .pm-photos.one{grid-template-columns:1fr}
#procRoot .pm-photo{margin:0;background:#fff;border:1px solid var(--pm-cardln);border-radius:12px;overflow:hidden}
#procRoot .pm-ph-img{height:190px;background-size:cover;background-position:center;background-color:#dfe4ec}
#procRoot .pm-ph-empty{height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--pm-mut2);background:repeating-linear-gradient(45deg,#eef1f6,#eef1f6 12px,#e9edf3 12px,#e9edf3 24px)}
#procRoot .pm-ph-empty svg{width:28px;height:28px;opacity:.7}#procRoot .pm-ph-empty span{font-size:12px;font-weight:600}
#procRoot .pm-photo figcaption{padding:10px 12px;font-size:12.5px;font-weight:600;color:var(--pm-navy);text-align:center}
#procRoot .pm-ph-ctrls{display:flex;gap:6px;padding:8px 10px 0;justify-content:center}
#procRoot .pm-tblwrap{overflow-x:auto;border:1px solid var(--pm-cardln);border-radius:12px}
#procRoot table.pm-tbl{width:100%;border-collapse:collapse;font-size:12.5px;min-width:520px}
#procRoot table.pm-tbl thead th{background:var(--pm-navy);color:#fff;text-align:left;padding:11px 13px;font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase}
#procRoot table.pm-tbl tbody td{padding:10px 13px;border-bottom:1px solid var(--pm-line2);vertical-align:top}
#procRoot table.pm-tbl tbody tr:nth-child(even){background:#fafbfd}#procRoot table.pm-tbl tbody tr:last-child td{border-bottom:none}
#procRoot .pm-stx{display:inline-block;font-weight:700;font-size:11px;padding:3px 9px;border-radius:999px}
#procRoot .pm-s-ok{background:var(--pm-okbg);color:var(--pm-ok)}#procRoot .pm-s-danger{background:var(--pm-dgbg);color:var(--pm-dg)}#procRoot .pm-s-warn{background:var(--pm-wnbg);color:var(--pm-wn)}
#procRoot .pm-trash{width:34px}
#procRoot .pm-pillars{display:grid;gap:12px}
#procRoot .pm-pillar{display:flex;gap:15px;align-items:flex-start;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:13px;padding:17px 19px}
#procRoot .pm-pi{flex:none;width:42px;height:42px;border-radius:11px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);display:grid;place-items:center;color:var(--pm-gold2)}
#procRoot .pm-pi svg{width:22px;height:22px}
#procRoot .pm-pillar h5{margin:0 0 3px;font-family:var(--pm-serif);font-size:17px;color:#fff}
#procRoot .pm-pillar p{margin:0;font-size:13px;color:rgba(255,255,255,.66)}
#procRoot .pm-quote{margin:24px 0 8px;font-family:var(--pm-serif);font-style:italic;font-size:19px;text-align:center;color:#fff;line-height:1.45}
#procRoot .pm-sign{text-align:center;margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,.12)}
#procRoot .pm-m{width:42px;height:42px;border:1.6px solid var(--pm-gold);border-radius:11px;display:grid;place-items:center;margin:0 auto 12px}
#procRoot .pm-m i{width:15px;height:15px;background:var(--pm-gold);border-radius:4px;display:block}
#procRoot .pm-sign b{color:#fff;font-size:13px;font-weight:500}
#procRoot .pm-tx.pm-ed{outline:1.5px dashed rgba(184,145,47,.55);outline-offset:2px;border-radius:4px;min-width:14px;display:inline-block;padding:0 2px;cursor:text;-webkit-user-modify:read-write-plaintext-only}
#procRoot .pm-tx.pm-ed:focus{outline-style:solid;outline-color:var(--pm-gold);background:rgba(184,145,47,.06)}
#procRoot .pm-tx.pm-ed:empty:before{content:attr(data-ph);color:var(--pm-mut2);font-style:italic}
#procRoot .pm-mini{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:600;padding:5px 10px;border-radius:8px;border:1px solid var(--pm-cardln);background:#fff;color:var(--pm-navy);cursor:pointer}
#procRoot .pm-mini:hover{background:var(--pm-card)}#procRoot .pm-mini svg{width:14px;height:14px}
#procRoot .pm-mini.danger{color:var(--pm-dg);border-color:#f0d4cf}#procRoot .pm-mini.pm-add{margin-top:12px}
#procRoot .pm-rm{margin-left:8px;color:var(--pm-dg);cursor:pointer;border:none;background:none;display:inline-flex;vertical-align:middle;padding:0}
#procRoot .pm-rm svg{width:15px;height:15px}
#procRoot .pm-colabs{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
#procRoot .pm-colab{display:flex;gap:12px;align-items:center;background:var(--pm-card);border:1px solid var(--pm-cardln);border-radius:13px;padding:12px 14px}
#procRoot .pm-colab-foto{width:58px;height:58px;border-radius:50%;background-size:cover;background-position:center;background-color:#dfe4ec;border:1.5px solid var(--pm-cardln);flex:none}
#procRoot .pm-colab-foto.sem{display:flex;align-items:center;justify-content:center;font-family:var(--pm-serif);font-weight:700;font-size:17px;color:var(--pm-navy);background:#e9edf3}
#procRoot .pm-colab-c{min-width:0}
#procRoot .pm-colab-nm{font-family:var(--pm-serif);font-size:15px;font-weight:700;color:var(--pm-navy);line-height:1.2}
#procRoot .pm-colab-cg{font-size:12px;color:var(--pm-mut);margin-top:1px}
#procRoot .pm-vinc{display:inline-block;font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:999px;margin-top:5px}
#procRoot .pm-vinc.org{background:var(--pm-okbg);color:var(--pm-ok)}
#procRoot .pm-vinc.ter{background:#e8eefc;color:#2b4d8f}
#procRoot .pm-colab-meta{font-size:11px;color:var(--pm-mut2);margin-top:4px}
#procRoot .pm-typegrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
#procRoot .pm-typecard{text-align:left;background:var(--pm-card);border:1px solid var(--pm-cardln);border-radius:14px;padding:20px;cursor:pointer;transition:.15s}
#procRoot .pm-typecard:hover{border-color:var(--pm-gold);background:#fff}
#procRoot .pm-tc-ic{width:48px;height:48px;border-radius:12px;background:#fff;border:1px solid var(--pm-cardln);display:grid;place-items:center;color:var(--pm-navy);margin-bottom:12px}
#procRoot .pm-tc-nm{font-family:var(--pm-serif);font-size:19px;font-weight:700;color:var(--pm-navy)}
#procRoot .pm-tc-ds{font-size:12.5px;color:var(--pm-mut);margin-top:3px}
@media(max-width:760px){
  #procRoot .pm-cover,#procRoot .pm-section,#procRoot .pm-part{padding-left:20px;padding-right:20px}
  #procRoot .pm-grid2,#procRoot .pm-stats,#procRoot .pm-checkcols,#procRoot .pm-photos,#procRoot .pm-typegrid{grid-template-columns:1fr}
  #procRoot .pm-row{grid-template-columns:1fr;gap:3px}
  #procRoot .pm-usebadge{position:static;display:inline-block;margin-bottom:12px}
}`;
  var st=document.createElement("style");st.id="procCSS";st.textContent=css;document.head.appendChild(st);
}
/* ============================ MODELOS POR TIPO ============================ */
var _PILARES=[
  {icon:"eye",titulo:"Antecipação",txt:"Identificar riscos antes que virem problema."},
  {icon:"grid",titulo:"Organização",txt:"Processos estruturados e informações atualizadas."},
  {icon:"activity",titulo:"Controle",txt:"Monitoramento contínuo de equipe, sistemas e prestadores."},
  {icon:"message",titulo:"Comunicação",txt:"Reporte claro, rápido e documentado de toda ocorrência."},
  {icon:"check",titulo:"Execução",txt:"Ação precisa, dentro do padrão e com registro obrigatório."}
];
function _padraoSec(){return {tipo:"padrao",titulo:"Pilares da excelência operacional",pilares:JSON.parse(JSON.stringify(_PILARES)),frase:"Na Mafra, gestão não é improviso. É continuidade com padrão, controle e excelência.",assinatura:"Mafra Gestão Integrada · Márcia Mafra · André Salgado · (16) 99284-5898 · atendimento@mafragestaointegrada.com.br"};}

var PROC_MODELS={};

/* ---------------- COMERCIAL — Centro Profissional Ribeirão Shopping ---------------- */
PROC_MODELS.comercial={
 nome:"Novo condomínio comercial",subtitulo:"Manual de Procedimentos · Condomínio Comercial",tipo:"comercial",capa:"",_capaLegenda:"",atualizadoEm:null,atualizadoPor:"",
 secoes:[
  {tipo:"dl",eyebrow:"Identificação",icon:"pin",titulo:"Identificação do condomínio",sub:"Dados cadastrais, mandato e responsáveis pela gestão.",grupos:[
    {titulo:"Dados do empreendimento",rows:[
      {icon:"home",k:"Categoria",v:"Vertical · Comercial — 288 unidades · 1 torre"},
      {icon:"doc",k:"CNPJ",v:"17.267.928/0001-30 · Habite-se: 07/11/2012"},
      {icon:"pin",k:"Endereço",v:"Av. Cel. Fernando Ferreira Leite, 1520 — Ribeirão Preto/SP — CEP 14026-020"},
      {icon:"calendar",k:"Mandato",v:"Eleição 03/04/2025 · 2 anos · até 02/04/2027"}]},
    {titulo:"Governança e contatos",add:true,rows:[
      {icon:"shield",k:"Síndico",v:"Mafra Gestão Integrada · (16) 99284-5898"},
      {icon:"userCheck",k:"Subsíndico",v:"Davidson Valentim Alvarenga · (16) 99102-6027"},
      {icon:"user",k:"Gerência",v:"Luana Figueiredo · (16) 99437-1131"},
      {icon:"building",k:"Administradora",v:"Vallecon · (16) 3102-9595"},
      {icon:"wrench",k:"Construtora",v:"MultiPlan · (21) 3031-5200"},
      {icon:"gavel",k:"Jurídico",v:"Ronny (Gatto & Martinussi) · (16) 99176-7946"}]}]},
  {tipo:"textblocks",eyebrow:"Estrutura",icon:"grid",titulo:"Áreas técnicas do edifício",sub:"Conheça os pavimentos e áreas técnicas.",two:true,blocos:[
    {titulo:"Térreo · Recepção",txt:"Recepção, 5 salas de reunião, 2 banheiros, cafeteria, espaço de fisioterapia."},
    {titulo:"Subsolo 1",txt:"Banheiros de funcionários, lavanderia, refeitório, centro de medição, gerador, 2 cabines primárias, casa de bomba de reuso, casa de válvula de fluxo, casa de bomba (espelho d'água), depósito de lixo."},
    {titulo:"Subsolo 2",txt:"Casa de máquinas (bomba de água potável), depósito de limpeza, arquivo morto, depósito de manutenção."}]},
  {tipo:"parte",num:"01",ptitulo:"Rotina & Sistemas do edifício",ptxt:"O que fazer todos os dias e como funciona cada sistema do prédio.",chips:["Abertura & fechamento","Rondas","Vistorias","Iluminação","Câmeras","Elevadores","Hidráulica","Incêndio"]},
  {tipo:"timeline",eyebrow:"Rotina operacional",icon:"clock",titulo:"Abertura e fechamento",sub:"Sequência fixa. Cumpra cada horário e registre qualquer desvio.",grupos:[
    {titulo:"Encerramento",rows:[{hora:"18:45",txt:"Fechar o portão de acesso ao shopping."},{hora:"19h",txt:"Recepção: preencher o livro de ocorrências."},{hora:"21h",txt:"Fechar portão do estacionamento e apagar as luzes."},{hora:"22h",txt:"Apagar recepção, desligar TVs e o ar (recepção e café). As portas de vidro travam sozinhas."},{hora:"23h",txt:"Ronda: verificar/apagar luzes dos andares e desligar o ar central."}]},
    {titulo:"Abertura",rows:[{hora:"05h",txt:"Acender halls e recepção, ligar ar central, luzes do estacionamento, abrir portas de vidro e TVs."},{hora:"06h",txt:"Abrir o portão principal do estacionamento."},{hora:"07h",txt:"Abrir o portão do fundo (-1)."}]}]},
  {tipo:"checkcols",eyebrow:"Rondas",icon:"list",titulo:"Rondas do vigia · itens de verificação",colLabel:"Função",sub:"Noturno: 23h, 03h e 05h. Registre toda anormalidade no relatório diário.",cols:[
    {icon:"shield",titulo:"Segurança geral",itens:["Portas abertas/fechadas","Conferir fechaduras","Salas abertas","Ar ligado em salas vazias"]},
    {icon:"alert",titulo:"Anormalidades",itens:["Barulhos e cheiros incomuns","Movimentações suspeitas","Registrar o que está fora do padrão"]},
    {icon:"home",titulo:"Estrutura",itens:["Rachaduras ou trincas","Limpeza das áreas comuns","Lâmpadas queimadas"]},
    {icon:"wrench",titulo:"Salas em reforma",itens:["Saída dos prestadores no horário","Materiais expostos","Permanência fora do horário","Comunicar à gerência"]}]},
  {tipo:"vistorias",eyebrow:"Rotina operacional",icon:"eye",titulo:"Vistoria técnica",gold:true,itens:[
    {nome:"Vistoria técnica",freq:"semanal",freqOutra:"",desc:"Inspeção completa dos sistemas e equipamentos críticos."},
    {nome:"Teste de gerador",freq:"semanal",freqOutra:"",desc:"Acionamento e verificação do gerador de emergência."},
    {nome:"Iluminação de emergência",freq:"semanal",freqOutra:"",desc:"Teste de ativação de toda a iluminação de emergência."},
    {nome:"Conferência de estoque",freq:"semanal",freqOutra:"",desc:"Revisão de materiais e insumos da operação."},
    {nome:"Relatório semanal",freq:"semanal",freqOutra:"",desc:"Elaboração e envio do relatório semanal à Mafra."}]},
  {tipo:"sistemas",eyebrow:"Sistemas do edifício",icon:"activity",titulo:"Sistemas e como acionar",sub:"Como funciona e quem chamar em cada sistema.",itens:[
    {icon:"bolt",titulo:"Iluminação",onde:"3 painéis: subsolos, corredor do carrinho, 9º andar",empresa:"interno / eletricista",telefone:"",passos:"-1: liga 1º e 2º subsolo.\nCorredor: recepção, café e jardim.\n9º andar: Asa Delta (laje).",fotos:[{img:"",cap:"Painel dos subsolos"},{img:"",cap:"Painel geral"}]},
    {icon:"activity",titulo:"Ar-condicionado (recepção e café)",onde:"recepção, ao lado do elevador de serviço",empresa:"LagoAr",telefone:"(16) 99289-3582",passos:"Torre da frente -> café. Torre de trás -> recepção.\nTermostato: liga/desliga no topo; gelar/ventilar; LED = modo ativo.\nLigar 05h, desligar 22h.",fotos:[{img:"",cap:"Termostato · chave nº 12"}]},
    {icon:"camera",titulo:"Câmeras e controle de acesso",onde:"quadro QFL",empresa:"AGT · Francisco",telefone:"(11) 96091-8095",passos:"Pico de energia trava só o acesso: gire a chave para reiniciar (disjuntores das catracas/portas/portão).\nCada porteiro tem login próprio.",fotos:[{img:"",cap:"Quadro QFL · numere ① ② ③"}]},
    {icon:"chevron",titulo:"Elevadores e portas de vidro",onde:"portas travam 22h / abrem 05h",empresa:"Atlas Schindler · manut. Edson Navarro",telefone:"0800 055 1918 · (16) 99105-8956",passos:"Parado ou preso: ligar na Atlas, abrir chamado e anotar o nº; passageiro usa o interfone; emergência -> Bombeiros 193.\nPortas de vidro: botão no canto superior de cada lado trava manualmente.",fotos:[]},
    {icon:"drop",titulo:"Hidráulica (potável e reuso)",onde:"bombas e caixas nos subsolos",empresa:"interno",telefone:"",passos:"Potável = torneiras; reuso = descargas.\nFechamento: shaft (salas), barrilete 18º, válvula de fluxo -1, redutoras -1.\nEm vazamento, identifique o sistema antes de fechar.",fotos:[]},
    {icon:"flame",titulo:"Incêndio e pressurização",onde:"central no CCO; pressurização no -1",empresa:"BSecurity · Bombeiros 193",telefone:"(16) 99739-5584",passos:"Sirene: localizar no painel -> Silencia Central -> confirmar (até 2 min) -> RESET -> desligar pressurização no -1 -> relatar.\nCentral Bosch: RESET Usuário 2 · senha 000000.",fotos:[{img:"",cap:"Central Bosch · ① ② ③"},{img:"",cap:"Pressurização -1"}]}]},
  {tipo:"parte",num:"02",ptitulo:"Controle, Terceiros & Gestão",ptxt:"Prestadores, contratos, laudos, salas e finanças.",chips:["Prestadores","Contratos","Laudos","Pessoal","Notas fiscais"]},
  {tipo:"checkcols",eyebrow:"Controle de terceiros",icon:"users",titulo:"Gestão de prestadores",colLabel:"Grupo",sub:"Marque cada item ao acompanhar um prestador.",cols:[
    {icon:"check",titulo:"Ao receber um prestador",itens:[
      "Validar autorização — Confirmar a autorização de acesso.",
      "Conferir documentos — Checar a documentação obrigatória.",
      "Acompanhar serviço — Supervisionar do início ao fim.",
      "Validar entrega — Conferir se foi concluído conforme combinado.",
      "Registrar fotos — Antes, durante e depois."]}]},
  {tipo:"table",eyebrow:"Controle de terceiros",icon:"doc",titulo:"Contratos e fornecedores",headers:["Prestador","Área","Contato","Vencimento","Situação"],venc:3,status:true,nota:"Atualize a data de vencimento; os dias para expirar são calculados sozinhos.",rows:[
    ["AGT Tecnologia","Controle de acesso","(11) 96091-8095","","Válido"],["Atlas Schindler","Elevadores","(16) 99105-8956","","Válido"],["BSecurity","Incêndio","(16) 99739-5584","","Vencido"],["LagoAr","Ar-condicionado","(16) 99289-3582","","Válido"],["Hi-Service","Limpeza","(16) 99260-4084","","Válido"],["Vallecon","Administradora","(16) 3102-9595","","Válido"]]},
  {tipo:"table",eyebrow:"Conformidade",icon:"clip",titulo:"Laudos obrigatórios",headers:["Laudo","Descrição","Vencimento","Situação"],status:true,rows:[
    ["AVCB","Vistoria do Corpo de Bombeiros","10/12/2028","Válido"],["SPDA","Para-raios","27/04/2025","Vencido"],["RIA","Inspeção anual","31/10/2026","Válido"],["Gases/GLP","Estanqueidade","—","Não possui"]]},
  {tipo:"stats",eyebrow:"Quadro de pessoal",icon:"users",titulo:"Quadro de pessoal",sub:"Supervisione orgânicos e terceirizados com o mesmo rigor.",itens:[{n:"24",l:"Colaboradores",s:"total"},{n:"9",l:"Orgânicos",s:"próprios"},{n:"15",l:"Terceirizados",s:"parceiros"}]},
  {tipo:"parte",num:"03",ptitulo:"Emergências & Contingência",ptxt:"Quando algo dá errado, siga o fluxo — sem exceções.",chips:["Energia","Água","Elevador","Incêndio","Contatos"]},
  {tipo:"table",eyebrow:"Contingência",icon:"alert",titulo:"Contatos de Emergência Mafra",sub:"Quem acionar na Mafra em caso de emergência. Toque em ＋ Linha para adicionar.",headers:["Função / Setor","Responsável","Telefone"],rows:[
    ["Central Mafra (plantão)","Mafra Gestão Integrada","(16) 99284-5898"],
    ["Subsíndico","Davidson Valentim Alvarenga","(16) 99102-6027"],
    ["Gerência","Luana Figueiredo","(16) 99437-1131"],
    ["Gerador","Camilo","(16) 99219-5362"]]},
  {tipo:"table",eyebrow:"Contingência",icon:"phone",titulo:"Contatos de Emergência Utilidade Pública",headers:["Sistema / Serviço","Responsável","Telefone"],rows:[
    ["Energia","CPFL","0800 010 10 10"],["Água","SAERP","0800 115 0115"],["Elevadores","Atlas Schindler","0800 055 1918"],["Incêndio","BSecurity","(16) 99739-5584"],["Câmeras/Acesso","AGT · Francisco","(11) 96091-8095"],["Administradora","Vallecon","(16) 3102-9595"],["Síndico","Mafra Gestão Integrada","(16) 99284-5898"],["EMERGÊNCIAS","Polícia / Bombeiros / SAMU","190 · 193 · 192"],["Defesa Civil","Defesa Civil","199"],["Violência contra a mulher","Central de Atendimento","180"]]},
  _padraoSec()
 ]
};

/* ---------------- RESIDENCIAL — Varanda Botânico (rotina) + Mirante do Ipê (sistemas) ---------------- */
PROC_MODELS.residencial={
 nome:"Novo condomínio residencial",subtitulo:"Manual de Procedimentos · Residencial (prédio de apartamentos)",tipo:"residencial",capa:"",_capaLegenda:"",atualizadoEm:null,atualizadoPor:"",
 secoes:[
  {tipo:"dl",eyebrow:"Identificação",icon:"pin",titulo:"Identificação do condomínio",sub:"Dados cadastrais e responsáveis pela gestão.",grupos:[
    {titulo:"Dados do empreendimento",rows:[
      {icon:"home",k:"Categoria",v:"Vertical · Residencial — apartamentos"},
      {icon:"doc",k:"CNPJ",v:"preencher"},
      {icon:"pin",k:"Endereço",v:"preencher"},
      {icon:"calendar",k:"Mandato",v:"preencher início e fim"}]},
    {titulo:"Governança e contatos",add:true,rows:[
      {icon:"shield",k:"Síndico",v:"Mafra Gestão Integrada · (16) 99284-5898"},
      {icon:"user",k:"Zelador",v:"nome e telefone"},
      {icon:"userCheck",k:"Gerente",v:"nome e telefone"},
      {icon:"building",k:"Administradora",v:"AGOS · (16) 3102-9595"},
      {icon:"wrench",k:"Construtora",v:"preencher"},
      {icon:"gavel",k:"Jurídico",v:"preencher"}]}]},
  {tipo:"parte",num:"01",ptitulo:"Rotina do Zelador",ptxt:"Planejamento do dia, liderança da equipe, manutenção preventiva e corretiva.",chips:["Planejamento","Equipe","Preventiva","Corretiva","Moradores","Regras de ouro"]},
  {tipo:"steps",eyebrow:"Passo a passo do zelador",icon:"userCheck",titulo:"Passo a passo do zelador",stepIcon:true,itens:[
    {icon:"clock",titulo:"Planejamento diário",txt:"Chegar às 7h e fazer ronda nas áreas comuns. Verificar quadros elétricos, bombas, portões e elevadores. Checar ocorrências noturnas da portaria."},
    {icon:"users",titulo:"Liderança e equipe",txt:"Reunir limpeza e portaria, alinhar cronograma e delegar tarefas. Reforçar uniforme, comportamento e atendimento; cobrar pontualidade com firmeza e cordialidade."},
    {icon:"refresh",titulo:"Manutenção preventiva (semanal)",txt:"Bombas d'água e recalque, caixa d'água e reservatórios, iluminação das áreas comuns, portões automáticos, interfones e câmeras. Atualizar check-list mensal e enviar relatório com fotos."},
    {icon:"wrench",titulo:"Manutenção corretiva",txt:"Registrar problemas com urgência, acionar prestador autorizado e acompanhar até o fim. Informar custos e necessidade de 3 orçamentos. Registrar antes e depois."},
    {icon:"message",titulo:"Moradores e prestadores",txt:"Atender com cordialidade e postura profissional. Esclarecer normas/obras/entregas. Exigir ART e autorização de mudança. Controlar e-mail e WhatsApp com agilidade e formalidade."},
    {icon:"clip",titulo:"Reuniões e feedbacks",txt:"Participar de reuniões quando convocado, apresentar melhorias com base nas rotinas e ocorrências, solicitar treinamentos quando necessário."},
    {icon:"shield",titulo:"Regras de ouro",txt:"Dar exemplo de pontualidade e cuidado com o patrimônio. Evitar julgamentos pessoais. Resolver conflitos com diálogo firme e respeitoso. Valorizar a equipe."}]},
  {tipo:"table",eyebrow:"Rotina operacional",icon:"clock",titulo:"Cronograma diário do zelador",sub:"Segunda a sexta · 08h às 17h.",headers:["Horário","Atividade","Área / Observação"],rows:[
    ["08:00–08:30","Chegada e ronda inicial","Portaria, garagem, corredores, elevadores, entradas"],
    ["08:30–09:00","Alinhamento com a equipe","Tarefas, conduta, faltas"],
    ["09:00–10:00","Checagem de equipamentos","Bombas, quadros, portões, iluminação"],
    ["10:00–10:30","Vistoria da piscina","Nível, bomba, borda"],
    ["10:30–11:00","Academia e brinquedoteca","Aparelhos, limpeza"],
    ["11:00–11:30","Sauna e salão de festas","Funcionamento, agendamento"],
    ["11:30–12:00","Atendimento","WhatsApp, portaria, moradores"],
    ["12:00–13:00","Almoço",""],
    ["13:00–13:30","Ronda externa e áreas verdes","Calçadas, muros, lixeiras"],
    ["13:30–14:00","Inspeção na garagem","Ocupações irregulares, sujeira"],
    ["14:00–15:00","Manutenções agendadas","Prestadores, acompanhamento"],
    ["15:00–15:30","Apoio à equipe","Reforço de limpeza"],
    ["15:30–16:00","Checagem final","Luzes, trincos, caixas d'água"],
    ["16:00–17:00","Encerramento e relatório","Fotos, pendências"]]},
  {tipo:"checkcols",eyebrow:"Checklist diário",icon:"list",titulo:"Checklist diário por área",sub:"Percorra cada área e marque o que verificou.",cols:[
    {icon:"shield",titulo:"Portaria",itens:["Interfones e câmeras funcionando","Iluminação interna e externa","Controles de acesso organizados","Pacotes pendentes verificados","Limpeza e organização","Portões funcionando"]},
    {icon:"home",titulo:"Hall social",itens:["Piso, vidros e espelhos limpos","Móveis no lugar","Iluminação testada","Sem odores ou infiltrações"]},
    {icon:"pool",titulo:"Piscina",itens:["Nível e cloro adequados","Bomba e filtro funcionando","Borda limpa","Regras visíveis","Sem resíduos na água"]},
    {icon:"activity",titulo:"Academia",itens:["Equipamentos funcionando","Iluminação e ventilação","Aparelhos limpos","Sem itens esquecidos"]},
    {icon:"box",titulo:"Brinquedoteca",itens:["Brinquedos íntegros","Ambiente limpo","Boa iluminação","Sem riscos para crianças"]},
    {icon:"calendar",titulo:"Salão de festas",itens:["Mobiliário limpo e organizado","Agenda conferida","Ar-condicionado funcionando","Sem danos visíveis"]},
    {icon:"flame",titulo:"Sauna",itens:["Aquecimento funcionando","Chave controlada","Sem objetos proibidos","Estrutura conservada"]},
    {icon:"chevron",titulo:"Corredores e elevadores",itens:["Elevadores funcionando","Botoeiras e iluminação ok","Sem objetos esquecidos"]},
    {icon:"truck",titulo:"Garagem",itens:["Vagas respeitadas","Iluminação e sensores ok","Sem objetos indevidos","Portões testados"]},
    {icon:"tree",titulo:"Áreas verdes e externas",itens:["Sem lixo ou entulho","Irrigação funcionando","Poda em dia","Iluminação externa ativa","Muros e grades verificados"]},
    {icon:"box",titulo:"Lixeira",itens:["Levar sacos ao quartinho pela manhã","Lavar o carrinho diariamente","Evitar acúmulo no fim do dia","Tampas sempre fechadas","Espaço limpo e organizado"]}]},
  {tipo:"parte",num:"02",ptitulo:"Sistemas e como acionar",ptxt:"Como funciona e quem chamar em cada sistema do prédio.",chips:["Câmeras","Portões","Elevadores","Gerador","Piscina","Gás","Bombas","Medidores"]},
  {tipo:"sistemas",eyebrow:"Sistemas do prédio",icon:"activity",titulo:"Sistemas e como acionar",sub:"Preencha empresa/telefone; o passo a passo já vem pronto.",itens:[
    {icon:"camera",titulo:"Câmeras e controle de acesso",onde:"computador da portaria",empresa:"AGT · Silvia / Milenna / Jovita",telefone:"(11) 98988-6696 · (11) 94503-2031",passos:"Cada porteiro tem login próprio.\nTravou/caiu: reiniciar ou desligar o computador; ao ligar, abrir os programas CONTROLE DE ACESSO e CÂMERAS.\nNão resolvendo, ligar na AGT e relatar ao zelador.",fotos:[{img:"",cap:"Ícones: cadastro e câmeras · setas ① ②"}]},
    {icon:"door",titulo:"Portões das garagens",onde:"portaria (botoeira e chaves)",empresa:"AGT · urgência serralheiro Alemão",telefone:"(11) 96478-8474 · (16) 99131-9611",passos:"Botoeira na portaria abre manualmente.\nChaves das travas magnéticas: desligar o disjuntor para abrir manual.\nNo quadro comando de cada portão há o Disjuntor Geral.\nRotina: contrapesos, foto seguidora (sensor) e lubrificação dos trilhos.",fotos:[{img:"",cap:"Trava magnética do portão"}]},
    {icon:"chevron",titulo:"Elevadores",onde:"interfone interno",empresa:"Atlas Schindler · adm Cláudio/Ricardo",telefone:"0800 055 1918 · (16) 99336-6332",passos:"Preso: avisar pelo interfone que já está ligando na central; ligar na Atlas, abrir chamado e anotar o nº.\nParado com porta aberta: placa \"equipamento em manutenção\", interditar, abrir chamado, registrar.",fotos:[]},
    {icon:"fuel",titulo:"Gerador",onde:"área externa, esquina da rua de trás (chaves na portaria)",empresa:"CDMC · plantão / Pedro manut.",telefone:"(16) 99151-8210 · (16) 99219-3879",passos:"Diesel comum (posto REDE SERVICE, gerente Antônio (16) 99353-0551).\nLiga/desliga automático na falta/retorno de energia. Atentar ao nível do combustível.\nMantém: portaria (câmeras/facial/digital), 2 elevadores de serviço, portões e iluminação das áreas comuns.\nRotina: níveis (água do radiador, diesel, óleo) com gerador frio; teste semanal com carga por 10 min; voltar ao modo AUTO.",fotos:[{img:"",cap:"Gerador · área externa"}]},
    {icon:"pool",titulo:"Piscinas (externa e interna aquecida)",onde:"casa de máquinas da piscina",empresa:"Nill e Adriano",telefone:"(16) 99224-8165 · (16) 98214-7325",passos:"Interna aquecida 33°, filtro automático 5:30–17:30.\nRotina: organizar cadeiras/espreguiçadeiras/ombrelones, observar folhas; conferir nível das piscinas e completar; deixar cheias para o fim de semana.",fotos:[]},
    {icon:"flame",titulo:"Gás (GLP)",onde:"casa dos botijões, externa ao portão da garagem",empresa:"Ultragaz · Beatriz",telefone:"(16) 99261-5636",passos:"Abastecimento a cada ~10 dias; zelador acompanha se possível (ou entrega as chaves; recibo com valor e Kg).\nReligue: zelador acompanha o prestador.\nCorte: portaria avisa o zelador e o morador antes.",fotos:[{img:"",cap:"Central de gás · reguladores"}]},
    {icon:"drop",titulo:"Bombas do recalque",onde:"2º subsolo, ao lado do portão veicular",empresa:"Solutec · Jair",telefone:"(16) 98182-4200",passos:"Abastecem os reservatórios superiores. Quadro em automático alternado bomba 1 e 2.\nRotina: quadro ligado em automático; níveis inferior e superior; testar boias; verificar vazamento (juntas, rolamentos, conexões).",fotos:[{img:"",cap:"Bombas e quadro de comando"}]},
    {icon:"bolt",titulo:"Sala dos medidores (energia)",onde:"corredor de acesso do estacionamento térreo",empresa:"CPFL Paulista",telefone:"0800 010 10 10",passos:"Leitura acompanhada por funcionário do prédio.\nCorte: portaria avisa o morador antes.\nNovo medidor: avisar os apartamentos do quadro com antecedência e acompanhar.",fotos:[]}]},
  {tipo:"textblocks",eyebrow:"Áreas comuns",icon:"calendar",titulo:"Reserva do salão de festas",sub:"Reserva feita direto com o zelador. Inadimplente não reserva.",two:false,blocos:[
    {titulo:"Descrição",txt:"Capacidade 96 pessoas. Duas geladeiras, dois fogões de 5 bocas e utensílios. Churrasqueira a gás (abrir o gás, fica fechado por segurança)."},
    {titulo:"Regras",txt:"Permitido buffet, música ao vivo em altura ambiente e monitor de crianças. Termo de responsabilidade + checklist de utensílios (talheres, copos, pratos) na entrega e na devolução; anotar perdas para reposição/cobrança."},
    {titulo:"Atenção",txt:"Não retirar móveis dos salões; sem aglomeração nas áreas comuns; convidados não usam academia, piscina, quadra etc.; não pendurar enfeites em teto/paredes/luminárias. Verificar portas externas fechadas."}]},

  {tipo:"textblocks",eyebrow:"Controle",icon:"truck",titulo:"Mudanças e entregas",two:false,blocos:[
    {titulo:"Mudanças",txt:"Morador solicita autorização à administradora (AGOS) e agenda com o zelador (mín. 5 dias) para reservar a vaga na rua. Horário (regimento): seg a sex, 08h às 17h."},
    {titulo:"Lembrete",txt:"Orientar prestadores a levar os móveis do apto direto para o elevador e vice-versa; não deixar móveis nos corredores."}]},
  {tipo:"parte",num:"03",ptitulo:"Emergências & Contingência",ptxt:"Quem acionar quando algo dá errado.",chips:["Energia","Água","Elevador","Gerador","Contatos"]},
  {tipo:"table",eyebrow:"Contingência",icon:"phone",titulo:"Contatos de Emergência Utilidade Pública",headers:["Sistema / Serviço","Responsável","Telefone"],rows:[
    ["Energia","CPFL","0800 010 10 10"],["Elevadores","Atlas Schindler","0800 055 1918"],["Administradora","AGOS","(16) 3102-9595"],["Gerador","CDMC","(16) 99151-8210"],["Câmeras/Portões","AGT","(11) 96478-8474"],["Bombas","Solutec · Jair","(16) 98182-4200"],["Gás","Ultragaz · Beatriz","(16) 99261-5636"],["Síndico","Mafra Gestão Integrada","(16) 99284-5898"],["EMERGÊNCIAS","Polícia / Bombeiros / SAMU","190 · 193 · 192"],["Defesa Civil","Defesa Civil","199"],["Violência contra a mulher","Central de Atendimento","180"]]},
  _padraoSec()
 ]
};

/* ---------------- MISTO — Trio / Bella Vista (Home · Office · Mall) ---------------- */
PROC_MODELS.misto={
 nome:"Novo condomínio misto",subtitulo:"Manual de Procedimentos · Uso Misto (residencial + comercial)",tipo:"misto",capa:"",_capaLegenda:"",atualizadoEm:null,atualizadoPor:"",
 secoes:[
  {tipo:"dl",eyebrow:"Identificação",icon:"pin",titulo:"Identificação do condomínio",sub:"Empreendimento de uso misto com torres residenciais e comerciais.",grupos:[
    {titulo:"Dados do empreendimento",rows:[
      {icon:"home",k:"Categoria",v:"Uso misto · Torres Home (residencial), Office (comercial) e Mall"},
      {icon:"doc",k:"CNPJ",v:"preencher"},
      {icon:"pin",k:"Endereço",v:"preencher"},
      {icon:"calendar",k:"Mandato",v:"preencher início e fim"}]},
    {titulo:"Governança e contatos",add:true,rows:[
      {icon:"shield",k:"Síndico",v:"Mafra Gestão Integrada · (16) 99284-5898"},
      {icon:"user",k:"Gerente predial",v:"nome e telefone"},
      {icon:"building",k:"Administradora",v:"preencher"},
      {icon:"wrench",k:"Construtora",v:"preencher"},
      {icon:"monitor",k:"CCO / portaria",v:"telefone interno"}]}]},
  {tipo:"textblocks",eyebrow:"Estrutura",icon:"grid",titulo:"Torres e uso misto",sub:"Cada torre tem uso e rotina próprios — mas os sistemas críticos são compartilhados.",two:true,blocos:[
    {titulo:"Torre Home",txt:"Residencial (apartamentos). Áreas comuns de lazer, garagem e portaria social."},
    {titulo:"Torre Office",txt:"Comercial (salas). Horário comercial, controle de acesso de visitantes e prestadores."},
    {titulo:"Mall / térreo",txt:"Lojas, acessos e circulação. Atenção a horários de funcionamento e entregas."},
    {titulo:"Áreas técnicas",txt:"CCO, casa de geradores, casa de bombas, quadros gerais por torre, central de incêndio setorizada, VRP."}]},
  {tipo:"parte",num:"01",ptitulo:"Sistemas e como acionar",ptxt:"Como funciona e quem chamar em cada sistema — vários são setorizados por torre.",chips:["Câmeras/CCO","Portões LPR+facial","Elevadores","Geradores","Piscinas","Quadros/DR","VRP","Incêndio","Gás","Ar","Água"]},
  {tipo:"sistemas",eyebrow:"Sistemas do complexo",icon:"activity",titulo:"Sistemas e como acionar",sub:"Preencha empresa/telefone; o passo a passo já vem pronto.",itens:[
    {icon:"cctv",titulo:"Câmeras e CCO",onde:"Centro de Controle Operacional (CCO)",empresa:"AGT",telefone:"preencher",passos:"Operação centralizada no CCO; cada operador com login próprio.\nQueda/travamento: reiniciar a estação do CCO e reabrir os programas de câmeras e controle de acesso.\nNão resolvendo, acionar a AGT e registrar.",fotos:[{img:"",cap:"Monitores do CCO · setas ① ②"}]},
    {icon:"door",titulo:"Portões e acesso veicular",onde:"portarias das torres / CCO",empresa:"AGT + Eletrocompany",telefone:"preencher",passos:"Leitura por LPR (placa) + reconhecimento facial.\nMotores BV-Flex PPA 220V.\nQueda: abrir manualmente pela botoeira/liberação; em pane do motor, acionar a Eletrocompany.\nRotina: sensores, fotocélula e lubrificação.",fotos:[{img:"",cap:"Motor BV-Flex / botoeira"}]},
    {icon:"chevron",titulo:"Elevadores",onde:"interfones das cabines",empresa:"TK Elevadores · Lucas",telefone:"(16) 99712-7329",passos:"Preso: falar pelo interfone e ligar na TK, abrir chamado e anotar o nº; grave -> Bombeiros 193.\nParado com porta aberta: placa \"em manutenção\", interditar e registrar.",fotos:[]},
    {icon:"fuel",titulo:"Geradores (3)",onde:"casa de geradores",empresa:"Cardoso · Nilton",telefone:"(17) 99703-8717",passos:"Três geradores atendendo o complexo; acionam automático na falta de energia.\nRotina: níveis (diesel, óleo, água do radiador) com máquina fria; teste semanal com carga; retornar ao modo AUTO.\nAtenção ao rateio de cargas essenciais por torre.",fotos:[{img:"",cap:"Casa de geradores"}]},
    {icon:"pool",titulo:"Piscinas",onde:"casas de máquinas das piscinas",empresa:"Manoel",telefone:"(16) 98100-0230",passos:"Conferir nível, cloro e filtragem; organizar mobiliário; completar nível e deixar prontas para o fim de semana.",fotos:[]},
    {icon:"bolt",titulo:"Quadros gerais e reset de DR",onde:"quadro geral de cada torre",empresa:"eletricista de plantão",telefone:"preencher",passos:"Queda parcial: localizar o quadro da torre afetada.\nReset do DR: desarmar o DR, desligar todos os disjuntores auxiliares, armar o DR e religar um a um até identificar o circuito que derruba.\nNão insistir no religamento se houver cheiro/aquecimento — chamar eletricista.",fotos:[{img:"",cap:"Quadro geral · DR ① disjuntores ②"}]},
    {icon:"drop",titulo:"VRP (válvula redutora de pressão)",onde:"barrilete/prumadas",empresa:"Wilson",telefone:"(16) 98121-0035",passos:"Controla a pressão da água nas prumadas.\nPressão alta/baixa ou golpe de aríete: acionar o responsável; não alterar o ajuste sem orientação técnica.",fotos:[]},
    {icon:"flame",titulo:"Incêndio setorizado",onde:"centrais por setor + claviculário",empresa:"Asystem · Marcelo",telefone:"(11) 98360-5012",passos:"Sistema setorizado: identificar o setor no painel -> silenciar -> confirmar -> RESET -> registrar.\nPossui sprinkler, bomba jockey (joker) e claviculário com chaves numeradas.\nEmergência real -> Bombeiros 193 e liberar acessos.",fotos:[{img:"",cap:"Central setorizada · ① ② ③"},{img:"",cap:"Claviculário · chaves numeradas"}]},
    {icon:"flame",titulo:"Gás natural (encanado)",onde:"central/medição por torre",empresa:"Brasiliano Gás",telefone:"preencher",passos:"Gás natural encanado (sem troca de botijões).\nVazamento (cheiro): não acionar interruptores, ventilar, fechar o registro do setor e acionar a distribuidora; emergência -> Bombeiros 193.",fotos:[]},
    {icon:"activity",titulo:"Ar-condicionado (por sala/unidade)",onde:"cada sala/unidade",empresa:"por unidade",telefone:"preencher",passos:"Climatização individual por sala/unidade (responsabilidade do ocupante).\nÁreas comuns: registrar defeito e acionar o prestador do condomínio.",fotos:[]},
    {icon:"drop",titulo:"Água individualizada (medição)",onde:"medidores por unidade",empresa:"Individual Tech · Evandro",telefone:"(16) 99784-4018",passos:"Medição individualizada por unidade.\nLeitura/falha de medidor ou vazamento: acionar a Individual Tech e registrar a unidade.",fotos:[]}]},
  {tipo:"parte",num:"02",ptitulo:"Emergências & Contingência",ptxt:"Quem acionar quando algo dá errado — atenção ao setor/torre afetado.",chips:["Energia","Água","Elevador","Incêndio","Contatos"]},
  {tipo:"table",eyebrow:"Contingência",icon:"phone",titulo:"Contatos de Emergência Utilidade Pública",headers:["Sistema / Serviço","Responsável","Telefone"],rows:[
    ["Energia","CPFL","0800 010 10 10"],["Elevadores","TK · Lucas","(16) 99712-7329"],["Geradores","Cardoso · Nilton","(17) 99703-8717"],["Incêndio","Asystem · Marcelo","(11) 98360-5012"],["Câmeras/Portões","AGT / Eletrocompany","preencher"],["VRP","Wilson","(16) 98121-0035"],["Piscinas","Manoel","(16) 98100-0230"],["Água individual","Individual Tech · Evandro","(16) 99784-4018"],["Síndico","Mafra Gestão Integrada","(16) 99284-5898"],["EMERGÊNCIAS","Polícia / Bombeiros / SAMU","190 · 193 · 192"],["Defesa Civil","Defesa Civil","199"],["Violência contra a mulher","Central de Atendimento","180"]]},
  _padraoSec()
 ]
};

/* ---------------- LOTEAMENTO — condomínio de casas (guarita, vias, obras) ---------------- */
PROC_MODELS.loteamento={
 nome:"Novo loteamento",subtitulo:"Manual de Procedimentos · Loteamento / Condomínio de Casas",tipo:"loteamento",capa:"",_capaLegenda:"",atualizadoEm:null,atualizadoPor:"",
 secoes:[
  {tipo:"dl",eyebrow:"Identificação",icon:"pin",titulo:"Identificação do condomínio",sub:"Condomínio de casas: lotes prontos (moradia) e lotes em construção.",grupos:[
    {titulo:"Dados do empreendimento",rows:[
      {icon:"home",k:"Categoria",v:"Horizontal · Condomínio de casas / Loteamento fechado"},
      {icon:"grid",k:"Lotes",v:"Total: — · Construídos: — · Em obra: — · Vazios: —"},
      {icon:"doc",k:"CNPJ / registro",v:"preencher"},
      {icon:"pin",k:"Endereço",v:"preencher"},
      {icon:"calendar",k:"Mandato",v:"preencher início e fim"}]},
    {titulo:"Governança e contatos",add:true,rows:[
      {icon:"shield",k:"Síndico / associação",v:"Mafra Gestão Integrada · (16) 99284-5898"},
      {icon:"userCheck",k:"Zelador / encarregado",v:"nome e telefone"},
      {icon:"shield",k:"Portaria / guarita",v:"telefone 24h"},
      {icon:"building",k:"Administradora",v:"preencher"},
      {icon:"wrench",k:"Loteadora / construtora",v:"preencher"}]}]},
  {tipo:"parte",num:"01",ptitulo:"Segurança e Acesso",ptxt:"O coração do loteamento: guarita 24h, controle de acesso, ronda e perímetro.",chips:["Guarita 24h","Acesso veicular","Portões","Ronda perimetral","CFTV","Rádios"]},
  {tipo:"sistemas",eyebrow:"Segurança e acesso",icon:"shield",titulo:"Segurança e como acionar",sub:"Preencha empresa/telefone; o passo a passo já vem pronto.",itens:[
    {icon:"shield",titulo:"Guarita / portaria 24h",onde:"portaria principal",empresa:"empresa de portaria",telefone:"preencher",passos:"Turnos cobrindo 24h; passagem de serviço com registro no livro.\nVisitante/prestador: identificar, conferir autorização do morador (lista por lote) e registrar entrada/saída.\nEncomendas: receber, registrar e avisar o morador.",fotos:[{img:"",cap:"Portaria · fluxo de acesso ① ② ③"}]},
    {icon:"door",titulo:"Controle de acesso veicular",onde:"cancelas/portões da entrada",empresa:"empresa do sistema (LPR/tag/facial)",telefone:"preencher",passos:"Morador: tag/placa (LPR) ou facial. Visitante: liberação pela guarita.\nQueda de energia: abrir manualmente (botoeira/liberação); o gerador da guarita assume, se houver.\nRotina: sensores, fotocélula e lubrificação das cancelas.",fotos:[{img:"",cap:"Cancela / leitor de placa"}]},
    {icon:"door",titulo:"Portões (principal, serviço e pedestres)",onde:"acessos do perímetro",empresa:"serralheiro / manutenção de portões",telefone:"preencher",passos:"Cada portão tem disjuntor de comando; para abrir manual, desligar o disjuntor e liberar a trava.\nPortão de pedestres: tag/biometria.\nPane do motor: acionar o prestador e manter o acesso controlado pela guarita.",fotos:[]},
    {icon:"eye",titulo:"Ronda perimetral",onde:"todo o perímetro e vias internas",empresa:"vigilância / ronda",telefone:"preencher",passos:"Ronda a pé/motorizada em intervalos definidos, com pontos de checagem.\nVerificar muro/cerca/concertina, alambrado e sensores; registrar anormalidades.\nAcionar a guarita e o síndico diante de qualquer invasão ou dano.",fotos:[]},
    {icon:"cctv",titulo:"CFTV de perímetro e vias",onde:"gravador na guarita/CCO",empresa:"empresa de CFTV",telefone:"preencher",passos:"Câmeras no perímetro, acessos e vias; verificar gravação e backup diariamente.\nFalha: reiniciar o gravador; não resolvendo, acionar a empresa e registrar.",fotos:[{img:"",cap:"Monitores da guarita"}]},
    {icon:"message",titulo:"Comunicação (rádios HT)",onde:"guarita, ronda e zelador",empresa:"—",telefone:"—",passos:"Rádios HT entre guarita, ronda e zelador; carregar as baterias por turno.\nProtocolo de chamada objetivo (identificação + ponto + ocorrência).",fotos:[]}]},
  {tipo:"parte",num:"02",ptitulo:"Vias, Infraestrutura & Áreas Comuns",ptxt:"Iluminação das ruas, drenagem, água, esgoto, energia e clube.",chips:["Iluminação","Drenagem","Água/Poço","Reservatório","Esgoto/ETE","Energia","Clube"]},
  {tipo:"sistemas",eyebrow:"Infraestrutura",icon:"road",titulo:"Infraestrutura e como acionar",sub:"Marque como “não se aplica” o que o loteamento não tiver (poço, ETE, gerador, gás).",itens:[
    {icon:"bolt",titulo:"Iluminação das vias",onde:"postes das ruas internas",empresa:"eletricista / manutenção",telefone:"preencher",passos:"Acende por fotocélula/temporizador ao anoitecer.\nTrecho apagado: conferir fotocélula, disjuntor do trecho e lâmpadas queimadas; registrar e programar a troca.",fotos:[]},
    {icon:"drop",titulo:"Drenagem e águas pluviais",onde:"bocas de lobo e galerias das vias",empresa:"manutenção",telefone:"preencher",passos:"Limpeza periódica de bocas de lobo e grelhas, principalmente antes do período de chuvas, para evitar alagamento.\nApós temporais, verificar pontos de acúmulo e erosão.",fotos:[{img:"",cap:"Boca de lobo / grelha"}]},
    {icon:"drop",titulo:"Abastecimento de água",onde:"concessionária e/ou poço artesiano",empresa:"concessionária / empresa do poço",telefone:"preencher",passos:"Se poço artesiano: manter a outorga vigente; controlar bomba, cloração e análise de potabilidade periódica.\nSe concessionária: acompanhar leitura e ramal principal.\nRegistrar níveis dos reservatórios diariamente.",fotos:[{img:"",cap:"Casa do poço / bomba"}]},
    {icon:"drop",titulo:"Reservatórios e recalque",onde:"casa de bombas / reservatório elevado",empresa:"manutenção hidráulica",telefone:"preencher",passos:"Bombas de recalque enchem os reservatórios; quadro em automático alternado.\nRotina: níveis, boias e vazamentos; limpeza dos reservatórios conforme cronograma.",fotos:[]},
    {icon:"activity",titulo:"Esgoto / ETE",onde:"rede pública ou estação de tratamento própria",empresa:"concessionária / operador da ETE",telefone:"preencher",passos:"Se ETE própria: operação e análises periódicas por empresa especializada; monitorar odor e descarte conforme licença ambiental.\nSe rede pública: acompanhar a concessionária em obstruções.",fotos:[]},
    {icon:"bolt",titulo:"Energia e subestação",onde:"subestação / medição das áreas comuns",empresa:"CPFL",telefone:"0800 010 10 10",passos:"Atende guarita, iluminação das vias e áreas comuns.\nQueda geral: inspecionar a entrada/subestação; queda parcial: conferir quadros das áreas comuns.\nGerador da guarita (se houver) assume automático.",fotos:[]},
    {icon:"pool",titulo:"Áreas comuns / clube",onde:"salão, piscina, quadra, playground",empresa:"manutenção / piscineiro",telefone:"preencher",passos:"Reserva do salão com a administração/zelador (termo + checklist de utensílios).\nPiscina: nível, cloro e filtragem; quadra e playground: conservação e segurança.",fotos:[]}]},
  {tipo:"parte",num:"03",ptitulo:"Obras nos Lotes",ptxt:"Regras e fiscalização das construções em andamento — o que diferencia um loteamento.",chips:["Documentação","Horários","Caçamba","Ligações","Circulação","Taxa/Caução","Fiscalização"]},
  {tipo:"callout",eyebrow:"Atenção",icon:"alert",titulo:"Como fiscalizar as obras",sub:"",tone:"warn",cicon:"camera",ctitulo:"Fiscalize com fotos numeradas",ctxt:"Registre a obra com fotos numeradas (① ② ③) na vistoria de entrada, durante e no fim. É a prova para liberar caução e cobrar danos à via ou aos lotes vizinhos."},
  {tipo:"steps",eyebrow:"Obras nos lotes",icon:"truck",titulo:"Regras e fiscalização de obras",stepIcon:true,itens:[
    {icon:"doc",titulo:"Início de obra (documentação)",txt:"Antes de iniciar: projeto aprovado na prefeitura, ART/RRT do responsável técnico, alvará, cadastro do construtor/mestre e seguro. Vistoria de entrada com fotos da via e dos lotes vizinhos."},
    {icon:"clock",titulo:"Horários e conduta",txt:"Trabalho apenas nos dias/horários definidos pelo regimento; respeitar silêncio fora do horário. Uso de EPI, tapume/cerca no lote e proibição de obstruir a via."},
    {icon:"box",titulo:"Caçamba e entulho",txt:"Caçamba somente dentro do lote ou em local autorizado, por prazo limitado. Proibido depositar entulho na via, em áreas comuns ou em lote vizinho. Empresa de caçamba cadastrada."},
    {icon:"bolt",titulo:"Ligações provisórias",txt:"Água e energia de obra em ligação provisória regularizada; sem puxadinhos na rede do condomínio."},
    {icon:"truck",titulo:"Circulação de caminhão e betoneira",txt:"Acesso de caminhões/betoneira em horário e rota definidos. Lavagem de roda e limpeza para não sujar a via; descarga sem bloquear a passagem."},
    {icon:"refresh",titulo:"Limpeza da via",txt:"Manter a rua e a calçada limpas ao fim do dia; sujeira/entulho na via gera notificação e multa conforme regimento."},
    {icon:"hash",titulo:"Taxa e caução de obra",txt:"Cobrança da taxa/caução de obra no início; devolução após a vistoria de saída sem danos às áreas comuns."},
    {icon:"eye",titulo:"Fiscalização e fim de obra",txt:"Acompanhamento periódico com fotos. Ao concluir: habite-se e vistoria de saída; liberar a caução e atualizar o cadastro do lote (de \"em obra\" para \"construído\")."}]},
  {tipo:"checkcols",eyebrow:"Rotina diária",icon:"list",titulo:"Ronda diária das vias e áreas comuns",sub:"Percorra o loteamento e marque o que verificou.",cols:[
    {icon:"shield",titulo:"Guarita e acessos",itens:["Passagem de turno registrada","Cancelas/portões funcionando","Lista de autorizados atualizada","Encomendas registradas"]},
    {icon:"road",titulo:"Vias e sinalização",itens:["Iluminação das ruas ok","Sem buracos/obstruções","Placas e lombadas visíveis","Velocidade sinalizada"]},
    {icon:"tree",titulo:"Praças e áreas verdes",itens:["Sem lixo ou entulho","Irrigação/poda em dia","Playground conservado","Mobiliário íntegro"]},
    {icon:"drop",titulo:"Água e drenagem",itens:["Níveis dos reservatórios","Bombas em automático","Bocas de lobo limpas","Sem vazamentos aparentes"]},
    {icon:"truck",titulo:"Obras em andamento",itens:["Horário respeitado","Via limpa (sem entulho)","Caçamba no local certo","EPI e tapume ok"]},
    {icon:"eye",titulo:"Perímetro",itens:["Muro/cerca/concertina íntegros","Câmeras gravando","Sem sinais de invasão","Ronda nos pontos de checagem"]}]},
  {tipo:"textblocks",eyebrow:"Serviços",icon:"box",titulo:"Coleta de resíduos e correspondência",two:true,blocos:[
    {titulo:"Coleta de resíduos",txt:"Casas levam o lixo ao ecoponto/contêiner nos dias e horários definidos; reciclagem separada; entulho de obra é responsabilidade da obra (caçamba), nunca no lixo comum."},
    {titulo:"Correspondência e encomendas",txt:"Recebidas na guarita, registradas e guardadas em armários; morador avisado. Prestadores e entregadores entram com autorização e registro."}]},
  {tipo:"parte",num:"04",ptitulo:"Emergências & Contingência",ptxt:"Quem acionar quando algo dá errado.",chips:["Energia","Água","Perímetro","Incêndio","Contatos"]},
  {tipo:"table",eyebrow:"Contingência",icon:"phone",titulo:"Contatos de Emergência Utilidade Pública",headers:["Sistema / Serviço","Responsável","Telefone"],rows:[
    ["Energia","CPFL","0800 010 10 10"],["Água / Poço","concessionária / poço","preencher"],["Esgoto / ETE","operador","preencher"],["Portões / Acesso","manutenção","preencher"],["CFTV","empresa de câmeras","preencher"],["Portaria / Ronda","segurança","preencher"],["Administradora","—","preencher"],["Síndico","Mafra Gestão Integrada","(16) 99284-5898"],["EMERGÊNCIAS","Polícia / Bombeiros / SAMU","190 · 193 · 192"],["Defesa Civil","Defesa Civil","199"],["Violência contra a mulher","Central de Atendimento","180"]]},
  _padraoSec()
 ]
};

/* ============================================================================
   EDITOR DO MANUAL — formulário em modal, no MESMO padrão do Relatório Gerencial
   (modalMount > overlay > modal-head / modal-body / modal-foot, rel-sec-h,
    field + label + input, btn-ghost p/ adicionar, btn-primary p/ salvar)
   ============================================================================ */
var _procEdBIND=[], _procEdPB=[], _procEdDirty=false;
var _PE_INP='width:100%;padding:9px 11px;border:1.5px solid var(--line);border-radius:9px;background:#FCFBF8;font-size:14px';
var _PE_LBL='display:block;font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--muted);margin-bottom:5px';
var _PE_CARD='border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;margin-bottom:10px;background:#fff';

function _pEdIn(obj,key,ph){var i=_procEdBIND.push({obj:obj,key:key})-1;return '<input data-eb="'+i+'" value="'+esc(obj[key]||"")+'" placeholder="'+esc(ph||"")+'" style="'+_PE_INP+'">';}
function _pEdTA(obj,key,ph,rows){var i=_procEdBIND.push({obj:obj,key:key})-1;var id="peta_"+i;
  return '<textarea id="'+id+'" data-eb="'+i+'" rows="'+(rows||3)+'" placeholder="'+esc(ph||"")+'" style="'+_PE_INP+'">'+esc(obj[key]||"")+'</textarea>'+(typeof _ortoBtn==="function"?_ortoBtn(id):"");}
function _pEdLista(obj,key,ph,rows){var i=_procEdBIND.push({obj:obj,key:key,lista:true})-1;var id="peta_"+i;var v=(Array.isArray(obj[key])?obj[key]:[]).join("\n");
  return '<textarea id="'+id+'" data-eb="'+i+'" rows="'+(rows||4)+'" placeholder="'+esc(ph||"")+'" style="'+_PE_INP+'">'+esc(v)+'</textarea>'+(typeof _ortoBtn==="function"?_ortoBtn(id):"");}
function _pEdHint(t){ return t?'<div style="font-size:10.5px;line-height:1.35;color:#8a94a3;margin:-2px 0 6px;font-weight:400;text-transform:none;letter-spacing:0">'+esc(t)+'</div>':""; }
function _pEdField(label,campo,hint){return '<div class="field"><label style="'+_PE_LBL+'">'+esc(label)+'</label>'+_pEdHint(hint)+campo+'</div>';}
function _pEdRmBtn(x,titulo){return '<button type="button" onclick="_procEdAcao(\''+x+'\')" title="'+esc(titulo||"Remover")+'" style="border:none;background:none;color:#b8402f;cursor:pointer;padding:0;display:inline-flex;align-items:center">'+_pico("trash",15)+'</button>';}
function _pEdAddBtn(x,label){return '<button type="button" class="btn-ghost" onclick="_procEdAcao(\''+x+'\')" style="margin-top:2px">＋ '+esc(label)+'</button>';}
function _pEdFoto(f,x){var i=_procEdPB.push({obj:f,key:"img"})-1;
  var thumb=f.img?'<div style="width:74px;height:74px;border-radius:8px;background-size:cover;background-position:center;background-image:url(\''+f.img+'\');border:1.5px solid var(--line);flex:none"></div>'
                 :'<div style="width:74px;height:74px;border-radius:8px;border:1.5px dashed var(--line);background:#FCFBF8;display:flex;align-items:center;justify-content:center;color:var(--muted);flex:none">'+_pico("camera",20)+'</div>';
  return '<div style="display:flex;gap:9px;align-items:center;margin-bottom:8px">'+thumb
    +'<div style="flex:1;min-width:0">'+_pEdIn(f,"cap","Legenda da foto (ex.: painel do -1)")
    +'<div style="display:flex;gap:6px;margin-top:5px">'
    +'<label class="btn-ghost" style="font-size:11px;padding:4px 9px;cursor:pointer;display:inline-block">'+(f.img?"Trocar":"Anexar")+'<input type="file" accept="image/*" style="display:none" onchange="setFotoProc('+i+',this.files)"></label>'
    +(f.img?'<button type="button" class="btn-ghost" onclick="rmFotoProc('+i+')" style="font-size:11px;padding:4px 9px;color:#b8402f">Remover foto</button>':"")
    +'<button type="button" class="btn-ghost" onclick="_procEdAcao(\''+x+'\')" style="font-size:11px;padding:4px 9px;color:#b8402f">Excluir</button></div></div></div>';}
async function setFotoProc(i,files){
  if(!files||!files.length) return;
  var t=_procEdPB[i]; if(!t) return;
  try{ var r=await comprimirImagem(files[0],1280,0.8); if(r&&r.foto){ t.obj[t.key]=r.foto; _procEdDirty=true; _procEdRender(); } }
  catch(e){ alert("Não consegui processar a imagem. Tente outra foto."); }
}
function rmFotoProc(i){ var t=_procEdPB[i]; if(!t) return; t.obj[t.key]=""; _procEdDirty=true; _procEdRender(); }
async function addFotosProc(alvo,files){
  if(!files||!files.length) return;
  var p=String(alvo).split(":"), m=_procM(); if(!m) return;
  var S=m.secoes, i=+p[1], arr=null;
  if(p[0]==="sis" && S[i] && S[i].itens && S[i].itens[+p[2]]){ if(!Array.isArray(S[i].itens[+p[2]].fotos)) S[i].itens[+p[2]].fotos=[]; arr=S[i].itens[+p[2]].fotos; }
  else if(p[0]==="tb" && S[i] && S[i].blocos && S[i].blocos[+p[2]]){ if(!Array.isArray(S[i].blocos[+p[2]].fotos)) S[i].blocos[+p[2]].fotos=[]; arr=S[i].blocos[+p[2]].fotos; }
  if(!arr) return;
  for(var k=0;k<files.length;k++){
    try{ var r=await comprimirImagem(files[k],1280,0.8); if(r&&r.foto) arr.push({img:r.foto,cap:""}); }catch(e){}
  }
  _procEdDirty=true; _procEdRender();
}

/* ---- formulário por tipo de seção ---- */
function _procEdTitulo(sec){
  var k=(sec.tipo==="parte")?"ptitulo":"titulo";
  var ti=_procEdBIND.push({obj:sec,key:k})-1;
  return '<div class="rel-sec-h" style="display:flex;align-items:center;gap:8px">'+_pico(sec.icon||"doc",16)
    +'<input data-eb="'+ti+'" value="'+esc(sec[k]||"")+'" placeholder="nome da seção" title="Clique para renomear a seção" style="flex:1;min-width:0;border:none;border-bottom:1.5px dashed rgba(0,0,0,.2);background:transparent;font:inherit;color:inherit;padding:1px 3px;outline:none">'
    +'</div>';
}
function _procEdSecao(sec,i){
  var H=_procEdTitulo(sec);
  if(sec.tipo==="parte") return H+'<div style="font-size:12px;color:var(--muted);margin:-4px 0 10px">Divisória do manual (capa da parte). Mostra apenas o título e as tags.</div>';
  if(sec.tipo==="padrao") return H+'<div style="font-size:12px;color:var(--muted);margin:-4px 0 10px">Rodapé padrão Mafra — já vem pronto no manual.</div>';
  var b="";
  if(sec.tipo==="dl"){
    b=sec.grupos.map(function(g,gi){
      var GT='<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--gold,#b8912f);margin-bottom:8px">'+esc(g.titulo)+'</div>';
      if(_procGrupoContatos(g)){
        var GTE='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="flex:1">'+_pEdIn(g,"titulo","nome do grupo (ex.: Prestadores de serviço)")+'</div>'+(g.fixo?"":_pEdRmBtn("grprm:"+i+":"+gi,"Remover este grupo de contatos"))+'</div>';
        var cards=g.rows.map(function(r,j){
          _procParseContato(r);
          return '<div style="'+_PE_CARD+'">'
            +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="flex:1">'+_pEdIn(r,"k","cargo / papel (ex.: Síndico, Zelador)")+'</div>'+_pEdRmBtn("dlrm:"+i+":"+gi+":"+j,"Remover contato")+'</div>'
            +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
              +'<div class="field" style="flex:1;min-width:150px"><label style="'+_PE_LBL+'">Empresa</label>'+_pEdHint("Nome da empresa (deixe vazio se for pessoa física).")+_pEdIn(r,"empresa","nome da empresa")+'</div>'
              +'<div class="field" style="flex:1;min-width:150px"><label style="'+_PE_LBL+'">Pessoa</label>'+_pEdHint("Nome do responsável direto.")+_pEdIn(r,"pessoa","nome da pessoa")+'</div>'
            +'</div>'
            +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
              +'<div class="field" style="flex:1;min-width:130px"><label style="'+_PE_LBL+'">Departamento</label>'+_pEdHint("Setor/área de atuação.")+_pEdIn(r,"departamento","ex.: Financeiro, Manutenção")+'</div>'
              +'<div class="field" style="flex:1;min-width:130px"><label style="'+_PE_LBL+'">Contato</label>'+_pEdHint("Telefone ou WhatsApp para acionar.")+_pEdIn(r,"telefone","telefone / WhatsApp")+'</div>'
            +'</div>'
            +_pEdField("E-mail",_pEdIn(r,"email","email@exemplo.com.br"),"E-mail de contato (opcional).")
            +'</div>';
        }).join("");
        return '<div style="border:1.5px solid var(--line);border-radius:12px;padding:12px 12px 10px;margin-bottom:12px;background:#FCFBF8">'+GTE+cards+_pEdAddBtn("dladd:"+i+":"+gi,"Pessoa / contato")+'</div>';
      }
      var rows=g.rows.map(function(r,j){
        var rm=(g.add?' '+_pEdRmBtn("dlrm:"+i+":"+gi+":"+j):"");
        return '<div class="field"><label style="'+_PE_LBL+'">'+esc(r.k)+rm+'</label>'+_pEdIn(r,"v",r.k)+'</div>';
      }).join("");
      return '<div style="'+_PE_CARD+'">'+GT+'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px 14px">'+rows+'</div>'+(g.add?_pEdAddBtn("dladd:"+i+":"+gi,"Item"):"")+'</div>';
    }).join("");
    b+='<button type="button" class="btn-ghost" onclick="_procEdAcao(\'grpadd:'+i+'\')" style="margin-top:2px">＋ Novo grupo de contatos</button>';
  }
  else if(sec.tipo==="sistemas"){
    b='<div style="font-size:12px;color:var(--muted);margin:-4px 0 10px">Preencha empresa, telefone e onde fica. O passo a passo já vem pronto — ajuste se precisar. Nas fotos, numere os pontos ① ② ③.</div>';
    b+=sec.itens.map(function(s,j){
      if(!Array.isArray(s.pessoas)) s.pessoas=[];
      if(!Array.isArray(s.fotos)) s.fotos=[];
      var cab='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="flex:1">'+_pEdIn(s,"titulo","nome do sistema / área")+'</div>'+_pEdRmBtn("sisrm:"+i+":"+j,"Remover sistema")+'</div>';
      var f1=_pEdField("Empresa",_pEdIn(s,"empresa","nome da empresa responsável"),"Empresa que faz a manutenção deste sistema.")
        +_pEdField("Telefone / 0800 da empresa",_pEdIn(s,"telefone","telefone geral / 0800"),"Telefone principal para acionar a empresa (ou 0800).");
      var f2='<div style="display:flex;gap:8px;flex-wrap:wrap">'
        +'<div class="field" style="flex:1;min-width:150px"><label style="'+_PE_LBL+'">Local</label>'+_pEdHint("Onde o equipamento fica fisicamente.")+_pEdIn(s,"onde","onde fica (ex.: subsolo -1, portaria)")+'</div>'
        +'<div class="field" style="flex:1;min-width:130px"><label style="'+_PE_LBL+'">Marca</label>'+_pEdHint("Marca/modelo do equipamento (opcional).")+_pEdIn(s,"marca","marca / modelo")+'</div>'
      +'</div>';
      var pessoas=s.pessoas.map(function(pe,k){
        return '<div style="border:1px solid var(--line);border-radius:10px;padding:9px 10px;margin-bottom:7px;background:#fff">'
          +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
            +'<div class="field" style="flex:1;min-width:130px"><label style="'+_PE_LBL+'">Técnico / pessoa</label>'+_pEdHint("Nome do técnico ou contato da empresa.")+_pEdIn(pe,"nome","nome")+'</div>'
            +'<div class="field" style="flex:1;min-width:120px"><label style="'+_PE_LBL+'">Departamento</label>'+_pEdHint("Setor da pessoa.")+_pEdIn(pe,"depto","ex.: Suporte, Financeiro")+'</div>'
          +'</div>'
          +'<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">'
            +'<div class="field" style="flex:1;min-width:120px"><label style="'+_PE_LBL+'">Contato</label>'+_pEdHint("Telefone/WhatsApp direto da pessoa.")+_pEdIn(pe,"telefone","telefone / WhatsApp")+'</div>'
            +'<div class="field" style="flex:1;min-width:140px"><label style="'+_PE_LBL+'">E-mail</label>'+_pEdHint("E-mail da pessoa (opcional).")+_pEdIn(pe,"email","email@empresa.com.br")+'</div>'
            +'<div style="padding-bottom:12px">'+_pEdRmBtn("pesrm:"+i+":"+j+":"+k,"Remover pessoa")+'</div>'
          +'</div></div>';
      }).join("");
      var blocoPessoas='<div class="field"><label style="'+_PE_LBL+'">Pessoas da empresa (técnico, financeiro…)</label>'+pessoas+_pEdAddBtn("pesadd:"+i+":"+j,"Pessoa / contato")+'</div>';
      var f3=_pEdField("Passo a passo (como acionar)",_pEdTA(s,"passos","o que fazer / como acionar",3),"O que fazer quando esse sistema falhar. Já vem um texto-base — ajuste ao seu prédio.");
      var fotos=s.fotos.map(function(f,k){return _pEdFoto(f,"fotorm:"+i+":"+j+":"+k);}).join("");
      var btnFotos='<label class="btn-ghost" style="cursor:pointer;display:inline-block;margin-top:2px">'+_pico("upload",14)+' Anexar arquivos<input type="file" accept="image/*" multiple style="display:none" onchange="addFotosProc(\'sis:'+i+':'+j+'\',this.files)"></label>';
      return '<div style="'+_PE_CARD+'">'+cab+f1+f2+blocoPessoas+f3+fotos+btnFotos+'</div>';
    }).join("");
    b+=_pEdAddBtn("sisadd:"+i,"Sistema / área");
  }
  else if(sec.tipo==="timeline"){
    b=sec.grupos.map(function(g,gi){
      var rows=g.rows.map(function(r,j){
        return '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px"><div style="width:90px;flex:none">'+_pEdIn(r,"hora","hora")+'</div><div style="flex:1">'+_pEdIn(r,"txt","o que fazer")+'</div>'+_pEdRmBtn("tlrm:"+i+":"+gi+":"+j)+'</div>';
      }).join("");
      return '<div style="'+_PE_CARD+'"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="flex:1">'+_pEdIn(g,"titulo","nome do bloco (ex.: Abertura)")+'</div>'+(sec.grupos.length>1?_pEdRmBtn("grtlrm:"+i+":"+gi,"Remover bloco"):"")+'</div>'+rows+_pEdAddBtn("tladd:"+i+":"+gi,"Horário")+'</div>';
    }).join("");
    b+=_pEdAddBtn("grtladd:"+i,"Bloco de horários");
  }
  else if(sec.tipo==="checkcols"){
    var _cl=sec.colLabel||"Área / lista";
    b='<div style="font-size:12px;color:var(--muted);margin:-4px 0 10px">Cada '+_cl.toLowerCase()+' é um checklist. Use ＋ Item para acrescentar e ＋ '+_cl+' para outra.</div>';
    b+=sec.cols.map(function(c,ci){
      var _itens=(Array.isArray(c.itens)?c.itens:[]).map(function(it,j){return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#b8912f" stroke-width="1.8" style="flex:none"><rect x="4" y="4" width="16" height="16" rx="3.5"/></svg><div style="flex:1;min-width:0">'+_pEdIn(c.itens,j,"item de verificação")+'</div>'+_pEdRmBtn("chkrm:"+i+":"+ci+":"+j,"Remover item")+'</div>';}).join("");
      return '<div style="'+_PE_CARD+'"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="flex:1">'+_pEdIn(c,"titulo","nome da "+_cl.toLowerCase())+'</div>'+_pEdRmBtn("colrm:"+i+":"+ci,"Remover")+'</div>'+_itens+_pEdAddBtn("chkadd:"+i+":"+ci,"Item")+'</div>';
    }).join("");
    b+=_pEdAddBtn("coladd:"+i,_cl);
  }
  else if(sec.tipo==="steps"){
    b=sec.itens.map(function(s,j){
      return '<div style="'+_PE_CARD+'"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="flex:1">'+_pEdIn(s,"titulo","título da etapa")+'</div>'+_pEdRmBtn("steprm:"+i+":"+j)+'</div>'+_pEdTA(s,"txt","descrição",2)+'</div>';
    }).join("")+_pEdAddBtn("stepadd:"+i,"Etapa");
  }
  else if(sec.tipo==="table"){
    var _hstyle='flex:1;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--muted)';
    var heads='<div style="display:flex;gap:6px;margin-bottom:5px">'+sec.headers.map(function(h,k){var hc='<div style="'+_hstyle+'">'+esc(h)+'</div>';if(sec.venc!=null&&k===sec.venc)hc+='<div style="'+_hstyle+'">Expira em</div>';return hc;}).join("")+'<div style="width:20px"></div></div>';
    var rows=sec.rows.map(function(row,ri){
      return '<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">'+row.map(function(cell,ci){
        if(sec.venc!=null&&ci===sec.venc){var di=_procEdBIND.push({obj:row,key:ci})-1;return '<div style="flex:1;min-width:0"><input type="date" data-eb="'+di+'" data-vencri="'+ri+'" value="'+esc(cell||"")+'" style="'+_PE_INP+'"></div><div data-vencbadge="'+ri+'" style="flex:1;min-width:0;display:flex;align-items:center">'+_vencBadge(cell)+'</div>';}
        if(sec.venc!=null&&sec.status&&ci===row.length-1){return '<div style="flex:1;min-width:0;display:flex;align-items:center" data-vencsit="'+ri+'">'+_vencSituacaoHTML(row[sec.venc])+'</div>';}
        return '<div style="flex:1;min-width:0">'+_pEdIn(row,ci,"—")+'</div>';
      }).join("")+_pEdRmBtn("rowrm:"+i+":"+ri)+'</div>';
    }).join("");
    b='<div style="'+_PE_CARD+'">'+heads+rows+_pEdAddBtn("rowadd:"+i,"Linha")+'</div>';
  }
  else if(sec.tipo==="textblocks"){
    b=sec.blocos.map(function(x,j){
      if(!Array.isArray(x.fotos)) x.fotos=[];
      var fotos=x.fotos.map(function(f,k){return _pEdFoto(f,"tbfotorm:"+i+":"+j+":"+k);}).join("");
      var btnF='<label class="btn-ghost" style="cursor:pointer;display:inline-block;margin-top:2px">'+_pico("upload",14)+' Anexar arquivos<input type="file" accept="image/*" multiple style="display:none" onchange="addFotosProc(\'tb:'+i+':'+j+'\',this.files)"></label>';
      return '<div style="'+_PE_CARD+'"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="flex:1">'+_pEdIn(x,"titulo","título (ex.: Térreo · Recepção)")+'</div>'+_pEdRmBtn("tbrm:"+i+":"+j)+'</div>'+_pEdTA(x,"txt","texto",3)+fotos+btnF+'</div>';
    }).join("")+_pEdAddBtn("tbadd:"+i,"Acrescentar bloco");
  }
  else if(sec.tipo==="stats"){
    if(!Array.isArray(sec.colaboradores)) sec.colaboradores=[];
    var listaC=_procCalcPessoal(sec);
    var temLista=!!(listaC&&listaC.length);
    var nums='<div style="'+_PE_CARD+'"><div style="display:flex;gap:8px;flex-wrap:wrap">'+sec.itens.map(function(s){
      var campo=temLista?('<div style="padding:9px 11px;border:1.5px solid var(--line);border-radius:9px;background:#f4f6f9;font-size:14px;text-align:center;font-weight:700">'+esc(s.n||"0")+'</div>'):_pEdIn(s,"n","0");
      return '<div style="flex:1;min-width:110px"><div class="field"><label style="'+_PE_LBL+'">'+esc(s.l||"Indicador")+'</label>'+campo+'</div></div>';}).join("")+'</div>'
      +(temLista?'<div style="font-size:11.5px;color:var(--muted);margin-top:4px">Contados automaticamente pela lista de colaboradores abaixo.</div>':'')+'</div>';
    var colabs=sec.colaboradores.map(function(c,k){
      var fi=_procEdPB.push({obj:c,key:"foto"})-1;
      var th=c.foto?'<div style="width:64px;height:64px;border-radius:50%;background-size:cover;background-position:center;background-image:url(\''+c.foto+'\');border:1.5px solid var(--line);flex:none"></div>'
                   :'<div style="width:64px;height:64px;border-radius:50%;border:1.5px dashed var(--line);background:#FCFBF8;display:flex;align-items:center;justify-content:center;color:var(--muted);flex:none">'+_pico("user",22)+'</div>';
      var vi=_procEdBIND.push({obj:c,key:"vinculo"})-1;
      var sel='<select data-eb="'+vi+'" style="'+_PE_INP+'"><option value="organico"'+(c.vinculo!=="terceirizado"?" selected":"")+'>Orgânico</option><option value="terceirizado"'+(c.vinculo==="terceirizado"?" selected":"")+'>Terceirizado</option></select>';
      var ni=_procEdBIND.push({obj:c,key:"nasc"})-1;
      var dt='<input type="date" data-eb="'+ni+'" value="'+esc(c.nasc||"")+'" style="'+_PE_INP+'">';
      var ii=_procEdBIND.push({obj:c,key:"inicio"})-1;
      var dtI='<input type="date" data-eb="'+ii+'" value="'+esc(c.inicio||"")+'" style="'+_PE_INP+'">';
      return '<div style="'+_PE_CARD+'"><div style="display:flex;gap:10px;align-items:flex-start">'
        +'<div style="text-align:center">'+th+'<label class="btn-ghost" style="font-size:10.5px;padding:3px 8px;cursor:pointer;display:inline-block;margin-top:5px">'+(c.foto?"Trocar":"Foto")+'<input type="file" accept="image/*" style="display:none" onchange="setFotoProc('+fi+',this.files)"></label></div>'
        +'<div style="flex:1;min-width:0">'
          +'<div style="display:flex;align-items:center;gap:8px"><div style="flex:1">'+_pEdIn(c,"nome","nome completo do colaborador")+'</div>'+_pEdRmBtn("colabrm:"+i+":"+k,"Remover colaborador")+'</div>'
          +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">'
            +'<div class="field" style="flex:1;min-width:130px"><label style="'+_PE_LBL+'">Cargo / função</label>'+_pEdHint("Cargo do colaborador.")+_pEdIn(c,"cargo","ex.: Zelador, Porteiro")+'</div>'
            +'<div class="field" style="flex:1;min-width:120px"><label style="'+_PE_LBL+'">Vínculo</label>'+_pEdHint("Orgânico = funcionário próprio; Terceirizado = de empresa parceira.")+sel+'</div>'
          +'</div>'
          +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
            +'<div class="field" style="flex:1;min-width:130px"><label style="'+_PE_LBL+'">CPF</label>'+_pEdHint("CPF do colaborador.")+_pEdIn(c,"cpf","000.000.000-00")+'</div>'
            +'<div class="field" style="flex:1;min-width:130px"><label style="'+_PE_LBL+'">Data de nascimento</label>'+_pEdHint("Data de nascimento do colaborador.")+dt+'</div>'
            +'<div class="field" style="flex:1;min-width:130px"><label style="'+_PE_LBL+'">Data de início</label>'+_pEdHint("Quando começou a trabalhar no condomínio.")+dtI+'</div>'
          +'</div>'
        +'</div></div></div>';
    }).join("");
    b=nums+'<div class="field"><label style="'+_PE_LBL+'">Colaboradores</label>'+colabs+_pEdAddBtn("colabadd:"+i,"Colaborador")+'</div>';
  }
  else if(sec.tipo==="callout"){
    b='<div style="'+_PE_CARD+'">'+_pEdField("Título do aviso",_pEdIn(sec,"ctitulo","título"),"Frase curta em destaque no topo do aviso.")+_pEdField("Texto",_pEdTA(sec,"ctxt","texto do aviso",2),"Mensagem completa do aviso.")+'</div>';
  }
  else if(sec.tipo==="checklist"){
    if(!Array.isArray(sec.itens)) sec.itens=[];
    b='<div style="font-size:12px;color:var(--muted);margin:-4px 0 10px">Cadastre os itens e as quantidades. Depois é só imprimir a folha e colher a assinatura do condômino.</div>';
    b+='<div style="'+_PE_CARD+'">'+_pEdField("Ambiente / área",_pEdIn(sec,"local","ex.: Salão de festas"),"Local a que este checklist se refere.")+'</div>';
    var linhas=sec.itens.map(function(it,j){
      var st=it.status||"";
      var bt=function(v,lbl,cor,bg){var on=(st===v);return '<button type="button" onclick="_procEdAcao(\'clst:'+i+':'+j+':'+v+'\')" style="padding:6px 9px;font-size:10.5px;font-weight:700;border:1.5px solid '+(on?cor:'var(--line)')+';border-radius:8px;cursor:pointer;background:'+(on?bg:'#fff')+';color:'+(on?cor:'#8a94a3')+';white-space:nowrap">'+lbl+'</button>';};
      return '<div style="display:flex;gap:6px;align-items:center;margin-bottom:7px;flex-wrap:wrap">'
        +'<div style="flex:2;min-width:150px">'+_pEdIn(it,"nome","item (ex.: Garfo)")+'</div>'
        +'<div style="width:86px">'+_pEdIn(it,"qtd","qtd")+'</div>'
        +'<div style="display:flex;gap:5px">'+bt("conforme","Conforme","#2f6d4f","#e7f3ec")+bt("nao","Não conforme","#b8402f","#fbece9")+'</div>'
        +_pEdRmBtn("clrm:"+i+":"+j,"Remover item")+'</div>';
    }).join("");
    b+='<div style="'+_PE_CARD+'">'+linhas+_pEdAddBtn("cladd:"+i,"Item")+'</div>';
    b+='<button type="button" class="btn-ghost" onclick="_procChecklistPDF('+i+')" style="width:100%;margin-top:4px">🖨️ Imprimir folha do checklist (para assinatura)</button>';
  }
  else if(sec.tipo==="vistorias"){
    b='<div style="font-size:12px;color:var(--muted);margin:-4px 0 10px">Cada vistoria tem nome, periodicidade e descrição.</div>';
    b+=(sec.itens||[]).map(function(v,j){
      var fi=_procEdBIND.push({obj:v,key:"freq"})-1;
      var opts=["semanal","mensal","trimestral","semestral","anual","outra"].map(function(o){return '<option value="'+o+'"'+(((v.freq||"semanal")===o)?" selected":"")+'>'+_procFreqLabel(o)+'</option>';}).join("");
      var sel='<select data-eb="'+fi+'" data-vfreq="'+i+':'+j+'" style="'+_PE_INP+'">'+opts+'</select>';
      var qi=_procEdBIND.push({obj:v,key:"freqQtd"})-1;
      var ui=_procEdBIND.push({obj:v,key:"freqUnid"})-1;
      var uopts=[["dia","Dia(s)"],["semana","Semana(s)"],["mes","Mês(es)"],["ano","Ano(s)"]].map(function(o){return '<option value="'+o[0]+'"'+(((v.freqUnid||"mes")===o[0])?" selected":"")+'>'+o[1]+'</option>';}).join("");
      var custom='<div data-vfreqc="'+i+':'+j+'" style="gap:8px;align-items:center;margin-top:6px;display:'+(v.freq==="outra"?"flex":"none")+'"><span style="font-size:12.5px;color:var(--muted);white-space:nowrap">A cada</span><div style="width:92px"><input type="number" min="1" step="1" data-eb="'+qi+'" value="'+esc(v.freqQtd||"")+'" placeholder="qt" style="'+_PE_INP+'"></div><div style="flex:1"><select data-eb="'+ui+'" style="'+_PE_INP+'">'+uopts+'</select></div></div>';
      return '<div style="'+_PE_CARD+'"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="flex:1">'+_pEdIn(v,"nome","nome da vistoria")+'</div>'+_pEdRmBtn("visrm:"+i+":"+j,"Remover vistoria")+'</div>'+_pEdHint("Nome da vistoria — ex.: Teste de gerador, Iluminação de emergência.")+_pEdField("Periodicidade",sel+custom,"Com que frequência a vistoria é feita. Em \u201cPersonalizada\u201d, escolha a quantidade e a unidade (a cada quantos dias, meses, anos\u2026).")+_pEdField("Descrição",_pEdTA(v,"desc","descrição da vistoria",2),"O que é verificado nessa vistoria.")+'</div>';
    }).join("");
    b+=_pEdAddBtn("visadd:"+i,"Vistoria");
  }
  var mv=function(x,lbl,tit){return '<button type="button" onclick="_procEdAcao(\''+x+'\')" title="'+tit+'" style="border:1px solid var(--line);background:#fff;color:#4a5b6a;border-radius:7px;width:26px;height:24px;font-size:11px;cursor:pointer;line-height:1">'+lbl+'</button>';};
  var ctrl='<div style="display:flex;align-items:center;gap:5px;justify-content:flex-end;margin-bottom:3px">'
    +'<span class="pm-drag" draggable="true" data-sec="'+i+'" title="Arraste para colocar a seção onde quiser" style="cursor:grab;color:#9aa6b5;font-size:14px;padding:2px 7px;border:1px solid var(--line);border-radius:7px;background:#fff;user-select:none">⠿</span>'
    +mv("secup:"+i,"▲","Subir seção")+mv("secdown:"+i,"▼","Descer seção")
    +'<button type="button" onclick="_procEdAcao(\'secrm:'+i+'\')" style="border:1px solid #f0d4cf;background:#fff;color:#b8402f;border-radius:8px;padding:4px 9px;font-size:10.5px;font-weight:700;cursor:pointer">✕ não se aplica</button></div>';
  return '<div class="pm-edsec" data-secidx="'+i+'" style="background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 16px 10px;margin-bottom:14px">'+ctrl+H+b+'</div>';
}

function _procBtnModelo(kind,label,desc){ return '<button type="button" class="btn-ghost" onclick="_procEdAcao(\'novasec:'+kind+'\')" title="'+esc(desc||"")+'" style="font-size:11.5px;padding:7px 12px">＋ '+esc(label)+'</button>'; }
var _procEdShowModelos=false;
function _procEdModelosBox(){
  if(!_procEdShowModelos){
    return '<div style="margin:16px 0 6px"><button type="button" class="btn-ghost" onclick="_procEdAcao(\'modelos\')" style="width:100%;padding:12px;font-weight:700">＋ Criar nova seção</button></div>';
  }
  return '<div style="margin:16px 0 6px;border:1.5px dashed var(--gold,#b8912f);border-radius:12px;padding:13px 15px;background:#FCFBF8">'
    +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px">'
      +'<div style="flex:1;font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--muted)">Escolha o modelo da seção</div>'
      +'<button type="button" onclick="_procEdAcao(\'modelos\')" style="border:none;background:none;color:var(--muted);cursor:pointer;font-size:11.5px">✕ cancelar</button>'
    +'</div>'
    +'<div style="display:flex;gap:7px;flex-wrap:wrap">'
      +_procBtnModelo("texto","Texto + fotos","Blocos de texto com fotos (ex.: áreas técnicas)")
      +_procBtnModelo("sistemas","Sistemas e como acionar","Empresa, telefone, local, marca, passo a passo e fotos")
      +_procBtnModelo("vistoria","Vistoria técnica","Nome, periodicidade e descrição")
      +_procBtnModelo("rotina","Rotina com horários","Horário + o que fazer")
      +_procBtnModelo("checkareas","Checklist por área","Listas por área, um item por linha")
      +_procBtnModelo("tabela","Tabela","Colunas e linhas livres")
      +_procBtnModelo("contatos","Contatos","Empresa, pessoa, departamento, telefone, e-mail")
      +_procBtnModelo("aviso","Aviso","Caixa de atenção destacada")
    +'</div>'
    +'<div style="font-size:11px;color:var(--muted);margin-top:9px">A seção entra no fim, em branco. Renomeie clicando no título e arraste (⠿) para onde quiser.<br>Termos de área comum, estoque e patrimônio ficam na aba <b>Check List</b>.</div>'
  +'</div>';
}
var _procEdGoBottom=false, _procEdScroll=0;
function _procEdRender(){
  var m=_procM(); if(!m) return;
  var _prev=document.querySelector("#modalMount .modal-body");
  var _keep=_prev?_prev.scrollTop:_procEdScroll;
  _procEdBIND=[]; _procEdPB=[];
  var secoes=(m.secoes||[]).map(function(sec,i){return _procEdSecao(sec,i);}).join("");
  var tl={comercial:"Comercial",residencial:"Residencial",misto:"Misto",loteamento:"Loteamento"}[m.tipo]||"";
  var capaThumb=m.capa?'<div style="width:74px;height:74px;border-radius:8px;background-size:cover;background-position:center;background-image:url(\''+m.capa+'\');border:1.5px solid var(--line);flex:none"></div>':'<div style="width:74px;height:74px;border-radius:8px;border:1.5px dashed var(--line);background:#FCFBF8;display:flex;align-items:center;justify-content:center;color:var(--muted);flex:none">'+_pico("camera",20)+'</div>';
  var ci=_procEdPB.push({obj:m,key:"capa"})-1;
  var capa='<div style="display:flex;gap:9px;align-items:center"><div>'+capaThumb+'</div><div><label class="btn-ghost" style="font-size:11.5px;cursor:pointer;display:inline-block">'+(m.capa?"Trocar capa":"Enviar capa")+'<input type="file" accept="image/*" style="display:none" onchange="setFotoProc('+ci+',this.files)"></label>'+(m.capa?'<button type="button" class="btn-ghost" onclick="rmFotoProc('+ci+')" style="font-size:11.5px;color:#b8402f;margin-left:6px">Remover</button>':"")+'</div></div>';
  document.getElementById("modalMount").innerHTML='<div class="overlay" style="padding:0;background:#eef1f6"><div class="modal" style="max-width:none;width:100vw;height:100dvh;max-height:100dvh;border-radius:0;display:flex;flex-direction:column;overflow:hidden">'
    +'<div class="modal-head" style="flex:none"><h3>'+_pico("procedimentos",18)+' Manual · '+esc(_procState.cond||"")+' · '+esc(tl)+'</h3><span id="procEdPct" style="margin:0 10px 0 auto">'+_procPctBadge(m)+'</span><button class="x" onclick="_procEditorVoltar()" title="Salvar e voltar à lista">×</button></div>'
    +'<div class="modal-body" style="flex:1;overflow:auto;min-height:0;background:#eef1f6">'
    +'<div style="max-width:1280px;margin:0 auto;padding:22px 24px 52px">'
    +'<div style="background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px 18px 12px;margin-bottom:16px">'
    +'<div class="rel-sec-h" style="margin-top:0">'+_pico("doc",16)+' Capa</div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px 16px">'
    +_pEdField("Nome do condomínio",_pEdIn(m,"nome","nome do condomínio"),"Nome oficial do condomínio, como aparece na fachada/CNPJ.")
    +_pEdField("Subtítulo",_pEdIn(m,"subtitulo","ex.: Manual de Procedimentos · ..."),"Complemento do título do manual (aparece na capa).")
    +'</div>'
    +capa
    +'</div>'
    +secoes
    +_procEdModelosBox()
    +'</div>'
    +'</div>'
    +'<div class="modal-foot" style="flex:none;margin:0;padding:12px 16px;border-top:1.5px solid var(--line);background:#fff"><button class="btn-cancel" onclick="_procEditorVisualizar()">'+_pico("eye",15)+' Visualizar / Imprimir</button><button class="btn-primary" style="flex:1" onclick="_procEditorSalvar()">💾 Salvar</button></div>'
    +'</div></div>';
  var _body=document.querySelector("#modalMount .modal-body");
  if(_body){
    if(_procEdGoBottom){ _procEdGoBottom=false; _body.scrollTop=_body.scrollHeight; }
    else { _body.scrollTop=_keep; }
    _procEdScroll=_body.scrollTop;
    _body.addEventListener("scroll",function(){ _procEdScroll=_body.scrollTop; });
  }
  _procEdBind();
}
function _procEdBind(){
  var root=document.getElementById("modalMount"); if(!root) return;
  root.querySelectorAll("[data-eb]").forEach(function(n){
    n.addEventListener("input",function(){
      var b=_procEdBIND[+n.dataset.eb];
      if(b.lista) b.obj[b.key]=String(n.value||"").split("\n").map(function(s){return s.trim();}).filter(Boolean);
      else b.obj[b.key]=n.value;
      _procEdDirty=true; _procEdPctUpdate();
    });
    n.addEventListener("change",function(){
      var b=_procEdBIND[+n.dataset.eb];
      if(b.lista) b.obj[b.key]=String(n.value||"").split("\n").map(function(s){return s.trim();}).filter(Boolean);
      else b.obj[b.key]=n.value;
      _procEdDirty=true; _procEdPctUpdate();
    });
  });
  root.querySelectorAll("[data-vencri]").forEach(function(n){
    n.addEventListener("change",function(){ var ri=n.getAttribute("data-vencri"); var bd=root.querySelector('[data-vencbadge="'+ri+'"]'); if(bd) bd.innerHTML=_vencBadge(n.value); var st=root.querySelector('[data-vencsit="'+ri+'"]'); if(st) st.innerHTML=_vencSituacaoHTML(n.value); _procEdPctUpdate(); });
  });
  root.querySelectorAll("[data-vfreq]").forEach(function(n){
    n.addEventListener("change",function(){ var key=n.getAttribute("data-vfreq"); var cf=root.querySelector('[data-vfreqc="'+key+'"]'); if(cf) cf.style.display=(n.value==="outra")?"flex":"none"; _procEdPctUpdate(); });
  });
  /* fotos: <label> + <input type=file> inline (setFotoProc / rmFotoProc) */
  root.querySelectorAll(".pm-drag").forEach(function(h){
    h.addEventListener("dragstart",function(e){ window._procDragFrom=+h.getAttribute("data-sec"); try{ e.dataTransfer.effectAllowed="move"; e.dataTransfer.setData("text/plain",String(h.getAttribute("data-sec"))); }catch(_){} });
    h.addEventListener("dragend",function(){ window._procDragFrom=null; });
  });
  root.querySelectorAll("[data-secidx]").forEach(function(el){
    el.addEventListener("dragover",function(e){ if(window._procDragFrom==null) return; e.preventDefault(); el.style.background="#fdf7e8"; el.style.outline="2px dashed #b8912f"; });
    el.addEventListener("dragleave",function(){ el.style.background=""; el.style.outline=""; });
    el.addEventListener("drop",function(e){ e.preventDefault(); el.style.background=""; el.style.outline="";
      var from=window._procDragFrom, to=+el.getAttribute("data-secidx");
      window._procDragFrom=null;
      if(from==null||isNaN(to)||from===to) return;
      _procMoveSec(from,to);
    });
  });
}
var _procEdFileInput=null,_procEdTarget=null;
function _procEdPhoto(i){
  _procEdTarget=_procEdPB[i];
  if(!_procEdFileInput){
    _procEdFileInput=document.createElement("input");_procEdFileInput.type="file";_procEdFileInput.accept="image/*";_procEdFileInput.style.display="none";document.body.appendChild(_procEdFileInput);
    _procEdFileInput.addEventListener("change",function(){
      var f=_procEdFileInput.files[0]; if(!f||!_procEdTarget) return;
      comprimirImagem(f,1280,0.8).then(function(r){ if(r&&r.foto){ _procEdTarget.obj[_procEdTarget.key]=r.foto; _procEdDirty=true; _procEdRender(); } });
      _procEdFileInput.value="";
    });
  }
  _procEdFileInput.value=""; _procEdFileInput.click();
}
function _procEdAcao(x){
  var p=String(x).split(":"),act=p[0],m=_procM(); if(!m) return;
  var S=m.secoes,i=+p[1];
  if(act==="secrm"){ if(!confirm("Remover esta seção do manual deste condomínio?")) return; S.splice(i,1); }
  else if(act==="dladd"){ var _g=S[i].grupos[+p[2]]; _g.rows.push(_procGrupoContatos(_g)?{icon:"phone",k:"",empresa:"",pessoa:"",departamento:"",telefone:"",email:""}:{icon:"phone",k:"Item",v:""}); }
  else if(act==="dlrm") S[i].grupos[+p[2]].rows.splice(+p[3],1);
  else if(act==="tladd") S[i].grupos[+p[2]].rows.push({hora:"",txt:""});
  else if(act==="tlrm") S[i].grupos[+p[2]].rows.splice(+p[3],1);
  else if(act==="stepadd") S[i].itens.push({icon:"check",titulo:"",txt:""});
  else if(act==="steprm") S[i].itens.splice(+p[2],1);
  else if(act==="rowadd") S[i].rows.push(S[i].headers.map(function(){return "";}));
  else if(act==="rowrm") S[i].rows.splice(+p[2],1);
  else if(act==="tbadd") S[i].blocos.push({titulo:"",txt:"",fotos:[]});
  else if(act==="tbfotoadd"){ var _bk=S[i].blocos[+p[2]]; if(!Array.isArray(_bk.fotos)) _bk.fotos=[]; _bk.fotos.push({img:"",cap:""}); }
  else if(act==="tbfotorm"){ S[i].blocos[+p[2]].fotos.splice(+p[3],1); }
  else if(act==="tbrm") S[i].blocos.splice(+p[2],1);
  else if(act==="sisadd") S[i].itens.push({icon:"wrench",titulo:"",onde:"",marca:"",empresa:"",telefone:"",pessoas:[],passos:"",fotos:[]});
  else if(act==="pesadd"){ var _it=S[i].itens[+p[2]]; if(!Array.isArray(_it.pessoas)) _it.pessoas=[]; _it.pessoas.push({nome:"",depto:"",telefone:"",email:""}); }
  else if(act==="pesrm"){ S[i].itens[+p[2]].pessoas.splice(+p[3],1); }
  else if(act==="colabadd"){ if(!Array.isArray(S[i].colaboradores)) S[i].colaboradores=[]; S[i].colaboradores.push({nome:"",cargo:"",cpf:"",nasc:"",inicio:"",foto:"",vinculo:"organico"}); }
  else if(act==="colabrm"){ S[i].colaboradores.splice(+p[2],1); }
  else if(act==="cladd"){ if(!Array.isArray(S[i].itens)) S[i].itens=[]; S[i].itens.push({nome:"",qtd:"",status:""}); }
  else if(act==="clrm"){ S[i].itens.splice(+p[2],1); }
  else if(act==="clst"){ var _it2=S[i].itens[+p[2]]; _it2.status=(_it2.status===p[3])?"":p[3]; }
  else if(act==="modelos"){ _procEdShowModelos=!_procEdShowModelos; if(_procEdShowModelos) _procEdGoBottom=true; }
  else if(act==="novasec"){ m.secoes.push(_procModeloSecao(p[1])); _procEdShowModelos=false; _procEdGoBottom=true; }
  else if(act==="coladd"){ if(!Array.isArray(S[i].cols)) S[i].cols=[]; S[i].cols.push({icon:"check",titulo:(/fun[çc]/i.test(S[i].colLabel||"")?"Nova função":"Nova área"),itens:[""]}); }
  else if(act==="colrm"){ S[i].cols.splice(+p[2],1); }
  else if(act==="chkadd"){ if(!Array.isArray(S[i].cols[+p[2]].itens)) S[i].cols[+p[2]].itens=[]; S[i].cols[+p[2]].itens.push(""); }
  else if(act==="chkrm"){ S[i].cols[+p[2]].itens.splice(+p[3],1); }
  else if(act==="visadd"){ if(!Array.isArray(S[i].itens)) S[i].itens=[]; S[i].itens.push({nome:"",freq:"semanal",freqOutra:"",freqQtd:"",freqUnid:"mes",desc:""}); }
  else if(act==="visrm"){ S[i].itens.splice(+p[2],1); }
  else if(act==="grtladd"){ if(!Array.isArray(S[i].grupos)) S[i].grupos=[]; S[i].grupos.push({titulo:"Novo bloco",rows:[{hora:"",txt:""}]}); }
  else if(act==="grtlrm"){ S[i].grupos.splice(+p[2],1); }
  else if(act==="secup"){ if(i>0){ var _t=S.splice(i,1)[0]; S.splice(i-1,0,_t); } }
  else if(act==="secdown"){ if(i<S.length-1){ var _t2=S.splice(i,1)[0]; S.splice(i+1,0,_t2); } }
  else if(act==="clsecadd"){ m.secoes.push(_procModeloSecao("entrega")); _procEdGoBottom=true; }
  else if(act==="sisrm") S[i].itens.splice(+p[2],1);
  else if(act==="fotoadd") S[i].itens[+p[2]].fotos.push({img:"",cap:""});
  else if(act==="fotorm") S[i].itens[+p[2]].fotos.splice(+p[3],1);
  else if(act==="grpadd"){ if(!Array.isArray(S[i].grupos)) S[i].grupos=[]; S[i].grupos.push({titulo:"Novo grupo de contatos",contatos:true,add:true,rows:[{icon:"phone",k:"",empresa:"",pessoa:"",departamento:"",telefone:"",email:""}]}); }
  else if(act==="grprm"){ if(!confirm("Remover este grupo de contatos?")) return; S[i].grupos.splice(+p[2],1); }
  else if(act==="secadd"){ m.secoes.push(_procModeloSecao("texto")); _procEdGoBottom=true; }
  _procEdDirty=true; _procEdRender();
}
function _procModeloSecao(kind){
  if(kind==="sistemas") return {tipo:"sistemas",eyebrow:"Sistemas",icon:"activity",titulo:"Sistemas e como acionar",sub:"Preencha empresa, telefone e local. Nas fotos, numere os pontos ① ② ③.",itens:[{icon:"wrench",titulo:"",onde:"",marca:"",empresa:"",telefone:"",pessoas:[],passos:"",fotos:[{img:"",cap:""}]}]};
  if(kind==="vistoria") return {tipo:"vistorias",eyebrow:"Rotina operacional",icon:"eye",titulo:"Vistoria técnica",gold:true,itens:[{nome:"",freq:"semanal",freqOutra:"",freqQtd:"",freqUnid:"mes",desc:""}]};
  if(kind==="rotina") return {tipo:"timeline",eyebrow:"Rotina",icon:"clock",titulo:"Nova rotina com horários",sub:"Sequência fixa do dia.",grupos:[{titulo:"Rotina",rows:[{hora:"",txt:""},{hora:"",txt:""},{hora:"",txt:""}]}]};
  if(kind==="checkareas") return {tipo:"checkcols",eyebrow:"Checklist",icon:"list",titulo:"Novo checklist por área",sub:"Percorra e marque o que verificou.",cols:[{icon:"check",titulo:"Área 1",itens:[""]},{icon:"check",titulo:"Área 2",itens:[""]}]};
  if(kind==="entrega") return {tipo:"checklist",eyebrow:"Entrega de área",icon:"clip",titulo:"Checklist de entrega",sub:"Conferência de itens na entrega e devolução.",local:"",itens:[{nome:"",qtd:"",status:""}]};
  if(kind==="tabela") return {tipo:"table",eyebrow:"Tabela",icon:"doc",titulo:"Nova tabela",headers:["Coluna 1","Coluna 2","Coluna 3"],rows:[["","",""]]};
  if(kind==="contatos") return {tipo:"dl",eyebrow:"Contatos",icon:"phone",titulo:"Novos contatos",grupos:[{titulo:"Contatos",contatos:true,add:true,rows:[{icon:"phone",k:"",empresa:"",pessoa:"",departamento:"",telefone:"",email:""}]}]};
  if(kind==="aviso") return {tipo:"callout",eyebrow:"Atenção",icon:"alert",titulo:"Novo aviso",tone:"warn",cicon:"alert",ctitulo:"",ctxt:""};
  return {tipo:"textblocks",eyebrow:"Extra",icon:"doc",titulo:"Nova seção",two:false,blocos:[{titulo:"",txt:"",fotos:[]}]};
}
function _procMoveSec(from,to){
  var m=_procM(); if(!m||!Array.isArray(m.secoes)) return;
  var S=m.secoes;
  if(from<0||from>=S.length||to<0||to>=S.length) return;
  var it=S.splice(from,1)[0]; S.splice(to,0,it);
  _procEdDirty=true; _procEdRender();
}
function abrirEditorProc(){ if(!_procM()) return; _procEdDirty=false; _procEdRender(); }
async function _procEditorSalvar(){ await _procSave(); _procEdDirty=false; try{ _procEdPctUpdate(); }catch(e){} try{ if(typeof toast==="function") toast("Manual salvo"); }catch(e){} }
async function _procEditorVisualizar(){ await _procSave(); _procEdDirty=false; var mm=document.getElementById("modalMount"); if(mm) mm.innerHTML=""; _procState.edit=false; _procRenderDetail(); try{ window.scrollTo(0,0); }catch(e){} }
async function _procEditorVoltar(){ await _procSave(); _procEdDirty=false; var mm=document.getElementById("modalMount"); if(mm) mm.innerHTML=""; voltarProcedimentos(); }
function _procImprimirManual(){
  var m=_procM(); if(!m) return;
  _procInjectCSS();
  var css=(document.getElementById("procCSS")||{}).textContent||"";
  var _b=_procBIND,_pb=_procPBIND,_ta=_procTABIND,_e=_procState.edit;
  _procState.edit=false; _procBIND=[]; _procPBIND=[]; _procTABIND=[];
  var body='<div id="procRoot"><div class="pm-sheet">'+_procCover()+(m.secoes||[]).map(function(sec,i){return _procSecao(sec,i);}).join("")+'</div></div>';
  _procState.edit=_e; _procBIND=_b; _procPBIND=_pb; _procTABIND=_ta;
  var w=window.open("","_blank");
  if(!w){ alert("Permita pop-ups para visualizar/imprimir o manual."); return; }
  var doc='<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(m.nome||"Manual")+' — Manual de Procedimentos</title>'
    +'<style>*{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{margin:0;background:#eef1f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}#procRoot{margin:20px auto}#procRoot .pm-sheet{margin:0}'
    +css
    +'@page{size:A4;margin:10mm}@media print{body{background:#fff}#procRoot{margin:0}#procRoot .pm-sheet{box-shadow:none;border:none;border-radius:0}.noprint{display:none!important}}</style></head><body>'
    +body
    +'<div class="noprint" style="position:fixed;top:14px;right:14px;z-index:9"><button onclick="window.print()" style="background:#17253f;color:#fff;border:0;border-radius:9px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(20,33,56,.25)">🖨️ Imprimir</button></div>'
    +'</body></html>';
  w.document.open(); w.document.write(doc); w.document.close();
  setTimeout(function(){ try{ w.focus(); w.print(); }catch(e){} }, 600);
}
function fecharEditorProc(){
  if(_procEdDirty && !confirm("Fechar sem salvar? As alterações desta sessão serão perdidas do rascunho não salvo.")){ return; }
  document.getElementById("modalMount").innerHTML="";
  if(_procEdDirty){ loadProc(_procState.cond).then(function(s){ if(s) _procState.model=s; _procEdDirty=false; _procRenderDetail(); }); }
}
async function salvarProcEditor(){
  await _procSave();
  _procEdDirty=false;
  document.getElementById("modalMount").innerHTML="";
  _procRenderDetail();
  try{ if(typeof toast==="function") toast("Manual salvo"); }catch(e){}
}
