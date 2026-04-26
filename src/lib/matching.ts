/**
 * matching.ts — signal-aware job matching.
 *
 * Phase 0.1 introduces `rankJobs(signals, candidateLevel, jobs)`:
 *   - Hard filters that decide whether a job lands in `matched` or `locked`.
 *   - Soft scoring with explicit, citeable reasons.
 *   - Output sorted desc by score; locked jobs sorted by mismatch severity
 *     so the closest "next step" appears first.
 *
 * The legacy `matchJobs(level, languages)` entry point is preserved so
 * `/api/jobs/matched/[candidateId]` and `/lib/passport.ts` keep working
 * without changes; it now synthesises a partial SignalProfile internally
 * and forwards to `rankJobs`.
 *
 * Scoring breakdown (max 100):
 *     50  base eligibility
 *  +  30  ESCO skill overlap        (sum of confidence × required-weight)
 *  +   8  language-level fit
 *  +   6  fair-pay vs ILO median
 *  +   3  preferred-dialect bonus
 *  +   3  comfort fit (writing × critical-thinking)
 *  +   5  evidence-rubric bonus      (when probe data is present)
 *  ─────
 *    105  capped at 100
 */

import { JOBS } from "./mockData";
import type { Job } from "./types";
import {
  iloByCountry,
  ESCO_CATALOG,
  type CountryId,
  type EscoSkillCode,
} from "./datasets";
import {
  cefrAtLeast,
  cefrDiff,
  type CefrLevel,
  type MatchReason,
  type MismatchReason,
  type RankedJob,
  type RankJobsResult,
  type SignalProfile,
} from "./signals";
import { synthesizePartialSignal } from "./signalExtraction";

// ─── Legacy contract — keep alive for unmigrated callers ──────────────────

export type MatchedJob = Job & { locked: boolean };

/**
 * Legacy entry point. Existing callers pass `{ level, languages }`; we
 * synthesize a minimal SignalProfile and run rankJobs, then flatten back
 * to the old `MatchedJob[]` shape so /jobs/page.tsx and /lib/passport.ts
 * don't change in this slice.
 */
export function matchJobs(
  candidateLevel: number,
  candidateLanguages: string[],
  countryId?: CountryId,
): MatchedJob[] {
  const signals = synthesizePartialSignal({
    languages: candidateLanguages,
    countryId,
  });
  const { matched, locked } = rankJobs(signals, candidateLevel, JOBS);
  // Flatten — preserve legacy shape: matched[] then up to 1 locked job.
  return [
    ...matched.map((r) => ({ ...r.job, locked: false })),
    ...locked.slice(0, 1).map((r) => ({ ...r.job, locked: true })),
  ];
}

// ─── New signal-aware ranker ──────────────────────────────────────────────

const DEFAULT_MIN_CEFR: CefrLevel = "B1";

export function rankJobs(
  signals: SignalProfile,
  candidateLevel: number,
  jobs: Job[] = JOBS,
): RankJobsResult {
  const matched: RankedJob[] = [];
  const locked: RankedJob[] = [];

  for (const job of jobs) {
    const result = scoreJob(job, signals, candidateLevel);
    if (result.unlocked) matched.push(result);
    else locked.push(result);
  }

  matched.sort((a, b) => b.score - a.score);
  // Locked: lowest mismatch count first, then closest to candidate level.
  locked.sort(
    (a, b) =>
      a.mismatchReasons.length - b.mismatchReasons.length ||
      a.job.requiredLevel - b.job.requiredLevel,
  );

  return { matched, locked };
}

// ─── Single-job scoring ───────────────────────────────────────────────────

