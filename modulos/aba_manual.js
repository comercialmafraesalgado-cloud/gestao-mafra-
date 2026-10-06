/* ============================================================
   GESTÃO MAFRA — ABA MANUAL
   Gerado automaticamente. NÃO roda sozinho: depende do _nucleo.js.
   Para publicar, rode:  node montar.js   (recombina tudo no index.html)
   ============================================================ */

/* Funções desta aba: loadManual, saveManual, loadManualPadrao, saveManualPadrao, _manualVazio, importarManuaisPreCadastrados, nomeCompletoSub, renderManual, renderManualSubs, abrirPaiSub, _voltarManual, abrirManual, renderEditorManual, _manualAbaCapa, _manualAbaIdentidade, _manualAbaZelador, _manualAbaContatos, _manualAbaAreas, _toggleArea, _setArea, _manualAbaReformas, _manualAbaProjetos, _upProj, _manualAbaRegras, _ligarHandlersManual, _coletarCamposManual, salvarManual, visualizarPdfManual, _gerarHtmlManual, _paragrafos, _regrasPadraoArea, editarManualPadrao, salvarManualPadrao, editarPessoasPadrao, editarPessoasPadraoRender, _upPp, salvarPessoasPadrao, carregarPdfJs, importarManualPdf, _extrairCamposDeTexto, _exibirRevisaoImportPdf, aplicarDadosImportPdf, confirmarImportarManuaisPre */

async function loadManual(cond){
  try{ const v=await storeGet("mafra:manual:"+cond); if(v) return JSON.parse(v); }catch(e){}
  return null;
}

async function saveManual(cond, data){
  _storeCacheClear("mafra:manual:"+cond);
  data.atualizadoEm = Date.now();
  data.atualizadoPor = state.userId;
  return await storeSet("mafra:manual:"+cond, JSON.stringify(data));
}

async function loadManualPadrao(){
  try{ const v=await storeGet("mafra:manual_padrao"); if(v) return JSON.parse(v); }catch(e){}
  // valores padrão Mafra (com base no exemplo do Magnólia)
  return {
    cartaBoasVindas: `É com grande satisfação que a Mafra Gestão Integrada se apresenta como sua parceira na gestão do seu novo lar. Como síndicos profissionais, assumimos a responsabilidade pela gestão do condomínio, garantindo que todas as áreas sejam geridas com a máxima eficiência e transparência.\n\nNossa missão é oferecer serviços de excelência que promovam bem-estar, segurança e qualidade de vida a todos os moradores. Estamos comprometidos com a gestão eficiente de edifícios comerciais, residenciais e mistos, sempre visando a padronização da qualidade e a valorização do patrimônio.\n\nAcreditamos que uma convivência harmoniosa entre os condôminos é essencial para o desenvolvimento de um ambiente agradável e seguro para todos.\n\nCom isso em mente, apresentamos a seguir algumas informações, orientações e procedimentos importantes para o dia a dia no Condomínio, que contribuirão para uma experiência tranquila e positiva.`,
    sobreSindico: `Contamos com uma equipe altamente capacitada e alinhada à nossa metodologia de gestão, focada na entrega de soluções inovadoras que promovem eficiência, transparência e valorização do empreendimento.\n\nNossa atuação é baseada em manutenção preventiva e preditiva, padronização de processos e planejamento financeiro estratégico, garantindo controle, previsibilidade e redução de custos. Além disso, realizamos uma gestão ativa na negociação de contratos e na otimização de recursos.\n\nCom foco na experiência do cliente, proporcionamos comodidade, atendimento personalizado e melhoria contínua dos serviços, assegurando uma gestão moderna, eficiente e orientada a resultados.`,
    sobreAdministrativo: `A coordenação tem papel estratégico, sendo responsável por supervisionar as operações administrativas, alinhar a equipe e garantir que os serviços sejam executados conforme os objetivos definidos, sempre buscando eficiência e qualidade na entrega.\n\nO setor financeiro é responsável pelo monitoramento das atividades realizadas pela administradora, incluindo a revisão da arrecadação de taxas, controle de despesas e prestação de contas. Também acompanha os orçamentos e as notas fiscais relacionadas às manutenções preventivas e corretivas do condomínio, assegurando transparência e equilíbrio financeiro.\n\nJá a comunicação atua como elo entre os moradores e demais envolvidos, promovendo clareza nas informações, divulgação de comunicados, orientações e atendimento ao condômino. Além disso, busca melhorias contínuas por meio de feedbacks, contribuindo para a boa convivência e a organização interna do condomínio.`,
    sobreSindicoOperacional: `Responsável por acompanhar e garantir a execução das rotinas operacionais dos condomínios, atuando como elo entre a equipe de campo, diretoria e administrativo. Sua função envolve a fiscalização dos serviços prestados, verificação da qualidade das manutenções (preventivas e corretivas) e apoio na organização das demandas operacionais.\n\nAtua diretamente no controle das atividades do dia a dia, assegurando o cumprimento de normas, procedimentos internos e deliberações, além de identificar oportunidades de melhoria contínua. Também auxilia na validação, acompanhamento de serviços executados e suporte na comunicação entre as partes envolvidas.`,
    sobreZeladoria: `A zeladoria é responsável pelo acompanhamento e controle das rotinas operacionais do condomínio, garantindo que os serviços do dia a dia sejam executados com qualidade, organização e dentro das normas estabelecidas.\n\nEntre suas principais funções, destacam-se:\n• Fiscalizar a limpeza, conservação e organização das áreas comuns\n• Acompanhar e apoiar serviços de manutenção preventiva e corretiva\n• Supervisionar prestadores de serviço e equipe operacional\n• Identificar necessidades de reparos e melhorias\n• Zelar pelo cumprimento das normas internas e bom uso das áreas comuns\n• Apoiar o síndico e a administração nas demandas operacionais\n• Atuar de forma preventiva, evitando problemas e garantindo o bom funcionamento do condomínio.`,
    contatoMafra: "(16) 9 9284-5898",
    siteMafra: "https://mafragestaointegrada.com.br/",
    emailMafra: "contato@mafragestaointegrada.com.br",
    instagram: "@mafragestaointegrada",
    youtube: "Mafra Gestão Integrada",
    diretoria:[
      {nome:"Márcia Mafra", cargo:"Sócia Diretora de Operações", foto:"", bio:"Mestre em Administração, MBA em Controladoria e Finanças. Criadora do método Tríade da Alta Performance, Mentora Seja 25K, palestrante, escritora e especialista em análise de perfil comportamental e gestão empresarial/condominial, performance e inteligência emocional. Embaixadora Nacional Porter. Sócia e diretora de operações da Mafra Gestão Integrada, referência em condomínios de alto padrão e implantação."},
      {nome:"André Salgado", cargo:"Sócio Diretor Financeiro", foto:"", bio:"Sócio Diretor Financeiro da Mafra Gestão Integrada, com ampla experiência em consultoria e assessoria financeira, contábil e condominial. Pós-Graduado em Perícia Contábil e Financeira e Bacharel em Ciências Contábeis pela FEA-RP/USP, atua como docente em MBAs, palestrante em Finanças Comportamentais, Inteligência Visual e Inteligência Artificial, além de Host de Podcast."}
    ],
    administrativo:[
      {nome:"Bianca Rodrigues", cargo:"COORDENADORA", foto:""},
      {nome:"Julia Martin", cargo:"COMUNICAÇÃO", foto:""},
      {nome:"Camilla Nogueira", cargo:"FINANCEIRO", foto:""}
    ],
    sindicosOperacionais:[
      {nome:"Walace Felipe", cargo:"SÍNDICO OPERACIONAL", foto:""},
      {nome:"Milena Freitas", cargo:"SÍNDICA OPERACIONAL", foto:""},
      {nome:"Bruna Morelli", cargo:"SÍNDICA OPERACIONAL", foto:""}
    ]
  };
}

async function saveManualPadrao(d){ _storeCacheClear("mafra:manual_padrao"); return await storeSet("mafra:manual_padrao", JSON.stringify(d)); }

function _manualVazio(cond, tipo){
  tipo = tipo || "residencial";
  // Misto: comporta como residencial (zelador), mas com tag visual diferente
  const ehLot = tipo==="loteamento";
  const semGas = tipo==="comercial" || tipo==="loteamento";
  return {
    condominio: cond,
    tipo: tipo, // "residencial" | "comercial" | "loteamento" | "misto"
    status: "rascunho",
    capa: "",
    zelador: {nome:"", contato:"", email:"", horario: ehLot ? "Segunda a Sexta das 07:30 às 17h" : "De segunda à sexta 8h às 17h\nSábado: 08h às 12h", endereco:"", foto:"", cargo: ehLot ? "Gerente" : "Zelador(a)"},
    energia: {fornecedora:"CPFL", site:"https://www.cpfl.com.br/", fornecimento:"Trifásico", passos: (tipo==="comercial" || ehLot) ? "Telefone CPFL: 0800-010-1010" : "1° Ligação nova\n2° Vou me mudar para um imóvel que ainda não tem medidor (relógio) instalado\n3° Montei um padrão novo e desejo solicitar a primeira ligação da energia\n4° Iniciar solicitação (no final da página)\n5° Preencher seu cadastro"},
    gas: {fornecedora: semGas ? "" : "Necta", telefone: semGas ? "" : "0800 773 6099", tipo: semGas ? "" : "Gás natural encanado (GN)", obs: semGas ? "" : "Caso tenha seu fogão (modelo GLP), será necessário a conversão com técnico autorizado e a inclusão de um adaptador."},
    administradora: {nome:"", endereco:"", telefone:"", whatsapp:"", email:""},
    construtora: {nome:"", endereco:"", telefone:""},
    internet: [],
    appCondominio: ehLot ? "Prime Acess" : "Condomob",
    sindigestUrl: "",
    saerp: ehLot ? "08001150115" : "",
    areasComuns: [],
    reformas: {emailZelador:"", prazoAnalise:"7 dias", horarioObras:"Segunda a sexta, das 8h às 17h", horarioMudancaSemana:"08h às 11:30h ou 13h às 16:30h", horarioMudancaSabado:"8h às 11h", elevador: {portaAlt:"", portaLarg:"", cabinaAlt:"", cabinaLarg:"", cabinaComp:"", peso:""}, obsExtra:""},
    projetosTecnicos: [],
    assembleias: tipo!=="residencial",
    leiSilencio: "Das 22h às 7h os moradores devem evitar a produção de ruídos nas unidades e áreas comuns.",
    dicasSeguranca: "Quando viajar ou ausentar-se por mais de um dia, desligue os registros de água e gás, verifique se todas as janelas e portas estão trancadas.\n\nAs normas e procedimentos citados acima têm por finalidade proporcionar maior segurança e boa convivência aos condôminos e todos quantos residam no condomínio, sendo assim não devem ser negligenciadas por moradores, visitantes, hóspedes e prestadores de serviço."
  };
}

