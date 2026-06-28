import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import { useEffect, useRef } from 'react';

export default function CameraController({ controlsRef, globeRef }) {
  const selectedEvent = useStore(state => state.selectedEvent);
  const { camera } = useThree();
  const isFlying = useRef(false);
  const targetDist = useRef(2.8);

  // Cuando se selecciona un nuevo evento, guardamos la distancia deseada y activamos el vuelo
  useEffect(() => {
    if (selectedEvent && selectedEvent.pos) {
      const currentDist = camera.position.length();
      targetDist.current = Math.max(1.5, Math.min(currentDist, 4));
      isFlying.current = true;
    }
  }, [selectedEvent, camera]);

  // Si el usuario interactúa manualmente, cancelamos el vuelo automático
  useEffect(() => {
    const controls = controlsRef.current;
    const onInteract = () => { isFlying.current = false; };
    
    if (controls) {
      controls.addEventListener('start', onInteract);
    }
    return () => {
      if (controls) controls.removeEventListener('start', onInteract);
    };
  }, [controlsRef]);

  useFrame(() => {
    if (isFlying.current && globeRef.current && selectedEvent?.pos) {
      // 1. Tomar la posición local estática del evento
      const localPos = selectedEvent.pos.clone();
      
      // 2. Aplicar la rotación ACTUAL de la Tierra para obtener la posición real en el mundo 3D
      const worldPos = localPos.applyEuler(globeRef.current.rotation);
      
      // 3. Proyectar el vector a la distancia deseada de la cámara
      const camPos = worldPos.normalize().multiplyScalar(targetDist.current);
      
      // 4. Volar suavemente hacia esa posición en el mundo
      camera.position.lerp(camPos, 0.05);
      
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }

      // 5. Detener el vuelo cuando esté suficientemente cerca
      if (camera.position.distanceTo(camPos) < 0.05) {
        isFlying.current = false;
      }
    }
  });

  return null;
}
