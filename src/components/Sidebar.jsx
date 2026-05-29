import React from 'react';
import { useStore } from '../store/useStore';

export default function Sidebar() {
  const selectedEvent = useStore(state => state.selectedEvent);
  const clearSelectedEvent = useStore(state => state.clearSelectedEvent);

  if (!selectedEvent) return null;

  const getMagnitudeDescription = (mag) => {
    if (!mag) return null;
    const num = parseFloat(mag);
    if (num < 3.0) return "Sismo imperceptible";
    if (num >= 3.0 && num < 5.0) return "Sismo leve";
    if (num >= 5.0 && num < 7.0) return "Sismo moderado";
    return "Terremoto severo";
  };

  const getMagnitudeColor = (mag) => {
    if (!mag) return "text-gray-300";
    const num = parseFloat(mag);
    if (num < 3.0) return "text-gray-400";
    if (num >= 3.0 && num < 5.0) return "text-yellow-400";
    if (num >= 5.0 && num < 7.0) return "text-orange-400";
    return "text-red-500 font-bold";
  };

  const formatEventType = (type) => {
    if (type.toLowerCase() === 'earthquake') return 'Actividad Sísmica';
    if (type.toLowerCase() === 'fire') return 'Anomalía Térmica / Incendio';
    if (type.toLowerCase() === 'storm') return 'Tormenta / Clima Severo';
    return type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  return (
    <div className="w-80 pointer-events-auto bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-lg p-5 font-sans text-white shadow-2xl shrink-0">
      <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-100">Detalles del Evento</h2>
        <button 
          onClick={clearSelectedEvent}
          className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-gray-800"
          title="Cerrar panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-4 text-sm">
        <div className="bg-gray-800/40 p-3 rounded-md border border-gray-700/50">
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Tipo de Evento</div>
          <div className="font-medium text-gray-100">{formatEventType(selectedEvent.type)}</div>
        </div>

        <div className="bg-gray-800/40 p-3 rounded-md border border-gray-700/50">
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Ubicación</div>
          <div className="text-gray-200 capitalize leading-snug">{selectedEvent.title?.toLowerCase()}</div>
        </div>
        
        {selectedEvent.date && (
          <div className="bg-gray-800/40 p-3 rounded-md border border-gray-700/50">
            <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Fecha de registro</div>
            <div className="text-gray-200">
              {formatDate(selectedEvent.date)}
            </div>
          </div>
        )}
        
        {selectedEvent.mag && (
          <div className="bg-gray-800/40 p-3 rounded-md border border-gray-700/50">
            <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Intensidad</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`font-mono text-xl ${getMagnitudeColor(selectedEvent.mag)}`}>
                {parseFloat(selectedEvent.mag).toFixed(1)}
              </span>
              <span className="text-gray-300">({getMagnitudeDescription(selectedEvent.mag)})</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
