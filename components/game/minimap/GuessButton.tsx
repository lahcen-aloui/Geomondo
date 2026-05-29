'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  hasPin: boolean;
  onGuess: () => void;
  dropPinHint: string;
  confirmLabel: string;
}

export default function GuessButton({ hasPin, onGuess, dropPinHint, confirmLabel }: Props) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-center pb-3 pointer-events-none"
      style={{
        height: 72,
        background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
      }}
    >
      <AnimatePresence mode="wait">
        {!hasPin ? (
          <motion.span
            key="hint"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="text-white/60 text-[11px] font-semibold uppercase tracking-widest select-none"
          >
            {dropPinHint}
          </motion.span>
        ) : (
          <motion.button
            key="guess"
            initial={{ opacity: 0, scale: 0.8, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 14 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            onClick={onGuess}
            className="pointer-events-auto font-extrabold uppercase tracking-widest text-sm px-8 py-2.5 rounded-full text-white active:scale-95 transition-transform duration-100"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              boxShadow: '0 4px 20px rgba(34,197,94,0.55), 0 1px 4px rgba(0,0,0,0.4)',
            }}
          >
            {confirmLabel}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
