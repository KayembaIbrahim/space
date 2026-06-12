import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'list';

  if (action === 'stats') {
    const { data: users } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    const { data: posts } = await supabase.from('posts').select('id', { count: 'exact', head: true });
    const { data: voiceComments } = await supabase.from('voice_comments').select('id', { count: 'exact', head: true });
    const { data: reports } = await supabase.from('reports').select('id').eq('status', 'pending');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const { data: todayPosts } = await supabase.from('posts').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString());
    const { data: blueUsers } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('badge_type', 'blue');
    const { data: greyUsers } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('badge_type', 'grey');
    const { data: goldUsers } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('badge_type', 'gold');
    const { data: blueOrgUsers } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('badge_type', 'blue_org');
    const { data: pendingRequests } = await supabase.from('badge_requests').select('id').eq('status', 'pending');

    return NextResponse.json({
      stats: {
        totalUsers: users?.length || 0, totalPosts: posts?.length || 0, totalVoiceComments: voiceComments?.length || 0,
        pendingReports: reports?.length || 0, todayPosts: todayPosts?.length || 0,
        badgeStats: { blue: blueUsers?.length || 0, grey: greyUsers?.length || 0, gold: goldUsers?.length || 0, blueOrg: blueOrgUsers?.length || 0, pendingRequests: pendingRequests?.length || 0 },
      },
    });
  }

  if (action === 'users') {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ users: data || [] });
  }

  if (action === 'reports') {
    const { data, error } = await supabase.from('reports').select('*, reporter:profiles!reports_reporter_id_fkey(*), post:posts(*)').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ reports: data || [] });
  }

  if (action === 'logs') {
    const { data, error } = await supabase.from('admin_logs').select('*, admin:profiles!admin_logs_admin_id_fkey(*)').order('created_at', { ascending: false }).limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ logs: data || [] });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { action, targetId, data: actionData } = body;

  if (action === 'ban') {
    await supabase.from('profiles').update({ is_banned: true, ban_reason: actionData?.reason || 'Banned by admin' }).eq('id', targetId);
    await supabase.from('admin_logs').insert({ admin_id: actionData?.adminId, action: 'ban_user', target_type: 'user', target_id: targetId, details: { reason: actionData?.reason } });
  }
  if (action === 'unban') {
    await supabase.from('profiles').update({ is_banned: false, ban_reason: null }).eq('id', targetId);
    await supabase.from('admin_logs').insert({ admin_id: actionData?.adminId, action: 'unban_user', target_type: 'user', target_id: targetId });
  }
  if (action === 'verify') {
    await supabase.from('profiles').update({ verified: true }).eq('id', targetId);
    await supabase.from('admin_logs').insert({ admin_id: actionData?.adminId, action: 'verify_user', target_type: 'user', target_id: targetId });
  }
  if (action === 'setRole') {
    await supabase.from('profiles').update({ role: actionData?.role }).eq('id', targetId);
    await supabase.from('admin_logs').insert({ admin_id: actionData?.adminId, action: 'set_role', target_type: 'user', target_id: targetId, details: { role: actionData?.role } });
  }
  if (action === 'resolveReport') {
    await supabase.from('reports').update({ status: actionData?.status, reviewed_by: actionData?.adminId, resolved_at: new Date().toISOString() }).eq('id', targetId);
  }
  if (action === 'flagPost') {
    await supabase.from('posts').update({ is_flagged: true, flag_reason: actionData?.reason }).eq('id', targetId);
  }
  if (action === 'deletePost') {
    await supabase.from('posts').delete().eq('id', targetId);
  }
  if (action === 'updateSetting') {
    await supabase.from('platform_settings').upsert({ key: actionData?.key, value: actionData?.value, updated_by: actionData?.adminId });
  }

  return NextResponse.json({ success: true });
}
