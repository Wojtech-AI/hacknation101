import { matchJobs } from "./matching";
import type { Candidate, QuestionnaireData, TestResult, Passport } from "./types";

export function generatePassport(
  profile: Candidate,
  questionnaire: QuestionnaireData,
  testResult: TestResult
): Passport {
  const verifiedSkills: string[] = [];

  // Level-gated skills
  if (testResult.level >= 1) verifiedSkills.push("AI Output Annotation");
  if (testResult.level >= 2) verifiedSkills.push("Quality Rating & Consistency");
  if (testResult.level >= 3) verifiedSkills.push("Factual Verification");
  if (testResult.level >= 4) verifiedSkills.push("QA Review & Calibration");
  if (testResult.level >= 5) verifiedSkills.push("Domain Training");
  if (testResult.level >= 6) verifiedSkills.push("Team Leadership");

  // Questionnaire-derived skills
  if (questionnaire.writingComfort >= 4) verifiedSkills.push("Clear Written Communication");
  if (questionnaire.criticalThinkingSelfRating >= 4) verifiedSkills.push("Critical Analysis");

  // Grammar and scam are always demonstrated
  if (testResult.breakdown.accuracy >= 70) {
    verifiedSkills.push("Grammar & Style Judgement");
    verifiedSkills.push("Scam / Misinformation Detection");
  }

  // Language skills
  const langSkills = profile.languages.slice(0, 2).map((l) => `${l} Evaluation`);
  verifiedSkills.push(...langSkills);

  // Domain knowledge from questionnaire
  if (questionnaire.domainKnowledge.length > 0) {
    verifiedSkills.push(`Domain knowledge: ${questionnaire.domainKnowledge.slice(0, 2).join(", ")}`);
  }

  const matchedJobs = matchJobs(testResult.level, profile.languages).filter((j) => !j.locked);
  const recommendedTasks = matchedJobs.slice(0, 3).map((j) => j.title);

  const confidenceScore = Math.min(Math.round(testResult.score * 0.85 + 10), 99);

  return {
    candidateId: profile.id,
    name: profile.name,
    country: profile.country,
    languages: profile.languages,
    readinessScore: testResult.score,
    level: testResult.level,
    levelTitle: testResult.levelTitle,
    verifiedSkills: [...new Set(verifiedSkills)],
    recommendedTasks,
    confidenceScore,
  };
}
