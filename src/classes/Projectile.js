export default class Projectile {
    constructor(position, velocity) {
        this.position = position;
        this.velocity = velocity;
        this.width = 2;
        this.height = 20;
    }

    draw(ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.position.y += this.velocity;
    }
}
