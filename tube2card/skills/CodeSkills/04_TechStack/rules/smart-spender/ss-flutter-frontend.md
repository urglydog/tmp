# Smart Spender — Flutter Mobile Rules

> Stack rules cho Flutter frontend. Dùng khi viết Dart code, tạo widget, quản lý state.

## Project Structure

```
lib/
├── main.dart                    # Entry point, Supabase init
├── app.dart                     # MaterialApp, routing
├── core/
│   ├── constants/               # Colors, sizes, strings
│   ├── theme/                   # ThemeData, dark/light
│   ├── utils/                   # Formatters, validators
│   ├── l10n/                    # i18n: arb files, generated
│   └── services/
│       ├── supabase_service.dart
│       └── ai_service.dart      # Edge Function calls
├── features/
│   ├── auth/
│   │   ├── data/                # Repositories
│   │   ├── domain/              # Models, use cases
│   │   └── presentation/        # Screens, widgets, bloc/provider
│   ├── wallet/
│   ├── transaction/
│   ├── category/
│   ├── dashboard/
│   ├── budget/
│   ├── recurring/
│   └── settings/
└── shared/
    ├── widgets/                 # Reusable UI components
    └── models/                  # Shared data models
```

## Conventions

### Naming
- **Files:** snake_case (`wallet_screen.dart`, `transaction_model.dart`)
- **Classes:** PascalCase (`WalletScreen`, `TransactionModel`)
- **Variables/Functions:** camelCase (`getUserWallets`, `totalBalance`)
- **Constants:** camelCase or SCREAMING_SNAKE for true constants

### State Management
- **Preferred:** `flutter_bloc` (Cubit cho đơn giản, Bloc cho complex)
- **Alternative:** `provider` nếu đội muốn lightweight
- **Quy tắc:** 1 Bloc/Cubit per feature, không share state giữa features trừ qua repository

### Navigation
- Dùng `go_router` với declarative routing
- Routes define trong `app.dart`

### Error Handling
- Dùng `Either` pattern hoặc sealed class Result
- Không swallow exceptions
- UI luôn hiển thị error state (không blank screen)

### i18n
- Dùng `flutter_localizations` + `intl` + ARB files
- Mọi string hiển thị PHẢI qua `AppLocalizations.of(context)`
- Không hard-code string tiếng Việt/Anh trong widget

### Formatting
- Currency: `NumberFormat.currency(locale: locale, symbol: symbol)`
- Date: `DateFormat.yMMMd(locale)` 
- Amount input: cho phép "30k", "5tr" → convert trước khi gửi API
