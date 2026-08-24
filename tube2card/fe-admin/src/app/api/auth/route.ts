import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      return NextResponse.json({ error: 'Chưa cấu hình ADMIN_PASSWORD' }, { status: 500 });
    }

    if (password === correctPassword) {
      // Set cookie using next/headers
      cookies().set({
        name: 'admin_token',
        value: 'authenticated',
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Mật khẩu không chính xác' }, { status: 401 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  cookies().delete('admin_token');
  return NextResponse.json({ success: true });
}
