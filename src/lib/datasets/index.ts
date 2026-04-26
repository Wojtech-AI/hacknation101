/**
 * Datasets — public surface.
 *
 * Re-exports every snapshot file plus a small set of getter helpers that
 * the rest of the codebase should prefer over reaching into individual
 * dataset files. Centralising access here means future moves (e.g. a live
 * /api/datasets/[source] route) only need to swap implementations once.
 */

export * from "./provenance";
export * from "./ilo-ilostat";
export * from "./wb-wdi";
export * from "./wb-hci";
export * from "./wittgenstein";
export * from "./isco08";
export * from "./esco-skills";

import { iloByCountry, type IloRecord } from "./ilo-ilostat";
import {
  wdiByCountry,
  deriveDigitalAccessLabel,
  type WdiRecord,
} from "./wb-wdi";
import { hciByCountry, type HciRecord } from "./wb-hci";
import { wittgensteinByCountry, type WittgensteinRecord } from "./wittgenstein";
import {
  cite,
  DatasetSource,
  SOURCE_META,
  type CountryId,
  type Indicator,
} from "./provenance";

/**
 * CountryDatasetBundle — everything a country-aware page might need from
 * the dataset layer in a single typed shape. Pages should treat this as
 * read-only.
 */
export type CountryDatasetBundle = {
  ilo: IloRecord;
  wdi: WdiRecord;
  hci: HciRecord;
  wittgenstein: WittgensteinRecord;
};

export function getCountryDatasets(countryId: CountryId): CountryDatasetBundle {
  return {
    ilo: iloByCountry[countryId],
    wdi: wdiByCountry[countryId],
    hci: hciByCountry[countryId],
    wittgenstein: wittgensteinByCountry[countryId],
  };
}

/**
 * Format an Indicator for display.
 *   formatIndicator({ value: 22.4, unit: "%", … })  →  "22.4%"
 *   formatIndicator({ value: 1.8,  unit: "USD/hr", … })  →  "$1.80/hr"
 *   formatIndicator({ value: 0.55, unit: "score", … })  →  "0.55"
 */
export function formatIndicator(ind: Indicator): string {
  switch (ind.unit) {
    case "%":
      return `${trimZeros(ind.value, 1)}%`;
    case "USD/hr":
      return `$${trimZeros(ind.value, 2)}/hr`;
    case "USD":
      return `$${Math.round(ind.value).toLocaleString()}`;
    case "score":
      return ind.value.toFixed(2);
    case "count":
      return ind.value.toLocaleString();
    default:
      return String(ind.value);
  }
}

function trimZeros(n: number, max: number): string {
  return Number(n.toFixed(max)).toString();
}

// ─── Pre-computed convenience getters ──────────────────────────────────────

/**
 * Shape returned to LabourMarketPanel. Replaces the hand-written
 * `labourSignals` blob in countryConfigs.ts. Strings are formatted from
 * the typed Indicators, and the `cite` line is ready to render verbatim
 * in a small grey footer.
 */
export type LabourSignalsView = {
  youthNEET: string;
  informalEmployment: string;
  youthUnemployment: string;
  employmentToPopulation: string;
  digitalAccessSignal: string;
  wageBenchmark: string;
  /** Subtle "Sources: ILO ILOSTAT (2023) · WB WDI (2023)" line. */
  citation: string;
};

export function getLabourSignalsView(
  countryId: CountryId,
): LabourSignalsView {
  const { ilo, wdi } = getCountryDatasets(countryId);
  return {
    youthNEET: formatIndicator(ilo.youthNEET),
    informalEmployment: formatIndicator(ilo.informalEmployment),
    youthUnemployment: formatIndicator(ilo.youthUnemployment),
    employmentToPopulation: formatIndicator(ilo.employmentToPopulation),
    digitalAccessSignal: deriveDigitalAccessLabel(wdi.internetUsersPct.value),
    wageBenchmark: `${formatIndicator(ilo.medianHourlyWageUSD)} local benchmark`,
    citation: cite([
      ilo.youthNEET,
      ilo.informalEmployment,
      ilo.youthUnemployment,
      ilo.employmentToPopulation,
      ilo.medianHourlyWageUSD,
      wdi.internetUsersPct,
    ]),
  };
}

/**
 * Lightweight context surfaced on the dashboard / clarify page. Carries
 * its own citation so the UI can render a single small footer per card.
 */
export type EducationContextView = {
  hciScore: string; // formatted 0..1 score
  workingAgePct: string;
  youthBulgePct: string;
  secondaryAttainmentAdultPct: string;
  secondaryAttainmentProjected2030Pct: string;
  citation: string;
};

export function getEducationContextView(
  countryId: CountryId,
): EducationContextView {
  const { hci, wittgenstein } = getCountryDatasets(countryId);
  return {
    hciScore: formatIndicator(hci.hciScore),
    workingAgePct: formatIndicator(wittgenstein.workingAgePct),
    youthBulgePct: formatIndicator(wittgenstein.youthBulgePct),
    secondaryAttainmentAdultPct: formatIndicator(
      wittgenstein.secondaryAttainmentAdultPct,
    ),
    secondaryAttainmentProjected2030Pct: formatIndicator(
      wittgenstein.secondaryAttainmentProjected2030Pct,
    ),
    citation: cite([
      hci.hciScore,
      wittgenstein.workingAgePct,
      wittgenstein.youthBulgePct,
      wittgenstein.secondaryAttainmentAdultPct,
      wittgenstein.secondaryAttainmentProjected2030Pct,
    ]),
  };
}

/**
 * Convenience: render the canonical short label for a single source ID.
 */
export function sourceLabel(id: DatasetSource): string {
  return SOURCE_META[id].name;
}
