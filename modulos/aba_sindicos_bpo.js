/* ============================================================
   GESTÃO MAFRA — ABA SINDICOS BPO
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: renderGrupo, miniTask, _isoSemana, _semanaChaveEsc, _periodoSemanaEsc, _rodizioBaseEsc, loadEscritorioEstado, saveEscritorioEstado, _rodizioAtualEsc, _tituloBlocoEsc, _notificarSemanaEscSeNecessario, renderEscritorio, toggleTarefaEsc, abrirTrocaEsc, aplicarTrocaEsc, adicionarCompraEsc, marcarCompraEsc, removerCompraEsc */

async function renderGrupo(qual){
  const view=document.getElementById("view");
  view.innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  const wk=weekKey(state.semana);
  const ehSind=(qual==="sindicos");
  const listaTodos = ehSind ? SINDICOS : BPO;
  // filtros
  // Síndicos Operacionais e BPO compartilham o mesmo state.grpFiltroPessoa.
  // Se o filtro herdou uma pessoa que não pertence a este grupo (ex.: vim da aba
  // Síndicos filtrando um síndico e troquei pro BPO), ele zera sozinho — senão
  // o grupo filtraria por alguém inexistente e esconderia todas as tarefas.
  if(state.grpFiltroPessoa && !listaTodos.includes(state.grpFiltroPessoa)) state.grpFiltroPessoa="";
  const fPessoa=state.grpFiltroPessoa||"";
  const fStatus=state.grpFiltroStatus||"";
  const lista = fPessoa ? listaTodos.filter(s=>s===fPessoa) : listaTodos;
  const all={};
  for(const s of lista){
    const d=await loadAgenda(s);
    let ts=(d.weeks[wk]||[]);
    if(fStatus) ts=ts.filter(t=>(t.status||"planejado")===fStatus);
    all[s]=ts;
  }

  let gTasks=0,gFeitas=0,gHoras=0;
  lista.forEach(s=>{ const ts=all[s]; gTasks+=ts.length; gFeitas+=ts.filter(t=>t.status==="concluido").length;
    gHoras+=ts.reduce((a,t)=>a+(parseFloat(t.horas)||0),0); });

  const titulo = ehSind ? "Síndicos Operacionais" : "BPO";
  const subt   = ehSind ? "Acompanhamento das horas técnicas e tarefas em campo" : "Financeiro · Comunicação · Coordenação";

  let html=`
  <div class="weeknav">
    <button class="nav-btn" onclick="changeWeek(-1)">‹</button>
    <button class="nav-btn" onclick="changeWeek(1)">›</button>
    <div class="weeknav-tit" onclick="escolherSemana(this)" title="Escolher uma data"><h2>${titulo} <span class="wk-cal">${ico('calendario')}</span></h2><div class="range">${subt} · ${rangeLabel(state.semana)}</div></div>
    ${isCurrentWeek(state.semana)?"":'<button class="today-btn" onclick="goToday()">Hoje</button>'}
    <div class="spacer"></div>
    <button class="btn-ghost" onclick="window.print()">Imprimir</button>
  </div>
  <div class="gv-filtros">
    <select class="gv-busca" style="flex:1;font-weight:600" onchange="state.grpFiltroPessoa=this.value;render()">
      <option value="">👥 Todos (${listaTodos.length})</option>
      ${listaTodos.map(uid=>`<option value="${uid}" ${fPessoa===uid?"selected":""}>${esc(USUARIOS[uid].nome)}</option>`).join("")}
    </select>
    <select class="gv-busca" style="font-weight:600" onchange="state.grpFiltroStatus=this.value;render()">
      <option value="">Todos os status</option>
      <option value="planejado" ${fStatus==="planejado"?"selected":""}>○ Planejado</option>
      <option value="em_andamento" ${fStatus==="em_andamento"?"selected":""}>◐ Em andamento</option>
      <option value="concluido" ${fStatus==="concluido"?"selected":""}>● Concluído</option>
    </select>
    ${(fPessoa||fStatus)?`<button class="btn-ghost" onclick="state.grpFiltroPessoa='';state.grpFiltroStatus='';render()">Limpar</button>`:""}
  </div>
  <div class="metabar">
    <div class="meta-item"><span class="lbl">${ehSind?'Síndicos':'Pessoas'}</span><span class="val">${lista.length}</span></div>
    <div class="meta-item"><span class="lbl">Tarefas na semana</span><span class="val">${gTasks}</span></div>
    <div class="meta-item"><span class="lbl">Concluídas</span><span class="val">${gFeitas}<small>/${gTasks}</small></span></div>
    ${ehSind?`<div class="meta-item"><span class="lbl">Horas técnicas</span><span class="val">${(gHoras%1?gHoras.toFixed(1):gHoras)}<small>h</small></span></div>`:``}
  </div>`;

  lista.forEach(s=>{
    const acc=USUARIOS[s]; const ts=all[s];
    const feitas=ts.filter(t=>t.status==="concluido").length;
    const ini=acc.nome.split(" ").map(w=>w[0]).slice(0,2).join("");
    let stats, badge;
    if(ehSind){
      const totalH=ts.reduce((a,t)=>a+(parseFloat(t.horas)||0),0);
      const hit=totalH>=META_HORAS;
      badge = ts.length===0?'<span class="badge no">Sem cronograma</span>'
        :(hit&&feitas===ts.length?'<span class="badge ok">✓ Em dia</span>':hit?'<span class="badge warn">Em execução</span>':'<span class="badge warn">Abaixo da meta</span>');
      stats=`<div class="sstat"><div class="v">${ts.length}</div><div class="l">Tarefas</div></div>
        <div class="sstat"><div class="v">${feitas}<small>/${ts.length}</small></div><div class="l">Feitas</div></div>
        <div class="sstat"><div class="v">${(totalH%1?totalH.toFixed(1):totalH)}<small>/${META_HORAS}h</small></div><div class="l">Horas</div></div>`;
    } else {
      const andamento=ts.filter(t=>t.status==="em_andamento").length;
      const altaPend=ts.some(t=>t.prioridade==="alta"&&t.status!=="concluido");
      badge = ts.length===0?'<span class="badge no">Sem demandas</span>'
        :altaPend?'<span class="badge no">⚑ Alta prioridade</span>'
        :(feitas===ts.length?'<span class="badge ok">✓ Em dia</span>':'<span class="badge warn">Em execução</span>');
      stats=`<div class="sstat"><div class="v">${ts.length}</div><div class="l">Tarefas</div></div>
        <div class="sstat"><div class="v">${andamento}</div><div class="l">Em and.</div></div>
        <div class="sstat"><div class="v">${feitas}<small>/${ts.length}</small></div><div class="l">Feitas</div></div>`;
    }
    let mg='';
    DIAS.forEach(dia=>{
      const dt=dateOfDay(state.semana,dia.off); const dayTs=ts.filter(t=>t.dia===dia.k);
      mg+=`<div class="mini-col"><div class="mh"><span>${dia.nome.slice(0,3)}</span><small>${fmt(dt)}</small></div><div class="mb">`;
      if(dayTs.length===0) mg+='<div class="mempty">—</div>';
      dayTs.forEach(t=>{ mg+=miniTask(t); });
      mg+=`</div></div>`;
    });
    html+=`<div class="sind-card" id="card-${s}">
      <div class="sind-head" onclick="document.getElementById('card-${s}').classList.toggle('open')">
        <div class="avatar" style="background:${acc.cor};color:#fff">${ini}</div>
        <div><div class="nm">${esc(acc.nome)}</div><div class="role">${esc(acc.cargo)} · @${s}</div></div>
        <div class="sind-stats">${stats}${badge}<span class="caret">▶</span></div>
      </div>
      <div class="sind-detail">
        <div style="text-align:right;margin-bottom:8px"><button class="btn-gold" style="padding:7px 14px;font-size:13px" onclick="event.stopPropagation();termometro('${s}')">🌡️ Termômetro de produtividade</button></div>
        <div class="mini-grid">${mg}</div></div>
    </div>`;
  });

  html+=`<div style="text-align:center;margin-top:18px"><button class="btn-ghost" onclick="render()">↻ Atualizar dados</button></div>`;
  view.innerHTML=html;
  const first=document.getElementById("card-"+lista[0]); if(first) first.classList.add("open");
}

