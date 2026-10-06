/* ############################################################################
   ABA: CHECK LIST — termos e checklists por condomínio
   Formatos: termo (uso de área comum, padrão FORM 22) · estoque · patrimônio
   Impressão com assinaturas (requisitante/condômino, zelador, síndico/Mafra).
   Storage: mafra:checklist:<condomínio>  (array de checklists)
   ############################################################################ */
var _clState={cond:null,lista:null,edit:null,dirty:false,scroll:0,goBottom:false,pai:null};
var _clBIND=[];

async function loadCLs(cond){ try{ var v=await storeGet("mafra:checklist:"+cond); if(v){ var a=JSON.parse(v); (a||[]).forEach(_clMigraCL); return a; } }catch(e){} return []; }
async function saveCLs(cond,arr){ try{_storeCacheClear("mafra:checklist:"+cond);}catch(e){} return await storeSet("mafra:checklist:"+cond, JSON.stringify(arr)); }
function _clId(){ return "cl"+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function _clEsc(s){ return esc(String(s==null?"":s)); }
function _clJs(s){ return String(s==null?"":s).replace(/\\/g,"\\\\").replace(/'/g,"\\'"); }

/* ---------- itens dos modelos (conforme os formulários da Mafra) ---------- */
var _CL_SALAO=[["Mesas","6"],["Cadeiras modelo estofado base em MDF","28"],["Poltronas","2"],["Mesa de centro com base","1"],["Sofá","1"],["Banquetas modelo estofado base em MDF","4"],["Geladeira","1"],["Microondas","1"],["Fogão 4 bocas","1"],["Prateleiras em MDF","2"],["Gabinete L 6 Portas em MDF","3"],["Gabinete 2 Portas e 4 Gavetas em MDF","4"],["Prato raso porcelana","40"],["Prato fundo porcelana","20"],["Prato sobremesa porcelana","40"],["Taça de água/vinho","40"],["Taça de Champagne","40"],["Garfo mesa","40"],["Faca mesa","40"],["Colher mesa","40"],["Garfo sobremesa","40"],["Colher sobremesa","40"],["Porta guardanapo","10"],["Tigela bowl","2 KIT"],["Travessa rasa","2"],["Sopeira","1"],["Colher em inox - Arroz","2"],["Concha em inox","2"],["Pegador massa","2"],["Pegador pequeno liso","2"],["Pegador de gelo","2"],["Concha em inox molho","2"],["Pá em inox bolo","2"],["Colher sorvete","2"],["Jarra bico vidro","2"],["Balde de gelo em inox","3"],["Escorredor","1"],["Abridor de Garrafa/Saca Rolha","1"],["Saleiro","1"],["Lixeira em inox","2"],["Dispenser para Detergente","1"],["Tábua de Frios","1"],["Tábua de Carne","1"]];
var _CL_PIZZA=[["Mesas","3"],["Cadeiras modelo corda náutica","18"],["Bancos","4"],["Refrigerador com 3 grades de apoio","1"],["Prateleira suspensa","1"],["Nicho","1"],["Churrasqueira com 2 Grelhas","1"],["Forno a Lenha","1"],["Gabinete 3 Portas e 4 Gavetas","1"],["Gabinete aberto com 2 Prateleiras","1"],["Pegador de carne","2"],["Faca de corte","2"],["Tábua de carne","2"],["Amolador de faca","2"],["Garfo Trinchante","2"],["Kit pá de pizza","1"],["Luva térmica","1"],["Forma de pizza","4"],["Copo","30"],["Faca mesa","40"],["Colher mesa","40"],["Garfo sobremesa","40"],["Colher sobremesa","40"],["Tigela bowl","2 KIT"],["Porta guardanapo","5"],["Colher em inox - Arroz","2"],["Concha em inox","2"],["Pegador massa","2"],["Pegador pequeno liso","2"],["Pegador de gelo","2"],["Concha em inox molho","2"],["Pá em inox bolo","2"],["Colher sorvete","2"],["Cortador de pizza","2"],["Jarra bico vidro","2"],["Balde de gelo em inox","3"],["Escorredor","1"],["Abridor de Garrafa/Saca Rolha","1"],["Lixeira em inox","2"],["Dispenser para Detergente","1"],["Tábua de Frios","1"],["Lixeira com pedal 50lt","1"]];
var _CL_SPORT=[["Mesas","3"],["Cadeiras modelo corda náutica","4"],["Banquetas modelo corda náutica","10"],["Bancos","6"],["Refrigerador com 3 grades de apoio","1"],["Nicho","1"],["Churrasqueira com 2 Grelhas","1"],["Gabinete 4 Portas e 4 Gavetas","1"],["Gabinete 2 Portas","1"],["Gabinete aberto com 3 Prateleiras","1"],["Pegador de carne","2"],["Faca de corte","2"],["Tábua de carne","2"],["Amolador de faca","2"],["Garfo Trinchante","2"],["Copo","30"],["Faca mesa","40"],["Colher mesa","40"],["Garfo sobremesa","40"],["Colher sobremesa","40"],["Tigela bowl","2 KIT"],["Porta guardanapo","5"],["Colher em inox - Arroz","2"],["Concha em inox","2"],["Pegador massa","2"],["Pegador pequeno liso","2"],["Pegador de gelo","2"],["Concha em inox molho","2"],["Pá em inox bolo","2"],["Colher sorvete","2"],["Jarra bico vidro","2"],["Balde de gelo em inox","3"],["Escorredor","1"],["Abridor de Garrafa/Saca Rolha","1"],["Lixeira em inox","2"],["Dispenser para Detergente","1"],["Tábua de Frios","1"],["Lixeira com pedal 50lt","1"]];
var _CL_LIMPEZA=[["Detergente neutro","L"],["Desinfetante","L"],["Água sanitária","L"],["Álcool 70%","L"],["Álcool em gel","L"],["Sabão em pó","kg"],["Sabão em barra","un"],["Sabonete líquido","L"],["Limpa-vidros","L"],["Limpa-alumínio","L"],["Removedor","L"],["Cera líquida","L"],["Lustra-móveis","un"],["Saponáceo","un"],["Desengordurante","L"],["Limpador multiuso","un"],["Odorizador de ambiente","un"],["Papel higiênico","rolo"],["Papel toalha","pacote"],["Saco de lixo 30L","un"],["Saco de lixo 60L","un"],["Saco de lixo 100L","un"],["Saco de lixo 200L","un"],["Pano de chão","un"],["Pano multiuso","un"],["Flanela","un"],["Esponja dupla face","un"],["Esponja de aço","pacote"],["Vassoura","un"],["Vassoura de piaçava","un"],["Rodo","un"],["MOP","un"],["Escova de vaso","un"],["Balde","un"],["Pá de lixo","un"],["Luva de borracha","par"],["Máscara descartável","un"],["Cloro para piscina","kg"],["Algicida","L"],["Barrilha","kg"]];
var _CL_PATRIM=[["Mesa",""],["Cadeira",""],["Poltrona",""],["Sofá",""],["Armário",""],["Estante",""],["Televisão",""],["Ar-condicionado",""],["Ventilador",""],["Geladeira",""],["Micro-ondas",""],["Fogão",""],["Bebedouro",""],["Computador",""],["Impressora",""],["Telefone / interfone",""],["Câmera de segurança",""],["Monitor / DVR",""],["Aspirador de pó",""],["Lavadora de alta pressão",""],["Roçadeira",""],["Escada",""],["Furadeira",""],["Jogo de ferramentas",""],["Extintor",""],["Mangueira de incêndio",""],["Aparelho de ginástica",""],["Brinquedo (playground)",""],["Guarda-sol / ombrelone",""],["Espreguiçadeira",""]];

var _CL_REGRAS_SALAO="O salão de festas é exclusivo para eventos dos condôminos, sendo proibido o uso por terceiros ou para fins lucrativos.\nÉ dever do condômino garantir a conduta respeitosa dos convidados, sem perturbações e sem circulação nas áreas comuns.\n\nReserva: deve ser feita com antecedência mínima e máxima definidas pelo regimento. O custo de uso é destinado à conservação do espaço e dos itens. Cancelamentos fora do prazo geram cobrança de taxa.\n\nAntes do evento: condômino e zelador devem realizar vistoria conjunta do espaço e do mobiliário. Se o condômino não estiver presente, será considerado que o local está em perfeitas condições (check-list aprovado).\n\nDanos: em caso de avarias ou falta de itens, o condômino terá 7 dias para reparar ou ressarcir após ser notificado.\n\nLimites de espaço: o uso deve se restringir ao salão e à área em frente às portas. É proibido utilizar áreas comuns como piscina, brinquedoteca e salão de jogos durante o evento.\n\nHorários permitidos: conforme o regimento interno. O som deve ser moderado e, após o horário definido, não pode incomodar os moradores.";
var _CL_REGRAS_CHURRAS="Uso exclusivo para moradores. A utilização do espaço deve ser feita mediante agendamento.\nHorário de funcionamento conforme o regimento interno, respeitando os limites de ruído estabelecidos.\nO morador responsável pela reserva deve garantir que o espaço seja entregue limpo e em ordem.\nSom ambiente e televisão são liberados; caixas amplificadas e DJs não são permitidos.\nA capacidade máxima do espaço deve ser respeitada, conforme previsto no Regimento Interno.\nÉ dever do condômino garantir a conduta respeitosa dos convidados, sem perturbações e sem circulação nas áreas comuns.";
var _CL_DECL="Declaro que assumo total responsabilidade pelos itens constantes no check list acima, pela utilização da área/local reservada e pela conservação do estado físico dos itens apresentados neste documento. Declaro, ainda, ser responsável pela unidade autônoma acima citada e estar ciente das obrigações previstas neste termo para o uso da área comum.";

function _clModelo(kind,cond){
  var base={id:_clId(),condominio:cond||"",form:"22",versao:"0",codigo:"PO.RPCA.01",processo:"RPCA",atualizadoEm:Date.now(),atualizadoPor:(typeof state!=="undefined"&&state.userId)||""};
  var mk=function(arr,campo){ return arr.map(function(x,i){ var o={id:"i"+i+"_"+Math.random().toString(36).slice(2,6),nome:x[0],qtd:"",unidade:"",local:"",patr:"",obs:""}; if(campo==="qtd") o.qtd=x[1]; else if(campo==="unidade") o.unidade=x[1]; return o; }); };
  if(kind==="salao")   return Object.assign(base,{nome:"Termo de uso do Salão de Festas",formato:"termo",titulo:"TERMO PARA USO DO SALÃO DE FESTA",local:"Salão de festas",regras:_CL_REGRAS_SALAO,declaracao:_CL_DECL,itens:mk(_CL_SALAO,"qtd")});
  if(kind==="pizza")   return Object.assign(base,{nome:"Termo de uso da Churrasqueira / Forno de Pizza",formato:"termo",titulo:"TERMO PARA USO DA CHURRASQUEIRA / FORNO PIZZA",local:"Churrasqueira / forno de pizza",regras:_CL_REGRAS_CHURRAS,declaracao:_CL_DECL,itens:mk(_CL_PIZZA,"qtd")});
  if(kind==="sport")   return Object.assign(base,{nome:"Termo de uso da Churrasqueira / Sport Bar",formato:"termo",titulo:"TERMO PARA USO DA CHURRASQUEIRA / SPORT BAR",local:"Churrasqueira / Sport Bar",regras:_CL_REGRAS_CHURRAS,declaracao:_CL_DECL,itens:mk(_CL_SPORT,"qtd")});
  if(kind==="limpeza") return Object.assign(base,{nome:"Controle de estoque — Material de limpeza",formato:"estoque",titulo:"CONTROLE DE ESTOQUE — MATERIAL DE LIMPEZA",local:"Depósito de limpeza",regras:"Conferência mensal do estoque. Registrar a quantidade contada e solicitar reposição dos itens abaixo do mínimo.",declaracao:"",itens:mk(_CL_LIMPEZA,"unidade")});
  if(kind==="patrim")  return Object.assign(base,{nome:"Inventário de patrimônio",formato:"patrimonio",titulo:"INVENTÁRIO DE PATRIMÔNIO",local:"Áreas comuns",regras:"Conferência do patrimônio do condomínio. Registrar quantidade, local e estado de conservação de cada bem.",declaracao:"",itens:mk(_CL_PATRIM,"qtd")});
  if(kind==="termo")   return Object.assign(base,{nome:"Termo de uso de área comum",formato:"termo",titulo:"TERMO PARA USO DE ÁREA COMUM",local:"",regras:_CL_REGRAS_CHURRAS,declaracao:_CL_DECL,itens:[{nome:"",qtd:"",unidade:"",local:"",patr:"",obs:""}]});
  return Object.assign(base,{nome:"Novo checklist",formato:"estoque",titulo:"CHECK LIST",local:"",regras:"",declaracao:"",itens:[{nome:"",qtd:"",unidade:"",local:"",patr:"",obs:""}]});
}

/* ---------- registros (conferências) — o histórico por unidade ---------- */
function _clNovoRegistro(cl){
  var hoje=new Date().toISOString().slice(0,10);
  return {id:_clId(), unidade:"", condomino:"", telefone:"", dataEvento:hoje,
    entrega:{data:hoje, itens:{}, ass:{cond:false,zel:false,mafra:false}},
    devolucao:{data:"", itens:{}, ass:{cond:false,zel:false,mafra:false}},
    obs:"", status:"aberto", criadoEm:Date.now(), criadoPor:(typeof state!=="undefined"&&state.userId)||""};
}
function _clStatusLbl(r){
  var e=r.entrega&&Object.keys(r.entrega.itens||{}).length, d=r.devolucao&&Object.keys(r.devolucao.itens||{}).length;
  if(d) return ["Devolvido","#2f7d5b","#e7f3ec"];
  if(e) return ["Entregue","#8a6d1f","#f7efdd"];
  return ["Aberto","#4a5b6a","#eef2f6"];
}
function _clNaoConf(r,fase){
  var f=r[fase]||{}, it=f.itens||{}, n=0;
  Object.keys(it).forEach(function(k){ if(it[k] && it[k].st==="nao") n++; });
  return n;
}
function _clMigraCL(cl){
  if(!Array.isArray(cl.itens)) cl.itens=[];
  cl.itens.forEach(function(it,i){ if(it && !it.id) it.id="i"+i+"_"+Math.random().toString(36).slice(2,6); });
  if(!Array.isArray(cl.registros)) cl.registros=[];
  cl.registros.forEach(function(r){
    ["entrega","devolucao"].forEach(function(f){
      if(!r[f]) r[f]={data:"",itens:{},ass:{cond:false,zel:false,mafra:false}};
      if(!r[f].itens) r[f].itens={};
      var novo={}, precisa=false;
      Object.keys(r[f].itens).forEach(function(k){
        if(/^\d+$/.test(k)){ precisa=true; var it=cl.itens[+k]; if(it&&it.id) novo[it.id]=r[f].itens[k]; }
        else novo[k]=r[f].itens[k];
      });
      if(precisa) r[f].itens=novo;
    });
  });
  if((cl.formato||"")==="estoque"){
    if(!Array.isArray(cl.movs)) cl.movs=[];
    (cl.itens||[]).forEach(function(it){ if(it){ if(it.min==null) it.min=""; if(it.saldo==null) it.saldo=(it.qtd!=null?it.qtd:""); } });
  }
  return cl;
}
function _clDataBR(d){ if(!d) return "—"; var p=String(d).split("-"); return p.length===3?(p[2]+"/"+p[1]+"/"+p[0]):String(d); }
/* ---------- impressão: padrão FORM da Mafra ---------- */
function _clAssBloco(titulo,ass){
  return '<div class="assbox"><div class="asstit">'+titulo+'</div>'
    + ass.map(function(a){ return '<div class="assln">_____________________________<div class="asslbl">'+a+'</div></div>'; }).join("")
    + '<div class="assdata">Data: ______ / ______ / ______.</div></div>';
}
function imprimirCL(id){
  var w=window.open("","_blank");
  var cl=(_clState.lista||[]).filter(function(x){return x.id===id;})[0] || _clState.edit;
  if(!w||!cl) return;
  var cond=_clEsc(_clState.cond||cl.condominio||"");
  var itens=(cl.itens||[]).filter(function(it){return it&&it.nome;});
  var fmt=cl.formato||"estoque";
  var head="", body="", assinaturas="", declar="";

  if(fmt==="termo"){
    head='<tr><th rowspan="2" class="n">#</th><th rowspan="2">Itens</th><th rowspan="2" class="q">Qtde</th>'
        +'<th colspan="8" class="ef">Estado físico dos itens</th><th rowspan="2" class="ou">Outros</th></tr>'
        +'<tr><th colspan="2" class="sub">Novo</th><th colspan="2" class="sub">Bom</th><th colspan="2" class="sub">Ruim</th><th colspan="2" class="sub">Riscado</th></tr>';
    var sub='<tr class="if"><td></td><td></td><td></td><td>I</td><td>F</td><td>I</td><td>F</td><td>I</td><td>F</td><td>I</td><td>F</td><td></td></tr>';
    body=sub+itens.map(function(it,k){
      return '<tr><td class="n">'+(k+1)+'</td><td>'+_clEsc(it.nome)+'</td><td class="q">'+_clEsc(it.qtd)+'</td>'
        +'<td class="c"></td><td class="c"></td><td class="c"></td><td class="c"></td><td class="c"></td><td class="c"></td><td class="c"></td><td class="c"></td><td></td></tr>';
    }).join("");
    declar='<div class="decl">'+_clEsc(cl.declaracao||_CL_DECL)+'</div><div class="decl2">DECLARO AINDA, ESTAR DE ACORDO COM O ESTADO FÍSICO DOS ITENS CITADOS ACIMA.</div>';
    assinaturas='<div class="asswrap">'+_clAssBloco("RECEBIMENTO DA ÁREA",["Ass. Requisitante (condômino)","Ass. Zelador","Ass. Mafra Gestão Integrada"])
              + _clAssBloco("DEVOLUÇÃO DA ÁREA",["Ass. Requisitante (condômino)","Ass. Zelador","Ass. Mafra Gestão Integrada"])+'</div>';
  } else if(fmt==="estoque"){
    head='<tr><th class="n">#</th><th>Item</th><th class="q">Unidade</th><th class="q">Quantidade</th><th class="q">Qtd. contada</th><th class="ou">Observação / reposição</th></tr>';
    body=itens.map(function(it,k){
      return '<tr><td class="n">'+(k+1)+'</td><td>'+_clEsc(it.nome)+'</td><td class="q">'+_clEsc(it.unidade)+'</td><td class="q">'+_clEsc(it.qtd)+'</td><td class="c"></td><td></td></tr>';
    }).join("");
    assinaturas='<div class="asswrap">'+_clAssBloco("CONFERÊNCIA",["Ass. Zelador","Ass. Síndico / Mafra Gestão Integrada"])+'</div>';
  } else {
    head='<tr><th class="n">#</th><th>Bem / item</th><th class="q">Qtde</th><th class="q">Local</th><th class="q">Nº patrimônio</th><th colspan="3" class="ef">Estado</th><th class="ou">Observação</th></tr>'
        +'<tr class="if"><td></td><td></td><td></td><td></td><td></td><td>Bom</td><td>Regular</td><td>Ruim</td><td></td></tr>';
    body=itens.map(function(it,k){
      return '<tr><td class="n">'+(k+1)+'</td><td>'+_clEsc(it.nome)+'</td><td class="q">'+_clEsc(it.qtd)+'</td><td class="q">'+_clEsc(it.local)+'</td><td class="q">'+_clEsc(it.patr)+'</td>'
        +'<td class="c"></td><td class="c"></td><td class="c"></td><td></td></tr>';
    }).join("");
    assinaturas='<div class="asswrap">'+_clAssBloco("CONFERÊNCIA",["Ass. Zelador","Ass. Síndico / Mafra Gestão Integrada"])+'</div>';
  }

  var idBlock = (fmt==="termo")
    ? '<div class="ident"><div class="fi"><b>Nome do Condomínio:</b> '+cond+'</div><div class="fi"><b>Apartamento / Unidade:</b> ______________</div><div class="fi"><b>Nome do condômino:</b> ______________________</div><div class="fi"><b>Data do Evento:</b> ______ /______/ ______</div></div>'
    : '<div class="ident"><div class="fi"><b>Nome do Condomínio:</b> '+cond+'</div><div class="fi"><b>Local:</b> '+_clEsc(cl.local||"")+'</div><div class="fi"><b>Responsável:</b> ____________________</div><div class="fi"><b>Data:</b> ______ /______/ ______</div></div>';

  var regras = cl.regras ? '<div class="secth">RESPONSABILIDADES E OBRIGAÇÕES</div><div class="regras">'+_clEsc(cl.regras).replace(/\n/g,"<br>")+'</div>' : "";

  var html='<!doctype html><html><head><meta charset="utf-8"><title>'+_clEsc(cl.nome||"Check list")+' · '+cond+'</title><style>'
   +'@page{size:A4;margin:10mm}*{box-sizing:border-box}'
   +'body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#111;font-size:10px}'
   +'.topo{display:flex;border:1.5px solid #1a2a4a;margin-bottom:8px}'
   +'.logo{width:150px;border-right:1.5px solid #1a2a4a;display:flex;align-items:center;justify-content:center;padding:6px;font-weight:800;font-size:15px;letter-spacing:2px;color:#1a2a4a}'
   +'.tituloc{flex:1;text-align:center}'
   +'.tituloc .l1{background:#1a2a4a;color:#fff;font-weight:700;font-size:12px;padding:5px}'
   +'.tituloc .l2{font-weight:700;font-size:10px;padding:3px;border-bottom:1px solid #1a2a4a}'
   +'.tituloc .l3{background:#1a2a4a;color:#fff;font-weight:700;font-size:11.5px;padding:5px}'
   +'.meta{width:150px;border-left:1.5px solid #1a2a4a;font-size:8px}'
   +'.meta div{display:flex;border-bottom:1px solid #1a2a4a}'
   +'.meta div:last-child{border-bottom:none}'
   +'.meta span{flex:1;padding:2px 4px;border-right:1px solid #1a2a4a}.meta span:last-child{border-right:none;text-align:center;font-weight:700}'
   +'.ident{border:1.5px solid #1a2a4a;padding:6px 8px;display:flex;flex-wrap:wrap;gap:4px 20px;font-size:10px;margin-bottom:8px}'
   +'.ident .fi{flex:1;min-width:180px}'
   +'.secth{background:#1a2a4a;color:#fff;text-align:center;font-weight:700;font-size:11px;padding:4px;letter-spacing:.5px}'
   +'.regras{border:1px solid #1a2a4a;border-top:none;padding:6px 8px;font-size:9px;line-height:1.45;margin-bottom:8px}'
   +'table{width:100%;border-collapse:collapse}'
   +'th{background:#1a2a4a;color:#fff;border:1px solid #1a2a4a;padding:3px;font-size:8.5px;text-align:center}'
   +'th.ef{background:#2c3f66}th.sub{background:#2c3f66;font-size:8px}'
   +'td{border:1px solid #6d7d99;padding:3px 5px;font-size:9.5px;height:16px}'
   +'td.n{width:20px;text-align:center;font-weight:700}td.q{width:52px;text-align:center;font-weight:700;color:#b8402f}'
   +'td.c{width:20px;background:#eef1f5}td.ou{width:110px}'
   +'tr.if td{background:#1a2a4a;color:#fff;text-align:center;font-weight:700;font-size:8px;height:12px}'
   +'.decl{border:1px solid #1a2a4a;padding:6px 8px;font-size:9px;line-height:1.45;margin-top:8px}'
   +'.decl2{font-size:9px;font-weight:700;text-align:center;margin:6px 0}'
   +'.asswrap{display:flex;gap:16px;margin-top:10px}'
   +'.assbox{flex:1;border:1px solid #1a2a4a;padding:8px;text-align:center}'
   +'.asstit{font-weight:700;font-size:9.5px;margin-bottom:10px;letter-spacing:.5px}'
   +'.assln{margin-bottom:12px;font-size:10px;color:#444}'
   +'.asslbl{font-size:8.5px;color:#555;margin-top:1px}'
   +'.assdata{font-size:9px;margin-top:4px}'
   +'thead{display:table-header-group}tr{page-break-inside:avoid}'
   +'</style></head><body>'
   +'<div class="topo"><div class="logo">MAFRA</div>'
     +'<div class="tituloc"><div class="l1">SISTEMA DE GESTÃO DA QUALIDADE</div><div class="l2">Formulários</div><div class="l3">'+_clEsc(cl.titulo||cl.nome||"CHECK LIST")+'</div></div>'
     +'<div class="meta"><div><span>FORM</span><span>'+_clEsc(cl.form||"22")+'</span></div><div><span>VERSÃO</span><span>'+_clEsc(cl.versao||"0")+'</span></div><div><span>PROCESSO</span><span>'+_clEsc(cl.processo||"RPCA")+'</span></div><div><span>CÓDIGO</span><span>'+_clEsc(cl.codigo||"PO.RPCA.01")+'</span></div></div>'
   +'</div>'
   + idBlock + regras
   +'<div class="secth">CHECK LIST</div>'
   +'<table><thead>'+head+'</thead><tbody>'+body+'</tbody></table>'
   + declar + assinaturas
   +'</body></html>';
  w.document.open(); w.document.write(html); w.document.close();
  setTimeout(function(){ try{ w.focus(); w.print(); }catch(e){} }, 450);
}

/* ---------- CSS ---------- */
function _clCSS(){
  if(document.getElementById("clCSS")) return;
  var css=`
#clRoot{--cl-navy:#17253f;--cl-gold:#b8912f;--cl-line:#e6eaf0;--cl-mut:#6a7688;--cl-soft:#f7f9fb;max-width:1180px}
#clRoot .cl-head{display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--cl-line)}
#clRoot .cl-head h2{margin:0;display:flex;align-items:center;gap:9px;font-size:22px;color:var(--cl-navy)}
#clRoot .cl-head .sub{color:var(--cl-mut);font-size:13px;margin-top:3px}
#clRoot .cl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
#clRoot .clc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(312px,1fr));gap:15px;margin-top:4px}
#clRoot .clc-card{display:flex;align-items:center;gap:14px;background:#fff;border:1px solid var(--cl-line);border-radius:14px;padding:14px 16px;cursor:pointer;transition:.16s cubic-bezier(.2,.7,.3,1);box-shadow:0 1px 2px rgba(20,33,56,.05)}
#clRoot .clc-card:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(20,33,56,.13);border-color:#c9a84c}
#clRoot .clc-mono{width:54px;height:54px;flex:none;border-radius:13px;background:linear-gradient(135deg,#21365b,#17253f);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;letter-spacing:.5px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07),0 4px 12px rgba(20,33,56,.18)}
#clRoot .clc-mono b{color:#c9a84c;font-weight:800}
#clRoot .clc-body{flex:1;min-width:0}
#clRoot .clc-nm{font-weight:800;color:var(--cl-navy);font-size:14.5px;line-height:1.28;margin-bottom:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#clRoot .clc-count{font-size:12px;color:var(--cl-mut)}
#clRoot .clc-count b{color:var(--cl-navy);font-weight:800}
#clRoot .clc-badge{flex:none;align-self:flex-start;font-size:9.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:4px 10px;border-radius:999px;white-space:nowrap}
#clRoot .clc-ok{background:#e7f3ec;color:#2f7d5b}
#clRoot .clc-novo{background:#eef2f6;color:#6a7688}
@media(max-width:640px){#clRoot .clc-grid{grid-template-columns:1fr}}
#clRoot .cl-card{background:#fff;border:1px solid var(--cl-line);border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(20,33,56,.04);transition:.18s;display:flex;flex-direction:column}
#clRoot .cl-card:hover{box-shadow:0 8px 24px rgba(20,33,56,.10);transform:translateY(-1px)}
#clRoot .cl-strip{height:4px}
#clRoot .cl-k-termo{background:linear-gradient(90deg,#b8912f,#d8b45c)}
#clRoot .cl-k-estoque{background:linear-gradient(90deg,#2b4d8f,#5b7fc4)}
#clRoot .cl-k-patrimonio{background:linear-gradient(90deg,#2f7d5b,#59ad86)}
#clRoot .cl-card-h{display:flex;gap:12px;padding:16px 17px 12px}
#clRoot .cl-ic{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;flex:none}
#clRoot .cl-ic svg{width:22px;height:22px}
#clRoot .cl-i-termo{background:#f7efdd;color:#8a6d1f}
#clRoot .cl-i-estoque{background:#e8eefc;color:#2b4d8f}
#clRoot .cl-i-patrimonio{background:#e7f3ec;color:#2f7d5b}
#clRoot .cl-nm{font-weight:700;color:var(--cl-navy);font-size:15px;line-height:1.3}
#clRoot .cl-kind{display:inline-block;font-size:9px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;padding:2px 8px;border-radius:999px;margin-top:5px}
#clRoot .cl-meta{font-size:12px;color:var(--cl-mut);margin-top:6px;display:flex;gap:12px;flex-wrap:wrap}
#clRoot .cl-meta b{color:var(--cl-navy);font-weight:700}
#clRoot .cl-card-f{margin-top:auto;padding:12px 15px;border-top:1px solid var(--cl-line);background:var(--cl-soft);display:flex;align-items:center;gap:7px}
#clRoot .cl-cta{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;background:var(--cl-navy);color:#fff;border:none;border-radius:9px;padding:9px 12px;font-size:12.5px;font-weight:700;cursor:pointer}
#clRoot .cl-cta:hover{background:#22355a}
#clRoot .cl-mini{width:34px;height:34px;border-radius:9px;border:1px solid var(--cl-line);background:#fff;color:var(--cl-mut);display:grid;place-items:center;cursor:pointer;font-size:14px}
#clRoot .cl-mini:hover{color:var(--cl-navy);border-color:var(--cl-navy);background:#fff}
#clRoot .cl-mini.dg:hover{color:#b8402f;border-color:#f0d4cf}
#clRoot .cl-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--cl-line);background:#fff;color:var(--cl-navy);border-radius:9px;padding:8px 13px;font-size:12.5px;font-weight:600;cursor:pointer}
#clRoot .cl-btn:hover{background:var(--cl-soft)}
#clRoot .cl-new{width:100%;margin-top:16px;border:1.5px dashed var(--cl-line);background:#fff;color:var(--cl-navy);border-radius:14px;padding:14px;font-size:13.5px;font-weight:700;cursor:pointer;transition:.15s}
#clRoot .cl-new:hover{border-color:var(--cl-gold);background:#FCFBF8}
#clRoot .cl-modelos{margin-top:16px;border:1.5px dashed var(--cl-gold);border-radius:14px;padding:15px 17px;background:#FCFBF8}
#clRoot .cl-modelos-h{display:flex;align-items:center;gap:8px;margin-bottom:11px}
#clRoot .cl-sec{margin-top:30px}
#clRoot .cl-sec-t{font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--cl-mut);margin-bottom:11px;display:flex;align-items:center;gap:8px}
#clRoot .cl-sec-t svg{width:15px;height:15px}
#clRoot .cl-tblwrap{border:1px solid var(--cl-line);border-radius:14px;overflow:hidden;background:#fff}
#clRoot table.cl-hist{width:100%;border-collapse:collapse;font-size:13px}
#clRoot table.cl-hist th{background:var(--cl-navy);color:#fff;text-align:left;padding:11px 14px;font-size:9.5px;text-transform:uppercase;letter-spacing:.08em;font-weight:800}
#clRoot table.cl-hist td{padding:12px 14px;border-top:1px solid var(--cl-line)}
#clRoot table.cl-hist tbody tr:hover td{background:#fafbfd}
#clRoot .cl-badge{display:inline-block;font-size:9.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;padding:3px 9px;border-radius:999px}
#clRoot .cl-alert{display:inline-block;font-size:10px;font-weight:700;color:#b8402f;background:#fbece9;border-radius:999px;padding:2px 8px;margin-left:6px}
#clRoot .cl-un{font-weight:700;color:var(--cl-navy)}
#clRoot .cl-empty{text-align:center;color:var(--cl-mut);padding:34px 20px;border:1.5px dashed var(--cl-line);border-radius:14px;background:#fff}
#clRoot .cl-empty b{color:var(--cl-navy)}
@media(max-width:700px){#clRoot .cl-grid{grid-template-columns:1fr}#clRoot table.cl-hist th:nth-child(2),#clRoot table.cl-hist td:nth-child(2){display:none}}
#clRoot .est-alert{background:#fbece9;border:1px solid #f0c9c1;border-radius:12px;padding:14px 16px;margin-bottom:16px}
#clRoot .est-alert-t{font-weight:800;color:#b8402f;font-size:13.5px;margin-bottom:9px}
#clRoot .est-alert-list{display:grid;gap:7px}
#clRoot .est-alert-i{display:flex;align-items:center;gap:9px;flex-wrap:wrap;font-size:13px;color:#6b2418}
#clRoot .est-alert-i b{color:#8a2d1c}
#clRoot .est-alert-i span{font-size:11.5px;color:#a05a4c}
#clRoot .est-falta{background:#b8402f;color:#fff;font-weight:700;font-size:10.5px;padding:2px 9px;border-radius:999px;margin-left:auto}
#clRoot .est-ok{background:#e7f3ec;border:1px solid #bfe3ce;color:#2f7d5b;font-weight:700;font-size:13px;border-radius:12px;padding:12px 16px;margin-bottom:16px}
#clRoot .est-tblwrap{overflow-x:auto;border:1px solid var(--cl-line);border-radius:12px;margin-top:2px}
#clRoot table.est-tbl{width:100%;border-collapse:collapse;font-size:13px;min-width:660px}
#clRoot table.est-tbl thead th{background:var(--cl-navy);color:#fff;text-align:left;padding:10px 12px;font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
#clRoot table.est-tbl tbody td{padding:8px 12px;border-bottom:1px solid var(--cl-line);vertical-align:middle}
#clRoot table.est-tbl tbody tr:last-child td{border-bottom:none}
#clRoot .est-row-low{background:#fdf3f1}
#clRoot .est-nm{font-weight:600;color:var(--cl-navy)}
#clRoot .est-un{color:var(--cl-mut)}
#clRoot .est-inp{width:100%;padding:6px 8px;border:1.5px solid var(--cl-line);border-radius:8px;background:#FCFBF8;font-size:13px;text-align:center}
#clRoot .est-saldo{font-weight:800;color:var(--cl-navy)}
#clRoot .est-saldo.low{color:#b8402f;border-color:#f0c9c1;background:#fff4f2}
#clRoot .est-acts{display:flex;gap:6px;white-space:nowrap}
#clRoot .est-ent,#clRoot .est-sai{border:1.5px solid;border-radius:8px;padding:6px 10px;font-size:11.5px;font-weight:700;cursor:pointer;background:#fff}
#clRoot .est-ent{border-color:#bfe3ce;color:#2f7d5b}
#clRoot .est-ent:hover{background:#e7f3ec}
#clRoot .est-sai{border-color:#f0c9c1;color:#b8402f}
#clRoot .est-sai:hover{background:#fbece9}
#clRoot table.est-ext{width:100%;border-collapse:collapse;font-size:12.5px;min-width:560px}
#clRoot table.est-ext thead th{text-align:left;padding:8px 10px;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--cl-mut);border-bottom:2px solid var(--cl-line)}
#clRoot table.est-ext tbody td{padding:7px 10px;border-bottom:1px solid var(--cl-line)}
#clRoot .est-badge{font-weight:700;font-size:10.5px;padding:2px 9px;border-radius:999px}
#clRoot .est-badge.ent{background:#e7f3ec;color:#2f7d5b}
#clRoot .est-badge.sai{background:#fbece9;color:#b8402f}
#clRoot .est-undo{border:none;background:none;color:var(--cl-mut);cursor:pointer;font-size:15px}`;
  var st=document.createElement("style"); st.id="clCSS"; st.textContent=css; document.head.appendChild(st);
}

/* ---------- grade de condomínios ---------- */
async function renderChecklists(){
  _clCSS();
  if(_clState.cond) return _clRenderLista();
  if(_clState.pai) return _clRenderSubs(_clState.pai);
  var view=document.getElementById("view");
  view.innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  var u=(typeof state!=="undefined"&&state.user)||{}, uid=(typeof state!=="undefined"&&state.userId)||"", vis=null;
  try{ if(u.tipo==="master"||["bianca","camilla","julia"].indexOf(uid)>-1) vis=null;
       else if(u.tipo==="sindico") vis=await condominiosDoSindico(uid);
       else if(u.tipo==="gestor") vis=condsDoGestor(); }catch(e){ vis=null; }
  var SUB=(typeof SUBCONDOMINIOS==="object"&&SUBCONDOMINIOS)?SUBCONDOMINIOS:{}, pais=Object.keys(SUB);
  // build 123: subcondomínios entram como UM card de grupo (Le Monde / Trio)
  var todos=[]; (typeof CONDOMINIOS!=="undefined"?CONDOMINIOS:[]).slice().filter(function(c){ return !condominioPaiDe(c); }).concat(pais).forEach(function(c){ if(todos.indexOf(c)<0) todos.push(c); });
  todos.sort(function(a,b){ return a.localeCompare(b,"pt-BR"); });
  if(vis!==null) todos=todos.filter(function(c){ return condVisivel(vis,c); });
  var cards=[];
  for(var k=0;k<todos.length;k++){
    if(SUB[todos[k]]){
      var subsV=subsCompletos(todos[k]).filter(function(s){ return condVisivel(vis,s); }), nT=0, rT=0;
      for(var j=0;j<subsV.length;j++){ var a2=await loadCLs(subsV[j]); nT+=(a2||[]).length; rT+=(a2||[]).reduce(function(a,c){ return a+((c.registros||[]).length); },0); }
      cards.push({cond:todos[k], n:nT, reg:rT, grupo:true, subs:subsV.length});
      continue;
    }
    var arr=await loadCLs(todos[k]);
    var nReg=(arr||[]).reduce(function(a,c){ return a+((c.registros||[]).length); },0);
    cards.push({cond:todos[k], n:(arr||[]).length, reg:nReg});
  }
  var html='<div id="clRoot"><div class="weeknav"><div><h2>'+icoH("checklist")+' Check List</h2><div class="range">Termos e conferências de cada condomínio — salão, churrasqueira, estoque e patrimônio</div></div><div class="spacer"></div></div><div class="clc-grid">';
  cards.forEach(function(o){
    if(o.grupo){
      html+='<div class="clc-card" onclick="_clAbrirGrupo(\''+_clJs(o.cond)+'\')">'
        +'<div class="clc-mono">'+((typeof _procIniciais==="function")?_procIniciais(o.cond):_clEsc((o.cond||"?").charAt(0).toUpperCase()))+'</div>'
        +'<div class="clc-body"><div class="clc-nm">'+_clEsc(o.cond)+'</div>'
        +'<div class="clc-count">Grupo · '+o.subs+' subcondomínio'+(o.subs===1?"":"s")+(o.n?(" · <b>"+o.n+"</b> checklist"+(o.n>1?"s":"")):"")+(o.reg?(" · "+o.reg+" conferência"+(o.reg>1?"s":"")):"")+'</div></div>'
        +'<span class="clc-badge '+(o.n?"clc-ok":"clc-novo")+'">Abrir</span></div>';
      return;
    }
    html+='<div class="clc-card" onclick="abrirChecklists(\''+_clJs(o.cond)+'\')">'
      +'<div class="clc-mono">'+((typeof _procIniciais==="function")?_procIniciais(o.cond):_clEsc((o.cond||"?").charAt(0).toUpperCase()))+'</div>'
      +'<div class="clc-body"><div class="clc-nm">'+_clEsc(o.cond)+'</div>'
      +'<div class="clc-count">'+(o.n?("<b>"+o.n+"</b> checklist"+(o.n>1?"s":"")):"Nenhum checklist")+(o.reg?(" · "+o.reg+" conferência"+(o.reg>1?"s":"")):"")+'</div></div>'
      +'<span class="clc-badge '+(o.n?"clc-ok":"clc-novo")+'">'+(o.n?"Configurado":"Configurar")+'</span></div>';
  });
  html+='</div></div>'; view.innerHTML=html;
}
function abrirChecklists(cond){
  _clState.cond=cond;
  loadCLs(cond).then(function(arr){ _clState.lista=arr||[]; _clRenderLista(); try{window.scrollTo(0,0);}catch(e){} });
}
function voltarChecklists(){ _clState.cond=null; _clState.lista=null; _clState.edit=null; _clState.reg=null; renderChecklists(); }
/* ---------- tela de subcondomínios (build 123) ---------- */
function _clAbrirGrupo(pai){ _clState.pai=pai; _clState.cond=null; _clState.lista=null; _clState.edit=null; _clState.reg=null; _clRenderSubs(pai); try{window.scrollTo(0,0);}catch(e){} }
function _clVoltarGrupo(){ _clState.pai=null; _clState.cond=null; _clState.lista=null; _clState.edit=null; _clState.reg=null; renderChecklists(); }
async function _clRenderSubs(pai){
  _clCSS();
  var view=document.getElementById("view");
  view.innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';
  var u=(typeof state!=="undefined"&&state.user)||{}, uid=(typeof state!=="undefined"&&state.userId)||"", vis=null;
  try{ if(u.tipo==="master"||["bianca","camilla","julia"].indexOf(uid)>-1) vis=null;
       else if(u.tipo==="sindico") vis=await condominiosDoSindico(uid);
       else if(u.tipo==="gestor") vis=condsDoGestor(); }catch(e){ vis=null; }
  var subs=subsCompletos(pai).filter(function(s){ return condVisivel(vis,s); });
  var html='<div id="clRoot"><div class="weeknav"><button class="nav-btn" onclick="_clVoltarGrupo()" title="Voltar">‹</button><div><h2>'+icoH("checklist")+' '+_clEsc(pai)+'</h2><div class="range">Subcondomínios · cada um tem seus próprios checklists</div></div><div class="spacer"></div></div><div class="clc-grid">';
  for(var k=0;k<subs.length;k++){
    var c=subs[k], arr=await loadCLs(c), n=(arr||[]).length, reg=(arr||[]).reduce(function(a,x){ return a+((x.registros||[]).length); },0);
    html+='<div class="clc-card" onclick="abrirChecklists(\''+_clJs(c)+'\')">'
      +'<div class="clc-mono">'+((typeof _procIniciais==="function")?_procIniciais(subRotulo(c)):_clEsc(subRotulo(c).charAt(0).toUpperCase()))+'</div>'
      +'<div class="clc-body"><div class="clc-nm">'+_clEsc(subRotulo(c))+'</div>'
      +'<div class="clc-count">'+(n?("<b>"+n+"</b> checklist"+(n>1?"s":"")):"Nenhum checklist")+(reg?(" · "+reg+" conferência"+(reg>1?"s":"")):"")+'</div></div>'
      +'<span class="clc-badge '+(n?"clc-ok":"clc-novo")+'">'+(n?"Configurado":"Configurar")+'</span></div>';
  }
  if(!subs.length) html+='<div style="padding:30px;color:#9aa">Nenhum subcondomínio visível para o seu perfil.</div>';
  html+='</div></div>'; view.innerHTML=html;
}

/* ---------- tela do condomínio: checklists + histórico ---------- */
function _clRenderLista(){
  _clCSS();
  var arr=_clState.lista||[];
  var K={termo:["Termo de área comum","#f7efdd","#8a6d1f"],estoque:["Estoque","#e8eefc","#2b4d8f"],patrimonio:["Patrimônio","#e7f3ec","#2f7d5b"]};
  var back='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M15 6l-6 6 6 6"/></svg>';
  var novos=[["salao","Salão de festas"],["pizza","Churrasqueira / Forno de pizza"],["sport","Churrasqueira / Sport Bar"],["limpeza","Estoque de material de limpeza"],["patrim","Inventário de patrimônio"],["termo","Termo de área comum (em branco)"],["livre","Checklist em branco"]];

  var cards=arr.map(function(cl){
    var f=cl.formato||"estoque", k=K[f]||K.estoque;
    var nI=(cl.itens||[]).filter(function(i){return i&&i.nome;}).length;
    var regs=cl.registros||[], nR=regs.length;
    var ultima=nR?regs.slice().sort(function(a,b){return (b.criadoEm||0)-(a.criadoEm||0);})[0]:null;
    return '<div class="cl-card"><div class="cl-strip cl-k-'+f+'"></div>'
      +'<div class="cl-card-h"><div class="cl-ic cl-i-'+f+'">'+ico("checklist")+'</div>'
        +'<div style="flex:1;min-width:0"><div class="cl-nm">'+_clEsc(cl.nome)+'</div>'
        +'<span class="cl-kind" style="background:'+k[1]+';color:'+k[2]+'">'+_clEsc(k[0])+'</span>'
        +'<div class="cl-meta"><span><b>'+nI+'</b> itens</span><span><b>'+nR+'</b> conferência'+(nR===1?"":"s")+'</span>'
        +(ultima?('<span>última: '+_clEsc(_clDataBR(ultima.dataEvento))+'</span>'):"")+'</div></div></div>'
      +'<div class="cl-card-f">'
        +(f==="estoque"?('<button class="cl-cta" onclick="abrirEstoque(\''+_clJs(cl.id)+'\')">'+ico("checklist")+' Gerenciar estoque</button>'):('<button class="cl-cta" onclick="novaConferencia(\''+_clJs(cl.id)+'\')">'+ico("checklist")+' Fazer conferência</button>'))
        +'<button class="cl-mini" title="Editar itens" onclick="abrirEditorCL(\''+_clJs(cl.id)+'\')">⚙</button>'
        +'<button class="cl-mini" title="Imprimir folha em branco" onclick="imprimirCL(\''+_clJs(cl.id)+'\')">🖨</button>'
        +'<button class="cl-mini dg" title="Excluir checklist" onclick="excluirCL(\''+_clJs(cl.id)+'\')">🗑</button>'
      +'</div></div>';
  }).join("");

  var modelos = _clState.showModelos
    ? ('<div class="cl-modelos"><div class="cl-modelos-h"><div style="flex:1;font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--cl-mut)">Escolha o modelo do checklist</div>'
       +'<button style="border:none;background:none;color:var(--cl-mut);cursor:pointer;font-size:12px" onclick="_clToggleModelos()">✕ cancelar</button></div>'
       +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
       + novos.map(function(t){ return '<button class="cl-btn" onclick="novoCL(\''+t[0]+'\')">＋ '+_clEsc(t[1])+'</button>'; }).join("")
       +'</div><div style="font-size:11.5px;color:var(--cl-mut);margin-top:10px">Os modelos já vêm com os itens e quantidades. Depois é só ajustar.</div></div>')
    : '<button class="cl-new" onclick="_clToggleModelos()">＋ Criar checklist</button>';

  var regs=[];
  arr.forEach(function(cl){ (cl.registros||[]).forEach(function(r){ regs.push({cl:cl,r:r}); }); });
  regs.sort(function(a,b){ return (b.r.criadoEm||0)-(a.r.criadoEm||0); });
  var hist=regs.length?('<div class="cl-tblwrap"><table class="cl-hist"><thead><tr><th style="width:100px">Data</th><th>Checklist</th><th style="width:90px">Unidade</th><th>Condômino / responsável</th><th style="width:190px">Situação</th><th style="width:130px"></th></tr></thead><tbody>'
    +regs.map(function(o){
      var st=_clStatusLbl(o.r);
      var nc=_clNaoConf(o.r,"entrega")+_clNaoConf(o.r,"devolucao");
      return '<tr><td>'+_clEsc(_clDataBR(o.r.dataEvento||o.r.entrega.data))+'</td>'
        +'<td>'+_clEsc(o.cl.nome)+'</td>'
        +'<td><span class="cl-un">'+(_clEsc(o.r.unidade)||"—")+'</span></td>'
        +'<td>'+(_clEsc(o.r.condomino)||"—")+'</td>'
        +'<td><span class="cl-badge" style="background:'+st[2]+';color:'+st[1]+'">'+st[0]+'</span>'+(nc?('<span class="cl-alert">'+nc+' não conforme</span>'):"")+'</td>'
        +'<td style="text-align:right;white-space:nowrap"><button class="cl-mini" title="Abrir" onclick="abrirConferencia(\''+_clJs(o.cl.id)+'\',\''+_clJs(o.r.id)+'\')">✎</button> '
        +'<button class="cl-mini" title="Imprimir preenchido" onclick="imprimirConferencia(\''+_clJs(o.cl.id)+'\',\''+_clJs(o.r.id)+'\')">🖨</button></td></tr>';
    }).join("")+'</tbody></table></div>')
    :'<div class="cl-empty">Nenhuma conferência ainda.<br>Clique em <b>Fazer conferência</b> em um checklist acima para registrar a entrega de uma área ou a contagem do estoque.</div>';

  document.getElementById("view").innerHTML='<div id="clRoot">'
    +'<div class="cl-head"><div style="flex:1;min-width:220px"><h2>'+ico("checklist")+' Check List · '+_clEsc(_clState.cond)+'</h2>'
      +'<div class="sub">Configure os itens, faça a conferência com o condômino e imprima para assinatura</div></div>'
      +'<button class="cl-btn" onclick="voltarChecklists()">'+back+' Voltar</button></div>'
    +(arr.length?('<div class="cl-grid">'+cards+'</div>'):'<div class="cl-empty">Nenhum checklist ainda.<br>Crie o primeiro a partir de um modelo — <b>salão de festas, churrasqueira, estoque de limpeza ou patrimônio</b>.</div>')
    + modelos
    +'<div class="cl-sec"><div class="cl-sec-t">'+ico("checklist")+' Histórico de conferências</div>'+hist+'</div>'
  +'</div>';
}
function _clToggleModelos(){ _clState.showModelos=!_clState.showModelos; _clRenderLista(); }
async function novoCL(kind){
  _clState.showModelos=false;
  var cl=_clMigraCL(_clModelo(kind,_clState.cond)); cl.registros=[];
  _clState.lista=_clState.lista||[]; _clState.lista.push(cl);
  await saveCLs(_clState.cond,_clState.lista);
  _clRenderLista(); abrirEditorCL(cl.id);
}
async function excluirCL(id){
  var cl=(_clState.lista||[]).filter(function(x){return x.id===id;})[0];
  if(!cl||!confirm("Excluir \""+cl.nome+"\" e todo o seu histórico?")) return;
  _clState.lista=_clState.lista.filter(function(x){return x.id!==id;});
  await saveCLs(_clState.cond,_clState.lista); _clRenderLista();
}

/* ---------- CONFERÊNCIA: o gestor preenche item a item ---------- */
var _CL_INP='width:100%;padding:9px 11px;border:1.5px solid var(--line);border-radius:9px;background:#FCFBF8;font-size:14px';
var _CL_LBL='display:block;font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--muted);margin-bottom:5px';
function _clIn(obj,key,ph){ var i=_clBIND.push({obj:obj,key:key})-1; return '<input data-cb="'+i+'" value="'+_clEsc(obj[key]||"")+'" placeholder="'+_clEsc(ph||"")+'" style="'+_CL_INP+'">'; }
function _clDate(obj,key){ var i=_clBIND.push({obj:obj,key:key})-1; return '<input type="date" data-cb="'+i+'" value="'+_clEsc(obj[key]||"")+'" style="'+_CL_INP+'">'; }
function _clTA(obj,key,ph,rows){ var i=_clBIND.push({obj:obj,key:key})-1; var id="clta_"+i;
  return '<textarea id="'+id+'" data-cb="'+i+'" rows="'+(rows||3)+'" placeholder="'+_clEsc(ph||"")+'" style="'+_CL_INP+'">'+_clEsc(obj[key]||"")+'</textarea>'+(typeof _ortoBtn==="function"?_ortoBtn(id):""); }
function _clField(l,c){ return '<div class="field"><label style="'+_CL_LBL+'">'+_clEsc(l)+'</label>'+c+'</div>'; }
var _CL_UNIDADES=["un","cx","pacote","fardo","saco","rolo","par","kit","dz","L","ml","kg","g","m","m²"];
function _clSelUn(obj,key,estilo){
  var i=_clBIND.push({obj:obj,key:key})-1;
  var v=String(obj[key]||"");
  var opts='<option value=""'+(v?"":" selected")+'>—</option>'+_CL_UNIDADES.map(function(u){ return '<option value="'+u+'"'+(v===u?" selected":"")+'>'+u+'</option>'; }).join("");
  if(v && _CL_UNIDADES.indexOf(v)<0) opts+='<option value="'+_clEsc(v)+'" selected>'+_clEsc(v)+'</option>';
  return '<select data-cb="'+i+'" style="'+(estilo||_CL_INP)+'">'+opts+'</select>';
}
function _clChk(obj,key,label){ var i=_clBIND.push({obj:obj,key:key,bool:true})-1;
  return '<label style="display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;color:#17253f;cursor:pointer;padding:7px 0"><input type="checkbox" data-cb="'+i+'" '+(obj[key]?"checked":"")+' style="width:17px;height:17px;cursor:pointer">'+_clEsc(label)+'</label>'; }

function novaConferencia(clId){
  var cl=(_clState.lista||[]).filter(function(x){return x.id===clId;})[0]; if(!cl) return;
  if(!Array.isArray(cl.registros)) cl.registros=[];
  var r=_clNovoRegistro(cl); cl.registros.push(r);
  _clState.regCl=cl; _clState.reg=r; _clState.fase="entrega"; _clState.dirty=true;
  _clRenderConf();
}
function abrirConferencia(clId,regId){
  var cl=(_clState.lista||[]).filter(function(x){return x.id===clId;})[0]; if(!cl) return;
  var r=(cl.registros||[]).filter(function(x){return x.id===regId;})[0]; if(!r) return;
  _clState.regCl=cl; _clState.reg=r; _clState.fase=(Object.keys(r.entrega.itens||{}).length && !Object.keys(r.devolucao.itens||{}).length)?"entrega":"entrega";
  _clState.dirty=false; _clRenderConf();
}
function _clSetSt(itemId,st){
  var r=_clState.reg, f=_clState.fase||"entrega"; if(!r) return;
  if(!r[f].itens) r[f].itens={};
  var cur=r[f].itens[itemId]||{};
  cur.st=(cur.st===st)?"":st;
  r[f].itens[itemId]=cur; _clState.dirty=true; _clRenderConf();
}
function _clConfItem(acao,itemId){
  var cl=_clState.regCl; if(!cl) return;
  if(acao==="add"){ cl.itens.push({id:"i"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),nome:"",qtd:"",unidade:"",local:"",patr:"",obs:""}); _clState.goBottom=true; }
  else if(acao==="rm"){
    var it=cl.itens.filter(function(x){return x.id===itemId;})[0];
    if(!it || !confirm("Remover o item \""+(it.nome||"sem nome")+"\" do checklist?")) return;
    cl.itens=cl.itens.filter(function(x){return x.id!==itemId;});
    (cl.registros||[]).forEach(function(r){ ["entrega","devolucao"].forEach(function(f){ if(r[f]&&r[f].itens) delete r[f].itens[itemId]; }); });
  }
  _clState.dirty=true; _clRenderConf();
}
function _clFase(f){ _clState.fase=f; _clRenderConf(); }
function _clRenderConf(){
  var cl=_clState.regCl, r=_clState.reg; if(!cl||!r) return;
  var prev=document.querySelector("#modalMount .modal-body"); var keep=prev?prev.scrollTop:0;
  _clBIND=[];
  var termo=(cl.formato==="termo");
  var fase=_clState.fase||"entrega";
  var F=r[fase]; if(!F.itens) F.itens={};
  var itens=(cl.itens||[]).filter(function(it){return it&&it.nome;});
  var nOk=0,nNao=0; Object.keys(F.itens).forEach(function(k){ if(F.itens[k]&&F.itens[k].st==="conforme") nOk++; else if(F.itens[k]&&F.itens[k].st==="nao") nNao++; });

  var abas=termo?('<div style="display:flex;gap:6px;margin-bottom:12px">'
    +['entrega','devolucao'].map(function(f){
      var on=(fase===f); var lbl=(f==="entrega")?"1 · Entrega da área":"2 · Devolução da área";
      var n=Object.keys((r[f].itens)||{}).length;
      return '<button type="button" onclick="_clFase(\''+f+'\')" style="flex:1;padding:10px;border:1.5px solid '+(on?"#17253f":"var(--line)")+';border-radius:10px;background:'+(on?"#17253f":"#fff")+';color:'+(on?"#fff":"#6a7688")+';font-weight:700;font-size:12.5px;cursor:pointer">'+lbl+(n?(" ("+n+")"):"")+'</button>';
    }).join("")+'</div>'):"";

  var SI='padding:6px 8px;border:1.5px solid var(--line);border-radius:7px;font-size:12.5px;background:#fff';
  var cab='<div style="display:flex;gap:8px;align-items:center;padding:8px 10px;background:#17253f;color:#fff;font-size:9.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase">'
    +'<div style="flex:1;min-width:130px">Item</div>'
    +(cl.formato==="estoque"?'<div style="width:76px;text-align:center">Unidade</div>':"")
    +'<div style="width:74px;text-align:center">Qtd. cadastrada</div>'
    +'<div style="width:66px;text-align:center">Conferida</div>'
    +'<div style="width:186px;text-align:center">Situação</div>'
    +'<div style="flex:1;min-width:110px">Observação / avaria</div>'
    +'<div style="width:26px"></div></div>';
  var linhas=itens.map(function(it){
    var cur=F.itens[it.id]||{};
    var bt=function(v,lbl,cor,bg){ var on=(cur.st===v);
      return '<button type="button" onclick="_clSetSt(\''+_clJs(it.id)+'\',\''+v+'\')" style="flex:1;padding:6px 8px;font-size:10.5px;font-weight:700;border:1.5px solid '+(on?cor:"var(--line)")+';border-radius:8px;background:'+(on?bg:"#fff")+';color:'+(on?cor:"#8a94a3")+';cursor:pointer;white-space:nowrap">'+lbl+'</button>'; };
    var ni=_clBIND.push({obj:it,key:"nome"})-1;                         // nome (cadastro)
    var ci=_clBIND.push({obj:it,key:"qtd"})-1;                          // qtd cadastrada (cadastro)
    var qi=_clBIND.push({obj:cur,key:"qtd",into:{o:F.itens,k:it.id}})-1; // qtd conferida (registro)
    var oi=_clBIND.push({obj:cur,key:"obs",into:{o:F.itens,k:it.id}})-1; // observação (registro)
    return '<div style="display:flex;gap:8px;align-items:center;padding:7px 10px;border-bottom:1px solid var(--line);'+(cur.st==="nao"?"background:#fdf3f1":"")+'">'
      +'<input data-cb="'+ni+'" value="'+_clEsc(it.nome||"")+'" placeholder="nome do item" style="flex:1;min-width:130px;'+SI+';font-weight:600;color:#17253f">'
      +(cl.formato==="estoque"?('<div style="width:76px">'+_clSelUn(it,"unidade",'width:100%;padding:6px 4px;border:1.5px solid var(--line);border-radius:7px;font-size:12px;background:#fff;text-align:center')+'</div>'):"")
      +'<input data-cb="'+ci+'" value="'+_clEsc(it.qtd||"")+'" placeholder="qtd" title="Quantidade cadastrada — edite se precisar" style="width:74px;text-align:center;font-weight:700;color:#b8402f;'+SI+'">'
      +'<input data-cb="'+qi+'" value="'+_clEsc(cur.qtd||"")+'" placeholder="—" title="Quantidade conferida agora" style="width:66px;text-align:center;'+SI+'">'
      +'<div style="display:flex;gap:5px;width:186px">'+bt("conforme","Conforme","#2f6d4f","#e7f3ec")+bt("nao","Não conforme","#b8402f","#fbece9")+'</div>'
      +'<input data-cb="'+oi+'" value="'+_clEsc(cur.obs||"")+'" placeholder="observação / avaria" style="flex:1;min-width:110px;'+SI+'">'
      +'<button type="button" onclick="_clConfItem(\'rm\',\''+_clJs(it.id)+'\')" title="Apagar item" style="width:26px;border:none;background:none;color:#b8402f;cursor:pointer;font-size:14px">🗑</button>'
    +'</div>';
  }).join("");
  var addItem='<div style="padding:9px 10px"><button type="button" class="btn-ghost" onclick="_clConfItem(\'add\')">＋ Acrescentar item</button></div>';

  var ass=termo
    ? '<div style="display:flex;gap:16px;flex-wrap:wrap">'+_clChk(F.ass,"cond","Condômino assinou")+_clChk(F.ass,"zel","Zelador assinou")+_clChk(F.ass,"mafra","Síndico / Mafra assinou")+'</div>'
    : '<div style="display:flex;gap:16px;flex-wrap:wrap">'+_clChk(F.ass,"zel","Zelador assinou")+_clChk(F.ass,"mafra","Síndico / Mafra assinou")+'</div>';

  document.getElementById("modalMount").innerHTML='<div class="overlay"><div class="modal" style="max-width:1180px;width:96vw;height:95vh;max-height:95vh;display:flex;flex-direction:column;overflow:hidden">'
    +'<div class="modal-head" style="flex:none"><h3>'+ico("checklist")+' Conferência · '+_clEsc(cl.nome)+'</h3><button class="x" onclick="fecharConferencia()">×</button></div>'
    +'<div class="modal-body" style="flex:1;overflow:auto;min-height:0">'
      +'<div class="rel-sec-h">👤 Dados da conferência</div>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
        +(termo?('<div class="field" style="width:120px"><label style="'+_CL_LBL+'">Unidade</label>'+_clIn(r,"unidade","ex.: 302")+'</div>'
          +'<div class="field" style="flex:1;min-width:180px"><label style="'+_CL_LBL+'">Nome do condômino</label>'+_clIn(r,"condomino","nome completo")+'</div>'
          +'<div class="field" style="width:150px"><label style="'+_CL_LBL+'">Telefone</label>'+_clIn(r,"telefone","(16) 9...")+'</div>'
          +'<div class="field" style="width:160px"><label style="'+_CL_LBL+'">Data do evento</label>'+_clDate(r,"dataEvento")+'</div>')
         :('<div class="field" style="flex:1;min-width:180px"><label style="'+_CL_LBL+'">Responsável pela conferência</label>'+_clIn(r,"condomino","nome")+'</div>'
          +'<div class="field" style="width:160px"><label style="'+_CL_LBL+'">Data</label>'+_clDate(r,"dataEvento")+'</div>'))
      +'</div>'
      +abas
      +'<div class="rel-sec-h" style="display:flex;align-items:center;gap:10px">✅ Conferência dos itens'
        +'<span style="flex:1"></span>'
        +'<span style="font-size:11px;font-weight:700;color:#2f6d4f">'+nOk+' conforme</span>'
        +'<span style="font-size:11px;font-weight:700;color:#b8402f">'+nNao+' não conforme</span></div>'
      +'<div style="border:1.5px solid var(--line);border-radius:12px;overflow:hidden;background:#fff">'+cab+(linhas||'<div style="padding:20px;text-align:center;color:#8a94a3">Nenhum item ainda.</div>')+addItem+'</div>'
      +'<div class="rel-sec-h">✍️ Assinaturas ('+(fase==="entrega"?"entrega":"devolução")+')</div>'
      +'<div style="border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;background:#fff">'+ass
        +'<div style="margin-top:8px;max-width:220px">'+_clField("Data da assinatura",_clDate(F,"data"))+'</div></div>'
      +'<div class="rel-sec-h">📝 Observações gerais</div>'+_clTA(r,"obs","observações da conferência",3)
    +'</div>'
    +'<div class="modal-foot" style="flex:none;margin:0;padding:12px 16px;border-top:1.5px solid var(--line);background:#fff">'
      +'<button class="btn-cancel" onclick="fecharConferencia()">Fechar</button>'
      +'<button class="btn-ghost" onclick="imprimirConferencia(\''+_clJs(cl.id)+'\',\''+_clJs(r.id)+'\')">🖨️ Imprimir preenchido</button>'
      +'<button class="btn-primary" style="flex:1" onclick="salvarConferencia()">💾 Salvar conferência</button></div>'
    +'</div></div>';
  var body=document.querySelector("#modalMount .modal-body");
  if(body){ if(_clState.goBottom){ _clState.goBottom=false; body.scrollTop=body.scrollHeight; } else body.scrollTop=keep; }
  document.getElementById("modalMount").querySelectorAll("[data-cb]").forEach(function(n){
    var f=function(){ var b=_clBIND[+n.getAttribute("data-cb")];
      var val=b.bool?n.checked:n.value;
      b.obj[b.key]=val;
      if(b.into) b.into.o[b.into.k]=b.obj;   // grava o item de volta no registro
      _clState.dirty=true; };
    n.addEventListener("input",f); n.addEventListener("change",f);
  });
}
async function salvarConferencia(){
  var cl=_clState.regCl, r=_clState.reg; if(!cl||!r) return;
  r.atualizadoEm=Date.now();
  await saveCLs(_clState.cond,_clState.lista);
  _clState.dirty=false; document.getElementById("modalMount").innerHTML=""; _clRenderLista();
}
function fecharConferencia(){
  if(_clState.dirty && !confirm("Fechar sem salvar? As alterações serão perdidas.")) return;
  document.getElementById("modalMount").innerHTML="";
  loadCLs(_clState.cond).then(function(a){ _clState.lista=a||[]; _clState.dirty=false; _clRenderLista(); });
}

/* ---------- impressão da CONFERÊNCIA preenchida ---------- */
function imprimirConferencia(clId,regId){
  var w=window.open("","_blank");
  var cl=(_clState.lista||[]).filter(function(x){return x.id===clId;})[0] || _clState.regCl;
  if(!w||!cl) return;
  var r=(cl.registros||[]).filter(function(x){return x.id===regId;})[0] || _clState.reg;
  if(!r) return;
  var termo=(cl.formato==="termo");
  var itens=(cl.itens||[]).filter(function(it){return it&&it.nome;});
  var cel=function(f,j){ var c=(r[f]&&r[f].itens&&r[f].itens[j])||{};   // j = id do item
    var st=c.st==="conforme"?'<span class="ok">Conforme</span>':(c.st==="nao"?'<span class="no">Não conforme</span>':'<span class="vz">—</span>');
    return '<td class="q">'+_clEsc(c.qtd||"")+'</td><td class="st">'+st+'</td><td class="ob">'+_clEsc(c.obs||"")+'</td>'; };
  var head = termo
    ? '<tr><th rowspan="2" class="n">#</th><th rowspan="2">Item</th><th rowspan="2" class="q">Qtde</th><th colspan="3" class="fase">ENTREGA</th><th colspan="3" class="fase">DEVOLUÇÃO</th></tr>'
      +'<tr><th class="q">Qtd</th><th class="st">Situação</th><th class="ob">Observação</th><th class="q">Qtd</th><th class="st">Situação</th><th class="ob">Observação</th></tr>'
    : (cl.formato==="estoque"
        ? '<tr><th class="n">#</th><th>Item</th><th class="q">Un.</th><th class="q">Qtde</th><th class="q">Contado</th><th class="st">Situação</th><th class="ob">Observação</th></tr>'
        : '<tr><th class="n">#</th><th>Item</th><th class="q">Qtde</th><th class="q">Contado</th><th class="st">Situação</th><th class="ob">Observação</th></tr>');
  var body = itens.map(function(it,j){
    var base='<tr><td class="n">'+(j+1)+'</td><td>'+_clEsc(it.nome)+'</td>'
      + (cl.formato==="estoque" ? ('<td class="q">'+_clEsc(it.unidade||"")+'</td>') : "")
      + '<td class="q">'+_clEsc(it.qtd||"")+'</td>';
    return base + (termo ? (cel("entrega",it.id)+cel("devolucao",it.id)) : cel("entrega",it.id)) + '</tr>';
  }).join("");
  var assBloco=function(fase,titulo,quem){
    var F=r[fase]||{ass:{}};
    var linha=function(k,lbl){ var ok=F.ass&&F.ass[k];
      return '<div class="assln"><div class="asssig">'+(ok?"✔ assinado":"_____________________________")+'</div><div class="asslbl">'+lbl+'</div></div>'; };
    return '<div class="assbox"><div class="asstit">'+titulo+'</div>'
      + quem.map(function(q){ return linha(q[0],q[1]); }).join("")
      + '<div class="assdata">Data: '+_clEsc(_clDataBR(F.data))+'</div></div>';
  };
  var assinaturas = termo
    ? '<div class="asswrap">'+assBloco("entrega","RECEBIMENTO DA ÁREA",[["cond","Ass. Requisitante (condômino)"],["zel","Ass. Zelador"],["mafra","Ass. Mafra Gestão Integrada"]])
      + assBloco("devolucao","DEVOLUÇÃO DA ÁREA",[["cond","Ass. Requisitante (condômino)"],["zel","Ass. Zelador"],["mafra","Ass. Mafra Gestão Integrada"]])+'</div>'
    : '<div class="asswrap">'+assBloco("entrega","CONFERÊNCIA",[["zel","Ass. Zelador"],["mafra","Ass. Síndico / Mafra Gestão Integrada"]])+'</div>';
  var ident = termo
    ? '<div class="ident"><div class="fi"><b>Condomínio:</b> '+_clEsc(_clState.cond||"")+'</div><div class="fi"><b>Unidade:</b> '+(_clEsc(r.unidade)||"______")+'</div><div class="fi"><b>Condômino:</b> '+(_clEsc(r.condomino)||"______________")+'</div><div class="fi"><b>Telefone:</b> '+(_clEsc(r.telefone)||"__________")+'</div><div class="fi"><b>Data do evento:</b> '+_clEsc(_clDataBR(r.dataEvento))+'</div></div>'
    : '<div class="ident"><div class="fi"><b>Condomínio:</b> '+_clEsc(_clState.cond||"")+'</div><div class="fi"><b>Local:</b> '+_clEsc(cl.local||"")+'</div><div class="fi"><b>Responsável:</b> '+(_clEsc(r.condomino)||"____________")+'</div><div class="fi"><b>Data:</b> '+_clEsc(_clDataBR(r.dataEvento))+'</div></div>';
  var obs=r.obs?'<div class="decl"><b>Observações:</b> '+_clEsc(r.obs).replace(/\n/g,"<br>")+'</div>':"";
  var decl=termo?'<div class="decl">'+_clEsc(cl.declaracao||_CL_DECL)+'</div>':"";
  var html='<!doctype html><html><head><meta charset="utf-8"><title>Conferência · '+_clEsc(cl.nome)+'</title><style>'
   +'@page{size:A4 landscape;margin:9mm}*{box-sizing:border-box}'
   +'body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#111;font-size:9.5px}'
   +'.topo{display:flex;border:1.5px solid #1a2a4a;margin-bottom:7px}'
   +'.logo{width:130px;border-right:1.5px solid #1a2a4a;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;letter-spacing:2px;color:#1a2a4a}'
   +'.tituloc{flex:1;text-align:center}.tituloc .l1{background:#1a2a4a;color:#fff;font-weight:700;font-size:11px;padding:4px}'
   +'.tituloc .l2{font-weight:700;font-size:9px;padding:2px;border-bottom:1px solid #1a2a4a}'
   +'.tituloc .l3{background:#1a2a4a;color:#fff;font-weight:700;font-size:11px;padding:4px}'
   +'.meta{width:140px;border-left:1.5px solid #1a2a4a;font-size:7.5px}'
   +'.meta div{display:flex;border-bottom:1px solid #1a2a4a}.meta div:last-child{border-bottom:none}'
   +'.meta span{flex:1;padding:2px 3px;border-right:1px solid #1a2a4a}.meta span:last-child{border-right:none;text-align:center;font-weight:700}'
   +'.ident{border:1.5px solid #1a2a4a;padding:5px 7px;display:flex;flex-wrap:wrap;gap:3px 18px;font-size:9.5px;margin-bottom:7px}'
   +'.ident .fi{flex:1;min-width:130px}'
   +'.secth{background:#1a2a4a;color:#fff;text-align:center;font-weight:700;font-size:10px;padding:3px}'
   +'table{width:100%;border-collapse:collapse}'
   +'th{background:#1a2a4a;color:#fff;border:1px solid #1a2a4a;padding:3px;font-size:8px;text-align:center}'
   +'th.fase{background:#2c3f66;letter-spacing:.5px}'
   +'td{border:1px solid #6d7d99;padding:3px 5px;font-size:9px;height:15px}'
   +'td.n{width:18px;text-align:center;font-weight:700}td.q{width:42px;text-align:center;font-weight:700}'
   +'td.st{width:70px;text-align:center}td.ob{width:110px}'
   +'.ok{color:#2f6d4f;font-weight:700}.no{color:#b8402f;font-weight:700}.vz{color:#999}'
   +'.decl{border:1px solid #1a2a4a;padding:5px 7px;font-size:8.5px;line-height:1.4;margin-top:6px}'
   +'.asswrap{display:flex;gap:14px;margin-top:8px}'
   +'.assbox{flex:1;border:1px solid #1a2a4a;padding:6px;text-align:center}'
   +'.asstit{font-weight:700;font-size:9px;margin-bottom:8px}'
   +'.assln{margin-bottom:9px}.asssig{font-size:9.5px;color:#2f6d4f;font-weight:700;min-height:12px}'
   +'.asslbl{font-size:8px;color:#555}.assdata{font-size:8.5px;margin-top:3px}'
   +'thead{display:table-header-group}tr{page-break-inside:avoid}'
   +'</style></head><body>'
   +'<div class="topo"><div class="logo">MAFRA</div><div class="tituloc"><div class="l1">SISTEMA DE GESTÃO DA QUALIDADE</div><div class="l2">Formulários · Conferência preenchida</div><div class="l3">'+_clEsc(cl.titulo||cl.nome)+'</div></div>'
   +'<div class="meta"><div><span>FORM</span><span>'+_clEsc(cl.form||"22")+'</span></div><div><span>VERSÃO</span><span>'+_clEsc(cl.versao||"0")+'</span></div><div><span>CÓDIGO</span><span>'+_clEsc(cl.codigo||"PO.RPCA.01")+'</span></div></div></div>'
   + ident
   +'<div class="secth">CHECK LIST — CONFERÊNCIA</div>'
   +'<table><thead>'+head+'</thead><tbody>'+body+'</tbody></table>'
   + obs + decl + assinaturas
   +'</body></html>';
  w.document.open(); w.document.write(html); w.document.close();
  setTimeout(function(){ try{ w.focus(); w.print(); }catch(e){} },450);
}

function abrirEditorCL(id){
  var cl=(_clState.lista||[]).filter(function(x){return x.id===id;})[0];
  if(!cl) return;
  _clState.edit=cl; _clState.dirty=false; _clRenderEditor();
}
function _clRenderEditor(){
  var cl=_clState.edit; if(!cl) return;
  var prev=document.querySelector("#modalMount .modal-body");
  var keep=prev?prev.scrollTop:_clState.scroll;
  _clBIND=[];
  var fmt=cl.formato||"estoque";
  var cabItens = fmt==="termo" ? '<div style="display:flex;gap:8px;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--muted);padding:0 4px 4px"><div style="flex:1">Item</div><div style="width:90px">Qtde</div><div style="width:34px"></div></div>'
    : (fmt==="estoque" ? '<div style="display:flex;gap:8px;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--muted);padding:0 4px 4px"><div style="flex:1">Item</div><div style="width:100px">Unidade</div><div style="width:100px">Quantidade</div><div style="width:34px"></div></div>'
    : '<div style="display:flex;gap:8px;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--muted);padding:0 4px 4px"><div style="flex:1">Bem / item</div><div style="width:70px">Qtde</div><div style="width:110px">Local</div><div style="width:90px">Nº patrim.</div><div style="width:34px"></div></div>');
  var linhas=(cl.itens||[]).map(function(it,j){
    var campos = fmt==="termo" ? '<div style="flex:1;min-width:120px">'+_clIn(it,"nome","item (ex.: Mesas)")+'</div><div style="width:90px">'+_clIn(it,"qtd","qtde")+'</div>'
      : (fmt==="estoque" ? '<div style="flex:1;min-width:120px">'+_clIn(it,"nome","item (ex.: Detergente)")+'</div><div style="width:100px">'+_clSelUn(it,"unidade")+'</div><div style="width:100px">'+_clIn(it,"qtd","qtd")+'</div>'
      : '<div style="flex:1;min-width:120px">'+_clIn(it,"nome","bem (ex.: Televisão)")+'</div><div style="width:70px">'+_clIn(it,"qtd","qtd")+'</div><div style="width:110px">'+_clIn(it,"local","local")+'</div><div style="width:90px">'+_clIn(it,"patr","nº")+'</div>');
    return '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;flex-wrap:wrap">'+campos
      +'<button type="button" onclick="_clAcao(\'rm:'+j+'\')" title="Remover item" style="border:none;background:none;color:#b8402f;cursor:pointer;width:26px">🗑</button></div>';
  }).join("");
  var FMT={termo:"Termo de área comum (com estado físico e assinaturas de recebimento/devolução)",estoque:"Estoque (unidade, mínimo e quantidade contada)",patrimonio:"Patrimônio (quantidade, local, nº e estado)"};
  document.getElementById("modalMount").innerHTML='<div class="overlay"><div class="modal" style="max-width:1180px;width:96vw;height:95vh;max-height:95vh;display:flex;flex-direction:column;overflow:hidden">'
    +'<div class="modal-head" style="flex:none"><h3>'+ico("checklist")+' '+_clEsc(cl.nome||"Checklist")+' · '+_clEsc(_clState.cond||"")+'</h3><button class="x" onclick="fecharEditorCL()">×</button></div>'
    +'<div class="modal-body" style="flex:1;overflow:auto;min-height:0">'
      +'<div class="rel-sec-h">📋 Identificação</div>'
      +_clField("Nome do checklist",_clIn(cl,"nome","ex.: Termo de uso do Salão de Festas"))
      +_clField("Título impresso no formulário",_clIn(cl,"titulo","ex.: TERMO PARA USO DO SALÃO DE FESTA"))
      +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
        +'<div class="field" style="flex:1;min-width:150px"><label style="'+_CL_LBL+'">Local / área</label>'+_clIn(cl,"local","ex.: Salão de festas")+'</div>'
        +'<div class="field" style="width:90px"><label style="'+_CL_LBL+'">FORM</label>'+_clIn(cl,"form","22")+'</div>'
        +'<div class="field" style="width:90px"><label style="'+_CL_LBL+'">Versão</label>'+_clIn(cl,"versao","0")+'</div>'
        +'<div class="field" style="width:130px"><label style="'+_CL_LBL+'">Código</label>'+_clIn(cl,"codigo","PO.RPCA.01")+'</div>'
      +'</div>'
      +'<div style="font-size:11.5px;color:var(--muted);margin:-4px 0 10px">Formato: <b>'+_clEsc(FMT[fmt]||"")+'</b></div>'
      +'<div class="rel-sec-h">📄 Responsabilidades e obrigações</div>'
      +_clTA(cl,"regras","texto que sai impresso no formulário",6)
      +(fmt==="termo"?('<div class="rel-sec-h">✍️ Declaração</div>'+_clTA(cl,"declaracao","declaração de responsabilidade",4)):"")
      +'<div class="rel-sec-h">✅ Itens do check list</div>'
      +'<div style="border:1.5px solid var(--line);border-radius:12px;padding:12px;background:#fff">'+cabItens+linhas
        +'<button type="button" class="btn-ghost" onclick="_clAcao(\'add\')" style="margin-top:6px">＋ Item</button></div>'
      +'<div style="font-size:11.5px;color:var(--muted);margin-top:10px">Na folha impressa, as colunas de conferência ficam em branco para preencher à caneta.</div>'
    +'</div>'
    +'<div class="modal-foot" style="flex:none;margin:0;padding:12px 16px;border-top:1.5px solid var(--line);background:#fff">'
      +'<button class="btn-cancel" onclick="fecharEditorCL()">Fechar</button>'
      +'<button class="btn-ghost" onclick="imprimirCL(\''+_clJs(cl.id)+'\')">🖨️ Imprimir</button>'
      +'<button class="btn-primary" style="flex:1" onclick="salvarCL()">💾 Salvar checklist</button></div>'
    +'</div></div>';
  var body=document.querySelector("#modalMount .modal-body");
  if(body){ if(_clState.goBottom){ _clState.goBottom=false; body.scrollTop=body.scrollHeight; } else { body.scrollTop=keep; }
    _clState.scroll=body.scrollTop; body.addEventListener("scroll",function(){ _clState.scroll=body.scrollTop; }); }
  document.getElementById("modalMount").querySelectorAll("[data-cb]").forEach(function(n){
    var f=function(){ var b=_clBIND[+n.getAttribute("data-cb")]; b.obj[b.key]=n.value; _clState.dirty=true; };
    n.addEventListener("input",f); n.addEventListener("change",f);
  });
}
function _clAcao(x){
  var p=String(x).split(":"), cl=_clState.edit; if(!cl) return;
  if(p[0]==="add"){ if(!Array.isArray(cl.itens)) cl.itens=[]; cl.itens.push({nome:"",qtd:"",unidade:"",local:"",patr:"",obs:""}); _clState.goBottom=true; }
  else if(p[0]==="rm"){ cl.itens.splice(+p[1],1); }
  _clState.dirty=true; _clRenderEditor();
}
async function salvarCL(){
  var cl=_clState.edit; if(!cl) return;
  cl.atualizadoEm=Date.now(); cl.atualizadoPor=(typeof state!=="undefined"&&state.userId)||"";
  await saveCLs(_clState.cond,_clState.lista);
  _clState.dirty=false; document.getElementById("modalMount").innerHTML=""; _clRenderLista();
}
function fecharEditorCL(){
  if(_clState.dirty && !confirm("Fechar sem salvar? As alterações serão perdidas.")) return;
  document.getElementById("modalMount").innerHTML="";
  if(_clState.dirty){ loadCLs(_clState.cond).then(function(a){ _clState.lista=a||[]; _clState.dirty=false; _clRenderLista(); }); }
  else _clRenderLista();
}

/* ================= ESTOQUE: entradas / saídas / saldo / alertas ================= */
function _clNum(x){ var n=parseFloat(String(x==null?"":x).replace(",",".").replace(/[^\d.\-]/g,"")); return isNaN(n)?0:n; }
function _clFmtNum(n){ n=Math.round(n*100)/100; return (n%1===0)?String(n):String(n).replace(".",","); }
function _clEstoqueAlertas(cl){
  return (cl.itens||[]).filter(function(it){ if(!it||!it.nome) return false; var min=_clNum(it.min); if(min<=0) return false; return _clNum(it.saldo)<=min; });
}
function abrirEstoque(clId){ var cl=(_clState.lista||[]).filter(function(x){return x.id===clId;})[0]; if(!cl) return; _clState.estoqueId=clId; _clRenderEstoque(); try{ window.scrollTo(0,0); }catch(e){} }
function voltarEstoque(){ _clState.estoqueId=null; _clRenderLista(); }

function _clRenderEstoque(){
  _clCSS();
  var cl=(_clState.lista||[]).filter(function(x){return x.id===_clState.estoqueId;})[0];
  if(!cl){ return _clRenderLista(); }
  _clBIND=[];
  var back='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><path d="M15 6l-6 6 6 6"/></svg>';
  var alertas=_clEstoqueAlertas(cl);
  var alertaHTML = alertas.length
    ? '<div class="est-alert"><div class="est-alert-t">⚠ Lembretes de compra — '+alertas.length+' item'+(alertas.length===1?"":"s")+' no mínimo ou abaixo</div><div class="est-alert-list">'
      +alertas.map(function(it){ var falta=_clNum(it.min)-_clNum(it.saldo); return '<div class="est-alert-i"><b>'+_clEsc(it.nome)+'</b><span>saldo '+_clFmtNum(_clNum(it.saldo))+' '+_clEsc(it.unidade||"")+' · mín. '+_clFmtNum(_clNum(it.min))+'</span><span class="est-falta">'+(falta>0?("comprar "+_clFmtNum(falta)+"+"):"repor")+'</span></div>'; }).join("")
      +'</div></div>'
    : '<div class="est-ok">✓ Estoque em dia — nenhum item no mínimo ou abaixo.</div>';
  var linhas=(cl.itens||[]).map(function(it){
    var saldo=_clNum(it.saldo), min=_clNum(it.min), baixo=(min>0 && saldo<=min);
    var mi=_clBIND.push({obj:it,key:"min"})-1, si=_clBIND.push({obj:it,key:"saldo"})-1;
    return '<tr class="'+(baixo?"est-row-low":"")+'">'
      +'<td class="est-nm">'+_clEsc(it.nome)+'</td>'
      +'<td class="est-un">'+_clEsc(it.unidade||"—")+'</td>'
      +'<td><input data-cb="'+mi+'" value="'+_clEsc(it.min||"")+'" placeholder="—" class="est-inp"></td>'
      +'<td><input data-cb="'+si+'" value="'+_clEsc(it.saldo!=null?it.saldo:"")+'" placeholder="0" class="est-inp est-saldo'+(baixo?" low":"")+'"></td>'
      +'<td class="est-acts"><button class="est-ent" onclick="_clMovModal(\''+_clJs(cl.id)+'\',\''+_clJs(it.id)+'\',\'entrada\')">＋ Entrada</button>'
        +'<button class="est-sai" onclick="_clMovModal(\''+_clJs(cl.id)+'\',\''+_clJs(it.id)+'\',\'saida\')">− Saída</button></td></tr>';
  }).join("");
  var movs=(cl.movs||[]).slice().sort(function(a,b){return (b.ts||0)-(a.ts||0);});
  var extrato = movs.length
    ? '<div class="est-tblwrap"><table class="est-ext"><thead><tr><th style="width:96px">Data</th><th>Item</th><th style="width:96px">Movimento</th><th style="width:78px">Qtd</th><th>Observação</th><th style="width:44px"></th></tr></thead><tbody>'
      +movs.slice(0,300).map(function(mv){ var it=(cl.itens||[]).filter(function(x){return x.id===mv.itemId;})[0]; var ent=(mv.tipo==="entrada"); return '<tr><td>'+_clEsc(_clDataBR(mv.data))+'</td><td>'+_clEsc(it?it.nome:"—")+'</td><td><span class="est-badge '+(ent?"ent":"sai")+'">'+(ent?"Entrada":"Saída")+'</span></td><td>'+(ent?"+":"−")+_clFmtNum(_clNum(mv.qtd))+'</td><td>'+_clEsc(mv.obs||"")+'</td><td><button class="est-undo" title="Desfazer" onclick="_clDelMov(\''+_clJs(cl.id)+'\',\''+_clJs(mv.id)+'\')">↺</button></td></tr>'; }).join("")
      +'</tbody></table></div>'
    : '<div class="cl-empty">Nenhuma movimentação ainda. Use <b>＋ Entrada</b> e <b>− Saída</b> na tabela acima.</div>';

  document.getElementById("view").innerHTML='<div id="clRoot">'
    +'<div class="cl-head"><div style="flex:1;min-width:220px"><h2>'+ico("checklist")+' '+_clEsc(cl.nome)+'</h2>'
      +'<div class="sub">Controle de estoque · '+_clEsc(_clState.cond)+' — entradas, saídas e alertas de compra</div></div>'
      +'<button class="cl-btn" onclick="imprimirEstoque(\''+_clJs(cl.id)+'\')">🖨 Imprimir</button>'
      +'<button class="cl-btn" onclick="voltarEstoque()">'+back+' Voltar</button></div>'
    + alertaHTML
    +'<div class="est-tblwrap"><table class="est-tbl"><thead><tr><th>Item</th><th style="width:90px">Unidade</th><th style="width:96px">Mínimo</th><th style="width:110px">Saldo atual</th><th style="width:236px">Movimentar</th></tr></thead><tbody>'+linhas+'</tbody></table></div>'
    +'<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="cl-btn" onclick="abrirEditorCL(\''+_clJs(cl.id)+'\')">⚙ Editar itens do estoque</button><span style="font-size:11.5px;color:var(--cl-mut);align-self:center">Defina o <b>mínimo</b> de cada item — quando o saldo chegar nele, entra nos lembretes de compra. Você pode editar o saldo direto na tabela (contagem/ajuste).</span></div>'
    +'<div class="cl-sec"><div class="cl-sec-t">'+ico("checklist")+' Extrato de movimentações</div>'+extrato+'</div>'
  +'</div>';
  document.getElementById("clRoot").querySelectorAll("[data-cb]").forEach(function(n){
    n.addEventListener("change",async function(){ var b=_clBIND[+n.getAttribute("data-cb")]; b.obj[b.key]=n.value; await saveCLs(_clState.cond,_clState.lista); _clRenderEstoque(); });
  });
}

function _clMovModal(clId,itemId,tipo){
  var cl=(_clState.lista||[]).filter(function(x){return x.id===clId;})[0]; if(!cl) return;
  var it=(cl.itens||[]).filter(function(x){return x.id===itemId;})[0]; if(!it) return;
  var ent=(tipo==="entrada"), hoje=new Date().toISOString().slice(0,10);
  document.getElementById("modalMount").innerHTML='<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-width:440px">'
    +'<div class="modal-head"><h3>'+(ent?"＋ Entrada":"− Saída")+' · '+_clEsc(it.nome)+'</h3><button class="x" onclick="closeModal()">×</button></div>'
    +'<div class="modal-body">'
    +'<div style="font-size:12.5px;color:var(--muted);margin-bottom:12px">Saldo atual: <b>'+_clFmtNum(_clNum(it.saldo))+' '+_clEsc(it.unidade||"")+'</b>'+(it.min?(' · mínimo '+_clFmtNum(_clNum(it.min))):"")+'</div>'
    +'<div class="field"><label style="'+_CL_LBL+'">Quantidade ('+(ent?"que entrou":"que saiu")+')</label><input id="movQtd" type="number" min="0" step="any" placeholder="0" style="'+_CL_INP+'"></div>'
    +'<div class="field"><label style="'+_CL_LBL+'">Data</label><input id="movData" type="date" value="'+hoje+'" style="'+_CL_INP+'"></div>'
    +'<div class="field"><label style="'+_CL_LBL+'">Observação (opcional)</label><input id="movObs" placeholder="'+(ent?"ex.: compra NF 123, fornecedor":"ex.: consumo, evento no salão")+'" style="'+_CL_INP+'"></div>'
    +'</div>'
    +'<div class="modal-foot"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-primary" style="flex:1" onclick="salvarMov(\''+_clJs(clId)+'\',\''+_clJs(itemId)+'\',\''+tipo+'\')">Registrar '+(ent?"entrada":"saída")+'</button></div>'
    +'</div></div>';
  setTimeout(function(){ var el=document.getElementById("movQtd"); if(el) el.focus(); },50);
}

async function salvarMov(clId,itemId,tipo){
  var cl=(_clState.lista||[]).filter(function(x){return x.id===clId;})[0]; if(!cl) return;
  var it=(cl.itens||[]).filter(function(x){return x.id===itemId;})[0]; if(!it) return;
  var qtd=_clNum(document.getElementById("movQtd").value);
  if(qtd<=0){ alert("Informe uma quantidade maior que zero."); return; }
  var data=(document.getElementById("movData").value)||new Date().toISOString().slice(0,10);
  var obs=(document.getElementById("movObs").value||"").trim();
  var ent=(tipo==="entrada"), saldo=_clNum(it.saldo), novo=ent?(saldo+qtd):(saldo-qtd);
  if(novo<0) novo=0;
  it.saldo=_clFmtNum(novo);
  if(!Array.isArray(cl.movs)) cl.movs=[];
  cl.movs.push({id:_clId(),itemId:itemId,data:data,tipo:tipo,qtd:qtd,obs:obs,por:(typeof state!=="undefined"&&state.userId)||"",ts:Date.now()});
  await saveCLs(_clState.cond,_clState.lista);
  closeModal(); _clRenderEstoque();
}

async function _clDelMov(clId,movId){
  var cl=(_clState.lista||[]).filter(function(x){return x.id===clId;})[0]; if(!cl) return;
  var mv=(cl.movs||[]).filter(function(x){return x.id===movId;})[0]; if(!mv) return;
  if(!confirm("Desfazer esta movimentação? O saldo será ajustado de volta.")) return;
  var it=(cl.itens||[]).filter(function(x){return x.id===mv.itemId;})[0];
  if(it){ var saldo=_clNum(it.saldo), q=_clNum(mv.qtd), novo=(mv.tipo==="entrada")?(saldo-q):(saldo+q); if(novo<0) novo=0; it.saldo=_clFmtNum(novo); }
  cl.movs=(cl.movs||[]).filter(function(x){return x.id!==movId;});
  await saveCLs(_clState.cond,_clState.lista); _clRenderEstoque();
}

function imprimirEstoque(clId){
  var w=window.open("","_blank");
  var cl=(_clState.lista||[]).filter(function(x){return x.id===clId;})[0]; if(!w||!cl) return;
  var cond=_clEsc(_clState.cond||cl.condominio||"");
  var itens=(cl.itens||[]).filter(function(it){return it&&it.nome;});
  var hoje=_clDataBR(new Date().toISOString().slice(0,10));
  var alertas=_clEstoqueAlertas(cl);
  var linhas=itens.map(function(it,i){ var saldo=_clNum(it.saldo), min=_clNum(it.min), baixo=(min>0&&saldo<=min); return '<tr'+(baixo?' class="low"':'')+'><td class="n">'+(i+1)+'</td><td>'+_clEsc(it.nome)+'</td><td class="c">'+_clEsc(it.unidade||"")+'</td><td class="c">'+(it.min?_clFmtNum(min):"—")+'</td><td class="c b">'+_clFmtNum(saldo)+'</td><td class="c">'+(baixo?'<b style="color:#b8402f">COMPRAR</b>':'OK')+'</td></tr>'; }).join("");
  var alertaBloco = alertas.length ? '<div class="alert"><b>Lembretes de compra ('+alertas.length+'):</b> '+alertas.map(function(it){return _clEsc(it.nome)+' (saldo '+_clFmtNum(_clNum(it.saldo))+', mín. '+_clFmtNum(_clNum(it.min))+')';}).join(" · ")+'</div>' : '';
  var movs=(cl.movs||[]).slice().sort(function(a,b){return (b.ts||0)-(a.ts||0);}).slice(0,80);
  var extrato = movs.length ? '<div class="secth">Últimas movimentações</div><table class="ext"><thead><tr><th class="n">Data</th><th>Item</th><th class="c">Mov.</th><th class="c">Qtd</th><th>Obs.</th></tr></thead><tbody>'+movs.map(function(mv){var it=itens.filter(function(x){return x.id===mv.itemId;})[0];var ent=mv.tipo==="entrada";return '<tr><td class="n">'+_clEsc(_clDataBR(mv.data))+'</td><td>'+_clEsc(it?it.nome:"—")+'</td><td class="c">'+(ent?"Entrada":"Saída")+'</td><td class="c">'+(ent?"+":"−")+_clFmtNum(_clNum(mv.qtd))+'</td><td>'+_clEsc(mv.obs||"")+'</td></tr>';}).join("")+'</tbody></table>' : '';
  var html='<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><title>'+_clEsc(cl.nome)+' — '+cond+'</title><style>'
    +'*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#17253f;margin:0;padding:22px 26px;font-size:12px}'
    +'.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #17253f;padding-bottom:10px}'
    +'.top h1{font-size:16px;margin:0 0 2px}.top .m{font-size:11px;color:#555}'
    +'.badge{font-size:10px;color:#b8912f;border:1px solid #b8912f;border-radius:4px;padding:3px 8px;text-transform:uppercase;letter-spacing:.1em;white-space:nowrap}'
    +'.alert{background:#fbece9;border:1px solid #f0c9c1;border-radius:6px;padding:8px 10px;margin:10px 0;font-size:11px;color:#6b2418}'
    +'table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border:1px solid #c9ced8;padding:5px 7px;text-align:left}'
    +'thead th{background:#17253f;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:.05em}'
    +'td.n,th.n{width:34px;text-align:center}td.c,th.c{text-align:center}td.b{font-weight:bold}tr.low td{background:#fdf3f1}'
    +'.secth{background:#17253f;color:#fff;padding:5px 9px;font-size:11px;font-weight:bold;margin-top:18px}'
    +'table.ext th,table.ext td{font-size:10.5px;padding:4px 6px}'
    +'@page{size:A4;margin:12mm}'
    +'</style></head><body>'
    +'<div class="top"><div><h1>'+_clEsc(cl.titulo||cl.nome)+'</h1><div class="m">'+cond+(cl.local?(' · '+_clEsc(cl.local)):"")+' · Emitido em '+hoje+'</div></div><div class="badge">Controle de estoque</div></div>'
    + alertaBloco
    +'<table><thead><tr><th class="n">#</th><th>Item</th><th class="c">Unidade</th><th class="c">Mínimo</th><th class="c">Saldo</th><th class="c">Situação</th></tr></thead><tbody>'+linhas+'</tbody></table>'
    + extrato
    +'</body></html>';
  w.document.open(); w.document.write(html); w.document.close();
  setTimeout(function(){ try{ w.focus(); w.print(); }catch(e){} }, 450);
}

