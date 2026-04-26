"use client";
/**
 * /jobs — Phase 0.4 rewrite.
 *
 * Reads the new `ranked: { matched, locked }` payload from
 * /api/jobs/matched/[candidateId] and renders:
 *   1. Verbose matched-job cards with match-reason chips and fair-pay bar.
 *   2. A separate "Next steps" rail at the bottom for locked jobs, showing
 *      mismatch reasons so the user knows exactly what's missing.
 *
 * The page passes the persisted `ll-signal-profile` to the API so soft
 * scoring (ESCO overlap, dialect bonus, evidence rubric) actually fires.
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge, DisclaimerNote, ProgressStepper } from "@/components/ui";
import { useT, useAutoT } from "@/lib/LocaleProvider";
import type {
  RankedJob,
  SignalProfile,
  MatchReason,
  MismatchReason,
} from "@/lib/signals";

// ─── Match-reason kind → friendly chip colour ──────────────────────────────

const REASON_VARIANT: Record<
  MatchReason["kind"],
  "teal" | "green" | "amber" | "default"
> = {
  "esco-overlap": "teal",
  "language-level-fit": "teal",
  "script-fit": "default",
  "dialect-bonus": "green",
  "comfort-fit": "default",
  "evidence-bonus": "green",
  "fair-pay": "amber",
  "domain-overlap": "teal",
};

const MISMATCH_VARIANT: Record<
  MismatchReason["kind"],
  "amber" | "red" | "outline"
> = {
  "level-too-low": "amber",
  "language-too-low": "amber",
  "language-missing": "red",
  "script-missing": "red",
  "hours-insufficient": "outline",
};

// ─── Score badge ───────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const colour =
    score >= 85
      ? "bg-[var(--teal)] text-white"
      : score >= 70
        ? "bg-[var(--teal-light)] text-[var(--teal-dark)]"
        : "bg-[var(--bg)] text-[var(--ink-2)] border border-[var(--line)]";
  return (
    <div
      className={`flex flex-col items-center justify-center min-w-[56px] rounded-xl px-3 py-2 ${colour}`}
    >
      <span className="text-lg font-bold leading-none">{score}</span>
      <span className="text-[9px] uppercase tracking-wider mt-0.5 opacity-80">
        Match
      </span>
    </div>
  );
}

// ─── Fair-work bar ─────────────────────────────────────────────────────────

function FairWorkBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--ink-2)]">{label}</span>
        <span className="font-semibold text-[var(--teal)]">{score}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--teal-light)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--teal)]"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const { t } = useT();
  const [matched, setMatched] = useState<RankedJob[]>([]);
  const [locked, setLocked] = useState<RankedJob[]>([]);
  const [level, setLevel] = useState(0);
  const [loading, setLoading] = useState(true);
  // We need the resolved countryId both for the matcher (already passed below)
  // *and* for the cards, which look up `job.culturalLanes[countryId]` to
  // surface the culturally-specific framing of each job. Without this, every
  // user saw the same generic English titles even after we'd authored
  // localised lanes per country.
  const [countryId, setCountryId] = useState<string | undefined>();

  useEffect(() => {
    async function fetchJobs() {
      const profileRaw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("ltl-profile")
          : null;
      const testRaw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("ltl-test-result")
          : null;
      const passportRaw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("ltl-passport")
          : null;
      const signalRaw =
        typeof window !== "undefined"
          ? window.localStorage.getItem("ll-signal-profile")
          : null;

      const profile = profileRaw ? JSON.parse(profileRaw) : {};
      const testResult = testRaw ? JSON.parse(testRaw) : {};
      const passport = passportRaw ? JSON.parse(passportRaw) : {};
      const signalProfile: SignalProfile | undefined = signalRaw
        ? JSON.parse(signalRaw)
        : undefined;

      const candidateLevel = passport.level ?? testResult.level ?? 1;
      const candidateLanguages =
        profile.languages ?? passport.languages ?? ["English"];
      const candidateId = profile.id ?? "guest";
      const resolvedCountryId =
        signalProfile?.countryId ??
        (typeof window !== "undefined"
          ? window.localStorage.getItem("locallens-country") ?? undefined
          : undefined);

      setLevel(candidateLevel);
      setCountryId(resolvedCountryId);

      const res = await fetch(`/api/jobs/matched/${candidateId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: candidateLevel,
          languages: candidateLanguages,
          countryId: resolvedCountryId,
          signalProfile,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMatched(json.data.ranked?.matched ?? []);
        setLocked(json.data.ranked?.locked ?? []);
      }
      setLoading(false);
    }
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto pt-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-2 border-[var(--teal)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--ink-2)]">
          Matching jobs to your Signal Profile…
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto min-w-0 space-y-6">
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <ProgressStepper current={6} />
      </div>
      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-2">
        <p className="section-label">{t("jobs.step")}</p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
          {t("jobs.title")}
        </h1>
        <p className="text-sm text-[var(--ink-2)] leading-relaxed max-w-xl">
          {t("jobs.subtitle")}
        </p>
        <div className="flex gap-2 flex-wrap pt-1">
          <Badge variant="teal">Level {level}</Badge>
          <Badge variant="green">
            {matched.length} {matched.length === 1 ? "job" : "jobs"} matched
          </Badge>
          {locked.length > 0 && (
            <Badge variant="outline">{locked.length} next steps</Badge>
          )}
        </div>
      </section>

      {/* Matched jobs */}
      {matched.length > 0 ? (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide px-1">
            {t("jobs.matchedHeading")}
          </p>
          {matched.map((r) => (
            <MatchedCard key={r.job.id} ranked={r} t={t} countryId={countryId} />
          ))}
        </div>
      ) : (
        <div className="rise rounded-2xl border border-dashed border-[var(--line)] bg-white p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-[var(--ink)]">
            {t("jobs.noMatches")}
          </p>
          <p className="text-xs text-[var(--ink-2)]">
            {t("jobs.noMatchesHint")}
          </p>
        </div>
      )}

      {/* Next steps rail */}
      {locked.length > 0 && (
        <section className="rise rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-5 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
              {t("jobs.lockedHeading")}
            </p>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              {t("jobs.locked.subtitle")}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {locked.map((r) => (
              <LockedCard
                key={r.job.id}
                ranked={r}
                t={t}
                level={level}
                countryId={countryId}
              />
            ))}
          </div>
        </section>
      )}

      <div className="flex gap-3">
        <Link
          href="/passport"
          className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
        >
          {t("jobs.viewPassport")}
        </Link>
        {matched.length > 0 && (
          <Link
            href="/annotation"
            className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
          >
            {t("jobs.tryTask")} →
          </Link>
        )}
      </div>

      <DisclaimerNote />
    </div>
  );
}

