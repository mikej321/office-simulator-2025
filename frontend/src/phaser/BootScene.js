import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
  }

  async create() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch("http://localhost:8000/api/auth/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          if (this.scene && this.scene.manager) {
            this.scene.start("PlayerMenuScene");
          }
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (this.scene && this.scene.manager) {
      this.scene.start("MainMenuScene");
    }
  }
}
