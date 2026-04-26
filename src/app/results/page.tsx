"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge, DisclaimerNote } from "@/components/ui";

type Result = {
  accepted: boolean;
  qualityScore: string;
  paymentEarned: string;
  progress: string;
  feedback: string;
};

const DEFAULT_RESULT: Result = {
  accepted: true,
  qualityScore: "92%",
  paymentEarned: "$2.40",
  progress: "3/10 tasks toward Level 3 Cultural QA Reviewer",
  feedback:
    "Strong cultural correction and clear explanation. To improve, add one trusted source or local reference next time.",
};

const LADDER = [
  { level: 1, title: "Local-language Annotator", current: false },
  { level: 2, title: "AI Output Evaluator", current: true },
  { level: 3, title: "Cultural QA Reviewer", current: false },
  { level: 4, title: "Fact-checking Reviewer", current: false },
  { level: 5, title: "Domain Evaluator", current: false },
  { level: 6, title: "Community Trainer / Data Quality Lead", current: false },
];

export default function ResultsPage() {
  const [result, setResult] = useState<Result>(DEFAULT_RESULT);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("locallens-result");
      if (stored) {
        try { setResult(JSON.parse(stored)); } catch { /* ignore */ }
      }
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-2">
        <p className="section-label">Task result</p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">Task complete</h1>
        <p className="text-sm text-[var(--ink-2)]">Your submission has been reviewed and scored.</p>
      </section>

      {/* Result card */}
      <div className="rise rise-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✓</span>
          <span className="font-semibold text-emerald-800">Accepted</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white p-3 space-y-0.5 border border-emerald-100">
            <p className="text-xs text-[var(--ink-2)]">Quality score</p>
            <p className="text-xl font-bold text-[var(--teal)]">{result.qualityScore}</p>
          </div>
          <div className="rounded-xl bg-white p-3 space-y-0.5 border border-emerald-100">
            <p className="text-xs text-[var(--ink-2)]">Mock payment</p>
            <p className="text-xl font-bold text-[var(--teal)]">{result.paymentEarned}</p>
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 border border-emerald-100 space-y-0.5">
          <p className="text-xs text-[var(--ink-2)]">Progress</p>
          <p className="text-sm font-medium text-[var(--ink)]">{result.progress}</p>
        </div>
      </div>

      {/* Feedback */}
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-2">
        <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">Feedback</p>
        <p className="text-sm text-[var(--ink)] leading-relaxed">{result.feedback}</p>
      </div>

      {/* Progression ladder */}
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-4">
        <div>
          <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-0.5">
            Fair-work progression ladder
          </p>
          <p className="text-xs text-[var(--ink-2)]">Simulated pilot pathway</p>
        </div>
        <div className="space-y-2">
          {LADDER.map((rung) => (
            <div
              key={rung.level}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors ${
                rung.current
                  ? "bg-[var(--teal)] text-white"
                  : "bg-[var(--bg)] text-[var(--ink-2)]"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  rung.current ? "bg-white text-[var(--teal)]" : "bg-white/60 text-[var(--ink-2)]"
                }`}
              >
                {rung.level}
              </span>
              <span className={`text-sm font-medium flex-1 ${rung.current ? "text-white" : ""}`}>
                {rung.title}
              </span>
              {rung.current && (
                <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-[10px]">
                  Current
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/tasks"
          className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
        >
          More tasks
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
        >
          View dashboard →
        </Link>
      </div>

      <DisclaimerNote />
    </div>
  );
}
