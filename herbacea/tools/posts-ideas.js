// ─────────────────────────────────────────────────────────────
//  Banco de ideas de posts para Instagram de Herbácea.
//  Cada idea es un carrusel (o una sola slide) + caption + hashtags.
//  Layouts disponibles: portada, lista, frase, planta, texto, precio, cierre.
//  Textos en el tono de la marca: cercano, sereno, sin promesas médicas.
// ─────────────────────────────────────────────────────────────
import { PRODUCTOS, PROMOS, porId, pesos } from '../js/products.js';

export const TIPOS = {
  producto: 'Producto',
  promo: 'Promo',
  ritual: 'Ritual',
  planta: 'Planta',
  educativo: 'Educativo',
  frase: 'Frase',
};

const BASE = ['herbaceafitomedicina', 'fitomedicina', 'autocuidado', 'bienestarnatural', 'cosmeticanatural', 'hechoenargentina'];
const H = {
  balsamo: ['balsamoherbal', 'oleatos', 'plantasmedicinales', 'cuidadonatural'],
  esencial: ['aceitesesenciales', 'aromaterapia', 'aromaterapiaholistica'],
  vegetal: ['aceitesvegetales', 'cuidadodelapiel', 'skincarenatural'],
  cbd: ['cannabismedicinal', 'cbd', 'fitocannabinoides'],
  saberes: ['saberesancestrales', 'medicinadelatierra', 'herbolaria'],
};

// propiedades breves (para la slide "Propiedades") y frase de apertura del caption
const FICHAS = {
  luxor: { gancho: 'Para el cuerpo que se mueve, se esfuerza y necesita recuperarse.', props: ['alivio muscular', 'desinflamante', 'efecto frío-calor', 'acompaña la recuperación'] },
  isis: { gancho: 'Suavidad para todas las edades.', props: ['calmante', 'reparador', 'protector', 'nutritivo'] },
  brigid: { gancho: 'Un bálsamo para el cuerpo y el pulso emocional.', props: ['circulatorio', 'equilibrante', 'activador suave', 'alivia tensiones leves'] },
  wayra: { gancho: 'Aire, frescura y claridad cuando todo pesa.', props: ['despeja', 'refresca', 'acompaña la respiración', 'alivia la saturación'] },
  citronella: { gancho: 'Para los días al aire libre.', props: ['protege del entorno', 'aleja insectos', 'refresca', 'calma picaduras leves'] },
  'balsamo-lavanda': { gancho: 'Un refugio de calma para el cuerpo y la mente.', props: ['calmante', 'reconfortante', 'invita al descanso', 'suavizante de la piel'] },
  teatree: { gancho: 'Purifica, regenera y protege.', props: ['purificante', 'regenerador', 'equilibrante', 'para el cuidado cotidiano'] },
  'aceite-luxor': { gancho: 'Resina de cannabis en aceite de oliva orgánico.', props: ['acompaña el descanso', 'ayuda a bajar el estrés', 'formulación artesanal', 'gotero dosificador'] },
  almendras: { gancho: 'Un básico esencial del cuidado natural.', props: ['nutre', 'suaviza', 'mejora la elasticidad', 'aceite vehicular'] },
  jojoba: { gancho: 'Ligero, versátil y para todo tipo de piel.', props: ['equilibra el sebo', 'hidrata sin obstruir', 'fortalece el cabello', 'aceite vehicular'] },
  lavanda: { gancho: 'Calma, descanso y equilibrio profundo.', props: ['calmante', 'reconfortante', 'regulador emocional', 'favorece el descanso'] },
  geranio: { gancho: 'Equilibrio y armonía en movimiento.', props: ['equilibrante', 'armonizador', 'regula la piel', 'acompaña los ciclos'] },
  romero: { gancho: 'Energía, enfoque y acción.', props: ['estimulante', 'circulatorio', 'aporta claridad', 'revitalizante'] },
  menta: { gancho: 'Frescura, claridad y activación.', props: ['refrescante', 'despeja la mente', 'favorece la concentración', 'activador'] },
  eucalipto: { gancho: 'Respirar, soltar y renovar.', props: ['apertura respiratoria', 'descongestivo', 'renovador', 'refrescante'] },
};

const ILUS = {
  luxor: 'arnica', isis: 'calendula', brigid: 'lavanda-rama', 'balsamo-lavanda': 'lavanda', 'aceite-luxor': 'cannabis-rama',
  almendras: 'almendro', jojoba: 'jojoba', lavanda: 'lavanda', geranio: 'manzanilla', romero: 'lavanda-rama',
};

