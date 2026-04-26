import Link from "next/link";
import { SEEDED_LEADERBOARD } from "@/lib/mockData";
import { BrandMark } from "@/components/ui";

const languages = [
  "Malagasy", "Twi", "Yoruba", "Darija", "Tagalog",
  "Sheng", "Bahian Portuguese", "Paisa Spanish", "Nigerian Pidgin", "Taglish",
];

const ladder = [
  { level: 1, title: "Annotator", pay: "$5/hr", desc: "First tasks unlocked" },
  { level: 2, title: "Output Rater", pay: "$7/hr", desc: "Quality rating work" },
  { level: 3, title: "Reviewer", pay: "$9/hr", desc: "Fact-checking tasks" },
  { level: 4, title: "QA Specialist", pay: "$12/hr", desc: "Calibrate other annotators" },
  { level: 5, title: "Domain Trainer", pay: "$16/hr", desc: "Train AI on your expertise" },
  { level: 6, title: "Team Lead", pay: "$22/hr", desc: "Lead review teams" },
];

const steps = [
  {
    num: "01",
    title: "Profile & questionnaire",
    body: "Save your country and languages, then answer the local-context questionnaire.",
    time: "3 min",
  },
  {
    num: "02",
    title: "Probe & AI summary",
    body: "Short evidence tasks refine your rubric; an AI summary previews your signals before the test.",
    time: "5 min",
  },
  {
    num: "03",
    title: "Micro-skill test",
    body: "Six scored questions unlock your Skills Passport and inferred ESCO clusters.",
    time: "8 min",
  },
  {
    num: "04",
    title: "Jobs, tasks & leaderboard",
    body: "See matched work, complete a cultural annotation, and track progression on the leaderboard.",
    time: "ongoing",
  },
];

const criteria = [
  { icon: "🌍", title: "You speak it", text: "A language or dialect underrepresented in AI" },
  { icon: "🔍", title: "You spot it", text: "When something AI says about your community is wrong" },
  { icon: "📱", title: "You have a phone", text: "And a few hours a week to spare" },
  { icon: "✌️", title: "No CV needed", text: "No degree. No tech experience. No interview." },
];

