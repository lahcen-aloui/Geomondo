'use client';

import { useState, useCallback } from 'react';

export interface MapState {
  markerPos: [number, number] | null;
  isHovered: boolean;
  isExpanded: boolean;
  dropPin: (lat: number, lng: number) => void;
  setIsHovered: (v: boolean) => void;
}

export function useMapState(): MapState {
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isHovered;

  const dropPin = useCallback((lat: number, lng: number) => {
    setMarkerPos([lat, lng]);
  }, []);

  return { markerPos, isHovered, isExpanded, dropPin, setIsHovered };
}
