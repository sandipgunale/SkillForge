/**
 * Password strength scoring for the auth forms.
 * Returns a score 0..5 based on length + character variety.
 */
export function passwordStrength(password) {
  if (!password) return 0;

  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

/** Maps a 0..5 score to 1..4 segments for the strength bar. */
export function strengthSegments(score) {
  if (score <= 0) return 0;

  return Math.min(4, Math.max(1, Math.ceil((score / 5) * 4)));
}

export const STRENGTH_LABELS = {
  0: "Enter a password",
  1: "Weak",
  2: "Fair",
  3: "Good",
  4: "Strong",
};
