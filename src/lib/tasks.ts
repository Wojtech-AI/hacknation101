import type { CountryConfig } from "./countryConfigs";

export type TaskBreakdown = {
  payTransparency: number;
  localWageBenchmark: number;
  harmfulContentRisk: number;
  skillProgressionValue: number;
  consentDataClarity: number;
};

export type Task = {
  id: string;
  title: string;
  provider: string;
  pay: string;
  estimatedTime: string;
  risk: "Low" | "Medium" | "High";
  fairWorkScore: number;
  progression: string;
  breakdown: TaskBreakdown;
  description: string;
};

const task2TitleByCountry: Record<string, string> = {
  madagascar: "Local Food & Culture QA",
  ghana: "Mobile Money & Market Context QA",
  brazil: "Afro-Brazilian Food & Culture QA",
  kenya: "Urban Transport & Sheng Context QA",
  india: "Digital Payments Context QA",
  "south-africa": "Township Transport Context QA",
  nigeria: "Pidgin & Market Language QA",
  colombia: "Neighbourhood Commerce Context QA",
  morocco: "Darija & Market Etiquette QA",
  philippines: "Taglish & Jeepney Culture QA",
};

export function generateTasks(config: CountryConfig): Task[] {
  return [
    {
      id: "task-1",
      title: `${config.languages.join("/")} AI Response Review`,
      provider: "MiraAI Labs via Baobab Data Co-op",
      pay: "$6/hour equivalent",
      estimatedTime: "20 minutes",
      risk: "Low",
      fairWorkScore: 89,
      progression: "Counts toward Level 3",
      breakdown: {
        payTransparency: 22,
        localWageBenchmark: 18,
        harmfulContentRisk: 19,
        skillProgressionValue: 18,
        consentDataClarity: 12,
      },
      description: `Review AI-generated answers about ${config.localTopic} and flag cultural or factual errors.`,
    },
    {
      id: "task-2",
      title: task2TitleByCountry[config.id] ?? "Local Culture QA",
      provider: "MiraAI Labs",
      pay: "$8/hour equivalent",
      estimatedTime: "25 minutes",
      risk: "Low",
      fairWorkScore: 92,
      progression: "Cultural QA badge",
      breakdown: {
        payTransparency: 24,
        localWageBenchmark: 19,
        harmfulContentRisk: 20,
        skillProgressionValue: 19,
        consentDataClarity: 10,
      },
      description: `Evaluate AI answers related to ${config.communityDomains.slice(0, 2).join(" and ")} for accuracy and cultural appropriateness.`,
    },
    {
      id: "task-3",
      title: "Public Service Answer Fact-Check",
      provider: "CivicAssist AI",
      pay: "$9/hour equivalent",
      estimatedTime: "30 minutes",
      risk: "Medium",
      fairWorkScore: 84,
      progression: "Fact-checking reviewer pathway",
      breakdown: {
        payTransparency: 21,
        localWageBenchmark: 18,
        harmfulContentRisk: 15,
        skillProgressionValue: 18,
        consentDataClarity: 12,
      },
      description: "Review AI-generated public service information for factual accuracy and local relevance.",
    },
    {
      id: "task-4",
      title: "Youth Slang Naturalness Review",
      provider: "LinguaBridge AI",
      pay: "$7/hour equivalent",
      estimatedTime: "15 minutes",
      risk: "Low",
      fairWorkScore: 87,
      progression: "Local-language evaluator track",
      breakdown: {
        payTransparency: 22,
        localWageBenchmark: 17,
        harmfulContentRisk: 20,
        skillProgressionValue: 17,
        consentDataClarity: 11,
      },
      description: `Assess whether AI outputs use natural ${config.languages[0]} youth expressions or sound artificial.`,
    },
  ];
}
