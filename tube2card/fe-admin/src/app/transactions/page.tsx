'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Search, ShieldAlert, CheckCircle2, PackageSearch, Settings2, X } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [codeQuery, setCodeQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTransactions = async (code?: string) => {
    setLoading(true);
    setError('');
    
    try {
      const url = code ? `/api/transactions?code=${encodeURIComponent(code)}` : '/api/transactions';
      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Lỗi tải dữ liệu');
      setTransactions(data.transactions);
      if (code && data.transactions.length === 0) {
        setError('Không tìm thấy giao dịch với Mã đơn hàng này.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const searchTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions(codeQuery.trim());
  };

  const handleAction = async (action: string) => {
    if (!selectedTx) return;
    
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/transactions/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, transactionId: selectedTx.id })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessMsg(data.message);
      
      if (action === 'MARK_PAID') {
        setSelectedTx({ ...selectedTx, status: 'PAID' });
        setTransactions(transactions.map(t => t.id === selectedTx.id ? { ...t, status: 'PAID' } : t));
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
        <h1 className="text-3xl font-bold">Quản lý Giao dịch</h1>
        <p className="text-zinc-400 mt-2">Danh sách tất cả đơn hàng PayOS và công cụ duyệt thủ công nếu webhook lỗi.</p>
      </div>

      {/* Search Box */}
      <form onSubmit={searchTransaction} className="relative max-w-xl flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input 
            type="number" 
            placeholder="Tìm theo Mã đơn hàng (VD: 123456)..." 
            value={codeQuery}
            onChange={(e) => setCodeQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-green-500 transition-all text-sm"
          />
        </div>
        <button 
          type="submit"
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl transition-colors text-sm font-medium"
        >
          Lọc
        </button>
        {codeQuery && (
          <button 
            type="button"
            onClick={() => { setCodeQuery(''); fetchTransactions(); }}
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

      {/* Transaction CRUD Panel */}
      {selectedTx && (
        <div className="bg-zinc-900 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)] rounded-3xl overflow-hidden relative flex flex-col md:flex-row mb-8">
          <button 
            onClick={() => setSelectedTx(null)}
            className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="p-8 md:w-1/2 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900/50">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PackageSearch className="text-green-400" /> Chi tiết Đơn hàng
            </h2>

            {successMsg && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
                {successMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Mã đơn hàng</p>
                <p className="text-2xl font-bold text-green-400">#{selectedTx.order_code}</p>
              </div>
              <div className="flex gap-4 pt-2">
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex-1">
                  <p className="text-zinc-400 text-sm mb-1">Trạng thái</p>
                  {selectedTx.status === 'PAID' ? (
                    <span className="text-green-400 font-bold">ĐÃ THANH TOÁN</span>
                  ) : (
                    <span className="text-yellow-400 font-bold">PENDING</span>
                  )}
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex-1">
                  <p className="text-zinc-400 text-sm mb-1">Mức giá</p>
                  <p className="text-white font-bold text-lg">{new Intl.NumberFormat('vi-VN').format(selectedTx.amount)} đ</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:w-1/2 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6">Thao tác Quản trị</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Sử dụng chức năng này nếu người dùng đã chuyển khoản thành công nhưng Webhook bị lỗi khiến đơn hàng vẫn bị kẹt ở trạng thái PENDING.
            </p>
            
            <div className="mt-auto">
              {selectedTx.status === 'PAID' ? (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Đơn hàng này đã được duyệt.
                </div>
              ) : (
                <button 
                  onClick={() => handleAction('MARK_PAID')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 border border-green-500 text-white py-3 rounded-xl transition-all shadow-lg shadow-green-500/20"
                >
                  {actionLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Duyệt thủ công & Cộng điểm'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-green-500 w-8 h-8" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800/50 text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Mã Đơn hàng</th>
                  <th className="px-6 py-4 font-medium">Người dùng</th>
                  <th className="px-6 py-4 font-medium">Mức giá</th>
                  <th className="px-6 py-4 font-medium">Trạng thái</th>
                  <th className="px-6 py-4 font-medium">Thời gian</th>
                  <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4 font-bold text-white">
                      #{tx.order_code}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{tx.user_name}</p>
                      <p className="text-xs text-zinc-500">{tx.user_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {new Intl.NumberFormat('vi-VN').format(tx.amount)} VNĐ
                    </td>
                    <td className="px-6 py-4">
                      {tx.status === 'PAID' ? (
                        <span className="text-green-400 font-medium">PAID</span>
                      ) : (
                        <span className="text-yellow-400 font-medium">PENDING</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{new Date(tx.created_at).toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedTx(tx);
                          setSuccessMsg('');
                          setError('');
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 ml-auto text-xs"
                      >
                        <Settings2 size={14} /> Kiểm tra
                      </button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                      Không có giao dịch nào.
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
