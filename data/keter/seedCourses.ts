// Keter, Anderson seed: pre-built published demo course covering critical
// spare parts and stockout discipline. Three lessons, all populated inline
// at module load (the lesson body text passes through the Keter Markdown
// converter so callouts, tables, and lists render natively in both the
// editor preview and the learner player).
import {
  Course,
  Lesson,
  Resource,
  Quiz,
  Question,
  CourseAssignment,
  ProgressCourse,
  ProgressLesson,
  Certificate,
  CoursePolicy,
  Slide,
  KnowledgeCheckData,
} from "@/types";
import { markdownToHtml } from "@/lib/keter/markdownToHtml";
import {
  inventoryHealthChart,
  stockoutCostCascade,
  criticalityMatrix,
} from "@/lib/keter/visuals";

const now = new Date().toISOString();
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const keterDefaultPolicy: CoursePolicy = {
  progression: "linear",
  requireAllLessons: true,
  requirePassingQuiz: true,
  enableRetakes: true,
  lockNextUntilPrevious: true,
  showExplanations: true,
  requiresManualCompletion: false,
  minVideoWatchPct: 80,
  minTimeOnLessonSec: 60,
  maxQuizAttempts: 3,
  retakeCooldownMin: 60,
};

const COURSE_ID = "keter-course-stockouts";

const LESSON_1_ID = "keter-lesson-stockouts-1";
const LESSON_2_ID = "keter-lesson-stockouts-2";
const LESSON_3_ID = "keter-lesson-stockouts-3";

// ─── Lesson 1, Why Stockouts Hurt ──────────────────────────────────────────

const lesson1TextMarkdown = `> Anderson plant currently has 2,572 inventory records on file. Of those, 920 are out of stock and 34 are at low stock. This lesson explains why those numbers matter to your shift, your team, and your plant's reliability, and what you can do about them.

The cost equation isn't just the part. A stockout on a critical part cascades into extended downtime, emergency procurement at premium prices, disruption to planned PMs on adjacent assets, and overtime to recover lost production. The visible line item, the part itself, is usually the smallest piece of what the event actually costs Anderson.

The hidden cost is in your team. Every emergency shipment competes with maintenance team capacity. A technician chasing a part is a technician not running PMs. When 920 inventory records are already out of stock, every reactive event compounds the workload of teams that were supposed to be doing planned work, and the plant slides further behind on the maintenance calendar with each event.

Some plants run lean inventory deliberately, and for high-volume consumables with predictable demand and short lead times that strategy works well. Where it breaks down is on **critical spares with long lead times**, exactly the parts whose absence stops production. A 6-week lead-time pump is not the same kind of inventory as a box of zip ties.

| Scenario | Part Cost | Downtime | Team Disruption | Total Operational Impact |
|---|---|---|---|---|
| Planned replacement (in stock) | Standard pricing | 2 hours scheduled | Minimal, planned in advance | Baseline |
| Stockout, overnight emergency shipment | 30-60% premium | 16-24 hours unplanned | Significant, overtime, rerouted technicians | 4-6x baseline |
| Stockout, long lead time, no expedite available | Standard pricing | Days to weeks unplanned | Severe, cascading PM delays | 10x+ baseline |

<figure class="callout-figure">
${stockoutCostCascade}
<figcaption>First-24-hour cost cascade by scenario</figcaption>
</figure>

<figure class="callout-figure">
${inventoryHealthChart}
<figcaption>Source: Anderson plant inventory snapshot, last 30 days</figcaption>
</figure>

A single stockout event on a critical asset can cost more than a full quarter of properly stocked inventory carrying costs. Inventory discipline isn't about hoarding parts. It's about knowing which parts actually matter and protecting against the failure modes that hurt the most.`;

