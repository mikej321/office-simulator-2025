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
    this.titleText = this.add
      .text(width / 2, height / 4, "Office Simulator 2025", {
        fontSize: "48px",
        color: "#ffffff",
        letterSpacing: 2,
        fontStyle: "Bold",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Accreditation text
    this.accreditationText = this.add
      .text(width / 2, height / 2.5, "By yours truly", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Author names
    this.authorTexts = [];
    const authors = ["Bryce Freshwater", "Santiago Mariani", "Michael Johnson"];
    authors.forEach((name, index) => {
      const text = this.add
        .text(width / 2, height / 2 + index * 40, name, {
          fontSize: "20px",
          color: "#ffffff",
          fontFamily: "Chewy",
        })
        .setOrigin(0.5);
      this.authorTexts.push(text);
    });

    // Start game button
    this.startText = this.add
      .text(width / 2, height - 100, "Click to Start", {
        fontSize: "24px",
        color: "#00ff00",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: {
          x: 10,
          y: 10,
        },
      })
      .setOrigin(0.5);

    this.startText.setInteractive();
    this.startText.on("pointerdown", () => {
      this.scene.start("GameScene"); // Replace with your actual game scene
    });

    // Keyboard listener for fullscreen toggle
    this.input.keyboard.on("keydown-TAB", (e) => {
      e.preventDefault();
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    // Listen for resize events to re-center text
    this.scale.on("resize", this.resize, this);
  }

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    // Update positions of text elements
    this.titleText.setPosition(width / 2, height / 4);
    this.accreditationText.setPosition(width / 2, height / 2.5);
    // Reposition each author text
    this.authorTexts.forEach((text, index) => {
      text.setPosition(width / 2, height / 2 + index * 40);
    });
    // Center the start button
    this.startText.setPosition(width / 2, height - 100);
  }
}

export default MainMenuScene;
