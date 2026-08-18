-- ==========================================
-- TUBE2CARD SUPABASE SCHEMA
-- Chạy script này trong Supabase SQL Editor
-- ==========================================

-- Bật extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Bảng Documents (Lưu trữ thông tin nguồn tài liệu)
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    source_type TEXT CHECK (source_type IN ('youtube', 'vimeo', 'pdf', 'audio', 'text')) NOT NULL,
    transcript TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng Decks (Bộ học liệu / Tập hợp Flashcards)
CREATE TABLE public.decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    mindmap_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bảng Cards (Thẻ học Flashcard / Câu hỏi Quiz)
CREATE TABLE public.cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('flashcard', 'quiz')) DEFAULT 'flashcard',
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    options JSONB, -- Chứa mảng các lựa chọn nếu là Quiz (vd: ["A", "B", "C", "D"])
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bảng Study Progress (Lưu tiến độ học thuật toán SRS)
CREATE TABLE public.study_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE,
    interval INTEGER DEFAULT 0,
    ease_factor REAL DEFAULT 2.5,
    next_review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, card_id) -- Mỗi user chỉ có 1 tiến độ cho 1 thẻ
);

-- ==========================================
-- THIẾT LẬP ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;

-- Policy cho Documents: Chỉ user sở hữu mới được xem/sửa
CREATE POLICY "Users can manage their own documents" ON public.documents
    FOR ALL USING (auth.uid() = user_id);

-- Policy cho Decks: Chỉ user sở hữu mới được xem/sửa
CREATE POLICY "Users can manage their own decks" ON public.decks
    FOR ALL USING (auth.uid() = user_id);

-- Policy cho Cards: User được quyền xem/sửa card nếu họ sở hữu deck chứa card đó
CREATE POLICY "Users can manage cards in their decks" ON public.cards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.decks 
            WHERE decks.id = cards.deck_id 
            AND decks.user_id = auth.uid()
        )
    );

-- Policy cho Study Progress: Chỉ user sở hữu mới được xem/sửa
CREATE POLICY "Users can manage their own study progress" ON public.study_progress
    FOR ALL USING (auth.uid() = user_id);

-- Gửi tín hiệu báo thành công
SELECT 'Schema Tube2Card đã được khởi tạo thành công!' as status;
