// Phase II 1I.2: AI Quiz Generation API
import { Question, QuestionType, QuestionOption, QuestionMeta } from "@/types";

export interface AIQuestion extends Question {
  meta: QuestionMeta & {
    source: 'AI';
    confidenceScore: number;
  };
}

export interface QuizGenerationContext {
  lessonText?: string;
  pdfText?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  questionCount?: number;
  questionTypes?: QuestionType[];
  bloomsLevel?: 'knowledge' | 'comprehension' | 'application' | 'analysis';
}

/**
 * Map difficulty levels to internal difficulty values
 */
function mapDifficulty(difficulty?: 'beginner' | 'intermediate' | 'advanced'): 'easy' | 'medium' | 'hard' {
  switch (difficulty) {
    case 'beginner':
      return 'easy';
    case 'intermediate':
      return 'medium';
    case 'advanced':
      return 'hard';
    default:
      return 'medium';
  }
}

/**
 * Generate a random confidence score between 0.7 and 0.95
 */
function generateConfidenceScore(): number {
  return Math.round((0.7 + Math.random() * 0.25) * 100) / 100;
}

/**
 * Extract keywords/topics from context text
 */
function extractTopics(context: string): string[] {
  const words = context.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4)
    .filter((w, i, arr) => arr.indexOf(w) === i); // unique
  
  return words.slice(0, 5); // Return top 5 unique words
}

/**
 * Generate an MCQ question based on context
 */
