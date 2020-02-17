namespace GumiGame {
    import ƒ = FudgeCore;

    class HudSprite extends ƒ.Node {
        public id: number = 0;

        public constructor(_name: string, _id: number, _txtImage?: ƒ.TextureImage) {
            super(_name);
            this.id = _id;
            let material: ƒ.Material;
            let mesh: ƒ.MeshSprite = new ƒ.MeshSprite;
            this.addComponent(new ƒ.ComponentTransform());
            if (_txtImage) {
                let coat: ƒ.CoatTextured = new ƒ.CoatTextured();
                coat.texture = _txtImage;
                material = new ƒ.Material("Sprite", ƒ.ShaderTexture, coat);
            }
            else {
                material = new ƒ.Material("Blank", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red", 0.5)));
            }

            this.addComponent(new ƒ.ComponentMaterial(material));
            let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);

            this.addComponent(cmpMesh);
        }
    }

    export class Hud extends ƒ.Node {
        private static heartOffsetX: number = 0.2;
        private static heartOffsetY: number = 0.1;
        private static heartScaleX: number = 0.2;
        private static heartScaleY: number = 0.2;

        private static bulletOffsetX: number = 0.05;
        private static bulletOffsetY: number = 0.3;
        private static bulletScaleX: number = 0.1;
        private static bulletScaleY: number = 0.2;
        private static zLevel: number = 2;

        private hearts: HudSprite[] = [];
        private bullets: HudSprite[] = [];

        private heartSprite: ƒ.TextureImage;
        private bulletSprite: ƒ.TextureImage;

        private currentHearts: number = 0;
        private currentBullets: number = 0;

        public constructor(_name: string) {
            super(_name);
            this.addComponent(new ƒ.ComponentTransform());

            let imgBullet: HTMLImageElement = document.querySelector("#Shell");
            this.bulletSprite = new ƒ.TextureImage();
            this.bulletSprite.image = imgBullet;

            let imgHeart: HTMLImageElement = document.querySelector("#Heart");
            this.heartSprite = new ƒ.TextureImage();
            this.heartSprite.image = imgHeart;

            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
        }

        public initHearts(_amount: number): void {
            for (let heart of this.hearts) {
                this.removeChild(heart);
            }
            this.hearts = [];
            for (let i: number = 0; i < _amount; i++) {
                let heartNode: HudSprite = new HudSprite("Heart", i, this.heartSprite);
                heartNode.cmpTransform.local.translateX(Hud.heartOffsetX * i);
                heartNode.cmpTransform.local.translateY(-Hud.heartOffsetY);
                heartNode.cmpTransform.local.translateZ(Hud.zLevel);
                heartNode.cmpTransform.local.scaleX(Hud.heartScaleX);
                heartNode.cmpTransform.local.scaleY(Hud.heartScaleY);
                this.appendChild(heartNode);
                this.hearts.push(heartNode);
            }
            this.currentHearts = _amount;
        }

        public initBullets(_amount: number): void {
            for (let bullet of this.bullets) {
                this.removeChild(bullet);
            }
            this.hearts = [];
            for (let i: number = 0; i < _amount; i++) {
                let bulletNode: HudSprite = new HudSprite("Bullet", i, this.bulletSprite);
                bulletNode.cmpTransform.local.translateX(Hud.bulletOffsetX * i);
                bulletNode.cmpTransform.local.translateY(-Hud.bulletOffsetY);
                bulletNode.cmpTransform.local.translateZ(Hud.zLevel);
                bulletNode.cmpTransform.local.scaleX(Hud.bulletScaleX);
                bulletNode.cmpTransform.local.scaleY(Hud.bulletScaleY);
                this.appendChild(bulletNode);
                this.bullets.push(bulletNode);
            }
            this.currentBullets = _amount;
        }

        public updateHearts(_amount: number): void {
            this.currentHearts = _amount;
            if (this.getChildrenByName("Heart").length < this.currentHearts) {
                this.initHearts(this.currentHearts);
            }
            else {
                for (let heart of this.getChildrenByName("Heart")) {
                    heart.activate((<HudSprite>heart).id < this.currentHearts);
                }
            }
        }
        
        public updateBullets(_amount: number): void {
            this.currentBullets = _amount;
            if (this.getChildrenByName("Bullet").length < this.currentBullets) {
                this.initBullets(this.currentBullets);
            }
            else {

                for (let bullet of this.getChildrenByName("Bullet")) {
                    bullet.activate((<HudSprite>bullet).id < this.currentBullets);
                }
            }
        }

        private update = (_event: Event) => {
            let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
        }
    }


}