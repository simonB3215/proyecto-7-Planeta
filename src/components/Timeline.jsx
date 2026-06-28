import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';

export default function Timeline() {
  const { timelineDate, setTimelineDate, isPlaying, togglePlaying } = useStore();

  // "Ahora" se fija al montar (Date.now() es impuro y no debe llamarse en render).
  const [maxDate] = useState(() => Date.now());
  // Asumimos un historial de 30 días para los datos (típico de USGS y FIRMS)
  const minDate = maxDate - (30 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineDate(useStore.getState().timelineDate + (60 * 60 * 1000 * 6)); // Avanza 6 horas por tick
        if (useStore.getState().timelineDate > maxDate) {
          useStore.getState().togglePlaying(); // Auto pause at end
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, maxDate, setTimelineDate]);

  const handleSliderChange = (e) => {
    setTimelineDate(parseInt(e.target.value, 10));
  };

  const progress = ((timelineDate - minDate) / (maxDate - minDate)) * 100;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-[800px] max-w-[90vw] bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-4 pointer-events-auto">
      <button 
        onClick={togglePlaying}
        className="w-12 h-12 flex-shrink-0 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white transition-colors shadow-lg shadow-blue-500/20"
      >
        {isPlaying ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        )}
      </button>

      <div className="flex-1 flex flex-col gap-3 relative mt-6">
        
        {/* Etiqueta Flotante que sigue a la barra */}
        <div 
          className="absolute top-[-26px] bg-slate-800 text-blue-400 font-bold text-xs whitespace-nowrap transform -translate-x-1/2 px-2 py-1 rounded border border-slate-700 pointer-events-none transition-all duration-75"
          style={{ left: `${Math.max(0, Math.min(100, progress))}%` }}
        >
          {new Date(timelineDate).toLocaleString()}
          <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-b border-r border-slate-700 rotate-45"></div>
        </div>

        <div className="relative h-3 bg-slate-800 rounded-full shadow-inner">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
          <input 
            type="range" 
            min={minDate} 
            max={maxDate} 
            value={timelineDate} 
            onChange={handleSliderChange}
            className="absolute top-[-5px] left-0 w-full h-[20px] opacity-0 cursor-pointer z-10"
          />
        </div>
        
        <div className="flex justify-between text-[10px] text-slate-500 font-medium uppercase tracking-wider px-1">
          <span>{new Date(minDate).toLocaleDateString()}</span>
          <span>Hoy</span>
        </div>
      </div>
    </div>
  );
}
