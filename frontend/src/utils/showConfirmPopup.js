// showConfirmPopup.js
// A utility function for displaying interactive confirmation dialogs in any Phaser scene.
// The dialog includes a message and confirm/cancel buttons, with callbacks for user actions.

export function showConfirmPopup(
  scene,
  message,
  onConfirm,
  onCancel = () => {}
) {
  // Get the scene dimensions for centering elements
  const { width, height } = scene.scale;

  // Create a semi-transparent black overlay (0x000000) with 70% opacity (0.7)
  // This dims the background while the dialog is visible
  const overlay = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
    .setOrigin(0.5);

  // Create a dark gray dialog box (0x222222) with full opacity (1)
  // This serves as the background for the message and buttons
  const box = scene.add
    .rectangle(width / 2, height / 2, 400, 200, 0x222222, 1)
    .setOrigin(0.5);

  // Create the message text with consistent styling
  // - White color (#fff) for visibility
  // - Fredoka font for consistency with game UI
  // - Word wrap to handle long messages
  const msgText = scene.add
    .text(width / 2, height / 2 - 40, message, {
      fontSize: "26px",
      color: "#fff",
      fontFamily: "Fredoka",
      align: "center",
      wordWrap: { width: 360 },
    })
    .setOrigin(0.5);

  // Create the Confirm button
  // - Green color (#00ff00) for positive action
  // - Chewy font for consistency with game UI
  const confirmBtn = scene.add
    .text(width / 2 - 60, height / 2 + 40, "Confirm", {
      fontSize: "24px",
      color: "#00ff00",
      fontFamily: "Chewy",
      backgroundColor: "#222",
      padding: { x: 16, y: 8 },
    })
    .setOrigin(0.5)
    .setInteractive();

  // Create the Cancel button
  // - Red color (#ff5555) for negative action
  // - Chewy font for consistency with game UI
  const cancelBtn = scene.add
    .text(width / 2 + 60, height / 2 + 40, "Cancel", {
      fontSize: "24px",
      color: "#ff5555",
      fontFamily: "Chewy",
      backgroundColor: "#222",
      padding: { x: 16, y: 8 },
    })
    .setOrigin(0.5)
    .setInteractive();

  // Function to clean up all dialog elements
  const cleanup = () => {
    overlay.destroy();
    box.destroy();
    msgText.destroy();
    confirmBtn.destroy();
    cancelBtn.destroy();
  };

  // Set up button click handlers
  confirmBtn.on("pointerdown", () => {
    cleanup();
    onConfirm();
  });

  cancelBtn.on("pointerdown", () => {
    cleanup();
    onCancel();
  });
}
