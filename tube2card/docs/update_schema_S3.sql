-- Thêm các cột lưu trữ thông tin nguồn và S3 vào bảng decks
ALTER TABLE public.decks
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('youtube', 'vimeo', 'pdf', 'audio', 'text', 'image')),
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS transcript TEXT;

-- Bỏ qua document_id vì ta sẽ lưu trực tiếp vào decks
-- ALTER TABLE public.decks DROP COLUMN IF EXISTS document_id;
