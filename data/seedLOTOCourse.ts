// Seed data: Lockout/Tagout (LOTO) Procedures — full realistic course
import { Course, Lesson, Resource, Quiz, Question, CourseAssignment, KnowledgeCheck, Slide, NarrationData, KnowledgeCheckData, ChatMessage, GeneratedLesson } from "@/types";

const now = new Date().toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

// ─── Knowledge Checks (on Lesson objects) ────────────────────────────────────

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

// ─── Lesson 1 Content (HTML — kept from original) ───────────────────────────

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
`;

// ─── Lesson 3 Text Content (The 6-Step LOTO Process — detailed written steps) ─

const lesson3TextContent = `
<h2>The 6-Step Lockout/Tagout Procedure — Detailed Reference</h2>
<p>This procedure follows six critical steps that must be performed in order. Skipping or rushing any step can result in serious injury or death.</p>

<table style="width:100%; border-collapse:collapse; margin:1em 0;">
  <thead>
    <tr style="background:#f3f4f6;">
      <th style="padding:8px; text-align:left; border:1px solid #e5e7eb;">Step</th>
      <th style="padding:8px; text-align:left; border:1px solid #e5e7eb;">Action</th>
      <th style="padding:8px; text-align:left; border:1px solid #e5e7eb;">Key Requirements</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:8px; border:1px solid #e5e7eb;">1. Preparation</td><td style="padding:8px; border:1px solid #e5e7eb;">Identify energy sources, affected employees, and gather materials</td><td style="padding:8px; border:1px solid #e5e7eb;">Review ESECP for the specific equipment</td></tr>
    <tr><td style="padding:8px; border:1px solid #e5e7eb;">2. Shutdown</td><td style="padding:8px; border:1px solid #e5e7eb;">Shut down equipment using normal operating controls</td><td style="padding:8px; border:1px solid #e5e7eb;">Notify all affected employees before shutdown</td></tr>
    <tr><td style="padding:8px; border:1px solid #e5e7eb;">3. Isolation</td><td style="padding:8px; border:1px solid #e5e7eb;">Operate all energy isolating devices</td><td style="padding:8px; border:1px solid #e5e7eb;">Disconnect electrical, close valves, block mechanical</td></tr>
    <tr><td style="padding:8px; border:1px solid #e5e7eb;">4. Lock & Tag</td><td style="padding:8px; border:1px solid #e5e7eb;">Apply individual lock and tag to each isolating device</td><td style="padding:8px; border:1px solid #e5e7eb;">Each worker applies their own lock — never share</td></tr>
    <tr><td style="padding:8px; border:1px solid #e5e7eb;">5. Stored Energy</td><td style="padding:8px; border:1px solid #e5e7eb;">Release, restrain, or dissipate all residual energy</td><td style="padding:8px; border:1px solid #e5e7eb;">Bleed lines, discharge capacitors, block elevated parts</td></tr>
    <tr><td style="padding:8px; border:1px solid #e5e7eb;">6. Verification</td><td style="padding:8px; border:1px solid #e5e7eb;">Attempt to restart; confirm zero energy state</td><td style="padding:8px; border:1px solid #e5e7eb;">Return controls to off position after verification</td></tr>
  </tbody>
</table>

<div class="callout" data-variant="danger">
  <strong>⛔ CRITICAL:</strong> Never assume equipment is safe because it appears to be off. Always complete ALL six steps and verify zero energy state before beginning any maintenance or servicing work.
</div>
`;

// ─── Lesson 4 Text Content (Equipment Details) ──────────────────────────────

const lesson4TextContent = `
<h2>LOTO Equipment, Devices & Group Lockout</h2>
<p>Proper lockout/tagout requires the right equipment for each situation. This section covers the devices you'll use and special procedures for group lockout scenarios.</p>

<h3>Lockout Devices</h3>
<ul>
  <li><strong>Padlocks</strong> — Standardized safety padlocks (typically red or orange) with unique keys. Each authorized employee is assigned their own lock.</li>
  <li><strong>Hasps</strong> — Multi-lock hasps allow multiple workers to lock out the same energy isolating device. The device cannot be operated until ALL locks are removed.</li>
  <li><strong>Lockout Tags</strong> — Durable tags that identify who applied the lockout, when, and why. Tags must withstand 50 lbs of pull force per OSHA requirements.</li>
  <li><strong>Valve Lockouts</strong> — Gate valve, ball valve, and butterfly valve lockout devices that prevent valve operation while locked.</li>
  <li><strong>Circuit Breaker Lockouts</strong> — Devices that clamp onto circuit breakers to prevent them from being switched on.</li>
  <li><strong>Plug Lockouts</strong> — Covers for electrical plugs that prevent re-connection.</li>
  <li><strong>Group Lockboxes</strong> — Boxes that hold the keys to primary lockout devices. Each worker applies their personal lock to the box.</li>
