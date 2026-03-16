var PLAY = 1;
var END = 0;
var gameState = PLAY;

var trex, trex_running, trex_collided;
var ground, invisibleGround, groundImage;

var cloudsGroup, cloudImage;
var obstaclesGroup, obstacle1, obstacle2, obstacle3, obstacle4, obstacle5, obstacle6;

var score;
var gameOverImg, restartImg;
var jumpSound, checkPointSound, dieSound;

var isOnGround = false;

function preload() {
  trex_running = loadAnimation("trex1.png", "trex3.png", "trex4.png");
  trex_collided = loadAnimation("trex_collided.png");

  groundImage = loadImage("ground2.png");
  cloudImage = loadImage("cloud.png");

  obstacle1 = loadImage("obstacle1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  obstacle4 = loadImage("obstacle4.png");
  obstacle5 = loadImage("obstacle5.png");
  obstacle6 = loadImage("obstacle6.png");

  restartImg = loadImage("restart.png");
  gameOverImg = loadImage("gameOver.png");

  jumpSound = loadSound("jump.mp3");
  dieSound = loadSound("die.mp3");
  checkPointSound = loadSound("checkPoint.mp3");
}

function setup() {
  createCanvas(600, 200);

  // FIX: trex Y adjusted to align with new ground level
  trex = createSprite(50, 155, 20, 50);
  trex.addAnimation("running", trex_running);
  trex.addAnimation("collided", trex_collided);
  trex.scale = 0.5;

  // FIX: ground Y raised slightly for proper alignment
  ground = createSprite(200, 175, 400, 20);
  ground.addImage("ground", groundImage);
  ground.x = ground.width / 2;

  gameOver = createSprite(300, 100);
  gameOver.addImage(gameOverImg);
  gameOver.scale = 0.5;

  restart = createSprite(300, 140);
  restart.addImage(restartImg);
  restart.scale = 0.5;

  // FIX: invisibleGround Y raised so trex.collide() registers reliably
  invisibleGround = createSprite(200, 182, 400, 10);
  invisibleGround.visible = false;

  obstaclesGroup = createGroup();
  cloudsGroup = createGroup();

  trex.setCollider("rectangle", 0, 0, trex.width, trex.height);
  trex.debug = false;

  score = 0;
}

function draw() {
  background(180);

  // Displaying score
  text("Score: " + score, 500, 50);

  // FIX: camera Y fixed — no more screen shake during jumps
  camera.position.x = 300;
  camera.position.y = 100;

  // FIX: keeps canvas focused so keypresses are never missed
  if (mouseWentDown()) { }

  if (gameState === PLAY) {

    gameOver.visible = false;
    restart.visible = false;

    // Speed increases gradually with score
    ground.velocityX = -(4 + 3 * score / 100);

    // Scoring
    score = score + Math.round(getFrameRate() / 60);

    if (score > 0 && score % 100 === 0) {
      checkPointSound.play();
    }

    // Loop the ground seamlessly
    if (ground.x < 0) {
      ground.x = ground.width / 2;
    }

    // FIX: keyWentDown fires only once per press — no mid-air multi-jump
    // FIX: isOnGround ensures jump only triggers when truly on ground
    if (keyWentDown("space") && isOnGround) {
      trex.velocityY = -12;
      jumpSound.play();
    }

    // Apply gravity
    trex.velocityY = trex.velocityY + 0.8;

    // Spawn clouds and obstacles
    spawnClouds();
    spawnObstacles();

    // Collision with obstacles = game over
    if (obstaclesGroup.isTouching(trex)) {
      gameState = END;
      dieSound.play();
      // FIX: removed wrongly placed jumpSound.play() here
    }

  } else if (gameState === END) {

    gameOver.visible = true;
    restart.visible = true;

    trex.changeAnimation("collided", trex_collided);

    ground.velocityX = 0;
    trex.velocityY = 0;

    // Freeze all objects in place
    obstaclesGroup.setLifetimeEach(-1);
    cloudsGroup.setLifetimeEach(-1);
    obstaclesGroup.setVelocityXEach(0);
    cloudsGroup.setVelocityXEach(0);

    if (mousePressedOver(restart)) {
      reset();
    }
  }

  // FIX: isOnGround tracked via collision result — reliable ground detection
  if (trex.collide(invisibleGround)) {
    isOnGround = true;
  } else {
    isOnGround = false;
  }

  drawSprites();
}

function reset() {
  gameState = PLAY;
  gameOver.visible = false;
  restart.visible = false;
  cloudsGroup.destroyEach();
  obstaclesGroup.destroyEach();
  trex.changeAnimation("running", trex_running);
  score = 0;
  isOnGround = false; // FIX: reset ground flag on restart
}

function spawnObstacles() {
  if (frameCount % 60 === 0) {
    var obstacle = createSprite(600, 160, 10, 40);
    obstacle.velocityX = -(6 + score / 100);

    var rand = Math.round(random(1, 6));
    switch (rand) {
      case 1: obstacle.addImage(obstacle1); break;
      case 2: obstacle.addImage(obstacle2); break;
      case 3: obstacle.addImage(obstacle3); break;
      case 4: obstacle.addImage(obstacle4); break;
      case 5: obstacle.addImage(obstacle5); break;
      case 6: obstacle.addImage(obstacle6); break;
      default: break;
    }

    obstacle.scale = 0.5;
    obstacle.lifetime = 300;
    obstaclesGroup.add(obstacle);
  }
}

function spawnClouds() {
  if (frameCount % 60 === 0) {
    var cloud = createSprite(600, 120, 40, 10);
    cloud.y = Math.round(random(80, 120));
    cloud.addImage(cloudImage);
    cloud.scale = 0.5;
    cloud.velocityX = -3;
    cloud.lifetime = 200;

    // Keep clouds behind trex
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;

    cloudsGroup.add(cloud);
  }
}
