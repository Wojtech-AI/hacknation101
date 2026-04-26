import { NextResponse } from "next/server";
import { ok } from "@/lib/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params;

  return NextResponse.json(
    ok({
      candidateId,
      totalEarned: "$0.11",
      currency: "USD (simulated)",
      payments: [
        {
          submissionId: `sub-${candidateId}-demo`,
          amount: 0.08,
          bonus: 0.03,
          task: "AI Response Rating",
          status: "simulated",
          date: new Date().toISOString(),
        },
      ],
      note: "Prototype demo: all payment figures are simulated and do not represent real money.",
    })
  );
}
