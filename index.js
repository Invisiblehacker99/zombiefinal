const placementTilesData = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14,0,
];
const waypoints = [
  {
    "x":-112,
    "y":705.333333333333
   }, 
   {
    "x":390.666666666667,
    "y":700
   }, 
   {
    "x":425.333333333333,
    "y":632
   }, 
   {
    "x":537.333333333333,
    "y":633.333333333333
   }, 
   {
    "x":574.666666666667,
    "y":557.333333333333
   }, 
   {
    "x":641.333333333333,
    "y":557.333333333333
   }, 
   {
    "x":669.333333333333,
    "y":614.666666666667
   }, 
   {
    "x":736,
    "y":694.666666666667
   }, 
   {
    "x":1170,
    "y":694.666666666667
   }
];
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const GRAVITY = 0.008; 
canvas.width = 1280
canvas.height = 768

c.fillStyle = 'white'
c.fillRect(0, 0, canvas.width, canvas.height)


class Sprite {
  constructor({
    position = { x: 0, y: 0 },
    imageSrc,
    frames = { max: 1 },
    offset = { x: 0, y: 0 }
  }) {
    this.position = position
    this.image = new Image()
    this.image.src = imageSrc
    this.frames = {
      max: frames.max,
      current: 0,
      elapsed: 0,
      hold: 3
    }
    this.offset = offset
  }

  draw() {
    const cropWidth = this.image.width / this.frames.max
    const crop = {
      position: {
        x: cropWidth * this.frames.current,
        y: 0
      },
      width: cropWidth,
      height: this.image.height
    }
    c.drawImage(
      this.image,
      crop.position.x,
      crop.position.y,
      crop.width,
      crop.height,
      this.position.x + this.offset.x,
      this.position.y + this.offset.y,
      crop.width,
      crop.height
    )
  }

  update() {
    
    this.frames.elapsed++
    if (this.frames.elapsed % this.frames.hold === 0) {
      this.frames.current++
      if (this.frames.current >= this.frames.max) {
        this.frames.current = 0
      }
    }
  }
}


class PlacementTile {
  constructor({ position = { x: 0, y: 0 } }) {
    this.position = position
    this.size = 64
    this.color = 'rgba(255, 255, 255, 0.15)'
    this.occupied = false
  }

  draw() {
    c.fillStyle = this.color
    c.fillRect(this.position.x, this.position.y, this.size, this.size)
  }

  update(mouse) {
    this.draw()

    if (
      mouse.x > this.position.x &&
      mouse.x < this.position.x + this.size &&
      mouse.y > this.position.y &&
      mouse.y < this.position.y + this.size
    ) {
      this.color = 'white'
    } else this.color = 'rgba(255, 255, 255, 0.15)'
  }
}


class Projectile extends Sprite {
  constructor({ position = { x: 0, y: 0 }, enemy }) {
    super({ position, imageSrc: 'img/projectile.png' });
    this.velocity = {
      x: 0,
      y: 0
    };
    this.enemy = enemy;
    this.radius = 10;
  }

  update() {
    this.draw();

    const angle = Math.atan2(
      this.enemy.center.y - this.position.y,
      this.enemy.center.x - this.position.x
    );

    const power = 3;
    this.velocity.x = Math.cos(angle) * power;
    this.velocity.y += GRAVITY; 

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}



class Building extends Sprite {
  constructor({ position = { x: 0, y: 0 } }) {
    super({
      position,
      imageSrc: './img/tower.png',
      frames: {
        max: 19
      },
      offset: {
        x: 0,
        y: -80
      }
    });

    this.width = 64 * 2;
    this.height = 64;
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    };
    this.projectiles = [];
    this.radius = 650; 
    this.target = null;
    this.health = 100; 
  }

  draw() {
    super.draw();

    
    c.fillStyle = 'red';
    c.fillRect(this.position.x, this.position.y - 15, this.width, 10);

    c.fillStyle = 'green';
    c.fillRect(
      this.position.x,
      this.position.y - 15,
      (this.width * this.health) / 100,
      10
    );
  }

  update() {
    this.draw();
    if (this.target || (!this.target && this.frames.current !== 0)) {
      super.update();
    }
  }

