"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge, DisclaimerNote } from "@/components/ui";
import { SAMPLE_ANNOTATION_TASK } from "@/lib/mockData";

type Step = "task" | "qa" | "payment";

type AnnotationResult = {
  submissionId: string;
  isCorrect: boolean;
  qualityScore: number;
  status: "approved" | "needs_review" | "rejected";
};

type QAResult = {
  qaStatus: "approved" | "needs_review";
  reviewerNote: string;
  payment: { amount: number; currency: string } | null;
};

export default function AnnotationPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("task");
  const [form, setForm] = useState({
    accuracyJudgement: "",
    qualityRating: "3",
    improvement: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [annotResult, setAnnotResult] = useState<AnnotationResult | null>(null);
  const [qaResult, setQaResult] = useState<QAResult | null>(null);

  function set(k: keyof typeof form, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function fillDemo() {
    setForm({
      accuracyJudgement: "Partly",
      qualityRating: "3",
      improvement:
        "The response should acknowledge the 10-day wait and broken product directly, offer a concrete resolution (replacement or refund), and provide a timeline. Saying 'noted' is insufficient for a serious complaint.",
    });
  }

  async function submitAnnotation() {
    setSubmitting(true);
    const profileRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-profile") : null;
    const profile = profileRaw ? JSON.parse(profileRaw) : {};
    const candidateId = profile.id ?? "guest";

    const res = await fetch("/api/annotation/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, taskId: SAMPLE_ANNOTATION_TASK.taskId, ...form, qualityRating: Number(form.qualityRating) }),
    });
    const json = await res.json();

    if (json.success) {
      const result: AnnotationResult = json.data;
      setAnnotResult(result);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ltl-annotation", JSON.stringify(result));
      }

      // Immediately trigger QA review
      const qaRes = await fetch("/api/qa/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result, candidateId }),
      });
      const qaJson = await qaRes.json();
      if (qaJson.success) {
        setQaResult(qaJson.data);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("ltl-qa-result", JSON.stringify(qaJson.data));
        }
        setStep("qa");
      }
    }
    setSubmitting(false);
  }

  async function proceedToLeaderboard() {
    router.push("/leaderboard");
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent transition-all placeholder:text-[var(--ink-2)]/50 resize-none leading-relaxed";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-2">
        <p className="section-label">Step 07 · Sample annotation task</p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
          {step === "task" ? "Annotation task" : step === "qa" ? "QA review result" : "Payment record"}
        </h1>
        <p className="text-sm text-[var(--ink-2)]">
          {step === "task"
            ? "Evaluate this AI-generated response. Your submission will trigger automatic QA review."
            : step === "qa"
            ? "Your submission has been reviewed. QA is applied automatically based on quality score."
            : "Simulated payment created for approved work."}
        </p>

        {/* Step indicator */}
        <div className="flex gap-2 pt-1">
          {(["task", "qa", "payment"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s
                    ? "bg-[var(--teal)] text-white"
                    : (step === "qa" && i < 1) || (step === "payment" && i < 2)
                    ? "bg-[var(--teal)] text-white"
                    : "bg-[var(--line)] text-[var(--ink-2)]"
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="w-6 h-0.5 bg-[var(--line)] rounded" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── TASK STEP ── */}
      {step === "task" && (
        <>
          {/* Task brief */}
          <div className="rise rise-2 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
            <div>
              <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-1">Task</p>
              <h3 className="font-semibold text-[var(--ink)]">{SAMPLE_ANNOTATION_TASK.title}</h3>
              <p className="text-sm text-[var(--ink-2)] mt-1 leading-relaxed">{SAMPLE_ANNOTATION_TASK.instruction}</p>
            </div>

            <div className="rounded-xl bg-[var(--bg)] p-3 border-l-2 border-[var(--line)]">
              <p className="text-xs font-semibold text-[var(--ink-2)] mb-1">Original complaint:</p>
              <p className="text-sm text-[var(--ink)] italic leading-relaxed">{SAMPLE_ANNOTATION_TASK.customerComplaint}</p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-1">
              <Badge variant="red">AI-generated response to evaluate</Badge>
              <p className="text-sm text-[var(--ink)] leading-relaxed">{SAMPLE_ANNOTATION_TASK.aiResponse}</p>
            </div>
          </div>

          {/* Fill demo */}
          <button
            type="button"
            onClick={fillDemo}
            className="w-full rounded-xl border border-[var(--teal)] px-4 py-2 text-xs font-medium text-[var(--teal)] hover:bg-[var(--teal-light)] transition-colors"
          >
            Use sample annotation answers
          </button>

          {/* Form */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-2">
              <label className="block text-sm font-semibold text-[var(--ink)]">
                Is this AI response accurate and appropriate?
              </label>
              <div className="flex gap-2 flex-wrap">
                {["Yes", "Partly", "No"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set("accuracyJudgement", opt)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                      form.accuracyJudgement === opt
                        ? "border-[var(--teal)] bg-[var(--teal-light)] text-[var(--teal)]"
                        : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--bg)]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
              <label className="block text-sm font-semibold text-[var(--ink)]">
                Quality rating (1 = poor, 5 = excellent)
              </label>
              <div className="flex gap-2">
                {["1", "2", "3", "4", "5"].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set("qualityRating", n)}
                    className={`flex-1 rounded-xl border py-2 text-sm font-bold transition-all ${
                      form.qualityRating === n
                        ? "border-[var(--teal)] bg-[var(--teal)] text-white"
                        : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--bg)]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-2">
              <label className="block text-sm font-semibold text-[var(--ink)]">
                What would improve this response?
              </label>
              <textarea
                rows={4}
                value={form.improvement}
                onChange={(e) => set("improvement", e.target.value)}
                className={inputCls}
                placeholder="Describe specific improvements to make this AI response more helpful and appropriate…"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/jobs"
              className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
            >
              Back to jobs
            </Link>
            <button
              onClick={submitAnnotation}
              disabled={!form.accuracyJudgement || submitting}
              className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] disabled:opacity-40 transition-colors"
            >
              {submitting ? "Submitting & running QA…" : "Submit annotation →"}
            </button>
          </div>
        </>
      )}

      {/* ── QA RESULT STEP ── */}
      {step === "qa" && qaResult && annotResult && (
        <>
          <div
            className={`rise rise-2 rounded-2xl border p-6 space-y-4 ${
              qaResult.qaStatus === "approved" ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{qaResult.qaStatus === "approved" ? "✓" : "⚠"}</span>
              <div>
                <p className="font-bold text-[var(--ink)] capitalize">{qaResult.qaStatus.replace("_", " ")}</p>
                <p className="text-xs text-[var(--ink-2)]">QA quality score: {annotResult.qualityScore}/100</p>
              </div>
            </div>
            <p className="text-sm text-[var(--ink)] leading-relaxed">{qaResult.reviewerNote}</p>
          </div>

          {qaResult.payment && (
            <div className="rise rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm space-y-3">
              <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
                Simulated payment created
              </p>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-[var(--teal)]">
                  ${qaResult.payment.amount.toFixed(2)}
                </div>
                <div>
                  <Badge variant="green">Approved</Badge>
                  <p className="text-xs text-[var(--ink-2)] mt-1">{qaResult.payment.currency}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--ink-2)]">
                Submission ID: {annotResult.submissionId}
              </p>
            </div>
          )}

          <div className="rounded-xl bg-[var(--bg)] p-4 border border-[var(--line)]">
            <p className="text-xs text-[var(--ink-2)] leading-relaxed italic">
              Label-to-Ladder turns hidden human judgement into verified skill evidence. Every approved task adds to
              your progression ladder and leaderboard position.
            </p>
          </div>

          <button
            onClick={proceedToLeaderboard}
            className="w-full rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
          >
            View leaderboard →
          </button>
        </>
      )}

      <DisclaimerNote />
    </div>
  );
}
