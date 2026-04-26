"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressStepper, DisclaimerNote, LocaleBadge } from "@/components/ui";
import CountrySwitcher from "@/components/CountrySwitcher";
import { useCountry } from "@/lib/useCountry";
import { getTranslations } from "@/lib/i18n";

type Answers = {
  a1: string; a2: string; a3: string; a4: string; a5: string;
  a6: string; a7: string; a8: string; a9: string; a10: string;
};

const empty: Answers = {
  a1: "", a2: "", a3: "", a4: "", a5: "",
  a6: "", a7: "", a8: "", a9: "", a10: "",
};

function getSampleAnswers(config: { region: string; languages: string[]; localTopic: string; whatOutsidersGetWrong: string; communityDomains: string[] }): Answers {
  return {
    a1: `${config.region} and surrounding communities`,
    a2: config.languages.join(", "),
    a3: config.localTopic,
    a4: config.whatOutsidersGetWrong,
    a5: config.communityDomains.join(", "),
    a6: "A local expression or everyday phrase that depends on context and tone.",
    a7: "I would explain when people use it, what literal translation misses, and what tone it carries.",
    a8: "Advice that ignores local transport, payment habits, family expectations, or informal services may sound correct online but fail locally.",
    a9: "I would compare trusted local sources, ask knowledgeable community members, and check whether the source understands the local context.",
    a10: "Yes — I would like to progress into AI output evaluation, cultural QA review, fact-checking, and community training.",
  };
}

const textareaCls =
  "w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent transition-all placeholder:text-[var(--ink-2)]/50 resize-none leading-relaxed";

export default function QuestionnairePage() {
  const { config, countryId, ready } = useCountry();
  const t = getTranslations(config.uiLocale);
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>(empty);
  const [submitting, setSubmitting] = useState(false);

  // Reset answers when country changes
  useEffect(() => {
    if (ready) setAnswers(empty);
  }, [countryId, ready]);

  function set(key: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function fillSample() {
    setAnswers(getSampleAnswers(config));
  }

  function clearAll() {
    setAnswers(empty);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const profileRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-profile") : null;
    const profile = profileRaw ? JSON.parse(profileRaw) : {};

    // Build LTL questionnaire data from the 10 answers
    const ltlQuestionnaire = {
      candidateId: profile.id ?? "guest",
      consentAccepted: true,
      hobbies: answers.a5 ? answers.a5.split(",").map((s: string) => s.trim()) : [],
      informalWork: answers.a3 ?? "",
      domainKnowledge: answers.a5 ? answers.a5.split(",").map((s: string) => s.trim()) : [],
      writingComfort: answers.a7 && answers.a7.length > 30 ? 4 : 3,
      criticalThinkingSelfRating: answers.a9 && answers.a9.length > 30 ? 4 : 3,
      preferredTaskTypes: ["AI Response Rating", "Cultural Context Review"],
    };

    if (typeof window !== "undefined") {
      window.localStorage.setItem("ltl-questionnaire", JSON.stringify(ltlQuestionnaire));
    }

    await fetch("/api/questionnaire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryId, answers }),
    });
    router.push("/clarify");
  }

  const questions: { key: keyof Answers; label: string; rows: number }[] = [
    { key: "a1", label: t.q1, rows: 2 },
    { key: "a2", label: t.q2, rows: 2 },
    { key: "a3", label: t.q3, rows: 3 },
    { key: "a4", label: t.q4, rows: 3 },
    { key: "a5", label: t.q5, rows: 2 },
    { key: "a6", label: t.q6, rows: 2 },
    { key: "a7", label: t.q7, rows: 3 },
    { key: "a8", label: t.q8, rows: 3 },
    { key: "a9", label: t.q9, rows: 3 },
    { key: "a10", label: t.q10, rows: 2 },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <ProgressStepper current={1} />
      </div>

      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <p className="section-label">Step 02 · Local context questionnaire</p>
          <div className="flex items-center gap-2">
            <LocaleBadge locale={config.uiLocale} />
            <CountrySwitcher />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">{t.title}</h1>
        <p className="text-sm text-[var(--ink-2)] leading-relaxed">{t.subtitle}</p>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={fillSample}
            className="rounded-lg border border-[var(--teal)] px-3 py-1.5 text-xs font-medium text-[var(--teal)] hover:bg-[var(--teal-light)] transition-colors"
          >
            Use sample answers for {config.country}
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] hover:bg-[var(--bg)] transition-colors"
          >
            Clear all
          </button>
        </div>
      </section>

      {/* AI clarification card */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
        <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-1">
          Why we ask
        </p>
        <p className="text-sm text-[var(--ink-2)] leading-relaxed">
          Your answers help identify where AI outputs about your community are inaccurate or culturally
          inappropriate. This becomes the evidence base for your Signal Profile.
        </p>
      </div>

      {/* Questions */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((q, i) => (
          <div
            key={q.key}
            className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-2"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <label className="block text-sm font-semibold text-[var(--ink)] leading-snug">
              <span className="text-[var(--teal)] font-mono text-xs mr-2">Q{i + 1}</span>
              {q.label}
            </label>
            <textarea
              rows={q.rows}
              value={answers[q.key]}
              onChange={(e) => set(q.key, e.target.value)}
              className={textareaCls}
              placeholder="Your answer…"
            />
          </div>
        ))}

        {/* Prototype localisation note */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs text-blue-700 leading-relaxed">{t.prototypeNote}</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/onboarding"
            className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
          >
            Back
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] disabled:opacity-40 transition-colors"
          >
            {submitting ? "Saving…" : t.continue}
          </button>
        </div>

        <DisclaimerNote />
      </form>
    </div>
  );
}
