"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ProgressStepper,
  DisclaimerNote,
  Badge,
  ScoreRing,
  SkillsMappingTable,
} from "@/components/ui";
import CountrySwitcher from "@/components/CountrySwitcher";
import { useCountry } from "@/lib/useCountry";
import { getEscoMappings, type EscoMapping } from "@/lib/escoMappings";

type SignalData = {
  score: number;
  readinessLevel: string;
  badges: string[];
  skills: string[];
  evidence: string[];
  nextStep: string;
  escoMappings: EscoMapping[];
};

const DEFAULT_DATA: SignalData = {
  score: 78,
  readinessLevel: "Level 2 — Local AI Evaluator",
  badges: ["Community-Verified", "ESCO-Mapped", "Fair Work Ready"],
  skills: [
    "Local-language judgement",
    "Cultural-context awareness",
    "Grammar and fluency correction",
    "AI-output evaluation readiness",
    "Fact-checking readiness",
    "Explanation quality",
  ],
  evidence: [
    "Corrected inaccurate AI answer about local topic",
    "Identified missing local or cultural context",
    "Rewrote response in locally accurate language",
  ],
  nextStep:
    "Start reviewed local-context AI evaluation tasks. Complete the fact-checking module to unlock Level 3 Cultural QA Reviewer.",
  escoMappings: [],
};

export default function SignalProfilePage() {
  const { config } = useCountry();
  const [signal, setSignal] = useState<SignalData>(DEFAULT_DATA);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("locallens-signal");
      if (stored) {
        try {
          setSignal(JSON.parse(stored));
        } catch {
          // ignore parse errors
        }
      }
    }
    // Always compute fresh ESCO mappings from current config
    setSignal((prev) => ({ ...prev, escoMappings: getEscoMappings(config) }));
  }, [config]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <ProgressStepper current={5} />
      </div>

      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="section-label">Step 04 · Signal Profile</p>
          <CountrySwitcher />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">Your Signal Profile</h1>
        <p className="text-sm text-[var(--ink-2)]">
          Based on your questionnaire and skill test — ESCO-mapped, community-verified.
        </p>
      </section>

      {/* Score card */}
      <div className="rise rise-2 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-5 flex-wrap">
          <ScoreRing score={signal.score} size={110} />
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-xs text-[var(--ink-2)] font-medium">Signal holder</p>
              <h2 className="text-xl font-bold text-[var(--ink)]">{config.userName}</h2>
              <p className="text-sm text-[var(--ink-2)]">
                {config.country} · {config.region}
              </p>
            </div>
            <Badge variant="teal">{signal.readinessLevel}</Badge>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-2">
            Earned badges
          </p>
          <div className="flex flex-wrap gap-1.5">
            {signal.badges.map((b) => (
              <Badge key={b} variant="green">
                {b}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
        <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">Skill signals</p>
        <div className="flex flex-wrap gap-1.5">
          {signal.skills.map((s) => (
            <Badge key={s} variant="default">
              {s}
            </Badge>
          ))}
        </div>
      </div>

      {/* Evidence */}
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
        <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">Evidence collected</p>
        <ul className="space-y-2">
          {signal.evidence.map((e) => (
            <li key={e} className="flex items-start gap-2 text-sm text-[var(--ink)]">
              <span className="text-[var(--teal)] mt-0.5">✓</span>
              {e}
            </li>
          ))}
        </ul>
      </div>

      {/* Next step */}
      <div className="rounded-xl border border-[var(--teal)] bg-[var(--teal-light)] p-4 space-y-1">
        <p className="text-xs font-semibold text-[var(--teal-dark)] uppercase tracking-wide">Next step</p>
        <p className="text-sm text-[var(--ink)] leading-relaxed">{signal.nextStep}</p>
      </div>

      {/* ESCO-style mapping */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-[var(--ink)]">ESCO-style skill mapping</h3>
        {signal.escoMappings.length > 0 ? (
          <SkillsMappingTable rows={signal.escoMappings} />
        ) : (
          <SkillsMappingTable rows={getEscoMappings(config)} />
        )}
      </div>

      <div className="flex gap-3">
        <Link
          href="/skill-test"
          className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
        >
          Back
        </Link>
        <Link
          href="/tasks"
          className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
        >
          View matched tasks →
        </Link>
      </div>

      <DisclaimerNote />
    </div>
  );
}
