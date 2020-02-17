namespace GumiGame {
    export import ƒ = FudgeCore;

    enum GAME_STATE {
        START, MENU, PLAY, OVER
    }

    interface KeyPressed {
        [code: string]: boolean;
    }
    let keysPressed: KeyPressed = {};

    let canvas: HTMLCanvasElement;
    let crc2: CanvasRenderingContext2D;

    let camera: ƒ.Node;
    let cmpCamera: ƒ.ComponentCamera;
    let viewport: ƒ.Viewport;

    export const gravity: number = 3.81;

    export const tileSize: number = 1;

    export let level: ƒ.Node;
    export let entities: ƒ.Node;
    export let game: ƒ.Node;
    export let hud: Hud;

    let hudPos: ƒ.Vector3 = new ƒ.Vector3(-2.5, 2, 0);

    export let playerCharacter: ƒ.Node;

    let startPos: ƒ.Vector3;

    let playerLife: number = 10;
    let playerBullets: number = 30;

    let state: GAME_STATE = GAME_STATE.MENU;

    window.addEventListener("load", init);

    function init(): void {
        canvas = document.querySelector("canvas");
        crc2 = canvas.getContext("2d");

        game = new ƒ.Node("Game");

        //Set up Chamera to follow Player
        camera = new ƒ.Node("Camera");
        cmpCamera = new ƒ.ComponentCamera();
        camera.addComponent(cmpCamera);
        camera.addComponent(new ƒ.ComponentTransform());
        ƒ.RenderManager.initialize(true, false);

        cmpCamera.pivot.translateZ(8);
        cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
        cmpCamera.backgroundColor = ƒ.Color.CSS("aliceblue");

        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", game, cmpCamera, canvas);
        viewport.draw();

        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 10);

        setupMenu();
    }

    function setupMenu(): void {
        state = GAME_STATE.MENU;
        game = new ƒ.Node("Game");

        let bg: ƒ.Node = new ƒ.Node("Background");
        let imgFudge: HTMLImageElement = document.querySelector("#Background");
        let txtFudge: ƒ.TextureImage = new ƒ.TextureImage();
        txtFudge.image = imgFudge;
        let coat: ƒ.CoatTextured = new ƒ.CoatTextured();
        coat.texture = txtFudge;
        //Not implemented in Fudge yet :I
        coat.tilingX = 1;
        coat.tilingY = 1;
        coat.repetition = true;

        let material: ƒ.Material = new ƒ.Material("background", ƒ.ShaderTexture, coat);
        bg.addComponent(new ƒ.ComponentTransform());
        bg.cmpTransform.local.scaleX(100);
        bg.cmpTransform.local.scaleY(100);
        bg.cmpTransform.local.translateZ(-20);
        bg.addComponent(new ƒ.ComponentMaterial(material));
        let mesh: ƒ.MeshSprite = new ƒ.MeshSprite();
        let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);

        bg.addComponent(cmpMesh);
        game.appendChild(bg);

        let menuContainer: HTMLDivElement = document.querySelector(".MenuContainer");
        menuContainer.innerHTML = "";

        // menuContainer.classList.add("MenuContainer");
        let startButton: HTMLButtonElement = document.createElement("button");
        startButton.textContent = "Start";
        startButton.addEventListener("click", setupGame);
        let difficulty: HTMLSelectElement = document.createElement("select");
        let easy: HTMLOptionElement = document.createElement("option");
        easy.textContent = "Easy";
        easy.value = "easy";
        difficulty.appendChild(easy);
        let normal: HTMLOptionElement = document.createElement("option");
        normal.textContent = "Normal";
        normal.value = "normal";
        difficulty.appendChild(normal);
        let hard: HTMLOptionElement = document.createElement("option");
        hard.textContent = "Hard";
        hard.value = "hard";
        difficulty.appendChild(hard);
        let lunatic: HTMLOptionElement = document.createElement("option");
        lunatic.textContent = "Lunatic";
        lunatic.value = "lunatic";
        difficulty.appendChild(lunatic);
        let description: HTMLDivElement = document.createElement("div");
        description.innerHTML += "Goal of this game is to find the exit and escape. <br> ";
        description.innerHTML += "You don't have much, except your trusty gun. That might not sound like much at first, but it has a lot of power. <br>";
        description.innerHTML += "...so much that it can lift you off your feet. <br> Watch out though, there are monsters about and reloding takes a while.";
        let controls: HTMLDivElement = document.createElement("div");
        controls.textContent = "Controls - WASD to move, Arrow Keys to aim and shoot, Space to Jump";
        let difficultyDesc: HTMLDivElement = document.createElement("div");
        difficultyDesc.innerHTML = "Difficulty: Easy - You have 10 Hearts and 30 Bullets";
        menuContainer.appendChild(startButton);
        menuContainer.appendChild(difficulty);
        menuContainer.appendChild(difficultyDesc);
        menuContainer.appendChild(description);
        menuContainer.appendChild(controls);
        document.body.appendChild(menuContainer);

        difficulty.addEventListener("input", function (_event: Event): void {
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

        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", game, cmpCamera, canvas);
    }

    function setupGameOver(_event: CustomEvent): void {
        state = GAME_STATE.OVER;
        let menuContainer: HTMLDivElement = document.querySelector(".MenuContainer");
        menuContainer.innerHTML = "";
        let backButton: HTMLButtonElement = document.createElement("button");
        backButton.textContent = "Back to Menu";
        backButton.addEventListener("click", setupMenu);
        menuContainer.appendChild(backButton);
        let gameOverText: HTMLDivElement = document.createElement("div");
        menuContainer.appendChild(gameOverText);
        if (_event.detail <= 0) {
            gameOverText.innerHTML = "<h1>You died</h1>";
        }

    }

    function setupGame(): void {
        state = GAME_STATE.PLAY;
        let menuContainer: HTMLDivElement = document.querySelector(".MenuContainer");
        menuContainer.innerHTML = "";
        let controls: HTMLDivElement = document.createElement("div");
        controls.textContent = "Controls - WASD to move, Arrow Keys to aim and shoot, Space to Jump";
        menuContainer.appendChild(controls);
        let backButton: HTMLButtonElement = document.createElement("button");
        backButton.textContent = "Back to Menu";
        backButton.addEventListener("click", setupMenu);
        menuContainer.appendChild(backButton);


        game = new ƒ.Node("Game");
        hud = new Hud("Hud");

        let bg: ƒ.Node = new ƒ.Node("Background");
        let imgFudge: HTMLImageElement = document.querySelector("#Background");
        let txtFudge: ƒ.TextureImage = new ƒ.TextureImage();
        txtFudge.image = imgFudge;
        let coat: ƒ.CoatTextured = new ƒ.CoatTextured();
        coat.texture = txtFudge;
        //Not implemented in Fudge yet :I
        coat.tilingX = 1;
        coat.tilingY = 1;
        coat.repetition = true;

        let material: ƒ.Material = new ƒ.Material("background", ƒ.ShaderTexture, coat);
        bg.addComponent(new ƒ.ComponentTransform());
        bg.cmpTransform.local.scaleX(100);
        bg.cmpTransform.local.scaleY(100);
        bg.cmpTransform.local.translateZ(-20);
        bg.addComponent(new ƒ.ComponentMaterial(material));
        let mesh: ƒ.MeshSprite = new ƒ.MeshSprite();
        let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);

        bg.addComponent(cmpMesh);
        game.appendChild(bg);

        entities = new ƒ.Node("Entities");
        playerCharacter = new Gumi("Gumi");
        (<Gumi>playerCharacter).setDifficulty(playerLife, playerBullets);
        startPos = new ƒ.Vector3(tileSize + 1, -(tileSize + 1), 0);

        game.appendChild(playerCharacter);
        playerCharacter.cmpTransform.local.translation = startPos;
        level = createLevel();
        game.appendChild(level);

        game.appendChild(entities);


        camera.appendChild(hud);

        game.appendChild(camera);

        document.addEventListener("keydown", handleKeyboard);
        document.addEventListener("keyup", handleKeyboard);
        hud.cmpTransform.local.translate(hudPos);
        viewport.initialize("Viewport", game, cmpCamera, canvas);
        playerCharacter.addEventListener("GameOver", setupGameOver);

    }

    function update(_event: ƒ.Eventƒ): void {
        if (state == GAME_STATE.PLAY) {
            camera.cmpTransform.local.translation = playerCharacter.cmpTransform.local.translation;
            processInput();
        }
        viewport.draw();

        // crc2.strokeRect(-1, -1, canvas.width / 2, canvas.height + 2);
        // crc2.strokeRect(-1, canvas.height / 2, canvas.width + 2, canvas.height);
    }

    function handleKeyboard(_event: KeyboardEvent): void {
        keysPressed[_event.code] = (_event.type == "keydown");
    }

    function processInput(): void {

        if (keysPressed[ƒ.KEYBOARD_CODE.A]) {
            (<Gumi>playerCharacter).act(PLAYERACTION.WALK, DIRECTION.LEFT);
        }
        if (keysPressed[ƒ.KEYBOARD_CODE.D]) {
            (<Character>playerCharacter).act(PLAYERACTION.WALK, DIRECTION.RIGHT);
        }
        if (keysPressed[ƒ.KEYBOARD_CODE.ARROW_UP]) {
            (<Character>playerCharacter).act(PLAYERACTION.AIM_UP);
            (<Character>playerCharacter).act(PLAYERACTION.SHOOTING);
        }
        else if (keysPressed[ƒ.KEYBOARD_CODE.ARROW_DOWN]) {
            (<Character>playerCharacter).act(PLAYERACTION.AIM_DOWN);
            (<Character>playerCharacter).act(PLAYERACTION.SHOOTING);
        }
        else if (keysPressed[ƒ.KEYBOARD_CODE.ARROW_LEFT]) {
            (<Character>playerCharacter).act(PLAYERACTION.AIM_BACK);
            (<Character>playerCharacter).act(PLAYERACTION.SHOOTING);
        }
        else if (keysPressed[ƒ.KEYBOARD_CODE.ARROW_RIGHT]) {
            (<Character>playerCharacter).act(PLAYERACTION.AIM_FORWARD);
            (<Character>playerCharacter).act(PLAYERACTION.SHOOTING);
        }
        if (keysPressed[ƒ.KEYBOARD_CODE.SPACE]) {
            (<Character>playerCharacter).act(PLAYERACTION.JUMP);
        }
        if (!keysPressed[ƒ.KEYBOARD_CODE.ARROW_DOWN] && !keysPressed[ƒ.KEYBOARD_CODE.ARROW_UP]) {
            if ((<Gumi>playerCharacter).getDirection() == DIRECTION.RIGHT) {
                if (keysPressed[ƒ.KEYBOARD_CODE.ARROW_LEFT])
                    (<Character>playerCharacter).act(PLAYERACTION.AIM_BACK);
                else
                    (<Character>playerCharacter).act(PLAYERACTION.AIM_FORWARD);
            }
            else if ((<Gumi>playerCharacter).getDirection() == DIRECTION.LEFT) {
                if (keysPressed[ƒ.KEYBOARD_CODE.ARROW_RIGHT])
                    (<Character>playerCharacter).act(PLAYERACTION.AIM_BACK);
                else
                    (<Character>playerCharacter).act(PLAYERACTION.AIM_FORWARD);
            }
        }
        if (!keysPressed[ƒ.KEYBOARD_CODE.A] && !keysPressed[ƒ.KEYBOARD_CODE.D]) {
            (<Character>playerCharacter).act(PLAYERACTION.IDLE);
        }

    }

    function createLevel(): ƒ.Node {
        //Create Start Area        
        let level: ƒ.Node = new ƒ.Node("Level");
        //Tilemapping
        // 1 = Wall
        // 9 = Player Start. If there is more than one, the one furthest down right will be taken
        // 8 = Slimes
        // 7 = Eyebot
        let levelMap: string[][] =
            [
                ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1"], //Top
                ["1", "0", "0", "0", "0", "0", "0", "0", "Y", "0", "1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1"],
                ["1", "0", "1", "0", "0", "0", "X", "0", "0", "Z", "1", "0", "2", "0", "0", "0", "0", "0", "0", "1", "1", "1", "0", "1"],
                ["1", "0", "Y", "0", "1", "1", "2", "1", "1", "1", "1", "0", "0", "0", "X", "0", "0", "X", "0", "1", "0", "0", "0", "1"],
                ["1", "3", "4", "0", "1", "0", "0", "0", "0", "0", "1", "1", "1", "1", "1", "1", "1", "1", "1", "1", "0", "Y", "0", "1"],
                ["1", "0", "0", "0", "1", "0", "0", "0", "3", "4", "1", "0", "0", "0", "0", "0", "0", "0", "0", "1", "0", "0", "0", "1"],
                ["1", "0", "1", "1", "1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "Y", "0", "0", "0", "1", "0", "1"],
                ["1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1", "0", "0", "0", "0", "0", "0", "0", "2", "0", "1"],
                ["1", "0", "0", "X", "0", "0", "0", "0", "0", "0", "0", "0", "0", "1", "X", "0", "0", "0", "0", "0", "0", "1", "0", "1"],
                ["C", "C", "C", "C", "C", "H", "H", "0", "H", "C", "C", "C", "C", "C", "C", "C", "C", "C", "C", "0", "C", "C", "C", "C"], //Tunnel
                ["1", "0", "0", "0", "0", "0", "Y", "0", "0", "0", "0", "0", "2", "0", "0", "0", "0", "0", "0", "0", "0", "0", "Y", "1"],
                ["1", "0", "0", "Y", "0", "0", "9", "0", "0", "0", "0", "Y", "0", "0", "0", "0", "0", "0", "0", "0", "6", "0", "0", "1"],
                ["1", "0", "0", "0", "0", "0", "I", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "7", "0", "0", "1"],
                ["1", "0", "0", "0", "0", "X", "0", "0", "0", "0", "0", "1", "1", "1", "1", "0", "0", "0", "0", "0", "8", "0", "0", "1"],
                ["A", "F", "A", "A", "A", "A", "F", "F", "F", "A", "A", "9", "S", "0", "9", "0", "F", "A", "A", "A", "A", "A", "A", "A"], //Tunnel
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
        let rowIndex: number = 0;
        for (let row of levelMap) {
            for (let columnIndex: number = 0; columnIndex < (row.length); columnIndex++) {
                switch (row[columnIndex]) {
                    case "Y":
                        let eyebot: Eyebot = new Eyebot("eyebot");
                        eyebot.setLocation(new ƒ.Vector3((columnIndex * tileSize + tileSize), (-rowIndex * tileSize - tileSize + 0.01), (0)));
                        entities.appendChild(eyebot);
                        break;
                    case "X":
                        let slime: Slime = new Slime("slime");
                        slime.setLocation(new ƒ.Vector3((columnIndex * tileSize + tileSize), (-rowIndex * tileSize - tileSize + 0.01), (0)));
                        entities.appendChild(slime);
                        break;
                    case "Z":
                        let exit: Exit = new Exit("exit");
                        exit.cmpTransform.local.translation = new ƒ.Vector3((columnIndex * tileSize + tileSize), (-rowIndex * tileSize - tileSize + 0.01), (0));
                        entities.appendChild(exit);
                        break;
                    case "S":
                        startPos = new ƒ.Vector3((columnIndex * tileSize + tileSize), (-rowIndex * tileSize - tileSize + 0.01), (0));
                        playerCharacter.cmpTransform.local.translation = startPos;
                        break;
                    default:
                        let platform: Platform;
                        let name: string = "Tile" + rowIndex + "_" + columnIndex;
                        switch (row[columnIndex]) {
                            case "A":
                                platform = new Platform(name, 10);
                                break;
                            case "B":
                                platform = new Platform(name, 11);
                                break;
                            case "C":
                                platform = new Platform(name, 12);
                                break;
                            case "D":
                                platform = new Platform(name, 13);
                                break;
                            case "E":
                                platform = new Platform(name, 13);
                                break;
                            case "F":
                                platform = new Platform(name, 14);
                                break;
                            case "G":
                                platform = new Platform(name, 15);
                                break;
                            case "H":
                                platform = new Platform(name, 16);
                                break;
                            case "I":
                                platform = new Platform(name, 17);
                                break;
                            case "J":
                                platform = new Platform(name, 18);
                                break;
                            case "0":
                                break;
                            default:
                                platform = new Platform(name, Number.parseInt(row[columnIndex]) - 1);
                                break;
                        }
                        if (platform != null) {
                            platform.cmpTransform.local.scaleY(tileSize);
                            platform.cmpTransform.local.scaleX(tileSize);
                            platform.cmpTransform.local.translateY(- rowIndex * tileSize);
                            platform.cmpTransform.local.translateX(columnIndex * tileSize + 1);
                            level.appendChild(platform);
                        }

                }


            }
            rowIndex++;
        }

        return level;
    }

}