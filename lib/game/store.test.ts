import { beforeEach, describe, expect, test } from 'vitest';
import { useGameStore } from './store';
import type { CurrentLocation } from '@/types/game';

function location(id: string): CurrentLocation {
  return {
    lat: 44.4949,
    lng: 11.3426,
    locationId: id,
  };
}

describe('game store panorama retries', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  test('stops reloading locations after repeated panorama misses', () => {
    useGameStore.getState().startGame('classico');

    useGameStore.getState().locationLoaded(location('coord_1'));
    useGameStore.getState().reloadLocation();
    expect(useGameStore.getState().status).toBe('LOADING_PANORAMA');

    useGameStore.getState().locationLoaded(location('coord_2'));
    useGameStore.getState().reloadLocation();
    expect(useGameStore.getState().status).toBe('LOADING_PANORAMA');

    useGameStore.getState().locationLoaded(location('coord_3'));
    useGameStore.getState().reloadLocation();

    expect(useGameStore.getState().status).toBe('LOCATION_ERROR');
    expect(useGameStore.getState().currentLocation).toBeNull();
  });
});
