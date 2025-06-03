import Phaser from "phaser";
import WebFont from "webfontloader";
import SpeechBubble from "../../factories/speechBubble";
import WorkDay from "./WorkDay";
import Player from "../../factories/player";
import Archer from "../../factories/archer";


class GlitchyScene extends Phaser.Scene {
    constructor() {
        super({
            key: "GlitchyScene",
        });
    }

    preload() {

    }

    create() {
        this.map = this.make.tilemap({
            key: "glitchy_tilemap",
        })

        this.tileset = this.map.addTilesetImage(
            "glitchy-office-tiles",
            "glitchy_tileset"
        );

        this.textures
            .get("glitchy-office-tiles")
            .setFilter(Phaser.Textures.FilterMode.NEAREST);

        this.physics.world.setBounds(
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

        
        this.floor = this.map.createLayer("floor", this.tileset, 0, 0);
        this.background = this.map.createLayer("background", this.tileset, 0, 0);

        const boundaryUpper = this.map.getObjectLayer("floor_boundary_upper").objects;
        const boundaryLower = this.map.getObjectLayer("floor_boundary_lower").objects;

        const boundaryGroup = this.physics.add.staticGroup();

        this.score = 0;


        // Hitbox group
        this.playerHitBoxes = this.physics.add.group({
            classType: Phaser.GameObjects.Zone,
            runChildUpdate: true
        });



        this.anims.create({
            key: "projectile",
            frames: this.anims.generateFrameNames("archer_projectile", {
                start: 1,
                end: 3,
                prefix: "projectile_"
            }),
            frameRate: 5
        })

        boundaryUpper.forEach(obj => {
            const rect = this.add.rectangle(obj.x, obj.y - (obj.height + 40), obj.width, obj.height)
                .setOrigin(0, 1)
                .setVisible(false);

            this.physics.add.existing(rect, true);

            rect.body.setSize(obj.width, obj.height);
            
            boundaryGroup.add(rect)
        })

        boundaryLower.forEach(obj => {
            const rect = this.add.rectangle(obj.x, obj.y + (obj.height + 3), obj.width, obj.height)
                .setOrigin(0, 1)
                .setVisible(false);

            this.physics.add.existing(rect, true);

            rect.body.setSize(obj.width, obj.height);

            boundaryGroup.add(rect);
        })

        this.archerProjectiles = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Sprite,
            runChildUpdate: true
        });
        
        this.player = new Player(this, 0, 500, "glitch_knight_idle", "idle_animation_1").setScale(3);
        this.player.setSize(32, 32);
        // this.player.body.pushable = false;


        // Health Bar Stats
        this.healthBarBG = this.add.rectangle(60, 40, 104, 24, 0x000000)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.healthBar = this.add.rectangle(62, 42 + 2, 100, 20, 0xff0000)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        // Score Text
        this.rem = 16;
        this.marginRight = 4 * this.rem;

        this.scoreText = this.add.text(this.scale.width - this.marginRight, 42, "Score: 0", {
            fontSize: "24px",
            fill: "#fff"
        })

        this.scoreText.setScrollFactor(0);
        this.scoreText.setOrigin(1, 0);
        
        // this.archer = new Archer(this, 1000, 500);
        this.archers = this.physics.add.group({
            classType: Archer,
            runChildUpdate: true,
            allowGravity: true,
            immovable: false
        })

        this.archer = new Archer(this, 1000, 500);
        this.archers.add(this.archer);
        
        if (this.archer) {
            this.archer.setActive(true).setVisible(true);
            this.archer.health = 20;
        }

        this.archer.setActive(true);
        this.archer.setVisible(true);
        // this.archer.setImmovable(true);
        this.archer.body.enable = true;
        this.archer.damage = 20;


        this.archer.body.pushable = false;

        // this.physics.add.collider(this.player, boundaryGroup);
        // this.physics.add.collider(this.player, this.archer);
        
