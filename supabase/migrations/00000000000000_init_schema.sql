-- Kích hoạt extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tạo bảng profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'VND',
  locale TEXT DEFAULT 'vi',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tạo bảng wallets
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Bank', 'E-Wallet', 'Credit/BNPL', 'Cash')),
  balance NUMERIC,
  monthly_budget NUMERIC,
  credit_limit NUMERIC,
  billing_date INT CHECK (billing_date >= 1 AND billing_date <= 31),
  payment_due_date INT CHECK (payment_due_date >= 1 AND payment_due_date <= 31),
  icon TEXT,
  color TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tạo bảng categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Expense', 'Income')),
  icon TEXT,
  color TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tạo bảng transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('Expense', 'Income')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  note TEXT,
  raw_input TEXT,
  input_method TEXT CHECK (input_method IN ('voice', 'text', 'manual', 'batch', 'template')),
  recurring_id UUID, -- Sẽ được cập nhật foreign key phía dưới
  is_deleted BOOLEAN DEFAULT FALSE,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tạo bảng budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  year INT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, category_id, month, year)
);

-- 6. Tạo bảng recurring_transactions
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('Expense', 'Income')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  note TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  day_of_month INT CHECK (day_of_month >= 1 AND day_of_month <= 31),
  next_run_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cập nhật khóa ngoại cho transactions tham chiếu đến recurring_transactions
ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_recurring
  FOREIGN KEY (recurring_id) REFERENCES recurring_transactions(id) ON DELETE SET NULL;

-- 7. Tạo bảng quick_templates
CREATE TABLE quick_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Expense', 'Income')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  note TEXT,
  icon TEXT,
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
