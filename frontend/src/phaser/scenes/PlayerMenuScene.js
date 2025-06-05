import Phaser from "phaser";
import WebFont from "webfontloader";
import InputField from "../../factories/inputField";

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

    // Cheat button
    this.cheatButton = this.add
      .text(0, 100, "Cheat!", {
        fontSize: "24px",
        color: "#ffaa00",
        fontFamily: "Chewy",
        fontStyle: "italic",
        backgroundColor: "#222",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.menuContainer.add([
      this.newGameButton,
      this.loadGameButton,
      this.cheatButton,
    ]);

    // Hover effects
    [this.newGameButton, this.loadGameButton, this.cheatButton].forEach(
      (button) => {
        button.on("pointerover", () => {
          this.input.setDefaultCursor("pointer");
        });
        button.on("pointerout", () => {
          this.input.setDefaultCursor("default");
        });
      }
    );

    // New Game click handler
    this.newGameButton.on("pointerdown", () => {
      this.scene.start("CharacterCreationScene");
    });

    // Load Game click handler
    this.loadGameButton.on("pointerdown", () => {
      this.scene.start("LoadGameScene");
    });

    // Cheat button click handler
    this.cheatButton.on("pointerdown", () => {
      this.showCheatPopup();
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

  showCheatPopup() {
    const { width, height } = this.scale;

    // Popup background
    this.cheatPopup = this.add.container(width / 2, height / 2);
    const popupBg = this.add
      .rectangle(0, 0, 400, 200, 0x222222, 1)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xffffff);

    // InputField for scene name (no label, centered text)
    this.cheatInput = new InputField(this, {
      x: 0,
      y: -30,
      width: 240,
      height: 44,
      label: "",
      initialValue: "",
      showLabel: false,
      centerText: true,
      onChange: () => {
        this.cheatFeedback.setText("");
      },
    });

    // Submit button
    const submitBtn = this.add
      .text(-50, 40, "Go!", {
        fontSize: "24px",
        color: "#00ff00",
        fontFamily: "Chewy",
        backgroundColor: "#333",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    submitBtn.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    submitBtn.on("pointerout", () => this.input.setDefaultCursor("default"));
    submitBtn.on("pointerdown", () => this.handleCheatSubmit());

    // Cancel button
    const cancelBtn = this.add
      .text(50, 40, "Cancel", {
        fontSize: "24px",
        color: "#ff5555",
        fontFamily: "Chewy",
        backgroundColor: "#333",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    cancelBtn.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    cancelBtn.on("pointerout", () => this.input.setDefaultCursor("default"));
    cancelBtn.on("pointerdown", () => {
      this.closeCheatPopup();
      // Optionally, you can also reset any cheat state here
    });

    // Feedback text
    this.cheatFeedback = this.add
      .text(0, 80, "", {
        fontSize: "20px",
        color: "#ff5555",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Close popup on background click
    popupBg.setInteractive();
    popupBg.on("pointerdown", () => this.closeCheatPopup());

    // Only add box and text (not label) to the popup
    this.cheatPopup.add([
      popupBg,
      this.cheatInput.box,
      this.cheatInput.text,
      submitBtn,
      cancelBtn,
      this.cheatFeedback,
    ]);
    this.children.bringToTop(this.cheatPopup);

    // Focus input (should show blinking cursor)
    this.cheatInput.focus();
    if (this.cheatInput.cursor) {
      this.cheatPopup.add(this.cheatInput.cursor);
    }
  }

  closeCheatPopup() {
    if (this.cheatInput) this.cheatInput.destroy();
    if (this.cheatPopup) this.cheatPopup.destroy();
  }

  handleCheatSubmit() {
    const sceneName = this.cheatInput.getValue().trim();
    if (!sceneName) {
      this.cheatFeedback.setText("Enter a scene name.");
      return;
    }

    // Check if the scene exists
    if (this.scene.manager.keys[sceneName]) {
      // Set base player data for cheat session only
      const basicStats = {
        mentalPoints: 5,
        energyLevel: 5,
        motivationLevel: 5,
        focusLevel: 5,
        workDayCount: 1,
      };
      localStorage.setItem("playerName", "Cheat3r");
      localStorage.setItem("playerStats", JSON.stringify(basicStats));

      this.cheatFeedback.setColor("#00ff00").setText("success!");
      this.time.delayedCall(500, () => {
        this.closeCheatPopup();
        // Use PreloadScene to load assets before starting the target scene
        this.scene.start("PreloadScene", { targetScene: sceneName });
      });
    } else {
      this.cheatFeedback.setColor("#ff5555").setText("wrong cheat code");
    }
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
