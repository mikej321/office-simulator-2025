import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    console.log("Bootscene is preloaded")
  }

  async create() {
    const token = localStorage.getItem("token");
    let next = "MainMenuScene";
    if (token) {
      try {
        const res = await fetch("http://localhost:8000/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) next = "PlayerMenuScene";
      } catch(e) {
        console.error("Auth check failed:", e);
      }
    }

    console.log("BootScene.create -> PreloadScene, target:", next);
    this.scene.start("PreloadScene", { targetScene: next })
  }
}
