# LMS Prototype - Phase 1 Build Plan

> **Version:** 1.0  
> **Created:** January 5, 2026  
> **Status:** Planning

---

## Executive Summary

This document outlines the plan for building an LMS (Learning Management System) prototype from scratch. Phase 1 focuses on five core modules that form the foundation of the system: **Users, Trainings, Compliance, Library, and Notifications**.

### Recommended Build Order

```
Foundation → Users & Permissions → Trainings → Compliance → Library → Notifications
```

This sequence ensures each module has its dependencies ready before development begins.

---

## Tech Stack

| Category | Technology | Notes |
|----------|------------|-------|
| **Framework** | Next.js 14 (App Router) | React-based with file-system routing |
| **Language** | TypeScript | Strict mode enabled |
| **Styling** | TailwindCSS | Utility-first CSS framework |
| **State Management** | Zustand | Lightweight in-memory store with persistence |
| **Icons** | Lucide React | Consistent icon library |
| **Storage** | In-memory (prototype) | No database required for demo |

---

## Module Overview

| Module | Purpose | Key Features |
|--------|---------|--------------|
| **Users** | Manage employees, roles, and organizational structure | User CRUD, Roles (Admin/Manager/Learner), Sites & Departments, Permissions |
| **Trainings** | Define training requirements and who needs them | Training requirements, Assignment rules, Retrain intervals |
| **Compliance** | Track who completed what and surface gaps | Completion tracking, Status calculations, Dashboards, Reports |
| **Library** | Store and organize training materials | Document repository, SDS sheets, Search & tagging |
| **Notifications** | Communicate reminders and escalations | Automated reminders, Escalation rules, Personalized messaging |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FOUNDATION                               │
│                (Project Setup, Data Models, Store)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USERS & PERMISSIONS                           │
│         (User Management, Roles, Org Hierarchy)                  │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
┌───────────────────────────────┐   ┌─────────────────────────────┐
│          TRAININGS            │   │          LIBRARY            │
│   (Requirements, Assignments) │   │   (Documents, SDS Sheets)   │
└───────────────────────────────┘   └─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        COMPLIANCE                                │
│       (Completion Tracking, Status, Reports, Dashboard)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       NOTIFICATIONS                              │
│           (Reminders, Escalations, Composer)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models

Core entities and their relationships:

| Entity | Key Fields | Relationships |
|--------|------------|---------------|
| **User** | id, firstName, lastName, email, role, siteId, departmentId | Belongs to Site, Department; Has many Completions |
| **Site** | id, name, orgId | Belongs to Organization; Has many Departments, Users |
| **Department** | id, name, siteId | Belongs to Site; Has many Users |
| **Training** | id, name, description, retrainIntervalDays, assignmentRules | Has many Completions; Links to Courses |
| **Course** | id, title, description, lessons[], policy | Has many Lessons; Linked to Training |
| **Completion** | id, userId, trainingId, status, dueAt, completedAt | Belongs to User, Training |
| **Notification** | id, subject, body, recipients[], sentAt, status | Has many Recipients (Users) |
| **LibraryItem** | id, title, type, url, tags[], siteId | Scoped to Site (optional) |

**Status Enums:**
- **Completion Status:** ASSIGNED, IN_PROGRESS, COMPLETED, OVERDUE, EXEMPT
- **User Role:** Admin, Manager, Learner
- **Notification Status:** DRAFT, SENT, SCHEDULED

---

## Module Details

### Module 1: Foundation

**Objective:** Establish the technical foundation for the entire system.

**Deliverables:**
- Project setup (Next.js, TypeScript, TailwindCSS)
- Core data models and type definitions
- In-memory data store with reactive updates
- Base UI component library (Buttons, Cards, Tables, Modals)
- Admin and Learner layout templates
- Demo seed data

---

### Module 2: Users & Permissions

**Objective:** Enable management of users, roles, and organizational structure.

**Features:**
- **User Management**
  - Create, edit, view, deactivate users
  - Search and filter by role, site, department
  - User profile pages

- **Roles & Permissions**
  - Three roles: Admin, Manager, Learner
  - Role-based access control
  - Permission checks throughout the system

- **Organization Hierarchy**
  - Organization → Sites → Departments
  - Scope filtering (view data by site/department)
  - Manager-to-team relationships

