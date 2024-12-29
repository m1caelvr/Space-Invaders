import { getProjectileVelocity, globalDeviceType, PATH_INVADER_IMAGE } from "../utils/constants.js";
import Projectile from "./Projectile.js";

export default class Invader {
  constructor(position, velocity) {
    this.position = position;
    this.width = 50 * 0.8;
    this.height = 37 * 0.8;
    this.velocity = velocity;

    this.image = this.getImage(PATH_INVADER_IMAGE);
  }

  getImage(path) {
    const image = new Image();
    image.src = path;
    return image;
  }

  moveLeft(speed=null) {
    this.position.x -= speed ? speed : this.velocity;
  }
  
  moveRight(speed=null) {
    this.position.x += speed ? speed : this.velocity;
  }

  moveDown() {
    this.position.y += this.height;
  }

  incrementVelocity() {
    let deviceType = globalDeviceType;        
    if (deviceType === "desktop") this.velocity += 0.1;
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  shoot(projectiles) {
    let projectileVelocity = getProjectileVelocity();

    const p = new Projectile(
      {
        x: this.position.x + this.width / 2 - 1,
        y: this.position.y + this.height,
      },
      projectileVelocity,
    );

    projectiles.push(p);
  }

  hit(projectile) {
    return (
      projectile.position.x >= this.position.x &&
      projectile.position.x <= this.position.x + this.width &&
      projectile.position.y >= this.position.y &&
      projectile.position.y <= this.position.y + this.height
    );
  }
}
