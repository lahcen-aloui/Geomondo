# GeoMondo — Design System
## Inspired by GeoGuessr's dark UI

---

## 1. Color Palette

### Core Colors (CSS Variables)
```css
:root {
  /* Backgrounds */
  --color-bg-primary: #1a1a2e;        /* Deep dark navy — main background */
  --color-bg-secondary: #16213e;      /* Slightly lighter — cards, panels */
  --color-bg-tertiary: #0f3460;       /* Accent dark blue — hover states */
  --color-bg-overlay: rgba(0,0,0,0.6); /* Modal overlays */

  /* Surface / Cards */
  --color-surface: #1e1e2e;           /* Card backgrounds */
  --color-surface-hover: #2a2a3e;     /* Card hover */
  --color-border: rgba(255,255,255,0.08); /* Subtle borders */

  /* Text */
  --color-text-primary: #ffffff;      /* Headings, primary labels */
  --color-text-secondary: #a0aec0;    /* Subtext, descriptions */
  --color-text-muted: #4a5568;        /* Placeholders, disabled */

  /* Accent — GeoGuessr yellow-green */
  --color-accent: #c8f04c;            /* Primary CTA, highlights */
  --color-accent-hover: #b8e03c;      /* Accent hover */
  --color-accent-dark: #1a2a00;       /* Accent background tint */

  /* Score Colors */
  --color-score-great: #c8f04c;       /* 4000-5000 pts */
  --color-score-good: #68d391;        /* 2500-3999 pts */
  --color-score-ok: #f6ad55;          /* 1000-2499 pts */
  --color-score-bad: #fc8181;         /* 0-999 pts */

  /* Italian accent (used sparingly) */
  --color-italian-green: #009246;
  --color-italian-red: #ce2b37;
}
```

### Tailwind Config Extension
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#1a1a2e',
          secondary: '#16213e',
          tertiary: '#0f3460',
          surface: '#1e1e2e',
        },
        accent: {
          DEFAULT: '#c8f04c',
          hover: '#b8e03c',
          dark: '#1a2a00',
        },
        score: {
          great: '#c8f04c',
          good: '#68d391',
          ok: '#f6ad55',
          bad: '#fc8181',
        }
      }
    }
  }
}
```

---

## 2. Typography

### Font Stack
```css
/* Primary font — headings */
font-family: 'Poppins', sans-serif;

/* Body font — UI text */
font-family: 'Inter', sans-serif;

/* Monospace — scores, distances */
font-family: 'JetBrains Mono', monospace;
```

### Import in layout.tsx
```tsx
import { Poppins, Inter, JetBrains_Mono } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '600'] });
```

### Type Scale
```
--text-xs:   0.75rem   / 12px   — labels, badges
--text-sm:   0.875rem  / 14px   — secondary text, captions
--text-base: 1rem      / 16px   — body text
--text-lg:   1.125rem  / 18px   — card titles
--text-xl:   1.25rem   / 20px   — section headers
--text-2xl:  1.5rem    / 24px   — page titles
--text-3xl:  1.875rem  / 30px   — hero subheading
--text-5xl:  3rem      / 48px   — hero heading
--text-7xl:  4.5rem    / 72px   — score display
```

---

## 3. Component Specs

### Primary Button (CTA)
```
Background:     #c8f04c (accent)
Text:           #0f0f0f (dark, for contrast)
Font:           Poppins 600
Border radius:  9999px (fully rounded / pill shape)
Padding:        12px 32px
Hover:          background #b8e03c, slight scale(1.02)
Active:         scale(0.98)
Transition:     all 150ms ease
```

```tsx
// Example
<button className="bg-accent text-black font-semibold font-poppins 
  px-8 py-3 rounded-full hover:bg-accent-hover 
  transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]">
  Gioca Gratis