async function importarManuaisPreCadastrados(){
  const resultados = [];

  // ========== EDIFÍCIO MAGNÓLIA (residencial vertical) ==========
  const magnolia = _manualVazio("Edifício Magnólia", "residencial");
  magnolia.appCondominio = "Condomob";
  magnolia.sindigestUrl = "https://sindigest.com.br/client/edificiomagnolia/issue";
  magnolia.zelador = {
    nome: "Elisa Emanuele",
    contato: "(16) 99749-8762",
    email: "zeladoredificiomagnolia@gmail.com",
    horario: "De segunda à sexta 8h às 17h\nSábado: 08h às 12h",
    endereco: "Rua: José Miguel Said, 250, Jardim Botânico",
    foto: "",
    cargo: "Zelador(a)"
  };
  magnolia.energia = {fornecedora:"CPFL", site:"https://www.cpfl.com.br/", fornecimento:"Trifásico", passos:"1° Ligação nova\n2° Vou me mudar para um imóvel que ainda não tem medidor (relógio) instalado (Clicar em ligue sua energia)\n3° Montei um padrão novo e desejo solicitar a primeira ligação da energia\n4° Iniciar solicitação (no final da página)\n5° Preencher seu cadastro"};
  magnolia.gas = {fornecedora:"Necta", telefone:"0800 773 6099", tipo:"Gás natural encanado (GN)", obs:"O sistema de gás do condomínio é gás natural encanado (GN), caso tenha seu fogão (modelo GLP), será necessário a conversão com técnico autorizado e a inclusão de um adaptador."};
  magnolia.administradora = {nome:"Etikon Assessoria Contábil Ltda", endereco:"R. Marcos Markarian, 1025 - Sala 410 - Jardim Nova Aliança", telefone:"(16) 3236-0647", whatsapp:"(16) 99179-9988", email:"contato@etikon.com.br"};
  magnolia.construtora = {nome:"Stéfani Nogueira", endereco:"Av. Dr. José Cesário Monteiro da Silva, 345 - Jardim Nova Aliança, Ribeirão Preto - SP, 14026-600", telefone:"4009-9499 / 0800 000 9499"};
  magnolia.internet = [
    {provedor:"Vivo", contato:"10315", whatsapp:""},
    {provedor:"Alcans", contato:"0800 940 3006", whatsapp:"(16) 9 9292-2121"}
  ];
  magnolia.reformas = {
    emailZelador:"zeladoredificiomagnolia@gmail.com",
    prazoAnalise:"7 dias",
    horarioObras:"Segunda a sexta, das 8h às 17h",
    horarioMudancaSemana:"08h às 11:30h ou 13h às 16:30h",
    horarioMudancaSabado:"8h às 11h",
    elevador: {portaAlt:"2.00 m", portaLarg:"0,90 m", cabinaAlt:"2.20 m", cabinaLarg:"1.60 m", cabinaComp:"1.50 m", peso:"1.125 quilos"},
    obsExtra:""
  };
  magnolia.areasComuns = [
    {tipo:"piscina", ativa:true, horario:"6h às 22h", regras:""},
    {tipo:"salao_festa", ativa:true, horario:"Dom a qui: 8h às 24h · Sex/sáb/véspera: até 1h", regras:""},
    {tipo:"quadra", ativa:true, horario:"08h às 22h", regras:""},
    {tipo:"bicicletario", ativa:true, horario:"", regras:""},
    {tipo:"bike_wash", ativa:true, horario:"", regras:""},
    {tipo:"churrasq_sport", ativa:true, horario:"10h às 22h", regras:""},
    {tipo:"churrasq_pizza", ativa:true, horario:"10h às 22h", regras:""},
    {tipo:"brinquedoteca", ativa:true, horario:"8h às 20h", regras:""},
    {tipo:"pet_care", ativa:true, horario:"", regras:""},
    {tipo:"pet_place", ativa:true, horario:"8h às 21h", regras:""},
    {tipo:"coworking", ativa:true, horario:"7h às 22h", regras:""},
    {tipo:"salao_jogos", ativa:true, horario:"10h às 22h", regras:""},
    {tipo:"fitness", ativa:true, horario:"6h às 22h", regras:""},
    {tipo:"playground", ativa:true, horario:"8h às 21h", regras:""},
    {tipo:"garagem", ativa:true, horario:"", regras:""},
    {tipo:"carrinhos", ativa:true, horario:"", regras:""},
    {tipo:"animais", ativa:true, horario:"", regras:""},
    {tipo:"lixo", ativa:true, horario:"", regras:""}
  ];
  magnolia.assembleias = false;
  magnolia.status = "pronto";
  magnolia.atualizadoEm = Date.now();
  magnolia.atualizadoPor = state.userId || "system";
  await storeSet("mafra:manual:Edifício Magnólia", JSON.stringify(magnolia));
  resultados.push("✓ Edifício Magnólia (residencial vertical)");

  // ========== BORDA DO PARQUE (loteamento horizontal) ==========
  const borda = _manualVazio("Borda do Parque", "loteamento");
  borda.appCondominio = "Prime Acess";
  borda.sindigestUrl = "https://sindigest.com.br/client/bordadoparque/issue";
  borda.zelador = {
    nome: "Michael Le Senechal (Maicon)",
    contato: "(16) 99125-3171",
    email: "bordadoparquecondominio@gmail.com",
    horario: "Segunda a Sexta das 07:30 às 17h",
    endereco: "",
    foto: "",
    cargo: "Gerente"
  };
  borda.energia = {fornecedora:"CPFL", site:"https://www.cpfl.com.br/", fornecimento:"", passos:"Telefone CPFL Ligar Energia: 0800-010-1010"};
  borda.gas = {fornecedora:"", telefone:"", tipo:"", obs:""};
  borda.saerp = "08001150115";
  borda.administradora = {nome:"Inah", endereco:"Av. Leais Paulista, 407 - Jardim Irajá, Ribeirão Preto - SP, 14020-000", telefone:"(16) 4009-9000", whatsapp:"(16) 4009-9000", email:"atendimento@inahimoveis.com.br"};
  borda.construtora = {nome:"Pereira Alvim", endereco:"", telefone:"(16) 3515-5151"};
  borda.internet = [
    {provedor:"Vivo", contato:"0800 999 1010", whatsapp:""},
    {provedor:"WCA", contato:"(16) 3515-9600", whatsapp:""},
    {provedor:"Alcans", contato:"(16) 9 9423-6363", whatsapp:""}
  ];
  borda.reformas = {
    emailZelador:"bordadoparquecondominio@gmail.com",
    prazoAnalise:"conforme Cartilha de Obras",
    horarioObras:"Segunda a sexta-feira, das 08h às 17h (proibido sábados, domingos e feriados)",
    horarioMudancaSemana:"08h às 17h (mínimo 10 dias úteis de antecedência)",
    horarioMudancaSabado:"Proibido aos sábados, domingos e feriados",
    elevador: {portaAlt:"", portaLarg:"", cabinaAlt:"", cabinaLarg:"", cabinaComp:"", peso:""},
    obsExtra:"O caminhão de mudança será obrigado a sair do loteamento às 17h, mesmo que não tenha descarregado toda a carga. As obras, manutenções e reformas devem seguir a Cartilha de Obras do condomínio. Solicitações via e-mails: atendimento@inahimoveis.com.br, projetos@bordadoparque.com.br, contato@mafragestaointegrada.com.br. Autorização de visitantes/prestadores: WhatsApp Portaria (16) 35159691 ou app Prime Acess."
  };
  borda.areasComuns = [
    {tipo:"quadra", ativa:true, horario:"uso livre (sem agendamento)", regras:"As quadras de Beach Tennis, bem como o campinho de futebol, têm uso livre, não sendo necessário agendamento prévio."},
    {tipo:"playground", ativa:true, horario:"", regras:"Uso livre. Recomenda-se que crianças menores de 10 anos estejam acompanhadas."},
    {tipo:"animais", ativa:true, horario:"", regras:"É proibida a criação de animais silvestres, peçonhentos ou de grande porte.\n• Animais devem estar com coleira e guia em áreas comuns.\n• Donos são responsáveis pela coleta dos dejetos.\n• Raças como Pit Bull, Rottweiller, entre outros, devem usar guia curta e focinheira.\n• O condômino é responsável por qualquer dano causado pelo animal."},
    {tipo:"fitness", ativa:true, horario:"24 horas", regras:"Horário de funcionamento 24 horas. As chaves devem ser retiradas na portaria, podendo ser solicitado ao ronda."},
    {tipo:"lixo", ativa:true, horario:"Coleta: segunda, quarta e sexta às 16h", regras:"• A coleta é feita pela empresa responsável de segunda, quarta e sexta às 16h.\n• Todos os lotes devem possuir cestos para lixo orgânico (verde) e reciclável (cinza), ambos com tampa.\n• É proibido colocar lixo diretamente no chão.\n• O lixo deve ser armazenado separadamente em sacos plásticos antes de ser colocado nos cestos.\n• A compra e manutenção dos cestos são de responsabilidade do morador.\n• O lixo que não estiver nos cestos corretos e em sacos plásticos não será coletado.\n• Em casos de grande quantidade de recicláveis (eventos), o material deve estar amarrado ou em caixas de papelão."}
  ];
  borda.assembleias = true;
  borda.leiSilencio = "O horário permitido para som e atividades sonoras é das 08h00 às 22h00. Em caso de evento se estende até as 23h.\n• Eventos, reuniões e festas não devem gerar ruídos ou incômodos audíveis para outros moradores após o horário determinado.\n• Qualquer perturbação fora desse horário será considerada uma infração.";
  borda.status = "pronto";
  borda.atualizadoEm = Date.now();
  borda.atualizadoPor = state.userId || "system";
  await storeSet("mafra:manual:Borda do Parque", JSON.stringify(borda));
  resultados.push("✓ Borda do Parque (loteamento horizontal)");

  // ========== CENTRO PROFISSIONAL RIBEIRÃO SHOPPING (comercial) ==========
  const cprbs = _manualVazio("Centro Profissional Ribeirão Shopping", "comercial");
  cprbs.appCondominio = "Vallecon";
  cprbs.sindigestUrl = "https://sindigest.com.br/client/centroprofissional/issue";
  cprbs.zelador = {
    nome: "Luana Figueiredo",
    contato: "(16) 99437-1131",
    email: "gerenciacprbs@gmail.com",
    horario: "De segunda à sexta-feira das 08h às 17h30",
    endereco: "",
    foto: "",
    cargo: "Gerente"
  };
  cprbs.energia = {fornecedora:"CPFL", site:"https://www.cpfl.com.br/", fornecimento:"", passos:"Telefone CPFL Ligar Energia: 0800-010-1010"};
  cprbs.gas = {fornecedora:"", telefone:"", tipo:"", obs:""};
  cprbs.administradora = {nome:"Vallecon Administração de Condomínios", endereco:"Rua Comandante Marcondes Salgado, nº 417 - Ribeirão Preto - SP - CEP: 14010-150", telefone:"(16) 3102-9595", whatsapp:"(16) 3102-9595", email:"atendimento@vallecon.com.br"};
  cprbs.construtora = {nome:"Multiplan", endereco:"", telefone:"(21) 3031-5200"};
  cprbs.internet = [
    {provedor:"Vivo", contato:"0800 999 1010", whatsapp:""},
    {provedor:"Alcans", contato:"0800 940 3006", whatsapp:""},
    {provedor:"IFTNet", contato:"(16) 99263-8387", whatsapp:""},
    {provedor:"ClickFibra", contato:"(16) 9 9600-6617", whatsapp:""}
  ];
  cprbs.reformas = {
    emailZelador:"gerenciacprbs@gmail.com",
    prazoAnalise:"conforme KIT OBRIGATÓRIO",
    horarioObras:"Pequenos reparos sem barulho: dias úteis 08h-17h, sábados 08h-17h | Com barulho: dias úteis 18h-23h, sábados 13h-17h, domingos/feriados 08h-17h",
    horarioMudancaSemana:"08h às 11h e das 12h às 16h30",
    horarioMudancaSabado:"Proibido aos sábados, domingos e feriados",
    elevador: {portaAlt:"", portaLarg:"", cabinaAlt:"", cabinaLarg:"", cabinaComp:"", peso:""},
    obsExtra:"As obras, manutenções e reformas devem ser solicitadas por escrito no e-mail gerenciacprbs@gmail.com. Constarão os procedimentos detalhadamente no KIT OBRIGATÓRIO – Obras, Manutenção e Reformas. Horário para descarregar material: segunda a sexta das 08h às 11h e das 12h às 17h. Autorização de visitantes/prestadores: e-mail até as 17h com número da sala, responsável, tipo de serviço, data, nome e CPF."
  };
  cprbs.areasComuns = [
    {tipo:"garagem", ativa:true, horario:"", regras:"• As vagas são de uso exclusivo de condôminos, não sendo permitida a permanência de veículos de terceiros nem sublocação.\n• Não é permitida a colocação de objetos nas demarcações ou ruas da garagem, mesmo provisórios.\n• O condomínio não se responsabiliza por objetos deixados dentro dos veículos.\n• Os veículos devem permanecer trancados com chave/alarme e os vidros fechados.\n• Embarque e desembarque: não é permitida a permanência de veículos provisórios na frente do Condomínio."},
    {tipo:"estacionamento_visitantes", ativa:true, horario:"Seg-sex: 06h-20h · Sáb: 07h-14h · Dom/feriados: fechado", regras:"Condôminos possuem acesso livre ao estacionamento em qualquer dia da semana.\nHorário de funcionamento do estacionamento:\n• Segunda a sexta-feira: das 06h às 20h\n• Sábado: das 07h às 14h\n• Domingo e feriados: fechado"},
    {tipo:"lixo", ativa:true, horario:"Coleta: seg-sex das 11h às 12h", regras:"• Não é permitida a colocação de lixos no hall social ou escada de emergência.\n• Será realizada a coleta nas unidades de segunda a sexta-feira das 11h às 12h. Neste período os elevadores de serviço ficam inoperantes para uso.\n• No momento da coleta, os lixos devem estar separados e bem acondicionados.\n• O descarte do lixo infectante é feito pelo próprio condômino no depósito no subsolo 1.\n• O lixo infectante deve ser acondicionado em saco branco separado do lixo comum."},
    {tipo:"visitantes_comercial", ativa:true, horario:"", regras:"Orientar o visitante que acessar sua sala a trazer um documento com foto para a realização do cadastro de acesso ao edifício."},
    {tipo:"ar_condicionado_central", ativa:true, horario:"Seg-sáb: 06h-23h · Dom/feriados: desligado", regras:"O ar-condicionado do prédio é central, permanecendo desligado aos domingos e feriados.\nRessaltamos que de segunda-feira à sábado, o sistema funciona conforme horário estabelecido das 06h às 23h."}
  ];
  cprbs.assembleias = true;
  cprbs.leiSilencio = "Das 22h às 7h os moradores devem evitar a produção de ruídos nas unidades e áreas comuns.";
  cprbs.status = "pronto";
  cprbs.atualizadoEm = Date.now();
  cprbs.atualizadoPor = state.userId || "system";
  await storeSet("mafra:manual:Centro Profissional Ribeirão Shopping", JSON.stringify(cprbs));
  // Tenta também versões alternativas do nome (caso esteja cadastrado de outra forma)
  await storeSet("mafra:manual:Centro Profissional", JSON.stringify({...cprbs, condominio:"Centro Profissional"}));
  resultados.push("✓ Centro Profissional Ribeirão Shopping (comercial)");

  return resultados;
}

function nomeCompletoSub(pai, filho){ return pai + " › " + filho; }

