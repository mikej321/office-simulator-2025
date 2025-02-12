import Phaser from "phaser";

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({
      key: "MainMenuScene",
    });
  }

  create() {
    // Center coordinates
    const { width, height } = this.scale;

    // Title text
    this.add
      .text(width / 2, height / 4, "Office Simulator 2025", {
        fontSize: "48px",
        color: "#ffffff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    // Accreditation text
    this.add
      .text(width / 2, height / 2.5, "By yours truly", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    // Author names
    const authors = ["Bryce Freshwater", "Santiago Mariani", "Michael Johnson"];
    authors.forEach((name, index) => {
      this.add
        .text(width / 2, height / 2 + index * 40, name, {
          fontSize: "20px",
          color: "#ffffff",
          fontFamily: "Arial",
        })
        .setOrigin(0.5);
    });

    // Start game button
    const startText = this.add
      .text(width / 2, height - 100, "Click to Start", {
        fontSize: "24px",
        color: "#00ff00",
        fontFamily: "Arial",
        backgroundColor: "#222",
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0.5);

    startText.setInteractive();
    startText.on("pointerdown", () => {
      this.scene.start("GameScene"); // Replace with your actual game scene
    });
  }
}

export default MainMenuScene;
