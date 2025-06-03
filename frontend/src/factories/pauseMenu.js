// A factory class for creating and managing the pause menu UI component.

import { showConfirmPopup } from "../utils/showConfirmPopup";

class PauseMenu {
  // Creates a new PauseMenu instance.
  constructor(scene, options = {}) {
    this.scene = scene;
    this.isPaused = false;
    this.options = {
      onSave: () => {},
      onBack: () => {},
      confirmMessage:
        "Are you sure you want to return to the main menu? Unsaved progress will be lost.",
      ...options,
    };
  }

  //Shows the pause menu if it's not already visible.
  //Creates all UI elements and sets up event listeners.
  show() {
    if (this.isPaused) return;

    this.isPaused = true;
    const { width, height } = this.scene.scale;

    // Create overlay
    this.overlay = this.scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setOrigin(0.5);

    // Create pause box
    this.box = this.scene.add
      .rectangle(width / 2, height / 2, 400, 250, 0x222222, 1)
      .setOrigin(0.5);

    // Create pause text
    this.pauseText = this.scene.add
      .text(width / 2, height / 2 - 60, "Paused", {
        fontSize: "40px",
        color: "#fff",
        fontFamily: "Fredoka",
      })
      .setOrigin(0.5);

    // Create save button
    this.saveBtn = this.scene.add
      .text(width / 2, height / 2, "Save Game", {
        fontSize: "28px",
        color: "#00ff00",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.saveBtn.on("pointerdown", async () => {
      // Disable the save button to prevent multiple clicks
      this.saveBtn.setStyle({ color: "#666666" });
      this.saveBtn.setText("Saving...");
      this.saveBtn.disableInteractive();

      // Call the save function
      await this.options.onSave();

      // Hide the menu after save completes
      this.hide();
    });

    // Create back button
    this.backBtn = this.scene.add
      .text(width / 2, height / 2 + 60, "Back to Main Menu", {
        fontSize: "24px",
        color: "#ff5555",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.backBtn.on("pointerdown", () => {
      this.showConfirmPopup();
    });

    // Add keyboard listener for P key
    this.scene.input.keyboard.on("keydown-P", this.hide, this);
  }

  //Hides the pause menu if it's visible.
  //Calls destroy to clean up all UI elements.
  hide() {
    if (!this.isPaused) return;

    this.isPaused = false;
    this.destroy();
  }

  //Destroys all UI elements and removes event listeners.
  destroy() {
    if (this.overlay) this.overlay.destroy();
    if (this.box) this.box.destroy();
    if (this.pauseText) this.pauseText.destroy();
    if (this.saveBtn) this.saveBtn.destroy();
    if (this.backBtn) this.backBtn.destroy();
    this.scene.input.keyboard.off("keydown-P", this.hide, this);
  }

  //Shows a confirmation dialog before returning to the main menu.
  showConfirmPopup() {
    showConfirmPopup(this.scene, this.options.confirmMessage, () => {
      this.hide();
      this.options.onBack();
    });
  }
}

export default PauseMenu;
