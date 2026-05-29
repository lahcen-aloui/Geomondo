export function calculateScore(distanceKm: number): number {
  return Math.round(5000 * Math.exp(-distanceKm / 2000));
}

export function scoreColor(score: number): string {
  if (score >= 4500) return 'text-score-5k';
  if (score >= 3500) return 'text-score-4k';
  if (score >= 2500) return 'text-score-3k';
  return 'text-score-low';
}

export function scoreLabel(
  score: number,
  t: (key: string) => string,
): string {
  if (score >= 4500) return t('perfect');
  if (score >= 3500) return t('excellent');
  if (score >= 2500) return t('good');
  if (score >= 1000) return t('notBad');
  return t('tryAgain');
}
