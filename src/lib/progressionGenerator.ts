const KEYS = [
  "C","G","D","A","E","B","F#",
  "Db","Ab","Eb","Bb","F"
];

const CHORDS = ["I","ii","IV","V","vi"];

function randomChoice(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateProgression() {

  const key = randomChoice(KEYS);

  const length = 4 + Math.floor(Math.random() * 3); // 4–6 chords

  const chords = [];

  for (let i = 0; i < length; i++) {
    chords.push(randomChoice(CHORDS));
  }

  return {
    key,
    chords
  };
}