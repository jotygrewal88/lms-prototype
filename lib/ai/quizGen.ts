// Epic 1G.6: AI Quiz Generation (mock implementation)
import { Question, QuestionType, QuestionOption, QuestionMeta } from "@/types";
import { getCourseById, getLessonById, getResourceById, getResourcesByLessonId } from "@/lib/store";

export interface GenScope {
  type: 'section' | 'lesson' | 'course';
  id: string;
  language?: string;
  count?: number;
  mix?: QuestionType[];
  difficulty?: ('easy' | 'medium' | 'hard')[];
}

/**
 * Extract text content from a scope (course/lesson/section)
 */
function extractTextFromScope(scope: GenScope): string {
  let content = '';

  switch (scope.type) {
    case 'course': {
      const course = getCourseById(scope.id);
      if (course) {
        content = `${course.title}\n${course.description}\n`;
        // Add course tags and standards
        if (course.tags) content += `Tags: ${course.tags.join(', ')}\n`;
        if (course.standards) content += `Standards: ${course.standards.join(', ')}\n`;
      }
      break;
    }
    case 'lesson': {
      const lesson = getLessonById(scope.id);
      if (lesson) {
        content = `${lesson.title}\n`;
        // Add lesson resources content
        const resources = getResourcesByLessonId(scope.id);
        resources.forEach((r) => {
          if (r.content) content += `${r.content}\n`;
          if (r.title) content += `${r.title}\n`;
        });
      }
      break;
    }
    case 'section': {
      const resource = getResourceById(scope.id);
      if (resource) {
        content = `${resource.title}\n`;
        if (resource.content) content += `${resource.content}\n`;
      }
      break;
    }
  }

  return content.trim();
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
 * Generate an MCQ question
 */
function generateMCQQuestion(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  language: string = 'en'
): Question {
  const seed = topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = seededRandom(seed);
  
  const prompts: Record<string, Record<string, string[]>> = {
    en: {
      easy: [
        `What is the primary purpose of ${topic}?`,
        `Which of the following best describes ${topic}?`,
        `What is the main objective when working with ${topic}?`,
      ],
      medium: [
        `What should you do if you encounter a situation related to ${topic}?`,
        `Which principle is most important when dealing with ${topic}?`,
        `What is the correct procedure for ${topic}?`,
      ],
      hard: [
        `In complex scenarios involving ${topic}, what is the most critical consideration?`,
        `What advanced technique should be applied when ${topic} is involved?`,
        `Which factor is most likely to cause issues with ${topic}?`,
      ],
    },
    es: {
      easy: [
        `¿Cuál es el propósito principal de ${topic}?`,
        `¿Cuál de las siguientes opciones describe mejor ${topic}?`,
      ],
      medium: [
        `¿Qué debe hacer si encuentra una situación relacionada con ${topic}?`,
        `¿Cuál es el procedimiento correcto para ${topic}?`,
      ],
      hard: [
        `En escenarios complejos que involucran ${topic}, ¿cuál es la consideración más crítica?`,
      ],
    },
  };

  const promptPool = prompts[language]?.[difficulty] || prompts.en[difficulty];
  const prompt = promptPool[Math.floor(random() * promptPool.length)];

  // Generate 4 options
  const options: QuestionOption[] = [
    { id: 'opt_1', text: language === 'es' ? 'Opción correcta' : 'Correct answer', correct: true },
    { id: 'opt_2', text: language === 'es' ? 'Primera distracción' : 'First distractor', correct: false },
    { id: 'opt_3', text: language === 'es' ? 'Segunda distracción' : 'Second distractor', correct: false },
    { id: 'opt_4', text: language === 'es' ? 'Tercera distracción' : 'Third distractor', correct: false },
  ];

  // Shuffle options (except keep correct one)
  const correctOpt = options[0];
  const distractors = options.slice(1);
  for (let i = distractors.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
  }
  const shuffled = [correctOpt, ...distractors];
  const correctIndex = shuffled.indexOf(correctOpt);
  shuffled.forEach((opt, idx) => {
    opt.correct = idx === correctIndex;
  });

  const rationale = language === 'es'
    ? `Esta es la respuesta correcta porque está directamente relacionada con ${topic}.`
    : `This is the correct answer because it directly relates to ${topic}.`;

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: 'mcq',
    prompt,
    options: shuffled,
    meta: {
      difficulty,
      language,
      rationale,
      tags: [topic.toLowerCase(), difficulty],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a True/False question
 */
function generateTrueFalseQuestion(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  language: string = 'en'
): Question {
  const seed = topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = seededRandom(seed);
  
  const prompts: Record<string, Record<string, string[]>> = {
    en: {
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
    },
    es: {
      easy: [
        `${topic} es importante para la seguridad en el lugar de trabajo.`,
        `${topic} requiere capacitación adecuada.`,
      ],
      medium: [
        `${topic} debe completarse antes de comenzar el trabajo.`,
        `Solo personal capacitado debe manejar ${topic}.`,
      ],
      hard: [
        `Los protocolos de ${topic} tienen prioridad sobre otros procedimientos en situaciones de emergencia.`,
      ],
    },
  };

  const promptPool = prompts[language]?.[difficulty] || prompts.en[difficulty];
  const prompt = promptPool[Math.floor(random() * promptPool.length)];
  const answer = random() > 0.3; // 70% true, 30% false

  const rationale = language === 'es'
    ? answer
      ? `Esta afirmación es verdadera porque ${topic} es un componente crítico.`
      : `Esta afirmación es falsa porque hay excepciones a esta regla general sobre ${topic}.`
    : answer
      ? `This statement is true because ${topic} is a critical component.`
      : `This statement is false because there are exceptions to this general rule about ${topic}.`;

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: 'true_false',
    prompt,
    answer,
    meta: {
      difficulty,
      language,
      rationale,
      tags: [topic.toLowerCase(), difficulty],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a Scenario question
 */
function generateScenarioQuestion(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  language: string = 'en'
): Question {
  const seed = topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = seededRandom(seed);
  
  const scenarios: Record<string, Record<string, string[]>> = {
    en: {
      easy: [
        `You are working with ${topic}. A colleague asks you to skip a safety step. What should you do?`,
        `While handling ${topic}, you notice something unusual. What is your first action?`,
      ],
      medium: [
        `During a ${topic} operation, an unexpected situation arises. Which approach should you take?`,
        `You discover a potential issue related to ${topic}. What is the appropriate response?`,
      ],
      hard: [
        `In a complex scenario involving ${topic} and multiple hazards, what is the priority?`,
        `When ${topic} procedures conflict with time constraints, how should you proceed?`,
      ],
    },
    es: {
      easy: [
        `Estás trabajando con ${topic}. Un colega te pide que omitas un paso de seguridad. ¿Qué debes hacer?`,
      ],
      medium: [
        `Durante una operación de ${topic}, surge una situación inesperada. ¿Qué enfoque debes tomar?`,
      ],
      hard: [
        `En un escenario complejo que involucra ${topic} y múltiples peligros, ¿cuál es la prioridad?`,
      ],
    },
  };

  const scenarioPool = scenarios[language]?.[difficulty] || scenarios.en[difficulty];
  const prompt = scenarioPool[Math.floor(random() * scenarioPool.length)];

  const options: QuestionOption[] = [
    { id: 'opt_1', text: language === 'es' ? 'Respuesta correcta' : 'Correct response', correct: true },
    { id: 'opt_2', text: language === 'es' ? 'Primera alternativa' : 'First alternative', correct: false },
    { id: 'opt_3', text: language === 'es' ? 'Segunda alternativa' : 'Second alternative', correct: false },
    { id: 'opt_4', text: language === 'es' ? 'Tercera alternativa' : 'Third alternative', correct: false },
  ];

  // Shuffle options
  const correctOpt = options[0];
  const distractors = options.slice(1);
  for (let i = distractors.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
  }
  const shuffled = [correctOpt, ...distractors];
  const correctIndex = shuffled.indexOf(correctOpt);
  shuffled.forEach((opt, idx) => {
    opt.correct = idx === correctIndex;
  });

  const rationale = language === 'es'
    ? `Esta respuesta es correcta porque aborda adecuadamente el escenario relacionado con ${topic}.`
    : `This answer is correct because it properly addresses the scenario related to ${topic}.`;

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: 'scenario',
    prompt,
    options: shuffled,
    meta: {
      difficulty,
      language,
      rationale,
      tags: [topic.toLowerCase(), difficulty, 'scenario'],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a Short Text question
 */
function generateShortTextQuestion(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  language: string = 'en'
): Question {
  const seed = topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = seededRandom(seed);
  
  const prompts: Record<string, Record<string, string[]>> = {
    en: {
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
    },
    es: {
      easy: [
        `¿Cuál es el nombre completo de la organización responsable de ${topic}?`,
      ],
      medium: [
        `Nombre el estándar específico que se aplica a ${topic}.`,
      ],
    },
  };

  const promptPool = prompts[language]?.[difficulty] || prompts.en[difficulty];
  const prompt = promptPool[Math.floor(random() * promptPool.length)];

  // Generate a simple correct answer based on topic
  const correctAnswer = difficulty === 'easy' 
    ? `${topic} organization`
    : difficulty === 'medium'
    ? `${topic} standard`
    : `${topic} regulation`;

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: 'shorttext',
    prompt,
    correctAnswerText: correctAnswer,
    required: true,
    points: 1,
    meta: {
      difficulty,
      language,
      tags: [topic.toLowerCase(), difficulty],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a Multiple Select question
 */
function generateMultiselectQuestion(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  language: string = 'en'
): Question {
  const seed = topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = seededRandom(seed);
  
  const prompts: Record<string, Record<string, string[]>> = {
    en: {
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
    },
    es: {
      easy: [
        `¿Cuáles de los siguientes son componentes clave de ${topic}? (Seleccione todos los que apliquen)`,
      ],
      medium: [
        `¿Qué medidas de seguridad se aplican a ${topic}? (Seleccione todos los que apliquen)`,
      ],
    },
  };

  const promptPool = prompts[language]?.[difficulty] || prompts.en[difficulty];
  const prompt = promptPool[Math.floor(random() * promptPool.length)];

  // Generate 5-6 options with 2-3 correct answers
  const numCorrect = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 3;
  const options: QuestionOption[] = [
    { id: 'opt_1', text: language === 'es' ? 'Opción correcta 1' : 'Correct option 1', correct: true },
    { id: 'opt_2', text: language === 'es' ? 'Opción correcta 2' : 'Correct option 2', correct: true },
    { id: 'opt_3', text: language === 'es' ? 'Primera distracción' : 'First distractor', correct: false },
    { id: 'opt_4', text: language === 'es' ? 'Segunda distracción' : 'Second distractor', correct: false },
  ];

  if (numCorrect === 3) {
    options.push(
      { id: 'opt_5', text: language === 'es' ? 'Opción correcta 3' : 'Correct option 3', correct: true },
      { id: 'opt_6', text: language === 'es' ? 'Tercera distracción' : 'Third distractor', correct: false }
    );
  }

  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: 'multiselect',
    prompt,
    options,
    grading: {
      mode: difficulty === 'hard' ? 'partial' : 'all-or-nothing',
    },
    required: true,
    points: 1,
    meta: {
      difficulty,
      language,
      tags: [topic.toLowerCase(), difficulty],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a Numeric question
 */
function generateNumericQuestion(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  language: string = 'en'
): Question {
  const seed = topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = seededRandom(seed);
  
  const prompts: Record<string, Record<string, string[]>> = {
    en: {
      easy: [
        `How many steps are typically involved in ${topic}?`,
        `What is the minimum number of ${topic} components required?`,
      ],
      medium: [
        `What is the standard measurement for ${topic} (in the specified unit)?`,
        `How many hours of training are required for ${topic} certification?`,
      ],
      hard: [
        `What is the precise calculation result for ${topic} under standard conditions?`,
        `What is the threshold value (in specific units) for ${topic}?`,
      ],
    },
    es: {
      easy: [
        `¿Cuántos pasos típicamente están involucrados en ${topic}?`,
      ],
      medium: [
        `¿Cuál es la medición estándar para ${topic} (en la unidad especificada)?`,
      ],
    },
  };

  const promptPool = prompts[language]?.[difficulty] || prompts.en[difficulty];
  const prompt = promptPool[Math.floor(random() * promptPool.length)];

  // Generate a number based on difficulty
  const baseNumber = difficulty === 'easy' ? 5 + Math.floor(random() * 5) : 
                     difficulty === 'medium' ? 10 + Math.floor(random() * 20) :
                     50 + Math.floor(random() * 100);
  const tolerance = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 1 : 2;

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: 'numeric',
    prompt,
    correctNumber: baseNumber,
    tolerance,
    required: true,
    points: 1,
    meta: {
      difficulty,
      language,
      tags: [topic.toLowerCase(), difficulty],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate an Ordering question
 */
function generateOrderingQuestion(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  language: string = 'en'
): Question {
  const seed = topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = seededRandom(seed);
  
  const prompts: Record<string, Record<string, string[]>> = {
    en: {
      easy: [
        `Put the following steps for ${topic} in the correct order:`,
        `Arrange these ${topic} procedures in chronological order:`,
      ],
      medium: [
        `Order the following ${topic} safety protocols from first to last:`,
        `Sequence these ${topic} checkpoints in the proper workflow:`,
      ],
      hard: [
        `Arrange these complex ${topic} operations in the correct hierarchical order:`,
        `Order these advanced ${topic} techniques by priority:`,
      ],
    },
    es: {
      easy: [
        `Ponga los siguientes pasos para ${topic} en el orden correcto:`,
      ],
      medium: [
        `Ordene los siguientes protocolos de seguridad de ${topic} de primero a último:`,
      ],
    },
  };

  const promptPool = prompts[language]?.[difficulty] || prompts.en[difficulty];
  const prompt = promptPool[Math.floor(random() * promptPool.length)];

  // Generate 4-5 ordered steps
  const numSteps = difficulty === 'easy' ? 4 : 5;
  const options: QuestionOption[] = [];
  for (let i = 1; i <= numSteps; i++) {
    options.push({
      id: `opt_${i}`,
      text: language === 'es' 
        ? `Paso ${i} para ${topic}`
        : `Step ${i} for ${topic}`,
      correct: false, // Ordering doesn't use correct flag
    });
  }

  // Correct order is the current order of option IDs
  const correctOrder = options.map(opt => opt.id);

  // Shuffle for display (but we store the correct order)
  const shuffledOptions = [...options];
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    type: 'ordering',
    prompt,
    options: shuffledOptions, // Display shuffled, but correctOrder stores the answer
    correctOrder,
    required: true,
    points: 1,
    meta: {
      difficulty,
      language,
      tags: [topic.toLowerCase(), difficulty],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate questions from a scope (section/lesson/course)
 */
export async function generateQuestionsFromScope(
  scope: GenScope,
  sourceHtmlOrText?: string
): Promise<Question[]> {
  // Simulate async delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Extract text if not provided
  const sourceText = sourceHtmlOrText || extractTextFromScope(scope);
  
  // Extract topic/keywords from source text
  const words = sourceText.toLowerCase().split(/\s+/).filter(w => w.length > 4);
  const topic = words[0] || 'safety';
  
  const count = scope.count || 6;
  const mix = scope.mix || ['mcq', 'true_false', 'scenario'];
  const difficulties = scope.difficulty || ['easy', 'medium', 'hard'];
  const language = scope.language || 'en';

  const questions: Question[] = [];
  const seed = scope.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = seededRandom(seed);

  // Determine source metadata
  const sourceMeta = {
    type: scope.type,
    id: scope.id,
  };

  for (let i = 0; i < count; i++) {
    // Randomly select type and difficulty
    const type = mix[Math.floor(random() * mix.length)] as QuestionType;
    const difficulty = difficulties[Math.floor(random() * difficulties.length)] as 'easy' | 'medium' | 'hard';

    let question: Question;
    switch (type) {
      case 'mcq':
        question = generateMCQQuestion(topic, difficulty, language);
        break;
      case 'true_false':
        question = generateTrueFalseQuestion(topic, difficulty, language);
        break;
      case 'scenario':
        question = generateScenarioQuestion(topic, difficulty, language);
        break;
      case 'shorttext':
        question = generateShortTextQuestion(topic, difficulty, language);
        break;
      case 'multiselect':
        question = generateMultiselectQuestion(topic, difficulty, language);
        break;
      case 'numeric':
        question = generateNumericQuestion(topic, difficulty, language);
        break;
      case 'ordering':
        question = generateOrderingQuestion(topic, difficulty, language);
        break;
      default:
        question = generateMCQQuestion(topic, difficulty, language);
    }

    // Add source metadata
    question.meta = {
      ...question.meta,
      source: sourceMeta,
    };

    questions.push(question);
  }

  return questions;
}