function scoreJob(
  job: Job,
  signals: SignalProfile,
  candidateLevel: number,
): RankedJob {
  const matchReasons: MatchReason[] = [];
  const mismatchReasons: MismatchReason[] = [];

  // ─── Hard filter: candidate level ────────────────────────────────────
  if (candidateLevel < job.requiredLevel) {
    mismatchReasons.push({
      kind: "level-too-low",
      description: `Needs Level ${job.requiredLevel} — you're at Level ${candidateLevel}`,
    });
  }

  // ─── Hard filter: language coverage + CEFR threshold ─────────────────
  const minLang: CefrLevel = job.minLanguageLevel ?? DEFAULT_MIN_CEFR;
  const acceptsAny =
    !job.requiredLanguages?.length || job.requiredLanguages.includes("Any");
  const matchingLang = signals.languages.find((lp) => {
    if (acceptsAny) return cefrAtLeast(lp.level, minLang);
    return job.requiredLanguages.some((req) => {
      const reqNorm = req.toLowerCase();
      const candidateNorm = lp.language.toLowerCase();
      const parentNorm = (lp.parentLanguage ?? "").toLowerCase();
      return (
        (candidateNorm === reqNorm || parentNorm === reqNorm) &&
        cefrAtLeast(lp.level, minLang)
      );
    });
  });

  if (!matchingLang) {
    // Distinguish "no language overlap" vs "have it but at too low CEFR".
    const partialMatch = signals.languages.find((lp) =>
      acceptsAny
        ? true
        : job.requiredLanguages.some(
            (req) =>
              lp.language.toLowerCase() === req.toLowerCase() ||
              (lp.parentLanguage ?? "").toLowerCase() === req.toLowerCase(),
          ),
    );
    if (partialMatch) {
      mismatchReasons.push({
        kind: "language-too-low",
        description: `Needs ${minLang} ${partialMatch.language}; you reported ${partialMatch.level}`,
      });
    } else {
      mismatchReasons.push({
        kind: "language-missing",
        description: `Needs one of: ${job.requiredLanguages.join(", ")}`,
      });
    }
  }

  // ─── Hard filter: scripts ────────────────────────────────────────────
  if (job.requiredScripts && job.requiredScripts.length > 0) {
    const candidateScripts = new Set<string>(
      signals.languages.flatMap((lp) => lp.scripts as string[]),
    );
    const hasRequiredScript = job.requiredScripts.some((s) =>
      candidateScripts.has(s),
    );
    if (!hasRequiredScript) {
      mismatchReasons.push({
        kind: "script-missing",
        description: `Needs one of: ${job.requiredScripts.join(", ")}`,
      });
    }
  }

  // ─── Hard filter: weekly hours ───────────────────────────────────────
  if (
    job.minWeeklyHours !== undefined &&
    signals.comfort.weeklyHoursAvailable < job.minWeeklyHours
  ) {
    mismatchReasons.push({
      kind: "hours-insufficient",
      description: `Needs ${job.minWeeklyHours}h/week; you have ${signals.comfort.weeklyHoursAvailable}h available`,
    });
  }

  const unlocked = mismatchReasons.length === 0;

  // ─── Soft score: only meaningful for unlocked jobs ───────────────────
  let score = unlocked ? 50 : 0;

  // ESCO skill overlap (max +30)
  const escoOverlap = computeEscoOverlap(
    job.requiredEscoSkills,
    signals.inferredEscoSkills,
  );
  if (escoOverlap.score > 0) {
    score += escoOverlap.score;
    matchReasons.push({
      kind: "esco-overlap",
      description: escoOverlap.description,
      weight: escoOverlap.score,
    });
  }

  // Language-level fit (max +8)
  if (matchingLang) {
    const aboveMin = cefrDiff(matchingLang.level, minLang); // >= 0
    const fit = Math.min(8, 4 + aboveMin * 2);
    score += fit;
    if (aboveMin > 0) {
      matchReasons.push({
        kind: "language-level-fit",
        description: `${matchingLang.level} ${matchingLang.language} (job needs ${minLang})`,
        weight: fit,
      });
    }
  }

  // Preferred-dialect bonus (max +3)
  const dialectBonus = computeDialectBonus(job, signals);
  if (dialectBonus) {
    score += dialectBonus.weight;
    matchReasons.push(dialectBonus);
  }

  // Fair-pay bonus (max +6) — rewards jobs paying ≥ 1× ILO median wage.
  const fairPay = computeFairPayBonus(job, signals.countryId);
  if (fairPay) {
    score += fairPay.weight;
    matchReasons.push(fairPay);
  }

  // Comfort fit (max +3) — only for jobs that lean on writing/reasoning.
  const comfortBonus = computeComfortBonus(job, signals);
  if (comfortBonus) {
    score += comfortBonus.weight;
    matchReasons.push(comfortBonus);
  }

  // Evidence rubric bonus (max +5) — applies once Phase 0.3 ships.
  if (signals.evidenceRubric && unlocked) {
    const rubric = signals.evidenceRubric;
    const evidenceScore = Math.round(
      (rubric.accuracy * 3 + rubric.consistency * 1 + rubric.speed * 1) * 1,
    );
    if (evidenceScore > 0) {
      score += evidenceScore;
      matchReasons.push({
        kind: "evidence-bonus",
        description: `Verified: ${(rubric.accuracy * 100).toFixed(0)}% accuracy on ${rubric.tasksAttempted}-item probe`,
        weight: evidenceScore,
      });
    }
  }

  // Cap and round.
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    job,
    score,
    matchReasons: matchReasons.sort((a, b) => b.weight - a.weight),
    mismatchReasons,
    unlocked,
  };
}

