import Phaser from "phaser";
import StatsManager from "../utils/StatsManager";
import SpeechBubble from "../../factories/speechBubble";
import MusicManager from "./MusicManager";
import StatsOverlay from '../utils/StatsOverlay';
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

  currentChrisLineIndex = null;

  init(){
    this.textStyle = {
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
    };
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
    this.chrisLines = [
        "Debugging is like being the detective in a crime movie where you're also the murderer.",
        "Did you try turning it off and on again?",
        "Your code compiles? Looks like someone’s graduating!",
        "Keep calm and `git commit`.",
        "Behind every great coder is a stack of failed builds.",
        "You're not just pushing code — you're pushing limits.",
        "Real programmers don't comment code. If it was hard to write, it should be hard to read.",
        "Don't worry, I left a few bugs in there for nostalgia.",
        "Every bug you squashed brought you here.",
        "You don't write bugs — you write unexpected features.",
        "Remember: failing tests are just misunderstood success stories.",
        "`NaN`, `undefined`, `null` — just like my emotions during your first project review.",
        "Code is poetry. And your early work was... abstract.",
        "Graduating? Who gave you permission to stop learning?",
        "Your recursion has finally terminated. Congratulations!",
        "I ran a `diff` between then and now — you’ve improved *a lot*.",
        "You’ve passed the ultimate test: building AND surviving a JavaScript game.",
        "This game isn’t just fun — it’s functionally awesome.",
        "What’s the runtime complexity of awesomeness? O(you).",
        "Don’t forget me when you’re CTO.",
        "Error 404: Apprenticeship not found. You did it!",
        "You're like a well-named variable — meaningful and reliable.",
        "Did you optimize your dreams for performance too?",
        "If coding were a game, you just hit the boss level.",
        "No more imposter syndrome. Just programmer pride.",
        "You’re not just a dev. You’re a dev who shipped.",
        "You used to `console.log()` bugs. Now you log victories.",
        "Let’s `merge` this branch of your life with greatness.",
        "This apprenticeship was your sandbox. Now it’s production time.",
        "The code of success: curiosity + grit + caffeine.",
        "Your apprenticeship is over, but your commits live on.",
        "You’ve graduated from for-loops to foresight.",
        "I’m not crying. My fan is just overheating.",
        "Just promise me one thing: always write tests.",
        "Stack Overflow better watch out. You’re coming.",
        "You came. You coded. You conquered.",
        "Let’s be real — I’m just an NPC in the game of your life.",
        "Achievement unlocked: Survived mentorship with Chris.",
        "Your future codebases thank you for today.",
        "I taught you everything I know. The rest is up to you.",
        "Now go out there and cause some meaningful merge conflicts.",
    ];
    this.wasNearChris = false; // Tracks whether player was previously near Chris


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

    // Fade-in transition
    this.cameras.main.setAlpha(0); // starts it out fully invisible
    this.time.delayedCall(1100, () => {
      this.cameras.main.setAlpha(1);
      this.cameras.main.fadeIn(1000);
    });

    // Define the game area dimensions
    const gameWidth = 800;
    const gameHeight = 600;

    const offsetX = (this.scale.width - gameWidth) / 2
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
    this.interactionText = this.add.text(offsetX + gameWidth / 2, offsetY + gameHeight - 50, "Press E to work for the day", this.textStyle).setOrigin(0.5);
    this.interactionText.setVisible(false);

    this.choiceText = this.add.text(offsetX + gameWidth / 2, offsetY + gameHeight / 2, "Q: Work for the day\nR: Goof off", this.textStyle).setOrigin(0.5);
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
    this.avatar = this.physics.add.image(300, 400, "avatarTall").setScale(0.1).setDepth(1);
    this.avatar.body.setAllowGravity(false); // Make sure Chris doesn’t fall
    this.avatar.body.immovable = true;       // Chris should not move on collision



    // Add a text box for interaction (hidden by default)
    this.avatarText = this.add.text(this.avatar.x, this.avatar.y - 50, "", this.textStyle).setOrigin(0.5).setVisible(false);


    // Enable overlap check between player and avatar
    this.physics.add.overlap(this.player, this.avatar, () => {
      const nearAvatar = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        this.avatar.x, this.avatar.y
      ) < 50;

    if (nearAvatar && !this.wasNearChris) {
        this.wasNearChris = true;

        const randomIndex = Phaser.Math.Between(0, this.chrisLines.length - 1);
        const randomLine = this.chrisLines[randomIndex];

        if (randomLine && randomLine.trim() !== "") {
          console.log("Chris says:", randomLine);
          this.avatarText.setText(randomLine);
          this.avatarText.setVisible(true);
        } else {
          console.warn("Empty or undefined Chris line!");
          this.avatarText.setText("..."); // fallback
          this.avatarText.setVisible(true);
        }

      } else if (!nearAvatar && this.wasNearChris) {
        this.wasNearChris = false;
        this.avatarText.setVisible(false);
      }
    }, null, this);
  }

  update() {
  this.statsOverlay.update();
  this.playerMovement();

  const sensor = this.currentSensor;

  // ALWAYS check JustDown right away, on its own:
  if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
    console.log("E fired");

    // If workday tasks are done, bail out immediately:
    if (StatsManager.getWorkDayTaskNumber() >= 3) {
      StatsManager.incrementWorkDayCount();
      if (StatsManager.getWorkDayCount() >= StatsManager.getWorkDayLimit()) {
        StatsManager.setWorkDayLimitReached(true);
      }
      console.log("Workday loop complete. Transitioning to EndOfDay.");
      this.scene.transition({ target: "EndOfDay", duration: 500, moveAbove: true });
      return;
    }

    // If we're already in the “awaitingChoice” state, pressing E here means "Pong":
    if (this.awaitingChoice && sensor) {
      console.log("Choice confirmed: E → Pong");
      if (this.bubble) this.bubble.destroy();
      this.scene.transition({ target: "Pong", duration: 500, moveAbove: true });
      return;
    }

    // NOTE: Only now do we check which sensor we’re in, since this code is running on the exact JustDown frame:
    if (sensor && sensor.name === "Door Sensor") {
      console.log("playing door sprite animation");
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
          });
        });
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
    }

    // Printer Sensor → “print” animation
    if (sensor && sensor.name === "Printer Sensor") {
      console.log("playing printer animation");
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
    }

    // Computer Sensor (fallback) → “work for the day”
    if (sensor) {
      console.log("Player chose to work for the day");
      StatsManager.incrementPP();
      StatsManager.decrementMP();
      StatsManager.incrementWorkDayCount();
      this.scene.transition({
        target: "Home",
        duration: 500,
        moveAbove: true,
        onUpdate: (progress) => {
          this.cameras.main.setAlpha(1 - progress);
        }
      });
      return;
    }
  } // end of JustDown(this.eKey) block

  // Now check Q key presses in the same way:
  if (Phaser.Input.Keyboard.JustDown(this.qKey)) {
    console.log("Q fired");

    // If already awaiting choice and in a sensor, Q → “GlitchyScene”
    if (this.awaitingChoice && sensor) {
      console.log("Choice confirmed: Q → GlitchyScene");
      if (this.bubble) this.bubble.destroy();
      this.scene.transition({ target: "GlitchyScene", duration: 500, moveAbove: true });
      return;
    }

    // If you press Q inside the Computer Sensor (to show choices), spawn a bubble:
    if (sensor && sensor.name === "Computer Sensor") {
      console.log("Computer Sensor Q pressed → showing choice bubble");
      if (this.bubble) this.bubble.destroy();

      this.bubble = new SpeechBubble(
        this,
        this.player.x,
        this.player.y - this.player.height / 2 - 10,
        'Press "E" to slack off with pong\nPress "Q" to enter Nightmare world',
        {},
        250
      );
      this.bubble.show();
      this.awaitingChoice = true;
      return;
    }
  } // end of JustDown(this.qKey) block

  // If your code reaches here, no key-triggered action needed for this frame.
  // However, you still want to manage exiting a sensor. For example:
  if (sensor && this.bubble) {
    this.bubble.setPosition(this.player.x, this.player.y - this.player.height / 2 - 10);
    if (!this.physics.world.overlap(this.player, sensor)) {
      console.log("Exited sensor named", sensor.name);
      this.bubble.hide();
      this.bubble = null;
      this.currentSensor = null;
      this.awaitingChoice = false; // reset if you exit prematurely
    }
  }
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

    if (!this.anims.exists("walk")) {
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
    }

    if (!this.anims.exists("back")) {
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
    }

    if (!this.anims.exists("idle")) {
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
    }

    this.cameras.main.startFollow(this.player);

    //this.cameras.main.startFollow(this.player);

    const currentDay = StatsManager.getWorkDayCount(); // 1–5
    this.workDay = currentDay - 1; // Adjust to 0–4
    // console.log("Current workday in createPlayer:", this.workDay);

    // let textToDisplay = "";
    // switch (workDayCount) {
    //   case 0:
    //     textToDisplay = "Tom, you better get working! \n\nYour desk is collecting dust.";
    //     break;
    //   case 1:
    //     textToDisplay = "Ahhhhhhh \n\nmuch better.";
    //     break;
    //   case 2:
    //     textToDisplay = "Is that a cat over there?";
    //     break;
    //   case 3:
    //     textToDisplay = "We should come up with a name for the cat.";
    //     break;
    //   default:
    //     textToDisplay = ""; // No text for other counts
    // }

    // if (textToDisplay) {

    //   const bubble = new SpeechBubble(
    //     this,
    //     this.player.x,
    //     this.player.y - this.player.height / 2 - 10,
    //     textToDisplay,
    //     {},
    //     250
    //   );

    //   bubble.show();

    //   this.time.delayedCall(2000, () => {
    //     if (bubble) bubble.destroy();
    //   })
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
    // }
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
    this.taskNum = StatsManager.getWorkDayTaskNumber(); // 0–2
    console.log("Current task count in createPlayer:", this.taskNum);

    // Defensive check: make sure workDay and taskNum are valid
    if (this.workDay >= 0 && this.workDay < 5 && this.taskNum >= 0 && this.taskNum < 3) {
      const bossYells = {
        0: [
          "Tom, you better get working! Your desk is collecting dust.",
          "Don’t forget the onboarding checklist this time.",
          "And stop drinking so much coffee!",
        ],
        1: [
          "We have deadlines, Tom. Dead. Lines.",
          "Did you even clock in today?",
          "You're not paid to stare at your computer screen!",
        ],
        2: [
          "That report better be done before lunch.",
          "Why is your desk always a mess?",
          "You're not the office cat whisperer, Tom!",
        ],
        3: [
          "The printer is not your friend. Stop hugging it.",
          "We are a *team*, Tom. Not a one-man circus.",
          "Did you do your best today Tom?",
        ],
        4: [
          "It’s Friday. Try *not* to mess this one up.",
          "HR is watching, Tom. Smile more.",
          "Your performance review is soon. Be afraid.",
        ],
      };

      const line = bossYells[this.workDay][this.taskNum];
      const spawnText = this.add.text(
        this.scale.width - 300,  // X: near right edge with some padding
        40,                     // Y: top with some padding
        line,
        this.textStyle
      ).setOrigin(0.5);

      this.time.delayedCall(6000, () => {
        spawnText.destroy();
      });
    } else {
      console.warn("No boss yell found for day", this.workDay, "and task", this.taskNum);
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
