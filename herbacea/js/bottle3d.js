// Envases 3D procedurales + escena reutilizable (luz de estudio).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { dibujarEtiqueta } from './label.js';
import { ETIQUETAS_FINALES } from './etiquetas-finales.js';

// etiquetas finales vigentes (el editor de etiquetas puede actualizarlas sin recargar)
let FINALES = ETIQUETAS_FINALES;
export function actualizarEtiquetasFinales(m) { FINALES = m; }

const TAU = Math.PI * 2;
const ALTO = 6; // altura de referencia de la escena


// Zona de etiqueta por envase (cm). Con imagen, la envoltura sale de su proporción.
export const ETIQUETAS = {
  frasco: { radio: 2.57, alto: 2.55, centro: 1.95, envoltura: 0.78 },
  tapa: { radio: 1.185, alto: 3.0, centro: 2.05, envoltura: 0.82 },
  gotero10: { radio: 1.185, alto: 2.6, centro: 1.95, envoltura: 0.93 },
  gotero: { radio: 1.635, alto: 3.4, centro: 2.5, envoltura: 0.9 },
};

const v = (x, y) => new THREE.Vector2(x, y);

/** Suaviza un perfil con una spline para un torno de alta resolución. */
function perfil(puntos, n = 120) {
  return new THREE.SplineCurve(puntos).getSpacedPoints(n);
}

// resolución intermedia: suave en pantalla y liviano en celulares
const MOVIL = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
const SEG = MOVIL ? 72 : 112;

/**
 * Perfil de frasco 'Boston round': base redondeada, pared recta,
 * hombro en cúpula (arco elíptico, no cónico) y cuello con labio.
 */
function boston(R, H, cuello, alturaCuello) {
  const pts = perfil([v(0, 0), v(R - 0.16, 0), v(R - 0.04, 0.07), v(R, 0.3)], 24);
  for (let i = 1; i <= 6; i++) pts.push(v(R, 0.3 + (H - 0.3) * (i / 6)));
  const hombro = (R - cuello) * 0.74;        // alto del hombro
  const r0 = cuello + 0.12;                   // donde termina el hombro
  // superelipse: dobla rápido en el borde y queda una cúpula baja hacia el cuello
  for (let i = 1; i <= 56; i++) {
    const t = (i / 56) * (Math.PI / 2);
    pts.push(v(r0 + (R - r0) * Math.pow(Math.cos(t), 0.55), H + hombro * Math.pow(Math.sin(t), 0.62)));
  }
  const y = H + hombro;
  // filete hacia el cuello y anillo (rodete) visible debajo de la tapa
  pts.push(v(cuello + 0.04, y + 0.02), v(cuello + 0.02, y + 0.06));
  pts.push(v(cuello + 0.1, y + 0.1), v(cuello + 0.12, y + 0.16), v(cuello + 0.1, y + 0.23), v(cuello + 0.02, y + 0.27));
  pts.push(v(cuello, y + alturaCuello - 0.12), v(cuello + 0.05, y + alturaCuello - 0.08), v(cuello + 0.05, y + alturaCuello - 0.02), v(cuello - 0.02, y + alturaCuello), v(0, y + alturaCuello));
  return { puntos: pts, alto: y + alturaCuello };
}

function torno(puntos, segmentos = SEG) {
  return new THREE.LatheGeometry(puntos, segmentos);
}

function tornoEstriado(puntos, estrias, prof, yMin, yMax) {
  const g = new THREE.LatheGeometry(puntos, estrias * (MOVIL ? 4 : 6));
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y < yMin || y > yMax) continue;
    const x = pos.getX(i), z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 0.01) continue;
    const a = Math.atan2(x, z);
    const k = (r - prof * Math.pow(0.5 - 0.5 * Math.cos(a * estrias), 2)) / r;
    pos.setX(i, x * k); pos.setZ(i, z * k);
  }
  g.computeVertexNormals();
  return g;
}

// color del aceite que se ve a través del ámbar
function colorAceite(p) {
  if (p.liquido) return p.liquido;
  return { cbd: '#4a3a0e', vegetal: '#b9852a', esencial: '#d6b764' }[p.categoria] || '#b9852a';
}

