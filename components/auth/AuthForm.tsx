'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

export default function AuthForm() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleGoogle() {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    });
    setIsLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 rounded-full bg-it-green/10 border border-it-green/20 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-it-green">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.82 12 19.79 19.79 0 0 1 1.74 3.18 2 2 0 0 1 3.71 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
            <polyline points="16 2 16 8 22 8" />
          </svg>
        </div>
        <p className="text-foreground font-semibold mb-1">{t('magicLinkSent')}</p>
        <p className="text-muted text-sm">{email}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-4 rounded-xl transition-colors duration-150 disabled:opacity-60"
      >
        {/* Google G logo */}
        <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {t('continueWithGoogle')}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted">{t('orEmail')}</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Magic link */}
      <form onSubmit={handleMagicLink} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-it-green/60 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full bg-it-green hover:bg-it-green-dark text-white font-semibold py-3 rounded-xl transition-colors duration-150 disabled:opacity-60"
        >
          {t('signIn')}
        </button>
      </form>

      {error && (
        <p className="text-it-red text-sm text-center">{error}</p>
      )}
    </div>
  );
}
