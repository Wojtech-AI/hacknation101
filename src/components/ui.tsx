"use client";
import Link from "next/link";
import type { CountryConfig } from "@/lib/countryConfigs";

// ─── Badge ───────────────────────────────────────────────────────────────────

type BadgeVariant = "default" | "teal" | "green" | "amber" | "red" | "outline";

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  const styles: Record<BadgeVariant, string> = {
    default: "bg-[var(--teal-light)] text-[var(--teal-dark)]",
    teal: "bg-[var(--teal)] text-white",
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-1 ring-red-200",
    outline: "bg-white text-[var(--ink)] ring-1 ring-[var(--line)]",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// ─── LocaleBadge ─────────────────────────────────────────────────────────────

export function LocaleBadge({ locale }: { locale: string }) {
  const labels: Record<string, string> = {
    en: "English",
    fr: "Français",
    pt: "Português",
    es: "Español",
    sw: "Kiswahili",
  };
  return (
    <Badge variant="outline" className="font-mono">
      🌐 {labels[locale] ?? locale}
    </Badge>
  );
}

// ─── SectionHeading ──────────────────────────────────────────────────────────

export function SectionHeading({
  label,
  title,
  subtitle,
}: {
  label?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-1">
      {label && <p className="section-label">{label}</p>}
      <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">{title}</h2>
      {subtitle && <p className="text-sm text-[var(--ink-2)] leading-relaxed">{subtitle}</p>}
    </div>
  );
}

// ─── DisclaimerNote ──────────────────────────────────────────────────────────

export function DisclaimerNote({ text }: { text?: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex gap-2.5 items-start">
      <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
      <p className="text-xs text-amber-800 leading-relaxed">
        {text ??
          "Prototype demo: partner names, payments, task volumes, labour-market figures, and dashboard data are simulated for demonstration purposes."}
      </p>
    </div>
  );
}

// ─── HeaderNav ───────────────────────────────────────────────────────────────

export function HeaderNav() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/onboarding", label: "Get Started" },
    { href: "/test", label: "Skill Test" },
    { href: "/passport", label: "Passport" },
    { href: "/jobs", label: "Jobs" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/pitch", label: "For Judges" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-[var(--teal)] tracking-tight text-lg"
        >
          <span className="inline-block w-6 h-6 rounded-lg bg-[var(--teal)] text-white flex items-center justify-center text-xs font-black">
            L
          </span>
          LocalLens
        </Link>
        <nav className="hidden sm:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--ink-2)] hover:bg-[var(--teal-light)] hover:text-[var(--teal)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/onboarding"
          className="hidden sm:block rounded-lg bg-[var(--teal)] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
        >
          Start Demo
        </Link>
      </div>
    </header>
  );
}

// ─── ProgressStepper ─────────────────────────────────────────────────────────

const STEPS = [
  { label: "Profile", href: "/onboarding" },
  { label: "Questionnaire", href: "/questionnaire" },
  { label: "Skill Test", href: "/skill-test" },
  { label: "Signal Profile", href: "/signal-profile" },
  { label: "Tasks", href: "/tasks" },
];

