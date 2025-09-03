 // ========== KONSTANTA DAN VARIABEL GLOBAL ==========
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        
        // Elemen UI
        const mainMenu = document.getElementById('main-menu');
        const nameInputScreen = document.getElementById('name-input-screen');
        const skinSelection = document.getElementById('skin-selection');
        const leaderboardScreen = document.getElementById('leaderboard');
        const achievementsScreen = document.getElementById('achievements');
        const settingsScreen = document.getElementById('settings');
        const gameOverScreen = document.getElementById('game-over');
        const pauseMenu = document.getElementById('pause-menu');
        const pauseBtn = document.getElementById('pause-btn');
        
        // Elemen audio
        const flapSound = document.getElementById('flap-sound');
        const pointSound = document.getElementById('point-sound');
        const hitSound = document.getElementById('hit-sound');
        const bgMusic = document.getElementById('bg-music');
        
        // Variabel game state
        let gameState = 'menu'; // menu, playing, paused, gameover
        let playerName = 'Player';
        let selectedBirdSkin = 'yellow';
        let score = 0;
        let highScore = 0;
        let gameSpeed = 0.8; // DIPERLAMBAT LAGI dari 2.0
        let gapSize = 280; // DIPERBESAR LAGI dari 250
        let backgroundMode = 'day'; // day or night
        let backgroundOffset = 0;
        let hardMode = false;
        
        // Daftar achievement
        const achievements = [
            { id: 'first_flight', name: 'First Flight', desc: 'Score your first point', achieved: false },
            { id: 'pro_flyer', name: 'Pro Flyer', desc: 'Score more than 10 points', achieved: false },
            { id: 'night_owl', name: 'Night Owl', desc: 'Play during night background', achieved: false },
            { id: 'high_scorer', name: 'High Scorer', desc: 'Score more than 50 points', achieved: false },
            { id: 'hard_mode', name: 'Hardcore Player', desc: 'Complete a game in hard mode', achieved: false }
        ];
        
        // Data leaderboard
        let leaderboard = [];
        
        // Pengaturan suara
        let soundEnabled = true;
        let musicEnabled = true;
        
        // Objek game
        let bird = {
            x: 180,
            y: canvas.height / 2,
            width: 60,
            height: 45,
            gravity: 0.1, 
            velocity: 0,
            jump: -5, 
            rotation: 0,
            flapCounter: 0,
            currentFrame: 0
        };
        
        let pipes = [];
        let particles = [];
        let stars = [];
        
        // Waktu untuk pergantian background
        let lastBackgroundChange = Date.now();
        let backgroundChangeInterval = 30000; // 30 detik
        
        // ========== INISIALISASI GAME ==========
        function init() {
            // Set ukuran canvas
            canvas.width = 1000;
            canvas.height = 700;
            
            // Muat high score dan leaderboard dari localStorage
            loadGameData();
            
            // Setup event listeners
            setupEventListeners();
            
            // Generate bintang untuk background malam
            generateStars();
            
            // Mulai game loop
            gameLoop();
        }
        
        // ========== EVENT LISTENERS ==========
        function setupEventListeners() {
            // Tombol menu utama
            document.getElementById('start-btn').addEventListener('click', showNameInput);
            document.getElementById('skin-btn').addEventListener('click', showSkinSelection);
            document.getElementById('leaderboard-btn').addEventListener('click', showLeaderboard);
            document.getElementById('achievements-btn').addEventListener('click', showAchievements);
            document.getElementById('settings-btn').addEventListener('click', showSettings);
            
            // Tombol input nama
            document.getElementById('play-btn').addEventListener('click', startGame);
            
            // Tombol skin selection
            document.querySelectorAll('.bird-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    document.querySelector('.bird-option.selected').classList.remove('selected');
                    e.target.classList.add('selected');
                    selectedBirdSkin = e.target.getAttribute('data-skin');
                });
            });
            document.getElementById('skin-back-btn').addEventListener('click', showMainMenu);
            
            // Tombol leaderboard
            document.getElementById('leaderboard-back-btn').addEventListener('click', showMainMenu);
            
            // Tombol achievements
            document.getElementById('achievements-back-btn').addEventListener('click', showMainMenu);
            
            // Tombol settings
            document.getElementById('sound-toggle').addEventListener('change', (e) => {
                soundEnabled = e.target.checked;
                updateAudioElements();
                updatePauseMenuButtons();
            });
            document.getElementById('music-toggle').addEventListener('change', (e) => {
                musicEnabled = e.target.checked;
                updateAudioElements();
                updatePauseMenuButtons();
            });
            document.getElementById('difficulty-toggle').addEventListener('change', (e) => {
                hardMode = e.target.checked;
            });
            document.getElementById('settings-back-btn').addEventListener('click', showMainMenu);
            
            // Tombol game over
            document.getElementById('try-again-btn').addEventListener('click', restartGame);
            document.getElementById('menu-btn').addEventListener('click', showMainMenu);
            
            // Kontrol game
            canvas.addEventListener('click', handleGameControl);
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space' && gameState === 'playing') {
                    flapBird();
                } else if (e.code === 'Space' && gameState === 'menu') {
                    showNameInput();
                } else if (e.code === 'Escape') {
                    togglePause();
                }
            });
            
            // Tombol pause
            pauseBtn.addEventListener('click', togglePause);
            
            // Tombol pause menu
            document.getElementById('resume-btn').addEventListener('click', togglePause);
            document.getElementById('sound-toggle-btn').addEventListener('click', toggleSound);
            document.getElementById('music-toggle-btn').addEventListener('click', toggleMusic);
            document.getElementById('main-menu-btn').addEventListener('click', backToMainMenu);
            
            // Tombol fullscreen
            document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);
        }
        
        function handleGameControl() {
            if (gameState === 'playing') {
                flapBird();
            }
        }
        
        function flapBird() {
            bird.velocity = bird.jump;
            bird.flapCounter = 0;
            
            // Play flap sound
            if (soundEnabled) {
                flapSound.currentTime = 0,3;
                flapSound.play().catch(e => console.log("Audio play failed:", e));
            }
        }
        
        // ========== MANAJEMEN TAMPILAN UI ==========
        function showScreen(screenToShow) {
            // Sembunyikan semua screen
            const screens = document.querySelectorAll('.screen');
            screens.forEach(screen => screen.classList.add('hidden'));
            
            // Tampilkan screen yang diminta
            screenToShow.classList.remove('hidden');
        }
        
        function showMainMenu() {
            gameState = 'menu';
            pauseBtn.classList.add('hidden');
            showScreen(mainMenu);
            stopBgMusic();
        }
        
        function showNameInput() {
            showScreen(nameInputScreen);
            document.getElementById('player-name').focus();
        }
        
        function showSkinSelection() {
            showScreen(skinSelection);
        }
        
        function showLeaderboard() {
            showScreen(leaderboardScreen);
            renderLeaderboard();
        }
        
        function showAchievements() {
            showScreen(achievementsScreen);
            renderAchievements();
        }
        
        function showSettings() {
            showScreen(settingsScreen);
        }
        
        function showGameOver() {
            gameState = 'gameover';
            document.getElementById('final-score').textContent = `SCORE: ${score}`;
            document.getElementById('high-score').textContent = `HIGH SCORE: ${highScore}`;
            showScreen(gameOverScreen);
            pauseBtn.classList.add('hidden');
            stopBgMusic();
            
            // Cek apakah skor masuk leaderboard
            updateLeaderboard();
            
            // Cek achievements
            checkAchievements();
        }
        
        function togglePause() {
            if (gameState === 'playing') {
                gameState = 'paused';
                showScreen(pauseMenu);
                pauseBtn.textContent = '▶';
                stopBgMusic();
            } else if (gameState === 'paused') {
                gameState = 'playing';
                pauseMenu.classList.add('hidden');
                pauseBtn.textContent = '❚❚';
                playBgMusic();
            }
        }
        
        function toggleSound() {
            soundEnabled = !soundEnabled;
            updateAudioElements();
            updatePauseMenuButtons();
            saveGameData();
        }
        
        function toggleMusic() {
            musicEnabled = !musicEnabled;
            updateAudioElements();
            updatePauseMenuButtons();
            
            if (musicEnabled && gameState === 'playing') {
                playBgMusic();
            } else {
                stopBgMusic();
            }
            
            saveGameData();
        }
        
        function updatePauseMenuButtons() {
            document.getElementById('sound-toggle-btn').textContent = `SOUND: ${soundEnabled ? 'ON' : 'OFF'}`;
            document.getElementById('music-toggle-btn').textContent = `MUSIC: ${musicEnabled ? 'ON' : 'OFF'}`;
        }
        
        function backToMainMenu() {
            togglePause();
            showMainMenu();
        }
        
        function updateAudioElements() {
            document.getElementById('sound-toggle').checked = soundEnabled;
            document.getElementById('music-toggle').checked = musicEnabled;
        }
        
        function playBgMusic() {
            if (musicEnabled) {
                bgMusic.volume = 0.3;
                bgMusic.play().catch(e => console.log("Background music play failed:", e));
            }
        }
        
        function stopBgMusic() {
            bgMusic.pause();
            bgMusic.currentTime = 0;
        }
        
        function playPointSound() {
            if (soundEnabled) {
                pointSound.currentTime = 0;
                pointSound.play().catch(e => console.log("Point sound play failed:", e));
            }
        }
        
        function playHitSound() {
            if (soundEnabled) {
                hitSound.currentTime = 0;
                hitSound.play().catch(e => console.log("Hit sound play failed:", e));
            }
        }
        
        // ========== GAME LOOP ==========
        function gameLoop() {
            update();
            draw();
            requestAnimationFrame(gameLoop);
        }
        
        function update() {
            if (gameState === 'playing') {
                // Update bird
                bird.velocity += bird.gravity;
                bird.y += bird.velocity;
                
                // Rotasi bird berdasarkan velocity
                bird.rotation = bird.velocity * 0.1; // DIPERLAMBAT LAGI dari 0.12
                if (bird.rotation > 0.5) bird.rotation = 0.5;
                if (bird.rotation < -0.5) bird.rotation = -0.5;
                
                // Animasi kepakan sayap
                bird.flapCounter++;
                if (bird.flapCounter % 10 === 0) { // DIPERLAMBAT LAGI dari 8
                    bird.currentFrame = (bird.currentFrame + 1) % 3;
                }
                
                // Cek jika bird jatuh ke tanah atau menabrak langit-langit
                if (bird.y + bird.height >= canvas.height - 120) {
                    bird.y = canvas.height - 120 - bird.height;
                    gameOver();
                }
                
                if (bird.y <= 0) {
                    bird.y = 0;
                    gameOver();
                }
                
                // Update pipa - DIPERLAMBAT LAGI PEMBUATAN PIPA
                if (frames % 150 === 0) { // DIPERLAMBAT LAGI dari 130
                    pipes.push({
                        x: canvas.width,
                        y: 0,
                        width: 80,
                        height: Math.floor(Math.random() * 280) + 80,
                        gap: gapSize,
                        counted: false
                    });
                }
                
                for (let i = 0; i < pipes.length; i++) {
                    pipes[i].x -= gameSpeed;
                    
                    // Cek tabrakan
                    if (
                        bird.x + bird.width - 10 > pipes[i].x &&
                        bird.x + 10 < pipes[i].x + pipes[i].width &&
                        (bird.y + 10 < pipes[i].height || bird.y + bird.height - 10 > pipes[i].height + pipes[i].gap)
                    ) {
                        gameOver();
                    }
                    
                    // Cek jika berhasil melewati pipa
                    if (!pipes[i].counted && pipes[i].x + pipes[i].width < bird.x) {
                        score++;
                        pipes[i].counted = true;
                        playPointSound();
                        
                        // Tingkatkan kesulitan secara lebih gradual
                        if (score % 5 === 0) { // DIPERLAMBAT LAGI dari 4
                            gameSpeed += hardMode ? 0.2 : 0.1; // DIPERLAMBAT LAGI
                            gapSize = Math.max(220, gapSize - (hardMode ? 2 : 1)); // DIPERLAMBAT LAGI
                        }
                    }
                    
                    // Hapus pipa yang sudah lewat
                    if (pipes[i].x + pipes[i].width < 0) {
                        pipes.splice(i, 1);
                        i--;
                    }
                }
                
                // Update background offset untuk efek paralax
                backgroundOffset -= gameSpeed * 0.2; // DIPERLAMBAT LAGI dari 0.4
                if (backgroundOffset <= -canvas.width) {
                    backgroundOffset = 0;
                }
                
                // Cek pergantian background
                const currentTime = Date.now();
                if (currentTime - lastBackgroundChange > backgroundChangeInterval) {
                    backgroundMode = backgroundMode === 'day' ? 'night' : 'day';
                    lastBackgroundChange = currentTime;
                    
                    // Achievement night owl
                    if (backgroundMode === 'night' && !achievements[2].achieved) {
                        achievements[2].achieved = true;
                        showAchievementNotification(achievements[2].name);
                        saveGameData();
                    }
                }
            }
        }
        
        let frames = 0;
        
        function draw() {
            frames++;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background
            drawBackground();
            
            if (gameState === 'playing' || gameState === 'paused' || gameState === 'gameover') {
                // Draw pipes
                drawPipes();
                
                // Draw bird
                drawBird();
                
                // Draw ground
                drawGround();
                
                // Draw score
                drawScore();
                
                // Draw game stats
                drawGameStats();
                
                // Draw difficulty info
                if (score > 0 && score % 5 === 0) {
                    drawDifficultyInfo();
                }
            }
        }
        
        function drawBackground() {
            // Background sky
            if (backgroundMode === 'day') {
                // Gradient sky untuk siang
                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, '#64b3f4');
                gradient.addColorStop(1, '#c2e59c');
                ctx.fillStyle = gradient;
            } else {
                // Gradient sky untuk malam
                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, '#0f2027');
                gradient.addColorStop(1, '#203a43');
                ctx.fillStyle = gradient;
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw clouds (siang) atau bintang (malam)
            if (backgroundMode === 'day') {
                // Draw clouds
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                for (let i = 0; i < 6; i++) {
                    const x = (i * canvas.width / 6 + backgroundOffset) % (canvas.width + 400) - 200;
                    const y = 120 + i * 70;
                    drawCloud(x, y, 40 + i * 12);
                }
                
                // Draw sun
                ctx.fillStyle = '#f1c40f';
                ctx.beginPath();
                ctx.arc(850, 120, 50, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Draw stars
                ctx.fillStyle = 'white';
                for (const star of stars) {
                    // Efek berkelap-kelip pada bintang
                    const opacity = 0.5 + 0.5 * Math.sin(frames * 0.03 + star.id); // DIPERLAMBAT LAGI
                    ctx.globalAlpha = opacity;
                    ctx.fillRect(star.x, star.y, 4, 4);
                }
                ctx.globalAlpha = 1;
                
                // Draw moon
                ctx.fillStyle = '#ecf0f1';
                ctx.beginPath();
                ctx.arc(850, 120, 45, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        function drawCloud(x, y, size) {
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.arc(x + size * 0.7, y - size * 0.5, size * 0.7, 0, Math.PI * 2);
            ctx.arc(x + size * 1.4, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        function drawBird() {
            ctx.save();
            ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
            ctx.rotate(bird.rotation);
            
            // Warna burung berdasarkan skin yang dipilih
            let birdColor;
            switch (selectedBirdSkin) {
                case 'red':
                    birdColor = '#e74c3c';
                    break;
                case 'blue':
                    birdColor = '#3498db';
                    break;
                case 'black':
                    birdColor = '#2c3e50';
                    break;
                default:
                    birdColor = '#f1c40f';
            }
            
            // Draw body
            ctx.fillStyle = birdColor;
            ctx.beginPath();
            ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw wing (animasi berdasarkan frame)
            ctx.fillStyle = birdColor;
            const wingHeight = 15 + Math.sin(frames * 0.12) * 10; // DIPERLAMBAT LAGI
            ctx.beginPath();
            ctx.ellipse(-15, 0, 20, wingHeight, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw eye
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(15, -10, 12, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(20, -10, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw beak
            ctx.fillStyle = '#e67e22';
            ctx.beginPath();
            ctx.moveTo(28, -7);
            ctx.lineTo(50, 0);
            ctx.lineTo(28, 7);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
        
        function drawPipes() {
            for (const pipe of pipes) {
                // Pipe atas
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
                
                // Pipe bawah
                ctx.fillRect(pipe.x, pipe.height + pipe.gap, pipe.width, canvas.height - pipe.height - pipe.gap);
                
                // Penutup pipe atas
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(pipe.x - 4, pipe.height - 20, pipe.width + 8, 20);
                
                // Penutup pipe bawah
                ctx.fillRect(pipe.x - 4, pipe.height + pipe.gap, pipe.width + 8, 20);
            }
        }
        
        function drawGround() {
            ctx.fillStyle = '#d35400';
            ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
            
            ctx.fillStyle = '#e67e22';
            ctx.fillRect(0, canvas.height - 120, canvas.width, 20);
            
            // Pattern tanah
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            for (let i = 0; i < canvas.width; i += 25) {
                ctx.fillRect(i, canvas.height - 100, 20, 10);
            }
        }
        
        function drawScore() {
            ctx.fillStyle = 'white';
            ctx.font = '36px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(score.toString(), canvas.width / 2, 80);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            ctx.strokeText(score.toString(), canvas.width / 2, 80);
        }
        
        function drawGameStats() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(20, 20, 220, 80);
            
            ctx.fillStyle = 'white';
            ctx.font = '16px "Press Start 2P"';
            ctx.textAlign = 'left';
            ctx.fillText(`SCORE: ${score}`, 35, 50);
            ctx.fillText(`HI-SCORE: ${highScore}`, 35, 80);
            
            // Draw speed info
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(canvas.width - 240, 20, 220, 50);
            
            ctx.fillStyle = 'white';
            ctx.font = '16px "Press Start 2P"';
            ctx.textAlign = 'left';
            ctx.fillText(`SPEED: ${gameSpeed.toFixed(1)}`, canvas.width - 225, 50);
        }
        
        function drawDifficultyInfo() {
            ctx.fillStyle = '#f39c12';
            ctx.font = '20px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('LEVEL UP!', canvas.width / 2, 120);
        }
        
        // ========== GAME CONTROL ==========
        function startGame() {
            playerName = document.getElementById('player-name').value || 'Player';
            hardMode = document.getElementById('difficulty-toggle').checked;
            resetGame();
            gameState = 'playing';
            pauseBtn.classList.remove('hidden');
            showScreen(document.getElementById('game-over').classList.add('hidden'));
            playBgMusic();
        }
        
        function resetGame() {
            score = 0;
            gameSpeed = hardMode ? 2.0 : 1.5; // DIPERLAMBAT LAGI
            gapSize = hardMode ? 240 : 280; // DIPERBESAR LAGI
            bird.y = canvas.height / 2;
            bird.velocity = 0;
            bird.rotation = 0;
            pipes = [];
        }
        
        function restartGame() {
            resetGame();
            gameState = 'playing';
            pauseBtn.classList.remove('hidden');
            showScreen(document.getElementById('game-over').classList.add('hidden'));
            playBgMusic();
        }
        
        function gameOver() {
            gameState = 'gameover';
            playHitSound();
            
            // Update high score
            if (score > highScore) {
                highScore = score;
            }
            
            // Achievement hard mode
            if (hardMode && score > 0 && !achievements[4].achieved) {
                achievements[4].achieved = true;
                showAchievementNotification(achievements[4].name);
            }
            
            // Tampilkan layar game over setelah delay kecil
            setTimeout(showGameOver, 500);
        }
        
        // ========== LEADERBOARD ==========
        function renderLeaderboard() {
            const leaderboardList = document.getElementById('leaderboard-list');
            leaderboardList.innerHTML = '';
            
            // Urutkan leaderboard berdasarkan skor
            const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
            
            // Tampilkan maksimal 5 entri
            for (let i = 0; i < Math.min(5, sortedLeaderboard.length); i++) {
                const item = sortedLeaderboard[i];
                const li = document.createElement('li');
                li.className = 'leaderboard-item';
                li.innerHTML = `<span>${i + 1}. ${item.name}</span><span>${item.score}</span>`;
                leaderboardList.appendChild(li);
            }
            
            // Jika leaderboard kosong
            if (sortedLeaderboard.length === 0) {
                const li = document.createElement('li');
                li.className = 'leaderboard-item';
                li.textContent = 'No scores yet!';
                leaderboardList.appendChild(li);
            }
        }
        
        function updateLeaderboard() {
            // Cek apakah skor cukup tinggi untuk masuk leaderboard
            if (score > 0 && (leaderboard.length < 5 || score > Math.min(...leaderboard.map(e => e.score)))) {
                leaderboard.push({ name: playerName, score: score });
                
                // Urutkan dan pertahankan hanya 5 teratas
                leaderboard.sort((a, b) => b.score - a.score);
                if (leaderboard.length > 5) {
                    leaderboard = leaderboard.slice(0, 5);
                }
                
                saveGameData();
            }
        }
        
        // ========== ACHIEVEMENTS ==========
        function renderAchievements() {
            const achievementList = document.getElementById('achievement-list');
            achievementList.innerHTML = '';
            
            for (const achievement of achievements) {
                const div = document.createElement('div');
                div.className = 'achievement-item';
                
                const icon = document.createElement('div');
                icon.className = 'achievement-icon';
                icon.innerHTML = achievement.achieved ? '✓' : '?';
                
                const text = document.createElement('div');
                text.innerHTML = `<strong>${achievement.name}</strong><br><small>${achievement.desc}</small>`;
                
                div.appendChild(icon);
                div.appendChild(text);
                achievementList.appendChild(div);
            }
        }
        
        function checkAchievements() {
            let newAchievement = false;
            
            // First Flight
            if (score > 0 && !achievements[0].achieved) {
                achievements[0].achieved = true;
                showAchievementNotification(achievements[0].name);
                newAchievement = true;
            }
            
            // Pro Flyer
            if (score > 10 && !achievements[1].achieved) {
                achievements[1].achieved = true;
                showAchievementNotification(achievements[1].name);
                newAchievement = true;
            }
            
            // High Scorer
            if (score > 50 && !achievements[3].achieved) {
                achievements[3].achieved = true;
                showAchievementNotification(achievements[3].name);
                newAchievement = true;
            }
            
            if (newAchievement) {
                saveGameData();
            }
        }
        
        function showAchievementNotification(achievementName) {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = `Achievement Unlocked: ${achievementName}!`;
            document.getElementById('game-container').appendChild(notification);
            
            // Hapus notifikasi setelah animasi selesai
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
        
        // ========== FULLSCREEN ==========
        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }
        
        // ========== UTILITY FUNCTIONS ==========
        function generateStars() {
            stars = [];
            for (let i = 0; i < 200; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * (canvas.height - 120),
                    id: i
                });
            }
        }
        
        // ========== LOCAL STORAGE ==========
        function saveGameData() {
            const gameData = {
                highScore: highScore,
                leaderboard: leaderboard,
                achievements: achievements,
                soundEnabled: soundEnabled,
                musicEnabled: musicEnabled
            };
            
            localStorage.setItem('flappyBirdData', JSON.stringify(gameData));
        }
        
        function loadGameData() {
            const savedData = localStorage.getItem('flappyBirdData');
            
            if (savedData) {
                const gameData = JSON.parse(savedData);
                highScore = gameData.highScore || 0;
                leaderboard = gameData.leaderboard || [];
                
                if (gameData.achievements) {
                    for (let i = 0; i < gameData.achievements.length; i++) {
                        if (gameData.achievements[i]) {
                            achievements[i].achieved = gameData.achievements[i].achieved;
                        }
                    }
                }
                
                soundEnabled = gameData.soundEnabled !== undefined ? gameData.soundEnabled : true;
                musicEnabled = gameData.musicEnabled !== undefined ? gameData.musicEnabled : true;
                
                // Update toggle settings
                document.getElementById('sound-toggle').checked = soundEnabled;
                document.getElementById('music-toggle').checked = musicEnabled;
                updatePauseMenuButtons();
            }
        }
        
        // ========== START GAME ==========
        window.onload = init;