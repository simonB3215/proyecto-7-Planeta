import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Flame, Mountain, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';
import { EVENT_TYPES } from '../utils/palette';

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
      {/* Halo / glow aditivo */}
      <mesh scale={1.5}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Núcleo emisivo (color inyectado) */}
      <mesh onClick={handleClick} onPointerOver={handleOver} onPointerOut={handleOut}>
        <sphereGeometry args={[size, 20, 20]} />
        <meshStandardMaterial
          ref={coreMatRef}
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          toneMapped={false}
        />
      </mesh>

      {/* Núcleo interno incandescente para volcanes (coreColor inyectado) */}
      {isVolcano && (
        <mesh>
          <sphereGeometry args={[size * 0.45, 16, 16]} />
          <meshStandardMaterial
            color={coreColor}
            emissive={coreColor}
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Onda sísmica expansiva (anillo tangente a la superficie) */}
      {isEarthquake && (
        <mesh ref={ringRef} quaternion={ringQuat}>
          <ringGeometry args={[size * 1.6, size * 2.1, 48]} />
          <meshBasicMaterial
            ref={ringMatRef}
            color={color}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}

      {(isHovered || isSelected) && (
        <Html zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-slate-950/60 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10 w-max transform -translate-x-1/2 -translate-y-full mb-4 pointer-events-none transition-all">
            <div className="font-bold text-slate-200 mb-2 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <TypeIcon size={16} style={{ color }} />
                <span style={{ color }}>{TYPE_LABEL[eventData.type]}</span>
              </div>
              <div className="flex items-center gap-2 border-t border-white/10 pt-2 mt-1 text-sm">
                <span className="truncate max-w-[250px] block">{eventData.title}</span>
              </div>
            </div>

            {isEarthquake && eventData.mag != null && (
              <div className="text-xs font-bold mb-1" style={{ color }}>
                Magnitud: {eventData.mag}
              </div>
            )}

            <div className="text-[11px] text-slate-400 mt-2">
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
