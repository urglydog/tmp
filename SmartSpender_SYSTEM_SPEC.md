# Smart Spender — Đặc tả Hệ thống & Bộ Test Cases

> **Mục đích file:** Dùng làm INPUT duy nhất cho giai đoạn tạo bộ Skill hoàn chỉnh.
> **Mức độ:** Liệt kê khái niệm, đủ chi tiết để sinh skill, không phải tài liệu formal.

---

## 1. TỔNG QUAN HỆ THỐNG

- **Tên:** Smart Spender
- **Mô tả:** App quản lý chi tiêu đa ví, nhập liệu bằng giọng nói/văn bản, AI tự bóc tách giao dịch
- **Platform:** Flutter (iOS + Android)
- **Backend:** Supabase (Auth + PostgreSQL + Edge Functions)
- **AI:** Gemini 1.5 Flash (Structured JSON Output)
- **Ngôn ngữ:** Tiếng Việt + Tiếng Anh (i18n), mở rộng sau
- **Scope:** Single-user, không chia sẻ ví, không export

---

## 2. ACTORS

| Actor | Mô tả |
|-------|--------|
| User | Người dùng cuối, quản lý chi tiêu cá nhân |
| System (Cron) | Hệ thống tự động xử lý giao dịch định kỳ (recurring) |
| AI Engine | Gemini API bóc tách text thành structured data |

---

## 3. USE CASES

| ID | Tên | Actor | Mô tả ngắn |
|----|-----|-------|-------------|
| UC-01 | Đăng ký | User | Email/Password hoặc Google OAuth |
| UC-02 | Đăng nhập | User | Email/Password, Google OAuth, auto-login session |
| UC-03 | Đăng xuất | User | Xóa session, về màn login |
| UC-04 | Quản lý Profile | User | Sửa tên, avatar, currency mặc định |
| UC-05 | Tạo Ví | User | Tạo ví mới (Bank, E-Wallet, Credit/BNPL, Cash) |
| UC-06 | Sửa Ví | User | Đổi tên, loại, số dư ban đầu |
| UC-07 | Xóa Ví | User | Soft-delete, check ràng buộc giao dịch |
| UC-08 | Cấu hình Ví trả sau | User | Hạn mức, ngày chốt sổ, ngày thanh toán |
| UC-09 | Tạo Danh mục | User | Thu/Chi, icon, tên custom |
| UC-10 | Sửa/Xóa Danh mục | User | Soft-delete, reassign giao dịch |
| UC-11 | Nhập giao dịch bằng Text | User | Gõ text → AI parse → confirm → lưu |
| UC-12 | Nhập giao dịch bằng Voice | User | Nói → STT → AI parse → confirm → lưu |
| UC-13 | Nhập giao dịch thủ công | User | Form truyền thống: chọn ví, danh mục, số tiền |
| UC-14 | Sửa giao dịch | User | Edit amount, category, wallet, note. Hoàn số dư |
| UC-15 | Xóa giao dịch | User | Soft-delete, hoàn số dư về ví |
| UC-16 | Xem lịch sử giao dịch | User | Filter theo ngày, ví, danh mục. Pagination |
| UC-17 | Xem Dashboard | User | Tổng số dư, biểu đồ tròn, giao dịch gần đây |
| UC-18 | Đặt ngân sách danh mục | User | Budget hàng tháng cho từng category |
| UC-19 | Cảnh báo ngân sách | System | Push notification khi chi tiêu >= 80% hoặc vượt budget |
| UC-20 | Tạo giao dịch định kỳ | User | Recurring: số tiền, ví, danh mục, chu kỳ, ngày bắt đầu |
| UC-21 | Tự động thực thi định kỳ | System | Cron 00:00, sinh transaction, trừ/cộng ví |
| UC-22 | Quản lý giao dịch định kỳ | User | Sửa/Hủy/Skip tháng này, giữ tháng sau |
| UC-23 | Cảnh báo ví trả sau | System | Nhắc thanh toán trước ngày chốt sổ |
| UC-24 | Chuyển ngôn ngữ | User | VI ↔ EN trong Settings |
| UC-25 | Batch Input cuối ngày | User | 1 câu dài → AI parse N giao dịch cùng lúc |
| UC-26 | Quick Templates | User | Lưu giao dịch thường dùng, 1-tap lặp lại |

