export type LocaleCode = "en" | "fr" | "pt" | "es" | "sw";

export type CountryConfig = {
  id: string;
  country: string;
  region: string;
  uiLocale: LocaleCode;
  userName: string;
  languages: string[];
  localTopic: string;
  badAIAnswer: string;
  correctedAnswer: string;
  whatOutsidersGetWrong: string;
  communityDomains: string[];
  wageBenchmark: string;
  labourSignals: {
    youthNEET: string;
    informalEmployment: string;
    youthUnemployment: string;
    employmentToPopulation: string;
    digitalAccessSignal: string;
  };
  dashboard: {
    usersScreened: number;
    level1Ready: number;
    level2Ready: number;
    level3Ready: number;
    reviewerCandidates: number;
    corrections: number;
    avgTaskQuality: string;
    avgFairWorkScore: string;
    tasksBelowThreshold: number;
    harmfulContentFlagged: number;
    progressingUsers: number;
    mostCommonSkill: string;
    topTrainingGap: string;
    topDomains: string[];
    insights: string[];
  };
};

export const countryConfigs: CountryConfig[] = [
  {
    id: "madagascar",
    country: "Madagascar",
    region: "Antananarivo",
    uiLocale: "fr",
    userName: "Aina",
    languages: ["Malagasy", "French"],
    localTopic: "Romazava and local food culture",
    badAIAnswer: "Romazava is a spicy Malagasy street food usually eaten with bread while walking around markets.",
    correctedAnswer: "Romazava is a traditional Malagasy dish, usually eaten with rice, often made with greens, broth, and meat. It is not typically described as street food eaten with bread.",
    whatOutsidersGetWrong: "They may describe it as street food, miss the rice/home meal context, or treat it as a generic spicy snack.",
    communityDomains: ["local food", "markets", "public transport", "family customs", "youth slang"],
    wageBenchmark: "$1.20/hour local benchmark",
    labourSignals: { youthNEET: "22.4%", informalEmployment: "84.7%", youthUnemployment: "8.9%", employmentToPopulation: "64.2%", digitalAccessSignal: "Mobile-first access" },
    dashboard: { usersScreened: 428, level1Ready: 219, level2Ready: 126, level3Ready: 43, reviewerCandidates: 18, corrections: 1842, avgTaskQuality: "91%", avgFairWorkScore: "88/100", tasksBelowThreshold: 3, harmfulContentFlagged: 12, progressingUsers: 43, mostCommonSkill: "Cultural-context judgement", topTrainingGap: "Fact-checking", topDomains: ["food", "local markets", "public transport", "youth slang", "family/community life"], insights: ["62% of users showed strong local-context judgement", "48% lacked formal higher education but passed Level 1 readiness", "31% were ready for AI-output evaluation after one micro-test", "Top training need: fact-checking and source verification"] },
  },
  {
    id: "ghana",
    country: "Ghana",
    region: "Accra",
    uiLocale: "en",
    userName: "Amara",
    languages: ["English", "Twi", "Ga"],
    localTopic: "mobile money and local market culture",
    badAIAnswer: "Mobile money in Ghana is mainly used by banks and formal companies, and most people need a laptop to access it.",
    correctedAnswer: "Mobile money in Ghana is widely used through phones by individuals, traders, small businesses, and families. It is part of everyday transactions, not only formal banking.",
    whatOutsidersGetWrong: "They may confuse mobile money with formal banking, ignore everyday phone-based use, or miss how traders and families rely on it.",
    communityDomains: ["mobile money", "local markets", "phone repair", "public transport", "youth slang"],
    wageBenchmark: "$1.60/hour local benchmark",
    labourSignals: { youthNEET: "18.7%", informalEmployment: "77.5%", youthUnemployment: "12.1%", employmentToPopulation: "58.8%", digitalAccessSignal: "Mobile-money and smartphone-enabled" },
    dashboard: { usersScreened: 512, level1Ready: 281, level2Ready: 147, level3Ready: 51, reviewerCandidates: 22, corrections: 2134, avgTaskQuality: "89%", avgFairWorkScore: "86/100", tasksBelowThreshold: 5, harmfulContentFlagged: 9, progressingUsers: 51, mostCommonSkill: "Practical local-context judgement", topTrainingGap: "Source verification", topDomains: ["mobile money", "local markets", "phone repair", "transport", "youth slang"], insights: ["67% of users showed strong practical local-context judgement", "52% lacked formal higher education but passed Level 1 readiness", "29% were ready for AI-output evaluation after one micro-test", "Top training need: source verification and written explanation"] },
  },
  {
    id: "brazil",
    country: "Brazil",
    region: "Salvador",
    uiLocale: "pt",
    userName: "Lívia",
    languages: ["Portuguese", "Bahian Portuguese"],
    localTopic: "acarajé and Afro-Brazilian street food culture",
    badAIAnswer: "Acarajé is a simple Brazilian sandwich usually served with cheese and eaten as breakfast in offices.",
    correctedAnswer: "Acarajé is a traditional Afro-Brazilian dish, especially associated with Bahia. It is made from black-eyed pea dough, fried in dendê oil, and often served with fillings such as vatapá, caruru, shrimp, and pepper.",
    whatOutsidersGetWrong: "They may treat it as a generic sandwich, ignore its Afro-Brazilian and Bahian cultural significance, or miss the ingredients and street-food context.",
    communityDomains: ["food", "music", "local markets", "tourism", "religious/cultural traditions"],
    wageBenchmark: "$2.10/hour local benchmark",
    labourSignals: { youthNEET: "19.8%", informalEmployment: "39.4%", youthUnemployment: "16.2%", employmentToPopulation: "54.1%", digitalAccessSignal: "Smartphone and social-media enabled" },
    dashboard: { usersScreened: 604, level1Ready: 336, level2Ready: 176, level3Ready: 64, reviewerCandidates: 27, corrections: 2410, avgTaskQuality: "90%", avgFairWorkScore: "87/100", tasksBelowThreshold: 4, harmfulContentFlagged: 11, progressingUsers: 64, mostCommonSkill: "Local cultural explanation", topTrainingGap: "Source citation", topDomains: ["food", "music", "markets", "tourism", "local slang"], insights: ["58% of users showed strong cultural explanation ability", "44% lacked formal higher education but passed Level 1 readiness", "34% were ready for AI-output evaluation after one micro-test", "Top training need: source citation and factual checking"] },
  },
  {
    id: "kenya",
    country: "Kenya",
    region: "Nairobi",
    uiLocale: "sw",
    userName: "Nia",
    languages: ["Swahili", "English", "Sheng"],
    localTopic: "matatu culture and Nairobi urban transport",
    badAIAnswer: "Matatus are government buses in Kenya that follow quiet formal routes and are mostly booked through office websites.",
    correctedAnswer: "Matatus are privately operated minibuses or vans used widely in Kenya, especially in urban transport. In Nairobi they are often associated with music, visual art, route culture, and informal everyday mobility.",
    whatOutsidersGetWrong: "They may treat matatus as formal government buses and miss the private, cultural, informal and youth-facing side of matatu culture.",
    communityDomains: ["transport", "urban youth slang", "music", "markets", "mobile money"],
    wageBenchmark: "$1.80/hour local benchmark",
    labourSignals: { youthNEET: "17.9%", informalEmployment: "78.1%", youthUnemployment: "13.4%", employmentToPopulation: "60.6%", digitalAccessSignal: "Mobile-money and smartphone-enabled" },
    dashboard: { usersScreened: 548, level1Ready: 309, level2Ready: 153, level3Ready: 56, reviewerCandidates: 24, corrections: 2058, avgTaskQuality: "88%", avgFairWorkScore: "86/100", tasksBelowThreshold: 6, harmfulContentFlagged: 10, progressingUsers: 56, mostCommonSkill: "Urban-context judgement", topTrainingGap: "Guideline consistency", topDomains: ["transport", "mobile money", "youth slang", "markets", "music"], insights: ["64% of users showed strong urban-context judgement", "46% lacked formal higher education but passed Level 1 readiness", "28% were ready for AI-output evaluation after one micro-test", "Top training need: consistent application of evaluation guidelines"] },
  },
  {
    id: "india",
    country: "India",
    region: "Bengaluru",
    uiLocale: "en",
    userName: "Kavya",
    languages: ["English", "Hindi", "Kannada"],
    localTopic: "UPI payments and everyday digital transactions",
    badAIAnswer: "UPI in India is mostly a corporate banking tool used by large companies and is not common for daily small payments.",
    correctedAnswer: "UPI is widely used in India for everyday digital payments, including small purchases, transfers between individuals, shops, delivery services, and local businesses. It is not limited to large companies.",
    whatOutsidersGetWrong: "They may confuse UPI with corporate banking and miss how deeply it is used in daily phone-based transactions.",
    communityDomains: ["digital payments", "local shops", "food delivery", "public transport", "student life"],
    wageBenchmark: "$1.70/hour local benchmark",
    labourSignals: { youthNEET: "23.1%", informalEmployment: "80.3%", youthUnemployment: "15.0%", employmentToPopulation: "52.7%", digitalAccessSignal: "Mobile payments and smartphone-enabled" },
    dashboard: { usersScreened: 720, level1Ready: 402, level2Ready: 212, level3Ready: 79, reviewerCandidates: 33, corrections: 2894, avgTaskQuality: "90%", avgFairWorkScore: "87/100", tasksBelowThreshold: 7, harmfulContentFlagged: 15, progressingUsers: 79, mostCommonSkill: "Digital transaction context", topTrainingGap: "Written explanation quality", topDomains: ["digital payments", "shops", "student life", "transport", "food delivery"], insights: ["69% of users showed strong practical digital-context judgement", "51% lacked formal higher education but passed Level 1 readiness", "33% were ready for AI-output evaluation after one micro-test", "Top training need: clearer written explanation"] },
  },
  {
    id: "south-africa",
    country: "South Africa",
    region: "Johannesburg",
    uiLocale: "en",
    userName: "Thandi",
    languages: ["English", "Zulu", "Xhosa"],
    localTopic: "township taxi ranks and everyday transport culture",
    badAIAnswer: "Taxi ranks in South Africa are formal tourist stations where visitors book private cars in advance through hotel apps.",
    correctedAnswer: "Taxi ranks in South Africa are important everyday transport hubs, especially for minibus taxis used by commuters. They are part of daily mobility, local route knowledge, and informal urban transport systems.",
    whatOutsidersGetWrong: "They may confuse minibus taxi systems with tourist taxis or private booked cars.",
    communityDomains: ["transport", "township life", "local services", "youth slang", "music"],
    wageBenchmark: "$2.00/hour local benchmark",
    labourSignals: { youthNEET: "30.5%", informalEmployment: "35.9%", youthUnemployment: "24.8%", employmentToPopulation: "48.3%", digitalAccessSignal: "Smartphone and platform-access enabled" },
    dashboard: { usersScreened: 466, level1Ready: 244, level2Ready: 119, level3Ready: 45, reviewerCandidates: 19, corrections: 1650, avgTaskQuality: "87%", avgFairWorkScore: "85/100", tasksBelowThreshold: 8, harmfulContentFlagged: 14, progressingUsers: 45, mostCommonSkill: "Transport and social-context judgement", topTrainingGap: "Fact-checking and source verification", topDomains: ["transport", "local services", "music", "youth slang", "community life"], insights: ["61% of users showed strong social-context judgement", "49% lacked formal higher education but passed Level 1 readiness", "27% were ready for AI-output evaluation after one micro-test", "Top training need: fact-checking and source verification"] },
  },
  {
    id: "nigeria",
    country: "Nigeria",
    region: "Lagos",
    uiLocale: "en",
    userName: "Tobi",
    languages: ["English", "Yoruba", "Nigerian Pidgin"],
    localTopic: "Nigerian Pidgin and Lagos market language",
    badAIAnswer: "Nigerian Pidgin is broken English used only by people who cannot speak proper English, and it has no role in business or media.",
    correctedAnswer: "Nigerian Pidgin is a widely used language variety with strong cultural, social, media, and market relevance. It is used across everyday communication, entertainment, trade, and youth culture.",
    whatOutsidersGetWrong: "They may dismiss Pidgin as broken English instead of recognising its social and cultural role.",
    communityDomains: ["markets", "music", "youth slang", "small business", "social media"],
    wageBenchmark: "$1.50/hour local benchmark",
    labourSignals: { youthNEET: "21.6%", informalEmployment: "87.9%", youthUnemployment: "14.7%", employmentToPopulation: "55.4%", digitalAccessSignal: "Smartphone and social-platform enabled" },
    dashboard: { usersScreened: 690, level1Ready: 371, level2Ready: 204, level3Ready: 74, reviewerCandidates: 31, corrections: 2620, avgTaskQuality: "89%", avgFairWorkScore: "86/100", tasksBelowThreshold: 6, harmfulContentFlagged: 13, progressingUsers: 74, mostCommonSkill: "Slang and register judgement", topTrainingGap: "Annotation guideline consistency", topDomains: ["markets", "music", "social media", "youth slang", "small business"], insights: ["66% of users showed strong slang/register judgement", "50% lacked formal higher education but passed Level 1 readiness", "30% were ready for AI-output evaluation after one micro-test", "Top training need: applying annotation rules consistently"] },
  },
  {
    id: "colombia",
    country: "Colombia",
    region: "Medellín",
    uiLocale: "es",
    userName: "Camila",
    languages: ["Spanish", "Paisa Spanish"],
    localTopic: "local Spanish expressions and neighbourhood commerce",
    badAIAnswer: "In Medellín, local neighbourhood shops are mostly formal supermarkets where people only pay by credit card and rarely know the owners.",
    correctedAnswer: "In many Medellín neighbourhoods, small local shops and informal commerce remain important. People may know shop owners personally, use cash or digital payments, and rely on neighbourhood trust and familiarity.",
    whatOutsidersGetWrong: "They may over-formalise neighbourhood commerce and miss local trust, personal relationships, and mixed payment habits.",
    communityDomains: ["neighbourhood commerce", "local slang", "public transport", "food", "youth culture"],
    wageBenchmark: "$1.90/hour local benchmark",
    labourSignals: { youthNEET: "20.2%", informalEmployment: "56.2%", youthUnemployment: "17.5%", employmentToPopulation: "53.9%", digitalAccessSignal: "Smartphone and social-commerce enabled" },
    dashboard: { usersScreened: 488, level1Ready: 266, level2Ready: 138, level3Ready: 52, reviewerCandidates: 21, corrections: 1734, avgTaskQuality: "89%", avgFairWorkScore: "87/100", tasksBelowThreshold: 4, harmfulContentFlagged: 8, progressingUsers: 52, mostCommonSkill: "Neighbourhood-context judgement", topTrainingGap: "Evidence/source support", topDomains: ["local commerce", "slang", "food", "transport", "youth culture"], insights: ["63% of users showed strong neighbourhood-context judgement", "47% lacked formal higher education but passed Level 1 readiness", "32% were ready for AI-output evaluation after one micro-test", "Top training need: supporting corrections with evidence"] },
  },
  {
    id: "morocco",
    country: "Morocco",
    region: "Casablanca",
    uiLocale: "fr",
    userName: "Yassine",
    languages: ["Arabic", "Darija", "French"],
    localTopic: "Darija expressions and Moroccan market etiquette",
    badAIAnswer: "Darija is simply formal Arabic with a few French words, and Moroccan market conversations usually follow fixed prices without bargaining.",
    correctedAnswer: "Darija is a Moroccan Arabic dialect with its own expressions and influences. In many markets, bargaining, politeness, tone, and relationship-building are important parts of everyday interaction.",
    whatOutsidersGetWrong: "They may treat Darija as just formal Arabic, miss code-switching, and misunderstand market etiquette or tone.",
    communityDomains: ["markets", "Darija expressions", "food", "family customs", "urban transport"],
    wageBenchmark: "$1.80/hour local benchmark",
    labourSignals: { youthNEET: "24.0%", informalEmployment: "66.8%", youthUnemployment: "18.1%", employmentToPopulation: "49.8%", digitalAccessSignal: "Smartphone and multilingual digital access" },
    dashboard: { usersScreened: 456, level1Ready: 252, level2Ready: 130, level3Ready: 48, reviewerCandidates: 20, corrections: 1602, avgTaskQuality: "88%", avgFairWorkScore: "86/100", tasksBelowThreshold: 5, harmfulContentFlagged: 10, progressingUsers: 48, mostCommonSkill: "Dialect and etiquette judgement", topTrainingGap: "Formal source verification", topDomains: ["markets", "Darija", "food", "transport", "family customs"], insights: ["65% of users showed strong dialect/context judgement", "45% lacked formal higher education but passed Level 1 readiness", "30% were ready for AI-output evaluation after one micro-test", "Top training need: formal source verification"] },
  },
  {
    id: "philippines",
    country: "Philippines",
    region: "Manila",
    uiLocale: "en",
    userName: "Mika",
    languages: ["English", "Tagalog", "Taglish"],
    localTopic: "Taglish and jeepney commuting culture",
    badAIAnswer: "Jeepneys in the Philippines are private luxury taxis booked mainly by tourists through hotel services.",
    correctedAnswer: "Jeepneys are a common form of public transport in the Philippines, known for fixed routes, shared rides, distinctive designs, and everyday commuting culture.",
    whatOutsidersGetWrong: "They may confuse jeepneys with private taxis and miss route culture, shared commuting, and everyday local usage.",
    communityDomains: ["transport", "Taglish", "food", "student life", "family/community life"],
    wageBenchmark: "$1.60/hour local benchmark",
    labourSignals: { youthNEET: "15.9%", informalEmployment: "58.6%", youthUnemployment: "10.8%", employmentToPopulation: "56.9%", digitalAccessSignal: "Mobile-first and social-platform enabled" },
    dashboard: { usersScreened: 530, level1Ready: 286, level2Ready: 151, level3Ready: 55, reviewerCandidates: 23, corrections: 1986, avgTaskQuality: "89%", avgFairWorkScore: "87/100", tasksBelowThreshold: 4, harmfulContentFlagged: 9, progressingUsers: 55, mostCommonSkill: "Code-switching and transport-context judgement", topTrainingGap: "Written justification", topDomains: ["transport", "Taglish", "food", "student life", "family customs"], insights: ["68% of users showed strong code-switching judgement", "46% lacked formal higher education but passed Level 1 readiness", "31% were ready for AI-output evaluation after one micro-test", "Top training need: written justification and evidence"] },
  },
];

export function getCountryConfig(id?: string | null): CountryConfig {
  return countryConfigs.find((c) => c.id === id) ?? countryConfigs[0];
}

export const disclaimer =
  "Prototype demo: partner names, payments, task volumes, labour-market figures, and dashboard data are simulated for demonstration purposes.";
