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
  return { cena, camera };
}

const materialGengiva = () => new THREE.MeshPhysicalMaterial({ color: "#ee9aa3", roughness: 0.45, clearcoat: 0.8, clearcoatRoughness: 0.25, sheen: 0.5, sheenColor: new THREE.Color("#ffd0d6") });
// titânio: metal não total, senão reflete as paredes escuras do ambiente e fica preto
const materialMetal = () => new THREE.MeshStandardMaterial({ color: "#dfe6ec", metalness: 0.75, roughness: 0.3, envMapIntensity: 1.6 });

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
  const coroa = new THREE.Mesh(G.coroa, materialEsmalte());
  coroa.scale.setScalar(0.55);
  const gengiva = new THREE.Mesh(new RoundedBoxGeometry(1.8, 1.25, 1.1, 6, 0.3),
    new THREE.MeshPhysicalMaterial({ color: "#f19aa5", roughness: 0.35, transparent: true, opacity: 0.6, depthWrite: false, clearcoat: 1, sheen: 0.6, sheenColor: new THREE.Color("#ffd6dc") }));
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

// ---------- aparelho: dentes tortos se alinham no fio ----------
function aparelho(G, amb) {
  const { cena, camera } = base(amb);
  const grupo = new THREE.Group();
  cena.add(grupo);
  const N = 5, dentes = [], braquetes = [];
  const geoBraquete = new RoundedBoxGeometry(0.16, 0.16, 0.08, 2, 0.03);
  const matB = materialMetal();
  const desvio = [[0.18, 0.3, -0.12], [-0.12, -0.35, 0.1], [0.05, 0.2, 0.0], [0.16, -0.3, -0.1], [-0.14, 0.4, 0.12]];
  for (let i = 0; i < N; i++) {
    const a = (i - (N - 1) / 2) * 0.3;
    const d = new THREE.Mesh(G.coroa, materialEsmalte());
    d.scale.set(0.5, 0.6, 0.5);
    d.userData = { x: Math.sin(a) * 2.1, z: Math.cos(a) * 2.1 - 2.1, a, dv: desvio[i] };
    const b = new THREE.Mesh(geoBraquete, matB);
    dentes.push(d); braquetes.push(b);
    grupo.add(d, b);
  }
  const fio = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: "#9fb3c2", metalness: 1, roughness: 0.25, emissive: AZUL, emissiveIntensity: 0 }));
  grupo.add(fio);
  camera.position.set(0, 0.45, 4.3);
  camera.lookAt(0, 0.12, -0.45);
  const pts = Array.from({ length: N }, () => new THREE.Vector3());
  return {
    cena, camera,
    atualizar(t) {
      const c = ciclo(t, 6), alinha = suave(0.15, 0.6, c) * (1 - suave(0.88, 1, c));
      dentes.forEach((d, i) => {
        const u = d.userData, k = 1 - alinha;
        d.position.set(u.x, u.dv[0] * k, u.z + u.dv[2] * k);
        d.rotation.set(0, u.a + u.dv[1] * k, u.dv[0] * k * 1.2);
        d.updateMatrix();
        // braquete preso na face da frente do dente
        const frente = new THREE.Vector3(0, 0.32, 0.5).applyMatrix4(d.matrix);
        braquetes[i].position.copy(frente);
        braquetes[i].rotation.copy(d.rotation);
        pts[i].copy(frente).add(new THREE.Vector3(Math.sin(d.rotation.y), 0, Math.cos(d.rotation.y)).multiplyScalar(0.05));
      });
      fio.geometry.dispose();
      fio.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.018, 6, false);
      fio.material.emissiveIntensity = 0.6 * suave(0.55, 0.65, c) * (1 - suave(0.8, 0.88, c));
      grupo.rotation.y = Math.sin(t * 0.4) * 0.25;
    }
  };
}

