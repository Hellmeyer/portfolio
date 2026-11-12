// Accesorios naturales procedurales: hojas, palmeras, flores, coco, miel, almendras…
// Unidades: cm aproximados (un frasco de 40cc mide ~5.5cm de alto).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
export const NOMBRES = ['palmera', 'monstera', 'lavanda', 'pasto', 'coco', 'miel', 'almendras', 'semillas', 'piedras', 'flores:geranio', 'flores:manzanilla', 'flores:calendula', 'flores:almendro', 'ramita:romero', 'ramita:eucalipto', 'ramita:menta', 'ramita:teatree'];

const V3 = THREE.Vector3;
const UP = new V3(0, 1, 0);

// ── utilidades ──────────────────────────────────────────────
function azar(semilla) {
  let s = semilla >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function ruido(x, y, z) {
  return (Math.sin(x * 1.7 + y * 3.1) * Math.cos(z * 2.3 - x * 0.7) + Math.sin(y * 5.3 + z * 4.1) * 0.5) / 1.5;
}

/** Hoja con nervadura central, pliegue en V y curvatura a lo largo. Crece sobre +Y. */
function hojaGeo({ largo = 1, ancho = 0.4, forma = 'lanza', pliegue = 0.25, curva = 0.25, segs = 22, cols = 6 }) {
  const pos = [], idx = [];
  const perfil = {
    lanza: (t) => Math.sin(Math.PI * Math.pow(t, 0.75)),
    oval: (t) => Math.pow(Math.sin(Math.PI * t), 0.75),
    redonda: (t) => Math.pow(Math.sin(Math.PI * Math.pow(t, 0.85)), 0.5),
    aguja: (t) => Math.min(1, t * 6) * (1 - t * 0.6),
    petalo: (t) => Math.pow(Math.sin(Math.PI * Math.pow(t, 0.6)), 0.6),
    corazon: (t) => Math.pow(Math.sin(Math.PI * Math.pow(t, 0.55)), 0.45) * (1 - 0.15 * t),
  }[forma];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const hw = (ancho / 2) * perfil(t);
    for (let j = 0; j <= cols; j++) {
      const u = (j / cols) * 2 - 1;
      const x = u * hw;
      const z = -Math.abs(u) * hw * pliegue + curva * largo * t * t + Math.abs(u) * Math.abs(u) * hw * 0.15;
      pos.push(x, t * largo, z);
    }
  }
  const fila = cols + 1;
  for (let i = 0; i < segs; i++) for (let j = 0; j < cols; j++) {
    const a = i * fila + j, b = a + 1, c = a + fila, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Orienta una geometría (que crece en +Y, con cara en +Z) hacia `dir`, con `normal` aproximada. */
function orientar(geo, origen, dir, normal = UP, escala = 1) {
  const y = dir.clone().normalize();
  let z = normal.clone().sub(y.clone().multiplyScalar(normal.dot(y)));
  if (z.lengthSq() < 1e-6) z = new V3(0, 0, 1);
  z.normalize();
  const x = new V3().crossVectors(y, z).normalize();
  const m = new THREE.Matrix4().makeBasis(x, y, z).scale(new V3(escala, escala, escala)).setPosition(origen);
  return geo.clone().applyMatrix4(m);
}

/** Une geometrías con un color por pieza (variación natural). */
function fusionar(piezas) {
  const geos = piezas.map(([g, color]) => {
    const n = g.attributes.position.count;
    const c = new Float32Array(n * 3);
    const col = new THREE.Color(color);
    for (let i = 0; i < n; i++) { c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b; }
    const out = g.index ? g : g;
    out.setAttribute('color', new THREE.BufferAttribute(c, 3));
    if (out.attributes.uv) out.deleteAttribute('uv');
    return out;
  });
  return mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)));
}

function malla(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

const matHoja = () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.62, side: THREE.DoubleSide, envMapIntensity: 0.6 });
const matTallo = (color = 0x4d6b2f) => new THREE.MeshStandardMaterial({ color, roughness: 0.7 });

function tono(base, r, amp = 0.08) {
  const c = new THREE.Color(base);
  const hsl = {};
  c.getHSL(hsl);
  c.setHSL(hsl.h + (r() - 0.5) * amp * 0.3, hsl.s, THREE.MathUtils.clamp(hsl.l + (r() - 0.5) * amp, 0, 1));
  return c;
}

