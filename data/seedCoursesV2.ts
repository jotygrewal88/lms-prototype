// Phase II Epic 1 Fix Pass: Comprehensive seed data matching new data model
import { 
  Course, Lesson, Resource, Quiz, Question, 
  CourseAssignment, ProgressCourse, ProgressLesson, Certificate,
  CoursePolicy
} from "@/types";

// Helper for timestamps
const now = new Date().toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

// Default course policy
const defaultPolicy: CoursePolicy = {
  progression: "linear",
  requireAllLessons: true,
  requirePassingQuiz: true,
  enableRetakes: true,
  lockNextUntilPrevious: true,
  showExplanations: true,
  requiresManualCompletion: false, // Phase II 1H.1b: Allow auto-completion by default
  minVideoWatchPct: 80,
  minTimeOnLessonSec: 60,
  maxQuizAttempts: 3,
  retakeCooldownMin: 60,
};

// 4 Courses (3 published, 1 draft)
export const courses: Course[] = [
  {
    id: "crs_001",
    title: "Workplace Safety Fundamentals",
    description: "Comprehensive introduction to workplace safety protocols, hazard identification, and emergency response procedures.",
    category: "Safety",
    estimatedMinutes: 45,
    status: "published",
    tags: ["OSHA", "Safety", "Fundamentals"],
    standards: ["OSHA 1910.1200", "OSHA 1910.132"],
    skills: ["skl_006", "skl_008"], // Phase II — 1M.1: OSHA Compliance, Personal Protective Equipment
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: ["lsn_001_01", "lsn_001_02", "lsn_001_03"],
    quizId: "qz_001",
    metadata: {
      // Incomplete objectives for AI fill demo
      objectives: ["Understand workplace safety basics"],
      tags: ["OSHA", "Safety", "Fundamentals"],
      difficulty: "beginner",
      language: "en",
      readingLevel: "standard",
    },
    createdAt: daysAgo(45),
    updatedAt: daysAgo(10),
  },
  {
    id: "crs_002",
    title: "Forklift Operation Certification",
    description: "Complete forklift training covering pre-operation inspection, safe driving techniques, load handling, and OSHA compliance.",
    category: "Equipment",
    estimatedMinutes: 90,
    status: "published",
    tags: ["Forklift", "Equipment", "Certification"],
    standards: ["OSHA 1910.178"],
    skills: ["skl_002"], // Phase II — 1M.1: Forklift Safety
    policy: { ...defaultPolicy, minVideoWatchPct: 90, maxQuizAttempts: 2 },
    ownerUserId: "usr_admin_1",
    lessonIds: ["lsn_002_01", "lsn_002_02", "lsn_002_03"],
    quizId: "qz_002",
    createdAt: daysAgo(40),
    updatedAt: daysAgo(5),
  },
  {
    id: "crs_003",
    title: "Hazard Communication (HazCom)",
    description: "Learn to identify chemical hazards, read Safety Data Sheets (SDS), and understand GHS labeling systems.",
    category: "Compliance",
    estimatedMinutes: 60,
    status: "published",
    tags: ["Chemicals", "SDS", "GHS", "HazCom"],
    standards: ["OSHA 1910.1200"],
    skills: ["skl_003"], // Phase II — 1M.1: Hazard Communication
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: ["lsn_003_01", "lsn_003_02"],
    quizId: "qz_003",
    createdAt: daysAgo(35),
    updatedAt: daysAgo(15),
  },
  {
    id: "crs_004",
    title: "Emergency Response & Evacuation",
    description: "Prepare for workplace emergencies including fire, chemical spills, and natural disasters. Learn evacuation routes and first response protocols.",
    category: "Emergency",
    estimatedMinutes: 30,
    status: "published", // Published to match Fire Safety training
    tags: ["Emergency", "Evacuation", "Fire Safety"],
    standards: ["OSHA 1910 Subpart E"],
    skills: ["skl_005", "skl_007"], // Phase II — 1M.1: Fire Safety, Emergency Response
    policy: { ...defaultPolicy, progression: "free", lockNextUntilPrevious: false },
    ownerUserId: "usr_admin_1",
    lessonIds: ["lsn_004_01", "lsn_004_02"],
    quizId: "qz_004_course", // Course-level quiz for Emergency Response
    createdAt: daysAgo(10),
    updatedAt: daysAgo(2),
  },
];

