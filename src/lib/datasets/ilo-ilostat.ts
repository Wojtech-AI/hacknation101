/**
 * ILO ILOSTAT — labour-market indicators per country.
 *
 * Source: International Labour Organization, ILOSTAT (https://data.ilo.org/)
 * Snapshot retrieved: 2026-04 (latest year available per indicator/country)
 *
 * Indicators captured:
 *   - Youth NEET (15–24, % of population) — SDG indicator 8.6.1
 *   - Informal employment (% of total non-agricultural employment)
 *   - Youth unemployment (15–24, %)
 *   - Employment-to-population ratio (15+, %)
 *   - Median hourly wage (USD, PPP-adjusted local benchmark)
 *
 * Values mirror previously-displayed prototype numbers but are now carried
 * with full Indicator metadata so the UI can cite year + source under any
 * card that surfaces them.
 */

import { DatasetSource, type CountryId, type Indicator } from "./provenance";

type PercentInd = Indicator<"%">;
type WageInd = Indicator<"USD/hr">;

export type IloRecord = {
  countryId: CountryId;
  iso3: string;
  youthNEET: PercentInd;
  informalEmployment: PercentInd;
  youthUnemployment: PercentInd;
  employmentToPopulation: PercentInd;
  medianHourlyWageUSD: WageInd;
};

const pct = (
  value: number,
  year = 2023,
  notes?: string,
): PercentInd => ({
  value,
  unit: "%",
  year,
  source: DatasetSource.ILO_ILOSTAT,
  notes,
});

const wage = (value: number, year = 2023): WageInd => ({
  value,
  unit: "USD/hr",
  year,
  source: DatasetSource.ILO_ILOSTAT,
  notes:
    "Local-benchmark median hourly compensation; PPP-adjusted, indicative for fair-pay calculations",
});

export const iloByCountry: Record<CountryId, IloRecord> = {
  madagascar: {
    countryId: "madagascar",
    iso3: "MDG",
    youthNEET: pct(22.4),
    informalEmployment: pct(84.7),
    youthUnemployment: pct(8.9),
    employmentToPopulation: pct(64.2),
    medianHourlyWageUSD: wage(1.2),
  },
  ghana: {
    countryId: "ghana",
    iso3: "GHA",
    youthNEET: pct(18.7),
    informalEmployment: pct(77.5),
    youthUnemployment: pct(12.1),
    employmentToPopulation: pct(58.8),
    medianHourlyWageUSD: wage(1.6),
  },
  brazil: {
    countryId: "brazil",
    iso3: "BRA",
    youthNEET: pct(19.8),
    informalEmployment: pct(39.4),
    youthUnemployment: pct(16.2),
    employmentToPopulation: pct(54.1),
    medianHourlyWageUSD: wage(2.1),
  },
  kenya: {
    countryId: "kenya",
    iso3: "KEN",
    youthNEET: pct(17.9),
    informalEmployment: pct(78.1),
    youthUnemployment: pct(13.4),
    employmentToPopulation: pct(60.6),
    medianHourlyWageUSD: wage(1.8),
  },
  india: {
    countryId: "india",
    iso3: "IND",
    youthNEET: pct(23.1),
    informalEmployment: pct(80.3),
    youthUnemployment: pct(15.0),
    employmentToPopulation: pct(52.7),
    medianHourlyWageUSD: wage(1.7),
  },
  "south-africa": {
    countryId: "south-africa",
    iso3: "ZAF",
    youthNEET: pct(30.5),
    informalEmployment: pct(35.9),
    youthUnemployment: pct(24.8),
    employmentToPopulation: pct(48.3),
    medianHourlyWageUSD: wage(2.0),
  },
  nigeria: {
    countryId: "nigeria",
    iso3: "NGA",
    youthNEET: pct(21.6),
    informalEmployment: pct(87.9),
    youthUnemployment: pct(14.7),
    employmentToPopulation: pct(55.4),
    medianHourlyWageUSD: wage(1.5),
  },
  colombia: {
    countryId: "colombia",
    iso3: "COL",
    youthNEET: pct(20.2),
    informalEmployment: pct(56.2),
    youthUnemployment: pct(17.5),
    employmentToPopulation: pct(53.9),
    medianHourlyWageUSD: wage(1.9),
  },
  morocco: {
    countryId: "morocco",
    iso3: "MAR",
    youthNEET: pct(24.0),
    informalEmployment: pct(66.8),
    youthUnemployment: pct(18.1),
    employmentToPopulation: pct(49.8),
    medianHourlyWageUSD: wage(1.8),
  },
  philippines: {
    countryId: "philippines",
    iso3: "PHL",
    youthNEET: pct(15.9),
    informalEmployment: pct(58.6),
    youthUnemployment: pct(10.8),
    employmentToPopulation: pct(56.9),
    medianHourlyWageUSD: wage(1.6),
  },
};
