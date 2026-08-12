# 05_SmartSpender — Domain Skills

Skills chuyên biệt cho dự án **Smart Spender** (Voice & AI-Powered Multi-Wallet Expense Tracker).

## Cấu trúc

```
05_SmartSpender/
├── skills/
│   ├── ss-usecase-map/SKILL.md        — Bản đồ 24 use cases
│   ├── ss-domain-model/SKILL.md       — 6 entities + schema
│   ├── ss-business-rules/SKILL.md     — 30 business rules
│   ├── ss-ai-parsing/SKILL.md         — Pipeline Voice/Text → AI → JSON
│   └── ss-recurring-budget/SKILL.md   — Recurring transactions + Budget
├── reference/
│   ├── usecases.md
│   ├── entities.md
│   ├── business-rules.md
│   └── architecture.md
└── README.md
```

## Tech Stack
- **Mobile:** Flutter (Dart) + flutter_bloc/provider
- **Backend:** Supabase (Auth + PostgreSQL + Edge Functions)
- **AI:** Google Gemini 1.5 Flash (Structured JSON Output)
- **STT:** speech_to_text (local, on-device)
- **Charts:** fl_chart
