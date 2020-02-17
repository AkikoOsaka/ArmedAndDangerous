namespace GumiGame {

    export enum GUNACTION {
        SHOTGUN_UP = "SHOTGUN_UP",
        SHOTGUN_DOWN = "SHOTGUN_DOWN",
        SHOTGUN_FORWARD = "SHOTGUN_FORWARD",
        SMG_UP = "SMG_UP",
        SMG_DOWN = "SMG_DOWN",
        SMG_FORWARD = "SMG_FORWARD",
        SMG_BACK = "SMG_BACK",
        INVISIBLE = "INVISIBLE"
    }

    export enum BULLETACTION {
        SHOTGUN = "SHOTGUN",
        SMG = "SMG",
        SMGIMPACT = "SMGIMPACT"
    }

    export class Gun extends Character {

        static gunList: SpriteList = {
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

        public sprites: AnimatedSprite;

        constructor(_name: string) {
            super(_name);
            let img: HTMLImageElement = document.querySelector("#Gumi");
            let txtGumi: ƒ.TextureImage = new ƒ.TextureImage();
            txtGumi.image = img;
            this.sprites = new AnimatedSprite("GunSprites");
            this.sprites.appendSprites(AnimatedSprite.generateSprites(txtGumi, Gun.gunList), Gun.gunList);
            this.appendChild(this.sprites);
            this.sprites.show(GUNACTION.SMG_FORWARD);
            this.cmpTransform.local.translateZ(0.1);
        }

        public act(_action: string, _direction?: DIRECTION): void {
            if (_direction) {
                let direction: number = (_direction == DIRECTION.RIGHT ? 0.1 : -0.1);
                this.cmpTransform.local.translateZ(-this.cmpTransform.local.translation.z);
                this.cmpTransform.local.translateZ(direction);
            }

            this.sprites.show(_action);
        }

        public getCurrentAction(): string {
            return this.sprites.getCurrentAction();
        }
    }

    export class Bullet extends Character {
        private static bulletList: SpriteList = {
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

        protected sprites: AnimatedSprite;
        protected direction: ƒ.Vector3;
        protected velocity: number = 10;
        protected kill: boolean = false;
        protected lifeTime: number = 4;
        protected currentLifeTime: number = 0;


        constructor(_name: string, _pos: ƒ.Vector3, _direction?: DIRECTION) {
            super(_name);
            let img: HTMLImageElement = document.querySelector("#Bullet");
            let txtBullet: ƒ.TextureImage = new ƒ.TextureImage();
            txtBullet.image = img;
            let coat: ƒ.CoatTextured = new ƒ.CoatTextured();
            coat.texture = txtBullet;
            let material: ƒ.Material = new ƒ.Material("bullet", ƒ.ShaderTexture, coat);
            let mesh: ƒ.MeshSprite = new ƒ.MeshSprite();
            this.cmpTransform.local.scale(new ƒ.Vector3(0.3, 0.3, 0.3));
            this.addComponent(new ƒ.ComponentMaterial(material));
            let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);
            this.addComponent(cmpMesh);

            this.cmpTransform.local.translation = _pos;
            if (_direction != null) {
                switch (_direction) {
                    case DIRECTION.LEFT:
                        this.cmpTransform.local.rotateZ(180);
                        break;
                    case DIRECTION.RIGHT:
                        this.cmpTransform.local.rotateZ(0);
                        break;
                    case DIRECTION.UP:
                        this.cmpTransform.local.rotateZ(90);
                        break;
                    case DIRECTION.DOWN:
                        this.cmpTransform.local.rotateZ(-90);
                        break;
                }
                this.speed.x = this.velocity;
                ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
            }

        }
        public act(_action: string): void {
            switch (_action) {
                case BULLETACTION.SHOTGUN:
                    this.speed = ƒ.Vector3.ZERO();
                    this.kill = true;
                    break;

            }
            this.sprites.show(_action);
        }
        public setPosition(_pos: ƒ.Vector3): void {
            this.cmpTransform.local.translation = _pos;
        }
        private update = (_event: Event): void => {
            let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
            let distance: ƒ.Vector3 = ƒ.Vector3.SCALE(this.speed, timeFrame);
            this.cmpTransform.local.translate(distance);
            this.currentLifeTime += timeFrame;
            if (this.currentLifeTime > this.lifeTime) {
                let parent: ƒ.Node = this.getParent();
                ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
                parent.removeChild(this);
            }
            this.checkCollision();
        }

        private checkCollision(): void {
            for (let child of level.getChildren()) {
                if (child instanceof Platform) {
                    let rect: ƒ.Rectangle = (<Platform>child).getRectWorld();
                    let hit: boolean = rect.isInside(this.cmpTransform.local.translation.toVector2());
                    if (hit) {
                        let parent: ƒ.Node = this.getParent();
                        ƒ.Loop.removeEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
                        parent.removeChild(this);
                    }
                }
            }
        }
    }
}