import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';

const PhaserGame = () => {
    const gameRef = useRef(null);
  
    useEffect(() => {
      if (!gameRef.current) {
        const config = {
          type: Phaser.AUTO,
          width: 800,
          height: 600,
          parent: 'phaser-game',
          physics: {
            default: 'arcade',
            arcade: { gravity: { y: 0 }, debug: false },
          },
          scene: [BootScene, PreloadScene, GameScene],
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
  
    return <div id="phaser-game"></div>;
  };

export default PhaserGame;