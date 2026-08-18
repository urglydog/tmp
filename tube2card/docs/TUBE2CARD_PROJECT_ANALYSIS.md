# Tube2Card — Project Analysis for Skills System (Version 2.0)

## Project Metadata
- **Name:** Tube2Card (hoặc StudyHack AI)
- **Purpose:** Một Micro-SaaS biến mọi nguồn tài liệu (Video, Audio, PDF) thành một trung tâm học tập tương tác toàn diện. Tự động trích xuất kiến thức thành Flashcard, Mindmap, Quiz và cho phép người dùng học, chỉnh sửa, hoặc tương tác (Chat) với tài liệu bằng AI.
- **Domain:** EdTech / Micro-SaaS
- **Repository Path:** `tmp/tube2card/` (Monorepo)

## Repository Structure
```text
tmp/tube2card/
├── be-api/          # FastAPI Backend (AI Worker xử lý tác vụ nặng)
├── fe-web/          # Next.js Frontend (Web Dashboard)
├── docs/            # System specs & Documentation
└── skills/          # Claude/Gemini Skills System
```

## Technology Stack

### Backend (AI Worker)
- **Language & Framework:** Python 3.12 + FastAPI
- **Key Libraries:** `uvicorn`, `httpx`, `yt-dlp` (hỗ trợ hàng ngàn nền tảng video/audio).
- **AI Integration:** Google Gemini 1.5 Pro / Groq Whisper.

### Frontend (Web & Mobile-Ready)
- **Framework:** Next.js 14+ (App Router). Cấu hình PWA (Progressive Web App) để người dùng có thể "Cài đặt" web thành App trên điện thoại Android/iOS mà không cần qua App Store.
- **Styling:** TailwindCSS + Framer Motion (hiệu ứng 3D lật thẻ).

### Database & Auth
- **BaaS:** Supabase (PostgreSQL, Auth, Storage).

### Infrastructure
- **Deployment:** 
  - **Giai đoạn 1 (MVP):** Vercel (Frontend) + Render/Railway (Backend) để tiết kiệm thời gian setup.
  - **Giai đoạn 2 (Scale):** Chuyển toàn bộ Backend và DB lên **VPS (như DigitalOcean, Hetzner, AWS EC2)** chạy bằng Docker Compose. Vì các tác vụ xử lý Video/Audio (`yt-dlp`, FFmpeg) ngốn rất nhiều CPU/RAM, chạy trên VPS sẽ tối ưu chi phí hơn rất nhiều so với Serverless.

## Project Scope & Feature Set (Expanded)

### Nguồn Đầu Vào (Input Sources)
1. **Video/Audio Streaming Links:** Không chỉ Youtube, hỗ trợ Vimeo, Bilibili, Tiktok, Podcast, Google Drive (nhờ sức mạnh của `yt-dlp`).
2. **Direct Upload:** Tải lên trực tiếp file MP4, MP3, PDF, Word, hoặc dán thẳng một đoạn Text/Bài báo dài.

### Định Dạng Đầu Ra (Outputs)
1. **Flashcard (Hỏi - Đáp):** Cơ chế thẻ học thuộc lòng.
2. **Mindmap (Sơ đồ tư duy):** Hiển thị trực quan dạng Cây (dùng thư viện React Flow hoặc Mermaid.js).
3. **Multiple-Choice Quiz:** Bộ câu hỏi trắc nghiệm A-B-C-D chấm điểm tự động.
4. **Summary & Study Guide:** Bản tóm tắt tóm lược ý chính cực xịn.

### Khả Năng Xuất Dữ Liệu (Export Capabilities)
1. Xuất file `.apkg` chuẩn để import thẳng vào ứng dụng **Anki**.
2. Xuất file `.csv` để import vào **Quizlet**.
3. Xuất file **Notion** (Markdown) hoặc **PDF** cho Sơ đồ tư duy.

### Tính Năng Tương Tác Nâng Cao (Interactivity)
- **AI Socratic Tutor:** Nút "Chat với tài liệu". Người dùng không hiểu một Flashcard nào đó có thể ấn vào để chat trực tiếp với AI (VD: "Giải thích kỹ hơn định nghĩa này theo cách dễ hiểu nhất").
- **Edit & Refine:** Cho phép người dùng chỉnh sửa nội dung Flashcard, xóa câu hỏi thừa, hoặc yêu cầu AI "Tạo thêm 10 câu khó hơn".
- **Built-in SRS Study Mode:** Chế độ học Lặp lại ngắt quãng (Spaced Repetition) ngay trên giao diện Web mà không cần xuất ra Anki.

## Tóm Tắt Use Cases (10 UCs)
- **UC-01:** Đăng nhập/Quản lý tài khoản/Thanh toán.
- **UC-02:** Cung cấp nguồn tài liệu (Link / Upload).
- **UC-03:** AI Worker chạy ngầm bóc băng và sinh học liệu (Progress Bar).
- **UC-04:** Xem & Quản lý Deck (Sửa/Xóa/Thêm Flashcard).
- **UC-05:** Tương tác đa chiều: Chat/Hỏi đáp trực tiếp với Video/Tài liệu.
- **UC-06:** Học trực tiếp trên Web (Chế độ SRS hoặc lật thẻ tự do).
- **UC-07:** Làm bài kiểm tra (Quiz Mode) và tính điểm.
- **UC-08:** Xem Sơ đồ tư duy (Mindmap Viewer).
- **UC-09:** Export dữ liệu (Anki, CSV, PDF, Markdown).
- **UC-10:** Chuyển đổi Web thành Mobile App (PWA).

## Tóm Tắt Data Models (5 Entities)
- **User:** Thông tin user, plan, giới hạn quota.
- **Document:** Tài liệu gốc (URL, Transcript, File URL trên Storage).
- **Deck:** Bộ học liệu (thuộc về 1 Document).
- **Card:** Các thẻ học / Câu hỏi trắc nghiệm (thuộc về Deck).
- **StudyProgress:** Bảng lưu lịch sử học tập (Ngày review tiếp theo theo thuật toán SRS).