**Tổng: 26 use cases**

---

## 4. DATA ENTITIES

### 4.1 Bảng chính

| Entity | Mô tả | Quan hệ |
|--------|--------|---------|
| `profiles` | Thông tin user (extends auth.users) | 1 User → 1 Profile |
| `wallets` | Ví/nguồn tiền (balance OPTIONAL) | 1 User → N Wallets |
| `categories` | Danh mục Thu/Chi | 1 User → N Categories (+ system defaults) |
| `transactions` | Giao dịch thu/chi | 1 Wallet → N Transactions, 1 Category → N Transactions |
| `budgets` | Ngân sách theo danh mục/tháng | 1 User → N Budgets, 1 Category → 1 Budget/tháng |
| `recurring_transactions` | Giao dịch định kỳ | 1 User → N Recurring, 1 Wallet → N Recurring |
| `quick_templates` | Giao dịch thường dùng (1-tap) | 1 User → N Templates |

### 4.2 Schema chi tiết

```
profiles: id(UUID,PK,FK→auth.users), full_name(Text), avatar_url(Text), 
          currency(Text,'VND'), locale(Text,'vi'), created_at, updated_at

wallets: id(UUID,PK), user_id(UUID,FK), name(Text), type(Enum:'Bank'|'E-Wallet'|'Credit/BNPL'|'Cash'),
         balance(Numeric,nullable,default NULL), monthly_budget(Numeric,nullable),
         credit_limit(Numeric,nullable), 
         billing_date(Int,nullable,1-31), payment_due_date(Int,nullable,1-31),
         icon(Text), color(Text), is_deleted(Bool,false), created_at, updated_at
         -- balance: NULL=không track số dư, có giá trị=track tăng/giảm
         -- monthly_budget: NULL=không giới hạn, có giá trị=hạn mức chi tiêu tháng

categories: id(UUID,PK), user_id(UUID,FK,nullable→system default), name(Text), 
            type(Enum:'Expense'|'Income'), icon(Text), color(Text),
            is_system(Bool), is_deleted(Bool,false), created_at

transactions: id(UUID,PK), user_id(UUID,FK), wallet_id(UUID,FK), category_id(UUID,FK),
              type(Enum:'Expense'|'Income'), amount(Numeric>0), note(Text),
              raw_input(Text,nullable), input_method(Enum:'voice'|'text'|'manual'|'batch'|'template'),
              recurring_id(UUID,FK,nullable), is_deleted(Bool,false),
              transaction_date(Date), created_at

budgets: id(UUID,PK), user_id(UUID,FK), category_id(UUID,FK), 
         month(Int,1-12), year(Int), amount(Numeric>0), created_at
         UNIQUE(user_id, category_id, month, year)

recurring_transactions: id(UUID,PK), user_id(UUID,FK), wallet_id(UUID,FK), 
                        category_id(UUID,FK), type(Enum:'Expense'|'Income'),
                        amount(Numeric>0), note(Text),
                        frequency(Enum:'daily'|'weekly'|'monthly'|'yearly'),
                        day_of_month(Int,nullable,1-31), next_run_date(Date),
                        is_active(Bool,true), created_at, updated_at

quick_templates: id(UUID,PK), user_id(UUID,FK), wallet_id(UUID,FK,nullable),
                 category_id(UUID,FK), type(Enum:'Expense'|'Income'),
                 amount(Numeric>0), note(Text), icon(Text,nullable),
                 usage_count(Int,default 0), last_used_at(Timestamptz,nullable),
                 created_at
```

**Tổng: 7 entities chính**

---

## 5. BUSINESS RULES (BR)

### BR-AUTH: Xác thực
- **BR-AUTH-01:** Password tối thiểu 8 ký tự, có chữ hoa + số
- **BR-AUTH-02:** Session token expire sau 30 ngày, auto-refresh
- **BR-AUTH-03:** Google OAuth tạo profile tự động nếu chưa có

