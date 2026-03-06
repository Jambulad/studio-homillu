/**
 * Simple lunar phase calculation utility.
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
  if (tithiNum === 15) return "Purnima (Full Moon)";
  if (tithiNum === 30) return "Amavasya (New Moon)";
  
  return `Tithi ${tithiNum}`;
}
