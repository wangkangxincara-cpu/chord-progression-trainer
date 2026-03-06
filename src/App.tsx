import { useState } from "react";
import { generateProgression } from "./lib/progressionGenerator";
import "./index.css";

function App() {
  const [progression, setProgression] = useState(generateProgression());

  function newProgression() {
    setProgression(generateProgression());
  }

  return (
    <div className="app">
      <div className="header">
        <h1 className="title">Chord Progression Trainer</h1>
        <p className="subtitle">
          Major keys • 4–6 chords • functional harmony prototype
        </p>
      </div>

      <section className="panel">
        <div className="controls">
          <button onClick={newProgression}>New Progression</button>
          <div className="meta">
            <span><strong>Key:</strong> {progression.key}</span>
            <span><strong>Length:</strong> {progression.chords.length}</span>
            <span><strong>Cadence:</strong> {progression.cadence}</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="row-label">Chord Labels</div>
        <div className="slots">
          {progression.chordLabels.map((c, i) => (
            <div className="slot" key={i}>
              {c}
            </div>
          ))}
        </div>

        <div className="row-label">Bass Notes</div>
        <div className="slots">
          {progression.bassNotes.map((b, i) => (
            <div className="slot" key={i}>
              {b}
            </div>
          ))}
        </div>

        <div className="row-label">Chord Quality</div>
        <div className="slots">
          {progression.qualities.map((q, i) => (
            <div className="slot" key={i}>
              {q}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="muted">
          Next step: add SATB voicing, soprano reveal, and audio playback.
        </p>
      </section>
    </div>
  );
}

export default App;