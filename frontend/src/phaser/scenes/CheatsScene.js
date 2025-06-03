import Phaser from "phaser";

class CheatsScene extends Phaser.Scene {
  constructor() {
    super({ key: "CheatsScene" });
  }

  preload() {}

  create() {
    const { width, height } = this.scale;

    // Title text
    this.add
      .text(width / 2, height / 4, "Cheats Menu", {
        fontSize: "48px",
        color: "#ffffff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // List of scenes for the buttons
    const scenes = [
      { text: "Main Menu", scene: "MainMenuScene" },
      { text: "Work Day", scene: "WorkDay" },
      { text: "Pong", scene: "Pong" },
      { text: "Lost Pong", scene: "LostPong" },
      { text: "Won Pong", scene: "WonPong" },
      { text: "Max Pong", scene: "MaxPong" },
      { text: "End Of Day", scene: "EndOfDay" },
      { text: "EOD Stats", scene: "EODStats" },
      { text: "Home", scene: "Home" },
      { text: "Home Evening", scene: "HomeEvening" },
      { text: "Sleep Cutscene", scene: "SleepCutscene" },
      { text: "Opening Scene", scene: "OpeningScene" },
      { text: "Tutorial Scene", scene: "TutorialScene" },
      { text: "Victory Cutscene", scene: "VictoryCutscene" },
      { text: "Fired Cutscene", scene: "FiredCutscene" },
      { text: "Death Cutscene", scene: "DeathCutscene" },
      { text: "Glitchy Scene", scene: "GlitchyScene" },
    ];

    const buttonWidth = 250; // Width of each button
    const buttonHeight = 50; // Height of each button
    const buttonSpacingX = 20; // Horizontal spacing between buttons
    const buttonSpacingY = 20; // Vertical spacing between buttons
    const columns = 4; // Number of buttons per row
    const rows = Math.ceil(scenes.length / columns); // Calculate number of rows

    // Create buttons in a grid layout
    scenes.forEach((sceneData, index) => {
      const row = Math.floor(index / columns); // Calculate which row the button is in
      const column = index % columns; // Calculate which column the button is in

      // Calculate the button's X and Y position in the grid
      const baseX = width / 6;  // Moves buttons left (smaller = more left)
        const baseY = height / 3; // Moves buttons downward (larger = more down)

        const buttonX = baseX + column * (buttonWidth + buttonSpacingX);
        const buttonY = baseY + row * (buttonHeight + buttonSpacingY);

      // Create each button
      const button = this.add
        .text(buttonX, buttonY, sceneData.text, {
          fontSize: "24px",
          color: "#00ff00",
          fontFamily: "Chewy",
          backgroundColor: "#222",
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setInteractive();

      button.on("pointerover", () => {
        this.input.setDefaultCursor("pointer");
      });

      button.on("pointerout", () => {
        this.input.setDefaultCursor("default");
      });

      button.on("pointerdown", () => {
        console.log(`${sceneData.text} clicked`);
        this.scene.start(sceneData.scene); // Start the respective scene
      });
    });

    // Back to Main Menu button
    const backButton = this.add
      .text(width / 2, height - 50, "Back to Main Menu", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setInteractive();

    backButton.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
    });

    backButton.on("pointerout", () => {
      this.input.setDefaultCursor("default");
    });

    backButton.on("pointerdown", () => {
      console.log("Back to Main Menu clicked");
      this.scene.start("MainMenuScene"); // Go back to the Main Menu
    });
  }
}

export default CheatsScene;
