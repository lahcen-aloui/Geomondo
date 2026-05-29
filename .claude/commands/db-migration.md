# /db-migration [description]

When the user runs `/db-migration [description]`, perform these steps:

## Step 1 — Read current schema
Read docs/db-schema.md to understand the current database state.
Read all existing files in /supabase/migrations/ to understand what has already been applied.

## Step 2 — Draft the SQL
Write the migration SQL. Include:
- The change itself (ALTER TABLE, CREATE TABLE, CREATE INDEX, etc.)
- A rollback comment (what would need to be done to undo this)
- Any RLS policy changes needed

## Step 3 — Show SQL and WAIT
Display the complete SQL to the user with a clear header:

```
⚠️  MIGRATION PREVIEW — NOT YET CREATED
[description]

SQL:
[the sql here]

Rollback:
[rollback sql here]

This will modify your production database. Confirm to proceed.
```

**Do NOT create the migration file until the user explicitly confirms.**

## Step 4 — Create migration file (after confirmation only)
Determine the next migration number by checking existing files in /supabase/migrations/.
Create the file: `/supabase/migrations/[NNN]_[description-slug].sql`

File format:
```sql
-- Migration: [NNN] [description]
-- Created: [date]
-- Description: [what this migration does]

[SQL here]
```

## Step 5 — Update docs/db-schema.md
After creating the migration file, update docs/db-schema.md to reflect the schema change.
Add the new migration to the "Migration Files" table in that doc.

## Rule
Never apply migrations directly in Supabase Studio without creating the migration file first.
The /supabase/migrations/ folder is the source of truth for schema history.
