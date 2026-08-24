import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Thiếu SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    const body = await req.json();
    const { action, transactionId } = body;

    if (!transactionId) {
      return NextResponse.json({ error: 'Thiếu transactionId' }, { status: 400 });
    }

    switch (action) {
      case 'MARK_PAID':
        // 1. Lấy thông tin giao dịch hiện tại
        const { data: tx, error: getErr } = await supabaseAdmin
          .from('transactions')
          .select('*')
          .eq('id', transactionId)
          .single();
          
        if (getErr) throw getErr;
        
        if (tx.status === 'PAID') {
           return NextResponse.json({ error: 'Đơn hàng này đã được duyệt trước đó rồi.' }, { status: 400 });
        }

        // 2. Lấy credits hiện tại
        const { data: currentCredits, error: creditErr } = await supabaseAdmin
          .from('user_credits')
          .select('credits')
          .eq('user_id', tx.user_id)
          .single();
          
        if (creditErr && creditErr.code !== 'PGRST116') throw creditErr;
        
        const newTotal = (currentCredits?.credits || 0) + tx.amount;

        // 3. Update trạng thái giao dịch
        const { error: updateTxErr } = await supabaseAdmin
          .from('transactions')
          .update({ status: 'PAID' })
          .eq('id', transactionId);
        if (updateTxErr) throw updateTxErr;

        // 4. Update số dư
        const { error: upsertErr } = await supabaseAdmin
          .from('user_credits')
          .upsert({ user_id: tx.user_id, credits: newTotal });
        if (upsertErr) throw upsertErr;
        
        return NextResponse.json({ success: true, message: `Đã duyệt đơn hàng thành công. Cộng ${tx.amount} credits cho user.` });

      default:
        return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 });
    }

  } catch (err: any) {
    console.error("Lỗi thực hiện transaction action:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
