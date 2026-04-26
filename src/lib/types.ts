// ─── Core domain types ────────────────────────────────────────────────────────

export type Candidate = {
  id: string;
  name: string;
  email: string;
  country: string;
  languages: string[];
  educationLevel: string;
  deviceAccess: string;
  availability: string;
};

export type QuestionnaireData = {
  candidateId: string;
  consentAccepted: boolean;
  hobbies: string[];
  informalWork: string;
  domainKnowledge: string[];
  writingComfort: number; // 1–5
  criticalThinkingSelfRating: number; // 1–5
  preferredTaskTypes: string[];
};

export type QuestionType = "grammar" | "factual" | "comparison" | "scam" | "tone" | "translation";

export type TestQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  context?: string;
  options: string[];
  correct: string;
  explanation: string;
};

export type TestSubmission = {
  candidateId: string;
  answers: Record<string, string>;
  startTime: number;
  endTime: number;
};

export type ScoreBreakdown = {
  accuracy: number;
  consistency: number;
  speed: number;
  language: number;
  reasoning: number;
};

export type TestResult = {
  score: number;
  level: number;
  levelTitle: string;
  breakdown: ScoreBreakdown;
  correctCount: number;
  totalCount: number;
};

export type Job = {
  id: string;
  title: string;
  description: string;
  requiredLevel: number;
  requiredLanguages: string[];
  payPerTask: string;
  estimatedMinutes: number;
  fairPayScore: number;
  riskLevel: "Low" | "Medium" | "High";
  growthValue: string;
};

export type Passport = {
  candidateId: string;
  name: string;
  country: string;
  languages: string[];
  readinessScore: number;
  level: number;
  levelTitle: string;
  verifiedSkills: string[];
  recommendedTasks: string[];
  confidenceScore: number;
};

export type AnnotationSubmission = {
  candidateId: string;
  taskId: string;
  accuracyJudgement: string;
  qualityRating: number;
  improvement: string;
};

export type AnnotationResult = {
  submissionId: string;
  isCorrect: boolean;
  qualityScore: number;
  status: "approved" | "needs_review" | "rejected";
};

export type PaymentRecord = {
  submissionId: string;
  amount: number;
  currency: string;
  status: "simulated" | "pending";
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  country: string;
  readinessScore: number;
  approvedTasks: number;
  earnings: string;
  isCurrentUser?: boolean;
};

// ─── API wrapper ───────────────────────────────────────────────────────────────

export type APIResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export function ok<T>(data: T): APIResponse<T> {
  return { success: true, data, error: null };
}

export function err(message: string): APIResponse<null> {
  return { success: false, data: null, error: message };
}
