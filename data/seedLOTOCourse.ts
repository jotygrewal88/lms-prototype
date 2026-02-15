// Seed data: Lockout/Tagout (LOTO) Procedures — full realistic course
import { Course, Lesson, Resource, Quiz, Question, CourseAssignment, KnowledgeCheck } from "@/types";

const now = new Date().toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

// ─── Knowledge Checks ───────────────────────────────────────────────────────

const lesson1KCs: KnowledgeCheck[] = [
  {
    id: "kc_loto_1_1",
    question: "Which of the following is NOT a form of hazardous energy?",
    type: "multiple-choice",
    options: [
      { id: "kc_loto_1_1_a", text: "Electrical" },
      { id: "kc_loto_1_1_b", text: "Gravitational" },
      { id: "kc_loto_1_1_c", text: "Emotional" },
      { id: "kc_loto_1_1_d", text: "Thermal" },
    ],
    correctOptionId: "kc_loto_1_1_c",
    explanation: "Emotional is not a form of hazardous energy. OSHA identifies electrical, mechanical, hydraulic, pneumatic, chemical, thermal, and gravitational as forms of hazardous energy that must be controlled during servicing and maintenance.",
  },
  {
    id: "kc_loto_1_2",
    question: "True or False: A push-button stop on a machine is considered an energy isolating device.",
    type: "true-false",
    options: [
      { id: "kc_loto_1_2_a", text: "True" },
      { id: "kc_loto_1_2_b", text: "False" },
    ],
    correctOptionId: "kc_loto_1_2_b",
    explanation: "False. Push buttons, selector switches, and other control-circuit devices are NOT energy isolating devices. Energy isolating devices are mechanical devices that physically prevent the transmission of energy — such as circuit breakers, disconnect switches, line valves, and blocks.",
  },
];

const lesson2KCs: KnowledgeCheck[] = [
  {
    id: "kc_loto_2_1",
    question: "What is the FIRST step in the LOTO procedure?",
    type: "multiple-choice",
    options: [
      { id: "kc_loto_2_1_a", text: "Preparation" },
      { id: "kc_loto_2_1_b", text: "Shutdown" },
      { id: "kc_loto_2_1_c", text: "Isolation" },
      { id: "kc_loto_2_1_d", text: "Lock Application" },
    ],
    correctOptionId: "kc_loto_2_1_a",
    explanation: "Preparation is the first step. Before any shutdown, you must identify all energy sources for the equipment, determine which employees will be affected, and gather the necessary locks, tags, and other hardware.",
  },
  {
    id: "kc_loto_2_2",
    question: "After applying locks and tags, what must you do before beginning work?",
    type: "multiple-choice",
    options: [
      { id: "kc_loto_2_2_a", text: "Take a break" },
      { id: "kc_loto_2_2_b", text: "Verify zero energy state" },
      { id: "kc_loto_2_2_c", text: "Notify your supervisor" },
      { id: "kc_loto_2_2_d", text: "Remove PPE" },
    ],
    correctOptionId: "kc_loto_2_2_b",
    explanation: "You must verify zero energy state by attempting to restart the machine or equipment. This confirms that all energy sources have been properly isolated. After verification, return all controls to the 'off' or 'neutral' position.",
  },
];

const lesson3KCs: KnowledgeCheck[] = [
  {
    id: "kc_loto_3_1",
    question: "During a group lockout, when can the lockbox be opened?",
    type: "multiple-choice",
    options: [
      { id: "kc_loto_3_1_a", text: "When the supervisor says so" },
      { id: "kc_loto_3_1_b", text: "Only when ALL authorized employees have removed their locks" },
      { id: "kc_loto_3_1_c", text: "When the shift ends" },
      { id: "kc_loto_3_1_d", text: "After 8 hours" },
    ],
    correctOptionId: "kc_loto_3_1_b",
    explanation: "A group lockbox can only be opened when every authorized employee has removed their individual lock. This ensures that no worker is exposed to hazardous energy while another is still performing maintenance.",
  },
];

