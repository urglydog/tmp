import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const emailQuery = searchParams.get('email');

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Thiếu SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    const { data: users, error: usersErr } = await supabaseAdmin.auth.admin.listUsers();
    if (usersErr) throw usersErr;

    let targetUserId = null;
    let targetUserEmail = null;
    let targetUserName = null;

    if (emailQuery) {
      const matchedUser = users.users.find(u => u.email === emailQuery);
      if (!matchedUser) {
        return NextResponse.json({ success: true, tokens: [] });
      }
      targetUserId = matchedUser.id;
      targetUserEmail = matchedUser.email;
      targetUserName = matchedUser.user_metadata?.display_name || matchedUser.email?.split('@')[0];
    }

    let query = supabaseAdmin.from('token_usages').select('*').order('created_at', { ascending: false }).limit(200);
    
    if (targetUserId) {
      query = query.eq('user_id', targetUserId);
    }

    const { data: tokens, error: tokensErr } = await query;
    
    if (tokensErr) throw tokensErr;

    const tokensWithUsers = tokens.map(t => {
      let uEmail = targetUserEmail;
      let uName = targetUserName;
      
      if (!targetUserId) {
        const u = users.users.find(user => user.id === t.user_id);
        uEmail = u ? u.email : 'Unknown';
        uName = u ? (u.user_metadata?.display_name || u.email?.split('@')[0]) : 'Unknown';
      }
      
      return {
        ...t,
        user_email: uEmail,
        user_name: uName
      };
    });

    return NextResponse.json({ success: true, tokens: tokensWithUsers });
  } catch (err: any) {
    console.error("Lỗi lấy danh sách token usages:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
