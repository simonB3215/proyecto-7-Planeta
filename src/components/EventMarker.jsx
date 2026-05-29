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
    </group>
  );
}