// 10 Lessons across courses
export const lessons: Lesson[] = [
  // Course 1: Workplace Safety (3 lessons)
  {
    id: "lsn_001_01",
    courseId: "crs_001",
    title: "Introduction to Workplace Safety",
    order: 0,
    resourceIds: ["res_001_01_01", "res_001_01_02"],
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
  },
  {
    id: "lsn_001_02",
    courseId: "crs_001",
    title: "Hazard Identification",
    order: 1,
    resourceIds: ["res_001_02_01", "res_001_02_02", "res_001_02_03"],
    createdAt: daysAgo(45),
    updatedAt: daysAgo(44),
  },
  {
    id: "lsn_001_03",
    courseId: "crs_001",
    title: "Personal Protective Equipment (PPE)",
    order: 2,
    resourceIds: ["res_001_03_01"],
    createdAt: daysAgo(45),
    updatedAt: daysAgo(44),
  },
  // Course 2: Forklift (3 lessons)
  {
    id: "lsn_002_01",
    courseId: "crs_002",
    title: "Forklift Components & Controls",
    order: 0,
    resourceIds: ["res_002_01_01", "res_002_01_02"],
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  {
    id: "lsn_002_02",
    courseId: "crs_002",
    title: "Pre-Operation Inspection",
    order: 1,
    resourceIds: ["res_002_02_01", "res_002_02_02"],
    createdAt: daysAgo(40),
    updatedAt: daysAgo(39),
  },
  {
    id: "lsn_002_03",
    courseId: "crs_002",
    title: "Safe Operating Procedures",
    order: 2,
    resourceIds: ["res_002_03_01"],
    createdAt: daysAgo(40),
    updatedAt: daysAgo(39),
  },
  // Course 3: HazCom (2 lessons)
  {
    id: "lsn_003_01",
    courseId: "crs_003",
    title: "Understanding GHS and Chemical Labels",
    order: 0,
    resourceIds: ["res_003_01_01", "res_003_01_02"],
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
  {
    id: "lsn_003_02",
    courseId: "crs_003",
    title: "Reading Safety Data Sheets (SDS)",
    order: 1,
    resourceIds: ["res_003_02_01", "res_003_02_02"],
    createdAt: daysAgo(35),
    updatedAt: daysAgo(34),
  },
  // Course 4: Emergency (2 lessons)
  {
    id: "lsn_004_01",
    courseId: "crs_004",
    title: "Emergency Action Plans",
    order: 0,
    resourceIds: ["res_004_01_01"],
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    id: "lsn_004_02",
    courseId: "crs_004",
    title: "Evacuation Procedures",
    order: 1,
    resourceIds: ["res_004_02_01"],
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
];

// Resources for lessons (mix of types)
export const resources: Resource[] = [
  // Course 1, Lesson 1
  {
    id: "res_001_01_01",
    courseId: "crs_001",
    lessonId: "lsn_001_01",
    type: "text",
    title: "Welcome to Workplace Safety",
    content: `<h2>Welcome to Workplace Safety Training</h2>
<p>This course covers essential safety protocols and procedures required for all employees.</p>
<h3>Learning Objectives</h3>
<ul>
  <li>Understand OSHA regulations and compliance requirements</li>
  <li>Identify common workplace hazards and control measures</li>
  <li>Apply proper use of personal protective equipment (PPE)</li>
  <li>Respond appropriately to emergency situations</li>
</ul>
<blockquote>
  <p><strong>Safety is everyone's responsibility.</strong> Each team member plays a vital role in maintaining a safe work environment.</p>
</blockquote>
<p>Throughout this training, you'll gain practical knowledge and skills to:</p>
<ol>
  <li>Recognize potential hazards before they cause harm</li>
  <li>Follow established safety procedures and protocols</li>
  <li>Report unsafe conditions or near-miss incidents</li>
  <li>Use safety equipment correctly and consistently</li>
</ol>`,
    order: 0,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
  },
  {
    id: "res_001_01_02",
    courseId: "crs_001",
    lessonId: "lsn_001_01",
    type: "video",
    title: "Safety Culture Overview",
    url: "https://example.com/videos/safety-culture.mp4",
    durationSec: 480,
    order: 1,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
  },
  // Course 1, Lesson 2
  {
    id: "res_001_02_01",
    courseId: "crs_001",
    lessonId: "lsn_001_02",
    type: "text",
    title: "Identifying Workplace Hazards",
    content: `<h2>Identifying Workplace Hazards</h2>
<p>Learn to recognize different types of hazards before they cause harm. <strong>Early detection is key to prevention.</strong></p>
<h3>Common Types of Workplace Hazards</h3>
<ol>
  <li><strong>Physical Hazards</strong> — Slips, trips, falls, noise, vibration, extreme temperatures</li>
  <li><strong>Chemical Hazards</strong> — Cleaning agents, solvents, fumes, dusts, vapors</li>
  <li><strong>Biological Hazards</strong> — Bacteria, viruses, mold, bloodborne pathogens</li>
  <li><strong>Ergonomic Hazards</strong> — Repetitive motion, awkward postures, manual handling</li>
  <li><strong>Psychosocial Hazards</strong> — Workplace stress, fatigue, harassment, violence</li>
</ol>
<blockquote>
  <p>Remember: <em>If you see something, say something.</em> Report all hazards immediately to your supervisor.</p>
</blockquote>
<h3>Hazard Control Hierarchy</h3>
<p>When a hazard is identified, controls should be applied in the following order of effectiveness:</p>
<ul>
  <li><strong>Elimination:</strong> Physically remove the hazard</li>
  <li><strong>Substitution:</strong> Replace with a less hazardous alternative</li>
  <li><strong>Engineering Controls:</strong> Isolate people from the hazard</li>
  <li><strong>Administrative Controls:</strong> Change work procedures</li>
  <li><strong>PPE:</strong> Protect workers with equipment (last resort)</li>
</ul>`,
    order: 0,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
  },
  {
    id: "res_001_02_02",
    courseId: "crs_001",
    lessonId: "lsn_001_02",
    type: "video",
    title: "Spotting Hazards",
    url: "https://example.com/videos/hazard-identification.mp4",
    durationSec: 600,
    order: 1,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
  },
  {
    id: "res_001_02_03",
    courseId: "crs_001",
    lessonId: "lsn_001_02",
    type: "pdf",
    title: "Hazard Identification Checklist",
    url: "https://example.com/docs/hazard-checklist.pdf",
    order: 2,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
  },
  // Course 1, Lesson 3
  {
    id: "res_001_03_01",
    courseId: "crs_001",
    lessonId: "lsn_001_03",
    type: "text",
    title: "PPE Selection and Use",
    content: `<h2>Personal Protective Equipment (PPE)</h2>
<p>Personal Protective Equipment, or PPE, is essential for protecting workers from workplace hazards. Each worker should have access to a complete PPE kit including hard hats, safety glasses, gloves, and protective footwear.</p>
<p>When selecting PPE, consider the specific hazards present in your work environment. A standard PPE kit may not be sufficient for all situations. Always inspect your equipment before use and replace any damaged items immediately.</p>
<h3>Types of PPE</h3>
<ul>
  <li><strong>Head Protection:</strong> Hard hats protect against falling objects and electrical hazards</li>
  <li><strong>Eye Protection:</strong> Safety glasses or goggles shield against chemical splashes and flying debris</li>
  <li><strong>Hand Protection:</strong> Gloves vary by hazard type - chemical-resistant, cut-resistant, or heat-resistant</li>
  <li><strong>Foot Protection:</strong> Steel-toed boots protect against crushing hazards</li>
</ul>
<p>Remember: PPE is the last line of defense. Always follow the hierarchy of controls, which prioritizes elimination, substitution, engineering controls, and administrative controls before relying on PPE.</p>`,
    order: 0,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
  },
  // Course 2, Lesson 1
  {
    id: "res_002_01_01",
    courseId: "crs_002",
    lessonId: "lsn_002_01",
    type: "video",
    title: "Forklift Anatomy",
    url: "https://example.com/videos/forklift-components.mp4",
    durationSec: 720,
    order: 0,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  {
    id: "res_002_01_02",
    courseId: "crs_002",
    lessonId: "lsn_002_01",
    type: "image",
    title: "Forklift Component Diagram",
    url: "https://example.com/images/forklift-diagram.png",
    order: 1,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  // Course 2, Lesson 2
  {
    id: "res_002_02_01",
    courseId: "crs_002",
    lessonId: "lsn_002_02",
    type: "video",
    title: "Pre-Op Inspection Walkthrough",
    url: "https://example.com/videos/forklift-inspection.mp4",
    durationSec: 540,
    order: 0,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  {
    id: "res_002_02_02",
    courseId: "crs_002",
    lessonId: "lsn_002_02",
    type: "pdf",
    title: "Daily Inspection Checklist",
    url: "https://example.com/docs/forklift-checklist.pdf",
    order: 1,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  // Course 2, Lesson 3
  {
    id: "res_002_03_01",
    courseId: "crs_002",
    lessonId: "lsn_002_03",
    type: "video",
    title: "Safe Operation Techniques",
    url: "https://example.com/videos/forklift-operations.mp4",
    durationSec: 900,
    order: 0,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  // Course 3, Lesson 1
  {
    id: "res_003_01_01",
    courseId: "crs_003",
    lessonId: "lsn_003_01",
    type: "video",
    title: "GHS Labeling System",
    url: "https://example.com/videos/ghs-labels.mp4",
    durationSec: 540,
    order: 0,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
  {
    id: "res_003_01_02",
    courseId: "crs_003",
    lessonId: "lsn_003_01",
    type: "pdf",
    title: "GHS Pictogram Guide",
    url: "https://example.com/docs/ghs-pictograms.pdf",
    order: 1,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
  // Course 3, Lesson 2
  {
    id: "res_003_02_01",
    courseId: "crs_003",
    lessonId: "lsn_003_02",
    type: "video",
    title: "How to Read an SDS",
    url: "https://example.com/videos/reading-sds.mp4",
    durationSec: 660,
    order: 0,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
  {
    id: "res_003_02_02",
    courseId: "crs_003",
    lessonId: "lsn_003_02",
    type: "link",
    title: "OSHA SDS Resources",
    url: "https://www.osha.gov/sds",
    order: 1,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
  // Course 4, Lesson 1
  {
    id: "res_004_01_01",
    courseId: "crs_004",
    lessonId: "lsn_004_01",
    type: "text",
    title: "Emergency Preparedness",
    content: "<h2>Emergency Preparedness</h2><p>Understanding your facility's emergency action plan and your role during emergencies.</p>",
    order: 0,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  // Course 4, Lesson 2
  {
    id: "res_004_02_01",
    courseId: "crs_004",
    lessonId: "lsn_004_02",
    type: "text",
    title: "Safe Evacuation",
    content: "<h2>Safe Evacuation</h2><p>Learn evacuation routes, assembly points, and accountability procedures.</p>",
    order: 0,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
];

// Epic 1G.6: Updated Quizzes with inline questions (new format)
export const quizzes: Quiz[] = [
  {
    id: "qz_001",
    courseId: "crs_001",
    title: "Workplace Safety Fundamentals Quiz",
    questions: [
      {
        id: "q_001_01",
        type: "mcq",
        prompt: "What is the primary purpose of workplace safety programs?",
        options: [
          { id: "opt_001_01_a", text: "To comply with regulations", correct: false },
          { id: "opt_001_01_b", text: "To prevent injuries and illnesses", correct: true },
          { id: "opt_001_01_c", text: "To reduce insurance costs", correct: false },
          { id: "opt_001_01_d", text: "To satisfy management requirements", correct: false },
        ],
        meta: {
          difficulty: "easy",
          rationale: "While compliance and cost reduction are benefits, the primary purpose is to protect workers from harm.",
          language: "en",
          tags: ["safety", "fundamentals"],
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_001_02",
        type: "true_false",
        prompt: "PPE is the first line of defense against workplace hazards.",
        answer: false,
        meta: {
          difficulty: "medium",
          rationale: "PPE is the last line of defense. The hierarchy of controls prioritizes elimination, substitution, engineering controls, and administrative controls before PPE.",
          language: "en",
          tags: ["ppe", "hierarchy"],
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_001_03",
        type: "mcq",
        prompt: "Which of the following is an example of a physical hazard?",
        options: [
          { id: "opt_001_03_a", text: "Excessive noise", correct: true },
          { id: "opt_001_03_b", text: "Chemical fumes", correct: false },
          { id: "opt_001_03_c", text: "Virus exposure", correct: false },
          { id: "opt_001_03_d", text: "Repetitive motion", correct: false },
        ],
        meta: {
          difficulty: "easy",
          rationale: "Physical hazards include noise, radiation, temperature extremes, and other environmental factors.",
          language: "en",
          tags: ["hazards"],
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_001_04",
        type: "scenario",
        prompt: "You're working in a warehouse and notice a spill on the floor. A colleague suggests quickly mopping it up so work can continue. What should you do?",
        options: [
          { id: "opt_001_04_a", text: "Mop it up quickly as suggested", correct: false },
          { id: "opt_001_04_b", text: "Report it to your supervisor and follow proper spill procedures", correct: true },
          { id: "opt_001_04_c", text: "Leave it for someone else to handle", correct: false },
          { id: "opt_001_04_d", text: "Place a warning sign but continue working", correct: false },
        ],
        meta: {
          difficulty: "hard",
          rationale: "All spills should be reported and handled according to proper procedures to ensure safety and prevent accidents.",
          language: "en",
          tags: ["scenario", "spills"],
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_001_05",
        type: "true_false",
        prompt: "Safety is only the responsibility of management and safety officers.",
        answer: false,
        meta: {
          difficulty: "easy",
          rationale: "Safety is everyone's responsibility. All employees play a role in maintaining a safe workplace.",
          language: "en",
          tags: ["responsibility"],
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_001_06",
        type: "mcq",
        prompt: "¿Cuál es el propósito principal de los programas de seguridad en el lugar de trabajo?",
        options: [
          { id: "opt_001_06_a", text: "Cumplir con las regulaciones", correct: false },
          { id: "opt_001_06_b", text: "Prevenir lesiones y enfermedades", correct: true },
          { id: "opt_001_06_c", text: "Reducir costos de seguro", correct: false },
          { id: "opt_001_06_d", text: "Satisfacer requisitos de gestión", correct: false },
        ],
        meta: {
          difficulty: "easy",
          rationale: "Si bien el cumplimiento y la reducción de costos son beneficios, el propósito principal es proteger a los trabajadores del daño.",
          language: "es",
          tags: ["seguridad", "fundamentos"],
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      // Phase II 1H.2b: New question types
      {
        id: "q_001_07",
        type: "shorttext",
        prompt: "What does OSHA stand for?",
        correctAnswerText: "Occupational Safety and Health Administration",
        required: true,
        points: 1,
        explanation: "OSHA stands for Occupational Safety and Health Administration, the federal agency responsible for workplace safety regulations.",
        meta: {
          difficulty: "easy",
          language: "en",
          tags: ["osha", "terminology"],
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_001_08",
        type: "multiselect",
        prompt: "Which of the following are examples of Personal Protective Equipment (PPE)? (Select all that apply)",
        options: [
          { id: "opt_001_08_a", text: "Safety glasses", correct: true },
          { id: "opt_001_08_b", text: "Hard hat", correct: true },
          { id: "opt_001_08_c", text: "Safety procedures manual", correct: false },
          { id: "opt_001_08_d", text: "Steel-toed boots", correct: true },
          { id: "opt_001_08_e", text: "Warning signs", correct: false },
        ],
        grading: {
          mode: "all-or-nothing",
        },
        required: true,
        points: 2,
        explanation: "PPE includes equipment worn to minimize exposure to hazards. Safety glasses, hard hats, and steel-toed boots are all types of PPE. Manuals and signs are administrative controls, not PPE.",
        meta: {
          difficulty: "medium",
          language: "en",
          tags: ["ppe", "equipment"],
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_001_09",
        type: "numeric",
        prompt: "How many sections are required in a Safety Data Sheet (SDS) according to GHS standards?",
        correctNumber: 16,
        tolerance: 0,
        required: true,
        points: 1,
        explanation: "GHS (Globally Harmonized System) requires Safety Data Sheets to have exactly 16 standardized sections for consistency and easy reference.",
        meta: {
          difficulty: "medium",
          language: "en",
          tags: ["sds", "ghs", "standards"],
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_001_10",
        type: "ordering",
        prompt: "Arrange the following steps in the correct order for responding to a workplace emergency:",
        options: [
          { id: "opt_001_10_a", text: "Assess the situation and ensure your own safety", correct: false },
          { id: "opt_001_10_b", text: "Alert others and activate emergency procedures", correct: false },
          { id: "opt_001_10_c", text: "Provide first aid if trained and safe to do so", correct: false },
          { id: "opt_001_10_d", text: "Report the incident to supervisors", correct: false },
        ],
        correctOrder: ["opt_001_10_a", "opt_001_10_b", "opt_001_10_c", "opt_001_10_d"],
        required: true,
        points: 2,
        explanation: "The correct order is: 1) Assess and ensure your own safety first, 2) Alert others and activate emergency procedures, 3) Provide first aid if trained, 4) Report the incident. Your safety is always the first priority.",
        meta: {
          difficulty: "hard",
          language: "en",
          tags: ["emergency", "procedures", "ordering"],
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
    ],
    config: {
      passingScore: 80,
      shuffleQuestions: false,
      shuffleOptions: false,
      showRationales: true,
    },
    createdAt: daysAgo(45),
    updatedAt: daysAgo(44),
  },
  {
    id: "qz_002",
    courseId: "crs_002",
    title: "Forklift Operation Certification Quiz",
    questions: [
      {
        id: "q_002_01",
        type: "mcq",
        prompt: "Before operating a forklift each day, you must:",
        options: [
          { id: "opt_002_01_a", text: "Check the fuel level only", correct: false },
          { id: "opt_002_01_b", text: "Complete a pre-operation inspection", correct: true },
          { id: "opt_002_01_c", text: "Warm up the engine", correct: false },
          { id: "opt_002_01_d", text: "Test the horn", correct: false },
        ],
        meta: {
          difficulty: "easy",
          rationale: "OSHA requires a complete pre-operation inspection before each shift to ensure the forklift is safe to operate.",
          language: "en",
          tags: ["forklift", "inspection"],
        },
        createdAt: daysAgo(40),
        updatedAt: daysAgo(40),
      },
      {
        id: "q_002_02",
        type: "true_false",
        prompt: "You should travel with the forks raised high to see where you're going.",
        answer: false,
        meta: {
          difficulty: "medium",
          rationale: "Forks should be kept 4-6 inches off the ground while traveling to maintain stability and visibility.",
          language: "en",
          tags: ["forklift", "operation"],
        },
        createdAt: daysAgo(40),
        updatedAt: daysAgo(40),
      },
      {
        id: "q_002_03",
        type: "scenario",
        prompt: "You're operating a forklift and notice a pedestrian walking in your path. The load you're carrying obstructs your view. What should you do?",
        options: [
          { id: "opt_002_03_a", text: "Continue slowly and sound your horn", correct: false },
          { id: "opt_002_03_b", text: "Stop immediately and wait for the pedestrian to clear the path", correct: true },
          { id: "opt_002_03_c", text: "Reverse to get a better view", correct: false },
          { id: "opt_002_03_d", text: "Raise the load to see over it", correct: false },
        ],
        meta: {
          difficulty: "hard",
          rationale: "When visibility is obstructed, stop immediately. Never proceed when you cannot see the path clearly.",
          language: "en",
          tags: ["scenario", "forklift", "safety"],
        },
        createdAt: daysAgo(40),
        updatedAt: daysAgo(40),
      },
      {
        id: "q_002_04",
        type: "mcq",
        prompt: "When driving a loaded forklift up a ramp, the load should be:",
        options: [
          { id: "opt_002_04_a", text: "Facing downhill", correct: false },
          { id: "opt_002_04_b", text: "Facing uphill", correct: true },
          { id: "opt_002_04_c", text: "It doesn't matter", correct: false },
          { id: "opt_002_04_d", text: "Raised to maximum height", correct: false },
        ],
        meta: {
          difficulty: "medium",
          rationale: "When traveling up a ramp, the load faces uphill. When traveling down, the load faces downhill. This maintains stability.",
          language: "en",
          tags: ["forklift", "ramps"],
        },
        createdAt: daysAgo(40),
        updatedAt: daysAgo(40),
      },
      {
        id: "q_002_05",
        type: "true_false",
        prompt: "If a forklift starts to tip over, you should jump off to safety.",
        answer: false,
        meta: {
          difficulty: "medium",
          rationale: "Never jump off a tipping forklift. Stay in the seat, hold on firmly, lean away from the fall, and brace your feet.",
          language: "en",
          tags: ["forklift", "emergency"],
        },
        createdAt: daysAgo(40),
        updatedAt: daysAgo(40),
      },
      {
        id: "q_002_06",
        type: "mcq",
        prompt: "You notice that your forklift's brakes feel 'soft' during your pre-operation check. What should you do?",
        options: [
          { id: "opt_002_06_a", text: "Continue working but drive more carefully", correct: false },
          { id: "opt_002_06_b", text: "Tag out the forklift and report the issue", correct: true },
          { id: "opt_002_06_c", text: "Pump the brakes to build pressure", correct: false },
          { id: "opt_002_06_d", text: "Use the parking brake more often", correct: false },
        ],
        meta: {
          difficulty: "hard",
          rationale: "Any safety-related defects must be reported immediately and the equipment taken out of service until repaired.",
          language: "en",
          tags: ["forklift", "maintenance"],
        },
        createdAt: daysAgo(40),
        updatedAt: daysAgo(40),
      },
    ],
    config: {
      passingScore: 85,
      shuffleQuestions: false,
      shuffleOptions: false,
      showRationales: true,
    },
    createdAt: daysAgo(40),
    updatedAt: daysAgo(39),
  },
  {
    id: "qz_003",
    courseId: "crs_003",
    title: "Hazard Communication (HazCom) Quiz",
    questions: [
      {
        id: "q_003_01",
        type: "mcq",
        prompt: "What does GHS stand for?",
        options: [
          { id: "opt_003_01_a", text: "General Hazard System", correct: false },
          { id: "opt_003_01_b", text: "Globally Harmonized System", correct: true },
          { id: "opt_003_01_c", text: "Global Health Standards", correct: false },
          { id: "opt_003_01_d", text: "General Handling Standards", correct: false },
        ],
        meta: {
          difficulty: "easy",
          rationale: "GHS stands for Globally Harmonized System of Classification and Labeling of Chemicals.",
          language: "en",
          tags: ["ghs", "terminology"],
        },
        createdAt: daysAgo(35),
        updatedAt: daysAgo(35),
      },
      {
        id: "q_003_02",
        type: "true_false",
        prompt: "Safety Data Sheets (SDS) must have exactly 16 sections in a specific order.",
        answer: true,
        meta: {
          difficulty: "medium",
          rationale: "GHS requires SDS to have 16 standardized sections in a consistent order for easy reference.",
          language: "en",
          tags: ["sds", "ghs"],
        },
        createdAt: daysAgo(35),
        updatedAt: daysAgo(35),
      },
      {
        id: "q_003_03",
        type: "mcq",
        prompt: "Which GHS signal word indicates a more severe hazard?",
        options: [
          { id: "opt_003_03_a", text: "Caution", correct: false },
          { id: "opt_003_03_b", text: "Warning", correct: false },
          { id: "opt_003_03_c", text: "Danger", correct: true },
          { id: "opt_003_03_d", text: "Hazard", correct: false },
        ],
        meta: {
          difficulty: "easy",
          rationale: "DANGER indicates more severe hazards, while WARNING indicates less severe hazards.",
          language: "en",
          tags: ["ghs", "labels"],
        },
        createdAt: daysAgo(35),
        updatedAt: daysAgo(35),
      },
      {
        id: "q_003_04",
        type: "scenario",
        prompt: "You're cleaning up a chemical spill and notice the container has a GHS label with a skull and crossbones pictogram. What should be your first action?",
        options: [
          { id: "opt_003_04_a", text: "Begin cleanup immediately", correct: false },
          { id: "opt_003_04_b", text: "Check the SDS for proper handling procedures", correct: true },
          { id: "opt_003_04_c", text: "Ventilate the area and continue", correct: false },
          { id: "opt_003_04_d", text: "Call your supervisor after cleanup", correct: false },
        ],
        meta: {
          difficulty: "hard",
          rationale: "The skull and crossbones indicates acute toxicity. Always consult the SDS before handling hazardous chemicals.",
          language: "en",
          tags: ["scenario", "ghs", "emergency"],
        },
        createdAt: daysAgo(35),
        updatedAt: daysAgo(35),
      },
    ],
    config: {
      passingScore: 80,
      shuffleQuestions: false,
      shuffleOptions: false,
      showRationales: true,
    },
    createdAt: daysAgo(35),
    updatedAt: daysAgo(34),
  },
  // Lesson-level quiz (Epic 1G.6 requirement)
  {
    id: "qz_004",
    courseId: "crs_001",
    lessonId: "lsn_001_01",
    title: "Introduction to Workplace Safety - Lesson Quiz",
    questions: [
      {
        id: "q_004_01",
        type: "mcq",
        prompt: "What are the three main components of workplace safety?",
        options: [
          { id: "opt_004_01_a", text: "Equipment, training, and compliance", correct: false },
          { id: "opt_004_01_b", text: "Recognition, evaluation, and control", correct: true },
          { id: "opt_004_01_c", text: "Safety, health, and environment", correct: false },
          { id: "opt_004_01_d", text: "Planning, execution, and review", correct: false },
        ],
        meta: {
          difficulty: "medium",
          rationale: "The three main components are recognizing hazards, evaluating risks, and controlling them.",
          language: "en",
          tags: ["safety", "fundamentals"],
          source: { type: "lesson", id: "lsn_001_01" },
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_004_02",
        type: "true_false",
        prompt: "Workplace safety only applies to industrial settings.",
        answer: false,
        meta: {
          difficulty: "easy",
          rationale: "Workplace safety applies to all work environments, including offices, retail, healthcare, and more.",
          language: "en",
          tags: ["safety", "scope"],
          source: { type: "lesson", id: "lsn_001_01" },
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_004_03",
        type: "scenario",
        prompt: "During a safety inspection, you identify multiple potential hazards. What is the correct order of priority for addressing them?",
        options: [
          { id: "opt_004_03_a", text: "Address the easiest ones first", correct: false },
          { id: "opt_004_03_b", text: "Address the most severe hazards first, then document all findings", correct: true },
          { id: "opt_004_03_c", text: "Document everything first, then address later", correct: false },
          { id: "opt_004_03_d", text: "Assign them to different team members", correct: false },
        ],
        meta: {
          difficulty: "hard",
          rationale: "Severe hazards should be addressed immediately, but all findings should be documented for follow-up.",
          language: "en",
          tags: ["scenario", "hazards", "prioritization"],
          source: { type: "lesson", id: "lsn_001_01" },
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_004_04",
        type: "mcq",
        prompt: "¿Cuál es el propósito principal de la seguridad en el lugar de trabajo?",
        options: [
          { id: "opt_004_04_a", text: "Cumplir con las regulaciones gubernamentales", correct: false },
          { id: "opt_004_04_b", text: "Proteger la salud y seguridad de los trabajadores", correct: true },
          { id: "opt_004_04_c", text: "Reducir los costos operativos", correct: false },
          { id: "opt_004_04_d", text: "Mejorar la productividad", correct: false },
        ],
        meta: {
          difficulty: "easy",
          rationale: "El propósito principal es proteger a los trabajadores, aunque otros beneficios pueden resultar.",
          language: "es",
          tags: ["seguridad", "fundamentos"],
          source: { type: "lesson", id: "lsn_001_01" },
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_004_05",
        type: "true_false",
        prompt: "Employee training is optional for workplace safety programs.",
        answer: false,
        meta: {
          difficulty: "easy",
          rationale: "Training is mandatory and essential for ensuring employees understand safety procedures and hazards.",
          language: "en",
          tags: ["training", "requirements"],
          source: { type: "lesson", id: "lsn_001_01" },
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      // Phase II 1H.2b: New question types
      {
        id: "q_004_06",
        type: "shorttext",
        prompt: "What is the acronym for the hierarchy of hazard controls?",
        correctAnswerText: "HIRARC",
        required: true,
        points: 1,
        explanation: "HIRARC stands for Hazard Identification, Risk Assessment, and Risk Control - the systematic approach to managing workplace hazards.",
        meta: {
          difficulty: "medium",
          language: "en",
          tags: ["hazards", "controls", "terminology"],
          source: { type: "lesson", id: "lsn_001_01" },
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_004_07",
        type: "multiselect",
        prompt: "Which of the following are considered physical workplace hazards? (Select all that apply)",
        options: [
          { id: "opt_004_07_a", text: "Noise", correct: true },
          { id: "opt_004_07_b", text: "Temperature extremes", correct: true },
          { id: "opt_004_07_c", text: "Repetitive motion", correct: true },
          { id: "opt_004_07_d", text: "Workplace stress", correct: false },
          { id: "opt_004_07_e", text: "Radiation", correct: true },
        ],
        grading: {
          mode: "partial",
        },
        required: true,
        points: 2,
        explanation: "Physical hazards include noise, temperature extremes, radiation, and repetitive motion. Workplace stress is a psychosocial hazard, not a physical one.",
        meta: {
          difficulty: "medium",
          language: "en",
          tags: ["hazards", "physical"],
          source: { type: "lesson", id: "lsn_001_01" },
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_004_08",
        type: "numeric",
        prompt: "What is the recommended minimum distance (in feet) to maintain from overhead power lines when operating equipment?",
        correctNumber: 10,
        tolerance: 0,
        required: true,
        points: 1,
        explanation: "OSHA requires maintaining a minimum clearance of 10 feet from overhead power lines for equipment operation to prevent electrical hazards.",
        meta: {
          difficulty: "hard",
          language: "en",
          tags: ["osha", "electrical", "distances"],
          source: { type: "lesson", id: "lsn_001_01" },
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
      {
        id: "q_004_09",
        type: "ordering",
        prompt: "Put the following steps in the correct order for conducting a Job Safety Analysis (JSA):",
        options: [
          { id: "opt_004_09_a", text: "Break down the job into steps", correct: false },
          { id: "opt_004_09_b", text: "Identify potential hazards for each step", correct: false },
          { id: "opt_004_09_c", text: "Develop control measures", correct: false },
          { id: "opt_004_09_d", text: "Review and update the JSA regularly", correct: false },
        ],
        correctOrder: ["opt_004_09_a", "opt_004_09_b", "opt_004_09_c", "opt_004_09_d"],
        required: true,
        points: 2,
        explanation: "The correct JSA process is: 1) Break down the job into steps, 2) Identify hazards for each step, 3) Develop control measures, 4) Review and update regularly. This systematic approach ensures comprehensive safety planning.",
        meta: {
          difficulty: "hard",
          language: "en",
          tags: ["jsa", "procedures", "ordering"],
          source: { type: "lesson", id: "lsn_001_01" },
        },
        createdAt: daysAgo(45),
        updatedAt: daysAgo(45),
      },
    ],
    config: {
      passingScore: 80,
      shuffleQuestions: false,
      shuffleOptions: false,
      showRationales: true,
    },
    createdAt: daysAgo(45),
    updatedAt: daysAgo(44),
  },
  // Course 4: Emergency Response & Evacuation Quiz
  {
    id: "qz_004_course",
    courseId: "crs_004",
    title: "Emergency Response & Evacuation Quiz",
    questions: [
      {
        id: "q_004_course_01",
        type: "mcq",
        prompt: "What is the primary purpose of an Emergency Action Plan (EAP)?",
        options: [
          { id: "opt_004_c01_a", text: "To comply with regulations only", correct: false },
          { id: "opt_004_c01_b", text: "To ensure safe and orderly evacuation during emergencies", correct: true },
          { id: "opt_004_c01_c", text: "To reduce insurance costs", correct: false },
          { id: "opt_004_c01_d", text: "To satisfy management requirements", correct: false },
        ],
        meta: {
          difficulty: "easy",
          rationale: "The primary purpose of an EAP is to ensure everyone knows how to evacuate safely during emergencies.",
          language: "en",
          tags: ["emergency", "evacuation"],
        },
        createdAt: daysAgo(10),
        updatedAt: daysAgo(10),
      },
      {
        id: "q_004_course_02",
        type: "true_false",
        prompt: "During a fire evacuation, you should use elevators to exit faster.",
        answer: false,
        meta: {
          difficulty: "easy",
          rationale: "Elevators should never be used during fire evacuations. Always use stairs.",
          language: "en",
          tags: ["fire", "evacuation"],
        },
        createdAt: daysAgo(10),
        updatedAt: daysAgo(10),
      },
      {
        id: "q_004_course_03",
        type: "mcq",
        prompt: "Where should you go after evacuating the building?",
        options: [
          { id: "opt_004_c03_a", text: "Back to your workstation", correct: false },
          { id: "opt_004_c03_b", text: "To the designated assembly point", correct: true },
          { id: "opt_004_c03_c", text: "To your car", correct: false },
          { id: "opt_004_c03_d", text: "Anywhere outside the building", correct: false },
        ],
        meta: {
          difficulty: "medium",
          rationale: "Employees must go to the designated assembly point so management can account for everyone.",
          language: "en",
          tags: ["evacuation", "assembly"],
        },
        createdAt: daysAgo(10),
        updatedAt: daysAgo(10),
      },
      {
        id: "q_004_course_04",
        type: "scenario",
        prompt: "You're working on the second floor when the fire alarm sounds. Your normal exit route is blocked by smoke. What should you do?",
        options: [
          { id: "opt_004_c04_a", text: "Go back to your workstation and wait", correct: false },
          { id: "opt_004_c04_b", text: "Use the nearest alternate exit route", correct: true },
          { id: "opt_004_c04_c", text: "Jump out the window", correct: false },
          { id: "opt_004_c04_d", text: "Try to find the source of the smoke", correct: false },
        ],
        meta: {
          difficulty: "hard",
          rationale: "If your primary exit is blocked, use the nearest alternate exit route identified in the EAP.",
          language: "en",
          tags: ["scenario", "evacuation", "alternate routes"],
        },
        createdAt: daysAgo(10),
        updatedAt: daysAgo(10),
      },
      {
        id: "q_004_course_05",
        type: "true_false",
        prompt: "Fire extinguishers should only be used by trained personnel.",
        answer: true,
        meta: {
          difficulty: "medium",
          rationale: "Only personnel trained in fire extinguisher use should operate them. Untrained use can be dangerous.",
          language: "en",
          tags: ["fire", "extinguisher"],
        },
        createdAt: daysAgo(10),
        updatedAt: daysAgo(10),
      },
    ],
    config: {
      passingScore: 80,
      shuffleQuestions: false,
      shuffleOptions: false,
      showRationales: true,
    },
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
];

// Legacy questions array (kept empty for backward compatibility)
export const questions: Question[] = [];

// Course Assignments (mix of targeting)
// Phase II 1H.4: Updated to new array-based target format
// Phase II: Expanded to match TrainingCompletions for data consistency
export const assignments: CourseAssignment[] = [
  // User-specific assignments
  {
    id: "asgn_001",
    courseId: "crs_001",
    target: { type: "user", userIds: ["usr_lrn_a_pkg_1"] },
    dueAt: daysFromNow(14),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  },
  {
    id: "asgn_002",
    courseId: "crs_001",
    target: { type: "user", userIds: ["usr_lrn_a_pkg_2"] },
    dueAt: daysFromNow(14),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  },
  {
    id: "asgn_003",
    courseId: "crs_002",
    target: { type: "user", userIds: ["usr_lrn_a_pkg_3"] },
    dueAt: daysFromNow(30),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
  {
    id: "asgn_004",
    courseId: "crs_002",
    target: { type: "user", userIds: ["usr_lrn_b_wh_1"] },
    dueAt: daysFromNow(30),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
  // Marcus Johnson - Forklift Safety (OVERDUE by 21 days) - crs_002
  {
    id: "asgn_marcus_forklift",
    courseId: "crs_002",
    target: { type: "user", userIds: ["usr_lrn_a_pkg_1"] },
    dueAt: daysAgo(21), // Overdue by 21 days
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(50),
    updatedAt: daysAgo(50),
  },
  // Forklift Safety assignments for Plant A Packaging (overdue cluster)
  {
    id: "asgn_forklift_pkg_2",
    courseId: "crs_002",
    target: { type: "user", userIds: ["usr_lrn_a_pkg_2"] },
    dueAt: daysAgo(18),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(47),
    updatedAt: daysAgo(47),
  },
  {
    id: "asgn_forklift_pkg_3",
    courseId: "crs_002",
    target: { type: "user", userIds: ["usr_lrn_a_pkg_3"] },
    dueAt: daysAgo(14),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(43),
    updatedAt: daysAgo(43),
  },
  {
    id: "asgn_forklift_pkg_4",
    courseId: "crs_002",
    target: { type: "user", userIds: ["usr_lrn_a_pkg_4"] },
    dueAt: daysAgo(9),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(38),
    updatedAt: daysAgo(38),
  },
  {
    id: "asgn_forklift_pkg_5",
    courseId: "crs_002",
    target: { type: "user", userIds: ["usr_lrn_a_pkg_5"] },
    dueAt: daysAgo(5),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(34),
    updatedAt: daysAgo(34),
  },
  {
    id: "asgn_forklift_pkg_6",
    courseId: "crs_002",
    target: { type: "user", userIds: ["usr_lrn_a_pkg_6"] },
    dueAt: daysAgo(2),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(31),
    updatedAt: daysAgo(31),
  },
  // Forklift Safety - Plant B Warehouse overdue
  {
    id: "asgn_forklift_b_wh_1",
    courseId: "crs_002",
    target: { type: "user", userIds: ["usr_lrn_b_wh_1"] },
    dueAt: daysAgo(11),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  {
    id: "asgn_forklift_b_wh_3",
    courseId: "crs_002",
    target: { type: "user", userIds: ["usr_lrn_b_wh_3"] },
    dueAt: daysAgo(6),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
  // Forklift Safety - Plant A Warehouse overdue
  {
    id: "asgn_forklift_a_wh_1",
    courseId: "crs_002",
    target: { type: "user", userIds: ["usr_lrn_a_wh_1"] },
    dueAt: daysAgo(10),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(39),
    updatedAt: daysAgo(39),
  },
  // PPE Basics (crs_001) - assignments matching TrainingCompletions
  {
    id: "asgn_ppe_a_wh_2",
    courseId: "crs_001",
    target: { type: "user", userIds: ["usr_lrn_a_wh_2"] },
    dueAt: daysFromNow(8),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  },
  {
    id: "asgn_ppe_a_wh_1_overdue",
    courseId: "crs_001",
    target: { type: "user", userIds: ["usr_lrn_a_wh_1"] },
    dueAt: daysAgo(15),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(44),
    updatedAt: daysAgo(44),
  },
  {
    id: "asgn_ppe_b_wh_2_overdue",
    courseId: "crs_001",
    target: { type: "user", userIds: ["usr_lrn_b_wh_2"] },
    dueAt: daysAgo(13),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(42),
    updatedAt: daysAgo(42),
  },
  // Fire Safety (crs_004) - assignments matching TrainingCompletions
  {
    id: "asgn_fire_a_pkg_1",
    courseId: "crs_004",
    target: { type: "user", userIds: ["usr_lrn_a_pkg_1"] },
    dueAt: daysFromNow(20),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30),
  },
  {
    id: "asgn_fire_a_wh_1",
    courseId: "crs_004",
    target: { type: "user", userIds: ["usr_lrn_a_wh_1"] },
    dueAt: daysFromNow(22),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(32),
    updatedAt: daysAgo(32),
  },
  {
    id: "asgn_fire_a_wh_2_overdue",
    courseId: "crs_004",
    target: { type: "user", userIds: ["usr_lrn_a_wh_2"] },
    dueAt: daysAgo(14),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(43),
    updatedAt: daysAgo(43),
  },
  {
    id: "asgn_fire_b_wh_3",
    courseId: "crs_004",
    target: { type: "user", userIds: ["usr_lrn_b_wh_3"] },
    dueAt: daysFromNow(25),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
  {
    id: "asgn_fire_b_wh_3_overdue",
    courseId: "crs_004",
    target: { type: "user", userIds: ["usr_lrn_b_wh_3"] },
    dueAt: daysAgo(9),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(38),
    updatedAt: daysAgo(38),
  },
  {
    id: "asgn_fire_a_pkg_6_overdue",
    courseId: "crs_004",
    target: { type: "user", userIds: ["usr_lrn_a_pkg_6"] },
    dueAt: daysAgo(4),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(33),
    updatedAt: daysAgo(33),
  },
  // Role-based assignment (all learners)
  {
    id: "asgn_005",
    courseId: "crs_003",
    target: { type: "role", roles: ["LEARNER"] },
    dueAt: daysFromNow(60),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(25),
    updatedAt: daysAgo(25),
  },
  // Site-based assignment
  {
    id: "asgn_006",
    courseId: "crs_001",
    target: { type: "site", siteIds: ["site_a"] },
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  },
  // Department-based assignments
  {
    id: "asgn_007",
    courseId: "crs_002",
    target: { type: "department", departmentIds: ["dept_a_warehouse"] },
    dueAt: daysFromNow(30),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
  {
    id: "asgn_008",
    courseId: "crs_003",
    target: { type: "department", departmentIds: ["dept_b_maintenance"] },
    dueAt: daysFromNow(45),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  // Department-based Forklift Safety (crs_002) for packaging and warehouse depts
  {
    id: "asgn_forklift_dept_pkg",
    courseId: "crs_002",
    target: { type: "department", departmentIds: ["dept_a_packaging", "dept_b_packaging"] },
    dueAt: daysFromNow(30),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(50),
    updatedAt: daysAgo(50),
  },
  {
    id: "asgn_forklift_dept_wh",
    courseId: "crs_002",
    target: { type: "department", departmentIds: ["dept_a_warehouse", "dept_b_warehouse"] },
    dueAt: daysFromNow(30),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(50),
    updatedAt: daysAgo(50),
  },
  // Role-based Fire Safety (crs_004) for all learners
  {
    id: "asgn_fire_all",
    courseId: "crs_004",
    target: { type: "role", roles: ["LEARNER"] },
    dueAt: daysFromNow(30),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30),
  },
  // Role-based PPE Basics (crs_001) for all learners
  {
    id: "asgn_ppe_all",
    courseId: "crs_001",
    target: { type: "role", roles: ["LEARNER"] },
    dueAt: daysFromNow(30),
    assignerUserId: "usr_admin_1",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(30),
  },
];

// 8 ProgressCourse records
export const progressCourses: ProgressCourse[] = [
  // Completed courses
  {
    id: "pc_001",
    userId: "usr_lrn_a_pkg_1",
    courseId: "crs_001",
    status: "completed",
    lessonDoneCount: 3,
    lessonTotal: 3,
    scorePct: 92,
    attempts: 1,
    completedAt: daysAgo(5),
    createdAt: daysAgo(20),
    updatedAt: daysAgo(5),
  },
  {
    id: "pc_002",
    userId: "usr_lrn_a_pkg_2",
    courseId: "crs_001",
    status: "completed",
    lessonDoneCount: 3,
    lessonTotal: 3,
    scorePct: 88,
    attempts: 1,
    completedAt: daysAgo(8),
    createdAt: daysAgo(19),
    updatedAt: daysAgo(8),
  },
  // In progress courses
  {
    id: "pc_003",
    userId: "usr_lrn_a_pkg_3",
    courseId: "crs_002",
    status: "in_progress",
    lessonDoneCount: 2,
    lessonTotal: 3,
    attempts: 0,
    lastLessonId: "lsn_002_03", // Phase II 1H.1b: Resume pointer
    createdAt: daysAgo(10),
    updatedAt: daysAgo(2),
  },
  {
    id: "pc_004",
    userId: "usr_lrn_b_wh_1",
    courseId: "crs_002",
    status: "in_progress",
    lessonDoneCount: 1,
    lessonTotal: 3,
    attempts: 0,
    lastLessonId: "lsn_002_02", // Phase II 1H.1b: Resume pointer
    createdAt: daysAgo(12),
    updatedAt: daysAgo(4),
  },
  {
    id: "pc_005",
    userId: "usr_lrn_a_wh_1",
    courseId: "crs_003",
    status: "in_progress",
    lessonDoneCount: 1,
    lessonTotal: 2,
    attempts: 0,
    lastLessonId: "lsn_003_02", // Phase II 1H.1b: Resume pointer
    createdAt: daysAgo(8),
    updatedAt: daysAgo(1),
  },
  // Not started
  {
    id: "pc_006",
    userId: "usr_lrn_b_maint_1",
    courseId: "crs_001",
    status: "not_started",
    lessonDoneCount: 0,
    lessonTotal: 3,
    attempts: 0,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  },
  {
    id: "pc_007",
    userId: "usr_lrn_b_maint_2",
    courseId: "crs_003",
    status: "not_started",
    lessonDoneCount: 0,
    lessonTotal: 2,
    attempts: 0,
    createdAt: daysAgo(25),
    updatedAt: daysAgo(25),
  },
  {
    id: "pc_008",
    userId: "usr_lrn_a_pkg_4",
    courseId: "crs_002",
    status: "not_started",
    lessonDoneCount: 0,
    lessonTotal: 3,
    attempts: 0,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
];

// 10 ProgressLesson records
export const progressLessons: ProgressLesson[] = [
  // User 1 - Completed all lessons of Course 1
  {
    id: "pl_001",
    lessonId: "lsn_001_01",
    userId: "usr_lrn_a_pkg_1",
    status: "completed",
    watchPct: 100,
    timeSpentSec: 500,
    startedAt: daysAgo(20), // Phase II 1H.1b: First view timestamp
    completedAt: daysAgo(18),
    createdAt: daysAgo(20),
    updatedAt: daysAgo(18),
  },
  {
    id: "pl_002",
    lessonId: "lsn_001_02",
    userId: "usr_lrn_a_pkg_1",
    status: "completed",
    watchPct: 100,
    timeSpentSec: 650,
    startedAt: daysAgo(18), // Phase II 1H.1b: First view timestamp
    completedAt: daysAgo(15),
    createdAt: daysAgo(18),
    updatedAt: daysAgo(15),
  },
  {
    id: "pl_003",
    lessonId: "lsn_001_03",
    userId: "usr_lrn_a_pkg_1",
    status: "completed",
    watchPct: 100,
    timeSpentSec: 450,
    startedAt: daysAgo(15), // Phase II 1H.1b: First view timestamp
    completedAt: daysAgo(12),
    createdAt: daysAgo(15),
    updatedAt: daysAgo(12),
  },
  // User 2 - Completed all lessons of Course 1
  {
    id: "pl_004",
    lessonId: "lsn_001_01",
    userId: "usr_lrn_a_pkg_2",
    status: "completed",
    watchPct: 100,
    timeSpentSec: 480,
    startedAt: daysAgo(19), // Phase II 1H.1b: First view timestamp
    completedAt: daysAgo(17),
    createdAt: daysAgo(19),
    updatedAt: daysAgo(17),
  },
  {
    id: "pl_005",
    lessonId: "lsn_001_02",
    userId: "usr_lrn_a_pkg_2",
    status: "completed",
    watchPct: 100,
    timeSpentSec: 620,
    startedAt: daysAgo(17), // Phase II 1H.1b: First view timestamp
    completedAt: daysAgo(14),
    createdAt: daysAgo(17),
    updatedAt: daysAgo(14),
  },
  {
    id: "pl_006",
    lessonId: "lsn_001_03",
    userId: "usr_lrn_a_pkg_2",
    status: "completed",
    watchPct: 100,
    timeSpentSec: 430,
    startedAt: daysAgo(14), // Phase II 1H.1b: First view timestamp
    completedAt: daysAgo(11),
    createdAt: daysAgo(14),
    updatedAt: daysAgo(11),
  },
  // User 3 - In progress Course 2 (2 lessons done)
  {
    id: "pl_007",
    lessonId: "lsn_002_01",
    userId: "usr_lrn_a_pkg_3",
    status: "completed",
    watchPct: 100,
    timeSpentSec: 750,
    startedAt: daysAgo(10), // Phase II 1H.1b: First view timestamp
    completedAt: daysAgo(8),
    createdAt: daysAgo(10),
    updatedAt: daysAgo(8),
  },
  {
    id: "pl_008",
    lessonId: "lsn_002_02",
    userId: "usr_lrn_a_pkg_3",
    status: "completed",
    watchPct: 100,
    timeSpentSec: 600,
    startedAt: daysAgo(8), // Phase II 1H.1b: First view timestamp
    completedAt: daysAgo(5),
    createdAt: daysAgo(8),
    updatedAt: daysAgo(5),
  },
  // User 4 - In progress Course 2 (1 lesson done)
  {
    id: "pl_009",
    lessonId: "lsn_002_01",
    userId: "usr_lrn_b_wh_1",
    status: "completed",
    watchPct: 100,
    timeSpentSec: 720,
    startedAt: daysAgo(12), // Phase II 1H.1b: First view timestamp
    completedAt: daysAgo(8),
    createdAt: daysAgo(12),
    updatedAt: daysAgo(8),
  },
  // User 5 - In progress Course 3 (1 lesson done)
  {
    id: "pl_010",
    lessonId: "lsn_003_01",
    userId: "usr_lrn_a_wh_1",
    status: "completed",
    watchPct: 100,
    timeSpentSec: 580,
    startedAt: daysAgo(8), // Phase II 1H.1b: First view timestamp
    completedAt: daysAgo(5),
    createdAt: daysAgo(8),
    updatedAt: daysAgo(5),
  },
];

// 2 Certificates
export const certificates: Certificate[] = [
  {
    id: "cert_001",
    userId: "usr_lrn_a_pkg_1",
    courseId: "crs_001",
    issuedAt: daysAgo(5),
    expiresAt: daysFromNow(360),
    serial: "WS-2025-001-A1",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: "cert_002",
    userId: "usr_lrn_a_pkg_2",
    courseId: "crs_001",
    issuedAt: daysAgo(8),
    expiresAt: daysFromNow(357),
    serial: "WS-2025-002-A2",
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
  },
];

