import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');
  const limit = parseInt(searchParams.get('limit') || '50');
  if (!postId) return NextResponse.json({ error: 'postId required' }, { status: 400 });

  const { data: comments, error } = await supabase
    .from('voice_comments')
    .select('*, user:profiles!voice_comments_user_id_fkey(*)')
    .eq('post_id', postId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: comments || [] });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const audio = formData.get('audio') as File;
  const postId = formData.get('postId') as string;
  const duration = parseInt(formData.get('duration') as string);

  if (!audio || !postId) return NextResponse.json({ error: 'audio and postId required' }, { status: 400 });

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.webm`;
  const { error: uploadError } = await supabase.storage.from('voice').upload(fileName, audio, { contentType: 'audio/webm' });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from('voice').getPublicUrl(fileName);
  const audioUrl = urlData.publicUrl;
  const userId = formData.get('userId') as string || '00000000-0000-0000-0000-000000000000';

  const { data: comment, error: insertError } = await supabase
    .from('voice_comments')
    .insert({ user_id: userId, post_id: postId, audio_url: audioUrl, duration, waveform_data: Array.from({ length: Math.floor(duration * 10) }, () => Math.random()) })
    .select('*, user:profiles!voice_comments_user_id_fkey(*)')
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
  return NextResponse.json({ comment });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { commentId, action } = body;

  if (action === 'like') {
    await supabase.from('voice_comment_likes').insert({ user_id: body.userId || '00000000-0000-0000-0000-000000000000', voice_comment_id: commentId });
  } else if (action === 'unlike') {
    await supabase.from('voice_comment_likes').delete().eq('voice_comment_id', commentId);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { error } = await supabase.from('voice_comments').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
