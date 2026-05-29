import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ locale: string }>;
};

interface LeaderboardRow {
  username: string;
  avatar_url: string | null;
  best_score: number;
  total_games: number;
  avg_score: number | null;
}

export const dynamic = 'force-dynamic';

export default async function ClassificaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t    = await getTranslations({ locale, namespace: 'home.leaderboard' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  const supabase = await createClient();
  const { data } = await supabase
    .from('leaderboard')
    .select('username, avatar_url, best_score, total_games, avg_score')
    .limit(100);

  const rows = (data ?? []) as LeaderboardRow[];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background px-4 py-16">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground mb-2">{t('title')}</h1>
          <p className="text-muted">{t('subtitle')}</p>
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[40px_1fr_130px_80px_100px] gap-4 px-5 py-3 border-b border-border text-[11px] text-muted uppercase tracking-wider font-semibold">
            <span>{t('rank')}</span>
            <span>{t('player')}</span>
            <span className="text-right">{t('bestScore')}</span>
            <span className="text-right">{t('games')}</span>
            <span className="text-right">{t('avgScore')}</span>
          </div>

          {rows.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-center">
              <span className="text-5xl select-none">🌍</span>
              <p className="text-muted text-sm">No players yet — be the first!</p>
              <Link
                href="/gioca"
                className="mt-2 text-xs bg-it-green hover:bg-it-green-dark text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {tNav('play')}
              </Link>
            </div>
          ) : (
            rows.map((row, i) => {
              const rank = i + 1;
              const rankColor =
                rank === 1 ? 'text-yellow-400' :
                rank === 2 ? 'text-slate-300' :
                rank === 3 ? 'text-amber-600' :
                'text-muted';

              return (
                <div
                  key={row.username}
                  className="grid grid-cols-[40px_1fr_130px_80px_100px] gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-foreground/[0.04] transition-colors items-center"
                >
                  <span className={`font-black text-sm tabular-nums ${rankColor}`}>
                    {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : `#${rank}`}
                  </span>

                  <Link
                    href={`/profilo/${encodeURIComponent(row.username)}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-it-green flex items-center justify-center text-white font-bold text-xs uppercase select-none flex-shrink-0">
                      {row.username[0]}
                    </div>
                    <span className="text-foreground text-sm font-medium group-hover:text-it-green transition-colors truncate">
                      {row.username}
                    </span>
                  </Link>

                  <span className="text-it-green font-bold text-sm text-right tabular-nums">
                    {row.best_score.toLocaleString(locale === 'it' ? 'it-IT' : 'en-US')}
                  </span>

                  <span className="text-muted text-sm text-right tabular-nums">
                    {row.total_games}
                  </span>

                  <span className="text-foreground text-sm text-right tabular-nums">
                    {row.avg_score != null
                      ? Math.round(row.avg_score).toLocaleString(locale === 'it' ? 'it-IT' : 'en-US')
                      : '–'}
                  </span>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
