# ANALYZE PROJECT STRUCTURE FOR SKILLS SYSTEM CREATION

I have:
- `reuseable_core_skill/` — Reusable core (01_Workflow, 02_Design, 03_Quality, community, etc.)
- `{FOLDER_DIRECTORY}/` — A project repository I need to analyze

**Task:** Analyze the project repository and extract information needed to create a skills system.

## What To Analyze

### 1. Project Metadata
- **Project Name:** What is the official name?
- **Purpose:** What does this project do? (1-2 sentences)
- **Domain:** What category? (e.g., E-commerce, CMS, LMS, Data Platform, SaaS, etc.)

### 2. Repository Structure
- **Root folder name:** {FOLDER_DIRECTORY}
- **Subfolders:** What are the main directories? (List structure)
- **Key files:** What are important config files? (package.json, requirements.txt, pom.xml, manage.py, settings.py, etc.)
- **Monolith or Microservices?** (Single repo or multiple?)

### 3. Technology Stack
**Backend:**
- Language & Framework (Django, FastAPI, Spring Boot, Express, Rails, etc.)
- Version (if visible)
- Key libraries/packages
- Database (PostgreSQL, MySQL, MongoDB, etc.)
- Message queue (Celery, RabbitMQ, Kafka, etc.)
- Any other services

**Frontend:**
- Framework (React, Vue, Angular, Svelte, etc.)
- Language (JavaScript, TypeScript, etc.)
- Build tool (Webpack, Vite, etc.)
- CSS (TailwindCSS, SCSS, etc.)

**Database:**
- Type (SQL: MySQL/PostgreSQL, NoSQL: MongoDB, etc.)
- Any ORM (Django ORM, SQLAlchemy, Hibernate, JPA, etc.)

**Infrastructure:**
- Deployment (Docker, Kubernetes, etc.)
- CI/CD (GitHub Actions, Jenkins, etc.)

### 4. Project Scope

**Use Cases (~estimate):**
- List main user workflows/features (e.g., "Create project", "Upload file", "Manage users")
- Estimate total count (e.g., ~30-50 use cases)

**Data Models (~estimate):**
- List main entities (e.g., "User", "Project", "File", "Order")
- Estimate total count (e.g., ~20-40 entities)
- Show relationships if visible (e.g., "User 1-to-N Project")

**Business Rules (~estimate):**
- What are critical constraints? (e.g., "File size limits 5GB", "Only 10 projects per user")
- What are key workflows? (e.g., "Order → Payment → Shipment → Delivery")
- Estimate total count (e.g., ~30-60 rules)

### 5. Code Organization Patterns

**Backend Structure:**
- How is code organized? (Controllers, Services, Repositories, etc.?)
- Naming conventions
- Key patterns observed

**Frontend Structure:**
- Component organization
- State management (Redux, Zustand, Context, etc.?)
- Naming conventions

**Database:**
- Are there migrations?
- Is there a schema file?
- Naming patterns for tables/collections

### 6. Special Features

- Any unique integrations? (Payment, OAuth, APIs, etc.)
- Any specific workflows or state machines?
- Any async processing? (Background jobs, webhooks, etc.)
- Any complex algorithms or logic?

### 7. Team & Development Phase

- Team size (estimate)
- Development stage (Early MVP, Growing, Mature, Maintenance)
- Any existing documentation?

## Output Format

Create a markdown file named `{FOLDER_DIRECTORY}_PROJECT_ANALYSIS.md` with the following structure:

```markdown
# {PROJECT_NAME} — Project Analysis for Skills System

## Project Metadata
- **Name:** [Official project name]
- **Purpose:** [What it does, 1-2 sentences]
- **Domain:** [Category: E-commerce, LMS, CMS, SaaS, Data Platform, etc.]
- **Repository Path:** {FOLDER_DIRECTORY}/

## Repository Structure
[Show directory tree]

## Technology Stack

### Backend
- Language & Framework: [e.g., Django 3.x + DRF]
- Version: [version number if available]
- Key Libraries: [list main packages]
- Database: [PostgreSQL, MySQL, MongoDB, etc.]
- Message Queue: [if applicable]
- ORM/Query Tool: [if applicable]

### Frontend
- Framework: [React 18, Vue 3, etc.]
- Language: [JavaScript, TypeScript, etc.]
- Build Tool: [Webpack, Vite, etc.]
- Styling: [TailwindCSS, SCSS, etc.]

### Infrastructure
- Deployment: [Docker, Kubernetes, etc.]
- CI/CD: [GitHub Actions, Jenkins, etc.]

## Project Scope

### Use Cases (~estimate)
List main workflows:
- UC-XXX: [Feature name]
- UC-YYY: [Feature name]
- ...
**Total Estimate:** [N] use cases

### Data Models (~estimate)
Core entities:
- Entity1: [purpose]
- Entity2: [purpose]
- ...
**Relationships:** [e.g., Entity1 1-to-N Entity2, Entity3 M-to-N Entity4]
**Total Estimate:** [N] entities

### Business Rules (~estimate)
Key constraints and workflows:
- Rule Group 1: [description]
- Rule Group 2: [description]
- ...
**Total Estimate:** [N] rules

## Code Organization

### Backend Patterns
- Architecture: [3-tier, microservices, monolithic, etc.]
- Folder structure: [explain organization]
- Naming conventions: [classes, functions, etc.]

### Frontend Patterns
- Component organization: [tree structure]
- State management: [tool and pattern]
- Naming conventions: [files, components, etc.]

### Database Patterns
- Migrations: [if applicable, describe]
- Naming: [table/collection naming convention]
- Indexes: [if visible, key indexes]

## Special Features
[Any unique integrations, complex workflows, async processing, etc.]

## Development Context
- Team size: [estimate]
- Development stage: [MVP, Growing, Mature, etc.]
- Existing docs: [links to docs if found]

## Key File Locations (for skills reference)
- Models/Entities: [e.g., src/models/, osf/models/]
- API/Controllers: [e.g., src/api/, app/controllers/]
- Services/Business Logic: [e.g., src/services/, app/services/]
- Tests: [e.g., tests/, __tests__/]
- Configuration: [config files location]

## Summary
[Brief 1-paragraph summary of the project for context]


<!-- Tìm chỗ: {FOLDER_DIRECTORY}
<!-- Thay bằng: tên thư mục chứa cả bộ skill và dự án cần tạo skil -->