</ul>

<h3>Group Lockout Procedure</h3>
<p>When multiple authorized employees work on the same equipment:</p>
<ol>
  <li>The primary authorized employee applies locks to all energy isolating devices</li>
  <li>Keys are placed in the group lockbox</li>
  <li>Each worker applies their personal lock to the lockbox</li>
  <li>The lockbox cannot be opened until every lock is removed</li>
</ol>
`;

// ─── Assessment intro ────────────────────────────────────────────────────────

const lesson6Content = `
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

// ─── Slide Data ──────────────────────────────────────────────────────────────

const lesson2Slides: Slide[] = [
  {
    id: "sld_l2_01",
    layoutType: "title",
    title: "OSHA 1910.147 — Regulatory Requirements",
    body: "Understanding the Control of Hazardous Energy Standard\nYour rights, obligations, and the regulatory framework that protects workers during maintenance and servicing.",
  },
  {
    id: "sld_l2_02",
    layoutType: "content",
    title: "Scope of the Standard",
    body: "OSHA 29 CFR 1910.147 applies to the control of energy during servicing and maintenance of machines and equipment. It covers situations where unexpected energization, start-up, or release of stored energy could harm employees.\n\nThe standard applies to all general industry employers and covers any form of energy — electrical, mechanical, hydraulic, pneumatic, chemical, thermal, and gravitational.",
    speakerNotes: "Emphasize that this applies to ALL industries, not just manufacturing.",
  },
  {
    id: "sld_l2_03",
    layoutType: "key-point",
    title: "Employer Obligations",
    body: "• Develop and implement an energy control program\n• Provide lockout/tagout devices at no cost to employees\n• Establish Equipment-Specific Energy Control Procedures (ESECPs)\n• Conduct initial and periodic training for all affected employees\n• Perform annual inspections of energy control procedures\n• Maintain documentation of all training and inspections",
  },
  {
    id: "sld_l2_04",
    layoutType: "two-column",
    title: "Employee Categories",
    body: "AUTHORIZED Employees:\n— Perform lockout/tagout\n— Lock and tag energy isolating devices\n— Must complete full LOTO training\n— Carry their own assigned locks\n\nAFFECTED Employees:\n— Operate or work near locked-out equipment\n— Must NOT attempt to restart equipment\n— Must recognize lockout/tagout devices\n— Receive awareness-level training",
  },
  {
    id: "sld_l2_05",
    layoutType: "content",
    title: "Employee Rights Under OSHA",
    body: "Employees have the right to:\n• Refuse to work on equipment that is not properly locked out\n• Request copies of energy control procedures\n• Report LOTO violations without fear of retaliation\n• Access training records and inspection documentation\n• File a complaint with OSHA if they believe their employer is not complying with the standard",
    speakerNotes: "Workers should know their whistleblower protections under Section 11(c) of the OSH Act.",
  },
  {
    id: "sld_l2_06",
    layoutType: "comparison",
    title: "Lockout vs. Tagout",
    body: "LOCKOUT: Physical restraint (padlock) on energy isolating device. Provides maximum protection. Required whenever the device CAN accept a lock.\n\nTAGOUT: Warning tag attached to energy isolating device. Provides less protection. Permitted ONLY when the device cannot accept a lock AND additional safety measures are implemented.",
  },
  {
    id: "sld_l2_07",
    layoutType: "key-point",
    title: "Penalties for Non-Compliance",
    body: "• Serious Violation: Up to $16,131 per violation\n• Willful Violation: Up to $161,323 per violation\n• Repeat Violation: Up to $161,323 per violation\n• Failure to Abate: Up to $16,131 per day\n\nLOTO violations are consistently among OSHA's top 10 most frequently cited standards. In 2023, there were over 2,500 citations issued.",
    speakerNotes: "Penalty amounts are adjusted annually for inflation. These are 2024 figures.",
  },
  {
    id: "sld_l2_08",
    layoutType: "content",
    title: "Required Documentation",
    body: "Employers must maintain:\n\n1. Written energy control procedures for each piece of equipment\n2. Training certification records for all authorized and affected employees\n3. Annual inspection records signed by the inspector and each authorized employee\n4. Lock removal authorization records (when an employee's lock must be removed in their absence)\n5. Group lockout/tagout coordination records",
  },
];

