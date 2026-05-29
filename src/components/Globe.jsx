import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Markers from './Markers';
import CameraController from './CameraController';

export default function Globe() {
  const globeRef = useRef();
  const controlsRef = useRef();
  
  // Usaremos texturas públicas de Three.js para la Tierra
  const [colorMap, bumpMap] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'
  ]);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <>
      <ambientLight intensity={3} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      
      <CameraController controlsRef={controlsRef} />
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={1.2}
        maxDistance={4}
        enableDamping={true}
        dampingFactor={0.05}
        autoRotate={false}
      />
      
      <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={0} />
      
      <group ref={globeRef} position={[0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial 
            map={colorMap}
            normalMap={bumpMap}
            metalness={0.1}
            roughness={0.7}
          />
        </mesh>

        {/* Halo Atmosférico */}
        <mesh>
          <sphereGeometry args={[1.02, 64, 64]} />
          <meshBasicMaterial 
            color="#4ea8ff" 
            transparent={true} 
            opacity={0.15} 
            side={THREE.BackSide} 
          />
        </mesh>
        
        {/* Marcadores de Eventos */}
        <Markers />
      </group>
    </>
  );
}
