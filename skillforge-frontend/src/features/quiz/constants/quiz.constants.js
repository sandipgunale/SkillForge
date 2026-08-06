export const SECONDS_PER_QUESTION = 90;

export const MAX_QUESTIONS = 20;

export const DEFAULT_QUESTION_COUNT = 10;

/**
 * Matches the estimate shown in the setup form
 * (question count * 1.5 minutes, rounded up),
 * expressed in seconds for the in-quiz timer.
 */
export function getQuizDurationSeconds(questionCount) {
  const count = Math.max(1, Math.floor(questionCount ?? 0));

  return Math.ceil(count * 1.5) * 60;
}