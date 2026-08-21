-- 1. Tạo bảng user_credits để lưu số lượng lượt tạo của từng người dùng
-- Tham chiếu trực tiếp đến bảng auth.users của Supabase
CREATE TABLE IF NOT EXISTS public.user_credits (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    credits integer DEFAULT 5,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Kích hoạt bảo mật (RLS) cho bảng user_credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Người dùng chỉ được xem số credits của chính mình
CREATE POLICY "Users can view their own credits" 
ON public.user_credits FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Tạo bảng transactions để lưu đơn hàng PayOS
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_code bigint NOT NULL UNIQUE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    amount integer NOT NULL,
    status text NOT NULL DEFAULT 'PENDING',
    credits_added integer NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Kích hoạt bảo mật (RLS) cho bảng transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Chỉ người dùng tự xem giao dịch của mình
CREATE POLICY "Users can view their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);

-- (Backend sử dụng Service Role Key sẽ có toàn quyền Insert/Update mà không bị chặn bởi RLS)
