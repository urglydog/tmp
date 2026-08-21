# Master Plan: Hoàn thiện & Mở rộng Hệ thống Tube2Card

Dựa trên tài liệu phân tích hệ thống gốc (`TUBE2CARD_PROJECT_ANALYSIS.md`) và định hướng phát triển mới nhất, đây là bản thiết kế tổng thể cho các Phase tiếp theo nhằm biến Tube2Card thành một sản phẩm EdTech / Micro-SaaS hoàn chỉnh.

---

## Phase 1: Vận hành & Quản trị Sản phẩm (Product Ops)
*Đưa dự án lên môi trường thực tế và xây dựng hệ thống kiểm soát quyền lực.*

### 1.1. Triển khai Production & Tối ưu luồng Thanh toán
- **Deploy Backend**: Triển khai FastAPI lên Render/Railway (hoặc VPS) và gán chứng chỉ bảo mật HTTPS (SSL). Khắc phục triệt để các lỗi liên quan đến tường lửa công ty và Mixed Content.
- **PayOS Webhook**: Tích hợp Webhook để hệ thống tự động bắt biến động số dư và cộng điểm 24/7 ở Background, độc lập với việc User có đóng trình duyệt hay không.

### 1.2. Admin Dashboard (Trang Quản trị Viên)
- Xây dựng Router bảo mật `/admin` trên Next.js, phân quyền (RBAC) nghiêm ngặt.
- **Quản lý Users**: Thống kê số lượng, kiểm tra số dư Credits, và tính năng can thiệp Bơm/Trừ điểm thủ công.
- **Quản lý Giao dịch**: Theo dõi dòng tiền, tỷ lệ chuyển đổi (Đơn PENDING vs PAID), xuất báo cáo doanh thu.
- **Giám sát AI**: Log lịch sử tạo thẻ, thời gian xử lý AI, giúp tối ưu chi phí API (Gemini/OpenAI).

---

## Phase 2: Mở rộng Đầu vào & Đầu ra (Core Features)
*Hoàn thành các chức năng cốt lõi chưa được hiện thực hóa trong TUBE2CARD_PROJECT_ANALYSIS.*

### 2.1. Đa dạng hóa Nguồn Đầu Vào (Input Sources)
- Không chỉ giới hạn ở Youtube, mở rộng cơ chế cho phép **Upload trực tiếp** các tệp MP4, MP3, PDF, Word, hoặc dán thẳng một văn bản dài.
- Tích hợp công cụ `yt-dlp` chuyên sâu để bắt link từ Vimeo, Bilibili, Podcast.

### 2.2. Đa dạng hóa Định Dạng Đầu Ra (Outputs)
- **Mindmap (Sơ đồ tư duy)**: Sử dụng React Flow hoặc Mermaid.js để vẽ sơ đồ trực quan từ nội dung video.
- **Multiple-Choice Quiz**: AI tự động sinh bộ câu hỏi trắc nghiệm A-B-C-D và chấm điểm.
- **Summary & Study Guide**: Bản tóm tắt tóm lược ý chính cực xịn.

### 2.3. Khả năng Xuất Dữ Liệu (Export)
- Xuất file `.apkg` để import trực tiếp vào **Anki**.
- Xuất file `.csv` hỗ trợ **Quizlet**.
- Xuất PDF / Markdown cho tính năng Sơ đồ tư duy và Tóm tắt.

---

## Phase 3: Tương tác Nâng cao & Trải nghiệm Học (Interactivity & UX)
*Giữ chân người dùng bằng trải nghiệm học tập đỉnh cao ngay trên nền tảng.*

### 3.1. AI Socratic Tutor (Chat với tài liệu)
- Tích hợp tính năng Chatbot vào mỗi bộ thẻ. Người dùng không hiểu một thuật ngữ hoặc Flashcard cụ thể có thể hỏi trực tiếp AI (ví dụ: *"Giải thích định nghĩa này theo cách dễ hiểu cho học sinh lớp 5"*). AI sẽ trả lời dựa trên Context của chính Video đó.

### 3.2. Trình chỉnh sửa Flashcard (Edit & Refine)
- Giao diện cho phép người dùng tự do sửa đổi (Edit), thêm bớt Flashcard thủ công.
- Nút tác vụ nhanh: *"Yêu cầu AI tạo thêm 10 câu khó hơn"* cho cùng một chủ đề.

### 3.3. Built-in SRS Study Mode
- Thuật toán Spaced Repetition System (Lặp lại ngắt quãng) tích hợp thẳng vào Web.
- Bảng `StudyProgress` sẽ lưu lại tiến độ học: Ngày cần review thẻ tiếp theo, thuật toán tính toán thẻ nào khó sẽ hiện lại nhiều lần.

### 3.4. Progressive Web App (PWA)
- Cấu hình Next.js PWA để biến trang web thành một ứng dụng Mobile. Người dùng có thể nhấn "Thêm vào màn hình chính" (Add to Homescreen) để học Flashcard như một App thực thụ trên iOS/Android mà không cần lên App Store.
