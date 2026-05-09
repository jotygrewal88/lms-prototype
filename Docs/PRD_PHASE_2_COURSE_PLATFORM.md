# PRD: Phase 2 — Course Platform, AI Authoring & Learner Experience

**Version:** 1.0
**Created:** April 15, 2026
**Audience:** Engineering team
**Status:** Active

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scope & Exclusions](#2-scope--exclusions)
3. [Roles & Permissions](#3-roles--permissions)
4. [Module 1 — AI Course Generation Wizard](#4-module-1--ai-course-generation-wizard)
5. [Module 2 — Course Editor](#5-module-2--course-editor)
6. [Module 3 — Admin Course List & Detail](#6-module-3--admin-course-list--detail)
7. [Module 4 — AI Review Workflow](#7-module-4--ai-review-workflow)
8. [Module 5 — Course Preview (Admin)](#8-module-5--course-preview-admin)
9. [Module 6 — Learner Course Experience](#9-module-6--learner-course-experience)
10. [Module 7 — Course Assignments](#10-module-7--course-assignments)
11. [Module 8 — Course Progress & Tracking](#11-module-8--course-progress--tracking)
12. [Module 9 — Quiz Engine](#12-module-9--quiz-engine)
13. [Module 10 — Certification System](#13-module-10--certification-system)
14. [Module 11 — Notifications & Reminders](#14-module-11--notifications--reminders)
15. [Module 12 — Analytics & Reporting](#15-module-12--analytics--reporting)
16. [Module 13 — Library Integration](#16-module-13--library-integration)
17. [Module 14 — Learner Skills Passport](#17-module-14--learner-skills-passport)
18. [Module 15 — Settings & Customization](#18-module-15--settings--customization)
19. [Module 16 — Rich Text Editor & AI Toolbar](#19-module-16--rich-text-editor--ai-toolbar)
20. [Module 17 — File Upload System](#20-module-17--file-upload-system)
21. [Data Model Reference](#21-data-model-reference)
22. [Cross-Module Dependency Map](#22-cross-module-dependency-map)
23. [Build Sequence Recommendation](#23-build-sequence-recommendation)
24. [Current Limitations & Future Enhancements](#24-current-limitations--future-enhancements)
25. [Glossary](#25-glossary)

---

## 1. Executive Summary

Phase 2 evolves UpKeep Learn from a passive compliance tracker into an active training delivery and AI-driven course authoring platform. The core premise: administrators create courses (manually or with AI), assign them to learners, and the system tracks progress, issues certificates, fires reminders, and feeds data back into the compliance engine.

**Key capabilities delivered in Phase 2:**

- AI-powered course generation from topics, SOPs, and library documents
- Rich course editor with drag-and-drop lessons, multi-type sections, and quiz authoring
- Full learner course player with progress tracking, timing enforcement, and accessibility features
- Seven question-type quiz engine with AI generation and auto-grading
- Certificate template management and automatic issuance on completion
- Course assignment by user, role, site, or department with compliance bridge
- Notification and reminder system tied to course due dates and retrain intervals
- Analytics dashboard with completion trends, skill coverage, and AI insights
- Learner Skills Passport showing earned competencies across courses
- Customization: branding, certificate templates, localization, content standards

**Content hierarchy:** Course → Lessons → Sections (Resources). No intermediate "Module" layer.

---

## 2. Scope & Exclusions

### In Scope

| Area | Included |
|------|----------|
| AI Course Generation | Full wizard, build animation, AI draft state |
| Course Editor | 5-tab editor (Overview, Lessons, Quiz, Settings, Assignment) |
| Admin Course Management | List, detail, preview, delete |
| AI Review Workflow | Draft banner, approve/reject, sidebar badge |
| Learner Experience | My Courses grid, course overview, course player, quiz taking, completion flow |
| Assignments | By user/role/site/department, due dates, compliance bridge |
| Progress Tracking | Per-lesson and per-course progress, timing enforcement |
| Quiz Engine | 7 question types, AI generation, auto-grading, retakes |
| Certificates | Template CRUD, auto-issuance on completion, PDF export |
| Notifications | Reminder rules, escalation, course-specific notifications |
| Analytics | Completion trends, department breakdown, skill coverage, AI insights |
| Library Integration | Source selection for AI generation, library picker in editor |
| Skills Passport | Learner-facing skill portfolio earned via courses |
| Settings | Brand/theme, certificate templates, localization, content standards |

### Out of Scope

| Area | Reason |
|------|--------|
| Admin Dashboard | Separate workstream |
| Learner Dashboard (enhanced) | Separate workstream |
| Onboarding Paths | Separate workstream |
| Training Actions / Responses | Separate workstream |
| Operational Signals | Separate workstream |
| Real database / persistence | Prototype uses in-memory store |
| Authentication / SSO | Role switching via UI selector |
| Email delivery | Notifications are in-app only |
| SCORM / xAPI | No external LMS content standards |
| Mobile native | Web-only (responsive) |
| Real file storage | Local `/public/uploads` only |

---

## 3. Roles & Permissions

Three roles interact with Phase 2 features:

### Admin

- Full access to all course features
- Create, edit, publish, delete, and assign courses
- Manage AI-generated drafts (approve, reject)
- Manage certificate templates and customization settings
- Access analytics and reporting
- Configure notification/reminder rules

### Manager

- View the course list and open courses
- View course details and preview courses
- **Cannot** create, delete, or change course status
- Read-only or restricted view of the editor
- View assignments but limited assignment capabilities
- Scoped analytics (site/department level)

### Learner

- View and consume assigned, published courses only
- Track own progress, complete lessons, take quizzes
- Submit course feedback upon completion
- View certificates earned
- View Skills Passport (own skills)

### Permission Matrix

| Capability | Admin | Manager | Learner |
|-----------|:-----:|:-------:|:-------:|
| Create courses | ✓ | ✗ | ✗ |
| Edit courses | ✓ | Read-only | ✗ |
| Delete courses | ✓ | ✗ | ✗ |
| Publish / change status | ✓ | ✗ | ✗ |
| Assign courses | ✓ | Limited | ✗ |
| Preview courses | ✓ | ✓ | ✗ |
| Consume courses | ✗ | ✗ | ✓ |
| Take quizzes | ✗ | ✗ | ✓ |
| View all progress | ✓ | Scoped | Own only |
| Manage certificate templates | ✓ | ✗ | ✗ |
| View/download certificates | ✓ | ✓ (team) | ✓ (own) |
| Configure notifications | ✓ | ✗ | ✗ |
| Receive notifications | ✓ | ✓ | ✓ |
| View analytics | ✓ | Scoped | ✗ |
| View Skills Passport | ✓ (all) | ✓ (team) | ✓ (own) |
| Manage settings | ✓ | ✗ | ✗ |

---

## 4. Module 1 — AI Course Generation Wizard

**Route:** `/admin/courses/generate`
**Access:** Admin only

This is the primary entry point for creating a new course. It is a two-step wizard followed by an animated build sequence.

### Step 1: "What are you building?"

The admin defines the high-level shape of the course.

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| Topic | Text input | Yes | Free-text describing the course subject (e.g., "Lockout/Tagout Procedures for Hydraulic Presses") |
| Synthesis Type | Select | Yes | Micro-lesson (short, focused), Full course (comprehensive, multi-lesson), Onboarding path (structured for new hires) |
| Audience Level | Select | Yes | New hire, Experienced worker, Recertification |

### Step 2: "Who's it for?"

The admin provides targeting and source context.

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| Target Job Title | Select | No | The role this course is designed for (e.g., "Maintenance Technician"). Sourced from the Learning Model job titles. |
| Target Skill | Select | No | The primary skill this course teaches or reinforces. Sourced from the Skills V2 catalog. |
| Library Sources | Multi-select | No | Existing Library items to use as source material for generation. Only items with `allowedForSynthesis = true` are selectable. |
| Quiz Placement | Select | Yes | Per-lesson (quiz after each lesson), End-of-course (single quiz at the end), Both |
| Additional Context | Textarea | No | Extra instructions or context for the AI to consider |

### Build Animation

After submitting, a full-screen animated loading sequence displays scripted status messages communicating what the AI is doing:

1. "Analyzing source materials..."
2. "Mapping skills and competencies..."
3. "Generating course structure..."
4. "Building lesson content..."
5. "Creating assessment questions..."
6. "Finalizing and polishing..."

This is a UX treatment over the actual course creation process.

### Result

The system creates a new `Course` with status `ai-draft` and redirects the admin to the Course Editor.

### AI Context Inputs

The generation pipeline uses context from the Learning Model:
- **Organization Profile** — Industry, geography, regulatory frameworks
- **Content Standards** — Tone, preferred/banned terminology, custom AI instructions
- **Library Sources** — Selected documents as the knowledge base

### Acceptance Criteria

- [ ] Two-step wizard with validation (Topic and Synthesis Type required in Step 1, Quiz Placement required in Step 2)
- [ ] Job Title and Skill selects are populated from the Learning Model
- [ ] Library Sources multi-select shows only items with `allowedForSynthesis = true`
- [ ] Build animation plays with scripted status messages
- [ ] On completion, a course is created with status `ai-draft` containing generated lessons, sections, and quizzes
- [ ] Redirect to `/admin/courses/[id]/edit` on completion
- [ ] Only accessible to Admin role

---

## 5. Module 2 — Course Editor

**Route:** `/admin/courses/[id]/edit`
**Access:** Admin (full edit), Manager (read-only view)

The course editor is the main authoring surface organized into five tabs.

### 5.1 Overview Tab

The course's identity and metadata configuration.

#### Course Details

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| Title | Text input | Yes | Display name of the course |
| Description | Rich text | No | Course description rendered to learners |

#### Learning Objectives

- Managed list of objective statements
- Add individual objectives via text input
- Remove objectives with delete action
- Displayed to learners on the course overview page

#### Skills

Skills connect courses to the organization's competency framework.

| Relationship | Description |
|-------------|-------------|
| Skills Granted | Skills the learner earns upon completing this course. Triggers `UserSkillRecord` creation. |
| Skills Required | Skills the learner should have before taking this course. Data model exists; not currently enforced as a gate. |

- Search and attach existing skills from the SkillV2 catalog
- Skills appear as chips/tags
- **"+ New Skill"** option: create a skill inline (name + category) without leaving the editor

#### Metadata Fields

| Field | Type | Options / Notes |
|-------|------|-----------------|
| Category | Text input | Free-text classification (e.g., "Safety", "Equipment Operation") |
| Estimated Duration | Number (minutes) | Total time estimate for the course |
| Difficulty | Select | Beginner, Intermediate, Advanced |
| Reading Level | Select | Basic, Standard, Technical |
| Language | Select | English, Spanish |
| Tags | Tag input | Free-text tag list for flexible categorization |

#### Status

| Status | Description | Visibility |
|--------|-------------|------------|
| `draft` | Work in progress | Not visible to learners |
| `published` | Live and assignable | Visible to assigned learners |
| `ai-draft` | Generated by AI, pending review | AI-generated courses only |
| `in-review` | Under admin review | AI-generated courses only |
| `rejected` | Reviewed and rejected | AI-generated courses only |

Managers cannot change the status field.

#### Compliance Standards

A structured standards editor supporting:
- **OSHA** codes
- **MSHA** codes
- **EPA** codes
- **Other** custom regulatory codes

Managed via a dedicated Standards Edit Modal.

#### Acceptance Criteria

- [ ] Title field is required; cannot save without it
- [ ] Rich text description with full formatting
- [ ] Learning objectives list: add, remove, reorder
- [ ] Skills search with typeahead against SkillV2 catalog
- [ ] Inline skill creation (name + category)
- [ ] All metadata fields save correctly
- [ ] Status dropdown with appropriate options per course origin (AI vs manual)
- [ ] Managers see all fields as read-only
- [ ] Compliance standards modal supports OSHA/MSHA/EPA/Other codes

---

### 5.2 Lessons Tab

Where the course's content structure is built and managed. This is the most complex part of the editor.

#### Lesson Stepper

- Horizontal stepper showing all lessons in order
- Drag-and-drop reordering of lessons
- Keyboard navigation support
- "Add Lesson" action creates a new empty lesson
- Each step shows the lesson title and indicates the currently active lesson
- Summary panel shows counts by resource type and estimated duration for the selected lesson

#### Lesson Focused View

When a lesson is selected:

| Field | Type | Description |
|-------|------|-------------|
| Lesson Title | Inline text | Editable lesson name |
| Estimated Duration | Number (minutes) | Duration for this lesson |
| Lesson Type | Select | Standard lesson or Assessment |
| Reorder Controls | Buttons | Move lesson up/down in sequence |

#### Sections (Resources)

Each lesson contains an ordered list of sections. A section is a single content block.

| Section Type | Fields | Description |
|-------------|--------|-------------|
| **Text** | Rich HTML content | Edited with the built-in rich text editor. Supports headings, bold, italic, lists, links, glossary callout blocks, style linting, and optional AI toolbar. |
| **Link** | URL + Title | External URL with a display title |
| **Image** | File upload | Uploaded image file via the upload system |
| **Video** | File upload or URL + Duration (min/sec) | Uploaded video or external URL |
| **PDF** | File upload | Uploaded PDF document |

Section cards support:
- Inline editing (for text sections, the rich text editor opens directly)
- AI preview/transform modal (rewrite, expand, simplify)
- Drag-and-drop reordering within the lesson
- Deletion with confirmation

#### Resource Editor Drawer

A slide-out drawer for creating or editing a section in detail:
- Select resource type
- Enter title
- Type-specific fields (URL for links, content for text, file upload for media, duration for videos)
- File uploads capture filename, file size, and MIME type

#### Downloadable Resources

Each lesson can have attached supplementary files:

| Field | Type | Description |
|-------|------|-------------|
| Title | Text | Display name |
| URL | URL/file | File location |
| File Type | Auto-detected | PDF, DOCX, etc. |

These are separate from the lesson's main content sections.

#### AI Content Assistance

| Feature | Description |
|---------|-------------|
| AI Preview Modal | Select text content and apply AI transforms: rewrite for clarity, expand with more detail, simplify language |
| AI Chat Panel | Persistent chat interface for conversation with the AI assistant about course content. Maintains conversation history. |

#### Acceptance Criteria

- [ ] Horizontal lesson stepper with drag-and-drop reordering
- [ ] Add/remove lessons
- [ ] Lesson metadata editing (title, duration, type)
- [ ] All 5 section types can be created, edited, reordered, and deleted
- [ ] Text sections open the rich text editor inline
- [ ] Resource editor drawer with type-specific fields
- [ ] File uploads work for images, videos, and PDFs
- [ ] Downloadable resources can be added per lesson
- [ ] AI preview modal applies text transforms
- [ ] AI chat panel maintains conversation history
- [ ] Summary panel updates counts as sections are added/removed

---

### 5.3 Quiz Tab

See [Module 9 — Quiz Engine](#12-module-9--quiz-engine) for full quiz specification. The Quiz Tab within the editor provides:

- Toggle between course-level and lesson-level quiz scope
- Lesson picker for selecting which lesson's quiz to edit
- Full question management (add, edit, reorder, duplicate, delete)
- AI quiz generation modal
- Quiz preview (learner-style)
- Undo/redo support
- History tracking for quiz changes

---

### 5.4 Settings Tab

Course-level policies and behavioral configuration.

#### Progression Mode

| Mode | Behavior |
|------|----------|
| Linear | Learners must complete lessons in order |
| Free | Learners can access lessons in any order |

#### Completion Rules

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Require All Lessons | Toggle | true | Learner must complete every lesson |
| Require Passing Quiz | Toggle | false | Learner must pass the course quiz |
| Lock Next Until Previous Complete | Toggle | false | Enforces sequential lesson completion |
| Require Manual Completion | Toggle | false | Admin must manually mark complete |
| Require Quiz Pass to Complete Lesson | Toggle | false | Lesson-level quizzes must be passed |

#### Certificate Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Issue Certificate on Completion | Toggle | true | Whether a certificate is generated |
| Minimum Score for Certificate (%) | Number | — | Minimum quiz score for certificate |

#### Reminder & Retraining

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Retrain Interval (Days) | Number | — | How often the course must be retaken |
| Reminder Enabled | Toggle | false | Toggle reminders on/off |
| Reminder Days Before | Select + Custom | — | Days before due date to send reminder (preset options: 7, 14, 30 days + custom) |

#### Quiz Behavior

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Enable Retakes | Toggle | true | Whether learners can retake the quiz |
| Show Explanations | Toggle | true | Show answer explanations after submission |
| Max Quiz Attempts | Number | — | Limit on quiz attempts |
| Retake Cooldown (Minutes) | Number | — | Minimum wait between attempts |

#### Timing Rules

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| Min Video Watch % | Number (0–100) | — | How much of a video must be watched |
| Min Time on Lesson (Seconds) | Number | — | Minimum time on a lesson before completion |

#### Assignment Scope

Defines the default audience scope, primarily for onboarding flows:

| Scope | Description |
|-------|-------------|
| Company-wide | Assigned to all employees |
| Site | Assigned to specific sites (site ID selection) |
| Department | Assigned to specific departments (department ID selection) |
| Custom | Manual/custom targeting |

#### Acceptance Criteria

- [ ] All settings save per-course to the `CoursePolicy` object
- [ ] Progression mode toggle between Linear and Free
- [ ] All completion rules toggle correctly and persist
- [ ] Certificate settings tie into the issuance logic
- [ ] Reminder settings feed into the notification engine
- [ ] Quiz behavior settings enforce during learner quiz-taking
- [ ] Timing rules enforce during learner consumption
- [ ] Assignment scope selection with entity pickers for site/department

---

### 5.5 Assignment Tab

See [Module 7 — Course Assignments](#10-module-7--course-assignments) for full specification.

---

## 6. Module 3 — Admin Course List & Detail

### 6.1 Course List

**Route:** `/admin/courses`
**Access:** Admin and Manager

#### Table Columns

| Column | Description |
|--------|-------------|
| Title | Course name, with an "AI" chip if AI-generated |
| Tags | Up to 3 tags displayed, "+N" overflow indicator |
| Category | Course category |
| Created | Formatted creation date |
| Status | Color-coded badge (Draft, Published, AI Draft, In Review, Rejected) |
| Actions | Overflow menu (Edit, Delete — Admin only) |

#### Filters

| Filter | Type | Description |
|--------|------|-------------|
| Search | Text input | Filters by title or category |
| Status | Dropdown | Any status value |
| Category | Dropdown | Distinct categories across all courses |
| Clear Filters | Link | Shown when any filter is active |
| Result Count | Text | "Showing X of Y courses" |

#### Actions

| Action | Who | Behavior |
|--------|-----|----------|
| Row Click | All | Opens the course detail page |
| Edit | Admin | Navigates to the course editor |
| Delete | Admin | Confirmation dialog, then permanent delete |
| Create Course | Admin | Button navigating to the generation wizard |

#### Acceptance Criteria

- [ ] Table with all columns, sortable
- [ ] Search, status, and category filters
- [ ] AI chip indicator on AI-generated courses
- [ ] Color-coded status badges
- [ ] Row click → detail page
- [ ] Edit and Delete restricted to Admin
- [ ] "Create Course" button restricted to Admin
- [ ] Managers see the list in read-only mode
- [ ] Result count text

---

### 6.2 Course Detail Page

**Route:** `/admin/courses/[id]`
**Access:** Admin and Manager

A read-only summary view of a course.

#### Information Displayed

- Title, status badge, category, AI-generated indicator
- Description
- **Details panel:** Estimated time, lesson count, tags, skills granted, created/updated dates
- **Learning Objectives:** List from course metadata

#### Learner Progress Table

| Column | Description |
|--------|-------------|
| User Name | Assigned learner |
| Completion Status | Status badge |
| Lesson Progress | X of Y lessons completed |
| Quiz Score | Percentage or "—" |
| Completion Date | Date or "—" |

#### Learner Feedback

Displays submitted ratings and comments from learners who have completed the course.

#### Actions

- **Preview Course** — Opens the learner-style preview
- **Edit Course** — Navigates to the full editor (Admin only)

#### Acceptance Criteria

- [ ] All course metadata displayed
- [ ] Learner progress table with all assigned users
- [ ] Feedback section showing ratings and comments
- [ ] Preview and Edit actions
- [ ] Edit restricted to Admin

---

## 7. Module 4 — AI Review Workflow

When a course is created via the AI generation wizard, it enters a lightweight review workflow.

### AI Draft Banner

The course editor displays a prominent banner when the course status is `ai-draft` or `in-review`:

| Action | Behavior |
|--------|----------|
| View Conversation | Opens the AI chat history from the generation process |
| Reject | Opens a modal for rejection notes; sets status to `rejected`, records reviewer, timestamp, and notes |
| Approve & Publish | Sets status to `published`, records reviewer and timestamp, logs the synthesis history |

### Post-Decision State

| Decision | Display |
|----------|---------|
| Published | Info bar: "Published" with review timestamp |
| Rejected | Info bar: "Rejected" with review timestamp and rejection notes |

### Sidebar Badge

The admin sidebar shows a badge count on the **Courses** navigation item indicating how many courses are in `ai-draft` or `in-review` status.

### Course Owner

Every course has an owner (the admin who created it). Displayed in the editor header with a link to their user profile. Set at creation time.

### Acceptance Criteria

- [ ] AI Draft banner appears for `ai-draft` and `in-review` status courses
- [ ] View Conversation opens generation chat history
- [ ] Reject action collects notes and records reviewer metadata
- [ ] Approve & Publish action transitions to `published` with audit trail
- [ ] Post-decision info bars display correctly
- [ ] Sidebar badge counts `ai-draft` + `in-review` courses
- [ ] Course owner displayed in editor header with profile link

---

## 8. Module 5 — Course Preview (Admin)

**Route:** `/admin/courses/[id]/preview`
**Access:** Admin and Manager

A learner-style preview that lets admins/managers experience the course as a learner would see it, without tracking real progress.

### Features

- Navigate through lessons and their sections
- View rendered content (text, images, videos, PDFs, links)
- Take the quiz in preview mode (no scoring recorded)
- Exit back to the editor or course list

### Acceptance Criteria

- [ ] Full learner-style rendering of all section types
- [ ] Lesson navigation matches learner experience
- [ ] Quiz rendered in preview mode
- [ ] No progress or scores recorded
- [ ] Exit navigation back to editor/list

---

## 9. Module 6 — Learner Course Experience

### 9.1 My Courses (Learner Home)

**Route:** `/learner/courses`
**Access:** Learner

The learner's landing page showing all courses assigned to them. Only `published` courses appear.

#### Sorting & Prioritization

Courses are automatically sorted by urgency:
1. Overdue courses (past due date)
2. Due soon (within 7 days)
3. Has a due date (future)
4. In progress (started but no due date)
5. Alphabetical by title (not started, no due date)

#### Course Cards

Each card shows:
- Course title
- Progress indicator (percentage or bar)
- Due date with visual treatment (overdue = red, due soon = amber)
- "Resume" or "Start" action depending on progress state

#### Acceptance Criteria

- [ ] Only published, assigned courses appear
- [ ] Sorting by urgency priority
- [ ] Overdue/due-soon visual treatment on cards
- [ ] Progress indicator per card
- [ ] Start/Resume action per card
- [ ] Empty state when no courses assigned

---

### 9.2 Course Overview (Learner)

**Route:** `/learner/courses/[courseId]`
**Access:** Learner (assigned courses only)

When a learner selects a course, they see an overview page.

#### Display

- Course title and description
- Learning objectives list
- Lesson list with:
  - Lock/unlock indicators (based on progression policy — linear vs. free)
  - Completion status per lesson (checkmark, in-progress, locked)
  - Visual progress tracking
- Due date banner (if applicable, with overdue warning)

#### Actions

| State | Action |
|-------|--------|
| Not started | "Start Course" button |
| In progress | "Resume" button (takes to last incomplete lesson) |
| Completed | "Review" button (re-enter course in read mode) |

#### Acceptance Criteria

- [ ] Course metadata displayed (title, description, objectives)
- [ ] Lesson list with lock/unlock per progression policy
- [ ] Completion indicators per lesson
- [ ] Due date banner with overdue warning
- [ ] Start/Resume/Review actions based on state
- [ ] Inaccessible lessons visually locked in linear mode

---

### 9.3 Course Player

**Route:** `/learner/courses/[courseId]/lessons/[lessonId]`
**Access:** Learner (assigned, published courses)

The core learning experience.

#### Layout

| Area | Content |
|------|---------|
| Header | Course title, navigation breadcrumbs |
| Sidebar | Lesson list with progress indicators, collapsible |
| Main Content | Rendered lesson sections |
| Footer | Previous/Next navigation, progress bar |

#### Content Rendering

| Section Type | Rendering |
|-------------|-----------|
| Text | Full HTML with formatting, glossary callouts, images |
| Video | Video player with progress tracking (min watch % enforced per policy) |
| Image | Displayed inline with optional lightbox |
| PDF | Rendered viewer or download link |
| Link | Clickable external resource |

#### Timing & Progress Enforcement

| Rule | Behavior |
|------|----------|
| Min Time on Lesson | Timer tracks active time; lesson cannot be completed until minimum is met |
| Min Video Watch % | Video player tracks position; lesson blocked until threshold met |
| Linear Progression | Next lesson locked until current is complete |
| Quiz Gate | If "Require Quiz Pass to Complete Lesson" is on, quiz must be passed before proceeding |

#### Accessibility Features

| Feature | Description |
|---------|-------------|
| Text Size Adjustment | Increase/decrease font size |
| High Contrast Mode | Enhanced contrast for readability |
| Focus Mode | Distraction-free reading (hides sidebar) |

#### Lesson Completion

When all sections in a lesson are consumed and timing/video requirements are met:
1. Lesson can be marked complete
2. Next lesson unlocks (if linear progression)
3. Lesson-level quiz presented (if required)
4. Progress updates on course overview

#### Acceptance Criteria

- [ ] All 5 section types render correctly
- [ ] Sidebar navigation with progress indicators
- [ ] Previous/Next lesson navigation
- [ ] Minimum time enforcement (cannot complete early)
- [ ] Video watch percentage tracking and enforcement
- [ ] Linear progression locks next lesson until current is complete
- [ ] Accessibility: text size, high contrast, focus mode
- [ ] Lesson completion triggers progress update
- [ ] Quiz gate blocks advancement when configured
- [ ] Responsive layout for desktop and tablet

---

### 9.4 Course Completion

When all completion criteria are met (all lessons done, quiz passed if required):

#### Completion Summary Screen

| Element | Description |
|---------|-------------|
| Final Score | Quiz percentage (if applicable) |
| Time Spent | Total time across all lessons |
| Skills Earned | List of skills granted by the course |
| Certificate | Download link (if issued per policy) |

#### Side Effects on Completion

1. **Course progress** set to `completed` with timestamp
2. **Skills granted** — For each skill in `Course.skillsGranted[]`, a `UserSkillRecord` is created on the learner's profile with the course as evidence
3. **Certificate issued** — If `issueCertificateOnComplete` is enabled and the learner meets the minimum score threshold, a `Certificate` record is created with a unique serial number
4. **Training completion** — The corresponding `TrainingCompletion` record is updated to `completed`, feeding the compliance engine
5. **Feedback prompt** — Learner can submit a rating (1–5) and comment about the course

#### Acceptance Criteria

- [ ] Completion summary displays all elements
- [ ] Skills auto-granted with course as evidence source
- [ ] Certificate auto-issued when policy allows and score threshold met
- [ ] Training completion record updated for compliance tracking
- [ ] Feedback prompt with rating and comment
- [ ] "Back to My Courses" navigation

---

## 10. Module 7 — Course Assignments

### Assignment Targets

Courses can be assigned via four targeting methods:

| Method | Description | Resolution |
|--------|-------------|------------|
| User | Assign directly to specific individuals | Direct — selected users |
| Role | Assign to everyone with a specific job role | Resolves to all users with that `jobTitleId`, optionally scoped to specific sites or departments |
| Site | Assign to all users at specific sites | Resolves to all users at selected sites |
| Department | Assign to all users in specific departments | Resolves to all users in selected departments |

### Assignment Details

| Field | Type | Required | Description |
|-------|------|:--------:|-------------|
| Due Date | Date picker | No | When the assignment is due |
| Notes | Textarea | No | Free-text notes (e.g., "Complete before Q3 audit") |
| Assigner | Auto-set | — | Tracked automatically as the admin who created the assignment |

### Assignment Resolution Modal

For role/site/department assignments, an Assignment Resolve Modal shows the resolved list of individual users who match the criteria, so the admin can see exactly who is affected before confirming.

### User-Side Assignment

From the User Profile page (`/admin/users/[id]`), admins can assign courses to individual users:

| Field | Type | Notes |
|-------|------|-------|
| Course Picker | Multi-select | Filtered to published courses only |
| Due Date | Presets + Custom | 7 days, 14 days, 30 days, 60 days, 90 days, or custom date |

### Compliance Bridge

When a course is assigned to a user, the system also creates:
1. A **Training** record (if one doesn't exist for that course)
2. A **TrainingCompletion** record with status `assigned`

This bridges the course system into the compliance module, enabling:
- Compliance dashboard tracking of course-based trainings
- Retrain interval enforcement
- Audit snapshot inclusion

### CourseAssignment Data Model

```typescript
interface CourseAssignment {
  id: string;
  courseId: string;
  assignedBy: string;
  assignedAt: string;
  dueDate?: string;
  notes?: string;
  targetType: "user" | "role" | "site" | "department";
  targetId: string;
  targetSiteIds?: string[];
  targetDepartmentIds?: string[];
}
```

### Acceptance Criteria

- [ ] Assignment by user, role, site, and department
- [ ] Due date picker with preset and custom options
- [ ] Notes field
- [ ] Assignment resolution modal for group targets
- [ ] User-side assignment from user profile
- [ ] Compliance bridge: Training + TrainingCompletion records created on assignment
- [ ] Only published courses can be assigned
- [ ] Assigner tracked automatically

---

## 11. Module 8 — Course Progress & Tracking

### Progress Entities

#### Course-Level Progress

```typescript
interface ProgressCourse {
  id: string;
  courseId: string;
  userId: string;
  status: "not_started" | "in_progress" | "completed";
  startedAt?: string;
  completedAt?: string;
  score?: number;           // Quiz score if applicable
  timeSpentMinutes?: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  lastLessonId?: string;    // For "Resume" functionality
  feedbackRating?: number;  // 1-5 star rating
  feedbackComment?: string;
}
```

#### Lesson-Level Progress

```typescript
interface ProgressLesson {
  id: string;
  courseId: string;
  lessonId: string;
  userId: string;
  status: "not_started" | "in_progress" | "completed";
  startedAt?: string;
  completedAt?: string;
  timeSpentSeconds?: number;
  videoWatchPct?: number;
  sectionsViewed?: string[];  // Track which sections were viewed
}
```

### Progress Tracking Rules

| Rule | Implementation |
|------|---------------|
| Section viewed | Mark section ID in `sectionsViewed` array |
| Time tracking | Track `timeSpentSeconds` per lesson; compare against `minTimeOnLessonSec` policy |
| Video tracking | Track `videoWatchPct`; compare against `minVideoWatchPct` policy |
| Lesson complete | All sections viewed + timing requirements met + quiz passed (if required) |
| Course complete | All lessons completed (if `requireAllLessons`) + course quiz passed (if `requirePassingQuiz`) |

### Resume Logic

When a learner clicks "Resume" on a course:
1. Find the `lastLessonId` from `ProgressCourse`
2. Navigate to that lesson
3. If no `lastLessonId`, find the first incomplete lesson

### Acceptance Criteria

- [ ] Course-level progress tracks status, score, time, and lesson counts
- [ ] Lesson-level progress tracks status, time, video percentage, and sections viewed
- [ ] All timing rules enforce correctly
- [ ] Resume navigates to the correct lesson
- [ ] Completion triggers side effects (skills, certificate, compliance)
- [ ] Progress persists across browser sessions (within the prototype's in-memory store)

---

## 12. Module 9 — Quiz Engine

### Quiz Scope

| Scope | Description |
|-------|-------------|
| Course Quiz | A single quiz for the entire course |
| Lesson Quizzes | Individual quizzes attached to specific lessons |

### Question Types

The system supports seven question types:

| # | Type | Input | Grading |
|---|------|-------|---------|
| 1 | **Multiple Choice (MCQ)** | Radio buttons for single answer | Exact match |
| 2 | **True/False** | Binary radio | Exact match |
| 3 | **Scenario** | Situational context + answer options | Exact match on selected option |
| 4 | **Short Text** | Free-text input | Manual review (or keyword match) |
| 5 | **Multi-Select** | Checkboxes for multiple answers | All-or-nothing OR partial credit (configurable) |
| 6 | **Numeric** | Number input | Within tolerance range |
| 7 | **Ordering** | Drag items into sequence | Exact sequence match |

### Question Data Model

```typescript
interface Question {
  id: string;
  quizId: string;
  type: "mcq" | "true_false" | "scenario" | "short_text" |
        "multi_select" | "numeric" | "ordering";
  prompt: string;
  options?: Array<{ id: string; text: string; isCorrect: boolean }>;
  correctAnswer?: string | string[];
  points: number;
  required: boolean;
  explanation?: string;       // Shown to learner post-submission
  rationale?: string;         // Internal note, not shown to learners
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  language?: string;
  // Type-specific fields
  tolerance?: number;         // Numeric: acceptable range
  gradingMode?: "all_or_nothing" | "partial_credit";  // Multi-select
}
```

### Question Editor (Edit Question Modal)

| Field | Description |
|-------|-------------|
| Prompt | The question text |
| Options | Answer choices (for applicable types) |
| Correct Answer(s) | Which option(s) are correct |
| Points | Point value |
| Required | Whether the question must be answered |
| Explanation | Shown to learner after answering (if enabled in settings) |
| Rationale | Internal note for why the answer is correct |
| Difficulty | easy / medium / hard |
| Tags | For categorizing/filtering questions |
| Language | Per-question language setting |
| Tolerance | For numeric type: acceptable range |
| Grading Mode | For multi-select: all-or-nothing vs. partial credit |

### AI Quiz Generation

A dedicated modal for AI-powered question generation.

#### Source Selection

| Source | Description |
|--------|-------------|
| From a specific lesson | Uses that lesson's text content |
| From the entire course | Uses all lesson content |
| From an uploaded PDF | Extracts text from uploaded file |
| From manually entered text | Admin pastes custom source text |

#### Configuration

| Setting | Options |
|---------|---------|
| Number of Questions | 1–20 |
| Difficulty Level | Easy, Medium, Hard |
| Question Types | Select which types to include |
| Bloom's Taxonomy Level | Remember, Understand, Apply, Analyze, Evaluate, Create |

#### Review Flow

Generated questions are presented for review. The admin selects which ones to import into the quiz.

### Quiz Taking (Learner)

When a learner encounters a quiz:

1. Questions presented according to configuration (shuffled or sequential)
2. All seven question types rendered with appropriate input controls
3. Learner answers and submits
4. Score calculated immediately
5. Explanations shown (if enabled in settings)
6. Pass/fail determined based on `passingScorePct`
7. Retakes available (if enabled, subject to `maxQuizAttempts` and `retakeCooldownMinutes`)

### Quiz Attempt Tracking

```typescript
interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  courseId: string;
  attemptNumber: number;
  score: number;
  passed: boolean;
  answers: GradedQuestion[];
  startedAt: string;
  submittedAt: string;
}

interface GradedQuestion {
  questionId: string;
  pointsAwarded: number;
  pointsPossible: number;
  userAnswer: string | string[];
  isCorrect: boolean;
}
```

### Quiz Preview (Admin)

A learner-style preview of the quiz, rendered as it would appear to a learner. Respects the shuffle setting if enabled. No scores recorded.

### Acceptance Criteria

- [ ] All 7 question types can be created and edited
- [ ] Question editor modal with all fields
- [ ] Drag-and-drop question reordering
- [ ] Duplicate and delete questions
- [ ] Undo/redo for quiz changes
- [ ] AI quiz generation from 4 source types
- [ ] Bloom's taxonomy level selection for AI generation
- [ ] Review and selectively import AI-generated questions
- [ ] Course-level and lesson-level quiz scoping
- [ ] Learner quiz interface renders all 7 types correctly
- [ ] Auto-grading with score calculation
- [ ] Pass/fail determination based on threshold
- [ ] Retake logic with attempt limits and cooldown
- [ ] Explanations shown post-submission when enabled
- [ ] Quiz attempt history tracked
- [ ] Admin quiz preview mode

---

## 13. Module 10 — Certification System

### Certificate Templates

**Route:** `/admin/settings/customization?tab=certificates`
**Access:** Admin only

Admins create and manage reusable certificate templates.

#### Template Data Model

```typescript
interface CertificateTemplate {
  id: string;
  name: string;
  isDefault?: boolean;
  backgroundUrl?: string;       // Custom background image
  primaryColor?: string;        // Hex color for primary elements
  accentColor?: string;         // Hex color for accent elements
  showOrgLogo?: boolean;        // Display organization logo
  showSignatures?: boolean;     // Display signature block
  fields: {
    showCourseTitle?: boolean;  // Display the course name
    showUserName?: boolean;     // Display the learner's name
    showIssuedAt?: boolean;     // Display the issue date
    showSerial?: boolean;       // Display the certificate serial number
    showCustomText?: boolean;   // Display custom text block
    customText?: string;        // The custom text content
  };
  signatures?: Array<{
    title: string;              // e.g., "Training Director"
    name: string;               // e.g., "Jane Smith"
  }>;
  createdAt: string;
  updatedAt: string;
}
```

#### Template Management UI

| Action | Description |
|--------|-------------|
| Create Template | Opens a form to define a new template with all configurable fields |
| Edit Template | Modify an existing template |
| Set as Default | Mark a template as the default for all new certificates |
| Preview | Visual preview of how the certificate will look |

#### Template Form Fields

| Section | Fields |
|---------|--------|
| Identity | Name |
| Appearance | Background image upload, primary color picker, accent color picker |
| Content | Toggle: show course title, show user name, show issued date, show serial number, show custom text + custom text input |
| Branding | Toggle: show org logo |
| Signatures | Add/remove signature rows (title + name pairs), toggle signature block visibility |

### Certificate Issuance

Certificates are automatically issued when a learner completes a course, subject to policy:

#### Issuance Conditions

1. `CoursePolicy.issueCertificateOnComplete` must be `true`
2. If `CoursePolicy.minScoreForCertificatePct` is set, the learner's quiz score must meet or exceed it
3. All other completion criteria must be met

#### Certificate Record

```typescript
interface Certificate {
  id: string;
  courseId: string;
  userId: string;
  issuedAt: string;
  expiresAt?: string;          // Based on retrainIntervalDays
  serial: string;              // Unique serial number
  courseTitle?: string;
  userName?: string;
  orgName?: string;
  templateId?: string;         // Links to the template used
  pdfUrl?: string;             // Generated PDF location
}
```

#### Expiration Logic

If the course has a `retrainIntervalDays` policy, the certificate's `expiresAt` is calculated as `issuedAt + retrainIntervalDays`. Expired certificates drive retraining reminders.

### Learner Certificate Access

**Route:** `/learner/certificates`
**Access:** Learner

Learners can view all their earned certificates:
- List of certificates with course name, issued date, expiry date, serial number
- Download as PDF
- Visual rendering using the template

### Certificate PDF Export

Certificates can be exported as PDF documents that include:
- Template styling (colors, background, branding)
- Course title, learner name, issue date, serial number
- Signature block (if configured)
- Organization logo (if configured)
- Custom text (if configured)

### Acceptance Criteria

- [ ] Template CRUD (create, read, update)
- [ ] Default template designation
- [ ] Template form with all configurable fields (appearance, content toggles, signatures)
- [ ] Background image upload for templates
- [ ] Color pickers for primary and accent colors
- [ ] Signature rows: add/remove with title and name
- [ ] Auto-issuance on course completion when policy allows
- [ ] Score threshold enforcement for certificate issuance
- [ ] Expiration calculation from retrain interval
- [ ] Unique serial number generation
- [ ] Learner certificates page with list and download
- [ ] PDF export with template styling
- [ ] Certificate links to the template used

---

## 14. Module 11 — Notifications & Reminders

### Reminder System

The reminder engine evaluates reminder rules against training completion records and fires notifications.

#### Reminder Triggers

| Trigger | Condition | Recipient |
|---------|-----------|-----------|
| Upcoming Due | Training due date within `reminderDaysBefore` window | Learner |
| Overdue | Training past due date | Learner + Manager |
| Retraining Due | Certificate approaching expiration based on `retrainIntervalDays` | Learner |
| Escalation | Overdue for more than X days | Manager + Admin |

#### Reminder Configuration

**Route:** `/admin/settings/notifications`
**Access:** Admin only

| Setting | Type | Description |
|---------|------|-------------|
| Upcoming Due Reminder | Toggle + Days | Enable/disable + how many days before due date |
| Overdue Reminder | Toggle + Frequency | Enable/disable + how often to re-remind |
| Retraining Reminder | Toggle + Days | Enable/disable + how far before expiry |
| Escalation | Toggle + Days | Enable/disable + days overdue before escalating |
| Escalation Target | Select | Who receives escalation (Manager, Admin, both) |

### Notification Types

| Type | Description | Audience |
|------|-------------|----------|
| Course Assigned | New course has been assigned | Learner |
| Due Date Approaching | Course due date within reminder window | Learner |
| Overdue | Course is past due | Learner, Manager |
| Course Completed | Learner has completed a course | Manager (optional) |
| Certificate Issued | Certificate generated for learner | Learner |
| Retraining Required | Certificate expiring, retake needed | Learner |
| Escalation | Prolonged overdue, escalated to management | Manager, Admin |

### Notification Data Model

```typescript
interface Notification {
  id: string;
  type: string;
  subject: string;
  body: string;
  recipientId: string;
  readAt?: string;
  sentAt: string;
  courseId?: string;
  trainingId?: string;
}
```

### Admin Notification Archive

**Route:** `/admin/notifications`
**Access:** Admin and Manager

- List of all system notifications with date, type, recipient, and status
- Filter by date, recipient, type
- AI-assisted notification copy generation for compliance-style messages

### Learner Notification View

**Route:** `/learner/notifications`
**Access:** Learner

- List of notifications received (course assignments, reminders, certificates)
- Read/unread state
- Click to navigate to the relevant course or certificate

### Acceptance Criteria

- [ ] Reminder rules configurable in settings
- [ ] Upcoming due reminders fire at configured interval
- [ ] Overdue reminders fire for past-due assignments
- [ ] Retraining reminders fire based on certificate expiry
- [ ] Escalation to manager/admin after configured delay
- [ ] All 7 notification types generated appropriately
- [ ] Admin notification archive with filters
- [ ] Learner notification list with read/unread state
- [ ] Notifications link to relevant course/certificate
- [ ] AI-assisted notification copy generation

---

## 15. Module 12 — Analytics & Reporting

**Route:** `/admin/analytics`
**Access:** Admin (full org), Manager (scoped to site/department)

### KPI Cards

| Metric | Description |
|--------|-------------|
| Completion Rate | % of assigned trainings that are completed |
| Active Learners | Count of learners with in-progress courses |
| Overdue Count | Trainings past due date |
| Training Coverage | % of required skills covered by completed courses |

### Charts & Visualizations

| View | Description |
|------|-------------|
| Completion by Department | Bar chart breaking down completion rates per department |
| Completion Trends | Time-series line chart of completions over weeks/months |
| Status Mix | Pie/donut chart of training statuses (Complete, In-Progress, Overdue, Not Started) |
| Skill Coverage | Heatmap or bar chart showing skill requirement fulfillment across the org |

### AI Insights

AI-generated observations surfaced as insight cards:
- "3 courses are nearly complete and could be published"
- "Warehouse team has 12 overdue trainings — highest in the org"
- "PPE Safety certification expires for 8 employees next month"

### Scope Filtering

Analytics can be scoped by:
- Organization level (full org)
- Site
- Department

### Content Health

A content health indicator evaluating the currency and completeness of course content:
- Courses with outdated content (last updated > X months ago)
- Courses with missing quizzes
- Courses with low completion rates

### Acceptance Criteria

- [ ] 4 KPI cards with real-time data
- [ ] Completion by department chart
- [ ] Completion trends time-series chart
- [ ] Status distribution chart
- [ ] Skill coverage visualization
- [ ] AI insight cards (at least 3 insights)
- [ ] Scope filtering by org/site/department
- [ ] Content health indicator
- [ ] Manager view scoped to their site/department

---

## 16. Module 13 — Library Integration

The Library module serves as the source material repository for course creation.

### In Course Generation (AI Wizard Step 2)

- Library picker shows items with `allowedForSynthesis = true`
- Multi-select with search and filtering
- Selected items become the AI's knowledge base for course content
- Source attributions tracked on the generated course

### In Lesson Building (Course Editor)

- Library Picker component for browsing and selecting library content
- Grid/list view toggle with filters (type, category, tags)
- Selected items can be linked as course sections/resources

### Library Item Types

| Type | Description |
|------|-------------|
| PDF | Policy documents, SOPs, reference guides |
| Video | Training recordings, demonstrations |
| Link | External URLs (YouTube, SharePoint, etc.) |
| Image | Diagrams, photos, infographics |
| Document | Word docs, presentations |
| Text | Plain text content |

### AI Enablement Toggle

Managed in **Learning Model → Sources tab**. Each library item has an `allowedForSynthesis` boolean that controls whether the AI can use it as generation source material.

### Acceptance Criteria

- [ ] Library picker in AI generation wizard (filtered to `allowedForSynthesis = true`)
- [ ] Library picker in lesson builder
- [ ] Grid/list view with filters
- [ ] Selected library items used as AI generation source
- [ ] Source attribution on generated courses
- [ ] AI enablement managed in Learning Model Sources tab

---

## 17. Module 14 — Learner Skills Passport

**Route:** `/learner/passport`
**Access:** Learner (own), Manager (team), Admin (all)

A dedicated page where learners view all skills they've earned across courses.

### Skills Display

| Field | Description |
|-------|-------------|
| Skill Name | Name of the competency |
| Category | Skill category (Safety, Equipment, Compliance, Technical) |
| Type | Skill or Certification |
| Source | Which course granted this skill |
| Achieved Date | When the skill was earned |
| Expiry | Expiration date (for certifications with `expiryDays`) |
| Status | Active, Expired, Expiring Soon |

### Visual Elements

- Progress summary: total skills earned, certifications held, skills expiring soon
- Category breakdown (grouped by category)
- Expiry timeline (visual indicator of upcoming expirations)

### Data Source

Skills Passport pulls from `UserSkillRecord` entries created when courses are completed. Skill definitions, expiry rules, and prerequisite chains are managed in the Skills module and Learning Model.

```typescript
interface UserSkillRecord {
  id: string;
  userId: string;
  skillId: string;
  status: "active" | "expired" | "pending" | "revoked" |
          "suspended" | "renewing" | "expiring";
  achievedDate?: string;
  expiryDate?: string;
  evidenceCourseId?: string;   // The course that granted this skill
  evidenceType?: string;
  notes?: string;
}
```

### Acceptance Criteria

- [ ] Skills list with all fields (name, category, type, source, dates, status)
- [ ] Summary stats: total skills, certifications, expiring soon
- [ ] Category grouping
- [ ] Expiry visual indicator
- [ ] Links to the source course
- [ ] Active/Expired/Expiring status badges
- [ ] Learner sees own skills; Manager sees team; Admin sees all

---

## 18. Module 15 — Settings & Customization

**Route:** `/admin/settings/customization`
**Access:** Admin only

The customization settings page is organized into three tabs.

### 15.1 Brand Tab

| Setting | Type | Description |
|---------|------|-------------|
| Organization Logo | File upload | Logo displayed on learner views, certificates, and exports |
| Primary Color | Color picker | Primary brand color (sets CSS variable `--primary-color`) |
| Accent Color | Color picker | Secondary accent color |
| Favicon | File upload | Browser tab icon |

Brand settings propagate dynamically through a `BrandProvider` context.

### 15.2 Certificates Tab

Full certificate template management. See [Module 10 — Certification System](#13-module-10--certification-system) for complete specification.

### 15.3 Localization Tab

| Setting | Type | Description |
|---------|------|-------------|
| Default Language | Select | Primary language for the platform (English, Spanish) |
| Date Format | Select | MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD |
| Time Zone | Select | Organization's primary timezone |
| Number Format | Select | 1,000.00 vs 1.000,00 |

### Content Standards (Learning Model)

Additional content configuration lives in the Learning Model module (`/admin/learningmodel?tab=content-standards`):

| Setting | Description |
|---------|-------------|
| Preferred Writing Tone | Plain, Professional, Friendly |
| Preferred Terms | Term replacement pairs (e.g., "worker" → "Maintenance Partner") |
| Banned Terms | Terms that should never appear in content |
| Default Passing Score | Default quiz passing percentage for new courses |
| Default Recertification Period | Annual, Bi-Annual, Every 2 Years, Every 3 Years |
| Custom AI Instructions | Free-text context included in every AI generation |

### Acceptance Criteria

- [ ] Brand tab: logo upload, color pickers, favicon upload
- [ ] Brand colors apply dynamically across the app
- [ ] Certificates tab: full template management (see Module 10)
- [ ] Localization tab: language, date format, timezone, number format
- [ ] Content Standards accessible in Learning Model
- [ ] All settings persist and apply immediately

---

## 19. Module 16 — Rich Text Editor & AI Toolbar

The built-in content editor is used across lesson sections, AI preview, and course descriptions.

### Core Capabilities

| Feature | Description |
|---------|-------------|
| Headings | H1–H4 levels |
| Inline Formatting | Bold, italic |
| Lists | Ordered and unordered |
| Links | Inline hyperlinks |
| Glossary Callouts | Special block format for key term definitions (highlighted callout box) |
| Style Linting | Real-time warnings about formatting issues (inconsistent heading levels, overly long paragraphs, etc.) |

### AI Toolbar (Optional, Toggle-able)

| Transform | Description |
|-----------|-------------|
| Rewrite | Rewrite selected text for clarity |
| Expand | Add more detail to selected text |
| Simplify | Simplify language for lower reading levels |

### Tone & Readability Meter

A companion widget that evaluates:
- Reading level of the content (Basic, Standard, Technical)
- Tone consistency with the Content Standards setting
- Content length metrics

### Style Audit Integration

The editor integrates with the organization's Content Standards (from Learning Model):
- Flags banned terms
- Suggests preferred term replacements
- Checks tone consistency

### Acceptance Criteria

- [ ] Full formatting toolbar (headings, bold, italic, lists, links)
- [ ] Glossary callout block insertion
- [ ] Style linting with real-time warnings
- [ ] AI toolbar with rewrite/expand/simplify transforms
- [ ] Tone & readability meter
- [ ] Style audit checks against Content Standards
- [ ] Works in lesson sections, course descriptions, and AI preview

---

## 20. Module 17 — File Upload System

A general-purpose upload system used across course creation.

### Upload Component

| Feature | Description |
|---------|-------------|
| Dropzone | Drag-and-drop or click-to-browse |
| Progress | Upload progress indicator |
| Preview | Thumbnail preview for images |
| Delete | Remove uploaded files |

### Used In

| Context | Accepted Types |
|---------|---------------|
| Image sections | JPEG, PNG, GIF, WebP |
| Video sections | MP4, WebM |
| PDF sections | PDF |
| Downloadable resources | PDF, DOCX, XLSX, PPTX |
| AI quiz generation (PDF source) | PDF |
| Certificate template background | JPEG, PNG |
| Brand logo/favicon | JPEG, PNG, SVG, ICO |

### Tracked Metadata

| Field | Description |
|-------|-------------|
| Filename | Original file name |
| File Size | Size in bytes |
| MIME Type | File type identifier |
| URL | Upload location path |

### API Surface

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload` | POST | Upload a file |
| `/api/upload/delete` | POST | Delete an uploaded file |

### Acceptance Criteria

- [ ] Drag-and-drop upload works
- [ ] Click-to-browse upload works
- [ ] File type validation per context
- [ ] Upload progress indicator
- [ ] Image thumbnail preview
- [ ] File deletion
- [ ] Metadata tracked (filename, size, MIME type, URL)

---

## 21. Data Model Reference

### Entity Relationship Map

```
Course
  ├── CoursePolicy             (1:1 embedded)
  ├── Lessons[]                (1:many, ordered)
  │     ├── Resources[]        (1:many per lesson, ordered — also called Sections)
  │     ├── DownloadableResources[]
  │     └── Quiz?              (0:1 per lesson)
  ├── Quiz?                    (0:1 course-level)
  │     └── Questions[]        (1:many, ordered)
  ├── CourseAssignment[]       (1:many)
  ├── ProgressCourse[]         (1:many — one per learner)
  │     └── ProgressLesson[]   (1:many — one per lesson per learner)
  ├── Certificate[]            (1:many — one per learner upon completion)
  ├── QuizAttempt[]            (1:many — per learner per quiz)
  └── CourseFeedback[]         (1:many — post-completion ratings)

CertificateTemplate[]          (standalone, referenced by Certificate.templateId)

Training                       (bridge entity — one per course for compliance)
  └── TrainingCompletion[]     (one per user assignment)

UserSkillRecord[]              (created on course completion, links user ↔ skill)

Notification[]                 (generated by reminder engine)
```

### Key Type Definitions

All types are defined in `/types.ts`. The major Phase 2 entities:

| Entity | Description |
|--------|-------------|
| `Course` | Top-level course container with title, description, metadata, skills, policy |
| `CoursePolicy` | Embedded policy object controlling progression, completion, quiz, timing, and certificate rules |
| `Lesson` | Ordered content container within a course |
| `Resource` (Section) | Single content block (text/link/image/video/PDF) within a lesson |
| `Quiz` | Container for questions, attached to a course or lesson |
| `Question` | Individual quiz question with type, options, grading config |
| `CourseAssignment` | Links a course to a target (user/role/site/department) with due date |
| `ProgressCourse` | Learner's overall course progress |
| `ProgressLesson` | Learner's per-lesson progress |
| `Certificate` | Issued certificate record with serial, expiry, template link |
| `CertificateTemplate` | Reusable certificate design template |
| `QuizAttempt` | Record of a learner's quiz submission with graded answers |
| `GradedQuestion` | Per-question grade within a quiz attempt |
| `UserSkillRecord` | Links a user to a skill, with status, evidence, and expiry |

---

## 22. Cross-Module Dependency Map

| Module | Depends On | Feeds Into |
|--------|-----------|------------|
| AI Course Generation | Library (sources), Learning Model (org profile, content standards, skills, job titles) | Course Editor |
| Course Editor | Skills catalog, Library picker, File upload | Course List, Preview |
| Course Assignments | User Management, Course (published only) | Progress Tracking, Compliance Bridge, Notifications |
| Progress Tracking | Course Player (timing, sections), Quiz Engine | Course Completion, Analytics |
| Quiz Engine | Course content (for AI generation) | Progress Tracking, Certificate Issuance |
| Certification | Course Completion, Certificate Templates | Learner Certificates, Compliance |
| Notifications | Assignments (due dates), Completion records, Certificate expiry | Learner notifications, Admin archive |
| Analytics | Progress, Assignments, Skills, Completions | Admin dashboards |
| Skills Passport | UserSkillRecords (from course completion) | Learner profile |
| Library | File uploads | AI generation, Course editor |
| Compliance Bridge | Course Assignments | Training records, Compliance dashboard |

---

## 23. Build Sequence Recommendation

Based on dependency analysis, the recommended build order:

```
Phase 2A — Foundation
  1. File Upload System (used by everything)
  2. Rich Text Editor (used by course editor and preview)
  3. Data models and store functions for all Phase 2 entities

Phase 2B — Core Authoring
  4. Course Editor — Overview Tab (course CRUD)
  5. Course Editor — Lessons Tab (sections, drag-and-drop)
  6. Course Editor — Quiz Tab (question CRUD, 7 types)
  7. Course Editor — Settings Tab (policy configuration)
  8. Admin Course List (table, filters, actions)
  9. Admin Course Detail Page

Phase 2C — AI Layer
  10. AI Course Generation Wizard (2-step + build animation)
  11. AI Review Workflow (draft banner, approve/reject, sidebar badge)
  12. AI Quiz Generation (from 4 source types)
  13. AI Content Assistance (preview modal, chat panel, toolbar)

Phase 2D — Learner Experience
  14. My Courses grid (learner home)
  15. Course Overview (learner)
  16. Course Player (section rendering, timing enforcement)
  17. Quiz Taking (learner interface, all 7 types)
  18. Course Completion flow (summary, skills, feedback)

Phase 2E — Assignments & Tracking
  19. Course Assignment (4 target types, compliance bridge)
  20. Progress Tracking (course + lesson level)
  21. Admin Course Preview

Phase 2F — Certificates & Notifications
  22. Certificate Template Management (settings)
  23. Certificate Issuance and Learner Certificates page
  24. Certificate PDF Export
  25. Notification/Reminder Engine
  26. Learner Notification View

Phase 2G — Analytics & Passport
  27. Analytics Dashboard (KPIs, charts, AI insights)
  28. Skills Passport (learner view)
  29. Settings — Brand, Localization
```

---

## 24. Current Limitations & Future Enhancements

### Known Limitations

| # | Limitation | Impact |
|---|-----------|--------|
| 1 | No course duplication or templating | Every course created from scratch or via AI |
| 2 | No course archiving | Only permanent deletion available |
| 3 | No bulk operations on course list | No multi-select for publish, assign, or delete |
| 4 | No sorting on course list | Courses display in default order only |
| 5 | No formal multi-step approval workflow | AI review uses status fields and banner, not a reviewer queue |
| 6 | No cross-course prerequisites | `skillsRequired` in data model but not enforced as gating |
| 7 | No course owner reassignment | Owner set at creation, no UI to change |
| 8 | No real external integrations | CMMS/EHS described in docs/UI but not implemented |
| 9 | In-memory data only | No database; data lost on server restart |
| 10 | No email delivery | Notifications are in-app only |

### Future Enhancement Candidates

| Enhancement | Description |
|-------------|-------------|
| Course Duplication/Cloning | Clone an existing course as a starting point |
| Course Archiving | Soft-archive instead of permanent delete |
| Bulk Operations | Multi-select courses for batch publish/assign/delete |
| Formal Approval Workflow | Multi-step approval chain with reviewer queues |
| Cross-Course Prerequisites | Enforce skillsRequired as a gating mechanism |
| SCORM/xAPI Support | Import external LMS content packages |
| Multilingual Content | Auto-translate courses into multiple languages |
| Course Versioning | Version control with diff view and rollback |
| Gamification | Badges, leaderboards, streaks |
| Mobile Native | Native iOS/Android learner app |

---

## 25. Glossary

| Term | Definition |
|------|------------|
| **Course** | A structured learning experience containing lessons, quizzes, and metadata |
| **Lesson** | An ordered content container within a course, composed of sections |
| **Section (Resource)** | A single content block within a lesson (text, link, image, video, or PDF) |
| **Quiz** | An assessment attached to a course or lesson, containing questions |
| **Question** | An individual assessment item within a quiz |
| **Course Assignment** | A record linking a course to a target (user, role, site, or department) with a due date |
| **Progress** | Tracking entities (course-level and lesson-level) recording a learner's advancement |
| **Certificate** | A credential issued upon course completion, based on a template |
| **Certificate Template** | A reusable design configuration for certificates (colors, branding, fields, signatures) |
| **Skills Passport** | A learner-facing portfolio of all skills and certifications earned |
| **UserSkillRecord** | A record linking a user to a skill they've earned, with evidence and expiry |
| **Compliance Bridge** | The mechanism that creates Training/TrainingCompletion records when courses are assigned, feeding the compliance module |
| **Synthesis** | The AI content generation process (generating a course from inputs) |
| **AI Draft** | A course status indicating it was generated by AI and is pending human review |
| **Learning Model** | The admin configuration console for organization profile, content standards, job titles, skills, and sources |
| **Library** | The centralized repository of source materials (PDFs, videos, links) used in course creation |
| **Content Standards** | Organization-level rules for writing tone, terminology, and AI behavior |
| **CoursePolicy** | Embedded configuration object controlling progression, completion, quiz, timing, and certificate rules for a course |
| **Retrain Interval** | How often a course must be retaken (drives certificate expiry and retraining reminders) |
| **Escalation** | Automatic notification to a manager or admin when a learner is overdue beyond a threshold |