const lesson3NarrationSlides: Slide[] = [
  {
    id: "sld_l3n_01",
    layoutType: "title",
    title: "The 6-Step LOTO Process",
    body: "A step-by-step walkthrough of the Lockout/Tagout procedure you'll perform every time you service or maintain equipment.",
    speakerNotes: "Welcome to this narrated walkthrough of the 6-step LOTO process.",
  },
  {
    id: "sld_l3n_02",
    layoutType: "content",
    title: "Step 1: Preparation",
    body: "Before touching any equipment, you need to prepare:\n\n• Review the Equipment-Specific Energy Control Procedure\n• Identify every energy source on the machine\n• Determine which employees will be affected\n• Gather your personal lock, tag, and any specialized lockout devices\n• Notify all affected employees that a lockout is about to begin",
    speakerNotes: "Preparation is the most critical step.",
  },
  {
    id: "sld_l3n_03",
    layoutType: "content",
    title: "Step 2: Shutdown & Step 3: Isolation",
    body: "SHUTDOWN: Use the machine's normal stopping controls. Allow it to complete its current cycle. Never pull disconnects as the first action.\n\nISOLATION: Now operate every energy isolating device:\n• Open electrical disconnects\n• Close and block line valves\n• Disconnect pneumatic and hydraulic lines\n• Engage mechanical blocks or pins",
    speakerNotes: "Always shut down using normal controls first, then isolate.",
  },
  {
    id: "sld_l3n_04",
    layoutType: "key-point",
    title: "Step 4: Lock & Tag Application",
    body: "Apply YOUR OWN individual lock and tag to EVERY energy isolating device.\n\nYour tag must show:\n• Your name\n• Date and time applied\n• Reason for lockout\n• Expected duration\n\n⛔ Never let someone else lock out on your behalf. Your lock is your lifeline.",
    speakerNotes: "This is non-negotiable. Each worker applies their own lock.",
  },
  {
    id: "sld_l3n_05",
    layoutType: "content",
    title: "Step 5: Stored Energy Release",
    body: "Even after isolation, residual energy remains in the system:\n\n• Bleed hydraulic and pneumatic lines to zero pressure\n• Discharge capacitors using approved grounding methods\n• Block or crib elevated machine components\n• Release or block springs under tension\n• Allow hot surfaces to cool to safe temperatures\n• Vent pressurized tanks and vessels",
    speakerNotes: "Stored energy is the hidden danger. It's why verification is essential.",
  },
  {
    id: "sld_l3n_06",
    layoutType: "key-point",
    title: "Step 6: Verification",
    body: "The final safety check before any work begins:\n\n1. Attempt to restart the machine using normal controls\n2. Confirm the equipment does NOT respond in any way\n3. Use test instruments to verify zero energy (voltmeter, pressure gauge)\n4. Return all controls to the OFF position\n\n✅ Only after successful verification may maintenance work begin.",
    speakerNotes: "If the equipment responds during verification, stop immediately and re-isolate.",
  },
];

const lesson3NarrationData: NarrationData = {
  script: `Welcome to the narrated walkthrough of the six-step Lockout/Tagout process. This is the procedure you'll follow every single time you perform servicing or maintenance on any piece of equipment in our facility.

Let's start with Step One: Preparation. Before you touch any equipment, you need to prepare thoroughly. Pull up the Equipment-Specific Energy Control Procedure for the machine you'll be working on. This document lists every energy source, every isolation point, and the exact sequence you need to follow. Identify all affected employees — anyone who operates or works near this equipment needs to know a lockout is happening. Gather your personal safety lock, your tag, and any specialized lockout devices you'll need.

Step Two is Shutdown. Use the machine's normal stopping controls. Let it complete its current cycle if it's safe to do so. Don't just pull the disconnect — use the standard stop button or shutdown sequence first. Notify everyone in the area that you're shutting down the equipment and performing a lockout.

Step Three is Isolation. Now you physically disconnect the equipment from every energy source. Open electrical disconnects, close and block line valves, disconnect pneumatic and hydraulic lines, and engage any mechanical blocks or pins. You're creating a physical barrier between the equipment and its energy sources.

Step Four is where you apply your lock and tag. This is non-negotiable — you apply YOUR own individual lock and tag to every energy isolating device. Your tag must clearly show your name, the date and time, the reason for the lockout, and how long you expect it to last. Never, ever let someone else lock out on your behalf. Your lock is literally your lifeline.

Step Five is Stored Energy Release. Even after isolation, there's still energy trapped in the system. You need to bleed hydraulic and pneumatic lines down to zero pressure, discharge any capacitors using approved grounding methods, block or crib any elevated machine components, release springs under tension, and allow hot surfaces to cool. This stored energy is the hidden danger that catches people off guard.

Finally, Step Six is Verification. This is your last safety check before you start working. Attempt to restart the machine using the normal operating controls. Confirm that the equipment does absolutely nothing — no movement, no sound, no response. Use test instruments like a voltmeter or pressure gauge to verify zero energy. Then return all controls to the off position. Only after successful verification can you begin your maintenance work. If the equipment responds in any way during this step, stop immediately, reassess, and re-isolate before proceeding.`,
  audioDurationSeconds: 480,
  slides: lesson3NarrationSlides,
};

