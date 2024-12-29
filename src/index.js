import DeviceControlManager from "./classes/DeviceControlManager.js";
import Grid from "./classes/Grid.js";
import Obstacle from "./classes/Obstacle.js";
import Particle from "./classes/Particle.js";
import Player from "./classes/Player.js";
import SoundEffects from "./classes/SoundEffects.js";
import {
  globalDeviceType as globalDevice,
  obstacles as obstaclesArray,
  controls as controlsArray,
  invadersVelocity,
  GameDificulty,
  GameState,
  getObstacleOn,
  getScore,
} from "./utils/constants.js";
import { setupPauseScreenActions } from "./utils/gameConfigure.js";
import { loadFromLocalStorage, saveToLocalStorage } from "./utils/storage.js";

const SoundEffect = new SoundEffects();

const startScreen = document.querySelector(".start-screen");
const gameOverScreen = document.querySelector(".game-over");
const pauseScreen = document.querySelector(".pause-screen");
const scoreUI = document.querySelector(".score-ui");

const lastScoreElement = document.querySelector(".last-score > span");
const scoreElement = document.querySelector(".score > span");
const levelElement = document.querySelector(".level > span");
const highElement = document.querySelector(".high > span");

const buttonPlay = document.querySelector(".button-play");
const buttonRestart = document.querySelector(".button-restart");
const buttonSettings = document.querySelector(".button-settings");
const buttonReturn = document.querySelector(".button-return");

const joystickWrapper = document.querySelector(".joystick-wrapper");
const joystickContainer = document.getElementById("joystick-container");
const joystick = document.getElementById("joystick");
const shootButton = document.getElementById("shoot-button");

let joystickActive = false;
let joystickStartX = 0;
let playerDirectionX = 0;

let obstacles = obstaclesArray;
let controls = controlsArray;
let invaderReached = false;

let currentState = GameState.START;

let currentScore = 0;
const gameData = {
  lastScore: 0,
  level: 1,
  high: 0,
};

const keys = {
  left: false,
  right: false,
  pause: false,
  shoot: {
    pressed: false,
    released: true,
  },
};

joystickWrapper.remove();
gameOverScreen.remove();
pauseScreen.remove();

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const defineSizeCanvas = () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
};

defineSizeCanvas();
window.addEventListener("resize", defineSizeCanvas);

ctx.imageSmoothingEnabled = false;

const deviceControlManager = new DeviceControlManager();
let deviceType = deviceControlManager.deviceType;
let globalDeviceType = globalDevice;
globalDeviceType = deviceType;

const player = new Player(innerWidth, innerHeight);
const grid = new Grid(4, 7);

const playerProjectiles = [];
const invadersProjectiles = [];
const particles = [];

function setupControls() {
  if (globalDeviceType === "mobile" || globalDeviceType === "tablet") {
    document.body.append(joystickWrapper);
  } else if (globalDeviceType === "desktop" && joystickWrapper) {
    joystickWrapper.remove();
  }
}

const initObstacle = () => {
  const x = innerWidth / 2 - 50;
  const y = innerHeight - 300;
  const offset = innerWidth * 0.15;
  const color = "#fff";

  const obstacle1 = new Obstacle({ x: x - offset, y }, 100, 20, color);
  const obstacle2 = new Obstacle({ x: x + offset, y }, 100, 20, color);
  const obstacle3 = new Obstacle({ x: innerWidth / 2 - 50, y }, 100, 20, color);

  obstacles = [];

  if (globalDeviceType === "mobile" || globalDeviceType === "tablet") {
    obstacles.push(obstacle3);
  } else {
    obstacles.push(obstacle1);
    obstacles.push(obstacle2);
  }
};

initObstacle();

const loadControls = () => {
  const savedControls = loadFromLocalStorage("gameControls");
  if (savedControls) controls = savedControls;
};

loadControls();

const saveGameData = () => {
  saveToLocalStorage("gameData", gameData);
};

const loadGameData = () => {
  const savedData = loadFromLocalStorage("gameData");
  if (savedData) Object.assign(gameData, savedData);
};

const showGameData = () => {
  lastScoreElement.textContent = gameData.lastScore;
  scoreElement.textContent = currentScore;
  levelElement.textContent = gameData.level;
  highElement.textContent = gameData.high;
};

const incrementScore = (value) => {
  currentScore += value;

  if (currentScore > gameData.high) {
    gameData.high = currentScore;
    highElement.style.color = "#941cff";
    saveGameData();
  }
};

