'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Link2, Loader2, Sparkles, LogOut, Download, Library, Clock, ChevronRight } from 'lucide-react';
import Flashcard from '@/components/Flashcard';
import Papa from 'papaparse';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [recentDecks, setRecentDecks] = useState<any[]>([]);

  // Auth States
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const supabase = createClient();
  const router = useRouter();

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

  const fetchRecentDecks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setRecentDecks(data);
  };

  useEffect(() => {
    if (user) {
      fetchRecentDecks();
    } else {
      setRecentDecks([]);
    }
  }, [user, supabase]);

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: email.split('@')[0]
          }
        }
      });
      if (error) setAuthError(error.message);
      else alert('Đăng ký thành công! Vui lòng kiểm tra email để xác thực (Nếu Supabase yêu cầu).');
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setFlashcards([]);
    setSuccessMsg('');
    setRecentDecks([]);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setFlashcards([]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8085';
      const response = await fetch(`${apiUrl}/generate`, {
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
                transcript: data.data.transcript,
                flashcards: data.data.flashcards,
                mindmap: data.data.mindmap,
                quizzes: data.data.quizzes,
                token: sessionToken,
                userId: user.id
              })
            });
            
            if (!saveRes.ok) {
              const saveErr = await saveRes.json();
              console.error("Lỗi khi lưu vào DB thông qua API:", saveErr);
            } else {
              console.log("Đã lưu vào Database thành công!");
              // Cập nhật lại lịch sử truy cập nhanh
              fetchRecentDecks();
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
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // Thêm BOM để Excel/Anki đọc UTF-8 tiếng Việt chuẩn
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tube2card_anki_deck.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                  <Link href="/profile" className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-purple-400">
                    {user.user_metadata?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </Link>
                  <div className="text-left">
                    <p className="text-sm font-medium text-zinc-200">Xin chào,</p>
                    <Link href="/profile" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                      {user.user_metadata?.display_name || user.email?.split('@')[0]}
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-lg transition-colors text-sm font-medium border border-purple-500/20">
                    <Library size={16} /> Thư viện
                  </Link>
                  <Link href="/profile" className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Cài đặt Tài khoản">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  </Link>
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

              {/* Quick Access History */}
              {recentDecks.length > 0 && !loading && (
                <div className="mt-4 animate-in fade-in slide-in-from-bottom-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-zinc-400 mb-3 uppercase tracking-wider">
                    <Clock className="w-4 h-4" /> Vừa học gần đây
                  </h3>
                  <div className="flex flex-col gap-2">
                    {recentDecks.map(deck => (
                      <button 
                        key={deck.id}
                        onClick={() => router.push(`/deck/${deck.id}`)}
                        className="group flex items-center justify-between p-3 bg-zinc-800/30 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl transition-all text-left"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-purple-200 group-hover:text-purple-300 transition-colors line-clamp-1">
                            {deck.title}
                          </span>
                          <span className="text-xs text-zinc-500 mt-1">
                            {new Date(deck.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 py-4">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-2 shadow-inner">
                <LogOut className="w-8 h-8 text-zinc-500" />
              </div>
              <h2 className="text-2xl font-semibold">{authMode === 'login' ? 'Đăng nhập vào hệ thống' : 'Đăng ký tài khoản mới'}</h2>
              
              <form onSubmit={handleEmailAuth} className="w-full max-w-sm flex flex-col gap-4 mt-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Địa chỉ Email"
                  required
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white"
                />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  required
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white"
                />
                {authError && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">{authError}</p>}
                
                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-colors disabled:opacity-50 shadow-lg shadow-purple-500/20"
                >
                  {authLoading ? <Loader2 className="animate-spin mx-auto w-5 h-5" /> : (authMode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản')}
                </button>
              </form>

              <div className="text-sm text-zinc-400 mt-1">
                {authMode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'} 
                <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="ml-1 text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  {authMode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
                </button>
              </div>

              <div className="w-full max-w-sm flex items-center gap-4 py-4">
                <div className="flex-1 h-px bg-zinc-800"></div>
                <span className="text-zinc-500 text-sm">Hoặc tiếp tục với</span>
                <div className="flex-1 h-px bg-zinc-800"></div>
              </div>

              <button 
                onClick={handleLogin}
                className="w-full max-w-sm flex items-center justify-center gap-3 px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors border border-zinc-700"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Google
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
                Tải file CSV (Lưu trữ ngoại tuyến)
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
