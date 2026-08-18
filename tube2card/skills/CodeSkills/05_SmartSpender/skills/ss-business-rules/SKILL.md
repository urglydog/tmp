---
name: ss-business-rules
description: "38 quy tắc nghiệp vụ Smart Spender theo 10 nhóm mã BR. Dùng khi hiện thực logic, validate đầu vào, hoặc kiểm tra hành vi có đúng đặc tả."
---

# Smart Spender — Business Rules

> **Khi nào dùng:** Viết logic service/function, validate input, viết test, hoặc cần kiểm tra ràng buộc nghiệp vụ.

---

## BR-AUTH: Xác thực

| BR | Quy tắc | Khi | Thì | Ngoại lệ |
|----|---------|-----|-----|----------|
| BR-AUTH-01 | Password policy | User đăng ký | Password >= 8 ký tự, có ≥1 chữ hoa + ≥1 số | Google OAuth không cần password |
| BR-AUTH-02 | Session management | User đăng nhập | Token expire 30 ngày, auto-refresh nếu còn active | Force logout → clear token |
| BR-AUTH-03 | OAuth auto-profile | User đăng nhập Google lần đầu | Auto-create profile từ Google info | Nếu email đã tồn tại → link account |

## BR-WAL: Quản lý Ví

| BR | Quy tắc | Khi | Thì | Ngoại lệ |
|----|---------|-----|-----|----------|
| BR-WAL-01 | Ví tối thiểu | User xóa ví | Chặn nếu chỉ còn 1 ví active | - |
| BR-WAL-02 | Ví Cash | Tạo ví Cash | Balance do user nhập, cho phép âm | - |
| BR-WAL-03 | Ví Credit bắt buộc | Tạo ví Credit/BNPL | Bắt buộc: credit_limit, billing_date, payment_due_date | - |
| BR-WAL-04 | Balance atomic | Thêm/sửa/xóa transaction | Cập nhật balance trong cùng DB transaction (ACID) | - |
| BR-WAL-05 | Cảnh báo âm | Balance ví Bank/E-Wallet < 0 | Hiện warning, KHÔNG chặn giao dịch | - |
| BR-WAL-06 | Cảnh báo credit | Tổng chi >= 90% credit_limit | Push notification cảnh báo | - |
| BR-WAL-07 | Soft-delete ví | Xóa ví | is_deleted=true, giao dịch cũ giữ, chặn tạo txn mới | - |
| BR-WAL-08 | Hybrid balance | Tạo ví | balance là OPTIONAL (nullable). NULL = không track số dư, chỉ log chi tiêu | - |
| BR-WAL-09 | Wallet budget | Set monthly_budget | Cảnh báo khi tổng chi qua ví >= 80%/100% monthly_budget | Độc lập với category budget |

## BR-CAT: Danh mục

| BR | Quy tắc | Khi | Thì | Ngoại lệ |
|----|---------|-----|-----|----------|
| BR-CAT-01 | System defaults | User mới | Auto-seed: Ăn uống, Di chuyển, Mua sắm, Hóa đơn, Giải trí, Sức khỏe, Lương, Thu nhập khác | is_system=true, không xóa được |
| BR-CAT-02 | Unique name | Tạo category | UNIQUE(user_id, name, type) WHERE not deleted | - |
| BR-CAT-03 | Reassign on delete | Xóa category có txn | Txn chuyển về category "Khác" (system) | - |

## BR-TXN: Giao dịch

| BR | Quy tắc | Khi | Thì | Ngoại lệ |
|----|---------|-----|-----|----------|
| BR-TXN-01 | Amount positive | Tạo/sửa transaction | amount > 0 bắt buộc | - |
| BR-TXN-02 | Balance direction | Tạo transaction | Expense → balance -= amount; Income → balance += amount | CHỈ khi wallet.balance IS NOT NULL |
| BR-TXN-03 | Edit revert-apply | Sửa transaction | Hoàn balance cũ (reverse) → áp balance mới. Nếu đổi wallet → hoàn ví cũ, trừ ví mới | Atomic transaction |
| BR-TXN-04 | Delete revert | Xóa (soft) transaction | Hoàn balance về ví | - |
| BR-TXN-05 | Audit trail | Tạo txn qua AI | Lưu raw_input (câu gốc) + input_method | - |

## BR-AI: AI Parsing

