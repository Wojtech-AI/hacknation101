/**
 * World Bank Human Capital Index (HCI) snapshot.
 *
 * Source: https://humancapital.worldbank.org/en/indicator/WB_HCP_HCI
 * Snapshot retrieved: 2026-04 (HCI 2020 release; latest comparable cohort)
 *
 * The HCI is a composite (0–1) measure of the productivity of a child born
 * today as a future worker, given local risks of poor health and education.
 *
 * In the prototype it serves two roles:
 *   1. A baseline confidence floor — high-HCI countries get a small uplift
 *      to recommended starting level on the Skills Passport.
 *   2. Sanity-check on training-gap surfacing (low-HCI countries warrant
 *      stronger emphasis on foundational digital skills).
 */

import { DatasetSource, type CountryId, type Indicator } from "./provenance";

type ScoreInd = Indicator<"score">;

export type HciRecord = {
  countryId: CountryId;
  iso3: string;
  hciScore: ScoreInd; // 0–1 composite
};

const score = (value: number, year = 2020): ScoreInd => ({
  value,
  unit: "score",
  year,
  source: DatasetSource.WB_HCI,
  notes:
    "Composite 0–1; productivity of a child born today as a future worker. WB HCI 2020 release.",
});

export const hciByCountry: Record<CountryId, HciRecord> = {
  madagascar: { countryId: "madagascar", iso3: "MDG", hciScore: score(0.39) },
  ghana: { countryId: "ghana", iso3: "GHA", hciScore: score(0.45) },
  brazil: { countryId: "brazil", iso3: "BRA", hciScore: score(0.6) },
  kenya: { countryId: "kenya", iso3: "KEN", hciScore: score(0.55) },
  india: { countryId: "india", iso3: "IND", hciScore: score(0.49) },
  "south-africa": { countryId: "south-africa", iso3: "ZAF", hciScore: score(0.43) },
  nigeria: { countryId: "nigeria", iso3: "NGA", hciScore: score(0.36) },
  colombia: { countryId: "colombia", iso3: "COL", hciScore: score(0.6) },
  morocco: { countryId: "morocco", iso3: "MAR", hciScore: score(0.5) },
  philippines: { countryId: "philippines", iso3: "PHL", hciScore: score(0.52) },
};
