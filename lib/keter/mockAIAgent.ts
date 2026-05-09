// Keter, Anderson mock AI agent. Mirrors the public surface of
// lib/mockAIAgent.ts but is hardcoded to return the Anderson Plant Injection
// Molding Technician Certification, regardless of input.
//
// Public surface mirrored from lib/mockAIAgent.ts:
//   - AgentContext (interface, structurally identical)
//   - AgentResponse (interface, structurally identical, except attachedOutline
//     is widened from GeneratedLesson[] to KeterGeneratedLesson[] which is a
//     superset that adds an optional `sections` field, this is purely
//     additive and the Keter wizard reads it to materialize the rich
//     Text / Slides / Narrated-Walkthrough / Knowledge-Check sections that
//     each lesson should carry).
//   - generateObjectivesForTopic(topic): string[]
//   - detectCategory(topic): string
//   - generateAgentResponse(params): Promise<AgentResponse>
//
// Image placeholders use https://placehold.co/600x400?text=… with an inline
// `// TODO: Replace with real image, <description>` comment immediately
// before each one so the image-replacement pass can grep for them.

import type {
  ChatMessage,
  GeneratedLesson,
  GeneratedQuiz,
  Slide,
  NarrationData,
  KnowledgeCheckData,
} from "@/types";
import {
  pressEnergySources,
  lotoSequence,
  injectionMoldingCycle,
  defectWorkflow,
  workOrderQualityChart,
} from "./visuals";

// ──────────────────────────────────────────────────────────────────────────────
// Public types
// ──────────────────────────────────────────────────────────────────────────────

export interface AgentContext {
  selectedSourceTitles: string[];
  selectedSourceIds: string[];
  targetSkillName?: string;
  targetRole?: string;
  synthesisType: string;
  skillGapSummary?: {
    totalUsers: number;
    usersWithGaps: number;
    topGapSkills: { skillId: string; skillName: string; usersLacking: number }[];
  };
  expiringCertifications?: number;
  isNewCourse?: boolean;
  currentCourseTitle?: string;
  currentCourseDescription?: string;
  currentLessonCount?: number;
  currentObjectives?: string[];
}

// Keter-only section discriminated union. Each variant carries the exact
// payload the corresponding Resource type expects so the wizard can pass it
// straight through to createResource(...). Schemas match types.ts:
//   - text                  → Resource.content (Markdown; wizard converts to HTML)
//   - slides                → Resource.slides: Slide[]
//   - narrated-walkthrough  → Resource.narrationData: NarrationData
//   - knowledge-check       → Resource.knowledgeCheckData: KnowledgeCheckData
export type KeterLessonSection =
  | { kind: "text"; title: string; markdown: string }
  | { kind: "slides"; title: string; slides: Slide[] }
  | { kind: "narrated-walkthrough"; title: string; narration: NarrationData }
  | { kind: "knowledge-check"; title: string; check: KnowledgeCheckData };

// Superset of GeneratedLesson with an optional sections array. Anything that
// reads only the GeneratedLesson fields (title, description, content,
// duration, quizQuestions, sourceAttributions) keeps working unchanged.
export interface KeterGeneratedLesson extends GeneratedLesson {
  sections?: KeterLessonSection[];
}

// Course-level final-assessment payload. Surfaced as a top-level field on the
// agent response (not as a 6th outline entry) so the wizard creates a course
// quiz that lives on the Quiz tab, without ever materializing an empty
// "Lesson 6, Final Assessment" lesson in the lesson list.
export interface KeterFinalQuiz {
  title: string;
  description: string;
  passingScore: number;
  questions: GeneratedQuiz[];
}

