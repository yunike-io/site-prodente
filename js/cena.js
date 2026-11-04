// Parte 3D do site. Um renderer WebGL só, fora da página: cada "palco" (div.palco com um <canvas> 2D)
// recebe a sua cena desenhada no canto do renderer e copiada com drawImage. Assim o 3D rola junto com
// a página sem atraso e só as cenas visíveis são desenhadas.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { criarGeometriaDente } from "./dente.js";
import { CENAS, denteSimples, suave } from "./cenas.js";

const raiz = document.documentElement;
const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
const celular = matchMedia("(max-width: 760px), (pointer: coarse)").matches;
const T_PARADO = 4.2; // instante mostrado em cada mini-cena quando o sistema pede "reduzir movimento"

function semWebGL(motivo) {
  raiz.classList.remove("com-3d");
  raiz.classList.add("sem-3d");
  if (motivo) console.info("Site sem 3D:", motivo);
}

function temWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

// ruído 3D igual nos dois shaders (vidro que some e partícula que aparece no mesmo ponto)
const GLSL_RUIDO = `
float hash3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float ruido3(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float ruidoDente(vec3 p){ return clamp(0.65 * ruido3(p * 2.5) + 0.35 * ruido3(p * 6.0), 0.0, 1.0); }
`;

function iniciar() {
  if (!temWebGL()) return semWebGL("navegador sem WebGL");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) { return semWebGL(e.message); }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  renderer.setScissorTest(true);
  raiz.classList.remove("sem-3d");
  raiz.classList.add("com-3d"); // antes de medir(): as reservas mudam o tamanho dos palcos
  let dpr = Math.min(window.devicePixelRatio || 1, celular ? 1.75 : 2);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const ambiente = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const G = { dente: criarGeometriaDente(celular ? 52 : 68), coroa: criarGeometriaDente(celular ? 36 : 44, true) };

  // ---------- palcos ----------
  const palcos = [];
  function registrar(el, obj) {
    const canvas = el.querySelector("canvas");
    const p = Object.assign({ el, canvas, ctx: canvas.getContext("2d"), visivel: false, desenhado: false, w: 1, h: 1 }, obj);
    palcos.push(p);
    return p;
  }

  const elTopo = document.querySelector('.palco[data-cena="topo"]');
  if (elTopo) registrar(elTopo, criarTopo());
  document.querySelectorAll(".palco[data-cena]").forEach((el) => {
    const nome = el.dataset.cena;
    if (CENAS[nome]) registrar(el, CENAS[nome](G, ambiente));
  });
  const elSim = document.querySelector('.palco[data-cena="simulador"]');
  if (elSim) {
    const s = denteSimples(G, ambiente);
    s.dente.material.color.set(window.TOM_ATUAL || "#d9c092");
    const sim = registrar(elSim, {
      cena: s.cena, camera: s.camera,
      atualizar(t) { s.dente.rotation.y = semMovimento ? 0.6 : t * 0.35; }
    });
    window.addEventListener("tom", (e) => {
      s.dente.material.color.set(e.detail);
      if (semMovimento && sim.visivel) desenhar(sim, T_PARADO);
    });
  }

  function medir() {
    let maxW = 1, maxH = 1;
    palcos.forEach((p) => {
      p.w = Math.max(1, p.el.clientWidth);
      p.h = Math.max(1, p.el.clientHeight);
      p.canvas.width = Math.floor(p.w * dpr);
      p.canvas.height = Math.floor(p.h * dpr);
      maxW = Math.max(maxW, p.w); maxH = Math.max(maxH, p.h);
      if (p.redimensionar) p.redimensionar(p.w, p.h);
      else { p.camera.aspect = p.w / p.h; p.camera.updateProjectionMatrix(); }
      p.desenhado = false;
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(maxW, maxH, false);
    if (semMovimento) palcos.forEach((p) => { if (p.visivel) desenhar(p, T_PARADO); });
  }

  function desenhar(p, t) {
    p.atualizar(t);
    renderer.setViewport(0, 0, p.w, p.h);
    renderer.setScissor(0, 0, p.w, p.h);
    renderer.render(p.cena, p.camera);
    const fonte = renderer.domElement, pw = p.canvas.width, ph = p.canvas.height;
    p.ctx.clearRect(0, 0, pw, ph);
    p.ctx.drawImage(fonte, 0, fonte.height - ph, pw, ph, 0, 0, pw, ph);
    p.desenhado = true;
  }

  // ---------- topo: dente de cristal que vira partículas e forma a logo ----------
  function criarTopo() {
    const cena = new THREE.Scene();
    cena.environment = ambiente;
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    // fundo: esfera opaca em degradê (é o que o vidro refrata) — mesmas cores do CSS
    const fundo = new THREE.Mesh(new THREE.SphereGeometry(40, 48, 24), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
      fragmentShader: `varying vec3 vD;
        void main(){
          vec3 c = mix(vec3(0.886,0.953,0.988), vec3(0.98,0.995,1.0), smoothstep(-0.4, 0.5, vD.y));
          float halo = pow(max(dot(vD, normalize(vec3(0.0, 0.08, -1.0))), 0.0), 18.0);
          float faixa = pow(max(dot(vD, normalize(vec3(-0.6, -0.35, -1.0))), 0.0), 10.0);
          c = mix(c, vec3(0.62,0.85,0.96), halo * 0.75);
          c = mix(c, vec3(0.20,0.66,0.86), faixa * 0.35);
          gl_FragColor = vec4(c, 1.0);
        }`
    }));
    cena.add(fundo);

    // bolhas atrás do dente, pra ter o que refratar
    const bolhas = [];
    // sem azul-escuro: vista através do vidro, bolha escura parece cárie
    const cores = ["#bfe6fa", "#34a8dc", "#ffffff", "#8fd3f2", "#5bbce6"];
    const qtdBolhas = celular ? 6 : 11;
    for (let i = 0; i < qtdBolhas; i++) {
      const r = 0.05 + Math.random() * 0.17;
      const b = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), new THREE.MeshPhysicalMaterial({
        color: cores[i % cores.length], roughness: 0.15, clearcoat: 1, metalness: 0, envMapIntensity: 1
      }));
      // num anel em volta do dente: atrás dele, a bolha refratada no vidro parece um furo
      // (só do lado direito e em cima/embaixo, longe do texto)
      const ang = -1.9 + (i / qtdBolhas) * 3.8 + Math.random() * 0.3, raio = 2.7 + Math.random() * 1.2;
      b.userData = { x: Math.cos(ang) * raio * 1.2, y: Math.sin(ang) * raio * 0.75, z: -2.5 - Math.random() * 3, f: Math.random() * 6, v: 0.2 + Math.random() * 0.3 };
      bolhas.push(b);
      cena.add(b);
    }

    const luz = new THREE.DirectionalLight("#ffffff", 2.2);
    luz.position.set(3, 4, 5);
    const luz2 = new THREE.DirectionalLight("#bfe6fa", 1.2);
    luz2.position.set(-4, -1, 2);
    cena.add(luz, luz2);

    // vidro com dissolução: o shader descarta os pontos onde o ruído < uDiss e acende a borda
    const U = { uDiss: { value: 0 }, uMorf: { value: 0 }, uTempo: { value: 0 } };
    const vidro = new THREE.MeshPhysicalMaterial({
      color: "#ffffff", metalness: 0, roughness: 0.05, transmission: 1, thickness: 1.3, ior: 1.5,
      clearcoat: 1, clearcoatRoughness: 0.04, attenuationColor: new THREE.Color("#9fd6f2"), attenuationDistance: 2.2,
      specularIntensity: 1, iridescence: celular ? 0 : 0.35, iridescenceIOR: 1.3, envMapIntensity: 1.5
    });
    vidro.onBeforeCompile = (sh) => {
      sh.uniforms.uDiss = U.uDiss;
      sh.vertexShader = "varying vec3 vPosL;\n" + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvPosL = position;");
      sh.fragmentShader = "uniform float uDiss;\nvarying vec3 vPosL;\n" + GLSL_RUIDO + sh.fragmentShader
        .replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\nfloat nD = ruidoDente(vPosL);\nif (nD < uDiss) discard;")
        .replace("#include <dithering_fragment>", "#include <dithering_fragment>\nfloat borda = (1.0 - smoothstep(0.0, 0.045, nD - uDiss)) * step(0.001, uDiss);\ngl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.25, 0.75, 1.0) * 1.3, borda);");
    };
    const dente = new THREE.Mesh(G.dente, vidro);
    const pivo = new THREE.Group();
    pivo.add(dente);
    cena.add(pivo);

    // partículas: posição no dente (amostrada na superfície) e na logo
    const N = semMovimento ? 0 : (celular ? 5200 : 11000);
    let pontos = null;
    if (N) {
      const amostrador = new MeshSurfaceSampler(new THREE.Mesh(G.dente)).build();
      const pos = new Float32Array(N * 3), alvo = new Float32Array(N * 3), cor = new Float32Array(N * 3), aleat = new Float32Array(N);
      const v = new THREE.Vector3();
      for (let i = 0; i < N; i++) {
        amostrador.sample(v);
        pos.set([v.x, v.y, v.z], i * 3);
        aleat[i] = Math.random();
        cor.set([0.2, 0.66, 0.86], i * 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aAlvo", new THREE.BufferAttribute(alvo, 3));
      geo.setAttribute("aCor", new THREE.BufferAttribute(cor, 3));
      geo.setAttribute("aAleat", new THREE.BufferAttribute(aleat, 1));
      Object.assign(U, { uDente: { value: new THREE.Matrix4() }, uLogo: { value: new THREE.Vector3(2, 0, 0) }, uTam: { value: celular ? 26 : 21 }, uPixel: { value: dpr } });
      pontos = new THREE.Points(geo, new THREE.ShaderMaterial({
        uniforms: U, transparent: true, depthWrite: false,
        vertexShader: `uniform float uDiss, uMorf, uTempo, uTam, uPixel; uniform mat4 uDente; uniform vec3 uLogo;
          attribute vec3 aAlvo; attribute vec3 aCor; attribute float aAleat;
          varying vec3 vCor; varying float vAlfa;
          ${GLSL_RUIDO}
          void main(){
            float n = ruidoDente(position);
            vec3 a = (uDente * vec4(position, 1.0)).xyz;
            vec3 centro = (uDente * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
            vec3 b = vec3(aAlvo.xy * uLogo.x + vec2(uLogo.z, uLogo.y), aAlvo.z);
            float t = clamp((uMorf - n * 0.45) / 0.55, 0.0, 1.0);
            float e = t * t * (3.0 - 2.0 * t);
            float arco = sin(e * 3.14159);
            vec3 p = mix(a, b, e) + normalize(a - centro + 0.0001) * arco * (0.45 + aAleat * 0.9);
            p.z += arco * (aAleat - 0.5) * 1.6;
            p += vec3(sin(uTempo * 0.9 + aAleat * 50.0), cos(uTempo * 0.8 + aAleat * 31.0), sin(uTempo * 0.7 + aAleat * 17.0)) * 0.012 * (1.0 + 3.0 * arco);
            vCor = mix(vec3(0.55, 0.82, 0.96), aCor, smoothstep(0.35, 1.0, e));
            vAlfa = clamp((uDiss - n) / 0.05, 0.0, 1.0);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = uTam * uPixel * (0.7 + aAleat * 0.6) * (1.0 + arco * 0.6) / -mv.z;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `varying vec3 vCor; varying float vAlfa;
          void main(){
            vec2 c = gl_PointCoord - 0.5; float r = length(c);
            float a = smoothstep(0.5, 0.18, r) * vAlfa;
            if (a < 0.01) discard;
            gl_FragColor = vec4(vCor + (0.22 - r) * 0.35, a);
          }`
      }));
      pontos.frustumCulled = false;
      pontos.visible = false;
      cena.add(pontos);
      carregarAlvosLogo(alvo, cor, N).then(() => {
        geo.attributes.aAlvo.needsUpdate = true;
        geo.attributes.aCor.needsUpdate = true;
      });
    }

    // ponteiro inclina o dente
    const mira = { x: 0, y: 0 }, atual = { x: 0, y: 0 };
    if (!semMovimento) window.addEventListener("pointermove", (e) => {
      mira.x = e.clientX / innerWidth * 2 - 1;
      mira.y = e.clientY / innerHeight * 2 - 1;
    }, { passive: true });

    const secao = document.getElementById("topo");
    let giro = 0.6, tAnterior = 0, escala = 1;
    return {
      cena, camera,
      redimensionar(w, h) {
        const largo = w >= 900;
        camera.aspect = w / h;
        camera.setViewOffset(w, h, largo ? -w * 0.2 : 0, largo ? 0 : h * 0.13, w, h);
        camera.updateProjectionMatrix();
        const vh = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), vw = vh * camera.aspect;
        escala = Math.min(vh * (largo ? 0.6 : 0.34) / 1.65, vw * (largo ? 0.4 : 0.6) / 1.05);
        pivo.scale.setScalar(escala);
        if (U.uLogo) {
          const L = Math.min(vh * (largo ? 0.62 : 0.42) / 0.81, vw * (largo ? 0.42 : 0.8));
          U.uLogo.value.set(L, 0, 0);
          U.uPixel.value = dpr;
        }
      },
      atualizar(t) {
        const dt = Math.min(0.05, Math.max(0, t - tAnterior)); tAnterior = t;
        U.uTempo.value = t;
        // progresso do scroll dentro da seção do topo (ela é mais alta que a tela; o palco é sticky)
        let p = 0;
        if (!semMovimento && secao) {
          const r = secao.getBoundingClientRect(), curso = r.height - innerHeight;
          p = curso > 0 ? Math.min(1, Math.max(0, -r.top / curso)) : 0;
        }
        const diss = suave(0.04, 0.42, p) * 1.08, morf = suave(0.1, 0.88, p);
        U.uDiss.value = diss;
        U.uMorf.value = morf;
        raiz.style.setProperty("--morf", morf.toFixed(3));
        atual.x += (mira.x - atual.x) * 0.05;
        atual.y += (mira.y - atual.y) * 0.05;
        if (!semMovimento) giro += dt * (0.55 * (1 - morf) + 0.05);
        dente.rotation.set(0.18 + atual.y * 0.25, giro + atual.x * 0.5, -0.12);
        pivo.position.y = semMovimento ? 0 : Math.sin(t * 1.1) * 0.05 * escala;
        dente.visible = diss < 1.07;
        bolhas.forEach((b) => {
          const u = b.userData;
          b.position.set(u.x + Math.sin(t * u.v + u.f) * 0.15, u.y + Math.sin(t * u.v * 0.8 + u.f * 2) * 0.2, u.z);
          b.scale.setScalar(Math.max(0.001, 1 - morf * 1.4)); // somem enquanto a logo se forma
        });
        if (pontos) {
          pivo.updateMatrixWorld();
          U.uDente.value.copy(dente.matrixWorld);
          pontos.visible = diss > 0.001;
        }
      }
    };
  }

  // pontos da logo: desenha o símbolo SVG num canvas e sorteia pixels pintados (com a cor deles)
  function carregarAlvosLogo(alvo, cor, N) {
    return new Promise((ok) => {
      const img = new Image();
      img.onload = () => {
        const W = 520, H = Math.round(W * img.height / img.width) || 422;
        const c = document.createElement("canvas");
        c.width = W; c.height = H;
        const x = c.getContext("2d", { willReadFrequently: true });
        x.drawImage(img, 0, 0, W, H);
        const d = x.getImageData(0, 0, W, H).data, cheios = [];
        for (let i = 0; i < W * H; i++) if (d[i * 4 + 3] > 140) cheios.push(i);
        if (!cheios.length) return ok();
        for (let k = 0; k < N; k++) {
          const i = cheios[(Math.random() * cheios.length) | 0];
          const px = (i % W) + Math.random(), py = Math.floor(i / W) + Math.random();
          alvo.set([px / W - 0.5, -(py / W - 0.5 * H / W), (Math.random() - 0.5) * 0.03], k * 3);
          cor.set([d[i * 4] / 255, d[i * 4 + 1] / 255, d[i * 4 + 2] / 255], k * 3);
        }
        ok();
      };
      img.onerror = () => ok();
      img.src = "assets/simbolo.svg";
    });
  }

  // ---------- antes e depois: renders do dente amarelado e clareado ----------
  function gerarAntesDepois() {
    const quadros = document.querySelectorAll(".ad-quadro canvas[data-tom]");
    if (!quadros.length) return;
    const s = denteSimples(G, ambiente);
    s.dente.rotation.set(0.12, 0.7, -0.05);
    s.camera.position.set(0, 0.1, 3.3);
    quadros.forEach((cv) => {
      const w = cv.clientWidth || 400, h = cv.clientHeight || 300;
      cv.width = Math.floor(w * dpr); cv.height = Math.floor(h * dpr);
      const bw = renderer.domElement.width / dpr, bh = renderer.domElement.height / dpr;
      if (w > bw || h > bh) renderer.setSize(Math.max(w, bw), Math.max(h, bh), false);
      s.dente.material.color.set(cv.dataset.tom);
      s.camera.aspect = w / h;
      s.camera.updateProjectionMatrix();
      renderer.setViewport(0, 0, w, h);
      renderer.setScissor(0, 0, w, h);
      renderer.render(s.cena, s.camera);
      const x = cv.getContext("2d"), fonte = renderer.domElement;
      const g = x.createLinearGradient(0, 0, 0, cv.height);
      g.addColorStop(0, "#f4fbff"); g.addColorStop(1, "#d4ecf8");
      x.fillStyle = g;
      x.fillRect(0, 0, cv.width, cv.height);
      x.drawImage(fonte, 0, fonte.height - cv.height, cv.width, cv.height, 0, 0, cv.width, cv.height);
    });
    s.dente.material.dispose();
    raiz.classList.add("ad-3d");
  }

  // ---------- laço ----------
  let rodando = false, amostras = 0, soma = 0, ultimo = 0;
  function quadro(agora) {
    if (!rodando) return;
    requestAnimationFrame(quadro);
    const t = agora / 1000;
    palcos.forEach((p) => { if (p.visivel) desenhar(p, t); });
    // qualidade adaptativa: se ficar abaixo de ~40 fps, baixa a resolução
    if (ultimo) {
      soma += agora - ultimo; amostras++;
      if (amostras === 90) {
        if (soma / amostras > 25 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); medir(); }
        amostras = 0; soma = 0;
      }
    }
    ultimo = agora;
  }
  function ligar() {
    if (semMovimento || rodando || document.hidden || !palcos.some((p) => p.visivel)) return;
    rodando = true; ultimo = 0;
    requestAnimationFrame(quadro);
  }
  function desligar() { rodando = false; }

  const obs = new IntersectionObserver((itens) => {
    itens.forEach((it) => {
      const p = palcos.find((q) => q.el === it.target);
      if (!p) return;
      p.visivel = it.isIntersecting;
      if (semMovimento && p.visivel && !p.desenhado) desenhar(p, T_PARADO);
    });
    if (palcos.some((p) => p.visivel)) ligar(); else desligar();
  }, { rootMargin: "60px 0px" });
  palcos.forEach((p) => obs.observe(p.el));

  document.addEventListener("visibilitychange", () => { if (document.hidden) desligar(); else ligar(); });
  // no celular a barra de endereço some/aparece ao rolar e dispara resize: só remede se mudou de verdade
  let espera, ultW = innerWidth, ultH = innerHeight;
  const remedir = () => {
    if (innerWidth === ultW && Math.abs(innerHeight - ultH) < 160) return;
    ultW = innerWidth; ultH = innerHeight;
    clearTimeout(espera);
    espera = setTimeout(() => { medir(); gerarAntesDepois(); }, 150);
  };
  window.addEventListener("resize", remedir);
  window.addEventListener("orientationchange", remedir);
  renderer.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); desligar(); semWebGL("contexto WebGL perdido"); });

  medir();
  gerarAntesDepois();
  raiz.classList.add("com-3d");
  ligar();
}

try {
  iniciar();
} catch (e) {
  console.error(e);
  semWebGL(e.message);
}
