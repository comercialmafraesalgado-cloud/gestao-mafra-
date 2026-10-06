/* ============================================================
   GESTÃO MAFRA — ABA GRAVACOES ATA  (v2)
   Gerado para o sistema Mafra. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)

   NOVIDADES desta versão:
   • Gravação segura até 2h (limite com parada automática + cronômetro regressivo)
   • Áudio salvo em pedaços no IndexedDB enquanto grava (recuperável se travar)
   • Wake Lock reativando sozinho quando o app volta ao primeiro plano
   • Avisos claros: NÃO trocar de app, manter a tela ligada, limite de 2h
   • Áudio guardado no sistema (Supabase Storage) para ouvir depois
   • Cada gravação pode ser NOMEADA / renomeada
   • Por gravação: ouvir, transcrever, compartilhar no WhatsApp, cortar, excluir
   • Cortar gera uma 2ª versão (mantém o original); a 2ª também transcreve/compartilha
   ============================================================ */

/* ---- Configuração ---- */
var ATA_BUCKET = "gravacoes";           // bucket do Supabase Storage para os áudios
var ATA_MAX_MS = 2 * 60 * 60 * 1000;    // limite de gravação: 2 horas
var ATA_BITRATE = 24000;                // ~24 kbps mono: 2h ≈ 21 MB (cabe na transcrição)
var ATA_CORTE_MAX_MB = 25;              // acima disso o navegador não corta com segurança
var gvParts = [];                        // participantes em edição (tela de detalhe)
var gvPlano = [];                        // plano de ação em edição (tela de detalhe)
var gvTab = "resumo";
var gvKeepEdits = false;   // quando true, abrirGravacao NÃO recarrega gvParts/gvPlano (preserva o que está sendo digitado)
var gvPlanoEdit = false;   // false = plano salvo aparece em modo consulta; true = tabela editável                    // aba interna ativa no painel da gravação
function _durHM(ms){ if(!ms) return ""; var t=Math.round(ms/60000); var h=Math.floor(t/60); var m=t%60; return h>0?(("0"+h).slice(-2)+"h"+("0"+m).slice(-2)+"min"):(m+"min"); }
var PLANO_PRIORIDADES=["Baixa","Média","Alta","Crítica"];
var PLANO_STATUS=["Não iniciado","Em andamento","Aguardando recursos","Finalizado"];
function _migStatus(st){ st=(st||"").trim(); var m={"Pendente":"Não iniciado","Concluído":"Finalizado","Aguardando Recursos":"Aguardando recursos","Aguardando terceiros":"Aguardando recursos","Cancelado":"Não iniciado"}; if(m[st]) return m[st]; return PLANO_STATUS.includes(st)?st:"Não iniciado"; }
var PLANO_CATEGORIAS=["Financeiro","Operacional","Jurídico","Manutenção","Obras","Segurança","Comunicação","Administrativo","Comercial","Outros"];
var PLANO_IMPACTOS=["Financeiro","Operacional","Jurídico","Segurança","Comunicação","Estratégico"];
/* interpreta o prazo (aaaa-mm-dd, dd/mm/aaaa ou dd/mm) como data */
function _parsePrazo(str){
  if(!str) return null; str=String(str).trim();
  var m=str.match(/^(\d{4})-(\d{2})-(\d{2})/); if(m) return new Date(+m[1],+m[2]-1,+m[3],23,59,59);
  m=str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); if(m) return new Date(+m[3],+m[2]-1,+m[1],23,59,59);
  m=str.match(/^(\d{1,2})\/(\d{1,2})$/); if(m) return new Date(new Date().getFullYear(),+m[2]-1,+m[1],23,59,59);
  return null;
}
/* alerta de prazo: 🔴 vencido, 🟡 vence em até 3 dias, 🟢 concluído */
function _alertaAcao(a){
  var st=a.status;
  st=_migStatus(st);
  if(st==="Finalizado") return {e:"🟢",t:"Finalizada"};
  var dt=_parsePrazo(a.prazo); if(!dt) return {e:"",t:""};
  var hoje=new Date();
  if(dt<hoje) return {e:"🔴",t:"Prazo vencido"};
  if((dt-hoje)<=3*864e5) return {e:"🟡",t:"Vence em breve"};
  return {e:"",t:""};
}
function _numVal(v){ var n=parseFloat(String(v==null?"":v).replace(",",".")); return isFinite(n)?n:0; }
function _fmtBRL(v){ var n=_numVal(v); if(!n) return ""; return "R$ "+n.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}); }
function _fmtPrazoBr(p){ var d=_parsePrazo(p); if(!d) return p||"—"; return ("0"+d.getDate()).slice(-2)+"/"+("0"+(d.getMonth()+1)).slice(-2)+"/"+d.getFullYear(); }
function _prioBdg(p){ p=p||"Média"; var c={"Crítica":["#FDE7E7","#B3261E"],"Alta":["#FFF0E0","#B45309"],"Média":["#FFF8DD","#8a6d00"],"Baixa":["#EEF1F5","#5a6472"]}[p]||["#EEF1F5","#5a6472"]; return '<span class="pl-bdg" style="background:'+c[0]+';color:'+c[1]+'">'+p+'</span>'; }
function _statBdg(st){ st=_migStatus(st); var c={"Finalizado":["#EAF3DE","#27500A"],"Em andamento":["#E6F1FB","#0C447C"],"Aguardando recursos":["#FAEEDA","#633806"],"Não iniciado":["#F1EFE8","#444441"]}[st]||["#F1EFE8","#444441"]; return '<span class="pl-bdg" style="background:'+c[0]+';color:'+c[1]+'">'+st+'</span>'; }

/* Inicialização única (CSS extra + reativação do wake lock) */
(function _ataInit(){
  if(window.__ataInitDone) return; window.__ataInitDone = true;

  // reativa o wake lock quando a aba volta a ficar visível durante a gravação
  document.addEventListener("visibilitychange", function(){
    if(document.visibilityState === "visible" && typeof ataState !== "undefined" && ataState && ataState.recognizing){
      _ataWakeLock();
    }
  });

  // CSS dos elementos novos (banner de aviso, ações, corte)
  var css = `
  .ata-aviso-box{background:#FFF7E6;border:1px solid #F0D58A;border-radius:10px;padding:12px 14px;font-size:13px;color:#6b5510;line-height:1.5;margin:10px 0}
  .ata-aviso-box b{color:#16243D}
  .ata-aviso-rec{background:#FDECEC;border:1px solid #F3B5B5;color:#8a1f1f}
  .ata-aviso-rec b{color:#8a1f1f}
  .ata-rec-remaining{font-size:12px;color:#8a1f1f;margin-left:8px}
  .ata-recover{background:#EAF3FF;border:1px solid #AFCBF0;border-radius:10px;padding:12px 14px;margin:10px 0;font-size:13px;color:#14467e}
  .ata-recover .ata-rec-acts{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}
  .gv-acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
  .gv-acts .btn-ghost,.gv-acts .btn-gold,.gv-acts .btn-del{width:100%}
  .gv-badge-audio{font-size:11px;color:#1c7a3f;font-weight:600}
  .ata-corte-wrap{background:#F7F8FA;border:1px solid #E2E6EC;border-radius:10px;padding:12px;margin-top:10px}
  .ata-corte-row{display:flex;align-items:center;gap:8px;margin:8px 0;font-size:13px;color:#444}
  .ata-corte-row input[type=range]{flex:1}
  .ata-prog{font-size:12px;color:#666;margin-top:6px}
  .ata-nome-input{width:100%;padding:9px 11px;border:1px solid #d8dde4;border-radius:8px;font-size:14px}
  .part-card{border:1px solid #E2E6EC;border-radius:10px;padding:10px;margin-bottom:8px;background:#FAFBFC}
  .part-card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px;color:#5a6472}
  .part-x{border:none;background:#f3d6d6;color:#8a1f1f;border-radius:6px;width:24px;height:24px;cursor:pointer;font-size:15px;line-height:1}
  .part-in{width:100%;padding:7px 9px;border:1px solid #d8dde4;border-radius:7px;font-size:13px;margin-top:6px;box-sizing:border-box}
  .part-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
  .gv-chips{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
  .gv-chip{border:1px solid #d8dde4;background:#fff;color:#445;border-radius:16px;padding:5px 12px;font-size:12.5px;cursor:pointer}
  .gv-chip.on{background:#16243D;color:#fff;border-color:#16243D}
  .plano-wrap{border:1px solid #E7E2D6;border-radius:14px;overflow:auto;background:#fff;box-shadow:0 1px 2px rgba(22,36,61,.04);margin-top:8px}
  .plano-tbl{width:100%;border-collapse:collapse;font-size:13px;min-width:640px}
  .plano-tbl th{background:#F7F5EE;color:#8A93A3;padding:11px 12px;text-align:left;font-size:10.5px;text-transform:uppercase;letter-spacing:.4px;font-weight:800;white-space:nowrap}
  .plano-tbl td{border-top:1px solid #F0EDE4;padding:6px 8px;vertical-align:middle}
  .plano-tbl tr:hover td{background:#FBFAF6}
  .plano-tbl input,.plano-tbl select,.plano-tbl textarea{width:100%;border:1.5px solid transparent;border-radius:8px;padding:8px 9px;font-size:13px;background:transparent;font-family:inherit;color:#1B2433;transition:.12s}
  .plano-tbl textarea{resize:none;overflow:hidden;min-height:38px;line-height:1.45;display:block}
  .plano-tbl input:hover,.plano-tbl select:hover,.plano-tbl textarea:hover{border-color:#E7E2D6;background:#fff}
  .plano-tbl input:focus,.plano-tbl select:focus,.plano-tbl textarea:focus{border-color:#C9A24B;background:#fff;outline:none}
  .plano-tbl input::placeholder,.plano-tbl textarea::placeholder{color:#b9bfc9}
  .pl-x{width:26px;height:26px;border-radius:8px;border:1px solid transparent;background:none;color:#b9bfc9;font-size:15px;font-weight:700;cursor:pointer;transition:.12s}
  .pl-x:hover{color:#B3261E;border-color:#F3C9C9;background:#FDF2F2}
  .plano-acts{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center}
  .pl-rascunho{font-size:10.5px;font-weight:800;padding:3px 10px;border-radius:20px;background:#FFF3D6;color:#8a6d00;border:1px dashed #E3C77A}
  .anexo-row{display:flex;align-items:center;gap:8px;padding:7px 9px;border:1px solid #E2E6EC;border-radius:8px;margin-bottom:6px;font-size:13px}
  .anexo-row .anx-nome{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .gv-tabbar{display:flex;gap:7px;flex-wrap:wrap;margin:4px 0 16px}
  .gv-tabbtn{flex:0 0 auto;background:#fff;border:1.5px solid #E7E2D6;border-radius:999px;padding:8px 14px;font-size:12.5px;font-weight:700;color:#5a6472;cursor:pointer;white-space:nowrap;transition:.12s}
  .gv-tabbtn:hover{border-color:#C9A24B;color:#16243D}
  .gv-tabbtn.on{background:#16243D;color:#fff;border-color:#16243D}
  .gv-tabbtn .bolinha{display:inline-block;width:7px;height:7px;border-radius:50%;background:#2F8F5B;margin-left:5px;vertical-align:middle}
  .gv-dash{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:10px 0 20px}
  .gv-dashcard{background:#fff;border:1px solid #E7E2D6;border-radius:16px;padding:16px 18px;box-shadow:0 1px 2px rgba(22,36,61,.04);transition:.15s}
  .gv-dashcard:hover{box-shadow:0 6px 16px rgba(22,36,61,.08);transform:translateY(-1px)}
  .gv-dashcard .v{font-size:30px;font-weight:800;color:#16243D;line-height:1;letter-spacing:-.5px}
  .gv-dashcard .l{font-size:11px;color:#8A93A3;font-weight:700;margin-top:7px;display:flex;align-items:center;gap:5px;text-transform:uppercase;letter-spacing:.4px}
  .gv-actionbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;align-items:center}
  .gv-vistas{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:16px;border-bottom:2px solid #E7E2D6;overflow-x:auto}
  .gv-vista{flex:0 0 auto;background:none;border:none;padding:11px 16px;font-size:14px;font-weight:700;color:#8A93A3;border-bottom:3px solid transparent;margin-bottom:-2px;cursor:pointer;white-space:nowrap;transition:color .12s}
  .gv-vista:hover{color:#16243D}
  .gv-vista.on{color:#16243D;border-bottom-color:#C9A24B}
  .gv-search{display:flex;align-items:center;gap:9px;background:#fff;border:1.5px solid #E7E2D6;border-radius:14px;padding:12px 16px;margin-bottom:12px;box-shadow:0 1px 2px rgba(22,36,61,.04);transition:border-color .15s}
  .gv-search:focus-within{border-color:#C9A24B}
  .gv-search input{flex:1;border:none;outline:none;font-size:15px;font-family:inherit;background:transparent}
  .gv-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(262px,1fr));gap:14px}
  .gv-card{background:#fff;border:1px solid #E7E2D6;border-radius:16px;padding:16px;box-shadow:0 1px 2px rgba(22,36,61,.04);display:flex;flex-direction:column;gap:7px;transition:.15s}
  .gv-card:hover{box-shadow:0 6px 18px rgba(22,36,61,.10);transform:translateY(-1px)}
  .gv-card-top{display:flex;align-items:center;gap:9px}
  .gv-card-ic{width:34px;height:34px;border-radius:9px;background:#FBFAF6;border:1px solid #EFEADD;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
  .gv-card-tit{font-weight:800;font-size:14.5px;color:#1B2433;line-height:1.3}
  .gv-card-meta{font-size:12px;color:#6B7385;font-weight:600}
  .gv-card-badges{display:flex;gap:6px;flex-wrap:wrap;margin-top:2px}
  .gv-bdg{font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:20px;background:#EEF1F5;color:#5a6472}
  .gv-bdg.ok{background:#E7F6EC;color:#1c7a3f}
  .gv-card-acts{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
  .gv-card-acts button{flex:1;min-width:70px;font-size:12px;font-weight:700;padding:8px;border-radius:9px;border:1px solid #E7E2D6;background:#fff;cursor:pointer;color:#16243D}
  .gv-card-acts button.prim{background:#16243D;color:#fff;border-color:#16243D}
  .gv-card-acts button:hover{border-color:#C9A24B}
  .gv-painel-filtros{background:#F7F8FA;border:1px solid #E7E2D6;border-radius:12px;padding:12px 14px;margin-bottom:14px}
  .gv-dethead{background:#fff;border:1px solid #E7E2D6;border-radius:14px;padding:14px 16px;margin-bottom:14px}
  .gv-dethead .linhas{font-size:13.5px;color:#5a6472;font-weight:600;display:flex;flex-direction:column;gap:4px}
  .gv-dethead .linhas span{display:inline-flex;align-items:center;gap:6px}
  .gv-dethead .stats{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;padding-top:11px;border-top:1px solid #EFEADD}
  .gv-stat{font-size:12px;font-weight:700;padding:5px 11px;border-radius:20px;background:#F1F0EA;color:#8A8470;display:inline-flex;align-items:center;gap:6px}
  .gv-stat.ok{background:#E7F6EC;color:#1c7a3f}
  .gv-drawer-ov{position:fixed;inset:0;background:rgba(22,36,61,.35);z-index:998}
  .gv-drawer{position:fixed;top:0;right:0;bottom:0;width:min(340px,92vw);background:#fff;z-index:999;box-shadow:-8px 0 30px rgba(22,36,61,.18);padding:18px 20px;overflow:auto}
  .gv-drawer h3{margin:0 0 4px;font-size:16px;color:#16243D;display:flex;align-items:center;justify-content:space-between}
  .gv-drawer label{font-size:11px;font-weight:800;color:#6B7385;display:block;margin:14px 0 5px;text-transform:uppercase;letter-spacing:.5px}
  .gv-drawer select,.gv-drawer input{width:100%;padding:10px 12px;border:1.5px solid #E7E2D6;border-radius:10px;font-size:14px;font-family:inherit;background:#fff}
  .gv-doclist{background:#fff;border:1px solid #E7E2D6;border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(22,36,61,.04)}
  .gv-docrow{display:flex;align-items:center;gap:13px;padding:14px 18px;border-bottom:1px solid #F0EDE4;flex-wrap:wrap;transition:background .12s}
  .gv-docrow:last-child{border-bottom:none}
  .gv-docrow:hover{background:#FBFAF6}
  .gv-doc-ic{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;background:#F7F5EE;border:1px solid #EFEADD;flex-shrink:0}
  .gv-doc-info{flex:1;min-width:170px}
  .gv-doc-nome{font-weight:700;font-size:13.5px;color:#1B2433}
  .gv-doc-meta{font-size:11.5px;color:#6B7385;font-weight:600;margin-top:2px}
  .gv-doc-acts{display:flex;gap:6px;flex-wrap:wrap}
  .gv-doc-acts button{font-size:11.5px;font-weight:700;padding:7px 10px;border-radius:8px;border:1px solid #E7E2D6;background:#fff;cursor:pointer;color:#16243D}
  .gv-doc-acts button:hover{border-color:#C9A24B}
  .gv-doc-acts button.prim{background:#16243D;color:#fff;border-color:#16243D}
  .gv-empty{grid-column:1/-1;padding:56px 20px;text-align:center;color:#8a93a3;font-weight:600;background:#fff;border:1.5px dashed #E0DACB;border-radius:16px}
  .gv-empty .gi{font-size:36px;margin-bottom:10px}
  .gv-empty .gs{font-size:12px;color:#aab0bb;font-weight:600;margin-top:5px}
  .pl-bdg{font-size:10.5px;font-weight:800;padding:3px 10px;border-radius:20px;white-space:nowrap}
  .gv-acttbl-wrap{background:#fff;border:1px solid #E7E2D6;border-radius:16px;overflow:auto;box-shadow:0 1px 2px rgba(22,36,61,.04)}
  .gv-acttbl{width:100%;border-collapse:collapse;min-width:680px}
  .gv-acttbl th{background:#F7F5EE;font-size:10.5px;text-transform:uppercase;letter-spacing:.4px;color:#8A93A3;font-weight:800;padding:11px 13px;text-align:left;white-space:nowrap}
  .gv-acttbl td{padding:12px 13px;border-top:1px solid #F0EDE4;font-size:13px;color:#1B2433;vertical-align:middle}
  .gv-acttbl tbody tr{cursor:pointer;transition:background .1s}
  .gv-acttbl tbody tr:hover{background:#FBFAF6}
  .gv-acttbl .ac-tit{font-weight:700}
  .gv-acttbl .ac-orig{font-size:11px;color:#8A93A3;font-weight:600;margin-top:2px}
  .gv-planofiltros{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
  .gv-planofiltros select{padding:9px 11px;border:1.5px solid #E7E2D6;border-radius:10px;font-size:12.5px;font-family:inherit;background:#fff;font-weight:600;color:#16243D}
  .pl-page{max-width:860px;margin:0 auto}
  .pl-pagehead{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:6px}
  .pl-pagehead h2{margin:0}
  .pl-pagemeta{font-size:13px;color:#6B7385;font-weight:600;margin-bottom:16px}
  .pl-card{background:#fff;border:1px solid #E7E2D6;border-radius:16px;padding:16px 18px;margin-bottom:14px;box-shadow:0 1px 2px rgba(22,36,61,.04)}
  .pl-cardhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
  .pl-num{font-size:11px;font-weight:800;color:#C9A24B;text-transform:uppercase;letter-spacing:.6px}
  .pl-card label{display:block;font-size:11px;font-weight:800;color:#8A93A3;text-transform:uppercase;letter-spacing:.4px;margin:10px 0 5px}
  .pl-card textarea,.pl-card input,.pl-card select{width:100%;border:1.5px solid #E7E2D6;border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;color:#1B2433;background:#fff;resize:none;overflow:hidden;transition:border-color .12s}
  .pl-card textarea:focus,.pl-card input:focus,.pl-card select:focus{border-color:#C9A24B;outline:none}
  .pl-card textarea::placeholder,.pl-card input::placeholder{color:#b9bfc9}
  .pl-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  @media (max-width:560px){.pl-grid2{grid-template-columns:1fr}}
  @media(max-width:480px){ .gv-acts{grid-template-columns:1fr} .part-grid{grid-template-columns:1fr} }
  `;
  var st = document.createElement("style");
  st.id = "ataExtraCSS"; st.textContent = css;
  document.head.appendChild(st);
})();

/* ============================================================
   IndexedDB — pedaços do áudio enquanto grava (recuperação) +
   guarda local do áudio quando o Storage não está disponível
   ============================================================ */
function _idbOpen(){
  return new Promise(function(res,rej){
    try{
      var r = indexedDB.open("mafra-audio", 1);
      r.onupgradeneeded = function(){
        var db = r.result;
        if(!db.objectStoreNames.contains("chunks")) db.createObjectStore("chunks",{autoIncrement:true});
        if(!db.objectStoreNames.contains("meta"))   db.createObjectStore("meta");
        if(!db.objectStoreNames.contains("audios")) db.createObjectStore("audios");
      };
      r.onsuccess = function(){ res(r.result); };
      r.onerror   = function(){ rej(r.error); };
    }catch(e){ rej(e); }
  });
}
function _idbReq(req){ return new Promise(function(res,rej){ req.onsuccess=function(){res(req.result);}; req.onerror=function(){rej(req.error);}; }); }
function _idbDone(tx){ return new Promise(function(res,rej){ tx.oncomplete=function(){res();}; tx.onerror=function(){rej(tx.error);}; tx.onabort=function(){rej(tx.error);}; }); }

async function _idbChunkAdd(blob){ try{ var db=await _idbOpen(); var tx=db.transaction("chunks","readwrite"); tx.objectStore("chunks").add(blob); await _idbDone(tx); db.close(); }catch(e){} }
async function _idbChunksGetAll(){ try{ var db=await _idbOpen(); var tx=db.transaction("chunks","readonly"); var all=await _idbReq(tx.objectStore("chunks").getAll()); db.close(); return all||[]; }catch(e){ return []; } }
async function _idbChunksClear(){ try{ var db=await _idbOpen(); var tx=db.transaction("chunks","readwrite"); tx.objectStore("chunks").clear(); await _idbDone(tx); db.close(); }catch(e){} }
async function _idbMetaSet(v){ try{ var db=await _idbOpen(); var tx=db.transaction("meta","readwrite"); tx.objectStore("meta").put(v,"current"); await _idbDone(tx); db.close(); }catch(e){} }
async function _idbMetaGet(){ try{ var db=await _idbOpen(); var tx=db.transaction("meta","readonly"); var v=await _idbReq(tx.objectStore("meta").get("current")); db.close(); return v||null; }catch(e){ return null; } }
async function _idbMetaClear(){ try{ var db=await _idbOpen(); var tx=db.transaction("meta","readwrite"); tx.objectStore("meta").delete("current"); await _idbDone(tx); db.close(); }catch(e){} }
async function _idbAudioSet(id,blob){ try{ var db=await _idbOpen(); var tx=db.transaction("audios","readwrite"); tx.objectStore("audios").put(blob,id); await _idbDone(tx); db.close(); return true; }catch(e){ return false; } }
async function _idbAudioGet(id){ try{ var db=await _idbOpen(); var tx=db.transaction("audios","readonly"); var v=await _idbReq(tx.objectStore("audios").get(id)); db.close(); return v||null; }catch(e){ return null; } }
async function _idbAudioDel(id){ try{ var db=await _idbOpen(); var tx=db.transaction("audios","readwrite"); tx.objectStore("audios").delete(id); await _idbDone(tx); db.close(); }catch(e){} }

/* ============================================================
   Supabase Storage — sobe o áudio e devolve a URL
   ============================================================ */
function _sbStorageDisponivel(){ try{ return !!(typeof SB!=="undefined" && SB && SB.storage); }catch(e){ return false; } }
var _ultimoErroStorage = "";   // motivo da última falha de upload (para mostrar ao usuário)

async function _subirAudioStorage(blob, recId, ext){
  _ultimoErroStorage="";
  if(!_sbStorageDisponivel()){ _ultimoErroStorage="Cliente Supabase (SB) indisponível nesta página."; return null; }
  try{
    var path = (typeof state!=="undefined" && state.userId ? state.userId : "anon") + "/" + recId + "." + (ext||"webm");
    var up = await SB.storage.from(ATA_BUCKET).upload(path, blob, { contentType: blob.type || "audio/webm", upsert:true });
    if(up && up.error){
      _ultimoErroStorage = _traduzErroStorage(up.error.message||String(up.error));
      console.warn("Storage upload falhou:", up.error);
      return null;
    }
    var pub = SB.storage.from(ATA_BUCKET).getPublicUrl(path);
    var url = pub && pub.data ? pub.data.publicUrl : null;
    if(!url){ _ultimoErroStorage="O arquivo subiu, mas não consegui gerar a URL pública (bucket pode estar privado)."; }
    return { path:path, url:url, mime:blob.type||"audio/webm", bytes:blob.size };
  }catch(e){
    _ultimoErroStorage = _traduzErroStorage((e&&e.message)||String(e));
    console.warn("Storage erro:", e);
    return null;
  }
}
function _traduzErroStorage(msg){
  msg=(msg||"").toString();
  var l=msg.toLowerCase();
  if(l.includes("not found")||l.includes("bucket")&&l.includes("exist")||l.includes("does not exist")) return "O bucket \""+ATA_BUCKET+"\" não foi encontrado. Crie-o no Supabase (Storage → New bucket).";
  if(l.includes("row-level security")||l.includes("rls")||l.includes("policy")||l.includes("violates")) return "O bucket existe, mas as POLÍTICAS (permissões) não deixam enviar. Falta a política de INSERT para o bucket \""+ATA_BUCKET+"\".";
  if(l.includes("401")||l.includes("unauthorized")||l.includes("jwt")||l.includes("auth")) return "Erro de autenticação com o Supabase (chave/JWT). Verifique a chave anônima do projeto.";
  if(l.includes("403")||l.includes("forbidden")) return "Acesso negado (403). Revise as políticas do bucket \""+ATA_BUCKET+"\".";
  if(l.includes("413")||l.includes("too large")||l.includes("exceeded")) return "Arquivo grande demais para o limite do bucket. Aumente o limite do bucket no Supabase.";
  if(l.includes("network")||l.includes("failed to fetch")) return "Falha de rede ao falar com o Supabase. Verifique a conexão.";
  return "Erro do Storage: "+msg;
}
async function _apagarAudioStorage(path){
  if(!path || !_sbStorageDisponivel()) return;
  try{ await SB.storage.from(ATA_BUCKET).remove([path]); }catch(e){}
}

