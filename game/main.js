var GumiGame;
(function (GumiGame) {
    GumiGame.ƒ = FudgeCore;
    let GAME_STATE;
    (function (GAME_STATE) {
        GAME_STATE[GAME_STATE["START"] = 0] = "START";
        GAME_STATE[GAME_STATE["MENU"] = 1] = "MENU";
        GAME_STATE[GAME_STATE["PLAY"] = 2] = "PLAY";
        GAME_STATE[GAME_STATE["OVER"] = 3] = "OVER";
    })(GAME_STATE || (GAME_STATE = {}));
    let keysPressed = {};
    let canvas;
    let crc2;
    let camera;
    let cmpCamera;
    let viewport;
    GumiGame.gravity = 3.81;
    GumiGame.tileSize = 1;
    let hudPos = new GumiGame.ƒ.Vector3(-2.5, 2, 0);
    let startPos;
    let playerLife = 10;
    let playerBullets = 30;
    let state = GAME_STATE.MENU;
    window.addEventListener("load", init);
    function init() {
        canvas = document.querySelector("canvas");
        crc2 = canvas.getContext("2d");
        GumiGame.game = new GumiGame.ƒ.Node("Game");
        //Set up Chamera to follow Player
        camera = new GumiGame.ƒ.Node("Camera");
        cmpCamera = new GumiGame.ƒ.ComponentCamera();
        camera.addComponent(cmpCamera);
        camera.addComponent(new GumiGame.ƒ.ComponentTransform());
        GumiGame.ƒ.RenderManager.initialize(true, false);
        cmpCamera.pivot.translateZ(8);
        cmpCamera.pivot.lookAt(GumiGame.ƒ.Vector3.ZERO());
        cmpCamera.backgroundColor = GumiGame.ƒ.Color.CSS("aliceblue");
        viewport = new GumiGame.ƒ.Viewport();
        viewport.initialize("Viewport", GumiGame.game, cmpCamera, canvas);
        viewport.draw();
        GumiGame.ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        GumiGame.ƒ.Loop.start(GumiGame.ƒ.LOOP_MODE.TIME_GAME, 10);
        setupMenu();
    }
    function setupMenu() {
        state = GAME_STATE.MENU;
        GumiGame.game = new GumiGame.ƒ.Node("Game");
        let bg = new GumiGame.ƒ.Node("Background");
        let imgFudge = document.querySelector("#Background");
        let txtFudge = new GumiGame.ƒ.TextureImage();
        txtFudge.image = imgFudge;
        let coat = new GumiGame.ƒ.CoatTextured();
        coat.texture = txtFudge;
        //Not implemented in Fudge yet :I
        coat.tilingX = 1;
        coat.tilingY = 1;
        coat.repetition = true;
        let material = new GumiGame.ƒ.Material("background", GumiGame.ƒ.ShaderTexture, coat);
        bg.addComponent(new GumiGame.ƒ.ComponentTransform());
        bg.cmpTransform.local.scaleX(100);
        bg.cmpTransform.local.scaleY(100);
        bg.cmpTransform.local.translateZ(-20);
        bg.addComponent(new GumiGame.ƒ.ComponentMaterial(material));
        let mesh = new GumiGame.ƒ.MeshSprite();
        let cmpMesh = new GumiGame.ƒ.ComponentMesh(mesh);
        bg.addComponent(cmpMesh);
        GumiGame.game.appendChild(bg);
        let menuContainer = document.querySelector(".MenuContainer");
        menuContainer.innerHTML = "";
        // menuContainer.classList.add("MenuContainer");
        let startButton = document.createElement("button");
        startButton.textContent = "Start";
        startButton.addEventListener("click", setupGame);
        let difficulty = document.createElement("select");
        let easy = document.createElement("option");
        easy.textContent = "Easy";
        easy.value = "easy";
        difficulty.appendChild(easy);
        let normal = document.createElement("option");
        normal.textContent = "Normal";
        normal.value = "normal";
        difficulty.appendChild(normal);
        let hard = document.createElement("option");
        hard.textContent = "Hard";
        hard.value = "hard";
        difficulty.appendChild(hard);
        let lunatic = document.createElement("option");
        lunatic.textContent = "Lunatic";
        lunatic.value = "lunatic";
        difficulty.appendChild(lunatic);
        let description = document.createElement("div");
        description.innerHTML += "Goal of this game is to find the exit and escape. <br> ";
        description.innerHTML += "You don't have much, except your trusty gun. That might not sound like much at first, but it has a lot of power. <br>";
        description.innerHTML += "...so much that it can lift you off your feet. <br> Watch out though, there are monsters about and reloding takes a while.";
        let controls = document.createElement("div");
        controls.textContent = "Controls - WASD to move, Arrow Keys to aim and shoot, Space to Jump";
        let difficultyDesc = document.createElement("div");
        difficultyDesc.innerHTML = "Difficulty: Easy - You have 10 Hearts and 30 Bullets";
        menuContainer.appendChild(startButton);
        menuContainer.appendChild(difficulty);
        menuContainer.appendChild(difficultyDesc);
        menuContainer.appendChild(description);
        menuContainer.appendChild(controls);
        document.body.appendChild(menuContainer);
        difficulty.addEventListener("input", function (_event) {
            switch (difficulty.selectedOptions[0].value) {
                case "easy":
                    difficultyDesc.innerHTML = "Difficulty: Easy - You have 10 Hearts and 30 Bullets";
                    playerLife = 10;
                    playerBullets = 30;
                    break;
                case "normal":
                    difficultyDesc.innerHTML = "Difficulty: Normal - You have 5 Hearts and 20 Bullets";
                    playerLife = 5;
                    playerBullets = 20;
                    break;
                case "hard":
                    difficultyDesc.innerHTML = "Difficulty: Hard - You have 3 Hearts and 10 Bullets";
                    playerLife = 3;
                    playerBullets = 10;
                    break;
                case "lunatic":
                    difficultyDesc.innerHTML = "Difficulty: Lunatic - You have 1 Hearts and 5 Bullets. Good Luck.";
                    playerLife = 1;
                    playerBullets = 5;
                    break;
            }
        });
        viewport = new GumiGame.ƒ.Viewport();
        viewport.initialize("Viewport", GumiGame.game, cmpCamera, canvas);
    }
    function setupGameOver(_event) {
        state = GAME_STATE.OVER;
        let menuContainer = document.querySelector(".MenuContainer");
        menuContainer.innerHTML = "";
        let backButton = document.createElement("button");
        backButton.textContent = "Back to Menu";
        backButton.addEventListener("click", setupMenu);
        menuContainer.appendChild(backButton);
        let gameOverText = document.createElement("div");
        menuContainer.appendChild(gameOverText);
        if (_event.detail <= 0) {
            gameOverText.innerHTML = "<h1>You died</h1>";
        }
    }
    function setupGame() {
        state = GAME_STATE.PLAY;
        let menuContainer = document.querySelector(".MenuContainer");
        menuContainer.innerHTML = "";
        let controls = document.createElement("div");
        controls.textContent = "Controls - WASD to move, Arrow Keys to aim and shoot, Space to Jump";
        menuContainer.appendChild(controls);
        let backButton = document.createElement("button");
        backButton.textContent = "Back to Menu";
        backButton.addEventListener("click", setupMenu);
        menuContainer.appendChild(backButton);
        GumiGame.game = new GumiGame.ƒ.Node("Game");
        GumiGame.hud = new GumiGame.Hud("Hud");
        let bg = new GumiGame.ƒ.Node("Background");
        let imgFudge = document.querySelector("#Background");
        let txtFudge = new GumiGame.ƒ.TextureImage();
        txtFudge.image = imgFudge;
        let coat = new GumiGame.ƒ.CoatTextured();
        coat.texture = txtFudge;
        //Not implemented in Fudge yet :I
        coat.tilingX = 1;
        coat.tilingY = 1;
        coat.repetition = true;
        let material = new GumiGame.ƒ.Material("background", GumiGame.ƒ.ShaderTexture, coat);
        bg.addComponent(new GumiGame.ƒ.ComponentTransform());
        bg.cmpTransform.local.scaleX(100);
        bg.cmpTransform.local.scaleY(100);
        bg.cmpTransform.local.translateZ(-20);
        bg.addComponent(new GumiGame.ƒ.ComponentMaterial(material));
        let mesh = new GumiGame.ƒ.MeshSprite();
        let cmpMesh = new GumiGame.ƒ.ComponentMesh(mesh);
        bg.addComponent(cmpMesh);
        GumiGame.game.appendChild(bg);
        GumiGame.entities = new GumiGame.ƒ.Node("Entities");
        GumiGame.playerCharacter = new GumiGame.Gumi("Gumi");
        GumiGame.playerCharacter.setDifficulty(playerLife, playerBullets);
        startPos = new GumiGame.ƒ.Vector3(GumiGame.tileSize + 1, -(GumiGame.tileSize + 1), 0);
        GumiGame.game.appendChild(GumiGame.playerCharacter);
        GumiGame.playerCharacter.cmpTransform.local.translation = startPos;
        GumiGame.level = createLevel();
        GumiGame.game.appendChild(GumiGame.level);
        GumiGame.game.appendChild(GumiGame.entities);
        camera.appendChild(GumiGame.hud);
        GumiGame.game.appendChild(camera);
        document.addEventListener("keydown", handleKeyboard);
        document.addEventListener("keyup", handleKeyboard);
        GumiGame.hud.cmpTransform.local.translate(hudPos);
        viewport.initialize("Viewport", GumiGame.game, cmpCamera, canvas);
        GumiGame.playerCharacter.addEventListener("GameOver", setupGameOver);
    }
    function update(_event) {
        if (state == GAME_STATE.PLAY) {
            camera.cmpTransform.local.translation = GumiGame.playerCharacter.cmpTransform.local.translation;
            processInput();
        }
        viewport.draw();
        // crc2.strokeRect(-1, -1, canvas.width / 2, canvas.height + 2);
        // crc2.strokeRect(-1, canvas.height / 2, canvas.width + 2, canvas.height);
    }
    function handleKeyboard(_event) {
        keysPressed[_event.code] = (_event.type == "keydown");
    }
    function processInput() {
        if (keysPressed[GumiGame.ƒ.KEYBOARD_CODE.A]) {
            GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.WALK, GumiGame.DIRECTION.LEFT);
        }
        if (keysPressed[GumiGame.ƒ.KEYBOARD_CODE.D]) {
            GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.WALK, GumiGame.DIRECTION.RIGHT);
        }
        if (keysPressed[GumiGame.ƒ.KEYBOARD_CODE.ARROW_UP]) {
            GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.AIM_UP);
            GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.SHOOTING);
        }
        else if (keysPressed[GumiGame.ƒ.KEYBOARD_CODE.ARROW_DOWN]) {
            GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.AIM_DOWN);
            GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.SHOOTING);
        }
        else if (keysPressed[GumiGame.ƒ.KEYBOARD_CODE.ARROW_LEFT]) {
            GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.AIM_BACK);
            GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.SHOOTING);
        }
        else if (keysPressed[GumiGame.ƒ.KEYBOARD_CODE.ARROW_RIGHT]) {
            GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.AIM_FORWARD);
            GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.SHOOTING);
        }
        if (keysPressed[GumiGame.ƒ.KEYBOARD_CODE.SPACE]) {
            GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.JUMP);
        }
        if (!keysPressed[GumiGame.ƒ.KEYBOARD_CODE.ARROW_DOWN] && !keysPressed[GumiGame.ƒ.KEYBOARD_CODE.ARROW_UP]) {
            if (GumiGame.playerCharacter.getDirection() == GumiGame.DIRECTION.RIGHT) {
                if (keysPressed[GumiGame.ƒ.KEYBOARD_CODE.ARROW_LEFT])
                    GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.AIM_BACK);
                else
                    GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.AIM_FORWARD);
            }
            else if (GumiGame.playerCharacter.getDirection() == GumiGame.DIRECTION.LEFT) {
                if (keysPressed[GumiGame.ƒ.KEYBOARD_CODE.ARROW_RIGHT])
                    GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.AIM_BACK);
                else
                    GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.AIM_FORWARD);
            }
        }
        if (!keysPressed[GumiGame.ƒ.KEYBOARD_CODE.A] && !keysPressed[GumiGame.ƒ.KEYBOARD_CODE.D]) {
            GumiGame.playerCharacter.act(GumiGame.PLAYERACTION.IDLE);
        }
    }
    function createLevel() {
        //Create Start Area        
        let level = new GumiGame.ƒ.Node("Level");
        //Tilemapping
        // 1 = Wall
        // 9 = Player Start. If there is more than one, the one furthest down right will be taken
        // 8 = Slimes
        // 7 = Eyebot
        let levelMap = [
            ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"],
            ["1", "0", "0", "0", "0", "0", "0", "0", "Y", "0", "1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1"],
            ["1", "0", "1", "0", "0", "0", "X", "0", "0", "Z", "1", "0", "2", "0", "0", "0", "0", "0", "0", "1", "1", "1", "0", "1"],
            ["1", "0", "Y", "0", "1", "1", "2", "1", "1", "1", "1", "0", "0", "0", "X", "0", "0", "X", "0", "1", "0", "0", "0", "1"],
            ["1", "3", "4", "0", "1", "0", "0", "0", "0", "0", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "0", "Y", "0", "1"],
            ["1", "0", "0", "0", "1", "0", "0", "0", "3", "4", "1", "0", "0", "0", "0", "0", "0", "0", "0", "1", "0", "0", "0", "1"],
            ["1", "0", "1", "1", "1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "Y", "0", "0", "0", "1", "0", "1"],
            ["1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1", "0", "0", "0", "0", "0", "0", "0", "2", "0", "1"],
            ["1", "0", "0", "X", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1", "X", "0", "0", "0", "0", "0", "0", "1", "0", "1"],
            ["C", "C", "C", "C", "C", "H", "H", "0", "H", "C", "C", "C", "C", "C", "C", "C", "C", "C", "C", "0", "C", "C", "C", "C"],
            ["1", "0", "0", "0", "0", "0", "Y", "0", "0", "0", "0", "0", "2", "0", "0", "0", "0", "0", "0", "0", "0", "0", "Y", "1"],
            ["1", "0", "0", "Y", "0", "0", "9", "0", "0", "0", "0", "Y", "0", "0", "0", "0", "0", "0", "0", "0", "6", "0", "0", "1"],
            ["1", "0", "0", "0", "0", "0", "I", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "7", "0", "0", "1"],
            ["1", "0", "0", "0", "0", "X", "0", "0", "0", "0", "0", "1", "1", "1", "1", "0", "0", "0", "0", "0", "8", "0", "0", "1"],
            ["A", "F", "A", "A", "A", "A", "F", "F", "F", "A", "A", "9", "S", "0", "9", "0", "F", "A", "A", "A", "A", "A", "A", "A"],
            ["1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "I", "1", "0", "I", "0", "2", "0", "0", "0", "0", "0", "0", "1"],
            ["1", "0", "0", "6", "0", "0", "1", "0", "0", "0", "0", "9", "0", "0", "9", "0", "0", "0", "0", "0", "0", "0", "0", "1"],
            ["1", "0", "0", "7", "0", "0", "1", "0", "0", "0", "0", "I", "0", "0", "I", "0", "0", "0", "1", "0", "0", "0", "0", "1"],
            ["1", "0", "Y", "7", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "9", "0", "0", "0", "1", "0", "0", "0", "0", "1"],
            ["1", "0", "0", "7", "0", "0", "0", "0", "0", "0", "0", "1", "3", "4", "I", "1", "1", "1", "1", "2", "1", "1", "0", "1"],
            ["1", "0", "0", "7", "0", "0", "0", "0", "0", "0", "0", "1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1"],
            ["1", "0", "0", "8", "3", "4", "1", "0", "0", "1", "0", "1", "0", "0", "0", "0", "1", "0", "1", "0", "0", "0", "0", "1"],
            ["1", "0", "0", "0", "0", "0", "1", "0", "0", "1", "0", "0", "0", "0", "0", "0", "0", "0", "1", "0", "0", "1", "0", "1"],
            ["1", "0", "0", "0", "0", "0", "1", "0", "0", "1", "0", "1", "0", "1", "1", "1", "1", "2", "1", "0", "0", "1", "0", "1"],
            ["1", "0", "1", "2", "0", "0", "1", "0", "0", "0", "0", "1", "0", "1", "0", "0", "X", "0", "0", "0", "0", "1", "0", "1"],
            ["1", "0", "0", "1", "0", "0", "1", "0", "0", "0", "0", "1", "0", "X", "0", "1", "1", "1", "1", "1", "0", "1", "1", "1"],
            ["1", "0", "0", "0", "0", "0", "1", "0", "0", "0", "0", "1", "0", "1", "0", "1", "Y", "0", "0", "0", "0", "1", "0", "1"],
            ["1", "0", "0", "X", "0", "0", "1", "0", "0", "X", "0", "1", "0", "1", "0", "1", "0", "0", "0", "0", "0", "0", "0", "1"],
            ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"] //Bottom
        ];
        // console.log("mapsize: " + levelMap.length + ", " + levelMap[0].length);
        let rowIndex = 0;
        for (let row of levelMap) {
            for (let columnIndex = 0; columnIndex < (row.length); columnIndex++) {
                switch (row[columnIndex]) {
                    case "Y":
                        let eyebot = new GumiGame.Eyebot("eyebot");
                        eyebot.setLocation(new GumiGame.ƒ.Vector3((columnIndex * GumiGame.tileSize + GumiGame.tileSize), (-rowIndex * GumiGame.tileSize - GumiGame.tileSize + 0.01), (0)));
                        GumiGame.entities.appendChild(eyebot);
                        break;
                    case "X":
                        let slime = new GumiGame.Slime("slime");
                        slime.setLocation(new GumiGame.ƒ.Vector3((columnIndex * GumiGame.tileSize + GumiGame.tileSize), (-rowIndex * GumiGame.tileSize - GumiGame.tileSize + 0.01), (0)));
                        GumiGame.entities.appendChild(slime);
                        break;
                    case "Z":
                        let exit = new GumiGame.Exit("exit");
                        exit.cmpTransform.local.translation = new GumiGame.ƒ.Vector3((columnIndex * GumiGame.tileSize + GumiGame.tileSize), (-rowIndex * GumiGame.tileSize - GumiGame.tileSize + 0.01), (0));
                        GumiGame.entities.appendChild(exit);
                        break;
                    case "S":
                        startPos = new GumiGame.ƒ.Vector3((columnIndex * GumiGame.tileSize + GumiGame.tileSize), (-rowIndex * GumiGame.tileSize - GumiGame.tileSize + 0.01), (0));
                        GumiGame.playerCharacter.cmpTransform.local.translation = startPos;
                        break;
                    default:
                        let platform;
                        let name = "Tile" + rowIndex + "_" + columnIndex;
                        switch (row[columnIndex]) {
                            case "A":
                                platform = new GumiGame.Platform(name, 10);
                                break;
                            case "B":
                                platform = new GumiGame.Platform(name, 11);
                                break;
                            case "C":
                                platform = new GumiGame.Platform(name, 12);
                                break;
                            case "D":
                                platform = new GumiGame.Platform(name, 13);
                                break;
                            case "E":
                                platform = new GumiGame.Platform(name, 13);
                                break;
                            case "F":
                                platform = new GumiGame.Platform(name, 14);
                                break;
                            case "G":
                                platform = new GumiGame.Platform(name, 15);
                                break;
                            case "H":
                                platform = new GumiGame.Platform(name, 16);
                                break;
                            case "I":
                                platform = new GumiGame.Platform(name, 17);
                                break;
                            case "J":
                                platform = new GumiGame.Platform(name, 18);
                                break;
                            case "0":
                                break;
                            default:
                                platform = new GumiGame.Platform(name, Number.parseInt(row[columnIndex]) - 1);
                                break;
                        }
                        if (platform != null) {
                            platform.cmpTransform.local.scaleY(GumiGame.tileSize);
                            platform.cmpTransform.local.scaleX(GumiGame.tileSize);
                            platform.cmpTransform.local.translateY(-rowIndex * GumiGame.tileSize);
                            platform.cmpTransform.local.translateX(columnIndex * GumiGame.tileSize + 1);
                            level.appendChild(platform);
                        }
                }
            }
            rowIndex++;
        }
        return level;
    }
})(GumiGame || (GumiGame = {}));
//# sourceMappingURL=main.js.map