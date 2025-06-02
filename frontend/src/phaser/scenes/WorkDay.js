import Phaser from "phaser";
import StatsManager from "../utils/StatsManager";
import SpeechBubble from "../../factories/speechBubble";
import PauseMenu from "../../factories/pauseMenu";
import { saveProgress } from "../../utils/saveGame";
import { showPopup } from "../../utils/showPopup";
import { getCharacterSaveData } from "../../utils/gameState";

class WorkDay extends Phaser.Scene {
  constructor() {
    super({
      key: "WorkDay",
    });
  }

  preload() {
    // Tilemap and tileset
    this.load.tilemapTiledJSON(
      "tilemap",
      "/office-simulator-2025/assets/newer-test-office-resized.tmj"
    );
    this.load.image(
      "tileset",
      "/office-simulator-2025/assets/asset-export-final-resized.png"
    );
    this.load.atlas(
      "printer",
      "/office-simulator-2025/assets/attachments/printer_resized.png",
      "/office-simulator-2025/assets/attachments/printer_resized.json"
    );
    this.load.atlas(
      "blue-chair",
      "/office-simulator-2025/assets/attachments/blue_chair_resized.png",
      "/office-simulator-2025/assets/attachments/blue_chair_resized.json"
    );
    this.load.atlas(
      "orange-chair",
      "/office-simulator-2025/assets/attachments/orange_chair_resized.png",
      "/office-simulator-2025/assets/attachments/orange_chair_resized.json"
    );
    this.load.atlas(
      "green-chair",
      "/office-simulator-2025/assets/attachments/green_chair_resized.png",
      "/office-simulator-2025/assets/attachments/green_chair_resized.json"
    );
    this.load.atlas(
      "red-chair",
      "/office-simulator-2025/assets/attachments/red_chair_resized.png",
      "/office-simulator-2025/assets/attachments/red_chair_resized.json"
    );
    this.load.atlas(
      "desktop_pc",
      "/office-simulator-2025/assets/attachments/Desktop_PC.png",
      "/office-simulator-2025/assets/attachments/Desktop_PC.json"
    );
    this.load.atlas(
      "door",
      "/office-simulator-2025/assets/attachments/Door_resized.png",
      "/office-simulator-2025/assets/attachments/Door_resized.json"
    );
    this.load.atlas(
      "vending-machine",
      "/office-simulator-2025/assets/attachments/vending_machine_resized.png",
      "/office-simulator-2025/assets/attachments/vending_machine_resized.json"
    );
    this.load.atlas(
      "player",
      "/office-simulator-2025/assets/player-sprite.png",
      "/office-simulator-2025/assets/player-sprite.json"
    );
  }