/* Diagnóstico do Storage: testa envio + URL pública e diz exatamente o que está errado */
async function diagnosticarStorage(){
  if(!_sbStorageDisponivel()){ alert("❌ O cliente do Supabase (SB) não está disponível nesta página."); return; }
  var linhas=["🔧 Diagnóstico do Storage (bucket \""+ATA_BUCKET+"\")",""];
  try{
    var teste=new Blob(["ok"],{type:"text/plain"});
    var path="__diag/"+Date.now()+".txt";
    var up=await SB.storage.from(ATA_BUCKET).upload(path, teste, {upsert:true, contentType:"text/plain"});
    if(up && up.error){
      linhas.push("❌ Envio: FALHOU");
      linhas.push("   Motivo: "+_traduzErroStorage(up.error.message||String(up.error)));
      alert(linhas.join("\n"));
      return;
    }
    linhas.push("✅ Envio: OK (o bucket existe e aceita upload)");
    var pub=SB.storage.from(ATA_BUCKET).getPublicUrl(path);
    var url=pub&&pub.data?pub.data.publicUrl:null;
    if(url){
      linhas.push("✅ URL pública: gerada");
      try{ var r=await fetch(url,{cache:"no-store"}); linhas.push(r.ok?"✅ Leitura pública: OK (qualquer dispositivo consegue ouvir)":"⚠️ Leitura pública: bloqueada ("+r.status+"). O bucket pode estar privado — marque como público ou crie política de SELECT."); }
      catch(e){ linhas.push("⚠️ Não consegui ler a URL pública (bucket pode estar privado)."); }
    } else {
      linhas.push("⚠️ URL pública não gerada — o bucket pode estar privado.");
    }
    try{ await SB.storage.from(ATA_BUCKET).remove([path]); }catch(e){}
    linhas.push("","Conclusão: Storage funcionando. Áudios novos serão salvos permanentemente.");
    alert(linhas.join("\n"));
  }catch(e){
    linhas.push("❌ Erro inesperado: "+((e&&e.message)||e));
    alert(linhas.join("\n"));
  }
}

/* Reenvia para o Storage os áudios que ficaram salvos só neste aparelho */
async function reenviarAudiosLocais(){
  if(!_sbStorageDisponivel()){ alert("Cliente Supabase indisponível."); return; }
  var d=await loadGravacoes(); var lista=(d.list||[]).filter(function(g){ return g.audioLocal && !(g.audio && g.audio.url); });
  if(!lista.length){ alert("Não há áudios presos neste aparelho para reenviar."); return; }
  if(!confirm("Reenviar "+lista.length+" áudio(s) deste aparelho para o Storage?")) return;
  var ok=0, falhou=0, motivo="";
  for(var i=0;i<lista.length;i++){
    var g=lista[i];
    var blob=await _idbAudioGet(g.id);
    if(!blob){ falhou++; continue; }
    var ext=g.audioExt||"webm";
    var ref=await _subirAudioStorage(blob, g.id, ext);
    if(ref && ref.url){ g.audio=ref; g.audioLocal=false; g.atualizadoEm=Date.now(); await _idbAudioDel(g.id); ok++; }
    else { falhou++; motivo=_ultimoErroStorage||motivo; }
  }
  await saveGravacoes(d);
  var msg="Reenvio concluído.\n✅ Enviados: "+ok+(falhou?("\n❌ Falharam: "+falhou):"" );
  if(falhou && motivo) msg+="\n\nMotivo das falhas: "+motivo;
  alert(msg);
  if(state.tab==="gravacoes") renderGravacoes();
}

/* Resolve a fonte tocável do áudio de uma gravação (URL do Storage ou blob local) */
async function _resolverAudioSrc(g){
  if(g && g.audio && g.audio.url) return { src:g.audio.url, revoke:false };
  if(g && g.audioLocal){
    var b = await _idbAudioGet(g.id);
    if(b){ return { src:URL.createObjectURL(b), revoke:true, blob:b }; }
  }
  return null;
}
async function _obterAudioBlob(g){
  if(g && g.audioLocal){ var b=await _idbAudioGet(g.id); if(b) return b; }
  if(g && g.audio && g.audio.url){
    try{ var r=await fetch(g.audio.url); if(r.ok) return await r.blob(); }catch(e){}
  }
  return null;
}

/* ============================================================
   ABERTURA / FECHAMENTO DO MODAL DE GRAVAÇÃO
   ============================================================ */
function openAta(targetId){
  ataState={targetId:targetId||null, recognizing:false, rec:null, base:"", result:null, sel:[], created:false, gravada:false, participantes:"", participantesList:[], nome:"", categoria:"condominio", tipo:"", condominio:"", area:"", assunto:"", finalTxt:"", interim:"", fixo:"", chunks:[], useIdb:false, chunkCount:0, audioBlob:null, audioDurMs:0, _fechando:false, recAoVivoBloqueado:false, _urls:[]};
  renderAtaModal();
  _ataChecarRecuperacao();
}

function closeAta(){
  ataState._fechando=true;
  ataState.recognizing=false;
  if(ataState._timer){ clearInterval(ataState._timer); ataState._timer=null; }
  if(ataState.rec){ try{ataState.rec.stop();}catch(_){} ataState.rec=null; }
  if(ataState.mr && ataState.mr.state!=="inactive"){ try{ataState.mr.stop();}catch(_){} }
  if(ataState.stream){ try{ ataState.stream.getTracks().forEach(function(t){t.stop();}); }catch(e){} ataState.stream=null; }
  _ataLiberarWake();
  _ataRevogarURLs();
  document.getElementById("ataMount").innerHTML="";
}

function _ataRevogarURLs(){ try{ (ataState._urls||[]).forEach(function(u){ URL.revokeObjectURL(u); }); }catch(e){} ataState._urls=[]; }

function setRecUI(on){
  const b=document.getElementById("ataRecBtn");
  if(b){ b.classList.toggle("rec",on); b.innerHTML = on ? "⏹ Parar gravação" : "🎙️ Gravar áudio"; }
  const dot=document.getElementById("ataRecDot"); if(dot) dot.style.display = on?"inline-flex":"none";
  const tm=document.getElementById("ataRecTimer"); if(tm) tm.style.display = on?"inline-block":"none";
  const banner=document.getElementById("ataAvisoRec"); if(banner) banner.style.display = on?"block":"none";
}

function _ataAtualizarCampo(){
  const el=document.getElementById("ataTranscript"); if(!el) return;
  const partes=[(ataState.fixo||"").trim(), (ataState.finalTxt||"").trim(), (ataState.interim||"").trim()].filter(Boolean);
  el.value=partes.join(" ").replace(/\s{2,}/g," ");
  el.scrollTop=el.scrollHeight;
}

function _ataTickTimer(){
  const tm=document.getElementById("ataRecTimer"); if(!tm) return;
  const ms=Date.now()-(ataState.t0||Date.now());
  const s=Math.floor(ms/1000);
  const hh=Math.floor(s/3600), mm=Math.floor((s%3600)/60), ss=s%60;
  tm.textContent=(hh>0?(hh+":"):"")+String(mm).padStart(2,"0")+":"+String(ss).padStart(2,"0");
  // tempo restante até o limite de 2h
  const rem=document.getElementById("ataRecRemaining");
  if(rem){
    const left=Math.max(0, ATA_MAX_MS-ms);
    const ls=Math.floor(left/1000), lh=Math.floor(ls/3600), lm=Math.floor((ls%3600)/60), lss=ls%60;
    const txt=(lh>0?(lh+"h"):"")+String(lm).padStart(2,"0")+"m"+String(lss).padStart(2,"0")+"s";
    rem.textContent="• limite 2h — faltam "+txt;
  }
  // parada automática ao atingir 2h
  if(ms>=ATA_MAX_MS && ataState.recognizing){
    stopRec().then(function(){ alert("⏱️ Limite de 2 horas atingido — a gravação foi encerrada e salva automaticamente. Você já pode transcrever e salvar."); });
  }
}

async function _ataWakeLock(){
  try{ if("wakeLock" in navigator){ ataState.wake=await navigator.wakeLock.request("screen"); } }catch(e){}
}
function _ataLiberarWake(){ try{ if(ataState.wake){ ataState.wake.release(); ataState.wake=null; } }catch(e){} }

/* ============================================================
   RECUPERAÇÃO de gravação interrompida (app fechou/travou)
   ============================================================ */
async function _ataChecarRecuperacao(){
  try{
    const meta=await _idbMetaGet();
    if(!meta || !meta.active) return;
    const chunks=await _idbChunksGetAll();
    if(!chunks.length){ await _idbMetaClear(); return; }
    const mount=document.getElementById("ataMount");
    const body=mount && mount.querySelector(".modal-body");
    if(!body) return;
    const tam=(chunks.reduce(function(a,c){return a+(c.size||0);},0)/1024/1024).toFixed(1);
    const div=document.createElement("div");
    div.className="ata-recover";
    div.id="ataRecover";
    div.innerHTML='🔁 <b>Encontrei uma gravação que não foi finalizada</b> ('+tam+' MB). Quer recuperar?'
      +'<div class="ata-rec-acts">'
      +'<button class="btn-gold" onclick="_ataRecuperar()">Recuperar áudio</button>'
      +'<button class="btn-ghost" onclick="_ataDescartarRecuperacao()">Descartar</button></div>';
    body.insertBefore(div, body.firstChild);
  }catch(e){}
}
async function _ataRecuperar(){
  try{
    const meta=await _idbMetaGet();
    const chunks=await _idbChunksGetAll();
    if(!chunks.length){ alert("Não há áudio para recuperar."); return; }
    const mime=(meta&&meta.mime)||"audio/webm";
    const blob=new Blob(chunks,{type:mime});
    ataState.audioBlob = blob.size>0 ? blob : null;
    ataState.mrMime = mime;
    ataState.audioDurMs = (meta&&meta.durMs)||0;
    await _idbMetaClear(); await _idbChunksClear();
    const r=document.getElementById("ataRecover"); if(r) r.remove();
    renderAtaModal();
  }catch(e){ alert("Não consegui recuperar agora."); }
}
async function _ataDescartarRecuperacao(){
  await _idbMetaClear(); await _idbChunksClear();
  const r=document.getElementById("ataRecover"); if(r) r.remove();
}

/* ============================================================
   ENVIO DE ARQUIVO DE ÁUDIO (gravado fora do app)
   ============================================================ */
async function enviarAudioArquivo(ev){
  const f = ev.target.files && ev.target.files[0];
  if(!f) return;
  ev.target.value="";
  // guarda como áudio da gravação para poder salvar/ouvir depois
  ataState.audioBlob=f;
  ataState.mrMime=f.type||"audio/webm";
  renderAtaModal();
  await _ataTranscreverArquivo(f);
}

async function _ataTranscreverArquivo(blob){
  const ta=document.getElementById("ataTranscript");
  const tamMB=(blob.size/1024/1024);
  if(ta){ ataState.fixo=ta.value.trim(); }
  const aviso=document.getElementById("ataAvisoTransc");
  if(aviso){ aviso.style.display="block"; aviso.textContent="⏳ Transcrevendo o áudio… isso pode levar alguns segundos (áudios longos demoram mais)."; }
  try{
    const texto = await transcreverAudioServidor(blob);
    if(texto){
      ataState.finalTxt=((ataState.finalTxt||"").trim()+" "+texto).trim();
      _ataAtualizarCampo();
      if(aviso){ aviso.style.display="none"; }
      return;
    }
    throw new Error("sem-transcricao");
  }catch(err){
    if(aviso){
      aviso.style.display="block";
      aviso.innerHTML='🎧 Áudio de '+tamMB.toFixed(1)+' MB. A transcrição automática não respondeu agora.<br>O áudio está guardado — você pode tentar transcrever de novo, ou enviar o áudio pra você no WhatsApp (ele transcreve) e colar o texto aqui. Depois toque em “✨ Gerar ata”.';
    }
  }
}

async function transcreverAudioServidor(blob){
  if(!SUPABASE_URL) return null;
  const url=SUPABASE_URL.replace(/\/$/,"")+"/functions/v1/transcrever-audio";
  const fd=new FormData();
  const ext=(blob.type||"").includes("mp4")?"m4a":(blob.type||"").includes("ogg")?"ogg":(blob.type||"").includes("wav")?"wav":"webm";
  fd.append("file", blob, "audio."+ext);
  let r;
  try{
    r=await fetch(url,{ method:"POST", headers:{ "Authorization":"Bearer "+SUPABASE_KEY }, body:fd });
  }catch(netErr){ return null; }
  if(r.status===404) return null;
  let data; try{ data=await r.json(); }catch(_){ return null; }
  if(!r.ok || data.error) return null;
  return (data.text||data.transcript||"").trim() || null;
}

/* ============================================================
   GRAVAÇÃO (segura, até 2h, salvando pedaços no IndexedDB)
   ============================================================ */
async function startRec(){
  const ta=document.getElementById("ataTranscript");
  ataState.fixo = ta && ta.value ? ta.value.trim() : "";
  ataState.finalTxt = "";
  ataState.interim = "";
  ataState.chunks = [];
  ataState.chunkCount = 0;
  ataState.audioBlob = null;
  ataState.audioDurMs = 0;
  ataState.recAoVivoBloqueado = false;
  ataState.t0 = Date.now();
  ataState.recognizing = true;
  // prepara IndexedDB para guardar os pedaços (recuperação + baixa memória)
  ataState.useIdb = (typeof indexedDB!=="undefined");
  if(ataState.useIdb){
    try{ await _idbChunksClear(); await _idbMetaSet({active:true, t0:ataState.t0, mime:"audio/webm", durMs:0}); }
    catch(e){ ataState.useIdb=false; }
  }

  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
    navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}})
      .then(function(stream){ _iniciarGravacaoComStream(stream); })
      .catch(function(err){
        ataState.recognizing=false;
        alert('Não consegui acessar o microfone.\n\nO que fazer:\n1) Toque no cadeado/escudo ao lado do endereço do site e libere o Microfone, depois tente de novo.\n2) Ou use “📁 Enviar áudio” e envie uma gravação feita no app gravador do celular.\n3) Ou digite/cole o conteúdo no campo abaixo.');
      });
  } else {
    _iniciarReconhecimentoVoz();
    ataState._timer=setInterval(_ataTickTimer,1000); _ataTickTimer(); setRecUI(true);
  }
}

function _iniciarGravacaoComStream(stream){
  ataState.stream=stream;
  _ataWakeLock();
  try{
    if(window.MediaRecorder){
      const cands=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg;codecs=opus"];
      const mime=cands.find(function(m){ return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m); })||"";
      let opt={};
      if(mime) opt.mimeType=mime;
      try{ opt.audioBitsPerSecond=ATA_BITRATE; }catch(_){}
      try{ ataState.mr = new MediaRecorder(stream,opt); }
      catch(_){ ataState.mr = mime ? new MediaRecorder(stream,{mimeType:mime}) : new MediaRecorder(stream); }
      ataState.mrMime = ataState.mr.mimeType || mime || "audio/webm";
      if(ataState.useIdb){ _idbMetaSet({active:true, t0:ataState.t0, mime:ataState.mrMime, durMs:0}); }
      ataState.mr.ondataavailable=function(ev){
        if(ev.data && ev.data.size>0){
          ataState.chunkCount++;
          if(ataState.useIdb){ _idbChunkAdd(ev.data); }   // guarda em disco (recuperável, pouca RAM)
          else { ataState.chunks.push(ev.data); }          // sem IndexedDB: mantém na memória
        }
      };
      ataState.mr.start(5000); // pedaço a cada 5s -> nada se perde e gera menos pedaços
    }
  }catch(e){ /* segue só com reconhecimento de voz */ }
  _iniciarReconhecimentoVoz();
  ataState._timer=setInterval(_ataTickTimer,1000); _ataTickTimer();
  setRecUI(true);
}

function _iniciarReconhecimentoVoz(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ ataState.rec=null; return; }
  try{
    const rec=new SR();
    rec.lang="pt-BR"; rec.continuous=true; rec.interimResults=true; rec.maxAlternatives=1;
    rec.onresult=function(e){
      let interim="";
      for(let i=e.resultIndex;i<e.results.length;i++){
        const r=e.results[i];
        const txt=(r[0]&&r[0].transcript||"").trim();
        if(!txt) continue;
        if(r.isFinal){
          const sep=(ataState.finalTxt && !/[\s.,;:!?]$/.test(ataState.finalTxt))?" ":"";
          ataState.finalTxt=(ataState.finalTxt||"")+sep+txt;
        }else{
          interim+=(interim?" ":"")+txt;
        }
      }
      ataState.interim=interim;
      _ataAtualizarCampo();
    };
    rec.onerror=function(e){
      if(e.error==="no-speech"||e.error==="aborted") return;
      if(e.error==="not-allowed"||e.error==="service-not-allowed"){
        ataState.recAoVivoBloqueado=true;
        const aviso=document.getElementById("ataAvisoTransc");
        if(aviso){ aviso.style.display="block"; aviso.textContent="🎙️ Gravando o áudio. A transcrição ao vivo não está disponível aqui — ao parar, transcrevo o áudio gravado."; }
      }
    };
    rec.onend=function(){
      if(ataState.recognizing && !ataState.recAoVivoBloqueado){
        try{ rec.start(); }
        catch(_){ setTimeout(function(){ try{ ataState.recognizing&&rec.start(); }catch(__){} },250); }
      }
    };
    ataState.rec=rec; rec.start();
  }catch(err){ ataState.rec=null; }
}

async function stopRec(){
  const estava=ataState.recognizing;
  ataState.recognizing=false;
  ataState.audioDurMs = Date.now()-(ataState.t0||Date.now());
  if(ataState._timer){ clearInterval(ataState._timer); ataState._timer=null; }
  if(ataState.rec){ try{ataState.rec.stop();}catch(_){} ataState.rec=null; }
  ataState.interim="";
  _ataAtualizarCampo();

  // encerra a gravação de áudio e monta o blob (lendo do IndexedDB se for o caso)
  await new Promise(function(resolve){
    if(ataState.mr && ataState.mr.state!=="inactive"){
      ataState.mr.onstop=async function(){
        try{
          let parts;
          if(ataState.useIdb){ parts = await _idbChunksGetAll(); }
          else { parts = ataState.chunks||[]; }
          const blob=new Blob(parts||[], {type:ataState.mrMime||"audio/webm"});
          ataState.audioBlob = blob.size>0 ? blob : null;
        }catch(e){ ataState.audioBlob=null; }
        resolve();
      };
      try{ ataState.mr.stop(); }catch(e){ resolve(); }
    } else resolve();
  });

  if(ataState.stream){ try{ ataState.stream.getTracks().forEach(function(t){t.stop();}); }catch(e){} ataState.stream=null; }
  _ataLiberarWake();
  // gravação finalizada com sucesso: limpa o estado de recuperação
  if(ataState.useIdb){ await _idbMetaClear(); await _idbChunksClear(); }

  const el=document.getElementById("ataTranscript");
  if(el) ataState.base=el.value;
  setRecUI(false);
  if(estava && !ataState._fechando) renderAtaModal();

  const semTexto = !((ataState.finalTxt||"").trim()) && !((ataState.fixo||"").trim());
  if(!ataState._fechando && ataState.audioBlob && (semTexto || ataState.recAoVivoBloqueado || !(window.SpeechRecognition||window.webkitSpeechRecognition))){
    try{ await _ataTranscreverArquivo(ataState.audioBlob); }catch(e){}
  }
}

/* ============================================================
   GERAÇÃO DA ATA COM IA
   ============================================================ */
async function gerarAta(){
  const ta=document.getElementById("ataTranscript"); const transcript=(ta?ta.value:"").trim();
  if(!transcript){ alert("Grave ou digite/cole o conteúdo da reunião primeiro."); return; }
  ataState.base=transcript;
  const tpEl=document.getElementById("ataTipo"); if(tpEl) ataState.tipo=tpEl.value;
  const tipoCtx=ataState.tipo?(" O tipo de reunião é: "+ataState.tipo+". Gere a ata no formato adequado a esse tipo."):"";
  const btn=document.getElementById("ataGerarBtn"); if(btn){ btn.disabled=true; btn.textContent="Gerando ata…"; }
  const prompt=`Você é um assistente que transforma a transcrição de uma reunião/áudio em uma ata profissional em português do Brasil.${tipoCtx}
Responda APENAS com um objeto JSON válido (sem markdown, sem texto fora do JSON), exatamente neste formato:
{"ata":"texto corrido e objetivo da ata","resolvidos":["decisão/ponto resolvido"],"tarefas":[{"titulo":"ação a executar","responsavel":"nome citado ou string vazia","prazo":"prazo citado ou string vazia"}]}
Use listas vazias quando não houver itens. Seja fiel ao conteúdo, sem inventar. Dentro das strings do JSON, escape aspas internas com \\" e use \\n para quebras de linha (nunca quebras reais).
Transcrição:
"""${transcript}"""`;
  try{
    const obj=await _iaGerarJSON(prompt, 6000, "{");
    ataState.result={ata:obj.ata||"",resolvidos:Array.isArray(obj.resolvidos)?obj.resolvidos:[],tarefas:Array.isArray(obj.tarefas)?obj.tarefas:[]};
    ataState.sel=ataState.result.tarefas.map(function(){return true;}); ataState.created=false;
    renderAtaModal();
  }catch(err){
    if(btn){ btn.disabled=false; btn.textContent="✨ Gerar ata com IA"; }
    alert("Não consegui gerar a ata agora. ("+err.message+")");
  }
}

function inserirNoCampo(){
  const el=document.getElementById(ataState.targetId);
  if(!el){ alert("Reabra o evento/tarefa para inserir a ata."); return; }
  const at=document.getElementById("ataAtaTxt"); const ataTxt=at?at.value:(ataState.result?ataState.result.ata:"");
  const res=ataState.result&&ataState.result.resolvidos||[];
  let txt="ATA — "+new Date().toLocaleDateString("pt-BR")+"\n"+ataTxt;
  if(res.length) txt+="\n\nResolvido:\n- "+res.join("\n- ");
  el.value=(el.value?el.value.trim()+"\n\n":"")+txt;
  alert("Ata inserida no campo de detalhes. Lembre de salvar o evento/tarefa.");
}

function diaKeyOfDate(ds){ const map={1:"seg",2:"ter",3:"qua",4:"qui",5:"sex"}; return map[new Date(ds+"T00:00:00").getDay()]||"seg"; }

function novaTarefaDoUsuario(titulo, detalhe, dia){
  if(state.user.tipo==="sindico")
    return {id:"t"+Date.now()+Math.random().toString(36).slice(2,6),dia,condominio:"",tarefa:titulo,acoes:detalhe||"",horas:"",status:"planejado",evidencia:""};
  return {id:"l"+Date.now()+Math.random().toString(36).slice(2,6),dia,titulo,detalhes:detalhe||"",prioridade:"media",status:"planejado"};
}

async function criarTarefasAta(){
  if(!ataState.result) return;
  const at=document.getElementById("ataAtaTxt"); if(at) ataState.result.ata=at.value;
  const sel=ataState.result.tarefas.filter(function(t,i){ return ataState.sel[i]; });
  if(!sel.length){ alert("Selecione ao menos uma tarefa do checklist."); return; }
  const eDate=document.getElementById("eDate");
  const ds=(eDate&&eDate.value)?eDate.value:null;
  const wk=ds?weekKeyOfDate(ds):weekKey(state.semana);
  let dia="seg";
  if(ds) dia=diaKeyOfDate(ds);
  else { const r=document.querySelector('input[name="mDia"]:checked, input[name="lDia"]:checked'); if(r) dia=r.value; }
  const data=await loadAgenda(state.userId); if(!data.weeks[wk]) data.weeks[wk]=[];
  sel.forEach(function(t){
    const det=[t.responsavel?("Resp.: "+t.responsavel):"", t.prazo?("Prazo: "+t.prazo):""].filter(Boolean).join(" · ");
    data.weeks[wk].push(novaTarefaDoUsuario(t.titulo, det, dia));
  });
  await saveAgenda(state.userId,data);
  ataState.created=true; renderAtaModal();
}

/* ============================================================
   RENDER do modal de gravação
   ============================================================ */
/* Rótulos, listas e status (usados na lista, no detalhe e na exportação) */
var ATA_CATEGORIAS = { condominio:"Condomínio", mafra:"Mafra Gestão Integrada", externa:"Externa / Outros Assuntos" };
var ATA_TIPOS_REUNIAO = ["Assembleia","Reunião de Conselho","Reunião Operacional","Reunião com Fornecedor","Reunião Interna Mafra","Reunião Comercial","Vistoria Técnica","Auditoria","Outros"];
var ATA_AREAS_MAFRA = ["Administrativo","Financeiro","Operacional","Comercial","Jurídico","RH / Pessoas","Diretoria","TI","Outros"];

function _catLabel(c){ return ATA_CATEGORIAS[c] || ""; }
function _tipoLabel(t){ return t || ""; } // o tipo de reunião é guardado já como rótulo

/* Migração: registros antigos guardavam a origem em "tipo" (condominio/interna/externa) */
function _migraGrav(g){
  if(!g) return g;
  if(!g.categoria){
    if(g.tipo==="condominio"||g.tipo==="interna"||g.tipo==="externa"){
      g.categoria = (g.tipo==="interna") ? "mafra" : g.tipo;
      g.tipo = ""; // tipo de reunião (novo) ainda não definido
    } else {
      g.categoria = g.condominio ? "condominio" : "externa";
    }
  }
  if(!Array.isArray(g.participantesList)){
    g.participantesList = (g.participantes||g.integrantes||"").trim()
      ? (g.participantes||g.integrantes).split(/[;,]/).map(function(n){return {nome:n.trim(),cargo:"",empresa:"",email:"",telefone:""};}).filter(function(p){return p.nome;})
      : [];
  }
  if(!Array.isArray(g.anexos)) g.anexos=[];
  if(!Array.isArray(g.plano)) g.plano=[]; g.plano.forEach(function(a){ if(a) a.status=_migStatus(a.status); });
  if(typeof g.resumo!=="string") g.resumo="";
  return g;
}

function _statusGrav(g){
  if(g && g.ata && g.ata.trim())          return { k:"ata",        label:"Ata gerada", cor:"#1c7a3f", bg:"#E7F6EC" };
  if(g && g.transcricao && g.transcricao.trim()) return { k:"transcrito", label:"Transcrito",  cor:"#9a6b00", bg:"#FFF3D6" };
  return { k:"gravado", label:"Gravado", cor:"#5a6472", bg:"#EEF1F5" };
}

/* Participantes estruturados → texto curto (para lista/exportação/busca) */
function _partsToStr(list){
  return (list||[]).map(function(p){
    const extra=[p.cargo,p.empresa].filter(Boolean).join(", ");
    return p.nome ? (p.nome+(extra?(" ("+extra+")"):"")) : "";
  }).filter(Boolean).join("; ");
}

/* Mostra/oculta os campos conforme a categoria escolhida (no modal de gravação) */
function _ataToggleCat(){
  const sel=document.getElementById("ataCategoria"); if(!sel) return;
  ataState.categoria=sel.value;
  const cond=document.getElementById("ataCondRow"); if(cond) cond.style.display=(sel.value==="condominio")?"":"none";
  const maf=document.getElementById("ataMafraRow"); if(maf) maf.style.display=(sel.value==="mafra")?"":"none";
  const ext=document.getElementById("ataExtRow"); if(ext) ext.style.display=(sel.value==="externa")?"":"none";
}

