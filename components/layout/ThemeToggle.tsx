'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Before hydration we don't know the active theme, but we still render the
  // button visibly (defaulting to the Sun icon since dark is the default theme).
  // This prevents the invisible-placeholder bug while avoiding layout shift.
  const isDark = !mounted || theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Attiva modalità chiara' : 'Attiva modalità scura'}
      className="
        w-9 h-9 flex items-center justify-center rounded-lg border border-border
        text-foreground/70 hover:text-foreground hover:bg-surface
        transition-colors duration-150
      "
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
