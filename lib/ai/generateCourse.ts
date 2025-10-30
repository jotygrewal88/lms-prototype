import { AIInput, AICourseDraft } from "@/types";

/**
 * Epic 1G.1: Mock AI Course Generator
 * 
 * Generates a deterministic course draft from a natural language prompt.
 * No external API calls - purely local mock generation.
 */
export async function generateCourseFromPrompt(input: AIInput): Promise<AICourseDraft> {
  // Validate prompt length (min 8 chars)
  const topic = input.prompt.trim();
  const safeTopic = topic.length >= 8 ? topic : "OSHA Safety Basics";
  
  // Simulate async delay (300ms) for realistic UX
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate deterministic course structure
  return {
    title: `${safeTopic} — Essentials`,
    description: `A practical course covering ${safeTopic.toLowerCase()} with field-ready guidance for ${input.audienceLevel?.toLowerCase() || 'all'} level learners.`,
    tags: ["Safety", "OSHA", "Training"],
    estimatedMinutes: input.targetDurationMins ?? 45,
    lessons: [
      {
        title: "Introduction & Objectives",
        sections: [{
          kind: "TEXT",
          content: `# Introduction to ${safeTopic}

## What is ${safeTopic}?

${safeTopic} is a critical component of workplace safety and operational excellence. This training will equip you with the knowledge and skills needed to maintain a safe work environment.

## Why it Matters

Understanding and implementing proper ${safeTopic.toLowerCase()} protocols helps:
- Prevent workplace injuries and incidents
- Ensure regulatory compliance
- Protect workers and equipment
- Maintain operational efficiency

## Course Objectives

By the end of this course, you will be able to:
1. Identify key ${safeTopic.toLowerCase()} requirements
2. Apply proper procedures and best practices
3. Recognize and mitigate common hazards
4. Demonstrate compliance with relevant standards`
        }]
      },
      {
        title: "Core Standards & Requirements",
        sections: [{
          kind: "TEXT",
          content: `# Core Standards & Requirements

## Applicable OSHA Standards

This training covers the following OSHA requirements related to ${safeTopic.toLowerCase()}:

### Regulatory Framework
- 29 CFR 1910 - General Industry Standards
- 29 CFR 1926 - Construction Standards
- Applicable state and local regulations

### Key Requirements

**Documentation**: All ${safeTopic.toLowerCase()} activities must be properly documented and maintained according to OSHA recordkeeping requirements.

**Training**: Workers must receive comprehensive training before performing tasks related to ${safeTopic.toLowerCase()}.

**Inspections**: Regular inspections and assessments are required to ensure ongoing compliance.

### Employer Responsibilities

Employers are responsible for:
- Providing a safe work environment
- Ensuring proper training and certification
- Maintaining equipment and facilities
- Conducting regular safety assessments
- Documenting all safety-related activities

### Worker Responsibilities

Workers must:
- Follow all established procedures
- Use required personal protective equipment (PPE)
- Report hazards and unsafe conditions immediately
- Participate in required training programs
- Maintain awareness of safety protocols`
        }]
      },
      {
        title: "Procedures & Best Practices",
        sections: [{
          kind: "TEXT",
          content: `# Procedures & Best Practices

## Step-by-Step Procedures

### Pre-Task Planning

Before beginning any work related to ${safeTopic.toLowerCase()}:

1. **Assess the Work Area**
   - Identify potential hazards
   - Check environmental conditions
   - Verify equipment condition

2. **Review Procedures**
   - Consult relevant SOPs and work instructions
   - Review any applicable permits or authorizations
   - Understand emergency response procedures

3. **Gather Required Resources**
   - Personal protective equipment (PPE)
   - Tools and equipment
   - Safety equipment and barriers
   - Communication devices

### During Operations

**Do's:**
- Always follow established procedures
- Maintain clear communication with team members
- Stay alert and focused on the task
- Use appropriate PPE at all times
- Stop work if conditions become unsafe

**Don'ts:**
- Never take shortcuts or skip safety steps
- Don't proceed without proper training or authorization
- Avoid distractions while performing critical tasks
- Never work alone when procedures require assistance
- Don't ignore warning signs or equipment malfunctions

## Common Pitfalls to Avoid

1. **Rushing the Process** - Taking time to do things right is always safer
2. **Ignoring Warning Signs** - Early indicators often prevent larger problems
3. **Poor Communication** - Clear communication is essential for safety
4. **Inadequate Planning** - Proper preparation prevents incidents`
        }]
      },
      {
        title: "Hazards & Controls",
        sections: [{
          kind: "TEXT",
          content: `# Hazards & Controls

## Typical Hazards

When working with ${safeTopic.toLowerCase()}, be aware of these common hazards:

### Physical Hazards
- Slips, trips, and falls
- Struck-by or caught-between hazards
- Ergonomic strain and repetitive motion injuries
- Noise exposure

### Environmental Hazards
- Extreme temperatures
- Poor lighting conditions
- Confined spaces
- Weather-related hazards

### Equipment-Related Hazards
- Mechanical failures
- Electrical hazards
- Pressure hazards
- Moving parts and pinch points

## Hierarchy of Controls

Apply controls in this order of effectiveness:

1. **Elimination** - Remove the hazard entirely when possible
2. **Substitution** - Replace with less hazardous alternatives
3. **Engineering Controls** - Physical changes to minimize exposure
4. **Administrative Controls** - Policies and procedures to reduce risk
5. **Personal Protective Equipment (PPE)** - Last line of defense

## Required Personal Protective Equipment (PPE)

Depending on the specific task, PPE may include:

- **Head Protection** - Hard hats for overhead hazards
- **Eye Protection** - Safety glasses or goggles
- **Hearing Protection** - Earplugs or earmuffs in high-noise areas
- **Hand Protection** - Appropriate gloves for the task
- **Foot Protection** - Steel-toed boots or safety shoes
- **Body Protection** - High-visibility clothing, protective suits
- **Respiratory Protection** - When air quality is compromised

## Emergency Response Guidelines

In case of an incident:

1. **Immediate Response**
   - Stop work immediately
   - Ensure scene safety
   - Call for help if needed
   - Provide first aid if trained

2. **Notification**
   - Alert supervisor immediately
   - Contact emergency services if required
   - Notify safety personnel

3. **Documentation**
   - Complete incident reports
   - Preserve evidence
   - Cooperate with investigations`
        }]
      },
      {
        title: "Assessment & Review",
        sections: [{
          kind: "TEXT",
          content: `# Assessment & Review

## Course Summary

You have completed the essential training on ${safeTopic}. Let's review the key points:

### Key Takeaways

1. **Understanding Requirements** - You now know the applicable OSHA standards and regulatory requirements
2. **Following Procedures** - You can apply proper procedures and best practices
3. **Identifying Hazards** - You can recognize and control common hazards
4. **Using Controls** - You understand the hierarchy of controls and proper PPE usage
5. **Emergency Response** - You know how to respond to incidents appropriately

## Readiness Checklist

Before starting work, ensure you can answer "YES" to each of these:

- [ ] I understand the applicable safety standards and requirements
- [ ] I know the proper procedures for tasks related to ${safeTopic.toLowerCase()}
- [ ] I can identify common hazards and apply appropriate controls
- [ ] I know what PPE is required and how to use it properly
- [ ] I understand my responsibilities as a worker
- [ ] I know how to report hazards and unsafe conditions
- [ ] I am aware of emergency response procedures
- [ ] I will stop work if conditions become unsafe

## Continuing Education

Safety is an ongoing commitment. To maintain your knowledge:

- Participate in refresher training as required
- Stay informed about procedure updates
- Report near-misses and safety concerns
- Share lessons learned with colleagues
- Continuously improve your safety awareness

## Final Note

Remember: **Your safety and the safety of your coworkers depends on following these procedures every time**. If you're ever unsure about a task or procedure, stop and ask your supervisor for clarification.

## Next Steps

After completing the quiz, you will receive your certification. Keep this certification accessible and review the course materials as needed.

Thank you for completing this training on ${safeTopic}!`
        }]
      }
    ],
    quiz: {
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          question: `What is the primary goal of ${safeTopic} training?`,
          options: [
            "To complete compliance paperwork only",
            "To reduce risk and ensure safe operations",
            "To avoid all work activities",
            "To meet minimum regulatory requirements"
          ],
          correctIndex: 1,
          rationale: "The primary goal is to reduce workplace risks and ensure safe operations, not just check compliance boxes."
        },
        {
          type: "MULTIPLE_CHOICE",
          question: `Which of the following is an appropriate control measure for ${safeTopic}?`,
          options: [
            "Ignoring identified hazards",
            "Using proper PPE and following established SOPs",
            "Skipping safety inspections to save time",
            "Working without proper training"
          ],
          correctIndex: 1,
          rationale: "Using appropriate PPE and following Standard Operating Procedures are fundamental control measures."
        },
        {
          type: "MULTIPLE_CHOICE",
          question: `Who is responsible for maintaining safety related to ${safeTopic}?`,
          options: [
            "Only the safety manager",
            "Everyone involved in the work",
            "Only third-party contractors",
            "Only senior management"
          ],
          correctIndex: 1,
          rationale: "Safety is everyone's responsibility - from workers to supervisors to management."
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "What should you do if you encounter an unsafe condition?",
          options: [
            "Ignore it and continue working",
            "Stop work and report it immediately to your supervisor",
            "Try to fix it yourself without proper training",
            "Wait until the end of your shift to mention it"
          ],
          correctIndex: 1,
          rationale: "Unsafe conditions should be reported immediately. Never continue working in unsafe conditions."
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "In the hierarchy of controls, which is the MOST effective method?",
          options: [
            "Personal Protective Equipment (PPE)",
            "Administrative controls and procedures",
            "Elimination of the hazard",
            "Warning signs and labels"
          ],
          correctIndex: 2,
          rationale: "Elimination is the most effective control - removing the hazard entirely prevents exposure."
        }
      ]
    },
    aiMeta: {
      source: "AI",
      origin: "prompt",
      modelHint: "local-mock-v1",
      confidence: 0.85
    },
    previewInsights: {
      extractedTopics: ["Introduction", "Standards", "Procedures", "Hazards", "Assessment"],
      detectedHazards: ["Physical hazards", "Environmental factors", "Human error", "Equipment failure"],
      confidence: 0.85,
      source: {
        origin: "prompt",
        prompt: safeTopic
      }
    }
  };
}

