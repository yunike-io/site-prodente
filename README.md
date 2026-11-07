# Site Pró-Dente & Saúde

Site de uma página da clínica, feito em Three.js 0.160.0 (jsDelivr, sem build e sem npm). É o destino do botão
"Site" do stand NFC. Versão de 2026-10-28. **Não foi publicado em lugar nenhum.**

## Como abrir
Os módulos JS não rodam abrindo o arquivo direto, então é preciso um servidor local:

1. No Claude Code, no vault, use a configuração `site-prodente` do `.claude/launch.json` (porta 8765).
2. Ou rode no terminal:
   ```
   C:\Users\kevin\AppData\Local\Programs\Python\Python312\python.exe -m http.server 8765 --directory C:\Users\kevin\Documents\SiteProDente
   ```
   e abra http://localhost:8765

A configuração `bibi-video` também usa a porta 8765, então não rode as duas ao mesmo tempo.

## O que tem
- **Topo:** um molar de vidro/cristal procedural, feito com `MeshPhysicalMaterial` com transmission, IOR 1,5, clearcoat e iridescência, e reflexos de um RoomEnvironment em PMREM. Ele gira e inclina com o mouse. Ao rolar, o vidro se desfaz por um ruído com a borda acesa em azul, e as partículas nascem no mesmo ponto e voam até formar o símbolo da logo, com as cores tiradas do `simbolo.svg`. São 11.000 partículas no PC e 5.200 no celular.
- **Tratamentos em 3D:** cada um tem uma mini-cena:
  - implante: parafuso, pilar e coroa;
  - aparelho: os dentes se alinham no fio;
  - clareamento: o dente amarelo clareia;
  - limpeza: o jato tira a placa;
  - prótese: os dentes descem na gengiva;
  - canal: os canais acendem.

  Mais 3 cartões sem 3D: clínica geral, odontopediatria e estética.
- **Simulador de clareamento:** uma escala de 16 tons tipo VITA. O slider e as amostras mudam a cor do dente 3D, e o botão "Simular clareamento" anima até o B1.
- **Antes e depois:** um slider de arrastar. Hoje usa renders do próprio dente, amarelado (A4) e clareado (B1).
- **Equipe, depoimentos, nota do Google, horários** (com o dia de hoje e "aberto agora"), **mapa** (carrega quando chega perto da tela).
- **Agendamento:** um formulário com nome, tratamento, dia (os próximos dias abertos), período e observação. Ele mostra a mensagem pronta num balão e abre `wa.me` com esse texto. Os botões de WhatsApp do topo e o botão flutuante usam a mensagem padrão.

