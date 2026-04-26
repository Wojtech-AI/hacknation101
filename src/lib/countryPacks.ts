/**
 * Country packs — Zone B of the structured questionnaire.
 *
 * Each pack is a curated set of recognisable, country-specific things
 * (mobile-money rails, transport modes, foods, music, slang, scam
 * patterns…). Each chip is pre-mapped to a canonical `DomainTag` from
 * Phase 0a's esco-skills.ts taxonomy, so when the user weights a chip
 * 0..3 the matcher can route the signal directly into ESCO confidence
 * without further heuristics.
 *
 * Design choices:
 *   - 10–12 chips per country: enough breadth to feel local, few enough
 *     to fill in <60s.
 *   - Each chip carries a short hint (in English; the i18n layer can
 *     translate the labels via auto-translate) so users recognise it
 *     even if they wouldn't have used the canonical name.
 *   - Multiple chips can map to the same `DomainTag`. Their weights are
 *     averaged when extracting the SignalProfile so we don't double-count.
 */

import type { CountryId } from "./datasets";
import type { DomainTag } from "./datasets/esco-skills";

export type CountryPackChip = {
  /** Stable id, e.g. "ke.mpesa". Used for form state and analytics. */
  id: string;
  /** Human-readable display label. Translatable via auto-MT. */
  label: string;
  /** Canonical domain this chip maps to in DOMAIN_TO_ESCO. */
  domain: DomainTag;
  /** Optional micro-hint surfaced as a tooltip. */
  hint?: string;
};

export type CountryPack = {
  countryId: CountryId;
  /** Single sentence shown above the chip grid. */
  intro: string;
  chips: CountryPackChip[];
};

// ─── Pack definitions ──────────────────────────────────────────────────────

