/**
 * Evidence Probe — 3-item AI-output rating + translation + tone calibration.
 *
 * Phase 0.3 ships the probe at its own /probe route after the structured
 * questionnaire. It produces an `EvidenceRubric` (accuracy, consistency,
 * speed, durationSec, tasksAttempted) which the matcher reads via the
 * `evidence-bonus` reason (up to +5 score).
 *
 * Why 3 items / why these tasks:
 *   - The probe must be on-mission for AI annotation work, not generic
 *     "logic puzzle" filler. AI output rating, translation comparison,
 *     and tone calibration are *literally the job*.
 *   - 3 items is the smallest set that still produces a credible
 *     consistency signal — enough variance to detect random clicking
 *     without becoming a 10-minute drag.
 *
 * Untimed by design (per K-3 decision):
 *   - We track per-item duration (mount → submit) but don't impose a
 *     timer or fail-out. Slow answers don't get penalised; only abandoned
 *     pages do (via a permissive speed score).
 *
 * Each item maps to ESCO skills the matcher will reward:
 *   - ai-rating  → S1.4.5 evaluate information, S1.4.1 critical thinking
 *   - translation → S1.5.0 linguistic skills, S2.6.0 cultural references
 *   - tone        → S1.0.1 communicate, S2.6.0 cultural references
 */

import type { EvidenceRubric } from "./signals";

export type ProbeItemType = "ai-rating" | "translation" | "tone";

export type ProbeItem = {
  id: string;
  type: ProbeItemType;
  prompt: string;
  context?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /**
   * Pretty-name shown in the rubric breakdown ("AI output rating") so
   * the results screen reads naturally.
   */
  niceName: string;
  /** ESCO skills this item evidences when answered correctly. */
  escoSkills: string[];
};

/** Items are not exported with `correctIndex` to client; see /api/probe/items. */
export const PROBE_ITEMS: ProbeItem[] = [
  {
    id: "p1",
    type: "ai-rating",
    niceName: "AI output rating",
    prompt:
      "A user asks: 'How do I start saving money on a low income?' Two AI responses are below. Which response is more helpful?",
    options: [
      "Response A: 'Try to spend less than you earn. Always save 20% of your income each month.'",
      "Response B: 'Start with a small, achievable amount — even 5% of weekly income, set aside on payday. Use a separate account or money-jar so it's harder to dip into. Track for 4 weeks before increasing.'",
      "Both are equally helpful.",
      "Neither is helpful.",
    ],
    correctIndex: 1,
    explanation:
      "Response B is concrete (specific %), realistic for low income (5% not 20%), gives mechanism (separate account), and includes a feedback loop (4-week check-in). Response A is generic advice that ignores income reality.",
    escoSkills: ["S1.4.5", "S1.4.1"],
  },
  {
    id: "p2",
    type: "translation",
    niceName: "Translation quality",
    prompt:
      "A French speaker says: 'Il pleut des cordes — on reste à la maison.' Which English translation captures the meaning best?",
    options: [
      "'Ropes are falling — we're staying home.'",
      "'It's raining ropes — we're staying home.'",
      "'It's pouring rain — we're staying in.'",
      "'I don't want to go out today.'",
    ],
    correctIndex: 2,
    explanation:
      "'Il pleut des cordes' is a French idiom meaning heavy rain — equivalent to 'raining cats and dogs' in English. Literal translations (A, B) miss the meaning. Option D drops the rain reference entirely.",
    escoSkills: ["S1.5.0", "S2.6.0"],
  },
  {
    id: "p3",
    type: "tone",
    niceName: "Tone calibration",
    prompt:
      "A customer messages support (frustrated): 'You charged me twice for the same order. I want my money back NOW.' Which AI customer-service reply is most appropriate?",
    options: [
      "'Please be patient. Refunds typically take 30 business days.'",
      "'I understand the frustration of being charged twice — I'm checking this for you now and will issue the refund within 24 hours. I'll send confirmation by email once it's processed.'",
      "'Mistakes sometimes happen on our end. We'll get to it eventually.'",
      "'You should check your statements more carefully before placing orders.'",
    ],
    correctIndex: 1,
    explanation:
      "Option B acknowledges the frustration, takes ownership, gives a concrete timeline (24h), and promises follow-up. The others are dismissive (A, C) or blame-shifting (D).",
    escoSkills: ["S1.0.1", "S2.6.0"],
  },
];

