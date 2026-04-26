# Data sources

Authoritative public datasets used by the Label-to-Ladder prototype.
Snapshot retrieved: **2026-04**. Values live in `src/lib/datasets/*.ts`.

To plan a refresh: `npm run datasets:refresh` (currently a stub — see
`scripts/refresh-datasets.ts`).

| # | Dataset | Provider | Indicators used | URL | Vintage | License |
|---|---------|----------|-----------------|-----|---------|---------|
| 1 | **ILO ILOSTAT** | International Labour Organization | Youth NEET (15–24), Informal employment, Youth unemployment, Employment-to-population ratio, Median hourly wage (USD, local benchmark) | <https://data.ilo.org/> | 2023 (latest country-year) | ILO open data terms |
| 2 | **World Bank WDI** | World Bank Group | GNI per capita Atlas (USD), Individuals using the Internet (% of pop), Lower-secondary completion rate | <https://databank.worldbank.org/source/world-development-indicators> | 2023 | CC BY-4.0 |
| 3 | **World Bank Human Capital Index** | World Bank Group | HCI composite score (0–1) | <https://humancapital.worldbank.org/en/indicator/WB_HCP_HCI> | 2020 release | CC BY-4.0 |
| 4 | **ILO ISCO-08** | International Labour Organization | 4-digit unit-group codes mapped to prototype jobs | <https://ilostat.ilo.org/methods/concepts-and-definitions/classification-occupation/> | 2008 (2021 EN Vol. 1 update) | ILO open data terms |
| 5 | **Wittgenstein Centre Human Capital Data Explorer** | IIASA / Vienna Institute of Demography / WU Vienna | Total population, working-age share (15–64), youth-bulge share (15–29), secondary attainment (25+), 2030 projection | <https://dataexplorer.wittgensteincentre.org/> | SSP2 reference scenario, 2025 + 2030 projections | CC BY-NC 4.0 |
| 6 | **ESCO Skills Taxonomy** | European Commission | Skill-cluster codes underpinning the cultural-domain → ESCO crosswalk | <https://esco.ec.europa.eu/en/classification> | v1.1.x | CC BY-4.0 |

## Mapping to UI surfaces

| UI surface | Data sources read |
|------------|-------------------|
| Dashboard – Country configuration card (Wage benchmark) | ILO ILOSTAT |
| Dashboard – Labour market panel | ILO ILOSTAT, WB WDI (digital-access label) |
| Dashboard – Education / human-capital context | WB HCI, Wittgenstein |
| Skills Passport – occupation alignment | ILO ISCO-08, ESCO |
| Job matching – ESCO skill overlap | ESCO |
| Job matching – ISCO-08 occupation tag | ILO ISCO-08 |

## Snapshot policy

Values are committed alongside code so the demo runs offline and remains
reproducible. To plan a refresh from the canonical sources, see
`scripts/refresh-datasets.ts`. Live fetching is a future seam exposed via
the typed `getCountryDatasets()` helper in `src/lib/datasets/index.ts`.
