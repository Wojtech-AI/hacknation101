/**
 * autoTranslate — free, no-key runtime machine translation.
 *
 * Acts as a Weglot-style fallback: when a translation key is missing for the
 * user's locale, we asynchronously fetch it from the free MyMemory MT API
 * (https://mymemory.translated.net/doc/spec.php), cache it forever in
 * localStorage, and notify subscribers so the UI re-renders.
 *
 * Why MyMemory and not LibreTranslate?
 *   - LibreTranslate's public instances rate-limit aggressively and the
 *     bundled Argos models don't cover Yoruba / Zulu / Xhosa / Kannada / etc.
 *   - MyMemory is free, no signup, no API key, and supports every language
 *     in our 21-locale demo dataset.
 *   - It pivots through Google Translate + human contributions under the hood.
 *
 * Cache strategy:
 *   - In-memory map keyed by `${locale}::${translationKey}` (instant on rerender)
 *   - Persisted to localStorage so subsequent sessions are zero-latency
 *   - Inflight dedupe so concurrent requests for the same key collapse
 *   - Concurrency cap of 4 so first-time locale switches don't fire 50+
 *     parallel requests (which MyMemory would throttle).
 */

import type { LocaleCode } from "./countryConfigs";

const STORAGE_KEY = "ll-mt-cache";
const ENDPOINT = "https://api.mymemory.translated.net/get";

// Map our internal locale codes -> ISO codes accepted by MyMemory.
// Dialects pivot to their parent language so MyMemory can produce something.
const MT_CODE: Record<LocaleCode, string | null> = {
  en: "en",
  fr: "fr",
  pt: "pt-BR",
  es: "es",
  sw: "sw",
  mg: "mg",
  tw: "ak", // Twi falls under Akan
  gaa: null, // Ga has no MT model — pure dictionary fallback
  hi: "hi",
  kn: "kn",
  zu: "zu",
  xh: "xh",
  yo: "yo",
  ar: "ar",
  tl: "tl",
  // Dialects -> parent language MT code
  bahian: "pt-BR",
  paisa: "es",
  sheng: "sw",
  darija: "ar",
  taglish: "tl",
  pcm: null, // Nigerian Pidgin -> English fallback (no MT model)
};

type Cache = Record<string, string>;
let mem: Cache | null = null;
const inflight = new Map<string, Promise<string | null>>();
const subscribers = new Set<() => void>();

function ensureLoaded(): Cache {
  if (mem) return mem;
  if (typeof window === "undefined") {
    mem = {};
    return mem;
  }
  try {
    mem = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Cache;
  } catch {
    mem = {};
  }
  return mem;
}

function persist() {
  if (typeof window === "undefined" || !mem) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mem));
  } catch {
    // Quota exceeded or storage disabled — ignore.
  }
}

export function getCachedAutoTranslation(
  locale: LocaleCode,
  translationKey: string,
): string | undefined {
  return ensureLoaded()[`${locale}::${translationKey}`];
}

export function subscribeToAutoTranslations(fn: () => void): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

function notify() {
  subscribers.forEach((fn) => {
    try {
      fn();
    } catch {
      // Subscriber threw — ignore so others still run.
    }
  });
}

// ─── Concurrency-limited fetch queue ────────────────────────────────────────

const MAX_CONCURRENT = 4;
let active = 0;
const waiters: Array<() => void> = [];

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => waiters.push(resolve));
  }
  active++;
  try {
    return await fn();
  } finally {
    active--;
    waiters.shift()?.();
  }
}

// ─── MyMemory request ───────────────────────────────────────────────────────

type MyMemoryResponse = {
  responseData?: { translatedText?: string; match?: number };
  responseStatus?: number;
  matches?: Array<{ translation?: string; quality?: string | number; match?: number }>;
};

async function callMyMemory(
  text: string,
  targetMtCode: string,
): Promise<string | null> {
  const url = `${ENDPOINT}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent("en|" + targetMtCode)}&de=hackathon@locallens.demo`;
  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) return null;
    const json = (await res.json()) as MyMemoryResponse;
    const translated = json?.responseData?.translatedText?.trim();
    // MyMemory returns warnings inline (e.g. "PLEASE SELECT…", "MYMEMORY WARNING…")
    if (
      typeof translated === "string" &&
      translated.length > 0 &&
      !/^(PLEASE|MYMEMORY|INVALID|YOU )/i.test(translated)
    ) {
      return translated;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Translate `sourceText` (in English) into `locale` and return it.
 * Caches results forever; on cache hit returns synchronously via getCached.
 * Fire-and-forget callers can ignore the returned promise — when it resolves,
 * subscribers are notified so consumers can re-render.
 */
export function requestAutoTranslation(
  locale: LocaleCode,
  translationKey: string,
  sourceText: string,
): Promise<string | null> | null {
  if (typeof window === "undefined") return null;
  if (!sourceText) return null;

  const target = MT_CODE[locale];
  if (!target || target === "en") return null;

  const cacheKey = `${locale}::${translationKey}`;
  const cache = ensureLoaded();
  if (cache[cacheKey]) return Promise.resolve(cache[cacheKey]);
  if (inflight.has(cacheKey)) return inflight.get(cacheKey)!;

  const promise = withSlot(async () => {
    const translated = await callMyMemory(sourceText, target);
    if (translated) {
      cache[cacheKey] = translated;
      persist();
      notify();
    }
    return translated;
  }).finally(() => {
    inflight.delete(cacheKey);
  });

  inflight.set(cacheKey, promise);
  return promise;
}

/**
 * Optional helper: clear all auto-translation cache entries (e.g., for QA).
 */
export function clearAutoTranslationCache() {
  mem = {};
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  notify();
}
