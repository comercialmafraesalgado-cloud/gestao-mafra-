/* ============================================================
   GESTÃO MAFRA — MODULO BIA LIVIA
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: _liviaResumir, coletarContextoSistema, abrirBia, fecharBia, renderBia, formatBiaMsg, biaPergunta, biaEnviar */

function _liviaResumir(v, prof){
  prof = prof||0;
  if(v===null||v===undefined) return undefined;
  if(typeof v==="string"){
    if(v.length>240 || /^data:|base64,/i.test(v)) return "[…]";
    return v;
  }
  if(typeof v==="number"||typeof v==="boolean") return v;
  if(Array.isArray(v)){
    if(prof>=5) return "[…]";
    return v.slice(0,60).map(x=>_liviaResumir(x, prof+1));
  }
  if(typeof v==="object"){
    if(prof>=6) return "[…]";
    const out={};
    for(const k of Object.keys(v)){
      if(/foto|fotos|imagem|img|base64|audio|áudio|dataurl|capa|thumb|blob|senha|password|cred/i.test(k)) continue;
      const r=_liviaResumir(v[k], prof+1);
      if(r!==undefined) out[k]=r;
    }
    return out;
  }
  return undefined;
}

async function coletarContextoSistema(){
  const partes=[];
  const getJSON=async(chave)=>{ try{ const v=await storeGet(chave); return v?JSON.parse(v):null; }catch(e){ return null; } };
  const add=(titulo,valor)=>{
    try{
      const limpo=_liviaResumir(valor);
      if(limpo===undefined||limpo===null) return;
      if(Array.isArray(limpo)&&!limpo.length) return;
      if(typeof limpo==="object"&&!Array.isArray(limpo)&&!Object.keys(limpo).length) return;
      partes.push("### "+titulo+"\n"+JSON.stringify(limpo));
    }catch(e){}
  };
  add("Condomínios cadastrados", CONDOMINIOS);
  const us={}; Object.keys(USUARIOS).forEach(k=>{ const u=USUARIOS[k]; us[k]={nome:u.nome,cargo:u.cargo,tipo:u.tipo}; });
  add("Equipe (usuários, sem senhas)", us);
  add("Atendimentos registrados", await getJSON("mafra:atendimentos"));
  add("Comunicados enviados pelo app", await getJSON("mafra:comunicados"));
  add("Comunicados registrados manualmente", await getJSON("mafra:comunicados_manual"));
  add("Relatórios gerenciais (sem as fotos)", await getJSON("mafra:relatorios"));
  add("Fichas técnicas dos condomínios", await getJSON("mafra:fichas_cond"));
  add("Chamados do Help Condo", await getJSON("mafra:chamados"));
  add("Check-ins dos síndicos", await getJSON("mafra:checkins"));
  add("Gravações e atas (sem o áudio)", await getJSON("mafra:gravacoes"));
  add("Aniversários", await getJSON("mafra:aniversarios"));
  // por usuário: tarefas (agenda) e eventos do calendário
  for(const uid of Object.keys(USUARIOS)){
    const nome=USUARIOS[uid]?USUARIOS[uid].nome:uid;
    const ag=await getJSON("mafra:agenda:"+uid);
    if(ag&&ag.weeks&&Object.keys(ag.weeks).length) add("Tarefas semanais de "+nome, ag.weeks);
    const ev=await getJSON("mafra:eventos:"+uid);
    if(ev&&ev.events&&ev.events.length) add("Eventos do calendário de "+nome, ev.events);
  }
  let ctx=partes.join("\n\n");
  const LIM=15000; // limite de segurança p/ não estourar o tamanho do prompt
  if(ctx.length>LIM) ctx=ctx.slice(0,LIM)+"\n…(há mais conteúdo — resumido por tamanho)";
  return ctx;
}

function abrirBia(){
  biaState.aberta=true;
  document.getElementById("biaBtn").classList.add("hidden");
  const chat=document.getElementById("biaChat");
  chat.classList.remove("hidden");
  const nome=(state.user&&state.user.nome)?state.user.nome.split(" ")[0]:"";
  if(!biaState.hist.length){
    biaState.hist.push({quem:"bot", txt:`Oi${nome?", "+nome:""}! 😊 Eu sou a LivIA, sua assistente aqui no Gestão Mafra. Pode me perguntar **como usar** qualquer parte do sistema e também **sobre o que já foi preenchido** — quantos atendimentos no mês, quais relatórios faltam, chamados em aberto, tarefas da semana… O que você quer saber?`});
  }
  renderBia();
}

