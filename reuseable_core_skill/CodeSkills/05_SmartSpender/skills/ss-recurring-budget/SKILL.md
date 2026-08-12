---
name: ss-recurring-budget
description: "Giao dịch định kỳ tự động (Cron) + Hệ thống ngân sách theo danh mục/tháng. Dùng cho UC-18 đến UC-23, viết cron logic, hoặc budget monitoring."
---

# Smart Spender — Recurring Transactions & Budget System

> **Khi nào dùng:** Làm việc với giao dịch định kỳ, cron jobs, budget alerts, hoặc Supabase Database Functions/pg_cron.

---

## 1. RECURRING TRANSACTIONS

### Cron Execution Flow

```
pg_cron hoặc Supabase Edge Function (scheduled)
  │
  ├── 00:00 UTC+7 hàng ngày
  │
  └── SELECT * FROM recurring_transactions
      WHERE next_run_date = CURRENT_DATE AND is_active = true
         │
         FOR EACH row:
         │
         ├── BEGIN TRANSACTION
         │   ├── INSERT INTO transactions (from recurring data)
         │   ├── UPDATE wallets SET balance = balance -/+ amount
         │   └── UPDATE recurring SET next_run_date = calculate_next(frequency)
         │   COMMIT
         │
         └── IF wallet.balance < 0:
             └── Insert notification record (push later)
```

### Calculate next_run_date

```sql
-- monthly: next_run_date + INTERVAL '1 month'
-- weekly: next_run_date + INTERVAL '1 week'
-- daily: next_run_date + INTERVAL '1 day'
-- yearly: next_run_date + INTERVAL '1 year'
-- Edge case: day_of_month = 31, tháng chỉ có 30 ngày → dùng ngày cuối tháng
```

### User Actions

| Action | Logic | BR |
|--------|-------|-----|
| **Skip once** | next_run_date += interval, KHÔNG insert transaction | BR-REC-04 |
| **Cancel** | is_active = false | BR-REC-05 |
| **Edit** | Update amount/wallet/category, giữ next_run_date. Áp dụng từ lần chạy tiếp | BR-REC-06 |

### Stored Procedure (PostgreSQL)

```sql
CREATE OR REPLACE FUNCTION execute_recurring_transactions()
RETURNS void AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT * FROM recurring_transactions
    WHERE next_run_date = CURRENT_DATE AND is_active = true
    FOR UPDATE SKIP LOCKED  -- prevent double execution
  LOOP
    -- Insert transaction
    INSERT INTO transactions (user_id, wallet_id, category_id, type, amount, note, recurring_id, transaction_date)
    VALUES (rec.user_id, rec.wallet_id, rec.category_id, rec.type, rec.amount, rec.note, rec.id, CURRENT_DATE);

    -- Update wallet balance
    IF rec.type = 'Expense' THEN
      UPDATE wallets SET balance = balance - rec.amount WHERE id = rec.wallet_id;
    ELSE
      UPDATE wallets SET balance = balance + rec.amount WHERE id = rec.wallet_id;
    END IF;

    -- Calculate next run date
    UPDATE recurring_transactions SET
      next_run_date = CASE rec.frequency
        WHEN 'daily' THEN next_run_date + INTERVAL '1 day'
        WHEN 'weekly' THEN next_run_date + INTERVAL '1 week'
        WHEN 'monthly' THEN next_run_date + INTERVAL '1 month'
        WHEN 'yearly' THEN next_run_date + INTERVAL '1 year'
      END,
      updated_at = now()
    WHERE id = rec.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

---

## 2. BUDGET SYSTEM

### Budget Check Flow

```
After EVERY expense transaction (insert/update):
  │
  ├── Get category_id from transaction
  ├── Get budget for (user_id, category_id, current_month, current_year)
  │
  ├── IF no budget → skip
  │
  ├── SUM(amount) FROM transactions
  │   WHERE user_id AND category_id AND type='Expense'
  │   AND EXTRACT(MONTH FROM transaction_date) = current_month
  │   AND EXTRACT(YEAR FROM transaction_date) = current_year
  │   AND is_deleted = false
  │
  ├── ratio = total_spent / budget.amount
  │
  ├── IF ratio >= 1.0 → ALERT "Vượt ngân sách!"    (BR-BUD-03)
  ├── ELIF ratio >= 0.8 → WARNING "Gần hết ngân sách" (BR-BUD-02)
  └── ELSE → no notification
```

### Budget Query Helper

```sql
-- Lấy tổng chi tiêu theo category trong tháng
CREATE OR REPLACE FUNCTION get_category_spending(
  p_user_id UUID, p_category_id UUID, p_month INT, p_year INT
)
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM transactions
  WHERE user_id = p_user_id
    AND category_id = p_category_id
    AND type = 'Expense'
    AND EXTRACT(MONTH FROM transaction_date) = p_month
    AND EXTRACT(YEAR FROM transaction_date) = p_year
    AND is_deleted = false;
$$ LANGUAGE sql STABLE;
```

### Dashboard Budget Card

```
Hiển thị cho mỗi category có budget:
┌──────────────────────────────────────┐
│ 🍔 Ăn uống         2.5M / 3M (83%) │
│ ████████████████░░░░                 │ ← progress bar (orange ≥80%)
│ 🛒 Mua sắm          800K / 2M (40%) │
│ ████████░░░░░░░░░░░░                 │ ← progress bar (green <80%)
└──────────────────────────────────────┘
```