export const COUNTRY_PACKS: Record<CountryId, CountryPack> = {
  madagascar: {
    countryId: "madagascar",
    intro:
      "Tap things you'd recognise from daily life around Antananarivo and beyond. Pick the strength that fits.",
    chips: [
      { id: "mg.orangemoney", label: "Orange Money / Airtel Money", domain: "payments", hint: "Mobile-money agents and USSD codes" },
      { id: "mg.taxibe", label: "Taxi-be & local minibuses", domain: "transport" },
      { id: "mg.romazava", label: "Romazava, ravitoto, mofo gasy", domain: "food" },
      { id: "mg.salegy", label: "Salegy & hira gasy", domain: "music" },
      { id: "mg.codeswitch", label: "FR ↔ Malagasy switching", domain: "code-switch" },
      { id: "mg.markets", label: "Tana market lingo", domain: "markets" },
      { id: "mg.scams", label: "WhatsApp/SMS scam patterns", domain: "scams" },
      { id: "mg.family", label: "Family / fihavanana customs", domain: "family" },
      { id: "mg.phonerepair", label: "Street phone-repair / device hacks", domain: "technology" },
      { id: "mg.school", label: "School & exam life (BEPC, BAC)", domain: "education" },
    ],
  },

  ghana: {
    countryId: "ghana",
    intro:
      "Tap what you'd genuinely recognise — Accra, Kumasi, or your community. Strength = how confidently you could explain it.",
    chips: [
      { id: "gh.momo", label: "MTN MoMo / GhanaPay", domain: "payments", hint: "Mobile-money codes & agent culture" },
      { id: "gh.trotro", label: "Trotros & shared taxis", domain: "transport" },
      { id: "gh.jollof", label: "Jollof, fufu, banku, waakye", domain: "food" },
      { id: "gh.afro", label: "Highlife & Afrobeats", domain: "music" },
      { id: "gh.pidgin", label: "Twi / Pidgin slang", domain: "slang" },
      { id: "gh.codeswitch", label: "EN ↔ Twi/Ga switching", domain: "code-switch" },
      { id: "gh.makola", label: "Makola / Kejetia market English", domain: "markets" },
      // Renamed from "419-style scam patterns": "419" is a racialised shorthand
      // for Nigerian-coded fraud. Reframed as neutral, descriptive lived
      // expertise in the local fraud landscape (mobile-money + WhatsApp).
      { id: "gh.scams", label: "MoMo / WhatsApp scam patterns", domain: "scams" },
      { id: "gh.church", label: "Church & extended-family life", domain: "religion" },
      { id: "gh.school", label: "WASSCE / school exam culture", domain: "education" },
      { id: "gh.football", label: "Black Stars & local football", domain: "sports" },
      // Added: every other country pack carries a modern-work / tech chip
      // (Yaba/Lekki, Eastleigh, BPO, IT-startup, etc.). Ghana now does too —
      // surfaces the very real Accra/Kumasi tech & remote-work ecosystem.
      { id: "gh.tech", label: "Accra tech & remote-work ecosystem", domain: "technology", hint: "MEST / iSpace / Ashesi / customer-support hubs" },
    ],
  },

  brazil: {
    countryId: "brazil",
    intro:
      "Tap what you'd recognise from Brazil — anywhere from Salvador to São Paulo. Pick the strength that fits.",
    chips: [
      { id: "br.pix", label: "Pix / digital banking", domain: "payments" },
      { id: "br.transit", label: "Combis, ônibus, metrô", domain: "transport" },
      { id: "br.feijoada", label: "Feijoada, açaí, regional foods", domain: "food" },
      { id: "br.samba", label: "Samba, MPB, funk carioca", domain: "music" },
      { id: "br.bahian", label: "Nordestino / Bahian Portuguese", domain: "slang" },
      { id: "br.codeswitch", label: "EN ↔ PT in tech and gaming", domain: "code-switch" },
      { id: "br.football", label: "Futebol / torcida culture", domain: "sports" },
      { id: "br.religion", label: "Católica / evangélica / candomblé", domain: "religion" },
      { id: "br.scams", label: "Golpe Pix / WhatsApp clones", domain: "scams" },
      { id: "br.family", label: "Sunday family rituals", domain: "family" },
      { id: "br.markets", label: "Feiras & street commerce", domain: "markets" },
    ],
  },

  kenya: {
    countryId: "kenya",
    intro:
      "Tap things from daily Kenyan life — Nairobi, Mombasa, or your community.",
    chips: [
      { id: "ke.mpesa", label: "M-Pesa & Lipa Na", domain: "payments", hint: "Mobile-money flows and agent culture" },
      { id: "ke.matatu", label: "Matatus & boda-bodas", domain: "transport" },
      { id: "ke.sheng", label: "Sheng (Swahili-English mix)", domain: "slang" },
      { id: "ke.codeswitch", label: "EN ↔ Swahili ↔ Sheng switching", domain: "code-switch" },
      { id: "ke.ugali", label: "Ugali, nyama choma, sukuma wiki", domain: "food" },
      { id: "ke.bongo", label: "Bongo, Genge, Gengetone", domain: "music" },
      { id: "ke.mamamboga", label: "Mama mboga / informal markets", domain: "markets" },
      { id: "ke.scams", label: "M-Pesa scam / fake-pay tricks", domain: "scams" },
      { id: "ke.family", label: "Extended family & clan ties", domain: "family" },
      { id: "ke.juakali", label: "Jua kali / hustle economy", domain: "markets" },
      { id: "ke.tech", label: "Phone repair & Eastleigh tech", domain: "technology" },
    ],
  },

  india: {
    countryId: "india",
    intro:
      "Tap what you'd recognise from your part of India. Strength = how confidently you could judge AI answers about it.",
    chips: [
      { id: "in.upi", label: "UPI / GPay / PhonePe", domain: "payments" },
      { id: "in.transit", label: "Locals, autos, metro", domain: "transport" },
      { id: "in.food", label: "Biryani, dosa, thali, regional cuisines", domain: "food" },
      { id: "in.bollywood", label: "Bollywood / regional cinema & music", domain: "music" },
      { id: "in.hinglish", label: "Hinglish / regional slang", domain: "slang" },
      { id: "in.codeswitch", label: "EN ↔ Hindi/Kannada/regional switching", domain: "code-switch" },
      { id: "in.family", label: "Joint family & festival culture", domain: "family" },
      { id: "in.religion", label: "Festivals, temples, mosques, gurdwaras", domain: "religion" },
      { id: "in.bazaars", label: "Bazaars, kirana stores, haggling", domain: "markets" },
      { id: "in.scams", label: "OTP scam / digital-fraud patterns", domain: "scams" },
      { id: "in.tech", label: "IT / startup workplace exposure", domain: "technology" },
    ],
  },

  "south-africa": {
    countryId: "south-africa",
    intro:
      "Tap what you'd recognise from South African life — Joburg, Cape Town, township or rural.",
    chips: [
      { id: "za.taxi", label: "Minibus taxi / kombi culture", domain: "transport" },
      { id: "za.tsotsitaal", label: "Tsotsitaal / kasi slang", domain: "slang" },
      { id: "za.codeswitch", label: "Switching across 11 official languages", domain: "code-switch" },
      { id: "za.braai", label: "Braai, pap, koeksisters", domain: "food" },
      { id: "za.amapiano", label: "Kwaito & amapiano", domain: "music" },
      { id: "za.sports", label: "Rugby, soccer, cricket", domain: "sports" },
      { id: "za.spaza", label: "Spaza shops & informal markets", domain: "markets" },
      { id: "za.scams", label: "ATM/banking scam patterns", domain: "scams" },
      { id: "za.loadshedding", label: "Load-shedding / device-stability hacks", domain: "technology" },
      { id: "za.ubuntu", label: "Ubuntu & community values", domain: "family" },
    ],
  },

  nigeria: {
    countryId: "nigeria",
    intro:
      "Tap what you'd recognise from Nigerian daily life — Lagos, Abuja, your state.",
    chips: [
      { id: "ng.fintech", label: "Opay / Kuda / Moniepoint", domain: "payments" },
      { id: "ng.transit", label: "Danfo, BRT, okada, keke", domain: "transport" },
      { id: "ng.pidgin", label: "Nigerian Pidgin", domain: "slang" },
      { id: "ng.codeswitch", label: "EN ↔ Yoruba/Igbo/Hausa switching", domain: "code-switch" },
      { id: "ng.jollof", label: "Jollof, suya, egusi, pounded yam", domain: "food" },
      { id: "ng.afrobeats", label: "Afrobeats (Wizkid, Burna, Tems)", domain: "music" },
      { id: "ng.markets", label: "Balogun / Onitsha / Idumota markets", domain: "markets" },
      { id: "ng.religion", label: "Church, mosque & faith communities", domain: "religion" },
      // Renamed from "Yahoo / 419 scam patterns": both are loaded ethnonymic
      // labels for Nigerian-coded fraud that Nigerians themselves are working
      // to shed in international perception. Reframed neutrally to match every
      // other country pack (e.g. India "OTP scams", Brazil "Golpe Pix").
      { id: "ng.scams", label: "WhatsApp / SMS impersonation scams", domain: "scams" },
      { id: "ng.tech", label: "Yaba / Lekki tech ecosystem", domain: "technology" },
      { id: "ng.family", label: "Extended-family obligations", domain: "family" },
    ],
  },

  colombia: {
    countryId: "colombia",
    intro:
      "Tap what you'd recognise from Colombian life — Medellín, Bogotá, Costa, anywhere.",
    chips: [
      { id: "co.nequi", label: "Nequi / Daviplata / Bancolombia", domain: "payments" },
      { id: "co.transmi", label: "TransMilenio, busetas, motos", domain: "transport" },
      { id: "co.paisa", label: "Paisa & Costeño slang", domain: "slang" },
      { id: "co.codeswitch", label: "ES ↔ EN code-switching", domain: "code-switch" },
      { id: "co.food", label: "Bandeja paisa, arepas, ajiaco", domain: "food" },
      { id: "co.music", label: "Cumbia, vallenato, reggaetón", domain: "music" },
      { id: "co.tienda", label: "Tienda & barrio commerce", domain: "markets" },
      { id: "co.family", label: "Family-Sunday / community life", domain: "family" },
      { id: "co.scams", label: "WhatsApp / paquete chileno scams", domain: "scams" },
      { id: "co.religion", label: "Catholic festivities & traditions", domain: "religion" },
      { id: "co.football", label: "Fútbol & barra culture", domain: "sports" },
    ],
  },

  morocco: {
    countryId: "morocco",
    intro:
      "Tap what you'd recognise from daily Moroccan life — Casablanca, Rabat, Marrakech, anywhere.",
    chips: [
      { id: "ma.payments", label: "M2T, CIH Mobile, post-office cash", domain: "payments" },
      { id: "ma.taxi", label: "Grand taxi & petit taxi culture", domain: "transport" },
      { id: "ma.darija", label: "Darija (Moroccan Arabic)", domain: "slang" },
      { id: "ma.codeswitch", label: "Darija ↔ FR ↔ EN switching", domain: "code-switch" },
      { id: "ma.tajine", label: "Tajine, couscous, msemen, harira", domain: "food" },
      { id: "ma.music", label: "Chaabi, gnawa, raï", domain: "music" },
      { id: "ma.souks", label: "Medina souks & haggling culture", domain: "markets" },
      { id: "ma.ramadan", label: "Ramadan rhythms & family life", domain: "family" },
      { id: "ma.religion", label: "Friday prayer & festival traditions", domain: "religion" },
      { id: "ma.scams", label: "WhatsApp / fake-courier scams", domain: "scams" },
      { id: "ma.tech", label: "Phone-shop & device-repair culture", domain: "technology" },
    ],
  },

  philippines: {
    countryId: "philippines",
    intro:
      "Tap what you'd recognise from daily Filipino life — Metro Manila, Cebu, anywhere.",
    chips: [
      { id: "ph.gcash", label: "GCash / PayMaya", domain: "payments" },
      { id: "ph.transit", label: "Jeepney, tricycle, MRT", domain: "transport" },
      { id: "ph.taglish", label: "Taglish (Tagalog-English mix)", domain: "code-switch" },
      { id: "ph.food", label: "Adobo, sinigang, halo-halo", domain: "food" },
      { id: "ph.music", label: "OPM, ballads, K-pop crossover", domain: "music" },
      { id: "ph.bayanihan", label: "Bayanihan & extended family", domain: "family" },
      { id: "ph.sarisari", label: "Sari-sari stores & palengke", domain: "markets" },
      { id: "ph.religion", label: "Catholic / fiesta culture", domain: "religion" },
      { id: "ph.scams", label: "Text-scam / fake-loan patterns", domain: "scams" },
      { id: "ph.bpo", label: "BPO / call-centre tech literacy", domain: "technology" },
      { id: "ph.basketball", label: "Basketball & barangay leagues", domain: "sports" },
    ],
  },
};

export function getCountryPack(countryId: CountryId): CountryPack {
  return COUNTRY_PACKS[countryId];
}

// ─── Weight labels (UI helper) ─────────────────────────────────────────────

export const WEIGHT_LABELS: Record<0 | 1 | 2 | 3, string> = {
  0: "—",
  1: "Some",
  2: "Strong",
  3: "Expert",
};

export const WEIGHT_DESCRIPTIONS: Record<0 | 1 | 2 | 3, string> = {
  0: "Don't know much about it",
  1: "Recognise it / could spot obvious mistakes",
  2: "Could explain it confidently to an outsider",
  3: "Could teach it / catch subtle errors",
};
