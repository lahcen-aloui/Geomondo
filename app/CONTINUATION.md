# GeoMondo — Continuation Prompt
## Use this at the start of every new Claude Code session

---

## What is GeoMondo?

GeoMondo is a full GeoGuessr clone built for Italian-speaking users, covering the whole world. Free to play, no paywall. Italian language default (English secondary). Monetized via ads + donations.

**Live reference:** geoguessr.com  
**Open source inspiration:** github.com/codergautam/worldguessr (MIT license)  
**Project location:** `~/Downloads/GeoMondo`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript strict |
| Styling | Tailwind CSS |
| Street View | Google Maps Embed API (FREE iframe, NOT the JS SDK) |
| Minimap | Leaflet.js + OpenStreetMap (free) |
| Auth | Supabase Auth (Google OAuth + magic link) |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime (multiplayer later) |
| i18n | next-intl (it default, en secondary) |
| Hosting | Vercel |

---

## Critical Rules (never break these)

1. **NEVER use Google Maps JavaScript SDK** for Street View — use the free Embed API iframe only
2. **NEVER hardcode strings in JSX** — all text via next-intl keys in `/messages/it.json` and `/messages/en.json`
3. **RLS must be enabled** on all Supabase tables
4. **Guest play must work** without login — scores saved in localStorage
5. **Mobile first** — test at 375px viewport throughout
6. **Dynamic import Leaflet** — it's heavy, never import at top level
7. **Dark mode only** — `<html className="dark">` always, no light mode toggle

---

## Supabase Project

- **Project name:** GeoMondo
- **Tables:** `profiles`, `games`
- **View:** `leaderboard`
- **RLS:** enabled on all tables
- **Auth providers:** Google OAuth, magic link email

### Schema Summary
```sql
profiles (id, username, avatar_url, total_games, total_score, best_score, created_at)
games (id, user_id, mode, total_score, rounds JSONB, completed_at)
leaderboard VIEW (username, avatar_url, best_score, total_games, avg_score)
```

---

## Game Modes

| Mode | Description | Status |
|---|---|---|
| Classico | 5 rounds, world map, no timer | Build first (MVP) |
| Sprint | 5 rounds, 60s timer per round | Phase 5 |
| Italia | Street View only within Italy | Phase 5 |
| Paese | Guess country only, not exact location | Phase 5 |

---

## Scoring Formula

```typescript
const score = Math.round(5000 * Math.exp(-distanceKm / 2000));
// 0 km = 5000 pts, 2000 km ≈ 1839 pts, 5000 km ≈ 287 pts
```

---

## Street View Embed (FREE — use this always)

```typescript
const url = `https://www.google.com/maps/embed/v1/streetview`
  + `?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  + `&location=${lat},${lng}`
  + `&fov=90&pitch=0&heading=0`;

return <iframe src={url} className="w-full h-full" allowFullScreen />;
```

---

## Random Location Strategy

Use pre-built `/data/valid-coords.json` — a list of ~50k verified Street View coordinates. Source: WorldGuessr's open-source `cities.json` dataset. Never call Street View Metadata API at runtime (costs money).

```typescript
import coords from '@/data/valid-coords.json';
export const getRandomLocation = () => coords[Math.floor(Math.random() * coords.length)];
```

---

## Design System Summary (full details in DESIGN.md)

```
Background:     #1a1a2e (primary), #16213e (secondary), #1e1e2e (cards)
Accent:         #c8f04c (GeoGuessr yellow-green) — buttons, highlights
Text:           #ffffff (primary), #a0aec0 (secondary)
Fonts:          Poppins (headings), Inter (body), JetBrains Mono (scores)
Border radius:  9999px (buttons), 16px (cards), 12px (minimap)
Buttons:        Pill-shaped, accent background, dark text
Logo:           "Geo" white + "Mondo" #c8f04c, Poppins 700
```

---

## Project File Structure

```
GeoMondo/
├── CLAUDE.md               ← Full build spec
├── DESIGN.md               ← Full design system
├── CONTINUATION.md         ← This file
├── .env.local              ← API keys (not committed)
├── app/
│   ├── (marketing)/page.tsx        ← Homepage
│   ├── gioca/[mode]/page.tsx       ← Game screen
│   ├── risultato/page.tsx          ← Result screen
│   ├── classifica/page.tsx         ← Leaderboard
│   ├── profilo/[username]/page.tsx ← User profile
│   └── api/
│       ├── location/route.ts       ← GET random location
│       └── score/route.ts          ← POST save score
├── components/
│   ├── game/
│   │   ├── StreetViewPanel.tsx
│   │   ├── GuessMap.tsx
│   │   ├── RoundResult.tsx
│   │   ├── GameTimer.tsx
│   │   └── ScoreBar.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── ShareCard.tsx
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── lib/
│   ├── haversine.ts
│   ├── scoring.ts
│   ├── locations.ts
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── data/
│   └── valid-coords.json
├── messages/
│   ├── it.json             ← Italian (default)
│   └── en.json             ← English
└── supabase/
    └── migrations/
        └── 001_initial.sql
```

---

## Build Phases

| Phase | Tasks | Status |
|---|---|---|
| 1 | Next.js init, Supabase client, next-intl, Navbar, Footer, homepage hero | ⬜ Not started |
| 2 | valid-coords.json, StreetViewPanel, GuessMap (Leaflet), ScoreBar, full 5-round game loop, RoundResult, final score screen | ⬜ Not started |
| 3 | Supabase Auth, profile creation, save game results, guest→registered flow | ⬜ Not started |
| 4 | Leaderboard page, profile page, homepage leaderboard widget | ⬜ Not started |
| 5 | Sprint mode, Italia mode, Paese mode | ⬜ Not started |
| 6 | SEO, performance, AdSense, donation button, Vercel deploy | ⬜ Not started |

**Update the Status column as phases complete.**

---

## How to Resume a Session

Paste this at the start of every new Claude Code session:

> "Read CLAUDE.md, DESIGN.md, and CONTINUATION.md in this project. The current status is: [paste the Phase table above with updated statuses]. Continue from where we left off. Follow all rules in CLAUDE.md strictly. Use the design system in DESIGN.md for all UI. Do not repeat completed work."

---

## Environment Variables Needed

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=       ← Google Cloud Console → Maps Embed API
NEXT_PUBLIC_SUPABASE_URL=              ← Supabase project settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=         ← Supabase project settings → API
SUPABASE_SERVICE_ROLE_KEY=             ← Supabase project settings → API
```

---

## Install Command (if starting fresh)

```bash
cd ~/Downloads/GeoMondo
npx create-next-app@latest . --typescript --tailwind --app
npm install @supabase/supabase-js @supabase/ssr next-intl leaflet react-leaflet @types/leaflet lucide-react framer-motion
```

---

## Key URLs

- Supabase dashboard: supabase.com/dashboard
- Google Cloud Console: console.cloud.google.com
- Vercel deploy: vercel.com
- WorldGuessr reference repo: github.com/codergautam/worldguessr