### BR-WALLET: Quản lý Ví
- **BR-WAL-01:** User phải có ít nhất 1 ví (không cho xóa ví cuối cùng)
- **BR-WAL-02:** Ví Cash có balance khởi tạo do user nhập, không giới hạn âm
- **BR-WAL-03:** Ví Credit/BNPL: bắt buộc nhập credit_limit, billing_date, payment_due_date
- **BR-WAL-04:** Balance ví tự cập nhật khi thêm/sửa/xóa transaction (atomic) — CHỈ khi balance != NULL
- **BR-WAL-05:** Ví Bank/E-Wallet: cảnh báo khi balance < 0 nhưng KHÔNG chặn giao dịch
- **BR-WAL-06:** Ví Credit/BNPL: cảnh báo khi tổng chi >= 90% credit_limit
- **BR-WAL-07:** Soft-delete ví: giữ lại giao dịch lịch sử, chặn tạo giao dịch mới
- **BR-WAL-08:** Balance là OPTIONAL (nullable). NULL = không track số dư, chỉ track chi tiêu
- **BR-WAL-09:** monthly_budget là OPTIONAL. Nếu set → cảnh báo khi tổng chi qua ví >= 80%/100% budget

### BR-CAT: Danh mục
- **BR-CAT-01:** System cung cấp danh mục mặc định (Ăn uống, Di chuyển, Mua sắm, Hóa đơn, Lương...)
- **BR-CAT-02:** User tạo custom category, không trùng tên với category cùng type
- **BR-CAT-03:** Xóa category → reassign giao dịch về "Khác" (system default)

### BR-TXN: Giao dịch
- **BR-TXN-01:** Amount > 0 bắt buộc
- **BR-TXN-02:** Expense trừ balance, Income cộng balance
- **BR-TXN-03:** Sửa transaction: hoàn balance cũ → áp balance mới (atomic)
- **BR-TXN-04:** Xóa transaction (soft): hoàn balance về ví
- **BR-TXN-05:** raw_input lưu nguyên câu nói/gõ gốc để audit

### BR-AI: AI Parsing
- **BR-AI-01:** 1 câu input có thể sinh N giao dịch (multi-expense parsing)
- **BR-AI-02:** AI trả về JSON array: [{amount, category_name, wallet_name, note}]
- **BR-AI-03:** Nếu AI không nhận diện được wallet → dùng ví mặc định (ví đầu tiên)
- **BR-AI-04:** Nếu AI không nhận diện được category → dùng "Khác"
- **BR-AI-05:** Luôn hiện Confirmation UI trước khi lưu, user có thể sửa tất cả fields
- **BR-AI-06:** Timeout AI call: 10 giây, retry 1 lần, sau đó báo lỗi user nhập thủ công
- **BR-AI-07:** Fuzzy matching wallet_name/category_name với dữ liệu user (MBBank ≈ MB ≈ mb bank)

### BR-BUDGET: Ngân sách
- **BR-BUD-01:** Mỗi category chỉ có 1 budget/tháng (UNIQUE constraint)
- **BR-BUD-02:** Cảnh báo khi chi tiêu đạt 80% budget
- **BR-BUD-03:** Cảnh báo khi chi tiêu VƯỢT 100% budget
- **BR-BUD-04:** Budget tính theo tháng dương lịch (1-31)

### BR-RECUR: Giao dịch định kỳ
- **BR-REC-01:** Hệ thống chạy cron 00:00 UTC+7 hàng ngày, check next_run_date
- **BR-REC-02:** Nếu next_run_date = today → sinh transaction, cập nhật next_run_date
- **BR-REC-03:** Nếu balance ví không đủ → VẪN tạo transaction (cho phép âm), gửi cảnh báo
- **BR-REC-04:** User có thể Skip lần này (cập nhật next_run_date mà không sinh transaction)
- **BR-REC-05:** User hủy recurring → is_active = false, không ảnh hưởng transaction đã sinh
- **BR-REC-06:** Sửa recurring chỉ ảnh hưởng từ lần chạy tiếp theo

### BR-RLS: Bảo mật dữ liệu
- **BR-RLS-01:** RLS bật cho tất cả bảng, user chỉ thấy dữ liệu của mình
- **BR-RLS-02:** Edge Function validate JWT token trước khi gọi Gemini
- **BR-RLS-03:** API key Gemini chỉ lưu ở server-side (Edge Function env)

