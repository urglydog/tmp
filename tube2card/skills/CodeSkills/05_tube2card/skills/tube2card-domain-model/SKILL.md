---
description: Mô hình dữ liệu thực thể (Entity Relationship) của hệ thống Tube2Card, dùng để thiết kế Database Schema (Supabase).
tags: [architecture, domain, data-model]
---

# Tube2Card Domain Model

Dưới đây là 5 thực thể chính (Entities) sẽ được thiết kế trên bảng PostgreSQL của Supabase:

## 1. `users`
Bảng mặc định của Supabase Auth, mở rộng thông qua public schema `profiles`.
- **id** (UUID, PK)
- **email** (String)
- **plan_type** (Enum: `free`, `pro`)
- **decks_created_count** (Int, mặc định 0)
- **created_at** (Timestamp)

## 2. `documents`
Lưu trữ thông tin về nguồn dữ liệu đầu vào.
- **id** (UUID, PK)
- **user_id** (UUID, FK -> users.id)
- **source_url** (String, Link Youtube hoặc URL file PDF trên Supabase Storage)
- **source_type** (Enum: `youtube`, `vimeo`, `pdf`, `audio`, `text`)
- **transcript** (Text, nội dung bóc băng)
- **created_at** (Timestamp)

## 3. `decks`
Mỗi bộ tài liệu (Bộ thẻ) được sinh ra từ một Document.
- **id** (UUID, PK)
- **document_id** (UUID, FK -> documents.id)
- **user_id** (UUID, FK -> users.id)
- **title** (String, Tiêu đề bộ thẻ)
- **description** (Text, Tóm tắt nội dung)
- **mindmap_json** (JSONB, Chứa cấu trúc cây sơ đồ tư duy)
- **created_at** (Timestamp)

## 4. `cards`
Từng thẻ Flashcard hoặc Câu hỏi trắc nghiệm.
- **id** (UUID, PK)
- **deck_id** (UUID, FK -> decks.id)
- **type** (Enum: `flashcard`, `quiz`)
- **front** (Text, Nội dung câu hỏi)
- **back** (Text, Nội dung trả lời)
- **options** (JSONB, Chứa 4 đáp án A, B, C, D nếu là Quiz. Flashcard thì Null)
- **created_at** (Timestamp)

## 5. `study_progress`
Bảng lưu vết quá trình học của người dùng theo thuật toán SRS.
- **id** (UUID, PK)
- **user_id** (UUID, FK -> users.id)
- **card_id** (UUID, FK -> cards.id)
- **interval** (Int, Số ngày đến lần ôn tiếp theo)
- **ease_factor** (Float, Hệ số độ khó của thẻ)
- **next_review_date** (Timestamp)
- **last_reviewed_at** (Timestamp)

## Relationships (Mối quan hệ)
- **users (1) - (N) documents**
- **documents (1) - (1) decks** (Một Document sinh ra 1 bộ Deck tổng hợp)
- **decks (1) - (N) cards**
- **users (1) - (N) study_progress**
- **cards (1) - (1) study_progress** (Mỗi User có một tiến độ riêng cho từng thẻ)
