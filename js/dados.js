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
  tomInicial: "A3.5",

  // Antes e depois: deixe vazio pra usar os renders do dente 3D; com as fotos reais, ponha o caminho
  // (ex.: "assets/antes-1.jpg"). As duas fotos precisam ter o mesmo enquadramento.
  antesDepois: { antes: "", depois: "", tomAntes: "#cdb385", tomDepois: "#f4f0e4",
    legenda: "Imagem ilustrativa gerada no computador. Resultados variam de pessoa para pessoa." },

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
    { nome: "Márcia Regina Ioricci", cargo: "Psicóloga Clínica", cro: "CRP 06/220154", foto: "", area: "psicologia", whatsapp: "5519900000001", whatsappTexto: "(19) 90000-0001" },
    { nome: "Ana Paula Bernardo", cargo: "Psicóloga Clínica", cro: "CRP 06/22422", foto: "", area: "psicologia", whatsapp: "5519900000002", whatsappTexto: "(19) 90000-0002" },
    { nome: "Tatiane Soares", cargo: "Psicóloga Clínica", cro: "CRP 06/115394", foto: "", area: "psicologia", whatsapp: "5519900000003", whatsappTexto: "(19) 90000-0003" },
    { nome: "Kely Fonseca", cargo: "Psicóloga", cro: "CRP 06/181608", foto: "", area: "psicologia", whatsapp: "5519900000004", whatsappTexto: "(19) 90000-0004" },
    { nome: "Luciana Nascimento", cargo: "Psicopedagoga, Neuropsicopedagoga e Neuropsicanalista", cro: "CBO 2394-25", foto: "assets/equipe/luciana.jpg", area: "psicologia" }
  ],

  // Perguntas frequentes: só respostas confirmadas pela clínica (Kevin, 2026-11-07).
  faq: [
    { pergunta: "Vocês aceitam convênio?", resposta: "Sim: Amil, SulAmérica e Porto Seguro." },
    { pergunta: "Quais são as formas de pagamento?", resposta: "Dinheiro, Pix e cartão de crédito ou débito. Dá para parcelar sem juros." },
    { pergunta: "A avaliação é paga?", resposta: "Não. A avaliação é gratuita." },
    { pergunta: "Vocês atendem urgência?", resposta: "Sim, atendemos urgência." },
    { pergunta: "A partir de que idade vocês atendem crianças?", resposta: "Atendemos crianças pequenas, sem uma idade mínima definida. O que importa é a criança se sentir tranquila durante o atendimento." },
    { pergunta: "Tenho medo de dentista. E agora?", resposta: "Pode ficar tranquilo: nossos dentistas são delicados e vão no seu ritmo." },
    { pergunta: "Quanto tempo leva um clareamento?", resposta: "Depende do resultado que você deseja. Há duas opções: o caseiro, com uma placa usada antes de dormir, e o de consultório, que clareia em uma única sessão." },
    { pergunta: "Tem estacionamento e acessibilidade?", resposta: "Sim, temos estacionamento e acessibilidade." }
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
    avaliacoes: 22,
    link: "https://www.google.com/maps/search/?api=1&query=Pr%C3%B3-Dente%20Av.%20Duque%20de%20Caxias%20646%20Paul%C3%ADnia"
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