const lesson4Slides: Slide[] = [
  {
    id: "sld_l4_01",
    layoutType: "title",
    title: "LOTO Equipment & Devices",
    body: "Understanding the physical tools and devices used in Lockout/Tagout procedures.",
  },
  {
    id: "sld_l4_02",
    layoutType: "two-column",
    title: "Personal Lockout Devices",
    body: "PADLOCKS:\n— Standardized safety padlocks (red/orange)\n— Unique key per lock\n— Assigned to individual employees\n— Must be durable and identifiable\n\nTAGS:\n— Durable, weather-resistant\n— Must withstand 50 lbs pull force\n— Show employee name, date, reason\n— Never reused or shared",
  },
  {
    id: "sld_l4_03",
    layoutType: "content",
    title: "Multi-Lock Hasps",
    body: "A hasp allows multiple workers to lock out the same energy isolating device simultaneously.\n\nHow it works:\n1. The hasp is placed on the energy isolating device\n2. Each authorized worker attaches their personal padlock to the hasp\n3. The device cannot be operated until ALL locks are removed\n4. No single worker can re-energize equipment while others are still working",
  },
  {
    id: "sld_l4_04",
    layoutType: "content",
    title: "Specialized Lockout Devices",
    body: "• Gate Valve Lockouts — Clamp around valve handwheels to prevent turning\n• Ball Valve Lockouts — Fit over ball valve handles in the closed position\n• Circuit Breaker Lockouts — Clamp onto breaker toggle to prevent switching\n• Plug Lockouts — Enclose electrical plugs to prevent reconnection\n• Pneumatic Lockouts — Block air supply connections\n• Blind Flanges — Physically block pipeline flow",
  },
  {
    id: "sld_l4_05",
    layoutType: "key-point",
    title: "Group Lockbox System",
    body: "For group lockout:\n\n1. Lead technician locks ALL energy isolating devices\n2. Keys go into the group lockbox\n3. Every worker applies their personal lock to the lockbox\n4. Equipment stays locked until ALL workers remove their locks\n5. Only then can the lead remove the primary isolation locks\n\nThis ensures no single person can restore energy while anyone is still working.",
  },
  {
    id: "sld_l4_06",
    layoutType: "content",
    title: "Inspecting & Maintaining LOTO Equipment",
    body: "Before each use, inspect your lockout devices:\n\n• Padlock: Check that the shackle closes and locks properly, key turns smoothly\n• Tags: Verify they are legible, not torn, attachment is secure\n• Hasps: Confirm all lock holes are clear and the hasp closes fully\n• Valve lockouts: Ensure proper fit for the valve type and size\n\nDamaged or worn devices must be replaced immediately — never use a compromised lockout device.",
  },
];