/* Lista de participantes editável (cartões com nome, cargo, empresa, e-mail, telefone) */
function _ataAddPart(){ ataState.participantesList=ataState.participantesList||[]; ataState.participantesList.push({nome:"",cargo:"",empresa:"",email:"",telefone:""}); renderAtaModal(); }
function _ataDelPart(i){ (ataState.participantesList||[]).splice(i,1); renderAtaModal(); }
function _partRowsHTML(list, ctx){
  list=list||[]; ctx=ctx||"ata";
  const bind = (ctx==="ata") ? "ataState.participantesList" : "gvParts";
  const del  = (ctx==="ata") ? function(i){return "_ataDelPart("+i+")";} : function(i){return "_gvDelPart('"+ctx+"',"+i+")";};
  if(!list.length) return `<div class="ata-empty" style="margin-bottom:6px">Nenhum participante adicionado.</div>`;
  return list.map(function(p,i){
    return `<div class="part-card">
      <div class="part-card-top"><b>Participante ${i+1}</b><button class="part-x" onclick="${del(i)}" title="Remover">×</button></div>
      <input class="part-in" placeholder="Nome" value="${esc(p.nome||"")}" oninput="${bind}[${i}].nome=this.value">
      <div class="part-grid">
        <input class="part-in" placeholder="Cargo" value="${esc(p.cargo||"")}" oninput="${bind}[${i}].cargo=this.value">
        <input class="part-in" placeholder="Empresa" value="${esc(p.empresa||"")}" oninput="${bind}[${i}].empresa=this.value">
        <input class="part-in" placeholder="E-mail" value="${esc(p.email||"")}" oninput="${bind}[${i}].email=this.value">
        <input class="part-in" placeholder="Telefone" value="${esc(p.telefone||"")}" oninput="${bind}[${i}].telefone=this.value">
      </div>
    </div>`;
  }).join("");
}

/* Bloco "Dados da reunião": nome, categoria, condomínio/área/assunto, tipo, participantes */
function _ataMetaHTML(){
  if(!ataState.audioBlob && !ataState.result) return "";
  const conds=(typeof CONDOMINIOS!=="undefined"?CONDOMINIOS:[]);
  const condOpts=`<option value="">Selecione o condomínio…</option>`+condOptionsAgrupadas(ataState.condominio,conds);
  const areaOpts=`<option value="">Selecione a área…</option>`+ATA_AREAS_MAFRA.map(function(a){return `<option ${a===ataState.area?"selected":""}>${esc(a)}</option>`;}).join("");
  const tipoOpts=`<option value="">Selecione o tipo…</option>`+ATA_TIPOS_REUNIAO.map(function(t){return `<option ${t===ataState.tipo?"selected":""}>${esc(t)}</option>`;}).join("");
  const cat=ataState.categoria||"condominio";
  return `<div class="ata-meta">
    <div class="ata-sec"><label>📝 Nome / título da reunião</label>
      <input type="text" id="ataNome" class="ata-nome-input" placeholder="Ex.: Assembleia ordinária — 09/06" value="${esc(ataState.nome||"")}" oninput="ataState.nome=this.value"></div>
    <div class="ata-sec"><label>🗂️ Categoria (origem) *</label>
      <select id="ataCategoria" class="ata-nome-input" onchange="_ataToggleCat()">
        <option value="condominio" ${cat==="condominio"?"selected":""}>Condomínio</option>
        <option value="mafra" ${cat==="mafra"?"selected":""}>Mafra Gestão Integrada</option>
        <option value="externa" ${cat==="externa"?"selected":""}>Externa / Outros Assuntos</option>
      </select></div>
    <div class="ata-sec" id="ataCondRow" style="${cat==="condominio"?"":"display:none"}"><label>${ico('predio')} Condomínio</label>
      <select id="ataCond" class="ata-nome-input" onchange="ataState.condominio=this.value">${condOpts}</select></div>
    <div class="ata-sec" id="ataMafraRow" style="${cat==="mafra"?"":"display:none"}"><label>🏬 Área interna Mafra</label>
      <select id="ataArea" class="ata-nome-input" onchange="ataState.area=this.value">${areaOpts}</select></div>
    <div class="ata-sec" id="ataExtRow" style="${cat==="externa"?"":"display:none"}"><label>📌 Assunto / referência</label>
      <input type="text" id="ataAssunto" class="ata-nome-input" placeholder="Descreva o assunto da reunião externa" value="${esc(ataState.assunto||"")}" oninput="ataState.assunto=this.value"></div>
    <div class="ata-sec"><label>🏷️ Tipo de reunião</label>
      <select id="ataTipo" class="ata-nome-input" onchange="ataState.tipo=this.value">${tipoOpts}</select>
      <div class="ata-part-hint">A IA usa o tipo para gerar a ata no formato certo (assembleia, conselho, vistoria…).</div></div>
    <div class="ata-sec"><label>👥 Participantes</label>
      <div id="ataPartList">${_partRowsHTML(ataState.participantesList)}</div>
      <button class="btn-ghost" style="margin-top:6px" onclick="_ataAddPart()">➕ Adicionar participante</button></div>
  </div>`;
}

function renderAtaModal(){
  _ataRevogarURLs();
  const r=ataState.result;
  const supported=!!(window.SpeechRecognition||window.webkitSpeechRecognition);
  let resultHTML="";
  if(r){
    const tasksHTML = r.tarefas.length
      ? `<div class="ata-tasks">`+r.tarefas.map(function(t,i){ return `<label class="ata-task"><input type="checkbox" ${ataState.sel[i]?"checked":""} onchange="ataState.sel[${i}]=this.checked"><span><b>${esc(t.titulo)}</b>${(t.responsavel||t.prazo)?`<small>${[t.responsavel?("👤 "+esc(t.responsavel)):"",t.prazo?("⏰ "+esc(t.prazo)):""].filter(Boolean).join(" · ")}</small>`:""}</span></label>`; }).join("")+`</div>`
      : `<div class="ata-empty">Nenhuma tarefa identificada.</div>`;
    resultHTML=`<div class="ata-result">
      <div class="ata-sec"><label>Ata (editável)</label><textarea id="ataAtaTxt" class="ata-ta">${esc(r.ata)}</textarea></div>
      <div class="ata-sec"><label>O que ficou resolvido</label>${r.resolvidos.length?`<ul class="ata-ul">`+r.resolvidos.map(function(x){return `<li>${esc(x)}</li>`;}).join("")+`</ul>`:`<div class="ata-empty">Nada marcado como resolvido.</div>`}</div>
      <div class="ata-sec"><label>Checklist de tarefas</label>${tasksHTML}</div>
      <div class="ata-actions">
        ${ataState.targetId?`<button class="btn-ghost" onclick="inserirNoCampo()">↧ Inserir no campo</button>`:""}
        <button class="btn-gold" onclick="salvarGravacao()">🎙️ Salvar em Gravações</button>
        ${r.tarefas.length?`<button class="btn-ghost" onclick="criarTarefasAta()">✓ Criar tarefas</button>`:""}
      </div>
      ${ataState.created?`<div class="ata-ok">Tarefas adicionadas em “Minhas tarefas” ✓</div>`:""}
      ${ataState.gravada?`<div class="ata-ok">Ata salva na aba Gravações ✓</div>`:""}
    </div>`;
  }

  // player do áudio gravado (se houver)
  let audioHTML="";
  if(ataState.audioBlob){
    try{
      const audioUrl=URL.createObjectURL(ataState.audioBlob);
      ataState._urls.push(audioUrl);
      const tam=(ataState.audioBlob.size/1024/1024).toFixed(1);
      audioHTML=`<div class="ata-audio">
        <div class="ata-audio-top">🎧 Áudio gravado <span>${tam} MB</span></div>
        <audio controls src="${audioUrl}" style="width:100%;margin-top:6px"></audio>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <button class="btn-ghost" style="flex:1;min-width:120px" onclick="_ataBaixarAudio()">⬇️ Baixar áudio</button>
          <button class="btn-ghost" style="flex:1;min-width:120px" onclick="_ataTranscreverArquivo(ataState.audioBlob)">📝 Transcrever</button>
          <button class="btn-gold" style="flex:1;min-width:120px" onclick="salvarGravacao()">💾 Salvar gravação</button>
        </div>
      </div>`;
    }catch(e){}
  }

  // bloco de recomendações (sempre visível) + banner de gravação (só gravando)
  const avisoBox=`<div class="ata-aviso-box" id="ataAvisoFixo">
      <b>Antes de gravar:</b> mantenha <b>esta tela ligada e o app aberto</b> durante toda a gravação. Se você trocar de aplicativo ou a tela bloquear, o celular pode parar a gravação.<br>
      ⏱️ Limite de <b>2 horas</b> por gravação (para sozinho ao atingir).<br>
      💡 Para reuniões longas com a tela apagada, grave no <b>app gravador do celular</b> e depois use <b>📁 Enviar áudio</b>.
    </div>
    <div class="ata-aviso-box ata-aviso-rec" id="ataAvisoRec" style="display:none">
      🔴 <b>Gravando…</b> NÃO troque de aplicativo e mantenha esta tela ligada, senão a gravação pode ser interrompida.
    </div>`;

  document.getElementById("ataMount").innerHTML=`<div class="overlay ata-overlay" onclick="if(event.target===this)closeAta()"><div class="modal">
    <div class="modal-head"><h3>🎙️ Ata por áudio</h3><button class="x" onclick="closeAta()">×</button></div>
    <div class="modal-body">
      <p class="ata-hint">Toque em <b>Gravar áudio</b> e fale à vontade — pode gravar <b>até 2 horas</b>. A transcrição aparece sozinha enquanto você fala${supported?"":" (neste aparelho ela é feita ao final, a partir do áudio)"}. Você também pode digitar/colar o conteúdo.</p>
      ${avisoBox}
      <div class="ata-recbar">
        <button id="ataRecBtn" class="ata-recbtn" onclick="ataState.recognizing?stopRec():startRec()">🎙️ Gravar áudio</button>
        <label class="ata-recbtn ata-recbtn-up" for="ataAudioFile" title="Envie um arquivo de áudio que você já gravou no celular">📁 Enviar áudio
          <input type="file" id="ataAudioFile" accept="audio/*" style="display:none" onchange="enviarAudioArquivo(event)">
        </label>
      </div>
      <div class="ata-recstatus">
        <span id="ataRecDot" class="ata-recdot" style="display:none">● gravando</span>
        <span id="ataRecTimer" class="ata-rectimer" style="display:none">00:00</span>
        <span id="ataRecRemaining" class="ata-rec-remaining"></span>
      </div>
      <div id="ataAvisoTransc" class="ata-aviso-transc" style="display:none"></div>
      <textarea id="ataTranscript" class="ata-transcript" placeholder="A transcrição aparece aqui enquanto você fala… (você pode editar)">${esc(ataState.base||"")}</textarea>
      ${audioHTML}
      ${_ataMetaHTML()}
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        <button class="btn-gold" style="flex:1;min-width:150px" onclick="salvarGravacao()">🎙️ Salvar em Gravações</button>
        <button id="ataGerarBtn" class="btn-primary" style="flex:1;min-width:150px" onclick="gerarAta()">✨ Gerar ata com IA</button>
      </div>
      ${resultHTML}
    </div></div></div>`;
  setRecUI(ataState.recognizing);
}

function _ataBaixarAudio(){
  if(!ataState.audioBlob) return;
  try{
    const ext=(ataState.mrMime||"audio/webm").includes("mp4")?"m4a":(ataState.mrMime||"").includes("ogg")?"ogg":(ataState.mrMime||"").includes("wav")?"wav":"webm";
    const a=document.createElement("a");
    const u=URL.createObjectURL(ataState.audioBlob);
    a.href=u;
    a.download=(ataState.nome?ataState.nome.replace(/[^a-zA-Z0-9]+/g,"_"):"ata-"+new Date().toISOString().slice(0,19).replace(/[:T]/g,"-"))+"."+ext;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(u); }, 2000);
  }catch(e){ alert("Não consegui baixar o áudio agora."); }
}

/* ============================================================
   SALVAR a gravação (sobe o áudio para o Storage)
   ============================================================ */
async function salvarGravacao(){
  const at=document.getElementById("ataAtaTxt"); if(at && ataState.result) ataState.result.ata=at.value;
  const nm=document.getElementById("ataNome"); if(nm) ataState.nome=nm.value;
  const ca=document.getElementById("ataCategoria"); if(ca) ataState.categoria=ca.value;
  const tp=document.getElementById("ataTipo"); if(tp) ataState.tipo=tp.value;
  const cd=document.getElementById("ataCond"); if(cd) ataState.condominio=cd.value;
  const ar=document.getElementById("ataArea"); if(ar) ataState.area=ar.value;
  const ax=document.getElementById("ataAssunto"); if(ax) ataState.assunto=ax.value;
  const ataTxt = ataState.result ? (ataState.result.ata||"") : "";
  if(!ataTxt.trim() && !ataState.audioBlob){ alert("Grave/anexe um áudio ou gere a ata antes de salvar."); return; }

  const recId="gr"+Date.now()+Math.random().toString(36).slice(2,6);
  const nome=(ataState.nome||"").trim() || (ataTxt.split("\n")[0]||"").slice(0,80) || ("Gravação "+new Date().toLocaleDateString("pt-BR"));
  const categoria=ataState.categoria||"condominio";
  const condominio=(categoria==="condominio") ? (ataState.condominio||"") : "";
  const area=(categoria==="mafra") ? (ataState.area||"") : "";
  const assunto=(categoria==="externa") ? (ataState.assunto||"") : "";
  const plist=(ataState.participantesList||[]).filter(function(p){return p && p.nome && p.nome.trim();});

  // feedback de progresso
  const aviso=document.getElementById("ataAvisoTransc");
  if(ataState.audioBlob && aviso){ aviso.style.display="block"; aviso.textContent="⬆️ Salvando o áudio no sistema…"; }

  // sobe o áudio: tenta Storage; se falhar, guarda local (IndexedDB) neste aparelho
  let audioRef=null, audioLocal=false;
  const ext=(ataState.mrMime||"audio/webm").includes("mp4")?"m4a":(ataState.mrMime||"").includes("ogg")?"ogg":(ataState.mrMime||"").includes("wav")?"wav":"webm";
  if(ataState.audioBlob){
    audioRef = await _subirAudioStorage(ataState.audioBlob, recId, ext);
    if(!audioRef){ audioLocal = await _idbAudioSet(recId, ataState.audioBlob); }
  }

  const agora=Date.now();
  const rec={
    id:recId, ts:agora, criadoEm:agora, atualizadoEm:agora,
    titulo:nome, nome:nome,
    categoria:categoria, tipo:ataState.tipo||"", condominio:condominio, area:area, assunto:assunto,
    ata:ataTxt,
    transcricao:(ataState.finalTxt||ataState.fixo||(at?at.value:"")||"").trim(),
    transcricaoOriginal:"",
    resumo:"", plano:[], anexos:[],
    resolvidos:(ataState.result&&ataState.result.resolvidos)||[],
    tarefas:(ataState.result&&ataState.result.tarefas)||[],
    participantesList:plist, participantes:_partsToStr(plist),
    autor:state.userId,
    audio:audioRef||null, audioLocal:audioLocal,
    audioMime:ataState.mrMime||"", audioExt:ext, audioDurMs:ataState.audioDurMs||0,
    status:"gravado"
  };
  rec.status=_statusGrav(rec).k;
  const d=await loadGravacoes(); if(!d.list)d.list=[]; d.list.push(rec); await saveGravacoes(d);
  ataState.gravada=true;

  if(ataState.audioBlob && !audioRef && !audioLocal){
    if(aviso) aviso.style.display="none";
    renderAtaModal();
    alert("A gravação foi salva, mas NÃO consegui guardar o áudio (nem no Storage, nem localmente).\n\nMotivo: "+(_ultimoErroStorage||"desconhecido")+"\n\nBaixe o áudio para não perder e use “🔧 Testar Storage” na tela de Gravações.");
    if(state.tab==="gravacoes") renderGravacoes();
    return;
  }

  // TRANSCRIÇÃO AUTOMÁTICA após salvar (se houver áudio e ainda não houver transcrição)
  if(ataState.audioBlob && !rec.transcricao){
    if(aviso){ aviso.style.display="block"; aviso.textContent="⏳ Transcrevendo o áudio automaticamente… (áudios longos demoram mais)"; }
    let texto=null;
    try{ texto=await transcreverAudioServidor(ataState.audioBlob); }catch(e){}
    if(texto){
      rec.transcricao=texto.trim();
      rec.transcricaoOriginal=texto.trim();
      rec.status=_statusGrav(rec).k;
      const d2=await loadGravacoes(); const g2=(d2.list||[]).find(function(x){return x.id===recId;}); if(g2){ g2.transcricao=rec.transcricao; g2.transcricaoOriginal=rec.transcricao; g2.status=rec.status; g2.atualizadoEm=Date.now(); await saveGravacoes(d2); }
      ataState.finalTxt=rec.transcricao; ataState.base=rec.transcricao; _ataAtualizarCampo();
      if(aviso){ aviso.style.display="block"; aviso.textContent="✓ Áudio transcrito e salvo. Toque em “✨ Gerar ata com IA” para criar a ata."; }
    }else{
      if(aviso){ aviso.style.display="block"; aviso.innerHTML="Gravação salva ✓. A transcrição automática não respondeu (verifique a função “transcrever-audio” no servidor). Você pode abrir a gravação e tentar transcrever de novo, ou enviar o áudio no WhatsApp e colar o texto."; }
    }
  } else {
    if(aviso) aviso.style.display="none";
  }

  renderAtaModal();
  if(ataState.audioBlob && !audioRef && audioLocal){
    alert("Gravação salva ✓\n\nMas o áudio ficou guardado SÓ neste aparelho. Motivo do Storage não ter aceitado:\n"+(_ultimoErroStorage||"desconhecido")+"\n\nNa tela de Gravações use “🔧 Testar Storage” para corrigir e depois “☁️ Reenviar áudios locais”.");
  }
  if(state.tab==="gravacoes") renderGravacoes();
}

/* ============================================================
   LISTA de gravações
   ============================================================ */
/* repintura sincrona da busca/participante — preserva foco e cursor (sem recarregar do servidor) */
function gvBuscaInput(el, campo){
  var caret = el.selectionStart;
  var id = el.id;
  var novo = {}; novo[campo] = el.value;
  state.gvFiltro = Object.assign({}, state.gvFiltro, novo);
  if(state._gvVis){
    _gvPaint(state._gvVis);
    var e = document.getElementById(id);
    if(e){ e.focus(); try{ e.setSelectionRange(caret, caret); }catch(_){} }
  } else {
    render();
  }
}

async function renderGravacoes(){
  document.getElementById("view").innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  const d=await loadGravacoes(); let all=(d.list||[]).slice().map(_migraGrav).sort(function(a,b){return b.ts-a.ts;});
  const vis=[]; for(const g of all){ if(await podeVer(g)) vis.push(g); }
  state._gvVis = vis;
  _gvPaint(vis);
}

