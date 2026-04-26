# Unmapped Voices

**Unmapped Voices** is a hackathon MVP that turns **local language judgement and cultural context** into a structured **signal profile** and **skills passport**, then surfaces **explainably matched** AI data-work style jobs and a **cultural annotation** lane. The product name in the UI is *Unmapped Voices*; the npm package is still named `locallens` from an earlier working title.

This is a **client-heavy prototype**: there is **no real database**. State lives in **`localStorage`**, and **Next.js Route Handlers** (`app/api/...`) simulate a backend (validation, scoring, ranking, seeded leaderboard updates).

---

## Stack

| Layer | Choice |
|--------|--------|
| Framework | **Next.js 16** (App Router) |
| UI | **React 19**, **TypeScript** |
| Styling | **Tailwind CSS v4** (CSS variables for the cream / forest / teal palette in `src/app/globals.css`) |
| i18n | Custom **`LocaleProvider`** + typed keys in `src/lib/i18n.ts`; optional **MyMemory** machine translation for long/dynamic strings with caching in `src/lib/autoTranslate.ts` |
| “Backend” | **`app/api/*/route.ts`** — JSON in/out, no persistence beyond what the browser stores |

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build    # production build
npm run start    # run production server
npm run lint     # eslint
```

### Optional: refresh bundled public datasets

```bash
npm run datasets:refresh
```

Uses `scripts/refresh-datasets.mjs` (see `data/sources.md`).

---

## Intended user journey (submission demo)

1. **Landing** (`/`) — value prop and CTA into the flow.  
2. **Onboarding** (`/onboarding`) — profile + demo country (`locallens-country` in `localStorage`).  
3. **Questionnaire** (`/questionnaire`) — structured signals + country pack chips; writes `ltl-profile`, `ltl-questionnaire`, `ll-chip-weights`, and calls **`POST /api/questionnaire`** → **`ll-signal-profile`**.  
4. **Probe** (`/probe`) — short evidence items; **`POST /api/probe/submit`** merges an **Evidence rubric** into `ll-signal-profile`.  
5. **Clarify** (`/clarify`) — narrative summary via **`POST /api/ai/clarify-profile`**.  
6. **Micro-skill test** (`/test`) — **`POST /api/test/submit`** → **`ltl-test-result`**, **`ltl-passport`**.  
7. **Passport** (`/passport`) — **`POST /api/passport/[candidateId]`** composes the visible passport.  
8. **Jobs** (`/jobs`) — **`POST /api/jobs/matched/[candidateId]`** returns **ranked** jobs + match/mismatch reasons from `rankJobs` / `matchJobs`.  
9. **Annotation** (`/annotation`) — culturally anchored task from `culturalAnnotationTasks` + **`POST /api/annotation/submit`** + **`POST /api/qa/review`**.  
10. **Leaderboard** (`/leaderboard`) — **`POST /api/leaderboard`** merges the user into seeded demo rows.

Other routes (e.g. `/tasks`, `/skill-test`, `/pitch`, `/sources`) still exist for demos and judges but are **not** in the slim global nav.

---

## Repository layout (high level)

```
src/app/           # App Router pages + api route handlers
src/components/    # Shared UI (header, stepper, cards, pickers)
src/lib/           # Domain logic: signals, matching, i18n, country packs, mock data, cultural tasks
data/              # Source notes / dataset refresh inputs
```

Important libraries:

- **`src/lib/signals.ts`** — `SignalProfile`, match/mismatch reason types.  
- **`src/lib/signalExtraction.ts`** — questionnaire → weighted domains → inferred **ESCO** skill vector.  
- **`src/lib/matching.ts`** — `rankJobs`: hard filters + soft scores + human-readable reasons.  
- **`src/lib/countryPacks.ts`** / **`countryConfigs.ts`** — per-country chips and labour/education copy.  
- **`src/lib/culturalAnnotationTasks.ts`** — country/domain-specific annotation scenarios + `pickAnnotationTask`.  
- **`src/lib/mockData.ts`** — seeded jobs, test questions, leaderboard seeds.

---

## Data & fairness story (prototype)

Labour-market and education **numbers** are wired from **ILO ILOSTAT**, **World Bank WDI/HCI**, and **Wittgenstein** projections where the UI shows citations (see **`/sources`** and `data/sources.md`). **Payments, partner names, leaderboard positions, and many “dashboard” style counts are simulated** for the hackathon.

---

## Licence / status

Private hackathon project (`"private": true` in `package.json`). Adjust as needed when open-sourcing.
