import { useState } from 'react'
import PhaserGame from './phaser/PhaserGame';
import './App.css'

function App() {

  return (
    <div className="App">
      <h1>Office Simulator 2025 (Placeholder)</h1>
      <div className="accreditation">
        <h2>By yours truly</h2>
        <div className="authors">
          <h3>Bryce Freshwater</h3>
          <h3>Santiago Mariani</h3>
          <h3>Michael Johnson</h3>
        </div>
      </div>
      <PhaserGame />
    </div>
  )
}

export default App
