const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const fuelElement = document.getElementById('fuel');
const gameOverContainer = document.getElementById('game-over-container');
const finalScoreElement = document.getElementById('final-score');
const customMessageElement = document.getElementById('custom-message');

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
    speed: 7,
    rotation: 0
};
let obstacles = [];
let obstacleSpeed = 5;
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
let lineOffset = 0;
let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// Nhạc nền và hiệu ứng âm thanh
let backgroundMusic = new Audio('audio/background.mp3');
let collisionSound = new Audio('audio/collision.mp3');

backgroundMusic.loop = true; // Lặp lại nhạc nền

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

function drawTrack() {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const laneWidth = canvas.width / 4;
    ctx.strokeStyle = '#FFFF00';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);

    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(laneWidth * i, lineOffset);
        ctx.lineTo(laneWidth * i, canvas.height + lineOffset);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    lineOffset += 5; // Tốc độ của đường kẻ
    if (lineOffset > 40) lineOffset = 0; // Đặt lại vị trí khi vượt quá 1 chu kỳ
}

function drawPlayerCar() {
    ctx.save();
    ctx.translate(playerCar.x + playerCar.width / 2, playerCar.y + playerCar.height / 2);
    ctx.rotate(playerCar.rotation * Math.PI / 180);
    ctx.drawImage(playerImage, -playerCar.imgWidth / 2, -playerCar.imgHeight / 2, playerCar.imgWidth, playerCar.imgHeight);
    ctx.restore();
}

function createObstacle() {
    const img = obstacleImages[Math.floor(Math.random() * obstacleImages.length)];
    const imgWidth = 80;
    const imgHeight = 100 * 2 / 3;
    const width = imgWidth * 1 / 3;
    const height = imgHeight * 2 / 3;

    let x, y;
    let positionValid;

    do {
        x = Math.floor(Math.random() * (canvas.width - width));
        y = -height;
        positionValid = obstacles.every(obs => (
            x + width < obs.x || 
            x > obs.x + obs.width || 
            y + height < obs.y || 
            y > obs.y + obs.height
        ));
    } while (!positionValid);

    const speed = Math.random() * 3 + 5;
    obstacles.push({ x, y, imgWidth, imgHeight, width, height, speed, img });
}

function updateObstacles() {
    for (let obs of obstacles) {
        obs.y += obs.speed;
    }
    obstacles = obstacles.filter(obs => obs.y < canvas.height);
}

function checkCollision() {
    for (let obs of obstacles) {
        if (
            playerCar.x < obs.x + obs.width &&
            playerCar.x + playerCar.width > obs.x &&
            playerCar.y < obs.y + obs.height &&
            playerCar.y + playerCar.height > obs.y
        ) {
            collisionSound.play(); // Phát âm thanh va chạm
            stopGame();
            showGameOverContainer("Better luck next time!");
            return;
        }
    }
}

function drawObstacles() {
    for (let obs of obstacles) {
        ctx.drawImage(obs.img, obs.x, obs.y, obs.imgWidth, obs.imgHeight);
    }
}

function updatePlayerPosition() {
    if (keys.ArrowLeft && playerCar.x > 0) {
        playerCar.x -= playerCar.speed;
        targetRotation = -20;
    }
    if (keys.ArrowRight && playerCar.x < canvas.width - playerCar.width) {
        playerCar.x += playerCar.speed;
        targetRotation = 20;
    }
    if (keys.ArrowUp && playerCar.y > 0) {
        playerCar.y -= playerCar.speed;
    }
    if (keys.ArrowDown && playerCar.y < canvas.height - playerCar.height) {
        playerCar.y += playerCar.speed;
    }
}

function smoothRotation() {
    if (!keys.ArrowLeft && !keys.ArrowRight) {
        targetRotation = 0;
    }
    playerCar.rotation += (targetRotation - playerCar.rotation) * 0.1;
}

function gameLoop() {
    if (!gameRunning) return; // Kiểm tra nếu gameRunning là false thì dừng vòng lặp

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTrack();
    smoothRotation();
    updatePlayerPosition();
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
        showGameOverContainer("Fuel exhausted! Try again.");
    } else {
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    if (gameRunning) return; // Nếu game đã đang chạy, không khởi động lại
    resetGameVariables();
    gameRunning = true;
    requestAnimationFrame(gameLoop); // Đảm bảo không sử dụng `setInterval`
    backgroundMusic.play(); // Phát nhạc nền
}

function stopGame() {
    gameRunning = false;
    backgroundMusic.pause(); // Dừng nhạc nền
}

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
    gameOverContainer.style.display = 'none'; // Ẩn container thông báo khi bắt đầu lại game
}

function restartGame() {
    stopGame(); // Dừng game trước khi khởi động lại
    startGame(); // Khởi động lại game
}

function showGameOverContainer(message) {
    finalScoreElement.textContent = score;
    customMessageElement.textContent = message;
    gameOverContainer.style.display = 'block';
    stopGame(); // Đảm bảo dừng game khi hiển thị thông báo
}
