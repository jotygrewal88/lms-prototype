# Phase I Epic 2 - Testing Guide

## Setup & Running

```bash
# The dev server should already be running from Epic 1
# If not, run:
npm run dev

# Open http://localhost:3000
```

## Acceptance Criteria Verification

### ✓ User Stories

#### 1. Admin/Manager Can Create Training with Assignment Criteria
- **Test**: As Admin, go to Trainings page → Click "New Training"
- **Expected**:
  - Modal opens with form fields
  - Can set Title, Description, Standard Ref, Retrain Interval
  - Assignment criteria with role/site/department toggles
  - Save creates training and auto-generates TrainingCompletion rows
  - Completions visible in Compliance table immediately

#### 2. System Auto-Creates TrainingCompletion Rows
- **Test**: Create training "Test Safety" assigned to Role=LEARNER + Site=Plant A
- **Expected**:
  - System matches 3 learners (Tom, Lisa, Carlos) at Plant A
  - Creates 3 completion rows with status=ASSIGNED
  - Due date set to 30 days from today
  - Visible in Compliance table

#### 3. Mark Completion with Notes/Proof & Calculate Expiration
- **Test**: In Compliance table, find an OVERDUE row → Click "Mark Complete"
- **Expected**:
  - Modal opens with Completed Date (defaults to today)
  - Can add Notes and Proof URL
  - On save, status changes to COMPLETED
  - If training has retrain interval, expiresAt is calculated
  - Completion date and expiration shown in table

#### 4. Compliance Table Filter, Search, CSV Export
- **Test**: Go to Compliance page
- **Expected**:
  - Can filter by Site, Department, Training, Status
  - Search by employee name or training title updates results
  - "Export CSV" button downloads file with current filtered view
  - Filter count shows "X of Y completions"
  - Clear filters button resets all

#### 5. Overdue Status Computed from Today
- **Test**: Check seed data completion with dueAt in the past
- **Expected**:
  - Status shows OVERDUE badge (red)
  - Overdue Days column shows calculated days (e.g., "10 days")
  - Seed data includes mix of statuses for demo

### ✓ Pages & Components Created

#### Trainings Page (`/admin/trainings`)
- [x] List view with training cards
- [x] Shows title, standard ref, description
- [x] Assignment summary (roles/sites/departments)
- [x] Completion stats (assigned/completed/overdue)
- [x] Edit and Delete buttons
- [x] "New Training" button opens modal
- [x] Empty state with CTA

#### Training Modal (`TrainingModal.tsx`)
- [x] Create/Edit modes
- [x] Form fields: title, description, standard ref, retrain interval
- [x] Assignment criteria toggles (roles, sites, departments)
- [x] Validation (title required)
- [x] Auto-generates completions on save

#### Compliance Page (`/admin/compliance`)
- [x] Full compliance table
- [x] Columns: Training, Employee, Site, Department, Status, Due Date, Completed Date, Overdue Days, Actions
- [x] Filters: Site, Department, Training, Status, Search
- [x] Filter count and clear button
- [x] "Mark Complete" action buttons
- [x] "Export CSV" button
- [x] Status badges color-coded

#### Completion Modal (`CompletionModal.tsx`)
- [x] Completed Date picker
- [x] Notes textarea
- [x] Proof URL input
- [x] Shows retrain interval info
- [x] Calculates expiration date
- [x] "Mark Exempt" button
- [x] Updates completion status

#### Updated Pages
- [x] Dashboard: Real training/compliance stats with progress bars
- [x] Learner page: Shows assigned trainings and deadlines

### ✓ Permissions Verified

#### Learner Cannot Access Completion Actions
- **Test**: Switch to Learner (Tom Learner)
- **Expected**:
  - Learner page shows their trainings (read-only)
  - Blue info box: "Completions are marked by manager or admin"
  - Cannot access /admin routes
  - Compliance table not accessible

#### Manager Actions Limited to Their Scope
- **Test**: Switch to Manager (Mike Manager - Plant A)
- **Expected**:
  - Can see Trainings and Compliance pages
  - In Compliance table, "Mark Complete" enabled ONLY for Plant A users
  - Plant B users show disabled button with tooltip
  - Can create trainings but ownership limited

#### Admin Has Full Access
- **Test**: Switch to Admin (Sarah Admin)
- **Expected**:
  - Can mark any completion complete
  - Can create/edit/delete any training
  - Can access all admin routes
  - Export CSV works

### ✓ Seed Demo Path

#### Path 1: Create Training and See Auto-Completions
1. Start as Admin
2. Go to Trainings → Click "New Training"
3. Enter:
   - Title: "Chemical Handling Refresher"
   - Standard Ref: "OSHA 1910.1200"
   - Retrain Interval: 180 days
   - Assignment: Role=LEARNER + Site=Plant B
