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
        this.fontsLoaded = true;
        this.startMenu();
      },
      inactive: () => {
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

    // Menu container for buttons
    this.menuContainer = this.add.container(width / 2, height - 100);

    // New Account button
    this.newAccountButton = this.add
      .text(0, -30, "New Account", {
        fontSize: "24px",
        color: "#00ff00",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0.5)
      .setInteractive();

    // Sign In button
    this.signInButton = this.add
      .text(0, 20, "Sign In", {
        fontSize: "24px",
        color: "#00ff00",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0.5)
      .setInteractive();

    // Add buttons to container
    this.menuContainer.add([this.newAccountButton, this.signInButton]);

    // Add hover effects and click handlers for buttons
    [this.newAccountButton, this.signInButton].forEach((button) => {
      button.on("pointerover", () => {
        this.input.setDefaultCursor("pointer");
      });

      button.on("pointerout", () => {
        this.input.setDefaultCursor("default");
      });
    });

    // New Account button click handler
    this.newAccountButton.on("pointerdown", () => {
      console.log("New Account button clicked");
      this.scene.start("AccountScene", { mode: "signup" });
    });

    // Sign In button click handler
    this.signInButton.on("pointerdown", () => {
      console.log("Sign In button clicked");
      this.scene.start("AccountScene", { mode: "login" });
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

    if (this.menuContainer) {
      this.menuContainer.setPosition(width / 2, height - 100);
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
