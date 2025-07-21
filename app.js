// Main Application Entry Point - ES6 Module
import { DinoGame } from './gameEngine.js';
import { ldManager } from './launchDarklyConfig.js';
import { userDetection } from './userDetection.js';

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
            
            // Initialize LaunchDarkly following best practices
            console.log('🚀 Initializing LaunchDarkly...');
            try {
                await window.ldManager.initialize();
                console.log('✅ LaunchDarkly initialization completed');
            } catch (ldError) {
                console.warn('⚠️ LaunchDarkly initialization failed, continuing with defaults:', ldError);
                // Continue with the game - fallback values will be used
            }
            
            // Create game instance
            console.log('🎮 Creating game instance...');
            this.game = new DinoGame('gameCanvas');
            
            // Preload LaunchDarkly logo image
            console.log('🖼️ Preloading LaunchDarkly logo...');
            if (window.Obstacle) {
                window.Obstacle.preloadLogoImage();
            }
            
            // Connect feature flags to game
            console.log('🔗 Connecting feature flags to game...');
            this.connectFeatureFlags();
            
            // Set up flag change listeners for real-time updates
            console.log('👂 Setting up flag change listeners...');
            window.ldManager.onChange((flags) => {
                console.log('🔄 Flag change detected:', flags);
                this.onFlagsChanged(flags);
            });
            
            // Initialize user detection
            console.log('👤 Setting up user detection...');
            this.setupUserDetection();
            
            // Setup keyboard shortcuts for debugging
            this.setupKeyboardShortcuts();
            
            this.isInitialized = true;
            console.log('✅ Dino Run App initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            console.error('Stack trace:', error.stack);
            
            // Initialize game with default settings even if something fails
            console.log('🔄 Falling back to basic game initialization...');
            if (!this.game) {
                this.game = new DinoGame('gameCanvas');
            }
            this.isInitialized = true;
        }
    }
    
    setupUserDetection() {
        if (window.userDetection) {
            const playerData = window.userDetection.getPlayerData();
            
            if (playerData) {
                console.log(`👋 Welcome back, ${playerData.name}!`);
                console.log(`📊 You've played ${playerData.sessions} times`);
            } else {
                console.log('🎮 First time playing! Welcome to Dino Run!');
            }
        }
    }
    
    connectFeatureFlags() {
        console.log('🔗 Connecting feature flags to game...');
        
        // Apply initial flag values to the game
        this.applyFlagsToGame();
        
        console.log('✅ Feature flags connected');
    }
    
    onFlagsChanged(flags) {
        console.log('🎯 Flags changed, updating game...', flags);
        
        // Apply flag changes to the running game
        this.applyFlagsToGame();
        
        // Apply real-time updates if game is running
        if (this.game?.isRunning) {
            console.log('⚡ Applying real-time flag updates to running game...');
            this.applyRealTimeUpdates();
        }
    }
    
    applyFlagsToGame() {
        if (!this.game) {
            console.warn('⚠️ Game not available, cannot apply flags');
            return;
        }
        
        // Apply dino color
        this.applyDinoColor();
        
        // Apply difficulty settings
        this.applyDifficulty();
        
        // Apply weather effects
        this.applyWeather();
        
        // Apply obstacle type
        this.applyObstacleType();
        
        // Force game to apply all settings
        if (this.game.applySettings) {
            this.game.applySettings();
        }
    }
    
    applyDinoColor() {
        const color = window.ldManager.getDinoColor();
        const colorHex = window.ldManager.getDinoColorHex(color);
        
        // Update player color if player exists
        if (this.game?.player) {
            this.game.player.color = colorHex;
            console.log(`🎨 Dino color applied: ${color} (${colorHex})`);
        }
        
        // Update UI display
        this.updateColorDisplay(color, colorHex);
    }
    
    applyDifficulty() {
        const difficulty = window.ldManager.getDifficulty();
        const settings = window.ldManager.getDifficultySettings();
        
        // Update game settings
        if (this.game?.updateSettings) {
            this.game.updateSettings(settings);
            console.log(`⚡ Difficulty applied: ${difficulty}`, settings);
        }
        
        // Update player jump height if game is running
        if (this.game?.player && this.game.isRunning) {
            this.game.player.jumpHeight = settings.jumpHeight;
        }
        
        // Update UI display
        this.updateDifficultyDisplay(difficulty);
    }
    
    applyWeather() {
        const weather = window.ldManager.getWeather();
        
        // Apply weather to game
        if (this.game?.applyWeatherBackground) {
            this.game.applyWeatherBackground();
            console.log(`🌤️ Weather applied: ${weather}`);
        }
        
        // Update UI display
        this.updateWeatherDisplay(weather);
    }
    
    applyObstacleType() {
        const obstacleType = window.ldManager.getObstacleType();
        console.log(`🚧 Obstacle type: ${obstacleType}`);
        
        // The obstacle type is handled automatically by the Obstacle class
        // when it checks window.ldManager.getObstacleType() during rendering
    }
    
    applyRealTimeUpdates() {
        console.log('🔥 Applying real-time updates during gameplay...');
        
        if (!this.game?.isRunning) {
            console.log('🎮 Game not running, skipping real-time updates');
            return;
        }
        
        // Force player color update
        if (this.game.player) {
            const color = window.ldManager.getDinoColor();
            const colorHex = window.ldManager.getDinoColorHex(color);
            this.game.player.color = colorHex;
            console.log(`🎨 Real-time color update: ${color} (${colorHex})`);
        }
        
        // Force difficulty settings update
        const difficultySettings = window.ldManager.getDifficultySettings();
        if (this.game.updateSettings) {
            this.game.updateSettings(difficultySettings);
            console.log('⚡ Real-time difficulty update:', difficultySettings);
        }
        
        // Force weather update
        if (this.game.applyWeatherBackground) {
            this.game.applyWeatherBackground();
            console.log('🌤️ Real-time weather update');
        }
        
        // Show visual feedback
        const color = window.ldManager.getDinoColor();
        const difficulty = window.ldManager.getDifficulty();
        const weather = window.ldManager.getWeather();
        
        this.showGameMessage(`🔄 Updated: ${color.toUpperCase()} dino, ${difficulty.toUpperCase()} difficulty, ${weather.toUpperCase()} weather`);
    }
    
    updateColorDisplay(color, colorHex) {
        const element = document.getElementById('dino-color-value');
        if (element) {
            element.textContent = color;
            element.style.color = colorHex;
        }
    }
    
    updateDifficultyDisplay(difficulty) {
        const element = document.getElementById('difficulty-value');
        if (element) {
            element.textContent = difficulty;
        }
    }
    
    updateWeatherDisplay(weather) {
        const element = document.getElementById('weather-value');
        if (element) {
            element.textContent = weather;
        }
    }
    
    showGameMessage(message) {
        // Show temporary message overlay during gameplay
        if (!this.game?.isRunning) return;
        
        // Create or update message element
        let messageEl = document.getElementById('game-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'game-message';
            messageEl.style.cssText = `
                position: absolute;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 1000;
                font-size: 14px;
                pointer-events: none;
            `;
            document.body.appendChild(messageEl);
        }
        
        messageEl.textContent = message;
        messageEl.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            if (messageEl) {
                messageEl.style.display = 'none';
            }
        }, 3000);
        
        console.log('📢 Game message shown:', message);
    }
    
    // Setup keyboard shortcuts for debugging
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Alt + R: Test real-time flag updates
            if (event.altKey && event.key === 'r') {
                event.preventDefault();
                console.log('🎯 Testing real-time flag updates (Alt+R pressed)');
                this.testRealTimeFlags();
            }
            
            // Alt + D: Debug LaunchDarkly status
            if (event.altKey && event.key === 'd') {
                event.preventDefault();
                console.log('🔍 LaunchDarkly debug info (Alt+D pressed)');
                const status = window.ldManager.getStatus();
                console.log('📊 LaunchDarkly Status:', status);
            }
            
            // Alt + F: Force refresh flags
            if (event.altKey && event.key === 'f') {
                event.preventDefault();
                console.log('💫 Force refreshing flags (Alt+F pressed)');
                window.ldManager.refresh();
            }
            
            // Alt + T: Test LaunchDarkly connection
            if (event.altKey && event.key === 't') {
                event.preventDefault();
                console.log('🧪 Testing LaunchDarkly connection (Alt+T pressed)');
                window.ldManager.test();
            }
            
            // Alt + C: Comprehensive LaunchDarkly diagnostic
            if (event.altKey && event.key === 'c') {
                event.preventDefault();
                console.log('🔬 Running comprehensive LaunchDarkly diagnostic (Alt+C pressed)');
                window.ldManager.runComprehensiveDiagnostic();
            }
        });
        
        console.log('⌨️ Keyboard shortcuts set up:');
        console.log('  - Alt+R: Test real-time flag updates');
        console.log('  - Alt+D: Debug LaunchDarkly status');
        console.log('  - Alt+F: Force refresh flags');
        console.log('  - Alt+T: Test LaunchDarkly connection');
        console.log('  - Alt+C: Comprehensive diagnostic');
    }
    
    // Test real-time flag updates (for debugging)
    testRealTimeFlags() {
        console.log('🧪 Testing real-time flag updates...');
        
        if (!window.ldManager.isInitialized) {
            console.error('❌ LaunchDarkly not initialized');
            return false;
        }
        
        if (!this.game?.isRunning) {
            console.log('⚠️ Start the game first to test real-time flag changes');
            console.log('💡 Press SPACE to start the game, then try Alt+R again');
            return false;
        }
        
        console.log('🎯 Current flag values:');
        console.log('  - Dino Color:', window.ldManager.getDinoColor());
        console.log('  - Difficulty:', window.ldManager.getDifficulty());
        console.log('  - Weather:', window.ldManager.getWeather());
        console.log('  - Obstacle Type:', window.ldManager.getObstacleType());
        
        console.log('🎮 Game state:');
        console.log('  - Game running:', this.game.isRunning);
        console.log('  - Player color:', this.game.player?.color);
        
        console.log('💡 To test real-time updates:');
        console.log('  1. Keep the game running');
        console.log('  2. Go to your LaunchDarkly dashboard');
        console.log('  3. Change any flag value (dino-color, difficulty, weather)');
        console.log('  4. The change should apply immediately in the running game');
        console.log('  5. Watch console logs for real-time update messages');
        
        return true;
    }
}

// Make DinoRunApp globally available for backward compatibility
window.DinoRunApp = DinoRunApp;

// ES6 Module export
export { DinoRunApp }; 