import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Globe from './components/Globe';
import { fetchAllData } from './services/apiServices';
import { useStore } from './store/useStore';
import { latLngToVector3 } from './utils/geoToVector3';
import Sidebar from './components/Sidebar';
import CountryPanel from './components/CountryPanel';

function getEventStyles(mag) {
  return { border: 'border-orange-500', text: 'text-orange-400', bg: 'bg-orange-950/20 hover:bg-orange-900/40' };
}

function App() {
  const isLoading = useStore(state => state.isLoading);
  const earthquakes = useStore(state => state.earthquakes);
  const eonetEvents = useStore(state => state.eonetEvents);
  const setSelectedEvent = useStore(state => state.setSelectedEvent);
  const isRotating = useStore(state => state.isRotating);
  const toggleRotation = useStore(state => state.toggleRotation);
  const lightingMode = useStore(state => state.lightingMode);
  const toggleLighting = useStore(state => state.toggleLighting);
  const searchQuery = useStore(state => state.searchQuery);
  const setSearchQuery = useStore(state => state.setSearchQuery);
  const timelineDate = useStore(state => state.timelineDate);

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
        
        {/* Overlays Absolutos */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-4 pointer-events-none items-end max-h-screen">
          <Sidebar />
          <CountryPanel />
        </div>
        
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
            <div className="p-4 border-b border-slate-800 shrink-0 flex flex-col gap-3">
              <h2 className="tech-text text-slate-300">ACTIVE_EVENTS_FEED</h2>
              <input 
                type="text" 
                placeholder="Buscar país o región..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              
              {/* Global Stats */}
              {!isLoading && (
                <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                    <div className="text-slate-500 mb-1">TOTAL SISMOS</div>
                    <div className="text-orange-400 font-bold text-lg">{earthquakes.length}</div>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                    <div className="text-slate-500 mb-1">MAX MAGNITUD</div>
                    <div className="text-red-400 font-bold text-lg">
                      {earthquakes.length > 0 ? Math.max(...earthquakes.map(eq => eq.properties.mag || 0)).toFixed(1) : 0}
                    </div>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                    <div className="text-slate-500 mb-1">ANOMALÍAS TÉRMICAS</div>
                    <div className="text-rose-500 font-bold text-lg">{useStore.getState().firmsFires.length}</div>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                    <div className="text-slate-500 mb-1">TORMENTAS ACTIVAS</div>
                    <div className="text-blue-400 font-bold text-lg">{eonetEvents.length}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 p-4 overflow-y-auto tech-text text-xs space-y-3">
              {isLoading && earthquakes.length === 0 ? (
                <div className="text-slate-500 animate-pulse">[WAITING_FOR_DATA_STREAM...]</div>
              ) : (
                <>
                  {earthquakes
                    .filter(eq => eq.properties.place.toLowerCase().includes(searchQuery.toLowerCase()) && new Date(eq.properties.time).getTime() <= timelineDate)
                    .slice(0, 50).map((eq) => {
                      const styles = getEventStyles(eq.properties.mag || 0);
                      return (
                        <div key={eq.id} 
                             onClick={() => {
                               const [lng, lat] = eq.geometry.coordinates;
                               const pos = latLngToVector3(parseFloat(lat), parseFloat(lng), 1.01);
                               setSelectedEvent({ id: eq.id, type: 'Earthquake', title: eq.properties.place, date: eq.properties.time, mag: eq.properties.mag, pos, rawLat: parseFloat(lat), rawLng: parseFloat(lng) });
                               
                               // Extraer el país o región del texto (después de la última coma)
                               const placeParts = eq.properties.place.split(',');
                               if (placeParts.length > 1) {
                                 const region = placeParts.pop().trim();
                                 useStore.getState().setSelectedCountry(region);
                               } else {
                                 useStore.getState().setSelectedCountry(eq.properties.place.trim());
                               }
                             }}
                             className={`border-l-4 ${styles.border} pl-3 py-2 ${styles.bg} rounded-r-md transition-colors cursor-pointer active:scale-95 mb-2`}>
                          <div className={`${styles.text} font-bold text-[11px]`}>MAG {eq.properties.mag}</div>
                          <div className="text-slate-300 truncate" title={eq.properties.place}>{eq.properties.place}</div>
                        </div>
                      );
                  })}
                  {eonetEvents
                    .filter(ev => ev.title.toLowerCase().includes(searchQuery.toLowerCase()) && ev.geometries?.[0] && new Date(ev.geometries[0].date).getTime() <= timelineDate)
                    .slice(0, 20).map((ev) => (
                    <div key={ev.id} 
                         onClick={() => {
                           const coords = ev.geometries?.[0]?.coordinates;
                           if (!coords) return;
                           let firstPt = coords;
                           while(Array.isArray(firstPt[0])) { firstPt = firstPt[0]; }
                           const pos = latLngToVector3(parseFloat(firstPt[1]), parseFloat(firstPt[0]), 1.01);
                           setSelectedEvent({ id: ev.id, type: 'Storm', title: ev.title, date: ev.geometries[0].date, pos, rawLat: parseFloat(firstPt[1]), rawLng: parseFloat(firstPt[0]) });
                           
                           // Extraer región para eventos meteorológicos
                           useStore.getState().setSelectedCountry(ev.title);
                         }}
                         className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-950/20 hover:bg-blue-900/30 rounded-r-md transition-colors cursor-pointer active:scale-95 mb-2">
                      <div className="text-blue-400 font-bold text-[11px] uppercase">{ev.categories[0]?.title || 'EVENT'}</div>
                      <div className="text-slate-300 truncate" title={ev.title}>{ev.title}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </aside>

        </main>

        {/* Global Controls */}
        <div className="absolute bottom-6 right-6 z-30 pointer-events-auto flex gap-3">
          <button 
            onClick={toggleLighting}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-2xl border ${lightingMode === 'full' ? 'bg-yellow-500/80 border-yellow-400 text-white shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-yellow-500 hover:text-white'}`}
            title={lightingMode === 'full' ? "Luz Tiempo Real" : "Iluminación Total"}
          >
            {lightingMode === 'full' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
          </button>
          
          <button 
            onClick={toggleRotation}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-2xl border ${isRotating ? 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-orange-500 hover:text-white' : 'bg-orange-500/80 border-orange-400 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]'}`}
            title={isRotating ? "Pausar Rotación" : "Reanudar Rotación"}
          >
            {isRotating ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}

export default App

