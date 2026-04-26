"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressStepper, DisclaimerNote, LocaleBadge } from "@/components/ui";
import CountrySwitcher from "@/components/CountrySwitcher";
import LanguagePicker from "@/components/LanguagePicker";
import { useCountry } from "@/lib/useCountry";
import { useT, useAutoT } from "@/lib/LocaleProvider";
import { COUNTRY_PACKS } from "@/lib/countryPacks";
import {
  CEFR_ORDER,
  type CefrLevel,
  type ComfortRating,
  type DeviceStability,
  type LanguageProficiency,
  type ScriptId,
} from "@/lib/signals";

// ─── Local form state ──────────────────────────────────────────────────────

type FormState = {
  languages: LanguageProficiency[];
  comfort: ComfortRating;
  chipWeights: Record<string, number>; // chipId -> 0..3
};

const DEFAULT_COMFORT: ComfortRating = {
  writingComfort: 3,
  criticalThinking: 3,
  weeklyHoursAvailable: 8,
  deviceStability: "mobile-primary",
};

const HOURS_OPTIONS = [
  { value: 3, label: "1–5 h / week" },
  { value: 8, label: "6–10 h / week" },
  { value: 15, label: "11–20 h / week" },
  { value: 25, label: "21–30 h / week" },
  { value: 35, label: "30+ h / week" },
];

const DIALECT_PARENTS: Record<string, string> = {
  "bahian portuguese": "Portuguese",
  sheng: "Swahili",
  taglish: "Tagalog",
  darija: "Arabic",
  "moroccan arabic": "Arabic",
  "nigerian pidgin": "English",
  "paisa spanish": "Spanish",
};

function inferScripts(language: string): ScriptId[] {
  const norm = language.toLowerCase();
  if (norm.includes("arabic") || norm.includes("darija"))
    return ["arabic", "mixed-latin-arabic", "latin"];
  if (norm.includes("hindi")) return ["devanagari", "latin"];
  if (norm.includes("kannada")) return ["kannada", "latin"];
  if (norm.includes("bengali")) return ["bengali", "latin"];
  return ["latin"];
}

function defaultLanguages(countryLanguages: string[]): LanguageProficiency[] {
  return countryLanguages.map((language, i) => {
    const norm = language.toLowerCase();
    const parent = DIALECT_PARENTS[norm];
    return {
      language,
      // Heuristic: first language listed by the country config gets C1,
      // the rest start at B1. Users can adjust before submitting.
      level: i === 0 ? "C1" : "B1",
      scripts: inferScripts(parent ?? language),
      isDialect: parent !== undefined,
      parentLanguage: parent,
    };
  });
}

// ─── Page component ────────────────────────────────────────────────────────

