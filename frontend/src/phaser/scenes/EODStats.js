import Phaser from "phaser";
import StatsManager from "../utils/StatsManager";
import HomeEvening from "./HomeEvening";

export default class EODStats extends Phaser.Scene {
  constructor() {
    super({ key: "EODStats" });
  }

  create() {
    const gameWidth = 800;
    const gameHeight = 600;
    const offsetX = (this.scale.width - gameWidth) / 2;
    const offsetY = (this.scale.height - gameHeight) / 2;

    const projectProgress = StatsManager.getPP();
    const mentalHealth = StatsManager.getMP();
    const pongWins = StatsManager.getWins();
    const pongLosses = StatsManager.getLosses();
    const energy = StatsManager.getEnergyLevel();
    const motivation = StatsManager.getMotivationLevel();
    const focus = StatsManager.getFocusLevel();

    console.log("StatsManager.getPlayGame():", StatsManager.getPlayGame());
    StatsManager.resetWorkDayTaskNumber(); 

    const summary = this.add.text(
      offsetX + 60,
      offsetY + 80,
      "",
      {
        fontSize: "28px",
        color: "#ffffff",
        lineSpacing: 12,
        wordWrap: { width: gameWidth - 120 }
      }
    );

    let message = "";

    if (projectProgress > 0) {
      message += `Good Job, Tom!\nYour boss noticed your hard work today.\n\n`;
    } else if (StatsManager.getPlayGame()) {
      message += `Your boss didn’t say anything, but he noticed you...\n\n`;
    } else {
      message += `Pretty unremarkable day.\nYou flew under the radar.\n\n`;
    }

    message += `End of Day Stats:\n`;
    message += `• Project Progress: ${projectProgress}/${StatsManager.maxProjectProgress}\n`;
    message += `• Mental Health (MP): ${mentalHealth}\n`;
    message += `• Energy: ${energy}\n`;
    message += `• Motivation: ${motivation}\n`;
    message += `• Focus: ${focus}\n`;
    message += `• Pong Wins: ${pongWins}  |  Losses: ${pongLosses}`;

    summary.setText(message);

    const instructions = this.add.text(
      offsetX + gameWidth / 2,
      offsetY + gameHeight - 60,
      "Press SPACE to continue",
      {
        fontSize: "24px",
        color: "#ffcc00",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5);

  this.input.keyboard.once("keydown-SPACE", () => {
    this.scene.stop("EODStats");
    if (projectProgress >= StatsManager.getMaxProjectProgress()) {
      this.scene.start("VictoryCutscene");
    } else if (StatsManager.getWorkDayCount() >= 5) {
      this.scene.start("FiredCutscene");
    } else {
      this.scene.start("HomeEvening");
    }
  });

  StatsManager.resetPlayGame();
  }
}
