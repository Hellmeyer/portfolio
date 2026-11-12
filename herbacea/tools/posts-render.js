// Dibuja las slides de los posts en un canvas, con la identidad del sitio:
// Marcellus + Hanken Grotesk, colores de cada producto, el marco doble de las
// etiquetas, divisor con hojita, ilustraciones de línea y frascos 3D.
import { Estudio } from '../js/bottle3d.js';
import { porId, resolver, PROMOS, CONTACTO } from '../js/products.js';
import { ubicaciones, dibujarCapa, archivo } from '../js/decor.js';
import { tenido, fuentesListas } from '../js/assets.js';
import { composicionesActuales } from '../tools/fichas.js';

export const FORMATOS = {
  feed: { nombre: 'Feed 4:5', w: 1080, h: 1350, arriba: 0, abajo: 0 },
  story: { nombre: 'Historia 9:16', w: 1080, h: 1920, arriba: 210, abajo: 280 },
  cuadrado: { nombre: 'Cuadrado 1:1', w: 1080, h: 1080, arriba: 0, abajo: 0 },
};

const TINTA = '#14211a', PAPEL = '#f1f0e9', MUSGO = '#3d5640';
const SERIF = '"Marcellus", serif', SANS = '"Hanken Grotesk", sans-serif';

/** Colores de la idea (los del primer producto o los de la promo). */
export function temaDe(idea) {
  const p = idea.productos?.[0] && porId(idea.productos[0]);
  const base = p ? { ...p.tema } : { suave: '#e8ece0', profundo: '#2a3b1f', sobre: '#e3c062' };
  if (idea.promo !== undefined) Object.assign(base, PROMOS[idea.promo].tema);
  return base;
}

function colores(fondo, tema) {
  switch (fondo) {
    case 'profundo': return { bg: tema.profundo, fg: tema.sobre, acento: tema.sobre, linea: tema.sobre };
    case 'papel': return { bg: PAPEL, fg: TINTA, acento: MUSGO, linea: MUSGO };
    case 'tinta': return { bg: TINTA, fg: PAPEL, acento: '#d9b24c', linea: '#d9b24c' };
    default: return { bg: tema.suave, fg: TINTA, acento: tema.profundo, linea: tema.profundo };
  }
}

// ── texto ───────────────────────────────────────────────────
function partir(ctx, texto, ancho) {
  const lineas = [];
  for (const parrafo of String(texto).split('\n')) {
    let l = '';
    for (const w of parrafo.split(' ')) {
      const prueba = l ? l + ' ' + w : w;
      if (ctx.measureText(prueba).width > ancho && l) { lineas.push(l); l = w; } else l = prueba;
    }
    lineas.push(l);
  }
  return lineas;
}

/** Busca el tamaño más grande que entra en `maxLineas`. */
function ajustar(ctx, texto, { familia, peso = 400, estilo = '', max, min, ancho, maxLineas }) {
  for (let t = max; t >= min; t -= 2) {
    ctx.font = `${estilo} ${peso} ${t}px ${familia}`;
    const lineas = partir(ctx, texto, ancho);
    if (lineas.length <= maxLineas) return { t, lineas };
  }
  ctx.font = `${estilo} ${peso} ${min}px ${familia}`;
  return { t: min, lineas: partir(ctx, texto, ancho) };
}

function escribir(ctx, bloque, x, y, { alto = 1.15, alinear = 'center' } = {}) {
  ctx.textAlign = alinear;
  ctx.textBaseline = 'alphabetic';
  bloque.lineas.forEach((l, i) => ctx.fillText(l, x, y + bloque.t * (0.85 + i * alto)));
  return y + bloque.t * (0.85 + (bloque.lineas.length - 1) * alto) + bloque.t * 0.3;
}

