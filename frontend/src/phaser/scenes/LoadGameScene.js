import Phaser from "phaser";
import WebFont from "webfontloader";
import { showConfirmPopup } from "../../utils/showConfirmPopup";

class LoadGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoadGameScene" });
    this.characters = [];
    this.currentIndex = 0;
    this.menuStarted = false;
    this.fontsLoaded = false;
    this.charactersLoaded = false;
  }

  preload() {
    this.fontsLoaded = false;
    WebFont.load({
      google: { families: ["Chewy", "Fredoka:wght@300,400,500,600,700"] },
      active: () => {
        this.fontsLoaded = true;
      },
      inactive: () => {
        this.fontsLoaded = true;
      },
    });
  }

  create() {
    this.menuStarted = false;
    this.charactersLoaded = false;
    this.loadCharacters();

    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.fontsLoaded && this.charactersLoaded) {
          if (!this.menuStarted) {
            this.menuStarted = true;
            this.showCharacter();
          }
        } else {
          this.time.delayedCall(50, this.create, [], this);
        }
      },
    });
  }

  shutdown() {
    this.clearScreen();
    this.characters = [];
    this.currentIndex = 0;
    this.menuStarted = false;
    this.fontsLoaded = false;
    this.charactersLoaded = false;
  }

  async loadCharacters() {
    this.charactersLoaded = false;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8000/api/character/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      this.characters = data.characters || [];
      this.currentIndex = 0;
      this.charactersLoaded = true;
    } catch {
      this.characters = [];
      this.charactersLoaded = true;
    }
  }

  showCharacter() {
    this.clearScreen();
    const { width, height } = this.scale;
    if (!this.characters.length) {
      this.add
        .text(width / 2, height / 2 - 40, "No saved characters found.", {
          fontSize: "32px",
          color: "#fff",
          fontFamily: "Fredoka",
        })
        .setOrigin(0.5);
      const backBtn = this.add
        .text(width / 2, height / 2 + 40, "Back", {
          fontSize: "28px",
          color: "#00ff00",
          fontFamily: "Chewy",
          backgroundColor: "#222",
          padding: { x: 16, y: 8 },
        })
        .setOrigin(0.5)
        .setInteractive();
      backBtn.on("pointerdown", () => this.scene.start("PlayerMenuScene"));
      return;
    }
    const char = this.characters[this.currentIndex];
    // Title
    this.add
      .text(width / 2, 80, "Load Game", {
        fontSize: "48px",
        color: "#fff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);
    // Character name
    this.add
      .text(width / 2, 160, char.name, {
        fontSize: "36px",
        color: "#00ff00",
        fontFamily: "Chewy",
      })
      .setOrigin(0.5);

    // Character stats
    let y = 220;
    const stats = char.stats || {};
    const game = char.gameState || {};
    const statLabels = {
      mentalPoints: "Mental Points",
      energyLevel: "Energy Level",
      motivationLevel: "Motivation Level",
      focusLevel: "Focus Level",
      wins: "Wins",
      losses: "Losses",
      projectProgress: "Project Progress",
      workDayCount: "Current Day",
    };

    // Display only the specified stats
    [
      ["mentalPoints", stats.mentalPoints],
      ["energyLevel", stats.energyLevel],
      ["motivationLevel", stats.motivationLevel],
      ["focusLevel", stats.focusLevel],
      ["wins", game.wins],
      ["losses", game.losses],
      ["projectProgress", game.projectProgress],
      ["workDayCount", game.workDayCount],
    ].forEach(([key, value]) => {
      if (value !== undefined) {
        this.add
          .text(width / 2 - 150, y, statLabels[key] + ":", {
            fontSize: "26px",
            color: "#fff",
            fontFamily: "Fredoka",
          })
          .setOrigin(0, 0.5);
        this.add
          .text(width / 2 + 150, y, String(value), {
            fontSize: "26px",
            color: "#00ff00",
            fontFamily: "Fredoka",
          })
          .setOrigin(1, 0.5);
        y += 36;
      }
    });

    // Add extra spacing after stats
    y += 20;

    // Action buttons container
    // const buttonSpacing = 200; // Space between buttons

    // Keep Playing button - aligned with stat names
    const playBtn = this.add
      .text(width / 2 - 150, y, "Keep Playing", {
        fontSize: "28px",
        color: "#00ff00",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0, 0.5)
      .setInteractive();
    playBtn.on("pointerdown", () => {
      showConfirmPopup(
        this,
        "Are you sure you want to load this character?",
        () => {
          console.log("Loading character data:", char);
          this.game.registry.set("activeCharacter", char);
          this.scene.start("TestScene");
        }
      );
    });

    // Delete button - aligned with stat values
    const deleteBtn = this.add
      .text(width / 2 + 150, y, "Delete", {
        fontSize: "24px",
        color: "#ff5555",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(1, 0.5)
      .setInteractive();
    deleteBtn.on("pointerdown", () => {
      showConfirmPopup(
        this,
        "Are you sure you want to delete this character?",
        () => this.deleteCharacter(char.id)
      );
    });

    // Left/right arrows - moved below buttons
    if (this.characters.length > 1) {
      const leftArrow = this.add
        .text(width / 2 - 180, y - 370, "<", {
          fontSize: "48px",
          color: "#fff",
          fontFamily: "Chewy",
        })
        .setOrigin(0.5)
        .setInteractive();
      leftArrow.on("pointerdown", () => {
        this.currentIndex =
          (this.currentIndex - 1 + this.characters.length) %
          this.characters.length;
        this.showCharacter();
      });
      const rightArrow = this.add
        .text(width / 2 + 180, y - 370, ">", {
          fontSize: "48px",
          color: "#fff",
          fontFamily: "Chewy",
        })
        .setOrigin(0.5)
        .setInteractive();
      rightArrow.on("pointerdown", () => {
        this.currentIndex = (this.currentIndex + 1) % this.characters.length;
        this.showCharacter();
      });
    }

    // Add Back button at top left
    const backBtn = this.add
      .text(40, 40, "← Back", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0, 0.5)
      .setInteractive();
    backBtn.on("pointerdown", () => this.scene.start("PlayerMenuScene"));
  }

  async deleteCharacter(id) {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:8000/api/character/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    // Refresh list
    await this.loadCharacters();
    // Adjust currentIndex if needed
    if (
      this.currentIndex >= this.characters.length &&
      this.characters.length > 0
    ) {
      this.currentIndex = this.characters.length - 1;
    }
    this.showCharacter();
  }

  clearScreen() {
    this.children.removeAll();
  }
}

export default LoadGameScene;
