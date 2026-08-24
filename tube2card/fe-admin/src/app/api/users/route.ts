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

    const { data: credits, error: creditsErr } = await supabaseAdmin.from('user_credits').select('*');
    if (creditsErr) throw creditsErr;

    const { data: tokensData, error: tokensErr } = await supabaseAdmin.from('token_usages').select('*');
    if (tokensErr) throw tokensErr;

    let targetUsers = users.users;
    if (emailQuery) {
      targetUsers = targetUsers.filter(u => u.email === emailQuery);
    }

    const result = targetUsers.map(user => {
      const userCredit = credits?.find(c => c.user_id === user.id);
      const userTokens = tokensData?.filter(t => t.user_id === user.id) || [];
      const totalTokens = userTokens.reduce((acc, curr) => acc + (curr.input_tokens || 0) + (curr.output_tokens || 0), 0);
      
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.display_name || user.email?.split('@')[0],
        created_at: user.created_at,
        credits: userCredit ? userCredit.credits : 0,
        totalTokens: totalTokens
      };
    });

    return NextResponse.json({ success: true, users: result });
  } catch (err: any) {
    console.error("Lỗi lấy danh sách user:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
