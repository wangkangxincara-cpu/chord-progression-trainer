export type PitchClass =
  | "C" | "C#" | "Db"
  | "D" | "D#" | "Eb"
  | "E"
  | "F" | "E#"
  | "F#" | "Gb"
  | "G" | "G#"
  | "Ab"
  | "A" | "A#"
  | "Bb"
  | "B";

export type MajorKey =
  | "C" | "G" | "D" | "A" | "E" | "B"
  | "Db" | "Ab" | "Eb" | "Bb" | "F";

export type RomanNumeral = "I" | "ii" | "IV" | "V" | "vi";
export type Inversion = "root" | "first";

export interface ChordSymbol {
  roman: RomanNumeral;
  inversion: Inversion;
}

const MAJOR_SCALES: Record<MajorKey, PitchClass[]> = {
  C: ["C", "D", "E", "F", "G", "A", "B"],
  G: ["G", "A", "B", "C", "D", "E", "F#"],
  D: ["D", "E", "F#", "G", "A", "B", "C#"],
  A: ["A", "B", "C#", "D", "E", "F#", "G#"],
  E: ["E", "F#", "G#", "A", "B", "C#", "D#"],
  B: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
  Db: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  Ab: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
  Eb: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  Bb: ["Bb", "C", "D", "Eb", "F", "G", "A"],
  F: ["F", "G", "A", "Bb", "C", "D", "E"],
};

export const ALL_MAJOR_KEYS: MajorKey[] = [
  "C", "G", "D", "A", "E", "B",
  "Db", "Ab", "Eb", "Bb", "F",
];

export function randomFromArray<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function getMajorScale(key: MajorKey): PitchClass[] {
  return MAJOR_SCALES[key];
}

export function getChordTones(key: MajorKey, roman: RomanNumeral): PitchClass[] {
  const scale = getMajorScale(key);

  switch (roman) {
    case "I":
      return [scale[0], scale[2], scale[4]];
    case "ii":
      return [scale[1], scale[3], scale[5]];
    case "IV":
      return [scale[3], scale[5], scale[0]];
    case "V":
      return [scale[4], scale[6], scale[1]];
    case "vi":
      return [scale[5], scale[0], scale[2]];
  }
}

export function getChordQuality(roman: RomanNumeral): "Maj" | "Min" {
  switch (roman) {
    case "I":
    case "IV":
    case "V":
      return "Maj";
    case "ii":
    case "vi":
      return "Min";
  }
}

export function getBassPitchClass(
  key: MajorKey,
  chord: ChordSymbol
): PitchClass {
  const tones = getChordTones(key, chord.roman);
  return chord.inversion === "root" ? tones[0] : tones[1];
}

export function formatChordLabel(chord: ChordSymbol): string {
  return chord.inversion === "root" ? chord.roman : `${chord.roman}6`;
}