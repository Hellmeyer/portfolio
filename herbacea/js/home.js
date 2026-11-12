import { PRODUCTOS, PROMOS, CATEGORIAS, CONTACTO, porId, resolver, linkWhatsapp, pesos } from './products.js';
import { montarCabeceraYPie, fichaHTML, reducirMovimiento } from './common.js';
import { Estudio } from './bottle3d.js';
import { Decor, giroDe } from './decor.js';
import { PREGUNTAS } from './preguntas.js';

montarCabeceraYPie();
document.querySelectorAll('[data-instagram]').forEach((a) => { a.href = CONTACTO.instagram; });

// ── Preguntas frecuentes ─────────────────────────────────────
document.querySelector('[data-wa-consulta]').href = linkWhatsapp('Hola Herbácea! Tengo una consulta.');
document.querySelector('.preguntas-lista').innerHTML = PREGUNTAS.map((g) => `
  <div class="preguntas-grupo">
    <h3>${g.grupo}</h3>
    ${g.items.map((it) => `
      <details>
        <summary>${it.p}</summary>
        <p>${it.r}</p>
      </details>`).join('')}
  </div>`).join('');

// ── Catálogo ─────────────────────────────────────────────────
const grilla = document.querySelector('.grilla');
const filtros = document.querySelector('.filtros');
grilla.innerHTML = PRODUCTOS.map(fichaHTML).join('');

const usadas = Object.keys(CATEGORIAS).filter((c) => PRODUCTOS.some((p) => p.categoria === c));
filtros.innerHTML = [['todos', 'Todos'], ...usadas.map((c) => [c, CATEGORIAS[c]])]
  .map(([k, v]) => `<button type="button" data-filtro="${k}" aria-pressed="false">${v}</button>`).join('');

function filtrar(cat) {
  if (cat !== 'todos' && !usadas.includes(cat)) cat = 'todos';
  filtros.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === cat)));
  grilla.querySelectorAll('li').forEach((li) => { li.hidden = cat !== 'todos' && li.dataset.categoria !== cat; });
}
filtros.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  filtrar(b.dataset.filtro);
  const url = new URL(location.href);
  if (b.dataset.filtro === 'todos') url.searchParams.delete('categoria'); else url.searchParams.set('categoria', b.dataset.filtro);
  history.replaceState(null, '', url);
});
filtrar(new URLSearchParams(location.search).get('categoria') || 'todos');

// ── Banner de promos (combos) ────────────────────────────────
const promo = document.querySelector('.promo');
const campos = Object.fromEntries([...promo.querySelectorAll('[data-promo]')].map((el) => [el.dataset.promo, el]));
const puntos = promo.querySelector('.promo-puntos');
puntos.innerHTML = PROMOS.map((p, i) => `<li><button type="button" data-n="${i}" aria-label="Promo ${i + 1}: ${p.titulo}"></button></li>`).join('');
promo.querySelector('.promo-controles').hidden = PROMOS.length < 2;

const canvas = promo.querySelector('canvas');
let estudio = null;
let decor = null;
try {
  estudio = new Estudio(canvas, { encuadre: 1.75 });
  estudio.vaiven = reducirMovimiento ? 0 : 0.14;
  decor = new Decor(estudio, promo.querySelector('.promo-escena'));
  // en el celular la cámara se acerca: los frascos llenan la foto
  const movil = matchMedia('(max-width: 760px)');
  const encuadrar = () => {
    estudio.encuadre = movil.matches ? 1.3 : 1.75;
    estudio.margenAncho = movil.matches ? 1.05 : 1.25;
    if (estudio._tam) estudio.ajustar(...estudio._tam);
  };
  estudio.encuadre = movil.matches ? 1.3 : 1.75;
  estudio.margenAncho = movil.matches ? 1.05 : 1.25;
  movil.addEventListener('change', encuadrar);
} catch (err) {
  console.warn('WebGL no disponible', err);
}

