import DeviceControlManager from "../classes/DeviceControlManager.js";

export const PATH_SPACESHIP_IMAGE = "src/assets/images/spaceship.png";
export const PATH_ENGINE_IMAGE = "src/assets/images/engine.png";
export const PATH_ENGINE_SPRITES = "src/assets/images/engine_sprites.png";
export const PATH_INVADER_IMAGE = "src/assets/images/invader.png";
export const INITIAL_FRAMES = 8;

export const GameState = {
    START: "start",
    PLAYING: "playing",
    GAME_OVER: "gameOver",
    PAUSED: "pause",
}

export let invadersVelocity = 4;

export let checkMutedOn = true;
export let globalDeviceType = new DeviceControlManager().detectDevice();
