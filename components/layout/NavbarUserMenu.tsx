'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { createClient } from '@/lib/supabase/client';
import { isOwnAvatar, avatarGradient } from '@/lib/avatar';

interface Props {
  username: string | null;
  avatarUrl: string | null;
}

export default function NavbarUserMenu({ username, avatarUrl }: Props) {
  const t = useTranslations('nav');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!username) {
    return (
      <Link
        href="/accedi"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground px-2 sm:px-3 py-2 rounded-lg transition-colors border border-border hover:border-foreground/30"
      >
        {/* Person icon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
        <span className="hidden sm:inline">{t('login')}</span>
      </Link>
    );
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm uppercase select-none focus:outline-none hover:opacity-90 transition-opacity ring-2 ring-white/20"
        style={isOwnAvatar(avatarUrl) ? undefined : { background: avatarGradient(username) }}
        aria-label={username}
      >
        {isOwnAvatar(avatarUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
        ) : (
          username[0]
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-48 bg-surface border border-border rounded-xl shadow-2xl py-1 z-50">
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-foreground font-semibold text-sm truncate">{username}</p>
          </div>
          <a
            href={`/profilo/${encodeURIComponent(username)}`}
            className="block px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer"
            onClick={() => setOpen(false)}
          >
            {t('profile')}
          </a>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-it-red hover:bg-foreground/5 transition-colors"
          >
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}
