namespace GumiGame {
    import ƒ = FudgeCore;

    export enum SECTOR {
        TOP = "TOP",
        LEFT = "LEFT",
        RIGHT = "RIGHT",
        BOTTOM = "BOTTOM",
        TOPLEFT = "TOPLEFT",
        TOPRIGHT = "TOPRIGHT",
        BOTTOMLEFT = "BOTTOMLEFT",
        BOTTOMRIGHT = "BOTTOMRIGHT",
        INSIDE = "INSIDE"
    }

    export class Platform extends ƒ.Node {
        private static readonly pivot: ƒ.Matrix4x4 = ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(-0.5));
        protected mesh: ƒ.MeshSprite = new ƒ.MeshSprite();
        protected material: ƒ.Material;
        protected rectTexture: ƒ.Rectangle;


        public constructor(_name: string, _frameId?: number, _txtImage?: ƒ.TextureImage) {
            super(_name);
            this.addComponent(new ƒ.ComponentTransform());
            if (_txtImage) {
                let sprite: Sprite = new Sprite(_name, false);
                sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 32, 32), 20, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.TOPCENTER);
                let nodeSprite: NodeSprite = new NodeSprite(_name, sprite, false);
                if (_frameId != null)
                    nodeSprite.showFrame(_frameId);

                this.appendChild(nodeSprite);
                // let coat: ƒ.CoatTextured = new ƒ.CoatTextured();
                // coat.texture = _txtImage;
                // this.material = new ƒ.Material("plattform", ƒ.ShaderTexture, coat);

            }
            else if (_frameId != null) {
                let sprite: Sprite = new Sprite(_name, false);
                let txtImage: ƒ.TextureImage = new ƒ.TextureImage();
                let imgCaveStory: HTMLImageElement = document.querySelector("#Tileset");
                txtImage.image = imgCaveStory;
                sprite.generateByGrid(txtImage, ƒ.Rectangle.GET(0, 0, 32, 32), 20, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.TOPCENTER);
                let nodeSprite: NodeSprite = new NodeSprite(_name, sprite, false);
                nodeSprite.showFrame(_frameId);
                this.appendChild(nodeSprite);
            }
            else {
                this.material = new ƒ.Material("Floor", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red", 0.5)));
                this.addComponent(new ƒ.ComponentMaterial(this.material));

            }


            let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(this.mesh);

            cmpMesh.pivot = Platform.pivot;

            this.addComponent(cmpMesh);
        }

        public getRectWorld(): ƒ.Rectangle {
            let rect: ƒ.Rectangle = ƒ.Rectangle.GET(0, 0, 100, 100);
            let topleft: ƒ.Vector3 = new ƒ.Vector3(-0.5, 0.5, 0);
            let bottomright: ƒ.Vector3 = new ƒ.Vector3(0.5, -0.5, 0);

            let pivot: ƒ.Matrix4x4 = this.getComponent(ƒ.ComponentMesh).pivot;
            let mtxResult: ƒ.Matrix4x4 = ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, Platform.pivot);
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);

            let size: ƒ.Vector2 = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;
            return rect;
        }

        public getSector(_point: ƒ.Vector3): string {
            let pos: ƒ.Vector3 = this.cmpTransform.local.translation;
            let scl: ƒ.Vector3 = this.cmpTransform.local.scaling;
            let topleft: ƒ.Vector2 = new ƒ.Vector2((pos.x - scl.x / 2), (pos.y));
            let bottomright: ƒ.Vector2 = new ƒ.Vector2((pos.x + scl.x / 2), (pos.y - scl.y));
            //Above Platform
            if (_point.x > topleft.x && _point.x < bottomright.x && _point.y > topleft.y)
                return SECTOR.TOP;

            //Below Platform
            if (_point.x > topleft.x && _point.x < bottomright.x && _point.y < bottomright.y)
                return SECTOR.BOTTOM;

            //Left of Platform
            if (_point.x < topleft.x && _point.y < topleft.y && _point.y > bottomright.y)
                return SECTOR.LEFT;

            //Right of Platform
            if (_point.x > topleft.x && _point.y < topleft.y && _point.y > bottomright.y)
                return SECTOR.RIGHT;

            //Topleft Corner
            if (_point.x < topleft.x && _point.y > topleft.y)
                return SECTOR.TOPLEFT;

            //Topright Corner
            if (_point.x > bottomright.x && _point.y > topleft.y)
                return SECTOR.TOPRIGHT;

            //Bottomleft Corner
            if (_point.x < topleft.x && _point.y < bottomright.y)
                return SECTOR.BOTTOMLEFT;

            //Bottomright Corner
            if (_point.x > bottomright.x && _point.y < bottomright.y)
                return SECTOR.BOTTOMRIGHT;
            else
                return SECTOR.INSIDE;
        }

        public getTopleft(): ƒ.Vector2 {
            let pos: ƒ.Vector3 = this.cmpTransform.local.translation;
            let scl: ƒ.Vector3 = this.cmpTransform.local.scaling;
            return new ƒ.Vector2((pos.x - scl.x / 2), (pos.y));
        }

        public getBottomright(): ƒ.Vector2 {
            let pos: ƒ.Vector3 = this.cmpTransform.local.translation;
            let scl: ƒ.Vector3 = this.cmpTransform.local.scaling;
            return new ƒ.Vector2((pos.x + scl.x / 2), (pos.y - scl.y));
        }
    }
}
