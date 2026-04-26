"use client";

import { LOCALE_LIST } from "@/lib/i18n";
import { useT } from "@/lib/LocaleProvider";
import type { LocaleCode } from "@/lib/countryConfigs";

type Variant = "compact" | "labelled";

/**
 * LanguagePicker — flat, dynamic list of every supported language.
 *
 * The list is built from SUPPORTED_LOCALES (single source of truth); switching
 * is instant. Strings missing from our hand-written dictionaries are filled in
 * by the free MyMemory MT engine and cached in localStorage, so users always
 * see translated UI regardless of which language they pick.
 */
export default function LanguagePicker({
  variant = "labelled",
  showResetWhenManual = true,
}: {
  variant?: Variant;
  showResetWhenManual?: boolean;
}) {
  const { locale, setLocale, hasManualOverride, resetToCountry, t } = useT();

  const select = (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as LocaleCode)}
      aria-label={t("common.preferredLanguage")}
      className={
        variant === "compact"
          ? "text-xs font-medium border border-[var(--line)] rounded-lg px-2.5 py-1.5 bg-white text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent transition-all cursor-pointer max-w-[200px]"
          : "w-full rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent transition-all cursor-pointer"
      }
    >
      {LOCALE_LIST.map((l) => (
        <option key={l.code} value={l.code}>
          {l.flag} {l.nativeName}
          {l.nativeName !== l.name ? ` · ${l.name}` : ""}
        </option>
      ))}
    </select>
  );

  if (variant === "compact") return select;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-semibold text-[var(--ink-2)] uppercase tracking-wide">
          {t("common.preferredLanguage")}
        </label>
        {showResetWhenManual && hasManualOverride && (
          <button
            type="button"
            onClick={resetToCountry}
            className="text-xs font-medium text-[var(--teal)] hover:underline"
          >
            ↺ Match country
          </button>
        )}
      </div>
      {select}
      <p className="text-xs text-[var(--ink-2)] leading-relaxed">
        {t("common.preferredLanguageHint")}
      </p>
    </div>
  );
}
