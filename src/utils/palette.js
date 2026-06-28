// =============================================================================
// PALETA "CYBER-SCIENTIFIC" — Fuente única de verdad para los marcadores 3D y UI
// Colores neón de alta emisividad pensados para simular bloom sobre el espacio.
// =============================================================================

export const EVENT_TYPES = {
  FIRE: 'Fire',
  VOLCANO: 'Volcano',
  STORM: 'Storm',
  EARTHQUAKE: 'Earthquake',
  EXTREME: 'Extreme',
};

// Cada entrada define el "look & feel" completo de un tipo de evento.
// `accent` se reutiliza en clases de Tailwind (texto/bordes) para coherencia visual.
export const EVENT_PALETTE = {
  [EVENT_TYPES.FIRE]: {
    label: 'Incendios',
    color: '#FF3366', // Rojo Carmesí Neón
    emissiveIntensity: 2.6,
    flicker: true, // Parpadeo
  },
  [EVENT_TYPES.VOLCANO]: {
    label: 'Volcanes',
    color: '#FF9900', // Ámbar Brillante
    core: '#FFFFFF', // Núcleo blanco
    emissiveIntensity: 2.4,
  },
  [EVENT_TYPES.STORM]: {
    label: 'Tormentas',
    color: '#00E5FF', // Cian Eléctrico
    emissiveIntensity: 2.0,
    translucent: true, // Geometría translúcida
  },
  [EVENT_TYPES.EARTHQUAKE]: {
    label: 'Terremotos',
    color: '#FFD700', // Dorado Vibrante
    emissiveIntensity: 2.8,
    seismicRing: true, // Onda sísmica (RingGeometry expansiva)
  },
  [EVENT_TYPES.EXTREME]: {
    label: 'Eventos Extremos',
    color: '#B026FF', // Magenta Profundo
    emissiveIntensity: 2.5,
  },
};

const DEFAULT_TYPE = EVENT_TYPES.EXTREME;

/** Devuelve la configuración de paleta para un tipo de evento. */
export const getPaletteFor = (type) => EVENT_PALETTE[type] || EVENT_PALETTE[DEFAULT_TYPE];

/** Color hexadecimal directo para un tipo de evento. */
export const getEventColor = (type) => getPaletteFor(type).color;

// Mapea las categorías crudas de NASA EONET a nuestros tipos internos.
const EONET_CATEGORY_MAP = {
  volcanoes: EVENT_TYPES.VOLCANO,
  wildfires: EVENT_TYPES.FIRE,
  severeStorms: EVENT_TYPES.STORM,
  // El resto de categorías (sequías, hielo, etc.) se tratan como extremas.
};

/** Normaliza un evento EONET a uno de nuestros EVENT_TYPES. */
export const eonetCategoryToType = (categoryId) =>
  EONET_CATEGORY_MAP[categoryId] || EVENT_TYPES.EXTREME;
