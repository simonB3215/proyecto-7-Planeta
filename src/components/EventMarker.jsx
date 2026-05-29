import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

export default function EventMarker({ position, color, size, eventData }) {
  const selectedEvent = useStore(state => state.selectedEvent);
  const setSelectedEvent = useStore(state => state.setSelectedEvent);
  const clearSelectedEvent = useStore(state => state.clearSelectedEvent);
  
  const waveRef = useRef();
  
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
    </group>
  );
}
