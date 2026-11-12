// Convierte el logo y las ilustraciones (PNG sobre fondo liso) en
// máscaras transparentes que se pueden teñir de cualquier color.

// Ilustraciones de línea en assets/ilustraciones (recortadas de las etiquetas reales;
// lavanda-ae, teatree y citronella salen del PDF vectorial a 1200 dpi).
export const ILUSTRACIONES = [
  'lavanda', 'lavanda-ae', 'lavanda-rama', 'teatree', 'citronella', 'cannabis', 'cannabis-rama',
  'manzanilla', 'calendula', 'arnica', 'almendro', 'jojoba',
];

const FUENTES = {
  logo: { src: 'assets/logo.svg', recorte: null },
  ...Object.fromEntries(ILUSTRACIONES.map((n) => [n, { src: `assets/ilustraciones/${n}.png`, recorte: null }])),
};

const imagenes = new Map();
const mascaras = new Map();

function cargarImagen(src) {
  if (!imagenes.has(src)) {
    imagenes.set(src, new Promise((ok, mal) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = mal;
      img.src = src;
    }));
  }
  return imagenes.get(src);
}

async function mascara(clave) {
  if (mascaras.has(clave)) return mascaras.get(clave);
  const tarea = (async () => {
    const { src, recorte } = FUENTES[clave];
    const img = await cargarImagen(src);
    if (src.endsWith('.svg')) {
      // vector: se rasteriza grande y el alfa ya es la máscara
      const W = 2400, H = Math.round(W * img.naturalHeight / img.naturalWidth) || 458;
      const c = document.createElement('canvas');
      c.width = W; c.height = H;
      c.getContext('2d').drawImage(img, 0, 0, W, H);
      return c;
    }
    const [sx, sy, sw, sh] = recorte || [0, 0, img.naturalWidth, img.naturalHeight];
    const c = document.createElement('canvas');
    c.width = sw; c.height = sh;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    const datos = ctx.getImageData(0, 0, sw, sh);
    const d = datos.data;
    const fi = ((sh - 4) * sw + 4) * 4; // muestra del fondo: esquina inferior izquierda
    const fondo = [d[fi], d[fi + 1], d[fi + 2]];
    let max = 1;
    const dist = new Float32Array(sw * sh);
    for (let i = 0; i < dist.length; i++) {
      const r = d[i * 4] - fondo[0], g = d[i * 4 + 1] - fondo[1], b = d[i * 4 + 2] - fondo[2];
      dist[i] = Math.sqrt(r * r + g * g + b * b);
      if (dist[i] > max) max = dist[i];
    }
    let x0 = sw, y0 = sh, x1 = 0, y1 = 0;
    for (let i = 0; i < dist.length; i++) {
      const a = Math.min(1, Math.max(0, (dist[i] / (max * 0.75) - 0.06) / 0.94));
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 255;
      d[i * 4 + 3] = a * 255;
      if (a > 0.08) {
        const x = i % sw, y = (i / sw) | 0;
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    ctx.putImageData(datos, 0, 0);
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const out = document.createElement('canvas');
    out.width = w; out.height = h;
    out.getContext('2d').drawImage(c, x0, y0, w, h, 0, 0, w, h);
    return out;
  })();
  mascaras.set(clave, tarea);
  return tarea;
}

/** Devuelve un canvas con el gráfico teñido del color pedido. */
export async function tenido(clave, color) {
  const m = await mascara(clave);
  const c = document.createElement('canvas');
  c.width = m.width; c.height = m.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(m, 0, 0);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

/** Rellena todos los <img data-grafico="logo" data-color="#..."> de la página. */
export async function pintarGraficos(raiz = document) {
  const imgs = raiz.querySelectorAll('img[data-grafico]');
  await Promise.all([...imgs].map(async (img) => {
    const color = img.dataset.color || getComputedStyle(img).color;
    const c = await tenido(img.dataset.grafico, color);
    img.src = c.toDataURL('image/png');
    img.width = c.width; img.height = c.height;
  }));
}

export function fuentesListas() {
  return Promise.all([
    document.fonts.load('400 40px "Marcellus"'),
    document.fonts.load('400 40px "Hanken Grotesk"'),
    document.fonts.load('500 40px "Hanken Grotesk"'),
    document.fonts.load('italic 400 40px "Hanken Grotesk"'),
  ]).catch(() => {});
}
