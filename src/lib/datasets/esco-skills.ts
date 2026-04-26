/**
 * ESCO Skills Taxonomy — skill clusters used as the canonical layer beneath
 * our cultural-domain tags.
 *
 * Source: https://esco.ec.europa.eu/en/classification
 *
 * Modelling choice (decisions logged 2026-04-26):
 *   The questionnaire surfaces *cultural domains* a user knows (payments,
 *   scams, transport, …). Those are not ESCO categories. Instead, each
 *   cultural domain declares which ESCO skill clusters it inferentially
 *   evidences. Jobs declare their `requiredEscoSkills`. The matcher then
 *   computes overlap on the ESCO side, keeping the human-facing layer
 *   readable while making the matching internationally grounded.
 *
 *   Cultural domain → inferredEscoSkills → job.requiredEscoSkills
 *
 * ESCO codes follow the pillar-prefixed shape used in the ESCO portal,
 * e.g. "S1.4.1" = "apply critical thinking". Codes here are illustrative
 * pointers into ESCO; the canonical labels remain authoritative.
 */

import { DatasetSource } from "./provenance";

// ─── Cultural domain tags (revising DECISION 1) ─────────────────────────────

export type DomainTag =
  | "payments"
  | "scams"
  | "transport"
  | "food"
  | "music"
  | "slang"
  | "code-switch"
  | "religion"
  | "markets"
  | "agriculture"
  | "family"
  | "technology"
  | "education"
  | "health"
  | "sports";

export const DOMAIN_TAGS: DomainTag[] = [
  "payments",
  "scams",
  "transport",
  "food",
  "music",
  "slang",
  "code-switch",
  "religion",
  "markets",
  "agriculture",
  "family",
  "technology",
  "education",
  "health",
  "sports",
];

// ─── ESCO skill cluster catalog ─────────────────────────────────────────────

export type EscoSkillCode = string;

export type EscoSkill = {
  code: EscoSkillCode;
  label: string;
  pillar:
    | "S1" // Communication, collaboration and creativity
    | "S2" // Information skills
    | "S3" // Assisting and caring
    | "S4" // Management
    | "S5" // Working with computers
    | "S6"; // Handling and moving (rare here)
  source: DatasetSource;
};

const skill = (
  code: EscoSkillCode,
  label: string,
  pillar: EscoSkill["pillar"],
): EscoSkill => ({
  code,
  label,
  pillar,
  source: DatasetSource.ESCO,
});

/**
 * Subset of ESCO skill clusters touched by the prototype.
 * The codes are the canonical identifiers used to cite a competence; the
 * `label` matches ESCO's canonical English label so the UI can render
 * "ESCO S1.4.1 — apply critical thinking".
 */
export const ESCO_CATALOG: Record<EscoSkillCode, EscoSkill> = {
  "S1.0.1": skill("S1.0.1", "communicate effectively", "S1"),
  "S1.4.1": skill("S1.4.1", "apply critical thinking", "S1"),
  "S1.4.5": skill("S1.4.5", "evaluate information critically", "S1"),
  "S1.5.0": skill("S1.5.0", "use linguistic skills", "S1"),
  "S2.1.1": skill("S2.1.1", "analyse information", "S2"),
  "S2.4.0": skill("S2.4.0", "verify information against sources", "S2"),
  "S2.6.0": skill("S2.6.0", "interpret cultural references", "S2"),
  "S4.1.0": skill("S4.1.0", "follow guidelines and procedures", "S4"),
  "S4.5.0": skill("S4.5.0", "review and quality-assure outputs", "S4"),
  "S5.5.1": skill("S5.5.1", "use digital communication tools", "S5"),
  "S5.5.2": skill("S5.5.2", "detect digital fraud and deception patterns", "S5"),
  "S5.6.1": skill("S5.6.1", "use digital tools for finance", "S5"),
  "S5.7.0": skill("S5.7.0", "use mobile services in everyday life", "S5"),
  "S5.7.2": skill("S5.7.2", "navigate urban services and information", "S5"),
};

