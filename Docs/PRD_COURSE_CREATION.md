# PRD: Course Creation & Management

**Last updated:** March 27, 2026
**Audience:** Engineering team (product perspective)
**Status:** Living document — reflects the current prototype state

---

## 1. Overview

Course Creation is the central authoring workflow in the LMS. It allows administrators to generate, build, edit, publish, assign, and manage learning courses that are consumed by learners (technicians, operators, field workers). The system is AI-first — course creation begins with an AI generation wizard that produces a full draft, which an admin then reviews, refines, and publishes.

The course creation surface touches nearly every other module in the platform: Skills, Compliance, Onboarding, Library, Analytics, Notifications, and User Management.

**Content hierarchy:** Course → Lessons → Sections (also called Resources internally). There is no intermediate "Module" layer.

---

## 2. User Roles & Permissions

Three roles interact with courses, each with different levels of access:

### Admin
- Full access to all course features
- Can create, edit, publish, delete, and assign courses
- Can manage AI-generated drafts (approve, reject)
- Can access the Learning Model (skills catalog, job titles, sources)
- Can manage all settings, including course policies and scope

### Manager
- Can view the course list and open courses
- Can view course details and preview courses
- Cannot create new courses
- Cannot delete courses
- Cannot change course status (draft/published/etc.)
- Sees a read-only or restricted version of the editor for most controls
- Can view assignments but has limited assignment capabilities

### Learner
- Can view and consume assigned, published courses only
- Can track their own progress, complete lessons, take quizzes
- Can submit course feedback upon completion
- Can view their skills passport (skills earned from courses)

---

## 3. Course Creation — AI Generation Wizard

This is the primary entry point for creating a new course. It lives at a dedicated route accessible only to Admins. The flow is a two-step wizard followed by an animated build sequence.

### Step 1: "What are you building?"

The admin defines the high-level shape of the course:

- **Topic** — Free-text input describing what the course is about (e.g., "Lockout/Tagout Procedures for Hydraulic Presses")
- **Synthesis Type** — The format/scope of the content being created:
  - Micro-lesson (short, focused)
  - Full course (comprehensive, multi-lesson)
  - Onboarding path (structured for new hires)
  - Additional optional types may be available
- **Audience Level** — Who the content is tailored for:
  - New hire
  - Experienced worker
  - Recertification

### Step 2: "Who's it for?"

The admin provides targeting and source context:

- **Target Job Title** — The role this course is designed for (e.g., "Maintenance Technician")
- **Target Skill** — The primary skill this course teaches or reinforces
- **Library Sources** — Multi-select of existing Library items to use as source material for generation. The AI uses these documents/videos/links as the knowledge base for building course content.
- **Quiz Placement** — Where quizzes should appear:
  - Per-lesson (quiz after each lesson)
  - End-of-course (single quiz at the end)
  - Both
- **Additional Context** — Optional free-text field for any extra instructions or context the admin wants the AI to consider

### Build Animation

After submitting, the user sees an animated loading sequence with scripted steps that communicate what the AI is doing (analyzing sources, mapping skills, generating structure, building content, etc.). This is a UX treatment over the course creation process.

### Result

The system creates a new course with status **"ai-draft"** and redirects the admin to the full Course Editor.

---

## 4. AI Draft Preview (Alternate Creation Path)

A secondary creation path exists where an AI-generated draft is stored in the browser session and presented for review before being persisted. This flow:

- Displays the draft with editable title, description, lessons, and sections
- Each section's content is rendered in a rich text editor
- An AI transform option is available per section (rewrite, expand, simplify)
- Navigation allows stepping through lessons and sections with previous/next controls
- Supports toggling between content and quiz sub-views per lesson
- An "Accept & Create Course" action persists the draft and redirects to the Course Editor

> **Note:** This path is currently only reachable if an external process or future feature populates the draft. It is not connected to the main generation wizard flow today. Consider this a **nice-to-have** path.

---

## 5. Course Editor

The Course Editor is the main authoring surface. Once a course exists (via the generation wizard or draft acceptance), all editing happens here. The editor is organized into **five tabs**.

### 5.1 Overview Tab

This is the course's identity and metadata configuration.

#### Course Details
- **Title** (required) — The display name of the course
- **Description** — Rich text course description

