"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge, DisclaimerNote, ProgressStepper } from "@/components/ui";

type ClarifyData = {
  name: string;
  country: string;
  detectedSkills: string[];
  recommendedAreas: string[];
  clarificationMessage: string;
  estimatedTestMinutes: number;
};

export default function ClarifyPage() {
  const router = useRouter();
  const [data, setData] = useState<ClarifyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClarification() {
      const profileRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-profile") : null;
      const questionnaireRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-questionnaire") : null;

      const profile = profileRaw ? JSON.parse(profileRaw) : {};
      const questionnaire = questionnaireRaw ? JSON.parse(questionnaireRaw) : {};

      // Fall back to country-config data if no profile is set
      const payload = {
        name: profile.name ?? questionnaire.name ?? "Candidate",
        country: profile.country ?? "Unknown",
        languages: profile.languages ?? [],
        domainKnowledge: questionnaire.domainKnowledge ?? [],
        hobbies: questionnaire.hobbies ?? [],
        informalWork: questionnaire.informalWork ?? "",
      };

      const res = await fetch("/api/ai/clarify-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("ltl-clarify", JSON.stringify(json.data));
        }
      }
      setLoading(false);
    }
    fetchClarification();
  }, []);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto pt-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-2 border-[var(--teal)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--ink-2)]">Analysing your profile…</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto min-w-0 space-y-6">
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <ProgressStepper current={3} />
      </div>
      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-2">
        <p className="section-label">Step 04 · AI profile clarification</p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
          Skills detected from your profile
        </h1>
        <p className="text-sm text-[var(--ink-2)] leading-relaxed">
          Based on your profile and questionnaire, the system has identified your initial skill signals. The
          micro-skill test below will verify them and generate your Skills Passport.
        </p>
      </section>

      {/* Clarification message */}
      {data && (
        <>
          <div className="rise rise-2 rounded-xl border border-[var(--teal)] bg-[var(--teal-light)] p-5 space-y-2">
            <p className="text-xs font-semibold text-[var(--teal-dark)] uppercase tracking-wide">
              AI analysis — {data.name} · {data.country}
            </p>
            <p className="text-sm text-[var(--ink)] leading-relaxed">{data.clarificationMessage}</p>
          </div>

          {/* Detected skills */}
          <div className="rise rise-3 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
              Detected skill signals
            </p>
            <ul className="space-y-2">
              {data.detectedSkills.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-[var(--ink)]">
                  <span className="text-[var(--teal)] mt-0.5 shrink-0">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended test areas */}
          <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
              Your test will cover
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.recommendedAreas.map((area) => (
                <Badge key={area} variant="default">
                  {area}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-[var(--ink-2)]">
              Estimated time: {data.estimatedTestMinutes} minutes · 6 questions
            </p>
          </div>

          {/* Narrative */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
            <p className="text-xs text-[var(--ink-2)] leading-relaxed italic">
              Unmapped Voices turns hidden human judgement into verified skill evidence and uses that evidence to
              unlock ethical AI data work.
            </p>
          </div>
        </>
      )}

      <div className="flex gap-3">
        <Link
          href="/questionnaire"
          className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
        >
          Back
        </Link>
        <button
          onClick={() => router.push("/test")}
          className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
        >
          Take the micro-skill test →
        </button>
      </div>

      <DisclaimerNote />
    </div>
  );
}
