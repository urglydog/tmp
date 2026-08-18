---
description: Tập hợp các quy tắc nghiệp vụ (Business Rules) và ràng buộc logic của hệ thống Tube2Card.
tags: [architecture, domain, business-rules]
---

# Tube2Card Business Rules

Dưới đây là các ràng buộc logic phải được tuân thủ nghiêm ngặt trong quá trình code Backend và Frontend:

## 1. Nhóm Quy tắc Tương tác AI (AI Generation Rules)
- **BR-AI-01 (Timeout Constraint):** Mọi request gửi tới Groq (ASR) hoặc Gemini (LLM) phải có cấu hình Timeout là 60 giây. Nếu vượt quá, trả về mã lỗi 504 Gateway Timeout kèm thông báo thân thiện "Video quá dài, đang xử lý ngầm".
- **BR-AI-02 (JSON Enforcement):** Backend FastAPI PHẢI validate kết quả của Gemini bằng `pydantic`. Nếu chuỗi trả về không phải là JSON Array hợp lệ chứa `front` và `back`, hệ thống phải thực hiện Retry tối đa 2 lần trước khi báo lỗi cho User.
- **BR-AI-03 (Fallback ASR):** Nếu URL là Youtube, ưu tiên dùng `yt-dlp` tải phụ đề tự động (.vtt/.srt). Chỉ khi không có phụ đề mới tải Audio và dùng Groq Whisper bóc băng để tiết kiệm chi phí/thời gian.

## 2. Nhóm Quy tắc Thanh toán & Phân quyền (Billing & Quota)
- **BR-BILL-01 (Free Tier Limits):** 
  - User `plan_type = free` chỉ được tạo tối đa 3 Decks.
  - Mỗi tài liệu (Youtube, Audio) không được dài quá 15 phút. (Kiểm tra độ dài bằng `yt-dlp` trước khi download).
- **BR-BILL-02 (Pro Tier Limits):**
  - User `plan_type = pro` được tạo Deck không giới hạn.
  - Video tối đa 2 tiếng (Sẽ chia chunk gửi lên Gemini để tránh lỗi Context Limit).

## 3. Nhóm Quy tắc Học tập (Study & SRS)
- **BR-SRS-01 (New Card Defaults):** Thẻ mới tạo có `interval = 1` và `ease_factor = 2.5` (Thuật toán SM-2 chuẩn của Anki).
- **BR-SRS-02 (Review Calculations):**
  - Nếu User chọn "Hard": `interval = (interval * 1.2)`.
  - Nếu User chọn "Good": `interval = (interval * 2.5)`.
  - Nếu User chọn "Easy": `interval = (interval * ease_factor) * 1.3`.
  - Nếu User chọn "Again" (Quên): `interval = 1`, `ease_factor` giảm đi 0.2 (tối thiểu là 1.3).

## 4. Nhóm Quy tắc Xuất Dữ Liệu (Export Rules)
- **BR-EXP-01 (CSV Format):** Khi xuất CSV cho Quizlet, phải loại bỏ các ký tự dấu phẩy `,` trong nội dung Flashcard, dùng ký tự Tab `\t` làm delimiter.
- **BR-EXP-02 (Anki Format):** File `.apkg` phải được nén chuẩn ZIP chứa `collection.anki2`. Tạm thời có thể dùng thư viện `genanki` trên Python Backend để sinh file rồi trả về cho Frontend tải xuống.
