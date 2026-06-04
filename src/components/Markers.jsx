import React, { useMemo, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { latLngToVector3 } from '../utils/geoToVector3';
import EventMarker from './EventMarker';
import { Billboard, Text, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const GLOBE_RADIUS = 1.01;
const CLUSTER_RADIUS_DEG = 8; // Grados de distancia para agrupar

// Algoritmo ligero de Clustering por proximidad (Grid/Radio)
function clusterEvents(events, radiusDeg) {
  const clusters = [];
  events.forEach(event => {
    let clustered = false;
    for (let cluster of clusters) {
      const dx = cluster.center.lng - event.lng;
      const dy = cluster.center.lat - event.lat;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= radiusDeg) {
        cluster.events.push(event);
        clustered = true;
        break;
      }
    }
    if (!clustered) {
      clusters.push({
        id: `cluster-${event.id}`,
        center: { lat: event.lat, lng: event.lng },
        events: [event],
        type: event.type
      });
    }
  });
  return clusters;
}

function getEventColor(event) {
  if (event.type === 'Fire') return '#ef4444'; // Rojo para incendios
  if (event.type === 'Storm') return '#3b82f6'; // Azul para tormentas
  return '#f97316'; // Naranja para todos los sismos
}

function ClusterMarker({ cluster }) {
  const pos = latLngToVector3(cluster.center.lat, cluster.center.lng, GLOBE_RADIUS);
  const count = cluster.events.length;
  const selectedEvent = useStore(state => state.selectedEvent);
  const setSelectedEvent = useStore(state => state.setSelectedEvent);
  const [isHovered, setIsHovered] = useState(false);
  const coreMaterialRef = useRef();
  
  const isSelected = selectedEvent && cluster.events.some(ev => ev.id === selectedEvent.id);
  
  useFrame((state) => {
    const radarMode = useStore.getState().radarMode;
    if (radarMode) {
      const pulse = Math.sin(state.clock.elapsedTime * 2.0) * 0.5 + 0.5;
      const pulseIntensity = Math.pow(pulse, 1.5);
      const radarIntensity = 0.2 + (pulseIntensity * 0.8);
      
      if (coreMaterialRef.current) {
        coreMaterialRef.current.opacity = 0.8 * radarIntensity;
      }
    } else if (coreMaterialRef.current && coreMaterialRef.current.opacity !== 0.8) {
      coreMaterialRef.current.opacity = 0.8;
    }
  });
  
  // Si es un solo evento, usamos su color específico
  if (count === 1) {
    const ev = cluster.events[0];
    const color = getEventColor(ev);
    return <EventMarker key={ev.id} position={pos} color={color} size={ev.size} eventData={ev.data} />;
  }
  
  // Si es un clúster, calculamos el color basado en el evento más peligroso del clúster
  let maxMag = 0;
  let recentDate = cluster.events[0]?.data?.date || new Date().toISOString();
  
  cluster.events.forEach(ev => {
    if (ev.type === 'Earthquake' && ev.data?.mag > maxMag) {
      maxMag = ev.data.mag;
    }
  });
  
  // Asignar el color del clúster basado en el peor sismo (o rojo si es fuego)
  let clusterColor = '#ffd700';
  if (cluster.type === 'Fire') clusterColor = '#ef4444';
  else if (cluster.type === 'Earthquake') {
    clusterColor = getEventColor({ type: 'Earthquake', data: { mag: maxMag } });
  }

  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedEvent({
      id: cluster.id,
      type: cluster.type,
      title: `${count} Eventos Agrupados en esta región`,
      date: recentDate,
      mag: cluster.type === 'Earthquake' ? maxMag : undefined,
      pos: pos,
      rawLat: cluster.center.lat,
      rawLng: cluster.center.lng
    });
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    setIsHovered(true);
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
    setIsHovered(false);
  };

  return (
    <group position={pos}>
      <mesh onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <sphereGeometry args={[0.02 + (count * 0.001), 16, 16]} />
        <meshBasicMaterial ref={coreMaterialRef} color={clusterColor} transparent={true} opacity={0.8} />
      </mesh>

      {(isHovered || isSelected) && (
        <Html zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-slate-700 w-max transform -translate-x-1/2 -translate-y-full mb-4 pointer-events-none transition-all">
            <div className="font-bold text-slate-200 mb-2 flex items-center gap-2 text-sm">
              <span className="text-base">📍</span>
              <span>{count} Eventos Agrupados</span>
            </div>
            {cluster.type === 'Earthquake' && (
              <div className="text-xs text-orange-400 font-bold mb-1">
                Magnitud Máxima: {maxMag}
              </div>
            )}
            <div className="text-[11px] text-slate-400 mt-2">
              {new Date(recentDate).toLocaleString()}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function Markers() {
  const { earthquakes, eonetEvents, firmsFires, timelineDate } = useStore();

  // EARTHQUAKES
  const eqClusters = useMemo(() => {
    const validEvents = earthquakes
      .filter(eq => new Date(eq.properties.time).getTime() <= timelineDate)
      .slice(0, 300)
      .map(eq => {
        const coords = eq.geometry.coordinates;
        return {
          id: eq.id,
          type: 'Earthquake',
          lat: coords[1],
          lng: coords[0],
          size: Math.max(0.005, (eq.properties.mag || 1) * 0.005),
          data: { id: eq.id, type: 'Earthquake', title: eq.properties.place, date: eq.properties.time, mag: eq.properties.mag, pos: latLngToVector3(coords[1], coords[0], GLOBE_RADIUS), rawLat: coords[1], rawLng: coords[0] }
        };
      });
    return clusterEvents(validEvents, CLUSTER_RADIUS_DEG);
  }, [earthquakes, timelineDate]);

  // FIRES
  const fireClusters = useMemo(() => {
    const validEvents = firmsFires
      .filter(fire => new Date(fire.acq_date).getTime() <= timelineDate)
      .slice(0, 500)
      .filter(fire => fire.latitude && fire.longitude)
      .map((fire, i) => {
        return {
          id: `fire-${i}`,
          type: 'Fire',
          lat: parseFloat(fire.latitude),
          lng: parseFloat(fire.longitude),
          size: 0.01,
          data: { id: `fire-${i}`, type: 'Fire', title: 'Thermal Anomaly', date: fire.acq_date, pos: latLngToVector3(parseFloat(fire.latitude), parseFloat(fire.longitude), GLOBE_RADIUS), rawLat: parseFloat(fire.latitude), rawLng: parseFloat(fire.longitude) }
        };
      });
    return clusterEvents(validEvents, CLUSTER_RADIUS_DEG);
  }, [firmsFires, timelineDate]);

  // STORMS (EONET) - Normalmente son pocas, no agrupamos pero filtramos
  const eonetMarkers = useMemo(() => {
    return eonetEvents
      .slice(0, 30)
      .map((ev) => {
        if (!ev.geometries || ev.geometries.length === 0) return null;
        const coords = ev.geometries[0].coordinates;
        if (!Array.isArray(coords) || Array.isArray(coords[0])) return null; 
        
        const eventTime = new Date(ev.geometries[0].date).getTime();
        if (eventTime > timelineDate) return null;

        const pos = latLngToVector3(coords[1], coords[0], GLOBE_RADIUS);
        return <EventMarker key={ev.id} position={pos} color="#3b82f6" size={0.015} eventData={{ id: ev.id, type: 'Storm', title: ev.title, date: ev.geometries[0].date, pos: pos, rawLat: coords[1], rawLng: coords[0] }} />;
      });
  }, [eonetEvents, timelineDate]);

  return (
    <group>
      {eqClusters.map(c => <ClusterMarker key={c.id} cluster={c} color="#ffd700" />)}
      {fireClusters.map(c => <ClusterMarker key={c.id} cluster={c} color="#ef4444" />)}
      {eonetMarkers}
    </group>
  );
}

