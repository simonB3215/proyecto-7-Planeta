import React from 'react';
import { useStore } from '../store/useStore';

export default function Sidebar() {
  const { selectedEvent, clearSelectedEvent } = useStore();

  return (
    <aside className="w-80 bg-gray-950/60 backdrop-blur-md border border-gray-800 rounded-lg shadow-xl flex flex-col pointer-events-auto shrink-0 relative z-20">
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-mono text-sm text-yellow-500 font-bold tracking-widest">SELECTED_TARGET</h2>
      </div>
      <div className="flex-1 p-4 font-mono text-sm space-y-4">
        {!selectedEvent ? (
          <div className="text-gray-500 animate-pulse text-center mt-10">
            [AWAITING_TARGET_SELECTION]
            <br/><br/>
            Selecciona una alerta en el mapa 3D para ver los detalles.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-l-2 border-orange-500 pl-2 py-1 bg-gray-900/40">
              <div className="text-orange-400 font-bold mb-1">TYPE: {selectedEvent.type.toUpperCase()}</div>
              <div className="text-gray-300">{selectedEvent.title}</div>
            </div>
            
            {selectedEvent.date && (
              <div className="flex justify-between border-b border-gray-800/50 pb-2">
                <span className="text-gray-500">TIMESTAMP</span>
                <span className="text-gray-300 text-right">
                  {new Date(selectedEvent.date).toLocaleString()}
                </span>
              </div>
            )}
            
            {selectedEvent.mag && (
              <div className="flex justify-between border-b border-gray-800/50 pb-2">
                <span className="text-gray-500">MAGNITUDE</span>
                <span className="text-yellow-500 font-bold">{selectedEvent.mag}</span>
              </div>
            )}
            
            <button 
              onClick={clearSelectedEvent}
              className="w-full py-2 mt-4 bg-gray-900 hover:bg-gray-800 text-orange-400 font-bold transition-colors border border-orange-500/50 rounded cursor-pointer active:scale-95"
            >
              CLEAR_TARGET
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
