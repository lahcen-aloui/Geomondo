import { describe, it, expect } from 'vitest';
import { haversineKm } from './haversine';

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineKm(48.8566, 2.3522, 48.8566, 2.3522)).toBe(0);
  });

  it('calculates Paris to London (~344 km)', () => {
    const km = haversineKm(48.8566, 2.3522, 51.5074, -0.1278);
    expect(km).toBeCloseTo(344, 0);
  });

  it('calculates Rome to Tokyo (~9856 km)', () => {
    const km = haversineKm(41.9028, 12.4964, 35.6762, 139.6503);
    expect(km).toBeCloseTo(9856, -2);
  });

  it('handles antipodal points (~20015 km)', () => {
    const km = haversineKm(0, 0, 0, 180);
    expect(km).toBeCloseTo(20015, -2);
  });

  it('is symmetric', () => {
    const a = haversineKm(48.8566, 2.3522, 40.7128, -74.006);
    const b = haversineKm(40.7128, -74.006, 48.8566, 2.3522);
    expect(a).toBeCloseTo(b, 6);
  });
});
