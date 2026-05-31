/** Only show avatars uploaded to our own Supabase Storage bucket */
export function isOwnAvatar(url: string | null | undefined): url is string {
  if (!url) return false;
  return url.includes('/storage/v1/object/public/avatars/');
}

/** Pick a deterministic gradient for a username initial */
const GRADIENTS = [
  ['#009246', '#34c759'], // green
  ['#ce2b37', '#ff6b6b'], // red
  ['#6366f1', '#a78bfa'], // indigo
  ['#f59e0b', '#fbbf24'], // amber
  ['#0ea5e9', '#38bdf8'], // sky
  ['#ec4899', '#f472b6'], // pink
  ['#10b981', '#34d399'], // emerald
  ['#8b5cf6', '#c084fc'], // purple
];

export function avatarGradient(username: string): string {
  const idx = username.charCodeAt(0) % GRADIENTS.length;
  const [from, to] = GRADIENTS[idx];
  return `linear-gradient(135deg, ${from}, ${to})`;
}
