import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { latLngToVector3 } from '../utils/geoToVector3';
import { geoContains } from 'd3-geo';

function getEventStyles(mag) {
  return { border: 'border-orange-500', text: 'text-orange-400', bg: 'bg-orange-950/20 hover:bg-orange-900/40' };
}

// Helpers para geolocalización de EE.UU.
const isUS = (countryQuery) => countryQuery === "united states" || countryQuery === "usa";
const checkUSBounds = (lng, lat) => {
  const inContiguousUS = lat >= 24 && lat <= 50 && lng >= -125 && lng <= -65;
  const inAlaska = lat >= 51 && lat <= 72 && lng >= -180 && lng <= -130;
  const inHawaii = lat >= 18 && lat <= 23 && lng >= -161 && lng <= -154;
  return inContiguousUS || inAlaska || inHawaii;
};

export default function CountryPanel() {
  const selectedCountry = useStore(state => state.selectedCountry);
  const clearSelectedCountry = useStore(state => state.clearSelectedCountry);
  const earthquakes = useStore(state => state.earthquakes);
  const firmsFires = useStore(state => state.firmsFires);
  const eonetEvents = useStore(state => state.eonetEvents);
  const setSelectedEvent = useStore(state => state.setSelectedEvent);
  const timelineDate = useStore(state => state.timelineDate);
  const geoJsonData = useStore(state => state.geoJsonData);

  const [isExpanded, setIsExpanded] = useState(true);

  const countryEvents = useMemo(() => {
    if (!selectedCountry) return [];
    
    const countryQuery = selectedCountry.toLowerCase();
    const countryFeature = geoJsonData?.features?.find(f => f.properties.name?.toLowerCase() === countryQuery);

    // 1. Filtrar Terremotos
    const countryEarthquakes = earthquakes.filter(eq => {
      if (new Date(eq.properties.time).getTime() > timelineDate) return false;
      const [lng, lat] = eq.geometry.coordinates;

      if (countryFeature && geoContains(countryFeature, [lng, lat])) return true;

      const place = eq.properties.place ? eq.properties.place.toLowerCase() : "";
      if (place.includes(countryQuery)) return true;
      if (isUS(countryQuery)) {
        return checkUSBounds(lng, lat);
      }
      return false;
    }).map(eq => ({ ...eq, eventType: 'Earthquake', sortDate: new Date(eq.properties.time).getTime() }));

    // 2. Filtrar Tormentas (EONET)
    const countryStorms = eonetEvents.filter(ev => {
      if (!ev.geometries?.[0]) return false;
      if (new Date(ev.geometries[0].date).getTime() > timelineDate) return false;
      
      let coords = ev.geometries[0].coordinates;
      while(Array.isArray(coords[0])) coords = coords[0];
      const lng = coords[0];
      const lat = coords[1];

      if (countryFeature && geoContains(countryFeature, [lng, lat])) return true;

      const title = ev.title ? ev.title.toLowerCase() : "";
      if (title.includes(countryQuery)) return true;
      if (isUS(countryQuery)) {
        return checkUSBounds(lng, lat);
      }
      return false;
    }).map(ev => ({ ...ev, eventType: 'Storm', sortDate: new Date(ev.geometries[0].date).getTime() }));

    // 3. Filtrar Incendios
    const countryFires = firmsFires.filter(fire => {
      if (!fire.latitude || !fire.longitude) return false;
      if (new Date(fire.acq_date).getTime() > timelineDate) return false;
      
      const lat = parseFloat(fire.latitude);
      const lng = parseFloat(fire.longitude);

      if (countryFeature) {
        return geoContains(countryFeature, [lng, lat]);
      } else if (isUS(countryQuery)) {
        return checkUSBounds(lng, lat);
      }
      return false;
    }).map((fire, i) => ({ ...fire, id: `fire-${i}`, eventType: 'Fire', sortDate: new Date(fire.acq_date).getTime() }));

    // Combinar y ordenar por fecha (más reciente primero)
    return [...countryEarthquakes, ...countryStorms, ...countryFires].sort((a, b) => b.sortDate - a.sortDate);
  }, [selectedCountry, earthquakes, eonetEvents, firmsFires, timelineDate, geoJsonData]);

  if (!selectedCountry) return null;

  return (
    <div 
      className={`w-80 bg-slate-950/80 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col transition-all duration-300 shrink-0 ${isExpanded ? 'max-h-[50vh]' : 'max-h-[85px]'}`}
    >
      <div 
        className="bg-slate-900/90 p-4 border-b border-slate-700 flex justify-between items-center shrink-0 select-none h-[85px]"
      >
        <div className="pointer-events-none">
          <h2 className="text-xl font-bold text-slate-100 tracking-wide">{selectedCountry}</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Registros recientes: <span className={countryEvents.length > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>{countryEvents.length}</span>
          </p>
        </div>
        <div className="flex gap-1 z-10">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white transition-colors w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-lg"
            title={isExpanded ? "Minimizar" : "Expandir"}
          >
            {isExpanded ? '−' : '＋'}
          </button>
          <button 
            onClick={clearSelectedCountry}
            className="text-slate-400 hover:text-white transition-colors w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-lg"
            title="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>

      {isExpanded && (

      <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-0 bg-slate-950/50">
        {countryEvents.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-6">
            No se detectaron eventos recientes en esta región.
          </div>
        ) : (
          countryEvents.map(event => {
            if (event.eventType === 'Earthquake') {
              const styles = getEventStyles(event.properties.mag || 0);
              return (
                <div 
                  key={event.id}
                  onClick={() => {
                    const [lng, lat] = event.geometry.coordinates;
                    const pos = latLngToVector3(parseFloat(lat), parseFloat(lng), 1.01);
                    setSelectedEvent({ 
                      id: event.id, type: 'Earthquake', title: event.properties.place, 
                      date: event.properties.time, mag: event.properties.mag, pos 
                    });
                  }}
                  className={`group border-l-4 ${styles.border} ${styles.bg} rounded-r-lg p-3 cursor-pointer transition-all mb-2`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`${styles.text} font-bold text-xs`}>Mag. {event.properties.mag}</span>
                    <span className="text-slate-500 text-[10px]">
                      {new Date(event.properties.time).toLocaleDateString()} {new Date(event.properties.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 truncate mt-2" title={event.properties.place}>
                    {event.properties.place}
                  </p>
                </div>
              );
            }
            
            if (event.eventType === 'Storm') {
              return (
                <div 
                  key={event.id}
                  onClick={() => {
                    let coords = event.geometries[0].coordinates;
                    while(Array.isArray(coords[0])) coords = coords[0];
                    const pos = latLngToVector3(parseFloat(coords[1]), parseFloat(coords[0]), 1.01);
                    setSelectedEvent({ 
                      id: event.id, type: 'Storm', title: event.title, 
                      date: event.geometries[0].date, pos 
                    });
                  }}
                  className="group border-l-4 border-blue-500 bg-blue-950/20 hover:bg-blue-900/30 rounded-r-lg p-3 cursor-pointer transition-all mb-2"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-blue-400 font-bold text-xs">{event.categories[0]?.title || 'Tormenta'}</span>
                    <span className="text-slate-500 text-[10px]">
                      {new Date(event.geometries[0].date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 truncate mt-2" title={event.title}>
                    {event.title}
                  </p>
                </div>
              );
            }

            if (event.eventType === 'Fire') {
              return (
                <div 
                  key={event.id}
                  onClick={() => {
                    const pos = latLngToVector3(parseFloat(event.latitude), parseFloat(event.longitude), 1.01);
                    setSelectedEvent({ 
                      id: event.id, type: 'Fire', title: 'Thermal Anomaly / Fire', 
                      date: event.acq_date, pos 
                    });
                  }}
                  className="group border-l-4 border-red-500 bg-red-950/20 hover:bg-red-900/30 rounded-r-lg p-3 cursor-pointer transition-all mb-2"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-red-500 font-bold text-xs">Anomalía Térmica</span>
                    <span className="text-slate-500 text-[10px]">
                      {new Date(event.acq_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 truncate mt-2" title="Detected Fire">
                    Lat: {parseFloat(event.latitude).toFixed(2)}, Lng: {parseFloat(event.longitude).toFixed(2)}
                  </p>
                </div>
              );
            }

            return null;
          })
        )}
      </div>
      )}
    </div>
  );
}
