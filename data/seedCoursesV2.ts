// Phase II Epic 1 Fix Pass: Comprehensive seed data matching new data model
import { 
  Course, Lesson, Resource, Quiz, Question, 
  CourseAssignment, ProgressCourse, ProgressLesson, Certificate,
  CoursePolicy, ChatMessage
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

// Courses with scopes for assignment
export const courses: Course[] = [
  // ==================== COMPANY-WIDE COURSES ====================
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
    scope: { type: "company-wide" }, // Required for all employees
    metadata: {
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
    scope: { type: "company-wide" }, // Required for all employees
    createdAt: daysAgo(35),
    updatedAt: daysAgo(15),
  },
  {
    id: "crs_cw_001",
    title: "Code of Conduct & Ethics",
    description: "Essential training on company values, professional behavior, anti-harassment policies, and ethical workplace conduct.",
    category: "Compliance",
    estimatedMinutes: 30,
    status: "published",
    tags: ["Ethics", "Conduct", "HR"],
    skills: ["skl_013"], // Environmental Regulations
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "company-wide" }, // Required for all employees
    createdAt: daysAgo(60),
    updatedAt: daysAgo(30),
  },
  
  // ==================== SITE-SPECIFIC COURSES ====================
  {
    id: "crs_004",
    title: "Emergency Response & Evacuation",
    description: "Prepare for workplace emergencies including fire, chemical spills, and natural disasters. Learn evacuation routes and first response protocols.",
    category: "Emergency",
    estimatedMinutes: 30,
    status: "published",
    tags: ["Emergency", "Evacuation", "Fire Safety"],
    standards: ["OSHA 1910 Subpart E"],
    skills: ["skl_005", "skl_007", "skl_015"], // Fire Safety, Emergency Response, Evacuation Procedures
    policy: { ...defaultPolicy, progression: "free", lockNextUntilPrevious: false },
    ownerUserId: "usr_admin_1",
    lessonIds: ["lsn_004_01", "lsn_004_02"],
    quizId: "qz_004_course",
    scope: { type: "site", siteIds: ["site_planta", "site_plantb"] }, // Both sites
    createdAt: daysAgo(10),
    updatedAt: daysAgo(2),
  },
  {
    id: "crs_site_planta_001",
    title: "Plant A Orientation",
    description: "Site-specific orientation for Plant A employees. Covers facility layout, parking, cafeteria, break areas, and site-specific policies.",
    category: "Onboarding",
    estimatedMinutes: 25,
    status: "published",
    tags: ["Orientation", "Plant A", "Onboarding"],
    skills: [],
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "site", siteIds: ["site_planta"] }, // Plant A only
    createdAt: daysAgo(50),
    updatedAt: daysAgo(20),
  },
  {
    id: "crs_site_plantb_001",
    title: "Plant B Orientation",
    description: "Site-specific orientation for Plant B employees. Covers facility layout, parking, cafeteria, break areas, and site-specific policies.",
    category: "Onboarding",
    estimatedMinutes: 25,
    status: "published",
    tags: ["Orientation", "Plant B", "Onboarding"],
    skills: [],
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "site", siteIds: ["site_plantb"] }, // Plant B only
    createdAt: daysAgo(50),
    updatedAt: daysAgo(20),
  },
  {
    id: "crs_site_planta_002",
    title: "Plant A Security Protocols",
    description: "Learn about Plant A's specific security procedures, badge access, visitor policies, and restricted areas.",
    category: "Security",
    estimatedMinutes: 20,
    status: "published",
    tags: ["Security", "Plant A", "Access Control"],
    skills: [],
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "site", siteIds: ["site_planta"] }, // Plant A only
    createdAt: daysAgo(45),
    updatedAt: daysAgo(15),
  },
  
  // ==================== DEPARTMENT-SPECIFIC COURSES ====================
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
    lessonIds: ["lsn_002_01", "lsn_002_02", "lsn_002_03", "lsn_002_04"],
    quizId: "qz_002",
    scope: { type: "department", departmentIds: ["dept_warehouse_a", "dept_warehouse_b"] }, // Warehouse departments
    createdAt: daysAgo(40),
    updatedAt: daysAgo(5),
  },
  {
    id: "crs_dept_packaging_001",
    title: "Packaging Line Safety",
    description: "Essential safety training for packaging line operators. Covers machine guarding, lockout/tagout, and packaging equipment operation.",
    category: "Safety",
    estimatedMinutes: 45,
    status: "published",
    tags: ["Packaging", "Safety", "Equipment"],
    skills: ["skl_001", "skl_011"], // Lockout/Tagout, Heavy Machinery
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "department", departmentIds: ["dept_packaging_a", "dept_packaging_b"] }, // Packaging departments
    createdAt: daysAgo(55),
    updatedAt: daysAgo(25),
  },
  {
    id: "crs_dept_packaging_002",
    title: "Quality Control Basics",
    description: "Learn quality inspection procedures, defect identification, and documentation requirements for packaging operations.",
    category: "Quality",
    estimatedMinutes: 35,
    status: "published",
    tags: ["Quality", "Packaging", "Inspection"],
    skills: ["skl_014", "skl_020", "skl_021", "skl_022"], // Quality Standards, Quality Inspection, Defect Identification, Documentation
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "department", departmentIds: ["dept_packaging_a", "dept_packaging_b"] }, // Packaging departments
    createdAt: daysAgo(48),
    updatedAt: daysAgo(18),
  },
  {
    id: "crs_dept_maintenance_001",
    title: "Lockout/Tagout (LOTO) Certification",
    description: "Comprehensive LOTO training for maintenance personnel. Covers energy control procedures, locks and tags, and group lockout protocols.",
    category: "Safety",
    estimatedMinutes: 60,
    status: "published",
    tags: ["LOTO", "Safety", "Maintenance"],
    standards: ["OSHA 1910.147"],
    skills: ["skl_001", "skl_012"], // Lockout/Tagout, Power Tools
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "department", departmentIds: ["dept_maintenance_a", "dept_maintenance_b"] }, // Maintenance departments
    createdAt: daysAgo(65),
    updatedAt: daysAgo(35),
  },
  {
    id: "crs_dept_maintenance_002",
    title: "Electrical Safety for Maintenance",
    description: "Electrical safety procedures for maintenance technicians. Covers arc flash hazards, PPE requirements, and safe work practices.",
    category: "Safety",
    estimatedMinutes: 55,
    status: "published",
    tags: ["Electrical", "Safety", "Maintenance"],
    standards: ["NFPA 70E"],
    skills: ["skl_010", "skl_008"], // Electrical Safety, Personal Protective Equipment
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "department", departmentIds: ["dept_maintenance_a", "dept_maintenance_b"] }, // Maintenance departments
    createdAt: daysAgo(60),
    updatedAt: daysAgo(30),
  },
  {
    id: "crs_dept_warehouse_001",
    title: "Warehouse Safety & Ergonomics",
    description: "Safe lifting techniques, material handling procedures, and ergonomic practices for warehouse workers.",
    category: "Safety",
    estimatedMinutes: 40,
    status: "published",
    tags: ["Warehouse", "Safety", "Ergonomics"],
    skills: ["skl_009", "skl_008"], // Ergonomics, Personal Protective Equipment
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    scope: { type: "department", departmentIds: ["dept_warehouse_a", "dept_warehouse_b"] }, // Warehouse departments
    createdAt: daysAgo(52),
    updatedAt: daysAgo(22),
  },
  
  // ==================== NO SCOPE (MANUAL ASSIGNMENT) ====================
  {
    id: "crs_advanced_001",
    title: "Advanced Leadership Training",
    description: "Leadership development course for supervisors and team leads. Covers communication, conflict resolution, and team management.",
    category: "Leadership",
    estimatedMinutes: 120,
    status: "published",
    tags: ["Leadership", "Management", "Supervisors"],
    skills: ["skl_017", "skl_018", "skl_019"], // Team Leadership, Conflict Resolution, Performance Management
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    // No scope - manual assignment only
    createdAt: daysAgo(70),
    updatedAt: daysAgo(40),
  },
  {
    id: "crs_advanced_002",
    title: "First Aid & CPR Certification",
    description: "Comprehensive first aid and CPR training. Optional certification for interested employees.",
    category: "Safety",
    estimatedMinutes: 180,
    status: "published",
    tags: ["First Aid", "CPR", "Emergency"],
    skills: ["skl_004", "skl_016"], // First Aid, CPR & AED
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    // No scope - manual assignment only
    createdAt: daysAgo(75),
    updatedAt: daysAgo(45),
  },

  // ==================== AI-GENERATED COURSES ====================
  {
    id: "crs_ai_loto_001",
    title: "Lockout/Tagout (LOTO) Safety Training",
    description: "AI-generated comprehensive LOTO training covering OSHA 1910.147 requirements, step-by-step procedures, equipment identification, and practical assessment for maintenance technicians.",
    category: "Safety",
    status: "ai-draft",
    tags: ["LOTO", "OSHA", "Safety", "AI-Generated"],
    lessonIds: ["lsn_ai_loto_01", "lsn_ai_loto_02", "lsn_ai_loto_03"],
    ownerUserId: "usr_admin_001",
    policy: defaultPolicy,
    aiGenerated: true,
    synthesisType: "full-course",
    sourceIds: ["lib_002", "lib_006"],
    sourceAttributions: ["LOTO Standard Operating Procedure", "PPE Requirements Matrix"],
    conversationHistory: [
      { id: "msg_s1", role: "system", content: "Welcome! I'll help you generate a course based on your selected sources and organizational context.", timestamp: daysAgo(2) },
      { id: "msg_u1", role: "user", content: "I need a comprehensive LOTO training course for new maintenance technicians. It should cover all OSHA requirements and include practical assessments.", timestamp: daysAgo(2) },
      { id: "msg_a1", role: "assistant", content: "Based on your LOTO SOP and PPE requirements documents, I can create a comprehensive 3-lesson course. Shall I proceed?", timestamp: daysAgo(2) },
      { id: "msg_u2", role: "user", content: "Looks good! Go ahead and generate it.", timestamp: daysAgo(2) },
      { id: "msg_a2", role: "assistant", content: "I've generated the complete Lockout/Tagout Safety Training course with 3 lessons. Review and save to drafts when ready.", timestamp: daysAgo(2) },
    ] as ChatMessage[],
    confidenceScore: 0.92,
    suggestedSkillIds: ["skl_loto"],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "crs_ai_cs_001",
    title: "Confined Space Entry Training",
    description: "AI-generated training course covering confined space classification, entry procedures, and emergency rescue protocols per OSHA 1910.146.",
    category: "Safety",
    status: "published",
    tags: ["Confined Space", "OSHA", "Safety", "AI-Generated"],
    lessonIds: [],
    ownerUserId: "usr_admin_001",
    policy: defaultPolicy,
    aiGenerated: true,
    synthesisType: "full-course",
    sourceIds: ["lib_013"],
    sourceAttributions: ["Confined Space Entry Procedures"],
    conversationHistory: [
      { id: "msg_cs_s1", role: "system", content: "Welcome! I'll help you generate a course.", timestamp: daysAgo(10) },
      { id: "msg_cs_u1", role: "user", content: "Create a confined space entry training based on our SOPs.", timestamp: daysAgo(10) },
      { id: "msg_cs_a1", role: "assistant", content: "I'll create a 3-lesson confined space entry course. Generating now...", timestamp: daysAgo(10) },
    ] as ChatMessage[],
    confidenceScore: 0.88,
    suggestedSkillIds: ["skl_confined_space"],
    reviewedByUserId: "usr_admin_001",
    reviewedAt: daysAgo(5),
    reviewNotes: "Content is accurate and aligns with our SOPs. Approved for publication.",
    createdAt: daysAgo(10),
    updatedAt: daysAgo(5),
  },
  {
    id: "crs_ai_ppe_001",
    title: "PPE Basics — Quick Overview",
    description: "AI-generated micro-lesson covering personal protective equipment fundamentals.",
    category: "Safety",
    status: "rejected",
    tags: ["PPE", "Safety", "AI-Generated"],
    lessonIds: [],
    ownerUserId: "usr_admin_001",
    policy: defaultPolicy,
    aiGenerated: true,
    synthesisType: "micro-lesson",
    sourceIds: ["lib_006"],
    sourceAttributions: ["PPE Requirements Matrix"],
    conversationHistory: [
      { id: "msg_ppe_s1", role: "system", content: "Welcome! I'll help you generate a micro-lesson.", timestamp: daysAgo(5) },
      { id: "msg_ppe_u1", role: "user", content: "Generate a quick PPE overview lesson.", timestamp: daysAgo(5) },
      { id: "msg_ppe_a1", role: "assistant", content: "Here's a concise PPE micro-lesson covering the basics.", timestamp: daysAgo(5) },
    ] as ChatMessage[],
    confidenceScore: 0.65,
    suggestedSkillIds: ["skl_electrical_basic"],
    reviewedByUserId: "usr_admin_001",
    reviewedAt: daysAgo(4),
    reviewNotes: "Too basic — needs more detail on selection criteria and hazard assessment. Please regenerate with deeper content.",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
  },

  // ==================== Q2 NEW COURSES (list cards only) ====================
  {
    id: "crs_fire_safety",
    title: "Fire Safety & Emergency Response",
    description: "Comprehensive fire prevention, detection, and emergency response training covering extinguisher use, evacuation procedures, and emergency action plans.",
    category: "Safety",
    estimatedMinutes: 60,
    status: "published",
    outputFormat: "reading",
    tags: ["Fire Safety", "Emergency Response", "Evacuation"],
    standards: ["OSHA 1910.157", "OSHA 1910.38"],
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    metadata: {
      objectives: [
        "Identify fire hazards in the workplace",
        "Demonstrate proper fire extinguisher use (PASS technique)",
        "Execute emergency evacuation procedures",
        "Understand emergency action plan requirements",
      ],
      difficulty: "beginner",
      language: "en",
    },
    createdAt: daysAgo(60),
    updatedAt: daysAgo(15),
  },
  {
    id: "crs_forklift",
    title: "Forklift Operation Certification",
    description: "Complete forklift operator training covering pre-operation inspection, safe driving practices, load handling, and OSHA-required competency evaluation.",
    category: "Safety",
    estimatedMinutes: 90,
    status: "published",
    outputFormat: "mixed",
    tags: ["Forklift", "PIT", "Certification", "Material Handling"],
    standards: ["OSHA 1910.178"],
    policy: defaultPolicy,
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    metadata: {
      objectives: [
        "Perform thorough pre-operation forklift inspection",
        "Demonstrate safe load handling and stacking techniques",
        "Navigate pedestrian areas and intersections safely",
        "Pass forklift operator competency evaluation",
      ],
      difficulty: "intermediate",
      language: "en",
    },
    createdAt: daysAgo(45),
    updatedAt: daysAgo(10),
  },
  {
    id: "crs_hr_orientation",
    title: "HR New Employee Orientation",
    description: "Welcome to the team! This orientation covers company policies, benefits enrollment, workplace culture, and essential first-week information for all new hires.",
    category: "Onboarding",
    estimatedMinutes: 120,
    status: "ai-draft",
    outputFormat: "presentation",
    tags: ["Onboarding", "HR", "New Hire", "Orientation"],
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    aiGenerated: true,
    synthesisType: "onboarding-path",
    metadata: {
      objectives: [
        "Understand company mission, values, and culture",
        "Complete benefits enrollment and paperwork",
        "Review workplace policies and code of conduct",
        "Navigate key facilities and meet department contacts",
      ],
      difficulty: "beginner",
      language: "en",
    },
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
  },
  {
    id: "crs_confined_space",
    title: "Confined Space Entry Procedures",
    description: "Training on permit-required confined space entry including hazard identification, atmospheric testing, entry procedures, and rescue planning.",
    category: "Safety",
    estimatedMinutes: 75,
    status: "generating",
    outputFormat: "mixed",
    tags: ["Confined Space", "Permit Required", "Safety"],
    standards: ["OSHA 1910.146"],
    ownerUserId: "usr_admin_1",
    lessonIds: [],
    aiGenerated: true,
    synthesisType: "full-course",
    metadata: {
      objectives: [
        "Identify permit-required confined spaces",
        "Perform atmospheric testing procedures",
        "Execute safe confined space entry with proper PPE",
      ],
      difficulty: "intermediate",
      language: "en",
    },
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
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
    resourceIds: ["res_001_01_01", "res_001_01_02", "res_001_01_img"],
    estimatedMinutes: 15,
    lessonType: "lesson" as const,
    knowledgeChecks: [
      { id: "kc_safe_1_1", question: "Who is responsible for workplace safety?", type: "multiple-choice" as const, options: [{ id: "kc_safe_1_1_a", text: "Only the safety department" }, { id: "kc_safe_1_1_b", text: "Only the supervisor" }, { id: "kc_safe_1_1_c", text: "Everyone — employers and employees share responsibility" }, { id: "kc_safe_1_1_d", text: "Only OSHA" }], correctOptionId: "kc_safe_1_1_c", explanation: "Under the OSH Act, employers must provide a safe workplace, but employees also have a duty to follow safety rules, report hazards, and use PPE correctly. Safety is a shared responsibility." },
      { id: "kc_safe_1_2", question: "True or False: You can be disciplined for reporting a safety hazard to OSHA.", type: "true-false" as const, options: [{ id: "kc_safe_1_2_a", text: "True" }, { id: "kc_safe_1_2_b", text: "False" }], correctOptionId: "kc_safe_1_2_b", explanation: "False. Section 11(c) of the OSH Act protects employees from retaliation for reporting safety concerns or filing complaints. It is illegal for employers to punish workers for exercising their safety rights." },
    ],
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
  },
  {
    id: "lsn_001_02",
    courseId: "crs_001",
    title: "Hazard Identification",
    order: 1,
    resourceIds: ["res_001_02_01", "res_001_02_02", "res_001_02_03", "res_001_02_img"],
    estimatedMinutes: 15,
    lessonType: "lesson" as const,
    knowledgeChecks: [
      { id: "kc_safe_2_1", question: "Which of these is an example of a biological hazard?", type: "multiple-choice" as const, options: [{ id: "kc_safe_2_1_a", text: "Wet floor" }, { id: "kc_safe_2_1_b", text: "Mold spores in an HVAC system" }, { id: "kc_safe_2_1_c", text: "Loud machinery" }, { id: "kc_safe_2_1_d", text: "Repetitive motion" }], correctOptionId: "kc_safe_2_1_b", explanation: "Biological hazards include bacteria, viruses, mold, fungi, and other living organisms that can cause illness. Mold spores in an HVAC system are a common workplace biological hazard." },
      { id: "kc_safe_2_2", question: "What should you do FIRST when you identify a workplace hazard?", type: "multiple-choice" as const, options: [{ id: "kc_safe_2_2_a", text: "Fix it yourself" }, { id: "kc_safe_2_2_b", text: "Report it to your supervisor immediately" }, { id: "kc_safe_2_2_c", text: "Wait until the next safety meeting" }, { id: "kc_safe_2_2_d", text: "Post about it on the safety bulletin board" }], correctOptionId: "kc_safe_2_2_b", explanation: "Immediately reporting hazards to your supervisor is the first step. This allows proper evaluation and corrective action to be taken before someone is injured." },
    ],
    createdAt: daysAgo(45),
    updatedAt: daysAgo(44),
  },
  {
    id: "lsn_001_03",
    courseId: "crs_001",
    title: "Personal Protective Equipment (PPE)",
    order: 2,
    resourceIds: ["res_001_03_01", "res_001_03_img", "res_001_03_pdf"],
    estimatedMinutes: 15,
    lessonType: "lesson" as const,
    knowledgeChecks: [
      { id: "kc_safe_3_1", question: "Who is responsible for paying for required PPE?", type: "multiple-choice" as const, options: [{ id: "kc_safe_3_1_a", text: "The employee" }, { id: "kc_safe_3_1_b", text: "The employer" }, { id: "kc_safe_3_1_c", text: "OSHA" }, { id: "kc_safe_3_1_d", text: "The union" }], correctOptionId: "kc_safe_3_1_b", explanation: "Under OSHA regulation 29 CFR 1910.132(h), the employer must pay for PPE required to comply with OSHA standards (with limited exceptions like safety-toe shoes and prescription safety glasses)." },
      { id: "kc_safe_3_2", question: "True or False: Safety glasses with side shields provide adequate eye protection when working with liquid chemicals.", type: "true-false" as const, options: [{ id: "kc_safe_3_2_a", text: "True" }, { id: "kc_safe_3_2_b", text: "False" }], correctOptionId: "kc_safe_3_2_b", explanation: "False. When working with liquid chemicals, chemical splash goggles are required. Safety glasses, even with side shields, do not provide adequate splash protection and can allow chemicals to reach the eyes." },
    ],
    createdAt: daysAgo(45),
    updatedAt: daysAgo(44),
  },
  // Course 2: Forklift (4 lessons — 3 content + 1 assessment)
  {
    id: "lsn_002_01",
    courseId: "crs_002",
    title: "Forklift Components & Controls",
    order: 0,
    resourceIds: ["res_002_01_text", "res_002_01_01", "res_002_01_02"],
    estimatedMinutes: 15,
    lessonType: "lesson" as const,
    knowledgeChecks: [
      { id: "kc_fork_1_1", question: "What is the 'stability triangle' on a forklift?", type: "multiple-choice" as const, options: [{ id: "kc_fork_1_1_a", text: "The three-point suspension formed by the front wheels and the rear axle pivot" }, { id: "kc_fork_1_1_b", text: "A warning decal on the dashboard" }, { id: "kc_fork_1_1_c", text: "The shape of the overhead guard" }, { id: "kc_fork_1_1_d", text: "The arrangement of the hydraulic cylinders" }], correctOptionId: "kc_fork_1_1_a", explanation: "The stability triangle is formed by the two front wheels and the pivot point of the rear axle. The forklift's center of gravity must remain within this triangle to prevent tipping." },
      { id: "kc_fork_1_2", question: "True or False: An overhead guard on a forklift is designed to protect the operator from all falling objects.", type: "true-false" as const, options: [{ id: "kc_fork_1_2_a", text: "True" }, { id: "kc_fork_1_2_b", text: "False" }], correctOptionId: "kc_fork_1_2_b", explanation: "False. The overhead guard protects against falling small objects but is NOT designed to withstand the impact of a full-capacity load falling from maximum height. Operators must still exercise caution around elevated loads." },
    ],
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  {
    id: "lsn_002_02",
    courseId: "crs_002",
    title: "Pre-Operation Inspection",
    order: 1,
    resourceIds: ["res_002_02_text", "res_002_02_01", "res_002_02_02"],
    estimatedMinutes: 15,
    lessonType: "lesson" as const,
    knowledgeChecks: [
      { id: "kc_fork_2_1", question: "If you discover a deficiency during the pre-operation inspection, what should you do?", type: "multiple-choice" as const, options: [{ id: "kc_fork_2_1_a", text: "Operate the forklift carefully and report it at end of shift" }, { id: "kc_fork_2_1_b", text: "Tag the forklift out of service and report immediately to your supervisor" }, { id: "kc_fork_2_1_c", text: "Ask a coworker if they think it's safe" }, { id: "kc_fork_2_1_d", text: "Only report it if it affects steering" }], correctOptionId: "kc_fork_2_1_b", explanation: "Any deficiency that could affect safe operation must result in the forklift being tagged out of service immediately. Report to your supervisor and do not operate until repairs are completed." },
      { id: "kc_fork_2_2", question: "How often must a pre-operation inspection be performed?", type: "multiple-choice" as const, options: [{ id: "kc_fork_2_2_a", text: "Weekly" }, { id: "kc_fork_2_2_b", text: "At the start of each shift before use" }, { id: "kc_fork_2_2_c", text: "Monthly" }, { id: "kc_fork_2_2_d", text: "Only after maintenance" }], correctOptionId: "kc_fork_2_2_b", explanation: "OSHA requires that powered industrial trucks be examined before being placed in service each shift. This applies to each operator who uses the forklift during that shift." },
    ],
    createdAt: daysAgo(40),
    updatedAt: daysAgo(39),
  },
  {
    id: "lsn_002_03",
    courseId: "crs_002",
    title: "Safe Operating Procedures",
    order: 2,
    resourceIds: ["res_002_03_text", "res_002_03_01", "res_002_03_img", "res_002_03_pdf"],
    estimatedMinutes: 20,
    lessonType: "lesson" as const,
    knowledgeChecks: [
      { id: "kc_fork_3_1", question: "When traveling with a load on a forklift, the forks should be:", type: "multiple-choice" as const, options: [{ id: "kc_fork_3_1_a", text: "Raised high for visibility" }, { id: "kc_fork_3_1_b", text: "Tilted forward" }, { id: "kc_fork_3_1_c", text: "Approximately 4-6 inches off the ground, tilted slightly back" }, { id: "kc_fork_3_1_d", text: "At maximum height to clear obstacles" }], correctOptionId: "kc_fork_3_1_c", explanation: "When traveling with a load, forks should be 4-6 inches off the ground and tilted slightly back. This keeps the center of gravity low and within the stability triangle, reducing tip-over risk." },
      { id: "kc_fork_3_2", question: "When driving a loaded forklift DOWN a ramp, you should:", type: "multiple-choice" as const, options: [{ id: "kc_fork_3_2_a", text: "Drive forward with the load leading" }, { id: "kc_fork_3_2_b", text: "Drive in reverse with the load uphill" }, { id: "kc_fork_3_2_c", text: "Coast down in neutral" }, { id: "kc_fork_3_2_d", text: "Turn the forklift sideways" }], correctOptionId: "kc_fork_3_2_b", explanation: "When descending a ramp with a load, always travel in reverse with the load on the uphill side. This keeps the load from sliding off the forks and maintains stability." },
    ],
    createdAt: daysAgo(40),
    updatedAt: daysAgo(39),
  },
  {
    id: "lsn_002_04",
    courseId: "crs_002",
    title: "Forklift Certification Assessment",
    order: 3,
    resourceIds: ["res_002_04_text"],
    estimatedMinutes: 10,
    lessonType: "assessment" as const,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(39),
  },
  // Course 3: HazCom (2 lessons)
  {
    id: "lsn_003_01",
    courseId: "crs_003",
    title: "Understanding GHS and Chemical Labels",
    order: 0,
    resourceIds: ["res_003_01_text", "res_003_01_01", "res_003_01_02", "res_003_01_img"],
    estimatedMinutes: 20,
    lessonType: "lesson" as const,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
  {
    id: "lsn_003_02",
    courseId: "crs_003",
    title: "Reading Safety Data Sheets (SDS)",
    order: 1,
    resourceIds: ["res_003_02_text", "res_003_02_01", "res_003_02_02", "res_003_02_pdf"],
    estimatedMinutes: 20,
    lessonType: "lesson" as const,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(34),
  },
  // Course 4: Emergency (2 lessons)
  {
    id: "lsn_004_01",
    courseId: "crs_004",
    title: "Emergency Action Plans",
    order: 0,
    resourceIds: ["res_004_01_01", "res_004_01_img", "res_004_01_pdf"],
    estimatedMinutes: 15,
    lessonType: "lesson" as const,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    id: "lsn_004_02",
    courseId: "crs_004",
    title: "Evacuation Procedures",
    order: 1,
    resourceIds: ["res_004_02_01", "res_004_02_img", "res_004_02_pdf"],
    estimatedMinutes: 15,
    lessonType: "lesson" as const,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },

  // AI LOTO Course Lessons
  {
    id: "lsn_ai_loto_01",
    courseId: "crs_ai_loto_001",
    title: "Introduction to Lockout/Tagout",
    order: 0,
    resourceIds: ["res_ai_loto_01"],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "lsn_ai_loto_02",
    courseId: "crs_ai_loto_001",
    title: "OSHA 1910.147 Requirements",
    order: 1,
    resourceIds: ["res_ai_loto_02"],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "lsn_ai_loto_03",
    courseId: "crs_ai_loto_001",
    title: "LOTO Procedures Step-by-Step",
    order: 2,
    resourceIds: ["res_ai_loto_03"],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
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
  // Course 2, Lesson 1 — text content above video
  {
    id: "res_002_01_text",
    courseId: "crs_002",
    lessonId: "lsn_002_01",
    type: "text",
    title: "Forklift Components & Controls",
    content: `<h2>Forklift Components & Controls</h2>
<p>Before operating any powered industrial truck, you must understand its key components and how they work together. This lesson covers the major parts of a counterbalance forklift — the most common type in warehouse and manufacturing operations.</p>

<h3>Types of Forklifts</h3>
<ul>
  <li><strong>Counterbalance</strong> — The most common type. Uses a heavy counterweight at the rear to balance the load on the forks. Available in sit-down and stand-up models.</li>
  <li><strong>Reach Truck</strong> — Designed for narrow aisles. The forks extend forward on a pantograph mechanism, allowing the operator to reach into racking without the truck itself entering the aisle.</li>
  <li><strong>Order Picker</strong> — The operator platform rises with the forks, allowing the worker to pick items at height. Requires fall protection equipment.</li>
</ul>

<h3>Key Components</h3>
<ol>
  <li><strong>Mast</strong> — The vertical assembly that raises and lowers the forks. Can be single-stage (low lift), two-stage, or three-stage (triple mast for maximum height).</li>
  <li><strong>Carriage</strong> — Rides along the mast rails and holds the forks. The tilt cylinder allows forward and backward tilt for load handling.</li>
  <li><strong>Forks (Tines)</strong> — The L-shaped prongs that slide under pallets. Must be inspected for cracks, bends, and uneven height.</li>
  <li><strong>Overhead Guard</strong> — Protects the operator from small falling objects. <em>Not designed to withstand the impact of a maximum-capacity load falling from height.</em></li>
  <li><strong>Load Backrest</strong> — Prevents the load from sliding backward toward the operator during transport.</li>
  <li><strong>Counterweight</strong> — Heavy casting at the rear of the forklift that balances the weight of the load. Never remove or modify the counterweight.</li>
</ol>

<div class="callout" data-variant="key-point">
  <strong>✅ The Stability Triangle:</strong> A forklift's stability is based on a triangle formed by the two front wheels and the pivot point of the rear axle. The combined center of gravity (truck + load) must stay within this triangle, or the forklift will tip over.
</div>

<div class="image-placeholder" data-caption="📸 Diagram: Forklift Stability Triangle — showing the three-point stability zone and center of gravity"></div>`,
    order: 0,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  {
    id: "res_002_01_01",
    courseId: "crs_002",
    lessonId: "lsn_002_01",
    type: "video",
    title: "Forklift Anatomy",
    url: "https://example.com/videos/forklift-components.mp4",
    durationSec: 720,
    order: 1,
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
    order: 2,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  // Course 2, Lesson 2 — text content above video
  {
    id: "res_002_02_text",
    courseId: "crs_002",
    lessonId: "lsn_002_02",
    type: "text",
    title: "Pre-Operation Inspection",
    content: `<h2>Pre-Operation Inspection</h2>
<p>OSHA requires a thorough inspection of powered industrial trucks <strong>before each shift</strong> and before placing the forklift into service. This is not optional — operating an uninspected forklift puts you and everyone around you at risk.</p>

<h3>Daily Inspection Checklist</h3>
<p>Walk around the forklift and check each of the following. If any item fails inspection, <strong>tag the forklift out of service</strong> and report to your supervisor immediately.</p>
<ol>
  <li><strong>Tires</strong> — Check for cuts, gouges, chunking, and proper inflation (pneumatic tires). Solid tires should not have excessive wear or flat spots.</li>
  <li><strong>Forks</strong> — Inspect for cracks (especially at the heel), bends, uneven height between forks, and worn positioning lock pins.</li>
  <li><strong>Hydraulic System</strong> — Check fluid level, look for leaks at hoses, cylinders, and fittings. Pooled fluid under the forklift is a red flag.</li>
  <li><strong>Mast and Chains</strong> — Inspect chains for stretch, wear, and proper lubrication. Mast rails should be free of damage.</li>
  <li><strong>Horn</strong> — Must be loud and functional. Sound the horn to test.</li>
  <li><strong>Lights</strong> — Headlights, tail lights, and strobe/warning lights must all work.</li>
  <li><strong>Seatbelt</strong> — Must latch securely. Replace if frayed or damaged.</li>
  <li><strong>Fire Extinguisher</strong> — Must be present, charged (check gauge), and accessible.</li>
  <li><strong>Brakes</strong> — Test both service brakes and parking brake before moving.</li>
  <li><strong>Steering</strong> — Check for excessive play or unusual resistance.</li>
</ol>

<div class="callout" data-variant="warning">
  <strong>⚠️ If the inspection reveals ANY deficiency that could affect safe operation, do NOT operate the forklift.</strong> Tag it out of service, notify your supervisor, and use a different unit. Never assume "it'll be fine for one more shift."
</div>`,
    order: 0,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  {
    id: "res_002_02_01",
    courseId: "crs_002",
    lessonId: "lsn_002_02",
    type: "video",
    title: "Pre-Op Inspection Walkthrough",
    url: "https://example.com/videos/forklift-inspection.mp4",
    durationSec: 540,
    order: 1,
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
    order: 2,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  // Course 2, Lesson 3 — text content above video
  {
    id: "res_002_03_text",
    courseId: "crs_002",
    lessonId: "lsn_002_03",
    type: "text",
    title: "Safe Operating Procedures",
    content: `<h2>Safe Operating Procedures</h2>
<p>Operating a forklift safely requires understanding load dynamics, navigating different terrain, and maintaining awareness of your surroundings at all times. This lesson covers the essential rules every certified forklift operator must follow.</p>

<h3>Load Capacity & Load Center</h3>
<p>Every forklift has a <strong>data plate</strong> that shows its maximum rated capacity at a specified load center distance (typically 24 inches from the face of the forks). Exceeding this capacity — even slightly — can cause a tip-over.</p>
<ul>
  <li>Never exceed the rated capacity shown on the data plate</li>
  <li>As the load center moves forward, the effective capacity <strong>decreases</strong></li>
  <li>Raising the load higher also reduces stability — keep loads as low as possible during travel</li>
</ul>

<h3>Traveling With and Without Loads</h3>
<ul>
  <li>Travel with forks <strong>4-6 inches off the ground</strong>, tilted slightly back</li>
  <li>Loaded forklifts travel <strong>forward up ramps</strong> and <strong>reverse down ramps</strong> (load always on the uphill side)</li>
  <li>Unloaded forklifts travel <strong>forward down ramps</strong></li>
  <li>Never exceed <strong>5 mph</strong> in general work areas; <strong>3 mph</strong> in pedestrian areas</li>
  <li>If a load blocks your forward view, travel in <strong>reverse</strong> (except going up a ramp)</li>
</ul>

<div class="callout" data-variant="danger">
  <strong>⛔ If your forklift starts to tip over, do NOT jump off.</strong> Stay in the seat, brace yourself, lean away from the direction of the fall, and hold on. Jumping puts you in the crush zone. The overhead guard is your best protection.
</div>

<h3>Pedestrian Safety</h3>
<p>Pedestrian-forklift collisions are one of the most common fatal workplace accidents. Follow these rules:</p>
<ul>
  <li><strong>Sound your horn</strong> at intersections, blind corners, and doorways</li>
  <li>Maintain <strong>eye contact</strong> with pedestrians before proceeding</li>
  <li>Never drive a forklift <strong>toward</strong> anyone standing in front of an object</li>
  <li>Yield to pedestrians at all times</li>
</ul>

<h3>Parking Procedures</h3>
<ol>
  <li>Park on a <strong>level surface</strong> — never on an incline unless wheels are blocked</li>
  <li>Lower forks completely to the <strong>ground</strong></li>
  <li>Tilt the mast <strong>forward</strong> until forks are flat on the surface</li>
  <li>Set the <strong>parking brake</strong></li>
  <li>Turn off the <strong>ignition</strong> and remove the key</li>
</ol>`,
    order: 0,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  {
    id: "res_002_03_01",
    courseId: "crs_002",
    lessonId: "lsn_002_03",
    type: "video",
    title: "Safe Operation Techniques",
    url: "https://example.com/videos/forklift-operations.mp4",
    durationSec: 900,
    order: 1,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  // Course 2, Lesson 4 — Assessment intro text
  {
    id: "res_002_04_text",
    courseId: "crs_002",
    lessonId: "lsn_002_04",
    type: "text",
    title: "Forklift Certification Assessment",
    content: `<h2>Forklift Certification Assessment</h2>
<p>This assessment evaluates your knowledge of forklift operation as required by OSHA 29 CFR 1910.178. You must score <strong>85% or higher</strong> to earn your Forklift Operation Certification.</p>
<div class="callout" data-variant="key-point">
  <strong>Assessment Details:</strong>
  <ul>
    <li>6 questions covering components, inspection, and safe operation</li>
    <li>Passing score: 85%</li>
    <li>You may retake the assessment if needed</li>
  </ul>
</div>
<p>When you're ready, click <strong>"Start Attempt"</strong> below.</p>`,
    order: 0,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(39),
  },
  // Course 3, Lesson 1 — text content before video
  {
    id: "res_003_01_text",
    courseId: "crs_003",
    lessonId: "lsn_003_01",
    type: "text",
    title: "Understanding GHS and Chemical Labels",
    content: `<h2>Understanding GHS and Chemical Labels</h2>
<p>The <strong>Globally Harmonized System (GHS)</strong> provides a worldwide standard for classifying and communicating chemical hazards through labels and Safety Data Sheets. Under OSHA's Hazard Communication Standard (29 CFR 1910.1200), all employers must ensure employees can identify and understand chemical labels.</p>

<h3>Required Label Elements</h3>
<p>Every GHS-compliant chemical label must include six elements:</p>
<ol>
  <li><strong>Product Identifier</strong> — Chemical name or product name matching the SDS</li>
  <li><strong>Signal Word</strong> — Either "Danger" (more severe) or "Warning" (less severe)</li>
  <li><strong>Hazard Statements</strong> — Standardized phrases describing the nature of the hazard (e.g., "Causes serious eye damage")</li>
  <li><strong>Pictograms</strong> — Red-bordered diamond symbols identifying hazard categories</li>
  <li><strong>Precautionary Statements</strong> — Recommended measures for handling, storage, and first aid</li>
  <li><strong>Supplier Information</strong> — Name, address, and phone number of the manufacturer</li>
</ol>

<h3>GHS Pictograms</h3>
<p>There are 9 GHS pictograms. You must recognize each on sight:</p>
<ul>
  <li><strong>Flame</strong> — Flammable liquids, gases, aerosols, and solids</li>
  <li><strong>Flame Over Circle</strong> — Oxidizers that can intensify a fire</li>
  <li><strong>Exploding Bomb</strong> — Explosives and self-reactive substances</li>
  <li><strong>Skull & Crossbones</strong> — Acute toxicity (fatal or toxic)</li>
  <li><strong>Corrosion</strong> — Corrosive to skin, eyes, or metals</li>
  <li><strong>Health Hazard</strong> — Carcinogens, respiratory sensitizers, reproductive toxicity</li>
  <li><strong>Exclamation Mark</strong> — Irritants, skin sensitizers, narcotic effects</li>
  <li><strong>Gas Cylinder</strong> — Gases under pressure</li>
  <li><strong>Environment</strong> — Aquatic toxicity (not mandated by OSHA but may appear)</li>
</ul>

<div class="callout" data-variant="warning">
  <strong>⚠️ Never use a chemical from an unlabeled container.</strong> If you find an unlabeled container, do not open it, do not smell it, and do not attempt to identify it yourself. Report it to your supervisor immediately.
</div>`,
    order: 0,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
  {
    id: "res_003_01_01",
    courseId: "crs_003",
    lessonId: "lsn_003_01",
    type: "video",
    title: "GHS Labeling System",
    url: "https://example.com/videos/ghs-labels.mp4",
    durationSec: 540,
    order: 1,
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
    order: 2,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
  // Course 3, Lesson 2 — text content before video
  {
    id: "res_003_02_text",
    courseId: "crs_003",
    lessonId: "lsn_003_02",
    type: "text",
    title: "Reading Safety Data Sheets (SDS)",
    content: `<h2>Reading Safety Data Sheets (SDS)</h2>
<p>A Safety Data Sheet provides detailed information about a chemical's hazards, safe handling, and emergency procedures. Under GHS, all SDS documents follow the same <strong>16-section format</strong>, making it easy to find information quickly — no matter who manufactured the chemical.</p>

<h3>The 16 SDS Sections</h3>
<ol>
  <li><strong>Identification</strong> — Product name, manufacturer, recommended use, emergency phone</li>
  <li><strong>Hazard(s) Identification</strong> — GHS classification, label elements, other hazards</li>
  <li><strong>Composition / Ingredients</strong> — Chemical identity, impurities, concentration</li>
  <li><strong>First-Aid Measures</strong> — Required treatment for inhalation, skin, eye, and ingestion exposure</li>
  <li><strong>Fire-Fighting Measures</strong> — Suitable extinguishing media, special hazards, firefighter PPE</li>
  <li><strong>Accidental Release</strong> — Spill cleanup, containment, environmental precautions</li>
  <li><strong>Handling and Storage</strong> — Safe handling practices, incompatibilities, storage conditions</li>
  <li><strong>Exposure Controls / PPE</strong> — Exposure limits (PEL, TLV), required PPE</li>
  <li><strong>Physical / Chemical Properties</strong> — Appearance, odor, pH, flash point, boiling point</li>
  <li><strong>Stability and Reactivity</strong> — Conditions to avoid, incompatible materials</li>
  <li><strong>Toxicological Information</strong> — Routes of exposure, symptoms, acute/chronic effects</li>
  <li><strong>Ecological Information</strong> — Environmental impact (not enforced by OSHA)</li>
  <li><strong>Disposal Considerations</strong> — Waste disposal methods</li>
  <li><strong>Transport Information</strong> — DOT shipping classification</li>
  <li><strong>Regulatory Information</strong> — Applicable regulations</li>
  <li><strong>Other Information</strong> — Date of preparation or last revision</li>
</ol>

<div class="callout" data-variant="tip">
  <strong>💡 Most-Used Sections:</strong> In an emergency, go to <strong>Section 4 (First Aid)</strong> and <strong>Section 5 (Fire-Fighting)</strong> first. For daily work, focus on <strong>Section 8 (Exposure Controls / PPE)</strong> to know what protection you need.
</div>

<p>SDS documents must be readily accessible to all employees during their work shifts. Your facility keeps them in designated SDS binders and/or the electronic SDS system. Know where to find them <strong>before</strong> you need them.</p>`,
    order: 0,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
  {
    id: "res_003_02_01",
    courseId: "crs_003",
    lessonId: "lsn_003_02",
    type: "video",
    title: "How to Read an SDS",
    url: "https://example.com/videos/reading-sds.mp4",
    durationSec: 660,
    order: 1,
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
    order: 2,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
  // Course 4, Lesson 1
  {
    id: "res_004_01_01",
    courseId: "crs_004",
    lessonId: "lsn_004_01",
    type: "text",
    title: "Emergency Action Plans",
    content: `<h2>Emergency Action Plans</h2>
<p>Every facility is required under OSHA 29 CFR 1910.38 to maintain a written <strong>Emergency Action Plan (EAP)</strong>. This plan outlines the procedures employees must follow during workplace emergencies including fires, chemical releases, severe weather, and medical emergencies.</p>

<h3>Key Elements of an Emergency Action Plan</h3>
<ol>
  <li><strong>Emergency Escape Procedures</strong> — Designated routes and exits for each area</li>
  <li><strong>Critical Operations</strong> — Procedures for employees who remain behind to shut down equipment</li>
  <li><strong>Employee Headcount</strong> — Accountability procedures at assembly points</li>
  <li><strong>Rescue and Medical Duties</strong> — Who is trained for first aid and CPR</li>
  <li><strong>Reporting</strong> — How to report fires and other emergencies</li>
  <li><strong>Contact Information</strong> — Names, titles, and phone numbers of key contacts</li>
</ol>

<h3>Fire Extinguisher Types</h3>
<p>Knowing which extinguisher to use is critical. Using the wrong type can spread the fire or create additional hazards.</p>
<ul>
  <li><strong>Class A</strong> — Ordinary combustibles (wood, paper, cloth). Use water or foam.</li>
  <li><strong>Class B</strong> — Flammable liquids (gasoline, oil, grease). Use CO₂ or dry chemical. <em>Never use water.</em></li>
  <li><strong>Class C</strong> — Energized electrical equipment. Use CO₂ or dry chemical. De-energize first if possible.</li>
  <li><strong>Class D</strong> — Combustible metals (magnesium, titanium). Use specialized Class D agents only.</li>
  <li><strong>Class K</strong> — Cooking oils and fats. Use wet chemical extinguishers.</li>
</ul>

<div class="callout" data-variant="tip">
  <strong>💡 Remember PASS:</strong> <strong>P</strong>ull the pin → <strong>A</strong>im at the base of the fire → <strong>S</strong>queeze the handle → <strong>S</strong>weep side to side.
</div>

<div class="callout" data-variant="warning">
  <strong>⚠️ Only attempt to fight a fire if:</strong> It's small and contained, you have the correct extinguisher, you have a clear escape route behind you, and the fire department has been called. When in doubt, evacuate.
</div>`,
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
    title: "Evacuation Procedures & Incident Reporting",
    content: `<h2>Evacuation Procedures & Incident Reporting</h2>
<p>When an evacuation is ordered, every second counts. Knowing your evacuation route and assembly point <strong>before</strong> an emergency occurs is the difference between a calm, organized exit and chaos.</p>

<h3>Evacuation Steps</h3>
<ol>
  <li><strong>Stop work immediately</strong> when the alarm sounds — do not finish your current task</li>
  <li><strong>Shut down equipment</strong> only if it can be done in a few seconds without risk</li>
  <li><strong>Follow your designated evacuation route</strong> — do not take shortcuts or use elevators</li>
  <li><strong>Assist others</strong> if safe to do so, especially those with mobility challenges</li>
  <li><strong>Proceed to your assembly point</strong> and check in with your area warden</li>
  <li><strong>Do NOT re-enter the building</strong> until the all-clear is given by emergency responders</li>
</ol>

<h3>Incident Reporting</h3>
<p>All incidents, injuries, and <strong>near-misses</strong> must be reported — no matter how minor. Near-miss reporting is especially important because it helps identify hazards before someone gets hurt.</p>
<ul>
  <li><strong>Injuries:</strong> Report immediately to your supervisor. Complete an incident report within the shift.</li>
  <li><strong>Near-Misses:</strong> Report within 24 hours. Include what happened, where, when, and what could be done to prevent it.</li>
  <li><strong>Property Damage:</strong> Report immediately. Do not attempt to fix damaged equipment yourself.</li>
</ul>

<div class="callout" data-variant="key-point">
  <strong>✅ Know Your Assembly Point:</strong> Every area has a designated assembly point. Find yours on the posted evacuation maps. If you are in an unfamiliar area when an alarm sounds, follow the green exit signs and go to the nearest assembly point.
</div>`,
    order: 0,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },

  // ==================== SUPPLEMENTARY IMAGE & PDF RESOURCES ====================

  // Course 1, Lesson 1 — Safety culture image
  {
    id: "res_001_01_img",
    courseId: "crs_001",
    lessonId: "lsn_001_01",
    type: "image",
    title: "Workplace Safety Culture — Team Briefing",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&auto=format&fit=crop",
    order: 2,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
  },

  // Course 1, Lesson 2 — Hazard control hierarchy infographic
  {
    id: "res_001_02_img",
    courseId: "crs_001",
    lessonId: "lsn_001_02",
    type: "image",
    title: "Hierarchy of Controls — NIOSH Infographic",
    url: "https://www.cdc.gov/niosh/images/topics/hierarchy-controls/702px-NIOSH_Hierarchy_of_Controls_infographic.jpg",
    order: 3,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
  },

  // Course 1, Lesson 3 — PPE types image + PDF guide
  {
    id: "res_001_03_img",
    courseId: "crs_001",
    lessonId: "lsn_001_03",
    type: "image",
    title: "Types of Personal Protective Equipment",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop",
    order: 1,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
  },
  {
    id: "res_001_03_pdf",
    courseId: "crs_001",
    lessonId: "lsn_001_03",
    type: "pdf",
    title: "OSHA PPE Selection Guide",
    url: "https://www.osha.gov/sites/default/files/publications/osha3151.pdf",
    fileName: "OSHA_PPE_Selection_Guide.pdf",
    order: 2,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(45),
  },

  // Course 2, Lesson 3 — Forklift safety image + quick reference PDF
  {
    id: "res_002_03_img",
    courseId: "crs_002",
    lessonId: "lsn_002_03",
    type: "image",
    title: "Forklift Operating in Warehouse Environment",
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&auto=format&fit=crop",
    order: 2,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },
  {
    id: "res_002_03_pdf",
    courseId: "crs_002",
    lessonId: "lsn_002_03",
    type: "pdf",
    title: "OSHA Powered Industrial Trucks — Quick Reference",
    url: "https://www.osha.gov/sites/default/files/publications/osha3949.pdf",
    fileName: "OSHA_Forklift_Quick_Reference.pdf",
    order: 3,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
  },

  // Course 3, Lesson 1 — GHS pictograms reference image
  {
    id: "res_003_01_img",
    courseId: "crs_003",
    lessonId: "lsn_003_01",
    type: "image",
    title: "GHS Hazard Pictograms — Quick Reference Chart",
    url: "https://www.osha.gov/sites/default/files/GHS_Pictograms.jpg",
    order: 3,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },

  // Course 3, Lesson 2 — Sample SDS document PDF
  {
    id: "res_003_02_pdf",
    courseId: "crs_003",
    lessonId: "lsn_003_02",
    type: "pdf",
    title: "Sample Safety Data Sheet (SDS) — Acetone",
    url: "https://www.labchem.com/tools/msds/msds/LC10420.pdf",
    fileName: "Sample_SDS_Acetone.pdf",
    order: 3,
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },

  // Course 4, Lesson 1 — Fire extinguisher image + Emergency Action Plan PDF
  {
    id: "res_004_01_img",
    courseId: "crs_004",
    lessonId: "lsn_004_01",
    type: "image",
    title: "Fire Extinguisher Stations — Know Your Location",
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&auto=format&fit=crop",
    order: 1,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    id: "res_004_01_pdf",
    courseId: "crs_004",
    lessonId: "lsn_004_01",
    type: "pdf",
    title: "OSHA Emergency Action Plan Guide",
    url: "https://www.osha.gov/sites/default/files/publications/osha3088.pdf",
    fileName: "OSHA_Emergency_Action_Plan.pdf",
    order: 2,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },

  // Course 4, Lesson 2 — Evacuation image + Incident report form PDF
  {
    id: "res_004_02_img",
    courseId: "crs_004",
    lessonId: "lsn_004_02",
    type: "image",
    title: "Emergency Exit Signage — Evacuation Routes",
    url: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=900&auto=format&fit=crop",
    order: 1,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    id: "res_004_02_pdf",
    courseId: "crs_004",
    lessonId: "lsn_004_02",
    type: "pdf",
    title: "Workplace Incident Report Form Template",
    url: "https://www.osha.gov/sites/default/files/publications/osha300.pdf",
    fileName: "Incident_Report_Form_Template.pdf",
    order: 2,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },

  // AI LOTO Course Resources
  {
    id: "res_ai_loto_01",
    courseId: "crs_ai_loto_001",
    lessonId: "lsn_ai_loto_01",
    type: "text",
    title: "Introduction to Lockout/Tagout",
    content: "# Introduction to Lockout/Tagout (LOTO)\n\n## What is LOTO?\n\nLockout/Tagout (LOTO) refers to specific practices and procedures to safeguard employees from the unexpected energization or startup of machinery and equipment during service or maintenance.\n\n## Why LOTO Matters\n\n- Prevents approximately **120 fatalities** and **50,000 injuries** annually\n- Required by OSHA Standard **29 CFR 1910.147**\n- Applies to all energy sources: electrical, mechanical, hydraulic, pneumatic, chemical, thermal",
    order: 0,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "res_ai_loto_02",
    courseId: "crs_ai_loto_001",
    lessonId: "lsn_ai_loto_02",
    type: "text",
    title: "OSHA 1910.147 Requirements",
    content: "# OSHA 1910.147 — Control of Hazardous Energy\n\n## Scope\n\nCovers servicing and maintenance of machines where unexpected energization could harm employees.\n\n## Employer Responsibilities\n\n1. **Develop** and implement an energy control program\n2. **Provide** locks, tags, and other hardware\n3. **Train** all affected employees\n4. **Conduct** periodic inspections at least annually",
    order: 0,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
  },
  {
    id: "res_ai_loto_03",
    courseId: "crs_ai_loto_001",
    lessonId: "lsn_ai_loto_03",
    type: "text",
    title: "LOTO Procedures Step-by-Step",
    content: "# The 6-Step LOTO Process\n\n## Step 1: Preparation\nIdentify all energy sources. Review the equipment-specific energy control procedure.\n\n## Step 2: Notification\nNotify all affected employees.\n\n## Step 3: Shutdown\nShut down the machine using normal operating procedures.\n\n## Step 4: Isolation\nDisconnect or isolate all energy sources.\n\n## Step 5: Lockout/Tagout\nApply your personal lock and tag to every energy-isolating device.\n\n## Step 6: Verification\nAttempt to restart the machine to verify all energy has been isolated.",
    order: 0,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
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

// ProgressCourse records
export const progressCourses: ProgressCourse[] = [
  // === MARCUS JOHNSON (usr_lrn_a_pkg_1) - Multiple completed courses for Skill Passport showcase ===
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
  // Marcus - Hazard Communication (HazCom) - Completed
  {
    id: "pc_marcus_hazcom",
    userId: "usr_lrn_a_pkg_1",
    courseId: "crs_003",
    status: "completed",
    lessonDoneCount: 2,
    lessonTotal: 2,
    scorePct: 95,
    attempts: 1,
    completedAt: daysAgo(15),
    createdAt: daysAgo(30),
    updatedAt: daysAgo(15),
  },
  // Marcus - Emergency Response & Evacuation - Completed
  {
    id: "pc_marcus_emergency",
    userId: "usr_lrn_a_pkg_1",
    courseId: "crs_004",
    status: "completed",
    lessonDoneCount: 2,
    lessonTotal: 2,
    scorePct: 100,
    attempts: 1,
    completedAt: daysAgo(25),
    createdAt: daysAgo(40),
    updatedAt: daysAgo(25),
  },
  // Marcus - Packaging Line Safety - Completed
  {
    id: "pc_marcus_packaging",
    userId: "usr_lrn_a_pkg_1",
    courseId: "crs_dept_packaging_001",
    status: "completed",
    lessonDoneCount: 3,
    lessonTotal: 3,
    scorePct: 88,
    attempts: 1,
    completedAt: daysAgo(35),
    createdAt: daysAgo(50),
    updatedAt: daysAgo(35),
  },
  // Marcus - Quality Control Basics - Completed
  {
    id: "pc_marcus_quality",
    userId: "usr_lrn_a_pkg_1",
    courseId: "crs_dept_packaging_002",
    status: "completed",
    lessonDoneCount: 2,
    lessonTotal: 2,
    scorePct: 90,
    attempts: 1,
    completedAt: daysAgo(20),
    createdAt: daysAgo(35),
    updatedAt: daysAgo(20),
  },
  // Marcus - First Aid & CPR Certification - Completed
  {
    id: "pc_marcus_firstaid",
    userId: "usr_lrn_a_pkg_1",
    courseId: "crs_advanced_002",
    status: "completed",
    lessonDoneCount: 4,
    lessonTotal: 4,
    scorePct: 96,
    attempts: 1,
    completedAt: daysAgo(10),
    createdAt: daysAgo(25),
    updatedAt: daysAgo(10),
  },
  // === Other users ===
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

// Certificates - Marcus Johnson has multiple for Skill Passport showcase
export const certificates: Certificate[] = [
  // === MARCUS JOHNSON (usr_lrn_a_pkg_1) - Multiple certificates ===
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
  // Marcus - Hazard Communication Certificate
  {
    id: "cert_marcus_hazcom",
    userId: "usr_lrn_a_pkg_1",
    courseId: "crs_003",
    issuedAt: daysAgo(15),
    expiresAt: daysFromNow(350),
    serial: "HC-2025-001-MJ",
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
  },
  // Marcus - Emergency Response Certificate
  {
    id: "cert_marcus_emergency",
    userId: "usr_lrn_a_pkg_1",
    courseId: "crs_004",
    issuedAt: daysAgo(25),
    expiresAt: daysFromNow(340),
    serial: "ER-2025-001-MJ",
    createdAt: daysAgo(25),
    updatedAt: daysAgo(25),
  },
  // Marcus - Packaging Line Safety Certificate
  {
    id: "cert_marcus_packaging",
    userId: "usr_lrn_a_pkg_1",
    courseId: "crs_dept_packaging_001",
    issuedAt: daysAgo(35),
    expiresAt: daysFromNow(330),
    serial: "PLS-2025-001-MJ",
    createdAt: daysAgo(35),
    updatedAt: daysAgo(35),
  },
  // Marcus - Quality Control Certificate
  {
    id: "cert_marcus_quality",
    userId: "usr_lrn_a_pkg_1",
    courseId: "crs_dept_packaging_002",
    issuedAt: daysAgo(20),
    expiresAt: daysFromNow(345),
    serial: "QC-2025-001-MJ",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
  },
  // Marcus - First Aid & CPR Certificate
  {
    id: "cert_marcus_firstaid",
    userId: "usr_lrn_a_pkg_1",
    courseId: "crs_advanced_002",
    issuedAt: daysAgo(10),
    expiresAt: daysFromNow(355),
    serial: "FA-2025-001-MJ",
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  // === Other users ===
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

