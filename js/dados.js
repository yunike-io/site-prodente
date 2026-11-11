// Todos os dados do site ficam aqui. Os marcados com "INVENTADO" são fictícios:
// troque pelos reais da clínica (a lista completa está no README.md).
window.DADOS = {
  nome: "Pró-Dente & Saúde",
  registro: "CROSP 025181", // registro da clínica; aparece no rodapé
  slogan: "Sorrisos saudáveis, cuidado de verdade.", // INVENTADO
  cidade: "Paulínia - SP",

  // Contato
  whatsapp: "5519981433568", // só números, com 55 + DDD
  whatsappTexto: "(19) 98143-3568",
  whatsappMensagem: "Olá! Vim pelo site e gostaria de agendar uma consulta.",
  clareamentoMensagem: "Olá! Vim pelo site, usei o simulador de clareamento e gostaria de agendar uma avaliação.",
  telefone: "1938333428",
  telefoneTexto: "(19) 3833-3428",
  instagram: "prodente.clinica", // sem o @
  email: "prodente.clinica@gmail.com",

  // Endereço e mapa
  endereco: "Av. Duque de Caxias, 646 — João Aranha",
  cep: "13145-700",
  mapaBusca: "Pró-Dente, Av. Duque de Caxias, 646 - João Aranha, Paulínia - SP", // texto que o Google Maps procura

  // Sobre
  sobre: [ // INVENTADO
    "A Pró-Dente & Saúde nasceu para unir odontologia de qualidade e atendimento humano. Aqui cada paciente é ouvido com calma, recebe um plano de tratamento claro e sabe exatamente o que vai acontecer em cada consulta.",
    "Trabalhamos com equipamentos modernos, esterilização rigorosa e uma equipe que se atualiza sempre — para você sair daqui com um sorriso saudável e sem medo de dentista."
  ],
  numeros: [ // pacientes e especialidades: provisórios, sem fonte (Kevin pediu para manter por enquanto)
    { valor: 27, sufixo: "+", rotulo: "anos de clínica" }, // informado pelo Kevin: "pelo menos uns 27"
    { valor: 8000, sufixo: "+", rotulo: "pacientes atendidos" },
    { valor: 9, sufixo: "", rotulo: "especialidades" },
    { valor: "google", sufixo: "★", rotulo: "nota no Google", casas: 1 } // usa google.nota, lá embaixo
  ],

  // Tratamentos com mini-cena 3D (cena: implante, aparelho, clareamento, limpeza, protese, canal — ver js/cenas.js)
  tratamentos: [ // INVENTADO — descrições
    { cena: "implante", titulo: "Implantes", texto: "Reposição de dentes perdidos com implante de titânio e coroa sob medida." },
    { cena: "aparelho", titulo: "Ortodontia", texto: "Aparelhos fixos e alinhadores transparentes para alinhar o sorriso." },
    { cena: "clareamento", titulo: "Clareamento", texto: "Clareamento de consultório e caseiro, com acompanhamento e sem sustos." },
    { cena: "limpeza", titulo: "Limpeza e prevenção", texto: "Remoção de tártaro e placa, com orientação de higiene para casa." },
    { cena: "protese", titulo: "Próteses", texto: "Próteses fixas, removíveis e protocolos para voltar a mastigar bem." },
    { cena: "canal", titulo: "Tratamento de canal", texto: "Endodontia com anestesia confortável e tecnologia para salvar o dente." }
  ],
  // Tratamentos sem cena 3D (icone: um dos nomes em ICONES no conteudo.js)
  outrosTratamentos: [ // INVENTADO
    { icone: "dente", titulo: "Clínica geral", texto: "Atendimento adulto e infantil: avaliação, restaurações e prevenção." },
    { icone: "crianca", titulo: "Atendimento infantil", texto: "Clínica geral para crianças, com calma e paciência." },
    { icone: "estrela", titulo: "Estética e lentes", texto: "Facetas, lentes de contato dental e harmonia do sorriso." }
  ],

  // Simulador de clareamento: escala tipo VITA clássica, do mais escuro ao mais claro.
  // As cores são APROXIMADAS (feitas a olho pra tela), não são medidas colorimétricas da escala real.
  escalaCor: [
    { cod: "C4", cor: "#c1ab82" }, { cod: "A4", cor: "#cdb385" }, { cod: "C3", cor: "#cdbc9c" },
    { cod: "B4", cor: "#dbc28b" }, { cod: "A3.5", cor: "#d9c092" }, { cod: "B3", cor: "#e1ca98" },
    { cod: "D3", cor: "#d9c9a9" }, { cod: "A3", cor: "#e0cda4" }, { cod: "D4", cor: "#dccdab" },
    { cod: "C2", cor: "#dccfb2" }, { cod: "C1", cor: "#e3d9c4" }, { cod: "A2", cor: "#e8dcbf" },
    { cod: "D2", cor: "#e6dcc8" }, { cod: "B2", cor: "#ede3c8" }, { cod: "A1", cor: "#efe8d6" },
    { cod: "B1", cor: "#f4f0e4" }
  ],
  // Tom de partida do simulador. Com tomInicialFaixa preenchida, o site sorteia um tom dentro dela
  // (incluindo as pontas) a cada carregamento, pra nunca começar já quase branco; deixe-a vazia
  // pra usar sempre o tomInicial. A faixa vai pela ordem da escalaCor acima, do escuro ao claro.
  tomInicial: "A3.5",
  tomInicialFaixa: ["C4", "D4"],

  // Antes e depois: deixe vazio pra usar os renders do dente 3D; com as fotos reais, ponha o caminho
  // (ex.: "assets/antes-1.jpg"). As duas fotos precisam ter o mesmo enquadramento.
  antesDepois: { antes: "", depois: "", tomAntes: "#cdb385", tomDepois: "#f4f0e4",
    legenda: "Imagem meramente ilustrativa. Resultados variam de pessoa para pessoa." },

  // Agendamento: períodos que aparecem no formulário
  periodos: ["Manhã", "Tarde", "Fim da tarde"],

  // Área de psicologia. Os textos são RASCUNHO: a clínica precisa aprovar.
  psicologia: {
    intro: "Na Pró-Dente & Saúde, o cuidado vai além do sorriso. Nossas psicólogas e nossa psicopedagoga atendem com escuta, respeito e sigilo.",
    whatsappMensagem: "Olá! Vim pelo site e gostaria de agendar um atendimento na área de psicologia.",
    areas: [
      { icone: "coracao", titulo: "Psicologia clínica", texto: "Um espaço de escuta para entender o que você sente e lidar com as questões do dia a dia." },
      { icone: "livro", titulo: "Psicopedagogia e neuropsicopedagogia", texto: "Um olhar atento à forma como cada pessoa aprende e às dificuldades que surgem nesse caminho." }
    ]
  },

  // Equipe (dados reais, enviados pela Dra. Daniela em 2026-11-04)
  // foto: caminho da foto (ex.: "assets/equipe/daniela.jpg", quadrada). Vazio mostra o placeholder.
  // whatsapp das psicólogas: FICTÍCIOS (pedido do Kevin, 2026-11-04). Trocar pelos reais antes de publicar.
  // area: "psicologia" põe a pessoa na seção de psicologia; sem area, ela fica na Equipe (odontologia).
  // responsavel: true em quem for responsável técnico(a); aparece no rodapé.
  equipe: [
    { nome: "Dra. Daniela Barbosa Landim", titulo: "Cirurgiã Dentista", cargo: "Implantodontista e Dentística Restauradora", cro: "CROSP 63544", foto: "assets/equipe/daniela.jpg", responsavel: true },
    { nome: "Dra. Beatriz Anjos dos Santos", titulo: "Cirurgiã Dentista", cargo: "Clínica Geral — atendimento adulto e infantil", cro: "CROSP 151194", foto: "assets/equipe/beatriz.jpg" },
    { nome: "Dra. Aline Giunco", titulo: "Cirurgiã Dentista", cargo: "Endodontista", cro: "CROSP 096676", foto: "assets/equipe/aline.jpg" },
    { nome: "Dr. Lindsey Silva Borreli", titulo: "Cirurgião Dentista", cargo: "Periodontista", cro: "CROSP 85554", foto: "assets/equipe/lindsey.jpg" },
    { nome: "Dra. Sarah Ferreira", titulo: "Cirurgiã Dentista", cargo: "Especialista em Ortodontia e Ortopedia Funcional dos Maxilares", cro: "CROSP 103626", foto: "assets/equipe/sarah.jpg" }, // drasarahferreira.com.br, 2026-11-04
    { nome: "Márcia Regina Ioricci", cargo: "Psicóloga Clínica", cro: "CRP 06/220154", foto: "", area: "psicologia", whatsapp: "", whatsappTexto: "" /* FICTÍCIO removido em 2026-11-07: pôr o número real */ },
    { nome: "Ana Paula Bernardo", cargo: "Psicóloga Clínica", cro: "CRP 06/22422", foto: "", area: "psicologia", whatsapp: "", whatsappTexto: "" /* FICTÍCIO removido em 2026-11-07: pôr o número real */ },
    { nome: "Tatiane Soares", cargo: "Psicóloga Clínica", cro: "CRP 06/115394", foto: "", area: "psicologia", whatsapp: "", whatsappTexto: "" /* FICTÍCIO removido em 2026-11-07: pôr o número real */ },
    { nome: "Kely Fonseca", cargo: "Psicóloga", cro: "CRP 06/181608", foto: "", area: "psicologia", whatsapp: "", whatsappTexto: "" /* FICTÍCIO removido em 2026-11-07: pôr o número real */ },
    { nome: "Luciana Nascimento", cargo: "Psicopedagoga, Neuropsicopedagoga e Neuropsicanalista", cro: "CBO 2394-25", foto: "assets/equipe/luciana.jpg", area: "psicologia" }
  ],

  // Perguntas frequentes: só respostas confirmadas pela clínica (Kevin, 2026-11-07).
  // O texto foi ampliado em 2026-11-09 pra ficar mais acolhedor; os fatos continuam os mesmos.
  faq: [
    { pergunta: "Vocês aceitam convênio?", resposta: "Sim. Atendemos pelos convênios Amil, SulAmérica e Porto Seguro. Se o seu plano for um desses, basta nos informar no momento do agendamento para que o atendimento já seja organizado dessa forma." },
    { pergunta: "Quais são as formas de pagamento?", resposta: "Aceitamos dinheiro, Pix e cartão de crédito ou débito, com a possibilidade de parcelamento sem juros. Na avaliação, apresentamos o valor do tratamento e combinamos com você a forma de pagamento que couber melhor no seu orçamento." },
    { pergunta: "A avaliação é paga?", resposta: "Não, a avaliação é gratuita e sem compromisso. É o momento em que examinamos sua saúde bucal com calma, entendemos o que você procura e explicamos as opções de tratamento — você só decide depois de saber exatamente o que será feito." },
    { pergunta: "Vocês atendem urgência?", resposta: "Sim, atendemos urgências. Se você estiver com dor, inchaço ou tiver sofrido alguma pancada na região da boca, entre em contato pelo WhatsApp ou telefone descrevendo o que está sentindo, que orientamos você sobre o próximo passo." },
    { pergunta: "A partir de que idade vocês atendem crianças?", resposta: "Atendemos crianças de todas as idades, sem idade mínima definida. Quem dá o ritmo da consulta é a própria criança: só seguimos adiante quando ela está tranquila e confortável na cadeira, para que a primeira experiência no dentista seja uma boa lembrança." },
    { pergunta: "Tenho medo de dentista. E agora?", resposta: "Você não está sozinho — o medo de dentista é bem mais comum do que parece, e aqui ele é tratado com naturalidade. Nossa equipe trabalha com delicadeza, explica cada etapa antes de começar e respeita o seu tempo. Se precisar de uma pausa no meio da consulta, é só avisar que a gente para." },
    { pergunta: "Quanto tempo leva um clareamento?", resposta: "Depende do resultado que você deseja alcançar. Existem dois caminhos: o clareamento caseiro, feito com uma placa personalizada que você usa antes de dormir, e o de consultório, que clareia em uma única sessão. Na avaliação, o dentista analisa o tom atual dos seus dentes e indica qual das duas opções faz mais sentido para o seu caso." },
    { pergunta: "Tem estacionamento e acessibilidade?", resposta: "Sim. A clínica conta com estacionamento e com estrutura de acessibilidade. Se você precisar de algum apoio específico na chegada ou na locomoção, é só avisar no agendamento que deixamos tudo preparado para receber você." }
  ],

  // Depoimentos: trechos curtos de avaliações reais de 5 estrelas no Google Maps (lidas em 2026-11-04)
  depoimentos: [
    { nome: "Flavio C.", texto: "Atendimento muito bom, (como sempre). Excelente trabalho executado pela profissional dra. Daniela Landim.", nota: 5 },
    { nome: "Mboscolo", texto: "Fiz um clareamento otimo com a Doutora Daniela, recomendo!!!", nota: 5 },
    { nome: "Petras B.", texto: "Muito bom!!! Atendimento pontual e excelente recomendações.", nota: 5 }
  ],

  // Google
  google: { // Google Maps, 2026-11-04
    nota: 4.5,
    avaliacoes: "+ de 20", // texto, não número: evita ficar desatualizado a cada avaliação nova
    // link do painel de avaliações na busca do Google (2026-11-09). É um link de sessão: se um dia
    // parar de abrir o painel, troque pelo definitivo https://search.google.com/local/writereview?placeid=<ID>
    link: "https://www.google.com/search?q=pro+dente+paulinia&si=AE1YtOqiKPb2pdLXAi8quZ9vbH4aVq_aX8-3H9iFBLpRNK95c1xaLy0z5mlF4Q-pNvUqVnLThUNBcXNkPnYpZVQ7Glk8r-Lbq9l_4yPxu33xvueHw-FRwhQ6wSEceXZmeej_hIUaAY4E&uds=AE2AFgZqBKGNoZ_YnLHhYf4a8hK8YADt-E6aXTrcVnZAsjK0Eveea6s55k64F9Pwd7HswAcI5m1Ep5XJzyd_q_9par6x4sPCUjafZq-sy9Au2CA0PAJXDtjmKKWxHiGuscQ3eULGgWqU"
  },

  // Horários (dia: 0 = domingo ... 6 = sábado)
  horarios: [ // Google Maps, 2026-11-04
    { dia: 1, rotulo: "Segunda", horas: "08:30 – 19:00" },
    { dia: 2, rotulo: "Terça", horas: "08:30 – 19:00" },
    { dia: 3, rotulo: "Quarta", horas: "08:30 – 19:00" },
    { dia: 4, rotulo: "Quinta", horas: "08:30 – 19:00" },
    { dia: 5, rotulo: "Sexta", horas: "08:30 – 19:00" },
    { dia: 6, rotulo: "Sábado", horas: "Fechado" },
    { dia: 0, rotulo: "Domingo", horas: "Fechado" }
  ]
};
