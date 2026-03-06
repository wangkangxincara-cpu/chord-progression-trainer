import { useState } from "react"
import { generateProgression } from "./lib/progressionGenerator"
import "./index.css"

function App() {

  const [progression, setProgression] = useState(generateProgression())

  function newProgression(){
    setProgression(generateProgression())
  }

  return (
    <div className="app">

      <h1>Chord Progression Trainer</h1>

      <button onClick={newProgression}>
        New Progression
      </button>

      <h2>Key: {progression.key}</h2>

      <div className="slots">
        {progression.chords.map((c, i) => (
          <div className="slot" key={i}>
            {c}
          </div>
        ))}
      </div>

    </div>
  )
}

export default App