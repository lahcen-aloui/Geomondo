# Phase 2 — Core Game Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully playable single-player Classico mode (5 rounds, world map, no timer) end-to-end — from random coordinate API to final score screen.

**Architecture:** A Zustand state machine (IDLE → LOADING_PANORAMA → PLAYING → RESULT → FINAL_SCORE) inside `ClassicoGame` (client component) drives all transitions. Server page wrappers handle locale. API routes serve random coordinates and validate/persist scores server-side. Leaflet is always dynamically imported — never SSR.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS, Zustand v5, Leaflet + react-leaflet (dynamic), next-intl, Supabase (@supabase/ssr, anon client).

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| MODIFY | `tailwind.config.ts` | Add `score-5k`, `score-4k`, `score-3k`, `score-low` color tokens |
| MODIFY | `messages/it.json` | Add `result.copiedToClipboard`, `result.shareTemplate` |
| MODIFY | `messages/en.json` | Add `result.copiedToClipboard`, `result.shareTemplate` |
| MODIFY | `app/globals.css` | Add `.leaflet-container` background override |
| CREATE | `types/game.ts` | All game TypeScript interfaces and union types |
| CREATE | `lib/haversine.ts` | Pure `haversineKm(lat1, lng1, lat2, lng2): number` |
| CREATE | `lib/haversine.test.ts` | Unit tests |
| CREATE | `lib/scoring.ts` | `calculateScore`, `scoreColor`, `scoreLabel` |
| CREATE | `lib/scoring.test.ts` | Unit tests |
| CREATE | `lib/locations.ts` | `getRandomLocation(excludeIds?)` — reads valid-coords.json |
| CREATE | `lib/game/store.ts` | Zustand store — state machine + all actions |
| CREATE | `lib/api.ts` | Typed fetch wrappers: `getRandomLocationApi`, `saveScoreApi` |
| CREATE | `app/api/location/route.ts` | `GET /api/location?exclude=id1,id2` |
| CREATE | `app/api/score/route.ts` | `POST /api/score` — server validates + saves to Supabase |
| CREATE | `components/game/ScoreBar.tsx` | Round X/5 + running total score |
| CREATE | `components/game/StreetViewPanel.tsx` | Street View free embed iframe |
| CREATE | `components/game/GuessMapInner.tsx` | Actual Leaflet component (imported dynamically) |
| CREATE | `components/game/GuessMap.tsx` | Dynamic import wrapper + expand logic + Conferma button |
| CREATE | `components/game/RoundResult.tsx` | Per-round overlay: distance, score, progress bar, next button |
| CREATE | `components/game/ClassicoGame.tsx` | `'use client'` — full 5-round game loop wired to store |
| CREATE | `components/game/RisultatoScreen.tsx` | `'use client'` — final score + share + guest prompt |
| CREATE | `app/[locale]/gioca/classico/page.tsx` | Thin server wrapper: `setRequestLocale` → `<ClassicoGame />` |
| CREATE | `app/[locale]/risultato/page.tsx` | Thin server wrapper: `setRequestLocale` → `<RisultatoScreen />` |

---

## Established Patterns (read before touching code)

