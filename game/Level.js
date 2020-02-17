var GumiGame;
(function (GumiGame) {
    var ƒ = FudgeCore;
    let SECTOR;
    (function (SECTOR) {
        SECTOR["TOP"] = "TOP";
        SECTOR["LEFT"] = "LEFT";
        SECTOR["RIGHT"] = "RIGHT";
        SECTOR["BOTTOM"] = "BOTTOM";
        SECTOR["TOPLEFT"] = "TOPLEFT";
        SECTOR["TOPRIGHT"] = "TOPRIGHT";
        SECTOR["BOTTOMLEFT"] = "BOTTOMLEFT";
        SECTOR["BOTTOMRIGHT"] = "BOTTOMRIGHT";
        SECTOR["INSIDE"] = "INSIDE";
    })(SECTOR = GumiGame.SECTOR || (GumiGame.SECTOR = {}));
    class Platform extends ƒ.Node {
        constructor(_name, _frameId, _txtImage) {
            super(_name);
            this.mesh = new ƒ.MeshSprite();
            this.addComponent(new ƒ.ComponentTransform());
            if (_txtImage) {
                let sprite = new GumiGame.Sprite(_name, false);
                sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(0, 0, 32, 32), 20, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.TOPCENTER);
                let nodeSprite = new GumiGame.NodeSprite(_name, sprite, false);
                if (_frameId != null)
                    nodeSprite.showFrame(_frameId);
                this.appendChild(nodeSprite);
                // let coat: ƒ.CoatTextured = new ƒ.CoatTextured();
                // coat.texture = _txtImage;
                // this.material = new ƒ.Material("plattform", ƒ.ShaderTexture, coat);
            }
            else if (_frameId != null) {
                let sprite = new GumiGame.Sprite(_name, false);
                let txtImage = new ƒ.TextureImage();
                let imgCaveStory = document.querySelector("#Tileset");
                txtImage.image = imgCaveStory;
                sprite.generateByGrid(txtImage, ƒ.Rectangle.GET(0, 0, 32, 32), 20, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.TOPCENTER);
                let nodeSprite = new GumiGame.NodeSprite(_name, sprite, false);
                nodeSprite.showFrame(_frameId);
                this.appendChild(nodeSprite);
            }
            else {
                this.material = new ƒ.Material("Floor", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red", 0.5)));
                this.addComponent(new ƒ.ComponentMaterial(this.material));
            }
            let cmpMesh = new ƒ.ComponentMesh(this.mesh);
            cmpMesh.pivot = Platform.pivot;
            this.addComponent(cmpMesh);
        }
        getRectWorld() {
            let rect = ƒ.Rectangle.GET(0, 0, 100, 100);
            let topleft = new ƒ.Vector3(-0.5, 0.5, 0);
            let bottomright = new ƒ.Vector3(0.5, -0.5, 0);
            let pivot = this.getComponent(ƒ.ComponentMesh).pivot;
            let mtxResult = ƒ.Matrix4x4.MULTIPLICATION(this.mtxWorld, Platform.pivot);
            topleft.transform(mtxResult, true);
            bottomright.transform(mtxResult, true);
            let size = new ƒ.Vector2(bottomright.x - topleft.x, bottomright.y - topleft.y);
            rect.position = topleft.toVector2();
            rect.size = size;
            return rect;
        }
        getSector(_point) {
            let pos = this.cmpTransform.local.translation;
            let scl = this.cmpTransform.local.scaling;
            let topleft = new ƒ.Vector2((pos.x - scl.x / 2), (pos.y));
            let bottomright = new ƒ.Vector2((pos.x + scl.x / 2), (pos.y - scl.y));
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
        getTopleft() {
            let pos = this.cmpTransform.local.translation;
            let scl = this.cmpTransform.local.scaling;
            return new ƒ.Vector2((pos.x - scl.x / 2), (pos.y));
        }
        getBottomright() {
            let pos = this.cmpTransform.local.translation;
            let scl = this.cmpTransform.local.scaling;
            return new ƒ.Vector2((pos.x + scl.x / 2), (pos.y - scl.y));
        }
    }
    Platform.pivot = ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(-0.5));
    GumiGame.Platform = Platform;
})(GumiGame || (GumiGame = {}));
//# sourceMappingURL=Level.js.map