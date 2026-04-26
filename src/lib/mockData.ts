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

/**
 * Each job carries a Phase-0.1 annotation block so the matcher can run
 * structured comparisons:
 *   - isco08 / requiredEscoSkills → derived from ILO ISCO-08 + ESCO
 *     (Phase 0a). Drives the explainable "ESCO overlap" portion of the
 *     ranking score.
 *   - requiredScripts / minLanguageLevel / minWeeklyHours → hard filters
 *     used to lock jobs the candidate genuinely can't perform yet.
 *   - preferredDialects → soft bonus for country-specific work.
 *
 * Phase 0.4 expands the catalogue from 6 → 28 to make the /jobs surface
 * feel like a real marketplace. The original 6 ids (job-1..job-6) are
 * preserved so legacy references in tests / dashboards keep working.
 *
 * Distribution (by Level / CEFR floor):
 *   L1 / B1 entry  : 8 jobs   ── high availability, low risk
 *   L2 / B1-B2     : 8 jobs   ── translation, cultural, code-switch
 *   L3 / B2        : 6 jobs   ── verification, RLHF, hallucination
 *   L4 / B2-C1     : 4 jobs   ── senior reviewer, compliance
 *   L5 / C1        : 1 job    ── domain expert
 *   L6 / C2        : 1 job    ── regional programme lead
 */
const ALL_DEMO_DIALECTS = [
  "Bahian Portuguese",
  "Sheng",
  "Darija",
  "Taglish",
  "Nigerian Pidgin",
  "Paisa Spanish",
];

const MULTI_LANGS = [
  "French",
  "Portuguese",
  "Spanish",
  "Swahili",
  "Tagalog",
  "Arabic",
  "Twi",
  "Hindi",
  "Yoruba",
];

