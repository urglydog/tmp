---
name: ss-domain-model
description: "Mô hình miền Smart Spender: 7 entities, schema PostgreSQL, quan hệ, ràng buộc. Dùng khi viết migration SQL, tạo model Dart, hoặc sửa schema."
---

# Smart Spender — Domain Model

> **Khi nào dùng:** Viết/sửa schema DB, tạo Dart model class, viết RLS policy, hoặc cần biết field nào thuộc bảng nào.

---

## Entity Relationship

```
profiles 1──N wallets
profiles 1──N categories
profiles 1──N budgets
profiles 1──N recurring_transactions
profiles 1──N quick_templates
wallets  1──N transactions
wallets  1──N recurring_transactions
categories 1──N transactions
categories 1──N budgets
categories 1──N recurring_transactions
categories 1──N quick_templates
recurring_transactions 1──N transactions (via recurring_id)
```

## Entities

### 1. profiles
> Extends `auth.users`. Auto-created via trigger on signup.

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|--------|
| id | UUID | PK, FK→auth.users ON DELETE CASCADE | |
| full_name | TEXT | | Tên hiển thị |
| avatar_url | TEXT | nullable | URL ảnh đại diện |
| currency | TEXT | DEFAULT 'VND' | Đơn vị tiền tệ mặc định |
| locale | TEXT | DEFAULT 'vi' | 'vi' hoặc 'en' |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

### 2. wallets

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|--------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| user_id | UUID | FK→profiles, NOT NULL | |
| name | TEXT | NOT NULL | "MBBank", "MoMo", "Cash" |
| type | TEXT | NOT NULL, CHECK IN ('Bank','E-Wallet','Credit/BNPL','Cash') | |
| balance | NUMERIC(15,2) | nullable, DEFAULT NULL | Số dư (NULL=không track) |
| monthly_budget | NUMERIC(15,2) | nullable | Hạn mức chi tiêu/tháng (NULL=không giới hạn) |
| credit_limit | NUMERIC(15,2) | nullable | Chỉ cho Credit/BNPL |
| billing_date | INT | nullable, CHECK 1-31 | Ngày chốt sổ |
| payment_due_date | INT | nullable, CHECK 1-31 | Ngày thanh toán |
| icon | TEXT | nullable | Icon emoji hoặc asset name |
| color | TEXT | nullable | Hex color "#FF5733" |
| is_deleted | BOOLEAN | DEFAULT false | Soft-delete flag |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

**Index:** `idx_wallets_user_id` ON (user_id) WHERE is_deleted = false

### 3. categories

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|--------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| user_id | UUID | FK→profiles, nullable | NULL = system default |
| name | TEXT | NOT NULL | |
| type | TEXT | NOT NULL, CHECK IN ('Expense','Income') | |
| icon | TEXT | nullable | |
| color | TEXT | nullable | |
| is_system | BOOLEAN | DEFAULT false | true = không cho xóa |
| is_deleted | BOOLEAN | DEFAULT false | |
| created_at | TIMESTAMPTZ | DEFAULT now() | |

**Unique:** UNIQUE(user_id, name, type) WHERE is_deleted = false

### 4. transactions

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|--------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| user_id | UUID | FK→profiles, NOT NULL | |
| wallet_id | UUID | FK→wallets, NOT NULL | |
| category_id | UUID | FK→categories, NOT NULL | |
| type | TEXT | NOT NULL, CHECK IN ('Expense','Income') | |
| amount | NUMERIC(15,2) | NOT NULL, CHECK > 0 | Luôn dương |
| note | TEXT | nullable | Ghi chú |
| raw_input | TEXT | nullable | Câu nói/gõ gốc (audit) |
| input_method | TEXT | DEFAULT 'manual', CHECK IN ('voice','text','manual','batch','template') | |
| recurring_id | UUID | FK→recurring_transactions, nullable | Nếu sinh từ recurring |
| is_deleted | BOOLEAN | DEFAULT false | |
| transaction_date | DATE | NOT NULL, DEFAULT CURRENT_DATE | |
| created_at | TIMESTAMPTZ | DEFAULT now() | |

**Index:** `idx_txn_user_date` ON (user_id, transaction_date DESC) WHERE is_deleted = false
**Index:** `idx_txn_wallet` ON (wallet_id) WHERE is_deleted = false

### 5. budgets

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|--------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| user_id | UUID | FK→profiles, NOT NULL | |
| category_id | UUID | FK→categories, NOT NULL | |
| month | INT | NOT NULL, CHECK 1-12 | |
| year | INT | NOT NULL | |
| amount | NUMERIC(15,2) | NOT NULL, CHECK > 0 | |
| created_at | TIMESTAMPTZ | DEFAULT now() | |

**Unique:** UNIQUE(user_id, category_id, month, year)

### 6. recurring_transactions

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|--------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| user_id | UUID | FK→profiles, NOT NULL | |
| wallet_id | UUID | FK→wallets, NOT NULL | |
| category_id | UUID | FK→categories, NOT NULL | |
| type | TEXT | NOT NULL, CHECK IN ('Expense','Income') | |
| amount | NUMERIC(15,2) | NOT NULL, CHECK > 0 | |
| note | TEXT | nullable | |
| frequency | TEXT | NOT NULL, CHECK IN ('daily','weekly','monthly','yearly') | |
| day_of_month | INT | nullable, CHECK 1-31 | Cho monthly |
| day_of_week | INT | nullable, CHECK 0-6 | Cho weekly (0=Mon) |
| next_run_date | DATE | NOT NULL | Ngày chạy tiếp theo |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

**Index:** `idx_recurring_next_run` ON (next_run_date) WHERE is_active = true

### 7. quick_templates

| Column | Type | Constraints | Mô tả |
|--------|------|-------------|--------|
| id | UUID | PK, DEFAULT gen_random_uuid() | |
| user_id | UUID | FK→profiles, NOT NULL | |
| wallet_id | UUID | FK→wallets, nullable | NULL = user chọn khi dùng |
| category_id | UUID | FK→categories, NOT NULL | |
| type | TEXT | NOT NULL, CHECK IN ('Expense','Income') | |
| amount | NUMERIC(15,2) | NOT NULL, CHECK > 0 | |
| note | TEXT | nullable | Mô tả template |
| icon | TEXT | nullable | Icon hiển thị nhanh |
| usage_count | INT | DEFAULT 0 | Số lần sử dụng |
| last_used_at | TIMESTAMPTZ | nullable | Lần dùng gần nhất |
| created_at | TIMESTAMPTZ | DEFAULT now() | |

**Index:** `idx_templates_user_usage` ON (user_id, usage_count DESC)

---

## Quy ước đặt tên
- **Bảng:** snake_case, số nhiều (`wallets`, `categories`)
- **Cột:** snake_case (`user_id`, `created_at`)
- **FK:** `{table}_id` (ví dụ: `wallet_id`)
- **Index:** `idx_{table}_{columns}`
- **Dart Model:** PascalCase (`Wallet`, `Transaction`, `QuickTemplate`)
