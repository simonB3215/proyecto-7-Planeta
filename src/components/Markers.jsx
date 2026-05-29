import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { latLngToVector3 } from '../utils/geoToVector3';
import EventMarker from './EventMarker';

const GLOBE_RADIUS = 1.01;

export default function Markers() {
  const { earthquakes, eonetEvents, firmsFires } = useStore();

  const earthquakeMarkers = useMemo(() => {
    return earthquakes.map((eq) => {
      const coords = eq.geometry.coordinates; // [lng, lat, depth]
      const pos = latLngToVector3(coords[1], coords[0], GLOBE_RADIUS);
      const size = Math.max(0.005, (eq.properties.mag || 1) * 0.005);
      return <EventMarker key={eq.id} position={pos} color="#f97316" size={size} eventData={{ type: 'Earthquake', title: eq.properties.place, date: eq.properties.time, mag: eq.properties.mag }} />;
    });
  }, [earthquakes]);

  const eonetMarkers = useMemo(() => {
    return eonetEvents.map((ev) => {
      if (!ev.geometries || ev.geometries.length === 0) return null;
      const coords = ev.geometries[0].coordinates;
      if (!Array.isArray(coords) || Array.isArray(coords[0])) return null; 
      
      const pos = latLngToVector3(coords[1], coords[0], GLOBE_RADIUS);
      return <EventMarker key={ev.id} position={pos} color="#3b82f6" size={0.015} eventData={{ type: 'Storm', title: ev.title, date: ev.geometries[0].date }} />;
    });
  }, [eonetEvents]);

  const fireMarkers = useMemo(() => {
    return firmsFires.map((fire, i) => {
      if (!fire.latitude || !fire.longitude) return null;
      const pos = latLngToVector3(parseFloat(fire.latitude), parseFloat(fire.longitude), GLOBE_RADIUS);
      return <EventMarker key={`fire-${i}`} position={pos} color="#ef4444" size={0.01} eventData={{ type: 'Fire', title: 'Thermal Anomaly', date: fire.acq_date }} />;
    });
  }, [firmsFires]);

  return (
    <group>
      {earthquakeMarkers}
      {eonetMarkers}
      {fireMarkers}
    </group>
  );
}

