import { useState, useMemo } from 'react';
import { Plus, Minus, X, SearchX } from 'lucide-react';
import { useStore } from '../store/useStore';
import { latLngToVector3 } from '../utils/geoToVector3';
import { makeCountryPredicate } from '../utils/countryFilter';

function getEventStyles() {
  return { border: 'border-orange-500', text: 'text-orange-400', bg: 'bg-orange-950/20 hover:bg-orange-900/40' };
}

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

    const query = selectedCountry.toLowerCase();
    // Mismo predicado geográfico ESTRICTO que usa el globo (consistencia total).
    // `null` = el texto no es un país real (p. ej. región/estado desde la lista):
    // en ese caso usamos un fallback de texto, salvo incendios (no tienen texto).
    const predicate = makeCountryPredicate(selectedCountry, geoJsonData);

    // 1. Terremotos
    const countryEarthquakes = earthquakes.filter(eq => {
      if (new Date(eq.properties.time).getTime() > timelineDate) return false;
      const [lng, lat] = eq.geometry.coordinates;
      if (predicate) return predicate(lng, lat);
      return (eq.properties.place || '').toLowerCase().includes(query);
    }).map(eq => ({ ...eq, eventType: 'Earthquake', sortDate: new Date(eq.properties.time).getTime() }));

    // 2. Volcanes (EONET)
    const countryVolcanoes = eonetEvents.filter(ev => {
      if (!ev.geometries?.[0]) return false;
      if (new Date(ev.geometries[0].date).getTime() > timelineDate) return false;

      let coords = ev.geometries[0].coordinates;
      while (Array.isArray(coords[0])) coords = coords[0];
      const lng = coords[0];
      const lat = coords[1];

      if (predicate) return predicate(lng, lat);
      return (ev.title || '').toLowerCase().includes(query);
    }).map(ev => ({ ...ev, eventType: 'Volcano', sortDate: new Date(ev.geometries[0].date).getTime() }));

    // 3. Incendios (sin texto: solo coincidencia geográfica)
    const countryFires = firmsFires.filter(fire => {
      if (!fire.latitude || !fire.longitude) return false;
      if (new Date(fire.acq_date).getTime() > timelineDate) return false;
      const lat = parseFloat(fire.latitude);
      const lng = parseFloat(fire.longitude);
      if (predicate) return predicate(lng, lat);
      return false;
    }).map((fire, i) => ({ ...fire, id: `fire-${i}`, eventType: 'Fire', sortDate: new Date(fire.acq_date).getTime() }));

    // Combinar y ordenar por fecha (más reciente primero)
    return [...countryEarthquakes, ...countryVolcanoes, ...countryFires].sort((a, b) => b.sortDate - a.sortDate);
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
            className="text-slate-400 hover:text-white transition-colors w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center"
            title={isExpanded ? "Minimizar" : "Expandir"}
          >
            {isExpanded ? <Minus size={18} /> : <Plus size={18} />}
          </button>
          <button
            onClick={clearSelectedCountry}
            className="text-slate-400 hover:text-white transition-colors w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {isExpanded && (

      <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-0 bg-slate-950/50">
        {countryEvents.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-3 py-8 px-4 m-1 rounded-xl bg-slate-950/40 backdrop-blur-md border border-white/10">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <SearchX size={22} />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              No hay eventos sísmicos, volcánicos ni incendios activos registrados en este territorio.
            </p>
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
            
            if (event.eventType === 'Volcano') {
              return (
                <div
                  key={event.id}
                  onClick={() => {
                    let coords = event.geometries[0].coordinates;
                    while(Array.isArray(coords[0])) coords = coords[0];
                    const pos = latLngToVector3(parseFloat(coords[1]), parseFloat(coords[0]), 1.01);
                    setSelectedEvent({
                      id: event.id, type: 'Volcano', title: event.title,
                      date: event.geometries[0].date, pos
                    });
                  }}
                  className="group border-l-4 border-orange-500 bg-orange-950/20 hover:bg-orange-900/30 rounded-r-lg p-3 cursor-pointer transition-all mb-2"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-orange-400 font-bold text-xs">{event.categories[0]?.title || 'Volcán'}</span>
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
