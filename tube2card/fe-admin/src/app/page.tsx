'use client';

import React, { useEffect, useState } from 'react';
import { Users, CreditCard, Coins, Activity, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    totalTokens: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Lỗi lấy thống kê');
        }
        
        setStats(data.stats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-purple-500 w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tổng quan hệ thống</h1>
        <p className="text-zinc-400 mt-2">Theo dõi tình trạng hoạt động và doanh thu của Tube2Card.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Người dùng</h3>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Users size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Lượt thanh toán</h3>
            <div className="p-2 bg-green-500/10 text-green-400 rounded-lg"><CreditCard size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalTransactions}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Doanh thu</h3>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Coins size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-white">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-zinc-400 font-medium">Token Tiêu thụ</h3>
            <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg"><Activity size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-white">{new Intl.NumberFormat().format(stats.totalTokens)}</p>
        </div>
      </div>
      
      {/* Tương lai: Thêm biểu đồ Recharts vào đây */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl h-64 flex items-center justify-center">
        <p className="text-zinc-500 italic">Khu vực biểu đồ thống kê theo thời gian (Đang phát triển)</p>
      </div>
    </div>
  );
}