// ─── Scoring helpers ──────────────────────────────────────────────────────

function computeEscoOverlap(
  required: string[] | undefined,
  inferred: Record<EscoSkillCode, number>,
): { score: number; description: string } {
  if (!required?.length) return { score: 0, description: "" };

  let total = 0;
  const matched: Array<{ code: string; conf: number }> = [];
  for (const code of required) {
    const conf = inferred[code] ?? 0;
    if (conf > 0) {
      total += conf;
      matched.push({ code, conf });
    }
  }

  // Normalise to a max of 30: if half the required skills are at full
  // confidence the score saturates around 30.
  const score = Math.min(30, Math.round((total / required.length) * 30 * 1.5));

  if (score === 0) {
    return { score: 0, description: "" };
  }

  // Surface the top 2 matched skills using ESCO_CATALOG labels.
  const top = matched
    .sort((a, b) => b.conf - a.conf)
    .slice(0, 2)
    .map((m) => ESCO_CATALOG[m.code]?.label ?? m.code);
  const tail =
    matched.length > 2 ? ` + ${matched.length - 2} more` : "";
  return {
    score,
    description: `Matches ${top.join(" / ")}${tail}`,
  };
}

function computeDialectBonus(
  job: Job,
  signals: SignalProfile,
): MatchReason | null {
  if (!job.preferredDialects?.length) return null;
  const candidateDialects = signals.languages
    .filter((l) => l.isDialect)
    .map((l) => l.language.toLowerCase());
  const hit = job.preferredDialects.find((d) =>
    candidateDialects.includes(d.toLowerCase()),
  );
  if (!hit) return null;
  return {
    kind: "dialect-bonus",
    description: `${hit} dialect bonus`,
    weight: 3,
  };
}

function computeFairPayBonus(
  job: Job,
  countryId: CountryId,
): MatchReason | null {
  // Parse "$0.10" + estimatedMinutes → effective hourly rate.
  const numeric = parseFloat(job.payPerTask.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0 || job.estimatedMinutes <= 0) {
    return null;
  }
  const hourly = (numeric * 60) / job.estimatedMinutes;
  const ilo = iloByCountry[countryId]?.medianHourlyWageUSD.value ?? 0;
  if (ilo <= 0) return null;

  const ratio = hourly / ilo;
  if (ratio < 0.9) return null;

  const weight = Math.min(6, Math.round((ratio - 0.5) * 6));
  if (weight <= 0) return null;
  return {
    kind: "fair-pay",
    description: `Pays ${ratio.toFixed(1)}× local ILO median wage`,
    weight,
  };
}

function computeComfortBonus(
  job: Job,
  signals: SignalProfile,
): MatchReason | null {
  // Writing-heavy jobs = anything requiring linguistic skills (S1.5.0)
  // or critical thinking (S1.4.1).
  const writingHeavy =
    job.requiredEscoSkills?.includes("S1.5.0") ||
    job.requiredEscoSkills?.includes("S1.4.5");
  const reasoningHeavy =
    job.requiredEscoSkills?.includes("S1.4.1") ||
    job.requiredEscoSkills?.includes("S2.1.1") ||
    job.requiredEscoSkills?.includes("S2.4.0");

  let bonus = 0;
  if (writingHeavy && signals.comfort.writingComfort >= 4) bonus += 2;
  if (reasoningHeavy && signals.comfort.criticalThinking >= 4) bonus += 1;
  if (bonus === 0) return null;
  return {
    kind: "comfort-fit",
    description: `Strong self-reported ${writingHeavy ? "writing" : "reasoning"} comfort`,
    weight: bonus,
  };
}
