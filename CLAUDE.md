# GeoMondo — GeoGuessr Clone · CLAUDE.md

## Project Overview

Build **GeoMondo** — a full GeoGuessr clone targeting Italian users, in Italian language, covering the whole world. Free to play, no paywall. Monetized via ads + optional donations. Built with Next.js 14, TypeScript, Tailwind CSS, Supabase, and Google Maps API.

**Reference inspiration:** worldguessr.com (open source, MIT licensed on GitHub: codergautam/worldguessr)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Maps | Google Maps JavaScript API + Street View Embed API |
| Minimap | Leaflet.js (free, no cost) |
| Auth | Supabase Auth (Google OAuth + email magic link) |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime (for multiplayer) |
| Hosting | Vercel |
| i18n | next-intl (Italian default, English secondary) |

---

## Core Game Mechanics

### Single Player Flow
1. User lands on homepage → clicks "Gioca"
2. App picks a random coordinate with verified Street View coverage (using the `vali` coordinate dataset or a pre-built JSON list of ~50k valid coords)
3. Street View loads via **free embed iframe** (NOT the SDK — avoids per-load billing):
   ```
   https://www.google.com/maps/embed/v1/streetview?key=API_KEY&location=LAT,LNG&fov=90
   ```
4. User can look around (360° pan) but **cannot move** (NMPZ variant) OR can move (standard) — toggled in settings
5. Bottom-right: small collapsed Leaflet minimap of the world
6. User drops a pin on the minimap → clicks "Conferma"
7. App calculates distance (Haversine formula) → assigns score (0–5000 points, same as GeoGuessr)
8. Result screen: shows correct location, user's guess, distance in km, score
9. After 5 rounds: final score screen with share button

### Scoring Formula
```typescript
const MAX_SCORE = 5000;
const score = Math.round(MAX_SCORE * Math.exp(-distance / 2000));
// distance in km, score approaches 5000 as distance → 0
```

### Game Modes (build in this order)
1. **Classico** — 5 rounds, world map, no time limit (MVP)
2. **Sprint** — 5 rounds, 60 second timer per round
3. **Paese** — guess only the country, not the exact location (easier)
4. **Solo Italia** — Street View locations only within Italy

---

## Project Structure

```
/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx              # Homepage / landing
│   │   └── come-funziona/        # How it works page
│   ├── gioca/
│   │   ├── page.tsx              # Game mode selector
│   │   └── [mode]/
│   │       └── page.tsx          # Active game screen
│   ├── risultato/
│   │   └── page.tsx              # Round result screen
│   ├── classifica/
│   │   └── page.tsx              # Global leaderboard
│   ├── profilo/
│   │   └── [username]/
│   │       └── page.tsx          # User profile + stats
│   ├── api/
│   │   ├── location/
│   │   │   └── route.ts          # GET random valid Street View location
│   │   └── score/
│   │       └── route.ts          # POST save game score
│   └── layout.tsx
├── components/
│   ├── game/
│   │   ├── StreetViewPanel.tsx   # The Street View iframe embed
│   │   ├── GuessMap.tsx          # Leaflet minimap with pin drop
│   │   ├── RoundResult.tsx       # Distance + score after each round
│   │   ├── GameTimer.tsx         # Countdown for Sprint mode
│   │   └── ScoreBar.tsx          # Top bar showing round/score
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── ShareCard.tsx         # Shareable result card (OG image style)
│   └── layout/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── lib/
│   ├── haversine.ts              # Distance calculation
│   ├── scoring.ts                # Score formula
│   ├── locations.ts              # Random coord picker + Street View verification
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── data/
│   └── valid-coords.json         # Pre-validated list of ~50k Street View coords
├── supabase/
│   └── migrations/
│       └── 001_initial.sql
└── public/
    └── og-image.png
```

---

## Supabase Database Schema

```sql
-- Run this in Supabase SQL Editor

-- Users (extended from auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  total_games INTEGER DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game sessions
CREATE TABLE public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  mode TEXT NOT NULL CHECK (mode IN ('classico', 'sprint', 'paese', 'italia')),
  total_score INTEGER NOT NULL,
  rounds JSONB NOT NULL, -- array of {lat, lng, guess_lat, guess_lng, distance_km, score}
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard view
CREATE VIEW public.leaderboard AS
  SELECT 
    p.username,
    p.avatar_url,
    p.best_score,
    p.total_games,
    ROUND(p.total_score::numeric / NULLIF(p.total_games, 0)) AS avg_score
  FROM public.profiles p
  ORDER BY p.best_score DESC
  LIMIT 100;

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own games" ON public.games FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own games" ON public.games FOR SELECT USING (auth.uid() = user_id);
```

---

## Key Implementation Details

### 1. Random Location Generator (`lib/locations.ts`)

**Strategy:** Use a pre-built JSON file of ~50,000 valid Street View coordinates (lat/lng pairs confirmed to have Street View coverage). Source: the open-source `vali-nal` dataset used by WorldGuessr.

```typescript
import coords from '@/data/valid-coords.json';

export function getRandomLocation(): { lat: number; lng: number } {
  const index = Math.floor(Math.random() * coords.length);
  return coords[index];
}
```

**Do NOT** call the Street View Metadata API on every game load — it costs money. Use the pre-validated dataset only.

### 2. Street View Embed (`components/game/StreetViewPanel.tsx`)

Use the **free** Street View embed URL, NOT the JavaScript SDK:

