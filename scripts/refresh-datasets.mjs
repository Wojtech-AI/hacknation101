#!/usr/bin/env node
// scripts/refresh-datasets.mjs — STUB.
//
// For the hackathon prototype, dataset values are committed snapshots in
// src/lib/datasets/*.ts. This script is the future seam where we wire up
// live fetches against the canonical APIs and rewrite the snapshot files.
//
// Today it just prints what it *would* fetch and exits 0 so the CI / docs
// link to a working command.
//
// Run via:  npm run datasets:refresh

const PLANNED = [
  {
    source: "ILO ILOSTAT",
    endpoint:
      "https://rplumber.ilo.org/data/indicator/?id=NEET_DEAP_SEX_AGE_RT_A&ref_area={ISO3}&format=json",
    notes:
      "NEET, informal-employment, youth-unemployment, employment-to-pop, median wage per country (10 ISO3 codes)",
  },
  {
    source: "World Bank WDI",
    endpoint:
      "https://api.worldbank.org/v2/country/{ISO3}/indicator/{NY.GNP.PCAP.CD,IT.NET.USER.ZS,SE.SEC.CMPT.LO.ZS}?format=json&date=2018:2024&per_page=50",
    notes: "GNI/cap, internet users %, lower-secondary completion %",
  },
  {
    source: "World Bank HCI",
    endpoint:
      "https://api.worldbank.org/v2/country/{ISO3}/indicator/HD.HCI.OVRL?format=json",
    notes: "HCI composite (latest available year per country)",
  },
  {
    source: "Wittgenstein Centre",
    endpoint:
      "https://dataexplorer.wittgensteincentre.org/wcde-v3/api/v2/{scenario}/data?countryCode={ISO3}",
    notes:
      "SSP2 baseline: total population, working-age %, youth-bulge %, secondary attainment 25+ for 2025 + 2030",
  },
  {
    source: "ILO ISCO-08",
    endpoint:
      "https://www.ilo.org/wcmsp5/groups/public/---dgreports/---dcomm/---publ/documents/publication/wcms_172572.pdf",
    notes:
      "Static taxonomy — refresh only when ISCO is revised (next major revision: ISCO-28)",
  },
  {
    source: "ESCO Skills Taxonomy",
    endpoint: "https://ec.europa.eu/esco/api/resource/skill?language=en",
    notes:
      "Skill-cluster codes for the 14 ESCO skills referenced by DOMAIN_TO_ESCO mapping",
  },
];

console.log(
  "─── npm run datasets:refresh (STUB) ────────────────────────────────────",
);
console.log(
  "Today this is a no-op. Wire up live fetches when moving past the demo.\n",
);
for (const item of PLANNED) {
  console.log(`• ${item.source}`);
  console.log(`    GET ${item.endpoint}`);
  if (item.notes) console.log(`    ↳ ${item.notes}`);
  console.log();
}
console.log(
  "After fetching, parse responses, validate against existing types,\n  and rewrite src/lib/datasets/*.ts in place.",
);
console.log(
  "─── done ──────────────────────────────────────────────────────────────",
);