// ─── Lesson Content (HTML) ──────────────────────────────────────────────────

const lesson1Content = `
<h2>Understanding Hazardous Energy</h2>
<p>Hazardous energy is any type of energy that could be released during servicing or maintenance activities, causing injury or death to workers. Understanding these energy sources is the foundation of any effective Lockout/Tagout program.</p>

<div class="callout" data-variant="key-point">
  <strong>Key Statistic:</strong> OSHA estimates that compliance with the Lockout/Tagout standard (29 CFR 1910.147) prevents approximately <strong>120 fatalities</strong> and <strong>50,000 injuries</strong> each year in the United States.
</div>

<h3>Seven Types of Hazardous Energy</h3>
<p>Equipment and machinery can store or use multiple forms of energy simultaneously. All sources must be identified and controlled before any servicing begins.</p>

<ol>
  <li><strong>Electrical Energy</strong> — The most common and often the most dangerous. Includes AC/DC power supplies, batteries, capacitors, and static electricity. Even after shutdown, capacitors can store lethal charges at 480V or higher.</li>
  <li><strong>Mechanical Energy</strong> — Energy from moving parts: rotating shafts, gears, belt drives, flywheels, springs. A flywheel can continue spinning for minutes after power is removed.</li>
  <li><strong>Hydraulic Energy</strong> — Pressurized fluid in cylinders, lines, and accumulators. Hydraulic systems can operate at pressures exceeding 3,000 PSI — enough to penetrate skin and cause fatal injuries.</li>
  <li><strong>Pneumatic Energy</strong> — Compressed air or gas in lines, tanks, and cylinders. Pneumatic systems store energy that can cause violent movement of machine parts when released unexpectedly.</li>
  <li><strong>Chemical Energy</strong> — Stored in process chemicals, fuels, and reactive materials. Chemical reactions can produce heat, toxic gases, or explosive conditions.</li>
  <li><strong>Thermal Energy</strong> — Heat or extreme cold in process equipment, steam lines, furnaces, and cryogenic systems. Burns from hot surfaces or steam can occur long after equipment shutdown.</li>
  <li><strong>Gravitational Energy</strong> — Stored in elevated components, suspended loads, or raised machine parts. A raised press ram, elevated platform, or loaded hoist can fall when energy controls are released.</li>
</ol>

<div class="callout" data-variant="warning">
  <strong>⚠️ Real-World Example:</strong> A conveyor belt motor stores kinetic energy in its rotating components. Even after the electrical supply is disconnected, residual energy in capacitors can deliver a lethal 480V shock. The belt itself may continue moving due to inertia, and elevated sections store gravitational energy that could cause the belt to shift suddenly.
</div>

<h3>Energy Isolating Devices</h3>
<p>An energy isolating device is a mechanical device that physically prevents the transmission or release of energy. These are the devices to which you apply your locks and tags.</p>

<ul>
  <li><strong>Circuit breakers and disconnect switches</strong> — Isolate electrical energy</li>
  <li><strong>Line valves</strong> — Block flow of liquids, gases, or steam</li>
  <li><strong>Block and bleed valves</strong> — Isolate and vent pressurized systems</li>
  <li><strong>Manually operated switches</strong> — Where no automatic restart exists</li>
  <li><strong>Blind flanges and slip blinds</strong> — Physically block pipelines</li>
</ul>

<div class="callout" data-variant="danger">
  <strong>⛔ NOT Energy Isolating Devices:</strong> Push buttons, selector switches, interlock switches, and other control-circuit type devices are <strong>NOT</strong> energy isolating devices. They do not physically prevent energy from being transmitted and must never be relied upon as the sole means of energy isolation.
</div>

<div class="image-placeholder" data-caption="📸 Diagram: Types of Energy Isolating Devices — Circuit Breakers, Disconnect Switches, Line Valves, Block & Bleed Valves"></div>

<h3>Identifying Energy Sources on Your Equipment</h3>
<p>Before any lockout/tagout procedure, you must identify <strong>every</strong> energy source on the equipment. Use your facility's Equipment-Specific Energy Control Procedure (ESECP) as a guide. Each piece of equipment should have a documented procedure that lists:</p>
<ul>
  <li>All energy sources and their locations</li>
  <li>The specific energy isolating devices for each source</li>
  <li>The type of stored energy and methods for dissipation</li>
  <li>Special hazards or considerations unique to that equipment</li>
</ul>
`;

