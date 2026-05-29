import React from 'react';
import { useStore } from '../store/useStore';

export default function EventMarker({ position, color, size, eventData }) {
  const { setSelectedEvent } = useStore();

  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    document.body.style.cursor = 'default';
  };

  const handleClick = (e) => {
    e.stopPropagation(); // Prevenir clic en el globo
    setSelectedEvent(eventData);
  };

  return (
    <mesh 
      position={position} 
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}
