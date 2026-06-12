import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  let query = supabase
    .from('notifications')
    .select('*, actor:profiles!notifications_actor_id_fkey(*), post:posts(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (unreadOnly) query = query.eq('is_read', false);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notifications: data || [] });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { userId, notificationIds } = body;
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  let query = supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
  if (notificationIds?.length) query = query.in('id', notificationIds);

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
