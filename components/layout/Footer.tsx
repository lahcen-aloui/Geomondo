import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import GeoMondoLogo from '@/components/ui/GeoMondoLogo';

export default async function Footer() {
  const tNav = await getTranslations('nav');
  const tFooter = await getTranslations('footer');

  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center">
              <GeoMondoLogo textSize="text-lg" globeClassName="text-base" />
            </Link>
            <p className="mt-1 text-xs text-muted max-w-xs">
              {tFooter('tagline')}
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <Link href="/gioca" className="hover:text-foreground transition-colors">
              {tNav('play')}
            </Link>
            <Link href="/classifica" className="hover:text-foreground transition-colors">
              {tNav('leaderboard')}
            </Link>
            <Link href="/come-funziona" className="hover:text-foreground transition-colors">
              {tNav('howItWorks')}
            </Link>
          </nav>

          {/* Donation CTA */}
          <a
            href="https://ko-fi.com/geomondo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-foreground border border-border hover:border-it-green hover:text-it-green transition-colors duration-200"
          >
            <span>☕</span>
            <span>{tFooter('supportUs')}</span>
          </a>

          {/* Italian flag accent */}
          <div className="flex items-center gap-0.5" aria-hidden="true">
            <div className="w-3 h-5 rounded-sm bg-it-green" />
            <div className="w-3 h-5 rounded-sm bg-white/90" />
            <div className="w-3 h-5 rounded-sm bg-it-red" />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
          <span>© {new Date().getFullYear()} GeoMondo</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              {tFooter('privacy')}
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              {tFooter('terms')}
            </Link>
          </div>
          <span>{tFooter('madeWith')}</span>
        </div>
      </div>
    </footer>
  );
}
