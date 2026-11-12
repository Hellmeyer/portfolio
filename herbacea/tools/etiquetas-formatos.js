// ─────────────────────────────────────────────────────────────
//  Formatos de etiqueta y planchas de impresión de Herbácea.
//  Medidas en mm, tomadas de los PDF de imprenta reales
//  ("8 AE Lavanda.pdf" y "Mix Test Full Herbacea V2.pdf").
//  Cada etiqueta se diseña apaisada (ancho × alto); las que en la plancha van
//  paradas (goteros de 30ml) se rotan al armar el PDF.
// ─────────────────────────────────────────────────────────────

export const SANGRADO = 3; // mm de fondo extra alrededor del corte
export const HOJA = { w: 310, h: 450 }; // plancha de imprenta 31 × 45 cm

/*
  Zonas de cada formato (mm, origen arriba a la izquierda del corte):
    ilusIzq / ilusDer: caja de la ilustración
    centro: columna central (logo, Fitomedicina, línea 1, nombre, subtítulo, medida)
    izq / der: columnas de texto
  Tamaños de letra en puntos tipográficos (pt). Tipografía: Montserrat.
*/
export const FORMATOS = {
  ae10: {
    nombre: 'Aceite esencial 10ml',
    w: 83, h: 28,
    forma: 'tapa', // envase del sitio que usa esta etiqueta
    marco: { afuera: 1.5, adentro: 2.25, radio: 2.2 },
    ilusIzq: { x: 6.5, y: 4.6, w: 15, h: 18.6 },
    centro: {
      cx: 41.5, logoY: 4.6, logoW: 28,
      fito: { y: 13.5, pt: 6.4, peso: 400 },
      linea1: { y: 18.1, pt: 6.2, peso: 400, italica: true },
      nombre: { y: 20.7, pt: 5.9, peso: 200, mayus: true, suave: true },
      subtitulo: null,
      medida: { y: 23.6, pt: 6.2, peso: 700 },
    },
    der: { x: 58.4, y: 6.1, w: 21, pt: 4.1, peso: 300, alto: 1.22, pie: { y: 19.1, pt: 4.5, peso: 400, pie2pt: 4.1, negrita: false } },
    campos: ['linea1', 'nombre', 'medida', 'textoDer', 'pie1', 'pie2', 'ilusIzq'],
  },
  balsamo: {
    nombre: 'Bálsamo 40cc',
    w: 136, h: 25,
    forma: 'frasco',
    marco: { afuera: 1.5, adentro: 2.25, radio: 2.2 },
    ilusIzq: { x: 39.5, y: 4.2, w: 10, h: 15.8 },
    ilusDer: { x: 86.5, y: 4.2, w: 10, h: 15.8 },
    centro: {
      cx: 68, logoY: 5.6, logoW: 30.5,
      fito: { y: 13.6, pt: 6.4, peso: 400 },
      linea1: null,
      nombre: { y: 18.1, pt: 8.4, peso: 300 },
      subtitulo: null,
      medida: { y: 20.3, pt: 5, peso: 700 },
    },
    izq: { x: 4.9, y: 5.0, w: 25, pt: 4.9, peso: 400, alto: 1.16, pie: { y: 19.6, pt: 5, peso: 700, solo2: true } },
    der: { x: 102, y: 5.0, w: 28.5, pt: 4.9, peso: 400, alto: 1.16, pie: { y: 19.6, pt: 5, peso: 700, solo1: true } },
    campos: ['nombre', 'medida', 'textoIzq', 'textoDer', 'apto', 'pie1', 'pie2', 'ilusIzq', 'ilusDer'],
  },
  gotero30: {
    nombre: 'Gotero 30ml',
    w: 113, h: 41,
    forma: 'gotero',
    rotar: true, // en la plancha va parada
    marco: { afuera: 1.8, adentro: 2.7, radio: 2.8 },
    ilusIzq: { x: 12, y: 5, w: 21, h: 31 },
    centro: {
      cx: 56.5, logoY: 6.4, logoW: 36,
      fito: { y: 16.3, pt: 8, peso: 400 },
      linea1: null,
      nombre: { y: 24.2, pt: 11, peso: 400, italica: true },
      subtitulo: { y: 28.3, pt: 6.5, peso: 400, multilinea: 2, ancho: 40 },
      medida: { y: 33.5, pt: 7, peso: 700 },
    },
    der: { x: 85, y: 12.4, w: 23.5, pt: 5, peso: 500, alto: 1.22, pie: { y: 26.5, pt: 6, peso: 500, pie2pt: 5.6 } },
    campos: ['nombre', 'subtitulo', 'medida', 'textoDer', 'pie1', 'pie2', 'ilusIzq'],
  },
  gotero10: {
    nombre: 'Gotero 10ml',
    w: 86, h: 32,
    forma: 'gotero10',
    marco: { afuera: 1.6, adentro: 2.4, radio: 2.4 },
    ilusIzq: { x: 8, y: 5, w: 15.5, h: 18.8 },
    centro: {
      cx: 43, logoY: 4.6, logoW: 31,
      fito: { y: 13, pt: 6.4, peso: 400 },
      linea1: null,
      nombre: { y: 18.2, pt: 9, peso: 500, italica: true },
      subtitulo: { y: 20.6, pt: 5.2, peso: 400, multilinea: 2, ancho: 30 },
      medida: { y: 26.4, pt: 5.4, peso: 400 },
    },
    der: { x: 60.5, y: 9.2, w: 21.5, pt: 4.6, peso: 500, alto: 1.22, pie: { y: 19.6, pt: 5.4, peso: 500, pie2pt: 5 } },
    campos: ['nombre', 'subtitulo', 'medida', 'textoDer', 'pie1', 'pie2', 'ilusIzq'],
  },
};

