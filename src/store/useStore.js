import { create } from 'zustand';

export const useStore = create((set) => ({
  earthquakes: [],
  eonetEvents: [],
  firmsFires: [],
  isLoading: false,
  error: null,
  targetLocation: null,
  selectedEvent: null,
  selectedCountry: null,
  isRotating: true,
  lightingMode: 'full',
  
  geoJsonData: null,
  
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
    if (eventData && eventData.rawLat !== undefined && eventData.rawLng !== undefined) {
      set({ targetLocation: { lat: eventData.rawLat, lng: eventData.rawLng } });
    }
    set({ selectedEvent: eventData });
  },
  clearSelectedEvent: () => set({ selectedEvent: null }),
  setSelectedCountry: (countryName) => set({ selectedCountry: countryName }),
  clearSelectedCountry: () => set({ selectedCountry: null }),
  // Deselección total: limpia evento Y país (cierra panel y quita el resaltado).
  clearSelection: () => set({ selectedEvent: null, selectedCountry: null }),
  toggleRotation: () => set((state) => ({ isRotating: !state.isRotating })),
  toggleLighting: () => set((state) => ({ lightingMode: state.lightingMode === 'full' ? 'realtime' : 'full' })),
  
  setGeoJsonData: (data) => set({ geoJsonData: data }),
  
  setTimelineDate: (timestamp) => set({ timelineDate: timestamp }),
  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  radarMode: false,
  toggleRadarMode: () => set((state) => ({ radarMode: !state.radarMode }))
}));
