import Phaser from "phaser";
import StatsManager from "../utils/StatsManager";
import MusicManager from "./MusicManager";
import StatsOverlay from '../utils/StatsOverlay';


class WorkDay extends Phaser.Scene {
  constructor() {
    super({
      key: "WorkDay",
    });
  }

  preload() {
    this.load.image("avatarTall", "assets/avatar-tall.png");


  }

  create() {
    this.statsOverlay = new StatsOverlay(this);
    this.scene.get('MusicManager').stopMusic();
    if (!this.scene.isActive('MusicManager')) {
      this.scene.launch('MusicManager');
    }
    this.scene.get('MusicManager').playTrack('office');


    // Reset the workday count if starting fresh
    if (StatsManager.getWorkDayTaskNumber() === 0) {
      StatsManager.resetWorkDayTaskNumber();
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

    // Add the avatar image at a chosen position
    this.avatar = this.add.image(300, 400, "avatarTall").setScale(0.1).setDepth(1);


    // Add a text box for interaction (hidden by default)
    this.avatarText = this.add.text(this.avatar.x, this.avatar.y - 50, "Hey there. Long day?", {
      fontSize: "16px",
      fill: "#ffffff",
      backgroundColor: "#000000",
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setVisible(false);

    // Enable overlap check between player and avatar
    this.physics.add.overlap(this.player, this.avatar, () => {
      this.avatarText.setVisible(true);
    }, null, this);
  }

  update() {
    this.statsOverlay.update();
    // Check if the workday loop is complete
    if (StatsManager.getWorkDayTaskNumber() >= 3) {
       StatsManager.incrementWorkDayCount();

      // Check if limit is reached
      if (StatsManager.getWorkDayCount() >= StatsManager.getWorkDayLimit()) {
        StatsManager.setWorkDayLimitReached(true);
      }
      
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
        let effectiveness = 1;
        if (StatsManager.getEnergyLevel() >= 3) effectiveness += 0.5;
        if (StatsManager.getFocusLevel() >= 3) effectiveness += 0.5;
        if (StatsManager.getMotivationLevel() >= 3) effectiveness += 0.5;
        if (StatsManager.getMP() <= 0) effectiveness -= 1;

        effectiveness = Math.max(0, effectiveness); // Cap at minimum 0

        const projectGain = Math.floor(effectiveness);
        for (let i = 0; i < projectGain; i++) {
          StatsManager.incrementPP();
        }
        // Burnout penalty for working
        StatsManager.decrementEnergyLevel();
        StatsManager.decrementMotivationLevel();
        StatsManager.decrementFocusLevel();
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
        StatsManager.incrementWorkDayTaskNumber();
        this.createPlayer(); // Recreate the player to show the correct text
      } else if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
          console.log("Player chose to goof off!");
          StatsManager.incrementMP();
          StatsManager.incrementMotivationLevel();
          StatsManager.incrementEnergyLevel();
          StatsManager.decrementFocusLevel();
          this.choiceText.setVisible(false);

        // Increment the workday count
        StatsManager.incrementWorkDayTaskNumber();

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

    const nearAvatar = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.avatar.x, this.avatar.y
    ) < 50;

    const wasVisible = this.avatarText.visible;
    if (nearAvatar && !wasVisible) {
      this.avatarText.setVisible(true);
    } else if (!nearAvatar && wasVisible) {
      this.avatarText.setVisible(false);
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

    //this.cameras.main.startFollow(this.player);

    // Display a short-timed text box over Tom's head based on workday count
    const workDayTaskNumber = StatsManager.getWorkDayTaskNumber();
    console.log("Current WorkDay Count in createPlayer:", workDayTaskNumber);

    let textToDisplay = "";
    switch (workDayTaskNumber) {
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
    this.cursor = this.input.keyboard.createCursorKeys();
    const velocity = 100;

    let isMoving = false;

    if (this.cursor.left.isDown) {
      this.player.setVelocityX(-velocity);
      this.player.flipX = true;
      isMoving = true;
    } else if (this.cursor.right.isDown) {
      this.player.setVelocityX(velocity);
      this.player.flipX = false;
      isMoving = true;
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursor.up.isDown) {
      this.player.setVelocityY(-velocity);
      isMoving = true;
    } else if (this.cursor.down.isDown) {
      this.player.setVelocityY(velocity);
      isMoving = true;
    } else {
      this.player.setVelocityY(0);
    }

    if (isMoving) {
      if (this.cursor.up.isDown) {
        if (this.player.anims.currentAnim?.key !== "back") {
          this.player.anims.play("back", true);
        }
      } else {
        if (this.player.anims.currentAnim?.key !== "walk") {
          this.player.anims.play("walk", true);
        }
      }
    } else {
      if (this.player.anims.currentAnim?.key !== "idle") {
        this.player.anims.play("idle", true);
      }
    }
  }
}
export default WorkDay;