// ── adornos ─────────────────────────────────────────────────
function grano(ctx, w, h, oscuro) {
  ctx.save();
  ctx.fillStyle = oscuro ? 'rgba(255,255,255,0.025)' : 'rgba(60,45,25,0.035)';
  for (let i = 0; i < (w * h) / 900; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  ctx.restore();
}

/** Marco doble con esquinas recortadas, como en las etiquetas. */
function marco(ctx, w, h, color, arriba = 0, abajo = 0) {
  ctx.save();
  ctx.strokeStyle = color;
  const dib = (m, r, g) => {
    const x0 = m, y0 = m + arriba, x1 = w - m, y1 = h - m - abajo;
    ctx.lineWidth = g;
    ctx.beginPath();
    ctx.moveTo(x0 + r, y0);
    ctx.lineTo(x1 - r, y0); ctx.arc(x1, y0, r, Math.PI, Math.PI / 2, true);
    ctx.lineTo(x1, y1 - r); ctx.arc(x1, y1, r, -Math.PI / 2, Math.PI, true);
    ctx.lineTo(x0 + r, y1); ctx.arc(x0, y1, r, 0, -Math.PI / 2, true);
    ctx.lineTo(x0, y0 + r); ctx.arc(x0, y0, r, Math.PI / 2, 0, true);
    ctx.stroke();
  };
  ctx.globalAlpha = 0.85;
  dib(38, 30, 3);
  ctx.globalAlpha = 0.55;
  dib(50, 22, 1.5);
  ctx.restore();
}

/** Línea — hojita — línea. */
function divisor(ctx, cx, y, ancho, color) {
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - ancho / 2, y); ctx.lineTo(cx - 34, y); ctx.moveTo(cx + 34, y); ctx.lineTo(cx + ancho / 2, y); ctx.stroke();
  const hoja = (rot) => {
    ctx.save(); ctx.translate(cx, y + 9); ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-9, -12, 0, -24);
    ctx.quadraticCurveTo(9, -12, 0, 0);
    ctx.fill();
    ctx.restore();
  };
  hoja(-1.0); hoja(1.0);
  ctx.beginPath(); ctx.arc(cx, y + 9, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

async function logo(ctx, cx, y, ancho, color) {
  const c = await tenido('logo', color);
  const h = ancho * c.height / c.width;
  ctx.drawImage(c, cx - ancho / 2, y, ancho, h);
  return y + h;
}

async function ilustracion(ctx, nombre, x, y, w, h, color, alfa = 1) {
  if (!nombre) return;
  const c = await tenido(nombre, color);
  const k = Math.min(w / c.width, h / c.height);
  ctx.save(); ctx.globalAlpha = alfa;
  ctx.drawImage(c, x + (w - c.width * k) / 2, y + (h - c.height * k) / 2, c.width * k, c.height * k);
  ctx.restore();
}

// ── frascos 3D ──────────────────────────────────────────────
let estudio, lienzo3d;
async function frascos(idea, w, h, giro) {
  lienzo3d ??= document.createElement('canvas');
  estudio ??= new Estudio(lienzo3d, { captura: true, encuadre: 1.5 });
  estudio.renderer.setPixelRatio(1);
  const productos = idea.promo !== undefined
    ? PROMOS[idea.promo].productos.map(([id, v]) => resolver(porId(id), v))
    : idea.productos.slice(0, 2).map((id) => resolver(porId(id)));
  if (!productos.length) return null;
  const clave = idea.promo !== undefined ? `promo-${idea.promo}` : productos.length === 1 ? productos[0].id : null;
  const comp = clave ? (await composicionesActuales())[clave] : null;
  estudio.separacion = comp?.separacion ?? 0.9;
  estudio.ajustar(w, h);
  await estudio.mostrar(productos);
  estudio.fijar({ giro: giro ?? comp?.giro ?? -0.25, y: 0.02, x: 0, escala: 1, destapar: 0 }, true);
  estudio.cuadro();
  const lista = comp?.elementos
    ? comp.elementos.map((x) => ({ y: 0, rot: 0, escala: 1, espejo: false, ...x }))
    : ubicaciones(productos[0].escena || [], estudio.anchoEnvases);
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const ctx = out.getContext('2d');
  const t = Date.now();
  const cache = {};
  const cargar = (n) => (cache[n] ??= new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = archivo(n) + '?' + t; }));
  const blur = comp?.desenfoque !== false;
  await dibujarCapa(ctx, estudio, lista, 'atras', cargar, blur);
  ctx.drawImage(lienzo3d, 0, 0);
  await dibujarCapa(ctx, estudio, lista, 'adelante', cargar, blur);
  return out;
}

