# GeoMondo — Pre-Launch Readiness Audit
**Date:** 2026-05-28  
**Benchmarks:** GeoGuessr (geoguessr.com) · OpenGuessr (openguessr.com)  
**Codebase:** Next.js 15 / TypeScript / Tailwind / Supabase / Google Maps JS API + Mapillary  

---

## Executive Summary

GeoMondo has a solid, well-architected foundation: server-side score validation, RLS-protected Supabase schema, clean Zustand game state, i18n scaffolding, and a complete 5-round classic mode loop. However, several issues range from **critical blockers** (a data lie in the UI, no rate limiting on the leaderboard API) to **high-priority gaps** (no GDPR pages, missing 3 locales, guest play not actually working, timer not wired). The app is **not ready for public launch today**, but it could be with roughly 2–3 focused days of work.

---

## 1. Core Game Loop

### What the complete player flow looks like (GeoGuessr reference)

```
Sign up / play as guest
  → Choose game mode
    → Round loads (Street View panorama appears)
      → Player explores: pan, zoom, move forward/backward
        → Player drops pin on mini-map
          → Player confirms guess
            → Round result screen: score + distance + map showing both pins + line
              → Next round (or final results if round 5)
                → Final score screen: total score, per-round breakdown
                  → Prompt to share / play again / save to profile
```

### What GeoMondo has ✅

- Full 5-round loop with Zustand state machine (`IDLE → LOADING_PANORAMA → PLAYING → RESULT → FINAL_SCORE`)
- Google Maps JS Street View panorama with compass, bearing HUD, navigation toolbar
- Leaflet mini-map with pin-drop and confirm-guess button
- Per-round result screen with polyline between correct and guessed locations
- Final score screen with per-round breakdown and share-to-clipboard
- Round deduplication (excludes already-used location IDs)
- Server-side score recalculation (client cannot inflate scores)
- `LOCATION_ERROR` recovery flow (retry up to 3 times)

### What's missing or broken ⚠️

**`time_used_seconds` is always 0.** In `store.ts`, `submitGuess()` hardcodes `time_used_seconds: 0`. The elapsed timer is tracked in `ClassicoGame.tsx` as component state (`elapsed`) but is never passed into `submitGuess`. The field exists in the schema and is logged to the database on every game — it's just always zero, silently. Sprint mode depends on this.

**Sprint mode timer is not wired.** `secondsRemaining` exists in the store and `decrementTimer()` is defined, but no game component calls `decrementTimer()` on a tick, and nothing auto-submits a guess when the timer reaches 0. Sprint is currently unplayable even when the route is enabled.

**Guest play silently fails instead of saving locally.** Your `CONTINUATION.md` spec says "scores saved in localStorage" for guests, and the `game.guestPrompt` i18n key exists. But `RisultatoScreen.tsx` calls `saveScoreApi()` and on 401 does a silent `.catch(() => {})` — no localStorage, no prompt, no feedback. A guest completes a full 5-round game and gets no record of it. This is a significant UX hole that discourages registration.

**No "no movement" or restricted modes.** GeoGuessr's most popular competitive format (NMPZ — No Move, No Pan, No Zoom) is not planned. This is fine at launch, but it's the mode that drives the most discussion and community engagement.

**Result screen has no map on mobile.** The `RoundResult` overlay uses a Google Maps component that can be very tall on small viewports and has no height cap on mobile. Test at 375px.

**Paese and Italia modes are not built.** The route `/gioca/paese` and `/gioca/italia` exist in the type system but the game component only handles `'classico'`. Navigating to those routes will either 404 or render the wrong game.

---

## 2. Essential Features for Launch (MVP)

### GeoGuessr vs. OpenGuessr vs. GeoMondo comparison