export const JOBS: Job[] = [
  // ─── Level 1 — entry tier (B1) ─────────────────────────────────────────
  {
    id: "job-1",
    title: "Customer-service AI reply review",
    description:
      "Read AI-drafted replies to real customer messages from your country and flag where the model misses local context, tone, or workflow. Rate each on a 1–5 scale with a written, locally-grounded justification.",
    requiredLevel: 1,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.08",
    estimatedMinutes: 5,
    fairPayScore: 88,
    riskLevel: "Low",
    growthValue: "Builds evaluation speed and consistency",
    isco08: "2643",
    requiredEscoSkills: ["S1.4.5", "S2.6.0", "S1.5.0", "S1.0.1"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B1",
    minWeeklyHours: 2,
    culturalLanes: {
      ghana: {
        lane: "MoMo agent disputes, GhanaPay phishing replies, MTN OTP-share callbacks, trotro complaint threads.",
        domains: ["payments", "scams", "transport"],
      },
      kenya: {
        lane: "M-Pesa Lipa Na escalations, Safaricom support callbacks, matatu-Sacco disputes, boda-boda accident replies.",
        domains: ["payments", "transport", "scams"],
      },
      nigeria: {
        lane: "GTBank / OPay / PalmPay support replies, fake-bank-alert disputes, NEPA / DisCo billing escalations.",
        domains: ["payments", "scams"],
      },
      india: {
        lane: "PhonePe / GPay / Paytm refund replies, UPI 'collect-request' disputes, Swiggy / Zomato Hinglish complaints.",
        domains: ["payments", "scams", "code-switch"],
      },
      brazil: {
        lane: "Pix dispute replies, golpe-do-clone WhatsApp threads, iFood / Mercado Livre escalations in PT-BR.",
        domains: ["payments", "scams"],
      },
      "south-africa": {
        lane: "Capitec / TymeBank support replies, Vodacom airtime disputes, mixed isiZulu/English customer threads.",
        domains: ["payments", "code-switch"],
      },
      morocco: {
        lane: "Inwi / Maroc Telecom disputes, Glovo Casa support in Darija/French code-switch, banque populaire escalations.",
        domains: ["code-switch", "payments"],
      },
      colombia: {
        lane: "Nequi / Daviplata replies, Rappi escalations in paisa Spanish, Claro / Movistar billing disputes.",
        domains: ["payments", "slang"],
      },
      philippines: {
        lane: "GCash / Maya support replies, Lazada / Shopee escalations in Taglish, BDO / GSIS callback threads.",
        domains: ["payments", "code-switch"],
      },
      madagascar: {
        lane: "Orange Money / Airtel Money disputes, Telma callback threads in Malagasy/French code-switch.",
        domains: ["payments", "code-switch"],
      },
    },
  },
  {
    id: "job-2",
    title: "Mobile-money & messaging scam detection",
    description:
      "Classify mobile-money and messaging-app scam attempts (SMS, WhatsApp, in-app) as safe, suspicious, or scam. Flag the warning pattern (OTP-share request, fake-pay screenshot, clone-account, etc.) and explain why locally.",
    requiredLevel: 1,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.10",
    estimatedMinutes: 6,
    fairPayScore: 90,
    riskLevel: "Low",
    growthValue: "Develops critical pattern recognition",
    isco08: "2421",
    requiredEscoSkills: ["S5.5.2", "S2.4.0", "S1.4.1", "S1.4.5"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B1",
    minWeeklyHours: 2,
    culturalLanes: {
      ghana: { lane: "MoMo OTP-share scams, GhanaPay phishing, MTN reversal-callback fraud, Vodafone airtime tricks.", domains: ["scams", "payments"] },
      kenya: { lane: "M-Pesa fake-pay screenshots, Safaricom impersonation calls, Lipa Na receipt forgery.", domains: ["scams", "payments"] },
      nigeria: { lane: "GTBank / Access fake-debit SMS, OPay impersonation, OTP-share callback scams, fake fuel-subsidy alerts.", domains: ["scams", "payments"] },
      india: { lane: "UPI 'collect-request' scams, KYC-expiry SMS, fake Amazon refund calls, electricity-bill phishing.", domains: ["scams", "payments"] },
      brazil: { lane: "Golpe do Pix, WhatsApp clone messages, falso boleto, falso entregador iFood, falsa central do banco.", domains: ["scams", "payments"] },
      "south-africa": { lane: "FNB / Capitec OTP-share callbacks, SARS impersonation SMS, fake load-shedding refunds.", domains: ["scams", "payments"] },
      morocco: { lane: "Inwi recharge phishing, fake CIH banque SMS, WhatsApp impersonation in Darija, false delivery messages.", domains: ["scams", "payments"] },
      colombia: { lane: "Nequi / Daviplata impersonation, falsa devolución Rappi, falso DIAN, suplantación bancaria.", domains: ["scams", "payments"] },
      philippines: { lane: "GCash mistakenly-sent reversal scams, fake Lazada refund SMS, fake-pay screenshot ploys.", domains: ["scams", "payments"] },
      madagascar: { lane: "Orange Money OTP-share callbacks, false 'mandataire' SMS, Telma recharge scams.", domains: ["scams", "payments"] },
    },
  },
  {
    id: "job-7",
    title: "Customer-service reply tone calibration",
    description:
      "Rank pairs of AI-drafted customer-service replies for tone, helpfulness, and *register fit* — does the reply sound like how customer service actually speaks in your country, or is it tone-deaf corporate boilerplate?",
    requiredLevel: 1,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.09",
    estimatedMinutes: 4,
    fairPayScore: 89,
    riskLevel: "Low",
    growthValue: "Anchor task for Tone Calibrator track",
    isco08: "4222",
    requiredEscoSkills: ["S1.0.1", "S1.4.5", "S2.6.0"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B1",
    minWeeklyHours: 2,
    culturalLanes: {
      ghana: { lane: "Twi-English BPO replies, polite-but-firm GhanaPay support tone, MTN trotro-style escalation.", domains: ["code-switch", "slang"] },
      kenya: { lane: "Sheng-aware BPO replies, M-Pesa support warmth, matatu-Sacco friendly-firm escalation.", domains: ["code-switch", "slang"] },
      nigeria: { lane: "Pidgin / English BPO replies, Lagos-tone politeness, GTBank firm-but-cordial escalations.", domains: ["code-switch", "slang"] },
      india: { lane: "Hinglish BPO replies, 'sir/ma'am' register, Hindi-English customer-care politeness ladder.", domains: ["code-switch", "slang"] },
      brazil: { lane: "Brazilian-Portuguese warmth, 'tudo bem' opener, polite-but-direct closing in PT-BR.", domains: ["slang", "code-switch"] },
      "south-africa": { lane: "Mixed isiZulu/English politeness markers, Cape-Town friendly-firm tone, Joburg-direct register.", domains: ["code-switch", "slang"] },
      morocco: { lane: "Darija-French code-switched politeness, 'khouya' familiarity, Casa-style firm friendliness.", domains: ["code-switch"] },
      colombia: { lane: "Paisa warmth ('parce', 'a la orden'), Bogotá-formal register, costeño tropical politeness.", domains: ["slang", "code-switch"] },
      philippines: { lane: "Taglish 'po/opo' politeness, BPO 'rest assured' opener, warm-but-direct close.", domains: ["code-switch", "slang"] },
      madagascar: { lane: "Malagasy-French code-switched politeness, fihavanana-aware firmness.", domains: ["code-switch"] },
    },
  },
  {
    id: "job-8",
    title: "Search Result Quality Rating",
    description:
      "Judge whether the top AI-ranked search snippets actually answer common everyday queries (recipes, transit, payments).",
    requiredLevel: 1,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.07",
    estimatedMinutes: 4,
    fairPayScore: 86,
    riskLevel: "Low",
    growthValue: "Feeds search-relevance training pipelines",
    isco08: "2511",
    requiredEscoSkills: ["S1.4.5", "S2.1.1", "S5.5.1"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B1",
    minWeeklyHours: 2,
  },
  {
    id: "job-9",
    title: "Voice samples in your local language",
    description:
      "Read short prompts in your local language and dialect so speech models learn how you actually speak — pronunciation, prosody, and code-switching included. No editing or rating required.",
    requiredLevel: 1,
    requiredLanguages: [...MULTI_LANGS, "English"],
    payPerTask: "$0.06",
    estimatedMinutes: 3,
    fairPayScore: 84,
    riskLevel: "Low",
    growthValue: "On-ramp for speech-data specialists",
    isco08: "2643",
    requiredEscoSkills: ["S1.0.1", "S1.5.0"],
    requiredScripts: [],
    minLanguageLevel: "A2",
    minWeeklyHours: 1,
    preferredDialects: ALL_DEMO_DIALECTS,
    culturalLanes: {
      ghana: { lane: "Twi, Ga, and Pidgin samples; Twi-English code-switched market dialogue.", domains: ["slang", "code-switch"] },
      kenya: { lane: "Swahili, Sheng, and English samples; matatu-conductor calls and mama mboga market dialogue.", domains: ["code-switch", "slang"] },
      nigeria: { lane: "Yoruba, Igbo, Hausa, and Pidgin samples; market and BPO call-floor speech.", domains: ["code-switch", "slang"] },
      india: { lane: "Hindi, Kannada, Tamil, and Hinglish samples; daily UPI / WhatsApp / metro speech.", domains: ["code-switch", "slang"] },
      brazil: { lane: "PT-BR plus regional dialects (paulista, carioca, nordestino, baiano); samba-circle and feira speech.", domains: ["slang"] },
      "south-africa": { lane: "isiZulu, isiXhosa, Afrikaans, and township-English samples; taxi-rank speech.", domains: ["code-switch", "slang"] },
      morocco: { lane: "Darija, Tamazight, and Darija-French code-switched samples; souk and BPO-floor speech.", domains: ["code-switch"] },
      colombia: { lane: "Paisa, costeño, rolo, and pastuso samples; barrio and tienda speech.", domains: ["slang"] },
      philippines: { lane: "Tagalog, Taglish, Cebuano, Ilocano samples; jeepney and palengke speech.", domains: ["code-switch", "slang"] },
      madagascar: { lane: "Malagasy and Malagasy-French code-switched samples; bazaar and family-table speech.", domains: ["code-switch"] },
    },
  },
  {
    id: "job-10",
    title: "Local-life image caption verification",
    description:
      "Confirm whether AI-generated captions actually describe what's in the photo — markets, transport, food, festivals, family scenes — *as they appear in your country*. Flag wrong product names, wrong dishes, wrong dress, wrong workflow.",
    requiredLevel: 1,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.07",
    estimatedMinutes: 4,
    fairPayScore: 87,
    riskLevel: "Low",
    growthValue: "Builds vision-language QA experience",
    isco08: "2643",
    requiredEscoSkills: ["S2.6.0", "S1.4.5", "S1.0.1"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B1",
    minWeeklyHours: 2,
    culturalLanes: {
      ghana: { lane: "Jollof / waakye / banku photos, Makola market scenes, trotro queues, kente weave.", domains: ["food", "markets", "transport"] },
      kenya: { lane: "Ugali / nyama choma photos, matatu graffiti scenes, Eastleigh markets, Maasai dress.", domains: ["food", "markets", "transport"] },
      nigeria: { lane: "Jollof / suya / akara photos, danfo bus scenes, Yaba markets, agbada / gele dress.", domains: ["food", "markets", "transport"] },
      india: { lane: "Thali / chaat / dosa photos, auto-rickshaw scenes, sabzi mandi, sari / kurta dress.", domains: ["food", "markets", "transport"] },
      brazil: { lane: "Acarajé / feijoada / pão de queijo photos, feira scenes, Carnaval costumes, samba-circle.", domains: ["food", "markets", "music"] },
      "south-africa": { lane: "Bunny chow / pap / vetkoek photos, taxi-rank scenes, township stoep, Madiba shirts.", domains: ["food", "markets", "transport"] },
      morocco: { lane: "Tajine / msemen / harira photos, souk scenes, djellaba / kaftan dress, riad architecture.", domains: ["food", "markets"] },
      colombia: { lane: "Bandeja paisa / arepas / sancocho photos, plazas de mercado, cumbia outfits.", domains: ["food", "markets", "music"] },
      philippines: { lane: "Sinigang / adobo / halo-halo photos, jeepney scenes, palengke, barong / Maria Clara dress.", domains: ["food", "markets", "transport"] },
      madagascar: { lane: "Romazava / mofo gasy / ravitoto photos, Tsena Ambohitsoa market, lamba dress, salegy dance.", domains: ["food", "markets", "music"] },
    },
  },
  {
    id: "job-11",
    title: "Code-switched sentiment tag verification",
    description:
      "Verify whether AI-suggested sentiment tags (positive / neutral / negative / sarcasm / urgent) match short user messages — including code-switched and slang-heavy ones the model often gets backwards.",
    requiredLevel: 1,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.06",
    estimatedMinutes: 3,
    fairPayScore: 88,
    riskLevel: "Low",
    growthValue: "Develops baseline annotation discipline",
    isco08: "2643",
    requiredEscoSkills: ["S1.4.5", "S2.1.1"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B1",
    minWeeklyHours: 2,
    culturalLanes: {
      ghana: { lane: "Twi-English WhatsApp messages, Pidgin reactions, Accra-customer venting.", domains: ["code-switch", "slang"] },
      kenya: { lane: "Sheng + Swahili + English reactions, Twitter Kenya threads, M-Pesa support venting.", domains: ["code-switch", "slang"] },
      nigeria: { lane: "Pidgin + English + Yoruba reactions, NEPA-frustration tweets, market-banter sentiment.", domains: ["code-switch", "slang"] },
      india: { lane: "Hinglish reviews, sarcasm in Twitter India threads, urgency-marker recognition.", domains: ["code-switch", "slang"] },
      brazil: { lane: "PT-BR reviews with regional slang (mano, parça, dale), iFood ratings, Pix-related vent threads.", domains: ["slang", "code-switch"] },
      "south-africa": { lane: "Mixed isiZulu/English reactions, township-English sarcasm, load-shedding tweets.", domains: ["code-switch", "slang"] },
      morocco: { lane: "Darija-French code-switched reviews, urgency / frustration markers in Casa support threads.", domains: ["code-switch"] },
      colombia: { lane: "Paisa, costeño, rolo slang in reviews; Rappi-rating sarcasm; double-meaning detection.", domains: ["slang", "code-switch"] },
      philippines: { lane: "Taglish reviews, BPO-floor sentiment, 'po' politeness vs sarcasm distinction.", domains: ["code-switch", "slang"] },
      madagascar: { lane: "Malagasy-French code-switched reviews, fihavanana-aware sentiment markers.", domains: ["code-switch"] },
    },
  },
  {
    id: "job-12",
    title: "Survey Response Quality Check",
    description:
      "Flag survey responses that look automated, contradictory, or off-topic. Pure structured judgement.",
    requiredLevel: 1,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.08",
    estimatedMinutes: 5,
    fairPayScore: 90,
    riskLevel: "Low",
    growthValue: "Common stepping-stone to factual verification",
    isco08: "2421",
    requiredEscoSkills: ["S2.4.0", "S1.4.5", "S1.4.1"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B1",
    minWeeklyHours: 2,
  },

  // ─── Level 2 — multilingual & cultural (B1-B2) ─────────────────────────
  {
    id: "job-3",
    title: "Translation review (EN ↔ your language)",
    description:
      "Compare AI-generated translations against the original text in your language pair. Flag fluency, accuracy, register, idiom, and cultural-appropriateness errors — especially the kind that only a native or near-native speaker catches.",
    requiredLevel: 2,
    requiredLanguages: MULTI_LANGS,
    payPerTask: "$0.14",
    estimatedMinutes: 8,
    fairPayScore: 92,
    riskLevel: "Low",
    growthValue: "Unlocks multilingual specialist track",
    isco08: "2643",
    requiredEscoSkills: ["S1.5.0", "S2.6.0", "S4.5.0", "S1.0.1"],
    requiredScripts: [],
    minLanguageLevel: "B2",
    minWeeklyHours: 4,
    preferredDialects: ALL_DEMO_DIALECTS,
    culturalLanes: {
      ghana: { lane: "EN ↔ Twi / Ga / Pidgin pairs; idioms, proverbs, and market register.", domains: ["code-switch", "slang"] },
      kenya: { lane: "EN ↔ Swahili / Sheng pairs; matatu slang, M-Pesa terminology, Sheng-coined verbs.", domains: ["code-switch", "slang"] },
      nigeria: { lane: "EN ↔ Yoruba / Igbo / Hausa / Pidgin pairs; honorifics and proverbs.", domains: ["code-switch", "slang"] },
      india: { lane: "EN ↔ Hindi / Kannada / Tamil pairs; Hinglish register, formal/informal pronouns.", domains: ["code-switch", "slang"] },
      brazil: { lane: "EN ↔ PT-BR pairs (paulista / carioca / nordestino); regionalisms and gíria.", domains: ["slang"] },
      "south-africa": { lane: "EN ↔ isiZulu / isiXhosa / Afrikaans pairs; township English idioms.", domains: ["code-switch", "slang"] },
      morocco: { lane: "EN/FR ↔ Darija / Tamazight pairs; code-switching expectations.", domains: ["code-switch"] },
      colombia: { lane: "EN ↔ ES (paisa / costeño / rolo) pairs; regional double-meanings.", domains: ["slang"] },
      philippines: { lane: "EN ↔ Tagalog / Cebuano / Taglish pairs; 'po' / 'opo' politeness markers.", domains: ["code-switch", "slang"] },
      madagascar: { lane: "FR/EN ↔ Malagasy pairs; honorifics and proverbs.", domains: ["code-switch"] },
    },
  },
  {
    id: "job-5",
    title: "Cultural context review",
    description:
      "Evaluate AI outputs for cultural sensitivity, local relevance, and representation accuracy — calling out misrepresented dishes, dress, religious frames, family structures, and political shorthand the model gets wrong.",
    requiredLevel: 2,
    requiredLanguages: MULTI_LANGS,
    payPerTask: "$0.16",
    estimatedMinutes: 10,
    fairPayScore: 94,
    riskLevel: "Low",
    growthValue: "High demand, fast progression to Domain Trainer",
    isco08: "2643",
    requiredEscoSkills: ["S2.6.0", "S1.5.0", "S1.0.1", "S1.4.5"],
    requiredScripts: [],
    minLanguageLevel: "B1",
    minWeeklyHours: 3,
    preferredDialects: ALL_DEMO_DIALECTS,
  },
  {
    id: "job-13",
    title: "Tone Calibration for Customer-Service AI",
    description:
      "Rate AI customer-service drafts on warmth, accountability, and clarity. Suggest a 1-line rewrite for poor outputs.",
    requiredLevel: 2,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.13",
    estimatedMinutes: 7,
    fairPayScore: 91,
    riskLevel: "Low",
    growthValue: "Anchor specialism for tone-aware models",
    isco08: "2435",
    requiredEscoSkills: ["S1.0.1", "S2.6.0", "S1.4.5"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B2",
    minWeeklyHours: 3,
  },
  {
    id: "job-14",
    title: "Spam vs Legitimate Email Classification",
    description:
      "Tag emails as legitimate, marketing, phishing, or scam. Flag locally-targeted patterns that global filters miss.",
    requiredLevel: 2,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.12",
    estimatedMinutes: 6,
    fairPayScore: 89,
    riskLevel: "Low",
    growthValue: "Direct route to Trust & Safety reviewer",
    isco08: "2421",
    requiredEscoSkills: ["S5.5.2", "S2.4.0", "S1.4.1"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B1",
    minWeeklyHours: 3,
  },
  {
    id: "job-15",
    title: "Local-Language Slang Annotation",
    description:
      "Annotate slang and informal phrases in your local language with meaning, register, and example sentences.",
    requiredLevel: 2,
    requiredLanguages: MULTI_LANGS,
    payPerTask: "$0.18",
    estimatedMinutes: 9,
    fairPayScore: 95,
    riskLevel: "Low",
    growthValue: "Premium pay for low-resource languages",
    isco08: "2643",
    requiredEscoSkills: ["S1.5.0", "S2.6.0", "S1.0.1"],
    requiredScripts: [],
    minLanguageLevel: "B2",
    minWeeklyHours: 4,
    preferredDialects: ALL_DEMO_DIALECTS,
  },
  {
    id: "job-16",
    title: "Code-Switching Annotation",
    description:
      "Mark up code-switched conversations (e.g. Taglish, Sheng, Spanglish) with language tags at the word and phrase level.",
    requiredLevel: 2,
    requiredLanguages: ["English", "Tagalog", "Swahili", "Spanish", "French", "Portuguese", "Arabic"],
    payPerTask: "$0.20",
    estimatedMinutes: 10,
    fairPayScore: 94,
    riskLevel: "Low",
    growthValue: "Premium specialism — multilingual NLP demand",
    isco08: "2643",
    requiredEscoSkills: ["S1.5.0", "S2.6.0", "S1.0.1"],
    requiredScripts: [],
    minLanguageLevel: "B2",
    minWeeklyHours: 4,
    preferredDialects: ALL_DEMO_DIALECTS,
  },
  {
    id: "job-17",
    title: "Receipt & Document Field Extraction",
    description:
      "Mark up scanned receipts, invoices, and forms — vendor, total, date, line items. Includes local currencies.",
    requiredLevel: 2,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.11",
    estimatedMinutes: 6,
    fairPayScore: 87,
    riskLevel: "Low",
    growthValue: "Stepping-stone to financial-document specialist",
    isco08: "4419",
    requiredEscoSkills: ["S5.6.1", "S5.5.1", "S4.1.0"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B1",
    minWeeklyHours: 4,
  },
  {
    id: "job-18",
    title: "Health Information Quality Review",
    description:
      "Flag AI-generated health snippets that contradict WHO / national health-ministry guidance. No clinical advice — pattern-matching against trusted sources.",
    requiredLevel: 2,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.15",
    estimatedMinutes: 9,
    fairPayScore: 92,
    riskLevel: "Medium",
    growthValue: "Pathway to Health Domain Trainer",
    isco08: "2422",
    requiredEscoSkills: ["S2.4.0", "S1.4.5", "S2.1.1"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B2",
    minWeeklyHours: 4,
  },

  // ─── Level 3 — verification & RLHF (B2) ────────────────────────────────
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
    isco08: "2642",
    requiredEscoSkills: ["S2.4.0", "S2.1.1", "S1.4.5", "S1.4.1"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B2",
    minWeeklyHours: 5,
  },
  {
    id: "job-19",
    title: "AI Hallucination Detection",
    description:
      "Read AI long-form answers and flag specific sentences that introduce facts not supported by source material.",
    requiredLevel: 3,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.22",
    estimatedMinutes: 12,
    fairPayScore: 91,
    riskLevel: "Medium",
    growthValue: "High-leverage role for safety-critical models",
    isco08: "2642",
    requiredEscoSkills: ["S2.4.0", "S1.4.5", "S2.1.1"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B2",
    minWeeklyHours: 5,
  },
  {
    id: "job-20",
    title: "RLHF Preference Comparison",
    description:
      "Pick which of two AI completions better follows the prompt's intent and constraints. Justify briefly. Trains reward models.",
    requiredLevel: 3,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.20",
    estimatedMinutes: 8,
    fairPayScore: 90,
    riskLevel: "Low",
    growthValue: "Core RLHF skill — wide applicability",
    isco08: "2511",
    requiredEscoSkills: ["S1.4.5", "S1.4.1", "S2.1.1"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B2",
    minWeeklyHours: 6,
  },
  {
    id: "job-21",
    title: "Long-form AI Article Editing",
    description:
      "Lightly edit AI-generated long-form articles for clarity, flow, and factual integrity. Track changes inline.",
    requiredLevel: 3,
    requiredLanguages: ["English"],
    payPerTask: "$0.28",
    estimatedMinutes: 18,
    fairPayScore: 88,
    riskLevel: "Low",
    growthValue: "Pathway to senior content reviewer",
    isco08: "2641",
    requiredEscoSkills: ["S1.5.0", "S4.5.0", "S1.0.1"],
    requiredScripts: ["latin"],
    minLanguageLevel: "C1",
    minWeeklyHours: 6,
  },
  {
    id: "job-22",
    title: "Multilingual Named-Entity Recognition",
    description:
      "Tag named entities (people, places, organisations, currencies, products) in multilingual text snippets.",
    requiredLevel: 3,
    requiredLanguages: MULTI_LANGS,
    payPerTask: "$0.19",
    estimatedMinutes: 10,
    fairPayScore: 91,
    riskLevel: "Low",
    growthValue: "Foundational NER specialism",
    isco08: "2643",
    requiredEscoSkills: ["S1.5.0", "S2.1.1", "S2.6.0"],
    requiredScripts: [],
    minLanguageLevel: "B2",
    minWeeklyHours: 5,
  },
  {
    id: "job-23",
    title: "Educational Content Review",
    description:
      "Review AI-generated lesson summaries, quiz questions, and explainers for grade-appropriateness and pedagogical quality.",
    requiredLevel: 3,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.21",
    estimatedMinutes: 12,
    fairPayScore: 92,
    riskLevel: "Low",
    growthValue: "Pathway to EdTech Domain Trainer",
    isco08: "2353",
    requiredEscoSkills: ["S1.0.1", "S2.1.1", "S4.1.0"],
    requiredScripts: ["latin"],
    minLanguageLevel: "B2",
    minWeeklyHours: 6,
  },

  // ─── Level 4 — senior reviewer / compliance (B2-C1) ────────────────────
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
    isco08: "1213",
    requiredEscoSkills: ["S4.5.0", "S4.1.0", "S1.4.1", "S2.1.1"],
    requiredScripts: ["latin"],
    minLanguageLevel: "C1",
    minWeeklyHours: 8,
  },
  {
    id: "job-24",
    title: "Compliance & Safety Content Review",
    description:
      "Audit AI outputs for compliance with regional content rules (financial, medical, electoral). Detailed written rationale required.",
    requiredLevel: 4,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.34",
    estimatedMinutes: 20,
    fairPayScore: 93,
    riskLevel: "Medium",
    growthValue: "High-trust gateway to Trust & Safety lead roles",
    isco08: "2422",
    requiredEscoSkills: ["S4.1.0", "S2.4.0", "S1.4.1", "S4.5.0"],
    requiredScripts: ["latin"],
    minLanguageLevel: "C1",
    minWeeklyHours: 8,
  },
  {
    id: "job-25",
    title: "Senior Translation Reviewer",
    description:
      "Final-pass review on multilingual translations. Calibrate junior reviewers and write style-guide notes for your language pair.",
    requiredLevel: 4,
    requiredLanguages: MULTI_LANGS,
    payPerTask: "$0.36",
    estimatedMinutes: 18,
    fairPayScore: 95,
    riskLevel: "Low",
    growthValue: "Premium tier · feeds language-pair leadership",
    isco08: "2643",
    requiredEscoSkills: ["S1.5.0", "S4.5.0", "S2.6.0", "S1.0.1"],
    requiredScripts: [],
    minLanguageLevel: "C1",
    minWeeklyHours: 8,
    preferredDialects: ALL_DEMO_DIALECTS,
  },
  {
    id: "job-26",
    title: "Domain Trainer — Cultural / Local",
    description:
      "Author training prompts and rubrics for region-specific AI evaluation. Calibrate model behaviour for your community.",
    requiredLevel: 4,
    requiredLanguages: MULTI_LANGS,
    payPerTask: "$0.40",
    estimatedMinutes: 25,
    fairPayScore: 96,
    riskLevel: "Low",
    growthValue: "Top of cultural-context ladder",
    isco08: "2632",
    requiredEscoSkills: ["S2.6.0", "S4.5.0", "S1.5.0", "S4.1.0"],
    requiredScripts: [],
    minLanguageLevel: "C1",
    minWeeklyHours: 10,
    preferredDialects: ALL_DEMO_DIALECTS,
  },

  // ─── Level 5 — domain expert (C1) ──────────────────────────────────────
  {
    id: "job-27",
    title: "Multilingual Dataset Auditor",
    description:
      "Audit multilingual training datasets for bias, representation, and coverage gaps. Produce a written audit report per dataset.",
    requiredLevel: 5,
    requiredLanguages: ["English", ...MULTI_LANGS],
    payPerTask: "$0.45",
    estimatedMinutes: 30,
    fairPayScore: 95,
    riskLevel: "Medium",
    growthValue: "Senior specialism · feeds programme-lead roles",
    isco08: "2511",
    requiredEscoSkills: ["S2.1.1", "S2.4.0", "S4.5.0", "S1.5.0"],
    requiredScripts: [],
    minLanguageLevel: "C1",
    minWeeklyHours: 10,
    preferredDialects: ALL_DEMO_DIALECTS,
  },

  // ─── Level 6 — programme lead (C2) ─────────────────────────────────────
  {
    id: "job-28",
    title: "Regional Programme Coordinator",
    description:
      "Coordinate annotation cohorts across a region. Calibrate quality, manage payments, and report metrics back to clients.",
    requiredLevel: 6,
    requiredLanguages: ["English", "Any"],
    payPerTask: "$0.50",
    estimatedMinutes: 30,
    fairPayScore: 94,
    riskLevel: "Low",
    growthValue: "Top tier · transitions into permanent contracts",
    isco08: "1213",
    requiredEscoSkills: ["S4.1.0", "S4.5.0", "S1.0.1", "S2.1.1"],
    requiredScripts: ["latin"],
    minLanguageLevel: "C2",
    minWeeklyHours: 15,
  },
];

// ─── Seeded leaderboard ────────────────────────────────────────────────────────

// Pilot-cohort earnings: roughly $200–$300 over ~25–35 hours of work at the
// L4–L5 fair-pay rates ($12–$16/hr). Approved-task counts are scaled so the
// implied per-task pay (~$0.45–$0.55) lines up with the ladder economics.
export const SEEDED_LEADERBOARD: Omit<LeaderboardEntry, "isCurrentUser">[] = [
  { rank: 1, name: "Amara K.", country: "Ghana", readinessScore: 92, approvedTasks: 642, earnings: "$298.40" },
  { rank: 2, name: "Lívia S.", country: "Brazil", readinessScore: 88, approvedTasks: 537, earnings: "$264.15" },
  { rank: 3, name: "Kavya R.", country: "India", readinessScore: 84, approvedTasks: 451, earnings: "$229.80" },
  { rank: 4, name: "Yassine B.", country: "Morocco", readinessScore: 79, approvedTasks: 372, earnings: "$198.55" },
  { rank: 5, name: "Mika D.", country: "Philippines", readinessScore: 74, approvedTasks: 296, earnings: "$162.20" },
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
