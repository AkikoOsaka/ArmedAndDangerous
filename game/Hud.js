var GumiGame;
(function (GumiGame) {
    var ƒ = FudgeCore;
    class HudSprite extends ƒ.Node {
        constructor(_name, _id, _txtImage) {
            super(_name);
            this.id = 0;
            this.id = _id;
            let material;
            let mesh = new ƒ.MeshSprite;
            this.addComponent(new ƒ.ComponentTransform());
            if (_txtImage) {
                let coat = new ƒ.CoatTextured();
                coat.texture = _txtImage;
                material = new ƒ.Material("Sprite", ƒ.ShaderTexture, coat);
            }
            else {
                material = new ƒ.Material("Blank", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red", 0.5)));
            }
            this.addComponent(new ƒ.ComponentMaterial(material));
            let cmpMesh = new ƒ.ComponentMesh(mesh);
            this.addComponent(cmpMesh);
        }
    }
    class Hud extends ƒ.Node {
        constructor(_name) {
            super(_name);
            this.hearts = [];
            this.bullets = [];
            this.currentHearts = 0;
            this.currentBullets = 0;
            this.update = (_event) => {
                let timeFrame = ƒ.Loop.timeFrameGame / 1000;
            };
            this.addComponent(new ƒ.ComponentTransform());
            let imgBullet = document.querySelector("#Shell");
            this.bulletSprite = new ƒ.TextureImage();
            this.bulletSprite.image = imgBullet;
            let imgHeart = document.querySelector("#Heart");
            this.heartSprite = new ƒ.TextureImage();
            this.heartSprite.image = imgHeart;
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        initHearts(_amount) {
            for (let heart of this.hearts) {
                this.removeChild(heart);
            }
            this.hearts = [];
            for (let i = 0; i < _amount; i++) {
                let heartNode = new HudSprite("Heart", i, this.heartSprite);
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
        initBullets(_amount) {
            for (let bullet of this.bullets) {
                this.removeChild(bullet);
            }
            this.hearts = [];
            for (let i = 0; i < _amount; i++) {
                let bulletNode = new HudSprite("Bullet", i, this.bulletSprite);
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
        updateHearts(_amount) {
            this.currentHearts = _amount;
            if (this.getChildrenByName("Heart").length < this.currentHearts) {
                this.initHearts(this.currentHearts);
            }
            else {
                for (let heart of this.getChildrenByName("Heart")) {
                    heart.activate(heart.id < this.currentHearts);
                }
            }
        }
        updateBullets(_amount) {
            this.currentBullets = _amount;
            if (this.getChildrenByName("Bullet").length < this.currentBullets) {
                this.initBullets(this.currentBullets);
            }
            else {
                for (let bullet of this.getChildrenByName("Bullet")) {
                    bullet.activate(bullet.id < this.currentBullets);
                }
            }
        }
    }
    Hud.heartOffsetX = 0.2;
    Hud.heartOffsetY = 0.1;
    Hud.heartScaleX = 0.2;
    Hud.heartScaleY = 0.2;
    Hud.bulletOffsetX = 0.05;
    Hud.bulletOffsetY = 0.3;
    Hud.bulletScaleX = 0.1;
    Hud.bulletScaleY = 0.2;
    Hud.zLevel = 2;
    GumiGame.Hud = Hud;
})(GumiGame || (GumiGame = {}));
//# sourceMappingURL=Hud.js.map