async function renderManual(){
  const view=document.getElementById("view");
  view.innerHTML='<div style="padding:40px;text-align:center;color:#9aa">Carregando…</div>';

  // Se estamos navegando dentro de um pai (subcondomínios)
  if(window.manPaiAtual){
    return renderManualSubs(window.manPaiAtual);
  }

  // FILTRO POR PERFIL: determina lista de condomínios visíveis
  const u = state.user || {};
  let condsVisiveis = null; // null = vê tudo
  let escopoMsg = "";
  if(u.tipo === "master" || ["bianca","camilla","julia"].includes(state.userId)){
    condsVisiveis = null; // master e BPO veem tudo
  } else if(u.tipo === "sindico"){
    // Síndico operacional: usa "Meus condomínios" (loadCondominios)
    condsVisiveis = await condominiosDoSindico(state.userId);
    escopoMsg = `Mostrando apenas os ${condsVisiveis.length} condomínio${condsVisiveis.length!==1?"s":""} que você cuida`;
  } else if(u.tipo === "gestor"){
    condsVisiveis = condsDoGestor();
    escopoMsg = "Mostrando apenas o(s) condomínio(s) que você administra";
  }

  // Lista status de cada condomínio (do CONDOMINIOS normal + pais de subcondomínios)
  const linhas = [];
  const condsFiltrados = CONDOMINIOS.filter(c => !Object.values(SUBCONDOMINIOS).flat().some(f => c.includes(f) && Object.keys(SUBCONDOMINIOS).some(p => c.includes(p))));
  const todosPais = Object.keys(SUBCONDOMINIOS);
  let condsExibir = [...new Set([...condsFiltrados, ...todosPais])].sort((a,b)=>a.localeCompare(b,"pt-BR"));

  // Aplica o filtro de visibilidade
  if(condsVisiveis !== null){
    condsExibir = condsExibir.filter(c => condVisivel(condsVisiveis, c));
  }
  
  for(const c of condsExibir){
    if(SUBCONDOMINIOS[c]){
      // É um pai → calcula status agregado dos filhos
      // Para síndico/gestor: filtra também os filhos visíveis
      const filhosNomes = condsVisiveis !== null
        ? SUBCONDOMINIOS[c].filter(f => condVisivel(condsVisiveis, nomeCompletoSub(c, f)))
        : SUBCONDOMINIOS[c];
      const filhos = [];
      for(const f of filhosNomes){
        const nome = nomeCompletoSub(c, f);
        const m = await loadManual(nome);
        filhos.push({nome:f, manual:m});
      }
      if(filhos.length){
        linhas.push({cond:c, manual:null, pai:true, filhos});
      }
    } else {
      const m = await loadManual(c);
      linhas.push({cond:c, manual:m, pai:false});
    }
  }

  let html=`<div class="weeknav"><div><h2>📘 Manual de Boas-Vindas</h2><div class="range">${escopoMsg || "Crie e edite os manuais de cada condomínio"}</div></div>
    <div class="spacer"></div>
    ${u.tipo==="master" ? `<button class="btn-ghost" onclick="editarManualPadrao()">⚙️ Configurações gerais Mafra</button>` : ""}
    ${u.tipo==="master" ? `<button class="btn-gold" onclick="confirmarImportarManuaisPre()">🌱 Importar manuais pré-prontos</button>` : ""}
  </div>`;

  html+=`<div class="man-grid">`;
  linhas.forEach(({cond, manual, pai, filhos})=>{
    if(pai){
      // Card de pasta (subcondomínios)
      const totalFilhos = filhos.length;
      const prontos = filhos.filter(f=>f.manual && f.manual.status==="pronto").length;
      const rascunhos = filhos.filter(f=>f.manual && f.manual.status==="rascunho").length;
      const stTxt = prontos===totalFilhos ? "✅ Todos prontos" : (prontos+rascunhos===totalFilhos ? `📄 ${prontos}/${totalFilhos} prontos` : `➕ ${totalFilhos-prontos-rascunhos} sem criar`);
      const stCls = prontos===totalFilhos ? "man-st-ok" : (rascunhos>0||prontos>0 ? "man-st-rasc" : "man-st-novo");
      // Tenta achar uma capa de algum filho para mostrar
      const capa = filhos.find(f=>f.manual && f.manual.capa);
      const capaImg = capa ? `<div class="man-card-capa" style="background-image:url('${capa.manual.capa}')"></div>` : `<div class="man-card-capa man-card-sem"><span>🗂️</span></div>`;
      html+=`<div class="man-card man-card-pai" onclick="abrirPaiSub('${cond.replace(/'/g,"\\'")}')">
        ${capaImg}
        <div class="man-card-body">
          <div class="man-card-nm">🗂️ ${esc(cond)}</div>
          <div class="man-card-st ${stCls}">${stTxt}</div>
          <div class="man-card-meta">${totalFilhos} subcondomínios: ${filhos.map(f=>esc(f.nome)).join(" · ")}</div>
        </div>
      </div>`;
    } else {
      const status = !manual ? "novo" : (manual.status||"rascunho");
      const stTxt = status==="pronto" ? "✅ Pronto" : (status==="rascunho" ? "📄 Rascunho" : "➕ Não criado");
      const stCls = status==="pronto" ? "man-st-ok" : (status==="rascunho" ? "man-st-rasc" : "man-st-novo");
      const quando = manual && manual.atualizadoEm ? new Date(manual.atualizadoEm).toLocaleDateString("pt-BR") : "";
      const quem = manual && manual.atualizadoPor && USUARIOS[manual.atualizadoPor] ? USUARIOS[manual.atualizadoPor].nome.split(" ")[0] : "";
      const tipo = manual ? (manual.tipo==="comercial" ? "Comercial" : manual.tipo==="loteamento" ? "Loteamento" : manual.tipo==="misto" ? "Misto" : "Residencial") : "";
      const capaImg = manual && manual.capa ? `<div class="man-card-capa" style="background-image:url('${manual.capa}')"></div>` : `<div class="man-card-capa man-card-sem"><span>${ico('camera')}</span></div>`;
      html+=`<div class="man-card" onclick="abrirManual('${cond.replace(/'/g,"\\'")}')">
        ${capaImg}
        <div class="man-card-body">
          <div class="man-card-nm">${esc(cond)}</div>
          <div class="man-card-st ${stCls}">${stTxt}</div>
          ${quando ? `<div class="man-card-meta">Última edição: ${quando}${quem?` · ${esc(quem)}`:""}${tipo?` · ${tipo}`:""}</div>` : `<div class="man-card-meta">Clique para criar o manual</div>`}
        </div>
      </div>`;
    }
  });
  html+=`</div>`;
  view.innerHTML = html;
}

async function renderManualSubs(pai){
  const view=document.getElementById("view");
  let filhos = SUBCONDOMINIOS[pai] || [];

  // Filtro por perfil
  const u = state.user || {};
  let condsVisiveis = null;
  if(u.tipo === "sindico"){
    condsVisiveis = await condominiosDoSindico(state.userId);
  } else if(u.tipo === "gestor"){
    condsVisiveis = condsDoGestor();
  }
  if(condsVisiveis !== null){
    filhos = filhos.filter(f => condVisivel(condsVisiveis, nomeCompletoSub(pai, f)));
  }

  let html=`<div class="weeknav">
    <button class="nav-btn" onclick="window.manPaiAtual=null;render()" title="Voltar">‹</button>
    <div><h2>🗂️ ${esc(pai)}</h2><div class="range">Subcondomínios · cada um tem manual próprio</div></div>
  </div>`;
  html+=`<div class="man-grid">`;
  for(const f of filhos){
    const nome = nomeCompletoSub(pai, f);
    const m = await loadManual(nome);
    const status = !m ? "novo" : (m.status||"rascunho");
    const stTxt = status==="pronto" ? "✅ Pronto" : (status==="rascunho" ? "📄 Rascunho" : "➕ Não criado");
    const stCls = status==="pronto" ? "man-st-ok" : (status==="rascunho" ? "man-st-rasc" : "man-st-novo");
    const quando = m && m.atualizadoEm ? new Date(m.atualizadoEm).toLocaleDateString("pt-BR") : "";
    const quem = m && m.atualizadoPor && USUARIOS[m.atualizadoPor] ? USUARIOS[m.atualizadoPor].nome.split(" ")[0] : "";
    const tipo = m ? (m.tipo==="comercial" ? "Comercial" : m.tipo==="loteamento" ? "Loteamento" : m.tipo==="misto" ? "Misto" : "Residencial") : "";
    const capaImg = m && m.capa ? `<div class="man-card-capa" style="background-image:url('${m.capa}')"></div>` : `<div class="man-card-capa man-card-sem"><span>${ico('camera')}</span></div>`;
    html+=`<div class="man-card" onclick="abrirManual('${nome.replace(/'/g,"\\'")}')">
      ${capaImg}
      <div class="man-card-body">
        <div class="man-card-nm">${esc(pai)} <small style="color:var(--muted);font-weight:500">›</small> ${esc(f)}</div>
        <div class="man-card-st ${stCls}">${stTxt}</div>
        ${quando ? `<div class="man-card-meta">Última edição: ${quando}${quem?` · ${esc(quem)}`:""}${tipo?` · ${tipo}`:""}</div>` : `<div class="man-card-meta">Clique para criar o manual</div>`}
      </div>
    </div>`;
  }
  html+=`</div>`;
  view.innerHTML = html;
}

function abrirPaiSub(pai){
  window.manPaiAtual = pai;
  render();
}

function _voltarManual(){
  // Se estamos editando um subcondomínio, volta para a tela do pai
  const cond = window.manState && window.manState.condominio;
  window.manState = null;
  if(cond && cond.includes(" › ")){
    const pai = cond.split(" › ")[0];
    window.manPaiAtual = pai;
  } else {
    window.manPaiAtual = null;
  }
  state.tab='manual';
  render();
}

async function abrirManual(cond){
  let m = await loadManual(cond);
  if(!m){
    // Detecta se é subcondomínio (tem " › " no nome) → tipo herda do pai
    let tipoPadrao = "residencial";
    if(cond.includes(" › ")){
      const partes = cond.split(" › ");
      const pai = partes[0];
      const filho = partes[1];
      // Heurísticas: Trio Office/Mall → comercial; Trio Home → residencial; Le Monde tudo residencial
      if(pai === "Trio"){
        tipoPadrao = (filho === "Home") ? "residencial" : "comercial";
      }
    }
    m = _manualVazio(cond, tipoPadrao);
  }
  window.manState = m;
  window.manAba = "capa";
  renderEditorManual();
}

function renderEditorManual(){
  const m = window.manState;
  const aba = window.manAba || "capa";
  const abas = [
    {k:"capa", l:""+ico('imagem')+" Capa"},
    {k:"identidade", l:"📋 Identidade do prédio"},
    {k:"zelador", l:"👤 Zelador"},
    {k:"contatos", l:"🔌 Contatos"},
    {k:"areas", l:"🏊 Áreas comuns"},
    {k:"reformas", l:"🔧 Mudanças e reformas"},
    {k:"projetos", l:"🪟 Projetos técnicos"},
    {k:"regras", l:"📋 Regras gerais"}
  ];
  const abasHTML = abas.map(a=>`<button class="man-tab ${aba===a.k?'on':''}" onclick="_coletarCamposManual();window.manAba='${a.k}';renderEditorManual()">${a.l}</button>`).join("");
  const view=document.getElementById("view");

  let conteudo = "";
  if(aba==="capa")            conteudo = _manualAbaCapa(m);
  else if(aba==="identidade") conteudo = _manualAbaIdentidade(m);
  else if(aba==="zelador")    conteudo = _manualAbaZelador(m);
  else if(aba==="contatos")   conteudo = _manualAbaContatos(m);
  else if(aba==="areas")      conteudo = _manualAbaAreas(m);
  else if(aba==="reformas")   conteudo = _manualAbaReformas(m);
  else if(aba==="projetos")   conteudo = _manualAbaProjetos(m);
  else if(aba==="regras")     conteudo = _manualAbaRegras(m);

  view.innerHTML = `<div class="weeknav">
    <button class="nav-btn" onclick="_voltarManual()" title="Voltar">‹</button>
    <div><h2>📘 ${esc(m.condominio)}</h2><div class="range">Edite cada seção · ${m.tipo==="comercial"?"Comercial":m.tipo==="loteamento"?"Loteamento":m.tipo==="misto"?"Misto":"Residencial"}</div></div>
    <div class="spacer"></div>
    <label class="btn-ghost" style="cursor:pointer">📥 Importar PDF<input type="file" accept="application/pdf" id="manUpPdf" style="display:none" onchange="importarManualPdf(this.files)"></label>
    <button class="btn-ghost" onclick="visualizarPdfManual()">👁️ Pré-visualizar PDF</button>
    <button class="btn-gold" onclick="salvarManual(false)">💾 Salvar rascunho</button>
    <button class="btn-primary" onclick="salvarManual(true)">✅ Marcar como pronto</button>
  </div>
  <div class="man-tabs">${abasHTML}</div>
  <div class="man-conteudo">${conteudo}</div>`;
  _ligarHandlersManual();
}

function _manualAbaCapa(m){
  const tipoRes = m.tipo==="residencial" ? "checked" : "";
  const tipoCom = m.tipo==="comercial" ? "checked" : "";
  const tipoLot = m.tipo==="loteamento" ? "checked" : "";
  const tipoMis = m.tipo==="misto" ? "checked" : "";
  return `<div class="man-sec">
    <h3>${ico('imagem')} Capa e contracapa do manual</h3>
    <p class="man-hint">Sem foto própria, a primeira página sai com a <b>capa padrão do condomínio</b> (a mesma de "Capas Relatórios", em Gerenciar), já com a faixa "Manual de Boas-Vindas · Mafra Gestão Integrada" no topo. Envie uma foto aqui só se quiser uma capa diferente para este manual.</p>
    <div class="man-capas-row">
      <div class="man-capa-box">
        <div class="man-capa-lbl">📕 Capa (primeira página)</div>
        <div class="man-capa-prev">
          ${m.capa ? `<img src="${m.capa}" alt="Capa">` : `<div class="man-capa-vazia">${ico('imagem')} Sem foto própria — o PDF usa a capa padrão do condomínio</div>`}
        </div>
        <div class="man-capa-acoes">
          <label class="btn-ghost man-up-btn">${ico('camera')} ${m.capa?'Trocar':'Enviar foto'}<input type="file" accept="image/*" id="manUpCapa" style="display:none"></label>
          ${m.capa?`<button class="btn-del hd-mini" onclick="window.manState.capa='';renderEditorManual()">🗑️ Remover</button>`:""}
        </div>
      </div>
      <div class="man-capa-box">
        <div class="man-capa-lbl">📗 Contracapa (última página)</div>
        <div class="man-capa-prev">
          ${m.contracapa ? `<img src="${m.contracapa}" alt="Contracapa">` : (m.capa ? `<div class="man-capa-vazia man-capa-fallback"><span>${ico('camera')} Sem contracapa</span><small>Vai usar a foto da capa</small></div>` : `<div class="man-capa-vazia">${ico('camera')} Nenhuma contracapa ainda</div>`)}
        </div>
        <div class="man-capa-acoes">
          <label class="btn-ghost man-up-btn">${ico('camera')} ${m.contracapa?'Trocar':'Enviar foto'}<input type="file" accept="image/*" id="manUpContracapa" style="display:none"></label>
          ${m.contracapa?`<button class="btn-del hd-mini" onclick="window.manState.contracapa='';renderEditorManual()">🗑️ Remover</button>`:""}
        </div>
      </div>
    </div>
    <p class="man-hint" style="margin-top:8px;font-size:11.5px">💡 Se você não enviar contracapa, ela usa a mesma foto da capa. Sem nenhuma foto própria, sai a contracapa padrão do condomínio (a mesma de "Capas Relatórios").</p>
    <h3 style="margin-top:24px">📐 Tipo do manual</h3>
    <p class="man-hint">Define o conjunto padrão de áreas comuns sugeridas, nomenclatura (zelador vs gerente) e textos.</p>
    <div class="seg" style="max-width:600px;flex-wrap:wrap">
      <label><input type="radio" name="manTipo" value="residencial" ${tipoRes}><span>🏠 Residencial</span></label>
      <label><input type="radio" name="manTipo" value="comercial" ${tipoCom}><span>${ico('predio')} Comercial</span></label>
      <label><input type="radio" name="manTipo" value="loteamento" ${tipoLot}><span>🌳 Loteamento</span></label>
      <label><input type="radio" name="manTipo" value="misto" ${tipoMis}><span>🏘️ Misto</span></label>
    </div>
    <div style="font-size:11.5px;color:var(--muted);margin-top:8px;line-height:1.5">
      • <b>Residencial</b>: apartamentos com áreas comuns (piscina, salão, churrasqueira…)<br>
      • <b>Comercial</b>: salas comerciais (foco em garagem, ar-condicionado central, valet)<br>
      • <b>Loteamento</b>: associação de moradores (casas) com gerente, cartilha de obras<br>
      • <b>Misto</b>: empreendimento com unidades residenciais E comerciais
    </div>
  </div>`;
}

