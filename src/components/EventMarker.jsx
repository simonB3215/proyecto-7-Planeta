import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

export default function EventMarker({ position, color, size, eventData }) {
  const selectedEvent = useStore(state => state.selectedEvent);
  const setSelectedEvent = useStore(state => state.setSelectedEvent);
  const clearSelectedEvent = useStore(state => state.clearSelectedEvent);
  
  const waveRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  
  const isEarthquake = eventData.type === 'Earthquake';
  const isFire = eventData.type === 'Fire';
  const isSelected = selectedEvent?.id === eventData.id;

  useFrame((state, delta) => {
    if (isEarthquake && waveRef.current) {
      const mag = eventData.mag || 1;
      const speed = 1.0 + (mag * 0.2); // Sismos fuertes se expanden más rápido
      const maxScale = mag * 1.2; // Sismos fuertes tienen ondas más grandes
      
      waveRef.current.scale.x += delta * speed;
      waveRef.current.scale.y += delta * speed;
      waveRef.current.scale.z += delta * speed;
      waveRef.current.material.opacity -= delta * (speed / maxScale);
      
      if (waveRef.current.scale.x > maxScale) {
        waveRef.current.scale.set(1, 1, 1);
        waveRef.current.material.opacity = 0.8;
      }
    }
    
    if (isFire && waveRef.current) {
      // Simulación de calor/fuego latiendo
      const pulse = Math.sin(state.clock.elapsedTime * 5) * 0.5 + 0.5;
      waveRef.current.material.opacity = 0.3 + (pulse * 0.5);
      waveRef.current.scale.setScalar(1.2 + (pulse * 0.3));
    }
  });

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

  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedEvent(eventData);
  };

  return (
    <group position={position}>
      <mesh 
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      
      {(isEarthquake || isFire) && (
        <mesh ref={waveRef}>
          <sphereGeometry args={[size, 16, 16]} />
          {isEarthquake ? (
            <meshBasicMaterial 
              color={color} 
              wireframe={true} 
              transparent={true} 
              opacity={0.8} 
              depthWrite={false}
            />
          ) : (
            <meshBasicMaterial 
              color="#ffaa00" 
              transparent={true} 
              opacity={0.5} 
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          )}
        </mesh>
      )}

      {isHovered && (
        <Html zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-slate-700 w-max transform -translate-x-1/2 -translate-y-full mb-4 pointer-events-none transition-all">
            <div className="font-bold text-slate-200 mb-2 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-base">📍</span>
                <span>1 Evento Individual</span>
              </div>
              <div className="flex items-center gap-2 border-t border-slate-700 pt-2 mt-1 text-sm">
                {isFire && <span className="text-red-500 text-base">🔥</span>}
                {isEarthquake && <span className="text-orange-500 text-base">⚡</span>}
                {eventData.type === 'Storm' && <span className="text-blue-500 text-base">🌪️</span>}
                <span className="truncate max-w-[250px] block">{eventData.title}</span>
              </div>
            </div>
            
            {isEarthquake && (
              <div className="text-xs text-orange-400 font-bold mb-1">
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
