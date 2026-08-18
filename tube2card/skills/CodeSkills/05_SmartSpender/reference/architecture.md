# Smart Spender — Architecture Reference

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                  Flutter App                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │   Auth    │ │  CRUD    │ │  Voice/Text AI   │ │
│  │  Screen   │ │ Screens  │ │    Input Screen  │ │
│  └────┬─────┘ └────┬─────┘ └────────┬─────────┘ │
│       │             │                │           │
│  ┌────┴─────────────┴────┐  ┌───────┴────────┐  │
│  │  Supabase Client SDK  │  │ speech_to_text  │  │
│  │  (Auth + DB + RLS)    │  │  (on-device)    │  │
│  └────────┬──────────────┘  └───────┬────────┘  │
└───────────┼─────────────────────────┼───────────┘
            │ Direct CRUD              │ Text
            │                          │
┌───────────┼──────────────────────────┼───────────┐
│           ▼          Supabase        ▼           │
│  ┌────────────────┐       ┌──────────────────┐   │
│  │  PostgreSQL    │       │  Edge Function   │   │
│  │  (6 tables)    │       │  parse-expense   │   │
│  │  + RLS         │       │  (Deno/TS)       │   │
│  │  + pg_cron     │       └────────┬─────────┘   │
│  │  + Triggers    │                │              │
│  └────────────────┘                │              │
│                                    ▼              │
│                           ┌────────────────┐     │
│                           │ Gemini 1.5     │     │
│                           │ Flash API      │     │
│                           │ (Structured    │     │
│                           │  JSON Output)  │     │
│                           └────────────────┘     │
└──────────────────────────────────────────────────┘
```

## Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Mobile | Flutter (Dart) | Latest stable |
| State Management | flutter_bloc hoặc provider | - |
| Auth | Supabase Auth | - |
| Database | Supabase PostgreSQL | 15+ |
| Serverless | Supabase Edge Functions (Deno/TS) | - |
| AI | Google Gemini 1.5 Flash | - |
| STT | speech_to_text (on-device) | - |
| Charts | fl_chart | - |
| i18n | flutter_localizations + intl | - |

## Key Packages (pubspec.yaml)

```yaml
dependencies:
  supabase_flutter: ^2.x
  flutter_bloc: ^8.x         # hoặc provider
  speech_to_text: ^6.x
  fl_chart: ^0.x
  flutter_localizations:
    sdk: flutter
  intl: ^0.x
  go_router: ^x.x            # Navigation
  google_fonts: ^x.x          # Typography
```

## Supabase Edge Function Setup

- Function name: `parse-expense`
- Runtime: Deno
- Env vars: `GEMINI_API_KEY`
- Auth: JWT validation via `supabase.auth.getUser()`

## Database Features Used

- **RLS (Row Level Security):** Tất cả bảng
- **Triggers:** Auto-create profile on auth.users insert
- **pg_cron:** Scheduled recurring transaction execution
- **Database Functions:** `execute_recurring_transactions()`, `get_category_spending()`
