import Phaser from "phaser";

class PauseMenu {
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

    this.saveBtn.on("pointerdown", () => {
      this.options.onSave();
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

  hide() {
    if (!this.isPaused) return;

    this.isPaused = false;
    this.destroy();
  }

  destroy() {
    if (this.overlay) this.overlay.destroy();
    if (this.box) this.box.destroy();
    if (this.pauseText) this.pauseText.destroy();
    if (this.saveBtn) this.saveBtn.destroy();
    if (this.backBtn) this.backBtn.destroy();
    this.scene.input.keyboard.off("keydown-P", this.hide, this);
  }

  showConfirmPopup() {
    const { width, height } = this.scene.scale;

    // Create overlay
    const overlay = this.scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setOrigin(0.5);

    // Create popup box
    const box = this.scene.add
      .rectangle(width / 2, height / 2, 400, 200, 0x222222, 1)
      .setOrigin(0.5);

    // Create message
    const msgText = this.scene.add
      .text(width / 2, height / 2 - 40, this.options.confirmMessage, {
        fontSize: "26px",
        color: "#fff",
        fontFamily: "Fredoka",
        align: "center",
        wordWrap: { width: 360 },
      })
      .setOrigin(0.5);

    // Create confirm button
    const confirmBtn = this.scene.add
      .text(width / 2 - 60, height / 2 + 40, "Confirm", {
        fontSize: "24px",
        color: "#00ff00",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive();

    // Create cancel button
    const cancelBtn = this.scene.add
      .text(width / 2 + 60, height / 2 + 40, "Cancel", {
        fontSize: "24px",
        color: "#ff5555",
        fontFamily: "Chewy",
        backgroundColor: "#222",
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive();

    confirmBtn.on("pointerdown", () => {
      overlay.destroy();
      box.destroy();
      msgText.destroy();
      confirmBtn.destroy();
      cancelBtn.destroy();
      this.hide();
      this.options.onBack();
    });

    cancelBtn.on("pointerdown", () => {
      overlay.destroy();
      box.destroy();
      msgText.destroy();
      confirmBtn.destroy();
      cancelBtn.destroy();
    });
  }
}

export default PauseMenu;
