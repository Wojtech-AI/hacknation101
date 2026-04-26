/**
 * Signal Profile — the structured artefact every downstream surface reads.
 *
 * Phase 0.1 adds the types only. extractSignals() (signalExtraction.ts) and
 * rankJobs() (matching.ts) depend on these. The Phase 0a dataset layer
 * (DOMAIN_TO_ESCO, ESCO_CATALOG, ISCO08_BY_JOB) is the bridge between the
 * cultural-domain taxonomy (user-facing) and the ESCO skill clusters
 * (international occupation grounding).
 *
 * Decisions baked in (logged 2026-04-26):
 *   - Language proficiency uses CEFR (A1..C2) — industry standard for AI
 *     annotation hiring (Indeed, Lionbridge, Reverso). Internal mapping
 *     lets us still display friendly labels in the UI.
 *   - Scripts are tracked separately from languages so jobs that need
 *     Devanagari output can hard-filter Hindi-speaking candidates who only
 *     read/write Latin transliteration.
 *   - SignalProfile is fully serialisable JSON (no Maps / Sets / Dates) so
 *     it round-trips through localStorage and Next.js API routes safely.
 */

import type { CountryId } from "./datasets";
import type { DomainTag, EscoSkillCode } from "./datasets";

// ─── Language proficiency ──────────────────────────────────────────────────

/** CEFR levels in ascending order. */
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const CEFR_ORDER: readonly CefrLevel[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
] as const;

/** Friendly labels for the picker UI (still maps to CEFR under the hood). */
export const CEFR_LABELS: Record<CefrLevel, string> = {
  A1: "A1 · Beginner",
  A2: "A2 · Elementary",
  B1: "B1 · Intermediate",
  B2: "B2 · Upper-intermediate",
  C1: "C1 · Advanced",
  C2: "C2 · Native / proficient",
};

export function cefrAtLeast(have: CefrLevel, need: CefrLevel): boolean {
  return CEFR_ORDER.indexOf(have) >= CEFR_ORDER.indexOf(need);
}

/** Compare two CEFR levels and return a positive/negative/zero diff. */
export function cefrDiff(a: CefrLevel, b: CefrLevel): number {
  return CEFR_ORDER.indexOf(a) - CEFR_ORDER.indexOf(b);
}

/**
 * Writing systems supported by the prototype's 10 demo countries.
 * `mixed-latin-arabic` covers Maghreb-style usage where Arabic and Latin
 * letters appear in the same message.
 */
export type ScriptId =
  | "latin"
  | "arabic"
  | "devanagari"
  | "kannada"
  | "bengali"
  | "cyrillic"
  | "ethiopic"
  | "hangul"
  | "mixed-latin-arabic";

export type LanguageProficiency = {
  /** Display name, e.g. "English", "Sheng", "Bahian Portuguese". */
  language: string;
  level: CefrLevel;
  scripts: ScriptId[];
  /** Sheng / Taglish / Bahian PT / Darija etc. */
  isDialect?: boolean;
  /** For dialects, the parent language the matcher should also count against. */
  parentLanguage?: string;
};

// ─── Cultural domain weighting ─────────────────────────────────────────────

/**
 * 0..3 weighting for how strongly a candidate signals knowledge of a
 * cultural domain. The questionnaire surfaces these as chips with a
 * 0..3 slider; legacy questionnaires get a default weight of 1 for any
 * domain the candidate ticked.
 */
export type DomainWeight = {
  tag: DomainTag;
  weight: number; // 0..3
};

// ─── Comfort / availability ────────────────────────────────────────────────

export type DeviceStability =
  | "mobile-only"
  | "mobile-primary"
  | "desktop-primary";

export type ComfortRating = {
  /** 1..5 self-reported writing comfort in the target language(s). */
  writingComfort: number;
  /** 1..5 self-reported critical-thinking comfort. */
  criticalThinking: number;
  /** Hours per week the candidate can realistically commit. */
  weeklyHoursAvailable: number;
  deviceStability: DeviceStability;
};

// ─── Evidence Probe (Phase 0.3, optional in 0.1) ───────────────────────────

export type EvidenceRubric = {
  /** Fraction of probe items answered correctly, 0..1. */
  accuracy: number;
  /** Speed score 0..1 (1 = much faster than median, 0 = slower). */
  speed: number;
  /** Variance-based 0..1 score (1 = highly consistent across items). */
  consistency: number;
  tasksAttempted: number;
  durationSec: number;
};

// ─── The headline artefact ─────────────────────────────────────────────────

export type SignalProfile = {
  candidateId: string;
  countryId: CountryId;
  languages: LanguageProficiency[];
  domains: DomainWeight[];
  comfort: ComfortRating;
  evidenceRubric?: EvidenceRubric;
  /**
   * Per-ESCO-skill confidence (0..1) computed by walking each domain
   * through DOMAIN_TO_ESCO and aggregating weighted contributions.
   * Stored as a plain Record so it serialises to JSON cleanly.
   */
  inferredEscoSkills: Record<EscoSkillCode, number>;
  /** ISO timestamp of when this profile was last computed. */
  computedAt: string;
  /**
   * Was this profile derived from the legacy questionnaire (10 textareas)
   * or the structured 0.2+ questionnaire? Useful for /clarify to phrase
   * its output more confidently when the new probe is available.
   */
  source: "legacy" | "structured" | "structured+probe";
};

// ─── Match reasons ─────────────────────────────────────────────────────────

export type MatchReasonKind =
  | "esco-overlap"
  | "domain-overlap"
  | "dialect-bonus"
  | "comfort-fit"
  | "evidence-bonus"
  | "fair-pay"
  | "language-level-fit"
  | "script-fit";

export type MatchReason = {
  kind: MatchReasonKind;
  description: string;
  /** Contribution to the final score (positive). */
  weight: number;
};

export type MismatchReasonKind =
  | "level-too-low"
  | "language-too-low"
  | "language-missing"
  | "script-missing"
  | "hours-insufficient";

export type MismatchReason = {
  kind: MismatchReasonKind;
  description: string;
};

// ─── Ranked-job output ─────────────────────────────────────────────────────

import type { Job } from "./types";

export type RankedJob = {
  job: Job;
  /** 0..100 final score for sort order on the matched bucket. */
  score: number;
  matchReasons: MatchReason[];
  mismatchReasons: MismatchReason[];
  unlocked: boolean;
};

export type RankJobsResult = {
  matched: RankedJob[]; // sorted desc by score
  locked: RankedJob[]; // sorted asc by mismatch severity (closest first)
};