        this.physics.add.overlap(this.player, this.archerProjectiles, (playerSprite, projectileSprite) => {
            const wasDefending = playerSprite.isDefending && playerSprite.anims.currentFrame?.index === 2;
            
            if (projectileSprite.damage && typeof playerSprite.takeDamage === 'function') {
                playerSprite.takeDamage(projectileSprite.damage);
            }

            let dx = playerSprite.x - projectileSprite.x;
            let dy = playerSprite.y - projectileSprite.y;

            const pushStrength = wasDefending ? 10 : 200;

            const pushVec = new Phaser.Math.Vector2(dx, dy).normalize().scale(pushStrength);
            playerSprite.setVelocity(pushVec.x, pushVec.y);

            projectileSprite.destroy();
        }, null, this);

        this.physics.add.overlap(this.playerHitBoxes, this.archers, (hitbox, enemy) => {
                if (typeof enemy.takeDamage === "function") {
                    enemy.takeDamage(hitbox.damage, hitbox.knockback, hitbox);
                    this.spawnDamageText(enemy.x, enemy.y - enemy.height, hitbox.damage);
                }

            hitbox.destroy();
        })

        this.cameras.main.startFollow(this.player);

        this.spawnMultipleArchers(10, 100000)
    }

    update(time, delta) {

        if (!this.player.isDead) this.player.playerMovement();

        this.player.playerMovement();
        this.archers.children.iterate((archer) => {
            if (archer && archer.active && archer.body) {
                archer.update(this.player, time, delta);
            }
        })
        // if (this.archer && this.archer.active && this.archer.body) {
        //     this.archer.update(this.player, time, delta);
        // }

        const healthPercent = Phaser.Math.Clamp(this.player.currentHealth / this.player.maxHealth, 0, 1);
        const targetWidth = 100 * healthPercent;
        this.healthBar.width += (targetWidth - this.healthBar.width) * 0.1;

        this.scoreText.setX(this.scale.width - this.marginRight);
    }

    debugBox(sprite) {
        this.add.rectangle(
            sprite.body.x + sprite.body.width / 2,
            sprite.body.y + sprite.body.height / 2,
            sprite.body.width,
            sprite.body.height,
            0xff00000,
            0.3
        )
        .setOrigin(0.5);
    }

    spawnDamageText(x, y, amount, color = '#ff3333') {
        const text = this.add.text(x, y, `-${amount}`, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: color,
            stroke: '#000',
            strokeThickness: 3
        })
        .setOrigin(0.5)
        .setDepth(100)
        .setScrollFactor(0)

        this.tweens.add({
            targets: text,
            y: y - 30,
            alpha: 0,
            duration: 800,
            ease: "Power1",
            onComplete: () => text.destroy()
        })
    }

    addScore(points) {
        this.score += points;
        this.scoreText.setText(`Score: ${this.score}`);
    }
    
    spawnArcher() {
    const x = Phaser.Math.Between(900, 1300);
    const y = 400;

    const newArcher = this.archers.get(x, y);
    if (!newArcher) return;

    if (!newArcher.body) {
        // First time creation
        newArcher.setScene(this);
        this.physics.world.enable(newArcher);
        this.add.existing(newArcher);
    }

    // Common reset for both reused and new
    newArcher.setPosition(x, y);
    newArcher.setActive(true);
    newArcher.setVisible(true);
    newArcher.health = 20;
    newArcher.setAlpha(1);
    newArcher.body.enable = true;

    // Reset archer-specific state
    newArcher.isAttacking = false;
    newArcher.currentState = 'idle'; // Or whatever your default is
    newArcher.anims.play("archer_idle", true); // If applicable
    newArcher.clearTimers?.(); // If you have any custom timers in Archer
}


    spawnMultipleArchers(count = 5, duration = 10000) {
    const interval = duration / count;

    for (let i = 0; i < count; i++) {
        this.time.delayedCall(i * interval, () => {
            this.spawnArcher();
        });
    }
}

}

export default GlitchyScene;