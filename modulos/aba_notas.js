/* ============================================================
   GESTÃO MAFRA — ABA NOTAS
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: loadNotas, saveNotas, renderNotas, novaNota, delNota, setNotaTitulo, setNotaTexto, toggleFixar, addItem, toggleItem, delItem */

async function loadNotas(){ const v=await storeGet("mafra:notas:"+state.userId); if(v){try{return JSON.parse(v);}catch(e){}} return {list:[]}; }

async function saveNotas(d){ await storeSet("mafra:notas:"+state.userId, JSON.stringify(d)); }

async function renderNotas(){
  document.getElementById("view").innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  const d=await loadNotas();
  const list=(d.list||[]).slice().sort((a,b)=> (b.fixado?1:0)-(a.fixado?1:0) || b.ts-a.ts);
  let html=`<div class="weeknav"><div><h2>Notas & Checklists</h2><div class="range">${list.length} anotação(ões)</div></div>
    <div class="spacer"></div>
    <button class="btn-ghost" onclick="novaNota('checklist')">✓ Novo checklist</button>
    <button class="btn-gold" onclick="novaNota('nota')">＋ Nova nota</button>
  </div>`;
  if(list.length===0) html+=`<div class="dia-empty">Nenhuma anotação ainda. Crie uma nota ou um checklist!</div>`;
  html+=`<div class="notas-grid">`;
  list.forEach(n=>{
    const cor=n.cor||"#FFF9E6";
    if(n.tipo==="checklist"){
      const itens=n.itens||[];
      const feitos=itens.filter(i=>i.ok).length;
      const itensHTML=itens.map((it,i)=>`<label class="nota-chk"><input type="checkbox" ${it.ok?"checked":""} onchange="toggleItem('${n.id}',${i},this.checked)"><span class="${it.ok?'done':''}">${esc(it.txt)}</span><button class="nota-del-item" onclick="delItem('${n.id}',${i})">×</button></label>`).join("");
      html+=`<div class="nota-card" style="background:${cor}">
        <div class="nota-top"><input class="nota-titulo" value="${esc(n.titulo||'')}" placeholder="Título do checklist" onchange="setNotaTitulo('${n.id}',this.value)">
          <button class="nota-pin ${n.fixado?'on':''}" onclick="toggleFixar('${n.id}')" title="Fixar">📌</button>
          <button class="nota-x" onclick="delNota('${n.id}')">🗑</button></div>
        <div class="nota-prog">${feitos}/${itens.length} concluído(s)</div>
        <div class="nota-itens">${itensHTML||'<div class="nota-vazio">Sem itens ainda.</div>'}</div>
        <div class="nota-additem"><input id="add_${n.id}" placeholder="+ adicionar item e Enter" onkeydown="if(event.key==='Enter')addItem('${n.id}',this)"></div>
      </div>`;
    } else {
      html+=`<div class="nota-card" style="background:${cor}">
        <div class="nota-top"><input class="nota-titulo" value="${esc(n.titulo||'')}" placeholder="Título" onchange="setNotaTitulo('${n.id}',this.value)">
          <button class="nota-pin ${n.fixado?'on':''}" onclick="toggleFixar('${n.id}')" title="Fixar">📌</button>
          <button class="nota-x" onclick="delNota('${n.id}')">🗑</button></div>
        <textarea class="nota-texto" placeholder="Escreva sua anotação…" onchange="setNotaTexto('${n.id}',this.value)">${esc(n.texto||'')}</textarea>
      </div>`;
    }
  });
  html+=`</div>`;
  document.getElementById("view").innerHTML=html;
}

async function novaNota(tipo){
  const d=await loadNotas(); if(!d.list)d.list=[];
  const cores=["#FFF9E6","#E8F3FF","#EAF7EE","#FCEEF4","#F1ECFB"];
  const cor=cores[d.list.length % cores.length];
  const nota={id:"n"+Date.now()+Math.random().toString(36).slice(2,5),tipo,titulo:"",ts:Date.now(),cor,fixado:false};
  if(tipo==="checklist") nota.itens=[]; else nota.texto="";
  d.list.push(nota); await saveNotas(d); renderNotas();
}

