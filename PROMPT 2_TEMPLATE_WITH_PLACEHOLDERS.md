# CREATE ENTERPRISE SKILLS SYSTEM — FROM ANALYSIS

I have analyzed the project and created: `{PROJECT_FOLDER}_PROJECT_ANALYSIS.md`

**Task:** Create a complete enterprise skills system for {PROJECT_NAME} using that analysis.

## Input
- **Analysis File:** {PROJECT_FOLDER}_PROJECT_ANALYSIS.md (contains project details)
- **Reusable Core:** reuseable_core_skill/ (01_Workflow, 02_Design, 03_Quality, community, etc.)
- **Target Repository:** {PROJECT_FOLDER}/ (where skills system will be created)

## Project Details (From Analysis)
- **Project Name:** {PROJECT_NAME}
- **Tech Stack:** {TECHNOLOGY_STACK}
- **Estimated Use Cases:** {USECASE_ESTIMATE} 
- **Estimated Entities:** {ENTITIES_ESTIMATE}
- **Estimated Business Rules:** {BUSINESS_RULES_ESTIMATE} in groups: {BUSINESS_RULE_GROUPS}

---

## What To Create

### 1. Copy Reusable Core
Copy these folders from `reuseable_core_skill/` to `{PROJECT_FOLDER}/Skills/`:
- `CodeSkills/01_Workflow/`
- `CodeSkills/02_UI_UX_Design/`
- `CodeSkills/03_EngineeringQuality/`
- `CodeSkills/04_TechStack/rules/community/`
- `DiagramSkills/`
- `scripts/`

### 2. Create Domain-Specific Stack Rules

**Location:** `{PROJECT_FOLDER}/Skills/CodeSkills/04_TechStack/rules/{project-slug}/`

Files to create based on tech stack {BACKEND_FRAMEWORK}:
- `{project-slug}-backend-rules.md` — {BACKEND_FRAMEWORK} conventions, patterns, best practices
- `{project-slug}-frontend-rules.md` — {FRONTEND_FRAMEWORK} conventions, patterns (if applicable)
- `{project-slug}-database-rules.md` — {DATABASE_TYPE} patterns, migrations, indexing

### 3. Create Domain Skills

**Location:** `{PROJECT_FOLDER}/Skills/CodeSkills/05_{PROJECT_SLUG}/skills/`

**MUST CREATE - Core Domain Skills:**

#### 3.1 {project-slug}-usecase-map
**File:** `{project-slug}-usecase-map/SKILL.md`

Document all {USECASE_ESTIMATE} use cases extracted from {REPOSITORY_STRUCTURE}.

Map each UC to: Actors, Entities touched, Business rules triggered.

Example from analysis:
{USECASE_SAMPLE_LIST}

#### 3.2 {project-slug}-domain-model
**File:** `{project-slug}-domain-model/SKILL.md`

Document all {ENTITIES_ESTIMATE} entities with fields and relationships.

Core entities from {ENTITIES_LOCATION}:
{ENTITIES_SAMPLE_LIST}

Relationships:
{ENTITIES_RELATIONSHIPS_SAMPLE}

#### 3.3 {project-slug}-business-rules
**File:** `{project-slug}-business-rules/SKILL.md`

Document all {BUSINESS_RULES_ESTIMATE} business rules organized by groups:
{BUSINESS_RULE_GROUPS}

Each rule should include: When, Then, Result, Exceptions.

Examples from analysis:
{BUSINESS_RULES_SAMPLE}

**Optional - Additional Domain Skills (if time permits):**

#### 3.4 {project-slug}-special-features
**File:** `{project-slug}-special-features/SKILL.md`
- {SPECIAL_FEATURES_LIST}

#### 3.5 {project-slug}-integrations
**File:** `{project-slug}-integrations/SKILL.md`
- External integrations: {EXTERNAL_SERVICES}
- OAuth patterns: {OAUTH_SERVICES}
- API integrations: {API_INTEGRATIONS}

### 4. Create Reference Tables

**Location:** `{PROJECT_FOLDER}/Skills/CodeSkills/05_{PROJECT_SLUG}/reference/`

#### 4.1 usecases.md
Complete list of all {USECASE_ESTIMATE} use cases with:
- Actor
- Entities touched
- Business rules triggered
- Related features

From analysis section: {USECASE_LOCATION}

#### 4.2 entities.md
Complete list of all {ENTITIES_ESTIMATE} entities with:
- Field definitions
- Relationships (1-to-N, M-to-N, etc.)
- Constraints (UNIQUE, FK, NOT NULL)

From analysis section: {ENTITIES_LOCATION}

#### 4.3 business-rules.md
Complete reference of all {BUSINESS_RULES_ESTIMATE} rules organized by:
{BUSINESS_RULE_GROUPS}

From analysis section: {BUSINESS_RULES_LOCATION}

#### 4.4 architecture.md
System overview including:
{ARCHITECTURE_COMPONENTS}

### 5. Create Configuration Files

#### 5.1 `{PROJECT_FOLDER}/Skills/skills-map.json`

Map skills with {project-slug}- prefix and reusable skills.

Core domain skills:
- {project-slug}-usecase-map
- {project-slug}-domain-model
- {project-slug}-business-rules
- (and optional skills if created)

Reusable skills:
- brainstorming
- test-driven-development
- code-review-and-quality
- (and others from 01_Workflow, 03_EngineeringQuality)

#### 5.2 `{PROJECT_FOLDER}/.claude/CLAUDE.md`

```markdown
# CLAUDE CODE — {PROJECT_NAME}

## Skill Routing

1. **Prefer native skills.** They're in `.claude/skills/` with `{project-slug}-` prefix.
2. **Domain work starts at `{project-slug}-usecase-map`** — maps all {USECASE_ESTIMATE} use cases.
3. **Budget: at most 3 skill files per task.**

## Regenerating the router

```powershell
powershell -ExecutionPolicy Bypass -File Skills/scripts/sync-skills.ps1
```

## Project Stack

- **Backend:** {BACKEND_FRAMEWORK}
- **Frontend:** {FRONTEND_FRAMEWORK}
- **Databases:** {DATABASE_TYPE}
- **Key Services:** {EXTERNAL_SERVICES}
- **Deployment:** {DEPLOYMENT_TYPE}
```

#### 5.3 `{PROJECT_FOLDER}/.claude/AGENTS.md`
(Copy from reuseable_core_skill/ or template)

### 6. Auto-Generate & Verify

```bash
cd {PROJECT_FOLDER}/Skills/scripts/

# PowerShell
./sync-skills.ps1

# Or Bash
bash sync-skills.sh
```

Verify:
- ✓ `.claude/skills/` has 20+ native skills
- ✓ `SKILLS_INDEX.md` was generated
- ✓ All file paths in `skills-map.json` exist

## Deliverables

✓ {USECASE_ESTIMATE} use cases documented  
✓ {ENTITIES_ESTIMATE} entities mapped  
✓ {BUSINESS_RULES_ESTIMATE} business rules catalogued  
✓ Stack rules for {TECHNOLOGY_STACK}  
✓ Router system generated  

## Next Steps (For You)

- Review generated skills
- Test: `Skill("{project-slug}-usecase-map")`
- Make adjustments if needed
- Commit when ready

**Done!** Skills system ready to use.
