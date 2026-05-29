import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { haversineKm } from '@/lib/haversine';
import { calculateScore } from '@/lib/scoring';
import type { GameMode, ScoreRound } from '@/types/game';

const VALID_MODES: GameMode[] = ['classico', 'sprint', 'paese', 'italia'];

// Rate limit: max games a single user can submit per rolling window.
// 20/hour is generous for a real player (~100 rounds) and blocks bots.
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

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

  // ── Rate limiting ────────────────────────────────────────────────────────
  // Count games this user has already submitted in the current rolling window.
  // Uses the existing games table — no extra infrastructure needed.
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count, error: countError } = await supabase
    .from('games')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('completed_at', windowStart);

  if (countError) {
    // Fail open: if we can't count, let the request through rather than
    // blocking a legitimate player due to a transient DB error.
    console.error('Rate-limit count failed:', countError.message);
  } else if ((count ?? 0) >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);
    return NextResponse.json(
      { error: 'Too many games submitted. Try again in an hour.', code: 'RATE_LIMITED' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Reset': String(Math.floor((Date.now() + RATE_LIMIT_WINDOW_MS) / 1000)),
        },
      },
    );
  }
  // ── End rate limiting ────────────────────────────────────────────────────

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
