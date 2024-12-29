import {
  controlsMap as controlsMapArray,
  controls as controlsArray,
  setMutedOn,
  getMutedOn,
  setDificulty,
  GameDificulty,
  setObstacleOn,
  getObstacleOn,
  playerVelocity,
} from "./constants.js";

let controlsMap = controlsMapArray;
let controls = controlsArray;
let isMusicToggleListenerAdded = false;

export const setupPauseScreenActions = (player) => {
  setupSensitivityControl(player);
  setupJoystickOpacityControl();
  setupDificultyControl();
  adjustJoystickSize();
  setupControlsMap();

  if (!isMusicToggleListenerAdded) {
    setupObstacleToggle();
    setupMusicToggle();
  }

  isMusicToggleListenerAdded = true;
};

const setupSensitivityControl = (player) => {
  const sensitivityRange = document.querySelector(".sensitivity-range");

  sensitivityRange.addEventListener("ionChange", ({ detail }) => {
    const initialVelocity = playerVelocity;
    player.velocity = (detail.value / 50) * initialVelocity;
  });
};

const setupDificultyControl = () => {
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

const setupObstacleToggle = () => {
  const buttonToggleObstacle = document.getElementById(
    "button-toggle-obstacle"
  );
  buttonToggleObstacle.addEventListener("click", () => {
    setObstacleOn(!getObstacleOn());
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

const setupControlsMap = () => {
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

const setupMusicToggle = () => {
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

    const newSize = (clampedPercent / 50) * 70;

    document.documentElement.style.setProperty("--size", `${newSize}px`);

    const shootButton = document.getElementById("shoot-button");
    shootButton.style.width = `calc(${newSize}px * 1.35)`;
    shootButton.style.height = `calc(${newSize}px * 1.35)`;
  });
};

const setupJoystickOpacityControl = () => {
  const joystickOpacityRange = document.querySelector(
    ".joystick-opacity-range"
  );

  const setJoystickOpacity = (opacityValue) => {
    document.documentElement.style.setProperty(
      "--joystick-opacity",
      opacityValue
    );
  };

  joystickOpacityRange.addEventListener("ionChange", (event) => {
    const opacityValue = event.detail.value;
    setJoystickOpacity(opacityValue / 100);
  });

  setJoystickOpacity(1);
};
