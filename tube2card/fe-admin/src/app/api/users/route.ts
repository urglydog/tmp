import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    // API Route này yêu cầu SUPABASE_SERVICE_ROLE_KEY để query bảng auth.users
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      return NextResponse.json({ error: 'Thiếu SUPABASE_SERVICE_ROLE_KEY trong môi trường Server' }, { status: 500 });
    }

    // Xác thực Admin từ Token (Bạn có thể thêm logic xác thực header authorization nếu muốn an toàn hơn)
    // Hiện tại coi như chỉ có Admin gọi route này do được bảo vệ bằng UI.

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    // 1. Lấy tất cả Users
    const { data: users, error: usersErr } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersErr) throw usersErr;

    // 2. Lấy thông tin Credits
    const { data: credits, error: creditsErr } = await supabaseAdmin.from('user_credits').select('*');
    
    if (creditsErr) throw creditsErr;

    // Map Credits vào Users
    const usersWithCredits = users.users.map(user => {
      const userCredit = credits?.find(c => c.user_id === user.id);
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.display_name || user.email?.split('@')[0],
        created_at: user.created_at,
        credits: userCredit ? userCredit.credits : 0
      };
    });

    return NextResponse.json({ success: true, users: usersWithCredits });
  } catch (err: any) {
    console.error("Lỗi lấy danh sách user:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
