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
        families: ["Chewy", "Fredoka:wght@300,400,500,600,700"],
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
      .text(width / 2, height / 4, "", {
        fontSize: "48px",
        color: "#ffffff",
        letterSpacing: 2,
        fontStyle: "Bold",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    let titleIndex = 0;
    const titleText = "BlueSky Thinking";
    const titleTypingSpeed = 80;

    const typeNextLetter = () => {
      if (titleIndex < titleText.length) {
        this.titleText.setText(titleText.substring(0, titleIndex + 1) + "|");
        titleIndex++;
        this.time.delayedCall(titleTypingSpeed, typeNextLetter);
      } else {
        this.titleText.setText(titleText);
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
    if (this.accreditationText) this.accreditationText.destroy();
    this.accreditationText = this.add
      .text(width / 2, height / 3, "", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Author names

    /* IMPORTANT! Figure out how to get the names
    to come in one at a time from the left to right */
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
    this.startText.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
    });

    this.startText.on("pointerout", () => {
      this.input.setDefaultCursor("default");
    });

    this.startText.on("pointerdown", () => {
      this.scene.transition({
        target: "Home",
        duration: 1000,
        moveAbove: true,
        onUpdate: (progress) => {
          this.cameras.main.setAlpha(1 - progress);
        },
      });

      // this.scene.start("TestScene");
      // Replace with your actual game scene
      // this.scene.start("IntroScene");
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

  animateAuthors() {
    this.authorTexts.forEach((text, index) => {
      this.time.delayedCall(index * 500, () => {
        // delays each name by a greater magnitude
        this.tweens.add({
          targets: text,
          x: this.scale.width / 2, // move to center
          duration: 1000,
          ease: "Bounce.Out",
        });
      });
    });
  }

  animateAccreditationText() {
    const accreditationText = "By yours truly";
    let accreditationIndex = 0;
    const accreditationTypingSpeed = 100;

    const accreditationTypingEvent = this.time.addEvent({
      delay: accreditationTypingSpeed,
      callback: () => {
        if (accreditationIndex < accreditationText.length) {
          this.accreditationText.setText(
            accreditationText.substring(0, accreditationIndex + 1) + "|"
          );
          accreditationIndex++;
        } else {
          // Once accreditation is typed, trigger author text animations
          this.accreditationText.setText(accreditationText); // Remove cursor
          this.startCursorBlink(this.accreditationText, true); // Start blinking
          accreditationTypingEvent.remove(); // Once accreditation is typed, stop the event
          this.animateAuthors();
        }
      },
      loop: true,
    });
  }

  startCursorBlink(textObject, stopAfter = false) {
    const blink = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        const currentText = textObject.text;
        if (currentText.endsWith("|")) {
          textObject.setText(currentText.slice(0, -1)); // Remove cursor
        } else {
          textObject.setText(currentText + "|"); // Add cursor
        }
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
