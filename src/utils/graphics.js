// =============================================================================
// Perfiles de calidad gráfica (3 niveles) — Fuente única de verdad.
// Consumido por el lienzo (DPR/MSAA/Bloom), las geometrías (segmentos) y la
// compuerta de configuración del tutorial.
// =============================================================================

export const GRAPHICS_LEVELS = ['low', 'medium', 'high'];

export const GRAPHICS_PROFILES = {
  low: {
    label: 'Baja',
    desc: 'Sin bloom · DPR 1 · malla mínima · sin adornos',
    dpr: 1,
    multisampling: 0,
    bloom: false,          // post-procesado desmontado por completo
    bloomIntensity: 0,
    earthSegments: 16,     // esfera del planeta muy ligera
    markerSphere: 8,       // mínimo razonable de subdivisiones
    markerRing: 16,
    markerWire: 6,
    clusterSphere: 10,
    decorations: false,    // sin halos / anillos / núcleos anidados
    starCount: 0,          // estrellas desactivadas: vacío negro absoluto
  },
  medium: {
    label: 'Media',
    desc: 'DPR equilibrado · MSAA 4x · malla intermedia',
    dpr: [1, 1.5],
    multisampling: 4,
    bloom: true,
    bloomIntensity: 0.5,
    earthSegments: 48,
    markerSphere: 32,
    markerRing: 32,
    markerWire: 10,
    clusterSphere: 24,
    decorations: true,
    starCount: 1500,
  },
  high: {
    label: 'Alta',
    desc: 'DPR x2 máx · MSAA 8x · geometría HD',
    dpr: [1, 2],
    multisampling: 8,
    bloom: true,
    bloomIntensity: 0.7,
    earthSegments: 96,
    markerSphere: 64,
    markerRing: 64,
    markerWire: 16,
    clusterSphere: 32,
    decorations: true,
    starCount: 2500,
  },
};

/** Devuelve el perfil para un nivel (fallback a 'high'). */
export const getGraphicsProfile = (level) => GRAPHICS_PROFILES[level] || GRAPHICS_PROFILES.high;

/** Siguiente nivel en el ciclo low -> medium -> high -> low. */
export const nextGraphicsLevel = (level) => {
  const i = GRAPHICS_LEVELS.indexOf(level);
  return GRAPHICS_LEVELS[(i + 1) % GRAPHICS_LEVELS.length];
};
