import type { MajorKey, SATBChord, ChordSymbol } from "./musicTheory";
import { voiceProgressionSATB } from "./musicTheory";

export function getSimpleReferenceSATB(key: MajorKey): SATBChord[] {
  const chords: ChordSymbol[] = [
    { roman: "I", inversion: "root" },
    { roman: "IV", inversion: "root" },
    { roman: "V", inversion: "root" },
    { roman: "I", inversion: "root" },
  ];

  return voiceProgressionSATB(key, chords);
}