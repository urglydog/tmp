'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Search, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/transactions');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch transactions');
        }
        
        setTransactions(data.transactions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  const filteredTxs = transactions.filter(t => 
    t.user_email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.order_code.toString().includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs font-medium"><CheckCircle2 size={12}/> Thành công</span>;
      case 'PENDING':
        return <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-lg text-xs font-medium"><Clock size={12}/> Đang chờ</span>;
      case 'CANCELLED':
        return <span className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium"><XCircle size={12}/> Đã hủy</span>;
      default:
        return <span className="flex items-center gap-1 px-2 py-1 bg-zinc-500/10 text-zinc-400 rounded-lg text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Lịch sử giao dịch</h1>
          <p className="text-zinc-400 mt-2">Theo dõi trạng thái thanh toán từ PayOS.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Tìm mã GD, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-sm w-64"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
          {error}
          {error.includes('SUPABASE_SERVICE_ROLE_KEY') && (
            <p className="mt-2 text-sm">Vui lòng thêm <code>SUPABASE_SERVICE_ROLE_KEY</code> vào file <code>.env.local</code> của thư mục fe-web để có quyền đọc danh sách user từ Supabase Auth.</p>
          )}
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
                  <th className="px-6 py-4 font-medium">Mã Đơn (Order Code)</th>
                  <th className="px-6 py-4 font-medium">Người dùng</th>
                  <th className="px-6 py-4 font-medium">Thời gian</th>
                  <th className="px-6 py-4 font-medium">Số tiền</th>
                  <th className="px-6 py-4 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredTxs.length > 0 ? (
                  filteredTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{tx.order_code}</td>
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{tx.user_name}</p>
                        <p className="text-xs text-zinc-500">{tx.user_email}</p>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{new Date(tx.created_at).toLocaleString('vi-VN')}</td>
                      <td className="px-6 py-4 font-medium text-white">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(tx.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                      Không tìm thấy giao dịch nào.
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
