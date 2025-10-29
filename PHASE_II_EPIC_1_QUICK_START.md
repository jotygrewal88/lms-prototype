# Phase II Epic 1 — Quick Start Guide

**Status:** ✅ Implementation Complete and Running

**Server:** http://localhost:3000

---

## 🚀 Quick Navigation

### Admin Role (Default)
Start at: http://localhost:3000

**Course Management:**
- **Course List:** http://localhost:3000/admin/courses
- **Create Course:** Click "+ Create Course" button
- **Edit Course:** Click any course card
- **Example Courses:**
  - Workplace Safety: http://localhost:3000/admin/courses/crs_001/edit
  - Forklift Certification: http://localhost:3000/admin/courses/crs_002/edit
  - HazCom: http://localhost:3000/admin/courses/crs_003/edit

### Manager Role
Switch role to Manager (usr_mgr_b_1) to test read-only access:
- Same course URLs as Admin
- Note: All inputs disabled, no Create/Delete/Assign buttons

### Learner Role
Switch role to any Learner to see catalog:
- **My Courses:** http://localhost:3000/learner/courses
- Example Learners:
  - usr_lrn_a_pkg_1 (has completed Workplace Safety)
  - usr_lrn_a_pkg_3 (in progress on Forklift)
  - usr_lrn_b_wh_1 (in progress on Forklift)

---

## ✅ Manual Test Script

### Test 1: Admin Course Management

1. **View Courses List**
   - Go to: http://localhost:3000/admin/courses
   - ✅ See 4 courses in grid layout
   - ✅ See lesson/resource/question counts
   - ✅ See "Completed N / Assigned M" for courses with assignments
   - ✅ See Updated timestamps

2. **Create New Course**
   - Click "+ Create Course"
   - Enter title: "Test Course 123"
   - Enter description: "This is a test course"
   - Click "Create & Edit"
   - ✅ Editor opens for new course

3. **Edit Course Overview**
   - Change title to "Test Course Updated"
   - Add category: "Testing"
   - Add tag: "demo"
   - Add standard: "TEST-001"
   - Change status to "Published"
   - Click "Save Changes"
   - ✅ Verify changes persist after refresh

4. **Manage Lessons**
   - Go to Lessons tab
   - Click "+ Add Lesson"
   - ✅ New lesson appears as "Lesson 1"
   - Edit lesson title inline to "Introduction"
   - Click "Manage" button
   - ✅ Resource panel opens on right

5. **Add Resources**
   - Click "+ Add" in resource panel
   - Select type: "Text"
   - Enter title: "Welcome Message"
   - Enter content: "Welcome to the course!"
   - Click "Save"
   - ✅ Resource appears in list
   - Add another resource:
     - Type: "Video"
     - Title: "Introduction Video"
     - URL: "https://example.com/video.mp4"
     - Duration: 300
   - ✅ Both resources show with icons

6. **Reorder Lessons**
   - Add a second lesson
   - Use up/down arrows to change order
   - ✅ Lesson numbers update
   - Refresh page
   - ✅ Order persists

7. **Quiz Tab**
   - Go to Quiz tab
   - ✅ If course has quiz, see questions displayed
   - ✅ If no quiz, see "Coming in Epic 3" message
   - View questions for crs_001 (Workplace Safety)
   - ✅ See 5 questions with options and correct answers highlighted

8. **Settings Tab**
   - Go to Settings tab
   - Toggle "Require all lessons"
   - Change "Min Video Watch %" to 90
   - Click "Save Changes"
   - Refresh
   - ✅ Settings persisted

9. **Assign Course**
   - Click "Assign" button in header
   - Go to "Users" tab
   - Select 2 learners
   - Set due date (any future date)
   - Click "Assign Course"
   - ✅ See assignments listed below with "User" badge
   - Create another assignment:
     - Go to "Roles" tab
     - Select "All Learners"
     - Click "Assign Course"
   - ✅ See role assignment with "Role" badge

10. **Delete Assignment**
    - Click trash icon on an assignment
    - ✅ Assignment removed from list

11. **Recompute Progress (Dev Only)**
    - Go to Lessons tab
    - Click "Recompute Progress" button
    - ✅ See "Progress recomputed" alert

12. **Delete Course**
    - Go back to course list
    - Click trash icon on test course
    - Confirm deletion
    - ✅ Course removed (cascade delete of all lessons, resources, assignments)

### Test 2: Manager Read-Only Access

1. **Switch to Manager**
   - Use role switcher to select Manager (usr_mgr_b_1)

2. **View Course List**
   - Go to: http://localhost:3000/admin/courses
   - ✅ See read-only banner: "As a Manager, you can view courses but cannot create, edit, or delete them."
   - ✅ No "+ Create Course" button visible

3. **View Course Editor**
   - Click any course card
   - ✅ See read-only banner in editor
   - ✅ All inputs disabled (grayed out)
   - ✅ No "Save Changes" button
   - ✅ No "Assign" button
   - ✅ No delete buttons on lessons/resources/assignments
   - ✅ Can view all tabs but not edit

### Test 3: Learner Course Catalog

1. **Switch to Learner**
   - Switch to usr_lrn_a_pkg_1 (has completed Workplace Safety)

2. **View My Courses**
   - Go to: http://localhost:3000/learner/courses
   - ✅ See assigned courses only (no draft courses)
   - ✅ See course cards with:
     - Status badge (Completed/In Progress/Not Started)
     - Category badge
     - Title and description
     - Tags (first 3)
     - Progress bar with percentage
     - "N of M lessons" counter
     - Score if completed
     - Duration badge

3. **Test Filters**
   - Click "All" - see all courses
   - Click "Completed" - see only completed courses
   - Click "In Progress" - see only in-progress courses
   - Click "Not Started" - see only not-started courses
   - ✅ Course count updates for each filter

