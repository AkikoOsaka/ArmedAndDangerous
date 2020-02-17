namespace GumiGame {

    export interface SpriteListing {
        sizeX: number;
        sizeY: number;
        locationX: number;
        locationY: number;
        framecount: number;
        loop: boolean;
    }

    export class SpriteList {
        [animationName: string]: SpriteListing; 
    }
}