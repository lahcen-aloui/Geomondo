# /check-i18n

When the user runs `/check-i18n`, perform a full i18n audit:

## Step 1 — Scan code for used keys
Search all .tsx and .ts files for:
- `t('...')` calls (client components using useTranslations)
- `t("...")` calls
- `await getTranslations(...)` usage

Extract every key string being referenced.

## Step 2 — Load locale files
Read /messages/it.json and /messages/en.json completely.
Flatten all nested keys to dot-notation (e.g. `game.confirm-guess`).

## Step 3 — Cross-reference and report

Report the following:

### Missing from it.json
Keys used in code but not defined in Italian locale file.
These will cause runtime errors — fix immediately.

### Missing from en.json
Keys defined in it.json but not in English locale file.
These will show raw key strings to English users.

### Dead keys
Keys defined in locale files but never used in any component.
These are clutter — remove unless they are planned for upcoming features.

### Interpolation mismatches
Keys using `{variable}` in one locale file but not the other.

## Step 4 — Fix or report
If issues are found: list them clearly with the exact key name and file.
Do NOT auto-fix locale files without asking — the user may need to write the translation.
If no issues: confirm "i18n is clean — all keys are defined and used correctly."

## Rule
Run this check before every commit. It is non-negotiable per CLAUDE.md.
