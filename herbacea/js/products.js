// ─────────────────────────────────────────────────────────────
//  Catálogo Herbácea — editá este archivo para cargar productos.
//  Textos tomados del catálogo 2026 y de las etiquetas.
//  Precio null = "Precio a consultar".
// ─────────────────────────────────────────────────────────────

export const CONTACTO = {
  whatsapp: '5491165516447',          // 11 6551-6447
  whatsapp2: '5491124519703',         // 11 2451-9703
  instagram: 'https://www.instagram.com/herbaceafitomedicina/',
  usuario: '@herbaceafitomedicina',
  lugar: 'Buenos Aires, Argentina',
};

export const CATEGORIAS = {
  balsamo: 'Bálsamos',
  cbd: 'Aceite Lúxor (CBD)',
  vegetal: 'Aceites vegetales',
  esencial: 'Aceites esenciales',
};

/*
  Envases (forma):
    'frasco'  pote de vidrio 40cc con tapa metálica negra
    'gotero'  ámbar 30ml con gotero      'gotero10' ámbar 10ml con gotero
    'tapa'    ámbar 10ml con tapa a rosca
  Etiqueta:
    imagen: ruta a la etiqueta real desplegada (assets/etiquetas). El centro de la imagen va al frente.
    Sin imagen se dibuja una con fondo/tinta/linea1/linea2.
  bulbo: color de la goma del gotero.
  escena: elementos naturales alrededor del envase (imágenes en assets/fondos). Disponibles:
    fondo:  palmera, monstera, lavanda, pasto
    frente: coco, miel, almendras, semillas, piedras, flores:geranio|manzanilla|calendula|almendro,
            ramita:romero|eucalipto|menta|teatree
  tema: suave = fondo claro de la página, profundo = color fuerte, sobre = texto sobre el color fuerte.
*/

const ESENCIAL = (nombre) => ({
  fondo: '#F7F4EE', tinta: '#1D1D1B', linea1: 'Aceite esencial', linea2: `PURO DE ${nombre.toUpperCase()}`,
});

const USO_ESENCIAL = [
  'Diluí siempre en un aceite vehicular, como almendras o jojoba, antes de aplicar sobre la piel.',
  'Probá primero 1 o 2 gotas de la mezcla en una zona pequeña para descartar sensibilidad.',
  'Usalo en masajes, preparados cosméticos o en tus prácticas cotidianas de cuidado.',
];
const PRECAUCION_ESENCIAL = 'No aplicar puro sobre la piel. Evitar el contacto con ojos y mucosas. Conservar en un lugar fresco, seco y fuera del alcance de niñes.';
const PRECAUCION_BALSAMO = 'Uso externo. Conservar en un lugar fresco y seco para mantener sus propiedades.';