function _manualAbaIdentidade(m){
  return `<div class="man-sec">
    <h3>📋 Identidade do prédio</h3>
    <p class="man-hint">Esses dados aparecem na capa e em outras páginas do manual.</p>
    <div class="field"><label>Nome do condomínio</label>
      <input type="text" value="${esc(m.condominio)}" disabled style="background:#f4f6fa;color:#666">
      <div style="font-size:11px;color:var(--muted);margin-top:4px">O nome é gerenciado em "Gerenciar > Condomínios"</div>
    </div>
    <div class="field"><label>App do condomínio</label>
      <input type="text" id="manApp" value="${esc(m.appCondominio||'Condomob')}" placeholder="Condomob, Suacond, etc.">
      <div style="font-size:11px;color:var(--muted);margin-top:4px">O nome do app aparece nas instruções de reservas, mudanças, atas, etc.</div>
    </div>
    <div class="field"><label>Link do Sindigest (ouvidoria)</label>
      <input type="text" id="manSindigest" value="${esc(m.sindigestUrl||'')}" placeholder="https://sindigest.com.br/client/seuconddiv/issue">
    </div>
  </div>`;
}

function _manualAbaZelador(m){
  const z=m.zelador||{};
  return `<div class="man-sec">
    <h3>👤 Zelador / Zeladora</h3>
    <p class="man-hint">Dados do(a) zelador(a) do condomínio. A foto aparece destacada no manual.</p>
    <div class="man-foto-wrap">
      ${z.foto?`<img class="man-foto" src="${z.foto}">`:'<div class="man-foto-vazia">'+ico('camera')+'</div>'}
      <label class="btn-ghost">${ico('camera')} ${z.foto?'Trocar foto':'Enviar foto'}<input type="file" accept="image/*" id="manUpZelador" style="display:none"></label>
      ${z.foto?`<button class="btn-del hd-mini" onclick="window.manState.zelador.foto='';renderEditorManual()">🗑️</button>`:""}
    </div>
    <div class="field"><label>Nome completo</label>
      <input type="text" id="manZelNome" value="${esc(z.nome||'')}" placeholder="Ex.: Elisa Emanuele">
    </div>
    <div class="row2">
      <div class="field"><label>Telefone / WhatsApp</label>
        <input type="text" id="manZelTel" value="${esc(z.contato||'')}" placeholder="(16) 99749-8762">
      </div>
      <div class="field"><label>E-mail</label>
        <input type="text" id="manZelEmail" value="${esc(z.email||'')}" placeholder="zeladorcondominio@gmail.com">
      </div>
    </div>
    <div class="field"><label>Horário de trabalho</label>
      <textarea id="manZelHorario" rows="2" placeholder="De segunda à sexta 8h às 17h&#10;Sábado: 08h às 12h">${esc(z.horario||'')}</textarea>
    </div>
    <div class="field"><label>Endereço do condomínio</label>
      <input type="text" id="manZelEnd" value="${esc(z.endereco||'')}" placeholder="Rua: ..., 250, Bairro">
    </div>
  </div>`;
}

function _manualAbaContatos(m){
  const a=m.administradora||{}, c=m.construtora||{}, e=m.energia||{}, g=m.gas||{};
  const inets = (m.internet||[]).map((i,idx)=>`<div class="man-inet-row">
    <input type="text" placeholder="Provedor (ex.: Vivo)" value="${esc(i.provedor||'')}" oninput="window.manState.internet[${idx}].provedor=this.value">
    <input type="text" placeholder="Telefone" value="${esc(i.contato||'')}" oninput="window.manState.internet[${idx}].contato=this.value">
    <input type="text" placeholder="WhatsApp (opcional)" value="${esc(i.whatsapp||'')}" oninput="window.manState.internet[${idx}].whatsapp=this.value">
    <button class="btn-del hd-mini" onclick="window.manState.internet.splice(${idx},1);renderEditorManual()">×</button>
  </div>`).join("");
  return `<div class="man-sec">
    <h3>⚡ Energia elétrica</h3>
    <div class="row2">
      <div class="field"><label>Fornecedora</label><input type="text" id="manEnergFor" value="${esc(e.fornecedora||'CPFL')}"></div>
      <div class="field"><label>Tipo de fornecimento</label><input type="text" id="manEnergTipo" value="${esc(e.fornecimento||'Trifásico')}"></div>
    </div>
    <div class="field"><label>Site da fornecedora</label><input type="text" id="manEnergSite" value="${esc(e.site||'')}" placeholder="https://www.cpfl.com.br/"></div>
    <div class="field"><label>Passo a passo da habilitação</label>
      <textarea id="manEnergPassos" rows="5" placeholder="1° ...">${esc(e.passos||'')}</textarea>
    </div>
  </div>
  <div class="man-sec">
    <h3>🔥 Gás</h3>
    <div class="row2">
      <div class="field"><label>Fornecedora</label><input type="text" id="manGasFor" value="${esc(g.fornecedora||'')}" placeholder="Necta, Comgás, etc."></div>
      <div class="field"><label>Telefone</label><input type="text" id="manGasTel" value="${esc(g.telefone||'')}" placeholder="0800 773 6099"></div>
    </div>
    <div class="field"><label>Tipo de gás</label><input type="text" id="manGasTipo" value="${esc(g.tipo||'')}" placeholder="Gás natural encanado (GN) ou GLP"></div>
    <div class="field"><label>Observação</label><textarea id="manGasObs" rows="2">${esc(g.obs||'')}</textarea></div>
  </div>
  <div class="man-sec">
    <h3>${ico('predio')} Administradora</h3>
    <div class="field"><label>Nome</label><input type="text" id="manAdmNome" value="${esc(a.nome||'')}" placeholder="Etikon Assessoria Contábil Ltda"></div>
    <div class="field"><label>Endereço</label><input type="text" id="manAdmEnd" value="${esc(a.endereco||'')}"></div>
    <div class="row2">
      <div class="field"><label>Telefone</label><input type="text" id="manAdmTel" value="${esc(a.telefone||'')}"></div>
      <div class="field"><label>WhatsApp</label><input type="text" id="manAdmWa" value="${esc(a.whatsapp||'')}"></div>
    </div>
    <div class="field"><label>E-mail</label><input type="text" id="manAdmEmail" value="${esc(a.email||'')}"></div>
  </div>
  <div class="man-sec">
    <h3>🏗️ Construtora</h3>
    <div class="field"><label>Nome</label><input type="text" id="manCnsNome" value="${esc(c.nome||'')}" placeholder="Stéfani Nogueira"></div>
    <div class="field"><label>Endereço</label><input type="text" id="manCnsEnd" value="${esc(c.endereco||'')}"></div>
    <div class="field"><label>Telefone</label><input type="text" id="manCnsTel" value="${esc(c.telefone||'')}"></div>
  </div>
  <div class="man-sec">
    <h3>🌐 Internet</h3>
    <p class="man-hint">Adicione um ou mais provedores disponíveis no condomínio.</p>
    ${inets || '<div class="man-vazio">Nenhum provedor cadastrado.</div>'}
    <button class="btn-ghost" style="margin-top:8px" onclick="window.manState.internet=window.manState.internet||[];window.manState.internet.push({provedor:'',contato:'',whatsapp:''});renderEditorManual()">＋ Adicionar provedor</button>
  </div>`;
}

function _manualAbaAreas(m){
  m.areasComuns = m.areasComuns || [];
  const itens = AREAS_CATALOGO.map(cat=>{
    const existente = m.areasComuns.find(a=>a.tipo===cat.k);
    const ativa = !!existente;
    return `<div class="man-area-row ${ativa?'man-area-on':''}">
      <label class="man-area-chk">
        <input type="checkbox" ${ativa?'checked':''} onchange="_toggleArea('${cat.k}','${cat.padraoHorario.replace(/'/g,"\\'")}')">
        <span class="man-area-l">${cat.l}</span>
      </label>
      ${ativa?`<div class="man-area-edit">
        <div class="field"><label>Horário de funcionamento</label>
          <input type="text" value="${esc(existente.horario||'')}" placeholder="Ex.: 6h às 22h" oninput="_setArea('${cat.k}','horario',this.value)">
        </div>
        <div class="field"><label>Regras específicas <small style="font-weight:400;text-transform:none;color:var(--muted)">(opcional — substitui o padrão Mafra para esta área)</small></label>
          <textarea rows="3" placeholder="Deixe em branco para usar o texto padrão" oninput="_setArea('${cat.k}','regras',this.value)">${esc(existente.regras||'')}</textarea>
        </div>
      </div>`:""}
    </div>`;
  }).join("");
  return `<div class="man-sec">
    <h3>🏊 Áreas comuns do condomínio</h3>
    <p class="man-hint">Marque as áreas que existem neste condomínio. Cada área pode ter horário e regras personalizadas — se deixar em branco, o manual usa o texto padrão Mafra.</p>
    ${itens}
  </div>`;
}

function _toggleArea(k, padraoHorario){
  const m = window.manState;
  const i = m.areasComuns.findIndex(a=>a.tipo===k);
  if(i>=0) m.areasComuns.splice(i,1);
  else m.areasComuns.push({tipo:k, ativa:true, horario:padraoHorario||"", regras:""});
  renderEditorManual();
}

function _setArea(k, campo, valor){
  const m = window.manState;
  const a = m.areasComuns.find(x=>x.tipo===k);
  if(a){ a[campo]=valor; }
}

function _manualAbaReformas(m){
  const r = m.reformas || {};
  const el = r.elevador || {};
  return `<div class="man-sec">
    <h3>📦 Mudanças</h3>
    <div class="row2">
      <div class="field"><label>Horário seg-sex</label>
        <input type="text" id="manMudSemana" value="${esc(r.horarioMudancaSemana||'')}" placeholder="08h às 11:30h ou 13h às 16:30h">
      </div>
      <div class="field"><label>Horário sábado</label>
        <input type="text" id="manMudSabado" value="${esc(r.horarioMudancaSabado||'')}" placeholder="8h às 11h">
      </div>
    </div>
    <h4 style="margin-top:18px;color:var(--navy);font-size:14px">Medidas do elevador de serviço</h4>
    <div class="row2">
      <div class="field"><label>Porta — Altura</label><input type="text" id="manElPortaAlt" value="${esc(el.portaAlt||'')}" placeholder="2.00 m"></div>
      <div class="field"><label>Porta — Largura</label><input type="text" id="manElPortaLarg" value="${esc(el.portaLarg||'')}" placeholder="0,90 m"></div>
    </div>
    <div class="row2">
      <div class="field"><label>Cabina — Altura</label><input type="text" id="manElCabAlt" value="${esc(el.cabinaAlt||'')}" placeholder="2.20 m"></div>
      <div class="field"><label>Cabina — Largura</label><input type="text" id="manElCabLarg" value="${esc(el.cabinaLarg||'')}" placeholder="1.60 m"></div>
    </div>
    <div class="row2">
      <div class="field"><label>Cabina — Comprimento</label><input type="text" id="manElCabComp" value="${esc(el.cabinaComp||'')}" placeholder="1.50 m"></div>
      <div class="field"><label>Peso máximo</label><input type="text" id="manElPeso" value="${esc(el.peso||'')}" placeholder="1.125 quilos"></div>
    </div>
  </div>
  <div class="man-sec">
    <h3>🔧 Obras e reformas</h3>
    <div class="field"><label>E-mail do zelador (para envio de documentação)</label>
      <input type="text" id="manRefEmail" value="${esc(r.emailZelador||'')}" placeholder="zeladorcondominio@gmail.com">
    </div>
    <div class="row2">
      <div class="field"><label>Prazo de análise</label>
        <input type="text" id="manRefPrazo" value="${esc(r.prazoAnalise||'7 dias')}">
      </div>
      <div class="field"><label>Horário permitido para obras</label>
        <input type="text" id="manRefHorario" value="${esc(r.horarioObras||'Segunda a sexta, das 8h às 17h')}">
      </div>
    </div>
    <div class="field"><label>Observações adicionais (opcional)</label>
      <textarea id="manRefObs" rows="3" placeholder="Notas específicas deste condomínio sobre reformas">${esc(r.obsExtra||'')}</textarea>
    </div>
  </div>`;
}

function _manualAbaProjetos(m){
  m.projetosTecnicos = m.projetosTecnicos || [];
  const itens = m.projetosTecnicos.map((p,idx)=>`<div class="man-proj-card">
    ${p.imagem?`<img src="${p.imagem}">`:'<div class="man-proj-sem">'+ico('camera')+' Sem imagem</div>'}
    <input type="text" placeholder="Título (ex.: Envidraçamento - Projeto 01)" value="${esc(p.titulo||'')}" oninput="window.manState.projetosTecnicos[${idx}].titulo=this.value">
    <textarea rows="3" placeholder="Descrição (especificações técnicas, normas, etc.)" oninput="window.manState.projetosTecnicos[${idx}].descricao=this.value">${esc(p.descricao||'')}</textarea>
    <div class="man-proj-acoes">
      <label class="btn-ghost hd-mini">${ico('camera')} ${p.imagem?'Trocar':'Enviar'}<input type="file" accept="image/*" style="display:none" onchange="_upProj(${idx}, this.files)"></label>
      <button class="btn-del hd-mini" onclick="window.manState.projetosTecnicos.splice(${idx},1);renderEditorManual()">🗑️ Remover</button>
    </div>
  </div>`).join("");
  return `<div class="man-sec">
    <h3>🪟 Projetos técnicos (opcional)</h3>
    <p class="man-hint">Anexe imagens com plantas, projetos de climatização, modelos de envidraçamento, persianas padrão, telas de proteção, etc.</p>
    <div class="man-proj-grid">${itens || '<div class="man-vazio">Nenhum projeto técnico ainda.</div>'}</div>
    <button class="btn-ghost" style="margin-top:10px" onclick="window.manState.projetosTecnicos.push({titulo:'',descricao:'',imagem:''});renderEditorManual()">＋ Adicionar projeto técnico</button>
  </div>`;
}

async function _upProj(idx, files){
  if(!files || !files[0]) return;
  try{
    const img = await comprimirImagem(files[0], 1400, 0.8);
    window.manState.projetosTecnicos[idx].imagem = img.foto;
    renderEditorManual();
  }catch(e){ alert("Não consegui processar a imagem."); }
}

function _manualAbaRegras(m){
  return `<div class="man-sec">
    <h3>🔇 Lei do Silêncio</h3>
    <div class="field"><label>Texto</label>
      <textarea id="manLeiSil" rows="3">${esc(m.leiSilencio||'')}</textarea>
    </div>
  </div>
  <div class="man-sec">
    <h3>🛡️ Dicas rápidas de segurança</h3>
    <div class="field"><label>Texto</label>
      <textarea id="manDicasSeg" rows="5">${esc(m.dicasSeguranca||'')}</textarea>
    </div>
  </div>`;
}

