# TÀI LIỆU MÔ TẢ HỆ THỐNG & KẾ HOẠCH TRIỂN KHAI (PRD & ARCHITECTURE)
**Tên dự án:** Smart Spender (Voice & AI-Powered Multi-Wallet Expense Tracker)  
**Mục tiêu:** Quản lý chi tiêu đa nguồn tiền (Ngân hàng, MoMo, SPayLater, Ví trả sau...) bằng giọng nói/văn bản ngắn thông qua AI bóc tách tự động.

---

## 1. TỔNG QUAN TÍNH NĂNG (SYSTEM FEATURES)

* **F-01: Quản lý Đa Ví / Nguồn tiền (Multi-Wallet Management)**
  * Tạo, sửa, xóa các ví (MBBank, MoMo, SPayLater, Cash, v.v.).
  * Cấu hình hạn mức ví trả sau / thẻ tín dụng và ngày chốt sổ.
  * Tự động cập nhật số dư biến động theo từng giao dịch.
* **F-02: Nhập liệu thông minh bằng AI (Smart Voice/Text Parsing)**
  * Chuyển giọng nói thành văn bản (Speech-to-Text) ngay trên Mobile.
  * Trích xuất dữ liệu đa khoản tiền trong 1 câu thoại (Số tiền, Danh mục, Nguồn tiền, Ghi chú) thông qua LLM.
  * Hiển thị Bottom Sheet xác nhận (Confirmation UI) cho phép sửa tay trước khi lưu.
* **F-03: Nhật ký & Phân loại giao dịch (Transaction Logging & Categorization)**
  * Quản lý danh mục Thu/Chi (Eating, Bills, Shopping, Transport...).
  * Lưu lịch sử giao dịch gắn liền với `user_id`, `wallet_id`, `category_id`.
* **F-04: Báo cáo & Trực quan hóa (Analytics & Dashboard)**
  * Tổng số dư khả dụng tức thời across all wallets.
  * Biểu đồ tròn (Pie Chart) phân bổ chi tiêu theo danh mục.
  * Cảnh báo khoản nợ/ví trả sau đến hạn thanh toán.

---

## 2. KIẾN TRÚC & TECH STACK (TECH STACK ARCHITECTURE)

[ Mobile App: Flutter (Dart) ]
│
├── (1) Direct CRUD & Auth via Supabase Client SDK
│        └──► [ Supabase Auth & Postgres DB ]
│
└── (2) Audio/Text Input via REST API
└──► [ Supabase Edge Function (Deno/TypeScript) ]
└──► [ Gemini 1.5 Flash API (Structured JSON) ]
### Front-End (Mobile App)
* **Framework:** Flutter (Dart) - cross-platform, UI mượt.
* **State Management:** `flutter_bloc` hoặc `provider`.
* **Packages chính:**
  * `supabase_flutter`: Tích hợp Auth, DB CRUD, Realtime.
  * `speech_to_text`: Thu âm và chuyển giọng nói thành text ở Local.
  * `fl_chart`: Vẽ biểu đồ báo cáo tài chính.

### Back-End & Infrastructure (Supabase + Cloud Services)
* **Database:** Supabase PostgreSQL (Relational Database).
* **Authentication:** Supabase Auth (Email/Password, Google OAuth).
* **Serverless API (AI Gateway):** Supabase Edge Function (viết bằng TypeScript trên nền Deno runtime).
* **AI Engine:** Google Gemini 1.5 Flash API (Sử dụng tính năng `Structured Outputs` để trả về định dạng JSON Schema cố định).
* **Security:** Row Level Security (RLS) trên Postgres để cách ly dữ liệu giữa các User.

---

## 3. CƠ SỞ DỮ LIỆU (DATABASE SCHEMA DESIGN)

* **`profiles`**: `id` (UUID, PK, FK `auth.users`), `full_name` (Text), `currency` (Text, default 'VND').
* **`wallets`**: `id` (UUID, PK), `user_id` (UUID, FK), `name` (Text), `type` (Text: 'Bank' | 'E-Wallet' | 'Credit/BNPL'), `balance` (Numeric).
* **`categories`**: `id` (UUID, PK), `user_id` (UUID, FK, nullable), `name` (Text), `type` (Text: 'Expense' | 'Income').
* **`transactions`**: `id` (UUID, PK), `user_id` (UUID, FK), `wallet_id` (UUID, FK), `category_id` (UUID, FK), `amount` (Numeric), `note` (Text), `raw_input` (Text), `created_at` (Timestamptz).

---

## 4. KẾ HOẠCH TRIỂN KHAI PHÂN RÃ TASK (MASTER TASK BREAKDOWN)

