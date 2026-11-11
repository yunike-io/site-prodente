// Mini-cenas 3D dos tratamentos. Cada uma devolve { cena, camera, atualizar(t) }, com t em segundos.
// Todas usam o mesmo renderer (cena.js desenha só as que estão visíveis na tela).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { RAIZES, materialEsmalte } from "./dente.js";

const AZUL = new THREE.Color("#34a8dc"), AZUL_ESCURO = new THREE.Color("#02558a");
const suave = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const ciclo = (t, dur) => (t % dur) / dur;

function base(ambiente) {
  const cena = new THREE.Scene();
  cena.environment = ambiente;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.4, 5.2);
  camera.lookAt(0, 0, 0);
  const sol = new THREE.DirectionalLight("#ffffff", 1.4);
  sol.position.set(2, 3, 4);
  cena.add(sol, new THREE.HemisphereLight("#ffffff", "#bfe3f6", 0.6));
  return { cena, camera, sol };
}

const materialGengiva = () => new THREE.MeshPhysicalMaterial({ color: "#ee9aa3", roughness: 0.45, clearcoat: 0.8, clearcoatRoughness: 0.25, sheen: 0.5, sheenColor: new THREE.Color("#ffd0d6") });
// titânio: metal não total, senão reflete as paredes escuras do ambiente e fica preto
const materialMetal = () => new THREE.MeshStandardMaterial({ color: "#dfe6ec", metalness: 0.75, roughness: 0.3, envMapIntensity: 1.6 });