### BR-BAT: Batch Input
- **BR-BAT-01:** Batch input gửi 1 câu dài → AI parse ra N giao dịch (dùng chung pipeline AI)
- **BR-BAT-02:** Mỗi item trong batch hiển thành 1 dòng riêng trong Confirmation UI, có thể sửa/xóa từng dòng
- **BR-BAT-03:** User có thể xóa bất kỳ item nào khỏi batch trước khi bấm Lưu Tất Cả
- **BR-BAT-04:** input_method = 'batch' cho tất cả transactions sinh từ batch

### BR-TPL: Quick Templates
- **BR-TPL-01:** User tạo template từ bất kỳ transaction đã lưu (bấm "Lưu làm mẫu")
- **BR-TPL-02:** 1-tap trên template → tạo transaction ngay (skip AI, skip confirmation)
- **BR-TPL-03:** Templates sắp xếp theo usage_count DESC (dùng nhiều nhất lên đầu)
- **BR-TPL-04:** input_method = 'template' cho transactions sinh từ template
- **BR-TPL-05:** User có thể sửa/xóa template bất cứ lúc nào

**Tổng: 38 Business Rules**

---

## 6. BỘ TEST CASES

### TC-AUTH: Xác thực

| TC-ID | Mô tả | Input | Expected | BR |
|-------|--------|-------|----------|-----|
| TC-AUTH-01 | Đăng ký thành công | email+pass hợp lệ | Tạo account + profile, redirect home | BR-AUTH-01 |
| TC-AUTH-02 | Đăng ký password yếu | "12345" | Lỗi "Mật khẩu tối thiểu 8 ký tự, có chữ hoa + số" | BR-AUTH-01 |
| TC-AUTH-03 | Đăng ký email trùng | email đã tồn tại | Lỗi "Email đã được sử dụng" | BR-AUTH-01 |
| TC-AUTH-04 | Đăng nhập thành công | email+pass đúng | Redirect home, lưu session | BR-AUTH-02 |
| TC-AUTH-05 | Đăng nhập sai password | pass sai | Lỗi "Sai email hoặc mật khẩu" | BR-AUTH-02 |
| TC-AUTH-06 | Google OAuth lần đầu | Google account mới | Tạo account + profile auto | BR-AUTH-03 |
| TC-AUTH-07 | Auto-login khi mở app | Session còn hạn | Vào thẳng home, skip login | BR-AUTH-02 |
| TC-AUTH-08 | Session hết hạn | Token > 30 ngày | Redirect login | BR-AUTH-02 |

### TC-WALLET: Quản lý Ví

| TC-ID | Mô tả | Input | Expected | BR |
|-------|--------|-------|----------|-----|
| TC-WAL-01 | Tạo ví Bank | name="MBBank", type=Bank, balance=5000000 | Tạo thành công | BR-WAL-04 |
| TC-WAL-02 | Tạo ví Credit thiếu field | type=Credit, không có credit_limit | Lỗi validation | BR-WAL-03 |
| TC-WAL-03 | Tạo ví Credit đủ field | type=Credit, limit=10M, billing=25, due=10 | Tạo thành công | BR-WAL-03 |
| TC-WAL-04 | Xóa ví cuối cùng | Chỉ còn 1 ví, bấm xóa | Lỗi "Phải có ít nhất 1 ví" | BR-WAL-01 |
| TC-WAL-05 | Xóa ví có giao dịch | Ví có 5 transactions | Soft-delete, giao dịch cũ vẫn xem được | BR-WAL-07 |
| TC-WAL-06 | Balance cập nhật sau expense | Ví 5M, chi 100k | Balance = 4.9M | BR-WAL-04 |
| TC-WAL-07 | Cảnh báo balance âm | Ví Bank balance=50k, chi 100k | Cho phép nhưng hiện warning | BR-WAL-05 |
| TC-WAL-08 | Cảnh báo credit limit | Credit limit 10M, tổng chi 9.2M | Warning >= 90% | BR-WAL-06 |

