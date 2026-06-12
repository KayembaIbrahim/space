import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('id');
  if (!postId) return NextResponse.json({ error: 'Post ID required' }, { status: 400 });

  const { data: post, error } = await supabase
    .from('posts')
    .select('*, user:profiles!posts_user_id_fkey(*)')
    .eq('id', postId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ post });
}
