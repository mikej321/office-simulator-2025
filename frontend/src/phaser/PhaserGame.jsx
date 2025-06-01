import { useEffect, useRef } from "react";
import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import PreloadScene from "./scenes/PreloadScene";
import GameScene from "./scenes/GameScene";
import MainMenuScene from "./scenes/MainMenuScene";
import TestScene from "./scenes/TestScene";
import AccountScene from "./scenes/AccountScene";
import PlayerMenuScene from "./scenes/PlayerMenuScene";
import CharacterCreationScene from "./scenes/CharacterCreationScene";
import LoadGameScene from "./scenes/LoadGameScene";

/**
 * PhaserGame is a React component that initializes and manages the Phaser game instance.
 * It uses useEffect to handle the game lifecycle and cleanup.
 */
const PhaserGame = () => {
  /**
   * useRef creates a mutable reference that persists across renders.
   * In our game:
   * - We use it to store the Phaser game instance
   * - The .current property holds the actual game instance
   * - Unlike state, changing .current doesn't trigger re-renders
   * - This is perfect for the game instance as we don't want React to re-render when game state changes
   */
  const gameRef = useRef(null);

  /**
   * useEffect handles the game's lifecycle:
   * 1. Component Mount: Creates the game instance
   * 2. Component Unmount: Cleans up the game instance
   *
   * The empty dependency array [] means this effect:
   * - Runs once when component mounts
   * - Never runs again during component's lifecycle
   * - Perfect for game initialization which should happen once
   */
  useEffect(() => {
    // Only create the game if it hasn't been created yet
    if (!gameRef.current) {
      const config = {
        // Use WebGL if available, fallback to Canvas
        type: Phaser.AUTO,
        // Set game size to match window dimensions
        width: window.innerWidth,
        height: window.innerHeight,
        // Mount the game canvas to the element with id "game-container"
        parent: "game-container",
        // Configure physics engine
        physics: {
          default: "arcade",
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
        // Define all game scenes in order of initialization
        scene: [
          BootScene, // First scene, handles authentication
          PreloadScene, // Loads game assets
          MainMenuScene, // Main menu interface
          AccountScene, // Account management
          PlayerMenuScene, // Player menu after login
          LoadGameScene, // Load saved games
          CharacterCreationScene, // Create new character
          TestScene, // Testing environment
          GameScene, // Main game scene
        ],
      };

      // Create new Phaser game instance with config
      gameRef.current = new Phaser.Game(config);
    }

    // Cleanup function to destroy game instance when component unmounts
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return null; // This component doesn't render anything directly
};

export default PhaserGame;