const lesson2Content = `
<h2>The 6-Step Lockout/Tagout Procedure</h2>
<p>The LOTO procedure follows six critical steps that must be performed in order. Skipping or rushing any step can result in serious injury or death. This procedure is mandated by OSHA 29 CFR 1910.147.</p>

<div class="image-placeholder" data-caption="📸 Infographic: The 6-Step LOTO Procedure Flow — Preparation → Shutdown → Isolation → Lock & Tag → Stored Energy → Verification"></div>

<h3>Step 1: Preparation</h3>
<p>Before beginning any lockout/tagout, you must thoroughly prepare:</p>
<ul>
  <li><strong>Identify all energy sources</strong> for the specific equipment using the Equipment-Specific Energy Control Procedure (ESECP)</li>
  <li><strong>Identify all affected employees</strong> — anyone who operates or works near the equipment</li>
  <li><strong>Gather required materials</strong> — personal safety locks, tags, hasps, lock boxes, and any special blocking/blanking devices needed</li>
  <li><strong>Review the procedure</strong> — ensure you understand the specific isolation points and sequence</li>
</ul>

<h3>Step 2: Shutdown</h3>
<p>Shut down the equipment using the <strong>normal stopping procedure</strong>. This means using the standard operating controls — not pulling disconnects or tripping breakers as a first step.</p>
<ul>
  <li>Notify all affected employees that a lockout is being performed and why</li>
  <li>Allow the machine to complete its current cycle if safe to do so</li>
  <li>Use the standard stop button or shutdown sequence</li>
</ul>

<h3>Step 3: Isolation</h3>
<p>Locate and operate <strong>all energy isolating devices</strong> to disconnect the equipment from every energy source:</p>
<ul>
  <li>Open electrical disconnects</li>
  <li>Close and block line valves</li>
  <li>Disconnect pneumatic and hydraulic lines</li>
  <li>Engage mechanical blocks or pins</li>
</ul>

<h3>Step 4: Lock & Tag Application</h3>
<p>Each authorized employee performing maintenance must apply their <strong>own individual lock and tag</strong> to every energy isolating device.</p>

<div class="callout" data-variant="danger">
  <strong>⚠️ CRITICAL:</strong> Each worker MUST apply their own individual lock. Never allow another employee to lock out on your behalf. Never share locks. Your lock is your lifeline — it guarantees that only YOU can remove it and re-energize the equipment.
</div>

<p>Each tag must clearly display:</p>
<ol>
  <li><strong>Employee name</strong> — who applied the lock</li>
  <li><strong>Date and time</strong> — when the lock was applied</li>
  <li><strong>Reason for lockout</strong> — what work is being performed</li>
  <li><strong>Expected duration</strong> — when the lockout is expected to end</li>
</ol>

<h3>Step 5: Stored Energy Verification</h3>
<p>After isolation, stored or residual energy must be <strong>released, restrained, or dissipated</strong>:</p>
<ul>
  <li><strong>Bleed hydraulic lines</strong> — relieve pressure to zero PSI</li>
  <li><strong>Discharge capacitors</strong> — use approved grounding methods</li>
  <li><strong>Block elevated parts</strong> — use mechanical stops, pins, or cribbing</li>
  <li><strong>Relieve spring tension</strong> — release or block springs under tension</li>
  <li><strong>Vent pneumatic pressure</strong> — bleed air from lines and tanks</li>
  <li><strong>Allow thermal cool-down</strong> — wait for hot surfaces to reach safe temperatures</li>
</ul>

<div class="callout" data-variant="tip">
  <strong>💡 Pro Tip:</strong> When bleeding hydraulic or pneumatic systems, open drain valves slowly. Rapidly releasing pressurized fluid can cause violent whipping of hoses or spray of hot fluid. Always wear appropriate PPE including face protection.
</div>

<h3>Step 6: Verification</h3>
<p>This is the final safety check before any work begins:</p>
<ol>
  <li><strong>Attempt to restart</strong> the machine using the normal operating controls</li>
  <li><strong>Confirm zero energy</strong> — the equipment should not start, move, or respond in any way</li>
  <li><strong>Test indicators</strong> — use a voltage tester, pressure gauge, or other instruments to confirm isolation</li>
  <li><strong>Return controls to off</strong> — after verification, return all operating controls to the "off" or "neutral" position</li>
</ol>

<div class="callout" data-variant="key-point">
  <strong>✅ Only after successful verification of zero energy state may any servicing or maintenance work begin.</strong> If the equipment responds in any way during verification, immediately stop, re-evaluate, and re-isolate before proceeding.
</div>
`;

