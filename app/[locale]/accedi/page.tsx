import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/server';
import AuthForm from '@/components/auth/AuthForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AccediPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect({ href: '/', locale });

  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-foreground mb-1">{t('signIn')}</h1>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
