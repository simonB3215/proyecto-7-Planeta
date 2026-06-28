import { useEffect, useState, useCallback, useId } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gauge, Sparkles } from 'lucide-react';
import { useAppStore, TUTORIAL_STEPS } from '../store/useAppStore';
import { useStore } from '../store/useStore';

const SPOTLIGHT_PADDING = 12; // margen alrededor del elemento resaltado
const SPOTLIGHT_RADIUS = 16; // esquinas redondeadas del recorte

// Iconos minimalistas por paso (SVG inline, sin dependencias extra).
const STEP_ICONS = {
  welcome: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  ),
  filters: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  ),
  details: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M3 11l19-9-9 19-2-8-8-2z" />
    </svg>
  ),
};

/**
 * Botón flotante permanente de Ayuda (?) — reinicia el tutorial cuando se quiera.
 */
export function HelpButton() {
  const startTutorial = useAppStore((s) => s.startTutorial);
  return (
    <motion.button
      onClick={startTutorial}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      title="Ver tutorial / Ayuda"
      className="pointer-events-auto w-12 h-12 rounded-sm flex items-center justify-center bg-black/80 backdrop-blur-sm border border-white/10 text-neutral-300 shadow-lg hover:border-cyan-400 hover:text-cyan-300 transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </motion.button>
  );
}

/**
 * Lee y mantiene actualizado el rect del elemento objetivo del paso actual.
 * Devuelve `null` cuando el paso no tiene target (overlay completo).
 */