function _ligarHandlersManual(){
  const up = id => { const el=document.getElementById(id); if(el) el.addEventListener("change", async e=>{
    if(!e.target.files || !e.target.files[0]) return;
    try{
      const img = await comprimirImagem(e.target.files[0], 1400, 0.82);
      if(id==="manUpCapa") window.manState.capa = img.foto;
      else if(id==="manUpContracapa") window.manState.contracapa = img.foto;
      else if(id==="manUpZelador") window.manState.zelador.foto = img.foto;
      renderEditorManual();
    }catch(err){ alert("Não consegui processar a imagem."); }
  });};
  up("manUpCapa"); up("manUpContracapa"); up("manUpZelador");
  // Tipo (residencial/comercial)
  document.querySelectorAll('input[name="manTipo"]').forEach(r=>r.addEventListener("change", ()=>{
    window.manState.tipo = r.value; // só atualiza state, não re-renderiza
  }));
}

function _coletarCamposManual(){
  const m = window.manState;
  const g = id => (document.getElementById(id)||{}).value;
  if(document.getElementById("manApp")) m.appCondominio = g("manApp");
  if(document.getElementById("manSindigest")) m.sindigestUrl = g("manSindigest");
  if(document.getElementById("manZelNome")){
    m.zelador.nome = g("manZelNome"); m.zelador.contato = g("manZelTel"); m.zelador.email = g("manZelEmail");
    m.zelador.horario = g("manZelHorario"); m.zelador.endereco = g("manZelEnd");
  }
  if(document.getElementById("manEnergFor")){
    m.energia.fornecedora = g("manEnergFor"); m.energia.fornecimento = g("manEnergTipo");
    m.energia.site = g("manEnergSite"); m.energia.passos = g("manEnergPassos");
  }
  if(document.getElementById("manGasFor")){
    m.gas.fornecedora = g("manGasFor"); m.gas.telefone = g("manGasTel");
    m.gas.tipo = g("manGasTipo"); m.gas.obs = g("manGasObs");
  }
  if(document.getElementById("manAdmNome")){
    m.administradora.nome = g("manAdmNome"); m.administradora.endereco = g("manAdmEnd");
    m.administradora.telefone = g("manAdmTel"); m.administradora.whatsapp = g("manAdmWa"); m.administradora.email = g("manAdmEmail");
  }
  if(document.getElementById("manCnsNome")){
    m.construtora.nome = g("manCnsNome"); m.construtora.endereco = g("manCnsEnd"); m.construtora.telefone = g("manCnsTel");
  }
  if(document.getElementById("manMudSemana")){
    m.reformas.horarioMudancaSemana = g("manMudSemana"); m.reformas.horarioMudancaSabado = g("manMudSabado");
    m.reformas.elevador.portaAlt = g("manElPortaAlt"); m.reformas.elevador.portaLarg = g("manElPortaLarg");
    m.reformas.elevador.cabinaAlt = g("manElCabAlt"); m.reformas.elevador.cabinaLarg = g("manElCabLarg");
    m.reformas.elevador.cabinaComp = g("manElCabComp"); m.reformas.elevador.peso = g("manElPeso");
    m.reformas.emailZelador = g("manRefEmail"); m.reformas.prazoAnalise = g("manRefPrazo");
    m.reformas.horarioObras = g("manRefHorario"); m.reformas.obsExtra = g("manRefObs");
  }
  if(document.getElementById("manLeiSil")) m.leiSilencio = g("manLeiSil");
  if(document.getElementById("manDicasSeg")) m.dicasSeguranca = g("manDicasSeg");
}

async function salvarManual(marcarPronto){
  _coletarCamposManual();
  const m = window.manState;
  if(marcarPronto) m.status = "pronto";
  else m.status = "rascunho";
  await saveManual(m.condominio, m);
  alert(marcarPronto ? "✅ Manual marcado como PRONTO!" : "💾 Rascunho salvo.");
  if(marcarPronto){ window.manState=null; state.tab="manual"; render(); }
}

async function visualizarPdfManual(){
  _coletarCamposManual();
  const m = window.manState;
  const padrao = await loadManualPadrao();
  // capa padrão do condomínio (a mesma arte do relatório gerencial) — usada quando o manual não tem foto própria
  let capaPadraoCond = "";
  let contraPadraoCond = "";
  try{ const cp = await capasResolvidas(m.condominio); capaPadraoCond = (cp && cp.capa) || ""; contraPadraoCond = (cp && cp.contracapa) || ""; }catch(e){}
  const html = _gerarHtmlManual(m, padrao, capaPadraoCond, contraPadraoCond);
  // Abre em nova janela para imprimir/salvar como PDF
  const w = window.open("", "_blank");
  if(!w){ alert("O navegador bloqueou a janela. Permita pop-ups para visualizar o PDF."); return; }
  w.document.write(html);
  w.document.close();
}

