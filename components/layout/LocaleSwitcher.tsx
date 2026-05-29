'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTransition } from 'react';

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = locale === 'it' ? 'en' : 'it';
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={locale === 'it' ? 'Switch to English' : 'Passa all\'italiano'}
      className="text-sm font-semibold text-muted hover:text-foreground px-3 py-2 rounded-lg transition-colors hover:bg-surface disabled:opacity-50 select-none"
    >
      {locale === 'it' ? 'EN' : 'IT'}
    </button>
  );
}
