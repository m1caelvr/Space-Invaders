import Grid from "./classes/Grid.js";
import Obstacle from "./classes/Obstacle.js";
import Particle from "./classes/Particle.js";
import Player from "./classes/Player.js";
import SoundEffects from "./classes/SoundEffects.js";
import { checkMutedOn as muted, GameState } from "./utils/constants.js";
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

const joystickContainer = document.getElementById("joystick-container");
const joystick = document.getElementById("joystick");
const shootButton = document.getElementById("shoot-button");

let joystickActive = false;
let joystickStartX = 0;
let playerDirectionX = 0;

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

let currentState = GameState.START;
let checkMutedOn = muted;

const gameData = {
  lastScore: 0,
  score: 0,
  level: 1,
  high: 0,
};

const player = new Player(innerWidth, innerHeight);
const grid = new Grid(5, 10);

const playerProjectiles = [];
const invadersProjectiles = [];
const particles = [];
var obstacles = [];

const initObstacle = () => {
  const x = innerWidth / 2 - 50;
  const y = innerHeight - 250;
  const offset = innerWidth * 0.15;
  const color = "#fff";

  const obstacle1 = new Obstacle({ x: x - offset, y }, 100, 20, color);
  const obstacle2 = new Obstacle({ x: x + offset, y }, 100, 20, color);

  obstacles = [];

  obstacles.push(obstacle1);
  obstacles.push(obstacle2);
};

initObstacle();

const keys = {
  left: false,
  right: false,
  pause: false,
  shoot: {
    pressed: false,
    released: true,
  },
};

let controls = {
  left: "keya",
  right: "keyd",
  shoot: "space",
  pause: "enter",
};

let controlsMap = {};

const updateControlsUI = () => {
  Object.keys(controls).forEach((action) => {
    controlsMap[action].textContent = controls[action];
  });
};

const changeKey = (action) => {
  const button = controlsMap[action];
  button.classList.add("active");
  button.textContent = "Press any key...";

  const keyListener = (event) => {
    controls[action] = event.code.toLowerCase();
    console.log(controls[action]);

    updateControlsUI();
    button.classList.remove("active");
    saveToLocalStorage("gameControls", controls);
    document.removeEventListener("keydown", keyListener);
  };

  document.addEventListener("keydown", keyListener);
};

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
  scoreElement.textContent = gameData.score;
  levelElement.textContent = gameData.level;
  highElement.textContent = gameData.high;
};

const incrementScore = (value) => {
  gameData.score += value;

  if (gameData.score > gameData.high) {
    gameData.high = gameData.score;
    saveGameData();
  }
};

const drawObstacles = () => {
  obstacles.forEach((obstacle) => obstacle.draw(ctx));
};

const drawProjectiles = () => {
  const projectiles = [...playerProjectiles, ...invadersProjectiles];

  projectiles.forEach((projectile) => {
    projectile.draw(ctx);
    projectile.update();
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
        if (checkMutedOn) SoundEffect.playHitSound();

        createExplosion(
          {
            x: invader.position.x + invader.width / 2,
            y: invader.position.y + invader.height / 2,
          },
          10,
          "#941cff"
        );

        incrementScore(10);

        grid.invaders.splice(invaderIndex, 1);
        playerProjectiles.splice(playerProjectiles.indexOf(projectile), 1);
      }
    });
  });
};

const checkShootPlayer = () => {
  invadersProjectiles.some((projectile, i) => {
    if (player.hit(projectile)) {
      if (checkMutedOn) SoundEffect.playExplosionSound();
      invadersProjectiles.splice(i, 1);
      gameData.lastScore = gameData.score;

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

const spawnGrid = () => {
  if (grid.invaders.length === 0) {
    if (checkMutedOn) SoundEffect.playNextLevelSound();

    grid.rows = Math.round(Math.random() * 9 + 1);
    grid.cols = Math.round(Math.random() * 9 + 1);
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

  document.body.append(gameOverScreen);
};

let isMusicToggleListenerAdded = false;

const gamePause = () => {
  if (currentState === GameState.PAUSED) {
    pauseScreen.remove();
    currentState = GameState.PLAYING;
    gameLoop();
  } else if (currentState === GameState.PLAYING) {
    currentState = GameState.PAUSED;
    document.body.append(pauseScreen);

    const buttonToggleMusic = document.getElementById("button-toggle-music");

    controlsMap = {
      left: document.querySelector("#left .change-key"),
      right: document.querySelector("#right .change-key"),
      shoot: document.querySelector("#shoot .change-key"),
      pause: document.querySelector("#pause .change-key"),
    };

    updateControlsUI();

    Object.keys(controls).forEach((action) => {
      controlsMap[action].addEventListener("click", () => changeKey(action));
    });

    if (!isMusicToggleListenerAdded) {
      buttonToggleMusic.addEventListener("click", () => {
        checkMutedOn = !checkMutedOn;
        console.log(`Music muted: ${checkMutedOn}`);
      });
      isMusicToggleListenerAdded = true;
    }
  }
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

    grid.draw(ctx);
    grid.update(player.alive);

    ctx.save();

    ctx.translate(
      player.position.x + player.width / 2,
      player.position.y + player.height / 2
    );

    if (keys.shoot.pressed && keys.shoot.released) {
      if (checkMutedOn) SoundEffect.playShootSound();

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

    if (keys.pause) {
      gamePause();
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
    grid.update(player.alive);
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

  if (key === controls.pause) keys.pause = false;

  if (key === controls.shoot) {
    keys.shoot.pressed = false;
    keys.shoot.released = true;
  }
});

buttonPlay.addEventListener("click", () => {
  startScreen.remove();
  scoreUI.style.display = "block";
  currentState = GameState.PLAYING;

  setInterval(() => {
    const invader = grid.getRandomInvader();
    if (invader && currentState === GameState.PLAYING)
      invader.shoot(invadersProjectiles);
  }, 1000);
});

buttonRestart.addEventListener("click", () => {
  currentState = GameState.PLAYING;
  player.alive = true;

  grid.invaders.length = 0;
  grid.invadersVelocity = 1;

  invadersProjectiles.length = 0;

  gameData.score = 0;
  gameData.level = 0;

  gameOverScreen.remove();
});

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
  if (checkMutedOn) SoundEffect.playShootSound();

  player.shoot(playerProjectiles);
  keys.shoot.released = false;
});

buttonSettings.addEventListener("click", gamePause);
buttonReturn.addEventListener("click", gamePause);

loadGameData();
gameLoop();