export default function QuestionnairePage() {
  const { config, countryId, ready } = useCountry();
  const { t, locale } = useT();
  // Auto-translate runtime strings (chip labels, intros, hints) that don't
  // live in the typed dictionary. Caches forever, falls back to English.
  const tr = useAutoT();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(() => ({
    languages: defaultLanguages(config.languages),
    comfort: DEFAULT_COMFORT,
    chipWeights: {},
  }));
  const [submitting, setSubmitting] = useState(false);

  // Reset when the country changes — the pack and language defaults all
  // depend on it.
  useEffect(() => {
    if (!ready) return;
    setForm({
      languages: defaultLanguages(config.languages),
      comfort: DEFAULT_COMFORT,
      chipWeights: {},
    });
  }, [countryId, ready, config.languages]);

  const pack = useMemo(() => COUNTRY_PACKS[config.id], [config.id]);

  // Derived counters for the inline summary card.
  const taggedCount = Object.values(form.chipWeights).filter(
    (w) => w > 0,
  ).length;
  const declaredLangs = form.languages.length;

  // ─── Mutators ─────────────────────────────────────────────────────────
  function setLevel(idx: number, level: CefrLevel) {
    setForm((f) => {
      const next = [...f.languages];
      next[idx] = { ...next[idx], level };
      return { ...f, languages: next };
    });
  }

  function toggleDialect(idx: number) {
    setForm((f) => {
      const next = [...f.languages];
      next[idx] = { ...next[idx], isDialect: !next[idx].isDialect };
      return { ...f, languages: next };
    });
  }

  function removeLang(idx: number) {
    setForm((f) => ({
      ...f,
      languages: f.languages.filter((_, i) => i !== idx),
    }));
  }

  function addLang() {
    setForm((f) => ({
      ...f,
      languages: [
        ...f.languages,
        {
          language: "",
          level: "B1",
          scripts: ["latin"],
          isDialect: false,
        },
      ],
    }));
  }

  function setLangName(idx: number, name: string) {
    setForm((f) => {
      const next = [...f.languages];
      const norm = name.toLowerCase();
      const parent = DIALECT_PARENTS[norm];
      next[idx] = {
        ...next[idx],
        language: name,
        scripts: inferScripts(parent ?? name),
        isDialect: parent !== undefined,
        parentLanguage: parent,
      };
      return { ...f, languages: next };
    });
  }

  function setComfort<K extends keyof ComfortRating>(
    key: K,
    value: ComfortRating[K],
  ) {
    setForm((f) => ({ ...f, comfort: { ...f.comfort, [key]: value } }));
  }

  function cycleChip(chipId: string) {
    setForm((f) => {
      const current = f.chipWeights[chipId] ?? 0;
      const next = (current + 1) % 4;
      const updated = { ...f.chipWeights };
      if (next === 0) delete updated[chipId];
      else updated[chipId] = next;
      return { ...f, chipWeights: updated };
    });
  }

  // ─── Submit ───────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const profileRaw =
      typeof window !== "undefined"
        ? window.localStorage.getItem("ltl-profile")
        : null;
    const profile = profileRaw ? JSON.parse(profileRaw) : {};

    const candidate = {
      id: profile.id ?? "guest",
      name: profile.name ?? config.userName,
      email: profile.email ?? "",
      country: profile.country ?? config.country,
      languages: profile.languages ?? config.languages,
      educationLevel: profile.educationLevel ?? "Unspecified",
      deviceAccess: profile.deviceAccess ?? "Smartphone",
      availability: profile.availability ?? "Part-time",
    };

    const structuredAnswers = {
      countryId: config.id,
      languages: form.languages.filter((l) => l.language.trim().length > 0),
      comfort: form.comfort,
      chipWeights: form.chipWeights,
    };

    // Persist a legacy questionnaire blob too so /clarify and /passport
    // (still on the legacy reader) keep showing sensible content.
    const ltlQuestionnaire = {
      candidateId: candidate.id,
      consentAccepted: true,
      hobbies: pack.chips
        .filter((c) => (form.chipWeights[c.id] ?? 0) > 0)
        .map((c) => c.label),
      informalWork: "",
      domainKnowledge: pack.chips
        .filter((c) => (form.chipWeights[c.id] ?? 0) > 0)
        .map((c) => c.label),
      writingComfort: form.comfort.writingComfort,
      criticalThinkingSelfRating: form.comfort.criticalThinking,
      preferredTaskTypes: ["AI Response Rating", "Cultural Context Review"],
    };

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "ltl-questionnaire",
        JSON.stringify(ltlQuestionnaire),
      );
      // Stash the explicit chip ids the user weighted (and their strengths) so
      // downstream pages can target country-pack content at chip granularity —
      // notably /annotation, which picks a culturally-anchored task based on
      // exactly which chip the user said they recognise most strongly.
      const weightedChipIds = Object.entries(form.chipWeights)
        .filter(([, w]) => (w ?? 0) > 0)
        .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
        .map(([id]) => id);
      window.localStorage.setItem(
        "ll-chip-weights",
        JSON.stringify({ countryId, chipIds: weightedChipIds, weights: form.chipWeights }),
      );
    }

    let signalProfile: unknown = null;
    try {
      const res = await fetch("/api/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate, structuredAnswers }),
      });
      const json = await res.json();
      signalProfile = json?.data?.signalProfile ?? null;
    } catch {
      // Non-fatal: /clarify still renders from localStorage.
    }

    if (typeof window !== "undefined" && signalProfile) {
      window.localStorage.setItem(
        "ll-signal-profile",
        JSON.stringify(signalProfile),
      );
    }

    router.push("/probe");
  }

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl min-w-0 space-y-6">
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <ProgressStepper current={1} />
      </div>

      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <p className="section-label">Step 02 · Local context questionnaire</p>
          <div className="flex items-center gap-2">
            <LocaleBadge locale={locale} />
            <CountrySwitcher />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
          {t("qst.title")}
        </h1>
        <p className="text-sm text-[var(--ink-2)] leading-relaxed">
          {t("qst.subtitle")}
        </p>
        <div className="pt-2 border-t border-[var(--line)]">
          <LanguagePicker />
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ──────────────── ZONE A — universal core ──────────────── */}
        <SectionCard
          number={1}
          title={t("qst.zoneA")}
          subtitle={t("qst.zoneAHint")}
        >
          {/* Languages × CEFR matrix */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-[var(--ink)]">
                {t("qst.languages")}
              </h3>
              <span className="text-xs text-[var(--ink-2)]">
                {t("qst.languagesHint")}
              </span>
            </div>
            <ul className="space-y-2">
              {form.languages.map((lp, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={lp.language}
                      onChange={(e) => setLangName(i, e.target.value)}
                      placeholder={tr("Language or dialect", "qst.langPlaceholder")}
                      className="flex-1 min-w-[140px] rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
                    />
                    <select
                      value={lp.level}
                      onChange={(e) => setLevel(i, e.target.value as CefrLevel)}
                      className="rounded-lg border border-[var(--line)] bg-white px-2 py-1.5 text-sm font-mono"
                      aria-label={t("qst.languageLevel")}
                    >
                      {CEFR_ORDER.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeLang(i)}
                      className="rounded-lg px-2 py-1.5 text-xs text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-white transition-colors"
                      title={t("qst.removeLanguage")}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--ink-2)]">
                    <span>
                      {t("qst.languageScripts")}:{" "}
                      <span className="font-mono text-[var(--ink)]">
                        {lp.scripts.join(", ")}
                      </span>
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!lp.isDialect}
                        onChange={() => toggleDialect(i)}
                        className="accent-[var(--teal)]"
                      />
                      {t("qst.dialectToggle")}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={addLang}
              className="rounded-lg border border-dashed border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--teal)] hover:bg-[var(--teal-light)] transition-colors"
            >
              + {t("qst.addLanguage")}
            </button>
          </div>

          {/* Comfort sliders */}
          <div className="border-t border-[var(--line)] pt-4 space-y-3">
            <h3 className="text-sm font-semibold text-[var(--ink)]">
              {t("qst.comfort")}
            </h3>
            <SliderRow
              label={t("qst.writingComfort")}
              value={form.comfort.writingComfort}
              onChange={(v) => setComfort("writingComfort", v)}
            />
            <SliderRow
              label={t("qst.criticalThinking")}
              value={form.comfort.criticalThinking}
              onChange={(v) => setComfort("criticalThinking", v)}
            />
          </div>

          {/* Availability */}
          <div className="border-t border-[var(--line)] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1.5">
                {t("qst.weeklyHours")}
              </label>
              <select
                value={form.comfort.weeklyHoursAvailable}
                onChange={(e) =>
                  setComfort("weeklyHoursAvailable", Number(e.target.value))
                }
                className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
              >
                {HOURS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {tr(opt.label, `qst.hours.${opt.value}`)}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[var(--ink-2)] mt-1">
                {t("qst.weeklyHoursHint")}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)] mb-1.5">
                {t("qst.deviceStability")}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    ["mobile-only", t("qst.deviceMobileOnly")],
                    ["mobile-primary", t("qst.deviceMobilePrimary")],
                    ["desktop-primary", t("qst.deviceDesktopPrimary")],
                  ] as Array<[DeviceStability, string]>
                ).map(([value, label]) => {
                  const active = form.comfort.deviceStability === value;
                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setComfort("deviceStability", value)}
                      className={`rounded-lg border px-2 py-2 text-[11px] font-medium transition-colors text-center leading-tight ${
                        active
                          ? "border-[var(--teal)] bg-[var(--teal-light)] text-[var(--teal-dark)]"
                          : "border-[var(--line)] bg-white text-[var(--ink-2)] hover:border-[var(--teal)]/40"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ──────────────── ZONE B — country pack ──────────────── */}
        <SectionCard
          number={2}
          title={t("qst.zoneB")}
          subtitle={pack.intro ? tr(pack.intro, `pack.${pack.countryId}.intro`) : t("qst.zoneBHint")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pack.chips.map((chip) => {
              const w = form.chipWeights[chip.id] ?? 0;
              return (
                <ChipButton
                  key={chip.id}
                  label={tr(chip.label, `chip.${chip.id}.label`)}
                  hint={chip.hint ? tr(chip.hint, `chip.${chip.id}.hint`) : undefined}
                  weight={w as 0 | 1 | 2 | 3}
                  onClick={() => cycleChip(chip.id)}
                />
              );
            })}
          </div>
          <p className="text-[11px] text-[var(--ink-2)] italic">
            {t("qst.weightHint")}
          </p>
        </SectionCard>

        {/* ──────────────── ZONE C — probe handoff ──────────────── */}
        <SectionCard
          number={3}
          title={t("qst.zoneC")}
          subtitle={t("qst.zoneCHint")}
        >
          <div className="rounded-xl border border-[var(--teal)]/30 bg-[var(--teal-light)] px-4 py-4 text-sm text-[var(--ink)] leading-relaxed">
            <p className="font-medium mb-1">3 items · Untimed · ~2 minutes</p>
            <p className="text-[var(--ink-2)]">
              After saving, you'll be taken straight to the probe — AI output
              rating, translation, and tone calibration. Skippable, but the
              evidence rubric unlocks a measurable bonus on job matching.
            </p>
          </div>
        </SectionCard>

        {/* ──────────────── Summary + submit ──────────────── */}
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="section-label flex-1">{t("qst.summary")}</p>
            <span className="text-xs text-[var(--ink-2)]">
              {declaredLangs} {t("qst.summaryLanguages").toLowerCase()} ·{" "}
              {taggedCount} {t("qst.summaryDomains").toLowerCase()}
            </span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/onboarding"
              className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
            >
              {t("common.back")}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] disabled:opacity-40 transition-colors"
            >
              {submitting ? t("common.saving") : t("qst.submit")}
            </button>
          </div>
        </section>

        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs text-blue-700 leading-relaxed">
            {t("qst.prototypeNote")}
          </p>
        </div>

        <DisclaimerNote />
      </form>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function SectionCard({
  number,
  title,
  subtitle,
  dim,
  children,
}: {
  number: number;
  title: string;
  subtitle?: string;
  dim?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-4 ${dim ? "opacity-95" : ""}`}
    >
      <header className="flex items-baseline gap-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--teal)] text-xs font-semibold text-white">
          {number}
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-[var(--ink)] leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[var(--ink-2)] leading-relaxed mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-[var(--ink)]">{label}</span>
        <span className="text-xs font-mono text-[var(--ink-2)]">
          {value} / 5
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--teal)]"
      />
    </div>
  );
}

