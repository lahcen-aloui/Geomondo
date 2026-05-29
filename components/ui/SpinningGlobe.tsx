'use client';

import { useState, useEffect } from 'react';

const FRAMES = ['🌍', '🌎', '🌏'] as const;

export default function SpinningGlobe({ className = '' }: { className?: string }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % FRAMES.length), 400);
    return () => clearInterval(id);
  }, []);

  return <span className={className}>{FRAMES[idx]}</span>;
}
