/* =========================================================================
   ABA VISTORIA — Diagnóstico Executivo 360°
   Auditoria patrimonial de condomínios horizontais, associações e loteamentos.
   Dashboard executivo + radar de maturidade + plano de ação + investimentos
   + PDF executivo. Mantém o modelo de dados (chaves de item/classificação).
   ========================================================================= */

const VISTORIA_TEMPLATE = [
  { t:"Portaria, Acessos e Segurança Perimetral", s:[
    { t:"Estrutura Física", i:["Guarita","Banheiro da portaria","Mobiliário","Equipamentos","Ar-condicionado","Sistema de monitoramento"] },
    { t:"Controle de Acesso", i:["Moradores","Visitantes","Prestadores de serviço","Aplicativos de liberação","Biometria","Tags veiculares","QR Code"] },
    { t:"Segurança Perimetral", i:["Muros","Gradis","Cercas","Concertinas","Sensores","Cercas elétricas","Torres de vigilância"] },
    { t:"Experiência do Morador", i:["Tempo médio de liberação","Cordialidade dos porteiros","Uniformização","Comunicação"] },
  ]},
  { t:"Vias Internas e Mobilidade", s:[
    { t:"Sistema Viário", i:["Pavimentação","Asfalto","Bloquetes","Meio-fio","Sarjetas"] },
    { t:"Sinalização", i:["Horizontal","Vertical","Lombadas","Faixas de pedestres","Placas"] },
    { t:"Mobilidade", i:["Acessibilidade","Ciclovias","Calçadas","Rotas seguras"] },
    { t:"Drenagem", i:["Bocas de lobo","Grelhas","Galerias pluviais","Pontos de alagamento"] },
  ]},
  { t:"Áreas Verdes e Paisagismo", s:[
    { t:"Conservação", i:["Gramados","Árvores","Jardins","Palmeiras"] },
    { t:"Fitossanidade", i:["Pragas","Cupins","Formigas","Doenças vegetais"] },
    { t:"Irrigação", i:["Automatizada","Manual","Vazamentos"] },
    { t:"Valorização Visual", i:["Padronização","Limpeza","Poda"] },
  ]},
  { t:"Áreas de Lazer", s:[
    { t:"Piscinas", i:["Qualidade da água","Casa de máquinas","Cercamento","Equipamentos"] },
    { t:"Quadras", i:["Piso","Alambrado","Iluminação","Redes"] },
    { t:"Playground", i:["Certificações","Estrutura","Pisos amortecedores"] },
    { t:"Academia", i:["Equipamentos","Limpeza","Manutenção"] },
    { t:"Quiosques e Salões", i:["Conservação","Equipamentos","Climatização"] },
  ]},
  { t:"Segurança Eletrônica", s:[
    { t:"CFTV", i:["Cobertura","Pontos cegos","Gravação","Retenção de imagens"] },
    { t:"Controle de Acesso", i:["Integrações","Relatórios","Auditorias"] },
    { t:"Sistemas Inteligentes", i:["LPR","Reconhecimento facial","Aplicativos"] },
    { t:"Central de Monitoramento", i:["Procedimentos","Backup","Continuidade operacional"] },
  ]},
  { t:"Manutenção Predial e Infraestrutura", s:[
    { t:"Estruturas", i:["Portarias","Salões","Quiosques","Bases operacionais"] },
    { t:"Coberturas", i:["Telhados","Calhas","Rufos"] },
    { t:"Pintura", i:["Interna","Externa"] },
    { t:"Iluminação", i:["Posteamento","Refletores","LED"] },
  ]},
  { t:"Sistemas Hidráulicos", s:[
    { t:"Reservatórios", i:["Limpeza","Impermeabilização","Tampas"] },
    { t:"Rede de Distribuição", i:["Vazamentos","Pressão","Setorização"] },
    { t:"Bombas", i:["Operação","Manutenção","Redundância"] },
    { t:"Poços e Sistemas Próprios", i:["Outorga","Qualidade da água","Equipamentos"] },
  ]},
  { t:"Sistemas Elétricos", s:[
    { t:"Entrada de Energia", i:["Cabines","Transformadores","Proteções"] },
    { t:"Quadros Elétricos", i:["Organização","Identificação","Segurança"] },
    { t:"Iluminação Pública Interna", i:["Cobertura","Eficiência"] },
    { t:"Geradores", i:["Funcionamento","Contratos","Testes"] },
  ]},
  { t:"Segurança Contra Incêndio", s:[
    { t:"Documentação", i:["AVCB","Projetos","Licenças"] },
    { t:"Equipamentos", i:["Extintores","Hidrantes","Bombas"] },
    { t:"Rotas de Fuga", i:["Sinalização","Iluminação de emergência"] },
    { t:"Brigada", i:["Formação","Treinamentos","Simulados"] },
  ]},
  { t:"Limpeza e Zeladoria", s:[
    { t:"Equipe", i:["Quantitativo","Escalas","Uniformes"] },
    { t:"Ferramentas", i:["Equipamentos","Organização"] },
    { t:"Almoxarifado", i:["Controle","Estoque"] },
    { t:"Procedimentos", i:["Cronogramas","Checklists","Auditorias"] },
  ]},
  { t:"Governança, Documentação e Compliance", s:[
    { t:"Documentação Legal", i:["Estatuto","Regulamento Interno","Convenção","Atas"] },
    { t:"Contratos", i:["Prestadores","Seguros","Manutenções"] },
    { t:"Obrigações Legais", i:["Laudos","Licenças","Certificados"] },
    { t:"LGPD", i:["Tratamento de dados","Imagens","Cadastros"] },
  ]},
  { t:"Experiência do Morador", s:[
    { t:"Comunicação", i:["Aplicativo","WhatsApp","Murais","QR Codes"] },
    { t:"Atendimento", i:["Tempo de resposta","Qualidade das respostas"] },
    { t:"Percepção de Segurança", i:["Pesquisa de satisfação","Reclamações recorrentes"] },
    { t:"Convivência", i:["Uso das áreas comuns","Eventos","Engajamento comunitário"] },
  ]},
];

// rótulos curtos para o menu de blocos / radar não usados diretamente
const VIS_BLOCO_CURTO = ["Portaria e Segurança","Mobilidade","Paisagismo","Áreas de Lazer","Segurança Eletrônica","Infraestrutura","Sistemas Hidráulicos","Sistemas Elétricos","Incêndio","Limpeza e Zeladoria","Governança e Compliance","Experiência do Morador"];

// Classificação (chaves internas preservadas para compatibilidade dos dados)
const VIS_CLASS = {
  conforme:    { ic:"🟢", lbl:"Conforme",            cor:"#1E9E5A", prazo:"", mat:100 },
  baixo:       { ic:"🟡", lbl:"Atenção",             cor:"#D9A300", prazo:"Melhoria programada · até 90 dias", mat:70 },
  medio:       { ic:"🟠", lbl:"Necessita correção",  cor:"#E07B1A", prazo:"Correção prioritária · até 30 dias", mat:45 },
  critico:     { ic:"🔴", lbl:"Crítico",             cor:"#D23B3B", prazo:"Ação imediata · até 7 dias", mat:15 },
  oportunidade:{ ic:"🔵", lbl:"Oportunidade",        cor:"#2C7BE5", prazo:"Valorização · planejamento anual", mat:90 },
  na:          { ic:"⚪", lbl:"N/A",                 cor:"#8a93a3", prazo:"", mat:null },
};
const VIS_ORDEM_CLASS = ["conforme","baixo","medio","critico","oportunidade","na"];
const VIS_NAO_CONF = ["critico","medio","baixo"];     // não conformidades
const VIS_ACHADOS = ["critico","medio","baixo","oportunidade"]; // entram no plano de ação/PDF

// Status do plano de ação
const VIS_ACAO_ST = {
  pendente:   { lbl:"Pendente",       cor:"#8a93a3" },
  contratacao:{ lbl:"Em contratação", cor:"#D9A300" },
  execucao:   { lbl:"Em execução",    cor:"#2C7BE5" },
  concluido:  { lbl:"Concluído",      cor:"#1E9E5A" },
};

// Radar de maturidade — 8 dimensões mapeadas aos blocos (índices 0-based, overlap permitido)
const VIS_DIMENSOES = [
  { lbl:"Segurança",      blocos:[0,4,8] },
  { lbl:"Manutenção",     blocos:[5,3] },
  { lbl:"Infraestrutura", blocos:[1,6,7] },
  { lbl:"Governança",     blocos:[10] },
  { lbl:"Experiência",    blocos:[11] },
  { lbl:"Compliance",     blocos:[10] },
];

/* ===== ROTEIRO 2 — VISTORIA DIAGNÓSTICA 360° · CONDOMÍNIOS COMERCIAIS E CENTROS EMPRESARIAIS ===== */
const VIS_TPL_COMERCIAL = [
  { t:"Fachada e Imagem Corporativa", s:[
    { t:"Itens de verificação", i:["Fachada","Totens","Comunicação visual","Paisagismo","Iluminação externa","Marquises","ACM","Letreiros"] },
  ]},
  { t:"Acessos e Fluxo de Público", s:[
    { t:"Itens de verificação", i:["Portaria","Catracas","Biometria","Controle de visitantes","Acesso de prestadores","Controle de entregas","Fluxo de carga e descarga","Acessibilidade"] },
  ]},
  { t:"Experiência do Cliente e Usuário", s:[
    { t:"Itens de verificação", i:["Recepção","Sinalização","Wayfinding","Limpeza","Conforto térmico","Conforto visual","Conforto acústico","Atendimento"] },
  ]},
  { t:"Áreas Comuns", s:[
    { t:"Itens de verificação", i:["Halls","Corredores","Escadas","Elevadores","Salas de reunião","Coworking","Áreas de convivência"] },
  ]},
  { t:"Sanitários e Vestiários", s:[
    { t:"Itens de verificação", i:["Higienização","Dispensers","Ventilação","Acessibilidade","Controle de limpeza"] },
  ]},
  { t:"Operação dos Lojistas e Condôminos", s:[
    { t:"Itens de verificação", i:["Padronização visual","Fachadas internas","Uso de áreas comuns","Gestão de resíduos","Carga e descarga","Horários operacionais"] },
  ]},
  { t:"Estacionamento", s:[
    { t:"Itens de verificação", i:["Pintura","Sinalização","Fluxo de veículos","CFTV","Cancelas","Drenagem","Iluminação","Vagas especiais"] },
  ]},
  { t:"Sistemas Prediais", s:[
    { t:"Itens de verificação", i:["Elétrica","Hidráulica","Ar-condicionado central","PMOC","Gerador","Elevadores","Bombas"] },
  ]},
  { t:"Segurança Contra Incêndio", s:[
    { t:"Itens de verificação", i:["AVCB","Brigada","Extintores","Hidrantes","Alarmes","Detectores","Rotas de fuga","Iluminação de emergência"] },
  ]},
  { t:"Segurança Patrimonial", s:[
    { t:"Itens de verificação", i:["CFTV","Monitoramento","Controle de acesso","Alarmes","Cercamento","Central de monitoramento","Protocolos de crise"] },
  ]},
  { t:"Documentação e Compliance", s:[
    { t:"Itens de verificação", i:["Contratos","Laudos","Licenças","AVCB","PMOC","NR's","Seguro","Certificações"] },
  ]},
  { t:"Performance Operacional e Valorização", s:[
    { t:"Indicadores", i:["Vacância","Inadimplência","Fluxo de público","Custos operacionais"] },
    { t:"Oportunidades", i:["Automação","Eficiência energética","Retrofit","Modernização tecnológica","Inteligência artificial","Sustentabilidade","ESG"] },
  ]},
];
const VIS_CURTO_COMERCIAL = ["Fachada e Imagem","Acessos e Fluxo","Experiência do Cliente","Áreas Comuns","Sanitários","Lojistas e Condôminos","Estacionamento","Sistemas Prediais","Incêndio","Segurança Patrimonial","Documentação","Performance"];
const VIS_DIMS_COMERCIAL = [
  { lbl:"Segurança",      blocos:[1,8,9] },
  { lbl:"Manutenção",     blocos:[7,4] },
  { lbl:"Infraestrutura", blocos:[0,3,6] },
  { lbl:"Governança",     blocos:[5,10] },
  { lbl:"Experiência",    blocos:[2,3] },
  { lbl:"Performance",    blocos:[11] },
];

/* ===== ROTEIRO 3 — VISTORIA DIAGNÓSTICA 360° · CONDOMÍNIOS RESIDENCIAIS (PRÉDIOS E TORRES) ===== */
const VIS_TPL_RESIDENCIAL = [
  { t:"Fachada e Entorno", s:[
    { t:"Itens de verificação", i:["Fachada, pintura e revestimentos","Trincas e fissuras","Iluminação externa","Paisagismo","Calçadas e acessibilidade","Muros e gradis","Comunicação visual","Lixeiras externas","Drenagem pluvial","CFTV perimetral","Portões externos","Limpeza geral do entorno"] },
  ]},
  { t:"Portaria e Controle de Acesso", s:[
    { t:"Estrutura Física", i:["Guarita","Mobiliário","Equipamentos","Ar-condicionado","Banheiro da portaria","CFTV","Botão de pânico"] },
    { t:"Procedimentos", i:["Controle de visitantes","Prestadores de serviço","Entregas","Correspondências","Cadastro de moradores","Controle de chaves","Livro de ocorrências","Procedimentos operacionais"] },
    { t:"Experiência do Morador", i:["Tempo de atendimento","Cordialidade","Apresentação pessoal","Uniformização","Comunicação"] },
  ]},
  { t:"Áreas Comuns", s:[
    { t:"Itens de verificação", i:["Halls","Corredores","Escadarias","Elevadores","Sinalização","Iluminação","Decoração","Mobiliários","Limpeza","Odorização"] },
  ]},
  { t:"Lazer e Convivência", s:[
    { t:"Piscinas", i:["Qualidade da água","Casa de máquinas","Cercamento","Drenagem","Mobiliário"] },
    { t:"Salão de Festas", i:["Conservação","Equipamentos","Climatização"] },
    { t:"Academia", i:["Equipamentos","Manutenção","Higienização"] },
    { t:"Playground", i:["Certificações","Pisos amortecedores","Conservação"] },
    { t:"Espaços Gourmet", i:["Equipamentos","Limpeza","Segurança"] },
  ]},
  { t:"Garagem", s:[
    { t:"Itens de verificação", i:["Pintura","Sinalização horizontal","Sinalização vertical","Vagas PCD","Vagas visitantes","Drenagem","Ventilação","Iluminação","CFTV","Controle de acesso"] },
  ]},
  { t:"Sistemas Prediais", s:[
    { t:"Elétrica", i:["Quadros","Barramentos","SPDA","Gerador"] },
    { t:"Hidráulica", i:["Reservatórios","Bombas","Pressurizadores"] },
    { t:"Gás", i:["Central","Tubulações","Sinalização"] },
    { t:"Elevadores", i:["Contrato","Laudos","Funcionamento"] },
  ]},
  { t:"Segurança Contra Incêndio", s:[
    { t:"Itens de verificação", i:["AVCB","Extintores","Hidrantes","Alarmes","Detectores","Iluminação de emergência","Rotas de fuga","Brigada","Treinamentos"] },
  ]},
  { t:"Limpeza e Zeladoria", s:[
    { t:"Itens de verificação", i:["Cronograma","Produtos","Almoxarifado","Ferramentas","Organização","EPIs","Uniformização"] },
  ]},
  { t:"Documentação e Compliance", s:[
    { t:"Itens de verificação", i:["Convenção","Regimento","Atas","Contratos","Seguro","AVCB","PMOC","NR's","Laudos obrigatórios","Plano de manutenção"] },
  ]},
  { t:"Experiência do Morador", s:[
    { t:"Itens de verificação", i:["Atendimento","Comunicação","Aplicativos","QR Codes","Tempo de resposta","Pesquisa de satisfação","Reclamações recorrentes","Engajamento comunitário"] },
  ]},
  { t:"Governança e Gestão", s:[
    { t:"Itens de verificação", i:["Planejamento anual","Indicadores","Controle financeiro","Inadimplência","Fundo de reserva","Prestação de contas","Transparência","Gestão de fornecedores"] },
  ]},
  { t:"Oportunidades de Valorização", s:[
    { t:"Itens de verificação", i:["Eficiência energética","Energia solar","Automação","Retrofit","Segurança eletrônica","Sustentabilidade","Acessibilidade","Modernização estética"] },
  ]},
];
const VIS_CURTO_RESIDENCIAL = ["Fachada e Entorno","Portaria e Acesso","Áreas Comuns","Lazer e Convivência","Garagem","Sistemas Prediais","Incêndio","Limpeza e Zeladoria","Documentação","Experiência do Morador","Governança e Gestão","Valorização"];
const VIS_DIMS_RESIDENCIAL = [
  { lbl:"Segurança",      blocos:[1,4,6] },
  { lbl:"Manutenção",     blocos:[3,5,7] },
  { lbl:"Infraestrutura", blocos:[0,2] },
  { lbl:"Governança",     blocos:[8,10] },
  { lbl:"Experiência",    blocos:[9] },
  { lbl:"Valorização",    blocos:[11] },
];

