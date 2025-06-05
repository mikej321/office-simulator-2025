import Phaser from "phaser";
import MainMenuScene from "./scenes/MainMenuScene";
import GameScene from "./scenes/GameScene";
import AccountScene from "./scenes/AccountScene";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  scene: [MainMenuScene, AccountScene, GameScene],
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
};

export default config;
