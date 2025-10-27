# Phase I Epic 1 - Testing Guide

## Setup & Running the App

```bash
# Install dependencies (if not already done)
npm install

# Run the development server
npm run dev

# Open http://localhost:3000
```

## Acceptance Criteria Verification

### ✓ User Stories

#### 1. Switch Roles and See Correct Navigation
- **Test**: On any page, use the role toggle dropdown in the top-right header
- **Expected**:
  - Select "Sarah Admin (ADMIN)" → Full admin sidebar appears with all navigation items
  - Select "Mike Manager (MANAGER)" → Admin sidebar appears WITHOUT Settings section
  - Select "Tom Learner (LEARNER)" → Sidebar disappears completely

#### 2. Admin Can Navigate to All Admin Pages
- **Test**: As Admin, click through all navigation items
- **Expected**: Can access:
  - Dashboard (`/admin`)
  - Trainings (`/admin/trainings`)
  - Compliance (`/admin/compliance`)
  - Users (`/admin/users`)
  - Settings → Brand (`/admin/settings/brand`)
  - Settings → Notifications (`/admin/settings/notifications`)

#### 3. Manager Sees Reduced Navigation
- **Test**: Switch to Manager role
- **Expected**:
  - Sidebar shows: Dashboard, Trainings, Compliance, Users
  - Settings section is NOT visible
  - Can still access Dashboard, Trainings, Compliance, Users pages
  - If manually navigating to `/admin/settings/brand`, see "Access Denied" page

#### 4. Learner Blocked from Admin Routes
- **Test**: Switch to Learner role
- **Expected**:
  - No sidebar visible
  - Redirected to `/learner` page
  - If manually navigating to any `/admin/*` route, see "Access Denied" page with "Go to Home" button
  - Clicking "Go to Home" returns to `/learner`

### ✓ Pages & Components Created

#### Routes Implemented:
- ✓ `/` (redirects to `/admin` or `/learner` based on role)
- ✓ `/admin` (Dashboard with stat cards)
- ✓ `/admin/trainings` (placeholder)
- ✓ `/admin/compliance` (placeholder)
- ✓ `/admin/users` (user table with seed data)
- ✓ `/admin/settings/brand` (brand configuration)
- ✓ `/admin/settings/notifications` (placeholder)
- ✓ `/learner` (learner home)

#### Components Created:
- ✓ Header (with role toggle)
- ✓ AdminSidebar (role-filtered navigation)
- ✓ Button (primary/secondary variants)
- ✓ Card (container component)
- ✓ Badge (status indicators)
- ✓ Progress (progress bar)
- ✓ Table (skeleton for users page)
- ✓ Modal (skeleton for future use)
- ✓ RouteGuard (permission enforcement)
- ✓ Unauthorized (access denied page)
- ✓ BrandProvider (dynamic theming)

### ✓ Permissions Verified

#### Admin Role:
- **Test**: Login as "Sarah Admin (ADMIN)"
- **Expected**:
  - Full admin navigation visible (Dashboard, Trainings, Compliance, Users, Settings)
  - Can access all routes without restriction
  - Can modify brand settings at `/admin/settings/brand`

#### Manager Role:
- **Test**: Login as "Mike Manager (MANAGER)" or "Jennifer Manager (MANAGER)"
- **Expected**:
  - Admin navigation visible WITHOUT Settings section
  - Can access: Dashboard, Trainings, Compliance, Users
  - Cannot access: `/admin/settings/brand`, `/admin/settings/notifications` (shows Access Denied)

#### Learner Role:
- **Test**: Login as any learner (Tom, Lisa, Carlos, Emma, David, Nina)
- **Expected**:
  - No sidebar navigation
  - Only has access to `/learner` route
  - All `/admin/*` routes show "Access Denied" page

### ✓ Seed Demo Path

#### Brand Color Demo:
1. Start as Admin (default)
2. Navigate to Settings → Brand (`/admin/settings/brand`)
3. Change primary color to `#10B981` (green)
4. Click "Save Changes"
5. **Expected**:
   - Success message appears
   - Primary buttons immediately change to green
   - Active navigation items change to green
   - Progress bars (if any) change to green
6. Reset to default (`#2563EB` blue) to restore original theme

#### Role Switching Demo:
1. Start at Dashboard as Admin
2. Switch to Manager → Settings disappears from nav
3. Try to navigate to `/admin/settings/brand` → Access Denied
4. Switch to Learner → Sidebar disappears, redirected to learner home
5. Try to navigate to `/admin` → Access Denied with "Go to Home" button
6. Click "Go to Home" → Returns to `/learner`

#### Users Page Demo:
1. Navigate to Users page as Admin or Manager
2. **Expected**: See table with 9 users:
   - 1 Admin (Sarah)
   - 2 Managers (Mike, Jennifer)
   - 6 Learners (Tom, Lisa, Carlos, Emma, David, Nina)
3. Each row shows: Name, Email, Role badge, Site, Department

### ✓ No Code Creep

#### Verified Boundaries:
- ✗ No training creation/management (coming in Epic 2)
- ✗ No compliance tracking logic (coming in Epic 2)
- ✗ No reminder system (coming in Epic 2)
- ✗ No external API calls
- ✗ No backend/authentication
- ✗ No database connections
- ✓ Only in-memory data via seed.ts

## Technical Verification

### Build & Type Checking
```bash
npm run build
# Should complete with 0 errors (warnings about <img> tags are acceptable)
```

### File Structure
```
/app
  /admin
    page.tsx                    ✓
    /trainings/page.tsx         ✓
    /compliance/page.tsx        ✓
    /users/page.tsx             ✓
    /settings
      /brand/page.tsx           ✓
      /notifications/page.tsx   ✓
  /learner
    page.tsx                    ✓
  layout.tsx                    ✓
  page.tsx                      ✓
  globals.css                   ✓

/components
  AdminSidebar.tsx              ✓
  Badge.tsx                     ✓
  BrandProvider.tsx             ✓
  Button.tsx                    ✓
  Card.tsx                      ✓
  Header.tsx                    ✓
  Modal.tsx                     ✓
  Progress.tsx                  ✓
  RouteGuard.tsx                ✓
  Table.tsx                     ✓
  Unauthorized.tsx              ✓

/data
  seed.ts                       ✓

/lib
  permissions.ts                ✓
  store.ts                      ✓

types.ts                        ✓
```

## Known Limitations (By Design)

1. **Images**: Using `<img>` instead of Next.js `<Image>` for simplicity (acceptable for prototype)
2. **No persistence**: All state resets on page refresh (by design - in-memory only)
3. **No backend**: No real authentication or session management
4. **Placeholder pages**: Trainings, Compliance, Notifications are intentionally empty for Epic 2

## Success Criteria - Epic 1 Complete ✅

- [x] App shell created with Next.js 14 + TypeScript + Tailwind
- [x] Role-based navigation (Admin/Manager/Learner)
- [x] Permission enforcement with route guards
- [x] Seed data with 9 users across 2 sites and 6 departments
- [x] All required routes implemented
- [x] All required components created
- [x] Brand settings page with dynamic color theming
- [x] Clean, responsive UI with Tailwind primitives
- [x] No training/compliance logic (saved for Epic 2)
- [x] Build completes successfully
- [x] All acceptance criteria met

**Status: Epic 1 complete and demoable! ✅**

