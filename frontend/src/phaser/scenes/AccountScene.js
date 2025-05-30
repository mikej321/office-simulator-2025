import Phaser from "phaser";
import WebFont from "webfontloader";

class AccountScene extends Phaser.Scene {
  constructor() {
    super({
      key: "AccountScene",
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
    const { width, height } = this.scale;

    // Title
    this.titleText = this.add
      .text(width / 2, height / 4, "Account", {
        fontSize: "48px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Back button
    this.backButton = this.add
      .text(50, 50, "← Back", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: {
          x: 10,
          y: 5,
        },
      })
      .setOrigin(0, 0.5)
      .setInteractive();

    this.backButton.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
    });

    this.backButton.on("pointerout", () => {
      this.input.setDefaultCursor("default");
    });

    this.backButton.on("pointerdown", () => {
      this.scene.transition({
        target: "MainMenuScene",
        duration: 1000,
        moveAbove: true,
        onUpdate: (progress) => {
          this.cameras.main.setAlpha(1 - progress);
        },
      });
    });

    // Form container
    this.formContainer = this.add.container(width / 2, height / 2);

    // Email input
    this.emailInput = this.add
      .text(0, -50, "Email:", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Password input
    this.passwordInput = this.add
      .text(0, 0, "Password:", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Character name input (for signup)
    this.nameInput = this.add
      .text(0, 50, "Character Name:", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Submit button
    this.submitButton = this.add
      .text(0, 150, "Submit", {
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

    this.submitButton.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
    });

    this.submitButton.on("pointerout", () => {
      this.input.setDefaultCursor("default");
    });

    this.submitButton.on("pointerdown", () => {
      // TODO: Handle form submission
      console.log("Form submitted");
    });

    // Add all elements to the container
    this.formContainer.add([
      this.emailInput,
      this.passwordInput,
      this.nameInput,
      this.submitButton,
    ]);

    // Listen for resize events
    this.scale.on("resize", this.resize, this);
  }

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    if (this.titleText) {
      this.titleText.setPosition(width / 2, height / 4);
    }

    if (this.formContainer) {
      this.formContainer.setPosition(width / 2, height / 2);
    }
  }
}

export default AccountScene;
