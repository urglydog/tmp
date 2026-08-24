'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Search, Activity, Zap } from 'lucide-react';

export default function AdminTokensPage() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch('/api/tokens');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch tokens');
        }
        
        setTokens(data.tokens);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTokens();
  }, []);

  const filteredTokens = tokens.filter(t => 
    t.user_email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.task_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Thống kê API Token</h1>
          <p className="text-zinc-400 mt-2">Giám sát lượng token tiêu thụ từ Google Gemini API.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Tìm email, model, tác vụ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-sm w-72"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-purple-500 w-8 h-8" />
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800/50 text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Người dùng</th>
                  <th className="px-6 py-4 font-medium">Model</th>
                  <th className="px-6 py-4 font-medium">Tác vụ</th>
                  <th className="px-6 py-4 font-medium">Input Tokens</th>
                  <th className="px-6 py-4 font-medium">Output Tokens</th>
                  <th className="px-6 py-4 font-medium">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredTokens.length > 0 ? (
                  filteredTokens.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{t.user_name}</p>
                        <p className="text-xs text-zinc-500">{t.user_email}</p>
                      </td>
                      <td className="px-6 py-4 text-purple-400 font-medium">
                        <span className="flex items-center gap-1"><Zap size={14}/> {t.model_name}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 capitalize">{t.task_type}</td>
                      <td className="px-6 py-4 text-blue-400">{new Intl.NumberFormat().format(t.input_tokens)}</td>
                      <td className="px-6 py-4 text-green-400">{new Intl.NumberFormat().format(t.output_tokens)}</td>
                      <td className="px-6 py-4 text-zinc-400">{new Date(t.created_at).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                      Chưa có lượt sử dụng AI nào được ghi nhận.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
