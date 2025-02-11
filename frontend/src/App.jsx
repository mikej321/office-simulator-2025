import { useState } from 'react'
import PhaserGame from './phaser/PhaserGame';
import './App.css'

function App() {

  return (
    <div className="App">
      <h1>Office Simulator 2025 (Placeholder)</h1>
      <div className="authors">
        <h2>Bryce Freshwater</h2>
        <h2>Santiago Mariani</h2>
        <h2>Michael Johnson</h2>
      </div>
      <PhaserGame />
    </div>
  )
}

export default App