  shoot() {
    this.projectiles.push(
      new Projectile({
        position: {
          x: this.center.x - 20,
          y: this.center.y - 110
        },
        enemy: this.target
      })
    );
  }

  findTarget() {
    const validEnemies = enemies.filter((enemy) => {
      const xDifference = enemy.center.x - this.center.x;
      const yDifference = enemy.center.y - this.center.y;
      const distance = Math.hypot(xDifference, yDifference);
      return distance < enemy.radius + this.radius;
    });
    this.target = validEnemies[0]; 
  }

  checkDistanceAndReduceHealth(enemy) {
    const xDifference = enemy.center.x - this.center.x;
    const yDifference = enemy.center.y - this.center.y;
    const distance = Math.hypot(xDifference, yDifference);
    const attackRange = 100; 

    if (distance < attackRange) {
      this.health -= 0.25; 
      if (this.health <= 0) {
        
        const buildingIndex = buildings.indexOf(this);
        if (buildingIndex > -1) {
          buildings.splice(buildingIndex, 1);
        }

        
        if (buildings.length === 0) {
          endGame(); 
        }
      }
    }
  }
}


const buildings = [];


class Enemy extends Sprite {
  constructor({ position = { x: 0, y: 0 } }) {
    super({
      position,
      imageSrc: 'img/orc.png',
      frames: {
        max: 7
      }
    })
    this.position = position
    this.width = 100
    this.height = 100
    this.waypointIndex = 0
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    }
    this.radius = 50
    this.health = 100
    this.velocity = {
      x: 0,
      y: 0
    }
  }

  draw() {
    super.draw()

    
    c.fillStyle = 'red'
    c.fillRect(this.position.x, this.position.y - 15, this.width, 10)

    c.fillStyle = 'green'
    c.fillRect(
      this.position.x,
      this.position.y - 15,
      (this.width * this.health) / 100,
      10
    )
  }

  update() {
    this.draw()
    super.update()

    const waypoint = waypoints[this.waypointIndex]
    const yDistance = waypoint.y - this.center.y
    const xDistance = waypoint.x - this.center.x
    const angle = Math.atan2(yDistance, xDistance)

    const speed = 3

    this.velocity.x = Math.cos(angle) * speed
    this.velocity.y = Math.sin(angle) * speed

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2
    }

    if (
      Math.abs(Math.round(this.center.x) - Math.round(waypoint.x)) <
        Math.abs(this.velocity.x) &&
      Math.abs(Math.round(this.center.y) - Math.round(waypoint.y)) <
        Math.abs(this.velocity.y) &&
      this.waypointIndex < waypoints.length - 1
    ) {
      this.waypointIndex++
    }
  }
}
const placementTilesData2D = [];
for (let i = 0; i < placementTilesData.length; i += 20) {
  placementTilesData2D.push(placementTilesData.slice(i, i + 20));
}

const placementTiles = [];
placementTilesData2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 14) {
      placementTiles.push(
        new PlacementTile({
          position: {
            x: x * 64,
            y: y * 64,
          },
        })
      );
    }
  });
});

const image = new Image();
image.onload = () => {
  animate();
};
image.src = 'img/gameMap.png';

const enemies = [];

function spawnEnemies(spawnCount) {
  for (let i = 1; i < spawnCount + 1; i++) {
    const xOffset = i * 150;
    enemies.push(
      new Enemy({
        position: { x: waypoints[0].x - xOffset, y: waypoints[0].y },
      })
    );
  }
}


let activeTile = undefined;
let enemyCount = 3;
let hearts = 100;
let coins = 100;
const explosions = [];
spawnEnemies(enemyCount);

const pauseButton = document.querySelector('#pauseButton');
const playButton = document.querySelector('#playButton');

pauseButton.addEventListener('click', () => {
  cancelAnimationFrame(animationId); 
});

playButton.addEventListener('click', () => {
  animate(); 
});

let animationId;
const enemyIntervals = {}; 

function startHeartDecrement(enemy) {
  if (!enemyIntervals[enemy]) {
    enemyIntervals[enemy] = setInterval(() => {
      hearts -= 1;
      document.querySelector('#hearts').innerHTML = hearts;
      
    }, 1000);
  }
}

