/* ============================================================
   GESTÃO MAFRA — ABA TAREFAS · MODO "LISTAS" (estilo To Do) — build 129
   Camada NOVA sobre a aba Tarefas. Não mexe nas tarefas semanais
   (mafra:agenda:*): armazenamento próprio.
     mafra:listas:index          → { listas:[ {id,nome,icone,cor,dono,compartilhadaCom:[],criadoEm} ] }
     mafra:lista:<id>            → { tarefas:[ {id,titulo,concluida,concluidaEm,importante,data,meuDia,
                                      repeticao,anotacoes,atribuido,etapas:[{id,titulo,feita}],criadoPor,criadoEm} ] }
   ============================================================ */

/* Funções desta aba: _liTs, _liTe, _liTap, _liEditarAnotacao, _liSalvarAnotacao, _liCelular, _liVoltarMenu, listasComAtribuicao, _liTarefasAtribuidas, listasTarefasSemData, _liQuadroSemData, _liConcluirDaSemana, _liTarefasSemanaVirtuais, _liToggleSemana, _liAbrirSemana, _liDetalheHTML, _liFecharDetalhe, _liPainelLargo, _liAddArquivo, _liDelArquivo, _liLimparCampo, _liTempoRel, _liOpcaoAdd, _liFmtLembrete, _liChecarLembretes, _liSomLigado, _liToggleSom, _liSom, _liModoAtivo, _liChipSemana, _liCSS, _liHoje, _liFmtData, _liIcone, loadListasIndex, saveListasIndex, loadLista, saveLista, listasVisiveis, _liPessoas, _liNome, _liBarraModo, setTarefasModo, renderListas, _liSelecionar, _liTarefasDaVista, _liTarefaHTML, _liRenderMain, _liAddTarefa, _liToggleConcluida, _liToggleImportante, _liProximaData, abrirTarefaLista, _liSalvarCampo, _liMeuDia, _liAddEtapa, _liToggleEtapa, _liDelEtapa, _liExcluirTarefa, _liMoverTarefa, abrirNovaLista, salvarNovaLista, _liMenuLista, _liRenomearLista, _liCompartilharLista, _liSalvarCompartilhar, _liExcluirLista, _liToggleConcluidas, _liAchar, listasTarefasPorData */

var LI_ICONES=["📋","💻","💰","📢","🏢","🔧","📞","📝","⭐","🎯","🧾","🏠"];
var LI_CORES=["#16243D","#2F7D5B","#BA7517","#1D9E75","#7A3E9D","#C0392B","#2D6CDF","#8a5a3c"];
window._li = window._li || { modo:null, vista:"meudia", aberta:null, mostrarConcluidas:{} };

