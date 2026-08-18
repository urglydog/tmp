'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { User, LogOut, ArrowLeft, Settings, Mail, Save, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [deckCount, setDeckCount] = useState(0);
  const [message, setMessage] = useState('');

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, [supabase]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/');
      return;
    }

    const currentUser = session.user;
    setUser(currentUser);
    setDisplayName(currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || 'Người dùng');

    // Đếm số bộ bài
    const { count } = await supabase
      .from('decks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUser.id);
      
    if (count !== null) setDeckCount(count);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName }
    });

    if (error) {
      setMessage('Lỗi: ' + error.message);
    } else {
      setMessage('Lưu thông tin thành công!');
      // Fetch again to sync state
      await fetchProfile();
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-950 text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-3xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> Trở về trang chủ
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" /> Cài đặt Tài khoản
          </h1>
        </div>

        {/* Profile Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 mt-8">
            <div className="w-32 h-32 bg-zinc-800 rounded-full border-4 border-zinc-900 shadow-2xl flex items-center justify-center shrink-0 relative group">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-4xl font-bold bg-gradient-to-br from-purple-400 to-blue-400 text-transparent bg-clip-text">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">{displayName}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-400 mb-6">
                <Mail className="w-4 h-4" /> {user?.email}
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto md:mx-0 mb-8">
                <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                  <div className="flex items-center gap-2 text-purple-400 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">Bộ Flashcard</span>
                  </div>
                  <span className="text-2xl font-bold">{deckCount}</span>
                </div>
                <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50">
                  <div className="flex items-center gap-2 text-blue-400 mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Tham gia</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-300">
                    {new Date(user?.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-sm mx-auto md:mx-0">
                <div className="space-y-1 text-left">
                  <label className="text-sm font-medium text-zinc-400 pl-1">Tên hiển thị</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white"
                  />
                </div>

                {message && (
                  <div className={`p-3 rounded-lg text-sm border ${message.startsWith('Lỗi') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                    {message}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-6 py-3 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-300 rounded-xl font-bold transition-colors border border-zinc-700 hover:border-red-500/30 flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
