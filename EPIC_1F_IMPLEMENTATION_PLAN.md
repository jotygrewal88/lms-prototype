# Epic 1F - Unified Course Editor Visual Polish
## Implementation Progress

### ✅ Completed (Epic 1E foundation)
- Modern section cards with left accent bars
- Autosave feedback chips (indigo "Saving..." / emerald "Saved")
- Improved empty states with friendly copy
- Clean lesson title input with underline style
- Color-coded type badges (indigo/emerald/sky/rose/amber)

### 🚧 In Progress - Overview Tab Modernization

**Goal:** Transform from plain form → modern dashboard

**Changes to implement:**
1. **Course Header Card** (new component)
   - Large title with status badge
   - Owner, created/updated metadata
   - Thumbnail placeholder
   - Clean grid layout

2. **Metadata Grid Cards**
   - Group Category, Duration, Status into visual card
   - Group Tags & Standards into separate cards
   - Add subtle shadows

3. **Inline Editing with Autosave**
   - Same chip pattern as Lessons tab
   - Debounced save (1.5s)
   - Visual feedback

4. **Preview as Learner Button**
   - Top-right position
   - Consistent across all tabs

### ⏳ Pending - Other Tabs

**Lessons Tab:**
- Add bg-gray-50 behind sections list
- Enhanced hover shadows
- Pastel chips (already mostly done)

**Quiz Tab:**
- Card-based questions layout
- Type chips (Multiple Choice, True/False)
- Side summary panel
- Modern "+ Add Question" CTA

**Settings Tab:**
- Grouped cards (Completion Rules, Quiz Behavior, Timing)
- Toggle switches instead of checkboxes
- Toast confirmation

**Assignment Tab:**
- Horizontal filter chips (Users/Roles/Sites/Departments)
- Grid cards for selections
- Sticky footer with "Assign Selected" CTA
- Collapsible current assignments

---

## Design System Reference

### Colors
- **Base:** `bg-white`, `bg-gray-50`, `text-gray-900`, `border-gray-200`
- **Accent:** `#6366F1` (Indigo) for CTAs, active states, highlights
- **Type Colors:**
  - Text → `indigo-600`
  - Link → `emerald-600`
  - Image → `sky-600`
  - Video → `rose-600`
  - PDF → `amber-600`

### Typography
- **Headings:** `text-lg font-semibold text-gray-900`
- **Body:** `text-sm text-gray-600`
- **Meta:** `text-xs text-gray-400`

### Components
- **Cards:** `rounded-xl shadow-sm hover:shadow-md`
- **Chips:** Pastel backgrounds with colored text/icons
- **Buttons:**
  - Primary: `bg-indigo-600 text-white hover:bg-indigo-700`
  - Secondary: `border-gray-300 text-gray-700 hover:bg-gray-50`
  - Tertiary: Ghost with hover

### Motion
- **Transitions:** `transition-all duration-200 ease-in-out`
- **Entrance:** `animate-in fade-in slide-in-from-bottom-2`
- **Hover:** `hover:shadow-md hover:scale-[1.01]`

---

## File Modifications Needed

1. `/app/admin/courses/[id]/edit/page.tsx`
   - Overview tab layout
   - Quiz tab modernization
   - Settings tab grouping
   - Assignment tab redesign
   
2. **New Components:**
   - `CourseHeaderCard.tsx` (Overview tab)
   - `MetadataGrid.tsx` (Overview tab)
   - `QuestionCard.tsx` (Quiz tab)
   - `SettingsCard.tsx` (Settings tab)
   - `PreviewAsLearnerModal.tsx` (Global)

---

## Status: Starting with Overview Tab

Current focus: Modernizing the Overview tab with the new design system.

