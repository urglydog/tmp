---
name: ss-ai-parsing
description: "Pipeline Voice/Text → STT → Edge Function → Gemini Parse → Confirmation UI → Save. Dùng cho UC-11, UC-12, debug AI parse, hoặc sửa prompt."
---

# Smart Spender — AI Parsing Pipeline

> **Khi nào dùng:** Làm việc với luồng nhập liệu AI (voice/text), viết/sửa Edge Function, thiết kế prompt Gemini, hoặc debug kết quả parse.

---

## Pipeline Flow

```
[1] User Input
    ├── Voice/Text (Đơn lẻ): "Cà phê 35k"
    └── Batch Input (Gộp): "Sáng ăn phở 40k, chiều đổ xăng 50k, tối xem phim 100k"
    └── → speech_to_text (nếu voice) → raw text
         │
[2] raw text → Supabase Edge Function (parse-expense)
         │
[3] Edge Function:
    ├── Validate JWT (BR-RLS-02)
    ├── Fetch user's wallets + categories (for context)
    ├── Build Gemini prompt with user context
    └── Call Gemini 1.5 Flash API
         │
[4] Gemini Response (Structured JSON)
    └── [{amount, category_name, wallet_name, note, type}]
         │
[5] Post-processing (Edge Function):
    ├── Fuzzy match wallet_name → user's wallet_id (BR-AI-07)
    ├── Fuzzy match category_name → user's category_id (BR-AI-07)
    ├── Fallback wallet if no match (BR-AI-03)
    └── Fallback category if no match (BR-AI-04)
         │
[6] Return parsed array to Flutter client
         │
[7] Confirmation UI (BR-AI-05, BR-BAT-02):
    ├── Show danh sách các parsed transactions (1 hoặc N items)
    ├── Editable: amount, wallet dropdown, category dropdown, note cho từng dòng
    ├── Nút Xóa: Bỏ item khỏi danh sách nếu AI nhận diện sai (BR-BAT-03)
    └── User confirm "Lưu Tất Cả" → POST bulk save
         │
[8] Bulk Save transactions + Update balances (BR-TXN-02, BR-WAL-04)
    └── Check budget thresholds cho tất cả ví/danh mục bị ảnh hưởng (BR-BUD-02,03)
```

## Gemini System Prompt Template

```
Bạn là một trợ lý tài chính. Phân tích câu sau và trích xuất TẤT CẢ các khoản chi/thu (hỗ trợ nhập 1 hoặc nhiều giao dịch cùng lúc).

Danh sách ví của người dùng: {{user_wallets}}
Danh sách danh mục: {{user_categories}}

Trả về JSON array, mỗi phần tử có cấu trúc:
{
  "amount": number (VND, không có đơn vị),
  "category_name": string (khớp với danh mục có sẵn hoặc "Khác"),
  "wallet_name": string (khớp với ví có sẵn hoặc null),
  "note": string (mô tả ngắn giao dịch),
  "type": "Expense" | "Income"
}

Quy tắc:
- "k" = 1000, "triệu" = 1000000, "tr" = 1000000
- Nếu không rõ ví → wallet_name = null
- Nếu không rõ danh mục → category_name = "Khác"
- Nếu không rõ thu/chi → mặc định "Expense"
- Trả về JSON array, không kèm text thêm
```

## Gemini API Config

```typescript
// Edge Function config
const model = "gemini-1.5-flash";
const generationConfig = {
  responseMimeType: "application/json",
  responseSchema: {
    type: "array",
    items: {
      type: "object",
      properties: {
        amount: { type: "number" },
        category_name: { type: "string" },
        wallet_name: { type: "string", nullable: true },
        note: { type: "string" },
        type: { type: "string", enum: ["Expense", "Income"] }
      },
      required: ["amount", "category_name", "note", "type"]
    }
  }
};
```

## Fuzzy Matching Logic

```
Input: "mb" → Target wallets: ["MBBank", "MoMo", "Cash"]
Steps:
1. Exact match (case-insensitive): "mb" vs "mbbank" → NO
2. Contains match: "mbbank".contains("mb") → YES → return "MBBank"
3. If multiple matches → pick shortest name
4. If no match → return null (fallback to default wallet)
```

## Error Handling

| Lỗi | Xử lý | BR |
|-----|--------|-----|
| Gemini timeout (>10s) | Retry 1 lần | BR-AI-06 |
| Gemini retry fail | Return error, UI hiện fallback form nhập thủ công | BR-AI-06 |
| JSON parse error | Return error, fallback nhập thủ công | - |
| Empty result (AI trả []) | Thông báo "Không nhận diện được giao dịch", fallback | - |
| JWT invalid | 401 Unauthorized | BR-RLS-02 |

## Speech-to-Text (On-Device)

```dart
// Flutter speech_to_text package
// Chạy local, không gửi audio lên server
// Hỗ trợ: vi-VN (Tiếng Việt), en-US (English)
// Kết quả → String → gửi lên Edge Function
```
