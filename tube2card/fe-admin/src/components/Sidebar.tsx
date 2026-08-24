'use client';

import React from 'react';
import { LayoutDashboard, Users, CreditCard, Activity, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      window.location.href = '/login';
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-64 border-r border-zinc-800 bg-zinc-900/50 p-6 flex flex-col hidden md:flex h-full">
      <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text mb-8">
        Tube2Card Admin
      </div>
      
      <nav className="flex flex-col gap-2 flex-1">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white">
          <LayoutDashboard size={18} /> Tổng quan
        </Link>
        <Link href="/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white">
          <Users size={18} /> Người dùng
        </Link>
        <Link href="/transactions" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white">
          <CreditCard size={18} /> Giao dịch
        </Link>
        <Link href="/tokens" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white">
          <Activity size={18} /> Quản lý Token
        </Link>
      </nav>

      <div className="mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded-xl"
        >
          <LogOut size={18} /> Đăng xuất
        </button>
      </div>
    </div>
  );
}
