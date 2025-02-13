import Phaser from "phaser";
import WebFont from "webfontloader";

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({
      key: "MainMenuScene",
    });
  }

  preload() {
    // Use WebFontLoader to load fonts before proceeding

    this.fontsLoaded = false;

    WebFont.load({
      google: {
        families: ["Chewy", "Fredoka:wght@300..700"],
      },
      active: () => {
        console.log("Fonts loaded");
        this.fontsLoaded = true;
        this.startMenu();
      },
      inactive: () => {
        console.error("Font loading failed");
        this.fontsLoaded = true;
        this.startMenu();
      },
    });
  }

  create() {
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.fontsLoaded) {
          if (!this.menuStarted) {
            this.menuStarted = true;
            this.startMenu();
          }
        } else {
          this.time.delayedCall(50, this.create, [], this);
        }
      },
    });
  }

  startMenu() {
    // Center coordinates
    const { width, height } = this.scale;

    // Title text
    if (this.titleText) this.titleText.destroy();
    this.titleText = this.add
      .text(width / 2, height / 4, "Office Simulator 2025", {
        fontSize: "48px",
        color: "#ffffff",
        letterSpacing: 2,
        fontStyle: "Bold",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setY(0);

    // fadeIn tween chain
    this.tweens.add({
      targets: this.titleText,
      alpha: 1,
      y: 300,
      duration: 1000,
      ease: "Sine.easeOut",
      onComplete: () => {
        this.tweens.add({
          targets: this.accreditationText,
          alpha: 1,
          y: 375,
          duration: 1000,
          ease: "Sine.easeOut",
          onComplete: () => {
            this.tweens.add({
              targets: this.authorTexts,
              alpha: 1,
              duration: 1000,
              ease: "Sine.easeOut",
            });
          },
        });
      },
    });

    this.tweens.add({
      targets: this.titleText,
      scale: 1.02,
      duration: 1000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    // Accreditation text
    if (this.accreditationText) this.accreditationText.destroy();
    this.accreditationText = this.add
      .text(width / 2, height / 2.5, "By yours truly", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setY(0);

    // Author names

    /* IMPORTANT! Figure out how to get the names
    to come in one at a time from the left to right */
    this.authorTexts = [];
    const authors = ["Bryce Freshwater", "Santiago Mariani", "Michael Johnson"];
    authors.forEach((name, index) => {
      const text = this.add
        .text(width / 2, height / 2 + index * 40, name, {
          fontSize: "20px",
          color: "#ffffff",
          fontFamily: "Chewy",
        })
        .setOrigin(0.5)
        .setAlpha(0);
      this.authorTexts.push(text);
    });

    // Start game button
    if (!this.startText) {
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
    }

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

    if (this.titleText) {
      this.titleText.setPosition(width / 2, height / 4);
    }

    if (this.accreditationText) {
      this.accreditationText.setPosition(width / 2, height / 3);
    }

    if (this.authorTexts && this.authorTexts.length > 0) {
      this.authorTexts.forEach((text, index) => {
        text.setPosition(width / 2, height / 2 + index * 40);
      });
    }

    if (this.startText) {
      this.startText.setPosition(width / 2, height - 100);
    }
  }
}

export default MainMenuScene;
