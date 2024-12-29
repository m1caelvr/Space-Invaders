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
};

export let controls = {
  left: "keya",
  right: "keyd",
  shoot: "space",
  pause: "keyp",
};

export const GameDificulty = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

export let projectileVelocity = 12;
export const playerVelocity = 10;

export function getProjectileVelocity() {
  return projectileVelocity;
}

let scores = { EASE: 10, MEDIUM: 15, HARD: 20 };
let currentScore = scores.EASE;

let currentDificulty = GameDificulty.EASY;
export let invadersVelocity = 5;

export function getScore() {
  return currentScore;
}

export function getInvadersVelocity() {
  return invadersVelocity;
}

export function getDificulty() {
  return currentDificulty;
}

export function setDificulty(newDificulty) {
  currentDificulty = newDificulty;

  switch (newDificulty) {
    case GameDificulty.EASY:
      invadersVelocity = 5;
      projectileVelocity = 12;
      currentScore = scores.EASE;
      break;
    case GameDificulty.MEDIUM:
      invadersVelocity = 8;
      projectileVelocity = 15;
      currentScore = scores.MEDIUM;
      break;
    case GameDificulty.HARD:
      invadersVelocity = 11;
      projectileVelocity = 16;
      currentScore = scores.HARD;
      break;
    default:
      console.warn("Dificuldade desconhecida:", newDificulty);
  }
}

let checkMutedOn = true;

export function getMutedOn() {
  return checkMutedOn;
}

export function setMutedOn(value) {
  checkMutedOn = value;
}

let checkObstacleOn = true;

export const getObstacleOn = () => checkObstacleOn;

export const setObstacleOn = (newState) => {
  checkObstacleOn = newState;
};

export let globalDeviceType = new DeviceControlManager().detectDevice();

export let obstacles = [];
export let controlsMap = {};
