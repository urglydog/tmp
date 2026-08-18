# Smart Spender — Supabase Backend Rules

> Stack rules cho Supabase (Auth + PostgreSQL + Edge Functions). Dùng khi viết SQL, RLS policy, Edge Function, hoặc database function.

## Supabase Auth

- **Methods:** Email/Password + Google OAuth
- **Session:** Auto-refresh, 30-day expiry
- **Profile trigger:** On `auth.users` INSERT → auto INSERT into `profiles`
- **Dart client:** `Supabase.instance.client.auth`

```sql
-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  -- Seed default categories
  INSERT INTO categories (user_id, name, type, icon, is_system)
  VALUES
    (NEW.id, 'Ăn uống', 'Expense', '🍔', true),
    (NEW.id, 'Di chuyển', 'Expense', '🚗', true),
    (NEW.id, 'Mua sắm', 'Expense', '🛒', true),
    (NEW.id, 'Hóa đơn', 'Expense', '📄', true),
    (NEW.id, 'Giải trí', 'Expense', '🎮', true),
    (NEW.id, 'Sức khỏe', 'Expense', '💊', true),
    (NEW.id, 'Khác', 'Expense', '📦', true),
    (NEW.id, 'Lương', 'Income', '💰', true),
    (NEW.id, 'Thu nhập khác', 'Income', '💵', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## RLS Policies

```sql
-- Pattern: mọi bảng đều có
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "{table}_user_isolation" ON {table}
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

## Edge Function Rules

- **Runtime:** Deno (TypeScript)
- **Auth:** Verify JWT trước mọi xử lý
- **Env vars:** `GEMINI_API_KEY` (never expose to client)
- **Timeout:** Set 15s max (Gemini call + processing)
- **CORS:** Allow from app domains only

```typescript
// Edge Function template
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  // 1. Verify auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401 });
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return new Response('Unauthorized', { status: 401 });
  
  // 2. Process...
});
```

## Database Conventions

- **All times:** TIMESTAMPTZ (UTC), convert to local in Flutter
- **Soft delete:** `is_deleted BOOLEAN DEFAULT false` + filter in queries
- **Audit fields:** `created_at`, `updated_at` on every table
- **UUIDs:** `gen_random_uuid()` for all PKs
- **Money:** `NUMERIC(15,2)` — NEVER use FLOAT
- **Indexes:** Trên mọi FK column + composite cho frequent queries

## Migration Naming

```
supabase/migrations/
  20260812000000_create_profiles.sql
  20260812000001_create_wallets.sql
  20260812000002_create_categories.sql
  20260812000003_create_transactions.sql
  20260812000004_create_budgets.sql
  20260812000005_create_recurring.sql
  20260812000006_rls_policies.sql
  20260812000007_functions_and_triggers.sql
  20260812000008_seed_data.sql
```
