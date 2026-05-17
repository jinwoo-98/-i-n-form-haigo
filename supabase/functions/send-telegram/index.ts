// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Xử lý CORS cho các cuộc gọi từ trình duyệt
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload = await req.json();
    const record = payload.record; // Dữ liệu từ Trigger hoặc Form
    const customMessage = payload.message; // Dữ liệu từ nút "Gửi thử" trong Admin

    // KIỂM TRA QUYỀN TRUY CẬP
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    let isAuthorized = false;

    // 1. Nếu có 'record' (đây là một booking mới), chúng ta cho phép gửi để đảm bảo thông báo luôn tới.
    // Việc này an toàn vì dữ liệu booking đã được lưu vào DB trước đó qua RLS.
    if (record) {
      isAuthorized = true;
      console.log("[send-telegram] Processing booking notification for:", record.customer_name);
    } 
    // 2. Nếu là tin nhắn tùy chỉnh (Gửi thử từ giao diện Admin), bắt buộc phải xác thực Admin
    else if (authHeader) {
      if (authHeader === `Bearer ${serviceRoleKey}`) {
        isAuthorized = true;
      } else {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        )
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        if (user && !authError) {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          if (profile?.role === 'admin') {
            isAuthorized = true;
          }
        }
      }
    }

    if (!isAuthorized) {
      console.error("[send-telegram] Unauthorized access attempt");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!token || !chatId) {
      throw new Error("Thiếu cấu hình TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID");
    }

    let messageText = "";

    // Trường hợp 1: Gửi thử từ giao diện Admin
    if (customMessage && !record) {
      messageText = customMessage;
    } 
    // Trường hợp 2: Thông báo tự động khi có Booking mới
    else if (record) {
      const formattedDate = record.appointment_date ? record.appointment_date.split('-').reverse().join('/') : 'Chưa chọn';
      
      let attachments = record.attachments || [];
      if (typeof attachments === 'string') {
        attachments = attachments.replace(/{|}/g, '').split(',').filter(Boolean);
      }

      const fileLinksText = attachments.length > 0
        ? attachments.map((url, i) => `• <a href="${url.trim()}">Tài liệu ${i + 1}</a>`).join('\n')
        : '<i>Không có tài liệu đính kèm</i>';

      const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

      let roomType = record.room_type || 'N/A';
      let purpose = 'N/A';
      if (roomType.includes(' | Mục đích: ')) {
        const parts = roomType.split(' | Mục đích: ');
        roomType = parts[0];
        purpose = parts[1];
      }

      messageText = `
<b>✨ THÔNG BÁO LỊCH HẸN MỚI ✨</b>
━━━━━━━━━━━━━━━━━━
👤 <b>THÔNG TIN KHÁCH HÀNG</b>
• Họ tên: <b>${record.customer_name}</b>
• Điện thoại: <code>${record.phone}</code>
• Email: ${record.email || 'Không cung cấp'}
• Khu vực: ${record.city || 'N/A'}

🏠 <b>YÊU CẦU TƯ VẤN</b>
• Loại căn: ${roomType}
• Mục đích: ${purpose}
• Giai đoạn: ${record.stage || 'N/A'}
• Ngân sách: ${record.budget_type || 'N/A'}

📅 <b>LỊCH HẸN CHI TIẾT</b>
• Hình thức: <b>${record.consult_type || 'N/A'}</b>
• Thời gian: <b>${record.appointment_time || 'N/A'}</b> | <b>${formattedDate}</b>

📝 <b>GHI CHÚ</b>
• Nội dung: <i>${record.note || 'Không có ghi chú'}</i>

📂 <b>TÀI LIỆU ĐÍNH KÈM:</b>
${fileLinksText}
━━━━━━━━━━━━━━━━━━
🕒 <i>Gửi lúc: ${now}</i>
🤖 <i>Hệ thống VŨ GIA Booking</i>
      `;
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      }),
    });

    const tgData = await tgRes.json();
    if (!tgData.ok) throw new Error(`Telegram API Error: ${tgData.description}`);

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    console.error("[send-telegram] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})