const lesson5NarrationSlides: Slide[] = [
  {
    id: "sld_l5n_01",
    layoutType: "title",
    title: "Real-World LOTO Scenarios",
    body: "Analyzing actual incidents and near-misses to understand why proper Lockout/Tagout saves lives.",
  },
  {
    id: "sld_l5n_02",
    layoutType: "content",
    title: "Case 1: The Conveyor Belt Incident",
    body: "A maintenance technician was clearing a jam on a conveyor system. The electrical disconnect was pulled, but the pneumatic air supply was not isolated.\n\nWhile the technician reached into the conveyor mechanism, an air-operated clamp actuated unexpectedly, crushing his hand.\n\nRoot cause: Incomplete energy isolation — only one of two energy sources was controlled.",
    speakerNotes: "This is a real scenario pattern. All energy sources must be identified and isolated.",
  },
  {
    id: "sld_l5n_03",
    layoutType: "content",
    title: "Case 2: The Hydraulic Press Near-Miss",
    body: "A press operator noticed a forming die was misaligned. She pressed the emergency stop and reached in to adjust the die without performing LOTO.\n\nA coworker, not knowing she was inside the press area, released the e-stop. The press cycled. Fortunately, the operator had pulled her arm back just in time.\n\nRoot cause: E-stop used instead of proper LOTO. E-stops are NOT energy isolating devices.",
    speakerNotes: "E-stops do not physically prevent energy transmission.",
  },
  {
    id: "sld_l5n_04",
    layoutType: "key-point",
    title: "Case 3: Shift Change Failure",
    body: "During a shift change on a major overhaul, the outgoing crew removed their locks before the incoming crew arrived and applied theirs.\n\nFor 22 minutes, the equipment had no lockout protection. An electrician from another department, unaware of the maintenance, attempted to test-run the machine.\n\nA nearby worker shouted a warning just in time.\n\nLesson: Incoming locks must be applied BEFORE outgoing locks are removed — no exceptions.",
  },
  {
    id: "sld_l5n_05",
    layoutType: "content",
    title: "Common Patterns in LOTO Incidents",
    body: "Analyzing hundreds of LOTO-related incidents reveals recurring patterns:\n\n• 38% — Failure to identify all energy sources\n• 25% — Using control circuits (e-stops, buttons) instead of isolation devices\n• 18% — Skipping the verification step\n• 12% — Failure to control stored/residual energy\n• 7% — Shift change and group lockout coordination failures\n\nNearly all LOTO incidents are preventable by following the 6-step procedure completely.",
    speakerNotes: "These percentages are based on aggregated OSHA incident analysis data.",
  },
];

const lesson5NarrationData: NarrationData = {
  script: `Let's look at some real-world scenarios that demonstrate why Lockout/Tagout procedures exist and what happens when they're not followed properly.

Our first case involves a conveyor belt system. A maintenance technician was called to clear a jam. He pulled the electrical disconnect — good start — but he didn't isolate the pneumatic air supply that powered the conveyor's clamping mechanisms. While he was reaching into the conveyor to clear the jam, an air-operated clamp fired unexpectedly and crushed his hand. The root cause was incomplete energy isolation. He controlled the electrical energy but missed the pneumatic energy source entirely. This is exactly why the preparation step requires you to identify every energy source using the Equipment-Specific Energy Control Procedure.

Our second case is a near-miss at a hydraulic press. An operator noticed a die was misaligned. She pressed the emergency stop button and reached in to adjust the die — without performing a proper lockout. A coworker who didn't know she was inside the press area released the emergency stop, and the press began to cycle. She pulled her arm back just barely in time. The lesson here is critical: emergency stop buttons are control circuit devices. They are NOT energy isolating devices. They do not physically prevent energy transmission, and they should never be relied upon as a substitute for proper Lockout/Tagout.

Our third scenario involves a shift change failure. During a major equipment overhaul, the outgoing maintenance crew removed their locks and left before the incoming crew arrived. For twenty-two minutes, that equipment had zero lockout protection. An electrician from another department, completely unaware of the ongoing maintenance, walked up and attempted to test-run the machine. A nearby worker shouted a warning just in time to prevent a catastrophe. The rule is absolute: incoming workers must apply their locks before outgoing workers remove theirs. There must be continuous lockout coverage at all times.

When we analyze the patterns across hundreds of LOTO incidents, we see that thirty-eight percent involve failure to identify all energy sources, twenty-five percent involve using control circuits instead of proper isolation devices, eighteen percent involve skipping verification, and twelve percent involve failure to control stored energy. Nearly every single one of these incidents was preventable by simply following the complete six-step procedure.`,
  audioDurationSeconds: 360,
  slides: lesson5NarrationSlides,
};

// ─── Knowledge Check Data (for Resource sections) ───────────────────────────

const kc_l1_purpose: KnowledgeCheckData = {
  question: "What is the primary purpose of LOTO procedures?",
  type: "multiple-choice",
  options: [
    { text: "To protect workers from unexpected energization during maintenance", isCorrect: true },
    { text: "To comply with insurance requirements", isCorrect: false },
    { text: "To speed up maintenance operations", isCorrect: false },
    { text: "To reduce equipment repair costs", isCorrect: false },
  ],
  explanation: "The primary purpose of LOTO is to protect workers from the unexpected release of hazardous energy during servicing and maintenance activities. While compliance and cost savings are secondary benefits, worker safety is the fundamental reason the standard exists.",
};

