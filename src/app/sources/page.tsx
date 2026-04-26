import type { Metadata } from "next";
import { SOURCE_META, DatasetSource } from "@/lib/datasets";

export const metadata: Metadata = {
  title: "Data sources — Unmapped Voices",
  description:
    "Public datasets that underpin the labour-market, human-capital, and skills calculations in the Unmapped Voices prototype.",
};

const SURFACE_MAP: Array<{ surface: string; sources: DatasetSource[] }> = [
  {
    surface: "Task hub · Country configuration (wage benchmark)",
    sources: [DatasetSource.ILO_ILOSTAT],
  },
  {
    surface: "Task hub · Labour-market panel",
    sources: [DatasetSource.ILO_ILOSTAT, DatasetSource.WB_WDI],
  },
  {
    surface: "Task hub · Education & human-capital context",
    sources: [DatasetSource.WB_HCI, DatasetSource.WITTGENSTEIN],
  },
  {
    surface: "Skills Passport · occupation alignment",
    sources: [DatasetSource.ILO_ISCO08, DatasetSource.ESCO],
  },
  {
    surface: "Job matching · ESCO skill overlap",
    sources: [DatasetSource.ESCO],
  },
  {
    surface: "Job matching · ISCO-08 occupation tag",
    sources: [DatasetSource.ILO_ISCO08],
  },
];

const SOURCE_INDICATORS: Record<DatasetSource, string[]> = {
  [DatasetSource.ILO_ILOSTAT]: [
    "Youth NEET (15–24, %)",
    "Informal employment (%)",
    "Youth unemployment (15–24, %)",
    "Employment-to-population ratio (%)",
    "Median hourly wage (USD, local benchmark)",
  ],
  [DatasetSource.WB_WDI]: [
    "GNI per capita, Atlas method (USD)",
    "Individuals using the Internet (% of population)",
    "Lower-secondary completion rate (%)",
  ],
  [DatasetSource.WB_HCI]: ["Human Capital Index composite (0–1)"],
  [DatasetSource.ILO_ISCO08]: [
    "4-digit ISCO-08 unit-group codes for prototype jobs",
  ],
  [DatasetSource.WITTGENSTEIN]: [
    "Total population (count)",
    "Working-age share, 15–64 (%)",
    "Youth-bulge share, 15–29 (%)",
    "Secondary attainment, 25+ adults (%)",
    "Secondary attainment, 2030 projection (%)",
  ],
  [DatasetSource.ESCO]: ["ESCO skill-cluster codes (S1–S6 pillars)"],
};

const ALL_SOURCES: DatasetSource[] = [
  DatasetSource.ILO_ILOSTAT,
  DatasetSource.WB_WDI,
  DatasetSource.WB_HCI,
  DatasetSource.ILO_ISCO08,
  DatasetSource.WITTGENSTEIN,
  DatasetSource.ESCO,
];

export default function SourcesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="space-y-2">
        <p className="section-label">Provenance</p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
          Data sources
        </h1>
        <p className="text-sm text-[var(--ink-2)] max-w-2xl">
          Every labour-market, human-capital, and occupation figure in the
          prototype is sourced from one of six public datasets. Values are
          committed snapshots so the demo runs offline; refreshing from the
          canonical sources is a single CLI step away.
        </p>
      </header>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 space-y-4 shadow-sm">
        <h2 className="font-semibold text-[var(--ink)]">Datasets</h2>
        <ul className="space-y-4">
          {ALL_SOURCES.map((id) => {
            const meta = SOURCE_META[id];
            return (
              <li
                key={id}
                className="border-l-2 border-[var(--line)] pl-4 space-y-1"
              >
                <p className="font-medium text-[var(--ink)]">
                  {meta.fullName}
                </p>
                <p className="text-xs text-[var(--ink-2)]">
                  Retrieved {meta.retrievedAt} · License {meta.license}
                </p>
                <a
                  href={meta.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[var(--teal)] hover:underline break-all"
                >
                  {meta.url}
                </a>
                <ul className="mt-1.5 space-y-0.5 text-xs text-[var(--ink-2)]">
                  {SOURCE_INDICATORS[id].map((indicator) => (
                    <li key={indicator}>· {indicator}</li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 space-y-3 shadow-sm">
        <h2 className="font-semibold text-[var(--ink)]">Where each source is used</h2>
        <ul className="text-sm text-[var(--ink-2)] space-y-1.5">
          {SURFACE_MAP.map(({ surface, sources }) => (
            <li key={surface}>
              <span className="text-[var(--ink)]">{surface}</span>
              <span className="text-xs ml-2">
                — {sources.map((s) => SOURCE_META[s].name).join(", ")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-[var(--ink-2)]">
        Snapshots live in <code>src/lib/datasets/</code>. To plan a refresh, run{" "}
        <code>npm run datasets:refresh</code>.
      </p>
    </div>
  );
}
