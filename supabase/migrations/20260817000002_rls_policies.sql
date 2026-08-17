-- File: 20260817000002_rls_policies.sql
-- Mục đích: Bật Row Level Security (RLS) để cô lập dữ liệu. Đảm bảo người dùng nào chỉ được phép đọc/ghi dữ liệu của chính người dùng đó.

-- A. BẬT TÍNH NĂNG RLS CHO TOÀN BỘ CÁC BẢNG
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_templates ENABLE ROW LEVEL SECURITY;

-- B. KHAI BÁO CÁC QUY TẮC (POLICIES)

-- 1. Bảng profiles (Liên kết qua trường id)
CREATE POLICY "profiles_user_isolation" ON public.profiles
  FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- 2. Bảng wallets (Liên kết qua trường user_id)
CREATE POLICY "wallets_user_isolation" ON public.wallets
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 3. Bảng categories (Liên kết qua trường user_id)
CREATE POLICY "categories_user_isolation" ON public.categories
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4. Bảng transactions (Liên kết qua trường user_id)
CREATE POLICY "transactions_user_isolation" ON public.transactions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 5. Bảng budgets (Liên kết qua trường user_id)
CREATE POLICY "budgets_user_isolation" ON public.budgets
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 6. Bảng recurring_transactions (Liên kết qua trường user_id)
CREATE POLICY "recurring_transactions_user_isolation" ON public.recurring_transactions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 7. Bảng quick_templates (Liên kết qua trường user_id)
CREATE POLICY "quick_templates_user_isolation" ON public.quick_templates
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
