import { NextResponse } from "next/server";
import { ok, err } from "@/lib/types";
import type { AnnotationResult } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, accuracyJudgement, qualityRating, improvement } = body;

    if (!candidateId || !accuracyJudgement) {
      return NextResponse.json(err("Missing required annotation fields."), { status: 400 });
    }

    // Quality scoring: improvement explanation adds points
    const hasImprovement = improvement && improvement.trim().length > 15;
    const ratingScore = Number(qualityRating) || 3;
    const qualityScore = Math.min(Math.round((ratingScore / 5) * 70 + (hasImprovement ? 25 : 5)), 100);

    // Auto-approve if quality is sufficient
    const isCorrect = ratingScore >= 2 && qualityScore >= 50;
    const status: "approved" | "needs_review" = isCorrect ? "approved" : "needs_review";

    const submissionId = `sub-${candidateId}-${Date.now()}`;

    const result: AnnotationResult = { submissionId, isCorrect, qualityScore, status };

    return NextResponse.json(
      ok({
        ...result,
        note: "Prototype demo: QA is automatically applied based on quality score.",
      })
    );
  } catch {
    return NextResponse.json(err("Failed to submit annotation."), { status: 400 });
  }
}
