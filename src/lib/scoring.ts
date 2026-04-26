import { TEST_QUESTIONS } from "./mockData";
import type { TestSubmission, TestResult, ScoreBreakdown } from "./types";

export const LEVEL_MAP: { min: number; max: number; level: number; title: string }[] = [
  { min: 0, max: 39, level: 0, title: "Not Ready" },
  { min: 40, max: 54, level: 1, title: "Annotator" },
  { min: 55, max: 69, level: 2, title: "Output Rater" },
  { min: 70, max: 79, level: 3, title: "Reviewer" },
  { min: 80, max: 89, level: 4, title: "QA Specialist" },
  { min: 90, max: 94, level: 5, title: "Domain Trainer" },
  { min: 95, max: 100, level: 6, title: "Team Lead" },
];

export function getLevelFromScore(score: number): { level: number; title: string } {
  const entry = LEVEL_MAP.find((l) => score >= l.min && score <= l.max);
  return entry ? { level: entry.level, title: entry.title } : { level: 0, title: "Not Ready" };
}

export function calculateTestResult(
  submission: TestSubmission,
  candidateLanguages: string[],
  writingComfort: number,
  criticalThinkingSelfRating: number
): TestResult {
  // Accuracy: proportion of correct answers (0–100)
  let correctCount = 0;
  for (const q of TEST_QUESTIONS) {
    if (submission.answers[q.id] === q.correct) correctCount++;
  }
  const totalCount = TEST_QUESTIONS.length;
  const accuracy = (correctCount / totalCount) * 100;

  // Consistency: from questionnaire writingComfort (1–5 → 20–100)
  const consistency = writingComfort * 20;

  // Speed: minutes taken (under 3 min → 100, 3–5 → 80, 5–8 → 60, 8+ → 40)
  const minutes = (submission.endTime - submission.startTime) / 60000;
  const speed = minutes < 3 ? 100 : minutes < 5 ? 80 : minutes < 8 ? 60 : 40;

  // Language: +33 per language beyond English, capped at 100
  const extraLanguages = candidateLanguages.filter((l) => l !== "English").length;
  const language = Math.min(33 + extraLanguages * 33, 100);

  // Reasoning: criticalThinkingSelfRating (1–5 → 20–100)
  const reasoning = criticalThinkingSelfRating * 20;

  const breakdown: ScoreBreakdown = {
    accuracy: Math.round(accuracy),
    consistency,
    speed,
    language,
    reasoning,
  };

  const raw =
    0.35 * accuracy +
    0.2 * consistency +
    0.15 * speed +
    0.2 * language +
    0.1 * reasoning;

  const score = Math.min(Math.round(raw), 100);
  const { level, title: levelTitle } = getLevelFromScore(score);

  return { score, level, levelTitle, breakdown, correctCount, totalCount };
}
