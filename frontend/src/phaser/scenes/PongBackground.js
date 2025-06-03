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

    // Draw the top border line
    graphics.strokeLineShape(
      new Phaser.Geom.Line(
        offsetX - 100, // Start X
        offsetY + borderThickness / 2, // Start Y
        offsetX + gameWidth + 100, // End X
        offsetY + borderThickness / 2 // End Y
      )
    );

    // Draw the bottom border line
    graphics.strokeLineShape(
      new Phaser.Geom.Line(
        offsetX - 100, // Start X
        offsetY + gameHeight - borderThickness / 2, // Start Y
        offsetX + gameWidth + 100, // End X
        offsetY + gameHeight - borderThickness / 2 // End Y
      )
    );

   // Add the white middle line
   this.add.line(
    offsetX + gameWidth / 2, // Center the line horizontally
    offsetY +300, // Start at the top of the game area
    0, // Line start offset (relative to the center)
    0, // Line start offset (relative to the center)
    0, // Line end offset (relative to the center)
    gameHeight, // Line end offset (relative to the center)
    Colors.white // Line color
  );

    // Add the center circle
    this.add.circle(
      offsetX + gameWidth / 2, // Center horizontally
      offsetY + gameHeight / 2, // Center vertically
      50, // Radius
      Colors.white // Circle color
    );
    const firstToThreeText = this.add.text(
      gameWidth / 2 + 287, // Center horizontally
      770, // Position near the top
      "First to 3 Wins", // Text content
      {
          fontSize: "32px", // Font size
          fontFamily: "Arial", // Font family
          fontStyle: "bold", // Bold text
          color: "#00ff00", // Green color
          align: "center", // Center alignment
      }
  ); firstToThreeText.setOrigin(0.5); // Center the text horizontally
  }
}