// Halo de fresnel: uma esfera maior, em aditivo, que só acende na silhueta. É o "brilho de diamante"
// sem precisar de pós-processamento (bloom custaria um render alvo a mais por cena).
function halo(raio, cor) {
  const u = { uK: { value: 0 }, uCor: { value: new THREE.Color(cor) } };
  const malha = new THREE.Mesh(new THREE.SphereGeometry(raio, 32, 20), new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 vN; varying vec3 vP;
      void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vP = mv.xyz; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uK; uniform vec3 uCor; varying vec3 vN; varying vec3 vP;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(-vP))), 3.0); gl_FragColor = vec4(uCor, f * uK); }`
  }));
  return { malha, u };
}

// ---------- implante: parafuso entra na gengiva, pilar e coroa descem ----------
function implante(G, amb) {
  const { cena, camera } = base(amb);
  const grupo = new THREE.Group();
  cena.add(grupo);
  // parafuso: perfil em dente de serra girado (roscas)
  const perfil = [new THREE.Vector2(0, -0.95)];
  for (let i = 0; i < 9; i++) {
    const y = -0.85 + i * 0.1, r = 0.13 + Math.min(i, 3) * 0.012;
    perfil.push(new THREE.Vector2(r, y), new THREE.Vector2(r + 0.07, y + 0.045));
  }
  perfil.push(new THREE.Vector2(0.17, 0.08), new THREE.Vector2(0.11, 0.1), new THREE.Vector2(0, 0.1));
  const parafuso = new THREE.Mesh(new THREE.LatheGeometry(perfil, 40), materialMetal());
  const pilar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 0.28, 32), materialMetal());
  const coroa = new THREE.Mesh(G.coroa, materialEsmalte("#f9f6ee"));
  coroa.scale.setScalar(0.55);
  // gengiva mais encorpada e saturada: no tom antigo ela sumia no fundo claro e o parafuso ficava solto no ar.
  // Continua semitransparente de propósito — é o que deixa ver o implante por dentro.
  const gengiva = new THREE.Mesh(new RoundedBoxGeometry(1.8, 1.25, 1.1, 6, 0.3),
    new THREE.MeshPhysicalMaterial({ color: "#e0727f", roughness: 0.42, transparent: true, opacity: 0.74, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.28, sheen: 0.8, sheenColor: new THREE.Color("#ffc4cd") }));
  gengiva.position.y = -0.62;
  coroa.material.transparent = true;
  grupo.add(parafuso, pilar, coroa, gengiva);
  camera.position.set(0, 0.7, 5.4);
  camera.lookAt(0, -0.15, 0);
  return {
    cena, camera,
    atualizar(t) {
      const c = ciclo(t, 7);
      const desce = suave(0.02, 0.32, c), pilarE = suave(0.34, 0.46, c), coroaE = suave(0.48, 0.68, c), sai = suave(0.92, 1, c);
      parafuso.position.y = 1.4 * (1 - desce) - 0.2;
      parafuso.rotation.y = -desce * Math.PI * 6;
      pilar.position.y = 0.04 + 0.9 * (1 - pilarE);
      pilar.visible = pilarE > 0.01;
      pilar.scale.setScalar(Math.max(0.01, pilarE));
      coroa.position.y = 0.38 + 0.9 * (1 - coroaE);
      coroa.visible = coroaE > 0.001;
      coroa.material.opacity = Math.min(1, coroaE * 3) * (1 - sai);
      grupo.scale.setScalar(Math.max(0.001, 1 - sai));
      grupo.rotation.y = Math.sin(t * 0.5) * 0.5;
    }
  };
}

// ---------- aparelho: dentes tortos na gengiva recebem os braquetes e o fio, e então se alinham ----------
function aparelho(G, amb) {
  const { cena, camera } = base(amb);
  const grupo = new THREE.Group();
  cena.add(grupo);
  // 9 dentes encostados: o passo angular é a largura do dente dividida pelo raio do arco. Com passo
  // maior que isso sobram vãos e a arcada vira um colar de contas, que era o problema dos 5 dentes.
  const N = 9, RAIO = 1.8, LARG = 0.38, PASSO = LARG / RAIO;
  const dentes = [], braquetes = [];
  const ang = (i) => (i - (N - 1) / 2) * PASSO;
  const geoBraquete = new RoundedBoxGeometry(0.15, 0.15, 0.07, 2, 0.028);
  const matB = materialMetal();
  // desalinhamento inicial de cada dente: [altura, giro, avanço]
  const desvio = [[0.13, 0.26, -0.10], [-0.10, -0.30, 0.09], [0.06, 0.18, 0.0], [-0.12, 0.33, 0.10], [0.11, -0.22, -0.08],
    [-0.07, 0.27, 0.09], [0.14, -0.25, -0.10], [-0.11, 0.20, 0.08], [0.09, -0.31, -0.09]];
  // gengiva: o mesmo arco dos dentes, sobrando um pouco nas pontas e encorpada o bastante pra
  // engolir a base das coroas (elas descem 0.06 dentro dela, senão aparece fresta na junção)
  const curvaGengiva = new THREE.CatmullRomCurve3(Array.from({ length: 13 }, (_, i) => {
    const a = ang(0) - 0.09 + (i / 12) * (ang(N - 1) - ang(0) + 0.18);
    return new THREE.Vector3(Math.sin(a) * RAIO, -0.24, Math.cos(a) * RAIO - RAIO);
  }));
  const gengiva = new THREE.Mesh(new THREE.TubeGeometry(curvaGengiva, 72, 0.34, 20, false), materialGengiva());
  gengiva.scale.y = 0.78;
  grupo.add(gengiva);
  for (let i = 0; i < N; i++) {
    const a = ang(i);
    const d = new THREE.Mesh(G.coroa, materialEsmalte());
    // os da frente mais altos e rasos (incisivos), os das pontas mais baixos e fundos (molares)
    const borda = Math.abs(i - (N - 1) / 2) / ((N - 1) / 2);
    d.scale.set(LARG, 0.58 - borda * 0.09, 0.30 + borda * 0.06);
    d.userData = { x: Math.sin(a) * RAIO, z: Math.cos(a) * RAIO - RAIO, a, dv: desvio[i] };
    const b = new THREE.Mesh(geoBraquete, matB);
    dentes.push(d); braquetes.push(b);
    grupo.add(d, b);
  }
  const fio = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: "#9fb3c2", metalness: 1, roughness: 0.25, emissive: AZUL, emissiveIntensity: 0 }));
  grupo.add(fio);
  camera.position.set(0, 0.42, 5.1);
  camera.lookAt(0, -0.05, -0.3);
  const pts = Array.from({ length: N }, () => new THREE.Vector3());
  return {
    cena, camera,
    atualizar(t) {
      const c = ciclo(t, 7), fim = 1 - suave(0.9, 1, c);
      // três tempos: dentes tortos → braquetes e fio entram → dentes se alinham
      const instala = suave(0.08, 0.28, c) * fim;
      const alinha = suave(0.34, 0.74, c) * fim;
      dentes.forEach((d, i) => {
        const u = d.userData, k = 1 - alinha;
        d.position.set(u.x, u.dv[0] * k, u.z + u.dv[2] * k);
        d.rotation.set(0, u.a + u.dv[1] * k, u.dv[0] * k * 1.2);
        d.updateMatrix();
        // braquete preso na face da frente do dente, colado assim que o aparelho é instalado
        const frente = new THREE.Vector3(0, 0.32, 0.5).applyMatrix4(d.matrix);
        braquetes[i].position.copy(frente);
        braquetes[i].rotation.copy(d.rotation);
        braquetes[i].scale.setScalar(Math.max(0.001, instala));
        braquetes[i].visible = instala > 0.01;
        pts[i].copy(frente).add(new THREE.Vector3(Math.sin(d.rotation.y), 0, Math.cos(d.rotation.y)).multiplyScalar(0.05));
      });
      const fioE = suave(0.2, 0.34, c) * fim;
      fio.visible = fioE > 0.02;
      if (fio.visible) {
        fio.geometry.dispose();
        fio.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.021 * fioE, 6, false);
      }
      // o fio pisca quando o alinhamento termina
      fio.material.emissiveIntensity = 0.7 * suave(0.72, 0.8, c) * (1 - suave(0.84, 0.92, c));
      grupo.rotation.y = Math.sin(t * 0.4) * 0.22;
    }
  };
}

// ---------- clareamento: dente amarelado clareia com brilhos e uma luz que passa ----------
function clareamento(G, amb) {
  const { cena, camera } = base(amb);
  const dente = new THREE.Mesh(G.dente, materialEsmalte());
  dente.scale.setScalar(0.95);
  // anel de luz numa órbita inclinada que gira em volta do dente (antes ele só subia e descia reto)
  const orbita = new THREE.Group();
  orbita.rotation.z = 0.38;
  const anel = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.022, 12, 90), new THREE.MeshBasicMaterial({ color: AZUL, transparent: true, opacity: 0 }));
  anel.rotation.x = Math.PI / 2;
  orbita.add(anel);
  const glow = halo(1.15, "#9fe4ff"); // pouco maior que o dente: o anel de luz tem que caber no quadro
  const brilhos = [];
  const geoB = new THREE.OctahedronGeometry(0.08, 0);
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(geoB, new THREE.MeshBasicMaterial({ color: i % 2 ? "#ffffff" : "#bfe8fb", transparent: true }));
    m.scale.set(1, 2.2, 1);
    const ang = (i / 9) * Math.PI * 2;
    m.userData = { ang, r: 0.75 + (i % 3) * 0.12, y: -0.1 + (i % 5) * 0.2, fase: i * 0.9 };
    brilhos.push(m);
  }
  cena.add(dente, orbita, glow.malha, ...brilhos);
  const amarelo = new THREE.Color("#d9c092"), branco = new THREE.Color("#f5f2e8");
  camera.position.set(0, 0.25, 4.6);
  return {
    cena, camera,
    atualizar(t) {
      const c = ciclo(t, 6), k = suave(0.15, 0.55, c) * (1 - suave(0.85, 1, c));
      dente.material.color.copy(amarelo).lerp(branco, k);
      dente.rotation.y = t * 0.6;
      const passa = suave(0.1, 0.55, c);
      orbita.rotation.y = t * 1.4;
      anel.position.y = 0.95 - passa * 1.9;
      anel.material.opacity = Math.sin(passa * Math.PI) * 0.9;
      anel.scale.setScalar(1 + 0.1 * Math.sin(t * 6));
      glow.u.uK.value = 0.2 + k * 0.85; // o halo acende junto com o clareamento
      brilhos.forEach((b) => {
        const u = b.userData, a = u.ang + t * 0.5;
        b.position.set(Math.cos(a) * u.r, u.y, Math.sin(a) * u.r);
        const pulso = Math.max(0, Math.sin(t * 2.4 + u.fase));
        b.scale.set(pulso, pulso * 2.2, pulso).multiplyScalar(0.3 + k);
        b.rotation.y = t * 2;
      });
    }
  };
}

// ---------- limpeza: placa sai do dente quando o jato passa, bolhas sobem ----------
function limpeza(G, amb) {
  const { cena, camera } = base(amb);
  const dente = new THREE.Mesh(G.dente, materialEsmalte("#f5f1e6"));
  const grupo = new THREE.Group();
  grupo.add(dente);
  cena.add(grupo);
  const amostrador = new MeshSurfaceSampler(new THREE.Mesh(G.coroa)).build();
  const N = 70, placa = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.045, 1),
    new THREE.MeshStandardMaterial({ color: "#d8b35c", roughness: 0.8 }), N);
  const pontos = [], p = new THREE.Vector3(), nrm = new THREE.Vector3();
  while (pontos.length < N) {
    amostrador.sample(p, nrm);
    if (p.y > -0.05) pontos.push({ p: p.clone(), n: nrm.clone(), s: 0.6 + Math.random() * 0.8 });
  }
  grupo.add(placa);
  const bolhas = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 12, 8),
    new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0, transmission: 0, transparent: true, opacity: 0.55, clearcoat: 1 }), 24);
  const infoB = Array.from({ length: 24 }, () => ({ x: (Math.random() - 0.5) * 1.6, z: (Math.random() - 0.5) * 0.8, v: 0.3 + Math.random() * 0.4, f: Math.random() * 3, s: 0.5 + Math.random() }));
  const jato = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.03, 10, 70), new THREE.MeshBasicMaterial({ color: AZUL, transparent: true, opacity: 0 }));
  jato.rotation.x = Math.PI / 2;
  // faíscas que acendem atrás do jato: é o "limpo" ficando visível
  const faiscas = [];
  const geoF = new THREE.OctahedronGeometry(0.07, 0);
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(geoF, new THREE.MeshBasicMaterial({ color: i % 2 ? "#ffffff" : "#cfeeff", transparent: true }));
    m.scale.set(1, 2.1, 1);
    m.userData = { ang: (i / 6) * Math.PI * 2, r: 0.68 + (i % 3) * 0.1, y: 0.1 + (i % 4) * 0.2, fase: i * 1.1 };
    faiscas.push(m);
  }
  cena.add(bolhas, jato, ...faiscas);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sv = new THREE.Vector3(), pv = new THREE.Vector3();
  camera.position.set(0, 0.35, 4.6);
  return {
    cena, camera,
    atualizar(t) {
      const c = ciclo(t, 6), passa = suave(0.15, 0.6, c), volta = suave(0.85, 1, c);
      const yJato = 0.85 - passa * 1.0;
      jato.position.y = yJato;
      jato.material.opacity = Math.sin(passa * Math.PI) * 0.85;
      grupo.rotation.y = t * 0.5;
      pontos.forEach((pt, i) => {
        const limpa = passa > 0 && pt.p.y > yJato ? 1 : 0;
        const s = pt.s * Math.max(volta, 1 - limpa);
        pv.copy(pt.p).addScaledVector(pt.n, 0.01);
        m.compose(pv, q, sv.setScalar(s));
        placa.setMatrixAt(i, m);
      });
      placa.instanceMatrix.needsUpdate = true;
      infoB.forEach((b, i) => {
        const y = ((t * b.v + b.f) % 2.2) - 0.9;
        const s = b.s * Math.sin(Math.min(1, (y + 0.9) / 2.2) * Math.PI) * (0.4 + passa * (1 - volta));
        m.compose(pv.set(b.x + Math.sin(t + i) * 0.05, y, b.z), q, sv.setScalar(Math.max(0.001, s)));
        bolhas.setMatrixAt(i, m);
      });
      bolhas.instanceMatrix.needsUpdate = true;
      const limpo = passa * (1 - volta);
      faiscas.forEach((f) => {
        const u = f.userData, a = u.ang + t * 0.7;
        f.visible = limpo > 0.05;
        if (!f.visible) return;
        f.position.set(Math.cos(a) * u.r, u.y, Math.sin(a) * u.r);
        const pulso = Math.max(0, Math.sin(t * 3 + u.fase));
        f.scale.set(pulso, pulso * 2.1, pulso).multiplyScalar(0.34 * limpo);
        f.rotation.y = t * 2.2;
      });
    }
  };
}

// ---------- prótese: dentes descem um a um sobre o arco da gengiva ----------
function protese(G, amb) {
  const { cena, camera } = base(amb);
  const grupo = new THREE.Group();
  cena.add(grupo);
  // arco em U, com os semi-eixos ajustados pra arcada inteira caber no enquadramento
  const curva = new THREE.CatmullRomCurve3(Array.from({ length: 11 }, (_, i) => {
    const a = -Math.PI * 0.44 + (i / 10) * Math.PI * 0.88;
    return new THREE.Vector3(Math.sin(a) * 1.15, 0, Math.cos(a) * 0.9 - 0.35);
  }));
  // gengiva encorpada: a anterior era fina demais e os dentes pousavam nela em vez de nascer dela
  const gengiva = new THREE.Mesh(new THREE.TubeGeometry(curva, 90, 0.3, 20, false), materialGengiva());
  gengiva.scale.y = 0.78;
  grupo.add(gengiva);
  // 10 dentes: a esta altura o passo ao longo da curva (~0.285) é menor que a largura, então eles
  // se encostam e formam uma fileira contínua, como numa prótese de verdade
  const N = 10, ALTURA = 0.19, dentes = [];
  for (let i = 0; i < N; i++) {
    const u = (i + 0.5) / N, p = curva.getPointAt(u), tg = curva.getTangentAt(u);
    const d = new THREE.Mesh(G.coroa, materialEsmalte());
    const borda = Math.abs(i - (N - 1) / 2) / ((N - 1) / 2);
    d.scale.set(0.31, 0.52 - borda * 0.09, 0.27 + borda * 0.05);
    d.rotation.y = Math.atan2(tg.x, tg.z) + Math.PI / 2;
    d.userData = { p, ordem: i };
    dentes.push(d);
    grupo.add(d);
  }
  // pilares de titânio em dois pontos do arco: mostram que a prótese se apoia em implantes.
  // Ficam à vista enquanto os dentes ainda não desceram e somem debaixo deles no fim.
  [2, 7].forEach((i) => {
    const p = curva.getPointAt((i + 0.5) / N);
    const pilar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.34, 20), materialMetal());
    pilar.position.set(p.x, 0.12, p.z);
    grupo.add(pilar);
  });
  camera.position.set(0, 1.15, 4.3);
  camera.lookAt(0, 0.12, -0.15);
  return {
    cena, camera,
    atualizar(t) {
      const c = ciclo(t, 7), sai = suave(0.9, 1, c);
      dentes.forEach((d) => {
        const k = suave(0.06 + d.userData.ordem * 0.05, 0.2 + d.userData.ordem * 0.05, c);
        d.position.set(d.userData.p.x, ALTURA + (1 - k) * 1.4 + sai * 1.4, d.userData.p.z);
        d.visible = k > 0.001 && sai < 0.999;
      });
      grupo.rotation.y = Math.sin(t * 0.45) * 0.28;
    }
  };
}

// ---------- canal: dente transparente com os canais acendendo da coroa até a ponta ----------
function canal(G, amb) {
  const { cena, camera } = base(amb);
  const grupo = new THREE.Group();
  cena.add(grupo);
  const vidro = new THREE.Mesh(G.dente, new THREE.MeshPhysicalMaterial({
    color: "#ffffff", roughness: 0.15, transparent: true, opacity: 0.28, depthWrite: false, clearcoat: 1, side: THREE.DoubleSide
  }));
  const uniforms = { uT: { value: 0 } };
  const matCanal = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
    fragmentShader: `uniform float uT; varying vec2 vUv;
      void main(){
        float frente = smoothstep(uT - 0.02, uT - 0.25, vUv.x);
        vec3 cor = mix(vec3(0.95,0.55,0.6), vec3(0.2,0.66,0.86), frente);
        float pulso = 0.6 + 0.4 * sin(vUv.x * 30. - uT * 20.);
        gl_FragColor = vec4(cor * (0.9 + 0.4 * frente * pulso), 0.95);
      }`
  });
  const camara = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), new THREE.MeshBasicMaterial({ color: "#f28c99", transparent: true, opacity: 0.95 }));
  camara.scale.set(1.4, 0.7, 1.1);
  camara.position.y = 0.12;
  grupo.add(camara);
  RAIZES.forEach((r) => {
    const pts = [new THREE.Vector3(r.p[0][0] * 0.6, 0.12, r.p[0][2] * 0.6), ...r.p.map((v, i) => new THREE.Vector3(v[0], v[1] + (i === 2 ? 0.06 : 0), v[2]))];
    grupo.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.035, 8, false), matCanal));
  });
  grupo.add(vidro);
  // lima endodôntica: desce pela coroa até a câmara pulpar, acompanhando a luz que percorre o canal
  const lima = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.03, 1.3, 10), materialMetal());
  const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.26, 12), new THREE.MeshStandardMaterial({ color: "#2e6f9c", roughness: 0.5 }));
  cabo.position.y = 0.78;
  lima.add(cabo);
  grupo.add(lima);
  camera.position.set(0, 0.2, 4.8);
  return {
    cena, camera,
    atualizar(t) {
      const c = ciclo(t, 5);
      uniforms.uT.value = suave(0, 0.7, c) * 1.3;
      camara.material.color.set("#f28c99").lerp(AZUL, suave(0, 0.1, uniforms.uT.value));
      const entra = suave(0.04, 0.42, c) * (1 - suave(0.86, 0.98, c));
      lima.visible = entra > 0.01;
      lima.position.set(0, 1.62 - entra * 0.82, -0.04);
      lima.rotation.z = Math.sin(t * 9) * 0.05; // vaivém leve, como quem instrumenta o canal
      grupo.rotation.y = t * 0.5;
    }
  };
}

export const CENAS = { implante, aparelho, clareamento, limpeza, protese, canal };

// dente de esmalte sozinho, usado no simulador de clareamento e nas imagens de antes e depois.
// Devolve também as luzes: o antes e depois mexe nelas pra dar acabamentos diferentes aos dois lados.
export function denteSimples(G, amb) {
  const { cena, camera, sol } = base(amb);
  const dente = new THREE.Mesh(G.dente, materialEsmalte());
  const brilho = new THREE.PointLight("#ffffff", 3, 6);
  brilho.position.set(-1.5, 1.2, 2);
  const contorno = new THREE.DirectionalLight("#9fe0f7", 1.6); // rim light: separa o dente do fundo claro
  contorno.position.set(-2, 1.2, -3);
  cena.add(dente, brilho, contorno);
  camera.position.set(0, 0.25, 4.5);
  return { cena, camera, dente, brilho, sol, contorno };
}

export { AZUL, AZUL_ESCURO, suave };
