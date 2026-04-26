"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressStepper, LocaleBadge } from "@/components/ui";
import LanguagePicker from "@/components/LanguagePicker";
import { useT, useAutoT } from "@/lib/LocaleProvider";
import type { PublicProbeItem, ProbeResult } from "@/lib/probe";
import type { SignalProfile, EvidenceRubric } from "@/lib/signals";

// ─── Local form state ──────────────────────────────────────────────────────

type Selection = Record<string, number>; // itemId -> selectedIndex

export default function ProbePage() {
  const { t, locale } = useT();
  // Probe item content (prompts, options, explanations) lives outside the
  // typed dictionary, so it goes through useAutoT() to pick up the active
  // locale via the MyMemory MT cache.
  const tr = useAutoT();
  const router = useRouter();

  const [items, setItems] = useState<PublicProbeItem[]>([]);
  const [selection, setSelection] = useState<Selection>({});
  const [result, setResult] = useState<ProbeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Timing instrumentation ───────────────────────────────────────────
  // We snapshot the page mount time and per-item dwell time so the
  // server can score speed (permissive, untimed UX). Stored in refs so
  // we don't trigger React re-renders on every tick.
  const pageStartRef = useRef<number>(Date.now());
  const itemStartRef = useRef<Record<string, number>>({});

  // ─── Load items on mount ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/probe/items");
        const json = await res.json();
        if (cancelled) return;
        const fetched: PublicProbeItem[] = json?.data?.items ?? [];
        setItems(fetched);
        const now = Date.now();
        pageStartRef.current = now;
        // Initialise per-item start time so even an immediate answer has
        // a sensible duration.
        for (const it of fetched) {
          itemStartRef.current[it.id] = now;
        }
      } catch {
        setError("Could not load probe items.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function pick(itemId: string, optionIndex: number) {
    setSelection((s) => ({ ...s, [itemId]: optionIndex }));
    // First interaction with this item ends the dwell window. We keep
    // the original start time but mark "answered" by updating only when
    // it hasn't been recorded yet — preserves "first answer" timing.
    if (itemStartRef.current[`${itemId}:answered`] === undefined) {
      itemStartRef.current[`${itemId}:answered`] = Date.now();
    }
  }

  const ready = useMemo(
    () => items.length > 0 && items.every((it) => selection[it.id] !== undefined),
    [items, selection],
  );

  async function handleSubmit() {
    if (!ready) {
      setError(t("probe.allRequired"));
      return;
    }
    setError(null);
    setSubmitting(true);

    const profileRaw =
      typeof window !== "undefined"
        ? window.localStorage.getItem("ltl-profile")
        : null;
    const profile = profileRaw ? JSON.parse(profileRaw) : {};

    const now = Date.now();
    const answers = items.map((it) => {
      const answeredAt = itemStartRef.current[`${it.id}:answered`] ?? now;
      const startedAt = itemStartRef.current[it.id] ?? pageStartRef.current;
      return {
        itemId: it.id,
        selectedIndex: selection[it.id],
        durationMs: Math.max(0, answeredAt - startedAt),
      };
    });

    try {
      const res = await fetch("/api/probe/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: profile.id ?? "guest",
          answers,
          totalDurationMs: now - pageStartRef.current,
        }),
      });
      const json = await res.json();
      if (!json?.success) {
        setError(json?.error ?? "Probe submission failed.");
        return;
      }
      const probeResult: ProbeResult = json.data;
      setResult(probeResult);
      mergeRubricIntoSignalProfile(probeResult.rubric);
    } catch {
      setError("Probe submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function continueToClarify() {
    router.push("/clarify");
  }

  function skipProbe() {
    router.push("/clarify");
  }

  // ─── Render ───────────────────────────────────────────────────────────

  if (result) {
    return <ProbeResults result={result} onContinue={continueToClarify} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <ProgressStepper current={2} />
      </div>

      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <p className="section-label">Step 03 · Skill probe</p>
          <div className="flex items-center gap-2">
            <LocaleBadge locale={locale} />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
          {t("probe.title")}
        </h1>
        <p className="text-sm text-[var(--ink-2)] leading-relaxed">
          {t("probe.subtitle")}
        </p>
        <div className="pt-2 border-t border-[var(--line)]">
          <LanguagePicker />
        </div>
      </section>

      {/* Items */}
      {items.length === 0 && (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-6 text-sm text-[var(--ink-2)]">
          {tr("Loading probe items…", "probe.loading")}
        </div>
      )}

      {items.map((item, i) => {
        const selected = selection[item.id];
        return (
          <section
            key={item.id}
            className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-3"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-baseline gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--teal)] text-xs font-semibold text-white shrink-0">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-2)]">
                  {t("probe.itemCounter")} {i + 1} · {tr(item.niceName, `probe.${item.id}.niceName`)}
                </p>
                <p className="text-sm font-medium text-[var(--ink)] leading-snug mt-1">
                  {tr(item.prompt, `probe.${item.id}.prompt`)}
                </p>
              </div>
            </div>

            <div className="space-y-2 pl-10">
              {item.options.map((opt, idx) => {
                const active = selected === idx;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => pick(item.id, idx)}
                    className={`block w-full rounded-xl border px-4 py-3 text-left text-sm leading-relaxed transition-all ${
                      active
                        ? "border-[var(--teal)] bg-[var(--teal-light)] text-[var(--ink)] shadow-sm"
                        : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--teal)]/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          active
                            ? "border-[var(--teal)] bg-[var(--teal)]"
                            : "border-[var(--line)]"
                        }`}
                        aria-hidden
                      >
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="flex-1">{tr(opt, `probe.${item.id}.opt.${idx}`)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Footer actions */}
      {items.length > 0 && (
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
          {error && (
            <p className="text-xs text-red-600 leading-relaxed">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={skipProbe}
              className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink-2)] hover:bg-[var(--bg)] transition-colors"
            >
              {t("probe.skipForNow")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !ready}
              className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] disabled:opacity-40 transition-colors"
            >
              {submitting ? t("probe.submitting") : t("probe.submit")}
            </button>
          </div>
          <p className="text-[11px] text-[var(--ink-2)] italic">
            {t("probe.intro")}
          </p>
        </section>
      )}
    </div>
  );
}

// ─── Results screen ────────────────────────────────────────────────────────

function ProbeResults({
  result,
  onContinue,
}: {
  result: ProbeResult;
  onContinue: () => void;
}) {
  const { t, locale } = useT();
  const tr = useAutoT();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <ProgressStepper current={2} />
      </div>

      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <p className="section-label">Step 03 · Probe results</p>
          <LocaleBadge locale={locale} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
          {t("probe.results.title")}
        </h1>
        <p className="text-sm text-[var(--ink-2)] leading-relaxed">
          {t("probe.results.subtitle")}
        </p>
      </section>

      {/* Rubric pill row */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="grid grid-cols-3 gap-3">
          <RubricPill
            label={t("probe.results.accuracy")}
            value={result.rubric.accuracy}
          />
          <RubricPill
            label={t("probe.results.consistency")}
            value={result.rubric.consistency}
          />
          <RubricPill
            label={t("probe.results.speed")}
            value={result.rubric.speed}
          />
        </div>
        <p className="text-xs text-[var(--ink-2)] leading-relaxed mt-4">
          {tr(result.summary, "probe.results.summary")}
        </p>
      </section>

      {/* Per-item explanation */}
      <section className="space-y-3">
        {result.items.map((item, i) => (
          <div
            key={item.itemId}
            className={`rise rounded-2xl border p-5 shadow-sm space-y-2 ${
              item.isCorrect
                ? "border-[var(--teal)]/40 bg-[var(--teal-light)]"
                : "border-amber-200 bg-amber-50/50"
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-baseline gap-3">
              <span
                className={`inline-flex h-6 px-2 items-center rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  item.isCorrect
                    ? "bg-[var(--teal)] text-white"
                    : "bg-amber-200 text-amber-900"
                }`}
              >
                {item.isCorrect
                  ? t("probe.results.correct")
                  : t("probe.results.incorrect")}
              </span>
              <p className="text-sm font-semibold text-[var(--ink)] leading-tight">
                {tr("Item", "probe.results.itemLabel")} {i + 1} · {tr(item.niceName, `probe.${item.itemId}.niceName`)}
              </p>
            </div>
            <p className="text-xs uppercase tracking-wide text-[var(--ink-2)] mt-2">
              {t("probe.results.whyTitle")}
            </p>
            <p className="text-sm text-[var(--ink)] leading-relaxed">
              {tr(item.explanation, `probe.${item.itemId}.explanation`)}
            </p>
          </div>
        ))}
      </section>

      <div className="flex gap-3">
        <Link
          href="/passport"
          className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
        >
          {t("nav.passport")}
        </Link>
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
        >
          {t("probe.results.continueToClarify")}
        </button>
      </div>
    </div>
  );
}

function RubricPill({ label, value }: { label: string; value: number }) {
  // Colour intensity scales with the score so users can read the row
  // at a glance.
  const pct = Math.round(value * 100);
  const tone =
    value >= 0.8
      ? "bg-[var(--teal)] text-white"
      : value >= 0.5
        ? "bg-[var(--teal-light)] text-[var(--teal-dark)]"
        : "bg-amber-50 text-amber-900";
  return (
    <div className={`rounded-xl px-4 py-3 ${tone}`}>
      <p className="text-[10px] uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-2xl font-bold tabular-nums leading-none mt-1">
        {pct}
        <span className="text-base font-medium opacity-70">%</span>
      </p>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Merge a fresh EvidenceRubric into the persisted SignalProfile so the
 * matcher and downstream surfaces see source: "structured+probe" and
 * the +5 evidence-bonus reason fires.
 */
function mergeRubricIntoSignalProfile(rubric: EvidenceRubric) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem("ll-signal-profile");
    if (!raw) {
      window.localStorage.setItem(
        "ll-evidence-rubric",
        JSON.stringify(rubric),
      );
      return;
    }
    const sp = JSON.parse(raw) as SignalProfile;
    const merged: SignalProfile = {
      ...sp,
      evidenceRubric: rubric,
      source: "structured+probe",
      computedAt: new Date().toISOString(),
    };
    window.localStorage.setItem("ll-signal-profile", JSON.stringify(merged));
    window.localStorage.setItem("ll-evidence-rubric", JSON.stringify(rubric));
  } catch {
    // Non-fatal: matcher will just skip the bonus reason.
  }
}
