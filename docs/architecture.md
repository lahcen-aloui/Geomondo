# GeoMondo — Architecture

## System Overview

GeoMondo is a server-rendered Next.js 14 (App Router) web application. The backend is entirely Supabase (PostgreSQL + Auth + Realtime). There is no custom server — all server-side logic lives in Next.js API routes and Server Components.

```
Browser
  │
  ├── Next.js App (Vercel)
  │     ├── Server Components  → Supabase (server client, service role)
  │     ├── Client Components  → Supabase (anon client, RLS enforced)
  │     └── API Routes (/app/api/)
  │           ├── GET /api/location   → picks random coord from valid-coords.json
  │           └── POST /api/score     → validates + saves game result to Supabase
  │
  ├── Google Maps Embed API  (Street View iframe — FREE tier)
  ├── Leaflet + OpenStreetMap  (guess minimap — fully free)
  └── Supabase
        ├── PostgreSQL (game data, profiles, leaderboard view)
        ├── Auth (Google OAuth + magic link)
        ├── Realtime (future: multiplayer sync)
        └── Storage (future: avatars)
```

---

## Auth Flow

```
1. User clicks "Accedi"
2. Supabase Auth → Google OAuth OR magic link email
3. On first login: trigger or app code creates row in public.profiles
4. Session cookie set by @supabase/ssr middleware
5. Middleware (middleware.ts) refreshes session on every request
6. Server Components use createServerClient() — reads cookie, never exposes service key
7. Client Components use createBrowserClient() — anon key only, RLS enforced
```

### Guest Flow
- Guest plays without login
- Game state stored in Zustand (in-memory) during session
- After completing a game, a prompt appears: "Salva il tuo punteggio — Registrati"
- On registration, guest score is passed as query param and saved immediately

---

## Panorama Loading Pipeline

```
1. Client requests GET /api/location
2. API route reads /data/valid-coords.json (bundled at build time)
3. Returns a random { lat, lng } pair (pre-validated, no API call needed)
4. Client constructs Street View embed URL:
   https://www.google.com/maps/embed/v1/streetview
     ?key=NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
     &location={lat},{lng}
     &fov=90&pitch=0&heading=0
5. Iframe loads — Google serves Street View imagery directly
6. No per-load billing (Maps Embed API is free)
```

**Why pre-validated coords?** Calling Street View Metadata API on every game load costs ~$0.007 per request. With 50k pre-validated coordinates, zero API cost at runtime.

---

## Data Flow — Single Player Round

```
[LOBBY]
  User clicks "Gioca Classico"
  → Zustand: init game state (mode=classico, round=1, scores=[])

[LOADING_PANORAMA]
  → fetch GET /api/location
  → receive { lat, lng, locationId }
  → Zustand: set currentLocation
  → StreetViewPanel renders iframe

[PLAYING]
  → User pans Street View (iframe handles interaction)
  → GuessMap (Leaflet) visible in corner
  → User drops pin on minimap
  → Zustand: set pendingGuess { lat, lng }

[GUESSING]
  → User clicks "Conferma"
  → Client calculates: haversineKm(guess, truth)
  → Client calculates: score via scoring formula
  → Zustand: push round result

[RESULT]
  → RoundResult component shows: map overlay, distance, score
  → If round < 5: "Prossimo Round" → back to LOADING_PANORAMA
  → If round === 5: → FINAL_SCORE

[FINAL_SCORE]
  → Show total score, share button
  → If logged in: POST /api/score → save to Supabase
  → If guest: show registration prompt
```

---

## Scoring Architecture

All scoring happens **client-side** to avoid API latency during gameplay. The score is only trusted server-side when saved — server recalculates and validates before writing to DB.

```
Client: calculates score immediately for UX feedback
Server (/api/score): recalculates score from raw lat/lng data, rejects if delta > 5%
```

---

## Deployment Architecture

| Layer | Service | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploy from main branch |
| Database | Supabase | Managed PostgreSQL, eu-west region |
| CDN | Vercel Edge | Static assets, API route caching |
| Street View | Google (external) | Loaded in iframe, not our infra |
| Tiles | OpenStreetMap (external) | Leaflet fetches tiles directly |

---

## State Management

Zustand store (`/lib/game/store.ts`) holds all in-session game state:

```typescript
interface GameStore {
  mode: GameMode | null
  status: GameStatus
  currentRound: number
  currentLocation: Coordinate | null
  pendingGuess: Coordinate | null
  rounds: RoundResult[]
  totalScore: number
  secondsRemaining: number   // Sprint mode only

  // Actions
  startGame: (mode: GameMode) => void
  setLocation: (coord: Coordinate) => void
  submitGuess: (guess: Coordinate) => void
  nextRound: () => void
  resetGame: () => void
}
```

---

## Key Constraints

- **Never** use Google Maps JavaScript SDK for Street View (billing risk)
- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to client
- **Always** recalculate score server-side before writing to DB
- **Always** use RLS — no table should be accessible without a policy
