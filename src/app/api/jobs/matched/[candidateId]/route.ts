import { NextResponse } from "next/server";
import { ok, err } from "@/lib/types";
import { matchJobs, rankJobs } from "@/lib/matching";
import { JOBS } from "@/lib/mockData";
import { synthesizePartialSignal } from "@/lib/signalExtraction";
import type { SignalProfile } from "@/lib/signals";
import type { CountryId } from "@/lib/datasets";

/**
 * /api/jobs/matched/[candidateId] — Phase 0.1
 *
 * Backwards-compatible:
 *   - Legacy callers pass { level, languages } and receive `jobs` (a
 *     flat MatchedJob[]). /jobs/page.tsx and /lib/passport.ts still work.
 *
 * Forwards-compatible:
 *   - Callers can additionally pass { signalProfile, level } to get a
 *     `ranked: { matched, locked }` payload with explainable
 *     match/mismatch reasons. Phase 0.4's /jobs rewrite reads this.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const level: number = body.level ?? 0;
    const languages: string[] = body.languages ?? ["English"];
    const countryId: CountryId | undefined = body.countryId;

    const signals: SignalProfile =
      body.signalProfile ??
      synthesizePartialSignal({ languages, countryId });

    const ranked = rankJobs(signals, level, JOBS);

    // Legacy flat list for unmigrated UI (/jobs/page.tsx today).
    const jobs = matchJobs(level, languages, countryId);

    return NextResponse.json(
      ok({
        jobs,
        matchedCount: ranked.matched.length,
        lockedCount: ranked.locked.length,
        ranked: {
          matched: ranked.matched,
          // Phase 0.4: surface up to 8 locked jobs in the "Next steps" rail
          // so the demo always has progression options visible.
          locked: ranked.locked.slice(0, 8),
        },
        note: "Prototype demo: ranking grounded in ESCO skill clusters, ILO ISCO-08 occupation codes, and CEFR language proficiency.",
      }),
    );
  } catch {
    return NextResponse.json(err("Failed to match jobs."), { status: 400 });
  }
}
