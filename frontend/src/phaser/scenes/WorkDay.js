import Phaser from "phaser";
import StatsManager from "../utils/StatsManager";

class WorkDay extends Phaser.Scene {
  constructor() {
    super({
      key: "WorkDay",
    });
  }

  preload() {}

  create() {
    // Reset the workday count if starting fresh
    if (StatsManager.getWorkDayCount() === 0) {
      StatsManager.resetWorkDayCount();
    }

    if (StatsManager.getMP() === 0) {
      console.log("Mental Health is at 0. He died of stress related causes.");
      this.scene.stop("WorkDay");
      this.scene.start("BigTom");
      return;
    }

    // Fade-in transition
    this.cameras.main.setAlpha(0); // starts it out fully invisible
    this.time.delayedCall(1100, () => {
      this.cameras.main.setAlpha(1);
      this.cameras.main.fadeIn(1000);
    });

    // Define the game area dimensions
    const gameWidth = 800;
    const gameHeight = 600;

    // Calculate the top-left corner of the game area
    const offsetX = (this.scale.width - gameWidth) / 2;
    const offsetY = (this.scale.height - gameHeight) / 2;

    // Create the tilemap and position it in the center
    const map = this.make.tilemap({ key: "tilemap" });
    this.tileset = map.addTilesetImage("asset-export-final-resized", "tileset");
    this.textures.get("asset-export-final-resized").setFilter(Phaser.Textures.FilterMode.NEAREST);

    // Create layers and position them relative to the offsets
    this.floor = map.createLayer("Floor", this.tileset, offsetX, offsetY);
    this.floorDeco = map.createLayer("Floor Decorations", this.tileset, offsetX, offsetY);
    this.separators = map.createLayer("Cubicle Separators", this.tileset, offsetX, offsetY);
    this.deskRight = map.createLayer("Cubicle Desk Right", this.tileset, offsetX, offsetY);
    this.deskLeft = map.createLayer("Cubicle Desk Left", this.tileset, offsetX, offsetY);
    this.desktops = map.createLayer("Desktops", this.tileset, offsetX, offsetY);
    this.deskDeco = map.createLayer("Desktop Decorations", this.tileset, offsetX, offsetY);
    this.wall = map.createLayer("Wall", this.tileset, offsetX, offsetY);
    this.wallDeco = map.createLayer("Wall Decorations", this.tileset, offsetX, offsetY);
    this.tableDeco = map.createLayer("Table Decorations", this.tileset, offsetX, offsetY);

    // Add UI elements and position them relative to the offsets
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.createPlayer();

    this.interactHint = this.add.text(0, 0, 'E', {
      fontSize: '20px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 6, y: 2 },
    }).setOrigin(0.5).setVisible(false);
    

    // Ensures the player can't move beyond the game world
    this.player.setCollideWorldBounds(true);

    this.createCollisions(this.player, [
      this.floor,
      this.floorDeco,
      this.separators,
      this.deskRight,
      this.deskLeft,
      this.desktops,
      this.deskDeco,
      this.wall,
      this.wallDeco,
      this.tableDeco,
    ]);

    // Create interaction text
    this.interactionText = this.add.text(offsetX + gameWidth / 2, offsetY + gameHeight - 50, "Press E to work for the day", {
      fontSize: "16px",
      fill: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5);
    this.interactionText.setVisible(false);

    this.choiceText = this.add.text(offsetX + gameWidth / 2, offsetY + gameHeight / 2, "Q: Work for the day\nR: Goof off", {
      fontSize: "16px",
      fill: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5);
    this.choiceText.setVisible(false);

    // Define the interactable area
    this.interactableX = offsetX + 425;
    this.interactableY = offsetY + 200;
    this.interactableRadius = 40;

    this.interactableCircle = this.add.circle(
      this.interactableX,
      this.interactableY,
      this.interactableRadius,
      0xffff00,
      0.3
    );
  }

  update() {
    // Check if the workday loop is complete
    if (StatsManager.getWorkDayCount() >= 3) {
      console.log("Workday loop complete. Transitioning to EndOfDay.");
      this.scene.stop("WorkDay");
      this.scene.start("EndOfDay");
      return;
    }

    this.playerMovement();

    // Check if the player is within the interactable area
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.interactableX,
      this.interactableY
    );
    const isPlayerInArea = distance <= this.interactableRadius;

    // Show or hide the "Press E to work for the day" text
    if (isPlayerInArea && !this.choiceText.visible) {
      this.interactionText.setPosition(this.interactableX, this.interactableY - 50);
      this.interactionText.setVisible(true);
    } else {
      this.interactionText.setVisible(false);
    }

    // Handle interaction when the E key is pressed
    if (isPlayerInArea && Phaser.Input.Keyboard.JustDown(this.eKey)) {
      console.log("Interacted with the specific area!");
      this.choiceText.setPosition(this.interactableX, this.interactableY - 50);
      this.choiceText.setVisible(true);

      // Hide the "Press E to work for the day" text
      this.interactionText.setVisible(false);
    }

    // Handle the player's choice
    if (this.choiceText.visible) {
      if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
        StatsManager.incrementPP();
        StatsManager.decrementMP();
        console.log("Player chose to work for the day!");
        this.choiceText.setVisible(false);
        this.interactionText.setVisible(false);
        // Destroy the existing player before respawning
    if (this.player) {
      this.player.destroy(); // Remove the existing player sprite
    }

        // Respawn the player
        this.player.setPosition(800, 300);

        // Increment the workday count
        StatsManager.incrementWorkDayCount();
        this.createPlayer(); // Recreate the player to show the correct text
      } else if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
        console.log("Player chose to goof off!");
        StatsManager.incrementMP();
        StatsManager.decrementPP();
        this.choiceText.setVisible(false);

        // Increment the workday count
        StatsManager.incrementWorkDayCount();

        // Transition to Pong
        this.scene.stop("WorkDay");
        this.scene.start("Pong");
      }
    }
    if (this.currentInteraction && !this.interactionInProgress) {
      this.interactHint.setVisible(true);
      this.interactHint.setPosition(this.player.x, this.player.y - 40);
    } else {
      this.interactHint.setVisible(false);
    }
  }

  createCollisions(player, layers) {
    layers.forEach((layer) => {
      layer.setCollisionByProperty({ collision: true });
      this.physics.add.collider(player, layer);
    });
  }

  createPlayer() {
    this.player = this.physics.add.sprite(800, 300, "player", "frame-1").setScale(0.8);
    this.player.setSize(32, 32);

    if (!this.anims.exists("walk")){
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNames("player", { start: 8, end: 12, prefix: "frame-" }),
      frameRate: 5,
      repeat: -1,
    });}

    if (!this.anims.exists("back")){
    this.anims.create({
      key: "back",
      frames: this.anims.generateFrameNames("player", { start: 17, end: 19, prefix: "frame-" }),
      frameRate: 5,
      repeat: -1,
    });}

    if (!this.anims.exists("idle")){
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNames("player", { start: 1, end: 8, prefix: "frame-" }),
      frameRate: 5,
      repeat: -1,
    });}

    this.cameras.main.startFollow(this.player);

    // Display a short-timed text box over Tom's head based on workday count
    const workDayCount = StatsManager.getWorkDayCount();
    console.log("Current WorkDay Count in createPlayer:", workDayCount);

    let textToDisplay = "";
    switch (workDayCount) {
      case 0:
        textToDisplay = "Tom, you better get working! \nYour desk is collecting dust.";
        break;
      case 1:
        textToDisplay = "Ahhhhhhh \nmuch better.";
        break;
      case 2:
        textToDisplay = "Is that a cat over there?";
        break;
      case 3:
        textToDisplay = "We should come up with a name for the cat.";
        break;
      default:
        textToDisplay = ""; // No text for other counts
    }

    if (textToDisplay) {
      const spawnText = this.add.text(
        this.player.x, // Position the text at the player's X position
        this.player.y - 50, // Position the text slightly above the player's head
        textToDisplay, // The text to display
        {
          fontSize: "16px",
          fill: "#ffffff",
          backgroundColor: "#000000",
          padding: { x: 10, y: 5 },
        }
      ).setOrigin(0.5); // Center the text

      // Use a delayed call to hide or destroy the text after 2 seconds
      this.time.delayedCall(6000, () => {
        spawnText.destroy(); // Remove the text from the scene
      });
    }
  }

  playerMovement() {
    const velocity = 100;
    const cursor = this.input.keyboard.createCursorKeys();

    if (cursor.left.isDown) {
      this.player.setVelocityX(-velocity);
      this.player.anims.play("walk", true);
      this.player.flipX = true;
    } else if (cursor.right.isDown) {
      this.player.setVelocityX(velocity);
      this.player.anims.play("walk", true);
      this.player.flipX = false;
    } else {
      this.player.setVelocityX(0);
    }

    if (cursor.up.isDown) {
      this.player.setVelocityY(-velocity);
      this.player.anims.play("back", true);
    } else if (cursor.down.isDown) {
      this.player.setVelocityY(velocity);
      this.player.anims.play("walk", true);
    } else {
      this.player.setVelocityY(0);
    }

    if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
      this.player.anims.play("idle", true);
    }
  }
}

export default WorkDay;