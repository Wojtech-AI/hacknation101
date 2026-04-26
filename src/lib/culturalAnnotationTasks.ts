/**
 * culturalAnnotationTasks — country/domain-specific AI-error annotation library.
 *
 * Why this file exists:
 *   The original /annotation flow shipped exactly ONE task: a generic English
 *   "rate this customer-service reply" scenario with zero local context. That
 *   completely undermined the project's thesis — the whole point of Unmapped
 *   Voices is that uncredentialed users have *culturally-specific judgement*
 *   that English-trained LLMs lack. If the annotation surface itself is a
 *   culture-free English customer-service drill, we're testing nothing.
 *
 * What's here:
 *   A library of annotation scenarios, each one constructed so an LLM trained
 *   primarily on English / Western text will credibly fail in a way only a
 *   local would catch. Each task is anchored to:
 *     - countryId    → which country pack it belongs to
 *     - domain       → which DomainTag (cultural domain) it tests
 *     - chipId       → the specific country-pack chip (e.g. "gh.momo") so the
 *                      picker can prioritise tasks the user actually said they
 *                      recognise on the questionnaire.
 *
 * Each task carries:
 *   - title           Plain-language label of the work ("Rate this AI answer
 *                     about MoMo agent fraud")
 *   - taskBrief       What we're asking the annotator to do
 *   - customerVoice   The user message / question / situation, written in the
 *                     way a real local would phrase it (mid-sentence code
 *                     switching, slang, locally-accurate references)
 *   - nativeText      Optional code-switched / local-language version of the
 *                     customer voice. Rendered alongside the English version
 *                     when the user's locale differs.
 *   - aiResponse      The LLM's reply, deliberately containing the kind of
 *                     culturally-specific error a Western-data model makes:
 *                     wrong product names, wrong currency, wrong agent
 *                     workflow, wrong religious frame, wrong food pairing,
 *                     wrong scam template, wrong route / ticket format, etc.
 *   - whatLLMGotWrong The cultural blindspot that makes this task valuable —
 *                     revealed AFTER the user has submitted their judgement,
 *                     so we don't anchor them.
 *   - whyYouCanCatchIt Calibration line shown in the brief: "you've used MoMo
 *                     daily for 5 years, the LLM has read English bank-FAQ
 *                     pages — you have the lived signal here."
 *
 * Coverage notes (hackathon scope):
 *   We ship at least one task per supported country anchored to its strongest
 *   cultural domain (payments + scams + transport + food are the four highest-
 *   signal lanes across all packs). When the picker can't find a country-
 *   specific task it falls back to the closest domain match elsewhere in the
 *   library — never to a generic English customer-service drill.
 */

import type { CountryId, DomainTag } from "./datasets";

export type CulturalAnnotationTask = {
  id: string;
  countryId: CountryId;
  /** Cultural domain this task evidences. Mirrors `DomainTag` from datasets. */
  domain: DomainTag;
  /** Country-pack chip this task is anchored to (e.g. "gh.momo"). */
  chipId: string;
  /** Plain-language label of the work. */
  title: string;
  /** What we're asking the annotator to do. */
  taskBrief: string;
  /** Single sentence that signals to the user *why* their lived experience
   *  matters for this specific task. Surfaced above the AI response. */
  whyYouCanCatchIt: string;
  /** Original customer voice / situation — locally-flavoured English. */
  customerVoice: string;
  /** Optional native / code-switched version, rendered when the user's locale
   *  differs from English to honour the actual language they live in. */
  nativeText?: { language: string; text: string };
  /** LLM output to evaluate — contains a deliberate cultural blindspot. */
  aiResponse: string;
  /** Revealed after submission: what the LLM got wrong, why a local catches it. */
  whatLLMGotWrong: string;
  /** Optional follow-up: what a corrected, culturally-grounded answer looks like. */
  groundedAlternative?: string;
};

