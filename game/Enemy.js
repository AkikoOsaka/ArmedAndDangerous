var GumiGame;
(function (GumiGame) {
    let ENEMYACTION;
    (function (ENEMYACTION) {
        ENEMYACTION["IDLE"] = "IDLE";
        ENEMYACTION["HURT"] = "HURT";
        ENEMYACTION["DEATH"] = "DEATH";
    })(ENEMYACTION = GumiGame.ENEMYACTION || (GumiGame.ENEMYACTION = {}));
    class Slime extends GumiGame.Character {
        constructor(_name) {
            super(_name);
            this.life = 10;
            this.travelDistance = 4;
            this.airborne = false;
            this.update = (_event) => {
                let currentPos = this.cmpTransform.local.translation;
                let distanceToPlayer = GumiGame.ƒ.Vector3.DIFFERENCE(currentPos, GumiGame.playerCharacter.cmpTransform.local.translation);
                if (distanceToPlayer.magnitude < 5 * GumiGame.tileSize) {
                    let timeFrame = GumiGame.ƒ.Loop.timeFrameGame / 1000;
                    this.speed.y -= GumiGame.gravity * timeFrame;
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
                    this.checkCollision();
                    //Decide what to do
                    if (this.action != ENEMYACTION.HURT && this.action != ENEMYACTION.DEATH) {
                        if (this.cmpTransform.local.translation.x < this.spawnPoint.x - this.travelDistance) {
                            this.act(ENEMYACTION.IDLE, GumiGame.DIRECTION.RIGHT);
                        }
                        else if (this.cmpTransform.local.translation.x > this.spawnPoint.x + this.travelDistance) {
                            this.act(ENEMYACTION.IDLE, GumiGame.DIRECTION.LEFT);
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
                            if (this.sprites.getAnimationStatus() == GumiGame.STATUS.FINISHED) {
                                let parent = this.getParent();
                                GumiGame.ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                                parent.removeChild(this);
                            }
                        }
                        if (this.action == ENEMYACTION.HURT) {
                            if (this.sprites.getAnimationStatus() == GumiGame.STATUS.FINISHED) {
                                this.action = ENEMYACTION.IDLE;
                                this.act(ENEMYACTION.IDLE);
                            }
                        }
                    }
                }
            };
            GumiGame.ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
            let img = document.querySelector("#Slime");
            let txtSlime = new GumiGame.ƒ.TextureImage();
            txtSlime.image = img;
            this.sprites = new GumiGame.AnimatedSprite("SlimeSprites");
            this.sprites.appendSprites(GumiGame.AnimatedSprite.generateSprites(txtSlime, Slime.slimeList), Slime.slimeList);
            this.appendChild(this.sprites);
            this.sprites.show(ENEMYACTION.IDLE);
            this.setLocation(this.cmpTransform.local.translation);
            this.currentDirection = 1;
            this.speed = new GumiGame.ƒ.Vector3();
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
        }
        setLocation(_pos) {
            this.cmpTransform.local.translation = _pos;
            this.spawnPoint = _pos;
        }
        act(_action, _direction) {
            this.action = _action;
            if (_action == ENEMYACTION.IDLE) {
                if (_direction != null) {
                    this.currentDirection = (_direction == GumiGame.DIRECTION.RIGHT ? 1 : -1);
                    this.cmpTransform.local.rotation = GumiGame.ƒ.Vector3.Y(90 - 90 * this.currentDirection);
                }
                let timeFrame = GumiGame.ƒ.Loop.timeFrameGame / 1000;
                this.speed.x += GumiGame.Character.maxVelX * timeFrame * this.currentDirection;
                this.sprites.show(_action);
            }
            if (_action == ENEMYACTION.HURT) {
                this.sprites.show(_action);
                this.sprites.getChildrenByName(ENEMYACTION.HURT)[0].start();
            }
            else if (_action == ENEMYACTION.DEATH) {
                this.sprites.show(_action);
                this.sprites.getChildrenByName(ENEMYACTION.DEATH)[0].start();
            }
            else {
                this.sprites.show(_action);
            }
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
            // console.log("Current Speed: " + this.speed);
            let timeFrame = GumiGame.ƒ.Loop.timeFrameGame / 1000;
            let currentPos = this.cmpTransform.local.translation;
            let originalPos = this.cmpTransform.local.translation;
            let distance = GumiGame.ƒ.Vector3.SCALE(this.speed, timeFrame);
            let distanceX = GumiGame.ƒ.Vector3.SCALE(new GumiGame.ƒ.Vector3(this.speed.x, 0, 0), timeFrame);
            let distanceY = GumiGame.ƒ.Vector3.SCALE(new GumiGame.ƒ.Vector3(0, this.speed.y, 0), timeFrame);
            let translation = GumiGame.ƒ.Vector3.SUM(currentPos, distance);
            let collisionsY = [];
            let scaleY = [];
            let collisionsX = [];
            let scaleX = [];
            for (let child of GumiGame.level.getChildren()) {
                if (child instanceof GumiGame.Platform) {
                    let distanceToPlatform = GumiGame.ƒ.Vector3.DIFFERENCE(translation, child.cmpTransform.local.translation);
                    // console.log("Distance to platform: " + distanceToPlatform.magnitude);
                    if (distanceToPlatform.magnitude < GumiGame.tileSize * 2) {
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
                    }
                    else if (originalPos.y < closestPlatform.getBottomright().y) {
                        translation.y = closestPlatform.getBottomright().y - 0.025;
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
                        this.act(ENEMYACTION.IDLE, GumiGame.DIRECTION.LEFT);
                        // console.log("Set next to Left Wall of the Platform");
                    }
                    //Right
                    if (originalPos.x > closestPlatform.getBottomright().x) {
                        translation.x = closestPlatform.getBottomright().x + 0.025;
                        this.act(ENEMYACTION.IDLE, GumiGame.DIRECTION.RIGHT);
                        // console.log("Set next to Right Wall of the Platform");
                    }
                }
            }
            this.cmpTransform.local.translation = translation;
        }
        checkCollision() {
            let hurboxRect = this.getRectWorld();
            for (let child of GumiGame.entities.getChildren()) {
                let hit = hurboxRect.isInside(child.cmpTransform.local.translation.toVector2());
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
    Slime.slimeList = {
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
    GumiGame.Slime = Slime;
    class Eyebot extends GumiGame.Character {
        constructor(_name) {
            super(_name);
            this.life = 15;
            this.travelDistance = 4;
            this.update = (_event) => {
                let currentPos = this.cmpTransform.local.translation;
                let distanceToPlayer = GumiGame.ƒ.Vector3.DIFFERENCE(currentPos, GumiGame.playerCharacter.cmpTransform.local.translation);
                if (distanceToPlayer.magnitude < 5 * GumiGame.tileSize) {
                    let timeFrame = GumiGame.ƒ.Loop.timeFrameGame / 1000;
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
                    this.checkCollision();
                    //Decide what to do
                    if (this.action != ENEMYACTION.HURT && this.action != ENEMYACTION.DEATH) {
                        if (distanceToPlayer.magnitude < 4 * GumiGame.tileSize) {
                            let directionX = distanceToPlayer.x < 0 ? 1 : -1;
                            this.speed.x += GumiGame.Character.maxVelX * directionX * timeFrame;
                            let directionY = distanceToPlayer.y < 0 ? 1 : -1;
                            this.speed.y += GumiGame.Character.maxVelX * directionY * timeFrame;
                        }
                        if (this.cmpTransform.local.translation.x < this.spawnPoint.x - this.travelDistance) {
                            this.act(ENEMYACTION.IDLE, GumiGame.DIRECTION.RIGHT);
                        }
                        else if (this.cmpTransform.local.translation.x > this.spawnPoint.x + this.travelDistance) {
                            this.act(ENEMYACTION.IDLE, GumiGame.DIRECTION.LEFT);
                        }
                        else {
                            this.act(ENEMYACTION.IDLE);
                        }
                    }
                    else {
                        if (this.action == ENEMYACTION.DEATH) {
                            console.log(this.sprites.getAnimationStatus());
                            if (this.sprites.getAnimationStatus() == GumiGame.STATUS.FINISHED) {
                                let parent = this.getParent();
                                GumiGame.ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                                parent.removeChild(this);
                            }
                        }
                        if (this.action == ENEMYACTION.HURT) {
                            if (this.sprites.getAnimationStatus() == GumiGame.STATUS.FINISHED) {
                                this.action = ENEMYACTION.IDLE;
                                this.act(ENEMYACTION.IDLE);
                            }
                        }
                    }
                }
            };
            GumiGame.ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
            let img = document.querySelector("#Eyebot");
            let txtBot = new GumiGame.ƒ.TextureImage();
            txtBot.image = img;
            this.sprites = new GumiGame.AnimatedSprite("EyebotSprite");
            this.sprites.appendSprites(GumiGame.AnimatedSprite.generateSprites(txtBot, Eyebot.botList), Eyebot.botList);
            this.appendChild(this.sprites);
            this.sprites.show(ENEMYACTION.IDLE);
            this.setLocation(this.cmpTransform.local.translation);
            this.currentDirection = 1;
            this.speed = new GumiGame.ƒ.Vector3();
            this.hurtboxNode = new GumiGame.ƒ.Node("Hurtbox");
            // let material: ƒ.Material = new ƒ.Material("Floor", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("blue", 0.5)));
            this.hurtbox = new GumiGame.ƒ.MeshSprite();
            // this.hurtboxNode.addComponent(new ƒ.ComponentMaterial(material));
            let cmpMesh = new GumiGame.ƒ.ComponentMesh(this.hurtbox);
            this.hurtboxNode.addComponent(cmpMesh);
            this.hurtboxNode.addComponent(new GumiGame.ƒ.ComponentTransform());
            this.hurtboxNode.cmpTransform.local.scaleY(0.6);
            this.hurtboxNode.cmpTransform.local.scaleX(0.5);
            this.hurtboxNode.cmpTransform.local.translateY(0.3);
            this.appendChild(this.hurtboxNode);
        }
        setLocation(_pos) {
            this.cmpTransform.local.translation = _pos;
            this.spawnPoint = _pos;
        }
        act(_action, _direction) {
            this.action = _action;
            if (_action == ENEMYACTION.IDLE) {
                if (_direction != null) {
                    this.currentDirection = (_direction == GumiGame.DIRECTION.RIGHT ? 1 : -1);
                    this.cmpTransform.local.rotation = GumiGame.ƒ.Vector3.Y(90 - 90 * this.currentDirection);
                }
                let timeFrame = GumiGame.ƒ.Loop.timeFrameGame / 1000;
                this.speed.x += GumiGame.Character.maxVelX * timeFrame * this.currentDirection;
                this.sprites.show(_action);
            }
            if (_action == ENEMYACTION.HURT) {
                this.sprites.show(_action);
                this.sprites.getChildrenByName(ENEMYACTION.HURT)[0].start();
            }
            else if (_action == ENEMYACTION.DEATH) {
                this.sprites.show(_action);
                this.sprites.getChildrenByName(ENEMYACTION.DEATH)[0].start();
            }
            else {
                this.sprites.show(_action);
            }
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
            // console.log("Current Speed: " + this.speed);
            let timeFrame = GumiGame.ƒ.Loop.timeFrameGame / 1000;
            let currentPos = this.cmpTransform.local.translation;
            let originalPos = this.cmpTransform.local.translation;
            let distance = GumiGame.ƒ.Vector3.SCALE(this.speed, timeFrame);
            let distanceX = GumiGame.ƒ.Vector3.SCALE(new GumiGame.ƒ.Vector3(this.speed.x, 0, 0), timeFrame);
            let distanceY = GumiGame.ƒ.Vector3.SCALE(new GumiGame.ƒ.Vector3(0, this.speed.y, 0), timeFrame);
            let translation = GumiGame.ƒ.Vector3.SUM(currentPos, distance);
            let collisionsY = [];
            let scaleY = [];
            let collisionsX = [];
            let scaleX = [];
            for (let child of GumiGame.level.getChildren()) {
                if (child instanceof GumiGame.Platform) {
                    let distanceToPlatform = GumiGame.ƒ.Vector3.DIFFERENCE(translation, child.cmpTransform.local.translation);
                    // console.log("Distance to platform: " + distanceToPlatform.magnitude);
                    if (distanceToPlatform.magnitude < GumiGame.tileSize * 2) {
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
                    }
                    else if (originalPos.y < closestPlatform.getBottomright().y) {
                        translation.y = closestPlatform.getBottomright().y - 0.025;
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
                        this.act(ENEMYACTION.IDLE, GumiGame.DIRECTION.LEFT);
                        // console.log("Set next to Left Wall of the Platform");
                    }
                    //Right
                    if (originalPos.x > closestPlatform.getBottomright().x) {
                        translation.x = closestPlatform.getBottomright().x + 0.025;
                        this.act(ENEMYACTION.IDLE, GumiGame.DIRECTION.RIGHT);
                        // console.log("Set next to Right Wall of the Platform");
                    }
                }
            }
            this.cmpTransform.local.translation = translation;
        }
        checkCollision() {
            let hurboxRect = this.getRectWorld();
            for (let child of GumiGame.entities.getChildren()) {
                let hit = hurboxRect.isInside(child.cmpTransform.local.translation.toVector2());
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
    Eyebot.botList = {
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
    GumiGame.Eyebot = Eyebot;
})(GumiGame || (GumiGame = {}));
//# sourceMappingURL=Enemy.js.map