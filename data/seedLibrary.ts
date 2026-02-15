// Phase II — 1N.3: Library seed data
import { LibraryItem } from "@/types";

// Helper to generate timestamps
function timestamp(): string {
  return new Date().toISOString();
}

export const libraryItems: LibraryItem[] = [
  // PDFs
  {
    id: "lib_001",
    type: "file",
    title: "Safety Data Sheet - Chemical X",
    description: "Official SDS document for Chemical X handling and storage",
    tags: ["OSHA", "SDS", "Chemical Safety"],
    categories: ["Safety", "Compliance"],
    fileType: "pdf",
    source: "upload",
    pages: 5,
    siteId: undefined,
    departmentId: undefined,
    createdByUserId: "user_admin",
    createdAt: timestamp(),
    updatedAt: timestamp(),
    archivedAt: undefined,
    version: 1,
    parentId: undefined,
    checksum: "safety_data_sheet_chemical_x_245760",
    fileName: "SDS_Chemical_X.pdf",
    fileSize: 245760,
    mimeType: "application/pdf",
    url: "/uploads/2024/10/sds-chemical-x.pdf",
    sourceType: "policy",
    regulatoryRef: "OSHA HCS",
    allowedForSynthesis: true,
  },
  {
    id: "lib_002",
    type: "file",
    title: "Lockout/Tagout Standard Operating Procedure",
    description: "Comprehensive LOTO procedure for equipment maintenance",
    tags: ["OSHA", "Lockout/Tagout", "SOP", "Equipment"],
    categories: ["Safety", "Equipment"],
    fileType: "pdf",
    source: "upload",
    pages: 12,
    siteId: undefined,
    departmentId: undefined,
    createdByUserId: "user_admin",
    createdAt: timestamp(),
    updatedAt: timestamp(),
    archivedAt: undefined,
    version: 1,
    parentId: undefined,
    checksum: "lot_sop_890112",
    fileName: "LOTO_SOP.pdf",
    fileSize: 890112,
    mimeType: "application/pdf",
    url: "/uploads/2024/10/loto-sop.pdf",
    sourceType: "sop",
    regulatoryRef: "OSHA 1910.147",
    allowedForSynthesis: true,
  },
  {
    id: "lib_003",
    type: "file",
    title: "Forklift Operation Manual",
    description: "Complete guide for forklift operation and safety",
    tags: ["Forklift", "Equipment", "SOP"],
    categories: ["Equipment", "Safety"],
    fileType: "pdf",
    source: "upload",
    pages: 24,
    siteId: undefined,
    departmentId: undefined,
    createdByUserId: "user_admin",
    createdAt: timestamp(),
    updatedAt: timestamp(),
    archivedAt: undefined,
    version: 1,
    parentId: undefined,
    checksum: "forklift_manual_1203456",
    fileName: "Forklift_Manual.pdf",
    fileSize: 1203456,
    mimeType: "application/pdf",
    url: "/uploads/2024/10/forklift-manual.pdf",
    sourceType: "manual",
    regulatoryRef: "OSHA 1910.178",
    allowedForSynthesis: true,
  },
  {
    id: "lib_004",
    type: "file",
    title: "Job Hazard Analysis Template",
    description: "Standard JHA form for risk assessment",
    tags: ["JHA", "Safety", "Risk Assessment"],
    categories: ["Safety"],
    fileType: "pdf",
    source: "upload",
    pages: 3,
    siteId: undefined,
    departmentId: undefined,
    createdByUserId: "user_admin",
    createdAt: timestamp(),
    updatedAt: timestamp(),
    archivedAt: undefined,
    version: 1,
    parentId: undefined,
    checksum: "jha_template_156789",
    fileName: "JHA_Template.pdf",
    fileSize: 156789,
    mimeType: "application/pdf",
    url: "/uploads/2024/10/jha-template.pdf",
    sourceType: "policy",
    allowedForSynthesis: true,
  },
  
  // PPTX Presentations
  {
    id: "lib_005",
    type: "file",
    title: "New Employee Safety Orientation",
    description: "Comprehensive safety orientation presentation for new hires",
    tags: ["Onboarding", "Safety", "Orientation"],
    categories: ["Safety", "Training"],
    fileType: "pptx",
    source: "upload",
    siteId: undefined,
    departmentId: undefined,
    createdByUserId: "user_admin",
    createdAt: timestamp(),
    updatedAt: timestamp(),
    archivedAt: undefined,
    version: 1,
    parentId: undefined,
    checksum: "safety_orientation_3456789",
    fileName: "Safety_Orientation.pptx",
    fileSize: 3456789,
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    url: "/uploads/2024/10/safety-orientation.pptx",
    allowedForSynthesis: false,
  },
  {
    id: "lib_006",
    type: "file",
    title: "PPE Requirements and Usage",
    description: "Personal Protective Equipment training presentation",
    tags: ["PPE", "Safety", "Training"],
    categories: ["Safety", "PPE"],
    fileType: "pptx",
    source: "upload",
    siteId: undefined,
    departmentId: undefined,
    createdByUserId: "user_admin",
    createdAt: timestamp(),
    updatedAt: timestamp(),
    archivedAt: undefined,
    version: 1,
    parentId: undefined,
    checksum: "ppe_presentation_2345678",
    fileName: "PPE_Requirements.pptx",
    fileSize: 2345678,
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    url: "/uploads/2024/10/ppe-requirements.pptx",
    sourceType: "manual",
    allowedForSynthesis: true,
  },
  
  // Loom Links
  {
    id: "lib_007",
    type: "link",
    title: "Forklift Inspection Walkthrough",
    description: "Video demonstration of proper forklift inspection procedures",
    tags: ["Forklift", "Equipment", "Inspection"],
    categories: ["Equipment", "Safety"],
    fileType: undefined,
    url: "https://www.loom.com/share/abc123def456",
    source: "loom",
    durationSec: 480,
    siteId: undefined,
    departmentId: undefined,
    createdByUserId: "user_admin",
    createdAt: timestamp(),
    updatedAt: timestamp(),
    archivedAt: undefined,
    version: 1,
    parentId: undefined,
    checksum: undefined,
    allowedForSynthesis: false,
  },
  {
    id: "lib_008",
    type: "link",
    title: "Emergency Evacuation Procedures",
    description: "Step-by-step guide for emergency evacuation",
    tags: ["Emergency", "Evacuation", "Safety"],
    categories: ["Emergency", "Safety"],
    fileType: undefined,
    url: "https://www.loom.com/share/xyz789ghi012",
    source: "loom",
    durationSec: 360,
    siteId: undefined,
    departmentId: undefined,
    createdByUserId: "user_admin",
    createdAt: timestamp(),
    updatedAt: timestamp(),
    archivedAt: undefined,
    version: 1,
    parentId: undefined,
    checksum: undefined,
    allowedForSynthesis: false,
  },
  
  // YouTube Links
  {
    id: "lib_009",
    type: "link",
    title: "OSHA Construction Safety Basics",
    description: "Official OSHA training video on construction site safety",
    tags: ["OSHA", "Construction", "Safety"],
    categories: ["Safety", "Compliance"],
    fileType: undefined,
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    source: "youtube",
    durationSec: 900,
    siteId: undefined,
    departmentId: undefined,
    createdByUserId: "user_admin",
    createdAt: timestamp(),
    updatedAt: timestamp(),
    archivedAt: undefined,
    version: 1,
    parentId: undefined,
    checksum: undefined,
    allowedForSynthesis: false,
  },
  {
    id: "lib_010",
    type: "link",
    title: "Proper Lifting Techniques",
    description: "Ergonomics training video for safe lifting practices",
    tags: ["Ergonomics", "Safety", "Training"],
    categories: ["Safety"],
    fileType: undefined,
    url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    source: "youtube",
    durationSec: 420,
    siteId: undefined,
    departmentId: undefined,
    createdByUserId: "user_admin",
    createdAt: timestamp(),
    updatedAt: timestamp(),
    archivedAt: undefined,
    version: 1,
    parentId: undefined,
    checksum: undefined,
    allowedForSynthesis: false,
  },
  
  // Images
  {
    id: "lib_011",
    type: "file",
    title: "Safety Signage Reference Guide",
    description: "Visual guide to all workplace safety signs",
    tags: ["Safety", "Signage", "Visual"],
    categories: ["Safety"],
    fileType: "image",
    source: "upload",
    siteId: undefined,
    departmentId: undefined,
    createdByUserId: "user_admin",
    createdAt: timestamp(),
    updatedAt: timestamp(),
    archivedAt: undefined,
    version: 1,
    parentId: undefined,
    checksum: "safety_signs_987654",
    fileName: "Safety_Signs.jpg",
    fileSize: 987654,
    mimeType: "image/jpeg",
    url: "/uploads/2024/10/safety-signs.jpg",
    allowedForSynthesis: false,
  },
  {
    id: "lib_012",
    type: "file",
    title: "Emergency Response Flowchart",
    description: "Visual flowchart for emergency response procedures",
    tags: ["Emergency", "Visual", "Flowchart"],
    categories: ["Emergency", "Safety"],
    fileType: "image",
    source: "upload",
    siteId: undefined,
    departmentId: undefined,
    createdByUserId: "user_admin",
    createdAt: timestamp(),
    updatedAt: timestamp(),
    archivedAt: undefined,
    version: 1,
    parentId: undefined,
    checksum: "emergency_flowchart_654321",
    fileName: "Emergency_Flowchart.png",
    fileSize: 654321,
    mimeType: "image/png",
    url: "/uploads/2024/10/emergency-flowchart.png",
    allowedForSynthesis: false,
  },

  // ============================================================================
  // NEW: Pasted text knowledge sources (for AI synthesis)
  // ============================================================================

  {
    id: "lib_013",
    type: "file",
    title: "Confined Space Entry Procedures",
    description: "Standard operating procedure for confined space entry with atmospheric testing limits",
    tags: ["Confined Space", "Safety", "Permits", "OSHA"],
    categories: ["Safety"],
    createdByUserId: "user_admin",
    createdAt: new Date("2024-06-15").toISOString(),
    updatedAt: new Date("2024-06-15").toISOString(),
    version: 1,
    sourceType: "sop",
    regulatoryRef: "OSHA 1910.146",
    allowedForSynthesis: true,
    content: `# Confined Space Entry Standard Operating Procedure

## Classification
A confined space is any space that:
- Is large enough for an employee to enter fully
- Has limited means of entry or exit
- Is not designed for continuous occupancy

## Permit-Required Confined Spaces
Spaces that contain or have potential for:
- Hazardous atmospheres
- Engulfment hazards
- Configuration that could trap or asphyxiate
- Any other recognized serious safety or health hazard

## Entry Requirements
1. Obtain entry permit
2. Test atmosphere (O2, LEL, H2S, CO)
3. Establish continuous ventilation
4. Post attendant at entry point
5. Maintain communication
6. Have rescue plan in place

## Atmospheric Testing
- Oxygen: 19.5% - 23.5%
- Flammable gases: <10% LEL
- H2S: <10 ppm
- CO: <35 ppm`,
  },
  {
    id: "lib_014",
    type: "file",
    title: "Hazard Communication Program",
    description: "Company hazard communication program covering chemical labeling, SDS, and employee training requirements",
    tags: ["HazCom", "Chemical Safety", "OSHA", "SDS"],
    categories: ["Safety", "Compliance"],
    createdByUserId: "user_admin",
    createdAt: new Date("2024-07-10").toISOString(),
    updatedAt: new Date("2024-07-10").toISOString(),
    version: 1,
    sourceType: "policy",
    regulatoryRef: "OSHA 1910.1200",
    allowedForSynthesis: true,
    content: `# Hazard Communication Program

## Purpose
This program ensures all employees are informed about chemical hazards in the workplace through proper labeling, Safety Data Sheets (SDS), and training.

## Scope
Applies to all employees who may be exposed to hazardous chemicals during normal operations or foreseeable emergencies.

## Chemical Inventory
- Maintain a current list of all hazardous chemicals present
- Update inventory when new chemicals are introduced
- Remove chemicals no longer in use

## Container Labeling
All containers must include:
- Product identifier
- Signal word (Danger or Warning)
- Hazard statement(s)
- Pictogram(s)
- Precautionary statement(s)
- Manufacturer information

## Safety Data Sheets (SDS)
- Maintain SDS for every hazardous chemical on-site
- SDS must be accessible to employees during each shift
- SDS must follow the 16-section GHS format
- Review SDS before using any new chemical

## Employee Training
All employees must receive training on:
- Location and availability of the HazCom program
- How to read and interpret labels and SDS
- Physical and health hazards of chemicals in their work area
- Protective measures and emergency procedures
- Training must occur at initial hire and when new hazards are introduced`,
  },
  {
    id: "lib_015",
    type: "file",
    title: "Emergency Action Plan",
    description: "Comprehensive emergency action plan covering evacuation, shelter-in-place, and emergency response procedures",
    tags: ["Emergency", "Evacuation", "Safety", "OSHA"],
    categories: ["Safety", "Emergency"],
    createdByUserId: "user_admin",
    createdAt: new Date("2024-08-05").toISOString(),
    updatedAt: new Date("2024-08-05").toISOString(),
    version: 1,
    sourceType: "policy",
    regulatoryRef: "OSHA 1910.38",
    allowedForSynthesis: true,
    content: `# Emergency Action Plan

## Purpose
This plan establishes procedures for employee actions during workplace emergencies including fires, severe weather, chemical spills, and medical emergencies.

## Evacuation Procedures
1. Upon hearing the alarm, stop work immediately
2. Shut down equipment if safe to do so
3. Proceed to the nearest exit following posted routes
4. Do NOT use elevators
5. Assist persons with disabilities
6. Report to your designated assembly area
7. Account for all personnel in your area

## Assembly Areas
- Building A: North parking lot
- Building B: Employee park area
- Warehouse: South fence line
- Office: Front visitor parking

## Shelter-in-Place
For severe weather or external hazardous release:
1. Move to interior rooms on the lowest floor
2. Close all windows and doors
3. Shut off HVAC if instructed
4. Await all-clear from emergency coordinator

## Medical Emergencies
1. Call 911 (or internal extension 5555)
2. Administer first aid if trained
3. Do not move injured person unless in immediate danger
4. Meet emergency responders at the entrance

## Emergency Contacts
- Fire/Police/EMS: 911
- Plant Manager: Ext. 1001
- Safety Director: Ext. 1010
- Poison Control: 1-800-222-1222`,
  },
  {
    id: "lib_016",
    type: "file",
    title: "Machine Guarding Standards",
    description: "Requirements for machine guarding to protect workers from moving parts, pinch points, and other hazards",
    tags: ["Machine Guarding", "Safety", "OSHA", "Equipment"],
    categories: ["Safety", "Equipment"],
    createdByUserId: "user_admin",
    createdAt: new Date("2024-09-01").toISOString(),
    updatedAt: new Date("2024-09-01").toISOString(),
    version: 1,
    sourceType: "regulation",
    regulatoryRef: "OSHA 1910.212",
    allowedForSynthesis: true,
    content: `# Machine Guarding Standards

## Purpose
Machine guards protect workers from hazards created by the point of operation, in-going nip points, rotating parts, flying chips, and sparks.

## Guard Requirements
Guards must:
- Prevent contact with dangerous moving parts
- Be secure and not easily removed
- Create no new hazards (sharp edges, pinch points)
- Not interfere with machine operation
- Allow safe lubrication and maintenance

## Types of Guards
### Fixed Guards
- Permanent part of the machine
- Preferred method of guarding
- No moving parts; may be constructed of sheet metal, screen, bars

### Interlocked Guards
- When opened or removed, triggers a stop mechanism
- Cannot restart until guard is back in place
- Used where frequent access is needed

### Adjustable Guards
- Accommodate various sizes of stock
- Provide flexibility in feeding/removing material

### Self-Adjusting Guards
- Opening determined by movement of stock
- Guards return to rest position when stock is withdrawn

## Point-of-Operation Guarding
All machines where an employee is exposed to injury must be guarded. Common examples:
- Power presses: Barrier guards, two-hand controls
- Saws: Anti-kickback devices, blade guards
- Drills: Shields, jigs
- Grinders: Abrasive wheel guards, work rests

## Maintenance
- Inspect guards before each shift
- Report damaged or missing guards immediately
- Never operate a machine without all guards in place
- Lock out/tag out before removing guards for maintenance`,
  },
];
