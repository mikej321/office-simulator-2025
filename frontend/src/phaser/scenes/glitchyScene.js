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
        
        this.archer = new Archer(this, 1000, 500);
        // this.archers = this.physics.add.group({
        //     classType: Archer,
        //     runChildUpdate: true,
        // })

        // this.archer = this.archers.get(1000, 500, 'archer_idle');
        this.archer.setActive(true);
        this.archer.setVisible(true);
        this.archer.setImmovable(true);
        this.archer.body.enable = true;
        this.archer.health = 50;
        this.archer.damage = 20;


        this.archer.body.pushable = false;

        // console.log(this.textures.get("archer_attack").getFrameNames());

        this.debugBox(this.archer)
        this.debugBox(this.player)

        this.physics.add.collider(this.player, boundaryGroup);
        this.physics.add.collider(this.player, this.archer);
        
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

        this.cameras.main.startFollow(this.player);

    }

    update(time, delta) {
        this.player.playerMovement();
        this.archer.update(this.player, time, delta);
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
}

export default GlitchyScene;