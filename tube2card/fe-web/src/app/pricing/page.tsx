'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Zap, Crown, CheckCircle2, ArrowLeft, Gem } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  const [isVerifying, setIsVerifying] = useState(false);
  const orderCode = searchParams.get('orderCode');
  const [userCredits, setUserCredits] = useState<number | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (status === 'success' && orderCode && !isVerifying) {
      verifyPayment();
    }
  }, [status, orderCode]);

  const verifyPayment = async () => {
    setIsVerifying(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/verify-payment/${orderCode}`);
      // Lấy lại điểm mới
      if (user) fetchUser();
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/?error=Vui lòng đăng nhập trước khi nạp thẻ');
    } else {
      setUser(session.user);
      // Lấy credits của user
      const { data: creditsData } = await supabase.from('user_credits').select('credits').eq('user_id', session.user.id).single();
      if (creditsData) {
        setUserCredits(creditsData.credits);
      }
    }
  };

  const handleCheckout = async (planType: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/create-payment-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          plan_type: planType
        }),
      });
      
      const data = await response.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl; // Chuyển hướng sang PayOS
      } else {
        alert('Lỗi tạo link thanh toán: ' + data.detail);
        setLoading(false);
      }
    } catch (error) {
      alert('Không thể kết nối đến máy chủ thanh toán');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8 md:p-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto z-10 relative">
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl mb-8 transition-colors border border-zinc-700/50">
          <ArrowLeft className="w-5 h-5" /> Thoát về Trang chủ
        </Link>
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {userCredits !== null && userCredits > 5 ? 'Nạp thêm Credits' : 'Nâng cấp Trải nghiệm Học tập'}
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-4">
            Mua thêm điểm (Credits) để phân tích các video dài hàng giờ đồng hồ và tạo không giới hạn thẻ ghi nhớ với sức mạnh của AI.
          </p>
          {userCredits !== null && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-full text-zinc-300 font-medium">
              <Gem className="w-5 h-5 text-purple-400" /> Bạn đang có: <strong className="text-white">{userCredits} Credits</strong>
            </div>
          )}
        </div>

        {status === 'success' && (
          <div className="mb-8 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 text-center font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Thanh toán thành công! Điểm đã được cộng vào tài khoản của bạn.
          </div>
        )}
        {status === 'cancel' && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center font-medium">
            Bạn đã hủy thanh toán.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Pro Plan */}
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 flex flex-col hover:border-purple-500/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Gói Tiêu Chuẩn</h3>
            </div>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">49.000đ</span>
            </div>
            
            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl flex items-center justify-center gap-2 mb-8">
              <Gem className="w-5 h-5 text-purple-400" />
              <span className="font-bold text-purple-300">Nhận ngay 100 Credits</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                Tương đương 100 lần tạo Flashcard/Sơ đồ
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                Không giới hạn độ dài video Youtube
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                Chat với tài liệu (AI Tutor)
              </li>
            </ul>

            <button 
              onClick={() => handleCheckout('pro')}
              disabled={loading}
              className="w-full py-4 bg-zinc-800 hover:bg-purple-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (userCredits && userCredits > 5 ? 'Mua thêm' : 'Mua ngay')}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-8 flex flex-col relative shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)] hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)] transition-shadow">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full">
              Khuyên dùng
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Gói Cao Cấp</h3>
            </div>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">99.000đ</span>
              <span className="text-zinc-500 line-through ml-3 text-lg">147.000đ</span>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center justify-center gap-2 mb-8">
              <Gem className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-blue-300">Nhận ngay 300 Credits</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                Tương đương 300 lần tạo Flashcard/Sơ đồ
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                Tiết kiệm 33% so với Gói Tiêu Chuẩn
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                Hỗ trợ kỹ thuật ưu tiên 24/7
              </li>
            </ul>

            <button 
              onClick={() => handleCheckout('premium')}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (userCredits && userCredits > 5 ? 'Mua thêm' : 'Mua ngay')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
