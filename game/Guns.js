var GumiGame;
(function (GumiGame) {
    let GUNACTION;
    (function (GUNACTION) {
        GUNACTION["SHOTGUN_UP"] = "SHOTGUN_UP";
        GUNACTION["SHOTGUN_DOWN"] = "SHOTGUN_DOWN";
        GUNACTION["SHOTGUN_FORWARD"] = "SHOTGUN_FORWARD";
        GUNACTION["SMG_UP"] = "SMG_UP";
        GUNACTION["SMG_DOWN"] = "SMG_DOWN";
        GUNACTION["SMG_FORWARD"] = "SMG_FORWARD";
        GUNACTION["SMG_BACK"] = "SMG_BACK";
        GUNACTION["INVISIBLE"] = "INVISIBLE";
    })(GUNACTION = GumiGame.GUNACTION || (GumiGame.GUNACTION = {}));
    let BULLETACTION;
    (function (BULLETACTION) {
        BULLETACTION["SHOTGUN"] = "SHOTGUN";
        BULLETACTION["SMG"] = "SMG";
        BULLETACTION["SMGIMPACT"] = "SMGIMPACT";
    })(BULLETACTION = GumiGame.BULLETACTION || (GumiGame.BULLETACTION = {}));
    class Gun extends GumiGame.Character {
        constructor(_name) {
            super(_name);
            let img = document.querySelector("#Gumi");
            let txtGumi = new GumiGame.ƒ.TextureImage();
            txtGumi.image = img;
            this.sprites = new GumiGame.AnimatedSprite("GunSprites");
            this.sprites.appendSprites(GumiGame.AnimatedSprite.generateSprites(txtGumi, Gun.gunList), Gun.gunList);
            this.appendChild(this.sprites);
            this.sprites.show(GUNACTION.SMG_FORWARD);
            this.cmpTransform.local.translateZ(0.1);
        }
        act(_action, _direction) {
            if (_direction) {
                let direction = (_direction == GumiGame.DIRECTION.RIGHT ? 0.1 : -0.1);
                this.cmpTransform.local.translateZ(-this.cmpTransform.local.translation.z);
                this.cmpTransform.local.translateZ(direction);
            }
            this.sprites.show(_action);
        }
        getCurrentAction() {
            return this.sprites.getCurrentAction();
        }
    }
    Gun.gunList = {
        "SHOTGUN_UP": {
            sizeX: 32,
            sizeY: 32,
            locationX: 256,
            locationY: 96,
            framecount: 1,
            loop: true
        },
        "SHOTGUN_DOWN": {
            sizeX: 32,
            sizeY: 32,
            locationX: 192,
            locationY: 96,
            framecount: 1,
            loop: true
        },
        "SHOTGUN_FORWARD": {
            sizeX: 32,
            sizeY: 32,
            locationX: 224,
            locationY: 96,
            framecount: 1,
            loop: true
        },
        "SMG_UP": {
            sizeX: 32,
            sizeY: 32,
            locationX: 256,
            locationY: 64,
            framecount: 1,
            loop: true
        },
        "SMG_DOWN": {
            sizeX: 32,
            sizeY: 32,
            locationX: 192,
            locationY: 64,
            framecount: 1,
            loop: true
        },
        "SMG_FORWARD": {
            sizeX: 32,
            sizeY: 32,
            locationX: 224,
            locationY: 64,
            framecount: 1,
            loop: true
        },
        "SMG_BACK": {
            sizeX: 32,
            sizeY: 32,
            locationX: 288,
            locationY: 64,
            framecount: 1,
            loop: true
        },
        "INVISIBLE": {
            sizeX: 32,
            sizeY: 32,
            locationX: 64,
            locationY: 288,
            framecount: 1,
            loop: false
        }
    };
    GumiGame.Gun = Gun;
    class Bullet extends GumiGame.Character {
        constructor(_name, _pos, _direction) {
            super(_name);
            this.velocity = 10;
            this.kill = false;
            this.lifeTime = 4;
            this.currentLifeTime = 0;
            this.update = (_event) => {
                let timeFrame = GumiGame.ƒ.Loop.timeFrameGame / 1000;
                let distance = GumiGame.ƒ.Vector3.SCALE(this.speed, timeFrame);
                this.cmpTransform.local.translate(distance);
                this.currentLifeTime += timeFrame;
                if (this.currentLifeTime > this.lifeTime) {
                    let parent = this.getParent();
                    GumiGame.ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    parent.removeChild(this);
                }
                this.checkCollision();
            };
            let img = document.querySelector("#Bullet");
            let txtBullet = new GumiGame.ƒ.TextureImage();
            txtBullet.image = img;
            let coat = new GumiGame.ƒ.CoatTextured();
            coat.texture = txtBullet;
            let material = new GumiGame.ƒ.Material("bullet", GumiGame.ƒ.ShaderTexture, coat);
            let mesh = new GumiGame.ƒ.MeshSprite();
            this.cmpTransform.local.scale(new GumiGame.ƒ.Vector3(0.3, 0.3, 0.3));
            this.addComponent(new GumiGame.ƒ.ComponentMaterial(material));
            let cmpMesh = new GumiGame.ƒ.ComponentMesh(mesh);
            this.addComponent(cmpMesh);
            this.cmpTransform.local.translation = _pos;
            if (_direction != null) {
                switch (_direction) {
                    case GumiGame.DIRECTION.LEFT:
                        this.cmpTransform.local.rotateZ(180);
                        break;
                    case GumiGame.DIRECTION.RIGHT:
                        this.cmpTransform.local.rotateZ(0);
                        break;
                    case GumiGame.DIRECTION.UP:
                        this.cmpTransform.local.rotateZ(90);
                        break;
                    case GumiGame.DIRECTION.DOWN:
                        this.cmpTransform.local.rotateZ(-90);
                        break;
                }
                this.speed.x = this.velocity;
                GumiGame.ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
            }
        }
        act(_action) {
            switch (_action) {
                case BULLETACTION.SHOTGUN:
                    this.speed = GumiGame.ƒ.Vector3.ZERO();
                    this.kill = true;
                    break;
            }
            this.sprites.show(_action);
        }
        setPosition(_pos) {
            this.cmpTransform.local.translation = _pos;
        }
        checkCollision() {
            for (let child of GumiGame.level.getChildren()) {
                if (child instanceof GumiGame.Platform) {
                    let rect = child.getRectWorld();
                    let hit = rect.isInside(this.cmpTransform.local.translation.toVector2());
                    if (hit) {
                        let parent = this.getParent();
                        GumiGame.ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                        parent.removeChild(this);
                    }
                }
            }
        }
    }
    Bullet.bulletList = {
        "SMG": {
            sizeX: 32,
            sizeY: 32,
            locationX: 192,
            locationY: 128,
            framecount: 1,
            loop: true
        },
        "SHOTGUN": {
            sizeX: 32,
            sizeY: 32,
            locationX: 0,
            locationY: 256,
            framecount: 10,
            loop: false
        },
        "SMGIMPACT": {
            sizeX: 32,
            sizeY: 32,
            locationX: 224,
            locationY: 128,
            framecount: 1,
            loop: false
        }
    };
    GumiGame.Bullet = Bullet;
})(GumiGame || (GumiGame = {}));
//# sourceMappingURL=Guns.js.map