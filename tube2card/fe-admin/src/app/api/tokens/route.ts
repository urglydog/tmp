import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Thiếu SUPABASE_SERVICE_ROLE_KEY trong môi trường Server' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    // 1. Lấy tất cả Token Usages
    const { data: tokens, error: tokensErr } = await supabaseAdmin
      .from('token_usages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (tokensErr) throw tokensErr;

    // 2. Lấy thông tin user
    const { data: users, error: usersErr } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersErr) throw usersErr;

    const tokensWithUsers = tokens.map(t => {
      const user = users.users.find(u => u.id === t.user_id);
      return {
        ...t,
        user_email: user ? user.email : 'Unknown',
        user_name: user ? (user.user_metadata?.display_name || user.email?.split('@')[0]) : 'Unknown'
      };
    });

    return NextResponse.json({ success: true, tokens: tokensWithUsers });
  } catch (err: any) {
    console.error("Lỗi lấy danh sách token usages:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