const mayus = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const tagsDe = (p) => [...BASE, ...(H[p.categoria] || []), p.id.replace(/-/g, '')];

// ── un carrusel por producto, armado con sus datos reales ──
const deProductos = PRODUCTOS.map((p) => {
  const f = FICHAS[p.id] || { gancho: p.bajada, props: [] };
  const esCbd = p.categoria === 'cbd';
  return {
    id: `producto-${p.id}`,
    tipo: 'producto',
    titulo: p.nombre,
    productos: [p.id],
    slides: [
      { layout: 'portada', fondo: 'suave', kicker: p.categoria === 'balsamo' ? 'Bálsamo herbal' : p.categoria === 'esencial' ? 'Aceite esencial puro' : p.categoria === 'vegetal' ? 'Aceite vegetal' : 'Aceite de CBD', titulo: mayus(p.nombre.replace(/^(Bálsamo|Aceite esencial de|Aceite de|Aceite) /, '')), subtitulo: p.bajada },
      { layout: 'lista', fondo: 'suave', titulo: 'Propiedades', items: f.props, ilustracion: ILUS[p.id] },
      { layout: 'lista', fondo: 'profundo', titulo: 'Cómo usarlo', items: p.uso.map((u) => u.replace(/\.$/, '')), numerada: true },
      { layout: 'cierre', fondo: 'suave', texto: esCbd ? 'Consultá siempre con un profesional de la salud.' : 'Escribinos y te contamos cómo recibirlo.' },
    ],
    caption: `${f.gancho}\n\n${p.descripcion[0]}\n\n${esCbd ? 'Te recomendamos acompañar su uso con un profesional de la salud.\n\n' : ''}📩 Escribinos por WhatsApp o mensaje directo para pedirlo.`,
    hashtags: tagsDe(p),
  };
});

// ── promos (combos) ──
const dePromos = PROMOS.map((pr, i) => ({
  id: `promo-${i}`,
  tipo: 'promo',
  titulo: pr.titulo,
  productos: pr.productos.map(([id]) => id),
  promo: i,
  slides: [
    { layout: 'portada', fondo: 'profundo', kicker: 'Promo del mes', titulo: pr.titulo.replace('Combo ', ''), subtitulo: pr.texto },
    { layout: 'precio', fondo: 'suave', titulo: 'Ideal para', texto: pr.ideal, antes: pesos(pr.antes), precio: pesos(pr.precio), ahorro: `Ahorrás ${pesos(pr.antes - pr.precio)}` },
    { layout: 'cierre', fondo: 'profundo', texto: 'Pedilo por WhatsApp o mensaje directo.' },
  ],
  caption: `PROMO DEL MES: ${pr.titulo.toUpperCase()}\n\n${pr.texto}\n\nIdeal para: ${pr.ideal}\n\nAntes ${pesos(pr.antes)} → ahora ${pesos(pr.precio)}.\n\n📩 Escribinos para pedirlo.`,
  hashtags: [...BASE, 'promo', 'combo', ...H.balsamo],
}));