function animate() {
  animationId = requestAnimationFrame(animate);

  c.drawImage(image, 0, 0);

  enemies.forEach((enemy, index) => {
    enemy.update();

    const finalWaypoint = waypoints[waypoints.length - 1];
    const distanceToFinalWaypoint = Math.hypot(
      finalWaypoint.x - enemy.center.x,
      finalWaypoint.y - enemy.center.y
    );

    if (distanceToFinalWaypoint < enemy.radius) {
      startHeartDecrement(enemy);
    }

    if (enemy.health <= 0) {
      enemies.splice(index, 1);
    }
    buildings.forEach((building) => {
      building.checkDistanceAndReduceHealth(enemy);
    });
  });

  for (let i = explosions.length - 1; i >= 0; i--) {
    const explosion = explosions[i];
    explosion.draw();
    explosion.update();

    if (explosion.frames.current >= explosion.frames.max - 1) {
      explosions.splice(i, 1);
    }
  }

  if (enemies.length === 0) {
    enemyCount += 2;
    spawnEnemies(enemyCount);
  }

  placementTiles.forEach((tile) => {
    tile.update(mouse);
  });

  buildings.forEach((building) => {
    building.update();
    building.target = null;
    const validEnemies = enemies.filter((enemy) => {
      const xDifference = enemy.center.x - building.center.x;
      const yDifference = enemy.center.y - building.center.y;
      const distance = Math.hypot(xDifference, yDifference);
      return distance < enemy.radius + building.radius;
    });
    building.target = validEnemies[0];

    for (let i = building.projectiles.length - 1; i >= 0; i--) {
      const projectile = building.projectiles[i];
      projectile.update();

      const xDifference = projectile.enemy.center.x - projectile.position.x;
      const yDifference = projectile.enemy.center.y - projectile.position.y;
      const distance = Math.hypot(xDifference, yDifference);

      if (distance < projectile.enemy.radius + projectile.radius) {
        projectile.enemy.health -= 50;
        if (projectile.enemy.health <= 0) {
          const enemyIndex = enemies.findIndex((enemy) => {
            return projectile.enemy === enemy;
          });

          if (enemyIndex > -1) {
            enemies.splice(enemyIndex, 1);
            coins += 25;
            document.querySelector('#coins').innerHTML = coins;
          }
        }

        explosions.push(
          new Sprite({
            position: { x: projectile.position.x, y: projectile.position.y },
            imageSrc: './img/explosion.png',
            frames: { max: 4 },
            offset: { x: 0, y: 0 }
          })
        );
        building.projectiles.splice(i, 1);
      }
    }
  });
}

const mouse = {
  x: undefined,
  y: undefined
};

canvas.addEventListener('click', (event) => {
  if (activeTile && !activeTile.occupied && coins - 50 >= 0) {
    coins -= 50;
    document.querySelector('#coins').innerHTML = coins;
    buildings.push(
      new Building({
        position: {
          x: activeTile.position.x,
          y: activeTile.position.y
        }
      })
    );
    activeTile.occupied = true;
    buildings.sort((a, b) => {
      return a.position.y - b.position.y;
    });
  }
});

canvas.addEventListener('click', (event) => {
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  let closestBuilding = null;
  let minDistance = Infinity;

  buildings.forEach((building) => {
    const xDifference = building.center.x - mouseX;
    const yDifference = building.center.y - mouseY;
    const distance = Math.hypot(xDifference, yDifference);
    if (distance < minDistance) {
      minDistance = distance;
      closestBuilding = building;
    }
  });

  if (closestBuilding) {
    closestBuilding.findTarget();
    if (closestBuilding.target) {
      closestBuilding.shoot();
    }
  }
});

window.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;

  activeTile = null;
  for (let i = 0; i < placementTiles.length; i++) {
    const tile = placementTiles[i];
    if (
      mouse.x > tile.position.x &&
      mouse.x < tile.position.x + tile.size &&
      mouse.y > tile.position.y &&
      mouse.y < tile.position.y + tile.size
    ) {
      activeTile = tile;
      break;
    }
  }
});
function endGame() {
  console.log('Game Over');
  cancelAnimationFrame(animationId); 
  document.querySelector('#gameOver').style.display = 'flex'; 
}