function _liCSS(){
  if(document.getElementById("li-css")) return;
  const s=document.createElement("style"); s.id="li-css";
  s.textContent=`
  .li-modo{display:inline-flex;border:1.5px solid var(--line);border-radius:12px;overflow:hidden;background:#fff;margin-bottom:12px}
  .li-modo button{padding:8px 14px;font-size:13px;font-weight:800;color:var(--muted);background:#fff;border:0}
  .li-modo button.on{background:var(--navy);color:#fff}
  .lid-mnav{align-items:center;flex-wrap:wrap}
  .lid-mnav .nav-btn{width:auto;padding:0 14px;font-size:13px;white-space:nowrap}
  .lid-mnav-leg{margin-left:auto;font-size:11.5px;color:var(--muted);display:flex;align-items:center;gap:6px}
  .lid-mnav-leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-left:8px}
  .lid-mesgrid .mcell{min-height:112px}
  .lid-int-res{font-size:12.5px;color:var(--muted);font-weight:700;align-self:center;margin-left:4px}
  .lid-int-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;align-items:start}
  .lid-int-grid .daycol{min-height:0}
  @media(max-width:760px){ .lid-int-grid{grid-template-columns:1fr} }
  .lid-mesgrid .mev{cursor:pointer}
  .lid-mesgrid .mev.done{opacity:.55;text-decoration:line-through}
  .li-sd{margin-top:16px;background:#fff;border:1.5px solid var(--line);border-radius:14px;padding:12px 14px}
  .li-sd-h{font-size:13px;font-weight:800;color:var(--navy);display:flex;align-items:center;gap:8px;margin-bottom:8px}
  .li-sd-h span{background:#EEF2FA;border-radius:10px;padding:1px 8px;font-size:11px}
  .li-sd-h small{color:var(--muted);font-weight:600;margin-left:auto}
  .li-sd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px}
  .li-wrap{display:grid;grid-template-columns:230px 1fr;gap:16px;align-items:start}
  .li-wrap.com-detalhe{grid-template-columns:230px 1fr 340px}
  .li-detail{background:#F6F4EF;border:1.5px solid var(--line);border-radius:14px;padding:12px;position:sticky;top:8px;max-height:calc(100vh - 90px);overflow:auto}
  .li-dbox{background:#fff;border:1px solid var(--line);border-radius:10px;padding:6px 10px;margin-bottom:10px}
  .li-dtitle{display:flex;align-items:center;gap:10px;padding:8px 2px 6px}
  .li-dtitle input{flex:1;border:0;background:transparent;font-size:16px;font-weight:800;font-family:inherit;outline:none;min-width:0}
  .li-dtitle input:focus{border-bottom:1.5px solid var(--gold)}
  .li-drow{display:flex;align-items:center;gap:10px;padding:10px 4px;border-top:1px solid var(--line);cursor:pointer;font-size:13.5px;color:var(--ink)}
  .li-dbox .li-drow:first-child{border-top:0}
  .li-drow .ic{width:22px;text-align:center;font-size:15px;flex:none}
  .li-drow .lb{flex:1;min-width:0}
  .li-drow .lb.set{color:var(--navy);font-weight:700}
  .li-drow .lb.on{color:#1D9E75;font-weight:800}
  .li-drow .clr{background:none;border:0;color:var(--muted);font-size:16px;padding:0 4px}
  .li-drow input,.li-drow select{border:1.5px solid var(--line);border-radius:8px;padding:6px 8px;font-family:inherit;font-size:13px;background:#FCFBF8;max-width:190px}
  .li-dbox textarea{width:100%;border:1.5px solid var(--line);border-radius:8px;background:#fff;font-family:inherit;font-size:14px;min-height:90px;resize:vertical;outline:none;padding:8px 10px;margin-top:4px}
  .li-dbox label{font-size:11px;letter-spacing:.6px;text-transform:uppercase;color:var(--muted);font-weight:800;display:block;margin:4px 2px 0}
  .li-anot-txt{font-size:13.5px;line-height:1.5;color:var(--ink);padding:8px 4px 4px;white-space:normal;cursor:pointer}
  .li-anot-acoes{display:flex;gap:8px;justify-content:flex-end;padding:6px 2px 4px}
  .li-anot-acoes button{border:1.5px solid var(--line);background:#fff;border-radius:8px;padding:7px 12px;font-size:12.5px;font-weight:700;color:var(--navy)}
  .li-anot-acoes .btn-gold{border-color:transparent}
  .li-dfoot{display:flex;align-items:center;justify-content:space-between;padding:8px 4px 2px;font-size:12px;color:var(--muted)}
  .li-dfoot button{background:none;border:0;color:#C0392B;font-size:16px}
  .li-dclose{display:flex;justify-content:flex-end}
  .li-dclose button{background:none;border:0;font-size:20px;color:var(--muted);line-height:1;padding:2px 6px}
  .li-arq{display:flex;align-items:center;gap:8px;padding:6px 4px;border-top:1px solid var(--line);font-size:13px}
  .li-arq a{color:var(--navy);font-weight:700;text-decoration:none;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .li-arq img{width:34px;height:34px;object-fit:cover;border-radius:6px}
  .li-arq small{color:var(--muted)}
  .li-arq button{background:none;border:0;color:var(--muted);font-size:16px}
  .li-det .li-dbox{background:#FCFBF8}
  .li-side{background:#fff;border:1.5px solid var(--line);border-radius:14px;padding:10px;position:sticky;top:8px}
  .li-side .li-it{display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:10px;font-size:13.5px;font-weight:700;color:var(--ink);cursor:pointer;width:100%;text-align:left;background:transparent;border:0}
  .li-side .li-it:hover{background:#F6F4EF}
  .li-side .li-it.on{background:#EEF2FA;color:var(--navy)}
  .li-side .li-it .n{margin-left:auto;font-size:11px;font-weight:800;color:var(--muted);background:#F0EDE4;border-radius:10px;padding:2px 7px}
  .li-side .li-sec{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);font-weight:800;margin:12px 10px 4px}
  .li-side .li-ic{width:20px;text-align:center}
  .li-main{background:#fff;border:1.5px solid var(--line);border-radius:14px;padding:16px;min-height:300px;min-width:0;max-width:100%;overflow:hidden}
  .li-wrap,.li-side{min-width:0;max-width:100%}
  .li-lista-menu .txt{margin-left:4px}
  .li-head{display:flex;align-items:center;gap:10px;margin-bottom:12px}
  .li-head h2{margin:0;font-size:20px;color:var(--navy);display:flex;align-items:center;gap:8px}
  .li-head .sub{font-size:12px;color:var(--muted);margin-top:2px}
  .li-head .sp{flex:1}
  .li-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:#FCFBF8;margin-bottom:6px;cursor:pointer}
  .li-row:hover{background:#F6F4EF}
  .li-row.sel{background:#EEF2FA;border-color:#c9d3ea}
  .li-row.done .tt{text-decoration:line-through;color:var(--muted)}
  .li-chk{width:22px;height:22px;border-radius:50%;border:2px solid #9aa4b5;background:#fff;flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:800}
  .li-chk.on{background:#2F7D5B;border-color:#2F7D5B;animation:liPop .28s cubic-bezier(.2,.9,.3,1.4)}
  @keyframes liPop{0%{transform:scale(.6)}70%{transform:scale(1.18)}100%{transform:scale(1)}}
  .li-row .bd{flex:1;min-width:0}
  .li-row .tt{font-size:14px;font-weight:700;color:var(--ink);overflow:hidden;text-overflow:ellipsis}
  .li-row .mt{font-size:11.5px;color:var(--muted);margin-top:2px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .li-row .mt .late{color:#C0392B;font-weight:800}
  .li-row .mt .hoje{color:#1D9E75;font-weight:800}
  .li-star{font-size:18px;color:#b9c0cc;background:none;border:0;padding:2px 4px;line-height:1}
  .li-star.on{color:var(--gold)}
  .li-add{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px dashed var(--line);border-radius:10px;background:#fff;margin-top:8px}
  .li-add input{flex:1;border:0;background:transparent;font-size:14px;outline:none;font-family:inherit}
  .li-add .pl{color:var(--navy);font-weight:800;font-size:18px}
  .li-add-wrap{margin-top:8px}
  .li-add-wrap .li-add{margin-top:0}
  .li-opt{background:none;border:1.5px solid transparent;border-radius:8px;font-size:16px;padding:3px 6px;opacity:.55}
  .li-opt.on{opacity:1;border-color:var(--gold);background:#FBF5E6}
  .li-add-opts{display:flex;flex-wrap:wrap;gap:10px;padding:8px 12px;border:1.5px solid var(--line);border-top:0;border-radius:0 0 10px 10px;background:#FCFBF8}
  .li-add-opts label{font-size:12px;font-weight:700;color:var(--muted);display:flex;align-items:center;gap:6px}
  .li-add-opts input,.li-add-opts select{padding:5px 8px;border:1.5px solid var(--line);border-radius:8px;font-family:inherit;font-size:12.5px;background:#fff}
  .li-conc{margin-top:14px}
  .li-conc>button{background:#EEF2FA;border:0;border-radius:8px;padding:7px 12px;font-size:12.5px;font-weight:800;color:var(--navy)}
  .li-grp{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);font-weight:800;margin:14px 0 6px}
  .li-vazio{padding:30px;text-align:center;color:var(--muted);font-size:13.5px}
  .li-det .fld{margin-top:12px}
  .li-det label{font-size:11px;letter-spacing:.6px;text-transform:uppercase;color:var(--muted);font-weight:800;display:block;margin-bottom:5px}
  .li-det input[type=text],.li-det input[type=date],.li-det select,.li-det textarea{width:100%;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;background:#FCFBF8;font-size:14px;font-family:inherit}
  .li-det textarea{min-height:80px}
  .li-etapa{display:flex;align-items:center;gap:10px;padding:9px 4px;border-bottom:1px solid var(--line);cursor:pointer;-webkit-tap-highlight-color:transparent}
  .li-etapa:active{background:#F6F4EF}
  .li-etapa .li-chk{width:24px;height:24px;font-size:13px;pointer-events:none}
  .li-etapa span{flex:1;font-size:13.5px}
  .li-etapa.done span{text-decoration:line-through;color:var(--muted)}
  .li-etapa .x{background:none;border:0;color:var(--muted);font-size:16px}
  .li-etapa-add{display:flex;gap:8px;margin-top:6px}
  .li-etapa-add input{flex:1;padding:8px 10px;border:1.5px solid var(--line);border-radius:8px;font-family:inherit;font-size:13px}
  .li-quick{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
  .li-quick button{border:1.5px solid var(--line);background:#fff;border-radius:20px;padding:6px 11px;font-size:12px;font-weight:700;color:var(--navy)}
  .li-quick button.on{background:var(--navy);color:#fff;border-color:var(--navy)}
  .li-lista-menu{display:flex;gap:6px}
  .li-lista-menu button{border:1.5px solid var(--line);background:#fff;border-radius:8px;padding:6px 9px;font-size:12px;font-weight:700;color:var(--navy)}
  .li-icones{display:flex;flex-wrap:wrap;gap:6px}
  .li-icones button,.li-cores button{width:36px;height:36px;border-radius:9px;border:1.5px solid var(--line);background:#fff;font-size:18px}
  .li-icones button.on,.li-cores button.on{outline:3px solid var(--gold)}
  .li-cores{display:flex;flex-wrap:wrap;gap:6px}
  .li-pessoas label{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13.5px}
  @media(max-width:1060px){ .li-wrap.com-detalhe{grid-template-columns:200px 1fr 300px} }
  .li-vazio-side{font-size:12px;color:var(--muted);padding:6px 10px 8px}
  .li-back{display:none;width:38px;height:38px;border-radius:10px;border:1.5px solid var(--line);background:#fff;font-size:24px;line-height:1;color:var(--navy);flex:none;padding:0 0 3px}
  @media(max-width:760px){ .li-back{display:inline-flex;align-items:center;justify-content:center} .li-so-menu .li-side{padding-bottom:10px} }
  .li-nova{color:var(--navy)}
  @media(max-width:760px){
    .li-wrap,.li-wrap.com-detalhe{grid-template-columns:1fr;gap:10px}
    .li-detail{display:none}
    /* build 137: lateral no celular vira LISTA vertical (um item por linha, contador à direita), como no To Do */
    .li-side{position:static;display:block;padding:6px 8px}
    .li-side .li-it{width:100%;display:flex;padding:11px 10px;font-size:14.5px;border-radius:10px;border-bottom:1px solid #F1EEE6}
    .li-side .li-it:last-child{border-bottom:0}
    .li-side .li-it .n{margin-left:auto;font-size:12px;min-width:26px;text-align:center}
    .li-side .li-sec{margin:12px 10px 4px}
    .li-side .li-ic{width:26px;font-size:17px}
    .li-main{padding:12px}
    .li-head{flex-wrap:wrap;gap:6px}
    .li-head h2{font-size:17px;flex:1 1 auto;min-width:0}
    .li-head .sp{display:none}
    .li-lista-menu{margin-left:auto}
    .li-lista-menu button{padding:6px 8px}
    .li-lista-menu .txt{display:none}
    .li-add{flex-wrap:wrap;gap:6px;padding:8px 10px}
    .li-add input{flex:1 1 calc(100% - 40px);order:0;font-size:15px;min-width:0}
    .li-add .pl{order:0}
    .li-opt{order:2}
    .li-add .btn-gold{order:3;margin-left:auto}
    .li-add-opts{gap:8px;padding:8px 10px}
    .li-add-opts label{width:100%}
    .li-add-opts input,.li-add-opts select{flex:1}
    .li-row{padding:9px 10px}
    .li-row .tt{font-size:13.5px;white-space:normal}
    .li-grp{margin-top:10px}

  }`;
  document.head.appendChild(s);
}
function _liHoje(){ return ymd(new Date()); }
function _liFmtData(ds){
  if(!ds) return "";
  const hoje=_liHoje();
  const d=new Date(ds+"T00:00:00"), t=new Date(hoje+"T00:00:00");
  const diff=Math.round((d-t)/86400000);
  const txt=d.toLocaleDateString("pt-BR",{weekday:"short",day:"numeric",month:"short"}).replace(".","");
  if(diff===0) return {txt:"Hoje",cls:"hoje"};
  if(diff===1) return {txt:"Amanhã",cls:""};
  if(diff<0) return {txt:txt,cls:"late"};
  return {txt:txt,cls:""};
}
function _liIcone(l){ return l&&l.icone?l.icone:"📋"; }

/* ---------- armazenamento ---------- */
async function loadListasIndex(){
  const v=await storeGet("mafra:listas:index");
  if(v){ try{ const o=JSON.parse(v); if(o&&Array.isArray(o.listas)) return o; }catch(e){} }
  return {listas:[]};
}
async function saveListasIndex(idx){ await storeSet("mafra:listas:index", JSON.stringify(idx)); return true; }
async function loadLista(id){
  const v=await storeGet("mafra:lista:"+id);
  if(v){ try{ const o=JSON.parse(v); if(o&&Array.isArray(o.tarefas)) return o; }catch(e){} }
  return {tarefas:[]};
}
async function saveLista(id,d){ await storeSet("mafra:lista:"+id, JSON.stringify(d)); return true; }

// build 136: cada pessoa vê SÓ as listas dela e as compartilhadas com ela (regra da Mafra — ninguém vê as dos outros)
function listasVisiveis(idx){
  const uid=state.userId;
  return (idx.listas||[]).filter(l=> l.dono===uid || (l.compartilhadaCom||[]).includes(uid));
}
// listas de OUTRAS pessoas em que existe tarefa atribuída a mim: só as tarefas atribuídas aparecem, nunca a lista inteira
function listasComAtribuicao(idx){
  const uid=state.userId; const vis=listasVisiveis(idx).map(l=>l.id);
  return (idx.listas||[]).filter(l=> !vis.includes(l.id) && (l.atribuidos||[]).includes(uid));
}
// carrega, das listas alheias, apenas as tarefas atribuídas a mim
async function _liTarefasAtribuidas(idx){
  const uid=state.userId, out={};
  for(const l of listasComAtribuicao(idx)){
    try{ const d=await loadLista(l.id); const arr=(d.tarefas||[]).filter(t=>t.atribuido===uid); if(arr.length) out[l.id]={lista:l,tarefas:arr}; }catch(e){}
  }
  return out;
}
function _liPessoas(){
  const arr=Object.keys(USUARIOS).filter(k=>USUARIOS[k]&&USUARIOS[k].nome&&USUARIOS[k].tipo!=="helpdesk");
  return arr;
}
function _liNome(uid){ return (USUARIOS[uid]&&USUARIOS[uid].nome)?USUARIOS[uid].nome.split(" ")[0]:uid; }