  create() {
    const playerName = localStorage.getItem("playerName");
    const playerStats = localStorage.getItem("playerStats");
    if (playerName === "Cheat3r") {
      console.log(
        `TestScene accessed through Cheat3r - following stats were loaded (basic):`,
        playerStats
      );
    }

    this.map = this.make.tilemap({
      key: "tilemap",
    });

    this.tileset = this.map.addTilesetImage(
      "asset-export-final-resized",
      "tileset"
    );
    this.textures
      .get("asset-export-final-resized")
      .setFilter(Phaser.Textures.FilterMode.NEAREST);
    // This is the code that fixes the issue

    if (StatsManager.getWorkDayCount() === 0) {
      StatsManager.resetWorkDayCount();
    }

    if (StatsManager.getMP() === 0) {
      console.log("Mental Health is at 0. He died of stress related causes.");
      this.scene.stop("WorkDay");
      this.scene.start("BigTom");
      return;
    }

    const gameWidth = 800;
    const gameHeight = 600;

    const offsetX = (this.scale.width - gameWidth) / 2
    const offsetY = (this.scale.height - gameHeight) / 2;

    this.awaitingChoice = false;

    this.floor = this.map.createLayer("Floor", this.tileset, 0, 0);
    this.floorDeco = this.map.createLayer(
      "Floor Decorations",
      this.tileset,
      0,
      0
    );

    this.separators = this.map.createLayer(
      "Cubicle Separators",
      this.tileset,
      0,
      0
    );
    this.deskRight = this.map.createLayer(
      "Cubicle Desk Right",
      this.tileset,
      0,
      0
    );

    this.deskLeft = this.map.createLayer(
      "Cubicle Desk Left",
      this.tileset,
      0,
      0
    );
    this.desktops = this.map.createLayer("Desktops", this.tileset, 0, 0);
    this.deskDeco = this.map.createLayer(
      "Desktop Decorations",
      this.tileset,
      0,
      0
    );
    this.wall = this.map.createLayer("Wall", this.tileset, 0, 0);
    this.wallDeco = this.map.createLayer(
      "Wall Decorations",
      this.tileset,
      0,
      0
    );
    this.tableDeco = this.map.createLayer(
      "Table Decorations",
      this.tileset,
      0,
      0
    );

    this.interactables = this.physics.add.staticGroup();
    this.sensors = this.physics.add.staticGroup();
    this.printerGroup = this.add.group();

    [
      "Blue Chair",
      "Red Chair",
      "Green Chair",
      "Orange Chair",
      "Vending Machine",
      "Door",
      "Printer",
      "Door Sensor",
      "Vending Sensor",
      "Printer Sensor",
      "Computer Sensor"
    ].forEach((layerName) => {
      this.map.getObjectLayer(layerName).objects.forEach((obj) => {
        const isTileObject = obj.gid !== undefined;
        const objects = this.map.getObjectLayer(layerName).objects;
        const frame = obj.properties.find((p) => p.name === "frame")?.value;
        const flipX = !!obj.properties.find((p) => p.name === "flipX")?.value;
        const centerX = obj.x + obj.width / 2;
        const centerY = isTileObject
          ? obj.y - obj.height / 2
          : obj.y + obj.height / 2;

        if (layerName === "Printer") {
          objects.forEach((obj, idx) => {
            const sprite = this.interactables
              .create(
                obj.x + obj.width / 2,
                obj.y - obj.height / 2,
                "printer",
                obj.properties.find((p) => p.name === "frame").value
              )
              .setOrigin(0.5);

            this.objectNudge(sprite, -6, 37);

            sprite.body.setSize(obj.width, obj.height);
            sprite.body.setOffset(
              (sprite.width - obj.width) / 2,
              (sprite.height - obj.height) / 2
            );

            this.printerGroup.add(sprite);

            const zoneObj =
              this.map.getObjectLayer("Printer Sensor").objects[idx];
            const zone = this.add
              .zone(
                zoneObj.x + zoneObj.width / 2,
                zoneObj.y + zoneObj.height / 2,
                zoneObj.width,
                zoneObj.height
              )
              .setOrigin(0.5);
            this.physics.add.existing(zone, true);
            zone.name = "Printer Sensor";
            zone.linkedSprite = sprite;
            this.sensors.add(zone);
          });

          return;
        }
        if (layerName.includes("Sensor")) {
          const zone = this.add
            .zone(centerX, centerY, obj.width, obj.height)
            .setOrigin(0.5);

          zone.sensorType = obj.name;
          this.physics.add.existing(zone, true);
          zone.body.debugShowBody = true;
          zone.name = obj.name;
          this.sensors.add(zone);

          return;
        }

        const sprite = this.interactables
          .create(
            centerX,
            centerY,
            layerName.toLowerCase().replace(" ", "-"),
            frame
          )
          .setOrigin(0.5)
          .setFlipX(flipX);

        /* All of the position nudges are placed by using a custom function 'objectNudge'.
        The objectNudge takes 4 parameters
        
        obj: In this case, it'd be the created sprite above
        propertyName (optional): This is an optional parameter for doing conditionals based on if
        the property exists
        x: How far you want to nudge it on the x axis
        y: How far you want to nudge it on the y axis
 
        */
        switch (layerName) {
          case "Red Chair":
            this.objectNudge(sprite, 9, 2, flipX);
            break;
          case "Blue Chair":
            this.objectNudge(sprite, 9, 3, flipX);
            break;
          case "Orange Chair":
            this.objectNudge(sprite, 9, 2, flipX);
            break;
          case "Green Chair":
            this.objectNudge(sprite, 9, -2, flipX);
            break;
          case "Door":
            this.objectNudge(sprite, 0, 18);
            break;
          default:
            break;
        }

        //

        // if (layerName === "Door") {
        //   sprite.y += 18;
        // }

        /* This is the code that's responsible for shrinking the sprite's canvas body
        down to the proper size. Without it, it would create invisible walls that prevent
        the player from walking */
        sprite.body.setSize(obj.width, obj.height);
        sprite.body.setOffset(
          (sprite.width - obj.width) / 2,
          (sprite.height - obj.height) / 2
        );

        this.physics.add.existing(sprite, true);

        // this.debugBox(sprite);

        this.interactables.add(sprite);
      });
    });

    this.createPlayer();

    this.physics.add.collider(this.player, this.interactables);

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

    this.physics.world.setBounds(
      10,
      98,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    // Ensures the player cant move beyond the game world
    this.player.setCollideWorldBounds(true);

    // World Boundaries
    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels - 7
    );

    // Camera Boundaries
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    // this.cameras.main.setZoom(1.5);

    this.cameras.main.roundPixels = true;

    this.createCollisions(this.player, this.layerArr);

    // Object Sprite Definitions for later usage
    this.doorSprite = this.interactables
      .getChildren()
      .find((child) => child.texture.key === "door");

    this.printerSprite = this.interactables
      .getChildren()
      .find((child) => child.texture.key === "printer");
    // Object Animations

    this.anims.create({
      key: "exit",
      frames: this.anims.generateFrameNames("door", {
        prefix: "door-",
        start: 1,
        end: 8,
      }),
      frameRate: 24,
      repeat: 0,
    });

    this.anims.create({
      key: "print",
      frames: this.anims.generateFrameNames("printer", {
        prefix: "printer-",
        start: 1,
        end: 8,
      }),
      frameRate: 8,
      repeat: 0,
    });

    this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // flags for sensors
    this.currentSensor = null;
    this.bubble = null;

    this.physics.add.overlap(
      this.player,
      this.sensors,
      (player, zone) => {
        // console.log("entered sensor named", zone.name);

        // If in a zone, do nothing
        if (this.bubble) return;
        if (this.currentSensor === zone) return;

        let msg;

        switch (zone.name) {
          case "Door Sensor":
            msg = `Press 'E' to leave work`;
            break;
          case "Vending Sensor":
            msg = `Press 'E' to grab a drink`;
            break;
          case "Printer Sensor":
            msg = `Press 'E' to print something`;
            break;
          case "Computer Sensor":
            msg = `Press "E" to work for the day\n\nPress "Q" to goof off`;
            break;
          default:
            break;
        }

        this.bubble = new SpeechBubble(
          this,
          this.player.x,
          this.player.y - this.player.height / 2 - 10,
          msg,
          {},
          250
        );

        this.bubble.show();
        this.currentSensor = zone;
      },
      null,
      this
    );

    this.physics.add.collider(
      this.player,
      this.sensors,
      null,
      (player, zone) => {
        if (
          this.currentSensor === zone &&
          !this.physics.world.overlap(this.player, zone)
        ) {
          console.log("exited sensor named", zone.name);
          this.currentSensor = null;
        }
        return false;
      },
      this
    );

    // Clock setup

    this.clockText = this.add
      .text(235, 32, "", {
        fontFamily: "Orbitron",
        fontSize: "12px",
        color: "#00ff00",
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.gameTime = new Date();
    this.gameTime.setHours(9, 0, 0, 0);

    // 1 sec = 1 game minute
    const timeScale = 120;

    this.updateClock();
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.gameTime.setSeconds(this.gameTime.getSeconds() + timeScale);
        this.updateClock();
      },
      callbackScope: this,
      loop: true,
    });

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