export interface AgentResponse {
  message: string;
  attachedOutline?: KeterGeneratedLesson[];
  attachedSources?: string[];
  finalQuiz?: KeterFinalQuiz;
  fieldUpdates?: {
    title?: string;
    description?: string;
    objectives?: string[];
    skillIds?: string[];
    category?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    estimatedMinutes?: number;
    readingLevel?: "basic" | "standard" | "technical";
    language?: string;
    tags?: string[];
    standards?: string[];
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Anderson Plant Injection Molding course constants
// ──────────────────────────────────────────────────────────────────────────────

const ANDERSON_TITLE =
  "Injection Molding Technician Certification: Anderson Plant";

const ANDERSON_DESCRIPTION =
  "Comprehensive certification program for new injection molding operators and technicians at the Anderson plant. Covers safety procedures, machine operation, daily preventive maintenance, defect troubleshooting, and proper work order documentation.";

const ANDERSON_OBJECTIVES: string[] = [
  "Safely apply lockout/tagout to an injection molding press before service.",
  "Start, run, and shut down an injection molding press using the correct process parameters.",
  "Complete the daily preventive-maintenance checklist for an injection molding press.",
  "Identify and triage the top defects observed at the Anderson Plant in Q1 2026.",
  "Document repairs and downtime in the work-order system to Anderson Plant standards.",
];

const ANDERSON_TAGS = [
  "Injection Molding",
  "Anderson Plant",
  "Certification",
  "Press Operations",
  "Preventive Maintenance",
];

const ANDERSON_STANDARDS = [
  "OSHA 29 CFR 1910.147",
  "Keter Plastics Internal: Anderson Plant SOP",
];

// Helper for stable, descriptive section/slide IDs.
const sid = (lessonSlug: string, sectionIdx: number, slideIdx?: number): string =>
  slideIdx === undefined
    ? `keter_${lessonSlug}_s${sectionIdx}`
    : `keter_${lessonSlug}_s${sectionIdx}_sl${slideIdx}`;

// ──────────────────────────────────────────────────────────────────────────────
// Lesson 1: Lockout/Tagout for Injection Molding (~20 min)
// ──────────────────────────────────────────────────────────────────────────────

const LESSON_1_TEXT_MD = `# LOTO Fundamentals for Injection Molding Presses

Injection molding presses are some of the most energy-dense pieces of equipment on the Anderson Plant floor. A single press combines high-voltage electrical service, several thousand PSI of hydraulic clamp pressure, regulated pneumatic lines for ejection and core pulls, and barrel and mold surfaces that routinely run over 400°F. Before a technician opens the mold area, the gate guarding, or any access panel for service, **every one of those energy sources has to be isolated, locked out, and verified at zero state.**

Most LOTO incidents at injection molding facilities are not caused by a missed main breaker. They're caused by a missed *secondary* energy source. An operator drops the main, taps a lock onto the disconnect, and assumes the press is safe. Then the clamp accumulator releases stored hydraulic pressure, or a heater band stays hot long enough to cause a serious burn, or a pneumatic line still has charge in it because no one bled the receiver. Anderson's Q1 incident review found that **78% of near-misses involved residual energy after main power shutoff**, not main power itself.

The four energy sources you have to control on every Anderson injection molding press are listed below. Memorize where each one lives, where it isolates, and how you verify zero state.

| Energy Source | Where It Lives on the Press | Isolation Point | Verification Method |
|---|---|---|---|
| **Electrical** | Main control cabinet, heater bands on the barrel, servo drives, control circuits | Main disconnect at the rear of the machine and the heater-band breaker on the side panel | Voltmeter reads 0 V at the main disconnect and at each heater-band terminal |
| **Hydraulic** | Clamp cylinder, injection unit, accumulator, ejector pack | Main hydraulic shutoff valve at the rear of the machine, plus the accumulator bleed valve | Pressure gauge reads 0 PSI after 60 seconds; clamp cylinder will not move when manually actuated |
| **Pneumatic** | Ejection assist, core pulls, gate-blow assist, mold release | Pneumatic shutoff valve at the FRL (filter / regulator / lubricator) on the supply line | Regulator gauge reads 0 PSI; manually actuate the ejection cylinder to confirm no movement |
| **Thermal** | Barrel zones (3–5 zones at 380–520°F), mold (chilled or heated to 60–250°F), runner system, ejector area | No "shutoff": thermal isolation is a **cool-down** procedure. Power off heaters, allow the barrel and mold to drop below 100°F, verify with an IR thermometer | IR thermometer reads under 100°F at the barrel, mold halves, and runner; touch with the back of a gloved hand only after IR check |

> **⚠️ WARNING: Residual Hydraulic Pressure**
>
> Residual hydraulic pressure can remain in clamp cylinders for up to 60 seconds after main power shutoff, and longer if the accumulator is charged. **Always verify zero pressure on the gauge before opening the mold area.** A clamp that releases stored pressure unexpectedly can crush a hand in under 200 milliseconds. There is no time for a reaction.

Anderson Plant's standard is **all four sources isolated, every time, with a written verification on the LOTO checklist before any access panel comes off.** No exceptions for "quick" mold changes, no exceptions for "I just need to look at it," no exceptions for senior technicians. The procedure is the same for the new technician on day one and the plant manager on year twenty.`;

const LESSON_1_SLIDES: Slide[] = [
  {
    // Diagram-only opening slide. Pairs with the next slide (the detailed
    // four-bullet locator), so the operator sees the full press schematic
    // first, then drops into the textual breakdown.
    id: sid("l1", 2, 0),
    layoutType: "content",
    title: "Four Energy Sources on Press #12",
    diagram: pressEnergySources,
    body: `Press #12 has four independent energy sources. The next slide walks through where each one lives and how to isolate it.`,
  },
  {
    id: sid("l1", 2, 1),
    layoutType: "content",
    title: "Identifying Energy Sources on Press #12",
    body: `Press #12 is a 350-ton hydraulic injection molding press with the standard four-energy-source profile.

• **Electrical**: Main disconnect lives on the rear of the cabinet (operator's left as you face the press). Heater-band breakers are on the side panel labeled HB-1 through HB-4.
• **Hydraulic**: Main hydraulic shutoff is the red-handled valve at the rear of the press. Accumulator bleed is the smaller valve directly beneath it, tagged "BLEED: VERIFY ZERO."
• **Pneumatic**: FRL block is on the supply drop above the operator's station. Shutoff is the lever valve immediately upstream of the regulator.
• **Thermal**: Barrel zones 1–4 plus the mold. There is no isolation valve for thermal energy, only a cool-down procedure.

Before you do anything else, walk around the press and physically point at each one of these four locations.`,
    // TODO: Replace with real image, diagram of an injection molding press with the 4 energy sources labeled
    imageUrl: "https://placehold.co/600x400?text=Press+12+Energy+Sources",
  },
  {
    id: sid("l1", 2, 2),
    layoutType: "content",
    title: "Step 1: Notify Affected Personnel",
    body: `Before you touch a single switch, you tell people what's about to happen.

**Who you notify:**
• Operators on adjacent presses (Press #10, #11, #13, and #14, plus anyone whose work area overlaps yours)
• Shift supervisor (always)
• Maintenance lead (always: they're the second pair of eyes for this press)
• Anyone in the cell who could be affected by a sudden press shutdown

**How you log the notification:**
1. Open the UpKeep mobile app.
2. Find the press's daily LOTO task.
3. Tap "Begin LOTO". This timestamps you as the authorized employee and notifies your supervisor automatically.
4. Verbally confirm with each affected operator that they know the press is coming down.

A LOTO event without a notified team is the most common citation finding in OSHA injection molding audits. The notification is not optional and the UpKeep timestamp is your proof.`,
    // TODO: Replace with real image, photo of an operator notifying a supervisor on the plant floor
    imageUrl: "https://placehold.co/600x400?text=Notify+Affected+Personnel",
  },
  {
    id: sid("l1", 2, 3),
    layoutType: "content",
    title: "Step 2: Shut Down the Press",
    body: `Order matters. A press shutdown done out of order can damage tooling, leave residual material in the screw, or trip the next start-up. Follow this sequence every time:

1. **Stop cycle at end of part.** Hit the cycle-stop button (NOT the e-stop). The press will complete the current shot, eject the part, and return to the home position. This empties the cavity and avoids leaving short shots in the mold.
2. **Retract the injection unit.** From the operator panel, command the injection unit back to the retract position so the nozzle clears the sprue bushing.
3. **Open the mold to a safe position.** Open the clamp 2–4 inches, enough to inspect, not so far that you've moved the platen unnecessarily.
4. **Main power off.** Move the main disconnect to the OFF position.

If anything goes wrong during this sequence (alarm, unexpected motion, hydraulic noise), STOP and call your shift technician. Do not continue the LOTO procedure on a press that is not behaving normally during shutdown.`,
    // TODO: Replace with real image, close-up of an injection molding press control panel with the main power switch
    imageUrl: "https://placehold.co/600x400?text=Press+Shutdown+Sequence",
  },
  {
    id: sid("l1", 2, 4),
    layoutType: "content",
    title: "Step 3: Isolate All Four Energy Sources",
    body: `Now you isolate each source in this order, and you verify each one as you go. **Do not move on to the next source until the previous one is verified.**

1. **Electrical**: Main disconnect to OFF. Test with a contact voltmeter at the load side: must read 0 V. Then open the heater-band breakers HB-1 through HB-4 and verify 0 V at each.
2. **Hydraulic**: Close the main hydraulic shutoff valve. Wait 60 seconds. Open the accumulator bleed valve to release any stored pressure. The pressure gauge on the manifold must read 0 PSI before you continue.
3. **Pneumatic**: Close the FRL shutoff lever. Bleed the regulator (push the small bleed button under the gauge). Regulator gauge must read 0 PSI.
4. **Thermal**: Heaters are already off (they came off with main power). Allow the barrel and mold to cool. Use an IR thermometer to verify under 100°F at the barrel, mold halves, and runner. Cool-down typically takes 25–40 minutes from full operating temp; do NOT skip this.

Each verification gets a checkbox in the UpKeep LOTO task with a timestamp.`,
    // TODO: Replace with real image, photo of hydraulic shutoff valve in the locked-off position
    imageUrl: "https://placehold.co/600x400?text=Energy+Source+Isolation",
  },
  {
    id: sid("l1", 2, 5),
    layoutType: "content",
    title: "Step 4: Apply Locks & Tags",
    body: `Once all four energy sources are isolated and verified, you apply your LOTO devices.

**Lock placement:**
• One lock on the main electrical disconnect.
• One lock on the main hydraulic shutoff valve handle.
• One lock on the FRL pneumatic shutoff lever.
• Heater-band breakers do not need individual locks. They're protected by the main electrical lock.

**Tag information (every tag must include):**
• Your full name
• Date and time of LOTO application
• Expected return-to-service time
• Reason for LOTO (e.g., "Mold change on Press #12, Job #45612")
• Phone number where you can be reached

**Group lockout:**
If more than one worker will be servicing the press, every worker applies their own lock to a hasp. The press cannot be re-energized until every lock is removed by the worker who applied it. No one removes anyone else's lock. Ever. No exceptions.`,
    // TODO: Replace with real image, photo of a properly applied LOTO lock with tag
    imageUrl: "https://placehold.co/600x400?text=Locks+and+Tags+Applied",
  },
  {
    id: sid("l1", 2, 6),
    layoutType: "content",
    title: "Step 5: Verify Zero Energy State",
    body: `The final check uses the **try-test-try** method. The principle is simple: assume LOTO has failed, and confirm it hasn't.

1. **Try.** Press the cycle-start button on the operator panel. Press should not energize. Press the ejection-cycle button. Ejector should not actuate.
2. **Test.** Walk the gauges:
   • Hydraulic manifold pressure gauge: 0 PSI
   • Pneumatic regulator gauge: 0 PSI
   • Voltmeter at heater-band terminals: 0 V
   • IR thermometer at barrel and mold: under 100°F
3. **Try again.** Press the cycle-start button one more time. Confirm no response.

Only after try-test-try is complete do you sign the final UpKeep LOTO checkbox and begin service work. If any verification fails (pressure non-zero, voltage non-zero, equipment responds to a control input), **stop, do not proceed, and notify your shift technician immediately.** A failed verification means an isolation point is not holding, and you do not work on a press whose isolation is suspect.`,
    // TODO: Replace with real image, photo of pressure gauges reading zero after isolation
    imageUrl: "https://placehold.co/600x400?text=Zero+Energy+Verification",
  },
  {
    // Closing summary slide for Lesson 1's LOTO procedure deck. Renders the
    // five-step lotoSequence diagram so the procedure terminates with a
    // single-glance reference of the full chain (caution → safe-to-work).
    id: sid("l1", 2, 7),
    layoutType: "content",
    title: "LOTO Procedure Summary",
    diagram: lotoSequence,
    body: `Five steps from caution to safe-to-work. Every Anderson press, every shift, every time.`,
  },
];

const LESSON_1_KC: KnowledgeCheckData = {
  question:
    "Before opening the mold area on Press #12 for maintenance, which energy sources must be isolated?",
  type: "multiple-choice",
  options: [
    { text: "Electrical only", isCorrect: false },
    { text: "Electrical and hydraulic", isCorrect: false },
    { text: "Electrical, hydraulic, and pneumatic", isCorrect: false },
    {
      text: "All four: electrical, hydraulic, pneumatic, and thermal",
      isCorrect: true,
    },
  ],
  explanation:
    "All four energy sources must be isolated. The most commonly missed are residual hydraulic pressure in the clamp cylinders and thermal energy from heated barrels and molds. Both can cause severe injury even after main power is off. Always verify zero state on all four before opening any guarding.",
};

const LESSON_1_SECTIONS: KeterLessonSection[] = [
  {
    kind: "text",
    title: "LOTO Fundamentals for Injection Molding Presses",
    markdown: LESSON_1_TEXT_MD,
  },
  {
    kind: "slides",
    title: "LOTO Procedure on Press #12: Visual Walkthrough",
    slides: LESSON_1_SLIDES,
  },
  {
    kind: "knowledge-check",
    title: "Knowledge Check: Energy Sources Before Mold Access",
    check: LESSON_1_KC,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Lesson 2: Machine Operation & Process Parameters (~30 min)
// ──────────────────────────────────────────────────────────────────────────────

const LESSON_2_NARRATION_SLIDES: Slide[] = [
  {
    // Diagram-only opener for the narrated walkthrough. The cycle quadrant
    // diagram lets the operator see all four phases at once before the
    // following slide drops into the numbered breakdown.
    id: sid("l2", 1, 0),
    layoutType: "content",
    title: "The Injection Molding Cycle (Visual)",
    diagram: injectionMoldingCycle,
    body: `Every part on Press #12 runs through the same four-phase loop. The next slides walk through each phase in detail.`,
  },
  {
    id: sid("l2", 1, 1),
    layoutType: "content",
    title: "The Injection Molding Cycle: Overview",
    body: `Every part Press #12 produces goes through the same four-phase cycle:

1. **Clamping**: Mold halves come together and lock
2. **Injection & Hold**: Molten resin fills the cavity and is held under pressure
3. **Cooling & Plasticizing**: Part solidifies; screw prepares the next shot
4. **Ejection & Reset**: Part ejects; clamp opens; cycle repeats

A typical cycle on Press #12 runs 35–55 seconds.`,
    // TODO: Replace with real image, diagram of the 4-phase injection molding cycle
    imageUrl: "https://placehold.co/600x400?text=4-Phase+Cycle+Overview",
  },
  {
    id: sid("l2", 1, 2),
    layoutType: "content",
    title: "Phase 1: Clamping",
    body: `**What happens mechanically:** The clamp unit drives the moving platen toward the stationary platen. The mold halves meet and the toggles or hydraulic ram applies clamp force, typically 250–400 tons on Press #12.

**What you see on the controller:**
• Clamp force setpoint (tons)
• Clamp position (mm from fully closed)
• Clamp close time (seconds)

**Operator authority:** Clamp force is fixed for the job. Don't adjust without your shift technician.`,
    // TODO: Replace with real image, close-up of mold halves clamping together
    imageUrl: "https://placehold.co/600x400?text=Phase+1+Clamping",
  },
  {
    id: sid("l2", 1, 3),
    layoutType: "content",
    title: "Phase 2: Injection & Hold",
    body: `**What happens mechanically:** The screw drives forward, pushing molten resin through the nozzle into the cavity. Once the cavity is full, the press switches to "hold" (a lower pressure that packs out shrinkage as the part begins to cool).

**What you see on the controller:**
• Injection pressure (PSI)
• Injection speed (in/sec)
• Hold pressure (PSI) and hold time (sec)
• Cushion (mm of resin remaining in front of the screw)

**Operator authority:** Injection pressure and hold pressure are operator-adjustable within ±5%. Speed and hold time are technician-only.`,
    // TODO: Replace with real image, cutaway diagram of molten resin being injected into the mold cavity
    imageUrl: "https://placehold.co/600x400?text=Phase+2+Injection",
  },
  {
    id: sid("l2", 1, 4),
    layoutType: "content",
    title: "Phase 3: Cooling & Plasticizing",
    body: `**What happens mechanically:** Two things in parallel.
• The part cools in the cavity (water or oil flows through the cooling channels in each mold half).
• The screw rotates, drawing fresh resin from the hopper, melting it, and building the next shot.

**What you see on the controller:**
• Cooling time (sec), typically 8–25 sec on Press #12
• Screw RPM and back pressure (technician-adjusted)
• Mold temperature zones

**Operator authority:** Cooling time is operator-adjustable within ±5%. Screw RPM and back pressure are not.`,
    // TODO: Replace with real image, diagram showing cooling channels in the mold and screw rotation
    imageUrl: "https://placehold.co/600x400?text=Phase+3+Cooling",
  },
  {
    id: sid("l2", 1, 5),
    layoutType: "content",
    title: "Phase 4: Ejection & Reset",
    body: `**What happens mechanically:** The clamp opens and the ejector pack pushes the part out of the cavity. The robot or chute removes it. The clamp resets to start position and the cycle repeats.

**What you see on the controller:**
• Mold open position (mm)
• Ejector forward and retract positions
• Cycle time total (sec)

**Operator authority:** Watch for sticking parts, ejector pin marks, or short shots. All are signals to log a defect (covered in Lesson 4).`,
    // TODO: Replace with real image, photo of a molded part being ejected from the press
    imageUrl: "https://placehold.co/600x400?text=Phase+4+Ejection",
  },
];

const LESSON_2_NARRATION_SCRIPT = `Before we dive in, take a look at the cycle as a whole. The diagram on this first slide lays out all four phases in order around the loop: clamping at the top, injection and hold on the right, cooling and plasticizing at the bottom, and ejection and reset on the left. The bottom phase, cooling and plasticizing, is the longest by far, typically half to two thirds of the entire cycle time. Keep that picture in mind as we walk through each phase one at a time.

Welcome to the heart of injection molding, the four-phase cycle. Every part that comes off Press #12 goes through this exact sequence, and your job as an operator is to know what's happening at each phase so you can spot when something is drifting before it becomes a defect.

Let's start with phase one: clamping. The mold has two halves: a stationary half mounted to the fixed platen and a moving half mounted to the moving platen. When the cycle starts, the clamp unit drives those halves together and applies clamp force. On Press #12, that force is somewhere between 250 and 400 tons depending on the job. You'll see the clamp force setpoint on your controller, and you'll see clamp position counting down as the platens come together. Clamp force is a job-specific setting. Don't touch it. If you see clamp force drifting from setpoint, that's a maintenance flag, not an adjustment.

Phase two is where the part actually gets formed: injection and hold. The screw, which has been sitting at the back of the barrel with a shot of molten resin in front of it, now drives forward. Resin flows through the nozzle, into the sprue, into the runners, and into the cavity. Watch your injection pressure and your injection speed on the controller. Injection pressure is one of the parameters you have authority over: you can adjust it within plus or minus five percent of setpoint without calling a technician. Injection speed, though, is technician-only. Once the cavity is full, the press switches to hold. Hold packs out the shrinkage as the part starts to solidify. Hold pressure and hold time appear next to injection on the controller. Hold pressure is operator-adjustable within plus or minus five percent; hold time is not.

Phase three is the longest phase by clock time: cooling. Water, or sometimes oil, flows through cooling channels in both mold halves, pulling heat out of the part. While cooling is happening, the screw is also rotating and pulling fresh resin from the hopper, melting it, and building the next shot. So the press is doing two jobs at once: cooling the current part and preparing the next one. Cooling time on Press #12 typically runs eight to twenty-five seconds. You can adjust cooling time within plus or minus five percent. Screw RPM and back pressure, which control how the next shot is built, are technician-only.

Phase four is the shortest: ejection and reset. The clamp opens. The ejector pack pushes the part out of the cavity. Either a robot or a chute moves it to the next station. The clamp resets and the next cycle begins. This is where you watch for trouble: sticking parts, ejector pin marks, parts that didn't fully eject. All of those are defect signals you'll log per Lesson 4.

Now that you understand the cycle, the next section gives you the process parameter reference table you'll use every day on the floor.`;

const LESSON_2_NARRATION: NarrationData = {
  script: LESSON_2_NARRATION_SCRIPT,
  // ~540 words (+60 for the new opening visual slide) at ~150 wpm narration
  // ≈ 216 seconds; round up to 7 minutes for a comfortable conversational
  // pace with brief pauses on slide changes (6 slides total now).
  audioDurationSeconds: 420,
  slides: LESSON_2_NARRATION_SLIDES,
};

const LESSON_2_TEXT_MD = `# Process Parameter Reference: Operator Adjustment Authority

Not every parameter on the Press #12 controller is yours to adjust. The Anderson Plant authority model is built on a simple idea: the closer a parameter is to material chemistry or machine calibration, the higher up the chain it has to be touched. Operators have authority over parameters that drift with normal production wear; technicians and process engineers own parameters that affect part quality at the molecular level.

The reference below tells you exactly what's yours and what isn't. Print this and tape it to the operator station if you want. Every Press #12 operator should know this table cold.

| Parameter | Typical Range | What It Affects | Adjustment Authority |
|---|---|---|---|
| **Barrel Temperature** | 380–520°F | Resin viscosity, fill quality | Operator (within ±5% of setpoint), Technician (full range) |
| **Injection Pressure** | 800–2,200 PSI | Fill speed, part density | Operator (within ±5%), Technician (full range) |
| **Injection Speed** | 0.5–6.0 in/sec | Fill pattern, surface finish | **Technician only** |
| **Hold Pressure** | 400–1,200 PSI | Pack-out, sink resistance | Operator (within ±5%), Technician (full range) |
| **Hold Time** | 2–8 sec | Gate seal, weight consistency | **Technician only** |
| **Cooling Time** | 8–25 sec | Cycle time, dimensional stability | Operator (within ±5%), Technician (full range) |
| **Screw RPM** | 60–180 RPM | Plasticizing rate, melt quality | **Technician only** |
| **Back Pressure** | 50–300 PSI | Melt homogeneity, color mix | **Process Engineer only** |

> **📋 ANDERSON PLANT STANDARD**
>
> If a parameter you can adjust is drifting outside its typical range during a run, **log it in UpKeep and notify your shift technician before making the change.** Tracking parameter drift is how Anderson catches mold or machine wear early. A barrel temperature creeping from 480°F to 510°F over a two-hour run is a tooling or heater-band signal, not a setpoint problem, and adjusting setpoint to compensate hides the underlying issue.`;

const LESSON_2_KC: KnowledgeCheckData = {
  question:
    "You notice cycle time has crept up by 8 seconds over the last 4 hours on Press #12. Parts are still passing inspection. What's the right next step?",
  type: "scenario",
  options: [
    {
      text: "Adjust cooling time down by 8 seconds yourself to recover the lost time",
      isCorrect: false,
    },
    {
      text: "Create a work order and continue running until end of shift",
      isCorrect: false,
    },
    {
      text: "Stop the press immediately and call maintenance",
      isCorrect: false,
    },
    {
      text: "Notify your shift technician, document the drift in UpKeep, and continue running while they assess",
      isCorrect: true,
    },
  ],
  explanation:
    "An 8-second cycle time drift is a meaningful signal, usually mold cooling, hydraulic performance, or controller calibration. Cooling time is within your ±5% authority, but adjusting it without diagnosing the root cause hides the underlying issue. The right move is to notify your technician, document what you observed, and let them assess while production continues. Tracked drift becomes the maintenance signal that prevents an unplanned shutdown.",
};

const LESSON_2_SECTIONS: KeterLessonSection[] = [
  {
    kind: "narrated-walkthrough",
    title: "The Injection Molding Cycle: From Clamp Close to Ejection",
    narration: LESSON_2_NARRATION,
  },
  {
    kind: "text",
    title: "Process Parameter Reference: Operator Adjustment Authority",
    markdown: LESSON_2_TEXT_MD,
  },
  {
    kind: "knowledge-check",
    title: "Knowledge Check: Cycle Time Drift Scenario",
    check: LESSON_2_KC,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Lesson 3: Daily Preventive Maintenance Tasks (~25 min)
// ──────────────────────────────────────────────────────────────────────────────

const LESSON_3_TEXT_MD = `# The Operator's Role in Press Reliability

Anderson plant runs 792 active assets, and the daily PM check you perform at the start of your shift is the first line of defense against unplanned downtime. Operator-led preventive maintenance, sometimes called autonomous maintenance, catches small issues (leaks, vibration, wear) before they become work orders, before they become breakdowns, and before they become safety incidents. The maintenance team is good. They cannot, however, be in front of every press at every shift change. You can.

Every completed check you log in UpKeep contributes to something bigger than your shift. PM data drives reliability analysis: which presses are trending toward failure, which components are wearing out faster than spec, which mold/press combinations have hidden compatibility issues. PM data is also what the auditors look at: OSHA inspectors and ISO 9001 auditors both ask "show me the evidence the daily check happened." A well-logged PM history is the difference between a clean audit and a six-figure remediation plan.

The seven-point walkaround below is your responsibility every shift, every day, on every press you operate. Five minutes of attention here saves the maintenance team hours of reactive firefighting later, and saves you the frustration of a press that goes down in the middle of your run.

| Check | Frequency | What to Look For | Action if Found |
|---|---|---|---|
| **Hydraulic Oil Level** | Start of shift | Sight glass between MIN and MAX | Below MIN: log and create work order; do not run |
| **Hydraulic Leaks at Hose Connections** | Start of shift | Drips, damp spots on floor or hoses | Any leak: log, photograph if possible, create work order, monitor |
| **Mold Clamp Alignment** | Start of shift | Visual square alignment, no parting line offset | Misalignment: stop, notify technician |
| **Ejector Pin Function** | First cycle of shift | Smooth retraction, no sticking | Sticking pins: complete current cycle, then stop and create work order |
| **Barrel Heater Band Condition** | Start of shift | No visible damage, no exposed wiring | Damage: stop immediately, create urgent work order |
| **Water Line Connections** | Start of shift | No drips, secure fittings | Any leak: log, create work order |
| **Safety Gate Sensors** | Start of shift | Press will not cycle with gate open | Sensor failure: do not run; create urgent work order |

> **📋 ANDERSON PLANT STANDARD: Log Every Check, Every Shift**
>
> Daily PM checks must be logged in UpKeep **even when nothing abnormal is found.** The completion record itself is what proves the check happened, and it is what makes Anderson's reliability data trustworthy. A "nothing wrong" log is just as valuable as a logged anomaly, and far more common. If you skip the log because nothing was wrong, you've broken the chain of evidence. That chain is what protects the plant during an audit and protects you during an incident review.`;

const LESSON_3_SLIDES: Slide[] = [
  {
    id: sid("l3", 2, 1),
    layoutType: "content",
    title: "Daily PM at Shift Start: The 7-Point Walkaround",
    body: `Memorize this sequence. Walk it in this order, every shift, every press:

1. **Hydraulic oil level**: sight glass at the rear of the press
2. **Hydraulic hoses**: visual scan from manifold to clamp and injection unit
3. **Mold clamp alignment**: check parting line is square and even
4. **Ejector pins**: first cycle should retract smoothly
5. **Barrel heater bands**: visual scan, no exposed wiring or damage
6. **Water line connections**: quick-disconnect couplers seated, no drips
7. **Safety gate sensors**: open the gate, confirm press will not cycle

Five minutes from start to finish, every shift, no shortcuts.`,
    // TODO: Replace with real image, operator walking around an injection molding press with a checklist
    imageUrl: "https://placehold.co/600x400?text=7-Point+Walkaround",
  },
  {
    id: sid("l3", 2, 2),
    layoutType: "content",
    title: "Visual Inspection: What Good Looks Like",
    body: `A healthy press tells you it's healthy. Look for:

• **Clean machine surfaces**: no resin pellets, no spilled oil, no swarf
• **Dry floor under the press**: no puddles, no damp spots
• **Secure connections**: hose fittings tight, electrical conduit fastened, water couplers seated
• **Smooth, predictable operation**: consistent cycle time, even motion, no hesitation
• **Quiet operation**: no unusual whines, knocks, or hissing sounds

If everything checks out, log the PM as complete and start your run. The "nothing wrong" log is what proves the check happened.`,
    // TODO: Replace with real image, clean, well-maintained injection molding press in good condition
    imageUrl: "https://placehold.co/600x400?text=Healthy+Press+Indicators",
  },
  {
    id: sid("l3", 2, 3),
    layoutType: "content",
    title: "Visual Inspection: Red Flags",
    body: `These are the warning signs that mean "stop and document":

• **Oil drips**: anywhere along hydraulic lines, at fittings, on the floor
• **Frayed wiring**: especially at heater-band terminals and the control cabinet
• **Misaligned guards**: gates that don't seat properly, missing screws on panels
• **Unusual sounds**: whines from the hydraulic pump, knocks during clamp close, hissing from pneumatic lines
• **Resin contamination**: pellets in unexpected places, color where there shouldn't be color
• **Vibration**: felt at the operator station that wasn't there yesterday

Any one of these gets logged. Multiple = stop and call your technician.`,
    // TODO: Replace with real image, close-up of a hydraulic hose with visible wear or leak
    imageUrl: "https://placehold.co/600x400?text=Red+Flags+to+Watch+For",
  },
  {
    id: sid("l3", 2, 4),
    layoutType: "content",
    title: "Logging PM Completion in UpKeep",
    body: `The flow is the same every shift:

1. Open the **UpKeep** mobile app on your operator tablet.
2. Tap the press's **Daily PM** task, it auto-populates at shift start.
3. Walk the 7-point sequence and tap each check as you complete it.
4. If anything is abnormal: tap the anomaly icon, add a short note, attach a photo if possible.
5. Tap **Submit** at the end. The timestamp is your proof of completion.

If you find an issue serious enough to escalate, the same screen has a **Create Work Order** button that pre-fills the press, the timestamp, and your photo. One tap from "I see a problem" to "the maintenance team has a ticket."`,
    // TODO: Replace with real image, screenshot of the UpKeep mobile interface showing a daily PM task being logged
    imageUrl: "https://placehold.co/600x400?text=UpKeep+PM+Logging",
  },
  {
    id: sid("l3", 2, 5),
    layoutType: "content",
    title: "When to Escalate vs Continue Running",
    body: `Use this decision tree:

**Safety issue** (gate sensor failure, exposed heater wiring, missing guard) → **STOP IMMEDIATELY.** Do not run. Create urgent work order. Notify supervisor in person.

**Performance drift** (small leak, slight cycle time creep, occasional sticking pin) → **LOG AND MONITOR.** Create work order. Continue run. Reassess at next shift change.

**Cosmetic / minor** (small scratch on a guard, dust on the controller, minor housekeeping) → **LOG ONLY.** No work order needed. Add to the next housekeeping pass.

When in doubt, escalate. A 30-second call to your shift technician is always cheaper than a 4-hour breakdown.`,
    // TODO: Replace with real image, flowchart-style diagram showing escalation decisions
    imageUrl: "https://placehold.co/600x400?text=Escalation+Decision+Tree",
  },
];

const LESSON_3_KC1: KnowledgeCheckData = {
  question:
    "You spot a small hydraulic oil drip at the clamp cylinder hose during your start-of-shift walkaround. The press is running normally and parts are passing inspection. What's the right action?",
  type: "multiple-choice",
  options: [
    {
      text: "Ignore it. Small drips are normal on older presses",
      isCorrect: false,
    },
    { text: "Stop the press immediately and call maintenance", isCorrect: false },
    { text: "Tighten the connection yourself with a wrench", isCorrect: false },
    {
      text: "Log it in UpKeep, create a work order, photograph if possible, and continue monitoring during your shift",
      isCorrect: true,
    },
  ],
  explanation:
    "A small drip is not an emergency, but it is a documented signal. Logging and creating a work order ensures the maintenance team can plan a proper inspection and repair on their schedule rather than yours. Tightening a hydraulic connection yourself is a technician-only task. Improper torque can cause a much larger failure. Continuing to monitor through the shift keeps production running while ensuring the issue gets formal attention.",
};

const LESSON_3_KC2: KnowledgeCheckData = {
  question:
    "Operator-completed daily PM checks should be logged in UpKeep even when nothing abnormal is found.",
  type: "true-false",
  options: [
    { text: "True", isCorrect: true },
    { text: "False", isCorrect: false },
  ],
  explanation:
    "True. The completion record itself is the proof of coverage. PM completion data drives reliability analysis, supports OSHA and ISO audits, and gives the maintenance team confidence that operator checks are actually happening. A 'nothing wrong' log is just as valuable as a logged anomaly, and far more common.",
};

const LESSON_3_SECTIONS: KeterLessonSection[] = [
  {
    kind: "text",
    title: "The Operator's Role in Press Reliability",
    markdown: LESSON_3_TEXT_MD,
  },
  {
    kind: "slides",
    title: "Daily PM in Practice",
    slides: LESSON_3_SLIDES,
  },
  {
    kind: "knowledge-check",
    title: "Knowledge Check: Hydraulic Oil Drip",
    check: LESSON_3_KC1,
  },
  {
    kind: "knowledge-check",
    title: "Knowledge Check: Logging Completion",
    check: LESSON_3_KC2,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Lesson 4: Defect Troubleshooting (~30 min)
// ──────────────────────────────────────────────────────────────────────────────

const LESSON_4_NARRATION_SLIDES: Slide[] = [
  {
    // Diagram-only opener for the narrated walkthrough. The defect-workflow
    // diagram lays out the full identify → classify → check → adjust/escalate
    // chain so the operator sees the decision tree before the next slide
    // breaks each step out into a numbered list.
    id: sid("l4", 1, 0),
    layoutType: "content",
    title: "Defect Identification Workflow (Visual)",
    diagram: defectWorkflow,
    body: `Every defect on Press #12 follows the same four-step workflow. The next slides walk through how to apply this to short shots, flash, and sink marks.`,
  },
  {
    id: sid("l4", 1, 1),
    layoutType: "content",
    title: "Defect Identification Workflow",
    body: `Every defect on Press #12 goes through the same 4-step workflow:

1. **IDENTIFY**: Spot the defect visually on the part as it ejects.
2. **CLASSIFY**: Match the visual indicator to a defect type (short shot, flash, sink, etc.).
3. **CHECK PARAMETERS**: Pull up the controller and see what's drifted from setpoint.
4. **ESCALATE OR ADJUST**: Within your ±5% authority, adjust. Outside it, escalate to your technician.

Your job at the press is steps 1, 2, and 3. Step 4, the actual decision, is where Lesson 2's authority model determines what you do next.`,
    // TODO: Replace with real image, workflow diagram showing the 4 steps
    imageUrl: "https://placehold.co/600x400?text=Defect+Workflow",
  },
  {
    id: sid("l4", 1, 2),
    layoutType: "content",
    title: "Short Shots: Causes & Fixes",
    body: `**Visual indicator:** Incomplete fill. Missing features (tabs, ribs, thin walls). Surface looks frosted or matte where it should be glossy.

**Top causes:**
• Insufficient injection pressure (Lesson 2 table, operator-adjustable ±5%)
• Low barrel temperature (operator-adjustable ±5%)
• Vented mold issue (technician)
• Material moisture / contamination (technician)

**Operator action:** Within authority, raise injection pressure 3–5%. If short shot persists after one full cycle, escalate.`,
    // TODO: Replace with real image, photo of a molded part with a short shot defect
    imageUrl: "https://placehold.co/600x400?text=Short+Shot+Defect",
  },
  {
    id: sid("l4", 1, 3),
    layoutType: "content",
    title: "Flash: Causes & Fixes",
    body: `**Visual indicator:** Excess plastic at the parting line. Thin webs at vents. Sometimes a "flag" of resin where the mold halves should seal.

**Top causes:**
• Clamp force too low (technician)
• Mold venting issue / clogged vents (technician)
• Injection pressure too high (operator-adjustable)
• Barrel temperature too high (operator-adjustable)

**Operator action:** Verify clamp force is at setpoint. If injection pressure is high, lower 3–5% within authority. Flash that persists after one cycle = technician escalation.`,
    // TODO: Replace with real image, photo of a molded part with flash along the parting line
    imageUrl: "https://placehold.co/600x400?text=Flash+Defect",
  },
  {
    id: sid("l4", 1, 4),
    layoutType: "content",
    title: "Sink Marks: Causes & Fixes",
    body: `**Visual indicator:** Depressions on thick wall sections, often at boss locations or behind heavy ribs. Surface looks "sunken" but the part is otherwise complete.

**Top causes:**
• Insufficient hold pressure (operator-adjustable ±5%)
• Hold time too short (technician-only)
• Cooling time too short (operator-adjustable ±5%)
• Wall section design issue (process engineer)

**Operator action:** Within authority, raise hold pressure 3–5% AND extend cooling time 2–3 sec. Test for 3 cycles. Sink that persists = technician escalation.`,
    // TODO: Replace with real image, photo of a molded part with sink marks on a thick wall section
    imageUrl: "https://placehold.co/600x400?text=Sink+Marks+Defect",
  },
];

const LESSON_4_NARRATION_SCRIPT = `Before we get into specific defect types, look at the workflow diagram on this first slide. Every defect, no matter what it is, runs through the same four steps. Identify the defect by spotting it on the part. Classify what type of defect it is. Check the relevant process parameters against their setpoints. Then either adjust within your authority or escalate. Hold onto that picture. We'll apply it to three specific defects in the slides that follow.

Defects are signals. Every defective part coming off Press #12 is the press telling you something has shifted, and your job is to read the signal, classify it, and decide whether you can correct it within your authority or whether to escalate. Lesson 4 walks you through the top three defect categories from Anderson's Q1 work-order data: short shots, flash, and sink marks.

Short shots are the easiest to spot. The part comes off the press incomplete: a missing tab, a missing rib, a thin wall that didn't fill. Sometimes the surface looks matte or frosted in the area that didn't fill. The cause is almost always one of two things: not enough material made it into the cavity, or the material that did make it cooled too fast to fill out. From the Lesson 2 process parameter reference, you have authority to adjust injection pressure within plus or minus five percent and barrel temperature within plus or minus five percent. So your first move on a short shot is to raise injection pressure three to five percent and watch the next cycle. If the short shot persists, you escalate. There's likely a venting issue or material problem that's outside your authority.

Flash is the opposite problem. Instead of incomplete fill, you've got too much material, and it's being squeezed out at the parting line where the mold halves meet. You'll see a thin film of plastic, sometimes a flag-like extrusion, along the seam between the two mold halves. Flash means the clamp isn't holding the mold closed firmly enough against the injection pressure, or the venting is plugged so trapped gas is preventing the parting line from seating. Clamp force is technician-only. You can't adjust it. But injection pressure is yours within plus or minus five percent. If you see flash and your injection pressure is at the high end of typical range from the Lesson 2 process parameter table, lower it three to five percent and watch the next cycle. If flash persists, that's a clamp force or venting issue. Escalate.

Sink marks are the third top defect. They show up as depressions on thick wall sections, usually at boss locations or behind heavy ribs. Sink means the part shrunk away from the mold surface during cooling because there wasn't enough hold pressure or cooling time to lock the geometry in. Hold pressure is operator-adjustable within plus or minus five percent; cooling time is operator-adjustable within plus or minus five percent; hold time is technician-only. So your move on sink is to raise hold pressure three to five percent AND extend cooling time two to three seconds. Test for three cycles. If sink persists, you've hit the limit of operator adjustment. Escalate.

The text section that follows gives you the full troubleshooting reference table for these and three more defect categories.`;

const LESSON_4_NARRATION: NarrationData = {
  script: LESSON_4_NARRATION_SCRIPT,
  // ~450 words (+50 for the new opening visual slide) at ~150 wpm ≈ 180
  // seconds; round to 6 minutes for breathing room (5 slides total now).
  audioDurationSeconds: 360,
  slides: LESSON_4_NARRATION_SLIDES,
};

const LESSON_4_TEXT_MD = `# Defect Troubleshooting Reference Table

The table below is your live troubleshooting reference during a run. The columns walk you from "I see a defect" through "did my adjustment work". Keep this open on the operator tablet whenever Press #12 is producing parts. Defect types beyond the top three covered in the narrated walkthrough are included for completeness; warping, burn marks, and weld lines all show up periodically in Anderson's defect data.

| Defect | Visual Indicator | Likely Cause | First Adjustment | When to Escalate |
|---|---|---|---|---|
| **Short Shot** | Incomplete fill, missing features | Low injection pressure or barrel temp | Increase injection pressure within ±5% | Drift persists after adjustment |
| **Flash** | Excess plastic at parting line | Clamp force low or mold venting issue | Verify clamp force setpoint | Visible flash within 5 cycles of adjustment |
| **Sink Marks** | Depressions on thick walls | Hold pressure or hold time insufficient | Increase hold pressure within ±5% | Sink persists or appears on multiple parts |
| **Warping** | Part deformation after ejection | Uneven cooling or ejection timing | Verify cooling time within range | Consistent warping pattern |
| **Burn Marks** | Black streaks or scorching | Trapped gas, vent blockage | Stop and notify technician | **Always, vent issues are technician-resolved** |
| **Weld Lines** | Visible seam where flow fronts met | Low melt temp, slow injection | Notify technician for parameter review | Weld lines are quality-team concern |

> **📋 ANDERSON PLANT STANDARD: When in Doubt, Escalate**
>
> A 5-minute conversation with your technician is always faster than a 2-hour debug after the run. Document and escalate. Your "I'm not sure" is exactly the moment the technician wants to hear from you, not after a quality hold has shipped 800 questionable parts down the line.`;

const LESSON_4_KC: KnowledgeCheckData = {
  question:
    "Parts coming off Press #12 are showing flash along the parting line. Cycle time and barrel temperature are normal. Injection pressure is at the high end of typical range. What's the most likely root cause?",
  type: "scenario",
  options: [
    { text: "Cooling time too short", isCorrect: false },
    { text: "Mold worn at the parting line", isCorrect: false },
    { text: "Clamp force too low or mold venting issue", isCorrect: true },
    { text: "Resin contamination", isCorrect: false },
  ],
  explanation:
    "Flash at the parting line with normal cycle time and temperature points to clamp force or venting. The mold is being pushed open by injection pressure faster than the clamp can hold it closed, OR trapped gas is preventing the parting line from seating fully. Both are technician-resolved, clamp force adjustment requires verification, and venting issues require mold inspection. Document the defect, note that injection pressure is at the high end, and notify your technician.",
};

const LESSON_4_SECTIONS: KeterLessonSection[] = [
  {
    kind: "narrated-walkthrough",
    title: "Identifying and Resolving the Top 3 Defect Categories",
    narration: LESSON_4_NARRATION,
  },
  {
    kind: "text",
    title: "Defect Troubleshooting Reference Table",
    markdown: LESSON_4_TEXT_MD,
  },
  {
    kind: "knowledge-check",
    title: "Knowledge Check: Flash Diagnosis Scenario",
    check: LESSON_4_KC,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Lesson 5: Work Order Documentation Standards (~15 min)
// ──────────────────────────────────────────────────────────────────────────────

const LESSON_5_TEXT_MD = `# Why Work Order Documentation Quality Matters

> **📋 ANDERSON PLANT: 22,740 work orders on record**
>
> The value of that data depends entirely on how well it was captured. Every work order you write is part of the searchable knowledge base the next person will rely on when they face the same problem.

The cost of bad documentation is not theoretical. Every "fixed it" or "pump issue" in the work-order history forces the next technician, sometimes the next *shift*, to re-troubleshoot from zero. Multiply that across 22,740 work orders and you're looking at thousands of wasted hours, repeated failures, and lost institutional knowledge. The maintenance team that worked on Press #12 in 2019 isn't always the one working on it in 2026. The work order is the only thing connecting them.

A good work order rests on four pillars:

1. **Failure coding (cause / symptom / remedy)**: A short, structured classification that makes the work order searchable. "Hydraulic / pressure drop / valve replacement" is a queryable pattern; "fixed pump" is not.
2. **Labor capture**: How long the job actually took, including diagnosis time. This drives staffing models and cost-of-downtime analysis.
3. **Parts capture**: Specific part numbers used. This drives spare-parts inventory, vendor analysis, and the question "are we burning through this part faster than expected?"
4. **Useful technician notes**: Specific, searchable, and actionable for the next person. This is the pillar that turns a transactional fix into institutional knowledge.

What does "useful" actually look like? The comparison below is the difference between a note that helps the next person and a note that costs them an hour.

| Bad Note | Good Note |
|---|---|
| Fixed it | Replaced hydraulic hose at clamp cylinder. Hose showed external wear at bend point near guard bracket, recommend checking other presses with similar routing. Job took 45 min, used part #HYD-4421. |
| Pump issue | Hydraulic pump pressure dropping intermittently under load. Replaced pressure relief valve (part #HYD-2208). Pressure stable at 1,800 PSI for 4 hours post-repair. Recommend monitoring next 2 shifts. |
| Done | Cleared blockage in cooling line at zone 3. Found buildup of mineral deposits, likely water quality issue. Suggest scheduling water line flush across all presses on this circuit. |

> **📋 ANDERSON PLANT STANDARD: Notes Are How Anderson Learns**
>
> A 30-second investment in a good note saves hours of re-troubleshooting later. Your notes are how Anderson learns. The next technician (including future-you, six months from now, looking at this same press) depends on what you write today.

<figure class="callout-figure">
${workOrderQualityChart}
<figcaption>Source: Anderson plant historical work orders</figcaption>
</figure>`;

const LESSON_5_KC: KnowledgeCheckData = {
  question:
    "Which of these technician notes is most useful for future troubleshooting on Press #12?",
  type: "multiple-choice",
  options: [
    { text: "Fixed press 12", isCorrect: false },
    { text: "Hydraulic issue resolved", isCorrect: false },
    {
      text: "Replaced clamp cylinder seal kit (part #HYD-3301). Original failure caused by debris ingress at the rod wiper, recommend inspecting wiper condition during next 3 PMs on this press. Job took 90 min.",
      isCorrect: true,
    },
    { text: "See attached photo", isCorrect: false },
  ],
  explanation:
    "The detailed note tells the next person what was wrong, what was done, what parts were used, what the root cause was, and what to watch for going forward. The other options force the next technician to rediscover everything from scratch. Detailed notes turn one fix into institutional knowledge.",
};

const LESSON_5_SECTIONS: KeterLessonSection[] = [
  {
    kind: "text",
    title: "Why Work Order Documentation Quality Matters",
    markdown: LESSON_5_TEXT_MD,
  },
  {
    kind: "knowledge-check",
    title: "Knowledge Check: Most Useful Technician Note",
    check: LESSON_5_KC,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Final Assessment: 10 questions, 80% threshold, 2 per lesson
// (GeneratedQuiz is structurally MC with options: string[]; T/F questions are
// encoded as 2-option MCs and scenario questions as MCs with scenario wording.)
// ──────────────────────────────────────────────────────────────────────────────

const FINAL_ASSESSMENT_QUESTIONS: GeneratedQuiz[] = [
  {
    question:
      "L1 · Before opening the mold area on an Anderson injection molding press, which combination of energy sources must be isolated and verified at zero state?",
    options: [
      "Electrical only",
      "Electrical and hydraulic",
      "Electrical, hydraulic, and pneumatic",
      "All four: electrical, hydraulic, pneumatic, and thermal",
    ],
    correctIndex: 3,
    explanation:
      "Lesson 1: LOTO Fundamentals. All four energy sources must be isolated. Anderson's Q1 incident review found 78% of near-misses involved residual energy after main power shutoff (typically hydraulic accumulator pressure or thermal mass on barrel/mold), not main power itself.",
  },
  {
    question:
      "L1 · True or False: Residual hydraulic pressure can remain in clamp cylinders for up to 60 seconds after main power shutoff, so verifying the pressure gauge reads 0 PSI is required before opening the mold area.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "True. From Lesson 1's LOTO Fundamentals section: residual hydraulic pressure can remain for up to 60 seconds after main power shutoff (longer if the accumulator is charged). The press's pressure gauge must read 0 PSI before any mold-area access.",
  },
  {
    question:
      "L2 · Which of the following process parameters is operator-adjustable within ±5% of setpoint on Press #12 without escalating to a technician?",
    options: [
      "Injection speed",
      "Hold time",
      "Cooling time",
      "Screw RPM",
    ],
    correctIndex: 2,
    explanation:
      "Lesson 2: Process Parameter Reference. Cooling time, barrel temperature, injection pressure, and hold pressure are all operator-adjustable within ±5%. Injection speed, hold time, and screw RPM are technician-only; back pressure is process-engineer-only.",
  },
  {
    question:
      "L2 · You notice cycle time has crept up by 8 seconds over the last 4 hours on Press #12, but parts are still passing inspection. What is the right next step?",
    options: [
      "Adjust cooling time down by 8 seconds yourself to recover the lost time",
      "Stop the press immediately and call maintenance",
      "Notify your shift technician, document the drift in UpKeep, and continue running while they assess",
      "Wait until end of shift, then create a work order",
    ],
    correctIndex: 2,
    explanation:
      "Lesson 2: Process Parameter Reference. An 8-second cycle drift is a meaningful signal (mold cooling, hydraulic performance, controller calibration). Cooling time is within your ±5% authority, but adjusting it without root-causing hides the problem. Notify, document, and let the technician assess while production continues.",
  },
  {
    question:
      "L3 · You spot a small hydraulic oil drip at the clamp cylinder hose during your start-of-shift walkaround. The press is running normally and parts are passing. What is the right action?",
    options: [
      "Ignore it. Small drips are normal on older presses",
      "Stop the press immediately and call maintenance",
      "Tighten the connection yourself with a wrench",
      "Log it in UpKeep, create a work order, photograph if possible, and continue monitoring during your shift",
    ],
    correctIndex: 3,
    explanation:
      "Lesson 3: Daily PM Tasks. A small drip is not an emergency but it is a documented signal. Logging and creating a work order ensures the maintenance team can plan the repair. Tightening a hydraulic connection yourself is a technician-only task. Improper torque can cause a much larger failure.",
  },
  {
    question:
      "L3 · True or False: Operator-completed daily PM checks should be logged in UpKeep even when nothing abnormal is found.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "True. Lesson 3: Daily PM Tasks. The completion record itself is the proof of coverage. PM completion data drives reliability analysis and supports OSHA / ISO audits. A 'nothing wrong' log is just as valuable as a logged anomaly.",
  },
  {
    question:
      "L4 · Parts coming off Press #12 are showing flash along the parting line. Cycle time and barrel temperature are normal. Injection pressure is at the high end of typical range. What is the most likely root cause?",
    options: [
      "Cooling time too short",
      "Mold worn at the parting line",
      "Clamp force too low or mold venting issue",
      "Resin contamination",
    ],
    correctIndex: 2,
    explanation:
      "Lesson 4: Defect Troubleshooting. Flash at the parting line with normal cycle time and temperature points to clamp force or venting. The mold is being pushed open faster than the clamp can hold it closed, or trapped gas is preventing the parting line from seating. Both are technician-resolved.",
  },
  {
    question:
      "L4 · Sink marks appear midway through a run on Press #12. Hold pressure and cooling time are at setpoint. As the operator, what is your first action within your ±5% adjustment authority?",
    options: [
      "Stop the press and call your technician immediately. This is outside operator authority",
      "Raise hold pressure 3–5% AND extend cooling time 2–3 sec, then watch 3 cycles before deciding to escalate",
      "Lower injection pressure 3–5% to reduce material flow into the cavity",
      "Lower barrel temperature 5% to reduce shrinkage",
    ],
    correctIndex: 1,
    explanation:
      "Lesson 4: Defect Troubleshooting. Sink means insufficient hold pressure or cooling time. Both are within operator ±5% authority. The right move is to raise hold pressure 3–5% and extend cooling time 2–3 sec, then watch 3 cycles. If sink persists, escalate. You've hit the limit of operator adjustment.",
  },
  {
    question:
      "L5 · Which of the following technician notes is most useful for future troubleshooting on Press #12?",
    options: [
      "Fixed press 12",
      "Hydraulic issue resolved",
      "Replaced clamp cylinder seal kit (part #HYD-3301). Original failure caused by debris ingress at the rod wiper, recommend inspecting wiper condition during next 3 PMs on this press. Job took 90 min.",
      "See attached photo",
    ],
    correctIndex: 2,
    explanation:
      "Lesson 5: Work Order Documentation. The detailed note captures what was wrong, what was done, what parts were used, the root cause, and what to watch going forward. The other three options force the next technician to rediscover everything from scratch.",
  },
  {
    question:
      "L5 · True or False: A work-order note that simply reads 'fixed it' is sufficient as long as the part number used is captured in the parts field.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "False. Lesson 5: Work Order Documentation. Parts capture is one of four pillars (failure coding, labor, parts, useful notes). It does not replace the others. Without a useful note, the next technician knows what part was used but not what symptom drove the replacement, what root cause was identified, or what to watch for. All four pillars are required for a good work order.",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Anderson outline: 5 lessons + 1 final-assessment lesson, with sections
// populated. Section content is what the wizard's additive sections-iteration
// block reads to materialize Resources in the editor.
// ──────────────────────────────────────────────────────────────────────────────

const ANDERSON_OUTLINE: KeterGeneratedLesson[] = [
  {
    title: "Lockout/Tagout for Injection Molding",
    description:
      "Apply Anderson Plant lockout/tagout procedures to an injection molding press before any service or mold change.",
    contentType: "text",
    content: "",
    duration: 20,
    sections: LESSON_1_SECTIONS,
  },
  {
    title: "Machine Operation & Process Parameters",
    description:
      "Start up, run, and shut down an injection molding press using Anderson Plant standard process parameters.",
    contentType: "text",
    content: "",
    duration: 30,
    sections: LESSON_2_SECTIONS,
  },
  {
    title: "Daily Preventive Maintenance Tasks",
    description:
      "Execute the daily preventive-maintenance checklist for an injection molding press at the Anderson Plant.",
    contentType: "text",
    content: "",
    duration: 25,
    sections: LESSON_3_SECTIONS,
  },
  {
    title: "Defect Troubleshooting",
    description:
      "Diagnose and respond to the top defects observed at the Anderson Plant in Q1 2026: short shots, flash, and sink marks.",
    contentType: "text",
    content: "",
    duration: 30,
    sections: LESSON_4_SECTIONS,
  },
  {
    title: "Work Order Documentation Standards",
    description:
      "Document repairs, downtime, and parts pulls in the Anderson Plant work-order system.",
    contentType: "text",
    content: "",
    duration: 15,
    sections: LESSON_5_SECTIONS,
  },
];

// Course-level final assessment. NOT a 6th lesson. Surfaced as a separate
// top-level field on the agent response (`AgentResponse.finalQuiz`) so the
// wizard creates a course quiz on the Quiz tab without producing an empty
// Lesson 6 in the lesson list. Covers all five lessons proportionally
// (roughly two questions per lesson, 80% pass threshold).
const ANDERSON_FINAL_QUIZ: KeterFinalQuiz = {
  title:
    "Final Assessment: Anderson Plant Injection Molding Technician Certification",
  description:
    "Course-level assessment. Minimum 80% required to pass and earn the Injection Molding Technician credential at the Anderson Plant. Covers all five lessons proportionally.",
  passingScore: 80,
  questions: FINAL_ASSESSMENT_QUESTIONS,
};

// ──────────────────────────────────────────────────────────────────────────────
// Public helpers
// ──────────────────────────────────────────────────────────────────────────────

// Always returns the Anderson IM objectives, regardless of input.
export function generateObjectivesForTopic(_topic: string): string[] {
  return [...ANDERSON_OBJECTIVES];
}

// Always returns "Operations", the category for the Anderson IM course.
export function detectCategory(_topic: string): string {
  return "Operations";
}

// ──────────────────────────────────────────────────────────────────────────────
// Three scripted conversation turns that should appear in the editor's agent
// sidebar after the Keter wizard creates the course. Exposed so the wizard can
// pre-seed conversationHistory (which suppresses the editor's auto-build) and
// then create lessons + sections itself using ANDERSON_OUTLINE.
// ──────────────────────────────────────────────────────────────────────────────

export const ANDERSON_CONVERSATION_TURNS: Array<
  Pick<ChatMessage, "role" | "content">
> = [
  {
    role: "assistant",
    content:
      "I've analyzed your setup context and built your Injection Molding Technician Certification for Anderson. Includes 5 lessons (~120 min), 5 knowledge checks, and a final assessment. Targets Injection Molding Operators and Technicians. All fields are populated in the editor on the left.",
  },
  {
    role: "user",
    content:
      "Can you make lesson 4 more focused on the top 3 defects we see in our work orders?",
  },
  {
    role: "assistant",
    content:
      "Done. I've narrowed Lesson 4 to short shots, flash, and sink marks based on your defect frequency data. Each now has a dedicated narrated walkthrough section with troubleshooting steps.",
  },
];

// Re-export the outline so the wizard (and any future caller) can pre-create
// lessons + sections without going through generateAgentResponse.
export const ANDERSON_OUTLINE_LESSONS: KeterGeneratedLesson[] = ANDERSON_OUTLINE;

// ──────────────────────────────────────────────────────────────────────────────
// generateAgentResponse, always returns the Anderson IM build response.
// Mirrors the new-course branch of lib/mockAIAgent.ts:generateAgentResponse so
// the editor's auto-build (when invoked) renders the same conversational
// summary, applies field updates, and creates the 5 lessons + final
// assessment outlined above. Returned attachedOutline carries the full
// `sections` array on each lesson; the Keter wizard's additive
// sections-iteration block consumes it to materialize Resources.
// ──────────────────────────────────────────────────────────────────────────────

export async function generateAgentResponse(params: {
  userMessage: string;
  conversationHistory: ChatMessage[];
  context: AgentContext;
}): Promise<AgentResponse> {
  const { context } = params;

  // Mirror the simulated agent latency from the main mock so the typing
  // indicator in the editor's chat panel feels consistent.
  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

  const lessonsWithSources: KeterGeneratedLesson[] = ANDERSON_OUTLINE.map(
    (lesson) => ({
      ...lesson,
      sourceAttributions: context.selectedSourceIds,
    }),
  );

  const message = ANDERSON_CONVERSATION_TURNS[0].content;

  return {
    message,
    attachedOutline: lessonsWithSources,
    attachedSources: context.selectedSourceIds,
    finalQuiz: ANDERSON_FINAL_QUIZ,
    fieldUpdates: {
      title: ANDERSON_TITLE,
      description: ANDERSON_DESCRIPTION,
      objectives: [...ANDERSON_OBJECTIVES],
      category: "Operations",
      difficulty: "intermediate",
      estimatedMinutes: 120,
      readingLevel: "standard",
      language: "en",
      tags: [...ANDERSON_TAGS],
      standards: [...ANDERSON_STANDARDS],
    },
  };
}
