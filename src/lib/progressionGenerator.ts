import {
  ALL_MAJOR_KEYS,
  type ChordSymbol,
  type Inversion,
  type MajorKey,
  type RomanNumeral,
  type SATBChord,
  formatChordLabel,
  getBassPitchClass,
  getChordQuality,
  randomFromArray,
  stripOctave,
  voiceProgressionSATB,
} from "./musicTheory";
import {
  FUNCTION_TO_CHORDS,
  allowedNextFunctions,
  getFunctionGroup,
  randomCadenceEnding,
  type CadenceType,
  type FunctionGroup,
} from "./harmonyRules";

export interface GeneratedProgression {
  key: MajorKey;
  cadence: CadenceType;
  chords: ChordSymbol[];
  chordLabels: string[];
  bassNotes: string[];
  sopranoNotes: string[];
  qualities: ("Maj" | "Min")[];
  satb: SATBChord[];
}

function randomLength(): number {
  return randomFromArray([4, 5, 6]);
}

function chooseChordFromFunction(func: FunctionGroup): RomanNumeral {
  return randomFromArray(FUNCTION_TO_CHORDS[func]);
}

function chooseInversion(
  roman: RomanNumeral,
  position: number,
  total: number
): Inversion {
  if (position >= total - 2) return "root";

  const probability =
    roman === "ii" || roman === "I" || roman === "IV" ? 0.4 : 0.2;

  return Math.random() < probability ? "first" : "root";
}

function buildFunctionalPrefix(
  lengthNeeded: number,
  ending: RomanNumeral[]
): RomanNumeral[] {
  if (lengthNeeded <= 0) return [];

  const result: RomanNumeral[] = [];
  let currentFunc: FunctionGroup = "T";

  result.push("I");

  while (result.length < lengthNeeded) {
    const nextFuncOptions = allowedNextFunctions(currentFunc);
    const isLastPrefixSlot = result.length === lengthNeeded - 1;

    let chosenFunc: FunctionGroup;

    if (isLastPrefixSlot) {
      const cadenceStartFunc = getFunctionGroup(ending[0]);

      if (cadenceStartFunc === "D") {
        const prepOptions = nextFuncOptions.filter(
          (f) => f === "T" || f === "PD"
        );
        chosenFunc =
          prepOptions.length > 0
            ? randomFromArray(prepOptions)
            : randomFromArray(nextFuncOptions);
      } else {
        chosenFunc = randomFromArray(nextFuncOptions);
      }
    } else {
      chosenFunc = randomFromArray(nextFuncOptions);
    }

    result.push("I");
    currentFunc = chosenFunc;
  }

  return result;
}

function avoidExcessiveRepetition(chords: RomanNumeral[]): RomanNumeral[] {
  const out = [...chords];

  for (let i = 1; i < out.length; i++) {
    if (out[i] === out[i - 1] && Math.random() < 0.7) {
      const func = getFunctionGroup(out[i]);
      const alternatives = FUNCTION_TO_CHORDS[func].filter((c) => c !== out[i]);

      if (alternatives.length > 0) {
        out[i] = randomFromArray(alternatives);
      }
    }
  }

  return out;
}

export function generateProgression(): GeneratedProgression {
  const key = randomFromArray(ALL_MAJOR_KEYS);
  const length = randomLength();
  const cadenceEnding = randomCadenceEnding();

  const prefixLength = length - 2;
  const prefix = buildFunctionalPrefix(prefixLength, cadenceEnding.chords);
  const fullRomans = avoidExcessiveRepetition([
    ...prefix,
    ...cadenceEnding.chords,
  ]);

  const chords: ChordSymbol[] = fullRomans.map((roman, index) => ({
    roman,
    inversion: chooseInversion(roman, index, fullRomans.length),
  }));

  const satb = voiceProgressionSATB(key, chords);

  return {
    key,
    cadence: cadenceEnding.cadence,
    chords,
    chordLabels: chords.map(formatChordLabel),
    bassNotes: chords.map((ch) => getBassPitchClass(key, ch)),
    sopranoNotes: satb.map((ch) => stripOctave(ch.soprano)),
    qualities: chords.map((ch) => getChordQuality(ch.roman)),
    satb,
  };
}