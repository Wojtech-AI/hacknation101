import type { Candidate, TestQuestion, Job, LeaderboardEntry } from "./types";

// ─── Seeded test questions ─────────────────────────────────────────────────────

export const TEST_QUESTIONS: TestQuestion[] = [
  {
    id: "q1",
    type: "grammar",
    prompt: "Which sentence is grammatically correct?",
    options: [
      "The AI model were trained on large dataset.",
      "The AI model was trained on a large dataset.",
      "The AI model have been train on large dataset.",
      "The AI model is train on large datasets.",
    ],
    correct: "The AI model was trained on a large dataset.",
    explanation:
      "The subject 'AI model' is singular, so it takes the singular past tense 'was trained'. The correct article 'a' is required before 'large dataset'.",
  },
  {
    id: "q2",
    type: "factual",
    prompt: "Which of these statements about large language models is factually incorrect?",
    options: [
      "LLMs generate text by predicting the next token based on context.",
      "LLMs have perfect recall of all information they were trained on.",
      "LLMs can produce confident-sounding but incorrect answers.",
      "LLMs are trained on large volumes of text data.",
    ],
    correct: "LLMs have perfect recall of all information they were trained on.",
    explanation:
      "LLMs do not have perfect recall. They compress statistical patterns from training data and often hallucinate or misremember specific facts.",
  },
  {
    id: "q3",
    type: "comparison",
    prompt: "A user asks: 'How do I send money to my family abroad cheaply?' Which AI response is more helpful?",
    context: undefined,
    options: [
      "Response A: 'There are many ways to send money. You should research your options carefully and choose the one that works for you.'",
      "Response B: 'Services like Wise, Remitly, and local mobile money platforms often offer lower fees than banks. Compare exchange rates and fees for your destination country before sending.'",
      "Response A and B are equally helpful.",
      "Neither response is helpful.",
    ],
    correct:
      "Response B: 'Services like Wise, Remitly, and local mobile money platforms often offer lower fees than banks. Compare exchange rates and fees for your destination country before sending.'",
    explanation:
      "Response B gives concrete, actionable information with specific examples. Response A is vague and does not help the user take any action.",
  },
  {
    id: "q4",
    type: "scam",
    prompt: "Which of these messages is most likely a scam?",
    options: [
      "Your bank statement for March is now available in your online banking portal.",
      "URGENT: Your account has been suspended. Click here within 24 hours to verify your identity and avoid permanent closure: www.bank-secure-verify.net",
      "Your electricity bill is due on the 15th. You can pay online, by phone, or at any post office.",
      "The parcel you ordered from Shop Express has been dispatched and will arrive in 3–5 working days.",
    ],
    correct:
      "URGENT: Your account has been suspended. Click here within 24 hours to verify your identity and avoid permanent closure: www.bank-secure-verify.net",
    explanation:
      "This message uses urgency, fear tactics, a suspicious domain, and pressure to click immediately — classic phishing scam patterns.",
  },
  {
    id: "q5",
    type: "tone",
    prompt:
      "A customer complained that their order arrived broken. Which response has the most appropriate professional tone?",
    options: [
      "That's really unfortunate. We'll look into it.",
      "We sincerely apologise that your order arrived damaged. We will arrange an immediate replacement or full refund — whichever you prefer. Our team will follow up within 24 hours.",
      "Packages sometimes get damaged in transit. This is outside our control.",
      "Please contact the courier company as delivery issues are their responsibility.",
    ],
    correct:
      "We sincerely apologise that your order arrived damaged. We will arrange an immediate replacement or full refund — whichever you prefer. Our team will follow up within 24 hours.",
    explanation:
      "This response acknowledges responsibility, apologises sincerely, offers a clear resolution with two options, and gives a timeline — key elements of professional customer service.",
  },
  {
    id: "q6",
    type: "translation",
    prompt:
      "The French phrase 'Il pleut des cordes' literally means 'It is raining ropes'. Which English translation best captures the actual meaning?",
    options: [
      "It is raining ropes outside.",
      "It is raining very heavily.",
      "There are many ropes falling from the sky.",
      "The weather is bad today.",
    ],
    correct: "It is raining very heavily.",
    explanation:
      "'Il pleut des cordes' is a French idiom equivalent to 'it's raining cats and dogs' in English — it means very heavy rain, not a literal description.",
  },
];

// ─── Seeded jobs ───────────────────────────────────────────────────────────────

