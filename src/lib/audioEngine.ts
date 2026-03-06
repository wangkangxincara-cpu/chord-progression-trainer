import * as Tone from "tone";
import type { MajorKey, SATBChord } from "./musicTheory";
import { getSimpleReferenceSATB } from "./referenceProgression";

let bassSynth: Tone.PolySynth | null = null;
let tenorSynth: Tone.PolySynth | null = null;
let altoSynth: Tone.PolySynth | null = null;
let sopranoSynth: Tone.PolySynth | null = null;

function ensureSynths() {
  if (bassSynth && tenorSynth && altoSynth && sopranoSynth) return;

  bassSynth = new Tone.PolySynth(Tone.Synth).toDestination();
  tenorSynth = new Tone.PolySynth(Tone.Synth).toDestination();
  altoSynth = new Tone.PolySynth(Tone.Synth).toDestination();
  sopranoSynth = new Tone.PolySynth(Tone.Synth).toDestination();

  bassSynth.volume.value = -6;
  tenorSynth.volume.value = -8;
  altoSynth.volume.value = -8;
  sopranoSynth.volume.value = -8;
}

async function ensureStarted() {
  await Tone.start();
  ensureSynths();
}

function setModeVolumes(mode: "bass" | "soprano" | "normal") {
  if (!bassSynth || !tenorSynth || !altoSynth || !sopranoSynth) return;

  if (mode === "bass") {
    bassSynth.volume.value = 0;
    tenorSynth.volume.value = -12;
    altoSynth.volume.value = -12;
    sopranoSynth.volume.value = -12;
  } else if (mode === "soprano") {
    bassSynth.volume.value = -12;
    tenorSynth.volume.value = -12;
    altoSynth.volume.value = -12;
    sopranoSynth.volume.value = 0;
  } else {
    bassSynth.volume.value = -6;
    tenorSynth.volume.value = -8;
    altoSynth.volume.value = -8;
    sopranoSynth.volume.value = -8;
  }
}

export async function playSATBProgression(
  satb: SATBChord[],
  mode: "bass" | "soprano" | "normal"
) {
  await ensureStarted();
  Tone.Transport.stop();
  Tone.Transport.cancel();

  setModeVolumes(mode);

  const chordDuration = 1.2;
  const noteLength = 1.0;

  satb.forEach((chord, index) => {
    const time = index * chordDuration;

    bassSynth!.triggerAttackRelease(chord.bass, noteLength, Tone.now() + time);
    tenorSynth!.triggerAttackRelease(chord.tenor, noteLength, Tone.now() + time);
    altoSynth!.triggerAttackRelease(chord.alto, noteLength, Tone.now() + time);
    sopranoSynth!.triggerAttackRelease(chord.soprano, noteLength, Tone.now() + time);
  });
}

export async function playReferenceProgression(key: MajorKey) {
  const satb = getSimpleReferenceSATB(key);
  await playSATBProgression(satb, "normal");
}