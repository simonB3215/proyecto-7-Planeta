// =============================================================================
// Configuración de eventos — Fuente única e inyectable para marcadores 3D y UI.
// La app procesa SOLO tres tipos: Incendios, Volcanes y Terremotos.
// Los colores viven aquí (config externa) y se INYECTAN como props a los
// materiales 3D; los componentes no hardcodean códigos de color.
// =============================================================================

export const EVENT_TYPES = {
  FIRE: 'Fire',
  VOLCANO: 'Volcano',
  EARTHQUAKE: 'Earthquake',
};

// Cada entrada define el "look & feel" de un tipo. `color`/`core` se inyectan
// en los materiales; las banderas (flicker/seismicRing) seleccionan el efecto.
export const EVENT_PALETTE = {
  [EVENT_TYPES.FIRE]: {
    label: 'Incendios',
    color: '#FF2400', // Rojo Escarlata
    emissiveIntensity: 2.6,
    flicker: true, // Parpadeo
  },
  [EVENT_TYPES.VOLCANO]: {
    label: 'Volcanes',
    color: '#FF8C00', // Naranja Oscuro
    core: '#FFFFFF', // Núcleo blanco
    emissiveIntensity: 2.4,
  },
  [EVENT_TYPES.EARTHQUAKE]: {
    label: 'Terremotos',
    color: '#FF5722', // Naranja Profundo
    emissiveIntensity: 2.8,
    seismicRing: true, // Onda sísmica (RingGeometry expansiva)
  },
};

const DEFAULT_TYPE = EVENT_TYPES.EARTHQUAKE;

/** Devuelve la configuración de paleta para un tipo de evento. */
export const getPaletteFor = (type) => EVENT_PALETTE[type] || EVENT_PALETTE[DEFAULT_TYPE];

/** Color hexadecimal directo para un tipo de evento. */
export const getEventColor = (type) => getPaletteFor(type).color;

// Mapea las categorías crudas de NASA EONET a nuestros tipos internos.
// Solo aceptamos volcanoes; el resto (tormentas, hielo, etc.) se DESCARTA.
const EONET_CATEGORY_MAP = {
  volcanoes: EVENT_TYPES.VOLCANO,
};

/** Normaliza una categoría EONET a un EVENT_TYPE permitido, o `null` si se descarta. */
export const eonetCategoryToType = (categoryId) => EONET_CATEGORY_MAP[categoryId] || null;
