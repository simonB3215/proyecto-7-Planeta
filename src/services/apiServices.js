import { useStore } from '../store/useStore';

export const fetchEarthquakes = async () => {
  try {
    const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
    const data = await res.json();
    useStore.getState().setEarthquakes(data.features || []);
  } catch (error) {
    console.error('Error fetching USGS Earthquakes:', error);
  }
};

export const fetchEonetEvents = async () => {
  try {
    const res = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events');
    const data = await res.json();
    useStore.getState().setEonetEvents(data.events || []);
  } catch (error) {
    console.error('Error fetching NASA EONET:', error);
  }
};

export const fetchFirmsFires = async () => {
  try {
    // Nota: FIRMS API requiere una API KEY real. Para que no falle, simularemos o retornaremos vacío
    // si no hay llave provista, o puedes cambiar '[TU_API_KEY]' por una real.
    const apiKey = 'DEMO_KEY'; 
    if (apiKey === 'DEMO_KEY') {
        console.warn('NASA FIRMS API Key is missing. Using empty data or please provide a valid key.');
        useStore.getState().setFirmsFires([]);
        return;
    }
    const res = await fetch(`https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/world/1`);
    const text = await res.text();
    // Parseo básico de CSV a JSON
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
      useStore.getState().setFirmsFires(fires);
    }
  } catch (error) {
    console.error('Error fetching NASA FIRMS:', error);
  }
};

export const fetchAllData = async () => {
  useStore.getState().setLoading(true);
  await Promise.allSettled([
    fetchEarthquakes(),
    fetchEonetEvents(),
    fetchFirmsFires()
  ]);
  useStore.getState().setLoading(false);
};
