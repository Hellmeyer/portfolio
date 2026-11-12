// ─────────────────────────────────────────────────────────────
//  Registro de herramientas internas de Herbácea.
//  Para sumar una herramienta nueva, agregá un objeto a esta lista:
//  aparece sola en el hub y en la barra de arriba de todas las herramientas.
// ─────────────────────────────────────────────────────────────

export const HERRAMIENTAS = [
  {
    id: 'posts',
    nombre: 'Posts de Instagram',
    corto: 'Posts',
    url: './tools/posts.html',
    descripcion: 'Ideas de carruseles, historias y frases con caption y hashtags. Editás los textos y descargás las imágenes.',
    icono: '<path d="M4 4h16v16H4z"/><circle cx="9" cy="9" r="2"/><path d="m20 15-5-5L5 20"/>',
  },
  {
    id: 'composiciones',
    nombre: 'Composiciones',
    corto: 'Composiciones',
    url: './tools/editor.html',
    descripcion: 'Acomodá las plantas, flores y objetos alrededor de cada frasco 3D. Al guardar se actualiza la foto del catálogo.',
    icono: '<path d="M12 3c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-6 5-9z"/><path d="M12 21v-6"/>',
  },
  {
    id: 'fondos',
    nombre: 'Fotos de elementos',
    corto: 'Elementos',
    url: './tools/recortar.html',
    descripcion: 'Sumá o reemplazá las fotos de plantas, flores y objetos: quita el fondo y las deja listas para usar.',
    icono: '<path d="M4 20 10 9l4 6 2-3 4 8z"/><circle cx="16" cy="6" r="2"/>',
  },
  {
    id: 'etiquetas',
    nombre: 'Etiquetas para imprimir',
    corto: 'Etiquetas',
    url: './tools/etiquetas.html',
    descripcion: 'Diseñá las etiquetas con la paleta de la marca y exportá la plancha en PDF: impresión y matriz de corte. Las finales actualizan el sitio.',
    icono: '<rect x="3" y="7" width="18" height="10" rx="1.5"/><path d="M7 7v10M17 7v10"/>',
  },
  {
    id: 'catalogo',
    nombre: 'Fotos del catálogo',
    corto: 'Catálogo',
    url: './tools/generar.html',
    descripcion: 'Regenera de una vez todas las fotos de las fichas, por ejemplo después de cambiar una etiqueta.',
    icono: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="9" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  },
];

const svg = (path, tam = 18) => `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
export const icono = svg;

/** URL del sitio público (mismo equipo, puerto del sitio). */
export const urlSitio = () => new URL('../', location.href).href;

/** Guardar necesita node tools/recibir.js; publicadas en la web, las herramientas solo muestran y descargan. */
export const enLocal = () => /^(localhost|127\.0\.0\.1|\[::1\]|192\.168\.|10\.)/.test(location.hostname);

/**
 * Barra fija arriba de cada herramienta para moverse entre ellas.
 * Define --hub (su alto) para que las páginas de alto completo lo descuenten.
 */
export function montarBarra(actual) {
  const estilo = document.createElement('style');
  estilo.textContent = `
    :root { --hub: 48px; }
    .hub-barra { position: sticky; top: 0; z-index: 50; height: var(--hub); display: flex; align-items: center; gap: 0.25rem;
      padding: 0 0.75rem; background: #14211a; color: #eef0e8; font: 500 13px/1 "Hanken Grotesk", system-ui, sans-serif; }
    .hub-barra a { color: inherit; text-decoration: none; display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.5rem 0.7rem; border-radius: 999px; opacity: 0.75; white-space: nowrap; }
    .hub-barra a:hover { opacity: 1; background: #ffffff14; }
    .hub-barra a[aria-current="page"] { opacity: 1; background: #eef0e8; color: #14211a; }
    .hub-barra .hub-inicio { font: 400 15px "Marcellus", serif; opacity: 1; margin-right: 0.5rem; }
    .hub-barra .hub-empuje { flex: 1; }
    .hub-barra nav { display: flex; gap: 0.15rem; overflow-x: auto; scrollbar-width: none; }
    @media (max-width: 720px) { .hub-barra .hub-texto { display: none; } }
  `;
  document.head.append(estilo);
  const barra = document.createElement('header');
  barra.className = 'hub-barra';
  barra.innerHTML = `
    <a class="hub-inicio" href="./tools/" ${actual === 'inicio' ? 'aria-current="page"' : ''}>Herbácea · herramientas</a>
    <nav aria-label="Herramientas">
      ${HERRAMIENTAS.map((h) => `<a href="${h.url}" title="${h.nombre}" ${h.id === actual ? 'aria-current="page"' : ''}>${svg(h.icono, 16)}<span class="hub-texto">${h.corto}</span></a>`).join('')}
    </nav>
    <span class="hub-empuje"></span>
    <a href="${urlSitio()}" target="_blank" rel="noopener">${svg('<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M20 14v6H4V4h6"/>', 16)}<span class="hub-texto">Ver sitio</span></a>`;
  document.body.prepend(barra);
  if (!enLocal() && actual !== 'posts') {
    const aviso = document.createElement('p');
    aviso.className = 'hub-aviso';
    aviso.textContent = 'Versión web: podés probar y descargar, pero guardar cambios en el sitio solo funciona en tu compu con node tools/recibir.js.';
    aviso.style.cssText = 'position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:60;max-width:min(560px,calc(100% - 24px));margin:0;padding:0.5rem 0.9rem;border-radius:10px;background:#f3ead2;color:#5a4a1e;font:500 12px/1.4 "Hanken Grotesk",system-ui,sans-serif;text-align:center;box-shadow:0 2px 10px #0002;cursor:pointer';
    aviso.title = 'Cerrar';
    aviso.addEventListener('click', () => aviso.remove());
    document.body.append(aviso);
  }
}
