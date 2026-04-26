/**
 * Dataset provenance — single source of truth for citation metadata.
 *
 * Every value rendered on the dashboard or used in a calculation should
 * carry a `source` reference into this file. The UI uses `cite(source)`
 * to render the small "Sources: …" footer line.
 *
 * Six approved data sources for the prototype (decisions logged 2026-04-26):
 *   - ILO ILOSTAT
 *   - World Bank WDI
 *   - World Bank Human Capital Index
 *   - ILO ISCO-08 (occupation taxonomy, global)
 *   - Wittgenstein Centre Human Capital Data Explorer (education projections)
 *   - ESCO Skills Taxonomy (skill clusters, global)
 *
 * Values in dataset files are snapshots, not live. To refresh, run
 * `npm run datasets:refresh` (currently a stub — see scripts/refresh-datasets.ts).
 */

export enum DatasetSource {
  ILO_ILOSTAT = "ILO_ILOSTAT",
  WB_WDI = "WB_WDI",
  WB_HCI = "WB_HCI",
  ILO_ISCO08 = "ILO_ISCO08",
  WITTGENSTEIN = "WITTGENSTEIN",
  ESCO = "ESCO",
}

export type SourceMeta = {
  id: DatasetSource;
  name: string; // short label for UI
  fullName: string; // citation-ready
  url: string;
  license: string;
  retrievedAt: string; // ISO date or year-quarter; uniform across the snapshot
};

/**
 * SOURCE_META — keep this list in sync with data/sources.md.
 * Single retrieval batch on 2026-04-26 means every record carries the same
 * `retrievedAt` for reproducibility.
 */
export const SOURCE_META: Record<DatasetSource, SourceMeta> = {
  [DatasetSource.ILO_ILOSTAT]: {
    id: DatasetSource.ILO_ILOSTAT,
    name: "ILO ILOSTAT",
    fullName:
      "International Labour Organization — ILOSTAT (https://data.ilo.org/)",
    url: "https://data.ilo.org/",
    license: "ILO open data terms",
    retrievedAt: "2026-04",
  },
  [DatasetSource.WB_WDI]: {
    id: DatasetSource.WB_WDI,
    name: "WB WDI",
    fullName: "World Bank — World Development Indicators",
    url: "https://databank.worldbank.org/source/world-development-indicators",
    license: "CC BY-4.0",
    retrievedAt: "2026-04",
  },
  [DatasetSource.WB_HCI]: {
    id: DatasetSource.WB_HCI,
    name: "WB HCI",
    fullName: "World Bank — Human Capital Index",
    url: "https://humancapital.worldbank.org/en/indicator/WB_HCP_HCI",
    license: "CC BY-4.0",
    retrievedAt: "2026-04",
  },
  [DatasetSource.ILO_ISCO08]: {
    id: DatasetSource.ILO_ISCO08,
    name: "ILO ISCO-08",
    fullName:
      "International Labour Organization — International Standard Classification of Occupations (ISCO-08)",
    url: "https://ilostat.ilo.org/methods/concepts-and-definitions/classification-occupation/",
    license: "ILO open data terms",
    retrievedAt: "2026-04",
  },
  [DatasetSource.WITTGENSTEIN]: {
    id: DatasetSource.WITTGENSTEIN,
    name: "Wittgenstein Centre",
    fullName:
      "Wittgenstein Centre Human Capital Data Explorer (IIASA / Vienna Institute of Demography / WU)",
    url: "https://dataexplorer.wittgensteincentre.org/",
    license: "CC BY-NC 4.0",
    retrievedAt: "2026-04",
  },
  [DatasetSource.ESCO]: {
    id: DatasetSource.ESCO,
    name: "ESCO",
    fullName:
      "European Skills, Competences, Qualifications and Occupations (ESCO) — European Commission",
    url: "https://esco.ec.europa.eu/en/classification",
    license: "CC BY-4.0",
    retrievedAt: "2026-04",
  },
};

/**
 * Indicator — common envelope for any single value pulled from a dataset.
 * Carries unit, year and source pointer so the UI never displays a number
 * without provenance.
 */
export type Indicator<U extends string = string> = {
  value: number;
  unit: U;
  year: number;
  source: DatasetSource;
  notes?: string;
};

/**
 * cite() — render the subtle "Sources: ILO ILOSTAT (2023) · WB WDI (2023)"
 * line we use under cards. Dedupes sources, sorts by name, attaches the
 * indicator-year span when supplied.
 */
export function cite(
  sources: ReadonlyArray<DatasetSource | Indicator>,
): string {
  const byId = new Map<DatasetSource, { years: Set<number> }>();
  for (const s of sources) {
    const id = typeof s === "string" ? s : s.source;
    const year = typeof s === "string" ? undefined : s.year;
    if (!byId.has(id)) byId.set(id, { years: new Set() });
    if (year !== undefined) byId.get(id)!.years.add(year);
  }
  const parts = Array.from(byId.entries())
    .sort((a, b) => SOURCE_META[a[0]].name.localeCompare(SOURCE_META[b[0]].name))
    .map(([id, { years }]) => {
      const yrs = Array.from(years).sort();
      if (yrs.length === 0) return SOURCE_META[id].name;
      const span =
        yrs.length === 1 ? `${yrs[0]}` : `${yrs[0]}–${yrs[yrs.length - 1]}`;
      return `${SOURCE_META[id].name} (${span})`;
    });
  if (parts.length === 0) return "";
  return `Sources: ${parts.join(" · ")}`;
}

/**
 * Country IDs as used elsewhere in the app — re-exported here so dataset
 * files can declare typed `Record<CountryId, …>` shapes that fail to compile
 * if a country is missing.
 */
export type CountryId =
  | "madagascar"
  | "ghana"
  | "brazil"
  | "kenya"
  | "india"
  | "south-africa"
  | "nigeria"
  | "colombia"
  | "morocco"
  | "philippines";

export const COUNTRY_IDS: CountryId[] = [
  "madagascar",
  "ghana",
  "brazil",
  "kenya",
  "india",
  "south-africa",
  "nigeria",
  "colombia",
  "morocco",
  "philippines",
];
