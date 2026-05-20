// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const payload = await req.json();
    const record = payload.record;
    const customMessage = payload.message;

    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    let isAuthorized = false;

    if (record) {
      isAuthorized = true;
    } else if (authHeader) {
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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!token || !chatId) {
      throw new Error("Chưa cấu hình TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong Secrets");
    }

    let messageText = "";
    if (customMessage && !record) {
      messageText = customMessage;
    } else if (record) {
      const formattedDate = record.appointment_date ? record.appointment_date.split('-').reverse().join('/') : 'Chưa chọn';
      
      // Xử lý tệp đính kèm triệt để (Hỗ trợ Array, JSON String, PostgreSQL array string)
      let attachments = [];
      if (record.attachments) {
        if (Array.isArray(record.attachments)) {
          attachments = record.attachments;
        } else if (typeof record.attachments === 'string') {
          try {
            // Thử parse nếu là chuỗi JSON array
            const parsed = JSON.parse(record.attachments);
            if (Array.isArray(parsed)) {
              attachments = parsed;
            }
          } catch {
            // Nếu không phải JSON, parse theo định dạng mảng của PostgreSQL: {url1,url2}
            attachments = record.attachments
              .replace(/[{}"']/g, '') // Xóa các ký tự đặc biệt bao gồm ngoặc nhọn, ngoặc kép, ngoặc đơn
              .split(',')
              .map(url => url.trim())
              .filter(Boolean);
          }
        }
      }

      const fileLinksText = attachments.length > 0
        ? attachments.map((url, i) => `• <a href="${url}"><b>Tài liệu đính kèm ${i + 1}</b></a>`).join('\n')
        : '<i>Không có tài liệu đính kèm</i>';

      const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      
      // Tách thông tin Loại căn hộ & Mục đích sử dụng
      let roomType = record.room_type || 'N/A';
      let purpose = 'N/A';
      if (roomType.includes(' | Mục đích: ')) {
        const parts = roomType.split(' | Mục đích: ');
        roomType = parts[0];
        purpose = parts[1];
      }

      // Tách thông tin Giai đoạn & Tiến độ dự kiến (Câu hỏi bổ sung mới)
      let stage = record.stage || 'N/A';
      let timeline = 'N/A';
      if (stage.includes(' | Dự kiến: ')) {
        const parts = stage.split(' | Dự kiến: ');
        stage = parts[0];
        timeline = parts[1];
      }

      // Format lại hiển thị tin nhắn - Đồng bộ IN ĐẬM toàn bộ nội dung sau dấu hai chấm (:)
      messageText = `
<b>✨ THÔNG BÁO LỊCH HẸN MỚI (SCONCEPT) ✨</b>
━━━━━━━━━━━━━━━━━━
👤 <b>KHÁCH HÀNG</b>
• Họ tên: <b>${record.customer_name}</b>
• Điện thoại: <code>${record.phone}</code>
• Khu vực: <b>${record.city || 'N/A'}</b>

🏠 <b>YÊU CẦU</b>
• Loại căn: <b>${roomType}</b>
• Mục đích: <b>${purpose}</b>
• Ngân sách: <b>${record.budget_type || 'N/A'}</b>
• Giai đoạn: <b>${stage}</b>
• Tiến độ dự kiến: <b>${timeline}</b>

📅 <b>LỊCH HẸN</b>
• Hình thức: <b>${record.consult_type || 'N/A'}</b>
• Thời gian: <b>${record.appointment_time || 'N/A'} | ${formattedDate}</b>

📝 <b>GHI CHÚ:</b>
<i>${record.note || 'Không có ghi chú thêm'}</i>

📂 <b>TÀI LIỆU:</b>
${fileLinksText}
━━━━━━━━━━━━━━━━━━
🕒 <i>${now}</i>
      `;
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML'
      }),
    });

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})