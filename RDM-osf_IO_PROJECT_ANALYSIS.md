# RDM-osf.io — Project Analysis for Skills System

## Project Metadata
- **Name:** RDM-osf.io (Open Science Framework Research Data Management)
- **Purpose:** A web-based platform for managing research data, facilitating open science collaboration, and enabling researchers to organize, share, and preserve their research outputs. Successor to the Center for Open Science's OSF with enhanced RDM capabilities.
- **Domain:** Research Data Management Platform / Scientific Collaboration Infrastructure
- **Repository Path:** RDM-osf_IO/ (within larger git/RDM-osf_IO workspace)

## Repository Structure

```
RDM-osf.io/
├── api/                    (51 dirs) — REST API endpoints, views, serializers
├── addons/                 (41 dirs) — Plugin system for integrations (GitHub, Dropbox, Box, etc.)
├── admin/                  (42 dirs) — Django admin customization
├── admin_tests/            (35 dirs) — Admin tests
├── api_tests/              (49 dirs) — API endpoint tests
├── osf/
│   ├── models/             (80+ models) — Core data models (Node, Project, File, User, etc.)
│   └── ...
├── osf_tests/              — Model/business logic tests
├── framework/              (22 dirs) — Core utilities, auth, middleware
├── website/                (33 dirs) — Frontend assets (HTML templates, JavaScript)
├── tests/                  (12 dirs) — General test suites
├── scripts/                — Utility scripts
├── manage.py               — Django management
├── requirements.txt        — Python dependencies
├── package.json            — Node.js dependencies
├── docker-compose.yml      — Docker orchestration
├── webpack.*.config.js     — Frontend build config
└── addons.json             — Addon registry
```

**Monolith or Microservices:** Monolithic Django application with:
- Separate microservice dependency: Waterbutler (file storage/management)
- External services: Elasticsearch (search), RabbitMQ (message queue)

## Technology Stack

### Backend
- **Language & Framework:** Python 3.x + Django 2.x + Django REST Framework (DRF)
- **Version:** OSF 20.14.0 (visible from package.json), Django likely 2.2 LTS
- **Key Libraries:**
  - Celery 4.1.1 (async task processing)
  - Flask 0.12.4 (lightweight web framework for utilities)
  - SQLAlchemy + MongoORM (database access)
  - bcrypt (password hashing)
  - Mako (templating)
  - lxml (XML parsing)
  - WTForms (form handling)
- **Databases:** 
  - MongoDB (primary data store)
  - PostgreSQL (specific features)
- **Message Queue:** RabbitMQ (via Celery, kombu, amqp)
- **ORM/Query Tool:** Django ORM + Custom MongoDB ORM + SQLAlchemy

### Frontend
- **Framework:** Mithril.js 0.2.0, Knockout.js 3.4.2 (older component frameworks)
- **Language:** JavaScript (ES5+, no TypeScript visible)
- **Build Tool:** Webpack 3.8.1 (with dev/prod configs)
- **Testing:** Karma + Mocha + Sinon
- **Styling:** LESS (LessCSS), Bootstrap 3.3.7
- **Key Libraries:**
  - jQuery (indirectly via other libs)
  - Lodash (utility functions)
  - Moment.js (date manipulation)
  - Select2 (enhanced select boxes)
  - Dropzone (file uploads)
  - Markdown-it (markdown parsing)

### Infrastructure
- **Deployment:** Docker + docker-compose (seen from docker-compose.yml, Dockerfile)
- **CI/CD:** GitHub Actions (visible from .github/ folder)
- **Containerization:** Full stack in docker-compose (API, web, worker services)

## Project Scope

### Use Cases (~estimate: 40-45)
Main workflows extracted from folder/file structure:
- UC-01: User registration and authentication
- UC-02: Create research project
- UC-03: Add/manage project contributors and roles
- UC-04: Upload files to project storage
- UC-05: Organize files in folders
- UC-06: Download/access files
- UC-07: View file versions and history
- UC-08: Link external addons (GitHub, Dropbox, Box, etc.)
- UC-09: Search projects and files
- UC-10: Create project registration (frozen snapshot)
- UC-11: Withdraw registration
- UC-12: Add project description and metadata
- UC-13: Set project privacy (public/private)
- UC-14: Manage project settings
- UC-15: Create preprint
- UC-16: Manage preprint workflow
- UC-17: Add project tags
- UC-18: Comment on project/files
- UC-19: View project activity log
- UC-20: Create quick files for temporary storage
- UC-21: Export project data
- UC-22: Import project data
- UC-23: Manage user notifications
- UC-24: Configure user profile
- UC-25: Manage user institutions
- UC-26: View audit logs (admin)
- UC-27: Moderate content (admin)
- UC-28: Manage addons configuration
- UC-29: Handle file metadata
- UC-30: Manage project collections
- UC-31: Link ORCID to user account
- UC-32: Configure RDM-specific features
- UC-33: Timestamp/verify files
- UC-34: Manage user quotas/storage limits
- UC-35: Access via private links
- UC-36: Manage node relations
- UC-37: Handle sanctions (bans, suspensions)
- UC-38: Manage draft nodes
- UC-39: Handle external accounts (OAuth)
- UC-40: Export/restore data

