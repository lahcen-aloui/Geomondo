'use client';

import { useTranslations } from 'next-intl';

interface Props {
  currentRound: number;
  totalRounds?: number;
  totalScore: number;
}

export default function ScoreBar({
  currentRound,
  totalRounds = 5,
  totalScore,
}: Props) {
  const t = useTranslations('game');

  return (
    <div className="h-12 flex items-center justify-between px-4 bg-black/60 backdrop-blur-sm border-b border-border z-10">
      <span className="text-sm font-medium text-white">
        {t('round')} {currentRound}/{totalRounds}
      </span>
      <span className="text-sm font-medium text-white">
        {t('score')}: {totalScore.toLocaleString('it-IT')}
      </span>
    </div>
  );
}