### TC-CATEGORY: Danh mục

| TC-ID | Mô tả | Input | Expected | BR |
|-------|--------|-------|----------|-----|
| TC-CAT-01 | System defaults có sẵn | User mới đăng ký | Có sẵn: Ăn uống, Di chuyển, Mua sắm, Hóa đơn, Lương... | BR-CAT-01 |
| TC-CAT-02 | Tạo custom category | name="Gym", type=Expense | Tạo thành công | BR-CAT-02 |
| TC-CAT-03 | Tạo trùng tên | name="Ăn uống", type=Expense (đã có) | Lỗi "Danh mục đã tồn tại" | BR-CAT-02 |
| TC-CAT-04 | Xóa category có giao dịch | Category "Gym" có 3 txn | Soft-delete, 3 txn chuyển về "Khác" | BR-CAT-03 |

### TC-TRANSACTION: Giao dịch

| TC-ID | Mô tả | Input | Expected | BR |
|-------|--------|-------|----------|-----|
| TC-TXN-01 | Tạo expense thủ công | amount=50000, cat=Ăn uống, wallet=MBBank | Tạo txn, balance giảm 50k | BR-TXN-01,02 |
| TC-TXN-02 | Tạo income | amount=10M, cat=Lương, wallet=MBBank | Tạo txn, balance tăng 10M | BR-TXN-02 |
| TC-TXN-03 | Amount = 0 | amount=0 | Lỗi validation | BR-TXN-01 |
| TC-TXN-04 | Amount âm | amount=-50000 | Lỗi validation | BR-TXN-01 |
| TC-TXN-05 | Sửa transaction amount | Txn 50k → 80k | Balance hoàn 50k rồi trừ 80k (net -30k) | BR-TXN-03 |
| TC-TXN-06 | Sửa transaction wallet | Txn từ MBBank → MoMo | MBBank hoàn, MoMo trừ | BR-TXN-03 |
| TC-TXN-07 | Xóa transaction | Xóa txn expense 50k | Soft-delete, balance hoàn 50k | BR-TXN-04 |
| TC-TXN-08 | Lưu raw_input | Voice: "ăn cơm 30k" | raw_input = "ăn cơm 30k" | BR-TXN-05 |

### TC-AI: AI Parsing

| TC-ID | Mô tả | Input | Expected | BR |
|-------|--------|-------|----------|-----|
| TC-AI-01 | Parse đơn giản | "ăn cơm 30k" | [{amount:30000, cat:"Ăn uống", note:"ăn cơm"}] | BR-AI-01,02 |
| TC-AI-02 | Parse multi-expense | "ăn cơm 30k bằng MoMo và mua trà sữa 45k bằng MBBank" | [{amount:30000,cat:"Ăn uống",wallet:"MoMo"},{amount:45000,cat:"Mua sắm",wallet:"MBBank"}] | BR-AI-01 |
| TC-AI-03 | Không nhận diện wallet | "ăn phở 50k" | wallet = ví mặc định | BR-AI-03 |
| TC-AI-04 | Không nhận diện category | "trả tiền gì đó 200k" | category = "Khác" | BR-AI-04 |
| TC-AI-05 | Confirmation UI hiển thị | AI parse xong | Bottom Sheet hiện kết quả, editable | BR-AI-05 |
| TC-AI-06 | User sửa trên Confirmation | Sửa amount từ 30k→35k | Lưu với 35k | BR-AI-05 |
| TC-AI-07 | AI timeout | Gemini không trả lời 10s | Retry 1 lần, nếu fail → thông báo nhập thủ công | BR-AI-06 |
| TC-AI-08 | Fuzzy matching wallet | "mb" → MBBank | Match thành công | BR-AI-07 |
| TC-AI-09 | Voice to Text | Nói "đổ xăng 100k" | STT → text → parse | BR-AI-01 |
| TC-AI-10 | Income qua voice | "nhận lương 15 triệu" | type=Income, amount=15000000 | BR-AI-02 |

### TC-BUDGET: Ngân sách

