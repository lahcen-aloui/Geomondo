import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE() {
  // 1. Verify the caller is authenticated
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Call the SECURITY DEFINER function which deletes the caller from auth.users.
  //    ON DELETE CASCADE removes their profile; ON DELETE SET NULL anonymises games.
  const { error: deleteError } = await supabase.rpc('delete_own_account');

  if (deleteError) {
    console.error('Account deletion failed:', deleteError);
    return NextResponse.json({ error: 'Failed to delete account', detail: deleteError.message }, { status: 500 });
  }

  // 3. Sign out the now-deleted session
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
