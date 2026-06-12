import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'requests';

  if (action === 'requests') {
    const status = searchParams.get('status') || 'all';
    let query = supabase.from('badge_requests').select('*, user:profiles!badge_requests_user_id_fkey(*)').order('created_at', { ascending: false });
    if (status !== 'all') query = query.eq('status', status);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ requests: data || [] });
  }
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.action === 'issue') {
    const { username, badgeType, label } = body;
    if (!username || !badgeType) return NextResponse.json({ error: 'username and badgeType required' }, { status: 400 });
    const { data: user } = await supabase.from('profiles').select('id').eq('username', username.replace('@', '')).single();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const { error } = await supabase.rpc('apply_badge_to_profile', { p_user_id: user.id, p_badge_type: badgeType, p_label: label || null });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (badgeType === 'blue' || badgeType === 'gold') {
      const expiresAt = new Date(); expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      await supabase.from('badge_subscriptions').insert({ user_id: user.id, badge_type: badgeType, status: 'active', expires_at: expiresAt.toISOString() });
    }
    await supabase.from('admin_logs').insert({ admin_id: null, action: 'issue_badge', target_type: 'user', target_id: user.id, details: { badge_type: badgeType, label } });
    return NextResponse.json({ success: true, userId: user.id });
  }

  if (body.action === 'request') {
    const { userId, requestedType, displayLabel, evidenceUrl, evidenceText } = body;
    const { data, error } = await supabase.from('badge_requests').insert({ user_id: userId, requested_type: requestedType, display_label: displayLabel || null, evidence_url: evidenceUrl || null, evidence_text: evidenceText || null }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ request: data });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  if (body.action === 'reviewRequest') {
    const { requestId, status, reviewNotes } = body;
    const { data: req } = await supabase.from('badge_requests').select('*').eq('id', requestId).single();
    if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    await supabase.from('badge_requests').update({ status, review_notes: reviewNotes || null, resolved_at: new Date().toISOString() }).eq('id', requestId);
    if (status === 'approved') {
      const expiresAt = new Date(); expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      await supabase.rpc('apply_badge_to_profile', { p_user_id: req.user_id, p_badge_type: req.requested_type, p_label: req.display_label, p_expires_at: expiresAt.toISOString() });
      await supabase.from('badge_subscriptions').insert({ user_id: req.user_id, badge_type: req.requested_type, status: 'active', expires_at: expiresAt.toISOString() });
      await supabase.from('notifications').insert({ user_id: req.user_id, type: 'admin', content: `Your ${req.requested_type} badge has been approved!` });
    }
    return NextResponse.json({ success: true });
  }

  if (body.action === 'revoke') {
    await supabase.rpc('revoke_badge_from_profile', { p_user_id: body.userId });
    await supabase.from('badge_subscriptions').update({ status: 'cancelled' }).eq('user_id', body.userId).eq('status', 'active');
    await supabase.from('admin_logs').insert({ admin_id: null, action: 'revoke_badge', target_type: 'user', target_id: body.userId });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