| TC-ID | Mô tả | Input | Expected | BR |
|-------|--------|-------|----------|-----|
| TC-BUD-01 | Đặt budget | cat=Ăn uống, month=8, year=2026, amount=3M | Tạo budget | BR-BUD-01 |
| TC-BUD-02 | Duplicate budget | Đặt lại budget cho Ăn uống T8/2026 | Update (upsert) | BR-BUD-01 |
| TC-BUD-03 | Cảnh báo 80% | Budget 3M, đã chi 2.5M | Warning notification | BR-BUD-02 |
| TC-BUD-04 | Cảnh báo vượt 100% | Budget 3M, đã chi 3.2M | Alert notification | BR-BUD-03 |

### TC-RECURRING: Giao dịch định kỳ

| TC-ID | Mô tả | Input | Expected | BR |
|-------|--------|-------|----------|-----|
| TC-REC-01 | Tạo recurring monthly | amount=5M, cat=Tiền nhà, freq=monthly, day=1 | Tạo recurring, next_run=ngày 1 tháng sau | BR-REC-01 |
| TC-REC-02 | Cron thực thi đúng ngày | next_run_date = today | Sinh transaction, trừ balance, update next_run | BR-REC-02 |
| TC-REC-03 | Balance không đủ | Ví 1M, recurring 5M | VẪN tạo txn (balance âm), gửi cảnh báo | BR-REC-03 |
| TC-REC-04 | Skip lần này | User bấm Skip | next_run_date += 1 tháng, không sinh txn | BR-REC-04 |
| TC-REC-05 | Hủy recurring | User bấm Hủy | is_active=false, txn cũ giữ nguyên | BR-REC-05 |
| TC-REC-06 | Sửa recurring | Đổi amount 5M→6M | Áp dụng từ lần chạy tiếp | BR-REC-06 |

### TC-RLS: Bảo mật

| TC-ID | Mô tả | Input | Expected | BR |
|-------|--------|-------|----------|-----|
| TC-RLS-01 | User A không thấy data User B | User A query wallets | Chỉ thấy wallet của A | BR-RLS-01 |
| TC-RLS-02 | Edge Function check JWT | Request không có token | 401 Unauthorized | BR-RLS-02 |
| TC-RLS-03 | Client không có API key | Inspect network | Không thấy Gemini API key | BR-RLS-03 |

### TC-DASHBOARD: Dashboard & Báo cáo

| TC-ID | Mô tả | Input | Expected | BR |
|-------|--------|-------|----------|-----|
| TC-DASH-01 | Tổng số dư tất cả ví | 3 ví: 5M, 2M, 1M | Hiển thị 8M | - |
| TC-DASH-02 | Biểu đồ tròn theo danh mục | Tháng 8 có 5 danh mục chi | Pie chart đúng tỷ lệ | - |
| TC-DASH-03 | Giao dịch gần đây | 20 giao dịch | Hiển thị 10 gần nhất, load more | - |
| TC-DASH-04 | Cảnh báo ví trả sau | 3 ngày trước ngày chốt | Hiện banner cảnh báo | BR-WAL-06 |

### TC-I18N: Đa ngôn ngữ

| TC-ID | Mô tả | Input | Expected | BR |
|-------|--------|-------|----------|-----|
| TC-I18N-01 | Chuyển VI→EN | Settings → English | Toàn bộ UI chuyển EN | - |
| TC-I18N-02 | AI parse tiếng Anh | "lunch 5 dollars" | Parse đúng amount + category | BR-AI-01 |
| TC-I18N-03 | Currency format | VI: 30.000đ, EN: $30.00 | Hiển thị đúng format | - |

### TC-BATCH: Batch Input

| TC-ID | Mô tả | Input | Expected | BR |
|-------|--------|-------|----------|-----|
| TC-BAT-01 | Batch parse 3 items | "ăn sáng 25k, đổ xăng 80k, cà phê 35k" | 3 dòng trong Confirmation UI | BR-BAT-01,02 |
| TC-BAT-02 | Xóa 1 item khỏi batch | Bấm X trên dòng "đổ xăng 80k" | Còn 2 items, lưu 2 | BR-BAT-03 |
| TC-BAT-03 | Sửa item trong batch | Sửa 25k→30k ở dòng 1 | Lưu với 30k | BR-BAT-02 |
| TC-BAT-04 | input_method = batch | Lưu batch 3 items | Cả 3 txn có input_method='batch' | BR-BAT-04 |
| TC-BAT-05 | Batch + multi wallet | "ăn cơm 30k MoMo, grab 50k MBBank" | 2 items, đúng ví | BR-BAT-01,AI-07 |