/* ---------- alternador Semana | Listas (fica no topo da aba Tarefas) ---------- */
function _liBarraModo(modoAtual){
  _liCSS();
  const view=document.getElementById("view"); if(!view) return;
  if(document.getElementById("liModoBar")) return;
  const bar=document.createElement("div"); bar.id="liModoBar"; bar.className="li-modo";
  bar.innerHTML=`<button class="${modoAtual==="semana"?"on":""}" onclick="setTarefasModo('semana')">${ico('calendario')} Semana</button><button class="${modoAtual==="listas"?"on":""}" onclick="setTarefasModo('listas')">${ico('tarefas')} Listas</button>`;
  view.insertBefore(bar, view.firstChild);
}
/* ---------- toque de conclusão (gerado no navegador, sem arquivo) ---------- */
function _liSomLigado(){ try{ return localStorage.getItem("mafra:somTarefas")!=="off"; }catch(e){ return true; } }
function _liToggleSom(){ try{ localStorage.setItem("mafra:somTarefas", _liSomLigado()?"off":"on"); }catch(e){} _liRenderMain(); if(_liSomLigado()) _liSom("tarefa"); }
// "tarefa" = sino de duas batidas (estilo To Do), com harmônicos de sino e volume alto · "etapa" = um tique curto
function _liSom(tipo){
  if(!_liSomLigado()) return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    window._liAC=window._liAC||new AC(); const ac=window._liAC;
    if(ac.state==="suspended"){ try{ ac.resume(); }catch(e){} }
    const t0=ac.currentTime;
    // saída: compressor (evita estourar) + ganho mestre alto
    const comp=ac.createDynamicsCompressor(); comp.threshold.value=-12; comp.ratio.value=6; comp.attack.value=0.002; comp.release.value=0.2;
    const master=ac.createGain(); master.gain.value=(tipo==="etapa")?0.9:1.6;
    comp.connect(master); master.connect(ac.destination);
    // uma batida de sino: fundamental + parciais inarmônicos (como um sininho real), ataque instantâneo e cauda longa
    const badalada=(f0,ini,dur,vol)=>{
      const parciais=[[1,1],[2.0,0.55],[2.76,0.35],[4.07,0.18],[5.4,0.09]];
      parciais.forEach(([r,v],i)=>{
        const o=ac.createOscillator(), g=ac.createGain(); o.type="sine"; o.frequency.setValueAtTime(f0*r,t0+ini);
        const d=dur*(i===0?1:0.55);  // parciais agudos morrem antes (timbre de sino)
        g.gain.setValueAtTime(0.0001,t0+ini); g.gain.exponentialRampToValueAtTime(vol*v,t0+ini+0.006); g.gain.exponentialRampToValueAtTime(0.0001,t0+ini+d);
        o.connect(g); g.connect(comp); o.start(t0+ini); o.stop(t0+ini+d+0.05);
      });
    };
    if(tipo==="etapa"){ badalada(1760,0,0.22,0.35); }
    else { badalada(1046.5,0,0.9,0.6); badalada(1568,0.16,1.1,0.6); }   // dó6 → sol6, "ding-ding" do To Do
  }catch(e){}
}
// build 138: no celular a aba Listas tem DUAS telas — o menu (vistas + listas) e a lista aberta, com "voltar"
function _liCelular(){ try{ return window.innerWidth<=760; }catch(e){ return false; } }
function _liVoltarMenu(){ window._li.tela="menu"; window._li.aberta=null; try{ closeModal(); }catch(e){} renderListas(); try{ window.scrollTo(0,0); }catch(e){} }
function _liModoAtivo(){
  if(window._li.modo===null||window._li.modo===undefined){ try{ window._li.modo=localStorage.getItem("mafra:tarefasModo")||"semana"; }catch(e){ window._li.modo="semana"; } }
  return window._li.modo==="listas";
}
// cartãozinho de tarefa de lista dentro da agenda semanal (clique abre a lista)
function _liChipSemana(t){
  const et=(t.etapas||[]); const etTxt=et.length?` · ${et.filter(e=>e.feita).length} de ${et.length}`:"";
  return `<div class="task" style="border-left:4px solid var(--gold);cursor:pointer;padding:8px 10px;display:flex;gap:8px;align-items:flex-start" onclick="window._li.modo='listas';window._li.vista='${t.listaId}';window._li.aberta={listaId:'${t.listaId}',tid:'${t.id}'};setTarefasModo('listas')">
    <button class="li-chk" style="width:20px;height:20px;font-size:12px;margin-top:1px" title="Concluir" onclick="event.stopPropagation();_liConcluirDaSemana('${t.listaId}','${t.id}')"></button>
    <div style="min-width:0"><div style="font-size:12.5px;font-weight:800;color:var(--navy)">${t.importante?"★ ":""}${esc(t.titulo)}</div>
    <div style="font-size:11px;color:var(--muted);margin-top:2px">📋 ${esc(t.lista)}${etTxt}</div></div></div>`;
}
// tarefas de lista SEM data (abertas) do usuário — mostradas num quadro na aba Semana
async function listasTarefasSemData(uid){
  const idx=await loadListasIndex(); const out=[];
  const listas=(idx.listas||[]).filter(l=>l.dono===uid||(l.compartilhadaCom||[]).includes(uid)||(l.atribuidos||[]).includes(uid));
  for(const l of listas){ const d=await loadLista(l.id); const minha=l.dono===uid||(l.compartilhadaCom||[]).includes(uid);
    (d.tarefas||[]).forEach(t=>{ if(t.concluida||t.data) return; if(!minha && t.atribuido!==uid) return; if(minha && t.atribuido && t.atribuido!==uid) return; out.push({...t,lista:l.nome,listaId:l.id}); }); }
  out.sort((a,b)=>(b.importante?1:0)-(a.importante?1:0)||(b.criadoEm||0)-(a.criadoEm||0));
  return out;
}
function _liQuadroSemData(arr){
  _liCSS();
  if(!arr||!arr.length) return "";
  return `<div class="li-sd"><div class="li-sd-h">📋 Das listas · sem data <span>${arr.length}</span><small>dê uma data para a tarefa entrar no dia</small></div><div class="li-sd-grid">${arr.map(_liChipSemana).join("")}</div></div>`;
}
async function _liConcluirDaSemana(listaId,tid){
  const d=await loadLista(listaId); const t=(d.tarefas||[]).find(x=>x.id===tid); if(!t) return;
  t.concluida=true; t.concluidaEm=Date.now(); _liSom("tarefa");
  if(t.repeticao){ const prox=_liProximaData(t.data,t.repeticao); if(prox) d.tarefas.push({...t,id:"lt"+Date.now()+Math.random().toString(36).slice(2,5),concluida:false,concluidaEm:null,data:prox,meuDia:"",lembreteAvisado:false,etapas:(t.etapas||[]).map(e=>({...e,feita:false})),criadoEm:Date.now()}); }
  await saveLista(listaId,d); if(window._li.dados) window._li.dados[listaId]=d;
  try{ render(); }catch(e){}
}
function setTarefasModo(m){
  window._li.modo=m; try{ localStorage.setItem("mafra:tarefasModo",m); }catch(e){}
  state.tab="tarefas"; render();
}

