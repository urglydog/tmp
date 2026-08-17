# Hướng dẫn khởi tạo Cơ sở dữ liệu Smart Spender

File `migrations/00000000000000_init_schema.sql` chứa toàn bộ câu lệnh (DDL SQL) để khởi tạo 7 bảng dữ liệu cần thiết cho dự án Smart Spender.

## Cách chạy SQL (Khuyên dùng)
Vì hiện tại máy tính của bạn chưa cài đặt Supabase CLI, cách nhanh nhất là chạy thủ công đoạn mã này trên trang web của Supabase:

1. Mở file `migrations/00000000000000_init_schema.sql` và copy (sao chép) toàn bộ nội dung trong đó.
2. Truy cập vào trang [Supabase Dashboard](https://supabase.com/dashboard).
3. Chọn Project **Smart Spender** của bạn.
4. Ở thanh menu bên trái, tìm và bấm vào biểu tượng **SQL Editor** (Ký hiệu `>_`).
5. Bấm vào nút **New Query** (Tạo truy vấn mới).
6. Dán (Paste) toàn bộ nội dung mã SQL bạn vừa copy vào khung soạn thảo.
7. Bấm nút **Run** (màu xanh lá) ở góc phải dưới cùng.

Sau khi chạy xong sẽ báo "Success". Bạn có thể vào phần **Table Editor** (Biểu tượng bảng) ở menu bên trái để kiểm tra xem 7 bảng đã xuất hiện chưa.

## Các bảng được tạo bao gồm:
1. `profiles`: Thông tin người dùng.
2. `wallets`: Danh sách các ví/nguồn tiền.
3. `categories`: Danh mục thu chi.
4. `transactions`: Lịch sử giao dịch chi tiêu.
5. `budgets`: Ngân sách đặt theo tháng.
6. `recurring_transactions`: Các giao dịch được lặp lại định kỳ (đóng tiền nhà, Netflix...).
7. `quick_templates`: Các mẫu lưu nhanh 1 chạm.
