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
    const { width, height } = this.scale;

    // Title
    this.titleText = this.add
      .text(width / 2, height / 4, "Office Simulator 2025", {
        fontSize: "48px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Menu container
    this.menuContainer = this.add.container(width / 2, height / 2);

    // New Account button
    this.newAccountButton = this.add
      .text(0, -50, "New Account", {
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
      .text(0, 0, "Sign In", {
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

    // Play button
    this.playButton = this.add
      .text(0, 50, "Play", {
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

    // Add all buttons to the container
    this.menuContainer.add([
      this.newAccountButton,
      this.signInButton,
      this.playButton,
    ]);

    // Add hover effects and click handlers for all buttons
    [this.newAccountButton, this.signInButton, this.playButton].forEach(
      (button) => {
        button.on("pointerover", () => {
          this.input.setDefaultCursor("pointer");
        });

        button.on("pointerout", () => {
          this.input.setDefaultCursor("default");
        });
      }
    );

    // New Account button click handler
    this.newAccountButton.on("pointerdown", () => {
      this.scene.transition({
        target: "AccountScene",
        duration: 1000,
        moveAbove: true,
        onUpdate: (progress) => {
          this.cameras.main.setAlpha(1 - progress);
        },
      });
    });

    // Sign In button click handler
    this.signInButton.on("pointerdown", () => {
      this.scene.transition({
        target: "AccountScene",
        duration: 1000,
        moveAbove: true,
        onUpdate: (progress) => {
          this.cameras.main.setAlpha(1 - progress);
        },
      });
    });

    // Play button click handler
    this.playButton.on("pointerdown", () => {
      this.scene.transition({
        target: "GameScene",
        duration: 1000,
        moveAbove: true,
        onUpdate: (progress) => {
          this.cameras.main.setAlpha(1 - progress);
        },
      });
    });

    // Listen for resize events
    this.scale.on("resize", this.resize, this);
  }

  resize(gameSize) {
    const width = gameSize.width;
    const height = gameSize.height;

    if (this.titleText) {
      this.titleText.setPosition(width / 2, height / 4);
    }

    if (this.menuContainer) {
      this.menuContainer.setPosition(width / 2, height / 2);
    }
  }
}

export default MainMenuScene;
