"use client";
/**
 * /passport — Phase 0.4 full rework.
 *
 * Reads two artefacts:
 *   - ll-signal-profile (Phase 0.2/0.3): structured SignalProfile with
 *     languages/CEFR, scripts, dialects, recognised domains (with weights),
 *     inferred ESCO skill clusters, and the optional EvidenceRubric from
 *     the probe.
 *   - ltl-passport (legacy): readinessScore, level, recommended tasks,
 *     verifiedSkills — kept so we don't double-implement scoring.
 *
 * The new sections surface the SignalProfile as portable evidence:
 *   ① Language proficiency (CEFR + scripts, dialect flag)
 *   ② Recognised cultural domains (chips with weight intensity)
 *   ③ Inferred ESCO skill clusters (top 8, with confidence bars)
 *   ④ Verified probe rubric (accuracy / consistency / speed)
 *   ⑤ Top matched roles + readiness breakdown
 */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge, DisclaimerNote, ProgressStepper, ScoreRing } from "@/components/ui";
import type { Passport } from "@/lib/types";
import { LEVEL_MAP } from "@/lib/scoring";
import { useT, useAutoT } from "@/lib/LocaleProvider";
import {
  ESCO_CATALOG,
  type DomainTag,
  type EscoSkillCode,
} from "@/lib/datasets";
import type { SignalProfile } from "@/lib/signals";

type TestResultStored = {
  score: number;
  level: number;
  levelTitle: string;
  correctCount: number;
  totalCount: number;
  breakdown: {
    accuracy: number;
    consistency: number;
    speed: number;
    language: number;
    reasoning: number;
  };
};

// ─── Lookups for chip/skill display ────────────────────────────────────────

const DOMAIN_LABELS: Record<DomainTag, string> = {
  payments: "Payments & mobile money",
  scams: "Scams & fraud patterns",
  transport: "Local transport",
  food: "Food & cuisine",
  music: "Music & culture",
  slang: "Slang & idiom",
  "code-switch": "Code-switching",
  religion: "Religion & ritual",
  markets: "Markets & trade",
  agriculture: "Agriculture & rural life",
  family: "Family & community",
  technology: "Tech & devices",
  education: "Education",
  health: "Health & wellbeing",
  sports: "Sports",
};

const DEVICE_LABELS = {
  "mobile-only": "Mobile only",
  "mobile-primary": "Mainly mobile",
  "desktop-primary": "Mainly laptop / desktop",
} as const;

// ─── Page ──────────────────────────────────────────────────────────────────

