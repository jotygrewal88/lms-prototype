// Epic 1G.7: AI Metadata Generation (mock implementation)
import { CourseMetadata, CourseStandards, OrgStyleGuide, StyleAuditIssue } from "@/types";
import { getCourseById, getLessonsByCourseId, getResourcesByLessonId, getOrganization } from "@/lib/store";

export interface MetaGenInput {
  courseId: string;
  scope: 'course' | 'lesson' | 'section'; // what text was analyzed
  sourceHtml: string; // concatenated content used
  orgStyle?: OrgStyleGuide;
}

export interface MetaGenOutput {
  objectives: string[];
  tags: string[];
  estimatedMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string; // infer from text (mock)
  readingLevel: 'basic' | 'standard' | 'technical';
  standards: CourseStandards; // suggest OSHA/MSHA/EPA codes where relevant
  rationale?: string; // short explanation
}

/**
 * Simple seeded random number generator for deterministic results
 */
function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/**
 * Extract keywords from HTML/text content
 */
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .split(/\s+/)
    .filter(w => w.length > 4 && !['this', 'that', 'with', 'from', 'about'].includes(w));
  
  // Count frequency
  const freq: Record<string, number> = {};
  words.forEach(w => {
    freq[w] = (freq[w] || 0) + 1;
  });
  
  // Return top 10 most frequent
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Detect language from text (mock - always returns 'en' or 'es' based on keywords)
 */
function detectLanguage(text: string): string {
  const spanishIndicators = ['español', 'seguridad', 'capacitación', 'equipo', 'trabajo'];
  const lowerText = text.toLowerCase();
  const spanishCount = spanishIndicators.filter(ind => lowerText.includes(ind)).length;
  return spanishCount >= 2 ? 'es' : 'en';
}

/**
 * Estimate reading level (mock - based on sentence length and word complexity)
 */
function estimateReadingLevel(text: string): 'basic' | 'standard' | 'technical' {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length > 0
    ? text.split(/\s+/).length / sentences.length
    : 0;
  
  const technicalTerms = ['protocol', 'procedure', 'regulation', 'compliance', 'hazard', 'assessment'];
  const techCount = technicalTerms.filter(term => text.toLowerCase().includes(term)).length;
  
  if (techCount > 5 || avgWordsPerSentence > 20) return 'technical';
  if (avgWordsPerSentence < 10) return 'basic';
  return 'standard';
}

/**
 * Estimate difficulty based on content
 */
function estimateDifficulty(text: string): 'beginner' | 'intermediate' | 'advanced' {
  const keywords = extractKeywords(text);
  const advancedTerms = ['advanced', 'complex', 'expert', 'certification', 'protocol'];
  const hasAdvanced = advancedTerms.some(term => text.toLowerCase().includes(term));
  
  if (hasAdvanced) return 'advanced';
  if (keywords.length > 8) return 'intermediate';
  return 'beginner';
}

/**
 * Suggest OSHA standards based on keywords
 */
function suggestStandards(text: string): CourseStandards {
  const lowerText = text.toLowerCase();
  const standards: CourseStandards = {};
  
  // OSHA 1910.178 - Powered Industrial Trucks (Forklifts)
  if (lowerText.includes('forklift') || lowerText.includes('lift truck') || lowerText.includes('pallet')) {
    standards.osha = ['1910.178'];
  }
  
  // OSHA 1910.147 - Lockout/Tagout
  if (lowerText.includes('lockout') || lowerText.includes('tagout') || lowerText.includes('loto')) {
    if (!standards.osha) standards.osha = [];
    standards.osha.push('1910.147');
  }
  
  // OSHA 1910.132 - Personal Protective Equipment
  if (lowerText.includes('ppe') || lowerText.includes('protective equipment') || lowerText.includes('safety equipment')) {
    if (!standards.osha) standards.osha = [];
    if (!standards.osha.includes('1910.132')) {
      standards.osha.push('1910.132');
    }
  }
  
  // OSHA 1910.134 - Respiratory Protection
  if (lowerText.includes('respirator') || lowerText.includes('respiratory') || lowerText.includes('air quality')) {
    if (!standards.osha) standards.osha = [];
    standards.osha.push('1910.134');
  }
  
  // MSHA - Mining related
  if (lowerText.includes('mining') || lowerText.includes('mine') || lowerText.includes('msha')) {
    standards.msha = ['30 CFR Part 46'];
  }
  
  // EPA - Environmental
  if (lowerText.includes('hazardous waste') || lowerText.includes('epa') || lowerText.includes('environmental')) {
    standards.epa = ['40 CFR Part 262'];
  }
  
  return standards;
}

