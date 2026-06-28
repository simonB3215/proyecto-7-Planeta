import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore, TUTORIAL_STEPS } from '../store/useAppStore';

// Iconos minimalistas por paso (SVG inline para no añadir dependencias).
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
 * Botón flotante permanente de Ayuda (?) — reinicia el tutorial en cualquier momento.
 */
export function HelpButton() {
  const startTutorial = useAppStore((s) => s.startTutorial);
  return (
    <motion.button
      onClick={startTutorial}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      title="Ver tutorial / Ayuda"
      className="pointer-events-auto w-12 h-12 rounded-full flex items-center justify-center bg-slate-950/40 backdrop-blur-md border border-white/10 text-slate-200 shadow-2xl hover:border-cyan-400 hover:text-cyan-300 transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </motion.button>
  );
}

/**
 * Overlay de onboarding paso a paso con Framer Motion.
 * - Se auto-activa la primera vez (basado en `hasSeenTutorial` persistido).
 * - Controla transiciones de entrada/salida y deslizamiento entre pasos.
 */
export default function TutorialOverlay() {
  const isOpen = useAppStore((s) => s.isTutorialOpen);
  const step = useAppStore((s) => s.tutorialStep);
  const hasSeen = useAppStore((s) => s.hasSeenTutorial);
  const startTutorial = useAppStore((s) => s.startTutorial);
  const nextStep = useAppStore((s) => s.nextStep);
  const prevStep = useAppStore((s) => s.prevStep);
  const skipTutorial = useAppStore((s) => s.skipTutorial);

  // Auto-activación en la primera visita.
  useEffect(() => {
    if (!hasSeen) startTutorial();
  }, [hasSeen, startTutorial]);

  const current = TUTORIAL_STEPS[step];
  const total = TUTORIAL_STEPS.length;
  const isLast = step === total - 1;

  return (
    <AnimatePresence>
      {isOpen && current && (
        <motion.div
          key="tutorial-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm pointer-events-auto p-4"
        >
          <motion.div
            key="tutorial-card"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="relative w-full max-w-md rounded-2xl bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_rgba(0,229,255,0.08)] p-8 text-slate-100"
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

            {/* Contenido del paso (animado al cambiar) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                <div className="w-14 h-14 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 flex items-center justify-center mb-5">
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
                {step > 0 && (
                  <button
                    onClick={prevStep}
                    className="px-4 py-2 rounded-lg text-sm border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
                  >
                    Atrás
                  </button>
                )}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={nextStep}
                  className="px-5 py-2 rounded-lg text-sm font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.35)] transition-colors"
                >
                  {isLast ? 'Comenzar' : 'Siguiente'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
