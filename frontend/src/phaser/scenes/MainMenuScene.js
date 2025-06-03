import Phaser from "phaser";
import WebFont from "webfontloader";

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
  }

  preload() {
    this.fontsReady = false;

    WebFont.load({
      google: {
        families: ["Chewy", "Fredoka:wght@300,400,500,600,700"],
      },
      active: () => {
        console.log("Fonts loaded");
        this.fontsReady = true;
      },
      inactive: () => {
        console.error("Font loading failed");
        this.fontsReady = true;
      },
    });
  }

  create() {
    this.menuStarted = false;

    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (this.fontsReady && !this.menuStarted) {
          this.menuStarted = true;
          this.startMenu();
        }
      },
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

    this.scale.on("resize", this.resize, this);
  }

  startMenu() {
    const { width, height } = this.scale;

    // Title
    this.titleText = this.add
      .text(width / 2, height / 4, "", {
        fontSize: "48px",
        color: "#ffffff",
        letterSpacing: 2,
        fontStyle: "Bold",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    let titleIndex = 0;
    const titleString = "BlueSky Thinking";

    const typeNextLetter = () => {
      if (titleIndex < titleString.length) {
        this.titleText.setText(titleString.substring(0, titleIndex + 1) + "|");
        titleIndex++;
        this.time.delayedCall(80, typeNextLetter);
      } else {
        this.titleText.setText(titleString);
        this.startCursorBlink(this.titleText, true);
        this.animateAccreditationText();
      }
    };
    typeNextLetter();

    this.tweens.add({
      targets: this.titleText,
      scale: 1.02,
      duration: 1000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    // Accreditation text
    this.accreditationText = this.add
      .text(width / 2, height / 3, "", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Authors
    this.authorTexts = [];
    const authors = ["Bryce Freshwater", "Santiago Mariani", "Michael Johnson"];
    authors.forEach((name, index) => {
      const text = this.add
        .text(-200, height / 2 + index * 40, name, {
          fontSize: "20px",
          color: "#ffffff",
          fontFamily: "Chewy",
        })
        .setOrigin(0.5);
      this.authorTexts.push(text);
    });

    // Start Game Button
    this.startText = this.add
      .text(width / 2, height - 100, "Click to Start", {
        fontSize: "24px",
        color: "#00ff00",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 10, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.startText.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
    });

    this.startText.on("pointerout", () => {
      this.input.setDefaultCursor("default");
    });

    this.startText.on("pointerdown", () => {
      this.scene.transition({
        target: "OpeningScene",
        duration: 1000,
        moveAbove: true,
        onUpdate: (progress) => {
          this.cameras.main.setAlpha(1 - progress);
        },
      });
    });

    // Cheats Button
    this.cheatsButton = this.add
      .text(width / 2, height - 50, "Cheats", {
        fontSize: "24px",
        color: "#ffcc00",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.cheatsButton.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
    });

    this.cheatsButton.on("pointerout", () => {
      this.input.setDefaultCursor("default");
    });

    this.cheatsButton.on("pointerdown", () => {
      this.scene.start("CheatsScene");
    });
  }

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    if (this.titleText) this.titleText.setPosition(width / 2, height / 4);
    if (this.accreditationText) this.accreditationText.setPosition(width / 2, height / 3);
    if (this.startText) this.startText.setPosition(width / 2, height - 100);
    if (this.cheatsButton) this.cheatsButton.setPosition(width / 2, height - 50);

    if (this.authorTexts) {
      this.authorTexts.forEach((text, index) => {
        text.setPosition(width / 2, height / 2 + index * 40);
      });
    }
  }

  animateAccreditationText() {
    const accText = "By yours truly";
    let index = 0;

    const type = this.time.addEvent({
      delay: 100,
      callback: () => {
        if (index < accText.length) {
          this.accreditationText.setText(accText.substring(0, index + 1) + "|");
          index++;
        } else {
          this.accreditationText.setText(accText);
          this.startCursorBlink(this.accreditationText, true);
          this.animateAuthors();
          type.remove();
        }
      },
      loop: true,
    });
  }

  animateAuthors() {
    this.authorTexts.forEach((text, index) => {
      this.time.delayedCall(index * 500, () => {
        this.tweens.add({
          targets: text,
          x: this.scale.width / 2,
          duration: 1000,
          ease: "Bounce.Out",
        });
      });
    });
  }

  startCursorBlink(textObject, stopAfter = false) {
    const blink = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        const txt = textObject.text;
        textObject.setText(txt.endsWith("|") ? txt.slice(0, -1) : txt + "|");
      },
    });

    if (stopAfter) {
      this.time.delayedCall(500, () => {
        textObject.setText(textObject.text.replace("|", ""));
        blink.remove();
      });
    }
  }
}

export default MainMenuScene;
