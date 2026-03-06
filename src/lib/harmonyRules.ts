import type { RomanNumeral } from "./musicTheory";

export type FunctionGroup = "T" | "PD" | "D";
export type CadenceType = "AC" | "PC" | "HC" | "DC";

export interface CadenceEnding {
  cadence: CadenceType;
  chords: RomanNumeral[];
}

export function getFunctionGroup(roman: RomanNumeral): FunctionGroup {
  switch (roman) {
    case "I":
    case "vi":
      return "T";
    case "ii":
    case "IV":
      return "PD";
    case "V":
      return "D";
  }
}

export const FUNCTION_TO_CHORDS: Record<FunctionGroup, RomanNumeral[]> = {
  T: ["I", "vi"],
  PD: ["ii", "IV"],
  D: ["V"],
};

export function allowedNextFunctions(current: FunctionGroup): FunctionGroup[] {
  switch (current) {
    case "T":
      return ["T", "PD", "D"];
    case "PD":
      return ["PD", "D"];
    case "D":
      return ["T"];
  }
}

export function randomCadenceEnding(): CadenceEnding {
  const halfCadenceStarts: RomanNumeral[] = ["I", "ii", "IV", "vi"];

  const options: CadenceEnding[] = [
    { cadence: "AC", chords: ["V", "I"] },
    { cadence: "PC", chords: ["IV", "I"] },
    { cadence: "HC", chords: [halfCadenceStarts[Math.floor(Math.random() * halfCadenceStarts.length)], "V"] },
    { cadence: "DC", chords: ["V", "vi"] },
  ];

  return options[Math.floor(Math.random() * options.length)];
}