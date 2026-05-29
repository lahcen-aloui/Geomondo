'use client';

import { AdvancedMarker } from '@vis.gl/react-google-maps';

interface Props {
  position: [number, number];
}

export default function PinMarker({ position }: Props) {
  return (
    <AdvancedMarker position={{ lat: position[0], lng: position[1] }}>
      <div
        style={{
          width: 20,
          height: 20,
          background: '#009246',
          borderRadius: '50%',
          border: '3px solid white',
          boxShadow: '0 0 0 3px rgba(0,146,70,0.35), 0 4px 12px rgba(0,0,0,0.55)',
        }}
      />
    </AdvancedMarker>
  );
}
