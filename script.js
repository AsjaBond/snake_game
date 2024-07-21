const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = 20;
canvas.width = gridSize * tileCount;
canvas.height = gridSize * tileCount;

let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let fruit = getRandomFruitPosition();
let score = 0;
let bestScores = JSON.parse(localStorage.getItem('bestScores')) || [0, 0, 0, 0, 0];
let gameInterval;
let isGameOver = false;

document.addEventListener('keydown', changeDirection);

// Initial setup to draw game and update score table
drawGame();
updateScoreTable();

// Add event listener for reset scores button
document.getElementById('resetScoresButton').addEventListener('click', resetScores);

function changeDirection(event) {
    if (isGameOver) {
        resetGame();
        return;
    }

    const keyPressed = event.keyCode;
    const goingUp = direction.y === -1;
    const goingDown = direction.y === 1;
    const goingRight = direction.x === 1;
    const goingLeft = direction.x === -1;

    if (keyPressed === 37 && !goingRight) { // Left arrow
        direction = { x: -1, y: 0 };
    }
    if (keyPressed === 38 && !goingDown) { // Up arrow
        direction = { x: 0, y: -1 };
    }
    if (keyPressed === 39 && !goingLeft) { // Right arrow
        direction = { x: 1, y: 0 };
    }
    if (keyPressed === 40 && !goingUp) { // Down arrow
        direction = { x: 0, y: 1 };
    }

    if (!gameInterval) {
        gameInterval = setInterval(gameLoop, 100);
    }
}

function getRandomFruitPosition() {
    let newFruitPosition;
    while (true) {
        newFruitPosition = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
        let collision = snake.some(part => part.x === newFruitPosition.x && part.y === newFruitPosition.y);
        if (!collision) break;
    }
    return newFruitPosition;
}

function gameLoop() {
    let head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.some(part => part.x === head.x && part.y === head.y)) {
        return gameOver();
    }

    snake.unshift(head);

    if (head.x === fruit.x && head.y === fruit.y) {
        score++;
        document.getElementById('score').innerText = score;
        fruit = getRandomFruitPosition();
    } else {
        snake.pop();
    }

    drawGame();
}

function drawGame() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'red';
    ctx.fillRect(fruit.x * gridSize, fruit.y * gridSize, gridSize, gridSize);

    ctx.fillStyle = 'green';
    snake.forEach(part => ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize));
}

function gameOver() {
    clearInterval(gameInterval);
    gameInterval = null;
    bestScores.push(score);
    bestScores = [...new Set(bestScores)]; // Remove duplicates
    bestScores.sort((a, b) => b - a); // Sort in descending order
    bestScores = bestScores.slice(0, 5); // Keep only the top 5 scores
    localStorage.setItem('bestScores', JSON.stringify(bestScores));
    updateScoreTable();

    isGameOver = true;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Black with 70% opacity
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Press any key to try again', canvas.width / 2, canvas.height / 2 + 20);
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    score = 0;
    isGameOver = false;
    document.getElementById('score').innerText = score;
    fruit = getRandomFruitPosition();
    drawGame();
}

function resetScores() {
    bestScores = [0, 0, 0, 0, 0]; // Reset to default scores
    localStorage.setItem('bestScores', JSON.stringify(bestScores));
    updateScoreTable();
}

function updateScoreTable() {
    const tableBody = document.querySelector('#scoreTable tbody');
    tableBody.innerHTML = '';

    // Fill table with scores
    bestScores.forEach((score, index) => {
        let row = document.createElement('tr');
        let rankCell = document.createElement('td');
        rankCell.innerText = index + 1;
        let scoreCell = document.createElement('td');
        scoreCell.innerText = score;
        row.appendChild(rankCell);
        row.appendChild(scoreCell);
        tableBody.appendChild(row);
    });

    // Add empty rows if there are less than 5 scores
    for (let i = bestScores.length; i < 5; i++) {
        let row = document.createElement('tr');
        let rankCell = document.createElement('td');
        rankCell.innerText = i + 1;
        let scoreCell = document.createElement('td');
        scoreCell.innerText = '0'; // Default score for empty rows
        row.appendChild(rankCell);
        row.appendChild(scoreCell);
        tableBody.appendChild(row);
    }
}
