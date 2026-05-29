'use client';

/**
 * Mounts invisibly in the root layout and listens for Supabase sign-in events.
 * When a user logs in (OAuth redirect or magic link), checks sessionStorage for
 * a pending guest score and submits it automatically, then shows a brief
 * confirmation banner.
 */

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { saveScoreApi } from '@/lib/api';
import { loadPendingScore, clearPendingScore } from '@/lib/game/pending-score';

export default function PendingScoreHandler() {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event !== 'SIGNED_IN') return;

        const pending = loadPendingScore();
        if (!pending) return;

        // Clear first — if the submit fails we don't want to retry on every
        // subsequent auth event (e.g. token refresh).
        clearPendingScore();

        try {
          await saveScoreApi(pending);
          setSaved(true);
          setTimeout(() => setSaved(false), 4000);
        } catch (err) {
          // Score couldn't be saved after login — log silently, don't alarm the user.
          console.error('Could not submit pending guest score:', err);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  if (!saved) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2.5 bg-it-green text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg">
        <span>🌍</span>
        <span>Score saved to the leaderboard!</span>
      </div>
    </div>
  );
}
