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
    id: 'welcome',
    title: 'Bienvenido a EarthPulse 3D',
    body: 'Monitoreo planetario en tiempo real.',
    target: null,
  },
  {
    id: 'globe',
    title: 'Navegación',
    body: 'Arrastra para rotar el planeta, usa la rueda del mouse para hacer zoom.',
    target: '[data-tutorial="canvas"]',
  },
  {
    id: 'filters',
    title: 'Filtros',
    body: 'Usa este panel para ocultar o mostrar eventos por categoría.',
    target: '[data-tutorial="sidebar"]',
  },
  {
    id: 'details',
    title: 'Detalles',
    body: 'Haz clic en cualquier marcador brillante para ver los datos específicos del evento.',
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
