var GumiGame;
(function (GumiGame) {
    var ƒ = FudgeCore;
    let STATUS;
    (function (STATUS) {
        STATUS["LOOPING"] = "LOOPING";
        STATUS["FINISHED"] = "FINISHED";
        STATUS["PLAYING"] = "PLAYING";
    })(STATUS = GumiGame.STATUS || (GumiGame.STATUS = {}));
    class SpriteFrame {
    }
    GumiGame.SpriteFrame = SpriteFrame;
    class Sprite {
        constructor(_name, _loop) {
            this.frames = [];
            this.loop = true;
            this.name = _name;
            if (_loop != null)
                this.loop = _loop;
        }
        static getMesh() {
            return Sprite.mesh;
        }
        getName() {
            return this.name;
        }
        getFrameCount() {
            return this.frames.length;
        }
        getLoop() {
            return this.loop;
        }
        /**
         * Creates a series of frames for this [[Sprite]] resulting in pivot matrices and materials to use on a sprite node
         * @param _texture The spritesheet
         * @param _rects A series of rectangles in pixel coordinates defining the single sprites on the sheet
         * @param _resolutionQuad The desired number of pixels within a length of 1 of the sprite quad
         * @param _origin The location of the origin of the sprite quad
         */
        generate(_texture, _rects, _resolutionQuad, _origin) {
            this.frames = [];
            let framing = new ƒ.FramingScaled();
            framing.setScale(1 / _texture.image.width, 1 / _texture.image.height);
            let count = 0;
            for (let rect of _rects) {
                let frame = this.createFrame(this.name + `${count}`, _texture, framing, rect, _resolutionQuad, _origin);
                frame.timeScale = 1;
                this.frames.push(frame);
                count++;
            }
        }
        generateByGrid(_texture, _startRect, _frames, _borderSize, _resolutionQuad, _origin) {
            let rect = _startRect.copy;
            let rects = [];
            while (_frames--) {
                rects.push(rect.copy);
                rect.position.x += _startRect.size.x + _borderSize.x;
                if (rect.right < _texture.image.width)
                    continue;
                _startRect.position.y += _startRect.size.y + _borderSize.y;
                rect = _startRect.copy;
                if (rect.bottom > _texture.image.height)
                    break;
            }
            // rects.forEach((_rect: ƒ.Rectangle) => ƒ.Debug.log(_rect.toString()));
            this.generate(_texture, rects, _resolutionQuad, _origin);
        }
        createFrame(_name, _texture, _framing, _rect, _resolutionQuad, _origin) {
            let rectTexture = new ƒ.Rectangle(0, 0, _texture.image.width, _texture.image.height);
            let frame = new SpriteFrame();
            frame.rectTexture = _framing.getRect(_rect);
            frame.rectTexture.position = _framing.getPoint(_rect.position, rectTexture);
            let rectQuad = new ƒ.Rectangle(0, 0, _rect.width / _resolutionQuad, _rect.height / _resolutionQuad, _origin);
            frame.pivot = ƒ.Matrix4x4.IDENTITY;
            frame.pivot.translate(new ƒ.Vector3(rectQuad.position.x + rectQuad.size.x / 2, -rectQuad.position.y - rectQuad.size.y / 2, 0));
            frame.pivot.scaleX(rectQuad.size.x);
            frame.pivot.scaleY(rectQuad.size.y);
            let coat = new ƒ.CoatTextured();
            coat.pivot.translate(frame.rectTexture.position);
            coat.pivot.scale(frame.rectTexture.size);
            coat.name = _name;
            coat.texture = _texture;
            frame.material = new ƒ.Material(_name, ƒ.ShaderTexture, coat);
            return frame;
        }
    }
    Sprite.mesh = new ƒ.MeshSprite();
    GumiGame.Sprite = Sprite;
    class NodeSprite extends ƒ.Node {
        constructor(_name, _sprite, _loop) {
            super(_name);
            this.frameCurrent = 0;
            this.frameLast = 0;
            this.direction = 1;
            this.loop = true;
            this.finished = false;
            this.sprite = _sprite;
            this.frameLast = this.sprite.getFrameCount() - 1;
            if (_loop != null)
                this.loop = _loop;
            this.cmpMesh = new ƒ.ComponentMesh(Sprite.getMesh());
            this.cmpMaterial = new ƒ.ComponentMaterial();
            this.addComponent(this.cmpMesh);
            this.addComponent(this.cmpMaterial);
            this.showFrame(this.frameCurrent);
            // ƒ.Debug.info("NodeSprite constructor", this);
        }
        showFrame(_index) {
            let spriteFrame = this.sprite.frames[_index];
            this.cmpMesh.pivot = spriteFrame.pivot;
            this.cmpMaterial.material = spriteFrame.material;
            ƒ.RenderManager.updateNode(this);
            this.frameCurrent = _index;
        }
        showFrameNext() {
            if (this.loop) {
                this.frameCurrent = (this.frameCurrent + this.direction + this.sprite.frames.length) % this.sprite.frames.length;
                this.showFrame(this.frameCurrent);
            }
            else {
                if (!this.finished) {
                    let previousFrame = this.frameCurrent;
                    this.frameCurrent = (this.frameCurrent + this.direction + this.sprite.frames.length) % this.sprite.frames.length;
                    if (this.direction < 0 && this.frameCurrent < previousFrame) {
                        this.showFrame(this.frameCurrent);
                    }
                    else if (this.direction > 0 && this.frameCurrent > previousFrame) {
                        this.showFrame(this.frameCurrent);
                    }
                    else {
                        this.finished = true;
                        this.frameCurrent = this.frameLast;
                        this.showFrame(this.frameCurrent);
                    }
                }
                else {
                    this.showFrame(this.frameLast);
                }
            }
        }
        setFrameDirection(_direction) {
            this.direction = Math.floor(_direction);
        }
        start() {
            this.finished = false;
            this.frameCurrent = 0;
        }
        getCurrentFrame() {
            return this.frameCurrent;
        }
        getStatus() {
            if (this.loop) {
                return STATUS.LOOPING;
            }
            else {
                if (this.finished)
                    return STATUS.FINISHED;
                else
                    return STATUS.PLAYING;
            }
        }
    }
    GumiGame.NodeSprite = NodeSprite;
})(GumiGame || (GumiGame = {}));
//# sourceMappingURL=SpriteGenerator.js.map