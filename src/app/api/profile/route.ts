import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  const currentUserId = searchParams.get('currentUserId');
  let isFollowing = false;
  if (currentUserId) {
    const { data: follow } = await supabase.from('follows').select('follower_id').eq('follower_id', currentUserId).eq('following_id', userId).single();
    isFollowing = !!follow;
  }

  return NextResponse.json({ profile, isFollowing });
}
