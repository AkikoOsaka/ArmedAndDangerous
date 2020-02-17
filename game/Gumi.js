var GumiGame;
(function (GumiGame) {
    let GUMIACTION;
    (function (GUMIACTION) {
        GUMIACTION["IDLE_FORWARD"] = "IDLE_FORWARD";
        GUMIACTION["IDLE_BACK"] = "IDLE_FORWARD";
        GUMIACTION["IDLE_UP"] = "IDLE_UP";
        GUMIACTION["IDLE_DOWN"] = "IDLE_DOWN";
        GUMIACTION["WALK_FORWARD"] = "WALK_FORWARD";
        GUMIACTION["WALK_BACK"] = "WALK_FORWARD";
        GUMIACTION["WALK_UP"] = "WALK_UP";
        GUMIACTION["WALK_DOWN"] = "WALK_DOWN";
        GUMIACTION["JUMP_FORWARD"] = "JUMP_FORWARD";
        GUMIACTION["JUMP_UP"] = "JUMP_UP";
        GUMIACTION["JUMP_DOWN"] = "JUMP_DOWN";
        GUMIACTION["INTRO"] = "INTRO";
        GUMIACTION["DEAD"] = "DEAD";
    })(GUMIACTION || (GUMIACTION = {}));
    let PLAYERACTION;
    (function (PLAYERACTION) {
        PLAYERACTION["AIM_UP"] = "UP";
        PLAYERACTION["AIM_DOWN"] = "DOWN";
        PLAYERACTION["AIM_FORWARD"] = "FORWARD";
        PLAYERACTION["AIM_BACK"] = "BACK";
        PLAYERACTION["WALK"] = "WALK";
        PLAYERACTION["IDLE"] = "IDLE";
        PLAYERACTION["JUMP"] = "JUMP";
        PLAYERACTION["FALLING"] = "FALLING";
        PLAYERACTION["INTRO"] = "INTRO";
        PLAYERACTION["SHOOTING"] = "SHOOTING";
        PLAYERACTION["DEAD"] = "DEAD";
    })(PLAYERACTION = GumiGame.PLAYERACTION || (GumiGame.PLAYERACTION = {}));
    class Gumi extends GumiGame.Character {
        constructor(_name) {
            super(_name);
            this.smgPower = 0.1;
            this.smgShots = 30;
            this.smgMax = 30;
            this.shotgunPower = 0.5;
            this.jumpVel = 4;
            this.direction = 1;
            this.invincible = false;
            this.invincibilityTimer = 0;
            this.invincibilityTime = 4; //sec
            this.life = 10;
            this.update = (_event) => {
                if (this.action != PLAYERACTION.INTRO && this.action != PLAYERACTION.DEAD) {
                    let timeFrame = GumiGame.ƒ.Loop.timeFrameGame / 1000;
                    if (this.invincible) {
                        this.invincibilityTimer -= timeFrame;
                        if (this.invincibilityTimer <= 0) {
                            this.invincible = false;
                            this.sprites.setBlinking(false);
                            this.guns.sprites.setBlinking(false);
                        }
                    }
                    this.smgShots += timeFrame * 1.5;
                    if (this.smgShots > this.smgMax)
                        this.smgShots = this.smgMax;
                    if (this.smgShots < 0)
                        this.smgShots = 0;
                    GumiGame.hud.updateBullets(Math.round(this.smgShots));
                    this.speed.y -= GumiGame.gravity * timeFrame;
                    if (this.speed.y < -(GumiGame.gravity * timeFrame + 0.1) && this.airborne == false) {
                        this.airborne = true;
                    }
                    if (this.speed.y > GumiGame.Character.maxVelY) {
                        this.speed.y = GumiGame.Character.maxVelY;
                    }
                    if (this.speed.y < -GumiGame.Character.maxVelY) {
                        this.speed.y = -GumiGame.Character.maxVelY;
                    }
                    if (this.speed.x > GumiGame.Character.maxVelX) {
                        this.speed.x = GumiGame.Character.maxVelX;
                    }
                    if (this.speed.x < -GumiGame.Character.maxVelX) {
                        this.speed.x = -GumiGame.Character.maxVelX;
                    }
                    this.broadcastEvent(new CustomEvent("showNext"));
                    this.moveTo();
                    let rect = this.getRectWorld();
                    // console.log("Hurtbox Pos: " + rect.position + " Hurtbox Scale: " + rect.size);
                    // console.log("Player Position: " + this.cmpTransform.local.translation);
                    // console.log("Current Number of Shots: " + Math.round(this.smgShots));
                    this.checkCollision();
                }
                else if (this.action == PLAYERACTION.INTRO) {
                    if (this.sprites.getAnimationStatus() == GumiGame.STATUS.FINISHED) {
                        this.action = PLAYERACTION.IDLE;
                        this.act(PLAYERACTION.IDLE);
                    }
                }
            };
            this.smg = true;
            let img = document.querySelector("img");
            let txtGumi = new GumiGame.ƒ.TextureImage();
            txtGumi.image = img;
            this.sprites = new GumiGame.AnimatedSprite("GumiSprites");
            this.sprites.appendSprites(GumiGame.AnimatedSprite.generateSprites(txtGumi, Gumi.spriteList), Gumi.spriteList);
            this.appendChild(this.sprites);
            this.sprites.show(GUMIACTION.INTRO);
            this.aim = PLAYERACTION.AIM_FORWARD;
            this.action = PLAYERACTION.INTRO;
            this.guns = new GumiGame.Gun("Guns");
            this.appendChild(this.guns);
            this.guns.act(GumiGame.GUNACTION.INVISIBLE);
            GumiGame.ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
            this.hurtboxNode = new GumiGame.ƒ.Node("Hurtbox");
            // let material = new ƒ.Material("Floor", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("blue", 0.5)));
            this.hurtbox = new GumiGame.ƒ.MeshSprite();
            // this.hurtboxNode.addComponent(new ƒ.ComponentMaterial(material));
            let cmpMesh = new GumiGame.ƒ.ComponentMesh(this.hurtbox);
            this.hurtboxNode.addComponent(cmpMesh);
            this.hurtboxNode.addComponent(new GumiGame.ƒ.ComponentTransform());
            this.hurtboxNode.cmpTransform.local.scaleY(0.6);
            this.hurtboxNode.cmpTransform.local.scaleX(0.5);
            this.hurtboxNode.cmpTransform.local.translateY(0.3);
            this.appendChild(this.hurtboxNode);
            GumiGame.hud.initHearts(this.life);
            GumiGame.hud.initBullets(this.smgShots);
        }
        setDifficulty(_hearts, _bullets) {
            this.smgMax = _bullets;
            this.smgShots = _bullets;
            this.life = _hearts;
            GumiGame.hud.updateHearts(this.life);
            GumiGame.hud.updateBullets(Math.round(this.smgShots));
        }
        act(_action, _direction) {
            if (this.action != PLAYERACTION.INTRO && this.action != PLAYERACTION.DEAD) {
                if (_action == PLAYERACTION.AIM_UP || _action == PLAYERACTION.AIM_DOWN || _action == PLAYERACTION.AIM_FORWARD || _action == PLAYERACTION.AIM_BACK) {
                    this.aim = _action;
                }
                if (_action == PLAYERACTION.IDLE || _action == PLAYERACTION.WALK || _action == PLAYERACTION.JUMP) {
                    this.action = _action;
                }
                if (_action == PLAYERACTION.SHOOTING) {
                    if (this.smgShots > 0.9) {
                        this.smgShots -= 1;
                        let bullet;
                        switch (this.aim) {
                            case PLAYERACTION.AIM_UP:
                                bullet = new GumiGame.Bullet("Bullet", this.cmpTransform.local.translation, GumiGame.DIRECTION.UP);
                                GumiGame.entities.appendChild(bullet);
                                bullet.cmpTransform.local.translation = this.cmpTransform.local.translation;
                                bullet.cmpTransform.local.translateY(0.8);
                                bullet.cmpTransform.local.translateX(-0.2);
                                this.speed.y -= GumiGame.gravity / 2 + this.smgPower;
                                break;
                            case PLAYERACTION.AIM_FORWARD:
                                bullet = new GumiGame.Bullet("Bullet", this.cmpTransform.local.translation, GumiGame.DIRECTION.RIGHT);
                                GumiGame.entities.appendChild(bullet);
                                bullet.cmpTransform.local.translation = this.cmpTransform.local.translation;
                                if (this.direction == -1) {
                                    bullet.cmpTransform.local.translateY(0.1);
                                    bullet.cmpTransform.local.translateX(0.7);
                                }
                                else {
                                    bullet.cmpTransform.local.translateY(0.2);
                                    bullet.cmpTransform.local.translateX(0.4);
                                }
                                this.speed.x -= GumiGame.gravity / 2 + this.smgPower;
                                break;
                            case PLAYERACTION.AIM_DOWN:
                                bullet = new GumiGame.Bullet("Bullet", this.cmpTransform.local.translation, GumiGame.DIRECTION.DOWN);
                                GumiGame.entities.appendChild(bullet);
                                bullet.cmpTransform.local.translation = this.cmpTransform.local.translation;
                                bullet.cmpTransform.local.translateX(-0.1);
                                bullet.cmpTransform.local.translateY(-0.3);
                                this.speed.y += GumiGame.gravity / 2 + this.smgPower;
                                this.airborne = true;
                                break;
                            case PLAYERACTION.AIM_BACK:
                                bullet = new GumiGame.Bullet("Bullet", this.cmpTransform.local.translation, GumiGame.DIRECTION.LEFT);
                                GumiGame.entities.appendChild(bullet);
                                bullet.cmpTransform.local.translation = this.cmpTransform.local.translation;
                                if (this.direction == 1) {
                                    bullet.cmpTransform.local.translateY(0.1);
                                    bullet.cmpTransform.local.translateX(-0.7);
                                }
                                else {
                                    bullet.cmpTransform.local.translateY(0.2);
                                    bullet.cmpTransform.local.translateX(0.4);
                                }
                                this.speed.x += GumiGame.gravity / 2 + this.smgPower;
                                break;
                        }
                    }
                }
                if (GUMIACTION[this.action + "_" + this.aim]) {
                    this.sprites.show(GUMIACTION[this.action + "_" + this.aim]);
                }
                else {
                    this.sprites.show(GUMIACTION.IDLE_FORWARD);
                }
                if (_direction) {
                    this.direction = (_direction == GumiGame.DIRECTION.RIGHT ? 1 : -1);
                    this.cmpTransform.local.rotation = GumiGame.ƒ.Vector3.Y(90 - 90 * this.direction);
                    this.guns.act(this.guns.getCurrentAction(), _direction);
                }
                let timeFrame = GumiGame.ƒ.Loop.timeFrameGame / 1000;
                switch (this.action) {
                    case PLAYERACTION.IDLE:
                        if (this.speed.x < 0) {
                            // console.log("Correctiong speed by: " + Character.maxVelX * timeFrame * 2);
                            this.speed.x += GumiGame.Character.maxVelX * timeFrame / 2;
                        }
                        if (this.speed.x > 0)
                            this.speed.x -= GumiGame.Character.maxVelX * timeFrame / 2;
                        if (this.speed.x < 0.1 && this.speed.x > -0.1)
                            this.speed.x = 0;
                        break;
                    case PLAYERACTION.WALK:
                        this.speed.x += GumiGame.Character.maxVelX * timeFrame * this.direction;
                        break;
                    case PLAYERACTION.JUMP:
                        if (!this.airborne) {
                            this.speed.y = this.jumpVel;
                            this.airborne = true;
                        }
                        break;
                }
                let weapon = (this.smg ? "SMG" : "SHOTGUN");
                this.guns.act(weapon + "_" + this.aim);
            }
            if (_action == PLAYERACTION.DEAD) {
                this.action = PLAYERACTION.DEAD;
                this.sprites.show(GUMIACTION.DEAD);
                this.guns.act(GumiGame.GUNACTION.INVISIBLE);
            }
        }
        getDirection() {
            if (this.direction == 1)
                return GumiGame.DIRECTION.RIGHT;
            else
                return GumiGame.DIRECTION.LEFT;
        }
        getRectWorld() {
            let rect = GumiGame.ƒ.Rectangle.GET(0, 0, 100, 100);
            let pos = this.hurtboxNode.cmpTransform.local.translation;
            let scl = this.hurtboxNode.cmpTransform.local.scaling;
            let topleft = new GumiGame.ƒ.Vector3((pos.x - scl.x / 2), (pos.y), (pos.z));
            let bottomright = new GumiGame.ƒ.Vector3((pos.x + scl.x / 2), (pos.y - scl.y), (pos.z));
            let pivot = this.hurtboxNode.getComponent(GumiGame.ƒ.ComponentMesh).pivot;
            let mtxResult = GumiGame.ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, pivot);
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);
            let size = new GumiGame.ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;
            return rect;
        }
        moveTo() {
            // console.clear();
            let timeFrame = GumiGame.ƒ.Loop.timeFrameGame / 1000;
            let currentPos = this.cmpTransform.local.translation;
            let originalPos = this.cmpTransform.local.translation;
            let distance = GumiGame.ƒ.Vector3.SCALE(this.speed, timeFrame);
            let distanceX = GumiGame.ƒ.Vector3.SCALE(new GumiGame.ƒ.Vector3(this.speed.x, 0, 0), timeFrame);
            let distanceY = GumiGame.ƒ.Vector3.SCALE(new GumiGame.ƒ.Vector3(0, this.speed.y, 0), timeFrame);
            let translation = GumiGame.ƒ.Vector3.SUM(currentPos, distance);
            // console.log("Current Speed: " + this.speed);
            let collisionsY = [];
            let scaleY = [];
            let collisionsX = [];
            let scaleX = [];
            for (let child of GumiGame.level.getChildren()) {
                if (child instanceof GumiGame.Platform) {
                    let distanceToPlatform = GumiGame.ƒ.Vector3.DIFFERENCE(translation, child.cmpTransform.local.translation);
                    if (distanceToPlatform.magnitude < GumiGame.tileSize * 2) {
                        // console.clear();
                        // console.log("Distance to platform: " + distanceToPlatform.magnitude);
                        let rect = child.getRectWorld();
                        let hit = false;
                        let tweenPos = currentPos;
                        let scaledDirectionX = GumiGame.ƒ.Vector3.SCALE(distanceX, 1);
                        let scaledDirectionY = GumiGame.ƒ.Vector3.SCALE(distanceY, 1);
                        for (let i = 1; i >= 0; i -= 0.25) {
                            scaledDirectionY = GumiGame.ƒ.Vector3.SCALE(distanceY, i);
                            tweenPos = GumiGame.ƒ.Vector3.SUM(currentPos, scaledDirectionY);
                            if (rect.isInside(tweenPos.toVector2())) {
                                hit = true;
                                collisionsY.push(child);
                                scaleY.push(i);
                            }
                        }
                        for (let i = 1; i >= 0; i -= 0.25) {
                            scaledDirectionX = GumiGame.ƒ.Vector3.SCALE(distanceX, i);
                            tweenPos = GumiGame.ƒ.Vector3.SUM(currentPos, scaledDirectionX);
                            if (rect.isInside(tweenPos.toVector2())) {
                                hit = true;
                                // console.log("Collision with Platform in X Direction: " + child.name);
                                collisionsX.push(child);
                                scaleX.push(i);
                            }
                        }
                    }
                }
                if (scaleY.length != 0) {
                    let indexY = 0;
                    for (let i = 0; i < scaleY.length - 1; i++) {
                        if (scaleY[i] < scaleY[indexY])
                            indexY = i;
                    }
                    let closestPlatform = collisionsY[indexY];
                    if (originalPos.y > closestPlatform.getTopleft().y) {
                        translation.y = closestPlatform.getTopleft().y + 0.025;
                        this.airborne = false;
                        // console.log("Set atop of the Platform");
                    }
                    else if (originalPos.y < closestPlatform.getBottomright().y) {
                        translation.y = closestPlatform.getBottomright().y - 0.025;
                        // console.log("Set at bottom of the Platform");
                    }
                    this.speed.y = 0;
                }
                if (scaleX.length != 0) {
                    let indexX = 0;
                    for (let i = 0; i < scaleX.length - 1; i++) {
                        if (scaleX[i] < scaleX[indexX])
                            indexX = i;
                    }
                    let closestPlatform = collisionsX[indexX];
                    this.speed.x = 0;
                    //Left
                    if (originalPos.x < closestPlatform.getTopleft().x) {
                        translation.x = closestPlatform.getTopleft().x - 0.025;
                        // console.log("Set next to Left Wall of the Platform");
                    }
                    //Right
                    if (originalPos.x > closestPlatform.getBottomright().x) {
                        translation.x = closestPlatform.getBottomright().x + 0.025;
                        // console.log("Set next to Right Wall of the Platform");
                    }
                }
            }
            this.cmpTransform.local.translation = translation;
        }
        checkCollision() {
            if (!this.invincible) {
                let hurboxRect = this.getRectWorld();
                for (let child of GumiGame.entities.getChildren()) {
                    if (child instanceof GumiGame.Eyebot || child instanceof GumiGame.Slime) {
                        let hit = hurboxRect.isInside(child.cmpTransform.local.translation.toVector2());
                        if (hit) {
                            this.life--;
                            GumiGame.hud.updateHearts(this.life);
                            if (this.life <= 0) {
                                this.life = 0;
                                this.act(PLAYERACTION.DEAD);
                                this.action = PLAYERACTION.DEAD;
                                let deathEvent = new CustomEvent("GameOver", { detail: this.life, bubbles: true });
                                this.dispatchEvent(deathEvent);
                            }
                            this.invincible = true;
                            this.sprites.setBlinking(true);
                            this.guns.sprites.setBlinking(true);
                            this.invincibilityTimer = this.invincibilityTime;
                        }
                    }
                    else if (child instanceof GumiGame.Exit) {
                        let hit = hurboxRect.isInside(child.cmpTransform.local.translation.toVector2());
                        if (hit) {
                            this.act(PLAYERACTION.DEAD);
                            this.action = PLAYERACTION.DEAD;
                            let escapeEvent = new CustomEvent("GameOver", { detail: this.life, bubbles: true });
                            this.dispatchEvent(escapeEvent);
                        }
                    }
                }
            }
        }
    }
    Gumi.spriteList = {
        "INTRO": {
            sizeX: 32,
            sizeY: 32,
            locationX: 0,
            locationY: 0,
            framecount: 20,
            loop: false
        },
        "IDLE_FORWARD": {
            sizeX: 32,
            sizeY: 32,
            locationX: 0,
            locationY: 64,
            framecount: 6,
            loop: true
        },
        "IDLE_UP": {
            sizeX: 32,
            sizeY: 32,
            locationX: 0,
            locationY: 128,
            framecount: 6,
            loop: true
        },
        "IDLE_DOWN": {
            sizeX: 32,
            sizeY: 32,
            locationX: 0,
            locationY: 192,
            framecount: 6,
            loop: true
        },
        "WALK_FORWARD": {
            sizeX: 32,
            sizeY: 32,
            locationX: 0,
            locationY: 96,
            framecount: 6,
            loop: true
        },
        "WALK_UP": {
            sizeX: 32,
            sizeY: 32,
            locationX: 0,
            locationY: 160,
            framecount: 6,
            loop: true
        },
        "WALK_DOWN": {
            sizeX: 32,
            sizeY: 32,
            locationX: 0,
            locationY: 224,
            framecount: 6,
            loop: true
        },
        "JUMP_FORWARD": {
            sizeX: 32,
            sizeY: 32,
            locationX: 96,
            locationY: 96,
            framecount: 1,
            loop: true
        },
        "JUMP_UP": {
            sizeX: 32,
            sizeY: 32,
            locationX: 96,
            locationY: 160,
            framecount: 1,
            loop: true
        },
        "JUMP_DOWN": {
            sizeX: 32,
            sizeY: 32,
            locationX: 96,
            locationY: 224,
            framecount: 1,
            loop: true
        },
        "DEAD": {
            sizeX: 32,
            sizeY: 32,
            locationX: 0,
            locationY: 256,
            framecount: 10,
            loop: false
        }
    };
    GumiGame.Gumi = Gumi;
})(GumiGame || (GumiGame = {}));
//# sourceMappingURL=Gumi.js.map