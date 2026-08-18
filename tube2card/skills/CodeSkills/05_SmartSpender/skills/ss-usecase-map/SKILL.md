---
name: ss-usecase-map
description: "Điểm vào bắt buộc cho mọi task tính năng Smart Spender. Ánh xạ 26 use case sang actor, thực thể và quy tắc nghiệp vụ. Dùng khi nhận yêu cầu thêm hoặc sửa chức năng."
---

# Smart Spender — Use Case Map

> **Khi nào dùng:** Nhận yêu cầu feature/chức năng → đọc file này TRƯỚC → xác định UC liên quan → tra BR + Entity.

## Quy tắc sử dụng
1. Mỗi task phải map về ≥1 UC trong bảng dưới.
2. Kiểm tra cột **BR** để biết ràng buộc nghiệp vụ phải tuân thủ.
3. Kiểm tra cột **Entities** để biết bảng DB nào bị ảnh hưởng.
4. Nếu task chạm >3 UC → tách thành subtasks.

---

## Bảng Use Case

### Nhóm AUTH (Xác thực)

| UC | Tên | Actor | Entities | BR | Ghi chú |
|----|-----|-------|----------|-----|---------|
| UC-01 | Đăng ký | User | profiles, auth.users | BR-AUTH-01,03 | Trigger auto-create profile |
| UC-02 | Đăng nhập | User | auth.users | BR-AUTH-02 | Email/Pass + Google OAuth |
| UC-03 | Đăng xuất | User | auth.users | BR-AUTH-02 | Clear session token |
| UC-04 | Quản lý Profile | User | profiles | - | Sửa tên, avatar, currency, locale |

### Nhóm WALLET (Ví)

| UC | Tên | Actor | Entities | BR | Ghi chú |
|----|-----|-------|----------|-----|---------|
| UC-05 | Tạo Ví | User | wallets | BR-WAL-03,04,08,09 | 4 loại. Balance + budget optional |
| UC-06 | Sửa Ví | User | wallets | BR-WAL-03 | Không cho đổi type sau khi tạo |
| UC-07 | Xóa Ví | User | wallets | BR-WAL-01,07 | Soft-delete, check ví cuối |
| UC-08 | Cấu hình Ví trả sau | User | wallets | BR-WAL-03,06 | credit_limit, billing_date, due_date |

### Nhóm CATEGORY (Danh mục)

| UC | Tên | Actor | Entities | BR | Ghi chú |
|----|-----|-------|----------|-----|---------|
| UC-09 | Tạo Danh mục | User | categories | BR-CAT-01,02 | System defaults + custom |
| UC-10 | Sửa/Xóa Danh mục | User | categories, transactions | BR-CAT-03 | Reassign txn về "Khác" |

### Nhóm TRANSACTION (Giao dịch)

| UC | Tên | Actor | Entities | BR | Ghi chú |
|----|-----|-------|----------|-----|---------|
| UC-11 | Nhập bằng Text | User | transactions, wallets | BR-TXN-*,BR-AI-* | Text → AI → Confirm → Save |
| UC-12 | Nhập bằng Voice | User | transactions, wallets | BR-TXN-*,BR-AI-* | STT → Text → AI → Confirm → Save |
| UC-13 | Nhập thủ công | User | transactions, wallets | BR-TXN-01,02 | Form truyền thống |
| UC-14 | Sửa giao dịch | User | transactions, wallets | BR-TXN-03 | Hoàn balance cũ → áp mới |
| UC-15 | Xóa giao dịch | User | transactions, wallets | BR-TXN-04 | Soft-delete + hoàn balance |
| UC-16 | Xem lịch sử | User | transactions | - | Filter + Pagination |

### Nhóm DASHBOARD

| UC | Tên | Actor | Entities | BR | Ghi chú |
|----|-----|-------|----------|-----|---------|
| UC-17 | Dashboard | User | wallets, transactions, categories | BR-WAL-06 | Tổng dư, pie chart, recent txn |

### Nhóm BUDGET

| UC | Tên | Actor | Entities | BR | Ghi chú |
|----|-----|-------|----------|-----|---------|
| UC-18 | Đặt ngân sách | User | budgets | BR-BUD-01 | Per category per month |
| UC-19 | Cảnh báo ngân sách | System | budgets, transactions | BR-BUD-02,03 | 80% warning, 100% alert |

### Nhóm RECURRING (Định kỳ)

| UC | Tên | Actor | Entities | BR | Ghi chú |
|----|-----|-------|----------|-----|---------|
| UC-20 | Tạo giao dịch định kỳ | User | recurring_transactions | BR-REC-01 | daily/weekly/monthly/yearly |
| UC-21 | Thực thi định kỳ | System | recurring_transactions, transactions, wallets | BR-REC-02,03 | Cron 00:00 |
| UC-22 | Quản lý định kỳ | User | recurring_transactions | BR-REC-04,05,06 | Skip/Hủy/Sửa |
| UC-23 | Cảnh báo ví trả sau | System | wallets | BR-WAL-06 | Nhắc trước ngày chốt |

### Nhóm SETTINGS

| UC | Tên | Actor | Entities | BR | Ghi chú |
|----|-----|-------|----------|-----|---------|
| UC-24 | Chuyển ngôn ngữ | User | profiles | - | VI ↔ EN, lưu locale |

### Nhóm BATCH & TEMPLATES

| UC | Tên | Actor | Entities | BR | Ghi chú |
|----|-----|-------|----------|-----|---------|
| UC-25 | Batch Input | User | transactions, wallets | BR-BAT-*,BR-AI-* | 1 câu dài → N giao dịch, Confirmation list |
| UC-26 | Quick Templates | User | quick_templates, transactions, wallets | BR-TPL-* | Lưu mẫu + 1-tap lặp lại |
