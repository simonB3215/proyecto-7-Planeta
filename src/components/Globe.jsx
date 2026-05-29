import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import Markers from './Markers';
import CameraController from './CameraController';
import CountryBorders from './CountryBorders';
import { useStore } from '../store/useStore';

export default function Globe() {
  const globeRef = useRef();
  const controlsRef = useRef();
  const timeoutRef = useRef();
  const pointerDownRef = useRef({ x: 0, y: 0 });
  const [clickedCountry, setClickedCountry] = useState(null);
  
  const isRotating = useStore(state => state.isRotating);
  const lightingMode = useStore(state => state.lightingMode);

  // Calcular la posición del sol en tiempo real (basado en UTC)
  const sunPosition = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const declination = -23.44 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));
    
    const timeInHours = now.getUTCHours() + now.getUTCMinutes() / 60;
    const longitude = (12 - timeInHours) * 15;
    
    const radius = 20;
    const phi = (90 - declination) * (Math.PI / 180);
    const theta = (longitude + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    
    return [x, y, z];
  }, [lightingMode]); // Recalcular solo cuando se cambia el modo para actualizar la luz
  
  // Usaremos texturas públicas de Three.js para la Tierra y Nubes
  const [colorMap, bumpMap, cloudMap, nightMap] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png'
  ]);

  useFrame(() => {
    if (globeRef.current && isRotating) {
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

    setClickedCountry({ position: hoverPos, name: 'Buscando...' });

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`);
      const data = await res.json();
      const country = data.address?.country || 'Ocean';
      
      setClickedCountry({ position: hoverPos, name: country });
      
      // Enviar el país al panel interactivo 2D si es válido
      if (country !== 'Ocean') {
        useStore.getState().setSelectedCountry(country);
      }

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
      <ambientLight intensity={lightingMode === 'full' ? 3 : 0.03} />
      
      {/* Luz global cuando está en Full (no rota con la Tierra) */}
      {lightingMode === 'full' && (
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
      )}
      
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
            emissiveMap={nightMap}
            emissive="#ffeba6"
            emissiveIntensity={lightingMode === 'realtime' ? 2 : 0}
            metalness={0.1}
            roughness={0.7}
          />
        </mesh>

        {/* Luz direccional anclada a la rotación geográfica del globo (Tiempo Real) */}
        {lightingMode === 'realtime' && (
          <directionalLight 
            position={sunPosition} 
            intensity={4} 
          />
        )}

        {/* Capa de Nubes (Estética) */}
        <mesh raycast={() => null}>
          <sphereGeometry args={[1.006, 64, 64]} />
          <meshPhongMaterial 
            map={cloudMap}
            transparent={true}
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Fronteras del mundo (Mesh de Líneas) */}
        <CountryBorders />

        {/* País Seleccionado (3D Text) */}
        {clickedCountry && (
          <Billboard position={clickedCountry.position}>
            <Text 
              raycast={() => null}
              fontSize={0.035} 
              letterSpacing={0.15}
              color="#ffffff" 
              anchorX="center" 
              anchorY="middle"
              outlineWidth={0.006}
              outlineColor="#000000"
              fillOpacity={0.9}
            >
              {clickedCountry.name.toUpperCase()}
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
