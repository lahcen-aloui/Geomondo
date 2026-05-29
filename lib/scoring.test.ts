import { describe, it, expect } from 'vitest';
import { calculateScore, scoreColor } from './scoring';

describe('calculateScore', () => {
  it('returns 5000 for 0 km', () => {
    expect(calculateScore(0)).toBe(5000);
  });

  it('returns ~4756 for 100 km', () => {
    expect(calculateScore(100)).toBeCloseTo(4756, 0);
  });

  it('returns ~1839 for 2000 km', () => {
    expect(calculateScore(2000)).toBeCloseTo(1839, 0);
  });

  it('returns ~0 for very large distances', () => {
    expect(calculateScore(20000)).toBeLessThan(5);
  });

  it('never returns negative', () => {
    expect(calculateScore(50000)).toBeGreaterThanOrEqual(0);
  });
});

describe('scoreColor', () => {
  it('returns gold class for score >= 4500', () => {
    expect(scoreColor(5000)).toBe('text-score-5k');
    expect(scoreColor(4500)).toBe('text-score-5k');
  });

  it('returns silver class for score 3500–4499', () => {
    expect(scoreColor(4000)).toBe('text-score-4k');
    expect(scoreColor(3500)).toBe('text-score-4k');
  });

  it('returns bronze class for score 2500–3499', () => {
    expect(scoreColor(3000)).toBe('text-score-3k');
    expect(scoreColor(2500)).toBe('text-score-3k');
  });

  it('returns grey class for score < 2500', () => {
    expect(scoreColor(1000)).toBe('text-score-low');
    expect(scoreColor(0)).toBe('text-score-low');
  });
});
