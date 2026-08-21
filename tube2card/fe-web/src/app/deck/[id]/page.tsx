'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Network, Layers, ListChecks, Settings, Edit2, Trash2, RefreshCw, Download, Pencil, Globe, X, FileText, Sparkles, Send, Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Flashcard from '@/components/Flashcard';
import MindmapViewer from '@/components/MindmapViewer';
import QuizPlayer from '@/components/QuizPlayer';

export default function StudyMode({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null);
  const [deck, setDeck] = useState<any>(null);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [mindmapCard, setMindmapCard] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'flashcards' | 'mindmap' | 'quiz' | 'manage'>('overview');
  const [allFlashcards, setAllFlashcards] = useState<any[]>([]);
  const [studyMode, setStudyMode] = useState<'srs' | 'cram'>('srs');
  const [isCurrentCardFlipped, setIsCurrentCardFlipped] = useState(false);

  // Edit Card states
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  // Edit Title states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);
  // Add New Card states
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');

  // Publish Modal states
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishDescription, setPublishDescription] = useState('');
  const [publishTags, setPublishTags] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Custom Quiz states
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const fetchDeckAndCards = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/');
      return;
    }
    setUser(session.user);

    const { data: deckData } = await supabase
      .from('decks')
      .select('*, documents(transcript)')
      .eq('id', params.id)
      .single();

    if (!deckData) {
      router.push('/dashboard');
      return;
    }

    setDeck(deckData);
    setNewTitle(deckData.title);
    if (deckData.description) setPublishDescription(deckData.description);
    if (deckData.tags) setPublishTags(deckData.tags.join(', '));

    const { data: cardsData } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', params.id)
      .order('id', { ascending: true });

    if (cardsData) {
      const fc = cardsData.filter(c => c.type === 'flashcard');
      setAllFlashcards(fc);
      
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
    if (studyMode === 'cram') {
      setFlashcards(allFlashcards);
    } else {
      const now = new Date();
      setFlashcards(allFlashcards.filter(c => {
        if (!c.next_review_date) return true;
        return new Date(c.next_review_date) <= now;
      }));
    }
    setCurrentIndex(0);
    setIsCurrentCardFlipped(false);
  }, [allFlashcards, studyMode]);

  useEffect(() => {
    fetchDeckAndCards();
  }, [supabase, params.id, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

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
      if (isEditingTitle || editingCardId) return; // Không dùng phím mũi tên khi đang gõ text
      if (activeTab !== 'flashcards') return;
      
      // SRS Keyboard Shortcuts
      if (studyMode === 'srs') {
        if (isCurrentCardFlipped) {
          if (e.key === '1') handleReview('hard');
          if (e.key === '2') handleReview('good');
          if (e.key === '3') handleReview('easy');
        } else {
          if (e.key === ' ' || e.key === 'Enter') setIsCurrentCardFlipped(true);
        }
      } else {
        // Chế độ Học tự do
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === ' ' || e.key === 'Enter') setIsCurrentCardFlipped(!isCurrentCardFlipped);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, flashcards.length, activeTab, isEditingTitle, editingCardId, isCurrentCardFlipped]);

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8085';
      const res = await fetch(`${apiUrl}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: deck.documents?.transcript || 'Mock transcript' })
      });
      
      if (!res.ok) throw new Error('Lỗi gọi AI Backend');
      const data = await res.json();
      
      const saveRes = await fetch('/api/save-missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId: deck.id,
          mindmap: data.data.mindmap,
          quizzes: data.data.quizzes,
          token: session?.access_token
        })
      });
      
      if (!saveRes.ok) {
        const errData = await saveRes.json();
        throw new Error(errData.error || 'Lỗi lưu Database');
      }
      
      await fetchDeckAndCards();
      setActiveTab('mindmap');
    } catch (err) {
      alert('Có lỗi xảy ra khi tạo bổ sung: ' + String(err));
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleGenerateCustomQuiz = async () => {
    if (!customPrompt.trim()) return;
    try {
      setIsGeneratingCustom(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8085';
      const res = await fetch(`${apiUrl}/regenerate-custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           transcript: deck.transcript || deck.documents?.transcript || 'Mock transcript',
           prompt: customPrompt
        })
      });
      
      if (!res.ok) throw new Error('Lỗi gọi AI Backend');
      const data = await res.json();
      
      const saveRes = await fetch('/api/save-missing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId: deck.id,
          quizzes: data.data.quizzes,
          token: session?.access_token
        })
      });
      
      if (!saveRes.ok) {
        const errData = await saveRes.json();
        throw new Error(errData.error || 'Lỗi lưu Database');
      }
      
      setCustomPrompt('');
      await fetchDeckAndCards();
      setActiveTab('quiz');
      alert('Đã tạo thêm trắc nghiệm thành công!');
    } catch (err) {
      alert('Có lỗi xảy ra khi tạo trắc nghiệm: ' + String(err));
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thẻ này?')) return;
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (!error) {
      await fetchDeckAndCards();
      if (currentIndex >= flashcards.length - 1 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const startEdit = (card: any) => {
    setEditingCardId(card.id);
    setEditFront(card.front);
    setEditBack(card.back);
  };

  const saveEdit = async () => {
    if (!editingCardId) return;
    const { error } = await supabase
      .from('cards')
      .update({ front: editFront, back: editBack })
      .eq('id', editingCardId);
    
    if (!error) {
      setEditingCardId(null);
      await fetchDeckAndCards();
    } else {
      alert('Lỗi cập nhật: ' + error.message);
    }
  };

  const handleSaveTitle = async () => {
    if (!newTitle.trim() || newTitle === deck.title) {
      setIsEditingTitle(false);
      setNewTitle(deck.title);
      return;
    }
    const { error } = await supabase
      .from('decks')
      .update({ title: newTitle })
      .eq('id', deck.id);
    if (!error) {
      setDeck({ ...deck, title: newTitle });
    } else {
      alert('Không thể đổi tên: ' + error.message);
      setNewTitle(deck.title);
    }
    setIsEditingTitle(false);
  };

  const handleAddCard = async () => {
    if (!newCardFront.trim() || !newCardBack.trim()) {
      alert('Vui lòng nhập đủ câu hỏi và câu trả lời!');
      return;
    }
    const { error } = await supabase.from('cards').insert({
      deck_id: deck.id,
      front: newCardFront,
      back: newCardBack,
      type: 'flashcard',
      interval: 0,
      ease_factor: 2.5
    });

    if (!error) {
      setIsAddingCard(false);
      setNewCardFront('');
      setNewCardBack('');
      await fetchDeckAndCards();
    } else {
      alert('Lỗi thêm thẻ: ' + error.message);
    }
  };

  const handleDownloadCSV = () => {
    if (allFlashcards.length === 0) {
      alert("Không có flashcard nào để xuất!");
      return;
    }
    const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
    const csvContent = allFlashcards.map(card => `${escapeCsv(card.front)},${escapeCsv(card.back)}`).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${deck.title || 'flashcards'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePublishDeck = async () => {
    setIsPublishing(true);
    const tagArray = publishTags.split(',').map(t => t.trim()).filter(Boolean);
    
    const { error } = await supabase
      .from('decks')
      .update({
        is_public: true,
        description: publishDescription,
        tags: tagArray
      })
      .eq('id', deck.id);

    if (!error) {
      setDeck({ ...deck, is_public: true, description: publishDescription, tags: tagArray });
      setIsPublishModalOpen(false);
      alert('Đã chia sẻ bộ thẻ công khai thành công!');
    } else {
      alert('Lỗi khi chia sẻ: ' + error.message);
    }
    setIsPublishing(false);
  };

  const handleUnpublishDeck = async () => {
    const { error } = await supabase
      .from('decks')
      .update({ is_public: false })
      .eq('id', deck.id);

    if (!error) {
      setDeck({ ...deck, is_public: false });
      alert('Đã gỡ bộ thẻ khỏi chế độ công khai.');
    }
  };

  // Logic Thuật toán SRS
  const handleReview = async (quality: 'hard' | 'good' | 'easy') => {
    if (flashcards.length === 0) return;
    const card = flashcards[currentIndex];
    
    let interval = card.interval || 0;
    let easeFactor = card.ease_factor || 2.5;

    if (quality === 'hard') {
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (quality === 'good') {
      interval = interval === 0 ? 1 : interval === 1 ? 2 : Math.round(interval * easeFactor);
    } else if (quality === 'easy') {
      interval = interval === 0 ? 4 : Math.round(interval * easeFactor * 1.3);
      easeFactor += 0.15;
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    // Cập nhật CSDL
    await supabase.from('cards').update({
      interval,
      ease_factor: easeFactor,
      next_review_date: nextReviewDate.toISOString()
    }).eq('id', card.id);

    // Chuyển thẻ tiếp theo
    if (currentIndex < flashcards.length - 1) {
      handleNext();
    } else {
      // Đã học xong thẻ cuối cùng của hôm nay
      setCurrentIndex(prev => prev + 1); // Cho nó vượt qua mảng để hiện màn hình hoàn thành
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

  const isMissingContent = !mindmapCard || quizzes.length === 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 md:p-12 relative overflow-hidden flex flex-col">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto w-full z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6 flex-wrap">
          <div className="flex items-start gap-4 flex-1 min-w-[300px]">
            <Link href="/dashboard" className="flex items-center gap-2 p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800 text-zinc-400 hover:text-white shrink-0 mt-1 lg:mt-0">
              <ArrowLeft className="w-5 h-5" /> <span className="hidden md:inline">Thư viện</span>
            </Link>
            
            <div className="flex-1 w-full">
              {isEditingTitle ? (
                <input 
                  ref={titleInputRef}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setNewTitle(deck.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="bg-zinc-900 border border-purple-500 rounded-lg px-3 py-1 text-xl md:text-2xl font-bold text-white outline-none w-full"
                />
              ) : (
                <div 
                  onClick={() => setIsEditingTitle(true)}
                  className="flex items-start gap-2 cursor-pointer group w-full pt-1 lg:pt-0"
                >
                  <h1 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-purple-400 transition-colors" title={deck?.title}>{deck?.title}</h1>
                  <Pencil className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 mt-1.5" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto shrink-0">
            <div className="flex bg-zinc-800/50 p-1 rounded-lg border border-zinc-700/50 w-full sm:w-auto overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'overview' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                <FileText className="w-4 h-4" /> <span className="hidden md:inline">Tổng quan</span>
              </button>
              <button 
                onClick={() => setActiveTab('flashcards')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'flashcards' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                <Layers className="w-4 h-4" /> <span className="hidden md:inline">Thẻ ghi nhớ</span>
              </button>
              {mindmapCard && (
                <button 
                  onClick={() => setActiveTab('mindmap')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'mindmap' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                >
                  <Network className="w-4 h-4" /> <span className="hidden md:inline">Sơ đồ tư duy</span>
                </button>
              )}
              {quizzes.length > 0 && (
                <button 
                  onClick={() => setActiveTab('quiz')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'quiz' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                >
                  <ListChecks className="w-4 h-4" /> <span className="hidden md:inline">Trắc nghiệm</span>
                </button>
              )}
              <button 
                onClick={() => setActiveTab('manage')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'manage' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                <Settings className="w-4 h-4" /> <span className="hidden md:inline">Quản lý</span>
              </button>
              
              <div className="w-[1px] h-6 bg-zinc-700 mx-1 self-center hidden md:block"></div>
              
              <button 
                onClick={handleDownloadCSV}
                title="Tải bộ thẻ xuống dạng CSV (Lưu ngoại tuyến)"
                className="flex items-center justify-center p-2 rounded-md text-zinc-400 hover:bg-green-500/20 hover:text-green-400 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setIsPublishModalOpen(true)}
                title={deck?.is_public ? "Bộ thẻ đang Công khai" : "Chia sẻ Công khai"}
                className={`flex items-center justify-center p-2 rounded-md transition-colors ${deck?.is_public ? 'text-blue-400 bg-blue-500/10' : 'text-zinc-400 hover:bg-blue-500/20 hover:text-blue-400'}`}
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar Profile Link */}
            <Link href="/" className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors" title="Trang chủ">
              <Home className="w-5 h-5" />
            </Link>
            <button onClick={handleLogout} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors" title="Đăng xuất">
              <LogOut className="w-5 h-5" />
            </button>
            <Link href="/profile" className="hidden sm:flex w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 rounded-full items-center justify-center font-bold text-white shadow-lg transition-all border-2 border-transparent hover:border-purple-400 shrink-0" title="Cài đặt Tài khoản">
              {user?.user_metadata?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </Link>
          </div>
        </div>

        {/* Publish Modal */}
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Globe className="text-blue-400" /> 
                  {deck?.is_public ? 'Cập nhật Chia sẻ' : 'Chia sẻ Công khai'}
                </h2>
                <button onClick={() => setIsPublishModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-zinc-400 text-sm mb-6">
                Khi công khai, bộ thẻ của bạn sẽ xuất hiện trên trang Khám phá. Mọi người có thể học hoặc lưu bản sao bộ thẻ này.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Mô tả (Tùy chọn)</label>
                  <textarea 
                    value={publishDescription}
                    onChange={(e) => setPublishDescription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:border-blue-500 h-24 resize-none"
                    placeholder="Bộ thẻ này nói về cái gì..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Thẻ / Tags (Cách nhau bằng dấu phẩy)</label>
                  <input 
                    type="text"
                    value={publishTags}
                    onChange={(e) => setPublishTags(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
                    placeholder="Ví dụ: Lịch sử, Việt Nam, HK1"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handlePublishDeck}
                  disabled={isPublishing}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                  {deck?.is_public ? 'Cập nhật thông tin' : 'Công khai ngay'}
                </button>
                
                {deck?.is_public && (
                  <button 
                    onClick={handleUnpublishDeck}
                    className="w-full py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl font-bold transition-colors"
                  >
                    Hủy Công khai (Chuyển về Private)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cảnh báo thiếu dữ liệu */}
        {isMissingContent && activeTab !== 'manage' && (
          <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-between">
            <div className="text-purple-300 text-sm">
              Bộ thẻ cũ này chưa có <b>Sơ đồ tư duy</b> và <b>Trắc nghiệm</b>.
            </div>
            <button 
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Tạo bổ sung bằng AI
            </button>
          </div>
        )}

        {/* Tab Overview */}
        {activeTab === 'overview' && (
          <div className="flex-1 w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FileText className="text-purple-400" /> Tóm tắt & Nguồn tài liệu</h2>
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
                    {deck?.summary || (deck?.transcript || deck?.documents?.transcript ? (deck?.transcript || deck?.documents?.transcript).substring(0, 300) + '...' : 'Không có nội dung tóm tắt')}
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
          allFlashcards.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
              <p className="text-xl text-zinc-500">Bộ thẻ này hiện chưa có nội dung nào.</p>
            </div>
          ) : flashcards.length === 0 && studyMode === 'srs' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Tuyệt vời!</h2>
              <p className="text-lg text-zinc-400 max-w-md">Bạn đã ôn tập xong tất cả thẻ cho hôm nay.</p>
              <button 
                onClick={() => setStudyMode('cram')}
                className="mt-6 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border border-zinc-700"
              >
                Chuyển sang Học tự do
              </button>
            </div>
          ) : currentIndex >= flashcards.length ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Hoàn thành ca học!</h2>
              <p className="text-lg text-zinc-400 max-w-md">Bạn đã ôn xong toàn bộ thẻ trong hôm nay. Khả năng ghi nhớ của bạn đang tăng lên từng ngày!</p>
              <button 
                onClick={() => router.push('/dashboard')}
                className="mt-8 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors"
              >
                Quay về Thư viện
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="w-full mb-6">
                <div className="flex justify-center mb-6">
                  <div className="flex bg-zinc-900/80 rounded-xl p-1 border border-zinc-800 shadow-inner">
                    <button 
                      onClick={() => setStudyMode('srs')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${studyMode === 'srs' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                    >
                      🔥 Lộ trình Ôn tập (SRS)
                    </button>
                    <button 
                      onClick={() => setStudyMode('cram')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${studyMode === 'cram' ? 'bg-zinc-700 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                    >
                      📖 Học lướt (Tự do)
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-sm font-medium text-zinc-400 mb-2">
                  <span>{studyMode === 'srs' ? 'Tiến độ ôn tập' : 'Tiến độ học'}</span>
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
                {studyMode === 'cram' && (
                  <button 
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="absolute left-0 -translate-x-4 md:-translate-x-16 z-20 p-3 bg-zinc-800/80 hover:bg-purple-600 disabled:opacity-0 disabled:pointer-events-none rounded-full backdrop-blur-md transition-all text-white border border-zinc-700"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
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

                {studyMode === 'cram' && (
                  <button 
                    onClick={handleNext}
                    disabled={isFinished}
                    className="absolute right-0 translate-x-4 md:translate-x-16 z-20 p-3 bg-zinc-800/80 hover:bg-purple-600 disabled:opacity-0 disabled:pointer-events-none rounded-full backdrop-blur-md transition-all text-white border border-zinc-700"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Controls */}
              {studyMode === 'srs' ? (
                isCurrentCardFlipped ? (
                <div className="mt-10 flex items-center justify-center gap-4 animate-in slide-in-from-bottom-2 fade-in w-full max-w-lg">
                  <button 
                    onClick={() => handleReview('hard')}
                    className="flex-1 flex flex-col items-center p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all"
                  >
                    <span className="font-bold text-lg mb-1">Khó (1)</span>
                    <span className="text-xs opacity-70">Ôn lại sớm</span>
                  </button>
                  <button 
                    onClick={() => handleReview('good')}
                    className="flex-1 flex flex-col items-center p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition-all"
                  >
                    <span className="font-bold text-lg mb-1">Vừa (2)</span>
                    <span className="text-xs opacity-70">Chậm vài ngày</span>
                  </button>
                  <button 
                    onClick={() => handleReview('easy')}
                    className="flex-1 flex flex-col items-center p-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 transition-all"
                  >
                    <span className="font-bold text-lg mb-1">Dễ (3)</span>
                    <span className="text-xs opacity-70">Nhớ lâu</span>
                  </button>
                </div>
                ) : (
                  <p className="text-zinc-500 text-sm mt-8 flex items-center gap-2 animate-in fade-in">
                    <span className="hidden md:inline">Nhấn vào thẻ hoặc phím Space/Enter để lật.</span>
                  </p>
                )
              ) : (
                <p className="text-zinc-500 text-sm mt-8 flex items-center gap-2 animate-in fade-in">
                  <span className="hidden md:inline">Sử dụng mũi tên ← → để chuyển thẻ. Nhấn vào thẻ để lật.</span>
                </p>
              )}
            </div>
          )
        )}

        {/* Tab Mindmap */}
        {activeTab === 'mindmap' && mindmapCard && (
          <div className="flex-1 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col h-full">
              <h2 className="text-lg font-medium text-zinc-300 mb-4">Sơ đồ tư duy tổng quan</h2>
              <MindmapViewer chart={mindmapCard.front} />
            </div>
          </div>
        )}

        {/* Tab Quiz */}
        {activeTab === 'quiz' && (
          <div className="flex-1 w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-2xl border border-purple-500/30 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> Trợ lý AI: Tạo Trắc nghiệm Tùy chỉnh
              </h3>
              <p className="text-zinc-400 text-sm mb-4">
                Yêu cầu AI tạo thêm câu hỏi dựa trên nội dung bài học. Ví dụ: "Tạo cho tôi 5 câu khó về vòng đời component".
              </p>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleGenerateCustomQuiz();
                  }}
                  disabled={isGeneratingCustom}
                  placeholder="Nhập yêu cầu của bạn..."
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none disabled:opacity-50"
                />
                <button 
                  onClick={handleGenerateCustomQuiz}
                  disabled={isGeneratingCustom || !customPrompt.trim()}
                  className="px-6 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center transition-colors"
                >
                  {isGeneratingCustom ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {quizzes.length > 0 ? (
              <div className="w-full flex items-center justify-center">
                <QuizPlayer quizzes={quizzes} deckId={deck.id} />
              </div>
            ) : (
              <p className="text-center text-zinc-500 mt-8">Chưa có câu hỏi trắc nghiệm nào. Hãy yêu cầu AI tạo thêm!</p>
            )}
          </div>
        )}

        {/* Tab Manage (CRUD) */}
        {activeTab === 'manage' && (
          <div className="flex-1 w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Danh sách Flashcard</h2>
              <button 
                onClick={() => setIsAddingCard(!isAddingCard)}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isAddingCard ? 'Hủy' : '+ Thêm thẻ mới'}
              </button>
            </div>
            
            <div className="space-y-4">
              {isAddingCard && (
                <div className="bg-purple-900/20 border-2 border-purple-500/50 p-4 rounded-xl flex flex-col gap-3 mb-4 animate-in fade-in slide-in-from-top-2">
                  <h3 className="font-bold text-purple-300">Tạo Flashcard mới</h3>
                  <input 
                    value={newCardFront} 
                    onChange={e => setNewCardFront(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 focus:border-purple-500 outline-none text-white"
                    placeholder="Mặt trước (Câu hỏi)"
                  />
                  <textarea 
                    value={newCardBack} 
                    onChange={e => setNewCardBack(e.target.value)} 
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 focus:border-purple-500 outline-none min-h-[80px] text-white"
                    placeholder="Mặt sau (Câu trả lời)"
                  />
                  <div className="flex justify-end mt-2">
                    <button onClick={handleAddCard} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium text-white transition-colors">
                      Thêm thẻ
                    </button>
                  </div>
                </div>
              )}
              {allFlashcards.map(card => (
                <div key={card.id} className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex flex-col md:flex-row gap-4 justify-between items-start">
                  {editingCardId === card.id ? (
                    <div className="flex-1 w-full flex flex-col gap-2">
                      <input 
                        value={editFront} 
                        onChange={e => setEditFront(e.target.value)} 
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 focus:border-purple-500 outline-none"
                        placeholder="Mặt trước (Câu hỏi)"
                      />
                      <textarea 
                        value={editBack} 
                        onChange={e => setEditBack(e.target.value)} 
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 focus:border-purple-500 outline-none min-h-[80px]"
                        placeholder="Mặt sau (Câu trả lời)"
                      />
                      <div className="flex gap-2 justify-end mt-2">
                        <button onClick={() => setEditingCardId(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Hủy</button>
                        <button onClick={saveEdit} className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 rounded-lg">Lưu lại</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2 text-purple-300">{card.front}</h3>
                        <p className="text-zinc-400 text-sm whitespace-pre-wrap">{card.back}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(card)} className="p-2 text-zinc-400 hover:text-blue-400 bg-zinc-800 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteCard(card.id)} className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-800 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {flashcards.length === 0 && (
              <p className="text-zinc-500 text-center py-8">Chưa có Flashcard nào.</p>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
