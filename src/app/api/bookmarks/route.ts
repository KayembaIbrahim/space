import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, postId } = body;
  if (!userId || !postId) return NextResponse.json({ error: 'userId and postId required' }, { status: 400 });

  const { error } = await supabase.from('bookmarks').insert({ user_id: userId, post_id: postId });
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Already bookmarked' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const postId = searchParams.get('postId');
  if (!userId || !postId) return NextResponse.json({ error: 'userId and postId required' }, { status: 400 });

  const { error } = await supabase.from('bookmarks').delete().eq('user_id', userId).eq('post_id', postId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const { data, error } = await supabase
    .from('bookmarks')
    .select('post:posts(*, user:profiles!posts_user_id_fkey(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookmarks: data?.map((b: any) => b.post) || [] });
}
