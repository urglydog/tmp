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
    const { action, userId, amount } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Thiếu userId' }, { status: 400 });
    }

    switch (action) {
      case 'ADD_CREDITS':
        if (typeof amount !== 'number') {
          return NextResponse.json({ error: 'Thiếu amount hợp lệ' }, { status: 400 });
        }
        
        // Cập nhật credits. Nếu chưa có bảng sẽ fail, nhưng vì trigger tạo user_credits đã chạy nên sẽ luôn có.
        const { data: currentCredits, error: getErr } = await supabaseAdmin
          .from('user_credits')
          .select('credits')
          .eq('user_id', userId)
          .single();
          
        if (getErr && getErr.code !== 'PGRST116') throw getErr;
        
        const newTotal = (currentCredits?.credits || 0) + amount;
        
        const { error: upsertErr } = await supabaseAdmin
          .from('user_credits')
          .upsert({ user_id: userId, credits: newTotal });
          
        if (upsertErr) throw upsertErr;
        return NextResponse.json({ success: true, message: `Đã cộng ${amount} credits.` });

      case 'RESET_PASSWORD':
        // Tạo mật khẩu ngẫu nhiên 8 ký tự
        const newPassword = Math.random().toString(36).slice(-8);
        const { error: resetErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: newPassword
        });
        if (resetErr) throw resetErr;
        return NextResponse.json({ success: true, newPassword, message: 'Đã tạo mật khẩu mới.' });

      case 'DELETE_USER':
        const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (deleteErr) throw deleteErr;
        return NextResponse.json({ success: true, message: 'Đã xóa tài khoản vĩnh viễn.' });

      default:
        return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 });
    }

  } catch (err: any) {
    console.error("Lỗi thực hiện user action:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
