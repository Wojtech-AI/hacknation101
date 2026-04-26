"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge, DisclaimerNote } from "@/components/ui";
import type { LeaderboardEntry } from "@/lib/types";
import { LEVEL_MAP } from "@/lib/scoring";

export default function LeaderboardPage() {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCandidates, setTotalCandidates] = useState(0);

  useEffect(() => {
    async function fetchLeaderboard() {
      const profileRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-profile") : null;
      const testRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-test-result") : null;
      const qaRaw = typeof window !== "undefined" ? window.localStorage.getItem("ltl-qa-result") : null;

      const profile = profileRaw ? JSON.parse(profileRaw) : {};
      const testResult = testRaw ? JSON.parse(testRaw) : null;
      const qaResult = qaRaw ? JSON.parse(qaRaw) : null;

      const payload = {
        name: profile.name ?? "You",
        country: profile.country ?? "—",
        readinessScore: testResult?.score ?? 0,
        approvedTasks: qaResult?.qaStatus === "approved" ? 1 : 0,
        earnings: qaResult?.payment ? `$${qaResult.payment.amount.toFixed(2)}` : "$0.00",
      };

      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setBoard(json.data.leaderboard);
        setTotalCandidates(json.data.totalCandidates);
      }
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  const currentUser = board.find((e) => e.isCurrentUser);

  function getLevelTitle(score: number): string {
    const entry = LEVEL_MAP.find((l) => score >= l.min && score <= l.max);
    return entry ? `L${entry.level} ${entry.title}` : "—";
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto pt-20 text-center space-y-3">
        <div className="inline-block w-8 h-8 border-2 border-[var(--teal)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--ink-2)]">Updating leaderboard…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-2">
        <p className="section-label">Step 08 · Leaderboard</p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
          Label-to-Ladder leaderboard
        </h1>
        <p className="text-sm text-[var(--ink-2)]">
          Rankings update based on readiness score, approved tasks, and simulated earnings. {totalCandidates} participants (simulated).
        </p>
      </section>

      {/* Current user highlight */}
      {currentUser && (
        <div className="rise rise-2 rounded-2xl border-2 border-[var(--teal)] bg-[var(--teal-light)] p-5 space-y-2">
          <p className="text-xs font-semibold text-[var(--teal-dark)] uppercase tracking-wide">Your position</p>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-black text-[var(--teal)]">#{currentUser.rank}</div>
            <div>
              <p className="font-bold text-[var(--ink)]">{currentUser.name}</p>
              <p className="text-xs text-[var(--ink-2)]">{currentUser.country}</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                <Badge variant="teal">Score: {currentUser.readinessScore}</Badge>
                <Badge variant="green">{currentUser.approvedTasks} task{currentUser.approvedTasks !== 1 ? "s" : ""} approved</Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full leaderboard */}
      <div className="rise rise-3 rounded-2xl border border-[var(--line)] bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--line)] bg-[var(--bg)]">
          <div className="grid grid-cols-[2rem_1fr_5rem_5rem_5rem] gap-2 text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
            <span>#</span>
            <span>Candidate</span>
            <span className="text-right">Score</span>
            <span className="text-right hidden sm:block">Tasks</span>
            <span className="text-right">Earned</span>
          </div>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {board.map((entry) => (
            <div
              key={entry.rank}
              className={`px-5 py-3 grid grid-cols-[2rem_1fr_5rem_5rem_5rem] gap-2 items-center transition-colors ${
                entry.isCurrentUser ? "bg-[var(--teal-light)]" : "hover:bg-[var(--bg)]"
              }`}
            >
              <span
                className={`text-sm font-bold ${
                  entry.rank === 1
                    ? "text-yellow-500"
                    : entry.rank === 2
                    ? "text-slate-400"
                    : entry.rank === 3
                    ? "text-amber-600"
                    : entry.isCurrentUser
                    ? "text-[var(--teal)]"
                    : "text-[var(--ink-2)]"
                }`}
              >
                {entry.rank}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-medium truncate ${entry.isCurrentUser ? "text-[var(--teal)]" : "text-[var(--ink)]"}`}>
                  {entry.name}
                  {entry.isCurrentUser && <span className="ml-1 text-xs text-[var(--teal)]">← you</span>}
                </p>
                <p className="text-xs text-[var(--ink-2)] truncate">
                  {entry.country} · {getLevelTitle(entry.readinessScore)}
                </p>
              </div>
              <p className="text-sm font-bold text-[var(--teal)] text-right">{entry.readinessScore}</p>
              <p className="text-sm text-[var(--ink-2)] text-right hidden sm:block">{entry.approvedTasks}</p>
              <p className="text-sm font-medium text-[var(--ink)] text-right">{entry.earnings}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Level map reference */}
      <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm space-y-3">
        <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">Level reference</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LEVEL_MAP.map((l) => (
            <div key={l.level} className="rounded-xl bg-[var(--bg)] px-3 py-2">
              <p className="text-xs font-bold text-[var(--teal)]">L{l.level}</p>
              <p className="text-xs text-[var(--ink)]">{l.title}</p>
              <p className="text-[10px] text-[var(--ink-2)]">{l.min}–{l.max} pts</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/annotation"
          className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
        >
          Do another task
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
        >
          Programme dashboard →
        </Link>
      </div>

      <DisclaimerNote
        text="Prototype demo: leaderboard rankings are simulated. Seeded participants are fictional. Earnings are not real payments."
      />
    </div>
  );
}
