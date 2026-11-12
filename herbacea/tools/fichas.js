// Foto de catálogo: frasco 3D + elementos de la composición (la misma que ve el sitio).
import { Estudio } from '../js/bottle3d.js';
import { resolver } from '../js/products.js';
import { ubicaciones, dibujarCapa, archivo } from '../js/decor.js';

const W = 720, H = 900;

/** Composiciones leídas del disco en este momento (no las que había al abrir la página). */
export async function composicionesActuales() {
  return (await import('../js/composiciones.js?t=' + Date.now())).COMPOSICIONES;
}

export function crearFotografo() {
  const canvas = document.createElement('canvas');
  const e = new Estudio(canvas, { captura: true, encuadre: 2 });
  e.renderer.setPixelRatio(1);
  e.ajustar(W, H);
  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  const ctx = out.getContext('2d');

  /**
   * Devuelve un Blob webp.
   * `comp` = { elementos, separacion, desenfoque } para usar una composición puntual
   * (la que se acaba de guardar en el editor). Sin `comp`, lee la guardada en disco ahora,
   * o arma la automática si el producto no tiene.
   */
  async function foto(p, comp) {
    if (comp === undefined) comp = (await composicionesActuales())[p.id] || null;
    // imágenes siempre frescas, por si se reemplazó algún archivo de fondo
    const cache = {};
    const t = Date.now();
    const cargar = (n) => (cache[n] ??= new Promise((ok) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => ok(null);
      i.src = archivo(n) + '?' + t;
    }));
    e.separacion = comp?.separacion ?? 0.9;
    await e.mostrar(resolver(p));
    e.fijar({ giro: comp?.giro ?? -0.3, y: 0.02 }, true);
    e.cuadro();
    const lista = comp?.elementos
      ? comp.elementos.map((x) => ({ y: 0, rot: 0, escala: 1, espejo: false, ...x }))
      : ubicaciones(p.escena || [], e.anchoEnvases);
    const blur = comp?.desenfoque !== false;
    ctx.clearRect(0, 0, W, H);
    await dibujarCapa(ctx, e, lista, 'atras', cargar, blur);
    ctx.drawImage(canvas, 0, 0);
    await dibujarCapa(ctx, e, lista, 'adelante', cargar, blur);
    return new Promise((ok) => out.toBlob(ok, 'image/webp', 0.85));
  }

  return { foto, vista: out, destruir: () => e.destruir() };
}
