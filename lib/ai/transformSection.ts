/**
 * Epic 1G.3: AI Section Transformations
 * Mock functions that simulate AI-powered content editing
 */

export interface SectionTransformContext {
  topic?: string;
  lessonTitle?: string;
  documentName?: string;
}

/**
 * Regenerates a section with improved clarity and structure
 */
export async function regenerateSection(
  text: string, 
  context?: SectionTransformContext
): Promise<string> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const topic = context?.topic || "this topic";
  
  return `# Updated: ${context?.lessonTitle || "Content"}

## Overview
${text.split('\n')[0] || 'This section has been regenerated for clarity.'}

## Key Points
- Refined explanation with practical examples
- Clearer safety procedures and requirements
- Enhanced context for ${topic}
- Step-by-step guidance for field application

## Important Notes
Always follow established procedures and consult with your supervisor if you have any questions about ${topic}.

${text.length > 200 ? '\n\n' + text.substring(0, 200) + '...' : ''}`;
}

/**
 * Simplifies a section to plain language
 */
export async function simplifySection(text: string): Promise<string> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Extract first few sentences
  const sentences = text.split('.').filter(s => s.trim().length > 0).slice(0, 3);
  
  return `## Simplified Version

**In simple terms:**

${sentences.map((s, i) => `${i + 1}. ${s.trim()}`).join('\n')}

**Key actions:**
- Follow the procedures as written
- Use required safety equipment
- Ask questions if anything is unclear
- Report hazards immediately

This simplified version covers the essentials. Refer to the full course content for complete details.`;
}

/**
 * Expands a section with additional detail and checklists
 */
export async function expandSection(text: string): Promise<string> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 900));
  
  return `${text}

---

## Additional Details

### Pre-Task Checklist
- [ ] Review applicable procedures and work instructions
- [ ] Verify all required equipment is available
- [ ] Ensure proper training and authorization
- [ ] Conduct hazard assessment
- [ ] Obtain necessary permits

### During Task
**Best Practices:**
1. Maintain situational awareness at all times
2. Follow established communication protocols
3. Use appropriate personal protective equipment (PPE)
4. Monitor changing conditions continuously
5. Stop work if unsafe conditions develop

### Post-Task
- Complete required documentation
- Conduct brief debriefing
- Report any issues or near-misses
- Secure equipment and work area
- Participate in lessons learned sessions

### Common Pitfalls to Avoid
- Rushing through procedures
- Skipping safety steps
- Poor communication with team
- Inadequate planning
- Ignoring early warning signs

### Additional Resources
Consult your supervisor, safety personnel, or relevant SOPs for further guidance on this topic.`;
}

/**
 * Rewrites a lesson summary (first section)
 */
export async function rewriteLessonSummary(
  lessonTitle: string,
  originalContent: string
): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return `# ${lessonTitle} - Overview

## Learning Objectives
By the end of this lesson, you will be able to:
- Understand the key concepts and principles
- Apply procedures in real-world scenarios
- Identify and control relevant hazards
- Demonstrate compliance with requirements

## Key Takeaways
${originalContent.split('\n').slice(0, 3).join('\n')}

## Why This Matters
This lesson provides essential knowledge for safe and effective operations. Understanding these principles helps protect you, your colleagues, and the workplace.`;
}

/**
 * Transform a section based on a custom user prompt
 */
export async function transformSectionWithPrompt(
  text: string,
  prompt: string,
  context?: SectionTransformContext
): Promise<string> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const promptLower = prompt.toLowerCase();
  const topic = context?.topic || "this topic";
  const lessonTitle = context?.lessonTitle || "Content";
  
  // Parse the prompt to determine what transformation to apply
  // This is a mock implementation - in production, this would call an actual AI API
  
  // Shorten/condense requests
  if (promptLower.includes('shorter') || promptLower.includes('condense') || promptLower.includes('brief')) {
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10).slice(0, 4);
    return `${lessonTitle}

${sentences.map(s => s.trim()).join('. ')}.

Key Points:
• Follow established safety procedures
• Use required protective equipment
• Report any concerns to your supervisor`;
  }
  
  // Add detail/expand requests
  if (promptLower.includes('detail') || promptLower.includes('expand') || promptLower.includes('more info')) {
    return `${text}

Additional Information:

This section covers essential aspects of ${topic}. Here are some additional details to consider:

• Background: Understanding the context helps ensure proper implementation
• Best Practices: Follow industry standards and company procedures
• Common Challenges: Be aware of potential obstacles and how to address them
• Resources: Consult your supervisor or safety manual for additional guidance

Remember: Safety is everyone's responsibility. When in doubt, ask for clarification before proceeding.`;
  }
  
  // Bullet point requests
  if (promptLower.includes('bullet') || promptLower.includes('list') || promptLower.includes('points')) {
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
    return `${lessonTitle}

Key Points:
${sentences.slice(0, 8).map(s => `• ${s.trim()}`).join('\n')}

Action Items:
• Review this information before starting work
• Apply these principles in daily operations
• Ask questions if anything is unclear`;
  }
  
  // Add examples requests
  if (promptLower.includes('example') || promptLower.includes('scenario')) {
    return `${text}

Practical Examples:

Example 1: Routine Operations
When performing daily tasks related to ${topic}, always follow the established procedures. For instance, before starting any work, conduct a brief assessment of your surroundings and verify that all safety measures are in place.

Example 2: Handling Unexpected Situations
If you encounter an unexpected condition while working, stop immediately and assess the situation. Do not proceed until you have consulted with your supervisor and taken appropriate precautions.Example 3: Team Communication
Effective communication is essential. Before, during, and after tasks, ensure all team members are informed of the procedures, hazards, and any changes to the plan.`;
  }
  
  // Safety focus requests
  if (promptLower.includes('safety') || promptLower.includes('hazard') || promptLower.includes('risk')) {
    return `${text}

Safety Considerations:

Hazard Awareness:
• Identify potential hazards before starting any task
• Never bypass safety controls or procedures
• Report unsafe conditions immediately

Personal Protection:
• Always use required personal protective equipment (PPE)
• Verify equipment is in good condition before use
• Follow proper procedures for donning and doffing PPE

Emergency Procedures:
• Know the location of emergency equipment
• Understand evacuation routes and assembly points
• Report all incidents, injuries, and near-misses

Remember: Your safety and the safety of your coworkers depends on following established procedures. If something seems unsafe, stop and ask for guidance.`;
  }
  
  // Default: general improvement based on the prompt
  return `${lessonTitle}

${text}

[Updated based on your request: "${prompt}"]

This content has been refined to address your specific requirements. The key information has been preserved while incorporating the changes you requested.

Important Notes:
• Review this section carefully before proceeding
• Apply these concepts in your daily work
• Consult with your supervisor if you have questions`;
}