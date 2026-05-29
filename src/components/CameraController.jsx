import { useFrame, useThree } from '@react-three/fiber';
import { useStore } from '../store/useStore';
import * as THREE from 'three';

export default function CameraController({ controlsRef }) {
  const selectedEvent = useStore(state => state.selectedEvent);
  const { camera } = useThree();

  useFrame(() => {
    if (selectedEvent && selectedEvent.pos) {
      const targetPos = selectedEvent.pos;
      
      // Calculate a position slightly further away on the same vector
      const camPos = targetPos.clone().normalize().multiplyScalar(2.8);
      
      // Lerp camera position
      camera.position.lerp(camPos, 0.05);
      
      if (controlsRef.current) {
        // Lerp OrbitControls target to the marker position
        controlsRef.current.target.lerp(targetPos, 0.05);
        controlsRef.current.update();
      }
    } else {
      // If nothing is selected, gracefully return target to center
      if (controlsRef.current) {
        controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
        controlsRef.current.update();
      }
    }
  });

  return null;
}