const kc_l2_regulatory: KnowledgeCheckData = {
  question: "Which OSHA standard specifically covers Lockout/Tagout requirements?",
  type: "multiple-choice",
  options: [
    { text: "29 CFR 1910.134 — Respiratory Protection", isCorrect: false },
    { text: "29 CFR 1910.147 — Control of Hazardous Energy", isCorrect: true },
    { text: "29 CFR 1910.178 — Powered Industrial Trucks", isCorrect: false },
    { text: "29 CFR 1926.501 — Fall Protection", isCorrect: false },
  ],
  explanation: "29 CFR 1910.147 is the OSHA standard that specifically addresses the control of hazardous energy through lockout/tagout procedures.",
};

const kc_l3_first_step: KnowledgeCheckData = {
  question: "What is the correct first step in the LOTO procedure?",
  type: "multiple-choice",
  options: [
    { text: "Shut down the equipment", isCorrect: false },
    { text: "Apply your lock to the disconnect", isCorrect: false },
    { text: "Preparation — identify energy sources and gather materials", isCorrect: true },
    { text: "Verify zero energy state", isCorrect: false },
  ],
  explanation: "Preparation is always the first step. Before any shutdown, you must identify all energy sources, determine affected employees, review the ESECP, and gather locks, tags, and devices.",
};

const kc_l3_verification: KnowledgeCheckData = {
  question: "True or False: After applying locks and tags, you can immediately begin maintenance work.",
  type: "true-false",
  options: [
    { text: "True", isCorrect: false },
    { text: "False", isCorrect: true },
  ],
  explanation: "False. After applying locks and tags, you must first release stored energy (Step 5) and then verify zero energy state (Step 6) before any work can begin.",
};

const kc_l4_hasp: KnowledgeCheckData = {
  question: "What is the purpose of a multi-lock hasp in LOTO?",
  type: "multiple-choice",
  options: [
    { text: "To make the lockout look more official", isCorrect: false },
    { text: "To allow multiple workers to each apply their own lock to the same isolation point", isCorrect: true },
    { text: "To replace individual padlocks with a shared device", isCorrect: false },
    { text: "To speed up the lockout process", isCorrect: false },
  ],
  explanation: "A multi-lock hasp allows multiple authorized employees to each apply their own individual padlock to the same energy isolating device, ensuring no one person can re-energize equipment while others are still working.",
};