function tallo(puntos, radio = 0.03, color) {
  const curva = new THREE.CatmullRomCurve3(puntos);
  return [new THREE.TubeGeometry(curva, 48, radio, 7, false), curva, color];
}

// ── plantas de fondo ────────────────────────────────────────
function palmera(r) {
  const piezas = [];
  const tallos = [];
  for (let f = 0; f < 5; f++) {
    const ang = -0.9 + f * 0.45 + (r() - 0.5) * 0.2;
    const alto = 7 + r() * 2.5, abre = 3 + r() * 2;
    const rot = new THREE.Matrix4().makeRotationY(ang);
    const pts = [new V3(0, 0, 0), new V3(0.2, alto * 0.45, 0), new V3(abre * 0.45, alto * 0.85, 0), new V3(abre, alto * 0.92, 0), new V3(abre * 1.5, alto * 0.75, 0)]
      .map((p) => p.applyMatrix4(rot));
    const [g, curva] = tallo(pts, 0.06);
    tallos.push(g);
    for (let i = 0; i < 34; i++) {
      const t = 0.32 + (i / 34) * 0.68;
      const p = curva.getPoint(t), tg = curva.getTangent(t);
      const lado = new V3().crossVectors(tg, UP).normalize();
      for (const s of [-1, 1]) {
        const largo = (2.6 - t * 1.6) * (0.85 + r() * 0.3);
        const dir = lado.clone().multiplyScalar(s).add(tg.clone().multiplyScalar(0.55)).add(new V3(0, -0.45 - t * 0.4, 0));
        piezas.push([orientar(hojaGeo({ largo, ancho: 0.32, forma: 'lanza', pliegue: 0.6, curva: 0.35 }), p, dir, UP), tono('#3f7a32', r, 0.12)]);
      }
    }
  }
  const g = new THREE.Group();
  g.add(malla(fusionar(piezas), matHoja()));
  g.add(malla(mergeGeometries(tallos), matTallo(0x5b6b2a)));
  return g;
}

function monstera(r) {
  const piezas = [], tallos = [];
  for (let i = 0; i < 4; i++) {
    const ang = -0.7 + i * 0.5 + (r() - 0.5) * 0.3;
    const alto = 4.5 + r() * 3.5, sale = 1.2 + r() * 1.5;
    const rot = new THREE.Matrix4().makeRotationY(ang);
    const pts = [new V3(0, 0, 0), new V3(sale * 0.3, alto * 0.6, 0), new V3(sale, alto, 0)].map((p) => p.applyMatrix4(rot));
    const [g, curva] = tallo(pts, 0.07);
    tallos.push(g);
    const fin = curva.getPoint(1);
    const dir = curva.getTangent(1).add(new V3(0, -0.6, 0)).add(new V3(Math.sin(ang), 0, Math.cos(ang)).multiplyScalar(0.8));
    const hoja = hojaGeo({ largo: 3.6 + r() * 1.2, ancho: 3.4 + r(), forma: 'corazon', pliegue: 0.18, curva: 0.18, segs: 28, cols: 10 });
    piezas.push([orientar(hoja, fin, dir, new V3(0, 0.4, 1)), tono('#2f6a34', r, 0.1)]);
  }
  const g = new THREE.Group();
  g.add(malla(fusionar(piezas), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: THREE.DoubleSide, envMapIntensity: 0.6 })));
  g.add(malla(mergeGeometries(tallos), matTallo(0x4c7536)));
  return g;
}

function lavanda(r) {
  const tallos = [], botones = [];
  const boton = new THREE.IcosahedronGeometry(0.075, 1);
  for (let i = 0; i < 11; i++) {
    const a = (r() - 0.5) * 1.2, alto = 5 + r() * 2.5, sale = (r() - 0.5) * 2.2;
    const pts = [new V3(0, 0, 0), new V3(sale * 0.4, alto * 0.5, Math.sin(a) * 0.4), new V3(sale, alto, Math.sin(a) * 0.9)];
    const [g, curva] = tallo(pts, 0.028);
    tallos.push(g);
    for (let k = 0; k < 46; k++) {
      const t = 0.74 + (k / 46) * 0.26;
      const p = curva.getPoint(t);
      const giro = k * 2.4;
      const rad = 0.09 * (1 - (t - 0.74) * 1.5);
      const b = boton.clone().scale(1, 1.5, 1).translate(p.x + Math.cos(giro) * rad, p.y, p.z + Math.sin(giro) * rad);
      botones.push([b, tono('#8a62b8', r, 0.14)]);
    }
  }
  const g = new THREE.Group();
  g.add(malla(mergeGeometries(tallos), matTallo(0x7d8f5a)));
  g.add(malla(fusionar(botones), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 })));
  return g;
}

