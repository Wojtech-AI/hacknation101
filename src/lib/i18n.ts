import type { LocaleCode } from "./countryConfigs";

type TranslationKeys = {
  title: string;
  subtitle: string;
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
  continue: string;
  prototypeNote: string;
};

const translations: Record<LocaleCode, TranslationKeys> = {
  en: {
    title: "Local Context Questionnaire",
    subtitle: "Help us understand the language, culture, and lived experience you could use to evaluate AI outputs.",
    q1: "What country or community are you most familiar with?",
    q2: "What languages or dialects can you read, write, and understand?",
    q3: "What local phrase, food, tradition, sport, place, or community activity might AI describe badly?",
    q4: "What would an outsider or AI system usually get wrong about it?",
    q5: "What topics from your community could you confidently judge AI answers about?",
    q6: "Give one local phrase or expression that does not translate literally.",
    q7: "How would you explain its real meaning to an outsider?",
    q8: "What local advice might sound correct online but would not work in your community?",
    q9: "How would you check if an AI-generated claim about your community is true?",
    q10: "Would you like to progress into higher-value roles such as AI output evaluator, cultural QA reviewer, fact-checking reviewer, or community trainer?",
    continue: "Continue to Skill Test",
    prototypeNote:
      "Prototype localisation: questionnaire text is translated for demo purposes and would require local validation before deployment.",
  },
  fr: {
    title: "Questionnaire de contexte local",
    subtitle:
      "Aidez-nous à comprendre la langue, la culture et l'expérience vécue que vous pourriez utiliser pour évaluer les réponses de l'IA.",
    q1: "Quel pays ou quelle communauté connaissez-vous le mieux ?",
    q2: "Quelles langues ou quels dialectes pouvez-vous lire, écrire et comprendre ?",
    q3: "Quelle expression locale, nourriture, tradition, activité sportive, lieu ou activité communautaire l'IA pourrait-elle mal décrire ?",
    q4: "Qu'est-ce qu'une personne extérieure ou un système d'IA comprendrait mal à ce sujet ?",
    q5: "Sur quels sujets de votre communauté pourriez-vous évaluer les réponses de l'IA avec confiance ?",
    q6: "Donnez une expression locale qui ne se traduit pas littéralement.",
    q7: "Comment expliqueriez-vous son vrai sens à une personne extérieure ?",
    q8: "Quel conseil local pourrait sembler correct en ligne, mais ne fonctionnerait pas dans votre communauté ?",
    q9: "Comment vérifieriez-vous si une affirmation générée par l'IA sur votre communauté est vraie ?",
    q10: "Souhaitez-vous évoluer vers des rôles plus avancés, comme évaluateur de réponses IA, réviseur culturel, vérificateur de faits ou formateur communautaire ?",
    continue: "Continuer vers le test de compétences",
    prototypeNote:
      "Localisation prototype : le texte du questionnaire est traduit pour la démonstration et nécessiterait une validation locale avant déploiement.",
  },
  pt: {
    title: "Questionário de contexto local",
    subtitle:
      "Ajude-nos a entender a língua, a cultura e a experiência local que você poderia usar para avaliar respostas de IA.",
    q1: "Qual país ou comunidade você conhece melhor?",
    q2: "Quais línguas ou dialetos você consegue ler, escrever e entender?",
    q3: "Que expressão local, comida, tradição, esporte, lugar ou atividade comunitária a IA poderia descrever mal?",
    q4: "O que uma pessoa de fora ou um sistema de IA normalmente entenderia errado sobre isso?",
    q5: "Sobre quais temas da sua comunidade você conseguiria avaliar respostas de IA com confiança?",
    q6: "Dê um exemplo de expressão local que não pode ser traduzida literalmente.",
    q7: "Como você explicaria o verdadeiro significado dela para alguém de fora?",
    q8: "Que conselho local poderia parecer correto online, mas não funcionaria na sua comunidade?",
    q9: "Como você verificaria se uma afirmação gerada por IA sobre sua comunidade é verdadeira?",
    q10: "Você gostaria de avançar para funções de maior valor, como avaliador de respostas de IA, revisor cultural, verificador de fatos ou formador comunitário?",
    continue: "Continuar para o teste de competência",
    prototypeNote:
      "Localização de protótipo: o texto do questionário é traduzido para fins de demonstração e exigiria validação local antes da implementação.",
  },
  es: {
    title: "Cuestionario de contexto local",
    subtitle:
      "Ayúdanos a entender el idioma, la cultura y la experiencia local que podrías usar para evaluar respuestas de IA.",
    q1: "¿Qué país o comunidad conoces mejor?",
    q2: "¿Qué idiomas o dialectos puedes leer, escribir y entender?",
    q3: "¿Qué expresión local, comida, tradición, deporte, lugar o actividad comunitaria podría describir mal la IA?",
    q4: "¿Qué suele entender mal una persona externa o un sistema de IA sobre ese tema?",
    q5: "¿Sobre qué temas de tu comunidad podrías evaluar respuestas de IA con confianza?",
    q6: "Da un ejemplo de una expresión local que no se traduzca literalmente.",
    q7: "¿Cómo explicarías su significado real a una persona externa?",
    q8: "¿Qué consejo local podría parecer correcto en internet, pero no funcionar en tu comunidad?",
    q9: "¿Cómo comprobarías si una afirmación generada por IA sobre tu comunidad es verdadera?",
    q10: "¿Te gustaría avanzar hacia funciones de mayor valor, como evaluador de respuestas de IA, revisor cultural, verificador de hechos o formador comunitario?",
    continue: "Continuar al test de habilidad",
    prototypeNote:
      "Localización de prototipo: el texto del cuestionario está traducido para la demostración y requeriría validación local antes del despliegue.",
  },
  sw: {
    title: "Dodoso la muktadha wa jamii",
    subtitle:
      "Tusaidie kuelewa lugha, utamaduni na uzoefu wa maisha ambao unaweza kutumia kutathmini majibu ya AI.",
    q1: "Ni nchi au jamii gani unaifahamu zaidi?",
    q2: "Ni lugha au lahaja gani unaweza kusoma, kuandika na kuelewa?",
    q3: "Ni msemo, chakula, desturi, mchezo, eneo au shughuli gani ya jamii ambayo AI inaweza kuelezea vibaya?",
    q4: "Mtu wa nje au mfumo wa AI kwa kawaida angekosea nini kuhusu hilo?",
    q5: "Ni mada gani kutoka jamii yako unaweza kutathmini majibu ya AI kwa kujiamini?",
    q6: "Toa mfano wa msemo wa kienyeji ambao hautafsiriki moja kwa moja.",
    q7: "Ungeelezaje maana yake halisi kwa mtu wa nje?",
    q8: "Ni ushauri gani unaweza kuonekana sahihi mtandaoni lakini usifanye kazi katika jamii yako?",
    q9: "Ungethibitishaje kama dai lililotengenezwa na AI kuhusu jamii yako ni kweli?",
    q10: "Je, ungependa kuendelea hadi majukumu ya juu zaidi kama mtathmini wa majibu ya AI, mhakiki wa muktadha wa kitamaduni, mhakiki wa ukweli au mkufunzi wa jamii?",
    continue: "Endelea kwenye jaribio la ujuzi",
    prototypeNote:
      "Ujanibishaji wa mfano: maandishi ya dodoso yametafsiriwa kwa madhumuni ya onyesho na yangehitaji uthibitishaji wa ndani kabla ya kutumika.",
  },
};

export function getTranslations(locale: LocaleCode): TranslationKeys {
  return translations[locale] ?? translations.en;
}
