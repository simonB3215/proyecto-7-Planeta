import { useAppStore } from '../store/useAppStore';
import { EVENT_PALETTE } from '../utils/palette';

/**
 * Píldoras de filtrado por categoría (paleta neón). Cada chip alterna la
 * visibilidad de ese tipo de evento en el globo a través de `useAppStore`.
 */
export default function CategoryFilters() {
  const filters = useAppStore((s) => s.filters);
  const toggleFilter = useAppStore((s) => s.toggleFilter);

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(EVENT_PALETTE).map(([type, cfg]) => {
        const active = filters[type] !== false;
        return (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            title={`${active ? 'Ocultar' : 'Mostrar'} ${cfg.label}`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
              active
                ? 'bg-white/5 border-white/15 text-slate-100'
                : 'bg-transparent border-white/5 text-slate-500 opacity-50'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: cfg.color,
                boxShadow: active ? `0 0 8px ${cfg.color}` : 'none',
              }}
            />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}
