"use client";
import { useCountry } from "@/lib/useCountry";
import { countryConfigs } from "@/lib/countryConfigs";

export default function CountrySwitcher() {
  const { countryId, setCountryId, ready } = useCountry();

  if (!ready) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-[var(--ink-2)] shrink-0">Demo country:</span>
      <select
        value={countryId}
        onChange={(e) => setCountryId(e.target.value)}
        className="text-xs font-medium border border-[var(--line)] rounded-lg px-2.5 py-1.5 bg-white text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:border-transparent transition-all cursor-pointer"
        aria-label="Select demo country"
      >
        {countryConfigs.map((c) => (
          <option key={c.id} value={c.id}>
            {c.country} ({c.region})
          </option>
        ))}
      </select>
    </div>
  );
}