function miniTask(t){
  if(t.condominio!==undefined){
    const h=(parseFloat(t.horas)||0);
    return `<div class="mtask ${statusCls(t.status)}">
      <div class="mc">${ico('local')} ${esc(t.condominio)}</div>
      <div class="mt">${esc(t.tarefa)}</div>
      <div class="mm">${h?(h%1?h.toFixed(1):h)+'h · ':''}${statusLabel(t.status)}</div>
      ${t.evidencia?`<div class="mev">✔ ${esc(t.evidencia)}</div>`:""}
    </div>`;
  }
  const pr={baixa:"Baixa",media:"Média",alta:"Alta"}[t.prioridade]||"Média";
  return `<div class="mtask ${statusCls(t.status)}">
    <div class="mt">${esc(t.titulo)}</div>
    <div class="mm">${pr} · ${statusLabel(t.status)}</div>
    ${t.detalhes?`<div class="mev">${esc(t.detalhes)}</div>`:""}
  </div>`;
}

function _isoSemana(d){
  d = d || new Date();
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(),0,1));
  const wk = Math.ceil((((dt - yearStart) / 86400000) + 1) / 7);
  return { ano: dt.getUTCFullYear(), semana: wk };
}

function _semanaChaveEsc(d){
  const {ano, semana} = _isoSemana(d);
  return `${ano}-${String(semana).padStart(2,'0')}`;
}

