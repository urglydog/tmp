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

    // 1. Tổng số users
    const { data: users, error: usersErr } = await supabaseAdmin.auth.admin.listUsers();
    if (usersErr) throw usersErr;
    const totalUsers = users.users.length;

    // 2. Tổng giao dịch và doanh thu
    const { data: txData, error: txErr } = await supabaseAdmin.from('transactions').select('amount').eq('status', 'PAID');
    if (txErr) throw txErr;
    const totalTransactions = txData ? txData.length : 0;
    const totalRevenue = txData ? txData.reduce((acc, curr) => acc + (curr.amount || 0), 0) : 0;

    // 3. Tổng Token Usage
    const { data: tokensData, error: tokensErr } = await supabaseAdmin.from('token_usages').select('input_tokens, output_tokens');
    if (tokensErr) throw tokensErr;
    const totalTokens = tokensData ? tokensData.reduce((acc, curr) => acc + (curr.input_tokens || 0) + (curr.output_tokens || 0), 0) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalTransactions,
        totalRevenue,
        totalTokens
      }
    });

  } catch (err: any) {
    console.error("Lỗi lấy danh sách stats:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
