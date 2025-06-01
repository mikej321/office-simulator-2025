// showPopup.js
// A utility function for displaying temporary notification messages in any Phaser scene that is automatically cleaned up after 1.5 seconds.  The popup consists of a semi-transparent overlay, a message box, and text.

export function showPopup(scene, message) {
  // Get the scene dimensions for centering elements
  const { width, height } = scene.scale;

  // Create a semi-transparent black overlay (0x000000) with 50% opacity (0.5)
  // This dims the background while the popup is visible
  const overlay = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x000000, 0.5)
    .setOrigin(0.5);

  // Create a dark gray message box (0x222222) with full opacity (1)
  // This serves as the background for the message text
  const box = scene.add
    .rectangle(width / 2, height / 2, 350, 120, 0x222222, 1)
    .setOrigin(0.5);

  // Create the message text with consistent styling
  // - Green color (#00ff00) for visibility
  // - Fredoka font for consistency with game UI
  // - Word wrap to handle long messages
  const text = scene.add
    .text(width / 2, height / 2, message, {
      fontSize: "28px",
      color: "#00ff00",
      fontFamily: "Fredoka",
      align: "center",
      wordWrap: { width: 320 },
    })
    .setOrigin(0.5);

  // Automatically clean up all elements after 1.5 seconds
  // This ensures the popup doesn't persist and memory is properly managed
  scene.time.delayedCall(1500, () => {
    overlay.destroy();
    box.destroy();
    text.destroy();
  });
}