export type ProbeAnswer = {
  itemId: string;
  selectedIndex: number;
  /** Time the user spent on this specific item, in milliseconds. */
  durationMs: number;
};

export type ProbeSubmission = {
  candidateId: string;
  answers: ProbeAnswer[];
  /** Total page session duration, in milliseconds. */
  totalDurationMs: number;
};

export type ProbeItemResult = {
  itemId: string;
  niceName: string;
  type: ProbeItemType;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
  escoSkills: string[];
};

export type ProbeResult = {
  rubric: EvidenceRubric;
  items: ProbeItemResult[];
  /** Skills the candidate demonstrated (correctly answered items). */
  evidencedSkills: string[];
  /**
   * Plain-English summary string suitable for surfacing on /clarify and
   * inside the matcher's evidence-bonus reason.
   */
  summary: string;
};

/**
 * Score a probe submission against the seeded ground truth.
 *
 * Scoring (all 0..1):
 *   - accuracy     = correct picks / 3
 *   - consistency  = 1 - mean(|item_correct - mean_correct|) — i.e. high
 *                    when results are uniformly correct or uniformly
 *                    wrong; lower when scatter-shot (signal of guessing).
 *   - speed        = permissive — 1.0 if total < 4min, 0.5 if < 8min,
 *                    0.2 otherwise. Untimed UX = lenient speed score.
 */
export function scoreProbe(submission: ProbeSubmission): ProbeResult {
  const items: ProbeItemResult[] = PROBE_ITEMS.map((item) => {
    const answer = submission.answers.find((a) => a.itemId === item.id);
    const selectedIndex = answer?.selectedIndex ?? -1;
    const isCorrect = selectedIndex === item.correctIndex;
    return {
      itemId: item.id,
      niceName: item.niceName,
      type: item.type,
      selectedIndex,
      correctIndex: item.correctIndex,
      isCorrect,
      explanation: item.explanation,
      escoSkills: item.escoSkills,
    };
  });

  const correctCount = items.filter((i) => i.isCorrect).length;
  const accuracy = correctCount / items.length;

  // Consistency: variance of binary correctness around its mean.
  const meanCorrect = accuracy;
  const meanAbsDeviation =
    items.reduce((sum, i) => sum + Math.abs((i.isCorrect ? 1 : 0) - meanCorrect), 0) /
    items.length;
  const consistency = Math.max(0, Math.min(1, 1 - meanAbsDeviation));

  // Permissive speed score for untimed UX.
  const totalMin = submission.totalDurationMs / 60000;
  let speed: number;
  if (totalMin <= 4) speed = 1.0;
  else if (totalMin <= 8) speed = 0.5;
  else speed = 0.2;

  const evidencedSkills = Array.from(
    new Set(items.filter((i) => i.isCorrect).flatMap((i) => i.escoSkills)),
  );

  const summary = buildSummary(correctCount, items.length, evidencedSkills);

  const rubric: EvidenceRubric = {
    accuracy: round2(accuracy),
    consistency: round2(consistency),
    speed: round2(speed),
    tasksAttempted: items.length,
    durationSec: Math.round(submission.totalDurationMs / 1000),
  };

  return { rubric, items, evidencedSkills, summary };
}

function buildSummary(correct: number, total: number, _skills: string[]): string {
  if (correct === total) {
    return `${correct}/${total} probe items correct — strong evidence on AI rating, translation, and tone.`;
  }
  if (correct === 0) {
    return `${correct}/${total} probe items correct — limited evidence; consider re-taking after the skill test.`;
  }
  return `${correct}/${total} probe items correct — measured evidence captured for matching.`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Public-safe representation of a probe item — strips the answer key
 * before sending to the client. Used by /api/probe/items.
 */
export type PublicProbeItem = Omit<ProbeItem, "correctIndex" | "explanation">;

export function publicProbeItems(): PublicProbeItem[] {
  return PROBE_ITEMS.map((item) => {
    // intentionally drop correctIndex + explanation
    const { id, type, niceName, prompt, context, options, escoSkills } = item;
    return { id, type, niceName, prompt, context, options, escoSkills };
  });
}
