'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Search, Zap, ShieldAlert } from 'lucide-react';

export default function AdminTokensPage() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [emailQuery, setEmailQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTokens = async (email?: string) => {
    setLoading(true);
    setError('');
    
    try {
      const url = email ? `/api/tokens?email=${encodeURIComponent(email)}` : '/api/tokens';
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Lỗi tải dữ liệu');
      setTokens(data.tokens);
      if (email && data.tokens.length === 0) {
        setError('Không tìm thấy lịch sử sử dụng AI cho tài khoản này.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const searchTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchTokens(emailQuery.trim());
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Giám sát Token & API Khách hàng</h1>
        <p className="text-zinc-400 mt-2">Theo dõi toàn bộ lịch sử sử dụng AI của người dùng hoặc lọc theo Email cụ thể.</p>
      </div>

      {/* Search Box */}
      <form onSubmit={searchTokens} className="relative max-w-xl flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input 
            type="email" 
            placeholder="Lọc theo địa chỉ email người dùng..." 
            value={emailQuery}
            onChange={(e) => setEmailQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-purple-500 transition-all text-sm"
          />
        </div>
        <button 
          type="submit"
          className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl transition-colors text-sm font-medium"
        >
          Lọc
        </button>
        {emailQuery && (
          <button 
            type="button"
            onClick={() => { setEmailQuery(''); fetchTokens(); }}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl transition-colors text-sm font-medium"
          >
            Bỏ lọc
          </button>
        )}
      </form>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3">
          <ShieldAlert size={20} /> {error}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-purple-500 w-8 h-8" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800/50 text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Người dùng</th>
                  <th className="px-6 py-4 font-medium">Model</th>
                  <th className="px-6 py-4 font-medium">Tác vụ</th>
                  <th className="px-6 py-4 font-medium text-right">Input Tokens</th>
                  <th className="px-6 py-4 font-medium text-right">Output Tokens</th>
                  <th className="px-6 py-4 font-medium text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {tokens.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{t.user_name}</p>
                      <p className="text-xs text-zinc-500">{t.user_email}</p>
                    </td>
                    <td className="px-6 py-4 text-purple-400 font-medium">
                      <span className="flex items-center gap-1"><Zap size={14}/> {t.model_name}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 capitalize">{t.task_type}</td>
                    <td className="px-6 py-4 text-blue-400 text-right">{new Intl.NumberFormat().format(t.input_tokens)}</td>
                    <td className="px-6 py-4 text-green-400 text-right">{new Intl.NumberFormat().format(t.output_tokens)}</td>
                    <td className="px-6 py-4 text-zinc-400 text-right">{new Date(t.created_at).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
                {tokens.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                      Không có dữ liệu sử dụng Token.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
