-- File: 20260817000001_functions_and_triggers.sql
-- Mục đích: Tự động khởi tạo dữ liệu cho User khi vừa đăng ký thành công qua Supabase Auth.

-- 1. Hàm xử lý logic (Function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Tạo Profile mặc định
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  
  -- Seed (Sinh sẵn) các danh mục Thu/Chi mặc định cho User này
  INSERT INTO public.categories (user_id, name, type, icon, is_system)
  VALUES
    (NEW.id, 'Ăn uống', 'Expense', '🍔', true),
    (NEW.id, 'Di chuyển', 'Expense', '🚗', true),
    (NEW.id, 'Mua sắm', 'Expense', '🛒', true),
    (NEW.id, 'Hóa đơn', 'Expense', '📄', true),
    (NEW.id, 'Giải trí', 'Expense', '🎮', true),
    (NEW.id, 'Sức khỏe', 'Expense', '💊', true),
    (NEW.id, 'Khác', 'Expense', '📦', true),
    (NEW.id, 'Lương', 'Income', '💰', true),
    (NEW.id, 'Thu nhập khác', 'Income', '💵', true);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Khai báo Trigger lắng nghe sự kiện
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
