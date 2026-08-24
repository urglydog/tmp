import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from 'react';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tube2Card Admin",
  description: "Quản lý hệ thống Tube2Card",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Vì đây là ứng dụng độc lập, ta không dùng Supabase Auth Session nữa
  // Ta sẽ kiểm tra trạng thái đăng nhập dựa trên localStorage/cookie ở màn hình login.
  // Tuy nhiên, vì Next.js server-side không đọc được localStorage trong layout tĩnh,
  // Ta sẽ làm một Component bọc lại (Client Component) hoặc xử lý ở từng page.
  // Để đơn giản nhất, ta xây dựng UI layout chung. Nếu chưa đăng nhập, page sẽ đẩy về /login.

  return (
    <html lang="vi">
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-white flex`}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