- **Locale params**: `const { locale } = await params;` — params is `Promise<{locale:string}>` in Next.js 15
- **i18n in server components**: `setRequestLocale(locale)` at top of every page
- **i18n in client components**: `useTranslations('namespace')` — namespace prefix matches key tree in messages JSON
- **Supabase client**: `import { createClient } from '@/lib/supabase/server'` — always `await createClient()`
- **Locale-aware navigation**: `import { useRouter } from '@/i18n/navigation'` — NOT `next/navigation`
- **Tailwind tokens** (use these exact classes, not hex values):
  - Background: `bg-background` (#0f0f0f)
  - Cards: `bg-surface` (#1a1a1a)
  - Borders: `border-border` (#2a2a2a)
  - Muted text: `text-muted` (#6b6b6b)
  - Primary CTA: `bg-it-green hover:bg-it-green-dark` (#009246 / #007a3a)
  - Danger: `bg-it-red` (#ce2b37)

---

## Task 0: Tailwind Config — Score Color Tokens

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add score color tokens to tailwind.config.ts**

Open `tailwind.config.ts`. Inside `theme.extend.colors`, add the four score tokens after the existing color entries:

```typescript
// tailwind.config.ts — inside theme.extend.colors
'score-5k': '#ffd700',   // gold — near perfect (>= 4500)
'score-4k': '#c0c0c0',   // silver (3500–4499)
'score-3k': '#cd7f32',   // bronze (2500–3499)
'score-low': '#6b6b6b',  // grey (< 2500)
```

Final `colors` block looks like:
```typescript
colors: {
  background: '#0f0f0f',
  surface: '#1a1a1a',
  'surface-2': '#222222',
  'surface-3': '#2e2e2e',
  'it-green': '#009246',
  'it-green-dark': '#007a3a',
  'it-red': '#ce2b37',
  'it-red-dark': '#b02330',
  border: '#2a2a2a',
  'border-light': '#3a3a3a',
  muted: '#6b6b6b',
  'score-5k': '#ffd700',
  'score-4k': '#c0c0c0',
  'score-3k': '#cd7f32',
  'score-low': '#6b6b6b',
},
```

- [ ] **Step 2: Add Leaflet container override to globals.css**

In `app/globals.css`, append at the bottom:
```css
/* Leaflet overrides */
.leaflet-container {
  background: #1a1a1a;
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "chore: add score color tokens + leaflet background override"
```

---

## Task 1: i18n — Add Missing Keys

**Files:**
- Modify: `messages/it.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add keys to messages/it.json**

Inside the `"result"` object, add after `"saveScore"`:
```json
"copiedToClipboard": "Copiato negli appunti!",
"shareTemplate": "Ho giocato GeoMondo ({mode}) e ho fatto {score}/25.000 punti! 🌍 geomondo.it"
```

- [ ] **Step 2: Add keys to messages/en.json**

Inside the `"result"` object, add after `"saveScore"`:
```json
"copiedToClipboard": "Copied to clipboard!",
"shareTemplate": "I played GeoMondo ({mode}) and scored {score}/25,000! 🌍 geomondo.it"
```

- [ ] **Step 3: Verify i18n parity**

```bash
cd /path/to/geomondo && npm run check-i18n
```

Expected: no missing keys reported.

- [ ] **Step 4: Commit**

```bash
git add messages/it.json messages/en.json
git commit -m "chore: add copiedToClipboard and shareTemplate i18n keys"
```

---

## Task 2: TypeScript Types

**Files:**
- Create: `types/game.ts`

- [ ] **Step 1: Create types/game.ts**

```typescript
// types/game.ts
export type GameMode = 'classico' | 'sprint' | 'paese' | 'italia';

export type GameStatus =
  | 'IDLE'
  | 'LOADING_PANORAMA'
  | 'PLAYING'
  | 'RESULT'
  | 'FINAL_SCORE';

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface CurrentLocation extends Coordinate {
  locationId: string;
}

export interface RoundResult {
  round_number: number;
  lat: number;
  lng: number;
  guess_lat: number;
  guess_lng: number;
  distance_km: number;
  score: number;
  time_used_seconds: number;
}

export interface LocationResponse {
  lat: number;
  lng: number;
  locationId: string;
}

export interface ScoreRound {
  round_number: number;
  lat: number;
  lng: number;
  guess_lat: number;
  guess_lng: number;
  time_used_seconds?: number;
}

export interface ScorePayload {
  mode: GameMode;
  rounds: ScoreRound[];
}

export interface ScoreResponseRound {
  round_number: number;
  distance_km: number;
  score: number;
}

export interface ScoreResponse {
  gameId: string;
  totalScore: number;
  rounds: ScoreResponseRound[];
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add types/game.ts
git commit -m "feat: add game TypeScript types"
```

---

## Task 3: Haversine Distance (TDD)

**Files:**
- Create: `lib/haversine.ts`
- Create: `lib/haversine.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// lib/haversine.test.ts
import { describe, it, expect } from 'vitest';
import { haversineKm } from './haversine';

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineKm(48.8566, 2.3522, 48.8566, 2.3522)).toBe(0);
  });

  it('calculates Paris to London (~341 km)', () => {
    const km = haversineKm(48.8566, 2.3522, 51.5074, -0.1278);
    expect(km).toBeCloseTo(341, 0);
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
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test lib/haversine.test.ts
```

Expected: `FAIL — haversineKm is not a function` (or similar import error).

- [ ] **Step 3: Implement haversine.ts**

```typescript
// lib/haversine.ts
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test lib/haversine.test.ts
```

Expected: `PASS — 5 tests passed`.

- [ ] **Step 5: Commit**

```bash
git add lib/haversine.ts lib/haversine.test.ts
git commit -m "feat: implement haversineKm with tests"
```

---

## Task 4: Scoring Formula (TDD)

**Files:**
- Create: `lib/scoring.ts`
- Create: `lib/scoring.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// lib/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { calculateScore, scoreColor, scoreLabel } from './scoring';

describe('calculateScore', () => {
  it('returns 5000 for 0 km', () => {
    expect(calculateScore(0)).toBe(5000);
  });

  it('returns ~4753 for 100 km', () => {
    expect(calculateScore(100)).toBeCloseTo(4753, 0);
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
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test lib/scoring.test.ts
```

Expected: `FAIL — cannot find module './scoring'`.

- [ ] **Step 3: Implement scoring.ts**

```typescript
// lib/scoring.ts
export function calculateScore(distanceKm: number): number {
  return Math.round(5000 * Math.exp(-distanceKm / 2000));
}

export function scoreColor(score: number): string {
  if (score >= 4500) return 'text-score-5k';
  if (score >= 3500) return 'text-score-4k';
  if (score >= 2500) return 'text-score-3k';
  return 'text-score-low';
}

// t must be the result of useTranslations('result')
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
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test lib/scoring.test.ts
```

Expected: `PASS — 9 tests passed`.

- [ ] **Step 5: Commit**

```bash
git add lib/scoring.ts lib/scoring.test.ts
git commit -m "feat: implement scoring formula with tests"
```

---

## Task 5: Random Location Picker

**Files:**
- Create: `lib/locations.ts`

- [ ] **Step 1: Create lib/locations.ts**

```typescript
// lib/locations.ts
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
    // Fallback: all coords have been used (shouldn't happen with 9920 coords / 5 rounds)
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
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/locations.ts
git commit -m "feat: implement getRandomLocation from valid-coords.json"
```

---

## Task 6: Zustand Game Store

**Files:**
- Create: `lib/game/store.ts`

- [ ] **Step 1: Create lib/game/store.ts**

```typescript
// lib/game/store.ts
import { create } from 'zustand';
import type {
  GameMode,
  GameStatus,
  Coordinate,
  CurrentLocation,
  RoundResult,
} from '@/types/game';
import { haversineKm } from '@/lib/haversine';
import { calculateScore } from '@/lib/scoring';

const TOTAL_ROUNDS = 5;

interface GameStore {
  mode: GameMode | null;
  status: GameStatus;
  currentRound: number;
  currentLocation: CurrentLocation | null;
  pendingGuess: Coordinate | null;
  rounds: RoundResult[];
  totalScore: number;
  secondsRemaining: number;
  usedLocationIds: string[];

  startGame: (mode: GameMode) => void;
  locationLoaded: (coord: CurrentLocation) => void;
  setPendingGuess: (guess: Coordinate | null) => void;
  submitGuess: (guess: Coordinate) => void;
  nextRound: () => void;
  resetGame: () => void;
  decrementTimer: () => void;
}

export const useGameStore = create<GameStore>()((set, get) => ({
  mode: null,
  status: 'IDLE',
  currentRound: 1,
  currentLocation: null,
  pendingGuess: null,
  rounds: [],
  totalScore: 0,
  secondsRemaining: 60,
  usedLocationIds: [],

  startGame(mode) {
    set({
      mode,
      status: 'LOADING_PANORAMA',
      currentRound: 1,
      currentLocation: null,
      pendingGuess: null,
      rounds: [],
      totalScore: 0,
      secondsRemaining: 60,
      usedLocationIds: [],
    });
  },

  locationLoaded(coord) {
    set(state => ({
      currentLocation: coord,
      status: 'PLAYING',
      usedLocationIds: [...state.usedLocationIds, coord.locationId],
    }));
  },

  setPendingGuess(guess) {
    set({ pendingGuess: guess });
  },

  submitGuess(guess) {
    const { currentLocation, currentRound } = get();
    if (!currentLocation) return;

    const distanceKm = haversineKm(
      currentLocation.lat,
      currentLocation.lng,
      guess.lat,
      guess.lng,
    );
    const score = calculateScore(distanceKm);

    const roundResult: RoundResult = {
      round_number: currentRound,
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      guess_lat: guess.lat,
      guess_lng: guess.lng,
      distance_km: distanceKm,
      score,
      time_used_seconds: 0,
    };

    set(state => ({
      rounds: [...state.rounds, roundResult],
      totalScore: state.totalScore + score,
      status: 'RESULT',
      pendingGuess: null,
    }));
  },

  nextRound() {
    const { currentRound } = get();
    const next = currentRound + 1;
    if (next > TOTAL_ROUNDS) {
      set({ status: 'FINAL_SCORE' });
    } else {
      set({
        currentRound: next,
        currentLocation: null,
        pendingGuess: null,
        status: 'LOADING_PANORAMA',
      });
    }
  },

  resetGame() {
    set({
      mode: null,
      status: 'IDLE',
      currentRound: 1,
      currentLocation: null,
      pendingGuess: null,
      rounds: [],
      totalScore: 0,
      secondsRemaining: 60,
      usedLocationIds: [],
    });
  },

  decrementTimer() {
    set(state => ({ secondsRemaining: Math.max(0, state.secondsRemaining - 1) }));
  },
}));
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/game/store.ts
git commit -m "feat: implement Zustand game store with state machine"
```

---

## Task 7: API Client Wrappers

**Files:**
- Create: `lib/api.ts`

- [ ] **Step 1: Create lib/api.ts**

```typescript
// lib/api.ts
import type {
  LocationResponse,
  ScorePayload,
  ScoreResponse,
} from '@/types/game';

export async function getRandomLocationApi(
  excludeIds: string[] = [],
): Promise<LocationResponse> {
  const params = excludeIds.length > 0
    ? `?exclude=${excludeIds.join(',')}`
    : '';
  const res = await fetch(`/api/location${params}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch location: ${res.status}`);
  }
  return res.json() as Promise<LocationResponse>;
}

export async function saveScoreApi(
  payload: ScorePayload,
): Promise<ScoreResponse> {
  const res = await fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `Save score failed: ${res.status}`,
    );
  }
  return res.json() as Promise<ScoreResponse>;
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/api.ts
git commit -m "feat: add typed API client wrappers"
```

---

## Task 8: GET /api/location Route

**Files:**
- Create: `app/api/location/route.ts`

- [ ] **Step 1: Create app/api/location/route.ts**

```typescript
// app/api/location/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRandomLocation } from '@/lib/locations';

export function GET(request: NextRequest): NextResponse {
  const excludeParam = request.nextUrl.searchParams.get('exclude');
  const excludeIds = excludeParam
    ? excludeParam.split(',').filter(Boolean)
    : [];

  try {
    const location = getRandomLocation(excludeIds);
    return NextResponse.json(location);
  } catch {
    return NextResponse.json(
      { error: 'Failed to load coordinates', code: 'COORDS_NOT_LOADED' },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Start dev server and smoke-test the route**

```bash
npm run dev
```

In a separate terminal:
```bash
curl http://localhost:3000/api/location
```

Expected response:
```json
{"lat": 25.68248, "lng": -104.79575, "locationId": "coord_0"}
```

```bash
curl "http://localhost:3000/api/location?exclude=coord_0,coord_1"
```

Expected: a different coordinate is returned.

- [ ] **Step 3: Commit**

```bash
git add app/api/location/route.ts
git commit -m "feat: implement GET /api/location with exclude support"
```

---

## Task 9: POST /api/score Route

**Files:**
- Create: `app/api/score/route.ts`

- [ ] **Step 1: Create app/api/score/route.ts**

```typescript
// app/api/score/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { haversineKm } from '@/lib/haversine';
import { calculateScore } from '@/lib/scoring';
import type { GameMode, ScoreRound } from '@/types/game';

const VALID_MODES: GameMode[] = ['classico', 'sprint', 'paese', 'italia'];

interface RequestBody {
  mode: GameMode;
  rounds: ScoreRound[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated', code: 'NOT_AUTHENTICATED' },
      { status: 401 },
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', code: 'INVALID_ROUNDS' },
      { status: 400 },
    );
  }

  const { mode, rounds } = body;

  if (!VALID_MODES.includes(mode)) {
    return NextResponse.json(
      { error: 'Invalid game mode', code: 'INVALID_MODE' },
      { status: 400 },
    );
  }

  if (!Array.isArray(rounds) || rounds.length < 1 || rounds.length > 5) {
    return NextResponse.json(
      { error: 'Must have 1–5 rounds', code: 'INVALID_ROUNDS' },
      { status: 400 },
    );
  }

  // Server recalculates score from raw lat/lng — client score is never trusted
  const serverRounds = rounds.map(r => {
    const distanceKm = haversineKm(r.lat, r.lng, r.guess_lat, r.guess_lng);
    return {
      round_number: r.round_number,
      lat: r.lat,
      lng: r.lng,
      guess_lat: r.guess_lat,
      guess_lng: r.guess_lng,
      distance_km: distanceKm,
      score: calculateScore(distanceKm),
      time_used_seconds: r.time_used_seconds ?? 0,
    };
  });

  const totalScore = serverRounds.reduce((sum, r) => sum + r.score, 0);

  const { data: game, error: insertError } = await supabase
    .from('games')
    .insert({
      user_id: user.id,
      mode,
      total_score: totalScore,
      rounds: serverRounds,
    })
    .select('id')
    .single();

  if (insertError || !game) {
    return NextResponse.json(
      { error: 'Failed to save game', code: 'DB_ERROR' },
      { status: 500 },
    );
  }

  const { error: rpcError } = await supabase.rpc('update_profile_stats', {
    p_user_id: user.id,
    p_score: totalScore,
  });

  if (rpcError) {
    // Non-fatal: game is saved, stats update failed — log and continue
    console.error('update_profile_stats failed:', rpcError.message);
  }

  return NextResponse.json({
    gameId: game.id as string,
    totalScore,
    rounds: serverRounds.map(r => ({
      round_number: r.round_number,
      distance_km: r.distance_km,
      score: r.score,
    })),
  });
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/score/route.ts
git commit -m "feat: implement POST /api/score with server-side score validation"
```

---

## Task 10: ScoreBar Component

**Files:**
- Create: `components/game/ScoreBar.tsx`

- [ ] **Step 1: Create components/game/ScoreBar.tsx**

```typescript
// components/game/ScoreBar.tsx
'use client';

import { useTranslations } from 'next-intl';

interface Props {
  currentRound: number;
  totalRounds?: number;
  totalScore: number;
}

export default function ScoreBar({
  currentRound,
  totalRounds = 5,
  totalScore,
}: Props) {
  const t = useTranslations('game');

  return (
    <div className="h-12 flex items-center justify-between px-4 bg-black/60 backdrop-blur-sm border-b border-border z-10">
      <span className="text-sm font-medium text-white">
        {t('round')} {currentRound}/{totalRounds}
      </span>
      <span className="text-sm font-medium text-white">
        {t('score')}: {totalScore.toLocaleString('it-IT')}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/game/ScoreBar.tsx
git commit -m "feat: implement ScoreBar component"
```

---

## Task 11: StreetViewPanel Component

**Files:**
- Create: `components/game/StreetViewPanel.tsx`

- [ ] **Step 1: Create components/game/StreetViewPanel.tsx**

```typescript
// components/game/StreetViewPanel.tsx
'use client';

import { useTranslations } from 'next-intl';

interface Props {
  lat: number;
  lng: number;
}

export default function StreetViewPanel({ lat, lng }: Props) {
  const t = useTranslations('game');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const src =
    `https://www.google.com/maps/embed/v1/streetview` +
    `?key=${apiKey}` +
    `&location=${lat},${lng}` +
    `&fov=90&pitch=0&heading=0`;

  return (
    <div className="absolute inset-0">
      {!apiKey ? (
        <div className="w-full h-full flex items-center justify-center bg-surface">
          <p className="text-muted text-sm">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set</p>
        </div>
      ) : (
        <iframe
          src={src}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          title={t('loading')}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/game/StreetViewPanel.tsx
git commit -m "feat: implement StreetViewPanel with free embed iframe"
```

---

## Task 12: GuessMap (Leaflet — Dynamic Import)

**Files:**
- Create: `components/game/GuessMapInner.tsx`
- Create: `components/game/GuessMap.tsx`

- [ ] **Step 1: Create components/game/GuessMapInner.tsx**

This is the actual Leaflet component. It is ONLY ever imported via `dynamic()` — never directly.

```typescript
// components/game/GuessMapInner.tsx
'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';

// Custom pin icon avoids Leaflet's broken default image loading in webpack
const pinIcon = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;background:#009246;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.6)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function ClickHandler({
  onPinDrop,
}: {
  onPinDrop: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPinDrop(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function SizeInvalidator({ trigger }: { trigger: boolean }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 310);
    return () => clearTimeout(timer);
  }, [trigger, map]);
  return null;
}

interface Props {
  onPinDrop: (lat: number, lng: number) => void;
  markerPos: [number, number] | null;
  isExpanded: boolean;
}

const WORLD_CENTER: LatLngExpression = [20, 0];

export default function GuessMapInner({ onPinDrop, markerPos, isExpanded }: Props) {
  return (
    <MapContainer
      center={WORLD_CENTER}
      zoom={2}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={false}
      minZoom={1}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <ClickHandler onPinDrop={onPinDrop} />
      <SizeInvalidator trigger={isExpanded} />
      {markerPos && <Marker position={markerPos} icon={pinIcon} />}
    </MapContainer>
  );
}
```

- [ ] **Step 2: Create components/game/GuessMap.tsx**

```typescript
// components/game/GuessMap.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';

const GuessMapInner = dynamic(() => import('./GuessMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface animate-pulse rounded-xl" />
  ),
});

interface Props {
  onPinDrop: (lat: number, lng: number) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

export default function GuessMap({
  onPinDrop,
  onConfirm,
  disabled = false,
}: Props) {
  const t = useTranslations('game');
  const [isExpanded, setIsExpanded] = useState(false);
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);

  const handlePinDrop = useCallback(
    (lat: number, lng: number) => {
      setMarkerPos([lat, lng]);
      onPinDrop(lat, lng);
    },
    [onPinDrop],
  );

  // Keyboard: M = toggle, Escape = collapse
  useEffect(() => {
    if (disabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') setIsExpanded(prev => !prev);
      if (e.code === 'Escape') setIsExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disabled]);

  return (
    <div
      className={[
        'absolute bottom-4 right-4 rounded-xl overflow-hidden',
        'border border-border shadow-2xl bg-surface',
        'transition-all duration-300',
        isExpanded ? 'w-80 h-64 sm:w-96 sm:h-72' : 'w-44 h-32',
        disabled ? 'opacity-50 pointer-events-none' : '',
      ].join(' ')}
      onMouseEnter={() => !disabled && setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="relative w-full h-full">
        <GuessMapInner
          onPinDrop={handlePinDrop}
          markerPos={markerPos}
          isExpanded={isExpanded}
        />

        {/* Hint when no pin dropped yet */}
        {!markerPos && (
          <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
            <p className="text-xs text-white bg-black/70 px-2 py-1 rounded">
              {t('dropPin')}
            </p>
          </div>
        )}

        {/* Conferma button — shown when pin is dropped */}
        {markerPos && (
          <div className="absolute bottom-2 left-2 right-2 z-[1000]">
            <button
              onClick={onConfirm}
              className="w-full bg-it-green hover:bg-it-green-dark text-white text-sm font-semibold py-2 rounded-lg transition-colors duration-150 active:scale-95"
            >
              {t('confirmGuess')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/game/GuessMapInner.tsx components/game/GuessMap.tsx
git commit -m "feat: implement GuessMap with Leaflet (dynamic import, no SSR)"
```

---

## Task 13: RoundResult Component

**Files:**
- Create: `components/game/RoundResult.tsx`

- [ ] **Step 1: Create components/game/RoundResult.tsx**

```typescript
// components/game/RoundResult.tsx
'use client';

import { useTranslations } from 'next-intl';
import type { RoundResult as RoundResultType } from '@/types/game';
import { scoreColor, scoreLabel } from '@/lib/scoring';

interface Props {
  round: RoundResultType;
  currentRound: number;
  totalRounds?: number;
  isLastRound: boolean;
  onNext: () => void;
}

export default function RoundResult({
  round,
  currentRound,
  totalRounds = 5,
  isLastRound,
  onNext,
}: Props) {
  const t = useTranslations('result');
  const tGame = useTranslations('game');

  const progressPct = Math.round((round.score / 5000) * 100);
  const distanceDisplay =
    round.distance_km < 1
      ? `< 1 ${t('km')}`
      : `${Math.round(round.distance_km).toLocaleString('it-IT')} ${t('km')}`;

  return (
    <div className="absolute inset-0 flex items-end justify-center pb-0 z-20">
      <div className="w-full max-w-lg bg-surface border-t border-border rounded-t-2xl p-6 shadow-2xl">
        {/* Round label */}
        <p className="text-xs text-muted mb-3">
          {t('roundOf', { round: currentRound, total: totalRounds })}
        </p>

        {/* Score label */}
        <p className="text-sm font-medium mb-1">
          {scoreLabel(round.score, (key: string) => t(key as Parameters<typeof t>[0]))}
        </p>

        {/* Distance + Score row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted">{t('distance')}</p>
            <p className="text-lg font-semibold font-mono">{distanceDisplay}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">{t('score')}</p>
            <p className={`text-4xl font-bold font-mono ${scoreColor(round.score)}`}>
              {round.score.toLocaleString('it-IT')}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-border rounded-full mb-5 overflow-hidden">
          <div
            className="h-full bg-it-green rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          className="w-full bg-it-green hover:bg-it-green-dark text-white font-semibold py-3 rounded-xl transition-colors duration-150 active:scale-[0.98]"
        >
          {isLastRound ? t('finalScore') : tGame('nextRound')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/game/RoundResult.tsx
git commit -m "feat: implement RoundResult overlay component"
```

---

## Task 14: ClassicoGame Component + Page

**Files:**
- Create: `components/game/ClassicoGame.tsx`
- Create: `app/[locale]/gioca/classico/page.tsx`

- [ ] **Step 1: Create components/game/ClassicoGame.tsx**

```typescript
// components/game/ClassicoGame.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useGameStore } from '@/lib/game/store';
import { getRandomLocationApi } from '@/lib/api';
import ScoreBar from './ScoreBar';
import StreetViewPanel from './StreetViewPanel';
import GuessMap from './GuessMap';
import RoundResult from './RoundResult';

export default function ClassicoGame() {
  const router = useRouter();
  const t = useTranslations('game');

  const {
    status,
    currentRound,
    currentLocation,
    pendingGuess,
    rounds,
    totalScore,
    usedLocationIds,
    startGame,
    locationLoaded,
    setPendingGuess,
    submitGuess,
    nextRound,
  } = useGameStore();

  // Start a fresh Classico game on mount
  useEffect(() => {
    startGame('classico');
  }, [startGame]);

  // Fetch next location whenever we enter LOADING_PANORAMA
  useEffect(() => {
    if (status !== 'LOADING_PANORAMA') return;

    let cancelled = false;
    getRandomLocationApi(usedLocationIds).then(loc => {
      if (!cancelled) locationLoaded(loc);
    });
    return () => {
      cancelled = true;
    };
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps
  // usedLocationIds and locationLoaded are stable references — intentionally omitted

  // Navigate to /risultato when game finishes
  useEffect(() => {
    if (status === 'FINAL_SCORE') {
      router.push('/risultato');
    }
  }, [status, router]);

  // Keyboard shortcuts: Space = confirm guess, Enter = next round
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (status === 'PLAYING' && e.code === 'Space' && pendingGuess) {
        e.preventDefault();
        submitGuess(pendingGuess);
      }
      if (status === 'RESULT' && e.code === 'Enter') {
        nextRound();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, pendingGuess, submitGuess, nextRound]);

  // Loading / transitioning state
  if (status === 'IDLE' || status === 'LOADING_PANORAMA') {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-background">
        <p className="text-muted text-sm animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  const lastRound = rounds[rounds.length - 1] ?? null;

  return (
    <div className="relative h-[calc(100vh-64px)] overflow-hidden bg-background flex flex-col">
      <ScoreBar currentRound={currentRound} totalScore={totalScore} />

      {/* Game viewport */}
      <div className="relative flex-1">
        {currentLocation && (
          <StreetViewPanel lat={currentLocation.lat} lng={currentLocation.lng} />
        )}

        {status === 'PLAYING' && (
          <GuessMap
            onPinDrop={(lat, lng) => setPendingGuess({ lat, lng })}
            onConfirm={() => {
              if (pendingGuess) submitGuess(pendingGuess);
            }}
          />
        )}

        {status === 'RESULT' && lastRound && (
          <RoundResult
            round={lastRound}
            currentRound={currentRound}
            isLastRound={currentRound >= 5}
            onNext={nextRound}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create app/[locale]/gioca/classico/page.tsx**

```typescript
// app/[locale]/gioca/classico/page.tsx
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import ClassicoGame from '@/components/game/ClassicoGame';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function ClassicoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ClassicoGame />;
}
```

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 4: Smoke-test the game**

```bash
npm run dev
```

Open `http://localhost:3000/gioca/classico`. Verify:
- Street View loads (if API key is set in `.env.local`)
- ScoreBar shows "Round 1/5"
- Minimap appears bottom-right
- Clicking the map drops a pin
- "Conferma" button appears after pin drop
- Clicking Conferma shows the RoundResult overlay
- "Prossimo Round" advances the round
- Round 5 result shows "Punteggio Finale" button
- Clicking it navigates to `/risultato` (will show empty state until Task 15)

- [ ] **Step 5: Commit**

```bash
git add components/game/ClassicoGame.tsx "app/[locale]/gioca/classico/page.tsx"
git commit -m "feat: implement ClassicoGame component and game page"
```

---

## Task 15: RisultatoScreen + Final Score Page

**Files:**
- Create: `components/game/RisultatoScreen.tsx`
- Create: `app/[locale]/risultato/page.tsx`

- [ ] **Step 1: Create components/game/RisultatoScreen.tsx**

```typescript
// components/game/RisultatoScreen.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useGameStore } from '@/lib/game/store';
import { saveScoreApi } from '@/lib/api';
import { scoreColor } from '@/lib/scoring';
import type { ScorePayload } from '@/types/game';

export default function RisultatoScreen() {
  const router = useRouter();
  const t = useTranslations('result');
  const tAuth = useTranslations('auth');
  const tGame = useTranslations('game');

  const { status, mode, rounds, totalScore, resetGame } = useGameStore();

  const [copied, setCopied] = useState(false);
  const [savedToDb, setSavedToDb] = useState(false);

  // Guard: if no completed game in store, redirect home
  useEffect(() => {
    if (status !== 'FINAL_SCORE') {
      router.replace('/');
    }
  }, [status, router]);

  // Persist score for authenticated users
  useEffect(() => {
    if (status !== 'FINAL_SCORE' || savedToDb || !mode || rounds.length === 0) return;

    const payload: ScorePayload = {
      mode,
      rounds: rounds.map(r => ({
        round_number: r.round_number,
        lat: r.lat,
        lng: r.lng,
        guess_lat: r.guess_lat,
        guess_lng: r.guess_lng,
        time_used_seconds: r.time_used_seconds,
      })),
    };

    saveScoreApi(payload)
      .then(() => setSavedToDb(true))
      .catch(() => {
        // 401 = guest user — expected, no action needed
      });
  }, [status, mode, rounds, savedToDb]);

  const handleShare = async () => {
    const text = t('shareTemplate', {
      mode: mode ?? 'classico',
      score: totalScore.toLocaleString('it-IT'),
    });
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePlayAgain = () => {
    resetGame();
    router.push('/gioca/classico');
  };

  if (status !== 'FINAL_SCORE') return null;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-2xl">
        {/* Final score */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted mb-2">{t('finalScore')}</p>
          <p className={`text-6xl font-bold font-mono ${scoreColor(totalScore)}`}>
            {totalScore.toLocaleString('it-IT')}
          </p>
          <p className="text-muted text-sm mt-1">/ 25.000</p>
        </div>

        {/* Round breakdown */}
        <div className="space-y-2 mb-8">
          {rounds.map(r => (
            <div
              key={r.round_number}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted">
                Round {r.round_number} —{' '}
                {r.distance_km < 1
                  ? `< 1 ${t('km')}`
                  : `${Math.round(r.distance_km).toLocaleString('it-IT')} ${t('km')}`}
              </span>
              <span className={`font-mono font-semibold ${scoreColor(r.score)}`}>
                {r.score.toLocaleString('it-IT')}
              </span>
            </div>
          ))}
        </div>

        {/* Guest prompt */}
        <div className="bg-background border border-border rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-muted mb-3">{tGame('guestPrompt')}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-it-green hover:bg-it-green-dark text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            {tAuth('signUp')}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 bg-surface border border-border hover:bg-border text-white text-sm font-semibold py-3 rounded-xl transition-colors"
          >
            {copied ? t('copiedToClipboard') : t('share')}
          </button>
          <button
            onClick={handlePlayAgain}
            className="flex-1 bg-it-green hover:bg-it-green-dark text-white text-sm font-semibold py-3 rounded-xl transition-colors"
          >
            {t('playAgain')}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create app/[locale]/risultato/page.tsx**

```typescript
// app/[locale]/risultato/page.tsx
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import RisultatoScreen from '@/components/game/RisultatoScreen';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RisultatoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RisultatoScreen />;
}
```

- [ ] **Step 3: Type-check + lint**

```bash
npm run type-check && npm run lint
```

Expected: no errors.

- [ ] **Step 4: End-to-end smoke test**

```bash
npm run dev
```

Open `http://localhost:3000/gioca/classico`. Play all 5 rounds:
1. Street View loads
2. Drop a pin → click Conferma → RoundResult appears with distance and score
3. Click "Prossimo Round" × 4 times
4. On round 5 result, button reads "Punteggio Finale" → click it
5. Browser navigates to `/risultato`
6. Final score screen shows total + round breakdown
7. "Condividi" copies share text to clipboard (check notification)
8. "Gioca ancora" resets store and navigates back to `/gioca/classico`

Test at 375px viewport (iPhone SE): open DevTools → Responsive → 375px. Verify:
- ScoreBar is readable
- Street View fills screen
- Minimap is visible and tappable bottom-right
- RoundResult panel is readable and scrollable if needed
- Final score screen is centered and full-width

- [ ] **Step 5: Commit**

```bash
git add components/game/RisultatoScreen.tsx "app/[locale]/risultato/page.tsx"
git commit -m "feat: implement RisultatoScreen and final score page"
```

---

## Acceptance Criteria Checklist

After all tasks complete, verify each criterion:

- [ ] `GET /api/location` returns `{ lat, lng, locationId }` — tested in Task 8 Step 2
- [ ] `POST /api/score` validates server-side + saves to Supabase — Task 9
- [ ] `lib/haversine.ts` exports `haversineKm` — Task 3
- [ ] `lib/scoring.ts` exports `calculateScore` with formula `Math.round(5000 * Math.exp(-distance / 2000))` — Task 4
- [ ] `lib/locations.ts` exports `getRandomLocation` — Task 5
- [ ] `lib/game/store.ts` implements full IDLE → LOADING_PANORAMA → PLAYING → RESULT → FINAL_SCORE machine — Task 6
- [ ] `lib/api.ts` has typed `getRandomLocationApi` and `saveScoreApi` wrappers — Task 7
- [ ] `StreetViewPanel.tsx` uses free embed iframe, NOT JS SDK — Task 11
- [ ] `GuessMap.tsx` uses dynamic import with `ssr: false` — Task 12
- [ ] `ScoreBar.tsx` shows round X/5 and total score — Task 10
- [ ] `RoundResult.tsx` shows distance, score, progress bar, next button — Task 13
- [ ] `/gioca/classico` page plays full 5-round game — Task 14
- [ ] `/risultato` page shows final score, share, play again, guest prompt — Task 15
- [ ] Zero hardcoded Italian/English strings in JSX — all use `useTranslations` keys
- [ ] Both `it.json` and `en.json` have all keys — Task 1
- [ ] No `any` TypeScript types — `npm run type-check` passes
- [ ] Leaflet dynamically imported — `GuessMap.tsx` uses `dynamic(() => import('./GuessMapInner'), { ssr: false })`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never referenced in client files — only `app/api/` routes use `createClient()` / `createAdminClient()`
- [ ] Mobile 375px viewport works — verified in Task 15 Step 4