/** Volumen de aceite: el perfil del frasco achicado hacia adentro y cortado a la altura de llenado. */
function liquido(puntos, alturaLlenado, pared = 0.12) {
  const pts = [];
  for (const q of puntos) {
    if (q.y > alturaLlenado) break;
    pts.push(v(Math.max(0, q.x - pared), Math.max(pared, q.y)));
  }
  const ult = pts[pts.length - 1];
  pts.push(v(ult.x, alturaLlenado), v(0, alturaLlenado));
  return pts;
}

const materiales = (p) => ({
  vidrio: new THREE.MeshPhysicalMaterial({
    color: 0xf3f8f1, transmission: 1, roughness: 0.06, thickness: 0.4, ior: 1.5,
    attenuationColor: new THREE.Color(0xdfeedd), attenuationDistance: 6,
    clearcoat: 0.35, clearcoatRoughness: 0.12, envMapIntensity: 0.7,
  }),
  // vidrio ámbar traslúcido: deja ver el aceite y la pared de atrás
  ambar: new THREE.MeshPhysicalMaterial({
    color: 0xc39a76, roughness: 0.04, transmission: 1, thickness: 0.45, ior: 1.52,
    attenuationColor: new THREE.Color(0x6f4424), attenuationDistance: 0.6,
    clearcoat: 0.4, clearcoatRoughness: 0.1, envMapIntensity: 0.75,
  }),
  liquido: new THREE.MeshPhysicalMaterial({ color: new THREE.Color(colorAceite(p)), roughness: 0.15, clearcoat: 0.6, clearcoatRoughness: 0.1 }),
  // tapa metálica negra laqueada
  metal: new THREE.MeshPhysicalMaterial({ color: 0x0c0c0c, metalness: 0.6, roughness: 0.32, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 0.7 }),
  plastico: new THREE.MeshPhysicalMaterial({ color: 0x0f0f0f, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 }),
  goma: new THREE.MeshPhysicalMaterial({ color: new THREE.Color(p.bulbo || '#5e6366'), roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.5 }),
  // bálsamo: crema verde oliva pálida
  balsamo: new THREE.MeshPhysicalMaterial({ color: 0xc8c793, roughness: 0.42, sheen: 0.6, sheenColor: new THREE.Color(0xeef0c8), clearcoat: 0.25, clearcoatRoughness: 0.4 }),
});

function sombreado(obj) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
}