function useTargetRect(selector, active) {
  const [rect, setRect] = useState(null);

  const measure = useCallback(() => {
    if (!selector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(selector);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({
      x: r.left - SPOTLIGHT_PADDING,
      y: r.top - SPOTLIGHT_PADDING,
      width: r.width + SPOTLIGHT_PADDING * 2,
      height: r.height + SPOTLIGHT_PADDING * 2,
    });
  }, [selector]);

  useEffect(() => {
    if (!active) return;
    // Medimos en el siguiente frame (evita setState síncrono en el effect) y
    // reaccionamos a cambios de tamaño de ventana / scroll.
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [active, measure]);

  return rect;
}

/**
 * Tutorial de onboarding con efecto SPOTLIGHT (hole-punch via máscara SVG).
 * - Fondo oscuro a pantalla completa (rgba(0,0,0,0.8)).
 * - El elemento objetivo del paso queda expuesto mediante un recorte animado.
 * - Diálogo glassmorphism SIEMPRE centrado (Siguiente / Atrás / Omitir).
 * - Persistencia del estado "completado" vía `useAppStore` (localStorage).
 */
export default function TutorialSpotlight() {
  const isOpen = useAppStore((s) => s.isTutorialOpen);
  const step = useAppStore((s) => s.tutorialStep);
  const hasSeen = useAppStore((s) => s.hasSeenTutorial);
  const startTutorial = useAppStore((s) => s.startTutorial);
  const nextStep = useAppStore((s) => s.nextStep);
  const prevStep = useAppStore((s) => s.prevStep);
  const skipTutorial = useAppStore((s) => s.skipTutorial);
  const setGraphicsMode = useStore((s) => s.setGraphicsMode);

  const maskId = useId();
  const current = TUTORIAL_STEPS[step];
  const rect = useTargetRect(current?.target, isOpen);

  // Paso 0 = compuerta de configuración gráfica obligatoria (sin navegación).
  const isGate = step === 0;

  // Guarda el perfil gráfico y desbloquea avanzando al paso 2 (controles).
  const handleSelectGraphics = (mode) => {
    setGraphicsMode(mode);
    nextStep();
  };

  // Auto-activación en la primera visita.
  useEffect(() => {
    if (!hasSeen) startTutorial();
  }, [hasSeen, startTutorial]);

  if (!current) return null;

  const total = TUTORIAL_STEPS.length;
  const isLast = step === total - 1;
  const hasSpotlight = !!rect;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="tutorial"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 pointer-events-auto"
        >
          {/* Capa oscura con recorte (spotlight) mediante máscara SVG */}
          <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
            <defs>
              <mask id={maskId}>
                {/* Blanco = visible (oscuro); negro = recorte (transparente) */}
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {hasSpotlight && (
                  <motion.rect
                    initial={false}
                    animate={{ x: rect.x, y: rect.y, width: rect.width, height: rect.height }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    rx={SPOTLIGHT_RADIUS}
                    ry={SPOTLIGHT_RADIUS}
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              // Compuerta: fondo denso y opaco uniforme (bloqueo total).
              fill={isGate ? 'rgba(0,0,0,0.97)' : 'rgba(0,0,0,0.8)'}
              mask={`url(#${maskId})`}
            />
          </svg>

          {/* Borde luminoso alrededor del área resaltada */}
          {hasSpotlight && (
            <motion.div
              initial={false}
              animate={{ x: rect.x, y: rect.y, width: rect.width, height: rect.height }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-0 left-0 rounded-2xl border-2 border-cyan-400/70 shadow-[0_0_30px_rgba(0,229,255,0.35)] pointer-events-none"
              style={{ borderRadius: SPOTLIGHT_RADIUS }}
            />
          )}

          {/* Diálogo SIEMPRE centrado en pantalla */}
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key={current.id}
              initial={{ scale: 0.92, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className={`pointer-events-auto relative w-full max-w-md rounded-none backdrop-blur-sm shadow-[0_0_40px_rgba(0,229,255,0.06)] p-8 text-neutral-100 border ${isGate ? 'bg-black/95 border-white/30' : 'bg-black/85 border-white/15'}`}
            >
              {/* Indicador de progreso */}
              <div className="flex items-center gap-2 mb-6">
                {TUTORIAL_STEPS.map((s, i) => (
                  <div
                    key={s.id}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === step ? 'w-8 bg-cyan-400' : i < step ? 'w-4 bg-cyan-400/40' : 'w-4 bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {isGate ? (
                /* === COMPUERTA DE CONFIGURACIÓN GRÁFICA (bloqueo, sin navegación) === */
                <div>
                  <div className="font-mono text-[10px] tracking-widest text-cyan-400/80 uppercase mb-2">
                    Configuración requerida
                  </div>
                  <h3 className="font-mono text-lg tracking-widest uppercase mb-1">
                    Bienvenido a EarthPulse 3D
                  </h3>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-neutral-500 mb-6">
                    Seleccione un perfil gráfico para iniciar
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => handleSelectGraphics('performance')}
                      className="group/opt text-left flex items-start gap-3 p-4 rounded-none bg-black/60 border border-white/25 hover:border-cyan-400 hover:bg-white/5 transition-colors"
                    >
                      <Gauge size={22} strokeWidth={1.5} className="shrink-0 mt-0.5 text-neutral-300 group-hover/opt:text-cyan-300" />
                      <div>
                        <div className="font-mono text-[12px] tracking-widest uppercase text-neutral-100">
                          Modo Alto Rendimiento
                        </div>
                        <div className="font-mono text-[9px] tracking-widest uppercase text-neutral-500 mt-1 leading-relaxed">
                          DPR estándar · sin MSAA · malla optimizada
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSelectGraphics('quality')}
                      className="group/opt text-left flex items-start gap-3 p-4 rounded-none bg-black/60 border border-white/25 hover:border-cyan-400 hover:bg-white/5 transition-colors"
                    >
                      <Sparkles size={22} strokeWidth={1.5} className="shrink-0 mt-0.5 text-neutral-300 group-hover/opt:text-cyan-300" />
                      <div>
                        <div className="font-mono text-[12px] tracking-widest uppercase text-neutral-100">
                          Modo Máxima Calidad
                        </div>
                        <div className="font-mono text-[9px] tracking-widest uppercase text-neutral-500 mt-1 leading-relaxed">
                          DPR x2 · MSAA 8x · geometría HD
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Contenido del paso (animado al cambiar) */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="w-14 h-14 rounded-sm bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 flex items-center justify-center mb-5">
                        {STEP_ICONS[current.id]}
                      </div>
                      <div className="text-xs font-mono tracking-widest text-cyan-400/80 uppercase mb-2">
                        Paso {step + 1} / {total}
                      </div>
                      <h3 className="text-2xl font-bold mb-3 tracking-tight">{current.title}</h3>
                      <p className="text-slate-300 leading-relaxed">{current.body}</p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Controles */}
                  <div className="flex items-center justify-between mt-8">
                    <button
                      onClick={skipTutorial}
                      className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Omitir
                    </button>

                    <div className="flex items-center gap-2">
                      {step > 1 && (
                        <button
                          onClick={prevStep}
                          className="px-4 py-2 rounded-sm text-sm border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
                        >
                          Atrás
                        </button>
                      )}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={nextStep}
                        className="px-5 py-2 rounded-sm text-sm font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.35)] transition-colors"
                      >
                        {isLast ? 'Comenzar' : 'Siguiente'}
                      </motion.button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
