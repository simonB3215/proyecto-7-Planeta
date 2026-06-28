/* eslint-disable react-refresh/only-export-components --
   Módulo helper de alertas: expone `notify` (no es un componente gestionado por HMR). */
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

// =============================================================================
// Helper de alertas (Toasts) "cyber-científico".
// - react-hot-toast gestiona la cola; el render es 100% custom (glassmorphism).
// - Sin emojis: indicadores con iconos SVG de lucide-react.
// - API: notify.error / warning / info / success  (title, { description, source, duration })
// =============================================================================

// Paleta neón por estado: acento (border-l-4), color de icono y resplandor.
const VARIANTS = {
  error: { color: '#FF3366', Icon: AlertCircle, label: 'Error' },           // Rojo Carmesí Neón
  warning: { color: '#FF9900', Icon: AlertTriangle, label: 'Advertencia' }, // Ámbar Brillante
  info: { color: '#00E5FF', Icon: Info, label: 'Información' },              // Cian Eléctrico
  success: { color: '#10B981', Icon: CheckCircle2, label: 'Éxito' },        // Esmeralda Neón
};

function NotificationCard({ t, type, title, description, source }) {
  const { color, Icon, label } = VARIANTS[type] || VARIANTS.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: 48, scale: 0.95 }}
      animate={{
        opacity: t.visible ? 1 : 0,
        x: t.visible ? 0 : 48,
        scale: t.visible ? 1 : 0.95,
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="pointer-events-auto w-80 max-w-[90vw] flex items-start gap-3 rounded-sm
                 border-l-2 border-y border-r border-white/10 bg-black/80 backdrop-blur-sm
                 shadow-lg px-4 py-3"
      style={{ borderLeftColor: color }}
      role="status"
      aria-live="polite"
    >
      <Icon size={18} strokeWidth={1.5} className="shrink-0 mt-0.5" style={{ color }} />

      <div className="flex-1 min-w-0">
        <p className="font-mono text-[11px] tracking-widest uppercase text-neutral-100 leading-snug">
          {title}
        </p>
        {description && (
          <p className="font-mono text-[10px] tracking-wide text-neutral-400 mt-1 leading-relaxed">
            {description}
          </p>
        )}
        <p className="font-mono text-[9px] mt-1.5 uppercase tracking-widest" style={{ color }}>
          {source || label}
        </p>
      </div>

      <button
        onClick={() => toast.dismiss(t.id)}
        className="text-neutral-500 hover:text-white transition-colors shrink-0"
        aria-label="Cerrar notificación"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </motion.div>
  );
}

// Dispara un toast custom del tipo indicado.
function show(type, title, opts = {}) {
  const { description, source, duration } = opts;
  return toast.custom(
    (t) => (
      <NotificationCard t={t} type={type} title={title} description={description} source={source} />
    ),
    { duration: duration ?? (type === 'error' ? 6000 : 4000) }
  );
}

export const notify = {
  error: (title, opts) => show('error', title, opts),
  warning: (title, opts) => show('warning', title, opts),
  info: (title, opts) => show('info', title, opts),
  success: (title, opts) => show('success', title, opts),
  dismiss: (id) => toast.dismiss(id),
};