/**
 * For every cultural-domain tag, declare which ESCO skill clusters the
 * candidate's domain confidence inferentially evidences. Weights (0..1)
 * scale how strongly the domain signals each skill — used by the matcher
 * to compute overlap with `job.requiredEscoSkills`.
 */
export type DomainSkillEvidence = { code: EscoSkillCode; weight: number };

export const DOMAIN_TO_ESCO: Record<DomainTag, DomainSkillEvidence[]> = {
  payments: [
    { code: "S5.6.1", weight: 1.0 },
    { code: "S5.5.1", weight: 0.5 },
    { code: "S5.5.2", weight: 0.4 },
  ],
  scams: [
    { code: "S5.5.2", weight: 1.0 },
    { code: "S2.4.0", weight: 0.8 },
    { code: "S1.4.5", weight: 0.7 },
    { code: "S1.4.1", weight: 0.6 },
  ],
  transport: [
    { code: "S5.7.2", weight: 1.0 },
    { code: "S2.6.0", weight: 0.4 },
  ],
  food: [
    { code: "S2.6.0", weight: 0.8 },
    { code: "S1.0.1", weight: 0.4 },
  ],
  music: [
    { code: "S2.6.0", weight: 0.8 },
    { code: "S1.0.1", weight: 0.4 },
  ],
  slang: [
    { code: "S1.5.0", weight: 1.0 },
    { code: "S2.6.0", weight: 0.7 },
    { code: "S1.0.1", weight: 0.5 },
  ],
  "code-switch": [
    { code: "S1.5.0", weight: 1.0 },
    { code: "S1.0.1", weight: 0.7 },
    { code: "S2.6.0", weight: 0.6 },
  ],
  religion: [
    { code: "S2.6.0", weight: 0.9 },
    { code: "S1.0.1", weight: 0.4 },
  ],
  markets: [
    { code: "S2.6.0", weight: 0.7 },
    { code: "S5.6.1", weight: 0.5 },
    { code: "S1.0.1", weight: 0.4 },
  ],
  agriculture: [
    { code: "S2.6.0", weight: 0.6 },
    { code: "S1.0.1", weight: 0.3 },
  ],
  family: [
    { code: "S2.6.0", weight: 0.7 },
    { code: "S1.0.1", weight: 0.5 },
  ],
  technology: [
    { code: "S5.5.1", weight: 1.0 },
    { code: "S5.7.0", weight: 0.7 },
    { code: "S2.1.1", weight: 0.5 },
  ],
  education: [
    { code: "S1.0.1", weight: 0.7 },
    { code: "S2.1.1", weight: 0.7 },
    { code: "S4.1.0", weight: 0.5 },
  ],
  health: [
    { code: "S2.4.0", weight: 0.8 },
    { code: "S1.0.1", weight: 0.5 },
  ],
  sports: [
    { code: "S2.6.0", weight: 0.5 },
    { code: "S1.0.1", weight: 0.4 },
  ],
};

/**
 * Inverse view: every ESCO skill maps back to one or more cultural-domain
 * tags that evidence it. Useful for explainability ("you showed this skill
 * because of your music + religion + slang answers").
 */
export function domainsForSkill(code: EscoSkillCode): DomainTag[] {
  return DOMAIN_TAGS.filter((tag) =>
    DOMAIN_TO_ESCO[tag].some((evidence) => evidence.code === code),
  );
}

/**
 * Render an ESCO citation for the UI, e.g.
 *   "ESCO S1.4.5 — evaluate information critically"
 */
export function describeEsco(code: EscoSkillCode): string {
  const entry = ESCO_CATALOG[code];
  if (!entry) return `ESCO ${code}`;
  return `ESCO ${code} — ${entry.label}`;
}
