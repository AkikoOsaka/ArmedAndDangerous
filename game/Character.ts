
namespace GumiGame {
    import ƒ = FudgeCore;

    export enum ACTION {
        IDLE = "IDLE_FORWARD",
        WALK = "Walk",
        INTROONE = "Intro1",
        INTROTWO = "Intro2"
    }
    export enum DIRECTION {
        LEFT = 1, 
        RIGHT = 2,
        UP = 3,
        DOWN = 4
    }

    export abstract class Character extends ƒ.Node {
        
        protected static maxVelX: number = 2; // units per second
        protected static maxVelY: number = 5;
        
        public speed: ƒ.Vector3 = new ƒ.Vector3();
        
        protected sprites: AnimatedSprite;

        constructor(_name: string) {
            super(_name);
            this.addComponent(new ƒ.ComponentTransform());
        }

       public abstract act(_action: string, _direction?: DIRECTION): void;

    }
}