/** Construye el envase. Devuelve { raiz, tapa, tapaY, alto, ancho, etiqueta }. */
export async function crearEnvase(p) {
  const m = materiales(p);
  const raiz = new THREE.Group();
  const tapa = new THREE.Group();
  let alto, ancho, subida = 1.8; // subida: cuánto se levanta la tapa al abrir (cm)

  if (p.forma === 'frasco') {
    // vidrio: base gruesa, pared recta, hombro redondeado, cuello con rosca
    const exterior = perfil([
      v(0.0, 0.0), v(2.1, 0.0), v(2.42, 0.08), v(2.53, 0.35), v(2.54, 1.5), v(2.54, 3.35),
      v(2.46, 3.72), v(2.25, 3.93), v(2.1, 4.02), v(2.1, 4.1),
    ], 90);
    const rosca = [v(2.16, 4.16), v(2.12, 4.24), v(2.16, 4.32), v(2.12, 4.4), v(2.1, 4.5), v(2.04, 4.56), v(1.96, 4.52)];
    const interior = perfil([v(1.95, 4.45), v(1.98, 4.0), v(2.2, 3.72), v(2.34, 3.4), v(2.36, 1.0), v(2.3, 0.62), v(2.0, 0.48), v(0, 0.45)], 60);
    raiz.add(new THREE.Mesh(torno([...exterior, ...rosca, ...interior]), m.vidrio));
    // bálsamo con superficie apenas cóncava
    const crema = perfil([v(0, 0.47), v(2.0, 0.49), v(2.3, 0.64), v(2.345, 1.0), v(2.345, 3.4), v(2.22, 3.68), v(2.0, 3.86), v(1.4, 3.84), v(0, 3.8)], 70);
    raiz.add(new THREE.Mesh(torno(crema), m.balsamo));
    // tapa metálica: borde enrollado abajo, faldón, canto redondeado y panel superior hundido
    const exteriorTapa = perfil([
      v(2.3, 0.02), v(2.5, 0.0), v(2.6, 0.08), v(2.6, 0.16), v(2.55, 0.22), v(2.56, 0.5), v(2.56, 0.78),
      v(2.53, 0.9), v(2.44, 0.98), v(2.3, 1.0), v(2.12, 0.97), v(2.0, 0.96), v(1.0, 0.985), v(0, 0.99),
    ], 110);
    const dentro = [v(0, 0.9), v(2.3, 0.9), v(2.32, 0.1), v(2.3, 0.03)];
    tapa.add(new THREE.Mesh(torno([...dentro, ...exteriorTapa]), m.metal));
    tapa.position.y = 4.02;
    alto = 5.02; ancho = 5.2;
  } else if (p.forma === 'tapa') {
    const vidrio = boston(1.165, 3.95, 0.56, 0.62);
    raiz.add(new THREE.Mesh(torno(vidrio.puntos), m.ambar));
    raiz.add(new THREE.Mesh(torno(liquido(vidrio.puntos, 3.55)), m.liquido));
    raiz.add(new THREE.Mesh(torno(perfil([v(0.6, 4.69), v(0.74, 4.7), v(0.77, 4.78), v(0.76, 4.88), v(0.6, 4.9)], 30), 96), m.plastico));
    tapa.add(new THREE.Mesh(tornoEstriado(perfil([
      v(0, 0), v(0.74, 0), v(0.775, 0.04), v(0.775, 0.7), v(0.775, 1.3), v(0.75, 1.4), v(0.66, 1.45), v(0, 1.46),
    ], 60), 48, 0.025, 0.06, 1.32), m.plastico));
    tapa.position.y = 4.91;
    alto = 6.37; ancho = 2.4;
  } else {
    // goteros ámbar (10ml o 30ml)
    const chico = p.forma === 'gotero10';
    const R = chico ? 1.165 : 1.615, H = chico ? 3.95 : 4.9, cuello = chico ? 0.56 : 0.66;
    const vidrio = boston(R, H, cuello, 0.72);
    raiz.add(new THREE.Mesh(torno(vidrio.puntos), m.ambar));
    raiz.add(new THREE.Mesh(torno(liquido(vidrio.puntos, H - 0.45)), m.liquido));
    const rc = cuello + 0.24;
    tapa.add(new THREE.Mesh(tornoEstriado(perfil([
      v(0, 0), v(rc - 0.03, 0), v(rc, 0.05), v(rc, 0.6), v(rc, 1.0), v(rc - 0.06, 1.08), v(rc - 0.16, 1.1), v(0.5, 1.1),
    ], 60), 56, 0.03, 0.06, 1.0), m.plastico));
    tapa.add(new THREE.Mesh(torno(perfil([
      v(0, 1.06), v(0.56, 1.06), v(0.6, 1.2), v(0.52, 1.55), v(0.45, 1.9), v(0.5, 2.5), v(0.54, 2.95),
      v(0.48, 3.25), v(0.3, 3.42), v(0, 3.46),
    ], 80), 96), m.goma));
    tapa.position.y = vidrio.alto - (chico ? 0.32 : 0.42);
    alto = tapa.position.y + 3.46; ancho = R * 2;

    // pipeta de vidrio que cuelga de la tapa, con aceite en la punta
    const largo = tapa.position.y - 0.75; // termina cerca del fondo del frasco
    const rp = chico ? 0.16 : 0.21;
    tapa.add(new THREE.Mesh(torno(perfil([
      v(0, -largo), v(0.05, -largo + 0.02), v(0.08, -largo + 0.3), v(rp * 0.8, -largo + 0.75),
      v(rp, -largo + 1.0), v(rp, -largo * 0.5), v(rp, -0.1), v(rp + 0.03, 0.02), v(0, 0.04),
    ], 70), 48), m.vidrio));
    tapa.add(new THREE.Mesh(torno(perfil([
      v(0, -largo + 0.06), v(0.035, -largo + 0.08), v(0.06, -largo + 0.32), v(rp * 0.65, -largo + 0.78),
      v(rp * 0.78, -largo + 1.05), v(rp * 0.78, -largo + 1.7), v(0, -largo + 1.72),
    ], 40), 32), m.liquido));
    // al abrir, la pipeta sale casi entera (queda la punta en el cuello)
    subida = largo - 0.25;
  }
  raiz.add(tapa);

  // etiqueta
  const base = ETIQUETAS[p.forma];
  const { textura, envoltura, alto: altoEtiqueta } = await texturaEtiqueta(p, base);
  const L = TAU * envoltura;
  const etiqueta = new THREE.Mesh(
    new THREE.CylinderGeometry(base.radio, base.radio, altoEtiqueta, SEG, 1, true, -L / 2, L),
    new THREE.MeshPhysicalMaterial({ map: textura, roughness: 0.62, clearcoat: 0.15, clearcoatRoughness: 0.5 }),
  );
  etiqueta.position.y = base.centro;
  raiz.add(etiqueta);
  sombreado(raiz);
  return { raiz, tapa, tapaY: tapa.position.y, alto, ancho, subida, etiqueta };
}