export default function PassportPage() {
  const router = useRouter();
  const { t } = useT();
  // Domain labels, ESCO catalog labels, level titles, and the narrative that
  // come from datasets (not the typed dictionary) follow the active locale
  // through useAutoT(). Falls back to English if MT can't reach the locale.
  const tr = useAutoT();
  const [passport, setPassport] = useState<Passport | null>(null);
  const [testResult, setTestResult] = useState<TestResultStored | null>(null);
  const [signalProfile, setSignalProfile] = useState<SignalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generate() {
      const profileRaw = readLs("ltl-profile");
      const qRaw = readLs("ltl-questionnaire");
      const testRaw = readLs("ltl-test-result");
      const signalRaw = readLs("ll-signal-profile");

      const profile = profileRaw ? JSON.parse(profileRaw) : {};
      const questionnaire = qRaw ? JSON.parse(qRaw) : {};
      const tr: TestResultStored = testRaw
        ? JSON.parse(testRaw)
        : {
            score: 72,
            level: 3,
            levelTitle: "Reviewer",
            correctCount: 4,
            totalCount: 6,
            breakdown: {
              accuracy: 67,
              consistency: 60,
              speed: 80,
              language: 66,
              reasoning: 60,
            },
          };

      setTestResult(tr);
      if (signalRaw) {
        try {
          setSignalProfile(JSON.parse(signalRaw));
        } catch {
          /* ignore corrupt signal profile */
        }
      }

      const res = await fetch(`/api/passport/${profile.id ?? "guest"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, questionnaire, testResult: tr }),
      });
      const json = await res.json();
      if (json.success) {
        setPassport(json.data.passport);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "ltl-passport",
            JSON.stringify(json.data.passport),
          );
        }
      }
      setLoading(false);
    }
    generate();
  }, []);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto pt-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-2 border-[var(--teal)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--ink-2)]">
          Generating your Skills Passport…
        </p>
      </div>
    );
  }

  const score = passport?.readinessScore ?? testResult?.score ?? 0;
  const level = passport?.level ?? testResult?.level ?? 0;
  const levelTitle =
    passport?.levelTitle ?? testResult?.levelTitle ?? "Unknown";
  const nextLevel = LEVEL_MAP.find((l) => l.level === level + 1);

  const breakdownItems = testResult?.breakdown
    ? [
        { label: "Accuracy", value: testResult.breakdown.accuracy, weight: "35%" },
        { label: "Consistency", value: testResult.breakdown.consistency, weight: "20%" },
        { label: "Speed", value: testResult.breakdown.speed, weight: "15%" },
        { label: "Language", value: testResult.breakdown.language, weight: "20%" },
        { label: "Reasoning", value: testResult.breakdown.reasoning, weight: "10%" },
      ]
    : [];

  // SignalProfile-derived collections
  const dialects = (signalProfile?.languages ?? []).filter((l) => l.isDialect);
  const nonDialectLanguages = (signalProfile?.languages ?? []).filter(
    (l) => !l.isDialect,
  );
  const domainsSorted =
    [...(signalProfile?.domains ?? [])]
      .filter((d) => d.weight > 0)
      .sort((a, b) => b.weight - a.weight) ?? [];
  const escoSorted = signalProfile
    ? Object.entries(signalProfile.inferredEscoSkills)
        .filter(([, conf]) => (conf as number) > 0)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 8)
    : [];
  const rubric = signalProfile?.evidenceRubric;

  return (
    <div className="max-w-2xl mx-auto min-w-0 space-y-6">
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <ProgressStepper current={5} />
      </div>
      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-2">
        <p className="section-label">{t("pp.step")}</p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
          {t("pp.title")}
        </h1>
        <p className="text-sm text-[var(--ink-2)]">{t("pp.subtitle")}</p>
      </section>

      {/* Headline score card */}
      <div className="rise rise-2 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-5 flex-wrap">
          <ScoreRing score={score} size={110} />
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-xs text-[var(--ink-2)]">{tr("Passport holder", "pp.holder")}</p>
              <h2 className="text-xl font-bold text-[var(--ink)]">
                {passport?.name ?? tr("Candidate", "pp.candidate")}
              </h2>
              <p className="text-sm text-[var(--ink-2)]">{passport?.country}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="teal">
                {tr("Level", "pp.levelWord")} {level} — {tr(levelTitle, `pp.levelTitle.${level}`)}
              </Badge>
              {testResult && (
                <Badge variant="outline">
                  {testResult.correctCount}/{testResult.totalCount} {tr("correct", "pp.correctWord")}
                </Badge>
              )}
              {signalProfile?.source && (
                <Badge variant="default">
                  {tr("Signal", "pp.signalWord")}: {signalProfile.source.replace("+", " + ")}
                </Badge>
              )}
            </div>
            {nextLevel && (
              <p className="text-xs text-[var(--ink-2)]">
                {tr("Next", "pp.nextWord")}: {tr("Level", "pp.levelWord")} {nextLevel.level} — {tr(nextLevel.title, `pp.levelTitle.${nextLevel.level}`)} ({tr("requires", "pp.requiresWord")}{" "}
                {nextLevel.min}+ {tr("score", "pp.scoreWord")})
              </p>
            )}
          </div>
        </div>

        {/* Score breakdown */}
        {breakdownItems.length > 0 && (
          <div className="pt-3 border-t border-[var(--line)] space-y-2">
            <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
              {t("pp.scoreBreakdown")}
            </p>
            {breakdownItems.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--ink-2)]">
                    {tr(item.label, `pp.breakdown.${item.label}`)}{" "}
                    <span className="text-[var(--teal)]">
                      ({tr("weight", "pp.weightWord")}: {item.weight})
                    </span>
                  </span>
                  <span className="font-medium text-[var(--ink)]">
                    {item.value}/100
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--teal-light)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--teal)] transition-all"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ① Language proficiency */}
      {nonDialectLanguages.length > 0 && (
        <section className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
              {t("pp.languages")}
            </p>
            <p className="text-[11px] text-[var(--ink-2)] leading-relaxed">
              {t("pp.languagesHint")}
            </p>
          </div>
          <div className="space-y-2">
            {nonDialectLanguages.map((lp) => (
              <div
                key={lp.language}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2"
              >
                <span className="font-medium text-[var(--ink)] text-sm">
                  {lp.language}
                </span>
                <Badge variant="teal">{lp.level}</Badge>
                {lp.scripts.map((s) => (
                  <Badge key={s} variant="default" className="!text-[10px]">
                    {s}
                  </Badge>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ② Local dialects (only if any) */}
      {dialects.length > 0 && (
        <section className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
              {t("pp.dialects")}
            </p>
            <p className="text-[11px] text-[var(--ink-2)] leading-relaxed">
              {t("pp.dialectsHint")}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {dialects.map((lp) => (
              <Badge key={lp.language} variant="green">
                {lp.language}
                {lp.parentLanguage ? ` · ${tr("via", "pp.viaWord")} ${lp.parentLanguage}` : ""} ({lp.level})
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* ③ Recognised cultural domains */}
      {domainsSorted.length > 0 && (
        <section className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
              {t("pp.recognisedDomains")}
            </p>
            <p className="text-[11px] text-[var(--ink-2)] leading-relaxed">
              {t("pp.recognisedDomainsHint")}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {domainsSorted.map((d) => (
              <DomainChip
                key={d.tag}
                tag={d.tag}
                weight={d.weight}
                label={tr(DOMAIN_LABELS[d.tag] ?? d.tag, `pp.domain.${d.tag}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ④ Inferred ESCO skill clusters */}
      {escoSorted.length > 0 && (
        <section className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
              {t("pp.escoSkills")}
            </p>
            <p className="text-[11px] text-[var(--ink-2)] leading-relaxed">
              {t("pp.escoSkillsHint")}
            </p>
          </div>
          <div className="space-y-2">
            {escoSorted.map(([code, conf]) => (
              <EscoBar
                key={code}
                code={code as EscoSkillCode}
                confidence={conf as number}
              />
            ))}
          </div>
        </section>
      )}

      {/* ⑤ Verified probe rubric */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
            {t("pp.probeRubric")}
          </p>
          <p className="text-[11px] text-[var(--ink-2)] leading-relaxed">
            {t("pp.probeRubricHint")}
          </p>
        </div>
        {rubric ? (
          <div className="grid grid-cols-3 gap-2">
            <RubricPill
              label={t("probe.results.accuracy")}
              value={Math.round(rubric.accuracy * 100)}
            />
            <RubricPill
              label={t("probe.results.consistency")}
              value={Math.round(rubric.consistency * 100)}
            />
            <RubricPill
              label={t("probe.results.speed")}
              value={Math.round(rubric.speed * 100)}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--bg)] p-3 text-center space-y-2">
            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              {t("pp.probeMissing")}
            </p>
            <Link
              href="/probe"
              className="inline-block text-xs font-semibold text-[var(--teal)] hover:underline"
            >
              {t("probe.title")} →
            </Link>
          </div>
        )}
      </section>

      {/* ⑥ Comfort & availability (compact strip) */}
      {signalProfile?.comfort && (
        <section className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="grid sm:grid-cols-3 gap-3 text-center">
            <ComfortStat
              label={tr("Writing comfort", "pp.writingComfort")}
              value={`${signalProfile.comfort.writingComfort}/5`}
            />
            <ComfortStat
              label={tr("Critical thinking", "pp.criticalThinking")}
              value={`${signalProfile.comfort.criticalThinking}/5`}
            />
            <ComfortStat
              label={t("pp.weeklyHours")}
              value={`${signalProfile.comfort.weeklyHoursAvailable}h`}
              note={tr(DEVICE_LABELS[signalProfile.comfort.deviceStability], `pp.device.${signalProfile.comfort.deviceStability}`)}
            />
          </div>
        </section>
      )}

      {/* ⑦ Top matched roles */}
      {passport?.recommendedTasks && passport.recommendedTasks.length > 0 && (
        <section className="rise rounded-2xl border border-[var(--teal)] bg-[var(--teal-light)] p-5 space-y-2">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-[var(--teal-dark)] uppercase tracking-wide">
              {t("pp.recommendedJobs")}
            </p>
            <p className="text-[11px] text-[var(--ink-2)] leading-relaxed">
              {t("pp.recommendedJobsHint")}
            </p>
          </div>
          <ul className="space-y-1.5">
            {passport.recommendedTasks.map((tt) => (
              <li
                key={tt}
                className="flex items-center gap-2 text-sm text-[var(--ink)]"
              >
                <span className="text-[var(--teal)]">→</span>
                {tr(tt)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ⑧ Verified skills */}
      {passport?.verifiedSkills && passport.verifiedSkills.length > 0 && (
        <section className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
            {tr("Verified skills", "pp.verifiedSkills")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {passport.verifiedSkills.map((s) => (
              <Badge key={s} variant="green">
                {tr(s)}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-[var(--ink-2)]">
            {t("pp.confidence")}:{" "}
            <strong>{passport.confidenceScore}%</strong>
          </p>
        </section>
      )}

      {/* Narrative */}
      <div className="rounded-xl bg-[var(--bg)] p-4 border border-[var(--line)]">
        <p className="text-xs text-[var(--ink-2)] leading-relaxed italic">
          {t("pp.narrative")}
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/test"
          className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
        >
          {t("pp.retake")}
        </Link>
        <button
          onClick={() => router.push("/jobs")}
          className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
        >
          {t("pp.viewJobs")} →
        </button>
      </div>

      <DisclaimerNote />
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function readLs(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function DomainChip({
  tag,
  weight,
  label,
}: {
  tag: DomainTag;
  weight: number;
  label: string;
}) {
  const intensity =
    weight >= 3
      ? "bg-[var(--teal)] text-white border-[var(--teal)]"
      : weight === 2
        ? "bg-[var(--teal-light)] text-[var(--teal-dark)] border-[var(--teal-light)]"
        : "bg-white text-[var(--ink)] border-[var(--line)]";
  const dots = "•".repeat(Math.min(3, Math.max(1, weight)));
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border ${intensity}`}
      title={tag}
    >
      <span>{label}</span>
      <span className="opacity-70">{dots}</span>
    </span>
  );
}

function EscoBar({
  code,
  confidence,
}: {
  code: EscoSkillCode;
  confidence: number;
}) {
  const pct = Math.min(100, Math.round(confidence * 100));
  const meta = ESCO_CATALOG[code];
  // ESCO labels live in the catalogue in English; auto-translate at render
  // time so non-English locales see them in their language.
  const tr = useAutoT();
  return (
    <div>
      <div className="flex justify-between items-baseline text-xs mb-1 gap-2">
        <span className="text-[var(--ink)] font-medium truncate">
          {tr(meta?.label ?? code, `esco.${code}.label`)}
        </span>
        <span className="text-[var(--ink-2)] tabular-nums shrink-0">
          ESCO {code} · {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--teal-light)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--teal)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function RubricPill({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 70
      ? "bg-[var(--teal)] text-white"
      : value >= 50
        ? "bg-[var(--teal-light)] text-[var(--teal-dark)]"
        : "bg-[var(--bg)] text-[var(--ink-2)] border border-[var(--line)]";
  return (
    <div className={`rounded-xl px-3 py-3 text-center ${tone}`}>
      <p className="text-xl font-bold leading-none tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide mt-1 opacity-80">
        {label}
      </p>
    </div>
  );
}

function ComfortStat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-lg font-bold text-[var(--ink)] tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-[var(--ink-2)]">
        {label}
      </p>
      {note && <p className="text-[11px] text-[var(--ink-2)]">{note}</p>}
    </div>
  );
}
