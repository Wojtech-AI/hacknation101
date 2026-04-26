/**
 * Signal extraction — converts raw questionnaire input into a SignalProfile.
 *
 * Phase 0.1 ships only the legacy adapter (`extractFromLegacy`) that maps
 * today's free-text questionnaire into the new structured shape. When 0.2
 * lands the structured questionnaire, a sibling `extractFromStructured`
 * will replace it; the SignalProfile shape is the stable contract.
 *
 * Pipeline:
 *   1. Resolve the candidate's languages → CEFR levels (heuristic: assume
 *      C1 for the country's UI locale, B1 for the rest).
 *   2. Resolve the candidate's domains → DomainWeight[]:
 *        - From the legacy `domainKnowledge` array, fuzzy-match each entry
 *          against the country's `communityDomains` (chip palette).
 *        - Default any matched chip to weight 1; the structured 0.2
 *          questionnaire will start producing 0..3 weights here.
 *   3. Compute the inferred ESCO-skill confidence vector:
 *        for each (domain, weight):
 *          for each (esco, contribution) in DOMAIN_TO_ESCO[domain]:
 *            inferred[esco] += weight * contribution
 *        clamp each to 0..1 with a smoothing scale.
 *   4. Persist comfort + availability fields straight from raw answers.
 */

import {
  DOMAIN_TO_ESCO,
  DOMAIN_TAGS,
  type CountryId,
  type DomainTag,
  type EscoSkillCode,
} from "./datasets";
import { getCountryConfig } from "./countryConfigs";
import { COUNTRY_PACKS } from "./countryPacks";
import type { QuestionnaireData, Candidate } from "./types";
import type {
  CefrLevel,
  ComfortRating,
  DeviceStability,
  DomainWeight,
  EvidenceRubric,
  LanguageProficiency,
  ScriptId,
  SignalProfile,
} from "./signals";

// ─── Heuristics: language → CEFR + scripts ────────────────────────────────

/**
 * Approximate the candidate's CEFR level for a given language using only
 * what we know from the profile + country config:
 *   - The country's UI-locale language → C1 (most users we onboard speak
 *     their official language at near-native level even without formal
 *     credentials).
 *   - English (when not the UI locale) → B2 if the candidate self-reported
 *     it, B1 otherwise.
 *   - Any other declared language → B1.
 *
 * The structured questionnaire (0.2) replaces this heuristic with a real
 * matrix the user fills in.
 */
function inferCefrLevel(
  language: string,
  countryUiLanguage: string | undefined,
): CefrLevel {
  const norm = language.toLowerCase();
  const ui = countryUiLanguage?.toLowerCase();
  if (ui && norm === ui) return "C1";
  if (norm === "english") return "B2";
  return "B1";
}

/**
 * Map a language name to the writing systems a candidate plausibly works
 * in. Conservative defaults: most languages get Latin; Arabic / Hindi /
 * Kannada / etc. get their native script as well (we assume readers of
 * those languages can handle their own script).
 */
function inferScripts(language: string): ScriptId[] {
  const norm = language.toLowerCase();
  if (norm.includes("arabic") || norm.includes("darija")) {
    return ["arabic", "mixed-latin-arabic", "latin"];
  }
  if (norm.includes("hindi")) return ["devanagari", "latin"];
  if (norm.includes("kannada")) return ["kannada", "latin"];
  if (norm.includes("bengali")) return ["bengali", "latin"];
  return ["latin"];
}

const KNOWN_DIALECTS: Record<string, string> = {
  "bahian portuguese": "Portuguese",
  sheng: "Swahili",
  taglish: "Tagalog",
  darija: "Arabic",
  "moroccan arabic": "Arabic",
  "nigerian pidgin": "English",
  "paisa spanish": "Spanish",
};

