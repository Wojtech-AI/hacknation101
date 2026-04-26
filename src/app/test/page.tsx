"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge, DisclaimerNote, ProgressStepper } from "@/components/ui";
import { TEST_QUESTIONS } from "@/lib/mockData";
import { useAutoT } from "@/lib/LocaleProvider";

const TYPE_LABELS: Record<string, string> = {
  grammar: "Grammar",
  factual: "Factual check",
  comparison: "Response comparison",
  scam: "Scam detection",
  tone: "Tone rating",
  translation: "Translation",
};

export default function TestPage() {
  const router = useRouter();
  // Test prompts, options, explanations, and navigation labels are not in the
  // typed dictionary — route them all through useAutoT() so they follow the
  // active locale.
  const tr = useAutoT();
  const startTimeRef = useRef<number>(Date.now());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);

  const q = TEST_QUESTIONS[current];
  const answered = Object.keys(answers).length;
  const total = TEST_QUESTIONS.length;

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  function selectAnswer(option: string) {
    if (answers[q.id]) return; // already answered
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
    setRevealed(option);
  }

  function next() {
    setRevealed(null);
    if (current < total - 1) {
      setCurrent((c) => c + 1);
    }
  }

  async function submit() {
    setSubmitting(true);
    const profileRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-profile") : null;
    const questionnaireRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-questionnaire") : null;
    const profile = profileRaw ? JSON.parse(profileRaw) : {};
    const questionnaire = questionnaireRaw ? JSON.parse(questionnaireRaw) : {};

    const payload = {
      candidateId: profile.id ?? "guest",
      answers,
      startTime: startTimeRef.current,
      endTime: Date.now(),
      languages: profile.languages ?? ["English"],
      writingComfort: questionnaire.writingComfort ?? 3,
      criticalThinkingSelfRating: questionnaire.criticalThinkingSelfRating ?? 3,
    };

    const res = await fetch("/api/test/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success && typeof window !== "undefined") {
      window.localStorage.setItem("ltl-test-result", JSON.stringify(json.data));
    }
    router.push("/passport");
  }

  const isLast = current === total - 1;
  const allAnswered = answered === total;

  return (
    <div className="max-w-2xl mx-auto min-w-0 space-y-6">
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <ProgressStepper current={4} />
      </div>
      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="section-label">{tr("Step 05 · Micro-skill test", "test.stepLabel")}</p>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">
              {tr("Unmapped Voices readiness test", "test.title")}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--teal)]">
              {current + 1}
              <span className="text-base font-medium text-[var(--ink-2)]">/{total}</span>
            </p>
            <p className="text-xs text-[var(--ink-2)]">{tr("questions", "test.questions")}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1.5 rounded-full bg-[var(--teal-light)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--teal)] transition-all duration-300"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
      </section>

      {/* Question */}
      <div className="rise rise-2 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="default">{tr(TYPE_LABELS[q.type] ?? q.type, `test.type.${q.type}`)}</Badge>
          <span className="text-xs text-[var(--ink-2)]">
            {tr("Question", "test.questionWord")} {current + 1} {tr("of", "test.ofWord")} {total}
          </span>
        </div>

        <p className="text-base font-semibold text-[var(--ink)] leading-snug">
          {tr(q.prompt, `test.${q.id}.prompt`)}
        </p>

        {q.context && (
          <div className="rounded-xl bg-[var(--bg)] p-3 text-sm text-[var(--ink-2)] italic leading-relaxed border-l-2 border-[var(--teal)]">
            {tr(q.context, `test.${q.id}.context`)}
          </div>
        )}

        <div className="space-y-2">
          {q.options.map((opt) => {
            const isSelected = answers[q.id] === opt;
            const isCorrect = opt === q.correct;
            const isAnswered = !!answers[q.id];

            let cls =
              "w-full text-left rounded-xl border px-4 py-3 text-sm leading-relaxed transition-all ";
            if (!isAnswered) {
              cls += "border-[var(--line)] bg-white hover:border-[var(--teal)] hover:bg-[var(--teal-light)] cursor-pointer";
            } else if (isCorrect) {
              cls += "border-emerald-400 bg-emerald-50 text-emerald-800 font-medium";
            } else if (isSelected && !isCorrect) {
              cls += "border-red-300 bg-red-50 text-red-800";
            } else {
              cls += "border-[var(--line)] bg-white opacity-60";
            }

            return (
              <button key={opt} className={cls} onClick={() => selectAnswer(opt)} disabled={isAnswered}>
                <span className="flex items-start gap-2">
                  {isAnswered && isCorrect && <span className="text-emerald-600 shrink-0">✓</span>}
                  {isAnswered && isSelected && !isCorrect && <span className="text-red-500 shrink-0">×</span>}
                  {tr(opt, `test.${q.id}.opt.${opt}`)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation after answering */}
        {revealed && (
          <div className="rounded-xl bg-[var(--bg)] p-3 space-y-1 border-l-2 border-[var(--teal)]">
            <p className="text-xs font-semibold text-[var(--teal)]">{tr("Explanation", "test.explanationLabel")}</p>
            <p className="text-sm text-[var(--ink-2)] leading-relaxed">
              {tr(q.explanation, `test.${q.id}.explanation`)}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {current > 0 && (
          <button
            onClick={() => { setCurrent((c) => c - 1); setRevealed(answers[TEST_QUESTIONS[current - 1]?.id] ?? null); }}
            className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
          >
            {tr("Back", "test.back")}
          </button>
        )}
        {!isLast && (
          <button
            onClick={next}
            disabled={!answers[q.id]}
            className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] disabled:opacity-40 transition-colors"
          >
            {tr("Next question", "test.next")} →
          </button>
        )}
        {isLast && (
          <button
            onClick={submit}
            disabled={!allAnswered || submitting}
            className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] disabled:opacity-40 transition-colors"
          >
            {submitting
              ? tr("Calculating score…", "test.calculating")
              : `${tr("Submit test & generate passport", "test.submit")} →`}
          </button>
        )}
      </div>

      {/* Progress summary */}
      <div className="text-center">
        <p className="text-xs text-[var(--ink-2)]">
          {answered} {tr("of", "test.ofWord")} {total} {tr("answered", "test.answeredWord")}
        </p>
      </div>

      <DisclaimerNote
        text={tr(
          "Prototype demo: questions are seeded. Scoring uses a real formula: 35% accuracy + 20% consistency + 15% speed + 20% language + 10% reasoning.",
          "test.disclaimer",
        )}
      />
    </div>
  );
}