const lesson1Resources: Resource[] = [
  {
    id: "keter-resource-stockouts-1-1",
    courseId: COURSE_ID,
    lessonId: LESSON_1_ID,
    type: "text",
    title: "The Real Cost of an Out-of-Stock Part",
    content: markdownToHtml(lesson1TextMarkdown),
    order: 0,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
  {
    id: "keter-resource-stockouts-1-2",
    courseId: COURSE_ID,
    lessonId: LESSON_1_ID,
    type: "knowledge-check",
    title: "Knowledge Check: The 2 AM Pump Stockout",
    knowledgeCheckData: {
      question:
        "A press at the Anderson plant goes down at 2 AM. The hydraulic pump that failed is out of stock. Emergency overnight shipment will arrive at 6 PM the next day. What's the total operational impact?",
      type: "scenario",
      options: [
        { text: "Just the cost of the replacement pump", isCorrect: false },
        {
          text: "The pump cost plus 16 hours of downtime",
          isCorrect: false,
        },
        {
          text: "The pump cost plus downtime plus the 30-60% emergency shipment premium",
          isCorrect: false,
        },
        {
          text: "The pump cost plus downtime plus emergency shipment premium plus cascade effects on delayed PMs and team overtime",
          isCorrect: true,
        },
      ],
      explanation:
        "A stockout is never just the part. Every hour the press is down delays scheduled PMs on adjacent assets, pulls technicians off planned work to chase the emergency, triggers overtime to recover lost production, and pays a 30-60% expedite premium on the part itself. The full impact is 4-6x what a planned replacement would have cost. This is why critical-spare discipline matters. It's the cheapest insurance the plant has.",
    },
    order: 1,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
];

// ─── Lesson 2, Identifying Critical Spares ─────────────────────────────────

const lesson2Slides: Slide[] = [
  {
    id: "keter-slide-stockouts-2-1",
    layoutType: "key-point",
    title: "What Makes a Part \u201cCritical\u201d?",
    body: "A part is critical when its failure stops production AND its replacement isn't immediately available. Both conditions must be true.\n\nA consumable that fails often but is in stock isn't critical. A rare part that's stocked and never fails isn't critical. The intersection (a part whose failure stops the line, with a supply chain that can't recover quickly) is what actually matters.",
    // TODO: Replace with real image, Venn diagram showing the intersection of "failure stops production" and "long lead time / unreliable supply"
    imageUrl:
      "https://placehold.co/600x400?text=CRITICAL+PART+VENN+DIAGRAM",
  },
  {
    id: "keter-slide-stockouts-2-1b",
    layoutType: "content",
    title: "The Criticality Matrix (Visual)",
    diagram: criticalityMatrix,
    body: "Map every part on two axes: failure impact and replacement lead time. The top-right quadrant is your critical-spares list.",
  },
  {
    id: "keter-slide-stockouts-2-2",
    layoutType: "content",
    title: "The Criticality Matrix",
    body: "Map every spare part on two axes: **Failure Impact** (low / medium / high / production-stopping) and **Replacement Lead Time** (in stock / days / weeks / months).\n\nThe top-right quadrant (production-stopping AND long lead time) is your critical spares list. Everything else is normal inventory and should follow standard min/max rules.",
    // TODO: Replace with real image, 2x2 matrix diagram with Failure Impact on Y-axis and Lead Time on X-axis, with the top-right quadrant highlighted
    imageUrl:
      "https://placehold.co/600x400?text=CRITICALITY+2x2+MATRIX",
  },
  {
    id: "keter-slide-stockouts-2-3",
    layoutType: "content",
    title: "Walking Your Asset List",
    body: "At Anderson, you have **792 active assets**. Not every part on every asset needs critical-spare treatment.\n\nThe **80/20 rule** applies: roughly 20% of your assets generate 80% of your reactive work orders. Start there. Walk the top quintile by reactive WO count and downtime hours, and the parts on those assets are where critical-spare discipline pays off the fastest.",
    // TODO: Replace with real image, bar chart showing work order distribution across asset categories with the top 20% highlighted
    imageUrl:
      "https://placehold.co/600x400?text=WORK+ORDER+PARETO+CHART",
  },
  {
    id: "keter-slide-stockouts-2-4",
    layoutType: "content",
    title: "Tagging Critical Parts in UpKeep",
    body: "Once a part is identified as critical, four things have to happen in UpKeep:\n\n- Mark the part as **Critical** on the part record.\n- Set **min/max levels** that account for both consumption rate and lead time.\n- Link the part to its associated **assets** so it surfaces on those work orders.\n- Configure a **low-stock alert** that fires before you hit the reorder point, not after.",
    // TODO: Replace with real image, UpKeep mobile interface showing a part record with the Critical flag toggled on
    imageUrl:
      "https://placehold.co/600x400?text=UPKEEP+CRITICAL+PART+TAG",
  },
  {
    id: "keter-slide-stockouts-2-5",
    layoutType: "content",
    title: "Reviewing & Updating Quarterly",
    body: "Critical-spare lists drift over time. Assets get retired, new equipment comes in, lead times shift with supplier changes, and consumption rates move with production volume.\n\nA **quarterly review** keeps the list accurate. Schedule it. Treat it as part of the maintenance calendar, not a side project. The plants that get this right are the ones whose stockout numbers trend down year over year.",
    // TODO: Replace with real image, calendar showing a recurring quarterly review meeting
    imageUrl:
      "https://placehold.co/600x400?text=QUARTERLY+REVIEW+CALENDAR",
  },
];

const lesson2TextMarkdown = `With 792 active assets and 2,572 inventory records, the question isn't whether to maintain a critical-spares list. It's where to start. This section gives you a practical walkthrough for building Anderson's list from scratch or auditing the existing one.

### The six-step build

1. Pull a 12-month work order history sorted by total downtime hours per asset. The top 20 assets by downtime are your starting point.
2. For each of those 20 assets, list the parts that have been replaced in the last 12 months. Note the **lead time** on each.
3. Flag any part with a lead time longer than 5 business days as a critical-spare candidate.
4. Cross-reference with current inventory. If the part is already stocked at a quantity above its consumption rate × lead time, you're protected. If not, it goes on the list.
5. Set min/max levels for new critical spares using the formula **min = consumption rate × lead time × 1.5 safety factor**.
6. Tag the parts as Critical in UpKeep and link them to their assets so the alert fires correctly when stock dips.

| Asset Category | Likely Critical Parts | Typical Lead Time |
|---|---|---|
| Hydraulic systems | Pumps, valve assemblies, accumulators | 2-6 weeks |
| Heating systems | Heater bands, thermocouples, controllers | 1-3 weeks |
| Mold tooling | Ejector pins, gibs, leader pins | 4-8 weeks |
| Drives and motors | Servo motors, drive cards | 6-12 weeks |
| Sensors and safety | Light curtains, gate sensors | 1-2 weeks |

> The goal isn't to stock everything. It's to know exactly which 50-100 parts at Anderson would stop production if they failed today, and to make sure those parts are always there when you need them.`;

const lesson2Resources: Resource[] = [
  {
    id: "keter-resource-stockouts-2-1",
    courseId: COURSE_ID,
    lessonId: LESSON_2_ID,
    type: "slides",
    title: "Identifying Critical Spares: Visual Walkthrough",
    slides: lesson2Slides,
    order: 0,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
  {
    id: "keter-resource-stockouts-2-2",
    courseId: COURSE_ID,
    lessonId: LESSON_2_ID,
    type: "text",
    title: "Building Anderson's Critical Spares List",
    content: markdownToHtml(lesson2TextMarkdown),
    order: 1,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
  {
    id: "keter-resource-stockouts-2-3",
    courseId: COURSE_ID,
    lessonId: LESSON_2_ID,
    type: "knowledge-check",
    title: "Knowledge Check: The Press #8 Accumulator",
    knowledgeCheckData: {
      question:
        "Anderson plant has a hydraulic accumulator on Press #8 that fails roughly once every 18 months. Lead time from the supplier is 6 weeks. Replacement during a planned PM takes 90 minutes; replacement during a failure takes 14 hours of downtime. Should this part be on the critical-spares list?",
      type: "multiple-choice",
      options: [
        {
          text: "No, failure rate is too low to justify carrying inventory",
          isCorrect: false,
        },
        {
          text: "No, 14 hours of downtime is recoverable within a single shift",
          isCorrect: false,
        },
        {
          text: "Yes, long lead time plus high failure impact qualifies it as critical even with a low failure rate",
          isCorrect: true,
        },
        {
          text: "Yes, but only if it costs less than $5,000 to stock",
          isCorrect: false,
        },
      ],
      explanation:
        "Critical-spare logic isn't about how often a part fails. It's about what happens when it does. A 6-week lead time means a single failure produces 14 hours of immediate downtime PLUS up to 6 weeks of operating without backup protection if the spare isn't on hand. The cost of carrying one accumulator on the shelf is far smaller than the cost of one extended outage. Failure rate matters for sizing min/max levels, not for deciding whether to stock at all.",
    } satisfies KnowledgeCheckData,
    order: 2,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
];

// ─── Lesson 3, Min/Max & Reorder Discipline ────────────────────────────────

const lesson3TextMarkdown = `A critical-spare list is only useful if the min/max levels behind it reflect reality. Too lean and you stock out anyway. Too generous and you tie up cash that could have funded preventive maintenance. The right number sits in a narrow range and depends on three factors: **consumption rate**, **lead time**, and a **safety factor** that accounts for variability.

### The Min Calculation

\`min = (average monthly consumption) × (lead time in months) × (safety factor)\`

Each variable matters:

- **Average monthly consumption** is your historical usage. Pull at least 12 months of data so seasonality and ramp-ups are visible.
- **Lead time** is the supplier's quoted lead PLUS your internal receiving and inspection time. Most plants underestimate this.
- **Safety factor** accounts for variability in both, typically 1.3 for stable suppliers and predictable consumption, up to 2.0 for new suppliers, long-lead items, or parts with seasonal demand swings.

### The Max Calculation

\`max = min + (reorder quantity)\`

Reorder quantity is typically 3-6 months of consumption for non-critical parts, or whatever the supplier's price-break minimum is, whichever is larger. For critical parts with long lead times, max can be set conservatively. There's no penalty for having an extra month of safety stock on a part that fails rarely but stops production when it does.

### When the Numbers Lie

The most common min/max failure modes at plants like Anderson:

- Consumption rate calculated from a partial history (e.g., 3 months instead of 12) misses seasonal patterns and underestimates real usage.
- Lead time pulled from the supplier's website rather than actual receiving history. The website number is the optimistic case.
- Safety factor set to 1.0 because "we've never run out before" (until the day you do).
- Min/max set once at part creation and never reviewed, even as production volume, suppliers, and asset mix change around it.

### Worked Examples

| Part | Avg Monthly Consumption | Lead Time | Safety Factor | Calculated Min | Recommended Max |
|---|---|---|---|---|---|
| Hydraulic pump (Press #8) | 0.06 | 1.5 months | 2.0 | 1 unit | 2 units |
| Heater band (Press #12, zone 3) | 0.5 | 0.5 months | 1.5 | 1 unit | 4 units |
| Servo drive card (any press) | 0.08 | 3 months | 2.0 | 1 unit | 2 units |
| Thermocouple (general) | 4.0 | 0.25 months | 1.3 | 2 units | 14 units |

> Min/max isn't a one-time setup. Review it quarterly alongside your critical-spares list. The numbers drift. Your stocking levels should drift with them.`;

const lesson3Resources: Resource[] = [
  {
    id: "keter-resource-stockouts-3-1",
    courseId: COURSE_ID,
    lessonId: LESSON_3_ID,
    type: "text",
    title: "Setting Min/Max That Actually Works",
    content: markdownToHtml(lesson3TextMarkdown),
    order: 0,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
  {
    id: "keter-resource-stockouts-3-2",
    courseId: COURSE_ID,
    lessonId: LESSON_3_ID,
    type: "knowledge-check",
    title: "Knowledge Check: Sizing the Thermocouple Min",
    knowledgeCheckData: {
      question:
        "Anderson uses an average of 3 thermocouples per month, lead time is 2 weeks, and consumption has been stable for 18 months. What's the appropriate minimum stock level using the standard formula with a 1.3 safety factor?",
      type: "multiple-choice",
      options: [
        { text: "1 unit", isCorrect: false },
        { text: "2 units", isCorrect: true },
        { text: "4 units", isCorrect: false },
        { text: "6 units", isCorrect: false },
      ],
      explanation:
        "Apply the formula: monthly consumption (3) × lead time in months (0.5) × safety factor (1.3) = 1.95. Round up to 2 units. The 1.3 safety factor is appropriate here because consumption is stable and the supplier is reliable. If consumption was variable or the supplier was new, you'd use 1.5 or 2.0 instead. Setting the min at 4 or 6 ties up cash unnecessarily for a fast-moving, short-lead-time part.",
    } satisfies KnowledgeCheckData,
    order: 1,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
];

// ─── Lessons ────────────────────────────────────────────────────────────────

const stockoutsLessons: Lesson[] = [
  {
    id: LESSON_1_ID,
    courseId: COURSE_ID,
    title: "Why Stockouts Hurt",
    order: 0,
    resourceIds: lesson1Resources.map((r) => r.id),
    estimatedMinutes: 15,
    lessonType: "lesson",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
  {
    id: LESSON_2_ID,
    courseId: COURSE_ID,
    title: "Identifying Critical Spares",
    order: 1,
    resourceIds: lesson2Resources.map((r) => r.id),
    estimatedMinutes: 15,
    lessonType: "lesson",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
  {
    id: LESSON_3_ID,
    courseId: COURSE_ID,
    title: "Min/Max & Reorder Discipline",
    order: 2,
    resourceIds: lesson3Resources.map((r) => r.id),
    estimatedMinutes: 15,
    lessonType: "lesson",
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
];

// ─── Filler / demo-only courses ────────────────────────────────────────────
//
// These six entries populate the Keter admin course list so the demo
// doesn't read as "two real courses + an empty page." Each filler course
// has an empty lessonIds array and an id starting with `keter-filler-`,
// which the admin course list uses to disable click navigation (see
// app/keter/admin/courses/page.tsx): clicking a filler card does nothing
// rather than opening a broken empty editor. The two real courses
// (Stockouts below and any wizard-generated course) keep their normal
// click-to-edit behavior.
//
// Statuses are intentionally mixed (Published / AI Draft / In Review) so
// the list looks organically populated. Categories, durations, output
// formats, and difficulty levels also vary so the cards don't read as
// templated.

const stockoutsCourse: Course = {
  id: COURSE_ID,
  title: "Reducing Stockouts on Critical Spare Parts",
  description:
    "Practical training for Maintenance Technicians and Maintenance Planners on identifying critical spare parts, predicting stockouts, and using the Anderson Plant inventory system to keep production running.",
  category: "Operations",
  estimatedMinutes: 45,
  status: "published",
  outputFormat: "mixed",
  tags: ["Spare Parts", "Inventory", "Maintenance Planning", "Anderson Plant"],
  standards: [],
  skills: [],
  policy: keterDefaultPolicy,
  ownerUserId: "usr_admin_1",
  lessonIds: stockoutsLessons.map((l) => l.id),
  scope: { type: "company-wide" },
  metadata: {
    objectives: [
      "Identify critical spare parts using the Anderson Plant asset register.",
      "Recognize the leading indicators of an impending stockout.",
      "Use the Anderson Plant inventory system to place a planned replenishment order.",
    ],
    tags: ["Spare Parts", "Inventory", "Maintenance Planning"],
    difficulty: "intermediate",
    language: "en",
    readingLevel: "standard",
  },
  aiGenerated: false,
  synthesisType: "full-course",
  createdAt: daysAgo(7),
  updatedAt: daysAgo(1),
};

const keterFillerCourses: Course[] = [
  {
    id: "keter-filler-orientation",
    title: "New Hire Plant Orientation \u2014 Anderson",
    description:
      "Day-one orientation covering plant layout, safety protocols, reporting structure, emergency procedures, and an introduction to UpKeep tools used at Anderson.",
    category: "Onboarding",
    estimatedMinutes: 120,
    status: "published",
    outputFormat: "presentation",
    tags: ["Onboarding", "Plant Tour", "Anderson Plant", "New Hire"],
    standards: [],
    skills: [],
    policy: keterDefaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "company-wide" },
    metadata: {
      objectives: [],
      tags: ["Onboarding", "Plant Tour"],
      difficulty: "beginner",
      language: "en",
      readingLevel: "standard",
    },
    aiGenerated: false,
    synthesisType: "full-course",
    createdAt: daysAgo(45),
    updatedAt: daysAgo(30),
  },
  {
    id: "keter-filler-forklift",
    title: "Forklift & Material Handling Certification \u2014 Anderson Plant",
    description:
      "OSHA-compliant powered industrial truck operator training covering pre-shift inspection, load handling, narrow-aisle navigation, and incident reporting for the Anderson plant floor.",
    category: "Safety",
    estimatedMinutes: 90,
    status: "published",
    outputFormat: "mixed",
    tags: ["Forklift", "OSHA", "Material Handling", "Anderson Plant"],
    standards: [],
    skills: [],
    policy: keterDefaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "company-wide" },
    metadata: {
      objectives: [],
      tags: ["Forklift", "OSHA"],
      difficulty: "intermediate",
      language: "en",
      readingLevel: "standard",
    },
    aiGenerated: false,
    synthesisType: "full-course",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(18),
  },
  {
    id: "keter-filler-hazcom",
    title: "Hazard Communication & Resin Safety",
    description:
      "OSHA HazCom standard applied to plastics manufacturing: SDS access, label interpretation, resin handling, and personal protective equipment for Anderson's resin storage areas.",
    category: "Safety",
    estimatedMinutes: 30,
    status: "published",
    outputFormat: "reading",
    tags: ["HazCom", "OSHA", "Resin Safety", "PPE"],
    standards: [],
    skills: [],
    policy: keterDefaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "company-wide" },
    metadata: {
      objectives: [],
      tags: ["HazCom", "OSHA"],
      difficulty: "beginner",
      language: "en",
      readingLevel: "standard",
    },
    aiGenerated: false,
    synthesisType: "full-course",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(11),
  },
  {
    id: "keter-filler-hot-work",
    title: "Hot Work & Welding Permit Procedures",
    description:
      "Permit-required hot work procedures including fire watch responsibilities, atmospheric testing, and Anderson plant authorization protocols.",
    category: "Safety",
    estimatedMinutes: 60,
    status: "published",
    outputFormat: "mixed",
    tags: ["Hot Work", "Welding", "Permits", "Safety"],
    standards: [],
    skills: [],
    policy: keterDefaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "company-wide" },
    metadata: {
      objectives: [],
      tags: ["Hot Work", "Welding"],
      difficulty: "advanced",
      language: "en",
      readingLevel: "standard",
    },
    aiGenerated: false,
    synthesisType: "full-course",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(6),
  },
  {
    id: "keter-filler-quality-inspection",
    title: "Quality Inspection Standards for Molded Plastics",
    description:
      "Visual and dimensional inspection criteria for molded parts, accept/reject decision authority, and documentation standards for Anderson's quality records.",
    category: "Quality",
    estimatedMinutes: 75,
    status: "ai-draft",
    outputFormat: "mixed",
    tags: ["Quality", "Inspection", "Anderson Plant"],
    standards: [],
    skills: [],
    policy: keterDefaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "company-wide" },
    metadata: {
      objectives: [],
      tags: ["Quality", "Inspection"],
      difficulty: "intermediate",
      language: "en",
      readingLevel: "standard",
    },
    aiGenerated: true,
    synthesisType: "full-course",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  },
  {
    id: "keter-filler-confined-space",
    title: "Confined Space Entry \u2014 Tank & Silo Operations",
    description:
      "Confined space classification, attendant and entrant responsibilities, atmospheric monitoring, and rescue planning for tanks, silos, and below-grade work areas.",
    category: "Safety",
    estimatedMinutes: 75,
    status: "in-review",
    outputFormat: "presentation",
    tags: ["Confined Space", "OSHA", "Safety", "Tank Operations"],
    standards: [],
    skills: [],
    policy: keterDefaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "company-wide" },
    metadata: {
      objectives: [],
      tags: ["Confined Space", "OSHA"],
      difficulty: "advanced",
      language: "en",
      readingLevel: "standard",
    },
    aiGenerated: false,
    synthesisType: "full-course",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
];

// Final list order (the admin course list renders in seed order). Filler
// entries are interleaved around the real Stockouts course so the demo
// doesn't read as "all filler then one real course at the bottom":
//
//   1. Orientation         (filler, Published)
//   2. Forklift            (filler, Published)
//   3. HazCom              (filler, Published)
//   4. Stockouts           (real,   Published)
//   5. Hot Work            (filler, Published)
//   6. Quality Inspection  (filler, AI Draft)
//   7. Confined Space      (filler, In Review)
//
// Wizard-generated courses (e.g. the Anderson Injection Molding cert)
// are appended by createCourse() and therefore land at the end of the
// list, after the In Review filler.
export const keterCourses: Course[] = [
  keterFillerCourses[0], // Orientation
  keterFillerCourses[1], // Forklift
  keterFillerCourses[2], // HazCom
  stockoutsCourse,
  keterFillerCourses[3], // Hot Work
  keterFillerCourses[4], // Quality Inspection
  keterFillerCourses[5], // Confined Space
];

export const keterLessons: Lesson[] = stockoutsLessons;
export const keterResources: Resource[] = [
  ...lesson1Resources,
  ...lesson2Resources,
  ...lesson3Resources,
];
export const keterQuizzes: Quiz[] = [];
export const keterQuestions: Question[] = [];
export const keterAssignments: CourseAssignment[] = [];
export const keterProgressCourses: ProgressCourse[] = [];
export const keterProgressLessons: ProgressLesson[] = [];
export const keterCertificates: Certificate[] = [];

// Reference `now` so the unused-variable lint stays quiet. The value is
// intentionally available for future seed entries that want a "right now"
// timestamp without recomputing it.
void now;