// swipe a los costados para cambiar de promo (celular y trackpad táctil)
{
  let inicio = null;
  promo.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || e.target.closest('a, button')) return;
    inicio = { x: e.clientX, y: e.clientY, t: performance.now() };
  });
  promo.addEventListener('pointerup', (e) => {
    if (!inicio) return;
    const dx = e.clientX - inicio.x, dy = e.clientY - inicio.y;
    const rapido = performance.now() - inicio.t < 700;
    inicio = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3 && rapido) {
      const dir = dx < 0 ? 1 : -1; // hacia la izquierda = siguiente
      ir(actual + dir, dir);
      reiniciarAuto();
    }
  });
  promo.addEventListener('pointercancel', () => { inicio = null; });
}

let actual = -1;

const escena = promo.querySelector('.promo-escena');
const DESPLAZAMIENTO = 0.55; // cuánto se corre hacia el costado (fracción del medio ancho)

/** dir: 1 = siguiente (sale a la izquierda, entra desde la derecha); -1 = anterior. */
async function ir(n, dir = 1) {
  n = (n + PROMOS.length) % PROMOS.length;
  if (n === actual) return;
  const primera = actual === -1;
  actual = n;
  const pr = PROMOS[n];
  const productos = pr.productos.map(([id, v]) => resolver(porId(id), v));
  puntos.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-current', String(i === n)));

  if (!primera) {
    promo.classList.add('cambiando');
    // sale hacia un costado mientras se desvanece
    escena.classList.add('oculta');
    estudio?.fijar({ x: -DESPLAZAMIENTO * dir });
    await espera(reducirMovimiento ? 0 : 750);
  }
  if (actual !== n) return;
  promo.style.setProperty('--deep', pr.tema.profundo);
  promo.style.setProperty('--sobre', pr.tema.sobre);
  campos.cuando.textContent = pr.cuando;
  campos.titulo.textContent = pr.titulo;
  campos.texto.textContent = pr.texto;
  campos.ideal.textContent = pr.ideal;
  campos.antes.textContent = pesos(pr.antes);
  campos.precio.textContent = pesos(pr.precio);
  campos.ahorro.textContent = `Ahorrás ${pesos(pr.antes - pr.precio)}`;
  campos.pedir.href = linkWhatsapp(`Hola Herbácea! Quiero el ${pr.titulo} (${pesos(pr.precio)}).`);
  campos.incluye.innerHTML = 'Incluye ' + productos
    .map((p) => `<a href="producto.html?p=${p.id}">${p.nombre} ${p.medida}</a>`).join(' y ');
  promo.classList.remove('cambiando');
  if (estudio) {
    decor.prepararEstudio(`promo-${n}`);
    await estudio.mostrar(productos);
    if (actual !== n) return;
    decor.mostrar(pr.escena, `promo-${n}`);
    // entra desde el costado opuesto con un fundido, sin escalar
    estudio.fijar({ x: (primera ? 0.25 : DESPLAZAMIENTO) * dir, giro: giroDe(`promo-${n}`, -0.15), escala: 1, y: 0.02 }, true);
    estudio.fijar({ x: 0 });
    setTimeout(() => escena.classList.remove('oculta'), 40);
  }
}

promo.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.ir) ir(actual + Number(b.dataset.ir), Number(b.dataset.ir));
  if (b.dataset.n) ir(Number(b.dataset.n), Number(b.dataset.n) < actual ? -1 : 1);
  reiniciarAuto();
});

let auto;
let pausado = false;
function reiniciarAuto() {
  clearInterval(auto);
  if (reducirMovimiento || PROMOS.length < 2) return;
  auto = setInterval(() => { if (!pausado && !document.hidden) ir(actual + 1); }, 13000);
}
promo.addEventListener('pointerenter', () => { pausado = true; });
promo.addEventListener('pointerleave', () => { pausado = false; });
promo.addEventListener('focusin', () => { pausado = true; });
promo.addEventListener('focusout', () => { pausado = false; });

if (estudio) {
  const ajustar = () => estudio.ajustar(canvas.clientWidth, canvas.clientHeight);
  new ResizeObserver(ajustar).observe(canvas);
  ajustar();
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(promo);
  const bucle = (t) => { if (visible) estudio.cuadro(t); requestAnimationFrame(bucle); };
  requestAnimationFrame(bucle);
}

escena.classList.add('oculta');
await ir(0);
reiniciarAuto();


function espera(ms) { return new Promise((r) => setTimeout(r, ms)); }
