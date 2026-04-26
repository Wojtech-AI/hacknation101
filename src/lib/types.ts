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
  // ─── Phase 0.1 annotations ─────────────────────────────────────────────
  // Optional so existing callers (tests, leaderboard mocks) keep type-checking.
  // Populated for the 6 prototype jobs in mockData.ts.

  /** ILO ISCO-08 4-digit unit-group code; resolves through ISCO08_CATALOG. */
  isco08?: string;
  /** ESCO skill clusters this job genuinely requires. Drives the matcher's
   *  primary "skill overlap" score against the candidate's
   *  inferredEscoSkills vector. Codes resolve through ESCO_CATALOG. */
  requiredEscoSkills?: string[];
  /** Writing systems the job's outputs must be produced in. Empty/absent
   *  means script-agnostic (any Latin-keyboard candidate is fine). */
  requiredScripts?: string[];
  /** Minimum CEFR level required for at least one language matching
   *  `requiredLanguages`. Defaults to "B1" when absent. */
  minLanguageLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  /** Hard minimum weekly availability for the job. */
  minWeeklyHours?: number;
  /** Dialect names that get a soft-score bonus when the candidate has
   *  them (e.g. "Bahian Portuguese" for cultural-context jobs in Salvador). */
  preferredDialects?: string[];
  /**
   * Culture-specific framing of an otherwise abstract job. Lets us keep one
   * job spec (level / ESCO / pay) while surfacing a concrete, locally-true
   * version of the work to the user — e.g. "AI response review" becomes
   * "MoMo / WhatsApp agent-scam reply review" for a Ghanaian user, "Pix
   * golpe message review" for a Brazilian user, "M-Pesa fake-pay screenshot
   * review" for a Kenyan user, etc.
   *
   * Keys are CountryId; missing keys fall back to the generic title /
   * description. Surfaced by /jobs as a "Your lane:" callout below the
   * generic header so users immediately see the work in their own context.
   */
  culturalLanes?: Record<
    string,
    {
      /** Country-tailored variant of `title`. Optional. */
      title?: string;
      /** Country-tailored variant of `description`. Optional. */
      description?: string;
      /** "Your lane" sentence — concrete examples of what this job means
       *  in this country (MoMo agent fraud, matatu route descriptions, …). */
      lane: string;
      /** DomainTag-equivalent strings for chip rendering. */
      domains?: string[];
    }
  >;
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
