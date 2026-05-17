import { supabase } from "@/integrations/supabase/client";

/**
 * Hàm gửi tin nhắn đến Telegram thông qua Supabase Edge Function.
 * Sử dụng Supabase Auth để xác thực, không còn mã bí mật cứng ở Frontend.
 */
export const sendTelegramMessage = async (message: string) => {
  try {
    // Gọi Edge Function 'send-telegram'
    // Supabase client sẽ tự động đính kèm JWT của người dùng đang đăng nhập vào header Authorization
    const { data, error } = await supabase.functions.invoke('send-telegram', {
      body: { message }
    });

    if (error) {
      console.error("Lỗi khi gọi Edge Function:", error);
      return false;
    }

    return data?.success || false;
  } catch (err) {
    console.error("Lỗi hệ thống khi gửi Telegram:", err);
    return false;
  }
};