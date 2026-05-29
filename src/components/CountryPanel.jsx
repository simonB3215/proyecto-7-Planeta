import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { latLngToVector3 } from '../utils/geoToVector3';

function getEventStyles(mag) {
  if (mag >= 6.0) return { border: 'border-red-600', text: 'text-red-500', bg: 'bg-red-950/20 hover:bg-red-900/40' };
  if (mag >= 4.5) return { border: 'border-orange-500', text: 'text-orange-400', bg: 'bg-orange-950/20 hover:bg-orange-900/40' };
  if (mag >= 2.5) return { border: 'border-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-950/20 hover:bg-yellow-900/30' };
  return { border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-950/20 hover:bg-emerald-900/30' };
}

export default function CountryPanel() {
  const selectedCountry = useStore(state => state.selectedCountry);
  const clearSelectedCountry = useStore(state => state.clearSelectedCountry);
  const earthquakes = useStore(state => state.earthquakes);
  const firmsFires = useStore(state => state.firmsFires);
  const eonetEvents = useStore(state => state.eonetEvents);
  const setSelectedEvent = useStore(state => state.setSelectedEvent);
  const timelineDate = useStore(state => state.timelineDate);

  // Estados para el arrastre (Drag & Drop)
  const [position, setPosition] = useState({ 
    x: window.innerWidth - 340, 
    y: 80 
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialPosX: 0, initialPosY: 0 });

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.initialPosX + dx,
        y: dragRef.current.initialPosY + dy
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const handlePointerDown = (e) => {
    // Evitar que el clic en el botón de cerrar inicie el drag
    if (e.target.tagName.toLowerCase() === 'button') return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: position.x,
      initialPosY: position.y
    };
  };

  if (!selectedCountry) return null;

  // Helpers para geolocalización de EE.UU.
  const isUS = (countryQuery) => countryQuery === "united states" || countryQuery === "usa";
  const checkUSBounds = (lng, lat) => {
    const inContiguousUS = lat >= 24 && lat <= 50 && lng >= -125 && lng <= -65;
    const inAlaska = lat >= 51 && lat <= 72 && lng >= -180 && lng <= -130;
    const inHawaii = lat >= 18 && lat <= 23 && lng >= -161 && lng <= -154;
    return inContiguousUS || inAlaska || inHawaii;
  };

  const countryQuery = selectedCountry.toLowerCase();

  // 1. Filtrar Terremotos
  const countryEarthquakes = earthquakes.filter(eq => {
    if (new Date(eq.properties.time).getTime() > timelineDate) return false;
    const place = eq.properties.place ? eq.properties.place.toLowerCase() : "";
    if (place.includes(countryQuery)) return true;
    if (isUS(countryQuery)) {
      const [lng, lat] = eq.geometry.coordinates;
      return checkUSBounds(lng, lat);
    }
    return false;
  }).map(eq => ({ ...eq, eventType: 'Earthquake', sortDate: new Date(eq.properties.time).getTime() }));

  // 2. Filtrar Tormentas (EONET)
  const countryStorms = eonetEvents.filter(ev => {
    if (!ev.geometries?.[0]) return false;
    if (new Date(ev.geometries[0].date).getTime() > timelineDate) return false;
    const title = ev.title ? ev.title.toLowerCase() : "";
    if (title.includes(countryQuery)) return true;
    if (isUS(countryQuery)) {
      let coords = ev.geometries[0].coordinates;
      while(Array.isArray(coords[0])) coords = coords[0];
      return checkUSBounds(coords[0], coords[1]);
    }
    return false;
  }).map(ev => ({ ...ev, eventType: 'Storm', sortDate: new Date(ev.geometries[0].date).getTime() }));

  // 3. Filtrar Incendios
  const countryFires = firmsFires.filter(fire => {
    if (!fire.latitude || !fire.longitude) return false;
    if (new Date(fire.acq_date).getTime() > timelineDate) return false;
    // FIRMS a veces no tiene un string de lugar claro que coincida, dependemos fuertemente del Bounding Box si es USA
    // O si usamos un servicio de geocodificación inverso (no disponible aquí). 
    // Por simplicidad, los incendios mundiales sin geocodificación de texto solo los mostraremos 
    // si el país seleccionado es USA usando el fallback geográfico.
    if (isUS(countryQuery)) {
      return checkUSBounds(parseFloat(fire.longitude), parseFloat(fire.latitude));
    }
    return false; // No podemos mapear incendios a países por texto fácilmente sin un geocoder
  }).map((fire, i) => ({ ...fire, id: `fire-${i}`, eventType: 'Fire', sortDate: new Date(fire.acq_date).getTime() }));

  // Combinar y ordenar por fecha (más reciente primero)
  const countryEvents = [...countryEarthquakes, ...countryStorms, ...countryFires].sort((a, b) => b.sortDate - a.sortDate);

  return (
    <div 
      className="absolute z-20 w-80 bg-slate-950/80 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[50vh]"
      style={{ left: position.x, top: position.y }}
    >
      <div 
        className="bg-slate-900/90 p-4 border-b border-slate-700 flex justify-between items-center shrink-0 cursor-move select-none"
        onPointerDown={handlePointerDown}
      >
        <div className="pointer-events-none">
          <h2 className="text-xl font-bold text-white tracking-wide">{selectedCountry}</h2>
          <p className="text-xs text-slate-400 tech-text mt-1">
            REGISTROS RECIENTES: <span className={countryEvents.length > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>{countryEvents.length}</span>
          </p>
        </div>
        <button 
          onClick={clearSelectedCountry}
          className="text-slate-400 hover:text-white transition-colors w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-lg z-10"
        >
          ✕
        </button>
      </div>

      <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-0 bg-slate-950/50">
        {countryEvents.length === 0 ? (
          <div className="text-sm text-slate-500 text-center py-6">
            No se detectó actividad sísmica reciente en esta región.
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
                    <span className={`${styles.text} font-bold text-xs tech-text`}>MAG {event.properties.mag}</span>
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
                    <span className="text-blue-400 font-bold text-xs tech-text uppercase">{event.categories[0]?.title || 'STORM'}</span>
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
                    <span className="text-red-500 font-bold text-xs tech-text uppercase">THERMAL ANOMALY</span>
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
    </div>
  );
}
