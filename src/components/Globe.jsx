import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import Markers from './Markers';
import CameraController from './CameraController';
import { geoContains } from 'd3-geo';
import CountryBorders from './CountryBorders';
import { useStore } from '../store/useStore';

export default function Globe() {
  const globeRef = useRef();
  const controlsRef = useRef();
  const timeoutRef = useRef();
  const [clickedCountry, setClickedCountry] = useState(null);
  
  const isRotating = useStore(state => state.isRotating);
  const lightingMode = useStore(state => state.lightingMode);
  const geoJsonData = useStore(state => state.geoJsonData);
  const lastMoveTimeRef = useRef(0);

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
  
  // Generar textura fotorealista del Sol por código (sin descargar imágenes extra)
  const sunTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Gradiente radial para simular un "Lens Flare" o destello óptico
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');     // Núcleo hiper-brillante
    gradient.addColorStop(0.1, 'rgba(255, 240, 180, 0.8)'); // Corona cálida
    gradient.addColorStop(0.4, 'rgba(255, 150, 50, 0.3)');  // Halo naranja esparcido
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');           // Bordes difuminados al vacío
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    
    return new THREE.CanvasTexture(canvas);
  }, []);

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

  const handlePointerMove = (e) => {
    e.stopPropagation();
    if (!e.uv || !geoJsonData || !geoJsonData.features) return;

    const now = Date.now();
    if (now - lastMoveTimeRef.current < 50) return; // 50ms throttle
    lastMoveTimeRef.current = now;

    let lat = (e.uv.y - 0.5) * 180;
    let lng = (e.uv.x - 0.5) * 360;

    const feature = geoJsonData.features.find(f => geoContains(f, [lng, lat]));

    if (feature) {
      const country = feature.properties.name || 'Unknown';
      const localPoint = globeRef.current.worldToLocal(e.point.clone());
      const hoverPos = localPoint.clone().normalize().multiplyScalar(1.05);

      setClickedCountry({ position: hoverPos, name: country });
      useStore.getState().setSelectedCountry(country);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setClickedCountry(null);
      }, 4000);
    } else {
      setClickedCountry(null);
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setClickedCountry(null);
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
        <mesh onPointerMove={handlePointerMove} onPointerOut={handlePointerOut}>
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
          <>
            <directionalLight 
              position={sunPosition} 
              intensity={4} 
            />
            
            {/* Sprite fotorealista del Sol (Glow Extendido) */}
            <sprite position={sunPosition} scale={[25, 25, 1]}>
              <spriteMaterial 
                map={sunTexture} 
                blending={THREE.AdditiveBlending}
                transparent={true}
                depthWrite={false}
              />
            </sprite>
            
            {/* Sprite fotorealista del Sol (Núcleo Intenso) */}
            <sprite position={sunPosition} scale={[8, 8, 1]}>
              <spriteMaterial 
                map={sunTexture} 
                blending={THREE.AdditiveBlending}
                transparent={true}
                depthWrite={false}
                opacity={0.8}
              />
            </sprite>
          </>
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
