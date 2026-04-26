"use client";
import { ChallengeAlignment, FairDataVision, LabourMarketPanel, DisclaimerNote, Badge } from "@/components/ui";
import CountrySwitcher from "@/components/CountrySwitcher";
import { useCountry } from "@/lib/useCountry";

export default function DashboardPage() {
  const { config } = useCountry();
  const d = config.dashboard;

  const pipeline = [
    { label: "Users screened", value: d.usersScreened },
    { label: "Level 1 ready", value: d.level1Ready },
    { label: "Level 2 ready", value: d.level2Ready },
    { label: "Level 3 ready", value: d.level3Ready },
    { label: "Reviewer candidates", value: d.reviewerCandidates },
    { label: "Progressing users", value: d.progressingUsers },
  ];

  const dataOutput = [
    { label: "AI corrections logged", value: d.corrections.toLocaleString() },
    { label: "Avg task quality", value: d.avgTaskQuality },
    { label: "Avg Fair Work Score", value: d.avgFairWorkScore },
    { label: "Tasks below threshold", value: d.tasksBelowThreshold },
    { label: "Harmful content flagged", value: d.harmfulContentFlagged },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-label">Programme officer view</p>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">Programme Dashboard</h1>
          </div>
          <CountrySwitcher />
        </div>
        <p className="text-sm text-[var(--ink-2)]">
          Country Configurable · ILOSTAT-style labour signals · Simulated Pilot Data
        </p>
      </section>

      {/* A. Country configuration */}
      <section className="rise rise-2 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
        <p className="section-label">A · Country configuration</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-[var(--bg)] p-3">
            <p className="text-xs text-[var(--ink-2)]">Country</p>
            <p className="font-semibold text-sm text-[var(--ink)]">{config.country}</p>
          </div>
          <div className="rounded-xl bg-[var(--bg)] p-3">
            <p className="text-xs text-[var(--ink-2)]">Pilot region</p>
            <p className="font-semibold text-sm text-[var(--ink)]">{config.region}</p>
          </div>
          <div className="rounded-xl bg-[var(--bg)] p-3">
            <p className="text-xs text-[var(--ink-2)]">Wage benchmark</p>
            <p className="font-semibold text-sm text-[var(--ink)]">{config.wageBenchmark}</p>
          </div>
          <div className="rounded-xl bg-[var(--bg)] p-3 sm:col-span-2">
            <p className="text-xs text-[var(--ink-2)]">Languages</p>
            <p className="font-semibold text-sm text-[var(--ink)]">{config.languages.join(", ")}</p>
          </div>
          <div className="rounded-xl bg-[var(--bg)] p-3">
            <p className="text-xs text-[var(--ink-2)]">Most common skill</p>
            <p className="font-semibold text-sm text-[var(--ink)]">{d.mostCommonSkill}</p>
          </div>
        </div>
      </section>

      {/* B. Labour market context */}
      <section>
        <p className="section-label mb-2">B · Labour market context</p>
        <LabourMarketPanel config={config} />
      </section>

      {/* C. Talent pipeline */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
        <p className="section-label">C · Talent pipeline</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {pipeline.map((item) => (
            <div key={item.label} className="rounded-xl bg-[var(--bg)] p-3 text-center">
              <p className="text-2xl font-bold text-[var(--teal)]">{item.value.toLocaleString()}</p>
              <p className="text-xs text-[var(--ink-2)] mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* D. Community-verified data output */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
        <p className="section-label">D · Community-verified data output</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {dataOutput.map((item) => (
            <div key={item.label} className="rounded-xl bg-[var(--bg)] p-3 text-center">
              <p className="text-2xl font-bold text-[var(--teal)]">{item.value}</p>
              <p className="text-xs text-[var(--ink-2)] mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* E. Fair work monitoring */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
        <p className="section-label">E · Fair work monitoring</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-[var(--bg)] p-3 space-y-1">
            <p className="text-xs text-[var(--ink-2)]">Top community domains</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {d.topDomains.map((dom) => (
                <Badge key={dom} variant="default">
                  {dom}
                </Badge>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-[var(--bg)] p-3 space-y-1">
            <p className="text-xs text-[var(--ink-2)]">Top training gap</p>
            <p className="font-semibold text-sm text-[var(--ink)]">{d.topTrainingGap}</p>
          </div>
        </div>
      </section>

      {/* F. Key insights */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
        <p className="section-label">F · Key insights</p>
        <ul className="space-y-2">
          {d.insights.map((insight) => (
            <li key={insight} className="flex items-start gap-2 text-sm text-[var(--ink)]">
              <span className="text-[var(--teal)] mt-0.5 shrink-0">→</span>
              {insight}
            </li>
          ))}
        </ul>
      </section>

      <ChallengeAlignment />
      <FairDataVision />
      <DisclaimerNote />
    </div>
  );
}
