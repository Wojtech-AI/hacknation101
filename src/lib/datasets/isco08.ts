/**
 * ILO ISCO-08 — International Standard Classification of Occupations.
 *
 * Source: https://ilostat.ilo.org/methods/concepts-and-definitions/classification-occupation/
 * Reference PDF (Vol. 1, EN, 2021):
 *   https://webapps.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Vol%201.pdf
 *
 * We map each prototype job in mockData.JOBS[] onto the closest 4-digit
 * ISCO-08 unit group. AI data work doesn't yet have a dedicated code, so we
 * align with the analytical / language / review professions whose tasks
 * most closely overlap.
 *
 * The mapping unlocks two downstream benefits:
 *   - The Skills Passport renders an internationally-recognised occupation
 *     code under each verified skill cluster.
 *   - rankJobs() can use ISCO crosswalks to ESCO competences for
 *     deterministic skill-overlap scoring.
 */

import { DatasetSource, type Indicator } from "./provenance";

export type Isco08Code = string; // 4-digit, e.g. "2643"

export type Isco08Entry = {
  code: Isco08Code;
  title: string;
  shortTitle?: string;
  source: DatasetSource;
};

const isco = (code: Isco08Code, title: string, shortTitle?: string): Isco08Entry => ({
  code,
  title,
  shortTitle,
  source: DatasetSource.ILO_ISCO08,
});

/**
 * Subset of ISCO-08 unit groups relevant to the prototype's 6 jobs.
 * Add more entries here as new jobs are introduced; the lookup is keyed
 * by 4-digit code so partial coverage is fine.
 */
export const ISCO08_CATALOG: Record<Isco08Code, Isco08Entry> = {
  "1213": isco("1213", "Policy and planning managers", "Policy mgmt"),
  "2421": isco(
    "2421",
    "Management and organization analysts",
    "Mgmt analyst",
  ),
  "2422": isco(
    "2422",
    "Policy administration professionals",
    "Policy professional",
  ),
  "2424": isco(
    "2424",
    "Training and staff development professionals",
    "Training prof",
  ),
  "2511": isco("2511", "Systems analysts"),
  "2632": isco(
    "2632",
    "Sociologists, anthropologists and related professionals",
    "Sociologist",
  ),
  "2641": isco("2641", "Authors and related writers", "Author"),
  "2642": isco("2642", "Journalists"),
  "2643": isco(
    "2643",
    "Translators, interpreters and other linguists",
    "Linguist",
  ),
};

/**
 * Mapping from prototype job-id → ISCO-08 unit group.
 * Several jobs reasonably belong to multiple groups; we list them in order
 * of nearest fit (first entry is canonical).
 */
export const ISCO08_BY_JOB: Record<string, Isco08Code[]> = {
  "job-1": ["2643", "2424"], // AI Response Rating
  "job-2": ["2421", "2511"], // Scam Message Detection
  "job-3": ["2643"], // Translation Quality Review
  "job-4": ["2642", "2641"], // Factual Verification
  "job-5": ["2643", "2632"], // Cultural Context Review
  "job-6": ["1213", "2422"], // QA Lead Specialist
};

/**
 * Helper: render an occupation citation, e.g.
 *   "ISCO-08 2643 — Translators, interpreters and other linguists"
 */
export function describeIsco(code: Isco08Code): string {
  const entry = ISCO08_CATALOG[code];
  if (!entry) return `ISCO-08 ${code}`;
  return `ISCO-08 ${code} — ${entry.title}`;
}

/**
 * Indicator-shaped wrapper so dashboards can cite ISCO codes alongside
 * other dataset-sourced values without special-casing the type.
 */
export function iscoIndicator(code: Isco08Code): Indicator<"isco"> {
  return {
    value: Number(code),
    unit: "isco" as const,
    year: 2021, // ISCO-08 EN Vol. 1, 2021 update
    source: DatasetSource.ILO_ISCO08,
    notes: describeIsco(code),
  };
}
