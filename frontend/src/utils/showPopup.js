// showPopup.js
export function showPopup(scene, message) {
  const { width, height } = scene.scale;
  const overlay = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x000000, 0.5)
    .setOrigin(0.5);
  const box = scene.add
    .rectangle(width / 2, height / 2, 350, 120, 0x222222, 1)
    .setOrigin(0.5);
  const text = scene.add
    .text(width / 2, height / 2, message, {
      fontSize: "28px",
      color: "#00ff00",
      fontFamily: "Fredoka",
      align: "center",
      wordWrap: { width: 320 },
    })
    .setOrigin(0.5);
  scene.time.delayedCall(1500, () => {
    overlay.destroy();
    box.destroy();
    text.destroy();
  });
}
