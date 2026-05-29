# GeoMondo — i18n Guide

## Overview

GeoMondo uses `next-intl` for internationalisation. Default locale is **Italian (it)**. Secondary is **English (en)**. All UI strings must be in locale files — zero hardcoded strings in JSX.

---

## Supported Locales

| Code | Language | Status |
|---|---|---|
| `it` | Italian | ✅ Primary |
| `en` | English | ✅ Secondary |

---

## File Structure

```
/messages/
  it.json    ← Italian (canonical — write this first)
  en.json    ← English (translate after Italian is complete)
```

---

## Key Naming Conventions

Keys use dot-notation namespaced by feature. Always lowercase, hyphen-separated words.

```
namespace.key
namespace.sub-namespace.key
```

### Namespaces

| Namespace | Usage |
|---|---|
| `nav.*` | Navigation bar items |
| `home.*` | Landing page |
| `game.*` | In-game UI (timer, minimap, score bar) |
| `result.*` | Round result and final score screen |
| `modes.*` | Game mode names, descriptions |
| `auth.*` | Login, signup, profile |
| `errors.*` | Error messages |
| `common.*` | Shared: buttons, labels used everywhere |

### Example Keys

```json
{
  "nav": {
    "play": "Gioca",
    "leaderboard": "Classifica",
    "profile": "Profilo",
    "sign-in": "Accedi",
    "sign-out": "Esci"
  },
  "home": {
    "hero-title": "Indovina dove sei nel mondo",
    "hero-subtitle": "Il gioco di geografia gratuito, senza limiti.",
    "cta-play": "Gioca Gratis",
    "how-it-works-title": "Come funziona"
  },
  "game": {
    "round": "Round",
    "of": "di",
    "confirm-guess": "Conferma",
    "timer-seconds-left": "{seconds}s",
    "timer-time-up": "Tempo scaduto!",
    "score-label": "Punteggio",
    "expand-map": "Espandi mappa",
    "collapse-map": "Comprimi mappa"
  },
  "result": {
    "distance": "Distanza",
    "km": "km",
    "your-score": "Il tuo punteggio",
    "next-round": "Prossimo Round",
    "final-score": "Risultato Finale",
    "share": "Condividi"
  },
  "modes": {
    "classico": "Classico",
    "classico-desc": "5 round, mappa mondiale, nessun limite di tempo",
    "sprint": "Sprint",
    "sprint-desc": "5 round, 60 secondi per round",
    "italia": "Solo Italia",
    "italia-desc": "Esplora le strade italiane",
    "paese": "Paese",
    "paese-desc": "Indovina solo il paese, non la posizione esatta"
  },
  "auth": {
    "sign-in-title": "Accedi per salvare i tuoi punteggi",
    "sign-in-google": "Continua con Google",
    "sign-in-email": "Accedi con email",
    "save-score-prompt": "Salva il tuo punteggio — Registrati",
    "guest-notice": "Stai giocando come ospite"
  },
  "errors": {
    "location-load-failed": "Impossibile caricare la posizione. Riprova.",
    "score-save-failed": "Impossibile salvare il punteggio.",
    "generic": "Qualcosa è andato storto."
  },
  "common": {
    "loading": "Caricamento...",
    "retry": "Riprova",
    "cancel": "Annulla",
    "confirm": "Conferma",
    "back": "Indietro",
    "new-game": "Nuova Partita"
  }
}
```

---

## Workflow — Adding a New Key

Follow this order strictly. **Never** add a component before completing steps 1–3.

```
1. Add key to /messages/it.json  (Italian — canonical)
2. Add key to /messages/en.json  (English translation)
3. Use the key in JSX via useTranslations()
```

### Usage in Components

```tsx
// Client Component
import { useTranslations } from 'next-intl';

export function ScoreBar() {
  const t = useTranslations('game');
  return (
    <div>
      <span>{t('round')} {currentRound} {t('of')} 5</span>
    </div>
  );
}

// Server Component
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('home');
  return <h1>{t('hero-title')}</h1>;
}
```

### Interpolation

```json
// messages/it.json
"timer-seconds-left": "{seconds}s rimasti"
```

```tsx
t('timer-seconds-left', { seconds: 42 })
// → "42s rimasti"
```

---

## Checking for Missing Keys

Run the i18n check before every commit:

```bash
npm run check-i18n
```

This script (to be created at `/scripts/check-i18n.mjs`) should:
1. Parse all `.tsx` / `.ts` files for `t('...')` calls
2. Extract all key strings
3. Compare against `it.json` and `en.json`
4. Report any key used in code but missing from either locale file
5. Report any key in locale files but never used in code (dead keys)

---

## Locale Routing

`next-intl` middleware handles locale detection via `middleware.ts`:

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['it', 'en'],
  defaultLocale: 'it',
  localePrefix: 'as-needed', // /it/... only if non-default
});
```

URLs:
- Italian (default): `geomondo.it/gioca` (no prefix)
- English: `geomondo.it/en/gioca`

---

## Rules

1. **Italian first.** Always write Italian strings before English.
2. **No hardcoded strings.** Not even "km", "s", punctuation used as labels.
3. **No string concatenation.** Use interpolation: `t('key', { value })` — not `t('prefix') + value`.
4. **Semantic keys.** Key names describe meaning, not content: `game.confirm-guess` not `game.ok-button-text`.
5. **Run check-i18n before every commit.** Non-negotiable.