    // Reset the workday count if starting fresh

    // // Fade-in transition
    // this.cameras.main.setAlpha(0); // starts it out fully invisible
    // this.time.delayedCall(1100, () => {
    //   this.cameras.main.setAlpha(1);
    //   this.cameras.main.fadeIn(1000);
    // });

    // // Define the game area dimensions
    // const gameWidth = 800;
    // const gameHeight = 600;

    // // Calculate the top-left corner of the game area
    // const offsetX = (this.scale.width - gameWidth) / 2;
    // const offsetY = (this.scale.height - gameHeight) / 2;

    // // Add UI elements and position them relative to the offsets
    // this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    

    // this.createPlayer();

    // this.layerArr = [
    //   this.floor,
    //   this.floorDeco,
    //   this.separators,
    //   this.deskRight,
    //   this.deskLeft,
    //   this.desktops,
    //   this.deskDeco,
    //   this.wall,
    //   this.wallDeco,
    //   this.tableDeco,
    // ];

    // this.physics.world.setBounds(
    //   10,
    //   98,
    //   this.map.widthInPixels,
    //   this.map.heightInPixels
    // );

    // this.interactHint = this.add.text(0, 0, 'E', {
    //   fontSize: '20px',
    //   fill: '#fff',
    //   backgroundColor: '#000',
    //   padding: { x: 6, y: 2 },
    // }).setOrigin(0.5).setVisible(false);

    //     // this.cameras.main.setZoom(1.5);

    //     this.cameras.main.roundPixels = true;



    // Define the interactable area
    // this.interactableX = offsetX + 425;
    // this.interactableY = offsetY + 200;
    // this.interactableRadius = 40;

