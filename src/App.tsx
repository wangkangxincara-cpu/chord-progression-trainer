import { useState } from "react";
import { generateProgression } from "./lib/progressionGenerator";
import { playReferenceProgression, playSATBProgression } from "./lib/audioEngine";
import "./index.css";

function App() {
  const [progression, setProgression] = useState(generateProgression());
  const [showBass, setShowBass] = useState(false);
  const [showSoprano, setShowSoprano] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  function newProgression() {
    setProgression(generateProgression());
    setShowBass(false);
    setShowSoprano(false);
    setShowQuality(false);
    setShowDebug(false);
  }

  async function handlePlay(mode: "bass" | "soprano" | "normal") {
    try {
      setIsPlaying(true);
      await playSATBProgression(progression.satb, mode);
      setTimeout(() => setIsPlaying(false), progression.satb.length * 1200 + 200);
    } catch (error) {
      console.error(error);
      setIsPlaying(false);
    }
  }

  async function handlePlayReference() {
    try {
      setIsPlaying(true);
      await playReferenceProgression(progression.key);
      setTimeout(() => setIsPlaying(false), 4 * 1200 + 200);
    } catch (error) {
      console.error(error);
      setIsPlaying(false);
    }
  }

  return (
    <div className="app">
      <div className="header">
        <h1 className="title">Chord Progression Trainer</h1>
        <p className="subtitle">
          Major keys • 4–6 chords • reveal mode
        </p>
      </div>

      <section className="panel">
        <div className="controls">
          <button onClick={newProgression}>New Progression</button>
          <div className="meta">
            <span><strong>Key:</strong> {progression.key}</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="row-label">Playback</div>
        <div className="button-row">
          <button onClick={() => handlePlay("bass")} disabled={isPlaying}>
            Play Bass Emphasized
          </button>

          <button onClick={() => handlePlay("soprano")} disabled={isPlaying}>
            Play Soprano Emphasized
          </button>

          <button onClick={() => handlePlay("normal")} disabled={isPlaying}>
            Play Normal
          </button>

          <button onClick={handlePlayReference} disabled={isPlaying}>
            Play I–IV–V–I Reference
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="row-label">Progression Slots</div>
        <div className="slots">
          {progression.chords.map((_, i) => (
            <div className="slot" key={i}>
              Chord {i + 1}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="row-label">Reveal Controls</div>
        <div className="button-row">
          <button onClick={() => setShowBass((v) => !v)}>
            {showBass ? "Hide Bass Notes" : "Show Bass Notes"}
          </button>

          <button onClick={() => setShowSoprano((v) => !v)}>
            {showSoprano ? "Hide Soprano Notes" : "Show Soprano Notes"}
          </button>

          <button onClick={() => setShowQuality((v) => !v)}>
            {showQuality ? "Hide Chord Quality" : "Show Chord Quality"}
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="row-label">Bass Notes</div>
        <div className="slots">
          {progression.bassNotes.map((b, i) => (
            <div className="slot" key={i}>
              {showBass ? b : "•"}
            </div>
          ))}
        </div>

        <div className="row-label">Soprano Notes</div>
        <div className="slots">
          {progression.sopranoNotes.map((s, i) => (
            <div className="slot" key={i}>
              {showSoprano ? s : "•"}
            </div>
          ))}
        </div>

        <div className="row-label">Chord Quality</div>
        <div className="slots">
          {progression.qualities.map((q, i) => (
            <div className="slot" key={i}>
              {showQuality ? q : "•"}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="debug-header">
          <div className="row-label" style={{ margin: 0 }}>Developer Debug View</div>
          <button onClick={() => setShowDebug((v) => !v)}>
            {showDebug ? "Hide Debug" : "Show Debug"}
          </button>
        </div>

        {showDebug && (
          <>
            <div className="row-label">Chord Labels</div>
            <div className="slots">
              {progression.chordLabels.map((c, i) => (
                <div className="slot" key={i}>
                  {c}
                </div>
              ))}
            </div>

            <pre className="debug-pre">
              {JSON.stringify(progression.satb, null, 2)}
            </pre>
          </>
        )}
      </section>
    </div>
  );
}

export default App;