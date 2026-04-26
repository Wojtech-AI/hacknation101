import { NextResponse } from "next/server";
import { ok, err } from "@/lib/types";
import type { Candidate, QuestionnaireData } from "@/lib/types";
import { getCountryConfig } from "@/lib/countryConfigs";
import {
  extractFromLegacy,
  extractFromStructured,
  type StructuredAnswers,
} from "@/lib/signalExtraction";
import { rankJobs } from "@/lib/matching";
import { JOBS } from "@/lib/mockData";
import type { SignalProfile } from "@/lib/signals";

/**
 * /api/questionnaire — Phase 0.2
 *
 * Accepts three shapes:
 *   1. New structured: { candidate, structuredAnswers: { ... } }
 *      → uses extractFromStructured (richer SignalProfile)
 *   2. Legacy textareas: { countryId, answers: { a1..a10 } }
 *      → uses extractFromLegacy
 *   3. Pre-built: { candidate, questionnaire: QuestionnaireData }
 *      → uses extractFromLegacy
 *
 * Always returns: { signalProfile, previewedReasons, followUpPrompt, ... }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = getCountryConfig(
      body.countryId ?? body.structuredAnswers?.countryId ?? body.country,
    );

    const candidate: Candidate = body.candidate ?? {
      id: body.candidateId ?? "guest",
      name: config.userName,
      email: "",
      country: config.country,
      languages: config.languages,
      educationLevel: "Unspecified",
      deviceAccess: "Smartphone",
      availability: "Part-time",
    };

    let signalProfile: SignalProfile;

    if (body.structuredAnswers) {
      const answers = body.structuredAnswers as StructuredAnswers;
      // Make sure countryId is always set on the structured payload.
      const safeAnswers: StructuredAnswers = {
        ...answers,
        countryId: answers.countryId ?? config.id,
      };
      signalProfile = extractFromStructured({
        candidate,
        answers: safeAnswers,
      });
    } else {
      const questionnaire: QuestionnaireData =
        body.questionnaire ??
        buildQuestionnaireFromLegacyAnswers(body.answers, candidate.id);
      signalProfile = extractFromLegacy({ candidate, questionnaire });
    }

    // Preview the top 3 explainable reasons across the matched jobs so
    // /clarify can render "we see..." narration grounded in the matcher.
    const ranking = rankJobs(signalProfile, 1, JOBS);
    const previewedReasons = ranking.matched
      .slice(0, 3)
      .flatMap((r) => r.matchReasons.slice(0, 1).map((m) => m.description));

    const followUpPrompt = `Based on your answer about ${config.localTopic}, what would make an AI response sound like it was written by an outsider?`;

    return NextResponse.json(
      ok({
        signalProfile,
        previewedReasons,
        followUpPrompt,
        country: config.country,
        localTopic: config.localTopic,
        source: signalProfile.source,
        note: "Prototype demo: SignalProfile derived from your answers and country context.",
      }),
    );
  } catch {
    return NextResponse.json(err("Failed to process questionnaire."), {
      status: 400,
    });
  }
}

function buildQuestionnaireFromLegacyAnswers(
  answers: Record<string, string> | undefined,
  candidateId: string,
): QuestionnaireData {
  const chipFromCsv = (s: string | undefined): string[] =>
    !s
      ? []
      : s
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

  return {
    candidateId,
    consentAccepted: true,
    hobbies: chipFromCsv(answers?.a5),
    informalWork: answers?.a3 ?? "",
    domainKnowledge: chipFromCsv(answers?.a5),
    writingComfort: 3,
    criticalThinkingSelfRating: 3,
    preferredTaskTypes: [],
  };
}
