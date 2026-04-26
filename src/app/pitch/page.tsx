"use client";
import Link from "next/link";
import { Badge, ChallengeAlignment, FairDataVision, DisclaimerNote } from "@/components/ui";
import CountrySwitcher from "@/components/CountrySwitcher";

const problem = [
  "800M+ young people in the Global South are digitally reachable but credential-invisible.",
  "AI systems trained without their input reflect and reinforce cultural blind spots.",
  "The growing AI evaluation economy is inaccessible to those with the most relevant local knowledge.",
];

const solution = [
  "A 10-question local-context questionnaire captures language, culture, and lived experience.",
  "A micro skill test generates an ESCO-mapped Signal Profile as portable proof of skill.",
  "A Fair Work Task Hub matches users to screened, transparent AI evaluation tasks.",
  "A programme dashboard gives officers ILOSTAT-style labour signals and fair-work monitoring.",
];

const whyNow = [
  "AI training data demand is growing — human evaluation is now a labour-market category.",
  "ESCO and ILOSTAT frameworks offer credible scaffolding for emerging skill recognition.",
  "Mobile-first access in LMIC countries makes digital work reachable at community scale.",
];

const whyWins = [
  "No API keys, no databases — runs entirely in-browser as a clickable proof of concept.",
  "10 country configs with ILOSTAT-style signals demonstrate real scalability.",
  "Fairtrade-style ethics built into the product from day one.",
  "Judges can click through the full journey: onboard → test → profile → task → dashboard.",
];

const modules = [
  "Landing page with pillar overview",
  "Onboarding with 10-country sample profiles",
  "i18n questionnaire (EN / FR / PT / ES / SW)",
  "Micro skill test with keyword scoring",
  "ESCO-mapped Signal Profile",
  "Fair Work Task Hub with score breakdowns",
  "Task activity + submission",
  "Results + progression ladder",
  "Programme officer dashboard (country-configurable)",
  "Judge summary page (this page)",
];

export default function PitchPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <section className="rise rounded-[2rem] border border-[var(--line)] bg-white p-8 shadow-sm space-y-4 text-center">
        <div className="flex justify-center">
          <CountrySwitcher />
        </div>
        <Badge variant="teal">UNMAPPED Challenge · Judge Summary</Badge>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--ink)] leading-tight">
          LocalLens
        </h1>
        <p className="text-xl font-semibold text-[var(--teal)]">
          Turning local knowledge into fair AI work
        </p>
        <p className="text-sm text-[var(--ink-2)] max-w-xl mx-auto leading-relaxed">
          Community-verified AI data, proof-of-skill screening, and fair pathways into the AI economy.
        </p>
        <Link
          href="/onboarding"
          className="inline-block rounded-xl bg-[var(--teal)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
        >
          Start the full demo journey →
        </Link>
      </section>

      {/* The Problem */}
      <Section title="The Problem" label="01">
        <ul className="space-y-2">
          {problem.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-[var(--ink)] leading-relaxed">
              <span className="text-red-400 mt-0.5 shrink-0">×</span>
              {p}
            </li>
          ))}
        </ul>
      </Section>

      {/* The Solution */}
      <Section title="The Solution" label="02">
        <ul className="space-y-2">
          {solution.map((s) => (
            <li key={s} className="flex items-start gap-2 text-sm text-[var(--ink)] leading-relaxed">
              <span className="text-[var(--teal)] mt-0.5 shrink-0">✓</span>
              {s}
            </li>
          ))}
        </ul>
      </Section>

      {/* Why Now */}
      <Section title="Why Now" label="03">
        <ul className="space-y-2">
          {whyNow.map((w) => (
            <li key={w} className="flex items-start gap-2 text-sm text-[var(--ink)] leading-relaxed">
              <span className="text-amber-500 mt-0.5 shrink-0">→</span>
              {w}
            </li>
          ))}
        </ul>
      </Section>

      {/* Why It Wins */}
      <Section title="Why It Wins" label="04">
        <ul className="space-y-2">
          {whyWins.map((w) => (
            <li key={w} className="flex items-start gap-2 text-sm text-[var(--ink)] leading-relaxed">
              <span className="text-[var(--teal)] mt-0.5 shrink-0">★</span>
              {w}
            </li>
          ))}
        </ul>
      </Section>

      {/* Built Modules */}
      <Section title="Built Modules" label="05">
        <div className="grid sm:grid-cols-2 gap-2">
          {modules.map((m) => (
            <div
              key={m}
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-xs text-[var(--ink)] flex items-center gap-2"
            >
              <span className="text-[var(--teal)]">✓</span>
              {m}
            </div>
          ))}
        </div>
      </Section>

      <ChallengeAlignment />
      <FairDataVision />

      {/* Final line */}
      <div className="rounded-2xl border-2 border-[var(--teal)] bg-[var(--teal-light)] p-8 text-center space-y-3">
        <p className="text-xs font-semibold text-[var(--teal-dark)] uppercase tracking-widest">Core message</p>
        <p className="text-2xl font-bold text-[var(--ink)] leading-snug max-w-md mx-auto">
          AI should not just learn about communities.
          <br />
          It should learn <em>with</em> them.
        </p>
      </div>

      <DisclaimerNote />
    </div>
  );
}

function Section({
  title,
  label,
  children,
}: {
  title: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-4">
      <div>
        <p className="section-label">{label}</p>
        <h2 className="text-xl font-bold text-[var(--ink)]">{title}</h2>
      </div>
      {children}
    </section>
  );
}
