const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const fuelElement = document.getElementById('fuel');

let score = 0;
let fuel = 100;
let gameRunning = false;
let playerX = canvas.width / 2 - 25;
let playerY = canvas.height - 40;
let playerCar = {
    x: playerX,
    y: playerY,
    imgWidth: 80,
    imgHeight: 90,
    width: 60 * 1 / 2,
    height: 120 * 2 / 3,
    speed: 10,
    rotation: 0
};
let obstacles = [];
let obstacleSpeed = 3;
let playerImage = new Image();
playerImage.src = 'img/player.png';

const obstacleImages = [
    'img/object_1.png',
    'img/object_2.png',
    'img/object_3.png'
].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});

let targetRotation = 0;
let gameLoopInterval;  

// Vẽ đường đua (nét đứt cho các làn)
function drawTrack() {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const laneWidth = canvas.width / 4;
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);

    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(laneWidth * i, 0);
        ctx.lineTo(laneWidth * i, canvas.height);
        ctx.stroke();
    }
    ctx.setLineDash([]);
}

// Vẽ xe người chơi với góc xoay
function drawPlayerCar() {
    ctx.save();
    ctx.translate(playerCar.x + playerCar.width / 2, playerCar.y + playerCar.height / 2);
    ctx.rotate(playerCar.rotation * Math.PI / 180);
    ctx.drawImage(playerImage, -playerCar.imgWidth / 2, -playerCar.imgHeight / 2, playerCar.imgWidth, playerCar.imgHeight);
    ctx.restore();
}

// Tạo chướng ngại vật
function createObstacle() {
    const img = obstacleImages[Math.floor(Math.random() * obstacleImages.length)];
    const imgWidth = 80;
    const imgHeight = 100 * 2 / 3;
    const width = imgWidth * 1 / 3;
    const height = imgHeight * 2 / 3;
    const x = Math.floor(Math.random() * (canvas.width - width));
    const y = -height;
    const speed = Math.random() * 2 + 2;

    obstacles.push({ x, y, imgWidth, imgHeight, width, height, speed, img });
}

// Cập nhật vị trí chướng ngại vật
function updateObstacles() {
    for (let obs of obstacles) {
        obs.y += obs.speed;
    }
    obstacles = obstacles.filter(obs => obs.y < canvas.height);
}

// Kiểm tra va chạm
function checkCollision() {
    for (let obs of obstacles) {
        if (
            playerCar.x < obs.x + obs.width &&
            playerCar.x + playerCar.width > obs.x &&
            playerCar.y < obs.y + obs.height &&
            playerCar.y + playerCar.height > obs.y
        ) {
            stopGame();
            alert("Game Over! Your score: " + score);
            return;
        }
    }
}

// Vẽ chướng ngại vật
function drawObstacles() {
    for (let obs of obstacles) {
        ctx.drawImage(obs.img, obs.x, obs.y, obs.imgWidth, obs.imgHeight);
    }
}

// Hiệu ứng xoay mượt
function smoothRotation() {
    playerCar.rotation += (targetRotation - playerCar.rotation) * 0.2;
}

// Vòng lặp game
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTrack();
    smoothRotation();
    drawPlayerCar();
    updateObstacles();
    checkCollision();
    drawObstacles();

    if (Math.random() < 0.01) createObstacle();

    score += 1;
    scoreElement.textContent = score;
    fuel -= 0.1;
    fuelElement.textContent = Math.max(0, Math.floor(fuel));

    if (fuel <= 0) {
        stopGame();
        alert("Game Over! Your score: " + score);
    }
}

// Bắt đầu game
function startGame() {
    if (gameLoopInterval) clearInterval(gameLoopInterval); 
    resetGameVariables();  
    gameRunning = true;
    gameLoopInterval = setInterval(gameLoop, 1000 / 60);
}

// Dừng game
function stopGame() {
    gameRunning = false;
    clearInterval(gameLoopInterval);  
}

// Khởi tạo lại các biến
function resetGameVariables() {
    playerCar.x = canvas.width / 2 - playerCar.width / 2;
    playerCar.y = canvas.height - 80;
    playerCar.rotation = 0;
    targetRotation = 0;
    obstacles = [];
    score = 0;
    fuel = 100;
    scoreElement.textContent = score;
    fuelElement.textContent = fuel;
}

// Restart game
function restartGame() {
    startGame();
}

// Di chuyển xe người chơi (trái/phải, lên/xuống) và xoay
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    if (e.key === 'ArrowLeft' && playerCar.x > 0) {
        playerCar.x -= playerCar.speed;
        targetRotation = -20;  
    } else if (e.key === 'ArrowRight' && playerCar.x < canvas.width - playerCar.width) {
        playerCar.x += playerCar.speed;
        targetRotation = 20; 
    } else if (e.key === 'ArrowUp' && playerCar.y > 0) {
        playerCar.y -= playerCar.speed;
    } else if (e.key === 'ArrowDown' && playerCar.y < canvas.height - playerCar.height) {
        playerCar.y += playerCar.speed;
    }
});

document.addEventListener('keyup', (e) => {
    if (!gameRunning) return;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        targetRotation = 0; 
    }
});