function _periodoSemanaEsc(chave){
  const [ano, wk] = chave.split('-').map(Number);
  // Segunda-feira da semana ISO 1 do ano
  const jan4 = new Date(ano, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const segSem1 = new Date(jan4);
  segSem1.setDate(jan4.getDate() - jan4Day + 1);
  const seg = new Date(segSem1);
  seg.setDate(segSem1.getDate() + (wk - 1) * 7);
  const dom = new Date(seg);
  dom.setDate(seg.getDate() + 6);
  const fmt = d => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
  return `${fmt(seg)} – ${fmt(dom)}`;
}

function _rodizioBaseEsc(chave){
  const wk = parseInt(chave.split('-')[1], 10);
  // 3 blocos rotativos: cada semana cada pessoa pega um bloco diferente
  return {
    A: BPO_ESCRITORIO[(wk + 0) % 3],
    B: BPO_ESCRITORIO[(wk + 1) % 3],
    C: BPO_ESCRITORIO[(wk + 2) % 3],
    panos:     BPO_ESCRITORIO[wk % 3],
    lixoSexta: BPO_ESCRITORIO[(wk + 1) % 3]
  };
}

async function loadEscritorioEstado(){
  try{ const v = await storeGet("mafra:escritorio"); if(v) return JSON.parse(v); }catch(e){}
  return { semanas:{}, compras:[] };
}

async function saveEscritorioEstado(d){
  _storeCacheClear("mafra:escritorio");
  return await storeSet("mafra:escritorio", JSON.stringify(d));
}

async function _rodizioAtualEsc(chave){
  const base = _rodizioBaseEsc(chave);
  const est = await loadEscritorioEstado();
  const semData = (est.semanas||{})[chave] || {};
  const ov = semData.overrides || {};
  return { ...base, ...ov };
}

function _tituloBlocoEsc(id){
  if(id === "panos") return "🧺 Levar panos pra lavar";
  if(id === "lixoSexta") return "🗑️ Descer o lixo (sexta)";
  const b = ESCRITORIO_BLOCOS.find(x => x.id === id);
  return b ? `${b.icone} ${b.titulo}` : id;
}

async function _notificarSemanaEscSeNecessario(chave, rod){
  const est = await loadEscritorioEstado();
  const semData = (est.semanas||{})[chave] || {};
  if(semData.notificada) return;
  // monta resumo do que cada um faz
  for(const uid of [...new Set([rod.A, rod.B, rod.C, rod.panos, rod.lixoSexta])]){
    const partes = [];
    if(rod.A === uid) partes.push("🗑️ Lixo+móveis+papéis");
    if(rod.B === uid) partes.push("🧼 Aspirar+louça");
    if(rod.C === uid) partes.push("🧹 Passar pano");
    if(rod.panos === uid) partes.push("🧺 Levar panos");
    if(rod.lixoSexta === uid) partes.push("🗑️ Lixo sexta");
    if(partes.length){
      await pushAviso(uid, {
        id:"esc"+Date.now()+Math.random().toString(36).slice(2,5),
        texto:`🧹 Suas tarefas no escritório esta semana`,
        sub: partes.join(" · "),
        ts: Date.now()
      });
    }
  }
  est.semanas = est.semanas || {};
  est.semanas[chave] = { ...semData, notificada: true };
  await saveEscritorioEstado(est);
}

async function renderEscritorio(){
  if(!BPO_ESCRITORIO.includes(state.userId)){
    state.tab = "inicio"; render(); return;
  }
  const view = document.getElementById("view");
  const chave = _semanaChaveEsc();
  const periodo = _periodoSemanaEsc(chave);
  const wkNum = parseInt(chave.split('-')[1], 10);
  const rod = await _rodizioAtualEsc(chave);
  const est = await loadEscritorioEstado();
  const semData = (est.semanas||{})[chave] || {};
  const conc = semData.concluidas || {};
  const compras = est.compras || [];
  const eu = state.userId;

  // Dispara avisos da semana, se ainda não disparou
  await _notificarSemanaEscSeNecessario(chave, rod);

  // Quais tarefas são minhas esta semana?
  const minhasPartes = [];
  if(rod.A === eu) minhasPartes.push({ic:ESCRITORIO_BLOCOS[0].icone, t:ESCRITORIO_BLOCOS[0].titulo});
  if(rod.B === eu) minhasPartes.push({ic:ESCRITORIO_BLOCOS[1].icone, t:ESCRITORIO_BLOCOS[1].titulo});
  if(rod.C === eu) minhasPartes.push({ic:ESCRITORIO_BLOCOS[2].icone, t:ESCRITORIO_BLOCOS[2].titulo});
  if(rod.panos === eu) minhasPartes.push({ic:"🧺", t:"Levar panos pra lavar"});
  if(rod.lixoSexta === eu) minhasPartes.push({ic:"🗑️", t:"Descer o lixo (sexta)"});

  let html = `<div class="weeknav"><div><h2>🧹 Escritório</h2><div class="range">Semana ${wkNum} · ${periodo}</div></div></div>`;

  // Card de resumo "Minhas tarefas"
  html += `<div class="esc-resumo">
    <div class="esc-r-titulo">📋 Suas tarefas esta semana</div>
    ${minhasPartes.length===0
      ? `<div class="esc-r-vazio">Você está de folga das tarefas do escritório esta semana 🎉</div>`
      : `<ul class="esc-r-list">${minhasPartes.map(p => `<li>${p.ic} ${esc(p.t)}</li>`).join("")}</ul>`
    }
  </div>`;

  // Blocos de tarefas A/B/C
  html += `<div class="esc-sec"><h3>Tarefas da semana</h3>`;
  ESCRITORIO_BLOCOS.forEach(b => {
    const uid = rod[b.id];
    const nome = USUARIOS[uid] ? USUARIOS[uid].nome.split(" ")[0] : uid;
    const ehMinha = uid === eu;
    const cBloco = conc[b.id] || {};
    html += `<div class="esc-bloco ${ehMinha?'esc-bloco-eu':''}">
      <div class="esc-b-head">
        <div class="esc-b-titulo">${b.icone} ${esc(b.titulo)}</div>
        <div class="esc-b-resp">
          <span class="esc-b-resp-lbl">Responsável:</span>
          <span class="esc-b-resp-nome">${esc(nome)}</span>
          <button class="btn-ghost hd-mini" onclick="abrirTrocaEsc('${b.id}')">🔄 Trocar</button>
        </div>
      </div>
      <ul class="esc-tarefas">
        ${b.tarefas.map((t,i) => {
          const f = cBloco[i];
          const fNome = f && USUARIOS[f.by] ? USUARIOS[f.by].nome.split(" ")[0] : (f?f.by:"");
          const fData = f ? new Date(f.at).toLocaleDateString("pt-BR") : "";
          return `<li class="${f?'esc-t-feita':''}">
            <label>
              <input type="checkbox" ${f?'checked':''} onchange="toggleTarefaEsc('${b.id}', ${i})">
              <span>${esc(t)}${f?` <span class="esc-f-info">(${esc(fNome)} · ${fData})</span>`:""}</span>
            </label>
          </li>`;
        }).join("")}
      </ul>
    </div>`;
  });
  html += `</div>`;

  // Panos + lixo sexta
  function _rodSecundario(id, titulo, eu, conc){
    const uid = rod[id];
    const nome = USUARIOS[uid] ? USUARIOS[uid].nome.split(" ")[0] : uid;
    const ehMinha = uid === eu;
    const f = conc[id] && conc[id][0];
    const fNome = f && USUARIOS[f.by] ? USUARIOS[f.by].nome.split(" ")[0] : (f?f.by:"");
    const fData = f ? new Date(f.at).toLocaleDateString("pt-BR") : "";
    return `<div class="esc-bloco ${ehMinha?'esc-bloco-eu':''}">
      <div class="esc-b-head">
        <div class="esc-b-titulo">${titulo}</div>
        <div class="esc-b-resp">
          <span class="esc-b-resp-lbl">Responsável:</span>
          <span class="esc-b-resp-nome">${esc(nome)}</span>
          <button class="btn-ghost hd-mini" onclick="abrirTrocaEsc('${id}')">🔄 Trocar</button>
        </div>
      </div>
      <ul class="esc-tarefas">
        <li class="${f?'esc-t-feita':''}">
          <label>
            <input type="checkbox" ${f?'checked':''} onchange="toggleTarefaEsc('${id}',0)">
            <span>${id==='panos'?'Levar panos':'Descer o lixo'}${f?` <span class="esc-f-info">(${esc(fNome)} · ${fData})</span>`:""}</span>
          </label>
        </li>
      </ul>
    </div>`;
  }
  html += `<div class="esc-sec"><h3>Outros rodízios</h3>
    ${_rodSecundario('panos','🧺 Levar panos pra lavar (chão + prato)', eu, conc)}
    ${_rodSecundario('lixoSexta','🗑️ Descer o lixo na sexta-feira', eu, conc)}
  </div>`;

  // Lista de compras
  const pendentes = compras.filter(c => !c.comprado);
  const comprados = compras.filter(c => c.comprado);
  html += `<div class="esc-sec esc-compras-sec">
    <h3>🛒 Lista de compras <span class="esc-compras-sub">— a Bianca compra</span></h3>
    <button class="btn-gold" style="margin-bottom:12px" onclick="adicionarCompraEsc()">＋ Adicionar item</button>
    ${pendentes.length === 0
      ? `<div class="esc-vazio">Nada pendente.</div>`
      : `<ul class="esc-lista-compras">
          ${pendentes.map(c => {
            const qNome = USUARIOS[c.addBy] ? USUARIOS[c.addBy].nome.split(" ")[0] : c.addBy;
            const podeRem = c.addBy === eu || eu === "bianca";
            return `<li>
              <label class="esc-c-label">
                <input type="checkbox" onchange="marcarCompraEsc('${c.id}')">
                <span class="esc-c-item">${esc(c.item)}</span>
                <span class="esc-c-info">(${esc(qNome)} · ${new Date(c.addAt).toLocaleDateString("pt-BR")})</span>
              </label>
              ${podeRem ? `<button class="btn-del hd-mini" onclick="removerCompraEsc('${c.id}')" title="Remover item">×</button>` : ""}
            </li>`;
          }).join("")}
        </ul>`
    }
    ${comprados.length > 0 ? `<details class="esc-comprados-det">
      <summary>Histórico — ${comprados.length} já comprado${comprados.length>1?'s':''}</summary>
      <ul class="esc-lista-compras esc-lista-feitas">
        ${comprados.slice().reverse().slice(0,30).map(c => {
          const pNome = USUARIOS[c.compradoPor] ? USUARIOS[c.compradoPor].nome.split(" ")[0] : (c.compradoPor||"?");
          return `<li class="esc-c-feita">
            <span class="esc-c-item">${esc(c.item)}</span>
            <span class="esc-c-info">comprado por ${esc(pNome)} · ${new Date(c.compradoEm||c.addAt).toLocaleDateString("pt-BR")}</span>
          </li>`;
        }).join("")}
      </ul>
    </details>` : ""}
  </div>`;

  view.innerHTML = html;
}

async function toggleTarefaEsc(blocoId, tarefaIdx){
  const chave = _semanaChaveEsc();
  const est = await loadEscritorioEstado();
  est.semanas = est.semanas || {};
  est.semanas[chave] = est.semanas[chave] || {};
  est.semanas[chave].concluidas = est.semanas[chave].concluidas || {};
  const conc = est.semanas[chave].concluidas;
  conc[blocoId] = conc[blocoId] || {};
  if(conc[blocoId][tarefaIdx]){
    delete conc[blocoId][tarefaIdx];
  } else {
    conc[blocoId][tarefaIdx] = { by: state.userId, at: Date.now() };
  }
  await saveEscritorioEstado(est);
  render();
}

async function abrirTrocaEsc(blocoId){
  const chave = _semanaChaveEsc();
  const rod = await _rodizioAtualEsc(chave);
  const atual = rod[blocoId];
  const atualNome = USUARIOS[atual] ? USUARIOS[atual].nome : atual;
  const outros = BPO_ESCRITORIO.filter(u => u !== atual);
  const tit = _tituloBlocoEsc(blocoId);
  const btns = outros.map(u =>
    `<button class="btn-primary" style="flex:1" onclick="aplicarTrocaEsc('${blocoId}','${u}')">${esc(USUARIOS[u]?USUARIOS[u].nome.split(" ")[0]:u)}</button>`
  ).join("");
  document.getElementById("modalMount").innerHTML = `<div class="overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal">
      <div class="modal-head"><h3>🔄 Trocar responsável</h3><button class="x" onclick="closeModal()">×</button></div>
      <div class="modal-body">
        <p style="margin:0 0 6px 0;font-size:13px;color:var(--muted)">Tarefa: <b style="color:var(--navy)">${tit}</b></p>
        <p style="margin:0 0 12px 0;font-size:13px;color:var(--muted)">Atualmente é da <b style="color:var(--navy)">${esc(atualNome)}</b>. Passar para:</p>
        <div style="display:flex;gap:8px;margin-bottom:12px">${btns}</div>
        <div class="modal-foot"><button class="btn-cancel" style="flex:1" onclick="closeModal()">Cancelar</button></div>
      </div>
    </div>
  </div>`;
}

async function aplicarTrocaEsc(blocoId, novoUid){
  const chave = _semanaChaveEsc();
  const est = await loadEscritorioEstado();
  est.semanas = est.semanas || {};
  est.semanas[chave] = est.semanas[chave] || {};
  est.semanas[chave].overrides = est.semanas[chave].overrides || {};
  est.semanas[chave].overrides[blocoId] = novoUid;
  await saveEscritorioEstado(est);
  // notifica quem assumiu
  if(novoUid !== state.userId){
    await pushAviso(novoUid, {
      id:"esc"+Date.now()+Math.random().toString(36).slice(2,5),
      texto:`🔄 ${state.user.nome.split(" ")[0]} passou pra você: ${_tituloBlocoEsc(blocoId)}`,
      sub:`Esta semana`,
      ts: Date.now()
    });
  }
  closeModal();
  render();
}

async function adicionarCompraEsc(){
  const item = prompt("O que precisa comprar?");
  if(!item || !item.trim()) return;
  const est = await loadEscritorioEstado();
  est.compras = est.compras || [];
  est.compras.push({
    id: "cmp"+Date.now()+Math.random().toString(36).slice(2,5),
    item: item.trim(),
    addBy: state.userId,
    addAt: Date.now(),
    comprado: false
  });
  await saveEscritorioEstado(est);
  // notifica a Bianca (se quem adicionou não foi ela)
  if(state.userId !== "bianca"){
    await pushAviso("bianca", {
      id:"esc"+Date.now()+Math.random().toString(36).slice(2,5),
      texto:`🛒 ${state.user.nome.split(" ")[0]} adicionou à lista de compras: ${item.trim()}`,
      sub:`Lista do escritório`,
      ts: Date.now()
    });
  }
  render();
}

async function marcarCompraEsc(id){
  const est = await loadEscritorioEstado();
  est.compras = est.compras || [];
  const item = est.compras.find(c => c.id === id);
  if(!item) return;
  item.comprado = true;
  item.compradoEm = Date.now();
  item.compradoPor = state.userId;
  await saveEscritorioEstado(est);
  render();
}

async function removerCompraEsc(id){
  if(!confirm("Remover este item da lista?")) return;
  const est = await loadEscritorioEstado();
  est.compras = (est.compras || []).filter(c => c.id !== id);
  await saveEscritorioEstado(est);
  render();
}


