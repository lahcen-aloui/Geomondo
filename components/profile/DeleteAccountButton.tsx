'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Step = 'idle' | 'confirm' | 'deleting';

export default function DeleteAccountButton() {
  const t = useTranslations('profile');
  const [step, setStep] = useState<Step>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setStep('deleting');
    setError(null);

    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');

      // Hard redirect to home — session is gone, profile no longer exists
      window.location.href = '/';
    } catch {
      setError(t('deleteError'));
      setStep('confirm');
    }
  }

  return (
    <>
      {/* Trigger button */}
      {step === 'idle' && (
        <button
          onClick={() => setStep('confirm')}
          className="
            px-5 py-2.5 rounded-xl text-sm font-semibold
            border border-red-500/40 text-red-500
            hover:bg-red-500/10 hover:border-red-500/70
            transition-all duration-150
          "
        >
          {t('deleteAccount')}
        </button>
      )}

      {/* Confirmation dialog */}
      {(step === 'confirm' || step === 'deleting') && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('deleteAccount')}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold text-foreground mb-2">
              {t('deleteAccountTitle')}
            </h2>
            <p className="text-sm text-muted leading-relaxed mb-6">
              {t('deleteAccountWarning')}
            </p>

            {error && (
              <p className="text-sm text-red-500 mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep('idle'); setError(null); }}
                disabled={step === 'deleting'}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={step === 'deleting'}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-60"
              >
                {step === 'deleting' ? t('deleting') : t('deleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
