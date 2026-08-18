-- 0. Drop toàn bộ các bảng cũ (Cẩn thận: Xóa toàn bộ dữ liệu hiện có)
DROP TABLE IF EXISTS public.cards CASCADE;
DROP TABLE IF EXISTS public.decks CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;

-- Các bảng của dự án cũ (smart-spender) nếu có
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.quick_templates CASCADE;
DROP TABLE IF EXISTS public.recurring_transactions CASCADE;
DROP TABLE IF EXISTS public.study_progress CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;

-- 1. Bảng Documents (Lưu trữ thông tin gốc của video/tài liệu)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    source_type TEXT NOT NULL,
    transcript TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng Decks (Lưu trữ thông tin Bộ thẻ)
CREATE TABLE IF NOT EXISTS public.decks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng Cards (Lưu trữ từng thẻ Flashcard)
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'flashcard',
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KÍCH HOẠT BẢO MẬT RLS (Row Level Security)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- POLICY CHO DOCUMENTS
CREATE POLICY "Users can manage their own documents" 
ON public.documents FOR ALL USING (auth.uid() = user_id);

-- POLICY CHO DECKS
CREATE POLICY "Users can manage their own decks" 
ON public.decks FOR ALL USING (auth.uid() = user_id);

-- POLICY CHO CARDS (Thông qua deck_id)
CREATE POLICY "Users can manage cards in their decks" 
ON public.cards FOR ALL USING (
    deck_id IN (SELECT id FROM public.decks WHERE user_id = auth.uid())
);
