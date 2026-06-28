import { useStore } from '../store/useStore';
import { notify } from '../utils/notify';

export const fetchEarthquakes = async () => {
  try {
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    useStore.getState().setEarthquakes(data.features || []);
  } catch (error) {
    console.error('Error fetching USGS Earthquakes:', error);
    notify.error('Sin datos sísmicos', {
      description: 'No se pudo conectar con el feed de terremotos de USGS.',
      source: `USGS · ${error.message}`,
    });
  }
};

export const fetchEonetEvents = async () => {
  try {
    const res = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    useStore.getState().setEonetEvents(data.events || []);
  } catch (error) {
    console.error('Error fetching NASA EONET, using fallback data:', error);
    notify.warning('Datos meteorológicos parciales', {
      description: 'NASA EONET no respondió; mostrando datos de respaldo.',
      source: 'NASA EONET v3',
    });
    const today = new Date().toISOString();
    const mockEvents = [
      {
        id: "mock-storm-1",
        title: "Tormenta Tropical Simulada (Fallback)",
        categories: [{ id: "severeStorms", title: "Severe Storms" }],
        geometries: [{ date: today, type: "Point", coordinates: [-80.0, 25.0] }]
      },
      {
        id: "mock-storm-2",
        title: "Huracán Simulado (Fallback)",
        categories: [{ id: "severeStorms", title: "Severe Storms" }],
        geometries: [{ date: today, type: "Point", coordinates: [-60.0, 15.0] }]
      }
    ];
    useStore.getState().setEonetEvents(mockEvents);
  }
};

export const fetchFirmsFires = async () => {
  try {
    const res = await fetch('/api/firms/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const text = await res.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length > 1) {
      const headers = lines[0].split(',');
      const fires = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index];
          return obj;
        }, {});
      });
      const formattedFires = fires.map(f => {
        const timeStr = f.acq_time ? f.acq_time.padStart(4, '0') : '0000';
        const isoString = `${f.acq_date}T${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:00Z`;
        return { ...f, acq_date: isoString };
      });
      useStore.getState().setFirmsFires(formattedFires);
    }
  } catch (error) {
    console.error('CORS o red bloqueó NASA FIRMS. Usando datos de respaldo (Fallback):', error);
    notify.warning('Anomalías térmicas de respaldo', {
      description: 'NASA FIRMS bloqueado por CORS; mostrando focos de demostración.',
      source: 'NASA FIRMS · MODIS',
    });
    // FALLBACK DE DEMOSTRACIÓN (Para sortear problemas de CORS en el navegador)
    const today = new Date().toISOString();
    const mockFires = [
      // California
      { latitude: 34.05, longitude: -118.25, acq_date: today },
      { latitude: 34.10, longitude: -118.30, acq_date: today },
      { latitude: 35.00, longitude: -119.00, acq_date: today },
      { latitude: 39.50, longitude: -121.00, acq_date: today },
      // Amazonas
      { latitude: -3.46, longitude: -62.21, acq_date: today },
      { latitude: -4.00, longitude: -61.00, acq_date: today },
      { latitude: -5.00, longitude: -60.00, acq_date: today },
      { latitude: -6.50, longitude: -63.00, acq_date: today },
      { latitude: -2.00, longitude: -58.00, acq_date: today },
      // Australia
      { latitude: -31.95, longitude: 115.86, acq_date: today },
      { latitude: -32.00, longitude: 116.00, acq_date: today },
      { latitude: -33.86, longitude: 151.20, acq_date: today },
      { latitude: -34.00, longitude: 150.50, acq_date: today },
      // África Central
      { latitude: -1.29, longitude: 36.82, acq_date: today },
      { latitude: -2.00, longitude: 35.00, acq_date: today },
      { latitude: 0.00, longitude: 20.00, acq_date: today },
      { latitude: 1.00, longitude: 22.00, acq_date: today },
      { latitude: -5.00, longitude: 25.00, acq_date: today },
      // Sur de Europa (España/Grecia)
      { latitude: 37.38, longitude: -5.98, acq_date: today },
      { latitude: 38.00, longitude: -4.00, acq_date: today },
      { latitude: 37.98, longitude: 23.72, acq_date: today },
      { latitude: 38.50, longitude: 22.00, acq_date: today },
    ];
    useStore.getState().setFirmsFires(mockFires);
  }
};

// Las alertas de info/éxito solo se muestran en la primera sincronización;
// las recargas periódicas (cada 5 min) son silenciosas salvo que haya errores.
let firstLoad = true;

export const fetchAllData = async () => {
  useStore.getState().setLoading(true);
  if (firstLoad) {
    notify.info('Sincronizando datos satelitales', { source: 'EarthPulse · Uplink' });
  }

  await Promise.allSettled([
    fetchEarthquakes(),
    fetchEonetEvents(),
    fetchFirmsFires()
  ]);

  useStore.getState().setLoading(false);

  if (firstLoad) {
    notify.success('Datos planetarios cargados', {
      description: 'Monitoreo en tiempo real activo.',
      source: 'EarthPulse · Online',
    });
    firstLoad = false;
  }
};