/* ===== Tipos de vistoria — cada formato de condomínio tem o seu roteiro =====
   IMPORTANTE: as chaves dos itens salvos (b/s/i) são posicionais dentro do template
   do TIPO da vistoria. Registros antigos sem campo "tipo" usam o horizontal. */
const VIS_TIPOS = {
  horizontal: { lbl:"Condomínios Horizontais e Associações",          tpl:VISTORIA_TEMPLATE,  curto:VIS_BLOCO_CURTO,     dims:VIS_DIMENSOES },
  comercial:  { lbl:"Condomínios Comerciais e Centros Empresariais",  tpl:VIS_TPL_COMERCIAL,  curto:VIS_CURTO_COMERCIAL, dims:VIS_DIMS_COMERCIAL },
  residencial:{ lbl:"Condomínios Residenciais (Prédios e Torres)",    tpl:VIS_TPL_RESIDENCIAL, curto:VIS_CURTO_RESIDENCIAL, dims:VIS_DIMS_RESIDENCIAL },
};
const VIS_TIPO_PADRAO = "horizontal";
function _visTipoDe(rec){ const t=rec&&rec.tipo; return (t&&VIS_TIPOS[t])?t:VIS_TIPO_PADRAO; }
function _visTpl(rec){ return VIS_TIPOS[_visTipoDe(rec)].tpl; }
function _visCurto(rec){ return VIS_TIPOS[_visTipoDe(rec)].curto; }
function _visDims(rec){ return VIS_TIPOS[_visTipoDe(rec)].dims; }
function _visTipoLbl(rec){ return VIS_TIPOS[_visTipoDe(rec)].lbl; }
function _visTipoOpts(sel){ return Object.keys(VIS_TIPOS).map(k=>`<option value="${k}" ${k===sel?"selected":""}>${esc(VIS_TIPOS[k].lbl)}</option>`).join(""); }

/* ===== Cadastro: tipo de vistoria PADRÃO por condomínio =====
   Guardado em "mafra:vis_cond_tipos" = { "Condomínio": "residencial", ... }.
   Ao escolher o condomínio numa vistoria nova, o tipo já vem preenchido. */
let _visCondTiposCache = null;
async function _visCondTiposLoad(){ try{ const v=await storeGet("mafra:vis_cond_tipos"); if(v){ const o=JSON.parse(v); if(o&&typeof o==="object") return o; } }catch(e){} return {}; }
async function _visCondTiposSave(map){ return await storeSet("mafra:vis_cond_tipos", JSON.stringify(map||{})); }
function _visTipoPadraoCond(cond){ const t=(_visCondTiposCache||{})[cond]; return (t&&VIS_TIPOS[t])?t:VIS_TIPO_PADRAO; }
// preenche o <select> de tipo conforme o condomínio escolhido (usa o cache já carregado)
function _visAutoTipo(condId, tipoId){
  const cs=document.getElementById(condId), ts=document.getElementById(tipoId);
  if(!cs||!ts) return;
  const t=_visTipoPadraoCond(cs.value);
  if(t && VIS_TIPOS[t]) ts.value=t;
}

let _visSaveTimer=null;

function _visKey(bi,si,ii){ return "b"+bi+"_s"+si+"_i"+ii; }
function _visUid(){ return "vis_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function _visParseValor(s){
  if(s==null) return 0;
  let t=String(s).replace(/[^0-9.,]/g,"").trim(); if(!t) return 0;
  if(t.indexOf(",")>-1){ t=t.replace(/\./g,"").replace(",","."); }       // 2.500,50 -> 2500.50
  else { t=t.replace(/\./g,""); }                                        // 3.200 -> 3200 (ponto = milhar)
  const n=parseFloat(t); return isFinite(n)?n:0;
}
function _visBRL(n){ try{ return "R$ "+Number(n||0).toLocaleString("pt-BR",{minimumFractionDigits:0,maximumFractionDigits:0}); }catch(e){ return "R$ "+(n||0); } }

async function loadVistorias(){
  try{ const v=await storeGet("mafra:vistorias"); if(v){ const o=JSON.parse(v); if(o&&Array.isArray(o.list)) return o; } }catch(e){}
  return { list:[] };
}
async function saveVistorias(d){ try{ _storeCacheClear&&_storeCacheClear("mafra:vistorias"); }catch(e){} return await _visSetComFila("mafra:vistorias", JSON.stringify(d)); }
async function loadVistoria(id){ try{ const v=await storeGet("mafra:vistoria:"+id); if(v){ const o=JSON.parse(v); if(o&&o.id) return o; } }catch(e){} return null; }
async function saveVistoria(rec){ return await _visSetComFila("mafra:vistoria:"+rec.id, JSON.stringify(rec)); }

/* ---------------- OFFLINE: fila local + sincronização automática ---------------- */
// Sem internet, as gravações da vistoria ficam numa fila no aparelho (localStorage)
// e são enviadas sozinhas assim que a rede volta (evento online + verificação periódica).
function _visFilaLer(){ try{ return JSON.parse(localStorage.getItem("mafra:vis_fila")||"[]"); }catch(e){ return []; } }
function _visFilaGravar(f){ try{ localStorage.setItem("mafra:vis_fila", JSON.stringify(f)); }catch(e){} }
function _visFilaTamanho(){ return _visFilaLer().length; }
let _visOnlineReal=null; // último teste REAL de internet (modo avião com Wi-Fi ligado engana o navegador)
async function _visPing(){
  if(navigator.onLine===false){ _visOnlineReal=false; return false; }
  try{
    const ctl=(typeof AbortController!=="undefined")?new AbortController():null;
    const t=ctl?setTimeout(function(){ try{ctl.abort();}catch(_){}} ,4000):null;
    const r=await fetch(location.origin+location.pathname+"?ping="+Date.now(),{method:"HEAD",cache:"no-store",signal:ctl?ctl.signal:undefined});
    if(t) clearTimeout(t);
    _visOnlineReal=!!(r && r.status<500);
  }catch(e){ _visOnlineReal=false; }
  return _visOnlineReal;
}
async function _visSetComFila(key,val){
  let ok=false;
  if(navigator.onLine!==false && _visOnlineReal!==false){
    // tenta o servidor, mas com limite de 6s: rede "fantasma" não trava o salvar
    try{ ok=await Promise.race([ storeSet(key,val), new Promise(function(res){ setTimeout(function(){res(false);},6000); }) ]); }catch(e){ ok=false; }
    if(ok){ _visOnlineReal=true; return true; }
    _visOnlineReal=false;
  }
  const f=_visFilaLer().filter(x=>!(x.t==="kv"&&x.k===key)); // última gravação da chave vence
  f.push({t:"kv",k:key,v:val,ts:Date.now()});
  _visFilaGravar(f); _visExtStatusAtualiza();
  return true; // salvo no aparelho; será enviado quando houver rede
}
// valor mais novo de uma chave que ainda está na fila (mais recente que o servidor)
function _visFilaValor(key){
  try{ const f=_visFilaLer(); for(let i=f.length-1;i>=0;i--){ if(f[i].t==="kv"&&f[i].k===key) return f[i].v; } }catch(e){}
  return null;
}
function _visFilaTarefa(uid, wk, task){
  const f=_visFilaLer(); f.push({t:"tarefa",uid,wk,task,ts:Date.now()}); _visFilaGravar(f); _visExtStatusAtualiza();
}
let _visFlushando=false;
async function _visFilaFlush(){
  if(_visFlushando) return; _visFlushando=true;
  try{
    let f=_visFilaLer();
    while(f.length){
      const it=f[0]; let ok=false;
      try{
        if(it.t==="kv"){ ok=await storeSet(it.k, it.v); }
        else if(it.t==="tarefa"){
          const ag=await loadAgenda(it.uid); ag.weeks=ag.weeks||{};
          (ag.weeks[it.wk]=ag.weeks[it.wk]||[]).push(it.task);
          ok=await saveAgenda(it.uid, ag);
        }
      }catch(e){ ok=false; }
      if(!ok){ _visOnlineReal=false; break; }
      _visOnlineReal=true;
      f.shift(); _visFilaGravar(f);
    }
  } finally { _visFlushando=false; _visExtStatusAtualiza(); }
}
function _visExtStatusAtualiza(){
  const el=document.getElementById("visExtStatus"); if(!el) return;
  const n=_visFilaTamanho();
  const semNet=(navigator.onLine===false)||(_visOnlineReal===false);
  if(semNet) el.innerHTML="🟡 Sem internet — salvando neste aparelho"+(n?` · ${n} pendente(s)`:"")+". Envio automático quando a rede voltar.";
  else if(n) el.innerHTML=`🔄 Conectado — enviando ${n} pendente(s)…`;
  else el.innerHTML="🟢 Online · tudo sincronizado";
}
try{
  window.addEventListener("online", function(){ try{ _visPing().then(function(ok){ _visExtStatusAtualiza(); if(ok) _visFilaFlush(); }); }catch(e){} });
  window.addEventListener("offline", function(){ try{ _visOnlineReal=false; _visExtStatusAtualiza(); }catch(e){} });
  setInterval(async function(){ try{
    const precisa=_visFilaTamanho()>0 || (typeof state!=="undefined" && state && state.visExterno);
    if(!precisa) return;
    const ok=await _visPing();
    _visExtStatusAtualiza();
    if(ok && _visFilaTamanho()) _visFilaFlush();
  }catch(e){} }, 15000);
}catch(e){}
// Fotos por item (chave própria por item) → escala bem para muitas fotos.
// Cada foto é {foto, titulo}. Lê também o formato antigo (chave única, strings).
function _visNormFoto(f){ return (typeof f==="string")?{foto:f,titulo:""}:{foto:(f&&f.foto)||"",titulo:(f&&f.titulo)||""}; }
async function _visLoadFotosTudo(rec){
  const mapa={}; const id=rec.id;
  const keys=Array.isArray(rec.fotoKeys)?rec.fotoKeys.slice():[];
  if(keys.length){
    for(const k of keys){ try{ const v=await storeGet("mafra:vfoto:"+id+":"+k); if(v){ const arr=JSON.parse(v); if(Array.isArray(arr)&&arr.length) mapa[k]=arr.map(_visNormFoto); } }catch(e){} }
    return mapa;
  }
  // compatibilidade: formato antigo (uma chave só)
  try{ const v=await storeGet("mafra:vistoria_fotos:"+id); if(v){ const o=JSON.parse(v); if(o&&typeof o==="object"){
    Object.keys(o).forEach(k=>{ const arr=(o[k]||[]).map(_visNormFoto); if(arr.length) mapa[k]=arr; });
  } } }catch(e){}
  return mapa;
}
async function _visSalvarItemFotos(rec, key){
  const id=rec.id; const arr=(state.vistoriaFotos&&state.vistoriaFotos[key])||[];
  let ok=true;
  if(arr.length){ ok=await _visSetComFila("mafra:vfoto:"+id+":"+key, JSON.stringify(arr)); }
  else { try{ await _visSetComFila("mafra:vfoto:"+id+":"+key, ""); }catch(e){} }
  const set=new Set(Array.isArray(rec.fotoKeys)?rec.fotoKeys:[]);
  if(arr.length) set.add(key); else set.delete(key);
  rec.fotoKeys=Array.from(set);
  await saveVistoria(rec);
  try{ _visSnapshotSalvar(); }catch(e){}
  return ok;
}

function _visPodeUsar(){ if(state&&state.visExterno) return true; const u=state.user||{}; return u.tipo==="master"||u.tipo==="sindico"||u.tipo==="gestor"||(BPO||[]).includes(state.userId); }
function _visNome(uid){ try{ return (USUARIOS&&USUARIOS[uid]&&USUARIOS[uid].nome)||uid||"—"; }catch(e){ return uid||"—"; } }
function _visFmtData(iso){ return iso? String(iso).split("-").reverse().join("/") : "—"; }