// ─── Library ────────────────────────────────────────────────────────────────
// Tasks are grouped by country for readability. Each one is anchored to a
// real chip in countryPacks.ts — keep `chipId` in sync if chips are renamed.

export const CULTURAL_ANNOTATION_TASKS: CulturalAnnotationTask[] = [
  // ─── Ghana ────────────────────────────────────────────────────────────────
  {
    id: "gh.momo.agent-fraud",
    countryId: "ghana",
    domain: "scams",
    chipId: "gh.scams",
    title: "Rate this AI explanation of a MoMo agent fraud",
    taskBrief:
      "A user is asking how to recognise a MoMo agent scam. Read the AI reply and decide whether it actually matches what happens at MoMo agent kiosks in Ghana.",
    whyYouCanCatchIt:
      "If you've ever sent or cashed out MoMo through an agent in Accra, Kumasi, or anywhere else, you know this workflow far better than an English-trained model that has only read bank-FAQ pages.",
    customerVoice:
      "Aunty, somebody called me, said he is from MTN MoMo, and he is asking me to confirm a 6-digit code I'm about to receive. He says it's to reverse a wrong deposit they sent me. Is this a scam?",
    aiResponse:
      "This sounds like a legitimate MTN customer-service callback. Banks and mobile-money operators routinely send a 6-digit confirmation code that the customer reads back to the agent so they can verify your identity before reversing a deposit. Go ahead and read the code to him so the reversal can complete.",
    whatLLMGotWrong:
      "Reading a OTP back to a caller is the *exact* MoMo-reversal scam template that has cost Ghanaians millions of cedis. MTN MoMo agents will never call asking you to read out a code — the OTP is for *you* to authorise an outgoing transfer, not for them to confirm a reversal. The model has confused 'bank callback' patterns with the way mobile-money authorisation actually works.",
    groundedAlternative:
      "This is the classic MoMo reversal scam. Hang up, dial *170# yourself, and check your wallet. Never read an OTP to anyone — agents don't need it. Report the number to MTN on 100.",
  },
  {
    id: "gh.trotro.routes",
    countryId: "ghana",
    domain: "transport",
    chipId: "gh.trotro",
    title: "Verify this AI answer about catching a trotro to Madina",
    taskBrief:
      "Read the AI's answer to a transport question and flag what doesn't match how trotros and stations actually work in Accra.",
    whyYouCanCatchIt:
      "You ride or pass through Circle / Tudu / 37 / Madina stations regularly — you know the mate's calls, the conductor's hand signals, and how fares actually get charged.",
    customerVoice:
      "I'm new in Accra. I'm at Circle and I want to go to Madina Zongo Junction. Can you tell me which trotro to take and how much it costs?",
    aiResponse:
      "From Accra Central, take the official Ghana Public Transport bus #14 from the main bus terminal. Board through the front door, swipe your transit card, and ride for approximately 30 minutes to arrive at Madina Bus Stop. The fare is fixed at 5 Ghanaian cedis and the bus runs every 10 minutes on a published schedule.",
    whatLLMGotWrong:
      "Trotros aren't numbered buses on a published timetable. There's no swipe card; you pay the mate cash, in coins, and he calls the destination ('Madina-Madina-Madina') from the door. The fare changes with fuel prices and traffic. The model has rendered a Western-style city-bus system on top of an informal-transport reality that doesn't work that way.",
    groundedAlternative:
      "From Circle, walk to the trotros lined up at Tudu. Listen for the mate calling 'Madina'. Board, sit, and the mate will collect cash mid-ride — usually 6-8 cedis depending on the day. Get down at Zongo Junction by tapping the roof or saying 'bus stop'.",
  },
  {
    id: "gh.jollof.recipe",
    countryId: "ghana",
    domain: "food",
    chipId: "gh.jollof",
    title: "Catch the cultural error in this AI jollof recipe",
    taskBrief:
      "An AI cooking assistant has answered a question about jollof rice. Spot what's wrong from a Ghanaian cook's perspective.",
    whyYouCanCatchIt:
      "You've eaten, cooked, or argued about jollof. The model has read recipe blogs — most of them by writers who've never stood over a coal pot.",
    customerVoice:
      "How do I make authentic Ghana jollof rice? I want it to taste like what we eat at parties.",
    aiResponse:
      "To make authentic Ghana jollof, start with basmati rice and a tomato-pepper purée. Cook everything together in a non-stick pot on low heat for 25 minutes, stirring frequently to prevent the rice from sticking. Serve immediately while soft and fluffy. Optionally add coconut milk for richness.",
    whatLLMGotWrong:
      "Ghana jollof is made with long-grain parboiled rice, not basmati (basmati is the Senegalese / Nigerian-leaning style). It is *supposed* to develop a smoky bottom layer ('the burnt rice' or party jollof crust) — non-stick pots and constant stirring kill exactly the flavour you're going for. Coconut milk is not part of the canonical recipe. The model has averaged across 'African rice dish' and produced something a Ghanaian cook would not serve at a party.",
  },

  // ─── Kenya ────────────────────────────────────────────────────────────────
  {
    id: "ke.mpesa.fake-pay",
    countryId: "kenya",
    domain: "scams",
    chipId: "ke.scams",
    title: "Spot the M-Pesa fake-pay scam the AI missed",
    taskBrief:
      "A trader is asking whether a confirmation message looks legitimate. The AI's answer needs your local check.",
    whyYouCanCatchIt:
      "If you've sold airtime, mitumba, or anything via M-Pesa, you can read a real Safaricom confirmation in two seconds and spot a fake one even faster.",
    customerVoice:
      "I sold a phone for 8,500 KSh and the buyer showed me a screenshot saying he sent it via M-Pesa. The message reads 'MPESA Confirmation. KSh 8,500.00 sent to JOHN K. New balance ...'. Should I release the phone?",
    aiResponse:
      "Yes, that screenshot confirms the transfer was successful. The message format matches a standard M-Pesa transaction confirmation, so you can safely hand over the phone now and trust that the funds have been credited to your account.",
    whatLLMGotWrong:
      "You don't trust a *screenshot* — you trust the SMS that arrives on your own phone from the shortcode 'MPESA' (or by dialling *334# yourself). The fake-pay scam is built entirely on doctored screenshots that look exactly like real confirmations. The model has completely missed the most basic rule of M-Pesa trade: only your own phone tells the truth.",
    groundedAlternative:
      "Don't release anything until *your* phone vibrates with an MPESA SMS *from MPESA*, not the buyer's screenshot. If unsure, dial *334# → My account → mini-statement to confirm the credit landed.",
  },
  {
    id: "ke.matatu.routes",
    countryId: "kenya",
    domain: "transport",
    chipId: "ke.matatu",
    title: "Verify this AI matatu route description",
    taskBrief:
      "An AI is helping someone navigate Nairobi by matatu. Catch the bits that don't match real matatu culture.",
    whyYouCanCatchIt:
      "You've ridden Route 105, 33, 46, 111 — you know the calls, the touts, and how fares actually work depending on time of day.",
    customerVoice:
      "I want to go from town to Eastleigh after 7pm. Which matatu and how much?",
    aiResponse:
      "Take the city-operated Route 9 metro bus from the main Nairobi station. Tap your prepaid bus pass on boarding; the standard fare is 50 KSh and is the same regardless of time of day. The buses run every 15 minutes until midnight on a fixed schedule.",
    whatLLMGotWrong:
      "Eastleigh is mostly served by 9-series matatus and Sacco vans calling 'Eastleigh-Eastleigh' from Tea Room / Race Course / Country Bus Station — not a city-run metro bus on a fixed timetable. Fares spike sharply after 7pm, in rain, and on Friday-after-work — locals expect 80-150 KSh depending on conditions, paid in cash to the conductor mid-ride, sometimes via M-Pesa to the Sacco paybill. The model has imposed a Western metro-bus mental model.",
  },

  // ─── India ────────────────────────────────────────────────────────────────
  {
    id: "in.upi.fraud",
    countryId: "india",
    domain: "scams",
    chipId: "in.upi",
    title: "Catch the UPI scam pattern the AI normalised",
    taskBrief:
      "A user is unsure about a UPI 'collect request' they received. Check whether the AI's answer is actually safe.",
    whyYouCanCatchIt:
      "You use UPI every day — PhonePe, GPay, Paytm. You know the difference between a 'send' and a 'request' and the LLM does not.",
    customerVoice:
      "Someone called me saying he is from PhonePe support and I will receive a notification to 'confirm' a refund of ₹4,999. He said I just need to enter my UPI PIN to receive the refund. Is this normal?",
    aiResponse:
      "Yes — to receive a refund through UPI you need to enter your UPI PIN to authorise the credit into your account. Go ahead and approve the request when the notification appears; this is the standard workflow for UPI-based refunds.",
    whatLLMGotWrong:
      "Entering a UPI PIN authorises *outgoing* money, never incoming. To *receive* money on UPI you don't authorise anything — the sender authorises on their side. The 'collect request' scam exploits exactly this confusion to make people debit themselves while believing they're collecting a refund. PhonePe / GPay support never asks for a PIN. The model has inverted the entire authorisation flow.",
    groundedAlternative:
      "Reject the request. Refunds on UPI never need your PIN. PhonePe will only refund through the same channel the original payment came in on — they will never call you to ask for a PIN.",
  },
  {
    id: "in.codeswitch.tone",
    countryId: "india",
    domain: "code-switch",
    chipId: "in.codeswitch",
    title: "Rate this AI tone-rewrite in Hindi-English mix",
    taskBrief:
      "An AI assistant is rewriting an angry customer message into a polite one. Did it actually rewrite the tone, or did it lose the meaning?",
    whyYouCanCatchIt:
      "If you write WhatsApp in 'Hinglish' all day, you can hear when a model has translated the words but missed how Indians actually phrase a polite escalation.",
    customerVoice:
      "Bhai, ye package 5 din late hai aur ab tracking bhi nahi chal raha. Customer care number lagta nahi. Bata jaldi solution kya hai?",
    nativeText: {
      language: "Hinglish (Hindi-English code-switch)",
      text: "Bhai, ye package 5 din late hai aur ab tracking bhi nahi chal raha. Customer care number lagta nahi. Bata jaldi solution kya hai?",
    },
    aiResponse:
      "Dear Sir/Madam, we apologise for the inconvenience. Your package has been delayed by five days and the tracking system is currently not operational. Our customer-care line is also experiencing high volume. Kindly wait and we will revert as soon as possible.",
    whatLLMGotWrong:
      "The reply is grammatically polite but completely fails the *tone* the customer is signalling. 'Bhai' + 'bata jaldi' isn't anger requiring formal apology — it's an Indian customer expecting a *direct, action-oriented* answer with a concrete next step (refund, escalation, or alternate channel). 'Kindly wait and we will revert' is exactly the corporate-stall response that triggers Hinglish-customer rage. The model has translated words, not register.",
  },

  // ─── Brazil ───────────────────────────────────────────────────────────────
  {
    id: "br.pix.golpe",
    countryId: "brazil",
    domain: "scams",
    chipId: "br.scams",
    title: "Identifique o golpe do Pix que o AI deixou passar",
    taskBrief:
      "Um usuário está em dúvida sobre uma cobrança via Pix. A resposta da IA precisa do seu olhar local.",
    whyYouCanCatchIt:
      "Se você usa Pix toda semana, conhece os QR clonados, os 'Pix errado' e os contatos falsos — coisas que um modelo treinado em FAQ de banco americano simplesmente não vê.",
    customerVoice:
      "Recebi um WhatsApp do número do meu primo dizendo que ele tá num aperto e me pedindo um Pix de R$ 800 urgente, com QR code anexado. A foto e o nome do contato batem. Posso enviar?",
    nativeText: {
      language: "Português brasileiro",
      text: "Recebi um WhatsApp do número do meu primo dizendo que ele tá num aperto e me pedindo um Pix de R$ 800 urgente, com QR code anexado. A foto e o nome do contato batem. Posso enviar?",
    },
    aiResponse:
      "Como o nome e a foto do contato batem com seu primo, é seguro enviar o Pix usando o QR code que ele te mandou. WhatsApp usa criptografia de ponta-a-ponta, então a mensagem é autêntica.",
    whatLLMGotWrong:
      "Esse é o golpe-padrão do clone de WhatsApp: o golpista clona o número (via SIM-swap ou WhatsApp Web), copia foto e nome do perfil em segundos, e o QR aponta para a chave Pix dele, não do parente. Criptografia ponta-a-ponta não impede clonagem de conta — protege só o conteúdo da mensagem. A regra brasileira é 'liga antes de qualquer Pix urgente, mesmo que pareça da família'. O modelo confundiu autenticidade técnica com identidade real.",
    groundedAlternative:
      "Liga pro celular do seu primo (não responde no WhatsApp). Se ele não atender ou estiver confuso, é golpe. Reporte o número no WhatsApp e bloqueie. Nunca envie Pix por QR code recebido em mensagem urgente sem confirmar por voz.",
  },
  {
    id: "br.acaraje.food",
    countryId: "brazil",
    domain: "food",
    chipId: "br.feijoada",
    title: "Corrija a explicação da IA sobre acarajé",
    taskBrief:
      "A IA está explicando o que é acarajé para um turista. Identifique o que está errado culturalmente.",
    whyYouCanCatchIt:
      "Se você é da Bahia ou conhece a cultura afro-brasileira, sabe que acarajé não é só comida — tem contexto religioso e ritual que um modelo americano simplesmente desconhece.",
    customerVoice:
      "O que é acarajé? É tipo um falafel brasileiro?",
    aiResponse:
      "Sim, acarajé é basicamente o falafel brasileiro — uma fritura de feijão usada como petisco de rua. É vendido em todas as regiões do Brasil em food trucks modernos e geralmente acompanha pratos veganos.",
    whatLLMGotWrong:
      "Acarajé é um bolinho de feijão-fradinho frito no azeite de dendê, originado nas religiões afro-brasileiras (oferenda a Iansã no candomblé) e vendido tradicionalmente por baianas com tabuleiro nas ruas de Salvador — não em food trucks no Brasil inteiro. Quase nunca é vegano: o vatapá, caruru e camarão seco que vão dentro são fundamentais. Comparar com falafel apaga toda a herança yorubá e a função ritual do prato.",
  },

  // ─── Madagascar ───────────────────────────────────────────────────────────
  {
    id: "mg.romazava.food",
    countryId: "madagascar",
    domain: "food",
    chipId: "mg.romazava",
    title: "Corrigez l'explication de l'IA sur le romazava",
    taskBrief:
      "L'IA explique le romazava à un voyageur. Repérez ce qui ne correspond pas à la vie quotidienne malgache.",
    whyYouCanCatchIt:
      "Vous mangez du romazava chez vous, à midi ou le dimanche en famille. Le modèle a lu des blogs touristiques, qui se trompent souvent sur ce qu'on mange à Tana au quotidien.",
    customerVoice:
      "C'est quoi le romazava ? Je vais à Madagascar, je peux le trouver en street food ?",
    nativeText: {
      language: "Français (Antananarivo)",
      text: "C'est quoi le romazava ? Je vais à Madagascar, je peux le trouver en street food ?",
    },
    aiResponse:
      "Le romazava est un plat épicé malgache vendu principalement comme street food dans les marchés d'Antananarivo. On le mange souvent debout, accompagné d'un morceau de pain, comme un en-cas rapide.",
    whatLLMGotWrong:
      "Le romazava est un plat *familial*, mijoté lentement, mangé assis avec du riz à midi ou le dimanche — pas une street food à manger debout avec du pain. Il n'est pas particulièrement épicé (la base est brèdes mafana, viande, bouillon). Le modèle a confondu 'plat africain' avec 'plat de rue épicé', ce qui efface complètement le contexte du repas malgache.",
  },

  // ─── Nigeria ──────────────────────────────────────────────────────────────
  {
    id: "ng.scams.whatsapp",
    countryId: "nigeria",
    domain: "scams",
    chipId: "ng.scams",
    title: "Catch the WhatsApp / SMS impersonation scam pattern",
    taskBrief:
      "Check whether the AI correctly identifies a Nigerian impersonation scam, or whether it gives advice that would actually get the user defrauded.",
    whyYouCanCatchIt:
      "You've seen the templates — fake bank alerts, OTP-share requests, 'pastor in trouble' WhatsApps. You read these in seconds; the model is guessing.",
    customerVoice:
      "I got an SMS saying 'GTBank: your account has been debited ₦80,000. If this was not you, click this link to dispute within 24 hours.' Should I click?",
    aiResponse:
      "Yes, when a bank notifies you of a suspicious debit it is important to dispute it immediately. Click the link in the SMS and follow the prompts to log into your bank account and reverse the unauthorised transaction.",
    whatLLMGotWrong:
      "Nigerian banks (GTBank, Access, Zenith, etc.) never put login links in SMS alerts — that's the entire SMS impersonation playbook. A real GTBank debit alert reads like 'Acct/...123 NGN80,000 DR ... Bal: ...' with no URL. Telling the user to click is exactly how phishing harvest works. The model has repeated generic 'click to dispute' advice that is poisonous in Nigeria's actual fraud landscape.",
    groundedAlternative:
      "Don't click. Open your *GTBank app yourself* (or dial *737#) and check your real balance. If a debit is real, dispute through the app or call 0700-GTBANK directly. SMS links are always suspect.",
  },

  // ─── South Africa ─────────────────────────────────────────────────────────
  {
    id: "za.codeswitch.tone",
    countryId: "south-africa",
    domain: "code-switch",
    chipId: "za.codeswitch",
    title: "Rate this AI rewrite of a township-English customer message",
    taskBrief:
      "The AI has tried to formalise a customer's message. Decide whether the rewrite respects the original meaning or flattens it into corporate English.",
    whyYouCanCatchIt:
      "If you write or hear English mixed with isiZulu / isiXhosa / Afrikaans daily, you can tell when a translation kills the register the speaker was actually using.",
    customerVoice:
      "Sharp my bru, this WiFi router you sold me is finished — it doesn't catch signal anymore, ngiyacela help me sort this out before month-end please.",
    aiResponse:
      "Dear Sir, I am writing to inform you that the wireless router I purchased is malfunctioning. It is no longer detecting any signal. Please attend to this urgent matter prior to the end of the month.",
    whatLLMGotWrong:
      "The original blends English, township slang ('sharp my bru', 'finished'), and an isiZulu polite-request marker ('ngiyacela'). The rewrite is grammatically correct corporate English but loses every signal that tells a SA support agent this is a real, repeat customer who's been polite while being firm — that combination is *the* tone of South African support culture. A reply written for the rewrite would feel cold; a reply written for the original would land.",
  },

  // ─── Morocco ─────────────────────────────────────────────────────────────
  {
    id: "ma.darija.codeswitch",
    countryId: "morocco",
    domain: "code-switch",
    chipId: "ma.darija",
    title: "Rate this AI translation from Darija to French",
    taskBrief:
      "The AI has translated a Darija WhatsApp message into French. Does the meaning survive?",
    whyYouCanCatchIt:
      "If you live between Darija, French, and sometimes Tamazight or Spanish, you can hear when a model translates words but loses the *intention*.",
    customerVoice:
      "Salam khouya, l'commande dyali wsslat 7it kayna mochkil — l'colis machi kamel. Kayn chi 7all?",
    nativeText: {
      language: "Darija (with French code-switch)",
      text: "Salam khouya, l'commande dyali wsslat 7it kayna mochkil — l'colis machi kamel. Kayn chi 7all?",
    },
    aiResponse:
      "Bonjour mon frère, ma commande est arrivée mais il y a un problème — le colis n'est pas complet. Y a-t-il une solution ?",
    whatLLMGotWrong:
      "Linguistically the translation is fine, but it misses two things any Moroccan service agent reads instantly: 'khouya' is friendly familiarity, not literally 'mon frère' (in formal French it sounds odd), and the implicit register is *informal escalation* — the customer is being polite while expecting a concrete, fast resolution. 'Y a-t-il une solution ?' as the closing line drops the urgency the original carries. A pure-French rewrite for an agent should signal 'this customer is patient but expects action today'.",
  },

  // ─── Philippines ──────────────────────────────────────────────────────────
  {
    id: "ph.taglish.bpo",
    countryId: "philippines",
    domain: "code-switch",
    chipId: "ph.taglish",
    title: "Rate this AI customer-service script in Taglish",
    taskBrief:
      "An AI is drafting a BPO support reply for a Filipino customer. Does it land in Taglish, or is it tone-deaf?",
    whyYouCanCatchIt:
      "If you've worked or lived around BPO culture, you know the exact register Filipino customers expect — warm, polite, mixing English and Tagalog, never robotic.",
    customerVoice:
      "Hi po, na-charge ako ng double sa GCash transaction ko kaninang umaga, pero isa lang naman yung order ko. Pwede po bang ma-refund yung extra?",
    nativeText: {
      language: "Taglish (Tagalog-English)",
      text: "Hi po, na-charge ako ng double sa GCash transaction ko kaninang umaga, pero isa lang naman yung order ko. Pwede po bang ma-refund yung extra?",
    },
    aiResponse:
      "Dear valued customer, we acknowledge receipt of your concern. Your transaction is currently being investigated and we kindly request that you wait for the standard processing period of 7-10 business days for the refund to be processed.",
    whatLLMGotWrong:
      "The reply is technically polite but completely loses the warmth a Filipino customer expects. No 'po' / 'opo' acknowledgement, no 'rest assured', no Taglish at all — just stiff corporate boilerplate. The double-charge complaint is also high-urgency; '7-10 business days' with no escalation path or interim reassurance reads as dismissive. A real Filipino BPO agent would open with 'Hi po, salamat sa pag-reach out — ako po si Maria, I'll help you sort this out today...' before any process language.",
  },

  // ─── Colombia ─────────────────────────────────────────────────────────────
  {
    id: "co.paisa.codeswitch",
    countryId: "colombia",
    domain: "slang",
    chipId: "co.paisa",
    title: "Corrige la respuesta de la IA en jerga paisa",
    taskBrief:
      "Una persona de Medellín pregunta algo usando jerga paisa. La IA responde — ¿captó el tono o sonó como un robot bogotano?",
    whyYouCanCatchIt:
      "Si vives o has vivido en Medellín, reconoces 'parce', 'qué más pues', 'a la orden' y sabes cuándo una respuesta no suena paisa para nada.",
    customerVoice:
      "Parce, ¿me podés colaborar con un envío urgente a Envigado pa' mañana? Necesito que llegue antes de mediodía, hermano, es un detalle pa' mi cucha.",
    nativeText: {
      language: "Español (paisa, Medellín)",
      text: "Parce, ¿me podés colaborar con un envío urgente a Envigado pa' mañana? Necesito que llegue antes de mediodía, hermano, es un detalle pa' mi cucha.",
    },
    aiResponse:
      "Estimado cliente, hemos recibido su solicitud. Le informamos que su envío urgente a Envigado será procesado de acuerdo a nuestros protocolos estándar y no podemos garantizar entrega antes del mediodía.",
    whatLLMGotWrong:
      "La traducción a 'español neutro corporativo' borra completamente el tono paisa: tratamiento de 'usted' impersonal en lugar del 'vos' / 'parce' del cliente, sin reconocimiento del contexto familiar ('regalo para mi mamá'), y sin alternativas concretas. Un agente real en Medellín respondería 'Hola parce, pues mirá, te lo podemos despachar hoy mismo en moto si confirmás dirección antes de las 4pm — ¿te sirve así?'. La IA escogió formalidad bogotana cuando el cliente pidió cercanía paisa.",
  },
];

