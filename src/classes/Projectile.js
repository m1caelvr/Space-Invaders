export default class Projectile {
    constructor(position, velocity, color="white") {
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.width = 2;
        this.height = 30;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.position.y += this.velocity;
    }
}
