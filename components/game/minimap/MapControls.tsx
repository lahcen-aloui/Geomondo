'use client';

import { useMap } from '@vis.gl/react-google-maps';

export default function MapControls() {
  const map = useMap();

  return (
    <div className="absolute right-2 top-2 flex flex-col gap-px z-10">
      <button
        onClick={() => map?.setZoom((map.getZoom() ?? 2) + 1)}
        aria-label="Zoom in"
        className="w-7 h-7 bg-white/90 hover:bg-white text-black font-bold text-base rounded-t flex items-center justify-center shadow transition-colors duration-150"
      >
        +
      </button>
      <button
        onClick={() => map?.setZoom((map.getZoom() ?? 2) - 1)}
        aria-label="Zoom out"
        className="w-7 h-7 bg-white/90 hover:bg-white text-black font-bold text-base rounded-b flex items-center justify-center shadow transition-colors duration-150"
      >
        −
      </button>
    </div>
  );
}