async function delNota(id){
  if(!confirm("Excluir esta anotação?"))return;
  const d=await loadNotas(); d.list=(d.list||[]).filter(n=>n.id!==id); await saveNotas(d); renderNotas();
}

async function setNotaTitulo(id,val){ const d=await loadNotas(); const n=(d.list||[]).find(x=>x.id===id); if(n){n.titulo=val; await saveNotas(d);} }

async function setNotaTexto(id,val){ const d=await loadNotas(); const n=(d.list||[]).find(x=>x.id===id); if(n){n.texto=val; await saveNotas(d);} }

async function toggleFixar(id){ const d=await loadNotas(); const n=(d.list||[]).find(x=>x.id===id); if(n){n.fixado=!n.fixado; await saveNotas(d); renderNotas();} }

async function addItem(id,input){
  const txt=(input.value||"").trim(); if(!txt)return;
  const d=await loadNotas(); const n=(d.list||[]).find(x=>x.id===id);
  if(n){ if(!n.itens)n.itens=[]; n.itens.push({txt,ok:false}); await saveNotas(d); renderNotas();
    setTimeout(()=>{const el=document.getElementById("add_"+id); if(el)el.focus();},50); }
}

async function toggleItem(id,idx,ok){ const d=await loadNotas(); const n=(d.list||[]).find(x=>x.id===id); if(n&&n.itens[idx]){n.itens[idx].ok=ok; await saveNotas(d); renderNotas();} }

async function delItem(id,idx){ const d=await loadNotas(); const n=(d.list||[]).find(x=>x.id===id); if(n&&n.itens){n.itens.splice(idx,1); await saveNotas(d); renderNotas();} }

/* ============================================================
   GESTÃO MAFRA — ABA VÍDEOS E TUTORIAIS
   NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ------------------------------------------------------------
   Funções: loadVideos, saveVideos, _vidJs, _vidYouTubeId, _vidVimeoId,
   _vidPlayer, renderVideos, setVidCat, novoVideo, editarVideo,
   _vidModal, salvarVideo, delVideo, _vidInjectCSS
   ============================================================ */

async function loadVideos(){ try{ const v=await storeGet("mafra:videos"); if(v){ const o=JSON.parse(v); if(o&&Array.isArray(o.list)) return o; } }catch(e){} return {list:[]}; }
async function saveVideos(d){ return await storeSet("mafra:videos", JSON.stringify(d||{list:[]})); }

/* escape p/ usar dentro de onclick='...' (não temos _jsq global) */
function _vidJs(s){ return String(s==null?"":s).replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\r?\n/g," "); }

/* extrai o id do vídeo de links do YouTube / Vimeo */
function _vidYouTubeId(url){
  var u=String(url||""),m;
  m=u.match(/[?&]v=([\w-]{6,})/); if(m) return m[1];
  m=u.match(/youtu\.be\/([\w-]{6,})/); if(m) return m[1];
  m=u.match(/youtube\.com\/embed\/([\w-]{6,})/); if(m) return m[1];
  m=u.match(/youtube\.com\/shorts\/([\w-]{6,})/); if(m) return m[1];
  return "";
}
function _vidVimeoId(url){ var m=String(url||"").match(/vimeo\.com\/(?:video\/)?(\d+)/); return m?m[1]:""; }

/* player embutido (YouTube/Vimeo) ou link genérico */
function _vidPlayer(v){
  var yt=_vidYouTubeId(v.url);
  if(yt) return '<div class="vid-frame"><iframe src="https://www.youtube.com/embed/'+esc(yt)+'" title="'+esc(v.titulo||"")+'" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
  var vm=_vidVimeoId(v.url);
  if(vm) return '<div class="vid-frame"><iframe src="https://player.vimeo.com/video/'+esc(vm)+'" title="'+esc(v.titulo||"")+'" frameborder="0" allow="autoplay;fullscreen;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
  if(v.url) return '<a class="vid-frame vid-frame-link" href="'+esc(v.url)+'" target="_blank" rel="noopener"><div class="vid-play">'+ico("link")+'</div><span>Abrir vídeo</span></a>';
  return '<div class="vid-frame vid-frame-link"><div class="vid-play">'+ico("videos")+'</div><span>Sem link de vídeo</span></div>';
}

