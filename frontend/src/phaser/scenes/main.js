import Phaser, { Physics } from "phaser";
import TitleScreen from "./scenes/TitleScreen";
import Pong from "./scenes/Pong";
import PongBackground from "./scenes/PongBackground";
import * as SceneKeys from "./consts/SceneKeys";
import LostPong from "./scenes/LostPong";
import WonPong from "./scenes/WonPong";


const config = {
  type: Phaser.AUTO,    // Phaser will use WebGL if available, otherwise it will use Canvas
  width: 800,           // Game width               
  height: 600,          // Game height
  //backgroundColor: '#616161', // Game background color
  physics: {
    default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    }
}

const game = new Phaser.Game(config);

game.scene.add(SceneKeys.TitleScreen, TitleScreen);
game.scene.add(SceneKeys.Pong, Pong);
game.scene.add(SceneKeys.PongBackground, PongBackground);
game.scene.add(SceneKeys.LostPong, LostPong);
game.scene.add(SceneKeys.WonPong, WonPong);

game.scene.start(SceneKeys.TitleScreen);
//game.scene.start(SceneKeys.Pong); // Comment this line out to start on the title screen