"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressStepper, DisclaimerNote } from "@/components/ui";
import { countryConfigs, getCountryConfig } from "@/lib/countryConfigs";
import { useCountry } from "@/lib/useCountry";

type FormData = {
  name: string;
  country: string;
  region: string;
  languages: string;
  deviceAccess: string;
  consent: boolean;
};

const empty: FormData = {
  name: "",
  country: "madagascar",
  region: "",
  languages: "",
  deviceAccess: "",
  consent: false,
};

export default function OnboardingPage() {
  const { setCountryId } = useCountry();
  const router = useRouter();
  const [data, setData] = useState<FormData>(empty);
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof FormData, value: string | boolean) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function applySampleProfile() {
    const config = getCountryConfig(data.country);
    setData((prev) => ({
      ...prev,
      name: config.userName,
      region: config.region,
      languages: config.languages.join(", "),
      deviceAccess: "Smartphone",
      consent: true,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.consent) return;
    setSubmitting(true);
    setCountryId(data.country);

    const config = getCountryConfig(data.country);
    const ltlProfile = {
      id: `cand-${Date.now()}`,
      name: data.name || config.userName,
      email: "",
      country: config.country,
      languages: data.languages ? data.languages.split(",").map((l) => l.trim()).filter(Boolean) : config.languages,
      educationLevel: "Secondary",
      deviceAccess: data.deviceAccess || "Smartphone",
      availability: "Part-time",
    };

    // Write LTL profile to localStorage
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ltl-profile", JSON.stringify(ltlProfile));
    }

    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ltlProfile),
    });
    router.push("/questionnaire");
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent transition-all placeholder:text-[var(--ink-2)]/50";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Progress */}
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <ProgressStepper current={0} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-1">
          <p className="section-label">Step 01</p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">Your Profile</h1>
          <p className="text-sm text-[var(--ink-2)] leading-relaxed">
            Tell us a little about yourself so we can personalise the demo experience.
          </p>
        </section>

        <div className="rise rise-2 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-5">
          {/* Country selector */}
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-1.5">
              Demo country
            </label>
            <select
              value={data.country}
              onChange={(e) => set("country", e.target.value)}
              className={inputCls}
              required
            >
              {countryConfigs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your first name"
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-1.5">
              Region / community
            </label>
            <input
              type="text"
              value={data.region}
              onChange={(e) => set("region", e.target.value)}
              placeholder="e.g. Antananarivo, Accra North"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-1.5">
              Languages you speak
            </label>
            <input
              type="text"
              value={data.languages}
              onChange={(e) => set("languages", e.target.value)}
              placeholder="e.g. Malagasy, French"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-1.5">
              Device access
            </label>
            <select
              value={data.deviceAccess}
              onChange={(e) => set("deviceAccess", e.target.value)}
              className={inputCls}
            >
              <option value="">Select…</option>
              <option>Smartphone</option>
              <option>Smartphone + laptop</option>
              <option>Laptop only</option>
              <option>Shared device</option>
            </select>
          </div>

          {/* Sample profile button */}
          <button
            type="button"
            onClick={applySampleProfile}
            className="w-full rounded-xl border border-[var(--teal)] px-4 py-2 text-sm font-medium text-[var(--teal)] hover:bg-[var(--teal-light)] transition-colors"
          >
            Use sample profile for {getCountryConfig(data.country).country}
          </button>
        </div>

        {/* Consent */}
        <div className="rise rise-3 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">Consent</p>
          <p className="text-sm text-[var(--ink-2)] leading-relaxed">
            Your local knowledge is valuable. You choose what to share. Your answers are used to assess your
            suitability for AI evaluation tasks and build your Signal Profile. You can skip anything you do not
            want to answer. In this prototype, all data is simulated and stored locally.
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.consent}
              onChange={(e) => set("consent", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[var(--line)] accent-[var(--teal)]"
              required
            />
            <span className="text-sm text-[var(--ink)]">
              I understand and agree to continue with this prototype session.
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
          >
            Back
          </Link>
          <button
            type="submit"
            disabled={!data.consent || submitting}
            className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] disabled:opacity-40 transition-colors"
          >
            {submitting ? "Saving…" : "Continue to Questionnaire"}
          </button>
        </div>

        <DisclaimerNote />
      </form>
    </div>
  );
}
