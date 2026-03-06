export type PitchClass =
  | "C" | "C#" | "Db"
  | "D" | "D#" | "Eb"
  | "E" | "E#"
  | "F" | "F#" | "Gb"
  | "G" | "G#" | "Ab"
  | "A" | "A#" | "Bb"
  | "B";

export type MajorKey =
  | "C" | "G" | "D" | "A" | "E" | "B"
  | "F" | "Db" | "Ab" | "Eb" | "Bb";

export type RomanNumeral = "I" | "ii" | "IV" | "V" | "vi";
export type Inversion = "root" | "first";

export interface ChordSymbol {
  roman: RomanNumeral;
  inversion: Inversion;
}

export interface SATBChord {
  soprano: string;
  alto: string;
  tenor: string;
  bass: string;
}

const MAJOR_SCALES: Record<MajorKey, PitchClass[]> = {
  C: ["C", "D", "E", "F", "G", "A", "B"],
  G: ["G", "A", "B", "C", "D", "E", "F#"],
  D: ["D", "E", "F#", "G", "A", "B", "C#"],
  A: ["A", "B", "C#", "D", "E", "F#", "G#"],
  E: ["E", "F#", "G#", "A", "B", "C#", "D#"],
  B: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
  F: ["F", "G", "A", "Bb", "C", "D", "E"],
  Db: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"],
  Ab: ["Ab", "Bb", "C", "Db", "Eb", "F", "G"],
  Eb: ["Eb", "F", "G", "Ab", "Bb", "C", "D"],
  Bb: ["Bb", "C", "D", "Eb", "F", "G", "A"],
};

export const ALL_MAJOR_KEYS: MajorKey[] = [
  "C", "G", "D", "A", "E", "B", "F",
  "Db", "Ab", "Eb", "Bb",
];

const PITCH_CLASS_TO_SEMITONE: Record<PitchClass, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  "E#": 5,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

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

export function getBassPitchClass(key: MajorKey, chord: ChordSymbol): PitchClass {
  const tones = getChordTones(key, chord.roman);
  return chord.inversion === "root" ? tones[0] : tones[1];
}

export function formatChordLabel(chord: ChordSymbol): string {
  return chord.inversion === "root" ? chord.roman : `${chord.roman}6`;
}

export function pitchToMidi(pc: PitchClass, octave: number): number {
  return 12 * (octave + 1) + PITCH_CLASS_TO_SEMITONE[pc];
}

export function midiToPitchName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const semitone = midi % 12;

  const names = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  return `${names[semitone]}${octave}`;
}

export function stripOctave(note: string): string {
  return note.replace(/[0-9]/g, "");
}

function pcMatchesMidi(pc: PitchClass, midi: number): boolean {
  return PITCH_CLASS_TO_SEMITONE[pc] === (midi % 12);
}

function nearestMidiAtOrAbove(pc: PitchClass, minMidi: number): number {
  let midi = minMidi;
  while (!pcMatchesMidi(pc, midi)) {
    midi += 1;
  }
  return midi;
}

function nearestMidiInRange(pc: PitchClass, minMidi: number, maxMidi: number): number {
  const candidate = nearestMidiAtOrAbove(pc, minMidi);
  if (candidate <= maxMidi) return candidate;

  let midi = maxMidi;
  while (!pcMatchesMidi(pc, midi)) {
    midi -= 1;
  }
  return midi;
}

export function getSimpleSATBVoicing(key: MajorKey, chord: ChordSymbol): SATBChord {
  const tones = getChordTones(key, chord.roman);
  const root = tones[0];
  const third = tones[1];
  const fifth = tones[2];

  let bassPc: PitchClass;
  let tenorPc: PitchClass;
  let altoPc: PitchClass;
  let sopranoPc: PitchClass;

  if (chord.inversion === "root") {
    bassPc = root;
    tenorPc = fifth;
    altoPc = root;
    sopranoPc = third;
  } else {
    bassPc = third;
    tenorPc = root;
    altoPc = fifth;
    sopranoPc = root;
  }

  const bassMidi = nearestMidiInRange(bassPc, 40, 55);      // E2–G3-ish
  const tenorMidi = nearestMidiInRange(tenorPc, bassMidi + 7, 60);
  const altoMidi = nearestMidiInRange(altoPc, tenorMidi + 3, 69);
  const sopranoMidi = nearestMidiInRange(sopranoPc, altoMidi + 3, 79);

  return {
    bass: midiToPitchName(bassMidi),
    tenor: midiToPitchName(tenorMidi),
    alto: midiToPitchName(altoMidi),
    soprano: midiToPitchName(sopranoMidi),
  };
}