/**
 * Epic 1G.2: File-Based Course Generator
 * 
 * Generates a course draft from parsed document content.
 * Tailored for SOPs, JHAs, and policy documents.
 */
export async function generateCourseFromFile(
  parsedData: { summary: string; detectedSections: string[]; filename: string },
  additionalContext?: string
): Promise<AICourseDraft> {
  // Extract topic from filename
  const baseTopic = parsedData.filename
    .replace(/\.(pdf|docx?|txt)$/i, '')
    .replace(/[_-]/g, ' ')
    .trim();
  
  const contextNote = additionalContext 
    ? `\n\nAdditional Context: ${additionalContext}` 
    : '';
  
  // Simulate processing delay (slightly longer than prompt-based)
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return {
    title: `${baseTopic} — Training Course`,
    description: `Comprehensive training derived from: ${parsedData.filename}. This course covers key procedures, responsibilities, and safety requirements.${contextNote}`,
    tags: ["Document-Based", "Safety", "Training", "Compliance"],
    estimatedMinutes: 60,
    lessons: [
      {
        title: "Overview & Purpose",
        sections: [{
          kind: "TEXT",
          content: `# Training Overview

This course is based on the document: **${parsedData.filename}**

## Purpose
Understanding and following the procedures outlined in this document is essential for:
- Maintaining workplace safety
- Ensuring regulatory compliance
- Protecting personnel and equipment
- Supporting operational excellence

## What You'll Learn
This training covers the key sections from the source document:
${parsedData.detectedSections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

${contextNote}`
        }]
      },
      {
        title: "Responsibilities & Roles",
        sections: [{
          kind: "TEXT",
          content: `# Responsibilities & Roles

## Management Responsibilities
- Ensure compliance with all procedures and regulations
- Provide necessary resources and support
- Conduct regular safety reviews and audits
- Support continuous improvement initiatives

## Supervisor Responsibilities
- Monitor adherence to established procedures
- Provide training and guidance to workers
- Investigate incidents and near-misses
- Maintain open communication channels

## Worker Responsibilities
- Follow all established procedures and work instructions
- Use required personal protective equipment (PPE)
- Report hazards, incidents, and unsafe conditions immediately
- Participate in training and safety initiatives
- Maintain competency in assigned tasks

## Shared Accountability
Safety is everyone's responsibility. Each person in the organization plays a critical role in maintaining a safe working environment.`
        }]
      },
      {
        title: "Procedures & Work Practices",
        sections: [{
          kind: "TEXT",
          content: `# Standard Operating Procedures

## Pre-Task Requirements

**Before Starting Work:**
1. Conduct a pre-task hazard assessment
2. Review applicable procedures and work instructions
3. Ensure all required equipment is available and functional
4. Verify that all personnel are trained and competent
5. Obtain necessary permits or authorizations

## During Operations

**Safe Work Practices:**
- Use appropriate personal protective equipment (PPE) at all times
- Follow established lockout/tagout procedures
- Maintain clear communication with team members
- Keep work areas clean and organized
- Monitor conditions and adjust work as needed

**Equipment Operation:**
- Inspect equipment before each use
- Operate only equipment you are trained and authorized to use
- Report any malfunctions or defects immediately
- Perform routine maintenance as required
- Store equipment properly when not in use

## Post-Task Activities

1. Secure the work area
2. Complete required documentation
3. Report any issues or concerns
4. Return equipment to proper storage
5. Participate in debriefs or lessons learned sessions

## Emergency Procedures

In case of an emergency:
- Stop work immediately
- Ensure scene safety
- Call for help if needed
- Follow emergency response procedures
- Report the incident to supervision`
        }]
      },
      {
        title: "Hazards & Control Measures",
        sections: [{
          kind: "TEXT",
          content: `# Hazard Identification & Control

## Common Workplace Hazards

### Physical Hazards
- Moving equipment and machinery
- Elevated work areas and fall hazards
- Noise and vibration
- Extreme temperatures
- Confined spaces

### Environmental Hazards
- Weather conditions
- Poor visibility or lighting
- Slippery or uneven surfaces
- Air quality concerns

### Human Factors
- Fatigue and workload
- Communication breakdowns
- Complacency and routine deviation
- Stress and time pressure

## Hierarchy of Controls

Apply controls in order of effectiveness:

1. **Elimination** - Remove the hazard entirely
2. **Substitution** - Replace with something less hazardous
3. **Engineering Controls** - Physical modifications to reduce exposure
4. **Administrative Controls** - Policies, procedures, training
5. **Personal Protective Equipment (PPE)** - Last line of defense

## Required PPE

Based on the hazard assessment, PPE may include:
- Hard hats for overhead protection
- Safety glasses or face shields
- Hearing protection in high-noise areas
- Gloves appropriate for the task
- Steel-toed safety boots
- High-visibility clothing
- Respiratory protection as needed

## Hazard Reporting

**Report immediately:**
- Unsafe conditions or equipment
- Near-miss incidents
- Actual incidents or injuries
- New or changed hazards
- Suggestions for improvement

Remember: If you see something unsafe, say something!`
        }]
      },
      {
        title: "Review & Assessment",
        sections: [{
          kind: "TEXT",
          content: `# Course Review & Assessment

## Key Takeaways

You should now understand:
- The purpose and scope of the procedures in **${parsedData.filename}**
- Your specific responsibilities and role
- Required procedures and safe work practices
- How to identify and control hazards
- Emergency response requirements

## Self-Check Questions

Before completing the quiz, ask yourself:
- Can I explain the main purpose of these procedures?
- Do I know my responsibilities in this process?
- Can I list the key steps required before starting work?
- Do I understand how to identify and report hazards?
- Am I clear on what PPE is required and when?

## Continuous Improvement

This document and training will be reviewed and updated regularly based on:
- Incident investigations and lessons learned
- Changes in regulations or best practices
- Worker feedback and suggestions
- New equipment or process changes
- Regular safety audits

## Additional Resources

For questions or clarifications:
- Contact your immediate supervisor
- Refer to the source document: ${parsedData.filename}
- Consult with safety personnel
- Review related procedures and work instructions

## Next Steps

Complete the assessment quiz to demonstrate your understanding of this training material. You must achieve a passing score to complete this course.`
        }]
      }
    ],
    quiz: {
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          question: `What is the primary purpose of the procedures outlined in ${parsedData.filename}?`,
          options: [
            "To create paperwork requirements",
            "To ensure safety and regulatory compliance",
            "To slow down work operations",
            "To assign blame when incidents occur"
          ],
          correctIndex: 1,
          rationale: "The primary purpose is to ensure workplace safety and maintain regulatory compliance while protecting personnel and equipment."
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "According to the hierarchy of controls, which is the MOST effective method?",
          options: [
            "Personal Protective Equipment (PPE)",
            "Administrative controls and training",
            "Elimination of the hazard",
            "Warning signs and labels"
          ],
          correctIndex: 2,
          rationale: "Elimination is the most effective control - removing the hazard entirely is always preferred when possible."
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "Who is responsible for workplace safety?",
          options: [
            "Only the safety manager",
            "Everyone in the organization",
            "Only supervisors and managers",
            "Only workers performing the tasks"
          ],
          correctIndex: 1,
          rationale: "Safety is a shared responsibility - everyone from management to front-line workers plays a critical role."
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "What should you do if you identify an unsafe condition?",
          options: [
            "Ignore it if it doesn't affect your work",
            "Wait until the end of your shift to mention it",
            "Report it immediately to your supervisor",
            "Try to fix it yourself without telling anyone"
          ],
          correctIndex: 2,
          rationale: "Unsafe conditions should always be reported immediately to allow for prompt correction and prevent incidents."
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "Before starting work, you should conduct a:",
          options: [
            "Social media check",
            "Pre-task hazard assessment",
            "Coffee break",
            "Performance review"
          ],
          correctIndex: 1,
          rationale: "A pre-task hazard assessment is essential to identify and control hazards before beginning work."
        }
      ]
    },
    aiMeta: {
      source: "AI",
      origin: "file",
      modelHint: "document-parser-mock-v1",
      confidence: 0.85
    },
    previewInsights: {
      extractedTopics: parsedData.detectedSections,
      detectedHazards: ["Physical hazards", "Chemical exposure", "Electrical hazards", "Slip/trip risks", "Equipment hazards"],
      confidence: 0.80,
      source: {
        origin: "file",
        filename: parsedData.filename,
        prompt: additionalContext
      }
    }
  };
}

