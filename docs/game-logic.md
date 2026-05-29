# GeoMondo — Game Logic

## State Machine

All game state lives in the Zustand store (`/lib/game/store.ts`). States are strictly sequential — no skipping.

```
IDLE
  │
  └─► LOADING_PANORAMA  (fetch /api/location)
          │
          └─► PLAYING  (user views Street View, can drop pin)
                  │
                  └─► RESULT  (show distance + score for this round)
                          │
                          ├─► LOADING_PANORAMA  (if round < 5, next round)
                          │
                          └─► FINAL_SCORE  (if round === 5)
                                  │
                                  └─► IDLE  (user clicks "Nuova Partita")
```

### State Definitions

| State | Description | Can transition to |
|---|---|---|
| `IDLE` | No active game | `LOADING_PANORAMA` |
| `LOADING_PANORAMA` | Fetching next location | `PLAYING` |
| `PLAYING` | User viewing Street View + minimap | `RESULT` |
| `RESULT` | Showing round result | `LOADING_PANORAMA` or `FINAL_SCORE` |
| `FINAL_SCORE` | Showing total score | `IDLE` |

### State Transition Actions

| Action | Trigger | Transition |
|---|---|---|
| `startGame(mode)` | User clicks play button | `IDLE → LOADING_PANORAMA` |
| `locationLoaded(coord)` | `/api/location` response | `LOADING_PANORAMA → PLAYING` |
| `submitGuess(coord)` | User clicks "Conferma" | `PLAYING → RESULT` |
| `nextRound()` | User clicks "Prossimo Round" | `RESULT → LOADING_PANORAMA` |
| `finishGame()` | Called after round 5 result | `RESULT → FINAL_SCORE` |
| `resetGame()` | User clicks "Nuova Partita" | `FINAL_SCORE → IDLE` |
| `timeout()` | Sprint mode timer hits 0 | `PLAYING → RESULT` (with null guess) |

---

## Scoring Formula

```typescript
// Standard formula (same as GeoGuessr exponential decay)
export function calculateScore(distanceKm: number): number {
  const MAX_SCORE = 5000;
  return Math.round(MAX_SCORE * Math.exp(-distanceKm / 2000));
}
```

| Distance | Score |
|---|---|
| 0 km (perfect) | 5000 |
| 100 km | 4753 |
| 500 km | 3894 |
| 1000 km | 3033 |
| 2000 km | 1839 |
| 5000 km | 822 |
| 10000 km | 135 |
| 20000 km (antipode) | ~0 |

**Total max score per game:** 25,000 (5 rounds × 5,000)

---

## Game Modes

### Classico
- 5 rounds, world map
- No time limit
- Player can look around freely (360° pan via Street View embed)
- Movement: disabled (NMPZ — No Move, Pan, Zoom variant)

### Sprint
- 5 rounds, world map
- 60 second timer per round
- Auto-submits guess when timer hits 0 (submits current pin, or map center if no pin dropped)
- Time does NOT affect score formula — only pressure mechanic

### Italia
- 5 rounds, Italy only
- Coordinates filtered to bounding box: `lat 36–47, lng 6–19`
- Same scoring formula
- Same rules as Classico

### Paese *(Phase 2)*
- Player guesses the country, not exact location
- Score: 5000 (correct country), 2500 (adjacent country), 0 (wrong)
- No Haversine needed — country code comparison only

---

## Round Timer (Sprint Mode)

```typescript
// In GameTimer component:
useEffect(() => {
  if (status !== 'PLAYING' || mode !== 'sprint') return;

  const interval = setInterval(() => {
    if (document.visibilityState === 'hidden') return; // pause on tab blur

    decrementTimer(); // Zustand action

    if (secondsRemaining <= 0) {
      clearInterval(interval);
      submitGuess(pendingGuess ?? mapCenter); // auto-submit
    }
  }, 1000);

  return () => clearInterval(interval);
}, [status, secondsRemaining]);
```

**Tab blur behaviour:** Timer pauses when `document.visibilityState === 'hidden'`. Resumes when tab regains focus. This prevents penalty for accidental tab switches.

---

## Multi-Round Flow Detail

```typescript
// Zustand store actions:

submitGuess(guess: Coordinate) {
  const distance = haversineKm(currentLocation, guess);
  const score = calculateScore(distance);

  const roundResult: RoundResult = {
    round_number: currentRound,
    ...currentLocation,
    ...guess,
    distance_km: distance,
    score,
    time_used_seconds: ROUND_DURATION - secondsRemaining,
  };

  set(state => ({
    rounds: [...state.rounds, roundResult],
    totalScore: state.totalScore + score,
    status: 'RESULT',
  }));
}

nextRound() {
  const next = get().currentRound + 1;
  if (next > 5) {
    set({ status: 'FINAL_SCORE' });
  } else {
    set({ currentRound: next, pendingGuess: null, status: 'LOADING_PANORAMA' });
  }
}
```

---

## Guest vs Authenticated Behaviour

| Action | Guest | Authenticated |
|---|---|---|
| Play game | ✅ | ✅ |
| See result | ✅ | ✅ |
| Score saved to DB | ❌ | ✅ (POST /api/score) |
| Appear on leaderboard | ❌ | ✅ |
| View profile | ❌ | ✅ |
| Share score card | ✅ | ✅ |

After FINAL_SCORE, if guest: show modal "Salva il tuo punteggio" with sign-up options.

---

## Deduplication

Within a single game session, the same coordinate should never appear twice. The client tracks `usedLocationIds: string[]` in the Zustand store and passes `?exclude=id1,id2` to `/api/location`.

---

## Keyboard Shortcuts

| Key | Action | State required |
|---|---|---|
| `Space` | Submit guess (same as "Conferma") | `PLAYING` |
| `M` | Toggle minimap expand/collapse | `PLAYING` |
| `Enter` | Continue to next round | `RESULT` |
| `Escape` | Collapse minimap | `PLAYING` |