// ─── Matched card (verbose) ────────────────────────────────────────────────

function MatchedCard({
  ranked,
  t,
  countryId,
}: {
  ranked: RankedJob;
  t: ReturnType<typeof useT>["t"];
  countryId?: string;
}) {
  const { job, score, matchReasons } = ranked;
  // Job titles, descriptions, growth-value blurbs and reason copy come from
  // the seeded JOBS dataset in English. Route them through useAutoT() so they
  // follow whichever locale the user has selected.
  const tr = useAutoT();
  // Resolve the culture-specific lane for this job + country (if any). When
  // present we (a) prefer the lane's title/description over the generic ones,
  // and (b) surface the "Your lane:" callout below the description so users
  // see the work in concrete local terms. This is what the user complained
  // about: jobs felt generic. The fix is structural, not cosmetic.
  const lane = countryId ? job.culturalLanes?.[countryId] : undefined;
  const renderedTitle = lane?.title ?? job.title;
  const renderedDescription = lane?.description ?? job.description;
  return (
    <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 space-y-4 hover:shadow-md transition-shadow">
      {/* Header row */}
      <div className="flex min-w-0 items-start gap-4">
        <ScoreBadge score={score} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
            <h3 className="min-w-0 max-w-full break-words font-semibold leading-tight text-[var(--ink)]">
              {tr(renderedTitle, `job.${job.id}.title`)}
            </h3>
            <Badge
              variant={
                job.riskLevel === "Low"
                  ? "green"
                  : job.riskLevel === "Medium"
                    ? "amber"
                    : "red"
              }
            >
              {tr(job.riskLevel, `job.risk.${job.riskLevel}`)} {tr("risk", "job.riskWord")}
            </Badge>
          </div>
          <p className="text-xs text-[var(--ink-2)]">
            ISCO-08 {job.isco08 ?? "—"} · {t("jobs.minLevel")} {job.requiredLevel}
            {job.minLanguageLevel ? ` · ${t("jobs.minCefr")} ${job.minLanguageLevel}` : ""}
            {job.minWeeklyHours ? ` · ${job.minWeeklyHours}h/wk` : ""}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="min-w-0 break-words text-sm leading-relaxed text-[var(--ink-2)]">
        {tr(renderedDescription, `job.${job.id}.description`)}
      </p>

      {/* Cultural lane callout */}
      {lane && (
        <div className="min-w-0 space-y-1.5 rounded-xl border border-[var(--teal)]/30 bg-[var(--teal-light)]/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--teal-dark)]">
            {tr("Your lane", "jobs.yourLane")}
          </p>
          <p className="min-w-0 break-words text-xs leading-relaxed text-[var(--ink)]">
            {tr(lane.lane, `job.${job.id}.lane.${countryId}`)}
          </p>
          {lane.domains && lane.domains.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {lane.domains.map((d) => (
                <Badge key={d} variant="outline" className="!text-[10px]">
                  {tr(d, `jobs.domain.${d}`)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pay strip */}
      <div className="flex flex-wrap gap-3 text-xs items-center">
        <span className="font-semibold text-[var(--teal)]">
          {job.payPerTask}/{tr("task", "job.taskWord")}
        </span>
        <span className="text-[var(--ink-2)]">· ~{job.estimatedMinutes} {tr("min", "job.minWord")}</span>
        <span className="text-[var(--ink-2)]">· {tr(job.growthValue, `job.${job.id}.growth`)}</span>
      </div>

      {/* Match reasons (verbose, all visible) */}
      {matchReasons.length > 0 && (
        <div className="space-y-2 rounded-xl bg-[var(--bg)] p-3 border border-[var(--line)]">
          <p className="text-[10px] font-semibold text-[var(--ink-2)] uppercase tracking-wider">
            {t("jobs.matchReasons")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {matchReasons.map((reason, i) => (
              <Badge
                key={`${reason.kind}-${i}`}
                variant={REASON_VARIANT[reason.kind]}
                className="!text-[11px]"
              >
                +{reason.weight} · {tr(reason.description)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Fair-work bar */}
      <FairWorkBar score={job.fairPayScore} label={t("jobs.fairWork")} />

      {/* CTA */}
      <Link
        href="/annotation"
        className="block w-full text-center rounded-lg bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
      >
        {t("jobs.tryTask")}
      </Link>
    </div>
  );
}

// ─── Locked "next step" card (compact) ────────────────────────────────────

function LockedCard({
  ranked,
  t,
  level,
  countryId,
}: {
  ranked: RankedJob;
  t: ReturnType<typeof useT>["t"];
  level: number;
  countryId?: string;
}) {
  const { job, mismatchReasons } = ranked;
  const tr = useAutoT();
  const lane = countryId ? job.culturalLanes?.[countryId] : undefined;
  const renderedTitle = lane?.title ?? job.title;
  // Show the single most actionable mismatch first.
  const primary = mismatchReasons[0];
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="min-w-0 break-words text-sm font-semibold leading-tight text-[var(--ink)]">
            {tr(renderedTitle, `job.${job.id}.title`)}
          </p>
          <p className="text-[11px] text-[var(--ink-2)]">
            {tr("Lvl", "job.lvlWord")} {job.requiredLevel}
            {job.minLanguageLevel ? ` · ${job.minLanguageLevel}` : ""}
            {job.minWeeklyHours ? ` · ${job.minWeeklyHours}h/wk` : ""}
            {" · "}
            {job.payPerTask}/{tr("task", "job.taskWord")}
          </p>
        </div>
        <span aria-hidden className="text-base">🔒</span>
      </div>

      {primary && (
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-[var(--ink-2)] uppercase tracking-wider">
            {t("jobs.whatsMissing")}
          </p>
          <div className="flex flex-wrap gap-1">
            {mismatchReasons.slice(0, 2).map((m, i) => (
              <Badge
                key={`${m.kind}-${i}`}
                variant={MISMATCH_VARIANT[m.kind]}
                className="!text-[11px]"
              >
                {tr(m.description)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {primary?.kind === "level-too-low" && (
        <p className="text-[11px] text-[var(--teal)] font-medium leading-snug">
          {t("jobs.locked.cta")} ({tr("you're at", "jobs.locked.youreAt")} L{level})
        </p>
      )}
    </div>
  );
}
