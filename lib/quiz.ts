// Phase II 1I.1: Quiz grading helpers
import { Question } from "@/types";

/**
 * Grade a single question
 * Supports: mcq, multiselect, true_false, shorttext (case-insensitive)
 * Handles partial credit for multiselect if configured
 */
export function gradeQuestion(
  question: Question,
  answerValue: string | string[] | undefined
): { correct: boolean; pointsAwarded: number; correctAnswer?: any } {
  const pointsPossible = question.points ?? 1;

  if (!answerValue || (typeof answerValue === 'string' && answerValue.trim() === '')) {
    return { correct: false, pointsAwarded: 0, correctAnswer: getCorrectAnswer(question) };
  }

  let correct = false;
  let pointsAwarded = 0;

  // Normalize answerValue to string for processing
  const answerStr = Array.isArray(answerValue) ? answerValue.join(',') : answerValue;

  switch (question.type) {
    case 'mcq':
    case 'scenario':
      const selectedOption = question.options?.find(opt => opt.id === answerStr);
      correct = selectedOption?.correct === true;
      pointsAwarded = correct ? pointsPossible : 0;
      break;

    case 'true_false':
      const answerBool = answerStr === 'true';
      correct = question.answer === answerBool;
      pointsAwarded = correct ? pointsPossible : 0;
      break;

    case 'shorttext':
      const normalizedAnswer = answerStr.trim().toLowerCase();
      const normalizedCorrect = question.correctAnswerText?.trim().toLowerCase();
      correct = normalizedAnswer === normalizedCorrect;
      pointsAwarded = correct ? pointsPossible : 0;
      break;

    case 'multiselect':
      const chosen = new Set(answerStr.split(',').map(id => id.trim()).filter(id => id));
      const correctOptions = question.options?.filter(o => o.correct).map(o => o.id) || [];
      const correctSet = new Set(correctOptions);

      if (question.grading?.mode === 'partial') {
        // Partial credit: award based on intersection, penalize for incorrect
        const intersection = new Set([...chosen].filter(x => correctSet.has(x)));
        const incorrectChosen = new Set([...chosen].filter(x => !correctSet.has(x)));
        const totalOptions = question.options?.length || 1;

        const baseScore = (intersection.size / correctSet.size) * pointsPossible;
        const penalty = (incorrectChosen.size / totalOptions) * pointsPossible * 0.5;
        pointsAwarded = Math.max(0, baseScore - penalty);
        correct = pointsAwarded === pointsPossible; // Only "correct" if full points
      } else {
        // All-or-nothing: sets must match exactly
        correct = chosen.size === correctSet.size &&
          [...chosen].every(id => correctSet.has(id));
        pointsAwarded = correct ? pointsPossible : 0;
      }
      break;

    case 'numeric':
      const learnerNumber = parseFloat(answerStr);
      if (isNaN(learnerNumber) || !isFinite(learnerNumber)) {
        correct = false;
        pointsAwarded = 0;
      } else {
        const correctNumber = question.correctNumber ?? 0;
        const tolerance = question.tolerance ?? 0;
        const difference = Math.abs(learnerNumber - correctNumber);
        correct = difference <= tolerance;
        pointsAwarded = correct ? pointsPossible : 0;
      }
      break;

    case 'ordering':
      const learnerOrder = answerStr.split(',').map(id => id.trim()).filter(id => id);
      const correctOrder = question.correctOrder || [];

      correct = learnerOrder.length === correctOrder.length &&
        learnerOrder.every((id, index) => id === correctOrder[index]);
      pointsAwarded = correct ? pointsPossible : 0;
      break;

    default:
      correct = false;
      pointsAwarded = 0;
  }

  return {
    correct,
    pointsAwarded,
    correctAnswer: getCorrectAnswer(question),
  };
}

/**
 * Get the correct answer for a question (for display in feedback)
 */
function getCorrectAnswer(question: Question): any {
  switch (question.type) {
    case 'mcq':
    case 'scenario':
      return question.options?.find(o => o.correct)?.text || question.options?.find(o => o.correct)?.id;
    case 'true_false':
      return question.answer;
    case 'shorttext':
      return question.correctAnswerText;
    case 'multiselect':
      return question.options?.filter(o => o.correct).map(o => o.text || o.id);
    case 'numeric':
      return question.correctNumber;
    case 'ordering':
      return question.correctOrder?.map(id => {
        const opt = question.options?.find(o => o.id === id);
        return opt?.text || id;
      });
    default:
      return null;
  }
}


