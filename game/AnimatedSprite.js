var GumiGame;
(function (GumiGame) {
    var ƒ = FudgeCore;
    class AnimatedSprite extends ƒ.Node {
        constructor(_name) {
            super(_name);
            this.blinkingFrequency = 0.5;
            this.blinkingTimer = 0;
            this.blinkingStatus = false;
            this.update = (_event) => {
                if (this.blinking) {
                    let timeFrame = ƒ.Loop.timeFrameGame / 1000;
                    this.blinkingTimer -= timeFrame;
                    if (this.blinkingTimer <= 0) {
                        this.blinkingTimer = this.blinkingFrequency;
                        let currentAnimation = this.getChildrenByName(this.currentAction)[0];
                        this.blinkingStatus = !this.blinkingStatus;
                        currentAnimation.activate(this.blinkingStatus);
                    }
                }
                this.broadcastEvent(new CustomEvent("showNext"));
            };
            this.sprites = [];
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        static generateSprites(_txtImage, _spriteList) {
            let sprites = [];
            for (let animationName in _spriteList) {
                let sprite = new GumiGame.Sprite(animationName, _spriteList[animationName].loop);
                let spriteListing = _spriteList[animationName];
                sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(spriteListing.locationX, spriteListing.locationY, spriteListing.sizeX, spriteListing.sizeY), spriteListing.framecount, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.BOTTOMCENTER);
                sprites.push(sprite);
            }
            return sprites;
        }
        appendSprites(_sprites, _spriteList) {
            for (let sprite of _sprites) {
                this.sprites.push(sprite);
                let nodeSprite = new GumiGame.NodeSprite(sprite.getName(), sprite, sprite.getLoop());
                nodeSprite.activate(false);
                nodeSprite.addEventListener("showNext", (_event) => { _event.currentTarget.showFrameNext(); }, true);
                this.appendChild(nodeSprite);
            }
        }
        setBlinking(_blinking) {
            this.blinkingTimer = this.blinkingFrequency;
            this.blinking = _blinking;
        }
        getAnimationStatus() {
            let currentAnimation = this.getChildrenByName(this.currentAction)[0];
            return currentAnimation.getStatus();
        }
        getCurrentAction() {
            return this.currentAction;
        }
        show(_action) {
            if (!this.blinking)
                for (let child of this.getChildren())
                    child.activate(child.name == _action);
            else {
                for (let child of this.getChildren())
                    if (child.name == _action)
                        child.activate(this.blinkingStatus);
                    else
                        child.activate(false);
            }
            this.currentAction = _action;
        }
    }
    GumiGame.AnimatedSprite = AnimatedSprite;
})(GumiGame || (GumiGame = {}));
//# sourceMappingURL=AnimatedSprite.js.map