'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, LogOut, ArrowLeft, Settings, Mail, Save, Loader2, BookOpen, ReceiptText, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

function ProfileContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [deckCount, setDeckCount] = useState(0);
  const [message, setMessage] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'account';

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

    // Lấy lịch sử giao dịch
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    
    if (txData) setTransactions(txData);

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
      await fetchProfile();
    }
    setSaving(false);
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

      <div className="w-full max-w-4xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors border border-zinc-800 p-2 px-4 rounded-xl hover:bg-zinc-800">
            <ArrowLeft className="w-5 h-5" /> Trở về trang chủ
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold hidden md:flex items-center gap-2">
              <UserMenu user={user} />
            </h1>
          </div>
        </div>

        {/* Layout with Sidebar & Content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
            <Link 
              href="/profile?tab=account" 
              className={`flex items-center gap-3 p-4 rounded-xl transition-all ${currentTab === 'account' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 font-bold' : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'}`}
            >
              <Settings className="w-5 h-5" /> Cài đặt Tài khoản
            </Link>
            <Link 
              href="/profile?tab=transactions" 
              className={`flex items-center gap-3 p-4 rounded-xl transition-all ${currentTab === 'transactions' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 font-bold' : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'}`}
            >
              <ReceiptText className="w-5 h-5" /> Lịch sử thanh toán
            </Link>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden relative min-h-[500px]">
            {currentTab === 'account' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col items-center md:items-start gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-zinc-800 rounded-full border-4 border-zinc-900 shadow-xl flex items-center justify-center shrink-0">
                      <span className="text-3xl font-bold bg-gradient-to-br from-purple-400 to-blue-400 text-transparent bg-clip-text">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <Mail className="w-4 h-4" /> {user?.email}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full mb-8">
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
                        <span className="text-sm font-medium">Thành viên từ</span>
                      </div>
                      <span className="text-lg font-bold text-zinc-300">
                        {new Date(user?.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSave} className="flex flex-col gap-4 w-full">
                    <div className="space-y-1">
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

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-colors disabled:opacity-50 mt-4"
                    >
                      {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                      Lưu thay đổi
                    </button>
                  </form>
                </div>
              </div>
            )}

            {currentTab === 'transactions' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <ReceiptText className="text-purple-400" /> Lịch sử thanh toán
                </h2>
                
                {transactions.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                    <ReceiptText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">Bạn chưa có giao dịch nào.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 text-sm">
                          <th className="pb-4 font-medium">Mã Đơn</th>
                          <th className="pb-4 font-medium">Thời gian</th>
                          <th className="pb-4 font-medium">Số tiền</th>
                          <th className="pb-4 font-medium">Gói nạp</th>
                          <th className="pb-4 font-medium text-right">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                            <td className="py-4 text-zinc-300 font-mono text-sm">#{tx.order_code}</td>
                            <td className="py-4 text-zinc-400 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> 
                                {new Date(tx.created_at).toLocaleDateString('vi-VN')}
                              </div>
                            </td>
                            <td className="py-4 font-bold text-white">{tx.amount.toLocaleString()}đ</td>
                            <td className="py-4 text-purple-400 text-sm font-medium">+{tx.credits_added} Credits</td>
                            <td className="py-4 text-right">
                              {tx.status === 'PAID' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Thành công
                                </span>
                              ) : tx.status === 'CANCELLED' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
                                  <XCircle className="w-3.5 h-3.5" /> Đã hủy
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold border border-yellow-500/20">
                                  <Clock className="w-3.5 h-3.5" /> Chờ xử lý
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