function generateMCQ(context: string, difficulty: 'easy' | 'medium' | 'hard', bloomsLevel?: string): AIQuestion {
  const topics = extractTopics(context);
  const topic = topics[0] || 'safety';
  const random = Math.random();
  
  const prompts: Record<string, string[]> = {
    easy: [
      `What is the primary purpose of ${topic}?`,
      `Which of the following best describes ${topic}?`,
      `What is the main objective when working with ${topic}?`,
      `What is ${topic} primarily used for?`,
    ],
    medium: [
      `What should you do if you encounter a situation related to ${topic}?`,
      `Which principle is most important when dealing with ${topic}?`,
      `What is the correct procedure for ${topic}?`,
      `How should ${topic} be handled safely?`,
    ],
    hard: [
      `In complex scenarios involving ${topic}, what is the most critical consideration?`,
      `What advanced technique should be applied when ${topic} is involved?`,
      `Which factor is most likely to cause issues with ${topic}?`,
      `What is the most sophisticated approach to managing ${topic}?`,
    ],
  };

  const promptPool = prompts[difficulty];
  const prompt = promptPool[Math.floor(random * promptPool.length)];

  // Generate 4 options with one correct answer
  const options: QuestionOption[] = [
    { id: 'opt_1', text: `Correct answer about ${topic}`, correct: true },
    { id: 'opt_2', text: `Incorrect option related to ${topic}`, correct: false },
    { id: 'opt_3', text: `Another distractor for ${topic}`, correct: false },
    { id: 'opt_4', text: `Common misconception about ${topic}`, correct: false },
  ];

  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  // Re-mark correct answer
  const correctIndex = options.findIndex(opt => opt.id === 'opt_1');
  options.forEach((opt, idx) => {
    opt.correct = idx === correctIndex;
  });

  const explanation = `This is the correct answer because it directly relates to ${topic} and aligns with best practices.`;

  return {
    id: `q_ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: 'mcq',
    prompt,
    options,
    explanation,
    required: true,
    points: 1,
    meta: {
      source: 'AI',
      confidenceScore: generateConfidenceScore(),
      difficulty,
      bloomsLevel: bloomsLevel as any,
      rationale: explanation,
      tags: [topic, difficulty],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a True/False question
 */
function generateTrueFalse(context: string, difficulty: 'easy' | 'medium' | 'hard', bloomsLevel?: string): AIQuestion {
  const topics = extractTopics(context);
  const topic = topics[0] || 'safety';
  const random = Math.random();
  
  const prompts: Record<string, string[]> = {
    easy: [
      `${topic} is important for workplace safety.`,
      `${topic} requires proper training.`,
      `You should always follow ${topic} procedures.`,
    ],
    medium: [
      `${topic} must be completed before starting work.`,
      `Only trained personnel should handle ${topic}.`,
      `${topic} compliance is mandatory.`,
    ],
    hard: [
      `${topic} protocols supersede all other procedures in emergency situations.`,
      `Advanced ${topic} techniques require certification.`,
    ],
  };

  const promptPool = prompts[difficulty];
  const prompt = promptPool[Math.floor(random * promptPool.length)];
  const answer = random > 0.3; // 70% true, 30% false

  const explanation = answer
    ? `This statement is true because ${topic} is a critical component.`
    : `This statement is false because there are exceptions to this general rule about ${topic}.`;

  return {
    id: `q_ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: 'true_false',
    prompt,
    answer,
    explanation,
    required: true,
    points: 1,
    meta: {
      source: 'AI',
      confidenceScore: generateConfidenceScore(),
      difficulty,
      bloomsLevel: bloomsLevel as any,
      rationale: explanation,
      tags: [topic, difficulty],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a Multi-select question
 */
function generateMultiselect(context: string, difficulty: 'easy' | 'medium' | 'hard', bloomsLevel?: string): AIQuestion {
  const topics = extractTopics(context);
  const topic = topics[0] || 'safety';
  const random = Math.random();
  
  const prompts: Record<string, string[]> = {
    easy: [
      `Which of the following are key components of ${topic}? (Select all that apply)`,
      `What are the main characteristics of ${topic}? (Select all that apply)`,
    ],
    medium: [
      `Which safety measures apply to ${topic}? (Select all that apply)`,
      `What are the required steps for ${topic}? (Select all that apply)`,
    ],
    hard: [
      `Which advanced concepts are related to ${topic}? (Select all that apply)`,
      `What are the critical factors in complex ${topic} scenarios? (Select all that apply)`,
    ],
  };

  const promptPool = prompts[difficulty];
  const prompt = promptPool[Math.floor(random * promptPool.length)];

  // Generate 5-6 options with 2-3 correct answers
  const numCorrect = difficulty === 'easy' ? 2 : 3;
  const options: QuestionOption[] = [
    { id: 'opt_1', text: `Correct option 1 for ${topic}`, correct: true },
    { id: 'opt_2', text: `Correct option 2 for ${topic}`, correct: true },
    { id: 'opt_3', text: `Incorrect option for ${topic}`, correct: false },
    { id: 'opt_4', text: `Another distractor for ${topic}`, correct: false },
  ];

  if (numCorrect === 3) {
    options.push(
      { id: 'opt_5', text: `Correct option 3 for ${topic}`, correct: true },
      { id: 'opt_6', text: `Additional distractor for ${topic}`, correct: false }
    );
  }

  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  const explanation = `Select all options that accurately describe ${topic}.`;

  return {
    id: `q_ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: 'multiselect',
    prompt,
    options,
    explanation,
    grading: {
      mode: difficulty === 'hard' ? 'partial' : 'all-or-nothing',
    },
    required: true,
    points: 1,
    meta: {
      source: 'AI',
      confidenceScore: generateConfidenceScore(),
      difficulty,
      bloomsLevel: bloomsLevel as any,
      rationale: explanation,
      tags: [topic, difficulty],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a Short Answer question
 */
function generateShortAnswer(context: string, difficulty: 'easy' | 'medium' | 'hard', bloomsLevel?: string): AIQuestion {
  const topics = extractTopics(context);
  const topic = topics[0] || 'safety';
  const random = Math.random();
  
  const prompts: Record<string, string[]> = {
    easy: [
      `What is the full name of the organization responsible for ${topic}?`,
      `What does the acronym ${topic.toUpperCase()} stand for?`,
    ],
    medium: [
      `Name the specific standard that applies to ${topic}.`,
      `What is the technical term for ${topic}?`,
    ],
    hard: [
      `What is the specific regulation number that governs ${topic}?`,
      `What is the scientific name for the process involved in ${topic}?`,
    ],
  };

  const promptPool = prompts[difficulty];
  const prompt = promptPool[Math.floor(random * promptPool.length)];

  const correctAnswer = difficulty === 'easy' 
    ? `${topic} organization`
    : difficulty === 'medium'
    ? `${topic} standard`
    : `${topic} regulation`;

  const explanation = `The correct answer relates directly to ${topic} and matches the specified standard.`;

  return {
    id: `q_ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: 'shorttext',
    prompt,
    correctAnswerText: correctAnswer,
    explanation,
    required: true,
    points: 1,
    meta: {
      source: 'AI',
      confidenceScore: generateConfidenceScore(),
      difficulty,
      bloomsLevel: bloomsLevel as any,
      rationale: explanation,
      tags: [topic, difficulty],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate quiz questions from context
 * This simulates AI generation but is structured to plug into /api/ai/quiz in production
 */
export async function generateQuizFromContext(context: QuizGenerationContext): Promise<AIQuestion[]> {
  // Simulate async delay (300-800ms)
  const delay = 300 + Math.random() * 500;
  await new Promise(resolve => setTimeout(resolve, delay));

  const {
    lessonText,
    pdfText,
    difficulty = 'intermediate',
    questionCount = 10,
    questionTypes = ['mcq', 'true_false'],
    bloomsLevel,
  } = context;

  // Combine all context sources
  const combinedText = [lessonText, pdfText].filter(Boolean).join('\n\n');
  
  if (!combinedText.trim()) {
    throw new Error('No source material provided. Please provide lesson text, PDF content, or manual paste.');
  }

  const mappedDifficulty = mapDifficulty(difficulty);
  const questions: AIQuestion[] = [];
  
  // Generate questions based on requested types
  const availableTypes = questionTypes.length > 0 ? questionTypes : ['mcq', 'true_false'];
  
  for (let i = 0; i < questionCount; i++) {
    const typeIndex = i % availableTypes.length;
    const questionType = availableTypes[typeIndex] as QuestionType;

    let question: AIQuestion;
    switch (questionType) {
      case 'mcq':
        question = generateMCQ(combinedText, mappedDifficulty, bloomsLevel);
        break;
      case 'true_false':
        question = generateTrueFalse(combinedText, mappedDifficulty, bloomsLevel);
        break;
      case 'multiselect':
        question = generateMultiselect(combinedText, mappedDifficulty, bloomsLevel);
        break;
      case 'shorttext':
        question = generateShortAnswer(combinedText, mappedDifficulty, bloomsLevel);
        break;
      default:
        question = generateMCQ(combinedText, mappedDifficulty, bloomsLevel);
    }

    questions.push(question);
  }

  return questions;
}

// Phase II 1I.3: Remediation Notes Generation

/**
 * Generate remediation notes based on missed objectives
 */
export async function generateRemediationNotes(ctx: {
  lessonText: string;
  missedObjectives: string[];
  quizTitle?: string;
}): Promise<string> {
  // Simulate async delay
  const delay = 200 + Math.random() * 300;
  await new Promise(resolve => setTimeout(resolve, delay));

  const { lessonText, missedObjectives, quizTitle } = ctx;
  
  if (!lessonText.trim() || missedObjectives.length === 0) {
    return 'Review the lesson content carefully and pay attention to the concepts you missed.';
  }

  // Generate targeted review notes based on missed objectives
  const objectivesList = missedObjectives.join(', ');
  const notes = `## Review Focus Areas

Based on your quiz results, here are the key areas to review:

**Topics to focus on:** ${objectivesList}

### Key Points to Remember:

${missedObjectives.map((obj, idx) => {
  return `${idx + 1}. **${obj}**: Review the lesson content related to ${obj}. Make sure you understand the core concepts and how they apply.`;
}).join('\n\n')}

### Tips for Success:

- Take your time reading through the lesson materials
- Pay special attention to examples and explanations
- Practice applying these concepts before retaking the quiz
- If you're still unsure, review the resources provided in the lesson

### Next Steps:

Complete the mini-quiz below to test your understanding. Once you pass the mini-quiz, you'll be able to retake the full quiz.`;

  return notes;
}

// Phase II 1I.3: Mini-Quiz Generation

/**
 * Generate a focused mini-quiz based on missed objectives
 */
export async function generateMiniQuiz(ctx: {
  lessonText: string;
  missedObjectives: string[];
  count: number; // 2-4 questions
}): Promise<AIQuestion[]> {
  // Simulate async delay
  const delay = 200 + Math.random() * 300;
  await new Promise(resolve => setTimeout(resolve, delay));

  const { lessonText, missedObjectives, count } = ctx;
  
  if (!lessonText.trim() || missedObjectives.length === 0) {
    // Generate generic questions if no objectives
    return [
      generateMCQ(lessonText, 'medium'),
      generateTrueFalse(lessonText, 'medium'),
    ].slice(0, count);
  }

  // Generate questions focused on missed objectives
  const questions: AIQuestion[] = [];
  const questionCount = Math.min(count, 4); // Max 4 questions
  
  for (let i = 0; i < questionCount; i++) {
    const objective = missedObjectives[i % missedObjectives.length];
    const contextWithObjective = `${lessonText}\n\nFocus on: ${objective}`;
    
    // Alternate between question types
    if (i % 2 === 0) {
      questions.push(generateMCQ(contextWithObjective, 'medium'));
    } else {
      questions.push(generateTrueFalse(contextWithObjective, 'medium'));
    }
  }

  return questions;
}


