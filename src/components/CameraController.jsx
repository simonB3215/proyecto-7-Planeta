import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import { useEffect, useRef } from 'react';

export default function CameraController({ controlsRef, globeRef, cancelFlyRef }) {
  const selectedEvent = useStore(state => state.selectedEvent);
  const { camera } = useThree();
  const isFlying = useRef(false);
  const targetDist = useRef(2.8);

  // Al seleccionar un nuevo evento: guardamos la distancia y activamos el vuelo.
  useEffect(() => {
    if (selectedEvent && selectedEvent.pos) {
      const currentDist = camera.position.length();
      targetDist.current = Math.max(1.5, Math.min(currentDist, 4));
      isFlying.current = true;
    }
  }, [selectedEvent, camera]);

  // Exponemos la cancelación del vuelo. OrbitControls la invoca vía su prop `onStart`
  // (drei la conecta de forma fiable), de modo que en cuanto el usuario empieza a
  // arrastrar, el vuelo automático se detiene y NO pelea con la interacción manual.
  useEffect(() => {
    if (!cancelFlyRef) return undefined;
    cancelFlyRef.current = () => { isFlying.current = false; };
    return () => { cancelFlyRef.current = null; };
  }, [cancelFlyRef]);

  useFrame(() => {
    if (!isFlying.current || !globeRef.current || !selectedEvent?.pos) return;

    // Posición local del evento -> mundo (aplicando la rotación actual del globo).
    const worldPos = selectedEvent.pos.clone().applyEuler(globeRef.current.rotation);
    const camPos = worldPos.normalize().multiplyScalar(targetDist.current);

    camera.position.lerp(camPos, 0.08);

    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }

    // Detener el vuelo al llegar suficientemente cerca.
    if (camera.position.distanceTo(camPos) < 0.05) {
      isFlying.current = false;
    }
  });

  return null;
}