#### Learning Objectives
- A managed list of objective statements
- Add and remove individual objectives
- These are displayed to learners on the course overview page

#### Skills
- Search and attach existing skills from the skills catalog
- Skills appear as chips/tags on the course
- **"+ New Skill"** option allows creating a skill inline (name + category) without leaving the editor
- Two skill relationship types:
  - **Skills Granted** — Skills the learner earns upon completing this course
  - **Skills Required** — Skills the learner should have before taking this course (data model exists; not currently enforced as a gating mechanism for learners)

> **Cross-reference:** Skills are managed in the **Skills module** (Admin → Skills) and the **Learning Model** (Admin → Learning Model). The skills catalog supports V2 skills with types (skill vs. certification), expiry, evidence requirements, prerequisite skill chains, and regulatory metadata.

#### Metadata Fields
- **Category** — Free-text classification (e.g., "Safety", "Equipment Operation")
- **Estimated Duration** — Time in minutes
- **Difficulty** — Beginner, Intermediate, or Advanced
- **Reading Level** — Basic, Standard, or Technical
- **Language** — English or Spanish
- **Tags** — Free-text tag list for flexible categorization

#### Status
- **Draft** — Work in progress, not visible to learners
- **Published** — Live and assignable to learners
- **AI Draft** — Generated by AI, pending human review (only shown for AI-generated courses)
- **In Review** — Under review by an admin (only shown for AI-generated courses)
- **Rejected** — Reviewed and rejected (only shown for AI-generated courses)

Managers cannot change the status field.

#### Compliance Standards
- A legacy free-text standards field
- A structured standards editor supporting:
  - **OSHA** codes
  - **MSHA** codes
  - **EPA** codes
  - **Other** custom regulatory codes
- Standards are managed via a dedicated Standards Edit Modal

---

### 5.2 Lessons Tab

This is where the course's content structure is built and managed. It is the most complex part of the editor.

#### Lesson Stepper
- A horizontal stepper showing all lessons in order
- Lessons can be reordered via drag-and-drop
- Keyboard navigation is supported
- An "Add Lesson" action creates a new empty lesson
- Each step shows the lesson title and indicates the currently active lesson
- A summary panel shows counts by resource type and estimated duration for the selected lesson

#### Lesson Focused View

When a lesson is selected, a detailed editing workspace appears:

- **Lesson Title** — Editable inline
- **Estimated Duration** — Minutes for this lesson
- **Reorder Controls** — Move lesson up/down in the course sequence
- **Lesson Type** — Standard lesson or assessment

#### Sections (Resources)

Each lesson contains an ordered list of sections. A section is a single content block. Supported section types:

- **Text** — Rich HTML content edited with the built-in rich text editor. The editor supports:
  - Headings, bold, italic, lists (ordered/unordered)
  - Links
  - Glossary callout blocks (for key term definitions)
  - Style linting (warns about formatting issues)
  - Optional AI toolbar for inline transforms
- **Link** — External URL with a title
- **Image** — Uploaded image file (via the upload system)
- **Video** — Uploaded video file or external URL, with a duration field (minutes/seconds)
- **PDF** — Uploaded PDF document

Sections are displayed as cards within the lesson. Each card supports:
- Inline editing (for text sections, the rich text editor opens directly in the card)
- AI preview/transform modal (rewrite, expand, simplify text using AI)
- Reordering within the lesson
- Deletion

#### Resource Editor Drawer

A slide-out drawer for creating or editing a section in detail:
- Select resource type
- Enter title
- Type-specific fields (URL for links, content for text, file upload for images/PDFs/videos, duration for videos)
- File uploads capture filename, file size, and MIME type

#### Downloadable Resources

Each lesson can have attached downloadable files (e.g., PDF reference guides, checklists):
- Title
- URL (file location)
- File type

These are supplementary materials, separate from the lesson's main content sections.

#### AI Content Assistance

Within the lessons tab, AI assistance is available:
- **AI Preview Modal** — Select text content and apply AI transforms (rewrite for clarity, expand with more detail, simplify language)
- **AI Chat Panel** — A persistent chat interface where the admin can have a conversation with the AI assistant about the course content, request changes, ask for suggestions, etc. The chat maintains conversation history.

---

### 5.3 Quiz Tab