4. **Test Different Learners**
   - Switch to usr_lrn_a_pkg_3 (in progress on Forklift)
   - ✅ See different progress state
   - Switch to usr_lrn_b_maint_1 (has not started courses)
   - ✅ See "Not Started" badges

5. **Test Unassigned Learner**
   - Switch to a learner with no assignments
   - ✅ See empty state: "No courses assigned yet"

---

## 🎯 Key Features to Verify

### Data Integrity
- ✅ All timestamps (Created/Updated) display correctly
- ✅ Counters (lessons, resources, questions) are accurate
- ✅ Progress percentages match lesson completion
- ✅ Owner names display correctly

### Relationships
- ✅ Deleting a course removes all lessons, resources, quizzes
- ✅ Deleting a lesson removes all resources
- ✅ Adding a lesson updates course's lesson count
- ✅ Adding a resource updates lesson's resource count
- ✅ Reordering lessons persists correctly

### Permissions
- ✅ Admin: Full CRUD on all entities
- ✅ Manager: Read-only on courses, no CRUD actions
- ✅ Learner: Only sees assigned published courses

### Assignment System
- ✅ User assignments: Specific users see the course
- ✅ Role assignments: All users of that role see the course
- ✅ Site assignments: All users at that site see the course
- ✅ Dept assignments: All users in that dept see the course
- ✅ Due dates display when set

### UI/UX
- ✅ Cards clickable (entire card navigates)
- ✅ Hover effects on cards (shadow + scale)
- ✅ Responsive grid (1/2/3 columns based on screen size)
- ✅ Line-clamping for long text
- ✅ Icons used consistently (Lucide React)
- ✅ Color scheme consistent throughout
- ✅ Empty states provide helpful guidance

---

## 📊 Seed Data Overview

**4 Courses:**
1. **Workplace Safety Fundamentals** (crs_001) - Published
   - 3 lessons, 6 resources, 5 questions
   - Assigned to Site A, 2 specific users
   - 2 learners completed

2. **Forklift Operation Certification** (crs_002) - Published
   - 3 lessons, 5 resources, 6 questions
   - Assigned to Warehouse dept, 4 specific users
   - 2 learners in progress

3. **Hazard Communication (HazCom)** (crs_003) - Published
   - 2 lessons, 4 resources, 4 questions
   - Assigned to all LEARNERs, Maintenance dept
   - 1 learner in progress

4. **Emergency Response & Evacuation** (crs_004) - Draft
   - 2 lessons, 2 resources, no quiz
   - Not assigned
   - Not visible to learners

**Progress States:**
- 2 completed courses
- 3 in-progress courses
- 3 not-started courses

**Certificates:**
- 2 issued (for completed Workplace Safety course)

---

## 🐛 Known Issues (By Design)

1. **Course Player Disabled**
   - "Start Course" / "Continue" / "Review" buttons are disabled
   - Message: "Course player coming in Epic 2"
   - This is intentional - player will be built in next epic

2. **Quiz Creation**
   - Cannot create/edit quizzes in this epic
   - Quiz tab shows existing quizzes (read-only)
   - Full quiz builder coming in Epic 3

3. **No Rich Text Editor**
   - Description and resource content use plain textarea
   - No formatting toolbar
   - Can be added in future polish pass

4. **Manual Reordering**
   - Lessons use up/down arrow buttons
   - No drag-and-drop interface
   - Works but less intuitive than drag-and-drop

5. **No Search/Filters on Admin List**
   - All courses shown, no filtering
   - Marked as "nice-to-have" for future

---

## 🔧 Development Tools

**Recompute Progress Button:**
- Visible only in dev mode (`process.env.NODE_ENV === 'development'`)
- Located in Lessons tab of course editor
- Recalculates progress for all learners on current course
- Useful for testing progress tracking logic

**Role Switcher:**
- Use to test different role perspectives
- Located in header (if implemented)
- Or manually switch in browser console:
  ```javascript
  // In browser console
  switchRole('usr_admin_1')  // Admin
  switchRole('usr_mgr_b_1')   // Manager
  switchRole('usr_lrn_a_pkg_1') // Learner (completed course)
  ```

---

## ✅ Success Criteria

**All routes return HTTP 200:**
- ✅ `/` (redirects based on role)
- ✅ `/admin/courses`
- ✅ `/admin/courses/crs_001/edit`
- ✅ `/admin/courses/crs_002/edit`
- ✅ `/admin/courses/crs_003/edit`
- ✅ `/learner/courses`

**No errors in console:**
- ✅ No TypeScript errors
- ✅ No React errors
- ✅ No missing data warnings

**All acceptance criteria met:**
- ✅ Data model with timestamps
- ✅ Complete CRUD operations
- ✅ Admin UI with all features
- ✅ Manager read-only mode
- ✅ Learner catalog with progress
- ✅ Assignment system working
- ✅ Permission enforcement correct

---

## 📚 Documentation

**Full Implementation Details:**
- See: `PHASE_II_EPIC_1_FIX_PASS_COMPLETE.md`

**Plan Reference:**
- See: `phase-ii-epic-1.plan.md`

**Original Spec:**
- See plan file for detailed acceptance criteria

---

## 🎉 Ready for Testing!

The app is running and fully functional. All features have been implemented according to spec.

**Next Steps:**
1. Run through manual test script above
2. Explore the UI and test edge cases
3. Verify permission enforcement for all roles
4. Check that progress tracking works correctly
5. Confirm assignment system resolves properly

**If any issues found:**
- Check browser console for errors
- Verify seed data loaded correctly
- Ensure role is set appropriately
- Check that course is published (for learner view)
- Verify assignments exist for learner's user/role/site/dept

---

**Happy Testing! 🚀**