**UI Pages:**
- `/admin/users` - User list
- `/admin/users/[id]` - User detail/edit

---

### Module 3: Trainings

**Objective:** Define what training requirements exist and who needs to complete them.

**Features:**
- **Training Requirements**
  - Create and manage training definitions
  - Link to regulatory standards (OSHA references)
  - Set retrain intervals (e.g., annual recertification)
  - Assign owner/responsible manager

- **Assignment Rules**
  - Assign by role (all Learners, all Managers)
  - Assign by site (Plant A employees)
  - Assign by department (Maintenance team)
  - Assign to specific individuals

**UI Pages:**
- `/admin/trainings` - Training requirements list
- Training create/edit modal with assignment rule builder

---

### Module 4: Compliance

**Objective:** Track completion status and surface compliance gaps. This is the core value of the system.

**Features:**
- **Completion Tracking**
  - Status: Assigned, Completed, Overdue, Exempt
  - Due dates and overdue calculations
  - Proof of completion (file upload)
  - Exemption management with attestation

- **Compliance Dashboard**
  - Filterable table (Site, Department, Training, Status)
  - Search by employee name
  - Compliance metrics (rate, overdue count, due soon)
  - Bulk actions (Mark Complete, Set Exempt, Send Reminder)

- **Reporting**
  - Export to CSV
  - Audit snapshots (save current view for records)
  - Change history log

- **Historic Data Import**
  - CSV upload for legacy completion records
  - Validation and error reporting

**UI Pages:**
- `/admin/compliance` - Main compliance dashboard
- `/admin/reports/audits` - Saved audit snapshots

---

### Module 5: Library

**Objective:** Centralized repository for training materials and safety documents.

**Features:**
- **Document Management**
  - Upload files (PDF, PPT, DOC, images, videos)
  - Add external links (YouTube, SharePoint, etc.)
  - Tag and categorize items
  - Search and filter

- **Organization**
  - Categories and tags
  - Scope by site/department
  - Version tracking
  - Archive functionality

**UI Pages:**
- `/admin/library` - Library browser with grid/list view
- Upload modal with drag-and-drop

---

### Module 6: Notifications

**Objective:** Automated and manual communication to keep training on track.

**Features:**
- **Reminder Rules**
  - Upcoming due reminders (e.g., 7 days before)
  - Overdue reminders
  - Retraining reminders (before expiration)
  - Enable/disable individual rules

- **Escalation**
  - Auto-escalate to manager after X days overdue
  - Escalation logging

- **Notification Composer**
  - Search and select recipients
  - Template variables for personalization (name, overdue count, etc.)
  - Tone presets (Friendly, Direct, Escalation, Praise)
  - Live preview per recipient
  - Bulk send

- **Notification History**
  - Log of all sent notifications
  - Filter by date, recipient, type

**UI Pages:**
- `/admin/notifications` - Notification history
- `/admin/settings/notifications` - Reminder rule configuration
- Notification composer modal

---

## Roles & Permissions Summary

| Capability | Admin | Manager | Learner |
|------------|:-----:|:-------:|:-------:|
| **Users** |
| View all users | ✓ | ✓ (team only) | ✗ |
| Create/edit users | ✓ | ✗ | ✗ |
| Deactivate users | ✓ | ✗ | ✗ |
| **Trainings** |
| View trainings | ✓ | ✓ | ✓ (assigned) |
| Create/edit trainings | ✓ | ✗ | ✗ |
| **Compliance** |
| View all compliance | ✓ | ✗ | ✗ |
| View team compliance | ✓ | ✓ | ✗ |
| View own compliance | ✓ | ✓ | ✓ |
| Mark complete | ✓ | ✓ (team) | ✗ |
| Set exemptions | ✓ | ✗ | ✗ |
| **Library** |
| View library | ✓ | ✓ | ✓ |
| Upload/manage | ✓ | ✗ | ✗ |
| **Notifications** |
| Send notifications | ✓ | ✓ | ✗ |
| Configure rules | ✓ | ✗ | ✗ |
| **Reports** |
| Run reports | ✓ | ✓ | ✗ |
| Export data | ✓ | ✓ | ✗ |
| **Settings** |
| Manage settings | ✓ | ✗ | ✗ |

---

## Key Dependencies

1. **Users must be built first** — All other modules reference users for ownership, assignments, and permissions