Quizzes assess learner comprehension. The system supports both course-level and lesson-level quizzes.

#### Quiz Scope
- **Course Quiz** — A single quiz for the entire course
- **Lesson Quizzes** — Individual quizzes attached to specific lessons
- A lesson picker allows selecting which lesson's quiz to edit when in lesson-quiz mode

#### Question Management
- Questions are displayed as a list with drag-and-drop reordering
- Add new questions manually
- Generate questions with AI
- Duplicate an existing question
- Delete questions
- Undo/redo support
- History tracking for quiz changes

#### Question Types

The system supports seven question types:

1. **Multiple Choice (MCQ)** — Single correct answer from a list of options
2. **True/False** — Binary choice
3. **Scenario** — Situational question with context and answer options
4. **Short Text** — Free-text response
5. **Multi-Select** — Multiple correct answers from a list (with configurable grading mode)
6. **Numeric** — Numerical answer with configurable tolerance range
7. **Ordering** — Arrange items in the correct sequence

#### Question Editor (Edit Question Modal)

Each question can be fully configured:
- **Prompt** — The question text
- **Options** — Answer choices (for applicable types)
- **Correct Answer(s)** — Marking which option(s) are correct
- **Points** — Point value for the question
- **Required** — Whether the question must be answered
- **Explanation** — Shown to learner after answering (if enabled in settings)
- **Rationale** — Internal note for why this answer is correct (not shown to learners)
- **Difficulty** — Per-question difficulty level
- **Tags** — For categorizing/filtering questions
- **Language** — Per-question language setting
- **Type-specific fields:**
  - Numeric: tolerance value
  - Multi-select: grading mode (all-or-nothing vs. partial credit)

#### AI Quiz Generation

A dedicated modal for generating quiz questions with AI:
- **Source selection:**
  - From a specific lesson's content
  - From the entire course's content
  - From an uploaded PDF file
  - From manually entered text
- **Configuration:**
  - Number of questions to generate
  - Difficulty level
  - Question types to include
  - Bloom's taxonomy level (remember, understand, apply, analyze, evaluate, create)
- **Review flow:** Generated questions are presented for review; the admin selects which ones to import into the quiz

#### Quiz Preview

A learner-style preview of the quiz, rendered as it would appear to a learner. Respects the shuffle setting if enabled.

---

### 5.4 Settings Tab

Course-level policies and behavioral configuration. These settings control how learners experience and progress through the course.

#### Progression Mode
- **Linear** — Learners must complete lessons in order
- **Free** — Learners can access lessons in any order

#### Completion Rules
- **Require All Lessons** — Learner must complete every lesson to finish the course
- **Require Passing Quiz** — Learner must pass the course quiz to complete
- **Lock Next Until Previous Complete** — Enforces sequential lesson completion (related to linear progression)
- **Require Manual Completion** — An admin must manually mark the course complete (vs. automatic completion)
- **Require Quiz Pass to Complete Lesson** — Lesson-level quizzes must be passed before the lesson is considered done
- **Require All Lessons to Complete Course** — All lessons must be finished before the course is marked complete

#### Certificate Settings
- **Issue Certificate on Completion** — Toggle whether a certificate is generated when the learner finishes
- **Minimum Score for Certificate (%)** — The minimum quiz score required to earn a certificate

#### Reminder & Retraining
- **Retrain Interval (Days)** — How often the course must be retaken (for recurring compliance)
- **Reminder Enabled** — Toggle reminders on/off
- **Reminder Days Before** — How many days before the due date to send a reminder (preset options + custom day entry)

#### Quiz Behavior
- **Enable Retakes** — Whether learners can retake the quiz
- **Show Explanations** — Whether answer explanations are shown after submission
- **Max Quiz Attempts** — Limit on how many times a learner can attempt the quiz
- **Retake Cooldown (Minutes)** — Minimum wait time between quiz attempts

#### Timing Rules
- **Minimum Video Watch Percentage** — How much of a video must be watched to count as complete
- **Minimum Time on Lesson (Seconds)** — Minimum time a learner must spend on a lesson before it can be marked complete

#### Assignment Scope (Onboarding Auto-Assign)

Defines the default audience scope for the course, primarily used for onboarding flows:
- **Company-wide** — Assigned to all employees
- **Site** — Assigned to specific sites (with site ID selection)
- **Department** — Assigned to specific departments (with department ID selection)
- **Custom** — Manual/custom targeting