async function renderVideos(){
  _vidInjectCSS();
  document.getElementById("view").innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  const d=await loadVideos();
  const master=!!(state.user && state.user.tipo==="master");
  var list=(d.list||[]).slice();
  // categorias existentes
  var cats=[]; list.forEach(function(v){ if(v.cat && cats.indexOf(v.cat)<0) cats.push(v.cat); });
  cats.sort(function(a,b){return a.localeCompare(b,"pt-BR");});
  var filtro=state.vidCat||"";
  if(filtro && cats.indexOf(filtro)<0) filtro="";
  var vis=filtro?list.filter(function(v){return v.cat===filtro;}):list;

  var html='<div class="weeknav"><div><h2>'+icoH("videos")+' Vídeos e Tutoriais</h2><div class="range">'+list.length+' vídeo'+(list.length===1?"":"s")+'</div></div>'
    +'<div class="spacer"></div>'
    +(master?'<button class="btn-gold" onclick="novoVideo()">＋ Adicionar vídeo</button>':'')
    +'</div>';

  if(cats.length){
    html+='<div class="vid-cats"><button class="vid-cat'+(filtro===""?" on":"")+'" onclick="setVidCat(\'\')">Todos</button>'
      +cats.map(function(c){return '<button class="vid-cat'+(filtro===c?" on":"")+'" onclick="setVidCat(\''+_vidJs(c)+'\')">'+esc(c)+'</button>';}).join("")
      +'</div>';
  }

  if(!vis.length){
    html+='<div class="dia-empty">'+(list.length?'Nenhum vídeo nesta categoria.':('Nenhum vídeo cadastrado ainda.'+(master?' Clique em “＋ Adicionar vídeo” para começar.':'')))+'</div>';
  } else {
    html+='<div class="vid-grid">';
    vis.forEach(function(v){
      html+='<div class="vid-card">'+_vidPlayer(v)
        +'<div class="vid-body">'
        +(v.cat?'<div class="vid-cat-badge">'+esc(v.cat)+'</div>':'')
        +'<div class="vid-title">'+esc(v.titulo||"(sem título)")+'</div>'
        +(v.desc?'<div class="vid-desc">'+esc(v.desc).replace(/\r?\n/g,"<br>")+'</div>':'')
        +(master?'<div class="vid-actions"><button class="btn-ghost" onclick="editarVideo(\''+_vidJs(v.id)+'\')">Editar</button><button class="btn-ghost vid-del" onclick="delVideo(\''+_vidJs(v.id)+'\')">Remover</button></div>':'')
        +'</div></div>';
    });
    html+='</div>';
  }
  document.getElementById("view").innerHTML=html;
}

function setVidCat(c){ state.vidCat=c||""; renderVideos(); }

function novoVideo(){ _vidModal({id:"v"+Date.now()+Math.floor(Math.random()*1000),titulo:"",url:"",desc:"",cat:""}, true); }
async function editarVideo(id){ const d=await loadVideos(); const v=(d.list||[]).find(function(x){return x.id===id;}); if(v) _vidModal(v, false); }

function _vidModal(v, isNovo){
  document.getElementById("modalMount").innerHTML=
    '<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:560px">'
    +'<div class="modal-head"><h3>'+(isNovo?"Novo vídeo":"Editar vídeo")+'</h3><button class="x" onclick="closeModal()">×</button></div>'
    +'<div class="modal-body">'
    +'<div class="field"><label>Título</label><input id="vidTit" value="'+esc(v.titulo||"")+'" placeholder="ex.: Como abrir um chamado no Help Condo"></div>'
    +'<div class="field"><label>Link do vídeo</label><input id="vidUrl" value="'+esc(v.url||"")+'" placeholder="cole o link do YouTube, Vimeo ou outro"><div style="font-size:11px;color:#8a94a3;margin-top:5px">Links do YouTube e Vimeo tocam dentro do app; outros abrem em nova aba.</div></div>'
    +'<div class="field"><label>Categoria (opcional)</label><input id="vidCat" value="'+esc(v.cat||"")+'" placeholder="ex.: Início rápido, Financeiro, Síndico"></div>'
    +'<div class="field"><label>Descrição (opcional)</label><textarea id="vidDesc" rows="3" placeholder="do que trata o vídeo">'+esc(v.desc||"")+'</textarea></div>'
    +'</div>'
    +'<div class="modal-foot"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-primary" style="flex:1" onclick="salvarVideo(\''+_vidJs(v.id)+'\','+(isNovo?"true":"false")+')">Salvar vídeo</button></div>'
    +'</div></div>';
  setTimeout(function(){ var el=document.getElementById("vidTit"); if(el) el.focus(); },50);
}

