import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { followerId, followingId } = body;
  if (!followerId || !followingId) return NextResponse.json({ error: 'followerId and followingId required' }, { status: 400 });
  if (followerId === followingId) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });

  const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Already following' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  await supabase.from('notifications').insert({ user_id: followingId, actor_id: followerId, type: 'follow' });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const followerId = searchParams.get('followerId');
  const followingId = searchParams.get('followingId');
  if (!followerId || !followingId) return NextResponse.json({ error: 'followerId and followingId required' }, { status: 400 });

  const { error } = await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const type = searchParams.get('type') || 'followers';
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  if (type === 'followers') {
    const { data, error } = await supabase.from('follows').select('follower:follower_id(*)').eq('following_id', userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ users: data?.map((d: any) => d.follower) || [] });
  } else {
    const { data, error } = await supabase.from('follows').select('following:following_id(*)').eq('follower_id', userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ users: data?.map((d: any) => d.following) || [] });
  }
}
