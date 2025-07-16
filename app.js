// Main Application Entry Point (ES6 Module)
// Note: Dependencies are made available globally by main.js
export class DinoRunApp {
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
    }
    
    onFlagsUpdated() {
        console.log('Feature flags updated');
        this.applyDinoColorFlag();
        this.applyDifficultyFlag();
        this.applyWeatherFlag();
    }
    
    applyDinoColorFlag() {
        // The dino color is automatically applied in the Player.update() method
        // through the ldManager.getDinoColorHex() call
        console.log('Dino color flag applied:', window.ldManager.getDinoColor());
    }
    
    applyDifficultyFlag() {
        if (!this.game) return;
        
        const difficultySettings = window.ldManager.getDifficultySettings();
        this.game.updateSettings(difficultySettings);
        
        console.log('Difficulty flag applied:', window.ldManager.getDifficulty(), difficultySettings);
    }
    
    applyWeatherFlag() {
        if (!this.game) return;
        
        const weather = window.ldManager.getWeather();
        const canvas = this.game.canvas;
        
        // Apply weather-specific styling to the canvas or game area
        this.applyWeatherEffects(weather);
        
        console.log('Weather flag applied:', weather);
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
}

// Note: Initialization is now handled by main.js 