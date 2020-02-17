namespace GumiGame {
    import ƒ = FudgeCore;

    export class Exit extends ƒ.Node {
        protected mesh: ƒ.MeshSprite = new ƒ.MeshSprite();
        protected material: ƒ.Material;

        private hurtbox: ƒ.Mesh;
        private hurtboxNode: ƒ.Node;

        constructor(_name: string) {
            super(_name);
            let txtImage: ƒ.TextureImage = new ƒ.TextureImage();
            let img: HTMLImageElement = document.querySelector("#Exit");
            txtImage.image = img;

            let spriteMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(this.mesh);
            let coat: ƒ.CoatTextured = new ƒ.CoatTextured();
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
            let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(this.hurtbox);
            this.hurtboxNode.addComponent(cmpMesh);
            this.hurtboxNode.addComponent(new ƒ.ComponentTransform());

            this.appendChild(this.hurtboxNode);
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

            console.log("Exit Hitbox" + rect);

            return rect;
        }
    }
}