function _gerarHtmlManual(m, padrao, capaPadraoCond, contraPadraoCond){
  const cond = m.condominio;
  const navy = "#16243D";
  const gold = "#C9A24B";
  const capa = m.capa || "";
  // Página inicial (capa)
  // 1) Se há a capa padrão do condomínio (a mesma do relatório gerencial) e o manual NÃO tem foto própria:
  //    a arte ocupa a página inteira e recebe a faixa do topo "MANUAL DE BOAS-VINDAS" + "MAFRA GESTÃO INTEGRADA" (mesmo padrão da capa da vistoria)
  //    (a arte já traz a foto, o nome do condomínio e o logo Mafra).
  // 2) Se o manual tem foto própria (m.capa), o layout montado de sempre continua valendo.
  let paginas = "";
  if(!capa && capaPadraoCond){
    paginas += `<div class="page page-capa page-capa-arte" style="background-image:url('${capaPadraoCond}')">
      <div class="capa-topo-manual">
        <div class="capa-topo-titulo">MANUAL DE BOAS-VINDAS</div>
        <div class="capa-topo-sub">MAFRA GESTÃO INTEGRADA</div>
      </div>
    </div>`;
  } else {
    paginas += `<div class="page page-capa">
    ${capa?`<div class="capa-img" style="background-image:url('${capa}')"></div>`:`<div class="capa-img capa-vazia">[ Capa do condomínio ]</div>`}
    <div class="capa-overlay">
      <div class="capa-titulo">MANUAL DE<br>BOAS-VINDAS</div>
      <div class="capa-cond">${esc(cond.toUpperCase())}</div>
      <div class="capa-mafra">MAFRA<br><small>GESTÃO INTEGRADA</small></div>
    </div>
  </div>`;
  }
  // Boas-vindas
  paginas += `<div class="page">
    <div class="page-h">Prezado(a) Condômino(a),</div>
    <p class="page-lead">Seja bem-vindo(a) ao <b>${esc(cond)}</b></p>
    ${_paragrafos(padrao.cartaBoasVindas)}
    <p style="margin-top:24px">Cordialmente,</p>
    <p style="margin-top:18px"><b>Equipe Mafra Gestão Integrada</b><br><i>Síndico Profissional</i></p>
  </div>`;
  // Síndico Profissional + Diretoria
  paginas += `<div class="page">
    <div class="page-h2"><b>SÍNDICO PROFISSIONAL:</b> MAFRA GESTÃO INTEGRADA</div>
    ${_paragrafos(padrao.sobreSindico)}
    <div class="page-h3 center">DIRETORIA</div>
    ${(padrao.diretoria||[]).map(d=>`<div class="pessoa-row">
      ${d.foto?`<img class="pessoa-foto" src="${d.foto}">`:'<div class="pessoa-foto-vazia">'+ico('camera')+'</div>'}
      <div class="pessoa-body"><div class="pessoa-nm">${esc(d.nome.toUpperCase())}:</div>
        <div class="pessoa-bio">${esc(d.bio||'')}</div></div>
    </div>`).join("")}
  </div>`;
  // Administrativo
  paginas += `<div class="page">
    <div class="page-h center">ADMINISTRATIVO</div>
    ${_paragrafos(padrao.sobreAdministrativo)}
    <div class="equipe-grid">
      ${(padrao.administrativo||[]).map(p=>`<div class="equipe-card">
        ${p.foto?`<img src="${p.foto}">`:'<div class="equipe-vazio">'+ico('camera')+'</div>'}
        <div class="equipe-nm">${esc(p.nome)}</div>
        <div class="equipe-cg">${esc(p.cargo)}</div>
      </div>`).join("")}
    </div>
    <div class="page-h3 center" style="margin-top:30px">NOSSO CONTATO:</div>
    <p><b>Contato:</b> ${esc(padrao.contatoMafra||'')}</p>
    <p><b>Site:</b> ${esc(padrao.siteMafra||'')}</p>
    <p><b>E-mail:</b> ${esc(padrao.emailMafra||'')}</p>
    ${m.sindigestUrl?`<p><b>Queremos te ouvir:</b><br>${esc(m.sindigestUrl)}</p>`:""}
  </div>`;
  // Síndico Operacional
  paginas += `<div class="page">
    <div class="page-h center">SÍNDICO OPERACIONAL</div>
    ${_paragrafos(padrao.sobreSindicoOperacional)}
    <div class="equipe-grid">
      ${(padrao.sindicosOperacionais||[]).map(p=>`<div class="equipe-card">
        ${p.foto?`<img src="${p.foto}">`:'<div class="equipe-vazio">'+ico('camera')+'</div>'}
        <div class="equipe-nm">${esc(p.nome)}</div>
        <div class="equipe-cg">${esc(p.cargo)}</div>
      </div>`).join("")}
    </div>
    <div class="page-h center" style="margin-top:24px">ZELADORIA</div>
    ${_paragrafos(padrao.sobreZeladoria)}
  </div>`;
  // Pessoas do condomínio + Contatos
  const z = m.zelador||{};
  paginas += `<div class="page">
    <div class="num-h">1. COLABORADORES:</div>
    <div class="pessoa-row">
      ${z.foto?`<img class="pessoa-foto" src="${z.foto}">`:'<div class="pessoa-foto-vazia">'+ico('camera')+'</div>'}
      <div class="pessoa-body">
        <p><b>Zelador(a):</b> ${esc(z.nome||'—')}</p>
        <p><b>Contato:</b> ${esc(z.contato||'—')}</p>
        <p><b>E-mail:</b> ${esc(z.email||'—')}</p>
        <p><b>Horário de Trabalho:</b><br>${esc(z.horario||'').replace(/\n/g,"<br>")}</p>
        ${z.endereco?`<p><b>Endereço:</b> ${esc(z.endereco)}</p>`:""}
      </div>
    </div>
    <div class="num-h">2. HABILITAÇÃO DE ENERGIA E GÁS:</div>
    <p>Solicitar no site da ${esc(m.energia.fornecedora||'CPFL')} e para a ${esc(m.gas.fornecedora||'fornecedora de gás')} a ligação de energia e gás para a unidade.</p>
    ${m.energia.site?`<p><b>SITE DA ${esc((m.energia.fornecedora||'').toUpperCase())}:</b> ${esc(m.energia.site)}</p>`:""}
    ${m.energia.fornecimento?`<p><b>Fornecimento de energia:</b> ${esc(m.energia.fornecimento)}</p>`:""}
    ${m.energia.passos?`<p><b>Passo a passo:</b></p>${_paragrafos(m.energia.passos)}`:""}
    ${m.gas.fornecedora?`<p style="margin-top:14px"><b>${esc(m.gas.fornecedora.toUpperCase())} – GÁS:</b><br><b>Tel.:</b> ${esc(m.gas.telefone||'—')}</p>`:""}
    ${m.gas.obs?`<p><b>Obs:</b> ${esc(m.gas.obs)}</p>`:""}
  </div>`;
  // Administradora, Construtora, Internet, Atas
  const a=m.administradora||{}, c=m.construtora||{};
  paginas += `<div class="page">
    <div class="num-h">3. DADOS DA ADMINISTRADORA:</div>
    ${a.nome?`<p><b>${esc(a.nome)}</b></p>`:""}
    ${a.endereco?`<p><b>Endereço:</b> ${esc(a.endereco)}</p>`:""}
    ${(a.telefone||a.whatsapp)?`<p><b>Telefone:</b> ${esc(a.telefone||'—')}${a.whatsapp?` / <b>WhatsApp:</b> ${esc(a.whatsapp)}`:""}</p>`:""}
    ${a.email?`<p><b>E-mail:</b> ${esc(a.email)}</p>`:""}
    ${c.nome?`<div class="num-h">4. CONSTRUTORA ${esc(c.nome.toUpperCase())}:</div>
      ${c.endereco?`<p><b>Endereço:</b> ${esc(c.endereco)}</p>`:""}
      ${c.telefone?`<p><b>Tel.:</b> ${esc(c.telefone)}</p>`:""}`:""}
    ${(m.internet||[]).length?`<div class="num-h">5. INTERNET:</div>
      ${m.internet.map(i=>`<p><b>Contato ${esc(i.provedor||'—')}:</b> ${esc(i.contato||'—')}${i.whatsapp?` / <b>WhatsApp:</b> ${esc(i.whatsapp)}`:""}</p>`).join("")}`:""}
    <div class="num-h">6. ATAS, REGIMENTO INTERNO E CONVENÇÃO DO CONDOMÍNIO</div>
    <p>As Atas, Regimento Interno e Convenção estarão sempre disponíveis para consulta no <b>aplicativo ${esc(m.appCondominio||'Condomob')}</b>. As regras do condomínio são fundamentais para a boa convivência entre os moradores, pois elas garantem o respeito mútuo e a ordem.</p>
  </div>`;
  // Mudanças
  const r=m.reformas||{}, el=r.elevador||{};
  paginas += `<div class="page">
    <div class="num-h">7. MUDANÇAS, ENTREGAS DE MERCADORIA E OBRAS</div>
    <p><b>a) Autorização de mudança (Entrada ou Saída):</b></p>
    <ul>
      <li>O condômino deverá entrar em contato com a Administradora ${a.nome?esc(a.nome.split(" ")[0]):"do condomínio"}, solicitar a autorização de mudança.</li>
      <li>Será emitido um documento que deverá ser entregue/enviado para o zelador.</li>
      <li>O agendamento da mudança deverá ser feito exclusivamente pelo aplicativo <b>${esc(m.appCondominio||'Condomob')}</b>, com pelo menos 2 dias de antecedência.</li>
    </ul>
    ${(r.horarioMudancaSemana||r.horarioMudancaSabado)?`<p><b>Horário permitido:</b> ${esc(r.horarioMudancaSemana||'')}${r.horarioMudancaSabado?` · sábado: ${esc(r.horarioMudancaSabado)}`:""}, proibido domingos e feriados.</p>`:""}
    ${(el.portaAlt||el.cabinaAlt)?`<p><b>Medidas do elevador de serviço:</b></p>
      <ul>
        ${el.portaAlt?`<li>Dimensão da porta: ${esc(el.portaAlt)} (altura) x ${esc(el.portaLarg||'—')} (largura)</li>`:""}
        ${el.cabinaAlt?`<li>Medidas da cabina: ${esc(el.cabinaAlt)} (altura) x ${esc(el.cabinaLarg||'—')} (largura) x ${esc(el.cabinaComp||'—')} (comprimento)</li>`:""}
        ${el.peso?`<li>Peso máximo: ${esc(el.peso)}</li>`:""}
      </ul>`:""}
    <p><b>b) Entrega de Mercadorias:</b></p>
    <ul>
      <li>Encomendas de pequeno e médio porte serão entregues na portaria.</li>
      <li>Encomendas de grande porte só serão recebidas pelo proprietário ou responsável pela unidade.</li>
      <li>O condomínio não se responsabiliza por armazenamento de mercadorias e produtos perecíveis.</li>
      <li>Entregas delivery devem ser recebidas exclusivamente na Portaria pelo solicitante.</li>
    </ul>
    <p><b>c) Obras, Manutenção e Reformas:</b></p>
    ${r.emailZelador?`<p>Antes de iniciar qualquer obra, comunique por e-mail <b>${esc(r.emailZelador)}</b> ao Zelador.</p>`:""}
    ${r.horarioObras?`<p><b>Horário permitido para obras:</b> ${esc(r.horarioObras)}.</p>`:""}
    ${r.prazoAnalise?`<p>Prazo de análise de documentação: <b>${esc(r.prazoAnalise)}</b>.</p>`:""}
    ${r.obsExtra?`<p>${esc(r.obsExtra)}</p>`:""}
  </div>`;

  // Áreas comuns (uma página a cada 2-3 áreas)
  const areasInfo = (m.areasComuns||[]).map(a=>{
    const cat = AREAS_CATALOGO.find(c=>c.k===a.tipo);
    return {label: cat?cat.l:a.tipo, horario:a.horario, regras:a.regras||_regrasPadraoArea(a.tipo)};
  });
  if(areasInfo.length){
    let nAreas = 8;
    paginas += `<div class="page">`;
    areasInfo.forEach((ar, idx)=>{
      paginas += `<div class="num-h">${nAreas+idx}. ${esc(ar.label.toUpperCase())}</div>`;
      if(ar.horario) paginas += `<p><b>Horário:</b> ${esc(ar.horario)}</p>`;
      paginas += _paragrafos(ar.regras);
      // Quebra de página a cada ~3 áreas
      if((idx+1) % 3 === 0 && idx !== areasInfo.length-1){
        paginas += `</div><div class="page">`;
      }
    });
    paginas += `</div>`;
  }
  // Projetos técnicos
  if((m.projetosTecnicos||[]).length){
    m.projetosTecnicos.forEach(p=>{
      paginas += `<div class="page">
        <div class="num-h">${esc(p.titulo||'Projeto técnico')}</div>
        ${p.descricao?_paragrafos(p.descricao):""}
        ${p.imagem?`<img class="proj-img" src="${p.imagem}">`:""}
      </div>`;
    });
  }
  // Lei do silêncio + dicas de segurança
  paginas += `<div class="page">
    <div class="page-h">LEI DO SILÊNCIO</div>
    ${_paragrafos(m.leiSilencio)}
    <div class="page-h" style="margin-top:30px">DICAS RÁPIDAS DE SEGURANÇA</div>
    ${_paragrafos(m.dicasSeguranca)}
  </div>`;
  // Contracapa (capa traseira robusta — espelha a capa frontal)
  const fotoContracapa = m.contracapa || capa; // se não tem contracapa, usa a capa
  if(!fotoContracapa && contraPadraoCond){
    // sem foto própria: fecha com a contracapa do condomínio (a mesma de Capas Relatórios), arte inteira, sem sobreposição
    paginas += `<div class="page page-capa page-capa-arte" style="background-image:url('${contraPadraoCond}')"></div>`;
  } else
  paginas += `<div class="page page-capa page-contracapa">
    <div class="contracapa-overlay">
      <div class="contracapa-mafra">MAFRA<br><small>GESTÃO INTEGRADA</small></div>
      <div class="contracapa-titulo">OBRIGADO(A)<br>POR CONFIAR<br>NA MAFRA</div>
      <div class="contracapa-cond">${esc(cond.toUpperCase())}</div>
      <div class="contracapa-redes">
        <div class="cc-rede">🌐 ${esc((padrao.siteMafra||'').replace(/^https?:\/\//,''))}</div>
        <div class="cc-rede">✉️ ${esc(padrao.emailMafra||'')}</div>
        <div class="cc-rede">${ico('camera')} ${esc(padrao.instagram||'')}</div>
        <div class="cc-rede">▶️ ${esc(padrao.youtube||'')}</div>
      </div>
    </div>
    ${fotoContracapa?`<div class="contracapa-img" style="background-image:url('${fotoContracapa}')"></div>`:`<div class="contracapa-img contracapa-vazia">[ Foto do condomínio ]</div>`}
  </div>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Manual de Boas-Vindas — ${esc(cond)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#e8eaef;color:#2a2a2a;line-height:1.55}
  .page{width:210mm;min-height:297mm;background:#fff;margin:14px auto;padding:22mm 18mm;page-break-after:always;position:relative;box-shadow:0 4px 20px rgba(0,0,0,.1)}
  .page::before{content:"";position:absolute;top:0;right:0;width:100mm;height:60mm;background:linear-gradient(135deg,${navy} 50%,transparent 50%);opacity:.05;border-radius:0 0 0 100%}
  .page::after{content:"";position:absolute;bottom:30mm;left:8mm;width:30mm;height:90mm;background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 200'><rect x='10' y='10' width='80' height='180' fill='none' stroke='%2316243D' stroke-width='2' opacity='.15'/></svg>") no-repeat;opacity:.6}
  .page-capa{padding:0;overflow:hidden;background:${navy}}
  .capa-img{width:100%;height:130mm;background-size:cover;background-position:center;clip-path:polygon(0 0,100% 0,100% 92%,50% 100%,0 92%)}
  .page-capa-arte{min-height:297mm;background-size:cover;background-position:center;position:relative}
  .capa-topo-manual{position:absolute;top:0;left:0;right:0;padding:46px 30px 80px;text-align:center;background:linear-gradient(180deg,rgba(6,16,32,.6),rgba(6,16,32,0))}
  .capa-topo-titulo{font-size:14px;letter-spacing:6px;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.85)}
  .capa-topo-sub{font-size:13px;letter-spacing:2px;color:#e8f0f8;margin-top:8px;text-shadow:0 1px 6px rgba(0,0,0,.85)}
  .capa-vazia{background:#d9dde5;display:flex;align-items:center;justify-content:center;color:#999;font-size:14px}
  .capa-overlay{background:linear-gradient(180deg,${navy} 0%,#0e1a2e 100%);color:#fff;padding:30mm 18mm;text-align:center;height:167mm;display:flex;flex-direction:column;justify-content:space-between}
  .capa-titulo{font-size:42pt;font-weight:800;line-height:1;letter-spacing:1px;margin-top:14mm}
  .capa-cond{font-size:28pt;font-weight:400;line-height:1.1;margin-top:6mm}
  .capa-mafra{margin-top:auto;font-size:22pt;font-weight:800;letter-spacing:3px}
  .capa-mafra small{font-size:10pt;font-weight:400;letter-spacing:4px;display:block;margin-top:3mm}
  .page-h{font-size:18pt;font-weight:700;color:${navy};margin-bottom:14px;line-height:1.2}
  .page-h2{font-size:14pt;font-weight:700;color:${navy};margin:18px 0 12px;line-height:1.3}
  .page-h3{font-size:13pt;font-weight:700;color:${navy};margin:18px 0 10px}
  .page-h3.center,.page-h.center{text-align:center}
  .num-h{font-size:12pt;font-weight:700;color:${navy};margin:18px 0 8px;letter-spacing:.5px}
  .page-lead{font-size:11pt;margin-bottom:14px}
  .page p{font-size:10.5pt;margin-bottom:9px;text-align:justify}
  .page ul{font-size:10.5pt;margin:8px 0 12px 22px}
  .page ul li{margin-bottom:5px;line-height:1.5}
  .pessoa-row{display:flex;gap:14px;margin:14px 0;align-items:flex-start}
  .pessoa-foto,.pessoa-foto-vazia{width:50mm;height:50mm;border-radius:4px;flex-shrink:0;object-fit:cover}
  .pessoa-foto-vazia{background:#e0e3e9;display:flex;align-items:center;justify-content:center;font-size:24pt;color:#aaa}
  .pessoa-body{flex:1}
  .pessoa-nm{font-size:11pt;font-weight:700;color:${navy};margin-bottom:5px}
  .pessoa-bio{font-size:10pt;text-align:justify;line-height:1.45}
  .equipe-grid{display:flex;gap:14px;justify-content:center;margin:20px 0;flex-wrap:wrap}
  .equipe-card{flex:0 0 48mm;text-align:center}
  .equipe-card img{width:42mm;height:42mm;border-radius:50%;object-fit:cover;border:3px solid #d9dde5;display:block;margin:0 auto 8px}
  .equipe-vazio{width:42mm;height:42mm;border-radius:50%;background:#e0e3e9;display:flex;align-items:center;justify-content:center;font-size:22pt;color:#aaa;margin:0 auto 8px}
  .equipe-nm{font-size:10pt;font-weight:600}
  .equipe-cg{font-size:9pt;color:${navy};font-weight:700;letter-spacing:.5px;margin-top:3px}
  .proj-img{max-width:100%;margin-top:14px;border:1px solid #ccc}
  /* CONTRACAPA — espelha a capa frontal mas inverte (overlay em cima, foto embaixo) */
  .page-contracapa{padding:0;overflow:hidden;background:${navy};display:flex;flex-direction:column}
  .contracapa-overlay{background:linear-gradient(180deg,${navy} 0%,#0e1a2e 100%);color:#fff;padding:25mm 18mm 15mm;text-align:center;height:167mm;display:flex;flex-direction:column;justify-content:space-between}
  .contracapa-mafra{font-size:22pt;font-weight:800;letter-spacing:3px}
  .contracapa-mafra small{font-size:10pt;font-weight:400;letter-spacing:4px;display:block;margin-top:3mm;opacity:.9}
  .contracapa-titulo{font-size:30pt;font-weight:800;line-height:1.05;letter-spacing:1px;margin-top:6mm}
  .contracapa-cond{font-size:18pt;font-weight:300;line-height:1.2;margin-top:4mm;opacity:.92}
  .contracapa-redes{margin-top:auto;display:grid;grid-template-columns:1fr 1fr;gap:4mm 8mm;text-align:left;padding:0 8mm;font-size:10pt}
  .cc-rede{display:flex;align-items:center;gap:3mm}
  .contracapa-img{width:100%;height:130mm;background-size:cover;background-position:center;clip-path:polygon(0 8%,50% 0,100% 8%,100% 100%,0 100%)}
  .contracapa-vazia{background:#d9dde5;display:flex;align-items:center;justify-content:center;color:#999;font-size:14px}
  @media print{ body{background:#fff} .page{margin:0;box-shadow:none;page-break-after:always} }
  @page{size:A4;margin:0}
<\/style></head><body>${paginas}
<script>setTimeout(()=>window.print(),500)<\/script>
</body></html>`;
}

function _paragrafos(txt){
  if(!txt) return "";
  return txt.split("\n").filter(l=>l.trim()).map(l=>{
    if(l.startsWith("• ")) return `<p style="padding-left:14px;text-indent:-14px">${esc(l)}</p>`;
    return `<p>${esc(l)}</p>`;
  }).join("");
}

