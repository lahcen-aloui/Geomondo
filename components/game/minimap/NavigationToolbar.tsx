'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { PanoNavActions } from '../StreetViewPanel';

// ── Tooltip ──────────────────────────────────────────────────────────────────

function Tooltip({ label, shortcut }: { label: string; shortcut?: string }) {
  return (
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none flex items-center">
      {/* Left-pointing caret */}
      <div
        style={{
          width: 0, height: 0,
          borderTop: '5px solid transparent',
          borderBottom: '5px solid transparent',
          borderRight: '6px solid white',
          flexShrink: 0,
        }}
      />
      <div className="bg-white rounded-lg px-3 py-1.5 whitespace-nowrap shadow-[0_2px_12px_rgba(0,0,0,0.22)]">
        <span className="text-gray-900 text-sm font-semibold">{label}</span>
        {shortcut && (
          <span className="text-gray-400 text-sm ml-1.5">({shortcut})</span>
        )}
      </div>
    </div>
  );
}

// ── Circle button ─────────────────────────────────────────────────────────────

const BTN_STYLE = {
  background: 'rgba(20,20,20,0.75)',
  backdropFilter: 'blur(8px)',
} as const;

function NavBtn({
  onClick,
  label,
  shortcut,
  extraClass = '',
  children,
}: {
  onClick: () => void;
  label: string;
  shortcut?: string;
  extraClass?: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onClick}
        aria-label={label}
        className={`w-10 h-10 flex items-center justify-center text-white border border-white/10 shadow-md transition-all duration-150 active:scale-90 select-none hover:brightness-125 ${extraClass}`}
        style={BTN_STYLE}
      >
        {children}
      </button>
      {hovered && <Tooltip label={label} shortcut={shortcut} />}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconGoBack() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="9 14 4 9 9 4" />
      <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
    </svg>
  );
}
function IconReturnToStart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
function IconRotateLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IconRotateRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ── Zoom pill (+ and − connected) ────────────────────────────────────────────

function ZoomPill({
  onZoomIn,
  onZoomOut,
  labelIn,
  labelOut,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  labelIn: string;
  labelOut: string;
}) {
  const [inHovered, setInHovered]   = useState(false);
  const [outHovered, setOutHovered] = useState(false);

  return (
    <div
      className="flex flex-col border border-white/10 shadow-md"
      style={{ ...BTN_STYLE, borderRadius: 20 }}
    >
      {/* Zoom in */}
      <div
        className="relative h-10 w-10 flex items-center justify-center cursor-pointer hover:brightness-125 transition-all duration-150 active:scale-90 select-none"
        style={{ borderRadius: '20px 20px 0 0' }}
        onClick={onZoomIn}
        onMouseEnter={() => setInHovered(true)}
        onMouseLeave={() => setInHovered(false)}
        role="button"
        aria-label={labelIn}
      >
        <span className="text-white text-base font-bold leading-none">+</span>
        {inHovered && <Tooltip label={labelIn} />}
      </div>

      {/* Divider */}
      <div className="h-px mx-0 bg-white/15 pointer-events-none" />

      {/* Zoom out */}
      <div
        className="relative h-10 w-10 flex items-center justify-center cursor-pointer hover:brightness-125 transition-all duration-150 active:scale-90 select-none"
        style={{ borderRadius: '0 0 20px 20px' }}
        onClick={onZoomOut}
        onMouseEnter={() => setOutHovered(true)}
        onMouseLeave={() => setOutHovered(false)}
        role="button"
        aria-label={labelOut}
      >
        <span className="text-white text-base font-bold leading-none">−</span>
        {outHovered && <Tooltip label={labelOut} />}
      </div>
    </div>
  );
}

// ── Pill button with tooltip ──────────────────────────────────────────────────

function PillBtn({
  onClick,
  label,
  radius,
  children,
}: {
  onClick: () => void;
  label: string;
  radius: string;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative h-10 w-10 flex items-center justify-center cursor-pointer hover:brightness-125 transition-all duration-150 active:scale-90 select-none"
      style={{ borderRadius: radius }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      aria-label={label}
    >
      {children}
      {hovered && <Tooltip label={label} />}
    </div>
  );
}

// ── Compass indicator ─────────────────────────────────────────────────────────

function CompassIndicator({ bearing }: { bearing: number }) {
  return (
    <div
      className="w-10 h-10 flex items-center justify-center border border-white/10 shadow-md"
      style={{ ...BTN_STYLE, borderRadius: 20 }}
      title={`${Math.round(bearing)}°`}
    >
      <svg viewBox="0 0 24 24" className="w-6 h-6" style={{ transform: `rotate(${bearing}deg)`, transition: 'transform 0.15s ease' }}>
        <polygon points="12,3 10.5,12 12,11 13.5,12" fill="#ef4444" />
        <polygon points="12,21 10.5,12 12,13 13.5,12" fill="white" opacity="0.65" />
      </svg>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  navActionsRef: React.MutableRefObject<PanoNavActions | null>;
  bearing?: number;
}

export default function NavigationToolbar({ navActionsRef, bearing = 0 }: Props) {
  const t = useTranslations('game');

  return (
    <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1.5 sm:gap-2 scale-90 sm:scale-100 origin-left">
      {/* Navigation group: go back + return to start */}
      <div className="flex flex-col border border-white/10 shadow-lg" style={{ ...BTN_STYLE, borderRadius: 20 }}>
        <PillBtn onClick={() => navActionsRef.current?.goBack()} label={t('goBack')} radius="20px 20px 0 0">
          <IconGoBack />
        </PillBtn>
        <div className="h-px bg-white/15 pointer-events-none" />
        <PillBtn onClick={() => navActionsRef.current?.resetToStart()} label={t('returnToStart')} radius="0 0 20px 20px">
          <IconReturnToStart />
        </PillBtn>
      </div>

      {/* Zoom group */}
      <ZoomPill
        onZoomIn={() => navActionsRef.current?.zoomIn()}
        onZoomOut={() => navActionsRef.current?.zoomOut()}
        labelIn={t('zoomIn')}
        labelOut={t('zoomOut')}
      />

      {/* Rotate group */}
      <div
        className="flex flex-col border border-white/10 shadow-lg"
        style={{ ...BTN_STYLE, borderRadius: 20 }}
      >
        <PillBtn onClick={() => navActionsRef.current?.rotateLeft()} label={t('rotateLeft')} radius="20px 20px 0 0">
          <IconRotateLeft />
        </PillBtn>
        <div className="h-px bg-white/15 pointer-events-none" />
        <PillBtn onClick={() => navActionsRef.current?.rotateRight()} label={t('rotateRight')} radius="0 0 20px 20px">
          <IconRotateRight />
        </PillBtn>
      </div>

      {/* Compass — shows current heading, rotates with the view */}
      <CompassIndicator bearing={bearing} />
    </div>
  );
}
