// Game Engine for Dino Run
class DinoGame {
    constructor(canvasId) {
        console.log('🎯 DinoGame constructor called with canvasId:', canvasId);
        
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('❌ Canvas element not found:', canvasId);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        console.log('✅ Canvas and context initialized');
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameSpeed = 1;
        this.score = 0;
        this.highScore = localStorage.getItem('dinoHighScore') || 0;
        
        // Game objects
        console.log('🏗️ Creating game objects...');
        this.player = new Player();
        this.obstacles = [];
        this.clouds = [];
        this.ground = new Ground();
        
        // Timing
        this.lastObstacleTime = 0;
        this.lastCloudTime = 0;
        this.frameCount = 0;
        
        // Settings that will be controlled by feature flags
        this.settings = {
            obstacleSpeed: 5,
            obstacleFrequency: 100,
            jumpHeight: 90
        };
        
        console.log('🎮 Calling init...');
        this.init();
    }
    
    init() {
        console.log('🔧 DinoGame init starting...');
        try {
            this.setupEventListeners();
            console.log('✅ Event listeners set up');
            
            this.updateHighScoreDisplay();
            console.log('✅ High score display updated');
            
            this.generateClouds();
            console.log('✅ Clouds generated');
            
            this.initializeUI();
            console.log('✅ UI initialized');
            
            console.log('🎮 DinoGame initialization complete');
        } catch (error) {
            console.error('❌ Error in DinoGame init:', error);
            console.error('Stack trace:', error.stack);
        }
    }
    
    initializeUI() {
        // Check if user has played before and show appropriate overlay
        this.showAppropriateStartOverlay();
        
        // Set up floating instructions
        this.setupFloatingInstructions();
        
        // Set up name input validation
        this.setupNameInput();
        
        // Update player display and show change player button
        if (typeof updatePlayerDisplay === 'function') {
            updatePlayerDisplay();
        }
        this.updateChangePlayerButtonVisibility();
    }
    
    showAppropriateStartOverlay() {
        if (window.userDetection && window.userDetection.hasPlayedBefore()) {
            this.showQuickStartOverlay();
        } else {
            this.showFullWelcomeOverlay();
        }
    }
    
    showFullWelcomeOverlay() {
        const overlay = document.getElementById('gameStartOverlay');
        const quickOverlay = document.getElementById('quickStartOverlay');
        
        if (overlay) overlay.style.display = 'flex';
        if (quickOverlay) quickOverlay.style.display = 'none';
    }
    
    showQuickStartOverlay() {
        const overlay = document.getElementById('gameStartOverlay');
        const quickOverlay = document.getElementById('quickStartOverlay');
        
        if (overlay) overlay.style.display = 'none';
        if (quickOverlay) {
            quickOverlay.style.display = 'flex';
            
            // Update returning player name
            const playerData = window.userDetection.getPlayerData();
            const nameElement = document.getElementById('returningPlayerName');
            if (nameElement && playerData && playerData.name) {
                nameElement.textContent = playerData.name;
            }
        }
    }
    