// estatísticas completas da vistoria
function _visStats(rec){
  const itens=(rec&&rec.itens)||{};
  let total=0, avaliados=0; const cont={conforme:0,baixo:0,medio:0,critico:0,oportunidade:0,na:0};
  const invest={critico:0,medio:0,baixo:0,oportunidade:0};
  _visTpl(rec).forEach((b,bi)=> b.s.forEach((sec,si)=> sec.i.forEach((it,ii)=>{
    total++; const c=itens[_visKey(bi,si,ii)];
    if(c&&c.classif){ avaliados++; if(cont[c.classif]!=null) cont[c.classif]++;
      if(invest[c.classif]!=null) invest[c.classif]+=_visParseValor(c.estimativa); }
  })));
  const naoConf=VIS_NAO_CONF.reduce((a,k)=>a+cont[k],0);
  const achados=VIS_ACHADOS.reduce((a,k)=>a+cont[k],0);
  const investTotal=invest.critico+invest.medio+invest.baixo+invest.oportunidade;
  const baseConf=cont.conforme+naoConf;
  const conformidade=baseConf?Math.round(cont.conforme/baseConf*100):0;
  // índice de saúde condominial (maturidade média dos itens avaliados, exceto N/A)
  let somaMat=0,nMat=0;
  Object.keys(itens).forEach(k=>{ const c=itens[k]; if(c&&c.classif&&VIS_CLASS[c.classif]&&VIS_CLASS[c.classif].mat!=null){ somaMat+=VIS_CLASS[c.classif].mat; nMat++; } });
  const saude=nMat?Math.round(somaMat/nMat):0;
  return { total, avaliados, cont, naoConf, achados, invest, investTotal, conformidade, saude, comObs:naoConf };
}
function _visStatsBloco(rec, bi){
  const itens=(rec&&rec.itens)||{}; let total=0,avaliados=0,nc=0;
  _visTpl(rec)[bi].s.forEach((sec,si)=>sec.i.forEach((it,ii)=>{
    total++; const c=itens[_visKey(bi,si,ii)];
    if(c&&c.classif){ avaliados++; if(VIS_NAO_CONF.includes(c.classif)) nc++; }
  }));
  return {total,avaliados,nc};
}
// pontuação 0-100 de uma dimensão do radar
function _visDimScore(rec, blocos){
  const itens=(rec&&rec.itens)||{}; const tpl=_visTpl(rec); let soma=0,n=0;
  blocos.forEach(bi=>{ if(!tpl[bi]) return; tpl[bi].s.forEach((sec,si)=>sec.i.forEach((it,ii)=>{
    const c=itens[_visKey(bi,si,ii)]; if(c&&c.classif&&VIS_CLASS[c.classif]&&VIS_CLASS[c.classif].mat!=null){ soma+=VIS_CLASS[c.classif].mat; n++; }
  })); });
  return n?Math.round(soma/n):0;
}

/* ================================= LISTA ================================= */
async function renderVistoria(){
  const view=document.getElementById("view");
  if(!_visPodeUsar()){ view.innerHTML='<div class="atend-hint">Você não tem acesso ao módulo de Vistoria.</div>'; return; }
  if(state.vistoriaAberta){ return _visRenderEditor(); }
  view.innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  const d=await loadVistorias();
  const u=state.user, ehSindico=u.tipo==="sindico", ehGestor=u.tipo==="gestor";
  let lista=(d.list||[]).slice();
  if(ehGestor){ lista=lista.filter(v=>{ try{ return gestorCobre(v.condominio); }catch(e){ return false; } }); }
  else if(ehSindico){ let meus=[]; try{ meus=await condominiosDoSindico(state.userId); }catch(e){} lista=lista.filter(v=>meus.includes(v.condominio)||v.criadoPorUid===state.userId); }
  lista.sort((a,b)=>(b.criadoEm||0)-(a.criadoEm||0));

  let html=`<style>${_visCSS()}</style>
  <div class="vis-hero">
    <div class="vis-hero-l">
      <div class="vis-hero-eyebrow">AUDITORIA · DUE DILIGENCE PATRIMONIAL</div>
      <h2>Vistoria Diagnóstica 360°</h2>
      <div class="vis-hero-sub">${lista.length} diagnóstico(s) · condomínios, associações e loteamentos</div>
    </div>
    <div class="vis-hero-btns">
      ${state.user&&state.user.tipo==="master"?`<button class="vis-btn-hero-ghost" onclick="abrirTiposCondominio()">${ico('predio')} Tipos por condomínio</button>`:""}
      <button class="vis-btn-hero-ghost" onclick="visLinkExterno()">🔗 Link externo</button>
      <button class="vis-btn-prim" onclick="abrirNovaVistoria()">＋ Nova vistoria</button>
    </div>
  </div>`;
  if(!lista.length){
    html+=`<div class="atend-hint">Nenhum diagnóstico criado. Clique em <b>"＋ Nova vistoria"</b> para iniciar a auditoria 360° de um empreendimento.</div>`;
  } else {
    html+=`<div class="vis-cards">`;
    lista.forEach(v=>{
      const st=v.stats||{total:0,avaliados:0,achados:0,cont:{},conformidade:0,saude:0,investTotal:0,naoConf:0};
      const pct=st.total?Math.round(st.avaliados/st.total*100):0;
      html+=`<div class="vis-card" onclick="abrirVistoria('${v.id}')">
        <div class="vis-card-top">
          <div><div class="vis-card-cond">${esc(v.condominio)}</div>
            <div class="vis-card-meta">🗓️ ${_visFmtData(v.data)} · 👤 ${esc(_visNome(v.responsavelUid))}</div>
            <div class="vis-card-meta">📋 ${esc(_visTipoLbl(v))}</div></div>
          ${v.status==="concluida"?'<span class="vis-badge ok">Concluída</span>':'<span class="vis-badge wip">Em andamento</span>'}
        </div>
        <div class="vis-card-kpis">
          <div class="vis-kpi"><b>${st.saude||0}</b><span>Saúde /100</span></div>
          <div class="vis-kpi"><b style="color:#D23B3B">${(st.cont&&st.cont.critico)||0}</b><span>Críticos</span></div>
          <div class="vis-kpi"><b>${st.naoConf||0}</b><span>Não conformes</span></div>
        </div>
        <div class="vis-prog"><div class="vis-prog-bar"><span style="width:${pct}%"></span></div><div class="vis-prog-txt">${st.avaliados}/${st.total} avaliados · ${pct}%</div></div>
        <div class="vis-card-acoes" onclick="event.stopPropagation()">
          <button class="vis-btn-prim sm" onclick="abrirVistoria('${v.id}')">Abrir auditoria</button>
          <button class="vis-btn-ghost sm" onclick="visExportarPDF('${v.id}')">📄 Relatório PDF</button>
          <button class="vis-btn-ghost sm" onclick="visExcluir('${v.id}')">🗑️</button>
        </div>
      </div>`;
    });
    html+=`</div>`;
  }
  view.innerHTML=html;
}

async function abrirNovaVistoria(){
  if(!_visPodeUsar()) return;
  let conds=(CONDOMINIOS||[]).slice();
  try{
    if(state.user.tipo==="sindico"){ const meus=await condominiosDoSindico(state.userId); if(meus&&meus.length) conds=meus; }
    else if(state.user.tipo==="gestor"){ conds=conds.filter(c=>{ try{ return gestorCobre(c); }catch(e){ return false; } }); }
  }catch(e){}
  conds.sort((a,b)=>String(a).localeCompare(String(b),"pt-BR"));
  _visCondTiposCache = await _visCondTiposLoad();
  const hoje=new Date().toISOString().slice(0,10);
  const peopleOpts=Object.keys(USUARIOS||{}).map(uid=>`<option value="${uid}" ${uid===state.userId?"selected":""}>${esc(_visNome(uid))}</option>`).join("");
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:460px">
    <div class="modal-head"><h3>📋 Nova vistoria 360°</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <label class="lbl">Condomínio / empreendimento</label>
      <select id="visNovoCond" class="inp" onchange="_visAutoTipo('visNovoCond','visNovoTipo')">${conds.length?condOptionsAgrupadas(undefined,conds):'<option value="">— nenhum cadastrado —</option>'}</select>
      <label class="lbl" style="margin-top:12px">Tipo de vistoria <span style="font-weight:400;color:var(--muted)">(cada formato tem o seu roteiro)</span></label>
      <select id="visNovoTipo" class="inp">${_visTipoOpts(VIS_TIPO_PADRAO)}</select>
      <label class="lbl" style="margin-top:12px">Data da vistoria</label>
      <input type="date" id="visNovaData" class="inp" value="${hoje}">
      <label class="lbl" style="margin-top:12px">Responsável técnico</label>
      <select id="visNovoResp" class="inp">${peopleOpts}</select>
      <label class="lbl" style="margin-top:12px">Equipe participante <span style="font-weight:400;color:var(--muted)">(opcional)</span></label>
      <input id="visNovaEquipe" class="inp" placeholder="Ex.: Walace, Bruna, zelador João">
      <div class="modal-foot" style="margin-top:18px">
        <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="vis-btn-prim" style="flex:1" onclick="confirmarNovaVistoria()">Iniciar auditoria</button>
      </div>
    </div>
  </div></div>`;
  _visAutoTipo("visNovoCond","visNovoTipo"); // já deixa o tipo do condomínio selecionado
}

async function confirmarNovaVistoria(){
  const cond=(document.getElementById("visNovoCond")||{}).value||"";
  const data=(document.getElementById("visNovaData")||{}).value||new Date().toISOString().slice(0,10);
  const resp=(document.getElementById("visNovoResp")||{}).value||state.userId;
  const equipe=(document.getElementById("visNovaEquipe")||{}).value||"";
  let tipo=(document.getElementById("visNovoTipo")||{}).value||VIS_TIPO_PADRAO; if(!VIS_TIPOS[tipo]) tipo=VIS_TIPO_PADRAO;
  if(!cond){ alert("Selecione um condomínio."); return; }
  const rec={ id:_visUid(), condominio:cond, tipo, data, responsavelUid:resp, equipe, criadoPorUid:state.userId, criadoEm:Date.now(), status:"andamento", itens:{} };
  const ok=await saveVistoria(rec);
  if(!ok){ alert("⚠️ Não consegui criar a vistoria no servidor. Verifique a internet e tente de novo."); return; }
  const idx=await loadVistorias(); idx.list=idx.list||[];
  idx.list.push({ id:rec.id, condominio:rec.condominio, tipo:rec.tipo, data:rec.data, responsavelUid:rec.responsavelUid, criadoPorUid:rec.criadoPorUid, criadoEm:rec.criadoEm, status:rec.status, stats:_visStats(rec) });
  await saveVistorias(idx);
  closeModal();
  state.vistoriaAberta=rec.id; state.vistoriaDados=rec; state.vistoriaFotos={}; state.vistoriaBloco=0;
  render();
}

async function abrirVistoria(id){
  const view=document.getElementById("view");
  view.innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando auditoria…</div>';
  const rec=await loadVistoria(id);
  if(!rec){ alert("Vistoria não encontrada."); state.vistoriaAberta=null; render(); return; }
  state.vistoriaAberta=id; state.vistoriaDados=rec; state.vistoriaFotos=await _visLoadFotosTudo(rec); state.vistoriaBloco=0;
  render();
}
function voltarVistorias(){ state.vistoriaAberta=null; state.vistoriaDados=null; state.vistoriaFotos=null; render(); }

/* ===== Cadastro de TIPO por condomínio (modal de gestão) ===== */
async function abrirTiposCondominio(){
  if(!(state.user&&state.user.tipo==="master")) return;
  const mapa = await _visCondTiposLoad(); _visCondTiposCache = mapa;
  const conds=(CONDOMINIOS||[]).slice().sort((a,b)=>String(a).localeCompare(String(b),"pt-BR"));
  const linhas = conds.length ? conds.map(c=>{
    const sel=_visTipoPadraoCond(c);
    return `<div class="vct-row">
      <div class="vct-nome">${esc(c)}</div>
      <select class="inp vct-sel" data-cond="${esc(c)}">${_visTipoOpts(sel)}</select>
    </div>`;
  }).join("") : '<div class="atend-hint">Nenhum condomínio cadastrado.</div>';
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:560px">
    <div class="modal-head"><h3>${ico('predio')} Tipo de vistoria por condomínio</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p style="margin:0 0 14px;color:var(--muted);font-size:13px">Defina o roteiro padrão de cada condomínio. Ao criar uma vistoria nova e escolher o condomínio, o tipo já vem preenchido automaticamente (ainda dá para trocar na hora).</p>
      <style>
        .vct-row{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--line)}
        .vct-nome{flex:1;font-weight:600;font-size:13.5px;color:var(--navy2,#16243D)}
        .vct-sel{max-width:300px}
      </style>
      <div class="vct-lista" style="max-height:52vh;overflow-y:auto">${linhas}</div>
      <div class="modal-foot" style="margin-top:18px">
        <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="vis-btn-prim" style="flex:1" onclick="confirmarTiposCondominio()">💾 Salvar</button>
      </div>
    </div>
  </div></div>`;
}
async function confirmarTiposCondominio(){
  const mapa={};
  document.querySelectorAll(".vct-sel").forEach(s=>{ const c=s.getAttribute("data-cond"); const t=s.value; if(c && t && VIS_TIPOS[t]) mapa[c]=t; });
  const ok=await _visCondTiposSave(mapa);
  _visCondTiposCache=mapa;
  if(!ok){ alert("Não consegui salvar no servidor. Verifique a internet e tente de novo."); return; }
  closeModal();
  _toast("✅ Tipos por condomínio salvos.");
}

/* ===== Trocar o TIPO de uma vistoria já criada ===== */
function visTrocarTipo(){
  const rec=state.vistoriaDados; if(!rec) return;
  const atual=_visTipoDe(rec);
  const temRespostas = Object.keys(rec.itens||{}).length>0 || (Array.isArray(rec.fotoKeys)&&rec.fotoKeys.length>0);
  document.getElementById("modalMount").innerHTML=`<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:460px">
    <div class="modal-head"><h3>✏️ Trocar tipo de vistoria</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <label class="lbl">Tipo de vistoria <span style="font-weight:400;color:var(--muted)">(cada formato tem o seu roteiro)</span></label>
      <select id="visTrocaTipo" class="inp">${_visTipoOpts(atual)}</select>
      ${temRespostas?`<div style="margin-top:14px;background:#FDECEC;border:1px solid #F3B6B6;border-radius:10px;padding:12px;color:#A12A2A;font-size:13px;line-height:1.5">⚠️ Esta vistoria já tem respostas/fotos. Como cada roteiro tem itens diferentes, <b>trocar o tipo vai reiniciar as respostas e as fotos</b> desta vistoria.</div>`:`<div style="margin-top:14px;color:var(--muted);font-size:13px">A vistoria ainda não tem respostas — pode trocar à vontade.</div>`}
      <div class="modal-foot" style="margin-top:18px">
        <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        <button class="vis-btn-prim" style="flex:1" onclick="confirmarTrocaTipo()">Aplicar</button>
      </div>
    </div>
  </div></div>`;
}
async function confirmarTrocaTipo(){
  const rec=state.vistoriaDados; if(!rec) return;
  const novo=(document.getElementById("visTrocaTipo")||{}).value;
  if(!novo || !VIS_TIPOS[novo]){ return; }
  if(novo===_visTipoDe(rec)){ closeModal(); return; }
  const temRespostas = Object.keys(rec.itens||{}).length>0 || (Array.isArray(rec.fotoKeys)&&rec.fotoKeys.length>0);
  if(temRespostas && !confirm("Confirma trocar o tipo? As respostas e fotos desta vistoria serão reiniciadas, porque o novo roteiro tem itens diferentes.")) return;
  // limpa fotos antigas (as chaves de item mudam com o roteiro)
  if(Array.isArray(rec.fotoKeys)){ for(const k of rec.fotoKeys){ try{ await storeSet("mafra:vfoto:"+rec.id+":"+k, ""); }catch(e){} } }
  rec.tipo=novo; rec.itens={}; rec.fotoKeys=[];
  state.vistoriaFotos={}; state.vistoriaBloco=0;
  const ok=await saveVistoria(rec);
  if(!ok){ alert("Não consegui salvar a troca de tipo. Verifique a internet e tente de novo."); return; }
  try{ const idx=await loadVistorias(); idx.list=idx.list||[]; const e=idx.list.find(x=>x.id===rec.id); if(e){ e.tipo=rec.tipo; e.stats=_visStats(rec); } await saveVistorias(idx); }catch(e){}
  closeModal();
  _toast("✅ Tipo alterado para “"+esc(VIS_TIPOS[novo].lbl)+"”.");
  render();
}

