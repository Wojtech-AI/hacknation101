export type Company = {
  name: string;
  type: string;
  description: string;
};

export const companies: Company[] = [
  {
    name: "MiraAI Labs",
    type: "AI model company",
    description: "Needs local-language and cultural-context AI response evaluation.",
  },
  {
    name: "Baobab Data Co-op",
    type: "Community data-work partner",
    description: "Provides community-verified annotation and evaluation tasks.",
  },
  {
    name: "Tana Youth Digital Hub",
    type: "Local youth partner",
    description: "Helps onboard young people into digital AI work pathways.",
  },
  {
    name: "LinguaBridge AI",
    type: "Language data partner",
    description: "Sources underrepresented language evaluation tasks.",
  },
  {
    name: "CivicAssist AI",
    type: "Civic AI platform",
    description: "Needs public-service response fact-checking and local-context review.",
  },
];
