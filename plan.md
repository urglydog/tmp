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

```text
[ Mobile App: Flutter (Dart) ]
│
├── (1) Direct CRUD & Auth via Supabase Client SDK
│        └──► [ Supabase Auth & Postgres DB ]
│
└── (2) Audio/Text Input via REST API
         └──► [ Supabase Edge Function (Deno/TypeScript) ]
                   └──► [ Gemini 1.5 Flash API (Structured JSON) ]
```

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

## 4. LỘ TRÌNH TRIỂN KHAI CHI TIẾT & YÊU CẦU TÀI NGUYÊN

Chiến lược phát triển sẽ đi từ Backend (để thiết lập cấu trúc dữ liệu và API thật) đến Frontend (UI/UX) và cuối cùng là tích hợp AI, tối ưu và phát hành.

### GIAI ĐOẠN 1: Xây dựng nền tảng Backend & AI Gateway (Dự kiến: 1-2 tuần)
**Mục tiêu:** Đảm bảo database sẵn sàng, các luồng xác thực (Auth) hoạt động và API phân tích AI nhận/trả kết quả chuẩn JSON.

* **Công việc cụ thể:**
  * [ ] Tạo project mới trên Supabase Cloud Dashboard, lấy API Keys.
  * [ ] Chạy DDL SQL tạo các bảng `profiles`, `wallets`, `categories`, `transactions` và thiết lập Foreign Keys.
  * [ ] Viết Database Triggers (VD: Tự động chèn dữ liệu vào bảng `profiles` khi có user đăng ký mới).
  * [ ] Cấu hình bảo mật RLS (Row Level Security) cho các bảng, đảm bảo dữ liệu user nào user nấy xem.
  * [ ] Tạo tài khoản Google AI Studio, lấy API Key Gemini 1.5 Flash.
  * [ ] Viết và deploy Supabase Edge Function (`parse-expense`) kết nối Gemini để xử lý văn bản đầu vào.
* **Yêu cầu tài nguyên:**
  * **Tài khoản Supabase:** Miễn phí (Gói Free Tier). Đăng ký bằng Github/Email.
  * **Tài khoản Google AI Studio:** Miễn phí (Để lấy API Key).
  * **Môi trường Local:** Cài Node.js/Deno, Supabase CLI, Docker (nếu cần test Edge Function local).
  * **Thẻ Visa/Mastercard:** Không yêu cầu.

### GIAI ĐOẠN 2: Khởi tạo Project Flutter & UI Cơ bản (Dự kiến: 2 tuần)
**Mục tiêu:** App chạy được trên máy ảo, thực hiện được luồng đăng nhập và quản lý (thêm/sửa/xoá) Ví và Danh mục.

* **Công việc cụ thể:**
  * [ ] Tạo Flutter project (`flutter create smart_spender`), cài đặt thư viện (`supabase_flutter`, `provider`, `google_fonts`...).
  * [ ] Tích hợp `Supabase.initialize()` vào `main.dart`.
  * [ ] Code màn hình Đăng ký / Đăng nhập (Auth UI) và xử lý luồng Auto-login.
  * [ ] Code màn hình Quản lý Danh mục (Thêm, sửa, xoá danh mục Thu/Chi).
  * [ ] Code màn hình Quản lý Ví (Form tạo/sửa Ví: chọn loại ví MBBank, MoMo, SPayLater... và nhập số dư ban đầu).
* **Yêu cầu tài nguyên:**
  * **Môi trường Local:** Cài đặt Flutter SDK, Android Studio hoặc VS Code.
  * **Máy ảo (Emulator/Simulator):** Android Emulator hoặc iOS Simulator để test giao diện.
  * **Tài khoản test:** 1-2 email ảo dùng để test tính năng Auth.

### GIAI ĐOẠN 3: Tích hợp AI (Core Feature) & Giao diện Nhập liệu (Dự kiến: 2 tuần)
**Mục tiêu:** Người dùng có thể bấm mic nói hoặc gõ text, App gọi API và hiển thị màn hình xác nhận giao dịch.

* **Công việc cụ thể:**
  * [ ] Xin quyền Microphone (Permissions) trên iOS/Android.
  * [ ] Tích hợp `speech_to_text` bắt sự kiện thu âm và chuyển giọng nói thành text real-time.
  * [ ] Viết logic gọi Supabase Edge Function (`parse-expense`) truyền text lên và nhận JSON về.
  * [ ] Thiết kế Bottom Sheet/Dialog xác nhận: Hiển thị kết quả (Số tiền, Danh mục, Nguồn tiền). Cho phép user sửa thủ công nếu AI sai.
  * [ ] Cập nhật Database: Bấm "Lưu" -> Insert vào `transactions` -> Chạy logic cập nhật lại số dư bảng `wallets`.
* **Yêu cầu tài nguyên:**
  * **Thiết bị thật (Real Device):** Smartphone Android hoặc iOS. (Bắt buộc vì Emulator thu âm micro thường hay lỗi/không chuẩn xác).

### GIAI ĐOẠN 4: Dashboard, Thống kê & Phát hành (Dự kiến: 1.5 tuần)
**Mục tiêu:** Hoàn thiện App với cái nhìn tổng quan đẹp mắt, kiểm thử toàn bộ tính năng và chuẩn bị đưa lên Store.

* **Công việc cụ thể:**
  * [ ] Code màn hình Home (Dashboard): Hiển thị Card tổng số dư, danh sách Ví và danh sách giao dịch gần đây.
  * [ ] Tích hợp `fl_chart` vẽ biểu đồ tròn/cột phân bổ chi tiêu theo danh mục.
  * [ ] Kiểm thử End-to-End: Test các câu thoại phức tạp, test thanh toán bằng thẻ tín dụng/trả sau.
  * [ ] Thiết kế App Icon, Splash Screen (màn hình chờ) và cấu hình Package Name.
  * [ ] Build file cài đặt (`.aab` cho Android, `.ipa` cho iOS).
  * [ ] Tạo app trên Console, điền thông tin Store Listing và Submit review.
* **Yêu cầu tài nguyên:**
  * **Google Play Console:** Phí đăng ký $25 (Thanh toán 1 lần trọn đời). Cần thẻ Visa/Mastercard chính chủ và CCCD.
  * **Apple Developer (Tùy chọn):** Phí $99/năm. Cần máy Mac để build và thẻ Visa/Mastercard.
  * **Công cụ Design:** Tài khoản Figma/Canva để thiết kế Screenshots, banner đưa lên App Store / Play Store.