/* ====================== PREENCHIMENTO EXTERNO (sem login) ====================== */
// esconde o "casco" do app (login, barra superior, subnav, assistente) — fica só o conteúdo
function _visExtShell(){
  try{ document.getElementById("login").classList.add("hidden"); }catch(e){}
  try{ document.getElementById("booking").classList.add("hidden"); }catch(e){}
  try{ document.getElementById("app").classList.remove("hidden"); }catch(e){}
  try{ const tb=document.querySelector("#app .topbar"); if(tb) tb.style.display="none"; }catch(e){}
  try{ const sn=document.getElementById("subnav"); if(sn) sn.style.display="none"; }catch(e){}
  /* build 130: LivIA vive no menu; não precisa esconder por tela */
  state.visExterno=true; state.tab="vistoria";
}

// Link universal /#vistoria — a pessoa escolhe o condomínio e se identifica
async function abrirVistoriaExternaEscolha(){
  _visExtShell();
  const view=document.getElementById("view");
  view.innerHTML='<div style="padding:48px;text-align:center;color:#9aa;font-family:Montserrat,sans-serif">Carregando…</div>';
  try{ if(typeof CONFIG_PRONTA!=="undefined") await CONFIG_PRONTA; }catch(e){}
  const conds=(CONDOMINIOS||[]).slice().sort((a,b)=>String(a).localeCompare(String(b),"pt-BR"));
  _visCondTiposCache = await _visCondTiposLoad();
  let nomeSalvo=""; try{ nomeSalvo=localStorage.getItem("mafra:vis_ext_nome")||""; }catch(e){}
  // se a pessoa já estava preenchendo uma vistoria neste aparelho, oferece continuar
  let continuarHTML="";
  try{
    const ult=localStorage.getItem("mafra:vis_ext_ultima");
    if(ult){ const ru=await loadVistoria(ult); if(ru && ru.status!=="concluida"){
      continuarHTML=`<button class="vis-save-btn" style="margin:0 auto 14px;max-width:520px" onclick="abrirVistoriaExterna('${ult}')">▶ Continuar última vistoria (${esc(ru.condominio)})</button>`;
    } }
  }catch(e){}
  view.innerHTML=`<style>${_visCSS()}</style>
    <div class="vis-ext-head">
      <div class="vis-ext-brand">MAFRA <span>GESTÃO INTEGRADA</span></div>
        <div class="vis-ext-ver">${(typeof APP_VERSAO!=="undefined")?esc(APP_VERSAO):""}</div>
      <div class="vis-ext-tit">📋 Vistoria Diagnóstica 360°</div>
      <div class="vis-exec-cond" style="color:#fff">Identifique-se para começar</div>
      <div class="vis-ext-nota">Escolha o condomínio e informe quem está fazendo a vistoria. Se já houver uma vistoria em andamento, você continua de onde parou.</div>
    </div>
    ${continuarHTML}
    <div class="vis-ext-form">
      <label>${ico('predio')} Condomínio
        <select id="visExtCond" class="inp" onchange="_visAutoTipo('visExtCond','visExtTipo')">${condOptionsAgrupadas(undefined,conds)}</select>
      </label>
      <label>📋 Tipo de vistoria <span style="font-weight:400;color:#8a93a3">(usado só se for iniciar uma vistoria nova)</span>
        <select id="visExtTipo" class="inp">${_visTipoOpts(VIS_TIPO_PADRAO)}</select>
      </label>
      <label>👤 Seu nome <span class="vis-obrig">obrigatório</span>
        <input id="visExtNome" class="inp" value="${esc(nomeSalvo)}" placeholder="Ex.: Carlos Silva">
      </label>
      <label>👥 Demais participantes <span style="font-weight:400;color:#8a93a3">(opcional)</span>
        <input id="visExtOutros" class="inp" placeholder="Ex.: João (zelador), Maria (portaria)">
      </label>
      <button class="vis-save-btn" onclick="visExtIniciar()">▶ Iniciar vistoria</button>
    </div>`;
  _visAutoTipo("visExtCond","visExtTipo");
}

function visExtIniciar(){
  const cond=(document.getElementById("visExtCond")||{}).value||"";
  const nome=((document.getElementById("visExtNome")||{}).value||"").trim();
  const outros=((document.getElementById("visExtOutros")||{}).value||"").trim();
  let tipo=(document.getElementById("visExtTipo")||{}).value||VIS_TIPO_PADRAO; if(!VIS_TIPOS[tipo]) tipo=VIS_TIPO_PADRAO;
  if(!cond){ alert("Escolha o condomínio."); return; }
  if(!nome){ alert("Informe o seu nome para continuar."); return; }
  try{ localStorage.setItem("mafra:vis_ext_nome", nome); }catch(e){}
  visExtEscolherCond(cond, nome, outros, tipo);
}

// junta nomes sem duplicar (ignorando maiúsculas/minúsculas)
function _visMesclaPessoas(){ 
  const lista=[];
  Array.prototype.forEach.call(arguments, s=>{
    String(s||"").split(/[,;]+/).map(x=>x.trim()).filter(Boolean).forEach(p=>{
      if(!lista.some(q=>q.toLowerCase()===p.toLowerCase())) lista.push(p);
    });
  });
  return lista.join(", ");
}

// continua a vistoria em andamento do condomínio ou cria uma nova automaticamente
async function visExtEscolherCond(cond, nome, outros, tipo){
  if(!tipo || !VIS_TIPOS[tipo]) tipo=VIS_TIPO_PADRAO;
  const view=document.getElementById("view");
  view.innerHTML='<div style="padding:48px;text-align:center;color:#9aa;font-family:Montserrat,sans-serif">Abrindo a vistoria de '+esc(cond)+'…</div>';
  let alvo=null;
  try{
    const idx=await loadVistorias();
    const abertas=(idx.list||[]).filter(v=>v.condominio===cond && v.status!=="concluida").sort((a,b)=>(b.criadoEm||0)-(a.criadoEm||0));
    if(abertas.length) alvo=abertas[0].id;
  }catch(e){}
  if(alvo){
    // registra quem está preenchendo na vistoria existente
    try{
      const rec=await loadVistoria(alvo);
      if(rec){ rec.extNome=nome||rec.extNome||""; rec.equipe=_visMesclaPessoas(rec.equipe, nome, outros); await saveVistoria(rec); }
    }catch(e){}
  } else {
    const rec={ id:_visUid(), condominio:cond, tipo, data:new Date().toISOString().slice(0,10), responsavelUid:"", equipe:_visMesclaPessoas(nome, outros), extNome:nome||"", criadoPorUid:"externo", criadoEm:Date.now(), status:"andamento", itens:{} };
    const ok=await saveVistoria(rec);
    if(!ok){ view.innerHTML='<div style="max-width:480px;margin:60px auto;text-align:center;font-family:Montserrat,sans-serif"><div style="font-size:40px">⚠️</div><h2 style="color:#082C4E;margin:10px 0 6px">Sem conexão</h2><div style="color:#6b7686;font-size:14px;line-height:1.6">Não consegui iniciar a vistoria. Verifique a internet e abra o link de novo.</div></div>'; return; }
    try{ const idx=await loadVistorias(); idx.list=idx.list||[]; idx.list.push({ id:rec.id, condominio:rec.condominio, tipo:rec.tipo, data:rec.data, responsavelUid:rec.responsavelUid, criadoPorUid:rec.criadoPorUid, criadoEm:rec.criadoEm, status:rec.status, stats:_visStats(rec) }); await saveVistorias(idx); }catch(e){}
    alvo=rec.id;
  }
  abrirVistoriaExterna(alvo);
}

// Aberto pelo link /#vistoria=<id> ou após a escolha do condomínio.
async function abrirVistoriaExterna(vid){
  _visExtShell();
  const view=document.getElementById("view");
  view.innerHTML='<div style="padding:48px;text-align:center;color:#9aa;font-family:Montserrat,sans-serif">Carregando vistoria…</div>';
  try{ if(typeof CONFIG_PRONTA!=="undefined") await CONFIG_PRONTA; }catch(e){}
  // ordem de confiança: FILA (mais novo que o servidor) > servidor > espelho local
  let rec=null;
  const qv=_visFilaValor("mafra:vistoria:"+vid);
  if(qv){ try{ const o=JSON.parse(qv); if(o&&o.id) rec=o; }catch(e){} }
  if(!rec) rec=await loadVistoria(vid);
  let snap=null; try{ const s=localStorage.getItem("mafra:vis_cache:"+vid); if(s) snap=JSON.parse(s); }catch(e){}
  if(!rec && snap && snap.rec && snap.rec.id===vid) rec=snap.rec;
  if(!rec){
    const semNet=(navigator.onLine===false)||(_visOnlineReal===false);
    view.innerHTML = semNet
      ? '<div style="max-width:480px;margin:60px auto;text-align:center;font-family:Montserrat,sans-serif"><div style="font-size:40px">📵</div><h2 style="color:#082C4E;margin:10px 0 6px">Sem internet</h2><div style="color:#6b7686;font-size:14px;line-height:1.6">Não consegui carregar esta vistoria pela primeira vez sem conexão. Assim que tiver rede, abra o link de novo — depois disso, ela funciona até offline.</div></div>'
      : '<div style="max-width:480px;margin:60px auto;text-align:center;font-family:Montserrat,sans-serif"><div style="font-size:40px">😕</div><h2 style="color:#082C4E;margin:10px 0 6px">Link inválido</h2><div style="color:#6b7686;font-size:14px;line-height:1.6">Esta vistoria não foi encontrada — o link pode estar incompleto ou a vistoria foi excluída. Peça um novo link para a equipe Mafra.</div></div>';
    return;
  }
  state.vistoriaAberta=vid; state.vistoriaDados=rec;
  // fotos: servidor + sobreposição da fila (mais novo) + espelho local como socorro
  let fotos={};
  try{ fotos=await _visLoadFotosTudo(rec); }catch(e){ fotos={}; }
  try{ (rec.fotoKeys||[]).forEach(k=>{ const v=_visFilaValor("mafra:vfoto:"+vid+":"+k); if(v){ try{ const a=JSON.parse(v); if(Array.isArray(a)&&a.length) fotos[k]=a.map(_visNormFoto); }catch(e){} } }); }catch(e){}
  if(snap && snap.fotos){ Object.keys(snap.fotos).forEach(k=>{ if(!fotos[k]||!fotos[k].length) fotos[k]=snap.fotos[k]; }); }
  state.vistoriaFotos=fotos;
  // se o celular recarregar a página (ex.: ao abrir a câmera), volta direto
  // nesta mesma vistoria e no mesmo bloco em que a pessoa estava
  try{ history.replaceState(null,"",location.pathname+"#vistoria="+vid); }catch(e){ try{ location.hash="#vistoria="+vid; }catch(_){} }
  try{ localStorage.setItem("mafra:vis_ext_ultima", vid); }catch(e){}
  let bl=0; try{ bl=parseInt(localStorage.getItem("mafra:vis_ext_bloco:"+vid)||"0",10)||0; }catch(e){}
  if(!(bl>=0 && bl<_visTpl(rec).length)) bl=0;
  state.vistoriaBloco=bl;
  _visRenderEditor();
  _visSnapshotSalvar();
  _visExtStatusAtualiza();
  try{ _visPing().then(function(ok){ _visExtStatusAtualiza(); if(ok && _visFilaTamanho()) _visFilaFlush(); }); }catch(e){}
}

// espelho local da vistoria aberta (modo externo): garante a volta após recarregar offline
function _visSnapshotSalvar(){
  if(!state || !state.visExterno || !state.vistoriaDados) return;
  const id=state.vistoriaDados.id;
  try{ localStorage.setItem("mafra:vis_cache:"+id, JSON.stringify({rec:state.vistoriaDados, fotos:state.vistoriaFotos||{}, ts:Date.now()})); }
  catch(e){ try{ localStorage.setItem("mafra:vis_cache:"+id, JSON.stringify({rec:state.vistoriaDados, ts:Date.now()})); }catch(_){} }
}

// Gera o link público universal da vistoria (a pessoa escolhe o condomínio) e copia
function visLinkExterno(){
  const link=location.origin+location.pathname+"#vistoria";
  const aviso="Link copiado!\n\nEnvie para quem vai fazer a vistoria — a pessoa abre, escolhe o condomínio e preenche. Tudo cai automaticamente aqui na aba Vistoria.\n\n⚠️ Qualquer pessoa com este link consegue preencher vistorias. Compartilhe só com quem deve usar.";
  try{ navigator.clipboard.writeText(link).then(()=>alert(aviso)).catch(()=>{ prompt("Copie o link da vistoria:", link); }); }
  catch(e){ prompt("Copie o link da vistoria:", link); }
}

async function visExcluir(id){
  if(!confirm("Excluir esta vistoria? Esta ação não pode ser desfeita.")) return;
  let rec=null; try{ rec=await loadVistoria(id); }catch(e){}
  if(rec&&Array.isArray(rec.fotoKeys)){ for(const k of rec.fotoKeys){ try{ await storeSet("mafra:vfoto:"+id+":"+k, ""); }catch(e){} } }
  try{ await storeSet("mafra:vistoria:"+id, ""); }catch(e){}
  try{ await storeSet("mafra:vistoria_fotos:"+id, ""); }catch(e){}
  const idx=await loadVistorias(); idx.list=(idx.list||[]).filter(v=>v.id!==id); await saveVistorias(idx);
  render();
}

/* ================================ EDITOR ================================= */
function _visRenderEditor(){
  const view=document.getElementById("view");
  const rec=state.vistoriaDados; if(!rec){ state.vistoriaAberta=null; return renderVistoria(); }
  if(state.vistoriaBloco==null) state.vistoriaBloco=0;
  const topo = state.visExterno
    ? `<div class="vis-ext-head">
        <div class="vis-ext-brand">MAFRA <span>GESTÃO INTEGRADA</span></div>
        <div class="vis-ext-ver">${(typeof APP_VERSAO!=="undefined")?esc(APP_VERSAO):""}</div>
        <div class="vis-ext-tit">📋 Vistoria Diagnóstica 360° — Preenchimento</div>
        <div class="vis-exec-cond">${esc(rec.condominio)}</div>
        <div class="vis-exec-meta" style="color:#cfe0f0">📋 ${esc(_visTipoLbl(rec))}</div>
        <div class="vis-exec-meta" style="color:#cfe0f0">🗓️ ${_visFmtData(rec.data)}${rec.extNome?` · 👤 Vistoriador(a): ${esc(rec.extNome)}`:""}${rec.equipe?` · 👥 ${esc(rec.equipe)}`:""}</div>
        <div class="vis-ext-status" id="visExtStatus">🟢 Online · tudo sincronizado</div>
        <div class="vis-ext-acoes">
          <button class="vis-btn-hero-ghost" onclick="visExportarPDF('${rec.id}')">👁️ Ver diagnóstico / Imprimir</button>
        </div>
        <div class="vis-ext-nota">Classifique cada item, tire as fotos na hora e toque em <b>💾 Salvar informações</b>. Sem internet? Pode continuar — tudo fica salvo no aparelho e sobe sozinho quando a rede voltar.</div>
      </div>`
    : `<div class="vis-exec-top">
        <button class="vis-btn-ghost sm" onclick="voltarVistorias()">← Auditorias</button>
        <div class="vis-exec-info">
          <div class="vis-exec-cond">${esc(rec.condominio)}</div>
          <div class="vis-exec-meta">📋 ${esc(_visTipoLbl(rec))} · 🗓️ ${_visFmtData(rec.data)} · 👤 ${esc(_visNome(rec.responsavelUid))}${rec.equipe?` · 👥 ${esc(rec.equipe)}`:""}</div>
        </div>
        <div class="spacer"></div>
        <button class="vis-btn-ghost sm" onclick="visTrocarTipo()" title="Trocar o tipo de vistoria">✏️ Tipo</button>
        <button class="vis-btn-prim sm" onclick="visExportarPDF('${rec.id}')">📄 Relatório executivo</button>
      </div>`;
  let html=`<style>${_visCSS()}</style>
  ${topo}
  <div id="visDashWrap">${_visDashHTML(rec)}</div>
  ${_visLegendaHTML()}
  <div id="visNav" class="vis-nav">${_visNavHTML(rec)}</div>
  <div id="visBlocoWrap">${_visBlocoItensHTML(state.vistoriaBloco)}</div>`;
  view.innerHTML=html;
}

