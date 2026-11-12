import { PRODUCTOS, CATEGORIAS, porId, linkWhatsapp, resolver } from './products.js';
import { montarCabeceraYPie, fichaHTML, precioTexto, reducirMovimiento, giroConArrastre } from './common.js';
import { Estudio } from './bottle3d.js';
import { Decor, giroDe } from './decor.js';

/*
  Poses del envase en cada capítulo.
  x / y: fracción de medio ancho / medio alto visible. giro: radianes.
  giro -1.66 muestra el panel derecho de la etiqueta (composición),
  giro +1.66 el izquierdo (modo de uso). destapar: 0 cerrado, 1 abierto.
*/
const POSES = [
  { x: 0.45, y: 0, giro: -0.25, escala: 0.92, destapar: 0 },
  { x: -0.45, y: 0, giro: 0.6, escala: 0.85, destapar: 0 },
  { x: 0.45, y: 0, giro: -1.66, escala: 0.98, destapar: 0 },
  { x: -0.42, y: -0.1, giro: 1.66, escala: 0.78, destapar: 1 },
  { x: 0.45, y: 0, giro: -6.28 - 0.2, escala: 0.85, destapar: 0 },
];
const POSES_MOVIL = POSES.map((q) => ({ ...q, x: 0, y: 0.4, escala: q.escala * 0.85 }));

const main = document.getElementById('producto');
const p = porId(new URLSearchParams(location.search).get('p'));

if (!p) {
  main.innerHTML = `
    <div class="no-encontrado">
      <h1 class="producto-titulo">No encontramos ese producto</h1>
      <p>Puede que el enlace esté incompleto. Mirá el catálogo completo.</p>
      <p><a class="boton" href="index.html#catalogo">Ver productos</a></p>
    </div>`;
  montarCabeceraYPie();
} else {
  render(p);
}


function bloquePrecio(v) {
  return v.precio == null
    ? `<strong>${v.medida}</strong><span>Precio a consultar</span>`
    : `<strong>${precioTexto(v)}</strong><span>${v.medida}</span>`;
}

function render(p) {
  document.title = `${p.nombre} · Herbácea`;
  const raiz = document.documentElement.style;
  raiz.setProperty('--suave', p.tema.suave);
  raiz.setProperty('--profundo', p.tema.profundo);
  raiz.setProperty('--sobre', p.tema.sobre);

  const v0 = resolver(p, 0);
  const consulta = linkWhatsapp(`Hola Herbácea! Quiero consultar por ${p.nombre} ${v0.medida}.`);
  const otros = [...PRODUCTOS.filter((o) => o.id !== p.id && o.categoria === p.categoria), ...PRODUCTOS.filter((o) => o.categoria !== p.categoria)].slice(0, 4);
  const selector = p.variantes ? `<div class="variantes" role="group" aria-label="Elegí la medida">${p.variantes.map((x, i) => `<button type="button" data-variante="${i}" aria-pressed="${i === 0}">${x.medida}</button>`).join('')}</div>` : '';

  main.innerHTML = `
    <div class="historia">
      <div class="escenario"><canvas aria-hidden="true"></canvas></div>
      <div class="capitulos">
        <section class="capitulo" data-lado="izq" data-tono="suave">
          <div class="capitulo-texto">
            <p class="producto-miga"><a href="index.html#catalogo">Productos</a> / <a href="index.html?categoria=${p.categoria}#catalogo">${CATEGORIAS[p.categoria]}</a></p>
            <h1 class="producto-titulo">${p.nombre}</h1>
            <p class="producto-bajada">${p.bajada}</p>
            ${selector}
            <div class="producto-precio">${bloquePrecio(v0)}</div>
            <div class="producto-acciones">
              <a class="boton" data-consulta href="${consulta}" target="_blank" rel="noopener">Consultar por WhatsApp</a>
            </div>
          </div>
        </section>
        <section class="capitulo" data-lado="der" data-tono="claro">
          <div class="capitulo-texto">
            <h2>Qué es</h2>
            ${p.descripcion.map((t) => `<p>${t}</p>`).join('')}
          </div>
        </section>
        <section class="capitulo" data-lado="izq" data-tono="suave">
          <div class="capitulo-texto">
            <h2>Composición</h2>
            <ul class="composicion">${p.composicion.map((c) => `<li>${c}</li>`).join('')}</ul>
          </div>
        </section>
        <section class="capitulo" data-lado="der" data-tono="oscuro">
          <div class="capitulo-texto">
            <h2>Modo de uso</h2>
            <ol class="pasos">${p.uso.map((u) => `<li>${u}</li>`).join('')}</ol>
          </div>
        </section>
        <section class="capitulo" data-lado="izq" data-tono="suave">
          <div class="capitulo-texto">
            <h2>Antes de usar</h2>
            <p>${p.precauciones}</p>
            <p class="capitulo-aviso">Este producto acompaña el bienestar y no reemplaza la consulta con profesionales de la salud.</p>
          </div>
        </section>
      </div>
    </div>
    <section class="cierre">
      <div class="cierre-interior">
        <div class="cierre-cta">
          <p>¿Querés ${p.nombre}? Escribinos y te contamos cómo recibirlo.</p>
          <a class="boton" href="${consulta}" target="_blank" rel="noopener">Consultar por WhatsApp</a>
        </div>
        <h2>También te puede gustar</h2>
        <ul class="grilla">${otros.map(fichaHTML).join('')}</ul>
      </div>
    </section>`;

  montarCabeceraYPie();
  const listo = iniciarHistoria(v0);
  main.querySelector('.variantes')?.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const v = resolver(p, Number(b.dataset.variante));
    main.querySelectorAll('.variantes button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    main.querySelector('.producto-precio').innerHTML = bloquePrecio(v);
    main.querySelector('[data-consulta]').href = linkWhatsapp(`Hola Herbácea! Quiero consultar por ${p.nombre} ${v.medida}.`);
    const estudio = await listo;
    if (!estudio) return;
    await estudio.mostrar(v);
    estudio.decor?.mostrar(p.escena, p.id);
    estudio.pose.escala *= 0.6;
    estudio.pose.giro -= Math.PI;
  });
}

