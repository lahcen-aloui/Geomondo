import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

const STEPS = ['step1', 'step2', 'step3'] as const;

export default async function ComeFunzionaPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'home.howItWorks' });
  const tHero = await getTranslations({ locale, namespace: 'home.hero' });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-3">
            {t('title')}
          </h1>
          <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {STEPS.map(step => (
            <section
              key={step}
              className="relative bg-surface border border-border rounded-2xl p-8 overflow-hidden"
            >
              <span className="absolute top-4 right-5 text-6xl font-black text-it-green/10 leading-none select-none pointer-events-none">
                {t(`${step}.number` as Parameters<typeof t>[0])}
              </span>
              <h2 className="text-xl font-bold text-foreground mb-3">
                {t(`${step}.title` as Parameters<typeof t>[0])}
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                {t(`${step}.desc` as Parameters<typeof t>[0])}
              </p>
            </section>
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            href="/gioca"
            className="inline-flex items-center justify-center bg-it-green hover:bg-it-green-dark text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors"
          >
            {tHero('cta')}
          </Link>
        </div>
      </div>
    </div>
  );
}
