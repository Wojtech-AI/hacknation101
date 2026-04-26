"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge, DisclaimerNote } from "@/components/ui";
import type { MatchedJob } from "@/lib/matching";

function FairWorkBar({ score }: { score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[var(--ink-2)]">Fair Work Score</span>
        <span className="font-semibold text-[var(--teal)]">{score}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--teal-light)] overflow-hidden">
        <div className="h-full rounded-full bg-[var(--teal)]" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [level, setLevel] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const profileRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-profile") : null;
      const testRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-test-result") : null;
      const passportRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-passport") : null;

      const profile = profileRaw ? JSON.parse(profileRaw) : {};
      const testResult = testRaw ? JSON.parse(testRaw) : {};
      const passport = passportRaw ? JSON.parse(passportRaw) : {};

      const candidateLevel = passport.level ?? testResult.level ?? 1;
      const candidateLanguages = profile.languages ?? passport.languages ?? ["English"];
      const candidateId = profile.id ?? "guest";

      setLevel(candidateLevel);

      const res = await fetch(`/api/jobs/matched/${candidateId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: candidateLevel, languages: candidateLanguages }),
      });
      const json = await res.json();
      if (json.success) setJobs(json.data.jobs);
      setLoading(false);
    }
    fetchJobs();
  }, []);

  const matched = jobs.filter((j) => !j.locked);
  const locked = jobs.filter((j) => j.locked);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto pt-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-2 border-[var(--teal)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--ink-2)]">Matching jobs to your profile…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-2">
        <p className="section-label">Step 06 · Matched AI data jobs</p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">Your matched jobs</h1>
        <p className="text-sm text-[var(--ink-2)] leading-relaxed max-w-xl">
          Jobs are matched to your readiness level and language signals. LocalLens filters for fairness, safety,
          and progression value — not cheapest labour.
        </p>
        <div className="flex gap-2 flex-wrap pt-1">
          <Badge variant="teal">Level {level}</Badge>
          <Badge variant="green">{matched.length} jobs matched</Badge>
          {locked.length > 0 && <Badge variant="outline">{locked.length} locked — unlock by levelling up</Badge>}
        </div>
      </section>

      {/* Matched jobs */}
      {matched.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide px-1">
            Available to you
          </p>
          {matched.map((job) => (
            <div
              key={job.id}
              className="rise rounded-2xl border border-[var(--line)] bg-white p-5 space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-semibold text-[var(--ink)]">{job.title}</h3>
                  <p className="text-xs text-[var(--ink-2)] mt-0.5">
                    Requires Level {job.requiredLevel}+ · {job.requiredLanguages.includes("Any") ? "Any language" : job.requiredLanguages.join(", ")}
                  </p>
                </div>
                <Badge variant={job.riskLevel === "Low" ? "green" : job.riskLevel === "Medium" ? "amber" : "red"}>
                  {job.riskLevel} risk
                </Badge>
              </div>
              <p className="text-sm text-[var(--ink-2)] leading-relaxed">{job.description}</p>
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="font-semibold text-[var(--teal)]">{job.payPerTask}/task</span>
                <span className="text-[var(--ink-2)]">· ~{job.estimatedMinutes} min</span>
                <span className="text-[var(--ink-2)]">· {job.growthValue}</span>
              </div>
              <FairWorkBar score={job.fairPayScore} />
              <Link
                href="/annotation"
                className="block w-full text-center rounded-lg bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
              >
                Try a sample task
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Locked jobs */}
      {locked.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide px-1">
            Locked — requires a higher level
          </p>
          {locked.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-5 space-y-3 opacity-70"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--ink)]">{job.title}</h3>
                    <span className="text-lg">🔒</span>
                  </div>
                  <p className="text-xs text-[var(--ink-2)] mt-0.5">
                    Requires Level {job.requiredLevel}+ — you are currently Level {level}
                  </p>
                </div>
              </div>
              <p className="text-sm text-[var(--ink-2)] leading-relaxed">{job.description}</p>
              <p className="text-xs text-[var(--teal)] font-medium">
                Complete more tasks to unlock at Level {job.requiredLevel}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/passport"
          className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
        >
          Back to passport
        </Link>
        <Link
          href="/annotation"
          className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
        >
          Try a sample task →
        </Link>
      </div>

      <DisclaimerNote />
    </div>
  );
}