function _gvPaint(vis){
  // vistas novas (migra valores antigos)
  let vista=state.gvVista||"reunioes";
  if(vista==="audios") vista="gravacoes";
  if(vista==="atas") vista="documentos";
  state.gvVista=vista;

  const f=Object.assign({data:"",busca:"",tipo:"",cat:"",cond:"",periodo:"",status:"",part:""}, state.gvFiltro||{});
  const drawer=!!state.gvFiltrosAbertos;

  // ---- filtros ----
  let list=vis.slice();
  if(f.periodo){
    const now=new Date(); let ini=0;
    if(f.periodo==="hoje"){ const x=new Date(); x.setHours(0,0,0,0); ini=x.getTime(); }
    else if(f.periodo==="semana"){ ini=now.getTime()-7*864e5; }
    else if(f.periodo==="mes"){ ini=now.getTime()-30*864e5; }
    else if(f.periodo==="90d"){ ini=now.getTime()-90*864e5; }
    list=list.filter(function(g){ return g.ts>=ini; });
  }
  if(f.data) list=list.filter(function(g){ return ymd(new Date(g.ts))===f.data; });
  if(f.cat) list=list.filter(function(g){ return (g.categoria||"")===f.cat; });
  if(f.tipo) list=list.filter(function(g){ return (g.tipo||"")===f.tipo; });
  if(f.cond) list=list.filter(function(g){ return (g.condominio||"")===f.cond; });
  if(f.part){ const q=f.part.toLowerCase(); list=list.filter(function(g){ const nomes=((g.participantesList||[]).map(function(p){return p.nome||"";}).join(" ")+" "+(g.participantes||"")).toLowerCase(); return nomes.includes(q); }); }
  if(f.status==="com-ata") list=list.filter(function(g){return (g.ata||"").trim();});
  if(f.status==="sem-ata") list=list.filter(function(g){return !(g.ata||"").trim();});
  if(f.status==="com-plano") list=list.filter(function(g){return (g.plano||[]).length;});
  if(f.status==="com-audio") list=list.filter(function(g){return (g.audio&&g.audio.url)||g.audioLocal;});
  if(f.status==="pendencias") list=list.filter(function(g){return (g.plano||[]).some(function(a){return (a.status||"Pendente")!=="Concluído";});});
  if(f.busca){ const q=f.busca.toLowerCase(); list=list.filter(function(g){ return (g.titulo||"").toLowerCase().includes(q) || (g.ata||"").toLowerCase().includes(q) || (g.transcricao||"").toLowerCase().includes(q) || (g.resumo||"").toLowerCase().includes(q) || (g.participantes||"").toLowerCase().includes(q) || (g.condominio||"").toLowerCase().includes(q); }); }

  // ---- indicadores ----
  const nReun=vis.filter(function(g){return !g.ehPlano;}).length;
  const nGrav=vis.filter(function(g){return (g.audio&&g.audio.url)||g.audioLocal;}).length;
  const nAtas=vis.filter(function(g){return (g.ata||"").trim();}).length;
  const nPlanos=vis.filter(function(g){return (g.plano||[]).length;}).length;
  const nConds=(function(){ const s={}; vis.forEach(function(g){ if(!g.ehPlano && g.condominio) s[g.condominio]=1; }); return Object.keys(s).length; })();

  const lr=list.filter(function(g){return !g.ehPlano;});
  const gl=list.filter(function(g){ return (g.audio&&g.audio.url)||g.audioLocal; });
  let nDocs=0; list.forEach(function(g){ if((g.ata||"").trim()) nDocs++; if((g.resumo||"").trim()) nDocs++; });
  const lp=list.filter(function(g){ return g.ehPlano || (g.plano||[]).length; });
  const totalVista = vista==="documentos" ? nDocs : (vista==="gravacoes" ? gl.length : (vista==="planos" ? lp.length : lr.length));
  const conds=(typeof CONDOMINIOS!=="undefined"?CONDOMINIOS:[]);
  const temFiltro=(f.data||f.tipo||f.cond||f.cat||f.periodo||f.status||f.part);
  function vbtn(id,label){ return `<button class="gv-vista ${vista===id?"on":""}" onclick="state.gvVista='${id}';render()">${label}</button>`; }
  function fset(campo,valExpr){ return `state.gvFiltro=Object.assign({},state.gvFiltro,{${campo}:${valExpr}});render()`; }
  function pchip(label,val){ return `<button class="gv-chip ${f.periodo===val?"on":""}" onclick="${fset("periodo",`'${f.periodo===val?"":val}'`)}">${label}</button>`; }

  let html=`<div class="gv-dash" style="margin-top:2px">
    <div class="gv-dashcard"><div class="v">${nGrav}</div><div class="l">🎙️ Gravações</div></div>
    <div class="gv-dashcard"><div class="v">${nAtas}</div><div class="l">📄 Atas</div></div>
    <div class="gv-dashcard"><div class="v">${nReun}</div><div class="l">📁 Reuniões</div></div>
    <div class="gv-dashcard"><div class="v">${nPlanos}</div><div class="l">📋 Planos</div></div>
    <div class="gv-dashcard"><div class="v">${nConds}</div><div class="l">${ico('predio')} Condomínios</div></div>
  </div>

  <div class="gv-actionbar">
    <button class="btn-gold" onclick="openAta(null)">➕ Nova reunião</button>
    <button class="btn-ghost" onclick="openEditorAta(null)">📝 Escrever ata</button>
    <button class="btn-ghost" onclick="abrirPlanoPagina(null)">📋 Plano de ação</button>
    <div class="spacer" style="flex:1"></div>
    <button class="btn-ghost" onclick="diagnosticarStorage()" title="Testa o armazenamento dos áudios">🔧 Storage</button>
    ${vis.some(function(g){return g.audioLocal && !(g.audio&&g.audio.url);})?`<button class="btn-ghost" onclick="reenviarAudiosLocais()">☁️ Reenviar locais</button>`:""}
  </div>

  <div style="display:flex;gap:8px;align-items:stretch;margin-bottom:12px;flex-wrap:wrap">
    <div class="gv-search" style="flex:1;min-width:230px;margin-bottom:0">🔎 <input id="gvInpBusca" type="text" placeholder="Buscar reuniões, atas, participantes, condomínios, transcrições… (ex.: AVCB, piscina)" value="${esc(f.busca)}" oninput="gvBuscaInput(this,'busca')">
      ${f.busca?`<button class="btn-ghost" onclick="${fset("busca","''")}">limpar</button>`:""}
    </div>
    <button class="btn-ghost" style="white-space:nowrap" onclick="state.gvFiltrosAbertos=true;render()">🔍 Filtros${temFiltro?' <span class="gv-bdg ok">ativos</span>':""}</button>
  </div>

  <div class="gv-vistas">
    ${vbtn("reunioes","📁 Reuniões")}
    ${vbtn("documentos","📄 Documentos")}
    ${vbtn("gravacoes","🎙️ Gravações")}
    ${vbtn("planos","📋 Planos de ação")}
  </div>

  <div class="range" style="margin-bottom:10px">${totalVista} registro(s)${temFiltro?` · <a href="#" onclick="state.gvFiltro={data:'',busca:state.gvFiltro.busca||'',tipo:'',cat:'',cond:'',periodo:'',status:'',part:''};render();return false">limpar filtros</a>`:""}</div>`;

  // ================= VISTA: REUNIÕES =================
  if(vista==="reunioes"){
    html+=`<div class="gv-cards">`;
    if(lr.length===0) html+=`<div class="gv-empty"><div class="gi">📁</div>Nenhuma reunião encontrada<div class="gs">Ajuste a busca ou os filtros — ou clique em ➕ Nova reunião.</div></div>`;
    lr.forEach(function(g){
      const dt=new Date(g.ts); const dataStr=dt.toLocaleDateString("pt-BR")+" · "+("0"+dt.getHours()).slice(-2)+":"+("0"+dt.getMinutes()).slice(-2);
      const temAta=!!(g.ata||"").trim(); const temPlano=(g.plano||[]).length;
      const tipoTxt=_tipoLabel(g.tipo)||"Reunião";
      const local=g.condominio||(g.categoria==="mafra"?(g.area||"Mafra"):(g.categoria==="externa"?(g.assunto||"Externa"):""));
      const nPart=(g.participantesList||[]).filter(function(p){return (p.nome||"").trim();}).length || ((g.participantes||"").trim()?g.participantes.split(/[;,]/).filter(function(x){return x.trim();}).length:0);
      html+=`<div class="gv-card"><div class="gv-card-top"><div class="gv-card-ic">${g.origem?"✂️":"📁"}</div><div><div class="gv-card-tit">${esc(g.titulo||g.nome||"Reunião")}</div><div class="gv-card-meta">🏷️ ${esc(tipoTxt)}</div></div></div>
        <div class="gv-card-meta">${ico('calendario')} ${dataStr}${local?(" · "+ico('predio')+" "+esc(local)):""}</div>
        <div class="gv-card-meta">👥 ${nPart} participante(s)</div>
        <div class="gv-card-badges">
          ${(window._ataJobs&&window._ataJobs[g.id])?`<span class="gv-bdg ger">⏳ Gerando ata…</span>`:`<span class="gv-bdg ${temAta?"ok":""}">${temAta?"Ata ✓":"Ata pendente"}</span>`}
        </div>
        <div class="gv-card-acts"><button class="prim" onclick="gvTab='resumo';abrirGravacao('${g.id}')">Abrir reunião</button></div></div>`;
    });
    html+=`</div>`;
  }

  // ================= VISTA: DOCUMENTOS =================
  if(vista==="documentos"){
    const docs=[];
    list.forEach(function(g){
      const local=g.condominio||(g.categoria==="mafra"?(g.area||"Mafra"):(g.categoria==="externa"?(g.assunto||"Externa"):""));
      const base={g:g, local:local};
      if((g.ata||"").trim()) docs.push(Object.assign({tipo:"ata",ic:"📄",tlabel:"Ata"},base));
      if((g.resumo||"").trim()) docs.push(Object.assign({tipo:"resumo",ic:"🧾",tlabel:"Resumo Executivo"},base));
    });
    if(docs.length===0){ html+=`<div class="gv-empty"><div class="gi">📄</div>Nenhum documento gerado ainda<div class="gs">Abra uma reunião e gere a ata, o resumo executivo ou o plano de ação.</div></div>`; } else { html+=`<div class="gv-doclist">`;
    docs.forEach(function(dc){
      const g=dc.g;
      const dt=new Date(g.ts).toLocaleDateString("pt-BR");
      const ed=new Date(g.atualizadoEm||g.ts).toLocaleDateString("pt-BR");
      html+=`<div class="gv-docrow">
        <div class="gv-doc-ic">${dc.ic}</div>
        <div class="gv-doc-info">
          <div class="gv-doc-nome">${dc.tlabel} — ${esc(g.titulo||g.nome||"Reunião")}</div>
          <div class="gv-doc-meta">${ico('calendario')} ${dt}${dc.local?(" · "+ico('predio')+" "+esc(dc.local)):""} · ${dc.tlabel}${(dc.tipo==="plano"&&dc.g.rascunho)?" · 📝 rascunho":""} · editado em ${ed}</div>
        </div>
        <div class="gv-doc-acts">
          <button class="prim" onclick="abrirDocViewer('${g.id}','${dc.tipo}')">👁 Visualizar</button>
          <button onclick="abrirDocEditor('${g.id}','${dc.tipo}')">✏️ Editar</button>
          <button onclick="exportarGravacaoPDF('${g.id}')">👁️ Visualizar</button>
          <button onclick="exportarGravacaoWord('${g.id}')">📄 Word</button>
          <button onclick="excluirDocumento('${g.id}','${dc.tipo}')">🗑</button>
        </div>
      </div>`;
    });
    html+=`</div>`; }
  }

  // ================= VISTA: GRAVAÇÕES =================
  if(vista==="gravacoes"){
    if(gl.length===0){ html+=`<div class="gv-empty"><div class="gi">🎙️</div>Nenhuma gravação com áudio<div class="gs">Use ➕ Nova reunião para gravar ou enviar um áudio.</div></div>`; } else { html+=`<div class="gv-doclist">`;
    gl.forEach(function(g){
      const dt=new Date(g.ts).toLocaleDateString("pt-BR")+" · "+("0"+new Date(g.ts).getHours()).slice(-2)+":"+("0"+new Date(g.ts).getMinutes()).slice(-2);
      const local=g.condominio||(g.categoria==="mafra"?(g.area||"Mafra"):(g.categoria==="externa"?(g.assunto||"Externa"):""));
      const dur=_durHM(g.audioDurMs);
      html+=`<div class="gv-docrow">
        <div class="gv-doc-ic">🎙️</div>
        <div class="gv-doc-info">
          <div class="gv-doc-nome">${esc(g.titulo||g.nome||"Gravação")}</div>
          <div class="gv-doc-meta">${ico('calendario')} ${dt}${local?(" · "+ico('predio')+" "+esc(local)):""}${dur?(" · ⏱️ "+dur):""}${g.audioLocal&&!(g.audio&&g.audio.url)?" · só neste aparelho":""}</div>
        </div>
        <div class="gv-doc-acts">
          <button class="prim" onclick="gvTab='audio';abrirGravacao('${g.id}')">▶ Ouvir</button>
          <button onclick="abrirCorteDireto('${g.id}')">✂ Cortar</button>
          <button onclick="baixarAudioGravacao('${g.id}')">⬇ Baixar</button>
          <button onclick="renomearGravacaoRapido('${g.id}')">✏ Renomear</button>
          <button onclick="delGravacao('${g.id}')">🗑</button>
        </div>
      </div>`;
    });
    html+=`</div>`; }
  }

  // ================= VISTA: PLANOS DE AÇÃO =================
  if(vista==="planos"){
    if(!lp.length){
      html+=`<div class="gv-empty"><div class="gi">📋</div>Nenhum plano de ação ainda<div class="gs">Clique em 📋 Plano de ação para criar o primeiro.</div></div>`;
    } else {
      html+=`<div class="gv-doclist">`;
      lp.forEach(function(g){
        const loc=g.condominio||(g.categoria==="mafra"?(g.area||"Mafra"):(g.categoria==="externa"?(g.assunto||"Externa"):""));
        const dtp=new Date(g.ts).toLocaleDateString("pt-BR");
        const nA=(g.plano||[]).length;
        const tot=(g.plano||[]).reduce(function(t,a){return t+_numVal(a.valor);},0);
        const aguard=(g.plano||[]).reduce(function(t,a){return t+(_migStatus(a.status)==="Aguardando recursos"?_numVal(a.valor):0);},0);
        const fin=(g.plano||[]).filter(function(a){return _migStatus(a.status)==="Finalizado";}).length;
        html+=`<div class="gv-docrow">
          <div class="gv-doc-ic">${g.ehPlano?"📋":"🎙️"}</div>
          <div class="gv-doc-info">
            <div class="gv-doc-nome">${esc(g.titulo||g.nome||"Plano de ação")}</div>
            <div class="gv-doc-meta">${ico('calendario')} ${dtp}${loc?(" · "+ico('predio')+" "+esc(loc)):""} · ${nA} ação(ões)${fin?(" · 🟢 "+fin+" finalizada(s)"):""}${tot?(" · 💰 "+_fmtBRL(tot)):""}${aguard?(" · 🟠 "+_fmtBRL(aguard)+" aguardando"):""}</div>
          </div>
          <div class="gv-doc-acts">
            <button onclick="abrirPlanoPagina('${g.id}')">✏️ Editar</button>
            <button class="prim" onclick="abrirPlanoPDF('${g.id}')">👁 Visualizar</button>
            <button style="color:#B3261E;border-color:#F3C9C9" onclick="delGravacao('${g.id}')">🗑️</button>
          </div>
        </div>`;
      });
      html+=`</div>`;
    }
  }

  // ================= PAINEL LATERAL DE FILTROS =================
  if(drawer){
    const condOpts=`<option value="">Todos</option>`+condOptionsAgrupadas(f.cond,conds);
    const tipoOpts=`<option value="">Todos</option>`+ATA_TIPOS_REUNIAO.map(function(t){return `<option ${t===f.tipo?"selected":""}>${esc(t)}</option>`;}).join("");
    const stOpts=[["","Todos"],["com-ata","Com ata"],["sem-ata","Sem ata"],["com-audio","Com áudio"]].map(function(o){return `<option value="${o[0]}" ${f.status===o[0]?"selected":""}>${o[1]}</option>`;}).join("");
    html+=`<div class="gv-drawer-ov" onclick="state.gvFiltrosAbertos=false;render()"></div>
    <div class="gv-drawer">
      <h3>🔍 Filtros <button class="x" onclick="state.gvFiltrosAbertos=false;render()">×</button></h3>
      <label>Período</label>
      <div class="gv-chips">${pchip("Hoje","hoje")}${pchip("Semana","semana")}${pchip("Mês","mes")}${pchip("90 dias","90d")}</div>
      <label>Categoria</label>
      <select onchange="${fset("cat","this.value")}"><option value="">Todas</option><option value="condominio" ${f.cat==="condominio"?"selected":""}>Condomínio</option><option value="mafra" ${f.cat==="mafra"?"selected":""}>Mafra</option><option value="externa" ${f.cat==="externa"?"selected":""}>Externa</option></select>
      <label>Condomínio</label>
      <select onchange="${fset("cond","this.value")}">${condOpts}</select>
      <label>Tipo de reunião</label>
      <select onchange="${fset("tipo","this.value")}">${tipoOpts}</select>
      <label>Data exata</label>
      <input type="date" value="${f.data}" oninput="${fset("data","this.value")}">
      <label>Participante</label>
      <input id="gvInpPart" type="text" placeholder="Nome do participante…" value="${esc(f.part)}" oninput="gvBuscaInput(this,'part')">
      <label>Status</label>
      <select onchange="${fset("status","this.value")}">${stOpts}</select>
      <div style="display:flex;gap:8px;margin-top:18px">
        <button class="btn-ghost" style="flex:1" onclick="state.gvFiltro={data:'',busca:state.gvFiltro.busca||'',tipo:'',cat:'',cond:'',periodo:'',status:'',part:''};render()">Limpar</button>
        <button class="btn-gold" style="flex:1" onclick="state.gvFiltrosAbertos=false;render()">Aplicar</button>
      </div>
    </div>`;
  }

  document.getElementById("view").innerHTML=html;
}

/* abre a reunião já na aba Áudio e dispara o cortador */
function abrirCorteDireto(id){ gvTab="audio"; abrirGravacao(id); setTimeout(function(){ try{ abrirCorte(id); }catch(e){} }, 80); }

/* ---- Central de Documentos: ver, editar e excluir sem abrir a reunião ---- */
function _docCampo(tipo){ return tipo==="resumo"?"resumo":"ata"; }
function _docLabel(tipo){ return tipo==="ata"?"Ata":(tipo==="resumo"?"Resumo Executivo":"Plano de Ação"); }
async function abrirDocViewer(id,tipo){
  if(tipo==="plano"){ visualizarPlanoDoc(id); return; }
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  let corpo="";
  if(tipo==="plano"){
    corpo=(g.plano||[]).map(function(a,i){ return (i+1)+". "+(a.acao||"")+"\n    Responsável: "+(a.responsavel||"—")+" | Prazo: "+(a.prazo||"—")+" | Prioridade: "+(a.prioridade||"—")+" | Status: "+(a.status||"Pendente"); }).join("\n\n");
  } else { corpo=g[_docCampo(tipo)]||""; }
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>${_docLabel(tipo)} — ${esc(g.titulo||g.nome||"")}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="book-info" style="white-space:pre-wrap">${esc(corpo)||"<i>vazio</i>"}</div>
      <div class="gv-acts" style="margin-top:12px">
        <button class="btn-ghost" onclick="abrirDocEditor('${g.id}','${tipo}')">✏️ Editar</button>
        <button class="btn-ghost" onclick="exportarGravacaoPDF('${g.id}')">👁️ Visualizar</button>
        <button class="btn-ghost" onclick="exportarGravacaoWord('${g.id}')">📄 Word</button>
        <button class="btn-primary" onclick="closeModal()">Fechar</button>
      </div>
    </div></div></div>`;
}
async function abrirDocEditor(id,tipo){
  if(tipo==="plano"){ abrirPlanoPagina(id); return; }
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const campo=_docCampo(tipo);
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>✏️ Editar ${_docLabel(tipo)} — ${esc(g.titulo||g.nome||"")}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <textarea id="docEdTxt" class="ata-edit-area" style="min-height:320px">${esc(g[campo]||"")}</textarea>
      <div class="gv-acts" style="margin-top:12px">
        <button class="btn-primary" onclick="closeModal()">Cancelar</button>
        <button class="btn-gold" onclick="salvarDocEditor('${g.id}','${tipo}')">💾 Salvar</button>
      </div>
    </div></div></div>`;
}
async function salvarDocEditor(id,tipo){
  const ta=document.getElementById("docEdTxt"); if(!ta) return;
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  g[_docCampo(tipo)]=ta.value; g.atualizadoEm=Date.now();
  await saveGravacoes(d);
  closeModal();
  if(state.tab==="gravacoes") renderGravacoes();
}
async function excluirDocumento(id,tipo){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  if(!confirm("Excluir o documento \""+_docLabel(tipo)+"\" desta reunião?\n\nA reunião, o áudio e a transcrição NÃO serão apagados.")) return;
  if(tipo==="plano") g.plano=[]; else g[_docCampo(tipo)]="";
  g.atualizadoEm=Date.now();
  await saveGravacoes(d);
  if(state.tab==="gravacoes") renderGravacoes();
}
/* ---- Plano de Ação manual: vai DIRETO para a página de preenchimento ---- */
function criarPlanoManual(){ abrirPlanoPagina(null); }

/* ============================================================
   PÁGINA do Plano de Ação (edição em tela cheia, blocos verticais)
   ============================================================ */
var gvPlanoPageMeta=null;
function _plNovoItem(){ return {acao:"",como:"",responsavel:"",prazo:"",prioridade:"Média",status:"Não iniciado",categoria:"",impacto:"",obs:"",valor:""}; }
async function abrirPlanoPagina(id){
  let g=null;
  if(id){ const d=await loadGravacoes(); g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return; }
  try{ closeModal(); }catch(e){}
  const conds=(typeof CONDOMINIOS!=="undefined"?CONDOMINIOS:[]);
  if(g){
    gvPlano=(g.plano||[]).map(function(a){return Object.assign(_plNovoItem(),a);});
    if(!gvPlano.length) gvPlano.push(_plNovoItem());
    const local=g.condominio||(g.categoria==="mafra"?(g.area||"Mafra"):(g.categoria==="externa"?(g.assunto||"Externa"):""));
    gvPlanoPageMeta={ id:g.id, novo:false, ehPlano:!!g.ehPlano, titulo:(g.titulo||g.nome||"Plano de ação"),
      categoria:g.categoria||"condominio", condominio:g.condominio||(conds[0]||""), area:g.area||(ATA_AREAS_MAFRA[0]||""), assunto:g.assunto||"",
      local:local, cat:_catLabel(g.categoria)||"", data:new Date(g.ts).toLocaleDateString("pt-BR") };
  } else {
    gvPlano=[_plNovoItem()];
    gvPlanoPageMeta={ id:null, novo:true, ehPlano:true, titulo:"",
      categoria:"condominio", condominio:(conds[0]||""), area:(ATA_AREAS_MAFRA[0]||""), assunto:"",
      local:"", cat:"", data:new Date().toLocaleDateString("pt-BR") };
  }
  _renderPlanoPagina();
  setTimeout(function(){ var el=document.getElementById(gvPlanoPageMeta.novo?"plMetaTit":"plq_0"); if(el) el.focus(); },60);
}
function _autoGrow(el){ el.style.height="auto"; el.style.height=(el.scrollHeight)+"px"; }
function _renderPlanoPagina(){
  const m=gvPlanoPageMeta; if(!m) return;
  const conds=(typeof CONDOMINIOS!=="undefined"?CONDOMINIOS:[]);
  function linha(a,i){
    const dt=_parsePrazo(a.prazo);
    const iso=dt?(dt.getFullYear()+"-"+("0"+(dt.getMonth()+1)).slice(-2)+"-"+("0"+dt.getDate()).slice(-2)):"";
    return `<tr>
      <td style="width:28%"><textarea id="plq_${i}" rows="1" placeholder="Descreva a ação / despesa…" oninput="gvPlano[${i}].acao=this.value;_autoGrow(this)">${esc(a.acao||"")}</textarea></td>
      <td style="width:14%"><select onchange="gvPlano[${i}].status=this.value;_plTotais()">${PLANO_STATUS.map(function(p){return `<option ${p===_migStatus(a.status)?"selected":""}>${p}</option>`;}).join("")}</select></td>
      <td style="width:12%"><input type="number" min="0" step="0.01" placeholder="0,00" style="text-align:right" value="${esc(a.valor||"")}" oninput="gvPlano[${i}].valor=this.value;_plTotais()"></td>
      <td style="width:13%"><input placeholder="Responsável" value="${esc(a.responsavel||"")}" oninput="gvPlano[${i}].responsavel=this.value"></td>
      <td style="width:12%"><input type="date" value="${iso}" oninput="gvPlano[${i}].prazo=this.value"></td>
      <td style="width:17%"><textarea rows="1" placeholder="Observações…" oninput="gvPlano[${i}].obs=this.value;_autoGrow(this)">${esc(a.obs||"")}</textarea></td>
      <td style="width:34px"><button class="pl-x" title="Remover" onclick="_plPageDel(${i})">×</button></td>
    </tr>`;
  }
  document.getElementById("view").innerHTML=`<div class="pl-page" style="max-width:980px">
    <div class="pl-pagehead">
      <button class="btn-ghost" onclick="renderGravacoes()">← Voltar</button>
      <h2>📋 Plano de Ação</h2>
      <div class="spacer" style="flex:1"></div>
      <button class="btn-ghost" onclick="salvarPlanoPagina(gvPlanoPageMeta&&gvPlanoPageMeta.id,'visual')">👁 Visualizar</button>
      <button class="btn-gold" onclick="salvarPlanoPagina(gvPlanoPageMeta&&gvPlanoPageMeta.id)">💾 Salvar</button>
    </div>
    ${m.ehPlano?`<div class="pl-card" style="margin-bottom:14px;padding:13px 16px">
      <div class="pl-grid2">
        <div><label style="margin-top:0">Título do plano</label>
          <input id="plMetaTit" placeholder="Ex.: Plano de ação 2026 — Exklusiv" value="${esc(m.titulo||"")}" oninput="gvPlanoPageMeta.titulo=this.value"></div>
        <div><label style="margin-top:0">Origem</label>
          <select onchange="gvPlanoPageMeta.categoria=this.value;_renderPlanoPagina()">
            <option value="condominio" ${m.categoria==="condominio"?"selected":""}>Condomínio</option>
            <option value="mafra" ${m.categoria==="mafra"?"selected":""}>Mafra Gestão Integrada</option>
            <option value="externa" ${m.categoria==="externa"?"selected":""}>Externa / Outros</option>
          </select></div>
      </div>
      <div style="margin-top:10px">${m.categoria==="condominio"?`<label style="margin-top:0">Condomínio</label><select onchange="gvPlanoPageMeta.condominio=this.value">${conds.map(function(c){return `<option ${c===m.condominio?"selected":""}>${esc(c)}</option>`;}).join("")}</select>`
        : (m.categoria==="mafra"?`<label style="margin-top:0">Área</label><select onchange="gvPlanoPageMeta.area=this.value">${ATA_AREAS_MAFRA.map(function(c){return `<option ${c===m.area?"selected":""}>${esc(c)}</option>`;}).join("")}</select>`
        : `<label style="margin-top:0">Assunto</label><input placeholder="Assunto / referência" value="${esc(m.assunto||"")}" oninput="gvPlanoPageMeta.assunto=this.value">`)}</div>
    </div>`
    :`<div class="pl-pagemeta">🎙️ ${esc(m.titulo)}${m.local?" — "+esc(m.local):""} · ${ico('calendario')} ${m.data}</div>`}

    <div class="gv-dash" id="plTotais" style="margin:0 0 14px"></div>

    <div class="plano-wrap"><table class="plano-tbl" style="min-width:880px"><thead><tr>
      <th>Descrição</th><th>Status</th><th style="text-align:right">Valor estimado</th><th>Responsável</th><th>Prazo</th><th>Observação</th><th></th>
    </tr></thead><tbody>
      ${gvPlano.map(linha).join("")}
    </tbody></table></div>

    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
      <button class="btn-ghost" style="flex:1;min-width:150px;padding:13px" onclick="_plPageAdd()">➕ Adicionar ação</button>
      <button class="btn-ghost" style="flex:1;min-width:150px;padding:13px" onclick="salvarPlanoPagina(gvPlanoPageMeta&&gvPlanoPageMeta.id,'visual')">👁 Visualizar</button>
      <button class="btn-gold" style="flex:2;min-width:210px;padding:13px;font-size:14.5px" onclick="salvarPlanoPagina(gvPlanoPageMeta&&gvPlanoPageMeta.id)">💾 Salvar Plano de Ação</button>
    </div>
  </div>`;
  document.querySelectorAll(".plano-tbl textarea").forEach(function(t){ _autoGrow(t); });
  _plTotais();
}
function _plTotais(){
  const el=document.getElementById("plTotais"); if(!el) return;
  let tot=0;
  (gvPlano||[]).forEach(function(a){ tot+=_numVal(a.valor); });
  el.innerHTML=`<div class="gv-dashcard"><div class="v">${tot?_fmtBRL(tot):"R$ 0,00"}</div><div class="l">💰 Valor total do plano de ação</div></div>`;
}
function _plPageAdd(){
  gvPlano.push(_plNovoItem());
  _renderPlanoPagina();
  var i=gvPlano.length-1;
  setTimeout(function(){ var el=document.getElementById("plq_"+i); if(el){ el.focus(); el.scrollIntoView({behavior:"smooth",block:"center"}); } },60);
}
function _plPageDel(i){
  gvPlano.splice(i,1);
  if(!gvPlano.length) gvPlano.push(_plNovoItem());
  _renderPlanoPagina();
}
async function salvarPlanoPagina(id, destino){
  const m=gvPlanoPageMeta||{};
  let winPdf=null;
  if(destino==="visual"){ try{ winPdf=window.open("","_blank"); }catch(e){ winPdf=null; } }
  const acoes=(gvPlano||[]).filter(function(a){return (a.acao||"").trim()||(a.como||"").trim();});
  if(!acoes.length){ if(winPdf&&!winPdf.closed) winPdf.close(); alert("Escreva pelo menos uma ação antes de salvar."); return; }
  const d=await loadGravacoes();
  let g;
  if(m.novo && !id){
    g={ id:"pl"+Date.now(), ts:Date.now(), criadoEm:Date.now(), atualizadoEm:Date.now(),
      titulo:(m.titulo||"").trim()||("Plano de ação — "+new Date().toLocaleDateString("pt-BR")),
      ehPlano:true, categoria:m.categoria||"condominio",
      condominio:m.categoria==="condominio"?(m.condominio||""):"",
      area:m.categoria==="mafra"?(m.area||""):"",
      assunto:m.categoria==="externa"?((m.assunto||"").trim()):"",
      plano:acoes, anexos:[], participantesList:[], participantes:"", resolvidos:[], tarefas:[],
      autor:(typeof state!=="undefined"&&state.userId)?state.userId:"" };
    d.list=d.list||[]; d.list.push(g);
    m.novo=false; m.id=g.id;
  } else {
    g=(d.list||[]).find(function(x){return x.id===(id||m.id);}); if(!g) return;
    if(m.ehPlano){
      g.titulo=(m.titulo||"").trim()||g.titulo;
      g.categoria=m.categoria||g.categoria;
      g.condominio=m.categoria==="condominio"?(m.condominio||""):"";
      g.area=m.categoria==="mafra"?(m.area||""):"";
      g.assunto=m.categoria==="externa"?((m.assunto||"").trim()):"";
    }
    g.plano=acoes;
  }
  g.rascunho=false; g.atualizadoEm=Date.now();
  const okSave=await saveGravacoes(d);
  if(okSave===false) return;
  gvPlanoEdit=false; gvTab="plano";
  if(destino==="visual"){
    abrirPlanoPagina(g.id);
    abrirPlanoPDF(g.id, winPdf);
    return;
  }
  alert("Plano de ação salvo ✓");
  if(g.ehPlano){ state.gvVista="planos"; if(state.tab==="gravacoes") renderGravacoes(); }
  else { if(state.tab==="gravacoes") renderGravacoes(); abrirGravacao(g.id); }
}

/* ---- Abre o PDF do plano numa aba (imprimir/baixar ficam no visualizador) ---- */
async function abrirPlanoPDF(id, winOpt){
  let win=winOpt||null;
  if(!win){ try{ win=window.open("","_blank"); }catch(e){ win=null; } }
  try{
    const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;});
    if(!g){ if(win&&!win.closed) win.close(); return; }
    const blob=await _gerarAtaPDFBlob(g);
    const url=URL.createObjectURL(blob);
    if(win && !win.closed){ win.location.href=url; }
    else { const a=document.createElement("a"); a.href=url; a.download=((g.titulo||g.nome||"plano-de-acao").replace(/[^\wÀ-ú \-]+/g,"").trim()||"plano-de-acao")+".pdf"; document.body.appendChild(a); a.click(); a.remove(); }
  }catch(e){ if(win&&!win.closed) win.close(); alert("Não consegui gerar o PDF agora ("+(e.message||"")+")."); }
}

/* ---- Envia as ações de uma reunião para o plano do condomínio ---- */
async function enviarAcoesParaPlanoCond(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  if(!g.condominio){ alert("Esta reunião não tem condomínio definido."); return; }
  const acoes=(g.plano||[]).filter(function(a){return (a.acao||"").trim();});
  if(!acoes.length){ alert("Não há ações para enviar."); return; }
  let alvo=(d.list||[]).filter(function(x){return x.ehPlano && x.condominio===g.condominio;}).sort(function(a,b){return (b.ts||0)-(a.ts||0);})[0];
  let criado=false;
  if(!alvo){
    alvo={ id:"pl"+Date.now(), ts:Date.now(), criadoEm:Date.now(), atualizadoEm:Date.now(),
      titulo:"Plano de ação — "+g.condominio, ehPlano:true, categoria:"condominio", condominio:g.condominio,
      area:"", assunto:"", plano:[], anexos:[], participantesList:[], participantes:"", resolvidos:[], tarefas:[],
      autor:(typeof state!=="undefined"&&state.userId)?state.userId:"" };
    d.list.push(alvo); criado=true;
  }
  alvo.plano=(alvo.plano||[]).concat(acoes.map(function(a){return Object.assign({},a);}));
  alvo.atualizadoEm=Date.now();
  await saveGravacoes(d);
  alert("✓ "+acoes.length+" ação(ões) enviadas para: "+alvo.titulo+(criado?" (plano criado agora)":""));
  if(state.tab==="gravacoes") renderGravacoes();
}