export default function LandingPage() {
  return (
    <div className="space-y-6">

      {/* ── HERO ─────────────────────────────────────────────── */}
      {/*
        a11y: hero must stay visually dark (forest #0D2B27) so white headline copy
        keeps a 15:1 contrast against the background. We set the colour both as a
        Tailwind arbitrary class AND as an inline style — defence in depth in case
        the CSS-variable cascade ever falters (Tailwind v4 layer ordering, CSP, etc.).
      */}
      <section
        className="rise relative overflow-hidden rounded-[2rem] bg-[#0d2b27]"
        style={{ background: "#0d2b27" }}
      >

        {/* radial atmospherics — softened so the forest stays unambiguously dark */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(75, 157, 145, 0.18), transparent 75%), radial-gradient(ellipse 40% 60% at 0% 100%, rgba(168, 198, 74, 0.10), transparent 70%)",
        }} />

        {/*
          Scattered language ghosts — pushed to the top and bottom edges only so
          they never sit behind the headline (was overlapping at 27%/46%/65%
          vertical, which fragmented every word in the H1).
        */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
          {languages.slice(0, 8).map((lang, i) => {
            const isTop = i % 2 === 0;
            const top = isTop ? 4 + (i % 3) * 3 : 88 + (i % 3) * 3;
            const left = (i * 19 + 6) % 88;
            return (
              <span
                key={lang}
                className="absolute text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                style={{
                  opacity: 0.16,
                  color: "var(--sea)",
                  border: "1px solid rgba(75, 157, 145, 0.22)",
                  top: `${top}%`,
                  left: `${left}%`,
                  transform: `rotate(${(i % 3 - 1) * 5}deg)`,
                }}
              >
                {lang}
              </span>
            );
          })}
        </div>

        <div className="relative px-6 sm:px-10 py-20 sm:py-28 max-w-3xl mx-auto text-center">

          {/* Pitch */}
          <div className="space-y-6">
            {/*
              a11y: pill text now uses cream (~15:1 on forest) instead of lime
              (which fails AA at ~4.3:1 over the lime-tinted background).
              Lime is preserved as the pulsing dot for brand emphasis.
            */}
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm"
              style={{
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "rgba(168, 198, 74, 0.40)",
                color: "var(--cream)",
                background: "rgba(168, 198, 74, 0.14)",
              }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--lime)" }} />
              Open pilot · 10 countries · 21 languages
            </div>

            <div className="flex justify-center">
              <BrandMark size={48} />
            </div>

            <h1 className="text-4xl sm:text-[3.6rem] lg:text-[4.4rem] font-extrabold tracking-tight leading-[0.98] text-white">
              Make your language<br />
              skills <span style={{ color: "var(--lime)" }}>visible</span><br className="hidden sm:block" />
              <span style={{ color: "var(--sea)" }}>and valuable.</span>
            </h1>

            <p className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
              style={{ color: "rgba(243, 241, 233, 0.95)" }}>
              AI gets local language, slang, and culture wrong every day.<br className="hidden sm:block" />
              <strong style={{ color: "#fff" }}>You can spot it. We pay you for that skill.</strong>
            </p>

            <div className="flex flex-col items-center justify-center gap-3 pt-2">
              <Link
                href="/onboarding"
                className="w-full max-w-sm rounded-xl px-7 py-3.5 text-center text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_0_4px_rgba(168,198,74,0.20)] sm:w-auto"
                style={{ background: "var(--teal)" }}
              >
                Begin the journey →
              </Link>
              <p className="max-w-sm text-center text-xs leading-relaxed" style={{ color: "rgba(243, 241, 233, 0.82)" }}>
                Profile → questionnaire → probe → test → passport → matched jobs. About ten minutes to your first task view.
              </p>
            </div>

            <p className="text-xs flex items-center gap-4 justify-center" style={{ color: "rgba(243, 241, 233, 0.85)" }}>
              <span>✓ No CV</span>
              <span>✓ No degree</span>
              <span>✓ No experience</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── LANGUAGE STRIP ──────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 justify-center px-2" aria-label="Supported languages">
        {languages.map((lang) => (
          <span key={lang} className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-medium text-[var(--ink-2)]">
            {lang}
          </span>
        ))}
        <span className="rounded-full bg-[var(--teal)] px-3 py-1 text-xs font-bold text-white">+ many more</span>
      </div>

      {/* ── THE LADDER (the moment of awe) ───────────────────── */}
      <section className="space-y-6 pt-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="section-label">The progression ladder</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--ink)] tracking-tight leading-tight">
            Start where you are.<br />
            <span style={{ color: "var(--teal)" }}>Climb as far as you can.</span>
          </h2>
          <p className="text-sm text-[var(--ink-2)] leading-relaxed">
            Every approved task moves you up a real, measurable ladder — with rising pay at every rung.
          </p>
        </div>

        {/* horizontal ladder, scrollable on small screens */}
        <div className="relative">
          {/* connecting line */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 mx-12" style={{ background: "linear-gradient(to right, var(--teal-light), var(--teal))" }} />

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 relative">
            {ladder.map((rung, i) => {
              const intensity = (i + 1) / ladder.length;
              return (
                <div
                  key={rung.level}
                  className="rise rounded-2xl border border-[var(--line)] bg-white p-4 space-y-2 hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white mx-auto"
                    style={{
                      background: `var(--teal)`,
                      opacity: 0.4 + intensity * 0.6,
                      transform: `scale(${0.85 + intensity * 0.25})`,
                    }}
                  >
                    L{rung.level}
                  </div>
                  <p className="text-xs font-semibold text-[var(--ink)] text-center leading-snug">{rung.title}</p>
                  <p className="text-lg font-extrabold text-[var(--teal)] text-center">{rung.pay}</p>
                  <p className="text-[10px] text-[var(--ink-2)] text-center leading-snug">{rung.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[11px] text-[var(--ink-2)] italic">
          Hourly equivalents are simulated demo figures based on fair-pay benchmarks.
        </p>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="rounded-2xl bg-[var(--bg)] border border-[var(--line)] p-7 sm:p-10 space-y-6">
        <div className="text-center max-w-md mx-auto space-y-1.5">
          <p className="section-label">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            From sign-up to first paid task in <span style={{ color: "var(--teal)" }}>10 minutes</span>.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="rise relative min-w-0 space-y-3 rounded-2xl border border-[var(--line)] bg-white p-5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-2">
                <span className="text-2xl font-mono font-extrabold" style={{ color: "var(--teal)", opacity: 0.25 }}>
                  {s.num}
                </span>
                <span className="shrink-0 rounded-full bg-[var(--teal-light)] px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--teal-dark)]">
                  {s.time}
                </span>
              </div>
              <h3 className="text-base font-bold leading-snug text-[var(--ink)] break-words">{s.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--ink-2)] break-words">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE LEADERBOARD PREVIEW ────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div className="space-y-1">
            <p className="section-label">Real annotators · real progress</p>
            <h2 className="text-2xl font-extrabold text-[var(--ink)] tracking-tight">
              You&apos;d be in good company.
            </h2>
          </div>
          <Link href="/leaderboard" className="text-xs font-semibold text-[var(--teal)] hover:underline">
            View full leaderboard →
          </Link>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-white shadow-sm overflow-hidden divide-y divide-[var(--line)]">
          {SEEDED_LEADERBOARD.slice(0, 4).map((entry) => (
            <div key={entry.rank} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--bg)] transition-colors">
              {/* a11y: AA-safe medal colours (see /leaderboard rationale). */}
              <span className={`text-base font-extrabold w-6 ${
                entry.rank === 1 ? "text-yellow-600" : entry.rank === 2 ? "text-slate-500" : entry.rank === 3 ? "text-amber-700" : "text-[var(--ink-2)]"
              }`}>
                #{entry.rank}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--ink)] truncate">{entry.name}</p>
                <p className="text-xs text-[var(--ink-2)]">{entry.country}</p>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <div className="w-20 h-1.5 rounded-full bg-[var(--teal-light)] overflow-hidden">
                    <div className="h-full bg-[var(--teal)]" style={{ width: `${entry.readinessScore}%` }} />
                  </div>
                  <span className="text-xs font-bold text-[var(--teal)] w-7 text-right">{entry.readinessScore}</span>
                </div>
              </div>
              <span className="text-sm font-bold text-[var(--ink)] w-16 text-right">{entry.earnings}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[var(--ink-2)] text-center italic">
          Names and earnings simulated for the prototype demo.
        </p>
      </section>

      {/* ── WHO CAN APPLY ────────────────────────────────────── */}
      <section className="rounded-2xl border border-[var(--line)] bg-white p-7 sm:p-10 space-y-6">
        <div className="text-center max-w-md mx-auto space-y-1.5">
          <p className="section-label">Who this is for</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--ink)] tracking-tight">
            If this sounds like you,<br />
            <span style={{ color: "var(--teal)" }}>you&apos;re ready.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {criteria.map((c, i) => (
            <div
              key={c.title}
              className="rise rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 flex items-start gap-3.5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-2xl shrink-0" aria-hidden>{c.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--ink)]">{c.title}</p>
                <p className="text-xs text-[var(--ink-2)] leading-relaxed mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      {/* a11y: literal #0d2b27 + Tailwind class as defence in depth (see hero). */}
      <section
        className="relative overflow-hidden rounded-[2rem] p-10 sm:p-14 text-center space-y-5 bg-[#0d2b27]"
        style={{ background: "#0d2b27" }}
      >

        <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
          background:
            "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(75, 157, 145, 0.22), transparent 75%), radial-gradient(ellipse 30% 50% at 0% 0%, rgba(168, 198, 74, 0.10), transparent 65%)",
        }} />

        <div className="relative space-y-5 max-w-md mx-auto">
          <BrandMark size={40} className="mx-auto" />

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Your local knowledge<br />
            <span style={{ color: "var(--lime)" }}>is worth something.</span>
          </h2>

          <p className="text-sm leading-relaxed" style={{ color: "rgba(243, 241, 233, 0.92)" }}>
            AI learns <em>about</em> communities. Unmapped Voices helps it learn <em>with</em> them — and pays the people who make that possible.
          </p>

          <Link
            href="/onboarding"
            className="inline-block rounded-xl px-10 py-4 text-base font-bold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_0_4px_rgba(168,198,74,0.20)]"
            style={{ background: "var(--teal)" }}
          >
            Start your first task →
          </Link>

          <p className="text-[11px]" style={{ color: "rgba(243, 241, 233, 0.75)" }}>
            Takes 10 minutes · Always free · You keep what you earn
          </p>
        </div>
      </section>

      {/* ── Footer links ─────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/sources"
          className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-center text-xs font-medium text-[var(--ink-2)] transition-colors hover:bg-[var(--bg)]"
        >
          Data sources &amp; methodology →
        </Link>
        <Link
          href="/pitch"
          className="rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-center text-xs font-medium text-[var(--ink-2)] transition-colors hover:bg-[var(--bg)]"
        >
          For judges &amp; evaluators →
        </Link>
      </div>

      <p className="pb-4 text-center text-[10px] leading-relaxed text-[var(--ink-2)]">
        Prototype demo — partner names, payments, task volumes, and labour-market figures are simulated for demonstration purposes.
      </p>
    </div>
  );
}