</button>
```

### Secondary Button (Ghost)
```
Background:     transparent
Border:         1px solid rgba(255,255,255,0.2)
Text:           #ffffff
Border radius:  9999px
Hover:          background rgba(255,255,255,0.08)
```

### Game Card
```
Background:     #1e1e2e
Border:         1px solid rgba(255,255,255,0.08)
Border radius:  16px
Padding:        24px
Hover:          border-color rgba(200,240,76,0.3), translateY(-2px)
Shadow:         0 4px 24px rgba(0,0,0,0.4)
Transition:     all 200ms ease
```

### Score Badge
```
Font:           JetBrains Mono 600
Size:           4.5rem (72px) for final score
Color:          Based on score tier (see Score Colors above)
Animation:      count up from 0 using requestAnimationFrame
```

### Minimap (Guess Map)
```
Position:       Fixed, bottom-right corner of game screen
Default size:   280px × 200px (collapsed)
Expanded size:  420px × 320px (on hover or click)
Border radius:  12px
Border:         2px solid rgba(200,240,76,0.5)
Transition:     width/height 200ms ease
Z-index:        1000
```

### Round Progress Bar (top of game screen)
```
Height:         4px
Background:     rgba(255,255,255,0.1)
Fill:           #c8f04c
Transition:     width 500ms ease
```

### Navbar
```
Background:     rgba(26,26,46,0.95)
Backdrop blur:  12px
Border bottom:  1px solid rgba(255,255,255,0.06)
Height:         64px
Logo font:      Poppins 700, #c8f04c
Position:       sticky top-0, z-50
```

---

## 4. Screen Layouts

### Homepage
```
┌─────────────────────────────────────┐
│  NAVBAR (logo left, auth right)     │
├─────────────────────────────────────┤
│                                     │
│  HERO                               │
│  "Indovina dove sei nel mondo"      │
│  Subtitle + [Gioca Gratis] CTA      │
│  Background: animated globe / map   │
│                                     │
├─────────────────────────────────────┤
│  HOW IT WORKS (3 steps horizontal)  │
│  📍 Esplora → 🗺 Indovina → 🏆 Punteggio │
├─────────────────────────────────────┤
│  GAME MODES (2x2 grid of cards)     │
│  Classico | Sprint                  │
│  Italia   | Paese                   │
├─────────────────────────────────────┤
│  LIVE LEADERBOARD (top 5)           │
├─────────────────────────────────────┤
│  FOOTER                             │
└─────────────────────────────────────┘
```

### Game Screen
```
┌─────────────────────────────────────┐
│ TOP BAR: Round 1/5 | Score: 0 | ⏱  │
├─────────────────────────────────────┤
│                                     │
│                                     │
│         STREET VIEW IFRAME          │
│         (fills entire screen)       │
│                                     │
│                          ┌────────┐ │
│                          │ MINI   │ │
│                          │ MAP    │ │
│                          │ LEAFLET│ │
│                          └────────┘ │
│                    [Conferma Guess] │
└─────────────────────────────────────┘
```

### Result Screen (after each round)
```
┌─────────────────────────────────────┐
│  MAP showing: correct pin + guess   │
│  line connecting the two points     │
├─────────────────────────────────────┤
│  📍 Distanza: 1,243 km              │
│  ⭐ Punti:   3,847 / 5,000          │
│  [score bar animated fill]          │
├─────────────────────────────────────┤
│  Location info: "Osaka, Giappone"   │
├─────────────────────────────────────┤
│  [Prossimo Round →]  [Condividi]    │
└─────────────────────────────────────┘
```

### Final Score Screen
```
┌─────────────────────────────────────┐
│  🏆 PUNTEGGIO FINALE                │
│  18,430 / 25,000                    │
│                                     │
│  Round breakdown (5 rows):          │
│  Round 1: Osaka      3,847 pts      │
│  Round 2: Brazil     4,521 pts      │
│  ...                                │
├─────────────────────────────────────┤
│  [🔁 Gioca Ancora] [📤 Condividi]   │
│  [💾 Salva Risultato] (→ sign up)   │
└─────────────────────────────────────┘
```

---

## 5. Animations & Transitions

```css
/* Score count-up animation */
@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Result line draw (connecting guess to real location) */
/* Use Leaflet polyline with animated dash offset */

/* Page transitions */
/* Use Next.js + Framer Motion: fade + slight translateY */

/* Minimap expand */
transition: width 200ms ease, height 200ms ease;

/* Button hover */
transition: all 150ms ease;

/* Card hover */
transition: transform 200ms ease, border-color 200ms ease;
```

---

## 6. Icons & Assets

Use **Lucide React** for all icons (already lightweight, consistent):
```tsx
import { MapPin, Trophy, Globe, Timer, Share2, ChevronRight } from 'lucide-react';
```

Logo: Text-based — "Geo**Mondo**" where "Geo" is white and "Mondo" is `#c8f04c` (accent), Poppins 700.

```tsx
<span className="font-poppins font-bold">
  <span className="text-white">Geo</span>
  <span className="text-accent">Mondo</span>
</span>
```

---

## 7. Responsive Breakpoints

```
Mobile:   < 640px   — stack everything, minimap full-width bottom sheet
Tablet:   640-1024px — 2-col layouts
Desktop:  > 1024px  — full layout as designed above
```

### Mobile Game Screen
On mobile, the minimap becomes a **bottom sheet** that slides up when tapped, covering the bottom 40% of the screen. The "Conferma" button sits above it.

---

## 8. Dark Mode Only

GeoMondo is **dark mode only** — no light mode toggle. This matches GeoGuessr's approach and keeps the Street View imagery as the visual focus.

`<html>` always has class `dark`. Set in `layout.tsx`:
```tsx
<html lang="it" className="dark">
```

---

## 9. Spacing System (Tailwind defaults)
```
4px  = gap-1, p-1    — micro spacing
8px  = gap-2, p-2    — tight spacing
12px = gap-3, p-3    — compact
16px = gap-4, p-4    — base unit
24px = gap-6, p-6    — card padding
32px = gap-8, p-8    — section spacing
48px = gap-12, p-12  — large sections
64px = gap-16, p-16  — hero padding
```

---

## 10. Key UX Rules

1. **Street View is always full screen** — no chrome around it during gameplay
2. **Minimap is collapsed by default** — expands on hover (desktop) or tap (mobile)
3. **One primary action per screen** — never two competing CTAs
4. **Score animates always** — never shows static number instantly
5. **Loading states** — skeleton screens, never blank white flashes
6. **Confirm button disabled** until pin is placed on minimap
7. **Keyboard shortcuts shown** subtly in corner: `M` = map, `Space` = confirm