/* ---------- render principal ---------- */
async function renderListas(){
  _liCSS();
  const view=document.getElementById("view");
  view.innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando listas…</div>';
  const idx=await loadListasIndex();
  const minhas=listasVisiveis(idx);
  // carrega as tarefas de todas as listas visíveis (para as vistas Meu Dia / Importante / Planejado / Atribuído)
  const dados={}; for(const l of minhas){ dados[l.id]=await loadLista(l.id); }
  window._li.idx=idx; window._li.dados=dados;
  try{ window._li.atrib=await _liTarefasAtribuidas(idx); }catch(e){ window._li.atrib={}; }
  // tarefas da AGENDA SEMANAL (aba Semana) entram aqui como itens "espelho": mesma tarefa, mostrada nos dois lugares
  try{ window._li.semana=await _liTarefasSemanaVirtuais(); }catch(e){ window._li.semana=[]; }
  const uid=state.userId, hoje=_liHoje();
  const cont={meudia:0,importante:0,planejado:0,atribuido:0,semana:0};
  minhas.forEach(l=>{ (dados[l.id].tarefas||[]).forEach(t=>{ if(t.concluida) return;
    if(t.meuDia===hoje||t.data===hoje) cont.meudia++;
    if(t.importante) cont.importante++;
    if(t.data) cont.planejado++;
    if(t.atribuido===uid) cont.atribuido++; }); });
  const wkAtual=(typeof weekKey==="function")?weekKey(0):"";
  (window._li.semana||[]).forEach(v=>{ if(v.concluida) return; if(v.data===hoje) cont.meudia++; cont.planejado++; if(v.wk===wkAtual) cont.semana++; if(v.importante) cont.importante++; });
  Object.keys(window._li.atrib||{}).forEach(k=>{ (window._li.atrib[k].tarefas||[]).forEach(t=>{ if(t.concluida) return; cont.atribuido++; if(t.meuDia===hoje||t.data===hoje) cont.meudia++; if(t.importante) cont.importante++; if(t.data) cont.planejado++; }); });
  const vista=window._li.vista||"meudia";
  const it=(id,ic,lbl,n)=>`<button class="li-it ${vista===id?"on":""}" onclick="_liSelecionar('${id}')"><span class="li-ic">${ic}</span>${esc(lbl)}${n?`<span class="n">${n}</span>`:""}</button>`;
  let side=it("meudia","☀️","Meu Dia",cont.meudia)+it("importante","⭐","Importante",cont.importante)+it("planejado","📅","Planejado",cont.planejado)+it("atribuido","👤","Atribuído a mim",cont.atribuido)+it("semana","📆","Semana (agenda)",cont.semana);
  const proprias=minhas.filter(l=>l.dono===uid), compartilhadas=minhas.filter(l=>l.dono!==uid);
  side+=`<div class="li-sec">Minhas listas</div>`;
  proprias.forEach(l=>{ const n=(dados[l.id].tarefas||[]).filter(t=>!t.concluida).length; side+=it(l.id,_liIcone(l),l.nome+((l.compartilhadaCom||[]).length?" 👥":""),n); });
  if(!proprias.length) side+=`<div class="li-vazio-side">Você ainda não criou uma lista.</div>`;
  if(compartilhadas.length){
    side+=`<div class="li-sec">Compartilhadas comigo</div>`;
    compartilhadas.forEach(l=>{ const n=(dados[l.id].tarefas||[]).filter(t=>!t.concluida).length; side+=it(l.id,_liIcone(l),l.nome+" · "+_liNome(l.dono),n); });
  }
  side+=`<button class="li-it li-nova" onclick="abrirNovaLista()"><span class="li-ic">＋</span>Nova lista</button>`;
  const cel=_liCelular(); if(!window._li.tela) window._li.tela="menu";
  if(cel && window._li.tela==="menu"){
    view.innerHTML=`<div class="li-wrap li-so-menu" id="liWrap"><div class="li-side">${side}</div></div>`;
    _liBarraModo("listas"); return;
  }
  view.innerHTML=`<div class="li-wrap ${cel?"li-so-lista":""}" id="liWrap"><div class="li-side" ${cel?'style="display:none"':""}>${side}</div><div class="li-main" id="liMain"></div><div class="li-detail" id="liDetail" style="display:none"></div></div>`;
  _liBarraModo("listas");
  _liRenderMain();
  if(window._li.aberta && _liPainelLargo()){ const a=window._li.aberta; abrirTarefaLista(a.listaId,a.tid); }
}
function _liSelecionar(id){ window._li.vista=id; window._li.tela="lista"; renderListas(); try{ window.scrollTo(0,0); }catch(e){} }

// junta as tarefas de uma vista (inteligente ou lista)
function _liTarefasDaVista(vista){
  const uid=state.userId, hoje=_liHoje(), out=[];
  const listas=listasVisiveis(window._li.idx||{listas:[]});
  const push=(l,t)=>out.push({t,l});
  // itens espelho da agenda semanal
  const wkAtual=(typeof weekKey==="function")?weekKey(0):"";
  (window._li.semana||[]).forEach(v=>{
    const o={t:v,l:{id:"__semana",nome:"Semana",icone:"📆"},virtual:true};
    if(vista==="meudia"){ if(v.data===hoje) out.push(o); }
    else if(vista==="importante"){ if(v.importante) out.push(o); }
    else if(vista==="planejado"){ out.push(o); }
    else if(vista==="semana"){ if(v.wk===wkAtual) out.push(o); }
  });
  // tarefas que me foram atribuídas em listas de outras pessoas (só elas, nunca a lista inteira)
  Object.keys(window._li.atrib||{}).forEach(k=>{ const a=window._li.atrib[k]; (a.tarefas||[]).forEach(t=>{
    const o={t,l:a.lista,atribuida:true};
    if(vista==="meudia"){ if(t.meuDia===hoje||t.data===hoje) out.push(o); }
    else if(vista==="importante"){ if(t.importante) out.push(o); }
    else if(vista==="planejado"){ if(t.data) out.push(o); }
    else if(vista==="atribuido"){ out.push(o); }
  }); });
  listas.forEach(l=>{ const arr=(window._li.dados[l.id]||{}).tarefas||[];
    arr.forEach(t=>{
      if(vista==="meudia"){ if(t.meuDia===hoje||t.data===hoje) push(l,t); }
      else if(vista==="importante"){ if(t.importante) push(l,t); }
      else if(vista==="planejado"){ if(t.data) push(l,t); }
      else if(vista==="atribuido"){ if(t.atribuido===uid) push(l,t); }
      else if(vista===l.id) push(l,t);
    }); });
  return out;
}
function _liTarefaHTML(o, mostraLista){
  const t=o.t, l=o.l;
  if(o.virtual){
    const dt=_liFmtData(t.data); const meta=[];
    if(dt) meta.push(`<span class="${t.concluida?"":dt.cls}">${ico('calendario')} ${esc(dt.txt)}</span>`);
    if(t.condominio) meta.push(`<span>${ico('local')} ${esc(t.condominio)}</span>`);
    if(t.horas) meta.push(`<span>${esc(String(t.horas))} h</span>`);
    if(t.andamento && !t.concluida) meta.push(`<span style="color:#BA7517;font-weight:800">em andamento</span>`);
    meta.push(`<span>📆 Semana</span>`);
    return `<div class="li-row ${t.concluida?"done":""}" onclick="_liAbrirSemana('${t.id}')" title="Tarefa da agenda semanal — clique para editar">
      <button class="li-chk ${t.concluida?"on":""}" onclick="event.stopPropagation();_liToggleSemana('${t.id}')" title="${t.concluida?"Reabrir":"Concluir"}">${t.concluida?"✓":""}</button>
      <div class="bd"><div class="tt">${esc(t.titulo)}</div><div class="mt">${meta.join("")}</div></div>
      <span class="li-star ${t.importante?"on":""}" style="cursor:default" title="${t.importante?"Prioridade alta":""}">${t.importante?"★":""}</span>
    </div>`;
  }
  const et=(t.etapas||[]); const etTxt=et.length?`${et.filter(e=>e.feita).length} de ${et.length}`:"";
  const dt=_liFmtData(t.data);
  const meta=[];
  if(etTxt) meta.push(`<span>${etTxt}</span>`);
  if(dt) meta.push(`<span class="${t.concluida?"":dt.cls}">${ico('calendario')} ${esc(dt.txt)}</span>`);
  if(t.lembrete && !t.concluida) meta.push(`<span title="Lembrete">⏰ ${esc(_liFmtLembrete(t.lembrete))}</span>`);
  if(t.repeticao) meta.push(`<span title="Repete">🔁</span>`);
  if(t.anotacoes) meta.push(`<span title="Tem anotações">📝</span>`);
  if(t.arquivos&&t.arquivos.length) meta.push(`<span title="Arquivos">📎 ${t.arquivos.length}</span>`);
  if(t.atribuido) meta.push(`<span>👤 ${esc(_liNome(t.atribuido))}</span>`);
  if(mostraLista) meta.push(`<span>${_liIcone(l)} ${esc(l.nome)}${o.atribuida?` · de ${esc(_liNome(l.dono))}`:""}</span>`);
  const abertaCls=(window._li.aberta&&window._li.aberta.tid===t.id)?"sel":"";
  return `<div class="li-row ${t.concluida?"done":""} ${abertaCls}" onclick="abrirTarefaLista('${l.id}','${t.id}')">
    <button class="li-chk ${t.concluida?"on":""}" onclick="event.stopPropagation();_liToggleConcluida('${l.id}','${t.id}')" ontouchstart="event.stopPropagation();_liTs(event)" ontouchend="event.stopPropagation();if(_liTe(event)){event.preventDefault();_liToggleConcluida('${l.id}','${t.id}')}" title="${t.concluida?"Reabrir":"Concluir"}">${t.concluida?"✓":""}</button>
    <div class="bd"><div class="tt">${esc(t.titulo)}</div>${meta.length?`<div class="mt">${meta.join("")}</div>`:""}</div>
    <button class="li-star ${t.importante?"on":""}" onclick="event.stopPropagation();_liToggleImportante('${l.id}','${t.id}')" title="Importante">${t.importante?"★":"☆"}</button>
  </div>`;
}
function _liRenderMain(){
  const main=document.getElementById("liMain"); if(!main) return;
  const vista=window._li.vista||"meudia"; const uid=state.userId;
  const listas=listasVisiveis(window._li.idx||{listas:[]});
  const lista=listas.find(l=>l.id===vista);
  const titulos={meudia:["☀️","Meu Dia",new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})],importante:["⭐","Importante","Tarefas marcadas com estrela"],planejado:["📅","Planejado","Tarefas com data (listas + agenda semanal)"],atribuido:["👤","Atribuído a mim","Tarefas que alguém atribuiu a você"],semana:["📆","Semana (agenda)","As mesmas tarefas da aba Semana — concluir aqui conclui lá"]};
  let head;
  const voltar=_liCelular()?`<button class="li-back" onclick="_liVoltarMenu()" title="Voltar para as listas">‹</button>`:"";
  if(lista){
    const compart=(lista.compartilhadaCom||[]).length;
    head=`<div class="li-head">${voltar}<h2>${_liIcone(lista)} ${esc(lista.nome)}</h2><div class="sp"></div>
      <div class="li-lista-menu"><button onclick="_liToggleSom()" title="${_liSomLigado()?"Som ao concluir: ligado":"Som ao concluir: desligado"}">${_liSomLigado()?"🔔":"🔕"}</button>${compart?`<span title="${esc((lista.compartilhadaCom||[]).map(_liNome).join(", "))}" style="font-size:12px;color:var(--muted);align-self:center">👥 ${compart+1}</span>`:""}${(lista.dono===uid||state.user.tipo==="master")?`<button onclick="_liCompartilharLista('${lista.id}')" title="Compartilhar">👥<span class="txt">Compartilhar</span></button><button onclick="_liRenomearLista('${lista.id}')">✏️</button><button onclick="_liExcluirLista('${lista.id}')" title="Excluir lista">🗑</button>`:""}</div></div>`;
  } else {
    const tt=titulos[vista]||["📋",vista,""];
    head=`<div class="li-head">${voltar}<div><h2>${tt[0]} ${esc(tt[1])}</h2><div class="sub">${esc(tt[2])}</div></div><div class="sp"></div><div class="li-lista-menu"><button onclick="_liToggleSom()" title="${_liSomLigado()?"Som ao concluir: ligado":"Som ao concluir: desligado"}">${_liSomLigado()?"🔔":"🔕"}</button></div></div>`;
  }
  const todas=_liTarefasDaVista(vista);
  const abertas=todas.filter(o=>!o.t.concluida), feitas=todas.filter(o=>o.t.concluida);
  let corpo="";
  if(vista==="planejado"){
    const hoje=_liHoje(); const d=new Date(hoje+"T00:00:00");
    const amanha=ymd(new Date(d.getTime()+86400000)), semana=ymd(new Date(d.getTime()+7*86400000));
    const grupos=[["Atrasadas",o=>o.t.data<hoje],["Hoje",o=>o.t.data===hoje],["Amanhã",o=>o.t.data===amanha],["Próximos 7 dias",o=>o.t.data>amanha&&o.t.data<=semana],["Mais tarde",o=>o.t.data>semana]];
    const ord=abertas.slice().sort((a,b)=>a.t.data.localeCompare(b.t.data));
    grupos.forEach(([lbl,f])=>{ const g=ord.filter(f); if(g.length) corpo+=`<div class="li-grp">${lbl} · ${g.length}</div>`+g.map(o=>_liTarefaHTML(o,true)).join(""); });
  } else if(vista==="semana"){
    const ord=abertas.slice().sort((a,b)=>a.t.data.localeCompare(b.t.data));
    let diaAtual=""; ord.forEach(o=>{ if(o.t.data!==diaAtual){ diaAtual=o.t.data; const d=new Date(diaAtual+"T00:00:00"); corpo+=`<div class="li-grp">${d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"2-digit"})}</div>`; } corpo+=_liTarefaHTML(o,false); });
    corpo+=`<div style="margin-top:12px"><button class="btn-cancel" style="width:100%" onclick="setTarefasModo('semana')">${ico('calendario')} Abrir a aba Semana para adicionar</button></div>`;
  } else {
    const ord=abertas.slice().sort((a,b)=> (b.t.importante?1:0)-(a.t.importante?1:0) || (b.t.criadoEm||0)-(a.t.criadoEm||0));
    corpo=ord.map(o=>_liTarefaHTML(o,!lista)).join("");
  }
  if(!abertas.length) corpo+=`<div class="li-vazio">${lista?"Nenhuma tarefa aberta nesta lista.":(vista==="meudia"?"Nada no seu dia ainda. Abra uma tarefa e toque em \"Adicionar ao Meu Dia\".":(vista==="semana"?"Nenhuma tarefa na agenda desta semana.":"Nada por aqui."))}</div>`;
  if(lista){
    const repOps=[["","Não repete"],["diaria","Diariamente"],["semanal","Semanalmente"],["quinzenal","A cada 15 dias"],["mensal","Mensalmente"],["anual","Anualmente"]];
    corpo+=`<div class="li-add-wrap"><div class="li-add"><span class="pl">＋</span><input id="liNovaTarefa" placeholder="Adicionar uma tarefa" onkeydown="if(event.key==='Enter'){_liAddTarefa('${lista.id}')}">
      <button class="li-opt" id="liOptData" title="Data de conclusão" onclick="_liOpcaoAdd('data')">📅</button>
      <button class="li-opt" id="liOptLemb" title="Lembrete" onclick="_liOpcaoAdd('lembrete')">⏰</button>
      <button class="li-opt" id="liOptRep" title="Repetir" onclick="_liOpcaoAdd('repeticao')">🔁</button>
      <button class="btn-gold" style="padding:7px 12px" onclick="_liAddTarefa('${lista.id}')">Adicionar</button></div>
      <div class="li-add-opts" id="liAddOpts" style="display:none">
        <label>📅 Data de conclusão <input type="date" id="liAddData" onchange="_liOpcaoAdd()"></label>
        <label>⏰ Lembrete <input type="datetime-local" id="liAddLemb" onchange="_liOpcaoAdd()"></label>
        <label>🔁 Repetir <select id="liAddRep" onchange="_liOpcaoAdd()">${repOps.map(([v,l2])=>`<option value="${v}">${l2}</option>`).join("")}</select></label>
      </div></div>`;
  }
  if(feitas.length){
    const aberto=!!window._li.mostrarConcluidas[vista];
    corpo+=`<div class="li-conc"><button onclick="_liToggleConcluidas('${vista}')">${aberto?"▾":"▸"} Concluída &nbsp;${feitas.length}</button>${aberto?`<div style="margin-top:8px">${feitas.slice().sort((a,b)=>(b.t.concluidaEm||0)-(a.t.concluidaEm||0)).map(o=>_liTarefaHTML(o,!lista)).join("")}</div>`:""}</div>`;
  }
  main.innerHTML=head+corpo;
}
// abre/fecha as opções rápidas da barra de adicionar e destaca os ícones preenchidos
function _liOpcaoAdd(qual){
  const box=document.getElementById("liAddOpts"); if(!box) return;
  if(qual){ box.style.display=""; const map={data:"liAddData",lembrete:"liAddLemb",repeticao:"liAddRep"}; const el=document.getElementById(map[qual]); if(el){ try{ el.focus(); if(el.showPicker) el.showPicker(); }catch(e){} } }
  const v=id=>{ const el=document.getElementById(id); return el?el.value:""; };
  const b=(id,on)=>{ const el=document.getElementById(id); if(el) el.classList.toggle("on",!!on); };
  b("liOptData",v("liAddData")); b("liOptLemb",v("liAddLemb")); b("liOptRep",v("liAddRep"));
}
function _liFmtLembrete(iso){
  if(!iso) return "";
  const d=new Date(iso); if(isNaN(d)) return iso;
  const hoje=_liHoje(), ds=ymd(d);
  const hora=d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
  if(ds===hoje) return "hoje "+hora;
  return d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})+" "+hora;
}
function _liToggleConcluidas(vista){ window._li.mostrarConcluidas[vista]=!window._li.mostrarConcluidas[vista]; _liRenderMain(); }
function _liAchar(listaId,tid){ const d=window._li.dados[listaId]; if(!d) return null; return (d.tarefas||[]).find(t=>t.id===tid)||null; }

