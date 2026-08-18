# SKILLS INDEX — Smart Spender

> Auto-generated from `skills-map.json`. Do NOT edit by hand.

## 🎯 Domain Skills (05_SmartSpender)

| Skill | Mô tả | File |
|-------|--------|------|
| `ss-usecase-map` | 24 use cases → actors, entities, BR | CodeSkills/05_SmartSpender/skills/ss-usecase-map/SKILL.md |
| `ss-domain-model` | 6 entities PostgreSQL, schema, relationships | CodeSkills/05_SmartSpender/skills/ss-domain-model/SKILL.md |
| `ss-business-rules` | 30 BR theo 8 nhóm (AUTH, WAL, CAT, TXN, AI, BUD, REC, RLS) | CodeSkills/05_SmartSpender/skills/ss-business-rules/SKILL.md |
| `ss-ai-parsing` | Pipeline Voice/Text → Gemini → Confirmation → Save | CodeSkills/05_SmartSpender/skills/ss-ai-parsing/SKILL.md |
| `ss-recurring-budget` | Giao dịch định kỳ (pg_cron) + budget monitoring | CodeSkills/05_SmartSpender/skills/ss-recurring-budget/SKILL.md |

## 🔧 Tech Stack Rules (04_TechStack)

| Skill | Mô tả | File |
|-------|--------|------|
| `ss-flutter-rules` | Flutter conventions, feature-first structure, BLoC, i18n | CodeSkills/04_TechStack/rules/smart-spender/ss-flutter-frontend.md |
| `ss-supabase-rules` | Supabase Auth, RLS, Edge Functions, PostgreSQL patterns | CodeSkills/04_TechStack/rules/smart-spender/ss-supabase-backend.md |

## 🔄 Workflow Skills (01_Workflow)

| Skill | Mô tả | File |
|-------|--------|------|
| `ss-brainstorming` | Explore idea → design → spec → approve | 01_Workflow/skills/brainstorming/SKILL.md |
| `ss-writing-plans` | Spec → ordered implementation plan | 01_Workflow/skills/writing-plans/SKILL.md |
| `ss-tdd` | RED → GREEN → REFACTOR cycle | 01_Workflow/skills/test-driven-development/SKILL.md |
| `ss-debug` | Systematic root cause analysis | 01_Workflow/skills/systematic-debugging/SKILL.md |
| `ss-verify` | Prove work is done before commit | 01_Workflow/skills/verification-before-completion/SKILL.md |

## 🎨 UI/UX Design Skills (02_UI_UX_Design)

| Skill | Mô tả | File |
|-------|--------|------|
| `ss-ui-ux-pro-max` | Design database: styles, palettes, fonts, UX | 02_UI_UX_Design/ui-ux-pro-max-skill/.claude/skills/ |
| `ss-design-system` | Design tokens, spacing, component variants | 02_UI_UX_Design/ui-ux-pro-max-skill/.claude/skills/ |
| `ss-design-taste` | Anti-slop visual direction | 02_UI_UX_Design/taste-skill/skills/ |

## ⚙️ Engineering Quality Skills (03_EngineeringQuality)

| Skill | Mô tả | File |
|-------|--------|------|
| `ss-security` | OWASP, input validation, auth hardening | 03_EngineeringQuality/skills/security-and-hardening/SKILL.md |
| `ss-performance` | Query optimization, caching, profiling | 03_EngineeringQuality/skills/performance-optimization/SKILL.md |
| `ss-api-design` | Edge Function endpoints, DTOs, error handling | 03_EngineeringQuality/skills/api-and-interface-design/SKILL.md |
| `ss-frontend-ui` | Accessible responsive UI engineering | 03_EngineeringQuality/skills/frontend-ui-engineering/SKILL.md |
| `ss-code-review` | Multi-axis code review | 03_EngineeringQuality/skills/code-review-and-quality/SKILL.md |
| `ss-incremental` | Ship in small verified slices | 03_EngineeringQuality/skills/incremental-implementation/SKILL.md |

## 📊 Diagram Skills

| Skill | File |
|-------|------|
| drawio-activity-align | DiagramSkills/drawio-activity-align/SKILL.md |
| drawio-architecture-align | DiagramSkills/drawio-architecture-align/SKILL.md |
| drawio-class-align | DiagramSkills/drawio-class-align/SKILL.md |
| drawio-sequence-align | DiagramSkills/drawio-sequence-align/SKILL.md |
| drawio-UC-align | DiagramSkills/drawio-UC-align/SKILL.md |

---

**Total: 22 pointer skills + 5 diagram skills = 27 skills**

## Skill Chain (Recommended Flow)

```
ss-brainstorming → ss-writing-plans → ss-tdd → ss-verify
                                         ↑
                                    ss-debug (khi gặp bug)
```

## Reference Documents

| File | Mô tả |
|------|--------|
| 05_SmartSpender/reference/usecases.md | Bảng tra 24 use cases |
| 05_SmartSpender/reference/entities.md | Schema summary 6 entities |
| 05_SmartSpender/reference/business-rules.md | Bảng tra 30 BR |
| 05_SmartSpender/reference/architecture.md | System architecture diagram |
