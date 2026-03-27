# Learning Model — Product Specification

**Feature:** Admin > Learning Model (`/admin/learningmodel`)
**Access:** Admin-only (role = `ADMIN`)
**Route:** `/admin/learningmodel?tab=<tab-id>`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tab 1 — Organization](#2-tab-1--organization)
3. [Tab 2 — Content Standards](#3-tab-2--content-standards)
4. [Tab 3 — Job Titles](#4-tab-3--job-titles)
5. [Tab 4 — Skills](#5-tab-4--skills)
6. [Tab 5 — Sources](#6-tab-5--sources)
7. [Data Model Reference](#7-data-model-reference)
8. [Cross-Feature Integrations](#8-cross-feature-integrations)
9. [JIRA Epic & Story Breakdown](#9-jira-epic--story-breakdown)

---

## 1. Overview

The **Learning Model** is the central configuration console where administrators define _who their organization is_, _what their workforce needs to know_, and _what knowledge sources the AI can draw from_ when generating training content. It is the foundational input layer that feeds into course generation, onboarding path creation, skill gap analysis, and compliance tracking.

The page lives at `/admin/learningmodel` and is divided into **five tabs**:

| Tab | URL param | Purpose |
|-----|-----------|---------|
| Organization | `?tab=organization` | Company profile, industry, geography, regulatory frameworks |
| Content Standards | `?tab=content-standards` | Tone, terminology, training defaults, custom AI instructions |
| Job Titles | `?tab=jobtitles` | Roles in the org, their required skills, onboarding paths |
| Skills | `?tab=skills` | Skills library (catalog) + work context requirements |
| Sources | `?tab=sources` | Library items enabled/disabled for AI content generation |

The default landing tab is **Job Titles**.

### Why It Matters

Every AI-generated course, onboarding path, and compliance check uses the Learning Model as its context. The Organization tab tells the AI _what kind of company this is_. Content Standards tell the AI _how to write_. Job Titles define _what each role needs_. Skills define _the atoms of competency_. Sources define _what reference material the AI can use_.

---

## 2. Tab 1 — Organization

**URL:** `/admin/learningmodel?tab=organization`
**Component:** `components/admin/learningmodel/OrganizationTab.tsx`
**Data type:** `OrganizationProfile`

### Purpose

Captures the company's identity so the AI can generate contextually relevant training. A manufacturing company in Ohio under OSHA regulations will get fundamentally different content than a food processing plant in Canada under CSA standards.

### Empty State

If no organization profile has been configured, the tab shows a centered CTA:
- Heading: "Set Up Your Organization Profile"
- Subtext explaining it takes ~2 minutes and improves AI quality
- "Get Started" button reveals the form

### Form Sections

#### Section 1: Company Information

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Company Name | Text input | No | Free-text |
| Industry | Select dropdown | **Yes** | Options: Manufacturing, Food & Beverage, Pharmaceutical, Oil & Gas, Mining, Utilities, Construction, Transportation, Warehousing & Logistics, Healthcare, Education, Government, Property Management, Other |
| Industry Sub-type | Select dropdown | No | Dynamic — options change based on selected Industry. Example: Manufacturing shows "Discrete Manufacturing — Metal Fabrication", "Process Manufacturing — Chemicals", etc. |
| Company Size | Select dropdown | No | Options: 1-50, 50-200, 200-500, 500-1,000, 1,000-5,000, 5,000+ employees |
| Brief Description | Textarea (3 rows) | No | Free-text describing operations and facilities |

#### Section 2: Geography & Jurisdiction

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Primary Country | Select dropdown | **Yes** | 13 countries listed (US, Canada, UK, Australia, Germany, France, Mexico, Brazil, India, China, Japan, South Korea, Other) |
| State / Region | Select (US) or Text (other) | No | If US is selected, shows a dropdown of all 50 states. If California is selected, shows an amber hint about Cal/OSHA. For non-US countries, shows a free-text input. |
| Additional Countries | Multi-select (chip-style) | No | Select from same country list; chips with X to remove |
| Primary Language | Select dropdown | No | Options: English, Spanish, French, Portuguese, German, Mandarin Chinese, Japanese, Korean, Arabic, Hindi, Other |
| Additional Languages | Multi-select (chip-style) | No | Select from same list; chips with X to remove |

#### Section 3: Regulatory Frameworks

Three grouped checkbox sections:

**Safety & Health:**
- OSHA, Cal/OSHA, CSA, HSE, EU Framework Directive 89/391/EEC, ANSI, NFPA

**Quality & Management:**
- ISO 9001, ISO 45001, ISO 14001, ISO 22000, IATF 16949, AS9100

**Industry-Specific:**
- FDA 21 CFR, GMP, HACCP, EPA, DOT, MSHA, NRC

**Other Regulations:** Free-text input (comma-separated) for anything not listed (e.g., "ASME Boiler Code, API 510")

#### Info Box

Blue callout: "The more context you provide, the more relevant and accurate the AI-generated training will be. You can update this at any time — changes apply to future generations, not past ones."

#### Footer

- Shows "Last updated: [date] by [user name]" if previously saved
- "Save Changes" button persists the profile

### Data Model

```typescript
interface OrganizationProfile {
  companyName: string;
  industry: string;
  industrySubtype: string;
  companySize: string;
  description: string;
  primaryCountry: string;
  stateRegion: string;
  additionalCountries: string[];
  primaryLanguage: string;
  additionalLanguages: string[];
  regulatoryFrameworks: string[];
  otherRegulations: string;
  defaultPassingScore: number;     // shared with Content Standards tab
  defaultRecertPeriod: string;     // shared with Content Standards tab
  trainingLanguageReq: string;
  customAIInstructions: string;    // shared with Content Standards tab
  updatedAt: string;
  updatedByUserId: string;
}
```

### Store Functions

- `getOrganizationProfile()` — reads current profile
- `updateOrganizationProfile(partial)` — merges partial updates, sets `updatedAt` timestamp

---

## 3. Tab 2 — Content Standards

**URL:** `/admin/learningmodel?tab=content-standards`
**Component:** `components/admin/learningmodel/ContentStandardsTab.tsx`
**Data types:** `OrgStyleGuide` + fields on `OrganizationProfile`

### Purpose

Controls the _voice and rules_ of all AI-generated content. The style audit in the course editor and the AI generation pipeline both reference these settings.

### Form Sections

#### Section 1: Tone

| Field | Type | Default | Options |
|-------|------|---------|---------|
| Preferred Writing Tone | Select dropdown | `professional` | Plain, Professional, Friendly |

Subtext: "Content will be checked against this tone for consistency."

#### Section 2: Preferred Terms

A list of term replacement pairs. Each row has:
- **Term to replace** — text input (left side)
- **Arrow (→)**
- **Preferred term** — text input (right side)
- **Delete** — trash icon to remove the row

"Add" button appends a new blank row. Subtext: "Define terminology replacements. The style audit will flag non-preferred terms and suggest fixes."

**Example use case:** Replace "PPE kit" → "PPE", or "worker" → "Maintenance Partner"

#### Section 3: Banned Terms

Chip/tag display of terms that should never appear in content. Each chip has an X to remove.

"Add" button prompts for a new term. Subtext: "Terms that should never appear in course content. The style audit will flag these."

#### Section 4: Training Defaults

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Default Certification Passing Score | Number input (0-100) | — | Percentage. Applied when generating new courses with quizzes. |
| Default Recertification Period | Select dropdown | — | Options: Annual (12 months), Bi-Annual (6 months), Every 2 Years, Every 3 Years |

#### Section 5: Custom AI Instructions

| Field | Type | Notes |
|-------|------|-------|
| Custom AI Instructions | Textarea (6 rows) | Free-text context included in every AI generation. |

Example placeholder: _"We refer to maintenance workers as Maintenance Partners", "Our internal SOP numbering follows: [DEPT]-[YEAR]-[SEQ]", "All safety training must reference our company motto"_

#### Info Box

Blue callout: "These standards are used by the style audit in the course editor and as context for all AI-generated content."

#### Save Behavior

- "Save Changes" button is disabled until changes are made
- Saves both the `OrgStyleGuide` (on the Organization entity) and the profile fields (`defaultPassingScore`, `defaultRecertPeriod`, `customAIInstructions`)
- Toast confirmation on success

### Data Model

```typescript
interface OrgStyleGuide {
  tone?: 'plain' | 'professional' | 'friendly';
  bannedTerms?: string[];
  preferredTerms?: { term: string; preferred: string }[];
  readingLevelTarget?: 'basic' | 'standard' | 'technical';
  glossary?: { term: string; definition: string }[];
}
```

### Store Functions

- `getOrganization()` — reads the org (which contains `styleGuide`)
- `setOrgStyleGuide(guide)` — updates the style guide on the organization
- `getOrganizationProfile()` / `updateOrganizationProfile(partial)` — for the training defaults and custom AI instructions

---

## 4. Tab 3 — Job Titles

**URL:** `/admin/learningmodel?tab=jobtitles`
**Components:**
- `components/admin/learningmodel/JobTitlesTab.tsx` — list view
- `components/admin/learningmodel/JobTitleDetailView.tsx` — detail view
- `components/admin/learningmodel/JobTitleModal.tsx` — create/edit modal

### Purpose

Defines every role in the organization and maps each one to its required skills. This is the bridge between the skills catalog and actual people — it answers "What does a Maintenance Technician need to know?" and powers skill gap analysis and onboarding path generation.

### List View

**Header:** "Job Titles" with subtext "Define roles in your organization and the skills each one requires"

**Controls:**
- Search input — filters by name, department, or site
- "Create Job Title" button — opens the create modal

**Cards:** Each job title displays as a card with:
- **Name** (bold) and department/site subtitle
- **Stats row:** employee count, required skills count, average skill gaps (amber warning if gaps > 0, green check if 0)
- **Skill badges:** pill-shaped badges for each required skill, with a lightning bolt icon for certifications
- **Onboarding status:** "Published" (green) if an onboarding path is linked, or "Not configured"
- **Actions:** "View Details" and "Edit" links

### Detail View

Reached by clicking "View Details" on a card. Shows:

#### Header
- Back arrow ("Back to Job Titles")
- Edit button
- Job title name, department, site, description

#### Required Skills Table

| Column | Description |
|--------|-------------|
| Skill | Skill name with priority color dot + certification lightning bolt if applicable |
| Priority | Critical / High / Medium / Low |
| Timeline | "Within Xd" — the target timeline in days |
| Team Status | "X of Y missing" (amber) or "All Y have it" (green) or "No employees" |

Skills are sorted by priority (critical first).

#### Employees Table

| Column | Description |
|--------|-------------|
| Employee | Clickable name → navigates to `/admin/users/[id]` |
| Compliance | Progress bar (green 100%, yellow ≥70%, red <70%) + percentage |
| Missing Skills | Comma-separated list of missing skill names |

Below the table: "Team compliance: X% average" and "{N} of {M} employees have gaps" warning if applicable.

#### Onboarding Section

- If an onboarding path is linked: shows path title, duration, course count, skills count, and "View in Onboarding" link
- If no path: "Generate Onboarding Path" button → navigates to `/admin/onboarding?action=generate&jobTitleId={id}`. Subtext: "Automatically creates a phased training plan based on the required skills above."

### Create/Edit Modal

Modal form with the following fields:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Job Title Name | Text input | **Yes** | Placeholder: "e.g. Maintenance Technician - HVAC" |
| Description | Textarea (3 rows) | No | "What this role does..." |
| Department | Select dropdown | No | Maintenance, EHS, Warehouse, Operations, Facilities, Quality, Engineering |
| Site | Select dropdown | No | Plant A, Plant B, All Sites |

#### Required Skills Sub-form

Below the basic fields, a skills management section:

- **Skills table** (if any selected): columns for Skill name, Priority dropdown (Critical/High/Medium/Low), Timeline dropdown (3/7/14/21/30/60/90 days), Delete button
- **"Search skills to add..."** input: typeahead search against the skills library. Dropdown shows matching skills not yet added, with skill name, category, and type. Clicking adds the skill with defaults (priority: high, timeline: 30 days).

**Footer:** Cancel and Create/Save button (disabled if name is empty)

### Data Model

```typescript
type SkillPriority = "critical" | "high" | "medium" | "low";

interface JobTitleSkillRequirement {
  skillId: string;
  required: boolean;
  priority: SkillPriority;
  targetTimelineDays: number;
  notes?: string;
}

interface JobTitle {
  id: string;
  name: string;
  department: string;
  site: string;
  description: string;
  requiredSkills: JobTitleSkillRequirement[];
  onboardingPathId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserSkillGapResult {
  required: JobTitleSkillRequirement[];
  gaps: JobTitleSkillRequirement[];
  covered: JobTitleSkillRequirement[];
  compliancePct: number;
}
```

### Store Functions

- `getJobTitles()` — returns all job titles
- `createJobTitle(data)` — creates a new job title, returns it
- `updateJobTitle(id, data)` — updates, returns updated entity
- `getUsersByJobTitle(jobTitleId)` — returns all users with `jobTitleId` matching
- `getUserSkillGapsByJobTitle(userId)` — computes gap analysis for a user against their job title's required skills
- `getActiveUserSkillRecordsByUserId(userId)` — returns active skill records for compliance calculations

---

## 5. Tab 4 — Skills

**URL:** `/admin/learningmodel?tab=skills`
**Component:** `components/admin/learningmodel/SkillsTab.tsx`

### Purpose

The master catalog of all competencies and certifications in the organization. Skills are the atomic unit of the Learning Model — they are what job titles require, what courses grant, what onboarding paths target, and what the compliance engine checks.

The tab has two sections: **Skills Library** (top) and **Work Context Requirements** (bottom).

### Section 1: Skills Library

**Header:** "Skills Library" with subtext "All skills and certifications in your organization"

**Filters (in a card):**
- Search input — matches name, description, or regulatory reference
- Type filter: All Types / Skills / Certifications
- Category filter: All Categories / dynamically populated from existing skills
- "Create Skill" button (admin only)

**Count text:** "Showing X of Y skills"

**Table columns:**

| Column | Description |
|--------|-------------|
| Name | Skill name + description (if any) + regulatory reference (blue, if any) |
| Type | Badge: "Skill" (default) or "Certification" (info/blue) |
| Category | Badge with category name (e.g., "Safety", "Equipment") or "General" |
| Expiry | "No expiry" or formatted duration ("1 year", "365 days") |
| Users | Count of active users holding this skill |
| Evidence Required | Badge: "Required" (green) or "Optional" (default) |
| Actions | Edit button + Delete button (admin only) |

**Delete guard:** Cannot delete a skill if any users hold it. Shows an alert with the count.

**Delete confirmation:** Modal with "Are you sure?" + Cancel/Delete buttons.

### Section 2: Work Context Requirements

**Header:** "Work Context Requirements" with subtext "Skills required for specific types of work (for future CMMS integration)"

This maps skills to specific operational contexts, enabling future enforcement where (for example) a technician without LOTO certification cannot be assigned a LOTO work order.

**Filters:**
- Search input — matches skill name or context key
- Context Type filter: All Types / Asset Type / Work Order Type / Permit Type / Inspection Type / Training Type
- Enforcement filter: All Enforcement / None / Warn / Block
- "Clear filters" link (when active)

**Count text:** "Showing X of Y requirements" (when filtered)

**Table columns:**

| Column | Description |
|--------|-------------|
| Context Type | Badge with formatted type (e.g., "Asset Type", "Work Order Type") |
| Context Key | The specific context value (e.g., "LOTO", "ConfinedSpace", "HVAC") |
| Skill | Skill name (resolved from ID) |
| Required | Badge: "Required" (red) or "Recommended" (yellow) |
| Enforcement | Badge: "block" (red), "warn" (yellow), "none" (default) |
| Actions | Delete button (admin only) |

**"Add Requirement" button** opens `AddWorkContextRequirementModal`.

### Data Model

```typescript
interface SkillV2 {
  id: string;
  name: string;
  category?: string;                // "Safety", "Equipment", "Compliance", "Technical"
  type: "skill" | "certification";
  expiryDays?: number;              // For certifications: days until expiry
  requiresEvidence: boolean;
  requiresAssessment: boolean;
  description?: string;
  regulatoryRef?: string;           // "OSHA 1910.147", "EPA 608"
  level?: number;                   // 1=basic, 2=intermediate, 3=advanced
  prerequisiteSkillIds?: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

type UserSkillStatus = "active" | "expired" | "pending" | "revoked"
                     | "suspended" | "renewing" | "expiring";

interface UserSkillRecord {
  id: string;
  userId: string;
  skillId: string;
  status: UserSkillStatus;
  achievedDate?: string;
  // ...additional lifecycle fields
}

type WorkContextType = "asset_type" | "work_order_type" | "permit_type"
                     | "inspection_type" | "training_type";

type EnforcementMode = "none" | "warn" | "block";

interface WorkContextSkillRequirement {
  id: string;
  contextType: WorkContextType;
  contextKey: string;              // "LOTO", "ConfinedSpace", "HotWork", "HVAC"
  skillId: string;
  required: boolean;
  level?: number;
  enforcementMode: EnforcementMode;
}
```

### Store Functions

- `getActiveSkillsV2()` — returns all active skills
- `getSkillV2ById(id)` — single skill lookup
- `deleteSkillV2(id)` — soft-delete (sets `active: false`)
- `getUserSkillRecords()` — all user-skill records (for user count)
- `getWorkContextSkillRequirements()` — all work context requirements
- `deleteWorkContextSkillRequirement(id)` — removes a work context requirement

---

## 6. Tab 5 — Sources

**URL:** `/admin/learningmodel?tab=sources`
**Component:** `components/admin/learningmodel/SourcesTab.tsx`

### Purpose

Controls which items from the Content Library are available for AI generation. When the AI generates a course or onboarding path, it references only the library items flagged as "AI-enabled." This tab is the toggle layer between the library and the AI pipeline.

### Stats Cards (top)

| Card | Metric |
|------|--------|
| AI-enabled sources | Count of library items with `allowedForSynthesis = true` (green lightning icon) |
| Total library sources | Count of all non-archived library items |

### View Toggle + Search

- **Toggle buttons:** "AI Enabled (N)" / "All Sources (N)" — switches between showing only AI-enabled items vs. all active items
- **Search input** — matches title, description, tags, regulatory reference

### Link to Library

Top-right: "Go to Library" link → navigates to `/admin/library`

### Table Columns

| Column | Description |
|--------|-------------|
| Source | Title + description (truncated) |
| Type | Badge with item type (PDF, video, link, etc.) |
| Categories | Category chips |
| Regulatory Ref | Regulatory reference string or "—" |
| AI Status | "Enabled" badge (green lightning) or "Disabled" (gray) |
| Action | "Enable for AI" button (green) or "Disable" button (gray) |

### Toggle Behavior

Clicking the action button toggles `allowedForSynthesis` on the library item. Toast confirmation shows: `"[title]" enabled for AI generation` or `"[title]" removed from AI sources`.

### Empty States

- **AI Enabled view, no sources enabled:** Icon + "No sources enabled for AI" + "Switch to All Sources to enable library items for AI generation" + "Browse All Sources" button
- **Search with no results:** "No sources match your search."

### Data Model (relevant fields on LibraryItem)

```typescript
interface LibraryItem {
  id: string;
  type: string;                    // "pdf", "video", "link", "image", "document", "text"
  title: string;
  description?: string;
  tags: string[];
  categories: string[];
  url?: string;
  regulatoryRef?: string;
  allowedForSynthesis: boolean;    // THE KEY FIELD — toggled by this tab
  archivedAt?: string;
  // ...additional metadata
}
```

### Store Functions

- `getLibraryItems()` — returns all library items
- `updateLibraryItem(id, { allowedForSynthesis })` — toggles AI enablement

---

## 7. Data Model Reference

### Entity Relationship Summary

```
Organization
  └── OrganizationProfile     (1:1)  — industry, geography, regulations
  └── OrgStyleGuide           (1:1)  — tone, terms, banned words

SkillV2[]                     (catalog)
  └── UserSkillRecord[]       (many:many with Users)
  └── WorkContextSkillRequirement[]  (many:many with work contexts)

JobTitle[]
  ├── requiredSkills[]        (embedded JobTitleSkillRequirement[])
  ├── onboardingPathId?       (0:1 → OnboardingPath)
  └── Users[]                 (1:many via User.jobTitleId)

LibraryItem[]
  └── allowedForSynthesis     (boolean flag toggled by Sources tab)

OnboardingPath
  └── phases[] → courses[]    (linked to Courses)
  └── skillsCovered[]         (linked to SkillV2)
```

### How Data Flows Through the System

```
Organization Profile + Content Standards
         │
         ▼
   AI Generation Context
         │
         ▼
┌─────────────────────────────────────────────┐
│  AI generates Course / Onboarding Path      │
│  using: Sources (enabled library items)     │
│         + Org profile (industry, regs)      │
│         + Style guide (tone, terms)         │
│         + Job Title required skills (gaps)  │
└─────────────────────────────────────────────┘
         │
         ▼
   Course assigned to users by role/site/dept
         │
         ▼
   Learner completes course → earns skills
         │
         ▼
   Skill gap recalculated per Job Title
```

---

## 8. Cross-Feature Integrations

### Learning Model → Course Generation (`/admin/courses/generate`)
- Organization profile provides industry context and regulatory framework for AI prompts
- Content Standards provide tone, terminology rules, and custom AI instructions
- Sources (AI-enabled library items) serve as reference material for generated content

### Learning Model → Onboarding Paths (`/admin/onboarding`)
- Job Title required skills define what an onboarding path needs to cover
- "Generate Onboarding Path" button on Job Title detail view triggers generation at `/admin/onboarding?action=generate&jobTitleId={id}`
- Generated path maps back via `JobTitle.onboardingPathId`

### Learning Model → Compliance (`/admin/compliance`)
- Skill gap analysis (`getUserSkillGapsByJobTitle`) powers compliance dashboards
- Work Context Requirements provide future CMMS integration enforcement

### Learning Model → User Management (`/admin/users/[id]`)
- User's `jobTitleId` links to a Job Title → drives which skills they need
- User skill records track what skills they have vs. what's required
- Employee links in Job Title detail view navigate to user profile

### Learning Model → Course Editor (`/admin/courses/[id]/edit`)
- Style audit checks course content against Content Standards (banned terms, preferred terms, tone)

### Learning Model → Learner Experience
- Courses grant skills (`Course.skillsGranted[]`) → creates `UserSkillRecord`
- Progress tracking → completion → skill issuance → gap recalculation

---

## 9. JIRA Epic & Story Breakdown

### Epic: LMS Learning Model Configuration Console

**Epic Description:** Build the admin-facing Learning Model page that allows administrators to configure the AI context, define organizational roles and skill requirements, manage the skills catalog, and control which knowledge sources are available for AI generation.

---

### Story 1: Organization Profile Tab

**Title:** [Learning Model] Organization Profile — Industry, geography, and regulatory setup

**Description:**
As an admin, I want to configure my organization's profile (industry, company size, geography, regulatory frameworks) so that the AI generates training content relevant to my specific business context.

**Acceptance Criteria:**
- [ ] Tab accessible at `/admin/learningmodel?tab=organization`
- [ ] Empty state with CTA shown when no profile exists
- [ ] Form includes: Company Name, Industry (required, 14 options), Industry Sub-type (dynamic based on industry), Company Size, Brief Description
- [ ] Geography section: Primary Country (required), State/Region (dropdown for US, text for others), Additional Countries (multi-select chips), Primary Language, Additional Languages (multi-select chips)
- [ ] California selection shows Cal/OSHA hint
- [ ] Regulatory Frameworks section with 3 groups of checkboxes (Safety & Health: 7 items, Quality & Management: 6 items, Industry-Specific: 7 items) plus a free-text "Other" field
- [ ] "Save Changes" persists all fields and records `updatedAt` + `updatedByUserId`
- [ ] Footer shows last updated date and user name
- [ ] Info callout about how context improves AI quality

---

### Story 2: Content Standards Tab

**Title:** [Learning Model] Content Standards — Tone, terminology, and AI instructions

**Description:**
As an admin, I want to configure writing tone, preferred/banned terminology, training defaults, and custom AI instructions so that all generated content matches our organizational voice and standards.

**Acceptance Criteria:**
- [ ] Tab accessible at `/admin/learningmodel?tab=content-standards`
- [ ] Tone section: dropdown with Plain / Professional / Friendly options
- [ ] Preferred Terms section: add/edit/delete rows of "term → preferred term" pairs
- [ ] Banned Terms section: add/delete chip-style tags
- [ ] Training Defaults: Default passing score (0-100% number input), Default recertification period (dropdown: Annual, Bi-Annual, Every 2 Years, Every 3 Years)
- [ ] Custom AI Instructions: 6-row textarea with example placeholder text
- [ ] Save button disabled until changes are made
- [ ] Saves both `OrgStyleGuide` (on Organization) and profile fields
- [ ] Toast notification on save
- [ ] Info callout about style audit integration

---

### Story 3: Job Titles Tab — List View

**Title:** [Learning Model] Job Titles — List view with search and create

**Description:**
As an admin, I want to see all job titles in my organization as cards, search/filter them, and create new ones so that I can define what roles exist and manage their configurations.

**Acceptance Criteria:**
- [ ] Tab accessible at `/admin/learningmodel?tab=jobtitles`
- [ ] Search input filters by name, department, or site
- [ ] "Create Job Title" button opens the create modal
- [ ] Each card shows: job title name, department/site, employee count, required skills count, average skill gaps, skill badges (with certification icon), onboarding status
- [ ] "View Details" navigates to detail view
- [ ] "Edit" opens the edit modal
- [ ] Empty state when no job titles exist
- [ ] "No job titles match your search" when search has no results

---

### Story 4: Job Titles Tab — Detail View

**Title:** [Learning Model] Job Title Detail — Skills matrix, employee compliance, and onboarding

**Description:**
As an admin, I want to drill into a job title to see its required skills with team coverage status, per-employee compliance, and onboarding path linkage so that I can identify and address skill gaps.

**Acceptance Criteria:**
- [ ] Detail view replaces list view (back arrow returns)
- [ ] Header shows job title name, department/site, description
- [ ] Edit button opens edit modal
- [ ] Required Skills table: Skill name (with priority color dot + cert icon), Priority level, Timeline ("Within Xd"), Team Status ("X of Y missing" or "All Y have it")
- [ ] Skills sorted by priority (critical first)
- [ ] Employees table: clickable employee name (→ `/admin/users/[id]`), compliance progress bar (green/yellow/red), missing skills list
- [ ] Below table: average team compliance %, count of employees with gaps
- [ ] Onboarding section: if path linked → shows path title, duration, course count, skills count, "View in Onboarding" link; if no path → "Generate Onboarding Path" button → `/admin/onboarding?action=generate&jobTitleId={id}`

---

### Story 5: Job Title Create/Edit Modal

**Title:** [Learning Model] Job Title Create/Edit Modal — Role definition with skill mapping

**Description:**
As an admin, I want to create or edit a job title by specifying its name, department, site, and required skills (with priority and timeline) so that I can define what competencies each role needs.

**Acceptance Criteria:**
- [ ] Modal overlay with form fields: Name (required), Description, Department (dropdown: 7 options), Site (dropdown: 3 options)
- [ ] Required Skills section: table of selected skills with Priority dropdown (Critical/High/Medium/Low) and Timeline dropdown (3/7/14/21/30/60/90 days), delete button per row
- [ ] Skill search typeahead: search input filters available skills, dropdown shows name + category + type, clicking adds with defaults (priority: high, timeline: 30 days)
- [ ] Create button disabled if name is empty
- [ ] Create mode: calls `createJobTitle()`, Edit mode: calls `updateJobTitle()`
- [ ] Modal closes on save or cancel

---

### Story 6: Skills Library

**Title:** [Learning Model] Skills Library — Catalog of all skills and certifications

**Description:**
As an admin, I want to view, search, filter, create, edit, and delete skills and certifications in a centralized catalog so that job titles and courses can reference a consistent set of competencies.

**Acceptance Criteria:**
- [ ] Section header: "Skills Library" with subtext
- [ ] Filters: search (name/description/regulatory ref), type (All/Skills/Certifications), category (dynamic from existing skills)
- [ ] "Create Skill" button (admin only) opens skill creation modal
- [ ] Table columns: Name (+ description + regulatory ref), Type badge, Category badge, Expiry, User count, Evidence Required badge, Actions (Edit/Delete)
- [ ] Delete guard: cannot delete if users hold the skill (shows alert with count)
- [ ] Delete confirmation modal
- [ ] Count text: "Showing X of Y skills"

---

### Story 7: Work Context Requirements

**Title:** [Learning Model] Work Context Requirements — Skill-to-work-context mapping

**Description:**
As an admin, I want to define which skills are required for specific work contexts (asset types, work order types, permit types, etc.) so that the system can enforce or warn when unqualified workers are assigned restricted tasks (future CMMS integration).

**Acceptance Criteria:**
- [ ] Section below Skills Library with border separator
- [ ] Header: "Work Context Requirements" with subtext mentioning future CMMS integration
- [ ] Filters: search (skill or context key), context type dropdown, enforcement dropdown, clear filters link
- [ ] "Add Requirement" button (admin only) opens modal
- [ ] Table columns: Context Type badge, Context Key, Skill name, Required badge (Required/Recommended), Enforcement badge (block/warn/none), Actions (Delete)
- [ ] Confirm dialog on delete
- [ ] Filter count: "Showing X of Y requirements"

---

### Story 8: Sources Tab

**Title:** [Learning Model] Sources — Knowledge sources for AI generation

**Description:**
As an admin, I want to enable or disable library items for AI content generation so that I control which reference materials (SOPs, manuals, policies) the AI uses when creating courses and onboarding paths.

**Acceptance Criteria:**
- [ ] Tab accessible at `/admin/learningmodel?tab=sources`
- [ ] Stats cards: AI-enabled count + total library count
- [ ] View toggle: "AI Enabled (N)" / "All Sources (N)"
- [ ] Search input filters by title, description, tags, regulatory ref
- [ ] "Go to Library" link → `/admin/library`
- [ ] Table columns: Source (title + description), Type badge, Categories chips, Regulatory Ref, AI Status badge, Action button (Enable/Disable toggle)
- [ ] Toggle updates `allowedForSynthesis` on library item + shows toast
- [ ] Empty state: icon + message + "Browse All Sources" button when no AI-enabled sources

---

### Story 9: Page Shell & Tab Navigation

**Title:** [Learning Model] Page Shell — Tab navigation and access control

**Description:**
As an admin, I want a tabbed interface at `/admin/learningmodel` with URL-driven tab state so that I can navigate between Organization, Content Standards, Job Titles, Skills, and Sources tabs with deep-linkable URLs.

**Acceptance Criteria:**
- [ ] Page at `/admin/learningmodel` with header: sparkle icon + "Learning Model" + subtitle
- [ ] 5 tabs with icons: Organization (Building2), Content Standards (FileText), Job Titles (Briefcase), Skills (Wrench), Sources (Library)
- [ ] Active tab has purple underline + purple text; inactive tabs are gray with hover state
- [ ] Tab selection updates URL param `?tab=<id>` without page reload
- [ ] URL param drives initial tab on page load
- [ ] Default tab is "jobtitles" if no param
- [ ] Non-admin users see "Access Denied" message
- [ ] Suspense wrapper for `useSearchParams()`

---

### Non-Functional / Technical Stories

**Story 10:** [Learning Model] Store functions for Organization Profile CRUD
**Story 11:** [Learning Model] Store functions for Job Title CRUD + skill gap computation
**Story 12:** [Learning Model] Store functions for Skills V2 CRUD + user skill records
**Story 13:** [Learning Model] Store functions for Work Context Requirements CRUD
**Story 14:** [Learning Model] Seed data for demo (sample job titles, skills, work context requirements, org profile)

---

## Appendix: File Reference

| File | Purpose |
|------|---------|
| `app/admin/learningmodel/page.tsx` | Page component with tab routing |
| `components/admin/learningmodel/OrganizationTab.tsx` | Organization profile form |
| `components/admin/learningmodel/ContentStandardsTab.tsx` | Content standards form |
| `components/admin/learningmodel/JobTitlesTab.tsx` | Job titles list view |
| `components/admin/learningmodel/JobTitleDetailView.tsx` | Job title detail/drill-down |
| `components/admin/learningmodel/JobTitleModal.tsx` | Create/edit job title modal |
| `components/admin/learningmodel/SkillsTab.tsx` | Skills library + work context requirements |
| `components/admin/learningmodel/SourcesTab.tsx` | AI sources management |
| `components/admin/learningmodel/HistoryTab.tsx` | (Exists but not wired to tabs) |
| `components/admin/learningmodel/SettingsTab.tsx` | (Exists but not wired to tabs) |
| `types.ts` | All TypeScript interfaces and types |
| `lib/store.ts` | In-memory state management and business logic |
| `data/seedSkillsV2.ts` | Seed data for skills |
