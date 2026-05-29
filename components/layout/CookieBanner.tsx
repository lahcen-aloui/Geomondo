'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const STORAGE_KEY = 'geomondo_cookie_consent';

type ConsentValue = 'accepted' | 'necessary';

function getStoredConsent(): ConsentValue | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'accepted' || v === 'necessary') return v;
    return null;
  } catch {
    return null;
  }
}

function storeConsent(value: ConsentValue): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // localStorage unavailable — banner will reappear next visit, which is fine
  }
}

export default function CookieBanner() {
  const t = useTranslations('cookie');
  // null = not yet determined (banner hidden until we check storage)
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if the user has never made a choice
    if (getStoredConsent() === null) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    storeConsent('accepted');
    setVisible(false);
  }

  function handleNecessary() {
    storeConsent('necessary');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="
        fixed bottom-0 left-0 right-0 z-50
        border-t border-border bg-surface/95 backdrop-blur-md
        transition-transform duration-300 translate-y-0
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">

        {/* Message */}
        <p className="flex-1 text-sm text-muted leading-relaxed">
          🍪{' '}{t('message')}{' '}
          <Link
            href="/privacy"
            className="text-it-green hover:underline font-medium whitespace-nowrap"
          >
            {t('learnMore')} →
          </Link>
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Necessary only — secondary, same visual weight as Accept so declining is equally easy (GDPR requirement) */}
          <button
            onClick={handleNecessary}
            className="
              px-4 py-2 rounded-lg text-sm font-semibold
              border border-border text-foreground/70
              hover:text-foreground hover:border-foreground/30
              transition-colors duration-150
            "
          >
            {t('necessary')}
          </button>

          {/* Accept all */}
          <button
            onClick={handleAccept}
            className="
              px-4 py-2 rounded-lg text-sm font-semibold
              bg-it-green hover:bg-it-green-dark text-white
              transition-colors duration-150
            "
          >
            {t('accept')}
          </button>
        </div>

      </div>
    </div>
  );
}
