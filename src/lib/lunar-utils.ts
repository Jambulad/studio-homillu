/**
 * Simple lunar phase and traditional Vedic astronomical calculation utility.
 */

export type MoonPhase = {
  name: string;
  phase: number; // 0 to 1
  emoji: string;
};

const LUNAR_MONTH = 29.530588853;

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  // Reference new moon: Jan 11, 2024
  const referenceDate = new Date('2024-01-11T11:57:00Z');
  const diff = (date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
  const phase = (diff / LUNAR_MONTH) % 1;
  const normalizedPhase = phase < 0 ? phase + 1 : phase;

  let name = "";
  let emoji = "";

  if (normalizedPhase < 0.0625 || normalizedPhase >= 0.9375) {
    name = "New Moon";
    emoji = "🌑";
  } else if (normalizedPhase < 0.1875) {
    name = "Waxing Crescent";
    emoji = "🌒";
  } else if (normalizedPhase < 0.3125) {
    name = "First Quarter";
    emoji = "🌓";
  } else if (normalizedPhase < 0.4375) {
    name = "Waxing Gibbous";
    emoji = "🌔";
  } else if (normalizedPhase < 0.5625) {
    name = "Full Moon";
    emoji = "🌕";
  } else if (normalizedPhase < 0.6875) {
    name = "Waning Gibbous";
    emoji = "🌖";
  } else if (normalizedPhase < 0.8125) {
    name = "Last Quarter";
    emoji = "🌗";
  } else {
    name = "Waning Crescent";
    emoji = "🌘";
  }

  return { name, phase: normalizedPhase, emoji };
}

export function getTithi(date: Date = new Date(), lang: "en" | "te" = "en"): string {
  const phase = getMoonPhase(date).phase;
  const tithiNum = Math.floor(phase * 30) + 1;
  
  const tithis: Record<number, { en: string; te: string }> = {
    1: { en: "Prathama", te: "పాడ్యమి" },
    2: { en: "Dwitiya", te: "విదియ" },
    3: { en: "Tritiya", te: "తదియ" },
    4: { en: "Chaturthi", te: "చవితి" },
    5: { en: "Panchami", te: "పంచమి" },
    6: { en: "Shashti", te: "షష్ఠి" },
    7: { en: "Saptami", te: "సప్తమి" },
    8: { en: "Ashtami", te: "అష్టమి" },
    9: { en: "Navami", te: "నవమి" },
    10: { en: "Dashami", te: "దశమి" },
    11: { en: "Ekadashi", te: "ఏకాదశి" },
    12: { en: "Dwadashi", te: "ద్వాదశి" },
    13: { en: "Trayodashi", te: "త్రయోదశి" },
    14: { en: "Chaturdashi", te: "చతుర్దశి" },
    15: { en: "Purnima", te: "పౌర్ణమి" },
    30: { en: "Amavasya", te: "అమావాస్య" }
  };

  const result = tithis[tithiNum] || { en: `Tithi ${tithiNum}`, te: `తిథి ${tithiNum}` };
  return lang === "te" ? result.te : result.en;
}

export function getNakshatra(date: Date = new Date(), lang: "en" | "te" = "en"): string {
  const NakshatrasEn = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];
  
  const NakshatrasTe = [
    "అశ్విని", "భరణి", "కృత్తిక", "రోహిణి", "మృగశిర", "ఆర్ద్ర", "పునర్వసు", "పుష్యమి", "ఆశ్లేష",
    "మఘ", "పుబ్బ", "ఉత్తర", "హస్త", "చిత్త", "స్వాతి", "విశాఖ", "అనూరాధ", "జ్యేష్ఠ",
    "మూల", "పూర్వాషాఢ", "ఉత్తరాషాఢ", "శ్రవణం", "ధనిష్ఠ", "శతభిషం", "పూర్వాభాద్ర", "ఉత్తరాభాద్ర", "రేవతి"
  ];

  const phase = getMoonPhase(date).phase;
  const index = Math.floor(phase * 27);
  return lang === "te" ? NakshatrasTe[index % 27] : NakshatrasEn[index % 27];
}

export function getRaasi(date: Date = new Date(), lang: "en" | "te" = "en"): string {
  const RaasisEn = [
    "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
    "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrischika (Scorpio)",
    "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
  ];
  
  const RaasisTe = [
    "మేషం", "వృషభం", "మిథునం", "కర్కాటకం",
    "సింహం", "కన్య", "తుల", "వృశ్చికం",
    "ధనుస్సు", "మకరం", "కుంభం", "మీనం"
  ];

  const phase = getMoonPhase(date).phase;
  const index = Math.floor(phase * 12);
  return lang === "te" ? RaasisTe[index % 12] : RaasisEn[index % 12];
}

export function getRahukalam(date: Date = new Date()): string {
  const day = date.getDay(); // 0 (Sun) to 6 (Sat)
  const periods: Record<number, string> = {
    0: "4:30 PM - 6:00 PM",
    1: "7:30 AM - 9:00 AM",
    2: "3:00 PM - 4:30 PM",
    3: "12:00 PM - 1:30 PM",
    4: "1:30 PM - 3:00 PM",
    5: "10:30 AM - 12:00 PM",
    6: "9:00 AM - 10:30 AM"
  };
  return periods[day];
}

export const TELUGE_MONTHS = [
  { en: "Chaitram", te: "చైత్రం", significance: "Ugadi (New Year), Spring begins" },
  { en: "Vaishakham", te: "వైశాఖం", significance: "Summer heat, Akshaya Tritiya" },
  { en: "Jyeshtham", te: "జ్యేష్ఠం", significance: "Peak summer, Waters rise" },
  { en: "Ashadham", te: "ఆషాఢం", significance: "Monsoon begins, Bonalu" },
  { en: "Shravanam", te: "శ్రావణం", significance: "Holy month, Varalakshmi Vratam" },
  { en: "Bhadrapadam", te: "భాద్రపదం", significance: "Ganesh Chaturthi" },
  { en: "Ashwayujam", te: "ఆశ్వయుజం", significance: "Dussehra, Bathukamma" },
  { en: "Karthikam", te: "కార్తీకం", significance: "Diwali, Deepotsavam" },
  { en: "Margashiram", te: "మార్గశిరం", significance: "Winter peaks, Gita Jayanti" },
  { en: "Pushyam", te: "పుష్యం", significance: "Sankranti Harvest" },
  { en: "Magham", te: "మాఘం", significance: "Maha Shivaratri" },
  { en: "Phalgunam", te: "ఫాల్గుణం", significance: "Holi, End of year" }
];

export const TELUGU_SAMVATSARAS = [
  "Prabhava", "Vibhava", "Shukla", "Pramodoota", "Prajotpatti", "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhata",
  "Eeshwara", "Bahudhanya", "Pramathi", "Vikrama", "Vrusha", "Chitrabhanu", "Swabhanu", "Tarana", "Parthiva", "Vyaya",
  "Sarvajit", "Sarvadhari", "Virodhi", "Vikruthi", "Khara", "Nandana", "Vijaya", "Jaya", "Manmadha", "Durmukhi",
  "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrutu", "Shobhakrutu", "Krodhi", "Viswavasu", "Paridhavi",
  "Pramadecha", "Ananda", "Rakshasa", "Nala", "Pingala", "Kalayukthi", "Siddharthi", "Raudri", "Durmathi", "Dundubhi",
  "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya"
];
