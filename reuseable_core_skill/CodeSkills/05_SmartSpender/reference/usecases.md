# Smart Spender — Use Cases Reference

> Bảng tra cứu đầy đủ 24 use cases. Xem chi tiết mapping tại `ss-usecase-map` skill.

| UC | Tên | Actor | Entities | BR liên quan |
|----|-----|-------|----------|-------------|
| UC-01 | Đăng ký | User | profiles, auth.users | BR-AUTH-01,03 |
| UC-02 | Đăng nhập | User | auth.users | BR-AUTH-02 |
| UC-03 | Đăng xuất | User | auth.users | BR-AUTH-02 |
| UC-04 | Quản lý Profile | User | profiles | - |
| UC-05 | Tạo Ví | User | wallets | BR-WAL-03,04 |
| UC-06 | Sửa Ví | User | wallets | BR-WAL-03 |
| UC-07 | Xóa Ví | User | wallets | BR-WAL-01,07 |
| UC-08 | Cấu hình Ví trả sau | User | wallets | BR-WAL-03,06 |
| UC-09 | Tạo Danh mục | User | categories | BR-CAT-01,02 |
| UC-10 | Sửa/Xóa Danh mục | User | categories, transactions | BR-CAT-03 |
| UC-11 | Nhập bằng Text | User | transactions, wallets | BR-TXN-*,BR-AI-* |
| UC-12 | Nhập bằng Voice | User | transactions, wallets | BR-TXN-*,BR-AI-* |
| UC-13 | Nhập thủ công | User | transactions, wallets | BR-TXN-01,02 |
| UC-14 | Sửa giao dịch | User | transactions, wallets | BR-TXN-03 |
| UC-15 | Xóa giao dịch | User | transactions, wallets | BR-TXN-04 |
| UC-16 | Xem lịch sử | User | transactions | - |
| UC-17 | Dashboard | User | wallets, transactions, categories | BR-WAL-06 |
| UC-18 | Đặt ngân sách | User | budgets | BR-BUD-01 |
| UC-19 | Cảnh báo ngân sách | System | budgets, transactions | BR-BUD-02,03 |
| UC-20 | Tạo giao dịch định kỳ | User | recurring_transactions | BR-REC-01 |
| UC-21 | Thực thi định kỳ | System | recurring_transactions, transactions, wallets | BR-REC-02,03 |
| UC-22 | Quản lý định kỳ | User | recurring_transactions | BR-REC-04,05,06 |
| UC-23 | Cảnh báo ví trả sau | System | wallets | BR-WAL-06 |
| UC-24 | Chuyển ngôn ngữ | User | profiles | - |
