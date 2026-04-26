import type { LocaleCode } from "./countryConfigs";
import {
  getCachedAutoTranslation,
  requestAutoTranslation,
} from "./autoTranslate";

// ─── Supported locales registry (single source of truth) ────────────────────
// Components must read from this dynamically — no hardcoded language lists.
//
// Coverage tiers
//   - "full":     every UI string is translated
//   - "partial":  questionnaire core + key UI strings translated, rest falls back
//   - "fallback": no own dictionary; UI follows the `fallback` chain (parent
//                 language) — typical for dialects / code-switched varieties
//
// fallback chain example: "bahian" -> "pt" -> "en"
export type LocaleCoverage = "full" | "partial" | "fallback";

export type LocaleMeta = {
  code: LocaleCode;
  name: string;
  nativeName: string;
  flag: string;
  coverage: LocaleCoverage;
  /** Locale to fall back to for missing keys. End of chain falls back to "en". */
  fallback?: LocaleCode;
};

export const SUPPORTED_LOCALES: Record<LocaleCode, LocaleMeta> = {
  // ── Tier 1: full UI ─────────────────────────────────────────────────────
  en: { code: "en", name: "English", nativeName: "English", flag: "🌍", coverage: "full" },
  fr: { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", coverage: "full", fallback: "en" },
  pt: { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹", coverage: "full", fallback: "en" },
  es: { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", coverage: "full", fallback: "en" },
  sw: { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪", coverage: "full", fallback: "en" },

  // ── Tier 2: partial UI (key strings translated, English fallback) ───────
  mg: { code: "mg", name: "Malagasy", nativeName: "Malagasy", flag: "🇲🇬", coverage: "partial", fallback: "fr" },
  tw: { code: "tw", name: "Twi", nativeName: "Twi", flag: "🇬🇭", coverage: "partial", fallback: "en" },
  gaa: { code: "gaa", name: "Ga", nativeName: "Gã", flag: "🇬🇭", coverage: "partial", fallback: "en" },
  hi: { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", coverage: "partial", fallback: "en" },
  kn: { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", coverage: "partial", fallback: "en" },
  zu: { code: "zu", name: "Zulu", nativeName: "isiZulu", flag: "🇿🇦", coverage: "partial", fallback: "en" },
  xh: { code: "xh", name: "Xhosa", nativeName: "isiXhosa", flag: "🇿🇦", coverage: "partial", fallback: "en" },
  yo: { code: "yo", name: "Yoruba", nativeName: "Yorùbá", flag: "🇳🇬", coverage: "partial", fallback: "en" },
  ar: { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇲🇦", coverage: "partial", fallback: "en" },
  tl: { code: "tl", name: "Tagalog", nativeName: "Tagalog", flag: "🇵🇭", coverage: "partial", fallback: "en" },

  // ── Tier 3: dialects / code-switched varieties — UI follows parent ──────
  bahian: { code: "bahian", name: "Bahian Portuguese", nativeName: "Português baiano", flag: "🇧🇷", coverage: "fallback", fallback: "pt" },
  paisa: { code: "paisa", name: "Paisa Spanish", nativeName: "Español paisa", flag: "🇨🇴", coverage: "fallback", fallback: "es" },
  sheng: { code: "sheng", name: "Sheng", nativeName: "Sheng", flag: "🇰🇪", coverage: "fallback", fallback: "sw" },
  darija: { code: "darija", name: "Moroccan Darija", nativeName: "الدارجة", flag: "🇲🇦", coverage: "fallback", fallback: "ar" },
  taglish: { code: "taglish", name: "Taglish", nativeName: "Taglish", flag: "🇵🇭", coverage: "fallback", fallback: "tl" },
  pcm: { code: "pcm", name: "Nigerian Pidgin", nativeName: "Naijá", flag: "🇳🇬", coverage: "fallback", fallback: "en" },
};

export const LOCALE_LIST: LocaleMeta[] = Object.values(SUPPORTED_LOCALES);

/** Helper: locales grouped by coverage tier — used by the picker UI. */
export const LOCALES_BY_COVERAGE: Record<LocaleCoverage, LocaleMeta[]> = {
  full: LOCALE_LIST.filter((l) => l.coverage === "full"),
  partial: LOCALE_LIST.filter((l) => l.coverage === "partial"),
  fallback: LOCALE_LIST.filter((l) => l.coverage === "fallback"),
};

export function isSupportedLocale(value: unknown): value is LocaleCode {
  return typeof value === "string" && value in SUPPORTED_LOCALES;
}

// ─── Translation dictionaries ───────────────────────────────────────────────
// Flat key-based for easy expansion. Values fall back to English if missing.

export type TranslationKey =
  // Questionnaire (legacy free-text — kept for backward compat)
  | "qst.title" | "qst.subtitle"
  | "qst.q1" | "qst.q2" | "qst.q3" | "qst.q4" | "qst.q5"
  | "qst.q6" | "qst.q7" | "qst.q8" | "qst.q9" | "qst.q10"
  | "qst.continue" | "qst.prototypeNote" | "qst.whyAsk" | "qst.whyAskBody"
  | "qst.useSample" | "qst.clearAll" | "qst.placeholder"
  // Structured questionnaire (Phase 0.2)
  | "qst.zoneA" | "qst.zoneAHint"
  | "qst.zoneB" | "qst.zoneBHint"
  | "qst.zoneC" | "qst.zoneCHint" | "qst.zoneCComingSoon"
  | "qst.languages" | "qst.languagesHint"
  | "qst.languageLevel" | "qst.languageScripts"
  | "qst.addLanguage" | "qst.removeLanguage"
  | "qst.dialectToggle"
  | "qst.comfort" | "qst.writingComfort" | "qst.criticalThinking"
  | "qst.weeklyHours" | "qst.weeklyHoursHint"
  | "qst.deviceStability"
  | "qst.deviceMobileOnly" | "qst.deviceMobilePrimary" | "qst.deviceDesktopPrimary"
  | "qst.weightNone" | "qst.weightSome" | "qst.weightStrong" | "qst.weightExpert"
  | "qst.weightHint"
  | "qst.cefrA1" | "qst.cefrA2" | "qst.cefrB1" | "qst.cefrB2" | "qst.cefrC1" | "qst.cefrC2"
  | "qst.summary" | "qst.summaryDomains" | "qst.summaryLanguages"
  | "qst.submit"
  // Evidence Probe (Phase 0.3)
  | "probe.title" | "probe.subtitle"
  | "probe.intro" | "probe.itemCounter"
  | "probe.skipForNow" | "probe.submit"
  | "probe.submitting" | "probe.allRequired"
  | "probe.results.title" | "probe.results.subtitle"
  | "probe.results.accuracy" | "probe.results.consistency" | "probe.results.speed"
  | "probe.results.continueToClarify"
  | "probe.results.correct" | "probe.results.incorrect"
  | "probe.results.whyTitle"
  // Jobs (Phase 0.4 — verbose match-reason cards + locked rail)
  | "jobs.step" | "jobs.title" | "jobs.subtitle"
  | "jobs.matchedHeading" | "jobs.lockedHeading"
  | "jobs.matchScore" | "jobs.fairWork"
  | "jobs.minLevel" | "jobs.minCefr" | "jobs.minHours"
  | "jobs.matchReasons" | "jobs.whatsMissing"
  | "jobs.noMatches" | "jobs.noMatchesHint"
  | "jobs.tryTask" | "jobs.viewPassport"
  | "jobs.empty"
  | "jobs.score.eligible"
  | "jobs.locked.cta"
  | "jobs.locked.subtitle"
  // Passport (Phase 0.4 — full rework around SignalProfile)
  | "pp.step" | "pp.title" | "pp.subtitle"
  | "pp.languages" | "pp.languagesHint"
  | "pp.dialects" | "pp.dialectsHint"
  | "pp.recognisedDomains" | "pp.recognisedDomainsHint"
  | "pp.escoSkills" | "pp.escoSkillsHint"
  | "pp.probeRubric" | "pp.probeRubricHint"
  | "pp.probeMissing"
  | "pp.scoreBreakdown"
  | "pp.recommendedJobs" | "pp.recommendedJobsHint"
  | "pp.weeklyHours" | "pp.deviceMobileOnly" | "pp.deviceMobilePrimary" | "pp.deviceDesktopPrimary"
  | "pp.confidence"
  | "pp.viewJobs" | "pp.retake"
  | "pp.narrative"
  // Common
  | "common.back" | "common.continue" | "common.saving" | "common.submit"
  | "common.preferredLanguage" | "common.preferredLanguageHint"
  | "common.demoCountry" | "common.languagesYouSpeak"
  // Nav
  | "nav.home" | "nav.getStarted" | "nav.skillTest" | "nav.passport"
  | "nav.jobs" | "nav.leaderboard" | "nav.dashboard" | "nav.forJudges"
  | "nav.startDemo"
  // Onboarding
  | "ob.step" | "ob.title" | "ob.subtitle"
  | "ob.name" | "ob.namePh"
  | "ob.region" | "ob.regionPh"
  | "ob.languages" | "ob.languagesPh"
  | "ob.deviceAccess" | "ob.deviceSelect"
  | "ob.useSample" | "ob.consent" | "ob.consentBody" | "ob.consentAgree"
  | "ob.continue";

const en: Record<TranslationKey, string> = {
  "qst.title": "Local Context Questionnaire",
  "qst.subtitle":
    "Help us understand the language, culture, and lived experience you could use to evaluate AI outputs.",
  "qst.q1": "What country or community are you most familiar with?",
  "qst.q2": "What languages or dialects can you read, write, and understand?",
  "qst.q3":
    "What local phrase, food, tradition, sport, place, or community activity might AI describe badly?",
  "qst.q4": "What would an outsider or AI system usually get wrong about it?",
  "qst.q5":
    "What topics from your community could you confidently judge AI answers about?",
  "qst.q6": "Give one local phrase or expression that does not translate literally.",
  "qst.q7": "How would you explain its real meaning to an outsider?",
  "qst.q8":
    "What local advice might sound correct online but would not work in your community?",
  "qst.q9": "How would you check if an AI-generated claim about your community is true?",
  "qst.q10":
    "Would you like to progress into higher-value roles such as AI output evaluator, cultural QA reviewer, fact-checking reviewer, or community trainer?",
  "qst.continue": "Continue to Skill Test",
  "qst.prototypeNote":
    "Prototype localisation: questionnaire text is translated for demo purposes and would require local validation before deployment.",
  "qst.whyAsk": "Why we ask",
  "qst.whyAskBody":
    "Your answers help identify where AI outputs about your community are inaccurate or culturally inappropriate. This becomes the evidence base for your Signal Profile.",
  "qst.useSample": "Use sample answers",
  "qst.clearAll": "Clear all",
  "qst.placeholder": "Your answer…",

  // Structured questionnaire (Phase 0.2)
  "qst.zoneA": "1. About you",
  "qst.zoneAHint": "Your languages, comfort, and how much you can take on.",
  "qst.zoneB": "2. What you'd recognise locally",
  "qst.zoneBHint":
    "Tap each thing you'd genuinely recognise. The strength tells us how confidently you could judge AI answers about it.",
  "qst.zoneC": "3. Quick skill probe",
  "qst.zoneCHint":
    "A 90-second micro-task that produces a measured rubric — accuracy, consistency, and speed.",
  "qst.zoneCComingSoon":
    "Probe arrives in the next slice. For now we'll route you to the existing skill test after submission.",

  "qst.languages": "Languages you speak",
  "qst.languagesHint":
    "Pick the level that honestly reflects how comfortably you read and write in this language.",
  "qst.languageLevel": "Level",
  "qst.languageScripts": "Scripts",
  "qst.addLanguage": "Add a language",
  "qst.removeLanguage": "Remove",
  "qst.dialectToggle": "Local dialect / variety",

  "qst.comfort": "Self-reported comfort",
  "qst.writingComfort": "Writing comfort",
  "qst.criticalThinking": "Critical thinking & reasoning",
  "qst.weeklyHours": "Hours per week available",
  "qst.weeklyHoursHint": "Honest answers help us avoid overcommitting you.",
  "qst.deviceStability": "Device situation",
  "qst.deviceMobileOnly": "Mobile only",
  "qst.deviceMobilePrimary": "Mainly mobile",
  "qst.deviceDesktopPrimary": "Mainly laptop / desktop",

  "qst.weightNone": "—",
  "qst.weightSome": "Some",
  "qst.weightStrong": "Strong",
  "qst.weightExpert": "Expert",
  "qst.weightHint": "Tap once for Some, again for Strong, again for Expert.",

  "qst.cefrA1": "A1 · Beginner",
  "qst.cefrA2": "A2 · Elementary",
  "qst.cefrB1": "B1 · Intermediate",
  "qst.cefrB2": "B2 · Upper-intermediate",
  "qst.cefrC1": "C1 · Advanced",
  "qst.cefrC2": "C2 · Native / proficient",

  "qst.summary": "Summary",
  "qst.summaryDomains": "Recognised domains",
  "qst.summaryLanguages": "Languages",
  "qst.submit": "Save & continue",

  // Evidence Probe (Phase 0.3)
  "probe.title": "Quick skill probe",
  "probe.subtitle":
    "Three short items — AI output rating, translation, and tone. Untimed. Your answers create measured evidence on your Skills Passport.",
  "probe.intro":
    "Pick the option you genuinely think is best. There's no penalty for taking your time.",
  "probe.itemCounter": "Item",
  "probe.skipForNow": "Skip for now",
  "probe.submit": "Submit probe",
  "probe.submitting": "Scoring…",
  "probe.allRequired": "Pick one option for each item before submitting.",
  "probe.results.title": "Probe complete",
  "probe.results.subtitle":
    "Below is the measured evidence we'll surface on your Skills Passport and use in job matching.",
  "probe.results.accuracy": "Accuracy",
  "probe.results.consistency": "Consistency",
  "probe.results.speed": "Speed",
  "probe.results.correct": "Correct",
  "probe.results.incorrect": "Different from expected",
  "probe.results.whyTitle": "Why",
  "probe.results.continueToClarify": "Continue to AI clarification",

  // Jobs (Phase 0.4)
  "jobs.step": "Step 07 · Matched AI data jobs",
  "jobs.title": "Your matched jobs",
  "jobs.subtitle":
    "Ranked against your Signal Profile — language proficiency, recognised domains, ESCO skill clusters, and probe evidence. We filter for fair pay, safety, and progression value.",
  "jobs.matchedHeading": "Available to you",
  "jobs.lockedHeading": "Next steps you could unlock",
  "jobs.locked.subtitle":
    "Tasks that are close — finish a few matched tasks to lift your level, or strengthen the missing signal below.",
  "jobs.matchScore": "Match score",
  "jobs.fairWork": "Fair Work Score",
  "jobs.minLevel": "Min level",
  "jobs.minCefr": "Min CEFR",
  "jobs.minHours": "Min hours / week",
  "jobs.matchReasons": "Why this matches",
  "jobs.whatsMissing": "What's missing",
  "jobs.noMatches": "No matches yet",
  "jobs.noMatchesHint":
    "Complete the questionnaire and probe to surface your first matched roles.",
  "jobs.tryTask": "Try a sample task",
  "jobs.viewPassport": "Back to passport",
  "jobs.empty": "—",
  "jobs.score.eligible": "Eligible",
  "jobs.locked.cta": "Lift your level by completing matched tasks",

  // Passport (Phase 0.4)
  "pp.step": "Step 06 · Skills Passport",
  "pp.title": "Your Skills Passport",
  "pp.subtitle":
    "Generated dynamically from your Signal Profile — languages, recognised domains, ESCO skill clusters, and the Evidence Probe.",
  "pp.languages": "Language proficiency",
  "pp.languagesHint":
    "CEFR levels and writing scripts the matcher uses for hard-filter checks.",
  "pp.dialects": "Local dialects",
  "pp.dialectsHint":
    "Dialects unlock a soft-score bonus on country-specific jobs.",
  "pp.recognisedDomains": "Recognised cultural domains",
  "pp.recognisedDomainsHint":
    "Domains you signalled knowledge of in the questionnaire (chip strength becomes weight).",
  "pp.escoSkills": "Inferred ESCO skill clusters",
  "pp.escoSkillsHint":
    "Each domain you recognise inferentially evidences ESCO skill clusters — the international skill backbone we match against.",
  "pp.probeRubric": "Verified probe rubric",
  "pp.probeRubricHint":
    "Measured evidence from the 3-item Evidence Probe — accuracy, consistency, and speed.",
  "pp.probeMissing":
    "Probe not completed yet — complete it to add measured evidence to your passport.",
  "pp.scoreBreakdown": "Score breakdown",
  "pp.recommendedJobs": "Top matched roles",
  "pp.recommendedJobsHint":
    "Best-fit jobs derived from your Signal Profile and current readiness level.",
  "pp.weeklyHours": "h/week available",
  "pp.deviceMobileOnly": "Mobile only",
  "pp.deviceMobilePrimary": "Mainly mobile",
  "pp.deviceDesktopPrimary": "Mainly laptop / desktop",
  "pp.confidence": "Confidence score",
  "pp.viewJobs": "View matched jobs",
  "pp.retake": "Retake test",
  "pp.narrative":
    "Unmapped Voices turns hidden human judgement into verified skill evidence and uses that evidence to unlock ethical AI data work. Your Skills Passport is portable proof of what you can do.",

  "common.back": "Back",
  "common.continue": "Continue",
  "common.saving": "Saving…",
  "common.submit": "Submit",
  "common.preferredLanguage": "Preferred language",
  "common.preferredLanguageHint":
    "We will use this language across the app. You can change it any time.",
  "common.demoCountry": "Demo country",
  "common.languagesYouSpeak": "Languages you speak",

  "nav.home": "Home",
  "nav.getStarted": "Get Started",
  "nav.skillTest": "Skill Test",
  "nav.passport": "Skill passport",
  "nav.jobs": "Jobs",
  "nav.leaderboard": "Leaderboard",
  "nav.dashboard": "Dashboard",
  "nav.forJudges": "For Judges",
  "nav.startDemo": "Start Demo",

  "ob.step": "Step 01",
  "ob.title": "Your Profile",
  "ob.subtitle": "Tell us a little about yourself so we can personalise the demo experience.",
  "ob.name": "Name",
  "ob.namePh": "Your first name",
  "ob.region": "Region / community",
  "ob.regionPh": "e.g. Antananarivo, Accra North",
  "ob.languages": "Languages you speak",
  "ob.languagesPh": "e.g. Malagasy, French",
  "ob.deviceAccess": "Device access",
  "ob.deviceSelect": "Select…",
  "ob.useSample": "Use sample profile",
  "ob.consent": "Consent",
  "ob.consentBody":
    "Your local knowledge is valuable. You choose what to share. Your answers are used to assess your suitability for AI evaluation tasks and build your Signal Profile. You can skip anything you do not want to answer. In this prototype, all data is simulated and stored locally.",
  "ob.consentAgree": "I understand and agree to continue with this prototype session.",
  "ob.continue": "Continue to Questionnaire",
};

const fr: Partial<Record<TranslationKey, string>> = {
  "qst.title": "Questionnaire de contexte local",
  "qst.subtitle":
    "Aidez-nous à comprendre la langue, la culture et l'expérience vécue que vous pourriez utiliser pour évaluer les réponses de l'IA.",
  "qst.q1": "Quel pays ou quelle communauté connaissez-vous le mieux ?",
  "qst.q2": "Quelles langues ou quels dialectes pouvez-vous lire, écrire et comprendre ?",
  "qst.q3":
    "Quelle expression locale, nourriture, tradition, activité sportive, lieu ou activité communautaire l'IA pourrait-elle mal décrire ?",
  "qst.q4":
    "Qu'est-ce qu'une personne extérieure ou un système d'IA comprendrait mal à ce sujet ?",
  "qst.q5":
    "Sur quels sujets de votre communauté pourriez-vous évaluer les réponses de l'IA avec confiance ?",
  "qst.q6": "Donnez une expression locale qui ne se traduit pas littéralement.",
  "qst.q7": "Comment expliqueriez-vous son vrai sens à une personne extérieure ?",
  "qst.q8":
    "Quel conseil local pourrait sembler correct en ligne, mais ne fonctionnerait pas dans votre communauté ?",
  "qst.q9":
    "Comment vérifieriez-vous si une affirmation générée par l'IA sur votre communauté est vraie ?",
  "qst.q10":
    "Souhaitez-vous évoluer vers des rôles plus avancés, comme évaluateur de réponses IA, réviseur culturel, vérificateur de faits ou formateur communautaire ?",
  "qst.continue": "Continuer vers le test de compétences",
  "qst.prototypeNote":
    "Localisation prototype : le texte du questionnaire est traduit pour la démonstration et nécessiterait une validation locale avant déploiement.",
  "qst.whyAsk": "Pourquoi nous le demandons",
  "qst.whyAskBody":
    "Vos réponses nous aident à identifier où les réponses de l'IA sur votre communauté sont inexactes ou culturellement inappropriées. Cela constitue la base de preuves de votre Signal Profile.",
  "qst.useSample": "Utiliser des réponses d'exemple",
  "qst.clearAll": "Tout effacer",
  "qst.placeholder": "Votre réponse…",

  "common.back": "Retour",
  "common.continue": "Continuer",
  "common.saving": "Enregistrement…",
  "common.submit": "Envoyer",
  "common.preferredLanguage": "Langue préférée",
  "common.preferredLanguageHint":
    "Nous utiliserons cette langue dans toute l'application. Vous pouvez la modifier à tout moment.",
  "common.demoCountry": "Pays de démonstration",
  "common.languagesYouSpeak": "Langues parlées",

  "nav.home": "Accueil",
  "nav.getStarted": "Commencer",
  "nav.skillTest": "Test de compétences",
  "nav.passport": "Passeport",
  "nav.jobs": "Missions",
  "nav.leaderboard": "Classement",
  "nav.dashboard": "Tableau de bord",
  "nav.forJudges": "Pour les juges",
  "nav.startDemo": "Démarrer la démo",

  "ob.step": "Étape 01",
  "ob.title": "Votre profil",
  "ob.subtitle":
    "Parlez-nous de vous pour que nous puissions personnaliser l'expérience de démonstration.",
  "ob.name": "Nom",
  "ob.namePh": "Votre prénom",
  "ob.region": "Région / communauté",
  "ob.regionPh": "ex. Antananarivo, Accra Nord",
  "ob.languages": "Langues parlées",
  "ob.languagesPh": "ex. malgache, français",
  "ob.deviceAccess": "Accès aux appareils",
  "ob.deviceSelect": "Sélectionner…",
  "ob.useSample": "Utiliser un profil d'exemple",
  "ob.consent": "Consentement",
  "ob.consentBody":
    "Vos connaissances locales sont précieuses. Vous choisissez ce que vous partagez. Vos réponses servent à évaluer votre adéquation aux tâches d'évaluation IA et à construire votre Signal Profile. Vous pouvez ignorer toute question. Dans ce prototype, toutes les données sont simulées et stockées localement.",
  "ob.consentAgree": "J'ai compris et j'accepte de continuer cette session de prototype.",
  "ob.continue": "Continuer vers le questionnaire",
};

const pt: Partial<Record<TranslationKey, string>> = {
  "qst.title": "Questionário de contexto local",
  "qst.subtitle":
    "Ajude-nos a entender a língua, a cultura e a experiência local que você poderia usar para avaliar respostas de IA.",
  "qst.q1": "Qual país ou comunidade você conhece melhor?",
  "qst.q2": "Quais línguas ou dialetos você consegue ler, escrever e entender?",
  "qst.q3":
    "Que expressão local, comida, tradição, esporte, lugar ou atividade comunitária a IA poderia descrever mal?",
  "qst.q4":
    "O que uma pessoa de fora ou um sistema de IA normalmente entenderia errado sobre isso?",
  "qst.q5":
    "Sobre quais temas da sua comunidade você conseguiria avaliar respostas de IA com confiança?",
  "qst.q6": "Dê um exemplo de expressão local que não pode ser traduzida literalmente.",
  "qst.q7": "Como você explicaria o verdadeiro significado dela para alguém de fora?",
  "qst.q8":
    "Que conselho local poderia parecer correto online, mas não funcionaria na sua comunidade?",
  "qst.q9":
    "Como você verificaria se uma afirmação gerada por IA sobre sua comunidade é verdadeira?",
  "qst.q10":
    "Você gostaria de avançar para funções de maior valor, como avaliador de respostas de IA, revisor cultural, verificador de fatos ou formador comunitário?",
  "qst.continue": "Continuar para o teste de competência",
  "qst.prototypeNote":
    "Localização de protótipo: o texto do questionário é traduzido para fins de demonstração e exigiria validação local antes da implementação.",
  "qst.whyAsk": "Por que perguntamos",
  "qst.whyAskBody":
    "Suas respostas ajudam a identificar onde as respostas de IA sobre sua comunidade são imprecisas ou culturalmente inadequadas. Isso se torna a base de evidências do seu Signal Profile.",
  "qst.useSample": "Usar respostas de exemplo",
  "qst.clearAll": "Limpar tudo",
  "qst.placeholder": "Sua resposta…",

  "common.back": "Voltar",
  "common.continue": "Continuar",
  "common.saving": "Salvando…",
  "common.submit": "Enviar",
  "common.preferredLanguage": "Idioma preferido",
  "common.preferredLanguageHint":
    "Usaremos este idioma em todo o aplicativo. Você pode alterar a qualquer momento.",
  "common.demoCountry": "País de demonstração",
  "common.languagesYouSpeak": "Idiomas que você fala",

  "nav.home": "Início",
  "nav.getStarted": "Começar",
  "nav.skillTest": "Teste de competência",
  "nav.passport": "Passaporte",
  "nav.jobs": "Tarefas",
  "nav.leaderboard": "Ranking",
  "nav.dashboard": "Painel",
  "nav.forJudges": "Para os juízes",
  "nav.startDemo": "Iniciar demonstração",

  "ob.step": "Etapa 01",
  "ob.title": "Seu perfil",
  "ob.subtitle":
    "Fale um pouco sobre você para que possamos personalizar a experiência de demonstração.",
  "ob.name": "Nome",
  "ob.namePh": "Seu primeiro nome",
  "ob.region": "Região / comunidade",
  "ob.regionPh": "ex. Salvador, Recife",
  "ob.languages": "Idiomas que você fala",
  "ob.languagesPh": "ex. Português, Inglês",
  "ob.deviceAccess": "Acesso a dispositivos",
  "ob.deviceSelect": "Selecione…",
  "ob.useSample": "Usar perfil de exemplo",
  "ob.consent": "Consentimento",
  "ob.consentBody":
    "Seu conhecimento local é valioso. Você decide o que compartilhar. Suas respostas são usadas para avaliar sua adequação às tarefas de avaliação de IA e construir seu Signal Profile. Você pode pular qualquer pergunta. Neste protótipo, todos os dados são simulados e armazenados localmente.",
  "ob.consentAgree": "Eu entendo e concordo em continuar com esta sessão de protótipo.",
  "ob.continue": "Continuar para o questionário",
};

const es: Partial<Record<TranslationKey, string>> = {
  "qst.title": "Cuestionario de contexto local",
  "qst.subtitle":
    "Ayúdanos a entender el idioma, la cultura y la experiencia local que podrías usar para evaluar respuestas de IA.",
  "qst.q1": "¿Qué país o comunidad conoces mejor?",
  "qst.q2": "¿Qué idiomas o dialectos puedes leer, escribir y entender?",
  "qst.q3":
    "¿Qué expresión local, comida, tradición, deporte, lugar o actividad comunitaria podría describir mal la IA?",
  "qst.q4":
    "¿Qué suele entender mal una persona externa o un sistema de IA sobre ese tema?",
  "qst.q5":
    "¿Sobre qué temas de tu comunidad podrías evaluar respuestas de IA con confianza?",
  "qst.q6": "Da un ejemplo de una expresión local que no se traduzca literalmente.",
  "qst.q7": "¿Cómo explicarías su significado real a una persona externa?",
  "qst.q8":
    "¿Qué consejo local podría parecer correcto en internet, pero no funcionar en tu comunidad?",
  "qst.q9":
    "¿Cómo comprobarías si una afirmación generada por IA sobre tu comunidad es verdadera?",
  "qst.q10":
    "¿Te gustaría avanzar hacia funciones de mayor valor, como evaluador de respuestas de IA, revisor cultural, verificador de hechos o formador comunitario?",
  "qst.continue": "Continuar al test de habilidad",
  "qst.prototypeNote":
    "Localización de prototipo: el texto del cuestionario está traducido para la demostración y requeriría validación local antes del despliegue.",
  "qst.whyAsk": "Por qué lo preguntamos",
  "qst.whyAskBody":
    "Tus respuestas ayudan a identificar dónde las respuestas de IA sobre tu comunidad son inexactas o culturalmente inapropiadas. Esto se convierte en la base de evidencia de tu Signal Profile.",
  "qst.useSample": "Usar respuestas de ejemplo",
  "qst.clearAll": "Borrar todo",
  "qst.placeholder": "Tu respuesta…",

  "common.back": "Atrás",
  "common.continue": "Continuar",
  "common.saving": "Guardando…",
  "common.submit": "Enviar",
  "common.preferredLanguage": "Idioma preferido",
  "common.preferredLanguageHint":
    "Usaremos este idioma en toda la aplicación. Puedes cambiarlo en cualquier momento.",
  "common.demoCountry": "País de demostración",
  "common.languagesYouSpeak": "Idiomas que hablas",

  "nav.home": "Inicio",
  "nav.getStarted": "Empezar",
  "nav.skillTest": "Test de habilidad",
  "nav.passport": "Pasaporte",
  "nav.jobs": "Tareas",
  "nav.leaderboard": "Clasificación",
  "nav.dashboard": "Panel",
  "nav.forJudges": "Para los jueces",
  "nav.startDemo": "Iniciar demostración",

  "ob.step": "Paso 01",
  "ob.title": "Tu perfil",
  "ob.subtitle":
    "Cuéntanos un poco sobre ti para que podamos personalizar la experiencia de demostración.",
  "ob.name": "Nombre",
  "ob.namePh": "Tu nombre",
  "ob.region": "Región / comunidad",
  "ob.regionPh": "ej. Medellín, Bogotá",
  "ob.languages": "Idiomas que hablas",
  "ob.languagesPh": "ej. Español, Inglés",
  "ob.deviceAccess": "Acceso a dispositivos",
  "ob.deviceSelect": "Seleccionar…",
  "ob.useSample": "Usar perfil de ejemplo",
  "ob.consent": "Consentimiento",
  "ob.consentBody":
    "Tu conocimiento local es valioso. Tú eliges qué compartir. Tus respuestas se usan para evaluar tu idoneidad para tareas de evaluación de IA y construir tu Signal Profile. Puedes omitir cualquier pregunta. En este prototipo, todos los datos son simulados y se almacenan localmente.",
  "ob.consentAgree": "Entiendo y acepto continuar con esta sesión del prototipo.",
  "ob.continue": "Continuar al cuestionario",
};

const sw: Partial<Record<TranslationKey, string>> = {
  "qst.title": "Dodoso la muktadha wa jamii",
  "qst.subtitle":
    "Tusaidie kuelewa lugha, utamaduni na uzoefu wa maisha ambao unaweza kutumia kutathmini majibu ya AI.",
  "qst.q1": "Ni nchi au jamii gani unaifahamu zaidi?",
  "qst.q2": "Ni lugha au lahaja gani unaweza kusoma, kuandika na kuelewa?",
  "qst.q3":
    "Ni msemo, chakula, desturi, mchezo, eneo au shughuli gani ya jamii ambayo AI inaweza kuelezea vibaya?",
  "qst.q4": "Mtu wa nje au mfumo wa AI kwa kawaida angekosea nini kuhusu hilo?",
  "qst.q5": "Ni mada gani kutoka jamii yako unaweza kutathmini majibu ya AI kwa kujiamini?",
  "qst.q6": "Toa mfano wa msemo wa kienyeji ambao hautafsiriki moja kwa moja.",
  "qst.q7": "Ungeelezaje maana yake halisi kwa mtu wa nje?",
  "qst.q8":
    "Ni ushauri gani unaweza kuonekana sahihi mtandaoni lakini usifanye kazi katika jamii yako?",
  "qst.q9":
    "Ungethibitishaje kama dai lililotengenezwa na AI kuhusu jamii yako ni kweli?",
  "qst.q10":
    "Je, ungependa kuendelea hadi majukumu ya juu zaidi kama mtathmini wa majibu ya AI, mhakiki wa muktadha wa kitamaduni, mhakiki wa ukweli au mkufunzi wa jamii?",
  "qst.continue": "Endelea kwenye jaribio la ujuzi",
  "qst.prototypeNote":
    "Ujanibishaji wa mfano: maandishi ya dodoso yametafsiriwa kwa madhumuni ya onyesho na yangehitaji uthibitishaji wa ndani kabla ya kutumika.",
  "qst.whyAsk": "Kwa nini tunauliza",
  "qst.whyAskBody":
    "Majibu yako husaidia kutambua wapi majibu ya AI kuhusu jamii yako ni yasiyo sahihi au yasiyofaa kitamaduni. Haya yanakuwa msingi wa ushahidi wa Signal Profile yako.",
  "qst.useSample": "Tumia majibu ya mfano",
  "qst.clearAll": "Futa yote",
  "qst.placeholder": "Jibu lako…",

  "common.back": "Rudi",
  "common.continue": "Endelea",
  "common.saving": "Inahifadhi…",
  "common.submit": "Tuma",
  "common.preferredLanguage": "Lugha unayopendelea",
  "common.preferredLanguageHint":
    "Tutatumia lugha hii katika programu nzima. Unaweza kuibadilisha wakati wowote.",
  "common.demoCountry": "Nchi ya onyesho",
  "common.languagesYouSpeak": "Lugha unazozungumza",

  "nav.home": "Mwanzo",
  "nav.getStarted": "Anza",
  "nav.skillTest": "Jaribio la ujuzi",
  "nav.passport": "Pasipoti",
  "nav.jobs": "Kazi",
  "nav.leaderboard": "Orodha ya juu",
  "nav.dashboard": "Dashibodi",
  "nav.forJudges": "Kwa majaji",
  "nav.startDemo": "Anza onyesho",

  "ob.step": "Hatua 01",
  "ob.title": "Wasifu wako",
  "ob.subtitle":
    "Tuambie kidogo kukuhusu ili tuweze kubinafsisha uzoefu wa onyesho.",
  "ob.name": "Jina",
  "ob.namePh": "Jina lako la kwanza",
  "ob.region": "Mkoa / jamii",
  "ob.regionPh": "k.m. Nairobi, Mombasa",
  "ob.languages": "Lugha unazozungumza",
  "ob.languagesPh": "k.m. Kiswahili, Kiingereza",
  "ob.deviceAccess": "Ufikiaji wa kifaa",
  "ob.deviceSelect": "Chagua…",
  "ob.useSample": "Tumia wasifu wa mfano",
  "ob.consent": "Idhini",
  "ob.consentBody":
    "Maarifa yako ya ndani ni ya thamani. Unachagua kushiriki nini. Majibu yako hutumika kutathmini ufaafu wako kwa kazi za tathmini ya AI na kujenga Signal Profile yako. Unaweza kuruka swali lolote. Katika mfano huu, data yote inaiga na huhifadhiwa ndani.",
  "ob.consentAgree": "Naelewa na nakubali kuendelea na kikao hiki cha mfano.",
  "ob.continue": "Endelea kwenye dodoso",
};

// Tier-2 partial dictionaries: cover the most user-visible strings.
// Missing keys cascade through the fallback chain to English.

const hi: Partial<Record<TranslationKey, string>> = {
  "qst.title": "स्थानीय संदर्भ प्रश्नावली",
  "qst.subtitle":
    "हमें वह भाषा, संस्कृति और अनुभव समझने में मदद करें जिसका उपयोग आप AI उत्तरों का मूल्यांकन करने के लिए कर सकते हैं।",
  "qst.continue": "कौशल परीक्षा पर जारी रखें",
  "qst.placeholder": "आपका उत्तर…",
  "qst.useSample": "नमूना उत्तर का उपयोग करें",
  "qst.clearAll": "सब साफ़ करें",
  "qst.whyAsk": "हम क्यों पूछते हैं",
  "common.back": "वापस",
  "common.continue": "जारी रखें",
  "common.saving": "सहेज रहे हैं…",
  "common.preferredLanguage": "पसंदीदा भाषा",
  "common.preferredLanguageHint":
    "हम पूरे ऐप में इस भाषा का उपयोग करेंगे। आप इसे किसी भी समय बदल सकते हैं।",
  "common.demoCountry": "डेमो देश",
  "common.languagesYouSpeak": "आप जो भाषाएँ बोलते हैं",
  "nav.home": "मुख्य पृष्ठ",
  "nav.getStarted": "शुरू करें",
  "nav.skillTest": "कौशल परीक्षा",
  "nav.passport": "पासपोर्ट",
  "nav.jobs": "कार्य",
  "nav.leaderboard": "लीडरबोर्ड",
  "nav.dashboard": "डैशबोर्ड",
  "nav.forJudges": "जजों के लिए",
  "nav.startDemo": "डेमो शुरू करें",
  "ob.step": "चरण 01",
  "ob.title": "आपकी प्रोफ़ाइल",
  "ob.subtitle": "हमें अपने बारे में थोड़ा बताएँ ताकि हम डेमो अनुभव को व्यक्तिगत बना सकें।",
  "ob.continue": "प्रश्नावली पर जारी रखें",
};

const ar: Partial<Record<TranslationKey, string>> = {
  "qst.title": "استبيان السياق المحلي",
  "qst.subtitle":
    "ساعدنا في فهم اللغة والثقافة والتجربة المحلية التي يمكنك استخدامها لتقييم مخرجات الذكاء الاصطناعي.",
  "qst.continue": "متابعة إلى اختبار المهارة",
  "qst.placeholder": "إجابتك…",
  "qst.useSample": "استخدم إجابات نموذجية",
  "qst.clearAll": "مسح الكل",
  "qst.whyAsk": "لماذا نسأل",
  "common.back": "رجوع",
  "common.continue": "متابعة",
  "common.saving": "جارٍ الحفظ…",
  "common.preferredLanguage": "اللغة المفضّلة",
  "common.preferredLanguageHint":
    "سنستخدم هذه اللغة في جميع أنحاء التطبيق. يمكنك تغييرها في أي وقت.",
  "common.demoCountry": "بلد العرض",
  "common.languagesYouSpeak": "اللغات التي تتحدثها",
  "nav.home": "الرئيسية",
  "nav.getStarted": "ابدأ",
  "nav.skillTest": "اختبار المهارة",
  "nav.passport": "جواز السفر",
  "nav.jobs": "المهام",
  "nav.leaderboard": "لوحة المتصدرين",
  "nav.dashboard": "لوحة التحكم",
  "nav.forJudges": "للحكام",
  "nav.startDemo": "ابدأ العرض",
  "ob.step": "الخطوة 01",
  "ob.title": "ملفك الشخصي",
  "ob.subtitle": "أخبرنا قليلاً عن نفسك حتى نتمكن من تخصيص تجربة العرض.",
  "ob.continue": "متابعة إلى الاستبيان",
};

const yo: Partial<Record<TranslationKey, string>> = {
  "qst.title": "Ìwádìí àyíká àdúgbò",
  "qst.subtitle":
    "Ràn wá lọ́wọ́ láti lóye èdè, àṣà àti ìrírí àdúgbò tí o lè lò láti ṣàyẹ̀wò àwọn ìdáhùn AI.",
  "qst.continue": "Tẹ̀síwájú sí àbẹ̀wò ọgbọ́n",
  "qst.placeholder": "Ìdáhùn rẹ…",
  "qst.useSample": "Lo àwọn ìdáhùn àpẹẹrẹ",
  "qst.clearAll": "Pa gbogbo rẹ̀ rẹ́",
  "common.back": "Padà",
  "common.continue": "Tẹ̀síwájú",
  "common.saving": "À ń tọ́jú…",
  "common.preferredLanguage": "Èdè tí o fẹ́",
  "common.preferredLanguageHint":
    "A óò lo èdè yìí jákèjádò ohun èlò náà. O lè yí padà nígbàkigbà.",
  "common.demoCountry": "Orílẹ̀-èdè àpẹẹrẹ",
  "nav.home": "Ilé",
  "nav.getStarted": "Bẹ̀rẹ̀",
  "nav.skillTest": "Àbẹ̀wò ọgbọ́n",
  "nav.passport": "Ìwé ìrìnnà",
  "nav.jobs": "Iṣẹ́",
  "nav.leaderboard": "Ojú-ìwé olùdájú",
  "nav.dashboard": "Pátákó",
  "nav.forJudges": "Fún àwọn adájọ́",
  "nav.startDemo": "Bẹ̀rẹ̀ Demo",
  "ob.step": "Ìpele 01",
  "ob.title": "Profáìlì rẹ",
  "ob.subtitle":
    "Sọ fún wa díẹ̀ nípa ara rẹ kí a lè ṣe àkànṣe ìrírí Demo náà.",
  "ob.continue": "Tẹ̀síwájú sí ìbéèrè",
};

const zu: Partial<Record<TranslationKey, string>> = {
  "qst.title": "Imibuzo yendawo yangakini",
  "qst.subtitle":
    "Sisize siqonde ulimi, isiko, nokuhlangenwe nakho ongakusebenzisa ukuhlola izimpendulo ze-AI.",
  "qst.continue": "Qhubeka esivivinyweni samakhono",
  "qst.placeholder": "Impendulo yakho…",
  "qst.useSample": "Sebenzisa izimpendulo zesibonelo",
  "qst.clearAll": "Sula konke",
  "common.back": "Buyela",
  "common.continue": "Qhubeka",
  "common.saving": "Iyalondoloza…",
  "common.preferredLanguage": "Ulimi olukhethwayo",
  "common.preferredLanguageHint":
    "Sizosebenzisa lolu limi kuyo yonke i-app. Ungalushintsha noma nini.",
  "common.demoCountry": "Izwe lokubonisa",
  "nav.home": "Ekhaya",
  "nav.getStarted": "Qala",
  "nav.skillTest": "Isivivinyo samakhono",
  "nav.passport": "Iphasipoti",
  "nav.jobs": "Imisebenzi",
  "nav.leaderboard": "Uhla lwabaphezulu",
  "nav.dashboard": "Ideshibhodi",
  "nav.forJudges": "Kwabahluleli",
  "nav.startDemo": "Qala uhambo lokubonisa",
  "ob.step": "Isinyathelo 01",
  "ob.title": "Iphrofayela yakho",
  "ob.subtitle":
    "Sitshele kancane ngawe ukuze sikwazi ukwenza uhambo lokubonisa lukufanele.",
  "ob.continue": "Qhubeka emibuzweni",
};

const xh: Partial<Record<TranslationKey, string>> = {
  "qst.title": "Uphando-mibuzo lwendawo",
  "qst.subtitle":
    "Sincede siqonde ulwimi, inkcubeko nolwazi lwendawo onokulusebenzisa ekuhloleni iimpendulo ze-AI.",
  "qst.continue": "Qhubeka kuvavanyo lobuchule",
  "qst.placeholder": "Impendulo yakho…",
  "common.back": "Buyela",
  "common.continue": "Qhubeka",
  "common.saving": "Iyagcina…",
  "common.preferredLanguage": "Ulwimi olukhethwayo",
  "common.preferredLanguageHint":
    "Siza kusebenzisa olu lwimi kuyo yonke i-app. Ungaluguqula nanini na.",
  "common.demoCountry": "Ilizwe lomboniso",
  "nav.home": "Ekhaya",
  "nav.getStarted": "Qalisa",
  "nav.skillTest": "Uvavanyo lobuchule",
  "nav.passport": "Ipasipoti",
  "nav.jobs": "Imisebenzi",
  "nav.leaderboard": "Iqela eliphambili",
  "nav.dashboard": "Ideshibhodi",
  "nav.forJudges": "Kubagwebi",
  "nav.startDemo": "Qalisa umboniso",
  "ob.step": "Inyathelo 01",
  "ob.title": "Iprofayile yakho",
  "ob.continue": "Qhubeka kwiimpendulo",
};

const tl: Partial<Record<TranslationKey, string>> = {
  "qst.title": "Talatanungan ng lokal na konteksto",
  "qst.subtitle":
    "Tulungan kaming maintindihan ang wika, kultura, at karanasang maaari mong gamitin sa pagsusuri ng mga sagot ng AI.",
  "qst.continue": "Magpatuloy sa Skill Test",
  "qst.placeholder": "Ang sagot mo…",
  "qst.useSample": "Gamitin ang halimbawang sagot",
  "qst.clearAll": "I-clear lahat",
  "qst.whyAsk": "Bakit tinatanong",
  "common.back": "Bumalik",
  "common.continue": "Magpatuloy",
  "common.saving": "Sini-save…",
  "common.preferredLanguage": "Gustong wika",
  "common.preferredLanguageHint":
    "Gagamitin namin ang wikang ito sa buong app. Maaari mo itong palitan anumang oras.",
  "common.demoCountry": "Bansa ng demo",
  "nav.home": "Tahanan",
  "nav.getStarted": "Magsimula",
  "nav.skillTest": "Skill Test",
  "nav.passport": "Pasaporte",
  "nav.jobs": "Mga trabaho",
  "nav.leaderboard": "Leaderboard",
  "nav.dashboard": "Dashboard",
  "nav.forJudges": "Para sa mga huwes",
  "nav.startDemo": "Simulan ang Demo",
  "ob.step": "Hakbang 01",
  "ob.title": "Iyong profile",
  "ob.subtitle":
    "Magbahagi ng kaunti tungkol sa iyong sarili para mai-personalize namin ang demo.",
  "ob.continue": "Magpatuloy sa Talatanungan",
};

const mg: Partial<Record<TranslationKey, string>> = {
  "qst.title": "Fanontaniana momba ny tontolo eo an-toerana",
  "qst.subtitle":
    "Manampia anay hahatakatra ny fiteny, ny kolontsaina, ary ny fanandramana azonao ampiasaina hanombanana ny valiny avy amin'ny IA.",
  "qst.continue": "Manohy mankany amin'ny fitsapana fahaiza-manao",
  "qst.placeholder": "Ny valinteninao…",
  "common.back": "Miverina",
  "common.continue": "Manohy",
  "common.saving": "Mitahiry…",
  "common.preferredLanguage": "Fiteny tiana",
  "common.preferredLanguageHint":
    "Hampiasainay manerana ny fampiharana io fiteny io. Azonao ovaina amin'ny fotoana rehetra.",
  "common.demoCountry": "Firenena fampisehoana",
  "nav.home": "Fandraisana",
  "nav.getStarted": "Manomboka",
  "nav.startDemo": "Atombohy ny Demo",
  "ob.step": "Dingana 01",
  "ob.title": "Ny mombamomba anao",
  "ob.continue": "Manohy mankany amin'ny fanontaniana",
};

const tw: Partial<Record<TranslationKey, string>> = {
  "qst.title": "Ɔman mu nsɛmmisa",
  "qst.subtitle":
    "Boa yɛn ma yɛnte kasa, amammerɛ, ne osuahunu a wode betumi asusuw AI mmuae no.",
  "qst.continue": "Toa kɔ adwumayɛ ho nsɔhwɛ no so",
  "qst.placeholder": "Wo mmuae…",
  "common.back": "San",
  "common.continue": "Toa so",
  "common.saving": "Ɛrekora…",
  "common.preferredLanguage": "Kasa a wopɛ",
  "common.demoCountry": "Demo ɔman",
  "nav.home": "Fie",
  "nav.startDemo": "Hyɛ Demo no ase",
  "ob.title": "Wo ho amanneɛ",
  "ob.continue": "Toa kɔ nsɛmmisa no so",
};

const gaa: Partial<Record<TranslationKey, string>> = {
  "qst.title": "Mli sane he sane lɛ",
  "qst.subtitle":
    "Ye wɔ buaa kɛjɛ wiemɔ, kusum, kɛ niiashishitoo ni obaanyɛ okɛnyiɛɛ AI he hetoo lɛ ahe.",
  "qst.continue": "Ya nɔ kɛya nilee kaa lɛ mli",
  "qst.placeholder": "Ohetoo…",
  "common.back": "Ku sɛɛ",
  "common.continue": "Ya nɔ",
  "common.saving": "Eebafee…",
  "common.preferredLanguage": "Wiemɔ ni osumɔɔ",
  "common.demoCountry": "Demo maŋ",
  "nav.home": "Shia",
  "nav.startDemo": "Bɔi demo lɛ",
  "ob.title": "Ohe saji",
  "ob.continue": "Ya nɔ kɛya sane lɛ mli",
};

const kn: Partial<Record<TranslationKey, string>> = {
  "qst.title": "ಸ್ಥಳೀಯ ಸಂದರ್ಭ ಪ್ರಶ್ನಾವಳಿ",
  "qst.subtitle":
    "AI ಪ್ರತಿಕ್ರಿಯೆಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಲು ನೀವು ಬಳಸಬಹುದಾದ ಭಾಷೆ, ಸಂಸ್ಕೃತಿ ಮತ್ತು ಅನುಭವವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ನಮಗೆ ಸಹಾಯ ಮಾಡಿ.",
  "qst.continue": "ಕೌಶಲ್ಯ ಪರೀಕ್ಷೆಗೆ ಮುಂದುವರಿಸಿ",
  "qst.placeholder": "ನಿಮ್ಮ ಉತ್ತರ…",
  "common.back": "ಹಿಂದೆ",
  "common.continue": "ಮುಂದುವರಿಸಿ",
  "common.saving": "ಉಳಿಸಲಾಗುತ್ತಿದೆ…",
  "common.preferredLanguage": "ಆದ್ಯತೆಯ ಭಾಷೆ",
  "common.demoCountry": "ಡೆಮೋ ದೇಶ",
  "nav.home": "ಮುಖಪುಟ",
  "nav.startDemo": "ಡೆಮೋ ಪ್ರಾರಂಭಿಸಿ",
  "ob.title": "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್",
  "ob.continue": "ಪ್ರಶ್ನಾವಳಿಗೆ ಮುಂದುವರಿಸಿ",
};

// Tier-3 dialects: empty dictionaries; UI follows the parent in fallback chain.
const empty: Partial<Record<TranslationKey, string>> = {};

const dictionaries: Record<LocaleCode, Partial<Record<TranslationKey, string>>> = {
  // Tier 1
  en, fr, pt, es, sw,
  // Tier 2
  mg, tw, gaa, hi, kn, zu, xh, yo, ar, tl,
  // Tier 3 (fallback chain delivers UI)
  bahian: empty, paisa: empty, sheng: empty, darija: empty, taglish: empty, pcm: empty,
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Resolve a translation key for the active locale.
 *
 * Lookup order:
 *   1. Walk the dictionary fallback chain (target → fallback → … → en)
 *      — instant, zero network.
 *   2. Auto-translation cache (populated by previous MyMemory calls)
 *      — instant, served from localStorage.
 *   3. If steps 1–2 only yield English and the user picked a non-English
 *      locale that has no dictionary, kick off a background MT request and
 *      return English in the meantime. When the translation arrives, the
 *      LocaleProvider re-renders and `translate()` picks up the cached value.
 *
 * Cycles in the fallback chain are protected via a `visited` set.
 */
export function translate(locale: LocaleCode, key: TranslationKey): string {
  const visited = new Set<LocaleCode>();
  let current: LocaleCode | undefined = locale;
  let foundBeforeEnglish: string | null = null;

  while (current && !visited.has(current)) {
    visited.add(current);
    const value = dictionaries[current]?.[key];
    if (value) {
      // If we found a translation in the requested locale itself, we're done.
      if (current === locale) return value;
      foundBeforeEnglish = value;
      // Keep walking — but only past the English root, since "en" is our
      // ultimate fallback. We prefer the closest non-English match if any.
      if (current === "en") break;
    }
    current = SUPPORTED_LOCALES[current]?.fallback;
  }

  // Step 2: runtime auto-translation cache
  if (locale !== "en") {
    const cached = getCachedAutoTranslation(locale, key);
    if (cached) return cached;
  }

  // Step 3: kick off MT for the missing key, return best fallback for now
  const englishSource = en[key];
  if (locale !== "en" && englishSource) {
    requestAutoTranslation(locale, key, englishSource);
  }

  return foundBeforeEnglish ?? englishSource ?? key;
}

// ─── Backward-compatible API used by older code paths ───────────────────────
// (older callers use `getTranslations(locale).q1` etc.)
export type TranslationKeys = {
  title: string; subtitle: string;
  q1: string; q2: string; q3: string; q4: string; q5: string;
  q6: string; q7: string; q8: string; q9: string; q10: string;
  continue: string; prototypeNote: string;
};

export function getTranslations(locale: LocaleCode): TranslationKeys {
  const t = (k: TranslationKey) => translate(locale, k);
  return {
    title: t("qst.title"),
    subtitle: t("qst.subtitle"),
    q1: t("qst.q1"), q2: t("qst.q2"), q3: t("qst.q3"), q4: t("qst.q4"), q5: t("qst.q5"),
    q6: t("qst.q6"), q7: t("qst.q7"), q8: t("qst.q8"), q9: t("qst.q9"), q10: t("qst.q10"),
    continue: t("qst.continue"),
    prototypeNote: t("qst.prototypeNote"),
  };
}
