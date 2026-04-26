"use client";
/**
 * /annotation — culturally-anchored AI-error annotation flow.
 *
 * Why this page was rewritten:
 *   The earlier version shipped a single, hardcoded English customer-service
 *   complaint (`SAMPLE_ANNOTATION_TASK`) for every user regardless of country
 *   or background. That completely undermined the project's thesis. Unmapped
 *   Voices' whole point is that uncredentialed people have *culturally
 *   specific* judgement that English-trained models lack — so the annotation
 *   surface must itself be culturally specific. A generic English drill
 *   tested nothing the rest of the app claims to find.
 *
 * What this version does:
 *   1. Reads the user's country (from `useCountry`) and their weighted chips
 *      (from `ll-chip-weights`, stashed by the questionnaire) and asks the
 *      cultural-task picker for the highest-leverage scenario for them —
 *      e.g. a Ghanaian user who flagged MoMo + scams sees the MoMo agent-
 *      fraud task; a Bahian user who flagged scams + family sees the Pix
 *      WhatsApp-clone task in Portuguese.
 *   2. Renders the customer voice, AI response, and brief through useAutoT()
 *      so the entire surface follows the active locale (the customer-voice
 *      preserves the original native_text alongside, since code-switched
 *      content is part of what's being judged).
 *   3. After submission, reveals what the LLM got wrong (`whatLLMGotWrong`)
 *      and the grounded alternative — turning each task into a teaching
 *      moment that demonstrates the user's lane to themselves.
 *
 * Backwards compatibility:
 *   The /api/annotation/submit and /api/qa/review endpoints are unchanged.
 *   We just send the new `taskId` from the cultural library instead of the
 *   removed SAMPLE_ANNOTATION_TASK.taskId.
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge, DisclaimerNote, ProgressStepper } from "@/components/ui";
import { useCountry } from "@/lib/useCountry";
import { useAutoT, useT } from "@/lib/LocaleProvider";
import {
  CULTURAL_ANNOTATION_TASKS,
  pickAnnotationTask,
  type CulturalAnnotationTask,
} from "@/lib/culturalAnnotationTasks";
import { COUNTRY_IDS, type CountryId } from "@/lib/datasets";
import type { SignalProfile } from "@/lib/signals";

type Step = "task" | "qa";

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

type StoredChipWeights = {
  countryId?: string;
  chipIds?: string[];
};

export default function AnnotationPage() {
  const router = useRouter();
  const { config, countryId } = useCountry();
  const { locale } = useT();
  const tr = useAutoT();

  const [signalProfile, setSignalProfile] = useState<SignalProfile | null>(null);
  const [chipWeights, setChipWeights] = useState<StoredChipWeights | null>(null);

  const [step, setStep] = useState<Step>("task");
  const [form, setForm] = useState({
    accuracyJudgement: "",
    qualityRating: "3",
    improvement: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [annotResult, setAnnotResult] = useState<AnnotationResult | null>(null);
  const [qaResult, setQaResult] = useState<QAResult | null>(null);
  const [reveal, setReveal] = useState(false);

  // Load persisted artefacts so we can pick a task tailored to the user.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const sp = window.localStorage.getItem("ll-signal-profile");
      if (sp) setSignalProfile(JSON.parse(sp) as SignalProfile);
    } catch {
      // ignore — fall through to country-only targeting
    }
    try {
      const cw = window.localStorage.getItem("ll-chip-weights");
      if (cw) setChipWeights(JSON.parse(cw) as StoredChipWeights);
    } catch {
      // ignore
    }
  }, []);

  // Pick the task. Recomputed when signal-profile or country changes.
  // `useCountry` types `countryId` as `string`; the picker (and the rest of
  // the dataset layer) wants the `CountryId` literal union, so we narrow
  // here. If the active country isn't in the supported set we treat it as
  // unknown and fall back to the picker's universal default.
  const task: CulturalAnnotationTask = useMemo(() => {
    const narrowed: CountryId | undefined = (COUNTRY_IDS as readonly string[]).includes(
      countryId,
    )
      ? (countryId as CountryId)
      : undefined;
    return pickAnnotationTask(
      narrowed,
      signalProfile?.domains,
      chipWeights?.chipIds,
    );
  }, [countryId, signalProfile, chipWeights]);

  function set(k: keyof typeof form, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function fillDemo() {
    // Fill with a plausible answer that demonstrates the cultural insight the
    // task is set up to reward. This isn't an "auto-correct" — it's a worked
    // example so jurors / first-time users see the *kind of answer* the task
    // expects without having to be a domain expert themselves.
    setForm({
      accuracyJudgement: "No",
      qualityRating: "2",
      improvement:
        task.groundedAlternative ??
        `${task.whatLLMGotWrong}\n\nA correct answer should reflect what really happens locally, not the generic Western pattern the model defaulted to.`,
    });
  }

  async function submitAnnotation() {
    setSubmitting(true);
    const profileRaw =
      typeof window !== "undefined" ? window.localStorage.getItem("ltl-profile") : null;
    const profile = profileRaw ? JSON.parse(profileRaw) : {};
    const candidateId = profile.id ?? "guest";

    const res = await fetch("/api/annotation/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId,
        taskId: task.id,
        ...form,
        qualityRating: Number(form.qualityRating),
      }),
    });
    const json = await res.json();

    if (json.success) {
      const result: AnnotationResult = json.data;
      setAnnotResult(result);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ltl-annotation", JSON.stringify(result));
      }
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
        setReveal(true);
        setStep("qa");
      }
    }
    setSubmitting(false);
  }

  function proceedToLeaderboard() {
    router.push("/leaderboard");
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent transition-all placeholder:text-[var(--ink-2)]/50 resize-none leading-relaxed";

  const otherTasksForCountry = CULTURAL_ANNOTATION_TASKS.filter(
    (t) => t.countryId === countryId && t.id !== task.id,
  );

  // Customer voice: prefer the native code-switched version when (a) the task
  // ships one and (b) the user's UI locale is anything other than plain English
  // (in which case auto-translation would actively harm the cultural signal).
  const showNativeFirst = !!task.nativeText && locale !== "en";

  return (
    <div className="max-w-2xl mx-auto min-w-0 space-y-6">
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <ProgressStepper current={6} />
      </div>
      {/* ─── Header ─── */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-2">
        <p className="section-label">
          {tr("Step 07 · Cultural annotation task", "annot.stepLabel")}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
          {step === "task"
            ? tr(task.title, `annot.${task.id}.title`)
            : tr("QA review result", "annot.qaTitle")}
        </h1>
        <p className="text-sm text-[var(--ink-2)] leading-relaxed">
          {step === "task"
            ? tr(task.taskBrief, `annot.${task.id}.brief`)
            : tr(
                "Your submission has been reviewed. QA is applied automatically based on quality score.",
                "annot.qaSubtitle",
              )}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge variant="teal">{config.country}</Badge>
          <Badge variant="default">
            {tr("Domain", "annot.domainWord")}: {tr(task.domain, `annot.domain.${task.domain}`)}
          </Badge>
          <Badge variant="outline">{task.chipId}</Badge>
        </div>
      </section>

      {/* ─── TASK STEP ─── */}
      {step === "task" && (
        <>
          {/* Why-you-can-catch-it framing */}
          <div className="rise rise-2 rounded-2xl border border-[var(--teal)]/40 bg-[var(--teal-light)] p-5 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--teal-dark)]">
              {tr("Why your judgement matters here", "annot.whyHeader")}
            </p>
            <p className="text-sm text-[var(--ink)] leading-relaxed">
              {tr(task.whyYouCanCatchIt, `annot.${task.id}.why`)}
            </p>
          </div>

          {/* Customer voice */}
          <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
              {tr("Customer voice", "annot.customerHeader")}
            </p>

            {showNativeFirst && task.nativeText && (
              <div className="rounded-xl bg-[var(--bg)] p-3 border-l-2 border-[var(--teal)] space-y-1">
                <p className="text-[11px] uppercase tracking-wide text-[var(--teal-dark)] font-semibold">
                  {task.nativeText.language}
                </p>
                <p className="text-sm text-[var(--ink)] italic leading-relaxed">
                  {task.nativeText.text}
                </p>
              </div>
            )}

            <p className="text-sm text-[var(--ink-2)] leading-relaxed">
              {tr(task.customerVoice, `annot.${task.id}.voice`)}
            </p>

            {!showNativeFirst && task.nativeText && (
              <details className="text-xs text-[var(--ink-2)]">
                <summary className="cursor-pointer hover:text-[var(--teal)]">
                  {tr("Show original", "annot.showOriginal")} ({task.nativeText.language})
                </summary>
                <p className="mt-2 italic leading-relaxed">{task.nativeText.text}</p>
              </details>
            )}
          </div>

          {/* AI response under evaluation */}
          <div className="rise rounded-2xl border border-red-200 bg-red-50 p-5 space-y-2">
            <Badge variant="red">{tr("AI-generated response to evaluate", "annot.aiHeader")}</Badge>
            <p className="text-sm text-[var(--ink)] leading-relaxed">
              {tr(task.aiResponse, `annot.${task.id}.ai`)}
            </p>
          </div>

          {/* Demo fill */}
          <button
            type="button"
            onClick={fillDemo}
            className="w-full rounded-xl border border-[var(--teal)] px-4 py-2 text-xs font-medium text-[var(--teal)] hover:bg-[var(--teal-light)] transition-colors"
          >
            {tr("Use sample annotation answer", "annot.useSample")}
          </button>

          {/* Form */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-2">
              <label className="block text-sm font-semibold text-[var(--ink)]">
                {tr(
                  "Is this AI response accurate and culturally appropriate?",
                  "annot.q.accuracy",
                )}
              </label>
              <div className="flex gap-2 flex-wrap">
                {(["Yes", "Partly", "No"] as const).map((opt) => (
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
                    {tr(opt, `annot.opt.${opt}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
              <label className="block text-sm font-semibold text-[var(--ink)]">
                {tr(
                  "Quality rating (1 = poor, 5 = excellent)",
                  "annot.q.quality",
                )}
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
                {tr(
                  "What's wrong with this answer, and how would a local fix it?",
                  "annot.q.improvement",
                )}
              </label>
              <textarea
                rows={4}
                value={form.improvement}
                onChange={(e) => set("improvement", e.target.value)}
                className={inputCls}
                placeholder={tr(
                  "Describe what the AI got wrong about your local context, and what a grounded answer would look like…",
                  "annot.q.placeholder",
                )}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/jobs"
              className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
            >
              {tr("Back to jobs", "annot.backToJobs")}
            </Link>
            <button
              onClick={submitAnnotation}
              disabled={!form.accuracyJudgement || submitting}
              className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] disabled:opacity-40 transition-colors"
            >
              {submitting
                ? tr("Submitting & running QA…", "annot.submitting")
                : `${tr("Submit annotation", "annot.submit")} →`}
            </button>
          </div>
        </>
      )}

      {/* ─── QA RESULT STEP ─── */}
      {step === "qa" && qaResult && annotResult && (
        <>
          <div
            className={`rise rise-2 rounded-2xl border p-6 space-y-4 ${
              qaResult.qaStatus === "approved"
                ? "border-emerald-300 bg-emerald-50"
                : "border-amber-300 bg-amber-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {qaResult.qaStatus === "approved" ? "✓" : "⚠"}
              </span>
              <div>
                <p className="font-bold text-[var(--ink)] capitalize">
                  {tr(qaResult.qaStatus.replace("_", " "), `annot.qa.${qaResult.qaStatus}`)}
                </p>
                <p className="text-xs text-[var(--ink-2)]">
                  {tr("QA quality score", "annot.qaScore")}: {annotResult.qualityScore}/100
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--ink)] leading-relaxed">
              {tr(qaResult.reviewerNote)}
            </p>
          </div>

          {/* Cultural reveal — what the LLM actually got wrong, surfaced AFTER
              the user committed to a judgement so we don't anchor them. */}
          {reveal && (
            <div className="rise rounded-2xl border border-[var(--teal)]/40 bg-[var(--teal-light)] p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--teal-dark)]">
                {tr("What the model got wrong", "annot.reveal.header")}
              </p>
              <p className="text-sm text-[var(--ink)] leading-relaxed">
                {tr(task.whatLLMGotWrong, `annot.${task.id}.wrong`)}
              </p>
              {task.groundedAlternative && (
                <div className="pt-3 border-t border-[var(--teal)]/30 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--teal-dark)]">
                    {tr("A grounded answer", "annot.reveal.alt")}
                  </p>
                  <p className="text-sm text-[var(--ink)] leading-relaxed italic">
                    {tr(task.groundedAlternative, `annot.${task.id}.alt`)}
                  </p>
                </div>
              )}
            </div>
          )}

          {qaResult.payment && (
            <div className="rise rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm space-y-3">
              <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
                {tr("Simulated payment created", "annot.payment.header")}
              </p>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-[var(--teal)]">
                  ${qaResult.payment.amount.toFixed(2)}
                </div>
                <div>
                  <Badge variant="green">{tr("Approved", "annot.payment.approved")}</Badge>
                  <p className="text-xs text-[var(--ink-2)] mt-1">{qaResult.payment.currency}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--ink-2)]">
                {tr("Submission ID", "annot.payment.submissionId")}: {annotResult.submissionId}
              </p>
            </div>
          )}

          {/* Other culturally-relevant tasks for this country, so the user can
              pivot to another scenario without leaving the page. */}
          {otherTasksForCountry.length > 0 && (
            <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-2)]">
                {tr("More cultural tasks for", "annot.more.header")} {config.country}
              </p>
              <ul className="space-y-1.5">
                {otherTasksForCountry.map((t) => (
                  <li key={t.id} className="flex items-start gap-2 text-sm text-[var(--ink)]">
                    <span className="text-[var(--teal)] shrink-0">→</span>
                    <span>{tr(t.title, `annot.${t.id}.title`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl bg-[var(--bg)] p-4 border border-[var(--line)]">
            <p className="text-xs text-[var(--ink-2)] leading-relaxed italic">
              {tr(
                "Unmapped Voices turns hidden human judgement into verified skill evidence. Every approved task adds to your progression ladder and leaderboard position.",
                "annot.tagline",
              )}
            </p>
          </div>

          <button
            onClick={proceedToLeaderboard}
            className="w-full rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
          >
            {tr("View leaderboard", "annot.viewLeaderboard")} →
          </button>
        </>
      )}

      <DisclaimerNote />
    </div>
  );
}
