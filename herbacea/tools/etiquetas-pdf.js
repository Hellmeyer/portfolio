// Arma el PDF de imprenta: página 1 = impresión (con sangrado y marcas de corte),
// página 2 = matriz de corte (solo los contornos, en vector). Hoja de 31 × 45 cm.
import { FORMATOS, HOJA, SANGRADO, cajaLugar } from '../tools/etiquetas-formatos.js';
import { dibujarEtiqueta } from '../tools/etiquetas-render.js';

const DPI = 600;
const PXMM = DPI / 25.4;
const LINEA = 0.25 * 25.4 / 72; // 0,25 pt en mm, como el archivo original

function rotar90(c) {
  const r = document.createElement('canvas');
  r.width = c.height; r.height = c.width;
  const x = r.getContext('2d');
  x.translate(0, r.height);
  x.rotate(-Math.PI / 2); // lectura de abajo hacia arriba, como las etiquetas originales
  x.drawImage(c, 0, 0);
  return r;
}

const seCruzan = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** Marcas de corte cortas en cada esquina, sin pisar el sangrado de las etiquetas vecinas. */
function marcasDeCorte(pdf, cajas) {
  const conSangrado = cajas.map((c) => ({ x: c.x - SANGRADO, y: c.y - SANGRADO, w: c.w + 2 * SANGRADO, h: c.h + 2 * SANGRADO }));
  pdf.setLineWidth(LINEA);
  pdf.setDrawColor(0, 0, 0);
  const desde = SANGRADO + 0.4, largo = 2.4;
  cajas.forEach((c, i) => {
    const segs = [];
    for (const y of [c.y, c.y + c.h]) {
      segs.push([c.x - desde - largo, y, c.x - desde, y], [c.x + c.w + desde, y, c.x + c.w + desde + largo, y]);
    }
    for (const x of [c.x, c.x + c.w]) {
      segs.push([x, c.y - desde - largo, x, c.y - desde], [x, c.y + c.h + desde, x, c.y + c.h + desde + largo]);
    }
    for (const [x1, y1, x2, y2] of segs) {
      const caja = { x: Math.min(x1, x2) - 0.05, y: Math.min(y1, y2) - 0.05, w: Math.abs(x2 - x1) + 0.1, h: Math.abs(y2 - y1) + 0.1 };
      if (x1 < 0 || y1 < 0 || x2 > HOJA.w || y2 > HOJA.h) continue;
      if (conSangrado.some((o, j) => j !== i && seCruzan(caja, o))) continue;
      pdf.line(x1, y1, x2, y2);
    }
  });
}

/**
 * plancha: { nombre, lugares: [{ formato, x, y, col }] }
 * asignar(lugar) → diseño o null
 * Devuelve { blob, nombreArchivo }.
 */
export async function exportarPlancha(plancha, asignar, { titulo = 'plancha', progreso = () => {} } = {}) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'mm', format: [HOJA.w, HOJA.h], orientation: 'portrait', compress: true });
  pdf.setProperties({ title: `Herbácea · ${titulo}`, creator: 'Herbácea · editor de etiquetas' });

  // ── página 1: impresión ──
  const usados = plancha.lugares.map((l) => ({ l, d: asignar(l) })).filter((x) => x.d);
  const imagenes = new Map(); // un solo raster por diseño (se reutiliza en cada lugar)
  let n = 0;
  for (const { l, d } of usados) {
    const clave = d.id + (FORMATOS[l.formato].rotar ? '@r' : '');
    if (!imagenes.has(clave)) {
      progreso(`Dibujando ${d.titulo}…`);
      let c = await dibujarEtiqueta(d, { pxmm: PXMM, sangrado: true });
      if (FORMATOS[l.formato].rotar) c = rotar90(c);
      imagenes.set(clave, { data: c.toDataURL('image/png'), alias: 'et' + (n++) });
    }
    const img = imagenes.get(clave);
    const b = cajaLugar(l);
    pdf.addImage(img.data, 'PNG', b.x - SANGRADO, b.y - SANGRADO, b.w + 2 * SANGRADO, b.h + 2 * SANGRADO, img.alias, 'FAST');
  }
  const cajas = usados.map(({ l }) => cajaLugar(l));
  marcasDeCorte(pdf, cajas);
  pdf.setFontSize(6);
  pdf.setTextColor(120);
  const fecha = new Date().toLocaleDateString('es-AR');
  pdf.text(`Herbácea Fitomedicina · ${titulo} · ${usados.length} etiquetas · impresión · ${fecha}`, 10, HOJA.h - 3);

  // ── página 2: matriz de corte ──
  pdf.addPage([HOJA.w, HOJA.h], 'portrait');
  pdf.setLineWidth(LINEA);
  pdf.setDrawColor(44, 46, 53);
  for (const b of cajas) pdf.rect(b.x, b.y, b.w, b.h, 'S');
  pdf.text(`Herbácea Fitomedicina · ${titulo} · matriz de corte · ${fecha}`, 10, HOJA.h - 3);

  progreso('Armando el PDF…');
  const slug = titulo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const hoy = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return { blob: pdf.output('blob'), nombreArchivo: `herbacea-${slug}-${hoy}.pdf` };
}