// legenda compacta do que significa cada classificação
function _visLegendaHTML(){
  const desc={
    conforme:"está ok, nada a fazer",
    baixo:"melhoria programada (até 90 dias)",
    medio:"corrigir em até 30 dias",
    critico:"ação imediata (até 7 dias)",
    oportunidade:"valorização (planejamento anual)",
    na:"não se aplica neste condomínio",
  };
  return `<div class="vis-legenda"><span class="vis-legenda-tit">Como classificar:</span>${VIS_ORDEM_CLASS.map(k=>{
    const c=VIS_CLASS[k];
    return `<span class="vis-legenda-i"><b style="color:${c.cor}">${c.ic} ${esc(c.lbl)}</b> — ${desc[k]||""}</span>`;
  }).join("")}</div>`;
}

function _visDashHTML(rec){
  const st=_visStats(rec);
  const pct=st.total?Math.round(st.avaliados/st.total*100):0;
  const cards=[
    {v:st.avaliados+"/"+st.total, l:"Itens avaliados", c:"#0F4C81"},
    {v:st.cont.conforme||0, l:"Conformes", c:"#1E9E5A"},
    {v:st.naoConf||0, l:"Não conformidades", c:"#E07B1A"},
    {v:st.cont.critico||0, l:"Críticos", c:"#D23B3B"},
    {v:st.cont.oportunidade||0, l:"Oportunidades", c:"#2C7BE5"},
    {v:st.conformidade+"%", l:"Índice de conformidade", c:"#0F4C81"},
  ].map(k=>`<div class="vis-dcard"><div class="vis-dcard-v" style="color:${k.c}">${k.v}</div><div class="vis-dcard-l">${k.l}</div></div>`).join("");
  const dims=_visDims(rec).map(d=>({lbl:d.lbl, val:_visDimScore(rec, d.blocos)}));
  return `<div class="vis-dash">
    <div class="vis-saude">
      <div class="vis-saude-n">${st.saude}</div>
      <div class="vis-saude-l">Índice de Saúde<br>Condominial</div>
      <div class="vis-saude-bar"><span style="width:${st.saude}%"></span></div>
      <div class="vis-saude-prog">${st.avaliados<st.total?`Parcial · média dos ${st.avaliados} item(ns) avaliado(s) · ${pct}%`:`Auditoria 100% concluída`}</div>
    </div>
    <div class="vis-dcards">${cards}</div>
  </div>
  <div class="vis-analytics one">
    <div class="vis-panel"><div class="vis-panel-h">📡 Maturidade operacional</div>${_visRadarSVG(dims)}</div>
  </div>`;
}

function _visNavHTML(rec){
  const itens=rec.itens||{};
  return _visTpl(rec).map((b,bi)=>{
    const bst=_visStatsBloco(rec,bi); const pct=bst.total?Math.round(bst.avaliados/bst.total*100):0;
    const on=(state.vistoriaBloco===bi);
    return `<button class="vis-navbtn ${on?"on":""}" onclick="visSelBloco(${bi})">
      <span class="vis-navbtn-n">${String(bi+1).padStart(2,"0")}</span>
      <span class="vis-navbtn-t">${esc(_visCurto(rec)[bi]||b.t)}</span>
      <span class="vis-navbtn-m">${bst.avaliados}/${bst.total} · ${pct}%${bst.nc?` · <b>${bst.nc} NC</b>`:""}</span>
    </button>`;
  }).join("");
}

function _visBlocoItensHTML(bi){
  const rec=state.vistoriaDados; const b=rec?_visTpl(rec)[bi]:null; if(!b||!rec) return "";
  let html=`<div class="vis-bloco-atual"><div class="vis-bloco-titulo"><span class="vis-bloco-n">${String(bi+1).padStart(2,"0")}</span> ${esc(b.t)}</div>`;
  b.s.forEach((sec,si)=>{
    html+=`<div class="vis-secao"><div class="vis-secao-t">${esc(sec.t)}</div>`;
    sec.i.forEach((it,ii)=>{ const key=_visKey(bi,si,ii); html+=_visItemHTML(key, it, (rec.itens&&rec.itens[key])||{}); });
    html+=`</div>`;
  });
  html+=`</div>`; return html;
}

function _visItemHTML(key, nome, dado){
  dado=dado||{};
  const chips=VIS_ORDEM_CLASS.map(k=>{ const c=VIS_CLASS[k]; const on=dado.classif===k;
    return `<button class="vis-cls ${on?"on":""}" data-k="${k}" style="${on?`background:${c.cor};border-color:${c.cor};color:#fff`:""}" onclick="visSetClassif('${key}','${k}',this)">${c.ic} ${esc(c.lbl)}</button>`;
  }).join("");
  const ehAchado=VIS_ACHADOS.includes(dado.classif);
  const temFotos=((state.vistoriaFotos&&state.vistoriaFotos[key])||[]).length>0;
  const temDados=!!(dado.obs||dado.prazoData||dado.concluidoEm)||temFotos;
  const aberto=ehAchado||temDados;
  const concluido=!!dado.concluidoEm;
  return `<div class="vis-item" id="visItem_${key}">
    <div class="vis-item-nome">${esc(nome)}${concluido?` <span class="vis-done-tag">✅ Concluído em ${_visFmtTS(dado.concluidoEm)}</span>`:""}</div>
    <div class="vis-cls-wrap">${chips}</div>
    <button class="vis-det-toggle ${aberto?"on":""}" id="visDetToggle_${key}" onclick="visToggleDet('${key}')">${ico('camera')} Evidências e detalhes <span class="seta">▾</span></button>
    <div class="vis-det ${aberto?"aberto":""}" id="visDet_${key}">
      <label class="vis-full">📝 Anotação técnica / descrição<textarea class="inp" rows="3" onchange="visSetCampo('${key}','obs',this.value)">${esc(dado.obs||"")}</textarea></label>
      <div class="vis-obs-tools">
        <button class="vis-tool-btn" id="visDitar_${key}" onclick="visDitarObs('${key}',this)">🎙️ Ditar por voz</button>
        <button class="vis-tool-btn" id="visCorrigir_${key}" onclick="visCorrigirObs('${key}',this)">✨ Corrigir escrita (IA)</button>
      </div>
      <div class="vis-prazo-row">
        <label>⏱️ Prazo para correção<input type="date" class="inp" value="${esc(dado.prazoData||"")}" onchange="visSetCampo('${key}','prazoData',this.value)"></label>
        <button class="vis-done-btn ${concluido?"undo":""}" onclick="visConcluirItem('${key}')">${concluido?"↩ Reabrir correção":"✓ Marcar correção concluída"}</button>
      </div>
      <div class="vis-fotos-area">
        <div class="vis-fotos-lbl">${ico('camera')} Evidência fotográfica</div>
        <div class="vis-fotos" id="visFotos_${key}">${_visFotoStripHTML(key)}</div>
        <div class="vis-fotos-btns">
          <label class="vis-btn-ghost sm" style="cursor:pointer">${ico('camera')} Tirar foto<input type="file" accept="image/*" capture="environment" style="display:none" onchange="visAddFoto('${key}',this)"></label>
          <label class="vis-btn-ghost sm" style="cursor:pointer">${ico('imagem')} Anexar foto(s)<input type="file" accept="image/*" multiple style="display:none" onchange="visAddFoto('${key}',this)"></label>
        </div>
      </div>
      <button class="vis-save-btn" onclick="visSalvarItem('${key}',this)">💾 Salvar informações</button>
    </div>
  </div>`;
}

function _visFotoStripHTML(key){
  const fotos=(state.vistoriaFotos&&state.vistoriaFotos[key])||[];
  if(!fotos.length) return '<span class="vis-fotos-vazio">Nenhuma foto anexada</span>';
  return fotos.map((f,idx)=>`<div class="vis-foto">
    <div class="vis-foto-img"><img src="${(f&&f.foto)||""}"><button class="vis-foto-x" onclick="visDelFoto('${key}',${idx})">×</button></div>
    <input class="vis-foto-tit" value="${esc((f&&f.titulo)||"")}" placeholder="Título / descrição da foto" onchange="visSetFotoTitulo('${key}',${idx},this.value)">
  </div>`).join("");
}

function visSelBloco(bi){
  state.vistoriaBloco=bi;
  if(state.visExterno && state.vistoriaAberta){ try{ localStorage.setItem("mafra:vis_ext_bloco:"+state.vistoriaAberta, String(bi)); }catch(e){} }
  const wrap=document.getElementById("visBlocoWrap"); if(wrap) wrap.innerHTML=_visBlocoItensHTML(bi);
  const nav=document.getElementById("visNav"); if(nav){ nav.querySelectorAll(".vis-navbtn").forEach((b,i)=>b.classList.toggle("on",i===bi)); }
  if(wrap && wrap.scrollIntoView) wrap.scrollIntoView({behavior:"smooth",block:"start"});
}

function visToggleDet(key){
  const det=document.getElementById("visDet_"+key); const tg=document.getElementById("visDetToggle_"+key);
  if(!det) return; const open=det.classList.toggle("aberto"); if(tg) tg.classList.toggle("on",open);
}

/* ---------------- ANOTAÇÃO: ditado por voz + correção por IA ---------------- */
let _visRec=null; // ditado em andamento (um por vez)

// 🎙️ fala vira texto direto na anotação (Web Speech, pt-BR). Tocar de novo para parar.
function visDitarObs(key, btn){
  // já está ditando este item? -> parar
  if(_visRec && _visRec.key===key){ _visPararDitado(true); return; }
  if(_visRec) _visPararDitado(true); // para um ditado de outro item antes de começar
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ alert("O ditado por voz não é suportado neste navegador.\n\nUse o Chrome (Android) ou o Safari atualizado (iPhone/iPad) — ou digite a anotação normalmente."); return; }
  if(navigator.onLine===false){ alert("O ditado por voz precisa de internet.\n\nSem rede, digite a anotação normalmente — ela fica salva no aparelho e sobe quando a conexão voltar."); return; }
  const det=document.getElementById("visDet_"+key); const ta=det&&det.querySelector("textarea");
  if(!ta) return;
  const base=ta.value?(ta.value.replace(/\s+$/,"")+" "):"";
  // mesma calibragem do módulo de Gravações + blindagem específica do Android:
  // o Chrome Android em modo contínuo reenvia finais acumulados (bug conhecido),
  // então no Android usamos continuous=false (o religamento dá a continuidade)
  // e deduplicamos finais repetidos/crescidos por garantia.
  const ehAndroid=/android/i.test(navigator.userAgent||"");
  const rec=new SR(); rec.lang="pt-BR"; rec.continuous=!ehAndroid; rec.interimResults=true; rec.maxAlternatives=1;
  _visRec={key, rec, btn, ta, base, finalTxt:"", interim:"", ult:"", ativo:true};
  rec.onresult=function(e){
    if(!_visRec) return;
    let interim="";
    for(let i=e.resultIndex;i<e.results.length;i++){
      const r=e.results[i];
      const txt=(r[0]&&r[0].transcript||"").trim();
      if(!txt) continue;
      if(r.isFinal){
        const ult=_visRec.ult||"";
        if(txt===ult){ /* mesmo final reenviado: ignora */ }
        else if(ult && txt.indexOf(ult)===0){
          // Android reenviou a MESMA frase crescida: substitui o trecho anterior
          let f=_visRec.finalTxt||"";
          f=f.slice(0, Math.max(0, f.length-ult.length)).replace(/\s+$/,"");
          const sep=(f && !/[\s.,;:!?]$/.test(f))?" ":"";
          _visRec.finalTxt=f+sep+txt; _visRec.ult=txt;
        }
        else if(ult && ult.indexOf(txt)===0){ /* versão encolhida reenviada: ignora */ }
        else{
          const sep=(_visRec.finalTxt && !/[\s.,;:!?]$/.test(_visRec.finalTxt))?" ":"";
          _visRec.finalTxt=(_visRec.finalTxt||"")+sep+txt; _visRec.ult=txt;
        }
      }else{
        interim+=(interim?" ":"")+txt;
      }
    }
    _visRec.interim=interim;
    _visAtualizaCampoDitado();
  };
  rec.onerror=function(e){
    if(e && (e.error==="no-speech"||e.error==="aborted")) return; // normais no celular: ignorar
    if(e && (e.error==="not-allowed"||e.error==="service-not-allowed")){
      alert("Permita o acesso ao microfone para ditar."); _visPararDitado(false);
    }
  };
  rec.onend=function(){
    // o reconhecimento "dorme" sozinho no celular; religa (com 2ª tentativa em 250ms)
    if(_visRec && _visRec.ativo && _visRec.key===key){
      _visRec.ult=""; // nova sessão: zera o marcador de deduplicação
      try{ rec.start(); }
      catch(_){ setTimeout(function(){ try{ if(_visRec && _visRec.ativo && _visRec.key===key) rec.start(); }catch(__){} },250); }
    }
  };
  try{ rec.start(); }catch(e){ alert("Não consegui iniciar o microfone. Tente de novo."); _visRec=null; return; }
  if(btn){ btn.classList.add("rec"); btn.innerHTML="■ Parar ditado"; }
}

// monta o campo: texto que já existia + finais reconhecidos + parcial ao vivo
function _visAtualizaCampoDitado(){
  const r=_visRec; if(!r || !r.ta) return;
  let t=(r.base||"")+(r.finalTxt||"");
  if(r.interim){
    const sep=(t && !/[\s.,;:!?]$/.test(t))?" ":"";
    t+=sep+r.interim;
  }
  r.ta.value=t;
}

