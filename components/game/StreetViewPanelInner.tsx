'use client';

import 'mapillary-js/dist/mapillary.css';
import { useEffect, useRef, useState } from 'react';
import { Viewer, RenderMode } from 'mapillary-js';

interface Props {
  lat: number;
  lng: number;
  onNoImage?: () => void;
  onBearingChange?: (bearing: number) => void;
}

const TOKEN = process.env.NEXT_PUBLIC_MAPILLARY_TOKEN ?? '';

// Half-side in degrees for each search attempt.
// Small first (dense cities), expand only when empty.
// Max bbox area allowed by Mapillary API is 0.010 sq degrees,
// so the largest half must satisfy (2*half)² < 0.010 → half < 0.05.
const SEARCH_STEPS = [0.005, 0.01, 0.02, 0.048];

async function fetchNearestImageId(lat: number, lng: number): Promise<string | null> {
  for (const half of SEARCH_STEPS) {
    const bbox = `${lng - half},${lat - half},${lng + half},${lat + half}`;
    const url =
      `https://graph.mapillary.com/images?fields=id` +
      `&bbox=${bbox}&limit=1&access_token=${TOKEN}`;

    let res: Response;
    try {
      res = await fetch(url);
    } catch {
      continue;
    }

    if (!res.ok) {
      // Dense area hit a server resource limit — smaller bbox already
      // succeeded or will succeed; don't expand further.
      break;
    }

    const json = (await res.json()) as { data?: { id: string }[] };
    const id = json.data?.[0]?.id;
    if (id) return id;
    // Empty result — try a larger bbox
  }
  return null;
}

export default function StreetViewPanelInner({ lat, lng, onNoImage, onBearingChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'no-image'>('loading');
  const onBearingChangeRef = useRef(onBearingChange);
  useEffect(() => { onBearingChangeRef.current = onBearingChange; }, [onBearingChange]);

  useEffect(() => {
    if (!containerRef.current || !TOKEN) {
      setState('no-image');
      return;
    }

    let cancelled = false;
    setState('loading');

    fetchNearestImageId(lat, lng).then(imageId => {
      if (cancelled || !containerRef.current) return;

      if (!imageId) {
        setState('no-image');
        onNoImage?.();
        return;
      }

      viewerRef.current?.remove();
      const viewer = new Viewer({
        accessToken: TOKEN,
        container: containerRef.current,
        imageId,
        component: {
          cover: false,
          direction: false,   // hide white < > navigation arrows
          sequence: false,    // hide sequence navigation bar
          zoom: false,        // hide built-in +/- zoom (we have our own)
          bearing: false,     // hide compass (we show our own N indicator)
          keyboard: false,    // disable default keyboard shortcuts
        },
        renderMode: RenderMode.Fill,
      });
      viewer.on('bearing', (e: { bearing: number }) => {
        onBearingChangeRef.current?.(e.bearing);
      });
      viewerRef.current = viewer;

      // Force-hide Mapillary built-in controls via direct DOM manipulation.
      // CSS alone doesn't win because Mapillary injects its elements after paint.
      const HIDE_CLASSES = [
        'mapillary-zoom-container',
        'mapillary-zoom-in-button',
        'mapillary-zoom-out-button',
        'mapillary-bearing-indicator-container',
        'mapillary-sequence-container',
        'mapillary-direction-perspective',
        'mapillary-navigation-spatial',
      ];
      const hideMapillaryUI = () => {
        if (!containerRef.current) return;
        HIDE_CLASSES.forEach(cls => {
          containerRef.current!
            .querySelectorAll(`.${cls}`)
            .forEach(el => ((el as HTMLElement).style.display = 'none'));
        });
      };
      // Run once after render, then observe for late-injected elements
      setTimeout(hideMapillaryUI, 300);
      setTimeout(hideMapillaryUI, 800);
      const observer = new MutationObserver(hideMapillaryUI);
      observer.observe(containerRef.current, { childList: true, subtree: true });
      // Store observer for cleanup
      (viewer as unknown as { _uiObserver?: MutationObserver })._uiObserver = observer;

      setState('ready');
    });

    return () => {
      cancelled = true;
      const v = viewerRef.current as (Viewer & { _uiObserver?: MutationObserver }) | null;
      v?._uiObserver?.disconnect();
      v?.remove();
      viewerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="w-full h-full" />

      {/* Mapillary attribution — required by terms of service */}
      {state === 'ready' && (
        <a
          href="https://www.mapillary.com"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 text-[10px] text-white/70 hover:text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full pointer-events-auto transition-colors"
        >
          © Mapillary
        </a>
      )}

      {state === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background pointer-events-none">
          <p className="text-muted text-sm animate-pulse">Caricamento Street View…</p>
        </div>
      )}
      {state === 'no-image' && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface">
          <p className="text-muted text-sm">
            {TOKEN
              ? 'Nessuna immagine disponibile in questa zona.'
              : 'NEXT_PUBLIC_MAPILLARY_TOKEN non impostato.'}
          </p>
        </div>
      )}
    </div>
  );
}
