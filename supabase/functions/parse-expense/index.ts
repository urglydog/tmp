import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Cấu hình CORS để App Flutter có thể gọi API này
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Xác thực (Verify Auth) từ Token người dùng gửi lên
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // 3. Lấy dữ liệu Text người dùng nói/gõ
    const { input_text } = await req.json()
    if (!input_text) {
      return new Response(JSON.stringify({ error: 'Missing input_text' }), { status: 400, headers: corsHeaders })
    }

    // 4. Lấy ngữ cảnh của người dùng (Danh sách ví & danh mục)
    const [walletsRes, categoriesRes] = await Promise.all([
      supabase.from('wallets').select('name').eq('user_id', user.id).eq('is_deleted', false),
      supabase.from('categories').select('name').eq('user_id', user.id).eq('is_deleted', false)
    ])

    const userWallets = walletsRes.data?.map(w => w.name).join(', ') || 'Chưa có ví'
    const userCategories = categoriesRes.data?.map(c => c.name).join(', ') || 'Ăn uống, Di chuyển, Khác'

    // 5. Kết nối Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Server missing GEMINI_API_KEY')
    }

    const prompt = `Bạn là một trợ lý tài chính. Phân tích câu sau và trích xuất TẤT CẢ các khoản chi/thu.
Danh sách ví của người dùng: ${userWallets}
Danh sách danh mục: ${userCategories}

Câu nói: "${input_text}"

Trả về JSON array, mỗi phần tử có cấu trúc:
{
  "amount": number (VND, không có đơn vị),
  "category_name": string (chọn từ danh sách hoặc "Khác"),
  "wallet_name": string (chọn từ danh sách hoặc null),
  "note": string (mô tả ngắn giao dịch),
  "type": "Expense" | "Income"
}
Quy tắc:
- "k" = 1000, "triệu" = 1000000.
- Nếu không rõ ví -> wallet_name = null.
- Nếu không rõ danh mục -> category_name = "Khác".
- Nếu không rõ thu/chi -> mặc định "Expense".`

    // Gửi yêu cầu với Structured Output (Ép kiểu JSON)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                amount: { type: "NUMBER" },
                category_name: { type: "STRING" },
                wallet_name: { type: "STRING", nullable: true },
                note: { type: "STRING" },
                type: { type: "STRING", enum: ["Expense", "Income"] }
              },
              required: ["amount", "category_name", "note", "type"]
            }
          }
        }
      })
    })

    const geminiData = await response.json()
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('Gemini failed to generate content')
    }
    
    const parsedText = geminiData.candidates[0].content.parts[0].text
    const parsedJson = JSON.parse(parsedText)

    // 6. Trả về kết quả cho App Flutter
    return new Response(JSON.stringify(parsedJson), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
