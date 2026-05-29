'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useGameStore } from '@/lib/game/store';
import { getRandomLocationApi } from '@/lib/api';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
import StreetViewPanel, { type PanoNavActions } from './StreetViewPanel';
import GeoMondoLogo from '@/components/ui/GeoMondoLogo';
import GuessMap from './GuessMap';
import RoundResult from './RoundResult';
import NavigationToolbar from './minimap/NavigationToolbar';

const TOTAL_ROUNDS = 5;

const CARDINALS = [
  { label: 'N',  deg: 0   },
  { label: 'NE', deg: 45  },
  { label: 'E',  deg: 90  },
  { label: 'SE', deg: 135 },
  { label: 'S',  deg: 180 },
  { label: 'SW', deg: 225 },
  { label: 'W',  deg: 270 },
  { label: 'NW', deg: 315 },
];

function normaliseDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function CompassBar({ bearing }: { bearing: number }) {
  const PX_PER_DEG = 1.8;
  const norm = normaliseDeg(bearing);
  return (
    <div className="relative w-64 h-7 overflow-hidden rounded-full bg-black/50 backdrop-blur-sm">
      {CARDINALS.flatMap(({ label, deg }) =>
        [-360, 0, 360].map(wrap => {
          const px = (deg + wrap - norm) * PX_PER_DEG;
          if (px < -135 || px > 135) return null;
          const isMain = label.length === 1;
          return (
            <span
              key={`${label}-${wrap}`}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 font-bold select-none ${
                isMain ? 'text-white text-xs' : 'text-white/50 text-[10px]'
              }`}
              style={{ left: `calc(50% + ${px}px)` }}
            >
              {label}
            </span>
          );
        })
      )}
      <div className="absolute left-1/2 -translate-x-px top-0.5 w-0.5 h-2 bg-it-green rounded-full pointer-events-none" />
    </div>
  );
}

export default function ClassicoGame() {
  const router = useRouter();
  const t = useTranslations('game');

  const {
    mode,
    status,
    currentRound,
    currentLocation,
    pendingGuess,
    rounds,
    totalScore,
    secondsRemaining,
    usedLocationIds,
    startGame,
    locationLoaded,
    reloadLocation,
    setPendingGuess,
    submitGuess,
    nextRound,
    decrementTimer,
  } = useGameStore();

  const [bearing, setBearing] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const isSprint = mode === 'sprint';
  const handleBearingChange = useCallback((b: number) => setBearing(b), []);

  const navActionsRef = useRef<PanoNavActions | null>(null);

  useEffect(() => { startGame('classico'); }, [startGame]);

  useEffect(() => {
    if (status !== 'LOADING_PANORAMA') return;
    setElapsed(0);
    let cancelled = false;
    getRandomLocationApi(usedLocationIds)
      .then(loc => {
        if (!cancelled) locationLoaded(loc);
      })
      .catch(() => {
        if (!cancelled) reloadLocation();
      });
    return () => { cancelled = true; };
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (status === 'FINAL_SCORE') router.push('/risultato');
  }, [status, router]);

  // Classic mode: count up
  useEffect(() => {
    if (status !== 'PLAYING' || isSprint) return;
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [status, isSprint]);

  // Sprint mode: count down + auto-submit at 0
  useEffect(() => {
    if (status !== 'PLAYING' || !isSprint) return;
    if (secondsRemaining <= 0) {
      // Time's up — submit whatever guess exists, or a null-island default
      submitGuess(pendingGuess ?? { lat: 0, lng: 0 });
      return;
    }
    const id = setInterval(() => decrementTimer(), 1000);
    return () => clearInterval(id);
  }, [status, isSprint, secondsRemaining, pendingGuess, submitGuess, decrementTimer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (status === 'PLAYING') {
        if (e.code === 'Space' && pendingGuess) {
          e.preventDefault();
          submitGuess(pendingGuess);
          return;
        }
        if (e.key === 'z' || e.key === 'Z') { navActionsRef.current?.goBack(); return; }
        if (e.key === 'r' || e.key === 'R') { navActionsRef.current?.resetToStart(); return; }
      }
      if (status === 'RESULT' && e.code === 'Enter') nextRound();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, pendingGuess, submitGuess, nextRound]);

  if (status === 'IDLE' || status === 'LOADING_PANORAMA') {
    return (
      <div className="fixed left-0 right-0 bottom-0 top-16 flex items-center justify-center bg-background">
        <p className="text-muted text-sm animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  if (status === 'LOCATION_ERROR') {
    return (
      <div className="fixed left-0 right-0 bottom-0 top-16 flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-3">{t('locationErrorTitle')}</h1>
          <p className="text-muted text-sm leading-relaxed mb-6">{t('locationErrorDescription')}</p>
          <button
            type="button"
            onClick={() => startGame('classico')}
            className="inline-flex items-center justify-center bg-it-green hover:bg-it-green-dark text-white font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            {t('retryLocation')}
          </button>
        </div>
      </div>
    );
  }

  const lastRound = rounds[rounds.length - 1] ?? null;

  return (
    <APIProvider apiKey={API_KEY}>
    <div className="fixed left-0 right-0 bottom-0 top-16 overflow-hidden bg-black">

      {/* Street View panorama */}
      {currentLocation && (
        <StreetViewPanel
          lat={currentLocation.lat}
          lng={currentLocation.lng}
          onNoImage={reloadLocation}
          onBearingChange={handleBearingChange}
          navActionsRef={navActionsRef}
        />
      )}

      {/* ── TOP LEFT: logo — hidden on mobile to save space ── */}
      <div className="absolute top-4 left-4 z-10 hidden sm:block select-none pointer-events-none">
        <GeoMondoLogo textSize="text-xl" globeClassName="align-middle" />
      </div>

      {/* ── BOTTOM LEFT: panorama controls ── */}
      <NavigationToolbar navActionsRef={navActionsRef} bearing={bearing} />

      {/* ── TOP CENTER: compass + timer ── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 pointer-events-none select-none">
        <div className="hidden sm:block"><CompassBar bearing={bearing} /></div>
        <div className={`bg-black/60 backdrop-blur-sm border border-white/20 rounded-full px-4 sm:px-5 py-1 ring-2 ${isSprint && secondsRemaining <= 10 ? 'ring-red-500/70' : 'ring-it-green/50'}`}>
          <span className={`font-bold text-sm sm:text-base tabular-nums tracking-widest ${isSprint && secondsRemaining <= 10 ? 'text-red-400' : 'text-white'}`}>
            {isSprint ? formatTime(secondsRemaining) : formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* ── TOP RIGHT: round scores HUD ── */}
      <div className="absolute top-3 right-3 z-10">
        <div className="flex items-stretch gap-px bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 text-center text-xs font-semibold">
          {Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
            const roundNum = i + 1;
            const result = rounds.find(r => r.round_number === roundNum);
            const isActive = currentRound === roundNum && status !== 'RESULT';
            return (
              <div
                key={roundNum}
                className={[
                  'flex flex-col items-center justify-center px-1.5 sm:px-3 py-2 min-w-[32px] sm:min-w-[44px]',
                  isActive ? 'bg-white/10' : '',
                ].join(' ')}
              >
                <span className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-wider mb-0.5">
                  {t('roundAbbr')}{roundNum}
                </span>
                <span className={result ? 'text-it-green' : 'text-white/30'}>
                  {result ? result.score.toLocaleString('it-IT') : t('noScore')}
                </span>
              </div>
            );
          })}
          <div className="flex flex-col items-center justify-center px-1.5 sm:px-3 py-2 min-w-[40px] sm:min-w-[56px] border-l border-white/10">
            <span className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-wider mb-0.5">
              {t('total')}
            </span>
            <span className="text-white">
              {totalScore > 0 ? totalScore.toLocaleString('it-IT') : t('noScore')}
            </span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM RIGHT: animated minimap ── */}
      {status === 'PLAYING' && (
        <GuessMap
          key={currentRound}
          onPinDrop={(lat, lng) => setPendingGuess({ lat, lng })}
          onGuess={() => { if (pendingGuess) submitGuess(pendingGuess); }}
        />
      )}

      {/* ── RESULT overlay ── */}
      {status === 'RESULT' && lastRound && (
        <RoundResult
          round={lastRound}
          currentRound={currentRound}
          isLastRound={currentRound >= 5}
          onNext={nextRound}
        />
      )}
    </div>
    </APIProvider>
  );
}
