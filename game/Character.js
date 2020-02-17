var GumiGame;
(function (GumiGame) {
    var ƒ = FudgeCore;
    let ACTION;
    (function (ACTION) {
        ACTION["IDLE"] = "IDLE_FORWARD";
        ACTION["WALK"] = "Walk";
        ACTION["INTROONE"] = "Intro1";
        ACTION["INTROTWO"] = "Intro2";
    })(ACTION = GumiGame.ACTION || (GumiGame.ACTION = {}));
    let DIRECTION;
    (function (DIRECTION) {
        DIRECTION[DIRECTION["LEFT"] = 1] = "LEFT";
        DIRECTION[DIRECTION["RIGHT"] = 2] = "RIGHT";
        DIRECTION[DIRECTION["UP"] = 3] = "UP";
        DIRECTION[DIRECTION["DOWN"] = 4] = "DOWN";
    })(DIRECTION = GumiGame.DIRECTION || (GumiGame.DIRECTION = {}));
    class Character extends ƒ.Node {
        constructor(_name) {
            super(_name);
            this.speed = new ƒ.Vector3();
            this.addComponent(new ƒ.ComponentTransform());
        }
    }
    Character.maxVelX = 2; // units per second
    Character.maxVelY = 5;
    GumiGame.Character = Character;
})(GumiGame || (GumiGame = {}));
//# sourceMappingURL=Character.js.map