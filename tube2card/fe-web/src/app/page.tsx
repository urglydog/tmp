'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Link2, Loader2, Sparkles, LogOut, Download, Library } from 'lucide-react';
import Flashcard from '@/components/Flashcard';
import Papa from 'papaparse';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [flashcards, setFlashcards] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    // Lấy thông tin user nếu đã đăng nhập
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setSessionToken(session?.access_token ?? null);
    };
    getUser();

    // Lắng nghe trạng thái thay đổi đăng nhập
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSessionToken(session?.access_token ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert('Đăng nhập thất bại: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setFlashcards([]);
    setSuccessMsg('');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setFlashcards([]);

    try {
      const response = await fetch('http://127.0.0.1:8085/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {})
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Lỗi kết nối tới Server AI');
      }

      if (data.success) {
        setSuccessMsg(data.data.message);
        setFlashcards(data.data.flashcards);
        
        // Lưu vào Database thông qua Next.js API Route để tránh bị CORS hoặc Extension chặn
        if (user) {
          try {
            const saveRes = await fetch('/api/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url,
                flashcards: data.data.flashcards,
                token: sessionToken,
                userId: user.id
              })
            });
            
            if (!saveRes.ok) {
              const saveErr = await saveRes.json();
              console.error("Lỗi khi lưu vào DB thông qua API:", saveErr);
            } else {
              console.log("Đã lưu vào Database thành công!");
            }
          } catch (dbErr) {
            console.error("Lỗi network khi gọi API lưu DB:", dbErr);
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (flashcards.length === 0) return;

    // Định dạng Anki Basic Deck yêu cầu 2 cột: Front, Back
    const csvData = flashcards.map(card => ({
      Front: card.front,
      Back: card.back
    }));

    // Dùng PapaParse để tự động xử lý dấu phẩy, nháy kép trong nội dung
    const csv = Papa.unparse(csvData);
    
    // Tạo file và tự động tải xuống
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' }); // Thêm BOM để Excel/Anki đọc UTF-8 tiếng Việt chuẩn
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tube2card_anki_deck.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24 bg-zinc-950 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 max-w-5xl w-full flex flex-col items-center gap-12">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Tube2Card
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light">
            Biến mọi video Youtube thành bộ Flashcard và Sơ đồ tư duy thông minh chỉ trong vài giây.
          </p>
        </div>

        {/* Action Section */}
        <div className="w-full max-w-2xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          {user ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-zinc-200">Xin chào,</p>
                    <p className="text-xs text-zinc-400">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-lg transition-colors text-sm font-medium border border-purple-500/20">
                    <Library size={16} /> Thư viện
                  </Link>
                  <button onClick={handleLogout} className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-red-400 transition-colors" title="Đăng xuất">
                    <LogOut size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Link2 className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Dán link Youtube vào đây..."
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-700 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-lg placeholder:text-zinc-600"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading || !url}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  {loading ? 'AI đang bóc băng...' : 'Tạo Flashcard Ngay'}
                </button>
              </form>

              {/* Status Messages */}
              {error && <p className="text-red-400 text-center bg-red-400/10 py-3 rounded-lg border border-red-400/20">{error}</p>}
              {successMsg && <p className="text-green-400 text-center bg-green-400/10 py-3 rounded-lg border border-green-400/20">{successMsg}</p>}

            </div>
          ) : (
            <div className="flex flex-col items-center py-8 gap-6">
              <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold">Bắt đầu hành trình học tập</h2>
              <p className="text-zinc-400 text-center mb-4">Bạn cần đăng nhập để lưu trữ bộ thẻ và đồng bộ tiến độ học.</p>
              <button 
                onClick={handleLogin}
                className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center gap-3 w-full justify-center text-lg"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Đăng nhập với Google
              </button>
            </div>
          )}
        </div>

        {/* Results Preview Section */}
        {flashcards.length > 0 && (
          <div className="w-full max-w-5xl mt-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="text-yellow-400" />
                Kết quả tạo thẻ ({flashcards.length} thẻ)
                <span className="text-sm font-normal text-zinc-400 ml-4 hidden sm:inline">(Nhấn vào thẻ để lật xem đáp án)</span>
              </h3>
              
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors border border-zinc-700 font-medium"
              >
                <Download size={18} />
                Lưu vào máy (CSV cho Anki)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcards.map((card, idx) => (
                <Flashcard key={idx} front={card.front} back={card.back} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