// ── paleta reducida de la marca (de las etiquetas impresas) ──
export const PALETA = {
  fondos: [
    ['#E9EBE9', 'Gris claro'], ['#F7F4EE', 'Crema'], ['#FFFFFF', 'Blanco'],
    ['#1F321E', 'Verde Lúxor'], ['#C39A38', 'Ocre Isis'], ['#FF4944', 'Rojo Brigid'],
    ['#5CC1B8', 'Turquesa Wayra'], ['#CD88C3', 'Lila Lavanda'], ['#3AB64A', 'Verde Citronella'],
    ['#91B849', 'Verde Tea Tree'], ['#AA461D', 'Terracota'],
  ],
  tintas: [
    ['#1D1D1B', 'Negro'], ['#FFFFFF', 'Blanco'], ['#F4EFE4', 'Crema'], ['#1F321E', 'Verde oscuro'], ['#C9A23A', 'Dorado'],
  ],
  acentos: [
    ['#535A86', 'Violeta'], ['#1D1D1B', 'Negro'], ['#FFFFFF', 'Blanco'], ['#C9A23A', 'Dorado'], ['#1F321E', 'Verde oscuro'], ['#F4EFE4', 'Crema'],
  ],
};

// ── planchas: dónde va cada etiqueta en la hoja de 31 × 45 cm ──
function grilla(formato, xs, y0, paso, filas) {
  const out = [];
  for (let f = 0; f < filas; f++) xs.forEach((x, c) => out.push({ formato, x, y: +(y0 + f * paso).toFixed(2), col: c }));
  return out;
}

export const PLANCHAS = {
  ae10: {
    nombre: 'Aceites esenciales · 36 etiquetas',
    lugares: grilla('ae10', [16.35, 113.71, 210.72], 14.05, 36.14, 12),
  },
  balsamo: {
    nombre: 'Bálsamos · 24 etiquetas',
    lugares: grilla('balsamo', [13.9, 160.1], 10.7, 33.97, 12),
  },
  gotero30: {
    nombre: 'Goteros 30ml · 18 etiquetas',
    lugares: grilla('gotero30', [12.32, 61.14, 109.91, 158.73, 207.55, 256.37], 10.4, 122, 3),
  },
  gotero10: {
    nombre: 'Goteros 10ml · 33 etiquetas',
    lugares: grilla('gotero10', [12.66, 111.76, 210.85], 10.7, 39.1, 11),
  },
  mixta: {
    nombre: 'Mixta (como la Mix Test) · 26 etiquetas',
    lugares: [
      ...grilla('balsamo', [13.9, 160.1], 10.7, 33.97, 7),
      ...grilla('gotero30', [12.32, 61.14, 109.91, 158.73, 207.55, 256.37], 248.45, 0, 1),
      ...grilla('gotero10', [12.66, 111.76, 210.85], 369.14, 39.16, 2),
    ],
  },
};

/** Medidas del lugar en la hoja (las rotadas cambian ancho por alto). */
export function cajaLugar(l) {
  const f = FORMATOS[l.formato];
  return f.rotar ? { x: l.x, y: l.y, w: f.h, h: f.w } : { x: l.x, y: l.y, w: f.w, h: f.h };
}