function pasto(r) {
  const piezas = [];
  for (let i = 0; i < 34; i++) {
    const a = r() * Math.PI * 2;
    const dir = new V3(Math.cos(a) * 0.35, 1, Math.sin(a) * 0.35);
    const base = new V3(Math.cos(a) * 0.25, 0, Math.sin(a) * 0.25);
    piezas.push([orientar(hojaGeo({ largo: 3.5 + r() * 3, ancho: 0.16, forma: 'aguja', pliegue: 0.5, curva: 0.35 + r() * 0.3, segs: 16, cols: 2 }), base, dir, new V3(Math.cos(a), 0, Math.sin(a))), tono('#6f9a3a', r, 0.16)]);
  }
  const g = new THREE.Group();
  g.add(malla(fusionar(piezas), matHoja()));
  return g;
}

// ── objetos de frente ───────────────────────────────────────
function ramita(r, tipo = 'romero') {
  const conf = {
    romero: { hoja: { largo: 0.42, ancho: 0.06, forma: 'aguja', pliegue: 0.6, curva: 0.2 }, color: '#4a6a45', n: 60, largo: 3.4 },
    eucalipto: { hoja: { largo: 0.62, ancho: 0.58, forma: 'redonda', pliegue: 0.1, curva: 0.1 }, color: '#7fa09a', n: 18, largo: 3.6 },
    menta: { hoja: { largo: 0.6, ancho: 0.4, forma: 'oval', pliegue: 0.35, curva: 0.15 }, color: '#4f9a4e', n: 16, largo: 2.6 },
    teatree: { hoja: { largo: 0.32, ancho: 0.05, forma: 'aguja', pliegue: 0.5, curva: 0.3 }, color: '#5d7f3c', n: 70, largo: 3 },
  }[tipo] || {};
  const g = new THREE.Group();
  for (let s = 0; s < 2; s++) {
    const piezas = [];
    const L = conf.largo * (1 - s * 0.25);
    const off = s * 0.5;
    const pts = [new V3(0, 0.08, off), new V3(L * 0.35, 0.12, off - 0.2), new V3(L * 0.7, 0.14, off + 0.15), new V3(L, 0.12, off - 0.1)];
    const [gt, curva] = tallo(pts, 0.035);
    for (let i = 0; i < conf.n; i++) {
      const t = 0.05 + (i / conf.n) * 0.95;
      const p = curva.getPoint(t), tg = curva.getTangent(t);
      const giro = i * 2.39996;
      const lado = new V3(0, Math.sin(giro), Math.cos(giro));
      const dir = lado.clone().multiplyScalar(0.9).add(tg.clone().multiplyScalar(0.55));
      if (dir.y < -0.2) dir.y = -0.2;
      piezas.push([orientar(hojaGeo(conf.hoja), p, dir, UP, 0.85 + r() * 0.35), tono(conf.color, r, 0.1)]);
    }
    g.add(malla(fusionar(piezas), matHoja()));
    g.add(malla(gt, matTallo(0x6b5a3a)));
  }
  return g;
}

function flor(r, tipo, piezas, centro, normal, escala = 1) {
  const conf = {
    geranio: { n: 5, petalo: 0.32, ancho: 0.26, color: '#ec8fab', centro: '#c94a6e' },
    manzanilla: { n: 14, petalo: 0.42, ancho: 0.12, color: '#fbfaf2', centro: '#f0b72a' },
    calendula: { n: 18, petalo: 0.5, ancho: 0.16, color: '#f08a1c', centro: '#c55a10' },
    almendro: { n: 5, petalo: 0.34, ancho: 0.3, color: '#fbe9ee', centro: '#b8566e' },
  }[tipo];
  const n = normal.clone().normalize();
  const t1 = new V3().crossVectors(n, Math.abs(n.y) > 0.9 ? new V3(1, 0, 0) : UP).normalize();
  const t2 = new V3().crossVectors(n, t1);
  for (let i = 0; i < conf.n; i++) {
    const a = (i / conf.n) * Math.PI * 2 + r() * 0.2;
    const dir = t1.clone().multiplyScalar(Math.cos(a)).add(t2.clone().multiplyScalar(Math.sin(a))).add(n.clone().multiplyScalar(0.3));
    piezas.push([orientar(hojaGeo({ largo: conf.petalo, ancho: conf.ancho, forma: 'petalo', pliegue: 0.15, curva: -0.15, segs: 8, cols: 4 }), centro, dir, n, escala), tono(conf.color, r, 0.06)]);
  }
  const c = new THREE.SphereGeometry(0.08 * (conf.n > 10 ? 1.8 : 1), 12, 8).scale(1, 0.6, 1);
  piezas.push([orientar(c, centro, n, t1, escala), new THREE.Color(conf.centro)]);
}

