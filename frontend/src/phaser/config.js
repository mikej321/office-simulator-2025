import Phaser from "phaser";
import MainMenuScene from "./scenes/MainMenuScene";
import GameScene from "./scenes/GameScene";
import AccountScene from "./scenes/AccountScene";

/**
 * Main configuration object for the Phaser game.
 * This object is used to initialize the Phaser game instance.
 */
const config = {
  // Use WebGL if available, otherwise fallback to Canvas
  type: Phaser.AUTO,
  // Default canvas size in pixels
  width: 800,
  height: 600,
  // DOM element ID where the game canvas will be mounted
  parent: "game-container",
  // List of scenes to load and run
  scene: [MainMenuScene, AccountScene, GameScene],
  // Configure physics engine
  physics: {
    default: "arcade", // Use Arcade Physics
    arcade: {
      gravity: { y: 0 }, // No gravity by default
      debug: false, // Disable physics debug visualization
    },
  },
  // Configure game scaling
  scale: {
    mode: Phaser.Scale.RESIZE, // Automatically resize canvas when window size changes
    autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game canvas
  },
};

export default config;
