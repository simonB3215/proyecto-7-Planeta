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

  // Filtrar terremotos que ocurrieron en este país (respetando la línea de tiempo)
  const countryEvents = earthquakes.filter(eq => {
    if (new Date(eq.properties.time).getTime() > timelineDate) return false;
    
    const place = eq.properties.place ? eq.properties.place.toLowerCase() : "";
    const countryQuery = selectedCountry.toLowerCase();
    
    if (place.includes(countryQuery)) return true;
    
    // Parche especial para Estados Unidos, ya que el USGS usa nombres/abreviaturas de estados
    // en lugar de escribir "United States" explícitamente en el campo 'place'.
    if (countryQuery === "united states" || countryQuery === "usa") {
      const [lng, lat] = eq.geometry.coordinates;
      const inContiguousUS = lat >= 24 && lat <= 50 && lng >= -125 && lng <= -65;
      const inAlaska = lat >= 51 && lat <= 72 && lng >= -180 && lng <= -130;
      const inHawaii = lat >= 18 && lat <= 23 && lng >= -161 && lng <= -154;
      
      if (inContiguousUS || inAlaska || inHawaii) return true;
    }
    
    return false;
  });

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
          countryEvents.map(eq => {
            const styles = getEventStyles(eq.properties.mag || 0);
            return (
              <div 
                key={eq.id}
                onClick={() => {
                  const [lng, lat] = eq.geometry.coordinates;
                  const pos = latLngToVector3(parseFloat(lat), parseFloat(lng), 1.01);
                  setSelectedEvent({ 
                    id: eq.id, 
                    type: 'Earthquake', 
                    title: eq.properties.place, 
                    date: eq.properties.time, 
                    mag: eq.properties.mag, 
                    pos 
                  });
                }}
                className={`group border-l-4 ${styles.border} ${styles.bg} rounded-r-lg p-3 cursor-pointer transition-all mb-2`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`${styles.text} font-bold text-xs tech-text`}>MAG {eq.properties.mag}</span>
                  <span className="text-slate-500 text-[10px]">
                    {new Date(eq.properties.time).toLocaleDateString()} {new Date(eq.properties.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-sm text-slate-300 truncate mt-2" title={eq.properties.place}>
                  {eq.properties.place}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