const lesson3Content = `
<h2>Group Lockout & Complex Equipment</h2>
<p>Many maintenance activities involve multiple workers, complex equipment with numerous energy sources, or extended durations that span shift changes. These situations require additional coordination and procedures beyond the basic 6-step LOTO process.</p>

<h3>Group Lockout Procedures</h3>
<p>When multiple authorized employees are working on the same equipment, a group lockout procedure must be used. The most common method uses a <strong>lockbox system</strong>:</p>

<ol>
  <li><strong>Primary authorized employee</strong> (usually the lead technician or supervisor) applies locks to all energy isolating devices</li>
  <li>The keys to these primary locks are placed inside a <strong>group lockbox</strong></li>
  <li>Each authorized employee applies their <strong>individual lock</strong> to the lockbox</li>
  <li>The lockbox cannot be opened until <strong>every</strong> employee has removed their individual lock</li>
  <li>Only after all individual locks are removed can the primary locks be removed from the energy isolating devices</li>
</ol>

<div class="image-placeholder" data-caption="📸 Photo: Group Lockbox System — Multiple employee locks on a single lockbox containing the primary isolation lock keys"></div>

<div class="callout" data-variant="key-point">
  <strong>✅ Key Principle:</strong> In a group lockout, no single person can restore energy to the equipment. Every authorized employee maintains personal control of the lockout through their individual lock on the lockbox.
</div>

<h3>Shift Change Procedures</h3>
<p>When a lockout must continue across shift changes (common for extended maintenance or overhauls), a documented shift change procedure is required:</p>

<ol>
  <li><strong>Incoming shift</strong> workers arrive and are briefed on the current lockout status</li>
  <li>Each incoming worker applies their <strong>individual lock</strong> to the lockbox or energy isolating devices</li>
  <li><strong>Only after</strong> all incoming locks are in place can outgoing workers remove their locks</li>
  <li>There must be <strong>continuous lockout coverage</strong> — at no point should the equipment be without at least one lock</li>
  <li>A <strong>shift change log</strong> must be maintained documenting the transfer</li>
</ol>

<div class="callout" data-variant="warning">
  <strong>⚠️ Never leave equipment unprotected during a shift change.</strong> The incoming shift must apply their locks BEFORE the outgoing shift removes theirs. If there is any gap in coverage, a new full LOTO procedure must be performed, including re-verification.
</div>

<h3>Complex Equipment with Multiple Energy Sources</h3>
<p>Industrial equipment frequently has multiple types of energy that must all be controlled. Consider this example:</p>

<p><strong>Industrial Hydraulic Press:</strong></p>
<ul>
  <li><strong>Electrical</strong> — 480V 3-phase power supply, control circuits at 120V, PLC backup battery</li>
  <li><strong>Hydraulic</strong> — Main cylinder at 2,500 PSI, accumulator pre-charge at 1,200 PSI</li>
  <li><strong>Pneumatic</strong> — Air-operated clamps at 90 PSI, air logic circuits</li>
  <li><strong>Gravitational</strong> — 8-ton ram in raised position, counterbalance weights</li>
  <li><strong>Mechanical</strong> — Spring-loaded safety latches, counterbalance springs</li>
</ul>

<p>This single machine requires <strong>at least 7 isolation points</strong> to be properly locked out. The Equipment-Specific Energy Control Procedure documents each point, the isolation device, and the proper sequence.</p>

<h3>Contractor and Outside Personnel</h3>
<p>When contractors or outside service personnel perform work on your equipment:</p>
<ul>
  <li>The host employer must inform contractors of the LOTO requirements</li>
  <li>Contractors must follow the host facility's LOTO procedures OR use their own equivalent procedures</li>
  <li>Both employers must coordinate to ensure <strong>all workers are protected</strong></li>
  <li>The host employer's authorized employees and contractor employees each apply their own locks</li>
</ul>

<h3>When Tagout-Only Is Permitted</h3>
<p>OSHA allows tagout-only procedures (without lockout) <strong>only when</strong>:</p>
<ul>
  <li>The energy isolating device is <strong>physically incapable</strong> of being locked out (e.g., an older valve with no hasp attachment point)</li>
  <li>The employer can demonstrate that tagout provides <strong>equivalent protection</strong> to lockout</li>
  <li><strong>Additional safety measures</strong> are in place — such as removing fuses, blocking valve handles, or using extra warning signs</li>
</ul>

<div class="callout" data-variant="danger">
  <strong>⛔ Important:</strong> Tagout alone is never as safe as lockout. When tagout-only is used, employers must take additional steps to achieve a level of safety equivalent to lockout. Whenever an energy isolating device CAN be locked out, it MUST be locked out.
</div>
`;

