// Dibuja una etiqueta en un canvas a la resolución pedida (px por mm).
// Todo se posiciona en mm según el formato (tools/etiquetas-formatos.js).
import { tenido } from '../js/assets.js';
import { FORMATOS, SANGRADO } from '../tools/etiquetas-formatos.js';

const PT = 25.4 / 72; // mm por punto tipográfico
const FUENTE = '"Montserrat", sans-serif';

export async function fuentesEtiqueta() {
  const pesos = ['200', '300', '400', '500', '700', 'italic 400', 'italic 500'];
  await Promise.all(pesos.map((p) => document.fonts.load(`${p} 20px "Montserrat"`))).catch(() => {});
}

function fuente(ctx, k, pt, peso = 400, italica = false) {
  ctx.font = `${italica ? 'italic ' : ''}${peso} ${(pt * PT * k).toFixed(2)}px ${FUENTE}`;
}

function partir(ctx, texto, ancho) {
  const out = [];
  for (const parrafo of String(texto || '').split('\n')) {
    if (!parrafo.trim()) { out.push({ palabras: [], fin: true, vacia: true }); continue; }
    let linea = [];
    for (const w of parrafo.split(/\s+/)) {
      const prueba = [...linea, w].join(' ');
      if (ctx.measureText(prueba).width > ancho && linea.length) { out.push({ palabras: linea, fin: false }); linea = [w]; } else linea.push(w);
    }
    out.push({ palabras: linea, fin: true });
  }
  return out;
}

/** Párrafo justificado (como en las etiquetas impresas); la última línea de cada párrafo va a la izquierda. */
function parrafo(ctx, texto, x, y, ancho, alto, justificar = true) {
  const lineas = partir(ctx, texto, ancho);
  let yy = y;
  for (const l of lineas) {
    if (l.vacia) { yy += alto * 0.6; continue; }
    if (justificar && !l.fin && l.palabras.length > 1) {
      const anchos = l.palabras.map((w) => ctx.measureText(w).width);
      const hueco = (ancho - anchos.reduce((a, b) => a + b, 0)) / (l.palabras.length - 1);
      let xx = x;
      l.palabras.forEach((w, i) => { ctx.fillText(w, xx, yy); xx += anchos[i] + hueco; });
    } else ctx.fillText(l.palabras.join(' '), x, yy);
    yy += alto;
  }
  return yy;
}

/** Marco doble con esquinas recortadas hacia adentro. */
function marco(ctx, k, x0, y0, x1, y1, r, grosor) {
  ctx.lineWidth = grosor * k;
  ctx.beginPath();
  ctx.moveTo((x0 + r) * k, y0 * k);
  ctx.lineTo((x1 - r) * k, y0 * k); ctx.arc(x1 * k, y0 * k, r * k, Math.PI, Math.PI / 2, true);
  ctx.lineTo(x1 * k, (y1 - r) * k); ctx.arc(x1 * k, y1 * k, r * k, -Math.PI / 2, Math.PI, true);
  ctx.lineTo((x0 + r) * k, y1 * k); ctx.arc(x0 * k, y1 * k, r * k, 0, -Math.PI / 2, true);
  ctx.lineTo(x0 * k, (y0 + r) * k); ctx.arc(x0 * k, y0 * k, r * k, Math.PI / 2, 0, true);
  ctx.closePath();
  ctx.stroke();
}

async function ilustracion(ctx, k, nombre, caja, color) {
  if (!nombre || !caja) return;
  const c = await tenido(nombre, color);
  const e = Math.min(caja.w / c.width, caja.h / c.height);
  const w = c.width * e, h = c.height * e;
  ctx.drawImage(c, (caja.x + (caja.w - w) / 2) * k, (caja.y + (caja.h - h) / 2) * k, w * k, h * k);
}

