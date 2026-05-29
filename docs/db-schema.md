# GeoMondo — Database Schema

## Overview

All tables live in the `public` schema. Auth is handled by Supabase (`auth.users`). Row Level Security (RLS) is enabled on every table — no exceptions before launch.

Schema changes: **always** create a migration file in `/supabase/migrations/`. Never edit the DB directly in production.

---

## Tables

### `public.profiles`

Extended user profile, linked 1:1 to `auth.users`.

```sql
CREATE TABLE public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT        UNIQUE NOT NULL,
  avatar_url    TEXT,
  total_games   INTEGER     DEFAULT 0,
  total_score   BIGINT      DEFAULT 0,
  best_score    INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX profiles_best_score_idx ON public.profiles (best_score DESC);
```

**Auto-create on signup (trigger):**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

### `public.games`

One row per completed game session.

```sql
CREATE TABLE public.games (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  mode          TEXT        NOT NULL CHECK (mode IN ('classico', 'sprint', 'paese', 'italia')),
  total_score   INTEGER     NOT NULL CHECK (total_score >= 0),
  rounds        JSONB       NOT NULL,
  -- rounds shape: [{ lat, lng, guess_lat, guess_lng, distance_km, score, time_used_seconds }]
  completed_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX games_user_id_idx ON public.games (user_id);
CREATE INDEX games_total_score_idx ON public.games (total_score DESC);
```

**rounds JSONB shape (per element):**
```json
{
  "round_number": 1,
  "lat": 48.8566,
  "lng": 2.3522,
  "guess_lat": 48.9000,
  "guess_lng": 2.4000,
  "distance_km": 6.2,
  "score": 4987,
  "time_used_seconds": 34
}
```

---

## Views

### `public.leaderboard`

Read-only materialized view for the leaderboard page. Recalculate on a schedule or after each game save.

```sql
CREATE VIEW public.leaderboard AS
  SELECT
    p.username,
    p.avatar_url,
    p.best_score,
    p.total_games,
    ROUND(p.total_score::numeric / NULLIF(p.total_games, 0)) AS avg_score,
    RANK() OVER (ORDER BY p.best_score DESC) AS rank
  FROM public.profiles p
  WHERE p.total_games > 0
  ORDER BY p.best_score DESC
  LIMIT 100;
```

---

## RLS Policies

### profiles

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read any profile (leaderboard, profile pages)
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Profiles are created by the trigger (SECURITY DEFINER) — no direct insert
CREATE POLICY "profiles_no_direct_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (false);
```

### games

```sql
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Users can insert their own games
CREATE POLICY "games_insert_own"
  ON public.games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own games (profile page history)
CREATE POLICY "games_select_own"
  ON public.games FOR SELECT
  USING (auth.uid() = user_id);

-- No updates or deletes allowed
```

---

## Functions

### `update_profile_stats()`

Called by the API after saving a game. Updates aggregated stats on the profile.

```sql
CREATE OR REPLACE FUNCTION public.update_profile_stats(
  p_user_id UUID,
  p_score INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_games = total_games + 1,
    total_score = total_score + p_score,
    best_score  = GREATEST(best_score, p_score)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Migration Files

| File | Description |
|---|---|
| `001_initial.sql` | profiles table, games table, leaderboard view, RLS policies, trigger |

**Rule:** Every schema change = a new migration file. Never alter existing migration files.

---

## Future Tables (Phase 2+)

```sql
-- Multiplayer rooms (Phase 2)
-- CREATE TABLE public.rooms ( ... )

-- Friends / following (Phase 3)
-- CREATE TABLE public.follows ( ... )

-- Tournaments (Phase 3)
-- CREATE TABLE public.tournaments ( ... )
```
