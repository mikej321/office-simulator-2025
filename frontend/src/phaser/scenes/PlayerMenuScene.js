import Phaser from "phaser";
import WebFont from "webfontloader";

class PlayerMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlayerMenuScene" });
  }

  preload() {
    this.fontsLoaded = false;
    WebFont.load({
      google: { families: ["Chewy", "Fredoka:wght@300,400,500,600,700"] },
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
    const { width, height } = this.scale;

    // Title
    this.titleText = this.add
      .text(width / 2, height / 4, "BlueSky Thinking", {
        fontSize: "48px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Menu container for buttons
    this.menuContainer = this.add.container(width / 2, height / 2 + 50);

    // New Game button
    this.newGameButton = this.add
      .text(0, -30, "New Game", {
        fontSize: "28px",
        color: "#00ff00",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive();

    // Load Game button
    this.loadGameButton = this.add
      .text(0, 30, "Load Game", {
        fontSize: "28px",
        color: "#00ff00",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.menuContainer.add([this.newGameButton, this.loadGameButton]);

    // Hover effects
    [this.newGameButton, this.loadGameButton].forEach((button) => {
      button.on("pointerover", () => {
        this.input.setDefaultCursor("pointer");
      });
      button.on("pointerout", () => {
        this.input.setDefaultCursor("default");
      });
    });

    // New Game click handler
    this.newGameButton.on("pointerdown", () => {
      this.scene.start("CharacterCreationScene");
    });

    // Load Game click handler (to be implemented)
    this.loadGameButton.on("pointerdown", () => {
      // TODO: Implement load game logic
      alert("Load Game not implemented yet.");
    });

    // Sign Out button at the bottom
    this.signOutButton = this.add
      .text(width / 2, height - 50, "Sign Out", {
        fontSize: "24px",
        color: "#ff5555",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive();
    this.signOutButton.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
    });
    this.signOutButton.on("pointerout", () => {
      this.input.setDefaultCursor("default");
    });
    this.signOutButton.on("pointerdown", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.scene.start("MainMenuScene");
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
      this.menuContainer.setPosition(width / 2, height / 2 + 50);
    }
    if (this.signOutButton) {
      this.signOutButton.setPosition(width / 2, height - 50);
    }
  }
}

export default PlayerMenuScene;
