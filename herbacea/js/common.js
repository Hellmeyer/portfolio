import { CONTACTO, CATEGORIAS, linkWhatsapp, resolver, pesos } from './products.js';
import { pintarGraficos } from './assets.js';

/**
 * Permite girar los frascos arrastrando en horizontal sobre `zona`.
 * `permitir(evento)` decide si el toque empieza un giro (p. ej. no sobre texto o botones).
 * El scroll vertical sigue funcionando en pantallas táctiles.
 */
export function giroConArrastre(estudio, zona, permitir = () => true) {
  let ultimo = null;
  zona.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || !permitir(e)) return;
    ultimo = e.clientX;
    estudio.tomarGiro();
    zona.classList.add('girando');
  });
  addEventListener('pointermove', (e) => {
    if (ultimo === null) return;
    estudio.empujarGiro(e.clientX - ultimo);
    ultimo = e.clientX;
  });
  const soltar = () => {
    if (ultimo === null) return;
    ultimo = null;
    estudio.soltarGiro();
    zona.classList.remove('girando');
  };
  addEventListener('pointerup', soltar);
  addEventListener('pointercancel', soltar);
}

export const reducirMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function montarCabeceraYPie() {
  const cab = document.querySelector('[data-cabecera]');
  if (cab) {
    cab.innerHTML = `
      <a class="marca" href="index.html"><img data-grafico="logo" data-color="#14211a" alt="Herbácea" height="30"></a>
      <nav class="navegacion" aria-label="Principal">
        <a href="index.html#catalogo">Productos</a>
        <a href="index.html#nosotros" class="solo-escritorio">Nosotros</a>
        <a href="index.html#preguntas" aria-label="Preguntas frecuentes"><span class="solo-escritorio">Preguntas frecuentes</span><span class="solo-movil">FAQ</span></a>
      </nav>`;
  }
  const pie = document.querySelector('[data-pie]');
  if (pie) {
    pie.innerHTML = `
      <div class="pie-interior">
        <div>
          <img data-grafico="logo" data-color="#eef0e8" alt="Herbácea">
          <p class="pie-lema">Productos naturales y conscientes para el bienestar, el autocuidado y los saberes ancestrales.</p>
        </div>
        <div>
          <h2>Productos</h2>
          <ul>${Object.entries(CATEGORIAS).map(([k, v]) => `<li><a href="index.html?categoria=${k}#catalogo">${v}</a></li>`).join('')}</ul>
        </div>
        <div>
          <h2>Contacto</h2>
          <ul>
            <li><a href="${linkWhatsapp('Hola Herbácea! Quería hacer una consulta.')}" target="_blank" rel="noopener">WhatsApp 11 6551-6447</a></li>
            <li><a href="https://wa.me/${CONTACTO.whatsapp2}" target="_blank" rel="noopener">WhatsApp 11 2451-9703</a></li>
            <li><a href="${CONTACTO.instagram}" target="_blank" rel="noopener">${CONTACTO.usuario}</a></li>
            <li><a href="index.html#preguntas">Preguntas frecuentes</a></li>
            <li>${CONTACTO.lugar}</li>
          </ul>
        </div>
      </div>
      <p class="pie-aviso">Los productos de Herbácea acompañan el bienestar y no reemplazan la consulta con profesionales de la salud.</p>`;
  }
  return pintarGraficos();
}

export function precioTexto(p) {
  return p.precio == null ? 'Consultar precio' : pesos(p.precio);
}

export const medidas = (p) => (p.variantes ? p.variantes.map((v) => v.medida).join(' / ') : p.medida);

function precioDesde(p) {
  const precios = (p.variantes || [p]).map((v) => v.precio).filter((n) => n != null);
  return precios.length ? `<span class="ficha-precio">${p.variantes && p.variantes.length > 1 ? 'desde ' : ''}${pesos(Math.min(...precios))}</span>` : '';
}

export function fichaHTML(p) {
  return `
    <li data-categoria="${p.categoria}">
      <a class="ficha" href="producto.html?p=${p.id}" style="--suave:${p.tema.suave};--etiqueta:${p.tema.profundo}">
        <div class="ficha-imagen">
          <img alt="" src="assets/productos/${p.id}.webp" width="720" height="900" loading="lazy" decoding="async" onload="this.classList.add('lista')">
          <span class="ficha-muestra" aria-hidden="true"></span>
        </div>
        <div class="ficha-datos"><h3>${p.nombre}</h3><span>${medidas(p)}</span></div>
        <p class="ficha-tipo">${CATEGORIAS[p.categoria]}${precioDesde(p)}</p>
      </a>
    </li>`;
}

