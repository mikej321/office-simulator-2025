import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';
import MainMenuScene from './scenes/MainMenuScene';

const PhaserGame = () => {
    const gameRef = useRef(null);
  
    useEffect(() => {
      if (!gameRef.current) {
        const config = {
          type: Phaser.AUTO,
          width: 800,
          height: 600,
          parent: 'game-container', // Ensure this ID exists in App.jsx
          physics: {
            default: 'arcade',
            arcade: { gravity: { y: 0 }, debug: false },
          },
          scale: {
            mode: Phaser.Scale.RESIZE, // This will update the canvas size
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          scene: [BootScene, PreloadScene, MainMenuScene, GameScene],
        };
  
        gameRef.current = new Phaser.Game(config);
      }
  
      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    }, []);

    return null; 
  };

export default PhaserGame;