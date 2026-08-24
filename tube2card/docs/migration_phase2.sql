-- Phase 2: Khởi tạo bảng Token Usages và cập nhật Documents

-- 1. Thêm cột 'status' vào bảng documents (nếu chưa có)
-- Chấp nhận các trạng thái: PENDING, TRANSCRIBED, FAILED
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'PENDING';

-- 2. Tạo bảng token_usages để theo dõi lượng token thực tế tiêu thụ
CREATE TABLE IF NOT EXISTS public.token_usages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
    model_name text NOT NULL,
    input_tokens integer NOT NULL DEFAULT 0,
    output_tokens integer NOT NULL DEFAULT 0,
    task_type text NOT NULL, -- 'transcript', 'flashcard', 'mindmap', 'quiz'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Kích hoạt RLS cho bảng token_usages
ALTER TABLE public.token_usages ENABLE ROW LEVEL SECURITY;

-- Policy: User chỉ được xem lịch sử token của chính mình
CREATE POLICY "Users can view their own token usages"
ON public.token_usages FOR SELECT
USING (auth.uid() = user_id);

-- (Backend sử dụng Service Role Key để Insert dữ liệu)
