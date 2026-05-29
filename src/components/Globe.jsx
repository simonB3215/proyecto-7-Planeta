import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Markers from './Markers';

export default function Globe() {
  const globeRef = useRef();
  
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
      
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minDistance={1.2}
        maxDistance={5}
        autoRotate={false}
      />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <group ref={globeRef}>
        <mesh>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial 
            map={colorMap}
            normalMap={bumpMap}
            metalness={0.1}
            roughness={0.7}
          />
        </mesh>
        
        {/* Marcadores de Eventos */}
        <Markers />
      </group>
    </>
  );
}
