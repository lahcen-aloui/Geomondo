/**
 * Persists a completed guest game in sessionStorage so it can be submitted
 * to the leaderboard automatically after the user signs up / logs in.
 *
 * sessionStorage is the right choice here:
 *   - Survives the OAuth redirect chain (same tab)
 *   - Clears automatically when the tab closes (no stale scores from old sessions)
 *   - No risk of a days-old score sneaking onto the leaderboard unexpectedly
 */

import type { ScorePayload } from '@/types/game';

const STORAGE_KEY = 'geomondo_pending_score';

export function savePendingScore(payload: ScorePayload): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage can be unavailable in some private-browsing contexts — ignore
  }
}

export function loadPendingScore(): ScorePayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ScorePayload) : null;
  } catch {
    return null;
  }
}

export function clearPendingScore(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