/* ---- Visualização do Plano de Ação (documento) ---- */
async function visualizarPlanoDoc(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const local=g.condominio||(g.categoria==="mafra"?(g.area||"Mafra"):(g.categoria==="externa"?(g.assunto||"Externa"):""));
  const dataR=new Date(g.ts).toLocaleDateString("pt-BR");
  const plano=(g.plano||[]);
  const corpo=plano.map(function(a,i){
    const al=_alertaAcao(a);
    return `<div style="border:1px solid #EFEADD;border-radius:12px;padding:13px 15px;margin-bottom:10px">
      <div style="font-weight:800;color:#16243D">${i+1}. ${esc(a.acao||"")} ${al.e||""}</div>
      ${a.como?`<div style="white-space:pre-wrap;color:#444;font-size:13px;margin-top:5px">${esc(a.como)}</div>`:""}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:9px;align-items:center">
        <span class="pl-bdg" style="background:#EEF1F5;color:#5a6472">👤 ${esc(a.responsavel||"—")}</span>
        <span class="pl-bdg" style="background:#EEF1F5;color:#5a6472">${ico('calendario')} ${_fmtPrazoBr(a.prazo)}</span>
        ${_numVal(a.valor)?`<span class="pl-bdg" style="background:#E9F3EC;color:#1c7a3f">💰 ${_fmtBRL(a.valor)}</span>`:""}
        ${_prioBdg(a.prioridade)}
        ${_statBdg(a.status)}
        ${a.categoria?`<span class="pl-bdg" style="background:#F3EFE3;color:#7a6a3a">🗂️ ${esc(a.categoria)}</span>`:""}
        ${a.impacto?`<span class="pl-bdg" style="background:#F3EFE3;color:#7a6a3a">🎯 ${esc(a.impacto)}</span>`:""}
      </div>
      ${a.obs?`<div style="font-size:12px;color:#8A93A3;margin-top:7px">🗒️ ${esc(a.obs)}</div>`:""}
    </div>`;
  }).join("");
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>👁 ${esc(g.titulo||g.nome||"Plano de Ação")}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="gv-meta" style="margin-bottom:8px">🗂️ ${esc(_catLabel(g.categoria)||"")}${local?" — "+esc(local):""} · ${ico('calendario')} ${dataR} · 📋 ${plano.length} ação(ões)</div>
      ${(function(){ var tot=0, porSt={}; plano.forEach(function(a){ var v=_numVal(a.valor); tot+=v; var st=a.status||"Pendente"; porSt[st]=(porSt[st]||0)+v; }); if(!tot) return ""; var partes=Object.keys(porSt).filter(function(k){return porSt[k]>0;}).map(function(k){return esc(k)+": "+_fmtBRL(porSt[k]);}).join("  ·  "); return `<div class="gv-card-badges" style="margin-bottom:12px"><span class="gv-stat ok">💰 Total estimado: ${_fmtBRL(tot)}</span></div>${partes?`<div class="gv-meta" style="margin:-4px 0 12px;font-size:12px">${partes}</div>`:""}`; })()}
      ${corpo||'<div class="ata-empty">Nenhuma ação no plano.</div>'}
      <div class="gv-acts" style="margin-top:14px">
        <button class="btn-ghost" onclick="_gvEditarPlano('${g.id}')">✏️ Editar</button>
        <button class="btn-ghost" onclick="exportarGravacaoWord('${g.id}')">📄 Word</button>
        <button class="btn-gold" onclick="exportarGravacaoPDF('${g.id}')">👁️ Visualizar / Imprimir</button>
        <button class="btn-primary" onclick="closeModal()">Fechar</button>
      </div>
    </div></div></div>`;
}

/* ---- Acompanhamento de uma ação do plano (modal completo) ---- */
async function abrirAcaoPlano(gid, idx){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===gid;}); if(!g) return;
  const a=(g.plano||[])[idx]; if(!a) return;
  const dtP=_parsePrazo(a.prazo);
  const prazoISO=dtP?(dtP.getFullYear()+"-"+("0"+(dtP.getMonth()+1)).slice(-2)+"-"+("0"+dtP.getDate()).slice(-2)):"";
  const local=g.condominio||(g.categoria==="mafra"?(g.area||"Mafra"):(g.categoria==="externa"?(g.assunto||"Externa"):""));
  const dataR=new Date(g.ts).toLocaleDateString("pt-BR");
  const al=_alertaAcao(a);
  function sel(id,lista,atual,vazio){ return `<select id="${id}" class="ata-nome-input">${vazio?`<option value="">—</option>`:""}${lista.map(function(o){return `<option ${o===atual?"selected":""}>${o}</option>`;}).join("")}</select>`; }
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>📋 Ação do plano</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      ${al.e?`<div style="margin-bottom:10px"><span class="gv-stat">${al.e} ${al.t}</span></div>`:""}
      <div class="gv-dethead"><div class="linhas">
        <span>${g.ehPlano?"📋":"🎙️"} <b>${esc(g.titulo||g.nome||"")}</b></span>
        <span>🗂️ ${esc(_catLabel(g.categoria)||"")}${local?" — "+esc(local):""}</span>
        <span>${ico('calendario')} ${dataR}${g.ehPlano?"":" (reunião de origem)"}</span>
        ${(g.participantes||"").trim()?`<span>👥 ${esc(g.participantes)}</span>`:""}
        </div>
        ${!g.ehPlano?`<div class="stats">
          <span class="gv-stat ${(g.ata||"").trim()?"ok":""}">${(g.ata||"").trim()?"✅ Ata vinculada":"○ Sem ata"}</span>
          <span class="gv-stat ${(g.transcricao||"").trim()?"ok":""}">${(g.transcricao||"").trim()?"✅ Transcrição":"○ Sem transcrição"}</span>
          <span class="gv-stat ${((g.audio&&g.audio.url)||g.audioLocal)?"ok":""}">${((g.audio&&g.audio.url)||g.audioLocal)?"✅ Áudio":"○ Sem áudio"}</span>
        </div>`:""}
      </div>
      <div class="ata-sec"><label>✏️ Ação (o que será feito)</label><textarea id="acEdAcao" class="ata-edit-area" style="min-height:70px">${esc(a.acao||"")}</textarea></div>
      <div class="ata-sec"><label>🛠️ Como será feito</label><textarea id="acEdComo" class="ata-edit-area" style="min-height:60px">${esc(a.como||"")}</textarea></div>
      <div class="ata-sec" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div><label>👤 Responsável</label><input id="acEdResp" class="ata-nome-input" value="${esc(a.responsavel||"")}"></div>
        <div><label>${ico('calendario')} Prazo</label><input id="acEdPrazo" type="date" class="ata-nome-input" value="${prazoISO}"></div>
        <div><label>💰 Valor estimado (R$)</label><input id="acEdValor" type="number" min="0" step="0.01" class="ata-nome-input" value="${esc(a.valor||"")}" placeholder="0,00"></div>
        <div><label>⚡ Prioridade</label>${sel("acEdPrio",PLANO_PRIORIDADES,a.prioridade||"Média")}</div>
        <div><label>📌 Status</label>${sel("acEdStatus",PLANO_STATUS,a.status||"Pendente")}</div>
        <div><label>🗂️ Categoria</label>${sel("acEdCat",PLANO_CATEGORIAS,a.categoria||"",true)}</div>
        <div><label>🎯 Impacto</label>${sel("acEdImp",PLANO_IMPACTOS,a.impacto||"",true)}</div>
      </div>
      <div class="ata-sec"><label>🗒️ Observações</label><textarea id="acEdObs" class="ata-edit-area" style="min-height:60px">${esc(a.obs||"")}</textarea></div>
      <div class="gv-acts">
        <button class="btn-ghost" onclick="gvTab='plano';abrirGravacao('${g.id}')">📁 Abrir ${g.ehPlano?"plano completo":"reunião de origem"}</button>
        <button class="btn-del" onclick="excluirAcaoPlano('${g.id}',${idx})">🗑️</button>
        <button class="btn-gold" onclick="salvarAcaoPlano('${g.id}',${idx})">💾 Salvar</button>
      </div>
    </div></div></div>`;
}
async function salvarAcaoPlano(gid, idx){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===gid;}); if(!g) return;
  const a=(g.plano||[])[idx]; if(!a) return;
  a.acao=document.getElementById("acEdAcao").value;
  a.como=document.getElementById("acEdComo").value;
  a.responsavel=document.getElementById("acEdResp").value;
  a.prazo=document.getElementById("acEdPrazo").value||"";
  a.valor=document.getElementById("acEdValor").value||"";
  a.prioridade=document.getElementById("acEdPrio").value;
  a.status=document.getElementById("acEdStatus").value;
  a.categoria=document.getElementById("acEdCat").value;
  a.impacto=document.getElementById("acEdImp").value;
  a.obs=document.getElementById("acEdObs").value;
  g.atualizadoEm=Date.now();
  await saveGravacoes(d);
  closeModal();
  if(state.tab==="gravacoes") renderGravacoes();
}
async function excluirAcaoPlano(gid, idx){
  if(!confirm("Excluir esta ação do plano?")) return;
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===gid;}); if(!g) return;
  (g.plano||[]).splice(idx,1); g.atualizadoEm=Date.now();
  await saveGravacoes(d);
  closeModal();
  if(state.tab==="gravacoes") renderGravacoes();
}

async function renomearGravacaoRapido(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const novo=prompt("Nome da gravação:", g.titulo||g.nome||"");
  if(novo===null) return;
  if(novo.trim()){ g.titulo=novo.trim(); g.atualizadoEm=Date.now(); await saveGravacoes(d); }
  if(state.tab==="gravacoes") renderGravacoes();
}


/* ============================================================
   DETALHE de uma gravação (renomear, ouvir, transcrever,
   WhatsApp, cortar, excluir, exportar)
   ============================================================ */
