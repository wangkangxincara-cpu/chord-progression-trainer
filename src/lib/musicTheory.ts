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

export interface SATBMidiChord {
  soprano: number;
  alto: number;
  tenor: number;
  bass: number;
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

export const VOICE_RANGES = {
  bass: { min: 40, max: 60 },     // E2 - C4
  tenor: { min: 48, max: 67 },    // C3 - G4
  alto: { min: 55, max: 72 },     // G3 - C5
  soprano: { min: 60, max: 79 },  // C4 - G5
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

export function midiToPitchName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const semitone = midi % 12;
  const names = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  return `${names[semitone]}${octave}`;
}

export function stripOctave(note: string): string {
  return note.replace(/[0-9]/g, "");
}

function getMotionDirection(prevMidi: number, currentMidi: number): -1 | 0 | 1 {
  if (currentMidi > prevMidi) return 1;
  if (currentMidi < prevMidi) return -1;
  return 0;
}

function intervalClass(midi1: number, midi2: number): number {
  return Math.abs(midi1 - midi2) % 12;
}

function isPerfectFifth(midi1: number, midi2: number): boolean {
  return intervalClass(midi1, midi2) === 7;
}

function isPerfectOctave(midi1: number, midi2: number): boolean {
  return intervalClass(midi1, midi2) === 0;
}

function createsForbiddenOuterParallel(
  prevBass: number,
  prevSoprano: number,
  currBass: number,
  currSoprano: number
): boolean {
  const bassMotion = getMotionDirection(prevBass, currBass);
  const sopranoMotion = getMotionDirection(prevSoprano, currSoprano);

  // must be similar motion, and not static
  if (bassMotion === 0 || sopranoMotion === 0) return false;
  if (bassMotion !== sopranoMotion) return false;

  const prevIsFifth = isPerfectFifth(prevBass, prevSoprano);
  const currIsFifth = isPerfectFifth(currBass, currSoprano);

  const prevIsOctave = isPerfectOctave(prevBass, prevSoprano);
  const currIsOctave = isPerfectOctave(currBass, currSoprano);

  if (prevIsFifth && currIsFifth) return true;
  if (prevIsOctave && currIsOctave) return true;

  return false;
}

function pcMatchesMidi(pc: PitchClass, midi: number): boolean {
  return PITCH_CLASS_TO_SEMITONE[pc] === ((midi % 12) + 12) % 12;
}

function allMidisForPcInRange(pc: PitchClass, minMidi: number, maxMidi: number): number[] {
  const out: number[] = [];
  for (let midi = minMidi; midi <= maxMidi; midi++) {
    if (pcMatchesMidi(pc, midi)) out.push(midi);
  }
  return out;
}

function chooseClosestMidi(
  pc: PitchClass,
  targetMidi: number,
  minMidi: number,
  maxMidi: number
): number {
  const candidates = allMidisForPcInRange(pc, minMidi, maxMidi);
  if (candidates.length === 0) {
    throw new Error(`No midi candidate for ${pc} in range ${minMidi}-${maxMidi}`);
  }

  let best = candidates[0];
  let bestDist = Math.abs(candidates[0] - targetMidi);

  for (const c of candidates) {
    const dist = Math.abs(c - targetMidi);
    if (dist < bestDist || (dist === bestDist && c < best)) {
      best = c;
      bestDist = dist;
    }
  }

  return best;
}

function chooseClosestMidiWithBounds(
  pc: PitchClass,
  targetMidi: number,
  minMidi: number,
  maxMidi: number,
  lowerExclusive?: number,
  upperExclusive?: number
): number {
  let actualMin = minMidi;
  let actualMax = maxMidi;

  if (lowerExclusive !== undefined) actualMin = Math.max(actualMin, lowerExclusive + 1);
  if (upperExclusive !== undefined) actualMax = Math.min(actualMax, upperExclusive - 1);

  return chooseClosestMidi(pc, targetMidi, actualMin, actualMax);
}

function getSortedCandidates(
  pc: PitchClass,
  targetMidi: number,
  minMidi: number,
  maxMidi: number,
  lowerExclusive?: number,
  upperExclusive?: number
): number[] {
  let actualMin = minMidi;
  let actualMax = maxMidi;

  if (lowerExclusive !== undefined) actualMin = Math.max(actualMin, lowerExclusive + 1);
  if (upperExclusive !== undefined) actualMax = Math.min(actualMax, upperExclusive - 1);

  const candidates = allMidisForPcInRange(pc, actualMin, actualMax);

  return candidates.sort((a, b) => {
    const da = Math.abs(a - targetMidi);
    const db = Math.abs(b - targetMidi);
    if (da !== db) return da - db;
    return a - b;
  });
}

function melodicIntervalSize(prevMidi: number, currentMidi: number): number {
  return Math.abs(currentMidi - prevMidi);
}

function bassLeapPenalty(
  candidate: number,
  prevBass: number,
  prevPrevBass?: number
): number {
  const currentLeap = melodicIntervalSize(prevBass, candidate);

  let penalty = 0;

  // discourage octave or larger leaps strongly
  if (currentLeap >= 12) {
    penalty += 100;
  }
  // discourage 6th or 7th leaps somewhat
  else if (currentLeap >= 9) {
    penalty += 25;
  }

  // discourage two consecutive large leaps (6th or larger)
  if (prevPrevBass !== undefined) {
    const prevLeap = melodicIntervalSize(prevPrevBass, prevBass);
    const prevWasLarge = prevLeap >= 9;
    const currentIsLarge = currentLeap >= 9;

    if (prevWasLarge && currentIsLarge) {
      penalty += 80;
    }
  }

  return penalty;
}

function getSortedBassCandidates(
  pc: PitchClass,
  targetMidi: number,
  minMidi: number,
  maxMidi: number,
  prevBass: number,
  prevPrevBass?: number
): number[] {
  const candidates = allMidisForPcInRange(pc, minMidi, maxMidi);

  return candidates.sort((a, b) => {
    const scoreA =
      Math.abs(a - targetMidi) + bassLeapPenalty(a, prevBass, prevPrevBass);
    const scoreB =
      Math.abs(b - targetMidi) + bassLeapPenalty(b, prevBass, prevPrevBass);

    if (scoreA !== scoreB) return scoreA - scoreB;
    return a - b;
  });
}

function getVoicePitchClasses(chord: ChordSymbol, tones: PitchClass[]) {
  const root = tones[0];
  const third = tones[1];
  const fifth = tones[2];

  if (chord.inversion === "root") {
    return {
      bass: root,
      tenor: fifth,
      alto: root,
      soprano: third,
    };
  }

  return {
    bass: third,
    tenor: root,
    alto: fifth,
    soprano: root,
  };
}

export function voiceProgressionSATB(
  key: MajorKey,
  chords: ChordSymbol[]
): SATBChord[] {
  const midiVoicings: SATBMidiChord[] = [];

  chords.forEach((chord, index) => {
    const tones = getChordTones(key, chord.roman);
    const pcs = getVoicePitchClasses(chord, tones);

    if (index === 0) {
      const bass = chooseClosestMidi(
        pcs.bass,
        48,
        VOICE_RANGES.bass.min,
        VOICE_RANGES.bass.max
      );

      const tenor = chooseClosestMidiWithBounds(
        pcs.tenor,
        55,
        VOICE_RANGES.tenor.min,
        VOICE_RANGES.tenor.max,
        bass
      );

      const alto = chooseClosestMidiWithBounds(
        pcs.alto,
        62,
        VOICE_RANGES.alto.min,
        VOICE_RANGES.alto.max,
        tenor
      );

      const soprano = chooseClosestMidiWithBounds(
        pcs.soprano,
        67,
        VOICE_RANGES.soprano.min,
        VOICE_RANGES.soprano.max,
        alto
      );

      midiVoicings.push({ bass, tenor, alto, soprano });
      return;
    }

    const prev = midiVoicings[index - 1];

    const prevPrevBass = index >= 2 ? midiVoicings[index - 2].bass : undefined;

    const bassCandidates = getSortedBassCandidates(
        pcs.bass,
        prev.bass,
        VOICE_RANGES.bass.min,
        VOICE_RANGES.bass.max,
        prev.bass,
        prevPrevBass
    );

const bass = bassCandidates[0];

    const tenor = chooseClosestMidiWithBounds(
      pcs.tenor,
      prev.tenor,
      VOICE_RANGES.tenor.min,
      VOICE_RANGES.tenor.max,
      bass
    );

    const alto = chooseClosestMidiWithBounds(
      pcs.alto,
      prev.alto,
      VOICE_RANGES.alto.min,
      VOICE_RANGES.alto.max,
      tenor
    );

    // Try soprano candidates from closest to farthest,
    // and reject forbidden parallel 5ths/8ves with bass.
    const sopranoCandidates = getSortedCandidates(
      pcs.soprano,
      prev.soprano,
      VOICE_RANGES.soprano.min,
      VOICE_RANGES.soprano.max,
      alto
    );

    let soprano: number | null = null;

    for (const candidate of sopranoCandidates) {
      if (
        !createsForbiddenOuterParallel(
          prev.bass,
          prev.soprano,
          bass,
          candidate
        )
      ) {
        soprano = candidate;
        break;
      }
    }

    // fallback if every candidate is rejected
    if (soprano === null) {
      soprano = chooseClosestMidiWithBounds(
        pcs.soprano,
        prev.soprano,
        VOICE_RANGES.soprano.min,
        VOICE_RANGES.soprano.max,
        alto
      );
    }

    midiVoicings.push({ bass, tenor, alto, soprano });
  });

  return midiVoicings.map((v) => ({
    bass: midiToPitchName(v.bass),
    tenor: midiToPitchName(v.tenor),
    alto: midiToPitchName(v.alto),
    soprano: midiToPitchName(v.soprano),
  }));
}