// testar-checkin-auto.js — build 126: check-in assistido por GPS, lembrete de check-out, fechamento em 24h
// Uso: node testar-checkin-auto.js   (na pasta com index.html; precisa de `npm install jsdom`)
const fs = require("fs");
const { JSDOM, VirtualConsole } = require("jsdom");
const html = fs.readFileSync("index.html", "utf-8");
const erros = [];
const vc = new VirtualConsole();
vc.on("jsdomError", e => { const m=(e&&e.message)||""; if(!/Could not load (script|link)|Not implemented: Window's scrollTo/.test(m)) erros.push("jsdomError: "+m); });
const dom = new JSDOM(html, { runScripts:"dangerously", resources:"usable", url:"https://gestaomafra.netlify.app/", pretendToBeVisual:true, virtualConsole:vc });

setTimeout(() => { (async () => {
  const w = dom.window;
  const t = (nome, cond) => { if(!cond) erros.push("FALHOU: "+nome); else console.log("✓", nome); };
  w.alert=()=>{}; w.confirm=()=>true; w.scrollTo=()=>{};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const modal=()=>w.document.getElementById("modalMount").innerHTML;

  // ---- ambiente: geos calibrados em memória + GPS simulado
  const GEOS={"Trio Office":{lat:-21.2100,lng:-47.8100,raio:250},"Trio Mall":{lat:-21.2100,lng:-47.8100,raio:250},"Trio Home":{lat:-21.2100,lng:-47.8100,raio:250},
              "San Diego":{lat:-21.1900,lng:-47.8200,raio:250},"__escritorio__":{lat:-21.1775,lng:-47.8103,raio:250}};
  let CHECKINS={registros:[]};
  w.loadCondGeo=async()=>GEOS;
  w.loadCheckins=async()=>JSON.parse(JSON.stringify(CHECKINS));
  w.saveCheckins=async d=>{ CHECKINS=JSON.parse(JSON.stringify(d)); return true; };
  w.infoFeriasHoje=async()=>null;
  w.renderPainelLocalizacao=async()=>{};
  let GPS=null;
  w.navigator.geolocation={ getCurrentPosition:(ok,err)=>{ if(GPS) ok({coords:{latitude:GPS.lat,longitude:GPS.lng,accuracy:GPS.acc||20}}); else err({code:2}); }, watchPosition:()=>1, clearWatch:()=>{} };
  const setUser=uid=>w.eval(`state.userId=${JSON.stringify(uid)}; state.user=USUARIOS[${JSON.stringify(uid)}];`);
  const reset=()=>{ w._ckAssist.adiadoAte=0; w._ckAssist.rodando=false; w.document.getElementById("modalMount").innerHTML=""; };

  t("APP_VERSAO é build 143", /build 143/.test(w.eval("APP_VERSAO")));
  t("funções do assistente existem", ["ckAssistente","_ckFecharVencidos24h","_ckOferecerCheckin","_ckConfirmarAuto","_ckLembrarCheckout"].every(f=>typeof w[f]==="function"));

  /* 1) gestor NÃO recebe o assistente */
  setUser("trio"); reset(); GPS={lat:-21.2100,lng:-47.8100,acc:15};
  await w.ckAssistente("teste"); await wait(200);
  t("gestor (Trio) não recebe oferta de check-in", modal().trim()==="");

  /* 2) síndico no Trio → escolhe o sub */
  setUser("walace"); reset();
  await w.ckAssistente("teste"); await wait(200);
  t("síndico dentro do raio do Trio: oferta aparece", modal().indexOf("Você está no <strong>Trio</strong>")>-1);
  t("oferta lista Office / Mall / Home como botões", />Office<\/button>|Office<\/button>/.test(modal()) && modal().indexOf("Mall")>-1 && modal().indexOf("Home")>-1);
  await w._ckConfirmarAuto((w._ckAssist.opcoes||[]).findIndex(o=>o.nome==="Trio Mall")); await wait(200);
  const ck=CHECKINS.registros[CHECKINS.registros.length-1];
  t("confirmar grava check-in em 'Trio Mall' com GPS e marca viaGps", ck && ck.condominio==="Trio Mall" && ck.uid==="walace" && ck.geo && ck.geo.lat===-21.21 && ck.viaGps===true && !ck.checkOut);
  t("modal fechou após confirmar", modal().trim()==="");

  /* 3) com check-in aberto e perto → lembrete normal */
  reset(); await w.ckAssistente("teste"); await wait(200);
  t("check-in aberto, ainda no local: lembrete normal de check-out", modal().indexOf("Você ainda está com check-in em <strong>Trio Mall</strong>")>-1 && modal().indexOf("Continuo aqui")>-1);
  w._ckAdiar();
  t("'Continuo aqui' adia por 30 min", w._ckAssist.adiadoAte>Date.now()+25*60*1000 && modal().trim()==="");
  await w.ckAssistente("teste"); await wait(100);
  t("adiado: não pergunta de novo", modal().trim()==="");

  /* 4) longe do local → lembrete em destaque */
  reset(); GPS={lat:-21.1500,lng:-47.7500,acc:15};
  await w.ckAssistente("teste"); await wait(200);
  t("longe do local: aviso 'Esqueceu o check-out?' com distância", modal().indexOf("Esqueceu o check-out?")>-1 && /a \d+(\.\d)? km\)/.test(modal()));
  t("botão 'Dar check-out' presente", modal().indexOf("abrirCheckout()")>-1);
  reset();

  /* 5) 24h → fecha sozinho com horário exato */
  const ini=Date.now()-25*3600*1000;
  CHECKINS={registros:[{id:"ckA",uid:"walace",condominio:"San Diego",checkIn:ini},{id:"ckB",uid:"bruna",condominio:"Trio Home",checkIn:Date.now()-2*3600*1000}]};
  const r=await w._ckFecharVencidos24h();
  t("fecha só o check-in com mais de 24h (1 de 2)", r.fechados===1 && !CHECKINS.registros[1].checkOut);
  const fechado=CHECKINS.registros[0];
  t("check-out = entrada + 24h exatas, marcado automático", fechado.checkOut===ini+24*3600*1000 && fechado.checkOutAuto24===true && /24h/.test(fechado.resumoSaida));
  t("fechamento vale para outro usuário (não só o logado)", fechado.uid==="walace");

  /* 6) sem check-in, na sede → oferece Escritório Mafra */
  CHECKINS={registros:[]}; reset(); GPS={lat:-21.1776,lng:-47.8104,acc:20};
  await w.ckAssistente("teste"); await wait(200);
  t("na sede: oferece 'Escritório Mafra'", modal().indexOf("Você está em <strong>Escritório Mafra</strong>")>-1);
  await w._ckConfirmarAuto(0); await wait(100);
  t("check-in na sede grava interno=escritorio sem GPS", CHECKINS.registros[0].interno==="escritorio" && !CHECKINS.registros[0].geo);

  /* 7) longe de tudo → nada */
  CHECKINS={registros:[]}; reset(); GPS={lat:-20.5,lng:-47.0,acc:20};
  await w.ckAssistente("teste"); await wait(200);
  t("fora de todos os raios: não oferece nada", modal().trim()==="");

  /* 8) sem GPS → nada, e o manual segue funcionando */
  reset(); GPS=null;
  await w.ckAssistente("teste"); await wait(200);
  t("sem GPS: não oferece nada", modal().trim()==="");
  w.abrirCheckin(); t("check-in manual continua abrindo", modal().indexOf('id="chCond"')>-1); w.closeModal();

  /* 9) não atropela outro modal aberto */
  w.document.getElementById("modalMount").innerHTML="<div>outro modal</div>"; w._ckAssist.adiadoAte=0; GPS={lat:-21.2100,lng:-47.8100,acc:15};
  await w.ckAssistente("teste"); await wait(200);
  t("com outro modal aberto, o assistente não interfere", modal()==="<div>outro modal</div>");

  if(erros.length){ console.log("\n❌ FALHAS:\n"+erros.join("\n")); process.exit(1); }
  console.log("\n✅ Check-in assistido (build 128): tudo passou.");
  process.exit(0);
})().catch(e=>{ console.log("❌ exceção: "+(e&&e.stack||e)); process.exit(1); }); }, 1500);
