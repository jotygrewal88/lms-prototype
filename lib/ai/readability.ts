// Epic 1G.8: Mock Readability Analyzer
/**
 * Deterministic mock readability analyzer
 * Estimates reading level based on word length, sentence complexity
 */

export function estimateReadingLevel(html: string): 'basic' | 'standard' | 'technical' {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (!text) return 'standard';
  
  // Simple heuristics:
  // - Count words per sentence (avg)
  // - Count syllables per word (approx: word length > 6 chars = likely multi-syllable)
  // - Check for technical terms (long words, compound words)
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  if (sentences.length === 0 || words.length === 0) return 'standard';
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
  
  // Count technical indicators (long words, compound words)
  const technicalIndicators = words.filter(w => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    return clean.length > 10 || clean.includes('-') || /^[A-Z][a-z]+[A-Z]/.test(w);
  }).length;
  
  const technicalRatio = technicalIndicators / words.length;
  
  // Deterministic scoring (seeded)
  // Technical: high technical ratio (>0.15) OR very long avg words (>6.5) OR complex sentences (>25 words/sentence)
  if (technicalRatio > 0.15 || avgWordLength > 6.5 || avgWordsPerSentence > 25) {
    return 'technical';
  }
  
  // Basic: short words (<4.5) AND short sentences (<12 words/sentence) AND low technical ratio
  if (avgWordLength < 4.5 && avgWordsPerSentence < 12 && technicalRatio < 0.05) {
    return 'basic';
  }
  
  return 'standard';
}

export interface ToneDetection {
  match: boolean;
  detected: 'plain' | 'professional' | 'friendly';
  confidence: number;
}

export function detectTone(
  html: string,
  targetTone: 'plain' | 'professional' | 'friendly' | undefined
): ToneDetection {
  if (!targetTone) {
    return { match: true, detected: 'plain', confidence: 1.0 };
  }
  
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
  
  if (!text) {
    return { match: true, detected: targetTone, confidence: 1.0 };
  }
  
  // Casual/friendly indicators
  const casualIndicators = ['hey', 'guys', 'gonna', 'wanna', 'y\'all', 'awesome', 'cool', 'great', '!'];
  const casualCount = casualIndicators.filter(ind => text.includes(ind)).length;
  
  // Formal/professional indicators
  const formalIndicators = ['shall', 'must', 'hereby', 'pursuant', 'hereinafter', 'whereas', 'therefore', 'furthermore'];
  const formalCount = formalIndicators.filter(ind => text.includes(ind)).length;
  
  // Plain indicators (neutral, simple language)
  const plainIndicators = ['is', 'are', 'the', 'a', 'an', 'and', 'or', 'but'];
  const plainRatio = plainIndicators.filter(ind => text.split(' ').includes(ind)).length / text.split(' ').length;
  
  // Deterministic detection
  let detected: 'plain' | 'professional' | 'friendly' = 'plain';
  let confidence = 0.7;
  
  if (casualCount > formalCount && casualCount > 2) {
    detected = 'friendly';
    confidence = Math.min(0.9, 0.6 + (casualCount * 0.1));
  } else if (formalCount > casualCount && formalCount > 1) {
    detected = 'professional';
    confidence = Math.min(0.9, 0.6 + (formalCount * 0.1));
  } else if (plainRatio > 0.3) {
    detected = 'plain';
    confidence = 0.8;
  }
  
  const match = detected === targetTone;
  
  return { match, detected, confidence };
}

/**
 * Mock text simplification (shorter sentences, simpler words)
 */
export function simplifyText(text: string): string {
  // Deterministic mock: shorten sentences, replace complex words
  const replacements: Record<string, string> = {
    'utilize': 'use',
    'demonstrate': 'show',
    'facilitate': 'help',
    'implement': 'do',
    'substantial': 'large',
    'approximately': 'about',
    'subsequently': 'then',
    'therefore': 'so',
    'furthermore': 'also',
    'consequently': 'so',
  };
  
  let simplified = text;
  
  // Replace complex words
  Object.entries(replacements).forEach(([complex, simple]) => {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    simplified = simplified.replace(regex, simple);
  });
  
  // Split long sentences (rough heuristic)
  const sentences = simplified.split(/([.!?]+)/);
  const simplifiedSentences = sentences.map(sentence => {
    if (sentence.length > 80 && sentence.includes(',')) {
      // Try to split on commas
      const parts = sentence.split(',').map(p => p.trim());
      if (parts.length > 2) {
        return parts.slice(0, 2).join(', ') + '. ' + parts.slice(2).join(', ');
      }
    }
    return sentence;
  });
  
  return simplifiedSentences.join('');
}

/**
 * Mock professionalization (increase formality)
 */
export function professionalizeText(text: string): string {
  const replacements: Record<string, string> = {
    'hey': 'hello',
    'guys': 'team members',
    'gonna': 'going to',
    'wanna': 'want to',
    'y\'all': 'you all',
    'awesome': 'excellent',
    'cool': 'appropriate',
    'great': 'excellent',
    'do': 'implement',
    'use': 'utilize',
    'show': 'demonstrate',
    'help': 'facilitate',
    'about': 'approximately',
    'then': 'subsequently',
    'so': 'therefore',
    'also': 'furthermore',
  };
  
  let professionalized = text;
  
  // Replace casual words
  Object.entries(replacements).forEach(([casual, formal]) => {
    const regex = new RegExp(`\\b${casual}\\b`, 'gi');
    professionalized = professionalized.replace(regex, formal);
  });
  
  // Remove excessive exclamation marks
  professionalized = professionalized.replace(/!{2,}/g, '!');
  
  return professionalized;
}

/**
 * Mock clarification (shorter sentences)
 */
export function clarifyText(text: string): string {
  // Split long sentences into shorter ones
  const sentences = text.split(/([.!?]+)/);
  const clarified = sentences.map(sentence => {
    // If sentence is very long (>100 chars), try to split it
    if (sentence.trim().length > 100) {
      // Try splitting on common conjunctions
      const conjunctions = [' and ', ' but ', ' or ', ' because ', ' so '];
      for (const conj of conjunctions) {
        if (sentence.includes(conj)) {
          const parts = sentence.split(conj);
          if (parts.length > 1) {
            // Capitalize first letter of second part
            const secondPart = parts[1].trim();
            if (secondPart.length > 0) {
              const capitalized = secondPart[0].toUpperCase() + secondPart.slice(1);
              return parts[0] + '.' + ' ' + capitalized;
            }
          }
        }
      }
      
      // Try splitting on commas if sentence is very long
      if (sentence.includes(',')) {
        const parts = sentence.split(',');
        if (parts.length > 2) {
          const firstPart = parts[0].trim();
          const rest = parts.slice(1).join(',').trim();
          if (rest.length > 0 && rest.length < 80) {
            const capitalized = rest[0].toUpperCase() + rest.slice(1);
            return firstPart + '.' + ' ' + capitalized;
          }
        }
      }
    }
    return sentence;
  });
  
  return clarified.join('');
}




