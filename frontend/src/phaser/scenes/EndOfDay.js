import Phaser from "phaser";
import WebFont from "webfontloader";
import EODStats from "./EODStats";
import StatsManager from "../utils/StatsManager";


class EndOfDay extends Phaser.Scene {
  
  constructor() {
    super({
      key: "EndOfDay",
    });
  }

  preload() {}

  create() {
    /* A transition occurs here. A delay is added
    to force the scene to wait until the last scene is finished
    fading out */
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

    // Setting the e key up for button presses
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.layerArr = [
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
    ];

    this.physics.world.setBounds(10, 98, map.widthInPixels, map.heightInPixels);

    this.createPlayer();

    // Ensures the player cant move beyond the game world
    this.player.setCollideWorldBounds(true);

    // World Boundaries
    this.physics.world.setBounds(offsetX, offsetY, map.widthInPixels, map.heightInPixels);

    // Camera Boundaries
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // this.cameras.main.setZoom(1.5);

    this.cameras.main.roundPixels = true;

    this.createCollisions(this.player, this.layerArr, offsetX, offsetY);

    this.isPlayerNearArea = false;

      // Create the "Press E to work for the day" text but make it invisible initially
    this.interactionText = this.add.text(offsetX + gameWidth / 2, offsetY + gameHeight - 50, "Press E to go home for the day", {
      fontFamily: "Fredoka",
      fontSize: "18px",
      color: "#1c0d00",              // warm black text
      backgroundColor: "#ffffff",    // white background
      padding: { x: 14, y: 8 },       // generous spacing
      align: "center",
      wordWrap: { width: 300 },
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: "#999999",             // dark gray glow
        blur: 0,
        stroke: false,
        fill: true,
      },
    }).setOrigin(0.5); // Center the text
    this.interactionText.setVisible(false); // Hide it initially


    // Define the interactable area (in pixels)
    this.interactableX = offsetX + 255; // X-coordinate of the interactable area (increase to move right)
    this.interactableY = offsetY + 75; // Y-coordinate of the interactable area (decrease to move up)
    this.interactableRadius = 75; // Radius of the interactable area

    // Draw the yellow circle (only once during the `create` method)
    this.interactableCircle = this.add.circle(
      this.interactableX,
      this.interactableY,
      this.interactableRadius,
      0xffff00, // Yellow color
      0.3 // Opacity (30%)
    );

    //keys for interaction
    this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }

  update() {
    this.playerMovement();
    const gameWidth = 800;
    const gameHeight = 600;
    const offsetX = (this.scale.width - gameWidth) / 2;
    const offsetY = (this.scale.height - gameHeight) / 2;

  
    // Check if the player is within the interactable area
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.interactableX,
      this.interactableY
    );
    const isPlayerInArea = distance <= this.interactableRadius;

    // Show or hide the "Press E to work for the day" text
    if (this.interactionText) { // Ensure interactionText exists
        if (isPlayerInArea) {
            this.interactionText.setPosition(this.interactableX, this.interactableY - 50); // Position the text above the circle
            this.interactionText.setVisible(true); // Show the text
        } else {
            this.interactionText.setVisible(false);}
         } // Hide the text

    // Handle interaction when the E key is pressed
    if (isPlayerInArea && Phaser.Input.Keyboard.JustDown(this.eKey)) {
      
        this.scene.stop("EndOfDay");
        this.scene.start("EODStats");
      
    }
  }

  createCollisions(player, layers, offsetX, offsetY) {
    layers.forEach((layer) => {
      layer.setCollisionByProperty({
        collision: true,
      });

      this.physics.add.collider(player, layer, null, null, this);
    });
  }

  recognizeTileInteractable(layer) {
    this.isPlayerNearInteractable = false; // Reset the flag
  
    const tileWidth = layer.tileset[0].tileWidth;
    const tileHeight = layer.tileset[0].tileHeight;
  
    // Get the tile the player is currently on
    const playerTileX = Math.floor(this.player.x / tileWidth);
    const playerTileY = Math.floor(this.player.y / tileHeight);
  
    // Define the radius (number of tiles around the player to check)
    const radius = 100; // Adjust this value to make the interactable area larger
  
    // Loop through tiles within the radius
    for (let offsetX = -radius; offsetX <= radius; offsetX++) {
      for (let offsetY = -radius; offsetY <= radius; offsetY++) {
        const tileX = playerTileX + offsetX;
        const tileY = playerTileY + offsetY;
        const tile = layer.getTileAt(tileX, tileY);
  
        // Check if the tile has the "interactable" property
        if (tile && tile.properties.interactable) {
          console.log("Player is near an interactable desktop!");
          this.isPlayerNearInteractable = true; // Set the flag
          return; // Exit the loop early if an interactable tile is found
        }
      }
    }
  }

  createPlayer() {
    // Creates the player sprite
    this.player = this.physics.add
    .sprite(800, 300, "player", "frame-1") // Centered in the game area
    .setScale(0.8);

    this.player.setSize(32, 32);

    // Sets collision detection for the world boundary

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNames("player", {
        start: 8,
        end: 12,
        prefix: "frame-",
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "back",
      frames: this.anims.generateFrameNames("player", {
        start: 17,
        end: 19,
        prefix: "frame-",
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNames("player", {
        start: 1,
        end: 8,
        prefix: "frame-",
      }),
      frameRate: 5,
      repeat: -1,
    });

    this.cameras.main.startFollow(this.player);
  }

  playerMovement() {
    // Creates the cursor for player input
    this.cursor = this.input.keyboard.createCursorKeys();

    // Adjusted velocity values for slower movement
    const velocity = 100; // Reduced from 160 to 100

    // Horizontal movement
    if (this.cursor.left.isDown) {
      this.player.setVelocityX(-velocity);
      this.player.anims.play("walk", true);
      this.player.flipX = true; // Flip sprite for left movement
    } else if (this.cursor.right.isDown) {
      this.player.setVelocityX(velocity);
      this.player.anims.play("walk", true);
      this.player.flipX = false; // Ensure sprite is not flipped
    } else {
      this.player.setVelocityX(0); // Stop horizontal movement
    }

    // Vertical movement
    if (this.cursor.up.isDown) {
      this.player.setVelocityY(-velocity);
      this.player.anims.play("back", true); // Play "back" animation for upward movement
    } else if (this.cursor.down.isDown) {
      this.player.setVelocityY(velocity);
      this.player.anims.play("walk", true); // Play "walk" animation for downward movement
    } else {
      this.player.setVelocityY(0); // Stop vertical movement
    }

    // Idle animation
    if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
      this.player.anims.play("idle", true);
    }
  }
}

export default EndOfDay;