async function salvarVideo(id, isNovo){
  var g=function(x){ var el=document.getElementById(x); return el?(el.value||"").trim():""; };
  var tit=g("vidTit"), url=g("vidUrl"), cat=g("vidCat"), desc=g("vidDesc");
  if(!tit){ alert("Dê um título ao vídeo."); return; }
  const d=await loadVideos(); if(!Array.isArray(d.list)) d.list=[];
  if(isNovo){ d.list.push({id:id,titulo:tit,url:url,desc:desc,cat:cat}); }
  else { var v=d.list.find(function(x){return x.id===id;}); if(v){ v.titulo=tit; v.url=url; v.desc=desc; v.cat=cat; } }
  await saveVideos(d);
  closeModal();
  try{ if(typeof toast==="function") toast(isNovo?"Vídeo adicionado":"Vídeo atualizado"); }catch(e){}
  renderVideos();
}

async function delVideo(id){
  if(!confirm("Remover este vídeo da lista?")) return;
  const d=await loadVideos(); d.list=(d.list||[]).filter(function(x){return x.id!==id;});
  await saveVideos(d);
  renderVideos();
}

function _vidInjectCSS(){
  if(document.getElementById("vidCSS")) return;
  var css=''
    +'.vid-cats{display:flex;flex-wrap:wrap;gap:8px;margin:2px 0 16px}'
    +'.vid-cat{border:1px solid #e6eaf0;background:#fff;color:#4a5b6a;border-radius:999px;padding:6px 14px;font-size:12.5px;font-weight:600;cursor:pointer;transition:.15s}'
    +'.vid-cat:hover{background:#f4f6f9}'
    +'.vid-cat.on{background:#17253f;border-color:#17253f;color:#fff}'
    +'.vid-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px;margin-top:4px}'
    +'.vid-card{background:#fff;border:1px solid #e6eaf0;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 1px 2px rgba(20,33,56,.05),0 8px 22px rgba(20,33,56,.05)}'
    +'.vid-frame{position:relative;width:100%;padding-top:56.25%;background:#0d1626;overflow:hidden;display:block}'
    +'.vid-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}'
    +'.vid-frame-link{padding-top:0;height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#c9a750;text-decoration:none;background:linear-gradient(135deg,#17253f,#132038)}'
    +'.vid-frame-link span{font-size:13px;font-weight:600;color:#e8edf4}'
    +'.vid-play{width:46px;height:46px;border-radius:50%;background:rgba(201,167,80,.15);border:1.5px solid rgba(201,167,80,.5);display:flex;align-items:center;justify-content:center}'
    +'.vid-play svg{width:22px;height:22px;color:#c9a750}'
    +'.vid-body{padding:14px 16px 16px;display:flex;flex-direction:column;gap:7px}'
    +'.vid-cat-badge{align-self:flex-start;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8a6d1a;background:#f4ead2;border-radius:999px;padding:3px 10px}'
    +'.vid-title{font-weight:700;font-size:15.5px;color:#17253f;line-height:1.25}'
    +'.vid-desc{font-size:13px;color:#6a7688;line-height:1.5}'
    +'.vid-actions{display:flex;gap:8px;margin-top:4px}'
    +'.vid-actions .btn-ghost{font-size:12px;padding:5px 12px}'
    +'.vid-del{color:#b8402f;border-color:#f0d4cf}'
    +'@media(max-width:620px){.vid-grid{grid-template-columns:1fr}}';
  var st=document.createElement("style"); st.id="vidCSS"; st.textContent=css; document.head.appendChild(st);
}