async function abrirGravacao(id){
  const d=await loadGravacoes(); let g=(d.list||[]).find(function(x){return x.id===id;}); if(!g)return;
  _migraGrav(g);
  const dt=new Date(g.ts);
  const horaStr=("0"+dt.getHours()).slice(-2)+":"+("0"+dt.getMinutes()).slice(-2);
  const dataReuniao=(g.dataReuniao ? g.dataReuniao.split("-").reverse().join("/") : dt.toLocaleDateString("pt-BR"))+" · "+horaStr;
  const st=_statusGrav(g);
  const tipoTxt=_tipoLabel(g.tipo);
  const catTxt=_catLabel(g.categoria);
  const local = g.condominio || (g.categoria==="mafra"?(g.area||""):(g.categoria==="externa"?(g.assunto||""):""));
  const conds=(typeof CONDOMINIOS!=="undefined"?CONDOMINIOS:[]);
  const condEditOpts=`<option value="">Selecione…</option>`+condOptionsAgrupadas(g.condominio,conds);
  const areaEditOpts=`<option value="">Selecione a área…</option>`+ATA_AREAS_MAFRA.map(function(a){return `<option ${a===g.area?"selected":""}>${esc(a)}</option>`;}).join("");
  const tipoEditOpts=`<option value="">Selecione o tipo…</option>`+ATA_TIPOS_REUNIAO.map(function(t){return `<option ${t===g.tipo?"selected":""}>${esc(t)}</option>`;}).join("");
  const cat=g.categoria||"condominio";

  // arrays de trabalho (sobrevivem ao re-render do detalhe)
  if(!gvKeepEdits){
    gvParts = (g.participantesList||[]).map(function(p){return Object.assign({nome:"",cargo:"",empresa:"",email:"",telefone:""},p);});
    gvPlano = (g.plano||[]).map(function(a){return Object.assign(_plNovoItem(),a);});
    gvPlanoEdit=false;
  } else { gvKeepEdits=false; }

  // áudio
  let audioBlock="";
  const audioSrc=await _resolverAudioSrc(g);
  if(audioSrc){
    const dur = g.audioDurMs ? Math.round(g.audioDurMs/60000)+" min aprox." : "";
    audioBlock=`<div class="ata-sec"><label>🎧 Áudio gravado ${g.audioLocal?'<small style="font-weight:400;text-transform:none">(salvo só neste aparelho)</small>':""}</label>
      <audio id="gvAudio" controls src="${audioSrc.src}" style="width:100%"></audio>
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        <button class="btn-ghost" style="flex:1;min-width:120px" onclick="baixarAudioGravacao('${g.id}')">⬇️ Baixar</button>
        <button class="btn-ghost" style="flex:1;min-width:120px" onclick="compartilharWhatsAppAudio('${g.id}')">🎧 WhatsApp</button>
        <button class="btn-ghost" style="flex:1;min-width:120px" onclick="abrirCorte('${g.id}')">✂️ Cortar</button>
      </div>
      ${dur?`<div class="ata-prog">${dur}</div>`:""}</div>`;
  }

  // transcrição editável (mantém versão original)
  const temOriginalDif = g.transcricaoOriginal && g.transcricaoOriginal.trim() && g.transcricaoOriginal.trim()!==(g.transcricao||"").trim();
  const transcBlock = `<div class="ata-sec"><label>📝 Transcrição (editável)</label>
      <textarea id="gvTransc" class="ata-transcript" style="min-height:140px" placeholder="${audioSrc?'Sem transcrição ainda — toque em “Transcrever áudio”.':'Cole ou digite o conteúdo aqui.'}">${esc(g.transcricao||"")}</textarea>
      <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
        <button class="btn-ghost" onclick="salvarTranscricaoEditada('${g.id}')">💾 Salvar transcrição</button>
        ${temOriginalDif?`<button class="btn-ghost" onclick="verTranscricaoOriginal('${g.id}')">👁️ Ver original</button>`:""}
      </div></div>`;

  // ata — se estiver sendo gerada em segundo plano, mostra o progresso (tem prioridade)
  const _gerandoAta = (window._ataJobs && window._ataJobs[id]) ? window._ataJobs[id] : "";
  const ataBlock = _gerandoAta
    ? `<div class="ata-sec"><label>📄 Ata</label>
        <div class="ata-gerando"><div><span class="spin"></span><span id="gvAtaProgMsg">${esc(_gerandoAta)}</span></div>
        <small>Pode fechar esta janela e continuar usando o app — a ata segue sendo gerada e fica pronta sozinha. Volte aqui depois para conferir.</small></div></div>`
    : g.ata
    ? `<div class="ata-sec"><label>📄 Ata${tipoTxt?" — "+esc(tipoTxt):""}</label>
        <div class="book-info">${_ataMdView(g.ata)}</div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <button class="btn-ghost" style="flex:1;min-width:96px" onclick="copiarAta('${g.id}')">📋 Copiar</button>
          <button class="btn-gold" style="flex:1;min-width:96px" onclick="exportarGravacaoPDF('${g.id}')">👁️ Visualizar</button>
          <button class="btn-gold" style="flex:1;min-width:96px" onclick="compartilharAtaWhatsApp('${g.id}')">📲 WhatsApp</button>
          <button class="btn-ghost" style="flex:1;min-width:96px" onclick="exportarGravacaoWord('${g.id}')">📄 Word</button>
          <button class="btn-ghost" style="flex:1;min-width:96px" onclick="gerarAtaDaGravacao('${g.id}')">🔄 Refazer</button>
        </div></div>`
    : `<div class="ata-sec"><label>📄 Ata</label>
        <div class="ata-empty">Ainda não há ata gerada.</div>
        <button class="btn-gold" style="margin-top:8px;width:100%" onclick="gerarAtaDaGravacao('${g.id}')">✨ Gerar ata a partir da transcrição</button></div>`;

  // resumo executivo
  const resumoBlock = (g.resumo||"").trim()
    ? `<div class="ata-sec"><label>🧾 Resumo executivo</label>
        <div class="book-info" style="white-space:pre-wrap">${esc(g.resumo)}</div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          <button class="btn-ghost" style="flex:1" onclick="copiarResumo('${g.id}')">📋 Copiar</button>
          <button class="btn-ghost" style="flex:1" onclick="gerarResumoGravacao('${g.id}')">🔄 Refazer</button>
        </div></div>`
    : `<div class="ata-sec"><label>🧾 Resumo executivo</label>
        <div class="ata-empty">Ainda não gerado.</div>
        <button class="btn-ghost" style="margin-top:8px;width:100%" onclick="gerarResumoGravacao('${g.id}')">🧾 Gerar resumo executivo</button></div>`;

  // plano de ação (tabela editável)
  const planoSalvo=(g.plano||[]).length;
  let planoBlock;
  if(planoSalvo && !gvPlanoEdit){
    // MODO CONSULTA: plano salvo, somente leitura
    planoBlock = `<div class="ata-sec"><label>📋 Plano de ação <span class="gv-bdg ok">salvo ✓</span></label>
      <div class="gv-acttbl-wrap"><table class="gv-acttbl" style="min-width:620px"><thead><tr><th></th><th>Ação / Despesa</th><th>Status</th><th style="text-align:right">Valor</th><th>Responsável</th><th>Prazo</th></tr></thead><tbody>
      ${(g.plano||[]).map(function(a,i){ const al=_alertaAcao(a); return `<tr onclick="abrirPlanoPagina('${g.id}')" title="Clique para editar">
        <td>${al.e}</td>
        <td><div class="ac-tit" style="white-space:pre-wrap">${esc(a.acao||"")}</div>${a.como?`<div class="ac-orig" style="white-space:pre-wrap">${esc(a.como)}</div>`:""}${a.obs?`<div class="ac-orig">📝 ${esc(a.obs)}</div>`:""}</td>
        <td>${_statBdg(a.status)}</td>
        <td style="white-space:nowrap;text-align:right">${_fmtBRL(a.valor)||"—"}</td>
        <td>${esc(a.responsavel||"—")}</td>
        <td>${_fmtPrazoBr(a.prazo)}</td>
      </tr>`;}).join("")}
      </tbody></table></div>
      <button class="btn-gold" style="width:100%;margin-top:12px;padding:13px;font-size:14.5px" onclick="_gvEditarPlano('${g.id}')">✏️ Editar Plano de Ação</button>
      ${(!g.ehPlano && g.condominio)?`<button class="btn-ghost" style="width:100%;margin-top:8px;padding:11px" onclick="enviarAcoesParaPlanoCond('${g.id}')">📤 Enviar ações ao plano do condomínio</button>`:""}</div>`;
  } else {
    // VAZIO
    planoBlock = `<div class="ata-sec"><label>📋 Plano de ação</label>
        <div class="ata-empty">Ainda não há ações neste plano.</div>
        <div class="plano-acts">
          <button class="btn-gold" style="flex:1" onclick="gerarPlanoGravacao('${g.id}')">✨ Gerar plano de ação com IA</button>
          <button class="btn-ghost" onclick="abrirPlanoPagina('${g.id}')">➕ Criar manualmente</button>
        </div></div>`;
  }

  // anexos
  const anexosBlock = `<div class="ata-sec"><label>📎 Anexos</label>
      <div id="gvAnexos">${_anexosHTML(g)}</div>
      <label class="btn-ghost" style="margin-top:6px;display:inline-block;cursor:pointer">📎 Anexar arquivo
        <input type="file" style="display:none" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp" onchange="anexarArquivo('${g.id}',event)">
      </label>
      <div id="gvAnexoProg" class="ata-prog" style="display:none"></div></div>`;

  // marcadores de "tem conteúdo" nas abas
  const dot = '<span class="bolinha"></span>';
  const temTransc = (g.transcricao||"").trim()? dot : "";
  const temAta = (g.ata||"").trim()? dot : "";
  const temResumo = (g.resumo||"").trim()? dot : "";
  const temPlano = (g.plano||[]).length? dot : "";
  const temAnexos = (g.anexos||[]).length? dot : "";
  let tabAtual = (gvTab==="info"?"resumo":(gvTab||"resumo"));
  if(g.ehPlano && ["decisoes","ata","transc","audio"].includes(tabAtual)) tabAtual="plano";
  function painel(nome, conteudo){ return `<div class="gvtab" data-tab="${nome}" style="${nome===tabAtual?"":"display:none"}">${conteudo}</div>`; }

  const infoBlock = `
    <div class="ata-sec"><label>📝 Nome da gravação</label>
      <input type="text" id="gvNome" class="ata-nome-input" value="${esc(g.titulo||g.nome||"")}" placeholder="Dê um nome para saber do que se trata…">
      <button class="btn-ghost" style="margin-top:6px" onclick="renomearGravacao('${g.id}')">💾 Salvar nome</button>
    </div>
    <div class="ata-sec"><label>🗂️ Categoria e tipo</label>
      <select id="gvCategoria" class="ata-nome-input" onchange="_gvToggleCat()">
        <option value="condominio" ${cat==="condominio"?"selected":""}>Condomínio</option>
        <option value="mafra" ${cat==="mafra"?"selected":""}>Mafra Gestão Integrada</option>
        <option value="externa" ${cat==="externa"?"selected":""}>Externa / Outros Assuntos</option>
      </select>
      <div id="gvCondRow" style="margin-top:8px;${cat==="condominio"?"":"display:none"}"><select id="gvCond" class="ata-nome-input">${condEditOpts}</select></div>
      <div id="gvMafraRow" style="margin-top:8px;${cat==="mafra"?"":"display:none"}"><select id="gvArea" class="ata-nome-input">${areaEditOpts}</select></div>
      <div id="gvExtRow" style="margin-top:8px;${cat==="externa"?"":"display:none"}"><input id="gvAssunto" class="ata-nome-input" placeholder="Assunto / referência" value="${esc(g.assunto||"")}"></div>
      <select id="gvTipo" class="ata-nome-input" style="margin-top:8px">${tipoEditOpts}</select>
      <button class="btn-ghost" style="margin-top:6px" onclick="salvarClassificacao('${g.id}')">💾 Salvar classificação</button>
    </div>
    <div class="ata-sec"><label>👥 Participantes</label>
      <div id="gvPartList">${_partRowsHTML(gvParts, g.id)}</div>
      <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
        <button class="btn-ghost" onclick="_gvAddPart('${g.id}')">➕ Adicionar participante</button>
        <button class="btn-gold" onclick="salvarParticipantesGravacao('${g.id}')">💾 Salvar participantes</button>
      </div>
    </div>`;

  const audioTab = (audioBlock||`<div class="ata-empty">Esta gravação não tem áudio anexado.</div>`)
      + `<div id="gvCorteMount"></div>`;

  const transcTab = transcBlock
      + `<div style="margin-top:8px"><button class="btn-ghost" onclick="transcreverGravacao('${g.id}')">📝 Transcrever áudio (de novo)</button></div>`
      + `<div id="gvTranscProg" class="ata-prog" style="display:none"></div>`;

  const ataTab = ataBlock + `<div id="gvAtaProg" class="ata-prog" style="display:none"></div>`;
  const decisoesTab = (g.resolvidos&&g.resolvidos.length)
    ? `<div class="ata-sec"><label>✅ Decisões / o que ficou resolvido</label><ul class="ata-ul">${g.resolvidos.map(function(x){return `<li>${esc(x)}</li>`;}).join("")}</ul></div>`
    : `<div class="ata-empty">Nenhuma decisão registrada ainda. Gere a ata — as decisões são identificadas automaticamente.</div>`;
  const resumoTab = infoBlock + resumoBlock + `<div id="gvResumoProg" class="ata-prog" style="display:none"></div>`;
  const planoTab = planoBlock + (g.ehPlano?`<button class="btn-ghost" style="width:100%;margin-top:10px;padding:12px" onclick="exportarGravacaoPDF('${g.id}')">👁️ Visualizar / Imprimir</button>`:"") + `<div id="gvPlanoProg" class="ata-prog" style="display:none"></div>`;

  try{ window._gravAbertaId=id; }catch(e){}
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal">
    <div class="modal-head"><h3>${g.ehPlano?"📋 Plano de Ação":"Reunião"}</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="gv-dethead">
        <div class="linhas">
          <span style="font-size:16px;font-weight:800;color:#16243D">${g.ehPlano?"📋":(g.origem?"✂️":"🎙️")} ${esc(g.titulo||g.nome||"Reunião")}</span>
          <span>${ico('calendario')} ${dataReuniao}</span>
          ${local?`<span>${ico('predio')} ${esc(local)}</span>`:""}
          ${catTxt?`<span>🗂️ ${esc(catTxt)}${tipoTxt?` · ${esc(tipoTxt)}`:""}</span>`:(tipoTxt?`<span>🏷️ ${esc(tipoTxt)}</span>`:"")}
          ${(gvParts.length||((g.participantes||"").trim()))?`<span>👥 ${gvParts.length||g.participantes.split(/[;,]/).filter(function(x){return x.trim();}).length} participante(s)</span>`:""}
          ${g.audioDurMs?`<span>⏱️ ${_durHM(g.audioDurMs)}</span>`:""}
        </div>
        <div class="stats">
          ${g.ehPlano?`<span class="gv-stat ok">📋 Plano (${(g.plano||[]).length})</span><span class="gv-stat ${(g.anexos||[]).length?"ok":""}">📎 ${(g.anexos||[]).length} anexo(s)</span>`:`<span class="gv-stat ${(g.ata||"").trim()?"ok":""}">${(g.ata||"").trim()?"✅":"○"} Ata ${(g.ata||"").trim()?"gerada":"pendente"}</span>
          <span class="gv-stat ${(g.transcricao||"").trim()?"ok":""}">${(g.transcricao||"").trim()?"✅":"○"} Transcrição ${(g.transcricao||"").trim()?"gerada":"pendente"}</span>
          <span class="gv-stat ${((g.audio&&g.audio.url)||g.audioLocal)?"ok":""}">${((g.audio&&g.audio.url)||g.audioLocal)?"✅":"○"} Áudio ${(g.audio&&g.audio.url)?"salvo":(g.audioLocal?"neste aparelho":"ausente")}</span>
          ${(g.plano||[]).length?`<span class="gv-stat ok">📋 Plano (${(g.plano||[]).length})</span>`:""}
`}
        </div>
      </div>

      <div class="gv-tabbar">
        <button class="gv-tabbtn ${tabAtual==="resumo"||tabAtual==="info"?"on":""}" data-tab="resumo" onclick="_gvShowTab('resumo')">📋 ${g.ehPlano?"Dados":"Resumo"}</button>
        ${g.ehPlano?"":`<button class="gv-tabbtn ${tabAtual==="decisoes"?"on":""}" data-tab="decisoes" onclick="_gvShowTab('decisoes')">✅ Decisões${(g.resolvidos||[]).length?dot:""}</button>`}
        <button class="gv-tabbtn ${tabAtual==="plano"?"on":""}" data-tab="plano" onclick="_gvShowTab('plano')">📋 Plano${(g.plano||[]).length?dot:""}</button>
        ${g.ehPlano?"":`<button class="gv-tabbtn ${tabAtual==="ata"?"on":""}" data-tab="ata" onclick="_gvShowTab('ata')">📄 Ata${temAta}</button>`}
        ${g.ehPlano?"":`<button class="gv-tabbtn ${tabAtual==="transc"?"on":""}" data-tab="transc" onclick="_gvShowTab('transc')">📝 Transcrição${temTransc}</button>`}
        ${g.ehPlano?"":`<button class="gv-tabbtn ${tabAtual==="audio"?"on":""}" data-tab="audio" onclick="_gvShowTab('audio')">🎧 Áudio</button>`}
        <button class="gv-tabbtn ${tabAtual==="anexos"?"on":""}" data-tab="anexos" onclick="_gvShowTab('anexos')">📎 Anexos${temAnexos}</button>
      </div>

      ${painel("resumo", resumoTab)}
      ${g.ehPlano?"":painel("decisoes", decisoesTab)}
      ${painel("plano", planoTab)}
      ${g.ehPlano?"":painel("ata", ataTab)}
      ${g.ehPlano?"":painel("transc", transcTab)}
      ${g.ehPlano?"":painel("audio", audioTab)}
      ${painel("anexos", anexosBlock)}

      <div class="gv-acts" style="margin-top:6px">
        <button class="btn-del" onclick="delGravacao('${g.id}')">🗑️ Excluir</button>
        <button class="btn-primary" onclick="closeModal()">Fechar</button>
      </div>
    </div></div></div>`;
}

/* alterna entre as abas internas do painel da gravação */
function _gvShowTab(n){
  gvTab=n;
  var ps=document.querySelectorAll(".gvtab");
  for(var i=0;i<ps.length;i++){ ps[i].style.display = (ps[i].getAttribute("data-tab")===n)?"":"none"; }
  var bs=document.querySelectorAll(".gv-tabbtn");
  for(var j=0;j<bs.length;j++){ bs[j].classList.toggle("on", bs[j].getAttribute("data-tab")===n); }
}

/* ---- Classificação ---- */
function _gvToggleCat(){
  const c=document.getElementById("gvCategoria").value;
  const cond=document.getElementById("gvCondRow"); if(cond) cond.style.display=(c==="condominio")?"":"none";
  const maf=document.getElementById("gvMafraRow"); if(maf) maf.style.display=(c==="mafra")?"":"none";
  const ext=document.getElementById("gvExtRow"); if(ext) ext.style.display=(c==="externa")?"":"none";
}
async function salvarClassificacao(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const c=document.getElementById("gvCategoria").value;
  g.categoria=c;
  g.condominio=(c==="condominio")?(document.getElementById("gvCond").value||""):"";
  g.area=(c==="mafra")?(document.getElementById("gvArea").value||""):"";
  g.assunto=(c==="externa")?(document.getElementById("gvAssunto").value||""):"";
  g.tipo=document.getElementById("gvTipo").value||"";
  g.atualizadoEm=Date.now();
  await saveGravacoes(d);
  alert("Classificação salva ✓");
  abrirGravacao(id);
  if(state.tab==="gravacoes") renderGravacoes();
}

/* ---- Participantes (detalhe) ---- */
function _gvAddPart(id){ gvParts=gvParts||[]; gvParts.push({nome:"",cargo:"",empresa:"",email:"",telefone:""}); gvTab="resumo"; gvKeepEdits=true; abrirGravacao(id); }
function _gvDelPart(id,i){ (gvParts||[]).splice(i,1); gvTab="resumo"; gvKeepEdits=true; abrirGravacao(id); }

/* ---- Plano de ação (tabela editável) ---- */
function _planoTblHTML(id){
  const prio=PLANO_PRIORIDADES;
  const sts=PLANO_STATUS;
  return `<div class="plano-wrap"><table class="plano-tbl"><thead><tr><th style="min-width:220px">Ação</th><th>Responsável</th><th>Prazo</th><th>Prioridade</th><th>Status</th><th></th></tr></thead><tbody>`
    + gvPlano.map(function(a,i){
        return `<tr>
          <td><input id="plAcao_${i}" placeholder="Descreva o que deve ser feito…" value="${esc(a.acao||"")}" oninput="gvPlano[${i}].acao=this.value" onkeydown="if(event.key==='Enter'){event.preventDefault();_gvEnterAcao('${id}',${i});}"></td>
          <td><input placeholder="Quem executa" value="${esc(a.responsavel||"")}" oninput="gvPlano[${i}].responsavel=this.value"></td>
          <td><input placeholder="dd/mm/aaaa" style="min-width:96px" value="${esc(a.prazo||"")}" oninput="gvPlano[${i}].prazo=this.value"></td>
          <td><select onchange="gvPlano[${i}].prioridade=this.value">${prio.map(function(p){return `<option ${p===(a.prioridade||"Média")?"selected":""}>${p}</option>`;}).join("")}</select></td>
          <td><select onchange="gvPlano[${i}].status=this.value">${sts.map(function(p){return `<option ${p===(a.status||"Pendente")?"selected":""}>${p}</option>`;}).join("")}</select></td>
          <td><button class="pl-x" title="Remover ação" onclick="_gvDelAcao('${id}',${i})">×</button></td>
        </tr>`;
      }).join("")
    + `</tbody></table></div>`;
}
function _gvEditarPlano(id){ abrirPlanoPagina(id); }
function _gvAddAcao(id){ gvPlanoEdit=true; gvPlano=gvPlano||[]; gvPlano.push({acao:"",responsavel:"",prazo:"",prioridade:"Média",status:"Pendente",categoria:"",impacto:"",obs:""}); gvTab="plano"; gvKeepEdits=true; abrirGravacao(id); setTimeout(function(){ var el=document.getElementById("plAcao_"+(gvPlano.length-1)); if(el) el.focus(); },80); }
/* Enter no campo Ação: pula para a próxima linha (cria uma nova se for a última) */
function _gvEnterAcao(id,i){
  gvPlanoEdit=true;
  if(i>=gvPlano.length-1){ gvPlano.push({acao:"",responsavel:"",prazo:"",prioridade:"Média",status:"Pendente",categoria:"",impacto:"",obs:""}); }
  gvTab="plano"; gvKeepEdits=true; abrirGravacao(id);
  setTimeout(function(){ var el=document.getElementById("plAcao_"+(i+1)); if(el) el.focus(); },80);
}
function _gvDelAcao(id,i){ (gvPlano||[]).splice(i,1); gvTab="plano"; gvKeepEdits=true; abrirGravacao(id); }
async function salvarPlano(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const acoes=(gvPlano||[]).filter(function(a){return (a.acao||"").trim();});
  if(!acoes.length){ alert("Escreva pelo menos uma ação antes de salvar."); return; }
  g.plano=acoes;
  g.rascunho=false;
  g.atualizadoEm=Date.now();
  await saveGravacoes(d);
  if(state.tab==="gravacoes") renderGravacoes();
  alert("Plano de ação salvo ✓");
  gvPlanoEdit=false;
  gvTab="plano";
  abrirGravacao(id);
}
/* salva como rascunho: guarda tudo (até linhas incompletas) e marca 📝 Rascunho */
async function salvarPlanoRascunho(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  g.plano=(gvPlano||[]).slice();
  g.rascunho=true;
  g.atualizadoEm=Date.now();
  await saveGravacoes(d);
  alert("Rascunho salvo 📝\nVocê pode continuar depois — ele fica marcado como rascunho até você clicar em ✓ Salvar plano.");
  gvTab="plano";
  abrirGravacao(id);
}

/* ---- Transcrição editável ---- */
async function salvarTranscricaoEditada(id){
  const ta=document.getElementById("gvTransc"); if(!ta) return;
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  if(!g.transcricaoOriginal && (g.transcricao||"").trim()) g.transcricaoOriginal=g.transcricao; // guarda original na 1ª edição
  g.transcricao=ta.value;
  g.status=_statusGrav(g).k; g.atualizadoEm=Date.now();
  await saveGravacoes(d);
  alert("Transcrição salva ✓");
  if(state.tab==="gravacoes") renderGravacoes();
}
async function verTranscricaoOriginal(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  alert("TRANSCRIÇÃO ORIGINAL (antes das edições):\n\n"+(g.transcricaoOriginal||"(vazia)"));
}

/* ---- Anexos ---- */
function _anexosHTML(g){
  const ax=g.anexos||[];
  if(!ax.length) return `<div class="ata-empty">Nenhum anexo.</div>`;
  return ax.map(function(a,i){
    return `<div class="anexo-row"><span class="anx-nome">📄 ${esc(a.nome||"arquivo")}</span>
      ${a.url?`<a class="btn-ghost" href="${a.url}" target="_blank" rel="noopener" style="padding:4px 10px">⬇️</a>`:""}
      <button class="part-x" onclick="removerAnexo('${g.id}',${i})">×</button></div>`;
  }).join("");
}
async function anexarArquivo(id, ev){
  const f=ev.target.files && ev.target.files[0]; if(!f) return; ev.target.value="";
  const prog=document.getElementById("gvAnexoProg");
  if(f.size>25*1024*1024){ if(prog){prog.style.display="block";prog.textContent="Arquivo acima de 25 MB. Use um menor.";} return; }
  if(prog){ prog.style.display="block"; prog.textContent="⬆️ Enviando anexo…"; }
  if(!_sbStorageDisponivel()){ if(prog) prog.textContent="Anexos exigem o Storage do Supabase configurado."; return; }
  try{
    const safe=(f.name||"arquivo").replace(/[^a-zA-Z0-9._-]+/g,"_");
    const path=(state.userId||"anon")+"/anexos/"+id+"/"+Date.now()+"_"+safe;
    const up=await SB.storage.from(ATA_BUCKET).upload(path, f, {contentType:f.type||"application/octet-stream", upsert:true});
    if(up && up.error){ if(prog) prog.textContent="Falha ao enviar: "+up.error.message; return; }
    const pub=SB.storage.from(ATA_BUCKET).getPublicUrl(path);
    const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
    g.anexos=g.anexos||[]; g.anexos.push({nome:f.name, path:path, url:(pub&&pub.data?pub.data.publicUrl:null), mime:f.type||"", bytes:f.size});
    g.atualizadoEm=Date.now();
    await saveGravacoes(d);
    if(prog) prog.style.display="none";
    gvTab="anexos";
    abrirGravacao(id);
  }catch(e){ if(prog) prog.textContent="Não consegui enviar o anexo agora."; }
}
async function removerAnexo(id, idx){
  if(!confirm("Remover este anexo?")) return;
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const a=(g.anexos||[])[idx];
  if(a && a.path) await _apagarAudioStorage(a.path); // mesmo bucket
  (g.anexos||[]).splice(idx,1); g.atualizadoEm=Date.now();
  await saveGravacoes(d);
  gvTab="anexos";
  abrirGravacao(id);
}

/* ---- Resumo executivo (IA) ---- */
async function gerarResumoGravacao(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const base=(g.transcricao||g.ata||"").trim();
  if(!base){ alert("Transcreva o áudio (ou cole o texto) antes de gerar o resumo."); return; }
  const prog=document.getElementById("gvResumoProg");
  if(prog){ prog.style.display="block"; prog.textContent="🧾 Gerando resumo executivo…"; }
  const prompt=`Você é assistente da Mafra Gestão Integrada. A partir do conteúdo da reunião abaixo, gere um RESUMO EXECUTIVO profissional em português do Brasil, com estas seções em *negrito* (entre asteriscos), cada uma com tópicos curtos:
*Principais assuntos discutidos*
*Decisões tomadas*
*Riscos identificados*
*Pendências*
*Próximos passos*
Seja objetivo e fiel ao conteúdo; se uma seção não tiver itens, escreva "Nenhum identificado". Tipo de reunião: ${g.tipo||"não informado"}.
Conteúdo:
"""${base}"""`;
  try{
    const txt=await chamarIA(prompt, 3000);
    g.resumo=(txt||"").trim(); g.atualizadoEm=Date.now();
    await saveGravacoes(d);
    if(prog) prog.textContent="✓ Resumo gerado.";
    gvTab="resumo";
    abrirGravacao(id);
    if(state.tab==="gravacoes") renderGravacoes();
  }catch(e){ if(prog) prog.textContent="Não consegui gerar o resumo agora ("+(e.message||"")+")."; }
}

/* ---- Plano de ação (IA) ---- */
async function gerarPlanoGravacao(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const base=(g.transcricao||g.ata||"").trim();
  if(!base){ alert("Transcreva o áudio (ou cole o texto) antes de gerar o plano."); return; }
  const prog=document.getElementById("gvPlanoProg");
  if(prog){ prog.style.display="block"; prog.textContent="📋 Montando o plano de ação…"; }
  const prompt=`A partir do conteúdo da reunião abaixo, identifique as AÇÕES/ENCAMINHAMENTOS. Responda APENAS com um array JSON válido (sem markdown), no formato:
[{"acao":"o que fazer","como":"como será executado (passos resumidos)","responsavel":"nome citado ou vazio","prazo":"data citada (dd/mm/aaaa) ou vazio","prioridade":"Baixa|Média|Alta|Crítica","status":"Não iniciado|Em andamento|Aguardando recursos|Finalizado","categoria":"Financeiro|Operacional|Jurídico|Manutenção|Obras|Segurança|Comunicação|Administrativo|Comercial|Outros","impacto":"Financeiro|Operacional|Jurídico|Segurança|Comunicação|Estratégico"}]. Identifique TODAS as decisões tomadas, pendências, compromissos assumidos, responsáveis mencionados e prazos mencionados
Use "Média" quando a prioridade não estiver clara. Não invente ações que não estão no conteúdo. Se não houver ações, responda []. Dentro das strings do JSON, escape aspas internas com \\" e use \\n para quebras de linha (nunca quebras reais).
Conteúdo:
"""${base}"""`;
  try{
    const arr=await _iaGerarJSON(prompt, 6000, "[");
    g.plano=Array.isArray(arr)?arr.map(function(x){return {acao:x.acao||"",como:x.como||"",responsavel:x.responsavel||"",prazo:x.prazo||"",prioridade:x.prioridade||"Média",status:_migStatus(x.status),categoria:x.categoria||"",impacto:x.impacto||"",obs:x.obs||""};}):[];
    g.atualizadoEm=Date.now();
    await saveGravacoes(d);
    if(prog) prog.textContent="✓ Plano de ação gerado. Revise e salve.";
    abrirPlanoPagina(id);
    if(state.tab==="gravacoes") renderGravacoes();
  }catch(e){ if(prog) prog.textContent="Não consegui montar o plano agora ("+(e.message||"")+")."; }
}

/* ---- Copiar texto genérico ---- */
async function copiarResumo(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  copiarTexto(g.resumo||"");
}
async function copiarTexto(t){
  t=t||"";
  try{ await navigator.clipboard.writeText(t); alert("Copiado ✓"); return; }catch(e){}
  try{ const ta=document.createElement("textarea"); ta.value=t; ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); alert("Copiado ✓"); }
  catch(e){ alert("Não consegui copiar automaticamente."); }
}

async function baixarAudioGravacao(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const blob=await _obterAudioBlob(g);
  if(!blob){ alert("Não encontrei o áudio desta gravação."); return; }
  const ext=g.audioExt || ((blob.type||"").includes("mp4")?"m4a":(blob.type||"").includes("ogg")?"ogg":(blob.type||"").includes("wav")?"wav":"webm");
  const nome=(g.titulo||g.nome||"gravacao").replace(/[^a-zA-Z0-9]+/g,"_")+"."+ext;
  try{
    const a=document.createElement("a"); const u=URL.createObjectURL(blob);
    a.href=u; a.download=nome; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(u); }, 3000);
  }catch(e){ alert("Não consegui baixar o áudio agora."); }
}

async function copiarAta(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const t=(g.ata||g.transcricao||"").trim();
  if(!t){ alert("Não há ata para copiar."); return; }
  try{ await navigator.clipboard.writeText(t); alert("Ata copiada ✓"); return; }
  catch(e){}
  try{
    const ta=document.createElement("textarea"); ta.value=t;
    ta.style.position="fixed"; ta.style.opacity="0"; document.body.appendChild(ta);
    ta.focus(); ta.select(); document.execCommand("copy"); ta.remove();
    alert("Ata copiada ✓");
  }catch(e){ alert("Não consegui copiar automaticamente. Selecione o texto da ata e copie manualmente."); }
}

async function gerarAtaDaGravacao(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const base=(g.transcricao||g.ata||"").trim();
  if(!base){ alert("Primeiro toque em \u201c\ud83d\udcdd Transcrever \u00e1udio\u201d (ou cole/edite o texto). Depois gere a ata."); return; }
  if(window._ataJobs && window._ataJobs[id]){ alert("A ata desta reuni\u00e3o j\u00e1 est\u00e1 sendo gerada. Pode fechar e voltar depois \u2014 ela fica pronta sozinha."); return; }
  window._ataJobs = window._ataJobs || {};
  window._ataJobs[id] = "\u2728 Planejando a estrutura da ata\u2026";
  function setP(t){
    if(window._ataJobs && window._ataJobs[id]!==undefined) window._ataJobs[id]=t;
    var m=document.getElementById("gvAtaProgMsg"); if(m) m.textContent=t;
    var p=document.getElementById("gvAtaProg"); if(p){ p.style.display="block"; p.textContent=t; }
  }
  if(window._gravAbertaId===id){ gvTab="ata"; abrirGravacao(id); }
  if(state.tab==="gravacoes"){ try{ renderGravacoes(); }catch(e){} }
  setP("\u2728 Planejando a estrutura da ata\u2026");
  const tipoCtx=g.tipo?(" Tipo de reuni\u00e3o: "+g.tipo+"."):"";
  const limpa=function(s){ return String(s||"").replace(/^```[a-z]*\n?|```$/g,"").trim(); };
  try{
    // ===== PASSO 1 — abertura + lista de se\u00e7\u00f5es (assuntos/condom\u00ednios) =====
    let plano=null;
    try{
      plano = await _iaGerarJSON(
        "Voc\u00ea \u00e9 secret\u00e1rio executivo da Mafra Gest\u00e3o Integrada (gest\u00e3o condominial profissional)."+tipoCtx+" Analise a transcri\u00e7\u00e3o e PLANEJE a ata.\n"
        + "Responda APENAS um objeto JSON v\u00e1lido: {\"abertura\":\"um par\u00e1grafo situando a reuni\u00e3o (formato, participantes e objetivo)\",\"secoes\":[\"T\u00edtulo da se\u00e7\u00e3o 1\",\"T\u00edtulo da se\u00e7\u00e3o 2\"]}.\n"
        + "Identifique TODOS os assuntos, condom\u00ednios/empreendimentos e temas tratados; cada um vira uma se\u00e7\u00e3o, na ordem em que aparecem; seja granular e abrangente (em geral de 4 a 14 se\u00e7\u00f5es). N\u00c3O inclua \u201cAbertura\u201d, \u201cEncerramento\u201d nem \u201cEncaminhamentos\u201d na lista. Dentro das strings, escape aspas com \\\" e use \\n no lugar de quebras reais.\n"
        + "Transcri\u00e7\u00e3o:\n\"\"\"" + base + "\"\"\"",
        3000, "{");
    }catch(e){ plano=null; }
    let titulos = (plano && Array.isArray(plano.secoes)) ? plano.secoes.filter(Boolean).map(function(s){return String(s).trim();}).filter(Boolean).slice(0,14) : [];
    const abertura = (plano && plano.abertura) ? String(plano.abertura).trim() : "";

    let md="";
    if(titulos.length){
      // ===== PASSO 2 — detalhar CADA se\u00e7\u00e3o numa chamada pr\u00f3pria (cabe no limite e sai minuciosa) =====
      md += "## Abertura\n" + (abertura || "Reuni\u00e3o realizada conforme registro, com revis\u00e3o das pautas em aberto e defini\u00e7\u00e3o dos encaminhamentos.") + "\n\n";
      for(let i=0;i<titulos.length;i++){
        const titulo=titulos[i];
        setP("\u270d\ufe0f Detalhando se\u00e7\u00e3o "+(i+1)+" de "+titulos.length+"\u2026");
        let secMd="";
        try{
          secMd = await _iaGerarTextoLongo(
            "Voc\u00ea \u00e9 secret\u00e1rio executivo da Mafra Gest\u00e3o Integrada. Escreva, EM DETALHE, a se\u00e7\u00e3o \""+titulo+"\" da ata desta reuni\u00e3o, em portugu\u00eas do Brasil.\n"
            + "Use markdown: itens iniciados por \"- \"; quando o item tratar de um tema, comece com um R\u00d3TULO em negrito e dois-pontos (ex.: \"- **Delibera\u00e7\u00e3o:** ...\"). Use \"### Subt\u00edtulo\" se a se\u00e7\u00e3o tiver frentes distintas.\n"
            + "Seja MINUCIOSO: descreva contexto, delibera\u00e7\u00e3o, respons\u00e1veis e prazos de cada ponto; preserve nomes, valores, condi\u00e7\u00f5es e nuances. Baseie-se SOMENTE na transcri\u00e7\u00e3o; marque \"(a confirmar)\" o que n\u00e3o estiver claro; n\u00e3o invente.\n"
            + "N\u00c3O repita o t\u00edtulo da se\u00e7\u00e3o e N\u00c3O escreva outras se\u00e7\u00f5es. Responda somente o conte\u00fado desta se\u00e7\u00e3o.\n"
            + "Transcri\u00e7\u00e3o:\n\"\"\"" + base + "\"\"\"",
            3000);
        }catch(e){ secMd=""; }
        secMd=limpa(secMd);
        // rebaixa qualquer t\u00edtulo grande do conte\u00fado para subt\u00edtulo (mant\u00e9m a numera\u00e7\u00e3o externa)
        secMd=secMd.replace(/^#{2,6}\s+/gm,"### ");
        // remove t\u00edtulo repetido logo na 1\u00aa linha
        secMd=secMd.replace(/^#{1,6}\s+.*\n/, function(m){ return /##\s/.test(m)?"":m; });
        md += "## "+titulo+"\n" + (secMd || "- (a confirmar)") + "\n\n";
      }
      md += "## Encerramento\nNada mais havendo a tratar, encerrou-se a reuni\u00e3o. Os encaminhamentos ser\u00e3o acompanhados nas tratativas seguintes.\n";
    } else {
      // ===== FALLBACK: uma \u00fanica chamada detalhada (se o planejamento falhar) =====
      setP("\u2728 Redigindo a ata detalhada\u2026");
      const promptAta = "Voc\u00ea \u00e9 um secret\u00e1rio executivo experiente da Mafra Gest\u00e3o Integrada."+tipoCtx+" A partir da transcri\u00e7\u00e3o abaixo, redija uma ATA PROFISSIONAL, DETALHADA e fiel ao conte\u00fado.\n"
        + "FORMATO (markdown): comece com \"## Abertura\" (um par\u00e1grafo); organize em se\u00e7\u00f5es \"## T\u00edtulo\" por assunto/condom\u00ednio; use \"### Subt\u00edtulo\" quando denso; itens \"- \" com R\u00d3TULO em negrito e dois-pontos quando aplic\u00e1vel. Seja MINUCIOSO (contexto, delibera\u00e7\u00e3o, respons\u00e1veis, prazos); marque \"(a confirmar)\"; n\u00e3o invente; termine com \"## Encerramento\". N\u00c3O escreva tabela de encaminhamentos. Responda s\u00f3 a ata em markdown.\n"
        + "Transcri\u00e7\u00e3o:\n\"\"\"" + base + "\"\"\"";
      md = limpa(await _iaGerarTextoLongo(promptAta, 8000));
    }

    g.ata = md || g.ata || "";
    g.status=_statusGrav(g).k;
    await saveGravacoes(d);
    setP("\u2713 Ata redigida. Levantando decis\u00f5es e encaminhamentos\u2026");

    // ===== Decis\u00f5es + Quadro de Encaminhamentos (JSON curto) =====
    try{
      const promptE = "A partir da reuni\u00e3o abaixo, gere dois conjuntos:\n"
        + "1) \"resolvidos\": as principais DECIS\u00d5ES/pontos fechados (frases objetivas).\n"
        + "2) \"encaminhamentos\": TODAS as a\u00e7\u00f5es a executar, cada uma com respons\u00e1vel e prazo (use \"Imediato\", \"Hoje\", \"Esta semana\", \"Em andamento\", datas etc., conforme citado; vazio se n\u00e3o houver).\n"
        + "Responda APENAS um objeto JSON v\u00e1lido (sem markdown): {\"resolvidos\":[\"...\"],\"encaminhamentos\":[{\"acao\":\"...\",\"responsavel\":\"...\",\"prazo\":\"...\"}]}. N\u00e3o invente. Dentro das strings, escape aspas com \\\" e use \\n no lugar de quebras reais.\n"
        + "Reuni\u00e3o:\n\"\"\"" + base + "\"\"\"";
      const obj = await _iaGerarJSON(promptE, 4000, "{");
      g.resolvidos = Array.isArray(obj.resolvidos)?obj.resolvidos:(g.resolvidos||[]);
      const enc = Array.isArray(obj.encaminhamentos)?obj.encaminhamentos:[];
      g.tarefas = enc.map(function(e){ return {titulo:String(e.acao||e.titulo||""), responsavel:e.responsavel||"", prazo:e.prazo||""}; }).filter(function(t){return (t.titulo||"").trim();});
      await saveGravacoes(d);
    }catch(e2){ /* ata j\u00e1 salva */ }

    delete window._ataJobs[id];
    if(window._gravAbertaId===id){ gvTab="ata"; abrirGravacao(id); }
    else { _toast("\u2705 Ata de \u201c"+esc(g.titulo||g.nome||"reuni\u00e3o")+"\u201d est\u00e1 pronta."); }
    if(state.tab==="gravacoes"){ try{ renderGravacoes(); }catch(e){} }
  }catch(e){
    delete window._ataJobs[id];
    if(window._gravAbertaId===id){ var p=document.getElementById("gvAtaProg"); if(p){ p.style.display="block"; p.textContent="N\u00e3o consegui gerar a ata agora ("+(e.message||"")+"). Tente de novo."; } else { gvTab="ata"; abrirGravacao(id); } }
    else { _toast("\u26a0\ufe0f N\u00e3o consegui gerar a ata de \u201c"+esc(g.titulo||g.nome||"reuni\u00e3o")+"\u201d. Abra a reuni\u00e3o e tente de novo."); }
    if(state.tab==="gravacoes"){ try{ renderGravacoes(); }catch(e2){} }
  }
}

async function renomearGravacao(id){
  const inp=document.getElementById("gvNome"); if(!inp) return;
  const nome=(inp.value||"").trim(); if(!nome){ alert("Digite um nome."); return; }
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  g.titulo=nome; g.nome=nome;
  await saveGravacoes(d);
  alert("Nome salvo ✓");
  abrirGravacao(id);
  if(state.tab==="gravacoes") renderGravacoes();
}

async function salvarParticipantesGravacao(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const plist=(gvParts||[]).filter(function(p){return p && (p.nome||"").trim();});
  g.participantesList=plist;
  g.participantes=_partsToStr(plist);
  g.atualizadoEm=Date.now();
  await saveGravacoes(d);
  alert("Participantes salvos ✓");
  if(state.tab==="gravacoes") renderGravacoes();
}

async function transcreverGravacao(id){
  const prog=document.getElementById("gvTranscProg");
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  if(prog){ prog.style.display="block"; prog.textContent="⬇️ Buscando o áudio…"; }
  const blob=await _obterAudioBlob(g);
  if(!blob){ if(prog){prog.textContent="Não encontrei o áudio desta gravação.";} return; }
  if(prog) prog.textContent="⏳ Transcrevendo… (áudios longos demoram mais)";
  let texto=null;
  try{ texto=await transcreverAudioServidor(blob); }catch(e){}
  if(!texto){
    if(prog) prog.innerHTML="A transcrição automática não respondeu agora. Tente de novo em instantes, ou envie o áudio pelo WhatsApp (ele transcreve) e cole o texto.";
    return;
  }
  g.transcricao=((g.transcricao||"").trim()+"\n"+texto).trim();
  g.status=_statusGrav(g).k;
  await saveGravacoes(d);
  if(prog){ prog.textContent="✓ Transcrição salva."; }
  gvTab="transc";
  abrirGravacao(id);
}

/* ---- WhatsApp ---- */
function _waMontarTexto(g){
  const dataStr=new Date(g.ts).toLocaleDateString("pt-BR");
  let t="*"+(g.titulo||g.nome||"Gravação")+"*\n📅 "+dataStr;
  if(g.condominio) t+="\n🏢 "+g.condominio;
  if(g.participantes) t+="\n👥 "+g.participantes;
  if(g.ata) t+="\n\n"+g.ata;
  else if(g.transcricao) t+="\n\n"+g.transcricao;
  if(g.resolvidos&&g.resolvidos.length) t+="\n\n*Resolvido:*\n- "+g.resolvidos.join("\n- ");
  if(g.tarefas&&g.tarefas.length) t+="\n\n*Tarefas:*\n- "+g.tarefas.map(function(x){return (x.titulo||x)+(x.responsavel?(" ("+x.responsavel+")"):"");}).join("\n- ");
  t+="\n\n— Mafra Gestão Integrada";
  return t;
}
async function compartilharWhatsAppTexto(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const texto=_waMontarTexto(g);
  if(navigator.share){
    try{ await navigator.share({ title:(g.titulo||"Gravação"), text:texto }); return; }catch(e){ if(e&&e.name==="AbortError") return; }
  }
  window.open("https://wa.me/?text="+encodeURIComponent(texto), "_blank");
}
async function compartilharWhatsAppAudio(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const blob=await _obterAudioBlob(g);
  if(!blob){ alert("Não encontrei o áudio desta gravação."); return; }
  const ext=(blob.type||"").includes("mp4")?"m4a":(blob.type||"").includes("ogg")?"ogg":(blob.type||"").includes("wav")?"wav":"webm";
  const nome=(g.titulo||g.nome||"gravacao").replace(/[^a-zA-Z0-9]+/g,"_")+"."+ext;
  try{
    const file=new File([blob], nome, {type:blob.type||"audio/webm"});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      await navigator.share({ files:[file], title:(g.titulo||"Gravação"), text:(g.titulo||"Gravação")+" — Mafra Gestão Integrada" });
      return;
    }
  }catch(e){ if(e&&e.name==="AbortError") return; }
  // sem compartilhamento de arquivo: baixa o áudio e abre o WhatsApp para anexar
  try{
    const a=document.createElement("a"); const u=URL.createObjectURL(blob);
    a.href=u; a.download=nome; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(u); }, 3000);
  }catch(e){}
  alert("Seu aparelho não compartilha o arquivo direto. Baixei o áudio — anexe-o manualmente no WhatsApp, que vai abrir agora.");
  window.open("https://wa.me/", "_blank");
}

/* ---- Ata em PDF (arquivo de verdade) + compartilhar no WhatsApp ---- */
function _carregarJsPDF(){
  return new Promise(function(resolve,reject){
    try{ if(window.jspdf && window.jspdf.jsPDF) return resolve(window.jspdf.jsPDF); }catch(e){}
    var s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload=function(){ if(window.jspdf && window.jspdf.jsPDF) resolve(window.jspdf.jsPDF); else reject(new Error("jsPDF indisponível")); };
    s.onerror=function(){ reject(new Error("Falha ao carregar o gerador de PDF")); };
    document.head.appendChild(s);
  });
}
async function _gerarAtaPDFBlob(g){
  const JsPDF=await _carregarJsPDF();
  const doc=new JsPDF({unit:"pt",format:"a4"});
  const W=doc.internal.pageSize.getWidth();
  const H=doc.internal.pageSize.getHeight();
  const M=48; let y=M;
  function quebra(h){ if(y+(h||0) > H-M){ doc.addPage(); y=M; } }
  function escreve(txt,size,style,r,gg,b,gap,indent){
    indent=indent||0;
    doc.setFont("helvetica", style||"normal"); doc.setFontSize(size||11);
    doc.setTextColor(r==null?40:r, gg==null?40:gg, b==null?40:b);
    var lines=doc.splitTextToSize(String(txt==null?"":txt), W-M*2-indent);
    for(var i=0;i<lines.length;i++){ quebra(size||11); doc.text(lines[i], M+indent, y); y+=(size||11)*1.3; }
    if(gap) y+=gap;
  }
  function secTit(t){ y+=8; quebra(18); escreve(t,12.5,"bold",22,36,61,2); doc.setDrawColor(201,162,75); doc.setLineWidth(1); doc.line(M,y-4,W-M,y-4); y+=4; }
  // cabeçalho
  doc.setFont("helvetica","bold"); doc.setFontSize(20); doc.setTextColor(22,36,61); doc.text("MAFRA", M, y);
  doc.setFontSize(8); doc.setTextColor(201,162,75); doc.text("GESTÃO INTEGRADA", M, y+12);
  y+=16; doc.setDrawColor(22,36,61); doc.setLineWidth(1.5); doc.line(M,y,W-M,y); y+=22;
  // título + meta
  escreve(g.titulo||g.nome||"Ata", 16, "bold", 22,36,61, 6);
  var dataStr=g.dataReuniao ? g.dataReuniao.split("-").reverse().join("/") : new Date(g.ts).toLocaleDateString("pt-BR");
  escreve("Data: "+dataStr, 10.5,"normal",90,90,90,0);
  if(_catLabel(g.categoria)) escreve("Categoria: "+_catLabel(g.categoria)+(g.area?(" — "+g.area):"")+(g.assunto?(" — "+g.assunto):"")+(g.condominio?(" — "+g.condominio):""), 10.5,"normal",90,90,90,0);
  if(_tipoLabel(g.tipo)) escreve("Tipo: "+_tipoLabel(g.tipo), 10.5,"normal",90,90,90,0);
  if((g.participantes||"").trim()) escreve("Participantes: "+g.participantes, 10.5,"normal",90,90,90,2);
  y+=8;
  // corpo
  escreve((g.ata||g.transcricao||"").replace(/\*/g,""), 11, "normal", 40,40,40, 4);
  if((g.resolvidos||[]).length){ secTit("O que ficou resolvido"); g.resolvidos.forEach(function(x){ escreve("•  "+x, 11,"normal",40,40,40,0,8); }); }
  if((g.tarefas||[]).length){ secTit("Tarefas / Encaminhamentos"); g.tarefas.forEach(function(t){ escreve("•  "+(t.titulo||t)+(t.responsavel?(" — "+t.responsavel):"")+(t.prazo?(" ("+t.prazo+")"):""), 11,"normal",40,40,40,0,8); }); }
  var plano=(g.plano||[]).filter(function(a){return a&&(a.acao||"").trim();});
  if(plano.length){ secTit("Plano de ação"); plano.forEach(function(a,i){ escreve((i+1)+". "+a.acao, 11,"bold",40,40,40,0); if(a.como) escreve("Como: "+a.como, 10,"normal",80,80,80,0,14); if(_numVal(a.valor)) escreve("Valor estimado: "+_fmtBRL(a.valor), 10,"normal",28,122,63,0,14); escreve("Responsável: "+(a.responsavel||"—")+"   |   Prazo: "+(_fmtPrazoBr(a.prazo))+"   |   Prioridade: "+(a.prioridade||"—")+"   |   Status: "+(a.status||"Pendente"), 10,"normal",110,110,110,0,14); if(a.categoria||a.impacto) escreve("Categoria: "+(a.categoria||"—")+"   |   Impacto: "+(a.impacto||"—"), 10,"normal",110,110,110,0,14); if(a.obs) escreve("Obs.: "+a.obs, 10,"normal",110,110,110,0,14); y+=6; });
    (function(){ var tot=0, porSt={}; plano.forEach(function(a){ var v=_numVal(a.valor); tot+=v; var st=a.status||"Pendente"; porSt[st]=(porSt[st]||0)+v; }); if(tot){ y+=4; escreve("Total estimado: "+_fmtBRL(tot), 11,"bold",22,36,61,0); Object.keys(porSt).forEach(function(k){ if(porSt[k]>0) escreve(k+": "+_fmtBRL(porSt[k]), 10,"normal",110,110,110,0,10); }); } })(); }
  if((g.resumo||"").trim()){ secTit("Resumo executivo"); escreve(g.resumo.replace(/\*/g,""), 11,"normal",40,40,40,4); }
  y+=14; quebra(20); doc.setDrawColor(210,210,210); doc.setLineWidth(0.5); doc.line(M,y,W-M,y); y+=14;
  escreve("Mafra Gestão Integrada", 10,"bold",22,36,61,0);
  return doc.output("blob");
}
async function baixarAtaPDF(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  if(!(g.ata||"").trim() && !(g.transcricao||"").trim() && !((g.plano||[]).length)){ alert("Não há conteúdo para gerar o PDF."); return; }
  const prog=document.getElementById("gvAtaProg"); if(prog){ prog.style.display="block"; prog.textContent="📄 Gerando o PDF…"; }
  try{
    const blob=await _gerarAtaPDFBlob(g);
    const nome=(g.titulo||g.nome||"ata").replace(/[^a-zA-Z0-9]+/g,"_")+".pdf";
    const a=document.createElement("a"); const u=URL.createObjectURL(blob);
    a.href=u; a.download=nome; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(u); }, 3000);
    if(prog) prog.style.display="none";
  }catch(e){ if(prog) prog.style.display="none"; exportarGravacaoPDF(id); }
}
async function compartilharAtaWhatsApp(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  if(!(g.ata||"").trim() && !(g.transcricao||"").trim() && !((g.plano||[]).length)){ alert("Não há conteúdo para gerar o PDF."); return; }
  const prog=document.getElementById("gvAtaProg"); if(prog){ prog.style.display="block"; prog.textContent="📄 Preparando o PDF para compartilhar…"; }
  var blob=null; try{ blob=await _gerarAtaPDFBlob(g); }catch(e){}
  if(prog) prog.style.display="none";
  if(blob){
    var nome=(g.titulo||g.nome||"ata").replace(/[^a-zA-Z0-9]+/g,"_")+".pdf";
    try{
      var file=new File([blob], nome, {type:"application/pdf"});
      if(navigator.canShare && navigator.canShare({files:[file]})){
        await navigator.share({ files:[file], title:(g.titulo||"Ata"), text:(g.titulo||"Ata")+" — Mafra Gestão Integrada" });
        return;
      }
    }catch(e){ if(e&&e.name==="AbortError") return; }
    try{ var a=document.createElement("a"); var u=URL.createObjectURL(blob); a.href=u; a.download=nome; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(u);},3000); }catch(e){}
    alert("Baixei a ata em PDF (pasta Downloads). O WhatsApp vai abrir agora — é só anexar esse arquivo.");
    window.open("https://wa.me/", "_blank");
    return;
  }
  compartilharWhatsAppTexto(id);
}

/* ---- Corte / 2ª versão ---- */
async function abrirCorte(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const mount=document.getElementById("gvCorteMount"); if(!mount) return;
  const blob=await _obterAudioBlob(g);
  if(!blob){ mount.innerHTML='<div class="ata-corte-wrap">Não encontrei o áudio para cortar.</div>'; return; }
  if(blob.size > ATA_CORTE_MAX_MB*1024*1024){
    mount.innerHTML='<div class="ata-corte-wrap">✂️ Este áudio é grande demais ('+(blob.size/1024/1024).toFixed(0)+' MB) para cortar aqui com segurança. Para arquivos longos, corte antes de subir (no gravador do celular) ou peça o corte no servidor.</div>';
    return;
  }
  // descobre a duração
  const tmpUrl=URL.createObjectURL(blob);
  const au=new Audio(); au.src=tmpUrl;
  au.onloadedmetadata=function(){
    let dur=au.duration;
    if(!isFinite(dur) || isNaN(dur)){ dur=(g.audioDurMs||0)/1000 || 0; }
    URL.revokeObjectURL(tmpUrl);
    const durI=Math.max(1, Math.floor(dur));
    mount.innerHTML=`<div class="ata-corte-wrap">
      <div style="font-weight:600;color:#16243D;margin-bottom:4px">✂️ Cortar áudio</div>
      <div style="font-size:12px;color:#666;margin-bottom:8px">Escolha o trecho. Isso cria uma <b>2ª gravação</b> e mantém o original.</div>
      <div class="ata-corte-row"><span>Início</span><input type="range" id="cIni" min="0" max="${durI}" value="0" step="1" oninput="_corteSync('${g.id}',${durI})"><span id="cIniL">0:00</span></div>
      <div class="ata-corte-row"><span>Fim</span><input type="range" id="cFim" min="0" max="${durI}" value="${durI}" step="1" oninput="_corteSync('${g.id}',${durI})"><span id="cFimL">${_fmtSeg(durI)}</span></div>
      <div class="ata-corte-row"><input type="text" id="cNome" class="ata-nome-input" placeholder="Nome da versão cortada (ex.: trecho da votação)"></div>
      <div id="cProg" class="ata-prog"></div>
      <div style="display:flex;gap:8px;margin-top:8px"><button class="btn-gold" style="flex:1" onclick="executarCorte('${g.id}')">✂️ Gerar trecho</button>
      <button class="btn-ghost" onclick="document.getElementById('gvCorteMount').innerHTML=''">Cancelar</button></div>
    </div>`;
  };
  au.onerror=function(){ URL.revokeObjectURL(tmpUrl); mount.innerHTML='<div class="ata-corte-wrap">Não consegui ler o áudio para cortar.</div>'; };
}
function _fmtSeg(s){ s=Math.floor(s); const m=Math.floor(s/60), ss=s%60; return m+":"+String(ss).padStart(2,"0"); }
function _corteSync(id,dur){
  const i=+document.getElementById("cIni").value, f=+document.getElementById("cFim").value;
  if(i>=f){ if(document.activeElement && document.activeElement.id==="cIni") document.getElementById("cFim").value=Math.min(dur,i+1); else document.getElementById("cIni").value=Math.max(0,f-1); }
  document.getElementById("cIniL").textContent=_fmtSeg(+document.getElementById("cIni").value);
  document.getElementById("cFimL").textContent=_fmtSeg(+document.getElementById("cFim").value);
}
async function executarCorte(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g) return;
  const ini=+document.getElementById("cIni").value, fim=+document.getElementById("cFim").value;
  const nome=(document.getElementById("cNome").value||"").trim() || ((g.titulo||g.nome||"Gravação")+" (corte)");
  const prog=document.getElementById("cProg");
  if(fim-ini < 1){ if(prog) prog.textContent="Escolha um trecho maior."; return; }
  if(prog) prog.textContent="✂️ Processando o corte… aguarde.";
  const blob=await _obterAudioBlob(g);
  if(!blob){ if(prog) prog.textContent="Não encontrei o áudio."; return; }
  let wav;
  try{ wav=await _cortarParaWav(blob, ini, fim); }
  catch(e){ if(prog) prog.textContent="Não consegui cortar este áudio aqui ("+(e.message||"")+"). Para arquivos longos, corte no gravador do celular."; return; }
  if(!wav){ if(prog) prog.textContent="Não consegui cortar este áudio."; return; }

  // salva como NOVA gravação (2ª versão), mantendo o original
  const recId="gr"+Date.now()+Math.random().toString(36).slice(2,6);
  if(prog) prog.textContent="⬆️ Salvando o trecho…";
  let audioRef=await _subirAudioStorage(wav, recId, "wav");
  let audioLocal=false;
  if(!audioRef){ audioLocal=await _idbAudioSet(recId, wav); }
  const agoraC=Date.now();
  const rec={
    id:recId, ts:agoraC, criadoEm:agoraC, atualizadoEm:agoraC, titulo:nome, nome:nome,
    categoria:g.categoria||"", tipo:g.tipo||"", condominio:g.condominio||"", area:g.area||"", assunto:g.assunto||"",
    ata:"", transcricao:"", transcricaoOriginal:"", resumo:"", plano:[], anexos:[], resolvidos:[], tarefas:[],
    participantesList:(g.participantesList||[]).slice(), participantes:g.participantes||"", autor:state.userId,
    origem:g.id, audio:audioRef||null, audioLocal:audioLocal,
    audioMime:"audio/wav", audioExt:"wav", audioDurMs:(fim-ini)*1000, status:"gravado"
  };
  const d2=await loadGravacoes(); if(!d2.list)d2.list=[]; d2.list.push(rec); await saveGravacoes(d2);
  if(prog) prog.textContent="✓ Trecho salvo como nova gravação.";
  alert("Trecho salvo como nova gravação ✓\nVocê já pode transcrevê-lo e enviar no WhatsApp.");
  abrirGravacao(recId);
  if(state.tab==="gravacoes") renderGravacoes();
}

/* Decodifica, recorta o trecho e gera um WAV mono 16-bit */
async function _cortarParaWav(blob, iniSec, fimSec){
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC) throw new Error("sem AudioContext");
  const ctx=new AC();
  const arr=await blob.arrayBuffer();
  const buf=await new Promise(function(res,rej){
    try{ const p=ctx.decodeAudioData(arr, res, rej); if(p&&p.then) p.then(res,rej); }catch(e){ rej(e); }
  });
  const sr=buf.sampleRate;
  const i0=Math.max(0, Math.floor(iniSec*sr));
  const i1=Math.min(buf.length, Math.floor(fimSec*sr));
  const n=Math.max(0, i1-i0);
  if(!n) throw new Error("trecho vazio");
  // downmix para mono
  const ch=buf.numberOfChannels;
  const mono=new Float32Array(n);
  for(let c=0;c<ch;c++){
    const data=buf.getChannelData(c);
    for(let k=0;k<n;k++){ mono[k]+=data[i0+k]/ch; }
  }
  try{ ctx.close(); }catch(e){}
  return _wavMono16(mono, sr);
}
function _wavMono16(samples, sampleRate){
  const n=samples.length;
  const buffer=new ArrayBuffer(44+n*2);
  const view=new DataView(buffer);
  function ws(off,s){ for(let i=0;i<s.length;i++) view.setUint8(off+i, s.charCodeAt(i)); }
  ws(0,"RIFF"); view.setUint32(4,36+n*2,true); ws(8,"WAVE"); ws(12,"fmt ");
  view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,1,true);
  view.setUint32(24,sampleRate,true); view.setUint32(28,sampleRate*2,true);
  view.setUint16(32,2,true); view.setUint16(34,16,true); ws(36,"data"); view.setUint32(40,n*2,true);
  let off=44;
  for(let i=0;i<n;i++){ let s=Math.max(-1,Math.min(1,samples[i])); view.setInt16(off, s<0?s*0x8000:s*0x7FFF, true); off+=2; }
  return new Blob([view], {type:"audio/wav"});
}

async function delGravacao(id){
  if(!confirm("Excluir esta gravação/ata? O áudio e os anexos também serão removidos."))return;
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;});
  if(g){
    if(g.audio && g.audio.path) await _apagarAudioStorage(g.audio.path);
    if(g.audioLocal) await _idbAudioDel(g.id);
    for(const a of (g.anexos||[])){ if(a && a.path) await _apagarAudioStorage(a.path); }
  }
  d.list=(d.list||[]).filter(function(x){return x.id!==id;}); await saveGravacoes(d);
  closeModal(); render();
}

/* ============================================================
   EDITOR de ata (escrever à mão) — inalterado, com IA
   ============================================================ */
function openEditorAta(){
  const ehGestor=state.user.tipo==="gestor";
  editorAtaState={titulo:"",categoria:"condominio",tipo:"",area:"",assunto:"",condominio:ehGestor?(state.user.condominio||""):"",data:ymd(new Date()),integrantes:"",texto:""};
  pintaEditorAta();
}

function pintaEditorAta(){
  const condOpt=`<option value="">Selecione o condomínio…</option>`+condOptionsAgrupadas(editorAtaState.condominio);
  const areaOpt=`<option value="">Selecione a área…</option>`+ATA_AREAS_MAFRA.map(function(a){return `<option ${a===editorAtaState.area?"selected":""}>${esc(a)}</option>`;}).join("");
  const tipoOpt=`<option value="">Selecione o tipo…</option>`+ATA_TIPOS_REUNIAO.map(function(t){return `<option ${t===editorAtaState.tipo?"selected":""}>${esc(t)}</option>`;}).join("");
  const cat=editorAtaState.categoria||"condominio";
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:680px">
    <div class="modal-head"><h3>📋 Escrever ata</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <div class="row2">
        <div class="field"><label>Título da ata</label><input id="eaTitulo" value="${esc(editorAtaState.titulo)}" placeholder="Ex.: Assembleia ordinária — outubro" oninput="editorAtaState.titulo=this.value"></div>
        <div class="field"><label>🗂️ Categoria</label>
          <select id="eaCategoria" onchange="editorAtaState.categoria=this.value;document.getElementById('eaCondField').style.display=(this.value==='condominio')?'':'none';document.getElementById('eaAreaField').style.display=(this.value==='mafra')?'':'none';document.getElementById('eaAssuntoField').style.display=(this.value==='externa')?'':'none'">
            <option value="condominio" ${cat==="condominio"?"selected":""}>Condomínio</option>
            <option value="mafra" ${cat==="mafra"?"selected":""}>Mafra Gestão Integrada</option>
            <option value="externa" ${cat==="externa"?"selected":""}>Externa / Outros Assuntos</option>
          </select></div>
      </div>
      <div class="row2">
        <div class="field" id="eaCondField" style="${cat==="condominio"?"":"display:none"}"><label>${ico('predio')} Condomínio</label><select id="eaCond" onchange="editorAtaState.condominio=this.value">${condOpt}</select></div>
        <div class="field" id="eaAreaField" style="${cat==="mafra"?"":"display:none"}"><label>🏬 Área Mafra</label><select id="eaArea" onchange="editorAtaState.area=this.value">${areaOpt}</select></div>
        <div class="field" id="eaAssuntoField" style="${cat==="externa"?"":"display:none"}"><label>📌 Assunto</label><input id="eaAssunto" value="${esc(editorAtaState.assunto||'')}" placeholder="Assunto / referência" oninput="editorAtaState.assunto=this.value"></div>
        <div class="field"><label>🏷️ Tipo de reunião</label><select id="eaTipo" onchange="editorAtaState.tipo=this.value">${tipoOpt}</select></div>
      </div>
      <div class="row2">
        <div class="field"><label>${ico('calendario')} Data da reunião</label><input id="eaData" type="date" value="${editorAtaState.data||''}" onchange="editorAtaState.data=this.value"></div>
        <div class="field"><label>👥 Integrantes / presentes</label><input id="eaInteg" value="${esc(editorAtaState.integrantes||'')}" placeholder="Ex.: João (síndico), Maria (conselho)" oninput="editorAtaState.integrantes=this.value"></div>
      </div>
      <div class="field"><label>Texto da ata <small style="font-weight:400;text-transform:none">— use *asteriscos* para negrito</small></label>
        <textarea id="eaTexto" class="ata-transcript" style="min-height:240px" placeholder="Escreva a ata aqui…" oninput="editorAtaState.texto=this.value">${esc(editorAtaState.texto)}</textarea>
      </div>
      <div class="ia-btns">
        <button type="button" class="ata-trigger corrigir" onclick="corrigirAtaEditor()">📝 Corrigir o que escrevi</button>
        <button type="button" class="ata-trigger" onclick="reformularAtaEditor()">✨ IA reformular</button>
      </div>
      <div class="modal-foot" style="flex-wrap:wrap">
        <button class="btn-ghost" onclick="exportarAtaPDF()">🖨️ Imprimir / PDF</button>
        <button class="btn-ghost" onclick="exportarAtaWord()">📄 Word (.docx)</button>
        <button class="btn-gold" style="flex:1" onclick="salvarAtaEditor()">🎙️ Salvar em Gravações</button>
      </div>
    </div></div></div>`;
}