| BR | Quy tắc | Khi | Thì | Ngoại lệ |
|----|---------|-----|-----|----------|
| BR-AI-01 | Multi-parse | 1 câu input | Có thể sinh N giao dịch (array) | - |
| BR-AI-02 | JSON schema | AI response | Trả về [{amount, category_name, wallet_name, note, type}] | - |
| BR-AI-03 | Fallback wallet | AI không nhận diện wallet | Dùng ví đầu tiên (theo created_at ASC) | - |
| BR-AI-04 | Fallback category | AI không nhận diện category | Dùng "Khác" (system default) | - |
| BR-AI-05 | Confirmation required | AI parse xong | LUÔN hiện Bottom Sheet, user phải confirm | Không auto-save |
| BR-AI-06 | Timeout & retry | AI call | Timeout 10s, retry 1 lần. Fail → fallback nhập thủ công | - |
| BR-AI-07 | Fuzzy matching | AI trả wallet_name/category_name | Fuzzy match với data user (Levenshtein hoặc contains) | - |

## BR-BUD: Ngân sách

| BR | Quy tắc | Khi | Thì | Ngoại lệ |
|----|---------|-----|-----|----------|
| BR-BUD-01 | Unique budget | Đặt budget | UNIQUE(user_id, category_id, month, year). Trùng → upsert | - |
| BR-BUD-02 | Warning 80% | Chi tiêu tháng >= 80% budget | Push notification warning | - |
| BR-BUD-03 | Alert 100% | Chi tiêu tháng >= 100% budget | Push notification alert, KHÔNG chặn chi tiêu | - |
| BR-BUD-04 | Calendar month | Tính budget | Theo tháng dương lịch (ngày 1 → cuối tháng) | - |

## BR-REC: Giao dịch định kỳ

| BR | Quy tắc | Khi | Thì | Ngoại lệ |
|----|---------|-----|-----|----------|
| BR-REC-01 | Cron schedule | 00:00 UTC+7 hàng ngày | Query WHERE next_run_date = today AND is_active | - |
| BR-REC-02 | Auto-execute | Match found | INSERT transaction + UPDATE balance + UPDATE next_run_date | Trong 1 DB transaction |
| BR-REC-03 | Allow negative | Balance không đủ | VẪN tạo transaction (cho âm) + push cảnh báo | - |
| BR-REC-04 | Skip once | User bấm Skip | next_run_date += interval, KHÔNG sinh transaction | - |
| BR-REC-05 | Cancel | User hủy | is_active=false, txn đã sinh KHÔNG bị ảnh hưởng | - |
| BR-REC-06 | Edit forward | User sửa recurring | Chỉ áp dụng từ lần chạy tiếp theo | - |

## BR-RLS: Bảo mật

| BR | Quy tắc | Khi | Thì | Ngoại lệ |
|----|---------|-----|-----|----------|
| BR-RLS-01 | Row isolation | Mọi query | RLS policy: user_id = auth.uid() | - |
| BR-RLS-02 | Edge Function auth | Gọi Edge Function | Validate JWT trước khi xử lý | 401 nếu thiếu/sai token |
| BR-RLS-03 | Server-side key | Gemini API key | Chỉ lưu ở Edge Function env, KHÔNG expose client | - |

## BR-BAT: Batch Input

| BR | Quy tắc | Khi | Thì | Ngoại lệ |
|----|---------|-----|-----|----------|
| BR-BAT-01 | Shared pipeline | Batch input | Dùng chung pipeline AI (Edge Function + Gemini) | input_method='batch' |
| BR-BAT-02 | Per-item editing | Confirmation UI | Mỗi item 1 dòng riêng, sửa/xóa độc lập | - |
| BR-BAT-03 | Remove from batch | Trước khi lưu | User có thể xóa bất kỳ item nào | - |
| BR-BAT-04 | Batch marker | Lưu batch | Tất cả txn có input_method='batch' | - |

## BR-TPL: Quick Templates

| BR | Quy tắc | Khi | Thì | Ngoại lệ |
|----|---------|-----|-----|----------|
| BR-TPL-01 | Create from txn | User bấm "Lưu làm mẫu" | Tạo template từ transaction data | - |
| BR-TPL-02 | 1-tap create | Tap template | Tạo transaction ngay (skip AI, skip confirmation) | - |
| BR-TPL-03 | Usage sort | Hiển thị templates | Sắp xếp theo usage_count DESC | - |
| BR-TPL-04 | Template marker | Tạo từ template | input_method='template' | - |
| BR-TPL-05 | Editable | User sửa/xóa template | Không ảnh hưởng transactions đã sinh | - |