function centrado(ctx, k, texto, cx, y, est) {
  if (!texto || !est) return;
  fuente(ctx, k, est.pt, est.peso, est.italica);
  ctx.textAlign = 'center';
  ctx.globalAlpha = est.suave ? 0.62 : 1;
  const t = est.mayus ? texto.toUpperCase() : texto;
  if (est.multilinea) {
    const lineas = partir(ctx, t, est.ancho * k);
    lineas.slice(0, est.multilinea).forEach((l, i) => ctx.fillText(l.palabras.join(' '), cx * k, (y + i * est.pt * PT * 1.25) * k));
  } else ctx.fillText(t, cx * k, y * k);
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

/**
 * d: diseño de etiqueta (ver tools/datos/etiquetas.js).
 * op: { pxmm = 12, sangrado = true, guias = false }
 * Devuelve un canvas con la etiqueta (y su sangrado si se pide).
 */
export async function dibujarEtiqueta(d, op = {}) {
  const f = FORMATOS[d.formato];
  const k = op.pxmm || 12;
  const s = op.sangrado === false ? 0 : SANGRADO;
  const c = document.createElement('canvas');
  c.width = Math.round((f.w + 2 * s) * k);
  c.height = Math.round((f.h + 2 * s) * k);
  const ctx = c.getContext('2d');
  await fuentesEtiqueta();

  ctx.fillStyle = d.fondo;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.save();
  ctx.translate(s * k, s * k);
  ctx.textBaseline = 'alphabetic';

  // marco doble
  ctx.strokeStyle = d.tinta;
  const m = f.marco;
  marco(ctx, k, m.afuera, m.afuera, f.w - m.afuera, f.h - m.afuera, m.radio, 0.32);
  marco(ctx, k, m.adentro, m.adentro, f.w - m.adentro, f.h - m.adentro, m.radio * 0.7, 0.16);

  // ilustraciones
  await ilustracion(ctx, k, d.ilusIzq, f.ilusIzq, d.acento);
  await ilustracion(ctx, k, d.ilusDer, f.ilusDer, d.acento);

  // columna central
  ctx.fillStyle = d.tinta;
  const ce = f.centro;
  const logo = await tenido('logo', d.tinta);
  const lh = ce.logoW * logo.height / logo.width;
  ctx.drawImage(logo, (ce.cx - ce.logoW / 2) * k, ce.logoY * k, ce.logoW * k, lh * k);
  centrado(ctx, k, 'Fitomedicina', ce.cx, ce.fito.y, ce.fito);
  centrado(ctx, k, d.linea1, ce.cx, ce.linea1?.y, ce.linea1);
  centrado(ctx, k, d.nombre, ce.cx, ce.nombre.y, ce.nombre);
  centrado(ctx, k, d.subtitulo, ce.cx, ce.subtitulo?.y, ce.subtitulo);
  centrado(ctx, k, d.medida, ce.cx, ce.medida.y, ce.medida);

  // columnas de texto
  // límite inferior para el texto: un poco antes del marco interior
  const limite = f.h - f.marco.adentro - 1.3;
  /** Calcula (o dibuja) una columna de texto con la escala `e` de letra. */
  const armar = (col, texto, extra, pies, e, dibujar) => {
    const pt = col.pt * e;
    fuente(ctx, k, pt, col.peso);
    const alto = pt * PT * col.alto;
    let y = col.y + pt * PT * 0.8;
    const bloque = (t, y0) => {
      if (dibujar) return parrafo(ctx, t, col.x * k, y0 * k, col.w * k, alto * k) / k;
      const lineas = partir(ctx, t, col.w * k);
      return y0 + lineas.reduce((a, l) => a + (l.vacia ? alto * 0.6 : alto), 0);
    };
    if (texto) y = bloque(texto, y);
    if (extra) y = bloque(extra, y + alto * 0.6);
    const p = col.pie;
    if (!p || !pies.length) return y - alto;
    const pt1 = p.pt * e, pt2 = (p.pie2pt || p.pt) * e;
    const altoPie = pt2 * PT * 1.25;
    const yp = Math.max(p.y, y + alto * 0.5);
    if (dibujar) {
      pies.forEach((t, i) => {
        fuente(ctx, k, i === 0 ? pt1 : pt2, p.peso);
        ctx.fillText(t, col.x * k, (yp + i * altoPie) * k);
      });
    }
    return yp + (pies.length - 1) * altoPie;
  };
  const columna = (col, texto, extra, pies) => {
    if (!col) return;
    // si no entra, achica la letra de a poco (hasta 65%)
    let e = 1;
    while (e > 0.65 && armar(col, texto, extra, pies, e, false) > limite) e -= 0.03;
    armar(col, texto, extra, pies, e, true);
  };
  const pie1 = d.pie1 || '', pie2 = d.pie2 || '';
  if (f.izq) columna(f.izq, d.textoIzq, '', f.izq.pie?.solo2 ? [pie2].filter(Boolean) : [pie1, pie2].filter(Boolean));
  if (f.der) {
    const pies = f.der.pie?.solo1 ? [pie1].filter(Boolean) : [pie1, pie2].filter(Boolean);
    columna(f.der, d.textoDer, d.apto, pies);
  }
  ctx.restore();

  // guías de pantalla: corte y sangrado
  if (op.guias && s) {
    ctx.save();
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = '#e0245e';
    ctx.lineWidth = 1;
    ctx.strokeRect(s * k + 0.5, s * k + 0.5, f.w * k, f.h * k);
    ctx.restore();
  }
  return c;
}