async function corrigirAtaEditor(){
  const ta=document.getElementById("eaTexto"); const original=(ta.value||"").trim();
  if(!original){ alert("Escreva a ata primeiro."); return; }
  const btn=event&&event.target; if(btn){btn.disabled=true;btn.textContent="Corrigindo…";}
  const prompt=`Corrija APENAS ortografia, gramática, pontuação e clareza da ata abaixo (português do Brasil).
REGRAS: NÃO reescreva o estilo, NÃO deixe mais longa, mantenha a estrutura. PRESERVE os *negritos* (asteriscos) e as quebras de linha. Responda só com o texto corrigido.

Ata:
"""${original}"""`;
  try{ const t=await chamarIA(prompt,4000); if(t){editorAtaState.texto=t.trim(); ta.value=t.trim();} }
  catch(e){ alert("Não consegui corrigir agora. ("+e.message+")"); }
  if(btn){btn.disabled=false;btn.textContent="📝 Corrigir o que escrevi";}
}

async function reformularAtaEditor(){
  const ta=document.getElementById("eaTexto"); const original=(ta.value||"").trim();
  if(!original){ alert("Escreva algo ou escolha um modelo primeiro."); return; }
  const btn=event&&event.target; if(btn){btn.disabled=true;btn.textContent="Reformulando…";}
  const prompt=`Reformule o conteúdo abaixo como uma ATA DE CONDOMÍNIO formal, objetiva e bem organizada (português do Brasil).
REGRAS: organize em seções claras com títulos em *negrito* (entre asteriscos), seja objetivo, não invente fatos que não estão no texto. Mantenha curto e profissional. Responda só com a ata.

Conteúdo:
"""${original}"""`;
  try{ const t=await chamarIA(prompt,4000); if(t){editorAtaState.texto=t.trim(); ta.value=t.trim();} }
  catch(e){ alert("Não consegui reformular agora. ("+e.message+")"); }
  if(btn){btn.disabled=false;btn.textContent="✨ IA reformular";}
}

async function salvarAtaEditor(){
  const texto=(document.getElementById("eaTexto").value||"").trim();
  if(!texto){ alert("Escreva a ata primeiro."); return; }
  const titulo=(editorAtaState.titulo||texto.split("\n")[0].replace(/\*/g,"")||"Ata").slice(0,80);
  const cat=editorAtaState.categoria||"condominio";
  const condominio=(cat==="condominio") ? (editorAtaState.condominio||state.user.condominio||"") : "";
  const area=(cat==="mafra") ? (editorAtaState.area||"") : "";
  const assunto=(cat==="externa") ? (editorAtaState.assunto||"") : "";
  const integ=(editorAtaState.integrantes||"").trim();
  const plist=integ?integ.split(/[;,]/).map(function(n){return {nome:n.trim(),cargo:"",empresa:"",email:"",telefone:""};}).filter(function(p){return p.nome;}):[];
  const agora=Date.now();
  const rec={id:"gr"+Date.now()+Math.random().toString(36).slice(2,6),ts:agora,criadoEm:agora,atualizadoEm:agora,titulo:titulo,nome:titulo,
    categoria:cat, tipo:editorAtaState.tipo||"", condominio:condominio, area:area, assunto:assunto, ata:texto,
    dataReuniao:editorAtaState.data||"", participantes:integ, integrantes:integ, participantesList:plist,
    transcricao:"", transcricaoOriginal:"", resumo:"", plano:[], anexos:[], resolvidos:[],tarefas:[],autor:state.userId, status:"ata"};
  const d=await loadGravacoes(); if(!d.list)d.list=[]; d.list.push(rec); await saveGravacoes(d);
  closeModal(); if(state.tab==="gravacoes") render();
  alert("Ata salva em Gravações ✓");
}

/* ============================================================
   EXPORTAÇÃO PDF / WORD — inalterado
   ============================================================ */
