import Grid from "./classes/Grid.js";
import Invader from "./classes/Invaders.js";
import Particle from "./classes/Particle.js";
import Player from "./classes/Player.js";
import Projectile from "./classes/Projectile.js";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

ctx.imageSmoothingEnabled = false;

const player = new Player(canvas.width, canvas.height);
const grid = new Grid(5, 10);

const playerProjectiles = [];
const invadersProjectiles = [];
const particles = [];

const keys = {
  left: false,
  right: false,
  shoot: {
    pressed: false,
    released: true,
  },
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
      2,
      color
    );

    particles.push(particle);
  }
};

const checkShootInvader = () => {
  grid.invaders.forEach((invader, invaderIndex) => {
    playerProjectiles.some((projectile) => {
      if (invader.hit(projectile)) {
        createExplosion(
          {
            x: invader.position.x + invader.width / 2,
            y: invader.position.y + invader.height / 2,
          },
          10,
          "#941cff"
        );

        grid.invaders.splice(invaderIndex, 1);
        playerProjectiles.splice(playerProjectiles.indexOf(projectile), 1);
      }
    });
  });
};

const checkShootPlayer = () => {
  invadersProjectiles.some((projectile, i) => {
    if (player.hit(projectile)) {
      createExplosion(
        {
          x: player.position.x + player.width / 2,
          y: player.position.y + player.height / 2,
        },
        10,
        "red"
      );

      // setTimeout(() => {
      //   player.position.x = canvas.width / 2 - player.width / 2;
      //   player.position.y = canvas.height - player.height - 30;
      // }, 0);

      invadersProjectiles.splice(i, 1);
    }
  })
}

const gameLoop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawParticles();
  drawProjectiles();
  clearProjectiles();
  clearParticle();

  checkShootPlayer();
  checkShootInvader();

  grid.draw(ctx);
  // grid.update();

  ctx.save();

  ctx.translate(
    player.position.x + player.width / 2,
    player.position.y + player.height / 2
  );

  if (keys.shoot.pressed && keys.shoot.released) {
    player.shoot(playerProjectiles);
    keys.shoot.released = false;
  }

  if (keys.left && player.position.x >= 0) {
    player.moveLeft();
    ctx.rotate(-0.15);
  }

  if (keys.right && player.position.x <= canvas.width - player.width) {
    player.moveRight();
    ctx.rotate(0.15);
  }

  ctx.translate(
    -player.position.x - player.width / 2,
    -player.position.y - player.height / 2
  );

  player.draw(ctx);

  ctx.restore();

  requestAnimationFrame(gameLoop);
};

player.draw(ctx);

addEventListener("keydown", (event) => {
  const key = event.code.toLowerCase();
  const key2 = event.key.toLowerCase();

  // console.log(event);
  // console.log(key);
  // console.log(key2);

  if (key === "keya") keys.left = true;

  if (key === "keyd") keys.right = true;

  if (key === "enter" || key === "space") keys.shoot.pressed = true;
});

addEventListener("keyup", (event) => {
  const key = event.code.toLowerCase();

  if (key === "keya") keys.left = false;

  if (key === "keyd") keys.right = false;

  if (key === "enter" || key === "space") {
    keys.shoot.pressed = false;
    keys.shoot.released = true;
  }
});

// setInterval(() => {
//   const invader = grid.getRandomInvader();
//   if (invader) invader.shoot(invadersProjectiles);
// }, 1000);

gameLoop();
