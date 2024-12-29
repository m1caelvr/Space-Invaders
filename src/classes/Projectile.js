import { GameDificulty, getDificulty } from "../utils/constants.js";

export default class Projectile {
    constructor(position, velocity, color="white") {
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.width = 2;
        this.height = 30;
        this.angle = 0;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update(player = null) {
        this.position.y += this.velocity;

        if (player !== null) {
            let playerX = player.position.x + player.width / 2;
            const difficulty = getDificulty();

            let adjustment = 0;
            if (difficulty === GameDificulty.MEDIUM) {
                adjustment = 4;
            } else if (difficulty === GameDificulty.HARD) {
                adjustment = 8;
            }

            let deltaX = playerX - this.position.x;
            let deltaY = player.position.y - this.position.y;
            this.angle = Math.atan2(deltaY, deltaX);

            let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            let moveX = (deltaX / distance) * adjustment; 
            let moveY = (deltaY / distance) * adjustment;

            this.position.x += moveX;
            this.position.y += moveY;
        }
    }
}
