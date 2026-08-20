'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Library, ChevronRight, Layers, ArrowLeft, Globe } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndDecks = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }
      
      setUser(session.user);

      // Fetch decks belonging to user
      const { data: decksData, error } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (decksData) {
        setDecks(decksData);
      }
      setLoading(false);
    };

    fetchUserAndDecks();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8 md:p-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto z-10 relative">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Library className="text-blue-400" /> Thư viện của tôi
              </h1>
              <p className="text-zinc-400 mt-2">Quản lý và ôn tập các bộ Flashcard bạn đã tạo.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/discover" className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 rounded-xl transition-colors font-medium">
              <Globe className="w-5 h-5" /> Khám phá Cộng đồng
            </Link>
            
            <Link href="/profile" className="hidden md:flex w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 rounded-full items-center justify-center font-bold text-white shadow-lg transition-all border-2 border-transparent hover:border-purple-400 shrink-0" title="Cài đặt Tài khoản">
              {user?.user_metadata?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>

        {decks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
            <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
              <Layers className="w-10 h-10 text-zinc-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Chưa có bộ thẻ nào</h3>
            <p className="text-zinc-400 mb-8 max-w-md text-center">
              Hãy tạo bộ thẻ đầu tiên của bạn bằng cách phân tích một video Youtube bất kỳ.
            </p>
            <Link href="/" className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-colors">
              Tạo thẻ ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <Link 
                href={`/deck/${deck.id}`} 
                key={deck.id}
                className="group flex flex-col justify-between p-6 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/50 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg"
              >
                <div>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2" title={deck.title}>
                    {deck.title}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Tạo ngày: {new Date(deck.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                
                <div className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-4">
                  <span className="text-sm font-medium text-purple-400 group-hover:text-purple-300 transition-colors">
                    Ôn tập ngay
                  </span>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