// ── rituales ──
const RITUALES = [
  {
    id: 'ritual-descanso', titulo: 'Ritual de descanso', productos: ['balsamo-lavanda'],
    slides: [
      { layout: 'portada', fondo: 'suave', kicker: 'Un pequeño ritual', titulo: 'Para dormir mejor', subtitulo: 'Cinco minutos para bajar el ritmo antes de acostarte.' },
      { layout: 'lista', fondo: 'suave', titulo: 'Un pequeño ritual', items: ['Apagá las pantallas', 'Entibiá un poco de bálsamo entre las manos', 'Masajeá nuca, sienes y muñecas', 'Respirá hondo tres veces', 'Dejá que las plantas hagan su trabajo'], numerada: true, ilustracion: 'lavanda' },
      { layout: 'cierre', fondo: 'profundo', texto: 'Bálsamo Lavanda, un refugio de calma.' },
    ],
    caption: 'La lavanda no apura nada.\n\nTe proponemos un ritual simple para cerrar el día: pantallas apagadas, un poco de Bálsamo Lavanda y tres respiraciones profundas.\n\n¿Lo probás esta noche? 🌙',
    hashtags: [...BASE, 'ritualdenoche', 'descanso', 'lavanda', ...H.balsamo],
  },
  {
    id: 'ritual-piernas', titulo: 'Ritual para piernas cansadas', productos: ['brigid'],
    slides: [
      { layout: 'portada', fondo: 'suave', kicker: 'Un pequeño ritual', titulo: 'Piernas livianas', subtitulo: 'Un masaje circulatorio para el final del día.' },
      { layout: 'lista', fondo: 'suave', titulo: 'Paso a paso', items: ['Elevá las piernas unos minutos', 'Aplicá Brigid desde los tobillos', 'Masajeá siempre hacia arriba', 'Terminá con respiraciones lentas'], numerada: true, ilustracion: 'lavanda-rama' },
      { layout: 'cierre', fondo: 'profundo', texto: 'Brigid armoniza, nutre y despierta.' },
    ],
    caption: 'Después de un día largo, las piernas también piden pausa.\n\nUn masaje con Brigid —aceite de almendras, geranio y romero— de los tobillos hacia arriba, y unos minutos con las piernas en alto.\n\nGuardá este post para hacerlo esta noche 🌿',
    hashtags: [...BASE, 'piernascansadas', 'masaje', 'brigid', ...H.balsamo],
  },
  {
    id: 'ritual-respirar', titulo: 'Ritual para respirar', productos: ['wayra'],
    slides: [
      { layout: 'portada', fondo: 'suave', kicker: 'Un pequeño ritual', titulo: 'Volver a respirar', subtitulo: 'Para los momentos de saturación.' },
      { layout: 'lista', fondo: 'suave', titulo: 'Cómo hacerlo', items: ['Aplicá Wayra en pecho y cuello', 'Cerrá los ojos', 'Inhalá en 4, sostené en 4', 'Exhalá en 6', 'Repetí cinco veces'], numerada: true },
      { layout: 'cierre', fondo: 'profundo', texto: 'Wayra: aire, frescura y claridad.' },
    ],
    caption: 'Menta y eucalipto para abrir espacio.\n\nCuando todo se acumula, a veces alcanza con frenar un minuto y respirar bien. Wayra te acompaña.\n\n¿Cuándo fue la última vez que respiraste profundo? 🍃',
    hashtags: [...BASE, 'respiracion', 'pausaactiva', 'wayra', ...H.balsamo],
  },
];