export function ProgressStepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.label} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  done
                    ? "bg-[var(--teal)] text-white"
                    : active
                    ? "bg-white border-2 border-[var(--teal)] text-[var(--teal)]"
                    : "bg-white border-2 border-[var(--line)] text-[var(--ink-2)]"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={`mt-1 text-[10px] font-medium whitespace-nowrap ${
                  active ? "text-[var(--teal)]" : done ? "text-[var(--teal-dark)]" : "text-[var(--ink-2)]"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 rounded-full transition-all ${
                  done ? "bg-[var(--teal)]" : "bg-[var(--line)]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ScoreRing ───────────────────────────────────────────────────────────────

export function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--teal-light)" strokeWidth={8} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--teal)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-2xl font-bold text-[var(--teal)]">{score}</span>
        <span className="block text-[10px] text-[var(--ink-2)] font-medium">/ 100</span>
      </div>
    </div>
  );
}

// ─── SignalProfileCard ────────────────────────────────────────────────────────

export function SignalProfileCard({
  config,
  score,
  level,
  badges,
  skills,
}: {
  config: CountryConfig;
  score: number;
  level: string;
  badges: string[];
  skills: string[];
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-start gap-4 flex-wrap">
        <ScoreRing score={score} size={100} />
        <div className="flex-1 min-w-0">
          <p className="section-label">Signal Profile</p>
          <h3 className="text-xl font-semibold text-[var(--ink)] mt-1">{config.userName}</h3>
          <p className="text-sm text-[var(--ink-2)]">
            {config.country} · {config.region}
          </p>
          <Badge variant="teal" className="mt-2">
            {level}
          </Badge>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {badges.map((b) => (
          <Badge key={b} variant="green">
            {b}
          </Badge>
        ))}
      </div>
      <div>
        <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-2">Skill signals</p>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <Badge key={s} variant="default">
              {s}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SkillsMappingTable ───────────────────────────────────────────────────────

type EscoRow = {
  evidence: string;
  signal: string;
  escoCategory: string;
  confidence: string;
};

const confidenceColor = (c: string) => {
  if (c === "High") return "text-emerald-700 bg-emerald-50";
  if (c === "Medium-high") return "text-teal-700 bg-teal-50";
  return "text-amber-700 bg-amber-50";
};

export function SkillsMappingTable({ rows }: { rows: EscoRow[] }) {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-[var(--line)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--bg)]">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
                Evidence
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide hidden sm:table-cell">
                Signal
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide hidden md:table-cell">
                ESCO-style Category
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-[var(--bg)] transition-colors">
                <td className="px-4 py-3 text-xs text-[var(--ink)] leading-relaxed max-w-xs">{row.evidence}</td>
                <td className="px-4 py-3 text-xs font-medium text-[var(--ink)] hidden sm:table-cell">
                  {row.signal}
                </td>
                <td className="px-4 py-3 text-xs text-[var(--ink-2)] hidden md:table-cell">{row.escoCategory}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${confidenceColor(row.confidence)}`}
                  >
                    {row.confidence}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[var(--ink-2)] leading-relaxed italic px-1">
        Prototype note: ESCO is used here as a recognised skills backbone for transferable skill signals. Local
        cultural categories are configured separately by country/community.
      </p>
    </div>
  );
}

// ─── FairWorkScoreBreakdown ───────────────────────────────────────────────────

type Breakdown = {
  payTransparency: number;
  localWageBenchmark: number;
  harmfulContentRisk: number;
  skillProgressionValue: number;
  consentDataClarity: number;
};

