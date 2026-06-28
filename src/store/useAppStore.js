import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EVENT_TYPES } from '../utils/palette';

// =============================================================================
// useAppStore — Estado de UI/UX (separado del store de datos `useStore`).
// Responsabilidades:
//   1. Onboarding / Tutorial interactivo (persistido en localStorage).
//   2. Filtros de eventos por categoría.
// Solo el flag `hasSeenTutorial` y `filters` se persisten; el paso actual del
// tutorial es estado efímero de sesión.
// =============================================================================

const ALL_CATEGORIES = Object.values(EVENT_TYPES);

const defaultFilters = ALL_CATEGORIES.reduce((acc, type) => {
  acc[type] = true;
  return acc;
}, {});

// `target`: selector CSS del elemento a resaltar con el spotlight (null = sin recorte,
// overlay completo y diálogo centrado).
export const TUTORIAL_STEPS = [
  {
    id: 'welcome', // Paso 0: compuerta de configuración gráfica (diseño propio).
    title: 'Bienvenido a EarthPulse 3D',
    body: 'Monitoreo planetario en tiempo real.',
    target: null,
  },
  {
    id: 'navigation',
    title: 'Navegación del planeta',
    body: 'Arrastra para rotar la Tierra y usa la rueda del ratón para acercar o alejar. Haz clic en el océano o el vacío para deseleccionar.',
    target: '[data-tutorial="canvas"]',
  },
  {
    id: 'panel',
    title: 'Panel de eventos activos',
    body: 'Busca por país o región y revisa la lista de sismos, volcanes e incendios detectados, con sus estadísticas globales.',
    target: '[data-tutorial="sidebar"]',
  },
  {
    id: 'filters',
    title: 'Filtros por categoría',
    body: 'Activa o desactiva cada tipo de evento (Incendios, Volcanes, Terremotos) para mostrarlos u ocultarlos en el globo.',
    target: '[data-tutorial="filters"]',
  },
  {
    id: 'lighting',
    title: 'Iluminación',
    body: 'Alterna entre iluminación total del planeta y luz solar en tiempo real (día/noche según la hora UTC).',
    target: '[data-tutorial="lighting"]',
  },
  {
    id: 'rotation',
    title: 'Rotación automática',
    body: 'Pausa o reanuda el giro automático del planeta para inspeccionar una región con calma.',
    target: '[data-tutorial="rotation"]',
  },
  {
    id: 'quality',
    title: 'Calidad gráfica',
    body: 'Cicla entre Baja, Media y Alta para ajustar el rendimiento a tu equipo. Baja desactiva efectos y aligera las mallas.',
    target: '[data-tutorial="quality"]',
  },
  {
    id: 'help',
    title: 'Ayuda',
    body: 'Pulsa este botón en cualquier momento para volver a abrir este tutorial.',
    target: '[data-tutorial="help"]',
  },
  {
    id: 'details',
    title: 'Detalles del evento',
    body: 'Haz clic en cualquier marcador brillante sobre el globo para ver los datos específicos del evento.',
    target: null,
  },
];

export const useAppStore = create(
  persist(
    (set, get) => ({
      // --- Tutorial / Onboarding ---
      hasSeenTutorial: false, // persistido
      isTutorialOpen: false, // efímero
      tutorialStep: 0, // efímero

      startTutorial: () => set({ isTutorialOpen: true, tutorialStep: 0 }),
      nextStep: () => {
        const { tutorialStep } = get();
        if (tutorialStep >= TUTORIAL_STEPS.length - 1) {
          set({ isTutorialOpen: false, hasSeenTutorial: true, tutorialStep: 0 });
        } else {
          set({ tutorialStep: tutorialStep + 1 });
        }
      },
      prevStep: () => set((s) => ({ tutorialStep: Math.max(0, s.tutorialStep - 1) })),
      skipTutorial: () =>
        set({ isTutorialOpen: false, hasSeenTutorial: true, tutorialStep: 0 }),

      // --- Filtros por categoría ---
      filters: defaultFilters,
      toggleFilter: (type) =>
        set((s) => ({ filters: { ...s.filters, [type]: !s.filters[type] } })),
      isTypeVisible: (type) => get().filters[type] !== false,
    }),
    {
      name: 'earthpulse-ui',
      // v2: las categorías se redujeron a 3 (Incendios, Volcanes, Terremotos).
      // Subimos la versión para descartar filtros persistidos obsoletos y
      // garantizar que todas las categorías arranquen visibles.
      version: 2,
      migrate: (persisted) => ({ ...(persisted || {}), filters: { ...defaultFilters } }),
      // Solo persistimos lo que debe sobrevivir a recargas.
      partialize: (state) => ({
        hasSeenTutorial: state.hasSeenTutorial,
        filters: state.filters,
      }),
      // Garantiza que SIEMPRE existan las 3 categorías (evita ocultar todo si el
      // estado persistido está incompleto o corrupto).
      merge: (persisted, current) => {
        const p = persisted || {};
        return {
          ...current,
          ...p,
          filters: { ...defaultFilters, ...(p.filters || {}) },
        };
      },
    }
  )
);