function ChipButton({
  label,
  hint,
  weight,
  onClick,
}: {
  label: string;
  hint?: string;
  weight: 0 | 1 | 2 | 3;
  onClick: () => void;
}) {
  // Visual intensity scales with weight. 0 = outline; 1 = light fill;
  // 2 = medium fill; 3 = full fill. The class table avoids dynamic
  // Tailwind class generation (which Tailwind can't tree-shake).
  const palette: Record<0 | 1 | 2 | 3, string> = {
    0: "border-[var(--line)] bg-white text-[var(--ink-2)] hover:border-[var(--teal)]/40",
    1: "border-[var(--teal)]/40 bg-[var(--teal-light)] text-[var(--teal-dark)]",
    2: "border-[var(--teal)] bg-[var(--teal-light)] text-[var(--teal-dark)] font-semibold",
    3: "border-[var(--teal-dark)] bg-[var(--teal)] text-white font-semibold shadow-sm",
  };
  const labels: Record<1 | 2 | 3, string> = {
    1: "Some",
    2: "Strong",
    3: "Expert",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      aria-pressed={weight > 0}
      className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${palette[weight]}`}
    >
      <span className="leading-snug">{label}</span>
      {weight > 0 && (
        <span className="shrink-0 rounded-full bg-white/30 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide">
          {labels[weight as 1 | 2 | 3]}
        </span>
      )}
    </button>
  );
}
