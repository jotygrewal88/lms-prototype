Cursor Briefing Addendum (Phase I & II)
1) Product constraints (don’t deviate)
No backend, no auth, no real emails/SMS. In-memory data only.


Role switching is a header toggle. Enforce permissions in UI logic.


AI features are mocked with deterministic sample outputs. No API calls.


Scope creep guard: Build only pages/components explicitly listed in the plan.


Demo-first: Every epic must be demoable from seed data with no setup.


2) Tech & project conventions
Stack: Next.js + TypeScript + Tailwind. Keep structure minimal and readable.


UI kit: Use Tailwind primitives; simple custom components (Button, Card, Table, Modal, Tabs, Badge, Progress).


Routing: /admin/*, /learner/*. Admin gets left nav; Learner does not.


State: Component state + lightweight store (e.g., a single store.ts with plain objects). No Redux, no server.


Dates & TZ: Use ISO strings. All dates shown as YYYY-MM-DD. Assume America/Los_Angeles.


IDs: Use short stable IDs (e.g., tng_001, usr_001) for seeds and cross-links.


3) Data & seeding (must-have)
Create data/seed.ts and load at app start.
Org: UpKeep Demo Co (logo placeholder, primary color).


Sites: Plant A, Plant B.


Departments: Warehouse, Packaging, Maintenance (per site).


Users:


1 Admin (org-wide),


2 Managers (one per site),


12 Learners spread across sites/depts.


Phase I trainings (mix of states):


Forklift Safety (annual, some overdue),


PPE Basics (annual, due soon),


Lockout/Tagout (2-year, some completed),


Chemical Handling (1-year),


Fire Safety (annual).


TrainingCompletions: Pre-populate a believable variety (completed/due/overdue).


ReminderRules: Upcoming (-7d), Due (0d), Overdue (+3d escalation).


Phase II seeds (for later epics):


Library files: SOP_LockoutTagout.pdf, PPE_Policy.pdf, Chemical_Handling.pptx.


One manual Course (“PPE 101”) and one AI-generated Course (“Lockout/Tagout Refresher”) with a few Lessons.


A small Quiz with 5 MCQs.


One Certificate template.


4) UX rules (keep it clean)
Tables: Sort, filter, search, sticky header, zebra rows.


Empty states: Always show a helpful placeholder + primary action.


Inline edits where feasible; otherwise, Modals for create/edit.


Feedback: Toasts for save; subtle confetti for key wins (100% compliance, course pass).


Accessibility: Semantic headings, labeled inputs, focus outlines, keyboard-navigable modals.


Mobile-friendly layouts (no pixel perfection needed).


5) Permissions enforcement (hard rules)
Admin: full CRUD on trainings, assignments, reminders, exports, branding; org-wide data.


Manager: CRUD within scope (site/department), can mark completions and assign within scope, export scoped CSV, read-only outside scope.


Learner: self-only read; can mark own completion (if allowed) and upload proof.


The UI must hide/disable actions the current role cannot perform.


6) “Mock AI” contract (consistent, not random)
AI Smart Entry (Phase I): When adding a training with a fuzzy title, show a fixed suggestion list (e.g., “OSHA Forklift Safety — Annual (12 mo)”, “LOTO — 24 mo)”).


AI Reminder Optimization (Phase I): Display a static suggestion like “Based on past completion rates, suggest reminders at -7, 0, +3 days.”


AI Audit Helper (Phase I): Given current seed, always render a canned summary (“Site A: 3 overdue — LOTO, PPE, Fire Safety.”).


AI Course Outline (Phase II): Given SOP_LockoutTagout.pdf, produce the same 4-lesson outline every time.


AI Quiz Generator (Phase II): Deterministic 5 questions per lesson; explanations included.


Translation: A simple toggle that swaps a lesson’s text with a prewritten Spanish version for one lesson.


7) Acceptance criteria format (per epic)
For each epic, include at PR/section end a checklist:
User stories satisfied (list).


Pages/components created (list routes, components).


Permissions verified (Admin/Manager/Learner behaviors).


Seed demo path (exact clicks from /admin to show the feature).


No code creep (assert no extra pages or dependencies added).


8) Demo flow guardrails
Phase I 5–7 min: Admin dashboard → Compliance table filters → Mark complete → Learner view update → Reminder preview → Export CSV → Branding change reflected.


Phase II 5–7 min: Library → “Generate with AI” course → Edit lesson → Generate quiz → Take quiz as learner (instant score) → Certificate auto-issue → Admin insights.


9) Non-goals (explicit)
No auth/session, no databases, no API, no email/SMS gateways, no HRIS integrations, no mobile app, no drag-and-drop file system beyond fake uploads, no analytics beyond what’s listed.


10) Visual theming primitives (keep it consistent)
Colors: Primary #2563EB (demo), surface #0B1220/#111827 (dark header), neutrals via Tailwind.


Typography: System fonts. H1/H2 for section headings; 14–16px body.


Icons: Minimal (Heroicons).


Cards: Rounded, soft shadow, 16px padding.


11) File layout (suggested, not mandatory)
/app
  /admin
    page.tsx           (dashboard v1)
    /trainings
    /compliance
    /users
    /settings
      /brand
      /notifications
    /library           (phase II)
    /courses           (phase II)
    /rules             (phase II)
  /learner
    page.tsx
/components           (Button, Card, Table, Modal, Badge, Progress, Tabs)
/data/seed.ts
/lib/store.ts         (in-memory state & helpers)
/lib/ids.ts
/types.ts

12) Feature flags (simple booleans)
FEATURE_PHASE_II = false initially; flip to true when starting Phase II to reveal Library, Courses, Quiz, Certificates, Rules, and Admin v2 cards.


13) Telemetry stubs (optional, no network)
Add a logEvent(name, payload) util that pushes into an in-memory array. Use for clicks like “generate_with_ai”, “mark_complete”, “export_csv”. Expose under /admin/reports as a simple list for demo.