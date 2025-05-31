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

    // Name input
    this.add
      .text(width / 2 - 180, height / 2 - 180, "Name:", {
        fontSize: "28px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0, 0.5);
    this.nameInput = this.add
      .text(width / 2 - 60, height / 2 - 180, "", {
        fontSize: "28px",
        color: "#ffffff",
        fontFamily: "Fredoka",
        backgroundColor: "#333",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0, 0.5)
      .setInteractive();
    this.nameInput.on("pointerdown", () => {
      this.activeInput = "name";
      this.showKeyboard("name");
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
      // Stat value (move to same level as label)
      this.statTexts[stat] = this.add
        .text(width / 2 + 20, y, this.formData[stat], {
          fontSize: "32px",
          color: "#00ff00",
          fontFamily: "Fredoka",
        })
        .setOrigin(0.5, 0.5);
      // Add - button (shifted right)
      const minusBtn = this.add
        .text(width / 2 + 70, y, "-", {
          fontSize: "32px",
          color: "#ff5555",
          fontFamily: "Chewy",
          backgroundColor: "#222",
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setInteractive();
      minusBtn.on("pointerdown", () => this.adjustStat(stat, -1));
      // Add + button (shifted further right)
      const plusBtn = this.add
        .text(width / 2 + 130, y, "+", {
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

    // Sign Out button
    this.signOutButton = this.add
      .text(width / 2, height / 2 + 290, "Sign Out", {
        fontSize: "24px",
        color: "#ff5555",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive();
    this.signOutButton.on("pointerdown", () => this.handleSignOut());
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

  showKeyboard(fieldName) {
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "absolute";
    input.style.opacity = "0";
    input.style.pointerEvents = "none";
    document.body.appendChild(input);
    input.focus();
    input.value = this.formData[fieldName];
    input.oninput = (e) => {
      this.formData[fieldName] = e.target.value;
      this.nameInput.setText(e.target.value);
    };
    input.onblur = () => {
      document.body.removeChild(input);
      this.activeInput = null;
    };
  }

  async handleSubmit() {
    if (!this.formData.name) {
      this.showError("Name is required");
      return;
    }
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
      this.submitButton.setText("Success!");
      this.time.delayedCall(1000, () => {
        this.scene.start("TestScene");
      });
    } catch (error) {
      this.showError(error.message);
      this.submitButton.setText("Submit Application");
      this.submitButton.setInteractive();
    }
  }

  handleSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.scene.start("MainMenuScene");
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
}

export default CharacterCreationScene;
