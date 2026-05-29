import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
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

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

const MODES = [
  { id: 'classico', href: '/gioca/classico', available: true },
  { id: 'sprint',   href: '/gioca/sprint',   available: false },
  { id: 'paese',    href: '/gioca/paese',     available: false },
  { id: 'italia',   href: '/gioca/italia',    available: false },
] as const;

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'home' });
  const tModes = await getTranslations({ locale, namespace: 'modes' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  const supabase = await createClient();
  const { data } = await supabase
    .from('leaderboard')
    .select('username, avatar_url, best_score, total_games, avg_score')
    .limit(5);
  const leaders = (data ?? []) as LeaderboardRow[];

  return (
    <div className="min-h-screen bg-background">

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 text-center bg-grid overflow-hidden">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(0,146,70,0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-1.5 text-xs text-muted font-medium mb-8 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-it-green inline-block" />
            {t('hero.badge')}
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] mb-6">
            <span className="text-foreground">{t('hero.title')} </span>
            <span
              className="whitespace-nowrap"
              style={{
                background: 'linear-gradient(to right, #009246 0%, #ffffff 50%, #ce2b37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('hero.titleAccent')}
            </span>
          </h1>

          <p className="text-muted text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/gioca"
              className="inline-flex items-center gap-2 bg-it-green hover:bg-it-green-dark text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors duration-150"
            >
              🌍 {t('hero.cta')}
            </Link>
            <a
              href="#come-funziona"
              className="inline-flex items-center gap-2 bg-surface hover:bg-surface-2 text-foreground font-semibold px-8 py-3.5 rounded-xl text-base border border-border transition-colors duration-150"
            >
              {t('hero.ctaSecondary')} {t('hero.ctaArrow')}
            </a>
          </div>
        </div>
      </section>

      {/* ── 2. STATS BAR ────────────────────────────────────────────────── */}
      <div className="border-y border-border bg-surface/50">
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-3 divide-x divide-border">
          <div className="flex flex-col items-center gap-1 px-6">
            <span className="text-3xl font-black text-foreground">{t('stats.locationsValue')}</span>
            <span className="text-xs text-muted uppercase tracking-wider">{t('stats.locations')}</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-6">
            <span className="text-3xl font-black text-foreground">{t('stats.modesValue')}</span>
            <span className="text-xs text-muted uppercase tracking-wider">{t('stats.modes')}</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-6">
            <span className="text-3xl font-black text-it-green">{t('stats.freeValue')}</span>
            <span className="text-xs text-muted uppercase tracking-wider">{t('stats.free')}</span>
          </div>
        </div>
      </div>

      {/* ── 3. HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="come-funziona" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-3">
              {t('howItWorks.title')}
            </h2>
            <p className="text-muted text-base">{t('howItWorks.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="relative bg-surface border border-border rounded-2xl p-8 overflow-hidden">
              <span className="absolute top-4 right-5 text-6xl font-black text-it-green/10 leading-none select-none pointer-events-none">
                {t('howItWorks.step1.number')}
              </span>
              <div className="w-11 h-11 rounded-xl bg-it-green/10 border border-it-green/20 flex items-center justify-center mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-it-green">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t('howItWorks.step1.title')}</h3>
              <p className="text-muted text-sm leading-relaxed">{t('howItWorks.step1.desc')}</p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-surface border border-border rounded-2xl p-8 overflow-hidden">
              <span className="absolute top-4 right-5 text-6xl font-black text-it-green/10 leading-none select-none pointer-events-none">
                {t('howItWorks.step2.number')}
              </span>
              <div className="w-11 h-11 rounded-xl bg-it-green/10 border border-it-green/20 flex items-center justify-center mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-it-green">
                  <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t('howItWorks.step2.title')}</h3>
              <p className="text-muted text-sm leading-relaxed">{t('howItWorks.step2.desc')}</p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-surface border border-border rounded-2xl p-8 overflow-hidden">
              <span className="absolute top-4 right-5 text-6xl font-black text-it-green/10 leading-none select-none pointer-events-none">
                {t('howItWorks.step3.number')}
              </span>
              <div className="w-11 h-11 rounded-xl bg-it-green/10 border border-it-green/20 flex items-center justify-center mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-it-green">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{t('howItWorks.step3.title')}</h3>
              <p className="text-muted text-sm leading-relaxed">{t('howItWorks.step3.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. GAME MODES ───────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-surface/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-3">
              {t('modes.title')}
            </h2>
            <p className="text-muted text-base">{t('modes.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODES.map(mode => (
              <div
                key={mode.id}
                className={[
                  'relative bg-surface border border-border rounded-2xl p-6',
                  mode.available ? '' : 'opacity-50',
                ].join(' ')}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">
                    {tModes(`${mode.id}.name` as Parameters<typeof tModes>[0])}
                  </h3>
                  <span className="text-xs bg-it-green/10 text-it-green border border-it-green/20 px-2 py-0.5 rounded-full">
                    {tModes(`${mode.id}.tag` as Parameters<typeof tModes>[0])}
                  </span>
                </div>
                <p className="text-muted text-sm mb-5">
                  {tModes(`${mode.id}.desc` as Parameters<typeof tModes>[0])}
                </p>
                {mode.available ? (
                  <Link
                    href={mode.href}
                    className="block w-full text-center bg-it-green hover:bg-it-green-dark text-white font-semibold py-2.5 rounded-xl transition-colors duration-150"
                  >
                    {t('modes.playMode')}
                  </Link>
                ) : (
                  <div className="w-full text-center bg-border text-muted font-semibold py-2.5 rounded-xl cursor-not-allowed text-sm">
                    {tModes('comingSoon')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. LEADERBOARD PREVIEW ──────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-1">
                {t('leaderboard.title')}
              </h2>
              <p className="text-muted text-base">{t('leaderboard.subtitle')}</p>
            </div>
            <Link
              href="/classifica"
              className="text-sm text-it-green hover:text-foreground transition-colors hidden sm:block"
            >
              {t('leaderboard.viewAll')} →
            </Link>
          </div>

          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[40px_1fr_120px_80px_80px] gap-4 px-6 py-3 border-b border-border text-xs text-muted uppercase tracking-wider font-semibold">
              <span>{t('leaderboard.rank')}</span>
              <span>{t('leaderboard.player')}</span>
              <span className="text-right">{t('leaderboard.bestScore')}</span>
              <span className="text-right">{t('leaderboard.games')}</span>
              <span className="text-right">{t('leaderboard.avgScore')}</span>
            </div>

            {leaders.length === 0 ? (
              <div className="py-14 text-center text-muted text-sm">
                {tNav('leaderboard')} —{' '}
                <Link href="/gioca" className="text-it-green hover:underline">
                  {tNav('play')}
                </Link>
              </div>
            ) : (
              leaders.map((row, i) => (
                <div
                  key={row.username}
                  className="grid grid-cols-[40px_1fr_120px_80px_80px] gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-foreground/[0.04] transition-colors"
                >
                  <span className={`font-bold text-sm ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-muted'}`}>
                    {i + 1}
                  </span>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-it-green/20 border border-it-green/30 flex items-center justify-center text-it-green font-bold text-sm flex-shrink-0 uppercase">
                      {row.username[0]}
                    </div>
                    <span className="text-foreground font-medium text-sm truncate">{row.username}</span>
                  </div>
                  <span className="text-right text-it-green font-bold text-sm">
                    {row.best_score.toLocaleString('it-IT')}
                  </span>
                  <span className="text-right text-muted text-sm">{row.total_games}</span>
                  <span className="text-right text-muted text-sm">
                    {row.avg_score ? Math.round(row.avg_score).toLocaleString('it-IT') : '–'}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 text-center sm:hidden">
            <Link href="/classifica" className="text-sm text-it-green hover:text-foreground transition-colors">
              {t('leaderboard.viewAll')} →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