const imagenes = new Map();
function cargar(src) {
  if (!imagenes.has(src)) {
    imagenes.set(src, new Promise((ok, mal) => {
      const i = new Image();
      i.onload = () => ok(i); i.onerror = mal; i.src = src;
    }));
  }
  return imagenes.get(src);
}

/** Clave de la etiqueta final de un producto (con variante si tiene). */
const claveEtiqueta = (p) => p.id + (p.variantes ? '#' + (p.variante ?? 0) : '');

async function texturaEtiqueta(p, base) {
  let fuente, envoltura = base.envoltura, alto = base.alto;
  // una etiqueta marcada como final en el editor de etiquetas tiene prioridad
  const final = FINALES[claveEtiqueta(p)];
  const imagen = final ? `${final.imagen}?v=${final.v}` : p.etiqueta.imagen;
  if (imagen) {
    fuente = await cargar(imagen);
    const aspecto = fuente.naturalWidth / fuente.naturalHeight;
    envoltura = (aspecto * alto) / (TAU * base.radio);
    // si la etiqueta es más larga que el envase, se achica en alto (sin deformarla)
    if (envoltura > 0.97) { alto *= 0.97 / envoltura; envoltura = 0.97; }
  } else {
    fuente = await dibujarEtiqueta(p, base);
  }
  const t = new THREE.Texture(fuente);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = MOVIL ? 4 : 8;
  t.needsUpdate = true;
  return { textura: t, envoltura, alto };
}

function liberar(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      if (o.material.map) o.material.map.dispose();
      o.material.dispose();
    }
  });
}


function sombraContacto() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, 'rgba(20,33,26,0.5)');
  r.addColorStop(0.5, 'rgba(20,33,26,0.16)');
  r.addColorStop(1, 'rgba(20,33,26,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.01;
  return m;
}

const POSE_BASE = { x: 0, y: 0, giro: 0, escala: 1, destapar: 0 };

/**
 * Escena con uno o más envases.
 * Pose: x / y = fracción de medio ancho / medio alto visible; giro en radianes (cada envase gira sobre sí).
 */
