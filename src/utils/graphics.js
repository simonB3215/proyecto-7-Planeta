// =============================================================================
// Perfiles de calidad gráfica (3 niveles) — Fuente única de verdad.
// Consumido por el lienzo (DPR/MSAA/Bloom), las geometrías (segmentos) y la
// compuerta de configuración del tutorial.
// =============================================================================

export const GRAPHICS_LEVELS = ['low', 'medium', 'high'];

export const GRAPHICS_PROFILES = {
  low: {
    label: 'Baja',
    desc: 'DPR estándar · sin MSAA · malla mínima',
    dpr: 1,
    multisampling: 0,
    bloomIntensity: 0.3,
    earthSegments: 24,
    markerSphere: 12,
    markerRing: 16,
    markerWire: 6,
    clusterSphere: 12,
  },
  medium: {
    label: 'Media',
    desc: 'DPR equilibrado · MSAA 4x · malla intermedia',
    dpr: [1, 1.5],
    multisampling: 4,
    bloomIntensity: 0.5,
    earthSegments: 48,
    markerSphere: 32,
    markerRing: 32,
    markerWire: 10,
    clusterSphere: 24,
  },
  high: {
    label: 'Alta',
    desc: 'DPR x2 máx · MSAA 8x · geometría HD',
    dpr: [1, 2],
    multisampling: 8,
    bloomIntensity: 0.7,
    earthSegments: 96,
    markerSphere: 64,
    markerRing: 64,
    markerWire: 16,
    clusterSphere: 32,
  },
};

/** Devuelve el perfil para un nivel (fallback a 'high'). */
export const getGraphicsProfile = (level) => GRAPHICS_PROFILES[level] || GRAPHICS_PROFILES.high;

/** Siguiente nivel en el ciclo low -> medium -> high -> low. */
export const nextGraphicsLevel = (level) => {
  const i = GRAPHICS_LEVELS.indexOf(level);
  return GRAPHICS_LEVELS[(i + 1) % GRAPHICS_LEVELS.length];
};
