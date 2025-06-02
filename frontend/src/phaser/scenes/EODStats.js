import Phaser from "phaser";
import StatsManager from "../utils/StatsManager";
import Home from "./home";
import WorkDay from "./WorkDay";

export default class EODStats extends Phaser.Scene {
  constructor() {
    super({
      key: "EODStats",
    });
   
  }

  create() {
    const gameWidth = 800;
    const gameHeight = 600;
    const projectProgress = StatsManager.getPP();
    const mentalHealth = StatsManager.getMP();
    const pongWins = StatsManager.getWins();
    const pongLosses = StatsManager.getLosses();

    console.log("StatsManager.getPlayGame():", StatsManager.getPlayGame());

    StatsManager.resetWorkDayCount();


    const offsetX = (this.scale.width - gameWidth) / 2;
    const offsetY = (this.scale.height - gameHeight) / 2;
    const instructions = this.add.text(
        offsetX + gameWidth / 2,
        offsetY + gameHeight / 2 + 50,
        "Press SPACE to continue",
        {
            fontSize: "24px",
            color: "#ffffff",
        }
    );
    instructions.setOrigin(0.5);

    if (StatsManager.getPP() > 0) {
        console.log("Condition: StatsManager.getPP() > 0");
        this.add.text(
            100,
            100,
            `Good Job, Tom!\nYour boss noticed your hard work today.\nProject Progress: ${projectProgress}\nMental Health: ${mentalHealth}\nPong Wins: ${pongWins}\nPong Losses: ${pongLosses}`,
            {
                fontSize: "48px",
                color: "#00ff00",
            }
        );
        this.input.keyboard.once("keydown-SPACE", () => {
            this.scene.stop("EOdStats");
            this.scene.start("Home");
        });
    } else if (StatsManager.getPlayGame()) {
        console.log("Condition: StatsManager.getPlayGame() === true");
        this.add.text(
            100,
            100,
            `Your boss didn't say anything, \nbut he noticed Tom...\nProject Progress: ${projectProgress}\nMental Health: ${mentalHealth}\nPong Wins: ${pongWins}\nPong Losses: ${pongLosses}`,
            {
                fontSize: "48px",
                color: "#00ff00",
            }
        );
        this.input.keyboard.once("keydown-SPACE", () => {
            this.scene.stop("EOdStats");
            this.scene.start("Home");
        });
    } else {
        console.log("Condition: Default else block");
        this.add.text(
            100,
            100,
            `Pretty unremarkable day.\nYou flew under the radar.\nProject Progress: ${projectProgress}\nMental Health: ${mentalHealth}\nPong Wins: ${pongWins}\nPong Losses: ${pongLosses}`,
            {
                fontSize: "48px",
                color: "#00ff00",
            }
        );
        this.input.keyboard.once("keydown-SPACE", () => {
            this.scene.stop("EOdStats");
            this.scene.start("Home");
        });
    }

    StatsManager.resetPlayGame();
}
}