| Feature | GeoGuessr | OpenGuessr | GeoMondo (now) | Launch requirement |
|---|---|---|---|---|
| Classic 5-round mode | ✅ | ✅ | ✅ | **Required** |
| Timed mode | ✅ Pro | ✅ | 🟡 Built but broken | Nice-to-have |
| No-move mode | ✅ Pro | ✅ | ❌ | Nice-to-have |
| Country-only mode | ✅ | ✅ | 🟡 Stub only | Nice-to-have |
| Guest play | Limited | ✅ | 🟡 Broken | **Required** |
| User accounts | ✅ | ✅ | ✅ | **Required** |
| Global leaderboard | ✅ | ✅ | ✅ | **Required** |
| Per-mode leaderboards | ✅ | ✅ | ❌ | Nice-to-have |
| User profile + history | ✅ | Limited | ✅ (10 games) | **Required** |
| Round history on result | ✅ | ✅ | ✅ | **Required** |
| Share score | ✅ | ✅ | 🟡 Text-only | OK for launch |
| Custom maps | ✅ Pro | ❌ | ❌ | Not needed |
| Multiplayer / party | ✅ Pro | ✅ | ❌ | Not needed |
| Mobile app | ✅ iOS/Android | ❌ | PWA possible | Not needed |
| Dark mode | ✅ | ✅ | ✅ | OK |
| i18n (5+ locales) | 11 languages | EN only | EN + IT only | Partial OK |

### Mandatory vs. nice-to-have at launch

**Must ship before going public:**

1. Fix guest play — save rounds to `localStorage` after a completed game, show the guest-prompt CTA, and offer "create account to save this score permanently"
2. Fix `time_used_seconds` tracking — pass `elapsed` from the component into `submitGuess`
3. Fix the coordinate count claim — marketing says "50k+ locations" but `valid-coords.json` has exactly **9,920 entries**. This is a factual lie to users. Change the stat to "10k+" or expand the dataset
4. Legal pages — ToS and Privacy Policy (covered in Section 5)
5. Cookie consent banner (covered in Section 5)

**Nice-to-have before public launch (won't block but will hurt retention):**

- Sprint mode (timer wired + auto-submit)
- A share image (OG image or canvas screenshot) instead of just text
- Email confirmation or welcome email after registration
- "Play as guest → save score → register" full conversion flow

---

## 3. Technical & Infrastructure Gaps

### Street View / Mapillary licensing and cost

**The biggest hidden cost in your stack:** Your `CONTINUATION.md` specifies using the free Google Maps Embed API (`/maps/embed/v1/streetview`), but the actual production code uses the **Google Maps JavaScript SDK** (`@vis.gl/react-google-maps`, `new google.maps.StreetViewPanorama()`). These are priced differently.

- **Maps Embed API:** Free, no quota, cannot be scripted — it's just an iframe
- **Maps JavaScript API (Street View):** Billed per Street View load. As of 2025, Street View Static API costs $7 per 1,000 requests; the JavaScript panorama SDK is included in the Maps JS API load at $7 per 1,000 map loads

If 1,000 users each play 5 rounds in a day, that's 5,000 Street View loads. At scale (10k DAU), you're looking at $350/day in Google bills before you've earned a cent. You need to either:

**Option A — Switch to the free Embed API iframe (as your spec intended).** You lose scripted navigation (go forward/back, programmatic bearing changes) but save all costs. The Embed API is genuinely free with no per-request billing.

**Option B — Add a per-user or per-day quota.** Limit free users to N games/day (this is exactly what GeoGuessr does), ensuring your Google costs scale with willingness to pay.

**Option C — Use Mapillary.** `StreetViewPanelInner.tsx` already implements a full Mapillary viewer. Mapillary's API is free up to 250,000 requests/month. The image quality and coverage is lower than Google, but it's how OpenGuessr stays free.

**`NEXT_PUBLIC_MAPILLARY_TOKEN`** is in your `.env.local` as a blank value — you have Mapillary installed but not configured. This is a free fallback that's almost ready to use.

### Google Maps in the round result screen

`RoundResult.tsx` uses `<Map>` and `<AdvancedMarker>` from `@vis.gl/react-google-maps`, which also loads the Maps JS API. Every round result page is an additional map load billing event.

### API rate limiting — critical security gap

Your `/api/score` endpoint has **zero rate limiting**. An attacker can write a script that:

1. Authenticates once with a throwaway account
2. Posts fabricated round data with `guess_lat ≈ lat` and `guess_lng ≈ lng` (near-perfect score)
3. Submits hundreds of games in minutes, flooding the leaderboard

Your server recalculates scores from the supplied coordinates, which is correct, but the coordinates themselves are user-supplied. The only validation is that `lat/lng` values pass as numbers — there's no verification that those coordinates came from your actual location pool.

Minimum viable rate limiting: use Vercel's built-in edge rate limiting, or add an `upstash/ratelimit` check at the top of the score route (10 game saves per user per hour is a reasonable limit).

Additionally, your leaderboard view ranks by `best_score` with no per-mode separation. A user who submits a perfect game in any mode immediately tops the global board.

### Supabase RLS review

The RLS policies are well-designed overall. One nuance worth verifying: Supabase views do **not** automatically inherit the RLS of their source tables when queried directly. Your `leaderboard` view reads from `profiles`, which has `profiles_select_public` (open to all), so it's intentionally public — but if you ever add a restricted field to `profiles`, it could leak through the view. Consider adding `security_invoker = true` to the view definition for future-proofing.

The `update_profile_stats` RPC is `SECURITY DEFINER` which is correct — the client can't call it directly and inflate stats. It's invoked server-side only in your score route.

One gap: there's no `DELETE` policy on `games` and no `DELETE` on `profiles`. If a user wants to delete their account (required under GDPR's right to erasure), you have no mechanism. The `ON DELETE CASCADE` on the foreign key handles the DB side, but you need an account-deletion UI and a server route that calls `supabase.auth.admin.deleteUser()`.

