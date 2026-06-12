import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'algorithmic';
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const userId = searchParams.get('userId');

  let query = supabase
    .from('posts')
    .select('*, user:profiles!posts_user_id_fkey(*)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (mode === 'algorithmic') {
    query = supabase
      .from('posts')
      .select('*, user:profiles!posts_user_id_fkey(*)')
      .order('like_count', { ascending: false })
      .range(offset, offset + limit - 1);
  }

  const { data: posts, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: posts || [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content, post_type, poll_options, poll_ends_at, media_urls, media_type } = body;
  const userId = body.userId || '00000000-0000-0000-0000-000000000000';

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      content,
      post_type: post_type || 'text',
      poll_options: poll_options || null,
      poll_ends_at: poll_ends_at || null,
      media_urls: media_urls || [],
      media_type: media_type || 'none',
    })
    .select('*, user:profiles!posts_user_id_fkey(*)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { postId, optionIndex } = body;

  const { data: post } = await supabase.from('posts').select('poll_options').eq('id', postId).single();
  if (!post?.poll_options) return NextResponse.json({ error: 'No poll found' }, { status: 404 });

  const updated = post.poll_options.map((opt: { text: string; votes: number }, i: number) =>
    i === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
  );

  const { error } = await supabase.from('posts').update({ poll_options: updated }).eq('id', postId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('poll_votes').insert({
    user_id: body.userId || '00000000-0000-0000-0000-000000000000',
    post_id: postId,
    option_index: optionIndex,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('id');
  if (!postId) return NextResponse.json({ error: 'Post ID required' }, { status: 400 });

  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
