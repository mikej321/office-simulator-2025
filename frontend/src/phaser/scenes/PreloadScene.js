import Phaser from "phaser";
import WebFont from "webfontloader";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {

    const filePrefix = "/office-simulator-2025/assets"
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );

    this.load.once("filecomplete-script-webfont", () => {
      WebFont.load({
        google: {
          families: ["Orbitron:400,700"],
        },
      });
    });

    this.load.image(
      "tileset",
      "/office-simulator-2025/assets/asset-export-final-resized.png",
      {
        filtering: false,
        premultipliedAlpha: false,
      }
    );

    this.load.image(
      "glitchy_tileset",
      "/office-simulator-2025/assets/glitchy_tiles.png",
      {
        filtering: false,
        premultipliedAlpha: false,
      }
    )

    this.load.tilemapTiledJSON(
      "tilemap",
      "/office-simulator-2025/assets/newer-test-office-resized.tmj"
    );

    this.load.tilemapTiledJSON(
      "glitchy_tilemap",
      "/office-simulator-2025/assets/glitchy_office.tmj"
    );

    this.load.atlas(
      "player",
      "/office-simulator-2025/assets/player-sprite.png",
      "/office-simulator-2025/assets/player-sprite.json"
    );

    // Idle animation for the glitch level
    this.load.atlas(
      "glitch_knight_idle",
      "/office-simulator-2025/assets/idle_animation.png",
      "/office-simulator-2025/assets/idle_animation.json"
    );

    // Death animation for the glitch level
    this.load.atlas(
      "glitch_knight_death",
      "/office-simulator-2025/assets/death_animation.png",
      "/office-simulator-2025/assets/death_animation.json"
    )

    // Heavy attack animation for the glitch level
    this.load.atlas(
      "glitch_knight_heavy",
      "/office-simulator-2025/assets/heavy_attack.png",
      "/office-simulator-2025/assets/heavy_attack.json"
    )

    // Hurt animation for the glitch level
    this.load.atlas(
      "glitch_knight_hurt",
      "/office-simulator-2025/assets/hurt_animation.png",
      "/office-simulator-2025/assets/hurt_animation.json"
    )

    // Light attack animation for the glitch level
    this.load.atlas(
      "glitch_knight_light",
      "/office-simulator-2025/assets/light_attack.png",
      "/office-simulator-2025/assets/light_attack.json"
    )

    // Medium attack animation for the glitch level
    this.load.atlas(
      "glitch_knight_medium",
      "/office-simulator-2025/assets/medium_attack.png",
      "/office-simulator-2025/assets/medium_attack.json"
    )

    // Run animation for the glitch level
    this.load.atlas(
      "glitch_knight_run",
      "/office-simulator-2025/assets/run_animation.png",
      "/office-simulator-2025/assets/run_animation.json"
    )

    // Walk animation for the glitch level

    this.load.atlas(
      "glitch_knight_walk",
      "/office-simulator-2025/assets/walk_animation.png",
      "/office-simulator-2025/assets/walk_animation.json"
    )

    // Defend animation for the glitch level
    this.load.atlas(
      "glitch_knight_defend",
      "/office-simulator-2025/assets/defend_animation.png",
      "/office-simulator-2025/assets/defend_animation.json"
    )

    // Archer idle animation
    this.load.atlas(
      "archer_idle",
      `/office-simulator-2025/assets/archer_idle.png`,
      `/office-simulator-2025/assets/archer_idle.json`
    )

    // Archer attack animation
    this.load.atlas(
      "archer_attack",
      `/office-simulator-2025/assets/archer_attack.png`,
      `/office-simulator-2025/assets/archer_attack.json`
    )

    // Archer death animation
    this.load.atlas(
      "archer_death",
      `${filePrefix}/archer_death.png`,
      `${filePrefix}/archer_death.json`
    )

    // Archer projectile animation
    this.load.atlas(
      "archer_projectile",
      `/office-simulator-2025/assets/archer_projectile.png`,
      `/office-simulator-2025/assets/archer_projectile.json`
    )

    this.load.atlas(
      "archer_run",
      `${filePrefix}/archer_run.png`,
      `${filePrefix}/archer_run.json`
    )

    // Archer death animation
    this.load.atlas(
      "archer_death",
      "/office-simulator-2025/assets/archer_death.png",
      "/office-simulator-2025/assets/archer_death"
    )

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
      "printer",
      "/office-simulator-2025/assets/attachments/printer_resized.png",
      "/office-simulator-2025/assets/attachments/printer_resized.json"
    );

    this.load.atlas(
      "vending-machine",
      "/office-simulator-2025/assets/attachments/vending_machine_resized.png",
      "/office-simulator-2025/assets/attachments/vending_machine_resized.json"
    );

    // this.load.start()
  }

  create() {
    this.scene.start("MainMenuScene"); //Starting scene of the game
  }
}
