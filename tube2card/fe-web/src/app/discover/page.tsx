'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Globe, Search, Layers, Copy, CheckCircle2, ArrowLeft, Eye, Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DiscoverPage() {
  const [publicDecks, setPublicDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [clonedIds, setClonedIds] = useState<Set<string>>(new Set());
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchPublicDecks();
  }, [supabase]);

  const fetchPublicDecks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('decks')
      .select('*, profiles!decks_user_id_fkey(display_name, email)')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (data) {
      // Nếu không có profiles foreign key thì bỏ qua lỗi, dùng data thô
      setPublicDecks(data);
    } else {
      // Fallback lấy cơ bản
      const { data: fallbackData } = await supabase
        .from('decks')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      if (fallbackData) setPublicDecks(fallbackData);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleCloneDeck = async (deck: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Vui lòng đăng nhập để lưu bộ thẻ này!');
      router.push('/');
      return;
    }

    const currentUserId = session.user.id;
    if (deck.user_id === currentUserId) {
      alert('Đây đã là bộ thẻ của bạn rồi!');
      return;
    }

    setCloningId(deck.id);

    try {
      // 1. Clone the deck
      const { data: newDeck, error: deckError } = await supabase
        .from('decks')
        .insert({
          user_id: currentUserId,
          title: `[Bản sao] ${deck.title}`,
          is_public: false,
          description: deck.description,
          tags: deck.tags,
          cloned_from: deck.id
        })
        .select()
        .single();

      if (deckError) throw deckError;

      // 2. Fetch all cards of the original deck
      const { data: originalCards } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', deck.id);

      // 3. Clone all cards
      if (originalCards && originalCards.length > 0) {
        const cardsToInsert = originalCards.map(c => ({
          deck_id: newDeck.id,
          front: c.front,
          back: c.back,
          type: c.type,
          interval: 0,
          ease_factor: 2.5
        }));

        const { error: cardsError } = await supabase.from('cards').insert(cardsToInsert);
        if (cardsError) throw cardsError;
      }

      setClonedIds(prev => new Set(prev).add(deck.id));
      alert('Đã lưu thành công vào thư viện của bạn!');
    } catch (err: any) {
      alert('Có lỗi xảy ra khi lưu: ' + err.message);
    } finally {
      setCloningId(null);
    }
  };

  const filteredDecks = publicDecks.filter(deck => 
    deck.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8 md:p-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto z-10 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800 text-zinc-400 hover:text-white" title="Trang chủ">
              <Home className="w-5 h-5" />
            </Link>
            <Link href="/dashboard" className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800 text-zinc-400 hover:text-white" title="Thư viện">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Globe className="text-blue-400" /> Khám phá Cộng đồng
              </h1>
              <p className="text-zinc-400 mt-2">Tìm kiếm và lưu các bộ Flashcard hữu ích từ người dùng khác.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors" title="Đăng xuất">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm chủ đề, môn học..."
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex py-20 items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
            <Globe className="w-16 h-16 text-zinc-700 mb-6" />
            <h3 className="text-2xl font-bold mb-2">Chưa tìm thấy bộ thẻ nào</h3>
            <p className="text-zinc-500">Thử một từ khóa khác hoặc quay lại sau.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.map((deck) => (
              <div 
                key={deck.id}
                className="flex flex-col justify-between p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-lg relative overflow-hidden group"
              >
                {/* Decorative line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <Layers className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-zinc-800 rounded-md text-zinc-400">
                      {new Date(deck.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2" title={deck.title}>
                    {deck.title}
                  </h3>
                  
                  {deck.description && (
                    <p className="text-sm text-zinc-400 line-clamp-3 mb-4">
                      {deck.description}
                    </p>
                  )}

                  {deck.tags && deck.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {deck.tags.map((tag: string, i: number) => (
                        <span key={i} className="text-xs font-medium px-2 py-1 bg-blue-500/10 text-blue-300 rounded-md border border-blue-500/20">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-8 flex gap-3">
                  <Link 
                    href={`/preview/${deck.id}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl text-sm font-bold transition-colors border border-blue-500/20"
                  >
                    <Eye className="w-4 h-4" /> Xem
                  </Link>
                  <button 
                    onClick={() => handleCloneDeck(deck)}
                    disabled={cloningId === deck.id || clonedIds.has(deck.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 disabled:text-zinc-600 rounded-xl text-sm font-bold text-white transition-colors"
                  >
                    {cloningId === deck.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : clonedIds.has(deck.id) ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {clonedIds.has(deck.id) ? 'Đã lưu' : 'Lưu bản sao'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
