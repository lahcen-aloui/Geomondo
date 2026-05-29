-- Migration: 001 Initial Schema
-- Created: 2026-05-10
-- Description: profiles table, games table, leaderboard view,
--              RLS policies, auto-profile trigger, update_profile_stats function

-- ============================================================
-- 1. PROFILES
-- ============================================================

CREATE TABLE public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT        UNIQUE NOT NULL,
  avatar_url    TEXT,
  total_games   INTEGER     NOT NULL DEFAULT 0,
  total_score   BIGINT      NOT NULL DEFAULT 0,
  best_score    INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX profiles_best_score_idx ON public.profiles (best_score DESC);

-- ============================================================
-- 2. GAMES
-- ============================================================

CREATE TABLE public.games (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  mode          TEXT        NOT NULL CHECK (mode IN ('classico', 'sprint', 'paese', 'italia')),
  total_score   INTEGER     NOT NULL CHECK (total_score >= 0),
  rounds        JSONB       NOT NULL,
  -- rounds is an array of objects, each:
  -- { round_number, lat, lng, guess_lat, guess_lng, distance_km, score, time_used_seconds }
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX games_user_id_idx    ON public.games (user_id);
CREATE INDEX games_total_score_idx ON public.games (total_score DESC);

-- ============================================================
-- 3. LEADERBOARD VIEW
-- ============================================================

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

-- ============================================================
-- 4. RLS — PROFILES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read any profile (leaderboard, profile pages)
CREATE POLICY "profiles_select_public"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Profiles are created by the trigger below (SECURITY DEFINER)
-- Direct inserts from the client are blocked
CREATE POLICY "profiles_no_direct_insert"
  ON public.profiles
  FOR INSERT
  WITH CHECK (false);

-- ============================================================
-- 5. RLS — GAMES
-- ============================================================

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Users can insert their own games
CREATE POLICY "games_insert_own"
  ON public.games
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own games (profile page history)
CREATE POLICY "games_select_own"
  ON public.games
  FOR SELECT
  USING (auth.uid() = user_id);

-- No UPDATE or DELETE policies — game records are immutable

-- ============================================================
-- 6. AUTO-CREATE PROFILE ON SIGNUP (TRIGGER)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    -- Use Google display name if available, otherwise fall back to email prefix
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING; -- safe to re-run
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 7. UPDATE PROFILE STATS AFTER GAME SAVE
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_profile_stats(
  p_user_id UUID,
  p_score   INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_games = total_games + 1,
    total_score = total_score + p_score,
    best_score  = GREATEST(best_score, p_score)
  WHERE id = p_user_id;
END;
$$;

-- ============================================================
-- ROLLBACK (for reference — do not run unless reverting)
-- ============================================================
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP FUNCTION IF EXISTS public.update_profile_stats(UUID, INTEGER);
-- DROP VIEW  IF EXISTS public.leaderboard;
-- DROP TABLE IF EXISTS public.games;
-- DROP TABLE IF EXISTS public.profiles;
