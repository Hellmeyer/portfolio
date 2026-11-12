// Genera la textura de la etiqueta a partir de los datos del producto.
// La etiqueta envuelve el envase: el centro de la textura queda al frente,
// los paneles laterales llevan composición (derecha) y modo de uso (izquierda).
import { tenido, fuentesListas } from './assets.js';

const ANCHO = 3072;

export async function dibujarEtiqueta(p, spec) {
  await fuentesListas();
  const { radio, alto, envoltura } = spec;
  const largo = 2 * Math.PI * radio * envoltura;
  const W = ANCHO;
  const H = Math.round(W * alto / largo);
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const e = p.etiqueta;
  const px = W / (envoltura * 360); // píxeles por grado
  const cx = W / 2;
  const frente = 118 * px;
  const ancho = p.forma === 'frasco';

  // papel
  ctx.fillStyle = e.fondo;
  ctx.fillRect(0, 0, W, H);
  grano(ctx, W, H, e.fondo);

  // filetes dobles arriba y abajo
  const u = ancho ? H / 100 : frente / 100; // unidad de diseño
  ctx.fillStyle = e.tinta;
  const filete = (y, g) => ctx.fillRect(0, y, W, g);
  filete(u * 3.2, u * 0.55);
  filete(u * 5.0, u * 0.3);
  filete(H - u * 5.3, u * 0.3);
  filete(H - u * 3.75, u * 0.55);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = e.tinta;
  const logo = await tenido('logo', e.tinta);

  if (ancho) {
    // Pote: etiqueta baja y ancha
    const lw = frente * 0.66, lh = lw * logo.height / logo.width;
    ctx.drawImage(logo, cx - lw / 2, H * 0.13, lw, lh);
    fuente(ctx, 400, H * 0.075);
    ctx.fillText('Fitomedicina', cx, H * 0.13 + lh + H * 0.1);
    fuente(ctx, 500, H * 0.12);
    ctx.fillText(e.linea2, cx, H * 0.69);
    fuente(ctx, 400, H * 0.07);
    ctx.fillText(p.medida, cx, H * 0.81);
  } else {
    const lw = frente * 0.86, lh = lw * logo.height / logo.width;
    const top = H * 0.13;
    ctx.drawImage(logo, cx - lw / 2, top, lw, lh);
    fuente(ctx, 400, frente * 0.068);
    ctx.fillText('Fitomedicina', cx, top + lh + frente * 0.11);
    if (e.linea1) {
      fuente(ctx, 400, frente * 0.078, true);
      ctx.fillText(e.linea1, cx, H * 0.55);
    }
    fuente(ctx, 500, frente * (e.linea2.length > 14 ? 0.075 : 0.085));
    ctx.fillText(e.linea2, cx, H * 0.55 + frente * 0.12);
    fuente(ctx, 500, frente * 0.075);
    ctx.fillText(p.medida + '.', cx, H * 0.8);
  }

  // ilustración junto al frente
  if (e.ilustracion) {
    const il = await tenido(e.ilustracion, e.tinta);
    const ih = H * (ancho ? 0.66 : 0.5);
    const iw = ih * il.width / il.height;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(il, cx - frente * 0.5 - iw - 6 * px, (H - ih) / 2, iw, ih);
    ctx.drawImage(il, cx + frente * 0.5 + 6 * px, (H - ih) / 2, iw, ih);
    ctx.globalAlpha = 1;
  }

  // paneles laterales
  const panel = 66 * px;
  const tam = ancho ? H * 0.068 : frente * 0.05;
  const lateral = (grados, titulo, lineas) => {
    const x = cx + grados * px;
    ctx.textAlign = 'left';
    const x0 = x - panel / 2;
    let y = ancho ? H * 0.22 : H * 0.2;
    fuente(ctx, 600, tam * 1.05);
    ctx.fillText(titulo, x0, y);
    y += tam * 1.7;
    fuente(ctx, 400, tam);
    for (const linea of lineas) {
      for (const l of partir(ctx, linea, panel)) {
        if (y > H - u * 9) return;
        ctx.fillText(l, x0, y);
        y += tam * 1.32;
      }
      y += tam * 0.35;
    }
  };
  lateral(98, 'Composición', [p.composicion.join(', ') + '.']);
  lateral(-98, 'Modo de uso', p.uso.map((s, i) => `${i + 1}. ${s}`));
  ctx.textAlign = 'center';

  return c;
}

function fuente(ctx, peso, tam, italica = false) {
  ctx.font = `${italica ? 'italic ' : ''}${peso} ${Math.round(tam)}px "Hanken Grotesk", sans-serif`;
}

function partir(ctx, texto, ancho) {
  const palabras = texto.split(' ');
  const lineas = [];
  let l = '';
  for (const w of palabras) {
    const prueba = l ? l + ' ' + w : w;
    if (ctx.measureText(prueba).width > ancho && l) { lineas.push(l); l = w; } else l = prueba;
  }
  if (l) lineas.push(l);
  return lineas;
}

function grano(ctx, W, H, color) {
  const oscuro = luminancia(color) > 0.5;
  ctx.save();
  ctx.fillStyle = oscuro ? 'rgba(60,40,20,0.05)' : 'rgba(255,255,255,0.05)';
  for (let i = 0; i < (W * H) / 260; i++) {
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  ctx.restore();
}

function luminancia(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}
