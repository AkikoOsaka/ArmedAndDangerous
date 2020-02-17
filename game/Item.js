var GumiGame;
(function (GumiGame) {
    var ƒ = FudgeCore;
    class Exit extends ƒ.Node {
        constructor(_name) {
            super(_name);
            this.mesh = new ƒ.MeshSprite();
            let txtImage = new ƒ.TextureImage();
            let img = document.querySelector("#Exit");
            txtImage.image = img;
            let spriteMesh = new ƒ.ComponentMesh(this.mesh);
            let coat = new ƒ.CoatTextured();
            coat.texture = txtImage;
            this.material = new ƒ.Material("plattform", ƒ.ShaderTexture, coat);
            this.addComponent(spriteMesh);
            this.addComponent(new ƒ.ComponentMaterial(this.material));
            this.addComponent(new ƒ.ComponentTransform());
            this.hurtboxNode = new ƒ.Node("Hurtbox");
            this.cmpTransform.local.translateY(0.5);
            this.cmpTransform.local.scaleY(2);
            let hutboxMaterial = new ƒ.Material("Floor", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("blue", 0.5)));
            this.hurtbox = new ƒ.MeshSprite();
            this.hurtboxNode.addComponent(new ƒ.ComponentMaterial(hutboxMaterial));
            let cmpMesh = new ƒ.ComponentMesh(this.hurtbox);
            this.hurtboxNode.addComponent(cmpMesh);
            this.hurtboxNode.addComponent(new ƒ.ComponentTransform());
            this.appendChild(this.hurtboxNode);
        }
        getRectWorld() {
            let rect = ƒ.Rectangle.GET(0, 0, 100, 100);
            let pos = this.hurtboxNode.cmpTransform.local.translation;
            let scl = this.hurtboxNode.cmpTransform.local.scaling;
            let topleft = new ƒ.Vector3((pos.x - scl.x / 2), (pos.y), (pos.z));
            let bottomright = new ƒ.Vector3((pos.x + scl.x / 2), (pos.y - scl.y), (pos.z));
            let pivot = this.hurtboxNode.getComponent(ƒ.ComponentMesh).pivot;
            let mtxResult = ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, pivot);
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);
            let size = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;
            console.log("Exit Hitbox" + rect);
            return rect;
        }
    }
    GumiGame.Exit = Exit;
})(GumiGame || (GumiGame = {}));
//# sourceMappingURL=Item.js.map