## Arquivos
| Arquivo | O que faz |
|---|---|
| `index.html` | Estrutura das seções e o importmap do Three.js |
| `css/estilo.css` | Visual clínico claro: branco/azul-gelo, vidro fosco (`backdrop-filter`), cores da logo (#02558a e #34a8dc), topo sticky, menu do celular, sliders, reservas sem WebGL e modo sem movimento |
| `js/dados.js` | **Todos os dados da clínica.** É o único arquivo que precisa mudar pra trocar texto, telefone, fotos etc. |
| `js/conteudo.js` | Preenche as seções, cuida do menu, dos contadores, dos controles do simulador, do slider de antes e depois (e do desenho 2D de reserva), do formulário de agendamento e do mapa |
| `js/dente.js` | Dente procedural: uma função de distância (coroa com 4 cúspides e sulcos, colo, 3 raízes) vira malha pelo MarchingCubes do Three. Também tem o material de esmalte |
| `js/cenas.js` | As 6 mini-cenas dos tratamentos e o dente simples do simulador e do antes e depois |
| `js/cena.js` | Um renderer WebGL só, fora da página. Cada `div.palco` tem um canvas 2D, e a cena é desenhada no canto do renderer e copiada pra ele. Por isso o 3D rola junto com a página sem atraso. Aqui também ficam o topo (vidro + partículas + logo), o laço e o desempenho |
| `assets/simbolo.svg` | Símbolo da logo em vetor, traçado com a receita da `tracar()` do `gerar_stand.py`. Também é a fonte dos pontos das partículas |
| `assets/logo-prodente.png` | A logo original (cópia) |

## Desempenho e acessibilidade
- O DPR fica limitado a 2 no PC e a 1,75 no celular, e baixa sozinho se ficar abaixo de ~40 fps. O celular usa menos partículas, menos bolhas, dente com menos polígonos e o vidro sem iridescência.
- Só são desenhadas as cenas visíveis (IntersectionObserver). O laço para quando nada está na tela ou quando a aba some.
- Sem WebGL, o topo mostra a logo em SVG, os tratamentos mostram ícones, o simulador vira um dente SVG que muda de cor e o antes e depois vira um desenho 2D.
- Com `prefers-reduced-motion`, nada gira. O topo fica com a altura normal, sem a transformação em partículas, e cada mini-cena mostra um quadro parado.
- No celular, a barra de endereço que aparece e some ao rolar não reconstrói as cenas.

## Como foi testado (2026-10-28, à noite)
O preview do navegador embutido pedia aprovação e não havia ninguém pra aprovar. Por isso testei com o Chrome headless
(WebGL por software, SwiftShader), abrindo o arquivo direto, em 1440×900 e em 375×812 (celular, DPR 2). Rolei por todas
as seções e tirei prints. O console ficou **sem erros**. A única coisa que aparece no celular emulado é o aviso de
desempenho "GPU stall due to ReadPixels", que vem da cópia WebGL→canvas 2D no renderizador por software. Num aparelho
de verdade, com GPU, essa cópia é feita na placa. **Falta ver num celular de verdade** se fica liso; o fps do headless
não serve de medida.

## Trocar pelo real
- **Fotos de antes e depois:** em `dados.js` → `antesDepois.antes` e `antesDepois.depois` (ex.: `"assets/antes-1.jpg"`). As duas precisam ter o mesmo enquadramento. Com elas vazias, o site usa os renders 3D.
- **Cores da escala de clareamento:** são **aproximadas, feitas a olho**, não são medidas da escala VITA real. O site avisa que a simulação é ilustrativa.

## Dados inventados (todos em `js/dados.js`)
- Slogan: "Sorrisos saudáveis, cuidado de verdade."
- Cidade: Paulínia - SP (real)
- WhatsApp: (19) 98143-3568 (real). **Os das psicólogas, (19) 90000-0001 a 0004, são fictícios: trocar antes de publicar**
- Telefone: (19) 3833-3428 (real)
- Instagram: @prodente.clinica (real)
- E-mail: prodente.clinica@gmail.com (real)
- Endereço: Av. Duque de Caxias, 646 — João Aranha, CEP 13145-700 (real)
- Texto do "Sobre nós" (2 parágrafos)
- Números: 27+ anos (informado pela família); 8.000+ pacientes e 9 especialidades sem fonte, mantidos por enquanto
- Tratamentos: os 6 com 3D (Implantes, Ortodontia, Clareamento, Limpeza e prevenção, Próteses, Tratamento de canal) e os 3 sem 3D (Clínica geral, Atendimento infantil, Estética e lentes), com as descrições
- Equipe: dados reais desde 2026-11-04. Fotos reais dos 5 dentistas e da Luciana desde 2026-11-07, recortadas em quadrado 400 px em `assets/equipe/`. Faltam as 4 psicólogas (`dados.js` → `equipe[].foto`; vazio mostra um placeholder). Responsável técnica: Dra. Daniela (`responsavel: true`).
- Depoimentos: trechos reais do Google Maps, lidos em 2026-11-04
- Google: nota 4,5 com 22 avaliações (2026-11-04). O link "Avaliar no Google" é uma busca pelo endereço; trocar pelo link de avaliação da ficha
- Horários: seg a sex 08:30–19:00, sáb e dom fechado (Google Maps)
- Períodos do agendamento: Manhã, Tarde, Fim da tarde
- Escala de cor: os 16 tons (cores aproximadas) e o tom inicial A3.5
- Antes e depois: renders 3D ilustrativos (A4 → B1), com legenda avisando
