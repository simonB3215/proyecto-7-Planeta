import { create } from 'zustand';

export const useStore = create((set) => ({
  earthquakes: [],
  eonetEvents: [],
  firmsFires: [],
  isLoading: false,
  error: null,
  targetLocation: null,
  selectedEvent: null, // Nuevo estado
  selectedCountry: null,
  isRotating: true, // Estado para controlar la rotación de la Tierra
  lightingMode: 'full', // Estado para controlar la iluminación ('full' o 'realtime')
  
  // Nuevos estados para Timeline y Buscador
  timelineDate: Date.now(),
  isPlaying: false,
  searchQuery: '',
  
  setEarthquakes: (data) => set({ earthquakes: data }),
  setEonetEvents: (data) => set({ eonetEvents: data }),
  setFirmsFires: (data) => set({ firmsFires: data }),
  setLoading: (status) => set({ isLoading: status }),
  setError: (error) => set({ error: error }),
  setTargetLocation: (lat, lng) => set({ targetLocation: { lat, lng } }),
  
  setSelectedEvent: (eventData) => {
    // Automáticamente apuntar la cámara a la ubicación del evento
    if (eventData && eventData.rawLat !== undefined && eventData.rawLng !== undefined) {
      set({ targetLocation: { lat: eventData.rawLat, lng: eventData.rawLng } });
    }
    set({ selectedEvent: eventData });
  },
  clearSelectedEvent: () => set({ selectedEvent: null }),
  setSelectedCountry: (countryName) => set({ selectedCountry: countryName }),
  clearSelectedCountry: () => set({ selectedCountry: null }),
  toggleRotation: () => set((state) => ({ isRotating: !state.isRotating })),
  toggleLighting: () => set((state) => ({ lightingMode: state.lightingMode === 'full' ? 'realtime' : 'full' })),
  
  // Acciones de Timeline y Buscador
  setTimelineDate: (timestamp) => set({ timelineDate: timestamp }),
  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setSearchQuery: (query) => set({ searchQuery: query })
}));
