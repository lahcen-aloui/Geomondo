# GeoMondo — Design System

## Design Philosophy

Dark, immersive, minimal. The UI should disappear while playing — Street View takes 100% focus. Elements appear only when needed. Inspired by GeoGuessr's dark UI but with Italian flag accent colours.

---

## Color Tokens

Define these in `tailwind.config.ts` under `theme.extend.colors`:

```typescript
colors: {
  // Base
  'gm-bg':        '#0f0f0f',   // page background
  'gm-surface':   '#1a1a1a',   // cards, panels, modals
  'gm-border':    '#2a2a2a',   // subtle borders
  'gm-muted':     '#6b6b6b',   // secondary text, icons
  'gm-text':      '#f0f0f0',   // primary text

  // Italian flag accents
  'gm-green':     '#009246',   // primary CTA, success states
  'gm-green-hover': '#007a3a', // hover on green
  'gm-red':       '#ce2b37',   // destructive, timer danger zone
  'gm-red-hover': '#b02030',   // hover on red

  // Score colours
  'score-5k':     '#ffd700',   // gold — near perfect (>4500)
  'score-4k':     '#c0c0c0',   // silver (3500–4500)
  'score-3k':     '#cd7f32',   // bronze (2500–3500)
  'score-low':    '#6b6b6b',   // grey — low score (<2500)
}
```

---

## Typography

Font: **Inter** (Google Fonts, preloaded in layout.tsx)

```typescript
// tailwind.config.ts
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],  // scores, distances
}
```

### Scale

| Class | Usage |
|---|---|
| `text-xs` (12px) | Labels, hints, metadata |
| `text-sm` (14px) | Body text, button labels |
| `text-base` (16px) | Default body |
| `text-lg` (18px) | Section subtitles |
| `text-xl` (20px) | Card titles |
| `text-2xl` (24px) | Page headings |
| `text-4xl` (36px) | Score display |
| `text-6xl` (60px) | Hero headline |

---

## Spacing & Layout

- Base unit: `4px` (Tailwind default)
- Page max width: `max-w-7xl mx-auto px-4 sm:px-6`
- Game screen: full viewport (`w-screen h-screen overflow-hidden`)
- Card padding: `p-4` (mobile) → `p-6` (desktop)
- Gap between sections: `gap-6` or `space-y-6`

---

## Component Patterns

### Primary Button (CTA)
```tsx
<button className="
  bg-gm-green hover:bg-gm-green-hover
  text-white font-semibold
  px-6 py-3 rounded-lg
  transition-colors duration-150
  focus:outline-none focus:ring-2 focus:ring-gm-green focus:ring-offset-2 focus:ring-offset-gm-bg
">
  Gioca
</button>
```

### Secondary Button
```tsx
<button className="
  bg-gm-surface hover:bg-gm-border
  text-gm-text border border-gm-border
  px-6 py-3 rounded-lg
  transition-colors duration-150
">
  Annulla
</button>
```

### Card
```tsx
<div className="bg-gm-surface border border-gm-border rounded-xl p-6">
  {/* content */}
</div>
```

### Score Badge
```tsx
// Score colour is dynamic — use a helper function
function scoreColor(score: number): string {
  if (score >= 4500) return 'text-score-5k';
  if (score >= 3500) return 'text-score-4k';
  if (score >= 2500) return 'text-score-3k';
  return 'text-score-low';
}

<span className={`font-mono font-bold text-4xl ${scoreColor(score)}`}>
  {score.toLocaleString('it-IT')}
</span>
```

### Minimap Container (GuessMap)
```tsx
// Collapsed state (default)
<div className="
  absolute bottom-4 right-4
  w-48 h-36
  rounded-xl overflow-hidden
  border-2 border-gm-border
  shadow-2xl
  transition-all duration-300
  hover:w-80 hover:h-60   // expand on hover (desktop)
">
```

### Timer (Sprint Mode)
```tsx
// Normal: white text
// ≤15s: red text + pulse animation
<span className={`
  font-mono font-bold text-2xl
  ${secondsRemaining <= 15 ? 'text-gm-red animate-pulse' : 'text-gm-text'}
`}>
  {secondsRemaining}s
</span>
```

---

## Game Screen Layout

```
┌─────────────────────────────────────────────────┐
│  ScoreBar (top)  Round 2/5    Total: 4,987  [🕐] │ ← h-12, bg-black/60 backdrop
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│            Street View Iframe                   │ ← flex-1, w-full
│                                                 │
│                                                 │
│                          ┌──────────┐           │
│                          │ Minimap  │ ← absolute bottom-right
│                          │ [Conferma]            │
│                          └──────────┘           │
└─────────────────────────────────────────────────┘
```

---

## Result Screen Layout

```
┌─────────────────────────────────────────────────┐
│  Result Map (full width, ~50vh)                 │
│  Shows: true location pin, guess pin, line      │
├─────────────────────────────────────────────────┤
│  Distance: 6.2 km        Score: 4,987 / 5,000   │
│  ████████████████████░░  (progress bar)         │
├─────────────────────────────────────────────────┤
│  [Prossimo Round →]   or   [Risultato Finale]   │
└─────────────────────────────────────────────────┘
```

---

## Responsive Breakpoints

| Breakpoint | Behaviour |
|---|---|
| Mobile (`< 640px`) | Minimap collapsed by default, tap to expand |
| Tablet (`640–1024px`) | Minimap slightly larger |
| Desktop (`> 1024px`) | Minimap expands on hover |

**Rule:** Test every component at 375px (iPhone SE) before marking complete.

---

## Animation Classes

Use Tailwind's built-in — no custom CSS animations:

| Usage | Class |
|---|---|
| Timer danger pulse | `animate-pulse` |
| Button press | `active:scale-95 transition-transform` |
| Panel slide in | `transition-all duration-300` |
| Score reveal | `transition-opacity duration-500` |

---

## Icons

Use **Lucide React** (`lucide-react` package). No other icon library.

```tsx
import { MapPin, Clock, Trophy, Share2, ChevronRight } from 'lucide-react';
```

---

## No-Go Rules

- No inline `style={{}}` attributes — Tailwind only
- No hardcoded hex colors outside `tailwind.config.ts`
- No `!important` overrides
- Leaflet default styles override: wrap in `.leaflet-container` selector in `globals.css`
