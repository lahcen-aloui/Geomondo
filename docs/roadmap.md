# GeoMondo — Roadmap

## Status Key
- ✅ Done
- 🔄 In Progress
- ⬜ Not Started
- ❌ Blocked

---

## Phase 1 — Foundation

**Goal:** Project scaffolding, DB, i18n, basic layout. No game yet.

| Task | Status | Notes |
|---|---|---|
| Init Next.js 14 + TypeScript + Tailwind | ✅ | Done |
| Set up Supabase client (client.ts + server.ts) | ✅ | Done |
| Configure next-intl (Italian + English) | ✅ | Done |
| Create basic Navbar + Footer | ⬜ | |
| Homepage shell (hero section only) | ⬜ | |
| Run DB migrations (profiles, games, RLS) | ⬜ | See docs/db-schema.md |
| Set up auth trigger (auto-create profile) | ⬜ | |
| Create .env.example | ⬜ | |
| Create supabase/migrations/001_initial.sql | ⬜ | |

---

## Phase 2 — Core Game (MVP)

**Goal:** A fully playable single-player Classico mode. End-to-end game loop working.

| Task | Status | Notes |
|---|---|---|
| Download valid-coords.json dataset | ⬜ | From WorldGuessr (MIT) |
| Build `getRandomLocation()` in lib/locations.ts | ⬜ | |
| Build GET /api/location route | ⬜ | |
| Build StreetViewPanel.tsx (embed iframe) | ⬜ | Use free Embed API |
| Build GuessMap.tsx (Leaflet + pin drop) | ⬜ | |
| Build ScoreBar.tsx (round counter + score) | ⬜ | |
| Build Zustand game store | ⬜ | See docs/game-logic.md |
| Build /gioca/classico/page.tsx (full 5-round loop) | ⬜ | |
| Build RoundResult.tsx | ⬜ | |
| Build FinalScore screen + share button | ⬜ | |
| Wire up Haversine + scoring formula | ⬜ | lib/haversine.ts, lib/scoring.ts |
| Mobile QA (375px) | ⬜ | |

---

## Phase 3 — Auth + Persistence

**Goal:** Users can sign in, scores are saved, profiles exist.

| Task | Status | Notes |
|---|---|---|
| Supabase Auth: Google OAuth | ⬜ | |
| Supabase Auth: magic link email | ⬜ | |
| POST /api/score route (validate + save) | ⬜ | Server-side score recalc |
| Guest → registered conversion flow | ⬜ | Pass score after signup |
| Profile stats update function | ⬜ | update_profile_stats() |

---

## Phase 4 — Leaderboard + Profiles

**Goal:** Social layer. Players can see rankings and each other's profiles.

| Task | Status | Notes |
|---|---|---|
| /classifica page (global leaderboard) | ⬜ | Uses leaderboard view |
| GET /api/leaderboard route | ⬜ | |
| /profilo/[username] page | ⬜ | Stats + recent games |
| Homepage leaderboard widget (top 5) | ⬜ | |

---

## Phase 5 — Additional Game Modes

**Goal:** Sprint and Italia modes live. Paese mode scoped.

| Task | Status | Notes |
|---|---|---|
| Sprint mode — GameTimer component | ⬜ | 60s countdown, tab pause |
| Sprint mode — auto-submit on timeout | ⬜ | |
| Italia mode — coord filter (lat 36–47, lng 6–19) | ⬜ | Simple filter on dataset |
| /gioca/sprint/page.tsx | ⬜ | |
| /gioca/italia/page.tsx | ⬜ | |
| Paese mode — country guess UI | ⬜ | Phase 5 stretch goal |

---

## Phase 6 — Polish + Launch

**Goal:** Production-ready. SEO, performance, monetisation, deploy.

| Task | Status | Notes |
|---|---|---|
| SEO: meta tags, OG image per page | ⬜ | |
| sitemap.xml + robots.txt | ⬜ | |
| Lazy load Leaflet (dynamic import) | ⬜ | Reduce initial bundle |
| Performance audit (Lighthouse ≥ 90) | ⬜ | |
| Google AdSense integration | ⬜ | Banner below result screen |
| Ko-fi / PayPal donation button | ⬜ | Footer + final score screen |
| Deploy to Vercel | ⬜ | |
| Configure custom domain (geomondo.it) | ⬜ | |
| Set up Vercel Analytics | ⬜ | |
| Final mobile QA across modes | ⬜ | |

---

## Backlog (Phase 7+)

- Multiplayer rooms (Supabase Realtime)
- Daily Challenge mode (same location for all players each day)
- Country-specific modes (Francia, Spagna, etc.)
- Tournaments
- Friends / following system
- Custom map collections (user-curated location sets)
- Discord community integration
