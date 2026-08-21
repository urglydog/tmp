'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { LogOut, User as UserIcon, Settings, ReceiptText } from 'lucide-react';
import { User } from '@supabase/supabase-js';

export default function UserMenu({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0];
  const initial = displayName?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="relative z-50" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-all border-2 border-transparent hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        title={user.email}
      >
        {initial}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-2 overflow-hidden backdrop-blur-xl">
          <div className="px-4 py-3 border-b border-zinc-800/50 mb-1">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email}</p>
          </div>
          
          <Link href="/profile?tab=account" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors">
            <Settings className="w-4 h-4 text-blue-400" />
            Cài đặt Tài khoản
          </Link>
          
          <Link href="/profile?tab=transactions" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors">
            <ReceiptText className="w-4 h-4 text-purple-400" />
            Lịch sử giao dịch
          </Link>
          
          <div className="h-px bg-zinc-800/50 my-1"></div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