**Total Estimate:** ~40-45 use cases

### Data Models (~estimate: 50+ entities)
Core entities (from osf/models/ directory):
- **Core Project Management:**
  - Node (base project/folder entity)
  - Project (extends Node)
  - DraftNode (work-in-progress project)
  - Preprint (preprint submission)
  - Registration (frozen project snapshot)
  
- **Files & Storage:**
  - File / BaseFile (file/folder in storage)
  - FileVersion (version history for files)
  - FileInfo (metadata about files)
  - FileLog (activity log for files)
  - QuickFiles (temporary file storage)
  - ExportData / ExportDataRestore (data exports)
  
- **Users & Permissions:**
  - User / OSFUser (user account)
  - Contributor (project contributor)
  - Institution (research institution)
  - InstitutionEntitlement (user affiliations)
  
- **Integrations & External:**
  - ExternalAccount (OAuth tokens, connected services)
  - RegionExternalAccount (storage provider accounts)
  - RdmAddons (RDM-specific addon configuration)
  - Provider (storage provider type)
  
- **Metadata & Organization:**
  - Tag (project tags)
  - Comment (comments on projects/files)
  - Citation (citation metadata)
  - Metadata (custom metadata on entities)
  - MetaSchema (metadata schema definitions)
  - Subject (project subject classification)
  - License (licensing information)
  
- **Workflow & Status:**
  - NodeLog (activity log)
  - Action (workflow actions)
  - Sanction (bans, embargoes)
  - Request (user requests like password reset)
  - PrivateLink (private access links)
  
- **Admin & Moderation:**
  - AdminLogEntry (admin action log)
  - AdminProfile (admin configuration)
  - SpamLog (spam detection log)
  - Banner (site banners/announcements)
  - RdmAnnouncement (RDM announcements)
  
- **RDM-Specific:**
  - RdmTimestampGrantPattern (timestamping configuration)
  - RdmFileTimestampTokenVerifyResult (timestamp verification)
  - RdmUserKey (user cryptographic keys)
  - RdmStatistics (RDM usage statistics)
  - ProjectLimitNumber* (quota settings)
  - ProjectStorageType (storage configuration)
  
- **Notifications & Sessions:**
  - Notification (user notifications)
  - QueuedMail (pending emails)
  - Session (user sessions)
  - DismissedAlerts (alert management)
  
- **Other:**
  - Archive (project archival)
  - Conference (conference submissions)
  - Identifier (DOI, ARK, etc.)
  - MaintenanceState (system maintenance)
  - OAuth (OAuth applications)
  - Brand (custom branding)
  - Collection (project collections)
  - NodeRelation (project relationships)
  - Chronos (scheduled tasks)
  - UserQuota (storage quotas)
  - TSK (timestamp keys)

**Relationships (Sample):**
- Node 1-to-N Contributor
- Node 1-to-N Node (parent-child hierarchy)
- Node 1-to-N File
- File 1-to-N FileVersion
- User 1-to-N Contributor
- User 1-to-N ExternalAccount
- Project 1-to-N Registration
- Preprint M-to-N Subject

**Total Estimate:** ~50-60 entities

### Business Rules (~estimate: 55-65)
Key constraints and workflows:
- **BR-PROJECT:** Project creation limits, deletion (soft delete), archival, privacy transitions
- **BR-CONTRIBUTOR:** Contributor role hierarchy (read, write, admin), permissions inheritance, contributor removal
- **BR-FILE:** File upload size limits (5GB default), versioning, soft delete, file locking, checkout mechanism
- **BR-STORAGE:** Storage quotas per user, per project, per addon, quota enforcement
- **BR-PERMISSION:** Access control based on roles, public/private visibility, private link access
- **BR-ADDON:** OAuth flow for addon linking, scope validation, token storage and refresh
- **BR-REGISTRATION:** Registration as immutable snapshot, embargo periods, withdrawal process
- **BR-PREPRINT:** Preprint submission workflow, withdrawal, provider-specific policies
- **BR-SANCTION:** Ban/suspension enforcement, access denial
- **BR-AUDIT:** Activity logging for compliance, admin audit trail
- **BR-NOTIFICATION:** Email notifications based on events, notification preferences
- **BR-DATA-EXPORT:** Export data in standard formats, restore exported projects
- **BR-INSTITUTION:** User affiliation to institutions, entitlements, SSO
- **BR-SPAM:** Spam detection and filtering
- **BR-PAYMENT:** None visible (open source), but quota system indicates usage tracking
- **BR-RDM-SPECIFIC:** Timestamping and verification, user key management, RDM announcements

