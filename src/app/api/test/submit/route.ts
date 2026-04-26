import { NextResponse } from "next/server";
import { ok, err } from "@/lib/types";
import type { TestSubmission } from "@/lib/types";
import { calculateTestResult } from "@/lib/scoring";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const submission: TestSubmission = {
      candidateId: body.candidateId ?? "unknown",
      answers: body.answers ?? {},
      startTime: body.startTime ?? Date.now() - 5 * 60 * 1000,
      endTime: body.endTime ?? Date.now(),
    };
    const languages: string[] = body.languages ?? ["English"];
    const writingComfort: number = body.writingComfort ?? 3;
    const criticalThinkingSelfRating: number = body.criticalThinkingSelfRating ?? 3;

    const result = calculateTestResult(submission, languages, writingComfort, criticalThinkingSelfRating);

    return NextResponse.json(
      ok({
        candidateId: submission.candidateId,
        ...result,
        note: "Prototype demo: score calculated from real formula using your answers and questionnaire data.",
      })
    );
  } catch {
    return NextResponse.json(err("Failed to score test submission."), { status: 400 });
  }
}
