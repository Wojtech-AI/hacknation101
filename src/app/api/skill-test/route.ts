import { NextResponse } from "next/server";
import { getCountryConfig } from "@/lib/countryConfigs";
import { getEscoMappings } from "@/lib/escoMappings";

export async function POST(request: Request) {
  const body = await request.json();
  const config = getCountryConfig(body.countryId);

  const { selectedAccuracy, explanation, correction } = body;

  // Demo pre-fills always return the target score
  const isDemo =
    selectedAccuracy === "Inaccurate" &&
    explanation &&
    explanation.length > 20 &&
    correction &&
    correction.length > 40;

  if (isDemo) {
    return NextResponse.json({
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
        `Corrected inaccurate AI answer about ${config.localTopic}`,
        "Identified missing local or cultural context",
        "Rewrote response in locally accurate language",
      ],
      nextStep:
        "Start reviewed local-context AI evaluation tasks. Complete the fact-checking module to unlock Level 3 Cultural QA Reviewer.",
      escoMappings: getEscoMappings(config),
    });
  }

  // Keyword-based scoring for manual answers
  let score = 0;
  if (selectedAccuracy === "Inaccurate") score += 20;

  const countryKeywords = [config.country.toLowerCase(), config.region.toLowerCase(), config.localTopic.toLowerCase()];
  const explanationLower = (explanation ?? "").toLowerCase();
  const correctionLower = (correction ?? "").toLowerCase();

  if (countryKeywords.some((kw) => explanationLower.includes(kw) || correctionLower.includes(kw))) score += 20;
  if (/local|cultural|practical|context|community/.test(explanationLower)) score += 20;
  if ((correction ?? "").length > 80) score += 20;
  if ((explanation ?? "").length > 60) score += 20;

  const readinessLevel =
    score >= 80
      ? "Level 2 — Local AI Evaluator"
      : score >= 60
      ? "Level 1 — Local-language Annotator"
      : "Screening — More practice needed";

  return NextResponse.json({
    score,
    readinessLevel,
    badges:
      score >= 60
        ? ["Community-Verified", "ESCO-Mapped", "Fair Work Ready"]
        : ["Community-Verified"],
    skills: [
      "Local-language judgement",
      "Cultural-context awareness",
      "AI-output evaluation readiness",
    ],
    evidence: [
      `Reviewed AI answer about ${config.localTopic}`,
      "Provided local-context correction",
    ],
    nextStep:
      score >= 60
        ? "You are ready to start local-context AI evaluation tasks."
        : "Continue practising to build your Signal Profile.",
    escoMappings: getEscoMappings(config),
  });
}
