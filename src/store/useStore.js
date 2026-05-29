import { create } from 'zustand';

export const useStore = create((set) => ({
  earthquakes: [],
  eonetEvents: [],
  firmsFires: [],
  isLoading: false,
  error: null,
  targetLocation: null,
  selectedEvent: null, // Nuevo estado
  
  setEarthquakes: (data) => set({ earthquakes: data }),
  setEonetEvents: (data) => set({ eonetEvents: data }),
  setFirmsFires: (data) => set({ firmsFires: data }),
  setLoading: (status) => set({ isLoading: status }),
  setError: (error) => set({ error: error }),
  setTargetLocation: (lat, lng) => set({ targetLocation: { lat, lng } }),
  
  setSelectedEvent: (eventData) => set({ selectedEvent: eventData }),
  clearSelectedEvent: () => set({ selectedEvent: null })
}));