const kc_l5_estop: KnowledgeCheckData = {
  question: "An emergency stop button is an acceptable substitute for a full LOTO procedure.",
  type: "true-false",
  options: [
    { text: "True", isCorrect: false },
    { text: "False", isCorrect: true },
  ],
  explanation: "False. Emergency stop buttons are control-circuit devices, NOT energy isolating devices. They do not physically prevent energy transmission and must never be used as a substitute for proper Lockout/Tagout.",
};

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
  estimatedMinutes: 145,
  status: "published",
  outputFormat: "mixed",
  tags: ["OSHA", "LOTO", "Safety", "Certification", "Energy Control"],
  standards: ["OSHA 1910.147"],
  skills: ["skl_001", "skl_012"],
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
  lessonIds: ["lsn_loto_01", "lsn_loto_02", "lsn_loto_03", "lsn_loto_04", "lsn_loto_05", "lsn_loto_06"],
  quizId: "qz_loto_full",
  scope: { type: "department", departmentIds: ["dept_a_maintenance", "dept_b_maintenance"] },
  skillsGranted: [
    { skillId: "skl_001", level: 1, evidenceRequired: true },
  ],
  metadata: {
    objectives: [
      "Identify all seven types of hazardous energy",
      "Explain employer obligations and employee rights under OSHA 1910.147",
      "Perform the complete 6-step LOTO procedure",
      "Select appropriate lockout devices for different equipment",
      "Apply group lockout and shift change procedures",
      "Analyze real-world LOTO incidents and identify root causes",
    ],
    tags: ["OSHA", "LOTO", "Safety", "Certification"],
    difficulty: "intermediate",
    language: "en",
    readingLevel: "standard",
  },
  aiGenerated: true,
  conversationHistory: [
    {
      id: "msg_loto_a1",
      role: "assistant",
      content: "I've analyzed your setup context and built your **Lockout/Tagout (LOTO)** course. It includes **6 lessons** (~145 min), **6 quizzes** with 25 questions and targets **Maintenance Technicians** who need LOTO Certified.\n\nThe course uses a **Mixed** output format — I chose narrated walkthroughs for the conceptual lessons and text with slides for the procedural lessons.\n\nAll fields are now populated in the editor. You can edit any field directly, or ask me to refine lessons, adjust difficulty, or save when you're satisfied.",
      timestamp: daysAgo(30),
      attachedOutline: [
        { title: "Introduction to Lockout/Tagout", description: "Overview of hazardous energy types, LOTO purpose, and regulatory context.", contentType: "text", content: "", duration: 20, quizQuestions: [] },
        { title: "OSHA 1910.147 Regulatory Requirements", description: "Employer obligations, employee rights, and compliance framework.", contentType: "text", content: "", duration: 25, quizQuestions: [] },
        { title: "The 6-Step LOTO Process", description: "Narrated walkthrough of preparation, shutdown, isolation, lockout, stored energy, and verification.", contentType: "text", content: "", duration: 30, quizQuestions: [] },
        { title: "LOTO Equipment, Devices & Group Lockout", description: "Lock types, hasps, valve lockouts, group procedures, and shift changes.", contentType: "text", content: "", duration: 25, quizQuestions: [] },
        { title: "Real-World Scenarios & Case Studies", description: "Narrated analysis of conveyor, hydraulic press, and shift-change incidents.", contentType: "text", content: "", duration: 20, quizQuestions: [] },
        { title: "Final Assessment & Certification", description: "Comprehensive quiz covering all LOTO topics. Passing earns LOTO Certification.", contentType: "text", content: "", duration: 25, quizQuestions: [] },
      ] as GeneratedLesson[],
    },
    {
      id: "msg_loto_u1",
      role: "user",
      content: "Can you make the narration in lesson 3 more conversational?",
      timestamp: daysAgo(29),
    },
    {
      id: "msg_loto_a2",
      role: "assistant",
      content: "Done! I've updated the narration script for \"The 6-Step LOTO Process\" to use a more conversational tone with second person (\"you\") and more transitional phrases. Review the updated script in the Narrated Walkthrough editor. Want me to re-render the audio?",
      timestamp: daysAgo(29),
    },
    {
      id: "msg_loto_u2",
      role: "user",
      content: "Yes, and add a knowledge check after the energy types section in lesson 1.",
      timestamp: daysAgo(28),
    },
    {
      id: "msg_loto_a3",
      role: "assistant",
      content: "✅ **Audio re-render triggered** for Lesson 3 — ready in ~2 minutes.\n\n✅ **Added a knowledge check** to Lesson 1:\n\n*\"Which of the following is NOT a type of hazardous energy covered by LOTO?\"*\n\n- Electrical\n- Hydraulic\n- **Gravitational** ← correct answer\n- Pneumatic",
      timestamp: daysAgo(28),
    },
  ] as ChatMessage[],
  createdAt: daysAgo(30),
  updatedAt: daysAgo(5),
};

// ─── Lessons ────────────────────────────────────────────────────────────────

