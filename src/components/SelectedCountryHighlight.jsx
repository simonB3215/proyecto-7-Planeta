import { useMemo } from 'react';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { getCountryFeature } from '../utils/countryFilter';

// Por encima de las fronteras base (1.001) y por debajo de los marcadores (1.01).
const RADIUS = 1.004;

/**
 * Resalta el país seleccionado COMPLETO: dibuja todos los anillos de su geometría
 * (Polygon / MultiPolygon) como líneas brillantes con glow aditivo (se beneficia del
 * Bloom para un look LED/HUD). Se monta dentro del grupo del globo para rotar con él.
 */
export default function SelectedCountryHighlight() {
  const selectedCountry = useStore((s) => s.selectedCountry);
  const geoJsonData = useStore((s) => s.geoJsonData);

  const positions = useMemo(() => {
    const feature = getCountryFeature(selectedCountry, geoJsonData);
    if (!feature?.geometry) return null;

    const vertices = [];
    const pushVertex = (lat, lng) => {
      if (typeof lat !== 'number' || typeof lng !== 'number') return;
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      vertices.push(
        -(RADIUS * Math.sin(phi) * Math.cos(theta)),
        RADIUS * Math.cos(phi),
        RADIUS * Math.sin(phi) * Math.sin(theta)
      );
    };

    const processPolygon = (polygon) => {
      if (!Array.isArray(polygon)) return;
      polygon.forEach((ring) => {
        if (!Array.isArray(ring)) return;
        for (let i = 0; i < ring.length - 1; i++) {
          const p1 = ring[i];
          const p2 = ring[i + 1];
          if (!Array.isArray(p1) || !Array.isArray(p2)) continue;
          const [lng1, lat1] = p1;
          const [lng2, lat2] = p2;
          if (Math.abs(lng1 - lng2) > 180) continue; // salta el antimeridiano
          pushVertex(lat1, lng1);
          pushVertex(lat2, lng2);
        }
      });
    };

    const { type, coordinates } = feature.geometry;
    if (type === 'Polygon') processPolygon(coordinates);
    else if (type === 'MultiPolygon') coordinates.forEach(processPolygon);

    return vertices.length ? new Float32Array(vertices) : null;
  }, [selectedCountry, geoJsonData]);

  if (!positions) return null;

  return (
    // key por país: remonta la geometría al cambiar de selección (buffer fresco).
    <lineSegments key={selectedCountry} raycast={() => null}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#22d3ee"
        transparent
        opacity={0.95}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}
