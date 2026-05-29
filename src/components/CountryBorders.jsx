import { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { latLngToVector3 } from '../utils/geoToVector3';

export default function CountryBorders() {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("Error loading country borders:", err));
  }, []);

  const lineGeometry = useMemo(() => {
    if (!geoData) return null;

    const points = [];
    const radius = 1.001; // Ligeramente por encima de la superficie (1.0) para evitar z-fighting

    geoData.features.forEach((feature) => {
      if (!feature.geometry) return;

      const { type, coordinates } = feature.geometry;

      const processPolygon = (polygon) => {
        // En GeoJSON, el primer anillo es el exterior.
        const ring = polygon[0];
        for (let i = 0; i < ring.length - 1; i++) {
          const [lng1, lat1] = ring[i];
          const [lng2, lat2] = ring[i + 1];

          // Evitar líneas horizontales largas que cruzan el mapa (artefactos del meridiano 180)
          if (Math.abs(lng1 - lng2) > 180) continue;

          points.push(latLngToVector3(lat1, lng1, radius));
          points.push(latLngToVector3(lat2, lng2, radius));
        }
      };

      if (type === 'Polygon') {
        processPolygon(coordinates);
      } else if (type === 'MultiPolygon') {
        coordinates.forEach(processPolygon);
      }
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [geoData]);

  if (!lineGeometry) return null;

  return (
    <lineSegments geometry={lineGeometry} raycast={() => null}>
      <lineBasicMaterial 
        color="#ffcc00" 
        transparent={true} 
        opacity={0.3} 
        linewidth={1} 
      />
    </lineSegments>
  );
}
