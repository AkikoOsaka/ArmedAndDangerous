namespace GumiGame {

    enum GUMIACTION {
        IDLE_FORWARD = "IDLE_FORWARD",
        IDLE_BACK = "IDLE_FORWARD",
        IDLE_UP = "IDLE_UP",
        IDLE_DOWN = "IDLE_DOWN",
        WALK_FORWARD = "WALK_FORWARD",
        WALK_BACK = "WALK_FORWARD",
        WALK_UP = "WALK_UP",
        WALK_DOWN = "WALK_DOWN",
        JUMP_FORWARD = "JUMP_FORWARD",
        JUMP_UP = "JUMP_UP",
        JUMP_DOWN = "JUMP_DOWN",
        INTRO = "INTRO",
        DEAD = "DEAD"
    }

    export enum PLAYERACTION {
        AIM_UP = "UP",
        AIM_DOWN = "DOWN",
        AIM_FORWARD = "FORWARD",
        AIM_BACK = "BACK",
        WALK = "WALK",
        IDLE = "IDLE",
        JUMP = "JUMP",
        FALLING = "FALLING",
        INTRO = "INTRO",
        SHOOTING = "SHOOTING",
        DEAD = "DEAD"
    }

    export class Gumi extends Character {

        static spriteList: SpriteList = {
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

        protected sprites: AnimatedSprite;
        private guns: Gun;
        private aim: string;
        private action: string;
        private smg: boolean;
        private smgPower: number = 0.1;
        private smgShots: number = 30;
        private smgMax: number = 30;

        private shotgunPower: number = 0.5;
        private airborne: boolean;
        private jumpVel: number = 4;
        private direction: number = 1;

        private hurtbox: ƒ.Mesh;
        private hurtboxNode: ƒ.Node;
        private invincible: boolean = false;
        private invincibilityTimer: number = 0;
        private invincibilityTime: number = 4; //sec
        private life: number = 10;
        constructor(_name: string) {
            super(_name);

            this.smg = true;
            let img: HTMLImageElement = document.querySelector("img");
            let txtGumi: ƒ.TextureImage = new ƒ.TextureImage();
            txtGumi.image = img;

            this.sprites = new AnimatedSprite("GumiSprites");
            this.sprites.appendSprites(AnimatedSprite.generateSprites(txtGumi, Gumi.spriteList), Gumi.spriteList);
            this.appendChild(this.sprites);

            this.sprites.show(GUMIACTION.INTRO);
            this.aim = PLAYERACTION.AIM_FORWARD;
            this.action = PLAYERACTION.INTRO;
            this.guns = new Gun("Guns");
            this.appendChild(this.guns);
            this.guns.act(GUNACTION.INVISIBLE);
            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);

            this.hurtboxNode = new ƒ.Node("Hurtbox");
            // let material = new ƒ.Material("Floor", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("blue", 0.5)));
            this.hurtbox = new ƒ.MeshSprite();
            // this.hurtboxNode.addComponent(new ƒ.ComponentMaterial(material));
            let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(this.hurtbox);
            this.hurtboxNode.addComponent(cmpMesh);
            this.hurtboxNode.addComponent(new ƒ.ComponentTransform());
            this.hurtboxNode.cmpTransform.local.scaleY(0.6);
            this.hurtboxNode.cmpTransform.local.scaleX(0.5);
            this.hurtboxNode.cmpTransform.local.translateY(0.3);
            this.appendChild(this.hurtboxNode);

            hud.initHearts(this.life);
            hud.initBullets(this.smgShots);
        }
        public setDifficulty(_hearts: number, _bullets: number): void {
            this.smgMax = _bullets;
            this.smgShots = _bullets;
            this.life = _hearts;
            hud.updateHearts(this.life);
            hud.updateBullets(Math.round(this.smgShots));
        }
        public act(_action: string, _direction?: DIRECTION): void {
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
                        let bullet: Bullet;
                        switch (this.aim) {
                            case PLAYERACTION.AIM_UP:
                                bullet = new Bullet("Bullet", this.cmpTransform.local.translation, DIRECTION.UP);
                                entities.appendChild(bullet);
                                bullet.cmpTransform.local.translation = this.cmpTransform.local.translation;
                                bullet.cmpTransform.local.translateY(0.8);
                                bullet.cmpTransform.local.translateX(-0.2);
                                this.speed.y -= gravity / 2 + this.smgPower;
                                break;
                            case PLAYERACTION.AIM_FORWARD:
                                bullet = new Bullet("Bullet", this.cmpTransform.local.translation, DIRECTION.RIGHT);
                                entities.appendChild(bullet);
                                bullet.cmpTransform.local.translation = this.cmpTransform.local.translation;
                                if (this.direction == -1) {
                                    bullet.cmpTransform.local.translateY(0.1);
                                    bullet.cmpTransform.local.translateX(0.7);
                                }
                                else {
                                    bullet.cmpTransform.local.translateY(0.2);
                                    bullet.cmpTransform.local.translateX(0.4);
                                }
                                this.speed.x -= gravity / 2 + this.smgPower;
                                break;
                            case PLAYERACTION.AIM_DOWN:
                                bullet = new Bullet("Bullet", this.cmpTransform.local.translation, DIRECTION.DOWN);
                                entities.appendChild(bullet);
                                bullet.cmpTransform.local.translation = this.cmpTransform.local.translation;
                                bullet.cmpTransform.local.translateX(-0.1);
                                bullet.cmpTransform.local.translateY(-0.3);
                                this.speed.y += gravity / 2 + this.smgPower;
                                this.airborne = true;
                                break;
                            case PLAYERACTION.AIM_BACK:
                                bullet = new Bullet("Bullet", this.cmpTransform.local.translation, DIRECTION.LEFT);
                                entities.appendChild(bullet);
                                bullet.cmpTransform.local.translation = this.cmpTransform.local.translation;
                                if (this.direction == 1) {
                                    bullet.cmpTransform.local.translateY(0.1);
                                    bullet.cmpTransform.local.translateX(-0.7);
                                }
                                else {
                                    bullet.cmpTransform.local.translateY(0.2);
                                    bullet.cmpTransform.local.translateX(0.4);
                                }

                                this.speed.x += gravity / 2 + this.smgPower;
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
                    this.direction = (_direction == DIRECTION.RIGHT ? 1 : -1);
                    this.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * this.direction);
                    this.guns.act(this.guns.getCurrentAction(), _direction);
                }
                let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
                switch (this.action) {
                    case PLAYERACTION.IDLE:
                        if (this.speed.x < 0) {
                            // console.log("Correctiong speed by: " + Character.maxVelX * timeFrame * 2);
                            this.speed.x += Character.maxVelX * timeFrame / 2;
                        }
                        if (this.speed.x > 0)
                            this.speed.x -= Character.maxVelX * timeFrame / 2;
                        if (this.speed.x < 0.1 && this.speed.x > -0.1)
                            this.speed.x = 0;
                        break;
                    case PLAYERACTION.WALK:
                        this.speed.x += Character.maxVelX * timeFrame * this.direction;
                        break;
                    case PLAYERACTION.JUMP:
                        if (!this.airborne) {
                            this.speed.y = this.jumpVel;
                            this.airborne = true;
                        }
                        break;
                }
                let weapon: string = (this.smg ? "SMG" : "SHOTGUN");
                this.guns.act(weapon + "_" + this.aim);
            }
            if (_action == PLAYERACTION.DEAD) {
                this.action = PLAYERACTION.DEAD;
                this.sprites.show(GUMIACTION.DEAD);
                this.guns.act(GUNACTION.INVISIBLE);
            }
        }
        public getDirection(): DIRECTION {
            if (this.direction == 1)
                return DIRECTION.RIGHT;
            else
                return DIRECTION.LEFT;
        }

        public getRectWorld(): ƒ.Rectangle {
            let rect: ƒ.Rectangle = ƒ.Rectangle.GET(0, 0, 100, 100);
            let pos: ƒ.Vector3 = this.hurtboxNode.cmpTransform.local.translation;
            let scl: ƒ.Vector3 = this.hurtboxNode.cmpTransform.local.scaling;
            let topleft: ƒ.Vector3 = new ƒ.Vector3((pos.x - scl.x / 2), (pos.y), (pos.z));
            let bottomright: ƒ.Vector3 = new ƒ.Vector3((pos.x + scl.x / 2), (pos.y - scl.y), (pos.z));

            let pivot: ƒ.Matrix4x4 = this.hurtboxNode.getComponent(ƒ.ComponentMesh).pivot;

            let mtxResult: ƒ.Matrix4x4 = ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, pivot);
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);

            let size: ƒ.Vector2 = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;

            return rect;
        }

        protected update = (_event: ƒ.Eventƒ): void => {
            if (this.action != PLAYERACTION.INTRO && this.action != PLAYERACTION.DEAD) {
                let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
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
                hud.updateBullets(Math.round(this.smgShots));
                this.speed.y -= gravity * timeFrame;

                if (this.speed.y < -(gravity * timeFrame + 0.1) && this.airborne == false) {
                    this.airborne = true;
                }
                if (this.speed.y > Character.maxVelY) {
                    this.speed.y = Character.maxVelY;
                }
                if (this.speed.y < -Character.maxVelY) {
                    this.speed.y = -Character.maxVelY;
                }
                if (this.speed.x > Character.maxVelX) {
                    this.speed.x = Character.maxVelX;
                }
                if (this.speed.x < -Character.maxVelX) {
                    this.speed.x = -Character.maxVelX;
                }
                this.broadcastEvent(new CustomEvent("showNext"));
                this.moveTo();

                let rect: ƒ.Rectangle = this.getRectWorld();
                // console.log("Hurtbox Pos: " + rect.position + " Hurtbox Scale: " + rect.size);
                // console.log("Player Position: " + this.cmpTransform.local.translation);
                // console.log("Current Number of Shots: " + Math.round(this.smgShots));
                this.checkCollision();
            }
            else if (this.action == PLAYERACTION.INTRO) {
                if (this.sprites.getAnimationStatus() == STATUS.FINISHED) {
                    this.action = PLAYERACTION.IDLE;
                    this.act(PLAYERACTION.IDLE);
                }
            }
        }

        private moveTo(): void {
            // console.clear();
            let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
            let currentPos: ƒ.Vector3 = this.cmpTransform.local.translation;
            let originalPos: ƒ.Vector3 = this.cmpTransform.local.translation;
            let distance: ƒ.Vector3 = ƒ.Vector3.SCALE(this.speed, timeFrame);
            let distanceX: ƒ.Vector3 = ƒ.Vector3.SCALE(new ƒ.Vector3(this.speed.x, 0, 0), timeFrame);
            let distanceY: ƒ.Vector3 = ƒ.Vector3.SCALE(new ƒ.Vector3(0, this.speed.y, 0), timeFrame);
            let translation: ƒ.Vector3 = ƒ.Vector3.SUM(currentPos, distance);


            // console.log("Current Speed: " + this.speed);
            let collisionsY: Platform[] = [];
            let scaleY: number[] = [];
            let collisionsX: Platform[] = [];
            let scaleX: number[] = [];
            for (let child of level.getChildren()) {
                if (child instanceof Platform) {
                    let distanceToPlatform: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(translation, child.cmpTransform.local.translation);
                    if (distanceToPlatform.magnitude < tileSize * 2) {
                        // console.clear();
                        // console.log("Distance to platform: " + distanceToPlatform.magnitude);
                        let rect: ƒ.Rectangle = (<Platform>child).getRectWorld();
                        let hit: boolean = false;
                        let tweenPos: ƒ.Vector3 = currentPos;
                        let scaledDirectionX: ƒ.Vector3 = ƒ.Vector3.SCALE(distanceX, 1);
                        let scaledDirectionY: ƒ.Vector3 = ƒ.Vector3.SCALE(distanceY, 1);
                        for (let i: number = 1; i >= 0; i -= 0.25) {
                            scaledDirectionY = ƒ.Vector3.SCALE(distanceY, i);
                            tweenPos = ƒ.Vector3.SUM(currentPos, scaledDirectionY);
                            if (rect.isInside(tweenPos.toVector2())) {
                                hit = true;
                                collisionsY.push(child);
                                scaleY.push(i);
                            }
                        }
                        for (let i: number = 1; i >= 0; i -= 0.25) {
                            scaledDirectionX = ƒ.Vector3.SCALE(distanceX, i);
                            tweenPos = ƒ.Vector3.SUM(currentPos, scaledDirectionX);
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
                    let indexY: number = 0;

                    for (let i: number = 0; i < scaleY.length - 1; i++) {
                        if (scaleY[i] < scaleY[indexY])
                            indexY = i;
                    }

                    let closestPlatform: Platform = collisionsY[indexY];
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
                    let indexX: number = 0;

                    for (let i: number = 0; i < scaleX.length - 1; i++) {
                        if (scaleX[i] < scaleX[indexX])
                            indexX = i;
                    }
                    let closestPlatform: Platform = collisionsX[indexX];
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

        private checkCollision(): void {
            if (!this.invincible) {
                let hurboxRect: ƒ.Rectangle = this.getRectWorld();
                for (let child of entities.getChildren()) {
                    if (child instanceof Eyebot || child instanceof Slime) {
                        let hit: boolean = hurboxRect.isInside(child.cmpTransform.local.translation.toVector2());
                        if (hit) {
                            this.life--;
                            hud.updateHearts(this.life);
                            if (this.life <= 0) {
                                this.life = 0;
                                this.act(PLAYERACTION.DEAD);
                                this.action = PLAYERACTION.DEAD;
                                let deathEvent: CustomEvent = new CustomEvent("GameOver", { detail: this.life, bubbles: true });
                                this.dispatchEvent(deathEvent);
                            }
                            this.invincible = true;
                            this.sprites.setBlinking(true);
                            this.guns.sprites.setBlinking(true);
                            this.invincibilityTimer = this.invincibilityTime;
                        }
                    }
                    else if (child instanceof Exit) {
                        let hit: boolean = hurboxRect.isInside(child.cmpTransform.local.translation.toVector2());
                        if (hit) {
                            this.act(PLAYERACTION.DEAD);
                            this.action = PLAYERACTION.DEAD;
                            let escapeEvent: CustomEvent = new CustomEvent("GameOver", { detail: this.life, bubbles: true });
                            this.dispatchEvent(escapeEvent);
                        }
                    }

                }
            }
        }

    }
}