# Smart Spender — Business Rules Reference

> Bảng tra nhanh 30 BR. Chi tiết đầy đủ tại `ss-business-rules` skill.

| BR Code | Tên ngắn | Nhóm | UC liên quan |
|---------|----------|------|-------------|
| BR-AUTH-01 | Password policy | AUTH | UC-01 |
| BR-AUTH-02 | Session 30 ngày | AUTH | UC-02,03 |
| BR-AUTH-03 | OAuth auto-profile | AUTH | UC-01,02 |
| BR-WAL-01 | Ví tối thiểu 1 | WALLET | UC-07 |
| BR-WAL-02 | Cash balance tự do | WALLET | UC-05 |
| BR-WAL-03 | Credit bắt buộc fields | WALLET | UC-05,08 |
| BR-WAL-04 | Balance atomic update | WALLET | UC-11-15 |
| BR-WAL-05 | Cảnh báo balance âm | WALLET | UC-11-13 |
| BR-WAL-06 | Cảnh báo credit 90% | WALLET | UC-17,23 |
| BR-WAL-07 | Soft-delete ví | WALLET | UC-07 |
| BR-CAT-01 | System defaults | CATEGORY | UC-01,09 |
| BR-CAT-02 | Unique name/type | CATEGORY | UC-09 |
| BR-CAT-03 | Reassign on delete | CATEGORY | UC-10 |
| BR-TXN-01 | Amount > 0 | TRANSACTION | UC-11-13 |
| BR-TXN-02 | Balance direction | TRANSACTION | UC-11-13 |
| BR-TXN-03 | Edit revert-apply | TRANSACTION | UC-14 |
| BR-TXN-04 | Delete revert | TRANSACTION | UC-15 |
| BR-TXN-05 | Audit trail | TRANSACTION | UC-11,12 |
| BR-AI-01 | Multi-parse | AI | UC-11,12 |
| BR-AI-02 | JSON schema | AI | UC-11,12 |
| BR-AI-03 | Fallback wallet | AI | UC-11,12 |
| BR-AI-04 | Fallback category | AI | UC-11,12 |
| BR-AI-05 | Confirmation required | AI | UC-11,12 |
| BR-AI-06 | Timeout & retry | AI | UC-11,12 |
| BR-AI-07 | Fuzzy matching | AI | UC-11,12 |
| BR-BUD-01 | Unique budget | BUDGET | UC-18 |
| BR-BUD-02 | Warning 80% | BUDGET | UC-19 |
| BR-BUD-03 | Alert 100% | BUDGET | UC-19 |
| BR-BUD-04 | Calendar month | BUDGET | UC-18,19 |
| BR-REC-01 | Cron schedule | RECURRING | UC-21 |
| BR-REC-02 | Auto-execute | RECURRING | UC-21 |
| BR-REC-03 | Allow negative | RECURRING | UC-21 |
| BR-REC-04 | Skip once | RECURRING | UC-22 |
| BR-REC-05 | Cancel | RECURRING | UC-22 |
| BR-REC-06 | Edit forward | RECURRING | UC-22 |
| BR-RLS-01 | Row isolation | SECURITY | ALL |
| BR-RLS-02 | Edge Function auth | SECURITY | UC-11,12 |
| BR-RLS-03 | Server-side key | SECURITY | UC-11,12 |
