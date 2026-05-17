-- 1. Xóa chính sách cũ quá lỏng lẻo
DROP POLICY IF EXISTS "Admins can manage settings" ON system_settings;

-- 2. Tạo chính sách mới: Chỉ Admin có UUID cụ thể mới được xem và sửa
-- Thay thế UUID bên dưới bằng UUID Admin của bạn
CREATE POLICY "Admins can manage settings" ON system_settings
FOR ALL 
TO authenticated
USING (auth.uid() = '57c798aa-7072-4642-b1b8-9514acb3d798')
WITH CHECK (auth.uid() = '57c798aa-7072-4642-b1b8-9514acb3d798');

-- 3. Cho phép mọi người (kể cả khách chưa đăng nhập) được XEM cấu hình 
-- để ứng dụng có thể hiển thị giá tiền/thông tin trên form
CREATE POLICY "Public can read settings" ON system_settings
FOR SELECT
TO anon, authenticated
USING (true);