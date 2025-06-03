import Phaser from "phaser";
import WebFont from "webfontloader";

/**
 * CharacterCreationScene handles the character creation process.
 * It provides a form interface for users to:
 * - Enter a character name
 * - Allocate stat points to different attributes
 * - Submit the character for creation
 * @extends Phaser.Scene
 */
class CharacterCreationScene extends Phaser.Scene {
  /**
   * Creates an instance of CharacterCreationScene.
   * Initializes default stats and form data.
   */
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

  /**
   * Preloads required assets and fonts for the scene.
   * Uses WebFontLoader to load Google Fonts before proceeding.
   */
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

  /**
   * Creates the scene and sets up initial state.
   * Waits for fonts to load before starting the form.
   */
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

  /**
   * Sets up the character creation form UI.
   * Creates input fields, stat allocation controls, and submit button.
   */
  startForm() {
    // Destroy old stat value texts if they exist
    if (this.statTexts) {
      Object.values(this.statTexts).forEach((text) => text.destroy());
    }
    if (this.remainingText) {
      this.remainingText.destroy();
    }
    const { width, height } = this.scale;
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
    this.stats.forEach((stat) => {
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

  /**
   * Adjusts a character stat up or down.
   * Manages the remaining points pool and updates UI.
   * @param {string} stat - The stat to adjust
   * @param {number} delta - The amount to adjust (-1 or 1)
   */
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

  /**
   * Focuses the name input field.
   * Creates a blinking cursor and sets up keyboard input handling.
   */
  focusNameInput() {
    if (this.activeInput === "name") return;
    this.activeInput = "name";
    this.nameInput.setColor("#ffff00");
    this.nameInputBox.setStrokeStyle(2, 0xffff00);
    this.inputOverlay.visible = true;
    // Create blinking cursor
    if (this.cursor) {
      this.cursor.destroy();
    }
    const textX = this.nameInput.x;
    const textY = this.nameInput.y;
    const textWidth = this.nameInput.text ? this.nameInput.width : 0;
    this.cursor = this.add
      .rectangle(textX + textWidth, textY, 2, 28, 0xffff00)
      .setOrigin(0, 0.5);
    this.cursor.blinkTween = this.tweens.add({
      targets: this.cursor,
      alpha: { from: 1, to: 0 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
    this.formStarted && this.children.bringToTop(this.cursor);
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
      // Update cursor position
      if (this.cursor) {
        const textWidth = this.nameInput.text ? this.nameInput.width : 0;
        this.cursor.x = this.nameInput.x + textWidth;
      }
    };
    this.input.keyboard.on("keydown", this.keyboardListener);
  }

  /**
   * Removes focus from the name input field.
   * Cleans up cursor and keyboard listeners.
   */
  blurNameInput() {
    if (this.activeInput !== "name") return;
    this.activeInput = null;
    this.nameInput.setColor("#ffffff");
    this.nameInputBox.setStrokeStyle(2, 0xaaaaaa);
    this.inputOverlay.visible = false;
    if (this.cursor) {
      this.cursor.destroy();
      this.cursor = null;
    }
    if (this.keyboardListener) {
      this.input.keyboard.off("keydown", this.keyboardListener);
      this.keyboardListener = null;
    }
  }

  /**
   * Handles form submission.
   * Validates input and creates the character.
   * Manages loading states and error handling.
   */
  async handleSubmit() {
    this.blurNameInput();
    if (this.remainingPoints > 0) {
      this.showError("Please allocate all points");
      return;
    }

    // Disable the button immediately
    this.submitButton.disableInteractive();
    this.submitButton.setText("Submitting...");

    try {
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

      // Fade out the submit button
      this.tweens.add({
        targets: this.submitButton,
        alpha: 0,
        duration: 500,
        ease: "Power2",
        onComplete: () => {
          // Create and show the "Hired!" text
          const hiredText = this.add
            .text(this.submitButton.x, this.submitButton.y, "Hired!", {
              fontSize: "28px",
              color: "#00ff00",
              fontFamily: "Chewy",
              backgroundColor: "#222",
              padding: { x: 16, y: 8 },
            })
            .setOrigin(0.5)
            .setAlpha(0);

          // Fade in the "Hired!" text
          this.tweens.add({
            targets: hiredText,
            alpha: 1,
            duration: 500,
            ease: "Power2",
            onComplete: () => {
              // Wait 2 seconds before starting the scene transition
              this.time.delayedCall(2000, () => {
                // Fade out the "Hired!" text
                this.tweens.add({
                  targets: hiredText,
                  alpha: 0,
                  duration: 500,
                  ease: "Power2",
                  onComplete: () => {
                    // Start fade to black
                    this.cameras.main.fade(1000, 0, 0, 0);
                    // Wait for fade to complete before changing scene
                    this.time.delayedCall(1000, () => {
                      this.scene.start("OpeningScene");
                    });
                  },
                });
              });
            },
          });
        },
      });
    } catch (error) {
      this.showError(error.message);
      this.submitButton.setText("Submit Application");
      this.submitButton.setInteractive();
    }
  }

  /**
   * Displays an error message to the user.
   * @param {string} message - The error message to display
   */
  showError(message) {
    this.errorText.setText(message);
    this.tweens.add({
      targets: this.errorText,
      alpha: { from: 0, to: 1 },
      duration: 200,
      ease: "Power2",
    });
  }

  /**
   * Cleans up resources when the scene is shut down.
   * Removes focus from input fields and cleans up event listeners.
   */
  shutdown() {
    this.blurNameInput();
  }
}

export default CharacterCreationScene;
