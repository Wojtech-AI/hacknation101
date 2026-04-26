"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Badge, DisclaimerNote } from "@/components/ui";
import CountrySwitcher from "@/components/CountrySwitcher";
import { useCountry } from "@/lib/useCountry";
import { generateTasks } from "@/lib/tasks";

export default function TaskActivityPage() {
  const { config } = useCountry();
  const params = useParams();
  const taskId = params?.id as string;
  const tasks = generateTasks(config);
  const task = tasks.find((t) => t.id === taskId) ?? tasks[0];

  const router = useRouter();
  const [form, setForm] = useState({
    whatIsWrong: "",
    rewrite: "",
    confidence: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function fillDemo() {
    setForm({
      whatIsWrong: `This answer misses the local context. ${config.whatOutsidersGetWrong} A better answer would be: ${config.correctedAnswer}`,
      rewrite: config.correctedAnswer,
      confidence: "High",
    });
  }

  function set(k: keyof typeof form, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/tasks/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, countryId: config.id, ...form }),
    });
    const data = await res.json();
    if (typeof window !== "undefined") {
      window.localStorage.setItem("locallens-result", JSON.stringify(data));
    }
    router.push("/results");
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent transition-all placeholder:text-[var(--ink-2)]/50 resize-none";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="section-label">Task activity</p>
          <CountrySwitcher />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)]">{task.title}</h1>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="default">{task.provider}</Badge>
          <Badge variant="green">{task.pay}</Badge>
          <Badge variant="outline">{task.estimatedTime}</Badge>
        </div>
      </section>

      {/* Prompt */}
      <div className="rise rise-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 space-y-1">
        <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">Task prompt</p>
        <p className="text-sm text-[var(--ink)] leading-relaxed">
          Review this AI answer about <strong>{config.localTopic}</strong>. Mark what is wrong and rewrite it.
        </p>
      </div>

      {/* AI answer */}
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-2">
        <Badge variant="red">AI-generated answer to review</Badge>
        <blockquote className="text-sm text-[var(--ink)] italic leading-relaxed border-l-2 border-red-300 pl-3">
          {config.badAIAnswer}
        </blockquote>
      </div>

      {/* Demo fill */}
      <button
        type="button"
        onClick={fillDemo}
        className="w-full rounded-xl border border-[var(--teal)] px-4 py-2 text-xs font-medium text-[var(--teal)] hover:bg-[var(--teal-light)] transition-colors"
      >
        Use sample answers for {config.country}
      </button>

      {/* Task form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-2">
          <label className="block text-sm font-semibold text-[var(--ink)]">What is wrong?</label>
          <textarea
            rows={4}
            value={form.whatIsWrong}
            onChange={(e) => set("whatIsWrong", e.target.value)}
            className={inputCls}
            placeholder="Describe the cultural, factual, or linguistic errors…"
          />
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-2">
          <label className="block text-sm font-semibold text-[var(--ink)]">Rewrite the answer</label>
          <textarea
            rows={4}
            value={form.rewrite}
            onChange={(e) => set("rewrite", e.target.value)}
            className={inputCls}
            placeholder="Write a more accurate and locally appropriate version…"
          />
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-2">
          <label className="block text-sm font-semibold text-[var(--ink)]">Confidence</label>
          <div className="flex gap-2 flex-wrap">
            {["Low", "Medium", "High"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => set("confidence", opt)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                  form.confidence === opt
                    ? "border-[var(--teal)] bg-[var(--teal-light)] text-[var(--teal)]"
                    : "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[var(--bg)]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/tasks"
            className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
          >
            Back to tasks
          </Link>
          <button
            type="submit"
            disabled={submitting || !form.whatIsWrong}
            className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] disabled:opacity-40 transition-colors"
          >
            {submitting ? "Submitting…" : "Submit task"}
          </button>
        </div>

        <DisclaimerNote />
      </form>
    </div>
  );
}
