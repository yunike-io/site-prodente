// Preenche as seções com os dados de dados.js e cuida de tudo que não é 3D: menu, entradas animadas,
// contadores, simulador de cor (controle e reserva 2D), antes e depois, agendamento e mapa.
(function () {
  "use strict";
  var D = window.DADOS;
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (t) { var d = document.createElement("div"); d.textContent = t; return d.innerHTML; };
  var semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (semMovimento) document.documentElement.classList.add("sem-movimento");

  var ICONES = {
    dente: '<path d="M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7.5.4 2.6 1 6 2.5 6s1.6-4.5 2.5-4.5h4c.9 0 1 4.5 2.5 4.5s2.1-3.4 2.5-6c.5-3 2-4.5 2-7.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z"/>',
    brilho: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    aparelho: '<path d="M3 12h18"/><rect x="5" y="9" width="3" height="6" rx="1"/><rect x="10.5" y="9" width="3" height="6" rx="1"/><rect x="16" y="9" width="3" height="6" rx="1"/>',
    implante: '<path d="M8 3h8l-1 5H9L8 3Z"/><path d="M10 8v2h4V8M10.5 10l-.5 2h4l-.5-2M10 12l.5 2h3l.5-2M10.5 14l.5 2h2l.5-2M11 16l1 5 1-5"/>',
    coroa: '<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8Z"/>',
    raiz: '<path d="M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7.5.4 2.6 1 6 2.5 6s1.6-4.5 2.5-4.5h4c.9 0 1 4.5 2.5 4.5s2.1-3.4 2.5-6c.5-3 2-4.5 2-7.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z"/><path d="M9 9v6M15 9v6"/>',
    crianca: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4 4 0 0 0 7 0"/><path d="M9 9.5h.01M15 9.5h.01"/>',
    estrela: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
    tel: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
    insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    pino: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    coracao: '<path d="M12 20.5S3.5 15.4 3.5 9.2A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.5 2.7c0 6.2-8.5 11.3-8.5 11.3Z"/>',
    livro: '<path d="M12 6.5C10 5 7 4.5 3.5 4.5v14c3.5 0 6.5.5 8.5 2 2-1.5 5-2 8.5-2v-14C17 4.5 14 5 12 6.5Z"/><path d="M12 6.5v14"/>'
  };
  var ICONE_CENA = { implante: "implante", aparelho: "aparelho", clareamento: "sol", limpeza: "brilho", protese: "coroa", canal: "raiz" };
  var DENTE_PATH = "M7 3c-2.5 0-4 2-4 4.5 0 3 1.5 4.5 2 7.5.4 2.6 1 6 2.5 6s1.6-4.5 2.5-4.5h4c.9 0 1 4.5 2.5 4.5s2.1-3.4 2.5-6c.5-3 2-4.5 2-7.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z";
  var icone = function (n) {
    return '<svg class="icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONES[n] + "</svg>";
  };
  var estrelas = function (n) { return '<span class="estrelas" aria-label="' + n + ' de 5 estrelas">' + "★★★★★".slice(0, Math.round(n)) + "</span>"; };
  var numBR = function (v, casas) { return v.toLocaleString("pt-BR", { minimumFractionDigits: casas || 0, maximumFractionDigits: casas || 0 }); };
  var linkWhatsTexto = function (texto) { return "https://wa.me/" + D.whatsapp + "?text=" + encodeURIComponent(texto); };

  // ---------- links ----------
  var linkWhats = linkWhatsTexto(D.whatsappMensagem);
  document.querySelectorAll("[data-whats]").forEach(function (a) { a.href = linkWhats; });
  document.querySelectorAll('[data-d="slogan"]').forEach(function (e) { e.textContent = D.slogan; });

  // ---------- sobre ----------
  $("#sobreTexto").innerHTML = D.sobre.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  $("#numeros").innerHTML = D.numeros.map(function (n) {
    var valor = n.valor === "google" ? D.google.nota : n.valor;
    return '<div class="numero vidro"><strong data-alvo="' + valor + '" data-casas="' + (n.casas || 0) + '" data-sufixo="' + esc(n.sufixo) + '">0</strong><span>' + esc(n.rotulo) + "</span></div>";
  }).join("");

  // ---------- tratamentos (cada um com um palco 3D; o ícone é a reserva sem WebGL) ----------
  $("#listaTratamentos").innerHTML = D.tratamentos.map(function (t, i) {
    return '<article class="cartao vidro tratamento entra" style="--atraso:' + (i % 3) * 90 + 'ms">' +
      '<div class="palco palco-trat" data-cena="' + t.cena + '"><canvas aria-hidden="true"></canvas><span class="palco-reserva">' + icone(ICONE_CENA[t.cena] || "dente") + "</span></div>" +
      '<div class="tratamento-texto"><h3>' + esc(t.titulo) + "</h3><p>" + esc(t.texto) + "</p></div></article>";
  }).join("");
  $("#outrosTratamentos").innerHTML = D.outrosTratamentos.map(function (t, i) {
    return '<article class="cartao vidro outro entra" style="--atraso:' + i * 90 + 'ms">' + icone(t.icone) +
      "<div><h3>" + esc(t.titulo) + "</h3><p>" + esc(t.texto) + "</p></div></article>";
  }).join("");

  // ---------- simulador de clareamento ----------
  var escala = D.escalaCor, nTons = escala.length;
  var iInicial = Math.max(0, escala.map(function (e) { return e.cod; }).indexOf(D.tomInicial));
  var faixa = $("#simTons"), entrada = $("#simEntrada");
  faixa.innerHTML = escala.map(function (e, i) {
    return '<li style="--c:' + e.cor + '" data-i="' + i + '"><span>' + esc(e.cod) + "</span></li>";
  }).join("");
  entrada.max = nTons - 1;
  entrada.value = iInicial;
  function mostrarTom(i) {
    i = Math.round(i);
    var e = escala[i];
    window.TOM_ATUAL = e.cor;
    window.dispatchEvent(new CustomEvent("tom", { detail: e.cor }));
    $("#simCodigo").textContent = e.cod;
    var dif = i - iInicial;
    $("#simDif").textContent = dif > 0 ? dif + (dif === 1 ? " tom mais claro" : " tons mais claro") :
      dif < 0 ? -dif + (dif === -1 ? " tom mais escuro" : " tons mais escuro") : "tom de partida";
    $("#simDenteReserva").style.setProperty("--c", e.cor);
    faixa.querySelectorAll("li").forEach(function (li, k) { li.classList.toggle("ativo", k === i); });
    entrada.setAttribute("aria-valuetext", e.cod + ", " + $("#simDif").textContent);
    document.documentElement.style.setProperty("--sim-pos", (i / (nTons - 1) * 100).toFixed(2) + "%");
  }
  entrada.addEventListener("input", function () { mostrarTom(+entrada.value); });
  faixa.addEventListener("click", function (ev) {
    var li = ev.target.closest("li");
    if (li) { entrada.value = li.dataset.i; mostrarTom(+li.dataset.i); }
  });
  $("#simClarear").addEventListener("click", function () {
    var de = +entrada.value, ate = nTons - 1;
    if (semMovimento || de >= ate) { entrada.value = ate; mostrarTom(ate); return; }
    var t0 = performance.now(), dur = 1800;
    (function passo(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3), v = de + (ate - de) * e;
      entrada.value = Math.round(v);
      mostrarTom(v);
      if (k < 1) requestAnimationFrame(passo);
    })(t0);
  });
  mostrarTom(iInicial);

  // ---------- antes e depois ----------
  var AD = D.antesDepois, quadro = $("#adQuadro");
  var camada = function (lado, rotulo, tom, foto) {
    var miolo = foto ? '<img src="' + esc(foto) + '" alt="' + rotulo + ' do tratamento">' : '<canvas data-tom="' + tom + '" aria-hidden="true"></canvas>';
    return '<div class="ad-camada ad-' + lado + '">' + miolo + '<span class="ad-rotulo">' + rotulo + "</span></div>";
  };
  var comFotos = !!(AD.antes && AD.depois);
  quadro.innerHTML = camada("antes", "Antes", AD.tomAntes, comFotos && AD.antes) + camada("depois", "Depois", AD.tomDepois, comFotos && AD.depois) +
    '<div class="ad-linha" aria-hidden="true"><span></span></div>' +
    '<input class="ad-entrada" type="range" min="0" max="100" value="50" aria-label="Arraste para comparar antes e depois">';
  $("#adLegenda").textContent = AD.legenda;
  var adEntrada = quadro.querySelector(".ad-entrada");
  var adPos = function () { quadro.style.setProperty("--pos", adEntrada.value + "%"); };
  adEntrada.addEventListener("input", adPos);
  adPos();
  // desenho 2D de reserva (o cena.js troca pelo render 3D quando há WebGL)
  if (!comFotos) quadro.querySelectorAll("canvas[data-tom]").forEach(function (cv) {
    var r = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth || 400, h = cv.clientHeight || 300;
    cv.width = w * r; cv.height = h * r;
    var x = cv.getContext("2d"), g = x.createLinearGradient(0, 0, 0, cv.height);
    g.addColorStop(0, "#f4fbff"); g.addColorStop(1, "#d4ecf8");
    x.fillStyle = g; x.fillRect(0, 0, cv.width, cv.height);
    var s = Math.min(cv.width, cv.height) / 30;
    x.translate(cv.width / 2 - 12 * s, cv.height / 2 - 12.5 * s);
    x.scale(s, s);
    x.fillStyle = cv.dataset.tom; x.strokeStyle = "rgba(2,58,95,.25)"; x.lineWidth = 0.3;
    var p = new Path2D(DENTE_PATH);
    x.fill(p); x.stroke(p);
  });

  // ---------- equipe ----------
  var whatsPessoa = function (p) {
    if (!p.whatsapp) return "";
    var msg = "Olá, " + p.nome.split(" ")[0] + "! Vim pelo site da " + D.nome + " e gostaria de agendar um atendimento.";
    return '<a class="botao botao-whats pessoa-whats" target="_blank" rel="noopener" aria-label="WhatsApp de ' + esc(p.nome) + '" href="https://wa.me/' + p.whatsapp + "?text=" + encodeURIComponent(msg) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-whats"/></svg>' + esc(p.whatsappTexto) + "</a>";
  };
  var cartoesEquipe = function (lista) { return lista.map(function (p, i) {
    var retrato = p.foto
      ? '<img class="avatar" src="' + esc(p.foto) + '" alt="Foto de ' + esc(p.nome) + '" loading="lazy">'
      : '<div class="avatar avatar-vazio" role="img" aria-label="Foto em breve"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4.2"/><path d="M3.8 21.5c.7-5 4-7.6 8.2-7.6s7.5 2.6 8.2 7.6z"/></svg></div>';
    return '<article class="cartao vidro pessoa entra" style="--atraso:' + i * 90 + 'ms">' + retrato +
      "<h3>" + esc(p.nome) + '</h3>' + (p.titulo ? '<p class="titulo-pessoa">' + esc(p.titulo) + '</p>' : '') + '<p class="cargo">' + esc(p.cargo) + '</p><p class="cro">' + esc(p.cro) + "</p>" + whatsPessoa(p) + "</article>";
  }).join(""); };
  $("#listaEquipe").innerHTML = cartoesEquipe(D.equipe.filter(function (p) { return p.area !== "psicologia"; }));

  // ---------- psicologia ----------
  $("#psiIntro").textContent = D.psicologia.intro;
  $("#psiAreas").innerHTML = D.psicologia.areas.map(function (t, i) {
    return '<article class="cartao vidro outro entra" style="--atraso:' + i * 90 + 'ms">' + icone(t.icone) +
      "<div><h3>" + esc(t.titulo) + "</h3><p>" + esc(t.texto) + "</p></div></article>";
  }).join("");
  $("#listaPsicologia").innerHTML = cartoesEquipe(D.equipe.filter(function (p) { return p.area === "psicologia"; }));
  $("#psiWhats").href = linkWhatsTexto(D.psicologia.whatsappMensagem);

  // ---------- depoimentos e Google ----------
  $("#listaDepoimentos").innerHTML = D.depoimentos.map(function (d) {
    return '<figure class="cartao vidro depoimento">' + estrelas(d.nota) + "<blockquote>“" + esc(d.texto) + "”</blockquote><figcaption>" + esc(d.nome) + "</figcaption></figure>";
  }).join("");
  $("#google").innerHTML =
    '<div class="google-nota"><span class="g-logo" aria-hidden="true">G</span><div><strong>' + numBR(D.google.nota, 1) + "</strong> " + estrelas(D.google.nota) +
    "<p>" + D.google.avaliacoes + ' avaliações no Google</p></div></div><a class="botao botao-escuro" target="_blank" rel="noopener" href="' + D.google.link + '">Avaliar no Google</a>';

  // ---------- localização e horários ----------
  var endCompleto = D.endereco + ", " + D.cidade + " — CEP " + D.cep;
  $("#endereco").innerHTML = icone("pino") + "<span>" + esc(endCompleto) + "</span>";
  $("#rota").href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(D.mapaBusca);
  var agora = new Date(), hoje = agora.getDay();
  $("#horarios").innerHTML = D.horarios.map(function (h) {
    return '<li class="' + (h.dia === hoje ? "hoje" : "") + '"><span>' + esc(h.rotulo) + (h.dia === hoje ? " <em>hoje</em>" : "") + "</span><span>" + esc(h.horas) + "</span></li>";
  }).join("");
  // "aberto agora" a partir do texto "08:00 – 19:00" do dia de hoje
  var hHoje = D.horarios.filter(function (h) { return h.dia === hoje; })[0];
  var faixaH = hHoje && hHoje.horas.match(/(\d\d):(\d\d)\s*[–-]\s*(\d\d):(\d\d)/);
  var minAgora = agora.getHours() * 60 + agora.getMinutes();
  var aberto = faixaH && minAgora >= +faixaH[1] * 60 + +faixaH[2] && minAgora < +faixaH[3] * 60 + +faixaH[4];
  $("#estadoAgora").innerHTML = icone("relogio") + (aberto ? "Aberto agora — até " + faixaH[3] + ":" + faixaH[4] : "Fechado agora");
  $("#estadoAgora").classList.toggle("aberto", !!aberto);

  function carregarMapa() {
    var m = $("#mapa");
    if (m.querySelector("iframe")) return;
    var f = document.createElement("iframe");
    f.title = "Mapa da clínica";
    f.loading = "lazy";
    f.referrerPolicy = "no-referrer-when-downgrade";
    f.src = "https://www.google.com/maps?q=" + encodeURIComponent(D.mapaBusca) + "&output=embed";
    m.innerHTML = "";
    m.appendChild(f);
  }
  $("#mapaCarregar").addEventListener("click", carregarMapa);

  // ---------- agendamento: monta a mensagem pronta e abre o WhatsApp ----------
  var form = $("#formAgenda");
  var opcoes = function (lista) { return lista.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + "</option>"; }).join(""); };
  $("#agTratamento").innerHTML = opcoes(["Avaliação / primeira consulta"].concat(D.tratamentos.map(function (t) { return t.titulo; }), D.outrosTratamentos.map(function (t) { return t.titulo; }), D.psicologia.areas.map(function (t) { return t.titulo; })));
  $("#agPeriodo").innerHTML = opcoes(["Qualquer horário"].concat(D.periodos));
  var dias = ["Qualquer dia"], nomes = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  for (var k = 1; dias.length < 9 && k < 21; k++) {
    var dt = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + k);
    var hd = D.horarios.filter(function (h) { return h.dia === dt.getDay(); })[0];
    if (hd && !/fechado/i.test(hd.horas)) dias.push(nomes[dt.getDay()][0].toUpperCase() + nomes[dt.getDay()].slice(1) + ", " + ("0" + dt.getDate()).slice(-2) + "/" + ("0" + (dt.getMonth() + 1)).slice(-2));
  }
  $("#agDia").innerHTML = opcoes(dias);
  function mensagem() {
    var v = function (id) { return $(id).value.trim(); };
    var linhas = ["Olá! Vim pelo site da " + D.nome + " e gostaria de agendar uma consulta."];
    if (v("#agNome")) linhas.push("Nome: " + v("#agNome"));
    linhas.push("Tratamento: " + v("#agTratamento"));
    var quando = [v("#agDia"), v("#agPeriodo")].filter(function (s) { return !/^Qualquer/.test(s); });
    linhas.push("Preferência: " + (quando.length ? quando.join(", ").toLowerCase() : "qualquer dia e horário"));
    if (v("#agObs")) linhas.push("Observação: " + v("#agObs"));
    return linhas.join("\n");
  }
  var previa = function () { $("#agPrevia").textContent = mensagem(); };
  form.addEventListener("input", previa);
  form.addEventListener("change", previa);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    window.open(linkWhatsTexto(mensagem()), "_blank", "noopener");
  });
  previa();

  // ---------- contato ----------
  var contatos = [
    { icone: "whats", titulo: "WhatsApp", texto: D.whatsappTexto, href: linkWhats, classe: "c-whats" },
    { icone: "insta", titulo: "Instagram", texto: "@" + D.instagram, href: "https://instagram.com/" + D.instagram, classe: "c-insta" },
    { icone: "tel", titulo: "Telefone", texto: D.telefoneTexto, href: "tel:+55" + D.telefone, classe: "c-tel" },
    { icone: "email", titulo: "E-mail", texto: D.email, href: "mailto:" + D.email, classe: "c-email" }
  ];
  $("#listaContato").innerHTML = contatos.map(function (c, i) {
    var ic = c.icone === "whats" ? '<svg class="icone" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-whats"/></svg>' : icone(c.icone);
    var fora = c.href.indexOf("http") === 0 ? ' target="_blank" rel="noopener"' : "";
    return '<a class="cartao vidro contato entra ' + c.classe + '" style="--atraso:' + i * 80 + 'ms" href="' + c.href + '"' + fora + ">" + ic +
      "<span><strong>" + c.titulo + "</strong><small>" + esc(c.texto) + "</small></span></a>";
  }).join("");

  // ---------- rodapé ----------
  var resp = D.equipe.filter(function (p) { return p.responsavel; })[0];
  if (resp) $("#responsavel").textContent = "Responsável técnica: " + resp.nome + " — " + resp.cro;
  $("#registro").textContent = D.nome + " — " + D.registro;
  $("#rodapeEndereco").textContent = endCompleto;
  $("#ano").textContent = new Date().getFullYear();

  // ---------- menu ----------
  var botao = $("#menuBotao"), barra = $("#barra");
  botao.addEventListener("click", function () {
    var aberto = barra.classList.toggle("aberto");
    botao.setAttribute("aria-expanded", aberto);
  });
  document.querySelectorAll("#menu a").forEach(function (a) {
    a.addEventListener("click", function () { barra.classList.remove("aberto"); botao.setAttribute("aria-expanded", false); });
  });
  var marcarBarra = function () {
    var rolou = window.scrollY > 40;
    barra.classList.toggle("rolada", rolou);
    document.body.classList.toggle("rolado", window.scrollY > window.innerHeight * 0.5);
  };
  window.addEventListener("scroll", marcarBarra, { passive: true });
  marcarBarra();

  // ---------- contadores ----------
  function contar(el) {
    var alvo = parseFloat(el.dataset.alvo), casas = +el.dataset.casas, suf = el.dataset.sufixo;
    if (semMovimento) { el.textContent = numBR(alvo, casas) + suf; return; }
    var t0 = performance.now(), dur = 1600;
    (function passo(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = numBR(alvo * e, casas) + suf;
      if (k < 1) requestAnimationFrame(passo);
    })(t0);
  }

  // ---------- entradas animadas ----------
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".entra").forEach(function (e) { e.classList.add("visivel"); });
    document.querySelectorAll("[data-alvo]").forEach(contar);
    carregarMapa();
    return;
  }
  var obs = new IntersectionObserver(function (itens) {
    itens.forEach(function (it) {
      if (!it.isIntersecting) return;
      it.target.classList.add("visivel");
      it.target.querySelectorAll("[data-alvo]").forEach(contar);
      obs.unobserve(it.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".entra").forEach(function (e) { obs.observe(e); });

  var obsMapa = new IntersectionObserver(function (itens) {
    if (itens[0].isIntersecting) { carregarMapa(); obsMapa.disconnect(); }
  }, { rootMargin: "300px" });
  obsMapa.observe($("#mapa"));
})();
