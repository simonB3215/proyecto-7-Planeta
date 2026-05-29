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
    // Usamos el archivo CSV público global de las últimas 24h (MODIS) que NO requiere API KEY.
    const res = await fetch('https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv');
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
      // Aseguramos que tengan la fecha en un formato común para el timeline (usando acq_date)
      // MODIS CSV usa acq_date (YYYY-MM-DD) y acq_time (HHMM)
      const formattedFires = fires.map(f => {
        // Combinar acq_date y acq_time
        const timeStr = f.acq_time ? f.acq_time.padStart(4, '0') : '0000';
        const isoString = `${f.acq_date}T${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:00Z`;
        return {
          ...f,
          acq_date: isoString
        };
      });
      useStore.getState().setFirmsFires(formattedFires);
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
