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

    // 1. Lấy tất cả Giao dịch
    const { data: transactions, error: txErr } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (txErr) throw txErr;

    // Lấy thông tin user để hiển thị kèm email/tên nếu có thể
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