function ataParaHTML(){
  const titulo=editorAtaState.titulo||"Ata";
  const cond=editorAtaState.condominio||"";
  const dataStr=editorAtaState.data ? editorAtaState.data.split("-").reverse().join("/") : new Date().toLocaleDateString("pt-BR");
  const integ=(editorAtaState.integrantes||"").trim();
  let corpo=esc(editorAtaState.texto||"")
    .replace(/\*(.+?)\*/g,"<strong>$1</strong>")
    .replace(/^[-•]\s?(.*)$/gm,"&bull;&nbsp;$1")
    .replace(/\n/g,"<br>");
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:#222;max-width:680px;margin:0 auto;padding:40px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:2px solid #16243D;padding-bottom:12px"><tr>
      <td style="font-family:Arial;font-weight:bold;font-size:26px;letter-spacing:2px;color:#16243D">MAFRA
        <div style="font-size:9px;letter-spacing:3px;color:#C9A24B;font-weight:bold">GESTÃO INTEGRADA</div></td>
      <td align="right" style="font-size:11px;color:#777">${esc(cond)}</td>
    </tr></table>
    <h1 style="font-size:18px;color:#16243D;margin:22px 0 10px">${esc(titulo)}</h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;font-size:12.5px;color:#444">
      <tr><td style="padding:3px 0"><strong style="color:#16243D">${ico('calendario')} Data:</strong> ${dataStr}</td></tr>
      ${integ?`<tr><td style="padding:3px 0"><strong style="color:#16243D">👥 Integrantes:</strong> ${esc(integ)}</td></tr>`:""}
    </table>
    <div style="font-size:14px;line-height:1.7;color:#333">${corpo}</div>
    <div style="margin-top:48px;padding-top:14px;border-top:1px solid #ddd;font-size:13px;color:#444">
      <em>Síndico Profissional</em><br><strong style="color:#16243D">Mafra Gestão Integrada</strong>
    </div>
  </div>`;
}

function exportarAtaPDF(){
  const texto=(document.getElementById("eaTexto").value||"").trim();
  if(!texto){ alert("Escreva a ata primeiro."); return; }
  editorAtaState.texto=texto;
  const titulo = (editorAtaState.titulo||"Ata").replace(/[<>]/g,"");
  const w=window.open("","_blank");
  const doc = "<!DOCTYPE html><html><head><meta charset='utf-8'><title>"+titulo+"</title>"
    + "<style>@media print{@page{margin:14mm}} body{margin:0;background:#fff}</style></head><body>"
    + ataParaHTML()
    + "</body></html>";
  w.document.open();
  w.document.write(doc);
  w.document.close();
  setTimeout(function(){ try{ w.focus(); w.print(); }catch(e){} }, 400);
}

function exportarAtaWord(){
  const texto=(document.getElementById("eaTexto").value||"").trim();
  if(!texto){ alert("Escreva a ata primeiro."); return; }
  editorAtaState.texto=texto;
  try{
    const g={ titulo:editorAtaState.titulo||"Ata", ata:texto };
    const blob=_docxBlob(_ataDocxBody(g));
    const a=document.createElement("a"); const u=URL.createObjectURL(blob);
    a.href=u; a.download=(editorAtaState.titulo||"ata").replace(/[^a-zA-Z0-9]+/g,"_")+".docx";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(u); }, 3000);
  }catch(e){ alert("Não consegui gerar o Word agora ("+(e.message||"")+")."); }
}

/* ============================================================
   GERAÇÃO DE .docx REAL (Office Open XML) NO NAVEGADOR
   O Word antigo abria HTML disfarçado de .doc, mas o Word/Office
   atual acusa "arquivo corrompido". Aqui montamos um .docx legítimo
   (um ZIP com as partes OOXML), que abre limpo no Word e no Google Docs.
   ============================================================ */
var _crcTab=null;
function _crc32(bytes){
  if(!_crcTab){ _crcTab=[]; for(var n=0;n<256;n++){ var c=n; for(var k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); _crcTab[n]=c>>>0; } }
  var crc=0xFFFFFFFF;
  for(var i=0;i<bytes.length;i++) crc=(crc>>>8)^_crcTab[(crc^bytes[i])&0xFF];
  return (crc^0xFFFFFFFF)>>>0;
}
function _u8(str){ return new TextEncoder().encode(str); }
function _concatU8(arr){ var len=0; arr.forEach(function(a){len+=a.length;}); var out=new Uint8Array(len); var p=0; arr.forEach(function(a){ out.set(a,p); p+=a.length; }); return out; }
// ZIP método "store" (sem compressão) — válido para .docx
function _zipStore(files){
  var enc=new TextEncoder();
  function w16(n){ return new Uint8Array([n&0xFF,(n>>>8)&0xFF]); }
  function w32(n){ return new Uint8Array([n&0xFF,(n>>>8)&0xFF,(n>>>16)&0xFF,(n>>>24)&0xFF]); }
  var central=[], offset=0, partes=[];
  files.forEach(function(f){
    var nameB=enc.encode(f.name), data=f.bytes, crc=_crc32(data);
    var lh=[w32(0x04034b50),w16(20),w16(0),w16(0),w16(0),w16(0),w32(crc),w32(data.length),w32(data.length),w16(nameB.length),w16(0),nameB];
    var lhBytes=_concatU8(lh); partes.push(lhBytes); partes.push(data);
    var ce=[w32(0x02014b50),w16(20),w16(20),w16(0),w16(0),w16(0),w16(0),w32(crc),w32(data.length),w32(data.length),w16(nameB.length),w16(0),w16(0),w16(0),w16(0),w32(0),w32(offset),nameB];
    central.push(_concatU8(ce)); offset+=lhBytes.length+data.length;
  });
  var centralBytes=_concatU8(central);
  var eo=[w32(0x06054b50),w16(0),w16(0),w16(files.length),w16(files.length),w32(centralBytes.length),w32(offset),w16(0)];
  partes.push(centralBytes); partes.push(_concatU8(eo));
  return new Blob(partes, {type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
}
function _docxBlob(bodyXml){
  var contentTypes='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>';
  var rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
  var docXml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+bodyXml+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>';
  return _zipStore([
    {name:"[Content_Types].xml", bytes:_u8(contentTypes)},
    {name:"_rels/.rels", bytes:_u8(rels)},
    {name:"word/document.xml", bytes:_u8(docXml)}
  ]);
}
function _xmlEsc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,""); }
function _wRun(text,o){ o=o||{}; var rpr=""; if(o.bold||o.sz||o.color||o.font){ rpr="<w:rPr>"+(o.font?('<w:rFonts w:ascii="'+o.font+'" w:hAnsi="'+o.font+'" w:cs="'+o.font+'"/>'):"")+(o.bold?"<w:b/>":"")+(o.italic?"<w:i/>":"")+(o.sz?('<w:sz w:val="'+o.sz+'"/><w:szCs w:val="'+o.sz+'"/>'):"")+(o.color?('<w:color w:val="'+o.color+'"/>'):"")+"</w:rPr>"; } return "<w:r>"+rpr+'<w:t xml:space="preserve">'+_xmlEsc(text)+"</w:t></w:r>"; }
// runs a partir de texto com *negrito*
function _wRunsInline(text, cor){ var parts=String(text||"").split("*"), out=""; for(var i=0;i<parts.length;i++){ if(parts[i]==="") continue; out+=_wRun(parts[i],{bold:(i%2===1),color:cor}); } return out||_wRun("",{}); }
function _wPara(inner,o){ o=o||{}; var ppr="<w:pPr>"; ppr+='<w:spacing w:before="'+(o.before||0)+'" w:after="'+(o.after==null?120:o.after)+'"/>'; if(o.bullet) ppr+='<w:ind w:left="360" w:hanging="180"/>'; ppr+="</w:pPr>"; return "<w:p>"+ppr+inner+"</w:p>"; }
function _wHeading(t){ return _wPara(_wRun(t,{bold:true,sz:26,color:"16243D"}),{before:240,after:100}); }
function _wTitle(t){ return _wPara(_wRun(t,{bold:true,sz:36,color:"16243D"}),{before:0,after:160}); }
function _wLinha(line){ var bullet=/^[-•]/.test(line.trim()); var t=line.replace(/^[-•]\s?/,""); return _wPara((bullet?_wRun("• ",{}):"")+_wRunsInline(t,"333333"),{after:120,bullet:bullet}); }
/* ===== Parser do markdown da ata em seções/subseções/itens ===== */
function _ataStripNum(t){ return String(t||"").replace(/^\s*\d+(\.\d+)*\.?\s+/,"").replace(/\*\*/g,"").trim(); }
function _ataItem(raw){
  var t=String(raw||"").replace(/^[-*]\s+/,"").trim(); if(!t) return null;
  var rotulo="", texto=t;
  var m=t.match(/^\*\*(.+?)\*\*\s*:?\s*([\s\S]*)$/);
  if(m){ rotulo=m[1].replace(/:\s*$/,"").trim(); texto=(m[2]||"").trim(); }
  return {rotulo:rotulo, texto:texto};
}
function _ataParse(md){
  var linhas=String(md||"").replace(/\r/g,"").split("\n");
  var secoes=[], sec=null, sub=null;
  linhas.forEach(function(ln){
    var s=ln.trim(); if(!s) return;
    if(/^###\s+/.test(s)){ if(!sec){ sec={titulo:"Abertura",itens:[],subs:[]}; secoes.push(sec);} sub={titulo:_ataStripNum(s.replace(/^###\s+/,"")),itens:[]}; sec.subs.push(sub); return; }
    if(/^##\s+/.test(s)){ sec={titulo:_ataStripNum(s.replace(/^##\s+/,"")),itens:[],subs:[]}; secoes.push(sec); sub=null; return; }
    if(/^#\s+/.test(s)){ sec={titulo:_ataStripNum(s.replace(/^#\s+/,"")),itens:[],subs:[]}; secoes.push(sec); sub=null; return; }
    var it=_ataItem(s); if(!it) return;
    if(!sec){ sec={titulo:"Abertura",itens:[],subs:[]}; secoes.push(sec); }
    (sub?sub.itens:sec.itens).push(it);
  });
  return secoes;
}
function _ataObjeto(secoes){
  var ts=secoes.filter(function(s){return !/^(abertura|encerr)/i.test(s.titulo);}).map(function(s){return s.titulo;});
  if(!ts.length) return "Alinhamento e deliberações da reunião.";
  return "Alinhamento e deliberações: "+ts.slice(0,8).join("; ")+".";
}
function _ataEncaminhamentos(g){
  var t=(g.tarefas||[]).filter(Boolean).map(function(x){ return {acao:String(x.titulo||x.acao||x||""), responsavel:x.responsavel||"", prazo:x.prazo||""}; }).filter(function(e){return e.acao.trim();});
  if(t.length) return t;
  return (g.plano||[]).filter(function(a){return a&&(a.acao||"").trim();}).map(function(a){ return {acao:a.acao, responsavel:a.responsavel||"", prazo:a.prazo||""}; });
}
function _ataAssinaturas(g){
  var lista=[];
  (g.participantesList||[]).forEach(function(p){ if(p&&(p.nome||"").trim()) lista.push({nome:p.nome.trim(), cargo:(p.cargo||p.empresa||"").trim()}); });
  if(!lista.length){ String(g.participantes||"").split(/[;,\n]/).forEach(function(n){ n=n.trim(); if(n) lista.push({nome:n,cargo:""}); }); }
  if(!lista.length) lista.push({nome:"Mafra Gestão Integrada", cargo:""});
  return lista;
}

/* ===== Tabela no .docx ===== */
function _wSub(t){ return _wPara(_wRun(t,{bold:true,sz:23,color:"16243D"}),{before:160,after:80}); }
function _td(text,o){ o=o||{}; return {xml:_wPara(_wRun(String(text==null?"":text),{bold:o.bold,color:o.color||"333333",sz:o.sz||18}),{after:0}), fill:o.fill}; }
function _wCellXml(inner, fill){ var shd=fill?'<w:shd w:val="clear" w:color="auto" w:fill="'+fill+'"/>':""; return '<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/>'+shd+'<w:vAlign w:val="center"/></w:tcPr>'+inner+'</w:tc>'; }
function _wTable(rows, widths){
  var grid=(widths&&widths.length)?'<w:tblGrid>'+widths.map(function(w){return '<w:gridCol w:w="'+w+'"/>';}).join("")+'</w:tblGrid>':"";
  var bd='<w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:left w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/></w:tblBorders>';
  var tblPr='<w:tblPr><w:tblW w:w="5000" w:type="pct"/>'+bd+'</w:tblPr>';
  var trs=rows.map(function(cells){ return '<w:tr>'+cells.map(function(c){ return _wCellXml(c.xml, c.fill); }).join("")+'</w:tr>'; }).join("");
  return '<w:tbl>'+tblPr+grid+trs+'</w:tbl>'+_wPara(_wRun("",{}),{after:0});
}

// item -> parágrafo (rótulo em negrito + texto)
function _wItem(it){
  var inner = (it.rotulo? _wRun(it.rotulo+": ",{bold:true,color:"16243D"}) : "") + _wRunsInline(it.texto,"333333");
  return _wPara(inner,{after:120,bullet:true});
}

// monta o corpo WordprocessingML da ata no MODELO MAFRA (cabeçalho, tabela de identificação,
// seções numeradas, Quadro de Encaminhamentos e assinaturas)
function _ataDocxBody(g){
  var titulo=g.titulo||g.nome||"Ata de Reunião";
  var cond=g.condominio||"";
  var dataStr=g.dataReuniao ? g.dataReuniao.split("-").reverse().join("/") : (g.ts?new Date(g.ts).toLocaleDateString("pt-BR"):"");
  var assinaturas=_ataAssinaturas(g);
  var participantesTxt = assinaturas.map(function(a){return a.nome+(a.cargo?(" ("+a.cargo+")"):"");}).join("; ");
  var secoesAll=_ataParse(g.ata||g.transcricao||"");
  var encerr=null, secs=[]; secoesAll.forEach(function(sx){ if(/^encerr/i.test(sx.titulo)&&!encerr){encerr=sx;} else secs.push(sx); });
  var encam=_ataEncaminhamentos(g);

  var xml="";
  // cabeçalho
  xml+=_wPara(_wRun("MAFRA GESTÃO INTEGRADA",{bold:true,sz:30,color:"16243D"}),{after:0});
  xml+=_wPara(_wRun("Gestão Condominial de Alta Performance",{sz:18,color:"C9A24B"}),{after:200});
  xml+=_wPara(_wRun("ATA DE REUNIÃO",{bold:true,sz:34,color:"16243D"}),{after:40});
  if(_tipoLabel(g.tipo)) xml+=_wPara(_wRun(_tipoLabel(g.tipo),{sz:22,color:"777777"}),{after:160});

  // tabela de identificação
  var meta=[];
  meta.push([_td("Documento",{bold:true,fill:"F2EFE6"}), _td("Ata de Reunião"+(cond?(" — "+cond):""))]);
  if(dataStr) meta.push([_td("Data",{bold:true,fill:"F2EFE6"}), _td(dataStr)]);
  if(_catLabel(g.categoria)) meta.push([_td("Categoria",{bold:true,fill:"F2EFE6"}), _td(_catLabel(g.categoria)+(g.area?(" — "+g.area):"")+(g.assunto?(" — "+g.assunto):""))]);
  meta.push([_td("Participantes",{bold:true,fill:"F2EFE6"}), _td(participantesTxt||"—")]);
  meta.push([_td("Objeto",{bold:true,fill:"F2EFE6"}), _td(_ataObjeto(secoesAll))]);
  meta.push([_td("Elaboração",{bold:true,fill:"F2EFE6"}), _td("Ata gerada a partir da transcrição da gravação. Itens com \u201c(a confirmar)\u201d requerem validação.")]);
  xml+=_wTable(meta, [2400,7800]);

  // seções numeradas
  var nSec=0;
  secs.forEach(function(sx){
    nSec++;
    xml+=_wHeading(nSec+". "+sx.titulo);
    sx.itens.forEach(function(it){ xml+=_wItem(it); });
    var nSub=0;
    sx.subs.forEach(function(sub){ nSub++; xml+=_wSub(nSec+"."+nSub+". "+sub.titulo); sub.itens.forEach(function(it){ xml+=_wItem(it); }); });
  });

  // Quadro de Encaminhamentos
  if(encam.length){
    nSec++;
    xml+=_wHeading(nSec+". Quadro de Encaminhamentos");
    var rows=[[_td("Nº",{bold:true,color:"FFFFFF",fill:"16243D"}),_td("Encaminhamento",{bold:true,color:"FFFFFF",fill:"16243D"}),_td("Responsável",{bold:true,color:"FFFFFF",fill:"16243D"}),_td("Prazo",{bold:true,color:"FFFFFF",fill:"16243D"})]];
    encam.forEach(function(e,i){ rows.push([_td(String(i+1)),_td(e.acao),_td(e.responsavel||"—"),_td(e.prazo||"—")]); });
    xml+=_wTable(rows, [600,6200,2200,1400]);
  }

  // Encerramento
  nSec++;
  xml+=_wHeading(nSec+". Encerramento");
  if(encerr && encerr.itens.length){ encerr.itens.forEach(function(it){ xml+=_wPara((it.rotulo?_wRun(it.rotulo+": ",{bold:true,color:"16243D"}):"")+_wRunsInline(it.texto,"333333"),{after:120}); }); }
  else xml+=_wPara(_wRun("Nada mais havendo a tratar, encerrou-se a reunião. Os encaminhamentos serão acompanhados nas tratativas seguintes.",{color:"333333"}),{after:120});

  // assinaturas
  assinaturas.forEach(function(a){
    // assinatura manuscrita (fonte de punho; o Windows usa "Segoe Script", com substituição automática se faltar)
    xml+=_wPara(_wRun(a.nome,{font:"Segoe Script", sz:40, color:"1B2433"}),{before:360,after:0});
    xml+=_wPara(_wRun("______________________________________",{color:"888888"}),{after:0});
    xml+=_wPara(_wRun(a.nome+(a.cargo?(" — "+a.cargo):""),{bold:true,color:"16243D",sz:18}),{after:0});
  });
  return xml;
}

// versão HTML do MODELO (usada na visualização online / impressão / PDF)
function ataObjParaHTML(g){
  var cond=g.condominio||"";
  var dataStr=g.dataReuniao ? g.dataReuniao.split("-").reverse().join("/") : (g.ts?new Date(g.ts).toLocaleDateString("pt-BR"):"");
  var assinaturas=_ataAssinaturas(g);
  var participantesTxt=assinaturas.map(function(a){return esc(a.nome)+(a.cargo?(" ("+esc(a.cargo)+")"):"");}).join("; ");
  var secoesAll=_ataParse(g.ata||g.transcricao||"");
  var encerr=null, secs=[]; secoesAll.forEach(function(sx){ if(/^encerr/i.test(sx.titulo)&&!encerr){encerr=sx;} else secs.push(sx); });
  var encam=_ataEncaminhamentos(g);
  function itHTML(it){ return '<p style="margin:5px 0 9px;line-height:1.6">'+(it.rotulo?'<strong style="color:#16243D">'+esc(it.rotulo)+':</strong> ':'')+_inlineBold(esc(it.texto))+'</p>'; }
  function _inlineBold(s){ return String(s).replace(/\*(.+?)\*/g,"<strong>$1</strong>"); }

  var metaRows="";
  function mr(l,v){ return '<tr><td style="background:#F2EFE6;font-weight:700;color:#16243D;border:1px solid #e4ddca;padding:7px 10px;width:160px;vertical-align:top">'+l+'</td><td style="border:1px solid #e4ddca;padding:7px 10px">'+v+'</td></tr>'; }
  metaRows+=mr("Documento","Ata de Reunião"+(cond?(" — "+esc(cond)):""));
  if(dataStr) metaRows+=mr("Data",esc(dataStr));
  if(_catLabel(g.categoria)) metaRows+=mr("Categoria",esc(_catLabel(g.categoria))+(g.area?(" — "+esc(g.area)):"")+(g.assunto?(" — "+esc(g.assunto)):""));
  metaRows+=mr("Participantes",participantesTxt||"—");
  metaRows+=mr("Objeto",esc(_ataObjeto(secoesAll)));
  metaRows+=mr("Elaboração","Ata gerada a partir da transcrição da gravação. Itens com \u201c(a confirmar)\u201d requerem validação.");

  var nSec=0, corpo="";
  secs.forEach(function(sx){
    nSec++;
    corpo+='<h2 style="font-size:15px;color:#16243D;margin:22px 0 8px;border-bottom:1px solid #C9A24B;padding-bottom:4px">'+nSec+'. '+esc(sx.titulo)+'</h2>';
    sx.itens.forEach(function(it){ corpo+=itHTML(it); });
    var nSub=0;
    sx.subs.forEach(function(sub){ nSub++; corpo+='<h3 style="font-size:13px;color:#16243D;margin:14px 0 6px">'+nSec+'.'+nSub+'. '+esc(sub.titulo)+'</h3>'; sub.itens.forEach(function(it){ corpo+=itHTML(it); }); });
  });
  if(encam.length){
    nSec++;
    corpo+='<h2 style="font-size:15px;color:#16243D;margin:22px 0 8px;border-bottom:1px solid #C9A24B;padding-bottom:4px">'+nSec+'. Quadro de Encaminhamentos</h2>';
    corpo+='<table width="100%" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:12px"><tr style="background:#16243D;color:#fff"><th align="left" style="padding:6px">Nº</th><th align="left">Encaminhamento</th><th align="left">Responsável</th><th align="left">Prazo</th></tr>';
    encam.forEach(function(e,i){ corpo+='<tr><td style="border:1px solid #ddd;padding:5px;text-align:center">'+(i+1)+'</td><td style="border:1px solid #ddd;padding:5px">'+esc(e.acao)+'</td><td style="border:1px solid #ddd;padding:5px">'+esc(e.responsavel||"—")+'</td><td style="border:1px solid #ddd;padding:5px">'+esc(e.prazo||"—")+'</td></tr>'; });
    corpo+='</table>';
  }
  nSec++;
  corpo+='<h2 style="font-size:15px;color:#16243D;margin:22px 0 8px;border-bottom:1px solid #C9A24B;padding-bottom:4px">'+nSec+'. Encerramento</h2>';
  if(encerr && encerr.itens.length){ encerr.itens.forEach(function(it){ corpo+='<p style="margin:5px 0 9px;line-height:1.6">'+(it.rotulo?'<strong>'+esc(it.rotulo)+':</strong> ':'')+_inlineBold(esc(it.texto))+'</p>'; }); }
  else corpo+='<p style="margin:5px 0 9px;line-height:1.6">Nada mais havendo a tratar, encerrou-se a reunião. Os encaminhamentos serão acompanhados nas tratativas seguintes.</p>';

  var assinHTML=assinaturas.map(function(a){ return '<div style="margin-top:42px;width:330px">'
      +'<div style="font-family:\'Dancing Script\',\'Segoe Script\',cursive;font-size:30px;color:#1b2433;line-height:1;padding-left:16px;height:36px">'+esc(a.nome)+'</div>'
      +'<div style="border-top:1px solid #555;margin-top:2px;padding-top:5px;font-weight:700;color:#16243D;font-size:13px">'+esc(a.nome)+(a.cargo?' \u2014 '+esc(a.cargo):'')+'</div>'
      +'</div>'; }).join("");

  return '<div style="font-family:\'Montserrat\',Arial,Helvetica,sans-serif;color:#222;max-width:720px;margin:0 auto;padding:40px">'
    +'<table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:2px solid #16243D;padding-bottom:10px"><tr>'
    +'<td><img src="'+LOGO_MAFRA+'" style="height:46px;display:block" alt="Mafra Gestão Integrada"></td>'
    +'<td align="right" style="font-size:10px;color:#999">Gestão Condominial de Alta Performance</td></tr></table>'
    +'<h1 style="font-size:19px;color:#16243D;margin:20px 0 4px">ATA DE REUNIÃO'+(_tipoLabel(g.tipo)?'':'')+'</h1>'
    +(_tipoLabel(g.tipo)?'<div style="font-size:12px;color:#777;margin-bottom:14px">'+esc(_tipoLabel(g.tipo))+'</div>':'<div style="height:8px"></div>')
    +'<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:12.5px;margin-bottom:8px">'+metaRows+'</table>'
    +corpo
    +assinHTML
    +'<div style="margin-top:34px;padding-top:14px;border-top:1px solid #ddd;text-align:center"><img src="'+LOGO_MAFRA+'" style="height:30px;opacity:.92;display:inline-block" alt="Mafra"><div style="font-size:10.5px;color:#999;margin-top:7px;letter-spacing:.4px">Mafra Gestão Integrada · Síndico Profissional</div></div>'
    +'</div>';
}

// renderização do markdown da ata para leitura dentro do app (aba Ata)
function _ataMdView(md){
  var secoesAll=_ataParse(md);
  if(!secoesAll.length) return '<div style="white-space:pre-wrap">'+esc(md||"")+'</div>';
  var encerr=null, secs=[]; secoesAll.forEach(function(sx){ if(/^encerr/i.test(sx.titulo)&&!encerr){encerr=sx;} else secs.push(sx); });
  function _ib(s){ return String(s).replace(/\*(.+?)\*/g,"<strong>$1</strong>"); }
  function itHTML(it){ return '<p style="margin:4px 0 8px;line-height:1.55">'+(it.rotulo?'<strong style="color:#16243D">'+esc(it.rotulo)+':</strong> ':'')+_ib(esc(it.texto))+'</p>'; }
  var nSec=0, html="";
  secs.forEach(function(sx){ nSec++; html+='<h3 style="margin:14px 0 6px;color:#16243D;font-size:14.5px">'+nSec+'. '+esc(sx.titulo)+'</h3>'; sx.itens.forEach(function(it){ html+=itHTML(it); }); var ns=0; sx.subs.forEach(function(sub){ ns++; html+='<h4 style="margin:10px 0 4px;color:#16243D;font-size:13px">'+nSec+'.'+ns+'. '+esc(sub.titulo)+'</h4>'; sub.itens.forEach(function(it){ html+=itHTML(it); }); }); });
  if(encerr){ nSec++; html+='<h3 style="margin:14px 0 6px;color:#16243D;font-size:14.5px">'+nSec+'. '+esc(encerr.titulo)+'</h3>'; encerr.itens.forEach(function(it){ html+=itHTML(it); }); }
  return html;
}


async function exportarGravacaoPDF(id){
  const w=window.open("","_blank");   // abre a aba JÁ no clique, antes de qualquer await (senão o navegador bloqueia o popup)
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;});
  if(!g){ if(w&&!w.closed) w.close(); alert("Ata não encontrada."); return; }
  if(!w){ alert("Seu navegador bloqueou a janela de visualização. Permita pop-ups para este site e tente de novo."); return; }
  const titulo=(g.titulo||g.nome||"Ata").replace(/[<>]/g,"");
  const doc="<!DOCTYPE html><html><head><meta charset='utf-8'><title>"+titulo+"</title>"
    + "<link href='https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Dancing+Script:wght@600;700&display=swap' rel='stylesheet'>"
    + "<style>*{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important}@media print{@page{margin:14mm 14mm 24mm}} body{margin:0;background:#fff;font-family:'Montserrat',Arial,sans-serif}"
    + ".rodape-fixo{display:none}@media print{.rodape-fixo{display:flex !important;position:fixed;bottom:0;left:0;right:0;align-items:center;justify-content:center;padding:7mm 0 5mm}.rodape-fixo img{height:22px;opacity:.85}}"
    + ".barra{position:fixed;top:0;left:0;right:0;background:#16243D;padding:10px;text-align:center}.barra button{padding:9px 22px;background:#C9A24B;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-family:'Montserrat',sans-serif}@media print{.barra{display:none}}</style></head><body>"
    + "<div class='barra'><button onclick='window.print()'>🖨️ Imprimir / Salvar PDF</button></div><div style='height:50px'></div>"
    + "<div class='rodape-fixo'><img src='"+LOGO_MAFRA+"' alt='Mafra'></div>"
    + ataObjParaHTML(g)
    + "</body></html>";
  w.document.open(); w.document.write(doc); w.document.close();
}

async function exportarGravacaoWord(id){
  const d=await loadGravacoes(); const g=(d.list||[]).find(function(x){return x.id===id;}); if(!g){ alert("Ata não encontrada."); return; }
  try{
    const blob=_docxBlob(_ataDocxBody(g));
    const nome=(g.titulo||g.nome||"ata").replace(/[^a-zA-Z0-9]+/g,"_")+".docx";
    const a=document.createElement("a"); const u=URL.createObjectURL(blob);
    a.href=u; a.download=nome; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(u); }, 3000);
  }catch(e){ alert("Não consegui gerar o Word agora ("+(e.message||"")+")."); }
}


