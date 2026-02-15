# UpKeep Learn Prototype

A compliance-focused Learning Management System integrated with EHS and CMMS.

## Current Status: Phase I - Epic 2 Complete ✅

**Epic 1: App Shell + Permissions** ✅ Complete
**Epic 2: Trainings + Compliance Table** ✅ Complete

### Features Implemented
- ✅ Role-based navigation (Admin, Manager, Learner)
- ✅ Permission enforcement with route guards
- ✅ Dynamic brand theming
- ✅ Training management (CRUD)
- ✅ Assignment logic with auto-completion generation
- ✅ Compliance tracking table
- ✅ Filter, search, and CSV export
- ✅ Completion logging with proof and notes
- ✅ Overdue calculation and status tracking
- ✅ Real-time dashboard with live stats
- ✅ Learner personal compliance view

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.5
- **Styling**: Tailwind CSS 3.4
- **State**: In-memory with subscription pattern
- **Data**: Seed-based (no backend/database)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

Default role: **Admin** (Sarah Admin)

## Project Structure

```
/app                      # Next.js App Router pages
  /admin                  # Admin routes
    page.tsx              # Dashboard with real stats
    /trainings            # Training management
    /compliance           # Compliance tracking table
    /users                # User list
    /settings             # Brand & notification settings
  /learner                # Learner home page
  layout.tsx              # Root layout
  globals.css             # Global styles

/components               # Reusable UI components
  Header.tsx              # Global header with role toggle
  AdminSidebar.tsx        # Role-filtered navigation
  TrainingModal.tsx       # Training create/edit modal
  CompletionModal.tsx     # Completion logging modal
  Button, Card, Badge...  # UI primitives

/lib                      # Business logic
  store.ts                # In-memory state management
  permissions.ts          # Role-based access control
  utils.ts                # Date utilities (deterministic today)
  assignment.ts           # Training assignment matching

/data
  seed.ts                 # Seed data (4 trainings, 15 completions)

types.ts                  # TypeScript definitions
```

## Seed Data

### Users (9 total)
- **1 Admin**: Sarah Admin (org-wide)
- **2 Managers**: Mike (Plant A), Jennifer (Plant B)
- **6 Learners**: Tom, Lisa, Carlos (Plant A); Emma, David, Nina (Plant B)

### Sites & Departments
- **Plant A**: Warehouse, Packaging, Maintenance
- **Plant B**: Warehouse, Packaging, Maintenance

### Trainings (4)
1. **Forklift Safety** - OSHA 1910.178, 365 days, Plant A Learners
2. **PPE Basics** - OSHA 1910.132, 365 days, All Learners
3. **Lockout/Tagout** - OSHA 1910.147, 730 days, Maintenance Depts
4. **Fire Safety** - OSHA 1910 Subpart L, 365 days, Plant B All

### Completions (15)
- 6 Completed (with dates, some with proof/notes)
- 6 Assigned (due in 2-30 days)
- 3 Overdue (with calculated overdue days)

**Demo Date**: Fixed at 2024-12-15 for deterministic demos

## Features by Role

### Admin
- ✅ Full CRUD on trainings
- ✅ Mark any completion complete
- ✅ Access all admin routes
- ✅ Export CSV for all data
- ✅ Configure brand settings
- ✅ View all users

### Manager
- ✅ Create/edit trainings
- ✅ Mark completions for users in their site
- ✅ Access: Dashboard, Trainings, Compliance, Users
- ❌ No Settings access
- ❌ Cannot modify completions outside scope

### Learner
- ✅ View personal compliance dashboard
- ✅ See assigned trainings and deadlines
- ✅ Read-only training status
- ❌ Cannot access admin routes
- ❌ Cannot mark completions (done by manager/admin)

## Key Pages

### `/admin` - Dashboard
- Live compliance rate with progress bar
- Training and completion counts
- Completed, Assigned, Overdue breakdowns

### `/admin/trainings` - Training Management
- List view with training cards
- Create/edit modal with assignment criteria
- Auto-generates completions on save
- Shows completion stats per training

### `/admin/compliance` - Compliance Table
- Full table with all completions
- Filter by: Site, Department, Training, Status
- Search by: Employee name, Training title
- Mark complete with proof and notes
- Export filtered data to CSV

### `/learner` - Learner Home
- Personal compliance rate
- My Trainings list with status badges
- Upcoming deadlines
- Note about manager/admin marking completions

## Demo Paths

### 1. Create Training and See Auto-Completions
1. Admin → Trainings → "New Training"
2. Title: "Chemical Handling", Standard: "OSHA 1910.1200"
3. Assignment: Role=LEARNER + Site=Plant B
4. Save → 3 completions auto-generated
5. Compliance → See new rows

### 2. Mark Completion with Proof
1. Compliance → Find OVERDUE row
2. "Mark Complete" → Set date, notes, proof URL
3. Save → Status=COMPLETED, expiration calculated

### 3. Filter and Export
1. Compliance → Filter: Site=Plant A, Status=OVERDUE
2. "Export CSV" → Download filtered data

### 4. Manager Scope Test
1. Switch to Mike Manager (Plant A)
2. Compliance → Try marking Plant B user (disabled)

### 5. Learner View
1. Switch to Tom Learner
2. View personal trainings and deadlines (read-only)

## Documentation

- **START_HERE.md** - Quick demo guide
- **EPIC1_TESTING.md** - Epic 1 testing guide
- **EPIC1_ACCEPTANCE.md** - Epic 1 acceptance checklist
- **EPIC2_TESTING.md** - Epic 2 testing guide
- **EPIC2_ACCEPTANCE.md** - Epic 2 acceptance checklist
- **EPIC2_SUMMARY.md** - Epic 2 implementation details
- **Docs/UPKEEP_LMS_PLAN.md** - Product plan
- **Docs/CURSOR_BRIEFING_ADDENDUM.md** - Implementation conventions

## Build Status

```
✅ npm install - Complete
✅ npm run build - Passing (0 errors)
✅ TypeScript - All typed, no errors
✅ ESLint - No errors
✅ Bundle size - Optimized (~87KB shared)
```

## Known Limitations (By Design)

1. **No persistence**: State resets on refresh (in-memory only)
2. **Mock CSV export**: Downloads real CSV but no backend
3. **No email notifications**: Placeholder for future
4. **Fixed demo date**: 2024-12-15 for consistent overdue calculations
5. **No database**: All data from seed.ts

## What's NOT Built (Future Epics)

- Automated reminder system
- Email/SMS notifications
- Course content library
- Lesson builder
- Quiz engine
- Certificate generation
- AI features (beyond mocks)
- Analytics beyond basic counts

## Success Criteria

### Epic 1 ✅
- Role-based navigation and permissions
- Brand theming
- User management
- Route guards

### Epic 2 ✅
- Training CRUD with assignment logic
- Auto-generate completions
- Compliance table with filters/search/export
- Mark completion with proof/notes/expiration
- Overdue calculation
- Manager scope enforcement
- Learner read-only view

**Both epics complete and demoable! ✅**

## Next Steps

Ready for demo. Awaiting "ok next" for future epics.

---

**Last Updated**: Epic 2 Complete
**Version**: Phase I Complete
**Status**: Production-ready prototype

