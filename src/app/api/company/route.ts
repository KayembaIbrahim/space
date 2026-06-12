import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'list';

  if (action === 'list') {
    const { data, error } = await supabase.from('profiles').select('*').eq('badge_type', 'gold').order('display_name');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ users: data || [] });
  }

  if (action === 'associates') {
    const companyId = searchParams.get('companyId');
    if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });
    const { data, error } = await supabase.from('profiles').select('*').eq('badge_type', 'blue_org').contains('badge_metadata', JSON.stringify({ company_id: companyId }));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ associates: data || [] });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.action || body.action === 'create') {
    const { companyName, username, industry } = body;
    if (!companyName || !username) return NextResponse.json({ error: 'companyName and username required' }, { status: 400 });
    const { data: user } = await supabase.from('profiles').select('id').eq('username', username.replace('@', '')).single();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    await supabase.rpc('apply_badge_to_profile', { p_user_id: user.id, p_badge_type: 'gold', p_label: companyName, p_metadata: JSON.stringify({ company_name: companyName, industry: industry || '' }) });
    const { data: company, error } = await supabase.from('companies').insert({ profile_id: user.id, company_name: companyName, industry: industry || '' }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const expiresAt = new Date(); expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    await supabase.from('badge_subscriptions').insert({ user_id: user.id, badge_type: 'gold', status: 'active', expires_at: expiresAt.toISOString() });
    return NextResponse.json({ company });
  }

  if (body.action === 'addAssociate') {
    const { companyId, username, title } = body;
    if (!companyId || !username) return NextResponse.json({ error: 'companyId and username required' }, { status: 400 });
    const { data: user } = await supabase.from('profiles').select('id').eq('username', username.replace('@', '')).single();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const { data: company } = await supabase.from('companies').select('*').eq('id', companyId).single();
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    const { error } = await supabase.rpc('apply_badge_to_profile', { p_user_id: user.id, p_badge_type: 'blue_org', p_label: company.company_name, p_metadata: JSON.stringify({ company_id: companyId, company_name: company.company_name, title: title || '' }) });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await supabase.from('notifications').insert({ user_id: user.id, type: 'admin', content: `You've been added as an associate of ${company.company_name}!` });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { companyId, userId } = body;
  if (!companyId || !userId) return NextResponse.json({ error: 'companyId and userId required' }, { status: 400 });
  await supabase.rpc('revoke_badge_from_profile', { p_user_id: userId });
  return NextResponse.json({ success: true });
}
