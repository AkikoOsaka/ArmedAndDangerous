namespace GumiGame {
    import ƒ = FudgeCore;
    export class AnimatedSprite extends ƒ.Node {
        protected sprites: Sprite[];
        protected currentAction: string;
        protected blinking: boolean;
        protected blinkingFrequency: number = 0.5;
        protected blinkingTimer: number = 0;
        protected blinkingStatus: boolean = false;

        constructor(_name: string) {
            super(_name);
            this.sprites = [];

            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
        }

        public static generateSprites(_txtImage: ƒ.TextureImage, _spriteList: SpriteList): Sprite[] {
            let sprites: Sprite[] = [];
            for (let animationName in _spriteList) {
                let sprite: Sprite = new Sprite(animationName, _spriteList[animationName].loop);
                let spriteListing: SpriteListing = _spriteList[animationName];
                sprite.generateByGrid(_txtImage, ƒ.Rectangle.GET(spriteListing.locationX, spriteListing.locationY, spriteListing.sizeX, spriteListing.sizeY), spriteListing.framecount, ƒ.Vector2.ZERO(), 32, ƒ.ORIGIN2D.BOTTOMCENTER);
                sprites.push(sprite);
            }
            return sprites;
        }

        public appendSprites(_sprites: Sprite[], _spriteList: SpriteList): void {

            for (let sprite of _sprites) {
                this.sprites.push(sprite);
                let nodeSprite: NodeSprite = new NodeSprite(sprite.getName(), sprite, sprite.getLoop());
                nodeSprite.activate(false);

                nodeSprite.addEventListener(
                    "showNext",
                    (_event: Event) => { (<NodeSprite>_event.currentTarget).showFrameNext(); },
                    true
                );

                this.appendChild(nodeSprite);
            }
        }

        public setBlinking(_blinking: boolean): void {
            this.blinkingTimer = this.blinkingFrequency;
            this.blinking = _blinking;
        }
        public getAnimationStatus(): string {
            let currentAnimation: NodeSprite = <NodeSprite>this.getChildrenByName(this.currentAction)[0];
            return currentAnimation.getStatus();
        }
        public getCurrentAction(): string {
            return this.currentAction;
        }

        public show(_action: string): void {
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

        protected update = (_event: ƒ.Eventƒ): void => {
            if (this.blinking) {

                let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
                this.blinkingTimer -= timeFrame;

                if (this.blinkingTimer <= 0) {
                    this.blinkingTimer = this.blinkingFrequency;
                    let currentAnimation: NodeSprite = <NodeSprite>this.getChildrenByName(this.currentAction)[0];

                    this.blinkingStatus = !this.blinkingStatus;
                    currentAnimation.activate(this.blinkingStatus);
                }
            }
            this.broadcastEvent(new CustomEvent("showNext"));
        }
    }
}