// Adaptive level feedback loop — pure functions over a 0-100 comprehension score.
// Quiz correctness and watch duration move the score; the score maps to a content level
// that biases ranking and seed-term choice within the target language.

export function updateComprehensionScore(currentScore, { quizCorrect, watchRatio }) {
  let score = Number.isFinite(currentScore) ? currentScore : 50;
  if (typeof quizCorrect === "boolean") score = score * 0.7 + (quizCorrect ? 100 : 0) * 0.3;
  if (Number.isFinite(watchRatio)) {
    const ratio = Math.min(Math.max(watchRatio, 0), 1);
    score = score * 0.9 + ratio * 100 * 0.1;
  }
  return Math.round(Math.min(100, Math.max(0, score)));
}

export const levelFromScore = (score) => {
  if (score < 40) return "simpler";
  if (score > 70) return "richer";
  return "standard";
};