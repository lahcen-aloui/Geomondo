'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import type { RoundResult as RoundResultType } from '@/types/game';
import { scoreColor, scoreLabel } from '@/lib/scoring';

// ── Dashed polyline + fitBounds (must live inside <Map>) ────────────────────

function MapOverlays({
  correct,
  guess,
}: {
  correct: google.maps.LatLngLiteral;
  guess: google.maps.LatLngLiteral;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(correct);
    bounds.extend(guess);

    // Expand bounds if both points are identical or extremely close
    if (
      Math.abs(correct.lat - guess.lat) < 0.1 &&
      Math.abs(correct.lng - guess.lng) < 0.1
    ) {
      bounds.extend({ lat: correct.lat + 1, lng: correct.lng + 1 });
      bounds.extend({ lat: correct.lat - 1, lng: correct.lng - 1 });
    }

    map.fitBounds(bounds, { top: 80, bottom: 40, left: 80, right: 80 });

    const lineSymbol: google.maps.Symbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 4,
    };

    const polyline = new google.maps.Polyline({
      path: [correct, guess],
      geodesic: true,
      strokeOpacity: 0,
      strokeColor: '#000000',
      icons: [{ icon: lineSymbol, offset: '0', repeat: '18px' }],
      map,
    });

    return () => polyline.setMap(null);
  }, [map, correct, guess]);

  return null;
}

// ── Markers ──────────────────────────────────────────────────────────────────

function CorrectPin() {
  return (
    <div className="flex flex-col items-center" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))' }}>
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center border-[3px] border-white"
        style={{ background: '#1a1a2e' }}
      >
        {/* Flag / location pin icon */}
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      </div>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '9px solid #1a1a2e',
          marginTop: '-1px',
        }}
      />
    </div>
  );
}

function GuessPin() {
  return (
    <div className="flex flex-col items-center" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))' }}>
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center border-[3px] border-white"
        style={{ background: '#009246' }}
      >
        {/* Person icon */}
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '9px solid #009246',
          marginTop: '-1px',
        }}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  round: RoundResultType;
  currentRound: number;
  totalRounds?: number;
  isLastRound: boolean;
  onNext: () => void;
}

export default function RoundResult({
  round,
  currentRound,
  totalRounds = 5,
  isLastRound,
  onNext,
}: Props) {
  const t = useTranslations('result');
  const tGame = useTranslations('game');

  const correct: google.maps.LatLngLiteral = { lat: round.lat, lng: round.lng };
  const guess: google.maps.LatLngLiteral = { lat: round.guess_lat, lng: round.guess_lng };

  const distanceDisplay =
    round.distance_km < 1
      ? `< 1 ${t('km')}`
      : `${Math.round(round.distance_km).toLocaleString('it-IT')} ${t('km')}`;

  return (
    <div className="absolute inset-0 z-20 flex flex-col animate-fade-in">

      {/* ── Map fills remaining height ────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={{ lat: 20, lng: 0 }}
          defaultZoom={2}
          gestureHandling="cooperative"
          disableDefaultUI
          style={{ width: '100%', height: '100%' }}
        >
          <MapOverlays correct={correct} guess={guess} />
          <AdvancedMarker position={correct}>
            <CorrectPin />
          </AdvancedMarker>
          <AdvancedMarker position={guess}>
            <GuessPin />
          </AdvancedMarker>
        </Map>

        {/* Round indicator — top left over the map */}
        <div
          className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-widest select-none"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        >
          {t('roundOf', { round: currentRound, total: totalRounds })}
        </div>

        {/* Score label — top center over the map */}
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider select-none"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        >
          <span className={scoreColor(round.score)}>
            {scoreLabel(round.score, (key) => t(key as Parameters<typeof t>[0]))}
          </span>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 h-[88px] flex items-center border-t border-white/10"
        style={{
          background: 'linear-gradient(180deg, #0d0d1e 0%, #09090f 100%)',
        }}
      >
        <div className="w-full px-6 grid grid-cols-3 items-center gap-4">

          {/* Left — distance */}
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums leading-none">
              {distanceDisplay}
            </span>
            <span className="text-[10px] text-white/35 uppercase tracking-[0.15em] mt-1.5">
              {t('fromLocation')}
            </span>
          </div>

          {/* Center — CTA button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={onNext}
              className="w-full max-w-[220px] bg-it-green hover:bg-it-green-dark text-white font-black text-sm uppercase tracking-widest py-3 rounded-full shadow-[0_0_20px_rgba(0,146,70,0.35)] transition-all duration-150 active:scale-[0.97] cursor-pointer"
            >
              {isLastRound ? t('finalScore') : tGame('nextRound')}
            </button>
            <span className="text-[10px] text-white/25 uppercase tracking-[0.12em]">
              {t('pressEnter')}
            </span>
          </div>

          {/* Right — score */}
          <div className="flex flex-col items-end">
            <span className={`text-2xl sm:text-3xl font-black tabular-nums leading-none ${scoreColor(round.score)}`}>
              {round.score.toLocaleString('it-IT')}
            </span>
            <span className="text-[10px] text-white/35 uppercase tracking-[0.15em] mt-1.5">
              {t('outOfPoints')}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
