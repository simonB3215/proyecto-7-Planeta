import { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import Markers from './Markers';
import CameraController from './CameraController';
import CountryBorders from './CountryBorders';

export default function Globe() {
  const globeRef = useRef();
  const controlsRef = useRef();
  const timeoutRef = useRef();
  const pointerDownRef = useRef({ x: 0, y: 0 });
  const [clickedCountry, setClickedCountry] = useState(null);
  
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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    pointerDownRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = async (e) => {
    e.stopPropagation();
    if (!e.uv) return;

    // Diferenciar arrastre de clic
    const dx = Math.abs(e.clientX - pointerDownRef.current.x);
    const dy = Math.abs(e.clientY - pointerDownRef.current.y);
    if (dx > 3 || dy > 3) return; // Fue un drag (rotación), no ejecutar fetch

    // Convertir el punto de clic mundial a coordenadas locales dentro del grupo en rotación
    const localPoint = globeRef.current.worldToLocal(e.point.clone());
    
    // Multiplicador Z-Fighting: separarlo un 5% de la superficie (radio 1.0 -> 1.05)
    const hoverPos = localPoint.clone().normalize().multiplyScalar(1.05);

    // Mapeo inverso matemático usando las coordenadas UV
    let lat = (e.uv.y - 0.5) * 180;
    let lng = (e.uv.x - 0.5) * 360;
    lng = -lng; 

    setClickedCountry({ position: hoverPos, name: 'Buscando...' });

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      const country = data.address?.country || 'Océano';
      
      setClickedCountry({ position: hoverPos, name: country });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setClickedCountry(null);
      }, 4000);
    } catch (err) {
      setClickedCountry(null);
    }
  };

  return (
    <>
      <ambientLight intensity={3} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      
      <CameraController controlsRef={controlsRef} globeRef={globeRef} />
      
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
        <mesh onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial 
            map={colorMap}
            normalMap={bumpMap}
            metalness={0.1}
            roughness={0.7}
          />
        </mesh>

        {/* Fronteras del mundo (Mesh de Líneas) */}
        <CountryBorders />

        {/* País Seleccionado (3D Text) */}
        {clickedCountry && (
          <Billboard position={clickedCountry.position}>
            <Text 
              raycast={() => null}
              fontSize={0.08} 
              color="white" 
              anchorX="center" 
              anchorY="middle"
              outlineWidth={0.015}
              outlineColor="black"
            >
              {clickedCountry.name}
            </Text>
          </Billboard>
        )}

        {/* Halo Atmosférico */}
        <mesh raycast={() => null}>
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
