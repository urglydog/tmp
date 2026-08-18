'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Flashcard from '@/components/Flashcard';

export default function StudyMode({ params }: { params: { id: string } }) {
  const [deck, setDeck] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchDeckAndCards = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/');
        return;
      }

      // Lấy thông tin bộ thẻ
      const { data: deckData } = await supabase
        .from('decks')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!deckData) {
        router.push('/dashboard');
        return;
      }

      setDeck(deckData);

      // Lấy danh sách Flashcards
      const { data: cardsData } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', params.id)
        .order('id', { ascending: true });

      if (cardsData) {
        setCards(cardsData);
      }
      setLoading(false);
    };

    fetchDeckAndCards();
  }, [supabase, params.id, router]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setDirection('right');
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection('left');
      setCurrentIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;
  const isFinished = currentIndex === cards.length - 1;

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 md:p-12 relative overflow-hidden flex flex-col">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto w-full z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800 text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Trở về Thư viện
          </Link>
          <div className="text-right">
            <h1 className="text-xl md:text-2xl font-bold line-clamp-1">{deck?.title}</h1>
            <p className="text-zinc-500 text-sm">Chế độ Ôn tập Tập trung</p>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl text-zinc-500">Bộ thẻ này hiện chưa có nội dung nào.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
            
            {/* Progress Bar */}
            <div className="w-full mb-8">
              <div className="flex justify-between text-sm font-medium text-zinc-400 mb-2">
                <span>Tiến độ học</span>
                <span>{currentIndex + 1} / {cards.length}</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Main Card Area */}
            <div className="w-full relative aspect-[3/2] flex items-center justify-center">
              {/* Nút lùi */}
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-0 -translate-x-4 md:-translate-x-16 z-20 p-3 md:p-4 bg-zinc-800/80 hover:bg-purple-600 disabled:opacity-0 disabled:pointer-events-none rounded-full backdrop-blur-md transition-all text-white border border-zinc-700 hover:border-purple-500"
              >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
              </button>

              {/* Thẻ hiển thị */}
              <div 
                key={currentIndex} 
                className={`w-full h-full animate-in fade-in duration-500 ${direction === 'right' ? 'slide-in-from-right-10' : direction === 'left' ? 'slide-in-from-left-10' : ''}`}
              >
                <Flashcard front={cards[currentIndex].front} back={cards[currentIndex].back} />
              </div>

              {/* Nút tiến */}
              <button 
                onClick={handleNext}
                disabled={isFinished}
                className="absolute right-0 translate-x-4 md:translate-x-16 z-20 p-3 md:p-4 bg-zinc-800/80 hover:bg-purple-600 disabled:opacity-0 disabled:pointer-events-none rounded-full backdrop-blur-md transition-all text-white border border-zinc-700 hover:border-purple-500"
              >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
              </button>
            </div>

            {/* Instruction */}
            <p className="text-zinc-500 text-sm mt-8 flex items-center gap-2">
              <span className="hidden md:inline">Sử dụng phím mũi tên ← → để chuyển thẻ.</span> Nhấn vào thẻ để xem đáp án.
            </p>

            {/* Hoàn thành Message */}
            {isFinished && (
              <div className="mt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-5">
                <div className="flex items-center gap-2 text-green-400 mb-4 bg-green-400/10 px-6 py-2 rounded-full border border-green-400/20">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Chúc mừng bạn đã ôn xong bộ thẻ này!</span>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  );
}
