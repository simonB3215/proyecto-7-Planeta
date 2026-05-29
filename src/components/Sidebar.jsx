import React from 'react';
import { useStore } from '../store/useStore';

export default function Sidebar() {
  const selectedEvent = useStore(state => state.selectedEvent);
  const clearSelectedEvent = useStore(state => state.clearSelectedEvent);

  if (!selectedEvent) return null;

  return (
    <div className="absolute top-4 right-4 z-10 w-80 pointer-events-auto bg-gray-950/80 backdrop-blur-md border border-orange-500 rounded-lg p-4 font-mono text-white shadow-2xl">
      <div className="flex justify-between items-start border-b border-gray-800 pb-2 mb-4">
        <h2 className="text-yellow-500 font-bold tracking-widest text-sm">TARGET_LOCKED</h2>
        <button 
          onClick={clearSelectedEvent}
          className="text-gray-500 hover:text-white transition-colors text-xs font-bold"
        >
          [CERRAR]
        </button>
      </div>
      
      <div className="space-y-4 text-xs">
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
            <span className="text-orange-400 font-bold">{selectedEvent.mag}</span>
          </div>
        )}
      </div>
    </div>
  );
}
