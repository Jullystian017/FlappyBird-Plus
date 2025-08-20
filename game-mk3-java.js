// Game variables
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
let horizontalGap = 250 + Math.random() * 40; // Random between 250-290

// DOM elements
const gameContainer = document.getElementById('game');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const startButtonContainer = document.querySelector('.start-btn-container');
const highScoresList = document.getElementById('high-scores');
const leaderboardElement = document.getElementById('leaderboard');

// Preload images for better performance
function preloadImages() {
    const imageUrls = ['bird.webp', 'background.webp', 'tembok.webp'];
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Initialize game
function initGame() {
    // Preload images
    preloadImages();
    
    // Create bird
    bird = document.createElement('div');
    bird.id = 'bird';
    gameContainer.appendChild(bird);
    
    // Load high scores
    loadHighScores();
    
    // Event listeners
    document.addEventListener('keydown', handleKeyPress);
    startButton.addEventListener('click', startGame);
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);
    document.getElementById('leaderboard-btn').addEventListener('click', showLeaderboard);
    document.getElementById('close-leaderboard').addEventListener('click', hideLeaderboard);
    
    // Add touch support for mobile devices
    document.addEventListener('touchstart', handleTouch);
    
    // Position bird initially
    resetBirdPosition();
}

function resetBirdPosition() {
    bird.style.left = '100px';
    bird.style.top = '50%';
}

// Handle keyboard input
function handleKeyPress(e) {
    if ((e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') && gameStarted) {
        birdVelocity = jumpForce;
        animateBirdJump();
    }
}

// Handle touch input
function handleTouch(e) {
    if (gameStarted) {
        birdVelocity = jumpForce;
        animateBirdJump();
        e.preventDefault(); // Prevent default touch behavior
    }
}

// Animate bird when jumping
function animateBirdJump() {
    bird.style.transform = 'rotate(-25deg)';
    setTimeout(() => {
        bird.style.transform = 'rotate(0deg)';
    }, 200);
}

// Start game
function startGame() {
    if (gameStarted) return;
    
    // Hide start button
    startButtonContainer.style.display = 'none';
    
    // Reset game state
    gameStarted = true;
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    birdVelocity = 0;
    resetBirdPosition();
    
    // Clear existing pipes
    pipes.forEach(pipe => pipe.element.remove());
    pipes = [];
    
    // Start game loop
    gameInterval = setInterval(gameLoop, 20);
}

// Game loop
function gameLoop() {
    // Apply gravity to bird
    birdVelocity += gravity;
    const currentTop = parseInt(bird.style.top);
    const newTop = currentTop + birdVelocity;
    bird.style.top = `${newTop}px`;
    
    // Rotate bird based on velocity
    bird.style.transform = `rotate(${birdVelocity * 2}deg)`;
    
    // Check for collisions with ground or ceiling
    if (newTop <= 0 || newTop >= gameContainer.offsetHeight - bird.offsetHeight) {
        gameOver();
        return;
    }
    
    // Generate new pipes with random gaps
    if (pipes.length === 0 || 
        (pipes[pipes.length-1].x < gameContainer.offsetWidth - horizontalGap)) {
        createPipe();
    }
    
    // Move pipes and check for collisions
    movePipes();
    
    // Check for score (passed a pipe)
    checkScore();
}

// Create a new pipe
function createPipe() {
    const verticalGap = minVerticalGap + Math.random() * (maxVerticalGap - minVerticalGap);
    const pipeHeight = Math.floor(Math.random() * (gameContainer.offsetHeight - verticalGap - 100)) + 50;
    horizontalGap = 250 + Math.random() * 40; // Random between 250-290
    
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
    
    pipes.push({
        element: topPipe,
        x: gameContainer.offsetWidth,
        height: pipeHeight,
        passed: false
    });
    
    pipes.push({
        element: bottomPipe,
        x: gameContainer.offsetWidth,
        height: gameContainer.offsetHeight - pipeHeight - verticalGap,
        passed: false
    });
}

// Move all pipes
function movePipes() {
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        pipe.x -= 2;
        pipe.element.style.left = `${pipe.x}px`;
        
        // Check for collision with bird
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
        
        // Remove pipe if off screen
        if (pipe.x < -pipe.element.offsetWidth) {
            pipe.element.remove();
            pipes.splice(i, 1);
            i--;
        }
    }
}

// Check if bird passed a pipe
function checkScore() {
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        if (!pipe.passed && pipe.x + pipe.element.offsetWidth < parseInt(bird.style.left)) {
            pipe.passed = true;
            if (i % 2 === 0) { // Only count once per pipe pair
                score++;
                scoreDisplay.textContent = `Score: ${score}`;
            }
        }
    }
}

// Game over
function gameOver() {
    clearInterval(gameInterval);
    gameStarted = false;
    
    // Create and style the Game Over message
    const gameOverMsg = document.createElement('div');
    gameOverMsg.textContent = 'GAME OVER!';
    gameOverMsg.classList.add('game-over-message');
    
    document.body.appendChild(gameOverMsg);
    
    // Fade in animation
    setTimeout(() => {
        gameOverMsg.style.opacity = '1';
    }, 10);
    
    // Fade out and remove after 1.5 seconds
    setTimeout(() => {
        gameOverMsg.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(gameOverMsg);
        }, 300);
    }, 1500);
    
    // Show start button again
    startButtonContainer.style.display = 'block';
    
    saveScore(score);
    loadHighScores();
}

// Save score to local storage
function saveScore(score) {
    let highScores = JSON.parse(localStorage.getItem('flappyBirdHighScores')) || [];
    highScores.push(score);
    highScores.sort((a, b) => b - a); // Sort descending
    highScores = highScores.slice(0, 5); // Keep only top 5
    localStorage.setItem('flappyBirdHighScores', JSON.stringify(highScores));
}

// Load high scores from local storage
function loadHighScores() {
    const highScores = JSON.parse(localStorage.getItem('flappyBirdHighScores')) || [];
    highScoresList.innerHTML = '';
    
    highScores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${score}`;
        highScoresList.appendChild(li);
    });
}

// Fullscreen toggle
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Show leaderboard
function showLeaderboard() {
    leaderboardElement.style.display = 'block';
}

// Hide leaderboard
function hideLeaderboard() {
    leaderboardElement.style.display = 'none';
}

// Initialize the game when the page loads
window.onload = initGame;