/* ---------- ações nas tarefas ---------- */
async function _liAddTarefa(listaId){
  const inp=document.getElementById("liNovaTarefa"); const titulo=(inp?inp.value:"").trim(); if(!titulo) return;
  const d=await loadLista(listaId); if(!d.tarefas) d.tarefas=[];
  const v=id=>{ const el=document.getElementById(id); return el?el.value:""; };
  const t={id:"lt"+Date.now()+Math.random().toString(36).slice(2,5),titulo,concluida:false,importante:false,data:v("liAddData")||"",lembrete:v("liAddLemb")||"",repeticao:v("liAddRep")||"",meuDia:"",anotacoes:"",atribuido:"",etapas:[],criadoPor:state.userId,criadoEm:Date.now()};
  d.tarefas.push(t); await saveLista(listaId,d); window._li.dados[listaId]=d;
  _liRenderMain(); const i2=document.getElementById("liNovaTarefa"); if(i2) i2.focus();
}
function _liProximaData(ds, rep){
  const d=new Date((ds||_liHoje())+"T00:00:00");
  if(rep==="diaria") d.setDate(d.getDate()+1);
  else if(rep==="semanal") d.setDate(d.getDate()+7);
  else if(rep==="quinzenal") d.setDate(d.getDate()+14);
  else if(rep==="mensal") d.setMonth(d.getMonth()+1);
  else if(rep==="anual") d.setFullYear(d.getFullYear()+1);
  else return "";
  return ymd(d);
}
async function _liToggleConcluida(listaId,tid){
  const d=await loadLista(listaId); const t=(d.tarefas||[]).find(x=>x.id===tid); if(!t) return;
  t.concluida=!t.concluida; t.concluidaEm=t.concluida?Date.now():null;
  if(t.concluida) _liSom("tarefa");
  if(t.concluida && t.repeticao){
    // cria a próxima ocorrência (a concluída fica no histórico)
    const prox=_liProximaData(t.data, t.repeticao);
    if(prox){ let lemb=""; if(t.lembrete){ try{ const dl=new Date(t.lembrete); const dif=(new Date(prox+"T00:00:00")-new Date((t.data||_liHoje())+"T00:00:00")); lemb=new Date(dl.getTime()+dif).toISOString().slice(0,16); }catch(e){ lemb=""; } }
      d.tarefas.push({...t,id:"lt"+Date.now()+Math.random().toString(36).slice(2,5),concluida:false,concluidaEm:null,data:prox,lembrete:lemb,lembreteAvisado:false,meuDia:"",etapas:(t.etapas||[]).map(e=>({...e,feita:false})),criadoEm:Date.now()}); }
  }
  await saveLista(listaId,d); window._li.dados[listaId]=d;
  if(window._li.aberta && window._li.aberta.tid===tid) abrirTarefaLista(listaId,tid); else _liRenderMain();
}
async function _liToggleImportante(listaId,tid){
  const d=await loadLista(listaId); const t=(d.tarefas||[]).find(x=>x.id===tid); if(!t) return;
  t.importante=!t.importante; await saveLista(listaId,d); window._li.dados[listaId]=d;
  if(window._li.aberta && window._li.aberta.tid===tid) abrirTarefaLista(listaId,tid); else _liRenderMain();
}

