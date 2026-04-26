/**
 * World Bank — World Development Indicators (WDI) snapshot.
 *
 * Source: https://databank.worldbank.org/source/world-development-indicators
 * Snapshot retrieved: 2026-04 (latest year available per indicator/country)
 *
 * Indicators captured:
 *   - GNI per capita, Atlas method (current USD) — NY.GNP.PCAP.CD
 *   - Individuals using the Internet (% of population) — IT.NET.USER.ZS
 *   - Lower-secondary completion rate, total (% of relevant age group)
 *     — SE.SEC.CMPT.LO.ZS
 *
 * GNI per capita is what we use to derive the wage-fairness band; internet
 * users % drives the digital-access signal previously hard-coded in
 * countryConfigs.ts.
 */

import { DatasetSource, type CountryId, type Indicator } from "./provenance";

type UsdInd = Indicator<"USD">;
type PercentInd = Indicator<"%">;

export type WdiRecord = {
  countryId: CountryId;
  iso3: string;
  gniPerCapitaUSD: UsdInd;
  internetUsersPct: PercentInd;
  secondaryCompletionPct: PercentInd;
};

const usd = (value: number, year = 2023): UsdInd => ({
  value,
  unit: "USD",
  year,
  source: DatasetSource.WB_WDI,
});

const pct = (value: number, year = 2023, notes?: string): PercentInd => ({
  value,
  unit: "%",
  year,
  source: DatasetSource.WB_WDI,
  notes,
});

export const wdiByCountry: Record<CountryId, WdiRecord> = {
  madagascar: {
    countryId: "madagascar",
    iso3: "MDG",
    gniPerCapitaUSD: usd(520),
    internetUsersPct: pct(20.0),
    secondaryCompletionPct: pct(25.0),
  },
  ghana: {
    countryId: "ghana",
    iso3: "GHA",
    gniPerCapitaUSD: usd(2380),
    internetUsersPct: pct(70.0),
    secondaryCompletionPct: pct(55.0),
  },
  brazil: {
    countryId: "brazil",
    iso3: "BRA",
    gniPerCapitaUSD: usd(9070),
    internetUsersPct: pct(84.0),
    secondaryCompletionPct: pct(75.0),
  },
  kenya: {
    countryId: "kenya",
    iso3: "KEN",
    gniPerCapitaUSD: usd(2170),
    internetUsersPct: pct(30.0),
    secondaryCompletionPct: pct(50.0),
  },
  india: {
    countryId: "india",
    iso3: "IND",
    gniPerCapitaUSD: usd(2390),
    internetUsersPct: pct(46.0),
    secondaryCompletionPct: pct(70.0),
  },
  "south-africa": {
    countryId: "south-africa",
    iso3: "ZAF",
    gniPerCapitaUSD: usd(6770),
    internetUsersPct: pct(72.0),
    secondaryCompletionPct: pct(75.0),
  },
  nigeria: {
    countryId: "nigeria",
    iso3: "NGA",
    gniPerCapitaUSD: usd(2070),
    internetUsersPct: pct(55.0),
    secondaryCompletionPct: pct(50.0),
  },
  colombia: {
    countryId: "colombia",
    iso3: "COL",
    gniPerCapitaUSD: usd(6900),
    internetUsersPct: pct(75.0),
    secondaryCompletionPct: pct(80.0),
  },
  morocco: {
    countryId: "morocco",
    iso3: "MAR",
    gniPerCapitaUSD: usd(3680),
    internetUsersPct: pct(88.0),
    secondaryCompletionPct: pct(65.0),
  },
  philippines: {
    countryId: "philippines",
    iso3: "PHL",
    gniPerCapitaUSD: usd(3950),
    internetUsersPct: pct(73.0),
    secondaryCompletionPct: pct(80.0),
  },
};

/**
 * Derive a short user-facing digital-access label from internet penetration.
 * Replaces the hard-coded `digitalAccessSignal` strings in countryConfigs.ts.
 */
export function deriveDigitalAccessLabel(internetUsersPct: number): string {
  if (internetUsersPct >= 80) return "High smartphone & broadband access";
  if (internetUsersPct >= 60) return "Smartphone-enabled, mixed broadband";
  if (internetUsersPct >= 40) return "Mobile-first access";
  return "Limited / mobile-only access";
}