    setupNameInput() {
        const nameInput = document.getElementById('playerName');
        const startButton = document.getElementById('startGameButton');
        
        if (nameInput && startButton) {
            // Enable/disable start button based on name input
            const validateInput = () => {
                const name = nameInput.value.trim();
                // Allow names with spaces - just check if there's meaningful content
                const hasContent = name.replace(/\s+/g, '').length >= 2;
                if (hasContent || name.length >= 2) {
                    startButton.disabled = false;
                    startButton.style.opacity = '1';
                } else {
                    startButton.disabled = false; // Allow anonymous play
                    startButton.style.opacity = '0.8';
                }
            };
            
            nameInput.addEventListener('input', validateInput);
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.startGameFromInput();
                }
            });
            
            // Initial validation
            validateInput();
            
            // Focus on name input for better UX
            setTimeout(() => {
                nameInput.focus();
            }, 500);
        }
    }
    
    async startGameFromInput() {
        const nameInput = document.getElementById('playerName');
        const playerName = nameInput ? nameInput.value.trim() : '';
        
        // Show loading state
        const startButton = document.getElementById('startGameButton');
        if (startButton) {
            startButton.innerHTML = '<span>🔄 Loading...</span>';
            startButton.disabled = true;
        }
        
        try {
            // Save player data immediately if name provided
            if (playerName && window.userDetection) {
                console.log('💾 Saving player data for:', playerName);
                
                // Create user context and save player data
                const userContext = await window.userDetection.generateUserContext(playerName);
                window.userDetection.savePlayerData(userContext);
                
                console.log('✅ Player data saved:', window.userDetection.getPlayerData());
            }
            
            // Initialize LaunchDarkly with player name
            if (window.ldManager && playerName) {
                await window.ldManager.reinitializeWithUser(playerName);
            }
            
            // Update player display
            if (typeof updatePlayerDisplay === 'function') {
                updatePlayerDisplay();
            }
            
            // Update change player button visibility
            this.updateChangePlayerButtonVisibility();
            
            // Add a small delay to ensure UI updates complete
            setTimeout(() => {
                if (typeof updatePlayerDisplay === 'function') {
                    console.log('🔄 Re-updating player display after delay');
                    updatePlayerDisplay();
                }
            }, 100);
            
            // Start the game
            this.start();
            
        } catch (error) {
            console.error('Error starting game:', error);
            // Still start the game even if LaunchDarkly fails
            this.start();
        }
    }
    
    showStartOverlay() {
        const overlay = document.getElementById('gameStartOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }
    
    hideStartOverlay() {
        const overlay = document.getElementById('gameStartOverlay');
        const quickOverlay = document.getElementById('quickStartOverlay');
        
        if (overlay) {
            overlay.style.display = 'none';
        }
        if (quickOverlay) {
            quickOverlay.style.display = 'none';
        }
    }
    
    hideAllOverlays() {
        const overlays = [
            'gameStartOverlay',
            'quickStartOverlay', 
            'nameUpdateModal'
        ];
        
        overlays.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });
    }
    
    setupFloatingInstructions() {
        this.floatingInstructionsTimer = null;
    }
    
    showFloatingInstructions() {
        const instructions = document.getElementById('floatingInstructions');
        if (instructions) {
            instructions.classList.add('show');
            
            // Hide after 3 seconds
            setTimeout(() => {
                instructions.classList.remove('show');
            }, 3000);
        }
    }
    
    hideFloatingInstructions() {
        const instructions = document.getElementById('floatingInstructions');
        if (instructions) {
            instructions.classList.remove('show');
        }
    }
    
    setupEventListeners() {
        // Jump controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleJump();
            }
        });
        
        // Touch support for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleJump();
        });
        
        // Restart button
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restart();
            });
        }
    }
    
    handleJump() {
        // Check if start overlay is visible
        const overlay = document.getElementById('gameStartOverlay');
        const overlayVisible = overlay && overlay.style.display !== 'none';
        
        if (!this.isRunning && !this.isPaused && !overlayVisible) {
            // Game is over, restart it
            this.restart();
        } else if (!this.isRunning && !this.isPaused) {
            // Game hasn't started yet, start it
            this.start();
        } else if (this.isRunning && this.player.canJump()) {
            // Game is running, make player jump
            this.player.jump();
        }
    }
    
    start() {
        if (this.isRunning) return;
        
        this.hideAllOverlays();
        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.obstacles = [];
        this.clouds = [];
        this.frameCount = 0;
        this.lastObstacleTime = 0;
        this.lastCloudTime = 0;
        
        // Reset player position and state
        this.player.reset();
        
        // 📊 OBSERVABILITY: Track game start event
        // See README.md "LaunchDarkly Observability & Session Replay" for setup guide
        if (window.ldManager && window.ldManager.trackGameEvent) {
            window.ldManager.trackGameEvent('game_started', {
                difficulty: window.ldManager.getDifficulty(),
                dinoColor: window.ldManager.getDinoColor(),
                weather: window.ldManager.getWeather()
            });
        }
        
        // Apply current feature flag settings
        this.applySettings();
        
        // Update UI
        this.updateScore();
        this.updateGameStatus('Running! Jump to avoid obstacles! 🦘');
        this.hideFloatingInstructions();
        this.showRestartButton(false);
        
        // Update player display
        if (typeof updatePlayerDisplay === 'function') {
            updatePlayerDisplay();
        }
        
        // Update change player button visibility
        this.updateChangePlayerButtonVisibility();
        
        // Start the game loop
        this.gameLoop();
        
        console.log('🎮 Game started!');
    }
    
    restart() {
        console.log('🔄 Restarting game...');
        this.hideRestartButton();
        this.updateGameStatus('🚀 Restarting...');
        
        // Small delay for better UX feedback
        setTimeout(() => {
            this.start();
        }, 300);
    }
    
    pause() {
        this.isPaused = true;
        this.updateGameStatus('Paused - Press SPACE to continue');
    }
    
    resume() {
        this.isPaused = false;
        this.updateGameStatus('Running...');
        this.gameLoop();
    }
    
    gameOver() {
        this.isRunning = false;
        this.updateGameStatus('💥 Game Over! Press SPACE or click restart to play again! 🚀');
        this.showRestartButton();
        
        // Track games played
        this.trackGamePlayed();
        
        // 📊 OBSERVABILITY: Track game end event with detailed metrics
        // See README.md "LaunchDarkly Observability & Session Replay" for setup guide
        if (window.ldManager && window.ldManager.trackGameEvent) {
            window.ldManager.trackGameEvent('game_ended', {
                finalScore: this.score,
                highScore: this.highScore,
                newHighScore: this.score > this.highScore,
                gameDuration: Date.now() - (this.gameStartTime || Date.now()),
                obstaclesGenerated: this.obstacles.length,
                frameCount: this.frameCount
            });
        }
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('dinoHighScore', this.highScore);
            this.updateHighScoreDisplay();
            this.updateGameStatus('🎉 New High Score! Press SPACE to play again! 🏆');
        }
        
        // Update player display with new stats
        if (typeof updatePlayerDisplay === 'function') {
            updatePlayerDisplay();
        }
        
        // Don't automatically show overlay - let users restart with the restart button
        // This prevents the annoying popup behavior
        console.log('🎮 Game over. Use restart button or press SPACE to play again.');
    }
    
    trackGamePlayed() {
        // Increment games played for current player
        if (window.userDetection) {
            const playerData = window.userDetection.getPlayerData();
            if (playerData) {
                // Update session count
                playerData.sessions = (playerData.sessions || 0) + 1;
                playerData.lastVisit = new Date().toISOString();
                
                // Save updated data
                localStorage.setItem('dinoRunPlayerData', JSON.stringify(playerData));
                
                console.log(`📊 Games played updated: ${playerData.sessions}`);
            }
        }
    }
    
    gameLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        this.update();
        this.draw();
        this.frameCount++;
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Update game speed based on score
        this.gameSpeed = 1 + (this.score / 1000) * 0.5;
        
        // Update player
        this.player.update();
        
        // Generate obstacles
        if (this.frameCount - this.lastObstacleTime > this.settings.obstacleFrequency) {
            this.obstacles.push(new Obstacle());
            this.lastObstacleTime = this.frameCount;
        }
        
        // Generate clouds occasionally
        if (this.frameCount - this.lastCloudTime > 200 + Math.random() * 100) {
            this.clouds.push(new Cloud());
            this.lastCloudTime = this.frameCount;
        }
        
        // Update obstacles
        this.obstacles.forEach(obstacle => {
            obstacle.update(this.settings.obstacleSpeed * this.gameSpeed);
        });
        
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.update(this.gameSpeed * 0.5);
        });
        
        // Remove off-screen obstacles and clouds
        this.obstacles = this.obstacles.filter(obstacle => !obstacle.isOffScreen());
        this.clouds = this.clouds.filter(cloud => !cloud.isOffScreen());
        
        // Check collisions
        this.obstacles.forEach(obstacle => {
            if (this.player.collidesWith(obstacle)) {
                this.gameOver();
            }
        });
        
        // Update score
        this.score += Math.floor(this.gameSpeed);
        this.updateScore();
        
        // Update ground
        this.ground.update(this.settings.obstacleSpeed * this.gameSpeed);
    }
    
    draw() {
        // Clear canvas but preserve CSS background
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds
        this.clouds.forEach(cloud => cloud.draw(this.ctx));
        
        // Draw ground
        this.ground.draw(this.ctx);
        
        // Draw player
        this.player.draw(this.ctx);
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
    }
    
    generateClouds() {
        for (let i = 0; i < 3; i++) {
            this.clouds.push(new Cloud(Math.random() * this.canvas.width));
        }
    }
    
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            const newScore = Math.floor(this.score);
            const oldScore = parseInt(scoreElement.textContent) || 0;
            
            scoreElement.textContent = newScore;
            
            // Add pulse animation when score increases significantly
            if (newScore > oldScore && newScore % 100 === 0) {
                const scoreContainer = scoreElement.closest('.score');
                if (scoreContainer) {
                    scoreContainer.classList.add('score-pulse');
                    setTimeout(() => {
                        scoreContainer.classList.remove('score-pulse');
                    }, 300);
                }
            }
        }
    }
    
    updateHighScoreDisplay() {
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
    }
    
    updateGameStatus(status) {
        const statusElement = document.getElementById('gameStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }
    
    showRestartButton(show = true) {
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.style.display = show ? 'inline-block' : 'none';
        }
    }
    
    hideRestartButton() {
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.style.display = 'none';
        }
    }
    
    applySettings() {
        // Apply difficulty settings from LaunchDarkly
        if (window.ldManager && window.ldManager.isInitialized) {
            const difficultySettings = window.ldManager.getDifficultySettings();
            this.updateSettings(difficultySettings);
            
            // Apply other feature flag settings
            this.applyWeatherBackground();
        }
    }
    
    applyWeatherBackground() {
        // Apply weather background based on feature flag
        if (window.ldManager && window.ldManager.isInitialized) {
            const weather = window.ldManager.getWeather();
            const canvas = document.getElementById('gameCanvas');
            if (canvas) {
                // Remove existing weather classes
                canvas.classList.remove('weather-spring', 'weather-summer', 'weather-autumn', 'weather-winter');
                // Add current weather class
                canvas.classList.add(`weather-${weather}`);
            }
        }
    }
    
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.player.jumpHeight = this.settings.jumpHeight;
    }
    
    updateChangePlayerButtonVisibility() {
        const changePlayerBtn = document.getElementById('changePlayerBtn');
        if (changePlayerBtn && window.userDetection) {
            const playerData = window.userDetection.getPlayerData();
            if (playerData && playerData.name) {
                changePlayerBtn.style.display = 'flex';
            } else {
                changePlayerBtn.style.display = 'none';
            }
        }
    }
}