const lesson4Content = `
<h2>LOTO Certification Assessment</h2>
<p>This assessment evaluates your understanding of Lockout/Tagout procedures as required by OSHA 29 CFR 1910.147. You must score <strong>85% or higher</strong> to earn your LOTO Certification.</p>

<div class="callout" data-variant="key-point">
  <strong>Assessment Details:</strong>
  <ul>
    <li>8 questions covering all aspects of LOTO procedures</li>
    <li>Passing score: 85% (7 out of 8 correct)</li>
    <li>You may retake the assessment if needed</li>
    <li>Upon passing, your LOTO Certification will be issued immediately</li>
  </ul>
</div>

<p>Review the previous lessons if needed before starting. When you're ready, click <strong>"Start Attempt"</strong> below.</p>
`;

// ─── Quiz Questions ─────────────────────────────────────────────────────────

const lotoQuizQuestions: Question[] = [
  {
    id: "q_loto_01",
    type: "mcq",
    prompt: "What OSHA standard covers the Control of Hazardous Energy (Lockout/Tagout)?",
    options: [
      { id: "q_loto_01_a", text: "1910.134 — Respiratory Protection", correct: false },
      { id: "q_loto_01_b", text: "1910.147 — Control of Hazardous Energy", correct: true },
      { id: "q_loto_01_c", text: "1910.178 — Powered Industrial Trucks", correct: false },
      { id: "q_loto_01_d", text: "1926.501 — Fall Protection", correct: false },
    ],
    required: true,
    points: 1,
    meta: { difficulty: "easy", rationale: "OSHA 29 CFR 1910.147 is the standard specifically addressing lockout/tagout requirements." },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "q_loto_02",
    type: "mcq",
    prompt: "Which of the following is an energy isolating device?",
    options: [
      { id: "q_loto_02_a", text: "Push button", correct: false },
      { id: "q_loto_02_b", text: "Selector switch", correct: false },
      { id: "q_loto_02_c", text: "Circuit breaker", correct: true },
      { id: "q_loto_02_d", text: "Emergency stop", correct: false },
    ],
    required: true,
    points: 1,
    meta: { difficulty: "medium", rationale: "Circuit breakers physically prevent energy transmission. Push buttons, selector switches, and e-stops are control-circuit devices, not energy isolating devices." },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "q_loto_03",
    type: "mcq",
    prompt: "How many keys should exist for each lock in a LOTO procedure?",
    options: [
      { id: "q_loto_03_a", text: "One — only the authorized employee has the key", correct: true },
      { id: "q_loto_03_b", text: "Two — one for worker, one for supervisor", correct: false },
      { id: "q_loto_03_c", text: "Three — worker, supervisor, and safety office", correct: false },
      { id: "q_loto_03_d", text: "As many as needed for convenience", correct: false },
    ],
    required: true,
    points: 1,
    meta: { difficulty: "medium", rationale: "Each lock must have only one key, held by the authorized employee who applied it. This ensures only that employee can remove the lock." },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "q_loto_04",
    type: "multiselect",
    prompt: "What information must be on a lockout tag? (Select all that apply)",
    options: [
      { id: "q_loto_04_a", text: "Employee name", correct: true },
      { id: "q_loto_04_b", text: "Date applied", correct: true },
      { id: "q_loto_04_c", text: "Reason for lockout", correct: true },
      { id: "q_loto_04_d", text: "Expected completion", correct: true },
    ],
    required: true,
    points: 1,
    meta: { difficulty: "easy", rationale: "All four items are required on a lockout tag: employee name, date, reason, and expected duration." },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "q_loto_05",
    type: "mcq",
    prompt: "A maintenance technician needs to clear a jam on a conveyor. The conveyor has electrical and pneumatic energy sources. How many types of energy must be isolated?",
    options: [
      { id: "q_loto_05_a", text: "Only the electrical — it's the primary power source", correct: false },
      { id: "q_loto_05_b", text: "Only the pneumatic — it's causing the jam", correct: false },
      { id: "q_loto_05_c", text: "Both — ALL energy sources must be isolated", correct: true },
      { id: "q_loto_05_d", text: "Depends on supervisor decision", correct: false },
    ],
    required: true,
    points: 1,
    meta: { difficulty: "medium", rationale: "ALL energy sources must be isolated, regardless of which one is the 'primary' source or the focus of the repair." },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "q_loto_06",
    type: "mcq",
    prompt: "You arrive for your shift and find equipment locked out by the previous shift. What should you do?",
    options: [
      { id: "q_loto_06_a", text: "Remove their lock and apply yours", correct: false },
      { id: "q_loto_06_b", text: "Begin work since it's already locked out", correct: false },
      { id: "q_loto_06_c", text: "Follow shift change lockout procedure — apply your lock before they remove theirs", correct: true },
      { id: "q_loto_06_d", text: "Call OSHA for guidance", correct: false },
    ],
    required: true,
    points: 1,
    meta: { difficulty: "hard", rationale: "The proper shift change procedure requires incoming workers to apply their locks BEFORE outgoing workers remove theirs, maintaining continuous lockout coverage." },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "q_loto_07",
    type: "true_false",
    prompt: "An authorized employee can ask a coworker to remove their lock at the end of the shift if they have already left the facility.",
    answer: false,
    required: true,
    points: 1,
    meta: { difficulty: "medium", rationale: "Only the employee who applied the lock is authorized to remove it. If an employee leaves without removing their lock, a specific lock removal procedure with documented safeguards must be followed." },
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "q_loto_08",
    type: "mcq",
    prompt: "What must you do AFTER verifying zero energy state and BEFORE starting maintenance work?",
    options: [
      { id: "q_loto_08_a", text: "Remove your lock temporarily", correct: false },
      { id: "q_loto_08_b", text: "Return all operating controls to the 'off' or 'neutral' position", correct: true },
      { id: "q_loto_08_c", text: "Notify the area supervisor", correct: false },
      { id: "q_loto_08_d", text: "File a work order", correct: false },
    ],
    required: true,
    points: 1,
    meta: { difficulty: "hard", rationale: "After verification confirms zero energy, all controls must be returned to the 'off' or 'neutral' position to prevent confusion about the equipment status." },
    createdAt: now,
    updatedAt: now,
  },
];

