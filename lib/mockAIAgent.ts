import type { ChatMessage, GeneratedLesson, GeneratedQuiz } from "@/types";

// ============================================================================
// MOCK AI AGENT — Keyword-matching conversational AI for course generation
// ============================================================================

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
  // Editor-mode context
  isNewCourse?: boolean;
  currentCourseTitle?: string;
  currentCourseDescription?: string;
  currentLessonCount?: number;
  currentObjectives?: string[];
}

export interface AgentResponse {
  message: string;
  attachedOutline?: GeneratedLesson[];
  attachedSources?: string[];
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

// ============================================================================
// TOPIC TEMPLATES
// ============================================================================

const LOTO_TEMPLATE: GeneratedLesson[] = [
  {
    title: "Introduction to Lockout/Tagout",
    description: "Understanding the importance of energy isolation and LOTO fundamentals",
    contentType: "text",
    content: `# Introduction to Lockout/Tagout (LOTO)

## Course Overview

Welcome to this comprehensive training on Lockout/Tagout (LOTO) procedures. This course will equip you with the knowledge and skills necessary to safely control hazardous energy in the workplace, protecting both yourself and your coworkers from serious injury or death.

## What is Lockout/Tagout?

Lockout/Tagout (LOTO) refers to specific practices and procedures designed to safeguard employees from the unexpected energization, startup, or release of stored energy in machinery and equipment during service or maintenance activities.

**Lockout** uses an energy-isolating device (such as a lock) to physically hold a switch, valve, or lever in the off or safe position. **Tagout** uses a prominent warning tag on the energy-isolating device to alert workers that the equipment must not be operated.

## Why LOTO Matters

Failure to properly control hazardous energy accounts for nearly **10% of all serious workplace accidents** in general industry. Consider these statistics:

- **120 fatalities** and **50,000+ injuries** occur annually due to inadequate energy control
- The most common injuries include fractures, lacerations, amputations, and burns
- **OSHA Standard 29 CFR 1910.147** was created specifically to address these preventable incidents
- Proper LOTO compliance can prevent virtually all energy-related maintenance injuries

## Types of Hazardous Energy

LOTO applies to **ALL** forms of hazardous energy, not just electrical. Understanding every energy type present in your facility is critical:

| Energy Type | Examples | Isolation Method |
|-------------|----------|------------------|
| **Electrical** | Motors, control circuits, capacitors | Disconnect switches, breakers |
| **Mechanical** | Flywheels, springs, gears, belts | Blocks, pins, disconnects |
| **Hydraulic** | Pressurized lines, cylinders, accumulators | Valves, bleed lines |
| **Pneumatic** | Compressed air, gas lines | Valves, bleed/vent |
| **Chemical** | Pipelines, tanks, reactions | Valves, blanks, double-block-and-bleed |
| **Thermal** | Steam lines, hot surfaces, cryogenics | Valves, cool-down time |
| **Gravitational** | Raised loads, suspended platforms | Blocks, pins, lowering |

## Key Definitions

Understanding these terms is essential for the rest of this course:

- **Authorized Employee**: A person who locks out or tags out machines or equipment to perform servicing or maintenance. This person must be trained in the specific energy control procedures for each machine they work on.
- **Affected Employee**: An employee whose job requires them to operate or use a machine that is being serviced under LOTO, or who works in an area where servicing is being performed. Affected employees must be notified before and after LOTO is applied.
- **Other Employees**: Workers in the area who don't operate the machine but need to understand the purpose of LOTO devices and not tamper with them.
- **Energy Isolating Device**: A mechanical device that physically prevents the transmission or release of energy — includes circuit breakers, disconnect switches, line valves, and blocks.
- **Lockout Device**: A device that uses a positive means (such as a lock) to hold an energy-isolating device in a safe position, preventing energization.
- **Tagout Device**: A prominent warning device (tag) attached to an energy-isolating device to indicate that it must not be operated.

## When LOTO is Required

LOTO must be applied whenever an employee is required to:

1. Remove or bypass a guard or safety device
2. Place any body part into a danger zone of a machine
3. Perform servicing or maintenance where unexpected startup could cause injury

> **Important**: LOTO is NOT required for minor servicing activities that are routine, repetitive, and integral to the use of the equipment — but ONLY if alternative protective measures provide effective employee protection.`,
    duration: 20,
    skillsAddressed: ["skl_loto", "skl_001"],
    sourceAttributions: [],
    quizQuestions: [
      {
        question: "What does LOTO stand for?",
        options: ["Lock On/Turn Off", "Lockout/Tagout", "Look Out/Take Over", "Lock Out/Turn Out"],
        correctIndex: 1,
        explanation: "LOTO stands for Lockout/Tagout, the safety practice for controlling hazardous energy.",
      },
      {
        question: "Approximately how many fatalities occur annually due to inadequate energy control?",
        options: ["50", "120", "500", "1,000"],
        correctIndex: 1,
        explanation: "Approximately 120 fatalities and 50,000+ injuries occur annually due to inadequate hazardous energy control.",
      },
      {
        question: "Which of the following is NOT a type of hazardous energy covered by LOTO?",
        options: ["Electrical", "Gravitational", "Acoustic", "Thermal"],
        correctIndex: 2,
        explanation: "Acoustic energy is not one of the hazardous energy types addressed by LOTO. The main types are electrical, mechanical, hydraulic, pneumatic, chemical, thermal, and gravitational.",
      },
      {
        question: "Who is an 'Authorized Employee' in the context of LOTO?",
        options: [
          "Any employee in the building",
          "A person trained to lock out or tag out machines for servicing",
          "The facility manager only",
          "An employee whose job requires operating the machine being serviced",
        ],
        correctIndex: 1,
        explanation: "An Authorized Employee is specifically trained and authorized to lock out or tag out machines or equipment to perform servicing or maintenance.",
      },
    ],
  },
  {
    title: "OSHA 1910.147 Regulatory Requirements",
    description: "Regulatory framework, employer obligations, and compliance requirements",
    contentType: "text",
    content: `# OSHA 1910.147 — The Control of Hazardous Energy Standard

## Overview of the Standard

OSHA's Control of Hazardous Energy standard (29 CFR 1910.147) is the primary federal regulation governing lockout/tagout procedures in general industry. First published in 1989, this standard establishes minimum performance requirements for the control of hazardous energy during servicing and maintenance of machines and equipment.

## Scope and Application

The standard covers the servicing and maintenance of machines and equipment in which the **unexpected energization or startup, or the release of stored energy**, could harm employees. It applies to all general industry employers, with specific exceptions outlined below.

### The Standard Applies To:
- All servicing and maintenance activities where energy control is needed
- Both lockout and tagout systems (with preference for lockout)
- All forms of energy: electrical, mechanical, hydraulic, pneumatic, chemical, thermal, and others
- All authorized, affected, and other employees

### Exceptions:
- Construction, agriculture, and maritime (covered by other OSHA standards)
- Oil and gas well drilling and servicing
- Installations under exclusive control of electric utilities
- Exposure to electrical hazards from work on or near conductors (covered by Subpart S)

## Employer Responsibilities Under 1910.147

OSHA requires employers to establish a comprehensive energy control program that includes:

### 1. Energy Control Procedures (Written)
Every machine with hazardous energy must have a **written, machine-specific energy control procedure** that includes:
- The intended use of the procedure
- Steps for shutting down, isolating, blocking, and securing machines
- Steps for placement, removal, and transfer of lockout/tagout devices
- Requirements for testing machines to verify energy isolation

### 2. Lockout/Tagout Hardware
Employers must provide, at no cost to employees:
- Individually assigned locks (uniquely keyed)
- Standardized tags (consistent format, durable)
- Hasps, chains, wedges, key blocks, adapter pins, and other hardware
- All devices must be **durable** enough for the environment and **standardized** in color, shape, or size

### 3. Employee Training (Three Categories)

| Employee Category | Training Requirements |
|-------------------|----------------------|
| **Authorized** | Recognition of hazardous energy, type/magnitude of energy, methods/means of isolation and control |
| **Affected** | Purpose and use of energy control procedures, prohibition against restarting equipment |
| **Other** | Prohibition against removing locks/tags, prohibition against starting locked/tagged equipment |

### 4. Periodic Inspections
- Must be conducted **at least annually** for each energy control procedure
- Must be performed by an **authorized employee not involved** in the procedure being inspected
- Must include a **review between the inspector and authorized employees**
- Must be **documented** with: machine inspected, date, employees included, inspector identity

### 5. Documentation Requirements
Maintain records of:
- All written energy control procedures
- Training records for all employees (with dates and employee names)
- Periodic inspection records
- Any incidents or near-misses related to energy control

## Employee Responsibilities

Employees also have obligations under the standard:
- Follow all established energy control procedures
- Use only assigned lockout/tagout devices
- **Never** remove another worker's lock or tag
- **Never** attempt to operate equipment that is locked or tagged out
- Report any deviations, damaged devices, or unsafe conditions immediately
- Participate in required training and retraining

## Penalties for Non-Compliance

LOTO violations are consistently among OSHA's **top 10 most cited standards**. Penalties include:

| Violation Type | Maximum Penalty |
|---------------|----------------|
| Serious | $16,131 per violation |
| Willful or Repeated | $161,323 per violation |
| Failure to Abate | $16,131 per day |

> **Note**: These penalty amounts are adjusted annually for inflation. Multiple violations on a single inspection can result in penalties exceeding $1 million.`,
    duration: 25,
    skillsAddressed: ["skl_loto", "skl_001"],
    sourceAttributions: [],
    quizQuestions: [
      {
        question: "How often must energy control procedures be inspected under OSHA 1910.147?",
        options: ["Monthly", "Quarterly", "At least annually", "Every 2 years"],
        correctIndex: 2,
        explanation: "OSHA requires periodic inspections at least annually for each energy control procedure.",
      },
      {
        question: "Which of the following must be included in a written energy control procedure?",
        options: [
          "Employee social security numbers",
          "Steps for shutting down, isolating, and securing machines",
          "Building floor plans",
          "Employee vacation schedules",
        ],
        correctIndex: 1,
        explanation: "Written energy control procedures must include steps for shutting down, isolating, blocking, and securing machines, as well as placement and removal of lockout/tagout devices.",
      },
      {
        question: "Who must conduct the annual periodic inspection?",
        options: [
          "The employee who normally performs the procedure",
          "An authorized employee NOT involved in the procedure being inspected",
          "An outside consultant only",
          "The equipment manufacturer",
        ],
        correctIndex: 1,
        explanation: "Periodic inspections must be performed by an authorized employee other than the one(s) utilizing the energy control procedure being inspected.",
      },
    ],
  },
  {
    title: "The 6-Step LOTO Process",
    description: "Complete walkthrough of the lockout/tagout procedure from preparation to verification",
    contentType: "text",
    content: `# The 6-Step LOTO Process

## Overview

The lockout/tagout process follows a strict sequence of six steps. Skipping or reordering any step can result in serious injury or death. Every authorized employee must be able to perform all six steps for every machine they are authorized to service.

---

## Step 1: Preparation

Before beginning any LOTO procedure, the authorized employee must:

1. **Identify the machine or equipment** to be serviced
2. **Locate the written energy control procedure** specific to that machine
3. **Identify ALL energy sources** — review equipment diagrams, piping/wiring schematics, and the machine-specific procedure
4. **Identify ALL energy-isolating devices** — switches, breakers, valves, blocks, etc.
5. **Gather all necessary LOTO devices** — locks, tags, hasps, chains, blocks, blanks
6. **Identify all affected employees** who will need to be notified

### Common Mistakes in Preparation:
- Failing to identify **stored energy** (springs, capacitors, elevated components)
- Not reviewing the machine-specific procedure (relying on memory)
- Missing an energy source (especially secondary or backup systems)

---

## Step 2: Notification

All affected employees must be notified that LOTO is being applied. The notification must include:

- **Who** is performing the lockout (name of authorized employee)
- **What** machine or equipment is being locked out
- **Why** the lockout is necessary (type of servicing being performed)
- **How long** the lockout is expected to last

> This is a legal requirement, not a courtesy. Affected employees must know they cannot operate the equipment.

---

## Step 3: Machine Shutdown

Shut down the machine or equipment using the **normal stopping procedure**:

- Use the stop button, switch, or other normal controls
- **Never** use the energy-isolating device as the shutdown mechanism
- Allow all moving parts to come to a complete stop
- Ensure the machine is in a safe, neutral position

**Why normal shutdown?** Using the energy-isolating device for shutdown can cause equipment damage, unexpected movements, or release of stored energy.

---

## Step 4: Energy Isolation

After normal shutdown, isolate all energy sources:

- **Electrical**: Open disconnects, trip breakers, remove fuses
- **Hydraulic**: Close valves, bleed lines, block cylinders
- **Pneumatic**: Close supply valves, vent/bleed lines
- **Mechanical**: Disengage clutches, install blocks/pins under raised components
- **Chemical**: Close valves, install blanks/blinds, drain lines
- **Thermal**: Close valves, allow cool-down period
- **Gravitational**: Lower loads, install supports/blocks

### Stored Energy
After isolation, all **stored or residual energy** must be relieved, disconnected, restrained, or otherwise rendered safe:
- Capacitors must be discharged
- Springs must be released or blocked
- Elevated machine parts must be lowered or supported
- Hydraulic/pneumatic accumulators must be bled
- Pressurized lines must be vented and drained

---

## Step 5: Lockout/Tagout Application

Apply your lockout/tagout devices to **every** energy-isolating device:

### Lock Application Rules:
- Use **your personal, individually keyed lock** — never a shared lock
- Each authorized employee applies **their own lock** to each isolation point
- If multiple workers are involved, use a **group lockout hasp** (multi-lock hasp)
- Locks must be **substantial enough** to prevent removal without excessive force
- Locks must be **standardized** (same color, size, or shape across the facility)

### Tag Application Rules:
- Attach a tag to each energy-isolating device alongside the lock
- Tags must include: employee name, date, reason for lockout, expected duration
- Tags must be **non-reusable, self-locking, and hand-writable**
- Tags must be attached with a single-use, non-releasable cable tie (minimum 50 lb pull strength)

> ⚠️ **Tags alone are not sufficient.** OSHA requires locks wherever possible. Tags may only be used alone when the energy-isolating device cannot accept a lock AND the employer demonstrates full compliance with additional tagout provisions.

---

## Step 6: Verification

This is the **most critical safety step** — and the one most often skipped.

### Verification Procedure:
1. Ensure all personnel are clear of danger zones
2. Verify that all controls are in the neutral or off position
3. **Attempt to restart the machine** using normal operating controls
4. Test for residual energy:
   - Use a voltmeter to check for electrical energy
   - Check pressure gauges for hydraulic/pneumatic energy
   - Visually confirm no movement of mechanical components
5. Return all controls to the neutral or off position after testing

### Why Verification Matters:
- Confirms that ALL energy sources have been effectively isolated
- Catches missed energy sources or improperly applied isolation devices
- Provides the final safety check before maintenance begins
- Without verification, you cannot be certain the machine is safe

> ⚠️ **Never skip verification. Never assume isolation is complete.** Over 30% of LOTO-related injuries occur because verification was not performed.

---

## Removing LOTO Devices (Restoration)

When servicing is complete, follow this sequence:

1. Remove all tools, materials, and non-essential items from the machine
2. Ensure all guards and safety devices are reinstalled
3. Verify all employees are safely positioned away from danger zones
4. Notify all affected employees that LOTO devices are being removed
5. **Only the employee who applied the lock may remove it** (exceptions require specific employer procedures)
6. Restore energy to the machine and test for normal operation`,
    duration: 30,
    skillsAddressed: ["skl_loto", "skl_001"],
    sourceAttributions: [],
    quizQuestions: [
      {
        question: "What is the correct order of the 6-step LOTO process?",
        options: [
          "Shutdown → Lockout → Verification",
          "Preparation → Notification → Shutdown → Isolation → Lockout/Tagout → Verification",
          "Notification → Isolation → Lockout → Shutdown",
          "Isolation → Lockout → Notification → Verification",
        ],
        correctIndex: 1,
        explanation: "The 6 steps are: Preparation, Notification, Shutdown, Isolation, Lockout/Tagout, Verification.",
      },
      {
        question: "Why should you NOT use the energy-isolating device to shut down the machine?",
        options: [
          "It takes too long",
          "It can cause equipment damage, unexpected movements, or release of stored energy",
          "It is against company policy only",
          "Energy-isolating devices don't have off switches",
        ],
        correctIndex: 1,
        explanation: "Using the energy-isolating device for shutdown can cause equipment damage, unexpected movements, or release of stored energy. Always use normal stopping procedures first.",
      },
      {
        question: "What must you do during the verification step?",
        options: [
          "Sign the tag and walk away",
          "Notify your supervisor by email",
          "Attempt to restart the machine and test for residual energy",
          "Remove the lockout devices and test the machine",
        ],
        correctIndex: 2,
        explanation: "Verification requires attempting to restart the machine using normal controls and testing for residual energy to confirm all sources have been isolated.",
      },
      {
        question: "Who is allowed to remove a lockout device?",
        options: [
          "Any supervisor on duty",
          "The employee who applied it (or through specific employer procedures)",
          "The safety manager only",
          "Anyone with a master key",
        ],
        correctIndex: 1,
        explanation: "Only the employee who applied the lock may remove it, unless specific employer removal procedures are followed as outlined in OSHA 1910.147.",
      },
    ],
  },
  {
    title: "LOTO Equipment, Devices & Group Lockout",
    description: "Understanding locks, tags, hasps, and group lockout procedures for complex maintenance",
    contentType: "text",
    content: `# LOTO Equipment, Devices & Group Lockout

## Lockout Devices

### Padlocks (Most Common)
Padlocks are the primary lockout device used in most facilities. Requirements include:
- **Individually keyed** — no two locks share the same key
- **Uniquely identifiable** — each authorized employee's lock must be distinguishable (often by color, label, or engraved name)
- **Durable** — must withstand the environment where they are used (e.g., corrosion-resistant for outdoor/wet locations)
- **Substantial** — cannot be removed without excessive force or bolt cutters
- **Dedicated** — LOTO locks must ONLY be used for LOTO; never use them for lockers, toolboxes, etc.

### Cable Locks
Used when padlocks cannot be applied:
- Ideal for gate valves, oversized breakers, and multi-point lockouts
- Flexible cable threads through multiple isolation points
- Must meet the same durability and identification requirements as padlocks

### Group Lockout Hasps (Multi-Lock Hasps)
Used when multiple employees are performing servicing on the same machine:
- Each authorized employee places their **own personal lock** on the hasp
- The machine cannot be re-energized until **every lock is removed**
- Provides individual protection for every worker involved
- A designated "primary authorized employee" coordinates the group lockout

## Tagout Devices

Tags serve as a **warning** but do NOT provide the physical restraint that locks provide. Requirements:

- Must include: **employee name, date, department, reason, expected duration**
- Must be **non-reusable** (write-once)
- Must be **durable** for the environment (weather-resistant if used outdoors)
- Must be attached with a **single-use, non-releasable attachment** (minimum 50 lb tensile strength)
- Must be **standardized** — uniform print and format throughout the facility
- Must include a **warning statement** such as "DO NOT OPERATE" or "DANGER — DO NOT ENERGIZE"

> ⚠️ **Tags alone are NEVER as safe as locks.** OSHA considers tagout an inferior method and requires additional measures when tags are used without locks.

## Specialized Lockout Devices

| Device | Application |
|--------|-------------|
| **Ball Valve Lockout** | Locks ball valve handle in closed position |
| **Gate Valve Lockout** | Encases gate valve handwheel to prevent turning |
| **Circuit Breaker Lockout** | Clamps over breaker to prevent resetting |
| **Plug Lockout** | Encases electrical plug so it cannot be inserted |
| **Pneumatic Lockout** | Locks pneumatic disconnect in off position |
| **Push Button Lockout** | Covers emergency stop or start buttons |
| **Blind Flange/Blank** | Inserts metal plate in pipe flange to block flow |

## Group Lockout/Tagout Procedures

Complex maintenance operations often require **group lockout**, where multiple authorized employees work on the same machine or system.

### Primary Authorized Employee
One person is designated as the **primary authorized employee** who:
1. Coordinates the initial lockout of the machine/system
2. Ensures all energy sources are properly isolated and verified
3. Manages the group lockout box or board
4. Coordinates final removal of all devices when work is complete

### Group Lockout Process
1. Primary authorized employee performs full LOTO procedure
2. Places machine keys in a **group lockout box**
3. Each authorized employee places their personal lock on the group lockout box
4. Each employee performs their own verification before starting work
5. As each employee finishes, they remove their lock from the box
6. Only when ALL locks are removed does the primary employee restore energy

## Shift Change Procedures

When lockout must continue across shift changes:
1. **Outgoing** shift ensures all devices remain in place
2. **Incoming** authorized employee applies their lock BEFORE the outgoing employee removes theirs
3. Continuity of protection must be maintained at all times — there must never be a gap

## PPE Requirements During LOTO

Even with LOTO properly applied, additional PPE may be required:

- **Safety glasses** — always required in maintenance areas
- **Insulated gloves** — when working near electrical components
- **Arc-flash protection** — required when energized testing is necessary (NFPA 70E)
- **Hard hat** — when working under elevated components
- **Steel-toed boots** — standard requirement in maintenance work areas`,
    duration: 25,
    skillsAddressed: ["skl_loto", "skl_001"],
    sourceAttributions: [],
    quizQuestions: [
      {
        question: "What is the minimum tensile strength required for tag attachment devices?",
        options: ["10 lbs", "25 lbs", "50 lbs", "100 lbs"],
        correctIndex: 2,
        explanation: "OSHA requires tag attachments to have a minimum tensile strength of 50 lbs to prevent accidental removal.",
      },
      {
        question: "In a group lockout, when can the primary authorized employee restore energy?",
        options: [
          "When the supervisor gives permission",
          "After the shift ends",
          "Only when ALL personal locks have been removed from the group lockout box",
          "When at least half the locks are removed",
        ],
        correctIndex: 2,
        explanation: "Energy can only be restored when every authorized employee has removed their personal lock, ensuring no one is still working on the machine.",
      },
      {
        question: "Why are tags alone considered an inferior method compared to locks?",
        options: [
          "Tags are more expensive",
          "Tags provide a warning but NOT physical restraint against energization",
          "Tags cannot be standardized",
          "Tags are difficult to read",
        ],
        correctIndex: 1,
        explanation: "Tags provide only a warning — they do not physically prevent someone from operating the energy-isolating device. Locks provide positive physical restraint.",
      },
    ],
  },
  {
    title: "Real-World Scenarios & Case Studies",
    description: "Analyzing LOTO incidents, near-misses, and best practices from the field",
    contentType: "text",
    content: `# Real-World Scenarios & Case Studies

## Why Case Studies Matter

Understanding real incidents helps reinforce why every step of LOTO matters. The following scenarios are based on actual OSHA investigation reports and illustrate common failures that led to serious injuries or fatalities.

---

## Case Study 1: The Missing Energy Source

### Scenario
A maintenance technician was tasked with replacing a conveyor belt in a food processing plant. The technician locked out the main electrical disconnect but failed to identify that the conveyor also had a **pneumatic tensioning system**. While the technician was working between the rollers, the pneumatic system activated, crushing their hand.

### Root Cause Analysis
- The written procedure did not list the pneumatic energy source
- The technician did not perform the **preparation step** thoroughly
- The facility had recently modified the conveyor to add pneumatic tensioning but never updated the energy control procedure

### Lessons Learned
- **Always review and update** energy control procedures when equipment is modified
- **Identify ALL energy sources** during preparation — not just the obvious ones
- **Periodic inspections** should catch outdated procedures

---

## Case Study 2: Skipped Verification

### Scenario
An electrician locked out a motor control center (MCC) to replace a contactor. He applied his lock and tag to the disconnect switch and began working. However, the machine was fed by **two separate circuits** — the second circuit was still energized. The electrician received a serious electrical shock.

### Root Cause Analysis
- The electrician did not perform **verification** (Step 6)
- A simple voltage test would have revealed the second live circuit
- The written procedure listed both circuits, but the technician relied on memory

### Lessons Learned
- **Never skip verification** — it is the last line of defense
- **Always use a voltmeter** to confirm zero energy before touching conductors
- **Follow the written procedure** every time — don't rely on memory or experience

---

## Case Study 3: Unauthorized Lock Removal

### Scenario
A weekend maintenance crew needed to test a packaging machine. An employee from the day shift had left their LOTO lock in place because the job was not complete. The weekend supervisor used bolt cutters to remove the lock so the machine could be tested. Monday morning, the day-shift employee returned and began working on the machine, not knowing it had been re-energized.

### Root Cause Analysis
- A supervisor **violated LOTO rules** by removing another employee's lock
- No proper lock removal procedure was followed
- The day-shift employee was not notified

### Lessons Learned
- **Only the person who applied the lock may remove it**
- If an employee is unavailable, the employer's **specific lock removal procedure** must be followed (including verifying the employee is not at the facility, all reasonable efforts to contact them, and notification before next shift)
- **Never bypass LOTO for production pressure**

---

## Case Study 4: Successful LOTO — Best Practice

### Scenario
A team of four maintenance technicians at a chemical plant needed to replace a pump on a pressurized cooling water system. The primary authorized employee:

1. Reviewed the machine-specific procedure with the team
2. Identified 6 energy sources (electrical, hydraulic pressure, gravitational, stored spring energy, chemical, thermal)
3. Notified all 12 affected employees in the area
4. Performed normal shutdown, isolated all 6 energy sources
5. Applied group lockout — each technician placed their lock on the hasp
6. **Each technician independently verified** zero energy at their work location
7. Work completed safely over 3 shifts with proper shift-change lockout transfers

### Why It Worked
- Thorough preparation identified all energy sources
- Group lockout ensured individual protection
- Independent verification by each worker
- Proper shift-change procedures maintained continuous protection

---

## Common LOTO Violations (OSHA Top Citations)

Based on recent OSHA inspection data, the most commonly cited LOTO violations are:

1. **No written energy control procedures** (or procedures are too generic)
2. **Inadequate employee training** (no retraining after procedure changes)
3. **No periodic inspections** conducted
4. **Using tagout when lockout is feasible**
5. **Failure to identify all energy sources**
6. **No verification step** in the procedure
7. **Locks/tags not individually identifiable**
8. **No group lockout procedure** for multi-person jobs

---

## Near-Miss Reporting

Every LOTO near-miss is an opportunity to prevent a future incident. Report near-misses when you observe:

- A machine started while someone was still working on it
- An energy source was discovered that wasn't in the written procedure
- A lock or tag was found removed without authorization
- A verification step revealed unexpected energy
- Equipment modifications were made without updating the energy control procedure`,
    duration: 25,
    skillsAddressed: ["skl_loto", "skl_001"],
    sourceAttributions: [],
    quizQuestions: [
      {
        question: "In Case Study 1, what was the root cause of the incident?",
        options: [
          "The technician wasn't wearing PPE",
          "A pneumatic energy source was not identified in the preparation step",
          "The conveyor belt was defective",
          "The technician's lock was faulty",
        ],
        correctIndex: 1,
        explanation: "The root cause was failing to identify the pneumatic tensioning system as an energy source during the preparation step. The written procedure had not been updated after the equipment modification.",
      },
      {
        question: "What is the most commonly cited LOTO violation by OSHA?",
        options: [
          "Using the wrong color lock",
          "No written energy control procedures (or too generic)",
          "Not wearing hard hats",
          "Insufficient break time during maintenance",
        ],
        correctIndex: 1,
        explanation: "The most commonly cited LOTO violation is having no written energy control procedures, or procedures that are too generic and not machine-specific.",
      },
      {
        question: "When can a supervisor remove another employee's LOTO lock?",
        options: [
          "Whenever production demands it",
          "Only by following the employer's specific lock removal procedure, including verification the employee is not present and all contact efforts exhausted",
          "When the shift ends",
          "A supervisor can never remove another employee's lock",
        ],
        correctIndex: 1,
        explanation: "An employer's lock removal procedure must include: verifying the employee is not at the facility, making all reasonable efforts to contact them, and ensuring the employee is informed before their next shift.",
      },
    ],
  },
  {
    title: "LOTO Final Assessment",
    description: "Comprehensive knowledge check on all LOTO topics covered in this course",
    contentType: "quiz",
    content: `# LOTO Final Assessment

## Instructions

This comprehensive assessment covers all material from the Lockout/Tagout Safety Procedures course. You must score **80% or higher** to pass and receive credit for this training.

- **Total Questions**: 8
- **Passing Score**: 80% (minimum 7 correct)
- **Attempts**: You may retake this assessment if needed
- **Time Limit**: No time limit — review your notes and course materials as needed

Good luck!`,
    duration: 20,
    skillsAddressed: ["skl_loto", "skl_001"],
    quizQuestions: [
      {
        question: "Who may remove a lockout/tagout device?",
        options: [
          "Any supervisor",
          "The employee who applied it (or through specific employer procedures)",
          "The safety manager only",
          "Anyone with a master key",
        ],
        correctIndex: 1,
        explanation: "Only the employee who applied the lock may remove it, unless specific employer removal procedures are followed as outlined in OSHA 1910.147.",
      },
      {
        question: "What is the purpose of the verification step in the LOTO process?",
        options: [
          "To document the procedure for records",
          "To notify coworkers that work is complete",
          "To confirm all energy has been effectively isolated before work begins",
          "To apply the final lock to the isolation device",
        ],
        correctIndex: 2,
        explanation: "Verification confirms that all energy has been effectively isolated, providing the final safety check before maintenance work begins.",
      },
      {
        question: "A maintenance technician needs to service a machine that has both electrical and pneumatic energy. What must they do?",
        options: [
          "Only lock out the electrical — pneumatic is not hazardous",
          "Lock out both the electrical disconnect and the pneumatic supply valve",
          "Lock out the electrical and put a tag on the pneumatic",
          "Just turn off the main power switch",
        ],
        correctIndex: 1,
        explanation: "ALL energy sources must be locked out, including both electrical and pneumatic. Every energy-isolating device on the machine requires a lock.",
      },
      {
        question: "During a shift change, when can the outgoing employee remove their LOTO lock?",
        options: [
          "Before the incoming employee arrives",
          "Only after the incoming employee has applied their lock",
          "At the end of their shift regardless",
          "They don't need to — the incoming employee uses the same lock",
        ],
        correctIndex: 1,
        explanation: "Continuity of protection must be maintained. The incoming employee must apply their lock BEFORE the outgoing employee removes theirs — there must never be a gap in protection.",
      },
      {
        question: "Which of the following is a stored energy source that must be addressed during LOTO?",
        options: [
          "A running conveyor belt",
          "A compressed spring in a machine guard",
          "An operating control panel",
          "A lit indicator light",
        ],
        correctIndex: 1,
        explanation: "Compressed springs are a source of stored mechanical energy that can release unexpectedly. They must be released or blocked during the isolation step.",
      },
      {
        question: "How should energy control procedures be documented?",
        options: [
          "Verbally communicated to each shift",
          "Written, machine-specific procedures that include all energy sources and isolation steps",
          "Posted on a general safety bulletin board",
          "Kept in the supervisor's office for reference",
        ],
        correctIndex: 1,
        explanation: "OSHA requires written, machine-specific energy control procedures that detail all energy sources, isolation methods, and LOTO steps for each piece of equipment.",
      },
      {
        question: "An employee discovers that a machine was recently modified to include a new hydraulic cylinder, but the LOTO procedure hasn't been updated. What should they do?",
        options: [
          "Proceed with the existing procedure — it's close enough",
          "Stop work, report the discrepancy, and request the procedure be updated before servicing",
          "Add a handwritten note to the existing procedure",
          "Only lock out the hydraulic cylinder and ignore the rest",
        ],
        correctIndex: 1,
        explanation: "Work must stop when procedures don't match the actual equipment. The energy control procedure must be updated to include ALL current energy sources before any servicing is performed.",
      },
      {
        question: "Under OSHA 1910.147, what is the maximum penalty for a willful LOTO violation?",
        options: [
          "$7,000 per violation",
          "$16,131 per violation",
          "$70,000 per violation",
          "$161,323 per violation",
        ],
        correctIndex: 3,
        explanation: "Willful or repeated LOTO violations can result in penalties up to $161,323 per violation. LOTO is consistently among OSHA's top 10 most cited standards.",
      },
    ],
  },
];

const CONFINED_SPACE_TEMPLATE: GeneratedLesson[] = [
  {
    title: "Understanding Confined Spaces",
    description: "Classification and identification of confined spaces",
    contentType: "text",
    content:
      "# Understanding Confined Spaces\n\n## Definition\nA confined space:\n- Is large enough for a worker to enter\n- Has limited means of entry/exit\n- Is **not** designed for continuous occupancy\n\n## Examples\n- Tanks, vessels, silos\n- Pipelines, sewers\n- Manholes, vaults\n- Storage bins, hoppers\n\n## Permit-Required vs Non-Permit\n\n| Feature | Permit-Required | Non-Permit |\n|---------|----------------|------------|\n| Hazardous atmosphere | Possible | No |\n| Engulfment hazard | Possible | No |\n| Converging walls | Possible | No |\n| Entry permit needed | Yes | No |",
    duration: 20,
    skillsAddressed: ["skl_confined_space"],
    sourceAttributions: [],
    quizQuestions: [
      {
        question: "Which of the following is NOT a characteristic of a confined space?",
        options: ["Large enough for worker entry", "Limited entry/exit", "Designed for continuous occupancy", "Not designed for continuous occupancy"],
        correctIndex: 2,
        explanation: "Confined spaces are NOT designed for continuous occupancy.",
      },
    ],
  },
  {
    title: "Entry Permits & Pre-Entry Procedures",
    description: "Required permits and atmospheric testing",
    contentType: "text",
    content:
      "# Entry Permits & Pre-Entry Procedures\n\n## Atmospheric Testing (in order)\n1. **Oxygen**: 19.5% - 23.5% acceptable\n2. **Flammability**: Below 10% LEL\n3. **Toxicity**: Below PEL for known contaminants\n\n## Entry Permit Requirements\n- Space identification and location\n- Purpose of entry and authorized duration\n- Names of entrants and attendants\n- Atmospheric test results\n- Rescue and emergency procedures\n- Communication methods\n\n## Roles\n- **Entry Supervisor**: Authorizes the permit\n- **Entrant**: The worker entering the space\n- **Attendant**: Monitors from outside, never enters",
    duration: 25,
    skillsAddressed: ["skl_confined_space"],
    sourceAttributions: [],
  },
  {
    title: "Hazard Controls & Ventilation",
    description: "Methods for making confined spaces safe for entry",
    contentType: "text",
    content:
      "# Hazard Controls & Ventilation\n\n## Hierarchy of Controls\n1. **Elimination**: Can the work be done from outside?\n2. **Engineering controls**: Ventilation, isolation, inerting\n3. **Administrative controls**: Permits, training, procedures\n4. **PPE**: Last resort, but always required\n\n## Ventilation\n- **Forced air** ventilation is the most common control\n- Must provide at least **20 air changes per hour**\n- Continue ventilation during entire entry\n- Monitor atmosphere continuously\n\n## Isolation\n- Blank or blind all lines into the space\n- Lock out all energy sources (reference LOTO procedures)\n- Verify isolation effectiveness",
    duration: 20,
    skillsAddressed: ["skl_confined_space"],
    sourceAttributions: [],
  },
  {
    title: "Emergency Rescue Procedures",
    description: "Rescue planning and execution",
    contentType: "text",
    content:
      "# Emergency Rescue Procedures\n\n## Non-Entry Rescue (Preferred)\n- Use mechanical retrieval systems\n- Tripod and winch for vertical entries\n- Chest/full-body harness with retrieval line\n\n## Entry Rescue\n- Only by trained rescue teams\n- Never attempt untrained rescue\n- Most confined space fatalities are would-be rescuers\n\n## Emergency Equipment\n- Self-contained breathing apparatus (SCBA)\n- Supplied air respirators\n- First aid supplies\n- Communication equipment\n\n> ⚠️ **60% of confined space fatalities are rescuers.** Never enter to rescue without proper training and equipment.",
    duration: 20,
    skillsAddressed: ["skl_confined_space"],
    sourceAttributions: [],
    quizQuestions: [
      {
        question: "What percentage of confined space fatalities involve would-be rescuers?",
        options: ["20%", "40%", "60%", "80%"],
        correctIndex: 2,
        explanation: "Approximately 60% of confined space deaths involve would-be rescuers who were not properly trained or equipped.",
      },
    ],
  },
];

const PPE_TEMPLATE: GeneratedLesson[] = [
  {
    title: "PPE Fundamentals",
    description: "Overview of personal protective equipment categories",
    contentType: "text",
    content:
      "# Personal Protective Equipment (PPE) Fundamentals\n\n## What is PPE?\nEquipment worn to minimize exposure to hazards that can cause serious injuries or illnesses.\n\n## Categories of PPE\n\n### Head Protection\n- Hard hats (Type I: top impact, Type II: top + lateral)\n- Bump caps for low-hazard areas\n\n### Eye & Face Protection\n- Safety glasses, goggles, face shields\n- Welding helmets for arc hazards\n\n### Hand Protection\n- Chemical-resistant gloves\n- Cut-resistant gloves\n- Insulated gloves for electrical work\n\n### Foot Protection\n- Steel/composite toe boots\n- Metatarsal guards\n- Slip-resistant soles\n\n### Respiratory Protection\n- N95 respirators\n- Half/full face respirators\n- Supplied air systems",
    duration: 20,
    skillsAddressed: [],
    sourceAttributions: [],
    quizQuestions: [
      {
        question: "What type of hard hat provides both top and lateral impact protection?",
        options: ["Type I", "Type II", "Type III", "Bump cap"],
        correctIndex: 1,
        explanation: "Type II hard hats protect against both top and lateral impacts.",
      },
    ],
  },
  {
    title: "Hazard Assessment & PPE Selection",
    description: "How to assess hazards and select appropriate PPE",
    contentType: "text",
    content:
      "# Hazard Assessment & PPE Selection\n\n## The PPE Selection Process\n\n1. **Survey the workplace** — Identify sources of hazards\n2. **Analyze the hazards** — Determine risk level for each\n3. **Select PPE** — Match protection to hazard type and level\n4. **Document** — Written hazard assessment certification\n\n## Common Hazard Types\n\n| Hazard | PPE Required |\n|--------|-------------|\n| Impact | Hard hat, safety glasses, steel toes |\n| Chemical splash | Goggles, chemical gloves, apron |\n| Electrical | Insulated gloves, arc-rated clothing |\n| Noise (>85 dB) | Earplugs or earmuffs |\n| Respiratory | Appropriate respirator for contaminant |",
    duration: 20,
    skillsAddressed: [],
    sourceAttributions: [],
  },
  {
    title: "PPE Care, Maintenance & Limitations",
    description: "Proper inspection, cleaning, and storage of PPE",
    contentType: "text",
    content:
      "# PPE Care, Maintenance & Limitations\n\n## Daily Inspection\n- Check for cracks, tears, or degradation **before each use**\n- Replace damaged PPE immediately\n- Never modify or alter PPE\n\n## Cleaning & Storage\n- Follow manufacturer's cleaning instructions\n- Store in clean, dry locations\n- Keep away from direct sunlight (UV degrades many materials)\n\n## Limitations\n- PPE is the **last line of defense** in the hierarchy of controls\n- PPE only protects when worn correctly\n- No single PPE protects against all hazards\n- Training is required before using any PPE",
    duration: 15,
    skillsAddressed: [],
    sourceAttributions: [],
    quizQuestions: [
      {
        question: "Where does PPE fall in the hierarchy of controls?",
        options: ["First line of defense", "Second line", "Third line", "Last line of defense"],
        correctIndex: 3,
        explanation: "PPE is the last line of defense — elimination, engineering controls, and administrative controls should be considered first.",
      },
    ],
  },
];

const FORKLIFT_TEMPLATE: GeneratedLesson[] = [
  {
    title: "Forklift Operations Basics",
    description: "Types of forklifts and basic operation principles",
    contentType: "text",
    content:
      "# Forklift Operations Basics\n\n## Types of Powered Industrial Trucks\n- **Class 1**: Electric motor, sit-down rider\n- **Class 4**: Internal combustion engine, cushion tire\n- **Class 5**: Internal combustion engine, pneumatic tire\n\n## Key Operating Principles\n- Always perform pre-shift inspection\n- Never exceed rated capacity\n- Travel with forks 4-6 inches from the ground\n- Sound horn at intersections and blind spots\n- Yield to pedestrians at all times",
    duration: 20,
    skillsAddressed: [],
    sourceAttributions: [],
  },
  {
    title: "Load Handling & Stability",
    description: "Safe load handling and the stability triangle",
    contentType: "text",
    content:
      "# Load Handling & Stability\n\n## The Stability Triangle\nForklifts balance on a three-point suspension system. The center of gravity must remain within this triangle.\n\n## Safe Loading Practices\n1. Center the load on forks\n2. Tilt mast back slightly\n3. Check load weight against capacity plate\n4. Raise forks only high enough to clear obstacles\n5. Never add counterweight",
    duration: 25,
    skillsAddressed: [],
    sourceAttributions: [],
    quizQuestions: [
      {
        question: "What happens if the center of gravity moves outside the stability triangle?",
        options: ["Nothing", "The forklift may tip over", "Speed increases", "Load capacity doubles"],
        correctIndex: 1,
        explanation: "If the combined center of gravity shifts outside the stability triangle, the forklift may tip over.",
      },
    ],
  },
  {
    title: "Pedestrian Safety & Traffic Management",
    description: "Preventing forklift-pedestrian incidents",
    contentType: "text",
    content:
      "# Pedestrian Safety & Traffic Management\n\n## Key Rules\n- Maintain safe speed (5 mph indoor, 10 mph outdoor)\n- Sound horn at **every** intersection\n- Designated pedestrian walkways must be respected\n- Never pass another forklift in the same aisle\n- Use spotters when visibility is limited\n\n## Common Incident Causes\n1. Inadequate visibility\n2. Excessive speed\n3. No horn at blind spots\n4. Pedestrians in forklift aisles\n5. Distraction (phone use, conversations)",
    duration: 20,
    skillsAddressed: [],
    sourceAttributions: [],
  },
];

const FIRE_SAFETY_TEMPLATE: GeneratedLesson[] = [
  {
    title: "Fire Prevention & Awareness",
    description: "Understanding fire hazards and prevention strategies",
    contentType: "text",
    content:
      "# Fire Prevention & Awareness\n\n## The Fire Triangle\nFire requires three elements:\n- **Heat**: Ignition source\n- **Fuel**: Combustible material\n- **Oxygen**: Air supply\n\nRemove any one element to prevent or extinguish a fire.\n\n## Common Workplace Fire Hazards\n- Electrical equipment and wiring\n- Flammable liquids and gases\n- Hot work (welding, cutting)\n- Combustible dust\n- Improper storage of materials",
    duration: 15,
    skillsAddressed: [],
    sourceAttributions: [],
  },
  {
    title: "Fire Extinguisher Use — PASS Method",
    description: "Proper fire extinguisher selection and operation",
    contentType: "text",
    content:
      "# Fire Extinguisher Use\n\n## Fire Classes\n| Class | Fuel Type | Extinguisher |\n|-------|-----------|-------------|\n| A | Ordinary combustibles | Water, foam |\n| B | Flammable liquids | CO2, dry chemical |\n| C | Electrical | CO2, dry chemical |\n| D | Combustible metals | Special agent |\n| K | Cooking oils | Wet chemical |\n\n## PASS Technique\n- **P**ull the pin\n- **A**im at the base of the fire\n- **S**queeze the handle\n- **S**weep side to side\n\n> Only fight a fire if it is **small**, you have a **clear exit**, and you have the **right extinguisher**.",
    duration: 20,
    skillsAddressed: [],
    sourceAttributions: [],
    quizQuestions: [
      {
        question: "What does the 'A' in the PASS technique stand for?",
        options: ["Attack the fire", "Aim at the base of the fire", "Aim at the top of the fire", "Alert others"],
        correctIndex: 1,
        explanation: "A = Aim at the base of the fire, where the fuel source is.",
      },
    ],
  },
  {
    title: "Emergency Evacuation Procedures",
    description: "Evacuation routes, assembly points, and responsibilities",
    contentType: "text",
    content:
      "# Emergency Evacuation Procedures\n\n## When to Evacuate\n- Fire alarm sounds\n- Verbal instruction from fire warden\n- You smell smoke or see fire\n- Building evacuation announcement\n\n## Evacuation Steps\n1. Stop work immediately\n2. Alert others nearby\n3. Activate nearest pull station if not yet activated\n4. Follow posted evacuation route\n5. **Do not use elevators**\n6. Close doors behind you (don't lock)\n7. Proceed to designated assembly point\n8. Report to your area warden for headcount\n\n## Fire Warden Responsibilities\n- Ensure area is clear\n- Assist persons with disabilities\n- Close fire doors\n- Report area status to incident commander",
    duration: 15,
    skillsAddressed: [],
    sourceAttributions: [],
  },
];

const GENERIC_TEMPLATE: GeneratedLesson[] = [
  {
    title: "Course Overview & Objectives",
    description: "Introduction to course goals and learning outcomes",
    contentType: "text",
    content:
      "# Course Overview\n\n## Learning Objectives\nBy the end of this course, you will be able to:\n- Understand the key concepts and terminology\n- Identify common hazards and risk factors\n- Apply proper procedures in your daily work\n- Demonstrate competency through assessment\n\n## Course Structure\nThis course consists of focused lessons covering theory, practical application, and assessment.",
    duration: 10,
    skillsAddressed: [],
    sourceAttributions: [],
  },
  {
    title: "Core Concepts & Procedures",
    description: "Key knowledge and standard procedures",
    contentType: "text",
    content:
      "# Core Concepts & Procedures\n\nThis lesson covers the foundational knowledge required for competency in this topic area.\n\n## Key Principles\n1. Always follow established procedures\n2. Report hazards and near-misses immediately\n3. Use required equipment and PPE\n4. Participate in regular training updates\n5. Know your emergency response procedures",
    duration: 20,
    skillsAddressed: [],
    sourceAttributions: [],
  },
  {
    title: "Knowledge Assessment",
    description: "Test your understanding of the material",
    contentType: "quiz",
    content: "# Knowledge Assessment\n\nComplete this assessment to verify your understanding. Minimum 80% required to pass.",
    duration: 15,
    skillsAddressed: [],
    quizQuestions: [
      {
        question: "What should you do when you identify a workplace hazard?",
        options: ["Ignore it", "Report it immediately", "Wait until next meeting", "Fix it yourself without training"],
        correctIndex: 1,
        explanation: "Always report hazards immediately to your supervisor or safety team.",
      },
    ],
  },
];

// ============================================================================
// KEYWORD MATCHING HELPERS
// ============================================================================

function matchesKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function getTemplateForContext(
  message: string,
  sourceTitles: string[]
): { template: GeneratedLesson[]; topic: string } {
  const combined = `${message} ${sourceTitles.join(" ")}`.toLowerCase();

  if (matchesKeywords(combined, ["loto", "lockout", "tagout", "energy isolation", "1910.147"])) {
    return { template: LOTO_TEMPLATE, topic: "Lockout/Tagout (LOTO)" };
  }
  if (matchesKeywords(combined, ["confined space", "permit space", "entry permit", "1910.146"])) {
    return { template: CONFINED_SPACE_TEMPLATE, topic: "Confined Space Entry" };
  }
  if (matchesKeywords(combined, ["ppe", "protective equipment", "gloves", "helmet", "respirat"])) {
    return { template: PPE_TEMPLATE, topic: "Personal Protective Equipment (PPE)" };
  }
  if (matchesKeywords(combined, ["forklift", "powered industrial", "pit", "truck"])) {
    return { template: FORKLIFT_TEMPLATE, topic: "Forklift Safety" };
  }
  if (matchesKeywords(combined, ["fire", "extinguish", "evacuat", "emergency exit"])) {
    return { template: FIRE_SAFETY_TEMPLATE, topic: "Fire Safety" };
  }

  return { template: GENERIC_TEMPLATE, topic: "Safety Training" };
}

// ============================================================================
// SETUP CONTEXT PARSER
// ============================================================================

interface ParsedSetup {
  topic: string;
  courseType: string;
  targetJobTitle: string;
  targetSkill: string;
  audienceLevel: string;
  librarySources: string;
  quizPlacement: "per-lesson" | "end-of-course" | "both";
  additionalContext: string;
}

function parseSetupContext(setupText: string): ParsedSetup {
  const result: ParsedSetup = {
    topic: "",
    courseType: "full-course",
    targetJobTitle: "",
    targetSkill: "",
    audienceLevel: "",
    librarySources: "",
    quizPlacement: "both",
    additionalContext: "",
  };
  for (const line of setupText.split("\n")) {
    if (line.startsWith("Topic:")) result.topic = line.replace("Topic:", "").trim();
    else if (line.startsWith("Course Type:")) result.courseType = line.replace("Course Type:", "").trim();
    else if (line.startsWith("Target Job Title:")) result.targetJobTitle = line.replace("Target Job Title:", "").trim();
    else if (line.startsWith("Target Skill:")) result.targetSkill = line.replace("Target Skill:", "").trim();
    else if (line.startsWith("Audience Level:")) result.audienceLevel = line.replace("Audience Level:", "").trim();
    else if (line.startsWith("Library Sources:")) result.librarySources = line.replace("Library Sources:", "").trim();
    else if (line.startsWith("Quiz Placement:")) {
      const val = line.replace("Quiz Placement:", "").trim();
      if (val === "per-lesson" || val === "end-of-course" || val === "both") {
        result.quizPlacement = val;
      }
    }
    else if (line.startsWith("Additional Context:")) result.additionalContext = line.replace("Additional Context:", "").trim();
  }
  return result;
}

// ============================================================================
// RICH DESCRIPTION GENERATOR
// ============================================================================

function generateRichDescription(topic: string, setup: ParsedSetup): string {
  const typeLabel = setup.courseType === "micro-lesson"
    ? "micro-lesson"
    : setup.courseType === "onboarding-path"
    ? "onboarding path"
    : "comprehensive training course";

  const audienceClause = setup.targetJobTitle
    ? `Designed specifically for **${setup.targetJobTitle}** personnel, this`
    : "This";

  const topicLower = topic.toLowerCase();

  if (matchesKeywords(topicLower, ["loto", "lockout", "tagout"])) {
    return `${audienceClause} ${typeLabel} provides in-depth coverage of Lockout/Tagout (LOTO) procedures as mandated by OSHA Standard 29 CFR 1910.147. Learners will master the identification of hazardous energy sources, the 6-step LOTO process, proper device selection, and verification procedures. The course integrates real-world scenarios, regulatory requirements, and organizational best practices drawn from your library sources.${setup.additionalContext ? `\n\nAdditional focus: ${setup.additionalContext}` : ""}`;
  }
  if (matchesKeywords(topicLower, ["confined space"])) {
    return `${audienceClause} ${typeLabel} covers all critical aspects of confined space entry, including space classification, atmospheric testing, entry permits, ventilation controls, and emergency rescue procedures. Content aligns with OSHA 1910.146 requirements and incorporates practical examples from your organization's documented procedures.${setup.additionalContext ? `\n\nAdditional focus: ${setup.additionalContext}` : ""}`;
  }
  if (matchesKeywords(topicLower, ["ppe", "protective equipment"])) {
    return `${audienceClause} ${typeLabel} equips workers with the knowledge to select, use, inspect, and maintain personal protective equipment across all major categories including head, eye, hand, foot, and respiratory protection. The course emphasizes hazard assessment methodology and proper PPE matching based on workplace risk profiles.${setup.additionalContext ? `\n\nAdditional focus: ${setup.additionalContext}` : ""}`;
  }
  if (matchesKeywords(topicLower, ["forklift"])) {
    return `${audienceClause} ${typeLabel} covers safe operation of powered industrial trucks including pre-shift inspections, the stability triangle, load handling, pedestrian safety, and traffic management. Content meets OSHA 1910.178 training requirements for authorized forklift operators.${setup.additionalContext ? `\n\nAdditional focus: ${setup.additionalContext}` : ""}`;
  }
  if (matchesKeywords(topicLower, ["fire"])) {
    return `${audienceClause} ${typeLabel} addresses fire prevention strategies, fire classification, extinguisher selection and the PASS technique, and emergency evacuation procedures. The training ensures all personnel can respond effectively to fire emergencies and understand their roles in the facility evacuation plan.${setup.additionalContext ? `\n\nAdditional focus: ${setup.additionalContext}` : ""}`;
  }

  return `${audienceClause} ${typeLabel} provides structured training on ${setup.topic || "key workplace topics"}, covering essential concepts, practical procedures, and assessment. Content is sourced from your organization's library and tailored to operational requirements.${setup.additionalContext ? `\n\nAdditional focus: ${setup.additionalContext}` : ""}`;
}

// ============================================================================
// OBJECTIVES GENERATOR
// ============================================================================

export function generateObjectivesForTopic(topic: string): string[] {
  if (matchesKeywords(topic, ["loto", "lockout", "tagout"])) {
    return [
      "Understand the purpose and scope of LOTO procedures",
      "Identify all types of hazardous energy in the workplace",
      "Execute the 6-step LOTO process correctly",
      "Select and use appropriate LOTO devices",
      "Recognize employer and employee responsibilities under OSHA 1910.147",
    ];
  }
  if (matchesKeywords(topic, ["confined space"])) {
    return [
      "Classify permit-required vs non-permit confined spaces",
      "Perform atmospheric testing in the correct order",
      "Complete entry permits with all required information",
      "Implement appropriate ventilation and isolation controls",
      "Execute non-entry rescue procedures",
    ];
  }
  if (matchesKeywords(topic, ["ppe", "protective equipment"])) {
    return [
      "Identify PPE categories and their applications",
      "Conduct a workplace hazard assessment for PPE selection",
      "Select the correct PPE for specific hazard types",
      "Inspect, maintain, and store PPE properly",
    ];
  }
  if (matchesKeywords(topic, ["forklift"])) {
    return [
      "Perform a pre-shift forklift inspection",
      "Understand the stability triangle and load handling",
      "Follow pedestrian safety and traffic management rules",
    ];
  }
  if (matchesKeywords(topic, ["fire"])) {
    return [
      "Identify common workplace fire hazards",
      "Select the correct fire extinguisher for each fire class",
      "Execute the PASS technique for fire extinguisher use",
      "Follow emergency evacuation procedures",
    ];
  }
  return [
    "Understand the key concepts and terminology",
    "Identify common hazards and risk factors",
    "Apply proper procedures in daily work",
    "Demonstrate competency through assessment",
  ];
}

// ============================================================================
// TAGS GENERATOR
// ============================================================================

function generateTagsForTopic(topic: string): string[] {
  if (matchesKeywords(topic, ["loto", "lockout", "tagout"])) {
    return ["LOTO", "Lockout/Tagout", "Energy Isolation", "OSHA", "Safety", "Maintenance"];
  }
  if (matchesKeywords(topic, ["confined space"])) {
    return ["Confined Space", "Permit Required", "Atmospheric Testing", "OSHA", "Rescue"];
  }
  if (matchesKeywords(topic, ["ppe", "protective equipment"])) {
    return ["PPE", "Personal Protective Equipment", "Hazard Assessment", "Safety Gear"];
  }
  if (matchesKeywords(topic, ["forklift"])) {
    return ["Forklift", "Powered Industrial Truck", "Warehouse Safety", "OSHA"];
  }
  if (matchesKeywords(topic, ["fire"])) {
    return ["Fire Safety", "Fire Prevention", "PASS Technique", "Evacuation", "Emergency Response"];
  }
  return ["Safety", "Training", "Compliance", "Workplace"];
}

// ============================================================================
// STANDARDS GENERATOR
// ============================================================================

function generateStandardsForTopic(topic: string): string[] {
  if (matchesKeywords(topic, ["loto", "lockout", "tagout"])) {
    return ["OSHA 29 CFR 1910.147", "ANSI/ASSE Z244.1", "NFPA 70E"];
  }
  if (matchesKeywords(topic, ["confined space"])) {
    return ["OSHA 29 CFR 1910.146", "ANSI Z117.1"];
  }
  if (matchesKeywords(topic, ["ppe", "protective equipment"])) {
    return ["OSHA 29 CFR 1910.132", "ANSI Z87.1", "ANSI Z89.1"];
  }
  if (matchesKeywords(topic, ["forklift"])) {
    return ["OSHA 29 CFR 1910.178", "ANSI/ITSDF B56.1"];
  }
  if (matchesKeywords(topic, ["fire"])) {
    return ["OSHA 29 CFR 1910.157", "NFPA 10", "NFPA 101"];
  }
  return ["OSHA General Duty Clause"];
}

// ============================================================================
// READING LEVEL DETECTOR
// ============================================================================

function detectReadingLevel(setup: ParsedSetup): "basic" | "standard" | "technical" {
  const role = setup.targetJobTitle.toLowerCase();
  if (role.includes("engineer") || role.includes("specialist") || role.includes("supervisor")) return "technical";
  if (role.includes("tech") || role.includes("operator") || role.includes("lead")) return "standard";
  return "standard";
}

// ============================================================================
// CATEGORY DETECTOR
// ============================================================================

export function detectCategory(topic: string): string {
  if (matchesKeywords(topic, ["loto", "lockout", "tagout", "confined space", "ppe", "fire", "safety", "hazard"])) return "Safety";
  if (matchesKeywords(topic, ["forklift", "equipment", "machine", "operat"])) return "Equipment";
  if (matchesKeywords(topic, ["onboard", "orient", "new hire"])) return "Onboarding";
  if (matchesKeywords(topic, ["compliance", "regulat", "osha"])) return "Compliance";
  return "Training";
}

// ============================================================================
// MAIN AGENT FUNCTION
// ============================================================================

export async function generateAgentResponse(params: {
  userMessage: string;
  conversationHistory: ChatMessage[];
  context: AgentContext;
}): Promise<AgentResponse> {
  const { userMessage, conversationHistory, context } = params;

  // Simulated delay (1-2 seconds)
  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

  const lowerMsg = userMessage.toLowerCase();
  const userMessageCount = conversationHistory.filter((m) => m.role === "user").length;

  // ══════════════════════════════════════════════════════════════════
  // NEW COURSE MODE — Auto-build from setup context
  // ══════════════════════════════════════════════════════════════════
  if (context.isNewCourse) {
    // Extract and parse context from the setup system message
    const setupMsg = conversationHistory.find(
      (m) => m.role === "system" && m.content.startsWith("Setup context:")
    );
    const setupText = setupMsg?.content || "";
    const setup = parseSetupContext(setupText);
    const allText = `${setupText} ${userMessage} ${context.selectedSourceTitles.join(" ")}`;

    // ── Auto-build trigger (first user message, typically "Build this course") ──
    // userMessageCount includes the current "Build this course" message, so check <= 1
    if (userMessageCount <= 1) {
      const { template, topic } = getTemplateForContext(allText, context.selectedSourceTitles);

      // Attach source IDs to lessons
      let lessonsWithSources = template.map((lesson) => ({
        ...lesson,
        sourceAttributions: context.selectedSourceIds,
        skillsAddressed: context.targetSkillName
          ? [...(lesson.skillsAddressed || []), context.targetSkillName].filter(
              (v, i, a) => a.indexOf(v) === i
            )
          : lesson.skillsAddressed,
      }));

      // Apply quiz placement filtering
      const placement = setup.quizPlacement;
      if (placement === "per-lesson") {
        // Remove the final assessment lesson entirely (contentType === "quiz")
        lessonsWithSources = lessonsWithSources.filter((l) => l.contentType !== "quiz");
      } else if (placement === "end-of-course") {
        // Strip quizQuestions from individual lessons, keep only the final assessment
        lessonsWithSources = lessonsWithSources.map((l) =>
          l.contentType === "quiz" ? l : { ...l, quizQuestions: undefined }
        );
      }
      // "both" — keep everything as-is

      const totalDuration = lessonsWithSources.reduce((sum, l) => sum + l.duration, 0);
      const quizCount = lessonsWithSources.filter((l) => l.quizQuestions && l.quizQuestions.length > 0).length;
      const objectives = generateObjectivesForTopic(allText);
      const category = detectCategory(allText);
      const allSkillIds = Array.from(
        new Set(lessonsWithSources.flatMap((l) => l.skillsAddressed || []))
      );

      // Build a rich, contextual title
      const typeLabel = setup.courseType === "micro-lesson" ? "Micro-Lesson" : setup.courseType === "onboarding-path" ? "Onboarding Path" : "Training Course";
      const courseTitle = `${topic} ${typeLabel}`;

      // Generate a rich, contextual description from setup data
      const richDescription = generateRichDescription(topic, setup);

      // Determine difficulty based on target role
      const difficulty: "beginner" | "intermediate" | "advanced" =
        setup.targetJobTitle.toLowerCase().includes("tech") ||
        setup.targetJobTitle.toLowerCase().includes("engineer") ||
        setup.targetJobTitle.toLowerCase().includes("specialist")
          ? "advanced"
          : setup.targetJobTitle.toLowerCase().includes("operator") ||
            setup.targetJobTitle.toLowerCase().includes("supervisor")
          ? "intermediate"
          : "intermediate";

      const totalQuestions = lessonsWithSources.reduce((sum, l) => sum + (l.quizQuestions?.length || 0), 0);
      const placementLabel = placement === "per-lesson" ? "After each lesson" : placement === "end-of-course" ? "Final assessment only" : "Lesson quizzes + final assessment";
      const readingLevelStr = detectReadingLevel(setup);
      const tagsStr = generateTagsForTopic(allText).join(", ");
      const standardsStr = generateStandardsForTopic(allText).join(", ");

      // Build audience targeting summary
      const targetParts: string[] = [];
      if (setup.targetJobTitle) targetParts.push(`**${setup.targetJobTitle}s**`);
      if (setup.targetSkill) targetParts.push(`**${setup.targetSkill}**`);
      const targetStr = targetParts.length > 0
        ? ` and targets ${targetParts.join(" who need ")}`
        : "";

      // Conversational summary
      let response = `I've analyzed your setup context and built your **${topic}** course. `;
      response += `It includes **${lessonsWithSources.length} lessons** (~${totalDuration} min), `;
      response += `**${quizCount} quizzes** with ${totalQuestions} questions${targetStr}.\n\n`;
      response += `All fields are now populated in the editor. You can edit any field directly on the left, ask me to refine lessons or adjust difficulty, or save when you're satisfied.\n\n`;
      response += `What would you like to adjust?\n\n`;

      // Collapsible course details
      response += `<details>\n<summary>📋 Course Details</summary>\n\n`;
      response += `| | |\n|---|---|\n`;
      response += `| **Quiz placement** | ${placementLabel} |\n`;
      response += `| **Learning objectives** | ${objectives.length} |\n`;
      response += `| **Difficulty** | ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} |\n`;
      response += `| **Reading level** | ${readingLevelStr.charAt(0).toUpperCase() + readingLevelStr.slice(1)} |\n`;
      response += `| **Category** | ${category} |\n`;
      if (setup.targetJobTitle) {
        response += `| **Target audience** | ${setup.targetJobTitle} |\n`;
      }
      if (setup.audienceLevel) {
        const audienceLabels: Record<string, string> = { "new-hire": "New Hire", "experienced": "Experienced", "recertification": "Recertification" };
        response += `| **Audience level** | ${audienceLabels[setup.audienceLevel] || setup.audienceLevel} |\n`;
      }
      if (context.selectedSourceTitles.length > 0) {
        response += `| **Sources** | ${context.selectedSourceTitles.join(", ")} |\n`;
      }
      if (context.skillGapSummary && context.skillGapSummary.usersWithGaps > 0) {
        response += `| **Org context** | ${context.skillGapSummary.usersWithGaps} of ${context.skillGapSummary.totalUsers} users have skill gaps |\n`;
      }
      if (context.expiringCertifications && context.expiringCertifications > 0) {
        response += `| **Expiring certs** | ${context.expiringCertifications} in 90 days |\n`;
      }
      response += `| **Tags** | ${tagsStr} |\n`;
      response += `| **Standards** | ${standardsStr} |\n`;
      response += `| **Language** | English |\n\n`;
      response += `</details>`;

      return {
        message: response,
        attachedOutline: lessonsWithSources,
        attachedSources: context.selectedSourceIds,
        fieldUpdates: {
          title: courseTitle,
          description: richDescription,
          objectives,
          skillIds: allSkillIds,
          category,
          difficulty,
          estimatedMinutes: totalDuration,
          readingLevel: detectReadingLevel(setup),
          language: "en",
          tags: generateTagsForTopic(allText),
          standards: generateStandardsForTopic(allText),
        },
      };
    }

    // ── Subsequent messages for new course refinement ──
    return handleRefinement(lowerMsg, conversationHistory, context, allText);
  }

  // ══════════════════════════════════════════════════════════════════
  // EXISTING COURSE MODE — Contextual editing help
  // ══════════════════════════════════════════════════════════════════
  return handleExistingCourseHelp(lowerMsg, userMessageCount, conversationHistory, context);
}

// ============================================================================
// REFINEMENT HANDLER (for new courses after initial generation)
// ============================================================================

function handleRefinement(
  lowerMsg: string,
  conversationHistory: ChatMessage[],
  context: AgentContext,
  allText: string,
): AgentResponse {
  // ── User wants to add/include something ──
  if (matchesKeywords(lowerMsg, ["add", "include", "also", "can you add", "please add", "more about", "add a lesson"])) {
    return {
      message: `Got it! I'll incorporate that. Here's my approach:\n\n- Adding a new section covering your request\n- This will add ~15-20 minutes to the course\n- The content will reference the same source documents\n\nI've noted your request. You can continue refining or ask me to regenerate the outline.`,
    };
  }

  // ── User wants to shorten/simplify ──
  if (matchesKeywords(lowerMsg, ["shorter", "remove", "less", "simplify", "condense", "trim", "reduce", "fewer"])) {
    return {
      message: `Understood! I'd suggest:\n\n- Combining related lessons to reduce the total count\n- Focusing on the most critical safety procedures\n- Keeping only the essential quiz questions\n\nYou can remove individual lessons from the editor, or tell me which topics to cut.`,
    };
  }

  // ── User asks to change objectives ──
  if (matchesKeywords(lowerMsg, ["objective", "learning goal", "outcome"])) {
    const objectives = generateObjectivesForTopic(allText);
    return {
      message: `Here are updated learning objectives based on your feedback. I've applied them to the course.`,
      fieldUpdates: { objectives },
    };
  }

  // ── User asks about skills/compliance ──
  if (matchesKeywords(lowerMsg, ["skill", "competenc", "compliance", "certif", "requirement"])) {
    let response = `Here's what I know about skills and compliance in your organization:\n\n`;

    if (context.skillGapSummary) {
      response += `**Skill Gap Overview:**\n`;
      response += `- ${context.skillGapSummary.usersWithGaps} of ${context.skillGapSummary.totalUsers} users have skill gaps\n`;
      if (context.skillGapSummary.topGapSkills.length > 0) {
        response += `- **Top gaps:** `;
        response += context.skillGapSummary.topGapSkills
          .map((g) => `${g.skillName} (${g.usersLacking} users)`)
          .join(", ");
        response += `\n`;
      }
    }

    if (context.expiringCertifications) {
      response += `\n**Expiring Certifications:** ${context.expiringCertifications} in the next 90 days\n`;
    }

    response += `\nI can tailor the course to address specific skill gaps. Just let me know which to focus on.`;

    return { message: response };
  }

  // ── User wants to change difficulty ──
  if (matchesKeywords(lowerMsg, ["beginner", "easier", "basic", "simple"])) {
    return {
      message: `I've adjusted the course difficulty to **Beginner** level. The content will use simpler language and more foundational concepts.`,
      fieldUpdates: { difficulty: "beginner" },
    };
  }
  if (matchesKeywords(lowerMsg, ["advanced", "harder", "expert", "technical"])) {
    return {
      message: `I've adjusted the course difficulty to **Advanced** level. The content will include more technical depth and complex scenarios.`,
      fieldUpdates: { difficulty: "advanced" },
    };
  }

  // ── Default: Helpful response ──
  return {
    message: `Thanks for the feedback! I can help you:\n\n- **Add or remove lessons** from the outline\n- **Update objectives** or skills\n- **Change difficulty** (beginner/intermediate/advanced)\n- **Adjust the description** or category\n\nJust tell me what you'd like to change, or edit the fields directly in the editor.`,
  };
}

// ============================================================================
// EXISTING COURSE HELP HANDLER
// ============================================================================

function handleExistingCourseHelp(
  lowerMsg: string,
  userMessageCount: number,
  _conversationHistory: ChatMessage[],
  context: AgentContext,
): AgentResponse {
  const courseTitle = context.currentCourseTitle || "this course";

  // ── Suggest objectives ──
  if (matchesKeywords(lowerMsg, ["objective", "learning goal", "outcome", "suggest objective"])) {
    const objectives = generateObjectivesForTopic(courseTitle);
    return {
      message: `Here are suggested learning objectives for **${courseTitle}**. I've applied them — you can edit or remove any from the list.`,
      fieldUpdates: { objectives },
    };
  }

  // ── Improve description ──
  if (matchesKeywords(lowerMsg, ["description", "improve description", "better description", "write description"])) {
    return {
      message: `I've updated the course description to be more comprehensive and engaging.`,
      fieldUpdates: {
        description: `This ${context.synthesisType === "micro-lesson" ? "micro-lesson" : "comprehensive training course"} covers the essential concepts and procedures for ${courseTitle.toLowerCase()}. Learners will develop practical skills through structured lessons, real-world scenarios, and knowledge assessments. ${context.targetRole ? `Designed for ${context.targetRole}.` : "Suitable for all relevant personnel."}`,
      },
    };
  }

  // ── Suggest skills ──
  if (matchesKeywords(lowerMsg, ["skill", "tag skill", "suggest skill", "add skill"])) {
    return {
      message: `I'd recommend tagging relevant skills from your organization's skill library. You can search and add skills using the Skills section in the editor on the left.`,
    };
  }

  // ── Generate lessons ──
  if (matchesKeywords(lowerMsg, ["generate lesson", "create lesson", "add lesson", "build lesson", "generate content"])) {
    const { template, topic } = getTemplateForContext(courseTitle, context.selectedSourceTitles);
    const lessonsWithSources = template.map((lesson) => ({
      ...lesson,
      sourceAttributions: context.selectedSourceIds,
    }));

    const totalDuration = lessonsWithSources.reduce((sum, l) => sum + l.duration, 0);

    return {
      message: `I've generated **${lessonsWithSources.length} lessons** for ${topic} (~${totalDuration} min total). Check the Lessons tab to review and edit the content.`,
      attachedOutline: lessonsWithSources,
      attachedSources: context.selectedSourceIds,
      fieldUpdates: {
        estimatedMinutes: totalDuration,
        category: detectCategory(courseTitle),
      },
    };
  }

  // ── Change difficulty ──
  if (matchesKeywords(lowerMsg, ["beginner", "easier", "basic"])) {
    return {
      message: `Updated difficulty to **Beginner**.`,
      fieldUpdates: { difficulty: "beginner" },
    };
  }
  if (matchesKeywords(lowerMsg, ["advanced", "harder", "expert", "technical"])) {
    return {
      message: `Updated difficulty to **Advanced**.`,
      fieldUpdates: { difficulty: "advanced" },
    };
  }
  if (matchesKeywords(lowerMsg, ["intermediate", "medium", "standard"])) {
    return {
      message: `Updated difficulty to **Intermediate**.`,
      fieldUpdates: { difficulty: "intermediate" },
    };
  }

  // ── Org context ──
  if (matchesKeywords(lowerMsg, ["gap", "compliance", "expir", "certif", "org"])) {
    let response = `Here's your organizational context:\n\n`;
    if (context.skillGapSummary) {
      response += `- **${context.skillGapSummary.usersWithGaps}** of ${context.skillGapSummary.totalUsers} users have skill gaps\n`;
    }
    if (context.expiringCertifications) {
      response += `- **${context.expiringCertifications}** certifications expiring in 90 days\n`;
    }
    response += `\nI can help tailor this course to address these gaps.`;
    return { message: response };
  }

  // ── First message / general help ──
  if (userMessageCount === 0) {
    let response = `I'm your AI course assistant. I can help you with **${courseTitle}**.\n\n`;
    response += `Here's what I can do:\n`;
    response += `- **"Suggest objectives"** — Generate learning objectives\n`;
    response += `- **"Improve description"** — Write a better course description\n`;
    response += `- **"Generate lessons"** — Create lesson content from your sources\n`;
    response += `- **"Make it beginner/advanced"** — Adjust difficulty level\n`;
    response += `- **"Show org gaps"** — View skill gaps and compliance data\n\n`;
    response += `What would you like help with?`;
    return { message: response };
  }

  // ── Default ──
  return {
    message: `I can help with that! Here are some things I can do:\n\n- **"Suggest objectives"** — Generate learning objectives\n- **"Improve description"** — Rewrite the course description\n- **"Generate lessons"** — Build lesson content\n- **"Make it beginner/advanced"** — Change difficulty\n\nOr just tell me what you'd like to change.`,
  };
}
