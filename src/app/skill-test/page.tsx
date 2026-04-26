"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressStepper, DisclaimerNote, Badge } from "@/components/ui";
import CountrySwitcher from "@/components/CountrySwitcher";
import { useCountry } from "@/lib/useCountry";

type FormData = {
  selectedAccuracy: string;
  explanation: string;
  correction: string;
};

export default function SkillTestPage() {
  const { config, countryId } = useCountry();
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    selectedAccuracy: "",
    explanation: "",
    correction: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function fillDemo() {
    setForm({
      selectedAccuracy: "Inaccurate",
      explanation: config.whatOutsidersGetWrong,
      correction: config.correctedAnswer,
    });
  }

  function set(k: keyof FormData, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/skill-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryId, ...form }),
    });
    const data = await res.json();
    if (typeof window !== "undefined") {
      window.localStorage.setItem("locallens-signal", JSON.stringify(data));
    }
    router.push("/passport");
  }

  const accuracyOptions = ["Accurate", "Partly wrong", "Inaccurate", "Not sure"];
  const inputCls =
    "w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent transition-all placeholder:text-[var(--ink-2)]/50";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <ProgressStepper current={4} />
      </div>

      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="section-label">Step 03 · Proof-of-skill screening</p>
          <CountrySwitcher />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">Micro AI Evaluation Test</h1>
        <p className="text-sm text-[var(--ink-2)] leading-relaxed">
          Read the AI-generated answer below. Evaluate its accuracy for{" "}
          <strong>{config.country}</strong> and suggest a correction.
        </p>
        <button
          type="button"
          onClick={fillDemo}
          className="rounded-lg border border-[var(--teal)] px-3 py-1.5 text-xs font-medium text-[var(--teal)] hover:bg-[var(--teal-light)] transition-colors"
        >
          Use sample answers for {config.country}
        </button>
      </section>

      {/* AI answer to evaluate */}
      <div className="rise rise-2 rounded-2xl border border-red-200 bg-red-50 p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="red">AI-generated answer</Badge>
          <span className="text-xs text-[var(--ink-2)]">{config.localTopic}</span>
        </div>
        <blockquote className="text-sm text-[var(--ink)] leading-relaxed italic border-l-2 border-red-300 pl-3">
          {config.badAIAnswer}
        </blockquote>
      </div>

      {/* Evaluation form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rise rise-3 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
          <label className="block text-sm font-semibold text-[var(--ink)]">
            1. Does this sound accurate and natural for {config.country}?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {accuracyOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => set("selectedAccuracy", opt)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                  form.selectedAccuracy === opt
                    ? "border-[var(--teal)] bg-[var(--teal-light)] text-[var(--teal)]"
                    : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--bg)]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-2">
          <label className="block text-sm font-semibold text-[var(--ink)]">
            2. What is wrong with it?
          </label>
          <textarea
            rows={3}
            value={form.explanation}
            onChange={(e) => set("explanation", e.target.value)}
            className={`${inputCls} resize-none`}
            placeholder="Describe what the AI gets wrong about local context, culture, or facts…"
          />
        </div>

        <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-2">
          <label className="block text-sm font-semibold text-[var(--ink)]">
            3. Rewrite it so it sounds more accurate and locally appropriate.
          </label>
          <textarea
            rows={4}
            value={form.correction}
            onChange={(e) => set("correction", e.target.value)}
            className={`${inputCls} resize-none`}
            placeholder="Write a more accurate version that reflects local reality…"
          />
        </div>

        <div className="flex gap-3">
          <Link
            href="/questionnaire"
            className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
          >
            Back
          </Link>
          <button
            type="submit"
            disabled={!form.selectedAccuracy || submitting}
            className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] disabled:opacity-40 transition-colors"
          >
            {submitting ? "Generating profile…" : "Submit evaluation"}
          </button>
        </div>

        <DisclaimerNote />
      </form>
    </div>
  );
}
