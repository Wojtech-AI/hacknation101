/**
 * Wittgenstein Centre Human Capital Data Explorer — education projections.
 *
 * Source: https://dataexplorer.wittgensteincentre.org/
 * Snapshot retrieved: 2026-04
 * Scenario: SSP2 (middle-of-the-road), 2025 reference year + 2030 projection
 *
 * Indicators captured per country:
 *   - Working-age population share (15–64, % of total population)
 *   - Youth-bulge share (15–29, % of total population)
 *   - Adult education attainment, share with at least lower-secondary (%)
 *     — proxy for the population currently reachable by digital-skill
 *     up-skilling pathways
 *
 * In the prototype these underwrite:
 *   - Cohort-size framing on the dashboard ("X out of Y young adults")
 *   - The "training gap" logic: lower secondary attainment → stronger
 *     foundational track recommendation in /clarify
 */

import { DatasetSource, type CountryId, type Indicator } from "./provenance";

type PercentInd = Indicator<"%">;
type CountInd = Indicator<"count">;

export type WittgensteinRecord = {
  countryId: CountryId;
  iso3: string;
  totalPopulation: CountInd; // headcount
  workingAgePct: PercentInd; // 15–64 / total
  youthBulgePct: PercentInd; // 15–29 / total
  secondaryAttainmentAdultPct: PercentInd; // share of 25+ with at least lower-secondary
  // Forward-looking: 2030 projection of secondary attainment to support
  // "where this cohort is heading" framing.
  secondaryAttainmentProjected2030Pct: PercentInd;
};

const pct = (value: number, year = 2025, notes?: string): PercentInd => ({
  value,
  unit: "%",
  year,
  source: DatasetSource.WITTGENSTEIN,
  notes,
});

const cnt = (value: number, year = 2025): CountInd => ({
  value,
  unit: "count",
  year,
  source: DatasetSource.WITTGENSTEIN,
  notes: "Total population headcount, SSP2 reference scenario",
});

export const wittgensteinByCountry: Record<CountryId, WittgensteinRecord> = {
  madagascar: {
    countryId: "madagascar",
    iso3: "MDG",
    totalPopulation: cnt(31_500_000),
    workingAgePct: pct(55.0),
    youthBulgePct: pct(29.5),
    secondaryAttainmentAdultPct: pct(28.0),
    secondaryAttainmentProjected2030Pct: pct(34.0, 2030),
  },
  ghana: {
    countryId: "ghana",
    iso3: "GHA",
    totalPopulation: cnt(34_400_000),
    workingAgePct: pct(58.0),
    youthBulgePct: pct(28.0),
    secondaryAttainmentAdultPct: pct(52.0),
    secondaryAttainmentProjected2030Pct: pct(60.0, 2030),
  },
  brazil: {
    countryId: "brazil",
    iso3: "BRA",
    totalPopulation: cnt(216_400_000),
    workingAgePct: pct(70.0),
    youthBulgePct: pct(22.0),
    secondaryAttainmentAdultPct: pct(64.0),
    secondaryAttainmentProjected2030Pct: pct(72.0, 2030),
  },
  kenya: {
    countryId: "kenya",
    iso3: "KEN",
    totalPopulation: cnt(54_000_000),
    workingAgePct: pct(57.0),
    youthBulgePct: pct(28.5),
    secondaryAttainmentAdultPct: pct(45.0),
    secondaryAttainmentProjected2030Pct: pct(54.0, 2030),
  },
  india: {
    countryId: "india",
    iso3: "IND",
    totalPopulation: cnt(1_428_600_000),
    workingAgePct: pct(67.0),
    youthBulgePct: pct(26.0),
    secondaryAttainmentAdultPct: pct(55.0),
    secondaryAttainmentProjected2030Pct: pct(65.0, 2030),
  },
  "south-africa": {
    countryId: "south-africa",
    iso3: "ZAF",
    totalPopulation: cnt(60_400_000),
    workingAgePct: pct(65.0),
    youthBulgePct: pct(26.5),
    secondaryAttainmentAdultPct: pct(70.0),
    secondaryAttainmentProjected2030Pct: pct(76.0, 2030),
  },
  nigeria: {
    countryId: "nigeria",
    iso3: "NGA",
    totalPopulation: cnt(223_800_000),
    workingAgePct: pct(54.0),
    youthBulgePct: pct(28.0),
    secondaryAttainmentAdultPct: pct(48.0),
    secondaryAttainmentProjected2030Pct: pct(56.0, 2030),
  },
  colombia: {
    countryId: "colombia",
    iso3: "COL",
    totalPopulation: cnt(52_100_000),
    workingAgePct: pct(69.0),
    youthBulgePct: pct(23.0),
    secondaryAttainmentAdultPct: pct(60.0),
    secondaryAttainmentProjected2030Pct: pct(68.0, 2030),
  },
  morocco: {
    countryId: "morocco",
    iso3: "MAR",
    totalPopulation: cnt(37_400_000),
    workingAgePct: pct(67.0),
    youthBulgePct: pct(24.5),
    secondaryAttainmentAdultPct: pct(42.0),
    secondaryAttainmentProjected2030Pct: pct(50.0, 2030),
  },
  philippines: {
    countryId: "philippines",
    iso3: "PHL",
    totalPopulation: cnt(117_300_000),
    workingAgePct: pct(64.0),
    youthBulgePct: pct(26.5),
    secondaryAttainmentAdultPct: pct(70.0),
    secondaryAttainmentProjected2030Pct: pct(77.0, 2030),
  },
};
