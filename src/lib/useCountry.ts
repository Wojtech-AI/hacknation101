"use client";
import { useEffect, useState } from "react";
import { getCountryConfig, type CountryConfig } from "@/lib/countryConfigs";

const STORAGE_KEY = "locallens-country";
const DEFAULT_COUNTRY = "madagascar";

export function useCountry(): {
  countryId: string;
  config: CountryConfig;
  setCountryId: (id: string) => void;
  ready: boolean;
} {
  const [countryId, setCountryIdState] = useState<string>(DEFAULT_COUNTRY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function sync() {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setCountryIdState(stored ?? DEFAULT_COUNTRY);
    }
    sync();
    setReady(true);
    window.addEventListener("locallens-country-change", sync);
    return () => window.removeEventListener("locallens-country-change", sync);
  }, []);

  function setCountryId(id: string) {
    setCountryIdState(id);
    window.localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent("locallens-country-change"));
  }

  return { countryId, config: getCountryConfig(countryId), setCountryId, ready };
}

export function readStoredCountryId(): string {
  if (typeof window === "undefined") return DEFAULT_COUNTRY;
  return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_COUNTRY;
}
