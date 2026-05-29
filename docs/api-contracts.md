# GeoMondo — API Contracts

## Conventions

- All routes live under `/app/api/`
- All responses are JSON
- Errors follow: `{ "error": "message", "code": "ERROR_CODE" }`
- Auth routes require a valid Supabase session cookie (set by middleware)
- Server uses `SUPABASE_SERVICE_ROLE_KEY` — never exposed to client

---

## GET `/api/location`

Returns a random valid Street View coordinate from the pre-validated dataset.

### Request
No parameters required.

```
GET /api/location
```

### Response `200 OK`
```json
{
  "lat": 48.8566,
  "lng": 2.3522,
  "locationId": "coord_14823"
}
```

| Field | Type | Description |
|---|---|---|
| `lat` | `number` | Latitude (-90 to 90) |
| `lng` | `number` | Longitude (-180 to 180) |
| `locationId` | `string` | Index-based ID for tracking (e.g. `coord_14823`) |

### Errors
| Status | Code | Reason |
|---|---|---|
| 500 | `COORDS_NOT_LOADED` | valid-coords.json failed to load |

### Implementation Notes
- Reads from `/data/valid-coords.json` (bundled at build time, no external API call)
- `locationId` is simply `coord_${index}` — used for deduplication in multi-round games
- Future: accept `?exclude=id1,id2` to avoid repeat locations in one game session

---

## POST `/api/score`

Validates and saves a completed game. Server recalculates score from raw round data before writing.

### Request

Requires authenticated session (Supabase cookie). Guests get a `401` — client should prompt sign-up.

```
POST /api/score
Content-Type: application/json
```

```json
{
  "mode": "classico",
  "rounds": [
    {
      "round_number": 1,
      "lat": 48.8566,
      "lng": 2.3522,
      "guess_lat": 48.9000,
      "guess_lng": 2.4000,
      "time_used_seconds": 34
    }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `mode` | `string` | ✅ | One of: `classico`, `sprint`, `paese`, `italia` |
| `rounds` | `array` | ✅ | 1–5 round objects |
| `rounds[].round_number` | `number` | ✅ | 1-indexed |
| `rounds[].lat` | `number` | ✅ | True location latitude |
| `rounds[].lng` | `number` | ✅ | True location longitude |
| `rounds[].guess_lat` | `number` | ✅ | User's guessed latitude |
| `rounds[].guess_lng` | `number` | ✅ | User's guessed longitude |
| `rounds[].time_used_seconds` | `number` | ❌ | Only for sprint mode |

### Response `200 OK`
```json
{
  "gameId": "uuid-here",
  "totalScore": 23450,
  "rounds": [
    {
      "round_number": 1,
      "distance_km": 6.2,
      "score": 4987
    }
  ]
}
```

### Errors
| Status | Code | Reason |
|---|---|---|
| 401 | `NOT_AUTHENTICATED` | No valid session |
| 400 | `INVALID_MODE` | Unknown game mode |
| 400 | `INVALID_ROUNDS` | Wrong number of rounds or malformed data |
| 422 | `SCORE_MISMATCH` | Client score vs server recalc differs by >5% |
| 500 | `DB_ERROR` | Supabase insert failed |

### Server Validation Logic
```typescript
// Server recalculates every round:
const serverScore = rounds.reduce((total, round) => {
  const distance = haversineKm(round.lat, round.lng, round.guess_lat, round.guess_lng);
  return total + calculateScore(distance);
}, 0);

// Reject if client cheated:
if (Math.abs(serverScore - clientScore) / serverScore > 0.05) {
  return Response.json({ error: 'Score mismatch', code: 'SCORE_MISMATCH' }, { status: 422 });
}
```

---

## GET `/api/leaderboard`

Returns top 100 players. Public — no auth required.

### Request
```
GET /api/leaderboard?limit=10&offset=0
```

| Param | Type | Default | Description |
|---|---|---|---|
| `limit` | `number` | `100` | Max 100 |
| `offset` | `number` | `0` | Pagination offset |

### Response `200 OK`
```json
{
  "players": [
    {
      "rank": 1,
      "username": "geoking",
      "avatar_url": "https://...",
      "best_score": 24980,
      "total_games": 47,
      "avg_score": 19230
    }
  ],
  "total": 1032
}
```

---

## Future Routes (Phase 2+)

```
POST /api/room          → Create multiplayer room
GET  /api/room/:id      → Get room state
POST /api/room/:id/join → Join room
WS   /api/room/:id/sync → Supabase Realtime channel (not an API route)
```

---

## Client Usage Pattern

All API calls from client components go through a `/lib/api.ts` wrapper — never raw `fetch` calls scattered across components.

```typescript
// lib/api.ts
export async function getRandomLocation(): Promise<LocationResponse> { ... }
export async function saveScore(payload: ScorePayload): Promise<ScoreResponse> { ... }
export async function getLeaderboard(limit?: number): Promise<LeaderboardResponse> { ... }
```