### TC-TPL: Quick Templates

| TC-ID | Mô tả | Input | Expected | BR |
|-------|--------|-------|----------|-----|
| TC-TPL-01 | Tạo template | Bấm "Lưu làm mẫu" trên txn "Cà phê 25k MoMo" | Template được tạo | BR-TPL-01 |
| TC-TPL-02 | 1-tap tạo từ template | Tap template "Cà phê 25k MoMo" | Txn tạo ngay, balance trừ, no confirmation | BR-TPL-02 |
| TC-TPL-03 | Thứ tự templates | Cà phê dùng 15 lần, Grab dùng 3 lần | Cà phê hiện trước | BR-TPL-03 |
| TC-TPL-04 | Xóa template | Bấm xóa template | Template bị xóa, txn cũ không ảnh hưởng | BR-TPL-05 |
| TC-TPL-05 | input_method = template | Tạo txn từ template | input_method='template' | BR-TPL-04 |

### TC-HYBRID: Hybrid Balance

| TC-ID | Mô tả | Input | Expected | BR |
|-------|--------|-------|----------|-----|
| TC-HYB-01 | Ví không set balance | Tạo ví, balance=NULL | Expense không trừ balance, chỉ log spending | BR-WAL-08 |
| TC-HYB-02 | Ví có set balance | Tạo ví, balance=5M | Expense trừ balance bình thường | BR-WAL-04,08 |
| TC-HYB-03 | Ví có monthly_budget | Set budget ví MoMo = 3M | Cảnh báo khi chi qua MoMo >= 2.4M (80%) | BR-WAL-09 |
| TC-HYB-04 | Ví ko balance + có budget | balance=NULL, budget=2M | Track spending vs budget, ko track balance | BR-WAL-08,09 |
| TC-HYB-05 | Dashboard ví ko balance | 2 ví: 1 có balance, 1 không | Tổng dư chỉ tính ví có balance | BR-WAL-08 |

**Tổng: 67 Test Cases**

---

## 7. QUY TRÌNH NGHIỆP VỤ CHÍNH

### Flow 1: Nhập giao dịch đơn (Voice/Text)
```
User nói/gõ → [STT nếu voice] → Text → Edge Function → Gemini Parse
→ JSON Array → Confirmation Bottom Sheet → User confirm/edit → Save to DB
→ IF wallet.balance IS NOT NULL: Update balance (atomic)
→ Check budget threshold (category + wallet) → Notify if needed
```

### Flow 2: Batch Input cuối ngày (Recommended)
```
User gõ/nói 1 câu dài liệt kê tất cả chi tiêu trong ngày
→ Edge Function → Gemini Parse → JSON Array (N items)
→ Confirmation List (mỗi item 1 dòng, sửa/xóa riêng)
→ User bấm "Lưu Tất Cả" → Bulk insert N transactions
→ Update balances + Check budgets cho tất cả wallets/categories bị ảnh hưởng
```

### Flow 3: Quick Template (1-tap)
```
User mở Templates list (sorted by usage) → Tap template
→ Tạo transaction ngay (skip AI, skip confirmation)
→ Update balance + budget check → usage_count++
```

### Flow 4: Giao dịch định kỳ tự động
```
Cron 00:00 → Query recurring WHERE next_run_date = today AND is_active = true
→ FOR EACH: Insert transaction → IF balance NOT NULL: Update balance
→ Update next_run_date → IF balance < 0: Push notification cảnh báo
```

### Flow 5: Budget monitoring (dual-level)
```
After mỗi expense transaction:
  Level 1 (Category budget): Sum chi tiêu tháng theo category → compare budgets table
  Level 2 (Wallet budget): Sum chi tiêu tháng theo wallet → compare wallet.monthly_budget
  → IF >= 80%: Warning → IF >= 100%: Alert
```
