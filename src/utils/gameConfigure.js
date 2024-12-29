import {
  controlsMap as controlsMapArray,
  controls as controlsArray,
  setMutedOn,
  getMutedOn,
  setDificulty,
  GameDificulty,
  setObstacleOn,
  getObstacleOn,
} from "./constants.js";

let controlsMap = controlsMapArray;
let controls = controlsArray;
let isMusicToggleListenerAdded = false;

export const setupPauseScreenActions = (player) => {
  setupSensitivityControl(player);
  setupDificultyControl();
  adjustJoystickSize();
  setupControlsMap();

  if (!isMusicToggleListenerAdded) {
    setupObstacleToggle();
    setupMusicToggle();
  }

  isMusicToggleListenerAdded = true;
};

export const setupSensitivityControl = (player) => {
  const sensitivityRange = document.querySelector(".sensitivity-range");
  sensitivityRange.addEventListener("ionChange", ({ detail }) => {
    player.velocity = detail.value;
  });
};

export const setupDificultyControl = () => {
  const dificultyRange = document.querySelector(".dificulty-range");

  dificultyRange.addEventListener("ionChange", ({ detail }) => {
    let numberDificultyChageValue = detail.value;
    console.log("Novo valor: ", numberDificultyChageValue);

    let selectedValue =
      numberDificultyChageValue === 1
        ? GameDificulty.EASY
        : numberDificultyChageValue === 2
        ? GameDificulty.MEDIUM
        : GameDificulty.HARD;

    console.log("Nova dificuldade:", selectedValue);

    setDificulty(selectedValue);
  });
};

export const setupObstacleToggle = () => {
  const buttonToggleObstacle = document.getElementById(
    "button-toggle-obstacle"
  );
  buttonToggleObstacle.addEventListener("click", () => {
    setObstacleOn(!getObstacleOn());
    console.log("getObstacleOn 2: ", getObstacleOn());
  });
};

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

    updateControlsUI();
    button.classList.remove("active");
    saveToLocalStorage("gameControls", controls);
    document.removeEventListener("keydown", keyListener);
  };

  document.addEventListener("keydown", keyListener);
};

export const setupControlsMap = () => {
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
};

export const setupMusicToggle = () => {
  const buttonToggleMusic = document.getElementById("button-toggle-music");

  buttonToggleMusic.addEventListener("click", () => {
    setMutedOn(!getMutedOn());
  });
};

const adjustJoystickSize = () => {
    const joystickRange = document.querySelector(".joystick-range");
    let percent = joystickRange.value;
  
    joystickRange.addEventListener("ionChange", ({ detail }) => {
      percent = detail.value;

      const clampedPercent = Math.max(0, Math.min(100, percent));
    
      const newSize = 70 + ((clampedPercent / 100) * 60);
    
      document.documentElement.style.setProperty("--size", `${newSize}px`);
    
      const shootButton = document.getElementById('shoot-button');
      shootButton.style.width = `calc(${newSize}px * 1.35)`;
      shootButton.style.height = `calc(${newSize}px * 1.35)`;
    });
  
  };
  