function buildLanguageProficiencies(
  candidateLanguages: string[],
  countryLanguages: string[],
  countryUiLanguage: string | undefined,
): LanguageProficiency[] {
  const merged = Array.from(
    new Set(
      [...candidateLanguages, ...countryLanguages]
        .map((l) => l.trim())
        .filter(Boolean),
    ),
  );

  return merged.map((language) => {
    const dialectKey = language.toLowerCase();
    const parent = KNOWN_DIALECTS[dialectKey];
    return {
      language,
      level: inferCefrLevel(parent ?? language, countryUiLanguage),
      scripts: inferScripts(parent ?? language),
      isDialect: parent !== undefined,
      parentLanguage: parent,
    };
  });
}

// ─── Heuristics: legacy domainKnowledge[] → DomainWeight[] ────────────────

/**
 * Best-effort fuzzy match from a free-form chip label (e.g. "mobile
 * money", "youth slang", "transport") to a canonical DomainTag from
 * Phase 0a's esco-skills.ts taxonomy.
 *
 * We avoid fancy NLP — short keyword tables are sufficient for the
 * curated chip palette used in the legacy questionnaire and the country
 * configs' `communityDomains` list.
 */
const DOMAIN_KEYWORDS: Record<DomainTag, string[]> = {
  payments: ["payment", "money", "mobile money", "upi", "pix", "bank", "transfer"],
  scams: ["scam", "fraud", "phishing", "deception"],
  transport: [
    "transport",
    "matatu",
    "jeepney",
    "taxi",
    "bus",
    "commute",
    "ride",
  ],
  food: ["food", "cuisine", "cooking", "dish", "restaurant", "street food"],
  music: ["music", "song", "genre", "artist"],
  slang: ["slang", "informal language", "youth slang", "street talk"],
  "code-switch": ["code-switch", "code switching", "mixed language", "taglish"],
  religion: ["religion", "faith", "spiritual", "tradition"],
  markets: ["market", "trader", "shop", "neighbourhood commerce"],
  agriculture: ["agriculture", "farming", "crop", "harvest", "rural"],
  family: ["family", "community life", "household", "extended family"],
  technology: ["technology", "phone repair", "device", "tech"],
  education: ["education", "school", "student life", "tutoring", "study"],
  health: ["health", "clinic", "medicine", "hospital"],
  sports: ["sport", "football", "basketball", "athletics"],
};

function matchDomainTag(label: string): DomainTag | null {
  const norm = label.toLowerCase();
  for (const tag of DOMAIN_TAGS) {
    if (norm === tag) return tag;
    if (DOMAIN_KEYWORDS[tag].some((kw) => norm.includes(kw))) return tag;
  }
  return null;
}

function buildDomainWeights(
  legacyDomainKnowledge: string[],
  countryCommunityDomains: string[],
): DomainWeight[] {
  // Fuzzy-match every chip the candidate ticked plus, with lower confidence,
  // every chip in the country's default palette. Country-default chips give
  // 0.5 weight (the candidate "lives there", so they probably have some
  // exposure). Candidate-ticked chips give weight 1.5 (clear signal but
  // not explicit-strength like the structured 0..3 picker will be).
  const aggregated = new Map<DomainTag, number>();

  for (const label of countryCommunityDomains) {
    const tag = matchDomainTag(label);
    if (tag) aggregated.set(tag, (aggregated.get(tag) ?? 0) + 0.5);
  }
  for (const label of legacyDomainKnowledge) {
    const tag = matchDomainTag(label);
    if (tag) aggregated.set(tag, (aggregated.get(tag) ?? 0) + 1.5);
  }

  return Array.from(aggregated.entries())
    .map(([tag, weight]) => ({ tag, weight: Math.min(3, weight) }))
    .sort((a, b) => b.weight - a.weight);
}

// ─── ESCO-skill confidence aggregation ────────────────────────────────────

/**
 * Walk each domain weight through DOMAIN_TO_ESCO and aggregate
 * weighted contributions per ESCO skill code. Capped at 1.0 with a
 * scale factor of 3.0 — meaning a single weight-3 domain that lists an
 * ESCO skill at full evidence (1.0) will produce a 1.0 confidence on
 * that skill.
 */