// ── plantas ──
const PLANTAS = [
  { id: 'planta-lavanda', nombre: 'Lavanda', latin: 'Lavandula angustifolia', ilus: 'lavanda', texto: 'Calma el sistema nervioso, favorece el descanso y alivia tensiones. Invita a soltar el control y habitar la calma.', productos: ['lavanda', 'balsamo-lavanda'] },
  { id: 'planta-calendula', nombre: 'Caléndula', latin: 'Calendula officinalis', ilus: 'calendula', texto: 'Una flor solar, protectora y reparadora. En oleato acompaña la piel sensible, irritada o reseca.', productos: ['isis'] },
  { id: 'planta-arnica', nombre: 'Árnica', latin: 'Arnica montana', ilus: 'arnica', texto: 'Usada tradicionalmente para acompañar golpes, contracturas y dolores musculares. Es parte del corazón de Lúxor.', productos: ['luxor'] },
  { id: 'planta-manzanilla', nombre: 'Manzanilla', latin: 'Matricaria chamomilla', ilus: 'manzanilla', texto: 'Suave y envolvente, calma la piel y acompaña los procesos de regeneración. Una aliada de todas las edades.', productos: ['isis'] },
  { id: 'planta-almendro', nombre: 'Almendro', latin: 'Prunus dulcis', ilus: 'almendro', texto: 'De su fruto nace un aceite nutritivo y noble, base de muchos de nuestros bálsamos.', productos: ['almendras'] },
  { id: 'planta-jojoba', nombre: 'Jojoba', latin: 'Simmondsia chinensis', ilus: 'jojoba', texto: 'Su aceite se parece al sebo natural de la piel: hidrata sin obstruir y equilibra.', productos: ['jojoba'] },
].map((pl) => ({
  id: pl.id, tipo: 'planta', titulo: pl.nombre, productos: pl.productos,
  slides: [
    { layout: 'planta', fondo: 'papel', nombre: pl.nombre, latin: pl.latin, texto: pl.texto, ilustracion: pl.ilus },
    { layout: 'cierre', fondo: 'suave', texto: `La encontrás en ${pl.productos.map((id) => porId(id).nombre).join(' y ')}.` },
  ],
  caption: `${pl.nombre.toUpperCase()} · ${pl.latin}\n\n${pl.texto}\n\nCada planta trae su saber. Nosotros lo cuidamos en cada preparación 🌿`,
  hashtags: [...BASE, ...H.saberes, pl.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')],
}));

// ── educativos ──
const EDUCATIVOS = [
  {
    id: 'edu-oleato', titulo: '¿Qué es un oleato?', ilus: 'calendula',
    slides: [
      { layout: 'portada', fondo: 'papel', kicker: 'Saberes', titulo: '¿Sabés qué es un oleato?', subtitulo: '' , ilustracion: 'calendula' },
      { layout: 'texto', fondo: 'papel', titulo: 'Plantas en aceite', texto: 'Un oleato se hace macerando flores u hojas secas en aceite vegetal durante semanas. El aceite va tomando las propiedades de la planta.', ilustracion: 'manzanilla' },
      { layout: 'texto', fondo: 'suave', titulo: 'En nuestros bálsamos', texto: 'Isis lleva oleatos de caléndula, manzanilla y lavanda. Lúxor, de cannabis, lavanda y árnica. Por eso cada bálsamo tiene su propia identidad.' },
      { layout: 'cierre', fondo: 'suave', texto: 'Conocé todos nuestros bálsamos.' },
    ],
    caption: '¿Sabés qué es un oleato? 🌼\n\nEs una de las preparaciones más antiguas de la fitomedicina: plantas secas maceradas en aceite durante semanas, hasta que el aceite toma sus propiedades.\n\nCon oleatos elaboramos el corazón de nuestros bálsamos.',
    hashtags: [...BASE, 'oleato', ...H.saberes, ...H.balsamo],
  },
  {
    id: 'edu-diluir', titulo: 'Cómo diluir un aceite esencial', ilus: 'lavanda',
    slides: [
      { layout: 'portada', fondo: 'papel', kicker: 'Guía rápida', titulo: 'Cómo diluir un aceite esencial', subtitulo: 'Nunca puro sobre la piel.', ilustracion: 'lavanda' },
      { layout: 'lista', fondo: 'suave', titulo: 'La regla simple', items: ['Elegí un aceite vehicular: almendras o jojoba', '2 o 3 gotas de esencial cada 10 ml', 'Mezclá bien antes de aplicar', 'Probá en el antebrazo y esperá 24 h'], numerada: true },
      { layout: 'texto', fondo: 'suave', titulo: 'Con cuidado', texto: 'En chicos usá diluciones más suaves y evitá menta y eucalipto en menores de 6 años. En embarazo y lactancia, consultá antes con un profesional.' },
      { layout: 'cierre', fondo: 'profundo', texto: 'La esencia pura de la planta, usada con respeto.' },
    ],
    caption: 'Los aceites esenciales son extractos muy concentrados: siempre van diluidos 💧\n\nGuardá esta guía: 2 o 3 gotas cada 10 ml de aceite de almendras o jojoba, y una prueba en el antebrazo antes del primer uso.',
    hashtags: [...BASE, ...H.esencial, 'guiadeuso', 'aceitevehicular'],
  },
  {
    id: 'edu-fitomedicina', titulo: '¿Qué es la fitomedicina?', ilus: 'manzanilla',
    slides: [
      { layout: 'portada', fondo: 'profundo', kicker: 'Saberes', titulo: '¿Qué es la fitomedicina?', subtitulo: 'El cuidado que nace de las plantas.' },
      { layout: 'texto', fondo: 'papel', titulo: 'Un saber antiguo', texto: 'Es el uso de plantas y sus preparados para acompañar el bienestar del cuerpo y la mente. Un conocimiento que atraviesa generaciones.', ilustracion: 'manzanilla' },
      { layout: 'texto', fondo: 'suave', titulo: 'Desde una mirada holística', texto: 'En Herbácea elaboramos cada aceite y cada bálsamo con atención y respeto, cuidando la planta, el cuerpo y la vida cotidiana.' },
      { layout: 'cierre', fondo: 'suave', texto: 'Cuidar, compartir, recordar.' },
    ],
    caption: '¿Qué es la fitomedicina? 🌿\n\nEs el saber de usar las plantas para acompañar el bienestar. Un conocimiento que viene de lejos y que queremos recuperar y honrar en cada preparación.\n\nLos productos naturales acompañan, no reemplazan la consulta con profesionales de la salud.',
    hashtags: [...BASE, ...H.saberes, 'plantasmedicinales'],
  },
  {
    id: 'edu-vehiculares', titulo: 'Almendras vs. jojoba', ilus: 'almendro', productos: ['almendras', 'jojoba'],
    slides: [
      { layout: 'portada', fondo: 'suave', kicker: 'Aceites vegetales', titulo: 'Almendras o jojoba', subtitulo: '¿Cuál es para vos?' },
      { layout: 'lista', fondo: 'suave', titulo: 'Almendras', items: ['más nutritivo', 'ideal para piel seca', 'suaviza y da elasticidad', 'aroma casi neutro'], ilustracion: 'almendro' },
      { layout: 'lista', fondo: 'suave', titulo: 'Jojoba', items: ['más liviano', 'apto pieles grasas', 'no obstruye los poros', 'fortalece el cabello'], ilustracion: 'jojoba' },
      { layout: 'cierre', fondo: 'profundo', texto: 'Los dos sirven para diluir tus esenciales.' },
    ],
    caption: 'Almendras o jojoba: ¿cuál elegir? 🤎\n\nEl de almendras nutre en profundidad y es ideal para pieles secas. El de jojoba es más liviano y equilibra las pieles grasas.\n\nLos dos son excelentes aceites vehiculares para tus aceites esenciales.',
    hashtags: [...BASE, ...H.vegetal, 'aceitedealmendras', 'aceitedejojoba'],
  },
  {
    id: 'edu-conservar', titulo: 'Cómo conservar tus aceites', ilus: 'lavanda-rama',
    slides: [
      { layout: 'portada', fondo: 'papel', kicker: 'Cuidados', titulo: 'Cómo conservar tus aceites', subtitulo: 'Para que mantengan sus propiedades.', ilustracion: 'lavanda-rama' },
      { layout: 'lista', fondo: 'suave', titulo: 'Tené en cuenta', items: ['Lugar fresco y seco', 'Lejos del sol directo', 'Frasco siempre bien cerrado', 'Fuera del alcance de niñes'] },
      { layout: 'cierre', fondo: 'suave', texto: 'El vidrio ámbar protege los aceites de la luz.' },
    ],
    caption: '¿Por qué nuestros frascos son de vidrio ámbar? 🟤\n\nPorque la luz degrada los aceites. Guardalos en un lugar fresco, seco y bien cerrados para que conserven todas sus propiedades.',
    hashtags: [...BASE, ...H.esencial, 'tips'],
  },
].map((e) => ({ tipo: 'educativo', productos: e.productos || [], ...e }));

// ── frases ──
const FRASES = [
  { id: 'frase-esencia', texto: 'Cuidar, compartir, recordar: la esencia de Herbácea.', ilus: 'manzanilla', fondo: 'papel' },
  { id: 'frase-casual', texto: 'Nada en la naturaleza es casual.', ilus: 'lavanda-rama', fondo: 'suave' },
  { id: 'frase-tierra', texto: 'De la tierra al cuerpo: el movimiento de la naturaleza también ocurre en vos.', ilus: 'arnica', fondo: 'papel' },
  { id: 'frase-lavanda', texto: 'La lavanda no apura nada.', ilus: 'lavanda', fondo: 'suave' },
  { id: 'frase-comunidad', texto: '¿Estás preparadx para sumarte a la comunidad Herbácea?', ilus: 'calendula', fondo: 'profundo' },
  { id: 'frase-pausa', texto: 'Respirá hondo. El cuerpo sabe volver al centro.', ilus: 'lavanda', fondo: 'papel' },
].map((f) => ({
  id: f.id, tipo: 'frase', titulo: f.texto.slice(0, 38) + (f.texto.length > 38 ? '…' : ''), productos: [],
  slides: [{ layout: 'frase', fondo: f.fondo, texto: f.texto, ilustracion: f.ilus }],
  caption: `${f.texto}\n\n🌿 Herbácea Fitomedicina`,
  hashtags: [...BASE, ...H.saberes, 'frases'],
}));

export const IDEAS = [...dePromos, ...deProductos, ...RITUALES.map((r) => ({ tipo: 'ritual', ...r })), ...PLANTAS, ...EDUCATIVOS, ...FRASES];