function flores(r, tipo = 'geranio') {
  const piezas = [];
  const hojas = [];
  if (tipo === 'geranio') {
    for (let k = 0; k < 2; k++) {
      const base = new V3(k * 1.6, 0.5 + k * 0.2, -k * 0.6);
      for (let i = 0; i < 11; i++) {
        const d = new V3(r() - 0.5, r() * 0.8 + 0.2, r() - 0.5).normalize();
        flor(r, tipo, piezas, base.clone().add(d.clone().multiplyScalar(0.42)), d, 1);
      }
      hojas.push([orientar(hojaGeo({ largo: 1.3, ancho: 1.5, forma: 'redonda', pliegue: 0.1, curva: -0.1, cols: 8 }), new V3(k * 1.6 - 0.2, 0.05, -k * 0.6 + 0.3), new V3(-0.6, 0.15, 1), UP), tono('#4f7d3a', r)]);
    }
  } else {
    for (let i = 0; i < 6; i++) {
      const p = new V3(i * 0.55 + r() * 0.3, 0.12 + r() * 0.12, (r() - 0.5) * 1.2);
      flor(r, tipo, piezas, p, new V3((r() - 0.5) * 0.6, 1, 0.5 + r() * 0.5), 1 + r() * 0.3);
    }
    if (tipo === 'almendro') {
      const [gt] = tallo([new V3(-0.4, 0.1, 0.2), new V3(1.2, 0.15, -0.2), new V3(2.8, 0.12, 0.1)], 0.05);
      hojas.push([gt, new THREE.Color('#5a4030')]);
    }
  }
  const g = new THREE.Group();
  g.add(malla(fusionar([...piezas, ...hojas]), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: THREE.DoubleSide })));
  return g;
}

function deformar(geo, amp, frec = 3) {
  const p = geo.attributes.position;
  const v = new V3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = v.clone().normalize();
    v.addScaledVector(n, ruido(v.x * frec, v.y * frec, v.z * frec) * amp);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function coco(r) {
  const g = new THREE.Group();
  const cascara = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 1 });
  const entero = malla(deformar(new THREE.SphereGeometry(1.05, 64, 48).scale(1, 0.92, 1), 0.04, 6), cascara);
  entero.position.set(-1.1, 0.95, -0.6);
  g.add(entero);
  // medio coco mirando al frente
  const medio = new THREE.Group();
  medio.add(malla(deformar(new THREE.SphereGeometry(1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), 0.03, 6), new THREE.MeshStandardMaterial({ color: 0x6a4428, roughness: 1, side: THREE.DoubleSide })));
  medio.add(malla(new THREE.RingGeometry(0.82, 1.0, 64).rotateX(-Math.PI / 2).translate(0, 0.001, 0), new THREE.MeshStandardMaterial({ color: 0xf6f1e6, roughness: 0.7 })));
  medio.add(malla(new THREE.SphereGeometry(0.82, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xf8f4ea, roughness: 0.6, side: THREE.BackSide })));
  medio.rotation.set(-1.15, 0.2, 0);
  medio.position.set(0.6, 0.95, 0.3);
  g.add(medio);
  return g;
}