export class Estudio {
  constructor(canvas, { captura = false, encuadre = 1.7, sombras = false } = {}) {
    this.canvas = canvas;
    this.encuadre = encuadre;
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: captura }));
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, MOVIL ? 1.5 : 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 1.05;
    r.shadowMap.enabled = sombras;
    r.shadowMap.type = THREE.PCFSoftShadowMap;

    this.escena = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(r);
    // luz de estudio suave (sin HDRI externo)
    this.escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.escena.environmentIntensity = 0.8;
    pmrem.dispose();

    // luz principal cálida
    const sol = (this.sol = new THREE.DirectionalLight(0xfff0d6, 1.2));
    sol.position.set(6, 10, 7);
    sol.castShadow = sombras;
    sol.shadow.mapSize.set(2048, 2048);
    Object.assign(sol.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40 });
    sol.shadow.bias = -0.0004;
    sol.shadow.normalBias = 0.02;
    sol.shadow.radius = 6;
    this.escena.add(sol, sol.target);

    this.camara = new THREE.PerspectiveCamera(24, 1, 0.1, 400);
    this.rig = new THREE.Group();
    this.escena.add(this.rig);
    this.contenido = new THREE.Group(); // en cm, escalado a ALTO
    this.giratorio = new THREE.Group(); // los envases giran juntos, como un conjunto
    this.contenido.add(this.giratorio);
    this.rig.add(this.contenido);
    this.piso = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.16 }));
    this.piso.rotation.x = -Math.PI / 2;
    this.piso.receiveShadow = true;
    this.contenido.add(this.piso);

    this.envases = [];
    this.pose = { ...POSE_BASE };
    this.objetivo = { ...POSE_BASE };
    this.vaiven = 0;
    this.suavidad = 1.8; // más bajo = movimientos más lentos
    // giro "por gusto" del visitante: se suma al ángulo definido y después vuelve solo
    this.manual = { desvio: 0, vel: 0, empuje: 0, quieto: 0, arrastrando: false };
    this.medio = { w: 1, h: 1 };
    this._t = performance.now();
  }

  /** productos: uno o varios (ya resueltos con su variante). escena: lista de accesorios. */
  async mostrar(productos, escena) {
    const lista = Array.isArray(productos) ? productos : [productos];
    const pedido = (this._pedido = (this._pedido || 0) + 1);
    const envases = await Promise.all(lista.map(crearEnvase));
    // si mientras tanto se pidió otro producto, descartar este
    if (pedido !== this._pedido) { envases.forEach((e) => liberar(e.raiz)); return; }
    for (const e of this.envases) { this.giratorio.remove(e.pivote); liberar(e.pivote); }
    this.envases = [];
    if (this.extra) { this.contenido.remove(this.extra); liberar(this.extra); this.extra = null; }

    const sep = this.separacion ?? 0.9; // separación entre frascos (cm), editable por composición
    const total = envases.reduce((s, e) => s + e.ancho, 0) + sep * (envases.length - 1);
    let x = -total / 2;
    envases.forEach((e, i) => {
      const pivote = new THREE.Group();
      pivote.add(e.raiz);
      pivote.position.set(x + e.ancho / 2, 0, envases.length > 1 ? (i % 2 ? 0.9 : -0.4) : 0);
      x += e.ancho + sep;
      const sombra = sombraContacto();
      sombra.scale.setScalar(e.ancho * 1.9);
      pivote.add(sombra);
      e.pivote = pivote;
      this.giratorio.add(pivote);
    });
    this.envases = envases;

    this.anchoEnvases = total;
    this.altoEnvases = Math.max(...envases.map((e) => e.alto));
    // gancho para agregar objetos 3D extra (lo usa la herramienta que genera imágenes)
    if (this.alArmar) { this.extra = this.alArmar(lista, total, escena); if (this.extra) this.contenido.add(this.extra); }

    // escala: el envase más grande (o el conjunto) define el tamaño; tamaños reales entre sí
    const altoMax = Math.max(...envases.map((e) => Math.max(e.alto, e.ancho * 1.15)));
    const s = ALTO / Math.max(altoMax, total * 0.8);
    this.contenido.scale.setScalar(s);
    const altoReal = Math.max(...envases.map((e) => e.alto)) * s;
    this.contenido.position.y = this._baseY = -altoReal / 2 - (ALTO - altoReal) * 0.1;
    this._escala = s;
    this.anchoContenido = total * s * (this.margenAncho ?? 1.25); // aire a los costados de los frascos
    if (this._tam) this.ajustar(...this._tam);
  }

  ajustar(w, h) {
    if (!w || !h) return;
    this._tam = [w, h];
    this.renderer.setSize(w, h, false);
    const cam = this.camara;
    cam.aspect = w / h;
    const altoVisible = ALTO * this.encuadre;
    const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    let d = altoVisible / 2 / tan;
    const anchoMin = Math.max(ALTO * 0.8, this.anchoContenido || 0);
    if (altoVisible * cam.aspect < anchoMin) d = anchoMin / 2 / (tan * cam.aspect);
    cam.position.set(0, d * 0.14, d);
    cam.lookAt(0, -0.2, 0);
    cam.updateProjectionMatrix();
    const hv = d * tan;
    this.medio = { w: hv * cam.aspect, h: hv };
  }

  fijar(pose, inmediato = false) {
    Object.assign(this.objetivo, pose);
    if (inmediato) Object.assign(this.pose, this.objetivo);
  }

  cuadro(ahora = performance.now()) {
    const dt = Math.min(0.1, (ahora - this._t) / 1000);
    this._t = ahora;
    const k = 1 - Math.exp(-dt * this.suavidad);
    for (const c in this.pose) this.pose[c] += (this.objetivo[c] - this.pose[c]) * k;
    const p = this.pose;
    const vaiven = this.vaiven ? Math.sin(ahora / 4200) * this.vaiven : 0;
    this._giroManual(dt);
    this.rig.position.set(p.x * this.medio.w, p.y * this.medio.h, 0);
    this.rig.scale.setScalar(Math.max(0.0001, p.escala));
    this.giratorio.rotation.y = p.giro + vaiven + this.manual.desvio;
    if (this._baseY !== undefined && this.envases.length) {
      const subidaMax = Math.max(...this.envases.map((e) => e.subida || 0));
      this.contenido.position.y = this._baseY - p.destapar * subidaMax * 0.5 * this._escala;
    }
    this.envases.forEach((e, i) => {
      e.pivote.rotation.y = this.envases.length > 1 ? (i ? -0.3 : 0.3) : 0;
      e.tapa.position.y = e.tapaY + p.destapar * e.subida;
      e.tapa.rotation.y = -p.destapar * TAU * 0.6;
    });
    this.renderer.render(this.escena, this.camara);
    this.alCuadro?.();
  }

  // ── giro manual ──────────────────────────────────────────
  // Aceleración muy sutil: el arrastre no gira directo, empuja una velocidad
  // que crece despacio y tiene un tope. Al soltar frena solo y, tras unos
  // segundos quieto, el frasco vuelve a su ángulo definido.
  empujarGiro(dxPx) {
    const m = this.manual;
    const TOPE = 1.1; // rad/s como máximo
    m.empuje = Math.max(-TOPE, Math.min(TOPE, m.empuje + dxPx * 0.0035));
    m.quieto = 0;
  }

  soltarGiro() { this.manual.arrastrando = false; }
  tomarGiro() { this.manual.arrastrando = true; this.manual.quieto = 0; }

  /** Vuelve al ángulo definido ya (scroll, cambio de promo). */
  volverAlAngulo() {
    const m = this.manual;
    m.empuje = 0;
    m.quieto = 99;
  }

  _giroManual(dt) {
    const m = this.manual;
    m.vel += (m.empuje - m.vel) * (1 - Math.exp(-dt * 1.4)); // acelera despacio
    m.desvio += m.vel * dt;
    if (!m.arrastrando) {
      m.empuje *= Math.exp(-dt * 1.6); // el impulso se apaga solo
      m.quieto += dt;
    }
    if (m.quieto > 2.2) {
      // vuelve por el camino más corto, sin dar vueltas de más
      m.desvio = Math.atan2(Math.sin(m.desvio), Math.cos(m.desvio));
      m.empuje = 0;
      m.vel *= Math.exp(-dt * 4);
      m.desvio *= Math.exp(-dt * 1.1);
      if (Math.abs(m.desvio) < 0.0005) m.desvio = 0;
    }
  }

  /** Proyecta un punto del piso (en cm, espacio de los envases) a píxeles CSS del canvas. */
  proyectar(x, y, z) {
    const v = new THREE.Vector3(x, y, z);
    this.contenido.localToWorld(v).project(this.camara);
    const [w, h] = this._tam || [1, 1];
    return { x: (v.x + 1) / 2 * w, y: (1 - v.y) / 2 * h };
  }

  captura(tipo = 'image/webp') {
    this.cuadro();
    return this.canvas.toDataURL(tipo, 0.9);
  }

  destruir() {
    for (const e of this.envases) liberar(e.pivote);
    if (this.extra) liberar(this.extra);
    this.renderer.dispose();
  }
}
