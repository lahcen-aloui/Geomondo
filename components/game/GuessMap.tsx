'use client';

import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useMapState } from './minimap/useMapState';
import { useRef } from 'react';
import type { MapZoomActions } from './minimap/MiniMapInner';

const MiniMapInner = dynamic(() => import('./minimap/MiniMapInner'), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-surface" />,
});

// Responsive sizes — mobile gets smaller defaults
const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
const COLLAPSED_W = isMobile ? 200 : 320;
const COLLAPSED_H = isMobile ? 150 : 220;
const EXPANDED_W  = isMobile ? 280 : 520;
const EXPANDED_H  = isMobile ? 200 : 380;
const SPRING      = { type: 'spring', stiffness: 300, damping: 32 } as const;

interface Props {
  onPinDrop: (lat: number, lng: number) => void;
  onGuess: () => void;
  disabled?: boolean;
}

export default function GuessMap({ onPinDrop, onGuess, disabled = false }: Props) {
  const t = useTranslations('game');
  const { markerPos, isExpanded, dropPin, setIsHovered } = useMapState();
  const mapZoomRef = useRef<MapZoomActions | null>(null);

  const handlePinDrop = (lat: number, lng: number) => {
    dropPin(lat, lng);
    onPinDrop(lat, lng);
  };

  return (
    <motion.div
      className={[
        'absolute right-2 sm:right-5 bottom-4 sm:bottom-6 z-10 flex flex-col gap-2',
        disabled ? 'pointer-events-none' : '',
      ].join(' ')}
      initial={{ width: COLLAPSED_W }}
      animate={{ width: isExpanded ? EXPANDED_W : COLLAPSED_W }}
      transition={SPRING}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Map container — relative so zoom pills can anchor to it */}
      <div className="relative w-full">
        <motion.div
          className="rounded-2xl overflow-hidden shadow-2xl w-full"
          initial={{ height: COLLAPSED_H, opacity: 0.72 }}
          animate={{
            height: isExpanded ? EXPANDED_H : COLLAPSED_H,
            opacity: isExpanded ? 1 : 0.72,
          }}
          transition={SPRING}
        >
          <MiniMapInner
            onPinDrop={handlePinDrop}
            markerPos={markerPos}
            isExpanded={isExpanded}
            zoomActionsRef={mapZoomRef}
          />
        </motion.div>

        {/* Map zoom pill — top-right corner of minimap, clearly for the map only */}
        <div className="absolute top-2 right-2 flex flex-col z-20 rounded-lg overflow-hidden shadow-md">
          <button
            onClick={() => mapZoomRef.current?.zoomIn()}
            aria-label={t('zoomIn')}
            className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-700 bg-white/90 hover:bg-white transition-colors duration-100"
          >
            +
          </button>
          <div className="h-px bg-gray-300" />
          <button
            onClick={() => mapZoomRef.current?.zoomOut()}
            aria-label={t('zoomOut')}
            className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-700 bg-white/90 hover:bg-white transition-colors duration-100"
          >
            −
          </button>
        </div>
      </div>

      {/* Hint bar / Guess button — same width as map, below it */}
      <AnimatePresence mode="wait">
        {markerPos === null ? (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="w-full h-12 rounded-2xl flex items-center justify-center select-none"
            style={{ background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(12px)' }}
          >
            <span className="text-white/80 font-bold italic uppercase text-sm tracking-widest">
              {t('dropPin')}
            </span>
          </motion.div>
        ) : (
          <motion.button
            key="guess"
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            onClick={onGuess}
            className="w-full h-12 rounded-2xl font-extrabold italic uppercase text-sm tracking-widest text-white active:scale-[0.98] transition-transform duration-100 select-none"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              boxShadow: '0 4px 20px rgba(34,197,94,0.6), 0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {t('confirmGuess')}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
