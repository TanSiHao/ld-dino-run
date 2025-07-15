// LaunchDarkly Configuration
class LaunchDarklyManager {
    constructor() {
        // Load configuration from config.js
        const config = window.DinoRunConfig || {};
        
        this.clientSideId = config.launchDarkly?.clientSideId || 'YOUR_CLIENT_SIDE_ID_HERE';
        this.projectName = config.launchDarkly?.projectName || 'sihaotan-dino-run';
        this.client = null;
        this.isInitialized = false;
        
        // Default feature flag values (fallbacks)
        this.featureFlags = {
            dinoColor: config.defaults?.dinoColor || 'green',
            difficulty: config.defaults?.difficulty || 'medium',
            weather: config.defaults?.weather || 'spring'
        };
        
        // Feature flag keys from configuration
        this.flagKeys = {
            dinoColor: config.launchDarkly?.flags?.dinoColor || 'dino-color',
            difficulty: config.launchDarkly?.flags?.difficulty || 'game-difficulty', 
            weather: config.launchDarkly?.flags?.weather || 'weather-background'
        };
        
        this.callbacks = [];
    }
    
    async initialize(playerName = null) {
        try {
            // Validate configuration
            const isConfigValid = window.DinoRunConfig?.validate() !== false;
            
            if (!isConfigValid) {
                console.log('🎮 Game will run with default values.');
                console.log('💡 To enable LaunchDarkly features:');
                console.log(window.DinoRunConfig?.getSetupInstructions());
                this.isInitialized = true;
                this.notifyCallbacks();
                return;
            }
            
            // Generate comprehensive user context
            let userContext;
            if (window.userDetection) {
                console.log('🔍 Detecting user environment...');
                userContext = await window.userDetection.generateUserContext(playerName);
                
                // Save player data for future sessions
                if (playerName) {
                    window.userDetection.savePlayerData(userContext);
                }
                
                console.log('👤 User Context:', {
                    name: userContext.name,
                    device: userContext.custom.deviceType,
                    browser: `${userContext.custom.browserName} ${userContext.custom.browserVersion}`,
                    os: userContext.custom.operatingSystem,
                    country: userContext.custom.country,
                    firstSession: userContext.custom.firstSession
                });
            } else {
                // Fallback user context if userDetection is not available
                userContext = {
                    key: 'user-' + Math.random().toString(36).substr(2, 9),
                    name: playerName || 'Game Player',
                    email: playerName ? `${playerName.toLowerCase().replace(/\s+/g, '.')}@dino-run.game` : 'player@example.com',
                    custom: {
                        project: this.projectName,
                        gameVersion: '1.0.0'
                    }
                };
            }
            
            console.log(`🚀 Initializing LaunchDarkly for project: ${this.projectName}`);
            console.log(`👋 Welcome, ${userContext.name}!`);
            
            // Initialize LaunchDarkly client with rich user context
            this.client = LDClient.initialize(this.clientSideId, userContext);
            this.currentUser = userContext;
            
            // Wait for initialization
            await this.client.waitForInitialization();
            this.isInitialized = true;
            
            // Get initial flag values
            await this.updateAllFlags();
            
            // Listen for flag changes
            this.client.on('change', () => {
                this.updateAllFlags();
            });
            
            console.log('✅ LaunchDarkly initialized successfully');
            console.log(`📋 Project: ${this.projectName}`);
            console.log('🎯 Feature flags:', Object.keys(this.flagKeys));
            console.log('📊 User attributes tracked:', Object.keys(userContext.custom || {}));
            this.notifyCallbacks();
            
        } catch (error) {
            console.error('❌ LaunchDarkly initialization failed:', error);
            console.log('🎮 Using default values - game will still work!');
            this.isInitialized = true;
            this.notifyCallbacks();
        }
    }
    
    // Re-initialize with new user context (when name is provided)
    async reinitializeWithUser(playerName) {
        if (this.client) {
            try {
                await this.client.close();
            } catch (e) {
                console.log('Error closing previous client:', e);
            }
        }
        
        this.isInitialized = false;
        await this.initialize(playerName);
    }
    
    // Get current user information
    getCurrentUser() {
        return this.currentUser;
    }
    
    // Update user context (for dynamic changes)
    async updateUserContext(updates) {
        if (!this.client) return;
        
        try {
            const updatedContext = {
                ...this.currentUser,
                ...updates,
                custom: {
                    ...this.currentUser.custom,
                    ...updates.custom
                }
            };
            
            await this.client.identify(updatedContext);
            this.currentUser = updatedContext;
            
            console.log('👤 User context updated:', updates);
        } catch (error) {
            console.error('Error updating user context:', error);
        }
    }
    
    async updateAllFlags() {
        if (!this.client) return;
        
        try {
            // Get dino color flag
            const dinoColor = this.client.variation(this.flagKeys.dinoColor, 'green');
            this.featureFlags.dinoColor = dinoColor;
            
            // Get difficulty flag
            const difficulty = this.client.variation(this.flagKeys.difficulty, 'medium');
            this.featureFlags.difficulty = difficulty;
            
            // Get weather flag
            const weather = this.client.variation(this.flagKeys.weather, 'spring');
            this.featureFlags.weather = weather;
            
            // Update UI
            this.updateFlagDisplay();
            this.notifyCallbacks();
            
        } catch (error) {
            console.error('Error updating flags:', error);
        }
    }
    
    updateFlagDisplay() {
        // Update dino color display
        const dinoColorElement = document.getElementById('dino-color-value');
        if (dinoColorElement) {
            dinoColorElement.textContent = this.featureFlags.dinoColor;
            dinoColorElement.style.color = this.getDinoColorHex(this.featureFlags.dinoColor);
        }
        
        // Update difficulty display
        const difficultyElement = document.getElementById('difficulty-value');
        if (difficultyElement) {
            difficultyElement.textContent = this.featureFlags.difficulty;
        }
        
        // Update weather display
        const weatherElement = document.getElementById('weather-value');
        if (weatherElement) {
            weatherElement.textContent = this.featureFlags.weather;
        }
    }
    
    getDinoColorHex(colorName) {
        const colors = {
            'green': '#2d7d32',
            'blue': '#1976d2',
            'red': '#d32f2f',
            'purple': '#7b1fa2',
            'orange': '#f57c00',
            'pink': '#c2185b'
        };
        return colors[colorName] || '#2d7d32';
    }
    
    getDinoColor() {
        return this.featureFlags.dinoColor;
    }
    
    getDifficulty() {
        return this.featureFlags.difficulty;
    }
    
    getWeather() {
        return this.featureFlags.weather;
    }
    
    getDifficultySettings() {
        const settings = {
            'easy': {
                obstacleSpeed: 3,
                obstacleFrequency: 120,
                jumpHeight: 100
            },
            'medium': {
                obstacleSpeed: 5,
                obstacleFrequency: 100,
                jumpHeight: 90
            },
            'hard': {
                obstacleSpeed: 7,
                obstacleFrequency: 80,
                jumpHeight: 80
            }
        };
        return settings[this.featureFlags.difficulty] || settings['medium'];
    }
    
    getWeatherBackground() {
        const backgrounds = {
            'spring': '#87ceeb',
            'summer': '#ffeb3b',
            'autumn': '#ff9800',
            'winter': '#e3f2fd'
        };
        return backgrounds[this.featureFlags.weather] || backgrounds['spring'];
    }
    
    onFlagsUpdated(callback) {
        this.callbacks.push(callback);
    }
    
    notifyCallbacks() {
        this.callbacks.forEach(callback => callback());
    }
}

// Create global instance
window.ldManager = new LaunchDarklyManager(); 