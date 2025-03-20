import Phaser from 'phaser';
import * as Colors from '../consts/Colors';

export default class PongBackground extends Phaser.Scene {
  constructor() {
    super({
      key: "PongBackground",
    });
  }

  create() {
    // Set the border color and thickness
    const borderThickness = 10; // Thickness of the border
    const borderColor = 0x00ff00; // Bright green color

    // Create a Graphics object
    const graphics = this.add.graphics();

    // Set the line style for the border
    graphics.lineStyle(borderThickness, borderColor);

    // Define the border dimensions
    const gameWidth = 800; // Width of the game area
    const gameHeight = 600; // Height of the game area

    // Calculate the position to center the border
    const offsetX = (this.scale.width - gameWidth) / 2; // Center horizontally
    const offsetY = (this.scale.height - gameHeight) / 2; // Center vertically

    // Draw the border
    graphics.strokeRect(
      offsetX + borderThickness / 2, // Adjust for border thickness
      offsetY + borderThickness / 2, // Adjust for border thickness
      gameWidth - borderThickness, // Adjust width for border thickness
      gameHeight - borderThickness // Adjust height for border thickness
    );

    // Add the white middle line
    this.add.line(
      offsetX + gameWidth / 2, // Center the line horizontally
      offsetY + borderThickness / 2, // Start at the top of the border
      offsetX + gameWidth / 2, // End at the bottom of the border
      offsetY + gameHeight - borderThickness / 2, // End point
      Colors.white, // Line color
      1 // Line alpha
    );

    // Add the center circle
    this.add.circle(
      offsetX + gameWidth / 2, // Center horizontally
      offsetY + gameHeight / 2, // Center vertically
      50, // Radius
      Colors.white // Circle color
    );
  }
}