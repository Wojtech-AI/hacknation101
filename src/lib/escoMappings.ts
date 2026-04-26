import type { CountryConfig } from "./countryConfigs";

export type EscoMapping = {
  evidence: string;
  signal: string;
  escoCategory: string;
  confidence: string;
};

export function getEscoMappings(config: CountryConfig): EscoMapping[] {
  return [
    {
      evidence: `Corrected inaccurate AI answer about ${config.localTopic}`,
      signal: "Local-context judgement",
      escoCategory: "Language skills and knowledge",
      confidence: "High",
    },
    {
      evidence: `Explained what outsiders usually get wrong: ${config.whatOutsidersGetWrong}`,
      signal: "Cultural-context evaluation",
      escoCategory: "Communication, collaboration and creativity",
      confidence: "High",
    },
    {
      evidence: "Rewrote AI output in locally accurate language",
      signal: "Written communication and editing",
      escoCategory: "Communication",
      confidence: "Medium-high",
    },
    {
      evidence: "Described how they would check local claims using sources and community knowledge",
      signal: "Fact-checking readiness",
      escoCategory: "Information and data literacy",
      confidence: "Medium",
    },
    {
      evidence: "Followed task instructions and explained reasoning clearly",
      signal: "Digital task execution",
      escoCategory: "Working with digital devices and applications",
      confidence: "Medium-high",
    },
  ];
}
