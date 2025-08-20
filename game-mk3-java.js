// =======================
// Game Variables
// =======================
let bird;
let pipes = [];
let gameInterval;
let score = 0;
let gameStarted = false;
let gravity = 0.5;
let jumpForce = -10;
let birdVelocity = 0;
let minVerticalGap = 150;
let maxVerticalGap = 180;
let horizontalGap = 250 + Math.random() * 40; // Random 250–290

// DOM Elements
const gameContainer = document.getElementById('game');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const startButtonContainer = document.querySelector('.start-btn-container');
const highScoresList = document.getElementById('high-scores');
const leaderboardElement = document.getElementById('leaderboard');

// Audio
let bgMusic, jumpSound, scoreSound, hitSound;
let soundEnabled = true;


// =======================
// Initialization
// =======================
window.onload = initGame;

function initGame() {
    preloadImages();
    initAudio();

    // Create bird
    bird = document.createElement('div');
    bird.id = 'bird';
    gameContainer.appendChild(bird);

    // Load high scores
    loadHighScores();

    // Event Listeners
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('touchstart', handleTouch);

    startButton.addEventListener('click', startGame);
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);
    document.getElementById('leaderboard-btn').addEventListener('click', showLeaderboard);
    document.getElementById('close-leaderboard').addEventListener('click', hideLeaderboard);
    document.getElementById('sound-toggle').addEventListener('click', toggleSound);

    resetBirdPosition();
}

function preloadImages() {
    const imageUrls = ['bird.webp', 'background.webp', 'tembok.webp'];
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

function initAudio() {
    bgMusic = document.getElementById('bg-music');
    jumpSound = document.getElementById('jump-sound');
    scoreSound = document.getElementById('score-sound');
    hitSound = document.getElementById('hit-sound');

    bgMusic.volume = 0.3;
    jumpSound.volume = 0.5;
    scoreSound.volume = 0.5;
    hitSound.volume = 0.7;
}


// =======================
// Controls
// =======================
function handleKeyPress(e) {
    if ((e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') && gameStarted) {
        e.preventDefault(); // 🚀 fix bug space toggle button
        birdVelocity = jumpForce;
        animateBirdJump();
    }
}

function handleTouch(e) {
    if (gameStarted) {
        birdVelocity = jumpForce;
        animateBirdJump();
        e.preventDefault();
    }
}

function animateBirdJump() {
    bird.style.transform = 'rotate(-25deg)';
    playSound(jumpSound);
    setTimeout(() => {
        bird.style.transform = 'rotate(0deg)';
    }, 200);
}


// =======================
// Game Loop
// =======================
function startGame() {
    if (gameStarted) return;

    startButtonContainer.style.display = 'none';

    gameStarted = true;
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    birdVelocity = 0;
    resetBirdPosition();

    pipes.forEach(pipe => pipe.element.remove());
    pipes = [];

    if (soundEnabled) {
        bgMusic.play().catch(e => console.log("Autoplay prevented:", e));
    }

    gameInterval = setInterval(gameLoop, 20);
}

function gameLoop() {
    // Bird movement
    birdVelocity += gravity;
    const currentTop = parseInt(bird.style.top);
    const newTop = currentTop + birdVelocity;
    bird.style.top = `${newTop}px`;

    bird.style.transform = `rotate(${birdVelocity * 2}deg)`;

    // Collision with ground/ceiling
    if (newTop <= 0 || newTop >= gameContainer.offsetHeight - bird.offsetHeight) {
        gameOver();
        return;
    }

    // Generate pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < gameContainer.offsetWidth - horizontalGap) {
        createPipe();
    }

    movePipes();
    checkScore();
}

function resetBirdPosition() {
    bird.style.left = '100px';
    bird.style.top = '50%';
}


// =======================
// Pipes
// =======================
function createPipe() {
    const verticalGap = minVerticalGap + Math.random() * (maxVerticalGap - minVerticalGap);
    const pipeHeight = Math.floor(Math.random() * (gameContainer.offsetHeight - verticalGap - 100)) + 50;
    horizontalGap = 250 + Math.random() * 40;

    // Top pipe
    const topPipe = document.createElement('div');
    topPipe.className = 'pipe pipe-top';
    topPipe.style.height = `${pipeHeight}px`;
    topPipe.style.top = '0';
    topPipe.style.left = `${gameContainer.offsetWidth}px`;
    gameContainer.appendChild(topPipe);

    // Bottom pipe
    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe';
    bottomPipe.style.height = `${gameContainer.offsetHeight - pipeHeight - verticalGap}px`;
    bottomPipe.style.bottom = '0';
    bottomPipe.style.left = `${gameContainer.offsetWidth}px`;
    gameContainer.appendChild(bottomPipe);

    pipes.push({ element: topPipe, x: gameContainer.offsetWidth, height: pipeHeight, passed: false });
    pipes.push({ element: bottomPipe, x: gameContainer.offsetWidth, height: gameContainer.offsetHeight - pipeHeight - verticalGap, passed: false });
}

function movePipes() {
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        pipe.x -= 2;
        pipe.element.style.left = `${pipe.x}px`;

        // Collision
        if (
            parseInt(bird.style.left) + bird.offsetWidth > pipe.x &&
            parseInt(bird.style.left) < pipe.x + pipe.element.offsetWidth &&
            (
                (pipe.element.style.top === '0px' && parseInt(bird.style.top) < pipe.height) ||
                (pipe.element.style.bottom === '0px' && parseInt(bird.style.top) + bird.offsetHeight > gameContainer.offsetHeight - pipe.height)
            )
        ) {
            gameOver();
            return;
        }

        // Remove off-screen
        if (pipe.x < -pipe.element.offsetWidth) {
            pipe.element.remove();
            pipes.splice(i, 1);
            i--;
        }
    }
}


