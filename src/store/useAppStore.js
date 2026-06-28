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

export const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenido a EarthPulse 3D',
    body: 'Monitoreo planetario en tiempo real.',
  },
  {
    id: 'globe',
    title: 'Control del Globo',
    body: 'Arrastra para rotar el planeta, usa la rueda del mouse para hacer zoom.',
  },
  {
    id: 'filters',
    title: 'Filtros',
    body: 'Usa el panel lateral para filtrar eventos por categoría.',
  },
  {
    id: 'details',
    title: 'Detalles',
    body: 'Haz clic en cualquier marcador brillante sobre el globo para ver sus datos específicos.',
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
      // Solo persistimos lo que debe sobrevivir a recargas.
      partialize: (state) => ({
        hasSeenTutorial: state.hasSeenTutorial,
        filters: state.filters,
      }),
    }
  )
);
