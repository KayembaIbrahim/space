import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, username, displayName } = body;

  const { data: existing } = await supabase.from('profiles').select('id').eq('username', username).single();
  if (existing) return NextResponse.json({ error: 'Username already taken' }, { status: 409 });

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });

  if (data.user) {
    await supabase.from('profiles').insert({ id: data.user.id, username, display_name: displayName || username });
  }

  return NextResponse.json({ user: data.user, session: data.session });
}