---

### 5.5 Assignment Tab

This tab handles assigning the course to learners. It opens the Course Assignment Modal.

#### Assignment Targets

Courses can be assigned by four targeting methods:

1. **User** — Assign directly to specific individual users
2. **Role** — Assign to everyone with a specific job role, optionally scoped to:
   - Specific sites
   - Specific departments
3. **Site** — Assign to all users at specific sites
4. **Department** — Assign to all users in specific departments

#### Assignment Details
- **Due Date** — When the assignment is due
- **Notes** — Free-text notes attached to the assignment (e.g., "Complete before Q3 audit")
- **Assigner** — Automatically tracked (the admin who created the assignment)

#### Assignment Resolution

An Assignment Resolve Modal shows the resolved list of individual users who match the assignment criteria (useful for role/site/department assignments where the admin wants to see exactly who is affected).

#### User-Side Assignment

Courses can also be assigned from the **User Management** side — when viewing a user's profile, an admin can assign published courses to them with:
- Multi-select course picker (filtered to published courses only)
- Due date presets (7 days, 14 days, 30 days, 60 days, 90 days, custom)

> **Cross-reference:** When a course is assigned to a user, the system also creates **Training** and **TrainingCompletion** records that feed into the **Compliance module**. This is the bridge between the LMS course system and the compliance/training tracking system.

---

## 6. AI Review Workflow (AI-Generated Courses)

When a course is created via the AI generation wizard, it enters a lightweight review workflow.

### AI Draft Banner

The course editor displays a banner when the course status is **AI Draft** or **In Review**:
- **View Conversation** — Opens the AI chat history from the generation process
- **Reject** — Opens a modal to provide rejection notes; sets status to "Rejected" and records the reviewer, timestamp, and notes
- **Approve & Publish** — Sets status to "Published," records the reviewer and timestamp, and logs the synthesis history

### Post-Decision State

After a decision is made:
- If published: an info bar shows "Published" with the review timestamp
- If rejected: an info bar shows "Rejected" with the review timestamp and rejection notes

### Sidebar Badge

The admin sidebar shows a badge count on the Courses navigation item indicating how many courses are in **AI Draft** or **In Review** status, drawing attention to items needing review.

### Course Owner

Every course has an owner (the admin who created it). The owner is displayed in the editor header with a link to their user profile. The owner is set at creation time and is not currently reassignable from the editor UI.

---

## 7. Admin Course List

The course listing page is the main admin entry point for managing courses.

### Table Columns
- **Title** — Course name, with an "AI" chip if the course was AI-generated
- **Tags** — Up to 3 tags displayed, with a "+N" overflow indicator
- **Category** — Course category
- **Created** — Formatted creation date
- **Status** — Color-coded badge (Draft, Published, AI Draft, In Review, Rejected)
- **Actions** — Overflow menu

### Filters
- **Search** — Filters by title or category (text match)
- **Status** — Dropdown filter for any status value
- **Category** — Dropdown filter from distinct categories across all courses
- **Clear Filters** — Shown when any filter is active
- **Result Count** — "Showing X of Y courses"

### Actions
- **Row Click** — Opens the course detail page
- **Edit** (Admin only) — Navigates to the course editor
- **Delete** (Admin only) — Confirmation dialog, then permanently deletes the course
- **Create Course** (Admin only) — Button navigating to the generation wizard

Managers see the list but cannot create or delete courses.

> **Note:** There is currently no sorting, no bulk operations (bulk publish, bulk assign, bulk delete), no course duplication/cloning, and no archiving. Deletion is permanent.

---

## 8. Admin Course Detail Page

A read-only summary view of a course, separate from the editor. Accessible by clicking a course row in the list.

### Information Displayed
- Title, status badge, category, AI-generated indicator
- Description
- **Details panel:** Estimated time, lesson count, tags, skills granted, created/updated dates
- **Learning Objectives:** List from course metadata

### Learner Progress Table
- Shows all resolved assignees and their progress
- Columns: user name, completion status, lesson progress (X of Y), quiz score, completion date

### Learner Feedback
- Displays submitted ratings and comments from learners who have completed the course

