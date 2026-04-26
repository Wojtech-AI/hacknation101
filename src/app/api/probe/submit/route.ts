import { NextResponse } from "next/server";
import { ok, err } from "@/lib/types";
import { scoreProbe, type ProbeSubmission } from "@/lib/probe";

/**
 * POST /api/probe/submit
 *
 * Body: ProbeSubmission { candidateId, answers[], totalDurationMs }
 * Returns: ProbeResult { rubric, items[], evidencedSkills[], summary }
 *
 * The client merges the returned rubric into its persisted SignalProfile
 * (localStorage key `ll-signal-profile`) so the next /jobs ranking call
 * receives the structured + probe combination, unlocking the
 * `evidence-bonus` reason in the matcher.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProbeSubmission;
    if (!body || !Array.isArray(body.answers)) {
      return NextResponse.json(err("Invalid probe submission."), {
        status: 400,
      });
    }

    const result = scoreProbe(body);
    return NextResponse.json(ok(result));
  } catch {
    return NextResponse.json(err("Failed to score probe."), { status: 400 });
  }
}