function miel(r) {
  const g = new THREE.Group();
  // cuchara de miel de madera
  const pts = [];
  pts.push(new THREE.Vector2(0, 0));
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const y = t * 1.1;
    const rad = 0.24 + 0.06 * Math.cos(t * Math.PI * 10) - 0.1 * Math.pow(t, 3);
    pts.push(new THREE.Vector2(Math.max(0.05, rad), y));
  }
  pts.push(new THREE.Vector2(0.06, 1.25), new THREE.Vector2(0.06, 4), new THREE.Vector2(0.09, 4.2), new THREE.Vector2(0, 4.3));
  const madera = new THREE.MeshStandardMaterial({ color: 0xc89a62, roughness: 0.6 });
  const cuchara = malla(new THREE.LatheGeometry(pts, 48), madera);
  cuchara.rotation.set(0, 0.5, Math.PI / 2 - 0.08);
  cuchara.position.set(1.8, 0.3, 0);
  g.add(cuchara);
  // miel derramada
  const mielMat = new THREE.MeshPhysicalMaterial({ color: 0xd88a12, roughness: 0.05, transmission: 0.55, thickness: 0.4, ior: 1.49, clearcoat: 1 });
  const charco = malla(deformar(new THREE.SphereGeometry(0.8, 48, 24).scale(1.3, 0.12, 1), 0.05, 2), mielMat);
  charco.position.set(1.4, 0.05, 0.1);
  g.add(charco);
  const gota = malla(new THREE.SphereGeometry(0.16, 24, 16).scale(1, 1.35, 1), mielMat);
  gota.position.set(1.62, 0.22, 0.12);
  g.add(gota);
  return g;
}

function ovoide(largo, ancho, puntiagudo = 0.5) {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const rad = Math.pow(Math.sin(Math.PI * t), 0.85) * (1 - puntiagudo * Math.pow(t, 2) * 0.6) * ancho / 2;
    pts.push(new THREE.Vector2(Math.max(rad, 0.0001), t * largo - largo / 2));
  }
  return new THREE.LatheGeometry(pts, 32);
}

function esparcir(r, n, geo, color, mat) {
  const piezas = [];
  for (let i = 0; i < n; i++) {
    const g = geo().clone();
    g.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2 + (r() - 0.5) * 0.3));
    g.applyMatrix4(new THREE.Matrix4().makeRotationY(r() * Math.PI * 2));
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 1.4;
    g.translate(Math.cos(a) * d * 1.3, 0.16, Math.sin(a) * d * 0.7);
    piezas.push([g, tono(color, r, 0.12)]);
  }
  const g = new THREE.Group();
  g.add(malla(fusionar(piezas), mat));
  return g;
}

const almendras = (r) => esparcir(r, 8, () => deformar(ovoide(0.95, 0.56, 0.9).scale(1, 1, 0.62), 0.015, 14), '#8a5632', new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }));
const semillas = (r) => esparcir(r, 12, () => ovoide(0.55, 0.36, 0.3), '#4c2f1f', new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.35, clearcoat: 0.6 }));

function piedras(r) {
  const piezas = [];
  for (let i = 0; i < 3; i++) {
    const s = 0.9 - i * 0.22;
    const g = deformar(new THREE.SphereGeometry(s, 64, 40), s * 0.12, 1.6).scale(1.25, 0.5, 1);
    g.translate(i * 1.1 - 0.6, s * 0.42, (i % 2) * 0.6 - 0.3);
    piezas.push([g, tono(i === 1 ? '#6f6a60' : '#b9b1a2', r, 0.1)]);
  }
  const g = new THREE.Group();
  g.add(malla(fusionar(piezas), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 })));
  return g;
}

// ── catálogo de accesorios ──────────────────────────────────
const FONDO = { palmera, monstera, lavanda, pasto };
const FRENTE = { coco, miel, almendras, semillas, piedras, flores, ramita };

import { ubicaciones } from '../js/decor.js';

/** Un accesorio suelto, con el piso en y=0 y centrado en el origen. */
export function crearAccesorio(nombre, semilla = 7) {
  const r = azar(semilla);
  const [tipo, variante] = nombre.split(':');
  const f = FONDO[tipo] || FRENTE[tipo];
  return f(r, variante);
}

/** Escena 3D completa con las mismas ubicaciones que usa el sitio con imágenes. */
export function crearAccesorios(lista = [], ancho = 5, semilla = 7) {
  const grupo = new THREE.Group();
  for (const u of ubicaciones(lista, ancho)) {
    const o = crearAccesorio(u.nombre, semilla);
    o.position.set(u.x, 0, u.z);
    o.scale.set(u.espejo ? -1 : 1, 1, 1);
    grupo.add(o);
  }
  return grupo;
}
