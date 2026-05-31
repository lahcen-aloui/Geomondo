'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useApiIsLoaded } from '@vis.gl/react-google-maps';

export interface PanoNavActions {
  goBack: () => void;
  goForward: () => void;
  resetToStart: () => void;
  resetNorth: () => void;
  rotateLeft: () => void;
  rotateRight: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

interface Props {
  lat: number;
  lng: number;
  onNoImage?: () => void;
  onBearingChange?: (bearing: number) => void;
  navActionsRef?: React.MutableRefObject<PanoNavActions | null>;
  onNavStateChange?: (state: { canGoBack: boolean; canGoForward: boolean }) => void;
}

export default function StreetViewPanel({
  lat, lng, onNoImage, onBearingChange, navActionsRef, onNavStateChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const onBearingChangeRef = useRef(onBearingChange);
  const onNoImageRef = useRef(onNoImage);
  const onNavStateChangeRef = useRef(onNavStateChange);

  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const startPanoRef = useRef<string | null>(null);
  const isNavJumpRef = useRef(false);
  const isLoaded = useApiIsLoaded();

  useEffect(() => { onBearingChangeRef.current = onBearingChange; }, [onBearingChange]);
  useEffect(() => { onNoImageRef.current = onNoImage; }, [onNoImage]);
  useEffect(() => { onNavStateChangeRef.current = onNavStateChange; }, [onNavStateChange]);

  // Window resize → keep panorama filling container
  useEffect(() => {
    const onResize = () => {
      if (panoRef.current) google.maps.event.trigger(panoRef.current, 'resize');
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Reset history on new round
  useEffect(() => {
    historyRef.current = [];
    historyIndexRef.current = -1;
    startPanoRef.current = null;
    onNavStateChangeRef.current?.({ canGoBack: false, canGoForward: false });
  }, [lat, lng]);

  const pushNavState = useCallback(() => {
    onNavStateChangeRef.current?.({
      canGoBack: historyIndexRef.current > 0,
      canGoForward: historyIndexRef.current < historyRef.current.length - 1,
    });
  }, []);

  const goBack = useCallback(() => {
    if (!panoRef.current || historyIndexRef.current <= 0) return;
    isNavJumpRef.current = true;
    historyIndexRef.current--;
    panoRef.current.setPano(historyRef.current[historyIndexRef.current]);
    pushNavState();
    setTimeout(() => { isNavJumpRef.current = false; }, 50);
  }, [pushNavState]);

  const goForward = useCallback(() => {
    if (!panoRef.current || historyIndexRef.current >= historyRef.current.length - 1) return;
    isNavJumpRef.current = true;
    historyIndexRef.current++;
    panoRef.current.setPano(historyRef.current[historyIndexRef.current]);
    pushNavState();
    setTimeout(() => { isNavJumpRef.current = false; }, 50);
  }, [pushNavState]);

  const resetToStart = useCallback(() => {
    if (!panoRef.current || !startPanoRef.current) return;
    isNavJumpRef.current = true;
    panoRef.current.setPano(startPanoRef.current);
    panoRef.current.setPov({ heading: 0, pitch: 0 });
    historyRef.current = [startPanoRef.current];
    historyIndexRef.current = 0;
    pushNavState();
    setTimeout(() => { isNavJumpRef.current = false; }, 50);
  }, [pushNavState]);

  const resetNorth = useCallback(() => {
    if (!panoRef.current) return;
    panoRef.current.setPov({ heading: 0, pitch: 0 });
  }, []);

  const rotateLeft = useCallback(() => {
    if (!panoRef.current) return;
    const pov = panoRef.current.getPov();
    panoRef.current.setPov({ heading: ((pov.heading - 90) + 360) % 360, pitch: pov.pitch });
  }, []);

  const rotateRight = useCallback(() => {
    if (!panoRef.current) return;
    const pov = panoRef.current.getPov();
    panoRef.current.setPov({ heading: (pov.heading + 90) % 360, pitch: pov.pitch });
  }, []);

  const zoomIn = useCallback(() => {
    if (!panoRef.current) return;
    panoRef.current.setZoom(Math.min((panoRef.current.getZoom() ?? 1) + 1, 3));
  }, []);

  const zoomOut = useCallback(() => {
    if (!panoRef.current) return;
    panoRef.current.setZoom(Math.max((panoRef.current.getZoom() ?? 1) - 1, 0));
  }, []);

  // Keep navActionsRef current
  useEffect(() => {
    if (navActionsRef) {
      navActionsRef.current = { goBack, goForward, resetToStart, resetNorth, rotateLeft, rotateRight, zoomIn, zoomOut };
    }
  }, [navActionsRef, goBack, goForward, resetToStart, resetNorth, rotateLeft, rotateRight, zoomIn, zoomOut]);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    const service = new google.maps.StreetViewService();
    service.getPanorama({ location: { lat, lng }, radius: 50000, preference: google.maps.StreetViewPreference.NEAREST }, (data, status) => {
      if (status !== google.maps.StreetViewStatus.OK || !data?.location?.pano) {
        onNoImageRef.current?.();
        return;
      }

      const startPano = data.location.pano;
      startPanoRef.current = startPano;
      historyRef.current = [startPano];
      historyIndexRef.current = 0;
      onNavStateChangeRef.current?.({ canGoBack: false, canGoForward: false });

      if (!panoRef.current) {
        const pano = new google.maps.StreetViewPanorama(containerRef.current!, {
          pano: startPano,
          pov: { heading: 0, pitch: 0 },
          zoom: 1,
          addressControl: false,
          fullscreenControl: false,
          motionTrackingControl: false,
          showRoadLabels: false,
          zoomControl: false,          // hide Google's +/- zoom (we have our own)
          panControl: false,           // hide Google's rotate compass (we have our own)
          linksControl: false,         // hide blue navigation arrows on road
          enableCloseButton: false,
        });

        pano.addListener('pov_changed', () => {
          onBearingChangeRef.current?.(pano.getPov().heading);
        });

        pano.addListener('pano_changed', () => {
          if (isNavJumpRef.current) return;
          const current = pano.getPano();
          const hist = historyRef.current;
          const idx = historyIndexRef.current;
          if (current !== hist[idx]) {
            hist.splice(idx + 1);
            hist.push(current);
            historyIndexRef.current = hist.length - 1;
            pushNavState();
          }
        });

        panoRef.current = pano;
        setTimeout(() => google.maps.event.trigger(pano, 'resize'), 200);
      } else {
        panoRef.current.setPano(startPano);
        panoRef.current.setPov({ heading: 0, pitch: 0 });
        setTimeout(() => google.maps.event.trigger(panoRef.current!, 'resize'), 200);
      }
    });
  }, [isLoaded, lat, lng, pushNavState]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