export function aggregateEscoConfidence(
  domains: DomainWeight[],
): Record<EscoSkillCode, number> {
  const SCALE = 3.0;
  const out: Record<EscoSkillCode, number> = {};
  for (const { tag, weight } of domains) {
    const evidences = DOMAIN_TO_ESCO[tag] ?? [];
    for (const { code, weight: contribution } of evidences) {
      out[code] = (out[code] ?? 0) + (weight * contribution) / SCALE;
    }
  }
  for (const code of Object.keys(out)) {
    out[code] = Math.min(1, out[code]);
  }
  return out;
}

// ─── Comfort + availability ───────────────────────────────────────────────

function deriveDeviceStability(
  candidateDeviceAccess: string | undefined,
): DeviceStability {
  const norm = (candidateDeviceAccess ?? "").toLowerCase();
  if (norm.includes("laptop") || norm.includes("desktop")) {
    return "desktop-primary";
  }
  if (norm.includes("smartphone")) return "mobile-primary";
  return "mobile-only";
}

function deriveWeeklyHours(availability: string | undefined): number {
  const norm = (availability ?? "").toLowerCase();
  if (norm.includes("full")) return 30;
  if (norm.includes("part")) return 12;
  if (norm.includes("evening") || norm.includes("weekend")) return 6;
  return 8;
}

// ─── Public surface ───────────────────────────────────────────────────────

export type ExtractFromLegacyInput = {
  candidate: Candidate;
  questionnaire: QuestionnaireData;
  evidenceRubric?: EvidenceRubric;
};

/**
 * Convert today's legacy questionnaire data into a SignalProfile so the
 * matching layer can score it. Used by /api/questionnaire and by the
 * legacy `matchJobs()` shim in matching.ts.
 */