### Actions
- **Preview Course** — Opens the learner-style preview
- **Edit Course** — Navigates to the full editor

---

## 9. Admin Course Preview

A learner-style preview that lets admins experience the course as a learner would see it, without tracking real progress. Features:

- Navigate through lessons and their sections
- View rendered content (text, images, videos, PDFs, links)
- Take the quiz in preview mode
- Exit back to the editor or course list

---

## 10. Learner Experience

### 10.1 My Courses (Learner Home)

The learner's landing page shows all courses assigned to them. Only **published** courses appear.

#### Sorting & Prioritization
Courses are automatically sorted by urgency:
1. Overdue courses (past due date)
2. Due soon
3. Has a due date (future)
4. In progress (started but no due date)
5. Alphabetical by title (not started, no due date)

#### Course Cards
Each card shows:
- Course title
- Progress indicator
- Due date (with overdue/due-soon visual treatment)
- Resume or Start action

#### Onboarding Section
If the learner has onboarding-path courses, these may be grouped separately.

### 10.2 Course Overview (Learner)

When a learner selects a course, they see an overview page with:

- Course title and description
- Learning objectives
- Lesson list with:
  - Lock/unlock indicators (based on progression policy)
  - Completion status per lesson
  - Visual progress tracking
- Due date banner (if applicable, with overdue warning)
- **Start**, **Resume**, or **Review** action depending on progress state

### 10.3 Course Player

The core learning experience. When a learner enters a lesson:

#### Layout
- **Header** — Course title, navigation
- **Sidebar** — Lesson list with progress indicators, collapsible
- **Main Content Area** — Rendered lesson content
- **Footer** — Navigation (previous/next), progress

#### Content Rendering
Sections are rendered based on type:
- **Text** — Rendered HTML with full formatting
- **Video** — Video player with progress tracking (minimum watch percentage enforced per policy)
- **Image** — Displayed inline
- **PDF** — Rendered or linked for viewing
- **Link** — Displayed as a clickable resource

#### Timing & Progress
- Minimum time on lesson is enforced (per settings)
- Video watch percentage is tracked (per settings)
- Lesson completion is tracked and feeds into course progress

#### Accessibility Features
- Text size adjustment
- High contrast mode
- Focus mode (distraction-free reading)

#### Lesson Completion
When all sections in a lesson are consumed (and timing/video requirements are met), the lesson can be marked complete. Based on course policy:
- The next lesson may unlock (linear progression)
- A lesson quiz may be required before proceeding

### 10.4 Quiz Experience (Learner)

When a learner encounters a quiz (lesson-level or course-level):

- Questions are presented according to configuration (shuffled or sequential)
- All seven question types are supported with appropriate input controls
- After submission:
  - Score is calculated
  - Explanations are shown (if enabled in settings)
  - Pass/fail is determined based on course policy
  - Retakes are available (if enabled, subject to max attempts and cooldown)

### 10.5 Course Completion

When all completion criteria are met (all lessons done, quiz passed if required):

- Course is marked complete
- A **completion summary** is displayed showing:
  - Final score
  - Time spent
  - Skills earned
  - Certificate (if issued per policy)
- **Skills are granted** — Any skills in the course's "skills granted" list are recorded on the learner's profile as earned, with the course as evidence
- **Certificate is issued** (if enabled and minimum score is met)
- **Feedback prompt** — Learner can submit a rating and comment about the course

### 10.6 Learner Skills Passport

A dedicated page where learners can view all skills they've earned across courses, including:
- Skill name and category
- How it was earned (which course)
- Expiry information (if applicable)

> **Cross-reference:** The Skills Passport pulls from **UserSkillRecord** entries that are created when courses are completed. Skill definitions, expiry rules, and prerequisite chains are managed in the **Skills module** and **Learning Model**.

---

## 11. Compliance & Training Bridge

The LMS course system connects to the broader Compliance module through a training bridge.