### EPIC 1: Hạ tầng Backend & Cơ sở dữ liệu (Supabase Setup)
* **TASK 1.1: Thiết lập dự án Supabase**
  * [ ] Tạo Project mới trên Supabase Cloud Dashboard.
  * [ ] Lấy API Keys (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
  * [ ] Thiết lập Supabase CLI dưới máy local (`supabase init`, `supabase login`).
* **TASK 1.2: Khởi tạo Cơ sở dữ liệu (Database Migration)**
  * [ ] Viết script DDL SQL tạo các bảng `profiles`, `wallets`, `categories`, `transactions`.
  * [ ] Cấu hình Foreign Keys và Indexes cho các cột `user_id`, `created_at`.
  * [ ] Viết Trigger tự động chèn dữ liệu vào `profiles` khi có user mới đăng ký.
* **TASK 1.3: Cấu hình Bảo mật RLS (Row Level Security)**
  * [ ] Bật RLS cho tất cả các bảng.
  * [ ] Tạo Policy cho phép user chỉ `SELECT`, `INSERT`, `UPDATE`, `DELETE` trên dòng dữ liệu thuộc về `auth.uid()`.
* **TASK 1.4: Xây dựng Supabase Edge Function cho AI Parsing**
  * [ ] Khởi tạo Edge Function `supabase functions new parse-expense`.
  * [ ] Tích hợp Gemini API SDK / Fetch HTTP call.
  * [ ] Soạn thảo System Prompt ép Gemini trả về JSON Schema (`amount`, `category_name`, `wallet_name`, `note`).
  * [ ] Deploy Edge Function lên Supabase Cloud (`supabase functions deploy parse-expense`).

---

### EPIC 2: Phát triển Ứng dụng Mobile (Flutter Frontend)
* **TASK 2.1: Khởi tạo & Cấu hình Dự án Flutter**
  * [ ] Tạo Flutter project (`flutter create smart_spender`).
  * [ ] Cấu hình file `pubspec.yaml` cài các thư viện (`supabase_flutter`, `speech_to_text`, `fl_chart`, `provider`).
  * [ ] Khởi tạo `Supabase.initialize()` trong `main.dart`.
* **TASK 2.2: Luồng Xác thực Người dùng (Authentication Flow)**
  * [ ] Xây dựng Màn hình Đăng nhập / Đăng ký (Email/Password).
  * [ ] Xử lý lưu Session và Auto-login khi mở ứng dụng.
* **TASK 2.3: Màn hình Quản lý Ví & Danh mục (Wallets & Categories UI)**
  * [ ] Xây dựng Form tạo/sửa Ví (Chọn loại ví: MBBank, MoMo, SPayLater...).
  * [ ] Xây dựng danh mục Thu/Chi mặc định.
* **TASK 2.4: Màn hình Nhập liệu AI (Core Voice/Text Input UI)**
  * [ ] Cấu hình Microphone permission cho iOS/Android.
  * [ ] Bắt sự kiện Giọng nói -> Chuyển thành văn bản thực thời gian (Speech-to-Text).
  * [ ] Gửi chuỗi văn bản tới Supabase Edge Function `parse-expense`.
  * [ ] Thiết kế Bottom Sheet Confirmation: Hiển thị kết quả AI parse được, cho phép user chỉnh sửa dropdown/số tiền trước khi bấm "Lưu".
* **TASK 2.5: Màn hình Trang chủ & Báo cáo (Dashboard & Analytics UI)**
  * [ ] Thiết kế Card xem tổng số dư khả dụng và danh sách các Thẻ ví (Horizontal List).
  * [ ] Lấy danh sách giao dịch gần đây (Recent Transactions List).
  * [ ] Tích hợp `fl_chart` vẽ biểu đồ tròn chi tiêu theo danh mục trong tháng.

---

### EPIC 3: Đóng gói, Release & Vận hành (Production Deployment)
* **TASK 3.1: Kiểm thử Luồng dữ liệu (End-to-End Testing)**
  * [ ] Test case các câu thoại phức tạp (ví dụ: *"Vừa ăn cơm 30k bằng MoMo và mua trà sữa 45k bằng MBBank"*).
  * [ ] Kiểm tra tính chính xác của việc trừ/cộng tiền số dư Ví.
* **TASK 3.2: Đóng gói & Phát hành trên Google Play Store (Android)**
  * [ ] Cấu hình App Icon, Splash Screen và Package Name (`com.thiennguyen.smart_spender`).
  * [ ] Tạo Signing Key (`upload-keystore.jks`) và cấu hình `key.properties`.
  * [ ] Tạo trang Web Privacy Policy đơn giản.
  * [ ] Build file `.aab` (`flutter build appbundle --release`).
  * [ ] Tạo app trên Google Play Console, cài đặt Closed Testing và gửi duyệt Production.
* **TASK 3.3: Đóng gói & Phát hành trên Apple App Store (iOS)** *(Optional - Cần máy Mac)*
  * [ ] Cấu hình App ID, Bundle Identifier và Provisioning Profiles trên Apple Developer Account.
  * [ ] Mở thư mục `ios` bằng Xcode, tạo Archive và upload lên TestFlight.
  * [ ] Điền Store Listing và Submit cho Apple Review.