export const PRODUCTOS = [
  // ── Bálsamos ────────────────────────────────────────────────
  {
    id: 'luxor',
    nombre: 'Bálsamo Lúxor',
    categoria: 'balsamo',
    medida: '40cc', forma: 'frasco',
    bajada: 'Alivio profundo y acción concreta.',
    descripcion: [
      'Bálsamo de acción profunda formulado con aceite de oliva orgánico, oleato de árnica, flores de cannabis y lavanda, potenciado con menta y alcanfor. Un aliado para acompañar dolores musculares y articulares, zonas contracturadas y la recuperación física.',
      'De textura rica y rendidora, comienza fresco y se transforma en un alivio profundo. Lúxor relaja, desinflama y acompaña.',
    ],
    composicion: ['Oleato de cannabis, lavanda y árnica', 'Aceite de oliva orgánico', 'Cera vegetal', 'Aceites esenciales de eucalipto, menta y alcanfor'],
    uso: [
      'Aplicalo con masajes sobre la zona con dolor o contractura.',
      'Para resfríos y congestiones, aplicá en pecho y espalda.',
      'Masajeá con movimientos circulares hasta absorber.',
    ],
    precauciones: PRECAUCION_BALSAMO,
    etiqueta: { imagen: 'assets/etiquetas/luxor.webp' },
    escena: ['monstera', 'ramita:eucalipto', 'piedras'],
    tema: { suave: '#E6E9DC', profundo: '#1F321E', sobre: '#D9B24C' },
    precio: 18000,
  },
  {
    id: 'isis',
    nombre: 'Bálsamo Isis',
    categoria: 'balsamo',
    medida: '40cc', forma: 'frasco',
    bajada: 'Cuidado profundo y suavidad para todas las edades.',
    descripcion: [
      'Bálsamo suave, protector y reparador con aceite de almendras y oleatos de manzanilla, caléndula y lavanda. Ayuda a calmar irritaciones, enrojecimientos y sensibilidad, y acompaña procesos de regeneración y cicatrización.',
      'De textura delicada y envolvente, con un aroma suave que calma sin invadir. Isis protege y repara.',
    ],
    composicion: ['Oleato de caléndula, manzanilla y lavanda', 'Aceite de almendras', 'Cera vegetal'],
    uso: [
      'Aplicá una pequeña cantidad sobre la piel limpia.',
      'Ideal para paspaduras, irritaciones, picaduras de insectos y pieles muy resecas.',
      'Repetí las veces que haga falta.',
    ],
    precauciones: 'No aplicar sobre lastimaduras. ' + PRECAUCION_BALSAMO,
    etiqueta: { imagen: 'assets/etiquetas/isis.webp' },
    escena: ['flores:calendula', 'miel'],
    tema: { suave: '#F2EAD4', profundo: '#9C7A22', sobre: '#FBF3DD' },
    precio: null,
  },
  {
    id: 'brigid',
    nombre: 'Bálsamo Brigid',
    categoria: 'balsamo',
    medida: '40cc', forma: 'frasco',
    bajada: 'Equilibrio y activación en un mismo gesto.',
    descripcion: [
      'Bálsamo con aceite de almendras, geranio y romero, pensado para acompañar procesos de equilibrio y activación. Estimula la circulación y alivia tensiones leves, aportando claridad y energía al cuerpo.',
      'Su aroma herbal y floral equilibra entre calma y activación. Brigid armoniza, nutre y despierta.',
    ],
    composicion: ['Aceite de almendras', 'Cera vegetal', 'Aceite esencial de geranio', 'Aceite esencial de romero'],
    uso: [
      'Usalo para masajes circulatorios.',
      'Alivia piernas cansadas, zona lumbar y dolores menstruales bajos.',
      'Masajeá con calma: también es un equilibrante emocional.',
    ],
    precauciones: PRECAUCION_BALSAMO + ' Apto vegano.',
    etiqueta: { imagen: 'assets/etiquetas/brigid.webp' },
    escena: ['monstera', 'flores:geranio', 'ramita:romero'],
    tema: { suave: '#F6E3E0', profundo: '#C73A33', sobre: '#FFF0EA' },
    precio: null,
  },
  {
    id: 'wayra',
    nombre: 'Bálsamo Wayra',
    categoria: 'balsamo',
    medida: '40cc', forma: 'frasco',
    bajada: 'Aire, frescura y claridad.',
    descripcion: [
      'Wayra acompaña la respiración y la apertura. Su combinación de menta y eucalipto despeja las vías respiratorias, alivia dolores de cabeza leves, hidrata la piel y aporta una sensación de frescura inmediata.',
      'Ideal para momentos de saturación: invita a soltar y volver a respirar.',
    ],
    composicion: ['Aceite de almendras', 'Cera vegetal', 'Aceite esencial de eucalipto', 'Aceite esencial de menta'],
    uso: [
      'Tomá una pequeña cantidad con la yema de los dedos.',
      'Masajeá en pecho, cuello y sienes.',
      'Respirá profundo y dejá que el aroma acompañe la apertura.',
    ],
    precauciones: PRECAUCION_BALSAMO + ' Apto vegano.',
    etiqueta: { imagen: 'assets/etiquetas/wayra.webp' },
    escena: ['palmera', 'ramita:eucalipto', 'ramita:menta'],
    tema: { suave: '#DFF0EC', profundo: '#2F8F86', sobre: '#F0FBF8' },
    precio: null,
  },
  {
    id: 'citronella',
    nombre: 'Bálsamo Citronella',
    categoria: 'balsamo',
    medida: '40cc', forma: 'frasco',
    bajada: 'Protección natural y frescura en movimiento.',
    descripcion: [
      'Bálsamo refrescante y protector con aceite de almendras y aceite esencial de citronella. Ideal para los momentos al aire libre: ayuda a repeler insectos de forma natural, calmar picaduras leves y aportar frescura inmediata.',
      'De textura liviana y nutritiva, con un aroma cítrico y limpio.',
    ],
    composicion: ['Aceite de almendras', 'Cera vegetal', 'Aceite esencial de citronella'],
    uso: [
      'Aplicá sobre la piel expuesta antes de salir.',
      'Renová la aplicación cada algunas horas al aire libre.',
      'Sobre picaduras, aplicá una pequeña cantidad para calmar.',
    ],
    precauciones: PRECAUCION_BALSAMO + ' Apto vegano.',
    etiqueta: { imagen: 'assets/etiquetas/citronella.webp' },
    escena: ['piedras', 'ramita:menta'],
    tema: { suave: '#E1F1E1', profundo: '#258A35', sobre: '#F1FBF0' },
    precio: null,
  },
  {
    id: 'balsamo-lavanda',
    nombre: 'Bálsamo Lavanda',
    categoria: 'balsamo',
    medida: '40cc', forma: 'frasco',
    bajada: 'Un refugio de calma para el cuerpo y la mente.',
    descripcion: [
      'Bálsamo de calma y reparación con aceite de almendras y aceite esencial de lavanda. Ayuda a reducir el estrés y la ansiedad, favorece el descanso y alivia tensiones musculares leves, acompañando también pieles sensibles o irritadas.',
      'Lavanda invita a bajar el ritmo, soltar y entregarse al descanso.',
    ],
    composicion: ['Aceite de almendras', 'Cera vegetal', 'Aceite esencial de lavanda'],
    uso: [
      'Tomá una pequeña cantidad y entibiala entre las manos.',
      'Masajeá sobre la piel, nuca o muñecas.',
      'Ideal antes de dormir o en momentos de descanso.',
    ],
    precauciones: PRECAUCION_BALSAMO + ' Apto vegano.',
    etiqueta: { imagen: 'assets/etiquetas/lavanda.webp' },
    escena: ['lavanda', 'piedras', 'miel'],
    tema: { suave: '#F1E6F0', profundo: '#8E4E8C', sobre: '#FBF1FA' },
    precio: 10000,
  },
  {
    id: 'teatree',
    nombre: 'Bálsamo Tea Tree',
    categoria: 'balsamo',
    medida: '40cc', forma: 'frasco',
    bajada: 'Purifica, regenera y protege.',
    descripcion: [
      'Bálsamo purificante y regenerador, ideal para el cuidado cotidiano de la piel. Calma irritaciones leves, favorece la cicatrización y mantiene la piel limpia y equilibrada.',
      'Su aroma herbal intenso genera una sensación de frescura y orden.',
    ],
    composicion: ['Aceite de almendras', 'Cera vegetal', 'Aceite esencial de tea tree'],
    uso: [
      'Aplicá sobre la piel limpia en la zona a tratar.',
      'Ideal en procesos de acné o desequilibrios fúngicos.',
      'Repetí una o dos veces por día.',
    ],
    precauciones: PRECAUCION_BALSAMO + ' Apto vegano.',
    etiqueta: { imagen: 'assets/etiquetas/teatree.webp' },
    escena: ['palmera', 'ramita:teatree', 'piedras'],
    tema: { suave: '#E9F1DA', profundo: '#5E8A2A', sobre: '#F6FBEC' },
    precio: null,
  },

  // ── Aceite Lúxor (CBD) ─────────────────────────────────────
  {
    id: 'aceite-luxor',
    nombre: 'Aceite Lúxor',
    categoria: 'cbd',
    bajada: 'Resina pura de cannabis en aceite de oliva orgánico.',
    descripcion: [
      'Aceite de CBD formulado con resina de cannabis en aceite de oliva orgánico, para acompañar el bienestar de forma integral y natural.',
      'Ideal para quienes buscan aliviar dolencias, reducir el estrés y armonizar cuerpo y mente de manera consciente.',
    ],
    composicion: ['Resina de CBD', 'Aceite de oliva orgánico'],
    uso: [
      'Consultá la dosis con un profesional de la salud.',
      'Colocá las gotas indicadas con el gotero.',
      'Conservá el frasco cerrado y al resguardo de la luz.',
    ],
    precauciones: 'Mantener fuera del alcance de niñes. Consultar con un profesional de la salud antes de usar.',
    variantes: [
      { medida: '10ml', forma: 'gotero10', etiqueta: { imagen: 'assets/etiquetas/luxor-10.webp' }, precio: 20000 },
      { medida: '30ml', forma: 'gotero', etiqueta: { imagen: 'assets/etiquetas/luxor-30.webp' }, precio: null },
    ],
    bulbo: '#151515',
    escena: ['monstera', 'semillas', 'piedras'],
    tema: { suave: '#E6E9DC', profundo: '#1F321E', sobre: '#D9B24C' },
  },

  // ── Aceites vegetales ──────────────────────────────────────
  {
    id: 'almendras',
    nombre: 'Aceite de almendras',
    categoria: 'vegetal',
    medida: '30ml', forma: 'gotero',
    bajada: 'Puro y natural.',
    descripcion: [
      'Aceite vegetal profundamente nutritivo, ideal para hidratar y suavizar la piel. Mejora la elasticidad, ayuda a prevenir la sequedad y es especialmente recomendado para pieles sensibles o resecas.',
      'También es un gran aliado del cabello, aportando brillo y suavidad, y un excelente aceite vehicular para diluir aceites esenciales.',
    ],
    composicion: ['100% aceite de almendras'],
    uso: [
      'Colocá unas gotas en la palma de la mano.',
      'Aplicá directamente sobre la piel con masajes suaves.',
      'Usalo como base para diluir tus aceites esenciales.',
    ],
    precauciones: 'Uso externo. No usar en caso de alergia a los frutos secos. Conservar al resguardo de la luz.',
    etiqueta: { imagen: 'assets/etiquetas/almendras.webp' },
    bulbo: '#5E6366',
    escena: ['almendras', 'flores:almendro'],
    tema: { suave: '#F2E6DD', profundo: '#A0441E', sobre: '#FBEFE6' },
    precio: null,
  },
  {
    id: 'jojoba',
    nombre: 'Aceite de jojoba',
    categoria: 'vegetal',
    medida: '30ml', forma: 'gotero',
    bajada: 'Puro y natural.',
    descripcion: [
      'Aceite vegetal ligero, de rápida absorción, con una composición similar al sebo natural de la piel. Regula la producción de grasa, hidrata sin obstruir los poros y es apto para todo tipo de piel, incluso las más sensibles o con tendencia acneica.',
      'Ideal también para fortalecer el cabello y equilibrar el cuero cabelludo.',
    ],
    composicion: ['100% aceite de jojoba'],
    uso: [
      'Colocá unas gotas en la palma de la mano.',
      'Aplicá sobre rostro, cuerpo o cuero cabelludo.',
      'Usalo como base para diluir tus aceites esenciales.',
    ],
    precauciones: 'Uso externo. Conservar al resguardo de la luz.',
    etiqueta: { imagen: 'assets/etiquetas/jojoba.webp' },
    bulbo: '#5E6366',
    escena: ['palmera', 'coco', 'semillas'],
    tema: { suave: '#F2E6DD', profundo: '#A0441E', sobre: '#FBEFE6' },
    precio: null,
  },

  // ── Aceites esenciales ─────────────────────────────────────
  {
    id: 'lavanda',
    nombre: 'Aceite esencial de Lavanda',
    categoria: 'esencial',
    medida: '10ml', forma: 'tapa',
    bajada: 'Calma, descanso y equilibrio profundo.',
    descripcion: [
      'Calma el sistema nervioso, favorece el descanso y alivia tensiones, acompañando también pieles sensibles o irritadas. A nivel emocional reduce la ansiedad y el estrés, aportando tranquilidad y contención.',
      'Invita a soltar el control, descansar y habitar un estado de calma.',
    ],
    composicion: ['100% aceite esencial puro de lavanda'],
    uso: USO_ESENCIAL, precauciones: PRECAUCION_ESENCIAL,
    etiqueta: { ...ESENCIAL('Lavanda'), ilustracion: 'lavanda', tinta: '#5F5487' },
    escena: ['lavanda', 'piedras'],
    tema: { suave: '#ECEAF2', profundo: '#5A4F80', sobre: '#F3F1F8' },
    precio: null,
  },
  {
    id: 'geranio',
    nombre: 'Aceite esencial de Geranio',
    categoria: 'esencial',
    medida: '10ml', forma: 'tapa',
    bajada: 'Equilibrio y armonía en movimiento.',
    descripcion: [
      'Equilibra la piel, ayudando a regular la producción de sebo, mejorar su aspecto y acompañar procesos de irritación o sensibilidad. A nivel emocional estabiliza y suaviza los cambios de ánimo.',
      'Conecta con la ciclicidad y los ritmos internos, invitando a transitar los procesos con mayor armonía.',
    ],
    composicion: ['100% aceite esencial puro de geranio'],
    uso: USO_ESENCIAL, precauciones: PRECAUCION_ESENCIAL,
    etiqueta: ESENCIAL('Geranio'),
    escena: ['monstera', 'flores:geranio'],
    tema: { suave: '#F6E7EB', profundo: '#4C6A43', sobre: '#F8EEF1' },
    precio: null,
  },
  {
    id: 'romero',
    nombre: 'Aceite esencial de Romero',
    categoria: 'esencial',
    medida: '10ml', forma: 'tapa',
    bajada: 'Energía, enfoque y acción.',
    descripcion: [
      'Activa la circulación, revitaliza el cuerpo y ayuda a aliviar la fatiga física. Estimula la mente, aportando energía, motivación y claridad.',
      'En lo profundo, impulsa, ordena y fortalece, acompañando el movimiento y la toma de decisiones.',
    ],
    composicion: ['100% aceite esencial puro de romero'],
    uso: USO_ESENCIAL, precauciones: PRECAUCION_ESENCIAL,
    etiqueta: ESENCIAL('Romero'),
    escena: ['ramita:romero', 'piedras'],
    tema: { suave: '#E5ECE2', profundo: '#3E5A3E', sobre: '#EFF5EC' },
    precio: null,
  },
  {
    id: 'menta',
    nombre: 'Aceite esencial de Menta',
    categoria: 'esencial',
    medida: '10ml', forma: 'tapa',
    bajada: 'Frescura, claridad y activación.',
    descripcion: [
      'Refresca y estimula el cuerpo, mejora la circulación y ayuda a aliviar dolores de cabeza leves. Activa la mente, despeja la saturación y favorece la concentración.',
      'A nivel energético aporta claridad y enfoque, acompañando procesos de orden y acción.',
    ],
    composicion: ['100% aceite esencial puro de menta'],
    uso: USO_ESENCIAL, precauciones: PRECAUCION_ESENCIAL,
    etiqueta: ESENCIAL('Menta'),
    escena: ['monstera', 'ramita:menta'],
    tema: { suave: '#DFF0E8', profundo: '#2E7A5C', sobre: '#EEFAF4' },
    precio: null,
  },
  {
    id: 'eucalipto',
    nombre: 'Aceite esencial de Eucalipto',
    categoria: 'esencial',
    medida: '10ml', forma: 'tapa',
    bajada: 'Respirar, soltar y renovar.',
    descripcion: [
      'Favorece la apertura respiratoria y alivia la congestión, acompañando procesos gripales o alérgicos. Genera una sensación de alivio emocional y espacio interno.',
      'Invita a soltar cargas, limpiar y renovar, como una bocanada de aire nuevo.',
    ],
    composicion: ['100% aceite esencial puro de eucalipto'],
    uso: USO_ESENCIAL, precauciones: PRECAUCION_ESENCIAL,
    etiqueta: ESENCIAL('Eucalipto'),
    escena: ['palmera', 'ramita:eucalipto'],
    tema: { suave: '#E2ECEC', profundo: '#3D6E73', sobre: '#EFF7F7' },
    precio: null,
  },
];

