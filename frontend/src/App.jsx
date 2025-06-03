
import { useState } from 'react'
import PhaserGame from './phaser/PhaserGame';
import './App.css'

function App() {

  return (
    <div className="App">
      <div className="game-container"></div> {/* Added for Phaser to recognize */}
      <PhaserGame />
    </div>
  )
}

export default App
