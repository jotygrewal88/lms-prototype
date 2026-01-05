# LMS Prototype - Phase 1 Build Plan

> **Version:** 1.0  
> **Created:** January 5, 2026  
> **Target:** Q1 2026  
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

## Timeline

| Week | Phase | Focus Area | Deliverables |
|------|-------|------------|--------------|
| **1-2** | Foundation | Project Setup | Data models, Store architecture, Base UI components |
| **3-4** | Users | User Management | User CRUD, Role-based permissions, Org hierarchy (Sites/Depts) |
| **5-6** | Trainings | Requirements | Training CRUD, Assignment rules engine |
| **7-9** | Compliance | Core Tracking | Compliance dashboard, Reports, Historic data import |
| **10-11** | Library | Content Repository | File uploads, Search, SDS Library feature |
| **12-13** | Notifications | Communication | Reminder rules, Escalation logic, Notification composer |
| **14** | Polish | Integration | Testing, UX refinement, Bug fixes |

**Total Duration:** ~14 weeks

---

## Module Details

### Module 1: Foundation (Week 1-2)

**Objective:** Establish the technical foundation for the entire system.

**Deliverables:**
- Project setup (Next.js, TypeScript, TailwindCSS)
- Core data models and type definitions
- In-memory data store with reactive updates
- Base UI component library (Buttons, Cards, Tables, Modals)
- Admin and Learner layout templates
- Demo seed data

---

### Module 2: Users & Permissions (Week 3-4)

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

**Q1 Feature:** Permissions Hierarchy
> Rebuild flat hierarchy; custom notifications for specific roles. Align with CMMS multi-site access model.

---

### Module 3: Trainings (Week 5-6)

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

### Module 4: Compliance (Week 7-9)

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

**Q1 Features:**
- **Custom Safety Reports** - Admins create bespoke reporting templates
- **Form Visibility Toggle** - "Show All Fields" option for manual data entry

---

### Module 5: Library (Week 10-11)

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

**Q1 Feature:** SDS Library
> Full Safety Data Sheet library for chemical compliance. Special category with chemical-specific metadata and search.

---

### Module 6: Notifications (Week 12-13)

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

## Q1 Feature Roadmap Alignment

| Feature | Module | Priority | Status | Notes |
|---------|--------|----------|--------|-------|
| Custom Safety Reports | Compliance | Q1 | Not Started | Audit snapshots with saved filters |
| Permissions Hierarchy | Users | Q1 | Not Started | Multi-site access, role permissions |
| SDS Library | Library | Q1 | Not Started | Safety Data Sheet repository |
| Form Visibility Toggle | Compliance | Q1 | Not Started | "Show All Fields" for manual entry |
| UX Simplification | All | Q1 | Not Started | Reduce steps, condense CTAs |
| Location Hierarchy | Users | Q1 | Not Started | Align with CMMS (6 levels) |

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
- [ ] All Q1 roadmap features are implemented

---

## Next Steps

1. **Finalize** this plan with stakeholder review
2. **Set up** project repository and development environment
3. **Begin** Foundation phase (Week 1)
4. **Schedule** weekly check-ins to track progress

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 5, 2026 | — | Initial plan |

