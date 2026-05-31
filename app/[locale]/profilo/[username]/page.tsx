import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import DeleteAccountButton from '@/components/profile/DeleteAccountButton';
import AvatarUpload from '@/components/profile/AvatarUpload';
import { isOwnAvatar, avatarGradient } from '@/lib/avatar';

type Props = {
  params: Promise<{ locale: string; username: string }>;
};

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  total_games: number;
  total_score: number;
  best_score: number;
  created_at: string;
}

interface Game {
  id: string;
  mode: string;
  total_score: number;
  completed_at: string;
}

const MODE_ICONS: Record<string, string> = {
  classico: '🌍',
  sprint:   '⚡',
  paese:    '🏳️',
  italia:   '🇮🇹',
};

export const dynamic = 'force-dynamic';

export default async function ProfiloPage({ params }: Props) {
  const { locale, username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername);
  setRequestLocale(locale);

  const t       = await getTranslations({ locale, namespace: 'profile' });
  const tModes  = await getTranslations({ locale, namespace: 'modes' });
  const tNav    = await getTranslations({ locale, namespace: 'nav' });

  const supabase = await createClient();

  // Check if the viewer is the profile owner
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, total_games, total_score, best_score, created_at')
    .eq('username', username)
    .single();

  if (error || !profileData) notFound();

  const profile = profileData as Profile;

  const { data: gamesData } = await supabase
    .from('games')
    .select('id, mode, total_score, completed_at')
    .eq('user_id', profile.id)
    .order('completed_at', { ascending: false })
    .limit(10);

  const games = (gamesData ?? []) as Game[];

  const isOwner = currentUser?.id === profile.id;

  const avgScore =
    profile.total_games > 0
      ? Math.round(profile.total_score / profile.total_games)
      : 0;

  const joinDate = new Date(profile.created_at).toLocaleDateString(
    locale === 'it' ? 'it-IT' : 'en-US',
    { year: 'numeric', month: 'long' }
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background px-4 py-14">
      <div className="max-w-2xl mx-auto">

        {/* ── Profile header ──────────────────────────────────────── */}
        <div className="flex items-center gap-6 mb-10">
          {isOwner ? (
            <AvatarUpload
              userId={profile.id}
              username={profile.username}
              currentAvatarUrl={profile.avatar_url}
            />
          ) : (
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-it-green/20 flex-shrink-0">
              {isOwnAvatar(profile.avatar_url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-black text-3xl uppercase select-none"
                  style={{ background: avatarGradient(profile.username) }}
                >
                  {profile.username[0]}
                </div>
              )}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-black text-foreground leading-none mb-1">
              {profile.username}
            </h1>
            <p className="text-muted text-sm">
              {t('memberSince')} {joinDate}
            </p>
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-1.5">
            <span className="text-3xl font-black text-foreground tabular-nums leading-none">
              {profile.total_games}
            </span>
            <span className="text-[11px] text-muted uppercase tracking-wider">
              {t('totalGames')}
            </span>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-1.5">
            <span className="text-3xl font-black text-it-green tabular-nums leading-none">
              {profile.best_score.toLocaleString('it-IT')}
            </span>
            <span className="text-[11px] text-muted uppercase tracking-wider">
              {t('bestScore')}
            </span>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-1.5">
            <span className="text-3xl font-black text-foreground tabular-nums leading-none">
              {avgScore > 0 ? avgScore.toLocaleString('it-IT') : '–'}
            </span>
            <span className="text-[11px] text-muted uppercase tracking-wider">
              {t('avgScore')}
            </span>
          </div>
        </div>

        {/* ── Recent games ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground">{t('recentGames')}</h2>
            <Link
              href="/gioca"
              className="text-xs text-it-green hover:text-foreground transition-colors"
            >
              {tNav('play')} →
            </Link>
          </div>

          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {games.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-3 text-center">
                <span className="text-4xl select-none">🌍</span>
                <p className="text-muted text-sm">{t('noGames')}</p>
                <Link
                  href="/gioca"
                  className="mt-1 text-xs bg-it-green hover:bg-it-green-dark text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  {tNav('play')}
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_100px_90px] gap-4 px-5 py-3 border-b border-border text-[11px] text-muted uppercase tracking-wider font-semibold">
                  <span>{t('mode')}</span>
                  <span className="text-right">{t('score')}</span>
                  <span className="text-right">{t('date')}</span>
                </div>
                {games.map(game => (
                  <div
                    key={game.id}
                    className="grid grid-cols-[1fr_100px_90px] gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-foreground/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none select-none" aria-hidden>
                        {MODE_ICONS[game.mode] ?? '🌍'}
                      </span>
                      <span className="text-foreground text-sm font-medium">
                        {tModes(`${game.mode}.name` as Parameters<typeof tModes>[0])}
                      </span>
                    </div>
                    <span className="text-it-green font-bold text-sm text-right tabular-nums">
                      {game.total_score.toLocaleString('it-IT')}
                    </span>
                    <span className="text-muted text-sm text-right tabular-nums">
                      {new Date(game.completed_at).toLocaleDateString(
                        locale === 'it' ? 'it-IT' : 'en-US',
                        { day: 'numeric', month: 'short' }
                      )}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── Danger zone (owner only) ─────────────────────────── */}
        {isOwner && (
          <div className="mt-16 pt-8 border-t border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground/60 uppercase tracking-widest mb-1">
                  {t('dangerZone')}
                </p>
                <p className="text-sm text-muted leading-relaxed max-w-sm">
                  {t('deleteAccountWarning')}
                </p>
              </div>
              <div className="flex-shrink-0">
                <DeleteAccountButton />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