// =======================
// Score & Leaderboard
// =======================
function checkScore() {
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        if (!pipe.passed && pipe.x + pipe.element.offsetWidth < parseInt(bird.style.left)) {
            pipe.passed = true;
            if (i % 2 === 0) {
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
                playSound(scoreSound);
            }
        }
    }
}

function saveScore(score) {
    let highScores = JSON.parse(localStorage.getItem('flappyBirdHighScores')) || [];
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 5);
    localStorage.setItem('flappyBirdHighScores', JSON.stringify(highScores));
}

function loadHighScores() {
    const highScores = JSON.parse(localStorage.getItem('flappyBirdHighScores')) || [];
    highScoresList.innerHTML = '';
    highScores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${score}`;
        highScoresList.appendChild(li);
    });
}


// =======================
// Game Over
// =======================
function gameOver() {
    clearInterval(gameInterval);
    gameStarted = false;

    playSound(hitSound);

    bgMusic.pause();
    bgMusic.currentTime = 0;

    const gameOverMsg = document.createElement('div');
    gameOverMsg.textContent = 'GAME OVER!';
    gameOverMsg.classList.add('game-over-message');
    document.body.appendChild(gameOverMsg);

    setTimeout(() => { gameOverMsg.style.opacity = '1'; }, 10);
    setTimeout(() => {
        gameOverMsg.style.opacity = '0';
        setTimeout(() => { document.body.removeChild(gameOverMsg); }, 300);
    }, 1500);

    startButtonContainer.style.display = 'block';

    saveScore(score);
    loadHighScores();
}


// =======================
// Misc
// =======================
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => alert(`Error: ${err.message}`));
    } else {
        document.exitFullscreen();
    }
}

function showLeaderboard() {
    leaderboardElement.style.display = 'block';
}

function hideLeaderboard() {
    leaderboardElement.style.display = 'none';
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundButton = document.getElementById('sound-toggle');
    if (soundEnabled) {
        soundButton.textContent = '🔊 Sound On';
        bgMusic.play().catch(e => console.log("Autoplay prevented:", e));
    } else {
        soundButton.textContent = '🔇 Sound Off';
        bgMusic.pause();
    }
}

function playSound(sound) {
    if (soundEnabled) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Sound play prevented:", e));
    }
}
