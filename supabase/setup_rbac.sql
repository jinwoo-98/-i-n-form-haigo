-- 1. Tạo bảng profiles để quản lý vai trò người dùng
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bật Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Chính sách cho bảng profiles
CREATE POLICY "Profiles are viewable by owners" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Cập nhật chính sách cho bảng system_settings (Sử dụng Role thay vì UUID cứng)
DROP POLICY IF EXISTS "Admins can manage settings" ON public.system_settings;
CREATE POLICY "Admins can manage settings" ON public.system_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Cập nhật chính sách cho bảng bookings (Sử dụng Role thay vì UUID cứng)
DROP POLICY IF EXISTS "Admins can read bookings" ON public.bookings;
CREATE POLICY "Admins can read bookings" ON public.bookings
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Tự động tạo profile khi có người dùng mới đăng ký (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'user'); -- Mặc định là user, bạn cần set thủ công 1 user thành admin trong DB
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ghi chú: Sau khi chạy script này, hãy chạy lệnh sau để cấp quyền Admin cho tài khoản của bạn:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'ID_CUA_BAN';