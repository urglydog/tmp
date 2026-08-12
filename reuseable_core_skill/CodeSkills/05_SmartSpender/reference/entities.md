# Smart Spender — Entities Reference

> Schema tham chiếu nhanh. Chi tiết đầy đủ tại `ss-domain-model` skill.

## Relationships Diagram

```
profiles ──1:N── wallets ──1:N── transactions
profiles ──1:N── categories ──1:N── transactions
profiles ──1:N── budgets
profiles ──1:N── recurring_transactions ──1:N── transactions
wallets ──1:N── recurring_transactions
categories ──1:N── budgets
categories ──1:N── recurring_transactions
```

## Entity Summary

| Entity | Columns | PK | FK | Key Constraints |
|--------|---------|----|----|-----------------|
| profiles | 7 | id (UUID) | auth.users | - |
| wallets | 13 | id (UUID) | user_id→profiles | type CHECK, balance NUMERIC(15,2) |
| categories | 9 | id (UUID) | user_id→profiles | UNIQUE(user_id,name,type) |
| transactions | 13 | id (UUID) | user_id, wallet_id, category_id, recurring_id | amount>0, type CHECK |
| budgets | 7 | id (UUID) | user_id, category_id | UNIQUE(user_id,category_id,month,year) |
| recurring_transactions | 14 | id (UUID) | user_id, wallet_id, category_id | frequency CHECK, FOR UPDATE SKIP LOCKED |