async function iniciarHistoria(p) {
  const canvas = main.querySelector('.escenario canvas');
  const capitulos = [...main.querySelectorAll('.capitulo')];
  const movil = matchMedia('(max-width: 760px)');
  let estudio;
  try {
    estudio = new Estudio(canvas, { encuadre: 2.05 });
  } catch (err) {
    console.warn('WebGL no disponible', err);
    return null;
  }
  estudio.vaiven = reducirMovimiento ? 0 : 0.05;

  const ajustar = () => estudio.ajustar(canvas.clientWidth, canvas.clientHeight);
  new ResizeObserver(ajustar).observe(canvas);
  ajustar();

  const suave = (t) => t * t * (3 - 2 * t);
  const tramo = (a, b, t) => Math.min(1, Math.max(0, (t - a) / (b - a)));

  let tonoActual = null;
  function objetivo() {
    const poses = movil.matches ? POSES_MOVIL : POSES;
    const mitad = innerHeight / 2;
    // distancia de cada capítulo al centro de la pantalla
    const d = capitulos.map((c) => { const r = c.getBoundingClientRect(); return r.top + r.height / 2 - mitad; });
    let pose = poses[0];
    if (d[0] >= 0) pose = poses[0];
    else if (d[d.length - 1] <= 0) pose = poses[poses.length - 1];
    else {
      for (let i = 0; i < d.length - 1; i++) {
        if (d[i] <= 0 && d[i + 1] > 0) {
          // pausa en cada capítulo, transición en el medio
          const t = suave(tramo(0.22, 0.78, -d[i] / (d[i + 1] - d[i])));
          const a = poses[i], b = poses[i + 1];
          pose = {};
          for (const k in a) pose[k] = a[k] + (b[k] - a[k]) * t;
          break;
        }
      }
    }
    // tono de fondo según el capítulo más cercano
    let cerca = 0;
    d.forEach((v, i) => { if (Math.abs(v) < Math.abs(d[cerca])) cerca = i; });
    const tono = capitulos[cerca].dataset.tono;
    if (tono !== tonoActual) {
      tonoActual = tono;
      document.body.dataset.tono = tono;
      document.body.style.setProperty('--bg', tono === 'claro' ? 'var(--papel)' : tono === 'oscuro' ? 'var(--tinta)' : 'var(--suave)');
    }
    return pose;
  }

  // la vista inicial usa el giro guardado en la composición (editor)
  POSES[0].giro = POSES_MOVIL[0].giro = giroDe(p.id, POSES[0].giro);
  const decor = (estudio.decor = new Decor(estudio, canvas.parentElement));
  // girar arrastrando fuera del texto; al scrollear vuelve al ángulo de cada capítulo
  giroConArrastre(estudio, main.querySelector('.capitulos'), (e) => !e.target.closest('.capitulo-texto, a, button'));
  let ultimoScroll = scrollY;
  addEventListener('scroll', () => {
    if (Math.abs(scrollY - ultimoScroll) > 24) { estudio.volverAlAngulo(); ultimoScroll = scrollY; }
  }, { passive: true });
  decor.prepararEstudio(p.id);
  await estudio.mostrar(p);
  decor.mostrar(p.escena, p.id);
  estudio.fijar({ ...objetivo(), escala: 0.001, giro: -2.2 }, true);
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(main.querySelector('.historia'));
  const bucle = (t) => {
    if (visible) {
      estudio.fijar(objetivo(), reducirMovimiento);
      estudio.cuadro(t);
    }
    requestAnimationFrame(bucle);
  };
  requestAnimationFrame(bucle);
  return estudio;
}