const drawObstacles = () => {
  let obstaclesShow = getObstacleOn();

  if (obstaclesShow) {
    obstacles.forEach((obstacle) => obstacle.draw(ctx));
  } else {
    obstacles = [];
  }
};

const drawProjectiles = () => {
  const projectiles = [...playerProjectiles, ...invadersProjectiles];

  projectiles.forEach((projectile) => {
    projectile.draw(ctx);

    if (invadersProjectiles.includes(projectile)) {
      projectile.update(player);
    } else {
      projectile.update();
    }
  });
};

const drawParticles = () => {
  particles.forEach((particle) => {
    particle.draw(ctx);
    particle.update();
  });
};

const clearProjectiles = () => {
  playerProjectiles.forEach((projectile, index) => {
    if (projectile.position.y <= 0) {
      playerProjectiles.splice(index, 1);
    }
  });
};

const clearParticle = () => {
  particles.forEach((particle, i) => {
    if (particle.opacity <= 0) {
      particles.splice(i, 1);
    }
  });
};

const createExplosion = (position, size, color) => {
  for (let i = 0; i < size; i += 1) {
    const particle = new Particle(
      {
        x: position.x,
        y: position.y,
      },
      {
        x: Math.random() - 0.5 * 1.5,
        y: Math.random() - 0.5 * 1.5,
      },
      3,
      color
    );

    particles.push(particle);
  }
};

const checkShootInvader = () => {
  grid.invaders.forEach((invader, invaderIndex) => {
    playerProjectiles.some((projectile) => {
      if (invader.hit(projectile)) {
        SoundEffect.playHitSound();
        createExplosion(
          {
            x: invader.position.x + invader.width / 2,
            y: invader.position.y + invader.height / 2,
          },
          10,
          "#941cff"
        );

        incrementScore(getScore());
        console.log("Score: ", getScore());
        
        grid.invaders.splice(invaderIndex, 1);
        playerProjectiles.splice(playerProjectiles.indexOf(projectile), 1);
      }
    });
  });
};

const checkShootPlayer = () => {
  invadersProjectiles.some((projectile, i) => {
    if (player.hit(projectile)) {
      SoundEffect.playExplosionSound();
      invadersProjectiles.splice(i, 1);
      gameData.lastScore = currentScore;

      saveGameData();
      gameOver();
    }
  });
};

const checkShootObstacle = () => {
  obstacles.forEach((obstacle) => {
    playerProjectiles.some((projectile, i) => {
      if (obstacle.hit(projectile)) {
        playerProjectiles.splice(i, 1);
      }
    });

    invadersProjectiles.some((projectile, i) => {
      if (obstacle.hit(projectile)) {
        invadersProjectiles.splice(i, 1);
      }
    });
  });
};

const checkInvadersObstacle = () => {
  obstacles.forEach((obstacle) => {
    grid.invaders.some((invader, i) => {
      if (obstacle.hit(invader)) {
        invaderReached = true;
      }
    });
  });
};

const spawnGrid = () => {
  if (grid.invaders.length === 0 && playerProjectiles.length === 0) {
    SoundEffect.playNextLevelSound();

    grid.rows = Math.round(Math.random() * 7 + 1);
    grid.cols = Math.round(Math.random() * 7 + 1);
    grid.restart();

    gameData.level += 1;
  }
};

const gameOver = () => {
  createExplosion(
    {
      x: player.position.x + player.width / 2,
      y: player.position.y + player.height / 2,
    },
    10,
    "#fff"
  );

  createExplosion(
    {
      x: player.position.x + player.width / 2,
      y: player.position.y + player.height / 2,
    },
    10,
    "#4D9BE6"
  );

  createExplosion(
    {
      x: player.position.x + player.width / 2,
      y: player.position.y + player.height / 2,
    },
    20,

    "crimson"
  );

  currentState = GameState.GAME_OVER;
  player.alive = false;

  setTimeout(() => {
    document.body.append(gameOverScreen);
  }, 800);

};

const gamePause = () => {
  if (currentState === GameState.PAUSED) {
    pauseScreen.remove();
    currentState = GameState.PLAYING;
    gameLoop();
  } else if (currentState === GameState.PLAYING) {
    currentState = GameState.PAUSED;
    document.body.append(pauseScreen);

    if (!pauseScreen.hasAttribute("data-listener")) {
      pauseScreen.setAttribute("data-listener", "true");

      pauseScreen.addEventListener("click", (event) => {
        const wrapper = pauseScreen.querySelector(".wrapper");

        if (!wrapper.contains(event.target)) {
          gamePause();
        }
      });
    }

    setupPauseScreenActions(player);
  }
};

