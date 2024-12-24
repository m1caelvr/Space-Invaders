import { PATH_INVADER_IMAGE } from "../utils/constants.js";
import Projectile from "./Projectile.js";

export default class Invader {
  constructor(position, velocity) {
    this.position = position
    this.width = 50 * .8;
    this.height = 37 * .8;
    this.screenWidth = innerWidth;

    const distance = this.screenWidth - this.width;
    this.velocity = distance / velocity;

    this.image = this.getImage(PATH_INVADER_IMAGE);
  }

  getImage(path) {
    const image = new Image();
    image.src = path;
    return image;
  }

  moveLeft() {
    this.position.x -= this.velocity;
  }

  moveRight() {
    this.position.x += this.velocity;
  }

  moveDown() {
    this.position.y += this.height;
  }

  incrementVelocity() {
    this.velocity += .1;
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    )
  }

  shoot(projectiles) {
    const p = new Projectile (
      {
        x: this.position.x + this.width / 2 - 1,
        y: this.position.y + this.height,
      },
      10
    );

    projectiles.push(p);
  }

  hit(projectile) {
    return (
      projectile.position.x >= this.position.x &&
      projectile.position.x <= this.position.x + this.width &&
      projectile.position.y >= this.position.y &&
      projectile.position.y <= this.position.y + this.height
    )
  }
}