### Performance

Your coordinates are loaded from a 9,920-entry JSON file bundled at build time. This is smart — no runtime API call, instant response. However, the `getRandomLocation()` function builds a `Set` from `excludeIds` on every call. At 9,920 entries this is negligible, but at 500k entries it would matter.

The Leaflet map is dynamically imported (`react-leaflet`), which is correct. The Google Maps API is loaded synchronously through `APIProvider` in `ClassicoGame.tsx`, which means every game page load fetches the Maps JS SDK before anything renders. Consider lazy-loading this.

### Mobile responsiveness

The game is desktop-first in its current layout. The fixed-position Street View panel and overlapping mini-map work well on large screens. On mobile (375px), test these specific flows:
- The compass bar and timer at top center vs. the round score HUD at top right — they may overlap at narrow widths
- The mini-map expand/collapse behaviour (check `GuessMap.tsx` and `GuessMapInner.tsx`)
- The `RoundResult` full-screen map overlay — needs a max-height or scroll container on phones

### Missing infrastructure files

- **No `robots.txt`** — search engines will crawl everything including game routes, which you don't want indexed
- **No `sitemap.xml`** — hurts SEO for your landing page, leaderboard, and how-it-works pages
- **No security headers** — `next.config.mjs` has no `headers()` export. At minimum add: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Content-Security-Policy` that whitelists Google Maps and Supabase
- **No `/_vercel/insights`** or equivalent** — no analytics to understand how users behave

---

## 4. Business & Monetization

### How the benchmarks monetize

**GeoGuessr** uses a hard freemium model:
- Free tier: ~1 game per day, no custom maps, no multiplayer, limited modes
- Pro: ~€3.99/month or ~€28/year — unlimited games, all modes, party play, custom maps
- Revenue mix: subscriptions (primary), gift cards, merchandise, World Championship event sponsorships
- They went from ad-supported to subscription-only around 2020 when Google's API pricing changed; the price increase forced their hand

**OpenGuessr** is fully free with no monetization model — it's a hobby/community project. It survives because it uses Mapillary (free tier) and Leaflet (free), keeping infrastructure costs near zero.

### Realistic model for GeoMondo at launch

Your stated model is **ads + donations**. This is viable but requires some careful structuring:

**Phase 1 (launch — sustain costs):** Add Google AdSense to the home page, leaderboard, and results screen. Do not put ads on the in-game screen (it's illegal under AdSense policies to overlay ads on interactive game content). A single banner on the results page is unobtrusive and monetizes the high-intent moment just after a game. Expected CPM in gaming: €0.50–€2.00, so 10,000 monthly users × 5 games × 1 impression = 50,000 impressions ≈ €25–€100/month at launch. Not enough to cover Google Maps costs at scale.

**Phase 2 (if traction):** Introduce a soft limit (e.g., 5 free games/day for guests, unlimited for registered users). This drives registration and gives you leverage for a "Pro" tier later without blocking early users.

**Donations:** Add a Ko-fi or Open Collective link. Geography game communities are enthusiastic donors. Place it in the footer and on the results screen ("GeoMondo is free — help keep it running").

**Critical cost control:** Until you have a plan for Google Maps billing, you must either (a) switch to the free Embed API or Mapillary, (b) cap daily games per user, or (c) accept that a viral moment could generate a four-figure Google bill overnight.

---

## 5. Legal & Compliance

### Terms of Service

You have no ToS page. At minimum it should cover: permitted use (no bots, no automated guessing), disclaimer of accuracy for location data, intellectual property (your code, Google/Mapillary content), limitation of liability, and governing law (Italy/EU). A short, plain-language ToS is fine — it doesn't need to be long. Link it in the footer.

### Privacy Policy (GDPR — required)

You are EU-based and your users are likely EU-majority. Under GDPR, you must have a Privacy Policy that discloses:
- What personal data you collect: email address, username, Google profile name/avatar (via OAuth), game history, IP address (via Supabase and Vercel logs)
- Why you collect it: account creation, leaderboard, fraud prevention
- Who you share it with: Supabase (data processor), Vercel (hosting), Google (Maps API, OAuth), AdSense (if you add ads)
- How long you retain it: define a retention period (e.g., account data retained until deletion; game logs retained for 12 months)
- User rights: right to access, rectify, delete, and port their data
- Data controller identity: your name and email or a contact form

Your current stack has no account-deletion flow, which is a GDPR right-to-erasure violation.

### Cookie Consent

Your app sets Supabase session cookies (functional), and if you add Google AdSense, those set tracking cookies. Under GDPR and ePrivacy Directive, you need:
- A cookie banner on first visit (for non-essential cookies)
- A consent mechanism before loading AdSense (or any third-party analytics)
- A cookie policy (can be part of the Privacy Policy)

Tools like `react-cookie-consent` or CookieYes integrate in an afternoon.

### Google Maps / Street View Content Licensing

The Google Maps Terms of Service (Section 3.2.4) prohibit using Street View imagery in ways that circumvent the normal Maps API. Specifically:
- You may not "scrape, extract, or store" Street View imagery separately
- You may not use it to create competing products without permission

Since you're loading panoramas live through the API (not downloading/storing them), you are within the ToS. However, this only holds if you're using an authorized API method. The **free Embed API** is explicitly permitted for general web use. The **Maps JavaScript API** requires a billing account and compliance with the Maps Platform Terms. You currently use the JS API without (it appears) having billing fully set up — verify this in Google Cloud Console.

### Mapillary Content Licensing

Mapillary images are licensed under CC BY-SA 4.0. Using them in a game is permitted, but you must provide attribution. `StreetViewPanelInner.tsx` does not currently display any attribution. Add a small "© Mapillary contributors" overlay when Mapillary images are shown.

---

## 6. Launch Checklist — Prioritized by Criticality

### 🔴 P0 — Blockers (must fix before any public link)

- [ ] **Fix the "50k+ locations" stat** — you have 9,920 coordinates. Change to "10k+" or expand the dataset. This is the kind of thing that gets called out on HackerNews on day one.
- [ ] **Add a Privacy Policy page** — GDPR requirement. Without it you cannot legally collect user data from EU residents.
- [ ] **Add a Terms of Service page** — covers liability and acceptable use.
- [ ] **Add cookie consent banner** — required before setting any non-essential cookies (session cookies are functional and exempt, but AdSense is not).
- [ ] **Implement account deletion** — GDPR right to erasure. Add a "Delete my account" button in the profile page that calls `supabase.auth.admin.deleteUser()` from a server action.
- [ ] **Rate-limit `/api/score`** — at minimum 10 submissions per user per hour. Without this your leaderboard will be spammed within hours of launch.
- [ ] **Fix guest play → localStorage flow** — guests who complete a game should see their score saved locally and a clear CTA to create an account to preserve it permanently.

### 🟠 P1 — High Priority (fix within the first week post-launch)

- [ ] **Audit Google Maps billing** — confirm your Cloud Console project has billing enabled and your API key is restricted to your domain. Understand your cost exposure before you share the URL publicly.
- [ ] **Fix `time_used_seconds`** — pass `elapsed` from `ClassicoGame` into `submitGuess`. This field is stored in every game record and will be wrong forever once the database fills up.
- [ ] **Wire Sprint mode timer** — call `decrementTimer()` on a 1-second interval in the game component; auto-submit the best available guess (or a center-of-map default) when it hits 0.
- [ ] **Add `robots.txt`** — disallow `/gioca/*`, `/risultato`, `/accedi`, `/auth/*`; allow everything else.
- [ ] **Add `sitemap.xml`** — include `/`, `/come-funziona`, `/classifica`, and each locale variant.
- [ ] **Add security headers** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and a basic CSP in `next.config.mjs`.
- [ ] **Add Mapillary attribution** — display "© Mapillary contributors" overlay when `StreetViewPanelInner` is active.

### 🟡 P2 — Should ship in the first month

- [ ] **Expand or source a larger coordinate dataset** — 9,920 coords means a repeat location is statistically likely within ~10 games. At GeoGuessr's scale, they use hundreds of thousands of curated locations. WorldGuessr's open-source repo (which you reference) has a much larger `cities.json`. Consider augmenting with country-weighted random sampling.
- [ ] **Add the remaining 3 locales** — FR, AR, ES are listed in your i18n spec but only EN and IT message files exist. Either remove those locales from the `routing.locales` array or create the message files.
- [ ] **Add Google AdSense** (after cookie consent is live) — place one unit on the results screen and one on the leaderboard.
- [ ] **Add donation CTA** — Ko-fi button in footer and on the final score screen.
- [ ] **"Play → register" conversion flow** — when a guest finishes a game, show a modal: "Your score was X. Create a free account to save it to the leaderboard." Store the score payload in `sessionStorage` and submit it after OAuth completes.
- [ ] **Add OG image** — the current `meta-og:image` comes from default Next.js. Add a custom OG image for the home page so shares on social media look intentional.
- [ ] **Test mobile at 375px** — compass + timer + round score HUD overlap on narrow screens; the RoundResult map needs a max-height on mobile.
- [ ] **Add Vercel Analytics or Plausible** — you need to know how many people are playing before you can make any monetization or feature decisions.

### 🟢 P3 — Nice-to-have (post-launch roadmap)

- [ ] Per-mode leaderboards (currently the global board mixes all modes)
- [ ] Share image (canvas screenshot of the result map, not just text)
- [ ] Password-based sign-in as an alternative to magic link + Google
- [ ] Badges / achievements to drive retention
- [ ] Multiplayer / challenge-a-friend mode (Supabase Realtime is already a dependency)
- [ ] Italy-only mode (Italia) and country-guess mode (Paese)
- [ ] Progressive Web App (PWA) manifest for add-to-home-screen on mobile
- [ ] Email drip / welcome email after registration (Supabase has email hooks)

---

## Summary of What's Actually Ready

| Area | Status | Verdict |
|---|---|---|
| Core 5-round game loop | Working, minor bugs | Nearly ready |
| Score calculation (server-side) | Correct | ✅ Ready |
| Auth + profiles | Working | ✅ Ready |
| Leaderboard + profile pages | Working | ✅ Ready |
| i18n (EN + IT) | Working | Partial — 3 locales missing |
| Guest play | Broken (silent fail) | ❌ Not ready |
| Sprint mode | Timer not wired | ❌ Not ready |
| Rate limiting | Absent | ❌ Not ready |
| Legal pages (ToS, Privacy) | Missing | ❌ Not ready |
| Cookie consent | Missing | ❌ Not ready |
| Google Maps billing | Unverified | ⚠️ Risk |
| SEO basics | Missing | ⚠️ Risk |
| Monetization | Nothing built | ⚠️ Plan needed |

**Bottom line:** The game engine is the strongest part of the build — the architecture is sound and the code quality is high. The gaps are almost entirely operational (legal, billing, rate limiting) and a handful of specific bugs. A focused 2–3 day sprint to address the P0 and P1 items would put GeoMondo in a launchable state.
