import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import GameScene from './scenes/GameScene';
import MainMenuScene from './scenes/MainMenuScene';
import IntroScene from './scenes/IntroScene';
import WorkDay from './scenes/WorkDay';
import Pong from "./scenes/Pong";
import PongBackground from "./scenes/PongBackground";
import LostPong from "./scenes/LostPong";
import WonPong from "./scenes/WonPong";
import MaxPong from './scenes/MaxPong';
import EndOfDay from './scenes/EndOfDay';
import EODStats from './scenes/EODStats';
import Home from './scenes/Home';
import HomeEvening from './scenes/HomeEvening';
import SleepCutscene from "./scenes/SleepCutscene";
import MusicManager from './scenes/MusicManager';
import OpeningScene from './scenes/OpeningScene';
import TutorialScene from './scenes/TutorialScene';
import VictoryCutscene from './scenes/VictoryCutscene'; 
import FiredCutscene from './scenes/FiredCutscene'; 
import DeathCutscene from './scenes/DeathCutscene';
import GlitchyScene from './scenes/glitchyScene';
import CheatsScene from './scenes/CheatsScene'; 

const PhaserGame = () => {
    const gameRef = useRef(null);
  
    useEffect(() => {
      if (!gameRef.current) {
        const config = {
          type: Phaser.AUTO,
          width: window.innerWidth,
          height: window.innerHeight,
          parent: 'game-container', // Ensure this ID exists in App.jsx
          physics: {
            default: 'arcade',
            arcade: { gravity: { y: 0 }, debug: false }, //make debug true to see physics bodies
          },
          scale: {
            mode: Phaser.Scale.RESIZE, // This will update the canvas size
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          scene: [ BootScene, PreloadScene, MainMenuScene, WorkDay, GameScene, IntroScene, Pong, PongBackground, LostPong, WonPong, MaxPong, EndOfDay, EODStats, Home, HomeEvening, SleepCutscene, MusicManager, OpeningScene, TutorialScene, VictoryCutscene, FiredCutscene, DeathCutscene, GlitchyScene, CheatsScene ],
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