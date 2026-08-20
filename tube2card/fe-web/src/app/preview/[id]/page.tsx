'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, Network, Layers, ListChecks, Download, Copy, CheckCircle2, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Flashcard from '@/components/Flashcard';
import MindmapViewer from '@/components/MindmapViewer';
import QuizPlayer from '@/components/QuizPlayer';

export default function PreviewMode({ params }: { params: { id: string } }) {
  const [deck, setDeck] = useState<any>(null);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [mindmapCard, setMindmapCard] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'flashcards' | 'mindmap' | 'quiz'>('overview');
  const [isCurrentCardFlipped, setIsCurrentCardFlipped] = useState(false);
  
  const [isCloning, setIsCloning] = useState(false);
  const [hasCloned, setHasCloned] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const fetchDeckAndCards = async () => {
    setLoading(true);

    const { data: deckData } = await supabase
      .from('decks')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!deckData || !deckData.is_public) {
      alert("Bộ thẻ không tồn tại hoặc người tạo đã tắt chế độ công khai.");
      router.push('/discover');
      return;
    }

    // Thử lấy thông tin profile (nếu RLS cho phép)
    let authorName = 'Người dùng ẩn danh';
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', deckData.user_id)
        .maybeSingle();
        
      if (profileData && profileData.display_name) {
        authorName = profileData.display_name;
      }
    } catch (e) {
      // Bỏ qua lỗi nếu bị RLS chặn
    }

    setDeck({ ...deckData, authorName });

    const { data: cardsData } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', params.id)
      .order('id', { ascending: true });

    if (cardsData) {
      const fc = cardsData.filter(c => c.type === 'flashcard');
      setFlashcards(fc);
      
      const mm = cardsData.find(c => c.type === 'mindmap');
      const qzCards = cardsData.filter(c => c.type === 'quiz');
      
      setMindmapCard(mm || null);
      
      if (qzCards.length > 0) {
        const formattedQuizzes = qzCards.map(c => {
          try {
            const backData = JSON.parse(c.back);
            return {
              id: c.id,
              question: c.front,
              options: backData.options || [],
              correctAnswerIndex: backData.correctAnswerIndex ?? 0,
              explanation: backData.explanation || ''
            };
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
        
        setQuizzes(formattedQuizzes);
      } else {
        setQuizzes([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeckAndCards();
  }, [supabase, params.id, router]);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setDirection('right');
      setCurrentIndex(prev => prev + 1);
      setIsCurrentCardFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection('left');
      setCurrentIndex(prev => prev - 1);
      setIsCurrentCardFlipped(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'flashcards') return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ' || e.key === 'Enter') setIsCurrentCardFlipped(!isCurrentCardFlipped);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, flashcards.length, activeTab, isCurrentCardFlipped]);

  const handleCloneDeck = async () => {
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

    setIsCloning(true);

    try {
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

      const { data: originalCards } = await supabase
        .from('cards')
        .select('*')
        .eq('deck_id', deck.id);

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

      setHasCloned(true);
      alert('Đã lưu thành công vào thư viện của bạn!');
    } catch (err: any) {
      alert('Có lỗi xảy ra khi lưu: ' + err.message);
    } finally {
      setIsCloning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;
  const isFinished = currentIndex === flashcards.length - 1;

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 md:p-12 relative overflow-hidden flex flex-col">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto w-full z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6 flex-wrap">
          <div className="flex items-start gap-4 flex-1 min-w-[300px]">
            <Link href="/discover" className="flex items-center gap-2 p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800 text-zinc-400 hover:text-white shrink-0 mt-1 lg:mt-0">
              <ArrowLeft className="w-5 h-5" /> <span className="hidden md:inline">Khám phá</span>
            </Link>
            
            <div className="flex-1 w-full pt-1 lg:pt-0">
              <div className="flex items-start lg:items-center gap-2 mb-1 flex-col lg:flex-row">
                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-bold border border-blue-500/30 shrink-0">PREVIEW</span>
                <h1 className="text-xl md:text-2xl font-bold leading-tight" title={deck?.title}>{deck?.title}</h1>
              </div>
              <p className="text-sm text-zinc-400">Tác giả: {deck?.authorName || 'Người dùng ẩn danh'}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto shrink-0">
            <div className="flex bg-zinc-800/50 p-1 rounded-lg border border-zinc-700/50 w-full sm:w-auto overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                <FileText className="w-4 h-4" /> <span className="hidden md:inline">Tổng quan</span>
              </button>
              <button 
                onClick={() => setActiveTab('flashcards')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'flashcards' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                <Layers className="w-4 h-4" /> <span className="hidden md:inline">Thẻ ghi nhớ</span>
              </button>
              {mindmapCard && (
                <button 
                  onClick={() => setActiveTab('mindmap')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'mindmap' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                >
                  <Network className="w-4 h-4" /> <span className="hidden md:inline">Sơ đồ tư duy</span>
                </button>
              )}
              {quizzes.length > 0 && (
                <button 
                  onClick={() => setActiveTab('quiz')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'quiz' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                >
                  <ListChecks className="w-4 h-4" /> <span className="hidden md:inline">Trắc nghiệm</span>
                </button>
              )}
            </div>

            <button 
              onClick={handleCloneDeck}
              disabled={isCloning || hasCloned}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white hover:bg-zinc-200 disabled:bg-zinc-500 text-black rounded-xl text-sm font-bold transition-colors shadow-lg"
            >
              {isCloning ? <Loader2 className="w-4 h-4 animate-spin" /> : hasCloned ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {hasCloned ? 'Đã lưu về Thư viện' : 'Lưu bản sao để học'}
            </button>
          </div>
        </div>

        {/* Tab Overview */}
        {activeTab === 'overview' && (
          <div className="flex-1 w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FileText className="text-blue-400" /> Tóm tắt & Nguồn tài liệu</h2>
              {deck?.source_url ? (
                <div className="mb-6">
                  <h3 className="text-sm text-zinc-500 uppercase tracking-wider font-bold mb-2">Nguồn</h3>
                  {deck?.source_type === 'youtube' ? (
                    <div className="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg border border-zinc-700">
                      <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${deck.source_url.split('v=')[1]?.split('&')[0]}`} 
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <a href={deck.source_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline break-all">
                      {deck.source_url}
                    </a>
                  )}
                </div>
              ) : (
                <div className="mb-6 text-zinc-500 italic">Không có tài liệu nguồn.</div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm text-zinc-500 uppercase tracking-wider font-bold mb-2">Tóm tắt</h3>
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 text-zinc-300 whitespace-pre-wrap leading-relaxed h-full">
                    {deck?.summary || 'Đang cập nhật nội dung tóm tắt...'}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm text-zinc-500 uppercase tracking-wider font-bold mb-2">Transcript / Nội dung gốc</h3>
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 text-zinc-400 whitespace-pre-wrap leading-relaxed h-64 overflow-y-auto custom-scrollbar">
                    {deck?.transcript || deck?.documents?.transcript || 'Không có bản dịch.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Flashcards */}
        {activeTab === 'flashcards' && (
          flashcards.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
              <p className="text-xl text-zinc-500">Bộ thẻ này hiện chưa có nội dung nào.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="w-full mb-6">
                <div className="flex justify-between text-sm font-medium text-zinc-400 mb-2">
                  <span>Tiến độ xem trước</span>
                  <span>{currentIndex + 1} / {flashcards.length}</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="w-full relative flex items-center justify-center gap-4">
                <button 
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="absolute left-0 -translate-x-4 md:-translate-x-16 z-20 p-3 bg-zinc-800/80 hover:bg-blue-600 disabled:opacity-0 disabled:pointer-events-none rounded-full backdrop-blur-md transition-all text-white border border-zinc-700"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div 
                  key={flashcards[currentIndex]?.id} 
                  className={`w-full max-w-lg h-[400px] animate-in fade-in duration-500 ${direction === 'right' ? 'slide-in-from-right-10' : direction === 'left' ? 'slide-in-from-left-10' : ''}`}
                >
                  <Flashcard 
                    front={flashcards[currentIndex].front} 
                    back={flashcards[currentIndex].back} 
                    onFlip={(flipped) => setIsCurrentCardFlipped(flipped)}
                    resetFlipped={direction !== null}
                  />
                </div>
                <button 
                  onClick={handleNext}
                  disabled={isFinished}
                  className="absolute right-0 translate-x-4 md:translate-x-16 z-20 p-3 bg-zinc-800/80 hover:bg-blue-600 disabled:opacity-0 disabled:pointer-events-none rounded-full backdrop-blur-md transition-all text-white border border-zinc-700"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <p className="text-zinc-500 text-sm mt-8 flex items-center gap-2 animate-in fade-in">
                <span className="hidden md:inline">Sử dụng mũi tên ← → để chuyển thẻ. Nhấn vào thẻ để lật.</span>
              </p>
            </div>
          )
        )}

        {/* Tab Mindmap */}
        {activeTab === 'mindmap' && mindmapCard && (
          <div className="flex-1 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col h-full">
              <h2 className="text-lg font-medium text-zinc-300 mb-4">Sơ đồ tư duy tổng quan (Xem trước)</h2>
              <MindmapViewer chart={mindmapCard.front} />
            </div>
          </div>
        )}

        {/* Tab Quiz */}
        {activeTab === 'quiz' && quizzes.length > 0 && (
          <div className="flex-1 w-full flex flex-col items-center justify-center p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800">
             <h2 className="text-2xl font-bold text-blue-400 mb-4">Trắc nghiệm</h2>
             <p className="text-zinc-400 text-center max-w-md mb-8">
               Chế độ xem trước không hỗ trợ làm và chấm điểm trắc nghiệm. Vui lòng bấm <b>Lưu bản sao</b> để bắt đầu ôn luyện kiến thức này.
             </p>
             <button 
              onClick={handleCloneDeck}
              disabled={isCloning || hasCloned}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-zinc-200 disabled:bg-zinc-500 text-black rounded-xl text-lg font-bold transition-colors shadow-lg"
            >
              {isCloning ? <Loader2 className="w-5 h-5 animate-spin" /> : hasCloned ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {hasCloned ? 'Đã lưu về Thư viện' : 'Lưu bộ thẻ để làm Trắc nghiệm'}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
