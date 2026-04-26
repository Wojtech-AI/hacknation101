import { JOBS } from "./mockData";
import type { Job } from "./types";

export type MatchedJob = Job & { locked: boolean };

export function matchJobs(candidateLevel: number, candidateLanguages: string[]): MatchedJob[] {
  const langSet = new Set(candidateLanguages.map((l) => l.toLowerCase()));

  const matched: MatchedJob[] = [];
  const locked: MatchedJob[] = [];

  for (const job of JOBS) {
    const levelOk = candidateLevel >= job.requiredLevel;
    const langOk =
      job.requiredLanguages.includes("Any") ||
      job.requiredLanguages.some((l) => langSet.has(l.toLowerCase()));

    if (levelOk && langOk) {
      matched.push({ ...job, locked: false });
    } else if (!levelOk && langOk) {
      // Candidate language matches but level is too low → show as locked
      locked.push({ ...job, locked: true });
    }
  }

  // Show up to 1 locked job to demonstrate progression
  const result = [...matched];
  if (locked.length > 0) {
    // Pick the one closest to the candidate's current level
    const closest = locked.sort((a, b) => a.requiredLevel - b.requiredLevel)[0];
    result.push(closest);
  }

  return result;
}
