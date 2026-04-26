import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    accepted: true,
    qualityScore: "92%",
    paymentEarned: "$2.40",
    progress: "3/10 tasks toward Level 3 Cultural QA Reviewer",
    feedback:
      "Strong cultural correction and clear explanation. To improve, add one trusted source or local reference next time.",
    note: "Prototype demo: payment figures are simulated for demonstration purposes.",
  });
}