### How It Works
- When a course is **assigned** to a user, the system also creates a **Training** record (if one doesn't exist for that course) and a **TrainingCompletion** record
- This allows the Compliance module to track course-based trainings alongside other training types (in-person, on-the-job, etc.)
- The compliance dashboard, renewal tracking, and audit views all pull from these training records

### Retrain Intervals
- Courses with a `retrainIntervalDays` policy setting create recurring compliance obligations
- The reminder system evaluates training completion records against retrain intervals to determine upcoming renewals and overdue items

### Compliance Visibility
- The **Admin Dashboard** surfaces compliance KPIs (completion rates, overdue counts, upcoming renewals) that include course-based trainings
- The **Compliance page** shows detailed completion tracking with bulk actions on completions (set due date, mark exempt, add notes)

> **Cross-reference:** Training assignments, completions, and reminders are managed in the **Trainings module** and **Compliance module**. The course system creates the underlying records; compliance consumes them.

---

## 12. Notifications & Reminders

### Reminder System
- Evaluates reminder rules against training completion records
- Fires reminders based on `reminderDaysBefore` setting relative to due dates
- Supports the retrain interval cycle (e.g., annual recertification reminders)

### Admin Notifications
- An admin notification archive page collects system notifications
- AI-assisted notification copy generation is available for compliance-style messages

### Notification Settings
- Configurable reminder settings in the admin settings area
- Controls for enabling/disabling reminders and setting timing

> **Cross-reference:** Notification configuration is managed in **Admin → Settings → Notifications**. The notification/reminder engine is primarily compliance-driven and operates on training records, not directly on course entities.

---

## 13. Analytics & Reporting

### Admin Analytics Page

An org-scoped analytics dashboard that includes course-related metrics:

- **KPIs:** Completion rates, active learners, overdue counts, training coverage
- **Completion by Department** — Breakdown of training completions across organizational departments
- **Completion Trends** — Time-series view of completions over time
- **Status Mix** — Distribution of training statuses (complete, in-progress, overdue, not started)
- **Skill Coverage** — How well the organization's skill requirements are being met by completed training
- **AI Insights** — AI-generated observations and quick wins (e.g., "3 courses are nearly complete and could be published")

### Scope Filtering
Analytics can be scoped by organization level, site, or department.

### Content Health
The admin dashboard includes a **Content Health** indicator that evaluates the currency and completeness of course content across the library.

> **Cross-reference:** Analytics pulls from training completions, course progress, skill records, and assignment data. Detailed reporting is under **Admin → Analytics**. Related views include **Audit Snapshots** and **Signals** (operational signal-to-training pipeline).

---

## 14. Rich Text Editor

The built-in content editor is used across multiple surfaces (lesson sections, AI preview, course descriptions). Key capabilities:

- **Formatting:** Headings (multiple levels), bold, italic, ordered/unordered lists
- **Links:** Inline hyperlinks
- **Glossary Callouts:** Special block format for key term definitions (highlighted callout box)
- **Style Linting:** Real-time warnings about content formatting issues (inconsistent heading levels, overly long paragraphs, etc.)
- **AI Toolbar (optional):** Inline AI-powered text transforms when enabled
- **Tone & Readability Meter:** A companion widget that evaluates the reading level and tone of content

---

## 15. Library Integration

The Library module serves as the source material repository for course creation.

### In Course Generation
- During the AI generation wizard (Step 2), admins select Library items as source material
- The AI uses these documents, videos, and links as the knowledge base for generating course content
- Source attributions are tracked on the generated course

### In Lesson Building
- Library items can be linked to course resources/sections
- A Library Picker component exists for browsing and selecting library content (grid/list view with filters)

### Library Item Sources
Library items can originate from various platforms (Loom, Teams, YouTube, etc.) — these are metadata labels, not live integrations.

> **Cross-reference:** The Library is managed in its own module. Items have an `allowedForSynthesis` flag that controls whether they can be used as AI generation source material. The Library Picker is a shared component.

---

## 16. File Upload System

A general-purpose upload system used across course creation:

- **Upload Dropzone** — Drag-and-drop or click-to-browse file upload component
- **Supported in:** Resource/section creation (images, videos, PDFs), AI quiz generation (PDF source), downloadable resources
- **Tracked metadata:** Filename, file size, MIME type, URL
- **Delete capability** — Uploaded files can be removed
- **Accepted file types** are defined per context (e.g., images only for image sections, PDFs only for document sections)

---

## 17. Nice-to-Have Features (Built, Not Currently Active)

The following features exist in the codebase but are not currently wired into the live user interface. They represent future capabilities or experimental work.

### Metadata AI Panel
An AI-powered panel that analyzes all course content and generates/applies metadata recommendations (title improvements, description suggestions, tag recommendations, skill mappings). Uses the full course HTML as input for analysis.

### Style Audit Panel
A content quality tool that audits all course content for style consistency. Features:
- Scans all text content across lessons for style issues
- Categorizes issues (formatting, readability, consistency, accessibility)
- **Bulk Fix** capability with a confirmation modal — applies style corrections across all affected sections in one action
- Integrates with the organization's style guide settings

### Resources Workspace (Alternate Lesson Builder)
An alternative lesson-building interface that includes:
- Batch file upload for creating multiple resources at once
- Inline link and text creation forms
- Lesson summary view
- Preview lesson modal
- Library Picker integration for selecting existing library content

### AI Generate Modal
A standalone modal for AI-powered content generation with file input support. Not currently connected to any surface in the application.

---

## 18. Cross-Module Reference Map

| Module | Relationship to Course Creation |
|---|---|
| **Skills** | Courses grant and require skills. Skills are tagged on courses during editing. Completion triggers skill records on learner profiles. Managed in Admin → Skills and Admin → Learning Model. |
| **Learning Model** | Admin-only module for managing the skills catalog, job titles, and source configurations. Courses reference skills and job titles defined here. |
| **Library** | Source material for AI generation. Library items can be linked as course resources. |
| **Compliance** | Course assignments create training/completion records. Compliance module tracks these alongside other training types. Retrain intervals and reminders flow through compliance. |
| **Trainings** | Parallel entity to courses. Course-based trainings are auto-created when courses are assigned. Trainings have their own admin management surface. |
| **Onboarding** | Onboarding paths reference courses. Course scope settings (company-wide, site, department) feed into onboarding auto-assignment. Onboarding has its own publish flow. |
| **User Management** | Users can be assigned courses from user profiles. New user onboarding can include course assignment with notifications. |
| **Notifications** | Reminder engine evaluates training completions for due-date and retrain reminders. Admin notification settings control timing. |
| **Analytics** | Aggregates course completions, progress, skill coverage, and content health into dashboards and KPI views. |
| **Signals** | Operational signals (from field data) can trigger training generation recommendations, including courses. |

---

## 19. Data Relationships Summary

Understanding how the core entities relate to each other:

- **Course** contains an ordered list of **Lessons** and optionally one course-level **Quiz**
- **Lesson** contains an ordered list of **Sections** (Resources), optional **Knowledge Checks** (lightweight inline checks), and optional **Downloadable Resources**
- **Section (Resource)** is a single content block (text, link, image, video, or PDF) within a lesson
- **Quiz** contains an ordered list of **Questions**; a quiz can belong to a course or to a specific lesson
- **Course Assignment** links a course to a target (user, role, site, or department) with a due date
- **Progress (Course)** tracks a learner's overall course status, score, and completion
- **Progress (Lesson)** tracks a learner's per-lesson status, time spent, and completion
- **Certificate** is issued upon course completion (if policy allows) and linked to the user and course
- **User Skill Record** is created when a course is completed, granting the course's skills to the learner
- **Training / Training Completion** records are created as a bridge to the compliance system when courses are assigned
- **Course Feedback** captures learner ratings and comments post-completion

---

## 20. Current Limitations & Gaps

For awareness, these are notable gaps in the current implementation:

1. **No course duplication or templating** — Every course is created from scratch via AI generation
2. **No course archiving** — Only permanent deletion is available
3. **No bulk operations on the course list** — No multi-select for publish, assign, or delete
4. **No sorting on the course list** — Courses display in default order only
5. **No formal approval workflow** — AI review uses status fields and a banner, not a dedicated reviewer queue or multi-step approval chain
6. **No cross-course prerequisites** — `skillsRequired` exists in the data model but is not enforced as a gating mechanism for learners
7. **No course owner reassignment** — Owner is set at creation and cannot be changed in the UI
8. **Certificate issuance is thinly connected** — The policy toggle and certificate entity exist, but the automatic issuance on completion may not fire in all completion paths
9. **Skills auto-grant path** — Skills are granted via one specific progress update path; not all completion flows may trigger it consistently
10. **No real external integrations** — CMMS/EHS integrations are described in documentation and UI copy but are not implemented as live connections
