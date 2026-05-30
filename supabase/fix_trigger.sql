-- 1. DROP TRIGGER NẾU ĐÃ TỒN TẠI
DROP TRIGGER IF EXISTS on_booking_created ON bookings;
DROP FUNCTION IF EXISTS notify_telegram_on_booking();

-- 2. TẠO FUNCTION ĐỂ GỌI EDGE FUNCTION
CREATE OR REPLACE FUNCTION notify_telegram_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  payload_json TEXT;
BEGIN
  -- Tạo payload JSON chứa record vừa tạo
  payload_json := json_build_object('record', row_to_json(NEW))::text;

  -- Gọi Edge Function 'send-telegram' của dự án Supabase mới uuknpozfarylduduxogh
  PERFORM supabase_functions.http_request(
    'https://uuknpozfarylduduxogh.supabase.co/functions/v1/send-telegram',
    'POST',
    '{"Content-Type":"application/json", "Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}'::text,
    payload_json,
    1000 -- Timeout 1 giây
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Bỏ qua lỗi gọi HTTP để không làm gián đoạn tiến trình lưu DB của khách hàng
  RAISE WARNING 'Lỗi khi gọi HTTP request gửi Telegram: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TẠO TRIGGER SAU KHI INSERT TRÊN BẢNG BOOKINGS
CREATE TRIGGER on_booking_created
AFTER INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION notify_telegram_on_booking();