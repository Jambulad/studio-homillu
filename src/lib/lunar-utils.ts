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

export function getTithi(date: Date = new Date()): string {
  const phase = getMoonPhase(date).phase;
  const tithiNum = Math.floor(phase * 30) + 1;
  
  if (tithiNum === 1) return "Prathama";
  if (tithiNum === 2) return "Dwitiya";
  if (tithiNum === 3) return "Tritiya";
  if (tithiNum === 4) return "Chaturthi";
  if (tithiNum === 5) return "Panchami";
  if (tithiNum === 15) return "Purnima (Full Moon)";
  if (tithiNum === 30) return "Amavasya (New Moon)";
  
  return `Tithi ${tithiNum}`;
}

export function getNakshatra(date: Date = new Date()): string {
  const Nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];
  const phase = getMoonPhase(date).phase;
  const index = Math.floor(phase * 27);
  return Nakshatras[index % 27];
}

export function getRaasi(date: Date = new Date()): string {
  const Raasis = [
    "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
    "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrischika (Scorpio)",
    "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
  ];
  const phase = getMoonPhase(date).phase;
  const index = Math.floor(phase * 12);
  return Raasis[index % 12];
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
