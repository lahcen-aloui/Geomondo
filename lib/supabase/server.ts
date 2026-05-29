import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

type CookieEntry = { name: string; value: string; options: CookieOptions };

/**
 * Supabase client for use in Server Components, Route Handlers, and Server Actions.
 * Reads and writes cookies for session management.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieEntry[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — cookie mutation is handled by middleware
          }
        },
      },
    }
  );
}

/**
 * Supabase admin client using service role key.
 * Uses the plain supabase-js client (not SSR) — required for auth.admin methods.
 * Use only in trusted server-side contexts (Route Handlers, Server Actions).
 * NEVER expose to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
