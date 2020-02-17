namespace GumiGame {
    export enum ENEMYACTION {
        IDLE = "IDLE",
        HURT = "HURT",
        DEATH = "DEATH"
    }
    export class Slime extends Character {
        static slimeList: SpriteList = {
            "IDLE": {
                sizeX: 16,
                sizeY: 16,
                locationX: 0,
                locationY: 0,
                framecount: 14,
                loop: true
            },
            "HURT": {
                sizeX: 16,
                sizeY: 16,
                locationX: 0,
                locationY: 32,
                framecount: 8,
                loop: false
            },
            "DEATH": {
                sizeX: 16,
                sizeY: 16,
                locationX: 0,
                locationY: 48,
                framecount: 8,
                loop: false
            }
        };


        private life: number = 10;
        private spawnPoint: ƒ.Vector3;
        private travelDistance: number = 4;
        private currentDirection: DIRECTION;
        private action: string;
        private airborne: boolean = false;

        private hurtbox: ƒ.Mesh;
        private hurtboxNode: ƒ.Node;
        constructor(_name: string) {
            super(_name);
            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
            let img: HTMLImageElement = document.querySelector("#Slime");
            let txtSlime: ƒ.TextureImage = new ƒ.TextureImage();
            txtSlime.image = img;
            this.sprites = new AnimatedSprite("SlimeSprites");

            this.sprites.appendSprites(AnimatedSprite.generateSprites(txtSlime, Slime.slimeList), Slime.slimeList);
            this.appendChild(this.sprites);

            this.sprites.show(ENEMYACTION.IDLE);

            this.setLocation(this.cmpTransform.local.translation);
            this.currentDirection = 1;
            this.speed = new ƒ.Vector3();

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
        }

        public setLocation(_pos: ƒ.Vector3): void {
            this.cmpTransform.local.translation = _pos;
            this.spawnPoint = _pos;
        }

        public act(_action: string, _direction?: DIRECTION): void {
            this.action = _action;
            if (_action == ENEMYACTION.IDLE) {
                if (_direction != null) {
                    this.currentDirection = (_direction == DIRECTION.RIGHT ? 1 : -1);
                    this.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * this.currentDirection);
                }
                let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
                this.speed.x += Character.maxVelX * timeFrame * this.currentDirection;
                this.sprites.show(_action);
            }
            if (_action == ENEMYACTION.HURT) {
                this.sprites.show(_action);
                (<NodeSprite>this.sprites.getChildrenByName(ENEMYACTION.HURT)[0]).start();
            }
            else if (_action == ENEMYACTION.DEATH) {
                this.sprites.show(_action);
                (<NodeSprite>this.sprites.getChildrenByName(ENEMYACTION.DEATH)[0]).start();
            }
            else {
                this.sprites.show(_action);
            }

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

        private update = (_event: Event): void => {
            let currentPos: ƒ.Vector3 = this.cmpTransform.local.translation;
            let distanceToPlayer: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(currentPos, playerCharacter.cmpTransform.local.translation);
            if (distanceToPlayer.magnitude < 5 * tileSize) {
                let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
                this.speed.y -= gravity * timeFrame;
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
                this.checkCollision();

                //Decide what to do
                if (this.action != ENEMYACTION.HURT && this.action != ENEMYACTION.DEATH) {
                    if (this.cmpTransform.local.translation.x < this.spawnPoint.x - this.travelDistance) {
                        this.act(ENEMYACTION.IDLE, DIRECTION.RIGHT);
                    }
                    else if (this.cmpTransform.local.translation.x > this.spawnPoint.x + this.travelDistance) {
                        this.act(ENEMYACTION.IDLE, DIRECTION.LEFT);
                    }
                    else {
                        this.act(ENEMYACTION.IDLE);
                    }
                }
                else {
                    this.speed.x = 0;
                    this.speed.y = 0;
                    if (this.action == ENEMYACTION.DEATH) {
                        console.log(this.sprites.getAnimationStatus());
                        if (this.sprites.getAnimationStatus() == STATUS.FINISHED) {
                            let parent: ƒ.Node = this.getParent();
                            ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
                            parent.removeChild(this);
                        }
                    }
                    if (this.action == ENEMYACTION.HURT) {
                        if (this.sprites.getAnimationStatus() == STATUS.FINISHED) {
                            this.action = ENEMYACTION.IDLE;
                            this.act(ENEMYACTION.IDLE);
                        }
                    }
                }
            }
        }

        private moveTo(): void {
            // console.clear();
            // console.log("Current Speed: " + this.speed);
            let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
            let currentPos: ƒ.Vector3 = this.cmpTransform.local.translation;
            let originalPos: ƒ.Vector3 = this.cmpTransform.local.translation;
            let distance: ƒ.Vector3 = ƒ.Vector3.SCALE(this.speed, timeFrame);
            let distanceX: ƒ.Vector3 = ƒ.Vector3.SCALE(new ƒ.Vector3(this.speed.x, 0, 0), timeFrame);
            let distanceY: ƒ.Vector3 = ƒ.Vector3.SCALE(new ƒ.Vector3(0, this.speed.y, 0), timeFrame);
            let translation: ƒ.Vector3 = ƒ.Vector3.SUM(currentPos, distance);

            let collisionsY: Platform[] = [];
            let scaleY: number[] = [];
            let collisionsX: Platform[] = [];
            let scaleX: number[] = [];
            for (let child of level.getChildren()) {
                if (child instanceof Platform) {
                    let distanceToPlatform: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(translation, child.cmpTransform.local.translation);
                    // console.log("Distance to platform: " + distanceToPlatform.magnitude);
                    if (distanceToPlatform.magnitude < tileSize * 2) {
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
                    }
                    else if (originalPos.y < closestPlatform.getBottomright().y) {
                        translation.y = closestPlatform.getBottomright().y - 0.025;

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
                        this.act(ENEMYACTION.IDLE, DIRECTION.LEFT);
                        // console.log("Set next to Left Wall of the Platform");
                    }

                    //Right
                    if (originalPos.x > closestPlatform.getBottomright().x) {
                        translation.x = closestPlatform.getBottomright().x + 0.025;
                        this.act(ENEMYACTION.IDLE, DIRECTION.RIGHT);
                        // console.log("Set next to Right Wall of the Platform");
                    }
                }

            }
            this.cmpTransform.local.translation = translation;
        }

        private checkCollision(): void {
            let hurboxRect: ƒ.Rectangle = this.getRectWorld();
            for (let child of entities.getChildren()) {

                let hit: boolean = hurboxRect.isInside(child.cmpTransform.local.translation.toVector2());
                if (hit) {
                    if (child.name != this.name) {
                        this.life -= 1;
                        if (this.life <= 0) {
                            this.act(ENEMYACTION.DEATH);
                        }
                        else {
                            this.act(ENEMYACTION.HURT);
                        }
                    }

                }
            }
        }
    }
    export class Eyebot extends Character {
        static botList: SpriteList = {
            "IDLE": {
                sizeX: 16,
                sizeY: 16,
                locationX: 0,
                locationY: 0,
                framecount: 14,
                loop: true
            },
            "HURT": {
                sizeX: 16,
                sizeY: 16,
                locationX: 0,
                locationY: 32,
                framecount: 1,
                loop: false
            },
            "DEATH": {
                sizeX: 16,
                sizeY: 16,
                locationX: 0,
                locationY: 32,
                framecount: 10,
                loop: false
            }
        };


        private life: number = 15;
        private spawnPoint: ƒ.Vector3;
        private travelDistance: number = 4;
        private currentDirection: DIRECTION;
        private action: string;

        private hurtbox: ƒ.Mesh;
        private hurtboxNode: ƒ.Node;
        constructor(_name: string) {
            super(_name);
            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
            let img: HTMLImageElement = document.querySelector("#Eyebot");
            let txtBot: ƒ.TextureImage = new ƒ.TextureImage();
            txtBot.image = img;
            this.sprites = new AnimatedSprite("EyebotSprite");

            this.sprites.appendSprites(AnimatedSprite.generateSprites(txtBot, Eyebot.botList), Eyebot.botList);
            this.appendChild(this.sprites);

            this.sprites.show(ENEMYACTION.IDLE);

            this.setLocation(this.cmpTransform.local.translation);
            this.currentDirection = 1;
            this.speed = new ƒ.Vector3();

            this.hurtboxNode = new ƒ.Node("Hurtbox");
            // let material: ƒ.Material = new ƒ.Material("Floor", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("blue", 0.5)));
            this.hurtbox = new ƒ.MeshSprite();
            // this.hurtboxNode.addComponent(new ƒ.ComponentMaterial(material));
            let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(this.hurtbox);
            this.hurtboxNode.addComponent(cmpMesh);
            this.hurtboxNode.addComponent(new ƒ.ComponentTransform());
            this.hurtboxNode.cmpTransform.local.scaleY(0.6);
            this.hurtboxNode.cmpTransform.local.scaleX(0.5);
            this.hurtboxNode.cmpTransform.local.translateY(0.3);
            this.appendChild(this.hurtboxNode);
        }

        public setLocation(_pos: ƒ.Vector3): void {
            this.cmpTransform.local.translation = _pos;
            this.spawnPoint = _pos;
        }

        public act(_action: string, _direction?: DIRECTION): void {
            this.action = _action;
            if (_action == ENEMYACTION.IDLE) {
                if (_direction != null) {
                    this.currentDirection = (_direction == DIRECTION.RIGHT ? 1 : -1);
                    this.cmpTransform.local.rotation = ƒ.Vector3.Y(90 - 90 * this.currentDirection);
                }
                let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
                this.speed.x += Character.maxVelX * timeFrame * this.currentDirection;
                this.sprites.show(_action);
            }
            if (_action == ENEMYACTION.HURT) {
                this.sprites.show(_action);
                (<NodeSprite>this.sprites.getChildrenByName(ENEMYACTION.HURT)[0]).start();
            }
            else if (_action == ENEMYACTION.DEATH) {
                this.sprites.show(_action);
                (<NodeSprite>this.sprites.getChildrenByName(ENEMYACTION.DEATH)[0]).start();
            }
            else {
                this.sprites.show(_action);
            }

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

        private update = (_event: Event): void => {
            let currentPos: ƒ.Vector3 = this.cmpTransform.local.translation;
            let distanceToPlayer: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(currentPos, playerCharacter.cmpTransform.local.translation);
            if (distanceToPlayer.magnitude < 5 * tileSize) {
                let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;

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
                this.checkCollision();

                //Decide what to do
                if (this.action != ENEMYACTION.HURT && this.action != ENEMYACTION.DEATH) {

                    if (distanceToPlayer.magnitude < 4 * tileSize) {
                        let directionX: number = distanceToPlayer.x < 0 ? 1 : -1;
                        this.speed.x += Character.maxVelX * directionX * timeFrame;
                        let directionY: number = distanceToPlayer.y < 0 ? 1 : -1;
                        this.speed.y += Character.maxVelX * directionY * timeFrame;
                    }
                    if (this.cmpTransform.local.translation.x < this.spawnPoint.x - this.travelDistance) {
                        this.act(ENEMYACTION.IDLE, DIRECTION.RIGHT);
                    }
                    else if (this.cmpTransform.local.translation.x > this.spawnPoint.x + this.travelDistance) {
                        this.act(ENEMYACTION.IDLE, DIRECTION.LEFT);
                    }
                    else {
                        this.act(ENEMYACTION.IDLE);
                    }
                }
                else {
                    if (this.action == ENEMYACTION.DEATH) {
                        console.log(this.sprites.getAnimationStatus());
                        if (this.sprites.getAnimationStatus() == STATUS.FINISHED) {
                            let parent: ƒ.Node = this.getParent();
                            ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
                            parent.removeChild(this);
                        }
                    }
                    if (this.action == ENEMYACTION.HURT) {
                        if (this.sprites.getAnimationStatus() == STATUS.FINISHED) {
                            this.action = ENEMYACTION.IDLE;
                            this.act(ENEMYACTION.IDLE);
                        }
                    }
                }
            }
        }

        private moveTo(): void {
            // console.clear();
            // console.log("Current Speed: " + this.speed);
            let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
            let currentPos: ƒ.Vector3 = this.cmpTransform.local.translation;
            let originalPos: ƒ.Vector3 = this.cmpTransform.local.translation;
            let distance: ƒ.Vector3 = ƒ.Vector3.SCALE(this.speed, timeFrame);
            let distanceX: ƒ.Vector3 = ƒ.Vector3.SCALE(new ƒ.Vector3(this.speed.x, 0, 0), timeFrame);
            let distanceY: ƒ.Vector3 = ƒ.Vector3.SCALE(new ƒ.Vector3(0, this.speed.y, 0), timeFrame);
            let translation: ƒ.Vector3 = ƒ.Vector3.SUM(currentPos, distance);

            let collisionsY: Platform[] = [];
            let scaleY: number[] = [];
            let collisionsX: Platform[] = [];
            let scaleX: number[] = [];
            for (let child of level.getChildren()) {
                if (child instanceof Platform) {
                    let distanceToPlatform: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(translation, child.cmpTransform.local.translation);
                    // console.log("Distance to platform: " + distanceToPlatform.magnitude);
                    if (distanceToPlatform.magnitude < tileSize * 2) {
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
                    }
                    else if (originalPos.y < closestPlatform.getBottomright().y) {
                        translation.y = closestPlatform.getBottomright().y - 0.025;

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
                        this.act(ENEMYACTION.IDLE, DIRECTION.LEFT);
                        // console.log("Set next to Left Wall of the Platform");
                    }

                    //Right
                    if (originalPos.x > closestPlatform.getBottomright().x) {
                        translation.x = closestPlatform.getBottomright().x + 0.025;
                        this.act(ENEMYACTION.IDLE, DIRECTION.RIGHT);
                        // console.log("Set next to Right Wall of the Platform");
                    }
                }

            }
            this.cmpTransform.local.translation = translation;
        }

        private checkCollision(): void {
            let hurboxRect: ƒ.Rectangle = this.getRectWorld();
            for (let child of entities.getChildren()) {

                let hit: boolean = hurboxRect.isInside(child.cmpTransform.local.translation.toVector2());
                if (hit) {
                    if (child.name != this.name) {
                        console.log(this.name + " Life Remaining: " + this.life);
                        this.life -= 1;
                        if (this.life <= 0) {
                            this.act(ENEMYACTION.DEATH);
                        }
                        else {
                            this.act(ENEMYACTION.HURT);
                        }
                    }

                }
            }
        }
    }
}