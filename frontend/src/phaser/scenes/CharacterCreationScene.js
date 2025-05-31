import Phaser from "phaser";
import WebFont from "webfontloader";

class CharacterCreationScene extends Phaser.Scene {
  constructor() {
    super({ key: "CharacterCreationScene" });
    this.initialStat = 3;
    this.extraPoints = 5;
    this.stats = [
      "mentalPoints",
      "energyLevel",
      "motivationLevel",
      "focusLevel",
    ];
    this.statLabels = {
      mentalPoints: "Mental Points",
      energyLevel: "Energy Level",
      motivationLevel: "Motivation Level",
      focusLevel: "Focus Level",
    };
    this.formData = {
      name: "",
      mentalPoints: this.initialStat,
      energyLevel: this.initialStat,
      motivationLevel: this.initialStat,
      focusLevel: this.initialStat,
    };
    this.remainingPoints = this.extraPoints;
  }

  preload() {
    this.fontsLoaded = false;
    WebFont.load({
      google: { families: ["Chewy", "Fredoka:wght@300,400,500,600,700"] },
      active: () => {
        this.fontsLoaded = true;
        this.startForm();
      },
      inactive: () => {
        this.fontsLoaded = true;
        this.startForm();
      },
    });
  }

  create() {
    // Reset all state for a fresh form
    this.formStarted = false;
    this.formData = {
      name: "",
      mentalPoints: this.initialStat,
      energyLevel: this.initialStat,
      motivationLevel: this.initialStat,
      focusLevel: this.initialStat,
    };
    this.remainingPoints = this.extraPoints;
    this.activeInput = null;
    this.keyboardListener = null;
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.fontsLoaded) {
          if (!this.formStarted) {
            this.formStarted = true;
            this.startForm();
          }
        } else {
          this.time.delayedCall(50, this.create, [], this);
        }
      },
    });
  }

  startForm() {
    const { width, height } = this.scale;
    this.add
      .rectangle(width / 2, height / 2, 500, 600, 0x222222, 0.95)
      .setOrigin(0.5);

    // Title
    this.titleText = this.add
      .text(width / 2, height / 2 - 250, "Job Application", {
        fontSize: "40px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Back button at top left
    this.backButton = this.add
      .text(40, 40, "← Back", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0, 0.5)
      .setInteractive();
    this.backButton.on("pointerdown", () => {
      this.scene.start("PlayerMenuScene");
    });

    // Name input background box (always visible)
    const nameBoxX = width / 2 - 60;
    const nameBoxY = height / 2 - 180;
    const nameBoxWidth = 240;
    const nameBoxHeight = 44;
    this.nameInputBox = this.add
      .rectangle(
        nameBoxX + nameBoxWidth / 2,
        nameBoxY,
        nameBoxWidth,
        nameBoxHeight,
        0x444444,
        1
      )
      .setOrigin(0.5)
      .setInteractive();
    this.nameInputBox.setStrokeStyle(2, 0xaaaaaa);
    // Make the whole box clickable
    this.nameInputBox.on("pointerdown", () => {
      this.focusNameInput();
    });

    // Name label
    this.add
      .text(width / 2 - 180, height / 2 - 180, "Name:", {
        fontSize: "28px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0, 0.5);
    // Name text (always visible)
    this.nameInput = this.add
      .text(nameBoxX + 12, nameBoxY, this.formData.name, {
        fontSize: "28px",
        color: "#ffffff",
        fontFamily: "Fredoka",
        fixedWidth: nameBoxWidth - 24,
        maxLines: 1,
        backgroundColor: undefined,
        padding: { x: 0, y: 0 },
      })
      .setOrigin(0, 0.5)
      .setInteractive();
    // Also allow clicking the text to focus
    this.nameInput.on("pointerdown", () => {
      this.focusNameInput();
    });

    // Add a transparent overlay to detect clicks outside input
    this.inputOverlay = this.add
      .rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        this.scale.width,
        this.scale.height,
        0x000000,
        0
      )
      .setOrigin(0.5)
      .setDepth(10000)
      .setInteractive();
    this.inputOverlay.visible = false;
    this.inputOverlay.on("pointerdown", () => {
      this.blurNameInput();
    });

    // Stat allocation
    this.statTexts = {};
    let y = height / 2 - 100;
    this.stats.forEach((stat, i) => {
      this.add
        .text(width / 2 - 180, y, this.statLabels[stat] + ":", {
          fontSize: "26px",
          color: "#ffffff",
          fontFamily: "Fredoka",
        })
        .setOrigin(0, 0.5);
      // Stat value (move to right)
      this.statTexts[stat] = this.add
        .text(width / 2 + 60, y, this.formData[stat], {
          fontSize: "32px",
          color: "#00ff00",
          fontFamily: "Fredoka",
        })
        .setOrigin(0.5, 0.5);
      // Add - button (move closer to +)
      const minusBtn = this.add
        .text(width / 2 + 140, y, "-", {
          fontSize: "32px",
          color: "#ff5555",
          fontFamily: "Chewy",
          backgroundColor: "#222",
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setInteractive();
      minusBtn.on("pointerdown", () => this.adjustStat(stat, -1));
      // Add + button (move further right)
      const plusBtn = this.add
        .text(width / 2 + 170, y, "+", {
          fontSize: "32px",
          color: "#55ff55",
          fontFamily: "Chewy",
          backgroundColor: "#222",
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setInteractive();
      plusBtn.on("pointerdown", () => this.adjustStat(stat, 1));
      y += 60;
    });

    // Remaining points (moved lower)
    this.remainingText = this.add
      .text(
        width / 2,
        height / 2 + 130,
        `Points left: ${this.remainingPoints}`,
        {
          fontSize: "24px",
          color: "#ffff00",
          fontFamily: "Fredoka",
        }
      )
      .setOrigin(0.5);

    // Error text
    this.errorText = this.add
      .text(width / 2, height / 2 + 170, "", {
        fontSize: "22px",
        color: "#ff3333",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Submit button
    this.submitButton = this.add
      .text(width / 2, height / 2 + 230, "Submit Application", {
        fontSize: "28px",
        color: "#00ff00",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive();
    this.submitButton.on("pointerdown", () => this.handleSubmit());
  }

  adjustStat(stat, delta) {
    if (delta === 1 && this.remainingPoints > 0) {
      this.formData[stat] += 1;
      this.remainingPoints -= 1;
    } else if (delta === -1 && this.formData[stat] > this.initialStat) {
      this.formData[stat] -= 1;
      this.remainingPoints += 1;
    }
    this.statTexts[stat].setText(this.formData[stat]);
    this.remainingText.setText(`Points left: ${this.remainingPoints}`);
  }

  focusNameInput() {
    if (this.activeInput === "name") return;
    this.activeInput = "name";
    this.nameInput.setColor("#ffff00");
    this.inputOverlay.visible = true;
    // Remove any previous handler before adding a new one
    if (this.keyboardListener) {
      this.input.keyboard.off("keydown", this.keyboardListener);
      this.keyboardListener = null;
    }
    this.keyboardListener = (event) => {
      if (this.activeInput !== "name") return;
      if (event.key === "Backspace") {
        this.formData.name = this.formData.name.slice(0, -1);
      } else if (event.key === "Enter") {
        this.blurNameInput();
        return;
      } else if (event.key.length === 1 && this.formData.name.length < 20) {
        this.formData.name += event.key;
      }
      this.nameInput.setText(this.formData.name);
    };
    this.input.keyboard.on("keydown", this.keyboardListener);
  }

  blurNameInput() {
    if (this.activeInput !== "name") return;
    this.activeInput = null;
    this.nameInput.setColor("#ffffff");
    this.inputOverlay.visible = false;
    if (this.keyboardListener) {
      this.input.keyboard.off("keydown", this.keyboardListener);
      this.keyboardListener = null;
    }
  }

  async handleSubmit() {
    this.blurNameInput();
    if (this.remainingPoints > 0) {
      this.showError("Please allocate all points");
      return;
    }
    try {
      this.submitButton.setText("Submitting...");
      this.submitButton.disableInteractive();
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8000/api/character/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(this.formData),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create character");
      }
      // Store character in global registry
      this.game.registry.set("activeCharacter", data.character);
      this.submitButton.setText("Hired!");
      this.time.delayedCall(1000, () => {
        this.scene.start("TestScene");
      });
    } catch (error) {
      this.showError(error.message);
      this.submitButton.setText("Submit Application");
      this.submitButton.setInteractive();
    }
  }

  showError(message) {
    this.errorText.setText(message);
    this.tweens.add({
      targets: this.errorText,
      alpha: { from: 0, to: 1 },
      duration: 200,
      ease: "Power2",
    });
  }

  shutdown() {
    this.blurNameInput();
  }
}

export default CharacterCreationScene;