// Promos del mes: combos. `productos` = [id, índice de variante]
export const PROMOS = [
  {
    titulo: 'Combo Volver al cuerpo',
    cuando: 'Promo del mes',
    texto: 'Para quienes acumulan tensión, sobrecarga física o necesitan recuperar el cuerpo.',
    ideal: 'Dolores musculares, contracturas y recuperación física.',
    productos: [['aceite-luxor', 0], ['luxor', 0]],
    antes: 38000, precio: 35000,
    tema: { profundo: '#2A3B1F', sobre: '#E3C062' },
    escena: ['monstera', 'ramita:eucalipto', 'piedras'],
  },
  {
    titulo: 'Combo Bajar un cambio',
    cuando: 'Promo del mes',
    texto: 'Para el estrés, la tensión, la dificultad para desconectar, el cansancio mental y la necesidad de descanso.',
    ideal: 'Calma, descanso y tensiones leves.',
    productos: [['balsamo-lavanda', 0], ['aceite-luxor', 0]],
    antes: 30000, precio: 27000,
    tema: { profundo: '#7A5A9E', sobre: '#FBF6FF' },
    escena: ['lavanda', 'piedras', 'miel'],
  },
];

export const porId = (id) => PRODUCTOS.find((p) => p.id === id);

/** Devuelve el producto con la variante aplicada (medida, forma, etiqueta, precio). */
export function resolver(p, i = 0) {
  const v = p.variantes?.[i] || {};
  return { ...p, ...v, variante: i };
}

export function linkWhatsapp(texto) {
  return `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(texto)}`;
}

export const pesos = (n) => '$' + n.toLocaleString('es-AR');
