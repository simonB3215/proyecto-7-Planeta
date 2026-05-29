import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';

export default function CameraController({ controlsRef }) {
  const selectedEvent = useStore(state => state.selectedEvent);
  const { camera } = useThree();
  const isFlying = useRef(false);
  const targetCamPos = useRef(new THREE.Vector3());

  // Cuando se selecciona un nuevo evento, calculamos su posición y activamos el vuelo
  useEffect(() => {
    if (selectedEvent && selectedEvent.pos) {
      // Mantenemos la distancia actual de la cámara para no forzar un zoom incómodo
      const currentDist = camera.position.length();
      const dist = Math.max(1.5, Math.min(currentDist, 4)); // clamp entre min y max distance
      
      targetCamPos.current.copy(selectedEvent.pos).normalize().multiplyScalar(dist);
      isFlying.current = true;
    }
  }, [selectedEvent, camera]);

  // Si el usuario toca el globo para moverlo manualmente, abortamos el vuelo automático
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
    if (isFlying.current) {
      // Lerp camera position towards the marker
      camera.position.lerp(targetCamPos.current, 0.05);
      
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }

      // Detener el vuelo cuando esté suficientemente cerca
      if (camera.position.distanceTo(targetCamPos.current) < 0.05) {
        isFlying.current = false;
      }
    }
  });

  return null;
}
