"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge, DisclaimerNote, ScoreRing } from "@/components/ui";
import type { Passport } from "@/lib/types";
import { LEVEL_MAP } from "@/lib/scoring";

type TestResultStored = {
  score: number;
  level: number;
  levelTitle: string;
  correctCount: number;
  totalCount: number;
  breakdown: { accuracy: number; consistency: number; speed: number; language: number; reasoning: number };
};

export default function PassportPage() {
  const router = useRouter();
  const [passport, setPassport] = useState<Passport | null>(null);
  const [testResult, setTestResult] = useState<TestResultStored | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generate() {
      const profileRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-profile") : null;
      const qRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-questionnaire") : null;
      const testRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-test-result") : null;

      const profile = profileRaw ? JSON.parse(profileRaw) : {};
      const questionnaire = qRaw ? JSON.parse(qRaw) : {};
      const tr: TestResultStored = testRaw ? JSON.parse(testRaw) : { score: 72, level: 3, levelTitle: "Reviewer", correctCount: 4, totalCount: 6, breakdown: { accuracy: 67, consistency: 60, speed: 80, language: 66, reasoning: 60 } };

      setTestResult(tr);

      const res = await fetch(`/api/passport/${profile.id ?? "guest"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, questionnaire, testResult: tr }),
      });
      const json = await res.json();
      if (json.success) {
        setPassport(json.data.passport);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("ltl-passport", JSON.stringify(json.data.passport));
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
        <p className="text-sm text-[var(--ink-2)]">Generating your Skills Passport…</p>
      </div>
    );
  }

  const score = passport?.readinessScore ?? testResult?.score ?? 0;
  const level = passport?.level ?? testResult?.level ?? 0;
  const levelTitle = passport?.levelTitle ?? testResult?.levelTitle ?? "Unknown";
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-2">
        <p className="section-label">Step 05 · Skills Passport</p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">Your Skills Passport</h1>
        <p className="text-sm text-[var(--ink-2)]">
          Generated dynamically from your profile, questionnaire, and test score.
        </p>
      </section>

      {/* Score card */}
      <div className="rise rise-2 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-5 flex-wrap">
          <ScoreRing score={score} size={110} />
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-xs text-[var(--ink-2)]">Passport holder</p>
              <h2 className="text-xl font-bold text-[var(--ink)]">{passport?.name ?? "Candidate"}</h2>
              <p className="text-sm text-[var(--ink-2)]">{passport?.country}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="teal">
                Level {level} — {levelTitle}
              </Badge>
              {testResult && (
                <Badge variant="outline">
                  {testResult.correctCount}/{testResult.totalCount} correct
                </Badge>
              )}
            </div>
            {nextLevel && (
              <p className="text-xs text-[var(--ink-2)]">
                Next: Level {nextLevel.level} — {nextLevel.title} (requires {nextLevel.min}+ score)
              </p>
            )}
          </div>
        </div>

        {/* Score breakdown */}
        {breakdownItems.length > 0 && (
          <div className="pt-3 border-t border-[var(--line)] space-y-2">
            <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">Score breakdown</p>
            {breakdownItems.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--ink-2)]">
                    {item.label} <span className="text-[var(--teal)]">(weight: {item.weight})</span>
                  </span>
                  <span className="font-medium text-[var(--ink)]">{item.value}/100</span>
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

      {/* Verified skills */}
      {passport?.verifiedSkills && passport.verifiedSkills.length > 0 && (
        <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">Verified skills</p>
          <div className="flex flex-wrap gap-1.5">
            {passport.verifiedSkills.map((s) => (
              <Badge key={s} variant="green">
                {s}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-[var(--ink-2)]">
            Confidence score: <strong>{passport.confidenceScore}%</strong>
          </p>
        </div>
      )}

      {/* Languages */}
      {passport?.languages && (
        <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-2">
          <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">Language signals</p>
          <div className="flex flex-wrap gap-1.5">
            {passport.languages.map((l) => (
              <Badge key={l} variant="default">
                {l}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recommended tasks */}
      {passport?.recommendedTasks && passport.recommendedTasks.length > 0 && (
        <div className="rise rounded-2xl border border-[var(--teal)] bg-[var(--teal-light)] p-5 space-y-2">
          <p className="text-xs font-semibold text-[var(--teal-dark)] uppercase tracking-wide">Matched tasks</p>
          <ul className="space-y-1.5">
            {passport.recommendedTasks.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-[var(--ink)]">
                <span className="text-[var(--teal)]">→</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Narrative */}
      <div className="rounded-xl bg-[var(--bg)] p-4 border border-[var(--line)]">
        <p className="text-xs text-[var(--ink-2)] leading-relaxed italic">
          Label-to-Ladder turns hidden human judgement into verified skill evidence and uses that evidence to unlock
          ethical AI data work. Your Skills Passport is portable proof of what you can do.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/test"
          className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
        >
          Retake test
        </Link>
        <button
          onClick={() => router.push("/jobs")}
          className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
        >
          View matched jobs →
        </button>
      </div>

      <DisclaimerNote />
    </div>
  );
}