// ─── Course ─────────────────────────────────────────────────────────────────

export const lotoCourse: Course = {
  id: "crs_loto_full",
  title: "Lockout/Tagout (LOTO) Procedures",
  description: "Complete training on Lockout/Tagout procedures as required by OSHA 29 CFR 1910.147. Covers hazardous energy identification, the 6-step LOTO procedure, group lockout, and complex equipment scenarios. Passing the final assessment earns your LOTO Certification.",
  category: "Safety",
  estimatedMinutes: 60,
  status: "published",
  tags: ["OSHA", "LOTO", "Safety", "Certification", "Energy Control"],
  standards: ["OSHA 1910.147"],
  skills: ["skl_001", "skl_012"], // LOTO Certified, Electrical Safety
  policy: {
    progression: "linear",
    requireAllLessons: true,
    requirePassingQuiz: true,
    enableRetakes: true,
    lockNextUntilPrevious: true,
    showExplanations: true,
    requiresManualCompletion: true,
    requireQuizPassToCompleteLesson: true,
    minVideoWatchPct: 80,
    minTimeOnLessonSec: 30,
    maxQuizAttempts: 3,
    retakeCooldownMin: 30,
  },
  ownerUserId: "usr_admin_1",
  lessonIds: ["lsn_loto_01", "lsn_loto_02", "lsn_loto_03", "lsn_loto_04"],
  quizId: "qz_loto_full",
  scope: { type: "department", departmentIds: ["dept_a_maintenance", "dept_b_maintenance"] },
  skillsGranted: [
    { skillId: "skl_001", level: 1, evidenceRequired: true },
  ],
  metadata: {
    objectives: [
      "Identify all seven types of hazardous energy",
      "Perform the complete 6-step LOTO procedure",
      "Apply group lockout and shift change procedures",
      "Select appropriate energy isolating devices",
      "Verify zero energy state before beginning work",
    ],
    tags: ["OSHA", "LOTO", "Safety", "Certification"],
    difficulty: "intermediate",
    language: "en",
    readingLevel: "standard",
  },
  createdAt: daysAgo(30),
  updatedAt: daysAgo(5),
};

