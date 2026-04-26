import Link from "next/link";

const steps = [
  {
    num: "1",
    title: "Tell us what you know",
    body: "Answer 10 quick questions about your language, community, and local life. No CV needed.",
  },
  {
    num: "2",
    title: "Take a short skill test",
    body: "Six questions. Eight minutes. Prove you can spot when AI gets your community wrong.",
  },
  {
    num: "3",
    title: "Get matched to paid work",
    body: "Earn by reviewing AI answers about your culture, language, and everyday life.",
  },
];


export default function LandingPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-10">

      {/* ── Hero ── */}
      <section className="rise rounded-[2rem] border border-[var(--line)] bg-white px-8 py-14 text-center space-y-5">
        <p className="section-label">LocalLens · AI data work for real communities</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--ink)] leading-tight">
          Get paid to teach AI<br />about your community.
        </h1>
        <p className="text-base text-[var(--ink-2)] max-w-md mx-auto leading-relaxed">
          AI systems get local language, culture, and everyday life wrong — a lot.
          You can spot it. We pay for that skill.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/onboarding"
            className="w-full sm:w-auto rounded-xl bg-[var(--teal)] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors shadow-sm"
          >
            Start — takes 10 minutes
          </Link>
          <Link
            href="/test"
            className="w-full sm:w-auto rounded-xl border border-[var(--line)] bg-white px-8 py-3.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
          >
            Try the skill test first
          </Link>
        </div>
        <p className="text-xs text-[var(--ink-2)]">No CV. No degree. No experience required.</p>
      </section>

      {/* ── How it works ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--ink)] text-center">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className="rise rounded-2xl border border-[var(--line)] bg-white p-5 space-y-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--teal-light)] text-sm font-bold text-[var(--teal)]">
                {s.num}
              </div>
              <h3 className="font-semibold text-[var(--ink)] text-sm">{s.title}</h3>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who is this for ── */}
      <section className="rounded-2xl border border-[var(--line)] bg-white p-6 space-y-4">
        <h2 className="text-base font-semibold text-[var(--ink)]">Who can apply?</h2>
        <ul className="space-y-2">
          {[
            "You speak a language or dialect that is underrepresented in AI systems.",
            "You know when something AI says about your community sounds wrong.",
            "You have a smartphone and can spare a few hours a week.",
            "You do not need a degree, CV, or prior tech experience.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--ink)]">
              <span className="mt-0.5 text-[var(--teal)] shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="rounded-2xl border-2 border-[var(--teal)] bg-[var(--teal-light)] p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-[var(--ink)]">
          Your local knowledge is worth something.
        </h2>
        <p className="text-sm text-[var(--ink-2)] max-w-sm mx-auto leading-relaxed">
          AI learns about communities. LocalLens helps it learn <em>with</em> them — and pays the people who make that possible.
        </p>
        <Link
          href="/onboarding"
          className="inline-block rounded-xl bg-[var(--teal)] px-8 py-3 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] transition-colors"
        >
          Get started — free →
        </Link>
      </section>

      {/* ── For judges / programme officers ── */}
      <div className="flex flex-col sm:flex-row gap-3 text-center">
        <Link
          href="/dashboard"
          className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-xs font-medium text-[var(--ink-2)] hover:bg-[var(--bg)] transition-colors"
        >
          Programme dashboard →
        </Link>
        <Link
          href="/pitch"
          className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-xs font-medium text-[var(--ink-2)] hover:bg-[var(--bg)] transition-colors"
        >
          For judges / evaluators →
        </Link>
      </div>

      <p className="text-center text-[10px] text-[var(--ink-2)] pb-4">
        Prototype demo — partner names, payments, task volumes, and dashboard figures are simulated for demonstration purposes.
      </p>
    </div>
  );
}
