# /new-feature [name]

When the user runs `/new-feature [name]`, perform these steps in order:

## Step 1 — Read context
Read CLAUDE.md completely.
Read docs/roadmap.md and find where this feature fits in the phase plan.

## Step 2 — Create task brief
Create the file `/docs/tasks/[name].md` using this template:

```markdown
# Feature: [name]

## User Story
As a [player/admin], I [want to / see / can]...
When [condition], [outcome].

## State Machine Impact
Which states are affected? What transitions are added or changed?
(Reference docs/game-logic.md)

## DB Impact
Which tables change? New columns? New migration file needed?
(Reference docs/db-schema.md — always create a migration file, never direct edits)

## API Impact
New routes? Changed request/response shapes?
(Reference docs/api-contracts.md)

## Components Needed
List each new component with its file path and responsibility.

## i18n Keys Needed
List every new key with its namespace (e.g. game.my-new-key).
Keys must be added to BOTH /messages/it.json and /messages/en.json before building.

## Acceptance Criteria
- [ ] criterion 1
- [ ] criterion 2
- [ ] criterion 3
- [ ] i18n complete in it.json and en.json
- [ ] Mobile works at 375px
- [ ] TypeScript: no `any` types
```

## Step 3 — Impact analysis
List every existing file that will need to be modified (not created).
Call out any conflicts with CLAUDE.md constraints before writing a single line of code.

## Step 4 — Wait for approval
Present the task brief and impact analysis to the user.
**Do NOT write any code until the user explicitly approves the plan.**

After approval, build in this order:
1. i18n keys (it.json + en.json)
2. TypeScript types / interfaces
3. DB migration (if needed) — show SQL first, wait for confirmation
4. API route (if needed)
5. Components
6. Wire up to game store / pages
7. Run `npm run check-i18n` and `npm run type-check`