**Total Estimate:** ~55-65 business rules

## Code Organization

### Backend Patterns
- **Architecture:** 3-tier monolithic
  - Controllers/Views: `api/views.py`, `api/endpoints/`
  - Services: `osf/` (models and business logic combined)
  - Repository/ORM: Django ORM + custom MongoDB ORM
  
- **Folder Structure:**
  - `api/` — REST endpoints grouped by resource (projects, files, users, registrations, etc.)
  - `osf/models/` — Data model definitions
  - `framework/` — Shared utilities, authentication, middleware
  - `addons/` — Plugin integrations (each addon is self-contained)
  - `admin/` — Django admin customization
  - `website/` — Frontend templates and assets

- **Naming Conventions:**
  - Views: `ProjectViewSet`, `FileDetailView`, `ContributorListView`
  - Models: `Node`, `Project`, `File`, `User` (CamelCase)
  - URLs: `/api/v2/nodes/{node_id}/files/`, `/api/v2/projects/`

### Frontend Patterns
- **Component Organization:** Mithril.js modules in `website/js/`
- **State Management:** Knockout.js observables, plain JavaScript objects
- **Naming Conventions:** Kebab-case for files, camelCase for functions
- **Asset Build:** Webpack with separate dev/prod configs

### Database Patterns
- **Migrations:** Django migrations in `osf/models/` (if using migrations)
- **Naming:** Tables use snake_case, collections in MongoDB use camelCase
- **Indexes:** MongoDB likely has indexes on frequently queried fields (Node ID, User ID, etc.)
- **Relationships:** Foreign keys in SQL, document references in MongoDB

## Special Features

- **Addon System:** Pluggable architecture for external service integrations (GitHub, Dropbox, Box, Google Drive, etc.)
- **Waterbutler Integration:** Separate microservice for handling file uploads/downloads
- **OAuth Flows:** Multi-addon OAuth token management with scope validation
- **Async Processing:** Celery workers for background tasks (email, data export, file processing)
- **RDM Extensions:** Enhanced with timestamping, verification, user key management
- **Elasticsearch Integration:** Full-text search across projects and files
- **Activity Logging:** Comprehensive audit trail for compliance
- **Multi-Institution Support:** Institution affiliations and SSO
- **Preprint Server:** Integrated preprint submission workflow
- **Search:** Advanced search with filters by project, contributor, file, date, etc.

## Development Context
- **Team Size:** Large (multiple teams based on folder complexity)
- **Development Stage:** Mature (20+ versions, comprehensive features)
- **Existing Docs:** README.md, CONTRIBUTING.md, CHANGELOG (likely in main repo)
- **Git History:** Rich history (visible .git folder)

## Key File Locations (for skills reference)
- **Models/Entities:** `RDM-osf.io/RDM-osf.io/osf/models/` (80+ model files)
- **API/Controllers:** `RDM-osf.io/RDM-osf.io/api/` (51 subdirectories by resource)
- **Services/Business Logic:** Mixed in `osf/models/` and `framework/`
- **Tests:** 
  - `RDM-osf.io/RDM-osf.io/api_tests/` (API tests)
  - `RDM-osf.io/RDM-osf.io/osf_tests/` (Model tests)
  - `RDM-osf.io/RDM-osf.io/tests/` (General tests)
- **Configuration:** 
  - `settings.py` (in `osf/` likely)
  - `manage.py` (Django management)
  - `docker-compose.yml` (deployment)
  - `requirements.txt` (Python deps)
  - `package.json` (Node deps)

## Summary

RDM-osf.io is a mature, enterprise-scale research data management platform built on Django + MongoDB/PostgreSQL stack. It's a monolithic application with a pluggable addon system, comprehensive REST API, and complex business logic around projects, files, contributors, permissions, and research workflows. The codebase is large (~50 entities, ~40 use cases, ~60 rules) with sophisticated features like Waterbutler integration, OAuth addon flows, Celery async processing, and RDM-specific enhancements (timestamping, verification). Frontend is traditional Mithril.js/Knockout.js with Webpack build system. Deployment is containerized with Docker Compose.

---

**Analysis Complete:** 2026-08-05  
**Analyzed By:** Automated system  
**Ready for:** PROMPT 2 - Skills System Creation