/**
 * Generate course metadata from content
 */
export async function generateCourseMetadata(input: MetaGenInput): Promise<MetaGenOutput> {
  // Simulate async delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const seed = input.courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = seededRandom(seed);
  
  const text = input.sourceHtml.replace(/<[^>]*>/g, ' ').trim();
  const keywords = extractKeywords(text);
  const language = detectLanguage(text);
  const readingLevel = estimateReadingLevel(text);
  const difficulty = estimateDifficulty(text);
  
  // Generate objectives (3-5 bullets)
  const objectiveCount = 3 + Math.floor(random() * 3);
  const objectives: string[] = [];
  const objectiveTemplates = language === 'es' 
    ? [
        'Comprender los principios fundamentales de {topic}',
        'Aplicar procedimientos seguros para {topic}',
        'Identificar riesgos asociados con {topic}',
        'Demostrar competencia en {topic}',
        'Cumplir con los estándares de seguridad para {topic}',
      ]
    : [
        'Understand the fundamental principles of {topic}',
        'Apply safe procedures for {topic}',
        'Identify hazards associated with {topic}',
        'Demonstrate competency in {topic}',
        'Comply with safety standards for {topic}',
      ];
  
  for (let i = 0; i < objectiveCount; i++) {
    const template = objectiveTemplates[i % objectiveTemplates.length];
    const topic = keywords[Math.floor(random() * keywords.length)] || 'safety';
    objectives.push(template.replace('{topic}', topic));
  }
  
  // Generate tags (5-8)
  const tagCount = 5 + Math.floor(random() * 4);
  const tags = keywords.slice(0, tagCount).map(k => k.toLowerCase());
  
  // Estimate duration (based on content length)
  const wordCount = text.split(/\s+/).length;
  const estimatedMinutes = Math.max(15, Math.min(120, Math.floor(wordCount / 50)));
  
  // Suggest standards
  const standards = suggestStandards(text);
  
  const rationale = language === 'es'
    ? `Metadatos generados basados en análisis de contenido. Incluye ${objectiveCount} objetivos, ${tags.length} etiquetas, y estándares relevantes basados en palabras clave detectadas.`
    : `Metadata generated based on content analysis. Includes ${objectiveCount} objectives, ${tags.length} tags, and relevant standards based on detected keywords.`;
  
  return {
    objectives,
    tags,
    estimatedMinutes,
    difficulty,
    language,
    readingLevel,
    standards,
    rationale,
  };
}

/**
 * Audit style consistency against org style guide
 */