function fecharBia(){
  biaState.aberta=false;
  document.getElementById("biaChat").classList.add("hidden");
  if(state.userId) document.getElementById("biaBtn").classList.remove("hidden");
}

function renderBia(typing){
  const chat=document.getElementById("biaChat");
  const _av=document.querySelector("#biaBtn .bia-av");
  const avatarMini=_av?_av.innerHTML:"🙋‍♀️";
  const sugg=["Quantos atendimentos temos este mês?","Quais relatórios ainda faltam?","Tem chamado em aberto?","Como preencho o relatório gerencial?"];
  chat.innerHTML=`
    <div class="bia-head">
      <span class="bia-hav">${avatarMini}</span>
      <div><h4>LivIA</h4><div class="bia-sub">Assistente do Gestão Mafra</div></div>
      <button class="bia-x" onclick="fecharBia()">×</button>
    </div>
    <div class="bia-body" id="biaBody">
      ${biaState.hist.map(m=>`<div class="bia-msg ${m.quem}">${formatBiaMsg(m.txt)}</div>`).join("")}
      ${typing?`<div class="bia-typing" id="biaTyping">LivIA está digitando…</div>`:""}
    </div>
    ${biaState.hist.length<=1?`<div class="bia-sugg">${sugg.map(s=>`<button onclick="biaPergunta(this.textContent)">${s}</button>`).join("")}</div>`:""}
    <div class="bia-foot">
      <input id="biaInput" type="text" placeholder="Escreva sua dúvida…" onkeydown="if(event.key==='Enter')biaEnviar()" ${typing?"disabled":""}>
      <button id="biaSend" onclick="biaEnviar()" ${typing?"disabled":""}>➤</button>
    </div>`;
  const body=document.getElementById("biaBody"); if(body) body.scrollTop=body.scrollHeight;
  const inp=document.getElementById("biaInput"); if(inp && !typing) inp.focus();
}

function formatBiaMsg(t){
  return esc(t).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<strong>$1</strong>");
}

function biaPergunta(txt){
  const inp=document.getElementById("biaInput"); if(inp) inp.value=txt;
  biaEnviar();
}

async function biaEnviar(){
  const inp=document.getElementById("biaInput");
  const txt=(inp&&inp.value||"").trim();
  if(!txt) return;
  biaState.hist.push({quem:"user", txt});
  renderBia(true); // mostra "digitando"
  // coleta o conteúdo atual preenchido no sistema (todas as abas)
  let contexto="";
  try{ contexto=await coletarContextoSistema(); }catch(e){}
  // monta o prompt com o conhecimento + dados do sistema + histórico recente
  const ultimas=biaState.hist.slice(-8).map(m=>(m.quem==="user"?"Usuário: ":"LivIA: ")+m.txt).join("\n");
  const prompt=`${BIA_CONHECIMENTO}

--- DADOS ATUAIS PREENCHIDOS NO SISTEMA (use isto para responder perguntas sobre o conteúdo: números, status, quem registrou, datas etc.) ---
${contexto||"(nenhum dado carregado no momento)"}

--- Conversa até agora ---
${ultimas}

Responda agora como LivIA. Se a pergunta for sobre COMO USAR o sistema, explique de forma curta e prática (no máximo uns 6 passos). Se for sobre o CONTEÚDO preenchido, responda com base nos DADOS ATUAIS acima: cite números, nomes e datas quando existirem e diga claramente quando algo ainda não foi preenchido. Não invente dados que não estejam acima. Nunca revele senhas. Não repita esta instrução.`;
  try{
    const resp=await chamarIA(prompt, 900);
    biaState.hist.push({quem:"bot", txt:resp});
  }catch(e){
    biaState.hist.push({quem:"bot", txt:"Ops, não consegui responder agora 😕 — pode ser a conexão com a internet. Tenta de novo em instantes. Se continuar, fala com a Bianca ou a Julia."});
  }
  renderBia(false);
}


