// Elementos naturales como imágenes, ubicados alrededor de los envases 3D con la
// misma perspectiva de la cámara. Las composiciones se arman con tools/editor.html
// y se guardan en js/composiciones.js; si un producto no tiene, se arma una automática.
import { FONDOS } from './fondos.js';
import { COMPOSICIONES } from './composiciones.js';

const PLANTAS = new Set(['palmera', 'monstera', 'lavanda', 'pasto']);
// en pantallas angostas las plantas de fondo se achican para no tapar el texto
const angosto = matchMedia('(max-width: 760px)');

/** Detrás (z < 0) o delante (z >= 0) del frasco: lo define la profundidad. */
export const capaDe = (it) => ((it.z ?? 0) < 0 ? 'atras' : 'adelante');

/** Desenfoque por distancia (px a 900 px de alto): lo lejano y lo muy cercano se suaviza. */
export function desenfoque(it) {
  const z = it.z ?? 0;
  if (z < -1.5) return Math.min(5, (-z - 1.5) * 0.7);
  if (z > 4) return Math.min(3, (z - 4) * 0.6);
  return 0;
}

const porProfundidad = (a, b) => (a.z ?? 0) - (b.z ?? 0);

export const archivo = (nombre) => `assets/fondos/${nombre.replace(':', '-')}.webp`;

/**
 * Composición automática (cuando no hay una guardada). Cada elemento aparece una vez:
 * una planta va detrás y apenas a la izquierda (dos distintas, una a cada lado);
 * los objetos chicos, adelante al costado del frasco según su ancho real.
 * Unidades en cm, relativas al centro de los envases: x (izq/der), y (altura), z (profundidad).
 */
export function ubicaciones(lista = [], ancho = 5) {
  const mitad = ancho / 2;
  const unicos = [...new Set(lista)].filter((n) => FONDOS[n]);
  const atras = unicos.filter((n) => PLANTAS.has(n.split(':')[0]));
  const frente = unicos.filter((n) => !PLANTAS.has(n.split(':')[0]));
  const base = { y: 0, rot: 0, escala: 1, espejo: false };
  const out = [];
  if (atras.length === 1) out.push({ ...base, nombre: atras[0], x: -mitad * 0.5, z: -3, capa: 'atras' });
  else if (atras.length > 1) {
    out.push({ ...base, nombre: atras[0], x: -mitad - 1.2, z: -2.6, capa: 'atras' });
    out.push({ ...base, nombre: atras[1], x: mitad + 1.0, z: -3.2, capa: 'atras' });
  }
  const anchoCm = (n) => FONDOS[n].w / FONDOS[n].pxcm;
  frente.slice(0, 2).forEach((nombre, i) => {
    const medio = anchoCm(nombre) / 2;
    const x = i === 0 ? mitad * 0.55 + medio : -(mitad * 0.6 + medio + 0.2);
    out.push({ ...base, nombre, x, z: i === 0 ? 2.4 : 2.1, capa: 'adelante' });
  });
  return out;
}

/** Composición guardada para una clave (id de producto o "promo-N"), o null. */
export function composicion(clave) {
  return COMPOSICIONES[clave] || null;
}

/** Giro del frasco guardado en la composición (radianes), o el valor por defecto. */
export function giroDe(clave, porDefecto) {
  return composicion(clave)?.giro ?? porDefecto;
}

/** Elementos a mostrar: los guardados o los automáticos. */
export function elementos(clave, lista, ancho) {
  const c = composicion(clave);
  return c ? c.elementos.map((e) => ({ y: 0, rot: 0, escala: 1, espejo: false, ...e })) : ubicaciones(lista, ancho);
}

/** ¿Usa desenfoque por distancia? (por defecto sí) */
export function conDesenfoque(clave) {
  return composicion(clave)?.desenfoque !== false;
}

/**
 * Geometría en pantalla de un elemento: punto de apoyo, escala imagen→pantalla, etc.
 * `extra` multiplica la escala (p. ej. plantas en celulares).
 */
