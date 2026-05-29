import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

export default function EventMarker({ position, color, size, eventData }) {
  const selectedEvent = useStore(state => state.selectedEvent);
  const setSelectedEvent = useStore(state => state.setSelectedEvent);
  const clearSelectedEvent = useStore(state => state.clearSelectedEvent);
  
  const waveRef = useRef();
  
  const isEarthquake = eventData.type === 'Earthquake';
  const isSelected = selectedEvent?.id === eventData.id;

  useFrame((state, delta) => {
    if (isEarthquake && waveRef.current) {
      waveRef.current.scale.x += delta * 1.5;
      waveRef.current.scale.y += delta * 1.5;
      waveRef.current.scale.z += delta * 1.5;
      waveRef.current.material.opacity -= delta * 0.8;
      
      if (waveRef.current.scale.x > 3) {
        waveRef.current.scale.set(1, 1, 1);
        waveRef.current.material.opacity = 0.8;
      }
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
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
      
      {isEarthquake && (
        <mesh ref={waveRef}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial 
            color={color} 
            wireframe={true} 
            transparent={true} 
            opacity={0.8} 
          />
        </mesh>
      )}

      {isSelected && (
        <Html transform sprite distanceFactor={1.5} position={[0, 0, 0]} zIndexRange={[100, 0]} occlude>
          <div className="bg-gray-900/80 backdrop-blur-md border border-orange-500/50 p-3 rounded-lg text-white font-mono text-xs w-64 pointer-events-auto shadow-2xl">
            <div className="flex justify-between items-start border-b border-gray-800 pb-2 mb-2">
              <h3 className="text-yellow-500 font-bold tracking-widest text-sm">{eventData.type.toUpperCase()}</h3>
              <button 
                onClick={(e) => { e.stopPropagation(); clearSelectedEvent(); }} 
                className="text-gray-500 hover:text-white transition-colors text-xs"
              >
                X
              </button>
            </div>
            <div className="text-gray-300 mb-2 truncate" title={eventData.title}>{eventData.title}</div>
            {eventData.date && <div className="text-gray-500 text-[10px]">TIME: {new Date(eventData.date).toLocaleString()}</div>}
            {eventData.mag && <div className="text-orange-400 font-bold mt-1 text-sm">MAG: {eventData.mag}</div>}
          </div>
        </Html>
      )}
    </group>
  );
}
