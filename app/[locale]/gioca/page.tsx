import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

const MODES = [
  { id: 'classico', href: '/gioca/classico', available: true },
  { id: 'sprint',   href: '/gioca/sprint',   available: false },
  { id: 'paese',    href: '/gioca/paese',     available: false },
  { id: 'italia',   href: '/gioca/italia',    available: false },
] as const;

export default async function GiocaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'modes' });
  const tHome = await getTranslations({ locale, namespace: 'home.modes' });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-center mb-1">{tHome('title')}</h1>
      <p className="text-muted text-sm text-center mb-10">{tHome('subtitle')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {MODES.map(mode => (
          <div
            key={mode.id}
            className={[
              'relative bg-surface border border-border rounded-2xl p-6',
              mode.available ? '' : 'opacity-50',
            ].join(' ')}
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-semibold">
                {t(`${mode.id}.name` as Parameters<typeof t>[0])}
              </h2>
              <span className="text-xs bg-it-green/10 text-it-green border border-it-green/20 px-2 py-0.5 rounded-full">
                {t(`${mode.id}.tag` as Parameters<typeof t>[0])}
              </span>
            </div>
            <p className="text-muted text-sm mb-5">
              {t(`${mode.id}.desc` as Parameters<typeof t>[0])}
            </p>
            {mode.available ? (
              <Link
                href={mode.href}
                className="block w-full text-center bg-it-green hover:bg-it-green-dark text-white font-semibold py-2.5 rounded-xl transition-colors duration-150"
              >
                {tHome('playMode')}
              </Link>
            ) : (
              <div className="w-full text-center bg-border text-muted font-semibold py-2.5 rounded-xl cursor-not-allowed text-sm">
                {t('comingSoon')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