export function geometria(estudio, it, extra = 1) {
  const d = FONDOS[it.nombre];
  const base = estudio.proyectar(it.x, it.y || 0, it.z);
  const arriba = estudio.proyectar(it.x, (it.y || 0) + 1, it.z);
  const k = (Math.abs(base.y - arriba.y) / d.pxcm) * (it.escala || 1) * extra;
  return { d, base, k };
}

/** Dibuja una capa de elementos en un canvas 2D (fotos del catálogo). */
export async function dibujarCapa(ctx, estudio, items, capa, cargar, conBlur = true) {
  const alto = estudio._tam?.[1] || 900;
  for (const it of items.filter((x) => capaDe(x) === capa && FONDOS[x.nombre]).sort(porProfundidad)) {
    const img = await cargar(it.nombre);
    if (!img) continue;
    const { d, base, k } = geometria(estudio, it);
    ctx.save();
    const b = conBlur ? desenfoque(it) * (alto / 900) : 0;
    ctx.filter = b > 0.1 ? `blur(${b.toFixed(2)}px)` : 'none';
    ctx.translate(base.x, base.y);
    ctx.rotate(((it.rot || 0) * Math.PI) / 180);
    ctx.scale(it.espejo ? -k : k, k);
    ctx.drawImage(img, -d.ax, -d.ay, d.w, d.h);
    ctx.restore();
  }
}

/**
 * Capas de imágenes detrás y delante de un canvas con Estudio.
 * `contenedor` debe ser el padre posicionado del canvas.
 */
export class Decor {
  constructor(estudio, contenedor) {
    this.estudio = estudio;
    this.atras = capa(contenedor, 'decor decor--atras');
    this.adelante = capa(contenedor, 'decor decor--adelante');
    contenedor.insertBefore(this.atras, contenedor.firstChild);
    this.items = [];
    this.adaptarMovil = true;
    this.desenfoque = true;
    estudio.alCuadro = () => this.actualizar();
  }

  /** Aplica la separación guardada (combos) antes de armar los envases. */
  prepararEstudio(clave) {
    const c = composicion(clave);
    this.estudio.separacion = c?.separacion ?? 0.9;
  }

  mostrar(lista, clave) {
    this.desenfoque = conDesenfoque(clave);
    this.ponerItems(elementos(clave, lista || [], this.estudio.anchoEnvases || 5));
  }

  /** Reemplaza los elementos (los usa el editor). */
  ponerItems(items) {
    this.atras.replaceChildren();
    this.adelante.replaceChildren();
    this.items = items.filter((u) => FONDOS[u.nombre]);
    // los más lejanos primero: el orden en pantalla sigue a la profundidad
    [...this.items].sort(porProfundidad).forEach((u) => {
      const img = new Image();
      img.src = archivo(u.nombre);
      img.alt = '';
      img.decoding = 'async';
      img.draggable = false;
      img.className = 'decor-img';
      (capaDe(u) === 'atras' ? this.atras : this.adelante).append(img);
      u.img = img;
    });
    this.actualizar();
  }

  actualizar() {
    const e = this.estudio;
    if (!e._tam) return;
    for (const it of this.items) {
      const extra = this.adaptarMovil && capaDe(it) === 'atras' && angosto.matches ? 0.72 : 1;
      const { d, base, k } = geometria(e, it, extra);
      const s = it.img.style;
      s.width = `${d.w}px`;
      s.transformOrigin = `${d.ax}px ${d.ay}px`;
      const b = this.desenfoque ? desenfoque(it) * (e._tam[1] / 900) : 0;
      // el filtro se aplica antes del scale del transform, por eso se divide por k
      const blur = b > 0.1 ? `blur(${(b / k).toFixed(2)}px)` : '';
      // contorno de selección (editor): se suma al desenfoque
      s.filter = it.img.classList.contains('sel') ? `${blur} drop-shadow(0 0 ${1.5 / k}px #fff) drop-shadow(0 0 ${2 / k}px #1a73e8)` : blur;
      s.transform = `translate(${base.x - d.ax}px, ${base.y - d.ay}px) rotate(${it.rot || 0}deg) scale(${it.espejo ? -k : k}, ${k})`;
    }
  }
}

function capa(contenedor, clase) {
  const d = document.createElement('div');
  d.className = clase;
  d.setAttribute('aria-hidden', 'true');
  contenedor.append(d);
  return d;
}
