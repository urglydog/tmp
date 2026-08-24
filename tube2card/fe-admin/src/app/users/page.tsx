'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Search, ShieldAlert, KeyRound, DollarSign, Trash2, Settings2, X } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [emailQuery, setEmailQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // CRUD State
  const [addAmount, setAddAmount] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [newPass, setNewPass] = useState('');

  const fetchUsers = async (email?: string) => {
    setLoading(true);
    setError('');
    
    try {
      const url = email ? `/api/users?email=${encodeURIComponent(email)}` : '/api/users';
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Lỗi tải dữ liệu');
      setUsers(data.users);
      if (email && data.users.length === 0) {
        setError('Không tìm thấy tài khoản với Email này.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const searchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(emailQuery.trim());
  };

  const handleAction = async (action: string) => {
    if (!selectedUser) return;
    if (action === 'DELETE_USER' && !window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản này không? Mọi dữ liệu sẽ bị mất.')) return;
    
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    setNewPass('');

    try {
      const payload: any = { action, userId: selectedUser.id };
      if (action === 'ADD_CREDITS') payload.amount = addAmount;

      const res = await fetch('/api/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(data.message);
      
      if (action === 'RESET_PASSWORD') {
        setNewPass(data.newPassword);
      } else if (action === 'ADD_CREDITS') {
        setSelectedUser({ ...selectedUser, credits: selectedUser.credits + addAmount });
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, credits: u.credits + addAmount } : u));
        setAddAmount(0);
      } else if (action === 'DELETE_USER') {
        setUsers(users.filter(u => u.id !== selectedUser.id));
        setSelectedUser(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Quản lý Tài khoản</h1>
        <p className="text-zinc-400 mt-2">Danh sách tất cả người dùng hệ thống và các công cụ quản trị (Bơm điểm, Reset Mật khẩu).</p>
      </div>

      {/* Search Box */}
      <form onSubmit={searchUser} className="relative max-w-xl flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input 
            type="email" 
            placeholder="Tìm theo email..." 
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
            onClick={() => { setEmailQuery(''); fetchUsers(); }}
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

      {/* CRUD Modal / Panel (Hiện khi chọn 1 User) */}
      {selectedUser && (
        <div className="bg-zinc-900 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)] rounded-3xl overflow-hidden flex flex-col md:flex-row relative">
          <button 
            onClick={() => setSelectedUser(null)}
            className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="p-8 md:w-1/2 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900/50">
            <h2 className="text-xl font-bold text-white mb-6">Đang thao tác: <span className="text-purple-400">{selectedUser.email}</span></h2>
            
            {successMsg && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
                {successMsg}
                {newPass && (
                  <div className="mt-2 bg-green-900/50 p-3 rounded-lg flex items-center justify-between">
                    <span className="text-white font-mono text-xl">{newPass}</span>
                    <button onClick={() => navigator.clipboard.writeText(newPass)} className="text-sm bg-green-600 px-3 py-1 rounded text-white hover:bg-green-500">Copy</button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex gap-4 pt-2">
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex-1">
                  <p className="text-blue-400 text-sm mb-1">Số dư Credits</p>
                  <p className="text-2xl font-bold text-blue-300">{new Intl.NumberFormat().format(selectedUser.credits)}</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl flex-1">
                  <p className="text-purple-400 text-sm mb-1">Token tiêu thụ</p>
                  <p className="text-2xl font-bold text-purple-300">{new Intl.NumberFormat().format(selectedUser.totalTokens)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:w-1/2 space-y-6">
            {/* Add Credits */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-2 mb-3 text-blue-400">
                <DollarSign size={18} />
                <span className="font-medium">Bơm / Trừ Credits thủ công</span>
              </div>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="VD: 50000"
                  value={addAmount || ''}
                  onChange={(e) => setAddAmount(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <button 
                  onClick={() => handleAction('ADD_CREDITS')}
                  disabled={actionLoading || !addAmount}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl whitespace-nowrap disabled:opacity-50"
                >
                  Cộng
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => handleAction('RESET_PASSWORD')}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-3 rounded-xl transition-colors text-sm"
              >
                <KeyRound size={16} /> Đổi Mật khẩu
              </button>
              <button 
                onClick={() => handleAction('DELETE_USER')}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-3 rounded-xl transition-colors text-sm"
              >
                <Trash2 size={16} /> Xoá Tài Khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
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
                  <th className="px-6 py-4 font-medium">Credits</th>
                  <th className="px-6 py-4 font-medium">Token đã dùng</th>
                  <th className="px-6 py-4 font-medium">Ngày tham gia</th>
                  <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{u.name}</p>
                      <p className="text-xs text-zinc-500">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full font-medium">
                        {new Intl.NumberFormat().format(u.credits)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-purple-400">
                      {new Intl.NumberFormat().format(u.totalTokens)}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedUser(u);
                          setSuccessMsg('');
                          setError('');
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 ml-auto text-xs"
                      >
                        <Settings2 size={14} /> Quản lý
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      Không có dữ liệu người dùng.
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
