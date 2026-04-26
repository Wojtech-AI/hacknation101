"use client";

/**
 * LocaleProvider — runtime, library-free i18n for the App Router.
 *
 * Pattern (validated against 2026 Next.js best practice):
 *   - React Context holds the active locale.
 *   - `setLocale(...)` writes to localStorage and broadcasts a custom event.
 *   - Other tabs / sibling hooks listen for the event and re-sync.
 *   - Country selection seeds the locale only when no manual override exists,
 *     so the user's choice always wins.
 *
 * Why no library:
 *   - next-intl & next-i18next would require restructuring the whole app under
 *     /[locale]/... segments. For a hackathon prototype we just need a Context
 *     + a flat dictionary; switching is instant, no page reload, no URL change.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isSupportedLocale,
  translate,
  type TranslationKey,
} from "./i18n";
import type { LocaleCode } from "./countryConfigs";
import { getCountryConfig } from "./countryConfigs";
import {
  getCachedAutoTranslation,
  requestAutoTranslation,
  subscribeToAutoTranslations,
} from "./autoTranslate";

const LOCALE_STORAGE_KEY = "ll-locale";
const COUNTRY_STORAGE_KEY = "locallens-country";
const COUNTRY_EVENT = "locallens-country-change";
const LOCALE_EVENT = "ll-locale-change";

type LocaleContextValue = {
  locale: LocaleCode;
  /** True when the user has manually picked a language (overrides country). */
  hasManualOverride: boolean;
  setLocale: (locale: LocaleCode) => void;
  /** Clears manual override; locale will follow the active country again. */
  resetToCountry: () => void;
  /** Translate a key. */
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readManualOverride(): LocaleCode | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isSupportedLocale(v) ? v : null;
}

/** Returns the country's uiLocale only if a country has been explicitly chosen. */
function readCountryLocale(): LocaleCode | null {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(COUNTRY_STORAGE_KEY);
  if (!id) return null;
  return getCountryConfig(id).uiLocale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("en");
  const [hasManualOverride, setHasManualOverride] = useState(false);
  // Bumped whenever a new auto-translation arrives, so memoised consumers
  // re-render and pick up the freshly cached string.
  const [autoTick, setAutoTick] = useState(0);

  useEffect(() => {
    const unsub = subscribeToAutoTranslations(() => setAutoTick((n) => n + 1));
    return unsub;
  }, []);

  // Derive effective locale from storage on mount + on country/locale events.
  useEffect(() => {
    function syncFromStorage() {
      const manual = readManualOverride();
      if (manual) {
        setLocaleState(manual);
        setHasManualOverride(true);
        return;
      }
      const fromCountry = readCountryLocale();
      setLocaleState(fromCountry ?? "en");
      setHasManualOverride(false);
    }
    syncFromStorage();
    window.addEventListener(COUNTRY_EVENT, syncFromStorage);
    window.addEventListener(LOCALE_EVENT, syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener(COUNTRY_EVENT, syncFromStorage);
      window.removeEventListener(LOCALE_EVENT, syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const setLocale = useCallback((next: LocaleCode) => {
    if (!isSupportedLocale(next)) return;
    setLocaleState(next);
    setHasManualOverride(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
      window.dispatchEvent(new CustomEvent(LOCALE_EVENT));
    }
  }, []);

  const resetToCountry = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LOCALE_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(LOCALE_EVENT));
    }
    setHasManualOverride(false);
    setLocaleState(readCountryLocale() ?? "en");
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      hasManualOverride,
      setLocale,
      resetToCountry,
      t: (key) => translate(locale, key),
    }),
    // `autoTick` is intentionally part of the dep list so consumers re-render
    // when MyMemory results land — even though `t` doesn't read it directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, hasManualOverride, setLocale, resetToCountry, autoTick],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useT(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Safe fallback so accidental use outside provider doesn't crash the demo.
    return {
      locale: "en",
      hasManualOverride: false,
      setLocale: () => {},
      resetToCountry: () => {},
      t: (k) => translate("en", k),
    };
  }
  return ctx;
}

// ─── useAutoT — translate ANY English string at runtime ─────────────────────
//
// The dictionary-based `t()` only handles typed `TranslationKey` entries. Many
// surfaces in the prototype render English strings that live OUTSIDE the
// dictionary — country-pack chip labels, probe prompts, test questions, job
// titles & descriptions, match-reason copy, ESCO labels, etc. Without this
// hook, those strings stay in English even when the user picks a non-English
// locale, which the user (correctly) flagged as broken behaviour.
//
// `useAutoT()` returns a function `tr(text, stableKey?)` that:
//   • returns `text` synchronously when locale === "en" (no work)
//   • returns the cached MT translation if present
//   • else fires off an MT request (concurrency-capped, deduped) and returns
//     `text` optimistically; the component re-renders when the cache lands,
//     because LocaleProvider already subscribes to `subscribeToAutoTranslations`
//     and bumps `autoTick` into the context value
//
// Stable key strategy:
//   • Callers can pass an explicit `stableKey` to share cache entries across
//     surfaces (e.g. the same chip rendered in two places).
//   • If omitted, we hash the English text so each unique string still gets a
//     deterministic, collision-resistant cache slot.
function djb2(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h * 33) ^ s.charCodeAt(i)) & 0xffffffff;
  }
  return (h >>> 0).toString(36);
}

export function useAutoT(): (text: string | null | undefined, stableKey?: string) => string {
  const { locale } = useT();
  return useCallback(
    (text: string | null | undefined, stableKey?: string): string => {
      if (!text) return "";
      if (locale === "en") return text;
      const key = stableKey ?? `auto::${djb2(text)}`;
      const cached = getCachedAutoTranslation(locale, key);
      if (cached) return cached;
      // Fire-and-forget — the LocaleProvider tick will re-render when it lands.
      requestAutoTranslation(locale, key, text);
      return text;
    },
    [locale],
  );
}