export const lotoLessons: Lesson[] = [
  {
    id: "lsn_loto_01",
    courseId: "crs_loto_full",
    title: "Introduction to Lockout/Tagout",
    order: 0,
    resourceIds: ["res_loto_01_text", "res_loto_01_kc1"],
    knowledgeChecks: lesson1KCs,
    estimatedMinutes: 20,
    lessonType: "lesson",
    downloadableResources: [
      { title: "Energy Sources Quick Reference Card", url: "#", fileType: "pdf" },
      { title: "Hazard Identification Checklist", url: "#", fileType: "pdf" },
    ],
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "lsn_loto_02",
    courseId: "crs_loto_full",
    title: "OSHA 1910.147 Regulatory Requirements",
    order: 1,
    resourceIds: ["res_loto_02_slides", "res_loto_02_kc1"],
    knowledgeChecks: lesson2KCs,
    estimatedMinutes: 25,
    lessonType: "lesson",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "lsn_loto_03",
    courseId: "crs_loto_full",
    title: "The 6-Step LOTO Process",
    order: 2,
    resourceIds: ["res_loto_03_narration", "res_loto_03_text", "res_loto_03_kc1", "res_loto_03_kc2"],
    knowledgeChecks: lesson3KCs,
    estimatedMinutes: 30,
    lessonType: "lesson",
    downloadableResources: [
      { title: "6-Step LOTO Procedure Poster", url: "#", fileType: "pdf" },
      { title: "Lockout Tagout Log Sheet", url: "#", fileType: "xlsx" },
    ],
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "lsn_loto_04",
    courseId: "crs_loto_full",
    title: "LOTO Equipment, Devices & Group Lockout",
    order: 3,
    resourceIds: ["res_loto_04_text", "res_loto_04_slides", "res_loto_04_kc1"],
    estimatedMinutes: 25,
    lessonType: "lesson",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "lsn_loto_05",
    courseId: "crs_loto_full",
    title: "Real-World Scenarios & Case Studies",
    order: 4,
    resourceIds: ["res_loto_05_narration", "res_loto_05_kc1"],
    estimatedMinutes: 20,
    lessonType: "lesson",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "lsn_loto_06",
    courseId: "crs_loto_full",
    title: "LOTO Final Assessment",
    order: 5,
    resourceIds: [],
    estimatedMinutes: 15,
    lessonType: "assessment",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
];

// ─── Resources ──────────────────────────────────────────────────────────────

export const lotoResources: Resource[] = [
  // ─── Lesson 1: Introduction to Lockout/Tagout ─────────────────────────────
  {
    id: "res_loto_01_text",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_01",
    type: "text",
    title: "Understanding Hazardous Energy",
    content: lesson1Content,
    order: 0,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_01_kc1",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_01",
    type: "knowledge-check",
    title: "Knowledge Check: Purpose of LOTO",
    knowledgeCheckData: kc_l1_purpose,
    order: 1,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },

  // ─── Lesson 2: OSHA 1910.147 Regulatory Requirements ─────────────────────
  {
    id: "res_loto_02_slides",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_02",
    type: "slides",
    title: "OSHA 1910.147 Regulatory Framework",
    slides: lesson2Slides,
    durationSec: 900,
    order: 0,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_02_kc1",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_02",
    type: "knowledge-check",
    title: "Knowledge Check: Regulatory Requirements",
    knowledgeCheckData: kc_l2_regulatory,
    order: 1,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },

  // ─── Lesson 3: The 6-Step LOTO Process ────────────────────────────────────
  {
    id: "res_loto_03_narration",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_03",
    type: "narrated-walkthrough",
    title: "The 6-Step LOTO Process — Narrated Walkthrough",
    narrationData: lesson3NarrationData,
    durationSec: 480,
    order: 0,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_03_text",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_03",
    type: "text",
    title: "The 6-Step LOTO Procedure — Reference Guide",
    content: lesson3TextContent,
    order: 1,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_03_kc1",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_03",
    type: "knowledge-check",
    title: "Knowledge Check: First Step",
    knowledgeCheckData: kc_l3_first_step,
    order: 2,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_03_kc2",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_03",
    type: "knowledge-check",
    title: "Knowledge Check: Verification",
    knowledgeCheckData: kc_l3_verification,
    order: 3,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },

  // ─── Lesson 4: LOTO Equipment, Devices & Group Lockout ───────────────────
  {
    id: "res_loto_04_text",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_04",
    type: "text",
    title: "LOTO Equipment & Group Lockout Procedures",
    content: lesson4TextContent,
    order: 0,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_04_slides",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_04",
    type: "slides",
    title: "LOTO Devices & Group Lockout",
    slides: lesson4Slides,
    durationSec: 600,
    order: 1,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_04_kc1",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_04",
    type: "knowledge-check",
    title: "Knowledge Check: Multi-Lock Hasps",
    knowledgeCheckData: kc_l4_hasp,
    order: 2,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },

  // ─── Lesson 5: Real-World Scenarios & Case Studies ────────────────────────
  {
    id: "res_loto_05_narration",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_05",
    type: "narrated-walkthrough",
    title: "Real-World LOTO Scenarios — Narrated Analysis",
    narrationData: lesson5NarrationData,
    durationSec: 360,
    order: 0,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
  {
    id: "res_loto_05_kc1",
    courseId: "crs_loto_full",
    lessonId: "lsn_loto_05",
    type: "knowledge-check",
    title: "Knowledge Check: E-Stop vs. LOTO",
    knowledgeCheckData: kc_l5_estop,
    order: 1,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
  },
];

// ─── Quiz ───────────────────────────────────────────────────────────────────

export const lotoQuiz: Quiz = {
  id: "qz_loto_full",
  courseId: "crs_loto_full",
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
