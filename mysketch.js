let path = [];
let obstacles = [];
let boosters = [];
let bonusScores = [];
let score = 0;
let gameOver = false;
let bubbleSize = 20; // Size of the bubbles
let obstacleFrequency; // Frequency of obstacle generation
let difficulty = 'Easy'; // Default difficulty level

function setup() {
  createCanvas(800, 600);
  noStroke();
  setupDifficulty();
  generateObstacles();
  generateBoosters();
}

function draw() {
  background(0);

  if (gameOver) {
    fill(255, 0, 0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text('Game Over', width / 2, height / 2);
    text('Score: ' + score, width / 2, height / 2 + 40);
    return;
  }

  // Draw the path as colorful, semi-transparent bubbles
  let currenttime = millis();
  path = path.filter(point => currenttime - point.timestamp < 2000); // Keep only the last 2 seconds
  for (let point of path) {
    let alpha = map(currenttime - point.timestamp, 0, 2000, 127, 0); // Fade out over 2 seconds
    fill(red(point.color), green(point.color), blue(point.color), alpha);
    ellipse(point.x, point.y, bubbleSize, bubbleSize);
  }

  // Draw the obstacles
  for (let obstacle of obstacles) {
    fill(255, 0, 0);
    rect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    obstacle.y -= 2; // Move obstacles upwards

    // Check for collision with the current bubble
    if (path.length > 0) {
      let currentBubble = path[path.length - 1];
      if (
        currentBubble.x > obstacle.x &&
        currentBubble.x < obstacle.x + obstacle.w &&
        currentBubble.y > obstacle.y &&
        currentBubble.y < obstacle.y + obstacle.h
      ) {
        gameOver = true;
      }
    }
  }

  // Draw the boosters
  for (let booster of boosters) {
    fill(0, 255, 0);
    ellipse(booster.x, booster.y, booster.size, booster.size);
    booster.y -= 2; // Move boosters upwards

    // Check for collision with the mouse pointer
    if (
      mouseX > booster.x - booster.size / 2 &&
      mouseX < booster.x + booster.size / 2 &&
      mouseY > booster.y - booster.size / 2 &&
      mouseY < booster.y + booster.size / 2
    ) {
      score += 10; // Increase score by 10
      booster.y = -100; // Move the booster off-screen
      // Create a visual effect
      bonusScores.push({ x: mouseX, y: mouseY, alpha: 255 });
    }
  }

  // Draw and update the bonus score effects
  for (let i = bonusScores.length - 1; i >= 0; i--) {
    let bonus = bonusScores[i];
    fill(0, 255, 0, bonus.alpha);
    textSize(32);
    textAlign(CENTER, CENTER);
    text('+10', bonus.x, bonus.y);
    bonus.y -= 1; // Move upwards
    bonus.alpha -= 5; // Fade out
    if (bonus.alpha <= 0) {
      bonusScores.splice(i, 1); // Remove when fully faded out
    }
  }

  // Remove off-screen obstacles and boosters
  obstacles = obstacles.filter(obstacle => obstacle.y + obstacle.h > 0);
  boosters = boosters.filter(booster => booster.y + booster.size > 0);

  // Add new obstacles and boosters based on the frequency
  if (frameCount % obstacleFrequency === 0) {
    generateObstacles();
  }
  if (frameCount % (obstacleFrequency * 2) === 0) {
    generateBoosters();
  }

  // Update score
  score++;
  fill(255);
  textSize(24);
  text('Score: ' + score, 10, 30);
}

function mouseDragged() {
  if (!gameOver) {
    let point = {
      x: mouseX,
      y: mouseY,
      color: color(random(255), random(255), random(255), 127), // Initial transparency
      timestamp: millis()
    };
    path.push(point);
  }
}

function mousePressed() {
  if (gameOver) {
    // Reset the game
    gameOver = false;
    score = 0;
    path = [];
    obstacles = [];
    boosters = [];
    bonusScores = [];
    setupDifficulty();
    generateObstacles();
    generateBoosters();
  }
}

function generateObstacles() {
  let numObstacles = random(1, 5);
  for (let i = 0; i < numObstacles; i++) {
    let w = random(20, 80);
    let h = random(20, 80);
    let x = random(width);
    let y = height;
    obstacles.push({ x, y, w, h });
  }
}

function generateBoosters() {
  let numBoosters = random(1, 3);
  for (let i = 0; i < numBoosters; i++) {
    let size = random(15, 30);
    let x, y;
    let validPosition = false;

    // Ensure the booster does not overlap with any obstacles
    while (!validPosition) {
      x = random(width);
      y = height;
      validPosition = true;
      for (let obstacle of obstacles) {
        if (
          x > obstacle.x - size / 2 &&
          x < obstacle.x + obstacle.w + size / 2 &&
          y > obstacle.y - size / 2 &&
          y < obstacle.y + obstacle.h + size / 2
        ) {
          validPosition = false;
          break;
        }
      }
    }

    boosters.push({ x, y, size });
  }
}

function setupDifficulty() {
  let difficultyInput = prompt('Select difficulty level: Easy, Medium, Hard', 'Easy');
  difficulty = difficultyInput || 'Easy';

  switch (difficulty.toLowerCase()) {
    case 'easy':
      obstacleFrequency = 90; // Fewer obstacles
      break;
    case 'medium':
      obstacleFrequency = 60; // Moderate obstacles
      break;
    case 'hard':
      obstacleFrequency = 30; // More obstacles
      break;
    default:
      obstacleFrequency = 90; // Default to Easy if input is invalid
  }
}
