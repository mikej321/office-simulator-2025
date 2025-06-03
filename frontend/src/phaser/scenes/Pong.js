import Phaser from "phaser";
import * as Colors from "../consts/Colors";
import StatsManager from "../utils/StatsManager";

class Pong extends Phaser.Scene {
    constructor() {
        super({
            key: "Pong",
        });

        this.gamesPlayed = 0; // Track the number of games played
    }

    init() {
        this.paddleRightVelocity = new Phaser.Math.Vector2(0, 0);
        this.leftScore = 0;
        this.rightScore = 0;
        this.paused = false;
        this.ballSpeed = 300; // Initial ball speed
        StatsManager.setPlayGame();
        this.playerPaddleSpeed = 250; // Faster player paddle speed
    }

    preload() {}

    create() {
        console.log("Pong scene started!");
        this.gamesPlayed++; // Increment the games played counter
        const gameWidth = 800;
        const gameHeight = 600;

        const offsetX = (this.scale.width - gameWidth) / 2;
        const offsetY = (this.scale.height - gameHeight) / 2;
        this.physics.world.setBounds(offsetX - 50, offsetY, gameWidth + 100, gameHeight);

        this.scene.run("PongBackground");
        this.scene.sendToBack("PongBackground");

        // Ball
        this.ball = this.add.circle(offsetX + gameWidth / 2, offsetY + gameHeight / 2, 10, 0x00ff00);
        this.physics.add.existing(this.ball);
        this.ball.body.setCircle(10);
        this.ball.body.setCollideWorldBounds(true, 1, 1);
        this.ball.body.setBounce(1, 1);

        // Left paddle
        this.paddleLeft = this.add.rectangle(offsetX + 50, offsetY + gameHeight / 2, 20, 100, 0x000000);
        this.physics.add.existing(this.paddleLeft);
        this.physics.add.collider(this.ball, this.paddleLeft, this.increaseBallSpeed, null, this);
        this.paddleLeft.body.setBounce(1, 1);
        this.paddleLeft.body.setImmovable(true);
        this.paddleLeft.fillColor = Colors.white;

        // Right paddle
        this.paddleRight = this.add.rectangle(offsetX + gameWidth - 50, offsetY + gameHeight / 2, 20, 100, 0x000000);
        this.physics.add.existing(this.paddleRight);
        this.physics.add.collider(this.ball, this.paddleRight, this.increaseBallSpeed, null, this);
        this.paddleRight.body.setBounce(1, 1);
        this.paddleRight.body.setImmovable(true);
        this.paddleRight.fillColor = Colors.white;

        this.cursors = this.input.keyboard.createCursorKeys();

        const scoreStyle = { fontSize: "48px" };

        this.leftScoreLabel = this.add.text(offsetX + 200, offsetY + 20, "0", scoreStyle);
        this.rightScoreLabel = this.add.text(offsetX + gameWidth - 200, offsetY + 20, "0", scoreStyle);

        // Delay before ball starts moving
        this.time.delayedCall(2000, () => {
            this.resetBall();
        });
    }

    increaseBallSpeed(ball, paddle) {
        this.ballSpeed += 20; // Increment ball speed by 20
        const angle = Phaser.Math.Between(-45, 45); // Randomize the angle slightly
        const direction = ball.body.velocity.x > 0 ? 1 : -1; // Keep the ball moving in the same direction
        const vec = this.physics.velocityFromAngle(angle, this.ballSpeed);

        ball.body.setVelocity(vec.x * direction, vec.y);
        console.log(`Ball speed increased to: ${this.ballSpeed}`);
    }

    update() {
        if (this.paused) return;

        // Player
        this.processPlayerInput();
        // AI
        this.updateAI();
        // Score
        this.checkScore();
    }

    processPlayerInput() {
        if (this.cursors.up.isDown) {
            this.paddleLeft.body.setVelocityY(-this.playerPaddleSpeed);
        } else if (this.cursors.down.isDown) {
            this.paddleLeft.body.setVelocityY(this.playerPaddleSpeed);
        } else {
            this.paddleLeft.body.setVelocityY(0);
        }
    }

    checkScore() {
        const gameWidth = 800;
        const gameHeight = 600;

        const offsetX = (this.scale.width - gameWidth) / 2;
        const offsetY = (this.scale.height - gameHeight) / 2;

        if (this.ball.x < offsetX) {
            this.resetBall();
            this.rightScorePoint(); // Right player scores
        } else if (this.ball.x > offsetX + gameWidth) {
            this.resetBall();
            this.leftScorePoint(); // Left player scores
        }

        const maxScore = 3; // Maximum score to win the game

        if (this.leftScore >= maxScore) {
            console.log("Tom won!!");
            StatsManager.incrementWins();
            StatsManager.incrementMP();
            this.paused = true;

            if (this.gamesPlayed >= 3) {
                console.log("Maximum number of games reached!");
                this.scene.stop("PongBackground");
                this.scene.start("MaxPong");
                this.gamesPlayed = 0; // Reset games played for the next session
                return;
            } else {
                this.gamesPlayed = 0; // Reset games played for the next session
                this.scene.stop("PongBackground");
                this.scene.run("WonPong");
            }
        } else if (this.rightScore >= maxScore) {
            console.log("Tom lost!!");
            StatsManager.incrementLosses();
            StatsManager.decrementMP();
            this.paused = true;

            if (this.gamesPlayed >= 3) {
                console.log("Maximum number of games reached!");
                this.gamesPlayed = 0; // Reset games played for the next session
                this.scene.stop("PongBackground");
                this.scene.start("MaxPong");
                return;
            } else {
                this.gamesPlayed = 0; // Reset games played for the next session
                this.scene.stop("PongBackground");
                this.scene.run("LostPong");
            }
        }
    }

    updateAI() {
        const diff = this.ball.y - this.paddleRight.y;

        // Improve AI response: Make it follow the ball more closely
        const difficulty = Math.min(this.leftScore + this.rightScore, 10); // Max difficulty at 10
        const reactionSpeed = 200 + difficulty * 10; // Faster reaction speed as difficulty increases

        const missChance = Phaser.Math.Between(0, 100 - difficulty * 5); // Chance to miss decreases with difficulty

        if (missChance > 10) {
            // AI follows ball more precisely
            if (diff < 0) {
                this.paddleRight.body.setVelocityY(-reactionSpeed); // Move up
            } else if (diff > 0) {
                this.paddleRight.body.setVelocityY(reactionSpeed); // Move down
            } else {
                this.paddleRight.body.setVelocityY(0); // Stop moving
            }
        } else {
            // Occasionally "miss" the ball
            this.paddleRight.body.setVelocityY(Phaser.Math.Between(-200, 200));
        }
    }

    leftScorePoint() {
        this.leftScore++;
        this.leftScoreLabel.text = this.leftScore.toString();
    }

    rightScorePoint() {
        this.rightScore++;
        this.rightScoreLabel.text = this.rightScore.toString();
    }

    resetBall() {
        const gameWidth = 800;
        const gameHeight = 600;
        const offsetX = (this.scale.width - gameWidth) / 2;
        const offsetY = (this.scale.height - gameHeight) / 2;

        this.ball.setPosition(offsetX + gameWidth / 2, offsetY + gameHeight / 2);
        const angle = Phaser.Math.Between(0, 360);
        const vec = this.physics.velocityFromAngle(angle, this.ballSpeed);
        this.ball.body.setVelocity(vec.x, vec.y);
    }
}

export default Pong;