4. Save
5. Go to Compliance page
6. Filter by Training="Chemical Handling Refresher"
7. **Expected**: See 3 new rows (Emma, David, Nina) with status=ASSIGNED

#### Path 2: Mark Completion and Verify Expiration
1. As Admin, go to Compliance page
2. Find Carlos Learner → Forklift Safety → Status=OVERDUE
3. Click "Mark Complete"
4. Set:
   - Completed Date: Today
   - Notes: "Passed written and practical exam"
   - Proof URL: "https://example.com/carlos-forklift-cert.pdf"
5. Save
6. **Expected**:
   - Status changes to COMPLETED (green badge)
   - Completed Date shows today
   - Overdue Days clears
   - Expiration date calculated (today + 365 days)
   - Proof link clickable

#### Path 3: Filter and Export
1. Go to Compliance page
2. Set filters:
   - Site: Plant A
   - Status: OVERDUE
3. **Expected**: Table shows only Plant A overdue completions
4. Click "Export CSV"
5. **Expected**: Downloads CSV file with filtered rows

#### Path 4: Manager Scope Test
1. Switch to Manager (Mike Manager)
2. Go to Compliance page
3. Try to mark complete for:
   - Tom Learner (Plant A) → **Enabled**
   - Emma Learner (Plant B) → **Disabled** with tooltip
4. **Expected**: Permission enforcement works correctly

#### Path 5: Learner View
1. Switch to Learner (Tom Learner)
2. **Expected**:
   - Dashboard shows compliance stats
   - My Trainings card lists assigned trainings
   - Upcoming Deadlines card shows due dates
   - Cannot access /admin routes
   - Blue info box about manager marking completions

### ✓ No Code Creep

#### Verified Boundaries:
- ✗ No reminder automation (notifications are stubs)
- ✗ No email/SMS sending
- ✗ No course content/library (Phase II features)
- ✗ No AI features beyond mocked helpers
- ✗ No backend/database
- ✓ All data in-memory via seed.ts

## Technical Verification

### Data Model
```typescript
Training {
  id, title, description, standardRef, 
  assignment: { roles, sites, departments, users },
  retrainIntervalDays, ownerManagerId
}

TrainingCompletion {
  id, trainingId, userId, status,
  dueAt, completedAt, expiresAt,
  overdueDays, notes, proofUrl
}
```

### Calculations Working
- [x] Overdue: today > dueAt && status != COMPLETED
- [x] Overdue Days: daysDiff(dueAt, today)
- [x] Expiration: completedAt + retrainIntervalDays
- [x] Assignment matching: users match role/site/department criteria

### Build Status
```
✅ npm run build - Passing (0 errors, 2 acceptable img warnings)
✅ TypeScript - All typed, no errors
✅ ESLint - No errors
```

## Seed Data Verification

### 4 Trainings
1. **Forklift Safety** - OSHA 1910.178, 365 days, Role=LEARNER + Site=Plant A
2. **PPE Basics** - OSHA 1910.132, 365 days, Role=LEARNER
3. **Lockout/Tagout** - OSHA 1910.147, 730 days, Dept=Maintenance
4. **Fire Safety** - OSHA 1910 Subpart L, 365 days, Site=Plant B

### 15 Completions with Mixed Statuses
- **COMPLETED**: 6 (with completedAt, expiresAt, some with proof/notes)
- **ASSIGNED**: 6 (due in next 7-30 days)
- **OVERDUE**: 3 (with overdueDays calculated)

### Deterministic Today
- Fixed at: **2024-12-15** (DEMO_TODAY in utils.ts)
- Ensures consistent overdue calculations

## Component Coverage

### New Components (4)
- ✅ TrainingModal - Create/edit trainings
- ✅ CompletionModal - Log completions
- ✅ Updated TrainingsPage - List + modal
- ✅ Updated CompliancePage - Table + filters + actions

### Updated Components (3)
- ✅ Dashboard - Real stats
- ✅ Learner page - Training list
- ✅ All use seed completions

## Known Limitations (By Design)

1. **No persistence**: State resets on refresh
2. **Mock CSV export**: Downloads real CSV but no backend
3. **No email notifications**: Placeholder only
4. **Fixed "today"**: Demo uses 2024-12-15 for consistency
5. **In-memory only**: No database or API calls

## Success Criteria - Epic 2 Complete ✅

- [x] Training CRUD with assignment logic
- [x] Auto-generate completions for matched users
- [x] Compliance table with filters, search, export
- [x] Mark completion with proof/notes/expiration
- [x] Overdue status and days calculated
- [x] Manager scope enforcement
- [x] Learner read-only view
- [x] Dashboard shows real stats
- [x] All 4 seed trainings with 15 completions
- [x] Build passes with no errors
- [x] All acceptance criteria met

**Status: Epic 2 complete and demoable! ✅**

