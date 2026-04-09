const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const catImg = new Image();
catImg.src = "cat.png";

let gameStarted = false;
let gameOver = false;
let score = 0;

let speed = 1.5;
let difficulty = 1;
let lastIncrease = 0;

let player = {
    x: 100,
    y: 200,
    width: 50,
    height: 50,
    velY: 0,
    jumping: false
};

let platforms = [];
let coins = [];

let bgLayers = [
    { x: 0, speed: 0.3 },
    { x: 0, speed: 0.6 },
    { x: 0, speed: 1 }
];

let clouds = [];
for (let i = 0; i < 5; i++) {
    clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * 200,
        size: 40 + Math.random() * 60
    });
}

const gravity = 0.25;

document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !player.jumping && !gameOver) {
        player.velY = -9;
        player.jumping = true;
    }
});

function generateLevel() {
    platforms = [];
    coins = [];

    let startPlatform = {
        x: 50,
        y: canvas.height - 120,
        width: 220,
        height: 20
    };

    platforms.push(startPlatform);

    player.x = 100;
    player.y = startPlatform.y - player.height;

    let x = startPlatform.x + startPlatform.width;

    for (let i = 0; i < 8; i++) {

        let width = 120 + Math.random() * 80;
        let gap = 40 + Math.random() * 40;
        let height = canvas.height - (Math.random() * 80 + 100);

        let platformX = x + gap;

        platforms.push({
            x: platformX,
            y: height,
            width: width,
            height: 20
        });

        if (Math.random() > 0.5) {
            coins.push({
                x: platformX + width / 2,
                y: height - 25,
                size: 8
            });
        }

        x += width + gap;
    }
}

function update() {
    if (gameOver) {
        player.velY += 0.2;
        player.y += player.velY;
        return;
    }

    if (Date.now() - lastIncrease > 2000) {
        difficulty += 0.15;
        lastIncrease = Date.now();
    }

    speed = 1.5 + Math.sqrt(difficulty) * 0.8;

    if (speed > 4) speed = 4;
    if (difficulty > 3) difficulty = 3;

    platforms.forEach(p => p.x -= speed);
    coins.forEach(c => c.x -= speed);

    coins = coins.filter(c => c.x + c.size > 0);

    player.velY += gravity;
    player.y += player.velY;

    platforms.forEach(p => {
        if (
            player.x < p.x + p.width &&
            player.x + player.width > p.x &&
            player.y < p.y + p.height &&
            player.y + player.height > p.y
        ) {
            player.y = p.y - player.height;
            player.velY = 0;
            player.jumping = false;
        }
    });

    coins = coins.filter(c => {
        let hit =
            player.x < c.x + c.size &&
            player.x + player.width > c.x &&
            player.y < c.y + c.size &&
            player.y + player.height > c.y;

        if (hit) score++;

        return !hit;
    });

    if (platforms.length && platforms[0].x + platforms[0].width < 0) {
        platforms.shift();

        let last = platforms[platforms.length - 1];

        let width = 120 + Math.random() * 80;
        let gap = 40 + Math.random() * 40;
        let height = canvas.height - (Math.random() * 80 + 100);

        let newX = last.x + last.width + gap;

        platforms.push({
            x: newX,
            y: height,
            width: width,
            height: 20
        });

        if (Math.random() > 0.5) {
            coins.push({
                x: newX + width / 2,
                y: height - 25,
                size: 8
            });
        }
    }

    if (player.y > canvas.height) {
        endGame("GAME OVER 💀");
    }

    if (score >= 100) {
        endGame("YOU WIN 🏆");
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    bgLayers.forEach((layer, i) => {
        layer.x -= layer.speed;
        if (layer.x <= -canvas.width) layer.x = 0;

        let colors = ["#a0d8ef", "#87CEEB", "#5dade2"];
        ctx.fillStyle = colors[i];

        ctx.fillRect(layer.x, 0, canvas.width, canvas.height);
        ctx.fillRect(layer.x + canvas.width, 0, canvas.width, canvas.height);
    });

    ctx.fillStyle = "white";
    clouds.forEach(c => {
        c.x -= 0.2;
        if (c.x < -c.size) c.x = canvas.width;

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = "#2ecc71";
    platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    ctx.fillStyle = "#8B4513";
    coins.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.drawImage(catImg, player.x, player.y, player.width, player.height);

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Steaks: " + score, 20, 30);
}

function gameLoop() {
    if (gameStarted) {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

function startGame() {
    document.getElementById("startScreen").style.display = "none";
    gameStarted = true;
}

function endGame(text) {
    gameOver = true;
    document.getElementById("gameOverScreen").style.display = "flex";
    document.getElementById("gameOverText").innerText = text;
}

function restartGame() {
    location.reload();
}

generateLevel();
gameLoop();