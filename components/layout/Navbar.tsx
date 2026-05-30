import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import LocaleSwitcher from './LocaleSwitcher';
import GeoMondoLogo from '@/components/ui/GeoMondoLogo';
import NavbarUserMenu from './NavbarUserMenu';
import ThemeToggle from './ThemeToggle';
import { createClient } from '@/lib/supabase/server';

export default async function Navbar() {
  const t = await getTranslations('nav');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let username: string | null = null;
  let avatarUrl: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();
    username = profile?.username ?? null;
    avatarUrl = profile?.avatar_url ?? null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <GeoMondoLogo textSize="text-xl" globeClassName="text-lg" />
          <span className="hidden sm:inline text-xs text-muted font-medium border border-border rounded-full px-2 py-0.5">
            {t('logoTagline')}
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/come-funziona"
            className="text-sm text-muted hover:text-foreground px-3 py-2 rounded-lg transition-colors hover:bg-surface"
          >
            {t('howItWorks')}
          </Link>
          <Link
            href="/classifica"
            className="text-sm text-muted hover:text-foreground px-3 py-2 rounded-lg transition-colors hover:bg-surface"
          >
            {t('leaderboard')}
          </Link>
        </div>

        {/* CTA + Auth */}
        <div className="flex items-center gap-2">
          {/* Theme + Locale — desktop only */}
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <LocaleSwitcher />
          </div>

          {/* Auth state */}
          <NavbarUserMenu username={username} avatarUrl={avatarUrl} />

          {/* Primary CTA — icon only on mobile, full label on desktop */}
          <Link
            href="/gioca"
            className="inline-flex items-center gap-1.5 bg-it-green hover:bg-it-green-dark text-white font-semibold rounded-lg transition-colors px-3 py-2 sm:px-4 text-sm"
          >
            <span>🌍</span>
            <span className="hidden sm:inline">{t('play')}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
