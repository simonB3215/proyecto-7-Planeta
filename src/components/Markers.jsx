import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { useAppStore } from '../store/useAppStore';
import { latLngToVector3 } from '../utils/geoToVector3';
import EventMarker from './EventMarker';
import { Html } from '@react-three/drei';
import { Layers } from 'lucide-react';
import { EVENT_TYPES, getPaletteFor, eonetCategoryToType } from '../utils/palette';
import { makeCountryPredicate } from '../utils/countryFilter';
import { getGraphicsProfile } from '../utils/graphics';

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
  const clusterSeg = getGraphicsProfile(useStore((s) => s.graphicsMode)).clusterSphere;

  // Config (color, intensidad, núcleo) inyectada desde la paleta externa.
  const cfg = getPaletteFor(cluster.type);
  const clusterColor = cfg.color;

  // Si es un solo evento, delegamos al marcador individual (color inyectado).
  if (count === 1) {
    const ev = cluster.events[0];
    return (
      <EventMarker
        key={ev.id}
        position={pos}
        size={ev.size}
        color={cfg.color}
        coreColor={cfg.core}
        emissiveIntensity={cfg.emissiveIntensity}
        eventData={ev.data}
      />
    );
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
        <sphereGeometry args={[0.02 + count * 0.001, clusterSeg, clusterSeg]} />
        <meshStandardMaterial
          color={clusterColor}
          emissive={clusterColor}
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>

      {(isHovered || isSelected) && (
        <Html zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-black/90 border border-white/25 rounded-none px-3 py-2 w-max transform -translate-x-1/2 -translate-y-full mb-4 pointer-events-none">
            <div className="flex items-center gap-2">
              <Layers size={14} strokeWidth={1.5} style={{ color: clusterColor }} />
              <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-300">
                {count} eventos · clúster
              </span>
            </div>
            {cluster.type === EVENT_TYPES.EARTHQUAKE && (
              <div className="font-mono text-[10px] tracking-widest uppercase mt-1 border-t border-white/10 pt-1.5" style={{ color: clusterColor }}>
                MAG MAX {maxMag}
              </div>
            )}
            <div className="font-mono text-[9px] tracking-widest uppercase text-neutral-500 mt-1">
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
  const selectedCountry = useStore((s) => s.selectedCountry);
  const geoJsonData = useStore((s) => s.geoJsonData);
  const filters = useAppStore((s) => s.filters);

  // Predicado de filtrado geográfico estricto por país. `null` = sin filtro
  // (no hay país real seleccionado) → se muestran todos los eventos.
  const countryPredicate = useMemo(
    () => makeCountryPredicate(selectedCountry, geoJsonData),
    [selectedCountry, geoJsonData]
  );

  // EARTHQUAKES (USGS)
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
      })
      .filter((e) => !countryPredicate || countryPredicate(e.lng, e.lat));
    return clusterEvents(validEvents, CLUSTER_RADIUS_DEG);
  }, [earthquakes, timelineDate, countryPredicate]);

  // FIRES (NASA FIRMS)
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
      }))
      .filter((e) => !countryPredicate || countryPredicate(e.lng, e.lat));
    return clusterEvents(validEvents, CLUSTER_RADIUS_DEG);
  }, [firmsFires, timelineDate, countryPredicate]);

  // VOLCANOES (NASA EONET) — pocos, sin clustering.
  const volcanoCfg = getPaletteFor(EVENT_TYPES.VOLCANO);
  const volcanoMarkers = useMemo(() => {
    return eonetEvents
      .filter((ev) => eonetCategoryToType(ev.categories?.[0]?.id) === EVENT_TYPES.VOLCANO)
      .slice(0, 80)
      .map((ev) => {
        if (!ev.geometries || ev.geometries.length === 0) return null;
        const coords = ev.geometries[0].coordinates;
        if (!Array.isArray(coords) || Array.isArray(coords[0])) return null;

        const eventTime = new Date(ev.geometries[0].date).getTime();
        if (eventTime > timelineDate) return null;

        // Filtro geográfico estricto por país seleccionado.
        if (countryPredicate && !countryPredicate(coords[0], coords[1])) return null;

        const pos = latLngToVector3(coords[1], coords[0], GLOBE_RADIUS);
        return (
          <EventMarker
            key={ev.id}
            position={pos}
            size={0.015}
            color={volcanoCfg.color}
            coreColor={volcanoCfg.core}
            emissiveIntensity={volcanoCfg.emissiveIntensity}
            eventData={{
              id: ev.id,
              type: EVENT_TYPES.VOLCANO,
              title: ev.title,
              date: ev.geometries[0].date,
              pos,
              rawLat: coords[1],
              rawLng: coords[0],
            }}
          />
        );
      })
      .filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eonetEvents, timelineDate, countryPredicate]);

  // Filtros por categoría (controlados desde el panel lateral).
  const show = (type) => filters[type] !== false;

  return (
    <group>
      {show(EVENT_TYPES.EARTHQUAKE) &&
        eqClusters.map((c) => <ClusterMarker key={c.id} cluster={c} />)}
      {show(EVENT_TYPES.FIRE) && fireClusters.map((c) => <ClusterMarker key={c.id} cluster={c} />)}
      {show(EVENT_TYPES.VOLCANO) && volcanoMarkers}
    </group>
  );
}