    // this.interactableCircle = this.add.circle(
    //   this.interactableX,
    //   this.interactableY,
    //   this.interactableRadius,
    //   0xffff00,
    //   0.3
    // );
  }

  update() {
    // Check if the workday loop is complete
    if (StatsManager.getWorkDayCount() >= 3 && this.currentSensor && Phaser.Input.Keyboard.JustDown(this.eKey)) {
      console.log("Workday loop complete. Transitioning to EndOfDay.");
      this.scene.transition({
        target: "EndOfDay",
        duration: 500,
        moveAbove: true
      })
      return;
    }

    this.playerMovement();

    const sensor = this.currentSensor;

    if (this.awaitingChoice) {
      if (this.currentSensor && Phaser.Input.Keyboard.JustDown(this.eKey)) {
        if (this.bubble) this.bubble.destroy();
        
        this.scene.transition({
          target: "Pong",
          duration: 500,
          moveAbove: true
        })
      }


      if (this.currentSensor && Phaser.Input.Keyboard.JustDown(this.qKey)) {
        if (this.bubble) this.bubble.destroy();

        this.scene.transition({
          target: "GlitchyScene",
          duration: 500,
          moveAbove: true
        })
      }


    }

    if (
      this.currentSensor &&
      this.currentSensor.name === "Door Sensor" &&
      Phaser.Input.Keyboard.JustDown(this.eKey)
    ) {
      if (this.doorSprite) {
        this.doorSprite.play("exit");
        this.time.delayedCall(1000, () => {
          this.scene.transition({
            target: "Home",
            duration: 1000,
            moveAbove: true,
            onUpdate: (progress) => {
              this.cameras.main.setAlpha(2 - progress);
            }
          })
        })
      }

      if (this.bubble) {
        this.bubble.hide();
        this.bubble.destroy();
        this.bubble = null;
      }

      sensor.body.enable = false;
      sensor.setVisible(false);

      this.currentSensor = null;

      this.time.delayedCall(3000, () => {
        this.doorSprite.anims.playReverse("exit");

        sensor.body.enable = true;
        sensor.setVisible(true);
      });

      return;
    } else if (
      this.currentSensor &&
      this.currentSensor.name === "Printer Sensor" &&
      Phaser.Input.Keyboard.JustDown(this.eKey)
    ) {
      if (sensor.linkedSprite) {
        sensor.linkedSprite.play("print");
      }

      if (this.bubble) {
        this.bubble.hide();
        this.bubble.destroy();
        this.bubble = null;
      }

      sensor.body.enable = false;
      sensor.setVisible(false);

      this.currentSensor = null;

      this.time.delayedCall(3000, () => {
        sensor.body.enable = true;
        sensor.setVisible(true);
      });

      return;
    } else if (
      this.currentSensor && Phaser.Input.Keyboard.JustDown(this.eKey)
    ) {
      StatsManager.incrementPP();
      StatsManager.decrementMP();
      console.log("Player chose to work for the day");

      StatsManager.incrementWorkDayCount();
      
      this.scene.transition({
        target: "Home",
        duration: 500,
        moveAbove: true,
        onUpdate: (progress) => {
          this.cameras.main.setAlpha(1 - progress);
        }
      })
    } else if (
      this.currentSensor && Phaser.Input.Keyboard.JustDown(this.qKey)
    ) {

      if (this.bubble) {
        this.bubble.destroy();
      }
      
      this.bubble = new SpeechBubble(
          this,
          this.player.x,
          this.player.y - this.player.height / 2 - 10,
          'Press "E" to slack off with pong\nPress "Q" to enter Nightmare world' ,
          {},
          250
        );

        this.bubble.show();

        this.awaitingChoice = true;
        return;
    }

    if (sensor && this.bubble) {
      this.bubble.setPosition(
        this.player.x,
        this.player.y - this.player.height / 2 - 10
      );

      if (!this.physics.world.overlap(this.player, sensor)) {
        console.log("Exited sensor named", sensor.name);
        this.bubble.hide();
        this.bubble = null;
        this.currentSensor = null;
      }
    }
  }

    // // Check if the player is within the interactable area
    // const distance = Phaser.Math.Distance.Between(
    //   this.player.x,
    //   this.player.y,
    //   this.interactableX,
    //   this.interactableY
    // );
    // const isPlayerInArea = distance <= this.interactableRadius;

    // // Show or hide the "Press E to work for the day" text
    // if (isPlayerInArea && !this.choiceText.visible) {
    //   this.interactionText.setPosition(this.interactableX, this.interactableY - 50);
    //   this.interactionText.setVisible(true);
    // } else {
    //   this.interactionText.setVisible(false);
    // }

    // // Handle interaction when the E key is pressed
    // if (isPlayerInArea && Phaser.Input.Keyboard.JustDown(this.eKey)) {
    //   console.log("Interacted with the specific area!");
    //   this.choiceText.setPosition(this.interactableX, this.interactableY - 50);
    //   this.choiceText.setVisible(true);

    //   // Hide the "Press E to work for the day" text
    //   this.interactionText.setVisible(false);
    // }

    // // Handle the player's choice
    // if (this.choiceText.visible) {
    //   if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
    //     StatsManager.incrementPP();
    //     StatsManager.decrementMP();
    //     console.log("Player chose to work for the day!");
    //     this.choiceText.setVisible(false);
    //     this.interactionText.setVisible(false);
    //     // Destroy the existing player before respawning
    // if (this.player) {
    //   this.player.destroy(); // Remove the existing player sprite
    // }

    //     // Respawn the player
    //     this.player.setPosition(800, 300);

    //     // Increment the workday count
    //     StatsManager.incrementWorkDayCount();
    //     this.createPlayer(); // Recreate the player to show the correct text
    //   } else if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
    //     console.log("Player chose to goof off!");
    //     StatsManager.incrementMP();
    //     StatsManager.decrementPP();
    //     this.choiceText.setVisible(false);

    //     // Increment the workday count
    //     StatsManager.incrementWorkDayCount();

    //     // Transition to Pong
    //     this.scene.stop("WorkDay");
    //     this.scene.start("Pong");
    //   }
    // }
    // if (this.currentInteraction && !this.interactionInProgress) {
    //   this.interactHint.setVisible(true);
    //   this.interactHint.setPosition(this.player.x, this.player.y - 40);
    // } else {
    //   this.interactHint.setVisible(false);
    // }
  }

  createCollisions(player, layers) {
    layers.forEach((layer) => {
      layer.setCollisionByProperty({ collision: true });
      this.physics.add.collider(player, layer);
    });
  }

  createPlayer() {
    this.player = this.physics.add.sprite(260, 230, "player", "frame-1").setScale(0.8);
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

    this.cameras.main.startFollow(this.player);

    // Display a short-timed text box over Tom's head based on workday count
    const workDayCount = StatsManager.getWorkDayCount();
    console.log("Current WorkDay Count in createPlayer:", workDayCount);

    let textToDisplay = "";
    switch (workDayCount) {
      case 0:
        textToDisplay = "Tom, you better get working! \n\nYour desk is collecting dust.";
        break;
      case 1:
        textToDisplay = "Ahhhhhhh \n\nmuch better.";
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

      const bubble = new SpeechBubble(
          this,
          this.player.x,
          this.player.y - this.player.height / 2 - 10,
          textToDisplay,
          {},
          250
        );

        bubble.show();
        
      this.time.delayedCall(2000, () => {
        if (bubble) bubble.destroy();
      })
      // const spawnText = this.add.text(
      //   this.player.x, // Position the text at the player's X position
      //   this.player.y - 50, // Position the text slightly above the player's head
      //   textToDisplay, // The text to display
      //   {
      //     fontSize: "16px",
      //     fill: "#ffffff",
      //     backgroundColor: "#000000",
      //     padding: { x: 10, y: 5 },
      //   }
      // ).setOrigin(0.5); // Center the text

      // // Use a delayed call to hide or destroy the text after 2 seconds
      // this.time.delayedCall(2000, () => {
      //   spawnText.destroy(); // Remove the text from the scene
      // });
    }
  }

  objectNudge(obj, objX, objY, propertyName = "") {
    if (propertyName === "") {
      obj.x += objX;
      obj.y += objY;
    } else if (propertyName) {
      obj.x += objX;
      obj.y -= objY;
    } else {
      obj.x -= objX;
      obj.y -= objY;
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

  updateClock() {
    const now = new Date();
    const h = String(this.gameTime.getHours()).padStart(2, "0");
    const m = String(this.gameTime.getMinutes()).padStart(2, "0");
    const s = String(this.gameTime.getSeconds()).padStart(2, "0");
    this.clockText.setText(`${h}:${m}`);
  }

  debugBox(sprite) {
    this.add
      .rectangle(
        sprite.body.x + sprite.body.width / 2,
        sprite.body.y + sprite.body.height / 2,
        sprite.body.width,
        sprite.body.height,
        0xff00000,
        0.3
      )
      .setOrigin(0.5);
  }

  distanceCheck(player, object) {
    const dist = Phaser.Math.Distance.Between(
      player.x,
      player.y,
      object.x,
      object.y
    );

    if (dist < 32) {
      console.log("I am in range");
    }
  }
}

export default WorkDay;
