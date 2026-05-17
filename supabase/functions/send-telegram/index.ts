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
      console.log("[send-telegram] Thông báo booking mới cho:", record.customer_name);
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
👤 <b>KHÁCH HÀNG</b>
• Họ tên: <b>${record.customer_name}</b>
• Điện thoại: <code>${record.phone}</code>
• Khu vực: ${record.city || 'N/A'}

🏠 <b>YÊU CẦU</b>
• Loại căn: ${roomType}
• Mục đích: ${purpose}
• Ngân sách: ${record.budget_type || 'N/A'}

📅 <b>LỊCH HẸN</b>
• Hình thức: <b>${record.consult_type || 'N/A'}</b>
• Thời gian: <b>${record.appointment_time || 'N/A'}</b> | <b>${formattedDate}</b>

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