---
description: Toàn bộ danh sách Use Case (chức năng) của hệ thống Tube2Card, dùng để thiết kế luồng người dùng và API.
tags: [architecture, domain, usecase]
---

# Tube2Card Use Case Map

Dự án Tube2Card bao gồm 10 Use Case chính được chia theo các phân hệ như sau:

## 1. Phân hệ Tài khoản (Auth & Billing)
- **UC-01: Đăng nhập & Quản lý Plan**
  - **Actor:** Người dùng
  - **Entities:** `User`
  - **Rules:** BR-01 (Quota Limit). Tài khoản Free chỉ được tạo 3 Decks. Tài khoản Pro không giới hạn.
  - **Mô tả:** Đăng nhập bằng Google/Email qua Supabase Auth. Quản lý trạng thái subscription.

## 2. Phân hệ Nguồn Đầu Vào (Input & Processing)
- **UC-02: Cung cấp Nguồn Tài liệu**
  - **Actor:** Người dùng
  - **Entities:** `Document`, `Deck`
  - **Rules:** BR-04 (Hỗ trợ định dạng). Phải kiểm tra định dạng URL (Youtube, Vimeo) hoặc định dạng file (PDF, MP4, MP3).
  - **Mô tả:** Người dùng dán Link hoặc Upload file. Hệ thống tạo ra một bản ghi `Document`.
- **UC-03: AI Worker Bóc băng & Sinh Học liệu**
  - **Actor:** AI Worker (System)
  - **Entities:** `Document`, `Deck`, `Card`
  - **Rules:** BR-02 (API Timeout), BR-03 (Data Integrity).
  - **Mô tả:** Tải audio -> Bóc băng Whisper -> Đẩy vào Gemini 1.5 Pro -> Nhận JSON (Flashcards, Quiz, Mindmap).

## 3. Phân hệ Học tập & Quản lý Thẻ học (Study & Manage)
- **UC-04: Quản lý Deck (Bộ thẻ)**
  - **Actor:** Người dùng
  - **Entities:** `Deck`, `Card`
  - **Mô tả:** Xem danh sách thẻ, chỉnh sửa mặt trước (front), mặt sau (back), hoặc xóa thẻ lỗi.
- **UC-05: AI Socratic Tutor (Chat tương tác)**
  - **Actor:** Người dùng
  - **Entities:** `Card`
  - **Mô tả:** Người dùng bấm nút "Giải thích thêm" trên 1 Flashcard. AI sẽ phản hồi dưới dạng Chatbot Socratic.
- **UC-06: Chế độ Học Lặp lại Ngắt quãng (SRS Mode)**
  - **Actor:** Người dùng
  - **Entities:** `StudyProgress`, `Card`
  - **Mô tả:** Học thẻ trên Web. Dựa vào đánh giá của người dùng (Hard, Good, Easy), hệ thống cập nhật `next_review_date` theo thuật toán SRS (như SM-2).
- **UC-07: Làm bài trắc nghiệm (Quiz Mode)**
  - **Actor:** Người dùng
  - **Entities:** `Deck`
  - **Mô tả:** Làm bài kiểm tra gồm 10-20 câu Multiple-Choice do AI sinh ra. Chấm điểm tự động.
- **UC-08: Xem Sơ đồ tư duy (Mindmap Viewer)**
  - **Actor:** Người dùng
  - **Entities:** `Deck`
  - **Mô tả:** Hiển thị trực quan dữ liệu cây thư mục bằng React Flow hoặc Mermaid.js.

## 4. Phân hệ Xuất dữ liệu (Export)
- **UC-09: Export Dữ Liệu**
  - **Actor:** Người dùng
  - **Entities:** `Deck`, `Card`
  - **Mô tả:** Cho phép xuất dữ liệu học thành file `.apkg` (Anki), `.csv` (Quizlet), hoặc Markdown/PDF.

## 5. Phân hệ PWA (Mobile)
- **UC-10: Cài đặt Web App thành Mobile App**
  - **Actor:** Người dùng
  - **Mô tả:** Hỗ trợ manifest.json và Service Worker để hiển thị nút "Install App" trên trình duyệt điện thoại.
