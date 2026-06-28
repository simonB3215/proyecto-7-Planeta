import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Flame, Mountain, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';
import { EVENT_TYPES } from '../utils/palette';
import { getGraphicsProfile } from '../utils/graphics';

const UP_Z = new THREE.Vector3(0, 0, 1);

// Acepta un THREE.Vector3 o un array [x,y,z].
function toVector3(p) {
  if (p instanceof THREE.Vector3) return p;
  if (Array.isArray(p)) return new THREE.Vector3(p[0], p[1], p[2]);
  return new THREE.Vector3();
}

// Iconos por tipo (lucide-react, sin emojis).
const TYPE_ICON = {
  [EVENT_TYPES.FIRE]: Flame,
  [EVENT_TYPES.VOLCANO]: Mountain,
  [EVENT_TYPES.EARTHQUAKE]: Activity,
};

const TYPE_LABEL = {
  [EVENT_TYPES.FIRE]: 'Incendio',
  [EVENT_TYPES.VOLCANO]: 'Volcán',
  [EVENT_TYPES.EARTHQUAKE]: 'Terremoto',
};

/**
 * Marcador 3D individual. Maneja únicamente tres tipos: Incendio, Volcán y
 * Terremoto. El color es PARAMETRIZADO (inyectado por props), no hardcodeado:
 *   - `color`: acento del material emisivo.
 *   - `coreColor`: núcleo interno (volcanes).
 *   - `emissiveIntensity`: intensidad base del brillo.
 * Efectos: incendios parpadean; terremotos emiten una onda sísmica (RingGeometry).
 */
function EventMarker({
  position,
  size = 0.012,
  color,
  coreColor = '#FFFFFF',
  emissiveIntensity = 2.4,
  eventData,
}) {
  const setSelectedEvent = useStore((s) => s.setSelectedEvent);
  const isSelected = useStore((s) => s.selectedEvent?.id === eventData.id);

  const [isHovered, setIsHovered] = useState(false);

  const isEarthquake = eventData.type === EVENT_TYPES.EARTHQUAKE;
  const isFire = eventData.type === EVENT_TYPES.FIRE;
  const isVolcano = eventData.type === EVENT_TYPES.VOLCANO;

  // Densidad poligonal y adornos según el perfil gráfico (baja/media/alta).
  const gfx = getGraphicsProfile(useStore((s) => s.graphicsMode));
  const sphereSeg = gfx.markerSphere;
  const ringSeg = gfx.markerRing;
  const wireSeg = gfx.markerWire;
  const decorations = gfx.decorations; // false en baja: solo núcleo, sin extras

  // Orienta el anillo sísmico tangente a la superficie del globo (normal radial).
  const ringQuat = useMemo(() => {
    const dir = toVector3(position).clone().normalize();
    return new THREE.Quaternion().setFromUnitVectors(UP_Z, dir);
  }, [position]);

  const coreMatRef = useRef();
  const ringRef = useRef();
  const ringMatRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const radarMode = useStore.getState().radarMode;

    // Pulso global de radar (todos los marcadores laten al unísono, nunca a 0).
    let radarIntensity = 1;
    if (radarMode) {
      const pulse = Math.pow(Math.sin(t * 2.0) * 0.5 + 0.5, 1.5);
      radarIntensity = 0.2 + pulse * 0.8;
    }

    // Flicker para incendios (ruido pseudo-aleatorio combinando dos senoidales).
    let flicker = 1;
    if (isFire) {
      flicker = 0.65 + Math.abs(Math.sin(t * 18) * Math.sin(t * 7.3)) * 0.6;
    }

    if (coreMatRef.current) {
      coreMatRef.current.emissiveIntensity =
        emissiveIntensity * flicker * (radarMode ? radarIntensity : 1);
    }

    // Onda sísmica: el anillo crece y se desvanece en bucle.
    if (isEarthquake && ringRef.current && ringMatRef.current) {
      const mag = eventData.mag || 2;
      const period = Math.max(1.6, 3.2 - mag * 0.15); // sismos fuertes pulsan más rápido
      const phase = (t % period) / period; // 0 -> 1
      const scale = 1 + phase * (1.5 + mag * 0.6);
      ringRef.current.scale.set(scale, scale, scale);
      ringMatRef.current.opacity = (1 - phase) * 0.9 * (radarMode ? radarIntensity : 1);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedEvent(eventData);
  };
  const handleOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    setIsHovered(true);
  };
  const handleOut = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
    setIsHovered(false);
  };

  const TypeIcon = TYPE_ICON[eventData.type] || Activity;

  return (
    <group position={position}>
      {/* Malla de telemetría (wireframe) — adorno secundario, no en baja calidad */}
      {decorations && (
        <mesh scale={1.7}>
          <sphereGeometry args={[size, wireSeg, wireSeg]} />
          <meshBasicMaterial
            color={color}
            wireframe
            transparent
            opacity={0.35}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Núcleo emisivo (color inyectado). Es la única malla en calidad baja. */}
      <mesh onClick={handleClick} onPointerOver={handleOver} onPointerOut={handleOut}>
        <sphereGeometry args={[size, sphereSeg, sphereSeg]} />
        <meshStandardMaterial
          ref={coreMatRef}
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          toneMapped={false}
        />
      </mesh>

      {/* Núcleo interno incandescente para volcanes — adorno, no en baja calidad */}
      {decorations && isVolcano && (
        <mesh>
          <sphereGeometry args={[size * 0.45, sphereSeg, sphereSeg]} />
          <meshStandardMaterial
            color={coreColor}
            emissive={coreColor}
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Onda sísmica expansiva (anillo) — adorno, no en baja calidad */}
      {decorations && isEarthquake && (
        <mesh ref={ringRef} quaternion={ringQuat}>
          <ringGeometry args={[size * 1.6, size * 1.9, ringSeg]} />
          <meshBasicMaterial
            ref={ringMatRef}
            color={color}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {(isHovered || isSelected) && (
        <Html zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-black/90 border border-white/25 rounded-none px-3 py-2 w-max transform -translate-x-1/2 -translate-y-full mb-4 pointer-events-none">
            <div className="flex items-center gap-2 mb-1.5">
              <TypeIcon size={14} strokeWidth={1.5} style={{ color }} />
              <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color }}>
                {TYPE_LABEL[eventData.type]}
              </span>
            </div>
            <div className="font-mono text-[10px] tracking-wider uppercase text-neutral-300 border-t border-white/10 pt-1.5 max-w-[260px] truncate">
              {eventData.title}
            </div>
            {isEarthquake && eventData.mag != null && (
              <div className="font-mono text-[10px] tracking-widest uppercase mt-1" style={{ color }}>
                MAG {eventData.mag}
              </div>
            )}
            <div className="font-mono text-[9px] tracking-widest uppercase text-neutral-500 mt-1">
              {new Date(eventData.date).toLocaleString()}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Memoizado: evita re-renders cuando cambian otras partes del estado global.
export default React.memo(EventMarker);
