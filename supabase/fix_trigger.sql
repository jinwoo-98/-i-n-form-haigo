-- 1. Xóa trigger cũ chứa secret bị lộ
DROP TRIGGER IF EXISTS notify_telegram_on_booking ON public.bookings;

-- 2. Tạo lại trigger với cơ chế xác thực an toàn
-- Lưu ý: Bạn cần thay thế 'YOUR_SERVICE_ROLE_KEY' bằng Service Role Key thực tế của dự án 
-- (Lấy trong Project Settings -> API -> service_role secret)
-- Hoặc tốt nhất là sử dụng Supabase Vault để lưu trữ key này.

CREATE TRIGGER notify_telegram_on_booking
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION supabase_functions.http_request(
  'https://zcfgfrlbomtghxsakzvi.supabase.co/functions/v1/send-telegram',
  'POST',
  '{"Content-Type":"application/json", "Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}',
  '{}',
  '5000'
);

-- Ghi chú bảo mật: Sau khi chạy lệnh này, secret sẽ không còn nằm trong code frontend 
-- và Edge Function sẽ chỉ chấp nhận cuộc gọi từ chính Database của bạn.