// Player class
class Player {
    constructor() {
        this.x = 50;
        this.y = 150;
        this.width = 20;
        this.height = 20;
        this.jumpHeight = 90;
        this.jumpSpeed = 0;
        this.gravity = 0.8;
        this.isJumping = false;
        this.groundY = 150;
        this.color = '#2d7d32'; // Default green
        this.animationFrame = 0; // For walking animation
        this.animationSpeed = 0.3;
    }
    
    reset() {
        this.y = this.groundY;
        this.jumpSpeed = 0;
        this.isJumping = false;
    }
    
    jump() {
        if (this.canJump()) {
            this.jumpSpeed = -this.jumpHeight / 6;
            this.isJumping = true;
        }
    }
    
    canJump() {
        return this.y >= this.groundY - 5;
    }
    
    update() {
        if (this.isJumping || this.y < this.groundY) {
            this.jumpSpeed += this.gravity;
            this.y += this.jumpSpeed;
            
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.jumpSpeed = 0;
                this.isJumping = false;
            }
        }
        
        // Update animation frame for walking animation
        if (!this.isJumping) {
            this.animationFrame += this.animationSpeed;
        }
        
        // Update color from feature flag
        if (window.ldManager && window.ldManager.isInitialized) {
            this.color = window.ldManager.getDinoColorHex(window.ldManager.getDinoColor());
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Main dinosaur color
        ctx.fillStyle = this.color;
        
        // Body (main torso) - rounded rectangle with subtle bounce
        const bodyBounce = this.isJumping ? 0 : Math.sin(this.animationFrame * 2) * 0.5;
        this.drawRoundedRect(ctx, this.x, this.y + 5 + bodyBounce, this.width, this.height - 8, 3);
        
        // Head - larger and more dinosaur-like
        ctx.beginPath();
        ctx.ellipse(this.x + this.width + 2, this.y - 2 + bodyBounce, 8, 6, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Neck connection
        ctx.fillRect(this.x + this.width - 2, this.y + 2 + bodyBounce, 6, 8);
        
        // Tail
        ctx.beginPath();
        ctx.ellipse(this.x - 8, this.y + 8 + bodyBounce, 10, 4, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Tail connection
        ctx.fillRect(this.x - 4, this.y + 6 + bodyBounce, 6, 6);
        
        // Legs with walking animation
        const legWidth = 3;
        const legHeight = 8;
        const legY = this.y + this.height - 3;
        
        // Calculate leg offset for walking animation
        const walkCycle = Math.sin(this.animationFrame) * 2;
        const walkCycle2 = Math.sin(this.animationFrame + Math.PI) * 2;
        
        // Back leg (animated)
        const backLegOffset = this.isJumping ? 0 : walkCycle;
        ctx.fillRect(this.x + 3 + backLegOffset, legY, legWidth, legHeight);
        
        // Front leg (animated, opposite phase)
        const frontLegOffset = this.isJumping ? 0 : walkCycle2;
        ctx.fillRect(this.x + 12 + frontLegOffset, legY, legWidth, legHeight);
        
        // Feet (follow the legs)
        ctx.fillRect(this.x + 2 + backLegOffset, legY + legHeight - 1, legWidth + 2, 2);
        ctx.fillRect(this.x + 11 + frontLegOffset, legY + legHeight - 1, legWidth + 2, 2);
        
        // Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width + 5, this.y - 1 + bodyBounce, 2.5, 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Pupil
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width + 6, this.y - 1 + bodyBounce, 1, 1, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Nostril
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width + 8, this.y + 1 + bodyBounce, 0.8, 0.5, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add some texture/pattern on the body
        ctx.fillStyle = this.getDarkerShade(this.color);
        
        // Back stripe
        ctx.fillRect(this.x + 2, this.y + 6 + bodyBounce, this.width - 4, 2);
        
        // Belly area (lighter)
        ctx.fillStyle = this.getLighterShade(this.color);
        ctx.fillRect(this.x + 3, this.y + 12 + bodyBounce, this.width - 6, 4);
        
        // Small spikes on back
        ctx.fillStyle = this.getDarkerShade(this.color);
        for (let i = 0; i < 3; i++) {
            const spikeX = this.x + 4 + (i * 4);
            const spikeY = this.y + 4 + bodyBounce;
            ctx.beginPath();
            ctx.moveTo(spikeX, spikeY);
            ctx.lineTo(spikeX + 2, spikeY - 3);
            ctx.lineTo(spikeX + 4, spikeY);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // Helper method to draw rounded rectangles
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
    
    // Helper method to get a darker shade of the current color
    getDarkerShade(color) {
        const colors = {
            '#2d7d32': '#1b5e20',  // green -> dark green
            '#1976d2': '#0d47a1',  // blue -> dark blue
            '#d32f2f': '#b71c1c',  // red -> dark red
            '#7b1fa2': '#4a148c',  // purple -> dark purple
            '#f57c00': '#e65100',  // orange -> dark orange
            '#c2185b': '#880e4f'   // pink -> dark pink
        };
        return colors[color] || '#333333';
    }
    
    // Helper method to get a lighter shade of the current color
    getLighterShade(color) {
        const colors = {
            '#2d7d32': '#66bb6a',  // green -> light green
            '#1976d2': '#42a5f5',  // blue -> light blue
            '#d32f2f': '#ef5350',  // red -> light red
            '#7b1fa2': '#ab47bc',  // purple -> light purple
            '#f57c00': '#ffa726',  // orange -> light orange
            '#c2185b': '#ec407a'   // pink -> light pink
        };
        return colors[color] || '#cccccc';
    }
    
    collidesWith(obstacle) {
        // More precise collision detection considering the dinosaur's shape
        // Main body collision
        const bodyCollision = this.x < obstacle.x + obstacle.width &&
                             this.x + this.width > obstacle.x &&
                             this.y + 5 < obstacle.y + obstacle.height &&
                             this.y + this.height > obstacle.y;
        
        // Head collision (head extends further to the right)
        const headCollision = this.x + this.width - 6 < obstacle.x + obstacle.width &&
                             this.x + this.width + 10 > obstacle.x &&
                             this.y - 8 < obstacle.y + obstacle.height &&
                             this.y + 4 > obstacle.y;
        
        return bodyCollision || headCollision;
    }
}

// Obstacle class
class Obstacle {
    constructor() {
        this.x = 800;
        this.y = 130;
        this.width = 15 + Math.random() * 10;
        this.height = 40 + Math.random() * 20;
        this.color = '#654321';
    }
    
    update(speed) {
        this.x -= speed;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// Cloud class
class Cloud {
    constructor(x = 800) {
        this.x = x;
        this.y = 20 + Math.random() * 50;
        this.width = 30 + Math.random() * 20;
        this.height = 15 + Math.random() * 10;
        this.color = 'white';
        this.opacity = 0.7;
    }
    
    update(speed) {
        this.x -= speed;
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillRect(this.x + 10, this.y - 5, this.width - 10, this.height);
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 5, this.height);
        ctx.globalAlpha = 1;
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// Ground class
class Ground {
    constructor() {
        this.x = 0;
        this.y = 180;
        this.width = 800;
        this.height = 20;
        this.color = '#8B4513';
        this.pattern = [];
        this.generatePattern();
    }
    
    generatePattern() {
        for (let i = 0; i < this.width + 50; i += 10) {
            this.pattern.push({
                x: i,
                height: 2 + Math.random() * 3
            });
        }
    }
    
    update(speed) {
        this.pattern.forEach(segment => {
            segment.x -= speed;
        });
        
        // Add new segments as old ones move off screen
        this.pattern = this.pattern.filter(segment => segment.x > -50);
        while (this.pattern.length === 0 || this.pattern[this.pattern.length - 1].x < this.width + 50) {
            const lastX = this.pattern.length > 0 ? this.pattern[this.pattern.length - 1].x : 0;
            this.pattern.push({
                x: lastX + 10,
                height: 2 + Math.random() * 3
            });
        }
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(0, this.y, this.width, this.height);
        
        // Draw pattern
        ctx.fillStyle = '#A0522D';
        this.pattern.forEach(segment => {
            ctx.fillRect(segment.x, this.y - segment.height, 8, segment.height);
        });
    }
} 