const startGame = () => {
  startScreen.remove();
  setupControls();
  scoreUI.style.display = "block";
  currentState = GameState.PLAYING;

  setInterval(() => {
    const invader = grid.getRandomInvader();
    if (invader && currentState === GameState.PLAYING)
      invader.shoot(invadersProjectiles);
  }, 1000);
};

const restartGame = () => {
  currentState = GameState.PLAYING;
  player.alive = true;

  grid.invaders.length = 0;
  let localInvadersVelocity = invadersVelocity;
  grid.invadersVelocity = localInvadersVelocity;

  invadersProjectiles.length = 0;

  currentScore = 0;
  gameData.level = 0;

  gameOverScreen.remove();
};

const gameLoop = () => {
  if (currentState === GameState.PAUSED) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (currentState === GameState.PLAYING) {
    initObstacle();

    showGameData();
    spawnGrid();

    drawProjectiles();
    drawParticles();
    drawObstacles();

    clearProjectiles();
    clearParticle();

    checkShootInvader();
    checkShootPlayer();
    checkShootObstacle();
    checkInvadersObstacle();

    grid.draw(ctx);
    grid.update(player.alive, invaderReached);

    ctx.save();

    ctx.translate(
      player.position.x + player.width / 2,
      player.position.y + player.height / 2
    );

    if (keys.shoot.pressed && keys.shoot.released) {
      SoundEffect.playShootSound();

      player.shoot(playerProjectiles);
      keys.shoot.released = false;
    }

    if (
      (keys.left && player.position.x >= 0) ||
      (playerDirectionX < 0 && player.position.x >= 0)
    ) {
      player.moveLeft();
      ctx.rotate(-0.15);
    }

    if (
      (keys.right && player.position.x <= canvas.width - player.width) ||
      (playerDirectionX > 0 && player.position.x <= canvas.width - player.width)
    ) {
      player.moveRight();
      ctx.rotate(0.15);
    }

    ctx.translate(
      -player.position.x - player.width / 2,
      -player.position.y - player.height / 2
    );

    player.draw(ctx);
    ctx.restore();
  }

  if (currentState === GameState.GAME_OVER) {
    initObstacle();

    drawParticles();
    drawObstacles();

    clearProjectiles();
    clearParticle();

    grid.draw(ctx);
    grid.update(player.alive, true);
  }

  requestAnimationFrame(gameLoop);
};

player.draw(ctx);

addEventListener("keydown", (event) => {
  const key = event.code.toLowerCase();

  if (key === controls.left) keys.left = true;

  if (key === controls.right) keys.right = true;

  if (key === controls.pause) keys.pause = true;

  if (key === controls.shoot) keys.shoot.pressed = true;
});

addEventListener("keyup", (event) => {
  const key = event.code.toLowerCase();

  if (key === controls.left) keys.left = false;

  if (key === controls.right) keys.right = false;

  if (key === controls.pause) {
    keys.pause = false;
    gamePause();
  }

  if (key === controls.shoot) {
    keys.shoot.pressed = false;
    keys.shoot.released = true;
  }
});

buttonPlay.addEventListener("click", startGame);
buttonRestart.addEventListener("click", restartGame);

joystickContainer.addEventListener("touchstart", (e) => {
  joystickActive = true;
  const touch = e.touches[0];
  joystickStartX = touch.clientX;
});

joystickContainer.addEventListener("touchmove", (e) => {
  if (!joystickActive) return;

  const touch = e.touches[0];
  const containerRect = joystickContainer.getBoundingClientRect();

  let deltaX = touch.clientX - joystickStartX;

  const maxDelta = containerRect.width / 2 - joystick.offsetWidth / 2;
  deltaX = Math.max(-maxDelta, Math.min(deltaX, maxDelta));

  joystick.style.transform = `translate(calc(${deltaX}px - 50%), -50%)`;

  playerDirectionX = deltaX / maxDelta;
});

joystickContainer.addEventListener("touchend", () => {
  joystickActive = false;
  joystick.style.transform = "translate(-50%, -50%)";
  playerDirectionX = 0;
});

shootButton.addEventListener("touchstart", () => {
  SoundEffect.playShootSound();

  player.shoot(playerProjectiles);
  keys.shoot.released = false;
});

window.addEventListener("resize", () => {
  const newDeviceType = deviceControlManager.detectDevice();
  if (newDeviceType !== globalDeviceType) {
    globalDeviceType = newDeviceType;
    setupControls();
  }
});

buttonSettings.addEventListener("click", gamePause);
buttonReturn.addEventListener("click", gamePause);

loadGameData();
gameLoop();