function _visPararDitado(salvar){
  const r=_visRec; if(!r) return; _visRec=null;
  r.ativo=false; try{ r.rec.onend=null; r.rec.stop(); }catch(e){}
  if(r.btn){ r.btn.classList.remove("rec"); r.btn.innerHTML="🎙️ Ditar por voz"; }
  if(r.ta){ r.ta.value=((r.base||"")+(r.finalTxt||"")).replace(/\s+/g," ").trim(); if(salvar) visSetCampo(r.key,"obs",r.ta.value); }
}

// ✨ corrige ortografia/acentuação/pontuação mantendo o sentido (usa o porteiro de IA do app)
async function visCorrigirObs(key, btn){
  const det=document.getElementById("visDet_"+key); const ta=det&&det.querySelector("textarea");
  if(!ta) return;
  if(_visRec && _visRec.key===key) _visPararDitado(true);
  const texto=(ta.value||"").trim();
  if(!texto){ alert("Escreva ou dite a anotação primeiro — depois toque em Corrigir."); return; }
  if(navigator.onLine===false){ alert("A correção por IA precisa de internet.\n\nSem rede, o texto fica salvo como está e você pode corrigir depois."); return; }
  const orig=btn?btn.innerHTML:""; if(btn){ btn.disabled=true; btn.innerHTML="⏳ Corrigindo…"; }
  try{
    const prompt=
"Você é um revisor profissional de português do Brasil (norma culta, Acordo Ortográfico vigente). Revise e corrija COMPLETAMENTE o texto abaixo, que é uma anotação técnica de vistoria de condomínio.\n\n"+
"CORRIJA TUDO O QUE ESTIVER ERRADO:\n"+
"- ortografia e acentuação;\n"+
"- pontuação e uso de maiúsculas/minúsculas;\n"+
"- concordância verbal e nominal;\n"+
"- regência verbal e nominal e uso de crase;\n"+
"- tempos e modos verbais (ajuste para o tempo correto e coerente);\n"+
"- colocação pronominal;\n"+
"- palavras repetidas por engano, erros de digitação e frases truncadas do ditado por voz (reconstrua a frase de forma natural).\n\n"+
"REGRAS OBRIGATÓRIAS:\n"+
"- Pode reestruturar frases para ficarem gramaticalmente corretas, claras e fluidas;\n"+
"- NÃO mude o sentido, NÃO invente informações, NÃO resuma e NÃO remova dados (medidas, nomes, locais, valores, prazos, termos técnicos);\n"+
"- Mantenha o tom técnico e objetivo;\n"+
"- Responda SOMENTE com o texto corrigido — sem aspas, sem comentários, sem títulos e sem formatação.\n\n"+
"TEXTO:\n"+texto;
    const maxTok=Math.min(2000, Math.max(600, Math.round(texto.length/2)+200));
    let corrigido=await chamarIA(prompt, maxTok);
    corrigido=String(corrigido||"").replace(/^```[a-z]*\n?|```$/g,"").replace(/^["“”']+|["“”']+$/g,"").trim();
    if(!corrigido) throw new Error("A IA não retornou o texto corrigido.");
    ta.value=corrigido;
    visSetCampo(key,"obs",corrigido);
    if(btn){ btn.innerHTML="✓ Corrigido!"; setTimeout(()=>{ try{ btn.disabled=false; btn.innerHTML=orig; }catch(e){} }, 2200); }
  }catch(e){
    if(btn){ btn.disabled=false; btn.innerHTML=orig; }
    alert("Não consegui corrigir agora: "+(e&&e.message?e.message:"erro de conexão")+"\n\nO texto original continua salvo.");
  }
}

function visSetClassif(key, k, btn){
  const rec=state.vistoriaDados; if(!rec) return;
  rec.itens=rec.itens||{}; const d=rec.itens[key]=rec.itens[key]||{};
  d.classif=(d.classif===k)?"":k;
  const wrap=btn.parentElement;
  wrap.querySelectorAll(".vis-cls").forEach(b=>{ const bk=b.getAttribute("data-k"); const on=(bk===d.classif); b.classList.toggle("on",on); b.style.cssText=on?`background:${VIS_CLASS[bk].cor};border-color:${VIS_CLASS[bk].cor};color:#fff`:""; });
  if(VIS_ACHADOS.includes(d.classif)){ const det=document.getElementById("visDet_"+key); if(det) det.classList.add("aberto"); const tg=document.getElementById("visDetToggle_"+key); if(tg) tg.classList.add("on"); }
  // Atenção em diante: prazo automático (90/30/7 dias) + tarefa para o gestor e o síndico do condomínio
  if(VIS_NAO_CONF.includes(d.classif)){
    if(!d.prazoData){
      const dias={baixo:90, medio:30, critico:7}[d.classif]||30;
      const dt=new Date(); dt.setDate(dt.getDate()+dias);
      d.prazoData=dt.toISOString().slice(0,10);
      const inp=document.querySelector("#visDet_"+key+" input[type=date]"); if(inp) inp.value=d.prazoData;
    }
    if(!d.tarefasGeradas){ d.tarefasGeradas=true; _visGerarTarefas(rec, key, d); }
  }
  _visAtualizarTudo(); _visAgendarSalvar();
}

// nome do item a partir da chave bX_sY_iZ
function _visNomeDoKey(key){
  const m=/^b(\d+)_s(\d+)_i(\d+)$/.exec(key); if(!m) return key;
  const b=_visTpl(state.vistoriaDados)[+m[1]]; const s=b&&b.s[+m[2]]; const it=s&&s.i[+m[3]];
  return it?`${it} (${s.t} · ${b.t})`:key;
}
function _visFmtTS(ts){ try{ return new Date(ts).toLocaleDateString("pt-BR"); }catch(e){ return ""; } }

// marca/desmarca a correção do item como concluída (registra a data)
function visConcluirItem(key){
  const rec=state.vistoriaDados; if(!rec) return;
  rec.itens=rec.itens||{}; const d=rec.itens[key]=rec.itens[key]||{};
  if(d.concluidoEm) delete d.concluidoEm; else d.concluidoEm=Date.now();
  const el=document.getElementById("visItem_"+key);
  if(el){ const tmp=document.createElement("div"); tmp.innerHTML=_visItemHTML(key,_visNomeDoKey(key).split(" (")[0],d); el.replaceWith(tmp.firstElementChild); }
  _visAgendarSalvar();
}

// encontra o gestor do condomínio (campo condominio ou lista condominios do usuário gestor)
function _visGestorDoCondominio(cond){
  try{
    for(const uid of Object.keys(USUARIOS||{})){
      const u=USUARIOS[uid]||{};
      if(u.tipo!=="gestor") continue;
      if(u.condominio===cond) return uid;
      if(Array.isArray(u.condominios)&&u.condominios.includes(cond)) return uid;
    }
  }catch(e){}
  return null;
}

// cria a tarefa "corrigir item da vistoria" na agenda do gestor e do síndico do condomínio
async function _visGerarTarefas(rec, key, d){
  try{
    const cond=rec.condominio;
    const alvos=new Set();
    const g=_visGestorDoCondominio(cond); if(g) alvos.add(g);
    let s=null; try{ s=await sindicoDoCondominio(cond); }catch(e){}
    if(s) alvos.add(s);
    if(!alvos.size) return;
    const nomeItem=_visNomeDoKey(key);
    const cls=VIS_CLASS[d.classif]||{};
    const prazoTxt=d.prazoData?` · Prazo: ${_visFmtData(d.prazoData)}`:"";
    // dia/semana: hoje (seg–sex); sáb/dom cai na segunda da semana seguinte
    const dow=new Date().getDay();
    const wk=(dow===0||dow===6)?weekKey(1):weekKey(0);
    const dia=({1:"seg",2:"ter",3:"qua",4:"qui",5:"sex"})[dow]||"seg";
    for(const uid of alvos){
      const task={
        id:"t"+Date.now()+Math.random().toString(36).slice(2,6),
        condominio:cond,
        tarefa:`🔍 Vistoria · corrigir: ${nomeItem}`,
        acoes:`Classificação: ${cls.ic||""} ${cls.lbl||d.classif}${prazoTxt}${d.obs?`\n${d.obs}`:""}`,
        horas:"", status:"planejado", evidencia:"", dia
      };
      let ok=false;
      if(navigator.onLine!==false){
        try{
          const ag=await loadAgenda(uid);
          ag.weeks=ag.weeks||{}; if(!ag.weeks[wk]) ag.weeks[wk]=[];
          ag.weeks[wk].push(task);
          ok=await saveAgenda(uid, ag);
        }catch(e){ ok=false; }
      }
      if(!ok) _visFilaTarefa(uid, wk, task); // sem rede: entra na fila e sobe quando voltar
    }
  }catch(e){}
}
function visSetCampo(key, campo, val){
  const rec=state.vistoriaDados; if(!rec) return;
  rec.itens=rec.itens||{}; const d=rec.itens[key]=rec.itens[key]||{}; d[campo]=val; _visAgendarSalvar();
}
async function visAddFoto(key, input){
  const files=input&&input.files?Array.prototype.slice.call(input.files):[]; if(input) input.value="";
  if(!files.length) return;
  const rec=state.vistoriaDados; if(!rec) return;
  state.vistoriaFotos=state.vistoriaFotos||{}; state.vistoriaFotos[key]=state.vistoriaFotos[key]||[];
  let falha=false;
  for(const file of files){ try{ const img=await comprimirImagem(file, 1100, 0.62); state.vistoriaFotos[key].push({foto:img.foto,titulo:""}); }catch(e){ falha=true; } }
  const strip=document.getElementById("visFotos_"+key); if(strip) strip.innerHTML=_visFotoStripHTML(key);
  const ok=await _visSalvarItemFotos(rec, key);
  if(!ok) alert("⚠️ Não consegui salvar as fotos no servidor. Verifique a internet e tente de novo.");
  else if(falha) alert("Algumas imagens não puderam ser processadas, mas as demais foram salvas.");
}
async function visDelFoto(key, idx){
  const rec=state.vistoriaDados; if(!rec) return;
  const arr=(state.vistoriaFotos&&state.vistoriaFotos[key])||[]; arr.splice(idx,1);
  if(!arr.length) delete state.vistoriaFotos[key]; else state.vistoriaFotos[key]=arr;
  const strip=document.getElementById("visFotos_"+key); if(strip) strip.innerHTML=_visFotoStripHTML(key);
  await _visSalvarItemFotos(rec, key);
}
async function visSetFotoTitulo(key, idx, val){
  const rec=state.vistoriaDados; if(!rec) return;
  const arr=(state.vistoriaFotos&&state.vistoriaFotos[key])||[];
  if(arr[idx]){ arr[idx].titulo=val; await _visSalvarItemFotos(rec, key); }
}

function _visAtualizarTudo(){
  const rec=state.vistoriaDados; if(!rec) return;
  const dash=document.getElementById("visDashWrap"); if(dash) dash.innerHTML=_visDashHTML(rec);
  const nav=document.getElementById("visNav"); if(nav) nav.innerHTML=_visNavHTML(rec);
}

function _visAgendarSalvar(){ if(_visSaveTimer) clearTimeout(_visSaveTimer); _visSaveTimer=setTimeout(_visSalvarAgora,700); }
async function _visSalvarAgora(){
  const rec=state.vistoriaDados; if(!rec) return false;
  const st=_visStats(rec);
  rec.status=(st.avaliados>=st.total&&st.total>0)?"concluida":"andamento";
  const ok=await saveVistoria(rec);
  try{ const idx=await loadVistorias(); const it=(idx.list||[]).find(v=>v.id===rec.id); if(it){ it.stats=st; it.status=rec.status; await saveVistorias(idx); } }catch(e){}
  try{ _visSnapshotSalvar(); }catch(e){}
  return ok;
}

// Botão "Salvar informações": coleta o que está na tela (anotação, prazo e
// títulos das fotos) e grava na hora, com confirmação visual no botão.
async function visSalvarItem(key, btn){
  const rec=state.vistoriaDados; if(!rec) return;
  rec.itens=rec.itens||{}; const d=rec.itens[key]=rec.itens[key]||{};
  const det=document.getElementById("visDet_"+key);
  if(det){
    const ta=det.querySelector("textarea"); if(ta) d.obs=ta.value;
    const dt=det.querySelector('input[type="date"]'); if(dt) d.prazoData=dt.value;
    const tits=det.querySelectorAll(".vis-foto-tit");
    const fts=(state.vistoriaFotos&&state.vistoriaFotos[key])||[];
    tits.forEach((inp,i)=>{ if(fts[i]) fts[i].titulo=inp.value; });
  }
  if(_visSaveTimer) clearTimeout(_visSaveTimer);
  const orig=btn?btn.innerHTML:""; if(btn){ btn.disabled=true; btn.innerHTML="⏳ Salvando…"; }
  let ok=await _visSalvarAgora();
  if(((state.vistoriaFotos&&state.vistoriaFotos[key])||[]).length){ const okF=await _visSalvarItemFotos(rec, key); ok=ok&&okF; }
  if(btn){
    btn.disabled=false;
    const offlinePend = (navigator.onLine===false) || _visFilaTamanho()>0;
    btn.innerHTML = ok ? (offlinePend ? "✓ Salvo no aparelho (envia ao conectar)" : "✓ Salvo!") : "⚠️ Falhou — tentar de novo";
    if(ok) setTimeout(()=>{ try{ btn.innerHTML=orig; }catch(e){} }, 2600);
  }
  if(!ok) alert("⚠️ Não consegui salvar. Toque em Salvar de novo.");
}

/* ============================== RADAR (SVG) ============================== */
function _visRadarSVG(dims){
  // palco largo (460) + centro deslocado: sobra ~125px de cada lado para os rótulos laterais inteiros
  const cx=230,cy=150,R=100,N=dims.length;
  const ang=i=>(-Math.PI/2)+(i*2*Math.PI/N);
  const pt=(i,r)=>[cx+r*Math.cos(ang(i)), cy+r*Math.sin(ang(i))];
  let grid="";
  [0.25,0.5,0.75,1].forEach(f=>{ const pts=dims.map((d,i)=>pt(i,R*f).map(n=>n.toFixed(1)).join(",")).join(" "); grid+=`<polygon points="${pts}" fill="none" stroke="#e3e9f0" stroke-width="1"/>`; });
  let eixos="",labels="";
  dims.forEach((d,i)=>{ const [x,y]=pt(i,R); eixos+=`<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e3e9f0" stroke-width="1"/>`;
    const [lx,ly]=pt(i,R+14); const anchor=Math.abs(lx-cx)<6?"middle":(lx>cx?"start":"end");
    labels+=`<text x="${lx.toFixed(1)}" y="${(ly+3.5).toFixed(1)}" font-size="11" font-weight="600" font-family="Montserrat, Arial, sans-serif" fill="#5a6473" text-anchor="${anchor}">${d.lbl} ${d.val}</text>`; });
  const dataPts=dims.map((d,i)=>pt(i,R*(d.val/100)).map(n=>n.toFixed(1)).join(",")).join(" ");
  return `<svg viewBox="0 0 460 300" class="vis-radar" xmlns="http://www.w3.org/2000/svg">
    ${grid}${eixos}
    <polygon points="${dataPts}" fill="rgba(15,76,129,.22)" stroke="#0F4C81" stroke-width="2"/>
    ${dims.map((d,i)=>{ const [x,y]=pt(i,R*(d.val/100)); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#0F4C81"/>`; }).join("")}
    ${labels}
  </svg>`;
}

/* ================================== PDF ================================== */
async function visExportarPDF(id){
  const win=window.open("","_blank");
  if(!win){ alert("Permita pop-ups para gerar o relatório."); return; }
  try{ win.document.write('<!doctype html><meta charset="utf-8"><body style="font-family:Arial;background:#082C4E;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><div style="font-size:34px">⏳</div><div style="margin-top:10px;font-weight:700">Gerando relatório executivo…</div></div></body>'); win.document.close(); }catch(e){}
  let rec=(state.vistoriaDados&&state.vistoriaDados.id===id)?state.vistoriaDados:await loadVistoria(id);
  if(!rec){ try{ win.document.open(); win.document.write('<!doctype html><meta charset="utf-8"><body style="font-family:Arial;padding:40px">Vistoria não encontrada.</body>'); win.document.close(); }catch(e){} return; }
  const fotos=(state.vistoriaFotos&&state.vistoriaDados&&state.vistoriaDados.id===id)?state.vistoriaFotos:await _visLoadFotosTudo(rec);
  const st=_visStats(rec);
  // capa padrão do condomínio (mesma arte do relatório gerencial) — se existir, vira o fundo da capa da vistoria
  let capaCond="";
  let contraCond="";
  try{ const cp=await capasResolvidas(rec.condominio); capaCond=(cp&&cp.capa)||""; contraCond=(cp&&cp.contracapa)||""; }catch(e){}
  const dims=_visDims(rec).map(d=>({lbl:d.lbl, val:_visDimScore(rec, d.blocos)}));

  const achados={critico:[],medio:[],baixo:[],oportunidade:[]};
  _visTpl(rec).forEach((b,bi)=>b.s.forEach((sec,si)=>sec.i.forEach((it,ii)=>{
    const key=_visKey(bi,si,ii); const d=(rec.itens||{})[key];
    if(d&&VIS_ACHADOS.includes(d.classif)) achados[d.classif].push({ caminho:`${b.t} › ${sec.t} › ${it}`, d, fotos:(fotos[key]||[]) });
  })));

  const cardResumo=[
    {v:st.avaliados+"/"+st.total,l:"Itens avaliados",c:"#0F4C81"},
    {v:st.cont.conforme||0,l:"Conformes",c:"#1E9E5A"},
    {v:st.naoConf||0,l:"Não conformidades",c:"#E07B1A"},
    {v:st.cont.critico||0,l:"Críticos",c:"#D23B3B"},
    {v:st.cont.oportunidade||0,l:"Oportunidades",c:"#2C7BE5"},
    {v:st.conformidade+"%",l:"Índice de conformidade",c:"#0F4C81"},
  ].map(k=>`<div class="rc"><div class="rc-n" style="color:${k.c}">${k.v}</div><div class="rc-l">${k.l}</div></div>`).join("");

  let plano="";
  VIS_ACHADOS.forEach(k=>{ const arr=achados[k]; if(!arr.length) return; const c=VIS_CLASS[k];
    plano+=`<div class="grp"><div class="grp-h" style="background:${c.cor}">${c.ic} ${c.lbl.toUpperCase()} — ${c.prazo} · ${arr.length} item(ns)</div>`;
    arr.forEach(a=>{
      const fhtml=a.fotos.length?`<div class="ev">${a.fotos.map(f=>`<figure class="evfig"><img src="${(f&&f.foto)||""}">${(f&&f.titulo)?`<figcaption>${esc(f.titulo)}</figcaption>`:""}</figure>`).join("")}</div>`:"";
      const metaLin=[
        a.d.prazoData?`<b>⏱️ Prazo:</b> ${_visFmtData(a.d.prazoData)}`:"",
        a.d.local?`<b>${ico('local')} Local:</b> ${esc(a.d.local)}`:"",
      ].filter(Boolean).join(" &nbsp;·&nbsp; ");
      plano+=`<div class="ach"><div class="ach-top"><div class="ach-cam">${esc(a.caminho)}</div>${a.d.concluidoEm?`<span class="ach-done">✅ Concluído em ${_visFmtTS(a.d.concluidoEm)}</span>`:""}</div>
        ${a.d.obs?`<div class="ach-obs">${esc(a.d.obs)}</div>`:""}
        ${metaLin?`<div class="ach-campos">${metaLin}</div>`:""}${fhtml}</div>`;
    });
    plano+=`</div>`;
  });
  if(!plano) plano=`<div class="vazio">Nenhuma não conformidade ou oportunidade registrada até o momento.</div>`;

  const html=`<!doctype html><html><head><meta charset="utf-8"><title>Diagnóstico 360° · ${esc(rec.condominio)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  body{font-family:'Montserrat',Arial,sans-serif;color:#16243D;background:#F5F7FA}
  @page{size:A4;margin:0}
  @media print{.noprint{display:none}.pg{margin:0}}
  .toolbar{position:fixed;top:0;left:0;right:0;background:#082C4E;padding:10px;text-align:center;z-index:9}
  .toolbar button{padding:9px 22px;background:#0F4C81;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-family:'Montserrat',sans-serif}
  .pg{width:210mm;min-height:296mm;background:#fff;margin:14px auto;box-shadow:0 4px 18px rgba(0,0,0,.15);position:relative;overflow:hidden}
  .pg.capa,.pg.capa-arte{z-index:3}
  .vis-rodape{display:none}
  @media print{.vis-rodape{display:flex !important;position:fixed;bottom:0;left:0;right:0;align-items:center;justify-content:center;padding:2mm 0;z-index:2}.vis-rodape img{height:18px;opacity:.92}.pg{box-shadow:none;margin:0}}
  .capa{background:linear-gradient(150deg,#082C4E,#0F4C81);color:#fff;padding:0;display:flex;flex-direction:column;justify-content:center;min-height:296mm}
  .capa-arte{background:#0d1828 center/cover no-repeat;color:#fff;min-height:296mm;position:relative}
  .capa-arte .topo{position:absolute;top:0;left:0;right:0;padding:46px 30px 80px;text-align:center;background:linear-gradient(180deg,rgba(6,16,32,.6),rgba(6,16,32,0))}
  .capa-arte .eyebrow2{font-size:14px;letter-spacing:6px;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.85)}
  .capa-arte .sub2{font-size:13px;color:#e8f0f8;margin-top:8px;text-shadow:0 1px 6px rgba(0,0,0,.85)}
  .capa-arte .rodape{position:absolute;left:0;right:0;bottom:14px;text-align:center;font-size:11.5px;line-height:1.75;color:#dbe6f2;text-shadow:0 1px 4px rgba(0,0,0,.7);padding:0 40px}
  .capa-arte .rodape b{color:#fff}
  .capa-in{padding:60px 56px}
  .capa .eyebrow{font-size:13px;letter-spacing:5px;color:#9fc1e0;font-weight:700}
  .capa h1{font-size:46px;line-height:1.05;margin:14px 0 8px;font-weight:800}
  .capa .sub{font-size:17px;color:#cfe0f0}
  .capa .meta{margin-top:34px;border-top:1px solid rgba(255,255,255,.2);padding-top:22px;font-size:14px;line-height:2.1;color:#e6eef7}
  .capa .logo{position:absolute;bottom:50px;left:56px;font-size:26px;font-weight:800;letter-spacing:3px}
  .capa .logo small{display:block;font-size:10px;letter-spacing:6px;color:#9fc1e0;font-weight:400}
  .capa .stamp{position:absolute;bottom:50px;right:56px;text-align:right;font-size:11px;color:#9fc1e0}
  .sec{padding:42px 48px}
  .sec-h{font-size:13px;letter-spacing:3px;color:#0F4C81;font-weight:800;border-bottom:2px solid #0F4C81;padding-bottom:8px;margin-bottom:22px}
  .rcards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .rc{background:#F5F7FA;border:1px solid #e3e9f0;border-radius:12px;padding:18px;text-align:center}
  .rc-n{font-size:30px;font-weight:800;line-height:1}.rc-l{font-size:12px;color:#5a6473;margin-top:6px;font-weight:600}
  .saude{display:flex;align-items:center;gap:22px;background:linear-gradient(135deg,#082C4E,#0F4C81);color:#fff;border-radius:14px;padding:24px 28px;margin-bottom:24px}
  .saude-n{font-size:58px;font-weight:800;line-height:1}.saude-x{flex:1}
  .saude-l{font-size:15px;font-weight:700}.saude-d{font-size:12.5px;color:#bcd3ea;margin-top:4px}
  .saude-bar{height:10px;background:rgba(255,255,255,.2);border-radius:6px;margin-top:10px;overflow:hidden}.saude-bar i{display:block;height:100%;background:#5BC98B}
  .radar{display:block;margin:0 auto;max-width:480px}
  .grp{margin-bottom:18px;break-inside:avoid}
  .grp-h{color:#fff;font-weight:800;font-size:13.5px;padding:10px 15px;border-radius:8px}
  .ach{border:1px solid #e3e9f0;border-left:4px solid #0F4C81;border-radius:9px;padding:13px 15px;margin-top:10px;break-inside:avoid}
  .ach-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
  .ach-cam{font-weight:800;font-size:13.5px;color:#0F4C81}
  .ach-st{font-size:10.5px;font-weight:700;color:#fff;padding:3px 9px;border-radius:20px;white-space:nowrap}
  .ach-done{font-size:10.5px;font-weight:700;color:#fff;background:#1E9E5A;padding:3px 9px;border-radius:20px;white-space:nowrap}
  .ach-obs{font-size:13px;margin-top:6px;line-height:1.45}
  .ach-campos{font-size:11.5px;color:#445;margin-top:7px;line-height:1.7}
  .ev{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}.evfig{margin:0;width:150px}.evfig img{width:150px;height:112px;object-fit:cover;border-radius:7px;border:1px solid #ddd;display:block}.evfig figcaption{font-size:10.5px;color:#445;margin-top:3px;font-weight:600;line-height:1.2}
  .invrow{display:flex;align-items:center;gap:12px;margin-bottom:11px}
  .invl{flex:0 0 215px;font-size:12.5px;font-weight:600;color:#445}.invbar{flex:1;height:14px;background:#eef2f7;border-radius:7px;overflow:hidden}.invbar i{display:block;height:100%}
  .invv{flex:0 0 110px;text-align:right;font-weight:800;font-size:13px;color:#082C4E}
  .invtot{font-size:30px;font-weight:800;color:#082C4E;margin-bottom:18px}
  .gal{display:flex;flex-wrap:wrap;gap:10px}.gal img{width:165px;height:124px;object-fit:cover;border-radius:8px;border:1px solid #ddd}
  .gal-cap{width:100%;font-size:11px;color:#5a6473;font-weight:700;margin:6px 0 -4px}
  .vazio{color:#888;font-style:italic;padding:24px;text-align:center;background:#F5F7FA;border-radius:10px}
  .assina{margin-top:46px;display:flex;justify-content:space-between;align-items:flex-end}
  .assina .linha{border-top:1.5px solid #16243D;width:260px;text-align:center;padding-top:7px;font-size:12.5px;color:#445}
  .leg{font-size:11px;color:#888;margin-top:24px;border-top:1px solid #eee;padding-top:10px;line-height:1.7}
  </style></head><body>
  <div class="toolbar noprint"><button onclick="window.print()">🖨️ Imprimir / Salvar PDF</button></div>
  <div class="vis-rodape"><img src="${LOGO_MAFRA}" alt="Mafra"></div>
  <div style="height:46px" class="noprint"></div>

  ${capaCond?`<div class="pg capa-arte" style="background-image:url('${capaCond}')">
    <div class="topo">
      <div class="eyebrow2">VISTORIA DIAGNÓSTICA 360°</div>
      <div class="sub2">Auditoria executiva e due diligence patrimonial</div>
    </div>
    <div class="rodape">
      📋 <b>${esc(_visTipoLbl(rec))}</b><br>
      🗓️ Data da vistoria: <b>${_visFmtData(rec.data)}</b> &nbsp;·&nbsp; 👤 Responsável técnico: <b>${esc(_visNome(rec.responsavelUid))}</b>${rec.equipe?` &nbsp;·&nbsp; 👥 Equipe: <b>${esc(rec.equipe)}</b>`:""}<br>
      📊 Status: <b>${rec.status==="concluida"?"Concluída":"Em andamento"}</b> · ${st.total?Math.round(st.avaliados/st.total*100):0}% avaliado &nbsp;·&nbsp; Diagnóstico gerado pelo app Gestão Mafra
    </div>
  </div>`:`<div class="pg capa"><div class="capa-in">
    <div class="eyebrow">VISTORIA DIAGNÓSTICA 360°</div>
    <h1>${esc(rec.condominio)}</h1>
    <div class="sub">Auditoria executiva e due diligence patrimonial</div>
    <div class="meta">
      📋 &nbsp;Roteiro: <b>${esc(_visTipoLbl(rec))}</b><br>
      🗓️ &nbsp;Data da vistoria: <b>${_visFmtData(rec.data)}</b><br>
      👤 &nbsp;Responsável técnico: <b>${esc(_visNome(rec.responsavelUid))}</b><br>
      ${rec.equipe?`👥 &nbsp;Equipe: <b>${esc(rec.equipe)}</b><br>`:""}
      📊 &nbsp;Status: <b>${rec.status==="concluida"?"Concluída":"Em andamento"}</b> · ${st.total?Math.round(st.avaliados/st.total*100):0}% avaliado
    </div>
  </div>
  <div class="logo"><img src="${LOGO_MAFRA_BR}" style="height:58px;display:block" alt="Mafra Gestão Integrada"></div>
  <div class="stamp">Diagnóstico gerado pelo<br>app Gestão Mafra</div>
  </div>`}

  <div class="pg"><div class="sec">
    <div class="sec-h">RESUMO EXECUTIVO</div>
    <div class="saude"><div class="saude-n">${st.saude}</div><div class="saude-x">
      <div class="saude-l">Índice de Saúde Condominial (0–100)</div>
      <div class="saude-d">Conformidade geral de ${st.conformidade}% · ${st.naoConf} não conformidade(s) · ${st.cont.critico||0} crítica(s)${st.avaliados<st.total?` · <b>cálculo parcial: média dos ${st.avaliados} de ${st.total} itens avaliados</b>`:""}</div>
      <div class="saude-bar"><i style="width:${st.saude}%"></i></div>
    </div></div>
    <div class="rcards">${cardResumo}</div>
    <div class="sec-h" style="margin-top:34px">MATURIDADE OPERACIONAL</div>
    ${_visRadarSVG(dims)}
  </div></div>

  <div class="pg"><div class="sec">
    <div class="sec-h">PLANO DE AÇÃO CONSOLIDADO</div>
    ${plano}
    <div class="assina">
      <div class="linha">${esc(_visNome(rec.responsavelUid))}<br><span style="font-size:11px">Responsável técnico</span></div>
      <div class="linha"><img src="${LOGO_MAFRA}" style="height:30px;display:block;margin-bottom:4px" alt="Mafra"><span style="font-size:11px">Consultoria & Auditoria</span></div>
    </div>
    <div class="leg">Classificação dos achados: 🔴 Crítico (até 7 dias) · 🟠 Necessita correção (até 30 dias) · 🟡 Atenção (até 90 dias) · 🔵 Oportunidade de valorização (planejamento anual) · 🟢 Conforme · ⚪ N/A.</div>
  </div></div>
  ${contraCond?`<div class="pg capa-arte" style="background-image:url('${contraCond}')"></div>`:""}
  </body></html>`;
  try{ win.document.open(); win.document.write(html); win.document.close(); }catch(e){}
}

/* ================================= VISUAL ================================ */
function _visCSS(){ return `
  :root{--vis-azul:#0F4C81;--vis-azulesc:#082C4E;--vis-cinza:#F5F7FA}
  .vis-hero,.vis-cards,.vis-card,.vis-exec-top,.vis-dash,.vis-analytics,.vis-nav,.vis-bloco-atual,.vis-det,.vis-saude,.vis-panel{font-family:"Montserrat",-apple-system,BlinkMacSystemFont,sans-serif}
  .vis-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;background:linear-gradient(135deg,#082C4E,#0F4C81);color:#fff;border-radius:16px;padding:22px 24px;margin-bottom:18px;flex-wrap:wrap}
  .vis-hero-eyebrow{font-size:11px;letter-spacing:3px;color:#9fc1e0;font-weight:700}
  .vis-hero h2{font-size:22px;margin:4px 0 2px}
  .vis-hero-sub{font-size:13px;color:#cfe0f0}
  .vis-btn-prim{background:#0F4C81;color:#fff;border:none;border-radius:10px;padding:11px 18px;font-weight:700;cursor:pointer;font-family:inherit;font-size:14px}
  .vis-hero .vis-btn-prim{background:#fff;color:#0F4C81}
  .vis-btn-prim.sm{padding:8px 13px;font-size:13px}
  .vis-btn-ghost{background:#fff;color:#0F4C81;border:1.5px solid #cdd9e6;border-radius:10px;padding:11px 16px;font-weight:700;cursor:pointer;font-family:inherit}
  .vis-btn-ghost.sm{padding:7px 12px;font-size:13px}
  .vis-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px}
  .vis-card{background:#fff;border:1px solid #e3e9f0;border-radius:16px;padding:18px 20px;box-shadow:0 2px 10px rgba(8,44,78,.06);cursor:pointer;transition:transform .12s,box-shadow .12s}
  .vis-card:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(8,44,78,.12)}
  .vis-card-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
  .vis-card-cond{font-size:16px;font-weight:800;color:#082C4E}
  .vis-card-meta{font-size:12.5px;color:#6b7686;margin-top:2px}
  .vis-badge{font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap}
  .vis-badge.ok{background:#e7f5ec;color:#1E9E5A}.vis-badge.wip{background:#eaf1f8;color:#0F4C81}
  .vis-card-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0 10px}
  .vis-kpi{text-align:center;background:#F5F7FA;border-radius:10px;padding:8px 4px}
  .vis-kpi b{display:block;font-size:16px;color:#082C4E;line-height:1.1}.vis-kpi span{font-size:9.5px;color:#6b7686;text-transform:uppercase;letter-spacing:.3px}
  .vis-prog-bar{height:8px;background:#eef2f7;border-radius:6px;overflow:hidden}.vis-prog-bar span{display:block;height:100%;background:linear-gradient(90deg,#0F4C81,#3a82c4)}
  .vis-prog-txt{font-size:11.5px;color:#6b7686;margin-top:5px;font-weight:600}
  .vis-card-acoes{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
  /* editor */
  .vis-hero-btns{display:flex;gap:10px;flex-wrap:wrap}
  .vis-btn-hero-ghost{background:rgba(255,255,255,.12);color:#fff;border:1.5px solid rgba(255,255,255,.45);border-radius:10px;padding:11px 16px;font-weight:700;cursor:pointer;font-family:inherit;font-size:14px}
  .vis-ext-form{background:#fff;border:1px solid #e3e9f0;border-radius:16px;padding:20px 18px;max-width:520px;margin:0 auto;font-family:"Montserrat",sans-serif;box-shadow:0 2px 10px rgba(8,44,78,.06)}
  .vis-ext-form label{display:block;font-size:12px;font-weight:700;color:#566;margin-bottom:13px}
  .vis-ext-form .inp{width:100%;margin-top:4px;padding:11px 10px;border:1.5px solid #dde4ec;border-radius:9px;font-size:15px;font-family:inherit;background:#fff}
  .vis-obrig{font-size:9.5px;font-weight:800;color:#fff;background:#0F4C81;padding:2px 7px;border-radius:10px;letter-spacing:.5px;text-transform:uppercase;margin-left:4px}
  .vis-ext-status{margin-top:12px;display:inline-block;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:6px 12px;font-size:11.5px;font-weight:700;color:#e6eef7}
  .vis-ext-acoes{margin-top:12px}
  .vis-ext-conds{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
  .vis-ext-cond{background:#fff;border:1.5px solid #e3e9f0;border-radius:12px;padding:16px 14px;font-size:15px;font-weight:700;color:#082C4E;cursor:pointer;font-family:"Montserrat",sans-serif;text-align:left;transition:.12s}
  .vis-ext-cond:active{transform:scale(.985)}
  .vis-ext-cond:hover{border-color:#0F4C81;box-shadow:0 4px 14px rgba(8,44,78,.12)}
  .vis-ext-head{background:linear-gradient(150deg,#082C4E,#0F4C81);color:#fff;border-radius:16px;padding:24px 22px;margin-bottom:16px;font-family:"Montserrat",sans-serif}
  .vis-ext-brand{font-size:15px;font-weight:800;letter-spacing:3px}
  .vis-ext-brand span{display:block;font-size:8px;letter-spacing:5px;color:#9fc1e0;font-weight:400}
  .vis-ext-ver{font-size:9.5px;color:#7fa3c4;letter-spacing:1px;margin-top:2px}
  .vis-ext-tit{font-size:12px;letter-spacing:2px;color:#C9A24B;font-weight:700;margin:12px 0 6px;text-transform:uppercase}
  .vis-ext-head .vis-exec-cond{color:#fff;font-size:20px}
  .vis-ext-nota{margin-top:12px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:10px 12px;font-size:12.5px;line-height:1.5;color:#e6eef7}
  .vis-exec-top{display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap}
  .vis-exec-cond{font-size:18px;font-weight:800;color:#082C4E}.vis-exec-meta{font-size:12.5px;color:#6b7686}
  .vis-dash{display:grid;grid-template-columns:200px 1fr;gap:14px;margin-bottom:14px}
  .vis-saude{background:linear-gradient(150deg,#082C4E,#0F4C81);color:#fff;border-radius:16px;padding:18px;text-align:center;display:flex;flex-direction:column;justify-content:center}
  .vis-saude-n{font-size:52px;font-weight:800;line-height:1}
  .vis-saude-l{font-size:12.5px;font-weight:700;margin-top:4px;color:#dce8f4}
  .vis-saude-bar{height:8px;background:rgba(255,255,255,.2);border-radius:6px;margin:12px 0 6px;overflow:hidden}.vis-saude-bar span{display:block;height:100%;background:#5BC98B}
  .vis-saude-prog{font-size:11px;color:#bcd3ea}
  .vis-dcards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .vis-dcard{background:#fff;border:1px solid #e3e9f0;border-radius:14px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(8,44,78,.05)}
  .vis-dcard-v{font-size:24px;font-weight:800;line-height:1.05}.vis-dcard-l{font-size:11px;color:#6b7686;margin-top:5px;font-weight:600}
  .vis-analytics{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px}
  .vis-analytics.one{grid-template-columns:1fr}
  .vis-panel{background:#fff;border:1px solid #e3e9f0;border-radius:16px;padding:16px 18px;box-shadow:0 2px 8px rgba(8,44,78,.05)}
  .vis-panel-h{font-size:13px;font-weight:800;color:#082C4E;letter-spacing:.4px;margin-bottom:8px}
  .vis-radar{width:100%;max-width:480px;display:block;margin:0 auto}
  .vis-invtot{font-size:26px;font-weight:800;color:#082C4E;margin-bottom:12px}.vis-invtot span{font-size:12px;color:#6b7686;font-weight:600;margin-left:6px}
  .vis-invrow{display:flex;align-items:center;gap:10px;margin-bottom:9px}
  .vis-invrow-l{flex:0 0 120px;font-size:11px;color:#445;font-weight:600}
  .vis-invbar{flex:1;height:11px;background:#eef2f7;border-radius:6px;overflow:hidden}.vis-invbar span{display:block;height:100%}
  .vis-invrow-v{flex:0 0 84px;text-align:right;font-size:12px;font-weight:800;color:#082C4E}
  .vis-nav{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 12px;margin-bottom:14px;-webkit-overflow-scrolling:touch}
  .vis-navbtn{flex:0 0 auto;min-width:150px;text-align:left;background:#fff;border:1.5px solid #e3e9f0;border-radius:12px;padding:10px 12px;cursor:pointer;font-family:inherit;display:flex;flex-direction:column;gap:3px}
  .vis-navbtn.on{border-color:#0F4C81;background:#eaf1f8;box-shadow:0 2px 8px rgba(15,76,129,.15)}
  .vis-navbtn-n{font-size:10px;font-weight:800;color:#9fb0c9}
  .vis-navbtn-t{font-size:13px;font-weight:700;color:#082C4E;line-height:1.15}
  .vis-navbtn-m{font-size:10.5px;color:#6b7686;font-weight:600}.vis-navbtn-m b{color:#D23B3B}
  .vis-bloco-atual{background:#fff;border:1px solid #e3e9f0;border-radius:16px;padding:18px 20px;box-shadow:0 2px 8px rgba(8,44,78,.05)}
  .vis-bloco-titulo{font-size:18px;font-weight:800;color:#082C4E;display:flex;align-items:center;gap:10px;margin-bottom:6px}
  .vis-bloco-n{background:#082C4E;color:#fff;font-weight:800;font-size:13px;width:30px;height:30px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center}
  .vis-secao{margin-top:16px}
  .vis-secao-t{font-size:12px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#0F4C81;border-bottom:1px solid #eef2f7;padding-bottom:5px;margin-bottom:8px}
  .vis-item{padding:11px 0;border-bottom:1px solid #f1f4f8}.vis-item:last-child{border-bottom:none}
  .vis-item-nome{font-size:14px;font-weight:600;color:#2a3a55;margin-bottom:8px}
  .vis-cls-wrap{display:flex;flex-wrap:wrap;gap:6px}
  .vis-cls{font-size:11.5px;font-weight:700;padding:5px 11px;border:1.5px solid #e0e6ee;border-radius:20px;background:#fff;cursor:pointer;color:#555;font-family:inherit}
  .vis-cls.on{color:#fff}
  .vis-det-toggle{margin-top:9px;background:#F5F7FA;border:1px solid #e3e9f0;border-radius:8px;padding:6px 11px;font-size:12px;font-weight:700;color:#0F4C81;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px}
  .vis-det-toggle .seta{transition:transform .2s;font-size:11px}
  .vis-det-toggle.on{background:#082C4E;color:#fff;border-color:#082C4E}.vis-det-toggle.on .seta{transform:rotate(180deg)}
  .vis-det{margin-top:11px;background:#F8FAFC;border:1px solid #e8eef4;border-radius:10px;padding:13px;display:none}.vis-det.aberto{display:block}
  .vis-campos{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .vis-det label{display:block;font-size:11.5px;font-weight:700;color:#566;margin-bottom:9px}.vis-det label.vis-full{grid-column:1/-1}
  .vis-det .inp{width:100%;margin-top:3px;padding:8px 9px;border:1.5px solid #dde4ec;border-radius:8px;font-size:13px;font-family:inherit;background:#fff}
  .vis-det textarea.inp{resize:vertical}
  .vis-obs-tools{display:flex;gap:8px;flex-wrap:wrap;margin:-3px 0 11px}
  .vis-tool-btn{flex:1;min-width:145px;text-align:center;background:#fff;border:1.5px solid #cdd9e6;border-radius:9px;padding:9px 10px;font-size:12px;font-weight:700;color:#0F4C81;cursor:pointer;font-family:inherit}
  .vis-legenda{background:#fff;border:1px solid #e3e9f0;border-radius:12px;padding:10px 14px;margin-bottom:14px;display:flex;flex-wrap:wrap;gap:5px 16px;font-family:"Montserrat",sans-serif;align-items:center}
  .vis-legenda-tit{font-size:10.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#8a93a3}
  .vis-legenda-i{font-size:11.5px;color:#5a6473;line-height:1.5}
  .vis-legenda-i b{font-weight:700}
  .vis-tool-btn:disabled{opacity:.7;cursor:wait}
  .vis-tool-btn.rec{background:#D23B3B;border-color:#D23B3B;color:#fff;animation:visPulse 1.1s ease-in-out infinite}
  @keyframes visPulse{0%,100%{box-shadow:0 0 0 0 rgba(210,59,59,.45)}50%{box-shadow:0 0 0 7px rgba(210,59,59,0)}}
  .vis-prazo-row{display:flex;align-items:flex-end;gap:10px;flex-wrap:wrap;margin-bottom:9px}
  .vis-prazo-row label{flex:1;min-width:170px;margin-bottom:0}
  .vis-done-btn{background:#1E9E5A;color:#fff;border:none;border-radius:9px;padding:10px 14px;font-weight:700;font-size:12.5px;cursor:pointer;font-family:inherit;white-space:nowrap}
  .vis-done-btn.undo{background:#fff;color:#566;border:1.5px solid #cdd9e6}
  .vis-done-tag{font-size:11px;font-weight:700;color:#1E9E5A;background:#e7f5ec;padding:2px 8px;border-radius:14px;margin-left:6px;white-space:nowrap}
  .vis-save-btn{display:block;width:100%;margin-top:12px;background:#0F4C81;color:#fff;border:none;border-radius:10px;padding:12px;font-weight:800;font-size:14px;cursor:pointer;font-family:inherit}
  .vis-save-btn:disabled{opacity:.7;cursor:wait}
  .vis-fotos-lbl{font-size:11.5px;font-weight:700;color:#566;margin:2px 0 6px}
  .vis-fotos{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}
  .vis-fotos-vazio{font-size:12px;color:#9fb0c9;font-style:italic}
  .vis-fotos-btns{display:flex;gap:8px;flex-wrap:wrap}
  .vis-fotos-btns .vis-btn-ghost{flex:1;min-width:140px;text-align:center}
  .vis-foto{position:relative;width:96px}.vis-foto-img{position:relative}.vis-foto-img img{width:96px;height:96px;object-fit:cover;border-radius:8px;border:1px solid #ddd;display:block}
  .vis-foto-tit{width:96px;margin-top:4px;padding:4px 6px;border:1px solid #dde4ec;border-radius:6px;font-size:10.5px;font-family:inherit;background:#fff}
  .vis-foto-x{position:absolute;top:-7px;right:-7px;width:20px;height:20px;border-radius:50%;background:#D23B3B;color:#fff;border:2px solid #fff;cursor:pointer;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center}
  @media(max-width:780px){ .vis-dash{grid-template-columns:1fr}.vis-dcards{grid-template-columns:repeat(2,1fr)}.vis-analytics{grid-template-columns:1fr} }
`; }
