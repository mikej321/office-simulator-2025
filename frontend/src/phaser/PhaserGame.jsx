import { useEffect, useRef } from "react";
import Phaser from "phaser";
import BootScene from "./BootScene";
import PreloadScene from "./scenes/PreloadScene";
import GameScene from "./scenes/GameScene";
import MainMenuScene from "./scenes/MainMenuScene";
import TestScene from "./scenes/TestScene";
import AccountScene from "./scenes/AccountScene";
import PlayerMenuScene from "./scenes/PlayerMenuScene";
import CharacterCreationScene from "./scenes/CharacterCreationScene";
import LoadGameScene from "./scenes/LoadGameScene";
import IntroScene from "./scenes/IntroScene";

const PhaserGame = () => {
  const gameRef = useRef(null);

  useEffect(() => {
    if (!gameRef.current) {
      const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: "game-container",
        physics: {
          default: "arcade",
          arcade: {
            gravity: { y: 0 }, 
            debug: false, 
          },
        },
        scale: {
          mode: Phaser.Scale.RESIZE, 
          autoCenter: Phaser.Scale.CENTER_BOTH, 
        },
        scene: [
          BootScene, 
          PreloadScene, 
          MainMenuScene, 
          AccountScene, 
          PlayerMenuScene, 
          LoadGameScene, 
          CharacterCreationScene, 
          TestScene, 
          GameScene, 
          IntroScene, 
        ],
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
