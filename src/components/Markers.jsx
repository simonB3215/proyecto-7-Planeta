import { useMemo, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useAppStore } from '../store/useAppStore';
import { latLngToVector3 } from '../utils/geoToVector3';
import EventMarker from './EventMarker';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Layers } from 'lucide-react';
import { EVENT_TYPES, getEventColor, eonetCategoryToType } from '../utils/palette';

const GLOBE_RADIUS = 1.01;
const CLUSTER_RADIUS_DEG = 8; // Grados de distancia para agrupar

// Algoritmo ligero de Clustering por proximidad (Grid/Radio)
function clusterEvents(events, radiusDeg) {
  const clusters = [];
  events.forEach((event) => {
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
        type: event.type,
      });
    }
  });
  return clusters;
}

function ClusterMarker({ cluster }) {
  const pos = useMemo(
    () => latLngToVector3(cluster.center.lat, cluster.center.lng, GLOBE_RADIUS),
    [cluster.center.lat, cluster.center.lng]
  );
  const count = cluster.events.length;
  const setSelectedEvent = useStore((s) => s.setSelectedEvent);
  const isSelected = useStore(
    (s) => !!s.selectedEvent && cluster.events.some((ev) => ev.id === s.selectedEvent.id)
  );
  const [isHovered, setIsHovered] = useState(false);
  const coreMaterialRef = useRef();

  const clusterColor = getEventColor(cluster.type);

  useFrame((state) => {
    const radarMode = useStore.getState().radarMode;
    if (!coreMaterialRef.current) return;
    if (radarMode) {
      const pulse = Math.pow(Math.sin(state.clock.elapsedTime * 2.0) * 0.5 + 0.5, 1.5);
      coreMaterialRef.current.emissiveIntensity = 0.4 + pulse * 2.2;
    } else {
      coreMaterialRef.current.emissiveIntensity = 2.4;
    }
  });

  // Si es un solo evento, delegamos al marcador individual (que se auto-colorea por tipo).
  if (count === 1) {
    const ev = cluster.events[0];
    return <EventMarker key={ev.id} position={pos} size={ev.size} eventData={ev.data} />;
  }

  // Clúster: tomamos la magnitud máxima y la fecha más representativa.
  let maxMag = 0;
  let recentDate = cluster.events[0]?.data?.date || new Date().toISOString();
  cluster.events.forEach((ev) => {
    if (ev.type === EVENT_TYPES.EARTHQUAKE && ev.data?.mag > maxMag) maxMag = ev.data.mag;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedEvent({
      id: cluster.id,
      type: cluster.type,
      title: `${count} Eventos Agrupados en esta región`,
      date: recentDate,
      mag: cluster.type === EVENT_TYPES.EARTHQUAKE ? maxMag : undefined,
      pos,
      rawLat: cluster.center.lat,
      rawLng: cluster.center.lng,
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
        <sphereGeometry args={[0.02 + count * 0.001, 18, 18]} />
        <meshStandardMaterial
          ref={coreMaterialRef}
          color={clusterColor}
          emissive={clusterColor}
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>

      {(isHovered || isSelected) && (
        <Html zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-slate-950/60 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10 w-max transform -translate-x-1/2 -translate-y-full mb-4 pointer-events-none transition-all">
            <div className="font-bold text-slate-200 mb-2 flex items-center gap-2 text-sm">
              <Layers size={16} style={{ color: clusterColor }} />
              <span>{count} Eventos Agrupados</span>
            </div>
            {cluster.type === EVENT_TYPES.EARTHQUAKE && (
              <div className="text-xs font-bold mb-1" style={{ color: clusterColor }}>
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
  const earthquakes = useStore((s) => s.earthquakes);
  const eonetEvents = useStore((s) => s.eonetEvents);
  const firmsFires = useStore((s) => s.firmsFires);
  const timelineDate = useStore((s) => s.timelineDate);
  const filters = useAppStore((s) => s.filters);

  // EARTHQUAKES
  const eqClusters = useMemo(() => {
    const validEvents = earthquakes
      .filter((eq) => new Date(eq.properties.time).getTime() <= timelineDate)
      .slice(0, 300)
      .map((eq) => {
        const coords = eq.geometry.coordinates;
        return {
          id: eq.id,
          type: EVENT_TYPES.EARTHQUAKE,
          lat: coords[1],
          lng: coords[0],
          size: Math.max(0.005, (eq.properties.mag || 1) * 0.005),
          data: {
            id: eq.id,
            type: EVENT_TYPES.EARTHQUAKE,
            title: eq.properties.place,
            date: eq.properties.time,
            mag: eq.properties.mag,
            pos: latLngToVector3(coords[1], coords[0], GLOBE_RADIUS),
            rawLat: coords[1],
            rawLng: coords[0],
          },
        };
      });
    return clusterEvents(validEvents, CLUSTER_RADIUS_DEG);
  }, [earthquakes, timelineDate]);

  // FIRES
  const fireClusters = useMemo(() => {
    const validEvents = firmsFires
      .filter((fire) => new Date(fire.acq_date).getTime() <= timelineDate)
      .slice(0, 500)
      .filter((fire) => fire.latitude && fire.longitude)
      .map((fire, i) => ({
        id: `fire-${i}`,
        type: EVENT_TYPES.FIRE,
        lat: parseFloat(fire.latitude),
        lng: parseFloat(fire.longitude),
        size: 0.01,
        data: {
          id: `fire-${i}`,
          type: EVENT_TYPES.FIRE,
          title: 'Anomalía Térmica',
          date: fire.acq_date,
          pos: latLngToVector3(parseFloat(fire.latitude), parseFloat(fire.longitude), GLOBE_RADIUS),
          rawLat: parseFloat(fire.latitude),
          rawLng: parseFloat(fire.longitude),
        },
      }));
    return clusterEvents(validEvents, CLUSTER_RADIUS_DEG);
  }, [firmsFires, timelineDate]);

  // EONET (volcanes, tormentas, eventos extremos) — pocos, sin clustering.
  const eonetMarkers = useMemo(() => {
    return eonetEvents
      .slice(0, 40)
      .map((ev) => {
        if (!ev.geometries || ev.geometries.length === 0) return null;
        const coords = ev.geometries[0].coordinates;
        if (!Array.isArray(coords) || Array.isArray(coords[0])) return null;

        const eventTime = new Date(ev.geometries[0].date).getTime();
        if (eventTime > timelineDate) return null;

        const type = eonetCategoryToType(ev.categories?.[0]?.id);
        const pos = latLngToVector3(coords[1], coords[0], GLOBE_RADIUS);
        return {
          type,
          node: (
            <EventMarker
              key={ev.id}
              position={pos}
              size={0.015}
              eventData={{
                id: ev.id,
                type,
                title: ev.title,
                date: ev.geometries[0].date,
                pos,
                rawLat: coords[1],
                rawLng: coords[0],
              }}
            />
          ),
        };
      })
      .filter(Boolean);
  }, [eonetEvents, timelineDate]);

  // Filtros por categoría (controlados desde el panel lateral).
  const show = (type) => filters[type] !== false;

  return (
    <group>
      {show(EVENT_TYPES.EARTHQUAKE) &&
        eqClusters.map((c) => <ClusterMarker key={c.id} cluster={c} />)}
      {show(EVENT_TYPES.FIRE) && fireClusters.map((c) => <ClusterMarker key={c.id} cluster={c} />)}
      {eonetMarkers.filter((m) => show(m.type)).map((m) => m.node)}
    </group>
  );
}