// ─── Lessons ────────────────────────────────────────────────────────────────

export const lotoLessons: Lesson[] = [
  {
    id: "lsn_loto_01",
    courseId: "crs_loto_full",
    title: "Understanding Energy Sources & Hazards",
    order: 0,
    resourceIds: ["res_loto_01_text", "res_loto_01_img1", "res_loto_01_img2", "res_loto_01_pdf"],
    knowledgeChecks: lesson1KCs,
    estimatedMinutes: 15,
    lessonType: "lesson",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "lsn_loto_02",
    courseId: "crs_loto_full",
    title: "The 6-Step LOTO Procedure",
    order: 1,
    resourceIds: ["res_loto_02_text", "res_loto_02_img1", "res_loto_02_pdf1", "res_loto_02_img2"],
    knowledgeChecks: lesson2KCs,
    estimatedMinutes: 20,
    lessonType: "lesson",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "lsn_loto_03",
    courseId: "crs_loto_full",
    title: "Group Lockout & Complex Equipment",
    order: 2,
    resourceIds: ["res_loto_03_text", "res_loto_03_img1", "res_loto_03_pdf", "res_loto_03_img2"],
    knowledgeChecks: lesson3KCs,
    estimatedMinutes: 15,
    lessonType: "lesson",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "lsn_loto_04",
    courseId: "crs_loto_full",
    title: "LOTO Certification Assessment",
    order: 3,
    resourceIds: ["res_loto_04_text"],
    estimatedMinutes: 10,
    lessonType: "assessment",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
];

// ─── Resources ──────────────────────────────────────────────────────────────

export const lotoResources: Resource[] = [
  // ─── Lesson 1: Understanding Energy Sources & Hazards ─────────────────────
  {
    id: "res_loto_01_text",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_01",
    type: "text",
    title: "Understanding Energy Sources & Hazards",
    content: lesson1Content,
    order: 0,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_01_img1",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_01",
    type: "image",
    title: "Hazardous Energy Sources — Electrical Panel Lockout",
    url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&auto=format&fit=crop",
    order: 1,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_01_img2",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_01",
    type: "image",
    title: "Energy Isolating Devices — Circuit Breaker with Lockout Hasp",
    url: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=900&auto=format&fit=crop",
    order: 2,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_01_pdf",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_01",
    type: "pdf",
    title: "OSHA Fact Sheet — Lockout/Tagout",
    url: "https://www.osha.gov/sites/default/files/publications/factsheet-lockout-tagout.pdf",
    fileName: "OSHA_Lockout_Tagout_FactSheet.pdf",
    order: 3,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },

  // ─── Lesson 2: The 6-Step LOTO Procedure ──────────────────────────────────
  {
    id: "res_loto_02_text",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_02",
    type: "text",
    title: "The 6-Step LOTO Procedure",
    content: lesson2Content,
    order: 0,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_02_img1",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_02",
    type: "image",
    title: "Lockout Devices — Padlocks, Hasps, and Tags Applied to Equipment",
    url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&auto=format&fit=crop",
    order: 1,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_02_pdf1",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_02",
    type: "pdf",
    title: "OSHA Quick Card — Steps for Lockout/Tagout",
    url: "https://www.osha.gov/sites/default/files/publications/osha3120.pdf",
    fileName: "OSHA_LOTO_QuickCard.pdf",
    order: 2,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_02_img2",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_02",
    type: "image",
    title: "Verification Step — Technician Testing for Zero Energy State",
    url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900&auto=format&fit=crop",
    order: 3,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },

  // ─── Lesson 3: Group Lockout & Complex Equipment ──────────────────────────
  {
    id: "res_loto_03_text",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_03",
    type: "text",
    title: "Group Lockout & Complex Equipment",
    content: lesson3Content,
    order: 0,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_03_img1",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_03",
    type: "image",
    title: "Group Lockbox System — Multiple Locks Securing Shared Lockout",
    url: "https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=900&auto=format&fit=crop",
    order: 1,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_03_pdf",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_03",
    type: "pdf",
    title: "OSHA 1910.147 — Control of Hazardous Energy Standard (Full Text)",
    url: "https://www.osha.gov/sites/default/files/publications/osha3151.pdf",
    fileName: "OSHA_1910_147_Standard.pdf",
    order: 2,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_03_img2",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_03",
    type: "image",
    title: "Complex Industrial Equipment — Hydraulic Press with Multiple Energy Sources",
    url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&auto=format&fit=crop",
    order: 3,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },

  // ─── Lesson 4: Assessment (text only) ─────────────────────────────────────
  {
    id: "res_loto_04_text",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_04",
    type: "text",
    title: "LOTO Certification Assessment",
    content: lesson4Content,
    order: 0,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
];

// ─── Quiz ───────────────────────────────────────────────────────────────────

export const lotoQuiz: Quiz = {
  id: "qz_loto_full",
  courseId: "crs_loto_full",
  // No lessonId — this is a course-level quiz
  title: "LOTO Certification Assessment",
  description: "Demonstrate your knowledge of Lockout/Tagout procedures. You must score 85% or higher to earn your LOTO Certification.",
  questions: lotoQuizQuestions,
  config: {
    passingScore: 85,
    shuffleQuestions: true,
    shuffleOptions: true,
    showRationales: true,
  },
  policy: {
    passingScorePct: 85,
    maxAttempts: 3,
    lockOnPass: true,
    shuffleQuestions: true,
    shuffleOptions: true,
    showFeedback: "end",
  },
  createdAt: daysAgo(30),
  updatedAt: daysAgo(5),
};

// ─── Assignment for learner demo ────────────────────────────────────────────

export const lotoAssignment: CourseAssignment = {
  id: "asgn_loto_marcus",
  courseId: "crs_loto_full",
  target: { type: "user", userIds: ["usr_lrn_a_pkg_1"] },
  dueAt: daysFromNow(7),
  assignerUserId: "usr_admin_1",
  createdAt: daysAgo(14),
  updatedAt: daysAgo(14),
};
