'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useGameStore } from '@/lib/game/store';
import { saveScoreApi, ApiError } from '@/lib/api';
import { scoreColor } from '@/lib/scoring';
import { savePendingScore } from '@/lib/game/pending-score';

export default function RisultatoScreen() {
  const router = useRouter();
  const t = useTranslations('result');
  const tModes = useTranslations('modes');

  const { status, mode, rounds, totalScore, resetGame } = useGameStore();
  const [copied, setCopied] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    if (status !== 'FINAL_SCORE' || savedRef.current || !mode) return;
    savedRef.current = true;

    const payload = {
      mode,
      rounds: rounds.map(r => ({
        round_number: r.round_number,
        lat: r.lat,
        lng: r.lng,
        guess_lat: r.guess_lat,
        guess_lng: r.guess_lng,
        time_used_seconds: r.time_used_seconds,
      })),
    };

    saveScoreApi(payload).catch((err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        // User is not logged in — persist the score so it can be submitted
        // automatically after they sign up, then show the sign-up prompt.
        savePendingScore(payload);
        setIsGuest(true);
      } else {
        // Unexpected error (network, server) — log but don't break the UI
        console.error('Failed to save score:', err);
      }
    });
  }, [status, mode, rounds]);

  if (status !== 'FINAL_SCORE') {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-3">{t('emptyTitle')}</h1>
          <p className="text-muted text-sm leading-relaxed mb-6">{t('emptyDescription')}</p>
          <Link
            href="/gioca"
            className="inline-flex items-center justify-center bg-it-green hover:bg-it-green-dark text-white font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            {t('startPlaying')}
          </Link>
        </div>
      </div>
    );
  }

  const modeName = mode ? tModes(`${mode}.name` as Parameters<typeof tModes>[0]) : '';

  const shareText = t('shareTemplate', {
    mode: modeName,
    score: totalScore.toLocaleString('it-IT'),
  });

  function handleShare() {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handlePlayAgain() {
    resetGame();
    router.push('/gioca/classico');
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-1">{t('finalScore')}</h1>
        <p className={`text-5xl font-mono font-bold text-center mb-8 ${scoreColor(totalScore)}`}>
          {totalScore.toLocaleString('it-IT')}
        </p>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-6">
          {rounds.map(r => {
            const distanceDisplay =
              r.distance_km < 1
                ? `< 1 ${t('km')}`
                : `${Math.round(r.distance_km).toLocaleString('it-IT')} ${t('km')}`;
            return (
              <div
                key={r.round_number}
                className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0"
              >
                <span className="text-sm text-muted">
                  {t('roundOf', { round: r.round_number, total: rounds.length })}
                </span>
                <span className="text-sm font-mono text-muted">{distanceDisplay}</span>
                <span className={`text-sm font-mono font-semibold ${scoreColor(r.score)}`}>
                  {r.score.toLocaleString('it-IT')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Guest CTA — only shown when the save returned a 401 */}
        {isGuest && (
          <div className="mb-4 rounded-xl border border-it-green/30 bg-it-green/5 px-4 py-4">
            <p className="text-sm font-semibold text-white mb-0.5">
              {t('guestBannerTitle')}
            </p>
            <p className="text-xs text-muted mb-3">
              {t('guestBannerDesc')}
            </p>
            <Link
              href="/accedi"
              className="inline-flex items-center justify-center bg-it-green hover:bg-it-green-dark text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {t('guestBannerCta')}
            </Link>
          </div>
        )}

        <button
          onClick={handleShare}
          className="w-full bg-surface border border-border hover:border-it-green text-sm font-semibold py-3 rounded-xl transition-colors duration-150 mb-3"
        >
          {copied ? t('copiedToClipboard') : t('share')}
        </button>

        <button
          onClick={handlePlayAgain}
          className="w-full bg-it-green hover:bg-it-green-dark text-white font-semibold py-3 rounded-xl transition-colors duration-150 active:scale-[0.98]"
        >
          {t('playAgain')}
        </button>
      </div>
    </div>
  );
}
