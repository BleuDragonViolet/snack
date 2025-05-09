const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const currentScoreDisplay = document.getElementById("currentScore");
const highScoreDisplay = document.getElementById("highScore");

canvas.width = 400;
canvas.height = 400;

const gridSize = 20;
let snake, direction, food, score, highScore, gameInterval;
let isGameRunning = false;

const headImg = new Image();
headImg.src = "image11.png";

const bodyImg = new Image();
bodyImg.src = "image12.png";

const tailImg = new Image();
tailImg.src = "image13.png";

const cornerImg = new Image();
cornerImg.src = "image14.png"; // Nouvelle image de virage

const foodImg = new Image();
foodImg.src = "image1.png";

// Fonction pour dessiner une image avec rotation
function drawRotatedImage(img, x, y, angle) {
  ctx.save();
  ctx.translate(x + gridSize / 2, y + gridSize / 2);
  ctx.rotate(angle);
  ctx.drawImage(img, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
  ctx.restore();
}

// Fonction pour obtenir l'angle entre deux segments
function getAngleBetweenSegments(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === gridSize) return 0;
  if (dx === -gridSize) return Math.PI;
  if (dy === gridSize) return Math.PI / 2;
  if (dy === -gridSize) return -Math.PI / 2;
  return 0;
}

// Initialise le jeu
function resetGame() {
  snake = [{ x: canvas.width / 2, y: canvas.height / 2 }];
  direction = { x: 1, y: 0 };
  food = { x: randomPosition(), y: randomPosition() };
  score = 0;
  updateScore();
}

// Génère une position aléatoire
function randomPosition() {
  return Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
}

// Met à jour les scores
function updateScore() {
  currentScoreDisplay.textContent = score;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    highScoreDisplay.textContent = highScore;
  }
}

// Place une nouvelle pomme
function placeFood() {
  food.x = randomPosition();
  food.y = randomPosition();
}

// Met à jour le jeu
function update() {
  if (!isGameRunning) return;

  const head = { ...snake[0] };
  head.x += direction.x * gridSize;
  head.y += direction.y * gridSize;

  if (
    head.x < 0 || head.y < 0 ||
    head.x >= canvas.width || head.y >= canvas.height ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    isGameRunning = false;
    clearInterval(gameInterval);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    updateScore();
    placeFood();
  } else {
    snake.pop();
  }
}

// Dessine le jeu
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(foodImg, food.x, food.y, gridSize, gridSize);

  for (let i = 0; i < snake.length; i++) {
    const segment = snake[i];
    let img;
    let angle = 0;

    if (snake.length === 1) {
      img = headImg;
    } else if (i === 0) {
      img = headImg;
      angle = getAngleBetweenSegments(segment, snake[i + 1]);
    } else if (i === snake.length - 1) {
      img = tailImg;
      angle = getAngleBetweenSegments(snake[i - 1], segment);
    } else {
      const prev = snake[i - 1];
      const next = snake[i + 1];

      const dx1 = segment.x - prev.x;
      const dy1 = segment.y - prev.y;
      const dx2 = next.x - segment.x;
      const dy2 = next.y - segment.y;

      // Ligne droite
      if ((dx1 === dx2 && dx1 !== 0) || (dy1 === dy2 && dy1 !== 0)) {
        img = bodyImg;
        angle = getAngleBetweenSegments(prev, segment);
      } else {
        // Virage
        img = cornerImg;

        if ((dx1 === 0 && dy1 === -gridSize && dx2 === gridSize && dy2 === 0) ||
            (dx2 === 0 && dy2 === -gridSize && dx1 === gridSize && dy1 === 0)) {
          angle = 0; // Bas → Droite
        } else if ((dx1 === 0 && dy1 === -gridSize && dx2 === -gridSize && dy2 === 0) ||
                   (dx2 === 0 && dy2 === -gridSize && dx1 === -gridSize && dy1 === 0)) {
          angle = Math.PI / 2; // Bas → Gauche
        } else if ((dx1 === 0 && dy1 === gridSize && dx2 === -gridSize && dy2 === 0) ||
                   (dx2 === 0 && dy2 === gridSize && dx1 === -gridSize && dy1 === 0)) {
          angle = Math.PI; // Haut → Gauche
        } else if ((dx1 === 0 && dy1 === gridSize && dx2 === gridSize && dy2 === 0) ||
                   (dx2 === 0 && dy2 === gridSize && dx1 === gridSize && dy1 === 0)) {
          angle = -Math.PI / 2; // Haut → Droite
        }
      }
    }

    drawRotatedImage(img, segment.x, segment.y, angle);
  }
}

// Boucle principale
function gameLoop() {
  update();
  draw();
}

// Démarrer
function startGame() {
  if (isGameRunning) return;
  resetGame();
  isGameRunning = true;
  gameInterval = setInterval(gameLoop, 100);
}

// Contrôles
window.addEventListener("keydown", (e) => {
  if (!isGameRunning) return;
  switch (e.key) {
    case "ArrowUp":
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
});

highScore = localStorage.getItem("highScore") || 0;
highScoreDisplay.textContent = highScore;
startButton.addEventListener("click", startGame);
resetGame();