2. **Trainings before Compliance** — Completion records reference training requirements

3. **Compliance before Notifications** — Reminders are triggered by compliance status (upcoming, overdue)

4. **Library is independent** — Can be developed in parallel with Compliance

---

## Out of Scope

The following are explicitly **not included** in this prototype:

- **Real database** — Using in-memory store for demo purposes
- **Authentication/SSO** — Role switching via UI selector instead
- **Email delivery** — Notifications are in-app only
- **Mobile app** — Web-only, though responsive design is included
- **Multi-language (i18n)** — English only
- **Real file storage** — Files stored locally in /public/uploads
- **Production deployment** — Local development environment only
- **SCORM/xAPI integration** — No external LMS content standards

---

## Environment Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation
```bash
cd "LMS Prototype"
npm install
npm run dev
```

### Access
- **Local URL:** http://localhost:3000
- **Admin Dashboard:** /admin
- **Learner Portal:** /learner

### Demo Credentials
No login required — use the role selector in the header to switch between Admin, Manager, and Learner views.

---

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload` | POST | File uploads (images, documents, videos) |
| `/api/ai/generate-quiz` | POST | AI-powered quiz generation from course content |

*Note: Most data operations use the in-memory Zustand store directly, not API routes.*

---

## Demo Data Requirements

To enable realistic testing and demonstrations:

### Organization Structure
- 1 Organization
- 2 Sites (Plant A, Plant B)
- 3 Departments per site (Warehouse, Packaging, Maintenance)

### Users
- 1 Admin
- 5-6 Managers (mix of site-level and department-level)
- 15-20 Learners distributed across sites and departments

### Training Requirements
- 4-6 trainings (Forklift Safety, PPE Basics, Lockout/Tagout, Fire Safety)
- Various assignment rules demonstrating role, site, and department targeting

### Completion Records
- Mix of all statuses (Assigned, Completed, Overdue, Exempt)
- Various due dates (past, upcoming, future)
- Some with proof files, some with exemptions

---

## Success Criteria

Phase 1 is complete when:

- [ ] Admin can manage users with role-based permissions
- [ ] Admin can create training requirements with assignment rules
- [ ] System correctly assigns trainings to users based on rules
- [ ] Compliance dashboard shows accurate status for all completions
- [ ] Admin can mark completions, set exemptions, and run reports
- [ ] Library allows upload, search, and organization of documents
- [ ] Reminder system can identify and notify about upcoming/overdue trainings

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Role switching works correctly (Admin → Manager → Learner)
- [ ] Scope filtering shows appropriate data per site/department
- [ ] CRUD operations persist across page refreshes
- [ ] Compliance status calculations are accurate
- [ ] File uploads work for supported formats
- [ ] Notifications appear in recipient's inbox
- [ ] CSV export downloads valid files

### Key User Flows to Verify
1. **Admin creates training** → Assigns to department → Users see it in their dashboard
2. **Admin marks completion** → Status updates → Compliance rate changes
3. **Manager sends reminder** → Notification appears in learner's inbox
4. **Learner completes course** → Progress tracked → Certificate available
5. **Admin imports CSV** → Historic records created → Audit log updated

### Browser Support
Tested on latest versions of Chrome, Safari, Firefox, and Edge.

---

## Glossary

| Term | Definition |
|------|------------|
| **Training** | A compliance requirement that users must complete (e.g., "Forklift Safety Certification") |
| **Course** | The actual content — lessons, quizzes, videos — that fulfills a training requirement |
| **Completion** | A record linking a user to a training, tracking their status and due date |
| **Exemption** | Formal exclusion from a training requirement with documented reason |
| **Compliance Rate** | Percentage of assigned trainings that are completed (not overdue) |
| **Retrain Interval** | How often a training must be renewed (e.g., annually) |
| **Scope** | Filter that limits data visibility by site or department |
| **Assignment Rule** | Logic that automatically assigns training to users (by role, site, department, or individual) |
| **Escalation** | Automatic notification to manager when a learner is overdue |
| **SDS** | Safety Data Sheet — standardized document for chemical hazard information |

---

## Next Steps

1. **Finalize** this plan with stakeholder review
2. **Set up** project repository and development environment
3. **Begin** Foundation phase
4. **Schedule** regular check-ins to track progress

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 5, 2026 | — | Initial plan |