// ── layouts ─────────────────────────────────────────────────
const LAYOUTS = {
  async portada(ctx, s, f, c, idea, op) {
    const { w, h } = f;
    let y = f.arriba + 110;
    if (s.kicker) {
      ctx.fillStyle = c.acento; ctx.globalAlpha = 0.9;
      ctx.font = `500 32px ${SANS}`; ctx.textAlign = 'center';
      ctx.fillText(s.kicker, w / 2, y); ctx.globalAlpha = 1;
      y += 40;
    }
    ctx.fillStyle = c.fg;
    y = escribir(ctx, ajustar(ctx, s.titulo, { familia: SERIF, max: 138, min: 70, ancho: w - 180, maxLineas: 2 }), w / 2, y + 10, { alto: 1.05 });
    if (s.subtitulo) {
      ctx.globalAlpha = 0.85;
      y = escribir(ctx, ajustar(ctx, s.subtitulo, { familia: SANS, estilo: 'italic', max: 40, min: 30, ancho: w - 240, maxLineas: 3 }), w / 2, y + 14, { alto: 1.35 });
      ctx.globalAlpha = 1;
    }
    divisor(ctx, w / 2, y + 26, 420, c.linea);
    const top = y + 60, bottom = h - f.abajo - 170;
    const img = idea.productos?.length || idea.promo !== undefined
      ? await frascos(idea, w, Math.max(200, bottom - top), op.giro) : null;
    if (img) ctx.drawImage(img, 0, top);
    else await ilustracion(ctx, s.ilustracion, 0, top + 20, w, bottom - top - 40, c.acento, 0.95);
    await logo(ctx, w / 2, h - f.abajo - 120, 300, c.fg);
  },

  async lista(ctx, s, f, c, idea) {
    const { w, h } = f;
    marco(ctx, w, h, c.linea, f.arriba, f.abajo);
    let y = f.arriba + 150;
    ctx.fillStyle = c.fg;
    y = escribir(ctx, ajustar(ctx, s.titulo, { familia: SERIF, max: 96, min: 60, ancho: w - 240, maxLineas: 2 }), w / 2, y);
    divisor(ctx, w / 2, y + 20, 360, c.linea);
    const ilus = s.ilustracion;
    const zona = { top: y + 80, bottom: h - f.abajo - (ilus ? 360 : 200) };
    const items = (s.items || []).filter(Boolean);
    const t = Math.min(52, Math.max(34, (zona.bottom - zona.top) / Math.max(1, items.length) / 2.1));
    ctx.font = `400 ${t}px ${SANS}`;
    const prefijo = (i) => (s.numerada ? `${i + 1}.` : '·');
    const sangria = ctx.measureText(s.numerada ? `${items.length}.` : '·').width + t * 0.6;
    const anchoTexto = w - 300 - sangria;
    const bloques = items.map((it) => partir(ctx, it, anchoTexto));
    const anchoMax = sangria + Math.max(...bloques.flat().map((l) => ctx.measureText(l).width));
    const altoBloque = bloques.reduce((a, b) => a + b.length * t * 1.32 + t * 0.5, 0);
    let yy = zona.top + Math.max(0, (zona.bottom - zona.top - altoBloque) / 2);
    const x0 = (w - anchoMax) / 2;
    ctx.textAlign = 'left';
    bloques.forEach((partes, i) => {
      ctx.globalAlpha = 0.75; ctx.fillText(prefijo(i), x0, yy + t); ctx.globalAlpha = 1;
      partes.forEach((parte) => { ctx.fillText(parte, x0 + sangria, yy + t); yy += t * 1.32; });
      yy += t * 0.5;
    });
    if (ilus) await ilustracion(ctx, ilus, w / 2 - 170, h - f.abajo - 380, 340, 230, c.acento, 0.9);
    await logo(ctx, w / 2, h - f.abajo - 125, 210, c.fg);
  },

  async frase(ctx, s, f, c) {
    const { w, h } = f;
    marco(ctx, w, h, c.linea, f.arriba, f.abajo);
    const altoIlus = Math.min(330, h * 0.24);
    await ilustracion(ctx, s.ilustracion, w / 2 - 200, f.arriba + 110, 400, altoIlus, c.acento, 0.9);
    ctx.fillStyle = c.fg;
    const b = ajustar(ctx, s.texto, { familia: SERIF, max: 92, min: 54, ancho: w - 260, maxLineas: 6 });
    const altoTexto = b.t * (0.85 + (b.lineas.length - 1) * 1.15);
    const zonaTop = f.arriba + 110 + altoIlus + 40, zonaBottom = h - f.abajo - 220;
    escribir(ctx, b, w / 2, zonaTop + Math.max(0, (zonaBottom - zonaTop - altoTexto) / 2) - b.t * 0.2);
    divisor(ctx, w / 2, h - f.abajo - 200, 260, c.linea);
    await logo(ctx, w / 2, h - f.abajo - 150, 230, c.fg);
  },

  async planta(ctx, s, f, c) {
    const { w, h } = f;
    marco(ctx, w, h, c.linea, f.arriba, f.abajo);
    const altoIlus = h * 0.38;
    await ilustracion(ctx, s.ilustracion, 120, f.arriba + 100, w - 240, altoIlus, c.acento, 1);
    let y = f.arriba + 120 + altoIlus;
    ctx.fillStyle = c.fg;
    y = escribir(ctx, ajustar(ctx, s.nombre, { familia: SERIF, max: 120, min: 70, ancho: w - 240, maxLineas: 1 }), w / 2, y);
    ctx.globalAlpha = 0.75;
    y = escribir(ctx, ajustar(ctx, s.latin || '', { familia: SANS, estilo: 'italic', max: 36, min: 28, ancho: w - 240, maxLineas: 1 }), w / 2, y);
    ctx.globalAlpha = 1;
    divisor(ctx, w / 2, y + 22, 300, c.linea);
    escribir(ctx, ajustar(ctx, s.texto || '', { familia: SANS, max: 48, min: 32, ancho: w - 280, maxLineas: 5 }), w / 2, y + 64, { alto: 1.45 });
    await logo(ctx, w / 2, h - f.abajo - 125, 210, c.fg);
  },

  async texto(ctx, s, f, c) {
    const { w, h } = f;
    marco(ctx, w, h, c.linea, f.arriba, f.abajo);
    let y = f.arriba + 150;
    ctx.fillStyle = c.fg;
    y = escribir(ctx, ajustar(ctx, s.titulo, { familia: SERIF, max: 88, min: 56, ancho: w - 240, maxLineas: 2 }), w / 2, y);
    divisor(ctx, w / 2, y + 20, 340, c.linea);
    const b = ajustar(ctx, s.texto || '', { familia: SANS, max: 46, min: 32, ancho: w - 300, maxLineas: 9 });
    escribir(ctx, b, 150, y + 90, { alto: 1.5, alinear: 'left' });
    if (s.ilustracion) await ilustracion(ctx, s.ilustracion, w - 360, h - f.abajo - 420, 240, 280, c.acento, 0.85);
    await logo(ctx, w / 2, h - f.abajo - 125, 210, c.fg);
  },

  async precio(ctx, s, f, c, idea, op) {
    const { w, h } = f;
    marco(ctx, w, h, c.linea, f.arriba, f.abajo);
    let y = f.arriba + 140;
    ctx.fillStyle = c.acento;
    ctx.font = `600 34px ${SANS}`; ctx.textAlign = 'center';
    ctx.fillText(s.titulo || 'Ideal para', w / 2, y); y += 30;
    ctx.fillStyle = c.fg;
    y = escribir(ctx, ajustar(ctx, s.texto || '', { familia: SERIF, max: 58, min: 40, ancho: w - 260, maxLineas: 3 }), w / 2, y + 10, { alto: 1.2 });
    const top = y + 20, bottom = h - f.abajo - 420;
    const img = await frascos(idea, w, Math.max(200, bottom - top), op.giro);
    if (img) ctx.drawImage(img, 0, top);
    y = bottom + 20;
    ctx.globalAlpha = 0.6; ctx.font = `400 44px ${SANS}`; ctx.fillText(s.antes || '', w / 2, y + 40);
    const ancho = ctx.measureText(s.antes || '').width;
    ctx.fillRect(w / 2 - ancho / 2, y + 26, ancho, 3); ctx.globalAlpha = 1;
    ctx.font = `400 140px ${SERIF}`; ctx.fillText(s.precio || '', w / 2, y + 180);
    if (s.ahorro) {
      ctx.font = `500 34px ${SANS}`;
      const aw = ctx.measureText(s.ahorro).width + 56;
      ctx.strokeStyle = c.linea; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(w / 2 - aw / 2, y + 215, aw, 62, 31); ctx.stroke();
      ctx.fillText(s.ahorro, w / 2, y + 258);
    }
    await logo(ctx, w / 2, h - f.abajo - 110, 200, c.fg);
  },

  async cierre(ctx, s, f, c, idea, op) {
    const { w, h } = f;
    const yLogo = await logo(ctx, w / 2, f.arriba + 110, 440, c.fg);
    ctx.fillStyle = c.acento; ctx.font = `400 34px ${SANS}`; ctx.textAlign = 'center';
    ctx.fillText('Fitomedicina', w / 2, yLogo + 50);
    const top = yLogo + 90, bottom = h - f.abajo - 330;
    const img = (idea.productos?.length || idea.promo !== undefined) ? await frascos(idea, w, Math.max(200, bottom - top), op.giro) : null;
    if (img) ctx.drawImage(img, 0, top);
    else await ilustracion(ctx, s.ilustracion || 'manzanilla', 0, top + 30, w, bottom - top - 60, c.acento, 0.9);
    ctx.fillStyle = c.fg;
    const yt = escribir(ctx, ajustar(ctx, s.texto || '', { familia: SERIF, max: 58, min: 40, ancho: w - 240, maxLineas: 2 }), w / 2, bottom + 40, { alto: 1.2 });
    divisor(ctx, w / 2, yt + 22, 240, c.linea);
    ctx.font = `500 34px ${SANS}`; ctx.fillText(CONTACTO.usuario, w / 2, yt + 90);
  },
};

export const NOMBRES_LAYOUT = { portada: 'Portada', lista: 'Lista', frase: 'Frase', planta: 'Planta', texto: 'Texto', precio: 'Precio', cierre: 'Cierre' };

/** Dibuja una slide. op = { formato, giro } */
export async function dibujarSlide(idea, slide, op = {}) {
  await fuentesListas();
  await document.fonts.load(`italic 400 40px "Hanken Grotesk"`).catch(() => {});
  const f = FORMATOS[op.formato || 'feed'];
  const canvas = document.createElement('canvas');
  canvas.width = f.w; canvas.height = f.h;
  const ctx = canvas.getContext('2d');
  const c = colores(slide.fondo || 'suave', temaDe(idea));
  ctx.fillStyle = c.bg; ctx.fillRect(0, 0, f.w, f.h);
  grano(ctx, f.w, f.h, slide.fondo === 'profundo' || slide.fondo === 'tinta');
  await (LAYOUTS[slide.layout] || LAYOUTS.texto)(ctx, slide, f, c, idea, op);
  return canvas;
}
