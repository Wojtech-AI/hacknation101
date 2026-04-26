"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressStepper, DisclaimerNote } from "@/components/ui";
import LanguagePicker from "@/components/LanguagePicker";
import { countryConfigs } from "@/lib/countryConfigs";
import { useCountry } from "@/lib/useCountry";
import { useT } from "@/lib/LocaleProvider";

type FormData = {
  name: string;
  region: string;
  languages: string;
  deviceAccess: string;
  consent: boolean;
};

const empty: FormData = {
  name: "",
  region: "",
  languages: "",
  deviceAccess: "",
  consent: false,
};

export default function OnboardingPage() {
  const { countryId, config: activeConfig, setCountryId } = useCountry();
  const { t, locale } = useT();
  const router = useRouter();
  const [data, setData] = useState<FormData>(empty);
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof FormData, value: string | boolean) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function applySampleProfile() {
    setData((prev) => ({
      ...prev,
      name: activeConfig.userName,
      region: activeConfig.region,
      languages: activeConfig.languages.join(", "),
      deviceAccess: "Smartphone",
      consent: true,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.consent) return;
    setSubmitting(true);

    const config = activeConfig;
    const ltlProfile = {
      id: `cand-${Date.now()}`,
      name: data.name || config.userName,
      email: "",
      country: config.country,
      languages: data.languages
        ? data.languages.split(",").map((l) => l.trim()).filter(Boolean)
        : config.languages,
      preferredLanguage: locale,
      educationLevel: "Secondary",
      deviceAccess: data.deviceAccess || "Smartphone",
      availability: "Part-time",
    };

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
    <div className="mx-auto max-w-xl min-w-0 space-y-6">
      <div className="rise rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
        <ProgressStepper current={0} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rise rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-1">
          <p className="section-label">{t("ob.step")}</p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">{t("ob.title")}</h1>
          <p className="text-sm text-[var(--ink-2)] leading-relaxed">{t("ob.subtitle")}</p>
        </section>

        <div className="rise rise-2 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-1.5">
              {t("common.demoCountry")}
            </label>
            <select
              value={countryId}
              onChange={(e) => setCountryId(e.target.value)}
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

          {/* Preferred language — drives the entire UX language. */}
          <LanguagePicker />

          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-1.5">
              {t("ob.name")}
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={t("ob.namePh")}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-1.5">
              {t("ob.region")}
            </label>
            <input
              type="text"
              value={data.region}
              onChange={(e) => set("region", e.target.value)}
              placeholder={t("ob.regionPh")}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-1.5">
              {t("ob.languages")}
            </label>
            <input
              type="text"
              value={data.languages}
              onChange={(e) => set("languages", e.target.value)}
              placeholder={t("ob.languagesPh")}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide mb-1.5">
              {t("ob.deviceAccess")}
            </label>
            <select
              value={data.deviceAccess}
              onChange={(e) => set("deviceAccess", e.target.value)}
              className={inputCls}
            >
              <option value="">{t("ob.deviceSelect")}</option>
              <option>Smartphone</option>
              <option>Smartphone + laptop</option>
              <option>Laptop only</option>
              <option>Shared device</option>
            </select>
          </div>

          <button
            type="button"
            onClick={applySampleProfile}
            className="w-full rounded-xl border border-[var(--teal)] px-4 py-2 text-sm font-medium text-[var(--teal)] hover:bg-[var(--teal-light)] transition-colors"
          >
            {t("ob.useSample")} · {activeConfig.country}
          </button>
        </div>

        <div className="rise rise-3 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">{t("ob.consent")}</p>
          <p className="text-sm text-[var(--ink-2)] leading-relaxed">{t("ob.consentBody")}</p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.consent}
              onChange={(e) => set("consent", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[var(--line)] accent-[var(--teal)]"
              required
            />
            <span className="text-sm text-[var(--ink)]">{t("ob.consentAgree")}</span>
          </label>
        </div>

        <div className="flex gap-3">
          <Link
            href="/"
            className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-center text-sm font-medium text-[var(--ink)] hover:bg-[var(--bg)] transition-colors"
          >
            {t("common.back")}
          </Link>
          <button
            type="submit"
            disabled={!data.consent || submitting}
            className="flex-1 rounded-xl bg-[var(--teal)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--teal-dark)] disabled:opacity-40 transition-colors"
          >
            {submitting ? t("common.saving") : t("ob.continue")}
          </button>
        </div>

        <DisclaimerNote />
      </form>
    </div>
  );
}