export async function auditStyleConsistency(input: MetaGenInput): Promise<StyleAuditIssue[]> {
  // Simulate async delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const issues: StyleAuditIssue[] = [];
  const styleGuide = input.orgStyle;
  
  if (!styleGuide) {
    return issues; // No style guide = no issues
  }
  
  const text = input.sourceHtml.replace(/<[^>]*>/g, ' ').toLowerCase();
  const course = getCourseById(input.courseId);
  const lessons = course ? getLessonsByCourseId(input.courseId) : [];
  
  // Check banned terms
  if (styleGuide.bannedTerms && styleGuide.bannedTerms.length > 0) {
    styleGuide.bannedTerms.forEach(bannedTerm => {
      const regex = new RegExp(`\\b${bannedTerm.toLowerCase()}\\b`, 'gi');
      if (regex.test(text)) {
        // Find which lesson/section contains it
        let location: { lessonId?: string; sectionId?: string } | undefined;
        
        for (const lesson of lessons) {
          const resources = getResourcesByLessonId(lesson.id);
          for (const resource of resources) {
            const resourceText = (resource.content || resource.title || '').toLowerCase();
            if (regex.test(resourceText)) {
              location = { lessonId: lesson.id, sectionId: resource.id };
              break;
            }
          }
          if (location) break;
        }
        
        issues.push({
          kind: 'bannedTerm',
          message: `Banned term "${bannedTerm}" found in content`,
          location,
          suggestion: `Replace "${bannedTerm}" with approved terminology`,
        });
      }
    });
  }
  
  // Check preferred terms
  if (styleGuide.preferredTerms && styleGuide.preferredTerms.length > 0) {
    styleGuide.preferredTerms.forEach(({ term, preferred }) => {
      const regex = new RegExp(`\\b${term.toLowerCase()}\\b`, 'gi');
      if (regex.test(text)) {
        let location: { lessonId?: string; sectionId?: string } | undefined;
        
        for (const lesson of lessons) {
          const resources = getResourcesByLessonId(lesson.id);
          for (const resource of resources) {
            const resourceText = (resource.content || resource.title || '').toLowerCase();
            if (regex.test(resourceText)) {
              location = { lessonId: lesson.id, sectionId: resource.id };
              break;
            }
          }
          if (location) break;
        }
        
        issues.push({
          kind: 'preferredTerm',
          message: `Use preferred term "${preferred}" instead of "${term}"`,
          location,
          suggestion: `Replace "${term}" with "${preferred}"`,
        });
      }
    });
  }
  
  // Check reading level
  if (styleGuide.readingLevelTarget) {
    const detectedLevel = estimateReadingLevel(input.sourceHtml);
    const targetLevel = styleGuide.readingLevelTarget;
    
    const levelOrder: Record<string, number> = { basic: 1, standard: 2, technical: 3 };
    if (levelOrder[detectedLevel] > levelOrder[targetLevel]) {
      issues.push({
        kind: 'readingLevel',
        message: `Content reading level (${detectedLevel}) exceeds target (${targetLevel})`,
        suggestion: `Simplify content to match ${targetLevel} reading level`,
      });
    }
  }
  
  // Check tone (mock - very basic)
  if (styleGuide.tone) {
    const textLower = text.toLowerCase();
    const casualIndicators = ['hey', 'guys', 'gonna', 'wanna', 'y\'all'];
    const formalIndicators = ['shall', 'must', 'hereby', 'pursuant'];
    
    const hasCasual = casualIndicators.some(ind => textLower.includes(ind));
    const hasFormal = formalIndicators.some(ind => textLower.includes(ind));
    
    if (styleGuide.tone === 'professional' && hasCasual) {
      issues.push({
        kind: 'tone',
        message: 'Casual language detected in professional content',
        suggestion: 'Use more formal, professional language',
      });
    } else if (styleGuide.tone === 'friendly' && hasFormal && !hasCasual) {
      issues.push({
        kind: 'tone',
        message: 'Overly formal language detected in friendly content',
        suggestion: 'Use more conversational, friendly language',
      });
    }
  }
  
  return issues;
}

/**
 * Run style audit across entire course and return all issues
 */
export async function runAuditAcrossCourse(courseId: string): Promise<StyleAuditIssue[]> {
  const course = getCourseById(courseId);
  if (!course) return [];
  
  const orgStyle = getOrganization().styleGuide;
  if (!orgStyle) return [];
  
  const allIssues: StyleAuditIssue[] = [];
  const lessons = getLessonsByCourseId(courseId);
  
  // Audit each lesson/section
  for (const lesson of lessons) {
    const resources = getResourcesByLessonId(lesson.id);
    
    for (const resource of resources) {
      if (resource.type === 'text' && resource.content) {
        const issues = await auditStyleConsistency({
          courseId,
          scope: 'section',
          sourceHtml: resource.content,
          orgStyle,
        });
        
        // Add location info to each issue
        issues.forEach(issue => {
          allIssues.push({
            ...issue,
            location: {
              lessonId: lesson.id,
              sectionId: resource.id,
            },
          });
        });
      }
    }
  }
  
  return allIssues;
}


