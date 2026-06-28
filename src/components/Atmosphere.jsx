import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

// =============================================================================
// Atmósfera dinámica (shader Fresnel + término día/noche).
// - Reacciona a la dirección del Sol (world-space) y a la posición de la cámara.
// - Brillo en el hemisferio diurno, se desvanece a negro en la sombra nocturna.
// - Al rotar el planeta / mover la cámara, el resplandor se desplaza con fluidez.
// - BackSide + radio milimétrico: glow nítido SOLO en el borde del horizonte.
// - raycast desactivado: totalmente transparente a los eventos del puntero.
// =============================================================================

const vertexShader = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uSunDir;     // dirección al Sol (world-space, normalizada)
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    // cameraPosition es un uniform integrado de three.js (world-space).
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);

    // Rim de Fresnel: máximo en ángulos rasantes -> resplandor del horizonte.
    float rim = pow(1.0 - abs(dot(viewDir, vWorldNormal)), 2.5);

    // Término día/noche: cuánto mira el fragmento hacia el Sol.
    float day = smoothstep(-0.3, 0.5, dot(vWorldNormal, uSunDir));

    float alpha = rim * day * uIntensity;
    if (alpha < 0.002) discard; // negro absoluto en la sombra nocturna
    gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 1.0));
  }
`;

export default function Atmosphere({
  sunDirection,
  color = '#4ea8ff',
  scale = 1.015,
  intensity = 0.85,
  segments = 64,
}) {
  const matRef = useRef();

  // Uniforms creados una sola vez; se actualizan por referencia.
  const uniforms = useMemo(
    () => ({
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Actualiza la dirección del Sol cuando cambia (modo de luz / hora real).
  useEffect(() => {
    if (matRef.current && sunDirection) {
      matRef.current.uniforms.uSunDir.value.copy(sunDirection);
    }
  }, [sunDirection]);

  return (
    <mesh raycast={() => null} scale={scale}>
      <sphereGeometry args={[1, segments, segments]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}
