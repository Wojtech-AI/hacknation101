import { NextResponse } from "next/server";
import { ok, err } from "@/lib/types";
import type { PaymentRecord } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissionId, isCorrect, qualityScore, candidateId } = body;

    if (!submissionId) {
      return NextResponse.json(err("Missing submissionId."), { status: 400 });
    }

    const approved = isCorrect === true;
    const status: "approved" | "needs_review" = approved ? "approved" : "needs_review";

    let payment: PaymentRecord | null = null;
    if (approved) {
      // Simulated payment: $0.08 base + quality bonus
      const baseAmount = 0.08;
      const bonus = qualityScore >= 90 ? 0.03 : qualityScore >= 75 ? 0.01 : 0;
      payment = {
        submissionId,
        amount: parseFloat((baseAmount + bonus).toFixed(2)),
        currency: "USD (simulated)",
        status: "simulated",
      };
    }

    return NextResponse.json(
      ok({
        submissionId,
        candidateId,
        qaStatus: status,
        reviewerNote: approved
          ? "Strong cultural correction and clear explanation. Approved."
          : "Response needs additional detail or context. Please review and resubmit.",
        payment,
        note: "Prototype demo: QA review and payment are fully simulated.",
      })
    );
  } catch {
    return NextResponse.json(err("Failed to process QA review."), { status: 400 });
  }
}
