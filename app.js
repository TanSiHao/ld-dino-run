// Main Application Entry Point
class DinoRunApp {
    constructor() {
        this.game = null;
        this.isInitialized = false;
    }
    
    async init() {
        try {
            console.log('🔧 Starting DinoRunApp initialization...');
            
            // Check if required dependencies are loaded
            console.log('📋 Checking dependencies...');
            console.log('- window.ldManager:', !!window.ldManager);
            console.log('- window.userDetection:', !!window.userDetection);
            console.log('- DinoGame class:', typeof DinoGame);
            console.log('- Canvas element:', !!document.getElementById('gameCanvas'));
            
            // Initialize LaunchDarkly (will be re-initialized with user name later)
            // For now, initialize without a specific user to get default flags
            console.log('🏗️ Initializing LaunchDarkly...');
            await window.ldManager.initialize();
            
            // Create game instance
            console.log('🎮 Creating game instance...');
            this.game = new DinoGame('gameCanvas');
            
            // Preload LaunchDarkly logo image immediately
            console.log('🖼️ Preloading LaunchDarkly logo...');
            if (window.Obstacle) {
                window.Obstacle.preloadLogoImage();
            }
            
            // Connect feature flags to game
            console.log('🔗 Connecting feature flags...');
            this.connectFeatureFlags();
            
            // Set up flag change listeners
            console.log('👂 Setting up flag listeners...');
            window.ldManager.onFlagsUpdated(() => {
                this.onFlagsUpdated();
            });
            
            // Initialize user detection and check for returning players
            console.log('👤 Setting up user detection...');
            this.setupUserDetection();
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            this.isInitialized = true;
            console.log('✅ Dino Run App initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            console.error('Stack trace:', error.stack);
            // Initialize game with default settings even if LaunchDarkly fails
            console.log('🔄 Falling back to basic game initialization...');
            this.game = new DinoGame('gameCanvas');
            this.isInitialized = true;
        }
    }
    
    setupUserDetection() {
        if (window.userDetection) {
            const playerData = window.userDetection.getPlayerData();
            
            if (playerData) {
                console.log(`👋 Welcome back, ${playerData.name}!`);
                console.log(`📊 You've played ${playerData.sessions} times`);
                
                // For returning players, we could pre-initialize LaunchDarkly with their saved data
                // This will happen when they click "Play Again" from the quick start overlay
            } else {
                console.log('🎮 First time playing! Welcome to Dino Run!');
            }
        }
    }
    
    connectFeatureFlags() {
        if (!window.ldManager.isInitialized) return;
        
        // Apply initial flag values
        this.applyDinoColorFlag();
        this.applyDifficultyFlag();
        this.applyWeatherFlag();
        this.applyObstacleTypeFlag();
    }
    
    onFlagsUpdated() {
        console.log('🎯 Feature flags updated - applying to game...');
        
        // Check if game is running for real-time updates
        const isGameRunning = this.game?.isRunning;
        console.log('🎮 Game running during flag update:', isGameRunning);
        
        this.applyDinoColorFlag();
        this.applyDifficultyFlag();
        this.applyWeatherFlag();
        this.applyObstacleTypeFlag();
        
        if (isGameRunning) {
            console.log('⚡ Real-time flag updates applied during active gameplay!');
        }
    }
    
    applyDinoColorFlag() {
        // The dino color is automatically applied in the Player.update() method
        // through the ldManager.getDinoColorHex() call
        const color = window.ldManager.getDinoColor();
        console.log('🎨 Dino color flag applied during gameplay:', color);
        
        // Show visual feedback for color change
        if (this.game?.isRunning) {
            this.showGameMessage(`🎨 Dino color changed to: ${color.toUpperCase()}!`);
        }
    }
    
    applyDifficultyFlag() {
        if (!this.game) return;
        
        const difficultySettings = window.ldManager.getDifficultySettings();
        const difficulty = window.ldManager.getDifficulty();
        
        // Apply new difficulty settings
        this.game.updateSettings(difficultySettings);
        
        // Also update player jump height if game is running
        if (this.game.isRunning && this.game.player) {
            this.game.player.jumpHeight = difficultySettings.jumpHeight;
        }
        
        console.log('🚀 Difficulty flag applied during gameplay:', difficulty, difficultySettings);
        
        // Show visual feedback for difficulty change
        if (this.game.isRunning) {
            this.showGameMessage(`⚡ Difficulty changed to: ${difficulty.toUpperCase()}!`);
        }
    }
    
    applyWeatherFlag() {
        if (!this.game) return;
        
        const weather = window.ldManager.getWeather();
        
        // Apply weather-specific styling to the canvas or game area
        this.applyWeatherEffects(weather);
        
        // Also call the game engine's weather method if it exists
        if (this.game.applyWeatherBackground) {
            this.game.applyWeatherBackground();
        }
        
        console.log('🌤️ Weather flag applied during gameplay:', weather);
        
        // Show visual feedback for weather change
        if (this.game.isRunning) {
            this.showGameMessage(`🌤️ Weather changed to: ${weather.toUpperCase()}!`);
        }
    }
    
    applyObstacleTypeFlag() {
        if (!this.game) return;
        
        const obstacleType = window.ldManager.getObstacleType();
        console.log('🚧 Obstacle type flag applied during gameplay:', obstacleType);
        
        // Show visual feedback for obstacle type change
        if (this.game.isRunning) {
            const displayName = obstacleType === 'logos' ? 'LAUNCHDARKLY LOGOS' : 'CLASSIC BLOCKS';
            this.showGameMessage(`🚧 Obstacles changed to: ${displayName}!`);
        }
    }
    
    applyWeatherEffects(weather) {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        // Remove existing weather classes
        canvas.classList.remove('weather-spring', 'weather-summer', 'weather-autumn', 'weather-winter');
        
        // Add new weather class
        canvas.classList.add(`weather-${weather}`);
        
        console.log('🌤️ Weather effects applied:', weather);
        
        // You could add more weather effects here like:
        // - Particle effects (rain, snow)
        // - Different cloud colors
        // - Ground color changes
        this.addWeatherParticles(weather);
    }
    
    addWeatherParticles(weather) {
        // This is a placeholder for more advanced weather effects
        // You could implement rain drops, snow flakes, falling leaves, etc.
        switch (weather) {
            case 'winter':
                // Could add snowflakes
                break;
            case 'autumn':
                // Could add falling leaves
                break;
            case 'spring':
                // Could add flower petals
                break;
            case 'summer':
                // Could add heat shimmer effect
                break;
        }
    }
    
    // Method to manually cycle through flag values for testing
    cycleDinoColor() {
        const colors = ['green', 'blue', 'red', 'purple', 'orange', 'pink'];
        const currentColor = window.ldManager.getDinoColor();
        const currentIndex = colors.indexOf(currentColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        
        // This would normally be done through LaunchDarkly dashboard
        console.log(`Would change dino color from ${currentColor} to ${colors[nextIndex]}`);
    }
    
    cycleDifficulty() {
        const difficulties = ['easy', 'medium', 'hard'];
        const currentDifficulty = window.ldManager.getDifficulty();
        const currentIndex = difficulties.indexOf(currentDifficulty);
        const nextIndex = (currentIndex + 1) % difficulties.length;
        
        console.log(`Would change difficulty from ${currentDifficulty} to ${difficulties[nextIndex]}`);
    }
    
    cycleWeather() {
        const weathers = ['spring', 'summer', 'autumn', 'winter'];
        const currentWeather = window.ldManager.getWeather();
        const currentIndex = weathers.indexOf(currentWeather);
        const nextIndex = (currentIndex + 1) % weathers.length;
        
        console.log(`Would change weather from ${currentWeather} to ${weathers[nextIndex]}`);
    }
    

    
    // Setup development keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.cycleDinoColor();
                        break;
                    case '2':
                        e.preventDefault();
                        this.cycleDifficulty();
                        break;
                    case '3':
                        e.preventDefault();
                        this.cycleWeather();
                        break;
                }
            }
        });
    }
    
    // Show temporary game message for flag changes during gameplay
    showGameMessage(message, duration = 2000) {
        if (!this.game) return;
        
        const gameStatus = document.getElementById('gameStatus');
        if (gameStatus) {
            const originalText = gameStatus.textContent;
            const originalColor = gameStatus.style.color;
            
            // Show the flag change message
            gameStatus.textContent = message;
            gameStatus.style.color = '#00b894';
            gameStatus.style.fontWeight = 'bold';
            
            // Reset after duration
            setTimeout(() => {
                gameStatus.textContent = originalText;
                gameStatus.style.color = originalColor;
                gameStatus.style.fontWeight = '';
            }, duration);
        }
        
        console.log('📢 Game message shown:', message);
    }
    
    // Test real-time flag changes during gameplay
    testRealTimeFlags() {
        if (!this.game?.isRunning) {
            console.log('⚠️ Start the game first to test real-time flag changes');
            return;
        }
        
        console.log('🧪 Testing real-time flag changes during gameplay...');
        
        // Test sequence: change color -> difficulty -> weather
        setTimeout(() => {
            console.log('🎨 Testing color change...');
            window.ldManager.setDinoColor('blue');
        }, 1000);
        
        setTimeout(() => {
            console.log('⚡ Testing difficulty change...');
            window.ldManager.setDifficulty('hard');
        }, 3000);
        
        setTimeout(() => {
            console.log('🌤️ Testing weather change...');
            window.ldManager.setWeather('winter');
        }, 5000);
        
        setTimeout(() => {
            console.log('🚧 Testing obstacle type change...');
            window.ldManager.setObstacleType('classic');
        }, 7000);
        
        setTimeout(() => {
            console.log('🔄 Resetting to defaults...');
            window.ldManager.setDinoColor('green');
            window.ldManager.setDifficulty('medium');
            window.ldManager.setWeather('spring');
            window.ldManager.setObstacleType('logos');
        }, 9000);
        
        console.log('🎮 Real-time flag test sequence started! Watch the game change...');
    }
    
    // Debug method to check LaunchDarkly logo loading status
    checkLogoStatus() {
        if (window.Obstacle) {
            console.log('🖼️ LaunchDarkly Logo Status:');
            console.log('  - Load attempted:', window.Obstacle.logoLoadAttempted);
            console.log('  - Image object exists:', !!window.Obstacle.logoImage);
            console.log('  - Image loaded:', window.Obstacle.logoImageLoaded);
            console.log('  - Image error:', window.Obstacle.logoImageError);
            if (window.Obstacle.logoImage) {
                console.log('  - Image src:', window.Obstacle.logoImage.src);
                console.log('  - Image natural dimensions:', `${window.Obstacle.logoImage.naturalWidth}x${window.Obstacle.logoImage.naturalHeight}`);
                console.log('  - Image current dimensions:', `${window.Obstacle.logoImage.width}x${window.Obstacle.logoImage.height}`);
                console.log('  - Image complete:', window.Obstacle.logoImage.complete);
            }
        } else {
            console.log('❌ Obstacle class not found - game may not be initialized');
        }
    }
    
    // Force retry loading the LaunchDarkly logo
    retryLogoLoad() {
        if (window.Obstacle) {
            console.log('🔄 Retrying LaunchDarkly logo load...');
            
            // Reset the loading state
            window.Obstacle.logoLoadAttempted = false;
            window.Obstacle.logoImageLoaded = false;
            window.Obstacle.logoImageError = false;
            window.Obstacle.logoImage = null;
            
            // Try loading again
            window.Obstacle.preloadLogoImage();
        } else {
            console.log('❌ Obstacle class not found');
        }
    }
    
    // Test if we can access the local image file directly
    async testImageUrl() {
        const imageUrl = './launchdarkly.png';
        console.log('🌐 Testing local PNG file accessibility:', imageUrl);
        
        try {
            // Test with fetch
            const response = await fetch(imageUrl, { mode: 'no-cors' });
            console.log('📡 Fetch response status:', response.status || 'no-cors mode');
            
            // Test with direct image load
            const testImg = new Image();
            testImg.crossOrigin = 'anonymous';
            
            testImg.onload = () => {
                console.log('✅ Direct image load successful');
                console.log('📐 Image dimensions:', `${testImg.naturalWidth}x${testImg.naturalHeight}`);
            };
            
            testImg.onerror = (error) => {
                console.error('❌ Direct image load failed:', error);
            };
            
            testImg.src = imageUrl;
            
        } catch (error) {
            console.error('❌ Image URL test failed:', error);
        }
    }
    
    // Force spawn a LaunchDarkly logo obstacle for testing
    testLogoObstacles() {
        if (!this.game?.isRunning) {
            console.log('⚠️ Start the game first to test logo obstacles');
            return;
        }
        
        console.log('🚧 Spawning test LaunchDarkly logo obstacles...');
        
        // Create both types of obstacles for testing
        setTimeout(() => {
            const lowObstacle = new window.Obstacle();
            lowObstacle.type = 'low';
            lowObstacle.logoCount = 1;
            lowObstacle.y = 100; // Updated for new canvas height
            lowObstacle.height = 30;
            this.game.obstacles.push(lowObstacle);
            console.log('✅ Low LaunchDarkly logo obstacle added');
        }, 1000);
        
        setTimeout(() => {
            const highObstacle = new window.Obstacle();
            highObstacle.type = 'high';
            highObstacle.logoCount = 2;
            highObstacle.y = 70; // Updated for new canvas height
            highObstacle.height = 60;
            this.game.obstacles.push(highObstacle);
            console.log('✅ High LaunchDarkly logo obstacle added');
        }, 3000);
        
        console.log('🎮 Logo obstacles will appear in 1 and 3 seconds...');
    }
}

// Note: Initialization is now handled by main.js 