function _regrasPadraoArea(tipo){
  const r = {
    piscina: "A piscina é de uso exclusivo dos condôminos e hóspedes. Visitantes limitados a 6 por apartamento.\n• É proibido o acesso de funcionários e prestadores (exceto babás com traje adequado na piscina infantil).\n• É proibido o uso de bronzeadores oleosos, brincadeiras perigosas, recipientes de vidro, fazer necessidades na piscina (obrigatória fralda aquática para crianças que houver necessidade).\n• É proibido circular com roupas de banho nas áreas sociais e elevadores.",
    salao_festa: "O salão de festas é exclusivo para eventos dos condôminos, sendo proibido o uso por terceiros ou para fins lucrativos.\n• Reserva pelo app do condomínio, mín. 2 e máx. 60 dias de antecedência.\n• Custo: 15% da taxa de menor fração ideal.\n• Cancelamentos com menos de 48h geram cobrança de taxa.\n• Datas Magnas (Natal e Ano Novo) sem festividades exclusivas.\n• Vistoria conjunta antes do evento; danos ressarcidos em até 7 dias.",
    quadra: "A quadra é de uso exclusivo dos condôminos. Permite-se o uso pelos hóspedes e visitantes.\n• Utilização permitida apenas para futebol e outros esportes apropriados para o local.",
    bicicletario: "Uso exclusivo dos condôminos. Toda bicicleta deve estar identificada com o número do apartamento.\n• O condomínio não se responsabiliza por furtos ou danos.\n• Não é permitido guardar patinetes, carrinhos, skates ou outros itens.\n• Reparos ou limpezas devem ser feitos no Bike Wash.",
    bike_wash: "Uso exclusivo para moradores.\n• Permitido apenas para lavagem e manutenção de bicicletas.\n• Não é permitido lavar motos, carros ou animais.\n• Mantenha o espaço limpo. Desligue equipamentos e feche a torneira ao finalizar.",
    churrasq_sport: "Uso exclusivo para moradores. Utilização mediante agendamento no app do condomínio.\n• Respeite os limites de ruído.\n• Som ambiente, TV e som moderado são liberados, mas caixas amplificadas e DJs não são permitidos.\n• Capacidade máxima: 30 convidados (conforme Regimento Interno).\n• É dever do condômino garantir a conduta respeitosa dos convidados.",
    churrasq_pizza: "Uso exclusivo para moradores. Utilização mediante agendamento no app do condomínio.\n• Respeite os limites de ruído.\n• Som ambiente, TV e som moderado são liberados, mas caixas amplificadas e DJs não são permitidos.\n• Capacidade máxima: 30 convidados.\n• Entregue o espaço limpo e em ordem.",
    brinquedoteca: "Espaço exclusivo para lazer das crianças do condomínio.\n• Uso para crianças de 2 a 10 anos.\n• Obrigatório acompanhamento de um responsável adulto.\n• Danos por uso indevido são de responsabilidade do responsável.\n• Proibido: correr/pular nos móveis, comer/beber, festas sem autorização, entrada de animais.",
    pet_care: "O espaço é destinado apenas aos pets dos condôminos.\n• Sempre acompanhe seu pet — animais não devem permanecer sozinhos no local.\n• Limpe a área utilizada após o banho ou escovação.\n• Evite latidos contínuos. Pets agressivos devem usar focinheira.\n• Proibido alimentar no local.",
    pet_place: "• Tutores devem acompanhar e supervisionar seus pets.\n• Recolha as fezes e mantenha o espaço limpo.\n• Animais agressivos devem usar focinheira.\n• Não é permitido o uso por filhotes não vacinados ou fêmeas no cio.\n• Eventuais incidentes envolvendo o pet são de responsabilidade exclusiva do tutor.",
    coworking: "Espaço destinado ao uso profissional dos condôminos.\n• Ambiente silencioso — mantenha o tom de voz baixo e evite ligações em viva-voz.\n• Ao final do uso, deixe a mesa limpa e o ambiente organizado.\n• Bebidas leves permitidas; refeições completas devem ser feitas em outras áreas.\n• Não é permitido deixar notebooks ou materiais pessoais sem supervisão.\n• Reservas via app do condomínio; estações comuns por ordem de chegada.\n• Não é permitido uso comercial (reuniões com clientes externos, equipes, atividades lucrativas).",
    salao_jogos: "Uso exclusivo de moradores. Visitantes só com acompanhamento de um condômino.\n• Bolas, tacos e raquetes devem ser utilizados com cuidado. Danos serão cobrados.\n• Proibido apoiar alimentos e bebidas sobre as mesas.\n• Evite barulho excessivo, palavrões ou atitudes agressivas.\n• Caixas de som e viva-voz proibidos.\n• Uso coletivo — respeite a ordem de chegada. Não é permitido reservar mesas.",
    fitness: "Uso exclusivo de moradores. Não é permitida entrada de visitantes ou personal trainers externos sem autorização.\n• Proibido treinar sem camisa ou com calçados inadequados. Toalha pessoal obrigatória.\n• Higienize os aparelhos após o uso.\n• Não é permitido reservar aparelhos — respeite o rodízio.\n• Menores de 16 anos apenas com supervisão de um responsável.\n• Após o uso, guarde os pesos no local correto.",
    playground: "• Crianças devem estar sempre acompanhadas por um responsável.\n• Não é permitido consumir alimentos ou bebidas nos brinquedos.\n• Brincadeiras devem ser seguras e respeitosas.\n• O tutor é responsável por qualquer incidente envolvendo a criança no local.\n• Em caso de dano ou uso inadequado, o responsável será acionado.",
    garagem: "Vagas exclusivas para veículos de pequeno porte dos moradores. Proibido usar as vagas como depósito.\n• Proibido: lavar veículos, fazer consertos, estacionar fora das faixas, circular acima de 10 km/h ou sem farol no subsolo, utilizar buzina, colocar objetos em paredes/colunas, alugar/emprestar vagas, circular com bicicletas/patinetes.\n• Danos, furtos ou irregularidades são de responsabilidade do condômino.",
    carrinhos: "Os carrinhos de supermercado são de uso exclusivo dos moradores para transporte de mercadorias domésticas.\n• Devem ser usados somente pelo tempo necessário e devolvidos ao local de origem imediatamente após o uso.\n• Devem ser transportados pelo elevador de serviço.",
    animais: "É permitida a permanência de animais de pequeno porte e de raças adaptadas à vida em apartamento, desde que não comprometam a higiene, a segurança e o sossego dos moradores. O tutor é totalmente responsável por danos, barulho, sujeira ou doenças causadas pelo animal.\n• Só podem circular nas garagens, escadas, portaria e elevador de serviço, no colo do morador ou empregado, e pelo tempo mínimo necessário.\n• Proibido em elevador social, salão de festas, quadra, piscina e salão de jogos.\n• Proibido deixar o animal sozinho no apê se fizer barulho.",
    lixo: "• O lixo deve ser acondicionado em sacos plásticos adequados, com separação entre recicláveis e orgânicos.\n• Caixas e materiais de grande volume são de responsabilidade do condômino.\n• Proibido deixar lixo no hall, escadas, garagem ou áreas comuns.\n• Expressamente proibido colocar lixo nas saídas de emergência, hall dos apartamentos, garagens e escadaria — sujeito a penalidade.",
    estacionamento_visitantes: "• Condôminos possuem acesso livre ao estacionamento em qualquer dia da semana.\n• Horário do estacionamento para visitantes deve ser respeitado.\n• Não é permitida a permanência de veículos em frente ao condomínio (mesmo provisórios).",
    visitantes_comercial: "• Orientar o visitante que acessar sua sala a trazer um documento com foto para realizar o cadastro de acesso ao edifício.\n• A autorização de visitantes/prestadores deve ser enviada por e-mail à gerência até as 17h, contendo: número da sala, responsável, tipo de serviço, data do período, nome e CPF.",
    ar_condicionado_central: "• O ar-condicionado do prédio é central, com horário pré-definido de funcionamento.\n• Permanece desligado aos domingos e feriados.\n• Em caso de necessidade de uso fora do horário, comunicar a gerência."
  };
  return r[tipo] || "";
}

async function editarManualPadrao(){
  if(state.user.tipo !== "master"){ alert("Apenas o master pode editar as configurações gerais."); return; }
  const p = await loadManualPadrao();
  document.getElementById("modalMount").innerHTML=`<div class="overlay"><div class="modal" style="max-width:780px;max-height:92vh;overflow:auto">
    <div class="modal-head"><h3>⚙️ Configurações gerais Mafra</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p style="font-size:13px;color:var(--muted);margin-bottom:14px">Esses textos e dados aparecem em <b>TODOS</b> os manuais de boas-vindas. Edite uma vez e todos os condomínios refletem.</p>
      <div class="field"><label>📞 Contato Mafra</label><input type="text" id="pdrContato" value="${esc(p.contatoMafra||'')}"></div>
      <div class="row2">
        <div class="field"><label>🌐 Site</label><input type="text" id="pdrSite" value="${esc(p.siteMafra||'')}"></div>
        <div class="field"><label>✉️ E-mail</label><input type="text" id="pdrEmail" value="${esc(p.emailMafra||'')}"></div>
      </div>
      <div class="row2">
        <div class="field"><label>${ico('camera')} Instagram</label><input type="text" id="pdrInsta" value="${esc(p.instagram||'')}"></div>
        <div class="field"><label>▶️ YouTube</label><input type="text" id="pdrYt" value="${esc(p.youtube||'')}"></div>
      </div>
      <div class="field"><label>👋 Carta de Boas-Vindas</label><textarea id="pdrCarta" rows="6">${esc(p.cartaBoasVindas||'')}</textarea></div>
      <div class="field"><label>${ico('predio')} Sobre o Síndico Profissional Mafra</label><textarea id="pdrSind" rows="4">${esc(p.sobreSindico||'')}</textarea></div>
      <div class="field"><label>📊 Sobre o Administrativo</label><textarea id="pdrAdm" rows="4">${esc(p.sobreAdministrativo||'')}</textarea></div>
      <div class="field"><label>👷 Sobre o Síndico Operacional</label><textarea id="pdrSO" rows="3">${esc(p.sobreSindicoOperacional||'')}</textarea></div>
      <div class="field"><label>🧹 Sobre a Zeladoria</label><textarea id="pdrZel" rows="5">${esc(p.sobreZeladoria||'')}</textarea></div>
      <p style="font-size:12px;color:var(--muted);margin-top:10px">💡 Para editar fotos da equipe (Diretoria, Administrativo, Síndicos Operacionais), clique nos botões abaixo:</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        <button class="btn-ghost hd-mini" onclick="editarPessoasPadrao('diretoria')">✏️ Diretoria</button>
        <button class="btn-ghost hd-mini" onclick="editarPessoasPadrao('administrativo')">✏️ Administrativo</button>
        <button class="btn-ghost hd-mini" onclick="editarPessoasPadrao('sindicosOperacionais')">✏️ Síndicos Operacionais</button>
      </div>
      <div class="modal-foot"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-primary" style="flex:1" onclick="salvarManualPadrao()">💾 Salvar</button></div>
    </div></div></div>`;
}

async function salvarManualPadrao(){
  const p = await loadManualPadrao();
  const g = id => (document.getElementById(id)||{}).value;
  p.contatoMafra = g("pdrContato"); p.siteMafra = g("pdrSite"); p.emailMafra = g("pdrEmail");
  p.instagram = g("pdrInsta"); p.youtube = g("pdrYt");
  p.cartaBoasVindas = g("pdrCarta"); p.sobreSindico = g("pdrSind"); p.sobreAdministrativo = g("pdrAdm");
  p.sobreSindicoOperacional = g("pdrSO"); p.sobreZeladoria = g("pdrZel");
  await saveManualPadrao(p);
  alert("✅ Configurações salvas!");
  closeModal();
}

async function editarPessoasPadrao(grupo){
  const p = await loadManualPadrao();
  const pessoas = p[grupo] || [];
  const lbl = grupo==="diretoria"?"Diretoria":grupo==="administrativo"?"Administrativo":"Síndicos Operacionais";
  const linhas = pessoas.map((pp, idx)=>`<div class="pp-row">
    ${pp.foto?`<img src="${pp.foto}" class="pp-foto">`:'<div class="pp-foto-vazia">'+ico('camera')+'</div>'}
    <div style="flex:1;display:flex;flex-direction:column;gap:6px">
      <input type="text" placeholder="Nome" value="${esc(pp.nome||'')}" oninput="window._ppEdit[${idx}].nome=this.value">
      <input type="text" placeholder="Cargo" value="${esc(pp.cargo||'')}" oninput="window._ppEdit[${idx}].cargo=this.value">
      ${grupo==="diretoria"?`<textarea rows="3" placeholder="Bio" oninput="window._ppEdit[${idx}].bio=this.value">${esc(pp.bio||'')}</textarea>`:""}
      <div style="display:flex;gap:6px">
        <label class="btn-ghost hd-mini">${ico('camera')} ${pp.foto?'Trocar':'Foto'}<input type="file" accept="image/*" style="display:none" onchange="_upPp(${idx},this.files,'${grupo}')"></label>
        <button class="btn-del hd-mini" onclick="window._ppEdit.splice(${idx},1);editarPessoasPadraoRender('${grupo}','${esc(lbl)}')">🗑️</button>
      </div>
    </div>
  </div>`).join("");
  window._ppEdit = JSON.parse(JSON.stringify(pessoas));
  window._ppGrupo = grupo;
  document.getElementById("modalMount").innerHTML=`<div class="overlay"><div class="modal" style="max-width:640px;max-height:90vh;overflow:auto">
    <div class="modal-head"><h3>✏️ ${esc(lbl)}</h3><button class="x" onclick="editarManualPadrao()">×</button></div>
    <div class="modal-body">
      <div id="ppList">${linhas}</div>
      <button class="btn-ghost" style="margin-top:10px" onclick="window._ppEdit.push({nome:'',cargo:'',foto:'',bio:''});editarPessoasPadraoRender('${grupo}','${esc(lbl)}')">＋ Adicionar pessoa</button>
      <div class="modal-foot"><button class="btn-cancel" onclick="editarManualPadrao()">Cancelar</button><button class="btn-primary" style="flex:1" onclick="salvarPessoasPadrao()">💾 Salvar</button></div>
    </div></div></div>`;
}

function editarPessoasPadraoRender(grupo, lbl){
  // re-renderiza só a parte da lista
  editarPessoasPadrao(grupo);
}

async function _upPp(idx, files, grupo){
  if(!files||!files[0]) return;
  try{
    const img = await comprimirImagem(files[0], 800, 0.85);
    window._ppEdit[idx].foto = img.foto;
    editarPessoasPadraoRender(grupo, "");
  }catch(e){ alert("Não consegui processar a imagem."); }
}

async function salvarPessoasPadrao(){
  const p = await loadManualPadrao();
  p[window._ppGrupo] = window._ppEdit;
  await saveManualPadrao(p);
  alert("✅ Pessoas atualizadas!");
  editarManualPadrao();
}

function carregarPdfJs(){
  if(_pdfJsPromise) return _pdfJsPromise;
  _pdfJsPromise = new Promise((resolve, reject)=>{
    if(window.pdfjsLib) return resolve(window.pdfjsLib);
    const sc = document.createElement("script");
    sc.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    sc.onload = ()=>{
      if(window.pdfjsLib){
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(window.pdfjsLib);
      } else reject(new Error("PDF.js não carregou"));
    };
    sc.onerror = ()=>reject(new Error("Falha ao carregar PDF.js"));
    document.head.appendChild(sc);
  });
  return _pdfJsPromise;
}

async function importarManualPdf(files){
  if(!files || !files[0]) return;
  const file = files[0];
  if(!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")){
    alert("Selecione um arquivo PDF.");
    return;
  }
  // Mostra loading no modal
  document.getElementById("modalMount").innerHTML = `<div class="overlay"><div class="modal" style="max-width:380px">
    <div class="modal-body" style="text-align:center;padding:30px">
      <div style="font-size:32px;margin-bottom:10px">📄</div>
      <h3 style="margin:0 0 8px 0;color:var(--navy)">Lendo PDF…</h3>
      <p style="font-size:13px;color:var(--muted);margin:0">Isso leva uns segundos. Não feche essa janela.</p>
    </div></div></div>`;
  try{
    const pdfjs = await carregarPdfJs();
    const arrayBuf = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({data:arrayBuf}).promise;
    let textoCompleto = "";
    for(let i=1; i<=pdf.numPages; i++){
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(it=>it.str).join(" ");
      textoCompleto += pageText + "\n\n";
    }
    // Aplica heurísticas para extrair campos
    const campos = _extrairCamposDeTexto(textoCompleto);
    _exibirRevisaoImportPdf(campos, textoCompleto.length);
  }catch(e){
    document.getElementById("modalMount").innerHTML = `<div class="overlay"><div class="modal" style="max-width:380px">
      <div class="modal-head"><h3>❌ Erro ao ler PDF</h3><button class="x" onclick="closeModal()">×</button></div>
      <div class="modal-body"><p>${esc(e.message)}</p>
      <p style="font-size:12px;color:var(--muted)">Verifique se o PDF não está protegido com senha, ou se a conexão com a internet está OK (precisa baixar uma biblioteca da primeira vez).</p>
      <div class="modal-foot"><button class="btn-primary" onclick="closeModal()" style="flex:1">OK</button></div></div></div></div>`;
  }
}