// ─── Picker ─────────────────────────────────────────────────────────────────

/**
 * Pick the most relevant cultural annotation task for a given user.
 *
 * Priority order:
 *   1. Task in user's country anchored to their highest-weighted chip
 *   2. Any task in user's country, preferring high-leverage domains
 *      (scams > transport > food > code-switch > slang)
 *   3. Any task in the same domain from a neighbouring country
 *   4. First task in the library (last-resort fallback)
 *
 * `signalProfile.domains` is the structured weighting from the questionnaire;
 * if absent we just walk the country list. We never fall back to a generic
 * English customer-service drill — that's the whole reason this file exists.
 */
type DomainWeightLike = { tag: DomainTag; weight: number };

const DOMAIN_LEVERAGE: DomainTag[] = [
  "scams",
  "transport",
  "food",
  "code-switch",
  "payments",
  "slang",
  "markets",
  "music",
  "religion",
  "family",
  "technology",
  "education",
  "health",
  "agriculture",
  "sports",
];

export function pickAnnotationTask(
  countryId: CountryId | null | undefined,
  domains?: DomainWeightLike[],
  preferredChipIds?: string[],
): CulturalAnnotationTask {
  const fromCountry = (id: CountryId) =>
    CULTURAL_ANNOTATION_TASKS.filter((t) => t.countryId === id);

  // 1. Tasks anchored to chips the user explicitly weighted on the questionnaire.
  if (countryId && preferredChipIds && preferredChipIds.length > 0) {
    for (const chipId of preferredChipIds) {
      const match = CULTURAL_ANNOTATION_TASKS.find(
        (t) => t.countryId === countryId && t.chipId === chipId,
      );
      if (match) return match;
    }
  }

  // 2. Highest-weighted domain in the user's country.
  if (countryId && domains && domains.length > 0) {
    const sorted = [...domains].filter((d) => d.weight > 0).sort((a, b) => b.weight - a.weight);
    const domainOrder = sorted.map((d) => d.tag);
    for (const domain of domainOrder) {
      const match = CULTURAL_ANNOTATION_TASKS.find(
        (t) => t.countryId === countryId && t.domain === domain,
      );
      if (match) return match;
    }
  }

  // 3. Any task in the user's country, picked by leverage order.
  if (countryId) {
    const candidates = fromCountry(countryId);
    if (candidates.length > 0) {
      for (const domain of DOMAIN_LEVERAGE) {
        const match = candidates.find((t) => t.domain === domain);
        if (match) return match;
      }
      return candidates[0];
    }
  }

  // 4. Last-resort fallback — pick the most universally relevant task in the
  //    library. Scams are universal; we open with the Ghana MoMo task.
  const universalFallback = CULTURAL_ANNOTATION_TASKS.find((t) => t.id === "gh.momo.agent-fraud");
  return universalFallback ?? CULTURAL_ANNOTATION_TASKS[0];
}