export const JOBS: Job[] = [
  {
    id: "job-1",
    title: "AI Response Rating",
    description:
      "Review AI-generated responses for accuracy, tone, and helpfulness. Rate each on a 1–5 scale with written justification.",
    requiredLevel: 1,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.08",
    estimatedMinutes: 5,
    fairPayScore: 88,
    riskLevel: "Low",
    growthValue: "Builds evaluation speed and consistency",
  },
  {
    id: "job-2",
    title: "Scam Message Detection",
    description:
      "Classify messages as safe, suspicious, or scam. Flag key warning indicators and explain your reasoning.",
    requiredLevel: 1,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.10",
    estimatedMinutes: 6,
    fairPayScore: 90,
    riskLevel: "Low",
    growthValue: "Develops critical pattern recognition",
  },
  {
    id: "job-3",
    title: "Translation Quality Review",
    description:
      "Compare original text with AI-generated translations. Flag fluency, accuracy, and cultural appropriateness issues.",
    requiredLevel: 2,
    requiredLanguages: ["French", "Portuguese", "Spanish", "Swahili", "Tagalog", "Arabic", "Twi", "Hindi", "Yoruba"],
    payPerTask: "$0.14",
    estimatedMinutes: 8,
    fairPayScore: 92,
    riskLevel: "Low",
    growthValue: "Unlocks multilingual specialist track",
  },
  {
    id: "job-4",
    title: "Factual Verification",
    description:
      "Verify AI-generated factual claims against reliable sources. Write correction notes for each inaccuracy found.",
    requiredLevel: 3,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.18",
    estimatedMinutes: 12,
    fairPayScore: 87,
    riskLevel: "Medium",
    growthValue: "Leads to Reviewer and QA Specialist tiers",
  },
  {
    id: "job-5",
    title: "Cultural Context Review",
    description:
      "Evaluate AI outputs for cultural sensitivity, local relevance, and representation accuracy across diverse communities.",
    requiredLevel: 2,
    requiredLanguages: ["French", "Portuguese", "Spanish", "Swahili", "Arabic", "Tagalog", "Twi", "Yoruba", "Hindi"],
    payPerTask: "$0.16",
    estimatedMinutes: 10,
    fairPayScore: 94,
    riskLevel: "Low",
    growthValue: "High demand, fast progression to Domain Trainer",
  },
  {
    id: "job-6",
    title: "QA Lead Specialist",
    description:
      "Review and calibrate other annotators' outputs. Set quality benchmarks and provide structured feedback.",
    requiredLevel: 4,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.30",
    estimatedMinutes: 15,
    fairPayScore: 91,
    riskLevel: "Low",
    growthValue: "Direct pathway to Team Lead tier",
  },
];

// ─── Seeded leaderboard ────────────────────────────────────────────────────────

export const SEEDED_LEADERBOARD: Omit<LeaderboardEntry, "isCurrentUser">[] = [
  { rank: 1, name: "Amara K.", country: "Ghana", readinessScore: 92, approvedTasks: 47, earnings: "$4.23" },
  { rank: 2, name: "Lívia S.", country: "Brazil", readinessScore: 88, approvedTasks: 39, earnings: "$3.51" },
  { rank: 3, name: "Kavya R.", country: "India", readinessScore: 84, approvedTasks: 31, earnings: "$2.79" },
  { rank: 4, name: "Yassine B.", country: "Morocco", readinessScore: 79, approvedTasks: 22, earnings: "$1.98" },
  { rank: 5, name: "Mika D.", country: "Philippines", readinessScore: 74, approvedTasks: 16, earnings: "$1.44" },
];

// ─── Sample candidates ─────────────────────────────────────────────────────────

export const SAMPLE_CANDIDATES: Candidate[] = [
  {
    id: "cand-001",
    name: "Aina",
    email: "",
    country: "Madagascar",
    languages: ["Malagasy", "French"],
    educationLevel: "Secondary",
    deviceAccess: "Smartphone",
    availability: "Part-time",
  },
  {
    id: "cand-002",
    name: "Amara",
    email: "",
    country: "Ghana",
    languages: ["English", "Twi"],
    educationLevel: "Secondary",
    deviceAccess: "Smartphone + laptop",
    availability: "Full-time",
  },
];

// ─── Sample annotation task ────────────────────────────────────────────────────

export const SAMPLE_ANNOTATION_TASK = {
  taskId: "annot-001",
  title: "Rate this AI customer-service response",
  instruction:
    "Below is an AI-generated response to a customer complaint. Evaluate it for accuracy, tone, and helpfulness.",
  aiResponse:
    "Hello! Thank you for contacting us. We understand your frustration. Your issue has been noted and will be resolved in 3–5 business days. If you have further questions, please visit our FAQ page.",
  customerComplaint:
    "I ordered a product 3 weeks ago, it arrived broken, and nobody has replied to my emails for 10 days.",
};