export function extractFromLegacy(
  input: ExtractFromLegacyInput,
): SignalProfile {
  const { candidate, questionnaire, evidenceRubric } = input;

  // The candidate's `country` is a display string ("Madagascar"); resolve
  // it back to a CountryId via countryConfigs (which is what the rest of
  // the pipeline keys off).
  const config = getCountryConfig(slugifyCountry(candidate.country));

  const languages = buildLanguageProficiencies(
    candidate.languages,
    config.languages,
    config.languages[0],
  );

  const domains = buildDomainWeights(
    questionnaire.domainKnowledge,
    config.communityDomains,
  );

  const inferredEscoSkills = aggregateEscoConfidence(domains);

  const comfort: ComfortRating = {
    writingComfort: clamp1to5(questionnaire.writingComfort),
    criticalThinking: clamp1to5(questionnaire.criticalThinkingSelfRating),
    weeklyHoursAvailable: deriveWeeklyHours(candidate.availability),
    deviceStability: deriveDeviceStability(candidate.deviceAccess),
  };

  return {
    candidateId: candidate.id,
    countryId: config.id,
    languages,
    domains,
    comfort,
    evidenceRubric,
    inferredEscoSkills,
    computedAt: new Date().toISOString(),
    source: evidenceRubric ? "structured+probe" : "legacy",
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────

function clamp1to5(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 3;
  return Math.max(1, Math.min(5, Math.round(v)));
}

/**
 * Best-effort country-name → countryId mapping. The display names and
 * ids are 1:1 in countryConfigs.ts, but `Candidate.country` is free-form
 * so we normalise.
 */
function slugifyCountry(name: string): CountryId | undefined {
  const norm = name.trim().toLowerCase().replace(/\s+/g, "-");
  const known: CountryId[] = [
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
  return known.find((c) => c === norm);
}

// ─── Structured-questionnaire extraction (Phase 0.2) ──────────────────────

/**
 * Raw answers produced by the new 3-zone structured questionnaire UI.
 * Every field is optional so the API can run with partial payloads (the
 * questionnaire ships with progressive disclosure — users can skip Zone C).
 */
export type StructuredAnswers = {
  countryId: CountryId;
  /** Zone A: declared languages with CEFR levels and scripts. */
  languages?: LanguageProficiency[];
  /** Zone A: comfort + availability. */
  comfort?: ComfortRating;
  /**
   * Zone B: chip id → weight (0..3). Resolved against COUNTRY_PACKS to
   * find each chip's canonical DomainTag.
   */
  chipWeights?: Record<string, number>;
  /** Zone C: optional evidence rubric from the probe (Phase 0.3). */
  evidenceRubric?: EvidenceRubric;
};

export type ExtractFromStructuredInput = {
  candidate: Candidate;
  answers: StructuredAnswers;
};

/**
 * Convert structured Zone A/B/C answers into a SignalProfile. Multiple
 * chips can map to the same DomainTag — we average their weights so a
 * country pack that lists 3 payments-related chips doesn't triple-count.
 */
export function extractFromStructured(
  input: ExtractFromStructuredInput,
): SignalProfile {
  const { candidate, answers } = input;
  const config = getCountryConfig(answers.countryId);

  const languages: LanguageProficiency[] =
    answers.languages?.length
      ? answers.languages
      : buildLanguageProficiencies(
          candidate.languages,
          config.languages,
          config.languages[0],
        );

  const domains = aggregateChipWeights(answers.countryId, answers.chipWeights);

  const inferredEscoSkills = aggregateEscoConfidence(domains);

  const comfort: ComfortRating = answers.comfort ?? {
    writingComfort: 3,
    criticalThinking: 3,
    weeklyHoursAvailable: deriveWeeklyHours(candidate.availability),
    deviceStability: deriveDeviceStability(candidate.deviceAccess),
  };

  return {
    candidateId: candidate.id,
    countryId: answers.countryId,
    languages,
    domains,
    comfort,
    evidenceRubric: answers.evidenceRubric,
    inferredEscoSkills,
    computedAt: new Date().toISOString(),
    source: answers.evidenceRubric ? "structured+probe" : "structured",
  };
}

/**
 * Resolve chip ids → DomainTag via COUNTRY_PACKS, then average weights
 * per tag (so payments × 3 chips → one payments weight, not three).
 */
function aggregateChipWeights(
  countryId: CountryId,
  chipWeights: Record<string, number> | undefined,
): DomainWeight[] {
  if (!chipWeights) return [];
  const pack = COUNTRY_PACKS[countryId];
  if (!pack) return [];

  const buckets = new Map<DomainTag, { sum: number; n: number }>();
  for (const chip of pack.chips) {
    const w = chipWeights[chip.id];
    if (typeof w !== "number" || w <= 0) continue;
    const clamped = Math.max(0, Math.min(3, w));
    const bucket = buckets.get(chip.domain) ?? { sum: 0, n: 0 };
    bucket.sum += clamped;
    bucket.n += 1;
    buckets.set(chip.domain, bucket);
  }

  return Array.from(buckets.entries())
    .map(([tag, { sum, n }]) => ({
      tag,
      weight: Number((sum / n).toFixed(2)),
    }))
    .sort((a, b) => b.weight - a.weight);
}

// ─── Synthetic profile for the legacy matchJobs() shim ────────────────────

/**
 * When the matching API is called with only `{ level, languages }` (the
 * old contract from /jobs and /passport), we can't run a true extraction
 * — there's no questionnaire data. Instead we synthesize a minimum-viable
 * profile so rankJobs() still produces sensible output.
 *
 * The synthesised profile:
 *   - Carries CEFR levels heuristically
 *   - Has empty domains (so ESCO overlap == 0)
 *   - Defaults to neutral comfort + part-time availability
 * The matcher then leans on hard filters + base score; downstream UI can
 * still render a job list. When the questionnaire is wired up, the real
 * SignalProfile from /api/questionnaire takes over.
 */
export function synthesizePartialSignal(input: {
  candidateId?: string;
  countryId?: CountryId;
  languages: string[];
}): SignalProfile {
  const config = input.countryId
    ? getCountryConfig(input.countryId)
    : getCountryConfig();
  const languages = buildLanguageProficiencies(
    input.languages,
    config.languages,
    config.languages[0],
  );
  return {
    candidateId: input.candidateId ?? "anonymous",
    countryId: config.id,
    languages,
    domains: [],
    comfort: {
      writingComfort: 3,
      criticalThinking: 3,
      weeklyHoursAvailable: 8,
      deviceStability: "mobile-primary",
    },
    inferredEscoSkills: {},
    computedAt: new Date().toISOString(),
    source: "legacy",
  };
}