```typescript
const streetViewUrl = `https://www.google.com/maps/embed/v1/streetview` +
  `?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}` +
  `&location=${lat},${lng}` +
  `&fov=90&pitch=0&heading=0`;

return (
  <iframe
    src={streetViewUrl}
    className="w-full h-full"
    allowFullScreen
    loading="lazy"
  />
);
```

> ⚠️ This embed is FREE and not billed per load under Google's Maps Embed API pricing as of 2024. Verify this in Google Cloud Console before launch.

### 3. Guess Map (`components/game/GuessMap.tsx`)

Use **Leaflet** (free, no API cost) with OpenStreetMap tiles:

```typescript
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// Collapsed in corner, expands on hover/click
// User clicks to place marker
// "Conferma" button submits the guess
```

### 4. Haversine Distance (`lib/haversine.ts`)

```typescript
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
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

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Google Maps API Key restrictions:** In Google Cloud Console, restrict to:
- HTTP referrers: `geomondo.it/*`, `localhost:3000/*`
- APIs allowed: Maps Embed API only (NOT JavaScript API SDK unless needed)

---

## Design & UX

### Visual Style
- Dark theme primary (#0f0f0f background, #1a1a1a cards)
- Accent color: Italian flag green (#009246) and red (#ce2b37)
- Clean, modern — inspired by GeoGuessr's dark UI
- Mobile-first, fully responsive

### Homepage Sections
1. Hero: "Indovina dove sei nel mondo" + CTA "Gioca Gratis"
2. How it works: 3-step visual (Street View → Pin drop → Score)
3. Live leaderboard preview (top 5 players)
4. Game modes grid

### Key UX Rules
- Game starts in 1 click — no account required for guest play
- Guest scores are stored in localStorage; prompt to save after game ends
- Keyboard shortcut: `Space` = confirm guess, `M` = toggle map expand
- After result: prominent share button (generates canvas image with score)

---

## i18n

Default language: **Italian (it)**. Secondary: English (en).

Use `next-intl`. All UI strings must be in `/messages/it.json` and `/messages/en.json`. No hardcoded Italian strings in JSX.

Key namespaces:
- `game.*` — in-game UI
- `result.*` — result screen
- `home.*` — landing page
- `nav.*` — navigation
- `modes.*` — game mode names/descriptions

---

## Build Order (Claude Code tasks)

Build strictly in this order. Complete and test each phase before moving on.

### Phase 1 — Foundation (Day 1)
- [ ] Init Next.js 14 project with TypeScript + Tailwind
- [ ] Set up Supabase client (client.ts + server.ts)
- [ ] Run database migrations (SQL above)
- [ ] Set up next-intl with Italian + English
- [ ] Create basic Navbar + Footer layout
- [ ] Homepage shell (hero section only)

### Phase 2 — Core Game (Day 2-3)
- [ ] Download/generate `valid-coords.json` (use WorldGuessr's vali-nal dataset from GitHub)
- [ ] Build `getRandomLocation()` in `lib/locations.ts`
- [ ] Build `StreetViewPanel.tsx` with embed iframe
- [ ] Build `GuessMap.tsx` with Leaflet + pin drop
- [ ] Build `ScoreBar.tsx` (round counter + current total)
- [ ] Build `/gioca/classico/page.tsx` — full 5-round game loop
- [ ] Build `RoundResult.tsx` — show distance + score after each round
- [ ] Build final score screen with share button

### Phase 3 — Auth + Persistence (Day 4)
- [ ] Supabase Auth: Google OAuth + magic link
- [ ] Auto-create profile on first login (trigger or app logic)
- [ ] Save game results to `games` table after completion
- [ ] Update `profiles.best_score` and `profiles.total_games`
- [ ] Guest → registered conversion flow (save guest score after signup)

### Phase 4 — Leaderboard + Profiles (Day 5)
- [ ] `/classifica` page — global leaderboard from Supabase view
- [ ] `/profilo/[username]` — stats + recent games
- [ ] Homepage leaderboard preview widget

### Phase 5 — Additional Modes (Day 6-7)
- [ ] Sprint mode (GameTimer component + 60s countdown)
- [ ] Italia mode (filter coords to Italy bounding box: lat 36-47, lng 6-19)
- [ ] Paese mode (country-level guess, simpler map UI)

### Phase 6 — Polish + Launch (Day 8)
- [ ] SEO: meta tags, OG image, sitemap.xml, robots.txt
- [ ] Performance: lazy load Leaflet, optimize images
- [ ] Google AdSense integration (non-intrusive banner below result screen)
- [ ] Donation button (Ko-fi or PayPal link)
- [ ] Deploy to Vercel, configure custom domain
- [ ] Set up Vercel Analytics

---

## Important Constraints

1. **Never use the Google Maps JavaScript SDK** for Street View — use the free Embed API only
2. **Never hardcode strings** in JSX — use next-intl keys only
3. **RLS must be enabled** on all Supabase tables before launch
4. **Guest play must work** without any login required
5. **Mobile must work** — test on 375px viewport throughout
6. Keep bundle size lean — dynamic import Leaflet (it's heavy)

---

## Getting Started

```bash
npx create-next-app@latest geomondo --typescript --tailwind --app
cd geomondo
npm install @supabase/supabase-js @supabase/ssr next-intl leaflet react-leaflet @types/leaflet
```

Then set up `.env.local` with the keys above and run migrations in Supabase dashboard.
