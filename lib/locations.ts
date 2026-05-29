import type { LocationResponse } from '@/types/game';
import coordsData from '@/data/valid-coords.json';

const coords = coordsData as Array<{ lat: number; lng: number }>;

export function getRandomLocation(excludeIds: string[] = []): LocationResponse {
  const excludeSet = new Set(excludeIds);

  const available: number[] = [];
  for (let i = 0; i < coords.length; i++) {
    if (!excludeSet.has(`coord_${i}`)) {
      available.push(i);
    }
  }

  if (available.length === 0) {
    const i = Math.floor(Math.random() * coords.length);
    return { lat: coords[i].lat, lng: coords[i].lng, locationId: `coord_${i}` };
  }

  const index = available[Math.floor(Math.random() * available.length)];
  return {
    lat: coords[index].lat,
    lng: coords[index].lng,
    locationId: `coord_${index}`,
  };
}
