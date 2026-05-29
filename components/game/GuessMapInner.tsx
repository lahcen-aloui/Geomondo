'use client';

import { useCallback, useEffect } from 'react';
import {
  Map,
  AdvancedMarker,
  useMap,
  type MapMouseEvent,
} from '@vis.gl/react-google-maps';

const WORLD_CENTER = { lat: 20, lng: 0 };

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

interface Props {
  onPinDrop: (lat: number, lng: number) => void;
  markerPos: [number, number] | null;
  isExpanded: boolean;
}

export default function GuessMapInner({ onPinDrop, markerPos, isExpanded }: Props) {
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
      {markerPos && (
        <AdvancedMarker position={{ lat: markerPos[0], lng: markerPos[1] }}>
          <div
            style={{
              width: 18,
              height: 18,
              background: '#009246',
              borderRadius: '50%',
              border: '2.5px solid white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
            }}
          />
        </AdvancedMarker>
      )}
    </Map>
  );
}
