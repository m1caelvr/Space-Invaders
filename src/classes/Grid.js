import { globalDeviceType, invadersVelocity } from "../utils/constants.js";
import Invader from "./Invaders.js";

export default class Grid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;

    this.direction = "right";
    this.moveDown = true;
    this.invadersVelocity = invadersVelocity;
    this.invaders = this.init();
  }

  init() {
    const array = [];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const invader = new Invader(
          {
            x: col * 50 + 20,
            y: row * 37 + 90,
          },
          this.invadersVelocity
        );

        array.push(invader);
      }
    }

    return array;
  }

  draw(ctx) {
    this.invaders.forEach((invader) => invader.draw(ctx));
  }

  update(playerStatus) {
    if (this.reachedRightBoundary()) {
      this.direction = "left";
      this.moveDown = true;
    } else if (this.reachedLeftBoundary()) {
      this.direction = "right";
      this.moveDown = true;
    }

    if (!playerStatus) this.moveDown = false;

    this.invaders.forEach((invader) => {
      if (this.moveDown) {
        let deviceType = globalDeviceType;        
        if (deviceType === "desktop") invader.moveDown();
        invader.incrementVelocity();
        this.invadersVelocity = invader.velocity;
      };

      if (this.direction === "right") invader.moveRight();
      if (this.direction === "left") invader.moveLeft();
    });

    this.moveDown = false;
  }

  reachedRightBoundary() {
    return this.invaders.some((invader) => invader.position.x + invader.width >= innerWidth);
  }
  reachedLeftBoundary() {
    return this.invaders.some((invader) => invader.position.x <= 0);
  }

  getRandomInvader() {
    const index = Math.floor(Math.random() * this.invaders.length);
    return this.invaders[index];
  }

  restart() {
    this.invaders = this.init();
    this.direction = "right";
  }
}
