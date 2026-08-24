import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const codeQuery = searchParams.get('code');

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Thiếu SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    let query = supabaseAdmin.from('transactions').select('*').order('created_at', { ascending: false });
    
    if (codeQuery) {
      query = query.eq('order_code', Number(codeQuery));
    }

    const { data: transactions, error: txErr } = await query;
    
    if (txErr) throw txErr;

    if (transactions.length === 0) {
       return NextResponse.json({ success: true, transactions: [] });
    }

    const { data: users, error: usersErr } = await supabaseAdmin.auth.admin.listUsers();
    if (usersErr) throw usersErr;

    const txWithUsers = transactions.map(tx => {
      const user = users.users.find(u => u.id === tx.user_id);
      return {
        ...tx,
        user_email: user ? user.email : 'Unknown',
        user_name: user ? (user.user_metadata?.display_name || user.email?.split('@')[0]) : 'Unknown'
      };
    });

    return NextResponse.json({ success: true, transactions: txWithUsers });
  } catch (err: any) {
    console.error("Lỗi lấy danh sách giao dịch:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