// ---------- clareamento: dente amarelado clareia com brilhos e uma luz que passa ----------
function clareamento(G, amb) {
  const { cena, camera } = base(amb);
  const dente = new THREE.Mesh(G.dente, materialEsmalte());
  dente.scale.setScalar(0.95);
  const anel = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.025, 12, 80), new THREE.MeshBasicMaterial({ color: AZUL, transparent: true, opacity: 0 }));
  anel.rotation.x = Math.PI / 2;
  const brilhos = [];
  const geoB = new THREE.OctahedronGeometry(0.08, 0);
  for (let i = 0; i < 7; i++) {
    const m = new THREE.Mesh(geoB, new THREE.MeshBasicMaterial({ color: i % 2 ? "#ffffff" : "#bfe8fb", transparent: true }));
    m.scale.set(1, 2.2, 1);
    const ang = (i / 7) * Math.PI * 2;
    m.userData = { ang, r: 0.75 + (i % 3) * 0.12, y: 0.2 + (i % 4) * 0.18, fase: i * 0.9 };
    brilhos.push(m);
  }
  cena.add(dente, anel, ...brilhos);
  const amarelo = new THREE.Color("#d9c092"), branco = new THREE.Color("#f5f2e8");
  camera.position.set(0, 0.25, 4.6);
  return {
    cena, camera,
    atualizar(t) {
      const c = ciclo(t, 6), k = suave(0.15, 0.55, c) * (1 - suave(0.85, 1, c));
      dente.material.color.copy(amarelo).lerp(branco, k);
      dente.rotation.y = t * 0.6;
      const passa = suave(0.1, 0.55, c);
      anel.position.y = 0.95 - passa * 1.9;
      anel.material.opacity = Math.sin(passa * Math.PI) * 0.9;
      anel.scale.setScalar(1 + 0.1 * Math.sin(t * 6));
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
  const infoB = Array.from({ length: 24 }, (_, i) => ({ x: (Math.random() - 0.5) * 1.6, z: (Math.random() - 0.5) * 0.8, v: 0.3 + Math.random() * 0.4, f: Math.random() * 3, s: 0.5 + Math.random() }));
  const jato = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.03, 10, 70), new THREE.MeshBasicMaterial({ color: AZUL, transparent: true, opacity: 0 }));
  jato.rotation.x = Math.PI / 2;
  cena.add(bolhas, jato);
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
    }
  };
}

// ---------- prótese: dentes descem um a um sobre o arco da gengiva ----------
function protese(G, amb) {
  const { cena, camera } = base(amb);
  const grupo = new THREE.Group();
  cena.add(grupo);
  const curva = new THREE.CatmullRomCurve3(Array.from({ length: 9 }, (_, i) => {
    const a = -Math.PI * 0.42 + (i / 8) * Math.PI * 0.84;
    return new THREE.Vector3(Math.sin(a) * 1.25, 0, Math.cos(a) * 0.95 - 0.4);
  }));
  const gengiva = new THREE.Mesh(new THREE.TubeGeometry(curva, 80, 0.2, 16, false), materialGengiva());
  gengiva.scale.y = 0.8;
  grupo.add(gengiva);
  const N = 8, dentes = [];
  for (let i = 0; i < N; i++) {
    const u = (i + 0.5) / N, p = curva.getPointAt(u), tg = curva.getTangentAt(u);
    const d = new THREE.Mesh(G.coroa, materialEsmalte());
    const larg = i === 0 || i === N - 1 ? 0.32 : (i === 3 || i === 4 ? 0.27 : 0.25);
    d.scale.set(larg, 0.4, 0.26);
    d.rotation.y = Math.atan2(tg.x, tg.z) + Math.PI / 2;
    d.userData = { p, ordem: i };
    dentes.push(d);
    grupo.add(d);
  }
  camera.position.set(0, 1.9, 3.6);
  camera.lookAt(0, -0.05, 0);
  return {
    cena, camera,
    atualizar(t) {
      const c = ciclo(t, 7), sai = suave(0.9, 1, c);
      dentes.forEach((d) => {
        const k = suave(0.06 + d.userData.ordem * 0.06, 0.2 + d.userData.ordem * 0.06, c);
        d.position.set(d.userData.p.x, 0.2 + (1 - k) * 1.4 + sai * 1.4, d.userData.p.z);
        d.visible = k > 0.001 && sai < 0.999;
      });
      grupo.rotation.y = Math.sin(t * 0.45) * 0.45;
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
  camera.position.set(0, 0.2, 4.8);
  return {
    cena, camera,
    atualizar(t) {
      uniforms.uT.value = suave(0, 0.7, ciclo(t, 5)) * 1.3;
      camara.material.color.set("#f28c99").lerp(AZUL, suave(0, 0.1, uniforms.uT.value));
      grupo.rotation.y = t * 0.5;
    }
  };
}

export const CENAS = { implante, aparelho, clareamento, limpeza, protese, canal };

// dente de esmalte sozinho, usado no simulador de clareamento e nas imagens de antes e depois
export function denteSimples(G, amb) {
  const { cena, camera } = base(amb);
  const dente = new THREE.Mesh(G.dente, materialEsmalte());
  const brilho = new THREE.PointLight("#ffffff", 3, 6);
  brilho.position.set(-1.5, 1.2, 2);
  cena.add(dente, brilho);
  camera.position.set(0, 0.25, 4.5);
  return { cena, camera, dente };
}

export { AZUL, AZUL_ESCURO, suave };
