// Dente procedural: um molar descrito por uma função de distância (SDF) — coroa com quatro
// cúspides e sulco central, colo e três raízes — transformado em malha com o MarchingCubes do Three.
// Nenhum modelo é baixado. As posições das raízes ficam exportadas pra cena do canal usar.
import * as THREE from "three";
import { MarchingCubes } from "three/addons/objects/MarchingCubes.js";

const ESCALA = 0.9; // encolhe o dente pra caber com folga no cubo [-1, 1] do MarchingCubes

// raízes: [colo, meio, ponta] e raios em cada ponto
export const RAIZES = [
  { p: [[-0.24, -0.02, 0.14], [-0.31, -0.45, 0.18], [-0.25, -0.9, 0.15]], r: [0.17, 0.12, 0.04] },
  { p: [[0.24, -0.02, 0.14], [0.31, -0.45, 0.19], [0.27, -0.87, 0.23]], r: [0.17, 0.12, 0.04] },
  { p: [[0.0, -0.02, -0.18], [0.0, -0.45, -0.3], [0.03, -0.88, -0.37]], r: [0.19, 0.13, 0.045] }
].map((r) => ({ p: r.p.map((v) => v.map((c) => c * ESCALA)), r: r.r.map((c) => c * ESCALA) }));

const abs = Math.abs, max = Math.max, min = Math.min, sqrt = Math.sqrt;

function smin(a, b, k) { const h = max(k - abs(a - b), 0) / k; return min(a, b) - h * h * k * 0.25; }
function smax(a, b, k) { return -smin(-a, -b, k); }

function caixaRedonda(x, y, z, bx, by, bz, r) {
  const qx = abs(x) - bx, qy = abs(y) - by, qz = abs(z) - bz;
  const ox = max(qx, 0), oy = max(qy, 0), oz = max(qz, 0);
  return sqrt(ox * ox + oy * oy + oz * oz) + min(max(qx, max(qy, qz)), 0) - r;
}

// cone de pontas redondas entre a (raio r1) e b (raio r2) — fórmula do Inigo Quilez
function coneRedondo(px, py, pz, a, b, r1, r2) {
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
  const l2 = bax * bax + bay * bay + baz * baz, rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
  const pax = px - a[0], pay = py - a[1], paz = pz - a[2];
  const y = pax * bax + pay * bay + paz * baz, z = y - l2;
  const xx = pax * l2 - bax * y, xy = pay * l2 - bay * y, xz = paz * l2 - baz * y;
  const x2 = xx * xx + xy * xy + xz * xz, y2 = y * y * l2, z2 = z * z * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
  if (Math.sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
  return (sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}

function capsulaX(x, y, z, cy, meia, r) { const qx = max(abs(x) - meia, 0); return sqrt(qx * qx + (y - cy) ** 2 + z * z) - r; }
function capsulaZ(x, y, z, cy, meia, r) { const qz = max(abs(z) - meia, 0); return sqrt(x * x + (y - cy) ** 2 + qz * qz) - r; }

// distância até o dente, nas coordenadas sem escala; soCoroa corta as raízes (pra coroas e próteses)
function sdfDente(x, y, z, soCoroa) {
  // coroa: caixa arredondada mais larga no meio + 4 cúspides
  let d = caixaRedonda(x, y - 0.3, z, 0.34, 0.13, 0.29, 0.21);
  for (let i = -1; i <= 1; i += 2) for (let j = -1; j <= 1; j += 2) {
    const dx = x - i * 0.24, dy = y - 0.56, dz = z - j * 0.2;
    d = smin(d, sqrt(dx * dx + dy * dy + dz * dz) - 0.2, 0.16);
  }
  // sulcos em cruz e fossa central
  d = smax(d, -capsulaX(x, y, z, 0.79, 0.3, 0.07), 0.09);
  d = smax(d, -capsulaZ(x, y, z, 0.79, 0.26, 0.07), 0.09);
  // colo (mais estreito que a coroa)
  d = smin(d, caixaRedonda(x, y + 0.06, z, 0.25, 0.08, 0.2, 0.13), 0.18);
  if (soCoroa) return smax(d, -(y + 0.12), 0.08);
  for (const r of RAIZES) {
    const a = r.p[0].map((c) => c / ESCALA), m = r.p[1].map((c) => c / ESCALA), b = r.p[2].map((c) => c / ESCALA);
    const raiz = min(coneRedondo(x, y, z, a, m, r.r[0] / ESCALA, r.r[1] / ESCALA), coneRedondo(x, y, z, m, b, r.r[1] / ESCALA, r.r[2] / ESCALA));
    d = smin(d, raiz, 0.14);
  }
  return d;
}

// gera a malha: resolução maior = mais suave e mais lento (64 ≈ 60 ms no PC)
export function criarGeometriaDente(resolucao = 64, soCoroa = false) {
  const mc = new MarchingCubes(resolucao, new THREE.MeshBasicMaterial(), false, false, resolucao * resolucao * 30);
  mc.isolation = 0;
  const n = mc.size, meio = mc.halfsize, campo = mc.field;
  for (let k = 0; k < n; k++) {
    const z = (k - meio) / meio / ESCALA;
    for (let j = 0; j < n; j++) {
      const y = (j - meio) / meio / ESCALA;
      for (let i = 0; i < n; i++) {
        const x = (i - meio) / meio / ESCALA;
        campo[i + j * n + k * n * n] = -sdfDente(x, y, z, soCoroa) * ESCALA;
      }
    }
  }
  mc.update();
  const qtd = mc.count;
  const pos = mc.positionArray.slice(0, qtd * 3);
  const nor = mc.normalArray.slice(0, qtd * 3);
  for (let i = 0; i < nor.length; i += 3) {
    const l = Math.hypot(nor[i], nor[i + 1], nor[i + 2]) || 1;
    nor[i] /= l; nor[i + 1] /= l; nor[i + 2] /= l;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.computeBoundingSphere();
  g.computeBoundingBox();
  mc.geometry.dispose();
  return g;
}

// esmalte: branco levemente translúcido, com verniz (clearcoat) e brilho de tecido (sheen)
export function materialEsmalte(cor = "#f3eee0") {
  return new THREE.MeshPhysicalMaterial({
    color: cor, roughness: 0.32, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12,
    sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color("#ffffff"), envMapIntensity: 1.1
  });
}
