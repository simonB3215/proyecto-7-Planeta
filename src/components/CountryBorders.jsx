import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';

const CountryBorders = React.memo(() => {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => {
        setGeoData(data);
        useStore.getState().setGeoJsonData(data);
      })
      .catch((err) => console.error("Error loading country borders:", err));
  }, []);

  const positions = useMemo(() => {
    if (!geoData || !geoData.features || !Array.isArray(geoData.features)) return null;

    try {
      const vertices = [];
      const radius = 1.001; 

      const pushVertex = (lat, lng) => {
        if (typeof lat !== 'number' || typeof lng !== 'number') return;
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = (radius * Math.sin(phi) * Math.sin(theta));
        const y = (radius * Math.cos(phi));

        vertices.push(x, y, z);
      };

      geoData.features.forEach((feature) => {
        if (!feature || !feature.geometry || !Array.isArray(feature.geometry.coordinates)) return;
        const { type, coordinates } = feature.geometry;

        const processPolygon = (polygon) => {
          if (!Array.isArray(polygon)) return;
          const ring = polygon[0];
          if (!Array.isArray(ring)) return;
          
          for (let i = 0; i < ring.length - 1; i++) {
            const point1 = ring[i];
            const point2 = ring[i + 1];
            if (!Array.isArray(point1) || !Array.isArray(point2)) continue;

            const [lng1, lat1] = point1;
            const [lng2, lat2] = point2;

            if (Math.abs(lng1 - lng2) > 180) continue;

            pushVertex(lat1, lng1);
            pushVertex(lat2, lng2);
          }
        };

        if (type === 'Polygon') {
          processPolygon(coordinates);
        } else if (type === 'MultiPolygon') {
          coordinates.forEach(processPolygon);
        }
      });

      return new Float32Array(vertices);
    } catch (e) {
      console.error("GeoJSON parse error", e);
      return null;
    }
  }, [geoData]);

  if (!positions || positions.length === 0) return null;

  return (
    <lineSegments 
      raycast={() => null}
      castShadow={false}
      receiveShadow={false}
    >
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={positions.length / 3} 
          array={positions} 
          itemSize={3} 
        />
      </bufferGeometry>
      <lineBasicMaterial 
        color="#ffcc00" 
        transparent={true} 
        opacity={0.3} 
      />
    </lineSegments>
  );
});

export default CountryBorders;
