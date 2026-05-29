import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Globe from './components/Globe';
import { fetchAllData } from './services/apiServices';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';

function App() {
  const isLoading = useStore(state => state.isLoading);
  const earthquakes = useStore(state => state.earthquakes);
  const eonetEvents = useStore(state => state.eonetEvents);
  const setTargetLocation = useStore(state => state.setTargetLocation);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => fetchAllData(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-200 overflow-hidden relative">
      
      {/* 3D Canvas Layer (Z-0) */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }}>
          <Suspense fallback={null}>
            <Globe />
          </Suspense>
        </Canvas>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}></div>

      {/* UI Layer (Z-10) - pointer-events-none */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col">
        {/* Header - Interactive */}
        <header className="h-16 border-b border-slate-800 glass-panel m-4 mb-2 flex items-center px-6 justify-between pointer-events-auto shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]"></div>
            <h1 className="text-xl font-bold tracking-widest text-slate-100">EARTHPULSE <span className="text-red-500">3D</span></h1>
          </div>
          <div className="flex gap-6 tech-text text-slate-400">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span>{isLoading ? 'SYSTEM_SYNCING' : 'SYSTEM_ONLINE'}</span>
            </div>
            <div>DATA_SYNC: <span className="text-slate-200">ACTIVE</span></div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex justify-between p-4 pt-2 min-h-0">
          
          {/* Left Panel: Active Events - Interactive */}
          <aside className="w-80 h-full glass-panel flex flex-col overflow-hidden pointer-events-auto shrink-0">
            <div className="p-4 border-b border-slate-800 shrink-0">
              <h2 className="tech-text text-slate-300">ACTIVE_EVENTS_FEED</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto tech-text text-xs space-y-3">
              {isLoading && earthquakes.length === 0 ? (
                <div className="text-slate-500 animate-pulse">[WAITING_FOR_DATA_STREAM...]</div>
              ) : (
                <>
                  {earthquakes.slice(0, 15).map((eq) => (
                    <div key={eq.id} 
                         onClick={() => {
                           const [lng, lat] = eq.geometry.coordinates;
                           setTargetLocation(parseFloat(lat), parseFloat(lng));
                         }}
                         className="border-l-2 border-orange-500 pl-2 py-1 bg-slate-900/40 hover:bg-slate-800/60 transition-colors cursor-pointer active:scale-95">
                      <div className="text-orange-400 font-bold">MAG {eq.properties.mag}</div>
                      <div className="text-slate-400 truncate" title={eq.properties.place}>{eq.properties.place}</div>
                    </div>
                  ))}
                  {eonetEvents.slice(0, 10).map((ev) => (
                    <div key={ev.id} 
                         onClick={() => {
                           const coords = ev.geometries?.[0]?.coordinates;
                           if (!coords) return;
                           let firstPt = coords;
                           while(Array.isArray(firstPt[0])) { firstPt = firstPt[0]; }
                           setTargetLocation(parseFloat(firstPt[1]), parseFloat(firstPt[0]));
                         }}
                         className="border-l-2 border-blue-500 pl-2 py-1 bg-slate-900/40 hover:bg-slate-800/60 transition-colors cursor-pointer active:scale-95">
                      <div className="text-blue-400 font-bold">{ev.categories[0]?.title || 'EVENT'}</div>
                      <div className="text-slate-400 truncate" title={ev.title}>{ev.title}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </aside>

          {/* Right Panel: Selected Event Details - Interactive */}
          <Sidebar />

        </main>
      </div>
    </div>
  )
}

export default App