export function FairWorkScoreBreakdown({
  score,
  breakdown,
}: {
  score: number;
  breakdown: Breakdown;
}) {
  const items = [
    { label: "Pay transparency", value: breakdown.payTransparency, max: 25 },
    { label: "Local wage benchmark", value: breakdown.localWageBenchmark, max: 20 },
    { label: "Harmful-content risk", value: breakdown.harmfulContentRisk, max: 20 },
    { label: "Skill progression value", value: breakdown.skillProgressionValue, max: 20 },
    { label: "Consent / data clarity", value: breakdown.consentDataClarity, max: 15 },
  ];
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--ink)]">Fair Work Score</span>
        <span className="text-sm font-bold text-[var(--teal)]">{score}/100</span>
      </div>
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--ink-2)]">{item.label}</span>
            <span className="font-medium text-[var(--ink)]">
              {item.value}/{item.max}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--teal-light)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--teal)] transition-all"
              style={{ width: `${(item.value / item.max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

import type { Task } from "@/lib/tasks";

export function TaskCard({ task, showBreakdown = false }: { task: Task; showBreakdown?: boolean }) {
  const riskColor =
    task.risk === "Low"
      ? "green"
      : task.risk === "Medium"
      ? "amber"
      : ("red" as BadgeVariant);
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5 space-y-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="font-semibold text-[var(--ink)] leading-snug">{task.title}</h3>
          <p className="text-xs text-[var(--ink-2)] mt-0.5">{task.provider}</p>
        </div>
        <Badge variant={riskColor}>{task.risk} risk</Badge>
      </div>
      <p className="text-sm text-[var(--ink-2)] leading-relaxed">{task.description}</p>
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="font-semibold text-[var(--teal)]">{task.pay}</span>
        <span className="text-[var(--ink-2)]">· {task.estimatedTime}</span>
        <span className="text-[var(--ink-2)]">· {task.progression}</span>
      </div>
      {showBreakdown && (
        <div className="pt-2 border-t border-[var(--line)]">
          <FairWorkScoreBreakdown score={task.fairWorkScore} breakdown={task.breakdown} />
        </div>
      )}
      <Link
        href={`/tasks/${task.id}`}
        className="block w-full text-center rounded-lg bg-[var(--teal)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
      >
        Start Task
      </Link>
    </div>
  );
}

// ─── LabourMarketPanel ────────────────────────────────────────────────────────

export function LabourMarketPanel({ config }: { config: CountryConfig }) {
  const { labourSignals, country, region, wageBenchmark } = config;
  const items = [
    { label: "Youth NEET rate", value: labourSignals.youthNEET },
    { label: "Informal employment", value: labourSignals.informalEmployment },
    { label: "Youth unemployment", value: labourSignals.youthUnemployment },
    { label: "Employment-to-population", value: labourSignals.employmentToPopulation },
    { label: "Digital access signal", value: labourSignals.digitalAccessSignal },
    { label: "Wage benchmark", value: wageBenchmark },
  ];
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5 space-y-4">
      <div>
        <p className="section-label">ILOSTAT-style labour signals</p>
        <h3 className="font-semibold text-[var(--ink)] mt-0.5">
          {country} · {region}
        </h3>
        <p className="text-xs text-[var(--ink-2)]">Simulated pilot data</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl bg-[var(--bg)] p-3">
            <p className="text-xs text-[var(--ink-2)]">{item.label}</p>
            <p className="font-semibold text-sm text-[var(--ink)] mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ChallengeAlignment ───────────────────────────────────────────────────────

export function ChallengeAlignment() {
  const columns = [
    {
      title: "Broken Signals",
      body: "Local knowledge, language judgement, slang, culture, and lived experience rarely appear in formal credentials. LocalLens converts them into evidence-backed skill signals.",
    },
    {
      title: "AI Disruption",
      body: "AI is creating new demand for human evaluation, but access is uneven. LocalLens gives credential-invisible youth a proof-of-skill route into AI work.",
    },
    {
      title: "No Matching Infrastructure",
      body: "LocalLens connects verified local-context evaluators to fair AI data tasks while giving programme officers visibility into talent, training gaps, and fair-work outcomes.",
    },
  ];
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-6 space-y-5">
      <SectionHeading label="Challenge response" title="How LocalLens answers UNMAPPED" />
      <div className="grid sm:grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.title} className="rounded-xl bg-[var(--bg)] p-4 space-y-2">
            <h4 className="font-semibold text-sm text-[var(--ink)]">{col.title}</h4>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed">{col.body}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--ink-2)] italic border-t border-[var(--line)] pt-3">
        Prototype modules built: Skills Signal Engine + Opportunity Matching &amp; Econometric Dashboard.
      </p>
    </div>
  );
}

// ─── FairDataVision ───────────────────────────────────────────────────────────

export function FairDataVision() {
  const pillars = [
    "Fair Pay",
    "Fair Voice",
    "Fair Consent",
    "Fair Progression",
    "Fair Representation",
  ];
  return (
    <div className="rounded-2xl border border-[var(--teal)] bg-[var(--teal-light)] p-6 space-y-4">
      <SectionHeading label="Vision" title="Toward Fair Data" />
      <p className="text-sm text-[var(--ink-2)] leading-relaxed max-w-2xl">
        Fairtrade changed how companies think about sourcing coffee and cocoa. AI now needs the same conversation for
        data. LocalLens is a prototype for fair, community-verified AI data sourcing: people are paid for their local
        knowledge, tasks are screened for fairness, and every completed task becomes portable evidence of skill.
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        {pillars.map((p) => (
          <Badge key={p} variant="teal">
            {p}
          </Badge>
        ))}
      </div>
    </div>
  );
}
