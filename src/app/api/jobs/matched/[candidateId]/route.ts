import { NextResponse } from "next/server";
import { ok, err } from "@/lib/types";
import { matchJobs } from "@/lib/matching";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const level: number = body.level ?? 0;
    const languages: string[] = body.languages ?? ["English"];

    const jobs = matchJobs(level, languages);

    return NextResponse.json(
      ok({
        jobs,
        matchedCount: jobs.filter((j) => !j.locked).length,
        lockedCount: jobs.filter((j) => j.locked).length,
        note: "Prototype demo: job matching is based on your verified readiness level and language signals.",
      })
    );
  } catch {
    return NextResponse.json(err("Failed to match jobs."), { status: 400 });
  }
}