function _extrairCamposDeTexto(txt){
  const c = {};
  const buscar = (regex) => {
    const m = txt.match(regex);
    return m ? m[1].trim() : "";
  };
  const buscarTodos = (regex) => {
    const r = [];
    let m;
    const rg = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
    while((m = rg.exec(txt)) !== null) r.push(m[1].trim());
    return r;
  };

  // --- Zelador / Gerente ---
  c.zeladorCargo = /\bGerente\b/i.test(txt) && !/\bZelador/i.test(txt.substring(0, 3000)) ? "Gerente" : "Zelador(a)";
  c.zeladorNome = buscar(/(?:Zelador[a]?|Gerente)\s*[:：]\s*([A-ZÁÉÍÓÚÂÊÔÃÕÇ][^\n]{2,60}?)(?=\s*(?:Contato|Tel|E-?mail|Hor[áa]rio|\d|$))/i);
  // Telefones (16) 9XXXX-XXXX, 0800-XXX-XXXX
  const telefones = buscarTodos(/((?:\(?\d{2}\)?\s*)?9?\s*\d{4,5}[-\s]\d{4})/g);
  c.zeladorTel = telefones[0] || "";
  // E-mail do zelador (primeiro com "zelador" ou "gerencia" no nome)
  const emails = buscarTodos(/([\w.+-]+@[\w.-]+\.[a-z]{2,})/gi);
  c.zeladorEmail = emails.find(e=>/zelador|gerenc/i.test(e)) || "";
  // Horário
  c.zeladorHorario = buscar(/Hor[áa]rio\s+(?:de\s+)?Trabalho\s*[:：]?\s*([^\n]{5,100})/i);
  c.zeladorEndereco = buscar(/Endere[çc]o\s*[:：]\s*((?:Rua|Av|Avenida|Alameda)[^\n]{5,120})/i);

  // --- App / Sindigest ---
  if(/Condomob/i.test(txt)) c.app = "Condomob";
  else if(/Prime\s*Ac+ess/i.test(txt)) c.app = "Prime Acess";
  else if(/Vallecon/i.test(txt)) c.app = "Vallecon";
  else if(/Inah/i.test(txt) && /aplicativo/i.test(txt)) c.app = "Inah";
  c.sindigestUrl = buscar(/(https?:\/\/sindigest\.com\.br\/[^\s]+)/i);

  // --- Energia / Gás ---
  c.energiaForn = /CPFL/i.test(txt) ? "CPFL" : (buscar(/Fornecedora?\s*[:：]?\s*([A-Z][^\s\n]{2,30})/i));
  if(/Necta/i.test(txt)) c.gasForn = "Necta";
  c.gasTel = buscar(/(?:Necta|G[áa]s)[^\n]{0,30}(0800[\s-]?\d{3}[\s-]?\d{4})/i);

  // --- Administradora ---
  const admMatch = txt.match(/DADOS\s+DA\s+ADMINISTRADORA\s*[:：]?\s*([^\n]{3,80})/i);
  c.admNome = admMatch ? admMatch[1].trim().split(/Endere|Tel|E-?mail|Central/i)[0].trim() : "";
  // Endereço da administradora
  c.admEndereco = "";
  c.admTel = "";
  c.admEmail = emails.find(e=>/etikon|vallecon|inah|atendimento/i.test(e) && !/zelador|gerenc/i.test(e)) || "";
  if(admMatch){
    const trecho = txt.substring(admMatch.index, admMatch.index + 800);
    const end = trecho.match(/Endere[çc]o\s*[:：]?\s*((?:Av|Rua|Alameda)[^\n]{5,150})/i);
    if(end) c.admEndereco = end[1].trim();
    const tel = trecho.match(/(?:Central\s+de\s+Atendimento|Telefone|Tel\.?)\s*[:：]?\s*([\d\s\-\(\)\/]{8,40})/i);
    if(tel) c.admTel = tel[1].trim();
  }

  // --- Construtora ---
  const constMatch = txt.match(/CONSTRUTORA\s+([A-ZÁÉÍÓÚÂÊÔÃÕÇ][^\n:]{2,40})[:：]?/i);
  c.construtoraNome = constMatch ? constMatch[1].trim() : "";
  c.construtoraTel = "";
  if(constMatch){
    const trecho = txt.substring(constMatch.index, constMatch.index + 400);
    const tel = trecho.match(/Tel\.?\s*[:：]?\s*([\d\s\-\(\)\/]{8,40})/i);
    if(tel) c.construtoraTel = tel[1].trim();
  }

  // --- Internet (lista de provedores) ---
  c.internet = [];
  const provedoresConhecidos = ["Vivo", "Alcans", "WCA", "IFTNet", "ClickFibra", "Claro", "Tim", "Oi"];
  provedoresConhecidos.forEach(p => {
    // Aceita: "Vivo: 10315" (5 dígitos), "Vivo 0800 999 1010", "WCA: 16 35159600", etc.
    const reg = new RegExp("\\b" + p + "\\b\\s*[:：]?\\s*([\\d][\\d\\s\\-\\(\\)\\/\\.]{3,30})", "i");
    const m = txt.match(reg);
    if(m) c.internet.push({provedor:p, contato:m[1].trim(), whatsapp:""});
  });

  // --- Tipo do manual (heurística) ---
  if(/Associa[çc][ãa]o\s+dos\s+Moradores|loteamento|Cartilha\s+de\s+Obras/i.test(txt)) c.tipo = "loteamento";
  else if(/Centro\s+Profissional|sala\s+comercial|valet|elevador\s+social.*sala/i.test(txt)) c.tipo = "comercial";
  else c.tipo = "residencial";

  // --- Áreas comuns detectadas ---
  const palavrasAreas = {
    piscina:/PISCINA|piscina/, salao_festa:/SAL[ÃA]O\s+DE\s+FESTAS?/i, quadra:/QUADRA/i,
    bicicletario:/BICICLET[ÁA]RIO/i, bike_wash:/BIKE\s*WASH/i, churrasq_sport:/CHURRASQUEIRA.*SPORT/i,
    churrasq_pizza:/CHURRASQUEIRA.*PIZZA|FORNO\s+DE\s+PIZZA/i, brinquedoteca:/BRINQUEDOTECA/i,
    pet_care:/PET\s+CARE/i, pet_place:/PET\s+PLACE/i, coworking:/COWORKING/i, salao_jogos:/SAL[ÃA]O\s+DE\s+JOGOS/i,
    fitness:/FITNESS|ACADEMIA/i, playground:/PLAYGROUND|PARQUINHO/i, garagem:/GARAGEM/i,
    carrinhos:/CARRINHOS?\s+DE\s+SUPERMERCADO/i, animais:/ANIMAIS\s+DE\s+ESTIMA[ÇC][ÃA]O|ANIMAIS/i, lixo:/\bLIXO\b/i,
    estacionamento_visitantes:/VALET|ESTACIONAMENTO\/VALET/i, visitantes_comercial:/VISITANTES?\s*$|cadastro.*visitante/im,
    ar_condicionado_central:/AR[-\s]?CONDICIONADO\s+(central|do pr[ée]dio)/i
  };
  c.areasDetectadas = [];
  for(const [k, rx] of Object.entries(palavrasAreas)){
    if(rx.test(txt)) c.areasDetectadas.push(k);
  }
  return c;
}

function _exibirRevisaoImportPdf(c, tamanho){
  const m = window.manState;
  const linhas = [];
  // Comparações: o que foi encontrado vs o que tá atualmente
  const cmp = (label, atual, novo) => {
    if(!novo) return "";
    const igual = (atual||"").trim() === novo.trim();
    return `<div class="imp-row">
      <div class="imp-l">${label}</div>
      <div class="imp-atual">${atual ? esc(atual.substring(0,60)) : "<i style='color:#aaa'>vazio</i>"}</div>
      <div class="imp-arrow">→</div>
      <div class="imp-novo">${esc(novo.substring(0,60))}</div>
      ${igual?"<span class='imp-igual'>(igual)</span>":""}
    </div>`;
  };
  if(c.zeladorNome) linhas.push(cmp(`${c.zeladorCargo} (nome)`, m.zelador.nome, c.zeladorNome));
  if(c.zeladorTel) linhas.push(cmp("Telefone do zelador", m.zelador.contato, c.zeladorTel));
  if(c.zeladorEmail) linhas.push(cmp("E-mail do zelador", m.zelador.email, c.zeladorEmail));
  if(c.zeladorHorario) linhas.push(cmp("Horário", m.zelador.horario, c.zeladorHorario));
  if(c.zeladorEndereco) linhas.push(cmp("Endereço", m.zelador.endereco, c.zeladorEndereco));
  if(c.app) linhas.push(cmp("App do condomínio", m.appCondominio, c.app));
  if(c.sindigestUrl) linhas.push(cmp("Sindigest", m.sindigestUrl, c.sindigestUrl));
  if(c.gasForn) linhas.push(cmp("Gás (fornecedora)", m.gas.fornecedora, c.gasForn));
  if(c.gasTel) linhas.push(cmp("Gás (telefone)", m.gas.telefone, c.gasTel));
  if(c.admNome) linhas.push(cmp("Administradora", m.administradora.nome, c.admNome));
  if(c.admEndereco) linhas.push(cmp("Admin. endereço", m.administradora.endereco, c.admEndereco));
  if(c.admTel) linhas.push(cmp("Admin. telefone", m.administradora.telefone, c.admTel));
  if(c.admEmail) linhas.push(cmp("Admin. e-mail", m.administradora.email, c.admEmail));
  if(c.construtoraNome) linhas.push(cmp("Construtora", m.construtora.nome, c.construtoraNome));
  if(c.construtoraTel) linhas.push(cmp("Construtora tel.", m.construtora.telefone, c.construtoraTel));
  if(c.internet && c.internet.length){
    linhas.push(`<div class="imp-row"><div class="imp-l">Internet (provedores)</div><div class="imp-atual">${m.internet.length} cadastrado(s)</div><div class="imp-arrow">→</div><div class="imp-novo">${c.internet.map(i=>esc(i.provedor)).join(", ")}</div></div>`);
  }
  if(c.areasDetectadas && c.areasDetectadas.length){
    const labels = c.areasDetectadas.map(k=>{
      const cat = AREAS_CATALOGO.find(a=>a.k===k);
      return cat ? cat.l.replace(/^\S+\s/,"") : k;
    });
    linhas.push(`<div class="imp-row"><div class="imp-l">Áreas comuns detectadas</div><div class="imp-atual">${m.areasComuns.length} marcadas</div><div class="imp-arrow">→</div><div class="imp-novo">${esc(labels.join(", "))}</div></div>`);
  }
  if(c.tipo) linhas.push(cmp("Tipo do manual", m.tipo, c.tipo));

  const total = linhas.filter(x=>x).length;
  document.getElementById("modalMount").innerHTML = `<div class="overlay"><div class="modal" style="max-width:780px;max-height:92vh;overflow:auto">
    <div class="modal-head"><h3>📥 Revisar dados do PDF</h3><button class="x" onclick="closeModal()">×</button></div>
    <div class="modal-body">
      <p style="font-size:13px;color:var(--muted);margin-bottom:14px">Encontrei <b>${total}</b> campo${total!==1?"s":""} no PDF (${(tamanho/1024).toFixed(0)} KB de texto). Confira o que vai mudar e clique em <b>Aplicar</b> para preencher o manual.</p>
      ${total === 0 ? `<div class="com-alert">Não consegui identificar campos no PDF. Provavelmente é um PDF escaneado (imagem) ou usa um layout muito diferente do padrão Mafra. Você pode preencher os campos manualmente.</div>` : `<div class="imp-tbl">${linhas.join("")}</div>`}
      <p style="font-size:11.5px;color:var(--muted);margin-top:12px;line-height:1.5">⚠️ A capa, fotos e regras detalhadas de cada área precisam ser preenchidas/revisadas manualmente. O sistema só extrai dados estruturados (nomes, telefones, e-mails, endereços).</p>
      <div class="modal-foot">
        <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
        ${total > 0 ? `<button class="btn-primary" style="flex:1" onclick="aplicarDadosImportPdf(${JSON.stringify(c).replace(/"/g,"&quot;")})">📥 Aplicar ${total} campo${total!==1?"s":""}</button>` : ""}
      </div>
    </div></div></div>`;
}

function aplicarDadosImportPdf(c){
  const m = window.manState;
  if(c.zeladorNome) m.zelador.nome = c.zeladorNome;
  if(c.zeladorTel) m.zelador.contato = c.zeladorTel;
  if(c.zeladorEmail) m.zelador.email = c.zeladorEmail;
  if(c.zeladorHorario) m.zelador.horario = c.zeladorHorario;
  if(c.zeladorEndereco) m.zelador.endereco = c.zeladorEndereco;
  if(c.zeladorCargo) m.zelador.cargo = c.zeladorCargo;
  if(c.app) m.appCondominio = c.app;
  if(c.sindigestUrl) m.sindigestUrl = c.sindigestUrl;
  if(c.gasForn) m.gas.fornecedora = c.gasForn;
  if(c.gasTel) m.gas.telefone = c.gasTel;
  if(c.admNome) m.administradora.nome = c.admNome;
  if(c.admEndereco) m.administradora.endereco = c.admEndereco;
  if(c.admTel) m.administradora.telefone = c.admTel;
  if(c.admEmail) m.administradora.email = c.admEmail;
  if(c.construtoraNome) m.construtora.nome = c.construtoraNome;
  if(c.construtoraTel) m.construtora.telefone = c.construtoraTel;
  if(c.internet && c.internet.length){
    // adiciona os provedores que não existem
    c.internet.forEach(p=>{
      if(!m.internet.find(x=>x.provedor.toLowerCase()===p.provedor.toLowerCase())){
        m.internet.push(p);
      }
    });
  }
  if(c.areasDetectadas && c.areasDetectadas.length){
    c.areasDetectadas.forEach(k=>{
      if(!m.areasComuns.find(a=>a.tipo===k)){
        const cat = AREAS_CATALOGO.find(a=>a.k===k);
        m.areasComuns.push({tipo:k, ativa:true, horario:cat?cat.padraoHorario:"", regras:""});
      }
    });
  }
  if(c.tipo && m.tipo === "residencial") m.tipo = c.tipo; // só sobrescreve se ainda for default
  closeModal();
  alert("✓ Dados aplicados! Revise os campos antes de salvar.");
  renderEditorManual();
}

async function confirmarImportarManuaisPre(){
  if(!confirm("Isso vai criar/sobrescrever os manuais de:\n\n• Edifício Magnólia (residencial)\n• Borda do Parque (loteamento)\n• Centro Profissional Ribeirão Shopping (comercial)\n\nOs três ficarão com status PRONTO e dados oficiais Mafra. Continuar?")) return;
  try{
    const r = await importarManuaisPreCadastrados();
    alert("✓ Manuais importados com sucesso:\n\n"+r.join("\n")+"\n\nAgora cada um já está PRONTO. Só falta enviar a foto da capa de cada um.");
    _storeCacheClear();
    render();
  }catch(e){
    alert("Erro ao importar: "+e.message);
  }
}