/* ---------- detalhe da tarefa (painel lateral no computador · modal no celular) ---------- */
function _liPainelLargo(){ try{ return window.innerWidth>760 && !!document.getElementById("liDetail"); }catch(e){ return false; } }
function _liTempoRel(ts){
  if(!ts) return ""; const dif=Date.now()-ts, m=Math.round(dif/60000), h=Math.round(dif/3600000), d=Math.round(dif/86400000);
  if(m<2) return "há alguns instantes"; if(m<60) return "há "+m+" min"; if(h<24) return "há "+h+" h"; if(d===1) return "ontem"; if(d<30) return "há "+d+" dias";
  return "em "+new Date(ts).toLocaleDateString("pt-BR");
}
function _liDetalheHTML(listaId,t,l){
  const tid=t.id, hoje=_liHoje(); const noMeuDia=t.meuDia===hoje||t.data===hoje;
  const pessoas=_liPessoas();
  const repOps=[["","Repetir"],["diaria","Diariamente"],["semanal","Semanalmente"],["quinzenal","A cada 15 dias"],["mensal","Mensalmente"],["anual","Anualmente"]];
  const repLbl={diaria:"Diariamente",semanal:"Semanalmente",quinzenal:"A cada 15 dias",mensal:"Mensalmente",anual:"Anualmente"};
  const et=(t.etapas||[]);
  const etapas=et.map(e=>`<div class="li-etapa ${e.feita?"done":""}" ${_liTap(`_liToggleEtapa('${listaId}','${tid}','${e.id}')`)}><span class="li-chk ${e.feita?"on":""}">${e.feita?"✓":""}</span><span>${esc(e.titulo)}</span><button class="x" onclick="event.stopPropagation();_liDelEtapa('${listaId}','${tid}','${e.id}')" ontouchend="event.stopPropagation();event.preventDefault();_liDelEtapa('${listaId}','${tid}','${e.id}')" title="Remover etapa">×</button></div>`).join("");
  const dt=_liFmtData(t.data);
  const listasOpt=listasVisiveis(window._li.idx).map(x=>`<option value="${x.id}" ${x.id===listaId?"selected":""}>${_liIcone(x)} ${esc(x.nome)}</option>`).join("");
  const arqs=(t.arquivos||[]).map(a=>`<div class="li-arq">${/^image\//.test(a.tipo)?`<img src="${a.dados}" alt="">`:`<span class="ic">📎</span>`}<a href="${a.dados}" download="${esc(a.nome)}" target="_blank">${esc(a.nome)}</a><small>${a.tam?Math.round(a.tam/1024)+" KB":""}</small><button onclick="_liDelArquivo('${listaId}','${tid}','${a.id}')" title="Remover">×</button></div>`).join("");
  return `
    <div class="li-dbox">
      <div class="li-dtitle"><button class="li-chk ${t.concluida?"on":""}" ${_liTap(`_liToggleConcluida('${listaId}','${tid}')`)}>${t.concluida?"✓":""}</button><input type="text" value="${esc(t.titulo)}" onchange="_liSalvarCampo('${listaId}','${tid}','titulo',this.value)"><button class="li-star ${t.importante?"on":""}" onclick="_liToggleImportante('${listaId}','${tid}')">${t.importante?"★":"☆"}</button></div>
      ${etapas}
      <div class="li-etapa-add"><span style="color:var(--navy);font-weight:800;align-self:center">＋</span><input id="liNovaEtapa" placeholder="Adicionar etapa" onkeydown="if(event.key==='Enter'){_liAddEtapa('${listaId}','${tid}')}"></div>
      ${et.length?`<div style="font-size:11px;color:var(--muted);padding:4px 2px 0">${et.filter(e=>e.feita).length} de ${et.length} etapas</div>`:""}
    </div>
    <div class="li-dbox"><div class="li-drow" onclick="_liMeuDia('${listaId}','${tid}')"><span class="ic">☀️</span><div class="lb ${noMeuDia?"on":""}">${noMeuDia?"Adicionada a Meu Dia":"Adicionar a Meu Dia"}</div>${noMeuDia?`<button class="clr" onclick="event.stopPropagation();_liMeuDia('${listaId}','${tid}')" title="Tirar do Meu Dia">×</button>`:""}</div></div>
    <div class="li-dbox">
      <div class="li-drow" onclick="const i=this.querySelector('input');i.style.display='';try{i.showPicker&&i.showPicker()}catch(e){};i.focus()"><span class="ic">⏰</span><div class="lb ${t.lembrete?"set":""}">${t.lembrete?"Lembrar-me "+esc(_liFmtLembrete(t.lembrete)):"Lembrar-me"}</div><input type="datetime-local" value="${esc(t.lembrete||"")}" style="${t.lembrete?"display:none":"display:none"}" onclick="event.stopPropagation()" onchange="_liSalvarCampo('${listaId}','${tid}','lembrete',this.value)">${t.lembrete?`<button class="clr" onclick="event.stopPropagation();_liLimparCampo('${listaId}','${tid}','lembrete')">×</button>`:""}</div>
      <div class="li-drow" onclick="const i=this.querySelector('input');i.style.display='';try{i.showPicker&&i.showPicker()}catch(e){};i.focus()"><span class="ic">📅</span><div class="lb ${t.data?("set "+(dt&&dt.cls==="late"?"late":"")):""}" ${dt&&dt.cls==="late"?'style="color:#C0392B"':""}>${t.data?"Vence "+esc(dt.txt):"Adicionar data de conclusão"}</div><input type="date" value="${esc(t.data||"")}" style="display:none" onclick="event.stopPropagation()" onchange="_liSalvarCampo('${listaId}','${tid}','data',this.value)">${t.data?`<button class="clr" onclick="event.stopPropagation();_liLimparCampo('${listaId}','${tid}','data')">×</button>`:""}</div>
      <div class="li-drow" onclick="const s=this.querySelector('select');s.style.display='';s.focus()"><span class="ic">🔁</span><div class="lb ${t.repeticao?"set":""}">${t.repeticao?esc(repLbl[t.repeticao]||"Repete"):"Repetir"}</div><select style="display:none" onclick="event.stopPropagation()" onchange="_liSalvarCampo('${listaId}','${tid}','repeticao',this.value)">${repOps.map(([v,l2])=>`<option value="${v}" ${t.repeticao===v?"selected":""}>${l2}</option>`).join("")}</select>${t.repeticao?`<button class="clr" onclick="event.stopPropagation();_liLimparCampo('${listaId}','${tid}','repeticao')">×</button>`:""}</div>
    </div>
    <div class="li-dbox">
      <div class="li-drow" onclick="const s=this.querySelector('select');s.style.display='';s.focus()"><span class="ic">👤</span><div class="lb ${t.atribuido?"set":""}">${t.atribuido?"Atribuída a "+esc(_liNome(t.atribuido)):"Atribuir a"}</div><select style="display:none" onclick="event.stopPropagation()" onchange="_liSalvarCampo('${listaId}','${tid}','atribuido',this.value)"><option value="">— ninguém —</option>${pessoas.map(p=>`<option value="${p}" ${t.atribuido===p?"selected":""}>${esc(USUARIOS[p].nome)}</option>`).join("")}</select>${t.atribuido?`<button class="clr" onclick="event.stopPropagation();_liLimparCampo('${listaId}','${tid}','atribuido')">×</button>`:""}</div>
      <div class="li-drow" onclick="const s=this.querySelector('select');s.style.display='';s.focus()"><span class="ic">📋</span><div class="lb">Mover para outra lista</div><select style="display:none" onclick="event.stopPropagation()" onchange="_liMoverTarefa('${listaId}','${tid}',this.value)">${listasOpt}</select></div>
    </div>
    <div class="li-dbox">
      <div class="li-drow" onclick="this.querySelector('input').click()"><span class="ic">📎</span><div class="lb">Adicionar arquivo</div><input type="file" style="display:none" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" onclick="event.stopPropagation()" onchange="_liAddArquivo('${listaId}','${tid}',this)"></div>
      ${arqs}
    </div>
    <div class="li-dbox" id="liAnotBox">${t.anotacoes
      ? `<div class="li-anot-txt" onclick="_liEditarAnotacao('${listaId}','${tid}')">${esc(t.anotacoes).replace(/\n/g,"<br>")}</div><div class="li-anot-acoes"><button onclick="_liEditarAnotacao('${listaId}','${tid}')">✏️ Editar anotação</button></div>`
      : `<div class="li-drow" onclick="_liEditarAnotacao('${listaId}','${tid}')"><span class="ic">📝</span><div class="lb">Adicionar anotação</div></div>`}</div>
    <div class="li-dfoot"><span>Criada ${esc(_liTempoRel(t.criadoEm))}${t.criadoPor&&t.criadoPor!==state.userId?" por "+esc(_liNome(t.criadoPor)):""}</span><button onclick="_liExcluirTarefa('${listaId}','${tid}')" title="Excluir tarefa">🗑</button></div>`;
}
function _liFecharDetalhe(){
  window._li.aberta=null;
  const p=document.getElementById("liDetail"); if(p){ p.style.display="none"; p.innerHTML=""; }
  const wr=document.getElementById("liWrap"); if(wr) wr.classList.remove("com-detalhe");
  const mm=document.getElementById("modalMount"); if(mm && mm.innerHTML.indexOf("li-det")>-1) closeModal();
  _liRenderMain();
}
async function abrirTarefaLista(listaId,tid){
  _liCSS();
  const d=await loadLista(listaId); window._li.dados[listaId]=d;
  const t=(d.tarefas||[]).find(x=>x.id===tid); if(!t) return;
  window._li.aberta={listaId,tid};
  const l=(window._li.idx.listas||[]).find(x=>x.id===listaId)||{nome:""};
  if(window._li.atrib && window._li.atrib[listaId]){ window._li.atrib[listaId].tarefas=(d.tarefas||[]).filter(x=>x.atribuido===state.userId); }
  const html=_liDetalheHTML(listaId,t,l);
  if(_liPainelLargo()){
    const p=document.getElementById("liDetail"); p.style.display=""; p.innerHTML=`<div class="li-dclose"><button onclick="_liFecharDetalhe()" title="Fechar">×</button></div>`+html;
    const wr=document.getElementById("liWrap"); if(wr) wr.classList.add("com-detalhe");
    _liRenderMain();
  } else {
    document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this){_liFecharDetalhe()}"><div class="modal li-det" style="max-width:520px">
      <div class="modal-head"><h3>${_liIcone(l)} ${esc(l.nome)}</h3><button class="x" onclick="_liFecharDetalhe()">×</button></div>
      <div class="modal-body">${html}</div></div></div>`;
  }
}
// build 140 — toque confiável no iPhone: o Safari às vezes engole o "click" (teclado aberto, viewport deslocada),
// então a ação também dispara no fim do toque, se não houve arraste. O preventDefault evita executar duas vezes.
function _liTs(ev){ try{ const t=ev.touches&&ev.touches[0]; window._liTouch=t?{x:t.clientX,y:t.clientY,t:Date.now()}:null; }catch(e){ window._liTouch=null; } }
function _liTe(ev){
  try{ const s=window._liTouch; window._liTouch=null; if(!s) return false;
    const t=ev.changedTouches&&ev.changedTouches[0]; if(!t) return false;
    const moveu=Math.abs(t.clientX-s.x)>10||Math.abs(t.clientY-s.y)>10; const demorou=(Date.now()-s.t)>700;
    if(moveu||demorou) return false;
    try{ if(document.activeElement&&document.activeElement.blur) document.activeElement.blur(); }catch(e){}
    return true;
  }catch(e){ return false; }
}
function _liTap(js){ return `onclick="${js}" ontouchstart="_liTs(event)" ontouchend="if(_liTe(event)){event.preventDefault();${js}}"`; }
// anotação: abre a caixa de texto só na hora de editar; Salvar grava e volta para o modo leitura
function _liEditarAnotacao(listaId,tid){
  const box=document.getElementById("liAnotBox"); if(!box) return;
  const t=_liAchar(listaId,tid)||{};
  box.innerHTML=`<label>Anotação</label><textarea id="liAnotTxt" placeholder="Escreva a anotação…">${esc(t.anotacoes||"")}</textarea>
    <div class="li-anot-acoes"><button class="btn-cancel" onclick="abrirTarefaLista('${listaId}','${tid}')">Cancelar</button><button class="btn-gold" onclick="_liSalvarAnotacao('${listaId}','${tid}')">Salvar</button></div>`;
  const ta=document.getElementById("liAnotTxt"); if(ta){ ta.focus(); try{ ta.setSelectionRange(ta.value.length,ta.value.length); }catch(e){} }
}
async function _liSalvarAnotacao(listaId,tid){
  const ta=document.getElementById("liAnotTxt"); const v=ta?ta.value:"";
  await _liSalvarCampo(listaId,tid,"anotacoes",v);
  abrirTarefaLista(listaId,tid);   // volta para o modo leitura
}
async function _liLimparCampo(listaId,tid,campo){ await _liSalvarCampo(listaId,tid,campo,""); abrirTarefaLista(listaId,tid); }
async function _liAddArquivo(listaId,tid,input){
  const file=input&&input.files&&input.files[0]; if(!file) return;
  let dados="", tam=file.size, tipo=file.type||"";
  try{
    if(/^image\//.test(tipo)){ const r=await comprimirImagem(file,1400,0.8); dados=r.foto; tipo="image/jpeg"; tam=Math.round(dados.length*0.75); }
    else {
      if(file.size>1500000){ alert("Arquivo grande demais (limite 1,5 MB). Para fotos não há limite: elas são comprimidas."); return; }
      dados=await new Promise((res,rej)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(file); });
    }
  }catch(e){ alert("Não consegui ler o arquivo."); return; }
  const d=await loadLista(listaId); const t=(d.tarefas||[]).find(x=>x.id===tid); if(!t) return;
  if(!t.arquivos) t.arquivos=[]; t.arquivos.push({id:"a"+Date.now()+Math.random().toString(36).slice(2,4),nome:file.name,tipo,tam,dados,por:state.userId,ts:Date.now()});
  await saveLista(listaId,d); window._li.dados[listaId]=d; abrirTarefaLista(listaId,tid);
}
async function _liDelArquivo(listaId,tid,aid){
  const d=await loadLista(listaId); const t=(d.tarefas||[]).find(x=>x.id===tid); if(!t) return;
  t.arquivos=(t.arquivos||[]).filter(a=>a.id!==aid); await saveLista(listaId,d); window._li.dados[listaId]=d; abrirTarefaLista(listaId,tid);
}
async function _liSalvarCampo(listaId,tid,campo,valor){
  const d=await loadLista(listaId); const t=(d.tarefas||[]).find(x=>x.id===tid); if(!t) return;
  t[campo]=(campo==="titulo")?String(valor).trim()||t.titulo:valor;
  if(campo==="lembrete") t.lembreteAvisado=false;
  if(campo==="atribuido" && valor && valor!==state.userId){
    // build 136: quem recebe a tarefa vê SÓ a tarefa (em "Atribuído a mim"), não a lista inteira
    const idx=await loadListasIndex(); const l=(idx.listas||[]).find(x=>x.id===listaId);
    if(l && !(l.atribuidos||[]).includes(valor)){ l.atribuidos=(l.atribuidos||[]).concat([valor]); await saveListasIndex(idx); window._li.idx=idx; }
    try{ await pushAviso(valor,{id:"lt"+Date.now()+Math.random().toString(36).slice(2,5),tipo:"tarefa_lista",texto:"📋 Tarefa atribuída a você: "+t.titulo,sub:"Lista "+(((idx.listas||[]).find(x=>x.id===listaId)||{}).nome||"")+" · por "+_liNome(state.userId),goTab:"tarefas",ts:Date.now()}); }catch(e){}
  }
  await saveLista(listaId,d); window._li.dados[listaId]=d;
  _liRenderMain();
  if(window._li.aberta && window._li.aberta.tid===tid && campo!=="anotacoes" && campo!=="titulo") abrirTarefaLista(listaId,tid);
}
async function _liMeuDia(listaId,tid){
  const d=await loadLista(listaId); const t=(d.tarefas||[]).find(x=>x.id===tid); if(!t) return;
  const hoje=_liHoje(); t.meuDia=(t.meuDia===hoje)?"":hoje;
  await saveLista(listaId,d); window._li.dados[listaId]=d; abrirTarefaLista(listaId,tid); _liRenderMain();
}
async function _liAddEtapa(listaId,tid){
  const inp=document.getElementById("liNovaEtapa"); const titulo=(inp?inp.value:"").trim(); if(!titulo) return;
  const d=await loadLista(listaId); const t=(d.tarefas||[]).find(x=>x.id===tid); if(!t) return;
  if(!t.etapas) t.etapas=[]; t.etapas.push({id:"e"+Date.now()+Math.random().toString(36).slice(2,4),titulo,feita:false});
  await saveLista(listaId,d); window._li.dados[listaId]=d; abrirTarefaLista(listaId,tid); _liRenderMain();
  const ehIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent||"");
  if(!ehIOS) setTimeout(()=>{ const i2=document.getElementById("liNovaEtapa"); if(i2) i2.focus(); },50);
}
async function _liToggleEtapa(listaId,tid,eid){
  const d=await loadLista(listaId); const t=(d.tarefas||[]).find(x=>x.id===tid); if(!t) return;
  const e=(t.etapas||[]).find(x=>x.id===eid); if(!e) return; e.feita=!e.feita;
  if(e.feita) _liSom("etapa");
  await saveLista(listaId,d); window._li.dados[listaId]=d; abrirTarefaLista(listaId,tid); _liRenderMain();
}
async function _liDelEtapa(listaId,tid,eid){
  const d=await loadLista(listaId); const t=(d.tarefas||[]).find(x=>x.id===tid); if(!t) return;
  t.etapas=(t.etapas||[]).filter(x=>x.id!==eid);
  await saveLista(listaId,d); window._li.dados[listaId]=d; abrirTarefaLista(listaId,tid); _liRenderMain();
}
async function _liExcluirTarefa(listaId,tid){
  if(!confirm("Excluir esta tarefa?")) return;
  const d=await loadLista(listaId); d.tarefas=(d.tarefas||[]).filter(x=>x.id!==tid);
  await saveLista(listaId,d); window._li.dados[listaId]=d; _liFecharDetalhe();
}
async function _liMoverTarefa(listaId,tid,destino){
  if(!destino||destino===listaId) return;
  const d=await loadLista(listaId); const t=(d.tarefas||[]).find(x=>x.id===tid); if(!t) return;
  d.tarefas=d.tarefas.filter(x=>x.id!==tid); await saveLista(listaId,d); window._li.dados[listaId]=d;
  const d2=await loadLista(destino); if(!d2.tarefas) d2.tarefas=[]; d2.tarefas.push(t); await saveLista(destino,d2); window._li.dados[destino]=d2;
  window._li.aberta={listaId:destino,tid}; try{ closeModal(); }catch(e){} window._li.vista=destino; renderListas();
}

/* ---------- listas ---------- */
function abrirNovaLista(){
  _liCSS(); window._liNova={icone:"📋",cor:LI_CORES[0]};
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal li-det" style="max-width:460px">
    <div class="modal-head"><h3>＋ Nova lista</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="fld"><label>Nome</label><input type="text" id="liNomeLista" placeholder="Ex.: Tarefas Julia – Comunicação" onkeydown="if(event.key==='Enter')salvarNovaLista()"></div>
      <div class="fld"><label>Ícone</label><div class="li-icones" id="liIcones">${LI_ICONES.map(i=>`<button class="${i==="📋"?"on":""}" onclick="window._liNova.icone='${i}';[...document.querySelectorAll('#liIcones button')].forEach(b=>b.classList.toggle('on',b.textContent==='${i}'))">${i}</button>`).join("")}</div></div>
      <div class="modal-foot" style="margin-top:16px"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-primary" style="flex:1" onclick="salvarNovaLista()">Criar lista</button></div>
    </div></div></div>`;
  setTimeout(()=>{ const i=document.getElementById("liNomeLista"); if(i) i.focus(); },50);
}
async function salvarNovaLista(){
  const nome=(document.getElementById("liNomeLista").value||"").trim(); if(!nome){ alert("Dê um nome à lista."); return; }
  const idx=await loadListasIndex();
  const l={id:"L"+Date.now()+Math.random().toString(36).slice(2,5),nome,icone:(window._liNova||{}).icone||"📋",cor:(window._liNova||{}).cor||LI_CORES[0],dono:state.userId,compartilhadaCom:[],criadoEm:Date.now()};
  idx.listas.push(l); await saveListasIndex(idx); closeModal(); window._li.vista=l.id; renderListas();
}
function _liMenuLista(id){ _liRenomearLista(id); }
async function _liRenomearLista(id){
  const idx=await loadListasIndex(); const l=(idx.listas||[]).find(x=>x.id===id); if(!l) return;
  const nome=prompt("Nome da lista:", l.nome); if(nome===null) return; if(!nome.trim()) return;
  l.nome=nome.trim(); await saveListasIndex(idx); renderListas();
}
async function _liCompartilharLista(id){
  const idx=await loadListasIndex(); const l=(idx.listas||[]).find(x=>x.id===id); if(!l) return;
  const pessoas=_liPessoas().filter(p=>p!==l.dono);
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal li-det" style="max-width:460px">
    <div class="modal-head"><h3>👥 Compartilhar "${esc(l.nome)}"</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body"><p class="book-sub" style="margin-bottom:10px">Quem estiver marcado vê e edita esta lista.</p>
      <div class="li-pessoas">${pessoas.map(p=>`<label><input type="checkbox" name="liComp" value="${p}" ${(l.compartilhadaCom||[]).includes(p)?"checked":""}> ${esc(USUARIOS[p].nome)} <small style="color:var(--muted)">· ${esc(USUARIOS[p].cargo||USUARIOS[p].tipo||"")}</small></label>`).join("")}</div>
      <div class="modal-foot" style="margin-top:16px"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-primary" style="flex:1" onclick="_liSalvarCompartilhar('${id}')">Salvar</button></div>
    </div></div></div>`;
}
async function _liSalvarCompartilhar(id){
  const idx=await loadListasIndex(); const l=(idx.listas||[]).find(x=>x.id===id); if(!l) return;
  const antes=l.compartilhadaCom||[];
  l.compartilhadaCom=[...document.querySelectorAll('input[name="liComp"]:checked')].map(c=>c.value);
  await saveListasIndex(idx);
  for(const p of l.compartilhadaCom){ if(!antes.includes(p)){ try{ await pushAviso(p,{id:"ls"+Date.now()+Math.random().toString(36).slice(2,5),tipo:"lista_compartilhada",texto:"📋 "+_liNome(state.userId)+" compartilhou a lista \""+l.nome+"\" com você",sub:"Abra Tarefas → Listas",goTab:"tarefas",ts:Date.now()}); }catch(e){} } }
  closeModal(); renderListas();
}
async function _liExcluirLista(id){
  const idx=await loadListasIndex(); const l=(idx.listas||[]).find(x=>x.id===id); if(!l) return;
  const d=await loadLista(id); const n=(d.tarefas||[]).length;
  if(!confirm(`Excluir a lista "${l.nome}"${n?` e suas ${n} tarefa(s)`:""}? Esta ação não tem volta.`)) return;
  idx.listas=idx.listas.filter(x=>x.id!==id); await saveListasIndex(idx);
  try{ await storeDel("mafra:lista:"+id); }catch(e){}
  window._li.vista="meudia"; renderListas();
}

/* ---------- integração: tarefas de lista com data, por dia (para a agenda semanal / painel) ---------- */
async function listasTarefasPorData(uid, dsSet){
  const idx=await loadListasIndex(); const out={};
  const listas=(idx.listas||[]).filter(l=>l.dono===uid||(l.compartilhadaCom||[]).includes(uid)||(l.atribuidos||[]).includes(uid));
  for(const l of listas){ const d=await loadLista(l.id); const minha=l.dono===uid||(l.compartilhadaCom||[]).includes(uid);
    (d.tarefas||[]).forEach(t=>{ if(t.concluida||!t.data||!dsSet.has(t.data)) return;
      if(!minha && t.atribuido!==uid) return;           // lista alheia: só o que é meu
      if(minha && t.atribuido && t.atribuido!==uid) return;
      (out[t.data]=out[t.data]||[]).push({...t,lista:l.nome,listaId:l.id}); }); }
  return out;
}


/* ---------- lembretes: ao abrir o app, avisa (sino + badge) as tarefas cujo lembrete já chegou ---------- */
async function _liChecarLembretes(){
  try{
    if(!state.userId) return;
    const uid=state.userId, agora=Date.now();
    const idx=await loadListasIndex();
    const listas=(idx.listas||[]).filter(l=>l.dono===uid||(l.compartilhadaCom||[]).includes(uid)||(l.atribuidos||[]).includes(uid));
    for(const l of listas){
      const d=await loadLista(l.id); let mudou=false;
      for(const t of (d.tarefas||[])){
        if(t.concluida||!t.lembrete||t.lembreteAvisado) continue;
        const quando=new Date(t.lembrete).getTime(); if(isNaN(quando)||quando>agora) continue;
        const minha = t.atribuido ? t.atribuido===uid : (t.criadoPor===uid || l.dono===uid);
        if(!minha) continue;
        t.lembreteAvisado=true; mudou=true;
        try{ await pushAviso(uid,{id:"lb"+Date.now()+Math.random().toString(36).slice(2,5),tipo:"lembrete_tarefa",texto:"⏰ Lembrete: "+t.titulo,sub:"Lista "+l.nome+(t.data?" · para "+String(t.data).split("-").reverse().join("/"):""),goTab:"tarefas",ts:Date.now()}); }catch(e){}
        try{ _liSom("tarefa"); }catch(e){}
      }
      if(mudou) await saveLista(l.id,d);
    }
    try{ atualizaSino(); }catch(e){}
  }catch(e){}
}


/* ---------- espelho da agenda semanal dentro das Listas ----------
   A tarefa continua morando em mafra:agenda:<uid> (aba Semana). Aqui ela só é MOSTRADA
   (Meu Dia, Planejado, Semana) e pode ser concluída/reaberta — sem cópia, sem conflito. */
async function _liTarefasSemanaVirtuais(){
  if(!state.userId || typeof weekKey!=="function" || typeof dateOfDay!=="function") return [];
  const ag=await loadAgenda(state.userId); const out=[];
  for(let off=-2; off<=6; off++){
    const wk=weekKey(off); const arr=(ag.weeks&&ag.weeks[wk])||[];
    arr.forEach(x=>{ const dia=DIAS.find(d=>d.k===x.dia); if(!dia) return;
      out.push({ id:x.id, wk, dia:x.dia, data:ymd(dateOfDay(off,dia.off)), titulo:x.tarefa||x.titulo||"(sem título)",
        concluida:x.status==="concluido", andamento:x.status==="em_andamento", importante:x.prioridade==="alta",
        condominio:x.condominio||"", horas:x.horas||"", virtual:true }); });
  }
  return out;
}
async function _liToggleSemana(id){
  const ag=await loadAgenda(state.userId); let alvo=null;
  for(const wk in (ag.weeks||{})){ const x=(ag.weeks[wk]||[]).find(y=>y.id===id); if(x){ alvo=x; break; } }
  if(!alvo) return;
  if(alvo.status==="concluido"){ alvo.status="planejado"; } else { alvo.status="concluido"; _liSom("tarefa"); }
  await saveAgenda(state.userId,ag);
  try{ window._li.semana=await _liTarefasSemanaVirtuais(); }catch(e){}
  _liRenderMain();
}
function _liAbrirSemana(id){
  if(state.user && state.user.tipo==="sindico" && typeof editTask==="function") return editTask(id);
  if(typeof editTaskLid==="function") return editTaskLid(id);
}
