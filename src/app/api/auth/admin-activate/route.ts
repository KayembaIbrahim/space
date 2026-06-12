import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;
  if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 });

  const { data: settings } = await supabase.from('platform_settings').select('value').eq('key', 'admin_portal_activated').single();
  const hashed = hashPassword(password);

  if (!settings) {
    const { error } = await supabase.from('platform_settings').insert({ key: 'admin_portal_activated', value: { activated: true, password_hash: hashed } });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, firstTime: true });
  }

  const stored = settings.value as { password_hash: string };
  if (stored.password_hash !== hashed) return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  return NextResponse.json({ success: true, firstTime: false });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { newPassword, currentPassword } = body;
  if (!newPassword || !currentPassword) return NextResponse.json({ error: 'Both passwords required' }, { status: 400 });

  const { data: settings } = await supabase.from('platform_settings').select('value').eq('key', 'admin_portal_activated').single();
  if (!settings) return NextResponse.json({ error: 'Admin portal not activated' }, { status: 400 });

  const stored = settings.value as { password_hash: string };
  if (stored.password_hash !== hashPassword(currentPassword)) return NextResponse.json({ error: 'Current password incorrect' }, { status: 401 });

  const { error } = await supabase.from('platform_settings').update({ value: { activated: true, password_hash: hashPassword(newPassword) } }).eq('key', 'admin_portal_activated');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
