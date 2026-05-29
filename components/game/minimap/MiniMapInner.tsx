'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Map, useMap, type MapMouseEvent } from '@vis.gl/react-google-maps';
import PinMarker from './PinMarker';

const WORLD_CENTER = { lat: 20, lng: 0 };

export interface MapZoomActions {
  zoomIn: () => void;
  zoomOut: () => void;
}

function ResizeTrigger({ trigger }: { trigger: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const timer = setTimeout(() => {
      window.google?.maps.event.trigger(map, 'resize');
    }, 310);
    return () => clearTimeout(timer);
  }, [trigger, map]);
  return null;
}

function ZoomBridge({ zoomActionsRef }: { zoomActionsRef: React.MutableRefObject<MapZoomActions | null> }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    zoomActionsRef.current = {
      zoomIn:  () => map.setZoom((map.getZoom() ?? 2) + 1),
      zoomOut: () => map.setZoom((map.getZoom() ?? 2) - 1),
    };
    return () => { zoomActionsRef.current = null; };
  }, [map, zoomActionsRef]);
  return null;
}

interface Props {
  onPinDrop: (lat: number, lng: number) => void;
  markerPos: [number, number] | null;
  isExpanded: boolean;
  zoomActionsRef: React.MutableRefObject<MapZoomActions | null>;
}

export default function MiniMapInner({ onPinDrop, markerPos, isExpanded, zoomActionsRef }: Props) {
  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      const ll = e.detail.latLng;
      if (!ll) return;
      onPinDrop(ll.lat, ll.lng);
    },
    [onPinDrop],
  );

  return (
    <Map
      mapId="DEMO_MAP_ID"
      defaultCenter={WORLD_CENTER}
      defaultZoom={2}
      onClick={handleClick}
      disableDefaultUI
      gestureHandling="greedy"
      className="w-full h-full"
      mapTypeId="roadmap"
    >
      <ResizeTrigger trigger={isExpanded} />
      <ZoomBridge zoomActionsRef={zoomActionsRef} />
      {markerPos && <PinMarker position={markerPos} />}
    </Map>
  );
}
