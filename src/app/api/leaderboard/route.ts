import { NextResponse } from "next/server";
import { ok } from "@/lib/types";
import { SEEDED_LEADERBOARD } from "@/lib/mockData";
import type { LeaderboardEntry } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, country, readinessScore, approvedTasks = 1, earnings = "$0.11" } = body;

    const board: LeaderboardEntry[] = SEEDED_LEADERBOARD.map((e) => ({ ...e }));

    // Insert current user at correct rank position
    const userEntry: LeaderboardEntry = {
      rank: 0,
      name: name ?? "You",
      country: country ?? "—",
      readinessScore: readinessScore ?? 0,
      approvedTasks,
      earnings,
      isCurrentUser: true,
    };

    board.push(userEntry);
    board.sort((a, b) => b.readinessScore - a.readinessScore || b.approvedTasks - a.approvedTasks);
    board.forEach((e, i) => { e.rank = i + 1; });

    return NextResponse.json(ok({ leaderboard: board, totalCandidates: board.length }));
  } catch {
    return NextResponse.json(ok({ leaderboard: SEEDED_LEADERBOARD, totalCandidates: SEEDED_LEADERBOARD.length }));
  }
}

export async function GET() {
  const board: LeaderboardEntry[] = SEEDED_LEADERBOARD.map((e, i) => ({ ...e, rank: i + 1 }));
  return NextResponse.json(ok({ leaderboard: board, totalCandidates: board.length }));
}
